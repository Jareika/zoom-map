import { FuzzySuggestModal, TFolder } from "obsidian";
import type { App } from "obsidian";

type FolderChosenCallback = (folder: TFolder) => void;

export class FolderSuggestModal extends FuzzySuggestModal<TFolder> {
  private appRef: App;
  private onChoose: FolderChosenCallback;
  private folders: TFolder[];

  constructor(app: App, onChoose: FolderChosenCallback) {
    super(app);
    this.appRef = app;
    this.onChoose = onChoose;
    this.folders = this.appRef.vault
      .getAllLoadedFiles()
      .filter((f): f is TFolder => f instanceof TFolder)
      .sort((a, b) => a.path.localeCompare(b.path));

    this.setPlaceholder("Choose folder…");
  }

  getItems(): TFolder[] {
    return this.folders;
  }

  getItemText(item: TFolder): string { return item.path; }
  onChooseItem(item: TFolder): void { this.onChoose(item); }
}