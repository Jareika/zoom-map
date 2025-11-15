import {
  App,
  MarkdownPostProcessorContext,
  Plugin,
  PluginSettingTab,
  Setting,
  parseYaml,
  normalizePath,
  TFile,
  setIcon
} from "obsidian";
import { MapInstance, ZoomMapConfig, ZoomMapSettings, IconProfile, MarkerPreset } from "./map";
import { ImageFileSuggestModal } from "./iconFileSuggest";

function svgPinDataUrl(color = "#d23c3c"): string {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <path fill="${color}" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7m0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"/>
</svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

const DEFAULT_SETTINGS: ZoomMapSettings = {
  icons: [
    { key: "pinRed",  pathOrDataUrl: svgPinDataUrl("#d23c3c"), size: 24, anchorX: 12, anchorY: 12 },
    { key: "pinBlue", pathOrDataUrl: svgPinDataUrl("#3c62d2"), size: 24, anchorX: 12, anchorY: 12 }
  ],
  defaultIconKey: "pinRed",
  wheelZoomFactor: 1.1,
  panMouseButton: "left",
  hoverMaxWidth: 360,
  hoverMaxHeight: 260,
  presets: [],
  defaultWidth: "100%",
  defaultHeight: "480px",
  defaultResizable: false,
  defaultResizeHandle: "right",
  forcePopoverWithoutModKey: true,
};

function toCssSize(v: unknown, fallback: string): string {
  if (typeof v === "number" && Number.isFinite(v)) return `${v}px`;
  if (typeof v === "string" && v.trim().length > 0) return v.trim();
  return fallback;
}

type YamlBase = { path: string; name?: string };
type YamlOverlay = { path: string; name?: string; visible?: boolean };

function parseBasesYaml(v: any): YamlBase[] {
  if (!v) return [];
  if (Array.isArray(v)) {
    return v.map((it: any) => {
      if (typeof it === "string") return { path: it };
      if (it && typeof it === "object" && typeof it.path === "string") return { path: String(it.path), name: it.name ? String(it.name) : undefined };
      return null;
    }).filter(Boolean) as YamlBase[];
  }
  return [];
}
function parseOverlaysYaml(v: any): YamlOverlay[] {
  if (!v) return [];
  if (Array.isArray(v)) {
    return v.map((it: any) => {
      if (typeof it === "string") return { path: it };
      if (it && typeof it === "object" && typeof it.path === "string") {
        return { path: String(it.path), name: it.name ? String(it.name) : undefined, visible: typeof it.visible === "boolean" ? it.visible : undefined };
      }
      return null;
    }).filter(Boolean) as YamlOverlay[];
  }
  return [];
}

function parseScaleYaml(v: any): number | undefined {
  if (!v || typeof v !== "object") return undefined;
  const mpp = typeof v.metersPerPixel === "number" && v.metersPerPixel > 0 ? v.metersPerPixel : undefined;
  const ppm = typeof v.pixelsPerMeter === "number" && v.pixelsPerMeter > 0 ? (1 / v.pixelsPerMeter) : undefined;
  return mpp ?? ppm;
}

export default class ZoomMapPlugin extends Plugin {
  settings: ZoomMapSettings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();

    this.registerMarkdownCodeBlockProcessor("zoommap", async (src: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
      let opts: Record<string, any> = {};
      try { opts = parseYaml(src) ?? {}; } catch {}

      const yamlBases = parseBasesYaml(opts.imageBases);
      const yamlOverlays = parseOverlaysYaml(opts.imageOverlays);
      const yamlMetersPerPixel = parseScaleYaml(opts.scale);

      // Renderpfad
      const renderRaw = String(opts.render ?? "").toLowerCase();
      const renderMode: "dom" | "canvas" = (renderRaw === "canvas") ? "canvas" : "dom";

      // Effektives Basisbild: 'image' oder erstes aus imageBases
      let image = String(opts.image ?? "").trim();
      if (!image) {
        if (yamlBases.length > 0) image = yamlBases[0].path;
      }
      if (!image) { el.createEl("div", { text: "zoommap: 'image:' is missing (or imageBases is empty)." }); return; }

      const markersPathRaw: string | undefined = opts.markers ? String(opts.markers) : undefined;
      const minZoom = typeof opts.minZoom === "number" ? opts.minZoom : 0.25;
      const maxZoom = typeof opts.maxZoom === "number" ? opts.maxZoom : 8;
      const markersPath = normalizePath(markersPathRaw ?? (image + ".markers.json"));

      const alignRaw = String(opts.align ?? "").toLowerCase();
      const align: "left" | "center" | "right" | undefined = ["left","center","right"].includes(alignRaw) ? alignRaw : undefined;
      const wrap = typeof opts.wrap === "boolean" ? opts.wrap : false;
      const extraClasses: string[] = Array.isArray(opts.classes)
        ? (opts.classes as any[]).map(String)
        : (typeof opts.classes === "string" ? String(opts.classes).split(/\s+/).filter(Boolean) : []);

      const resizable = typeof opts.resizable === "boolean" ? opts.resizable : this.settings.defaultResizable;
      const resizeHandleRaw = typeof opts.resizeHandle === "string" ? String(opts.resizeHandle) : this.settings.defaultResizeHandle;
      const resizeHandle: "left" | "right" | "both" | "native" =
        (["left","right","both","native"].includes(resizeHandleRaw) ? resizeHandleRaw as any : "right");

      const sec = ctx.getSectionInfo(el);

      const cfg: ZoomMapConfig = {
        imagePath: image,
        markersPath,
        minZoom,
        maxZoom,
        sourcePath: ctx.sourcePath,
        width: toCssSize(opts.width, this.settings.defaultWidth),
        height: toCssSize(opts.height, this.settings.defaultHeight),
        resizable,
        resizeHandle,
        align,
        wrap,
        extraClasses,
        renderMode,
        yamlBases,
        yamlOverlays,
        yamlMetersPerPixel,
        sectionStart: sec?.lineStart,
        sectionEnd: sec?.lineEnd
      };

      const inst = new MapInstance(this.app, this, el, cfg);
      ctx.addChild(inst);
    });

    this.addSettingTab(new ZoomMapSettingTab(this.app, this));
  }

  onunload(): void {}

  builtinIcon(): IconProfile {
    return this.settings.icons[0] ?? {
      key: "builtin",
      pathOrDataUrl: svgPinDataUrl("#d23c3c"),
      size: 24, anchorX: 12, anchorY: 12
    };
  }

  async loadSettings() {
    const saved = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, saved ?? {});
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class ZoomMapSettingTab extends PluginSettingTab {
  plugin: ZoomMapPlugin;
  constructor(app: App, plugin: ZoomMapPlugin) { super(app, plugin); this.plugin = plugin; }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass("zoommap-settings");
    containerEl.createEl("h2", { text: "Zoom Map – Settings" });

    // Interaction
    containerEl.createEl("h3", { text: "Interaction" });
    new Setting(containerEl)
      .setName("Mouse wheel zoom factor")
      .setDesc("Multiplier per step. 1.1 = 10% per tick.")
      .addText(t => t.setPlaceholder("1.1")
        .setValue(String(this.plugin.settings.wheelZoomFactor))
        .onChange(async (v) => {
          const n = Number(v);
          if (!Number.isNaN(n) && n > 1.001 && n < 2.5) {
            this.plugin.settings.wheelZoomFactor = n;
            await this.plugin.saveSettings();
          }
        }));
    new Setting(containerEl)
      .setName("Panning mouse button")
      .setDesc("Which mouse button pans the map?")
      .addDropdown(d => {
        d.addOption("left", "Left");
        d.addOption("middle", "Middle");
        d.setValue(this.plugin.settings.panMouseButton ?? "left");
        d.onChange(async v => {
          this.plugin.settings.panMouseButton = (v === "middle" ? "middle" : "left");
          await this.plugin.saveSettings();
        });
      });
    new Setting(containerEl)
      .setName("Hover popover size")
      .setDesc("Max width and height in pixels.")
      .addText(t => t.setPlaceholder("360")
        .setValue(String(this.plugin.settings.hoverMaxWidth))
        .onChange(async v => {
          const n = Number(v); if (!isNaN(n) && n >= 200) { this.plugin.settings.hoverMaxWidth = n; await this.plugin.saveSettings(); }
        }))
      .addText(t => t.setPlaceholder("260")
        .setValue(String(this.plugin.settings.hoverMaxHeight))
        .onChange(async v => {
          const n = Number(v); if (!isNaN(n) && n >= 120) { this.plugin.settings.hoverMaxHeight = n; await this.plugin.saveSettings(); }
        }));

    new Setting(containerEl)
      .setName("Force popovers without Ctrl/Cmd")
      .setDesc("Opens preview popovers on simple hover (recommended for tablets).")
      .addToggle(t => t
        .setValue(!!this.plugin.settings.forcePopoverWithoutModKey)
        .onChange(async v => {
          this.plugin.settings.forcePopoverWithoutModKey = v;
          await this.plugin.saveSettings();
        }));

    // Marker icons
    containerEl.createEl("h3", { text: "Marker icons" });
    const iconsHead = containerEl.createDiv({ cls: "zm-icons-grid-head zm-grid" });
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
        name.oninput = async () => { icon.key = name.value.trim(); await this.plugin.saveSettings(); };

        const pathWrap = row.createDiv({ cls: "zm-path-wrap" });
        const path = pathWrap.createEl("input", { type: "text" });
        path.value = icon.pathOrDataUrl ?? "";
        path.oninput = async () => { icon.pathOrDataUrl = path.value.trim(); await this.plugin.saveSettings(); };
        const pick = pathWrap.createEl("button", { attr: { title: "Choose file…" } });
        pick.classList.add("zm-icon-btn");
        setIcon(pick, "folder-open");
        pick.onclick = () => new ImageFileSuggestModal(this.app, async (file: TFile) => {
          icon.pathOrDataUrl = file.path;
          await this.plugin.saveSettings();
          renderIcons();
        }).open();

        const size = row.createEl("input", { type: "number" });
        size.classList.add("zm-num");
        size.value = String(icon.size);
        size.oninput = async () => { const n = Number(size.value); if (!isNaN(n) && n > 0) { icon.size = n; await this.plugin.saveSettings(); } };

        const ax = row.createEl("input", { type: "number" });
        ax.classList.add("zm-num");
        ax.value = String(icon.anchorX);
        ax.oninput = async () => { const n = Number(ax.value); if (!isNaN(n)) { icon.anchorX = n; await this.plugin.saveSettings(); } };

        const ay = row.createEl("input", { type: "number" });
        ay.classList.add("zm-num");
        ay.value = String(icon.anchorY);
        ay.oninput = async () => { const n = Number(ay.value); if (!isNaN(n)) { icon.anchorY = n; await this.plugin.saveSettings(); } };

        const del = row.createEl("button", { attr: { title: "Delete" } });
        del.classList.add("zm-icon-btn");
        setIcon(del, "trash");
        del.onclick = async () => {
          this.plugin.settings.icons = this.plugin.settings.icons.filter(i => i !== icon);
          await this.plugin.saveSettings();
          renderIcons();
        };
      }
    };
    renderIcons();

    // NEW: add button to create additional icon entries
    new Setting(containerEl)
      .setName("Add new icon")
      .setDesc("Creates an empty icon entry; pick a file or paste a data URL.")
      .addButton(b => b
        .setButtonText("Add")
        .onClick(async () => {
          const idx = this.plugin.settings.icons.length + 1;
          this.plugin.settings.icons.push({
            key: `pin-${idx}`,
            pathOrDataUrl: "",
            size: 24,
            anchorX: 12,
            anchorY: 12
          });
          await this.plugin.saveSettings();
          this.display();
        }));

    // Presets
    containerEl.createEl("h3", { text: "Favorites (presets)" });
    const presetsHead = containerEl.createDiv({ cls: "zm-presets-grid-head zm-grid" });
    ["Name", "Icon", "Layer", "Editor", "Link", ""].forEach(h => presetsHead.createSpan({ text: h }));

    const presetsGrid = containerEl.createDiv({ cls: "zm-presets-grid zm-grid" });

    const renderPresets = () => {
      presetsGrid.empty();
      for (const p of this.plugin.settings.presets) {
        const row = presetsGrid.createDiv({ cls: "zm-row" });

        const name = row.createEl("input", { type: "text" });
        name.classList.add("zm-name");
        name.value = p.name;
        name.oninput = async () => { p.name = name.value.trim(); await this.plugin.saveSettings(); };

        const iconSel = row.createEl("select");
        const addOpt = (key: string, label: string) => {
          const o = document.createElement("option");
          o.value = key; o.textContent = label;
          iconSel.appendChild(o);
        };
        addOpt("", "(Default)");
        for (const icon of this.plugin.settings.icons) addOpt(icon.key, icon.key);
        iconSel.value = p.iconKey ?? "";
        iconSel.onchange = async () => { p.iconKey = iconSel.value || undefined; await this.plugin.saveSettings(); };

        const layer = row.createEl("input", { type: "text" });
        layer.value = p.layerName ?? "";
        layer.oninput = async () => { p.layerName = layer.value.trim() || undefined; await this.plugin.saveSettings(); };

        const ed = row.createEl("input", { type: "checkbox" });
        ed.checked = !!p.openEditor;
        ed.onchange = async () => { p.openEditor = ed.checked; await this.plugin.saveSettings(); };

        const link = row.createEl("input", { type: "text" });
        link.classList.add("zm-link");
        link.value = p.linkTemplate ?? "";
        link.oninput = async () => { p.linkTemplate = link.value.trim() || undefined; await this.plugin.saveSettings(); };

        const del = row.createEl("button", { attr: { title: "Delete" } });
        del.classList.add("zm-icon-btn");
        setIcon(del, "trash");
        del.onclick = async () => {
          this.plugin.settings.presets = this.plugin.settings.presets.filter(x => x !== p);
          await this.plugin.saveSettings();
          renderPresets();
        };
      }
    };
    renderPresets();

    new Setting(containerEl)
      .setName("Add new favorite")
      .addButton(b => b.setButtonText("Add").onClick(async () => {
        const p: MarkerPreset = { name: "Favorite " + (this.plugin.settings.presets.length + 1), openEditor: false };
        this.plugin.settings.presets.push(p);
        await this.plugin.saveSettings();
        renderPresets();
      }));
  }
}