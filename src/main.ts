import {
  Plugin,
  PluginSettingTab,
  Setting,
  parseYaml,
  normalizePath,
  TFile,
  Notice,
  setIcon,
  requestUrl,
} from "obsidian";
import type { App, MarkdownPostProcessorContext } from "obsidian";
import { MapInstance } from "./map";
import type { ZoomMapConfig, ZoomMapSettings, IconProfile, BaseCollection, CustomUnitDef } from "./map";
import { ImageFileSuggestModal } from "./iconFileSuggest";
import { CollectionEditorModal } from "./collectionsModals";
import { JsonFileSuggestModal } from "./jsonFileSuggest";
import { FaIconPickerModal } from "./faIconPickerModal";
import { FaCreateIconModal } from "./faCreateIconModal"

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
  libraryFilePath?: string; // single library file in the vault that stores icons + collections
  faFolderPath?: string;    // folder in vault containing Font Awesome SVG icons
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

// URL for Font Awesome Free web ZIP that contains SVG icons.
// You can update this URL to a newer release if needed.
const DEFAULT_FA_ZIP_URL =
  "https://use.fontawesome.com/releases/v6.4.0/fontawesome-free-6.4.0-web.zip";

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

/* ---------------- Defaults ---------------- */

const DEFAULT_SETTINGS: ZoomMapSettingsExtended = {
  icons: [
    { key: "pinRed",  pathOrDataUrl: svgPinDataUrl("#d23c3c"), size: 24, anchorX: 12, anchorY: 12 },
    { key: "pinBlue", pathOrDataUrl: svgPinDataUrl("#3c62d2"), size: 24, anchorX: 12, anchorY: 12 },
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
  faFolderPath: "ZoomMap/FontAwesome",
  customUnits: [],
};

/* ---------------- YAML parsing helpers ---------------- */

interface YamlBase { path: string; name?: string }
interface YamlOverlay { path: string; name?: string; visible?: boolean }

interface YamlOptions {
  image?: string;
  markers?: string;
  minZoom?: number | string;
  maxZoom?: number | string;
  height?: string | number;
  width?: string | number;
  resizable?: boolean;
  resizeHandle?: string;      // will be parsed
  render?: string;            // will be parsed
  responsive?: boolean;
  responsiv?: boolean;        // legacy alias

  storage?: string;           // will be parsed to json|note
  id?: string;

  align?: string;             // will be parsed to left|center|right
  wrap?: boolean;

  classes?: string | string[];

  imageBases?: (YamlBase | string)[];
  imageOverlays?: (YamlOverlay | string)[];

  scale?: { metersPerPixel?: number; pixelsPerMeter?: number };
}

function parseBasesYaml(v: unknown): YamlBase[] {
  if (!Array.isArray(v)) return [];
  return (v as unknown[]).map((it) => {
    if (typeof it === "string") return { path: it };
    if (it && typeof it === "object" && "path" in it) {
      const obj = it as { path?: unknown; name?: unknown };
      if (typeof obj.path === "string") {
        return { path: obj.path, name: typeof obj.name === "string" ? obj.name : undefined };
      }
    }
    return null;
  }).filter((b): b is YamlBase => b !== null);
}

function parseOverlaysYaml(v: unknown): YamlOverlay[] {
  if (!Array.isArray(v)) return [];
  return (v as unknown[]).map((it) => {
    if (typeof it === "string") return { path: it };
    if (it && typeof it === "object" && "path" in it) {
      const obj = it as { path?: unknown; name?: unknown; visible?: unknown };
      if (typeof obj.path === "string") {
        return {
          path: obj.path,
          name: typeof obj.name === "string" ? obj.name : undefined,
          visible: typeof obj.visible === "boolean" ? obj.visible : undefined,
        };
      }
    }
    return null;
  }).filter((o): o is YamlOverlay => o !== null);
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
  return v === "left" || v === "right" || v === "both" || v === "native" ? v : "right";
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

    let fw = NaN;
    let fh = NaN;
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
        // Parse YAML block (typed)
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

        const renderMode: "dom" | "canvas" = opts.render === "canvas" ? "canvas" : "dom";

        let image = typeof opts.image === "string" ? opts.image.trim() : "";
        if (!image && yamlBases.length > 0) image = yamlBases[0].path;
        if (!image) {
          el.createEl("div", { text: "Image is missing." });
          return;
        }

        const responsive = !!(opts.responsive ?? opts.responsiv);

        // storage: json | note (inline/in-note => note)
        const storageRaw = typeof opts.storage === "string" ? opts.storage.toLowerCase() : "";
        const storageMode: "json" | "note" =
          storageRaw === "note" || storageRaw === "inline" || storageRaw === "in-note"
            ? "note"
            : storageRaw === "json"
            ? "json"
            : (this.settings.storageDefault ?? "json");

        const sectionInfo = ctx.getSectionInfo(el);
        const defaultId = `map-${sectionInfo?.lineStart ?? Date.now()}`;
        const idFromYaml = opts.id;
        const mapId = typeof idFromYaml === "string" && idFromYaml.trim() ? idFromYaml.trim() : defaultId;

        const markersPathRaw = typeof opts.markers === "string" ? opts.markers : undefined;

        const minZoom = responsive
          ? 1e-6
          : parseZoomYaml(opts.minZoom, 0.25);
        const maxZoom = responsive
          ? 1e6
          : parseZoomYaml(opts.maxZoom, 8);

        const markersPath = normalizePath(markersPathRaw ?? `${image}.markers.json`);

        const align = parseAlign(opts.align);
        const wrap = !!opts.wrap;

        const classesValue = opts.classes;
        const extraClasses: string[] = Array.isArray(classesValue)
          ? (classesValue as unknown[]).map((c) => String(c))
          : typeof classesValue === "string"
          ? classesValue.split(/\s+/).map((c) => c.trim()).filter(Boolean)
          : [];

        const resizable = responsive ? false : (typeof opts.resizable === "boolean" ? opts.resizable : this.settings.defaultResizable);
        const resizeHandle = responsive ? "right" : parseResizeHandle(opts.resizeHandle);

        const widthFromYaml = Object.prototype.hasOwnProperty.call(opts, "width");
        const heightFromYaml = Object.prototype.hasOwnProperty.call(opts, "height");

        const extSettings = this.settings as ZoomMapSettingsExtended;
        const widthDefault = wrap ? (extSettings.defaultWidthWrapped ?? "50%") : this.settings.defaultWidth;

        let widthCss = responsive ? "100%" : toCssSize(opts.width, widthDefault);
        let heightCss = responsive ? "auto"   : toCssSize(opts.height, this.settings.defaultHeight);

        // Restore persisted frame (only JSON storage and when width/height not explicitly set)
        if (!responsive && storageMode === "json" && !widthFromYaml && !heightFromYaml) {
          const saved = await readSavedFrame(this.app, markersPath);
          if (saved) {
            widthCss = `${Math.max(220, saved.w)}px`;
            heightCss = `${Math.max(220, saved.h)}px`;
            el.style.width = widthCss;
            el.style.height = heightCss;
          }
        }

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

    // Build a typed object without unnecessary assertions
    const merged: ZoomMapSettings = { ...DEFAULT_SETTINGS };
    if (isPlainObject(savedUnknown)) {
      Object.assign(merged, savedUnknown);
    }
    this.settings = merged;

    const ext = this.settings as ZoomMapSettingsExtended;
    this.settings.baseCollections ??= [];
    ext.defaultWidthWrapped ??= "50%";
    ext.libraryFilePath ??= "ZoomMap/library.json";
    ext.faFolderPath ??= "ZoomMap/FontAwesome";
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
    const folder = normalizePath(ext.faFolderPath?.trim() || "ZoomMap/FontAwesome");
    const zipPath = normalizePath(`${folder}/fontawesome-free.zip`);

    try {
      // Ensure target folder exists
      if (!this.app.vault.getAbstractFileByPath(folder)) {
        await this.app.vault.createFolder(folder);
      }

      new Notice("Downloading font awesome free zip…", 2500);

      const res = await requestUrl({
        url: DEFAULT_FA_ZIP_URL,
        method: "GET",
      });

      const data = res.arrayBuffer;
      // Write ZIP file into the vault
      // @ts-expect-error writeBinary is available on desktop adapters
      await this.app.vault.adapter.writeBinary(zipPath, data);

      new Notice(
        `Downloaded Font Awesome ZIP to ${zipPath}. Please unzip it so that SVG files are available in this folder.`,
        6000,
      );
    } catch (e) {
      console.error("Download Font Awesome ZIP failed", e);
      new Notice("Failed to download font awesome zip.", 4000);
    }
  }
}

