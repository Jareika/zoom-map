import { Modal, Setting } from "obsidian";
import type { App } from "obsidian";
import type { MarkerLayer } from "./markerStore";

export type DeleteLayerDecision =
  | { mode: "move"; targetId: string }
  | { mode: "delete-markers" };

export class RenameLayerModal extends Modal {
  private layer: MarkerLayer;
  private onDone: (newName: string) => void;
  private value = "";

  constructor(app: App, layer: MarkerLayer, onDone: (newName: string) => void) {
    super(app);
    this.layer = layer;
    this.onDone = onDone;
    this.value = layer.name ?? "";
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Rename layer" });

    new Setting(contentEl)
      .setName("New name")
      .addText((t) => {
        t.setValue(this.value);
        t.onChange((v) => (this.value = v.trim()));
      });

    const footer = contentEl.createDiv({
      attr: { style: "display:flex; gap:8px; justify-content:flex-end; margin-top:12px;" },
    });
    const save = footer.createEl("button", { text: "Save" });
    const cancel = footer.createEl("button", { text: "Cancel" });

    save.onclick = () => {
      const name = this.value || this.layer.name;
      this.close();
      this.onDone(name);
    };
    cancel.onclick = () => this.close();
  }

  onClose(): void {
    this.contentEl.empty();
  }
}

export class DeleteLayerModal extends Modal {
  private layer: MarkerLayer;
  private targets: MarkerLayer[];
  private hasMarkers: boolean;
  private onDone: (decision: DeleteLayerDecision) => void;

  private mode: "delete-markers" | "move" = "delete-markers";
  private targetId = "";

  constructor(
    app: App,
    layer: MarkerLayer,
    targets: MarkerLayer[],
    hasMarkers: boolean,
    onDone: (decision: DeleteLayerDecision) => void,
  ) {
    super(app);
    this.layer = layer;
    this.targets = targets;
    this.hasMarkers = hasMarkers;
    this.onDone = onDone;
    this.targetId = targets[0]?.id ?? "";
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Delete layer" });

    const canMove = this.targets.length > 0;
    const actionSetting = new Setting(contentEl).setName("Action");

    actionSetting.addDropdown((d) => {
      d.addOption("delete-markers", "Delete markers");
      if (canMove) d.addOption("move", "Move to layer");
      d.setValue(this.mode);
      d.onChange((v) => {
        this.mode = v as "delete-markers" | "move";
        targetSetting.settingEl.toggle(this.mode === "move");
      });
    });

    const targetSetting = new Setting(contentEl)
      .setName("Target layer")
      .addDropdown((d) => {
        for (const t of this.targets) d.addOption(t.id, t.name);
        d.setValue(this.targetId);
        d.onChange((v) => (this.targetId = v));
      });

    targetSetting.settingEl.toggle(this.mode === "move");

    if (!this.hasMarkers) {
      new Setting(contentEl).setDesc("This layer has no markers.");
    }
    if (!canMove) {
      new Setting(contentEl).setDesc("No other layer available to move markers.");
    }

    const footer = contentEl.createDiv({
      attr: { style: "display:flex; gap:8px; justify-content:flex-end; margin-top:12px;" },
    });
    const confirm = footer.createEl("button", { text: "Confirm" });
    const cancel = footer.createEl("button", { text: "Cancel" });

    confirm.onclick = () => {
      if (this.mode === "move") {
        if (!this.targetId) { this.close(); return; }
        this.close();
        this.onDone({ mode: "move", targetId: this.targetId });
      } else {
        this.close();
        this.onDone({ mode: "delete-markers" });
      }
    };

    cancel.onclick = () => this.close();
  }

  onClose(): void {
    this.contentEl.empty();
  }
}