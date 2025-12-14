import {
  Plugin,
  PluginSettingTab,
  Setting,
  parseYaml,
  stringifyYaml,
  normalizePath,
  TFile,
  Notice,
  setIcon,
  requestUrl,
  MarkdownView,
} from "obsidian";
import type { App, MarkdownPostProcessorContext } from "obsidian";
import { MapInstance } from "./map";
import type {
  ZoomMapConfig,
  ZoomMapSettings,
  IconProfile,
  BaseCollection,
  CustomUnitDef,
} from "./map";

import { ViewEditorModal, type ViewEditorConfig } from "./viewEditorModal";

import { ImageFileSuggestModal } from "./iconFileSuggest";
import { CollectionEditorModal } from "./collectionsModals";
import { JsonFileSuggestModal } from "./jsonFileSuggest";
import { FaIconPickerModal } from "./faIconPickerModal";
import { PreferencesModal } from "./preferencesModal";

/* ---------------- Utils ---------------- */

function svgPinDataUrl(color = "#d23c3c"): string {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <path fill="${color}" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7m0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"/>
</svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

interface ZoomMapSettingsExtended extends ZoomMapSettings {
  defaultWidthWrapped?: string;
  libraryFilePath?: string; // Single library file in the vault that stores icons + collections
  faFolderPath?: string; // Folder in vault containing SVG icon packs
}

interface LibraryFileData {
  version: 1;
  icons: IconProfile[];
  baseCollections: BaseCollection[];
  exportedAt?: string;
}

function toCssSize(v: unknown, fallback: string): string {
  if (typeof v === "number" && Number.isFinite(v)) return `${v}px`;
  if (typeof v === "string" && v.trim().length > 0) return v.trim();
  return fallback;
}

function folderOf(path: string): string {
  const i = path.lastIndexOf("/");
  return i >= 0 ? path.slice(0, i) : "";
}

const DEFAULT_FA_ZIP_URL =
  "https://use.fontawesome.com/releases/v6.4.0/fontawesome-free-6.4.0-web.zip";

const DEFAULT_RPG_ZIP_URL =
  "https://github.com/nagoshiashumari/rpg-awesome-raw/archive/refs/heads/master.zip";

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

function setCssProps(el: HTMLElement, props: Record<string, string | null>): void {
  for (const [key, value] of Object.entries(props)) {
    if (value === null) el.style.removeProperty(key);
    else el.style.setProperty(key, value);
  }
}

/* ---------------- Defaults ---------------- */

const DEFAULT_SETTINGS: ZoomMapSettingsExtended = {
  icons: [
    {
      key: "pinRed",
      pathOrDataUrl: svgPinDataUrl("#d23c3c"),
      size: 24,
      anchorX: 12,
      anchorY: 12,
    },
    {
      key: "pinBlue",
      pathOrDataUrl: svgPinDataUrl("#3c62d2"),
      size: 24,
      anchorX: 12,
      anchorY: 12,
    },
  ],
  defaultIconKey: "pinRed",
  wheelZoomFactor: 1.1,
  panMouseButton: "left",
  hoverMaxWidth: 360,
  hoverMaxHeight: 260,
  presets: [],
  stickerPresets: [],
  defaultWidth: "100%",
  defaultHeight: "480px",
  defaultResizable: false,
  defaultResizeHandle: "right",
  forcePopoverWithoutModKey: true,
  measureLineColor: "var(--text-accent)",
  measureLineWidth: 2,
  storageDefault: "json",
  defaultWidthWrapped: "50%",
  baseCollections: [],
  pinPlaceOpensEditor: false,
  libraryFilePath: "ZoomMap/library.json",
  faFolderPath: "ZoomMap/SVGs",
  customUnits: [],
  defaultScaleLikeSticker: false,
  enableDrawing: false,
  preferActiveLayerInEditor: false,
};

/* ---------------- YAML parsing helpers ---------------- */

interface YamlBase {
  path: string;
  name?: string;
}
interface YamlOverlay {
  path: string;
  name?: string;
  visible?: boolean;
}

interface YamlOptions {
  image?: string;
  markers?: string;
  minZoom?: number | string;
  maxZoom?: number | string;
  height?: string | number;
  width?: string | number;
  resizable?: boolean;
  resizeHandle?: string; // parsed
  render?: string; // parsed
  responsive?: boolean;
  responsiv?: boolean; // legacy alias

  storage?: string; // parsed to json|note
  id?: string;

  align?: string; // parsed to left|center|right
  wrap?: boolean;

  classes?: string | string[];

  imageBases?: (YamlBase | string)[];
  imageOverlays?: (YamlOverlay | string)[];

  scale?: { metersPerPixel?: number; pixelsPerMeter?: number };
  
  markerLayers?: (string | { name: string })[];
  
  view?: {
    zoom?: number | string;
    centerX?: number;
    centerY?: number;
  };
  
}

function parseBasesYaml(v: unknown): YamlBase[] {
  if (!Array.isArray(v)) return [];
  return (v as unknown[])
    .map((it) => {
      if (typeof it === "string") return { path: it };
      if (it && typeof it === "object" && "path" in it) {
        const obj = it as { path?: unknown; name?: unknown };
        if (typeof obj.path === "string") {
          return {
            path: obj.path,
            name: typeof obj.name === "string" ? obj.name : undefined,
          };
        }
      }
      return null;
    })
    .filter((b): b is YamlBase => b !== null);
}

function parseOverlaysYaml(v: unknown): YamlOverlay[] {
  if (!Array.isArray(v)) return [];
  return (v as unknown[])
    .map((it) => {
      if (typeof it === "string") return { path: it };
      if (it && typeof it === "object" && "path" in it) {
        const obj = it as {
          path?: unknown;
          name?: unknown;
          visible?: unknown;
        };
        if (typeof obj.path === "string") {
          return {
            path: obj.path,
            name: typeof obj.name === "string" ? obj.name : undefined,
            visible: typeof obj.visible === "boolean" ? obj.visible : undefined,
          };
        }
      }
      return null;
    })
    .filter((o): o is YamlOverlay => o !== null);
}

function parseScaleYaml(v: unknown): number | undefined {
  if (!v || typeof v !== "object") return undefined;
  const obj = v as { metersPerPixel?: unknown; pixelsPerMeter?: unknown };
  const mpp =
    typeof obj.metersPerPixel === "number" && obj.metersPerPixel > 0
      ? obj.metersPerPixel
      : undefined;
  const ppm =
    typeof obj.pixelsPerMeter === "number" && obj.pixelsPerMeter > 0
      ? 1 / obj.pixelsPerMeter
      : undefined;
  return mpp ?? ppm;
}

function parseZoomYaml(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }
  if (typeof value === "string") {
    let s = value.trim();
    if (!s) return fallback;
    const hasPercent = s.endsWith("%");
    if (hasPercent) s = s.slice(0, -1).trim();
    s = s.replace(",", ".");
    const n = Number(s);
    if (Number.isFinite(n) && n > 0) {
      return hasPercent ? n / 100 : n;
    }
  }
  return fallback;
}

function parseAlign(v: unknown): "left" | "center" | "right" | undefined {
  if (v === "left" || v === "center" || v === "right") return v;
  return undefined;
}

