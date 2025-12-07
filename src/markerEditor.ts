import { Modal, Setting, TFile } from "obsidian";
import type { App, TextComponent } from "obsidian";
import type { Marker, MarkerFileData } from "./markerStore";
import type ZoomMapPlugin from "./main";

interface LinkSuggestion {
  label: string;
  value: string;
}

export interface MarkerEditorResult {
  action: "save" | "delete" | "cancel";
  marker?: Marker;
  dataChanged?: boolean;
}

/* eslint-disable-next-line no-unused-vars */
type MarkerEditorCallback = (result: MarkerEditorResult) => void;

export class MarkerEditorModal extends Modal {
  private plugin: ZoomMapPlugin;
  private data: MarkerFileData;
  private marker: Marker;
  private onResult: MarkerEditorCallback;

  private linkInput?: TextComponent;

  private suggestionsEl: HTMLDivElement | null = null;
  private allSuggestions: LinkSuggestion[] = [];
  private filteredSuggestions: LinkSuggestion[] = [];
  private selectedSuggestionIndex = -1;

  constructor(
    app: App,
    plugin: ZoomMapPlugin,
    data: MarkerFileData,
    marker: Marker,
    onResult: MarkerEditorCallback,
  ) {
    super(app);
    this.plugin = plugin;
    this.data = data;
    this.marker = { type: marker.type ?? "pin", ...marker };
    this.onResult = onResult;
  }

  private buildLinkSuggestions(): void {
    const files = this.app.vault.getFiles().filter((f) => f.extension?.toLowerCase() === "md");
    const suggestions: LinkSuggestion[] = [];

    const active = this.app.workspace.getActiveFile();
    const fromPath = active?.path ?? files[0]?.path ?? "";

    for (const file of files) {
      const baseLink = this.app.metadataCache.fileToLinktext(file, fromPath);

      // Basis: nur die Note
      suggestions.push({
        label: baseLink,
        value: baseLink,
      });

      // Überschriften
      const cache = this.app.metadataCache.getCache(file.path);
      const headings = cache?.headings ?? [];
      for (const h of headings) {
        const headingName = h.heading;
        const full = `${baseLink}#${headingName}`;
        suggestions.push({
          label: `${baseLink} › ${headingName}`,
          value: full,
        });
      }
    }

    this.allSuggestions = suggestions;
  }

  private updateLinkSuggestions(input: string): void {
    if (!this.suggestionsEl) return;

    const query = input.trim().toLowerCase();
    this.suggestionsEl.empty();
    this.filteredSuggestions = [];
    this.selectedSuggestionIndex = -1;

    if (!query) {
      this.suggestionsEl.style.display = "none";
      return;
    }

    const maxItems = 20;
    const matches = this.allSuggestions
      .filter((s) =>
        s.value.toLowerCase().includes(query) ||
        s.label.toLowerCase().includes(query),
      )
      .slice(0, maxItems);

    if (matches.length === 0) {
      this.suggestionsEl.style.display = "none";
      return;
    }

    this.filteredSuggestions = matches;
    this.suggestionsEl.style.display = "";

    matches.forEach((s, i) => {
      const row = this.suggestionsEl!.createDiv({ cls: "zoommap-link-suggestion-item" });
      row.setText(s.label);
      if (i === 0) {
        row.classList.add("is-selected");
        this.selectedSuggestionIndex = 0;
      }
      row.addEventListener("mousedown", (ev) => {
        // mousedown statt click, damit blur des Inputs nicht vorher feuert
        ev.preventDefault();
        this.applyLinkSuggestion(i);
      });
    });
  }

  private hideLinkSuggestions(): void {
    if (!this.suggestionsEl) return;
    this.suggestionsEl.style.display = "none";
    this.suggestionsEl.empty();
    this.filteredSuggestions = [];
    this.selectedSuggestionIndex = -1;
  }

  private moveLinkSuggestionSelection(delta: number): void {
    if (!this.suggestionsEl) return;
    const n = this.filteredSuggestions.length;
    if (n === 0) return;

    let idx = this.selectedSuggestionIndex;
    if (idx < 0) idx = 0;
    idx = (idx + delta + n) % n;
    this.selectedSuggestionIndex = idx;

    const rows = this.suggestionsEl.querySelectorAll<HTMLDivElement>(".zoommap-link-suggestion-item");
    rows.forEach((row, i) => {
      if (i === idx) row.classList.add("is-selected");
      else row.classList.remove("is-selected");
    });

    const sel = rows[idx];
    if (sel) sel.scrollIntoView({ block: "nearest" });
  }

