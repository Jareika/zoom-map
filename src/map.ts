import {
  App,
  Component,
  Notice,
  TFile,
  parseYaml
} from "obsidian";
import { Marker, MarkerFileData, MarkerStore, generateId, ImageOverlay, BaseImage, MarkerLayer } from "./markerStore";
import type ZoomMapPlugin from "./main";
import { MarkerEditorModal } from "./markerEditor";
import { ScaleCalibrateModal } from "./scaleCalibrateModal";

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
}

export interface IconProfile {
  key: string;
  pathOrDataUrl: string;
  size: number;
  anchorX: number;
  anchorY: number;
}

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

export interface ZoomMapSettings {
  icons: IconProfile[];
  defaultIconKey: string;
  wheelZoomFactor: number;
  panMouseButton: "left" | "middle";
  hoverMaxWidth: number;
  hoverMaxHeight: number;
  presets: MarkerPreset[];
  stickerPresets: StickerPreset[]; // v0.4.4
  defaultWidth: string;
  defaultHeight: string;
  defaultResizable: boolean;
  defaultResizeHandle: "left" | "right" | "both" | "native";
  forcePopoverWithoutModKey: boolean;

  measureLineColor: string;
  measureLineWidth: number;
}

type Point = { x: number; y: number };
function clamp(n: number, min: number, max: number) { return Math.min(Math.max(n, min), max); }
function basename(p: string): string { const idx = p.lastIndexOf("/"); return idx >= 0 ? p.slice(idx + 1) : p; }

type LayerTriState = "visible" | "locked" | "hidden";

export class MapInstance extends Component {
  private app: App;
  private plugin: ZoomMapPlugin;
  private el: HTMLElement;

  private viewportEl!: HTMLDivElement;
  private worldEl!: HTMLDivElement;

  private imgEl!: HTMLImageElement;
  private overlaysEl!: HTMLDivElement;
  private markersEl!: HTMLDivElement;

  private measureEl!: HTMLDivElement;
  private measureSvg!: SVGSVGElement;
  private measurePath!: SVGPathElement;
  private measureDots!: SVGGElement;
  private calibPath!: SVGPathElement;
  private calibDots!: SVGGElement;
  private measureHud!: HTMLDivElement;

  private overlayMap: Map<string, HTMLImageElement> = new Map();

  private baseCanvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private baseBitmap: ImageBitmap | null = null;

  private overlaySources: Map<string, CanvasImageSource> = new Map();
  private overlayLoading: Map<string, Promise<CanvasImageSource | null>> = new Map();

  private cfg: ZoomMapConfig;
  private store: MarkerStore;
  private data!: MarkerFileData | undefined;

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

  private panRAF: number | null = null;
  private panAccDx = 0;
  private panAccDy = 0;

  private activePointers: Map<number, { x: number; y: number }> = new Map();
  private pinchActive = false;
  private pinchStartScale = 1;
  private pinchStartDist = 0;
  private pinchPrevCenter: { x: number; y: number } | null = null;

  private currentBasePath: string | null = null;

  private frameSaveTimer: number | null = null;
  private userResizing = false;

  constructor(app: App, plugin: ZoomMapPlugin, el: HTMLElement, cfg: ZoomMapConfig) {
    super();
    this.app = app;
    this.plugin = plugin;
    this.el = el;
    this.cfg = cfg;
    this.store = new MarkerStore(app, cfg.sourcePath, cfg.markersPath);
  }

  private isCanvas(): boolean { return this.cfg.renderMode === "canvas"; }

  onload(): void {
    this.bootstrap().catch(err => {
      console.error(err);
      new Notice(`Zoom Map error: ${err.message}`, 6000);
    });
  }
  onunload(): void {
    if (this.tooltipEl?.isConnected) this.tooltipEl.remove();
    if (this.ro) this.ro.disconnect();
    this.closeMenu();
    this.disposeBitmaps();
  }

  private async bootstrap() {
    this.el.classList.add("zm-root");
    if (this.cfg.width)  this.el.style.width = this.cfg.width;
    if (this.cfg.height) this.el.style.height = this.cfg.height;

    if (this.cfg.resizable) {
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
    (this.cfg.extraClasses ?? []).forEach(c => this.el.classList.add(c));

    this.viewportEl = this.el.createDiv({ cls: "zm-viewport" });

    if (this.isCanvas()) {
      this.baseCanvas = this.viewportEl.createEl("canvas", { cls: "zm-canvas" });
      this.ctx = this.baseCanvas.getContext("2d");
    }

    this.worldEl = this.viewportEl.createDiv({ cls: "zm-world" });

    this.imgEl = this.worldEl.createEl("img", { cls: "zm-image" });
    this.overlaysEl = this.worldEl.createDiv({ cls: "zm-overlays" });
    this.markersEl = this.worldEl.createDiv({ cls: "zm-markers" });
    if (this.isCanvas()) {
      this.imgEl.style.display = "none";
      this.overlaysEl.style.display = "none";
    }

    this.measureHud = this.viewportEl.createDiv({ cls: "zm-measure-hud" });
    this.measureHud.style.display = "none";

    this.registerDomEvent(this.viewportEl, "wheel", (e: WheelEvent) => {
      if ((e.target as HTMLElement)?.closest(".popover")) return;
      e.preventDefault(); e.stopPropagation();
      this.onWheel(e);
    });
    this.registerDomEvent(this.viewportEl, "pointerdown", (e: PointerEvent) => {
      e.preventDefault(); e.stopPropagation(); this.closeMenu(); this.onPointerDownViewport(e);
    });
    this.registerDomEvent(window, "pointermove", (e: PointerEvent) => this.onPointerMove(e));
    this.registerDomEvent(window, "pointerup",   (e: PointerEvent) => {
      if (this.activePointers.has(e.pointerId)) this.activePointers.delete(e.pointerId);
      if (this.pinchActive && this.activePointers.size < 2) this.endPinch();
      e.preventDefault();
      this.onPointerUp();
    });
    this.registerDomEvent(window, "pointercancel", (e: PointerEvent) => {
      if (this.activePointers.has(e.pointerId)) this.activePointers.delete(e.pointerId);
      if (this.pinchActive && this.activePointers.size < 2) this.endPinch();
    });

    this.registerDomEvent(this.viewportEl, "dblclick",   (e: MouseEvent) => { e.preventDefault(); e.stopPropagation(); this.closeMenu(); this.onDblClickViewport(e); });
    this.registerDomEvent(this.viewportEl, "click",      (e: MouseEvent) => { e.preventDefault(); e.stopPropagation(); this.onClickViewport(e); });
    this.registerDomEvent(this.viewportEl, "contextmenu",(e: MouseEvent) => { e.preventDefault(); e.stopPropagation(); this.onContextMenuViewport(e); });
    this.registerDomEvent(window, "keydown", (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (this.calibrating) { this.calibrating = false; this.calibPts = []; this.calibPreview = null; this.renderCalibrate(); new Notice("Calibration cancelled.", 900); }
        else if (this.measuring) { this.measuring = false; this.measurePreview = null; this.updateMeasureHud(); }
        this.closeMenu();
      }
    });

    this.registerEvent(this.app.vault.on("modify", async (f) => {
      const file = f as TFile;
      if (file?.path === this.store.getPath()) {
        if (this.ignoreNextModify) { this.ignoreNextModify = false; return; }
        await this.reloadMarkers();
      }
    }));

    await this.loadInitialBase(this.cfg.imagePath);

    await this.store.ensureExists(this.cfg.imagePath, { w: this.imgW, h: this.imgH });
    this.data = await this.store.load();

    if (this.cfg.yamlMetersPerPixel && this.getMetersPerPixel() === undefined) {
      this.ensureMeasurement();
      const base = this.getActiveBasePath();
      this.data!.measurement!.metersPerPixel = this.cfg.yamlMetersPerPixel;
      this.data!.measurement!.scales![base] = this.cfg.yamlMetersPerPixel;
      if (await this.store.wouldChange(this.data!)) { this.ignoreNextModify = true; await this.store.save(this.data!); }
    }

    if (!this.data!.size?.w || !this.data!.size?.h) {
      this.data!.size = { w: this.imgW, h: this.imgH };
      if (await this.store.wouldChange(this.data!)) { this.ignoreNextModify = true; await this.store.save(this.data!); }
    }

    if (this.shouldUseSavedFrame() && this.data?.frame && this.data.frame.w > 0 && this.data.frame.h > 0) {
      this.el.style.width = `${this.data.frame.w}px`;
      this.el.style.height = `${this.data.frame.h}px`;
    }

    this.ro = new ResizeObserver(() => this.onResize());
    this.ro.observe(this.el);
    this.register(() => this.ro?.disconnect());

    this.fitToView();
    await this.applyActiveBaseAndOverlays();
    this.setupMeasureOverlay();

    this.applyMeasureStyle();

    this.renderAll();
    this.ready = true;
  }

