import { Notice, TFile, normalizePath } from "obsidian";
import type { App, TAbstractFile } from "obsidian";

export interface MarkerLayer {
  id: string;
  name: string;
  visible: boolean;
  locked?: boolean;
  // Optional: Layer an ein Base binden – beim Base-Wechsel automatisch (un)sichtbar
  boundBase?: string;
}

export type MarkerKind = "pin" | "sticker";

export type AnchorSpace = "world" | "viewport";

export interface Marker {
  id: string;

  /**
   * For anchorSpace === "world":
   *   x,y are 0..1 relative to image width/height.
   *
   * For anchorSpace === "viewport":
   *   x,y are currently not used for rendering, but kept as
   *   normalized values (hudX / viewportWidth, hudY / viewportHeight)
   *   for potential future use.
   */
  x: number;
  y: number;

  layer: string;
  link?: string;
  iconKey?: string;
  tooltip?: string;

  // Marker type + sticker fields
  type?: MarkerKind;
  stickerPath?: string;
  stickerSize?: number;

  // Optional: per-pin zoom range (undefined → always visible)
  minZoom?: number;
  maxZoom?: number;

  // Optional: pin scales like sticker (with the map), no inverse wrapper
  scaleLikeSticker?: boolean;

  // Anchor space:
  // - "world" (default): coordinates in image space (normalized 0..1).
  // - "viewport": HUD pin positioned relative to the viewport.
  anchorSpace?: AnchorSpace;

  // HUD metadata (only used when anchorSpace === "viewport")
  hudX?: number;      // anchor position in px from left edge of viewport
  hudY?: number;      // anchor position in px from top edge of viewport
  hudModeX?: "left" | "right" | "center";
  hudModeY?: "top" | "bottom" | "center";
  hudLastWidth?: number;
  hudLastHeight?: number;
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
  | "auto-imperial"
  | "custom";

export interface MeasurementConfig {
  displayUnit: DistanceUnit;
  metersPerPixel?: number;
  scales?: Record<string, number>;
  customUnitId?: string;
}

export interface MarkerFileData {
  image: string; // active base image (back-compat)
  size?: { w: number; h: number }; // image size in pixels
  layers: MarkerLayer[];
  markers: Marker[];

  // Image layers
  bases?: (string | BaseImage)[];
  overlays?: ImageOverlay[];
  activeBase?: string;

  // Ruler / scale
  measurement?: MeasurementConfig;

  // Saved frame (viewport) size in pixels
  frame?: { w: number; h: number };

  // Per-map pin size overrides (iconKey → size in px on this map)
  pinSizeOverrides?: Record<string, number>;
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
      layers: [{ id: "default", name: "Default", visible: true, locked: false }],
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
      parsed.layers = [{ id: "default", name: "Default", visible: true, locked: false }];
    }

    // Layer-Fields
    parsed.layers = parsed.layers.map((l) => ({
      id: l.id,
      name: l.name ?? "Layer",
      visible: typeof l.visible === "boolean" ? l.visible : true,
      locked: !!l.locked,
      boundBase: typeof l.boundBase === "string" && l.boundBase.trim() ? l.boundBase : undefined,
    }));

    parsed.markers ??= [];

    parsed.bases ??= parsed.image ? [parsed.image] : [];

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

    parsed.overlays ??= [];

    parsed.measurement ??= {
      displayUnit: "auto-metric",
      metersPerPixel: undefined,
      scales: {},
    };
    parsed.measurement.scales ??= {};
    parsed.measurement.displayUnit ??= "auto-metric";

    // Per-map pin size overrides
    parsed.pinSizeOverrides ??= {};

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

  async updateLayers(data: MarkerFileData, layers: MarkerLayer[]): Promise<MarkerFileData> {
    data.layers = layers.map((l) => ({ ...l, locked: !!l.locked }));
    await this.save(data);
    return data;
  }

  private getFileByPath(path: string): TFile | null {
    const af: TAbstractFile | null = this.app.vault.getAbstractFileByPath(path);
    return af instanceof TFile ? af : null;
  }

  private async create(content: string): Promise<void> {
    const dir = this.markersFilePath.split("/").slice(0, -1).join("/");
    if (dir && !this.app.vault.getAbstractFileByPath(dir)) {
      await this.app.vault.createFolder(dir);
    }
    await this.app.vault.create(this.markersFilePath, content);
  }
}

function isBaseImage(x: unknown): x is BaseImage {
  return !!x && typeof x === "object" && "path" in x && typeof (x as { path?: unknown }).path === "string";
}