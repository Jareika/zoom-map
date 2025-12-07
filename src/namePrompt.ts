import { Modal, Setting } from "obsidian";
import type { App } from "obsidian";

/* eslint-disable-next-line no-unused-vars */
type NamePromptCallback = (value: string) => void;

export class NamePromptModal extends Modal {
  private titleStr: string;
  private value: string;
  private onOk: NamePromptCallback;

  constructor(app: App, title: string, defaultName: string, onOk: NamePromptCallback) {
    super(app);
    this.titleStr = title;
    this.value = defaultName;
    this.onOk = onOk;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: this.titleStr });

    new Setting(contentEl)
      .setName("Name")
      .addText((t) => {
        t.setPlaceholder("Layer name");
        t.setValue(this.value);
        t.onChange((v) => (this.value = v));
      });

    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const ok = footer.createEl("button", { text: "Save" });
    const cancel = footer.createEl("button", { text: "Skip" });

    ok.onclick = () => { this.close(); this.onOk(this.value.trim()); };
    cancel.onclick = () => { this.close(); this.onOk(""); };
  }

  onClose(): void { this.contentEl.empty(); }
}