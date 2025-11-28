import { App, Notice, TAbstractFile, TFile, normalizePath } from "obsidian";

export interface MarkerLayer {
  id: string;
  name: string;
  visible: boolean;
  // Layer-Lock (Marker dieses Layers nicht verschiebbar)
  locked?: boolean;

  // Optional: an ein Basisbild (Base) binden – Pfad der Base (wie in bases[].path)
  // Wenn gesetzt, wird der Layer beim Wechsel auf diese Base automatisch sichtbar,
  // und bei anderen Bases automatisch unsichtbar.
  boundBase?: string;
}

export type MarkerKind = "pin" | "sticker";

export interface Marker {
  id: string;
  x: number; // 0..1 relative to image width
  y: number; // 0..1 relative to image height
  layer: string; // layer.id
  link?: string; // e.g. [[Note]]
  iconKey?: string; // for pin markers
  tooltip?: string;

  // optional type + sticker fields
  type?: MarkerKind;
  stickerPath?: string;   // vault path or data URL
  stickerSize?: number;   // px (rendered in image space; scales with zoom)
}

export interface BaseImage {
  path: string;
  name?: string;
}

export interface ImageOverlay {
  path: string;
  visible: boolean;
  name?: string;
}

/* ---- Ruler / scale data ---- */
export type DistanceUnit =
  | "m"
  | "km"
  | "mi"
  | "ft"
  | "auto-metric"
  | "auto-imperial";

export interface MeasurementConfig {
  displayUnit: DistanceUnit;          // UI unit
  metersPerPixel?: number;            // fallback if base-specific scale is missing
  scales?: Record<string, number>;    // per base image: metersPerPixel
}

export interface MarkerFileData {
  image: string; // active base image (back-compat)
  size?: { w: number; h: number };    // Bildgröße (Pixel)
  layers: MarkerLayer[];
  markers: Marker[];

  // Image layers
  bases?: Array<string | BaseImage>;
  overlays?: ImageOverlay[];
  activeBase?: string;

  // Ruler / scale
  measurement?: MeasurementConfig;

  // gespeicherte Frame-Größe (Viewport) in Pixeln
  frame?: { w: number; h: number };
}

export function generateId(prefix = "m"): string {
  const s = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${s}`;
}

export class MarkerStore {
  private app: App;
  private sourcePath: string;
  private markersFilePath: string;

  constructor(app: App, sourcePath: string, markersFilePath: string) {
    this.app = app;
    this.sourcePath = sourcePath;
    this.markersFilePath = normalizePath(markersFilePath);
  }

  getPath(): string {
    return this.markersFilePath;
  }

  async ensureExists(
    initialImagePath?: string,
    size?: { w: number; h: number },
  ): Promise<void> {
    const abs = this.getFileByPath(this.markersFilePath);
    if (abs) return;

    const data: MarkerFileData = {
      image: initialImagePath ?? "",
      size,
      layers: [
        { id: "default", name: "Default", visible: true, locked: false },
      ],
      markers: [],
      bases: initialImagePath ? [initialImagePath] : [],
      overlays: [],
      activeBase: initialImagePath ?? "",
      measurement: {
        displayUnit: "auto-metric",
        metersPerPixel: undefined,
        scales: {},
      },
    };

    await this.create(JSON.stringify(data, null, 2));
    new Notice(`Created marker file: ${this.markersFilePath}`, 2500);
  }

  async load(): Promise<MarkerFileData> {
    const f = this.getFileByPath(this.markersFilePath);
    if (!f) throw new Error(`Marker file missing: ${this.markersFilePath}`);

    const raw = await this.app.vault.read(f);
    const parsed = JSON.parse(raw) as MarkerFileData;

    // Defaults / Back-Compat
    if (!parsed.layers || parsed.layers.length === 0) {
      parsed.layers = [
        { id: "default", name: "Default", visible: true, locked: false },
      ];
    }

	// Layer-Felder normalisieren
    parsed.layers = parsed.layers.map((l) => ({
      id: l.id,
      name: l.name ?? "Layer",
      visible: typeof l.visible === "boolean" ? l.visible : true,
      locked: !!l.locked,
      // boundBase nur übernehmen, wenn ein nicht-leerer String
      boundBase:
        typeof l.boundBase === "string" && l.boundBase.trim()
          ? l.boundBase
          : undefined,
    }));

    if (!parsed.markers) parsed.markers = [];

    if (!parsed.bases) {
      parsed.bases = parsed.image ? [parsed.image] : [];
    }

    if (!parsed.activeBase) {
      const firstBase = parsed.bases[0];
      const firstPath =
        typeof firstBase === "string"
          ? firstBase
          : isBaseImage(firstBase)
          ? firstBase.path
          : "";

      parsed.activeBase = parsed.image || firstPath || "";
    }

    if (!parsed.overlays) parsed.overlays = [];

    if (!parsed.measurement) {
      parsed.measurement = {
        displayUnit: "auto-metric",
        metersPerPixel: undefined,
        scales: {},
      };
    }
    if (!parsed.measurement.scales) parsed.measurement.scales = {};
    if (!parsed.measurement.displayUnit) {
      parsed.measurement.displayUnit = "auto-metric";
    }

    return parsed;
  }

  async save(data: MarkerFileData): Promise<void> {
    const f = this.getFileByPath(this.markersFilePath);
    const content = JSON.stringify(data, null, 2);
    if (!f) {
      await this.create(content);
    } else {
      await this.app.vault.modify(f, content);
    }
  }

  async wouldChange(data: MarkerFileData): Promise<boolean> {
    const f = this.getFileByPath(this.markersFilePath);
    const next = JSON.stringify(data, null, 2);
    if (!f) return true;
    const cur = await this.app.vault.read(f);
    return cur !== next;
  }

  async addMarker(data: MarkerFileData, m: Marker): Promise<MarkerFileData> {
    data.markers.push(m);
    await this.save(data);
    return data;
  }

  async updateLayers(
    data: MarkerFileData,
    layers: MarkerLayer[],
  ): Promise<MarkerFileData> {
    // alle Felder mitschreiben; locked normalisieren
    data.layers = layers.map((l) => ({ ...l, locked: !!l.locked }));
    await this.save(data);
    return data;
  }

  private getFileByPath(path: string): TFile | null {
    const af: TAbstractFile | null = this.app.vault.getAbstractFileByPath(path);
    return af instanceof TFile ? af : null;
  }

  private async create(content: string) {
    const dir = this.markersFilePath.split("/").slice(0, -1).join("/");
    if (dir && !this.app.vault.getAbstractFileByPath(dir)) {
      await this.app.vault.createFolder(dir);
    }
    await this.app.vault.create(this.markersFilePath, content);
  }
}

function isBaseImage(x: unknown): x is BaseImage {
  return (
    !!x &&
    typeof x === "object" &&
    "path" in x &&
    typeof (x as { path?: unknown }).path === "string"
  );
}