import { Modal, Setting } from "obsidian";
import type { App } from "obsidian";
import type ZoomMapPlugin from "./main";

export class PreferencesModal extends Modal {
  private plugin: ZoomMapPlugin;

  constructor(app: App, plugin: ZoomMapPlugin) {
    super(app);
    this.plugin = plugin;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Preferences" });

    // Session image cache
    contentEl.createEl("h3", { text: "Session image cache" });

    let mbInput: HTMLInputElement | null = null;
    let keepOverlayToggle: HTMLInputElement | null = null;
    let hybridToggle: HTMLInputElement | null = null;

    const applyEnabledState = () => {
      const on = !!this.plugin.settings.enableSessionImageCache;
      if (mbInput) mbInput.disabled = !on;
      if (keepOverlayToggle) keepOverlayToggle.disabled = !on;
      if (hybridToggle) hybridToggle.disabled = !on;
    };

    new Setting(contentEl)
      .setName("Enable session image cache")
      .setDesc("Caches decoded images across the entire Obsidian session (ref-counted, evicts only when near limit).")
      .addToggle((toggle) => {
        toggle.setValue(!!this.plugin.settings.enableSessionImageCache).onChange(async (value) => {
          this.plugin.settings.enableSessionImageCache = value;
          await this.plugin.saveSettings();
          applyEnabledState();
        });
      });

    new Setting(contentEl)
      .setName("Cache size in megabyte")
      .setDesc("Maximum memory used for cached decoded images. Default: 512 megabyte.")
      .addText((t) => {
        t.inputEl.type = "number";
        t.setValue(String(this.plugin.settings.sessionImageCacheMb ?? 512));
        mbInput = t.inputEl;
        t.onChange(async (v) => {
          const n = Number(String(v).replace(",", "."));
          if (!Number.isFinite(n) || n <= 0) return;
          this.plugin.settings.sessionImageCacheMb = Math.round(n);
          await this.plugin.saveSettings();
        });
      });

    new Setting(contentEl)
      .setName("Keep overlays loaded")
      .setDesc("When enabled, all overlays of an open map are kept in the session cache (even if hidden).")
      .addToggle((toggle) => {
        toggle.setValue(!!this.plugin.settings.keepOverlaysLoaded).onChange(async (value) => {
          this.plugin.settings.keepOverlaysLoaded = value;
          await this.plugin.saveSettings();
        });
        keepOverlayToggle = toggle.toggleEl as HTMLInputElement;
      });

    new Setting(contentEl)
      .setName("Hybrid render: canvas images + DOM markers")
      .setDesc("When enabled (and cache is enabled), maps will use canvas rendering for base/overlay images while markers stay DOM. Useful for fast image redraw on weaker devices.")
      .addToggle((toggle) => {
        toggle.setValue(!!this.plugin.settings.preferCanvasImagesWhenCaching).onChange(async (value) => {
          this.plugin.settings.preferCanvasImagesWhenCaching = value;
          await this.plugin.saveSettings();
        });
        hybridToggle = toggle.toggleEl as HTMLInputElement;
      });

    // Other preferences
    contentEl.createEl("h3", { text: "Other preferences" });

    new Setting(contentEl)
      .setName("Show linked file name on hover")
      .setDesc("Shows the linked note’s filename inside the map tooltip. Useful when linked notes are still empty.")
      .addToggle((toggle) => {
        toggle.setValue(!!this.plugin.settings.showLinkFileNameInTooltip).onChange(async (value) => {
          this.plugin.settings.showLinkFileNameInTooltip = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(contentEl)
      .setName("Middle click pins opens linked note in new tab")
      .setDesc("When enabled: middle click on a pin opens its linked note in a new tab.")
      .addToggle((toggle) => {
        toggle.setValue(!!this.plugin.settings.middleClickOpensLinkInNewTab).onChange(async (value) => {
          this.plugin.settings.middleClickOpensLinkInNewTab = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(contentEl)
      .setName("Max SVG raster scale")
      .setDesc("Controls the maximum raster lod for SVG base images. Higher = sharper at high zoom, but more RAM and slower upgrades.")
      .addDropdown((d) => {
        d.addOption("2", "2× (low-end)");
        d.addOption("4", "4× (balanced)");
        d.addOption("8", "8× (high quality)");
        const cur = String(this.plugin.settings.svgRasterMaxScale ?? 8);
        d.setValue(cur);
        d.onChange(async (v) => {
          const n = Number(v) as 2 | 4 | 8;
          this.plugin.settings.svgRasterMaxScale =
            n === 2 || n === 4 || n === 8 ? n : 8;
          await this.plugin.saveSettings();
        });
      });

    new Setting(contentEl)
      .setName("Settings UI: show preview for image icons")
      .setDesc("Shows a small preview thumbnail for non-SVG image icons in the icon library list.")
      .addToggle((toggle) => {
        toggle.setValue(!!this.plugin.settings.showImageIconPreviewInSettings).onChange(async (value) => {
          this.plugin.settings.showImageIconPreviewInSettings = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(contentEl)
      .setName("Enable text layers")
      .setDesc("Enables text boxes with baselines and inline typing on maps.")
      .addToggle((toggle) => {
        toggle.setValue(!!this.plugin.settings.enableTextLayers).onChange(async (value) => {
          this.plugin.settings.enableTextLayers = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(contentEl)
      .setName("Enable measure pro (terrain segments)")
      .setDesc("Allows assigning terrain factors per measurement segment for travel time.")
      .addToggle((toggle) => {
        toggle.setValue(!!this.plugin.settings.enableMeasurePro).onChange(async (value) => {
          this.plugin.settings.enableMeasurePro = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(contentEl)
      .setName('Pins: "scale like sticker" by default')
      .setDesc('When enabled, new pins will have "scale like sticker" enabled in the marker editor.')
      .addToggle((toggle) => {
        toggle.setValue(!!this.plugin.settings.defaultScaleLikeSticker).onChange(async (value) => {
          this.plugin.settings.defaultScaleLikeSticker = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(contentEl)
      .setName("Prefer first active layer for new markers")
      .setDesc("When enabled, markers default to the first visible unlocked layer, whether created or placed.")
      .addToggle((toggle) => {
        toggle.setValue(!!this.plugin.settings.preferActiveLayerInEditor).onChange(async (value) => {
          this.plugin.settings.preferActiveLayerInEditor = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(contentEl)
      .setName("Enable drawing tools")
      .setDesc("When enabled, the draw menu and draw layers become available on maps.")
      .addToggle((toggle) => {
        toggle.setValue(!!this.plugin.settings.enableDrawing).onChange(async (value) => {
          this.plugin.settings.enableDrawing = value;
          await this.plugin.saveSettings();
        });
      });

    // Second screen integration
    contentEl.createEl("h3", { text: "Second screen" });

    let folderInput: HTMLInputElement | null = null;
    const applySecondScreenState = () => {
      const on = !!this.plugin.settings.enableSecondScreen;
      if (folderInput) folderInput.disabled = !on;
    };

    new Setting(contentEl)
      .setName("Enable second screen integration")
      .setDesc('Enables "send to screen" integration with the plugin "ttrpg tools: screen display".')
      .addToggle((toggle) => {
        toggle.setValue(!!this.plugin.settings.enableSecondScreen).onChange(async (value) => {
          this.plugin.settings.enableSecondScreen = value;
          await this.plugin.saveSettings();
          applySecondScreenState();
        });
      });

    new Setting(contentEl)
      .setName("Second screen note folder")
      .setDesc("Folder where temporary map notes and marker snapshots for the second screen are written.")
      .addText((t) => {
        t.setPlaceholder("Zoommap/secondscreen");
        t.setValue(this.plugin.settings.secondScreenFolder ?? "ZoomMap/SecondScreen");
        folderInput = t.inputEl;
        t.onChange(async (v) => {
          this.plugin.settings.secondScreenFolder =
            v.trim() || "ZoomMap/SecondScreen";
          await this.plugin.saveSettings();
        });
      });

    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const closeBtn = footer.createEl("button", { text: "Close" });
    closeBtn.onclick = () => this.close();

    applyEnabledState();
    applySecondScreenState();
  }

  onClose(): void {
    this.contentEl.empty();
  }
}