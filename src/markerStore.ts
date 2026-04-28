import { Notice, TFile, normalizePath } from "obsidian";
import type { App, TAbstractFile } from "obsidian";

export interface MarkerLayer {
  id: string;
  name: string;
  visible: boolean;
  locked?: boolean;
  boundBase?: string;
}

export interface DrawLayer {
  id: string;
  name: string;
  visible: boolean;
  locked?: boolean;
  boundBase?: string;
}

export type GridShape = "square" | "hex";
export type GridDisplayTarget = "both" | "player-only" | "gm-only";

export interface GridOverlay {
  id: string;
  name: string;
  visible: boolean;

  boundBase?: string;

  shape: GridShape;


  color: string;
  width: number;
  opacity: number; // 0..1


  spacing: number;
  offsetX: number;
  offsetY: number;
  playerScreen?: GridDisplayTarget;
}

export type DrawingKind = "polygon" | "polyline" | "rect" | "circle";

export type FillPatternKind = "none" | "solid" | "striped" | "cross" | "wavy";

export interface DrawingStyle {
  // Stroke
  strokeColor: string;
  strokeWidth: number;
  strokeDash?: number[];
  strokeOpacity?: number;          // 0–1, optional

  // Fill (background / base color)
  fillColor?: string;
  fillOpacity?: number;            // 0–1, optional

  // Pattern fill on top of the base fill
  fillPattern?: FillPatternKind;   // "none" | "solid" | "striped" | "cross" | "wavy"
  fillPatternAngle?: number;       // degrees, e.g. 45
  fillPatternSpacing?: number;     // pattern cell size in px, e.g. 8–16
  fillPatternStrokeWidth?: number; // line thickness inside the pattern
  fillPatternOpacity?: number;     // 0–1 transparency for pattern strokes

  // Optional label
  label?: string;
  
  arrowEnd?: boolean;
  distanceLabel?: boolean;
}

export interface Drawing {
  id: string;
  layerId: string;
  kind: DrawingKind;
  visible: boolean;

  rect?: { x0: number; y0: number; x1: number; y1: number };
  circle?: { cx: number; cy: number; r: number };
  polygon?: { x: number; y: number }[];
  polyline?: { x: number; y: number }[];

  style: DrawingStyle;

  /** Legacy: data URL baked in memory (prototyp, kann später entfernt werden) */
  bakedSvg?: string;

  bakedPath?: string;
  bakedWidth?: number;
  bakedHeight?: number;
}

export interface TextLayerStyle {
  fontFamily: string;
  fontSize: number;
  color: string;

  fontWeight?: string;
  italic?: boolean;
  letterSpacing?: number;

  baselineOffset?: number;
  lineHeight?: number;

  padLeft?: number;
  padRight?: number;
}

export interface TextBaseline {
  id: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  text?: string;
}

export interface TextBoxAutoConfig {
  lineGapPx: number;
  padLeft: number;
  padRight: number;
  padTop: number;
  padBottom: number;
}

export interface TextBox {
  id: string;
  name: string;
  mode: "custom" | "auto";
  rect: { x0: number; y0: number; x1: number; y1: number };
  lines: TextBaseline[];
  auto?: TextBoxAutoConfig;
  sourceDrawingId?: string;
  sourceDrawingKind?: DrawingKind;

  style?: TextLayerStyle;
  locked?: boolean;
  autoFlow?: boolean;
  allowAngledBaselines?: boolean;
}

export interface TextLayer {
  id: string;
  name: string;
  visible: boolean;
  boundBase?: string;
  
  /** Legacy layer-level options, kept for migration/back-compat. */
  locked?: boolean;

  autoFlow?: boolean;
  allowAngledBaselines?: boolean;
  
  /** Legacy layer-level style, kept for migration/back-compat. */
  style?: TextLayerStyle;
  boxes: TextBox[];
}

interface LegacyTextLayerData {
  rect?: TextBox["rect"];
  lines?: TextBaseline[];
  mode?: TextBox["mode"];
  auto?: TextBoxAutoConfig;
  sourceDrawingId?: string;
  sourceDrawingKind?: DrawingKind;
}

export type MarkerKind = "pin" | "sticker" | "swap" | "switch" | "dice";

export type PingDistanceUnit = "m" | "km" | "mi" | "ft" | "custom";

export type AnchorSpace = "world" | "viewport";

