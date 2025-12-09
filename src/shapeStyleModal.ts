import { Modal, Setting } from "obsidian";
import type { App } from "obsidian";

export interface ShapeStyle {
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
  strokeStyle?: "solid" | "dash" | "dot";
  fillPattern?: "solid" | "stripe" | "dot";
}

type ShapeStyleCallback = (style: ShapeStyle) => void;

export class ShapeStyleModal extends Modal {
  private style: ShapeStyle;
  private onSave: ShapeStyleCallback;

  constructor(app: App, initial: ShapeStyle, onSave: ShapeStyleCallback) {
    super(app);
    this.style = { ...initial };
    this.onSave = onSave;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Shape style" });

    new Setting(contentEl)
      .setName("Fill color")
      .addText((t) => {
        t.setPlaceholder("Color");
        t.setValue(this.style.fillColor ?? "");
        t.onChange((v) => {
          this.style.fillColor = v.trim() || undefined;
        });
      });

    new Setting(contentEl)
      .setName("Fill opacity")
      .setDesc("0..1")
      .addText((t) => {
        t.setPlaceholder("0.35");
        t.setValue(
          typeof this.style.fillOpacity === "number"
            ? String(this.style.fillOpacity)
            : "",
        );
        t.onChange((v) => {
          const n = Number(v);
          this.style.fillOpacity =
            Number.isFinite(n) && n >= 0 && n <= 1 ? n : undefined;
        });
      });

    new Setting(contentEl)
      .setName("Fill pattern")
      .addDropdown((d) => {
        d.addOption("solid", "Solid");
        d.addOption("stripe", "Stripe");
        d.addOption("dot", "Dot");
        d.setValue(this.style.fillPattern ?? "solid");
        d.onChange((v) => {
          this.style.fillPattern =
            v === "stripe" || v === "dot" ? v : "solid";
        });
      });

    new Setting(contentEl)
      .setName("Stroke color")
      .addText((t) => {
        t.setPlaceholder("#000000");
        t.setValue(this.style.strokeColor ?? "");
        t.onChange((v) => {
          this.style.strokeColor = v.trim() || undefined;
        });
      });

    new Setting(contentEl)
      .setName("Stroke width")
      .setDesc("Px")
      .addText((t) => {
        t.setPlaceholder("2");
        t.setValue(
          typeof this.style.strokeWidth === "number"
            ? String(this.style.strokeWidth)
            : "",
        );
        t.onChange((v) => {
          const n = Number(v);
          this.style.strokeWidth =
            Number.isFinite(n) && n > 0 ? n : undefined;
        });
      });

    new Setting(contentEl)
      .setName("Stroke style")
      .addDropdown((d) => {
        d.addOption("solid", "Solid");
        d.addOption("dash", "Dash");
        d.addOption("dot", "Dot");
        d.setValue(this.style.strokeStyle ?? "solid");
        d.onChange((v) => {
          this.style.strokeStyle =
            v === "dash" || v === "dot" ? v : "solid";
        });
      });

    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const save = footer.createEl("button", { text: "Save" });
    const cancel = footer.createEl("button", { text: "Cancel" });

    save.onclick = () => {
      this.close();
      this.onSave(this.style);
    };
    cancel.onclick = () => this.close();
  }

  onClose(): void {
    this.contentEl.empty();
  }
}