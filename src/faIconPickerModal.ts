import { Modal, normalizePath, TFolder, TFile } from "obsidian";
import type { App } from "obsidian";

type FaIconPickerCallback = (file: TFile) => void;

export class FaIconPickerModal extends Modal {
  private folder: string;
  private onChoose: FaIconPickerCallback;
  private files: TFile[] = [];

  private listEl: HTMLDivElement | null = null;
  private searchInput: HTMLInputElement | null = null;

  private selected: TFile | null = null;
  private selectedEl: HTMLDivElement | null = null;
  private addButton: HTMLButtonElement | null = null;

  constructor(app: App, folder: string, onChoose: FaIconPickerCallback) {
    super(app);
    this.folder = normalizePath(folder);
    this.onChoose = onChoose;
  }

  private collectFiles(): void {
    const result: TFile[] = [];
    const root = this.app.vault.getAbstractFileByPath(this.folder);

    if (!(root instanceof TFolder)) {
      console.warn(`Zoom Map: SVG icon folder not found: ${this.folder}`);
      this.files = [];
      return;
    }

    const stack: TFolder[] = [root];

    while (stack.length > 0) {
      const current = stack.pop()!;
      for (const child of current.children) {
        if (child instanceof TFolder) {
          stack.push(child);
        } else if (child instanceof TFile) {
          if (child.extension?.toLowerCase() === "svg") {
            result.push(child);
          }
        }
      }
    }

    result.sort((a, b) => a.path.localeCompare(b.path));
    this.files = result;
  }

  private renderList(filter: string): void {
    if (!this.listEl) return;

    const files = Array.isArray(this.files) ? this.files : [];
    this.files = files;

    this.listEl.empty();

    // Reset selection
    this.selected = null;
    if (this.selectedEl) {
      this.selectedEl.classList.remove("is-selected");
      this.selectedEl = null;
    }
    if (this.addButton) this.addButton.disabled = true;

    const q = filter.trim().toLowerCase();
    const matches = files.filter((f) => {
      if (!q) return true;
      const name = f.name.toLowerCase();
      const path = f.path.toLowerCase();
      return name.includes(q) || path.includes(q);
    });

    if (matches.length === 0) {
      this.listEl.createEl("div", {
        text: "No SVG icons found in this folder.",
      });
      return;
    }

    const grid = this.listEl.createDiv({ cls: "zoommap-fa-picker-grid" });

    for (const file of matches) {
      const cell = grid.createDiv({ cls: "zoommap-fa-picker-cell" });

      const img = cell.createEl("img", { cls: "zoommap-fa-picker-icon" });
      img.src = this.app.vault.getResourcePath(file);

      cell.createDiv({
        cls: "zoommap-fa-picker-label",
        text: file.name.replace(/\.svg$/i, ""),
      });

      cell.onclick = () => {
        this.selected = file;

        if (this.selectedEl && this.selectedEl !== cell) {
          this.selectedEl.classList.remove("is-selected");
        }
        this.selectedEl = cell;
        cell.classList.add("is-selected");

        if (this.addButton) this.addButton.disabled = false;
      };
    }
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("zoommap-fa-picker");

    this.collectFiles();

    contentEl.createEl("h2", { text: "Pick SVG icon" });

    if (!Array.isArray(this.files) || this.files.length === 0) {
      contentEl.createEl("div", {
        text: "No SVG icons found in the configured folder.",
      });
      return;
    }

    const searchRow = contentEl.createDiv({ cls: "zoommap-fa-picker-search" });
    this.searchInput = searchRow.createEl("input", {
      type: "text",
      placeholder: "Search by name or path…",
    });

    this.listEl = contentEl.createDiv({ cls: "zoommap-fa-picker-list" });

    const footer = contentEl.createDiv({
      cls: "zoommap-fa-picker-footer zoommap-modal-footer",
    });

    this.addButton = footer.createEl("button", { text: "Add" });
    this.addButton.disabled = true;
    this.addButton.onclick = () => {
      if (!this.selected) return;
      this.onChoose(this.selected);
    };

    const backButton = footer.createEl("button", { text: "Back" });
    backButton.onclick = () => this.close();

    this.searchInput.addEventListener("input", () => {
      this.renderList(this.searchInput?.value ?? "");
    });

    this.renderList("");
  }

  onClose(): void {
    this.contentEl.empty();
    this.listEl = null;
    this.searchInput = null;
    this.files = [];
    this.selected = null;
    this.selectedEl = null;
    this.addButton = null;
  }
}