export interface DiceRollSpec {
  count: number;
  sides: number;
}

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
  iconColor?: string; // per-pin SVG color override
  tooltip?: string;
  tooltipAlwaysOn?: boolean;
  
  tooltipLabelAlways?: boolean;
  tooltipLabelPosition?: "below" | "above";
  
  tooltipLabelOffsetX?: number;
  tooltipLabelOffsetY?: number;

  // Marker type + sticker/swap fields
  type?: MarkerKind;

  // Sticker
  stickerPath?: string;
  stickerSize?: number;

  // Swap pins (icon sequence defined via collections)
  swapKey?: string;    // id of a SwapPinPreset in collections
  swapIndex?: number;  // current frame index in that preset
  
  // Per-marker override links for swap pins (frameIndex -> link)
  swapLinks?: Record<number, string>;
  
  // Switch pin (base switcher)
  switchBase?: string;      // path to base image (optional; if empty => rotate)
  switchRotate?: boolean;   // if true: cycle through bases on right click
  
  diceRolls?: DiceRollSpec[];
  diceRender3d?: boolean;
  
  // Ping pins (special markers that create/update a ping note) 
  pingPresetId?: string;
  pingRadius?: number;
  pingRadiusUnit?: PingDistanceUnit;
  pingRadiusCustomUnitId?: string;
  pingNotePath?: string; // vault path of the generated ping note

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
  | "custom";

export interface MeasurementConfig {
  displayUnit: DistanceUnit;
  metersPerPixel?: number;
  scales?: Record<string, number>;
  customUnitId?: string;
  customUnitPxPerUnit?: Record<string, Record<string, number>>;
  travelTimePresetIds?: string[];
  travelDaysEnabled?: boolean;
  travelDayPresetId?: string;
}

export interface SecondScreenConfig {
  markerLayerIds?: string[];
  drawLayerIds?: string[];
  showGrids?: boolean;
  textLayerIds?: string[];
  notePath?: string;
  markersPath?: string;
}

export interface DeletedIndexedMarker {
  marker: Marker;
  index: number;
}

export interface DeletedIndexedDrawing {
  drawing: Drawing;
  index: number;
}

export interface DeletedMarkerUndoPayload {
  kind: "marker";
  marker: Marker;
  index: number;
}

export interface DeletedDrawingUndoPayload {
  kind: "drawing";
  drawing: Drawing;
  index: number;
}

export interface DeletedGridUndoPayload {
  kind: "grid";
  grid: GridOverlay;
  index: number;
}

export interface DeletedTextLayerUndoPayload {
  kind: "text-layer";
  layer: TextLayer;
  index: number;
}

export interface DeletedTextBoxUndoPayload {
  kind: "text-box";
  layerId: string;
  box: TextBox;
  index: number;
}

export interface DeletedMarkerLayerUndoPayload {
  kind: "marker-layer";
  layer: MarkerLayer;
  index: number;
  mode: "move" | "delete-markers";
  targetId?: string;
  markers?: DeletedIndexedMarker[];
  movedMarkerIds?: string[];
}

export interface DeletedDrawLayerUndoPayload {
  kind: "draw-layer";
  layer: DrawLayer;
  index: number;
  drawings: DeletedIndexedDrawing[];
}

export type DeletedUndoPayload =
  | DeletedMarkerUndoPayload
  | DeletedDrawingUndoPayload
  | DeletedGridUndoPayload
  | DeletedTextLayerUndoPayload
  | DeletedTextBoxUndoPayload
  | DeletedMarkerLayerUndoPayload
  | DeletedDrawLayerUndoPayload;

export interface DeletedUndoEntry {
  id: string;
  label: string;
  createdAt: string;
  payload: DeletedUndoPayload;
}

export interface MarkerFileData {
  /** Legacy field (deprecated): do not write anymore, still read for migration/back-compat */
  image?: string;
  size?: { w: number; h: number };
  layers: MarkerLayer[];
  markers: Marker[];

  bases?: (string | BaseImage)[];
  overlays?: ImageOverlay[];
  activeBase?: string;

  measurement?: MeasurementConfig;

  frame?: { w: number; h: number };

  pinSizeOverrides?: Record<string, number>;
  panClamp?: boolean;

  drawLayers?: DrawLayer[];
  grids?: GridOverlay[];
  drawings?: Drawing[];
  
