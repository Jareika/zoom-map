import { App, TFile } from "obsidian";
import { MarkerFileData } from "./markerStore";

/*
Multiline comment format in Obsidian must NOT close on the same line.
We wrap the payload like this:

%%
ZOOMMAP-DATA id=<mapId>
{ ... JSON ... }
/ZOOMMAP-DATA
%%

Everything between the two %% lines is hidden in Reading view.
*/

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
    // used to subscribe to vault "modify" → for inline we watch the note itself
    return this.notePath;
  }

  // Label lines inside the comment block (no %% here)
  private headerLine() { return `ZOOMMAP-DATA id=${this.mapId}`; }
  private footerLine() { return `/ZOOMMAP-DATA`; }

  private async readNote(): Promise<{ file: TFile; text: string }> {
    const af = this.app.vault.getAbstractFileByPath(this.notePath);
    if (!(af instanceof TFile)) throw new Error(`Note not found: ${this.notePath}`);
    const text = await this.app.vault.read(af);
    return { file: af, text };
  }

  // Find the region that starts at the header line and ends after the footer line.
  // Returns indices covering only the labeled region (not the outer %% lines).
  private findBlock(text: string): { start: number; end: number; jsonStart: number; jsonEnd: number } | null {
    const header = this.headerLine();
    const footer = this.footerLine();

    const hIdx = text.indexOf(header);
    if (hIdx < 0) return null;

    // Header line bounds
    const headerLineStart = text.lastIndexOf("\n", hIdx) + 1;
    const headerLineEnd = text.indexOf("\n", hIdx);
    const headerEnd = headerLineEnd === -1 ? text.length : headerLineEnd;

    // JSON starts after the header line break (if any)
    const jsonStart = headerEnd + 1;

    const fIdx = text.indexOf(footer, jsonStart);
    if (fIdx < 0) return null;

    // Footer line bounds
    const footerLineStart = text.lastIndexOf("\n", fIdx) + 1;
    const footerLineEnd = text.indexOf("\n", fIdx);
    const endExclusive = footerLineEnd === -1 ? text.length : (footerLineEnd + 1);

    const jsonEnd = footerLineStart - 1; // last char before footer line

    return {
      start: headerLineStart,
      end: endExclusive,
      jsonStart,
      jsonEnd: Math.max(jsonStart, jsonEnd)
    };
  }

  async ensureExists(initialImagePath?: string, size?: { w: number; h: number }) {
    const { file, text } = await this.readNote();
    if (this.findBlock(text)) return;

    const data: MarkerFileData = {
      image: initialImagePath ?? "",
      size,
      layers: [{ id: "default", name: "Default", visible: true, locked: false }],
      markers: [],
      bases: initialImagePath ? [initialImagePath] : [],
      overlays: [],
      activeBase: initialImagePath ?? "",
      measurement: { displayUnit: "auto-metric", metersPerPixel: undefined, scales: {} },
      frame: undefined
    };

    const payload = JSON.stringify(data, null, 2);
    // Proper multiline comment wrapper
    const block =
`\n%%\n${this.headerLine()}\n${payload}\n${this.footerLine()}\n%%\n`;

    let insertAt = text.length;
    if (typeof this.insertAfterLine === "number") {
      const lines = text.split("\n");
      const before = lines.slice(0, this.insertAfterLine + 1).join("\n");
      insertAt = before.length;
    }
    const out = text.slice(0, insertAt) + block + text.slice(insertAt);
    await this.app.vault.modify(file, out);
  }

  async load(): Promise<MarkerFileData> {
    const { text } = await this.readNote();
    const blk = this.findBlock(text);
    if (!blk) throw new Error("Inline marker block not found.");
    const raw = text.slice(blk.jsonStart, blk.jsonEnd + 1).trim();
    return JSON.parse(raw) as MarkerFileData;
  }

  async save(data: MarkerFileData): Promise<void> {
    const { file, text } = await this.readNote();
    const blk = this.findBlock(text);
    const payload = JSON.stringify(data, null, 2);

    const replacement =
`${this.headerLine()}\n${payload}\n${this.footerLine()}\n`;

    let out: string;
    if (blk) {
      out = text.slice(0, blk.start) + replacement + text.slice(blk.end);
    } else {
      // If the labeled region is missing for some reason, append a fresh full block including %%
      out = text +
`\n%%\n${this.headerLine()}\n${payload}\n${this.footerLine()}\n%%\n`;
    }
    await this.app.vault.modify(file, out);
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