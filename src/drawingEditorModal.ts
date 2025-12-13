import { Modal, Setting } from "obsidian";
import type { App } from "obsidian";
import type { Drawing, DrawingStyle, FillPatternKind } from "./markerStore";

export interface DrawingEditorResult {
  action: "save" | "cancel" | "delete";
  drawing?: Drawing;
}

type DrawingEditorCallback = (result: DrawingEditorResult) => void;

export class DrawingEditorModal extends Modal {
  private original: Drawing;
  private working: Drawing;
  private onResult: DrawingEditorCallback;

  constructor(app: App, drawing: Drawing, onResult: DrawingEditorCallback) {
    super(app);
    this.original = drawing;

    // Deep clone so we can edit without mutating the original object.
    this.working = JSON.parse(JSON.stringify(drawing)) as Drawing;

    this.onResult = onResult;

    this.working.style ??= {
      strokeColor: "#ff0000",
      strokeWidth: 2,
    } as DrawingStyle;

    const s = this.working.style;

    // Defaults
    if (!s.strokeColor) s.strokeColor = "#ff0000";
    if (!Number.isFinite(s.strokeWidth) || s.strokeWidth <= 0) s.strokeWidth = 2;
    if (typeof s.strokeOpacity !== "number") s.strokeOpacity = 1;

    if (!s.fillColor) s.fillColor = "#ff0000";
    if (typeof s.fillOpacity !== "number") s.fillOpacity = 0.15;

    if (!s.fillPattern) s.fillPattern = s.fillColor ? "solid" : "none";
    if (typeof s.fillPatternAngle !== "number") s.fillPatternAngle = 45;
    if (typeof s.fillPatternSpacing !== "number" || s.fillPatternSpacing <= 0) {
      s.fillPatternSpacing = 8;
    }
    if (
      typeof s.fillPatternStrokeWidth !== "number" ||
      s.fillPatternStrokeWidth <= 0
    ) {
      s.fillPatternStrokeWidth = 1;
    }
    if (typeof s.fillPatternOpacity !== "number") {
      s.fillPatternOpacity = s.fillOpacity ?? 0.15;
    }
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Edit drawing" });

    const style = this.working.style;

    // Label
    new Setting(contentEl).setName("Label").addText((t) => {
      t.setPlaceholder("Label");
      t.setValue(style.label ?? "");
      t.inputEl.classList.add("zoommap-drawing-editor__label-input");
      t.onChange((v) => {
        style.label = v.trim() || undefined;
      });
    });

    // Stroke heading
    const strokeHeading = contentEl.createDiv({
      cls: "zoommap-drawing-editor__section-heading",
    });
    strokeHeading.textContent = "Stroke";

    // Stroke pattern (solid / dashed / dotted)
    const strokePatternSetting = new Setting(contentEl).setName("Pattern");
    strokePatternSetting.addDropdown((dd) => {
      dd.addOption("solid", "Solid");
      dd.addOption("dashed", "Dashed");
      dd.addOption("dotted", "Dotted");

      const dash = style.strokeDash;
      let current = "solid";
      if (Array.isArray(dash) && dash.length > 0) {
        current = dash[0] <= 3 ? "dotted" : "dashed";
      }
      dd.setValue(current);

      dd.onChange((v) => {
        if (v === "solid") {
          style.strokeDash = undefined;
        } else if (v === "dashed") {
          style.strokeDash = [8, 4];
        } else {
          style.strokeDash = [2, 4];
        }
      });
    });

    // Stroke color
    const strokeColorSetting = new Setting(contentEl).setName("Color");
    const strokeColorText = strokeColorSetting.controlEl.createEl("input", {
      type: "text",
    });
    strokeColorText.classList.add("zoommap-drawing-editor__color-text");
    strokeColorText.value = style.strokeColor ?? "#ff0000";

    const strokeColorPicker = strokeColorSetting.controlEl.createEl("input", {
      type: "color",
    });
    strokeColorPicker.classList.add("zoommap-drawing-editor__color-picker");
    strokeColorPicker.value = this.normalizeHex(style.strokeColor ?? "#ff0000");

    strokeColorText.oninput = () => {
      const val = strokeColorText.value.trim() || "#ff0000";
      style.strokeColor = val;
      if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) {
        strokeColorPicker.value = this.normalizeHex(val);
      }
    };
    strokeColorPicker.oninput = () => {
      const hex = strokeColorPicker.value;
      strokeColorText.value = hex;
      style.strokeColor = hex;
    };

