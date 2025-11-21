import {
  App,
  MarkdownPostProcessorContext,
  Plugin,
  PluginSettingTab,
  Setting,
  parseYaml,
  normalizePath,
  TFile,
  setIcon,
} from "obsidian";
import {
  MapInstance,
  ZoomMapConfig,
  ZoomMapSettings,
  IconProfile,
  MarkerPreset,
  StickerPreset,
} from "./map";
import { ImageFileSuggestModal } from "./iconFileSuggest";

function svgPinDataUrl(color = "#d23c3c"): string {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <path fill="${color}" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7m0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"/>
</svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

type ZoomMapSettingsExtended = ZoomMapSettings & {
  defaultWidthWrapped?: string;
};

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
};

function toCssSize(v: unknown, fallback: string): string {
  if (typeof v === "number" && Number.isFinite(v)) return `${v}px`;
  if (typeof v === "string" && v.trim().length > 0) return v.trim();
  return fallback;
}

type YamlBase = { path: string; name?: string };
type YamlOverlay = { path: string; name?: string; visible?: boolean };

function parseBasesYaml(v: unknown): YamlBase[] {
  if (!Array.isArray(v)) return [];
  return (v as unknown[]).map((it) => {
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

async function readSavedFrame(
  app: App,
  markersPath: string,
): Promise<{ w: number; h: number } | null> {
  try {
    const file = app.vault.getAbstractFileByPath(normalizePath(markersPath));
    if (!(file instanceof TFile)) return null;
    const raw = await app.vault.read(file);
    const json = JSON.parse(raw) as { frame?: { w?: unknown; h?: unknown } };
    const fw = Number(json?.frame?.w);
    const fh = Number(json?.frame?.h);
    if (Number.isFinite(fw) && Number.isFinite(fh) && fw >= 48 && fh >= 48) {
      return { w: Math.round(fw), h: Math.round(fh) };
    }
  } catch (error) {
    console.error("Zoom Map: failed to read saved frame", error);
  }
  return null;
}

export default class ZoomMapPlugin extends Plugin {
  settings: ZoomMapSettings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();

    this.registerMarkdownCodeBlockProcessor(
      "zoommap",
      async (
        src: string,
        el: HTMLElement,
        ctx: MarkdownPostProcessorContext,
      ) => {
        let opts: Record<string, unknown> = {};
        try {
          const parsed = parseYaml(src);
          if (parsed && typeof parsed === "object") {
            opts = parsed as Record<string, unknown>;
          }
        } catch (error) {
          console.error("Zoom Map: failed to parse zoommap block", error);
        }

        const yamlBases = parseBasesYaml(opts["imageBases"]);
        const yamlOverlays = parseOverlaysYaml(opts["imageOverlays"]);
        const yamlMetersPerPixel = parseScaleYaml(opts["scale"]);

        const renderRaw =
          typeof opts["render"] === "string" ? opts["render"].toLowerCase() : "";
        const renderMode: "dom" | "canvas" =
          renderRaw === "canvas" ? "canvas" : "dom";

        let image =
          typeof opts["image"] === "string" ? opts["image"].trim() : "";
        if (!image && yamlBases.length > 0) image = yamlBases[0].path;
        if (!image) {
          el.createEl("div", {
            text: "Image is missing.",
          });
          return;
        }

        const storageRaw =
          typeof opts["storage"] === "string"
            ? opts["storage"].toLowerCase()
            : "";
        const storageMode: "json" | "note" =
          storageRaw === "note" ||
          storageRaw === "inline" ||
          storageRaw === "in-note"
            ? "note"
            : storageRaw === "json"
            ? "json"
            : this.settings.storageDefault ?? "json";

        const sectionInfo = ctx.getSectionInfo(el);
        const defaultId = `map-${sectionInfo?.lineStart ?? Date.now()}`;
        const mapId =
          typeof opts["id"] === "string" && opts["id"].trim()
            ? (opts["id"] as string).trim()
            : defaultId;

        const markersPathRaw =
          typeof opts["markers"] === "string"
            ? (opts["markers"] as string)
            : undefined;
        const minZoom =
          typeof opts["minZoom"] === "number" ? opts["minZoom"] : 0.25;
        const maxZoom =
          typeof opts["maxZoom"] === "number" ? opts["maxZoom"] : 8;
        const markersPath = normalizePath(
          markersPathRaw ?? `${image}.markers.json`,
        );

        const alignRaw =
          typeof opts["align"] === "string" ? opts["align"].toLowerCase() : "";
        const align: "left" | "center" | "right" | undefined =
          alignRaw === "left" || alignRaw === "center" || alignRaw === "right"
            ? alignRaw
            : undefined;

        const wrap =
          typeof opts["wrap"] === "boolean"
            ? (opts["wrap"] as boolean)
            : false;

        const classesValue = opts["classes"];
        const extraClasses: string[] = Array.isArray(classesValue)
          ? (classesValue as unknown[]).map((c) => String(c))
          : typeof classesValue === "string"
          ? (classesValue as string)
              .split(/\s+/)
              .map((c) => c.trim())
              .filter(Boolean)
          : [];

        const resizable =
          typeof opts["resizable"] === "boolean"
            ? opts["resizable"]
            : this.settings.defaultResizable;

        const resizeHandleRaw =
          typeof opts["resizeHandle"] === "string"
            ? opts["resizeHandle"]
            : this.settings.defaultResizeHandle;
        const resizeHandle: "left" | "right" | "both" | "native" =
          resizeHandleRaw === "left" ||
          resizeHandleRaw === "right" ||
          resizeHandleRaw === "both" ||
          resizeHandleRaw === "native"
            ? resizeHandleRaw
            : "right";

        const widthFromYaml = Object.prototype.hasOwnProperty.call(
          opts,
          "width",
        );
        const heightFromYaml = Object.prototype.hasOwnProperty.call(
          opts,
          "height",
        );

        const extSettings = this.settings as ZoomMapSettingsExtended;
        const widthDefault = wrap
          ? extSettings.defaultWidthWrapped ?? "50%"
          : this.settings.defaultWidth;

        let widthCss = toCssSize(opts["width"], widthDefault);
        let heightCss = toCssSize(
          opts["height"],
          this.settings.defaultHeight,
        );

        if (storageMode === "json" && !widthFromYaml && !heightFromYaml) {
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
        };

        const inst = new MapInstance(this.app, this, el, cfg);
        ctx.addChild(inst);
      },
    );

    this.addSettingTab(new ZoomMapSettingTab(this.app, this));
  }

  onunload(): void {
    // nothing to clean up explicitly
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

  async loadSettings() {
    const saved = await this.loadData();
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      saved ?? {},
    ) as ZoomMapSettings;

    const ext = this.settings as ZoomMapSettingsExtended;

    if (!Array.isArray(this.settings.stickerPresets)) {
      this.settings.stickerPresets = [];
    }
    if (!this.settings.storageDefault) {
      this.settings.storageDefault = "json";
    }
    if (!ext.defaultWidthWrapped) {
      ext.defaultWidthWrapped = "50%";
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

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
      .setName("Storage location (default)")
      .setDesc(
        "Store your data in json or inline.",
      )
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
      .setDesc(
        "Initial width if wrap: true and no width is set in the code block.",
      )
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
          this.plugin.settings.panMouseButton =
            v === "middle" ? "middle" : "left";
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

    // Ruler
    new Setting(containerEl).setName("Ruler").setHeading();

    const applyStyleToAll = () => {
      const color = (
        this.plugin.settings.measureLineColor ?? "var(--text-accent)"
      ).trim();
      const widthPx = Math.max(1, this.plugin.settings.measureLineWidth ?? 2);
      document.querySelectorAll<HTMLElement>(".zm-root").forEach((el) => {
        el.style.setProperty("--zm-measure-color", color);
        el.style.setProperty("--zm-measure-width", `${widthPx}px`);
      });
    };

    const colorRow = new Setting(containerEl)
      .setName("Line color")
      .setDesc("CSS color, e.g. #ff0055.");

    colorRow.addText((t) =>
      t
        .setPlaceholder("var(--text-accent)")
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

    // Marker icons
    new Setting(containerEl).setName("Marker icons").setHeading();

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

    const iconsGrid = containerEl.createDiv({
      cls: "zm-icons-grid zm-grid",
    });

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

        const pick = pathWrap.createEl("button", {
          attr: { title: "Choose file…" },
        });
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
          this.plugin.settings.icons = this.plugin.settings.icons.filter(
            (i) => i !== icon,
          );
          void this.plugin.saveSettings();
          renderIcons();
        };
      }
    };

    renderIcons();

    new Setting(containerEl)
      .setName("Add new icon")
      .setDesc("Creates an empty icon entry; pick a file or paste a data URL.")
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

    // Favorites (presets)
    new Setting(containerEl).setName("Favorites (presets)").setHeading();

    const presetsHead = containerEl.createDiv({
      cls: "zm-presets-grid-head zm-grid",
    });
    ["Name", "Icon", "Layer", "Editor", "Link", ""].forEach((h) =>
      presetsHead.createSpan({ text: h }),
    );

    const presetsGrid = containerEl.createDiv({
      cls: "zm-presets-grid zm-grid",
    });

    const renderPresets = () => {
      presetsGrid.empty();
      for (const p of this.plugin.settings.presets) {
        const row = presetsGrid.createDiv({ cls: "zm-row" });

        const name = row.createEl("input", { type: "text" });
        name.classList.add("zm-name");
        name.value = p.name;
        name.oninput = () => {
          p.name = name.value.trim();
          void this.plugin.saveSettings();
        };

        const iconSel = row.createEl("select");
        const addOpt = (key: string, label: string) => {
          const o = document.createElement("option");
          o.value = key;
          o.textContent = label;
          iconSel.appendChild(o);
        };
        addOpt("", "(Default)");
        for (const icon of this.plugin.settings.icons) {
          addOpt(icon.key, icon.key);
        }
        iconSel.value = p.iconKey ?? "";
        iconSel.onchange = () => {
          p.iconKey = iconSel.value || undefined;
          void this.plugin.saveSettings();
        };

        const layer = row.createEl("input", { type: "text" });
        layer.value = p.layerName ?? "";
        layer.oninput = () => {
          p.layerName = layer.value.trim() || undefined;
          void this.plugin.saveSettings();
        };

        const ed = row.createEl("input", { type: "checkbox" });
        ed.checked = !!p.openEditor;
        ed.onchange = () => {
          p.openEditor = ed.checked;
          void this.plugin.saveSettings();
        };

        const link = row.createEl("input", { type: "text" });
        link.classList.add("zm-link");
        link.value = p.linkTemplate ?? "";
        link.oninput = () => {
          p.linkTemplate = link.value.trim() || undefined;
          void this.plugin.saveSettings();
        };

        const del = row.createEl("button", { attr: { title: "Delete" } });
        del.classList.add("zm-icon-btn");
        setIcon(del, "trash");
        del.onclick = () => {
          this.plugin.settings.presets = this.plugin.settings.presets.filter(
            (x) => x !== p,
          );
          void this.plugin.saveSettings();
          renderPresets();
        };
      }
    };

    renderPresets();

    new Setting(containerEl)
      .setName("Add new favorite")
      .addButton((b) =>
        b.setButtonText("Add").onClick(() => {
          const p: MarkerPreset = {
            name: `Favorite ${this.plugin.settings.presets.length + 1}`,
            openEditor: false,
          };
          this.plugin.settings.presets.push(p);
          void this.plugin.saveSettings();
          renderPresets();
        }),
      );

    // Stickers
    new Setting(containerEl).setName("Stickers").setHeading();

    const stickersHead = containerEl.createDiv({
      cls: "zm-stickers-grid-head zm-grid",
    });
    ["Name", "Image", "Size", "Layer", ""].forEach((h) =>
      stickersHead.createSpan({ text: h }),
    );

    const stickersGrid = containerEl.createDiv({
      cls: "zm-stickers-grid zm-grid",
    });

    const renderStickers = () => {
      stickersGrid.empty();
      for (const s of this.plugin.settings.stickerPresets) {
        const row = stickersGrid.createDiv({ cls: "zm-row" });

        const name = row.createEl("input", { type: "text" });
        name.classList.add("zm-name");
        name.value = s.name;
        name.oninput = () => {
          s.name = name.value.trim();
          void this.plugin.saveSettings();
        };

        const pathWrap = row.createDiv({ cls: "zm-path-wrap" });
        const path = pathWrap.createEl("input", { type: "text" });
        path.value = s.imagePath ?? "";
        path.oninput = () => {
          s.imagePath = path.value.trim();
          void this.plugin.saveSettings();
        };

        const pick = pathWrap.createEl("button", {
          attr: { title: "Choose file…" },
        });
        pick.classList.add("zm-icon-btn");
        setIcon(pick, "folder-open");
        pick.onclick = () => {
          new ImageFileSuggestModal(this.app, (file: TFile) => {
            s.imagePath = file.path;
            void this.plugin.saveSettings();
            renderStickers();
          }).open();
        };

        const size = row.createEl("input", { type: "number" });
        size.classList.add("zm-num");
        size.value = String(s.size ?? 64);
        size.oninput = () => {
          const n = Number(size.value);
          if (!Number.isNaN(n) && n > 0) {
            s.size = Math.round(n);
            void this.plugin.saveSettings();
          }
        };

        const layer = row.createEl("input", { type: "text" });
        layer.value = s.layerName ?? "";
        layer.oninput = () => {
          s.layerName = layer.value.trim() || undefined;
          void this.plugin.saveSettings();
        };

        const del = row.createEl("button", { attr: { title: "Delete" } });
        del.classList.add("zm-icon-btn");
        setIcon(del, "trash");
        del.onclick = () => {
          this.plugin.settings.stickerPresets =
            this.plugin.settings.stickerPresets.filter((x) => x !== s);
          void this.plugin.saveSettings();
          renderStickers();
        };
      }
    };

    renderStickers();

    new Setting(containerEl)
      .setName("Add new sticker")
      .addButton((b) =>
        b.setButtonText("Add").onClick(() => {
          const s: StickerPreset = {
            name: `Sticker ${this.plugin.settings.stickerPresets.length + 1}`,
            imagePath: "",
            size: 64,
            openEditor: false,
          };
          this.plugin.settings.stickerPresets.push(s);
          void this.plugin.saveSettings();
          renderStickers();
        }),
      );
  }
}