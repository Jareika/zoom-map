import { FuzzySuggestModal } from "obsidian";
import type { App, TFile } from "obsidian";

// Callback used when an image file or URL has been chosen.
type ImageSourceChosenCallback = (pathOrUrl: string) => void;

export class ImageFileSuggestModal extends FuzzySuggestModal<TFile | string> {
  private appRef: App;
  private onChoose: ImageSourceChosenCallback;
  private files: TFile[];
  private urlEntry: string | null = null;

  constructor(app: App, onChoose: ImageSourceChosenCallback) {
    super(app);
    this.appRef = app;
    this.onChoose = onChoose;
    const exts = new Set(["png", "jpg", "jpeg", "gif", "svg", "webp"]);
    this.files = this.appRef.vault.getFiles().filter((f) => {
      const m = f.extension?.toLowerCase();
      return exts.has(m);
    });
    this.setPlaceholder("Choose image file or paste URL (http:// or https://)…");
  }

  getItems(): (TFile | string)[] {
    // If input looks like a URL, show it as an option
    const input = this.inputEl.value.trim();
    if (/^https?:\/\//i.test(input)) {
      this.urlEntry = input;
      return [input, ...this.files];
    }
    this.urlEntry = null;
    return this.files;
  }

  getItemText(item: TFile | string): string {
    if (typeof item === "string") {
      return `🌐 ${item}`;
    }
    return item.path;
  }

  onChooseItem(item: TFile | string): void {
    if (typeof item === "string") {
      this.onChoose(item);
    } else {
      this.onChoose(item.path);
    }
  }
}