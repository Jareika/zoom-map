import { Modal, Setting } from "obsidian";
import type { App } from "obsidian";
import type { TextBox, TextLayerStyle } from "./markerStore";

export type TextBoxConfigModalResult =
  | { action: "save"; box: TextBox }
  | { action: "cancel" };

type DoneCb = (res: TextBoxConfigModalResult) => void;

function deepClone<T>(x: T): T {
  if (typeof structuredClone === "function") return structuredClone(x);
  return JSON.parse(JSON.stringify(x)) as T;
}

function normalizeHex(v: string): string {
  const s = v.trim();
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s)) return s;
  if (s.length === 4) {
    const r = s[1];
    const g = s[2];
    const b = s[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return s;
}

type FontOption = { value: string; label: string };

function collectLoadedFontFamilies(): string[] {
  const out = new Set<string>();
  try {
    const fs = document.fonts;
    if (fs && typeof fs.forEach === "function") {
      fs.forEach((ff) => {
        const fam = String(ff.family ?? "").replace(/["']/g, "").trim();
        if (fam) out.add(fam);
      });
    }
  } catch {
    // ignore
  }
  return [...out].sort((a, b) => a.localeCompare(b));
}

function buildFontOptions(): FontOption[] {
  const options: FontOption[] = [];
  const seen = new Set<string>();
  const add = (value: string, label: string) => {
    if (seen.has(value)) return;
    seen.add(value);
    options.push({ value, label });
  };

  add("var(--font-text)", "Theme text (default)");
  add("var(--font-interface)", "Theme interface");
  add("var(--font-monospace)", "Theme monospace");
  add("system-ui", "System UI");
  add("sans-serif", "Sans-serif");
  add("serif", "Serif");
  add("monospace", "Monospace");
  for (const fam of collectLoadedFontFamilies()) add(`${fam}, var(--font-text)`, fam);
  return options;
}

export class TextBoxConfigModal extends Modal {
  private working: TextBox;
  private onDone: DoneCb;

  constructor(app: App, box: TextBox, onDone: DoneCb) {
    super(app);
    this.working = deepClone(box);
    this.working.style = this.normalizeStyle(this.working.style);
    this.working.autoFlow ??= true;
    this.working.allowAngledBaselines ??= false;
    this.working.locked ??= false;
    if (this.working.mode === "auto") {
      this.working.auto ??= {
        lineGapPx: 18,
        padLeft: 0,
        padRight: 0,
        padTop: 4,
        padBottom: 4,
      };
    }
    this.onDone = onDone;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Text box settings" });

    new Setting(contentEl)
      .setName("Name")
      .addText((t) => {
        t.setValue(this.working.name ?? "");
        t.onChange((v) => {
          this.working.name = v.trim() || this.working.name;
        });
      });
	  
    new Setting(contentEl)
      .setName("Lock text box")
      .setDesc("Prevents editing and moving this box.")
      .addToggle((tg) => {
        tg.setValue(!!this.working.locked).onChange((on) => {
          this.working.locked = on;
        });
      });

    new Setting(contentEl)
      .setName("Auto-flow between baselines")
      .setDesc("If disabled: each baseline keeps its own text.")
      .addToggle((tg) => {
        tg.setValue(this.working.autoFlow !== false).onChange((on) => {
          this.working.autoFlow = on;
        });
      });

    new Setting(contentEl)
      .setName("Allow angled baselines")
      .setDesc("If enabled: baselines snap horizontal by default, hold ctrl for free angle.")
      .addToggle((tg) => {
        tg.setValue(!!this.working.allowAngledBaselines).onChange((on) => {
          this.working.allowAngledBaselines = on;
        });
      });

    new Setting(contentEl)
      .setName("Mode")
      .setDesc(this.working.mode === "auto" ? "Automatic baselines" : "Custom baselines")
      .addText((t) => {
        t.setValue(this.working.mode);
        t.inputEl.disabled = true;
      });
	  
    contentEl.createEl("h3", { text: "Font" });

    const fontOptions = buildFontOptions();
    const knownValues = new Set(fontOptions.map((o) => o.value));
    const CUSTOM = "__custom__";
    const currentFamily = this.working.style?.fontFamily ?? "var(--font-text)";
    const initialSelect = knownValues.has(currentFamily) ? currentFamily : CUSTOM;

    let customSetting: Setting | null = null;
    let customInputEl: HTMLInputElement | null = null;

    new Setting(contentEl).setName("Font family").addDropdown((dd) => {
      for (const opt of fontOptions) dd.addOption(opt.value, opt.label);
      dd.addOption(CUSTOM, "Custom…");
      dd.setValue(initialSelect);
      dd.onChange((v) => {
        if (v === CUSTOM) {
          customSetting?.settingEl.toggle(true);
          return;
        }
        this.working.style!.fontFamily = v;
        if (customInputEl) customInputEl.value = v;
        customSetting?.settingEl.toggle(false);
      });
    });

    customSetting = new Setting(contentEl)
      .setName("Custom font-family")
      .setDesc("CSS font-family value, e.g. Caveat, var(--font-text).");
    customSetting.addText((t) => {
      t.setPlaceholder("Caveat, var(--font-text)");
      t.setValue(currentFamily);
      customInputEl = t.inputEl;
      t.onChange((v) => {
        this.working.style!.fontFamily = v.trim() || "var(--font-text)";
      });
    });
    customSetting.settingEl.toggle(initialSelect === CUSTOM);

    new Setting(contentEl).setName("Font size (px)").addText((t) => {
      t.inputEl.type = "number";
      t.setValue(String(this.working.style?.fontSize ?? 14));
      t.onChange((v) => {
        const n = Number(v);
        if (Number.isFinite(n) && n > 1) this.working.style!.fontSize = n;
      });
    });

    const colorRow = new Setting(contentEl).setName("Color");
    let colorTextEl: HTMLInputElement;
    const picker = colorRow.controlEl.createEl("input", {
      attr: { type: "color", style: "margin-left:8px; vertical-align: middle;" },
    });

    colorRow.addText((t) => {
      t.setPlaceholder("#000000");
      t.setValue(this.working.style?.color ?? "var(--text-normal)");
      colorTextEl = t.inputEl;
      t.onChange((v) => {
        this.working.style!.color = v.trim() || "var(--text-normal)";
        const hex = normalizeHex(this.working.style!.color);
        if (/^#([0-9a-f]{6})$/i.test(hex)) picker.value = hex;
      });
    });

    {
      const hex = normalizeHex(this.working.style?.color ?? "");
      if (/^#([0-9a-f]{6})$/i.test(hex)) picker.value = hex;
    }

    picker.oninput = () => {
      this.working.style!.color = picker.value;
      colorTextEl.value = picker.value;
    };

    new Setting(contentEl).setName("Font weight").addText((t) => {
      t.setPlaceholder("400");
      t.setValue(this.working.style?.fontWeight ?? "");
      t.onChange((v) => {
        const s = v.trim();
        this.working.style!.fontWeight = s || undefined;
      });
    });

    new Setting(contentEl).setName("Italic").addToggle((tg) => {
      tg.setValue(!!this.working.style?.italic).onChange((on) => {
        this.working.style!.italic = on ? true : undefined;
      });
    });

    new Setting(contentEl).setName("Letter spacing (px)").addText((t) => {
      t.inputEl.type = "number";
      const v = this.working.style?.letterSpacing;
      t.setPlaceholder("0");
      t.setValue(typeof v === "number" ? String(v) : "");
      t.onChange((raw) => {
        const s = raw.trim();
        if (!s) {
          this.working.style!.letterSpacing = undefined;
          return;
        }
        const n = Number(s);
        if (Number.isFinite(n)) this.working.style!.letterSpacing = n;
      });
    });

    contentEl.createEl("h3", { text: "Layout" });

    new Setting(contentEl)
      .setName("Line height (px)")
      .setDesc("Height of each input line box. Leave empty to auto-calc from font size.")
      .addText((t) => {
        t.inputEl.type = "number";
        const v = this.working.style?.lineHeight;
        t.setPlaceholder("Auto");
        t.setValue(typeof v === "number" ? String(v) : "");
        t.onChange((raw) => {
          const s = raw.trim();
          if (!s) {
            this.working.style!.lineHeight = undefined;
            return;
          }
          const n = Number(s);
          if (Number.isFinite(n) && n > 1) this.working.style!.lineHeight = n;
        });
      });

    new Setting(contentEl).setName("Text padding left / right (px)")
      .addText((t) => {
        t.inputEl.type = "number";
        t.setPlaceholder("0");
        t.setValue(String(this.working.style?.padLeft ?? 0));
        t.onChange((v) => {
          const n = Number(v);
          if (Number.isFinite(n) && n >= 0) this.working.style!.padLeft = n;
        });
      })
      .addText((t) => {
        t.inputEl.type = "number";
        t.setPlaceholder("0");
        t.setValue(String(this.working.style?.padRight ?? 0));
        t.onChange((v) => {
          const n = Number(v);
          if (Number.isFinite(n) && n >= 0) this.working.style!.padRight = n;
        });
      });

    const canConfigureAuto =
      this.working.mode === "auto" && this.working.sourceDrawingKind !== "polyline";

    if (canConfigureAuto) {
      contentEl.createEl("h3", { text: "Automatic baselines" });

      new Setting(contentEl)
        .setName("Line gap (px)")
        .addText((t) => {
          t.inputEl.type = "number";
          t.setValue(String(this.working.auto?.lineGapPx ?? 18));
          t.onChange((v) => {
            const n = Number(String(v).replace(",", "."));
            if (Number.isFinite(n) && n > 1) this.working.auto!.lineGapPx = n;
          });
        });

      new Setting(contentEl)
        .setName("Box inset left / right (px)")
        .setDesc("Shrinks the usable auto-baseline width inside the text box.")
        .addText((t) => {
          t.inputEl.type = "number";
          t.setValue(String(this.working.auto?.padLeft ?? 0));
          t.onChange((v) => {
            const n = Number(String(v).replace(",", "."));
            if (Number.isFinite(n) && n >= 0) this.working.auto!.padLeft = n;
          });
        })
        .addText((t) => {
          t.inputEl.type = "number";
          t.setValue(String(this.working.auto?.padRight ?? 0));
          t.onChange((v) => {
            const n = Number(String(v).replace(",", "."));
            if (Number.isFinite(n) && n >= 0) this.working.auto!.padRight = n;
          });
        });

      new Setting(contentEl)
        .setName("Box inset top / bottom (px)")
        .setDesc("Shrinks the usable auto-baseline height inside the text box.")
        .addText((t) => {
          t.inputEl.type = "number";
          t.setValue(String(this.working.auto?.padTop ?? 4));
          t.onChange((v) => {
            const n = Number(String(v).replace(",", "."));
            if (Number.isFinite(n) && n >= 0) this.working.auto!.padTop = n;
          });
        })
        .addText((t) => {
          t.inputEl.type = "number";
          t.setValue(String(this.working.auto?.padBottom ?? 4));
          t.onChange((v) => {
            const n = Number(String(v).replace(",", "."));
            if (Number.isFinite(n) && n >= 0) this.working.auto!.padBottom = n;
          });
        });
    }

    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    footer.createEl("button", { text: "Save" }).onclick = () => {
      this.working.style = this.normalizeStyle(this.working.style);
      this.close();
      this.onDone({ action: "save", box: this.working });
    };
    footer.createEl("button", { text: "Cancel" }).onclick = () => {
      this.close();
      this.onDone({ action: "cancel" });
    };
  }

  private defaultStyle(): TextLayerStyle {
    return {
      fontFamily: "var(--font-text)",
      fontSize: 14,
      color: "var(--text-normal)",
      fontWeight: "400",
      baselineOffset: 0,
      padLeft: 0,
      padRight: 0,
    };
  }

  private normalizeStyle(style?: TextLayerStyle): TextLayerStyle {
    const s: TextLayerStyle = { ...this.defaultStyle(), ...(style ?? {}) };
    s.fontFamily = (s.fontFamily ?? "").trim() || "var(--font-text)";
    s.color = (s.color ?? "").trim() || "var(--text-normal)";
    if (!Number.isFinite(s.fontSize) || s.fontSize <= 1) s.fontSize = 14;
    if (typeof s.lineHeight === "number" && (!Number.isFinite(s.lineHeight) || s.lineHeight <= 1)) {
      delete s.lineHeight;
    }
    if (typeof s.padLeft !== "number" || !Number.isFinite(s.padLeft) || s.padLeft < 0) s.padLeft = 0;
    if (typeof s.padRight !== "number" || !Number.isFinite(s.padRight) || s.padRight < 0) s.padRight = 0;
    if (typeof s.italic !== "boolean") delete s.italic;
    if (typeof s.letterSpacing === "number" && !Number.isFinite(s.letterSpacing)) delete s.letterSpacing;
    if (s.fontWeight != null) {
      const fw = String(s.fontWeight).trim();
      s.fontWeight = fw.length ? fw : undefined;
    }
    return s;
  }
}