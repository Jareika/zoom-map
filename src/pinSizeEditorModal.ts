import { Modal } from "obsidian";
import type { App } from "obsidian";

type PinSizeEditorSaveCallback = (overrides: Record<string, number | undefined>) => void;

export interface PinSizeEditorRow {
  iconKey: string;
  baseSize: number;
  override?: number;
  imgUrl: string;
}

export class PinSizeEditorModal extends Modal {
  private rows: PinSizeEditorRow[];
  private onSave: PinSizeEditorSaveCallback;
  private focusIconKey?: string;
  private inputs = new Map<string, HTMLInputElement>();

  constructor(
    app: App,
    rows: PinSizeEditorRow[],
    onSave: PinSizeEditorSaveCallback,
    focusIconKey?: string,
  ) {
    super(app);
    this.rows = rows;
    this.onSave = onSave;
    this.focusIconKey = focusIconKey;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Pin sizes for this map" });

    const info = contentEl.createDiv({
      text: "Set per-map sizes for pin icons. Leave the override empty to use the global default size from settings.",
    });
    info.addClass("zoommap-pin-size-info");

    const list = contentEl.createDiv({ cls: "zoommap-pin-size-list" });

    for (const row of this.rows) {
      const r = list.createDiv({ cls: "zoommap-pin-size-row" });

      const img = r.createEl("img", { cls: "zoommap-pin-size-icon" });
      img.src = row.imgUrl;

      r.createEl("code", { text: row.iconKey, cls: "zoommap-pin-size-key" });

      r.createSpan({
        text: `${row.baseSize}px default`,
        cls: "zoommap-pin-size-base",
      });

      const overrideInput = r.createEl("input", {
        type: "number",
        cls: "zoommap-pin-size-input",
      });
      overrideInput.placeholder = String(row.baseSize);

      if (
        typeof row.override === "number" &&
        row.override > 0 &&
        row.override !== row.baseSize
      ) {
        overrideInput.value = String(row.override);
      }

      r.createSpan({
        text: "Pixels on this map",
        cls: "zoommap-pin-size-label",
      });

      this.inputs.set(row.iconKey, overrideInput);
    }

    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const saveBtn = footer.createEl("button", { text: "Save" });
    const cancelBtn = footer.createEl("button", { text: "Cancel" });

    saveBtn.onclick = () => {
      const result: Record<string, number | undefined> = {};

      for (const row of this.rows) {
        const input = this.inputs.get(row.iconKey);
        if (!input) continue;

        const raw = input.value.trim();
        if (!raw) {
          result[row.iconKey] = undefined;
          continue;
        }

        const n = Number(raw);
        if (!Number.isFinite(n) || n <= 0) {
          result[row.iconKey] = undefined;
          continue;
        }

        if (Math.abs(n - row.baseSize) < 0.0001) {
          result[row.iconKey] = undefined;
        } else {
          result[row.iconKey] = Math.round(n);
        }
      }

      this.close();
      this.onSave(result);
    };

    cancelBtn.onclick = () => {
      this.close();
    };

    if (this.focusIconKey) {
      const input = this.inputs.get(this.focusIconKey);
      if (input) {
        window.setTimeout(() => {
          input.focus();
          input.select();
        }, 0);
      }
    }
  }

  onClose(): void {
    this.contentEl.empty();
    this.inputs.clear();
  }
}