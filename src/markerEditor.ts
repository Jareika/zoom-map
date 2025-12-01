import { Modal, Setting, FuzzySuggestModal, TFile } from "obsidian";
import type { App, TextComponent } from "obsidian";
import type { Marker, MarkerFileData } from "./markerStore";
import type ZoomMapPlugin from "./main";

class NoteSuggestModal extends FuzzySuggestModal<TFile> {
  private appRef: App;
  private onChooseCb: (file: TFile) => void;
  private files: TFile[];

  constructor(app: App, onChoose: (file: TFile) => void) {
    super(app);
    this.appRef = app;
    this.onChooseCb = onChoose;
    this.files = this.appRef.vault.getFiles().filter((f) => f.extension?.toLowerCase() === "md");
    this.setPlaceholder("Choose note…");
  }

  getItems(): TFile[] { return this.files; }
  getItemText(item: TFile): string { return item.path; }
  onChooseItem(item: TFile): void { this.onChooseCb(item); }
}

export interface MarkerEditorResult {
  action: "save" | "delete" | "cancel";
  marker?: Marker;
  dataChanged?: boolean;
}

export class MarkerEditorModal extends Modal {
  private plugin: ZoomMapPlugin;
  private data: MarkerFileData;
  private marker: Marker;
  private onResult: (res: MarkerEditorResult) => void;

  private linkInput?: TextComponent;

  constructor(
    app: App,
    plugin: ZoomMapPlugin,
    data: MarkerFileData,
    marker: Marker,
    onResult: (res: MarkerEditorResult) => void,
  ) {
    super(app);
    this.plugin = plugin;
    this.data = data;
    this.marker = { type: marker.type ?? "pin", ...marker };
    this.onResult = onResult;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: this.marker.type === "sticker" ? "Edit sticker" : "Edit marker" });

    if (this.marker.type !== "sticker") {
      new Setting(contentEl)
        .setName("Link")
        .setDesc("Wiki link note (without [[ ]]).")
        .addText((t) => {
          this.linkInput = t;
          t.setPlaceholder("Folder/Note")
            .setValue(this.marker.link ?? "")
            .onChange((v) => { this.marker.link = v.trim(); });
        })
        .addButton((b) =>
          b.setButtonText("Pick…").onClick(() => {
            new NoteSuggestModal(this.app, (file: TFile) => {
              const fromPath = this.app.workspace.getActiveFile()?.path ?? file.path;
              const rel = this.app.metadataCache.fileToLinktext(file, fromPath);
              this.marker.link = rel;
              this.linkInput?.setValue(rel);
            }).open();
          }),
        );

      new Setting(contentEl)
        .setName("Tooltip")
        .addTextArea((a) => {
          a.setPlaceholder("Optional tooltip text");
          a.inputEl.rows = 3;
          a.setValue(this.marker.tooltip ?? "");
          a.onChange((v) => { this.marker.tooltip = v; });
        });

      // Zoom range (optional)
      const zoomRow = new Setting(contentEl).setName("Zoom range (optional)");
      zoomRow.addText((t) => {
        t.setPlaceholder("Min (e.g. 0.5)");
        t.setValue(typeof this.marker.minZoom === "number" ? String(this.marker.minZoom) : "");
        t.onChange((v) => {
          const n = Number(v);
          if (!Number.isFinite(n)) delete this.marker.minZoom;
          else this.marker.minZoom = n;
        });
      });
      zoomRow.addText((t) => {
        t.setPlaceholder("Max (e.g. 3)");
        t.setValue(typeof this.marker.maxZoom === "number" ? String(this.marker.maxZoom) : "");
        t.onChange((v) => {
          const n = Number(v);
          if (!Number.isFinite(n)) delete this.marker.maxZoom;
          else this.marker.maxZoom = n;
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
          if (Number.isFinite(n) && n > 0) this.marker.stickerSize = Math.round(n);
        });
      });
    } else {
      new Setting(contentEl)
        .setName("Icon")
        .setDesc("To set up new go to settings.")
        .addDropdown((d) => {
          for (const icon of this.plugin.settings.icons) d.addOption(icon.key, icon.key);
          d.setValue(this.marker.iconKey ?? this.plugin.settings.defaultIconKey);
          d.onChange((v) => { this.marker.iconKey = v; });
        });
    }

    // Preview
    const preview = contentEl.createDiv({
      attr: { style: "margin-top:8px; display:flex; align-items:center; gap:8px; flex-wrap:wrap;" },
    });
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
    const footer = contentEl.createDiv({
      attr: { style: "display:flex; gap:8px; justify-content:flex-end; margin-top:12px; flex-wrap:wrap;" },
    });
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

      // JSON schlank halten
      if (this.marker.type !== "sticker") {
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