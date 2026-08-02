import { Modal, normalizePath, TFolder, TFile } from "obsidian";
import type { App } from "obsidian";

type FaIconPickerCallback = (file: TFile) => void;

export class FaIconPickerModal extends Modal {
  private folder: string;
  private onChoose: FaIconPickerCallback;
  private files: TFile[] = [];
  private currentMatches: TFile[] = [];

  private listEl: HTMLDivElement | null = null;
  private gridEl: HTMLDivElement | null = null;
  private statusEl: HTMLDivElement | null = null;
  private searchInput: HTMLInputElement | null = null;

  private selected: TFile | null = null;
  private selectedEl: HTMLDivElement | null = null;
  private addButton: HTMLButtonElement | null = null;
  
  private renderedCount = 0;
  private desiredRenderCount = 0;
  private renderToken = 0;
  private isRendering = false;
  private searchDebounceTimer: number | null = null;
  private currentQuery = "";

  private readonly initialVisibleLimit = 30;
  private readonly scrollLoadStep = 30;
  private readonly renderChunkSize = 12;
  private readonly debounceMs = 180;
  private readonly scrollThresholdPx = 120;

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

  private getMatches(filter: string): TFile[] {
    const q = filter.trim().toLowerCase();
    const files = Array.isArray(this.files) ? this.files : [];

    const matches = files.filter((f) => {
      if (!q) return true;
      const name = f.name.toLowerCase();
      const path = f.path.toLowerCase();
      return name.includes(q) || path.includes(q);
    });

    return matches;
  }

  private scheduleRender(filter: string): void {
    if (this.searchDebounceTimer !== null) {
      window.clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = null;
    }

    this.searchDebounceTimer = window.setTimeout(() => {
      this.searchDebounceTimer = null;
      this.renderList(filter);
    }, this.debounceMs);
  }

  private renderList(filter: string): void {
    if (!this.listEl) return;

    this.currentQuery = filter.trim();
    this.currentMatches = this.getMatches(this.currentQuery);

    this.renderToken += 1;
    this.renderedCount = 0;
    this.desiredRenderCount = 0;
    this.isRendering = false;
    this.gridEl = null;
    this.statusEl = null;

    this.listEl.empty();

    const selectedStillVisible =
      this.selected !== null &&
      this.currentMatches.some((f) => f.path === this.selected?.path);

    if (!selectedStillVisible) {
      this.selected = null;
      if (this.addButton) this.addButton.disabled = true;
    } else if (this.addButton) {
      this.addButton.disabled = false;
    }

    if (this.selectedEl) {
      this.selectedEl.classList.remove("is-selected");
    }
    this.selectedEl = null;

    if (this.currentMatches.length === 0) {
      this.listEl.createEl("div", {
        text: "No SVG icons found in this folder.",
      });
      return;
    }

    this.statusEl = this.listEl.createDiv({ cls: "zoommap-muted" });
    this.gridEl = this.listEl.createDiv({ cls: "zoommap-fa-picker-grid" });

    this.updateStatus();
    this.queueRenderTo(this.initialVisibleLimit);
  }

  private updateStatus(): void {
    if (!this.statusEl) return;

    const total = this.currentMatches.length;
    const rendered = this.renderedCount;
    const searching = this.currentQuery.length > 0;

    if (rendered < total) {
      this.statusEl.setText(
        searching
          ? `Showing ${rendered} of ${total} search results. Scroll to load more.`
          : `Showing ${rendered} of ${total} icons. Scroll to load more or use search.`,
      );
      return;
    }

    this.statusEl.setText(
      searching ? `Showing ${total} search results.` : `Showing ${total} icons.`,
    );
  }

  private queueRenderTo(targetCount: number): void {
    this.desiredRenderCount = Math.min(
      this.currentMatches.length,
      Math.max(this.desiredRenderCount, targetCount),
    );

    if (!this.gridEl || this.isRendering) return;

    this.isRendering = true;
    const token = this.renderToken;

    const step = () => {
      if (token !== this.renderToken) {
        this.isRendering = false;
        return;
      }
      if (!this.gridEl) {
        this.isRendering = false;
        return;
      }

      const maxTarget = Math.min(this.desiredRenderCount, this.currentMatches.length);
      const end = Math.min(this.renderedCount + this.renderChunkSize, maxTarget);

      for (let i = this.renderedCount; i < end; i += 1) {
        this.appendCell(this.currentMatches[i]);
      }

      this.renderedCount = end;
      this.updateStatus();

      if (this.renderedCount < maxTarget) {
        window.requestAnimationFrame(step);
        return;
      }

      this.isRendering = false;
      this.maybeLoadMoreFromScroll();
    };

    window.requestAnimationFrame(step);
  }

  private appendCell(file: TFile): void {
    if (!this.gridEl) return;

    const cell = this.gridEl.createDiv({ cls: "zoommap-fa-picker-cell" });

    const img = cell.createEl("img", { cls: "zoommap-fa-picker-icon" });
    img.decoding = "async";
    img.loading = "lazy";
    img.src = this.app.vault.getResourcePath(file);

    cell.createDiv({
      cls: "zoommap-fa-picker-label",
      text: file.name.replace(/\.svg$/i, ""),
    });

    if (this.selected && this.selected.path === file.path) {
      this.selectedEl = cell;
      cell.classList.add("is-selected");
    }

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

  private maybeLoadMoreFromScroll(): void {
    if (!this.listEl) return;
    if (this.currentMatches.length === 0) return;
    if (this.desiredRenderCount >= this.currentMatches.length) return;

    const nearBottom =
      this.listEl.scrollTop + this.listEl.clientHeight >=
      this.listEl.scrollHeight - this.scrollThresholdPx;

    if (!nearBottom) return;

    this.queueRenderTo(this.desiredRenderCount + this.scrollLoadStep);
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

    this.listEl.addEventListener("scroll", () => {
      this.maybeLoadMoreFromScroll();
    });

    const footer = contentEl.createDiv({
      cls: "zoommap-fa-picker-footer zoommap-modal-footer",
    });

    this.addButton = footer.createEl("button", { text: "Add" });
    this.addButton.disabled = true;
	this.addButton.textContent = "Add";
    this.addButton.onclick = () => {
      if (!this.selected) return;
      this.onChoose(this.selected);
    };

    const backButton = footer.createEl("button", { text: "Back" });
    backButton.onclick = () => this.close();

    this.searchInput.addEventListener("input", () => {
      this.scheduleRender(this.searchInput?.value ?? "");
    });

    this.renderList("");
  }

  onClose(): void {
    this.contentEl.empty();
    if (this.searchDebounceTimer !== null) {
      window.clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = null;
    }
    this.renderToken += 1;
    this.listEl = null;
    this.gridEl = null;
    this.statusEl = null;
    this.searchInput = null;
    this.files = [];
	this.currentMatches = []
    this.selected = null;
    this.selectedEl = null;
    this.addButton = null;
	this.isRendering = false;
  }
}