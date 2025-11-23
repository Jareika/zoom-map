import { App, Modal, Setting, Notice } from "obsidian";
import type { MarkerLayer } from "./markerStore";

export class RenameLayerModal extends Modal {
  private current: MarkerLayer;
  private onOk: (newName: string) => void;
  private value: string;

  constructor(app: App, layer: MarkerLayer, onOk: (newName: string) => void) {
    super(app);
    this.current = layer;
    this.onOk = onOk;
    this.value = layer.name;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: `Rename layer: ${this.current.name}` });

    new Setting(contentEl)
      .setName("New name")
      .addText((t) => {
        t.setValue(this.value);
        t.onChange((v) => (this.value = v));
      });

    const footer = contentEl.createDiv({ cls: "modal-button-container" });
    const cancel = footer.createEl("button", { text: "Cancel" });
    const ok = footer.createEl("button", { text: "Save" });

    cancel.onclick = () => this.close();
    ok.onclick = () => {
      const n = this.value.trim();
      if (!n) { new Notice("Name cannot be empty.", 1500); return; }
      this.close();
      this.onOk(n);
    };
  }

  onClose(): void { this.contentEl.empty(); }
}

export type DeleteLayerDecision =
  | { mode: "move"; targetId: string }
  | { mode: "delete-markers" };

export class DeleteLayerModal extends Modal {
  private layer: MarkerLayer;
  private others: MarkerLayer[];
  private hasMarkers: boolean;
  private onOk: (d: DeleteLayerDecision) => void;

  private mode: "move" | "delete-markers" = "move";
  private targetId: string;

  constructor(
    app: App,
    layer: MarkerLayer,
    others: MarkerLayer[],
    hasMarkers: boolean,
    onOk: (d: DeleteLayerDecision) => void,
  ) {
    super(app);
    this.layer = layer;
    this.others = others;
    this.hasMarkers = hasMarkers;
    this.targetId = others[0]?.id ?? "";
    this.onOk = onOk;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: `Delete layer: ${this.layer.name}` });

    // Entscheidung: Marker verschieben oder löschen
    const modeSetting = new Setting(contentEl)
      .setName("What to do with markers?")
      .setDesc(
        this.hasMarkers ? "The layer contains markers." : "Layer has no markers.",
      )
      .addDropdown((d) => {
        d.addOption("move", "Move to another layer");
        d.addOption("delete-markers", "Delete markers");
        d.setValue(this.mode);
        d.onChange((v) => {
          this.mode = (v as any) === "delete-markers" ? "delete-markers" : "move";
          refresh();
        });
      });

    // Ziel-Layer
    const targetSetting = new Setting(contentEl)
      .setName("Move target")
      .setDesc("Destination layer for existing markers.");

    targetSetting.addDropdown((d) => {
      for (const l of this.others) d.addOption(l.id, l.name);
      d.setValue(this.targetId);
      d.onChange((v) => (this.targetId = v));
    });

    // Buttons
    const footer = contentEl.createDiv({ cls: "modal-button-container" });
    const cancelBtn = footer.createEl("button", { text: "Cancel" });
    const okBtn = footer.createEl("button", { text: "Delete" });
    okBtn.addClass("mod-warning");

    cancelBtn.onclick = () => this.close();
    okBtn.onclick = () => {
      if (this.hasMarkers && this.mode === "move" && !this.targetId) {
        new Notice("Please choose a target layer.", 1500);
        return;
      }
      this.close();
      const res: DeleteLayerDecision =
        this.hasMarkers
          ? this.mode === "move"
            ? { mode: "move", targetId: this.targetId }
            : { mode: "delete-markers" }
          : { mode: "move", targetId: this.targetId || this.others[0]?.id || "" };
      this.onOk(res);
    };

    // Sichtbarkeit der Zielauswahl steuern (ohne .toggle Fehler)
    const refresh = () => {
      const show = this.mode === "move" && this.hasMarkers;
      (targetSetting.settingEl as HTMLElement).style.display = show ? "" : "none";
    };
    refresh();
  }

  onClose(): void { this.contentEl.empty(); }
}