function parseResizeHandle(v: unknown): "left" | "right" | "both" | "native" {
  return v === "left" || v === "right" || v === "both" || v === "native"
    ? v
    : "right";
}

async function readSavedFrame(
  app: App,
  markersPath: string,
): Promise<{ w: number; h: number } | null> {
  try {
    const file = app.vault.getAbstractFileByPath(normalizePath(markersPath));
    if (!(file instanceof TFile)) return null;

    const raw = await app.vault.read(file);
    const parsed = JSON.parse(raw) as unknown;

    let fw = Number.NaN;
    let fh = Number.NaN;

    if (isPlainObject(parsed)) {
      const frame = (parsed as { frame?: unknown }).frame;
      if (frame && typeof frame === "object") {
        const fr = frame as { w?: unknown; h?: unknown };
        fw = typeof fr.w === "number" ? fr.w : Number(fr.w);
        fh = typeof fr.h === "number" ? fr.h : Number(fr.h);
      }
    }

    if (Number.isFinite(fw) && Number.isFinite(fh) && fw >= 48 && fh >= 48) {
      return { w: Math.round(fw), h: Math.round(fh) };
    }
  } catch {
    // ignore
  }
  return null;
}

/* ---------------- Plugin ---------------- */

export default class ZoomMapPlugin extends Plugin {
  settings: ZoomMapSettings = DEFAULT_SETTINGS;

  activeMap: MapInstance | null = null;

  setActiveMap(inst: MapInstance): void {
    this.activeMap = inst;
  }

  async onload(): Promise<void> {
    await this.loadSettings();
	
	this.addCommand({
    id: "insert-new-map",
    name: "Insert new map…",
    editorCallback: (editor, view) => {
      const file = (view as MarkdownView).file;
      if (!file) return;

      const initialConfig: ViewEditorConfig = {
        imageBases: [{ path: "", name: "" }],
        overlays: [],
        markersPath: "",
        renderMode: "dom",
        minZoom: 0.25,
        maxZoom: 8,
        wrap: false,
        responsive: false,
        width: "100%",
        height: "480px",
		useWidth: true,
		useHeight: true,
        resizable: false,
        resizeHandle: "native",
        align: undefined,
        markerLayers: ["Default"],
      };

      new ViewEditorModal(this.app, initialConfig, (res) => {
        if (res.action !== "save" || !res.config) return;
        const yaml = this.buildYamlFromViewConfig(res.config);
        const block = "```zoommap\n" + yaml + "\n```\n";

        editor.replaceRange(block, editor.getCursor());
      }).open();
    },
  });

    this.addCommand({
      id: "toggle-measure-mode",
      name: "Toggle measure mode",
      checkCallback: (checking) => {
        const map = this.activeMap;
        if (!map) return false;
        if (!checking) map.toggleMeasureFromCommand();
        return true;
      },
    });

    this.registerMarkdownCodeBlockProcessor(
      "zoommap",
      async (src: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
        let opts: Partial<YamlOptions> = {};

        try {
          const parsed: unknown = parseYaml(src);
          if (parsed && typeof parsed === "object") {
            opts = parsed as Partial<YamlOptions>;
          }
        } catch (error) {
          console.error("Zoom Map: failed to parse zoommap block", error);
        }

        const yamlBases = parseBasesYaml(opts.imageBases);
        const yamlOverlays = parseOverlaysYaml(opts.imageOverlays);
        const yamlMetersPerPixel = parseScaleYaml(opts.scale);
		
		let initialZoom: number | undefined;
		let initialCenter: { x: number; y: number } | undefined;

		const viewOpt = opts.view;
		if (viewOpt && typeof viewOpt === "object") {
		  // Zoom: Zahl oder Prozent-String
		  initialZoom = parseZoomYaml(viewOpt.zoom, NaN);
		  if (!Number.isFinite(initialZoom) || initialZoom! <= 0) {
			initialZoom = undefined;
		  }

		  const cx = typeof viewOpt.centerX === "number" ? viewOpt.centerX : NaN;
		  const cy = typeof viewOpt.centerY === "number" ? viewOpt.centerY : NaN;
		  if (Number.isFinite(cx) && Number.isFinite(cy)) {
			initialCenter = {
			  x: Math.min(Math.max(cx, 0), 1),
			  y: Math.min(Math.max(cy, 0), 1),
			};
		  }
		}

        const renderMode: "dom" | "canvas" =
          opts.render === "canvas" ? "canvas" : "dom";

        let image = typeof opts.image === "string" ? opts.image.trim() : "";
        if (!image && yamlBases.length > 0) image = yamlBases[0].path;
        if (!image) {
          el.createEl("div", { text: "Image is missing." });
          return;
        }

        const responsive = !!(opts.responsive ?? opts.responsiv);

        const storageRaw =
          typeof opts.storage === "string" ? opts.storage.toLowerCase() : "";
        const storageMode: "json" | "note" =
          storageRaw === "note" || storageRaw === "inline" || storageRaw === "in-note"
            ? "note"
            : storageRaw === "json"
              ? "json"
              : (this.settings.storageDefault ?? "json");

        const sectionInfo = ctx.getSectionInfo(el);
        const defaultId = `map-${sectionInfo?.lineStart ?? Date.now()}`;
        const idFromYaml = opts.id;
        const mapId =
          typeof idFromYaml === "string" && idFromYaml.trim()
            ? idFromYaml.trim()
            : defaultId;

        const markersPathRaw =
          typeof opts.markers === "string" ? opts.markers : undefined;

        const minZoom = responsive ? 1e-6 : parseZoomYaml(opts.minZoom, 0.25);
        const maxZoom = responsive ? 1e6 : parseZoomYaml(opts.maxZoom, 8);

        const markersPath = normalizePath(markersPathRaw ?? `${image}.markers.json`);

        const align = parseAlign(opts.align);
        const wrap = !!opts.wrap;

        const classesValue = opts.classes;
        const extraClasses: string[] = Array.isArray(classesValue)
          ? (classesValue as unknown[]).map((c) => String(c))
          : typeof classesValue === "string"
            ? classesValue
              .split(/\s+/)
              .map((c) => c.trim())
              .filter(Boolean)
            : [];

        const resizable = responsive
          ? false
          : typeof opts.resizable === "boolean"
            ? opts.resizable
            : this.settings.defaultResizable;

        const resizeHandle = responsive ? "right" : parseResizeHandle(opts.resizeHandle);

        const widthFromYaml = Object.prototype.hasOwnProperty.call(opts, "width");
        const heightFromYaml = Object.prototype.hasOwnProperty.call(opts, "height");

        const extSettings = this.settings as ZoomMapSettingsExtended;
        const widthDefault = wrap
          ? (extSettings.defaultWidthWrapped ?? "50%")
          : this.settings.defaultWidth;

        let widthCss = responsive ? "100%" : toCssSize(opts.width, widthDefault);
        let heightCss = responsive ? "auto" : toCssSize(opts.height, this.settings.defaultHeight);

        if (!responsive && storageMode === "json" && !widthFromYaml && !heightFromYaml) {
          const saved = await readSavedFrame(this.app, markersPath);
          if (saved) {
            widthCss = `${Math.max(220, saved.w)}px`;
            heightCss = `${Math.max(220, saved.h)}px`;
            el.style.width = widthCss;
            el.style.height = heightCss;
          }
        }

        const markerLayersFromYaml: string[] | undefined = Array.isArray(opts.markerLayers)
		  ? (opts.markerLayers as unknown[])
			  .map((v) =>
				typeof v === "string"
				  ? v.trim()
				  : v && typeof v === "object" && "name" in v
				  ? String((v as { name: unknown }).name ?? "").trim()
				  : "",
			  )
			  .filter((s) => s.length > 0)
		  : undefined;

		const cfg: ZoomMapConfig = {
		  imagePath: image,
		  markersPath,
		  minZoom,
		  maxZoom,
		  sourcePath: ctx.sourcePath,
		  width: widthCss,
		  height: heightCss,
		  resizable,
		  resizeHandle,
		  align,
		  wrap,
		  extraClasses,
		  renderMode,
		  yamlBases,
		  yamlOverlays,
		  yamlMetersPerPixel,
		  sectionStart: sectionInfo?.lineStart,
		  sectionEnd: sectionInfo?.lineEnd,
		  widthFromYaml,
		  heightFromYaml,
		  storageMode,
		  mapId,
		  responsive,
		  yamlMarkerLayers: markerLayersFromYaml,
		  initialZoom,
		  initialCenter,
		};

        const inst = new MapInstance(this.app, this, el, cfg);
        ctx.addChild(inst);
      },
    );

    this.addSettingTab(new ZoomMapSettingTab(this.app, this));
  }

