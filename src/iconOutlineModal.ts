import { Modal, Notice, Setting, TFile } from "obsidian";
import type { App } from "obsidian";
import type ZoomMapPlugin from "./main";
import type { IconProfile } from "./map";

export class IconOutlineModal extends Modal {
  private plugin: ZoomMapPlugin;
  private icon: IconProfile;
  private svgSource: string | null = null;

  private colorText!: HTMLInputElement;
  private colorPicker!: HTMLInputElement;
  private widthInput!: HTMLInputElement;
  private opacityInput!: HTMLInputElement;
  
  private onApplied?: (dataUrl: string) => void;
  
  // Base options
  private baseEnabled = false;
  private baseKind = "icon" as const;
  private baseIconKey: string = "";
  private baseScalePct = 130;
  private baseFill = "#ffffff";
  private baseStroke = "#000000";
  private baseStrokeWidth = 0;
  private baseStrokeOpacity = 1;
  private innerOffsetYPx = 0;
  private innerOffsetXPx = 0;

  private outlineColor = "#000000";
  private outlineWidth = 2;
  private outlineOpacity = 1;
  
  private shadowEnabled = false;
  private shadowColor = "#000000";
  private shadowBlurPx = 6;
  private shadowOffsetXPx = 2;
  private shadowOffsetYPx = 2;

  constructor(
    app: App,
    plugin: ZoomMapPlugin,
    icon: IconProfile,
    onApplied?: (dataUrl: string) => void,
  ) {
    super(app);
    this.plugin = plugin;
    this.icon = icon;
    this.onApplied = onApplied;
  }
  
  private isSvgIconProfile(i: IconProfile): boolean {
    const src = (i.pathOrDataUrl ?? "").toLowerCase();
    return src.startsWith("data:image/svg+xml") || src.endsWith(".svg");
  }

  private async loadSvgFromIconKey(iconKey: string): Promise<string | null> {
    const ico =
      (this.plugin.settings.icons ?? []).find((i) => i.key === iconKey) ??
      null;
    if (!ico) return null;

    const src = ico.pathOrDataUrl ?? "";
    if (!src || typeof src !== "string") return null;

    if (src.startsWith("data:image/svg+xml")) {
      const idx = src.indexOf(",");
      if (idx < 0) return null;
      try {
        return decodeURIComponent(src.slice(idx + 1));
      } catch {
        return null;
      }
    }

    if (src.toLowerCase().endsWith(".svg")) {
      const af = this.app.vault.getAbstractFileByPath(src);
      if (af instanceof TFile) {
        try {
          return await this.app.vault.read(af);
        } catch {
          return null;
        }
      }
    }

    return null;
  }

  private parseSvgRoot(svg: string): SVGSVGElement | null {
    try {
      const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
      const svgEl = doc.querySelector("svg");
      return svgEl as unknown as SVGSVGElement | null;
    } catch {
      return null;
    }
  }

