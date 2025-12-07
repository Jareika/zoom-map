import { FuzzySuggestModal } from "obsidian";
import type { App, TFile } from "obsidian";

// Callback used when an image file has been chosen.
/* eslint-disable-next-line no-unused-vars */
type ImageFileChosenCallback = (file: TFile) => void;

export class ImageFileSuggestModal extends FuzzySuggestModal<TFile> {
  private appRef: App;
  private onChoose: ImageFileChosenCallback;
  private files: TFile[];

  constructor(app: App, onChoose: ImageFileChosenCallback) {
    super(app);
    this.appRef = app;
    this.onChoose = onChoose;
    const exts = new Set(["png", "jpg", "jpeg", "gif", "svg", "webp"]);
    this.files = this.appRef.vault.getFiles().filter((f) => {
      const m = f.extension?.toLowerCase();
      return exts.has(m);
    });
    this.setPlaceholder("Choose image file…");
  }

  getItems(): TFile[] { return this.files; }
  getItemText(item: TFile): string { return item.path; }
  onChooseItem(item: TFile): void { this.onChoose(item); }
}