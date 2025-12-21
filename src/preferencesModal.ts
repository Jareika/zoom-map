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

    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const closeBtn = footer.createEl("button", { text: "Close" });
    closeBtn.onclick = () => this.close();
  }

  onClose(): void {
    this.contentEl.empty();
  }
}