  builtinIcon(): IconProfile {
    return (
      this.settings.icons[0] ?? {
        key: "builtin",
        pathOrDataUrl: svgPinDataUrl("#d23c3c"),
        size: 24,
        anchorX: 12,
        anchorY: 12,
      }
    );
  }

  async loadSettings(): Promise<void> {
    const savedUnknown: unknown = await this.loadData();

    const merged: ZoomMapSettings = { ...DEFAULT_SETTINGS };
    if (isPlainObject(savedUnknown)) {
      Object.assign(merged, savedUnknown);
    }
    this.settings = merged;

    const ext = this.settings as ZoomMapSettingsExtended;
    this.settings.baseCollections ??= [];
    ext.defaultWidthWrapped ??= "50%";
    ext.libraryFilePath ??= "ZoomMap/library.json";
    ext.faFolderPath ??= "ZoomMap/SVGs";
    this.settings.customUnits ??= [];
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  /* -------- Library file (icons + collections) -------- */

  private async ensureFolder(path: string): Promise<void> {
    const folder = folderOf(path);
    if (!folder) return;
    if (!this.app.vault.getAbstractFileByPath(folder)) {
      await this.app.vault.createFolder(folder);
    }
  }

  async saveLibraryToPath(path: string): Promise<void> {
    const p = normalizePath(path);
    const ext = this.settings as ZoomMapSettingsExtended;

    const payload: LibraryFileData = {
      version: 1,
      icons: this.settings.icons ?? [],
      baseCollections: this.settings.baseCollections ?? [],
      exportedAt: new Date().toISOString(),
    };

    try {
      await this.ensureFolder(p);
      const existing = this.app.vault.getAbstractFileByPath(p);
      const json = JSON.stringify(payload, null, 2);
      if (existing instanceof TFile) {
        await this.app.vault.modify(existing, json);
      } else {
        await this.app.vault.create(p, json);
      }
      ext.libraryFilePath = p;
      await this.saveSettings();
      new Notice(`Library saved to ${p}`, 2000);
    } catch (e) {
      console.error("Save library failed", e);
      new Notice("Failed to save library.", 2500);
    }
  }

  async loadLibraryFromFile(file: TFile): Promise<void> {
    try {
      const raw = await this.app.vault.read(file);
      const obj: unknown = JSON.parse(raw);
      if (!isPlainObject(obj)) {
        new Notice("Invalid library file.", 2500);
        return;
      }

      const hasIcons = (x: unknown): x is { icons: unknown } =>
        isPlainObject(x) && "icons" in x;
      const hasBaseCollections = (x: unknown): x is { baseCollections: unknown } =>
        isPlainObject(x) && "baseCollections" in x;

      let icons: IconProfile[] = [];
      if (hasIcons(obj) && Array.isArray(obj.icons)) {
        icons = obj.icons as IconProfile[];
      }

      let cols: BaseCollection[] = [];
      if (hasBaseCollections(obj) && Array.isArray(obj.baseCollections)) {
        cols = obj.baseCollections as BaseCollection[];
      }

      this.settings.icons = icons;
      this.settings.baseCollections = cols;
      (this.settings as ZoomMapSettingsExtended).libraryFilePath = file.path;

      await this.saveSettings();
      new Notice(`Library loaded from ${file.path}`, 2000);
    } catch (e) {
      console.error("Load library failed", e);
      new Notice("Failed to load library.", 2500);
    }
  }

  async downloadFontAwesomeZip(): Promise<void> {
    const ext = this.settings as ZoomMapSettingsExtended;
    const folder = normalizePath(ext.faFolderPath?.trim() || "ZoomMap/SVGs");
    const zipPath = normalizePath(`${folder}/fontawesome-free.zip`);

    try {
      if (!this.app.vault.getAbstractFileByPath(folder)) {
        await this.app.vault.createFolder(folder);
      }

      new Notice("Downloading font awesome free zip…", 2500);

      const res = await requestUrl({
        url: DEFAULT_FA_ZIP_URL,
        method: "GET",
      });

      // @ts-expect-error writeBinary is available on desktop adapters
      await this.app.vault.adapter.writeBinary(zipPath, res.arrayBuffer);

      new Notice(
        `Downloaded Font Awesome ZIP to ${zipPath}. Please unzip it so that SVG files are available in this folder.`,
        6000,
      );
    } catch (e) {
      console.error("Download Font Awesome ZIP failed", e);
      new Notice("Failed to download font awesome zip.", 4000);
    }
  }

  async downloadRpgAwesomeZip(): Promise<void> {
    const ext = this.settings as ZoomMapSettingsExtended;
    const folder = normalizePath(ext.faFolderPath?.trim() || "ZoomMap/SVGs");
    const zipPath = normalizePath(`${folder}/rpg-awesome.zip`);

    try {
      if (!this.app.vault.getAbstractFileByPath(folder)) {
        await this.app.vault.createFolder(folder);
      }

      new Notice("Downloading rpg awesome SVG pack…", 2500);

      const res = await requestUrl({
        url: DEFAULT_RPG_ZIP_URL,
        method: "GET",
      });

      // @ts-expect-error writeBinary is available on desktop adapters
      await this.app.vault.adapter.writeBinary(zipPath, res.arrayBuffer);

      new Notice(
        `Downloaded RPG Awesome ZIP to ${zipPath}. Please unzip it so that the SVG files are available in this folder.`,
        6000,
      );
    } catch (e) {
      console.error("Download RPG Awesome ZIP failed", e);
      new Notice("Failed to download rpg awesome zip.", 4000);
    }
  }

  rescanSvgFolder(): number {
    const ext = this.settings as ZoomMapSettingsExtended;
    const folder = normalizePath(ext.faFolderPath?.trim() || "ZoomMap/SVGs");
    const files = this.app.vault.getFiles();
    const prefix = folder.endsWith("/") ? folder : folder + "/";

    const count = files.filter((f) => {
      if (f.extension?.toLowerCase() !== "svg") return false;
      return f.path === folder || f.path.startsWith(prefix);
    }).length;

    new Notice(
      `Found ${count} SVG files under ${folder}. They will be available in the “Add SVG icon” picker.`,
      4000,
    );
    return count;
  }
  
  private buildYamlFromViewConfig(cfg: ViewEditorConfig): string {
  const obj: any = {};

  const bases = (cfg.imageBases ?? []).filter((b) => b.path && b.path.trim().length > 0);
  if (bases.length > 0) {
    obj.image = bases[0].path;
    obj.imageBases = bases.map((b) =>
      b.name ? { path: b.path, name: b.name } : { path: b.path },
    );
  }

  const overlays = (cfg.overlays ?? []).filter((o) => o.path && o.path.trim().length > 0);
  if (overlays.length > 0) {
    obj.imageOverlays = overlays.map((o) => {
      const r: any = { path: o.path };
      if (o.name) r.name = o.name;
      if (typeof o.visible === "boolean") r.visible = o.visible;
      return r;
    });
  }

  let markersPath = cfg.markersPath?.trim();
  if ((!markersPath || !markersPath.length) && bases.length > 0) {
    const first = bases[0].path;
    const dot = first.lastIndexOf(".");
    const base = dot >= 0 ? first.slice(0, dot) : first;
    markersPath = `${base}.markers.json`;
  }
  if (markersPath) obj.markers = markersPath;

  if (cfg.markerLayers && cfg.markerLayers.length > 0) {
    obj.markerLayers = cfg.markerLayers
      .map((n) => n.trim())
      .filter((n) => n.length > 0);
  }

  obj.minZoom = cfg.minZoom;
  obj.maxZoom = cfg.maxZoom;
  obj.wrap = !!cfg.wrap;
  obj.responsive = !!cfg.responsive;
  if (cfg.useWidth && cfg.width && cfg.width.trim().length > 0) {
    obj.width = cfg.width;
  }
  if (cfg.useHeight && cfg.height && cfg.height.trim().length > 0) {
    obj.height = cfg.height;
  }
  obj.resizable = !!cfg.resizable;
  obj.resizeHandle = cfg.resizeHandle;
  if (cfg.renderMode === "canvas") obj.render = "canvas";
  if (cfg.align) obj.align = cfg.align;

  return stringifyYaml(obj).trimEnd();
}
}

function tintSvgMarkup(svg: string, color: string): string {
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

/* ---------------- Settings Tab ---------------- */

class ZoomMapSettingTab extends PluginSettingTab {
  plugin: ZoomMapPlugin;

  private svgFileCache = new Map<string, string>();

  constructor(app: App, plugin: ZoomMapPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  private async addFontAwesomeIcon(file: TFile): Promise<void> {
    try {
      const svg = await this.app.vault.read(file);
      const defaultColor = "#b0b0b0";
      const tinted = tintSvgMarkup(svg, defaultColor);
      const dataUrl =
        "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(tinted);

      const icons = this.plugin.settings.icons ?? [];

      let baseKey = file.name.replace(/\.svg$/i, "");
      baseKey = baseKey.replace(/\s+/g, "-");
      let key = baseKey;
      let idx = 1;
      while (icons.some((i) => i.key === key)) {
        key = `${baseKey}-${idx++}`;
      }

      icons.push({
        key,
        pathOrDataUrl: dataUrl,
        size: 24,
        anchorX: 12,
        anchorY: 12,
        defaultLink: "",
      });

      this.plugin.settings.icons = icons;
      await this.plugin.saveSettings();
      this.display();
    } catch (e) {
      console.error("Zoom Map: failed to add Font Awesome icon", e);
      new Notice("Failed to add font awesome icon.", 2500);
    }
  }

  private async recolorIconSvg(icon: IconProfile, color: string): Promise<void> {
    const c = color.trim();
    if (!c) return;

    let svg: string | null = null;
    const src = icon.pathOrDataUrl ?? "";

    if (typeof src === "string" && src.startsWith("data:image/svg+xml")) {
      const idx = src.indexOf(",");
      if (idx >= 0) {
        try {
          const payload = src.slice(idx + 1);
          svg = decodeURIComponent(payload);
        } catch {
          svg = null;
        }
      }
    } else if (typeof src === "string" && src.toLowerCase().endsWith(".svg")) {
      const cached = this.svgFileCache.get(src);
      if (cached) {
        svg = cached;
      } else {
        const f = this.app.vault.getAbstractFileByPath(src);
        if (f instanceof TFile) {
          try {
            const text = await this.app.vault.read(f);
            this.svgFileCache.set(src, text);
            svg = text;
          } catch {
            svg = null;
          }
        }
      }
    }

    if (!svg) return;

    const tinted = tintSvgMarkup(svg, c);
    const dataUrl =
      "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(tinted);

    icon.pathOrDataUrl = dataUrl;
    await this.plugin.saveSettings();
  }

  private getSvgColorFromDataUrl(dataUrl: string): string | null {
    if (typeof dataUrl !== "string") return null;
    if (!dataUrl.startsWith("data:image/svg+xml")) return null;
    const idx = dataUrl.indexOf(",");
    if (idx < 0) return null;
    try {
      const payload = dataUrl.slice(idx + 1);
      const svg = decodeURIComponent(payload);

      const mFill = /fill="([^"]+)"/i.exec(svg);
      if (mFill) return mFill[1];

      const mStroke = /stroke="([^"]+)"/i.exec(svg);
      if (mStroke) return mStroke[1];

      return null;
    } catch {
      return null;
    }
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass("zoommap-settings");

