import { App, Modal, Setting } from "obsidian";

export class NamePromptModal extends Modal {
  private title: string;
  private value: string;
  private onOk: (name: string) => void;

  constructor(app: App, title: string, defaultName: string, onOk: (name: string) => void) {
    super(app);
    this.title = title;
    this.value = defaultName;
    this.onOk = onOk;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: this.title });

    new Setting(contentEl)
      .setName("Name")
      .addText((t) => {
        t.setPlaceholder("Layer name");
        t.setValue(this.value);
        t.onChange((v) => (this.value = v));
      });

    const footer = contentEl.createDiv({ attr: { style: "display:flex; gap:8px; justify-content:flex-end; margin-top:12px;" } });
    const ok = footer.createEl("button", { text: "Save" });
    const cancel = footer.createEl("button", { text: "Skip" });

    ok.onclick = () => { this.close(); this.onOk(this.value.trim()); };
    cancel.onclick = () => { this.close(); this.onOk(""); };
  }

  onClose(): void { this.contentEl.empty(); }
}