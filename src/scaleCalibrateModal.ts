import { Modal, Setting } from "obsidian";
import type { App } from "obsidian";

export type ScaleUnit = "m" | "km" | "mi" | "ft";
export type ScaleUnitValue = ScaleUnit | `custom:${string}`;

export interface ScaleCustomUnit {
  id: string;
  name: string;
  abbreviation: string;
}

export interface ScaleCalibrateResult {
  unit: ScaleUnitValue;

  // Standard units
  metersPerPixel?: number;

  // Custom units
  pixelsPerUnit?: number;
  customUnitId?: string;
}

type ScaleCalibrateCallback = (result: ScaleCalibrateResult) => void;

export interface ScaleCalibrateOptions {
  initialUnit?: ScaleUnitValue;
  customUnits?: ScaleCustomUnit[];
}

export class ScaleCalibrateModal extends Modal {
  private pxDistance: number;
  private onOk: ScaleCalibrateCallback;
  private options: ScaleCalibrateOptions;

  private inputValue = "1";
  private unit: ScaleUnitValue = "km";

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
    if (this.options.initialUnit) this.unit = this.options.initialUnit;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Calibrate scale" });

    contentEl.createDiv({
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

        const customUnits = (this.options.customUnits ?? [])
          .filter((u) => !!u && typeof u.id === "string" && u.id.trim().length > 0)
          .slice()
          .sort((a, b) => (a.name ?? a.id).localeCompare(b.name ?? b.id));

        for (const u of customUnits) {
          const base = (u.name ?? "").trim() || "Custom unit";
          const abbr = (u.abbreviation ?? "").trim();
          const label = abbr ? `${base} (${abbr})` : base;
          d.addOption(`custom:${u.id}`, label);
        }

        const hasOption = (v: string) =>
          Array.from(d.selectEl.options).some((o) => o.value === v);

        const initial = hasOption(String(this.unit)) ? String(this.unit) : "km";
        d.setValue(initial);

        d.onChange((v) => {
          this.unit = v as ScaleUnitValue;
        });
      });

    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const ok = footer.createEl("button", { text: "Save" });
    const cancel = footer.createEl("button", { text: "Cancel" });

    ok.addEventListener("click", () => {
      const val = Number(this.inputValue.replace(",", "."));
      if (!Number.isFinite(val) || val <= 0 || this.pxDistance <= 0) {
        this.close();
        return;
      }

      // Custom unit -> store px/unit
      if (typeof this.unit === "string" && this.unit.startsWith("custom:")) {
        const id = this.unit.slice("custom:".length).trim();
        const pxPerUnit = this.pxDistance / val;

        this.close();
        this.onOk({
          unit: this.unit,
          customUnitId: id,
          pixelsPerUnit: pxPerUnit,
        });
        return;
      }

      // Standard units -> store m/px
      const meters = this.toMeters(val, this.unit);
      const mpp = meters / this.pxDistance;

      this.close();
      this.onOk({
        unit: this.unit,
        metersPerPixel: mpp,
      });
    });

    cancel.addEventListener("click", () => this.close());
  }

  private toMeters(v: number, u: ScaleUnitValue): number {
    switch (u) {
      case "km":
        return v * 1000;
      case "mi":
        return v * 1609.344;
      case "ft":
        return v * 0.3048;
      case "m":
      default:
        return v;
    }
  }

  onClose(): void {
    this.contentEl.empty();
  }
}