    // Storage
    new Setting(containerEl).setName("Storage").setHeading();

    new Setting(containerEl)
      .setName("Storage location by default")
      .setDesc("Store marker data in JSON beside image, or inline in the note.")
      .addDropdown((d) => {
        d.addOption("json", "JSON file (beside image)");
        d.addOption("note", "Inside the note (hidden comment)");
        d.setValue(this.plugin.settings.storageDefault ?? "json");
        d.onChange((v) => {
          this.plugin.settings.storageDefault = v === "note" ? "note" : "json";
          void this.plugin.saveSettings();
        });
      });

    // Layout
    new Setting(containerEl).setName("Layout").setHeading();

    new Setting(containerEl)
      .setName("Default width when wrapped")
      .setDesc("Initial width if wrap: true and no width is set in the code block.")
      .addText((t) => {
        const ext = this.plugin.settings as ZoomMapSettingsExtended;
        t.setPlaceholder("50%");
        t.setValue(ext.defaultWidthWrapped ?? "50%");
        t.onChange((v) => {
          ext.defaultWidthWrapped = (v || "50%").trim();
          void this.plugin.saveSettings();
        });
      });

    // Interaction
    new Setting(containerEl).setName("Interaction").setHeading();

    new Setting(containerEl)
      .setName("Mouse wheel zoom factor")
      .setDesc("Multiplier per step. 1.1 = 10% per tick.")
      .addText((t) =>
        t
          .setPlaceholder("1.1")
          .setValue(String(this.plugin.settings.wheelZoomFactor))
          .onChange((v) => {
            const n = Number(v);
            if (!Number.isNaN(n) && n > 1.001 && n < 2.5) {
              this.plugin.settings.wheelZoomFactor = n;
              void this.plugin.saveSettings();
            }
          }),
      );

