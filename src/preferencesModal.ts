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
      .setName('Pins: "scale like sticker" by default')
      .setDesc('When enabled, new pins will have "scale like sticker" enabled in the marker editor.')
      .addToggle((toggle) => {
        toggle
          .setValue(!!this.plugin.settings.defaultScaleLikeSticker)
          .onChange(async (value) => {
            this.plugin.settings.defaultScaleLikeSticker = value;
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