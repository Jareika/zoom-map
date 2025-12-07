import { Modal, Setting } from "obsidian";
import type { App } from "obsidian";

export type ScaleUnit = "m" | "km" | "mi" | "ft" | "custom";

export interface ScaleCalibrateResult {
  metersPerPixel: number;
}

/* eslint-disable-next-line no-unused-vars */
type ScaleCalibrateCallback = (result: ScaleCalibrateResult) => void;

export interface ScaleCalibrateOptions {
  initialUnit?: ScaleUnit;
  customLabel?: string;
  customAbbreviation?: string;
  customMetersPerUnit?: number;
}

export class ScaleCalibrateModal extends Modal {
  private pxDistance: number;
  private onOk: ScaleCalibrateCallback;
  private options: ScaleCalibrateOptions;

  private inputValue = "1";
  private unit: ScaleUnit = "km";

  constructor(
    app: App,
    pxDistance: number,
    onOk: ScaleCalibrateCallback,
    options?: ScaleCalibrateOptions,
  ) {
    super(app);
    this.pxDistance = pxDistance;
    this.onOk = onOk;
    this.options = options ?? {};
    if (this.options.initialUnit) {
      this.unit = this.options.initialUnit;
    }
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Calibrate scale" });

    contentEl.createEl("div", {
      text: `Measured pixel distance: ${this.pxDistance.toFixed(1)} px`,
    });

    new Setting(contentEl)
      .setName("Real world length")
      .addText((t) => {
        t.setPlaceholder("Example 2");
        t.setValue(this.inputValue);
        t.onChange((v) => {
          this.inputValue = v.trim();
        });
      })
      .addDropdown((d) => {
        d.addOption("m", "Meters");
        d.addOption("km", "Kilometers");
        d.addOption("mi", "Miles");
        d.addOption("ft", "Feet");

        if (
          this.options.customMetersPerUnit &&
          (this.options.customLabel || this.options.customAbbreviation)
        ) {
          const base = this.options.customLabel ?? "Custom unit";
          const abbr = this.options.customAbbreviation;
          const label = abbr ? `${base} (${abbr})` : base;
          d.addOption("custom", label);
        }

        d.setValue(this.unit);
        d.onChange((v) => {
          this.unit = v as ScaleUnit;
        });
      });

    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const ok = footer.createEl("button", { text: "Save" });
    const cancel = footer.createEl("button", { text: "Cancel" });

    ok.addEventListener("click", () => {
      const val = Number(this.inputValue.replace(",", "."));
      if (!Number.isFinite(val) || val <= 0) {
        this.close();
        return;
      }
      const meters = this.toMeters(val, this.unit);
      const mpp = meters / this.pxDistance;
      this.close();
      this.onOk({ metersPerPixel: mpp });
    });

    cancel.addEventListener("click", () => this.close());
  }

  private toMeters(v: number, u: ScaleUnit): number {
    switch (u) {
      case "km":
        return v * 1000;
      case "mi":
        return v * 1609.344;
      case "ft":
        return v * 0.3048;
      case "custom": {
        const factor = this.options.customMetersPerUnit;
        return v * (factor && factor > 0 ? factor : 1);
      }
      case "m":
      default:
        return v;
    }
  }

  onClose(): void {
    this.contentEl.empty();
  }
}