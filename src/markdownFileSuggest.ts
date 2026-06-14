import { FuzzySuggestModal } from "obsidian";
import type { App, TFile } from "obsidian";

type MarkdownFileChosenCallback = (file: TFile) => void;

export class MarkdownFileSuggestModal extends FuzzySuggestModal<TFile> {
  private appRef: App;
  private onChoose: MarkdownFileChosenCallback;
  private files: TFile[];

  constructor(app: App, onChoose: MarkdownFileChosenCallback) {
    super(app);
    this.appRef = app;
    this.onChoose = onChoose;
    this.files = this.appRef.vault
      .getFiles()
      .filter((f) => f.extension?.toLowerCase() === "md")
      .sort((a, b) => a.path.localeCompare(b.path));

    this.setPlaceholder("Choose note…");
  }

  getItems(): TFile[] {
    return this.files;
  }

  getItemText(item: TFile): string {
    return item.path;
  }

  onChooseItem(item: TFile): void {
    this.onChoose(item);
  }
}