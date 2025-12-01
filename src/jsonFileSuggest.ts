import { FuzzySuggestModal } from "obsidian";
import type { App, TFile } from "obsidian";

export class JsonFileSuggestModal extends FuzzySuggestModal<TFile> {
  private appRef: App;
  private onChoose: (file: TFile) => void;
  private files: TFile[];

  constructor(app: App, onChoose: (file: TFile) => void) {
    super(app);
    this.appRef = app;
    this.onChoose = onChoose;
    this.files = this.appRef.vault.getFiles().filter((f) => f.extension?.toLowerCase() === "json");
    this.setPlaceholder("Choose JSON file…");
  }

  getItems(): TFile[] { return this.files; }
  getItemText(item: TFile): string { return item.path; }
  onChooseItem(item: TFile): void { this.onChoose(item); }
}