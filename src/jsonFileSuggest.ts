import { FuzzySuggestModal } from "obsidian";
import type { App, TFile } from "obsidian";

// Callback used when a JSON file has been chosen.
/* eslint-disable-next-line no-unused-vars */
type JsonFileChosenCallback = (file: TFile) => void;

export class JsonFileSuggestModal extends FuzzySuggestModal<TFile> {
  private appRef: App;
  private onChoose: JsonFileChosenCallback;
  private files: TFile[];

  constructor(app: App, onChoose: JsonFileChosenCallback) {
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