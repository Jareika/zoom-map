import { App, Modal, Setting } from "obsidian";
import type { Marker, MarkerFileData } from "./markerStore";
import type ZoomMapPlugin from "./main";

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

  constructor(app: App, plugin: ZoomMapPlugin, data: MarkerFileData, marker: Marker, onResult: (res: MarkerEditorResult) => void) {
    super(app);
    this.plugin = plugin;
    this.data = data;
    this.marker = { type: (marker.type ?? "pin"), ...marker };
    this.onResult = onResult;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: this.marker.type === "sticker" ? "Edit sticker" : "Edit marker" });

    // Link + Tooltip nur für Pins (Sticker ohne Tooltip/Popover)
    if (this.marker.type !== "sticker") {
      new Setting(contentEl)
        .setName("Link")
        .setDesc("Wiki link ([[Note]]) or path.")
        .addText(t => t
          .setPlaceholder("[[Note]] or path")
          .setValue(this.marker.link ?? "")
          .onChange(v => { this.marker.link = v.trim(); }));

      new Setting(contentEl)
        .setName("Tooltip")
        .addTextArea(a => {
          a.setPlaceholder("Optional tooltip text");
          a.inputEl.rows = 3;
          a.setValue(this.marker.tooltip ?? "");
          a.onChange(v => { this.marker.tooltip = v; });
        });
    }

    // Layer
    let newLayerName = "";
    new Setting(contentEl)
      .setName("Layer")
      .setDesc("Choose an existing layer or type a new name.")
      .addDropdown(d => {
        for (const l of this.data.layers) d.addOption(l.name, l.name);
        const current = this.data.layers.find(l => l.id === this.marker.layer)?.name ?? this.data.layers[0].name;
        d.setValue(current).onChange(v => {
          const lyr = this.data.layers.find(l => l.name === v);
          if (lyr) this.marker.layer = lyr.id;
        });
      })
      .addText(t => t
        .setPlaceholder("Create new layer (optional)")
        .onChange(v => { newLayerName = v.trim(); }));

    // Icon oder Sticker-Size
    if (this.marker.type === "sticker") {
      // Keine Image-Auswahl, nur Size
      new Setting(contentEl)
        .setName("Size")
        .addText(t => {
          t.setPlaceholder("64");
          t.setValue(String(this.marker.stickerSize ?? 64));
          t.onChange(v => {
            const n = Number(v);
            if (isFinite(n) && n > 0) { this.marker.stickerSize = Math.round(n); updatePreview(); }
          });
        });
    } else {
      new Setting(contentEl)
        .setName("Icon")
        .setDesc("Choose from Settings → Icons.")
        .addDropdown(d => {
          for (const icon of this.plugin.settings.icons) d.addOption(icon.key, icon.key);
          d.setValue(this.marker.iconKey ?? this.plugin.settings.defaultIconKey);
          d.onChange(v => { this.marker.iconKey = v; updatePreview(); });
        });
    }

    // Preview
    const preview = contentEl.createDiv({ attr: { style: "margin-top:8px; display:flex; align-items:center; gap:8px;" } });
    preview.createSpan({ text: "Preview:" });
    const img = preview.createEl("img");

    const resolvePreview = (): { url: string; size: number } => {
      if (this.marker.type === "sticker") {
        let url = this.marker.stickerPath ?? "";
        if (url && !url.startsWith("data:")) {
          const f = this.app.vault.getAbstractFileByPath(url);
          if ((f as any)?.extension) url = this.app.vault.getResourcePath(f as any);
        }
        const size = Math.max(1, Math.round(this.marker.stickerSize ?? 64));
        return { url, size };
      } else {
        const icon = this.plugin.settings.icons.find(i => i.key === (this.marker.iconKey ?? this.plugin.settings.defaultIconKey))
          ?? this.plugin.builtinIcon();
        let url = icon.pathOrDataUrl;
        if (!url.startsWith("data:")) {
          const f = this.app.vault.getAbstractFileByPath(url);
          if ((f as any)?.extension) url = this.app.vault.getResourcePath(f as any);
        }
        return { url, size: icon.size };
      }
    };

    const updatePreview = () => {
      const { url, size } = resolvePreview();
      img.src = url || "";
      img.style.width = img.style.height = `${size}px`;
    };
    updatePreview();

    // Buttons
    const footer = contentEl.createDiv({ attr: { style: "display:flex; gap:8px; justify-content:flex-end; margin-top:12px;" } });
    const btnSave = footer.createEl("button", { text: "Save" });
    const btnDelete = footer.createEl("button", { text: this.marker.type === "sticker" ? "Delete sticker" : "Delete marker" });
    const btnCancel = footer.createEl("button", { text: "Cancel" });

    btnSave.addEventListener("click", () => {
      let dataChanged = false;
      if (newLayerName) {
        const exists = this.data.layers.find(l => l.name === newLayerName);
        if (!exists) {
          const id = `layer_${Math.random().toString(36).slice(2,8)}`;
          this.data.layers.push({ id, name: newLayerName, visible: true });
          this.marker.layer = id;
          dataChanged = true;
        }
      }
      this.close();
      this.onResult({ action: "save", marker: this.marker, dataChanged });
    });

    btnDelete.addEventListener("click", () => { this.close(); this.onResult({ action: "delete" }); });
    btnCancel.addEventListener("click", () => { this.close(); this.onResult({ action: "cancel" }); });
  }

  onClose(): void { this.contentEl.empty(); }
}