import { TFile } from "obsidian";
import type { App } from "obsidian";
import type { MarkerFileData } from "./markerStore";

export class NoteMarkerStore {
  private app: App;
  private notePath: string;
  private mapId: string;
  private insertAfterLine?: number;

  constructor(app: App, notePath: string, mapId: string, insertAfterLine?: number) {
    this.app = app;
    this.notePath = notePath;
    this.mapId = mapId;
    this.insertAfterLine = insertAfterLine;
  }

  getPath(): string {
    return this.notePath;
  }

  private headerLine(): string {
    return `ZOOMMAP-DATA id=${this.mapId}`;
  }

  private footerLine(): string {
    return `/ZOOMMAP-DATA`;
  }

  private async readNote(): Promise<{ file: TFile; text: string }> {
    const af = this.app.vault.getAbstractFileByPath(this.notePath);
    if (!(af instanceof TFile)) throw new Error(`Note not found: ${this.notePath}`);
    const text = await this.app.vault.read(af);
    return { file: af, text };
  }

  private findBlock(text: string): {
    start: number;
    end: number;
    jsonStart: number;
    jsonEnd: number;
  } | null {
    const header = this.headerLine();
    const footer = this.footerLine();

    const hIdx = text.indexOf(header);
    if (hIdx < 0) return null;

    const headerLineStart = text.lastIndexOf("\n", hIdx) + 1;
    const headerLineEnd = text.indexOf("\n", hIdx);
    const headerEnd = headerLineEnd === -1 ? text.length : headerLineEnd;
    const jsonStart = headerEnd + 1;

    const fIdx = text.indexOf(footer, jsonStart);
    if (fIdx < 0) return null;

    const footerLineStart = text.lastIndexOf("\n", fIdx) + 1;
    const footerLineEnd = text.indexOf("\n", fIdx);
    const endExclusive = footerLineEnd === -1 ? text.length : footerLineEnd + 1;
    const jsonEnd = footerLineStart - 1;

    return {
      start: headerLineStart,
      end: endExclusive,
      jsonStart,
      jsonEnd: Math.max(jsonStart, jsonEnd),
    };
  }

  async ensureExists(
    initialImagePath?: string,
    size?: { w: number; h: number },
    markerLayerNames?: string[],
  ): Promise<void> {
    const { file } = await this.readNote();

    const baseLayers =
      markerLayerNames && markerLayerNames.length > 0
        ? markerLayerNames.map((name, idx) => ({
            id: idx === 0 ? "default" : `layer_${idx}`,
            name: name || "Layer",
            visible: true,
            locked: false,
          }))
        : [{ id: "default", name: "Default", visible: true, locked: false }];

    const data: MarkerFileData = {
      image: initialImagePath ?? "",
      size,
      layers: baseLayers,
      markers: [],
      bases: initialImagePath ? [initialImagePath] : [],
      overlays: [],
      activeBase: initialImagePath ?? "",
      measurement: {
        displayUnit: "auto-metric",
        metersPerPixel: undefined,
        scales: {},
        customUnitId: undefined,
      },
      frame: undefined,
      pinSizeOverrides: {},
      panClamp: true,
      drawLayers: [],
      drawings: [],
    };

    const payload = JSON.stringify(data, null, 2);
    const header = this.headerLine();
    const footer = this.footerLine();
    const block = `\n%%\n${header}\n${payload}\n${footer}\n%%\n`;

    await this.app.vault.process(file, (text) => {
      if (this.findBlock(text)) return text;

      let insertAt = text.length;
      if (typeof this.insertAfterLine === "number") {
        const lines = text.split("\n");
        const before = lines.slice(0, this.insertAfterLine + 1).join("\n");
        insertAt = before.length;
      }
      return text.slice(0, insertAt) + block + text.slice(insertAt);
    });
  }

  async load(): Promise<MarkerFileData> {
    const { text } = await this.readNote();
    const blk = this.findBlock(text);
    if (!blk) throw new Error("Inline marker block not found.");
    const raw = text.slice(blk.jsonStart, blk.jsonEnd + 1).trim();
    return JSON.parse(raw) as MarkerFileData;
  }

  async save(data: MarkerFileData): Promise<void> {
    const { file } = await this.readNote();
    const header = this.headerLine();
    const footer = this.footerLine();
    const payload = JSON.stringify(data, null, 2);

    await this.app.vault.process(file, (text) => {
      const blk = this.findBlock(text);
      const replacement = `${header}\n${payload}\n${footer}\n`;

      if (blk) {
        return text.slice(0, blk.start) + replacement + text.slice(blk.end);
      } else {
        return `${text}\n%%\n${header}\n${payload}\n${footer}\n%%\n`;
      }
    });
  }

  async wouldChange(data: MarkerFileData): Promise<boolean> {
    try {
      const cur = await this.load();
      const a = JSON.stringify(cur, null, 2);
      const b = JSON.stringify(data, null, 2);
      return a !== b;
    } catch {
      return true;
    }
  }
}