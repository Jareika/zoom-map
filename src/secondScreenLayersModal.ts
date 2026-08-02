import { Modal, Setting } from "obsidian";
import type { App } from "obsidian";

export interface SecondScreenLayerItem {
  id: string;
  name: string;
  selected: boolean;
}

export interface SecondScreenLayersModalInput {
  markerLayers: SecondScreenLayerItem[];
  drawLayers: SecondScreenLayerItem[];
  textLayers: SecondScreenLayerItem[];
  showGrids: boolean;
}

export type SecondScreenLayersModalResult =
  | {
      action: "save";
      markerLayerIds: string[];
      drawLayerIds: string[];
      textLayerIds: string[];
	  showGrids: boolean;
    }
  | { action: "cancel" };

type DoneCb = (res: SecondScreenLayersModalResult) => void;

export class SecondScreenLayersModal extends Modal {
  private input: SecondScreenLayersModalInput;
  private onDone: DoneCb;
  private showGrids = true;

  constructor(app: App, input: SecondScreenLayersModalInput, onDone: DoneCb) {
    super(app);
    this.input = input;
    this.onDone = onDone;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
	
    this.showGrids = !!this.input.showGrids;

    contentEl.createEl("h2", { text: "Second screen layers" });
    contentEl.createDiv({
      text: "Choose which layers should be visible when the map is sent to the second screen.",
    });

    this.renderSection(contentEl, "Marker layers", this.input.markerLayers);
    this.renderSection(contentEl, "Draw layers", this.input.drawLayers);
    this.renderSection(contentEl, "Text layers", this.input.textLayers);
	
    contentEl.createEl("h3", { text: "Grids" });
    new Setting(contentEl)
      .setName("Show grids on second screen")
      .setDesc("Includes grid overlays in the player screen note.")
      .addToggle((tg) => {
        tg.setValue(this.showGrids).onChange((on) => (this.showGrids = on));
      });

    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const save = footer.createEl("button", { text: "Save" });
    const cancel = footer.createEl("button", { text: "Cancel" });

    save.onclick = () => {
      this.close();
      this.onDone({
        action: "save",
        markerLayerIds: this.input.markerLayers.filter((x) => x.selected).map((x) => x.id),
        drawLayerIds: this.input.drawLayers.filter((x) => x.selected).map((x) => x.id),
        textLayerIds: this.input.textLayers.filter((x) => x.selected).map((x) => x.id),
		showGrids: this.showGrids,
      });
    };

    cancel.onclick = () => {
      this.close();
      this.onDone({ action: "cancel" });
    };
  }

  onClose(): void {
    this.contentEl.empty();
  }

  private renderSection(
    parent: HTMLElement,
    title: string,
    items: SecondScreenLayerItem[],
  ): void {
    parent.createEl("h3", { text: title });

    const actions = parent.createDiv({ cls: "zoommap-modal-footer" });

    const selectAll = actions.createEl("button", { text: "All" });
    const selectNone = actions.createEl("button", { text: "None" });

    const list = parent.createDiv();

    const rerender = () => {
      list.empty();

      if (items.length === 0) {
        list.createDiv({ text: "None." }).addClass("zoommap-muted");
        return;
      }

      for (const item of items) {
        const row = list.createDiv({ cls: "zoommap-collection-base-row" });
        const cb = row.createEl("input", { type: "checkbox" });
        cb.checked = item.selected;
        cb.onchange = () => {
          item.selected = cb.checked;
        };

        row.createSpan({ text: item.name || "(unnamed)" });
      }
    };

    selectAll.onclick = () => {
      items.forEach((x) => (x.selected = true));
      rerender();
    };

    selectNone.onclick = () => {
      items.forEach((x) => (x.selected = false));
      rerender();
    };

    rerender();
  }
}