  private disposeBitmaps() {
    try { this.baseBitmap?.close?.(); } catch {}
    this.baseBitmap = null;
    for (const src of this.overlaySources.values()) {
      try { (src as ImageBitmap)?.close?.(); } catch {}
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
    try { await img.decode(); } catch { return null; }
    try { return await createImageBitmap(img); } catch { return null; }
  }

  private async loadBaseBitmapByPath(path: string) {
    const bmp = await this.loadBitmapFromPath(path);
    if (!bmp) throw new Error(`Failed to load image: ${path}`);
    try { this.baseBitmap?.close?.(); } catch {}
    this.baseBitmap = bmp;
    this.imgW = bmp.width;
    this.imgH = bmp.height;
    this.currentBasePath = path;
  }

  private async loadCanvasSourceFromPath(path: string): Promise<CanvasImageSource | null> {
    const f = this.resolveTFile(path, this.cfg.sourcePath);
    if (!f) return null;
    const url = this.app.vault.getResourcePath(f);
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    try { await img.decode(); } catch (e) { console.warn("Overlay decode warning:", path, e); }
    try { return await createImageBitmap(img); } catch { return img; }
  }
  private closeCanvasSource(src: CanvasImageSource | null) {
    try { (src as ImageBitmap)?.close?.(); } catch {}
  }
  private async ensureOverlayLoaded(path: string): Promise<CanvasImageSource | null> {
    if (this.overlaySources.has(path)) return this.overlaySources.get(path)!;
    if (this.overlayLoading.has(path)) return await this.overlayLoading.get(path)!;

    const p = this.loadCanvasSourceFromPath(path)
      .then(res => {
        this.overlayLoading.delete(path);
        if (res) this.overlaySources.set(path, res);
        return res;
      })
      .catch(err => {
        this.overlayLoading.delete(path);
        console.warn("Overlay load failed:", path, err);
        return null;
      });

    this.overlayLoading.set(path, p);
    return await p;
  }
  private async ensureVisibleOverlaysLoaded(): Promise<void> {
    if (!this.data) return;
    const wantVisible = new Set((this.data.overlays ?? []).filter(o => o.visible).map(o => o.path));
    for (const [path, src] of this.overlaySources) {
      if (!wantVisible.has(path)) {
        this.overlaySources.delete(path);
        this.closeCanvasSource(src);
      }
    }
    for (const path of wantVisible) {
      if (!this.overlaySources.has(path)) {
        await this.ensureOverlayLoaded(path);
      }
    }
  }

  private renderCanvas() {
    if (!this.isCanvas()) return;
    if (!this.baseCanvas || !this.ctx || !this.baseBitmap) return;

    const r = this.viewportEl.getBoundingClientRect();
    this.vw = r.width; this.vh = r.height;

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
    ctx.imageSmoothingQuality = (this.scale < 0.18) ? "low" : "medium";

    ctx.drawImage(this.baseBitmap, 0, 0);

    if (this.data?.overlays?.length) {
      for (const o of this.data.overlays) {
        if (!o.visible) continue;
        const src = this.overlaySources.get(o.path);
        if (src) ctx.drawImage(src, 0, 0);
      }
    }
  }

  private setupMeasureOverlay() {
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

  private renderMeasure() {
    if (!this.measureSvg) return;
    this.measureSvg.setAttribute("width", String(this.imgW));
    this.measureSvg.setAttribute("height", String(this.imgH));

    const pts: Point[] = [...this.measurePts];
    if (this.measuring && this.measurePreview) pts.push(this.measurePreview);

    const toAbs = (p: Point) => ({ x: p.x * this.imgW, y: p.y * this.imgH });
    let d = "";
    pts.forEach((p, i) => {
      const a = toAbs(p);
      d += (i === 0 ? `M ${a.x} ${a.y}` : ` L ${a.x} ${a.y}`);
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

  private renderCalibrate() {
    if (!this.measureSvg) return;
    const toAbs = (p: Point) => ({ x: p.x * this.imgW, y: p.y * this.imgH });
    const pts: Point[] = [...this.calibPts];
    if (this.calibrating && this.calibPts.length === 1 && this.calibPreview) pts.push(this.calibPreview);

    let d = "";
    pts.forEach((p, i) => {
      const a = toAbs(p);
      d += (i === 0 ? `M ${a.x} ${a.y}` : ` L ${a.x} ${a.y}`);
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

  private clearMeasure() {
    this.measurePts = [];
    this.measurePreview = null;
    this.renderMeasure();
  }

  private getMetersPerPixel(): number | undefined {
    const base = this.getActiveBasePath();
    const m = this.data?.measurement;
    return (m?.scales && base in m.scales) ? m.scales[base] : m?.metersPerPixel;
  }

  private ensureMeasurement() {
    if (!this.data!.measurement) this.data!.measurement = { displayUnit: "auto-metric", metersPerPixel: undefined, scales: {} };
    if (!this.data!.measurement!.scales) this.data!.measurement!.scales = {};
    if (!this.data!.measurement!.displayUnit) this.data!.measurement!.displayUnit = "auto-metric";
  }

  private updateMeasureHud() {
    if (!this.measureHud) return;
    const meters = this.computeDistanceMeters();
    if (this.measuring || (this.measurePts.length >= 2)) {
      const txt = meters != null ? this.formatDistance(meters) : "no scale";
      this.measureHud.textContent = `Distance: ${txt}`;
      this.measureHud.style.display = "block";
    } else {
      this.measureHud.style.display = "none";
    }
  }

  private computeDistanceMeters(): number | null {
    if (!this.data) return null;

    if (this.measurePts.length < 2 && !(this.measuring && this.measurePts.length >= 1 && this.measurePreview)) return null;

    const pts: Point[] = [...this.measurePts];
    if (this.measuring && this.measurePreview) pts.push(this.measurePreview);

    let px = 0;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      const dx = (b.x - a.x) * this.imgW;
      const dy = (b.y - a.y) * this.imgH;
      px += Math.hypot(dx, dy);
    }
    const mpp = this.getMetersPerPixel();
    if (!mpp) return null;
    return px * mpp;
  }

  private formatDistance(m: number): string {
    const unit = this.data?.measurement?.displayUnit ?? "auto-metric";
    const round = (v: number, d = 2) => (Math.round(v * Math.pow(10, d)) / Math.pow(10, d));

    switch (unit) {
      case "m":  return `${Math.round(m)} m`;
      case "km": return `${round(m / 1000, 3)} km`;
      case "mi": return `${round(m / 1609.344, 3)} mi`;
      case "ft": return `${Math.round(m / 0.3048)} ft`;
      case "auto-imperial": {
        const mi = m / 1609.344;
        return mi >= 0.25 ? `${round(mi, 2)} mi` : `${Math.round(m / 0.3048)} ft`;
      }
      case "auto-metric":
      default:
        return m >= 1000 ? `${round(m / 1000, 2)} km` : `${Math.round(m)} m`;
    }
  }

  private async loadInitialBase(path: string) {
    if (this.isCanvas()) await this.loadBaseBitmapByPath(path);
    else await this.loadBaseImageByPath(path);
  }

  private async loadBaseImageByPath(path: string) {
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

  private onResize() {
    if (!this.ready || !this.data) {
      if (this.isCanvas()) this.renderCanvas();
      return;
    }
    const r = this.viewportEl.getBoundingClientRect();
    this.vw = r.width; this.vh = r.height;
    this.applyTransform(this.scale, this.tx, this.ty, true);

    if (this.shouldUseSavedFrame() && this.cfg.resizable && this.cfg.resizeHandle === "native" && !this.userResizing) {
      this.requestPersistFrame();
    }
  }

  private onWheel(e: WheelEvent) {
    if (!this.ready) return;
    const factor = this.plugin.settings.wheelZoomFactor || 1.1;
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

  private onPointerDownViewport(e: PointerEvent) {
    if (!this.ready) return;

    this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    (e.target as Element).setPointerCapture?.(e.pointerId);

    if ((e.target as HTMLElement).closest(".zm-marker")) return;

    if (this.activePointers.size === 2) {
      this.startPinch();
      return;
    }

    if (this.pinchActive) return;
    if (!this.panButtonMatches(e)) return;

    this.draggingView = true;
    this.lastPos = { x: e.clientX, y: e.clientY };
  }

  private onPointerMove(e: PointerEvent) {
    if (!this.ready) return;

    if (this.activePointers.has(e.pointerId)) {
      this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    if (this.pinchActive) {
      this.updatePinch();
      return;
    }

    if (this.draggingMarkerId && this.data) {
      const m = this.data.markers.find(mm => mm.id === this.draggingMarkerId);
      if (!m) return;
      const vpRect = this.viewportEl.getBoundingClientRect();
      const vx = e.clientX - vpRect.left;
      const vy = e.clientY - vpRect.top;
      const wx = (vx - this.tx) / this.scale;
      const wy = (vy - this.ty) / this.scale;

      const off = this.dragAnchorOffset ?? { dx: 0, dy: 0 };
      const nx = clamp((wx - off.dx) / this.imgW, 0, 1);
      const ny = clamp((wy - off.dy) / this.imgH, 0, 1);

      const movedEnough = Math.hypot((nx - m.x) * this.imgW, (ny - m.y) * this.imgH) > 1;
      if (movedEnough) this.dragMoved = true;

      m.x = nx; m.y = ny;
      this.renderMarkersOnly();
      return;
    }

    if (this.measuring) {
      const vpRect = this.viewportEl.getBoundingClientRect();
      const vx = e.clientX - vpRect.left;
      const vy = e.clientY - vpRect.top;
      const wx = (vx - this.tx) / this.scale;
      const wy = (vy - this.ty) / this.scale;
      this.measurePreview = { x: clamp(wx / this.imgW, 0, 1), y: clamp(wy / this.imgH, 0, 1) };
      this.renderMeasure();
    }

    if (this.calibrating && this.calibPts.length === 1) {
      const vpRect = this.viewportEl.getBoundingClientRect();
      const vx = e.clientX - vpRect.left;
      const vy = e.clientY - vpRect.top;
      const wx = (vx - this.tx) / this.scale;
      const wy = (vy - this.ty) / this.scale;
      this.calibPreview = { x: clamp(wx / this.imgW, 0, 1), y: clamp(wy / this.imgH, 0, 1) };
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

  private onPointerUp() {
    if (this.draggingMarkerId) {
      if (this.dragMoved) { this.suppressClickMarkerId = this.draggingMarkerId; setTimeout(() => { this.suppressClickMarkerId = null; }, 0); this.saveDataSoon(); }
      this.draggingMarkerId = null; this.dragAnchorOffset = null; this.dragMoved = false; document.body.style.cursor = "";
    }
    this.draggingView = false;
    this.panAccDx = 0; this.panAccDy = 0;
    if (this.panRAF != null) { cancelAnimationFrame(this.panRAF); this.panRAF = null; }
  }

  private startPinch() {
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
  private updatePinch() {
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
  private endPinch() {
    this.pinchActive = false;
       this.pinchPrevCenter = null;
    this.pinchStartDist = 0;
  }

  private getTwoPointers(): [{ x: number; y: number }, { x: number; y: number }] | null {
    if (this.activePointers.size !== 2) return null;
    const it = Array.from(this.activePointers.values());
    return [it[0], it[1]];
  }
  private dist(a: {x:number;y:number}, b: {x:number;y:number}) { return Math.hypot(a.x - b.x, a.y - b.y); }
  private mid(a: {x:number;y:number}, b: {x:number;y:number}) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }

  private onDblClickViewport(e: MouseEvent) {
    if (!this.ready) return;
    if (this.measuring) { this.measuring = false; this.measurePreview = null; this.updateMeasureHud(); return; }
    if ((e.target as HTMLElement).closest(".zm-marker")) return;
    const vpRect = this.viewportEl.getBoundingClientRect();
    const cx = e.clientX - vpRect.left;
    const cy = e.clientY - vpRect.top;
    this.zoomAt(cx, cy, 1.5);
  }
  private onClickViewport(e: MouseEvent) {
    if (!this.ready) return;

    if (this.calibrating) {
      const vpRect = this.viewportEl.getBoundingClientRect();
      const vx = e.clientX - vpRect.left;
      const vy = e.clientY - vpRect.top;
      const wx = (vx - this.tx) / this.scale;
      const wy = (vy - this.ty) / this.scale;
      const p = { x: clamp(wx / this.imgW, 0, 1), y: clamp(wy / this.imgH, 0, 1) };
      this.calibPts.push(p);
      if (this.calibPts.length === 2) {
        const pxDist = Math.hypot(
          (this.calibPts[1].x - this.calibPts[0].x) * this.imgW,
          (this.calibPts[1].y - this.calibPts[0].y) * this.imgH
        );
        new ScaleCalibrateModal(this.app, pxDist, async ({ metersPerPixel }) => {
          this.ensureMeasurement();
          const base = this.getActiveBasePath();
          this.data!.measurement!.metersPerPixel = metersPerPixel;
          this.data!.measurement!.scales![base] = metersPerPixel;
          if (await this.store.wouldChange(this.data!)) { this.ignoreNextModify = true; await this.store.save(this.data!); }
          new Notice(`Scale set: ${metersPerPixel.toFixed(6)} m/px`, 2000);
          this.calibrating = false; this.calibPts = []; this.calibPreview = null; this.renderCalibrate(); this.updateMeasureHud();
        }).open();
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
      const p = { x: clamp(wx / this.imgW, 0, 1), y: clamp(wy / this.imgH, 0, 1) };
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
      this.addMarkerInteractive(nx, ny).catch(console.error);
    }
  }

  // Tri-State: visible -> locked -> hidden -> visible
  private getLayerById(id: string): MarkerLayer | undefined {
    return this.data?.layers.find(l => l.id === id);
  }
  private getLayerState(layer: MarkerLayer): LayerTriState {
    if (!layer.visible) return "hidden";
    return layer.locked ? "locked" : "visible";
  }
  private advanceLayerState(layer: MarkerLayer): LayerTriState {
    const cur = this.getLayerState(layer);
    let next: LayerTriState;
    if (cur === "hidden") { layer.visible = true; layer.locked = false; next = "visible"; }
    else if (cur === "visible") { layer.visible = true; layer.locked = true; next = "locked"; }
    else { layer.visible = false; layer.locked = false; next = "hidden"; }
    return next;
  }
  private isLayerLocked(layerId: string): boolean {
    const l = this.getLayerById(layerId);
    return !!(l && l.visible && l.locked);
  }

  private onContextMenuViewport(e: MouseEvent) {
    if (!this.ready || !this.data) return;
    this.closeMenu();

    const vpRect = this.viewportEl.getBoundingClientRect();
    const vx = e.clientX - vpRect.left;
    const vy = e.clientY - vpRect.top;
    const wx = (vx - this.tx) / this.scale;
    const wy = (vy - this.ty) / this.scale;
    const nx = clamp(wx / this.imgW, 0, 1);
    const ny = clamp(wy / this.imgH, 0, 1);

    const bases = this.getBasesNormalized();
    // FIX: Update checkmark live when switching base images
    const baseItems = bases.map((b) => ({
      label: b.name ?? basename(b.path),
      checked: (this.getActiveBasePath() === b.path),
      action: async (rowEl: HTMLDivElement) => {
        await this.setActiveBase(b.path);
        // Uncheck all siblings in the same submenu and check the clicked one
        const submenu = rowEl.parentElement as HTMLElement | null;
        if (submenu) {
          const rows = submenu.querySelectorAll<HTMLDivElement>(".zm-menu__item");
          rows.forEach(r => {
            const c = r.querySelector<HTMLElement>(".zm-menu__check");
            if (c) c.textContent = "";
          });
          const chk = rowEl.querySelector<HTMLElement>(".zm-menu__check");
          if (chk) chk.textContent = "✓";
        }
      }
    }));

    const overlayItems = (this.data.overlays ?? []).map((o) => ({
      label: o.name ?? basename(o.path),
      checked: !!o.visible,
      action: async (rowEl: HTMLDivElement) => {
        o.visible = !o.visible;
        await this.saveDataSoon();
        await this.updateOverlayVisibility();
        const chk = rowEl.querySelector(".zm-menu__check") as HTMLElement | null;
        if (chk) chk.textContent = o.visible ? "✓" : "";
      }
    }));

    const unit = this.data.measurement?.displayUnit ?? "auto-metric";
    const unitItems: ZMMenuItem[] = [
      { label: "Auto (m/km)", checked: unit === "auto-metric",   action: async () => { this.ensureMeasurement(); this.data!.measurement!.displayUnit = "auto-metric";   if (await this.store.wouldChange(this.data!)) { this.ignoreNextModify = true; await this.store.save(this.data!); } this.updateMeasureHud(); } },
      { label: "Auto (mi/ft)", checked: unit === "auto-imperial", action: async () => { this.ensureMeasurement(); this.data!.measurement!.displayUnit = "auto-imperial"; if (await this.store.wouldChange(this.data!)) { this.ignoreNextModify = true; await this.store.save(this.data!); } this.updateMeasureHud(); } },
      { label: "m",  checked: unit === "m",  action: async () => { this.ensureMeasurement(); this.data!.measurement!.displayUnit = "m";  if (await this.store.wouldChange(this.data!)) { this.ignoreNextModify = true; await this.store.save(this.data!); } this.updateMeasureHud(); } },
      { label: "km", checked: unit === "km", action: async () => { this.ensureMeasurement(); this.data!.measurement!.displayUnit = "km"; if (await this.store.wouldChange(this.data!)) { this.ignoreNextModify = true; await this.store.save(this.data!); } this.updateMeasureHud(); } },
      { label: "mi", checked: unit === "mi", action: async () => { this.ensureMeasurement(); this.data!.measurement!.displayUnit = "mi"; if (await this.store.wouldChange(this.data!)) { this.ignoreNextModify = true; await this.store.save(this.data!); } this.updateMeasureHud(); } },
      { label: "ft", checked: unit === "ft", action: async () => { this.ensureMeasurement(); this.data!.measurement!.displayUnit = "ft"; if (await this.store.wouldChange(this.data!)) { this.ignoreNextModify = true; await this.store.save(this.data!); } this.updateMeasureHud(); } }
    ];

    const items: ZMMenuItem[] = [
      { label: "Add marker here", action: () => this.addMarkerInteractive(nx, ny) }
    ];

    const favPins = (this.plugin.settings.presets ?? []).map(p => {
      const ico = this.getIconInfo(p.iconKey);
      return {
        label: p.name || "(unnamed)",
        iconUrl: ico.imgUrl,
        action: () => this.placePresetAt(p, nx, ny)
      } as ZMMenuItem;
    });

    const favStickers = (this.plugin.settings.stickerPresets ?? []).map(sp => {
      const url = this.resolveResourceUrl(sp.imagePath);
      return {
        label: sp.name || "(unnamed)",
        iconUrl: url,
        action: () => this.placeStickerPresetAt(sp, nx, ny)
      } as ZMMenuItem;
    });

    if (favPins.length > 0) {
      items.push({ label: "Favorites", children: favPins });
    }
    if (favStickers.length > 0) {
      items.push({ label: "Stickers", children: favStickers });
    }

    // Tri-State für Marker-Layer
    const layerChildren: ZMMenuItem[] = this.data.layers.map(layer => {
      const state = this.getLayerState(layer);
      const { mark, color } = this.triStateIndicator(state);
      return {
        label: layer.name,
        mark,
        markColor: color,
        action: async (rowEl: HTMLDivElement) => {
          const next = this.advanceLayerState(layer);
          await this.saveDataSoon();
          this.renderMarkersOnly();
          // Indikator im Menü aktualisieren ohne das Menü zu schließen
          const chk = rowEl.querySelector(".zm-menu__check") as HTMLElement | null;
          if (chk) {
            const m = this.triStateIndicator(next);
            chk.textContent = this.symbolForMark(m.mark);
            if (m.color) chk.style.color = m.color;
            else chk.removeAttribute("style");
          }
        }
      };
    });

    items.push(
      { type: "separator" },
      { label: "Image layers",
        children: [
          { label: "Base", children: baseItems },
          { label: "Overlays", children: overlayItems },
          { type: "separator" },
          { label: "Reload from YAML", action: () => this.reloadYamlFromSource() }
        ]
      },
      { label: "Measure", children: [
        { label: this.measuring ? "Stop measuring" : "Start measuring", action: () => { this.measuring = !this.measuring; if (!this.measuring) this.measurePreview = null; this.updateMeasureHud(); this.renderMeasure(); } },
        { label: "Clear measurement", action: () => { this.clearMeasure(); } },
        { label: "Remove last point", action: () => { if (this.measurePts.length > 0) { this.measurePts.pop(); this.renderMeasure(); } } },
        { type: "separator" },
        { label: "Unit", children: unitItems },
        { type: "separator" },
        { label: this.calibrating ? "Stop calibration" : "Calibrate scale…", action: () => {
          if (this.calibrating) { this.calibrating = false; this.calibPts = []; this.calibPreview = null; this.renderCalibrate(); }
          else { this.calibrating = true; this.calibPts = []; this.calibPreview = null; this.renderCalibrate(); new Notice("Calibration: click two points.", 1500); }
        } }
      ]},
      {
        label: "Marker layers",
        children: layerChildren
      },
      { type: "separator" },
      { label: "Zoom +", action: () => this.zoomAt(vx, vy, 1.2) },
      { label: "Zoom −", action: () => this.zoomAt(vx, vy, 1/1.2) },
      { label: "Fit to window", action: () => this.fitToView() },
      { label: "Reset view", action: () => this.applyTransform(1, (this.vw - this.imgW) / 2, (this.vh - this.imgH) / 2) }
    );

    this.openMenu = new ZMMenu();
    this.openMenu.open(e.clientX, e.clientY, items);

    // Menü offen lassen; nur Outside-Click / Esc / neuer Kontextklick schließt
    const outside = (ev: Event) => { if (!this.openMenu) return; const t = ev.target as HTMLElement | null; if (t && this.openMenu.contains(t)) return; this.closeMenu(); };
    const keyClose   = (ev: KeyboardEvent) => { if (ev.key === "Escape") this.closeMenu(); };
    const rightClickClose = () => this.closeMenu();

    document.addEventListener("pointerdown", outside, { capture: true });
    // kein Wheel-Close mehr
    document.addEventListener("contextmenu", rightClickClose, { capture: true });
    document.addEventListener("keydown", keyClose, { capture: true });
    this.register(() => {
      document.removeEventListener("pointerdown", outside, { capture: true } as any);
      document.removeEventListener("contextmenu", rightClickClose, { capture: true } as any);
      document.removeEventListener("keydown", keyClose, { capture: true } as any);
    });
  }
  private closeMenu() { if (this.openMenu) { this.openMenu.destroy(); this.openMenu = null; } }

  private triStateIndicator(state: LayerTriState): { mark: "check" | "x" | "minus"; color?: string } {
    if (state === "visible") return { mark: "check" };
    if (state === "locked")  return { mark: "x", color: "var(--text-error, #d23c3c)" };
    return { mark: "minus", color: "var(--text-muted)" };
  }
  private symbolForMark(mark: "check" | "x" | "minus"): string {
    switch (mark) {
      case "x": return "×";
      case "minus": return "–";
      default: return "✓";
    }
  }

  private applyTransform(scale: number, tx: number, ty: number, render = true) {
    const prevScale = this.scale;

    const s = clamp(scale, this.cfg.minZoom, this.cfg.maxZoom);
    const scaledW = this.imgW * s, scaledH = this.imgH * s;

    let minTx = this.vw - scaledW, maxTx = 0;
    let minTy = this.vh - scaledH, maxTy = 0;

    if (scaledW <= this.vw) tx = (this.vw - scaledW) / 2; else tx = clamp(tx, minTx, maxTx);
    if (scaledH <= this.vh) ty = (this.vh - scaledH) / 2; else ty = clamp(ty, minTy, maxTy);

    const txr = Math.round(tx);
    const tyr = Math.round(ty);

    this.scale = s; this.tx = txr; this.ty = tyr;

    this.worldEl.style.transform = `translate3d(${this.tx}px, ${this.ty}px, 0) scale3d(${this.scale}, ${this.scale}, 1)`;

    if (render) {
      if (prevScale !== s) this.updateMarkerInvScaleOnly();
      this.renderMeasure();
      this.renderCalibrate();
      if (this.isCanvas()) this.renderCanvas();
    }
  }
  private panBy(dx: number, dy: number) { this.applyTransform(this.scale, this.tx + dx, this.ty + dy); }
  private zoomAt(cx: number, cy: number, factor: number) {
    const sOld = this.scale, sNew = clamp(sOld * factor, this.cfg.minZoom, this.cfg.maxZoom);
    const wx = (cx - this.tx) / sOld, wy = (cy - this.ty) / sOld;
    const txNew = cx - wx * sNew, tyNew = cy - wy * sNew;
    this.applyTransform(sNew, txNew, tyNew);
  }
  private fitToView() {
    const r = this.viewportEl.getBoundingClientRect();
    this.vw = r.width; this.vh = r.height;
    if (!this.imgW || !this.imgH) return;
    const s = Math.min(this.vw / this.imgW, this.vh / this.imgH);
    const scale = clamp(s, this.cfg.minZoom, this.cfg.maxZoom);
    const tx = (this.vw - this.imgW * scale) / 2;
    const ty = (this.vh - this.imgH * scale) / 2;
    this.applyTransform(scale, tx, ty);
  }

  private updateMarkerInvScaleOnly() {
    const invScale = 1 / this.scale;
    const invs = this.markersEl.querySelectorAll<HTMLDivElement>(".zm-marker-inv");
    invs.forEach(el => { el.style.transform = `scale(${invScale})`; });
  }

  private getBasesNormalized(): BaseImage[] {
    const raw = this.data?.bases ?? [];
    const out: BaseImage[] = [];
    for (const it of raw as any[]) {
      if (typeof it === "string") out.push({ path: it, name: undefined });
      else if (it && typeof it === "object" && typeof it.path === "string") out.push({ path: it.path, name: it.name });
    }
    if (out.length === 0 && this.data?.image) out.push({ path: this.data.image });
    return out;
  }

  private async addMarkerInteractive(nx: number, ny: number) {
    if (!this.data) return;
    const defaultLayer = this.data.layers.find(l => l.visible) ?? this.data.layers[0];
    const draft: Marker = { id: generateId("marker"), x: nx, y: ny, layer: defaultLayer.id, link: "", iconKey: this.plugin.settings.defaultIconKey, tooltip: "" };

    const modal = new MarkerEditorModal(this.app, this.plugin, this.data, draft, async (res) => {
      if (res.action === "save" && res.marker) {
        this.data!.markers.push(res.marker);
        await this.saveDataSoon();
        new Notice("Marker added.", 900);
        this.renderMarkersOnly();
      }
    });
    modal.open();
  }

  private async placePresetAt(p: MarkerPreset, nx: number, ny: number) {
    if (!this.data) return;
    let layerId = this.data.layers[0].id;
    if (p.layerName) {
      const found = this.data.layers.find(l => l.name === p.layerName);
      if (found) layerId = found.id;
      else { const id = generateId("layer"); this.data.layers.push({ id, name: p.layerName, visible: true, locked: false }); layerId = id; }
    }
    const draft: Marker = { id: generateId("marker"), x: nx, y: ny, layer: layerId, link: p.linkTemplate ?? "", iconKey: p.iconKey ?? this.plugin.settings.defaultIconKey, tooltip: p.tooltip ?? "" };
    if (p.openEditor) {
      const modal = new MarkerEditorModal(this.app, this.plugin, this.data, draft, async (res) => {
        if (res.action === "save" && res.marker) { this.data!.markers.push(res.marker); await this.saveDataSoon(); this.renderMarkersOnly(); new Notice("Marker added (favorite).", 900); }
      });
      modal.open();
    } else { this.data.markers.push(draft); await this.saveDataSoon(); this.renderMarkersOnly(); new Notice("Marker added (favorite).", 900); }
  }

  // v0.4.4: place Sticker from preset
  private async placeStickerPresetAt(p: StickerPreset, nx: number, ny: number) {
    if (!this.data) return;
    let layerId = this.data.layers[0].id;
    if (p.layerName) {
      const found = this.data.layers.find(l => l.name === p.layerName);
      if (found) layerId = found.id;
      else { const id = generateId("layer"); this.data.layers.push({ id, name: p.layerName, visible: true, locked: false }); layerId = id; }
    }
    const draft: Marker = {
      id: generateId("marker"),
      type: "sticker",
      x: nx, y: ny,
      layer: layerId,
      stickerPath: p.imagePath,
      stickerSize: Math.max(1, Math.round(p.size || 64))
    };
    if (p.openEditor) {
      const modal = new MarkerEditorModal(this.app, this.plugin, this.data, draft, async (res) => {
        if (res.action === "save" && res.marker) { this.data!.markers.push(res.marker); await this.saveDataSoon(); this.renderMarkersOnly(); new Notice("Sticker added.", 900); }
      });
      modal.open();
    } else {
      this.data.markers.push(draft);
      await this.saveDataSoon();
      this.renderMarkersOnly();
      new Notice("Sticker added.", 900);
    }
  }

  private deleteMarker(m: Marker) { if (!this.data) return; this.data.markers = this.data.markers.filter(mm => mm.id !== m.id); this.saveDataSoon(); this.renderMarkersOnly(); new Notice("Marker deleted.", 900); }

  private renderAll() {
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

    this.markersEl.empty();
    this.renderMarkersOnly();
    this.renderMeasure();
    this.renderCalibrate();

    if (this.isCanvas()) this.renderCanvas();
  }

  private renderMarkersOnly() {
    if (!this.data) return;
    const s = this.scale;
    this.markersEl.empty();
    const visibleLayers = new Set(this.data.layers.filter(l => l.visible).map(l => l.id));

    const rank = (m: Marker) => (m.type === "sticker" ? 0 : 1); // stickers first (below), pins later (above)
    const toRender = this.data.markers.filter(m => visibleLayers.has(m.layer)).sort((a, b) => rank(a) - rank(b));

    for (const m of toRender) {
      const L = m.x * this.imgW, T = m.y * this.imgH;

      const host = this.markersEl.createDiv({ cls: "zm-marker" });
      host.dataset.id = m.id;
      host.style.left = `${L}px`;
      host.style.top  = `${T}px`;
      host.style.zIndex = (m.type === "sticker" ? "5" : "10");
      host.ondragstart = ev => ev.preventDefault();

      const layerLocked = this.isLayerLocked(m.layer);
      if (layerLocked) host.style.cursor = "not-allowed";

      let icon: HTMLImageElement;
      if (m.type === "sticker") {
        const size = Math.max(1, Math.round(m.stickerSize || 64));
        const anch = host.createDiv({ cls: "zm-marker-anchor" });
        anch.style.transform = `translate(${-size / 2}px, ${-size / 2}px)`;
        icon = createEl("img", { cls: "zm-marker-icon" });
        icon.src = this.resolveResourceUrl(m.stickerPath || "");
        icon.style.width = `${size}px`;
        icon.style.height = `${size}px`;
        icon.draggable = false;
        anch.appendChild(icon);
      } else {
        const { imgUrl, size, anchorX, anchorY } = this.getIconInfo(m.iconKey);
        const inv = host.createDiv({ cls: "zm-marker-inv" });
        inv.style.transform = `scale(${1 / s})`;
        const anch = inv.createDiv({ cls: "zm-marker-anchor" });
        anch.style.transform = `translate(${-anchorX}px, ${-anchorY}px)`;
        icon = createEl("img", { cls: "zm-marker-icon" });
        icon.src = imgUrl;
        icon.style.width = `${size}px`;
        icon.style.height = `${size}px`;
        icon.draggable = false;
        anch.appendChild(icon);
      }

      // Hover (Pins)
      if (m.type !== "sticker") {
        host.addEventListener("mouseenter", (ev) => this.onMarkerEnter(ev as MouseEvent, m, host));
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
        if (this.isLayerLocked(m.layer)) return; // Bewegung gesperrt
        this.hideTooltipSoon(0);

        this.draggingMarkerId = m.id;
        this.dragMoved = false;

        const vpRect = this.viewportEl.getBoundingClientRect();
        const vx = e.clientX - vpRect.left;
        const vy = e.clientY - vpRect.top;
        const wx = (vx - this.tx) / this.scale;
        const wy = (vy - this.ty) / this.scale;
        this.dragAnchorOffset = { dx: wx - L, dy: wy - T };

        host.classList.add("zm-marker--dragging");
        document.body.style.cursor = "grabbing";
        host.setPointerCapture?.(e.pointerId);
        e.preventDefault();
      });

      host.addEventListener("pointerup", () => {
        if (this.draggingMarkerId === m.id) {
          this.draggingMarkerId = null; this.dragAnchorOffset = null;
          host.classList.remove("zm-marker--dragging");
          document.body.style.cursor = "";
          if (this.dragMoved) this.saveDataSoon();
        }
      });

      host.addEventListener("contextmenu", (e: MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        this.closeMenu();
        const items: ZMMenuItem[] = [
          { label: m.type === "sticker" ? "Edit sticker" : "Edit marker", action: () => {
            if (!this.data) return;
            const modal = new MarkerEditorModal(this.app, this.plugin, this.data, m, async (res) => {
              if (res.action === "save" && res.marker) {
                const idx = this.data!.markers.findIndex(mm => mm.id === m.id);
                if (idx >= 0) this.data!.markers[idx] = res.marker;
                await this.saveDataSoon();
                this.renderMarkersOnly();
              } else if (res.action === "delete") {
                this.deleteMarker(m);
              }
            });
            modal.open();
          }},
          { label: m.type === "sticker" ? "Delete sticker" : "Delete marker", action: () => this.deleteMarker(m) }
        ];
        this.openMenu = new ZMMenu();
        this.openMenu.open(e.clientX, e.clientY, items);

        const outside = (ev: Event) => { if (!this.openMenu) return; const t = ev.target as HTMLElement | null; if (t && this.openMenu.contains(t)) return; this.closeMenu(); };
        const keyClose   = (ev: KeyboardEvent) => { if (ev.key === "Escape") this.closeMenu(); };
        const rightClickClose = () => this.closeMenu();

        document.addEventListener("pointerdown", outside, { capture: true });
        document.addEventListener("contextmenu", rightClickClose, { capture: true });
        document.addEventListener("keydown", keyClose, { capture: true });
        this.register(() => {
          document.removeEventListener("pointerdown", outside, { capture: true } as any);
          document.removeEventListener("contextmenu", rightClickClose, { capture: true } as any);
          document.removeEventListener("keydown", keyClose, { capture: true } as any);
        });
      });
    }
  }

  private onMarkerEnter(ev: MouseEvent, m: Marker, hostEl: HTMLElement) {
    if (m.type === "sticker") return; // stickers: no tooltip/popover
    if (m.link) {
      const ws: any = this.app.workspace;
      const eventForPopover = this.plugin.settings.forcePopoverWithoutModKey
        ? new MouseEvent("mousemove", {
            clientX: ev.clientX, clientY: ev.clientY,
            bubbles: true, cancelable: true,
            ctrlKey: true, metaKey: true
          })
        : ev;

      ws.trigger('hover-link', {
        event: eventForPopover,
        source: 'zoom-map',
        hoverParent: this,
        targetEl: hostEl,
        linktext: m.link,
        sourcePath: this.cfg.sourcePath
      });
      return;
    }
    this.showInternalTooltip(ev, m);
  }

  private async showInternalTooltip(ev: MouseEvent, m: Marker) {
    if (!this.ready) return;
    if (!this.tooltipEl) {
      this.tooltipEl = this.viewportEl.createDiv({ cls: "zm-tooltip" });
      this.tooltipEl.addEventListener("mouseenter", () => this.cancelHideTooltip());
      this.tooltipEl.addEventListener("mouseleave", () => this.hideTooltipSoon());
    }
    this.tooltipEl.style.maxWidth = `${this.plugin.settings.hoverMaxWidth || 360}px`;
    this.tooltipEl.style.maxHeight = `${this.plugin.settings.hoverMaxHeight || 260}px`;

    this.cancelHideTooltip();
    this.tooltipEl.empty();

    if (m.tooltip) this.tooltipEl.createEl("div", { text: m.tooltip });
    if (!m.tooltip) this.tooltipEl.setText("(no content)");

    this.positionTooltip(ev.clientX, ev.clientY);
    this.tooltipEl.style.display = "block";
  }

  private positionTooltip(clientX: number, clientY: number) {
    if (!this.tooltipEl) return;
    const pad = 12;
    const vpRect = this.viewportEl.getBoundingClientRect();
    let x = clientX - vpRect.left + pad;
    let y = clientY - vpRect.top + pad;

    const rect = this.tooltipEl.getBoundingClientRect();
    const vw = vpRect.width, vh = vpRect.height;

    if (x + rect.width  > vw) x = clientX - vpRect.left - rect.width  - pad;
    if (x < 0) x = pad;
    if (y + rect.height > vh) y = clientY - vpRect.top  - rect.height - pad;
    if (y < 0) y = pad;

    this.tooltipEl.style.position = "absolute";
    this.tooltipEl.style.left = `${x}px`;
    this.tooltipEl.style.top  = `${y}px`;
  }

  private hideTooltipSoon(delay = 150) {
    if (!this.tooltipEl) return;
    this.cancelHideTooltip();
    this.tooltipHideTimer = window.setTimeout(() => { if (this.tooltipEl) this.tooltipEl!.style.display = "none"; }, delay);
  }
  private cancelHideTooltip() { if (this.tooltipHideTimer) { window.clearTimeout(this.tooltipHideTimer); this.tooltipHideTimer = null; } }

  private getIconInfo(iconKey?: string): { imgUrl: string; size: number; anchorX: number; anchorY: number } {
    const key = iconKey ?? this.plugin.settings.defaultIconKey;
    const profile = this.plugin.settings.icons.find(i => i.key === key) ?? this.plugin.builtinIcon();
    let imgUrl = profile.pathOrDataUrl;
    const f = this.resolveTFile(imgUrl, this.cfg.sourcePath);
    if (f) return { imgUrl: this.app.vault.getResourcePath(f), size: profile.size, anchorX: profile.anchorX, anchorY: profile.anchorY };
    return { imgUrl, size: profile.size, anchorX: profile.anchorX, anchorY: profile.anchorY };
  }
  private async openMarkerLink(m: Marker) { if (!m.link) return; this.app.workspace.openLinkText(m.link, this.cfg.sourcePath); }

  private getActiveBasePath(): string {
    if (!this.data) return this.cfg.imagePath;
    return this.data.activeBase || this.data.image || this.cfg.imagePath;
  }

  private async setActiveBase(path: string) {
    if (!this.data) return;

    if (this.currentBasePath === path && (this.imgW > 0 && this.imgH > 0)) return;

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

    this.renderAll();
    this.applyTransform(this.scale, this.tx, this.ty);
    await this.saveDataSoon();

    if (!this.isCanvas()) this.updateOverlaySizes();
    else this.renderCanvas();
  }

  private async applyActiveBaseAndOverlays() {
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

  private buildOverlayElements() {
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

    for (const o of (this.data.overlays ?? [])) {
      const f = this.resolveTFile(o.path, this.cfg.sourcePath);
      if (!f) continue;
      const url = this.app.vault.getResourcePath(f);

      const pre = new Image();
      pre.decoding = "async";
      pre.src = url;
      pre.decode().catch(() => {}).finally(() => {
        const el = mkImgEl(url);
        el.style.display = o.visible ? "block" : "none";
        this.overlayMap.set(o.path, el);
      });
    }
  }

  private updateOverlaySizes() {
    if (this.isCanvas()) return;
    this.overlaysEl.style.width = `${this.imgW}px`;
    this.overlaysEl.style.height = `${this.imgH}px`;
  }

  private async updateOverlayVisibility() {
    if (!this.data) return;
    if (this.isCanvas()) {
      await this.ensureVisibleOverlaysLoaded();
      this.renderCanvas();
      return;
    }
    for (const o of (this.data.overlays ?? [])) {
      const el = this.overlayMap.get(o.path);
      if (el) el.style.display = o.visible ? "block" : "none";
    }
  }

  private async reloadYamlFromSource() {
    const yaml = await this.readYamlForThisBlock();
    if (!yaml) return;

    const bases = this.parseBasesYaml(yaml.imageBases);
    const overlays = this.parseOverlaysYaml(yaml.imageOverlays);
    const yamlImage: string | undefined = typeof yaml.image === "string" ? yaml.image.trim() : undefined;

    const changed = await this.syncYamlLayers(bases, overlays, yamlImage);
    if (changed && this.data) {
      if (await this.store.wouldChange(this.data)) { this.ignoreNextModify = true; await this.store.save(this.data); }
      await this.applyActiveBaseAndOverlays();
      this.renderAll();
      new Notice("Image layers reloaded from YAML.", 1500);
    }
  }

  private async readYamlForThisBlock(): Promise<any | null> {
    try {
      const f = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
      if (!(f instanceof TFile)) return null;
      const txt = await this.app.vault.read(f);
      const lines = txt.split("\n");

      let start = -1, end = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith("```zoommap")) { start = i; break; }
      }
      if (start < 0) return null;
      for (let j = start + 1; j < lines.length; j++) {
        if (lines[j].trim().startsWith("```")) { end = j; break; }
      }
      if (end < 0) return null;

      const body = lines.slice(start + 1, end).join("\n");
      let y: any = {};
      try { y = parseYaml(body) ?? {}; } catch {}
      return y;
    } catch { return null; }
  }

  private parseBasesYaml(v: any): { path: string; name?: string }[] {
    if (!v) return [];
    if (Array.isArray(v)) {
      return v.map((it: any) => {
        if (typeof it === "string") return { path: it };
        if (it && typeof it === "object" && typeof it.path === "string") return { path: String(it.path), name: it.name ? String(it.name) : undefined };
        return null;
      }).filter(Boolean) as { path: string; name?: string }[];
    }
    return [];
  }
  private parseOverlaysYaml(v: any): { path: string; name?: string; visible?: boolean }[] {
    if (!v) return [];
    if (Array.isArray(v)) {
      return v.map((it: any) => {
        if (typeof it === "string") return { path: it };
        if (it && typeof it === "object" && typeof it.path === "string") {
          return { path: String(it.path), name: it.name ? String(it.name) : undefined, visible: typeof it.visible === "boolean" ? it.visible : undefined };
        }
        return null;
      }).filter(Boolean) as { path: string; name?: string; visible?: boolean }[];
    }
    return [];
  }

  private async syncYamlLayers(yamlBases: { path: string; name?: string }[], yamlOverlays: { path: string; name?: string; visible?: boolean }[], yamlImage?: string): Promise<boolean> {
    if (!this.data) return false;
    let changed = false;

    if (yamlBases && yamlBases.length > 0) {
      const prevActive = this.getActiveBasePath();
      const newBases: BaseImage[] = yamlBases.map(b => ({ path: b.path, name: b.name }));
      const newPaths = new Set(newBases.map(b => b.path));
      let newActive = prevActive;
      if (yamlImage && newPaths.has(yamlImage)) newActive = yamlImage;
      if (!newPaths.has(newActive)) newActive = newBases[0].path;

      (this.data as any).bases = newBases;
      this.data.activeBase = newActive;
      this.data.image = newActive;
      changed = true;
    }

    if (yamlOverlays && yamlOverlays.length > 0) {
      const prev = new Map((this.data.overlays ?? []).map(o => [o.path, o]));
      const next: ImageOverlay[] = yamlOverlays.map(o => ({
        path: o.path,
        name: o.name,
        visible: typeof o.visible === "boolean" ? o.visible : (prev.get(o.path)?.visible ?? false)
      }));
      this.data.overlays = next;
      changed = true;
    }

    return changed;
  }

  private async reloadMarkers() {
    try {
      this.data = await this.store.load();
      if (!this.ready) return;
      await this.applyActiveBaseAndOverlays();
      this.renderMarkersOnly();
      this.renderMeasure();
      this.renderCalibrate();
    }
    catch (e: any) { new Notice(`Failed to reload markers: ${e.message}`); }
  }

  private saveDataSoon = (() => {
    let t: number | null = null;
    return async () => {
      if (t) window.clearTimeout(t);
      await new Promise<void>(resolve => {
        t = window.setTimeout(async () => {
          t = null;
          if (this.data) {
            const would = await this.store.wouldChange(this.data);
            if (would) {
              this.ignoreNextModify = true;
              await this.store.save(this.data);
            }
          }
          resolve();
        }, 200);
      });
    };
  })();

  private installGrip(grip: HTMLDivElement, side: "left" | "right") {
    let startW = 0, startH = 0, startX = 0, startY = 0;
    const minW = 220, minH = 220;

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
      document.body.style.cursor = "";
      this.userResizing = false;

      if (this.shouldUseSavedFrame() && this.cfg.resizable) {
        this.persistFrameNow();
      }
    };

    grip.addEventListener("pointerdown", (e) => {
      e.preventDefault(); e.stopPropagation();
      const rect = this.el.getBoundingClientRect();
      startW = rect.width;
      startH = rect.height;
      startX = e.clientX; startY = e.clientY;
      document.body.style.cursor = (side === "right" ? "nwse-resize" : "nesw-resize");
      this.userResizing = true;
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp, true);
    });
  }

  private shouldUseSavedFrame(): boolean {
    return !!this.cfg.resizable && !(this.cfg.widthFromYaml || this.cfg.heightFromYaml);
  }
  private requestPersistFrame(delay = 500) {
    if (this.frameSaveTimer) window.clearTimeout(this.frameSaveTimer);
    this.frameSaveTimer = window.setTimeout(() => {
      this.frameSaveTimer = null;
      this.persistFrameNow();
    }, delay);
  }
  private async persistFrameNow() {
    if (!this.data || !this.shouldUseSavedFrame()) return;
    const rect = this.el.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    const prev = this.data.frame;
    if (!prev || prev.w !== w || prev.h !== h) {
      this.data.frame = { w, h };
      await this.saveDataSoon();
    }
  }

  private applyMeasureStyle() {
    const color = (this.plugin.settings.measureLineColor ?? "var(--text-accent)").trim();
    const widthPx = Math.max(1, this.plugin.settings.measureLineWidth ?? 2);
    this.el.style.setProperty("--zm-measure-color", color);
    this.el.style.setProperty("--zm-measure-width", `${widthPx}px`);
  }

  private requestPanFrame() {
    if (this.panRAF != null) return;
    this.panRAF = requestAnimationFrame(() => {
      this.panRAF = null;
      if (this.panAccDx !== 0 || this.panAccDy !== 0) {
        this.applyTransform(this.scale, this.tx + this.panAccDx, this.ty + this.panAccDy);
        this.panAccDx = 0; this.panAccDy = 0;
      }
    });
  }
}

/* ------------ Menu ------------- */
type ZMMenuItem = {
  type?: "item" | "separator";
  label?: string;
  action?: (rowEl: HTMLDivElement, menu: ZMMenu) => void | Promise<void>;
  iconUrl?: string;
  checked?: boolean; // legacy boolean check
  // Neu: Tri-State Markierung (ersetzt checked)
  mark?: "check" | "x" | "minus";
  markColor?: string;
  children?: ZMMenuItem[];
};

class ZMMenu {
  private root: HTMLDivElement;
  private submenus: HTMLDivElement[] = [];
  private items: ZMMenuItem[] = [];

  constructor() {
    this.root = document.body.createDiv({ cls: "zm-menu" });
    this.root.addEventListener("contextmenu", (e) => e.stopPropagation());
  }
  open(clientX: number, clientY: number, items: ZMMenuItem[]) {
    this.items = items;
    this.buildList(this.root, this.items);
    this.position(this.root, clientX, clientY, "right");
  }
  destroy() { this.submenus.forEach(el => el.remove()); this.submenus = []; this.root.remove(); }
  contains(el: HTMLElement): boolean { return this.root.contains(el) || this.submenus.some(s => s.contains(el)); }

  private buildList(container: HTMLDivElement, items: ZMMenuItem[]) {
    container.empty();
    for (const it of items) {
      if (it.type === "separator") { container.createDiv({ cls: "zm-menu__sep" }); continue; }
      if (!it.label) continue;

      const row = container.createDiv({ cls: "zm-menu__item" });
      const label = row.createDiv({ cls: "zm-menu__label" }); label.setText(it.label);
      const right = row.createDiv({ cls: "zm-menu__right" });

      if (it.children && it.children.length) {
        const arrow = right.createDiv({ cls: "zm-menu__arrow" }); arrow.setText("▶");
        let submenuEl: HTMLDivElement | null = null;
        const openSub = () => {
          if (submenuEl) return;
          submenuEl = document.body.createDiv({ cls: "zm-submenu" });
          this.submenus.push(submenuEl);
          this.buildList(submenuEl, it.children!);
          const rect = row.getBoundingClientRect();
          const pref = (rect.right + 260 < window.innerWidth) ? "right" : "left";
          const x = pref === "right" ? rect.right : rect.left;
          const y = rect.top;
          this.position(submenuEl, x, y, pref);
        };
        const closeSub = () => { if (!submenuEl) return; submenuEl.remove(); this.submenus = this.submenus.filter(s => s !== submenuEl); submenuEl = null; };
        row.addEventListener("mouseenter", openSub);
        row.addEventListener("mouseleave", (e) => { const to = (e.relatedTarget as HTMLElement) || null; if (submenuEl && !submenuEl.contains(to)) closeSub(); });
      } else {
        // Anzeige rechts: Tri-State mark > checked > icon
        const chk = right.createDiv({ cls: "zm-menu__check" });
        if (it.mark) {
          chk.setText(this.symbolForMark(it.mark));
          if (it.markColor) chk.style.color = it.markColor;
        } else if (typeof it.checked === "boolean") {
          chk.setText(it.checked ? "✓" : "");
        }

        if (it.iconUrl) {
          const img = right.createEl("img", { cls: "zm-menu__icon" });
          img.src = it.iconUrl;
        }

        // Klick: Menü NICHT automatisch schließen
        row.addEventListener("click", async () => { await it.action?.(row, this); });
      }
    }
  }

  private symbolForMark(mark: "check" | "x" | "minus"): string {
    switch (mark) {
      case "x": return "×";
      case "minus": return "–";
      default: return "✓";
    }
  }

  private position(el: HTMLDivElement, clientX: number, clientY: number, prefer: "right" | "left") {
    const pad = 6;
    const rect = el.getBoundingClientRect();
    let x = clientX, y = clientY;
    const vw = window.innerWidth, vh = window.innerHeight;

    if (prefer === "right") { if (clientX + rect.width + pad > vw) x = Math.max(pad, vw - rect.width - pad); }
    else { x = clientX - rect.width; if (x < pad) x = pad; }
    if (clientY + rect.height + pad > vh) y = Math.max(pad, vh - rect.height - pad);

    el.style.left = `${x}px`; el.style.top = `${y}px`;
  }
}