  secondScreen?: SecondScreenConfig;
  
  deleted?: DeletedUndoEntry[];
  
  textLayers?: TextLayer[];
}

export function generateId(prefix = "m"): string {
  const s = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${s}`;
}

export function sanitizeMarkerFileDataForSave(data: MarkerFileData): MarkerFileData {
  const out: MarkerFileData = { ...data };
  
  const deleted = sanitizeDeletedUndoEntries(out.deleted);

  delete out.image;
  delete out.deleted;

  const du = (out.measurement?.displayUnit as unknown as string | undefined) ?? "";
  if (out.measurement && du) {
    if (du === "auto-metric") out.measurement.displayUnit = "km";
    else if (du === "auto-imperial") out.measurement.displayUnit = "mi";
  }

  if (deleted?.length) out.deleted = deleted;

  return out;
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function sanitizeIndex(x: unknown): number | null {
  const n = typeof x === "number" ? x : Number(x);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.floor(n);
}

function sanitizeDeletedIndexedMarker(x: unknown): DeletedIndexedMarker | null {
  if (!isRecord(x) || !isRecord(x.marker)) return null;
  const index = sanitizeIndex(x.index);
  if (index === null) return null;
  return {
    marker: x.marker as unknown as Marker,
    index,
  };
}

function sanitizeDeletedIndexedDrawing(x: unknown): DeletedIndexedDrawing | null {
  if (!isRecord(x) || !isRecord(x.drawing)) return null;
  const index = sanitizeIndex(x.index);
  if (index === null) return null;
  return {
    drawing: x.drawing as unknown as Drawing,
    index,
  };
}

function sanitizeDeletedUndoPayload(payload: unknown): DeletedUndoPayload | null {
  if (!isRecord(payload) || typeof payload.kind !== "string") return null;

  switch (payload.kind) {
    case "marker": {
      if (!isRecord(payload.marker)) return null;
      const index = sanitizeIndex(payload.index);
      if (index === null) return null;
      return {
        kind: "marker",
        marker: payload.marker as unknown as Marker,
        index,
      };
    }

    case "drawing": {
      if (!isRecord(payload.drawing)) return null;
      const index = sanitizeIndex(payload.index);
      if (index === null) return null;
      return {
        kind: "drawing",
        drawing: payload.drawing as unknown as Drawing,
        index,
      };
    }

    case "grid": {
      if (!isRecord(payload.grid)) return null;
      const index = sanitizeIndex(payload.index);
      if (index === null) return null;
      return {
        kind: "grid",
        grid: payload.grid as unknown as GridOverlay,
        index,
      };
    }

    case "text-layer": {
      if (!isRecord(payload.layer)) return null;
      const index = sanitizeIndex(payload.index);
      if (index === null) return null;
      return {
        kind: "text-layer",
        layer: payload.layer as unknown as TextLayer,
        index,
      };
    }

    case "text-box": {
      if (typeof payload.layerId !== "string" || !isRecord(payload.box)) return null;
      const index = sanitizeIndex(payload.index);
      if (index === null) return null;
      return {
        kind: "text-box",
        layerId: payload.layerId,
        box: payload.box as unknown as TextBox,
        index,
      };
    }

    case "marker-layer": {
      if (!isRecord(payload.layer)) return null;
      const index = sanitizeIndex(payload.index);
      if (index === null) return null;
      const mode =
        payload.mode === "move" || payload.mode === "delete-markers"
          ? payload.mode
          : null;
      if (!mode) return null;

      const markers = Array.isArray(payload.markers)
        ? payload.markers
            .map(sanitizeDeletedIndexedMarker)
            .filter((x): x is DeletedIndexedMarker => !!x)
        : undefined;

      const movedMarkerIds = Array.isArray(payload.movedMarkerIds)
        ? payload.movedMarkerIds
            .filter((x): x is string => typeof x === "string" && !!x.trim())
        : undefined;

      return {
        kind: "marker-layer",
        layer: payload.layer as unknown as MarkerLayer,
        index,
        mode,
        targetId:
          typeof payload.targetId === "string" && payload.targetId.trim()
            ? payload.targetId
            : undefined,
        markers: markers?.length ? markers : undefined,
        movedMarkerIds: movedMarkerIds?.length ? movedMarkerIds : undefined,
      };
    }

    case "draw-layer": {
      if (!isRecord(payload.layer)) return null;
      const index = sanitizeIndex(payload.index);
      if (index === null) return null;

      const drawings = Array.isArray(payload.drawings)
        ? payload.drawings
            .map(sanitizeDeletedIndexedDrawing)
            .filter((x): x is DeletedIndexedDrawing => !!x)
        : [];

      return {
        kind: "draw-layer",
        layer: payload.layer as unknown as DrawLayer,
        index,
        drawings,
      };
    }

    default:
      return null;
  }
}

function sanitizeDeletedUndoEntries(
  entries: DeletedUndoEntry[] | undefined,
): DeletedUndoEntry[] | undefined {
  if (!Array.isArray(entries) || entries.length === 0) return undefined;

  const out = entries
    .map((entry) => {
      if (!isRecord(entry)) return null;
      const payload = sanitizeDeletedUndoPayload(entry.payload);
      if (!payload) return null;
      return {
        id:
          typeof entry.id === "string" && entry.id.trim()
            ? entry.id
            : generateId("undo"),
        label:
          typeof entry.label === "string" && entry.label.trim()
            ? entry.label
            : "Deleted item",
        createdAt:
          typeof entry.createdAt === "string" && entry.createdAt.trim()
            ? entry.createdAt
            : new Date(0).toISOString(),
        payload,
      } satisfies DeletedUndoEntry;
    })
    .filter((x): x is DeletedUndoEntry => !!x)
    .slice(0, 3);

  return out.length ? out : undefined;
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
  
  private serialize(data: MarkerFileData): string {
    return JSON.stringify(sanitizeMarkerFileDataForSave(data), null, 2);
  }

  async ensureExists(
    initialImagePath?: string,
    size?: { w: number; h: number },
    markerLayerNames?: string[],
  ): Promise<void> {
    const abs = this.getFileByPath(this.markersFilePath);
    if (abs) return;

    const baseLayers: MarkerLayer[] =
      markerLayerNames && markerLayerNames.length > 0
        ? markerLayerNames.map((name, idx) => ({
            id: idx === 0 ? "default" : generateId("layer"),
            name: name || "Layer",
            visible: true,
            locked: false,
          }))
        : [{ id: "default", name: "Default", visible: true, locked: false }];

    const data: MarkerFileData = {
      size,
      layers: baseLayers,
      markers: [],
      bases: initialImagePath ? [initialImagePath] : [],
      overlays: [],
      activeBase: initialImagePath ?? "",
      measurement: {
        metersPerPixel: undefined,
        scales: {},
        customUnitId: undefined,
		customUnitPxPerUnit: {},
        travelTimePresetIds: [],
        travelDaysEnabled: false,
		travelDayPresetId: undefined,
      },
      frame: undefined,
      pinSizeOverrides: {},
	  grids: [],
      panClamp: true,
      drawLayers: [],
      drawings: [],
      secondScreen: {},
	  textLayers: [],
    };

    await this.create(this.serialize(data));
    new Notice(`Created marker file: ${this.markersFilePath}`, 2500);
  }

  async load(): Promise<MarkerFileData> {
  const f = this.getFileByPath(this.markersFilePath);
  if (!f) throw new Error(`Marker file missing: ${this.markersFilePath}`);

  const raw = await this.app.vault.read(f);
  const parsed = JSON.parse(raw) as MarkerFileData;

  // Defaults / back-compat
  if (!parsed.layers || parsed.layers.length === 0) {
    parsed.layers = [
      { id: "default", name: "Default", visible: true, locked: false },
    ];
  }

  // Normalize layer fields
  parsed.layers = parsed.layers.map((l) => ({
    id: l.id,
    name: l.name ?? "Layer",
    visible: typeof l.visible === "boolean" ? l.visible : true,
    locked: !!l.locked,
    boundBase:
      typeof l.boundBase === "string" && l.boundBase.trim()
        ? l.boundBase
        : undefined,
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
    parsed.activeBase = parsed.activeBase || parsed.image || firstPath || "";
  }

  parsed.overlays ??= [];

  parsed.measurement ??= {
    displayUnit: "km",
    metersPerPixel: undefined,
    scales: {},
  };
  parsed.measurement.scales ??= {};
  // normalize + back-compat: auto-* -> km/mi
  {
    const raw = (parsed.measurement.displayUnit as unknown as string | undefined) ?? "";
    if (raw === "auto-metric") parsed.measurement.displayUnit = "km";
    else if (raw === "auto-imperial") parsed.measurement.displayUnit = "mi";
    else if (raw !== "m" && raw !== "km" && raw !== "mi" && raw !== "ft" && raw !== "custom") {
      parsed.measurement.displayUnit = "km";
    }
  }
  parsed.measurement.customUnitPxPerUnit ??= {};
  if (!Array.isArray(parsed.measurement.travelTimePresetIds)) {
  parsed.measurement.travelTimePresetIds = [];
}
  if (typeof parsed.measurement.travelDaysEnabled !== "boolean") {
    parsed.measurement.travelDaysEnabled = false;
  }
  if (typeof parsed.measurement.travelDayPresetId !== "string" || !parsed.measurement.travelDayPresetId.trim()) {
    delete parsed.measurement.travelDayPresetId;
  }

  // Per-map pin size overrides
  parsed.pinSizeOverrides ??= {};
  if (typeof parsed.panClamp !== "boolean") {
    parsed.panClamp = true;
  }

  // Drawing layers and drawings
  parsed.drawLayers ??= [];
  parsed.drawings ??= [];
  parsed.grids ??= [];
  parsed.grids = parsed.grids.map((g) => ({
    id: g.id,
    name: g.name ?? "Grid",
    visible: typeof g.visible === "boolean" ? g.visible : true,
    boundBase:
      typeof g.boundBase === "string" && g.boundBase.trim()
        ? g.boundBase
        : undefined,
    shape: g.shape === "hex" ? "hex" : "square",
    color:
      typeof g.color === "string" && g.color.trim()
        ? g.color
        : "#ffffff",
    width: Number.isFinite(g.width) && g.width > 0 ? g.width : 1,
    opacity: Number.isFinite(g.opacity) ? Math.min(Math.max(g.opacity, 0), 1) : 0.5,
    spacing: Number.isFinite(g.spacing) && g.spacing > 1 ? g.spacing : 64,
    offsetX: Number.isFinite(g.offsetX) ? g.offsetX : 0,
    offsetY: Number.isFinite(g.offsetY) ? g.offsetY : 0,
    playerScreen: g.playerScreen === "player-only" || g.playerScreen === "gm-only" ? g.playerScreen : "both",
  }));
  
  parsed.textLayers ??= [];
  parsed.textLayers = parsed.textLayers.map((layer) => {
    const legacy = layer as TextLayer & LegacyTextLayerData;
    const boxes = Array.isArray(layer.boxes) ? layer.boxes : [];

    const migratedLegacyBox =
      boxes.length === 0 ? buildLegacyTextBoxFromLayer(legacy) : null;

    return {
      id: layer.id,
      name: layer.name ?? "Text layer",
      visible: typeof layer.visible === "boolean" ? layer.visible : true,
      locked: !!layer.locked,
      boundBase:
        typeof layer.boundBase === "string" && layer.boundBase.trim()
          ? layer.boundBase
          : undefined,
      autoFlow:
        typeof layer.autoFlow === "boolean" ? layer.autoFlow : undefined,
      allowAngledBaselines:
        typeof layer.allowAngledBaselines === "boolean"
          ? layer.allowAngledBaselines
          : undefined,
      style: layer.style,
      boxes:
        boxes.length > 0
          ? boxes
          : migratedLegacyBox
            ? [migratedLegacyBox]
            : [],
    };
  });
  
  parsed.secondScreen ??= {};
  if (!Array.isArray(parsed.secondScreen.markerLayerIds)) delete parsed.secondScreen.markerLayerIds;
  if (!Array.isArray(parsed.secondScreen.drawLayerIds)) delete parsed.secondScreen.drawLayerIds;
  if (!Array.isArray(parsed.secondScreen.textLayerIds)) delete parsed.secondScreen.textLayerIds;
  if (typeof parsed.secondScreen.notePath !== "string" || !parsed.secondScreen.notePath.trim()) {
    delete parsed.secondScreen.notePath;
  }
  if (typeof parsed.secondScreen.showGrids !== "boolean") {
    parsed.secondScreen.showGrids = true;
    delete parsed.secondScreen.notePath;
  }
  if (typeof parsed.secondScreen.markersPath !== "string" || !parsed.secondScreen.markersPath.trim()) {
    delete parsed.secondScreen.markersPath;
  }
  
  parsed.deleted ??= [];
  parsed.deleted = (sanitizeDeletedUndoEntries(parsed.deleted) ?? []).slice(0, 3);

  return parsed;
  }

  async save(data: MarkerFileData): Promise<void> {
    const f = this.getFileByPath(this.markersFilePath);
    const content = this.serialize(data);
    if (!f) {
      await this.create(content);
    } else {
      await this.app.vault.modify(f, content);
    }
  }

  async wouldChange(data: MarkerFileData): Promise<boolean> {
    const f = this.getFileByPath(this.markersFilePath);
    const next = this.serialize(data);
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
  
  private async ensureFolderExists(path: string): Promise<void> {
    if (!path) return;
    if (this.app.vault.getAbstractFileByPath(path)) return;

    try {
      await this.app.vault.createFolder(path);
    } catch (err) {
      if (this.app.vault.getAbstractFileByPath(path)) return;
      throw err;
    }
  }

  private async create(content: string): Promise<void> {
    const dir = this.markersFilePath.split("/").slice(0, -1).join("/");
    await this.ensureFolderExists(dir);

    try {
      await this.app.vault.create(this.markersFilePath, content);
    } catch (err) {
      if (this.getFileByPath(this.markersFilePath)) return;
      throw err;
    }
  }
}

function buildLegacyTextBoxFromLayer(layer: LegacyTextLayerData & Partial<TextLayer>): TextBox | null {
  const rect = normalizeLegacyRect(layer.rect);
  const lines = normalizeLegacyLines(layer.lines);

  const finalRect = rect ?? deriveRectFromLegacyLines(lines);
  if (!finalRect) return null;

  const mode: TextBox["mode"] = layer.mode === "auto" ? "auto" : "custom";

  return {
    id: generateId("tbox"),
    name: typeof layer.name === "string" && layer.name.trim()
      ? `${layer.name} box`
      : "Text box",
    mode,
    rect: finalRect,
    lines,
    auto: mode === "auto" ? layer.auto : undefined,
    sourceDrawingId:
      typeof layer.sourceDrawingId === "string" && layer.sourceDrawingId.trim()
        ? layer.sourceDrawingId
        : undefined,
    sourceDrawingKind:
      layer.sourceDrawingKind === "polygon" ||
      layer.sourceDrawingKind === "polyline" ||
      layer.sourceDrawingKind === "rect" ||
      layer.sourceDrawingKind === "circle"
        ? layer.sourceDrawingKind
        : undefined,
    style: layer.style,
    locked: typeof layer.locked === "boolean" ? layer.locked : undefined,
    autoFlow: typeof layer.autoFlow === "boolean" ? layer.autoFlow : undefined,
    allowAngledBaselines:
      typeof layer.allowAngledBaselines === "boolean"
        ? layer.allowAngledBaselines
        : undefined,
  };
}

function normalizeLegacyRect(rect: LegacyTextLayerData["rect"]): TextBox["rect"] | null {
  if (!rect) return null;
  if (
    !Number.isFinite(rect.x0) ||
    !Number.isFinite(rect.y0) ||
    !Number.isFinite(rect.x1) ||
    !Number.isFinite(rect.y1)
  ) {
    return null;
  }

  return {
    x0: rect.x0,
    y0: rect.y0,
    x1: rect.x1,
    y1: rect.y1,
  };
}

function normalizeLegacyLines(lines: LegacyTextLayerData["lines"]): TextBaseline[] {
  if (!Array.isArray(lines)) return [];

  return lines.filter((ln): ln is TextBaseline => {
    return !!ln &&
      Number.isFinite(ln.x0) &&
      Number.isFinite(ln.y0) &&
      Number.isFinite(ln.x1) &&
      Number.isFinite(ln.y1);
  });
}

function deriveRectFromLegacyLines(lines: TextBaseline[]): TextBox["rect"] | null {
  if (!lines.length) return null;

  const xs = lines.flatMap((ln) => [ln.x0, ln.x1]);
  const ys = lines.flatMap((ln) => [ln.y0, ln.y1]);

  return {
    x0: Math.min(...xs),
    y0: Math.min(...ys),
    x1: Math.max(...xs),
    y1: Math.max(...ys),
  };
}

function isBaseImage(x: unknown): x is BaseImage {
  return !!x && typeof x === "object" && "path" in x && typeof (x as { path?: unknown }).path === "string";
}