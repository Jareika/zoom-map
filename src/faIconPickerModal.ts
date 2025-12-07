import { Modal, normalizePath, TFolder, TFile } from "obsidian";
import type { App } from "obsidian";

// Callback used when an icon has been chosen.
/* eslint-disable-next-line no-unused-vars */
type FaIconPickerCallback = (file: TFile) => void;

export class FaIconPickerModal extends Modal {
  private folder: string;
  private onChoose: FaIconPickerCallback;
  private files: TFile[] = [];
  private listEl: HTMLDivElement | null = null;
  private searchInput: HTMLInputElement | null = null;

  constructor(app: App, folder: string, onChoose: FaIconPickerCallback) {
    super(app);
    this.folder = normalizePath(folder);
    this.onChoose = onChoose;
  }

  private collectFiles(): void {
    this.files = [];

    const root = this.app.vault.getAbstractFileByPath(this.folder);
    if (!(root instanceof TFolder)) {
      console.warn(`Zoom Map: Font Awesome folder not found: ${this.folder}`);
      return;
    }

    const out: TFile[] = [];
    const stack: TFolder[] = [root];

    while (stack.length > 0) {
      const current = stack.pop()!;
      for (const child of current.children) {
        if (child instanceof TFolder) {
          stack.push(child);
        } else if (child instanceof TFile) {
          if (child.extension?.toLowerCase() === "svg") {
            out.push(child);
          }
        }
      }
    }

    out.sort((a, b) => a.path.localeCompare(b.path));
    this.files = out;
  }

  private renderList(filter: string): void {
    if (!this.listEl) return;
    this.listEl.empty();

    const q = filter.trim().toLowerCase();
    const matches = this.files.filter((f) => {
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

    const grid = this.listEl.createDiv();
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(120px, 1fr))";
    grid.style.gap = "6px";

    for (const file of matches) {
      const cell = grid.createDiv();
      cell.style.display = "flex";
      cell.style.flexDirection = "column";
      cell.style.alignItems = "center";
      cell.style.gap = "4px";
      cell.style.padding = "4px";
      cell.style.borderRadius = "4px";
      cell.style.border = "1px solid var(--background-modifier-border)";
      cell.style.cursor = "pointer";

      const img = cell.createEl("img");
      img.src = this.app.vault.getResourcePath(file);
      img.style.width = "24px";
      img.style.height = "24px";
      img.style.objectFit = "contain";

      const label = cell.createEl("div", {
        text: file.name.replace(/\.svg$/i, ""),
      });
      label.style.fontSize = "11px";
      label.style.textAlign = "center";
      label.style.wordBreak = "break-word";

      cell.onclick = () => {
        this.close();
        this.onChoose(file);
      };
    }
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();

    this.collectFiles();

    contentEl.createEl("h2", { text: "Pick font awesome icon" });

    if (this.files.length === 0) {
      contentEl.createEl("div", {
        text: "No SVG icons found. Place font awesome free SVG files into the configured folder.",
      });
      return;
    }

    const searchRow = contentEl.createDiv();
    searchRow.style.marginBottom = "8px";

    this.searchInput = searchRow.createEl("input", {
      type: "text",
      placeholder: "Search by name or path…",
    });
    this.searchInput.style.width = "100%";

    this.listEl = contentEl.createDiv();
    this.listEl.style.maxHeight = "340px";
    this.listEl.style.overflow = "auto";

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
  }
}