  private extractViewBox(svg: string): { minX: number; minY: number; w: number; h: number } | null {
    const svgEl = this.parseSvgRoot(svg);
    if (!svgEl) return null;
    const vb = (svgEl.getAttribute("viewBox") ?? "").trim();
    const parts = vb.split(/[\s,]+/).map((x) => Number(x));
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
      return { minX: parts[0], minY: parts[1], w: parts[2], h: parts[3] };
    }
    return null;
  }

  private stripOuterSvg(svg: string): { inner: string; viewBox?: string } | null {
    const svgEl = this.parseSvgRoot(svg);
    if (!svgEl) return null;
    const vb = (svgEl.getAttribute("viewBox") ?? "").trim();
    const inner = svgEl.innerHTML ?? "";
    return { inner, viewBox: vb || undefined };
  }
  
  private readPersistedMeta(svg: string): void {
    try {
      const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
      const root = doc.querySelector("svg");
      if (!root) return;

      const getNum = (k: string): number | null => {
        const v = root.getAttribute(k);
        if (v == null) return null;
        const n = Number(String(v).replace(",", "."));
        return Number.isFinite(n) ? n : null;
      };
      const getStr = (k: string): string | null => {
        const v = root.getAttribute(k);
        return typeof v === "string" && v.trim().length ? v.trim() : null;
      };

      // Base
      const baseIcon = getStr("data-zm-base-icon");
      if (baseIcon) {
        this.baseEnabled = true;
        this.baseIconKey = baseIcon;
      }
      const baseScale = getNum("data-zm-base-scale");
      if (baseScale != null && baseScale >= 10 && baseScale <= 1000) this.baseScalePct = Math.round(baseScale);

      const baseFill = getStr("data-zm-base-fill");
      if (baseFill) this.baseFill = baseFill;
      const baseStroke = getStr("data-zm-base-stroke");
      if (baseStroke) this.baseStroke = baseStroke;

      const baseSw = getNum("data-zm-base-sw");
      if (baseSw != null && baseSw >= 0) this.baseStrokeWidth = baseSw;
      const baseSo = getNum("data-zm-base-so");
      if (baseSo != null) this.baseStrokeOpacity = Math.min(1, Math.max(0, baseSo));

      // Icon offset
      const dx = getNum("data-zm-inner-dx");
      if (dx != null) this.innerOffsetXPx = Math.max(-500, Math.min(500, dx));
      const dy = getNum("data-zm-inner-dy");
      if (dy != null) this.innerOffsetYPx = Math.max(-500, Math.min(500, dy));

      // Outline (icon outline, not base stroke)
      const oc = getStr("data-zm-outline-color");
      if (oc) this.outlineColor = oc;
      const ow = getNum("data-zm-outline-width");
      if (ow != null && ow >= 0) this.outlineWidth = ow;
      const oo = getNum("data-zm-outline-opacity");
      if (oo != null) this.outlineOpacity = Math.min(1, Math.max(0, oo));

      // If attributes were not present (older icons), fallback to reading #zm-outline
      if (!oc && ow == null && oo == null) {
        const ol = root.querySelector("#zm-outline");
		if (ol instanceof SVGElement) {
          const sc = (ol.getAttribute("stroke") ?? "").trim();
          if (sc) this.outlineColor = sc;
          const sw = Number(String(ol.getAttribute("stroke-width") ?? "").replace(",", "."));
          if (Number.isFinite(sw) && sw >= 0) this.outlineWidth = sw;
          const so = Number(String(ol.getAttribute("stroke-opacity") ?? "").replace(",", "."));
          if (Number.isFinite(so)) this.outlineOpacity = Math.min(1, Math.max(0, so));
        }
      }
    } catch {
      // ignore
    }
  }

  private writePersistedMeta(svg: string): string {
    try {
      const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
      const root = doc.querySelector("svg");
      if (!root) return svg;

      // Outline
      root.setAttribute("data-zm-outline-color", this.outlineColor);
      root.setAttribute("data-zm-outline-width", String(this.outlineWidth));
      root.setAttribute("data-zm-outline-opacity", String(this.outlineOpacity));

      // Base (only if enabled)
      if (this.baseEnabled) {
        root.setAttribute("data-zm-base-icon", (this.baseIconKey ?? "").trim());
        root.setAttribute("data-zm-base-scale", String(this.baseScalePct));
        root.setAttribute("data-zm-base-fill", this.baseFill);
        root.setAttribute("data-zm-base-stroke", this.baseStroke);
        root.setAttribute("data-zm-base-sw", String(this.baseStrokeWidth));
        root.setAttribute("data-zm-base-so", String(this.baseStrokeOpacity));
      } else {
        root.removeAttribute("data-zm-base-icon");
        root.removeAttribute("data-zm-base-scale");
        root.removeAttribute("data-zm-base-fill");
        root.removeAttribute("data-zm-base-stroke");
        root.removeAttribute("data-zm-base-sw");
        root.removeAttribute("data-zm-base-so");
      }

      // Offsets
      root.setAttribute("data-zm-inner-dx", String(this.innerOffsetXPx ?? 0));
      root.setAttribute("data-zm-inner-dy", String(this.innerOffsetYPx ?? 0));

      return new XMLSerializer().serializeToString(root);
    } catch {
      return svg;
    }
  }

  onOpen(): void {
    void this.renderAsync();
  }

  onClose(): void {
    this.contentEl.empty();
    this.svgSource = null;
  }
  
  private parseViewBoxString(vb: string): { minX: number; minY: number; w: number; h: number } | null {
    const parts = (vb ?? "").trim().split(/[\s,]+/).map((x) => Number(x));
    if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return null;
    const [minX, minY, w, h] = parts;
    if (w <= 0 || h <= 0) return null;
    return { minX, minY, w, h };
  }

  private getOrigViewBox(svgEl: SVGElement): { minX: number; minY: number; w: number; h: number } | null {
    const orig = svgEl.getAttribute("data-zm-orig-viewbox") ?? svgEl.getAttribute("viewBox") ?? "";
    return this.parseViewBoxString(orig);
  }

  private applyViewBoxPaddingAbsolute(svg: string, pad: number): string {
    try {
      const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
      const svgEl = doc.querySelector("svg");
      if (!svgEl) return svg;

      const origStr = svgEl.getAttribute("data-zm-orig-viewbox") ?? svgEl.getAttribute("viewBox") ?? "";
      const orig = this.parseViewBoxString(origStr);
      if (!orig) return svg;

      // store original once
      if (!svgEl.getAttribute("data-zm-orig-viewbox")) {
        svgEl.setAttribute("data-zm-orig-viewbox", `${orig.minX} ${orig.minY} ${orig.w} ${orig.h}`);
      }

      const p = Math.max(0, Number(pad) || 0);
      const minX = orig.minX - p;
      const minY = orig.minY - p;
      const w = orig.w + 2 * p;
      const h = orig.h + 2 * p;
      svgEl.setAttribute("viewBox", `${minX} ${minY} ${w} ${h}`);

      return new XMLSerializer().serializeToString(svgEl);
    } catch {
      return svg;
    }
  }

  private async renderAsync(): Promise<void> {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "SVG outline" });

    const svg = await this.loadSvgSource();
    if (!svg) {
      contentEl.createEl("div", {
        text: "This icon is not an SVG or could not be loaded.",
      });
      return;
    }

    this.svgSource = svg;

    // If a base already exists in this icon, keep base enabled
    this.baseEnabled = /id="zm-base"/i.test(svg);

    // Defaults (will be overridden by persisted meta when present)
    this.baseKind = "icon";
    this.baseIconKey = this.baseIconKey || "";
    this.baseScalePct = 130;
    this.baseFill = "#ffffff";
    this.baseStroke = "#000000";
    this.baseStrokeWidth = 0;
    this.baseStrokeOpacity = 1;
    this.innerOffsetYPx = 0;
    this.innerOffsetXPx = 0;
    this.outlineColor = "#000000";
    this.outlineWidth = 2;
    this.shadowEnabled = !!this.icon.shadowEnabled;
    this.shadowColor = (this.icon.shadowColor ?? "#000000").trim() || "#000000";
    this.shadowBlurPx =
      typeof this.icon.shadowBlurPx === "number" && Number.isFinite(this.icon.shadowBlurPx) ? this.icon.shadowBlurPx : 6;
    this.shadowOffsetXPx =
      typeof this.icon.shadowOffsetXPx === "number" && Number.isFinite(this.icon.shadowOffsetXPx) ? this.icon.shadowOffsetXPx : 2;
    this.shadowOffsetYPx =
      typeof this.icon.shadowOffsetYPx === "number" && Number.isFinite(this.icon.shadowOffsetYPx) ? this.icon.shadowOffsetYPx : 2;
    this.outlineOpacity = 1;

    this.readPersistedMeta(svg);

    const strokeMatch = /stroke="([^"]+)"/i.exec(svg);
    const widthMatch = /stroke-width="([^"]+)"/i.exec(svg);
    const opacityMatch = /stroke-opacity="([^"]+)"/i.exec(svg);

    let defaultColor = this.outlineColor || strokeMatch?.[1] || "#000000";
    if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(defaultColor)) {
      defaultColor = "#000000";
    }

    let defaultWidth = this.outlineWidth;
    if (!Number.isFinite(defaultWidth)) {
      defaultWidth = Number(widthMatch?.[1]?.replace(",", ".") ?? "2");
    }
    if (!Number.isFinite(defaultWidth) || defaultWidth < 0) defaultWidth = 2;

    let defaultOpacity = this.outlineOpacity;
    if (!Number.isFinite(defaultOpacity)) {
      defaultOpacity = Number(opacityMatch?.[1]?.replace(",", ".") ?? "1");
      if (!Number.isFinite(defaultOpacity)) defaultOpacity = 1;
      if (defaultOpacity > 1.001) defaultOpacity = defaultOpacity / 100;
      defaultOpacity = Math.min(1, Math.max(0, defaultOpacity));
    }

    // Color setting
    const colorSetting = new Setting(contentEl).setName("Outline color");
    this.colorText = colorSetting.controlEl.createEl("input", {
      type: "text",
    });
    this.colorText.classList.add("zoommap-drawing-editor__color-text");
    this.colorText.value = defaultColor;
	this.outlineColor = defaultColor;

    this.colorPicker = colorSetting.controlEl.createEl("input", {
      type: "color",
    });
    this.colorPicker.classList.add("zoommap-drawing-editor__color-picker");
    this.colorPicker.value = this.normalizeHex(defaultColor);

    this.colorText.oninput = () => {
      const val = this.colorText.value.trim();
      if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) {
        this.colorPicker.value = this.normalizeHex(val);
      }
	  this.outlineColor = val || "#000000";
    };
    this.colorPicker.oninput = () => {
      const hex = this.colorPicker.value;
      this.colorText.value = hex;
	  this.outlineColor = hex;
    };

    // Width
    const widthSetting = new Setting(contentEl).setName("Stroke width");
    this.widthInput = widthSetting.controlEl.createEl("input", {
      type: "number",
    });
    this.widthInput.classList.add("zoommap-drawing-editor__num-input");
    this.widthInput.min = "0";
    this.widthInput.step = "0.5";
    this.widthInput.value = String(defaultWidth);
	this.outlineWidth = defaultWidth;

    // Opacity (percent)
    const opacitySetting = new Setting(contentEl).setName("Opacity (%)");
    this.opacityInput = opacitySetting.controlEl.createEl("input", {
      type: "number",
    });
    this.opacityInput.classList.add("zoommap-drawing-editor__num-input");
    this.opacityInput.min = "0";
    this.opacityInput.max = "100";
    this.opacityInput.step = "5";
    this.opacityInput.value = String(Math.round(defaultOpacity * 100));
	this.outlineOpacity = defaultOpacity;
	
    // --- Base UI ---
    contentEl.createEl("h3", { text: "SVG base (background)" });

    let kindSetting: Setting | null = null;
    let scaleSetting: Setting | null = null;
    let fillSetting: Setting | null = null;
    let strokeSetting: Setting | null = null;
	let innerOffsetSetting: Setting | null = null;
	let innerOffsetXSetting: Setting | null = null;

    new Setting(contentEl)
      .setName("Add base")
      .setDesc("Adds a background shape under the icon (separate color, optional outline).")
      .addToggle((tg) => {
        tg.setValue(this.baseEnabled).onChange((on) => {
          this.baseEnabled = on;
          kindSetting?.settingEl.toggle(on);
          scaleSetting?.settingEl.toggle(on);
          fillSetting?.settingEl.toggle(on);
          strokeSetting?.settingEl.toggle(on);
		  innerOffsetSetting?.settingEl.toggle(on);
		  innerOffsetXSetting?.settingEl.toggle(on);
        });
      });

	kindSetting = new Setting(contentEl)
	  .setName("Base shape")
	  .setDesc("Use existing SVG icon as the base.")
	  .addDropdown((d) => {
		const svgIcons = (this.plugin.settings.icons ?? [])
		  .filter((i) => this.isSvgIconProfile(i))
		  .slice()
		  .sort((a, b) => String(a.key ?? "").localeCompare(String(b.key ?? ""), undefined, { sensitivity: "base", numeric: true }));

		for (const ico of svgIcons) {
		  d.addOption(`icon:${ico.key}`, ico.key);
		}

		const fallback = svgIcons[0]?.key ?? "";
		const curKey = (this.baseIconKey || fallback).trim();
		this.baseIconKey = curKey;
		d.setValue(curKey ? `icon:${curKey}` : "");

		// *** FIXED: add onChange handler ***
		d.onChange((v) => {
		  if (v.startsWith("icon:")) this.baseIconKey = v.slice("icon:".length);
		});
	  });

    scaleSetting = new Setting(contentEl)
      .setName("Base scale (%)")
      .addText((t) => {
        t.inputEl.type = "number";
        t.setValue(String(this.baseScalePct));
        t.onChange((v) => {
          const n = Number(String(v).replace(",", "."));
          if (Number.isFinite(n) && n >= 50 && n <= 400) this.baseScalePct = Math.round(n);
        });
      });

    fillSetting = new Setting(contentEl).setName("Base fill");
    {
      const txt = fillSetting.controlEl.createEl("input", { type: "text" });
      txt.classList.add("zoommap-drawing-editor__color-text");
      txt.value = this.baseFill;

      const pick = fillSetting.controlEl.createEl("input", { type: "color" });
      pick.classList.add("zoommap-drawing-editor__color-picker");
      pick.value = this.normalizeHex(this.baseFill);

      txt.oninput = () => {
        const val = txt.value.trim() || "#ffffff";
        this.baseFill = val;
        if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) pick.value = this.normalizeHex(val);
      };
      pick.oninput = () => {
        this.baseFill = pick.value;
        txt.value = pick.value;
      };
    }

    strokeSetting = new Setting(contentEl).setName("Base outline");
    {
      const strokeTxt = strokeSetting.controlEl.createEl("input", { type: "text" });
      strokeTxt.classList.add("zoommap-drawing-editor__color-text");
      strokeTxt.value = this.baseStroke;

      const strokePick = strokeSetting.controlEl.createEl("input", { type: "color" });
      strokePick.classList.add("zoommap-drawing-editor__color-picker");
      strokePick.value = this.normalizeHex(this.baseStroke);

      const w = strokeSetting.controlEl.createEl("input", { type: "number" });
      w.classList.add("zoommap-drawing-editor__num-input");
	  w.min = "0";
      w.value = String(this.baseStrokeWidth);
      w.title = "Stroke width";

      const op = strokeSetting.controlEl.createEl("input", { type: "number" });
      op.classList.add("zoommap-drawing-editor__num-input");
      op.value = String(Math.round(this.baseStrokeOpacity * 100));
      op.title = "Opacity (%)";

      strokeTxt.oninput = () => {
        const val = strokeTxt.value.trim() || "#000000";
        this.baseStroke = val;
        if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) strokePick.value = this.normalizeHex(val);
      };
      strokePick.oninput = () => {
        this.baseStroke = strokePick.value;
        strokeTxt.value = strokePick.value;
      };
      w.oninput = () => {
        const n = Number(String(w.value).replace(",", "."));
        if (Number.isFinite(n) && n >= 0) this.baseStrokeWidth = n;
      };
      op.oninput = () => {
        const n = Number(String(op.value).replace(",", "."));
        if (!Number.isFinite(n)) return;
        const clamped = Math.min(100, Math.max(0, n));
        this.baseStrokeOpacity = clamped / 100;
      };
    }
	
    innerOffsetXSetting = new Setting(contentEl)
      .setName("Icon offset X (px)")
      .setDesc("Moves the actual icon relative to the base. Negative = left, positive = right.")
      .addText((t) => {
        t.inputEl.type = "number";
        t.setPlaceholder("0");
        t.setValue(String(this.innerOffsetXPx ?? 0));
        t.onChange((v) => {
          const n = Number(String(v).replace(",", "."));
          if (!Number.isFinite(n)) return;
          this.innerOffsetXPx = Math.max(-500, Math.min(500, n));
        });
      });
	
    innerOffsetSetting = new Setting(contentEl)
      .setName("Icon offset y (px)")
      .setDesc("Moves the actual icon relative to the base. Negative = up, positive = down.")
      .addText((t) => {
        t.inputEl.type = "number";
        t.setPlaceholder("0");
        t.setValue(String(this.innerOffsetYPx ?? 0));
        t.onChange((v) => {
          const n = Number(String(v).replace(",", "."));
          if (!Number.isFinite(n)) return;
          this.innerOffsetYPx = Math.max(-500, Math.min(500, n));
        });
      });

    kindSetting.settingEl.toggle(this.baseEnabled);
    scaleSetting.settingEl.toggle(this.baseEnabled);
    fillSetting.settingEl.toggle(this.baseEnabled);
	
    contentEl.createEl("h3", { text: "Shadow" });

    let shadowColorSetting: Setting | null = null;
    let shadowBlurSetting: Setting | null = null;
    let shadowOffsetXSetting: Setting | null = null;
    let shadowOffsetYSetting: Setting | null = null;

    const toggleShadowRows = () => {
      const on = !!this.shadowEnabled;
      shadowColorSetting?.settingEl.toggle(on);
      shadowBlurSetting?.settingEl.toggle(on);
      shadowOffsetXSetting?.settingEl.toggle(on);
      shadowOffsetYSetting?.settingEl.toggle(on);
    };

    new Setting(contentEl)
      .setName("Enable shadow")
      .addToggle((tg) => {
        tg.setValue(this.shadowEnabled).onChange((on) => {
          this.shadowEnabled = on;
          toggleShadowRows();
        });
      });

    shadowColorSetting = new Setting(contentEl).setName("Shadow color");
    {
      const txt = shadowColorSetting.controlEl.createEl("input", { type: "text" });
      txt.classList.add("zoommap-drawing-editor__color-text");
      txt.value = this.shadowColor;

      const pick = shadowColorSetting.controlEl.createEl("input", { type: "color" });
      pick.classList.add("zoommap-drawing-editor__color-picker");
      pick.value = this.normalizeHex(this.shadowColor);

      txt.oninput = () => {
        const val = txt.value.trim() || "#000000";
        this.shadowColor = val;
        if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) pick.value = this.normalizeHex(val);
      };
      pick.oninput = () => {
        this.shadowColor = pick.value;
        txt.value = pick.value;
      };
    }

    shadowBlurSetting = new Setting(contentEl)
      .setName("Shadow blur (px)")
      .addText((t) => {
        t.inputEl.type = "number";
        t.setValue(String(this.shadowBlurPx));
        t.onChange((v) => {
          const n = Number(String(v).replace(",", "."));
          if (Number.isFinite(n) && n >= 0) this.shadowBlurPx = n;
        });
      });

    shadowOffsetXSetting = new Setting(contentEl)
      .setName("Shadow offset x (px)")
      .addText((t) => {
        t.inputEl.type = "number";
        t.setValue(String(this.shadowOffsetXPx));
        t.onChange((v) => {
          const n = Number(String(v).replace(",", "."));
          if (Number.isFinite(n)) this.shadowOffsetXPx = n;
        });
      });

    shadowOffsetYSetting = new Setting(contentEl)
      .setName("Shadow offset y (px)")
      .addText((t) => {
        t.inputEl.type = "number";
        t.setValue(String(this.shadowOffsetYPx));
        t.onChange((v) => {
          const n = Number(String(v).replace(",", "."));
          if (Number.isFinite(n)) this.shadowOffsetYPx = n;
        });
      });

    toggleShadowRows();
    strokeSetting.settingEl.toggle(this.baseEnabled);
	innerOffsetSetting.settingEl.toggle(this.baseEnabled);
	innerOffsetXSetting.settingEl.toggle(this.baseEnabled);

    // Footer
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const saveBtn = footer.createEl("button", { text: "Save" });
    const cancelBtn = footer.createEl("button", { text: "Cancel" });

    saveBtn.onclick = () => {
      void this.applyAndSave();
    };
    cancelBtn.onclick = () => this.close();
  }

  private async loadSvgSource(): Promise<string | null> {
    const src = this.icon.pathOrDataUrl;
    if (!src || typeof src !== "string") return null;

    if (src.startsWith("data:image/svg+xml")) {
      const idx = src.indexOf(",");
      if (idx < 0) return null;
      try {
        return decodeURIComponent(src.slice(idx + 1));
      } catch {
        return null;
      }
    }

    if (src.toLowerCase().endsWith(".svg")) {
      const af = this.app.vault.getAbstractFileByPath(src);
      if (af instanceof TFile) {
        return this.app.vault.read(af);
      }
    }

    return null;
  }

  private async applyAndSave(): Promise<void> {
    if (!this.svgSource) {
      new Notice("SVG content not loaded.", 2000);
      return;
    }
	
    if (this.baseEnabled) {
      const k = (this.baseIconKey ?? "").trim();
      const svgIcons = (this.plugin.settings.icons ?? []).filter((i) => this.isSvgIconProfile(i));
      const exists = svgIcons.some((i) => i.key === k);
      if (!k || !exists) {
        new Notice("Please choose a base icon (SVG) from the library.", 3000);
        return;
      }
    }

    const color = this.colorText.value.trim() || "#000000";

    let width = Number(this.widthInput.value.replace(",", "."));
    if (!Number.isFinite(width) || width < 0) width = 2;

    let opacity = Number(this.opacityInput.value.replace(",", "."));
    if (!Number.isFinite(opacity)) opacity = 100;
    if (opacity > 1.001) opacity = opacity / 100;
    opacity = Math.min(1, Math.max(0, opacity));
	
    if (this.shadowEnabled) {
      this.icon.shadowEnabled = true;
      this.icon.shadowColor = (this.shadowColor ?? "").trim() || "#000000";
      this.icon.shadowBlurPx = Math.max(0, Number(this.shadowBlurPx) || 0);
      this.icon.shadowOffsetXPx = Number.isFinite(this.shadowOffsetXPx) ? this.shadowOffsetXPx : 2;
      this.icon.shadowOffsetYPx = Number.isFinite(this.shadowOffsetYPx) ? this.shadowOffsetYPx : 2;
    } else {
      delete this.icon.shadowEnabled;
      delete this.icon.shadowColor;
      delete this.icon.shadowBlurPx;
      delete this.icon.shadowOffsetXPx;
      delete this.icon.shadowOffsetYPx;
    }
	
    this.outlineColor = color;
    this.outlineWidth = width;
    this.outlineOpacity = opacity;

    const updatedSvg = this.applyOutline(
      this.svgSource,
      color,
      width,
      opacity,
    );
    const dataUrl =
      "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(updatedSvg);

    this.icon.pathOrDataUrl = dataUrl;
	await this.plugin.saveSettings();

	if (this.onApplied) {
	  this.onApplied(dataUrl);
	}

	this.close();
  }

  private applyOutline(
    svg: string,
    color: string,
    width: number,
    opacity: number,
  ): string {
    let s = this.removeExistingZmOutline(svg);
	s = this.removeExistingZmBase(s);
    // Expand viewBox enough for BOTH: outline + base scale (avoid clipping)
    const outlinePad = Math.max(0, width) * 2;
    const basePad = this.baseEnabled ? this.computeBasePadFromOrigViewBox(s) : 0;
    const offsetPad = Math.max(Math.abs(this.innerOffsetXPx ?? 0), Math.abs(this.innerOffsetYPx ?? 0));
    const pad = Math.max(outlinePad, basePad, offsetPad);
    s = this.applyViewBoxPaddingAbsolute(s, pad);

    const openMatch = /<svg[^>]*>/i.exec(s);
    const closeIndex = s.lastIndexOf("</svg>");
    if (!openMatch || closeIndex < 0) {
      // Fallback: nothing fancy, return original SVG unchanged.
      return s;
    }

    const openTag = openMatch[0];
    const openEnd = (openMatch.index ?? 0) + openTag.length;

    const inner = s.slice(openEnd, closeIndex);
	
	const baseGroup = this.baseEnabled ? this.buildBaseGroup(s) : "";

    const dx = Number(this.innerOffsetXPx ?? 0);
    const dy = Number(this.innerOffsetYPx ?? 0);
    const hasOffset = (Number.isFinite(dx) && dx !== 0) || (Number.isFinite(dy) && dy !== 0);
    const tr = hasOffset ? ` transform="translate(${dx} ${dy})"` : "";

    const outlineEnabled = Number.isFinite(width) && width > 0 && Number.isFinite(opacity) && opacity > 0;
    let outlineGroup = "";
    if (outlineEnabled) {
      const outlineInner = this.stripFillAndStrokeForOutline(inner);
      outlineGroup =
        `<g id="zm-outline"${tr} fill="none" stroke="${color}" stroke-width="${width}" ` +
        `stroke-opacity="${opacity}" vector-effect="non-scaling-stroke">` +
        outlineInner +
        `</g>`;
    }

	const innerGroup = `<g id="zm-inner"${tr}>${inner}</g>`;

    const newInner = baseGroup + outlineGroup + innerGroup;

    const merged = s.slice(0, openEnd) + newInner + s.slice(closeIndex);
    return this.writePersistedMeta(merged);
  }
  
  private removeExistingZmBase(svg: string): string {
    try {
      const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
      const svgEl = doc.querySelector("svg");
      if (!svgEl) return svg;
      svgEl.querySelector("#zm-base")?.remove();
      return new XMLSerializer().serializeToString(svgEl);
    } catch {
      return svg;
    }
  }

  private computeBasePadFromOrigViewBox(svg: string): number {
    // Use original viewBox (or current) to compute how far the base extends.
    const svgEl = this.parseSvgRoot(svg);
    if (!svgEl) return 0;
    const orig = this.getOrigViewBox(svgEl);
    if (!orig) return 0;

    const baseScale = (this.baseScalePct || 100) / 100;
    const halfMin = Math.min(orig.w, orig.h) / 2;
    const r = halfMin * baseScale;
    const extra = Math.max(0, r - halfMin);
    const strokePad = Math.max(0, this.baseStrokeWidth || 0) * 2;
    return extra + strokePad;
  }

  private buildBaseGroup(svg: string): string {
    const svgEl = this.parseSvgRoot(svg);
    if (!svgEl) return "";

    const orig = this.getOrigViewBox(svgEl);
    if (!orig) return "";
    const minX = orig.minX, minY = orig.minY, w = orig.w, h = orig.h;

    const cx = minX + w / 2;
    const cy = minY + h / 2;
    const halfMin = Math.min(w, h) / 2;
    const r = halfMin * ((this.baseScalePct || 100) / 100);

    const fill = this.baseFill || "#ffffff";
    const stroke = this.baseStroke || "#000000";
    const sw = Math.max(0, Number(this.baseStrokeWidth) || 0);
    const so = Math.min(1, Math.max(0, Number(this.baseStrokeOpacity) || 0));

    if (this.baseKind === "icon" && this.baseIconKey) {
      const ico = (this.plugin.settings.icons ?? []).find((i) => i.key === this.baseIconKey);
      const src = ico?.pathOrDataUrl ?? "";
      if (typeof src === "string" && src.startsWith("data:image/svg+xml")) {
        const idx = src.indexOf(",");
        if (idx >= 0) {
          try {
            const baseSvg = decodeURIComponent(src.slice(idx + 1));
            const stripped = this.stripOuterSvg(baseSvg);
            const vb2 = stripped?.viewBox ?? "0 0 24 24";
            const p2 = vb2.trim().split(/[\s,]+/).map((x) => Number(x));
            if (p2.length === 4 && p2.every((n) => Number.isFinite(n))) {
              const bw = p2[2], bh = p2[3];
              const target = 2 * r;
              const k = target / Math.max(1, Math.max(bw, bh));
              const tx = cx - (bw * k) / 2;
              const ty = cy - (bh * k) / 2;
              const inner = stripped?.inner ?? "";
              return `<g id="zm-base" fill="none">
  <g transform="translate(${tx} ${ty}) scale(${k})"
     fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${so}">
    ${inner}
  </g>
</g>`;
            }
          } catch {
            // ignore
          }
        }
      }
    }

    // No fallback shapes.
    return "";
  }
  
  private removeExistingZmOutline(svg: string): string {
    try {
      const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
      const svgEl = doc.querySelector("svg");
      if (!svgEl) return svg;

      const oldOutline = svgEl.querySelector("#zm-outline");
      oldOutline?.remove();

      const oldInner = svgEl.querySelector("#zm-inner");
      if (oldInner) {
        const frag = doc.createDocumentFragment();
        while (oldInner.firstChild) frag.appendChild(oldInner.firstChild);
        oldInner.replaceWith(frag);
      }

      return new XMLSerializer().serializeToString(svgEl);
    } catch {
      return svg;
    }
  }

  private applyViewBoxPaddingFromOriginal(svg: string, strokeWidth: number): string {
    try {
      const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
      const svgEl = doc.querySelector("svg");
      if (!svgEl) return svg;

      const orig = svgEl.getAttribute("data-zm-orig-viewbox") ?? svgEl.getAttribute("viewBox");
      if (!orig) return svg;

      if (!svgEl.getAttribute("data-zm-orig-viewbox")) {
        svgEl.setAttribute("data-zm-orig-viewbox", orig);
      }

      const parts = orig.trim().split(/[\s,]+/).map((x) => Number(x));
      if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return svg;

      const [minX, minY, w, h] = parts;
      if (w <= 0 || h <= 0) return svg;

      const pad = strokeWidth * 2;
      const newMinX = minX - pad;
      const newMinY = minY - pad;
      const newW = w + pad * 2;
      const newH = h + pad * 2;

      svgEl.setAttribute("viewBox", `${newMinX} ${newMinY} ${newW} ${newH}`);

      return new XMLSerializer().serializeToString(svgEl);
    } catch {
      return svg;
    }
  }
  
  private stripFillAndStrokeForOutline(src: string): string {
    let s = src;

    // Remove explicit fill/stroke attributes from shapes in the outline copy.
    s = s.replace(/fill="[^"]*"/gi, "");
    s = s.replace(/stroke="[^"]*"/gi, "");
    s = s.replace(/stroke-width="[^"]*"/gi, "");
    s = s.replace(/stroke-opacity="[^"]*"/gi, "");

    // Clean style attributes: drop fill/stroke related declarations.
    s = s.replace(/style="([^"]*)"/gi, (_m, style: string) => {
      let st = style;

      st = st.replace(/(?:^|;)\s*fill\s*:[^;]*/gi, "");
      st = st.replace(/(?:^|;)\s*stroke\s*:[^;]*/gi, "");
      st = st.replace(/(?:^|;)\s*stroke-width\s*:[^;]*/gi, "");
      st = st.replace(/(?:^|;)\s*stroke-opacity\s*:[^;]*/gi, "");

      // Normalize leftover style string.
      st = st.replace(/;;+/g, ";").replace(/^;/, "").replace(/;$/, "").trim();
      if (!st) return "";
      return `style="${st}"`;
    });

    return s;
  }

  private normalizeHex(v: string): string {
    if (!v.startsWith("#")) return v;
    if (v.length === 4) {
      const r = v[1];
      const g = v[2];
      const b = v[3];
      return `#${r}${r}${g}${g}${b}${b}`;
    }
    return v;
  }
}