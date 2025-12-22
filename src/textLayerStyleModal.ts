import { Modal, Setting } from "obsidian";
import type { App } from "obsidian";
import type { TextLayer, TextLayerStyle } from "./markerStore";

export interface TextLayerStyleModalResult {
  action: "save" | "cancel";
  layer?: TextLayer;
  applyStyleToAll?: boolean;
}

type TextLayerStyleModalCallback = (result: TextLayerStyleModalResult) => void;

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

  // Note: document.fonts only includes fonts that are actually loaded in the document.
  try {
    const fs = document.fonts;
    if (fs && typeof fs.forEach === "function") {
      fs.forEach((ff) => {
        const fam = String(ff.family ?? "")
          .replace(/["']/g, "")
          .trim();
        if (!fam) return;
        out.add(fam);
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

  const loaded = collectLoadedFontFamilies();
  for (const fam of loaded) {
    // Keep a safe fallback to theme font.
    add(`${fam}, var(--font-text)`, fam);
  }

  return options;
}

export class TextLayerStyleModal extends Modal {
  private original: TextLayer;
  private working: TextLayer;
  private onDone: TextLayerStyleModalCallback;

  private applyToAll = false;

  constructor(app: App, layer: TextLayer, onDone: TextLayerStyleModalCallback) {
    super(app);
    this.original = layer;
    this.working = deepClone(layer);
    this.onDone = onDone;

    this.working.style = this.normalizeStyle(this.working.style);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Text layer settings" });

    new Setting(contentEl).setName("Name").addText((t) => {
      t.setValue(this.working.name ?? "");
      t.onChange((v) => (this.working.name = v.trim() || "Text layer"));
    });

    new Setting(contentEl)
      .setName("Allow angled baselines")
      .setDesc("If enabled: baselines snap horizontal by default; hold ctrl for free angle.")
      .addToggle((tg) => {
        tg.setValue(!!this.working.allowAngledBaselines).onChange((on) => {
          this.working.allowAngledBaselines = on;
        });
      });

    contentEl.createEl("h3", { text: "Font" });

    const fontOptions = buildFontOptions();
    const knownValues = new Set(fontOptions.map((o) => o.value));
    const CUSTOM = "__custom__";

    const currentFamily = this.working.style.fontFamily;
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

        this.working.style.fontFamily = v;
        if (customInputEl) customInputEl.value = v;
        customSetting?.settingEl.toggle(false);
      });
    });

    customSetting = new Setting(contentEl)
      .setName("Custom font-family")
      .setDesc("CSS font-family value, e.g. 'caveat, font-text'.");

    customSetting.addText((t) => {
      t.setPlaceholder("Caveat, var(--font-text)");
      t.setValue(currentFamily);
      customInputEl = t.inputEl;
      t.onChange((v) => {
        this.working.style.fontFamily = v.trim() || "var(--font-text)";
      });
    });

    customSetting.settingEl.toggle(initialSelect === CUSTOM);

    new Setting(contentEl).setName("Font size (px)").addText((t) => {
      t.inputEl.type = "number";
      t.setValue(String(this.working.style.fontSize));
      t.onChange((v) => {
        const n = Number(v);
        if (Number.isFinite(n) && n > 1) this.working.style.fontSize = n;
      });
    });

    const colorRow = new Setting(contentEl).setName("Color");
    let colorTextEl: HTMLInputElement;

    const picker = colorRow.controlEl.createEl("input", {
      attr: { type: "color", style: "margin-left:8px; vertical-align: middle;" },
    });

    colorRow.addText((t) => {
      t.setPlaceholder("#000000");
      t.setValue(this.working.style.color);
      colorTextEl = t.inputEl;

      t.onChange((v) => {
        this.working.style.color = v.trim() || "var(--text-normal)";
        const hex = normalizeHex(this.working.style.color);
        if (/^#([0-9a-f]{6})$/i.test(hex)) picker.value = hex;
      });
    });

    {
      const hex = normalizeHex(this.working.style.color);
      if (/^#([0-9a-f]{6})$/i.test(hex)) picker.value = hex;
    }

    picker.oninput = () => {
      this.working.style.color = picker.value;
      colorTextEl.value = picker.value;
    };

    new Setting(contentEl).setName("Font weight").addText((t) => {
      t.setPlaceholder("400");
      t.setValue(this.working.style.fontWeight ?? "");
      t.onChange((v) => {
        const s = v.trim();
        this.working.style.fontWeight = s || undefined;
      });
    });

    new Setting(contentEl).setName("Italic").addToggle((tg) => {
      tg.setValue(!!this.working.style.italic).onChange((on) => {
        this.working.style.italic = on ? true : undefined;
      });
    });

    new Setting(contentEl).setName("Letter spacing (px)").addText((t) => {
      t.inputEl.type = "number";
      t.setPlaceholder("0");
      t.setValue(
        typeof this.working.style.letterSpacing === "number"
          ? String(this.working.style.letterSpacing)
          : "",
      );
      t.onChange((v) => {
        const s = v.trim();
        if (!s) {
          this.working.style.letterSpacing = undefined;
          return;
        }
        const n = Number(s);
        if (Number.isFinite(n)) this.working.style.letterSpacing = n;
      });
    });

    contentEl.createEl("h3", { text: "Layout" });

    new Setting(contentEl)
      .setName("Line height (px)")
      .setDesc("Height of each input line box. Leave empty to auto-calc from font size.")
      .addText((t) => {
        t.inputEl.type = "number";
        const v = this.working.style.lineHeight;
        t.setPlaceholder("Auto");
        t.setValue(typeof v === "number" ? String(v) : "");
        t.onChange((raw) => {
          const s = raw.trim();
          if (!s) {
            this.working.style.lineHeight = undefined;
            return;
          }
          const n = Number(s);
          if (Number.isFinite(n) && n > 1) this.working.style.lineHeight = n;
        });
      });

    new Setting(contentEl).setName("Padding left (px)").addText((t) => {
      t.inputEl.type = "number";
      t.setPlaceholder("0");
      t.setValue(String(this.working.style.padLeft ?? 0));
      t.onChange((v) => {
        const n = Number(v);
        if (Number.isFinite(n) && n >= 0) this.working.style.padLeft = n;
      });
    });

    new Setting(contentEl).setName("Padding right (px)").addText((t) => {
      t.inputEl.type = "number";
      t.setPlaceholder("0");
      t.setValue(String(this.working.style.padRight ?? 0));
      t.onChange((v) => {
        const n = Number(v);
        if (Number.isFinite(n) && n >= 0) this.working.style.padRight = n;
      });
    });

    new Setting(contentEl)
      .setName("Apply style to all text layers")
      .setDesc("Copies font + layout settings to every text layer on this map.")
      .addToggle((tg) => {
        tg.setValue(this.applyToAll).onChange((on) => {
          this.applyToAll = on;
        });
      });

    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const save = footer.createEl("button", { text: "Save" });
    const cancel = footer.createEl("button", { text: "Cancel" });

    save.onclick = () => {
      this.working.style = this.normalizeStyle(this.working.style);

      this.original.name = this.working.name;
      this.original.allowAngledBaselines = !!this.working.allowAngledBaselines;
      this.original.style = this.working.style;

      this.close();
      this.onDone({
        action: "save",
        layer: this.original,
        applyStyleToAll: this.applyToAll,
      });
    };

    cancel.onclick = () => {
      this.close();
      this.onDone({ action: "cancel" });
    };
  }

  onClose(): void {
    this.contentEl.empty();
  }

  private normalizeStyle(style: TextLayerStyle): TextLayerStyle {
    const s: TextLayerStyle = { ...(style ?? ({} as TextLayerStyle)) };

    s.fontFamily = (s.fontFamily ?? "").trim() || "var(--font-text)";
    s.color = (s.color ?? "").trim() || "var(--text-normal)";

    if (!Number.isFinite(s.fontSize) || s.fontSize <= 1) s.fontSize = 14;

    if (typeof s.lineHeight === "number") {
      if (!Number.isFinite(s.lineHeight) || s.lineHeight <= 1) {
        delete s.lineHeight;
      }
    } else {
      delete s.lineHeight;
    }

    if (typeof s.padLeft !== "number" || !Number.isFinite(s.padLeft) || s.padLeft < 0) s.padLeft = 0;
    if (typeof s.padRight !== "number" || !Number.isFinite(s.padRight) || s.padRight < 0) s.padRight = 0;

    if (typeof s.italic !== "boolean") delete s.italic;

    if (typeof s.letterSpacing === "number" && !Number.isFinite(s.letterSpacing)) {
      delete s.letterSpacing;
    }

    if (s.fontWeight != null) {
      const fw = String(s.fontWeight).trim();
      s.fontWeight = fw.length ? fw : undefined;
    }

    return s;
  }
}