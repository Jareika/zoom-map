import { Component, Modal, Notice, TFile, parseYaml, stringifyYaml, normalizePath, MarkdownRenderChild } from "obsidian";
import type { App } from "obsidian";
import { generateId, MarkerStore, sanitizeMarkerFileDataForSave } from "./markerStore";
import type {
  Marker,
  MarkerFileData,
  PingDistanceUnit,
  ImageOverlay,
  BaseImage,
  MarkerLayer,
  DrawLayer,
  Drawing,
  DrawingKind,
  FillPatternKind,
  TextLayer,
  TextBaseline,
  TextBox,
  TextBoxAutoConfig,
  TextLayerStyle,
  DiceRollSpec
} from "./markerStore";
import type ZoomMapPlugin from "./main";
import { MarkerEditorModal } from "./markerEditor";
import { ScaleCalibrateModal } from "./scaleCalibrateModal";
import { NoteMarkerStore } from "./inlineStore";
import { DrawingEditorModal } from "./drawingEditorModal";
import { ImageFileSuggestModal } from "./iconFileSuggest";
import { NamePromptModal } from "./namePrompt";
import { RenameLayerModal, DeleteLayerModal } from "./layerManageModals";
import { PinSizeEditorModal, type PinSizeEditorRow } from "./pinSizeEditorModal";
import { ViewEditorModal, type ViewEditorConfig } from "./viewEditorModal";
import { SwapFramesEditorModal } from "./collectionsModals";
import { SvgRasterExportModal } from "./svgRasterExportModal";
import { SwapLinksEditorModal, type SwapLinksEditorResult } from "./swapLinksEditorModal";
import { MeasureTerrainModal, type MeasureTerrainSegment } from "./measureTerrainModal";
import { SwitchPinModal, type SwitchPinModalResult } from "./switchPinModal";
import { TextBoxConfigModal } from "./textBoxConfigModal";
import { SecondScreenLayersModal } from "./secondScreenLayersModal";
import { DicePinModal } from "./dicePinModal";
import type { ScaleUnitValue } from "./scaleCalibrateModal";

/* ===== Collections (base-bound) ===== */
export interface MarkerPreset {
  name: string;
  iconKey?: string;
  tooltip?: string;
  layerName?: string;
  openEditor: boolean;
  linkTemplate?: string;
}

// ===== Ping pins =====
export interface PingPreset {
  id: string;
  name: string;
  iconKey?: string;
  layerName?: string;
  defaultScaleLikeSticker?: boolean;

  // radius menu entries (e.g. [2,5,10] with unit "km" or custom)
  distances: number[];
  unit: PingDistanceUnit; // "m" | "km" | "mi" | "ft" | "custom"
  customUnitId?: string;  // required when unit === "custom"

  // used for editing: which travel pack provides the custom units
  travelPackId?: string;

  // ping note creation
  noteFolder?: string; // vault folder path, e.g. "Pings/MyMap"

  filterTags?: string[];
  filterProps?: Record<string, string | string[]>;

  // Related notes section: how to expand search starting from in-range notes
  relatedLookup?: "off" | "tags" | "backlinks";
  searchLayersMode?: "all" | "self" | "custom";
  searchLayerNames?: string[]; // used when searchLayersMode === "custom"
  
  sections?: {
    bases?: boolean;
    related?: boolean;
    tooltips?: boolean;
    travelTimes?: boolean;
  };
}

export interface StickerPreset {
  name: string;
  imagePath: string;
  size: number;
  layerName?: string;
  openEditor: boolean;
}

export interface SwapPinFrame {
  iconKey: string;
  link?: string;
}

export interface SwapPinPreset {
  id: string;
  name: string;
  frames: SwapPinFrame[];
  defaultScaleLikeSticker?: boolean;
  defaultHud?: boolean;
  hoverPopover?: boolean;
  layerName?: string;
}

export interface BaseCollectionBinding {
  basePaths: string[];
  aliases?: string[]; // deprecated
}
export interface BaseCollectionOptions {
  showGlobalAlso?: boolean; // deprecated
}
export interface BaseCollection {
  id: string;
  name: string;
  enabled?: boolean; // deprecated
  bindings: BaseCollectionBinding;
  include: {
    pinKeys: string[];
    favorites: MarkerPreset[];
    stickers: StickerPreset[];
    swapPins?: SwapPinPreset[];
	pingPins?: PingPreset[];
  };
  options?: BaseCollectionOptions; // deprecated
}

/* ===== Map config/settings ===== */
export interface ZoomMapConfig {
  imagePath: string;
  markersPath: string;
  minZoom: number;
  maxZoom: number;
  sourcePath: string;
  width?: string;
  height?: string;
  resizable?: boolean;
  resizeHandle?: "left" | "right" | "both" | "native";
  align?: "left" | "center" | "right";
  wrap?: boolean;
  extraClasses?: string[];
  renderMode: "dom" | "canvas";
  yamlBases?: { path: string; name?: string }[];
  yamlOverlays?: { path: string; name?: string; visible?: boolean }[];
  yamlMetersPerPixel?: number;
  sectionStart?: number;
  sectionEnd?: number;
  widthFromYaml?: boolean;
  heightFromYaml?: boolean;
  storageMode?: "json" | "note";
  mapId?: string;
  responsive?: boolean;
  yamlMarkerLayers?: string[];
  initialZoom?: number;
  initialCenter?: { x: number; y: number };
  viewportFrame?: string;
  viewportFrameInsets?: {
    unit: "framePx" | "percent";
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  displayOnly?: boolean;
}

export interface IconProfile {
  key: string;
  pathOrDataUrl: string;
  size: number;
  anchorX: number;
  anchorY: number;
  defaultLink?: string;
  rotationDeg?: number;
  inCollections?: boolean;
}

export interface CustomUnitDef {
  id: string;
  name: string;
  abbreviation: string;
  metersPerUnit: number;
}

export interface TravelTimePreset {
  id: string;
  name: string;
  distanceValue: number;
  distanceUnit: "m" | "km" | "mi" | "ft" | "custom";
  distanceCustomUnitId?: string;
  timeValue: number;
  timeUnit: string;
}

export interface TravelPerDayConfig {
  value: number;
  unit: string;
}

export interface TravelPerDayPreset {
  id: string;
  name: string;
  value: number;
  unit: string;
}

export interface TerrainDef {
  id: string;
  name: string;
  factor: number;
}

export interface TravelRulesPack {
  id: string;
  name: string;
  enabled?: boolean;
  customUnits: CustomUnitDef[];
  terrains?: TerrainDef[];
  travelTimePresets: TravelTimePreset[];
  travelPerDayPresets?: TravelPerDayPreset[];
  /** Legacy (deprecated): single max travel time */
  travelPerDay?: TravelPerDayConfig;
}

export interface ZoomMapSettings {
  icons: IconProfile[];
  defaultIconKey: string;
  wheelZoomFactor: number;
  panMouseButton: "left" | "middle" | "right";
  hoverMaxWidth: number;
  applyHoverPopoverSizeGlobally: boolean,
  hoverMaxHeight: number;
  presets?: MarkerPreset[];
  stickerPresets?: StickerPreset[];
  defaultWidth: string;
  defaultHeight: string;
  defaultResizable: boolean;
  defaultResizeHandle: "left" | "right" | "both" | "native";
  forcePopoverWithoutModKey: boolean;
  measureLineColor: string;
  measureLineWidth: number;
  storageDefault: "json" | "note";
  baseCollections?: BaseCollection[];
  pinPlaceOpensEditor?: boolean;
  customUnits?: CustomUnitDef[];
  defaultScaleLikeSticker?: boolean;
  enableDrawing?: boolean;
  preferActiveLayerInEditor?: boolean;
  enableTextLayers?: boolean;
  enableMeasurePro?: boolean;
  travelTimePresets?: TravelTimePreset[];
  travelPerDay?: TravelPerDayConfig;
  travelRulesPacks?: TravelRulesPack[];
  showLinkFileNameInTooltip?: boolean;
  svgRasterMaxScale?: 2 | 4 | 8;
  
  // Session image cache
  enableSessionImageCache?: boolean;
  sessionImageCacheMb?: number;
  keepOverlaysLoaded?: boolean;
  preferCanvasImagesWhenCaching?: boolean;
  showImageIconPreviewInSettings?: boolean;
  middleClickOpensLinkInNewTab?: boolean;
  enableSecondScreen?: boolean;
  secondScreenFolder?: string;
}

interface Point { x: number; y: number; }

type LayerTriState = "visible" | "locked" | "hidden";

const PING_TOOLTIP_BEGIN = "<!-- ZOOMMAP-PING-TOOLTIP:BEGIN -->";
const PING_TOOLTIP_END = "<!-- ZOOMMAP-PING-TOOLTIP:END -->";
const PING_RELATED_BEGIN = "<!-- ZOOMMAP-PING-RELATED:BEGIN -->";
const PING_RELATED_END = "<!-- ZOOMMAP-PING-RELATED:END -->";
const PING_TRAVEL_BEGIN = "<!-- ZOOMMAP-PING-TRAVEL:BEGIN -->";
const PING_TRAVEL_END = "<!-- ZOOMMAP-PING-TRAVEL:END -->";

/* ===== Helpers ===== */
function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}
function basename(p: string): string {
  const idx = p.lastIndexOf("/");
  return idx >= 0 ? p.slice(idx + 1) : p;
}
function setCssProps(el: HTMLElement, props: Record<string, string | null>): void {
  for (const [key, value] of Object.entries(props)) {
    if (value === null) el.style.removeProperty(key);
    else el.style.setProperty(key, value);
  }
}

function stableStringify(value: unknown): string {
  const seen = new WeakSet<object>();

  const norm = (v: unknown): unknown => {
    if (v && typeof v === "object") {
      if (seen.has(v)) return null;
      seen.add(v);

      if (Array.isArray(v)) return v.map(norm);

      const obj = v as Record<string, unknown>;
      const out: Record<string, unknown> = {};
      for (const k of Object.keys(obj).sort()) out[k] = norm(obj[k]);
      return out;
    }
    return v;
  };

  return JSON.stringify(norm(value));
}

function stableEqual(a: unknown, b: unknown): boolean {
  return stableStringify(a) === stableStringify(b);
}

function isImageBitmapLike(x: unknown): x is ImageBitmap {
  return typeof x === "object" && x !== null && "close" in x && typeof (x as { close: unknown }).close === "function";
}

function isSvgDataUrl(src: string): boolean {
  return typeof src === "string" && src.startsWith("data:image/svg+xml");
}

function diceRollsToFormula(rolls: DiceRollSpec[] | undefined): string {
  const parts = (rolls ?? [])
    .filter((r) => r && Number.isFinite(r.count) && Number.isFinite(r.sides) && r.count > 0 && r.sides > 0)
    .map((r) => `${Math.round(r.count)}d${Math.round(r.sides)}`);
  return parts.length ? parts.join(" + ") : "1d20";
}

function localRollDice(rolls: DiceRollSpec[] | undefined): { total: number; details: string } {
  const rs = (rolls ?? []).filter((r) => r && Number.isFinite(r.count) && Number.isFinite(r.sides) && r.count > 0 && r.sides > 1);
  const cleaned = rs.length ? rs : [{ count: 1, sides: 20 }];

  const per: string[] = [];
  let total = 0;

  for (const r of cleaned) {
    const n = Math.max(1, Math.round(r.count));
    const s = Math.max(2, Math.round(r.sides));
    const vals: number[] = [];
    for (let i = 0; i < n; i += 1) {
      const v = 1 + Math.floor(Math.random() * s);
      vals.push(v);
      total += v;
    }
    per.push(`${n}d${s}=[${vals.join(", ")}]`);
  }

  return { total, details: per.join(" + ") };
}

function formatDiceApiResult(x: unknown): string {
  if (x == null) return "";
  if (typeof x === "string") return x;
  if (typeof x === "number" || typeof x === "boolean" || typeof x === "bigint") return String(x);
  if (x instanceof Error) return x.message || "Error";
  try {
    return JSON.stringify(x);
  } catch {
    return "";
  }
}

// --- Blockquote / callout helpers (for embedded zoommap blocks) ---
function splitQuotePrefix(line: string): { prefix: string; rest: string } {
  const len = line.length;
  let i = 0;

  while (i < len && (line[i] === " " || line[i] === "\t")) i++;

  if (i >= len || line[i] !== ">") return { prefix: "", rest: line };

  while (i < len && line[i] === ">") {
    i++;

    if (i < len && (line[i] === " " || line[i] === "\t")) i++;

    let j = i;
    while (j < len && (line[j] === " " || line[j] === "\t")) j++;

    if (j < len && line[j] === ">") {
      i = j;
      continue;
    }

    break;
  }

  return { prefix: line.slice(0, i), rest: line.slice(i) };
}

function stripQuotePrefix(line: string): string {
  return splitQuotePrefix(line).rest;
}

function tintSvgMarkupLocal(svg: string, color: string): string {
  const c = color.trim();
  if (!c) return svg;

  try {
    const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
    const root = doc.querySelector("svg");
    if (!root) return svg;

    const inner = root.querySelector("#zm-inner") ?? root;
    const base = root.querySelector("#zm-base");
    const outline = root.querySelector("#zm-outline");

    const shapes = inner.querySelectorAll<SVGElement>("path, circle, rect, polygon, polyline, line, ellipse");
    let touched = false;

    shapes.forEach((el) => {
      if (base && base.contains(el)) return;
      if (outline && outline.contains(el)) return;

      const styleFill = (el as unknown as { style?: CSSStyleDeclaration }).style?.fill;
      const styleStroke = (el as unknown as { style?: CSSStyleDeclaration }).style?.stroke;

      const fillAttr = el.getAttribute("fill");
      const strokeAttr = el.getAttribute("stroke");

      const hasFill =
        (typeof styleFill === "string" && styleFill && styleFill.toLowerCase() !== "none") ||
        (typeof fillAttr === "string" && fillAttr && fillAttr.toLowerCase() !== "none");
      const hasStroke =
        (typeof styleStroke === "string" && styleStroke && styleStroke.toLowerCase() !== "none") ||
        (typeof strokeAttr === "string" && strokeAttr && strokeAttr.toLowerCase() !== "none");

      if (hasFill) {
        (el as unknown as { style: CSSStyleDeclaration }).style.fill = c;
        el.setAttribute("fill", c);
        touched = true;
      }
      if (hasStroke) {
        (el as unknown as { style: CSSStyleDeclaration }).style.stroke = c;
        el.setAttribute("stroke", c);
        touched = true;
      }
    });

    if (!touched) {
      (inner as SVGElement).setAttribute("fill", c);
    }

    return new XMLSerializer().serializeToString(root);
  } catch {
    return svg;
  }
}

/* Per-marker option accessors (typed; avoid any) */
function getMinZoom(m: Marker): number | undefined { return m.minZoom; }
function getMaxZoom(m: Marker): number | undefined { return m.maxZoom; }
function isScaleLikeSticker(m: Marker): boolean { return !!m.scaleLikeSticker; }

interface ScreenDisplayPluginApi {
  sendNoteByPath(path: string): Promise<void>;
}

export class MapInstance extends MarkdownRenderChild {
  private app: App;
  private plugin: ZoomMapPlugin;
  private el: HTMLElement;

  private viewportEl!: HTMLDivElement;
  private clipEl!: HTMLDivElement;
  private hudClipEl!: HTMLDivElement;  
  private worldEl!: HTMLDivElement;

  private imgEl!: HTMLImageElement;
  private overlaysEl!: HTMLDivElement;
  private markersEl!: HTMLDivElement;
  private hudMarkersEl!: HTMLDivElement;

  private measureEl!: HTMLDivElement;
  private measureSvg!: SVGSVGElement;
  private measurePath!: SVGPathElement;
  private measureDots!: SVGGElement;
  private calibPath!: SVGPathElement;
  private calibDots!: SVGGElement;
  private measureHud!: HTMLDivElement;
  
  // Draw overlay (static shapes + draft)
  private drawEl!: HTMLDivElement;
  private drawSvg!: SVGSVGElement;
  private drawDefs!: SVGDefsElement;
  private drawStaticLayer!: SVGGElement;
  private drawDraftLayer!: SVGGElement;
  private drawEditHudEl!: HTMLDivElement;

  private drawEditDrawingId: string | null = null;
  private drawEditMode: "points" | "rect" | "circle" | null = null;
  private drawEditPointIndex: number | null = null;
  private drawEditHandleKind: string | null = null;
  private drawEditPointerId: number | null = null;
  private drawEditOriginalDrawing: Drawing | null = null;

  private zoomHud!: HTMLDivElement;
  private zoomHudTimer: number | null = null;

  private initialLayoutDone = false;
  
  private initialViewApplied = false;
  private lastGoodView: { scale: number; center: { x: number; y: number } } | null = null;

  private overlayMap: Map<string, HTMLImageElement> = new Map<string, HTMLImageElement>();

  private baseCanvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private baseSource: CanvasImageSource | null = null;

  private overlaySources: Map<string, CanvasImageSource> = new Map<string, CanvasImageSource>();
  private overlayLoading: Map<string, Promise<CanvasImageSource | null>> = new Map<string, Promise<CanvasImageSource | null>>();

  // Session-cache tracking (per map instance)
  private acquiredSessionPaths: Set<string> = new Set<string>();
  private baseIsSvg = false;
  private svgRasterScale = 1; // actual bitmapWidth / logicalWidth for current baseSource

  // Per-note SVG base raster cache (kept while note/tab stays open)
  private svgBaseCache: Map<string, Map<number, ImageBitmap>> = new Map();
  private svgUpgradeInFlight: Map<string, Map<number, Promise<ImageBitmap | null>>> = new Map();

  // Safety cap (avoid extreme allocations)
  private readonly svgRasterMaxSidePx = 8192;

  private getSvgRasterMaxScale(): number {
    return this.plugin.settings.svgRasterMaxScale ?? 8;
  }

  // Text layers (character sheets)
  private textSvgWrap!: HTMLDivElement;
  private textSvg!: SVGSVGElement;
  private textGuidesLayer!: SVGGElement;
  private textDraftLayer!: SVGGElement;
  private textTextLayer!: SVGGElement;

  private textHitEl!: HTMLDivElement;
  private textEditEl!: HTMLDivElement;

  private textMode: null | "draw-box" | "draw-lines" | "edit" | "move" = null;
  private activeTextLayerId: string | null = null;
  private activeTextBoxId: string | null = null;

  private textDrawStart: Point | null = null;
  private textDrawPreview: Point | null = null;

  private textLineStart: Point | null = null;
  private textLinePreview: Point | null = null;

  private textInputs: Map<string, HTMLInputElement> = new Map();
  private textDirty = false;
  private textSaveTimer: number | null = null;

  private textOutsideCleanup: (() => void) | null = null;
  
  private textMoveDragging = false;
  private textMovePointerId: number | null = null;
  private textDrawBoxMode: "custom" | "auto" = "custom";
  private textMoveStart: Point | null = null;
  private textMoveOrig: { rect: TextBox["rect"]; lines: TextBaseline[] } | null = null;

  private textMeasureSpan: HTMLSpanElement | null = null;
  
  // Ping pins (notes + Bases)
  private pingUpdateTimer: number | null = null;

  private cfg: ZoomMapConfig;
  private store: MarkerStore | NoteMarkerStore;
  private data: MarkerFileData | undefined;

  private imgW = 0;
  private imgH = 0;
  private vw = 0;
  private vh = 0;

  private scale = 1;
  private tx = 0;
  private ty = 0;

  private draggingView = false;
  private lastPos: Point = { x: 0, y: 0 };

  private draggingMarkerId: string | null = null;
  private dragAnchorOffset: { dx: number; dy: number } | null = null;
  private dragMoved = false;
  private suppressClickMarkerId: string | null = null;

  private tooltipEl: HTMLDivElement | null = null;
  private tooltipHideTimer: number | null = null;
  
  private frameLayerEl: HTMLDivElement | null = null;
  private viewportFrameEl: HTMLImageElement | null = null;
  private frameNaturalW = 0;
  private frameNaturalH = 0; 

  private ignoreNextModify = false;

  private ro: ResizeObserver | null = null;
  private calloutMo: MutationObserver | null = null;
  private ready = false;

  private openMenu: ZMMenu | null = null;
  private suppressContextMenuOnce = false;
  private draggingViewButton: number | null = null;

  // Measurement state
  private measuring = false;
  private measurePts: Point[] = [];
  private measurePreview: Point | null = null;
  private measureSegTerrainIds: string[] = [];

  // Calibration state
  private calibrating = false;
  private calibPts: Point[] = [];
  private calibPreview: Point | null = null;
  
  // Drawing state
  private drawingMode: DrawingKind | null = null;
  private drawingActiveLayerId: string | null = null;
  private drawRectStart: Point | null = null;
  private drawCircleCenter: Point | null = null;
  private drawPolygonPoints: Point[] = [];
  private viewDragDist = 0;
  private viewDragMoved = false;
  private suppressTextClickOnce = false;

  private panRAF: number | null = null;
  private panAccDx = 0;
  private panAccDy = 0;

  private activePointers: Map<number, { x: number; y: number }> = new Map<number, { x: number; y: number }>();
  private pinchActive = false;
  private pinchStartScale = 1;
  private pinchStartDist = 0;
  private pinchPrevCenter: { x: number; y: number } | null = null;

  private touchGestureCandidate = false;
  private touchGestureLocked = false;
  private touchGestureStartX = 0;
  private touchGestureStartY = 0;
  private readonly touchGestureLockThresholdPx = 8;
  private readonly touchGestureEdgeGuardPx = 28;

  private currentBasePath: string | null = null;

  private frameSaveTimer: number | null = null;
  private userResizing = false;

  private yamlAppliedOnce = false;
  
  private ensureMarkerLayersByNames(names: string[] | undefined): void {
    if (!this.data) return;
    const list = (names ?? []).map((s) => (s ?? "").trim()).filter(Boolean);
    if (list.length === 0) return;

    this.data.layers ??= [{ id: "default", name: "Default", visible: true, locked: false }];

    const existingByName = new Set(this.data.layers.map((l) => (l.name ?? "").trim()));
    for (const name of list) {
      if (existingByName.has(name)) continue;
      const id = generateId("layer");
      this.data.layers.push({ id, name, visible: true, locked: false });
      existingByName.add(name);
    }
  }
  
  private stripYamlScalar(s: string): string {
    const t = s.trim();
    if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
      return t.slice(1, -1);
    }
    return t;
  }
  
  private isPlainObject(val: unknown): val is Record<string, unknown> {
    return typeof val === "object" && val !== null && !Array.isArray(val);
  }

  private parseZoommapYamlFromBlock(lines: string[], blk: { start: number; end: number }): Record<string, unknown> | null {
    const raw = lines
      .slice(blk.start + 1, blk.end)
      .map((ln) => stripQuotePrefix(ln))
      .join("\n");
    try {
      const parsed: unknown = parseYaml(raw);
      return this.isPlainObject(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  private firstBasePathFromYaml(obj: Record<string, unknown>): string {
    const bases = obj["imageBases"];
    if (!Array.isArray(bases) || bases.length === 0) return "";
    const first = bases[0] as unknown;
    if (typeof first === "string") return first.trim();
    if (this.isPlainObject(first) && typeof first["path"] === "string") return String(first["path"]).trim();
    return "";
  }

  private scalarString(obj: Record<string, unknown>, key: string): string {
    const v = obj[key];
    return typeof v === "string" ? v.trim() : "";
  }

  private computeEffectiveImageFromYaml(obj: Record<string, unknown>): string {
    return this.scalarString(obj, "image") || this.firstBasePathFromYaml(obj);
  }

  private computeEffectiveMarkersFromYaml(obj: Record<string, unknown>): string {
    const m = this.scalarString(obj, "markers");
    if (m) return m;
    const img = this.computeEffectiveImageFromYaml(obj);
    return img ? `${img}.markers.json` : "";
  }

  private findAllZoommapBlocks(lines: string[]): { start: number; end: number }[] {
    const blocks: { start: number; end: number }[] = [];
    for (let i = 0; i < lines.length; i++) {
      const ln = stripQuotePrefix(lines[i]).trimStart().toLowerCase();
      if (!ln.startsWith("```zoommap")) continue;
      let j = i + 1;
      while (j < lines.length && !stripQuotePrefix(lines[j]).trimStart().startsWith("```")) j++;
      if (j >= lines.length) break;
      blocks.push({ start: i, end: j });
      i = j;
    }
    return blocks;
  }
  
  private async upsertYamlMarkersPath(newMarkersPath: string): Promise<boolean> {
    const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
    if (!(af instanceof TFile)) return false;

    let foundBlock = false;
    let didChange = false;

    await this.app.vault.process(af, (text) => {
      const lines = text.split("\n");
      const blk = this.findZoommapBlockForThisMap(lines);
      if (!blk) return text;
      foundBlock = true;

      const blkPrefix = splitQuotePrefix(lines[blk.start] ?? "").prefix;
      const content = lines.slice(blk.start + 1, blk.end);

      const keyRe = /^(\s*)markers\s*:\s*(.*)$/i;
      let keyIdx = -1;
      let keyIndent = "";
      let keyPrefix = blkPrefix;

      for (let i = 0; i < content.length; i++) {
        const info = splitQuotePrefix(content[i]);
        const m = keyRe.exec(info.rest);
        if (m) {
          keyIdx = i;
          keyIndent = m[1] ?? "";
          keyPrefix = info.prefix || blkPrefix;
          break;
        }
      }

      const newLine = `${keyPrefix}${keyIndent}markers: ${JSON.stringify(newMarkersPath)}`;
      const out = content.slice();

      if (keyIdx >= 0) {
        if (out[keyIdx] !== newLine) {
          out[keyIdx] = newLine;
          didChange = true;
        }
      } else {
        const indent = this.detectYamlKeyIndent(out);
        out.push(`${blkPrefix}${indent}markers: ${JSON.stringify(newMarkersPath)}`);
        didChange = true;
      }

      if (!didChange) return text;

      return [
        ...lines.slice(0, blk.start + 1),
        ...out,
        ...lines.slice(blk.end),
      ].join("\n");
    });

    return foundBlock && didChange;
  }

  private computeMarkersPathForBase(basePath: string): string {
    return normalizePath(`${basePath}.markers.json`);
  }

  private async ensureFolderForPath(path: string): Promise<void> {
    const dir = normalizePath(path).split("/").slice(0, -1).join("/");
    if (dir && !this.app.vault.getAbstractFileByPath(dir)) {
      await this.app.vault.createFolder(dir);
    }
  }

  private async moveCurrentMarkersFileToBase(newBasePath: string): Promise<string> {
    // only for json storage
    if (this.cfg.storageMode !== "json") {
      throw new Error("Cannot move markers.json when storage mode is 'note'.");
    }

    const oldMarkersPath = normalizePath(this.store.getPath());
    const oldAf = this.app.vault.getAbstractFileByPath(oldMarkersPath);
    if (!(oldAf instanceof TFile)) {
      throw new Error(`Current markers.json not found: ${oldMarkersPath}`);
    }

    await this.saveDataSoon(); // flush any pending writes to the current store

    const wanted = this.computeMarkersPathForBase(newBasePath);
    await this.ensureFolderForPath(wanted);

    // avoid collision
    let finalPath = normalizePath(wanted);
    const base = finalPath.slice(0, -".markers.json".length);
    let i = 1;
    while (this.app.vault.getAbstractFileByPath(finalPath)) {
      finalPath = normalizePath(`${base}-${i}.markers.json`);
      i++;
    }

    await this.app.vault.rename(oldAf, finalPath);
    return finalPath;
  }

  private readYamlScalarFromBlock(blockLines: string[], key: string): string | null {
    const re = new RegExp(`^\\s*${key}\\s*:\\s*(.+)\\s*$`, "i");
    for (const ln of blockLines) {
      const rest = stripQuotePrefix(ln);
      const m = re.exec(rest);
      if (m) return this.stripYamlScalar(m[1] ?? "");
    }
    return null;
  }

  private findZoommapBlockForThisMap(lines: string[]): { start: number; end: number } | null {
    const wantId = (this.cfg.mapId ?? "").trim();
    const wantMarkers =
      this.cfg.storageMode === "json" ? normalizePath(this.cfg.markersPath ?? "") : "";
    const wantImage = normalizePath(this.cfg.imagePath ?? "");

    const all = this.findAllZoommapBlocks(lines);

    // 1) Best match: id (most reliable, esp. with nested callouts + multiple maps)
    if (wantId) {
      let found: { start: number; end: number } | null = null;
      let dupCount = 0;

      for (const blk of all) {
        const y = this.parseZoommapYamlFromBlock(lines, blk);
        if (!y) continue;

        const id = this.scalarString(y, "id");
        if (id !== wantId) continue;

        if (!found) found = blk;
        else dupCount++;
      }

      if (found) {
        if (dupCount > 0) {
          console.warn(
            "Zoom Map: duplicate zoommap id detected in note.",
            { id: wantId, duplicates: dupCount + 1, sourcePath: this.cfg.sourcePath },
          );
        }
        return found;
      }
    }

    // 2) Fallback: sectionStart based lookup (can be unreliable in nested callouts)
    if (typeof this.cfg.sectionStart === "number") {
      const blk = this.findZoommapBlock(lines, this.cfg.sectionStart);
      if (blk) return blk;
    }

    // 3) Fallback: markersPath / image match
    let best: { start: number; end: number } | null = null;

    for (const blk of all) {
      const y = this.parseZoommapYamlFromBlock(lines, blk);
      if (!y) continue;

      const image = this.computeEffectiveImageFromYaml(y);
      const markers = this.computeEffectiveMarkersFromYaml(y);

      if (!best && wantMarkers && markers && normalizePath(markers) === wantMarkers) {
        best = blk;
        continue;
      }

      if (!best && wantImage && image && normalizePath(image) === wantImage) {
        best = blk;
      }
    }

    return best;
  }
  
  private openViewEditorFromMap(): void {
  if (!this.data) return;

  const bases = this.getBasesNormalized();
  const overlays = this.data.overlays ?? [];

  const rect = this.viewportEl.getBoundingClientRect();
  const curW = Math.round(rect.width || 0);
  const curH = Math.round(rect.height || 0);

  const cfg: ViewEditorConfig = {
    imageBases: bases.map((b) => ({ path: b.path, name: b.name })),
    overlays: overlays.map((o) => ({
      path: o.path,
      name: o.name,
      visible: o.visible,
    })),
    markersPath: this.cfg.storageMode === "json" ? this.cfg.markersPath : "",
    renderMode: this.cfg.renderMode,
    minZoom: this.cfg.minZoom,
    maxZoom: this.cfg.maxZoom,
    wrap: !!this.cfg.wrap,
    responsive: !!this.cfg.responsive,

    width: curW > 0 ? `${curW}px` : (this.cfg.width ?? ""),
    height: curH > 0 ? `${curH}px` : (this.cfg.height ?? ""),

    useWidth: !!this.cfg.widthFromYaml,
    useHeight: !!this.cfg.heightFromYaml,

    resizable: !!this.cfg.resizable,
    resizeHandle: this.cfg.resizeHandle ?? "right",
    align: this.cfg.align,
    markerLayers: this.data.layers.map((l) => l.name ?? "Layer"),
	
	id: this.cfg.mapId,

    viewportFrame: this.cfg.viewportFrame ?? "",
    viewportFrameInsets: this.cfg.viewportFrameInsets ?? {
      unit: "framePx",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  };

  const modal = new ViewEditorModal(this.app, cfg, (res) => {
    if (res.action !== "save" || !res.config) return;
    void this.applyViewEditorResult(res.config);
  }, {
    onPreview: (previewCfg) => {
      // Apply only frame preview live (no YAML write)
      this.previewViewportFrameFromViewEditor({
        viewportFrame: previewCfg.viewportFrame,
        viewportFrameInsets: previewCfg.viewportFrameInsets,
      });
    },
  });
  modal.open();
  }

  private applyInitialView(zoom: number, center: { x: number; y: number }): void {
    const z = clamp(zoom, this.cfg.minZoom, this.cfg.maxZoom);

    const r = this.viewportEl.getBoundingClientRect();
    this.vw = r.width;
    this.vh = r.height;
  
    if (this.vw < 2 || this.vh < 2) {
      return;
    }

    if (!this.imgW || !this.imgH || !this.vw || !this.vh) {
      this.fitToView();
      return;
    }

    const worldX = center.x * this.imgW;
    const worldY = center.y * this.imgH;

    const tx = this.vw / 2 - worldX * z;
    const ty = this.vh / 2 - worldY * z;

    this.applyTransform(z, tx, ty);
    this.initialViewApplied = true;
    this.captureViewIfVisible();
	this.renderDrawingEditHandles();
  }

  private captureViewIfVisible(): void {
    if (!this.imgW || !this.imgH) return;
    const r = this.viewportEl.getBoundingClientRect();
    const vw = r.width || 0;
    const vh = r.height || 0;
    if (vw < 2 || vh < 2) return;
    const worldX = (vw / 2 - this.tx) / this.scale;
    const worldY = (vh / 2 - this.ty) / this.scale;

    this.lastGoodView = {
      scale: this.scale,
      center: {
        x: clamp(worldX / this.imgW, 0, 1),
        y: clamp(worldY / this.imgH, 0, 1),
      },
    };
  }

  private async saveDefaultViewToYaml(): Promise<void> {
    const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
    if (!(af instanceof TFile)) {
      new Notice("Source note not found.", 2500);
      return;
    }

    const z = this.scale;
    if (!this.imgW || !this.imgH || !Number.isFinite(z) || z <= 0) {
      new Notice("Cannot store default view (image not ready).", 2500);
      return;
    }

    const r = this.viewportEl.getBoundingClientRect();
    const vw = r.width || this.vw || 1;
    const vh = r.height || this.vh || 1;
    const centerScreenX = vw / 2;
    const centerScreenY = vh / 2;

    const worldX = (centerScreenX - this.tx) / z;
    const worldY = (centerScreenY - this.ty) / z;

    const cx = Math.min(Math.max(worldX / this.imgW, 0), 1);
    const cy = Math.min(Math.max(worldY / this.imgH, 0), 1);

    const zoom = z;
      let foundBlock = false;
      let didChange = false;

      await this.app.vault.process(af, (text) => {
      const lines = text.split("\n");
      const blk = this.findZoommapBlockForThisMap(lines);
      if (!blk) return text;
      foundBlock = true;
	
      const blkPrefix = splitQuotePrefix(lines[blk.start] ?? "").prefix;

      const content = lines.slice(blk.start + 1, blk.end);
      const keyRe = /^(\s*)view\s*:/;
      let keyIdx = -1;
      let keyIndent = "";
      let keyPrefix = blkPrefix;

      for (let i = 0; i < content.length; i++) {
        const info = splitQuotePrefix(content[i]);
        const m = keyRe.exec(info.rest);
        if (m) {
          keyIdx = i;
          keyIndent = m[1] ?? "";
          keyPrefix = info.prefix || blkPrefix;
          break;
        }
      }

      const viewLines = [
        `${keyPrefix}${keyIndent}view:`,
        `${keyPrefix}${keyIndent}  zoom: ${zoom.toFixed(4)}`,
        `${keyPrefix}${keyIndent}  centerX: ${cx.toFixed(6)}`,
        `${keyPrefix}${keyIndent}  centerY: ${cy.toFixed(6)}`,
      ];

      const isNextTopLevelKey = (ln: string) => {
        const rest = stripQuotePrefix(ln);
        const trimmed = rest.trim();
        if (!trimmed) return false;
        if (trimmed.startsWith("#")) return false;
        const spaces = (/^\s*/.exec(rest))?.[0].length ?? 0;
        return spaces <= keyIndent.length && /^[A-Za-z0-9_-]+\s*:/.test(trimmed);
      };

      let newContent: string[];

      if (keyIdx >= 0) {
        let end = keyIdx + 1;
        while (end < content.length && !isNextTopLevelKey(content[end])) end++;

        newContent = [
          ...content.slice(0, keyIdx),
          ...viewLines,
          ...content.slice(end),
        ];
      } else {
        const indent = this.detectYamlKeyIndent(content);
        const pfx = blkPrefix;
        const vLines = [
          `${pfx}${indent}view:`,
          `${pfx}${indent}  zoom: ${zoom.toFixed(4)}`,
          `${pfx}${indent}  centerX: ${cx.toFixed(6)}`,
          `${pfx}${indent}  centerY: ${cy.toFixed(6)}`,
        ];
        newContent = [...content, ...vLines];
      }

      if (newContent.join("\n") !== content.join("\n")) didChange = true;

      return [
        ...lines.slice(0, blk.start + 1),
        ...newContent,
        ...lines.slice(blk.end),
      ].join("\n");
    });

      if (!foundBlock) {
        new Notice("Could not locate zoommap block (embedded/callout?).", 3500);
        return;
      }
      if (!didChange) {
        new Notice("Default view unchanged (already up to date).", 2000);
        return;
      }
      new Notice("Default view stored in YAML.", 2000);
  }
  
  private async deleteDefaultViewFromYaml(): Promise<void> {
    const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
    if (!(af instanceof TFile)) {
      new Notice("Source note not found.", 2500);
      return;
    }

    let foundBlock = false;
    let didChange = false;

    await this.app.vault.process(af, (text) => {
      const lines = text.split("\n");
      const blk = this.findZoommapBlockForThisMap(lines);
      if (!blk) return text;
      foundBlock = true;

      const blkPrefix = splitQuotePrefix(lines[blk.start] ?? "").prefix;
      const content = lines.slice(blk.start + 1, blk.end);

      const keyRe = /^(\s*)view\s*:/i;
      let keyIdx = -1;
      let keyIndent = "";

      for (let i = 0; i < content.length; i++) {
        const info = splitQuotePrefix(content[i]);
        const m = keyRe.exec(info.rest);
        if (m) {
          keyIdx = i;
          keyIndent = m[1] ?? "";
          break;
        }
      }

      if (keyIdx < 0) return text;

      const isNextTopLevelKey = (ln: string) => {
        const rest = stripQuotePrefix(ln);
        const trimmed = rest.trim();
        if (!trimmed) return false;
        if (trimmed.startsWith("#")) return false;
        const spaces = (/^\s*/.exec(rest))?.[0].length ?? 0;
        return spaces <= keyIndent.length && /^[A-Za-z0-9_-]+\s*:/.test(trimmed);
      };

      let end = keyIdx + 1;
      while (end < content.length && !isNextTopLevelKey(content[end])) end++;

      const newContent = [
        ...content.slice(0, keyIdx),
        ...content.slice(end),
      ];

      if (newContent.join("\n") !== content.join("\n")) didChange = true;

      return [
        ...lines.slice(0, blk.start + 1),
        ...newContent.map((ln) => (blkPrefix ? blkPrefix + stripQuotePrefix(ln) : ln)),
        ...lines.slice(blk.end),
      ].join("\n");
    });

    if (!foundBlock) {
      new Notice("Could not locate zoommap block (embedded/callout?).", 3500);
      return;
    }
    if (!didChange) {
      new Notice("No default view found in YAML.", 2000);
      return;
    }
    new Notice("Default view removed from YAML.", 2000);
  }

  private async applyViewEditorResult(cfg: ViewEditorConfig): Promise<void> {

    const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
    if (!(af instanceof TFile)) {
      new Notice("Source note not found.", 3000);
      return;
    }

    const buildYaml = (pluginCfg: ViewEditorConfig): string => this.plugin.buildYamlFromViewConfig(pluginCfg);

    let foundBlock = false;
    let didChange = false;

    await this.app.vault.process(af, (text) => {
      const lines = text.split("\n");
      const blk = this.findZoommapBlockForThisMap(lines);
      if (!blk) return text;
      foundBlock = true;

      const blkPrefix = splitQuotePrefix(lines[blk.start] ?? "").prefix;

      // Parse existing YAML (so we can preserve keys that are NOT managed by the view editor, e.g. `view:`)
      const existingObj = this.parseZoommapYamlFromBlock(lines, blk) ?? {};

      // Parse new YAML (generated from the view editor modal)
      const nextYamlStr = buildYaml(cfg);
      let nextObj: Record<string, unknown> = {};
      try {
	    const parsed: unknown = parseYaml(nextYamlStr);
        if (this.isPlainObject(parsed)) nextObj = parsed;
      } catch {
        // If parsing fails, fall back to full replace (old behavior)
        nextObj = {};
      }

      // Merge: keep unknown keys from existing, overwrite managed keys from next
      const merged: Record<string, unknown> = { ...existingObj, ...nextObj };

      // If a key is "managed" by the view editor and missing in nextObj, remove it from merged
      // (e.g. user unticks "useWidth"/"useHeight" => width/height should be removed)
      const managedKeys = [
        "image",
        "imageBases",
        "imageOverlays",
        "markers",
        "markerLayers",
        "minZoom",
        "maxZoom",
        "wrap",
        "responsive",
        "width",
        "height",
        "resizable",
        "resizeHandle",
        "render",
        "align",
        "id",
        "viewportFrame",
        "viewportFrameInsets",
      ] as const;

      for (const k of managedKeys) {
        if (!(k in nextObj) && k in merged) {
          delete merged[k];
        }
      }

      const mergedYamlStr = stringifyYaml(merged).trimEnd();
      const yamlLinesRaw = mergedYamlStr.split("\n");
      const yamlLines = blkPrefix ? yamlLinesRaw.map((ln) => `${blkPrefix}${ln}`) : yamlLinesRaw;

      const before = lines.slice(blk.start + 1, blk.end).join("\n");
      const after = yamlLines.join("\n");
      if (before !== after) didChange = true;

      return [
        ...lines.slice(0, blk.start + 1),
        ...yamlLines,
        ...lines.slice(blk.end),
      ].join("\n");
    });

    if (!foundBlock) {
      new Notice("Could not locate zoommap block (embedded/callout?).", 3500);
      return;
    }
    if (!didChange) {
      new Notice("No changes to apply.", 2000);
      return;
    }
	
    try {
      this.ensureMarkerLayersByNames(cfg.markerLayers);
      await this.saveDataSoon();
      this.renderMarkersOnly();
    } catch (e) {
      console.warn("Failed to apply markerLayers to marker store", e);
    }
    new Notice("View updated.", 2500);
  }
  
  private tintedSvgCache: Map<string, string> = new Map<string, string>();
  
  private getScreenDisplayPlugin(): ScreenDisplayPluginApi | null {
    const registry =
      (this.app as unknown as {
        plugins?: { plugins?: Record<string, unknown> };
      }).plugins?.plugins ?? {};

    const raw = registry["ttrpg-tools-screen"] as
      | { sendNoteByPath?: (path: string) => Promise<void> }
      | undefined;

    if (!raw || typeof raw.sendNoteByPath !== "function") return null;
    return { sendNoteByPath: raw.sendNoteByPath.bind(raw) };
  }

  private secondScreenFeatureEnabled(): boolean {
    return !!this.plugin.settings.enableSecondScreen;
  }

  private ensureSecondScreenConfig(): NonNullable<MarkerFileData["secondScreen"]> {
    if (!this.data) throw new Error("Map data not loaded.");
    this.data.secondScreen ??= {};
    return this.data.secondScreen;
  }

  private getSecondScreenSelectedIds(): {
    markerLayerIds: Set<string>;
    drawLayerIds: Set<string>;
    textLayerIds: Set<string>;
  } {
    if (!this.data) {
      return {
        markerLayerIds: new Set(),
        drawLayerIds: new Set(),
        textLayerIds: new Set(),
      };
    }

    const sec = this.ensureSecondScreenConfig();

    const markerLayerIds = Array.isArray(sec.markerLayerIds)
      ? new Set(sec.markerLayerIds)
      : new Set((this.data.layers ?? []).map((l) => l.id));

    const drawLayerIds = Array.isArray(sec.drawLayerIds)
      ? new Set(sec.drawLayerIds)
      : new Set((this.data.drawLayers ?? []).map((l) => l.id));

    const textLayerIds = Array.isArray(sec.textLayerIds)
      ? new Set(sec.textLayerIds)
      : new Set((this.data.textLayers ?? []).map((l) => l.id));

    return { markerLayerIds, drawLayerIds, textLayerIds };
  }

  private openSecondScreenLayersModal(): void {
    if (!this.data) return;

    const sec = this.ensureSecondScreenConfig();

    const markerSelected = Array.isArray(sec.markerLayerIds)
      ? new Set(sec.markerLayerIds)
      : new Set((this.data.layers ?? []).map((l) => l.id));

    const drawSelected = Array.isArray(sec.drawLayerIds)
      ? new Set(sec.drawLayerIds)
      : new Set((this.data.drawLayers ?? []).map((l) => l.id));

    const textSelected = Array.isArray(sec.textLayerIds)
      ? new Set(sec.textLayerIds)
      : new Set((this.data.textLayers ?? []).map((l) => l.id));

    new SecondScreenLayersModal(
      this.app,
      {
        markerLayers: (this.data.layers ?? []).map((l) => ({
          id: l.id,
          name: l.name ?? "Layer",
          selected: markerSelected.has(l.id),
        })),
        drawLayers: (this.data.drawLayers ?? []).map((l) => ({
          id: l.id,
          name: l.name ?? "Draw layer",
          selected: drawSelected.has(l.id),
        })),
        textLayers: (this.data.textLayers ?? []).map((l) => ({
          id: l.id,
          name: l.name ?? "Text layer",
          selected: textSelected.has(l.id),
        })),
      },
      (res) => {
        if (res.action !== "save" || !this.data) return;
        const cfg = this.ensureSecondScreenConfig();
        cfg.markerLayerIds = res.markerLayerIds;
        cfg.drawLayerIds = res.drawLayerIds;
        cfg.textLayerIds = res.textLayerIds;
        void this.saveDataSoon();
        new Notice("Player screen layer setup saved.", 1200);
      },
    ).open();
  }

  private buildSecondScreenSnapshot(): MarkerFileData {
    if (!this.data) throw new Error("Map data not loaded.");

    const snapshot = JSON.parse(
      JSON.stringify(sanitizeMarkerFileDataForSave(this.data)),
    ) as MarkerFileData;

    const { markerLayerIds, drawLayerIds, textLayerIds } = this.getSecondScreenSelectedIds();

    snapshot.layers = (snapshot.layers ?? []).map((l) => ({
      ...l,
      visible: markerLayerIds.has(l.id),
      locked: false,
    }));
    snapshot.markers = (snapshot.markers ?? []).filter((m) => markerLayerIds.has(m.layer));

    snapshot.drawLayers = (snapshot.drawLayers ?? []).map((l) => ({
      ...l,
      visible: drawLayerIds.has(l.id),
      locked: false,
    }));
    snapshot.drawings = (snapshot.drawings ?? []).filter((d) => drawLayerIds.has(d.layerId));

    snapshot.textLayers = (snapshot.textLayers ?? []).filter((t) => textLayerIds.has(t.id));

    return snapshot;
  }

  private getCurrentViewForSecondScreen():
    | { zoom: number; centerX: number; centerY: number }
    | null {
    if (!this.imgW || !this.imgH) return null;

    const r = this.viewportEl.getBoundingClientRect();
    const vw = r.width || this.vw || 0;
    const vh = r.height || this.vh || 0;
    if (vw < 2 || vh < 2) return null;

    const worldX = (vw / 2 - this.tx) / this.scale;
    const worldY = (vh / 2 - this.ty) / this.scale;

    return {
      zoom: this.scale,
      centerX: clamp(worldX / this.imgW, 0, 1),
      centerY: clamp(worldY / this.imgH, 0, 1),
    };
  }
  
  private getCurrentOuterAspectForSecondScreen(): number | null {
    const r = this.el.getBoundingClientRect();
    const w = r.width || 0;
    const h = r.height || 0;
    if (w < 2 || h < 2) return null;
    return w / h;
  }

  private buildSecondScreenNoteContent(markersPath: string): string {
    const view = this.getCurrentViewForSecondScreen();
    const aspect = this.getCurrentOuterAspectForSecondScreen();

    // Must match the padding used by the Player Screen plugin:
    // 16px on each side => 32px total available space reduction.
    const padPx = 32;

    const width =
      aspect && Number.isFinite(aspect) && aspect > 0
        ? `min(calc(100vw - ${padPx}px), calc((100vh - ${padPx}px) * ${aspect.toFixed(6)}))`
        : `calc(100vw - ${padPx}px)`;

    const height =
      aspect && Number.isFinite(aspect) && aspect > 0
        ? `min(calc((100vw - ${padPx}px) / ${aspect.toFixed(6)}), calc(100vh - ${padPx}px))`
        : `calc(100vh - ${padPx}px)`;

    const yaml: Record<string, unknown> = {
      image: this.getActiveBasePath(),
      markers: markersPath,
      minZoom: this.cfg.minZoom,
      maxZoom: this.cfg.maxZoom,
      width,
      height,
      align: "center",
      resizable: false,
      responsive: false,
      wrap: false,
      render: this.cfg.renderMode,
      displayOnly: true,
    };

    if (this.cfg.viewportFrame?.trim()) {
      yaml.viewportFrame = this.cfg.viewportFrame.trim();
    }

    if (this.cfg.viewportFrameInsets) {
      yaml.viewportFrameInsets = {
        unit: this.cfg.viewportFrameInsets.unit,
        top: this.cfg.viewportFrameInsets.top,
        right: this.cfg.viewportFrameInsets.right,
        bottom: this.cfg.viewportFrameInsets.bottom,
        left: this.cfg.viewportFrameInsets.left,
      };
    }

    if (view) {
      yaml.view = {
        zoom: Number(view.zoom.toFixed(4)),
        centerX: Number(view.centerX.toFixed(6)),
        centerY: Number(view.centerY.toFixed(6)),
      };
    }

    return `\`\`\`zoommap\n${stringifyYaml(yaml).trimEnd()}\n\`\`\`\n`;
  }

  private async sendToSecondScreen(): Promise<void> {
    if (!this.data) return;

    if (!this.secondScreenFeatureEnabled()) {
      new Notice("Player screen integration is disabled in preferences.", 2500);
      return;
    }

    const screen = this.getScreenDisplayPlugin();
    if (!screen) {
      new Notice('Player screen plugin not found or not enabled.', 3500);
      return;
    }

    const folder = normalizePath(
      (this.plugin.settings.secondScreenFolder ?? "ZoomMap/SecondScreen").trim() ||
      "ZoomMap/SecondScreen",
    );

    const sec = this.ensureSecondScreenConfig();

    const stemBase =
      this.cfg.mapId?.trim() ||
      basename(this.getActiveBasePath()).replace(/\.[^.]+$/, "") ||
      "map";

    const safeStem = this.sanitizeFileName(`${stemBase}-screen`);
    const notePath = normalizePath(sec.notePath ?? `${folder}/${safeStem}.md`);
    const markersPath = normalizePath(sec.markersPath ?? `${folder}/${safeStem}.markers.json`);

    await this.ensureFolderForPath(notePath);
    await this.ensureFolderForPath(markersPath);

    const snapshot = this.buildSecondScreenSnapshot();
    const json = JSON.stringify(sanitizeMarkerFileDataForSave(snapshot), null, 2);
    const noteContent = this.buildSecondScreenNoteContent(markersPath);

    const markerAf = this.app.vault.getAbstractFileByPath(markersPath);
    if (markerAf instanceof TFile) {
      await this.app.vault.modify(markerAf, json);
    } else {
      await this.app.vault.create(markersPath, json);
    }

    const noteAf = this.app.vault.getAbstractFileByPath(notePath);
    if (noteAf instanceof TFile) {
      await this.app.vault.modify(noteAf, noteContent);
    } else {
      await this.app.vault.create(notePath, noteContent);
    }

    sec.notePath = notePath;
    sec.markersPath = markersPath;
    await this.saveDataSoon();

    await screen.sendNoteByPath(notePath);
  }
  
  private hasViewportFrame(): boolean {
    return typeof this.cfg.viewportFrame === "string" && this.cfg.viewportFrame.trim().length > 0;
  }

  private getOuterSizePx(): { w: number; h: number } {
    const w = this.el.clientWidth || this.el.getBoundingClientRect().width || 1;
    const h = this.el.clientHeight || this.el.getBoundingClientRect().height || 1;
    return { w, h };
  }

  private clampInsetsToMinInner(
    outerW: number,
    outerH: number,
    insets: { t: number; r: number; b: number; l: number },
  ): { t: number; r: number; b: number; l: number } {
    const minInnerW = 64;
    const minInnerH = 64;

    let { t, r, b, l } = insets;

    const maxSumX = Math.max(0, outerW - minInnerW);
    const sumX = l + r;
    if (sumX > maxSumX && sumX > 0) {
      const k = maxSumX / sumX;
      l *= k;
      r *= k;
    }

    const maxSumY = Math.max(0, outerH - minInnerH);
    const sumY = t + b;
    if (sumY > maxSumY && sumY > 0) {
      const k = maxSumY / sumY;
      t *= k;
      b *= k;
    }

    return {
      t: Math.max(0, Math.round(t)),
      r: Math.max(0, Math.round(r)),
      b: Math.max(0, Math.round(b)),
      l: Math.max(0, Math.round(l)),
    };
  }

  private computeViewportInsetsPx(outerW: number, outerH: number): { t: number; r: number; b: number; l: number } {
    if (!this.hasViewportFrame() || !this.cfg.viewportFrameInsets) {
      return { t: 0, r: 0, b: 0, l: 0 };
    }

    const spec = this.cfg.viewportFrameInsets;

    if (spec.unit === "percent") {
      const t = outerH * (spec.top / 100);
      const b = outerH * (spec.bottom / 100);
      const l = outerW * (spec.left / 100);
      const r = outerW * (spec.right / 100);
      return this.clampInsetsToMinInner(outerW, outerH, { t, r, b, l });
    }

    // framePx
    if (this.frameNaturalW > 0 && this.frameNaturalH > 0) {
      const sx = outerW / this.frameNaturalW;
      const sy = outerH / this.frameNaturalH;
      const t = spec.top * sy;
      const b = spec.bottom * sy;
      const l = spec.left * sx;
      const r = spec.right * sx;
      return this.clampInsetsToMinInner(outerW, outerH, { t, r, b, l });
    }

    return { t: 0, r: 0, b: 0, l: 0 };
  }

  private applyViewportInset(): void {
    const { w, h } = this.getOuterSizePx();
    const { t, r, b, l } = this.computeViewportInsetsPx(w, h);
    this.viewportEl.style.inset = `${t}px ${r}px ${b}px ${l}px`;
    if (this.hudClipEl) {
      this.hudClipEl.style.inset = `${t}px ${r}px ${b}px ${l}px`;
    }
  }

  private async loadViewportFrameNaturalSize(): Promise<void> {
    const img = this.viewportFrameEl;
    if (!img) return;
    try { await img.decode(); } catch { /* ignore */ }
    this.frameNaturalW = img.naturalWidth || 0;
    this.frameNaturalH = img.naturalHeight || 0;
  }
  
  public previewViewportFrameFromViewEditor(cfg: { viewportFrame?: string; viewportFrameInsets?: ZoomMapConfig["viewportFrameInsets"] }): void {
    void this.previewViewportFrameFromViewEditorAsync(cfg);
  }

  private async previewViewportFrameFromViewEditorAsync(cfg: { viewportFrame?: string; viewportFrameInsets?: ZoomMapConfig["viewportFrameInsets"] }): Promise<void> {
    const nextFrame = (cfg.viewportFrame ?? "").trim();
    this.cfg.viewportFrame = nextFrame.length ? nextFrame : undefined;
    this.cfg.viewportFrameInsets = cfg.viewportFrameInsets;

    const wantFrame = typeof this.cfg.viewportFrame === "string" && this.cfg.viewportFrame.trim().length > 0;
    this.el.classList.toggle("zm-root--framepad", wantFrame);

    if (!wantFrame) {
      // Remove frame layer if present
      this.viewportFrameEl?.remove();
      this.viewportFrameEl = null;
      this.frameLayerEl?.remove();
      this.frameLayerEl = null;
      this.frameNaturalW = 0;
      this.frameNaturalH = 0;
      this.applyViewportInset();
      this.onResize();
      return;
    }

    // Ensure frame elements exist
    if (!this.frameLayerEl) {
      this.frameLayerEl = this.el.createDiv({ cls: "zm-frame-layer" });
    }
    if (!this.viewportFrameEl) {
      const img = this.frameLayerEl.createEl("img", { cls: "zm-viewport-frame" });
      img.decoding = "async";
      img.draggable = false;
      this.viewportFrameEl = img;
    }

    // Update src
    const src = this.resolveResourceUrl(this.cfg.viewportFrame!.trim());
    if (this.viewportFrameEl.src !== src) {
      this.viewportFrameEl.src = src;
    }

    // If insets are framePx: need natural size
    if (this.cfg.viewportFrameInsets?.unit === "framePx") {
      await this.loadViewportFrameNaturalSize();
    }

    this.applyViewportInset();
    this.onResize();
  }
  
  constructor(app: App, plugin: ZoomMapPlugin, el: HTMLElement, cfg: ZoomMapConfig) {
    super(el);
    this.app = app;
    this.plugin = plugin;
    this.el = el;
    this.cfg = cfg;

    // Select storage backend
    if (this.cfg.storageMode === "note") {
      const id = this.cfg.mapId ?? `map-${this.cfg.sectionStart ?? 0}`;
      this.store = new NoteMarkerStore(app, cfg.sourcePath, id, this.cfg.sectionEnd);
    } else {
      this.store = new MarkerStore(app, cfg.sourcePath, cfg.markersPath);
    }
  }
  
  private startDraw(kind: DrawingKind): void {
    if (!this.plugin.settings.enableDrawing) {
      new Notice("Drawing tools are disabled in the plugin preferences.", 2000);
      return;
    }
    if (!this.data) return;

    const layers = this.data.drawLayers ?? [];
    const visible = layers.find((l) => l.visible);

    if (layers.length === 0) {
      new Notice(
        "No draw layers exist yet. Create one under image layers → draw layers → add draw layer…",
        6000,
      );
      return;
    }

    if (!visible) {
      new Notice(
        "No draw layer is active. Enable a draw layer under image layers → draw layers.",
        6000,
      );
      return;
    }

    this.drawingMode = kind;
    this.drawingActiveLayerId = visible.id;
    this.drawRectStart = null;
    this.drawCircleCenter = null;
    this.drawPolygonPoints = [];

    this.measuring = false;
    this.calibrating = false;

    if (this.drawDraftLayer) {
      this.drawDraftLayer.innerHTML = "";
    }

    if (kind === "rect") {
      new Notice(
        "Draw rectangle: click start point, move the mouse, click end point. Press esc to cancel.",
        5000,
      );
    } else if (kind === "circle") {
      new Notice(
        "Draw circle: click center, move the mouse, click radius point. Press esc to cancel.",
        5000,
      );
    } else if (kind === "polyline") {
      new Notice(
        "Draw polyline: click to add points, move the mouse for preview, double-click or right-click to finish. Press esc to cancel.",
        7000,
      );
    } else if (kind === "polygon") {
      new Notice(
        "Draw polygon: click to add points, move the mouse for preview, double-click or right-click to finish. Press esc to cancel.",
        7000,
      );
    }
  }

  private isCanvas(): boolean { return this.cfg.renderMode === "canvas"; }

  private updateSvgBaseFlag(path: string): void {
    const isSvg = typeof path === "string" && path.toLowerCase().endsWith(".svg");
    this.baseIsSvg = isSvg;
    this.el.classList.toggle("zm-root--svg-base", isSvg);
  }
  
  private async applySwitchPin(m: Marker): Promise<void> {
    if (!this.data) return;
    if (m.type !== "switch") return;

    const bases = this.getBasesNormalized();
    if (!bases.length) return;

    const current = this.getActiveBasePath();

    const rotate = !!m.switchRotate || !(typeof m.switchBase === "string" && m.switchBase.trim().length > 0);

    if (rotate) {
      const idx = bases.findIndex((b) => b.path === current);
      const next = bases[((idx >= 0 ? idx : 0) + 1) % bases.length]?.path;
      if (next) await this.setActiveBase(next);
      return;
    }

    const target = (m.switchBase ?? "").trim();
    if (!target) return;

    const exists = bases.some((b) => b.path === target);
    if (exists) {
      await this.setActiveBase(target);
    } else {
      const idx = bases.findIndex((b) => b.path === current);
      const next = bases[((idx >= 0 ? idx : 0) + 1) % bases.length]?.path;
      if (next) await this.setActiveBase(next);
    }
  }

  private openSwitchPinModal(opts: {
    basePaths: BaseImage[];
    initialIconKey: string;
    initialRotate: boolean;
    initialSwitchBase?: string;
    initialScaleLikeSticker: boolean;
    initialHud: boolean;
  }, onDone: (res: SwitchPinModalResult) => void): void {
    const modal = new SwitchPinModal(
      this.app,
      this.plugin,
      {
        bases: opts.basePaths,
        iconKey: opts.initialIconKey,
        rotate: opts.initialRotate,
        switchBase: opts.initialSwitchBase,
        scaleLikeSticker: opts.initialScaleLikeSticker,
        placeAsHudPin: opts.initialHud,
      },
      onDone,
    );
    modal.open();
  }

  onload(): void {
    void this.bootstrap().catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(err);
      new Notice(`Zoom Map error: ${msg}`, 6000);
    });
  }

  onunload(): void {
    if (this.zoomHudTimer !== null) {
      window.clearTimeout(this.zoomHudTimer);
      this.zoomHudTimer = null;
    }
    this.tintedSvgCache.clear();
    this.tooltipEl?.remove();
    this.ro?.disconnect();
    this.calloutMo?.disconnect();
    this.closeMenu();
    this.disposeBitmaps();
	
    // Close per-note SVG raster cache bitmaps (only exist when base svg + canvas)
    for (const byLod of this.svgBaseCache.values()) {
      for (const bmp of byLod.values()) {
        try { bmp.close(); } catch { /* ignore */ }
      }
      byLod.clear();
    }
    this.svgBaseCache.clear();
    this.svgUpgradeInFlight.clear();
  }
  
  private collectAncestorCallouts(): HTMLElement[] {
    const out: HTMLElement[] = [];
    let cur: HTMLElement | null = this.el;
    while (cur) {
      const callout: HTMLElement | null = cur.closest?.(".callout") as HTMLElement | null;
      if (callout && callout instanceof HTMLElement) {
        if (!out.includes(callout)) out.push(callout);
        cur = callout.parentElement;
      } else {
        break;
      }
    }
    return out;
  }

  private scheduleTryApplyInitialViewFromCallout(): void {
    if (this.cfg.responsive) return;
    if (!this.cfg.initialZoom || !this.cfg.initialCenter) return;
    if (this.initialViewApplied) return;

    const callouts = this.collectAncestorCallouts();
    if (callouts.length === 0) return;

    const tryApply = () => {
      if (this.initialViewApplied) return;
      if (callouts.some((c) => c.classList.contains("is-collapsed"))) return;

      const r = this.viewportEl.getBoundingClientRect();
      if ((r.width || 0) < 2 || (r.height || 0) < 2) return;

      this.applyInitialView(this.cfg.initialZoom!, this.cfg.initialCenter!);
      if (this.isCanvas()) this.renderCanvas();
      this.renderMarkersOnly();
    };

    this.calloutMo?.disconnect();
    this.calloutMo = new MutationObserver(() => {
      // Wait one frame for layout to settle after expanding the callout.
      window.requestAnimationFrame(() => tryApply());
    });

    for (const c of callouts) {
      this.calloutMo.observe(c, { attributes: true, attributeFilter: ["class"] });
    }

    // Try once immediately in case the callout is already open but layout was 0 during bootstrap.
    window.requestAnimationFrame(() => tryApply());
  }

  private async bootstrap(): Promise<void> {
    this.el.classList.add("zm-root");
    this.el.classList.toggle("zm-root--framepad", this.hasViewportFrame());
	  this.applyGlobalHoverPopoverStyleVars();
    if (this.isCanvas()) this.el.classList.add("zm-root--canvas-mode");
    if (this.cfg.responsive) this.el.classList.add("zm-root--responsive");

    if (this.cfg.responsive) {
      setCssProps(this.el, {
      width: "100%",
      height: "auto",
      });
    } else {
      setCssProps(this.el, {
      width: this.cfg.width ?? null,
      height: this.cfg.height ?? null,
      });
    }

    if (!this.cfg.responsive && this.cfg.resizable) {
      if (this.cfg.resizeHandle === "native") {
        this.el.classList.add("resizable-native");
      } else {
        this.el.classList.add("resizable-custom");
        if (this.cfg.resizeHandle === "left" || this.cfg.resizeHandle === "both") {
          const gripL = this.el.createDiv({ cls: "zm-grip zm-grip-left" });
          this.installGrip(gripL, "left");
        }
        if (this.cfg.resizeHandle === "right" || this.cfg.resizeHandle === "both" || !this.cfg.resizeHandle) {
          const gripR = this.el.createDiv({ cls: "zm-grip zm-grip-right" });
          this.installGrip(gripR, "right");
        }
      }
    }

    if (this.cfg.align === "center") this.el.classList.add("zm-align-center");
    if (this.cfg.align === "left" && this.cfg.wrap) this.el.classList.add("zm-float-left");
    if (this.cfg.align === "right" && this.cfg.wrap) this.el.classList.add("zm-float-right");
    (this.cfg.extraClasses ?? []).forEach((c) => this.el.classList.add(c));

    this.viewportEl = this.el.createDiv({ cls: "zm-viewport" });
    this.applyViewportInset();

    // Inner clip layer for all map rendering (keeps rounded corners)
    this.clipEl = this.viewportEl.createDiv({ cls: "zm-clip" });

    if (this.isCanvas()) {
      this.baseCanvas = this.clipEl.createEl("canvas", { cls: "zm-canvas" });
      this.ctx = this.baseCanvas.getContext("2d");
    }

    this.worldEl = this.clipEl.createDiv({ cls: "zm-world" });

    this.imgEl = this.worldEl.createEl("img", { cls: "zm-image" });
    this.overlaysEl = this.worldEl.createDiv({ cls: "zm-overlays" });
    this.markersEl = this.worldEl.createDiv({ cls: "zm-markers" });

    // Viewport frame (outer box)
    if (this.hasViewportFrame()) {
      this.frameLayerEl = this.el.createDiv({ cls: "zm-frame-layer" });
      const img = this.frameLayerEl.createEl("img", { cls: "zm-viewport-frame" });
      img.decoding = "async";
      img.draggable = false;
      img.src = this.resolveResourceUrl(this.cfg.viewportFrame!.trim());
      this.viewportFrameEl = img;
	  
      // Keep frame image in the session cache (if enabled) for fast note switching.
      if (this.plugin.imageCache) {
        const f = this.resolveTFile(this.cfg.viewportFrame!.trim(), this.cfg.sourcePath);
        if (f && !this.acquiredSessionPaths.has(f.path)) {
          void this.plugin.imageCache.acquire(f).then(() => {
            this.acquiredSessionPaths.add(f.path);
          }).catch(() => {
            // ignore
          });
        }
      }
    }

    // HUD clip must be above the frame.
    this.hudClipEl = this.el.createDiv({ cls: "zm-hud-clip" });
    this.applyViewportInset();

    this.hudMarkersEl = this.hudClipEl.createDiv({ cls: "zm-hud-markers" });
    this.measureHud = this.hudClipEl.createDiv({ cls: "zm-measure-hud" });
	  this.drawEditHudEl = this.hudClipEl.createDiv({ cls: "zm-draw-edit" });
    this.zoomHud = this.hudClipEl.createDiv({ cls: "zm-zoom-hud" });

    this.registerDomEvent(this.viewportEl, "wheel", (e: WheelEvent) => {
      const t = e.target;
      if (t instanceof Element && t.closest(".popover")) return;
      if (this.cfg.responsive) return;
      e.preventDefault();
      e.stopPropagation();
      this.onWheel(e);
    });

    this.registerDomEvent(this.viewportEl, "pointerdown", (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      this.closeMenu();
      this.onPointerDownViewport(e);
    });

    this.registerDomEvent(window, "pointermove", (e: PointerEvent) => this.onPointerMove(e));

    this.registerDomEvent(window, "pointerup", (e: PointerEvent) => {
      if (this.activePointers.has(e.pointerId)) this.activePointers.delete(e.pointerId);
      if (this.pinchActive && this.activePointers.size < 2) this.endPinch();
      e.preventDefault();
      this.onPointerUp(e);
    });

    this.registerDomEvent(window, "pointercancel", (e: PointerEvent) => {
      if (this.activePointers.has(e.pointerId)) this.activePointers.delete(e.pointerId);
      if (this.pinchActive && this.activePointers.size < 2) this.endPinch();
    });
	
    const touchCaptureOpts: AddEventListenerOptions = {
      passive: false,
      capture: true,
    };

    this.viewportEl.addEventListener("touchstart", this.onNativeTouchStart, touchCaptureOpts);
    this.viewportEl.addEventListener("touchmove", this.onNativeTouchMove, touchCaptureOpts);
    this.viewportEl.addEventListener("touchend", this.onNativeTouchEnd, touchCaptureOpts);
    this.viewportEl.addEventListener("touchcancel", this.onNativeTouchEnd, touchCaptureOpts);

    this.register(() => {
      this.viewportEl.removeEventListener("touchstart", this.onNativeTouchStart, touchCaptureOpts);
      this.viewportEl.removeEventListener("touchmove", this.onNativeTouchMove, touchCaptureOpts);
      this.viewportEl.removeEventListener("touchend", this.onNativeTouchEnd, touchCaptureOpts);
      this.viewportEl.removeEventListener("touchcancel", this.onNativeTouchEnd, touchCaptureOpts);
    });

    this.registerDomEvent(this.viewportEl, "dblclick", (e: MouseEvent) => {
      if (this.cfg.responsive) return;
      e.preventDefault();
      e.stopPropagation();
      this.closeMenu();
      this.onDblClickViewport(e);
    });

    this.registerDomEvent(this.viewportEl, "click", (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      this.onClickViewport(e);
    });

    this.registerDomEvent(this.viewportEl, "contextmenu", (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      this.onContextMenuViewport(e);
    });

    this.registerDomEvent(window, "keydown", (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
	  
      if (this.textMode === "move") {
        this.finishTextBoxMove(false);
        this.textMode = null;
        this.activeTextLayerId = null;
		this.activeTextBoxId = null;
        this.renderTextDraft();
        this.renderTextLayers();
        this.closeMenu();
        return;
      }

      if (this.drawEditDrawingId) {
        this.stopEditDrawingGeometry(false);
        this.closeMenu();
        return;
      }

      if (this.textMode === "edit") {
        this.stopTextEdit(true);
        this.closeMenu();
        return;
      }
      if (this.textMode === "draw-box" || this.textMode === "draw-lines") {
        this.textMode = null;
        this.activeTextLayerId = null;
		this.activeTextBoxId = null;
        this.textDrawStart = null;
        this.textDrawPreview = null;
        this.textLineStart = null;
        this.textLinePreview = null;
        this.renderTextDraft();
		this.renderTextLayers();
        this.closeMenu();
        return;
      }

      if (this.drawingMode) {
        this.drawingMode = null;
        this.drawingActiveLayerId = null;
        this.drawRectStart = null;
        this.drawCircleCenter = null;
        this.drawPolygonPoints = [];
        if (this.drawDraftLayer) this.drawDraftLayer.innerHTML = "";
        this.closeMenu();
        return;
      }

      if (this.calibrating) {
        this.calibrating = false;
        this.calibPts = [];
        this.calibPreview = null;
        this.renderCalibrate();
        new Notice("Calibration cancelled.", 900);
      } else if (this.measuring) {
        this.measuring = false;
        this.measurePreview = null;
        this.updateMeasureHud();
      }
      this.closeMenu();
    });

    this.registerEvent(
      this.app.vault.on("modify", (f) => {
        if (!(f instanceof TFile)) return;
        if (f.path !== this.store.getPath()) return;
        if (this.ignoreNextModify) { this.ignoreNextModify = false; return; }
        void this.reloadMarkers();
      }),
    );

    await this.loadInitialBase(this.cfg.imagePath);

    if (this.cfg.responsive) this.updateResponsiveAspectRatio();
	
    if (this.viewportFrameEl && this.cfg.viewportFrameInsets?.unit === "framePx") {
      await this.loadViewportFrameNaturalSize();
      this.applyViewportInset();
    } else {
      this.applyViewportInset();
    }


    await this.store.ensureExists(
      this.cfg.imagePath,
      { w: this.imgW, h: this.imgH },
      this.cfg.yamlMarkerLayers,
    );
    this.data = await this.store.load();

    await this.applyYamlOnFirstLoad();

    if (this.cfg.yamlMetersPerPixel && this.getMetersPerPixel() === undefined) {
      this.ensureMeasurement();
      const base = this.getActiveBasePath();
      if (this.data?.measurement) {
        this.data.measurement.metersPerPixel = this.cfg.yamlMetersPerPixel;
      if (this.data?.measurement?.scales) {
        this.data.measurement.scales[base] = this.cfg.yamlMetersPerPixel;
        if (await this.store.wouldChange(this.data)) {
          this.ignoreNextModify = true;
          await this.store.save(this.data);
        }
      }
    }

    if (this.data) {
      if (!this.data.size?.w || !this.data.size?.h) {
        this.data.size = { w: this.imgW, h: this.imgH };
        if (await this.store.wouldChange(this.data)) {
          this.ignoreNextModify = true;
          await this.store.save(this.data);
        }
      }
      if (this.shouldUseSavedFrame() && this.data.frame && this.data.frame.w > 0 && this.data.frame.h > 0) {
        setCssProps(this.el, { width: `${this.data.frame.w}px`, height: `${this.data.frame.h}px` });
      }
  }

    this.ro = new ResizeObserver(() => this.onResize());
    this.ro.observe(this.el);
    this.register(() => this.ro?.disconnect());

	if (this.cfg.responsive) {
	  this.fitToView();
	} else if (this.cfg.initialZoom && this.cfg.initialCenter) {
	  this.applyInitialView(this.cfg.initialZoom, this.cfg.initialCenter);
	} else {
	  this.fitToView();
	}
	
    // If the map is inside a collapsed callout on note load, apply the initial view when it is first opened.
    this.scheduleTryApplyInitialViewFromCallout();

    await this.applyActiveBaseAndOverlays();
    this.setupMeasureOverlay();
    this.setupDrawOverlay();
	  this.setupTextOverlay();

    this.applyMeasureStyle();

    this.renderAll();
    this.ready = true;
    }
  }
  
  private updateResponsiveAspectRatio(): void {
    if (!this.imgW || !this.imgH) return;
    this.el.style.aspectRatio = `${this.imgW} / ${this.imgH}`;
  }

  private disposeBitmaps(): void {
    const cache = this.plugin.imageCache;
    if (cache) {
      for (const p of this.acquiredSessionPaths) {
        cache.release(p);
      }
      this.acquiredSessionPaths.clear();
      this.baseSource = null;
      this.overlaySources.clear();
      this.overlayLoading.clear();
      return;
    }

    // Fallback: old behavior without session cache
    try {
      if (this.baseSource && isImageBitmapLike(this.baseSource)) this.baseSource.close();
    } catch (error) {
      console.error("Zoom Map: failed to dispose base bitmap", error);
    }
    this.baseSource = null;

    for (const src of this.overlaySources.values()) {
      try { if (isImageBitmapLike(src)) src.close(); }
      catch (error) { console.error("Zoom Map: failed to dispose overlay bitmap", error); }
    }
    this.overlaySources.clear();
    this.overlayLoading.clear();
  }

 private async loadBitmapFromPath(path: string): Promise<ImageBitmap | null> {
  const f = this.resolveTFile(path, this.cfg.sourcePath);
    if (!f) return null;

    const url = this.app.vault.getResourcePath(f);
    const img = new Image();
    img.decoding = "async";
    img.src = url;

    try {
      await img.decode();
	} catch { //empty.
	}

    try {
	  return await createImageBitmap(img);
	} catch {
        return null;
	}
  }

  private async loadBaseSourceByPath(path: string): Promise<void> {
    this.updateSvgBaseFlag(path);

    // Canvas + SVG base: progressive LOD.
    // Start with 1× quickly, then upgrade on demand during zoom.
    if (this.isCanvas() && this.baseIsSvg) {
      const bmp1 = await this.ensureSvgLod(path, 1);
      if (!bmp1) throw new Error(`Failed to load SVG base: ${path}`);

      this.baseSource = bmp1;
      this.svgRasterScale = bmp1.width / this.imgW;
      this.currentBasePath = path;
      return;
    }

    const cache = this.plugin.imageCache;
    if (cache) {
      const f = this.resolveTFile(path, this.cfg.sourcePath);
      if (!f) throw new Error(`Image not found: ${path}`);

      if (!this.acquiredSessionPaths.has(f.path)) {
        await cache.acquire(f);
        this.acquiredSessionPaths.add(f.path);
      }

      // We still need a CanvasImageSource reference to draw; acquire() returns the cached source
      const src = await cache.acquire(f);
      // Balance the extra acquire() above:
      cache.release(f.path);

      this.baseSource = src as CanvasImageSource;
      // Determine size
      if (isImageBitmapLike(src)) {
        this.imgW = src.width;
        this.imgH = src.height;
      } else if (src instanceof HTMLImageElement) {
        this.imgW = src.naturalWidth;
        this.imgH = src.naturalHeight;
      }

      this.currentBasePath = path;
      return;
    }

    // No session cache: use old load behavior
    const bmp = await this.loadBitmapFromPath(path);
    if (!bmp) throw new Error(`Failed to load image: ${path}`);
    this.baseSource = bmp;
    this.imgW = bmp.width;
    this.imgH = bmp.height;
    this.currentBasePath = path;
  }

  private async loadBaseImageByPath(path: string): Promise<void> {
    this.updateSvgBaseFlag(path);
    const imgFile = this.resolveTFile(path, this.cfg.sourcePath);
    if (!imgFile) throw new Error(`Image not found: ${path}`);
    const url = this.app.vault.getResourcePath(imgFile);
    await new Promise<void>((resolve, reject) => {
      this.imgEl.onload = () => { this.imgW = this.imgEl.naturalWidth; this.imgH = this.imgEl.naturalHeight; resolve(); };
      this.imgEl.onerror = () => reject(new Error("Failed to load image."));
      this.imgEl.src = url;
    });
    this.currentBasePath = path;
  }

  private async loadInitialBase(path: string): Promise<void> {
	this.updateSvgBaseFlag(path);
    if (this.isCanvas()) await this.loadBaseSourceByPath(path);
    else await this.loadBaseImageByPath(path);
  }

  private async loadCanvasSourceFromPath(path: string): Promise<CanvasImageSource | null> {
    const f = this.resolveTFile(path, this.cfg.sourcePath);
    if (!f) return null;

    const url = this.app.vault.getResourcePath(f);
    const img = new Image();
    img.decoding = "async";
    img.src = url;

    try {
      await img.decode();
	} catch { //empty.
	}

    try {
      return await createImageBitmap(img);
	} catch {
       return img;
	}
  }
  
  private clampRasterDims(w: number, h: number): { w: number; h: number; clamped: boolean } {
    let clamped = false;
    let W = Math.max(1, Math.round(w));
    let H = Math.max(1, Math.round(h));

    const maxSide = this.svgRasterMaxSidePx;
    if (W > maxSide || H > maxSide) {
      clamped = true;
      const k = Math.min(maxSide / W, maxSide / H);
      W = Math.max(1, Math.round(W * k));
      H = Math.max(1, Math.round(H * k));
    }
    return { w: W, h: H, clamped };
  }

  private getSvgCache(path: string): Map<number, ImageBitmap> {
    let byLod = this.svgBaseCache.get(path);
    if (!byLod) {
      byLod = new Map();
      this.svgBaseCache.set(path, byLod);
    }
    return byLod;
  }

  private getSvgInflight(path: string): Map<number, Promise<ImageBitmap | null>> {
    let byLod = this.svgUpgradeInFlight.get(path);
    if (!byLod) {
      byLod = new Map();
      this.svgUpgradeInFlight.set(path, byLod);
    }
    return byLod;
  }
  
  private evictSvgLods(path: string, keep: number[]): void {
    const byLod = this.svgBaseCache.get(path);
    if (!byLod) return;

    for (const [lod, bmp] of byLod.entries()) {
      if (keep.includes(lod)) continue;
      try {
        bmp.close();
      } catch {
        // ignore
      }
      byLod.delete(lod);
    }
  }  

  private pickDesiredSvgLod(scale: number): number {
    // LOD strategy:
    // - always start with 1× (fast)
    // - first meaningful zoom-in triggers 2×
    // - higher zoom triggers 4×
    // - optionally 8× if allowed by settings and zoom is very high
    const max = this.getSvgRasterMaxScale();

    if (scale < 1.35) return 1;
    if (scale < 2.8) return Math.min(2, max);
    if (scale < 5.6) return Math.min(4, max);
    return Math.min(8, max);
  }

  private async loadSvgBitmapAtLod(path: string, lod: number): Promise<ImageBitmap | null> {
    const f = this.resolveTFile(path, this.cfg.sourcePath);
    if (!f) return null;

    const url = this.app.vault.getResourcePath(f);
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    try { await img.decode(); } catch { /* ignore */ }

    const logicalW = img.naturalWidth || 0;
    const logicalH = img.naturalHeight || 0;
    if (logicalW <= 0 || logicalH <= 0) return null;

    // keep logical size stable
    this.imgW = logicalW;
    this.imgH = logicalH;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const targetW = logicalW * lod * dpr;
    const targetH = logicalH * lod * dpr;
    const dims = this.clampRasterDims(targetW, targetH);

    try {
      const opts: ImageBitmapOptions = {
        resizeWidth: dims.w,
        resizeHeight: dims.h,
        resizeQuality: "high",
      };

      const bmp = await createImageBitmap(img, opts);
      return bmp;
    } catch {
      try { return await createImageBitmap(img); } catch { return null; }
    }
  }

  private async ensureSvgLod(path: string, lod: number): Promise<ImageBitmap | null> {
    const byLod = this.getSvgCache(path);
    const cached = byLod.get(lod);
    if (cached) return cached;

    const inflight = this.getSvgInflight(path);
    const running = inflight.get(lod);
    if (running) return running;

    const p = this.loadSvgBitmapAtLod(path, lod)
      .then((bmp) => {
        inflight.delete(lod);
        if (bmp) byLod.set(lod, bmp);
        return bmp;
      })
      .catch(() => {
        inflight.delete(lod);
        return null;
      });

    inflight.set(lod, p);
    return p;
  }

  private async maybeUpgradeSvgBaseForCurrentZoom(): Promise<void> {
    if (!this.isCanvas()) return;
    if (!this.baseIsSvg) return;
    const path = this.currentBasePath ?? this.getActiveBasePath();
    if (!path) return;

    const desired = this.pickDesiredSvgLod(this.scale);
    const byLod = this.getSvgCache(path);

    // find best currently available <= desired (prefer higher)
    const have = [8,4,2,1].find((l) => byLod.has(l)) ?? 0;
    if (have >= desired) return;

    // Start async build for desired LOD, keep current visible
    const bmp = await this.ensureSvgLod(path, desired);
    if (!bmp) return;

    // Swap current baseSource to the new bitmap (no marker drift: draw into logical imgW/imgH)
    this.baseSource = bmp;
    this.svgRasterScale = bmp.width / this.imgW;
	
    // Memory policy (as requested): keep only the highest/current LOD for this base.
    // This avoids frequent LOD switching when zooming in/out and saves memory.
    this.evictSvgLods(path, [desired]);

    if (this.ready) {
      this.renderCanvas();
      this.renderMarkersOnly();
    }
  }

  private closeCanvasSource(src: CanvasImageSource | null): void {
    try { if (isImageBitmapLike(src)) src.close(); }
    catch (error) { console.error("Zoom Map: failed to dispose canvas source", error); }
  }

  private async ensureOverlayLoaded(path: string): Promise<CanvasImageSource | null> {
    const cache = this.plugin.imageCache;
    if (cache) {
      if (this.overlaySources.has(path)) return this.overlaySources.get(path) ?? null;

      const f = this.resolveTFile(path, this.cfg.sourcePath);
      if (!f) return null;

      if (!this.acquiredSessionPaths.has(f.path)) {
        await cache.acquire(f);
        this.acquiredSessionPaths.add(f.path);
      }

      // Get the actual cached source reference to draw
      const src = await cache.acquire(f);
      cache.release(f.path);

      this.overlaySources.set(path, src as CanvasImageSource);
      return src as CanvasImageSource;
    }

    if (this.overlaySources.has(path)) return this.overlaySources.get(path) ?? null;
    if (this.overlayLoading.has(path)) return this.overlayLoading.get(path) ?? null;

    const p = this.loadCanvasSourceFromPath(path)
      .then((res) => {
        this.overlayLoading.delete(path);
        if (res) this.overlaySources.set(path, res);
        return res;
      })
      .catch((err) => {
        this.overlayLoading.delete(path);
        console.warn("Zoom Map: overlay load failed", path, err);
        return null;
      });

    this.overlayLoading.set(path, p);
    return p;
  }

  private async ensureVisibleOverlaysLoaded(): Promise<void> {
    if (!this.data) return;
    const keepAll = !!this.plugin.settings.enableSessionImageCache && !!this.plugin.settings.keepOverlaysLoaded;
    const wantVisible = new Set<string>(
      (this.data.overlays ?? [])
        .filter((o) => keepAll || o.visible)
        .map((o) => o.path),
    );

    for (const [path, src] of this.overlaySources) {
      if (!wantVisible.has(path)) {
        this.overlaySources.delete(path);
        this.closeCanvasSource(src);
      }
    }

    for (const path of wantVisible) {
      if (!this.overlaySources.has(path)) await this.ensureOverlayLoaded(path);
    }
  }

  private renderCanvas(): void {
    if (!this.isCanvas()) return;
    if (!this.baseCanvas || !this.ctx || !this.baseSource) return;

    const r = this.viewportEl.getBoundingClientRect();
    this.vw = r.width;
    this.vh = r.height;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const pxW = Math.max(1, Math.round(this.vw * dpr));
    const pxH = Math.max(1, Math.round(this.vh * dpr));
    if (this.baseCanvas.width !== pxW || this.baseCanvas.height !== pxH) {
      this.baseCanvas.width = pxW;
      this.baseCanvas.height = pxH;
      this.baseCanvas.style.width = `${this.vw}px`;
      this.baseCanvas.style.height = `${this.vh}px`;
    }

    const ctx = this.ctx;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, this.vw, this.vh);

    ctx.translate(this.tx, this.ty);
    ctx.scale(this.scale, this.scale);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = this.scale < 0.18 ? "low" : "medium";

    if (this.baseIsSvg && this.baseSource instanceof ImageBitmap) {
      const srcW = this.baseSource.width;
      const srcH = this.baseSource.height;
      if (srcW !== this.imgW || srcH !== this.imgH) {
        ctx.drawImage(this.baseSource, 0, 0, srcW, srcH, 0, 0, this.imgW, this.imgH);
      } else {
        ctx.drawImage(this.baseSource, 0, 0);
      }
    } else {
      ctx.drawImage(this.baseSource, 0, 0);
    }

    if (this.data?.overlays?.length) {
      for (const o of this.data.overlays) {
        if (!o.visible) continue;
        const src = this.overlaySources.get(o.path);
        if (src) ctx.drawImage(src, 0, 0);
      }
    }
  }

  private setupMeasureOverlay(): void {
    this.measureEl = this.worldEl.createDiv({ cls: "zm-measure" });

    this.measureSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.measureSvg.classList.add("zm-measure__svg");
    this.measureSvg.setAttribute("width", String(this.imgW));
    this.measureSvg.setAttribute("height", String(this.imgH));
    this.measureEl.appendChild(this.measureSvg);

    this.measurePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    this.measurePath.classList.add("zm-measure__path");
    this.measureSvg.appendChild(this.measurePath);

    this.measureDots = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.measureSvg.appendChild(this.measureDots);

    this.calibPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    this.calibPath.classList.add("zm-measure__path", "zm-measure__dash");
    this.measureSvg.appendChild(this.calibPath);

    this.calibDots = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.measureSvg.appendChild(this.calibDots);

    this.updateMeasureHud();
  }
  
  private setupDrawOverlay(): void {
    const ns = "http://www.w3.org/2000/svg";

    this.drawEl = this.worldEl.createDiv({ cls: "zm-draw" });

    this.drawSvg = document.createElementNS(ns, "svg");
    this.drawSvg.classList.add("zm-draw__svg");
    this.drawSvg.setAttribute("width", String(this.imgW));
    this.drawSvg.setAttribute("height", String(this.imgH));
    this.drawEl.appendChild(this.drawSvg);

    this.drawDefs = document.createElementNS(ns, "defs");
    this.drawSvg.appendChild(this.drawDefs);

    this.drawStaticLayer = document.createElementNS(ns, "g");
    this.drawSvg.appendChild(this.drawStaticLayer);

    this.drawDraftLayer = document.createElementNS(ns, "g");
    this.drawSvg.appendChild(this.drawDraftLayer);
  }
  
  private getDrawingById(id: string): Drawing | null {
    const list = this.data?.drawings ?? [];
    for (const d of list) {
      if (d.id === id) return d;
    }
    return null;
  }
  
  private applyGlobalHoverPopoverStyleVars(): void {
	this.plugin.applyGlobalHoverPopoverSettings();
  }

  private getEditableDrawingPoints(d: Drawing): { x: number; y: number }[] | null {
    if (d.kind === "polygon" && Array.isArray(d.polygon)) return d.polygon;
    if (d.kind === "polyline" && Array.isArray(d.polyline)) return d.polyline;
    return null;
  }
  
  private getEditableDrawingMode(d: Drawing): "points" | "rect" | "circle" | null {
    if (d.kind === "polygon" || d.kind === "polyline") return "points";
    if (d.kind === "rect") return "rect";
    if (d.kind === "circle") return "circle";
    return null;
  }

  private startEditDrawingGeometry(d: Drawing): void {
    const mode = this.getEditableDrawingMode(d);
    if (!mode) {
      new Notice("This drawing cannot be edited right now.", 2500);
      return;
    }

    this.stopTextEdit(true);
    this.finishTextBoxMove(false);
	this.stopEditDrawingGeometry(true);
    this.measuring = false;
    this.calibrating = false;
    this.drawingMode = null;
    this.drawRectStart = null;
    this.drawCircleCenter = null;
    this.drawPolygonPoints = [];

    if (this.drawDraftLayer) this.drawDraftLayer.innerHTML = "";

    this.drawEditDrawingId = d.id;
	this.drawEditMode = mode;
    this.drawEditPointIndex = null;
	this.drawEditHandleKind = null;
    this.drawEditPointerId = null;
    this.drawEditOriginalDrawing = JSON.parse(JSON.stringify(d)) as Drawing;

    this.renderDrawings();
    this.renderDrawingEditHandles();

    if (mode === "points") {
      new Notice("Edit points: drag handles, drag green midpoint handles to add points, double-click a point to delete it. Press esc to cancel.", 6000);
    } else if (mode === "rect") {
      new Notice("Edit rectangle: drag corner handles. Press esc to cancel.", 4000);
    } else {
      new Notice("Edit circle: drag center or radius handle. Press esc to cancel.", 4000);
    }
  }

  private stopEditDrawingGeometry(commit: boolean): void {
    if (!this.drawEditDrawingId) return;

    const d = this.getDrawingById(this.drawEditDrawingId);
    if (!commit && d && this.drawEditOriginalDrawing) {
      d.rect = this.drawEditOriginalDrawing.rect
        ? { ...this.drawEditOriginalDrawing.rect }
        : undefined;
      d.circle = this.drawEditOriginalDrawing.circle
        ? { ...this.drawEditOriginalDrawing.circle }
        : undefined;
      d.polygon = this.drawEditOriginalDrawing.polygon
        ? this.drawEditOriginalDrawing.polygon.map((p) => ({ x: p.x, y: p.y }))
        : undefined;
      d.polyline = this.drawEditOriginalDrawing.polyline
        ? this.drawEditOriginalDrawing.polyline.map((p) => ({ x: p.x, y: p.y }))
        : undefined;
    }
	
    if (commit && d) {
      delete d.bakedPath;
      delete d.bakedWidth;
      delete d.bakedHeight;
    }

    this.drawEditDrawingId = null;
	this.drawEditMode = null;
    this.drawEditPointIndex = null;
	this.drawEditHandleKind = null;
    this.drawEditPointerId = null;
    this.drawEditOriginalDrawing = null;

    if (commit) void this.saveDataSoon();

    this.renderDrawings();
    this.renderDrawingEditHandles();
  }
  
  private insertPointIntoEditedDrawing(segmentIndex: number, p: Point): number | null {
    if (!this.drawEditDrawingId) return null;
    const d = this.getDrawingById(this.drawEditDrawingId);
    if (!d) return null;

    const pts = this.getEditableDrawingPoints(d);
    if (!pts) return null;

    const insertAt = clamp(segmentIndex + 1, 0, pts.length);
    pts.splice(insertAt, 0, {
      x: clamp(p.x, 0, 1),
      y: clamp(p.y, 0, 1),
    });
    return insertAt;
  }

  private deletePointFromEditedDrawing(pointIndex: number): void {
    if (!this.drawEditDrawingId) return;
    const d = this.getDrawingById(this.drawEditDrawingId);
    if (!d) return;

    const pts = this.getEditableDrawingPoints(d);
    if (!pts) return;

    const minPoints = d.kind === "polygon" ? 3 : 2;
    if (pts.length <= minPoints) {
      new Notice(`This ${d.kind} needs at least ${minPoints} points.`, 2000);
      return;
    }

    pts.splice(pointIndex, 1);
    if (this.drawEditPointIndex === pointIndex) this.drawEditPointIndex = null;
    else if (this.drawEditPointIndex !== null && this.drawEditPointIndex > pointIndex) this.drawEditPointIndex -= 1;

    this.renderDrawings();
    this.renderDrawingEditHandles();
  }

  private updateEditedDrawingHandleFromClient(clientX: number, clientY: number): void {
    if (!this.drawEditDrawingId) return;
    const d = this.getDrawingById(this.drawEditDrawingId);
    if (!d) return;

    const vpRect = this.viewportEl.getBoundingClientRect();
    const vx = clientX - vpRect.left;
    const vy = clientY - vpRect.top;
    const wx = (vx - this.tx) / this.scale;
    const wy = (vy - this.ty) / this.scale;

    const nx = clamp(wx / this.imgW, 0, 1);
    const ny = clamp(wy / this.imgH, 0, 1);

    if (this.drawEditMode === "points") {
      const pts = this.getEditableDrawingPoints(d);
      if (!pts || this.drawEditPointIndex === null) return;
      if (this.drawEditPointIndex < 0 || this.drawEditPointIndex >= pts.length) return;

      pts[this.drawEditPointIndex].x = nx;
      pts[this.drawEditPointIndex].y = ny;
    } else if (this.drawEditMode === "rect" && d.rect) {
      const key = this.drawEditHandleKind;
      if (key === "x0y0") {
        d.rect.x0 = nx;
        d.rect.y0 = ny;
      } else if (key === "x1y0") {
        d.rect.x1 = nx;
        d.rect.y0 = ny;
      } else if (key === "x1y1") {
        d.rect.x1 = nx;
        d.rect.y1 = ny;
      } else if (key === "x0y1") {
        d.rect.x0 = nx;
        d.rect.y1 = ny;
      }
    } else if (this.drawEditMode === "circle" && d.circle) {
      const key = this.drawEditHandleKind;
      if (key === "center") {
        d.circle.cx = nx;
        d.circle.cy = ny;
      } else if (key === "radius") {
        const cxPx = d.circle.cx * this.imgW;
        const cyPx = d.circle.cy * this.imgH;
        const px = nx * this.imgW;
        const py = ny * this.imgH;
        const rPx = Math.hypot(px - cxPx, py - cyPx);
        d.circle.r = Math.max(1 / Math.max(this.imgW, this.imgH), rPx / Math.max(this.imgW, this.imgH));
      }
    }

    this.renderDrawings();
    this.renderDrawingEditHandles();
  }
  
  private isEditedDrawingCurrentlyVisible(d: Drawing): boolean {
    if (!d.visible) return false;
    const layer = (this.data?.drawLayers ?? []).find((l) => l.id === d.layerId);
    if (!layer || !layer.visible) return false;
    const activeBase = this.getActiveBasePath();
    if (layer.boundBase && layer.boundBase !== activeBase) return false;
    return true;
  }

  private renderDrawingEditHandles(): void {
    if (!this.drawEditHudEl) return;
    this.drawEditHudEl.empty();

    if (!this.drawEditDrawingId || !this.data || !this.drawEditMode) return;
    const d = this.getDrawingById(this.drawEditDrawingId);
    if (!d) return;
	if (!this.isEditedDrawingCurrentlyVisible(d)) return;

    const startDrag = (pointIndex: number | null, handleKind: string | null, pointerId: number) => {
      this.drawEditPointIndex = pointIndex;
      this.drawEditHandleKind = handleKind;
      this.drawEditPointerId = pointerId;
      this.plugin.setActiveMap(this);
      this.renderDrawingEditHandles();
    };

    if (this.drawEditMode === "points") {
      const pts = this.getEditableDrawingPoints(d);
      if (!pts || pts.length === 0) return;

      for (let i = 0; i < pts.length; i += 1) {
        const p = pts[i];
        const sx = this.tx + p.x * this.imgW * this.scale;
        const sy = this.ty + p.y * this.imgH * this.scale;

        const h = this.drawEditHudEl.createDiv({ cls: "zm-draw-handle" });
        if (this.drawEditPointIndex === i) h.classList.add("zm-draw-handle--active");
        h.style.left = `${sx}px`;
        h.style.top = `${sy}px`;
        h.title = "Drag to move. Double click to delete.";

        h.addEventListener("pointerdown", (e: PointerEvent) => {
          e.preventDefault();
          e.stopPropagation();
          startDrag(i, "point", e.pointerId);
        });

        h.addEventListener("dblclick", (e: MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          this.deletePointFromEditedDrawing(i);
        });
      }

      const segCount = d.kind === "polygon" ? pts.length : Math.max(0, pts.length - 1);
      for (let i = 0; i < segCount; i += 1) {
        const a = pts[i];
        const b = pts[(i + 1) % pts.length];
        if (!a || !b) continue;
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const sx = this.tx + mx * this.imgW * this.scale;
        const sy = this.ty + my * this.imgH * this.scale;

        const h = this.drawEditHudEl.createDiv({ cls: "zm-draw-handle zm-draw-handle--add" });
        h.style.left = `${sx}px`;
        h.style.top = `${sy}px`;
        h.title = "Drag to insert a new point.";

        h.addEventListener("pointerdown", (e: PointerEvent) => {
          e.preventDefault();
          e.stopPropagation();
          const inserted = this.insertPointIntoEditedDrawing(i, { x: mx, y: my });
          if (inserted === null) return;
          startDrag(inserted, "point", e.pointerId);
          this.renderDrawings();
          this.renderDrawingEditHandles();
        });
      }
      return;
    }

    if (this.drawEditMode === "rect" && d.rect) {
      const corners = [
        { key: "x0y0", x: d.rect.x0, y: d.rect.y0 },
        { key: "x1y0", x: d.rect.x1, y: d.rect.y0 },
        { key: "x1y1", x: d.rect.x1, y: d.rect.y1 },
        { key: "x0y1", x: d.rect.x0, y: d.rect.y1 },
      ];

      for (const c of corners) {
        const sx = this.tx + c.x * this.imgW * this.scale;
        const sy = this.ty + c.y * this.imgH * this.scale;
        const h = this.drawEditHudEl.createDiv({ cls: "zm-draw-handle" });
        if (this.drawEditHandleKind === c.key) h.classList.add("zm-draw-handle--active");
        h.style.left = `${sx}px`;
        h.style.top = `${sy}px`;
        h.title = "Drag to resize rectangle.";
        h.addEventListener("pointerdown", (e: PointerEvent) => {
          e.preventDefault();
          e.stopPropagation();
          startDrag(null, c.key, e.pointerId);
        });
      }
      return;
    }

    if (this.drawEditMode === "circle" && d.circle) {
      const cxPx = d.circle.cx * this.imgW;
      const cyPx = d.circle.cy * this.imgH;
      const rPx = d.circle.r * Math.max(this.imgW, this.imgH);

      const handles = [
        {
          key: "center",
          cls: "zm-draw-handle zm-draw-handle--center",
          xPx: cxPx,
          yPx: cyPx,
          title: "Drag to move circle center.",
        },
        {
          key: "radius",
          cls: "zm-draw-handle zm-draw-handle--radius",
          xPx: cxPx + rPx,
          yPx: cyPx,
          title: "Drag to change circle radius.",
        },
      ];

      for (const c of handles) {
        const sx = this.tx + c.xPx * this.scale;
        const sy = this.ty + c.yPx * this.scale;
        const h = this.drawEditHudEl.createDiv({ cls: c.cls });
        if (this.drawEditHandleKind === c.key) h.classList.add("zm-draw-handle--active");
        h.style.left = `${sx}px`;
        h.style.top = `${sy}px`;
        h.title = c.title;
        h.addEventListener("pointerdown", (e: PointerEvent) => {
          e.preventDefault();
          e.stopPropagation();
          startDrag(null, c.key, e.pointerId);
        });
      }
    }
  }
  
  private getTextLayerById(id: string | null): TextLayer | null {
    if (!id || !this.data) return null;
    return (this.data.textLayers ?? []).find((l) => l.id === id) ?? null;
  }

  private getTextBoxById(layerId: string | null, boxId: string | null): { layer: TextLayer; box: TextBox } | null {
    const layer = this.getTextLayerById(layerId);
    if (!layer || !boxId) return null;
    const box = (layer.boxes ?? []).find((b) => b.id === boxId) ?? null;
    if (!box) return null;
    return { layer, box };
  }
  
  private isTextLayerVisible(layer: TextLayer): boolean {
    return layer.visible !== false;
  }

  private getTextBoxStyle(box: TextBox, layer?: TextLayer | null): TextLayerStyle {
    const style = this.normalizeTextLayerStyle(box.style ?? layer?.style);
    if (!box.style) box.style = { ...style };
    return style;
  }

  private isTextBoxLocked(box: TextBox, layer?: TextLayer | null): boolean {
    if (typeof box.locked === "boolean") return box.locked;
    return !!layer?.locked;
  }

  private isTextBoxAutoFlow(box: TextBox, layer?: TextLayer | null): boolean {
    if (typeof box.autoFlow === "boolean") return box.autoFlow;
    return layer?.autoFlow !== false;
  }

  private isTextBoxAllowAngled(box: TextBox, layer?: TextLayer | null): boolean {
    if (typeof box.allowAngledBaselines === "boolean") return box.allowAngledBaselines;
    return !!layer?.allowAngledBaselines;
  }

  private defaultTextBoxAutoConfig(): TextBoxAutoConfig {
    return {
      lineGapPx: Math.round(this.defaultTextLayerStyle().fontSize * 1.35),
      padLeft: 0,
      padRight: 0,
      padTop: 4,
      padBottom: 4,
    };
  }

  private buildAutoTextBoxLines(
    rect: TextBox["rect"],
    style: TextLayerStyle,
    autoCfg: TextBoxAutoConfig,
    existing?: TextBaseline[],
  ): TextBaseline[] {
    const minX = Math.min(rect.x0, rect.x1) * this.imgW;
    const maxX = Math.max(rect.x0, rect.x1) * this.imgW;
    const minY = Math.min(rect.y0, rect.y1) * this.imgH;
    const maxY = Math.max(rect.y0, rect.y1) * this.imgH;

    const padLeft = Math.max(0, autoCfg.padLeft ?? 0);
    const padRight = Math.max(0, autoCfg.padRight ?? 0);
    const padTop = Math.max(0, autoCfg.padTop ?? 0);
    const padBottom = Math.max(0, autoCfg.padBottom ?? 0);

    const x0Px = minX + padLeft;
    const x1Px = maxX - padRight;
    const usableTop = minY + padTop;
    const usableBottom = maxY - padBottom;

    const fontSize = style.fontSize;
    const lineH =
      Number.isFinite(autoCfg.lineGapPx) && autoCfg.lineGapPx > 1
        ? autoCfg.lineGapPx
        : (typeof style.lineHeight === "number" && style.lineHeight > 1
            ? style.lineHeight
            : Math.round(fontSize * 1.35));

    const leading = Math.max(0, lineH - fontSize);
    const ascent = Math.round(fontSize * 0.8);
    const rise = ascent + Math.round(leading / 2);

    const out: TextBaseline[] = [];
    let y = usableTop + rise;
    let idx = 0;

    while (y <= usableBottom) {
      out.push({
        id: existing?.[idx]?.id ?? generateId("tln"),
        x0: x0Px / this.imgW,
        y0: y / this.imgH,
        x1: x1Px / this.imgW,
        y1: y / this.imgH,
        text: existing?.[idx]?.text ?? "",
      });
      y += lineH;
      idx += 1;
    }

    if (out.length === 0) {
      const fallbackY = (minY + maxY) / 2;
      out.push({
        id: existing?.[0]?.id ?? generateId("tln"),
        x0: x0Px / this.imgW,
        y0: fallbackY / this.imgH,
        x1: x1Px / this.imgW,
        y1: fallbackY / this.imgH,
        text: existing?.[0]?.text ?? "",
      });
    }

    return out;
  }

  private regenerateAutoTextBoxLines(layer: TextLayer, box: TextBox): void {
    if (box.mode !== "auto") return;
    if (box.sourceDrawingKind === "polyline") return;
	box.style = this.getTextBoxStyle(box, layer);
    box.auto ??= this.defaultTextBoxAutoConfig();
    box.lines = this.buildAutoTextBoxLines(box.rect, box.style, box.auto, box.lines);
  }
  
  private ensureTextData(): void {
    if (!this.data) return;
    this.data.textLayers ??= [];
    for (const layer of this.data.textLayers) {
      layer.boxes ??= [];
      if (typeof layer.visible !== "boolean") layer.visible = true;
      const legacyStyle = this.normalizeTextLayerStyle(layer.style);
      for (const box of layer.boxes) {
        box.style = this.normalizeTextLayerStyle(box.style ?? legacyStyle);
        if (typeof box.autoFlow !== "boolean" && typeof layer.autoFlow === "boolean") {
          box.autoFlow = layer.autoFlow;
        }
        if (typeof box.allowAngledBaselines !== "boolean" && typeof layer.allowAngledBaselines === "boolean") {
          box.allowAngledBaselines = layer.allowAngledBaselines;
        }
        if (typeof box.locked !== "boolean" && typeof layer.locked === "boolean") {
          box.locked = layer.locked;
        }
        if (box.mode === "auto") box.auto ??= this.defaultTextBoxAutoConfig();
      }
    }
  }
  
  private defaultTextLayerStyle(): TextLayerStyle {
    return {
      fontFamily: "var(--font-text)",
      fontSize: 14,
      color: "var(--text-normal)",
      fontWeight: "400",
      baselineOffset: 0,
      padLeft: 0,
      padRight: 0,
    };
  }

  private normalizeTextLayerStyle(style?: Partial<TextLayerStyle>): TextLayerStyle {
    const s: TextLayerStyle = { ...this.defaultTextLayerStyle(), ...(style ?? {}) };

    s.fontFamily = (s.fontFamily ?? "").trim() || "var(--font-text)";
    s.color = (s.color ?? "").trim() || "var(--text-normal)";

    if (!Number.isFinite(s.fontSize) || s.fontSize <= 1) s.fontSize = 14;
    if (!Number.isFinite(s.baselineOffset ?? 0)) s.baselineOffset = 0;
    if (!Number.isFinite(s.padLeft ?? 0) || (s.padLeft ?? 0) < 0) s.padLeft = 0;
    if (!Number.isFinite(s.padRight ?? 0) || (s.padRight ?? 0) < 0) s.padRight = 0;

    if (typeof s.italic !== "boolean") delete s.italic;
    if (typeof s.letterSpacing !== "number" || !Number.isFinite(s.letterSpacing)) {
      delete s.letterSpacing;
    }
    if (s.fontWeight != null) {
      const fw = String(s.fontWeight).trim();
      s.fontWeight = fw.length ? fw : undefined;
    }

    return s;
  }
  
  private openTextBoxConfigModal(layer: TextLayer, box: TextBox): void {
	box.style = this.getTextBoxStyle(box, layer);
    new TextBoxConfigModal(this.app, box, (res) => {
      if (res.action !== "save" || !this.data) return;
      const target = (layer.boxes ?? []).find((b) => b.id === box.id);
      if (!target) return;

      target.name = res.box.name;
      target.auto = res.box.auto;
      target.style = this.normalizeTextLayerStyle(res.box.style ?? target.style ?? layer.style);
      target.autoFlow = res.box.autoFlow !== false;
      target.allowAngledBaselines = !!res.box.allowAngledBaselines;
      target.locked = !!res.box.locked;

      if (target.mode === "auto" && target.sourceDrawingKind !== "polyline") {
        this.regenerateAutoTextBoxLines(layer, target);
      }

      void this.saveDataSoon();
      this.renderTextLayers();
    }).open();
  }

  private setupTextOverlay(): void {
    const ns = "http://www.w3.org/2000/svg";

    this.textSvgWrap = this.worldEl.createDiv({ cls: "zm-text" });

    this.textSvg = document.createElementNS(ns, "svg");
    this.textSvg.classList.add("zm-text__svg");
    this.textSvg.setAttribute("width", String(this.imgW));
    this.textSvg.setAttribute("height", String(this.imgH));
    this.textSvgWrap.appendChild(this.textSvg);

    this.textGuidesLayer = document.createElementNS(ns, "g");
    this.textSvg.appendChild(this.textGuidesLayer);

    this.textDraftLayer = document.createElementNS(ns, "g");
    this.textSvg.appendChild(this.textDraftLayer);

    this.textTextLayer = document.createElementNS(ns, "g");
    this.textSvg.appendChild(this.textTextLayer);

    this.textHitEl = this.worldEl.createDiv({ cls: "zm-text-hitboxes" });
    this.textEditEl = this.worldEl.createDiv({ cls: "zm-text-edit" });

    // Text width measurement (CSS variables supported)
    this.textMeasureSpan = this.viewportEl.createEl("span", { cls: "zm-text-measure" });
  }

  private renderTextLayers(): void {
    if (!this.data || !this.textSvg) return;

    const enabled = !!this.plugin.settings.enableTextLayers;
    this.ensureTextData();

    // If disabled: fully hide / disable
    if (!enabled) {
      this.textGuidesLayer.innerHTML = "";
      this.textDraftLayer.innerHTML = "";
      this.textTextLayer.innerHTML = "";
      this.textHitEl.empty();
      this.stopTextEdit(false);
      return;
    }

    // Keep SVG in sync with image size
    this.textSvg.setAttribute("width", String(this.imgW));
    this.textSvg.setAttribute("height", String(this.imgH));

    this.textGuidesLayer.innerHTML = "";
    this.textTextLayer.innerHTML = "";
    this.textHitEl.empty();

    const ns = "http://www.w3.org/2000/svg";

    const abs = (nx: number, ny: number) => ({ x: nx * this.imgW, y: ny * this.imgH });
    const rectAbs = (r: { x0: number; y0: number; x1: number; y1: number }) => {
      const x = Math.min(r.x0, r.x1) * this.imgW;
      const y = Math.min(r.y0, r.y1) * this.imgH;
      const w = Math.abs(r.x1 - r.x0) * this.imgW;
      const h = Math.abs(r.y1 - r.y0) * this.imgH;
      return { x, y, w, h };
    };

    const layers = this.data.textLayers ?? [];
    for (const layer of layers) {
	  if (!this.isTextLayerVisible(layer)) continue;
      const activeBase = this.getActiveBasePath();
      if (layer.boundBase && layer.boundBase !== activeBase) continue;
	  const boxes = layer.boxes ?? [];

      for (const box of boxes) {
        const r = rectAbs(box.rect);
        const hb = this.textHitEl.createDiv({ cls: "zm-text-hitbox" });
        hb.dataset.layerId = layer.id;
        hb.dataset.boxId = box.id;
        hb.style.left = `${r.x}px`;
        hb.style.top = `${r.y}px`;
        hb.style.width = `${r.w}px`;
        hb.style.height = `${r.h}px`;
        hb.ondragstart = (ev) => ev.preventDefault();

        const moveActive =
          this.textMode === "move" &&
          this.activeTextLayerId === layer.id &&
          this.activeTextBoxId === box.id;
        if (moveActive) hb.classList.add("zm-text-hitbox--move");
        else hb.classList.remove("zm-text-hitbox--move");

        hb.addEventListener("pointerdown", (e: PointerEvent) => {
          if (!this.data) return;
          if (e.button !== 0) return;
          if (!this.plugin.settings.enableTextLayers) return;
          if (this.isTextBoxLocked(box, layer)) return;
          if (!(this.textMode === "move" && this.activeTextLayerId === layer.id && this.activeTextBoxId === box.id)) return;
          e.preventDefault();
          e.stopPropagation();
          this.plugin.setActiveMap(this);
          const p = this.mouseEventToWorldNorm(e as unknown as MouseEvent);
          this.startTextBoxMove(layer.id, box.id, p, e.pointerId, hb);
        });

        hb.addEventListener("dblclick", (e: MouseEvent) => {
          if (this.drawingMode) {
            e.preventDefault();
            e.stopPropagation();
            this.onDblClickViewport(e);
            return;
          }
          e.stopPropagation();
        });

        hb.addEventListener("click", (e: MouseEvent) => {
          if (this.drawingMode) {
            e.preventDefault();
            e.stopPropagation();
            this.handleDrawClick(e);
            return;
          }

          e.stopPropagation();
          if (this.suppressTextClickOnce) return;

          if (this.textMode === "move" && this.activeTextLayerId === layer.id && this.activeTextBoxId === box.id) {
            return;
          }

          if (this.textMode === "draw-lines" && this.activeTextLayerId === layer.id && this.activeTextBoxId === box.id) {
            this.onTextDrawLineClick(layer, box, e);
            return;
          }

          this.onTextBoxClick(layer, box, e);
        });
		
        hb.addEventListener("contextmenu", (e: MouseEvent) => {
          // Text hitboxes should not have their own context menu.
          // Instead, forward the right click to whatever is underneath
          // (drawings, markers, or the viewport itself).
          e.preventDefault();
          e.stopPropagation();
          this.forwardContextMenuPastTextHitbox(e);
        });

        const showNow =
          (this.textMode === "draw-lines" || this.textMode === "move") &&
          this.activeTextLayerId === layer.id &&
          this.activeTextBoxId === box.id;

        if (showNow) {
          const rect = document.createElementNS(ns, "rect");
          rect.classList.add("zm-text-guide-rect");
          rect.classList.add("zm-text-guide--active");
          rect.setAttribute("x", String(r.x));
          rect.setAttribute("y", String(r.y));
          rect.setAttribute("width", String(r.w));
          rect.setAttribute("height", String(r.h));
          this.textGuidesLayer.appendChild(rect);

          for (const ln of box.lines ?? []) {
            const a = abs(ln.x0, ln.y0);
            const b = abs(ln.x1, ln.y1);

            const line = document.createElementNS(ns, "line");
            line.classList.add("zm-text-guide-line");
            line.classList.add("zm-text-guide--active");
            line.setAttribute("x1", String(a.x));
            line.setAttribute("y1", String(a.y));
            line.setAttribute("x2", String(b.x));
            line.setAttribute("y2", String(b.y));
            this.textGuidesLayer.appendChild(line);
          }
        }

        const isEditingThis =
          this.textMode === "edit" &&
          this.activeTextLayerId === layer.id &&
          this.activeTextBoxId === box.id;
        if (isEditingThis) continue;

        const st = this.getTextBoxStyle(box, layer);
        for (const ln of box.lines ?? []) {
          const txt = (ln.text ?? "").trimEnd();
          if (!txt) continue;

          const a = abs(ln.x0, ln.y0);
          const b = abs(ln.x1, ln.y1);

          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;

          const padLeft = st.padLeft ?? 0;
          const x = a.x + padLeft;
          const y = a.y;

          const t = document.createElementNS(ns, "text");
          t.setAttribute("x", String(x));
          t.setAttribute("y", String(y));
          t.textContent = txt;

          t.style.fill = st.color;
          t.style.fontFamily = st.fontFamily;
          t.style.fontSize = `${st.fontSize}px`;
          if (st.fontWeight) t.style.fontWeight = st.fontWeight;
          if (st.italic) t.classList.add("zm-text-italic");
          if (typeof st.letterSpacing === "number") t.style.letterSpacing = `${st.letterSpacing}px`;

          if (Math.abs(angleDeg) > 0.01) {
            t.setAttribute("transform", `rotate(${angleDeg} ${x} ${y})`);
          }

          this.textTextLayer.appendChild(t);
        }
      }
    }

    this.renderTextDraft();
  }

  private renderTextDraft(): void {
    if (!this.textDraftLayer) return;
    this.textDraftLayer.innerHTML = "";

    const enabled = !!this.plugin.settings.enableTextLayers;
    if (!enabled) return;

    const ns = "http://www.w3.org/2000/svg";
    const abs = (nx: number, ny: number) => ({ x: nx * this.imgW, y: ny * this.imgH });

    // Box preview while creating a new text box
    if (this.textMode === "draw-box" && this.textDrawStart && this.textDrawPreview) {
      const a = abs(this.textDrawStart.x, this.textDrawStart.y);
      const b = abs(this.textDrawPreview.x, this.textDrawPreview.y);
      const x = Math.min(a.x, b.x);
      const y = Math.min(a.y, b.y);
      const w = Math.abs(a.x - b.x);
      const h = Math.abs(a.y - b.y);

      const rect = document.createElementNS(ns, "rect");
      rect.classList.add("zm-text-guide-rect");
	  rect.classList.add("zm-text-guide--active");
      rect.setAttribute("x", String(x));
      rect.setAttribute("y", String(y));
      rect.setAttribute("width", String(w));
      rect.setAttribute("height", String(h));
      this.textDraftLayer.appendChild(rect);
    }

    // Line preview while drawing baselines
    if (this.textMode === "draw-lines" && this.textLineStart && this.textLinePreview) {
      const a = abs(this.textLineStart.x, this.textLineStart.y);
      const b = abs(this.textLinePreview.x, this.textLinePreview.y);

      const line = document.createElementNS(ns, "line");
      line.classList.add("zm-text-guide-draft");
	  line.classList.add("zm-text-guide--active");
      line.setAttribute("x1", String(a.x));
      line.setAttribute("y1", String(a.y));
      line.setAttribute("x2", String(b.x));
      line.setAttribute("y2", String(b.y));
      this.textDraftLayer.appendChild(line);
    }
  }

  private onTextBoxClick(layer: TextLayer, box: TextBox, ev: MouseEvent): void {
    if (!this.data) return;
    if (!this.plugin.settings.enableTextLayers) return;

    if (this.isTextBoxLocked(box, layer)) {
      new Notice("Text box is locked.", 1500);
      return;
    }

    const lines = box.lines ?? [];
    if (lines.length === 0) {
      new Notice("No baselines in this text box yet. Use 'draw lines' first.", 3000);
      return;
    }

    const p = this.mouseEventToWorldNorm(ev);
    this.startTextEdit(layer.id, box.id, p);
  }

  private mouseEventToWorldNorm(ev: MouseEvent): Point {
    const vpRect = this.viewportEl.getBoundingClientRect();
    const vx = ev.clientX - vpRect.left;
    const vy = ev.clientY - vpRect.top;
    const wx = (vx - this.tx) / this.scale;
    const wy = (vy - this.ty) / this.scale;
    return {
      x: clamp(wx / this.imgW, 0, 1),
      y: clamp(wy / this.imgH, 0, 1),
    };
  }
  
  private clampTextBoxDelta(
    rect: TextBox["rect"],
    dx: number,
    dy: number,
  ): { dx: number; dy: number } {
    const minX = Math.min(rect.x0, rect.x1);
    const maxX = Math.max(rect.x0, rect.x1);
    const minY = Math.min(rect.y0, rect.y1);
    const maxY = Math.max(rect.y0, rect.y1);

    const dxClamped = clamp(dx, -minX, 1 - maxX);
    const dyClamped = clamp(dy, -minY, 1 - maxY);
    return { dx: dxClamped, dy: dyClamped };
  }

  private startTextBoxMove(layerId: string, boxId: string, start: Point, pointerId: number, host: HTMLElement): void {
    const found = this.getTextBoxById(layerId, boxId);
    if (!found) return;
    const { layer, box } = found;
    if (layer.visible === false) layer.visible = true;

    this.stopTextEdit(true);
	this.finishTextBoxMove(false);
    this.measuring = false;
    this.calibrating = false;
    this.drawingMode = null;

    this.textMode = "move";
    this.activeTextLayerId = layerId;
	this.activeTextBoxId = boxId;

    this.textMoveDragging = true;
    this.textMovePointerId = pointerId;
    this.textMoveStart = start;
    this.textMoveOrig = {
      rect: { ...box.rect },
      lines: (box.lines ?? []).map((ln) => ({ ...ln })),
    };

    host.classList.add("zm-text-hitbox--dragging");
    document.body.classList.add("zm-cursor-move-grabbing");
    host.setPointerCapture?.(pointerId);
  }

  private updateTextBoxMove(cur: Point): void {
    if (!this.data) return;
    if (!this.textMoveDragging || !this.textMoveStart || !this.textMoveOrig || !this.activeTextLayerId || !this.activeTextBoxId) return;

    const found = this.getTextBoxById(this.activeTextLayerId, this.activeTextBoxId);
    if (!found) return;
    const { layer, box } = found;
    if (this.isTextBoxLocked(box, layer)) return;

    const dxRaw = cur.x - this.textMoveStart.x;
    const dyRaw = cur.y - this.textMoveStart.y;
    const { dx, dy } = this.clampTextBoxDelta(this.textMoveOrig.rect, dxRaw, dyRaw);

    box.rect = {
      x0: this.textMoveOrig.rect.x0 + dx,
      y0: this.textMoveOrig.rect.y0 + dy,
      x1: this.textMoveOrig.rect.x1 + dx,
      y1: this.textMoveOrig.rect.y1 + dy,
    };

    const srcLines = this.textMoveOrig.lines;
    box.lines ??= [];
    if (box.lines.length !== srcLines.length) {
      const byId = new Map(box.lines.map((ln) => [ln.id, ln]));
      box.lines = srcLines.map((s) => {
        const existing = byId.get(s.id);
        return existing ?? { ...s };
      });
    }

    for (let i = 0; i < srcLines.length; i += 1) {
      const s = srcLines[i];
      const ln = box.lines[i];
      ln.x0 = s.x0 + dx;
      ln.y0 = s.y0 + dy;
      ln.x1 = s.x1 + dx;
      ln.y1 = s.y1 + dy;
    }

    this.renderTextLayers();
  }

  private finishTextBoxMove(commit: boolean): void {
    if (!this.textMoveDragging) return;
    this.textMoveDragging = false;
    this.textMovePointerId = null;
    this.textMoveStart = null;
    this.textMoveOrig = null;
    document.body.classList.remove("zm-cursor-move-grabbing");

    this.textHitEl?.querySelectorAll(".zm-text-hitbox--dragging").forEach((el) => el.classList.remove("zm-text-hitbox--dragging"));

    if (commit) {
      void this.saveDataSoon();
    }
  }

  private startTextEdit(layerId: string, boxId: string, focus?: Point): void {
    if (!this.data) return;

    // Close other modes
    this.measuring = false;
    this.calibrating = false;
    this.drawingMode = null;
	this.finishTextBoxMove(false);

    this.stopTextEdit(true);

    this.textMode = "edit";
    this.activeTextLayerId = layerId;
	this.activeTextBoxId = boxId;
    this.textDirty = false;

    const found = this.getTextBoxById(layerId, boxId);
    if (!found) return;
    const { layer, box } = found;

    if (this.isTextBoxLocked(box, layer)) return;

	box.lines ??= [];
	
    if (typeof box.autoFlow !== "boolean") box.autoFlow = this.isTextBoxAutoFlow(box, layer);
    if (typeof box.allowAngledBaselines !== "boolean") box.allowAngledBaselines = this.isTextBoxAllowAngled(box, layer);
    box.style = this.getTextBoxStyle(box, layer);

    this.textEditEl.empty();
    this.textInputs.clear();

    const st = box.style;

    const sorted = [...(box.lines ?? [])].sort((a, b) => {
      const ay = (a.y0 + a.y1) / 2;
      const by = (b.y0 + b.y1) / 2;
      return ay - by || a.x0 - b.x0;
    });
    box.lines = sorted;

    for (let i = 0; i < box.lines.length; i += 1) {
      const ln = box.lines[i];

      const ax0 = ln.x0 * this.imgW;
      const ay0 = ln.y0 * this.imgH;
      const ax1 = ln.x1 * this.imgW;
      const ay1 = ln.y1 * this.imgH;

      const dx = ax1 - ax0;
      const dy = ay1 - ay0;
      const len = Math.max(1, Math.hypot(dx, dy));
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

      // Line box sizing (prevents vertical clipping)
      const fontSize = st.fontSize;
      const lineH =
        typeof st.lineHeight === "number" && st.lineHeight > 1
          ? st.lineHeight
          : Math.round(fontSize * 1.35);

      // Approx baseline alignment:
      // CSS line-height adds leading split above/below -> baseline shifts down by leading/2.
      const leading = Math.max(0, lineH - fontSize);
      const ascent = Math.round(fontSize * 0.8);
      const rise = ascent + Math.round(leading / 2);

      const ux = dx / len;
      const uy = dy / len;
      const nx = -uy;
      const ny = ux;

      const row = this.textEditEl.createDiv({ cls: "zm-text-line" });

      // Move the input box "above" the baseline so text sits on the line.
      row.style.left = `${ax0 - nx * rise}px`;
      row.style.top = `${ay0 - ny * rise}px`;

      row.style.width = `${len}px`;
      row.style.height = `${lineH}px`;
      row.style.transform = `rotate(${angle}deg)`;

      const input = row.createEl("input", { cls: "zm-text-input" });
      input.type = "text";
      input.value = ln.text ?? "";

      input.style.height = `${lineH}px`;
      input.style.lineHeight = `${lineH}px`;

      input.style.fontFamily = st.fontFamily;
      input.style.fontSize = `${st.fontSize}px`;
      input.style.color = st.color;
      if (st.fontWeight) input.style.fontWeight = st.fontWeight;
      if (st.italic) input.classList.add("zm-text-italic");
      if (typeof st.letterSpacing === "number") input.style.letterSpacing = `${st.letterSpacing}px`;
      input.style.paddingLeft = `${st.padLeft ?? 0}px`;
      input.style.paddingRight = `${st.padRight ?? 0}px`;

      // Prevent viewport handlers (pan/zoom/add-marker) from interfering
      input.addEventListener("pointerdown", (e) => e.stopPropagation());
      input.addEventListener("click", (e) => e.stopPropagation());
      input.addEventListener("dblclick", (e) => e.stopPropagation());
      input.addEventListener("contextmenu", (e) => e.stopPropagation());

      input.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          this.stopTextEdit(true);
          return;
        }
		
		if (e.key === "Backspace" && this.isTextBoxAutoFlow(box, layer)) {
        const selStart = input.selectionStart ?? 0;
        const selEnd = input.selectionEnd ?? selStart;

        // If caret is at the start of this baseline line:
        // move to previous line (like deleting a newline in a textarea).
        if (selStart === 0 && selEnd === 0 && i > 0) {
          e.preventDefault();
          e.stopPropagation();

          const prev = this.getTextInputByIndex(i - 1);
          if (!prev) return;

          const joinPos = prev.value.length;

          prev.focus();
          prev.setSelectionRange(joinPos, joinPos);

          // Try to pull words up from this line into the previous one
          // (removes the "implicit newline" as much as it fits).
          this.textDirty = true;
          this.reflowTextBox(box, st, i - 1, { advanceFocus: false });
          this.scheduleTextSave();

          // Ensure caret stays at the join position after reflow updates values.
          window.setTimeout(() => {
            if (this.textMode !== "edit") return;
            const pos = Math.min(joinPos, prev.value.length);
            prev.focus();
            prev.setSelectionRange(pos, pos);
          }, 0);

          return;
        }
      }

        // Jump between baselines
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          const next = this.getTextInputByIndex(i + 1);
          next?.focus();
          return;
        }

        if (e.key === "ArrowDown") {
          const next = this.getTextInputByIndex(i + 1);
          if (next) {
            e.preventDefault();
            next.focus();
          }
          return;
        }
        if (e.key === "ArrowUp") {
          const prev = this.getTextInputByIndex(i - 1);
          if (prev) {
            e.preventDefault();
            prev.focus();
          }
          return;
        }
      });

      input.addEventListener("input", () => {
	  if (this.isTextBoxLocked(box, layer)) {
		input.value = ln.text ?? "";
		new Notice("Text box is locked.", 1200);
		return;
	  }
	  
        // Fixed-lines mode: do NOT reflow between baselines.
        if (!this.isTextBoxAutoFlow(box, layer)) {
          ln.text = input.value;
          this.textDirty = true;
          this.scheduleTextSave();
          return;
        }

	  // If the user is typing at the end of the line, we can safely advance focus on overflow.
	  const selStart = input.selectionStart ?? input.value.length;
	  const selEnd = input.selectionEnd ?? selStart;
	  const hasSelection = selEnd !== selStart;
	  const atEnd = !hasSelection && selStart === input.value.length;

	  ln.text = input.value;
	  this.textDirty = true;

	  const move = this.reflowTextBox(box, st, i, { advanceFocus: atEnd });
	  this.scheduleTextSave();

	  if (move.advance) {
		window.setTimeout(() => {
		  if (this.textMode !== "edit") return;
		  const next = this.getTextInputByIndex(move.advance!.toIndex);
		  if (!next) return;

		  next.focus();

		  const pos = Math.min(move.advance!.caret, next.value.length);
		  next.setSelectionRange(pos, pos);
		}, 0);
	  }
	});

      this.textInputs.set(ln.id, input);
    }

    this.installTextOutsideClickHandler();

    // Focus nearest line (or first)
    if (focus) {
      this.focusNearestBaseline(box, focus);
    } else {
      this.getTextInputByIndex(0)?.focus();
    }

    // Hide static SVG text for the active layer
    this.renderTextLayers();
  }

  private stopTextEdit(save: boolean): void {
    if (this.textMode !== "edit") return;

    this.textMode = null;
    this.activeTextLayerId = null;
    this.activeTextBoxId = null;

    this.textInputs.clear();
    this.textEditEl.empty();

    this.textOutsideCleanup?.();
    this.textOutsideCleanup = null;

    if (save) {
      this.flushTextSaveNow();
    } else {
      if (this.textSaveTimer !== null) {
        window.clearTimeout(this.textSaveTimer);
        this.textSaveTimer = null;
      }
      this.textDirty = false;
    }

    this.renderTextLayers();
  }

  private installTextOutsideClickHandler(): void {
    this.textOutsideCleanup?.();
    this.textOutsideCleanup = null;

    const doc = this.el.ownerDocument;

    const handler = (ev: PointerEvent) => {
      if (this.textMode !== "edit") return;

      const t = ev.target;
      if (!(t instanceof Node)) return;

      if (this.textEditEl.contains(t)) return;

      if (this.activeTextLayerId && this.activeTextBoxId) {
        const hb = this.textHitEl.querySelector(
          `.zm-text-hitbox[data-layer-id="${this.activeTextLayerId}"][data-box-id="${this.activeTextBoxId}"]`,
        );
        if (hb && hb.contains(t)) return;
      }

      this.stopTextEdit(true);
    };

    doc.addEventListener("pointerdown", handler, { capture: true });
    this.textOutsideCleanup = () => {
      doc.removeEventListener("pointerdown", handler, true);
    };
  }

  private getTextInputByIndex(index: number): HTMLInputElement | null {
    const found = this.getTextBoxById(this.activeTextLayerId, this.activeTextBoxId);
    if (!found) return null;
    const ln = found.box.lines?.[index];
    if (!ln) return null;
    return this.textInputs.get(ln.id) ?? null;
  }

  private focusNearestBaseline(box: TextBox, p: Point): void {
    if (!box.lines?.length) return;

    const py = p.y;
    let bestIdx = 0;
    let bestDist = Infinity;

    for (let i = 0; i < box.lines.length; i += 1) {
      const ln = box.lines[i];
      const y = (ln.y0 + ln.y1) / 2;
      const d = Math.abs(y - py);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }

    this.getTextInputByIndex(bestIdx)?.focus();
  }

  private scheduleTextSave(delayMs = 900): void {
    if (!this.data) return;

    if (this.textSaveTimer !== null) window.clearTimeout(this.textSaveTimer);
    this.textSaveTimer = window.setTimeout(() => {
      this.textSaveTimer = null;
      if (!this.textDirty) return;
      void this.saveDataSoon().then(() => {
        this.textDirty = false;
      });
    }, delayMs);
  }

  private flushTextSaveNow(): void {
    if (!this.data) return;

    if (this.textSaveTimer !== null) {
      window.clearTimeout(this.textSaveTimer);
      this.textSaveTimer = null;
    }
    if (!this.textDirty) return;

    void this.saveDataSoon().then(() => {
      this.textDirty = false;
    });
  }

  private measureTextWidthPx(style: TextLayerStyle, text: string): number {
    const span = this.textMeasureSpan;
    if (!span) return text.length * (style.fontSize ?? 14);

    span.style.fontFamily = style.fontFamily;
    span.style.fontSize = `${style.fontSize}px`;
    span.style.fontWeight = style.fontWeight ?? "400";
    span.style.letterSpacing =
      typeof style.letterSpacing === "number" ? `${style.letterSpacing}px` : "normal";

    span.textContent = text || "";
    return span.getBoundingClientRect().width;
  }

  private lineCapacityPx(style: TextLayerStyle, ln: TextBaseline): number {
	const ax0 = ln.x0 * this.imgW;
    const ay0 = ln.y0 * this.imgH;
    const ax1 = ln.x1 * this.imgW;
    const ay1 = ln.y1 * this.imgH;
    const len = Math.hypot(ax1 - ax0, ay1 - ay0);

    const cap = len - (style.padLeft ?? 0) - (style.padRight ?? 0);
    return Math.max(10, cap);
  }

  private splitToFit(
    style: TextLayerStyle,
    ln: TextBaseline,
    text: string,
  ): { fit: string; rest: string; overflowed: boolean; boundaryOnly: boolean } {
    const cap = this.lineCapacityPx(style, ln);
    const st = style;

    if (this.measureTextWidthPx(st, text) <= cap) {
      return { fit: text, rest: "", overflowed: false, boundaryOnly: false };
    }

    // Try to split on spaces (word wrap)
    for (let i = text.length - 1; i >= 0; i -= 1) {
      if (text[i] !== " ") continue;
      const left = text.slice(0, i).trimEnd();
      const right = text.slice(i + 1).trimStart();
      if (!left) continue;

      if (this.measureTextWidthPx(st, left) <= cap) {
        return { fit: left, rest: right, overflowed: true, boundaryOnly: right.length === 0 };
      }
    }

    // Character wrap
    let lo = 0;
    let hi = text.length;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      const left = text.slice(0, mid);
      if (this.measureTextWidthPx(st, left) <= cap) lo = mid;
      else hi = mid - 1;
    }

    const fit = text.slice(0, lo).trimEnd();
    const rest = text.slice(lo).trimStart();
    return { fit, rest, overflowed: true, boundaryOnly: false };
  }

  private pullWord(text: string): { word: string; rest: string } | null {
    const s = text.trimStart();
    if (!s) return null;

    const m = /^(\S+)\s*(.*)$/.exec(s);
    if (!m) return null;

    return { word: m[1] ?? "", rest: m[2] ?? "" };
  }

  private reflowTextBox(
  box: TextBox,
  style: TextLayerStyle,
  startIndex: number,
  opts?: { advanceFocus?: boolean },
): { advance?: { toIndex: number; caret: number } } {
  if (!box.lines?.length) return {};

  let advance: { toIndex: number; caret: number } | undefined;

  // 1) Push overflow forward from startIndex
  for (let i = startIndex; i < box.lines.length; i += 1) {
    const ln = box.lines[i];
    const txt = ln.text ?? "";
	const { fit, rest, overflowed, boundaryOnly } = this.splitToFit(style, ln, txt);

    if (!overflowed) {
      ln.text = fit;
      continue;
    }

    ln.text = fit;

    const next = box.lines[i + 1];
    if (!next) {
      new Notice("No more baselines in this text box.", 1500);
      continue;
    }

    if (rest) {
      const nextTxt = (next.text ?? "").trimStart();
      next.text = (rest + (nextTxt ? " " + nextTxt : "")).trimEnd();
    }

    // Suggest focus move only for the line that the user is actively typing in
    if (!advance && i === startIndex && opts?.advanceFocus) {
      advance = { toIndex: i + 1, caret: boundaryOnly ? 0 : rest.length };
    }
  }

  // 2) Pull words up to fill gaps
  for (let i = startIndex; i < box.lines.length - 1; i += 1) {
    const cur = box.lines[i];
    const next = box.lines[i + 1];
    if (!next) continue;

    while (true) {
      const pick = this.pullWord(next.text ?? "");
      if (!pick) break;

      const candidate = (cur.text ?? "").trimEnd();
      const joined = candidate ? `${candidate} ${pick.word}` : pick.word;

      if (this.measureTextWidthPx(style, joined) <= this.lineCapacityPx(style, cur)) {
        cur.text = joined;
        next.text = pick.rest.trimStart();
      } else {
        break;
      }
    }
  }

  // Sync DOM inputs from data (keeps active selection stable)
  this.syncInputsFromBox(box);

  return { advance };
}

  private syncInputsFromBox(box: TextBox): void {
    const active = this.el.ownerDocument.activeElement;

    for (const ln of box.lines ?? []) {
      const input = this.textInputs.get(ln.id);
      if (!input) continue;

      const want = ln.text ?? "";
      if (input.value === want) continue;

      if (active === input) {
        const selStart = input.selectionStart ?? want.length;
        const selEnd = input.selectionEnd ?? want.length;

        input.value = want;

        const s = Math.min(selStart, want.length);
        const e = Math.min(selEnd, want.length);
        input.setSelectionRange(s, e);
      } else {
        input.value = want;
      }
    }
  }

  private onTextDrawLineClick(layer: TextLayer, box: TextBox, ev: MouseEvent): void {
    if (!this.data) return;

    if (this.isTextBoxLocked(box, layer)) {
      new Notice("Text box is locked.", 1500);
      return;
    }

    const p = this.mouseEventToWorldNorm(ev);

    // Start point
    if (!this.textLineStart) {
      this.textLineStart = p;
      this.textLinePreview = p;
      this.renderTextDraft();
      return;
    }

    // End point
    const a = this.textLineStart;
    const b = p;

    const rect = box.rect;
    const minX = Math.min(rect.x0, rect.x1);
    const maxX = Math.max(rect.x0, rect.x1);
    const minY = Math.min(rect.y0, rect.y1);
    const maxY = Math.max(rect.y0, rect.y1);

    let x0 = a.x;
    let y0 = a.y;
    let x1 = b.x;
    let y1 = b.y;

    const allowAngled = this.isTextBoxAllowAngled(box, layer);
    const freeAngle = allowAngled && ev.ctrlKey;

    if (!freeAngle) {
      const y = (y0 + y1) / 2;
      y0 = y;
      y1 = y;
    }

    // Keep left->right ordering for consistency
    if (x1 < x0) {
      [x0, x1] = [x1, x0];
      [y0, y1] = [y1, y0];
    }

    // Clamp endpoints into the layer rect
    x0 = clamp(x0, minX, maxX);
    x1 = clamp(x1, minX, maxX);
    y0 = clamp(y0, minY, maxY);
    y1 = clamp(y1, minY, maxY);

    const pxLen = Math.hypot((x1 - x0) * this.imgW, (y1 - y0) * this.imgH);
    if (pxLen < 6) {
      new Notice("Baseline too short.", 1200);
      this.textLineStart = null;
      this.textLinePreview = null;
      this.renderTextDraft();
      return;
    }

    box.lines ??= [];
    box.lines.push({
      id: generateId("tln"),
      x0,
      y0,
      x1,
      y1,
      text: "",
    });

    // Sort by Y, then X
    box.lines.sort((u, v) => {
      const uy = (u.y0 + u.y1) / 2;
      const vy = (v.y0 + v.y1) / 2;
      return uy - vy || u.x0 - v.x0;
    });

    this.textLineStart = null;
    this.textLinePreview = null;

    void this.saveDataSoon();
    this.renderTextLayers();
  }

  private startDrawNewTextBox(layerId: string, mode: "custom" | "auto"): void {
    if (!this.data) return;
    if (!this.plugin.settings.enableTextLayers) {
      new Notice("Text layers are disabled in preferences.", 2500);
      return;
    }
    const layer = this.getTextLayerById(layerId);
    if (!layer) return;
    if (layer.locked) {
      new Notice("Text layer is locked.", 1500);
      return;
    }

    this.stopTextEdit(true);
	this.finishTextBoxMove(false);

    this.measuring = false;
    this.calibrating = false;
    this.drawingMode = null;

    this.textMode = "draw-box";
    this.activeTextLayerId = layerId;
    this.activeTextBoxId = null;
    this.textDrawBoxMode = mode;
    this.textDrawStart = null;
    this.textDrawPreview = null;

    new Notice(`Draw ${mode} text box: drag to create the box. Press esc to cancel.`, 4500);
  }

  private finishDrawNewTextBox(): void {
    if (!this.data || !this.textDrawStart || !this.textDrawPreview) return;
    const layer = this.getTextLayerById(this.activeTextLayerId);
    if (!layer) return;

    const a = this.textDrawStart;
    const b = this.textDrawPreview;

   const rect: TextBox["rect"] = {
      x0: a.x,
      y0: a.y,
      x1: b.x,
      y1: b.y,
    };

    const pxW = Math.abs(rect.x1 - rect.x0) * this.imgW;
    const pxH = Math.abs(rect.y1 - rect.y0) * this.imgH;
    if (pxW < 12 || pxH < 12) {
      new Notice("Text box too small.", 1500);
      return;
    }

    const box: TextBox = {
      id: generateId("tbox"),
      name: `Text box ${(layer.boxes?.length ?? 0) + 1}`,
      mode: this.textDrawBoxMode,
      rect,
      lines: [],
      style: this.normalizeTextLayerStyle(layer.style),
      autoFlow: true,
      allowAngledBaselines: false,
      locked: false,
    };

    if (box.mode === "auto") {
      box.auto = this.defaultTextBoxAutoConfig();
      box.lines = this.buildAutoTextBoxLines(box.rect, box.style!, box.auto);
    }
    layer.boxes ??= [];
    layer.boxes.push(box);

    this.textMode = null;
    this.textDrawStart = null;
    this.textDrawPreview = null;

    this.renderTextLayers();
    void this.saveDataSoon();

    if (box.mode === "custom") {
      this.textMode = "draw-lines";
      this.activeTextLayerId = layer.id;
      this.activeTextBoxId = box.id;
      this.renderTextLayers();
      new Notice("Draw baselines: click start + end. Hold ctrl for free angle (if enabled). Esc to exit.", 6000);
      return;
    }
    this.openTextBoxConfigModal(layer, box);
  }

  private renderMeasure(): void {
    if (!this.measureSvg) return;
    this.measureSvg.setAttribute("width", String(this.imgW));
    this.measureSvg.setAttribute("height", String(this.imgH));

    const pts: Point[] = [...this.measurePts];
    if (this.measuring && this.measurePreview) pts.push(this.measurePreview);

    const toAbs = (p: Point) => ({ x: p.x * this.imgW, y: p.y * this.imgH });

    let d = "";
    pts.forEach((p, i) => {
      const a = toAbs(p);
      d += i === 0 ? `M ${a.x} ${a.y}` : ` L ${a.x} ${a.y}`;
    });
    this.measurePath.setAttribute("d", d);

    while (this.measureDots.firstChild) this.measureDots.removeChild(this.measureDots.firstChild);

    for (const p of this.measurePts) {
      const a = toAbs(p);
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", String(a.x));
      c.setAttribute("cy", String(a.y));
      c.setAttribute("r", "4");
      c.classList.add("zm-measure__dot");
      this.measureDots.appendChild(c);
    }

    this.updateMeasureHud();
  }

  private renderCalibrate(): void {
    if (!this.measureSvg) return;

    const toAbs = (p: Point) => ({ x: p.x * this.imgW, y: p.y * this.imgH });

    const pts: Point[] = [...this.calibPts];
    if (this.calibrating && this.calibPts.length === 1 && this.calibPreview) pts.push(this.calibPreview);

    let d = "";
    pts.forEach((p, i) => {
      const a = toAbs(p);
      d += i === 0 ? `M ${a.x} ${a.y}` : ` L ${a.x} ${a.y}`;
    });
    this.calibPath.setAttribute("d", d);

    while (this.calibDots.firstChild) this.calibDots.removeChild(this.calibDots.firstChild);
    for (const p of this.calibPts) {
      const a = toAbs(p);
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", String(a.x));
      c.setAttribute("cy", String(a.y));
      c.setAttribute("r", "4");
      c.classList.add("zm-measure__dot");
      this.calibDots.appendChild(c);
    }
  }

  private clearMeasure(): void {
    this.measurePts = [];
    this.measurePreview = null;
	this.measureSegTerrainIds = [];
    this.renderMeasure();
  }
  
  private ensureMeasureProTerrainIds(): void {
    if (!this.plugin.settings.enableMeasurePro) return;

    const want = Math.max(0, this.measurePts.length - 1);
    const terrains = this.plugin.getActiveTerrains();
    const def = terrains[0]?.id ?? "";

    while (this.measureSegTerrainIds.length < want) this.measureSegTerrainIds.push(def);
    if (this.measureSegTerrainIds.length > want) this.measureSegTerrainIds.length = want;
  }

  private terrainFactor(id: string): number {
    if (!id) return 1;
    const t = this.plugin.getActiveTerrains().find((x) => x.id === id);
    return t ? t.factor : 1;
  }

  private computeMeasureSegmentsMeters(includePreview: boolean): { meters: number; terrainId: string }[] | null {
    const mpp = this.getMetersPerPixel();
    if (!mpp) return null;

    const pts: Point[] = [...this.measurePts];
    const terrains = [...this.measureSegTerrainIds];

    if (includePreview && this.measurePreview && pts.length >= 1) {
      pts.push(this.measurePreview);
      terrains.push(terrains[terrains.length - 1] ?? terrains[0] ?? "");
    }

    if (pts.length < 2) return null;

    const out: { meters: number; terrainId: string }[] = [];
    for (let i = 1; i < pts.length; i += 1) {
      const a = pts[i - 1];
      const b = pts[i];
      const dx = (b.x - a.x) * this.imgW;
      const dy = (b.y - a.y) * this.imgH;
      const px = Math.hypot(dx, dy);
      out.push({ meters: px * mpp, terrainId: terrains[i - 1] ?? "" });
    }

    return out;
  }

  private openMeasureTerrainModal(): void {
    if (!this.plugin.settings.enableMeasurePro) return;
    if (this.measurePts.length < 2) {
      new Notice("Measure terrains: add at least 2 points first.", 2500);
      return;
    }

    const terrains = this.plugin.getActiveTerrains();
    if (terrains.length === 0) {
      new Notice("No terrains configured. Add terrains in settings → travel rules.", 4500);
      return;
    }

    this.ensureMeasureProTerrainIds();

    const unit = this.data?.measurement?.displayUnit ?? "auto-metric";
    const mpp = this.getMetersPerPixel();
    if (!mpp && unit !== "custom") {
      new Notice("Scale is not calibrated.", 2500);
      return;
    }

    const segments: MeasureTerrainSegment[] = [];
    for (let i = 1; i < this.measurePts.length; i += 1) {
      const a = this.measurePts[i - 1];
      const b = this.measurePts[i];
      const dx = (b.x - a.x) * this.imgW;
      const dy = (b.y - a.y) * this.imgH;
      const px = Math.hypot(dx, dy);

      const label =
        unit === "custom"
          ? this.formatCustomDistanceFromPixels(px)
          : this.formatDistance(px * (mpp as number));

        segments.push({
          label,
          terrainId: this.measureSegTerrainIds[i - 1] ?? terrains[0].id,
        });
    }

    new MeasureTerrainModal(this.app, terrains, segments, (res) => {
      this.measureSegTerrainIds = res.map((s) => s.terrainId);
      this.updateMeasureHud();
    }).open();
  }
  
  public toggleMeasureFromCommand(): void {
    if (!this.ready) return;

    if (this.calibrating) {
      this.calibrating = false;
      this.calibPts = [];
      this.calibPreview = null;
      this.renderCalibrate();
    }

    this.measuring = !this.measuring;
    if (!this.measuring) {
      this.measurePreview = null;
    }
    this.updateMeasureHud();
    this.renderMeasure();
  }
  
  public clearMeasurementFromCommand(): void {
    if (!this.ready) return;
    this.clearMeasure();
  }

  private getMetersPerPixel(): number | undefined {
    const base = this.getActiveBasePath();
    const m = this.data?.measurement;
    if (!m) return undefined;
    if (m.scales && base in m.scales) return m.scales[base];
    return m.metersPerPixel;
  }

  private ensureMeasurement(): void {
    if (!this.data) return;
    this.data.measurement ??= {
      displayUnit: "km",
      metersPerPixel: undefined,
      scales: {},
      travelTimePresetIds: [],
    };
    this.data.measurement.scales ??= {};
    this.data.measurement.displayUnit ??= "km";
    this.data.measurement.travelTimePresetIds ??= [];
	this.data.measurement.customUnitPxPerUnit ??= {};
  }
  
  private getCustomPxPerUnit(customUnitId: string): number | undefined {
    const base = this.getActiveBasePath();
    const map = this.data?.measurement?.customUnitPxPerUnit?.[base];
    const v = map?.[customUnitId];
    return typeof v === "number" && Number.isFinite(v) && v > 0 ? v : undefined;
  }

  private async applyCustomUnitCalibration(customUnitId: string, pxPerUnit: number): Promise<void> {
    if (!this.data) return;
    this.ensureMeasurement();
    const base = this.getActiveBasePath();
    const meas = this.data.measurement;
    if (!meas) return;

    meas.customUnitPxPerUnit ??= {};
    meas.customUnitPxPerUnit[base] ??= {};
    meas.customUnitPxPerUnit[base][customUnitId] = pxPerUnit;
 

    // Switch display unit to the calibrated one
    meas.displayUnit = "custom";
    meas.customUnitId = customUnitId;

    if (await this.store.wouldChange(this.data)) {
      this.ignoreNextModify = true;
      await this.store.save(this.data);
    }
	
    // scale changed -> ping notes should be recalculated
    this.schedulePingUpdate();
  }

  private updateMeasureHud(): void {
    if (!this.measureHud) return;

    const px = this.computeDistancePixels();
    const meters = this.computeDistanceMeters();
    const unit = (this.data?.measurement?.displayUnit as unknown as string) ?? "km";

    if (this.measuring || this.measurePts.length >= 2) {
      let distTxt = "No scale";
      if (unit === "custom") {
        distTxt = px != null ? this.formatCustomDistanceFromPixels(px) : "No distance";
      } else {
        distTxt = meters != null ? this.formatDistance(meters) : "No scale";
      }

      const lines: string[] = [`Distance: ${distTxt}`];

      if (meters != null) {
        const segments = this.plugin.settings.enableMeasurePro
          ? this.computeMeasureSegmentsMeters(this.measuring && !!this.measurePreview)
          : null;

        const tt = segments
          ? this.computeTravelTimeLinesBySegments(segments)
          : this.computeTravelTimeLines(meters);
        if (tt.length) lines.push(...tt);
      }

      this.measureHud.textContent = lines.join("\n");
      this.measureHud.classList.add("zm-measure-hud-visible");
    } else {
      this.measureHud.classList.remove("zm-measure-hud-visible");
    }
  }

  private computeDistanceMeters(): number | null {
    if (!this.data) return null;

    if (this.measurePts.length < 2 && !(this.measuring && this.measurePts.length >= 1 && this.measurePreview)) return null;

    const pts: Point[] = [...this.measurePts];
    if (this.measuring && this.measurePreview) pts.push(this.measurePreview);
	
    let px = 0;
    for (let i = 1; i < pts.length; i += 1) {
      const a = pts[i - 1];
      const b = pts[i];
      const dx = (b.x - a.x) * this.imgW;
      const dy = (b.y - a.y) * this.imgH;
      px += Math.hypot(dx, dy);
    }

    const mpp = this.getMetersPerPixel();
    if (!mpp) return null;
    return px * mpp;
  }

  private computeDistancePixels(): number | null {
    if (!this.data) return null;
    if (this.measurePts.length < 2 && !(this.measuring && this.measurePts.length >= 1 && this.measurePreview)) return null;

    const pts: Point[] = [...this.measurePts];
    if (this.measuring && this.measurePreview) pts.push(this.measurePreview);


    let px = 0;
    for (let i = 1; i < pts.length; i += 1) {
      const a = pts[i - 1];
      const b = pts[i];
      const dx = (b.x - a.x) * this.imgW;
      const dy = (b.y - a.y) * this.imgH;
      px += Math.hypot(dx, dy);
    }
	return px;
  }
  
  private formatCustomDistanceFromPixels(px: number): string {
    const meas = this.data?.measurement;
    const defs = this.plugin.getActiveCustomUnits();
    if (!meas || defs.length === 0) return "No custom units";

    const id = meas.customUnitId ?? defs[0].id;
    const def = defs.find((d) => d.id === id) ?? defs[0];
    if (!def) return "No custom units";

    const pxPerUnit = this.getCustomPxPerUnit(def.id);
    const label =
      (def.abbreviation ?? "").trim() ||
      (def.name ?? "").trim() ||
      "u";

    if (!pxPerUnit) return `No calibration (${label})`;

    const val = px / pxPerUnit;
    const round = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;
    return `${round(val, 2)} ${label}`;
  }

 private formatDistance(m: number): string {
    const meas = this.data?.measurement;
    const unit = (meas?.displayUnit as unknown as string) ?? "km";
    const round = (v: number, d = 2) =>
      Math.round(v * 10 ** d) / 10 ** d;

    if (unit === "custom") {
      const defs = this.plugin.getActiveCustomUnits();
      if (defs.length === 0) {
        return `${round(m, 2)} u`;
      }
      const activeId = meas?.customUnitId;
      const def =
        (activeId && defs.find((d) => d.id === activeId)) ??
        defs[0] ??
        null;
      if (!def) {
        return `${round(m, 2)} u`;
      }

      const val = m / (def.metersPerUnit || 1);
      const label =
        (typeof def.abbreviation === "string" && def.abbreviation.trim()) ||
        (typeof def.name === "string" && def.name.trim()) ||
        "u";
      return `${round(val, 2)} ${label}`;
    }

    switch (unit) {
      case "m":
        return `${Math.round(m)} m`;
      case "km":
        return `${round(m / 1000, 3)} km`;
      case "mi":
        return `${round(m / 1609.344, 3)} mi`;
      case "ft":
        return `${Math.round(m / 0.3048)} ft`;
      default:
        return `${round(m / 1000, 3)} km`;
    }
  }
  
  private travelDistanceToMeters(
  value: number,
  unit: "m" | "km" | "mi" | "ft" | "custom",
  customUnitId?: string,
): number | null {
  if (!Number.isFinite(value) || value <= 0) return null;

  switch (unit) {
    case "km": return value * 1000;
    case "mi": return value * 1609.344;
    case "ft": return value * 0.3048;
    case "custom": {
        const defs = this.plugin.getActiveCustomUnits();
        const id =
          (customUnitId ? defs.find((d) => d.id === customUnitId)?.id : undefined) ??
          defs[0]?.id;
        if (!id) return null;
        const pxPerUnit = this.getCustomPxPerUnit(id);
        const mpp = this.getMetersPerPixel();
        if (!pxPerUnit || !mpp) return null;
        return value * (pxPerUnit * mpp);
    }
    case "m":
    default:
      return value;
  }
}

  private formatTravelTimeNumber(v: number): string {
    const abs = Math.abs(v);
    const decimals = abs < 10 ? 2 : abs < 100 ? 1 : 0;
    const p = 10 ** decimals;
    return String(Math.round(v * p) / p);
  }
  
  private getSelectedTravelPerDayPreset(): { preset: TravelPerDayPreset | null; note?: string } {
    const info = this.plugin.getActiveTravelPerDayPresets?.();
    const presets = info?.presets ?? [];

    const note = info?.multipleEnabled
      ? `Multiple travel packs enabled; using "${info.packName ?? "first enabled"}".`
      : undefined;

    if (!presets.length) return { preset: null, note };

    const selectedId = (this.data?.measurement?.travelDayPresetId ?? "").trim();
    const picked = selectedId ? presets.find((p) => p.id === selectedId) : undefined;
    return { preset: picked ?? presets[0], note };
  }

  private computeTravelTimeLines(distanceMeters: number): string[] {
    const selected = new Set(this.data?.measurement?.travelTimePresetIds ?? []);
    if (selected.size === 0) return [];

    const presets = this.plugin.getActiveTravelTimePresets();
    const out: string[] = [];

    const perDaySel = this.getSelectedTravelPerDayPreset();
    const perDayPreset = perDaySel.preset;
    const perDayValue = perDayPreset?.value ?? null;
    const perDayUnit = (perDayPreset?.unit ?? "").trim();
    const perDayName = (perDayPreset?.name ?? "").trim();

    const showDays = !!this.data?.measurement?.travelDaysEnabled;

    for (const p of presets) {
      if (!p?.id || !selected.has(p.id)) continue;

      const name = (p.name ?? "").trim();
      const unit = (p.timeUnit ?? "").trim();
      if (!name || !unit) continue;

      if (!Number.isFinite(p.timeValue) || p.timeValue <= 0) continue;

      const refMeters = this.travelDistanceToMeters(
        p.distanceValue,
        p.distanceUnit,
        p.distanceCustomUnitId,
      );
      if (!refMeters) continue;

      const t = (distanceMeters / refMeters) * p.timeValue;
      out.push(`Time (${name}): ${this.formatTravelTimeNumber(t)} ${unit}`);

      if (!showDays) continue;

      if (perDaySel.note) out.push(`Travel days: ${perDaySel.note}`);

      if (!perDayValue || !perDayUnit) {
        out.push("Travel days: not configured (set per-day unit/value in settings)");
        continue;
      }

      const presetUnitNorm = unit.trim().toLowerCase();
      const perDayUnitNorm = perDayUnit.trim().toLowerCase();

      if (presetUnitNorm !== perDayUnitNorm) {
        out.push(`Travel days: unit mismatch (preset: ${unit}, max: ${perDayUnit})`);
        continue;
      }

      const total = t;
      const fullDays = Math.floor(total / perDayValue);
      const rest = total - fullDays * perDayValue;

      const restAbs = Math.abs(rest);
      const label = perDayName ? ` (${perDayName})` : "";

      if (restAbs < 1e-6) {
        out.push(`Travel days${label} (${perDayValue} ${perDayUnit}/day): ${fullDays}d`);
      } else if (fullDays <= 0) {
        out.push(
          `Travel days${label} (${perDayValue} ${perDayUnit}/day): 0d + ${this.formatTravelTimeNumber(rest)} ${unit}`,
        );
      } else {
        out.push(
          `Travel days${label} (${perDayValue} ${perDayUnit}/day): ${fullDays}d + ${this.formatTravelTimeNumber(rest)} ${unit}`,
        );
      }
    }

    return out;
  }
  
  private computeTravelTimeLinesBySegments(segments: { meters: number; terrainId: string }[]): string[] {
    const selected = new Set(this.data?.measurement?.travelTimePresetIds ?? []);
    if (selected.size === 0) return [];

    const presets = this.plugin.getActiveTravelTimePresets();
    const out: string[] = [];

    const perDaySel = this.getSelectedTravelPerDayPreset();
    const perDayPreset = perDaySel.preset;
    const perDayValue = perDayPreset?.value ?? null;
    const perDayUnit = (perDayPreset?.unit ?? "").trim();
    const perDayName = (perDayPreset?.name ?? "").trim();

    const showDays = !!this.data?.measurement?.travelDaysEnabled;

    for (const p of presets) {
      if (!p?.id || !selected.has(p.id)) continue;

      const name = (p.name ?? "").trim();
      const unit = (p.timeUnit ?? "").trim();
      if (!name || !unit) continue;

      if (!Number.isFinite(p.timeValue) || p.timeValue <= 0) continue;

      const refMeters = this.travelDistanceToMeters(
        p.distanceValue,
        p.distanceUnit,
        p.distanceCustomUnitId,
      );
      if (!refMeters) continue;

      let t = 0;
      for (const seg of segments) {
        const f = this.terrainFactor(seg.terrainId);
        t += (seg.meters / refMeters) * p.timeValue / (f > 0 ? f : 1);
      }

      out.push(`Time (${name}): ${this.formatTravelTimeNumber(t)} ${unit}`);

      if (!showDays) continue;

      if (perDaySel.note) out.push(`Travel days: ${perDaySel.note}`);

      if (!perDayValue || !perDayUnit) {
        out.push("Travel days: not configured (set per-day unit/value in settings)");
        continue;
      }

      const presetUnitNorm = unit.trim().toLowerCase();
      const perDayUnitNorm = perDayUnit.trim().toLowerCase();

      if (presetUnitNorm !== perDayUnitNorm) {
        out.push(`Travel days: unit mismatch (preset: ${unit}, max: ${perDayUnit})`);
        continue;
      }

      const total = t;
      const fullDays = Math.floor(total / perDayValue);
      const rest = total - fullDays * perDayValue;

      const restAbs = Math.abs(rest);
      const label = perDayName ? ` (${perDayName})` : "";

      if (restAbs < 1e-6) {
        out.push(`Travel days${label} (${perDayValue} ${perDayUnit}/day): ${fullDays}d`);
      } else if (fullDays <= 0) {
        out.push(
          `Travel days${label} (${perDayValue} ${perDayUnit}/day): 0d + ${this.formatTravelTimeNumber(rest)} ${unit}`,
        );
      } else {
        out.push(
          `Travel days${label} (${perDayValue} ${perDayUnit}/day): ${fullDays}d + ${this.formatTravelTimeNumber(rest)} ${unit}`,
        );
      }
    }

    return out;
  }

  private resolveTFile(pathOrWiki: string, from: string): TFile | null {
    const byPath = this.app.vault.getAbstractFileByPath(pathOrWiki);
    if (byPath instanceof TFile) return byPath;
    const dest = this.app.metadataCache.getFirstLinkpathDest(pathOrWiki, from);
    return dest instanceof TFile ? dest : null;
  }

  private resolveResourceUrl(pathOrData: string): string {
    if (!pathOrData) return "";
    if (pathOrData.startsWith("data:")) return pathOrData;
    const f = this.resolveTFile(pathOrData, this.cfg.sourcePath);
    if (f) return this.app.vault.getResourcePath(f);
    return pathOrData;
  }

  private onResize(): void {
    if (!this.ready || !this.data) return;

    const oldRect = this.viewportEl.getBoundingClientRect();
    const oldVw = oldRect.width || this.vw || 0;
    const oldVh = oldRect.height || this.vh || 0;

    if (oldVw >= 2 && oldVh >= 2) {
      this.captureViewIfVisible();
    }

    this.applyViewportInset();

    const r = this.viewportEl.getBoundingClientRect();
    const newVw = r.width || 0;
    const newVh = r.height || 0;
    this.vw = newVw;
    this.vh = newVh;

    // If hidden/collapsed, do not apply any "preserve center" math.
    if (newVw < 2 || newVh < 2) {
      return;
    }

    this.updateHudPinsForResize(r);

    if (this.cfg.responsive) {
      this.fitToView();
      if (this.isCanvas()) this.renderCanvas();
      this.renderMarkersOnly();
	  this.renderDrawingEditHandles();
      return;
    }
	
    // Apply initial view once, otherwise restore last known view.
    if (oldVw < 2 || oldVh < 2) {
      if (!this.initialViewApplied) {
        if (this.cfg.initialZoom && this.cfg.initialCenter) {
          this.applyInitialView(this.cfg.initialZoom, this.cfg.initialCenter);
        } else {
          this.fitToView();
        }
        this.initialViewApplied = true;
      } else if (this.lastGoodView) {
        this.applyInitialView(this.lastGoodView.scale, this.lastGoodView.center);
      } else {
        // Fallback: keep current transform
        this.applyTransform(this.scale, this.tx, this.ty);
      }

      if (this.isCanvas()) this.renderCanvas();
      this.renderMarkersOnly();
	  this.renderDrawingEditHandles();
      return;
    }

    // Preserve the world position at the center while the viewport size changes.
    const worldCx = (oldVw / 2 - this.tx) / this.scale;
    const worldCy = (oldVh / 2 - this.ty) / this.scale;


    const txNew = this.vw / 2 - worldCx * this.scale;
    const tyNew = this.vh / 2 - worldCy * this.scale;
    this.applyTransform(this.scale, txNew, tyNew, true);
    this.renderMarkersOnly();
	this.renderDrawingEditHandles();

    if (
      this.shouldUseSavedFrame() &&
      this.cfg.resizable &&
      this.cfg.resizeHandle === "native" &&
      !this.userResizing
    ) {
      if (!this.initialLayoutDone) this.initialLayoutDone = true;
      else if (this.isFrameVisibleEnough()) this.requestPersistFrame();
    }
  }

  private onWheel(e: WheelEvent): void {
    if (!this.ready) return;
    const factor = this.plugin.settings.wheelZoomFactor ?? 1.1;
    const step = Math.pow(factor, e.deltaY < 0 ? 1 : -1);
    const vpRect = this.viewportEl.getBoundingClientRect();
    const cx = clamp(e.clientX - vpRect.left, 0, this.vw);
    const cy = clamp(e.clientY - vpRect.top, 0, this.vh);
    this.zoomAt(cx, cy, step);
  }

  private panButtonMatches(e: PointerEvent | MouseEvent): boolean {
    const want = this.plugin.settings.panMouseButton ?? "left";
    if (want === "middle") return e.button === 1;
    if (want === "right") return e.button === 2;
    return e.button === 0;
  }

  private onPointerDownViewport(e: PointerEvent): void {
    if (!this.ready) return;
	
	if (this.textMode === "draw-box") {
      if (e.button !== 0) return;

      const vpRect = this.viewportEl.getBoundingClientRect();
      const vx = e.clientX - vpRect.left;
      const vy = e.clientY - vpRect.top;
      const wx = (vx - this.tx) / this.scale;
      const wy = (vy - this.ty) / this.scale;

      this.textDrawStart = { x: clamp(wx / this.imgW, 0, 1), y: clamp(wy / this.imgH, 0, 1) };
      this.textDrawPreview = this.textDrawStart;

      this.renderTextDraft();
      return;
    }

    this.plugin.setActiveMap(this);

    this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (e.target instanceof Element && e.target.setPointerCapture(e.pointerId)) (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const tgt = e.target;
    if (tgt instanceof Element && tgt.closest(".zm-marker")) return;

    if (this.cfg.responsive) return;

    if (this.activePointers.size === 2) { this.startPinch(); return; }

	if (this.drawingMode) {
      return;
    }

    if (this.pinchActive) return;
    if (!this.panButtonMatches(e)) return;

    this.draggingView = true;
	this.draggingViewButton = e.button;
	this.lastPos = { x: e.clientX, y: e.clientY };

	this.viewDragDist = 0;
	this.viewDragMoved = false;
  }

  private onPointerMove(e: PointerEvent): void {
    if (!this.ready) return;
	
    // Text box move drag
    if (this.textMoveDragging) {
      e.preventDefault();
      e.stopPropagation();

      const vpRect = this.viewportEl.getBoundingClientRect();
      const vx = e.clientX - vpRect.left;
      const vy = e.clientY - vpRect.top;
      const wx = (vx - this.tx) / this.scale;
      const wy = (vy - this.ty) / this.scale;
      const p = { x: clamp(wx / this.imgW, 0, 1), y: clamp(wy / this.imgH, 0, 1) };
      this.updateTextBoxMove(p);
      return;
    }
	
    if (this.drawEditPointerId !== null && e.pointerId === this.drawEditPointerId) {
      e.preventDefault();
      e.stopPropagation();
      this.updateEditedDrawingHandleFromClient(e.clientX, e.clientY);
      return;
    }

    if (this.drawEditDrawingId) {
      this.renderDrawingEditHandles();
    }


    // Prevent workspace edge-swipe gestures while actively panning/zooming on touch devices.
    if (e.pointerType === "touch") {
      if (this.draggingView || this.pinchActive) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
	
	// Text layer draw preview (box)
    if (this.textMode === "draw-box" && this.textDrawStart) {
      const vpRect = this.viewportEl.getBoundingClientRect();
      const vx = e.clientX - vpRect.left;
      const vy = e.clientY - vpRect.top;
      const wx = (vx - this.tx) / this.scale;
      const wy = (vy - this.ty) / this.scale;

      this.textDrawPreview = { x: clamp(wx / this.imgW, 0, 1), y: clamp(wy / this.imgH, 0, 1) };
      this.renderTextDraft();
      return;
    }

    // Text baseline preview (line)
    if (this.textMode === "draw-lines" && this.textLineStart) {
      const vpRect = this.viewportEl.getBoundingClientRect();
      const vx = e.clientX - vpRect.left;
      const vy = e.clientY - vpRect.top;
      const wx = (vx - this.tx) / this.scale;
      const wy = (vy - this.ty) / this.scale;

      this.textLinePreview = { x: clamp(wx / this.imgW, 0, 1), y: clamp(wy / this.imgH, 0, 1) };
      this.renderTextDraft();
      return;
    }
	
	if (this.updateDrawPreview(e)) {
      return;
    }

    if (this.activePointers.has(e.pointerId)) {
      this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    if (this.pinchActive) {
      this.updatePinch();
      return;
    }

    if (this.draggingMarkerId && this.data) {
      const m = this.data.markers.find((mm) => mm.id === this.draggingMarkerId);
      if (!m) return;

      const vpRect = this.viewportEl.getBoundingClientRect();
      const vx = e.clientX - vpRect.left;
      const vy = e.clientY - vpRect.top;
      const off = this.dragAnchorOffset ?? { dx: 0, dy: 0 };

      if (m.anchorSpace === "viewport") {
        const vw = vpRect.width || 1;
        const vh = vpRect.height || 1;

        const leftScreen = vx - off.dx;
        const topScreen = vy - off.dy;

        const prevX = m.hudX ?? leftScreen;
        const prevY = m.hudY ?? topScreen;

        m.hudX = leftScreen;
        m.hudY = topScreen;
        m.hudLastWidth = vw;
        m.hudLastHeight = vh;
        m.x = vw > 0 ? leftScreen / vw : 0;
        m.y = vh > 0 ? topScreen / vh : 0;

        const movedEnough =
          Math.hypot(leftScreen - prevX, topScreen - prevY) > 1;
        if (movedEnough) this.dragMoved = true;
      } else {
        const wx = (vx - this.tx) / this.scale;
        const wy = (vy - this.ty) / this.scale;

        const nx = clamp((wx - off.dx) / this.imgW, 0, 1);
        const ny = clamp((wy - off.dy) / this.imgH, 0, 1);

        const movedEnough = Math.hypot(
          (nx - m.x) * this.imgW,
          (ny - m.y) * this.imgH,
        ) > 1;
        if (movedEnough) this.dragMoved = true;

        m.x = nx;
        m.y = ny;
      }

      this.renderMarkersOnly();
      return;
    }

    if (this.measuring) {
      const vpRect = this.viewportEl.getBoundingClientRect();
      const vx = e.clientX - vpRect.left;
      const vy = e.clientY - vpRect.top;
      const wx = (vx - this.tx) / this.scale;
      const wy = (vy - this.ty) / this.scale;
      this.measurePreview = {
        x: clamp(wx / this.imgW, 0, 1),
        y: clamp(wy / this.imgH, 0, 1),
      };
      this.renderMeasure();
    }

    if (this.calibrating && this.calibPts.length === 1) {
      const vpRect = this.viewportEl.getBoundingClientRect();
      const vx = e.clientX - vpRect.left;
      const vy = e.clientY - vpRect.top;
      const wx = (vx - this.tx) / this.scale;
      const wy = (vy - this.ty) / this.scale;
      this.calibPreview = {
        x: clamp(wx / this.imgW, 0, 1),
        y: clamp(wy / this.imgH, 0, 1),
      };
      this.renderCalibrate();
    }

    if (!this.draggingView) return;
    const dx = e.clientX - this.lastPos.x;
    const dy = e.clientY - this.lastPos.y;
	this.viewDragDist += Math.hypot(dx, dy);
	if (this.viewDragDist > 4) this.viewDragMoved = true;
	
    if (this.draggingViewButton === 2 && this.viewDragMoved) {
      this.suppressContextMenuOnce = true;
    }
    this.lastPos = { x: e.clientX, y: e.clientY };

    this.panAccDx += dx;
    this.panAccDy += dy;
    this.requestPanFrame();
  }

  private onPointerUp(e?: PointerEvent): void {
  if (
      this.drawEditPointerId !== null &&
      (!e || e.pointerId === this.drawEditPointerId)
    ) {
      this.drawEditPointerId = null;
      this.drawEditPointIndex = null;
      void this.saveDataSoon();
      this.renderDrawings();
      this.renderDrawingEditHandles();
      return;
    }
	  
  if (this.textMoveDragging) {
      this.finishTextBoxMove(true);
      return;
    }
	  
  if (this.textMode === "draw-box" && this.textDrawStart && this.textDrawPreview) {
      this.finishDrawNewTextBox();
      return;
    }
 
  if (this.draggingMarkerId) {
    const draggedId = this.draggingMarkerId;
    const wasMoved = this.dragMoved;

    if (wasMoved && this.data) {
      const m = this.data.markers.find((mm) => mm.id === draggedId);
      if (m && m.anchorSpace === "viewport") {
        const vpRect = this.viewportEl.getBoundingClientRect();
        this.classifyHudMetaFromCurrentPosition(m, vpRect);
      }

      this.suppressClickMarkerId = draggedId;
      window.setTimeout(() => {
        this.suppressClickMarkerId = null;
      }, 0);

      void this.saveDataSoon();
      // marker moved -> ping notes might change
      this.schedulePingUpdate();
    }

    // Ensure dragging class is removed even if pointerup happens outside the marker
    const host =
      this.markersEl.querySelector<HTMLElement>(`.zm-marker[data-id="${draggedId}"]`) ??
      this.hudMarkersEl.querySelector<HTMLElement>(`.zm-marker[data-id="${draggedId}"]`);
    if (host) host.classList.remove("zm-marker--dragging");
  }

  this.draggingMarkerId = null;
  this.dragAnchorOffset = null;
  this.dragMoved = false;
  document.body.classList.remove("zm-cursor-grabbing");

  this.draggingView = false;
  this.draggingViewButton = null;
  this.panAccDx = 0;
  this.panAccDy = 0;
  if (this.panRAF != null) {
    cancelAnimationFrame(this.panRAF);
    this.panRAF = null;
  }
  if (this.viewDragMoved) {
  this.suppressTextClickOnce = true;
  window.setTimeout(() => {
    this.suppressTextClickOnce = false;
  }, 0);
}

this.viewDragMoved = false;
this.viewDragDist = 0;
}

  private startPinch(): void {
    const pts = this.getTwoPointers();
    if (!pts) return;
    this.pinchActive = true;
    this.pinchStartScale = this.scale;
    this.pinchPrevCenter = this.mid(pts[0], pts[1]);
    this.pinchStartDist = this.dist(pts[0], pts[1]);

    this.draggingView = false;
    this.draggingMarkerId = null;
    this.measuring = false;
    this.calibrating = false;
  }

  private updatePinch(): void {
    const pts = this.getTwoPointers();
    if (!pts || !this.pinchActive) return;
    const center = this.mid(pts[0], pts[1]);
    const curDist = this.dist(pts[0], pts[1]);
    if (this.pinchStartDist <= 0) return;

    const targetScale = clamp(this.pinchStartScale * (curDist / this.pinchStartDist), this.cfg.minZoom, this.cfg.maxZoom);

    const vpRect = this.viewportEl.getBoundingClientRect();
    const cx = clamp(center.x - vpRect.left, 0, this.vw);
    const cy = clamp(center.y - vpRect.top, 0, this.vh);

    const factor = targetScale / this.scale;
    if (Math.abs(factor - 1) > 1e-3) this.zoomAt(cx, cy, factor);

    if (this.pinchPrevCenter) {
      const dx = center.x - this.pinchPrevCenter.x;
      const dy = center.y - this.pinchPrevCenter.y;
      if (Math.abs(dx) + Math.abs(dy) > 0.5) this.panBy(dx, dy);
    }
    this.pinchPrevCenter = center;
  }

  private endPinch(): void {
    this.pinchActive = false;
    this.pinchPrevCenter = null;
    this.pinchStartDist = 0;
  }

  private getTwoPointers(): [{ x: number; y: number }, { x: number; y: number }] | null {
    if (this.activePointers.size !== 2) return null;
    const it = Array.from(this.activePointers.values());
    return [it[0], it[1]];
  }

  private dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }
  private mid(a: { x: number; y: number }, b: { x: number; y: number }): { x: number; y: number } {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }
  
  private canUseNativeTouchCapture(): boolean {
    if (!this.ready) return false;
    if (this.cfg.responsive) return false;
    return true;
  }

  private resetNativeTouchCapture(): void {
    this.touchGestureCandidate = false;
    this.touchGestureLocked = false;
    this.touchGestureStartX = 0;
    this.touchGestureStartY = 0;
  }

  private shouldIgnoreNativeTouchCapture(target: EventTarget | null): boolean {
    const el = target instanceof Element ? target : null;
    if (!el) return false;

    return !!el.closest(
      [
        ".popover",
        ".hover-popover",
        ".zm-menu",
        ".zm-submenu",
        ".zm-tooltip",
        ".suggestion-container",
        ".modal",
        "input",
        "textarea",
        "select",
        "button",
        ".zm-text-input",
      ].join(", "),
    );
  }

  private onNativeTouchStart = (e: TouchEvent): void => {
    if (!this.canUseNativeTouchCapture()) return;
    if (this.shouldIgnoreNativeTouchCapture(e.target)) return;
    if (e.touches.length <= 0) return;

    const first = e.touches[0];
    const vpRect = this.viewportEl.getBoundingClientRect();
    const x = first.clientX - vpRect.left;
    const y = first.clientY - vpRect.top;

    this.touchGestureStartX = x;
    this.touchGestureStartY = y;
    this.touchGestureCandidate = true;
    this.touchGestureLocked = false;

    const nearEdgeX =
      x <= this.touchGestureEdgeGuardPx ||
      x >= vpRect.width - this.touchGestureEdgeGuardPx;

    if (e.touches.length >= 2 || nearEdgeX) {
      this.touchGestureLocked = true;
      this.touchGestureCandidate = false;
      e.preventDefault();
    }

    e.stopPropagation();
  };

  private onNativeTouchMove = (e: TouchEvent): void => {
    if (!this.canUseNativeTouchCapture()) return;
    if (!this.touchGestureCandidate && !this.touchGestureLocked) return;
    if (e.touches.length <= 0) {
      this.resetNativeTouchCapture();
      return;
    }

    const first = e.touches[0];

    if (!this.touchGestureLocked) {
      if (e.touches.length >= 2) {
        this.touchGestureLocked = true;
        this.touchGestureCandidate = false;
      } else {
        const vpRect = this.viewportEl.getBoundingClientRect();
        const x = first.clientX - vpRect.left;
        const y = first.clientY - vpRect.top;
        const dx = x - this.touchGestureStartX;
        const dy = y - this.touchGestureStartY;

        if (Math.hypot(dx, dy) >= this.touchGestureLockThresholdPx) {
          this.touchGestureLocked = true;
          this.touchGestureCandidate = false;
        }
      }
    }

    if (this.touchGestureLocked) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  private onNativeTouchEnd = (e: TouchEvent): void => {
    if (e.touches.length === 0) {
      this.resetNativeTouchCapture();
    }
  };

  private onDblClickViewport(e: MouseEvent): void {
    if (!this.ready) return;

    if ((this.drawingMode === "polygon" || this.drawingMode === "polyline") && this.drawPolygonPoints.length >= 2) {
      if (this.drawingMode === "polyline") this.finishPolylineDrawing();
      else this.finishPolygonDrawing();
      return;
    }

    if (this.measuring) {
      this.measuring = false;
      this.measurePreview = null;
      this.updateMeasureHud();
      return;
    }

    if (e.target instanceof HTMLElement && e.target.closest(".zm-marker")) return;

    const vpRect = this.viewportEl.getBoundingClientRect();
    const cx = e.clientX - vpRect.left;
    const cy = e.clientY - vpRect.top;
    this.zoomAt(cx, cy, 1.5);
  }

    private onClickViewport(e: MouseEvent): void {
    if (!this.ready) return;

    if (this.handleDrawClick(e)) {
      return;
    }

    if (this.calibrating) {
      const vpRect = this.viewportEl.getBoundingClientRect();
      const vx = e.clientX - vpRect.left;
      const vy = e.clientY - vpRect.top;
      const wx = (vx - this.tx) / this.scale;
      const wy = (vy - this.ty) / this.scale;
      const p = {
        x: clamp(wx / this.imgW, 0, 1),
        y: clamp(wy / this.imgH, 0, 1),
      };
      this.calibPts.push(p);

      if (this.calibPts.length === 2) {
        const pxDist = Math.hypot(
          (this.calibPts[1].x - this.calibPts[0].x) * this.imgW,
          (this.calibPts[1].y - this.calibPts[0].y) * this.imgH,
        );

        const meas = this.data?.measurement;
		const customDefs = this.plugin.getActiveCustomUnits();

        let initialUnit: ScaleUnitValue = "km";
        if (meas?.displayUnit === "custom" && typeof meas.customUnitId === "string" && meas.customUnitId.trim()) {
          initialUnit = `custom:${meas.customUnitId}` as ScaleUnitValue;
        } else if (
          meas?.displayUnit === "m" ||
          meas?.displayUnit === "km" ||
          meas?.displayUnit === "mi" ||
          meas?.displayUnit === "ft"
        ) {
          initialUnit = meas.displayUnit;
        }

        new ScaleCalibrateModal(
          this.app,
          pxDist,
          (result) => {
            void (async () => {
              if (typeof result.metersPerPixel === "number") {
                await this.applyScaleCalibration(result.metersPerPixel);
                this.ensureMeasurement();
                if (this.data?.measurement) {
                  if (result.unit === "m" || result.unit === "km" || result.unit === "mi" || result.unit === "ft") {
                    this.data.measurement.displayUnit = result.unit;
                    delete this.data.measurement.customUnitId;
                    await this.saveDataSoon();
                  }
                }
                new Notice(`Scale set: ${result.metersPerPixel.toFixed(6)} m/px`, 2000);
              } else if (result.customUnitId && typeof result.pixelsPerUnit === "number") {
                await this.applyCustomUnitCalibration(result.customUnitId, result.pixelsPerUnit);
                const defs = this.plugin.getActiveCustomUnits();
                const def = defs.find((d) => d.id === result.customUnitId);
                const label = (def?.abbreviation ?? def?.name ?? result.customUnitId).trim();
                new Notice(`Unit scale set: ${result.pixelsPerUnit.toFixed(3)} px/${label}`, 2500);
              }

              this.updateMeasureHud();
            })();

            this.calibrating = false;
            this.calibPts = [];
            this.calibPreview = null;
            this.renderCalibrate();
          },
          {
            initialUnit,
            customUnits: customDefs.map((u) => ({ id: u.id, name: u.name, abbreviation: u.abbreviation })),
          },
        ).open();
      }

      this.renderCalibrate();
      return;
    }

    if (this.measuring) {
      const vpRect = this.viewportEl.getBoundingClientRect();
      const vx = e.clientX - vpRect.left;
      const vy = e.clientY - vpRect.top;
      const wx = (vx - this.tx) / this.scale;
      const wy = (vy - this.ty) / this.scale;
      const p = {
        x: clamp(wx / this.imgW, 0, 1),
        y: clamp(wy / this.imgH, 0, 1),
      };
      this.measurePts.push(p);
      this.renderMeasure();
      return;
    }

    if (this.cfg.displayOnly) return;

    if (e.shiftKey) {
      const vpRect = this.viewportEl.getBoundingClientRect();
      const vx = e.clientX - vpRect.left;
      const vy = e.clientY - vpRect.top;
      const wx = (vx - this.tx) / this.scale;
      const wy = (vy - this.ty) / this.scale;
      const nx = clamp(wx / this.imgW, 0, 1);
      const ny = clamp(wy / this.imgH, 0, 1);
      this.addMarkerInteractive(nx, ny);
    }
  }

  private getLayerById(id: string): MarkerLayer | undefined {
    return this.data?.layers.find((l) => l.id === id);
  }
  
  private getPreferredNewMarkerLayerId(): string {
    if (!this.data || !this.data.layers || this.data.layers.length === 0) {
      return "default";
    }

    const prefer = !!this.plugin.settings.preferActiveLayerInEditor;

    // "Active" here means: visible, and ideally not locked.
    if (prefer) {
      return (
        this.data.layers.find((l) => l.visible && !l.locked)?.id ??
        this.data.layers.find((l) => l.visible)?.id ??
        this.data.layers[0].id
      );
    }

    // Keep old behavior when preference is off: first visible layer (or fallback).
    return this.data.layers.find((l) => l.visible)?.id ?? this.data.layers[0].id;
  }

  private getLayerState(layer: MarkerLayer): LayerTriState {
    if (!layer.visible) return "hidden";
    return layer.locked ? "locked" : "visible";
  }

  private advanceLayerState(layer: MarkerLayer): LayerTriState {
    const cur = this.getLayerState(layer);
    let next: LayerTriState;
    if (cur === "hidden") {
      layer.visible = true;
      layer.locked = false;
      next = "visible";
    } else if (cur === "visible") {
      layer.visible = true;
      layer.locked = true;
      next = "locked";
    } else {
      layer.visible = false;
      layer.locked = false;
      next = "hidden";
    }
    return next;
  }

  private isLayerLocked(layerId: string): boolean {
    const l = this.getLayerById(layerId);
    return !!(l && l.visible && l.locked);
  }

  private async applyBoundBaseVisibility(): Promise<void> {
    if (!this.data) return;
    const active = this.getActiveBasePath();
    let changed = false;
    // Marker layers
    for (const l of this.data.layers) {
      if (!l.boundBase) continue;
      const want = l.boundBase === active;
      if (l.visible !== want) { l.visible = want; changed = true; }
    }

    // Draw layers
    for (const dl of (this.data.drawLayers ?? [])) {
      if (!dl.boundBase) continue;
      const want = dl.boundBase === active;
      if (dl.visible !== want) { dl.visible = want; changed = true; }
    }
    if (changed) {
      this.renderMarkersOnly();
      this.renderDrawings();
      this.renderTextLayers()
      await this.saveDataSoon();
    }
  }

  /* ===== Collections helpers ===== */
  private getActiveBasePath(): string {
    if (!this.data) return this.cfg.imagePath;
    return this.data.activeBase ?? this.getBasesNormalized()[0]?.path ?? this.cfg.imagePath;
  }

  private getCollectionsSplitForActive(): { matched: BaseCollection[]; globals: BaseCollection[] } {
    const all = (this.plugin.settings.baseCollections ?? []).filter(Boolean);
    const active = this.getActiveBasePath();

    const matches = (c: BaseCollection) => (c.bindings?.basePaths ?? []).some((p) => p === active);
    const isGlobal = (c: BaseCollection) => !c.bindings || (c.bindings.basePaths?.length ?? 0) === 0;

    const matched = all.filter(matches);
    const globals = all.filter(isGlobal);
    return { matched, globals };
  }

  private computeCollectionSets(): {
    pinsBase: string[];
    pinsGlobal: string[];
    favsBase: MarkerPreset[];
    favsGlobal: MarkerPreset[];
    stickersBase: StickerPreset[];
    stickersGlobal: StickerPreset[];
    swapBase: SwapPinPreset[];
    swapGlobal: SwapPinPreset[];
    pingBase: PingPreset[];
    pingGlobal: PingPreset[];
  } {
    const { matched, globals } = this.getCollectionsSplitForActive();

    const pinsBase = [...new Set(matched.flatMap((c) => c.include?.pinKeys ?? []))];

    const favsBase: MarkerPreset[] = [];
    matched.forEach((c) =>
      (c.include?.favorites ?? []).forEach((f) => favsBase.push(f)),
    );

    const stickersBase: StickerPreset[] = [];
    matched.forEach((c) =>
      (c.include?.stickers ?? []).forEach((s) => stickersBase.push(s)),
    );

    const pinsGlobal = [...new Set(globals.flatMap((c) => c.include?.pinKeys ?? []))];

    const favsGlobal: MarkerPreset[] = [];
    globals.forEach((c) =>
      (c.include?.favorites ?? []).forEach((f) => favsGlobal.push(f)),
    );

    const stickersGlobal: StickerPreset[] = [];
    globals.forEach((c) =>
      (c.include?.stickers ?? []).forEach((s) => stickersGlobal.push(s)),
    );

    const swapBase: SwapPinPreset[] = [];
    matched.forEach((c) =>
      (c.include?.swapPins ?? []).forEach((sp) => swapBase.push(sp)),
    );

    const swapGlobal: SwapPinPreset[] = [];
    globals.forEach((c) =>
      (c.include?.swapPins ?? []).forEach((sp) => swapGlobal.push(sp)),
    );
	
    const pingBase: PingPreset[] = [];
    matched.forEach((c) =>
      (c.include?.pingPins ?? []).forEach((pp) => pingBase.push(pp)),
    );

    const pingGlobal: PingPreset[] = [];
    globals.forEach((c) =>
      (c.include?.pingPins ?? []).forEach((pp) => pingGlobal.push(pp)),
    );

    return {
      pinsBase,
      pinsGlobal,
      favsBase,
      favsGlobal,
      stickersBase,
      stickersGlobal,
      swapBase,
      swapGlobal,
      pingBase,
      pingGlobal,	  
    };
  }
  
  private findSwapPresetById(id: string): SwapPinPreset | undefined {
    const cols = this.plugin.settings.baseCollections ?? [];
    for (const col of cols) {
      const list = col.include?.swapPins ?? [];
      const found = list.find((sp) => sp.id === id);
      if (found) return found;
    }
    return undefined;
  }
  
  private findPingPresetById(id: string): PingPreset | undefined {
    const cols = this.plugin.settings.baseCollections ?? [];
    for (const col of cols) {
      const list = col.include?.pingPins ?? [];
      const found = list.find((pp) => pp.id === id);
      if (found) return found;
    }
    return undefined;
  }

  private getSwapFrameForMarker(m: Marker): SwapPinFrame | null {
    if (m.type !== "swap" || !m.swapKey) return null;
    const preset = this.findSwapPresetById(m.swapKey);
    if (!preset || !preset.frames.length) return null;
    const rawIndex = typeof m.swapIndex === "number" ? m.swapIndex : 0;
    const count = preset.frames.length;
    const idx = ((rawIndex % count) + count) % count;
    return preset.frames[idx];
  }
  
  private worldNormToViewportPx(nx: number, ny: number): { x: number; y: number } {
    return {
      x: this.tx + nx * this.imgW * this.scale,
      y: this.ty + ny * this.imgH * this.scale,
    };
  }

  private viewportPxToWorldNorm(hx: number, hy: number): { x: number; y: number } {
    return {
      x: clamp(((hx - this.tx) / this.scale) / this.imgW, 0, 1),
      y: clamp(((hy - this.ty) / this.scale) / this.imgH, 0, 1),
    };
  }
  
  private getPingPresetsSplitForActive(): { pingBase: PingPreset[]; pingGlobal: PingPreset[] } {
    const { pingBase, pingGlobal } = this.computeCollectionSets();
    return { pingBase, pingGlobal };
  }
  
  private getSwapEffectiveLink(m: Marker): string | undefined {
    if (m.type !== "swap") return m.link;
    if (!m.swapKey) return m.link;

    const preset = this.findSwapPresetById(m.swapKey);
    if (!preset || !preset.frames.length) return m.link;

    const rawIndex = typeof m.swapIndex === "number" ? m.swapIndex : 0;
    const count = preset.frames.length;
    const idx = ((rawIndex % count) + count) % count;

    // 1) per-marker override
    const override = m.swapLinks?.[idx];
    if (typeof override === "string" && override.trim()) return override.trim();

    // 2) preset frame link
    const frame = preset.frames[idx];
    const presetLink = (frame?.link ?? "").trim();
    if (presetLink) return presetLink;

    // 3) icon default link
    const iconKey = (frame?.iconKey ?? "").trim();
    if (iconKey) return this.plugin.getIconDefaultLink(iconKey);

    return m.link;
  }

  private advanceSwapPin(m: Marker): void {
    if (m.type !== "swap" || !m.swapKey) return;
    const preset = this.findSwapPresetById(m.swapKey);
    if (!preset || !preset.frames.length) return;
    const rawIndex = typeof m.swapIndex === "number" ? m.swapIndex : 0;
    const next = rawIndex + 1;
    const count = preset.frames.length;
    m.swapIndex = ((next % count) + count) % count;
  }

  private addSwapPinHere(preset: SwapPinPreset, vx: number, vy: number): void {
    if (!this.data) return;

    let layerId = this.getPreferredNewMarkerLayerId();
    if (preset.layerName) {
      const found = this.data.layers.find((l) => l.name === preset.layerName);
      if (found) layerId = found.id;
      else {
        const id = generateId("layer");
        this.data.layers.push({ id, name: preset.layerName, visible: true, locked: false });
        layerId = id;
      }
    }
    const isHud = !!preset.defaultHud;
    const scaleLike = !!preset.defaultScaleLikeSticker;

    const marker: Marker = {
      id: generateId("marker"),
      type: "swap",
      layer: layerId,
      x: 0,
      y: 0,
      swapKey: preset.id,
      swapIndex: 0,
    };

    if (isHud) {
      marker.anchorSpace = "viewport";
      marker.hudX = vx;
      marker.hudY = vy;
      this.classifyHudMetaFromCurrentPosition(
        marker,
        this.viewportEl.getBoundingClientRect(),
      );
    } else {
      const wx = (vx - this.tx) / this.scale;
      const wy = (vy - this.ty) / this.scale;
      marker.x = clamp(wx / this.imgW, 0, 1);
      marker.y = clamp(wy / this.imgH, 0, 1);
    }

    if (scaleLike) marker.scaleLikeSticker = true;

    this.data.markers.push(marker);
    void this.saveDataSoon();
    this.renderMarkersOnly();
    new Notice("Swap pin added.", 900);
  }
  
  private async rollDiceMarker(m: Marker): Promise<void> {
    if (!this.data) return;
    if (m.type !== "dice") return;

    const rolls = m.diceRolls ?? [{ count: 1, sides: 20 }];
    const formula = diceRollsToFormula(rolls);
    const want3d = !!m.diceRender3d;

    const w = window as unknown as { DiceRoller?: unknown };
    const api = w.DiceRoller as
      | {
          parseDice?: (content: string, source?: string) => Promise<{ result: unknown }>;
        }
      | undefined;

    if (want3d) {
      const ws = this.app.workspace as unknown as { trigger?: (name: string, ...args: unknown[]) => void };
      if (ws && typeof ws.trigger === "function") {
        try {
          ws.trigger("dice-roller:render-dice", `${formula}|render`);
          return;
        } catch {
          // fall through
        }
      }
    }

    if (api && typeof api.parseDice === "function") {
      try {
        const res = await api.parseDice(formula, this.cfg.sourcePath);
        new Notice(`Roll: ${formula}\nResult: ${formatDiceApiResult(res?.result)}`.trim(), 5000);
        return;
      } catch {
        // fall through
      }
    }

    const local = localRollDice(rolls);
    new Notice(`Roll: ${formula}\n${local.details}\nTotal: ${local.total}`, 6000);
  }

  private addDicePinHere(nx: number, ny: number, vx?: number, vy?: number): void {
    if (!this.data) return;

    const iconKey = this.plugin.settings.defaultIconKey;
    const layerId = this.getPreferredNewMarkerLayerId();

    new DicePinModal(
      this.app,
      this.plugin,
      {
        iconKey,
        rolls: [{ count: 1, sides: 20 }],
        render3d: false,
        scaleLikeSticker: !!this.plugin.settings.defaultScaleLikeSticker,
        placeAsHudPin: false,
      },
      (res) => {
        if (!this.data) return;
        if (res.action !== "save") return;

        const marker: Marker = {
          id: generateId("dice"),
          type: "dice",
          x: nx,
          y: ny,
          layer: layerId,
          iconKey: res.value.iconKey,
          diceRolls: res.value.rolls,
          diceRender3d: res.value.render3d ? true : undefined,
		  scaleLikeSticker: res.value.scaleLikeSticker ? true : undefined,
          tooltip: diceRollsToFormula(res.value.rolls),
        };
		
        if (res.value.placeAsHudPin && typeof vx === "number" && typeof vy === "number") {
          marker.anchorSpace = "viewport";
          marker.hudX = vx;
          marker.hudY = vy;
          this.classifyHudMetaFromCurrentPosition(
            marker,
            this.viewportEl.getBoundingClientRect(),
          );
        }

        this.data.markers.push(marker);
        void this.saveDataSoon();
        this.renderMarkersOnly();
        new Notice("Dice pin added.", 900);
      },
    ).open();
  }
  
  private getPreferredTextLayer(): TextLayer | null {
    if (!this.data) return null;
    const activeBase = this.getActiveBasePath();

    const current = this.getTextLayerById(this.activeTextLayerId);
    if (current && this.isTextLayerVisible(current) && (!current.boundBase || current.boundBase === activeBase)) {
      return current;
    }

    return (
      (this.data.textLayers ?? []).find((l) => this.isTextLayerVisible(l) && (!l.boundBase || l.boundBase === activeBase)) ??
      null
    );
  }

  private drawingToTextBoxRect(d: Drawing): TextBox["rect"] | null {
    if (d.kind === "rect" && d.rect) {
      return { ...d.rect };
    }
    if (d.kind === "polyline" && d.polyline && d.polyline.length >= 2) {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (const p of d.polyline) {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      }
      const padX = 8 / this.imgW;
      const padY = 8 / this.imgH;
      return {
        x0: clamp(minX - padX, 0, 1),
        y0: clamp(minY - padY, 0, 1),
        x1: clamp(maxX + padX, 0, 1),
        y1: clamp(maxY + padY, 0, 1),
      };
    }
    return null;
  }

  private polylineToBaselines(points: { x: number; y: number }[]): TextBaseline[] {
    const out: TextBaseline[] = [];
    for (let i = 1; i < points.length; i += 1) {
      const a = points[i - 1];
      const b = points[i];
      out.push({
        id: generateId("tln"),
        x0: a.x,
        y0: a.y,
        x1: b.x,
        y1: b.y,
        text: "",
      });
    }
    return out;
  }

  private applyDrawingAsTextBox(d: Drawing, mode: "custom" | "auto"): void {
    if (!this.data) return;
    const layer = this.getPreferredTextLayer();
    if (!layer) {
      new Notice("Create a visible text layer first.", 2500);
      return;
    }
    const rect = this.drawingToTextBoxRect(d);
    if (!rect) {
      new Notice("This drawing cannot be converted to a text box.", 2500);
      return;
    }

    const box: TextBox = {
      id: generateId("tbox"),
      name: `${d.kind} text box`,
      mode,
      rect,
      lines: [],
      style: this.normalizeTextLayerStyle(layer.style),
      autoFlow: true,
      allowAngledBaselines: false,
      locked: false,
      sourceDrawingId: d.id,
      sourceDrawingKind: d.kind,
    };

    if (d.kind === "polyline" && d.polyline) {
      box.lines = this.polylineToBaselines(d.polyline);
    } else if (mode === "auto") {
      box.auto = this.defaultTextBoxAutoConfig();
      box.lines = this.buildAutoTextBoxLines(rect, box.style!, box.auto);
    }

    layer.boxes ??= [];
    layer.boxes.push(box);
    void this.saveDataSoon();
    this.renderTextLayers();
  }

private onContextMenuViewport(e: MouseEvent): void {
    if (!this.ready || !this.data) return;
    this.closeMenu();
    if (this.cfg.displayOnly) return;
	
    if ((this.plugin.settings.panMouseButton ?? "left") === "right" && this.suppressContextMenuOnce) {
      this.suppressContextMenuOnce = false;
      return;
    }

    if ((this.drawingMode === "polygon" || this.drawingMode === "polyline") && this.drawPolygonPoints.length >= 2) {
      e.preventDefault();
      e.stopPropagation();
      if (this.drawingMode === "polyline") this.finishPolylineDrawing();
      else this.finishPolygonDrawing();
      return;
    }

    const vpRect = this.viewportEl.getBoundingClientRect();
    const vx = e.clientX - vpRect.left;
    const vy = e.clientY - vpRect.top;

    const wx = (vx - this.tx) / this.scale;
    const wy = (vy - this.ty) / this.scale;

    const nx = clamp(wx / this.imgW, 0, 1);
    const ny = clamp(wy / this.imgH, 0, 1);

    const bases = this.getBasesNormalized();
    const baseItems: ZMMenuItem[] = bases.map((b) => ({
      label: b.name ?? basename(b.path),
      checked: this.getActiveBasePath() === b.path,
      action: (rowEl) => {
        void this.setActiveBase(b.path)
          .then(() => {
            const submenu = rowEl.parentElement;
            const rows =
              submenu?.querySelectorAll<HTMLDivElement>(".zm-menu__item");
            rows?.forEach((r) => {
              const c = r.querySelector<HTMLElement>(".zm-menu__check");
              if (c) c.textContent = "";
            });
            const chk = rowEl.querySelector<HTMLElement>(".zm-menu__check");
            if (chk) chk.textContent = "✓";
          })
          .catch((err: unknown) => {
            console.error("Set base failed:", err);
            new Notice("Failed to set base image.", 2500);
          });
      },
    }));

    const overlayItems: ZMMenuItem[] = (this.data.overlays ?? []).map((o) => ({
      label: o.name ?? basename(o.path),
      checked: !!o.visible,
      action: (rowEl) => {
        o.visible = !o.visible;
        void this.saveDataSoon();
        void this.updateOverlayVisibility();
        const chk = rowEl.querySelector<HTMLElement>(".zm-menu__check");
        if (chk) chk.textContent = o.visible ? "✓" : "";
      },
    }));

    const meas = this.data.measurement;
    const currentUnit = ((meas?.displayUnit as unknown as string) ?? "km");
    const currentCustomId = meas?.customUnitId;

    const unitItems: ZMMenuItem[] = [
      {
        label: "m",
        checked: currentUnit === "m",
        action: () => {
          this.ensureMeasurement();
          if (this.data?.measurement) {
            this.data.measurement.displayUnit = "m";
            delete this.data.measurement.customUnitId;
            void this.saveDataSoon();
            this.updateMeasureHud();
          }
          this.closeMenu();
        },
      },
      {
        label: "km",
        checked: currentUnit === "km",
        action: () => {
          this.ensureMeasurement();
          if (this.data?.measurement) {
            this.data.measurement.displayUnit = "km";
            delete this.data.measurement.customUnitId;
            void this.saveDataSoon();
            this.updateMeasureHud();
          }
          this.closeMenu();
        },
      },
      {
        label: "mi",
        checked: currentUnit === "mi",
        action: () => {
          this.ensureMeasurement();
          if (this.data?.measurement) {
            this.data.measurement.displayUnit = "mi";
            delete this.data.measurement.customUnitId;
            void this.saveDataSoon();
            this.updateMeasureHud();
          }
          this.closeMenu();
        },
      },
      {
        label: "ft",
        checked: currentUnit === "ft",
        action: () => {
          this.ensureMeasurement();
          if (this.data?.measurement) {
            this.data.measurement.displayUnit = "ft";
            delete this.data.measurement.customUnitId;
            void this.saveDataSoon();
            this.updateMeasureHud();
          }
          this.closeMenu();
        },
      },
    ];

    const customDefs = this.plugin.getActiveCustomUnits();
    if (customDefs.length > 0) {
      unitItems.push({ type: "separator" });

      for (const def of customDefs) {
        const isActive =
          currentUnit === "custom" && currentCustomId === def.id;
        unitItems.push({
          label: def.abbreviation
            ? `${def.name} (${def.abbreviation})`
            : def.name,
          checked: isActive,
          action: () => {
            this.ensureMeasurement();
            if (this.data?.measurement) {
              this.data.measurement.displayUnit = "custom";
              this.data.measurement.customUnitId = def.id;
              void this.saveDataSoon();
              this.updateMeasureHud();
            }
            this.closeMenu();
          },
        });
      }
    }

    const {
      pinsBase,
      pinsGlobal,
      favsBase,
      favsGlobal,
      stickersBase,
      stickersGlobal,
      swapBase,
      swapGlobal,
      pingBase,
      pingGlobal,
    } = this.computeCollectionSets();

    const pinItemFromKey = (key: string): ZMMenuItem | null => {
      const info = this.getIconInfo(key);
      if (!info) return null;
      return {
        label: key || "(pin)",
        iconUrl: info.imgUrl,
		iconRotationDeg: info.rotationDeg,
        action: () => {
          this.placePinAt(key, nx, ny);
          this.closeMenu();
        },
      };
    };
    const pinsBaseMenu = pinsBase
      .map(pinItemFromKey)
      .filter((x): x is ZMMenuItem => !!x);
    const pinsGlobalMenu = pinsGlobal
      .map(pinItemFromKey)
      .filter((x): x is ZMMenuItem => !!x);

    const favItems = (arr: MarkerPreset[]): ZMMenuItem[] =>
      arr.map((p) => {
        const icon: { imgUrl: string; rotationDeg: number } = this.getIconInfo(p.iconKey);
        return {
          label: p.name || "(favorite)",
          iconUrl: icon.imgUrl,
          iconRotationDeg: icon.rotationDeg,
          action: () => {
            this.placePresetAt(p, nx, ny);
            this.closeMenu();
          },
        };
      });

    const favsBaseMenu = favItems(favsBase);
    const favsGlobalMenu = favItems(favsGlobal);

    const stickerItems = (arr: StickerPreset[]): ZMMenuItem[] =>
      arr.map((sp) => ({
        label: sp.name || "(sticker)",
        iconUrl: this.resolveResourceUrl(sp.imagePath),
        action: () => {
          this.placeStickerPresetAt(sp, nx, ny);
          this.closeMenu();
        },
      }));

    const stickersBaseMenu = stickerItems(stickersBase);
    const stickersGlobalMenu = stickerItems(stickersGlobal);
	const allSwapPresets: SwapPinPreset[] = [...swapBase, ...swapGlobal];

    const addHereChildren: ZMMenuItem[] = [
      {
        label: "Default (open editor)",
        action: () => {
          this.addMarkerInteractive(nx, ny);
          this.closeMenu();
        },
      },
    ];
	
    if (favsBaseMenu.length) {
      addHereChildren.push({ type: "separator" });
      addHereChildren.push({ label: "Favorites (base)", children: favsBaseMenu });
    }	
	
    if (pinsBaseMenu.length) {
      addHereChildren.push({ type: "separator" });
      addHereChildren.push({ label: "Pins (base)", children: pinsBaseMenu });
    }
    if (pinsGlobalMenu.length) {
      addHereChildren.push({ label: "Pins (global)", children: pinsGlobalMenu });
    }
    if (favsGlobalMenu.length) {
      addHereChildren.push({ type: "separator" });
      addHereChildren.push({ label: "Favorites (global)", children: favsGlobalMenu });
    }
    if (stickersBaseMenu.length) {
      addHereChildren.push({ type: "separator" });
      addHereChildren.push({
        label: "Stickers (base)",
        children: stickersBaseMenu,
      });
    }
    if (stickersGlobalMenu.length) {
      addHereChildren.push({
        label: "Stickers (global)",
        children: stickersGlobalMenu,
      });
    }

    addHereChildren.push(
      { type: "separator" },
      {
        label: "Add HUD pin here",
        action: () => {
          this.addHudPin(vx, vy);
          this.closeMenu();
        },
      },
    );
	
    addHereChildren.push({
      label: "Add base switch pin here…",
      action: () => {
        if (!this.data) return;
        const bases = this.getBasesNormalized();
        if (!bases.length) {
          new Notice("No base images configured.", 2500);
          return;
        }

        const iconKey = this.plugin.settings.defaultIconKey;
        const initialScaleLike =
          this.plugin.settings.defaultScaleLikeSticker ? true : false;

        this.openSwitchPinModal(
          {
            basePaths: bases,
            initialIconKey: iconKey,
            initialRotate: true,
            initialSwitchBase: undefined,
            initialScaleLikeSticker: initialScaleLike,
            initialHud: false,
          },
          (res) => {
            if (!this.data) return;
            if (res.action !== "save" || !res.value) return;

            const marker: Marker = {
              id: generateId("swb"),
              type: "switch",
              layer: this.getPreferredNewMarkerLayerId(),
              x: nx,
              y: ny,
              iconKey: res.value.iconKey,
              switchRotate: res.value.rotate ? true : undefined,
              switchBase: res.value.rotate ? undefined : (res.value.switchBase ?? undefined),
              scaleLikeSticker: res.value.scaleLikeSticker ? true : undefined,
            };

            if (res.value.placeAsHudPin) {
              marker.anchorSpace = "viewport";
              marker.hudX = vx;
              marker.hudY = vy;
              this.classifyHudMetaFromCurrentPosition(marker, this.viewportEl.getBoundingClientRect());
            }

            this.data.markers.push(marker);
            void this.saveDataSoon();
            this.renderMarkersOnly();
            new Notice("Switch pin added.", 900);
          },
        );

        this.closeMenu();
      },
    });
	
    // ---- Ping pins ----
    {
      const allPings: PingPreset[] = [...pingBase, ...pingGlobal].filter(Boolean);

      const buildDistanceItems = (pp: PingPreset): ZMMenuItem[] => {
        const vals = Array.isArray(pp.distances) && pp.distances.length ? pp.distances : [2, 5, 10];
        return vals
          .filter((n) => Number.isFinite(n) && n > 0)
          .map((n) => ({
            label: this.formatPingDistanceLabel(n, pp.unit, pp.customUnitId),
            action: () => {
              void this.addPingPinAt(pp, nx, ny, n);
              this.closeMenu();
            },
          }));
      };

      if (allPings.length === 1) {
        addHereChildren.push(
          { type: "separator" },
          {
            label: `Party pin (${allPings[0].name || "Party"})`,
            children: buildDistanceItems(allPings[0]),
          },
        );
      } else if (allPings.length > 1) {
        addHereChildren.push(
          { type: "separator" },
          {
            label: "Party pin",
            children: allPings.map((pp) => ({
              label: pp.name || "(party)",
              children: buildDistanceItems(pp),
            })),
          },
        );
      }
    }
	
	if (allSwapPresets.length === 1) {
      const sp = allSwapPresets[0];
      addHereChildren.push({
        label: "Add swap pin here",
        action: () => {
          this.addSwapPinHere(sp, vx, vy);
          this.closeMenu();
        },
      });
    } else if (allSwapPresets.length > 1) {
      addHereChildren.push({
        label: "Add swap pin here",
        children: allSwapPresets.map((sp) => ({
          label: sp.name || "(swap pin)",
          action: () => {
            this.addSwapPinHere(sp, vx, vy);
            this.closeMenu();
          },
        })),
      });
    }
	
    addHereChildren.push(
      { type: "separator" },
      {
        label: "Add dice pin here…",
        action: () => {
          this.addDicePinHere(nx, ny, vx, vy);
          this.closeMenu();
        },
      },
    );

    const items: ZMMenuItem[] = [
      { label: "Add marker here", children: addHereChildren },
    ];
	
    if (favsBaseMenu.length) {
      items.push({ label: "Favorites (base)", children: favsBaseMenu });
    }

    const layerChildren: ZMMenuItem[] = this.data.layers.map((layer) => {
      const state = this.getLayerState(layer);
      const { mark, color } = this.triStateIndicator(state);
      const label = layer.name + (layer.boundBase ? " (bound)" : "");
      return {
        label,
        mark,
        markColor: color,
        action: (rowEl) => {
          const next = this.advanceLayerState(layer);
          void this.saveDataSoon();
          this.renderMarkersOnly();
          const chk = rowEl.querySelector<HTMLElement>(".zm-menu__check");
          if (chk) {
            const m = this.triStateIndicator(next);
            chk.textContent = this.symbolForMark(m.mark);
            if (m.color) chk.style.color = m.color;
            else chk.removeAttribute("style");
          }
        },
      };
    });

    const labelForBase = (p: string) => {
      const b = bases.find((bb) => bb.path === p);
      return b ? b.name ?? basename(b.path) : basename(p);
    };

    const bindLayerSubmenus: ZMMenuItem[] = this.data.layers.map((l) => {
      const suffix = l.boundBase
        ? ` → ${labelForBase(l.boundBase)}`
        : " → None";
      return {
        label: `Bind "${l.name}" to base${suffix}`,
        children: [
          {
            label: "None",
            checked: !l.boundBase,
            action: (rowEl) => {
              l.boundBase = undefined;
              void this.saveDataSoon();
              const menu = rowEl.parentElement;
              menu
                ?.querySelectorAll<HTMLElement>(".zm-menu__check")
                .forEach((c) => (c.textContent = ""));
              const chk = rowEl.querySelector<HTMLElement>(".zm-menu__check");
              if (chk) chk.textContent = "✓";
            },
          },
          { type: "separator" },
          ...bases.map<ZMMenuItem>((b) => ({
            label: b.name ?? basename(b.path),
            checked: l.boundBase === b.path,
            action: (rowEl) => {
              l.boundBase = b.path;
              void this.applyBoundBaseVisibility();
              void this.saveDataSoon();
              const menu = rowEl.parentElement;
              menu
                ?.querySelectorAll<HTMLElement>(".zm-menu__check")
                .forEach((c) => (c.textContent = ""));
              const chk = rowEl.querySelector<HTMLElement>(".zm-menu__check");
              if (chk) chk.textContent = "✓";
            },
          })),
        ],
      };
    });

    const drawLayers = this.data.drawLayers ?? [];
    const drawLayerChildren: ZMMenuItem[] = drawLayers.map((dl) => ({
      label: dl.name,
      checked: !!dl.visible,
      action: (rowEl) => {
        dl.visible = !dl.visible;
        void this.saveDataSoon();
        this.renderDrawings();
        const chk = rowEl.querySelector<HTMLElement>(".zm-menu__check");
        if (chk) chk.textContent = dl.visible ? "✓" : "";
      },
    }));
	
     const bindDrawLayerSubmenus: ZMMenuItem[] = drawLayers.map((dl) => {
      const suffix = dl.boundBase ? ` → ${labelForBase(dl.boundBase)}` : " → None";
      return {
        label: `Bind "${dl.name}" to base${suffix}`,
        children: [
          {
            label: "None",
            checked: !dl.boundBase,
            action: (rowEl) => {
              dl.boundBase = undefined;
              void this.saveDataSoon();
              const menu = rowEl.parentElement;
              menu?.querySelectorAll<HTMLElement>(".zm-menu__check").forEach((c) => (c.textContent = ""));
              rowEl.querySelector<HTMLElement>(".zm-menu__check")!.textContent = "✓";
            },
          },
          { type: "separator" },
          ...bases.map<ZMMenuItem>((b) => ({
            label: b.name ?? basename(b.path),
            checked: dl.boundBase === b.path,
            action: (rowEl) => {
              dl.boundBase = b.path;
              void this.applyBoundBaseVisibility();
              void this.saveDataSoon();
              const menu = rowEl.parentElement;
              menu?.querySelectorAll<HTMLElement>(".zm-menu__check").forEach((c) => (c.textContent = ""));
              rowEl.querySelector<HTMLElement>(".zm-menu__check")!.textContent = "✓";
            },
          })),
        ],
      };
    });

    if (this.plugin.settings.enableDrawing) {
      drawLayerChildren.push(
        { type: "separator" },
        { label: "Bind draw layer to base", children: bindDrawLayerSubmenus },
        { type: "separator" },
        {
          label: "Rename draw layer…",
          children: drawLayers.map((dl) => ({
            label: dl.name,
            action: () => {
              const baseName = dl.name || "Draw layer";
              new NamePromptModal(
                this.app,
                "Rename draw layer",
                baseName,
                (value) => {
                  const name = (value || baseName).trim() || baseName;
                  dl.name = name;
                  void this.saveDataSoon();
                },
              ).open();
            },
          })),
        },
        {
		  label: "Delete draw layer…",
		  children: drawLayers.map((dl) => ({
			label: dl.name,
			action: () => {
			  if (!this.data) return;

			  const count = (this.data.drawings ?? []).filter(
				(d) => d.layerId === dl.id,
			  ).length;

			  const msg =
				count > 0
				  ? `Delete draw layer "${dl.name}" and ${count} drawings on it?`
				  : `Delete draw layer "${dl.name}"?`;

			  new ConfirmModal(this.app, "Delete draw layer", msg, () => {
				if (!this.data) return;

				this.data.drawLayers = (this.data.drawLayers ?? []).filter(
				  (l) => l.id !== dl.id,
				);
				this.data.drawings = (this.data.drawings ?? []).filter(
				  (d) => d.layerId !== dl.id,
				);

				void this.saveDataSoon();
				this.renderDrawings();
			  }).open();
			},
		  })),
		},
        {
          label: "Add draw layer…",
          action: () => {
            if (!this.data) return;
            const baseName = "Draw layer";
            new NamePromptModal(
              this.app,
              "Name for draw layer",
              baseName,
              (value) => {
                if (!this.data) return;
                const name = (value || baseName).trim() || baseName;
                const id = generateId("draw");
                this.data.drawLayers ??= [];
                this.data.drawLayers.push({
                  id,
                  name,
                  visible: true,
                  locked: false,
                });
                void this.saveDataSoon();
                this.renderDrawings();
              },
            ).open();
          },
        },
      );
    }

    const imageLayersChildren: ZMMenuItem[] = [
	  { label: "Base", children: baseItems },
	  { label: "Overlays", children: overlayItems },
	];
	
    // Only offer raster export if the active base is an SVG
    if (this.isActiveBaseSvg()) {
      imageLayersChildren.push(
        { type: "separator" },
        {
          label: "Export active SVG base as WebP…",
          action: () => {
            this.closeMenu();
            this.openSvgExportModal();
          },
        },
      );
    }	

	imageLayersChildren.push(
	  { type: "separator" },
	  {
		label: "Delete base…",
		children: bases.map<ZMMenuItem>((b) => ({
		  label: b.name ?? basename(b.path),
		  action: () => {
			this.closeMenu();
			this.confirmDeleteBase(b.path);
		  },
		})),
	  },
	  {
		label: "Delete overlay…",
		children:
		  (this.data.overlays ?? []).length > 0
			? (this.data.overlays ?? []).map<ZMMenuItem>((o) => ({
				label: o.name ?? basename(o.path),
				action: () => {
				  this.closeMenu();
				  this.confirmDeleteOverlay(o.path);
				},
			  }))
			: [
				{
				  label: "(No overlays)",
				  action: () => {
					this.closeMenu();
				  },
				},
			  ],
	  },
	  { type: "separator" },
	  {
		label: "Add layer",
		children: [
		  { label: "Base…", action: () => this.promptAddLayer("base") },
		  { label: "Overlay…", action: () => this.promptAddLayer("overlay") },
		],
	  },
	);
	
	const travelPresets = this.plugin.getActiveTravelTimePresets();
	const selectedTravel = new Set(this.data.measurement?.travelTimePresetIds ?? []);

    const travelTimeItems: ZMMenuItem[] = [];

    const perDayInfo = this.plugin.getActiveTravelPerDayPresets?.();
    const perDayPresets = perDayInfo?.presets ?? [];
    const selectedPerDayId = (this.data.measurement?.travelDayPresetId ?? "").trim();
    const effectiveId = (selectedPerDayId && perDayPresets.some((p) => p.id === selectedPerDayId))
      ? selectedPerDayId
      : (perDayPresets[0]?.id ?? "");
	  
    {
      const enabled = !!this.data.measurement?.travelDaysEnabled;
      travelTimeItems.push({
        label: "Show travel days",
        mark: enabled ? "check" : "x",
        markColor: enabled ? "var(--text-accent)" : "var(--text-muted)",
        action: (rowEl) => {
          this.ensureMeasurement();
          if (!this.data?.measurement) return;

          const next = !this.data.measurement.travelDaysEnabled;
          this.data.measurement.travelDaysEnabled = next;

          void this.saveDataSoon();
          this.updateMeasureHud();

          const chk = rowEl.querySelector<HTMLElement>(".zm-menu__check");
          if (chk) {
            chk.textContent = next ? "✓" : "×";
            chk.style.color = next ? "var(--text-accent)" : "var(--text-muted)";
          }
        },
        checked: false,
      });
    }

    travelTimeItems.push({
      label: "Max travel time",
      children: perDayPresets.length
        ? perDayPresets.map((tpd) => ({
            label: tpd.name || tpd.id,
            checked: effectiveId === tpd.id,
            action: (rowEl) => {
              this.ensureMeasurement();
              if (!this.data?.measurement) return;
              this.data.measurement.travelDayPresetId = tpd.id;
              void this.saveDataSoon();
              this.updateMeasureHud();

              const menu = rowEl.parentElement;
              menu?.querySelectorAll<HTMLElement>(".zm-menu__check").forEach((c) => (c.textContent = ""));
              const chk = rowEl.querySelector<HTMLElement>(".zm-menu__check");
              if (chk) chk.textContent = "✓";
            },
          }))
        : [{ label: "(No max travel time presets configured)", action: () => { new Notice("Configure max travel time presets in settings → travel rules.", 3500)} }],
    });
	
    travelTimeItems.push({ type: "separator" });

    if (travelPresets.length) {
      travelTimeItems.push(
        ...travelPresets.map((p) => ({
          label: p.name || p.id,
          checked: selectedTravel.has(p.id),
          action: (rowEl: HTMLDivElement) => {
            this.ensureMeasurement();
            if (!this.data?.measurement) return;
            const arr = (this.data.measurement.travelTimePresetIds ??= []);
            const i = arr.indexOf(p.id);
            if (i >= 0) arr.splice(i, 1);
            else arr.push(p.id);

            void this.saveDataSoon();
            this.updateMeasureHud();

            const chk = rowEl.querySelector<HTMLElement>(".zm-menu__check");
            if (chk) chk.textContent = i >= 0 ? "" : "✓";
          },
        })),
      );
    } else {
      travelTimeItems.push({
        label: "(No travel presets configured)",
        action: (rowEl: HTMLDivElement) => {
          new Notice("Configure presets in settings → travel rules.", 3000);
        }
      });
    }

    items.push(
      { type: "separator" },
      { label: "Image layers", children: imageLayersChildren },
      {
        label: "Measure",
        children: [
          {
            label: this.measuring ? "Stop measuring" : "Start measuring",
            action: () => {
              this.measuring = !this.measuring;
              if (!this.measuring) {
                this.measurePreview = null;
              }
              this.updateMeasureHud();
              this.renderMeasure();
              this.closeMenu();
            },
          },
          {
            label: "Clear measurement",
            action: () => this.clearMeasure(),
          },
          {
            label: "Remove last point",
            action: () => {
              if (this.measurePts.length > 0) {
                this.measurePts.pop();
				if (this.measureSegTerrainIds.length > 0) this.measureSegTerrainIds.pop();
                this.renderMeasure();
              }
            },
          },
          ...(this.plugin.settings.enableMeasurePro
            ? [
                {
                  label: "Terrains…",
                  action: () => {
                    this.openMeasureTerrainModal();
                    this.closeMenu();
                  },
                } as ZMMenuItem,
              ]
            : []),
          ...(this.plugin.settings.enableDrawing
            ? [
                {
                  label: "Save measurement as polyline…",
                  action: () => {
                    this.saveMeasurementAsPolyline();
                    this.closeMenu();
                  },
                } as ZMMenuItem,
              ]
            : []),
          { type: "separator" },
          { label: "Unit", children: unitItems },
		  { label: "Travel time", children: travelTimeItems },
          { type: "separator" },
          {
            label: this.calibrating ? "Stop calibration" : "Calibrate scale…",
            action: () => {
              if (this.calibrating) {
                this.calibrating = false;
                this.calibPts = [];
                this.calibPreview = null;
                this.renderCalibrate();
              } else {
                this.calibrating = true;
                this.calibPts = [];
                this.calibPreview = null;
                this.renderCalibrate();
                new Notice("Calibration: click two points.", 1500);
              }
              this.closeMenu();
            },
          },
        ],
      },
      {
        label: "Marker layers",
        children: [
          ...layerChildren,
          { type: "separator" },
          { label: "Bind layer to base", children: bindLayerSubmenus },
          { type: "separator" },
          {
            label: "Rename layer…",
            children: this.data.layers.map((l) => ({
              label: l.name,
              action: () => {
                new RenameLayerModal(this.app, l, (newName) => {
                  void this.renameMarkerLayer(l, newName);
                }).open();
              },
            })),
          },
          {
            label: "Delete layer…",
            children: this.data.layers.map((l) => ({
              label: l.name,
              action: () => {
                const others = this.data!.layers.filter((x) => x.id !== l.id);
                if (others.length === 0) {
                  new Notice("Cannot delete the last layer.", 2000);
                  return;
                }
                const hasMarkers = this.data!.markers.some(
                  (m) => m.layer === l.id,
                );
                new DeleteLayerModal(
                  this.app,
                  l,
                  others,
                  hasMarkers,
                  (decision) => {
                    void this.deleteMarkerLayer(l, decision);
                  },
                ).open();
              },
            })),
          },
        ],
      },
    );
	
// --- Text layers (top-level menu) ---
if (this.plugin.settings.enableTextLayers && this.data) {
  this.ensureTextData();

  const stopTextInteractionForLayer = (layerId: string): void => {
    if (this.textMode === "edit" && this.activeTextLayerId === layerId) {
      this.stopTextEdit(false);
    }

    if (this.textMode === "move" && this.activeTextLayerId === layerId) {
      this.finishTextBoxMove(false);
      this.textMode = null;
      this.activeTextLayerId = null;
      this.activeTextBoxId = null;
    }

    if (
      (this.textMode === "draw-lines" || this.textMode === "draw-box") &&
      this.activeTextLayerId === layerId
    ) {
      this.textMode = null;
      this.activeTextLayerId = null;
      this.activeTextBoxId = null;
      this.textLineStart = null;
      this.textLinePreview = null;
      this.renderTextDraft();
    }
  };

  const textLayerItems: ZMMenuItem[] = (this.data.textLayers ?? []).map((tl) => {
    const boxChildren: ZMMenuItem[] = (tl.boxes ?? []).map((box) => {
      const boxLocked = this.isTextBoxLocked(box, tl);
      return {
        label: box.name || "(text box)",
        children: [
          {
            label: "Edit box…",
            action: () => {
              this.closeMenu();
              this.openTextBoxConfigModal(tl, box);
            },
          },
          {
            label: "Move",
            checked:
              this.textMode === "move" &&
              this.activeTextLayerId === tl.id &&
              this.activeTextBoxId === box.id,
            action: (rowEl) => {
              if (boxLocked) {
                new Notice("Text box is locked.", 1500);
                return;
              }

              const isOn =
                this.textMode === "move" &&
                this.activeTextLayerId === tl.id &&
                this.activeTextBoxId === box.id;

              if (isOn) {
                this.finishTextBoxMove(true);
                this.textMode = null;
                this.activeTextLayerId = null;
                this.activeTextBoxId = null;
              } else {
                this.stopTextEdit(true);
                this.finishTextBoxMove(false);
                this.textMode = "move";
                this.activeTextLayerId = tl.id;
                this.activeTextBoxId = box.id;
                new Notice("Move mode: drag the text box to move it. Toggle move again to stop.", 4000);
              }

              this.renderTextDraft();
              this.renderTextLayers();
              const chk = rowEl.querySelector<HTMLElement>(".zm-menu__check");
              if (chk) chk.textContent = isOn ? "" : "✓";
            }
          },
          {
            label: "Delete box",
            action: () => {
              tl.boxes = (tl.boxes ?? []).filter((b) => b.id !== box.id);
              if (
                this.textMode === "edit" &&
                this.activeTextLayerId === tl.id &&
                this.activeTextBoxId === box.id
              ) {
                this.stopTextEdit(false);
              }
              if (
                this.textMode === "move" &&
                this.activeTextLayerId === tl.id &&
                this.activeTextBoxId === box.id
              ) {
                this.finishTextBoxMove(false);
                this.textMode = null;
                this.activeTextLayerId = null;
                this.activeTextBoxId = null;
              }
              void this.saveDataSoon();
              this.renderTextLayers();
              this.closeMenu();
            },
          },
        ],
      };
    });

    return {
      label: tl.name || "(text layer)",
      children: [
        {
          label: "State",
          children: [
            {
              label: "Visible",
              checked: this.isTextLayerVisible(tl),
              action: (rowEl) => {
                tl.visible = !this.isTextLayerVisible(tl);
                if (!tl.visible) stopTextInteractionForLayer(tl.id);
                void this.saveDataSoon();
                this.renderTextLayers();

                const chk = rowEl.querySelector<HTMLElement>(".zm-menu__check");
                if (chk) chk.textContent = tl.visible ? "✓" : "";
              },
            },
            {
              label: "Locked",
              checked: !!tl.locked,
              action: (rowEl) => {
                tl.locked = !tl.locked;
                if (tl.locked) stopTextInteractionForLayer(tl.id);
                void this.saveDataSoon();
                this.renderTextLayers();

                const chk = rowEl.querySelector<HTMLElement>(".zm-menu__check");
                if (chk) chk.textContent = tl.locked ? "✓" : "";
              },
            },
          ],
        },
        {
          label: "Add text box",
          children: [
            {
              label: "Custom",
              action: () => {
                this.startDrawNewTextBox(tl.id, "custom");
                this.closeMenu();
              },
            },
            {
              label: "Auto",
              action: () => {
                this.startDrawNewTextBox(tl.id, "auto");
                this.closeMenu();
              },
            },
          ],
        },
        {
          label: `Bind to base${tl.boundBase ? ` → ${labelForBase(tl.boundBase)}` : " → None"}`,
          children: [
            {
              label: "None",
              checked: !tl.boundBase,
              action: (rowEl) => {
                tl.boundBase = undefined;
                void this.saveDataSoon();
                this.renderTextLayers();

                const menu = rowEl.parentElement;
                menu?.querySelectorAll<HTMLElement>(".zm-menu__check").forEach((c) => {
                  c.textContent = "";
                });
                const chk = rowEl.querySelector<HTMLElement>(".zm-menu__check");
                if (chk) chk.textContent = "✓";
              },
            },
            { type: "separator" as const },
            ...bases.map<ZMMenuItem>((b) => ({
              label: b.name ?? basename(b.path),
              checked: tl.boundBase === b.path,
              action: (rowEl) => {
                tl.boundBase = b.path;
                void this.saveDataSoon();
                this.renderTextLayers();

                const menu = rowEl.parentElement;
                menu?.querySelectorAll<HTMLElement>(".zm-menu__check").forEach((c) => {
                  c.textContent = "";
                });
                const chk = rowEl.querySelector<HTMLElement>(".zm-menu__check");
                if (chk) chk.textContent = "✓";
              },
            })),
          ],
        },
        ...(boxChildren.length
          ? [{ type: "separator" } as ZMMenuItem, ...boxChildren]
          : []),
      ],
    };
  });

  const deleteChildren: ZMMenuItem[] =
    (this.data.textLayers ?? []).length > 0
      ? (this.data.textLayers ?? []).map((tl) => ({
          label: tl.name || "(text layer)",
          action: () => {
            new ConfirmModal(
              this.app,
              "Delete text layer",
              `Delete text layer "${tl.name || tl.id}"? This cannot be undone.`,
              () => {
                if (!this.data) return;
                if (this.textMode === "edit" && this.activeTextLayerId === tl.id) {
                  this.stopTextEdit(false);
                }
                if (this.textMode === "move" && this.activeTextLayerId === tl.id) {
                  this.finishTextBoxMove(false);
                  this.textMode = null;
                  this.activeTextLayerId = null;
                  this.activeTextBoxId = null;
                }
                this.data.textLayers = (this.data.textLayers ?? []).filter((x) => x.id !== tl.id);
                void this.saveDataSoon();
                this.renderTextLayers();
              },
            ).open();
            this.closeMenu();
          },
        }))
      : [{ label: "(No text layers)", action: () => this.closeMenu() }];

  items.push(
    { type: "separator" },
    {
      label: "Text layers",
      children: [
		...textLayerItems,
        { type: "separator" },
        {
          label: "Add text layer…",
          action: () => {
            if (!this.data) return;

            const idx = (this.data.textLayers?.length ?? 0) + 1;
            const defaultName = `Text layer ${idx}`;

            new NamePromptModal(
              this.app,
              "Name for text layer",
              defaultName,
              (value) => {
                if (!this.data) return;
                const name = (value || defaultName).trim() || defaultName;
                this.data.textLayers ??= [];
                this.data.textLayers.push({
                  id: generateId("txt"),
                  name,
                  visible: true,
                  boxes: [],
                });
                void this.saveDataSoon();
                this.renderTextLayers();
              },
            ).open();
            this.closeMenu();
          },
        },
        {
          label: "Delete layer…",
          children: deleteChildren,
        },
      ],
    },
  );
}
	
	if (this.plugin.settings.enableDrawing) {
      items.push(
        { type: "separator" },
        {
          label: "Draw",
          children: [
            {
              label: "Draw layers",
              children: drawLayerChildren,
            },
            { type: "separator" },
            {
              label: "Rectangle",
              action: () => {
                this.startDraw("rect");
                this.closeMenu();
              },
            },
            {
              label: "Circle",
              action: () => {
                this.startDraw("circle");
                this.closeMenu();
              },
            },
            {
              label: "Polyline",
              action: () => {
                this.startDraw("polyline");
                this.closeMenu();
              },
            },
            {
			  label: "Polygon",
			  action: () => {
				this.startDraw("polygon");
				this.closeMenu();
			  },
			},
          ],
        },
      );
    }

    items.push(
      { type: "separator" },
      {
        label: "Options",
        children: [
          {
            label: "Pin sizes for this map…",
            action: () => {
              this.openPinSizeEditor();
              this.closeMenu();
            },
          },
          {
            label: "Allow panning beyond image",
            checked: !(this.data?.panClamp ?? true),
            action: async (rowEl) => {
              if (!this.data) return;
              const current = this.data.panClamp ?? true;
              this.data.panClamp = !current;
              await this.saveDataSoon();
              this.applyTransform(this.scale, this.tx, this.ty);

              const chk = rowEl.querySelector<HTMLElement>(".zm-menu__check");
              if (chk) chk.textContent = this.data.panClamp ? "" : "✓";
            },
          },
		  {
			label: "Edit view…",
			action: () => {
			  this.closeMenu();
			  this.openViewEditorFromMap();
			},
		  },
		  {
			label: "Set default view here",
			action: () => {
			  void this.saveDefaultViewToYaml();
			  this.closeMenu();
			},
		  },
          {
            label: "Delete default view",
            action: () => {
              void this.deleteDefaultViewFromYaml();
              this.closeMenu();
            },
          },
          ...(this.secondScreenFeatureEnabled()
            ? [
                {
                  label: "Player screen layers…",
                  action: () => {
                    this.closeMenu();
                    this.openSecondScreenLayersModal();
                  },
                } as ZMMenuItem,
              ]
            : []),
        ],
      },
    );
	
    if (this.secondScreenFeatureEnabled()) {
      items.push(
        { type: "separator" },
        {
          label: "Display on screen",
          action: () => {
            this.closeMenu();
            void this.sendToSecondScreen();
          },
        },
      );
    }

    if (!this.cfg.responsive) {
      items.push(
        { type: "separator" },
        { label: "Zoom +", action: () => this.zoomAt(vx, vy, 1.2) },
        { label: "Zoom −", action: () => this.zoomAt(vx, vy, 1 / 1.2) },
        { label: "Fit to window", action: () => this.fitToView() },
        {
          label: "Reset view",
          action: () =>
            this.applyTransform(
              1,
              (this.vw - this.imgW) / 2,
              (this.vh - this.imgH) / 2,
            ),
        },
      );
    }
	
    // ---- Distance info line (non-interactive) ----
    // Only show it if there is an actual measurement (>= 2 points incl. preview).
    {
      const ptsCount =
        this.measurePts.length +
        (this.measuring && this.measurePreview ? 1 : 0);

      if (ptsCount >= 2) {
        const unit = this.data?.measurement?.displayUnit ?? "auto-metric";
        const px = this.computeDistancePixels();
        const meters = this.computeDistanceMeters();

        const distLabel = (() => {
          if (unit === "custom") {
            if (px == null) return "Distance: (no distance)";
            return `Distance: ${this.formatCustomDistanceFromPixels(px)}`;
          }
          if (meters == null) return "Distance: (no scale)";
          return `Distance: ${this.formatDistance(meters)}`;
        })();

        items.push({ type: "separator" }, { label: distLabel });
      }
    }

    this.openMenu = new ZMMenu(this.el.ownerDocument);
    this.openMenu.open(e.clientX, e.clientY, items);

    const doc = this.el.ownerDocument;

    const outside = (ev: Event) => {
      if (!this.openMenu) return;
      const t = ev.target;
      if (t instanceof Node && this.openMenu.contains(t)) return;
      this.closeMenu();
    };

    const keyClose = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") this.closeMenu();
    };

    const rightClickClose = () => this.closeMenu();

    doc.addEventListener("pointerdown", outside, { capture: true });
    doc.addEventListener("contextmenu", rightClickClose, { capture: true });
    doc.addEventListener("keydown", keyClose, { capture: true });

    this.register(() => {
      doc.removeEventListener("pointerdown", outside, true);
      doc.removeEventListener("contextmenu", rightClickClose, true);
      doc.removeEventListener("keydown", keyClose, true);
    });
  }
  
  private forwardContextMenuPastTextHitbox(ev: MouseEvent): void {
    const doc = this.el.ownerDocument;
    const stack = typeof doc.elementsFromPoint === "function"
      ? doc.elementsFromPoint(ev.clientX, ev.clientY)
      : [];

    for (const el of stack) {
      // Ignore text hitboxes themselves
      if (el.closest(".zm-text-hitbox")) continue;

      // Drawings first
      const drawEl = el.closest(".zm-draw__shape");
      if (drawEl instanceof SVGElement) {
        const id = drawEl.dataset.id ?? drawEl.getAttribute("data-id") ?? "";
        if (id) {
          const drawing = this.getDrawingById(id);
          if (drawing) {
            this.onDrawingContextMenu(ev, drawing);
            return;
          }
        }
      }

      // Then markers
      const markerEl = el.closest(".zm-marker");
      if (markerEl instanceof HTMLElement) {
        markerEl.dispatchEvent(
          new MouseEvent("contextmenu", {
            bubbles: true,
            cancelable: true,
            clientX: ev.clientX,
            clientY: ev.clientY,
            button: 2,
            buttons: 2,
            ctrlKey: ev.ctrlKey,
            shiftKey: ev.shiftKey,
            altKey: ev.altKey,
            metaKey: ev.metaKey,
          }),
        );
        return;
      }

      // Otherwise, if it's still inside the viewport, open the normal map menu
      if (el === this.viewportEl || (el instanceof Node && this.viewportEl.contains(el))) {
        this.onContextMenuViewport(ev);
        return;
      }
    }

    this.onContextMenuViewport(ev);
  }

  private closeMenu(): void {
    if (this.openMenu) {
      this.openMenu.destroy();
      this.openMenu = null;
    }
  }
  
  private isActiveBaseSvg(): boolean {
    const p = this.getActiveBasePath();
    return typeof p === "string" && p.toLowerCase().endsWith(".svg");
  }

  private async getSvgIntrinsicSize(svgPath: string): Promise<{ w: number; h: number } | null> {
    const af = this.app.vault.getAbstractFileByPath(svgPath);
    if (!(af instanceof TFile)) return null;

    try {
      const raw = await this.app.vault.read(af);
      const doc = new DOMParser().parseFromString(raw, "image/svg+xml");
      const el = doc.querySelector("svg");
      if (!el) return null;

      const wAttr = el.getAttribute("width") ?? "";
      const hAttr = el.getAttribute("height") ?? "";
      const vbAttr = el.getAttribute("viewBox") ?? "";

      const parseLen = (s: string) => {
        const m = /^([0-9.+-eE]+)\s*(px)?\s*$/.exec(s.trim());
        if (!m) return Number.NaN;
        return Number(m[1]);
      };

      const w = parseLen(wAttr);
      const h = parseLen(hAttr);
      if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
        return { w, h };
      }

      // viewBox: minX minY width height
      const vb = vbAttr.trim().split(/[\s,]+/).map((x) => Number(x));
      if (vb.length === 4 && vb.every((n) => Number.isFinite(n))) {
        const vw = vb[2];
        const vh = vb[3];
        if (vw > 0 && vh > 0) return { w: vw, h: vh };
      }
    } catch {
      // ignore
    }

    return null;
  }

  private async exportActiveSvgBaseToWebp(longEdge: number, quality: number, outPath: string): Promise<string> {
    const svgPath = this.getActiveBasePath();
    if (!svgPath.toLowerCase().endsWith(".svg")) {
      throw new Error("Active base is not an SVG.");
    }

    const f = this.resolveTFile(svgPath, this.cfg.sourcePath);
    if (!f) throw new Error(`SVG not found: ${svgPath}`);

    const url = this.app.vault.getResourcePath(f);

    const img = new Image();
    img.decoding = "async";
    img.src = url;
    try { await img.decode(); } catch { /* ignore */ }

    let w0 = img.naturalWidth || 0;
    let h0 = img.naturalHeight || 0;

    if (w0 <= 0 || h0 <= 0) {
      const intrinsic = await this.getSvgIntrinsicSize(svgPath);
      if (!intrinsic) {
        throw new Error("SVG has no intrinsic size (missing width/height and viewBox).");
      }
      w0 = intrinsic.w;
      h0 = intrinsic.h;
    }

    const scale = longEdge / Math.max(w0, h0);
    const w = Math.max(1, Math.round(w0 * scale));
    const h = Math.max(1, Math.round(h0 * scale));

    // Safety guard (avoid gigantic allocations).
    // 12k long edge is expected; this prevents accidental extremes.
    const maxSide = 16384;
    if (w > maxSide || h > maxSide) {
      throw new Error(`Target size too large (${w}×${h}). Try 8k.`);
    }

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No canvas context.");

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    const q = Math.min(1, Math.max(0.1, quality));
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
        "image/webp",
        q,
      );
    });

    // Ensure output folder exists
    const dir = outPath.split("/").slice(0, -1).join("/");
    if (dir && !this.app.vault.getAbstractFileByPath(dir)) {
      await this.app.vault.createFolder(dir);
    }

    // If exists, add suffix
    let finalPath = normalizePath(outPath);
    const lower = finalPath.toLowerCase();
    const base = lower.endsWith(".webp") ? finalPath.slice(0, -5) : finalPath;
    let i = 1;
    while (this.app.vault.getAbstractFileByPath(finalPath)) {
      finalPath = normalizePath(`${base}-${i}.webp`);
      i++;
    }

    // Desktop-only adapter API
    //// @ts-expect-error writeBinary exists on desktop adapters
    await this.app.vault.adapter.writeBinary(finalPath, await blob.arrayBuffer());

    return finalPath;
  }

  private openSvgExportModal(): void {
    if (!this.data) return;
    const svgPath = this.getActiveBasePath();
    if (!svgPath.toLowerCase().endsWith(".svg")) return;

    new SvgRasterExportModal(
      this.app,
      {
        svgPath,
        sourcePath: this.cfg.sourcePath,
        defaultLongEdge: 8192,
        defaultQuality: 0.92,
      },
      (res) => { void this.handleSvgExportResult(res); },
    ).open();
  }
  
  private async handleSvgExportResult(res: { action: "export" | "cancel"; result?: import("./svgRasterExportModal").SvgRasterExportResult }): Promise<void> {
    if (res.action !== "export" || !res.result) return;

    try {
      new Notice("Exporting SVG… (this may take a moment)", 4000);

      const out = await this.exportActiveSvgBaseToWebp(
        res.result.longEdge,
        res.result.quality,
        res.result.outPath,
      );

      // Add as new base + activate
      await this.addBaseByPath(out, res.result.baseName);
      await this.setActiveBase(out);

      // Optional: move/rename markers.json to match the exported base
      if (res.result.moveMarkersJson) {
        if (this.cfg.storageMode !== "json") {
          new Notice("Cannot move markers.json when storage mode is 'note'.", 6000);
        } else {
          // Ensure the current marker data is saved (setActiveBase triggers saveDataSoon internally)
          await this.saveDataSoon();

          const newMarkersPath = await this.moveCurrentMarkersFileToBase(out);

          // Switch runtime store to the new markers path
          this.cfg.markersPath = newMarkersPath;
          this.store = new MarkerStore(this.app, this.cfg.sourcePath, newMarkersPath);

          const ok = await this.upsertYamlMarkersPath(newMarkersPath);
          if (!ok) {
            new Notice("Exported and moved markers.json, but YAML could not be updated.", 6000);
          } else {
            new Notice(
              "Markers.json moved to the exported base. Important: other maps using the old markers.json must be updated manually.",
              9000,
            );
          }
        }
      }

      new Notice(`Exported: ${out}`, 3000);
    } catch (e) {
      console.error(e);
      new Notice(`SVG export failed: ${e instanceof Error ? e.message : String(e)}`, 6000);
    }
  }

  private triStateIndicator(state: LayerTriState): { mark: "check" | "x" | "minus"; color?: string } {
    if (state === "visible") return { mark: "check" };
    if (state === "locked") return { mark: "x", color: "var(--text-error, #d23c3c)" };
    return { mark: "minus", color: "var(--text-muted)" };
  }

  private symbolForMark(mark: "check" | "x" | "minus"): string {
    switch (mark) {
      case "x": return "×";
      case "minus": return "–";
      default: return "✓";
    }
  }

  private applyTransform(scale: number, tx: number, ty: number, render = true): void {
    const prevScale = this.scale;

    const s = clamp(scale, this.cfg.minZoom, this.cfg.maxZoom);
    const scaledW = this.imgW * s;
    const scaledH = this.imgH * s;

    const clampPan = this.data?.panClamp ?? true;

    if (clampPan) {
      const minTx = this.vw - scaledW;
      const maxTx = 0;
      const minTy = this.vh - scaledH;
      const maxTy = 0;

      if (scaledW <= this.vw) {
        tx = (this.vw - scaledW) / 2;
      } else {
        tx = clamp(tx, minTx, maxTx);
      }

      if (scaledH <= this.vh) {
        ty = (this.vh - scaledH) / 2;
      } else {
        ty = clamp(ty, minTy, maxTy);
      }
    }

    const txr = Math.round(tx);
    const tyr = Math.round(ty);

    this.scale = s;
    this.tx = txr;
    this.ty = tyr;

	this.worldEl.style.transform =
	  `translate3d(${this.tx}px, ${this.ty}px, 0) scale3d(${this.scale}, ${this.scale}, 1)`;

    if (render) {
      if (prevScale !== s) {
        this.showZoomHud();
        this.updateMarkerInvScaleOnly();
        this.updateMarkerZoomVisibilityOnly();
		this.renderDrawingEditHandles();
        // If SVG base: kick off async raster upgrade after zoom changes.
        // Keep current bitmap visible; swap when ready.
        void this.maybeUpgradeSvgBaseForCurrentZoom();
      }
      this.renderMeasure();
      this.renderCalibrate();
      if (this.isCanvas()) this.renderCanvas();
	  this.renderDrawingEditHandles();
    }
  }

  private panBy(dx: number, dy: number): void {
    this.applyTransform(this.scale, this.tx + dx, this.ty + dy);
  }

  private zoomAt(cx: number, cy: number, factor: number): void {
    const sOld = this.scale;
    const sNew = clamp(sOld * factor, this.cfg.minZoom, this.cfg.maxZoom);
    const wx = (cx - this.tx) / sOld;
    const wy = (cy - this.ty) / sOld;
    const txNew = cx - wx * sNew;
    const tyNew = cy - wy * sNew;
    this.applyTransform(sNew, txNew, tyNew);
  }

  private fitToView(): void {
    const r = this.viewportEl.getBoundingClientRect();
    this.vw = r.width;
    this.vh = r.height;
    if (this.vw < 2 || this.vh < 2) {
      return;
    }

    if (!this.imgW || !this.imgH) return;
    const s = Math.min(this.vw / this.imgW, this.vh / this.imgH);
    const scale = clamp(s, this.cfg.minZoom, this.cfg.maxZoom);
    const tx = (this.vw - this.imgW * scale) / 2;
    const ty = (this.vh - this.imgH * scale) / 2;
    this.applyTransform(scale, tx, ty);
    this.initialViewApplied = true;
    this.captureViewIfVisible();
  }

  private updateMarkerInvScaleOnly(): void {
    const invScale = this.cfg.responsive ? 1 : (1 / this.scale);

    const updateContainer = (root: HTMLElement | null) => {
      if (!root) return;
      const invs = root.querySelectorAll<HTMLDivElement>(".zm-marker-inv");
      invs.forEach((el) => {
        el.style.transform = `scale(${invScale})`;
      });
    };

    updateContainer(this.markersEl);
    updateContainer(this.hudMarkersEl);
  }

 private updateMarkerZoomVisibilityOnly(): void {
    const s = this.scale;

    const updateContainer = (root: HTMLElement | null) => {
      if (!root) return;
      const nodes = root.querySelectorAll<HTMLDivElement>(".zm-marker");
      nodes.forEach((el) => {
        const minStr = el.dataset.minz;
        const maxStr = el.dataset.maxz;
        const hasMin = typeof minStr === "string" && minStr.length > 0;
        const hasMax = typeof maxStr === "string" && maxStr.length > 0;
        const min = hasMin ? Number.parseFloat(minStr) : undefined;
        const max = hasMax ? Number.parseFloat(maxStr) : undefined;
        const visible =
          (!hasMin || (Number.isFinite(min!) && s >= min!)) &&
          (!hasMax || (Number.isFinite(max!) && s <= max!));
        if (visible) el.classList.remove("zm-hidden");
        else el.classList.add("zm-hidden");
      });
    };

    updateContainer(this.markersEl);
    updateContainer(this.hudMarkersEl);
  }

  private getBasesNormalized(): BaseImage[] {
    const raw = this.data?.bases ?? [];
    const out: BaseImage[] = [];
    for (const it of raw) {
      if (typeof it === "string") out.push({ path: it });
      else if (it && typeof it === "object") {
        const obj = it as Partial<BaseImage>;
        if (typeof obj.path === "string") out.push({ path: obj.path, name: obj.name });
      }
    }
    if (out.length === 0 && this.data?.image) out.push({ path: this.data.image });
    return out;
  }

  private addMarkerInteractive(nx: number, ny: number): void {
    if (!this.data) return;
    const layerId = this.getPreferredNewMarkerLayerId();
    const iconKey = this.plugin.settings.defaultIconKey;
    const defaultLink = this.getIconDefaultLink(iconKey);

    const draft: Marker = {
      id: generateId("marker"),
      x: nx,
      y: ny,
      layer: layerId,
      link: defaultLink ?? "",
      iconKey,
      tooltip: "",
      scaleLikeSticker: this.plugin.settings.defaultScaleLikeSticker ? true : undefined,
    };

    const modal = new MarkerEditorModal(this.app, this.plugin, this.data, draft, (res) => {
      if (res.action === "save" && res.marker && this.data) {
        this.data.markers.push(res.marker);
        void this.saveDataSoon();
        new Notice("Marker added.", 900);
        this.renderMarkersOnly();
		this.schedulePingUpdate();
      }
    });
    modal.open();
  }

  private placePinAt(iconKey: string, nx: number, ny: number): void {
    if (!this.data) return;
    const layerId = this.getPreferredNewMarkerLayerId();

    const defaultLink = this.getIconDefaultLink(iconKey);

    const draft: Marker = {
      id: generateId("marker"),
      x: nx,
      y: ny,
      layer: layerId,
      link: defaultLink ?? "",
      iconKey,
      tooltip: "",
    };

    const openEditor = !!this.plugin.settings.pinPlaceOpensEditor;
    if (openEditor) {
      const modal = new MarkerEditorModal(this.app, this.plugin, this.data, draft, (res) => {
        if (res.action === "save" && res.marker && this.data) {
          this.data.markers.push(res.marker);
          void this.saveDataSoon();
          this.renderMarkersOnly();
          new Notice("Marker added.", 900);
        }
      });
      modal.open();
    } else {
      this.data.markers.push(draft);
      void this.saveDataSoon();
      this.renderMarkersOnly();
      new Notice("Marker added.", 900);
	  this.schedulePingUpdate();
    }
  }
  
  private addHudPin(hx: number, hy: number): void {
    if (!this.data) return;

    const layerId = this.getPreferredNewMarkerLayerId();

    const vpRect = this.viewportEl.getBoundingClientRect();

    const iconKey = this.plugin.settings.defaultIconKey;
    const defaultLink = this.getIconDefaultLink(iconKey);

    const draft: Marker = {
      id: generateId("marker"),
      x: 0,
      y: 0,
      layer: layerId,
      link: defaultLink ?? "",
      iconKey,
      tooltip: "",
      anchorSpace: "viewport",
    };

    draft.hudX = hx;
    draft.hudY = hy;
    this.classifyHudMetaFromCurrentPosition(draft, vpRect);

    const openEditor = !!this.plugin.settings.pinPlaceOpensEditor;
    if (openEditor) {
      const modal = new MarkerEditorModal(
        this.app,
        this.plugin,
        this.data,
        draft,
        (res) => {
          if (res.action === "save" && res.marker && this.data) {
            this.data.markers.push(res.marker);
            void this.saveDataSoon();
            this.renderMarkersOnly();
            new Notice("Hud pin added.", 900);
          }
        },
      );
      modal.open();
    } else {
      this.data.markers.push(draft);
      void this.saveDataSoon();
      this.renderMarkersOnly();
      new Notice("Hud pin added.", 900);
    }
  }

  private placePresetAt(p: MarkerPreset, nx: number, ny: number, overrideLayerId?: string): void {
    if (!this.data) return;

    let layerId = this.data.layers[0].id;

    if (overrideLayerId) {
      layerId = overrideLayerId;
    } else if (p.layerName) {
      const found = this.data.layers.find((l) => l.name === p.layerName);
      if (found) layerId = found.id;
      else {
        const id = generateId("layer");
        this.data.layers.push({ id, name: p.layerName, visible: true, locked: false });
        layerId = id;
      }
    } else {
      layerId = this.getPreferredNewMarkerLayerId();
    }

    const draft: Marker = {
      id: generateId("marker"),
      x: nx,
      y: ny,
      layer: layerId,
      link: p.linkTemplate ?? "",
      iconKey: p.iconKey ?? this.plugin.settings.defaultIconKey,
      tooltip: p.tooltip ?? "",
      scaleLikeSticker: this.plugin.settings.defaultScaleLikeSticker ? true : undefined,
    };

    if (p.openEditor) {
      const modal = new MarkerEditorModal(this.app, this.plugin, this.data, draft, (res) => {
        if (res.action === "save" && res.marker && this.data) {
          this.data.markers.push(res.marker);
          void this.saveDataSoon();
          this.renderMarkersOnly();
          new Notice("Marker added (favorite).", 900);
        }
      });
      modal.open();
    } else {
      this.data.markers.push(draft);
      void this.saveDataSoon();
      this.renderMarkersOnly();
      new Notice("Marker added (favorite).", 900);
	  this.schedulePingUpdate();
    }
  }

  private placeStickerPresetAt(p: StickerPreset, nx: number, ny: number): void {
    if (!this.data) return;
    let layerId = this.getPreferredNewMarkerLayerId();
    if (p.layerName) {
      const found = this.data.layers.find((l) => l.name === p.layerName);
      if (found) layerId = found.id;
      else {
        const id = generateId("layer");
        this.data.layers.push({ id, name: p.layerName, visible: true, locked: false });
        layerId = id;
      }
    }

    const draft: Marker = {
      id: generateId("marker"),
      type: "sticker",
      x: nx,
      y: ny,
      layer: layerId,
      stickerPath: p.imagePath,
      stickerSize: Math.max(1, Math.round(p.size ?? 64)),
    };

    if (p.openEditor) {
      const modal = new MarkerEditorModal(this.app, this.plugin, this.data, draft, (res) => {
        if (res.action === "save" && res.marker && this.data) {
          this.data.markers.push(res.marker);
          void this.saveDataSoon();
          this.renderMarkersOnly();
          new Notice("Sticker added.", 900);
        }
      });
      modal.open();
    } else {
      this.data.markers.push(draft);
      void this.saveDataSoon();
      this.renderMarkersOnly();
      new Notice("Sticker added.", 900);
	  this.schedulePingUpdate();
    }
  }

  private deleteMarker(m: Marker): void {
    if (!this.data) return;
	void this.deletePingNoteIfOwned(m);
    this.data.markers = this.data.markers.filter((mm) => mm.id !== m.id);
    void this.saveDataSoon();
    this.renderMarkersOnly();
    new Notice("Marker deleted.", 900);
	this.schedulePingUpdate();
  }
  
  // ===== Ping pins =====
  private sanitizeFileName(s: string): string {
    return (s ?? "")
      .replace(/[\\/:*?"<>|]/g, "-")
      .replace(/\s+/g, " ")
      .trim();
  }

  private findCustomUnitDef(id: string): CustomUnitDef | undefined {
    const packs = this.plugin.settings.travelRulesPacks ?? [];
    for (const p of packs) {
      const found = (p.customUnits ?? []).find((u) => u.id === id);
      if (found) return found;
    }
    return undefined;
  }

  private pingUnitLabel(unit: PingDistanceUnit, customUnitId?: string): string {
    if (unit !== "custom") return unit;
    if (!customUnitId) return "u";
    const def = this.findCustomUnitDef(customUnitId);
    return (def?.abbreviation || def?.name || "u").trim() || "u";
  }

  private formatPingDistanceLabel(value: number, unit: PingDistanceUnit, customUnitId?: string): string {
    return `${value} ${this.pingUnitLabel(unit, customUnitId)}`;
  }

  private getEffectivePxPerCustomUnit(customUnitId: string): number | undefined {
    const direct = this.getCustomPxPerUnit(customUnitId);
    if (direct) return direct;

    const def = this.findCustomUnitDef(customUnitId);
    const mpp = this.getMetersPerPixel();
    if (!def || !mpp) return undefined;
    if (!Number.isFinite(def.metersPerUnit) || def.metersPerUnit <= 0) return undefined;

    return def.metersPerUnit / mpp;
  }

  private pingToPixels(value: number, unit: PingDistanceUnit, customUnitId?: string): number | null {
    if (!Number.isFinite(value) || value <= 0) return null;

    if (unit === "custom") {
      if (!customUnitId) return null;
      const pxPerUnit = this.getEffectivePxPerCustomUnit(customUnitId);
      if (!pxPerUnit) return null;
      return value * pxPerUnit;
    }

    const mpp = this.getMetersPerPixel();
    if (!mpp) return null;

    const meters =
      unit === "km" ? value * 1000 :
      unit === "mi" ? value * 1609.344 :
      unit === "ft" ? value * 0.3048 :
      value;

    return meters / mpp;
  }

  private pingDistanceFromPixels(px: number, unit: PingDistanceUnit, customUnitId?: string): number | null {
    if (!Number.isFinite(px) || px < 0) return null;

    if (unit === "custom") {
      if (!customUnitId) return null;
      const pxPerUnit = this.getEffectivePxPerCustomUnit(customUnitId);
      if (!pxPerUnit) return null;
      return px / pxPerUnit;
    }

    const mpp = this.getMetersPerPixel();
    if (!mpp) return null;
    const meters = px * mpp;

    if (unit === "km") return meters / 1000;
    if (unit === "mi") return meters / 1609.344;
    if (unit === "ft") return meters / 0.3048;
    return meters;
  }
  
  // --- Party pin: expand tags to related notes --------------------------------
  private normalizeTagForIndex(tag: string): string {
    return (tag ?? "").trim().replace(/^#/, "").toLowerCase();
  }

  private collectTagsForFile(file: TFile): Map<string, string> {
    const out = new Map<string, string>(); // norm -> displayTag (#Case)
    const add = (raw: string) => {
      const t = (raw ?? "").trim();
      if (!t) return;
      const withHash = t.startsWith("#") ? t : `#${t}`;
      const norm = this.normalizeTagForIndex(withHash);
      if (!norm) return;
      if (!out.has(norm)) out.set(norm, withHash);
    };

    const cache = this.app.metadataCache.getFileCache(file);
    for (const tc of cache?.tags ?? []) add(tc.tag);

    const fm = cache?.frontmatter ?? {};
    const fmTags = (fm["tags"] ?? fm["tag"]) as unknown;
    if (typeof fmTags === "string") {
      fmTags
        .split(/[, ]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach(add);
    } else if (Array.isArray(fmTags)) {
      for (const x of fmTags) if (typeof x === "string") add(x);
    }

    return out;
  }

  private fileMatchesPartyFilters(file: TFile, preset?: PingPreset): boolean {
    if (!preset) return true;

    const wantTagNorms = (preset.filterTags ?? [])
      .map((t) => this.normalizeTagForIndex(t))
      .filter(Boolean);

    if (wantTagNorms.length) {
      const tags = this.collectTagsForFile(file);
      const hasAny = wantTagNorms.some((t) => tags.has(t));
      if (!hasAny) return false;
    }

    const props = preset.filterProps ?? {};
    if (props && Object.keys(props).length) {
      const fm = (this.app.metadataCache.getFileCache(file)?.frontmatter ?? {}) as Record<string, unknown>;
      const matchScalar = (x: unknown, want: string): boolean => {
        if (typeof x === "string") return x.trim() === want;
        if (typeof x === "number" || typeof x === "boolean") return String(x).trim() === want;
        return false;
      };

      const clauses = Object.entries(props)
        .flatMap(([kRaw, vRaw]) => {
          const key = (kRaw ?? "").trim();
          if (!key) return [];

          const wants = (Array.isArray(vRaw) ? vRaw.join(" | ") : String(vRaw ?? ""))
            .split(/[|,]/g)
            .map((s) => s.trim())
            .filter(Boolean);

          if (wants.length === 0) return [];
          return [{ key, wants }];
        });

      if (clauses.length) {
        const matchesAny = clauses.some(({ key, wants }) => {
          const have = fm[key];
          if (have == null) return false;

          const matchesWants = (x: unknown) => wants.some((w) => matchScalar(x, w));

          if (Array.isArray(have)) return have.some((x) => matchesWants(x));
          return matchesWants(have);
        });

        if (!matchesAny) return false;
      }
    }

    return true;
  }
  
  private resolvePingSearchLayerIds(ping: Marker, preset?: PingPreset): Set<string> | null {
    if (!this.data) return null;

    const mode = preset?.searchLayersMode ?? "all";
    if (mode === "self") {
      return new Set([ping.layer]);
    }

    if (mode === "custom") {
      const names = (preset?.searchLayerNames ?? []).map((s) => (s ?? "").trim()).filter(Boolean);
      if (names.length === 0) return null; // treat empty as "all"

      const ids = new Set(
        (this.data.layers ?? [])
          .filter((l) => names.includes((l.name ?? "").trim()))
          .map((l) => l.id),
      );

      // If the user configured names that don't exist on this map, fall back to "all" to avoid "broken" pings.
      if (ids.size === 0) return null;
      return ids;
    }

    return null; // all layers
  }

  private buildTagIndexForTags(want: Set<string>): Map<string, TFile[]> {
    const index = new Map<string, TFile[]>();
    if (want.size === 0) return index;

    const files = this.app.vault.getFiles().filter((f) => f.extension?.toLowerCase() === "md");
    for (const f of files) {
      const tags = this.collectTagsForFile(f);
      for (const norm of tags.keys()) {
        if (!want.has(norm)) continue;
        const arr = index.get(norm);
        if (arr) arr.push(f);
        else index.set(norm, [f]);
      }
    }
    return index;
  }
  
  private backlinkPathsFromResolvedLinks(target: TFile): string[] {
    const out: string[] = [];

    const mcAny = this.app.metadataCache as unknown as {
      resolvedLinks?: unknown;
    };
    const rl = mcAny.resolvedLinks;
    if (!rl) return out;

    // resolvedLinks: Record<srcPath, Record<destPath, number>> (most common)
    // Some builds may use Map-like structures; handle both.
    const addIfLinksTo = (srcPath: string, dests: unknown) => {
      if (!srcPath || srcPath === target.path) return;

      if (dests && typeof dests === "object") {
        if (dests instanceof Map) {
          if (dests.has(target.path)) out.push(srcPath);
          return;
        }
        const obj = dests as Record<string, unknown>;
        if (Object.prototype.hasOwnProperty.call(obj, target.path)) out.push(srcPath);
      }
    };

    if (rl instanceof Map) {
      for (const [srcPath, dests] of rl.entries()) {
        if (typeof srcPath !== "string") continue;
        addIfLinksTo(srcPath, dests);
      }
      return out;
    }

    if (typeof rl === "object") {
      for (const [srcPath, dests] of Object.entries(rl as Record<string, unknown>)) {
        addIfLinksTo(srcPath, dests);
      }
    }

    return out;
  }
  
  private getBacklinkSourcePaths(target: TFile): string[] {
    return this.backlinkPathsFromResolvedLinks(target);
  }

  private buildTagIndex(): Map<string, TFile[]> {
    const index = new Map<string, TFile[]>();
    const files = this.app.vault.getFiles().filter((f) => f.extension?.toLowerCase() === "md");
    for (const f of files) {
      const tags = this.collectTagsForFile(f);
      for (const norm of tags.keys()) {
        const arr = index.get(norm);
        if (arr) arr.push(f);
        else index.set(norm, [f]);
      }
    }
    return index;
  }

  private formatWikiLink(file: TFile, fromPath: string): string {
    const linktext = this.app.metadataCache.fileToLinktext(file, fromPath);
    return `[[${linktext}]]`;
  }

  private escapeTableCell(s: string): string {
    return (s ?? "").replace(/\|/g, "\\|");
  }
  
  private splitFrontmatterBlock(text: string): { frontmatter: string; rest: string } {
    const m = /^---\n[\s\S]*?\n(?:---|\.\.\.)\n/.exec(text);
    if (!m) return { frontmatter: "", rest: text };
    return { frontmatter: m[0], rest: text.slice(m[0].length) };
  }

  private extractFirstMarkdownHeading(text: string): string | null {
    const m = /^#\s+.*$/m.exec(text);
    return m ? m[0] : null;
  }

  private extractFirstCodeFenceBlock(text: string, lang: string): string | null {
    const lines = text.split("\n");
    const open = "```" + lang;
    let start = -1;
    for (let i = 0; i < lines.length; i += 1) {
      if (lines[i].trimStart().startsWith(open)) {
        start = i;
        break;
      }
    }
    if (start < 0) return null;

    let end = start + 1;
    while (end < lines.length && !lines[end].trimStart().startsWith("```")) end += 1;
    if (end >= lines.length) return null;

    return lines.slice(start, end + 1).join("\n").trimEnd();
  }
  
  private openLinkInNewTab(link: string): void {
    const leaf = this.app.workspace.getLeaf("tab");
    const anyLeaf = leaf as unknown as { openLinkText?: (linktext: string, sourcePath: string) => Promise<void> };
    if (typeof anyLeaf.openLinkText === "function") {
      void anyLeaf.openLinkText(link, this.cfg.sourcePath);
      return;
    }

    const anyWs = this.app.workspace as unknown as {
      openLinkText: (linktext: string, sourcePath: string, newLeaf?: boolean) => Promise<void>;
    };
    try {
      void anyWs.openLinkText(link, this.cfg.sourcePath, true);
    } catch {
      void this.app.workspace.openLinkText(link, this.cfg.sourcePath);
    }
  }

  private buildPingNoteText(
    prevText: string,
    opts: {
      defaultTitle: string;
      baseYamlFallback: string;
      tooltipBody: string;
      relatedBody: string;
      travelBody: string;
      includeBases: boolean;
      includeTooltips: boolean;
      includeRelated: boolean;
      includeTravel: boolean;
    },
  ): string {
    const { frontmatter, rest } = this.splitFrontmatterBlock(prevText);

    const title = (this.extractFirstMarkdownHeading(rest) ?? opts.defaultTitle).trimEnd();

    const baseBlock = opts.includeBases
      ? (this.extractFirstCodeFenceBlock(rest, "base") ??
        `\`\`\`base\n${opts.baseYamlFallback.trimEnd()}\n\`\`\``)
      : "";

    const relatedSection = opts.includeRelated
      ? `${PING_RELATED_BEGIN}\n${opts.relatedBody.trimEnd()}\n${PING_RELATED_END}`
      : "";

    const travelSection = opts.includeTravel
      ? (`## Travel times\n` +
        `${PING_TRAVEL_BEGIN}\n${opts.travelBody.trimEnd()}\n${PING_TRAVEL_END}`)
      : "";

    const tooltipSection = opts.includeTooltips
      ? (`## In-range markers without note\n` +
        `${PING_TOOLTIP_BEGIN}\n${opts.tooltipBody.trimEnd()}\n${PING_TOOLTIP_END}`)
      : "";

    const parts = [
      `${frontmatter}${title}`,
      relatedSection,
      travelSection,
      tooltipSection,
      baseBlock,
    ].filter((s) => (s ?? "").trim().length > 0);

    return `${parts.join("\n\n").trimEnd()}\n`;
  }

  private async upsertPingRelatedSection(file: TFile, body: string): Promise<void> {
    await this.app.vault.process(file, (text) => {
      const a = text.indexOf(PING_RELATED_BEGIN);
      const b = text.indexOf(PING_RELATED_END);
      if (a >= 0 && b > a) {
        const before = text.slice(0, a + PING_RELATED_BEGIN.length);
        const after = text.slice(b);
        return `${before}\n${body}\n${after}`;
      }
      return text;
    });
  }

  private schedulePingUpdate(delayMs = 900): void {
    if (!this.data) return;
    if (!this.data.markers?.some((m) => m.type === "pin")) return;

    if (this.pingUpdateTimer !== null) window.clearTimeout(this.pingUpdateTimer);
    this.pingUpdateTimer = window.setTimeout(() => {
      this.pingUpdateTimer = null;
      void this.updateAllPingNotes();
    }, delayMs);
  }

  private async updateAllPingNotes(): Promise<void> {
    if (!this.data) return;
    const pings = this.data.markers.filter((m) => m.type === "pin");
    for (const p of pings) {
      try { await this.updatePingNoteForMarker(p); }
      catch (e) { console.warn("Ping update failed", e); }
    }
  }

  private buildPingBaseYaml(preset: PingPreset, unitLabel: string): string {
    const andFilters: unknown[] = [
      'list(this.zoommapPingInRangePaths).contains(file.path)',
      'file.ext == "md"',
    ];

    const tags = (preset.filterTags ?? []).map((t) => (t ?? "").trim()).filter(Boolean);
    if (tags.length) {
      andFilters.push({
        or: tags.map((t) => `file.hasTag("${t.replace(/^#/, "")}")`),
      });
    }

    const props = preset.filterProps ?? {};
    const propClauses: string[] = [];
    for (const [kRaw, vRaw] of Object.entries(props)) {
      const k = (kRaw ?? "").trim();
      if (!k) continue;

      const wants = (Array.isArray(vRaw) ? vRaw.join(" | ") : String(vRaw ?? ""))
        .split(/[|,]/g)
        .map((s) => s.trim())
        .filter(Boolean);
      if (wants.length === 0) continue;

      for (const v of wants) {
        propClauses.push(
          `note["${k.replace(/"/g, '\\"')}"] == "${v.replace(/"/g, '\\"')}"`,
        );
      }
    }
    if (propClauses.length) andFilters.push({ or: propClauses });

    const baseObj: Record<string, unknown> = {
      filters: { and: andFilters },
      formulas: {
        ping_link: "file.asLink()",
        distance: `this.zoommapPingDistances[file.path]`,
        distance_label: `if(formula.distance, formula.distance.toString() + " ${unitLabel}", "")`,
      },
      views: [
        {
          type: "table",
          name: "In range",
          order: ["formula.ping_link", "formula.distance_label", "file.tags"],
        },
      ],
    };

    return stringifyYaml(baseObj).trimEnd();
  }
  
  private buildPingTravelTimesTable(
    fromPath: string,
    inRangeFiles: { file: TFile; dist: number }[],
    metersByPath: Record<string, number>,
  ): string {
    const presets = this.plugin.getActiveTravelTimePresets();
    if (!presets.length) return "*(none)*";

    const locs = inRangeFiles
      .map((x) => ({ file: x.file, meters: metersByPath[x.file.path] }))
      .filter((x): x is { file: TFile; meters: number } => typeof x.meters === "number" && Number.isFinite(x.meters) && x.meters >= 0);

    if (!locs.length) return "*(no calibrated scale)*";

    const header: string[] = ["Mode", ...locs.map((l) => this.formatWikiLink(l.file, fromPath))];
    const rows: string[] = [];
    rows.push(`| ${header.map((c) => this.escapeTableCell(c)).join(" | ")} |`);
    rows.push(`| ${header.map(() => "---").join(" | ")} |`);

    for (const p of presets) {
      const refMeters = this.travelDistanceToMeters(p.distanceValue, p.distanceUnit, p.distanceCustomUnitId);
      const name = p.name || p.id;
      const unit = (p.timeUnit ?? "").trim() || "h";

      const cells: string[] = [name];
      for (const loc of locs) {
        if (!refMeters || !Number.isFinite(refMeters) || refMeters <= 0) {
          cells.push("-");
          continue;
        }
        const t = (loc.meters / refMeters) * p.timeValue;
        cells.push(`${this.formatTravelTimeNumber(t)} ${unit}`);
      }
      rows.push(`| ${cells.map((c) => this.escapeTableCell(c)).join(" | ")} |`);
    }

    return rows.join("\n").trimEnd();
  }

  private async addPingPinAt(preset: PingPreset, nx: number, ny: number, distanceValue: number): Promise<void> {
    if (!this.data) return;

    const unit = preset.unit ?? "km";
    const customUnitId = preset.customUnitId;

    if (unit === "custom" && (!customUnitId || !customUnitId.trim())) {
      new Notice("Party preset uses a custom unit but no customunitid is set.", 4000);
      return;
    }

    const radiusPx = this.pingToPixels(distanceValue, unit, customUnitId);
    if (radiusPx == null) {
      new Notice("Cannot create party pin: map scale is not calibrated for this unit.", 5000);
      return;
    }

    // Layer handling (optional per preset)
    let layerId = this.getPreferredNewMarkerLayerId();
    if (preset.layerName) {
      const found = this.data.layers.find((l) => l.name === preset.layerName);
      if (found) layerId = found.id;
      else {
        const id = generateId("layer");
        this.data.layers.push({ id, name: preset.layerName, visible: true, locked: false });
        layerId = id;
      }
    }

    const iconKey = preset.iconKey ?? this.plugin.settings.defaultIconKey;
    const distanceLabel = this.formatPingDistanceLabel(distanceValue, unit, customUnitId);

    const marker: Marker = {
      id: generateId("ping"),
      type: "pin",
      x: nx,
      y: ny,
      layer: layerId,
      iconKey,
      tooltip: preset.name ? `Party: ${preset.name} (${distanceLabel})` : `Party (${distanceLabel})`,
      pingPresetId: preset.id,
      pingRadius: distanceValue,
      pingRadiusUnit: unit,
      pingRadiusCustomUnitId: unit === "custom" ? customUnitId : undefined,
      scaleLikeSticker: preset.defaultScaleLikeSticker ? true : undefined,
	};

    const folder = (preset.noteFolder ?? "ZoomMap/Pings").trim() || "ZoomMap/Pings";
    const baseName = this.sanitizeFileName(`Party - ${preset.name || "Party"} - ${distanceLabel} - ${marker.id}`);
    let outPath = normalizePath(`${folder}/${baseName}.md`);
    await this.ensureFolderForPath(outPath);

    let i = 1;
    while (this.app.vault.getAbstractFileByPath(outPath)) {
      outPath = normalizePath(`${folder}/${baseName}-${i}.md`);
      i++;
    }

    const unitLabel = this.pingUnitLabel(unit, customUnitId);
    const baseYaml = this.buildPingBaseYaml(preset, unitLabel);
    const sections = preset.sections ?? {};
    const includeBases = sections.bases !== false;
    const includeTooltips = sections.tooltips !== false;
    const includeRelated = sections.related !== false;
    const includeTravel = sections.travelTimes !== false;

    const fm: Record<string, unknown> = {
      zoommapPing: true,
      zoommapPingId: marker.id,
      zoommapPingMapId: this.cfg.mapId ?? "",
      zoommapPingBase: this.getActiveBasePath(),
      zoommapPingRadius: distanceValue,
      zoommapPingUnit: unit,
      zoommapPingCustomUnitId: unit === "custom" ? customUnitId : undefined,
      zoommapPingPresetId: preset.id,
      zoommapPingPresetName: preset.name,
      zoommapPingInRangePaths: [],
      zoommapPingDistances: {},
      zoommapPingUpdated: new Date().toISOString(),
    };

    const frontmatter = `---\n${stringifyYaml(fm).trimEnd()}\n---\n\n`;
    const defaultTitle = `# Party pin: ${preset.name || "Party"} (${distanceLabel})`;
    const relatedBody = "*(none)*";
    const tooltipBody = "*(none)*";
    const travelBody = "*(none)*";
    const baseYamlFallback = baseYaml;

    const md =
      frontmatter +
      this.buildPingNoteText("", {
        defaultTitle,
        baseYamlFallback,
        tooltipBody,
        relatedBody,
        travelBody,
        includeBases,
        includeTooltips,
        includeRelated,
        includeTravel,
      });

    const file = await this.app.vault.create(outPath, md);
    marker.pingNotePath = file.path;
    marker.link = this.app.metadataCache.fileToLinktext(file, this.cfg.sourcePath);

    // Save marker
    this.data.markers.push(marker);
    await this.saveDataSoon();
    this.renderMarkersOnly();

    // Compute first result set immediately
    await this.updatePingNoteForMarker(marker);

    new Notice("Party pin created.", 1200);
  }

  private async updatePingNoteForMarker(ping: Marker): Promise<void> {
    if (!this.data) return;
    if (ping.type !== "pin") return;

    const notePath = ping.pingNotePath ?? "";
    const af = this.app.vault.getAbstractFileByPath(notePath);
    if (!(af instanceof TFile)) return;

    const radius = ping.pingRadius ?? 0;
    const unit = ping.pingRadiusUnit ?? "km";
    const customUnitId = ping.pingRadiusCustomUnitId;

    const radiusPx = this.pingToPixels(radius, unit, customUnitId);
    if (radiusPx == null) return;
	
    const preset = ping.pingPresetId ? this.findPingPresetById(ping.pingPresetId) : undefined;
    const allowedLayerIds = this.resolvePingSearchLayerIds(ping, preset);

    const inRangePaths = new Set<string>();
    const distances: Record<string, number> = {};
	const metersByPath: Record<string, number> = {};

    const tooltipMap = new Map<string, number>(); // tooltip -> min distance
	
	const mpp = this.getMetersPerPixel();

    for (const m of this.data.markers) {
      if (m.id === ping.id) continue;
      if (m.anchorSpace === "viewport") continue;
      if (m.type === "pin") continue;
	  if (allowedLayerIds && !allowedLayerIds.has(m.layer)) continue;

      const dx = (m.x - ping.x) * this.imgW;
      const dy = (m.y - ping.y) * this.imgH;
      const pxDist = Math.hypot(dx, dy);
      if (pxDist > radiusPx) continue;

      const distVal = this.pingDistanceFromPixels(pxDist, unit, customUnitId);
      const dist = distVal == null ? 0 : Math.round(distVal * 100) / 100;

      const link = (m.link ?? "").trim();
      if (link) {
        const f = this.resolveTFile(link, this.cfg.sourcePath);
        if (!f) continue;

        inRangePaths.add(f.path);

        const prev = distances[f.path];
        if (prev == null || dist < prev) distances[f.path] = dist;
		
        if (typeof mpp === "number") {
          const meters = pxDist * mpp;
          const prevM = metersByPath[f.path];
          if (prevM == null || meters < prevM) metersByPath[f.path] = meters;
        }
        continue;
      }

      const tip = (m.tooltip ?? "").trim();
      if (!tip) continue;

      const prev = tooltipMap.get(tip);
      if (prev == null || dist < prev) tooltipMap.set(tip, dist);
    }

    const listSorted = Array.from(inRangePaths).sort((a, b) => a.localeCompare(b));

    const distancesSorted: Record<string, number> = Object.fromEntries(
      Object.entries(distances).sort((a, b) => a[0].localeCompare(b[0])),
    );
    let fmChanged = false;
    await this.app.fileManager.processFrontMatter(af, (fm) => {
      const set = (key: string, value: unknown) => {
        const cur = (fm as Record<string, unknown>)[key];
        if (!stableEqual(cur, value)) {
          (fm as Record<string, unknown>)[key] = value;
          fmChanged = true;
        }
      };
      const del = (key: string) => {
        if (Object.prototype.hasOwnProperty.call(fm, key)) {
          delete (fm as Record<string, unknown>)[key];
          fmChanged = true;
        }
      };

      set("zoommapPing", true);
      set("zoommapPingId", ping.id);
      set("zoommapPingMapId", this.cfg.mapId ?? "");
      set("zoommapPingBase", this.getActiveBasePath());
      set("zoommapPingRadius", radius);
      set("zoommapPingUnit", unit);
      if (unit === "custom") set("zoommapPingCustomUnitId", customUnitId);
      else del("zoommapPingCustomUnitId");

      set("zoommapPingPresetId", ping.pingPresetId ?? "");
      set("zoommapPingInRangePaths", listSorted);
      set("zoommapPingDistances", distancesSorted);

      // Only touch the timestamp if something actually changed,
      // otherwise the ping note would be rewritten every time.
      if (fmChanged) {
        set("zoommapPingUpdated", new Date().toISOString());
      }
    });

    const unitLabel = this.pingUnitLabel(unit, customUnitId);
    const tooltipsSorted = Array.from(tooltipMap.entries())
      .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]));

    const tooltipLines =
      tooltipsSorted.length === 0
        ? ["*(none)*"]
        : tooltipsSorted.map(([txt, d]) => `- ${txt} (${d} ${unitLabel})`);

    const relatedMode = preset?.relatedLookup ?? "tags";

    const sections = preset?.sections ?? {};
    const includeBases = sections.bases !== false;
    const includeTooltips = sections.tooltips !== false;
    const includeRelated = sections.related !== false;
    const includeTravel = sections.travelTimes !== false;
	
	let relatedBody = "";

    const inRangeFiles = listSorted
      .map((p) => this.app.vault.getAbstractFileByPath(p))
      .filter((x): x is TFile => x instanceof TFile)
      .map((file) => ({ file, dist: distances[file.path] ?? 0 }))
      .filter(({ file }) => this.fileMatchesPartyFilters(file, preset))
      .sort((a, b) => a.dist - b.dist || a.file.path.localeCompare(b.file.path));

    try {
      if (!includeRelated) {
        relatedBody = "*(disabled)*";
      } else if (relatedMode === "off") {
        relatedBody = "*(disabled)*";
      } else if (relatedMode === "backlinks") {
        const maxPerNote = 50;
        const blocks: string[] = [];

        if (inRangeFiles.length === 0) {
          relatedBody = "*(none)*";
        } else {
          for (const c of inRangeFiles) {
            const pinLabel = `${this.formatWikiLink(c.file, af.path)} (${c.dist} ${unitLabel})`;
            const lines: string[] = [];
            lines.push(`| ${pinLabel} | Backlinks |`);
            lines.push("| --- | --- |");

            const sourcePaths = this.getBacklinkSourcePaths(c.file);
            const sources = sourcePaths
              .map((p) => this.app.vault.getAbstractFileByPath(p))
              .filter((x): x is TFile => x instanceof TFile)
              .filter((f) => f.path !== c.file.path && f.path !== af.path)
              .sort((a, b) => a.basename.localeCompare(b.basename, undefined, { sensitivity: "base" }));

            const slice = sources.slice(0, maxPerNote);
            const rest = sources.length - slice.length;
            const links = slice.map((f) => this.formatWikiLink(f, af.path));
            const cell = links.length ? links.join("<br>") + (rest > 0 ? `<br>… +${rest} more` : "") : "*(none)*";
            lines.push(`| Backlinks | ${cell} |`);

            blocks.push(lines.join("\n"));
          }

          relatedBody = blocks.join("\n\n").trim() || "*(none)*";
        }
      } else {
        const excludeTagNorms = new Set(
          (preset?.filterTags ?? [])
            .map((t) => this.normalizeTagForIndex(t))
            .filter(Boolean),
        );

        const candidates = inRangeFiles.map(({ file, dist }) => {
          const tags = this.collectTagsForFile(file);
          for (const ex of excludeTagNorms) tags.delete(ex);

          const norms = [...tags.keys()].sort((aa, bb) => {
            const aTag = tags.get(aa) ?? aa;
            const bTag = tags.get(bb) ?? bb;
            return aTag.localeCompare(bTag, undefined, { sensitivity: "base" });
          });

          return { file, dist, tags, norms };
        }).filter((c) => c.norms.length > 0);

        if (candidates.length === 0) {
          relatedBody = "*(none)*";
        } else {
          const wantNorms = new Set<string>();
          for (const c of candidates) for (const n of c.norms) wantNorms.add(n);
          const tagIndex = this.buildTagIndexForTags(wantNorms);

          const maxPerTag = 50;
          const tables: string[] = [];

          for (const c of candidates) {
            const pinLabel = `${this.formatWikiLink(c.file, af.path)} (${c.dist} ${unitLabel})`;

            const lines: string[] = [];
            lines.push(`| ${pinLabel} | Notes with tag |`);
            lines.push("| --- | --- |");

            for (const norm of c.norms) {
              const displayTag = c.tags.get(norm) ?? `#${norm}`;

              const matches = (tagIndex.get(norm) ?? [])
                .filter((f) => f.path !== c.file.path && f.path !== af.path)
                .sort((a, b) => a.basename.localeCompare(b.basename, undefined, { sensitivity: "base" }));

              const slice = matches.slice(0, maxPerTag);
              const rest = matches.length - slice.length;
              const links = slice.map((f) => this.formatWikiLink(f, af.path));
              const cell = links.length ? links.join("<br>") + (rest > 0 ? `<br>… +${rest} more` : "") : "*(none)*";
              lines.push(`| ${this.escapeTableCell(displayTag)} | ${cell} |`);
            }

            tables.push(lines.join("\n"));
          }

          relatedBody = tables.join("\n\n").trim() || "*(none)*";
        }
      }
    } catch (e: unknown) {
      console.warn("Zoom Map: related section build failed", e);
      relatedBody = "*(error building related section)*";
    }
	
    if (!relatedBody.trim()) {
      relatedBody = "*(none)*";
    }

    // Rebuild note body into the canonical layout and update both sections in one pass.
    const dummyPreset = (preset ??
      ({ id: "", name: "", distances: [], unit: "km" } as PingPreset));
    const baseYamlFallback = this.buildPingBaseYaml(dummyPreset, unitLabel);

    const distLabel = this.formatPingDistanceLabel(radius, unit, customUnitId);
    const defaultTitle = `# Party pin: ${preset?.name || "Party"} (${distLabel})`;

    const travelBody = includeTravel
      ? this.buildPingTravelTimesTable(af.path, inRangeFiles, metersByPath)
      : "*(disabled)*";

    const tooltipBody = includeTooltips ? tooltipLines.join("\n") : "*(disabled)*";

    await this.app.vault.process(af, (text) => {
      const next = this.buildPingNoteText(text, {
        defaultTitle,
        baseYamlFallback,
        tooltipBody,
        relatedBody,
        travelBody,
        includeBases,
        includeTooltips,
        includeRelated,
        includeTravel,
      });
      return next === text ? text : next;
    });
  }

  private async deletePingNoteIfOwned(m: Marker): Promise<void> {
    if (m.type !== "pin") return;
    const p = (m.pingNotePath ?? "").trim();
    if (!p) return;

    const af = this.app.vault.getAbstractFileByPath(p);
    if (!(af instanceof TFile)) return;

    const fm = this.app.metadataCache.getFileCache(af)?.frontmatter as Record<string, unknown> | undefined;
    const owner = fm?.zoommapPingId;
    if (owner !== m.id) return;

    try {
      await this.app.fileManager.trashFile(af);
    } catch (e) {
      console.warn("Failed to trash ping note", e);
    }
  }
  
  private openPinSizeEditor(focusIconKey?: string | null): void {
    if (!this.data) return;

    // Collect all icon keys used by non-sticker markers on this map
    const usedKeys = new Set<string>();
    for (const m of this.data.markers) {
      if (m.type === "sticker") continue;
      if (m.type === "swap" && m.swapKey) {
        const preset = this.findSwapPresetById(m.swapKey);
        if (preset?.frames?.length) {
          for (const fr of preset.frames) {
            const k = (fr?.iconKey ?? "").trim();
            if (k) usedKeys.add(k);
          }
        }
        if (m.iconKey) usedKeys.add(m.iconKey);
        continue;
      }

      const key = (m.iconKey ?? this.plugin.settings.defaultIconKey).trim();
      if (key) usedKeys.add(key);
    }

    if (usedKeys.size === 0) {
      new Notice("No pins on this map yet.", 2000);
      return;
    }

    const rows: PinSizeEditorRow[] = [];

    for (const key of usedKeys) {
      const profile =
        this.plugin.settings.icons.find((i) => i.key === key) ?? this.plugin.builtinIcon();
      const baseSize = profile.size;
      const override = this.data.pinSizeOverrides?.[key];
      const imgUrl = this.resolveResourceUrl(profile.pathOrDataUrl);

      rows.push({
        iconKey: key,
        baseSize,
        override,
        imgUrl,
      });
    }

    rows.sort((a, b) => a.iconKey.localeCompare(b.iconKey));

    const modal = new PinSizeEditorModal(
      this.app,
      rows,
      (updated) => {
        if (!this.data) return;
        const allowed = new Set(rows.map((r) => r.iconKey));
        const next: Record<string, number> = {};

        for (const key of allowed) {
          const val = updated[key];
          if (typeof val === "number" && Number.isFinite(val) && val > 0) {
            next[key] = val;
          }
        }

        if (Object.keys(next).length > 0) {
          this.data.pinSizeOverrides = next;
        } else {
          delete this.data.pinSizeOverrides;
        }

        void this.saveDataSoon();
        this.renderMarkersOnly();
      },
      focusIconKey ?? undefined,
    );

    modal.open();
  }
  
  private getTintedSvgDataUrl(baseDataUrl: string, color: string): string {
    const key = `${baseDataUrl}||${color}`;
    const cached = this.tintedSvgCache.get(key);
    if (cached) return cached;

    const idx = baseDataUrl.indexOf(",");
    if (idx < 0) return baseDataUrl;

    const header = baseDataUrl.slice(0, idx + 1);
    const payload = baseDataUrl.slice(idx + 1);

    let svg: string;
    try {
      svg = decodeURIComponent(payload);
    } catch {
      return baseDataUrl;
    }

    const tinted = tintSvgMarkupLocal(svg, color);
    const out = header + encodeURIComponent(tinted);
    this.tintedSvgCache.set(key, out);
    return out;
  }
  
  private renderDrawings(): void {
    if (!this.drawSvg || !this.drawStaticLayer || !this.drawDefs) return;

    this.drawSvg.setAttribute("width", String(this.imgW));
    this.drawSvg.setAttribute("height", String(this.imgH));

    while (this.drawStaticLayer.firstChild) {
      this.drawStaticLayer.removeChild(this.drawStaticLayer.firstChild);
    }
    while (this.drawDefs.firstChild) {
      this.drawDefs.removeChild(this.drawDefs.firstChild);
    }

    if (
      !this.data ||
      !Array.isArray(this.data.drawings) ||
      this.data.drawings.length === 0
    ) {
      return;
    }

    const visibleDrawLayers = new Set(
      (this.data.drawLayers ?? [])
        .filter((l) => l.visible)
        .map((l) => l.id),
    );

    const toAbs = (nx: number, ny: number) => ({
      x: nx * this.imgW,
      y: ny * this.imgH,
    });

    const ns = "http://www.w3.org/2000/svg";

    for (const d of this.data.drawings) {
      if (!d.visible) continue;
      if (!visibleDrawLayers.has(d.layerId)) continue;

      const style = d.style ?? {};

      let shape: SVGElement | null = null;
      let minX = 0;
      let minY = 0;
      let width = 0;
      let height = 0;
      let polylineLenPx = 0;
      let polylineMid: { x: number; y: number; angleDeg: number } | null = null;

      if (d.kind === "circle" && d.circle) {
        const { cx, cy, r } = d.circle;
        const c = toAbs(cx, cy);
        const radius = r * Math.max(this.imgW, this.imgH);

        minX = c.x - radius;
        minY = c.y - radius;
        width = radius * 2;
        height = radius * 2;

        const circ = document.createElementNS(ns, "circle");
        circ.setAttribute("cx", String(c.x));
        circ.setAttribute("cy", String(c.y));
        circ.setAttribute("r", String(radius));
        shape = circ;
      } else if (d.kind === "rect" && d.rect) {
        const { x0, y0, x1, y1 } = d.rect;
        const a = toAbs(x0, y0);
        const b = toAbs(x1, y1);
        const x = Math.min(a.x, b.x);
        const y = Math.min(a.y, b.y);
        const w = Math.abs(a.x - b.x);
        const h = Math.abs(a.y - b.y);

        minX = x;
        minY = y;
        width = w;
        height = h;

        const rEl = document.createElementNS(ns, "rect");
        rEl.setAttribute("x", String(x));
        rEl.setAttribute("y", String(y));
        rEl.setAttribute("width", String(w));
        rEl.setAttribute("height", String(h));
        shape = rEl;
      } else if (d.kind === "polygon" && d.polygon && d.polygon.length >= 2) {
        const path = document.createElementNS(ns, "path");
        let dAttr = "";
        let minPx = Infinity;
        let minPy = Infinity;
        let maxPx = -Infinity;
        let maxPy = -Infinity;

        d.polygon.forEach((p, idx) => {
          const a = toAbs(p.x, p.y);
          dAttr += idx === 0 ? `M ${a.x} ${a.y}` : ` L ${a.x} ${a.y}`;
          minPx = Math.min(minPx, a.x);
          maxPx = Math.max(maxPx, a.x);
          minPy = Math.min(minPy, a.y);
          maxPy = Math.max(maxPy, a.y);
        });
        dAttr += " Z";
        path.setAttribute("d", dAttr);
        shape = path;

        if (
          Number.isFinite(minPx) &&
          Number.isFinite(maxPx) &&
          Number.isFinite(minPy) &&
          Number.isFinite(maxPy)
        ) {
          minX = minPx;
          minY = minPy;
          width = maxPx - minPx;
          height = maxPy - minPy;
        }
      }
      else if (d.kind === "polyline" && d.polyline && d.polyline.length >= 2) {
        const path = document.createElementNS(ns, "path");
        let dAttr = "";
        let minPx = Infinity;
        let minPy = Infinity;
        let maxPx = -Infinity;
        let maxPy = -Infinity;

        const absPts = d.polyline.map((p) => toAbs(p.x, p.y));

        for (let i = 0; i < absPts.length; i += 1) {
          const a = absPts[i];
          dAttr += i === 0 ? `M ${a.x} ${a.y}` : ` L ${a.x} ${a.y}`;
          minPx = Math.min(minPx, a.x);
          maxPx = Math.max(maxPx, a.x);
          minPy = Math.min(minPy, a.y);
          maxPy = Math.max(maxPy, a.y);
        }

        for (let i = 1; i < absPts.length; i += 1) {
          polylineLenPx += Math.hypot(absPts[i].x - absPts[i - 1].x, absPts[i].y - absPts[i - 1].y);
        }

        // midpoint on the polyline (for distance label)
        if (polylineLenPx > 0) {
          const target = polylineLenPx / 2;
          let acc = 0;
          for (let i = 1; i < absPts.length; i += 1) {
            const p0 = absPts[i - 1];
            const p1 = absPts[i];
            const seg = Math.hypot(p1.x - p0.x, p1.y - p0.y);
            if (acc + seg >= target && seg > 0) {
              const t = (target - acc) / seg;
              const x = p0.x + (p1.x - p0.x) * t;
              const y = p0.y + (p1.y - p0.y) * t;
              const angleDeg = (Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180) / Math.PI;
              polylineMid = { x, y, angleDeg };
              break;
            }
            acc += seg;
          }
        }

        path.setAttribute("d", dAttr);
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-linejoin", "round");
        shape = path;

        if (
          Number.isFinite(minPx) &&
          Number.isFinite(maxPx) &&
          Number.isFinite(minPy) &&
          Number.isFinite(maxPy)
        ) {
          minX = minPx;
          minY = minPy;
          width = maxPx - minPx;
          height = maxPy - minPy;
        }
      }

      if (!shape || width <= 0 || height <= 0) continue;

      const handleCtx = (ev: MouseEvent) => {
        ev.preventDefault();
        ev.stopPropagation();
        this.onDrawingContextMenu(ev, d);
      };

      const patternKind: FillPatternKind =
        d.kind === "polyline" ? "none" : (style.fillPattern ?? (style.fillColor ? "solid" : "none"));

      if (
        patternKind === "striped" ||
        patternKind === "cross" ||
        patternKind === "wavy"
      ) {
        const af = d.bakedPath
          ? this.app.vault.getAbstractFileByPath(d.bakedPath)
          : null;
        if (!d.bakedPath || !(af instanceof TFile)) {
          void this.bakePatternSvgToFile(d, {
            minX,
            minY,
            width,
            height,
          });
        }
      }

      let patternHref: string | null = null;

      if (
        patternKind === "striped" ||
        patternKind === "cross" ||
        patternKind === "wavy"
      ) {
        if (d.bakedPath) {
          const af = this.app.vault.getAbstractFileByPath(d.bakedPath);
          if (af instanceof TFile) {
            const url = this.app.vault.getResourcePath(af);
            patternHref = url;
          } else {
            console.warn("ZoomMap: baked SVG file not found", {
              id: d.id,
              bakedPath: d.bakedPath,
            });
          }
        }
      }

      if (patternHref) {
        const img = document.createElementNS(ns, "image");
        img.setAttribute("href", patternHref);
        img.setAttribute("x", String(minX));
        img.setAttribute("y", String(minY));
        img.setAttribute("width", String(width));
        img.setAttribute("height", String(height));
        img.classList.add("zm-draw__shape");
        img.dataset.id = d.id;
        img.addEventListener("contextmenu", handleCtx);
        this.drawStaticLayer.appendChild(img);
      } else if (patternKind !== "none") {
        const fillColor = style.fillColor ?? "none";
        const fillOp =
          typeof style.fillOpacity === "number"
            ? Math.min(Math.max(style.fillOpacity, 0), 1)
            : 0.15;

        const fillShape = shape.cloneNode(false) as SVGElement;
        fillShape.classList.add("zm-draw__shape");
        fillShape.dataset.id = d.id;
        fillShape.setAttribute("fill", fillColor);
        fillShape.setAttribute("fill-opacity", String(fillOp));
        fillShape.setAttribute("stroke", "none");
        fillShape.addEventListener("contextmenu", handleCtx);
        this.drawStaticLayer.appendChild(fillShape);
      }


      const strokeColor =
        (style.strokeColor ?? "#ff0000").trim() || "#ff0000";
      const strokeWidth =
        Number.isFinite(style.strokeWidth) && style.strokeWidth > 0
          ? style.strokeWidth
          : 2;
      const strokeOpacity =
        typeof style.strokeOpacity === "number"
          ? Math.min(Math.max(style.strokeOpacity, 0), 1)
          : 1;

      const outline = shape;
      outline.classList.add("zm-draw__shape");
      outline.dataset.id = d.id;
      outline.setAttribute("fill", "none");
      outline.setAttribute("stroke", strokeColor);
      outline.setAttribute("stroke-width", String(strokeWidth));
      if (strokeOpacity < 1) {
        outline.setAttribute("stroke-opacity", String(strokeOpacity));
      } else {
        outline.removeAttribute("stroke-opacity");
      }

      if (Array.isArray(style.strokeDash) && style.strokeDash.length > 0) {
        outline.setAttribute("stroke-dasharray", style.strokeDash.join(" "));
      } else {
        outline.removeAttribute("stroke-dasharray");
      }
	  
      if (d.kind === "polyline" && style.arrowEnd) {
        const markerId = `zm-arrow-${d.id}`;
        const marker = document.createElementNS(ns, "marker");
        marker.setAttribute("id", markerId);
        marker.setAttribute("viewBox", "0 0 10 10");
        marker.setAttribute("refX", "10");
        marker.setAttribute("refY", "5");
        marker.setAttribute("markerWidth", "6");
        marker.setAttribute("markerHeight", "6");
        marker.setAttribute("orient", "auto");
        marker.setAttribute("markerUnits", "strokeWidth");

        const ap = document.createElementNS(ns, "path");
        ap.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
        ap.setAttribute("fill", strokeColor);
        marker.appendChild(ap);
        this.drawDefs.appendChild(marker);

        outline.setAttribute("marker-end", `url(#${markerId})`);
      } else {
        outline.removeAttribute("marker-end");
      }

      outline.addEventListener("contextmenu", handleCtx);
      this.drawStaticLayer.appendChild(outline);
	  
      if (d.kind === "polyline" && style.distanceLabel && polylineMid && polylineLenPx > 0) {
        const txt = this.formatPolylineDistance(polylineLenPx);
        if (txt) {
          const tEl = document.createElementNS(ns, "text");
          tEl.classList.add("zm-draw__label");
          tEl.setAttribute("x", String(polylineMid.x));
          tEl.setAttribute("y", String(polylineMid.y));
          tEl.setAttribute("text-anchor", "middle");
          tEl.setAttribute("dominant-baseline", "middle");
          tEl.setAttribute("fill", strokeColor);
          let ang = polylineMid.angleDeg;
          // Keep text upright (avoid upside-down labels)
          if (ang > 90 || ang < -90) ang += 180;
          // normalize into [-180, 180]
          while (ang > 180) ang -= 360;
          while (ang < -180) ang += 360;

          if (Math.abs(ang) > 0.01) {
            tEl.setAttribute("transform", `rotate(${ang} ${polylineMid.x} ${polylineMid.y})`);
          }
          tEl.textContent = txt;
          this.drawStaticLayer.appendChild(tEl);
        }
      }
    }

    this.renderDrawingEditHandles();
  }
  
  private formatPolylineDistance(px: number): string | null {
    const unit = this.data?.measurement?.displayUnit ?? "auto-metric";
    if (unit === "custom") return this.formatCustomDistanceFromPixels(px);
    const mpp = this.getMetersPerPixel();
    if (!mpp) return null;
    return this.formatDistance(px * mpp);
  }
  
  private buildPatternSvgMarkup(
    d: Drawing,
    box: { minX: number; minY: number; width: number; height: number },
  ): string | null {
    const style = d.style ?? {};
    const patternKind: FillPatternKind =
      style.fillPattern ?? (style.fillColor ? "solid" : "none");
    if (patternKind === "none" || patternKind === "solid") return null;

    const { minX, minY, width, height } = box;
    const maxX = minX + width;
    const maxY = minY + height;

    const toAbs = (nx: number, ny: number) => ({
      x: nx * this.imgW,
      y: ny * this.imgH,
    });


    let clipBody = "";

    if (d.kind === "circle" && d.circle) {
      const { cx, cy, r } = d.circle;
      const c = toAbs(cx, cy);
      const radius = r * Math.max(this.imgW, this.imgH);
      clipBody = `<circle cx="${c.x}" cy="${c.y}" r="${radius}" />`;
    } else if (d.kind === "rect" && d.rect) {
      const { x0, y0, x1, y1 } = d.rect;
      const a = toAbs(x0, y0);
      const b = toAbs(x1, y1);
      const x = Math.min(a.x, b.x);
      const y = Math.min(a.y, b.y);
      const w = Math.abs(a.x - b.x);
      const h = Math.abs(a.y - b.y);
      clipBody = `<rect x="${x}" y="${y}" width="${w}" height="${h}" />`;
    } else if (d.kind === "polygon" && d.polygon && d.polygon.length >= 2) {
      let pathD = "";
      d.polygon.forEach((p, idx) => {
        const a = toAbs(p.x, p.y);
        pathD += idx === 0 ? `M ${a.x} ${a.y}` : ` L ${a.x} ${a.y}`;
      });
      pathD += " Z";
      clipBody = `<path d="${pathD}" />`;
    } else {
      return null;
    }

    // --- Style-Parameter ---

    const fillColor = style.fillColor ?? "#ff0000";
    const fillOpacity =
      typeof style.fillOpacity === "number"
        ? Math.min(Math.max(style.fillOpacity, 0), 1)
        : 0.15;

    const spacing =
      typeof style.fillPatternSpacing === "number" &&
      style.fillPatternSpacing > 0
        ? style.fillPatternSpacing
        : 8;

    const rawAngle =
      typeof style.fillPatternAngle === "number"
        ? style.fillPatternAngle
        : 45;
    const angle = ((rawAngle % 360) + 360) % 360;

    const strokeWidth =
      typeof style.fillPatternStrokeWidth === "number" &&
      style.fillPatternStrokeWidth > 0
        ? style.fillPatternStrokeWidth
        : 1;

    const patternOpacity =
      typeof style.fillPatternOpacity === "number"
        ? Math.min(Math.max(style.fillPatternOpacity, 0), 1)
        : fillOpacity;

    const centerX = minX + width / 2;
    const centerY = minY + height / 2;


    let stripeContent = "";

    if (patternKind === "striped" || patternKind === "wavy") {
      for (let x = minX - width; x <= maxX + width; x += spacing) {
        if (patternKind === "striped") {
          const xf = x.toFixed(2);
          stripeContent += `<line x1="${xf}" y1="${(minY - height).toFixed(
            2,
          )}" x2="${xf}" y2="${(maxY + height).toFixed(2)}" />`;
        } else {
          const xf = x.toFixed(2);
          const amp = height / 6;
          const segments = 8;
          let dPath = `M ${xf} ${minY.toFixed(2)}`;
          for (let i = 1; i <= segments; i += 1) {
            const t = i / segments;
            const y = minY + t * height;
            const midY = minY + (t - 0.5 / segments) * height;
            const dir = i % 2 === 0 ? -1 : 1;
            const ctrlX = x + dir * amp;
            dPath += ` C ${ctrlX.toFixed(2)} ${midY.toFixed(
              2,
            )} ${ctrlX.toFixed(2)} ${midY.toFixed(2)} ${xf} ${y.toFixed(2)}`;
          }
          stripeContent += `<path d="${dPath}" />`;
        }
      }
    } else if (patternKind === "cross") {
      for (let x = minX - width; x <= maxX + width; x += spacing) {
        const xf = x.toFixed(2);
        stripeContent += `<line x1="${xf}" y1="${(minY - height).toFixed(
          2,
        )}" x2="${xf}" y2="${(maxY + height).toFixed(2)}" />`;
      }
      for (let y = minY - height; y <= maxY + height; y += spacing) {
        const yf = y.toFixed(2);
        stripeContent += `<line x1="${(minX - width).toFixed(
          2,
        )}" y1="${yf}" x2="${(maxX + width).toFixed(2)}" y2="${yf}" />`;
      }
    }

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="${width}" height="${height}"
     viewBox="${minX} ${minY} ${width} ${height}">
  <defs>
    <clipPath id="clip">
      ${clipBody}
    </clipPath>
  </defs>
  <g clip-path="url(#clip)">
    <rect x="${minX}" y="${minY}" width="${width}" height="${height}"
          fill="${fillColor}" fill-opacity="${fillOpacity}" />
    <g stroke="${fillColor}"
       stroke-width="${strokeWidth}"
       stroke-opacity="${patternOpacity}"
       fill="none"
       transform="rotate(${angle} ${centerX} ${centerY})">
      ${stripeContent}
    </g>
  </g>
</svg>`;

    return svg;
  }

  private async bakePatternSvgToFile(
    d: Drawing,
    box: { minX: number; minY: number; width: number; height: number },
  ): Promise<void> {
    const svg = this.buildPatternSvgMarkup(d, box);
    if (!svg) return;

    const vault = this.app.vault;
    const folder = "ZoomMap/draw-overlays";
    if (!vault.getAbstractFileByPath(folder)) {
      await vault.createFolder(folder);
    }

    const mapId =
      this.cfg.mapId ??
      this.cfg.sourcePath
        .replace(/[\\/]/g, "_")
        .replace(/[^\w.-]/g, "_");

    const fileName = `${mapId}-${d.id}.svg`;
    const fullPath = `${folder}/${fileName}`;

    const existing = vault.getAbstractFileByPath(fullPath);
    if (existing instanceof TFile) {
      await vault.modify(existing, svg);
    } else {
      await vault.create(fullPath, svg);
    }

    d.bakedPath = fullPath;
    d.bakedWidth = box.width;
    d.bakedHeight = box.height;

    await this.saveDataSoon();

    // Trigger a second render so the newly baked pattern becomes visible immediately
    if (this.ready) {
      this.renderDrawings();
    }
  }
  
  private async deleteDrawing(d: Drawing): Promise<void> {
  if (!this.data) return;

  if (this.drawEditDrawingId === d.id) {
    this.drawEditDrawingId = null;
    this.drawEditMode = null;
    this.drawEditPointIndex = null;
    this.drawEditHandleKind = null;
    this.drawEditPointerId = null;
    this.drawEditOriginalDrawing = null;
  }

  // Remove baked SVG file if it exists
  if (d.bakedPath) {
    const af = this.app.vault.getAbstractFileByPath(d.bakedPath);
    if (af instanceof TFile) {
        try {
          await this.app.fileManager.trashFile(af);
        } catch (err) {
          console.error("Zoom Map: failed to delete baked SVG", d.bakedPath, err);
        }
      }
  }

  this.data.drawings = (this.data.drawings ?? []).filter((x) => x.id !== d.id);
  await this.saveDataSoon();
  this.renderDrawings();
  new Notice("Drawing deleted.", 900);
}

  private onDrawingContextMenu(ev: MouseEvent, d: Drawing): void {
    this.closeMenu();

    const canApplyTextBox =
      d.kind === "rect" || d.kind === "polyline";
	
    const canEditGeometry =
      d.kind === "polygon" || d.kind === "polyline" ||
      d.kind === "rect" || d.kind === "circle";

    const items: ZMMenuItem[] = [
    {
      label: "Edit drawing…",
      action: () => {
        this.closeMenu();
        if (!this.data) return;
        const modal = new DrawingEditorModal(
          this.app,
          d,
          this.data.drawLayers ?? [],
          (res) => {
          this.stopEditDrawingGeometry(true);
          if (!this.data) return;
          if (res.action === "save" && res.drawing) {
            const updated = res.drawing;
            const idx = (this.data.drawings ?? []).findIndex(
              (x) => x.id === d.id,
            );
            if (idx >= 0 && this.data.drawings) {
              this.data.drawings[idx].layerId = updated.layerId;
              this.data.drawings[idx].style = updated.style;
              this.data.drawings[idx].visible = updated.visible;
              this.data.drawings[idx].rect = updated.rect;
              this.data.drawings[idx].circle = updated.circle;
              this.data.drawings[idx].polygon = updated.polygon;
			  this.data.drawings[idx].polyline = updated.polyline;

              delete this.data.drawings[idx].bakedPath;
              delete this.data.drawings[idx].bakedWidth;
              delete this.data.drawings[idx].bakedHeight;
            }
            void this.saveDataSoon();
            this.renderDrawings();
          } else if (res.action === "delete") {
            void this.deleteDrawing(d);
          }
        },
        );
        modal.open();
      },
    },
    ...(canEditGeometry
      ? [
          {
            label:
              this.drawEditDrawingId === d.id
                ? "Stop editing points"
                : (d.kind === "polygon" || d.kind === "polyline")
                  ? "Edit points…"
                  : "Edit shape…",
            action: () => {
              this.closeMenu();
              if (this.drawEditDrawingId === d.id) {
                this.stopEditDrawingGeometry(true);
              } else {
                this.stopEditDrawingGeometry(true);
                this.startEditDrawingGeometry(d);
              }
            },
          } as ZMMenuItem,
        ]
      : []),
    ...(this.plugin.settings.enableTextLayers && canApplyTextBox
      ? [
          {
            label: "Apply text box",
            children: [
              {
                label: "Custom",
                action: () => {
                  this.closeMenu();
                  this.applyDrawingAsTextBox(d, "custom");
                },
              },
              {
                label: "Auto",
                action: () => {
                  this.closeMenu();
                  this.applyDrawingAsTextBox(d, "auto");
                },
              },
            ],
          } as ZMMenuItem,
        ]
      : []),
    {
      label: "Delete drawing",
      action: () => {
        void this.deleteDrawing(d);
      },
    },
  ];

    this.openMenu = new ZMMenu(this.el.ownerDocument);
    this.openMenu.open(ev.clientX, ev.clientY, items);

    const outside = (event: Event) => {
      if (!this.openMenu) return;
      const t = event.target;
      if (t instanceof HTMLElement && this.openMenu.contains(t)) return;
      this.closeMenu();
    };
    const keyClose = (event: KeyboardEvent) => {
      if (event.key === "Escape") this.closeMenu();
    };
    const rightClickClose = () => this.closeMenu();

    document.addEventListener("pointerdown", outside, { capture: true });
	document.addEventListener("contextmenu", rightClickClose, { capture: true });
	document.addEventListener("keydown", keyClose, { capture: true });

	this.register(() => {
	  document.removeEventListener("pointerdown", outside, true);
	  document.removeEventListener("contextmenu", rightClickClose, true);
	  document.removeEventListener("keydown", keyClose, true);
	});
  }
  
  private getOrCreateDefaultDrawLayer(): DrawLayer {
    if (!this.data) {
      throw new Error("No marker data loaded");
    }
    this.data.drawLayers ??= [];
    let layer =
      this.data.drawLayers.find((l) => l.visible) ??
      this.data.drawLayers[0];
    if (!layer) {
      layer = {
        id: generateId("draw"),
        name: "Draw",
        visible: true,
        locked: false,
      };
      this.data.drawLayers.push(layer);
    }
    return layer;
  }

  private handleDrawClick(e: MouseEvent): boolean {
    if (!this.drawingMode) return false;
    if (!this.data) return false;

    const vpRect = this.viewportEl.getBoundingClientRect();
    const vx = e.clientX - vpRect.left;
    const vy = e.clientY - vpRect.top;
    const wx = (vx - this.tx) / this.scale;
    const wy = (vy - this.ty) / this.scale;
    const nx = clamp(wx / this.imgW, 0, 1);
    const ny = clamp(wy / this.imgH, 0, 1);

    const layerId =
      this.drawingActiveLayerId ??
      this.getOrCreateDefaultDrawLayer().id;

    // Polygon: ignore second click of a double-click (detail > 1).
    if ((this.drawingMode === "polygon" || this.drawingMode === "polyline") && e.detail > 1) {
      return true;
    }

    if (this.drawingMode === "rect") {
      if (!this.drawRectStart) {
        this.drawRectStart = { x: nx, y: ny };
        return true;
      }

      const start = this.drawRectStart;

      const draft: Drawing = {
        id: generateId("draw"),
        layerId,
        kind: "rect",
        visible: true,
        rect: { x0: start.x, y0: start.y, x1: nx, y1: ny },
        style: {
          strokeColor: "#ff0000",
          strokeWidth: 2,
          fillColor: "#ff0000",
          fillOpacity: 0.15,
        },
      };

      this.drawingMode = null;
      this.drawingActiveLayerId = null;
      this.drawRectStart = null;
      this.drawCircleCenter = null;
      this.drawPolygonPoints = [];
      if (this.drawDraftLayer) {
        this.drawDraftLayer.innerHTML = "";
      }

      const modal = new DrawingEditorModal(
        this.app,
        draft,
        this.data.drawLayers ?? [],
        (res) => {
        if (!this.data) return;
        if (res.action === "save" && res.drawing) {
          this.data.drawings ??= [];
          this.data.drawings.push(res.drawing);
          void this.saveDataSoon();
          this.renderDrawings();
        }
      },
      );
      modal.open();

      return true;
    }

    if (this.drawingMode === "circle") {
      if (!this.drawCircleCenter) {
        this.drawCircleCenter = { x: nx, y: ny };
        return true;
      }

      const center = this.drawCircleCenter;
      const radiusNorm = Math.hypot(nx - center.x, ny - center.y);

      const draft: Drawing = {
        id: generateId("draw"),
        layerId,
        kind: "circle",
        visible: true,
        circle: { cx: center.x, cy: center.y, r: radiusNorm },
        style: {
          strokeColor: "#ff0000",
          strokeWidth: 2,
          fillColor: "#ff0000",
          fillOpacity: 0.15,
        },
      };

      this.drawingMode = null;
      this.drawingActiveLayerId = null;
      this.drawRectStart = null;
      this.drawCircleCenter = null;
      this.drawPolygonPoints = [];
      if (this.drawDraftLayer) {
        this.drawDraftLayer.innerHTML = "";
      }

      const modal = new DrawingEditorModal(
        this.app,
        draft,
        this.data.drawLayers ?? [],
        (res) => {
        if (!this.data) return;
        if (res.action === "save" && res.drawing) {
          this.data.drawings ??= [];
          this.data.drawings.push(res.drawing);
          void this.saveDataSoon();
          this.renderDrawings();
        }
      },
      );
      modal.open();

      return true;
    }

    if (this.drawingMode === "polygon") {
      this.drawPolygonPoints.push({ x: nx, y: ny });
      return true;
    }
	
    if (this.drawingMode === "polyline") {
      this.drawPolygonPoints.push({ x: nx, y: ny });
      return true;
    }

    return false;
  }
  
  private finishPolygonDrawing(): void {
    if (!this.drawingMode || this.drawingMode !== "polygon") return;
    if (!this.data) return;
    if (this.drawPolygonPoints.length < 2) return;

    const layerId =
      this.drawingActiveLayerId ??
      this.getOrCreateDefaultDrawLayer().id;

    const points = [...this.drawPolygonPoints];

    const draft: Drawing = {
      id: generateId("draw"),
      layerId,
      kind: "polygon",
      visible: true,
      polygon: points,
      style: {
        strokeColor: "#ff0000",
        strokeWidth: 2,
        fillColor: "#ff0000",
        fillOpacity: 0.15,
      },
    };

    this.drawingMode = null;
    this.drawingActiveLayerId = null;
    this.drawRectStart = null;
    this.drawCircleCenter = null;
    this.drawPolygonPoints = [];
    if (this.drawDraftLayer) {
      this.drawDraftLayer.innerHTML = "";
    }

      const modal = new DrawingEditorModal(
        this.app,
        draft,
        this.data.drawLayers ?? [],
        (res) => {
      if (!this.data) return;
      if (res.action === "save" && res.drawing) {
        this.data.drawings ??= [];
        this.data.drawings.push(res.drawing);
        void this.saveDataSoon();
        this.renderDrawings();
      }
      },
      );
    modal.open();
  }
  
  private finishPolylineDrawing(): void {
    if (!this.drawingMode || this.drawingMode !== "polyline") return;
    if (!this.data) return;
    if (this.drawPolygonPoints.length < 2) return;

    const layerId =
      this.drawingActiveLayerId ??
      this.getOrCreateDefaultDrawLayer().id;

    const points = [...this.drawPolygonPoints];

    const draft: Drawing = {
      id: generateId("draw"),
      layerId,
      kind: "polyline",
      visible: true,
      polyline: points,
      style: {
        strokeColor: "#ff0000",
        strokeWidth: 2,
        arrowEnd: true,
        distanceLabel: false,
      },
    };

    this.drawingMode = null;
    this.drawingActiveLayerId = null;
    this.drawRectStart = null;
    this.drawCircleCenter = null;
    this.drawPolygonPoints = [];
    if (this.drawDraftLayer) {
      this.drawDraftLayer.innerHTML = "";
    }

      const modal = new DrawingEditorModal(
        this.app,
        draft,
        this.data.drawLayers ?? [],
        (res) => {
      if (!this.data) return;
      if (res.action === "save" && res.drawing) {
        this.data.drawings ??= [];
        this.data.drawings.push(res.drawing);
        void this.saveDataSoon();
        this.renderDrawings();
      }
      },
      );
    modal.open();
  }
  
  private updateDrawPreview(e: PointerEvent): boolean {
    if (!this.drawingMode) return false;
    if (!this.drawDraftLayer) return false;

    const vpRect = this.viewportEl.getBoundingClientRect();
    const vx = e.clientX - vpRect.left;
    const vy = e.clientY - vpRect.top;
    const wx = (vx - this.tx) / this.scale;
    const wy = (vy - this.ty) / this.scale;
    const nx = clamp(wx / this.imgW, 0, 1);
    const ny = clamp(wy / this.imgH, 0, 1);

    this.drawDraftLayer.innerHTML = "";

    if (this.drawingMode === "rect") {
      if (!this.drawRectStart) return false;

      const start = this.drawRectStart;
      const x0 = start.x * this.imgW;
      const y0 = start.y * this.imgH;
      const x1 = nx * this.imgW;
      const y1 = ny * this.imgH;

      const x = Math.min(x0, x1);
      const y = Math.min(y0, y1);
      const w = Math.abs(x0 - x1);
      const h = Math.abs(y0 - y1);

      const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      r.setAttribute("x", String(x));
      r.setAttribute("y", String(y));
      r.setAttribute("width", String(w));
      r.setAttribute("height", String(h));
      r.classList.add("zm-draw__shape");
      r.setAttribute("stroke", "#ff0000");
      r.setAttribute("stroke-width", "2");
      r.setAttribute("fill", "none");

      this.drawDraftLayer.appendChild(r);
      return true;
    }

    if (this.drawingMode === "circle") {
      if (!this.drawCircleCenter) return false;

      const cx = this.drawCircleCenter.x * this.imgW;
      const cy = this.drawCircleCenter.y * this.imgH;
      const px = nx * this.imgW;
      const py = ny * this.imgH;
      const radius = Math.hypot(px - cx, py - cy);

      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", String(cx));
      c.setAttribute("cy", String(cy));
      c.setAttribute("r", String(radius));
      c.classList.add("zm-draw__shape");
      c.setAttribute("stroke", "#ff0000");
      c.setAttribute("stroke-width", "2");
      c.setAttribute("fill", "none");

      this.drawDraftLayer.appendChild(c);
      return true;
    }

    if (this.drawingMode === "polygon") {
      if (this.drawPolygonPoints.length === 0) return false;

      const all = [...this.drawPolygonPoints, { x: nx, y: ny }];

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      let dAttr = "";
      all.forEach((p, idx) => {
        const ax = p.x * this.imgW;
        const ay = p.y * this.imgH;
        dAttr += idx === 0 ? `M ${ax} ${ay}` : ` L ${ax} ${ay}`;
      });
      path.setAttribute("d", dAttr);
      path.classList.add("zm-draw__shape");
      path.setAttribute("stroke", "#ff0000");
      path.setAttribute("stroke-width", "2");
      path.setAttribute("fill", "none");

      this.drawDraftLayer.appendChild(path);
      return true;
    }
	
    if (this.drawingMode === "polyline") {
      if (this.drawPolygonPoints.length === 0) return false;

      const all = [...this.drawPolygonPoints, { x: nx, y: ny }];

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      let dAttr = "";
      all.forEach((p, idx) => {
        const ax = p.x * this.imgW;
        const ay = p.y * this.imgH;
        dAttr += idx === 0 ? `M ${ax} ${ay}` : ` L ${ax} ${ay}`;
      });
      path.setAttribute("d", dAttr);
      path.classList.add("zm-draw__shape");
      path.setAttribute("stroke", "#ff0000");
      path.setAttribute("stroke-width", "2");
      path.setAttribute("fill", "none");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");

      this.drawDraftLayer.appendChild(path);
      return true;
    }	

    return false;
  }
  
  private saveMeasurementAsPolyline(): void {
    if (!this.plugin.settings.enableDrawing) return;
    if (!this.data) return;
    if (this.measurePts.length < 2) {
      new Notice("No measurement to save (need at least 2 points).", 2500);
      return;
    }

    const layerId = this.getOrCreateDefaultDrawLayer().id;
    const points = this.measurePts.map((p) => ({ x: p.x, y: p.y }));

    const draft: Drawing = {
      id: generateId("draw"),
      layerId,
      kind: "polyline",
      visible: true,
      polyline: points,
      style: {
        strokeColor: this.plugin.settings.measureLineColor ?? "#ff0000",
        strokeWidth: this.plugin.settings.measureLineWidth ?? 2,
        arrowEnd: true,
        distanceLabel: true,
      },
    };

    new DrawingEditorModal(
      this.app,
      draft,
      this.data.drawLayers ?? [],
      (res) => {
      if (!this.data) return;
      if (res.action === "save" && res.drawing) {
        this.data.drawings ??= [];
        this.data.drawings.push(res.drawing);
        void this.saveDataSoon();
        this.renderDrawings();
        new Notice("Saved as polyline.", 1200);
      }
    },
    ).open();
  }
  
  private renderAll(): void {
    this.worldEl.style.width = `${this.imgW}px`;
    this.worldEl.style.height = `${this.imgH}px`;

    this.overlaysEl.style.width = `${this.imgW}px`;
    this.overlaysEl.style.height = `${this.imgH}px`;

    this.markersEl.style.width = `${this.imgW}px`;
    this.markersEl.style.height = `${this.imgH}px`;

    if (this.measureEl) {
      this.measureEl.style.width = `${this.imgW}px`;
      this.measureEl.style.height = `${this.imgH}px`;
    }

    if (this.drawEl) {
      this.drawEl.style.width = `${this.imgW}px`;
      this.drawEl.style.height = `${this.imgH}px`;
    }
	
	if (this.textSvgWrap) {
      this.textSvgWrap.style.width = `${this.imgW}px`;
      this.textSvgWrap.style.height = `${this.imgH}px`;
    }

    if (this.textHitEl) {
      this.textHitEl.style.width = `${this.imgW}px`;
      this.textHitEl.style.height = `${this.imgH}px`;
    }

    if (this.textEditEl) {
      this.textEditEl.style.width = `${this.imgW}px`;
      this.textEditEl.style.height = `${this.imgH}px`;
    }

    this.markersEl.empty();
    this.renderMarkersOnly();
    this.renderMeasure();
	this.renderDrawingEditHandles();
    this.renderCalibrate();
    this.renderDrawings();

    if (this.isCanvas()) this.renderCanvas();
	
	this.renderTextLayers();
  }

  private renderMarkersOnly(): void {
    if (!this.data) return;
    const s = this.scale;

    this.markersEl.empty();
    if (this.hudMarkersEl) this.hudMarkersEl.empty();

    const visibleLayers = new Set(
      this.data.layers.filter((l) => l.visible).map((l) => l.id),
    );

    const rank = (m: Marker) => (m.type === "sticker" ? 0 : 1);
    const toRender = this.data.markers
      .filter((m) => visibleLayers.has(m.layer))
      .sort((a, b) => rank(a) - rank(b));

    const vpRect = this.viewportEl.getBoundingClientRect();
    const vw = vpRect.width || 1;
    const vh = vpRect.height || 1;

    for (const m of toRender) {
      const isHud = m.anchorSpace === "viewport";
      const container = isHud ? this.hudMarkersEl : this.markersEl;
      if (!container) continue;

      let leftScreen: number;
      let topScreen: number;

      if (isHud) {
        const hx = m.hudX ?? (m.x ?? 0.5) * vw;
        const hy = m.hudY ?? (m.y ?? 0.5) * vh;
        leftScreen = hx;
        topScreen = hy;
      } else {
        leftScreen = m.x * this.imgW;
        topScreen = m.y * this.imgH;
      }

      const hostClasses = ["zm-marker"];
      if (isHud) hostClasses.push("zm-hud-marker");

      const host = container.createDiv({ cls: hostClasses.join(" ") });
      host.dataset.id = m.id;
      host.style.left = `${leftScreen}px`;
      host.style.top = `${topScreen}px`;
      host.style.zIndex = m.type === "sticker" ? "5" : "10";
      host.ondragstart = (ev) => ev.preventDefault();

      if (m.type !== "sticker") {
        const minZ = getMinZoom(m);
        const maxZ = getMaxZoom(m);
        if (typeof minZ === "number") host.dataset.minz = String(minZ);
        if (typeof maxZ === "number") host.dataset.maxz = String(maxZ);
        const visibleByZoom =
          (minZ === undefined || (Number.isFinite(minZ) && s >= minZ)) &&
          (maxZ === undefined || (Number.isFinite(maxZ) && s <= maxZ));
        if (!visibleByZoom) host.classList.add("zm-hidden");
      }

      if (this.isLayerLocked(m.layer)) host.classList.add("zm-marker--locked");

      let icon: HTMLImageElement;

      if (m.type === "sticker") {
        const size = Math.max(1, Math.round(m.stickerSize ?? 64));
        const anch = host.createDiv({ cls: "zm-marker-anchor" });
        anch.style.transform = `translate(${-size / 2}px, ${-size / 2}px)`;
        icon = anch.createEl("img", { cls: "zm-marker-icon" });
        icon.src = this.resolveResourceUrl(m.stickerPath ?? "");
        icon.style.width = `${size}px`;
        icon.draggable = false;
        anch.appendChild(icon);
      } else {
        const scaleLike = isScaleLikeSticker(m);

        let effectiveKey = m.iconKey;
        if (m.type === "swap") {
          const frame = this.getSwapFrameForMarker(m);
          if (frame?.iconKey) {
            effectiveKey = frame.iconKey;
          }
        }

        const info = this.getIconInfo(effectiveKey);

        let imgUrl = info.imgUrl;
        const markerColor = m.iconColor?.trim();
        if (markerColor && isSvgDataUrl(imgUrl)) {
          imgUrl = this.getTintedSvgDataUrl(imgUrl, markerColor);
        }

        if (isHud) {
          const anch = host.createDiv({ cls: "zm-marker-anchor" });
          anch.style.transform = `translate(${-info.anchorX}px, ${-info.anchorY}px)`;
          icon = anch.createEl("img", { cls: "zm-marker-icon" });
          icon.src = imgUrl;
          icon.style.width = `${info.size}px`;
          icon.draggable = false;
		  
		  if (info.rotationDeg) {
		    icon.style.transform = `rotate(${info.rotationDeg}deg)`;
		  }
		  
          anch.appendChild(icon);
        } else if (scaleLike) {
          const anch = host.createDiv({ cls: "zm-marker-anchor" });
          anch.style.transform = `translate(${-info.anchorX}px, ${-info.anchorY}px)`;
          icon = anch.createEl("img", { cls: "zm-marker-icon" });
          icon.src = imgUrl;
          icon.style.width = `${info.size}px`;
          icon.draggable = false;
		  
		  if (info.rotationDeg) {
		    icon.style.transform = `rotate(${info.rotationDeg}deg)`;
		  }
		  
          anch.appendChild(icon);
        } else {
          const inv = host.createDiv({ cls: "zm-marker-inv" });
          const invScale = this.cfg.responsive ? 1 : 1 / s;
          inv.style.transform = `scale(${invScale})`;
          const anch = inv.createDiv({ cls: "zm-marker-anchor" });
          anch.style.transform = `translate(${-info.anchorX}px, ${-info.anchorY}px)`;
          icon = anch.createEl("img", { cls: "zm-marker-icon" });
          icon.src = imgUrl;
          icon.style.width = `${info.size}px`;
          icon.draggable = false;
		  
		  if (info.rotationDeg) {
		    icon.style.transform = `rotate(${info.rotationDeg}deg)`;
		  }
		  
          anch.appendChild(icon);
        }
      }
	  
      // Always-visible tooltip label (caption)
      if (
        m.type !== "sticker" &&
        !!m.tooltipLabelAlways &&
        typeof m.tooltip === "string" &&
        m.tooltip.trim().length > 0
      ) {
        const effectiveKey = (() => {
          if (m.type === "swap") {
            const fr = this.getSwapFrameForMarker(m);
            if (fr?.iconKey) return fr.iconKey;
          }
          return m.iconKey ?? this.plugin.settings.defaultIconKey;
        })();

        const info = this.getIconInfo(effectiveKey);
		const scaleLike = isScaleLikeSticker(m);
        const pos = m.tooltipLabelPosition === "above" ? "above" : "below";
        const gap = 6;
        const offX =
          typeof m.tooltipLabelOffsetX === "number" && Number.isFinite(m.tooltipLabelOffsetX) ? m.tooltipLabelOffsetX : 0;
        const offY =
          typeof m.tooltipLabelOffsetY === "number" && Number.isFinite(m.tooltipLabelOffsetY) ? m.tooltipLabelOffsetY : 0;

        const xOff = ((info.size / 2) - info.anchorX) + offX;

        // Place label above/below the icon bounds (relative to the anchor)
        const yOffBase = pos === "above"
          ? -(info.anchorY + gap)                 // icon top - gap
          : (info.size - info.anchorY + gap);     // icon bottom + gap
		const yOff = yOffBase + offY;

        let parent: HTMLElement = host;
        if (!isHud && !scaleLike) {
          const invScale = this.cfg.responsive ? 1 : 1 / s;
          let inv = host.querySelector<HTMLElement>(".zm-marker-inv");
          if (!inv) {
            inv = host.createDiv({ cls: "zm-marker-inv zm-marker-inv--label" });
            inv.style.transform = `scale(${invScale})`;
          }
          parent = inv;
        }

        const label = parent.createDiv({ cls: "zm-marker-label" });
        label.textContent = m.tooltip.trim();

        // Position relative to the anchor (0,0), but shifted to icon center
        label.style.left = `${xOff}px`;
        label.style.top = `${yOff}px`;
        label.style.transform = pos === "above"
          ? "translate(-50%, -100%)"
          : "translate(-50%, 0)";
      }
      
      if (!this.cfg.displayOnly) {

      if (m.type !== "sticker") {
        host.addEventListener("mouseenter", (ev) =>
          this.onMarkerEnter(ev, m, host),
        );
        host.addEventListener("mouseleave", () => this.hideTooltipSoon());
      }

      host.addEventListener("click", (ev) => {
        if (this.measuring || this.calibrating) return;

        ev.stopPropagation();
        if (this.suppressClickMarkerId === m.id || this.dragMoved) return;
        if (m.type === "sticker") return;
		if (m.type === "switch") return;
        if (m.type === "dice") {
          void this.rollDiceMarker(m);
          return;
        }
        this.openMarkerLink(m);
      });
	  
      host.addEventListener("mousedown", (ev: MouseEvent) => {
        if (ev.button !== 1) return;
        if (!this.plugin.settings.middleClickOpensLinkInNewTab) return;
        if (this.measuring || this.calibrating) return;
        if (m.type === "sticker") return;
        ev.preventDefault();
        ev.stopPropagation();
      });
	  
      host.addEventListener("auxclick", (ev: MouseEvent) => {
        if (ev.button !== 1) return;
        if (!this.plugin.settings.middleClickOpensLinkInNewTab) return;
        if (this.measuring || this.calibrating) return;
        ev.preventDefault();
        ev.stopPropagation();
        if (this.suppressClickMarkerId === m.id || this.dragMoved) return;
        if (m.type === "sticker") return;
        this.openMarkerLink(m, { newTab: true });
      });

      host.addEventListener("pointerdown", (e: PointerEvent) => {
        if (this.measuring || this.calibrating) return;

        if (e.button === 1 && this.plugin.settings.middleClickOpensLinkInNewTab) {
          if (m.type === "sticker") return;
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        e.stopPropagation();
        if (e.button !== 0) return;
        if (this.isLayerLocked(m.layer)) return;
        this.hideTooltipSoon(0);

        this.plugin.setActiveMap(this);

        this.draggingMarkerId = m.id;
        this.dragMoved = false;

        const vpRectNow = this.viewportEl.getBoundingClientRect();
        const vx = e.clientX - vpRectNow.left;
        const vy = e.clientY - vpRectNow.top;

        if (isHud) {
          this.dragAnchorOffset = {
            dx: vx - leftScreen,
            dy: vy - topScreen,
          };
        } else {
          const wxPointer = (vx - this.tx) / this.scale;
          const wyPointer = (vy - this.ty) / this.scale;
          const markerWx = m.x * this.imgW;
          const markerWy = m.y * this.imgH;

          this.dragAnchorOffset = {
            dx: wxPointer - markerWx,
            dy: wyPointer - markerWy,
          };
        }

        host.classList.add("zm-marker--dragging");
        document.body.classList.add("zm-cursor-grabbing");
        host.setPointerCapture?.(e.pointerId);
        e.preventDefault();
      });

      host.addEventListener("pointerup", () => {
        if (this.draggingMarkerId === m.id) {
          host.classList.remove("zm-marker--dragging");
          document.body.classList.remove("zm-cursor-grabbing");
        }
      });

      host.addEventListener("contextmenu", (ev: MouseEvent) => {
        ev.preventDefault();
        ev.stopPropagation();
        this.closeMenu();
		
        if (m.type === "switch") {
          if (!ev.altKey) {
            void this.applySwitchPin(m);
            return;
          }

          const items: ZMMenuItem[] = [
            {
              label: "Switch base now",
              action: () => {
                this.closeMenu();
                void this.applySwitchPin(m);
              },
            },
            {
              label: "Edit switch pin…",
              action: () => {
                this.closeMenu();
                if (!this.data) return;

                const bases = this.getBasesNormalized();
                if (!bases.length) {
                  new Notice("No base images configured.", 2500);
                  return;
                }

                this.openSwitchPinModal(
                  {
                    basePaths: bases,
                    initialIconKey: (m.iconKey ?? this.plugin.settings.defaultIconKey).trim() || this.plugin.settings.defaultIconKey,
                    initialRotate: !!m.switchRotate || !(typeof m.switchBase === "string" && m.switchBase.trim().length > 0),
                    initialSwitchBase: m.switchBase,
                    initialScaleLikeSticker: !!m.scaleLikeSticker,
                    initialHud: m.anchorSpace === "viewport",
                  },
                  (res) => {
                    if (!this.data) return;
                    if (res.action !== "save" || !res.value) return;

                    m.iconKey = res.value.iconKey;

                    if (res.value.rotate) {
                      m.switchRotate = true;
                      delete m.switchBase;
                    } else {
                      delete m.switchRotate;
                      m.switchBase = (res.value.switchBase ?? "").trim() || undefined;
                    }

                    if (res.value.scaleLikeSticker) m.scaleLikeSticker = true;
                    else delete m.scaleLikeSticker;

                    if (res.value.placeAsHudPin) {
                      if (m.anchorSpace !== "viewport") {
                        m.anchorSpace = "viewport";
                        m.hudX = (m.hudX ?? 0);
                        m.hudY = (m.hudY ?? 0);
                        this.classifyHudMetaFromCurrentPosition(m, this.viewportEl.getBoundingClientRect());
                      }
                    } else {
                      // Keep coordinates as-is; only switch rendering space back to world.
                      delete m.anchorSpace;
                      delete m.hudX;
                      delete m.hudY;
                      delete m.hudModeX;
                      delete m.hudModeY;
                      delete m.hudLastWidth;
                      delete m.hudLastHeight;
                    }

                    void this.saveDataSoon();
                    this.renderMarkersOnly();
                  },
                );
              },
            },
            {
              label: "Delete switch pin",
              action: () => {
                this.closeMenu();
                this.deleteMarker(m);
              },
            },
          ];

          this.openMenu = new ZMMenu(this.el.ownerDocument);
          this.openMenu.open(ev.clientX, ev.clientY, items);
          return;
        }
		
        if (m.type === "dice") {
          const items: ZMMenuItem[] = [
            {
              label: "Roll dice",
              action: () => {
                this.closeMenu();
                void this.rollDiceMarker(m);
              },
            },
            {
              label: "Edit dice pin…",
              action: () => {
                this.closeMenu();
                if (!this.data) return;

                new DicePinModal(
                  this.app,
                  this.plugin,
                  {
                    iconKey: (m.iconKey ?? this.plugin.settings.defaultIconKey).trim(),
                    rolls: m.diceRolls ?? [{ count: 1, sides: 20 }],
                    scaleLikeSticker: !!m.scaleLikeSticker,
                    placeAsHudPin: m.anchorSpace === "viewport",
                    render3d: !!m.diceRender3d,
                  },
                  (res) => {
                    if (!this.data) return;
                    if (res.action !== "save") return;

                    m.type = "dice";
                    m.iconKey = res.value.iconKey;
                    m.diceRolls = res.value.rolls;
                    if (res.value.render3d) m.diceRender3d = true;
                    else delete m.diceRender3d;

                    if (res.value.scaleLikeSticker) m.scaleLikeSticker = true;
                    else delete m.scaleLikeSticker;

                    const wantHud = !!res.value.placeAsHudPin;
                    const isHud = m.anchorSpace === "viewport";
                    const vpRect = this.viewportEl.getBoundingClientRect();

                    if (wantHud && !isHud) {
                      const pos = this.worldNormToViewportPx(m.x, m.y);
                      m.anchorSpace = "viewport";
                      m.hudX = pos.x;
                      m.hudY = pos.y;
                      this.classifyHudMetaFromCurrentPosition(m, vpRect);
                    } else if (!wantHud && isHud) {
                      const hx =
                        typeof m.hudX === "number"
                          ? m.hudX
                          : (m.x ?? 0.5) * (vpRect.width || 1);
                      const hy =
                        typeof m.hudY === "number"
                          ? m.hudY
                          : (m.y ?? 0.5) * (vpRect.height || 1);
                      const world = this.viewportPxToWorldNorm(hx, hy);
                      m.x = world.x;
                      m.y = world.y;
                      delete m.anchorSpace;
                      delete m.hudX;
                      delete m.hudY;
                      delete m.hudModeX;
                      delete m.hudModeY;
                      delete m.hudLastWidth;
                      delete m.hudLastHeight;
                    }

                    if (!m.tooltip || m.tooltip.trim() === diceRollsToFormula(m.diceRolls ?? [])) {
                      m.tooltip = diceRollsToFormula(res.value.rolls);
                    }

                    void this.saveDataSoon();
                    this.renderMarkersOnly();
                  },
                ).open();
              },
            },
            {
              label: "Delete dice pin",
              action: () => {
                this.closeMenu();
                this.deleteMarker(m);
              },
            },
          ];

          this.openMenu = new ZMMenu(this.el.ownerDocument);
          this.openMenu.open(ev.clientX, ev.clientY, items);
          return;
        }
		
        if (m.type === "pin") {
          const items: ZMMenuItem[] = [
            {
              label: "Open party note",
              action: () => {
                this.closeMenu();
                this.openMarkerLink(m);
              },
            },
            {
              label: "Recalculate party",
              action: () => {
                this.closeMenu();
                void this.updatePingNoteForMarker(m).then(() => {
                  new Notice("Party note updated.", 1200);
                });
              },
            },
            {
              label: "Delete party pin",
              action: () => {
                this.closeMenu();
                this.deleteMarker(m);
              },
            },
          ];

          this.openMenu = new ZMMenu(this.el.ownerDocument);
          this.openMenu.open(ev.clientX, ev.clientY, items);
          return;
        }

        if (m.type === "swap") {
          const preset = m.swapKey
            ? this.findSwapPresetById(m.swapKey)
            : undefined;
          if (!preset) return;

          if (!ev.altKey) {
            this.advanceSwapPin(m);
            void this.saveDataSoon();
            this.renderMarkersOnly();
            return;
          }

          const items: ZMMenuItem[] = [
            {
              label: "Edit swap pin links… ",
              action: () => {
                this.closeMenu();
                if (!this.data) return;

                new SwapLinksEditorModal(
                  this.app,
                  this.plugin,
                  m,
                  preset,
                  (res: SwapLinksEditorResult) => {
                    if (res.action !== "save") return;
                    if (!this.data) return;

                    if (res.swapLinks && Object.keys(res.swapLinks).length > 0) {
                      m.swapLinks = res.swapLinks;
                    } else {
                      delete m.swapLinks;
                    }

                    void this.saveDataSoon();
                    this.renderMarkersOnly();
                  },
                ).open();
              },
            },
            {
              label: "Pin sizes for this map…",
              action: () => {
                this.closeMenu();
                const fr = this.getSwapFrameForMarker(m);
                const key =
                  (fr?.iconKey ?? m.iconKey ?? this.plugin.settings.defaultIconKey).trim();
                this.openPinSizeEditor(key);
              },
            },
            {
              label: "Edit swap preset…",
              action: () => {
                this.closeMenu();
                new SwapFramesEditorModal(
                  this.app,
                  this.plugin,
                  preset,
                  (updated) => {
                    preset.name = updated.name;
                    preset.frames = updated.frames;
                    preset.defaultHud = updated.defaultHud;
                    preset.defaultScaleLikeSticker =
                      updated.defaultScaleLikeSticker;
                    preset.hoverPopover = updated.hoverPopover;
					preset.layerName = updated.layerName;
                    void this.plugin.saveSettings();
                    this.renderMarkersOnly();
                  },
                ).open();
              },
            },
            {
              label: "Delete swap pin",
              action: () => {
                this.closeMenu();
                this.deleteMarker(m);
              },
            },
          ];

          this.openMenu = new ZMMenu(this.el.ownerDocument);
          this.openMenu.open(ev.clientX, ev.clientY, items);

          const outside = (event: Event) => {
            if (!this.openMenu) return;
            const t = event.target;
            if (t instanceof HTMLElement && this.openMenu.contains(t)) return;
            this.closeMenu();
          };
          const keyClose = (event: KeyboardEvent) => {
            if (event.key === "Escape") this.closeMenu();
          };
          const rightClickClose = () => this.closeMenu();

          document.addEventListener("pointerdown", outside, {
            capture: true,
          });
          document.addEventListener("contextmenu", rightClickClose, {
            capture: true,
          });
          document.addEventListener("keydown", keyClose, { capture: true });

          this.register(() => {
            document.removeEventListener("pointerdown", outside, true);
            document.removeEventListener("contextmenu", rightClickClose, true);
            document.removeEventListener("keydown", keyClose, true);
          });

          return;
        }

        const items: ZMMenuItem[] = [
          {
            label: m.type === "sticker" ? "Edit sticker" : "Edit marker",
            action: () => {
              if (!this.data) return;
              const modal = new MarkerEditorModal(
                this.app,
                this.plugin,
                this.data,
                m,
                (res) => {
                  if (res.action === "save" && res.marker && this.data) {
                    const idx = this.data.markers.findIndex(
                      (mm) => mm.id === m.id,
                    );
                    if (idx >= 0) this.data.markers[idx] = res.marker;
                    void this.saveDataSoon();
                    this.renderMarkersOnly();
                  } else if (res.action === "delete") {
                    this.deleteMarker(m);
                  }
                },
              );
              this.closeMenu();
              modal.open();
            },
          },
          {
            label:
              m.type === "sticker" ? "Delete sticker" : "Delete marker",
            action: () => {
              this.deleteMarker(m);
              this.closeMenu();
            },
          },
        ];

        if (m.type !== "sticker") {
          items.push({
            label: "Pin sizes for this map…",
            action: () => {
              const key =
                m.iconKey ?? this.plugin.settings.defaultIconKey;
              this.openPinSizeEditor(key);
              this.closeMenu();
            },
          });
        }

        this.openMenu = new ZMMenu(this.el.ownerDocument);
        this.openMenu.open(ev.clientX, ev.clientY, items);

        const outside = (event: Event) => {
          if (!this.openMenu) return;
          const t = event.target;
          if (t instanceof HTMLElement && this.openMenu.contains(t))
            return;
          this.closeMenu();
        };
        const keyClose = (event: KeyboardEvent) => {
          if (event.key === "Escape") this.closeMenu();
        };
        const rightClickClose = () => this.closeMenu();

        document.addEventListener("pointerdown", outside, { capture: true });
		document.addEventListener("contextmenu", rightClickClose, { capture: true });
		document.addEventListener("keydown", keyClose, { capture: true });

		this.register(() => {
		  document.removeEventListener("pointerdown", outside, true);
		  document.removeEventListener("contextmenu", rightClickClose, true);
		  document.removeEventListener("keydown", keyClose, true);
		});
      });
      }
    }
  }

  private onMarkerEnter(ev: MouseEvent, m: Marker, hostEl: HTMLElement): void {
    if (m.type === "sticker") return;
	if (this.measuring || this.calibrating) return;

    let link: string | undefined;
    let hoverOverride = false;

    if (m.type === "swap") {
	  link = this.getSwapEffectiveLink(m);

      if (m.swapKey) {
        const preset = this.findSwapPresetById(m.swapKey);
        hoverOverride = !!preset?.hoverPopover;
      }
    } else {
      link = m.link;
    }

    const hasTooltipText = !!m.tooltip && m.tooltip.trim().length > 0;
    const wantLinkNameTooltip =
      !!this.plugin.settings.showLinkFileNameInTooltip && !!link;
    const wantInternalTooltip =
      (hasTooltipText && (!!m.tooltipAlwaysOn || !link)) || wantLinkNameTooltip;

    if (link) {
      const workspace = this.app.workspace;

      const forcePopover =
        this.plugin.settings.forcePopoverWithoutModKey === true || hoverOverride === true;

      this.applyGlobalHoverPopoverStyleVars();
      const eventForPopover = forcePopover
        ? new MouseEvent("mousemove", {
            clientX: ev.clientX,
            clientY: ev.clientY,
            bubbles: true,
            cancelable: true,
            ctrlKey: true,
            metaKey: true,
          })
        : ev;

      workspace.trigger("hover-link", {
        event: eventForPopover,
        source: "zoom-map",
        hoverParent: this,
        targetEl: hostEl,
        linktext: link,
        sourcePath: this.cfg.sourcePath,
      });

      if (wantInternalTooltip) {
        const title = wantLinkNameTooltip ? this.getLinkDisplayName(link) : undefined;
        this.showInternalTooltip(ev, m, { title });
      }
      return;
    }

    if (wantInternalTooltip) {
      this.showInternalTooltip(ev, m);
    }
  }

  private getLinkDisplayName(link: string): string {
    const f = this.resolveTFile(link, this.cfg.sourcePath);
    if (f) return f.basename;
    const raw = (link ?? "").split("#")[0] ?? "";
    return basename(raw);
  }

  private showInternalTooltip(ev: MouseEvent, m: Marker, opts?: { title?: string }): void {
    if (!this.ready) return;

    const text = (m.tooltip ?? "").trim();
    const title = (opts?.title ?? "").trim();
    if (!text && !title) return;

    if (!this.tooltipEl) {
      this.tooltipEl = this.hudClipEl.createDiv({ cls: "zm-tooltip" });
      this.tooltipEl.addEventListener("mouseenter", () =>
        this.cancelHideTooltip(),
      );
      this.tooltipEl.addEventListener("mouseleave", () =>
        this.hideTooltipSoon(),
      );
    }

    this.tooltipEl.style.maxWidth = `${
      this.plugin.settings.hoverMaxWidth ?? 360
    }px`;
    this.tooltipEl.style.maxHeight = `${
      this.plugin.settings.hoverMaxHeight ?? 260
    }px`;

    this.cancelHideTooltip();
    this.tooltipEl.empty();

    if (title) this.tooltipEl.createEl("div", { cls: "zm-tooltip__title", text: title });
    if (text) this.tooltipEl.createEl("div", { cls: "zm-tooltip__body", text });

    this.positionTooltip(ev.clientX, ev.clientY);
    this.tooltipEl.classList.add("zm-tooltip-visible");
  }

  private positionTooltip(clientX: number, clientY: number): void {
    if (!this.tooltipEl) return;
    const pad = 12;
    const vpRect = this.hudClipEl.getBoundingClientRect();
    let x = clientX - vpRect.left + pad;
    let y = clientY - vpRect.top + pad;

    const rect = this.tooltipEl.getBoundingClientRect();
    const vw = vpRect.width;
    const vh = vpRect.height;

    if (x + rect.width > vw) x = clientX - vpRect.left - rect.width - pad;
    if (x < 0) x = pad;
    if (y + rect.height > vh) y = clientY - vpRect.top - rect.height - pad;
    if (y < 0) y = pad;

    setCssProps(this.tooltipEl, { left: `${x}px`, top: `${y}px` });
  }

  private hideTooltipSoon(delay = 150): void {
    if (!this.tooltipEl) return;
    this.cancelHideTooltip();
    this.tooltipHideTimer = window.setTimeout(() => {
      this.tooltipEl?.classList.remove("zm-tooltip-visible");
    }, delay);
  }

  private cancelHideTooltip(): void {
    if (this.tooltipHideTimer !== null) {
      window.clearTimeout(this.tooltipHideTimer);
      this.tooltipHideTimer = null;
    }
  }

  private getIconInfo(iconKey?: string): {
  imgUrl: string;
  size: number;
  anchorX: number;
  anchorY: number;
  rotationDeg: number;
} {
  const key = iconKey ?? this.plugin.settings.defaultIconKey;
  const profile =
    this.plugin.settings.icons.find((i) => i.key === key) ??
    this.plugin.builtinIcon();

  const baseSize = profile.size;
  const overrideSize = this.data?.pinSizeOverrides?.[key];
  const size =
    overrideSize && Number.isFinite(overrideSize) && overrideSize > 0
      ? overrideSize
      : baseSize;

  const imgUrl = this.resolveResourceUrl(profile.pathOrDataUrl);
  const rotationDeg = profile.rotationDeg ?? 0;

  return {
    imgUrl,
    size,
    anchorX: profile.anchorX,
    anchorY: profile.anchorY,
    rotationDeg,
  };
}
  
  private getIconDefaultLink(iconKey?: string): string | undefined {
    const key = iconKey ?? this.plugin.settings.defaultIconKey;
    const icon = this.plugin.settings.icons.find((i) => i.key === key);
    const raw = icon?.defaultLink;
    if (!raw) return undefined;
    const trimmed = raw.trim();
    return trimmed.length ? trimmed : undefined;
  }
  
  private classifyHudMetaFromCurrentPosition(m: Marker, vpRect: DOMRect): void {
    const W = vpRect.width || 1;
    const H = vpRect.height || 1;
    const centerX = W / 2;
    const centerY = H / 2;
    const eps = 1;

    let hudX = m.hudX ?? 0;
    let hudY = m.hudY ?? 0;

    let modeX: "left" | "right" | "center";
    if (Math.abs(hudX - centerX) <= eps) {
      modeX = "center";
      hudX = centerX;
    } else if (hudX > centerX) {
      modeX = "right";
    } else {
      modeX = "left";
    }

    let modeY: "top" | "bottom" | "center";
    if (Math.abs(hudY - centerY) <= eps) {
      modeY = "center";
      hudY = centerY;
    } else if (hudY > centerY) {
      modeY = "bottom";
    } else {
      modeY = "top";
    }

    m.anchorSpace = "viewport";
    m.hudX = hudX;
    m.hudY = hudY;
    m.hudModeX = modeX;
    m.hudModeY = modeY;
    m.hudLastWidth = W;
    m.hudLastHeight = H;
    m.x = W > 0 ? hudX / W : 0;
    m.y = H > 0 ? hudY / H : 0;
  }
  
  private updateHudPinsForResize(vpRect: DOMRect): void {
    if (!this.data) return;

    const W = vpRect.width || 1;
    const H = vpRect.height || 1;
    const centerX = W / 2;
    const centerY = H / 2;

    for (const m of this.data.markers) {
      if (m.anchorSpace !== "viewport") continue;

      // Initialize HUD metadata for pins from older dev builds
      if (
        !Number.isFinite(m.hudLastWidth ?? NaN) ||
        !Number.isFinite(m.hudLastHeight ?? NaN)
      ) {
        if (typeof m.hudX !== "number" || typeof m.hudY !== "number") {
          const approxX = (m.x ?? 0.5) * W;
          const approxY = (m.y ?? 0.5) * H;
          m.hudX = approxX;
          m.hudY = approxY;
        }
        this.classifyHudMetaFromCurrentPosition(m, vpRect);
        continue;
      }

      const lastW = m.hudLastWidth ?? W;
      const lastH = m.hudLastHeight ?? H;
      const dW = W - lastW;
      const dH = H - lastH;

      let hudX = m.hudX ?? (m.x ?? 0.5) * W;
      let hudY = m.hudY ?? (m.y ?? 0.5) * H;

      const modeX = m.hudModeX ?? "center";
      if (modeX === "left") {
        // stick to left edge, do not follow right edge
      } else if (modeX === "right") {
        hudX += dW;
        if (hudX <= centerX) {
          hudX = centerX;
          m.hudModeX = "center";
        }
      } else {
        hudX = centerX;
      }

      const modeY = m.hudModeY ?? "center";
      if (modeY === "top") {
        // stick to top edge
      } else if (modeY === "bottom") {
        hudY += dH;
        if (hudY <= centerY) {
          hudY = centerY;
          m.hudModeY = "center";
        }
      } else {
        hudY = centerY;
      }

      m.hudX = hudX;
      m.hudY = hudY;
      m.hudLastWidth = W;
      m.hudLastHeight = H;
      m.x = W > 0 ? hudX / W : 0;
      m.y = H > 0 ? hudY / H : 0;
    }
  }
  
  private openMarkerLink(m: Marker, opts?: { newTab?: boolean }): void {
    const link = this.getSwapEffectiveLink(m)?.trim();
    if (!link) return;
    if (opts?.newTab) {
      this.openLinkInNewTab(link);
      return;
    }
    void this.app.workspace.openLinkText(link, this.cfg.sourcePath);
  }

  private async setActiveBase(path: string): Promise<void> {
    if (!this.data) return;
    if (this.currentBasePath === path && this.imgW > 0 && this.imgH > 0) return;
	
    this.updateSvgBaseFlag(path);

    this.data.activeBase = path;

    if (this.isCanvas()) {
      await this.loadBaseSourceByPath(path);
    } else {
      const file = this.resolveTFile(path, this.cfg.sourcePath);
      if (!file) { new Notice(`Base image not found: ${path}`); return; }
      const url = this.app.vault.getResourcePath(file);
      await new Promise<void>((resolve, reject) => {
        this.imgEl.onload = () => { this.imgW = this.imgEl.naturalWidth; this.imgH = this.imgEl.naturalHeight; resolve(); };
        this.imgEl.onerror = () => reject(new Error("Failed to load image."));
        this.imgEl.src = url;
      });
      this.currentBasePath = path;
    }

    if (this.cfg.responsive) this.updateResponsiveAspectRatio();

    this.renderAll();

    if (this.cfg.responsive) this.fitToView();
    else this.applyTransform(this.scale, this.tx, this.ty);

    await this.applyBoundBaseVisibility();
    void this.saveDataSoon();

    if (!this.isCanvas()) this.updateOverlaySizes();
    else this.renderCanvas();
  }

  private async applyActiveBaseAndOverlays(): Promise<void> {
    await this.setActiveBase(this.getActiveBasePath());
    if (this.isCanvas()) {
      await this.ensureVisibleOverlaysLoaded();
      this.renderCanvas();
    } else {
      this.buildOverlayElements();
      this.updateOverlaySizes();
      await this.updateOverlayVisibility();
    }
  }

  private buildOverlayElements(): void {
     if (this.isCanvas()) return;
     this.overlayMap.clear();
     this.overlaysEl.empty();
     if (!this.data) return;

	for (const o of this.data.overlays ?? []) {
       const f = this.resolveTFile(o.path, this.cfg.sourcePath);
       if (!f) continue;
       const url = this.app.vault.getResourcePath(f);
	   
      const el = this.overlaysEl.createEl("img", { cls: "zm-overlay-image" });
      el.decoding = "async";
      el.loading = "eager";
      el.draggable = false;
      el.src = url;

      if (!o.visible) el.classList.add("zm-overlay-hidden");
      this.overlayMap.set(o.path, el);	   
    }
  }

  private updateOverlaySizes(): void {
    if (this.isCanvas()) return;
    this.overlaysEl.style.width = `${this.imgW}px`;
    this.overlaysEl.style.height = `${this.imgH}px`;
  }

  private async updateOverlayVisibility(): Promise<void> {
    if (!this.data) return;
    if (this.isCanvas()) {
      await this.ensureVisibleOverlaysLoaded();
      this.renderCanvas();
      return;
    }
    for (const o of this.data.overlays ?? []) {
      const el = this.overlayMap.get(o.path);
      if (!el) continue;
      if (o.visible) el.classList.remove("zm-overlay-hidden");
      else el.classList.add("zm-overlay-hidden");
    }
  }

  private async reloadMarkers(): Promise<void> {
    try {
      const loaded = await this.store.load();
      this.data = loaded;
      if (!this.ready) return;
      await this.applyActiveBaseAndOverlays();
      this.renderMarkersOnly();
      this.renderMeasure();
      this.renderCalibrate();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      new Notice(`Failed to reload markers: ${message}`);
    }
  }

  private saveDataSoon = (() => {
    let t: number | null = null;
    return () =>
      new Promise<void>((resolve) => {
        if (t) window.clearTimeout(t);
        t = window.setTimeout(() => {
          t = null;
          void (async () => {
            if (this.data) {
              const would = await this.store.wouldChange(this.data);
              if (would) {
                this.ignoreNextModify = true;
                await this.store.save(this.data);
              }
            }
            resolve();
          })();
        }, 200);
      });
  })();

  private installGrip(grip: HTMLDivElement, side: "left" | "right"): void {
    let startW = 0;
    let startH = 0;
    let startX = 0;
    let startY = 0;
    const minW = 220;
    const minH = 220;

    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      let w = startW + (side === "right" ? dx : -dx);
      let h = startH + dy;
      if (w < minW) w = minW;
      if (h < minH) h = minH;
      this.el.style.width = `${w}px`;
      this.el.style.height = `${h}px`;
      this.onResize();
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp, true);
      document.body.classList.remove("zm-cursor-resize-nwse", "zm-cursor-resize-nesw");
      this.userResizing = false;

      if (this.shouldUseSavedFrame() && this.cfg.resizable) void this.persistFrameNow();
    };

    grip.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = this.el.getBoundingClientRect();
      startW = rect.width;
      startH = rect.height;
      startX = e.clientX;
      startY = e.clientY;
      if (side === "right") document.body.classList.add("zm-cursor-resize-nwse");
      else document.body.classList.add("zm-cursor-resize-nesw");
      this.userResizing = true;
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp, true);
    });
  }

  private shouldUseSavedFrame(): boolean {
    return !!this.cfg.resizable && !((this.cfg.widthFromYaml ?? false) || (this.cfg.heightFromYaml ?? false)) && !this.cfg.responsive;
  }

  private isFrameVisibleEnough(minPx = 48): boolean {
    if (!this.el?.isConnected) return false;
    if (this.el.offsetParent === null) return false;
    const rect = this.el.getBoundingClientRect();
    return rect.width >= minPx && rect.height >= minPx;
  }

  private requestPersistFrame(delay = 500): void {
    if (this.frameSaveTimer) window.clearTimeout(this.frameSaveTimer);
    this.frameSaveTimer = window.setTimeout(() => {
      this.frameSaveTimer = null;
      void this.persistFrameNow();
    }, delay);
  }

  private persistFrameNow(): void {
    if (this.cfg.responsive) return;
    if (!this.data || !this.shouldUseSavedFrame()) return;
    if (!this.isFrameVisibleEnough(48)) return;

    const rr = this.el.getBoundingClientRect();
    const wNow = Math.round(rr.width);
    const hNow = Math.round(rr.height);
    if (wNow < 48 || hNow < 48) return;

    const prev = this.data.frame;
    const tol = 1;

    if (prev && Math.abs(wNow - prev.w) <= tol && Math.abs(hNow - prev.h) <= tol) return;

    const w = prev && Math.abs(wNow - prev.w) <= tol ? prev.w : wNow;
    const h = prev && Math.abs(hNow - prev.h) <= tol ? prev.h : hNow;

    if (w !== prev?.w || h !== prev?.h) {
      this.data.frame = { w, h };
      void this.saveDataSoon();
    }
  }

  private applyMeasureStyle(): void {
    const color = (this.plugin.settings.measureLineColor ?? "var(--text-accent)").trim();
    const widthPx = Math.max(1, this.plugin.settings.measureLineWidth ?? 2);
    setCssProps(this.el, {
      "--zm-measure-color": color,
      "--zm-measure-width": `${widthPx}px`,
    });
  }
  
  private showZoomHud(): void {
    if (!this.zoomHud) return;
    const percent = Math.round(this.scale * 100);
    this.zoomHud.textContent = `Zoom: ${percent}%`;

    this.zoomHud.classList.add("zm-zoom-hud-visible");

    if (this.zoomHudTimer !== null) {
      window.clearTimeout(this.zoomHudTimer);
    }
    this.zoomHudTimer = window.setTimeout(() => {
      this.zoomHud?.classList.remove("zm-zoom-hud-visible");
      this.zoomHudTimer = null;
    }, 1000); // 1 seconds display time
  }

  private requestPanFrame(): void {
    if (this.panRAF != null) return;
    this.panRAF = window.requestAnimationFrame(() => {
      this.panRAF = null;
      if (this.panAccDx !== 0 || this.panAccDy !== 0) {
        this.applyTransform(this.scale, this.tx + this.panAccDx, this.ty + this.panAccDy);
        this.panAccDx = 0;
        this.panAccDy = 0;
      }
    });
  }

  private async applyYamlOnFirstLoad(): Promise<void> {
    if (this.yamlAppliedOnce) return;
    this.yamlAppliedOnce = true;
    const yb = this.cfg.yamlBases ?? [];
    const yo = this.cfg.yamlOverlays ?? [];

    const overlaysProvided = await this.isYamlKeyPresent("imageOverlays");

    if (yb.length === 0 && yo.length === 0 && !overlaysProvided) return;

    const changed = this.syncYamlLayers(yb, yo, undefined, overlaysProvided);
    if (changed && this.data && (await this.store.wouldChange(this.data))) {
      this.ignoreNextModify = true;
      await this.store.save(this.data);
    }
  }

  private async isYamlKeyPresent(key: string): Promise<boolean> {
    try {
      const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
      if (!(af instanceof TFile)) return false;
      const text = await this.app.vault.read(af);
      const lines = text.split("\n");
      const blk = this.findZoommapBlockForThisMap(lines);
      if (!blk) return false;
      const keyLower = key.toLowerCase();
      return lines
        .slice(blk.start + 1, blk.end)
        .some((ln) => stripQuotePrefix(ln).trimStart().toLowerCase().startsWith(`${keyLower}:`));
    } catch {
      return false;
    }
  }
  
  private async replaceYamlScalarIfEquals(
  key: "image",
  oldValue: string,
  newValue: string,
): Promise<boolean> {
  const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
  if (!(af instanceof TFile)) return false;

  let foundBlock = false;

  const stripQuotes = (s: string) => {
    const t = s.trim();
    if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
      return t.slice(1, -1);
    }
    return t;
  };

  await this.app.vault.process(af, (text) => {
    const lines = text.split("\n");
    const blk = this.findZoommapBlockForThisMap(lines);
    if (!blk) return text;

    foundBlock = true;

    const content = lines.slice(blk.start + 1, blk.end);
    let changed = false;

    const keyRe = /^(\s*)image\s*:\s*(.*)$/i;

    const out = content.map((ln) => {
      const info = splitQuotePrefix(ln);
      const m = keyRe.exec(info.rest);
      if (!m) return ln;

      const indent = m[1] ?? "";
      const rhs = m[2] ?? "";
      const val = stripQuotes(rhs);

      if (val === oldValue) {
        changed = true;
        return `${info.prefix}${indent}image: ${JSON.stringify(newValue)}`;
      }
      return ln;
    });

    if (!changed) return text;

    if (af.path === this.store.getPath()) {
      this.ignoreNextModify = true;
    }

    return [
      ...lines.slice(0, blk.start + 1),
      ...out,
      ...lines.slice(blk.end),
    ].join("\n");
  });

  return foundBlock;
}

  private syncYamlLayers(
    yamlBases: { path: string; name?: string }[],
    yamlOverlays: { path: string; name?: string; visible?: boolean }[],
    yamlImage?: string,
    overlaysProvided = false,
  ): boolean {
    if (!this.data) return false;
    let changed = false;

    if (yamlBases && yamlBases.length > 0) {
      const prevActive = this.getActiveBasePath();
      const newBases: BaseImage[] = yamlBases.map((b) => ({ path: b.path, name: b.name }));
      const newPaths = new Set(newBases.map((b) => b.path));
      let newActive = prevActive;
      if (yamlImage && newPaths.has(yamlImage)) newActive = yamlImage;
      if (!newPaths.has(newActive)) newActive = newBases[0].path;

      this.data.bases = newBases;
      this.data.activeBase = newActive;
      changed = true;
    }

    if (overlaysProvided || (yamlOverlays && yamlOverlays.length > 0)) {
      const prev = new Map<string, ImageOverlay>((this.data.overlays ?? []).map((o) => [o.path, o]));
      const next: ImageOverlay[] = (yamlOverlays ?? []).map((o) => ({
        path: o.path,
        name: o.name,
        visible: typeof o.visible === "boolean" ? o.visible : prev.get(o.path)?.visible ?? false,
      }));
      this.data.overlays = next;
      changed = true;
    }

    return changed;
  }

  private async applyScaleCalibration(metersPerPixel: number): Promise<void> {
    if (!this.data) return;
    this.ensureMeasurement();
    const base = this.getActiveBasePath();
    if (!this.data.measurement) return;
    this.data.measurement.metersPerPixel = metersPerPixel;
    if (this.data?.measurement?.scales) {
      this.data.measurement.scales[base] = metersPerPixel;
    }
    if (await this.store.wouldChange(this.data)) {
      this.ignoreNextModify = true;
      await this.store.save(this.data);
    }
    // scale changed -> ping notes should be recalculated
    this.schedulePingUpdate();	
  }

  private promptAddLayer(kind: "base" | "overlay"): void {
    new ImageFileSuggestModal(this.app, (file: TFile) => {
      const base = file.name.replace(/\.[^.]+$/, "");
      const title = kind === "base" ? "Name for base layer" : "Name for overlay";
      new NamePromptModal(this.app, title, base, (name) => {
        if (kind === "base") void this.addBaseByPath(file.path, name);
        else void this.addOverlayByPath(file.path, name);
      }).open();
    }).open();
  }

  private async addBaseByPath(path: string, name?: string): Promise<void> {
    if (!this.data) return;
    const exists = this.getBasesNormalized().some((b) => b.path === path);
    if (exists) { new Notice("Base already exists.", 1500); return; }
    this.data.bases = this.data.bases ?? [];
    this.data.bases.push({ path, name: (name ?? "") || undefined });
    await this.saveDataSoon();
    void this.appendLayerToYaml("base", path, name ?? "");
    new Notice("Base added.", 1200);
  }

  private async addOverlayByPath(path: string, name?: string): Promise<void> {
    if (!this.data) return;
    this.data.overlays = this.data.overlays ?? [];
    if (this.data.overlays.some((o) => o.path === path)) { new Notice("Overlay already exists.", 1500); return; }
    this.data.overlays.push({ path, name: (name ?? "") || undefined, visible: true });
    await this.saveDataSoon();

    if (this.isCanvas()) {
      await this.ensureOverlayLoaded(path);
      this.renderCanvas();
    } else {
      this.buildOverlayElements();
      this.updateOverlaySizes();
      await this.updateOverlayVisibility();
    }

    void this.appendLayerToYaml("overlay", path, name ?? "");
    new Notice("Overlay added.", 1200);
  }
  
  private confirmDeleteBase(path: string): void {
  if (!this.data) return;

  const bases = this.getBasesNormalized();
  if (bases.length <= 1) {
    new Notice("Cannot delete the last base image.", 2500);
    return;
  }

  const label = bases.find((b) => b.path === path)?.name ?? basename(path);
  new ConfirmModal(
    this.app,
    "Delete base image",
    `Remove base "${label}" from this map?`,
    () => {
      void this.deleteBaseByPath(path);
    },
  ).open();
}

private async deleteBaseByPath(path: string): Promise<void> {
  if (!this.data) return;

  const basesBefore = this.getBasesNormalized();
  if (basesBefore.length <= 1) {
    new Notice("Cannot delete the last base image.", 2500);
    return;
  }

  const idx = basesBefore.findIndex((b) => b.path === path);
  if (idx < 0) return;

  const wasActive = this.getActiveBasePath() === path;

  // Remove base from data.bases (string or object form)
  this.data.bases = (this.data.bases ?? []).filter((it) => {
    if (typeof it === "string") return it !== path;
    if (it && typeof it === "object" && "path" in it) {
      const p = (it as { path?: unknown }).path;
      return typeof p !== "string" || p !== path;
    }
    return true;
  });

  // Remove per-base scale if present
  if (this.data.measurement?.scales) {
    delete this.data.measurement.scales[path];
  }

  // Unbind marker layers that referenced this base
  for (const l of this.data.layers) {
    if (l.boundBase === path) l.boundBase = undefined;
  }

  let newActive: string | null = null;

  if (wasActive) {
    const basesAfter = this.getBasesNormalized();
    const pick = Math.min(idx, basesAfter.length - 1);
    newActive = basesAfter[pick]?.path ?? basesAfter[0]?.path ?? null;

    if (newActive) {
      await this.setActiveBase(newActive);
    }
  } else {
    await this.saveDataSoon();
  }

  // Update YAML: remove from imageBases
  await this.removeFromYamlList("imageBases", path);

  // Update YAML: if the zoommap block has image: <deleted>, replace it
  if (newActive) {
    await this.replaceYamlScalarIfEquals("image", path, newActive);
  }

  new Notice("Base removed.", 1200);
}

private confirmDeleteOverlay(path: string): void {
  if (!this.data) return;

  const o = (this.data.overlays ?? []).find((x) => x.path === path);
  const label = o?.name ?? basename(path);

  new ConfirmModal(
    this.app,
    "Delete overlay",
    `Remove overlay "${label}" from this map?`,
    () => {
      void this.deleteOverlayByPath(path);
    },
  ).open();
}

private async deleteOverlayByPath(path: string): Promise<void> {
  if (!this.data) return;

  const prevCount = (this.data.overlays ?? []).length;
  this.data.overlays = (this.data.overlays ?? []).filter((o) => o.path !== path);

  if ((this.data.overlays ?? []).length === prevCount) return;

  await this.saveDataSoon();

  if (this.isCanvas()) {
    await this.ensureVisibleOverlaysLoaded();
    this.renderCanvas();
  } else {
    this.buildOverlayElements();
    this.updateOverlaySizes();
    await this.updateOverlayVisibility();
  }

  await this.removeFromYamlList("imageOverlays", path);

  new Notice("Overlay removed.", 1200);
}

  private async appendLayerToYaml(kind: "base" | "overlay", path: string, name: string): Promise<void> {
    try {
      const key = kind === "base" ? "imageBases" : "imageOverlays";
      const ok = await this.updateYamlList(key, path, { name });
      if (!ok) new Notice("Added, but YAML could not be updated.", 2500);
    } catch (err) {
      console.error("Zoom Map: failed to update YAML", err);
      new Notice("Added, but YAML update failed.", 2500);
    }
  }

  private async updateYamlList(
  key: "imageBases" | "imageOverlays",
  newPath: string,
  opts?: { name?: string },
): Promise<boolean> {
    const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
    if (!(af instanceof TFile)) return false;

    let foundBlock = false;

    await this.app.vault.process(af, (text) => {
    const lines = text.split("\n");
    const blk = this.findZoommapBlockForThisMap(lines);
    if (!blk) return text;

    foundBlock = true;

    const content = lines.slice(blk.start + 1, blk.end);
    const patched = this.patchYamlList(content, key, newPath, opts);
    if (!patched.changed) return text;

    if (af.path === this.store.getPath()) {
      this.ignoreNextModify = true;
    }

    return [
      ...lines.slice(0, blk.start + 1),
      ...patched.out,
      ...lines.slice(blk.end),
    ].join("\n");
  });

  // Semantik wie vorher:
  // true = Block gefunden (auch wenn nichts geändert wurde)
  // false = Block nicht gefunden
  return foundBlock;
}

  private async removeFromYamlList(
  key: "imageBases" | "imageOverlays",
  removePath: string,
): Promise<boolean> {
  const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
  if (!(af instanceof TFile)) return false;

  let foundBlock = false;

  await this.app.vault.process(af, (text) => {
    const lines = text.split("\n");
    const blk = this.findZoommapBlockForThisMap(lines);
    if (!blk) return text;

    foundBlock = true;

    const content = lines.slice(blk.start + 1, blk.end);
    const patched = this.patchYamlListRemove(content, key, removePath);
    if (!patched.changed) return text;

    if (af.path === this.store.getPath()) {
      this.ignoreNextModify = true;
    }

    return [
      ...lines.slice(0, blk.start + 1),
      ...patched.out,
      ...lines.slice(blk.end),
    ].join("\n");
  });

  return foundBlock;
}

private patchYamlListRemove(
  contentLines: string[],
  key: "imageBases" | "imageOverlays",
  removePath: string,
): { changed: boolean; out: string[] } {
  const out = contentLines.slice();
  const keyRe = new RegExp(`^(\\s*)${key}\\s*:(.*)$`);
  let keyIdx = -1;
  let keyIndent = "";
  let keyPrefix = "";

  for (let i = 0; i < out.length; i++) {
    const info = splitQuotePrefix(out[i]);
    const m = keyRe.exec(info.rest);
    if (m) {
      keyIdx = i;
      keyIndent = m[1] ?? "";
      keyPrefix = info.prefix;
      break;
    }
  }
  if (keyIdx < 0) return { changed: false, out };

  const isNextTopLevelKey = (ln: string) => {
    const rest = stripQuotePrefix(ln);
    const trimmed = rest.trim();
    if (!trimmed) return false;
    if (trimmed.startsWith("#")) return false;
    const spaces = (/^\s*/.exec(rest))?.[0].length ?? 0;
    return spaces <= keyIndent.length && /^[A-Za-z0-9_-]+\s*:/.exec(trimmed) !== null;
  };

  let regionEnd = keyIdx + 1;
  while (regionEnd < out.length && !isNextTopLevelKey(out[regionEnd])) regionEnd++;

  const region = out.slice(keyIdx + 1, regionEnd);

  const stripQuotes = (s: string) => {
    const t = s.trim();
    if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
      return t.slice(1, -1);
    }
    return t;
  };

  const removed: string[] = [];
  let changed = false;

  for (let i = 0; i < region.length; i++) {
    const line = region[i];
    const trimmed = line.trimStart();

    if (!trimmed.startsWith("-")) {
      removed.push(line);
      continue;
    }

    const afterDash = trimmed.slice(1).trimStart();

    // Object form: - path: ...
    const objMatch = /^path\s*:\s*(.+)$/.exec(afterDash);
    if (objMatch) {
      const rawVal = stripQuotes(objMatch[1] ?? "");
      if (rawVal === removePath) {
        changed = true;

        const baseIndent = (/^\s*/.exec(line))?.[0].length ?? 0;
        let j = i + 1;
        while (j < region.length) {
          const next = region[j];
          const nextIndent = (/^\s*/.exec(next))?.[0].length ?? 0;
          const nextTrim = next.trimStart();

          if (nextTrim.startsWith("-") && nextIndent === baseIndent) break;
          if (nextTrim && nextIndent <= baseIndent) break;

          j++;
        }
        i = j - 1;
        continue;
      }

      removed.push(line);
      continue;
    }

    // String form: - "path"  or - path
    const rawVal = stripQuotes(afterDash);
    if (rawVal === removePath) {
      changed = true;
      continue;
    }

    removed.push(line);
  }

  // Rebuild output
  const nextOut: string[] = [
    ...out.slice(0, keyIdx + 1),
    ...removed,
    ...out.slice(regionEnd),
  ];

  // If empty list, normalize to key: []
  const remainingItems = removed.some((ln) => ln.trimStart().startsWith("-"));
  if (!remainingItems) {
    nextOut[keyIdx] = `${keyPrefix}${keyIndent}${key}: []`;
    // remove any leftover empty lines directly after key line (optional)
  }

  return { changed, out: nextOut };
}

  private findZoommapBlock(
    lines: string[],
    approxLine?: number,
  ): { start: number; end: number } | null {
    let result: { start: number; end: number } | null = null;
    for (let i = 0; i < lines.length; i++) {
      const ln = stripQuotePrefix(lines[i]).trimStart().toLowerCase();
      if (ln.startsWith("```zoommap")) {
        let j = i + 1;
        while (j < lines.length && !stripQuotePrefix(lines[j]).trimStart().startsWith("```")) j++;
        if (j >= lines.length) break;
        const block = { start: i, end: j };
        if (typeof approxLine === "number" && i <= approxLine && approxLine <= j) return block;
        result ??= block;
        i = j;
      }
    }
    return result;
  }

  private patchYamlList(
    contentLines: string[],
    key: "imageBases" | "imageOverlays",
    path: string,
    opts?: { name?: string },
  ): { changed: boolean; out: string[] } {
    const out = contentLines.slice();
    const keyRe = new RegExp(`^(\\s*)${key}\\s*:(.*)$`);
    let keyIdx = -1;
    let keyIndent = "";
    let after = "";
    let keyPrefix = "";

    for (let i = 0; i < out.length; i++) {
      const info = splitQuotePrefix(out[i]);
      const m = keyRe.exec(info.rest);
      if (m) {
        keyIdx = i;
        keyIndent = m[1] ?? "";
        after = (m[2] ?? "").trim();
        keyPrefix = info.prefix;
        break;
      }
    }

    const jsonQuoted = JSON.stringify(path);
    const nm = opts?.name ?? "";
    const itemLines: string[] = [];
    const itemIndent = `${keyIndent}  `;
    itemLines.push(`${keyPrefix}${itemIndent}- path: ${jsonQuoted}`);
    itemLines.push(`${keyPrefix}${itemIndent}  name: ${JSON.stringify(nm)}`);

    if (keyIdx >= 0) {
      if (/^\[\s*\]$/.exec(after)) out[keyIdx] = `${keyPrefix}${keyIndent}${key}:`;

      let insertAt = keyIdx + 1;
      let scan = keyIdx + 1;

      const isNextTopLevelKey = (ln: string) => {
        const rest = stripQuotePrefix(ln);
        const trimmed = rest.trim();
        if (!trimmed) return false;
        if (trimmed.startsWith("#")) return false;
        const spaces = (/^\s*/.exec(rest))?.[0].length ?? 0;
        return spaces <= keyIndent.length && /^[A-Za-z0-9_-]+\s*:/.exec(trimmed) !== null;
      };

      while (scan < out.length && !isNextTopLevelKey(out[scan])) scan++;
      insertAt = scan;

      const region = out.slice(keyIdx + 1, insertAt).join("\n");
      const esc = path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const dupObj = new RegExp(`-\\s*path\\s*:\\s*["']?${esc}["']?`);
      const dupStr = new RegExp(`-\\s*["']?${esc}["']?\\s*$`);
      if (dupObj.exec(region) || dupStr.exec(region)) {
        return { changed: false, out };
      }

      out.splice(insertAt, 0, ...itemLines);
      return { changed: true, out };
    }

    // No key yet: append with the prevailing quote prefix (if any).
    const blockPrefix =
      out.map((ln) => splitQuotePrefix(ln).prefix).find((p) => p.length > 0) ?? "";
    const defaultIndent = this.detectYamlKeyIndent(out);
    out.push(`${blockPrefix}${defaultIndent}${key}:`);
    // rebuild item lines for the new prefix
    const itemIndent2 = `${defaultIndent}  `;
    out.push(`${blockPrefix}${itemIndent2}- path: ${jsonQuoted}`);
    out.push(`${blockPrefix}${itemIndent2}  name: ${JSON.stringify(nm)}`);
    return { changed: true, out };
  }

  private detectYamlKeyIndent(lines: string[]): string {
    for (const ln of lines) {
      const m = /^(\s*)[A-Za-z0-9_-]+\s*:/.exec(stripQuotePrefix(ln));
      if (m) return m[1] ?? "";
    }
    return "";
  }

  private async renameMarkerLayer(layer: MarkerLayer, newName: string): Promise<void> {
    if (!this.data) return;
    const exists = this.data.layers.some((l) => l !== layer && l.name === newName);
    const finalName = exists ? `${newName} (${Math.random().toString(36).slice(2, 4)})` : newName;
    layer.name = finalName;
    await this.saveDataSoon();
    this.renderMarkersOnly();
    new Notice("Layer renamed.", 1000);
  }

  private async deleteMarkerLayer(
    layer: MarkerLayer,
    decision: { mode: "move"; targetId: string } | { mode: "delete-markers" },
  ): Promise<void> {
    if (!this.data) return;
    const others = this.data.layers.filter((l) => l.id !== layer.id);
    if (others.length === 0) { new Notice("Cannot delete the last layer.", 2000); return; }

    if (decision.mode === "move") {
      const targetId = decision.targetId;
      if (!targetId || targetId === layer.id) { new Notice("Invalid target layer.", 1500); return; }
      for (const m of this.data.markers) if (m.layer === layer.id) m.layer = targetId;
    } else {
      // Delete ping notes for removed ping markers
      const removed = this.data.markers.filter((m) => m.layer === layer.id);
      for (const m of removed) {
        await this.deletePingNoteIfOwned(m);
      }
      this.data.markers = this.data.markers.filter((m) => m.layer !== layer.id);
    }

    this.data.layers = this.data.layers.filter((l) => l.id !== layer.id);
    await this.saveDataSoon();
    this.renderMarkersOnly();
    new Notice("Layer deleted.", 1000);
	this.schedulePingUpdate();
  }
}

class ConfirmModal extends Modal {
  private titleText: string;
  private messageText: string;
  private confirmText: string;
  private cancelText: string;
  private onConfirm: () => void;

  constructor(
    app: App,
    titleText: string,
    messageText: string,
    onConfirm: () => void,
    opts?: { confirmText?: string; cancelText?: string },
  ) {
    super(app);
    this.titleText = titleText;
    this.messageText = messageText;
    this.onConfirm = onConfirm;
    this.confirmText = opts?.confirmText ?? "Confirm";
    this.cancelText = opts?.cancelText ?? "Cancel";
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl("h2", { text: this.titleText });
    contentEl.createEl("div", { text: this.messageText });

    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const confirm = footer.createEl("button", { text: this.confirmText });
    const cancel = footer.createEl("button", { text: this.cancelText });

    confirm.onclick = () => {
      this.close();
      this.onConfirm();
    };
    cancel.onclick = () => this.close();
  }

  onClose(): void {
    this.contentEl.empty();
  }
}

/* ------------ Context Menu ------------- */
interface ZMMenuItem {
  type?: "item" | "separator";
  label?: string;
  // Menu item handler; receives the clicked row and the menu instance.
  action?: (rowEl: HTMLDivElement, menu?: ZMMenu) => void | Promise<void>;
  iconUrl?: string;
  iconRotationDeg?: number;
  checked?: boolean;
  mark?: "check" | "x" | "minus";
  markColor?: string;
  children?: ZMMenuItem[];
}

class ZMMenu {
  private doc: Document;
  private root: HTMLDivElement;
  private submenus: HTMLDivElement[] = [];
  private items: ZMMenuItem[] = [];

  constructor(doc: Document) {
    this.doc = doc;
    this.root = this.doc.body.createDiv({ cls: "zm-menu" });
    this.root.addEventListener("contextmenu", (e) => e.stopPropagation());
  }

  open(clientX: number, clientY: number, items: ZMMenuItem[]): void {
    this.items = items;
    this.buildList(this.root, this.items);
    this.position(this.root, clientX, clientY, "right");
  }

  destroy(): void {
    this.submenus.forEach((el) => el.remove());
    this.submenus = [];
    this.root.remove();
  }

  contains(el: Node): boolean {
    return this.root.contains(el) || this.submenus.some((s) => s.contains(el));
  }

  private buildList(container: HTMLDivElement, items: ZMMenuItem[]): void {
    container.empty();
    for (const it of items) {
      if (it.type === "separator") {
        container.createDiv({ cls: "zm-menu__sep" });
        continue;
      }
      if (!it.label) continue;

      const row = container.createDiv({ cls: "zm-menu__item" });

      const label = row.createDiv({ cls: "zm-menu__label" });
      if (it.iconUrl) {
        const imgLeft = label.createEl("img", { cls: "zm-menu__icon" });
        imgLeft.src = it.iconUrl;

        const deg =
          typeof it.iconRotationDeg === "number" && Number.isFinite(it.iconRotationDeg)
            ? it.iconRotationDeg
            : 0;
        if (deg) imgLeft.style.transform = `rotate(${deg}deg)`;
        else imgLeft.style.removeProperty("transform");

        label.appendChild(document.createTextNode(" "));
      }
      label.appendText(it.label);

      const right = row.createDiv({ cls: "zm-menu__right" });

      if (it.children?.length) {
        const arrow = right.createDiv({ cls: "zm-menu__arrow" });
        arrow.setText("▶");
        let submenuEl: HTMLDivElement | null = null;

        const openSub = () => {
          if (submenuEl) return;
          submenuEl = this.doc.body.createDiv({ cls: "zm-submenu" });
          this.submenus.push(submenuEl);
          this.buildList(submenuEl, it.children!);

          const rect = row.getBoundingClientRect();
          const win = this.doc.defaultView ?? window;
          const pref = rect.right + 260 < win.innerWidth ? "right" : "left";
          const x = pref === "right" ? rect.right : rect.left;
          const y = rect.top;
          this.position(submenuEl, x, y, pref);
        };

        const closeSub = () => {
          if (!submenuEl) return;
          submenuEl.remove();
          this.submenus = this.submenus.filter((s) => s !== submenuEl);
          submenuEl = null;
        };

        row.addEventListener("mouseenter", openSub);
        row.addEventListener("mouseleave", (e) => {
          const to = e.relatedTarget;
          if (submenuEl && !(to instanceof Node && submenuEl.contains(to))) closeSub();
        });
      } else {
        const chk = right.createDiv({ cls: "zm-menu__check" });
        if (it.mark) {
          chk.setText(this.symbolForMark(it.mark));
          if (it.markColor) chk.style.color = it.markColor;
        } else if (typeof it.checked === "boolean") {
          chk.setText(it.checked ? "✓" : "");
        }

        if (!it.action) {
          row.classList.add("zm-menu__item--info");
        }

        row.addEventListener("click", () => {
          if (!it.action) return;
          try {
            void Promise.resolve(it.action(row, this)).catch((err) =>
              console.error("Menu item action failed:", err),
            );
          } catch (err) {
            console.error("Menu item action failed:", err);
          }
        });
      }
    }
  }

  private symbolForMark(mark: "check" | "x" | "minus"): string {
    switch (mark) {
      case "x":
        return "×";
      case "minus":
        return "–";
      default:
        return "✓";
    }
  }

  private position(
    el: HTMLDivElement,
    clientX: number,
    clientY: number,
    prefer: "right" | "left",
  ): void {
    const pad = 6;
    const rect = el.getBoundingClientRect();
    let x = clientX;
    let y = clientY;

    const win = this.doc.defaultView ?? window;
    const vw = win.innerWidth;
    const vh = win.innerHeight;

    if (prefer === "right") {
      if (clientX + rect.width + pad > vw) x = Math.max(pad, vw - rect.width - pad);
    } else {
      x = clientX - rect.width;
      if (x < pad) x = pad;
    }
    if (clientY + rect.height + pad > vh) y = Math.max(pad, vh - rect.height - pad);

    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  }
}