  private applyLinkSuggestion(index: number): void {
    if (!this.linkInput) return;
    if (index < 0 || index >= this.filteredSuggestions.length) return;

    const s = this.filteredSuggestions[index];
    this.linkInput.setValue(s.value);
    this.marker.link = s.value;
    this.hideLinkSuggestions();

    // Fokus zurück auf das Eingabefeld
    this.linkInput.inputEl.focus();
    const len = s.value.length;
    this.linkInput.inputEl.setSelectionRange(len, len);
  }
  
  private zoomFactorToPercentString(f?: number): string {
    if (typeof f !== "number" || !Number.isFinite(f) || f <= 0) return "";
    return String(Math.round(f * 100));
  }

  private parseZoomPercentInput(input: string): number | undefined {
    let s = input.trim();
    if (!s) return undefined;
    if (s.endsWith("%")) s = s.slice(0, -1).trim();
    s = s.replace(",", ".");
    const n = Number(s);
    if (!Number.isFinite(n) || n <= 0) return undefined;
    return n / 100;
  }

  private normalizeZoomRange(): void {
    let min = this.marker.minZoom;
    let max = this.marker.maxZoom;

    if (typeof min !== "number" || !Number.isFinite(min) || min <= 0) {
      min = undefined;
    }
    if (typeof max !== "number" || !Number.isFinite(max) || max <= 0) {
      max = undefined;
    }

    if (min === undefined && max === undefined) {
      delete this.marker.minZoom;
      delete this.marker.maxZoom;
      return;
    }

    if (min !== undefined && max !== undefined && min > max) {
      const tmp = min;
      min = max;
      max = tmp;
    }

    if (min !== undefined) this.marker.minZoom = min;
    else delete this.marker.minZoom;

    if (max !== undefined) this.marker.maxZoom = max;
    else delete this.marker.maxZoom;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: this.marker.type === "sticker" ? "Edit sticker" : "Edit marker" });

    if (this.marker.type !== "sticker") {
      const linkSetting = new Setting(contentEl)
        .setName("Link")
        .setDesc("Wiki link (without [[ ]]). Supports note and note#heading.");

      linkSetting.addText((t) => {
        this.linkInput = t;
        t.setPlaceholder("Folder/note or note#heading")
          .setValue(this.marker.link ?? "")
          .onChange((v) => {
            this.marker.link = v.trim();
            this.updateLinkSuggestions(v);
          });

        const wrapper = t.inputEl.parentElement;
        if (wrapper instanceof HTMLElement) {
          wrapper.classList.add("zoommap-link-input-wrapper");
          this.suggestionsEl = wrapper.createDiv({ cls: "zoommap-link-suggestions" });
          this.suggestionsEl.style.display = "none";
        }

        this.buildLinkSuggestions();

        t.inputEl.addEventListener("keydown", (ev) => {
          if (!this.suggestionsEl || this.suggestionsEl.style.display === "none") return;

          if (ev.key === "ArrowDown") {
            ev.preventDefault();
            this.moveLinkSuggestionSelection(1);
          } else if (ev.key === "ArrowUp") {
            ev.preventDefault();
            this.moveLinkSuggestionSelection(-1);
          } else if (ev.key === "Enter") {
            if (this.selectedSuggestionIndex >= 0) {
              ev.preventDefault();
              this.applyLinkSuggestion(this.selectedSuggestionIndex);
            }
          } else if (ev.key === "Escape") {
            this.hideLinkSuggestions();
          }
        });

        t.inputEl.addEventListener("blur", () => {
          window.setTimeout(() => this.hideLinkSuggestions(), 150);
        });
      });

      new Setting(contentEl)
        .setName("Tooltip")
        .addTextArea((a) => {
          a.setPlaceholder("Optional tooltip text");
          a.inputEl.rows = 3;
          a.setValue(this.marker.tooltip ?? "");
          a.onChange((v) => { this.marker.tooltip = v; });
        });

      // Zoom range (optional)
      const zoomRow = new Setting(contentEl)
        .setName("Zoom range (optional)")
        .setDesc("(in %)");

      zoomRow.addText((t) => {
        t.setPlaceholder("Min (%)");
        t.setValue(this.zoomFactorToPercentString(this.marker.minZoom));
        t.onChange((v) => {
          const factor = this.parseZoomPercentInput(v);
          if (typeof factor === "number") this.marker.minZoom = factor;
          else delete this.marker.minZoom;
        });
      });

      zoomRow.addText((t) => {
        t.setPlaceholder("Max (%)");
        t.setValue(this.zoomFactorToPercentString(this.marker.maxZoom));
        t.onChange((v) => {
          const factor = this.parseZoomPercentInput(v);
          if (typeof factor === "number") this.marker.maxZoom = factor;
          else delete this.marker.maxZoom;
        });
      });

      new Setting(contentEl)
        .setName("Scale like sticker")
        .setDesc("Pin scales with the map (no inverse wrapper).")
        .addToggle((tg) => {
          tg.setValue(!!this.marker.scaleLikeSticker).onChange((on) => {
            if (on) this.marker.scaleLikeSticker = true;
            else delete this.marker.scaleLikeSticker;
          });
        });
    }

    // Layer
    let newLayerName = "";
    new Setting(contentEl)
      .setName("Layer")
      .setDesc("Choose an existing layer or type a new name.")
      .addDropdown((d) => {
        for (const l of this.data.layers) d.addOption(l.name, l.name);
        const current = this.data.layers.find((l) => l.id === this.marker.layer)?.name ?? this.data.layers[0].name;
        d.setValue(current).onChange((v) => {
          const lyr = this.data.layers.find((l) => l.name === v);
          if (lyr) this.marker.layer = lyr.id;
        });
      })
      .addText((t) => t.setPlaceholder("Create new layer (optional)").onChange((v) => { newLayerName = v.trim(); }));

    // Icon or Sticker size
    if (this.marker.type === "sticker") {
	  new Setting(contentEl).setName("Size").addText((t) => {
		t.setPlaceholder("64");
		t.setValue(String(this.marker.stickerSize ?? 64));
		t.onChange((v) => {
		  const n = Number(v);
		  if (Number.isFinite(n) && n > 0) {
			this.marker.stickerSize = Math.round(n);
			updatePreview(); // OPTIONAL: auch bei Größenänderung aktualisieren
		  }
		});
	  });
	} else {
	  new Setting(contentEl)
		.setName("Icon")
		.setDesc("To set up new go to settings.")
		.addDropdown((d) => {
		  for (const icon of this.plugin.settings.icons) d.addOption(icon.key, icon.key);
		  d.setValue(this.marker.iconKey ?? this.plugin.settings.defaultIconKey);
		  d.onChange((v) => {
			this.marker.iconKey = v;
			updatePreview(); // WICHTIG: Vorschau neu laden
		  });
		});
	}

    // Preview
    const preview = contentEl.createDiv({ cls: "zoommap-modal-preview" });
    preview.createSpan({ text: "Preview:" });
    const img = preview.createEl("img");

    const resolvePreview = (): { url: string; size: number } => {
      if (this.marker.type === "sticker") {
        let url = this.marker.stickerPath ?? "";
        if (url && !url.startsWith("data:")) {
          const file = this.app.vault.getAbstractFileByPath(url);
          if (file instanceof TFile) url = this.app.vault.getResourcePath(file);
        }
        const size = Math.max(1, Math.round(this.marker.stickerSize ?? 64));
        return { url, size };
      }

      const icon = this.plugin.settings.icons.find((i) => i.key === (this.marker.iconKey ?? this.plugin.settings.defaultIconKey))
        ?? this.plugin.builtinIcon();

      let url = icon.pathOrDataUrl;
      if (url && !url.startsWith("data:")) {
        const file = this.app.vault.getAbstractFileByPath(url);
        if (file instanceof TFile) url = this.app.vault.getResourcePath(file);
      }
      return { url, size: icon.size };
    };

    const updatePreview = () => {
      const { url, size } = resolvePreview();
      img.src = url || "";
      img.style.width = `${size}px`;
      img.style.height = `${size}px`;
    };
    updatePreview();

    // Footer
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const btnSave = footer.createEl("button", { text: "Save" });
    const btnDelete = footer.createEl("button", { text: this.marker.type === "sticker" ? "Delete sticker" : "Delete marker" });
    const btnCancel = footer.createEl("button", { text: "Cancel" });

    btnSave.addEventListener("click", () => {
      let dataChanged = false;
      if (newLayerName) {
        const exists = this.data.layers.find((l) => l.name === newLayerName);
        if (!exists) {
          const id = `layer_${Math.random().toString(36).slice(2, 8)}`;
          this.data.layers.push({ id, name: newLayerName, visible: true });
          this.marker.layer = id;
          dataChanged = true;
        }
      }

      if (this.marker.type !== "sticker") {
        this.normalizeZoomRange();

        if (typeof this.marker.minZoom !== "number") delete this.marker.minZoom;
        if (typeof this.marker.maxZoom !== "number") delete this.marker.maxZoom;
        if (!this.marker.scaleLikeSticker) delete this.marker.scaleLikeSticker;
      }

      this.close();
      this.onResult({ action: "save", marker: this.marker, dataChanged });
    });

    btnDelete.addEventListener("click", () => {
      this.close();
      this.onResult({ action: "delete" });
    });

    btnCancel.addEventListener("click", () => {
      this.close();
      this.onResult({ action: "cancel" });
    });
  }

  onClose(): void {
    this.contentEl.empty();
  }
}