    // Stroke width
    new Setting(contentEl).setName("Width").addText((t) => {
      t.inputEl.type = "number";
      t.inputEl.classList.add("zoommap-drawing-editor__num-input");
      t.setValue(String(style.strokeWidth ?? 2));
      t.onChange((v) => {
        const n = Number(v);
        if (Number.isFinite(n) && n > 0) {
          style.strokeWidth = n;
        }
      });
    });

    // Stroke opacity (0–100)
    new Setting(contentEl).setName("Opacity").addText((t) => {
      t.inputEl.type = "number";
      t.inputEl.classList.add("zoommap-drawing-editor__num-input");
      t.setPlaceholder("100");
      t.setValue(this.toPercent(style.strokeOpacity, 100));
      t.onChange((v) => {
        const n = Number(v);
        if (!Number.isFinite(n)) {
          style.strokeOpacity = undefined;
          return;
        }
        const clamped = this.clamp(n, 0, 100);
        style.strokeOpacity = clamped / 100;
      });
    });

    // Fill heading
    const fillHeading = contentEl.createDiv({
      cls: "zoommap-drawing-editor__section-heading",
    });
    fillHeading.textContent = "Fill";

    // Fill pattern (none / solid / striped / cross / wavy)
    const fillPatternSetting = new Setting(contentEl).setName("Pattern");
    fillPatternSetting.addDropdown((dd) => {
      dd.addOption("none", "None");
      dd.addOption("solid", "Solid");
      dd.addOption("striped", "Striped");
      dd.addOption("cross", "Cross");
      dd.addOption("wavy", "Wavy");

      const current: FillPatternKind =
        style.fillPattern ?? (style.fillColor ? "solid" : "none");
      dd.setValue(current);

      dd.onChange((v) => {
        const kind = v as FillPatternKind;
        style.fillPattern = kind;
      });
    });

    // Base fill color
    const fillColorSetting = new Setting(contentEl).setName("Base color");
    const fillColorText = fillColorSetting.controlEl.createEl("input", {
      type: "text",
    });
    fillColorText.classList.add("zoommap-drawing-editor__color-text");
    fillColorText.value = style.fillColor ?? "#ff0000";

    const fillColorPicker = fillColorSetting.controlEl.createEl("input", {
      type: "color",
    });
    fillColorPicker.classList.add("zoommap-drawing-editor__color-picker");
    fillColorPicker.value = this.normalizeHex(style.fillColor ?? "#ff0000");

