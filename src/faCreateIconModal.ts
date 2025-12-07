import { Modal, Setting, Notice } from "obsidian";
import type { App, TFile } from "obsidian";
import type ZoomMapPlugin from "./main";
import type { IconProfile } from "./map";

// Callback used when an icon has been created.
/* eslint-disable-next-line no-unused-vars */
type FaIconCreateCallback = (result: IconProfile) => void;

export class FaCreateIconModal extends Modal {
  private plugin: ZoomMapPlugin;
  private file: TFile;
  private onDone: FaIconCreateCallback;

  private keyValue: string;
  private colorValue = "#d23c3c";
  private sizeValue = 24;
  private anchorXValue = 12;
  private anchorYValue = 12;

  private svgSource: string | null = null;
  private previewImg: HTMLImageElement | null = null;

  constructor(
    app: App,
    plugin: ZoomMapPlugin,
    file: TFile,
    onDone: FaIconCreateCallback,
  ) {
    super(app);
    this.plugin = plugin;
    this.file = file;
    this.onDone = onDone;

    const baseKey = file.name.replace(/\.svg$/i, "");
    this.keyValue = baseKey;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl("h2", { text: "Create icon from font awesome" });

    const info = contentEl.createEl("div", { text: this.file.path });
    info.style.fontSize = "11px";
    info.style.color = "var(--text-muted)";
    info.style.marginBottom = "8px";

    // Preview row
    const previewRow = contentEl.createDiv({ cls: "zoommap-modal-preview" });
    previewRow.createSpan({ text: "Preview:" });
    this.previewImg = previewRow.createEl("img");

    // Show original SVG immediately, so the preview is never empty.
    try {
      const resourcePath = this.app.vault.getResourcePath(this.file);
      this.previewImg.src = resourcePath;
    } catch {
      // ignore – updatePreview() will try again with data URL
    }
    this.previewImg.style.width = `${this.sizeValue}px`;
    this.previewImg.style.height = `${this.sizeValue}px`;

    // Icon key
    new Setting(contentEl)
      .setName("Icon key")
      .setDesc("Unique name for this icon.")
      .addText((t) => {
        t.setValue(this.keyValue);
        t.onChange((v) => {
          this.keyValue = v.trim();
        });
      });

    // Color (text + color picker)
    const colorRow = new Setting(contentEl)
      .setName("Color")
      .setDesc("SVG fill/stroke color (CSS color; picker only supports hex).");

    let colorTextInput: HTMLInputElement;

    colorRow.addText((t) => {
      t.setPlaceholder("#d23c3c");
      t.setValue(this.colorValue);
      t.onChange((v) => {
        this.colorValue = v.trim() || "#d23c3c";
        this.updatePreview();
      });
      colorTextInput = t.inputEl;
    });

    const colorPicker = colorRow.controlEl.createEl("input", {
      attr: {
        type: "color",
        style: "margin-left:8px; vertical-align: middle;",
      },
    });

    // Only set the picker value if we have a valid hex color.
    const pickerInitial = this.normalizeColorForPicker(this.colorValue);
    if (pickerInitial) {
      try {
        colorPicker.value = pickerInitial;
      } catch {
        // Some environments may throw on invalid value; ignore.
      }
    }

    colorPicker.oninput = () => {
      const picked = colorPicker.value;
      if (picked && picked.trim().length > 0) {
        this.colorValue = picked;
        if (colorTextInput) {
          colorTextInput.value = picked;
        }
        this.updatePreview();
      }
    };

    // Size
    new Setting(contentEl)
      .setName("Size")
      .setDesc("Rendered size in pixels.")
      .addText((t) => {
        t.setPlaceholder("24");
        t.setValue(String(this.sizeValue));
        t.onChange((v) => {
          const n = Number(v);
          if (Number.isFinite(n) && n > 0 && n <= 512) {
            this.sizeValue = Math.round(n);
            this.updatePreview();
          }
        });
      });

    // Anchor X/Y
    const anchorRow = new Setting(contentEl)
      .setName("Anchor position")
      .setDesc("Anchor in pixels from top-left of the icon.");

    anchorRow.addText((t) => {
      t.setPlaceholder("12");
      t.setValue(String(this.anchorXValue));
      t.onChange((v) => {
        const n = Number(v);
        if (Number.isFinite(n)) this.anchorXValue = Math.round(n);
      });
    });

    anchorRow.addText((t) => {
      t.setPlaceholder("12");
      t.setValue(String(this.anchorYValue));
      t.onChange((v) => {
        const n = Number(v);
        if (Number.isFinite(n)) this.anchorYValue = Math.round(n);
      });
    });

    // Footer buttons
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const saveBtn = footer.createEl("button", { text: "Save" });
    const cancelBtn = footer.createEl("button", { text: "Cancel" });

    saveBtn.onclick = () => {
      void this.createIcon();
    };
    cancelBtn.onclick = () => {
      this.close();
    };

    void this.loadSvg();
  }

