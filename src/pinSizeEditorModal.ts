import { Modal } from "obsidian";
import type { App } from "obsidian";

/* eslint-disable-next-line no-unused-vars */
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

    const info = contentEl.createEl("div", {
      text: "Set per-map sizes for pin icons. Leave the override empty to use the global default size from settings.",
    });
    info.style.marginBottom = "8px";

    const list = contentEl.createDiv();
    list.style.display = "flex";
    list.style.flexDirection = "column";
    list.style.gap = "6px";

    for (const row of this.rows) {
      const r = list.createDiv();
      r.style.display = "flex";
      r.style.alignItems = "center";
      r.style.gap = "8px";

      const img = r.createEl("img");
      img.src = row.imgUrl;
      img.style.width = "18px";
      img.style.height = "18px";
      img.style.objectFit = "contain";

      const keySpan = r.createEl("code", { text: row.iconKey });
      keySpan.style.minWidth = "0";
      keySpan.style.whiteSpace = "nowrap";

      const baseSpan = r.createEl("span", {
        text: `${row.baseSize}px default`,
      });
      baseSpan.style.fontSize = "11px";
      baseSpan.style.color = "var(--text-muted)";

      const overrideInput = r.createEl("input", { type: "number" });
      overrideInput.style.width = "7ch";
      overrideInput.placeholder = String(row.baseSize);
      if (typeof row.override === "number" && row.override > 0 && row.override !== row.baseSize) {
        overrideInput.value = String(row.override);
      }

      const label = r.createEl("span", { text: "Pixels on this map" });
      label.style.fontSize = "11px";
      label.style.color = "var(--text-muted)";

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
          // No override
          result[row.iconKey] = undefined;
          continue;
        }
        const n = Number(raw);
        if (!Number.isFinite(n) || n <= 0) {
          // Invalid override → treat as "no override"
          result[row.iconKey] = undefined;
          continue;
        }
        if (Math.abs(n - row.baseSize) < 0.0001) {
          // Same as default → no override needed
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