/* ---------------- Settings Tab ---------------- */

class ZoomMapSettingTab extends PluginSettingTab {
  plugin: ZoomMapPlugin;

  constructor(app: App, plugin: ZoomMapPlugin) {
    super(app, plugin);
    this.plugin = plugin;
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
        t
          .setValue(!!this.plugin.settings.forcePopoverWithoutModKey)
          .onChange((v) => {
            this.plugin.settings.forcePopoverWithoutModKey = v;
            void this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Open editor when placing pin from menu")
      .setDesc("When enabled, placing a pin from the pins menu opens the marker editor.")
      .addToggle((t) =>
        t
          .setValue(!!this.plugin.settings.pinPlaceOpensEditor)
          .onChange((v) => {
            this.plugin.settings.pinPlaceOpensEditor = v;
            void this.plugin.saveSettings();
          }),
      );

    // Ruler
    new Setting(containerEl).setName("Ruler").setHeading();

    const applyStyleToAll = () => {
      const color = (this.plugin.settings.measureLineColor ?? "var(--text-accent)").trim();
      const widthPx = Math.max(1, this.plugin.settings.measureLineWidth ?? 2);
      document.querySelectorAll(".zm-root").forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.setProperty("--zm-measure-color", color);
          el.style.setProperty("--zm-measure-width", `${widthPx}px`);
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
          this.plugin.settings.measureLineColor =
            v?.trim() || "var(--text-accent)";
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
      if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) {
        picker.value = val;
      } else {
        picker.value = "#ff0000";
      }
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
        customUnitsWrap.createEl("div", {
          text: "No custom units defined yet.",
        });
      } else {
        units.forEach((u, idx) => {
          const row = customUnitsWrap.createDiv();
          row.style.display = "grid";
          row.style.gridTemplateColumns = "1.5fr 1fr 1fr auto";
          row.style.gap = "8px";
          row.style.alignItems = "center";
          row.style.marginBottom = "4px";

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
          delBtn.onclick = async () => {
            units.splice(idx, 1);
            await this.plugin.saveSettings();
            renderCustomUnits();
          };
        });
      }

      const addBtn = customUnitsWrap.createEl("button", {
        text: "Add custom unit",
      });
      addBtn.style.marginTop = "6px";
      addBtn.onclick = async () => {
        const ext2 = this.plugin.settings as ZoomMapSettingsExtended;
        ext2.customUnits ??= [];
        const id = `cu-${Math.random().toString(36).slice(2, 8)}`;
        ext2.customUnits.push({
          id,
          name: "Hex",
          abbreviation: "hex",
          metersPerUnit: 5 * 0.3048, // default 5 ft
        } as CustomUnitDef);
        await this.plugin.saveSettings();
        renderCustomUnits();
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
      hint.style.marginBottom = "8px";

      const list = collectionsWrap.createDiv();
      const cols = this.plugin.settings.baseCollections ?? [];
      if (cols.length === 0) {
        list.createEl("div", { text: "No collections yet." });
      } else {
        cols.forEach((c) => {
          const row = list.createDiv({ cls: "zoommap-collections-row" });
          const left = row.createDiv();
          const name = left.createEl("div", { text: c.name || "(unnamed collection)" });
          name.style.fontWeight = "600";
          const meta = left.createEl("div", {
            text: `${c.bindings?.basePaths?.length ?? 0} bases • ${c.include?.pinKeys?.length ?? 0} pins • ${c.include?.favorites?.length ?? 0} favorites • ${c.include?.stickers?.length ?? 0} stickers`,
          });
          meta.style.fontSize = "12px";
          meta.style.color = "var(--text-muted)";

          const edit = row.createEl("button", { text: "Edit" });
          edit.onclick = () => {
            new CollectionEditorModal(
              this.app,
              this.plugin,
              c,
              async ({ updated, deleted }) => {
                if (deleted) {
                  const arr = this.plugin.settings.baseCollections ?? [];
                  const pos = arr.indexOf(c);
                  if (pos >= 0) arr.splice(pos, 1);
                  await this.plugin.saveSettings();
                  renderCollections();
                  return;
                }
                if (updated) {
                  await this.plugin.saveSettings();
                  renderCollections();
                }
              },
            ).open();
          };

          const del = row.createEl("button", { text: "Delete" });
          del.onclick = async () => {
            const arr = this.plugin.settings.baseCollections ?? [];
            const pos = arr.indexOf(c);
            if (pos >= 0) arr.splice(pos, 1);
            await this.plugin.saveSettings();
            renderCollections();
          };
        });
      }

      const actions = collectionsWrap.createDiv({ cls: "zoommap-collections-actions" });
      const add = actions.createEl("button", { text: "Add collection" });
      add.onclick = () => {
        const fresh: BaseCollection = {
          id: `col-${Math.random().toString(36).slice(2, 8)}`,
          name: "New Collection",
          bindings: { basePaths: [] }, // unbound (global) until base added
          include: { pinKeys: [], favorites: [], stickers: [] },
        };
        new CollectionEditorModal(
          this.app,
          this.plugin,
          fresh,
          async ({ updated, deleted }) => {
            if (deleted) return;
            if (updated) {
              this.plugin.settings.baseCollections =
                this.plugin.settings.baseCollections ?? [];
              this.plugin.settings.baseCollections.push(fresh);
              await this.plugin.saveSettings();
              renderCollections();
            }
          },
        ).open();
      };
    };
    renderCollections();

   /* ---------------- Marker icons (library) ---------------- */

    new Setting(containerEl).setName("Marker icons (library)").setHeading();

    // Library file controls (icons + collections)
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
        new JsonFileSuggestModal(this.app, async (file) => {
          (this.plugin.settings as ZoomMapSettingsExtended).libraryFilePath =
            file.path;
          await this.plugin.saveSettings();
          this.display();
        }).open();
      }),
    );

    libRow.addButton((b) =>
      b.setButtonText("Save now").onClick(async () => {
        const ext = this.plugin.settings as ZoomMapSettingsExtended;
        const p = ext.libraryFilePath?.trim() ?? "ZoomMap/library.json";
        await this.plugin.saveLibraryToPath(p);
      }),
    );

    libRow.addButton((b) =>
      b.setButtonText("Load…").onClick(() => {
        new JsonFileSuggestModal(this.app, async (file) => {
          await this.plugin.loadLibraryFromFile(file);
          this.display();
        }).open();
      }),
    );

    // Font Awesome section
    new Setting(containerEl).setName("Font awesome free").setHeading();

    const faRow = new Setting(containerEl)
      .setName("Font awesome folder in vault")
      .setDesc(
        "Zoom map will load SVG icons from this folder. Place SVG files here or download the font awesome free zip.",
      );

    faRow.addText((t) => {
      const ext = this.plugin.settings as ZoomMapSettingsExtended;
      t.setPlaceholder("ZoomMap/FontAwesome");
      t.setValue(ext.faFolderPath ?? "ZoomMap/FontAwesome");
      t.onChange((v) => {
        ext.faFolderPath = (v || "ZoomMap/FontAwesome").trim();
        void this.plugin.saveSettings();
      });
    });

    faRow.addButton((b) =>
      b.setButtonText("Ensure folder").onClick(async () => {
        const ext = this.plugin.settings as ZoomMapSettingsExtended;
        const folder = normalizePath(
          ext.faFolderPath?.trim() || "ZoomMap/FontAwesome",
        );
        if (!this.app.vault.getAbstractFileByPath(folder)) {
          await this.app.vault.createFolder(folder);
          new Notice(`Created folder: ${folder}`, 2000);
        } else {
          new Notice("Folder already exists.", 1500);
        }
      }),
    );

    faRow.addButton((b) =>
      b.setButtonText("Download zip").onClick(async () => {
        await this.plugin.downloadFontAwesomeZip();
      }),
    );

    const iconsHead = containerEl.createDiv({
      cls: "zm-icons-grid-head zm-grid",
    });
    iconsHead.createSpan({ text: "Name" });
    iconsHead.createSpan({ text: "Path / data:URL" });
    iconsHead.createSpan({ text: "Size" });

    const headAX = iconsHead.createSpan({ cls: "zm-icohead" });
    const axIco = headAX.createSpan();
    setIcon(axIco, "anchor");
    headAX.appendText(" X");

    const headAY = iconsHead.createSpan({ cls: "zm-icohead" });
    const ayIco = headAY.createSpan();
    setIcon(ayIco, "anchor");
    headAY.appendText(" Y");

    const headTrash = iconsHead.createSpan();
    setIcon(headTrash, "trash");

    const iconsGrid = containerEl.createDiv({ cls: "zm-icons-grid zm-grid" });

    const renderIcons = () => {
      iconsGrid.empty();
      for (const icon of this.plugin.settings.icons) {
        const row = iconsGrid.createDiv({ cls: "zm-row" });

        const name = row.createEl("input", { type: "text" });
        name.classList.add("zm-name");
        name.value = icon.key;
        name.oninput = () => {
          icon.key = name.value.trim();
          void this.plugin.saveSettings();
        };

        const pathWrap = row.createDiv({ cls: "zm-path-wrap" });
        const path = pathWrap.createEl("input", { type: "text" });
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

        const del = row.createEl("button", { attr: { title: "Delete" } });
        del.classList.add("zm-icon-btn");
        setIcon(del, "trash");
        del.onclick = () => {
          this.plugin.settings.icons = this.plugin.settings.icons.filter((i) => i !== icon);
          void this.plugin.saveSettings();
          renderIcons();
        };
      }
    };

    renderIcons();

    new Setting(containerEl)
      .setName("Add new icon")
      .setDesc("Create an empty icon entry or import one from font awesome.")
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
      )
      .addButton((b) =>
        b.setButtonText("Add from font awesome…").onClick(() => {
          const ext = this.plugin.settings as ZoomMapSettingsExtended;
          const folder =
            ext.faFolderPath?.trim() || "ZoomMap/FontAwesome";

          new FaIconPickerModal(this.app, folder, (file: TFile) => {
            new FaCreateIconModal(
              this.app,
              this.plugin,
              file,
              async (profile) => {
                this.plugin.settings.icons.push(profile);
                await this.plugin.saveSettings();
                this.display();
              },
            ).open();
          }).open();
        }),
      );
  }
}