  onClose(): void {
    this.contentEl.empty();
    this.previewImg = null;
    this.svgSource = null;
  }

  private async loadSvg(): Promise<void> {
    try {
      this.svgSource = await this.app.vault.read(this.file);
      this.updatePreview();
    } catch (error) {
      console.error("Zoom Map: failed to read SVG file", error);
      new Notice("Failed to read SVG file.", 2500);
    }
  }

  private colorizeSvg(svg: string, color: string): string {
    const c = color.trim();
    if (!c) return svg;

    let s = svg;

    // Replace existing fill / stroke attributes
    s = s.replace(/fill="[^"]*"/gi, `fill="${c}"`);
    s = s.replace(/stroke="[^"]*"/gi, `stroke="${c}"`);

    // Ensure root <svg> has a fill if none is present
    if (!/fill="/i.test(s)) {
      s = s.replace(/<svg([^>]*?)>/i, `<svg$1 fill="${c}">`);
    }

    return s;
  }

  private updatePreview(): void {
    if (!this.previewImg) return;

    if (this.svgSource) {
      const tinted = this.colorizeSvg(this.svgSource, this.colorValue);
      const dataUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
        tinted,
      )}`;
      this.previewImg.src = dataUrl;
    } else {
      // Fallback: original file
      try {
        const resourcePath = this.app.vault.getResourcePath(this.file);
        this.previewImg.src = resourcePath;
      } catch {
        // ignore
      }
    }

    this.previewImg.style.width = `${this.sizeValue}px`;
    this.previewImg.style.height = `${this.sizeValue}px`;
  }

  /**
   * Normalize a CSS color string so it is safe to assign to <input type="color">.
   * Returns a 6‑digit hex ("#rrggbb") or null if not convertible.
   */
  private normalizeColorForPicker(color: string): string | null {
    const s = color.trim();
    if (/^#([0-9a-f]{6})$/i.test(s)) return s;
    if (/^#([0-9a-f]{3})$/i.test(s)) {
      const r = s[1];
      const g = s[2];
      const b = s[3];
      return `#${r}${r}${g}${g}${b}${b}`;
    }
    return null;
  }

  private async createIcon(): Promise<void> {
    try {
      if (!this.svgSource) {
        this.svgSource = await this.app.vault.read(this.file);
      }

      const key = this.keyValue || this.file.name.replace(/\.svg$/i, "");
      const existing = this.plugin.settings.icons.find((i) => i.key === key);
      if (existing) {
        new Notice("Icon key already exists. Please choose another name.", 2500);
        return;
      }

      const tinted = this.colorizeSvg(this.svgSource!, this.colorValue);
      const dataUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
        tinted,
      )}`;

      const profile: IconProfile = {
        key,
        pathOrDataUrl: dataUrl,
        size: this.sizeValue,
        anchorX: this.anchorXValue,
        anchorY: this.anchorYValue,
      };

      this.onDone(profile);
      this.close();
    } catch (error) {
      console.error("Zoom Map: failed to create icon from SVG", error);
      new Notice("Failed to create icon from SVG.", 2500);
    }
  }
}