    new Setting(containerEl)
      .setName("Panning mouse button")
      .setDesc("Which mouse button pans the map?")
      .addDropdown((d) => {
        d.addOption("left", "Left");
        d.addOption("middle", "Middle");
        d.setValue(this.plugin.settings.panMouseButton ?? "left");
        d.onChange((v) => {
          this.plugin.settings.panMouseButton = v === "middle" ? "middle" : "left";
          void this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("Hover popover size")
      .setDesc("Max width and height in pixels.")
      .addText((t) =>
        t
          .setPlaceholder("360")
          .setValue(String(this.plugin.settings.hoverMaxWidth))
          .onChange((v) => {
            const n = Number(v);
            if (!Number.isNaN(n) && n >= 200) {
              this.plugin.settings.hoverMaxWidth = n;
              void this.plugin.saveSettings();
            }
          }),
      )
      .addText((t) =>
        t
          .setPlaceholder("260")
          .setValue(String(this.plugin.settings.hoverMaxHeight))
          .onChange((v) => {
            const n = Number(v);
            if (!Number.isNaN(n) && n >= 120) {
              this.plugin.settings.hoverMaxHeight = n;
              void this.plugin.saveSettings();
            }
          }),
      );

    new Setting(containerEl)
      .setName("Force popovers without ctrl")
      .setDesc("Opens preview popovers on simple hover.")
      .addToggle((t) =>
        t.setValue(!!this.plugin.settings.forcePopoverWithoutModKey).onChange((v) => {
          this.plugin.settings.forcePopoverWithoutModKey = v;
          void this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Open editor when placing pin from menu")
      .setDesc("When enabled, placing a pin from the pins menu opens the marker editor.")
      .addToggle((t) =>
        t.setValue(!!this.plugin.settings.pinPlaceOpensEditor).onChange((v) => {
          this.plugin.settings.pinPlaceOpensEditor = v;
          void this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Preferences")
      .setDesc("Global defaults for marker creation and behavior.")
      .addButton((b) =>
        b.setButtonText("Open…").onClick(() => {
          new PreferencesModal(this.app, this.plugin).open();
        }),
      );

    // Ruler
    new Setting(containerEl).setName("Ruler").setHeading();

    const applyStyleToAll = () => {
      const color = (this.plugin.settings.measureLineColor ?? "var(--text-accent)").trim();
      const widthPx = Math.max(1, this.plugin.settings.measureLineWidth ?? 2);
      document.querySelectorAll(".zm-root").forEach((el) => {
        if (el instanceof HTMLElement) {
          setCssProps(el, {
            "--zm-measure-color": color,
            "--zm-measure-width": `${widthPx}px`,
          });
        }
      });
    };

    const colorRow = new Setting(containerEl)
      .setName("Line color")
      .setDesc("CSS color, e.g. #ff0055.");

    colorRow.addText((t) =>
      t
        .setPlaceholder("Default")
        .setValue(this.plugin.settings.measureLineColor ?? "var(--text-accent)")
        .onChange((v) => {
          this.plugin.settings.measureLineColor = v?.trim() || "var(--text-accent)";
          void this.plugin.saveSettings();
          applyStyleToAll();
        }),
    );

    const picker = colorRow.controlEl.createEl("input", {
      attr: {
        type: "color",
        style: "margin-left:8px; vertical-align: middle;",
      },
    });

    const setPickerFromValue = (val: string) => {
      if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) picker.value = val;
      else picker.value = "#ff0000";
    };
    setPickerFromValue(this.plugin.settings.measureLineColor ?? "");
    picker.oninput = () => {
      this.plugin.settings.measureLineColor = picker.value;
      void this.plugin.saveSettings();
      applyStyleToAll();
    };

    new Setting(containerEl)
      .setName("Line width")
      .setDesc("Stroke width in pixels.")
      .addText((t) =>
        t
          .setPlaceholder("2")
          .setValue(String(this.plugin.settings.measureLineWidth ?? 2))
          .onChange((v) => {
            const n = Number(v);
            if (Number.isFinite(n) && n > 0 && n <= 20) {
              this.plugin.settings.measureLineWidth = n;
              void this.plugin.saveSettings();
              applyStyleToAll();
            }
          }),
      );

    // Custom units
    new Setting(containerEl).setName("Custom units").setHeading();

    const customUnitsWrap = containerEl.createDiv();
    const renderCustomUnits = () => {
      customUnitsWrap.empty();

      const ext = this.plugin.settings as ZoomMapSettingsExtended;
      ext.customUnits ??= [];
      const units = ext.customUnits;

      if (units.length === 0) {
        customUnitsWrap.createEl("div", { text: "No custom units defined yet." });
      } else {
        units.forEach((u, idx) => {
          const row = customUnitsWrap.createDiv({ cls: "zoommap-custom-unit-row" });

          const nameInput = row.createEl("input", { type: "text" });
          nameInput.placeholder = "Name (e.g. Hex)";
          nameInput.value = u.name;
          nameInput.oninput = () => {
            u.name = nameInput.value.trim();
            void this.plugin.saveSettings();
          };

          const abbrInput = row.createEl("input", { type: "text" });
          abbrInput.placeholder = "Abbreviation";
          abbrInput.value = u.abbreviation;
          abbrInput.oninput = () => {
            u.abbreviation = abbrInput.value.trim();
            void this.plugin.saveSettings();
          };

          const factorInput = row.createEl("input", { type: "number" });
          factorInput.placeholder = "1.0";
          factorInput.value = String(u.metersPerUnit);
          factorInput.step = "0.0001";
          factorInput.oninput = () => {
            const n = Number(factorInput.value);
            if (Number.isFinite(n) && n > 0) {
              u.metersPerUnit = n;
              void this.plugin.saveSettings();
            }
          };

          const delBtn = row.createEl("button", { text: "Delete" });
          delBtn.onclick = () => {
            units.splice(idx, 1);
            void this.plugin.saveSettings().then(() => {
              renderCustomUnits();
            });
          };
        });
      }

      const addBtn = customUnitsWrap.createEl("button", { text: "Add custom unit" });
      addBtn.addClass("zoommap-custom-unit-add-button");
      addBtn.onclick = () => {
        const ext2 = this.plugin.settings as ZoomMapSettingsExtended;
        ext2.customUnits ??= [];
        const id = `cu-${Math.random().toString(36).slice(2, 8)}`;
        ext2.customUnits.push({
          id,
          name: "Hex",
          abbreviation: "hex",
          metersPerUnit: 5 * 0.3048,
        } as CustomUnitDef);

        void this.plugin.saveSettings().then(() => {
          renderCustomUnits();
        });
      };
    };
    renderCustomUnits();

    /* ---------------- Collections ---------------- */

    new Setting(containerEl).setName("Collections (base-bound)").setHeading();

    const collectionsWrap = containerEl.createDiv();
    const renderCollections = () => {
      collectionsWrap.empty();

      const hint = collectionsWrap.createEl("div", {
        text: "Collections bundle pins, favorites and stickers for specific base images. Create a 'global' collection without bindings for items that should be available everywhere.",
      });
      hint.addClass("zoommap-collections-hint");

      const list = collectionsWrap.createDiv();
      const cols = this.plugin.settings.baseCollections ?? [];
      if (cols.length === 0) {
        list.createEl("div", { text: "No collections yet." });
      } else {
        cols.forEach((c) => {
          const row = list.createDiv({ cls: "zoommap-collections-row" });
          const left = row.createDiv();

          const name = left.createEl("div", { text: c.name || "(unnamed collection)" });
          name.addClass("zoommap-collections-name");

          const meta = left.createEl("div", {
            text: `${c.bindings?.basePaths?.length ?? 0} bases • ${c.include?.pinKeys?.length ?? 0} pins • ${c.include?.favorites?.length ?? 0} favorites • ${c.include?.stickers?.length ?? 0} stickers`,
          });
          meta.addClass("zoommap-collections-meta");

          const edit = row.createEl("button", { text: "Edit" });
          edit.onclick = () => {
            new CollectionEditorModal(this.app, this.plugin, c, ({ updated, deleted }) => {
              if (deleted) {
                const arr = this.plugin.settings.baseCollections ?? [];
                const pos = arr.indexOf(c);
                if (pos >= 0) arr.splice(pos, 1);

                void this.plugin.saveSettings().then(() => {
                  renderCollections();
                });
                return;
              }

              if (updated) {
                void this.plugin.saveSettings().then(() => {
                  renderCollections();
                });
              }
            }).open();
          };

          const del = row.createEl("button", { text: "Delete" });
          del.onclick = () => {
            const arr = this.plugin.settings.baseCollections ?? [];
            const pos = arr.indexOf(c);
            if (pos >= 0) arr.splice(pos, 1);

            void this.plugin.saveSettings().then(() => {
              renderCollections();
            });
          };
        });
      }

      const actions = collectionsWrap.createDiv({ cls: "zoommap-collections-actions" });
      const add = actions.createEl("button", { text: "Add collection" });
      add.onclick = () => {
        const fresh: BaseCollection = {
          id: `col-${Math.random().toString(36).slice(2, 8)}`,
          name: "New Collection",
          bindings: { basePaths: [] },
          include: { pinKeys: [], favorites: [], stickers: [] },
        };

        new CollectionEditorModal(this.app, this.plugin, fresh, ({ updated, deleted }) => {
          if (deleted) return;
          if (updated) {
            this.plugin.settings.baseCollections = this.plugin.settings.baseCollections ?? [];
            this.plugin.settings.baseCollections.push(fresh);

            void this.plugin.saveSettings().then(() => {
              renderCollections();
            });
          }
        }).open();
      };
    };
    renderCollections();

    /* ---------------- Marker icons (library) ---------------- */

    new Setting(containerEl).setName("Marker icons (library)").setHeading();

    const libRow = new Setting(containerEl)
      .setName("Library file (icons + collections)")
      .setDesc("Choose a JSON file in the vault to save/load your icon library and collections.");

    libRow.addText((t) => {
      const ext = this.plugin.settings as ZoomMapSettingsExtended;
      t.setPlaceholder("ZoomMap/library.json");
      t.setValue(ext.libraryFilePath ?? "ZoomMap/library.json");
      t.onChange((v) => {
        (this.plugin.settings as ZoomMapSettingsExtended).libraryFilePath =
          v.trim() || "ZoomMap/library.json";
        void this.plugin.saveSettings();
      });
    });

    libRow.addButton((b) =>
      b.setButtonText("Pick…").onClick(() => {
        new JsonFileSuggestModal(this.app, (file) => {
          (this.plugin.settings as ZoomMapSettingsExtended).libraryFilePath = file.path;
          void this.plugin.saveSettings().then(() => {
            this.display();
          });
        }).open();
      }),
    );

    libRow.addButton((b) =>
      b.setButtonText("Save now").onClick(() => {
        const ext = this.plugin.settings as ZoomMapSettingsExtended;
        const p = ext.libraryFilePath?.trim() ?? "ZoomMap/library.json";
        void this.plugin.saveLibraryToPath(p);
      }),
    );

    libRow.addButton((b) =>
      b.setButtonText("Load…").onClick(() => {
        new JsonFileSuggestModal(this.app, (file) => {
          void this.plugin.loadLibraryFromFile(file).then(() => {
            this.display();
          });
        }).open();
      }),
    );

    // SVG icons section
    new Setting(containerEl).setName("SVG icons").setHeading();

    const svgFolderRow = new Setting(containerEl)
      .setName("SVG icon folder in vault")
      .setDesc("Folder that contains SVG packs.");

    svgFolderRow.addText((t) => {
      const ext = this.plugin.settings as ZoomMapSettingsExtended;
      t.setPlaceholder("e.g. ZoomMap/SVGs");
      t.setValue(ext.faFolderPath ?? "ZoomMap/SVGs");
      t.onChange((v) => {
        ext.faFolderPath = (v || "ZoomMap/SVGs").trim();
        void this.plugin.saveSettings();
      });
    });

    svgFolderRow.addButton((b) =>
      b.setButtonText("Ensure folder").onClick(() => {
        const ext = this.plugin.settings as ZoomMapSettingsExtended;
        const folder = normalizePath(ext.faFolderPath?.trim() || "ZoomMap/SVGs");
        if (!this.app.vault.getAbstractFileByPath(folder)) {
          void this.app.vault.createFolder(folder).then(() => {
            new Notice(`Created folder: ${folder}`, 2000);
          });
        } else {
          new Notice("Folder already exists.", 1500);
        }
      }),
    );

    svgFolderRow.addButton((b) =>
      b.setButtonText("Rescan icons").onClick(() => {
        this.plugin.rescanSvgFolder();
      }),
    );

    const svgDownloadRow = new Setting(containerEl)
      .setName("Download icon packs")
      .setDesc("Download common SVG packs into the configured folder.");

    svgDownloadRow.addButton((b) =>
      b.setButtonText("Download font awesome free").onClick(() => {
        void this.plugin.downloadFontAwesomeZip();
      }),
    );

    svgDownloadRow.addButton((b) =>
      b.setButtonText("Download rpg awesome").onClick(() => {
        void this.plugin.downloadRpgAwesomeZip();
      }),
    );

    type IconLinkSuggestion = { label: string; value: string };

    const buildLinkSuggestions = (): IconLinkSuggestion[] => {
      const files = this.app.vault.getFiles().filter((f) => f.extension?.toLowerCase() === "md");
      const suggestions: IconLinkSuggestion[] = [];

      const active = this.app.workspace.getActiveFile();
      const fromPath = active?.path ?? files[0]?.path ?? "";

      for (const file of files) {
        const baseLink = this.app.metadataCache.fileToLinktext(file, fromPath);

        suggestions.push({ label: baseLink, value: baseLink });

        const cache = this.app.metadataCache.getCache(file.path);
        const headings = cache?.headings ?? [];
        for (const h of headings) {
          const headingName = h.heading;
          const full = `${baseLink}#${headingName}`;
          suggestions.push({ label: `${baseLink} › ${headingName}`, value: full });
        }
      }

      return suggestions;
    };

    const allLinkSuggestions = buildLinkSuggestions();

    const attachLinkAutocomplete = (
      input: HTMLInputElement,
      getValue: () => string,
      setValue: (val: string) => void,
    ): void => {
      const wrapper = input.parentElement;
      if (!(wrapper instanceof HTMLElement)) return;

      wrapper.classList.add("zoommap-link-input-wrapper");
      const listEl = wrapper.createDiv({ cls: "zoommap-link-suggestions is-hidden" });

      const hide = () => listEl.classList.add("is-hidden");
      const show = () => listEl.classList.remove("is-hidden");

      const updateList = (query: string) => {
        const q = query.trim().toLowerCase();
        listEl.empty();

        if (!q) {
          hide();
          return;
        }

        const maxItems = 20;
        const matches = allLinkSuggestions
          .filter((s) => s.value.toLowerCase().includes(q) || s.label.toLowerCase().includes(q))
          .slice(0, maxItems);

        if (matches.length === 0) {
          hide();
          return;
        }

        show();

        matches.forEach((s) => {
          const row = listEl.createDiv({ cls: "zoommap-link-suggestion-item" });
          row.setText(s.label);
          row.addEventListener("mousedown", (ev) => {
            ev.preventDefault();
            setValue(s.value);
            hide();
          });
        });
      };

      input.addEventListener("input", () => updateList(input.value));

      input.addEventListener("blur", () => {
        window.setTimeout(() => hide(), 150);
      });

      updateList(getValue());
    };

    const isSvgIcon = (icon: IconProfile): boolean => {
      const src = icon.pathOrDataUrl ?? "";
      if (typeof src !== "string") return false;
      const lower = src.toLowerCase();
      return lower.startsWith("data:image/svg+xml") || lower.endsWith(".svg");
    };

    // SVG icons table header
    const svgIconsHead = containerEl.createDiv({ cls: "zm-icons-grid-head zm-grid" });
    svgIconsHead.createSpan({ text: "Name" });
    svgIconsHead.createSpan({ text: "Preview / color / link" });
    svgIconsHead.createSpan({ text: "Size" });

    const headSvgAX = svgIconsHead.createSpan({ cls: "zm-icohead" });
    const svgAxIco = headSvgAX.createSpan();
    setIcon(svgAxIco, "anchor");
    headSvgAX.appendText(" X");

    const headSvgAY = svgIconsHead.createSpan({ cls: "zm-icohead" });
    const svgAyIco = headSvgAY.createSpan();
    setIcon(svgAyIco, "anchor");
    headSvgAY.appendText(" Y");

    svgIconsHead.createSpan({ text: "Angle" });

    const headSvgTrash = svgIconsHead.createSpan();
    setIcon(headSvgTrash, "trash");

    const svgIconsGrid = containerEl.createDiv({ cls: "zm-icons-grid zm-grid" });

    const addSvgSetting = new Setting(containerEl)
      .setName("Add SVG icon")
      .setDesc("Create a pin icon from an SVG file in the configured folder.");

    const infoIcon = addSvgSetting.controlEl.createDiv({ cls: "zoommap-info-icon" });
    setIcon(infoIcon, "info");
    infoIcon.setAttr(
      "title",
      "Rendering many SVG files in the picker can cause noticeable delays while all previews are generated. Once the icons are cached, searching and adding should feel much faster.",
    );

    addSvgSetting.addButton((b) =>
      b.setButtonText("Add SVG icon").onClick(() => {
        const ext = this.plugin.settings as ZoomMapSettingsExtended;
        const folder = ext.faFolderPath?.trim() || "ZoomMap/SVGs";

        new FaIconPickerModal(this.app, folder, (file: TFile) => {
          void this.addFontAwesomeIcon(file);
        }).open();
      }),
    );

    // Image icons heading
    new Setting(containerEl).setName("Image icons").setHeading();

    const imgIconsHead = containerEl.createDiv({ cls: "zm-icons-grid-head zm-grid" });
    imgIconsHead.createSpan({ text: "Name" });
    imgIconsHead.createSpan({ text: "Path / data:URL + default link" });
    imgIconsHead.createSpan({ text: "Size" });

    const headImgAX = imgIconsHead.createSpan({ cls: "zm-icohead" });
    const axIco = headImgAX.createSpan();
    setIcon(axIco, "anchor");
    headImgAX.appendText(" X");

    const headImgAY = imgIconsHead.createSpan({ cls: "zm-icohead" });
    const ayIco = headImgAY.createSpan();
    setIcon(ayIco, "anchor");
    headImgAY.appendText(" Y");

    imgIconsHead.createSpan({ text: "Angle" });

    const headImgTrash = imgIconsHead.createSpan();
    setIcon(headImgTrash, "trash");

    const imgIconsGrid = containerEl.createDiv({ cls: "zm-icons-grid zm-grid" });

    const renderIcons = () => {
      svgIconsGrid.empty();
      imgIconsGrid.empty();

      for (const icon of this.plugin.settings.icons) {
        if (isSvgIcon(icon)) {
          const row = svgIconsGrid.createDiv({ cls: "zm-row" });

          const name = row.createEl("input", { type: "text" });
          name.classList.add("zm-name");
          name.value = icon.key;
          name.oninput = () => {
            icon.key = name.value.trim();
            void this.plugin.saveSettings();
          };

          const previewCell = row.createDiv({ cls: "zoommap-settings__preview-cell" });

          const img = previewCell.createEl("img");
          img.addClass("zoommap-settings__icon-preview");

          let src = icon.pathOrDataUrl ?? "";
          if (typeof src === "string" && !src.startsWith("data:") && src) {
            const f = this.app.vault.getAbstractFileByPath(src);
            if (f instanceof TFile) {
              src = this.app.vault.getResourcePath(f);
            }
          }
          img.src = typeof src === "string" ? src : "";

          const applyRotationPreview = () => {
            const deg = icon.rotationDeg ?? 0;
            setCssProps(img, {
              transform: deg ? `rotate(${deg}deg)` : null,
            });
          };
          applyRotationPreview();

          const rawSrc = icon.pathOrDataUrl ?? "";
          const isSvgData = typeof rawSrc === "string" && rawSrc.startsWith("data:image/svg+xml");
          let currentColor = "";
          if (isSvgData) {
            const c = this.getSvgColorFromDataUrl(rawSrc);
            if (c) currentColor = c;
          }

          const colorInput = previewCell.createEl("input", { type: "text" });
          colorInput.addClass("zoommap-settings__color-input");
          colorInput.placeholder = "Color";
          colorInput.value = currentColor;

          const colorPicker = previewCell.createEl("input", { type: "color" });
          colorPicker.addClass("zoommap-settings__color-picker");

          if (currentColor && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(currentColor)) {
            if (currentColor.length === 4) {
              const r = currentColor[1];
              const g = currentColor[2];
              const b = currentColor[3];
              colorPicker.value = `#${r}${r}${g}${g}${b}${b}`;
            } else {
              colorPicker.value = currentColor;
            }
          }

          const applyColor = (val: string) => {
            const c = val.trim();
            if (!c) return;
            void this.recolorIconSvg(icon, c).then(() => {
              const updated = icon.pathOrDataUrl ?? "";
              let out = updated;
              if (typeof out === "string" && !out.startsWith("data:") && out) {
                const f = this.app.vault.getAbstractFileByPath(out);
                if (f instanceof TFile) out = this.app.vault.getResourcePath(f);
              }
              img.src = typeof out === "string" ? out : "";
            });
          };

          colorInput.addEventListener("change", () => {
            const val = colorInput.value;
            applyColor(val);
            if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) {
              if (val.length === 4) {
                const r = val[1];
                const g = val[2];
                const b = val[3];
                colorPicker.value = `#${r}${r}${g}${g}${b}${b}`;
              } else {
                colorPicker.value = val;
              }
            }
          });

          colorPicker.addEventListener("input", () => {
            const hex = colorPicker.value;
            colorInput.value = hex;
            applyColor(hex);
          });

          const linkInput = previewCell.createEl("input", { type: "text" });
          linkInput.addClass("zoommap-settings__link-input--small");
          linkInput.placeholder = "Default link (optional)";
          linkInput.value = icon.defaultLink ?? "";
          linkInput.oninput = () => {
            icon.defaultLink = linkInput.value.trim() || undefined;
            void this.plugin.saveSettings();
          };

          attachLinkAutocomplete(
            linkInput,
            () => icon.defaultLink ?? "",
            (val) => {
              icon.defaultLink = val;
              linkInput.value = val;
              void this.plugin.saveSettings();
            },
          );

          const size = row.createEl("input", { type: "number" });
          size.classList.add("zm-num");
          size.value = String(icon.size);
          size.oninput = () => {
            const n = Number(size.value);
            if (!Number.isNaN(n) && n > 0) {
              icon.size = n;
              void this.plugin.saveSettings();
            }
          };

          const ax = row.createEl("input", { type: "number" });
          ax.classList.add("zm-num");
          ax.value = String(icon.anchorX);
          ax.oninput = () => {
            const n = Number(ax.value);
            if (!Number.isNaN(n)) {
              icon.anchorX = n;
              void this.plugin.saveSettings();
            }
          };

          const ay = row.createEl("input", { type: "number" });
          ay.classList.add("zm-num");
          ay.value = String(icon.anchorY);
          ay.oninput = () => {
            const n = Number(ay.value);
            if (!Number.isNaN(n)) {
              icon.anchorY = n;
              void this.plugin.saveSettings();
            }
          };

          const angle = row.createEl("input", { type: "number" });
          angle.classList.add("zm-num");
          angle.value = String(icon.rotationDeg ?? 0);
          angle.oninput = () => {
            const n = Number(angle.value);
            if (!Number.isNaN(n)) {
              icon.rotationDeg = n || 0;
              void this.plugin.saveSettings();
              applyRotationPreview();
            }
          };

          const del = row.createEl("button", { attr: { title: "Delete" } });
          del.classList.add("zm-icon-btn");
          setIcon(del, "trash");
          del.onclick = () => {
            this.plugin.settings.icons = this.plugin.settings.icons.filter((i) => i !== icon);
            void this.plugin.saveSettings();
            renderIcons();
          };
        } else {
          const row = imgIconsGrid.createDiv({ cls: "zm-row" });

          const name = row.createEl("input", { type: "text" });
          name.classList.add("zm-name");
          name.value = icon.key;
          name.oninput = () => {
            icon.key = name.value.trim();
            void this.plugin.saveSettings();
          };

          const pathWrap = row.createDiv({ cls: "zm-path-wrap" });

          const path = pathWrap.createEl("input", { type: "text" });
          path.addClass("zoommap-settings__icon-path-input");
          path.value = icon.pathOrDataUrl ?? "";
          path.oninput = () => {
            icon.pathOrDataUrl = path.value.trim();
            void this.plugin.saveSettings();
          };

          const pick = pathWrap.createEl("button", { attr: { title: "Choose file…" } });
          pick.classList.add("zm-icon-btn");
          setIcon(pick, "folder-open");
          pick.onclick = () => {
            new ImageFileSuggestModal(this.app, (file: TFile) => {
              icon.pathOrDataUrl = file.path;
              void this.plugin.saveSettings();
              renderIcons();
            }).open();
          };

          const linkInput = pathWrap.createEl("input", { type: "text" });
          linkInput.addClass("zoommap-settings__link-input--medium");
          linkInput.placeholder = "Default link (optional)";
          linkInput.value = icon.defaultLink ?? "";
          linkInput.oninput = () => {
            icon.defaultLink = linkInput.value.trim() || undefined;
            void this.plugin.saveSettings();
          };

          attachLinkAutocomplete(
            linkInput,
            () => icon.defaultLink ?? "",
            (val) => {
              icon.defaultLink = val;
              linkInput.value = val;
              void this.plugin.saveSettings();
            },
          );

          const size = row.createEl("input", { type: "number" });
          size.classList.add("zm-num");
          size.value = String(icon.size);
          size.oninput = () => {
            const n = Number(size.value);
            if (!Number.isNaN(n) && n > 0) {
              icon.size = n;
              void this.plugin.saveSettings();
            }
          };

          const ax = row.createEl("input", { type: "number" });
          ax.classList.add("zm-num");
          ax.value = String(icon.anchorX);
          ax.oninput = () => {
            const n = Number(ax.value);
            if (!Number.isNaN(n)) {
              icon.anchorX = n;
              void this.plugin.saveSettings();
            }
          };

          const ay = row.createEl("input", { type: "number" });
          ay.classList.add("zm-num");
          ay.value = String(icon.anchorY);
          ay.oninput = () => {
            const n = Number(ay.value);
            if (!Number.isNaN(n)) {
              icon.anchorY = n;
              void this.plugin.saveSettings();
            }
          };

          const angle = row.createEl("input", { type: "number" });
          angle.classList.add("zm-num");
          angle.value = String(icon.rotationDeg ?? 0);
          angle.oninput = () => {
            const n = Number(angle.value);
            if (!Number.isNaN(n)) {
              icon.rotationDeg = n || 0;
              void this.plugin.saveSettings();
            }
          };

          const del = row.createEl("button", { attr: { title: "Delete" } });
          del.classList.add("zm-icon-btn");
          setIcon(del, "trash");
          del.onclick = () => {
            this.plugin.settings.icons = this.plugin.settings.icons.filter((i) => i !== icon);
            void this.plugin.saveSettings();
            renderIcons();
          };
        }
      }
    };

    renderIcons();

    new Setting(containerEl)
      .setName("Add new icon")
      .setDesc("Create a new image-based icon entry.")
      .addButton((b) =>
        b.setButtonText("Add").onClick(() => {
          const idx = this.plugin.settings.icons.length + 1;
          this.plugin.settings.icons.push({
            key: `pin-${idx}`,
            pathOrDataUrl: "",
            size: 24,
            anchorX: 12,
            anchorY: 12,
          });
          void this.plugin.saveSettings();
          this.display();
        }),
      );
  }
}