    fillColorText.oninput = () => {
      const val = fillColorText.value.trim();
      if (!val) {
        style.fillColor = undefined;
        return;
      }
      style.fillColor = val;
      if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) {
        fillColorPicker.value = this.normalizeHex(val);
      }
    };
    fillColorPicker.oninput = () => {
      const hex = fillColorPicker.value;
      fillColorText.value = hex;
      style.fillColor = hex;
    };

    // Base opacity (0–100)
    new Setting(contentEl).setName("Base opacity").addText((t) => {
      t.inputEl.type = "number";
      t.inputEl.classList.add("zoommap-drawing-editor__num-input");
      t.setPlaceholder("15");
      t.setValue(this.toPercent(style.fillOpacity, ""));
      t.onChange((v) => {
        const n = Number(v);
        if (!Number.isFinite(n)) {
          style.fillOpacity = undefined;
          return;
        }
        const clamped = this.clamp(n, 0, 100);
        style.fillOpacity = clamped / 100;
      });
    });

    // Pattern spacing
    new Setting(contentEl).setName("Spacing").addText((t) => {
      t.inputEl.type = "number";
      t.inputEl.classList.add("zoommap-drawing-editor__num-input");
      t.setPlaceholder("8");
      t.setValue(String(style.fillPatternSpacing ?? 8));
      t.onChange((v) => {
        const n = Number(v);
        if (!Number.isFinite(n) || n <= 0) {
          style.fillPatternSpacing = undefined;
          return;
        }
        style.fillPatternSpacing = n;
      });
    });

    // Pattern angle
    new Setting(contentEl).setName("Angle").addText((t) => {
      t.inputEl.type = "number";
      t.inputEl.classList.add("zoommap-drawing-editor__num-input");
      t.setPlaceholder("45");
      t.setValue(String(style.fillPatternAngle ?? 45));
      t.onChange((v) => {
        const n = Number(v);
        if (!Number.isFinite(n)) {
          style.fillPatternAngle = undefined;
          return;
        }
        style.fillPatternAngle = n;
      });
    });

    // Pattern stroke width
    new Setting(contentEl).setName("Line width").addText((t) => {
      t.inputEl.type = "number";
      t.inputEl.classList.add("zoommap-drawing-editor__num-input");
      t.setPlaceholder("1");
      t.setValue(String(style.fillPatternStrokeWidth ?? 1));
      t.onChange((v) => {
        const n = Number(v);
        if (!Number.isFinite(n) || n <= 0) {
          style.fillPatternStrokeWidth = undefined;
          return;
        }
        style.fillPatternStrokeWidth = n;
      });
    });

    // Pattern opacity (0–100)
    new Setting(contentEl).setName("Pattern opacity").addText((t) => {
      t.inputEl.type = "number";
      t.inputEl.classList.add("zoommap-drawing-editor__num-input");
      t.setPlaceholder("15");
      t.setValue(this.toPercent(style.fillPatternOpacity, ""));
      t.onChange((v) => {
        const n = Number(v);
        if (!Number.isFinite(n)) {
          style.fillPatternOpacity = undefined;
          return;
        }
        const clamped = this.clamp(n, 0, 100);
        style.fillPatternOpacity = clamped / 100;
      });
    });

    // Footer
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const saveBtn = footer.createEl("button", { text: "Save" });
    const deleteBtn = footer.createEl("button", { text: "Delete" });
    const cancelBtn = footer.createEl("button", { text: "Cancel" });

    saveBtn.onclick = () => {
      this.normalizeStyle(this.working.style);

      // Preserve geometry metadata from the original
      this.working.id = this.original.id;
      this.working.layerId = this.original.layerId;
      this.working.kind = this.original.kind;
      this.working.rect = this.original.rect;
      this.working.circle = this.original.circle;
      this.working.polygon = this.original.polygon;

      this.close();
      this.onResult({ action: "save", drawing: this.working });
    };

    deleteBtn.onclick = () => {
      this.close();
      this.onResult({ action: "delete" });
    };

    cancelBtn.onclick = () => {
      this.close();
      this.onResult({ action: "cancel" });
    };
  }

  onClose(): void {
    this.contentEl.empty();
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

  private clamp(v: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, v));
  }

  private toPercent(value: number | undefined, fallback: string | number): string {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return String(fallback);
    }
    return String(Math.round(value * 100));
  }

  private normalizeStyle(style: Drawing["style"]): void {
    if (!style.strokeColor) style.strokeColor = "#ff0000";
    if (!Number.isFinite(style.strokeWidth) || style.strokeWidth <= 0) {
      style.strokeWidth = 2;
    }

    if (typeof style.strokeOpacity === "number") {
      style.strokeOpacity = this.clamp(style.strokeOpacity, 0, 1);
      if (style.strokeOpacity === 1) delete style.strokeOpacity;
    }

    const pattern: FillPatternKind =
      style.fillPattern ?? (style.fillColor ? "solid" : "none");
    style.fillPattern = pattern;

    if (pattern === "none") {
      // No fill; keep values as-is.
    } else if (pattern === "solid") {
      if (!style.fillColor) style.fillColor = "#ff0000";
      if (!Number.isFinite(style.fillOpacity)) style.fillOpacity = 0.15;
      delete style.fillPatternSpacing;
      delete style.fillPatternAngle;
      delete style.fillPatternStrokeWidth;
      delete style.fillPatternOpacity;
    } else {
      if (!style.fillColor) style.fillColor = "#ff0000";
      if (!Number.isFinite(style.fillOpacity)) style.fillOpacity = 0.15;
      if (
        !Number.isFinite(style.fillPatternSpacing) ||
        style.fillPatternSpacing! <= 0
      ) {
        style.fillPatternSpacing = 8;
      }
      if (!Number.isFinite(style.fillPatternAngle)) {
        style.fillPatternAngle = 45;
      }
      if (
        !Number.isFinite(style.fillPatternStrokeWidth) ||
        style.fillPatternStrokeWidth! <= 0
      ) {
        style.fillPatternStrokeWidth = 1;
      }
      if (!Number.isFinite(style.fillPatternOpacity)) {
        style.fillPatternOpacity = style.fillOpacity ?? 0.15;
      }
      style.fillPatternOpacity = this.clamp(style.fillPatternOpacity!, 0, 1);
    }
  }
}