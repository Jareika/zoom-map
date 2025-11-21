import { App, Modal, Setting } from "obsidian";

export type ScaleUnit = "m" | "km" | "mi" | "ft";

export interface ScaleCalibrateResult {
  metersPerPixel: number;
}

export class ScaleCalibrateModal extends Modal {
  private pxDistance: number;
  private onOk: (res: ScaleCalibrateResult) => void;

  private inputValue = "1";
  private unit: ScaleUnit = "km";

  constructor(
    app: App,
    pxDistance: number,
    onOk: (res: ScaleCalibrateResult) => void,
  ) {
    super(app);
    this.pxDistance = pxDistance;
    this.onOk = onOk;
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
        t.setPlaceholder("example 2");
        t.setValue(this.inputValue);
        t.onChange((v) => {
          this.inputValue = v.trim();
        });
      })
      .addDropdown((d) => {
        d.addOption("m", "m");
        d.addOption("km", "km");
        d.addOption("mi", "mi");
        d.addOption("ft", "ft");
        d.setValue(this.unit);
        d.onChange((v) => {
          this.unit = v as ScaleUnit;
        });
      });

    const footer = contentEl.createDiv({
      attr: {
        style: "display:flex; gap:8px; justify-content:flex-end; margin-top:12px;",
      },
    });
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
      default:
        return v;
    }
  }

  onClose(): void {
    this.contentEl.empty();
  }
}