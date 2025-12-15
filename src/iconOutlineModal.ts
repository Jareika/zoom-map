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

  onOpen(): void {
    void this.renderAsync();
  }

  onClose(): void {
    this.contentEl.empty();
    this.svgSource = null;
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

    const strokeMatch = /stroke="([^"]+)"/i.exec(svg);
    const widthMatch = /stroke-width="([^"]+)"/i.exec(svg);
    const opacityMatch = /stroke-opacity="([^"]+)"/i.exec(svg);

    let defaultColor = strokeMatch?.[1] ?? "#000000";
    if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(defaultColor)) {
      defaultColor = "#000000";
    }

    let defaultWidth = Number(widthMatch?.[1]?.replace(",", ".") ?? "2");
    if (!Number.isFinite(defaultWidth) || defaultWidth <= 0) defaultWidth = 2;

    let defaultOpacity = Number(
      opacityMatch?.[1]?.replace(",", ".") ?? "1",
    );
    if (!Number.isFinite(defaultOpacity)) defaultOpacity = 1;
    if (defaultOpacity > 1.001) defaultOpacity = defaultOpacity / 100;
    defaultOpacity = Math.min(1, Math.max(0, defaultOpacity));

    // Color setting
    const colorSetting = new Setting(contentEl).setName("Outline color");
    this.colorText = colorSetting.controlEl.createEl("input", {
      type: "text",
    });
    this.colorText.classList.add("zoommap-drawing-editor__color-text");
    this.colorText.value = defaultColor;

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
    };
    this.colorPicker.oninput = () => {
      const hex = this.colorPicker.value;
      this.colorText.value = hex;
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

    const color = this.colorText.value.trim() || "#000000";

    let width = Number(this.widthInput.value.replace(",", "."));
    if (!Number.isFinite(width) || width <= 0) width = 2;

    let opacity = Number(this.opacityInput.value.replace(",", "."));
    if (!Number.isFinite(opacity)) opacity = 100;
    if (opacity > 1.001) opacity = opacity / 100;
    opacity = Math.min(1, Math.max(0, opacity));

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
    // First enlarge the viewBox so the outline is not clipped.
    let s = this.expandViewBoxForStroke(svg, width);

    const openMatch = /<svg[^>]*>/i.exec(s);
    const closeIndex = s.lastIndexOf("</svg>");
    if (!openMatch || closeIndex < 0) {
      // Fallback: nothing fancy, return original SVG unchanged.
      return s;
    }

    const openTag = openMatch[0];
    const openEnd = (openMatch.index ?? 0) + openTag.length;

    const inner = s.slice(openEnd, closeIndex);

    // Copy of the inner markup for the outline layer – remove fill/stroke attrs.
    const outlineInner = this.stripFillAndStrokeForOutline(inner);

    const outlineGroup =
      `<g id="zm-outline" fill="none" stroke="${color}" stroke-width="${width}" ` +
      `stroke-opacity="${opacity}" vector-effect="non-scaling-stroke">` +
      outlineInner +
      `</g>`;

    const innerGroup = `<g id="zm-inner">${inner}</g>`;

    const newInner = outlineGroup + innerGroup;

    return s.slice(0, openEnd) + newInner + s.slice(closeIndex);
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

  private expandViewBoxForStroke(svg: string, strokeWidth: number): string {
    const m = /viewBox="\s*([0-9.+\-eE]+)\s+([0-9.+\-eE]+)\s+([0-9.+\-eE]+)\s+([0-9.+\-eE]+)\s*"/i.exec(
      svg,
    );
    if (!m) return svg;

    const minX = Number(m[1]);
    const minY = Number(m[2]);
    const width = Number(m[3]);
    const height = Number(m[4]);

    if (
      !Number.isFinite(minX) ||
      !Number.isFinite(minY) ||
      !Number.isFinite(width) ||
      !Number.isFinite(height) ||
      width <= 0 ||
      height <= 0
    ) {
      return svg;
    }

    const pad = strokeWidth * 2;

    const newMinX = minX - pad;
    const newMinY = minY - pad;
    const newWidth = width + pad * 2;
    const newHeight = height + pad * 2;

    const oldAttr = m[0];
    const newAttr = `viewBox="${newMinX} ${newMinY} ${newWidth} ${newHeight}"`;

    return svg.replace(oldAttr, newAttr);
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