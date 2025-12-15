import { Component, Modal, Notice, TFile } from "obsidian";
import type { App } from "obsidian";
import { generateId, MarkerStore } from "./markerStore";
import type {
  Marker,
  MarkerFileData,
  ImageOverlay,
  BaseImage,
  MarkerLayer,
  DrawLayer,
  Drawing,
  DrawingKind,
  FillPatternKind,
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

/* ===== Collections (base-bound) ===== */
export interface MarkerPreset {
  name: string;
  iconKey?: string;
  tooltip?: string;
  layerName?: string;
  openEditor: boolean;
  linkTemplate?: string;
}

export interface StickerPreset {
  name: string;
  imagePath: string;
  size: number;
  layerName?: string;
  openEditor: boolean;
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
}

export interface IconProfile {
  key: string;
  pathOrDataUrl: string;
  size: number;
  anchorX: number;
  anchorY: number;
  defaultLink?: string;
  rotationDeg?: number;
}

export interface CustomUnitDef {
  id: string;
  name: string;
  abbreviation: string;
  metersPerUnit: number;
}

export interface ZoomMapSettings {
  icons: IconProfile[];
  defaultIconKey: string;
  wheelZoomFactor: number;
  panMouseButton: "left" | "middle";
  hoverMaxWidth: number;
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
}

interface Point { x: number; y: number; }

type LayerTriState = "visible" | "locked" | "hidden";

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
function isImageBitmapLike(x: unknown): x is ImageBitmap {
  return typeof x === "object" && x !== null && "close" in x && typeof (x as { close: unknown }).close === "function";
}

function isSvgDataUrl(src: string): boolean {
  return typeof src === "string" && src.startsWith("data:image/svg+xml");
}

function tintSvgMarkupLocal(svg: string, color: string): string {
  const c = color.trim();
  if (!c) return svg;

  let s = svg;

  s = s.replace(/fill="[^"]*"/gi, `fill="${c}"`);
  s = s.replace(/stroke="[^"]*"/gi, `stroke="${c}"`);

  if (!/fill="/i.test(s)) {
    s = s.replace(/<svg([^>]*?)>/i, `<svg$1 fill="${c}">`);
  }

  return s;
}

/* Per-marker option accessors (typed; avoid any) */
function getMinZoom(m: Marker): number | undefined { return m.minZoom; }
function getMaxZoom(m: Marker): number | undefined { return m.maxZoom; }
function isScaleLikeSticker(m: Marker): boolean { return !!m.scaleLikeSticker; }

export class MapInstance extends Component {
  private app: App;
  private plugin: ZoomMapPlugin;
  private el: HTMLElement;

  private viewportEl!: HTMLDivElement;
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

  private zoomHud!: HTMLDivElement;
  private zoomHudTimer: number | null = null;

  private initialLayoutDone = false;

  private overlayMap: Map<string, HTMLImageElement> = new Map<string, HTMLImageElement>();

  private baseCanvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private baseBitmap: ImageBitmap | null = null;

  private overlaySources: Map<string, CanvasImageSource> = new Map<string, CanvasImageSource>();
  private overlayLoading: Map<string, Promise<CanvasImageSource | null>> = new Map<string, Promise<CanvasImageSource | null>>();

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

  private ignoreNextModify = false;

  private ro: ResizeObserver | null = null;
  private ready = false;

  private openMenu: ZMMenu | null = null;

  // Measurement state
  private measuring = false;
  private measurePts: Point[] = [];
  private measurePreview: Point | null = null;

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

  private panRAF: number | null = null;
  private panAccDx = 0;
  private panAccDy = 0;

  private activePointers: Map<number, { x: number; y: number }> = new Map<number, { x: number; y: number }>();
  private pinchActive = false;
  private pinchStartScale = 1;
  private pinchStartDist = 0;
  private pinchPrevCenter: { x: number; y: number } | null = null;

  private currentBasePath: string | null = null;

  private frameSaveTimer: number | null = null;
  private userResizing = false;

  private yamlAppliedOnce = false;
  
  private openViewEditorFromMap(): void {
  if (!this.data) return;

  const bases = this.getBasesNormalized();
  const overlays = this.data.overlays ?? [];

  // Aktuelle Fenstergröße der Map
  const rect = this.el.getBoundingClientRect();
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
  };

  const modal = new ViewEditorModal(this.app, cfg, (res) => {
    if (res.action !== "save" || !res.config) return;
    void this.applyViewEditorResult(res.config);
  });
  modal.open();
}

private applyInitialView(zoom: number, center: { x: number; y: number }): void {
  const z = clamp(zoom, this.cfg.minZoom, this.cfg.maxZoom);

  const r = this.viewportEl.getBoundingClientRect();
  this.vw = r.width;
  this.vh = r.height;

  if (!this.imgW || !this.imgH || !this.vw || !this.vh) {
    this.fitToView();
    return;
  }

  const worldX = center.x * this.imgW;
  const worldY = center.y * this.imgH;

  const tx = this.vw / 2 - worldX * z;
  const ty = this.vh / 2 - worldY * z;

  this.applyTransform(z, tx, ty);
}

private async saveDefaultViewToYaml(): Promise<void> {
  if (typeof this.cfg.sectionStart !== "number") {
    new Notice("Cannot store default view (no YAML section info).", 2500);
    return;
  }

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

  await this.app.vault.process(af, (text) => {
    const lines = text.split("\n");
    const blk = this.findZoommapBlock(lines, this.cfg.sectionStart);
    if (!blk) return text;

    const content = lines.slice(blk.start + 1, blk.end);
    const keyRe = /^(\s*)view\s*:/;
    let keyIdx = -1;
    let keyIndent = "";

    for (let i = 0; i < content.length; i++) {
      const m = keyRe.exec(content[i]);
      if (m) {
        keyIdx = i;
        keyIndent = m[1] ?? "";
        break;
      }
    }

    const viewLines = [
      `${keyIndent}view:`,
      `${keyIndent}  zoom: ${zoom.toFixed(4)}`,
      `${keyIndent}  centerX: ${cx.toFixed(6)}`,
      `${keyIndent}  centerY: ${cy.toFixed(6)}`,
    ];

    const isNextTopLevelKey = (ln: string) => {
      const trimmed = ln.trim();
      if (!trimmed) return false;
      if (trimmed.startsWith("#")) return false;
      const spaces = (/^\s*/.exec(ln))?.[0].length ?? 0;
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
      const vLines = [
        `${indent}view:`,
        `${indent}  zoom: ${zoom.toFixed(4)}`,
        `${indent}  centerX: ${cx.toFixed(6)}`,
        `${indent}  centerY: ${cy.toFixed(6)}`,
      ];
      newContent = [...content, ...vLines];
    }

    return [
      ...lines.slice(0, blk.start + 1),
      ...newContent,
      ...lines.slice(blk.end),
    ].join("\n");
  });

  new Notice("Default view stored in YAML.", 2000);
}

private async applyViewEditorResult(cfg: ViewEditorConfig): Promise<void> {
  if (typeof this.cfg.sectionStart !== "number") {
    new Notice("Cannot update YAML for this map (no section info).", 3000);
    return;
  }

  const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
  if (!(af instanceof TFile)) {
    new Notice("Source note not found.", 3000);
    return;
  }

  const buildYaml = (pluginCfg: ViewEditorConfig): string => {
    const plugin = this.plugin;
    return plugin.buildYamlFromViewConfig(pluginCfg);
  };

  await this.app.vault.process(af, (text) => {
    const lines = text.split("\n");
    const blk = this.findZoommapBlock(lines, this.cfg.sectionStart);
    if (!blk) return text;

    const yaml = buildYaml(cfg);
    const yamlLines = yaml.split("\n");

    return [
      ...lines.slice(0, blk.start + 1),
      ...yamlLines,
      ...lines.slice(blk.end),
    ].join("\n");
  });

  new Notice("View updated. Reload the note to see changes.", 2500);
}
  
  private tintedSvgCache: Map<string, string> = new Map<string, string>();

  constructor(app: App, plugin: ZoomMapPlugin, el: HTMLElement, cfg: ZoomMapConfig) {
    super();
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
    } else if (kind === "polygon") {
      new Notice(
        "Draw polygon: click to add points, move the mouse for preview, double-click or right-click to finish. Press esc to cancel.",
        7000,
      );
    }
  }

  private isCanvas(): boolean { return this.cfg.renderMode === "canvas"; }

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
    this.closeMenu();
    this.disposeBitmaps();
  }

  private async bootstrap(): Promise<void> {
    this.el.classList.add("zm-root");
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

    if (this.isCanvas()) {
      this.baseCanvas = this.viewportEl.createEl("canvas", { cls: "zm-canvas" });
      this.ctx = this.baseCanvas.getContext("2d");
    }

    this.worldEl = this.viewportEl.createDiv({ cls: "zm-world" });

    this.imgEl = this.worldEl.createEl("img", { cls: "zm-image" });
    this.overlaysEl = this.worldEl.createDiv({ cls: "zm-overlays" });
    this.markersEl = this.worldEl.createDiv({ cls: "zm-markers" });

    this.hudMarkersEl = this.viewportEl.createDiv({ cls: "zm-hud-markers" });

    this.measureHud = this.viewportEl.createDiv({ cls: "zm-measure-hud" });
    this.zoomHud = this.viewportEl.createDiv({ cls: "zm-zoom-hud" });

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
      this.onPointerUp();
    });

    this.registerDomEvent(window, "pointercancel", (e: PointerEvent) => {
      if (this.activePointers.has(e.pointerId)) this.activePointers.delete(e.pointerId);
      if (this.pinchActive && this.activePointers.size < 2) this.endPinch();
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

    await this.applyActiveBaseAndOverlays();
    this.setupMeasureOverlay();
    this.setupDrawOverlay();

    this.applyMeasureStyle();

    this.renderAll();
    this.ready = true;
  }

  private updateResponsiveAspectRatio(): void {
    if (!this.imgW || !this.imgH) return;
    this.el.style.aspectRatio = `${this.imgW} / ${this.imgH}`;
  }

  private disposeBitmaps(): void {
    try {
      if (this.baseBitmap && isImageBitmapLike(this.baseBitmap)) this.baseBitmap.close();
    } catch (error) {
      console.error("Zoom Map: failed to dispose base bitmap", error);
    }
    this.baseBitmap = null;

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

  private async loadBaseBitmapByPath(path: string): Promise<void> {
    const bmp = await this.loadBitmapFromPath(path);
    if (!bmp) throw new Error(`Failed to load image: ${path}`);
    try {
      if (this.baseBitmap && isImageBitmapLike(this.baseBitmap)) this.baseBitmap.close();
    } catch (error) {
      console.error("Zoom Map: failed to dispose previous base bitmap", error);
    }
    this.baseBitmap = bmp;
    this.imgW = bmp.width;
    this.imgH = bmp.height;
    this.currentBasePath = path;
  }

  private async loadBaseImageByPath(path: string): Promise<void> {
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
    if (this.isCanvas()) await this.loadBaseBitmapByPath(path);
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

  private closeCanvasSource(src: CanvasImageSource | null): void {
    try { if (isImageBitmapLike(src)) src.close(); }
    catch (error) { console.error("Zoom Map: failed to dispose canvas source", error); }
  }

  private async ensureOverlayLoaded(path: string): Promise<CanvasImageSource | null> {
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
    const wantVisible = new Set<string>((this.data.overlays ?? []).filter((o) => o.visible).map((o) => o.path));

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
    if (!this.baseCanvas || !this.ctx || !this.baseBitmap) return;

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

    ctx.drawImage(this.baseBitmap, 0, 0);

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
    this.renderMeasure();
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

  private getMetersPerPixel(): number | undefined {
    const base = this.getActiveBasePath();
    const m = this.data?.measurement;
    if (!m) return undefined;
    if (m.scales && base in m.scales) return m.scales[base];
    return m.metersPerPixel;
  }

  private ensureMeasurement(): void {
    if (!this.data) return;
    this.data.measurement ??= { displayUnit: "auto-metric", metersPerPixel: undefined, scales: {} };
    this.data.measurement.scales ??= {};
    this.data.measurement.displayUnit ??= "auto-metric";
  }

  private updateMeasureHud(): void {
    if (!this.measureHud) return;
    const meters = this.computeDistanceMeters();
    if (this.measuring || this.measurePts.length >= 2) {
      const txt = meters != null ? this.formatDistance(meters) : "No scale";
      this.measureHud.textContent = `Distance: ${txt}`;
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

 private formatDistance(m: number): string {
    const meas = this.data?.measurement;
    const unit = meas?.displayUnit ?? "auto-metric";
    const round = (v: number, d = 2) =>
      Math.round(v * 10 ** d) / 10 ** d;

    if (unit === "custom") {
      const defs = this.plugin.settings.customUnits ?? [];
      if (defs.length === 0) {
        return `${round(m, 2)} u`;
      }
      const activeId = meas?.customUnitId;
      const def =
        (activeId && defs.find((d) => d.id === activeId)) ??
        defs[0];

      const val = m / (def.metersPerUnit || 1);
      const label = def.abbreviation || def.name || "u";
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
      case "auto-imperial": {
        const mi = m / 1609.344;
        return mi >= 0.25
          ? `${round(mi, 2)} mi`
          : `${Math.round(m / 0.3048)} ft`;
      }
      case "auto-metric":
      default:
        return m >= 1000
          ? `${round(m / 1000, 2)} km`
          : `${Math.round(m)} m`;
    }
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
    if (!this.ready || !this.data) {
      if (this.isCanvas()) this.renderCanvas();
      return;
    }

    const r = this.viewportEl.getBoundingClientRect();
    this.vw = r.width;
    this.vh = r.height;

    // Update HUD pins first, based on new viewport size
    this.updateHudPinsForResize(r);

    if (this.cfg.responsive) {
      this.fitToView();
      if (this.isCanvas()) this.renderCanvas();
      this.renderMarkersOnly();
      return;
    }

    this.applyTransform(this.scale, this.tx, this.ty, true);
    this.renderMarkersOnly();

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
    return e.button === (want === "middle" ? 1 : 0);
  }

  private onPointerDownViewport(e: PointerEvent): void {
    if (!this.ready) return;

    this.plugin.setActiveMap(this);

    this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (e.target instanceof Element && e.target.setPointerCapture) (e.target as HTMLElement).setPointerCapture(e.pointerId);

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
    this.lastPos = { x: e.clientX, y: e.clientY };
  }

  private onPointerMove(e: PointerEvent): void {
    if (!this.ready) return;
	
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
    this.lastPos = { x: e.clientX, y: e.clientY };

    this.panAccDx += dx;
    this.panAccDy += dy;
    this.requestPanFrame();
  }

  private onPointerUp(): void {
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
  this.panAccDx = 0;
  this.panAccDy = 0;
  if (this.panRAF != null) {
    cancelAnimationFrame(this.panRAF);
    this.panRAF = null;
  }
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

  private onDblClickViewport(e: MouseEvent): void {
    if (!this.ready) return;

    if (this.drawingMode === "polygon" && this.drawPolygonPoints.length >= 2) {
      this.finishPolygonDrawing();
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
        let initialUnit: "m" | "km" | "mi" | "ft" | "custom" | undefined;
        let customLabel: string | undefined;
        let customAbbr: string | undefined;
        let customMetersPerUnit: number | undefined;

        if (meas?.displayUnit === "custom") {
          const defs = this.plugin.settings.customUnits ?? [];
          const def =
            (meas.customUnitId &&
              defs.find((d) => d.id === meas.customUnitId)) ??
            defs[0];
          if (def) {
            initialUnit = "custom";
            customLabel = def.name;
            customAbbr = def.abbreviation;
            customMetersPerUnit = def.metersPerUnit;
          }
        } else if (
          meas?.displayUnit === "m" ||
          meas?.displayUnit === "km" ||
          meas?.displayUnit === "mi" ||
          meas?.displayUnit === "ft"
        ) {
          initialUnit = meas.displayUnit;
        } else {
          initialUnit = "km";
        }

        new ScaleCalibrateModal(
          this.app,
          pxDist,
          (result) => {
            void this.applyScaleCalibration(result.metersPerPixel);
            new Notice(
              `Scale set: ${result.metersPerPixel.toFixed(6)} m/px`,
              2000,
            );
            this.calibrating = false;
            this.calibPts = [];
            this.calibPreview = null;
            this.renderCalibrate();
            this.updateMeasureHud();
          },
          {
            initialUnit,
            customLabel,
            customAbbreviation: customAbbr,
            customMetersPerUnit,
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
    for (const l of this.data.layers) {
      if (!l.boundBase) continue;
      const want = l.boundBase === active;
      if (l.visible !== want) {
        l.visible = want;
        changed = true;
      }
    }
    if (changed) {
      this.renderMarkersOnly();
      await this.saveDataSoon();
    }
  }

  /* ===== Collections helpers ===== */
  private getActiveBasePath(): string {
    if (!this.data) return this.cfg.imagePath;
    return this.data.activeBase ?? this.data.image ?? this.cfg.imagePath;
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
  } {
    const { matched, globals } = this.getCollectionsSplitForActive();

    const pinsBase = [...new Set(matched.flatMap((c) => c.include?.pinKeys ?? []))];

    const favsBase: MarkerPreset[] = [];
    matched.forEach((c) => (c.include?.favorites ?? []).forEach((f) => favsBase.push(f)));

    const stickersBase: StickerPreset[] = [];
    matched.forEach((c) => (c.include?.stickers ?? []).forEach((s) => stickersBase.push(s)));

    const pinsGlobal = [...new Set(globals.flatMap((c) => c.include?.pinKeys ?? []))];

    const favsGlobal: MarkerPreset[] = [];
    globals.forEach((c) => (c.include?.favorites ?? []).forEach((f) => favsGlobal.push(f)));

    const stickersGlobal: StickerPreset[] = [];
    globals.forEach((c) => (c.include?.stickers ?? []).forEach((s) => stickersGlobal.push(s)));

    return { pinsBase, pinsGlobal, favsBase, favsGlobal, stickersBase, stickersGlobal };
  }

private onContextMenuViewport(e: MouseEvent): void {
    if (!this.ready || !this.data) return;
    this.closeMenu();

    if (this.drawingMode === "polygon" && this.drawPolygonPoints.length >= 2) {
      e.preventDefault();
      e.stopPropagation();
      this.finishPolygonDrawing();
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
    const currentUnit = meas?.displayUnit ?? "auto-metric";
    const currentCustomId = meas?.customUnitId;

    const unitItems: ZMMenuItem[] = [
      {
        label: "Auto (m/km)",
        checked: currentUnit === "auto-metric",
        action: () => {
          this.ensureMeasurement();
          if (this.data?.measurement) {
            this.data.measurement.displayUnit = "auto-metric";
            delete this.data.measurement.customUnitId;
            void this.saveDataSoon();
            this.updateMeasureHud();
          }
          this.closeMenu();
        },
      },
      {
        label: "Auto (mi/ft)",
        checked: currentUnit === "auto-imperial",
        action: () => {
          this.ensureMeasurement();
          if (this.data?.measurement) {
            this.data.measurement.displayUnit = "auto-imperial";
            delete this.data.measurement.customUnitId;
            void this.saveDataSoon();
            this.updateMeasureHud();
          }
          this.closeMenu();
        },
      },
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

    const customDefs = this.plugin.settings.customUnits ?? [];
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

    const { pinsBase, pinsGlobal, favsBase, favsGlobal, stickersBase, stickersGlobal } =
      this.computeCollectionSets();

    const pinItemFromKey = (key: string): ZMMenuItem | null => {
      const info = this.getIconInfo(key);
      if (!info) return null;
      return {
        label: key || "(pin)",
        iconUrl: info.imgUrl,
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
        const ico = this.getIconInfo(p.iconKey);
        return {
          label: p.name || "(favorite)",
          iconUrl: ico.imgUrl,
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

    const addHereChildren: ZMMenuItem[] = [
      {
        label: "Default (open editor)",
        action: () => {
          this.addMarkerInteractive(nx, ny);
          this.closeMenu();
        },
      },
    ];
    if (pinsBaseMenu.length) {
      addHereChildren.push({ type: "separator" });
      addHereChildren.push({ label: "Pins (base)", children: pinsBaseMenu });
    }
    if (pinsGlobalMenu.length) {
      addHereChildren.push({ label: "Pins (global)", children: pinsGlobalMenu });
    }
    if (favsBaseMenu.length) {
      addHereChildren.push({ type: "separator" });
      addHereChildren.push({ label: "Favorites (base)", children: favsBaseMenu });
    }
    if (favsGlobalMenu.length) {
      addHereChildren.push({
        label: "Favorites (global)",
        children: favsGlobalMenu,
      });
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

    const items: ZMMenuItem[] = [
      { label: "Add marker here", children: addHereChildren },
    ];

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

    if (this.plugin.settings.enableDrawing) {
      drawLayerChildren.push(
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

	if (this.plugin.settings.enableDrawing) {
	  imageLayersChildren.push({
		label: "Draw layers",
		children: drawLayerChildren,
	  });
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
                this.renderMeasure();
              }
            },
          },
          { type: "separator" },
          { label: "Unit", children: unitItems },
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
	
	if (this.plugin.settings.enableDrawing) {
      items.push(
        { type: "separator" },
        {
          label: "Draw",
          children: [
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
		],
	  },
	);

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

  private closeMenu(): void {
    if (this.openMenu) {
      this.openMenu.destroy();
      this.openMenu = null;
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
      }
      this.renderMeasure();
      this.renderCalibrate();
      if (this.isCanvas()) this.renderCanvas();
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
    if (!this.imgW || !this.imgH) return;
    const s = Math.min(this.vw / this.imgW, this.vh / this.imgH);
    const scale = clamp(s, this.cfg.minZoom, this.cfg.maxZoom);
    const tx = (this.vw - this.imgW * scale) / 2;
    const ty = (this.vh - this.imgH * scale) / 2;
    this.applyTransform(scale, tx, ty);
  }

  private updateMarkerInvScaleOnly(): void {
    const invScale = this.cfg.responsive ? 1 : (1 / this.scale);
    const invs = this.markersEl.querySelectorAll<HTMLDivElement>(".zm-marker-inv");
    invs.forEach((el) => { el.style.transform = `scale(${invScale})`; });
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
    }
  }

  private deleteMarker(m: Marker): void {
    if (!this.data) return;
    this.data.markers = this.data.markers.filter((mm) => mm.id !== m.id);
    void this.saveDataSoon();
    this.renderMarkersOnly();
    new Notice("Marker deleted.", 900);
  }
  
  private openPinSizeEditor(focusIconKey?: string | null): void {
    if (!this.data) return;

    // Collect all icon keys used by non-sticker markers on this map
    const usedKeys = new Set<string>();
    for (const m of this.data.markers) {
      if (m.type === "sticker") continue;
      const key = m.iconKey ?? this.plugin.settings.defaultIconKey;
      usedKeys.add(key);
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
        this.data.pinSizeOverrides ??= {};
        const existing = this.data.pinSizeOverrides;

        // Merge updates; keep unknown keys as they are
        for (const key of Object.keys(updated)) {
          const val = updated[key];
          if (typeof val === "number" && Number.isFinite(val) && val > 0) {
            existing[key] = val;
          } else {
            delete existing[key];
          }
        }

        if (Object.keys(existing).length === 0) {
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

      if (!shape || width <= 0 || height <= 0) continue;

      const handleCtx = (ev: MouseEvent) => {
        ev.preventDefault();
        ev.stopPropagation();
        this.onDrawingContextMenu(ev, d);
      };

      const patternKind: FillPatternKind =
        style.fillPattern ?? (style.fillColor ? "solid" : "none");

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

      outline.addEventListener("contextmenu", handleCtx);
      this.drawStaticLayer.appendChild(outline);
    }
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

  // Remove baked SVG file if it exists
  if (d.bakedPath) {
    const af = this.app.vault.getAbstractFileByPath(d.bakedPath);
    if (af instanceof TFile) {
        try {
          await this.app.fileManager.trashFile(af, true);
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

    const items: ZMMenuItem[] = [
    {
      label: "Edit drawing…",
      action: () => {
        this.closeMenu();
        if (!this.data) return;
        const modal = new DrawingEditorModal(this.app, d, (res) => {
          if (!this.data) return;
          if (res.action === "save" && res.drawing) {
            const updated = res.drawing;
            const idx = (this.data.drawings ?? []).findIndex(
              (x) => x.id === d.id,
            );
            if (idx >= 0 && this.data.drawings) {
              this.data.drawings[idx].style = updated.style;
              this.data.drawings[idx].visible = updated.visible;
              this.data.drawings[idx].rect = updated.rect;
              this.data.drawings[idx].circle = updated.circle;
              this.data.drawings[idx].polygon = updated.polygon;

              delete this.data.drawings[idx].bakedPath;
              delete this.data.drawings[idx].bakedWidth;
              delete this.data.drawings[idx].bakedHeight;
            }
            void this.saveDataSoon();
            this.renderDrawings();
          } else if (res.action === "delete") {
            void this.deleteDrawing(d);
          }
        });
        modal.open();
      },
    },
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
    if (this.drawingMode === "polygon" && e.detail > 1) {
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

      const modal = new DrawingEditorModal(this.app, draft, (res) => {
        if (!this.data) return;
        if (res.action === "save" && res.drawing) {
          this.data.drawings ??= [];
          this.data.drawings.push(res.drawing);
          void this.saveDataSoon();
          this.renderDrawings();
        }
      });
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

      const modal = new DrawingEditorModal(this.app, draft, (res) => {
        if (!this.data) return;
        if (res.action === "save" && res.drawing) {
          this.data.drawings ??= [];
          this.data.drawings.push(res.drawing);
          void this.saveDataSoon();
          this.renderDrawings();
        }
      });
      modal.open();

      return true;
    }

    if (this.drawingMode === "polygon") {
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

    const modal = new DrawingEditorModal(this.app, draft, (res) => {
      if (!this.data) return;
      if (res.action === "save" && res.drawing) {
        this.data.drawings ??= [];
        this.data.drawings.push(res.drawing);
        void this.saveDataSoon();
        this.renderDrawings();
      }
    });
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

    return false;
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

    this.markersEl.empty();
    this.renderMarkersOnly();
    this.renderMeasure();
    this.renderCalibrate();
    this.renderDrawings();

    if (this.isCanvas()) this.renderCanvas();
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
        const info = this.getIconInfo(m.iconKey);

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

      if (m.type !== "sticker") {
        host.addEventListener("mouseenter", (ev) =>
          this.onMarkerEnter(ev, m, host),
        );
        host.addEventListener("mouseleave", () => this.hideTooltipSoon());
      }

      host.addEventListener("click", (ev) => {
        ev.stopPropagation();
        if (this.suppressClickMarkerId === m.id || this.dragMoved) return;
        if (m.type === "sticker") return;
        this.openMarkerLink(m);
      });

      host.addEventListener("pointerdown", (e: PointerEvent) => {
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

  private onMarkerEnter(ev: MouseEvent, m: Marker, hostEl: HTMLElement): void {
    if (m.type === "sticker") return;

    const hasTooltipText = !!m.tooltip && m.tooltip.trim().length > 0;
    const wantInternalTooltip =
      hasTooltipText && (!!m.tooltipAlwaysOn || !m.link);

    if (m.link) {
      const workspace = this.app.workspace;
      const eventForPopover = this.plugin.settings.forcePopoverWithoutModKey
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
        linktext: m.link,
        sourcePath: this.cfg.sourcePath,
      });

      if (wantInternalTooltip) {
        this.showInternalTooltip(ev, m);
      }
      return;
    }

    if (wantInternalTooltip) {
      this.showInternalTooltip(ev, m);
    }
  }

  private showInternalTooltip(ev: MouseEvent, m: Marker): void {
    if (!this.ready) return;

    const text = (m.tooltip ?? "").trim();
    if (!text) return;

    if (!this.tooltipEl) {
      this.tooltipEl = this.viewportEl.createDiv({ cls: "zm-tooltip" });
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

    this.tooltipEl.createEl("div", { text });

    this.positionTooltip(ev.clientX, ev.clientY);
    this.tooltipEl.classList.add("zm-tooltip-visible");
  }

  private positionTooltip(clientX: number, clientY: number): void {
    if (!this.tooltipEl) return;
    const pad = 12;
    const vpRect = this.viewportEl.getBoundingClientRect();
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
  
  private openMarkerLink(m: Marker): void {
    if (!m.link) return;
    void this.app.workspace.openLinkText(m.link, this.cfg.sourcePath);
  }

  private async setActiveBase(path: string): Promise<void> {
    if (!this.data) return;
    if (this.currentBasePath === path && this.imgW > 0 && this.imgH > 0) return;

    this.data.activeBase = path;
    this.data.image = path;

    if (this.isCanvas()) {
      await this.loadBaseBitmapByPath(path);
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

    const mkImgEl = (url: string) => {
      const el = this.overlaysEl.createEl("img", { cls: "zm-overlay-image" });
      el.decoding = "async";
      el.loading = "eager";
      el.src = url;
      return el;
    };

    for (const o of this.data.overlays ?? []) {
      const f = this.resolveTFile(o.path, this.cfg.sourcePath);
      if (!f) continue;
      const url = this.app.vault.getResourcePath(f);

      const pre = new Image();
      pre.decoding = "async";
      pre.src = url;
      void pre.decode().catch((error) => { console.error("Zoom Map: overlay decode error", error); })
        .finally(() => {
          const el = mkImgEl(url);
          if (!o.visible) el.classList.add("zm-overlay-hidden");
          this.overlayMap.set(o.path, el);
        });
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

    const wNow = this.el.offsetWidth;
    const hNow = this.el.offsetHeight;
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
    }, 5000); // 5 seconds display time
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
      if (typeof this.cfg.sectionStart !== "number" || typeof this.cfg.sectionEnd !== "number") return false;
      const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
      if (!(af instanceof TFile)) return false;
      const text = await this.app.vault.read(af);
      const lines = text.split("\n");
      const blk = this.findZoommapBlock(lines, this.cfg.sectionStart);
      if (!blk) return false;
      const content = lines.slice(blk.start + 1, blk.end).join("\n");
      const keyLower = key.toLowerCase();
      return content.split("\n").some((ln) => ln.trimStart().toLowerCase().startsWith(`${keyLower}:`));
    } catch {
      return false;
    }
  }
  
  private async replaceYamlScalarIfEquals(
  key: "image",
  oldValue: string,
  newValue: string,
): Promise<boolean> {
  if (typeof this.cfg.sectionStart !== "number" || typeof this.cfg.sectionEnd !== "number") {
    return false;
  }

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
    const blk = this.findZoommapBlock(lines, this.cfg.sectionStart);
    if (!blk) return text;

    foundBlock = true;

    const content = lines.slice(blk.start + 1, blk.end);
    let changed = false;

    const keyRe = /^(\s*)image\s*:\s*(.*)$/i;

    const out = content.map((ln) => {
      const m = keyRe.exec(ln);
      if (!m) return ln;

      const indent = m[1] ?? "";
      const rhs = m[2] ?? "";
      const val = stripQuotes(rhs);

      if (val === oldValue) {
        changed = true;
        return `${indent}image: ${JSON.stringify(newValue)}`;
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
      this.data.image = newActive;
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
    this.data.measurement.scales[base] = metersPerPixel;

    if (await this.store.wouldChange(this.data)) {
      this.ignoreNextModify = true;
      await this.store.save(this.data);
    }
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
    if (typeof this.cfg.sectionStart !== "number" || typeof this.cfg.sectionEnd !== "number") return false;
    const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
    if (!(af instanceof TFile)) return false;

    let foundBlock = false;

    await this.app.vault.process(af, (text) => {
    const lines = text.split("\n");
    const blk = this.findZoommapBlock(lines, this.cfg.sectionStart);
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
  if (typeof this.cfg.sectionStart !== "number" || typeof this.cfg.sectionEnd !== "number") {
    return false;
  }

  const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
  if (!(af instanceof TFile)) return false;

  let foundBlock = false;

  await this.app.vault.process(af, (text) => {
    const lines = text.split("\n");
    const blk = this.findZoommapBlock(lines, this.cfg.sectionStart);
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

  for (let i = 0; i < out.length; i++) {
    const m = keyRe.exec(out[i]);
    if (m) {
      keyIdx = i;
      keyIndent = m[1] ?? "";
      break;
    }
  }
  if (keyIdx < 0) return { changed: false, out };

  const isNextTopLevelKey = (ln: string) => {
    const trimmed = ln.trim();
    if (!trimmed) return false;
    if (trimmed.startsWith("#")) return false;
    const spaces = (/^\s*/.exec(ln))?.[0].length ?? 0;
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
    nextOut[keyIdx] = `${keyIndent}${key}: []`;
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
      const ln = lines[i].trimStart().toLowerCase();
      if (ln.startsWith("```zoommap")) {
        let j = i + 1;
        while (j < lines.length && !lines[j].trimStart().startsWith("```")) j++;
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

    for (let i = 0; i < out.length; i++) {
      const m = keyRe.exec(out[i]);
      if (m) {
        keyIdx = i;
        keyIndent = m[1] ?? "";
        after = (m[2] ?? "").trim();
        break;
      }
    }

    const jsonQuoted = JSON.stringify(path);
    const nm = opts?.name ?? "";
    const itemLines: string[] = [];
    const itemIndent = `${keyIndent}  `;
    itemLines.push(`${itemIndent}- path: ${jsonQuoted}`);
    itemLines.push(`${itemIndent}  name: ${JSON.stringify(nm)}`);

    if (keyIdx >= 0) {
      if (/^\[\s*\]$/.exec(after)) out[keyIdx] = `${keyIndent}${key}:`;

      let insertAt = keyIdx + 1;
      let scan = keyIdx + 1;

      const isNextTopLevelKey = (ln: string) => {
        const trimmed = ln.trim();
        if (!trimmed) return false;
        if (trimmed.startsWith("#")) return false;
        const spaces = (/^\s*/.exec(ln))?.[0].length ?? 0;
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

    const defaultIndent = this.detectYamlKeyIndent(out);
    out.push(`${defaultIndent}${key}:`);
    out.push(...itemLines);
    return { changed: true, out };
  }

  private detectYamlKeyIndent(lines: string[]): string {
    for (const ln of lines) {
      const m = /^(\s*)[A-Za-z0-9_-]+\s*:/.exec(ln);
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
      this.data.markers = this.data.markers.filter((m) => m.layer !== layer.id);
    }

    this.data.layers = this.data.layers.filter((l) => l.id !== layer.id);
    await this.saveDataSoon();
    this.renderMarkersOnly();
    new Notice("Layer deleted.", 1000);
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