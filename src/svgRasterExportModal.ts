import { Modal, Setting, Notice, normalizePath } from "obsidian";
import type { App } from "obsidian";

export type RasterLongEdge = 4096 | 8192 | 12288;

export interface SvgRasterExportOptions {
  svgPath: string;
  sourcePath: string; // note path (resolve links)
  defaultLongEdge?: RasterLongEdge;
  defaultQuality?: number; // 0..1
}

export interface SvgRasterExportResult {
  longEdge: RasterLongEdge;
  quality: number; // 0..1
  outPath: string;
  baseName?: string;
  moveMarkersJson?: boolean;
}

type Callback = (res: { action: "export" | "cancel"; result?: SvgRasterExportResult }) => void;

function fileStem(path: string): string {
  const name = path.split("/").pop() ?? path;
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(0, dot) : name;
}
function folderOf(path: string): string {
  const i = path.lastIndexOf("/");
  return i >= 0 ? path.slice(0, i) : "";
}

export class SvgRasterExportModal extends Modal {
  private opts: SvgRasterExportOptions;
  private onDone: Callback;

  private longEdge: RasterLongEdge;
  private quality = 0.92;
  private outPath = "";
  private baseName = "";
  private moveMarkersJson = false;
  private suppressAutoDefaults = false;

  constructor(app: App, opts: SvgRasterExportOptions, onDone: Callback) {
    super(app);
    this.opts = opts;
    this.onDone = onDone;

    this.longEdge = opts.defaultLongEdge ?? 8192;
    this.quality = typeof opts.defaultQuality === "number" ? opts.defaultQuality : 0.92;

    const dir = folderOf(opts.svgPath);
    const stem = fileStem(opts.svgPath);
    this.baseName = `${stem} (${this.longEdge / 1024}k)`;
    this.outPath = normalizePath(`${dir}/${stem}-${this.longEdge / 1024}k.webp`);
  }

  onOpen(): void {
    this.render();
  }
  
  private render(): void {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl("h2", { text: "Export SVG as webp base" });
    contentEl.createDiv({ text: `SVG: ${this.opts.svgPath}` });

    new Setting(contentEl)
      .setName("Long edge")
      .setDesc("Target size for the longer side of the image.")
      .addDropdown((d) => {
        d.addOption("4096", "4K (4096px)");
        d.addOption("8192", "8K (8192px)");
        d.addOption("12288", "12K (12288px)");
        d.setValue(String(this.longEdge));
        d.onChange((v) => {
          this.longEdge = Number(v) as RasterLongEdge;

          // Auto defaults ONLY if the user didn't start customizing name/path yet
          if (!this.suppressAutoDefaults) {
            const dir = folderOf(this.opts.svgPath);
            const stem = fileStem(this.opts.svgPath);
            this.baseName = `${stem} (${this.longEdge / 1024}k)`;
            this.outPath = normalizePath(`${dir}/${stem}-${this.longEdge / 1024}k.webp`);
          }

          this.render();
        });
      });

    new Setting(contentEl)
      .setName("Webp quality")
      .setDesc("0.0–1.0 (higher = better quality, larger file).")
      .addText((t) => {
        t.setPlaceholder("0.92");
        t.setValue(String(this.quality));
        t.onChange((v) => {
          const n = Number(String(v).replace(",", "."));
          if (Number.isFinite(n)) this.quality = Math.min(1, Math.max(0.1, n));
        });
      });

    new Setting(contentEl)
      .setName("New base name (optional)")
      .addText((t) => {
        t.setValue(this.baseName);
        t.onChange((v) => {
          this.suppressAutoDefaults = true;
          this.baseName = v.trim();
        });
      });

    new Setting(contentEl)
      .setName("Output path")
      .setDesc("Will be created in the vault (webp). If it exists, a suffix will be added.")
      .addText((t) => {
        t.setValue(this.outPath);
        t.onChange((v) => {
          this.suppressAutoDefaults = true;
          this.outPath = normalizePath(v.trim());
        });
      });

    new Setting(contentEl)
      .setName("Move markers.json to exported base")
      .setDesc("Renames the current markers.json to <exported>.markers.json. WARNING: other maps using the same markers file must be updated manually.")
      .addToggle((tg) => tg.setValue(this.moveMarkersJson).onChange((v) => (this.moveMarkersJson = v)));

    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const exportBtn = footer.createEl("button", { text: "Export" });
    const cancelBtn = footer.createEl("button", { text: "Cancel" });

    exportBtn.onclick = () => {
      if (!this.outPath) {
        new Notice("Output path is empty.", 2500);
        return;
      }
      this.close();
      this.onDone({
        action: "export",
        result: {
          longEdge: this.longEdge,
          quality: this.quality,
          outPath: this.outPath,
          baseName: this.baseName || undefined,
          moveMarkersJson: this.moveMarkersJson,
        },
      });
    };

    cancelBtn.onclick = () => {
      this.close();
      this.onDone({ action: "cancel" });
    };
  }

  onClose(): void {
    this.contentEl.empty();
  }
}