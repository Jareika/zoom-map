"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => ZoomMapPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian7 = require("obsidian");

// src/map.ts
var import_obsidian5 = require("obsidian");

// src/markerStore.ts
var import_obsidian = require("obsidian");
function generateId(prefix = "m") {
  const s = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${s}`;
}
var MarkerStore = class {
  constructor(app, sourcePath, markersFilePath) {
    this.app = app;
    this.sourcePath = sourcePath;
    this.markersFilePath = (0, import_obsidian.normalizePath)(markersFilePath);
  }
  getPath() {
    return this.markersFilePath;
  }
  async ensureExists(initialImagePath, size) {
    const abs = this.getFileByPath(this.markersFilePath);
    if (abs) return;
    const data = {
      image: initialImagePath != null ? initialImagePath : "",
      size,
      layers: [
        { id: "default", name: "Default", visible: true, locked: false }
      ],
      markers: [],
      bases: initialImagePath ? [initialImagePath] : [],
      overlays: [],
      activeBase: initialImagePath != null ? initialImagePath : "",
      measurement: {
        displayUnit: "auto-metric",
        metersPerPixel: void 0,
        scales: {}
      }
    };
    await this.create(JSON.stringify(data, null, 2));
    new import_obsidian.Notice(`Created marker file: ${this.markersFilePath}`, 2500);
  }
  async load() {
    const f = this.getFileByPath(this.markersFilePath);
    if (!f) throw new Error(`Marker file missing: ${this.markersFilePath}`);
    const raw = await this.app.vault.read(f);
    const parsed = JSON.parse(raw);
    if (!parsed.layers || parsed.layers.length === 0) {
      parsed.layers = [
        { id: "default", name: "Default", visible: true, locked: false }
      ];
    }
    parsed.layers = parsed.layers.map((l) => {
      var _a;
      return {
        id: l.id,
        name: (_a = l.name) != null ? _a : "Layer",
        visible: typeof l.visible === "boolean" ? l.visible : true,
        locked: !!l.locked
      };
    });
    if (!parsed.markers) parsed.markers = [];
    if (!parsed.bases) {
      parsed.bases = parsed.image ? [parsed.image] : [];
    }
    if (!parsed.activeBase) {
      const firstBase = parsed.bases[0];
      const firstPath = typeof firstBase === "string" ? firstBase : isBaseImage(firstBase) ? firstBase.path : "";
      parsed.activeBase = parsed.image || firstPath || "";
    }
    if (!parsed.overlays) parsed.overlays = [];
    if (!parsed.measurement) {
      parsed.measurement = {
        displayUnit: "auto-metric",
        metersPerPixel: void 0,
        scales: {}
      };
    }
    if (!parsed.measurement.scales) parsed.measurement.scales = {};
    if (!parsed.measurement.displayUnit) {
      parsed.measurement.displayUnit = "auto-metric";
    }
    return parsed;
  }
  async save(data) {
    const f = this.getFileByPath(this.markersFilePath);
    const content = JSON.stringify(data, null, 2);
    if (!f) {
      await this.create(content);
    } else {
      await this.app.vault.modify(f, content);
    }
  }
  async wouldChange(data) {
    const f = this.getFileByPath(this.markersFilePath);
    const next = JSON.stringify(data, null, 2);
    if (!f) return true;
    const cur = await this.app.vault.read(f);
    return cur !== next;
  }
  async addMarker(data, m) {
    data.markers.push(m);
    await this.save(data);
    return data;
  }
  async updateLayers(data, layers) {
    data.layers = layers.map((l) => ({ ...l, locked: !!l.locked }));
    await this.save(data);
    return data;
  }
  getFileByPath(path) {
    const af = this.app.vault.getAbstractFileByPath(path);
    return af instanceof import_obsidian.TFile ? af : null;
  }
  async create(content) {
    const dir = this.markersFilePath.split("/").slice(0, -1).join("/");
    if (dir && !this.app.vault.getAbstractFileByPath(dir)) {
      await this.app.vault.createFolder(dir);
    }
    await this.app.vault.create(this.markersFilePath, content);
  }
};
function isBaseImage(x) {
  return !!x && typeof x === "object" && typeof x.path === "string";
}

// src/markerEditor.ts
var import_obsidian2 = require("obsidian");
var MarkerEditorModal = class extends import_obsidian2.Modal {
  constructor(app, plugin, data, marker, onResult) {
    var _a;
    super(app);
    this.plugin = plugin;
    this.data = data;
    this.marker = { type: (_a = marker.type) != null ? _a : "pin", ...marker };
    this.onResult = onResult;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", {
      text: this.marker.type === "sticker" ? "Edit sticker" : "Edit marker"
    });
    if (this.marker.type !== "sticker") {
      new import_obsidian2.Setting(contentEl).setName("Link").setDesc("Wiki link Note.").addText(
        (t) => {
          var _a;
          return t.setPlaceholder("Note").setValue((_a = this.marker.link) != null ? _a : "").onChange((v) => {
            this.marker.link = v.trim();
          });
        }
      );
      new import_obsidian2.Setting(contentEl).setName("Tooltip").addTextArea((a) => {
        var _a;
        a.setPlaceholder("Optional tooltip text");
        a.inputEl.rows = 3;
        a.setValue((_a = this.marker.tooltip) != null ? _a : "");
        a.onChange((v) => {
          this.marker.tooltip = v;
        });
      });
    }
    let newLayerName = "";
    new import_obsidian2.Setting(contentEl).setName("Layer").setDesc("Choose an existing layer or type a new name.").addDropdown((d) => {
      var _a, _b;
      for (const l of this.data.layers) {
        d.addOption(l.name, l.name);
      }
      const current = (_b = (_a = this.data.layers.find((l) => l.id === this.marker.layer)) == null ? void 0 : _a.name) != null ? _b : this.data.layers[0].name;
      d.setValue(current).onChange((v) => {
        const lyr = this.data.layers.find((l) => l.name === v);
        if (lyr) this.marker.layer = lyr.id;
      });
    }).addText(
      (t) => t.setPlaceholder("Create new layer (optional)").onChange((v) => {
        newLayerName = v.trim();
      })
    );
    if (this.marker.type === "sticker") {
      new import_obsidian2.Setting(contentEl).setName("Size").addText((t) => {
        var _a;
        t.setPlaceholder("64");
        t.setValue(String((_a = this.marker.stickerSize) != null ? _a : 64));
        t.onChange((v) => {
          const n = Number(v);
          if (Number.isFinite(n) && n > 0) {
            this.marker.stickerSize = Math.round(n);
            updatePreview();
          }
        });
      });
    } else {
      new import_obsidian2.Setting(contentEl).setName("Icon").setDesc("To set up new go to settings.").addDropdown((d) => {
        var _a;
        for (const icon of this.plugin.settings.icons) {
          d.addOption(icon.key, icon.key);
        }
        d.setValue((_a = this.marker.iconKey) != null ? _a : this.plugin.settings.defaultIconKey);
        d.onChange((v) => {
          this.marker.iconKey = v;
          updatePreview();
        });
      });
    }
    const preview = contentEl.createDiv({
      attr: {
        style: "margin-top:8px; display:flex; align-items:center; gap:8px;"
      }
    });
    preview.createSpan({ text: "Preview:" });
    const img = preview.createEl("img");
    const resolvePreview = () => {
      var _a, _b, _c;
      if (this.marker.type === "sticker") {
        let url2 = (_a = this.marker.stickerPath) != null ? _a : "";
        if (url2 && !url2.startsWith("data:")) {
          const file = this.app.vault.getAbstractFileByPath(url2);
          if (file instanceof import_obsidian2.TFile) {
            url2 = this.app.vault.getResourcePath(file);
          }
        }
        const size = Math.max(1, Math.round((_b = this.marker.stickerSize) != null ? _b : 64));
        return { url: url2, size };
      }
      const icon = (_c = this.plugin.settings.icons.find(
        (i) => {
          var _a2;
          return i.key === ((_a2 = this.marker.iconKey) != null ? _a2 : this.plugin.settings.defaultIconKey);
        }
      )) != null ? _c : this.plugin.builtinIcon();
      let url = icon.pathOrDataUrl;
      if (url && !url.startsWith("data:")) {
        const file = this.app.vault.getAbstractFileByPath(url);
        if (file instanceof import_obsidian2.TFile) {
          url = this.app.vault.getResourcePath(file);
        }
      }
      return { url, size: icon.size };
    };
    const updatePreview = () => {
      const { url, size } = resolvePreview();
      img.src = url || "";
      img.style.width = `${size}px`;
      img.style.height = `${size}px`;
    };
    updatePreview();
    const footer = contentEl.createDiv({
      attr: {
        style: "display:flex; gap:8px; justify-content:flex-end; margin-top:12px;"
      }
    });
    const btnSave = footer.createEl("button", { text: "Save" });
    const btnDelete = footer.createEl("button", {
      text: this.marker.type === "sticker" ? "Delete sticker" : "Delete marker"
    });
    const btnCancel = footer.createEl("button", { text: "Cancel" });
    btnSave.addEventListener("click", () => {
      let dataChanged = false;
      if (newLayerName) {
        const exists = this.data.layers.find((l) => l.name === newLayerName);
        if (!exists) {
          const id = `layer_${Math.random().toString(36).slice(2, 8)}`;
          this.data.layers.push({ id, name: newLayerName, visible: true });
          this.marker.layer = id;
          dataChanged = true;
        }
      }
      this.close();
      this.onResult({ action: "save", marker: this.marker, dataChanged });
    });
    btnDelete.addEventListener("click", () => {
      this.close();
      this.onResult({ action: "delete" });
    });
    btnCancel.addEventListener("click", () => {
      this.close();
      this.onResult({ action: "cancel" });
    });
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/scaleCalibrateModal.ts
var import_obsidian3 = require("obsidian");
var ScaleCalibrateModal = class extends import_obsidian3.Modal {
  constructor(app, pxDistance, onOk) {
    super(app);
    this.inputValue = "1";
    this.unit = "km";
    this.pxDistance = pxDistance;
    this.onOk = onOk;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Calibrate scale" });
    contentEl.createEl("div", {
      text: `Measured pixel distance: ${this.pxDistance.toFixed(1)} px`
    });
    new import_obsidian3.Setting(contentEl).setName("Real world length").addText((t) => {
      t.setPlaceholder("example 2");
      t.setValue(this.inputValue);
      t.onChange((v) => {
        this.inputValue = v.trim();
      });
    }).addDropdown((d) => {
      d.addOption("m", "m");
      d.addOption("km", "km");
      d.addOption("mi", "mi");
      d.addOption("ft", "ft");
      d.setValue(this.unit);
      d.onChange((v) => {
        this.unit = v;
      });
    });
    const footer = contentEl.createDiv({
      attr: {
        style: "display:flex; gap:8px; justify-content:flex-end; margin-top:12px;"
      }
    });
    const ok = footer.createEl("button", { text: "Save" });
    const cancel = footer.createEl("button", { text: "Cancel" });
    ok.addEventListener("click", () => {
      const val = Number(this.inputValue.replace(",", "."));
      if (!Number.isFinite(val) || val <= 0) {
        this.close();
        return;
      }
      const meters = this.toMeters(val, this.unit);
      const mpp = meters / this.pxDistance;
      this.close();
      this.onOk({ metersPerPixel: mpp });
    });
    cancel.addEventListener("click", () => this.close());
  }
  toMeters(v, u) {
    switch (u) {
      case "km":
        return v * 1e3;
      case "mi":
        return v * 1609.344;
      case "ft":
        return v * 0.3048;
      default:
        return v;
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/inlineStore.ts
var import_obsidian4 = require("obsidian");
var NoteMarkerStore = class {
  constructor(app, notePath, mapId, insertAfterLine) {
    this.app = app;
    this.notePath = notePath;
    this.mapId = mapId;
    this.insertAfterLine = insertAfterLine;
  }
  getPath() {
    return this.notePath;
  }
  // Label lines inside the comment block (no %% here)
  headerLine() {
    return `ZOOMMAP-DATA id=${this.mapId}`;
  }
  footerLine() {
    return `/ZOOMMAP-DATA`;
  }
  async readNote() {
    const af = this.app.vault.getAbstractFileByPath(this.notePath);
    if (!(af instanceof import_obsidian4.TFile)) throw new Error(`Note not found: ${this.notePath}`);
    const text = await this.app.vault.read(af);
    return { file: af, text };
  }
  // Find the region that starts at the header line and ends after the footer line.
  // Returns indices covering only the labeled region (not the outer %% lines).
  findBlock(text) {
    const header = this.headerLine();
    const footer = this.footerLine();
    const hIdx = text.indexOf(header);
    if (hIdx < 0) return null;
    const headerLineStart = text.lastIndexOf("\n", hIdx) + 1;
    const headerLineEnd = text.indexOf("\n", hIdx);
    const headerEnd = headerLineEnd === -1 ? text.length : headerLineEnd;
    const jsonStart = headerEnd + 1;
    const fIdx = text.indexOf(footer, jsonStart);
    if (fIdx < 0) return null;
    const footerLineStart = text.lastIndexOf("\n", fIdx) + 1;
    const footerLineEnd = text.indexOf("\n", fIdx);
    const endExclusive = footerLineEnd === -1 ? text.length : footerLineEnd + 1;
    const jsonEnd = footerLineStart - 1;
    return {
      start: headerLineStart,
      end: endExclusive,
      jsonStart,
      jsonEnd: Math.max(jsonStart, jsonEnd)
    };
  }
  async ensureExists(initialImagePath, size) {
    const { file, text } = await this.readNote();
    if (this.findBlock(text)) return;
    const data = {
      image: initialImagePath != null ? initialImagePath : "",
      size,
      layers: [{ id: "default", name: "Default", visible: true, locked: false }],
      markers: [],
      bases: initialImagePath ? [initialImagePath] : [],
      overlays: [],
      activeBase: initialImagePath != null ? initialImagePath : "",
      measurement: { displayUnit: "auto-metric", metersPerPixel: void 0, scales: {} },
      frame: void 0
    };
    const payload = JSON.stringify(data, null, 2);
    const block = `
%%
${this.headerLine()}
${payload}
${this.footerLine()}
%%
`;
    let insertAt = text.length;
    if (typeof this.insertAfterLine === "number") {
      const lines = text.split("\n");
      const before = lines.slice(0, this.insertAfterLine + 1).join("\n");
      insertAt = before.length;
    }
    const out = text.slice(0, insertAt) + block + text.slice(insertAt);
    await this.app.vault.modify(file, out);
  }
  async load() {
    const { text } = await this.readNote();
    const blk = this.findBlock(text);
    if (!blk) throw new Error("Inline marker block not found.");
    const raw = text.slice(blk.jsonStart, blk.jsonEnd + 1).trim();
    return JSON.parse(raw);
  }
  async save(data) {
    const { file, text } = await this.readNote();
    const blk = this.findBlock(text);
    const payload = JSON.stringify(data, null, 2);
    const replacement = `${this.headerLine()}
${payload}
${this.footerLine()}
`;
    let out;
    if (blk) {
      out = text.slice(0, blk.start) + replacement + text.slice(blk.end);
    } else {
      out = text + `
%%
${this.headerLine()}
${payload}
${this.footerLine()}
%%
`;
    }
    await this.app.vault.modify(file, out);
  }
  async wouldChange(data) {
    try {
      const cur = await this.load();
      const a = JSON.stringify(cur, null, 2);
      const b = JSON.stringify(data, null, 2);
      return a !== b;
    } catch (e) {
      return true;
    }
  }
};

// src/map.ts
function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}
function basename(p) {
  const idx = p.lastIndexOf("/");
  return idx >= 0 ? p.slice(idx + 1) : p;
}
function setCssProps(el, props) {
  for (const [key, value] of Object.entries(props)) {
    if (value === null) {
      el.style.removeProperty(key);
    } else {
      el.style.setProperty(key, value);
    }
  }
}
function isImageBitmapLike(x) {
  return !!x && typeof x.close === "function";
}
var MapInstance = class extends import_obsidian5.Component {
  constructor(app, plugin, el, cfg) {
    var _a;
    super();
    this.initialLayoutDone = false;
    this.overlayMap = /* @__PURE__ */ new Map();
    this.baseCanvas = null;
    this.ctx = null;
    this.baseBitmap = null;
    this.overlaySources = /* @__PURE__ */ new Map();
    this.overlayLoading = /* @__PURE__ */ new Map();
    this.imgW = 0;
    this.imgH = 0;
    this.vw = 0;
    this.vh = 0;
    this.scale = 1;
    this.tx = 0;
    this.ty = 0;
    this.draggingView = false;
    this.lastPos = { x: 0, y: 0 };
    this.draggingMarkerId = null;
    this.dragAnchorOffset = null;
    this.dragMoved = false;
    this.suppressClickMarkerId = null;
    this.tooltipEl = null;
    this.tooltipHideTimer = null;
    this.ignoreNextModify = false;
    this.ro = null;
    this.ready = false;
    this.openMenu = null;
    // Measurement state
    this.measuring = false;
    this.measurePts = [];
    this.measurePreview = null;
    // Calibration state
    this.calibrating = false;
    this.calibPts = [];
    this.calibPreview = null;
    this.panRAF = null;
    this.panAccDx = 0;
    this.panAccDy = 0;
    this.activePointers = /* @__PURE__ */ new Map();
    this.pinchActive = false;
    this.pinchStartScale = 1;
    this.pinchStartDist = 0;
    this.pinchPrevCenter = null;
    this.currentBasePath = null;
    this.frameSaveTimer = null;
    this.userResizing = false;
    // Apply YAML bases/overlays only once
    this.yamlAppliedOnce = false;
    this.saveDataSoon = /* @__PURE__ */ (() => {
      let t = null;
      return async () => {
        if (t) window.clearTimeout(t);
        await new Promise((resolve) => {
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
    this.app = app;
    this.plugin = plugin;
    this.el = el;
    this.cfg = cfg;
    if (this.cfg.storageMode === "note") {
      const id = this.cfg.mapId || `map-${(_a = this.cfg.sectionStart) != null ? _a : 0}`;
      this.store = new NoteMarkerStore(
        app,
        cfg.sourcePath,
        id,
        this.cfg.sectionEnd
      );
    } else {
      this.store = new MarkerStore(app, cfg.sourcePath, cfg.markersPath);
    }
  }
  isFrameVisibleEnough(minPx = 48) {
    if (!this.el || !this.el.isConnected) return false;
    if (this.el.offsetParent === null) return false;
    const rect = this.el.getBoundingClientRect();
    return rect.width >= minPx && rect.height >= minPx;
  }
  isCanvas() {
    return this.cfg.renderMode === "canvas";
  }
  onload() {
    void this.bootstrap().catch((err) => {
      console.error(err);
      new import_obsidian5.Notice(`Zoom Map error: ${err instanceof Error ? err.message : err}`, 6e3);
    });
  }
  onunload() {
    var _a;
    if ((_a = this.tooltipEl) == null ? void 0 : _a.isConnected) {
      this.tooltipEl.remove();
    }
    if (this.ro) {
      this.ro.disconnect();
    }
    this.closeMenu();
    this.disposeBitmaps();
  }
  async bootstrap() {
    var _a, _b, _c;
    this.el.classList.add("zm-root");
    if (this.isCanvas()) {
      this.el.classList.add("zm-root--canvas-mode");
    }
    if (this.cfg.width) {
      this.el.style.width = this.cfg.width;
    }
    if (this.cfg.height) {
      this.el.style.height = this.cfg.height;
    }
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
    if (this.cfg.align === "left" && this.cfg.wrap) {
      this.el.classList.add("zm-float-left");
    }
    if (this.cfg.align === "right" && this.cfg.wrap) {
      this.el.classList.add("zm-float-right");
    }
    ((_a = this.cfg.extraClasses) != null ? _a : []).forEach((c) => this.el.classList.add(c));
    this.viewportEl = this.el.createDiv({ cls: "zm-viewport" });
    if (this.isCanvas()) {
      this.baseCanvas = this.viewportEl.createEl("canvas", { cls: "zm-canvas" });
      this.ctx = this.baseCanvas.getContext("2d");
    }
    this.worldEl = this.viewportEl.createDiv({ cls: "zm-world" });
    this.imgEl = this.worldEl.createEl("img", { cls: "zm-image" });
    this.overlaysEl = this.worldEl.createDiv({ cls: "zm-overlays" });
    this.markersEl = this.worldEl.createDiv({ cls: "zm-markers" });
    this.measureHud = this.viewportEl.createDiv({ cls: "zm-measure-hud" });
    this.registerDomEvent(this.viewportEl, "wheel", (e) => {
      var _a2;
      if ((_a2 = e.target) == null ? void 0 : _a2.closest(".popover")) return;
      e.preventDefault();
      e.stopPropagation();
      this.onWheel(e);
    });
    this.registerDomEvent(this.viewportEl, "pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.closeMenu();
      this.onPointerDownViewport(e);
    });
    this.registerDomEvent(
      window,
      "pointermove",
      (e) => this.onPointerMove(e)
    );
    this.registerDomEvent(window, "pointerup", (e) => {
      if (this.activePointers.has(e.pointerId)) {
        this.activePointers.delete(e.pointerId);
      }
      if (this.pinchActive && this.activePointers.size < 2) {
        this.endPinch();
      }
      e.preventDefault();
      this.onPointerUp();
    });
    this.registerDomEvent(window, "pointercancel", (e) => {
      if (this.activePointers.has(e.pointerId)) {
        this.activePointers.delete(e.pointerId);
      }
      if (this.pinchActive && this.activePointers.size < 2) {
        this.endPinch();
      }
    });
    this.registerDomEvent(this.viewportEl, "dblclick", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.closeMenu();
      this.onDblClickViewport(e);
    });
    this.registerDomEvent(this.viewportEl, "click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onClickViewport(e);
    });
    this.registerDomEvent(this.viewportEl, "contextmenu", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onContextMenuViewport(e);
    });
    this.registerDomEvent(window, "keydown", (e) => {
      if (e.key === "Escape") {
        if (this.calibrating) {
          this.calibrating = false;
          this.calibPts = [];
          this.calibPreview = null;
          this.renderCalibrate();
          new import_obsidian5.Notice("Calibration cancelled.", 900);
        } else if (this.measuring) {
          this.measuring = false;
          this.measurePreview = null;
          this.updateMeasureHud();
        }
        this.closeMenu();
      }
    });
    this.registerEvent(
      this.app.vault.on("modify", (f) => {
        if (!(f instanceof import_obsidian5.TFile)) return;
        if (f.path === this.store.getPath()) {
          if (this.ignoreNextModify) {
            this.ignoreNextModify = false;
            return;
          }
          void this.reloadMarkers();
        }
      })
    );
    await this.loadInitialBase(this.cfg.imagePath);
    await this.store.ensureExists(this.cfg.imagePath, {
      w: this.imgW,
      h: this.imgH
    });
    this.data = await this.store.load();
    await this.applyYamlOnFirstLoad();
    if (this.cfg.yamlMetersPerPixel && this.getMetersPerPixel() === void 0) {
      this.ensureMeasurement();
      const base = this.getActiveBasePath();
      if (this.data && this.data.measurement) {
        this.data.measurement.metersPerPixel = this.cfg.yamlMetersPerPixel;
        this.data.measurement.scales[base] = this.cfg.yamlMetersPerPixel;
        if (await this.store.wouldChange(this.data)) {
          this.ignoreNextModify = true;
          await this.store.save(this.data);
        }
      }
    }
    if (this.data) {
      if (!((_b = this.data.size) == null ? void 0 : _b.w) || !((_c = this.data.size) == null ? void 0 : _c.h)) {
        this.data.size = { w: this.imgW, h: this.imgH };
        if (await this.store.wouldChange(this.data)) {
          this.ignoreNextModify = true;
          await this.store.save(this.data);
        }
      }
      if (this.shouldUseSavedFrame() && this.data.frame && this.data.frame.w > 0 && this.data.frame.h > 0) {
        this.el.style.width = `${this.data.frame.w}px`;
        this.el.style.height = `${this.data.frame.h}px`;
      }
    }
    this.ro = new ResizeObserver(() => this.onResize());
    this.ro.observe(this.el);
    this.register(() => {
      var _a2;
      return (_a2 = this.ro) == null ? void 0 : _a2.disconnect();
    });
    this.fitToView();
    await this.applyActiveBaseAndOverlays();
    this.setupMeasureOverlay();
    this.applyMeasureStyle();
    this.renderAll();
    this.ready = true;
  }
  disposeBitmaps() {
    try {
      if (this.baseBitmap && isImageBitmapLike(this.baseBitmap)) {
        this.baseBitmap.close();
      }
    } catch (error) {
      console.error("Zoom Map: failed to dispose base bitmap", error);
    }
    this.baseBitmap = null;
    for (const src of this.overlaySources.values()) {
      try {
        if (isImageBitmapLike(src)) {
          src.close();
        }
      } catch (error) {
        console.error("Zoom Map: failed to dispose overlay bitmap", error);
      }
    }
    this.overlaySources.clear();
    this.overlayLoading.clear();
  }
  async loadBitmapFromPath(path) {
    const f = this.resolveTFile(path, this.cfg.sourcePath);
    if (!f) return null;
    const url = this.app.vault.getResourcePath(f);
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    try {
      await img.decode();
    } catch (error) {
      console.warn("Zoom Map: failed to decode base image", error);
      return null;
    }
    try {
      return await createImageBitmap(img);
    } catch (error) {
      console.warn("Zoom Map: createImageBitmap failed", error);
      return null;
    }
  }
  async loadBaseBitmapByPath(path) {
    const bmp = await this.loadBitmapFromPath(path);
    if (!bmp) throw new Error(`Failed to load image: ${path}`);
    try {
      if (this.baseBitmap && isImageBitmapLike(this.baseBitmap)) {
        this.baseBitmap.close();
      }
    } catch (error) {
      console.error("Zoom Map: failed to dispose previous base bitmap", error);
    }
    this.baseBitmap = bmp;
    this.imgW = bmp.width;
    this.imgH = bmp.height;
    this.currentBasePath = path;
  }
  async loadBaseImageByPath(path) {
    const imgFile = this.resolveTFile(path, this.cfg.sourcePath);
    if (!imgFile) throw new Error(`Image not found: ${path}`);
    const url = this.app.vault.getResourcePath(imgFile);
    await new Promise((resolve, reject) => {
      this.imgEl.onload = () => {
        this.imgW = this.imgEl.naturalWidth;
        this.imgH = this.imgEl.naturalHeight;
        resolve();
      };
      this.imgEl.onerror = () => reject(new Error("Failed to load image."));
      this.imgEl.src = url;
    });
    this.currentBasePath = path;
  }
  async loadCanvasSourceFromPath(path) {
    const f = this.resolveTFile(path, this.cfg.sourcePath);
    if (!f) return null;
    const url = this.app.vault.getResourcePath(f);
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    try {
      await img.decode();
    } catch (error) {
      console.warn("Zoom Map: overlay decode warning", error);
    }
    try {
      return await createImageBitmap(img);
    } catch (e) {
      return img;
    }
  }
  closeCanvasSource(src) {
    try {
      if (isImageBitmapLike(src)) src.close();
    } catch (error) {
      console.error("Zoom Map: failed to dispose canvas source", error);
    }
  }
  async ensureOverlayLoaded(path) {
    if (this.overlaySources.has(path)) return this.overlaySources.get(path);
    if (this.overlayLoading.has(path)) {
      return await this.overlayLoading.get(path);
    }
    const p = this.loadCanvasSourceFromPath(path).then((res) => {
      this.overlayLoading.delete(path);
      if (res) {
        this.overlaySources.set(path, res);
      }
      return res;
    }).catch((err) => {
      this.overlayLoading.delete(path);
      console.warn("Zoom Map: overlay load failed", path, err);
      return null;
    });
    this.overlayLoading.set(path, p);
    return await p;
  }
  async ensureVisibleOverlaysLoaded() {
    var _a;
    if (!this.data) return;
    const wantVisible = new Set(
      ((_a = this.data.overlays) != null ? _a : []).filter((o) => o.visible).map((o) => o.path)
    );
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
  renderCanvas() {
    var _a, _b;
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
    if ((_b = (_a = this.data) == null ? void 0 : _a.overlays) == null ? void 0 : _b.length) {
      for (const o of this.data.overlays) {
        if (!o.visible) continue;
        const src = this.overlaySources.get(o.path);
        if (src) ctx.drawImage(src, 0, 0);
      }
    }
  }
  setupMeasureOverlay() {
    this.measureEl = this.worldEl.createDiv({ cls: "zm-measure" });
    this.measureSvg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    this.measureSvg.classList.add("zm-measure__svg");
    this.measureSvg.setAttribute("width", String(this.imgW));
    this.measureSvg.setAttribute("height", String(this.imgH));
    this.measureEl.appendChild(this.measureSvg);
    this.measurePath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    this.measurePath.classList.add("zm-measure__path");
    this.measureSvg.appendChild(this.measurePath);
    this.measureDots = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    this.measureSvg.appendChild(this.measureDots);
    this.calibPath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    this.calibPath.classList.add("zm-measure__path", "zm-measure__dash");
    this.measureSvg.appendChild(this.calibPath);
    this.calibDots = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    this.measureSvg.appendChild(this.calibDots);
    this.updateMeasureHud();
  }
  renderMeasure() {
    if (!this.measureSvg) return;
    this.measureSvg.setAttribute("width", String(this.imgW));
    this.measureSvg.setAttribute("height", String(this.imgH));
    const pts = [...this.measurePts];
    if (this.measuring && this.measurePreview) {
      pts.push(this.measurePreview);
    }
    const toAbs = (p) => ({
      x: p.x * this.imgW,
      y: p.y * this.imgH
    });
    let d = "";
    pts.forEach((p, i) => {
      const a = toAbs(p);
      d += i === 0 ? `M ${a.x} ${a.y}` : ` L ${a.x} ${a.y}`;
    });
    this.measurePath.setAttribute("d", d);
    while (this.measureDots.firstChild) {
      this.measureDots.removeChild(this.measureDots.firstChild);
    }
    for (const p of this.measurePts) {
      const a = toAbs(p);
      const c = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      c.setAttribute("cx", String(a.x));
      c.setAttribute("cy", String(a.y));
      c.setAttribute("r", "4");
      c.classList.add("zm-measure__dot");
      this.measureDots.appendChild(c);
    }
    this.updateMeasureHud();
  }
  renderCalibrate() {
    if (!this.measureSvg) return;
    const toAbs = (p) => ({
      x: p.x * this.imgW,
      y: p.y * this.imgH
    });
    const pts = [...this.calibPts];
    if (this.calibrating && this.calibPts.length === 1 && this.calibPreview) {
      pts.push(this.calibPreview);
    }
    let d = "";
    pts.forEach((p, i) => {
      const a = toAbs(p);
      d += i === 0 ? `M ${a.x} ${a.y}` : ` L ${a.x} ${a.y}`;
    });
    this.calibPath.setAttribute("d", d);
    while (this.calibDots.firstChild) {
      this.calibDots.removeChild(this.calibDots.firstChild);
    }
    for (const p of this.calibPts) {
      const a = toAbs(p);
      const c = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      c.setAttribute("cx", String(a.x));
      c.setAttribute("cy", String(a.y));
      c.setAttribute("r", "4");
      c.classList.add("zm-measure__dot");
      this.calibDots.appendChild(c);
    }
  }
  clearMeasure() {
    this.measurePts = [];
    this.measurePreview = null;
    this.renderMeasure();
  }
  getMetersPerPixel() {
    var _a;
    const base = this.getActiveBasePath();
    const m = (_a = this.data) == null ? void 0 : _a.measurement;
    if (!m) return void 0;
    if (m.scales && base in m.scales) return m.scales[base];
    return m.metersPerPixel;
  }
  ensureMeasurement() {
    if (!this.data) return;
    if (!this.data.measurement) {
      this.data.measurement = {
        displayUnit: "auto-metric",
        metersPerPixel: void 0,
        scales: {}
      };
    }
    if (!this.data.measurement.scales) {
      this.data.measurement.scales = {};
    }
    if (!this.data.measurement.displayUnit) {
      this.data.measurement.displayUnit = "auto-metric";
    }
  }
  updateMeasureHud() {
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
  computeDistanceMeters() {
    if (!this.data) return null;
    if (this.measurePts.length < 2 && !(this.measuring && this.measurePts.length >= 1 && this.measurePreview)) {
      return null;
    }
    const pts = [...this.measurePts];
    if (this.measuring && this.measurePreview) {
      pts.push(this.measurePreview);
    }
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
  formatDistance(m) {
    var _a, _b, _c;
    const unit = (_c = (_b = (_a = this.data) == null ? void 0 : _a.measurement) == null ? void 0 : _b.displayUnit) != null ? _c : "auto-metric";
    const round = (v, d = 2) => Math.round(v * 10 ** d) / 10 ** d;
    switch (unit) {
      case "m":
        return `${Math.round(m)} m`;
      case "km":
        return `${round(m / 1e3, 3)} km`;
      case "mi":
        return `${round(m / 1609.344, 3)} mi`;
      case "ft":
        return `${Math.round(m / 0.3048)} ft`;
      case "auto-imperial": {
        const mi = m / 1609.344;
        return mi >= 0.25 ? `${round(mi, 2)} mi` : `${Math.round(m / 0.3048)} ft`;
      }
      case "auto-metric":
      default:
        return m >= 1e3 ? `${round(m / 1e3, 2)} km` : `${Math.round(m)} m`;
    }
  }
  async loadInitialBase(path) {
    if (this.isCanvas()) {
      await this.loadBaseBitmapByPath(path);
    } else {
      await this.loadBaseImageByPath(path);
    }
  }
  resolveTFile(pathOrWiki, from) {
    const byPath = this.app.vault.getAbstractFileByPath(pathOrWiki);
    if (byPath instanceof import_obsidian5.TFile) return byPath;
    const dest = this.app.metadataCache.getFirstLinkpathDest(pathOrWiki, from);
    return dest instanceof import_obsidian5.TFile ? dest : null;
  }
  resolveResourceUrl(pathOrData) {
    if (!pathOrData) return "";
    if (pathOrData.startsWith("data:")) return pathOrData;
    const f = this.resolveTFile(pathOrData, this.cfg.sourcePath);
    if (f) return this.app.vault.getResourcePath(f);
    return pathOrData;
  }
  onResize() {
    if (!this.ready || !this.data) {
      if (this.isCanvas()) this.renderCanvas();
      return;
    }
    const r = this.viewportEl.getBoundingClientRect();
    this.vw = r.width;
    this.vh = r.height;
    this.applyTransform(this.scale, this.tx, this.ty, true);
    if (this.shouldUseSavedFrame() && this.cfg.resizable && this.cfg.resizeHandle === "native" && !this.userResizing) {
      if (!this.initialLayoutDone) {
        this.initialLayoutDone = true;
      } else if (this.isFrameVisibleEnough()) {
        this.requestPersistFrame();
      }
    }
  }
  onWheel(e) {
    if (!this.ready) return;
    const factor = this.plugin.settings.wheelZoomFactor || 1.1;
    const step = Math.pow(factor, e.deltaY < 0 ? 1 : -1);
    const vpRect = this.viewportEl.getBoundingClientRect();
    const cx = clamp(e.clientX - vpRect.left, 0, this.vw);
    const cy = clamp(e.clientY - vpRect.top, 0, this.vh);
    this.zoomAt(cx, cy, step);
  }
  panButtonMatches(e) {
    var _a;
    const want = (_a = this.plugin.settings.panMouseButton) != null ? _a : "left";
    return e.button === (want === "middle" ? 1 : 0);
  }
  onPointerDownViewport(e) {
    var _a, _b, _c;
    if (!this.ready) return;
    this.activePointers.set(e.pointerId, {
      x: e.clientX,
      y: e.clientY
    });
    (_b = (_a = e.target) == null ? void 0 : _a.setPointerCapture) == null ? void 0 : _b.call(_a, e.pointerId);
    if ((_c = e.target) == null ? void 0 : _c.closest(".zm-marker")) return;
    if (this.activePointers.size === 2) {
      this.startPinch();
      return;
    }
    if (this.pinchActive) return;
    if (!this.panButtonMatches(e)) return;
    this.draggingView = true;
    this.lastPos = { x: e.clientX, y: e.clientY };
  }
  onPointerMove(e) {
    var _a;
    if (!this.ready) return;
    if (this.activePointers.has(e.pointerId)) {
      this.activePointers.set(e.pointerId, {
        x: e.clientX,
        y: e.clientY
      });
    }
    if (this.pinchActive) {
      this.updatePinch();
      return;
    }
    if (this.draggingMarkerId && this.data) {
      const m = this.data.markers.find(
        (mm) => mm.id === this.draggingMarkerId
      );
      if (!m) return;
      const vpRect = this.viewportEl.getBoundingClientRect();
      const vx = e.clientX - vpRect.left;
      const vy = e.clientY - vpRect.top;
      const wx = (vx - this.tx) / this.scale;
      const wy = (vy - this.ty) / this.scale;
      const off = (_a = this.dragAnchorOffset) != null ? _a : { dx: 0, dy: 0 };
      const nx = clamp((wx - off.dx) / this.imgW, 0, 1);
      const ny = clamp((wy - off.dy) / this.imgH, 0, 1);
      const movedEnough = Math.hypot(
        (nx - m.x) * this.imgW,
        (ny - m.y) * this.imgH
      ) > 1;
      if (movedEnough) this.dragMoved = true;
      m.x = nx;
      m.y = ny;
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
        y: clamp(wy / this.imgH, 0, 1)
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
        y: clamp(wy / this.imgH, 0, 1)
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
  onPointerUp() {
    if (this.draggingMarkerId) {
      if (this.dragMoved) {
        this.suppressClickMarkerId = this.draggingMarkerId;
        window.setTimeout(() => {
          this.suppressClickMarkerId = null;
        }, 0);
        void this.saveDataSoon();
      }
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
  startPinch() {
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
  updatePinch() {
    const pts = this.getTwoPointers();
    if (!pts || !this.pinchActive) return;
    const center = this.mid(pts[0], pts[1]);
    const curDist = this.dist(pts[0], pts[1]);
    if (this.pinchStartDist <= 0) return;
    const targetScale = clamp(
      this.pinchStartScale * (curDist / this.pinchStartDist),
      this.cfg.minZoom,
      this.cfg.maxZoom
    );
    const vpRect = this.viewportEl.getBoundingClientRect();
    const cx = clamp(center.x - vpRect.left, 0, this.vw);
    const cy = clamp(center.y - vpRect.top, 0, this.vh);
    const factor = targetScale / this.scale;
    if (Math.abs(factor - 1) > 1e-3) {
      this.zoomAt(cx, cy, factor);
    }
    if (this.pinchPrevCenter) {
      const dx = center.x - this.pinchPrevCenter.x;
      const dy = center.y - this.pinchPrevCenter.y;
      if (Math.abs(dx) + Math.abs(dy) > 0.5) {
        this.panBy(dx, dy);
      }
    }
    this.pinchPrevCenter = center;
  }
  endPinch() {
    this.pinchActive = false;
    this.pinchPrevCenter = null;
    this.pinchStartDist = 0;
  }
  getTwoPointers() {
    if (this.activePointers.size !== 2) return null;
    const it = Array.from(this.activePointers.values());
    return [it[0], it[1]];
  }
  dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }
  mid(a, b) {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }
  onDblClickViewport(e) {
    var _a;
    if (!this.ready) return;
    if (this.measuring) {
      this.measuring = false;
      this.measurePreview = null;
      this.updateMeasureHud();
      return;
    }
    if ((_a = e.target) == null ? void 0 : _a.closest(".zm-marker")) return;
    const vpRect = this.viewportEl.getBoundingClientRect();
    const cx = e.clientX - vpRect.left;
    const cy = e.clientY - vpRect.top;
    this.zoomAt(cx, cy, 1.5);
  }
  onClickViewport(e) {
    if (!this.ready) return;
    if (this.calibrating) {
      const vpRect = this.viewportEl.getBoundingClientRect();
      const vx = e.clientX - vpRect.left;
      const vy = e.clientY - vpRect.top;
      const wx = (vx - this.tx) / this.scale;
      const wy = (vy - this.ty) / this.scale;
      const p = {
        x: clamp(wx / this.imgW, 0, 1),
        y: clamp(wy / this.imgH, 0, 1)
      };
      this.calibPts.push(p);
      if (this.calibPts.length === 2) {
        const pxDist = Math.hypot(
          (this.calibPts[1].x - this.calibPts[0].x) * this.imgW,
          (this.calibPts[1].y - this.calibPts[0].y) * this.imgH
        );
        new ScaleCalibrateModal(
          this.app,
          pxDist,
          (result) => {
            void this.applyScaleCalibration(result.metersPerPixel);
            new import_obsidian5.Notice(
              `Scale set: ${result.metersPerPixel.toFixed(6)} m/px`,
              2e3
            );
            this.calibrating = false;
            this.calibPts = [];
            this.calibPreview = null;
            this.renderCalibrate();
            this.updateMeasureHud();
          }
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
        y: clamp(wy / this.imgH, 0, 1)
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
  getLayerById(id) {
    var _a;
    return (_a = this.data) == null ? void 0 : _a.layers.find((l) => l.id === id);
  }
  getLayerState(layer) {
    if (!layer.visible) return "hidden";
    return layer.locked ? "locked" : "visible";
  }
  advanceLayerState(layer) {
    const cur = this.getLayerState(layer);
    let next;
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
  isLayerLocked(layerId) {
    const l = this.getLayerById(layerId);
    return !!(l && l.visible && l.locked);
  }
  onContextMenuViewport(e) {
    var _a, _b, _c, _d, _e;
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
    const baseItems = bases.map((b) => {
      var _a2;
      return {
        label: (_a2 = b.name) != null ? _a2 : basename(b.path),
        checked: this.getActiveBasePath() === b.path,
        action: (rowEl) => {
          void this.setActiveBase(b.path).then(() => {
            const submenu = rowEl.parentElement;
            if (submenu) {
              const rows = submenu.querySelectorAll(".zm-menu__item");
              rows.forEach((r) => {
                const c = r.querySelector(".zm-menu__check");
                if (c) c.textContent = "";
              });
              const chk = rowEl.querySelector(".zm-menu__check");
              if (chk) chk.textContent = "\u2713";
            }
          }).catch((err) => {
            console.error("Set base failed:", err);
            new import_obsidian5.Notice("Failed to set base image.", 2500);
          });
        }
      };
    });
    const overlayItems = ((_a = this.data.overlays) != null ? _a : []).map((o) => {
      var _a2;
      return {
        label: (_a2 = o.name) != null ? _a2 : basename(o.path),
        checked: !!o.visible,
        action: (rowEl) => {
          o.visible = !o.visible;
          void this.saveDataSoon();
          void this.updateOverlayVisibility();
          const chk = rowEl.querySelector(".zm-menu__check");
          if (chk) chk.textContent = o.visible ? "\u2713" : "";
        }
      };
    });
    const unit = (_c = (_b = this.data.measurement) == null ? void 0 : _b.displayUnit) != null ? _c : "auto-metric";
    const unitItems = [
      {
        label: "Auto (m/km)",
        checked: unit === "auto-metric",
        action: () => {
          this.ensureMeasurement();
          if (this.data && this.data.measurement) {
            this.data.measurement.displayUnit = "auto-metric";
            void this.saveDataSoon();
            this.updateMeasureHud();
          }
        }
      },
      {
        label: "Auto (mi/ft)",
        checked: unit === "auto-imperial",
        action: () => {
          this.ensureMeasurement();
          if (this.data && this.data.measurement) {
            this.data.measurement.displayUnit = "auto-imperial";
            void this.saveDataSoon();
            this.updateMeasureHud();
          }
        }
      },
      {
        label: "m",
        checked: unit === "m",
        action: () => {
          this.ensureMeasurement();
          if (this.data && this.data.measurement) {
            this.data.measurement.displayUnit = "m";
            void this.saveDataSoon();
            this.updateMeasureHud();
          }
        }
      },
      {
        label: "km",
        checked: unit === "km",
        action: () => {
          this.ensureMeasurement();
          if (this.data && this.data.measurement) {
            this.data.measurement.displayUnit = "km";
            void this.saveDataSoon();
            this.updateMeasureHud();
          }
        }
      },
      {
        label: "mi",
        checked: unit === "mi",
        action: () => {
          this.ensureMeasurement();
          if (this.data && this.data.measurement) {
            this.data.measurement.displayUnit = "mi";
            void this.saveDataSoon();
            this.updateMeasureHud();
          }
        }
      },
      {
        label: "ft",
        checked: unit === "ft",
        action: () => {
          this.ensureMeasurement();
          if (this.data && this.data.measurement) {
            this.data.measurement.displayUnit = "ft";
            void this.saveDataSoon();
            this.updateMeasureHud();
          }
        }
      }
    ];
    const items = [
      {
        label: "Add marker here",
        action: () => this.addMarkerInteractive(nx, ny)
      }
    ];
    const favPins = ((_d = this.plugin.settings.presets) != null ? _d : []).map(
      (p) => {
        const ico = this.getIconInfo(p.iconKey);
        return {
          label: p.name || "(unnamed)",
          iconUrl: ico.imgUrl,
          action: () => this.placePresetAt(p, nx, ny)
        };
      }
    );
    const favStickers = ((_e = this.plugin.settings.stickerPresets) != null ? _e : []).map((sp) => {
      const url = this.resolveResourceUrl(sp.imagePath);
      return {
        label: sp.name || "(unnamed)",
        iconUrl: url,
        action: () => this.placeStickerPresetAt(sp, nx, ny)
      };
    });
    if (favPins.length > 0) {
      items.push({ label: "Favorites", children: favPins });
    }
    if (favStickers.length > 0) {
      items.push({ label: "Stickers", children: favStickers });
    }
    const layerChildren = this.data.layers.map((layer) => {
      const state = this.getLayerState(layer);
      const { mark, color } = this.triStateIndicator(state);
      return {
        label: layer.name,
        mark,
        markColor: color,
        action: (rowEl) => {
          const next = this.advanceLayerState(layer);
          void this.saveDataSoon();
          this.renderMarkersOnly();
          const chk = rowEl.querySelector(".zm-menu__check");
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
      {
        label: "Image layers",
        children: [
          { label: "Base", children: baseItems },
          { label: "Overlays", children: overlayItems }
        ]
      },
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
            }
          },
          {
            label: "Clear measurement",
            action: () => {
              this.clearMeasure();
            }
          },
          {
            label: "Remove last point",
            action: () => {
              if (this.measurePts.length > 0) {
                this.measurePts.pop();
                this.renderMeasure();
              }
            }
          },
          { type: "separator" },
          { label: "Unit", children: unitItems },
          { type: "separator" },
          {
            label: this.calibrating ? "Stop calibration" : "Calibrate scale\u2026",
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
                new import_obsidian5.Notice("Calibration: click two points.", 1500);
              }
            }
          }
        ]
      },
      {
        label: "Marker layers",
        children: layerChildren
      },
      { type: "separator" },
      {
        label: "Zoom +",
        action: () => this.zoomAt(vx, vy, 1.2)
      },
      {
        label: "Zoom \u2212",
        action: () => this.zoomAt(vx, vy, 1 / 1.2)
      },
      {
        label: "Fit to window",
        action: () => this.fitToView()
      },
      {
        label: "Reset view",
        action: () => this.applyTransform(
          1,
          (this.vw - this.imgW) / 2,
          (this.vh - this.imgH) / 2
        )
      }
    );
    this.openMenu = new ZMMenu();
    this.openMenu.open(e.clientX, e.clientY, items);
    const outside = (ev) => {
      if (!this.openMenu) return;
      const t = ev.target;
      if (t && this.openMenu.contains(t)) return;
      this.closeMenu();
    };
    const keyClose = (ev) => {
      if (ev.key === "Escape") this.closeMenu();
    };
    const rightClickClose = () => this.closeMenu();
    document.addEventListener("pointerdown", outside, { capture: true });
    document.addEventListener("contextmenu", rightClickClose, {
      capture: true
    });
    document.addEventListener("keydown", keyClose, { capture: true });
    this.register(() => {
      document.removeEventListener("pointerdown", outside, true);
      document.removeEventListener("contextmenu", rightClickClose, true);
      document.removeEventListener("keydown", keyClose, true);
    });
  }
  closeMenu() {
    if (this.openMenu) {
      this.openMenu.destroy();
      this.openMenu = null;
    }
  }
  triStateIndicator(state) {
    if (state === "visible") return { mark: "check" };
    if (state === "locked") {
      return {
        mark: "x",
        color: "var(--text-error, #d23c3c)"
      };
    }
    return { mark: "minus", color: "var(--text-muted)" };
  }
  symbolForMark(mark) {
    switch (mark) {
      case "x":
        return "\xD7";
      case "minus":
        return "\u2013";
      default:
        return "\u2713";
    }
  }
  applyTransform(scale, tx, ty, render = true) {
    const prevScale = this.scale;
    const s = clamp(scale, this.cfg.minZoom, this.cfg.maxZoom);
    const scaledW = this.imgW * s;
    const scaledH = this.imgH * s;
    let minTx = this.vw - scaledW;
    let maxTx = 0;
    let minTy = this.vh - scaledH;
    let maxTy = 0;
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
    const txr = Math.round(tx);
    const tyr = Math.round(ty);
    this.scale = s;
    this.tx = txr;
    this.ty = tyr;
    this.worldEl.style.transform = `translate3d(${this.tx}px, ${this.ty}px, 0) scale3d(${this.scale}, ${this.scale}, 1)`;
    if (render) {
      if (prevScale !== s) this.updateMarkerInvScaleOnly();
      this.renderMeasure();
      this.renderCalibrate();
      if (this.isCanvas()) this.renderCanvas();
    }
  }
  panBy(dx, dy) {
    this.applyTransform(this.scale, this.tx + dx, this.ty + dy);
  }
  zoomAt(cx, cy, factor) {
    const sOld = this.scale;
    const sNew = clamp(
      sOld * factor,
      this.cfg.minZoom,
      this.cfg.maxZoom
    );
    const wx = (cx - this.tx) / sOld;
    const wy = (cy - this.ty) / sOld;
    const txNew = cx - wx * sNew;
    const tyNew = cy - wy * sNew;
    this.applyTransform(sNew, txNew, tyNew);
  }
  fitToView() {
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
  updateMarkerInvScaleOnly() {
    const invScale = 1 / this.scale;
    const invs = this.markersEl.querySelectorAll(".zm-marker-inv");
    invs.forEach((el) => {
      el.style.transform = `scale(${invScale})`;
    });
  }
  getBasesNormalized() {
    var _a, _b, _c;
    const raw = (_b = (_a = this.data) == null ? void 0 : _a.bases) != null ? _b : [];
    const out = [];
    for (const it of raw) {
      if (typeof it === "string") {
        out.push({ path: it, name: void 0 });
      } else if (it && typeof it === "object") {
        const obj = it;
        if (typeof obj.path === "string") {
          out.push({ path: obj.path, name: obj.name });
        }
      }
    }
    if (out.length === 0 && ((_c = this.data) == null ? void 0 : _c.image)) {
      out.push({ path: this.data.image });
    }
    return out;
  }
  addMarkerInteractive(nx, ny) {
    var _a;
    if (!this.data) return;
    const defaultLayer = (_a = this.data.layers.find((l) => l.visible)) != null ? _a : this.data.layers[0];
    const draft = {
      id: generateId("marker"),
      x: nx,
      y: ny,
      layer: defaultLayer.id,
      link: "",
      iconKey: this.plugin.settings.defaultIconKey,
      tooltip: ""
    };
    const modal = new MarkerEditorModal(
      this.app,
      this.plugin,
      this.data,
      draft,
      (res) => {
        if (res.action === "save" && res.marker && this.data) {
          this.data.markers.push(res.marker);
          void this.saveDataSoon();
          new import_obsidian5.Notice("Marker added.", 900);
          this.renderMarkersOnly();
        }
      }
    );
    modal.open();
  }
  placePresetAt(p, nx, ny) {
    var _a, _b, _c;
    if (!this.data) return;
    let layerId = this.data.layers[0].id;
    if (p.layerName) {
      const found = this.data.layers.find((l) => l.name === p.layerName);
      if (found) {
        layerId = found.id;
      } else {
        const id = generateId("layer");
        this.data.layers.push({
          id,
          name: p.layerName,
          visible: true,
          locked: false
        });
        layerId = id;
      }
    }
    const draft = {
      id: generateId("marker"),
      x: nx,
      y: ny,
      layer: layerId,
      link: (_a = p.linkTemplate) != null ? _a : "",
      iconKey: (_b = p.iconKey) != null ? _b : this.plugin.settings.defaultIconKey,
      tooltip: (_c = p.tooltip) != null ? _c : ""
    };
    if (p.openEditor) {
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
            new import_obsidian5.Notice("Marker added (favorite).", 900);
          }
        }
      );
      modal.open();
    } else {
      this.data.markers.push(draft);
      void this.saveDataSoon();
      this.renderMarkersOnly();
      new import_obsidian5.Notice("Marker added (favorite).", 900);
    }
  }
  placeStickerPresetAt(p, nx, ny) {
    if (!this.data) return;
    let layerId = this.data.layers[0].id;
    if (p.layerName) {
      const found = this.data.layers.find((l) => l.name === p.layerName);
      if (found) {
        layerId = found.id;
      } else {
        const id = generateId("layer");
        this.data.layers.push({
          id,
          name: p.layerName,
          visible: true,
          locked: false
        });
        layerId = id;
      }
    }
    const draft = {
      id: generateId("marker"),
      type: "sticker",
      x: nx,
      y: ny,
      layer: layerId,
      stickerPath: p.imagePath,
      stickerSize: Math.max(1, Math.round(p.size || 64))
    };
    if (p.openEditor) {
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
            new import_obsidian5.Notice("Sticker added.", 900);
          }
        }
      );
      modal.open();
    } else {
      this.data.markers.push(draft);
      void this.saveDataSoon();
      this.renderMarkersOnly();
      new import_obsidian5.Notice("Sticker added.", 900);
    }
  }
  deleteMarker(m) {
    if (!this.data) return;
    this.data.markers = this.data.markers.filter(
      (mm) => mm.id !== m.id
    );
    void this.saveDataSoon();
    this.renderMarkersOnly();
    new import_obsidian5.Notice("Marker deleted.", 900);
  }
  renderAll() {
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
  renderMarkersOnly() {
    if (!this.data) return;
    const s = this.scale;
    this.markersEl.empty();
    const visibleLayers = new Set(
      this.data.layers.filter((l) => l.visible).map((l) => l.id)
    );
    const rank = (m) => m.type === "sticker" ? 0 : 1;
    const toRender = this.data.markers.filter((m) => visibleLayers.has(m.layer)).sort((a, b) => rank(a) - rank(b));
    for (const m of toRender) {
      const L = m.x * this.imgW;
      const T = m.y * this.imgH;
      const host = this.markersEl.createDiv({ cls: "zm-marker" });
      host.dataset.id = m.id;
      host.style.left = `${L}px`;
      host.style.top = `${T}px`;
      host.style.zIndex = m.type === "sticker" ? "5" : "10";
      host.ondragstart = (ev) => ev.preventDefault();
      const layerLocked = this.isLayerLocked(m.layer);
      if (layerLocked) host.classList.add("zm-marker--locked");
      let icon;
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
        const { imgUrl, size, anchorX, anchorY } = this.getIconInfo(
          m.iconKey
        );
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
      if (m.type !== "sticker") {
        host.addEventListener(
          "mouseenter",
          (ev) => this.onMarkerEnter(ev, m, host)
        );
        host.addEventListener("mouseleave", () => this.hideTooltipSoon());
      }
      host.addEventListener("click", (ev) => {
        ev.stopPropagation();
        if (this.suppressClickMarkerId === m.id || this.dragMoved) return;
        if (m.type === "sticker") return;
        this.openMarkerLink(m);
      });
      host.addEventListener("pointerdown", (e) => {
        var _a;
        e.stopPropagation();
        if (e.button !== 0) return;
        if (this.isLayerLocked(m.layer)) return;
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
        document.body.classList.add("zm-cursor-grabbing");
        (_a = host.setPointerCapture) == null ? void 0 : _a.call(host, e.pointerId);
        e.preventDefault();
      });
      host.addEventListener("pointerup", () => {
        if (this.draggingMarkerId === m.id) {
          this.draggingMarkerId = null;
          this.dragAnchorOffset = null;
          host.classList.remove("zm-marker--dragging");
          document.body.classList.remove("zm-cursor-grabbing");
          if (this.dragMoved) void this.saveDataSoon();
        }
      });
      host.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.closeMenu();
        const items = [
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
                      (mm) => mm.id === m.id
                    );
                    if (idx >= 0) {
                      this.data.markers[idx] = res.marker;
                    }
                    void this.saveDataSoon();
                    this.renderMarkersOnly();
                  } else if (res.action === "delete") {
                    this.deleteMarker(m);
                  }
                }
              );
              modal.open();
            }
          },
          {
            label: m.type === "sticker" ? "Delete sticker" : "Delete marker",
            action: () => this.deleteMarker(m)
          }
        ];
        this.openMenu = new ZMMenu();
        this.openMenu.open(e.clientX, e.clientY, items);
        const outside = (ev) => {
          if (!this.openMenu) return;
          const t = ev.target;
          if (t && this.openMenu.contains(t)) return;
          this.closeMenu();
        };
        const keyClose = (ev) => {
          if (ev.key === "Escape") this.closeMenu();
        };
        const rightClickClose = () => this.closeMenu();
        document.addEventListener("pointerdown", outside, {
          capture: true
        });
        document.addEventListener("contextmenu", rightClickClose, {
          capture: true
        });
        document.addEventListener("keydown", keyClose, { capture: true });
        this.register(() => {
          document.removeEventListener("pointerdown", outside, true);
          document.removeEventListener(
            "contextmenu",
            rightClickClose,
            true
          );
          document.removeEventListener("keydown", keyClose, true);
        });
      });
    }
  }
  onMarkerEnter(ev, m, hostEl) {
    if (m.type === "sticker") return;
    if (m.link) {
      const workspace = this.app.workspace;
      const eventForPopover = this.plugin.settings.forcePopoverWithoutModKey ? new MouseEvent("mousemove", {
        clientX: ev.clientX,
        clientY: ev.clientY,
        bubbles: true,
        cancelable: true,
        ctrlKey: true,
        metaKey: true
      }) : ev;
      workspace.trigger("hover-link", {
        event: eventForPopover,
        source: "zoom-map",
        hoverParent: this,
        targetEl: hostEl,
        linktext: m.link,
        sourcePath: this.cfg.sourcePath
      });
      return;
    }
    this.showInternalTooltip(ev, m);
  }
  showInternalTooltip(ev, m) {
    if (!this.ready) return;
    if (!this.tooltipEl) {
      this.tooltipEl = this.viewportEl.createDiv({ cls: "zm-tooltip" });
      this.tooltipEl.addEventListener(
        "mouseenter",
        () => this.cancelHideTooltip()
      );
      this.tooltipEl.addEventListener(
        "mouseleave",
        () => this.hideTooltipSoon()
      );
    }
    this.tooltipEl.style.maxWidth = `${this.plugin.settings.hoverMaxWidth || 360}px`;
    this.tooltipEl.style.maxHeight = `${this.plugin.settings.hoverMaxHeight || 260}px`;
    this.cancelHideTooltip();
    this.tooltipEl.empty();
    if (m.tooltip) this.tooltipEl.createEl("div", { text: m.tooltip });
    else this.tooltipEl.setText("(no content)");
    this.positionTooltip(ev.clientX, ev.clientY);
    this.tooltipEl.classList.add("zm-tooltip-visible");
  }
  positionTooltip(clientX, clientY) {
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
    setCssProps(this.tooltipEl, {
      left: `${x}px`,
      top: `${y}px`
    });
  }
  hideTooltipSoon(delay = 150) {
    if (!this.tooltipEl) return;
    this.cancelHideTooltip();
    this.tooltipHideTimer = window.setTimeout(() => {
      if (this.tooltipEl) {
        this.tooltipEl.classList.remove("zm-tooltip-visible");
      }
    }, delay);
  }
  cancelHideTooltip() {
    if (this.tooltipHideTimer !== null) {
      window.clearTimeout(this.tooltipHideTimer);
      this.tooltipHideTimer = null;
    }
  }
  getIconInfo(iconKey) {
    var _a;
    const key = iconKey != null ? iconKey : this.plugin.settings.defaultIconKey;
    const profile = (_a = this.plugin.settings.icons.find((i) => i.key === key)) != null ? _a : this.plugin.builtinIcon();
    let imgUrl = profile.pathOrDataUrl;
    const f = this.resolveTFile(imgUrl, this.cfg.sourcePath);
    if (f) {
      return {
        imgUrl: this.app.vault.getResourcePath(f),
        size: profile.size,
        anchorX: profile.anchorX,
        anchorY: profile.anchorY
      };
    }
    return {
      imgUrl,
      size: profile.size,
      anchorX: profile.anchorX,
      anchorY: profile.anchorY
    };
  }
  openMarkerLink(m) {
    if (!m.link) return;
    this.app.workspace.openLinkText(m.link, this.cfg.sourcePath);
  }
  getActiveBasePath() {
    if (!this.data) return this.cfg.imagePath;
    return this.data.activeBase || this.data.image || this.cfg.imagePath;
  }
  async setActiveBase(path) {
    if (!this.data) return;
    if (this.currentBasePath === path && this.imgW > 0 && this.imgH > 0) {
      return;
    }
    this.data.activeBase = path;
    this.data.image = path;
    if (this.isCanvas()) {
      await this.loadBaseBitmapByPath(path);
    } else {
      const file = this.resolveTFile(path, this.cfg.sourcePath);
      if (!file) {
        new import_obsidian5.Notice(`Base image not found: ${path}`);
        return;
      }
      const url = this.app.vault.getResourcePath(file);
      await new Promise((resolve, reject) => {
        this.imgEl.onload = () => {
          this.imgW = this.imgEl.naturalWidth;
          this.imgH = this.imgEl.naturalHeight;
          resolve();
        };
        this.imgEl.onerror = () => reject(new Error("Failed to load image."));
        this.imgEl.src = url;
      });
      this.currentBasePath = path;
    }
    this.renderAll();
    this.applyTransform(this.scale, this.tx, this.ty);
    void this.saveDataSoon();
    if (!this.isCanvas()) {
      this.updateOverlaySizes();
    } else {
      this.renderCanvas();
    }
  }
  async applyActiveBaseAndOverlays() {
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
  buildOverlayElements() {
    var _a;
    if (this.isCanvas()) return;
    this.overlayMap.clear();
    this.overlaysEl.empty();
    if (!this.data) return;
    const mkImgEl = (url) => {
      const el = this.overlaysEl.createEl("img", {
        cls: "zm-overlay-image"
      });
      el.decoding = "async";
      el.loading = "eager";
      el.src = url;
      return el;
    };
    for (const o of (_a = this.data.overlays) != null ? _a : []) {
      const f = this.resolveTFile(o.path, this.cfg.sourcePath);
      if (!f) continue;
      const url = this.app.vault.getResourcePath(f);
      const pre = new Image();
      pre.decoding = "async";
      pre.src = url;
      pre.decode().catch((error) => {
        console.error("Zoom Map: overlay decode error", error);
      }).finally(() => {
        const el = mkImgEl(url);
        if (!o.visible) {
          el.classList.add("zm-overlay-hidden");
        }
        this.overlayMap.set(o.path, el);
      });
    }
  }
  updateOverlaySizes() {
    if (this.isCanvas()) return;
    this.overlaysEl.style.width = `${this.imgW}px`;
    this.overlaysEl.style.height = `${this.imgH}px`;
  }
  async updateOverlayVisibility() {
    var _a;
    if (!this.data) return;
    if (this.isCanvas()) {
      await this.ensureVisibleOverlaysLoaded();
      this.renderCanvas();
      return;
    }
    for (const o of (_a = this.data.overlays) != null ? _a : []) {
      const el = this.overlayMap.get(o.path);
      if (el) {
        if (o.visible) {
          el.classList.remove("zm-overlay-hidden");
        } else {
          el.classList.add("zm-overlay-hidden");
        }
      }
    }
  }
  async reloadMarkers() {
    try {
      const loaded = await this.store.load();
      this.data = loaded;
      if (!this.ready) return;
      await this.applyActiveBaseAndOverlays();
      this.renderMarkersOnly();
      this.renderMeasure();
      this.renderCalibrate();
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      new import_obsidian5.Notice(`Failed to reload markers: ${message}`);
    }
  }
  installGrip(grip, side) {
    let startW = 0;
    let startH = 0;
    let startX = 0;
    let startY = 0;
    const minW = 220;
    const minH = 220;
    const onMove = (e) => {
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
      document.body.classList.remove(
        "zm-cursor-resize-nwse",
        "zm-cursor-resize-nesw"
      );
      this.userResizing = false;
      if (this.shouldUseSavedFrame() && this.cfg.resizable) {
        void this.persistFrameNow();
      }
    };
    grip.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = this.el.getBoundingClientRect();
      startW = rect.width;
      startH = rect.height;
      startX = e.clientX;
      startY = e.clientY;
      if (side === "right") {
        document.body.classList.add("zm-cursor-resize-nwse");
      } else {
        document.body.classList.add("zm-cursor-resize-nesw");
      }
      this.userResizing = true;
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp, true);
    });
  }
  shouldUseSavedFrame() {
    return !!this.cfg.resizable && !(this.cfg.widthFromYaml || this.cfg.heightFromYaml);
  }
  requestPersistFrame(delay = 500) {
    if (this.frameSaveTimer) window.clearTimeout(this.frameSaveTimer);
    this.frameSaveTimer = window.setTimeout(() => {
      this.frameSaveTimer = null;
      void this.persistFrameNow();
    }, delay);
  }
  persistFrameNow() {
    if (!this.data || !this.shouldUseSavedFrame()) return;
    if (!this.isFrameVisibleEnough(48)) return;
    const wNow = this.el.offsetWidth;
    const hNow = this.el.offsetHeight;
    if (wNow < 48 || hNow < 48) return;
    const prev = this.data.frame;
    const tol = 1;
    if (prev && Math.abs(wNow - prev.w) <= tol && Math.abs(hNow - prev.h) <= tol) {
      return;
    }
    const w = prev && Math.abs(wNow - prev.w) <= tol ? prev.w : wNow;
    const h = prev && Math.abs(hNow - prev.h) <= tol ? prev.h : hNow;
    if (!prev || w !== prev.w || h !== prev.h) {
      this.data.frame = { w, h };
      void this.saveDataSoon();
    }
  }
  applyMeasureStyle() {
    var _a, _b;
    const color = ((_a = this.plugin.settings.measureLineColor) != null ? _a : "var(--text-accent)").trim();
    const widthPx = Math.max(1, (_b = this.plugin.settings.measureLineWidth) != null ? _b : 2);
    setCssProps(this.el, {
      "--zm-measure-color": color,
      "--zm-measure-width": `${widthPx}px`
    });
  }
  requestPanFrame() {
    if (this.panRAF != null) return;
    this.panRAF = window.requestAnimationFrame(() => {
      this.panRAF = null;
      if (this.panAccDx !== 0 || this.panAccDy !== 0) {
        this.applyTransform(
          this.scale,
          this.tx + this.panAccDx,
          this.ty + this.panAccDy
        );
        this.panAccDx = 0;
        this.panAccDy = 0;
      }
    });
  }
  // Apply YAML bases/overlays on first load (once)
  async applyYamlOnFirstLoad() {
    var _a, _b;
    if (this.yamlAppliedOnce) return;
    this.yamlAppliedOnce = true;
    const yb = (_a = this.cfg.yamlBases) != null ? _a : [];
    const yo = (_b = this.cfg.yamlOverlays) != null ? _b : [];
    if (yb.length === 0 && yo.length === 0) return;
    const changed = this.syncYamlLayers(yb, yo, void 0);
    if (changed && this.data && await this.store.wouldChange(this.data)) {
      this.ignoreNextModify = true;
      await this.store.save(this.data);
    }
  }
  syncYamlLayers(yamlBases, yamlOverlays, yamlImage) {
    var _a;
    if (!this.data) return false;
    let changed = false;
    if (yamlBases && yamlBases.length > 0) {
      const prevActive = this.getActiveBasePath();
      const newBases = yamlBases.map((b) => ({
        path: b.path,
        name: b.name
      }));
      const newPaths = new Set(newBases.map((b) => b.path));
      let newActive = prevActive;
      if (yamlImage && newPaths.has(yamlImage)) newActive = yamlImage;
      if (!newPaths.has(newActive)) newActive = newBases[0].path;
      this.data.bases = newBases;
      this.data.activeBase = newActive;
      this.data.image = newActive;
      changed = true;
    }
    if (yamlOverlays && yamlOverlays.length > 0) {
      const prev = new Map(
        ((_a = this.data.overlays) != null ? _a : []).map((o) => [o.path, o])
      );
      const next = yamlOverlays.map((o) => {
        var _a2, _b;
        return {
          path: o.path,
          name: o.name,
          visible: typeof o.visible === "boolean" ? o.visible : (_b = (_a2 = prev.get(o.path)) == null ? void 0 : _a2.visible) != null ? _b : false
        };
      });
      this.data.overlays = next;
      changed = true;
    }
    return changed;
  }
  async applyScaleCalibration(metersPerPixel) {
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
};
var ZMMenu = class {
  constructor() {
    this.submenus = [];
    this.items = [];
    this.root = document.body.createDiv({ cls: "zm-menu" });
    this.root.addEventListener("contextmenu", (e) => e.stopPropagation());
  }
  open(clientX, clientY, items) {
    this.items = items;
    this.buildList(this.root, this.items);
    this.position(this.root, clientX, clientY, "right");
  }
  destroy() {
    this.submenus.forEach((el) => el.remove());
    this.submenus = [];
    this.root.remove();
  }
  contains(el) {
    return this.root.contains(el) || this.submenus.some((s) => s.contains(el));
  }
  buildList(container, items) {
    container.empty();
    for (const it of items) {
      if (it.type === "separator") {
        container.createDiv({ cls: "zm-menu__sep" });
        continue;
      }
      if (!it.label) continue;
      const row = container.createDiv({ cls: "zm-menu__item" });
      const label = row.createDiv({ cls: "zm-menu__label" });
      label.setText(it.label);
      const right = row.createDiv({ cls: "zm-menu__right" });
      if (it.children && it.children.length) {
        const arrow = right.createDiv({ cls: "zm-menu__arrow" });
        arrow.setText("\u25B6");
        let submenuEl = null;
        const openSub = () => {
          if (submenuEl) return;
          submenuEl = document.body.createDiv({ cls: "zm-submenu" });
          this.submenus.push(submenuEl);
          this.buildList(submenuEl, it.children);
          const rect = row.getBoundingClientRect();
          const pref = rect.right + 260 < window.innerWidth ? "right" : "left";
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
          const to = e.relatedTarget || null;
          if (submenuEl && !submenuEl.contains(to)) {
            closeSub();
          }
        });
      } else {
        const chk = right.createDiv({ cls: "zm-menu__check" });
        if (it.mark) {
          chk.setText(this.symbolForMark(it.mark));
          if (it.markColor) chk.style.color = it.markColor;
        } else if (typeof it.checked === "boolean") {
          chk.setText(it.checked ? "\u2713" : "");
        }
        if (it.iconUrl) {
          const img = right.createEl("img", { cls: "zm-menu__icon" });
          img.src = it.iconUrl;
        }
        row.addEventListener("click", () => {
          if (it.action) {
            void Promise.resolve(it.action(row, this)).catch(
              (err) => console.error("Menu item action failed:", err)
            );
          }
        });
      }
    }
  }
  symbolForMark(mark) {
    switch (mark) {
      case "x":
        return "\xD7";
      case "minus":
        return "\u2013";
      default:
        return "\u2713";
    }
  }
  position(el, clientX, clientY, prefer) {
    const pad = 6;
    const rect = el.getBoundingClientRect();
    let x = clientX;
    let y = clientY;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (prefer === "right") {
      if (clientX + rect.width + pad > vw) {
        x = Math.max(pad, vw - rect.width - pad);
      }
    } else {
      x = clientX - rect.width;
      if (x < pad) x = pad;
    }
    if (clientY + rect.height + pad > vh) {
      y = Math.max(pad, vh - rect.height - pad);
    }
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  }
};

// src/iconFileSuggest.ts
var import_obsidian6 = require("obsidian");
var ImageFileSuggestModal = class extends import_obsidian6.FuzzySuggestModal {
  constructor(app, onChoose) {
    super(app);
    this.appRef = app;
    this.onChoose = onChoose;
    const exts = /* @__PURE__ */ new Set(["png", "jpg", "jpeg", "gif", "svg", "webp"]);
    this.files = this.appRef.vault.getFiles().filter((f) => {
      var _a;
      const m = (_a = f.extension) == null ? void 0 : _a.toLowerCase();
      return exts.has(m);
    });
    this.setPlaceholder("Choose image file\u2026");
  }
  getItems() {
    return this.files;
  }
  getItemText(item) {
    return item.path;
  }
  onChooseItem(item) {
    this.onChoose(item);
  }
};

// src/main.ts
function svgPinDataUrl(color = "#d23c3c") {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <path fill="${color}" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7m0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"/>
</svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}
var DEFAULT_SETTINGS = {
  icons: [
    {
      key: "pinRed",
      pathOrDataUrl: svgPinDataUrl("#d23c3c"),
      size: 24,
      anchorX: 12,
      anchorY: 12
    },
    {
      key: "pinBlue",
      pathOrDataUrl: svgPinDataUrl("#3c62d2"),
      size: 24,
      anchorX: 12,
      anchorY: 12
    }
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
  defaultWidthWrapped: "50%"
};
function toCssSize(v, fallback) {
  if (typeof v === "number" && Number.isFinite(v)) return `${v}px`;
  if (typeof v === "string" && v.trim().length > 0) return v.trim();
  return fallback;
}
function parseBasesYaml(v) {
  if (!Array.isArray(v)) return [];
  return v.map((it) => {
    if (typeof it === "string") return { path: it };
    if (it && typeof it === "object" && "path" in it) {
      const obj = it;
      if (typeof obj.path === "string") {
        return {
          path: obj.path,
          name: typeof obj.name === "string" ? obj.name : void 0
        };
      }
    }
    return null;
  }).filter((b) => b !== null);
}
function parseOverlaysYaml(v) {
  if (!Array.isArray(v)) return [];
  return v.map((it) => {
    if (typeof it === "string") return { path: it };
    if (it && typeof it === "object" && "path" in it) {
      const obj = it;
      if (typeof obj.path === "string") {
        return {
          path: obj.path,
          name: typeof obj.name === "string" ? obj.name : void 0,
          visible: typeof obj.visible === "boolean" ? obj.visible : void 0
        };
      }
    }
    return null;
  }).filter((o) => o !== null);
}
function parseScaleYaml(v) {
  if (!v || typeof v !== "object") return void 0;
  const obj = v;
  const mpp = typeof obj.metersPerPixel === "number" && obj.metersPerPixel > 0 ? obj.metersPerPixel : void 0;
  const ppm = typeof obj.pixelsPerMeter === "number" && obj.pixelsPerMeter > 0 ? 1 / obj.pixelsPerMeter : void 0;
  return mpp != null ? mpp : ppm;
}
async function readSavedFrame(app, markersPath) {
  var _a, _b;
  try {
    const file = app.vault.getAbstractFileByPath((0, import_obsidian7.normalizePath)(markersPath));
    if (!(file instanceof import_obsidian7.TFile)) return null;
    const raw = await app.vault.read(file);
    const json = JSON.parse(raw);
    const fw = Number((_a = json == null ? void 0 : json.frame) == null ? void 0 : _a.w);
    const fh = Number((_b = json == null ? void 0 : json.frame) == null ? void 0 : _b.h);
    if (Number.isFinite(fw) && Number.isFinite(fh) && fw >= 48 && fh >= 48) {
      return { w: Math.round(fw), h: Math.round(fh) };
    }
  } catch (error) {
    console.error("Zoom Map: failed to read saved frame", error);
  }
  return null;
}
var ZoomMapPlugin = class extends import_obsidian7.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
  }
  async onload() {
    await this.loadSettings();
    this.registerMarkdownCodeBlockProcessor(
      "zoommap",
      async (src, el, ctx) => {
        var _a, _b, _c;
        let opts = {};
        try {
          const parsed = (0, import_obsidian7.parseYaml)(src);
          if (parsed && typeof parsed === "object") {
            opts = parsed;
          }
        } catch (error) {
          console.error("Zoom Map: failed to parse zoommap block", error);
        }
        const yamlBases = parseBasesYaml(opts["imageBases"]);
        const yamlOverlays = parseOverlaysYaml(opts["imageOverlays"]);
        const yamlMetersPerPixel = parseScaleYaml(opts["scale"]);
        const renderRaw = typeof opts["render"] === "string" ? opts["render"].toLowerCase() : "";
        const renderMode = renderRaw === "canvas" ? "canvas" : "dom";
        let image = typeof opts["image"] === "string" ? opts["image"].trim() : "";
        if (!image && yamlBases.length > 0) image = yamlBases[0].path;
        if (!image) {
          el.createEl("div", {
            text: "Image is missing."
          });
          return;
        }
        const storageRaw = typeof opts["storage"] === "string" ? opts["storage"].toLowerCase() : "";
        const storageMode = storageRaw === "note" || storageRaw === "inline" || storageRaw === "in-note" ? "note" : storageRaw === "json" ? "json" : (_a = this.settings.storageDefault) != null ? _a : "json";
        const sectionInfo = ctx.getSectionInfo(el);
        const defaultId = `map-${(_b = sectionInfo == null ? void 0 : sectionInfo.lineStart) != null ? _b : Date.now()}`;
        const mapId = typeof opts["id"] === "string" && opts["id"].trim() ? opts["id"].trim() : defaultId;
        const markersPathRaw = typeof opts["markers"] === "string" ? opts["markers"] : void 0;
        const minZoom = typeof opts["minZoom"] === "number" ? opts["minZoom"] : 0.25;
        const maxZoom = typeof opts["maxZoom"] === "number" ? opts["maxZoom"] : 8;
        const markersPath = (0, import_obsidian7.normalizePath)(
          markersPathRaw != null ? markersPathRaw : `${image}.markers.json`
        );
        const alignRaw = typeof opts["align"] === "string" ? opts["align"].toLowerCase() : "";
        const align = alignRaw === "left" || alignRaw === "center" || alignRaw === "right" ? alignRaw : void 0;
        const wrap = typeof opts["wrap"] === "boolean" ? opts["wrap"] : false;
        const classesValue = opts["classes"];
        const extraClasses = Array.isArray(classesValue) ? classesValue.map((c) => String(c)) : typeof classesValue === "string" ? classesValue.split(/\s+/).map((c) => c.trim()).filter(Boolean) : [];
        const resizable = typeof opts["resizable"] === "boolean" ? opts["resizable"] : this.settings.defaultResizable;
        const resizeHandleRaw = typeof opts["resizeHandle"] === "string" ? opts["resizeHandle"] : this.settings.defaultResizeHandle;
        const resizeHandle = resizeHandleRaw === "left" || resizeHandleRaw === "right" || resizeHandleRaw === "both" || resizeHandleRaw === "native" ? resizeHandleRaw : "right";
        const widthFromYaml = Object.prototype.hasOwnProperty.call(
          opts,
          "width"
        );
        const heightFromYaml = Object.prototype.hasOwnProperty.call(
          opts,
          "height"
        );
        const extSettings = this.settings;
        const widthDefault = wrap ? (_c = extSettings.defaultWidthWrapped) != null ? _c : "50%" : this.settings.defaultWidth;
        let widthCss = toCssSize(opts["width"], widthDefault);
        let heightCss = toCssSize(
          opts["height"],
          this.settings.defaultHeight
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
        const cfg = {
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
          sectionStart: sectionInfo == null ? void 0 : sectionInfo.lineStart,
          sectionEnd: sectionInfo == null ? void 0 : sectionInfo.lineEnd,
          widthFromYaml,
          heightFromYaml,
          storageMode,
          mapId
        };
        const inst = new MapInstance(this.app, this, el, cfg);
        ctx.addChild(inst);
      }
    );
    this.addSettingTab(new ZoomMapSettingTab(this.app, this));
  }
  onunload() {
  }
  builtinIcon() {
    var _a;
    return (_a = this.settings.icons[0]) != null ? _a : {
      key: "builtin",
      pathOrDataUrl: svgPinDataUrl("#d23c3c"),
      size: 24,
      anchorX: 12,
      anchorY: 12
    };
  }
  async loadSettings() {
    const saved = await this.loadData();
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      saved != null ? saved : {}
    );
    const ext = this.settings;
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
};
var ZoomMapSettingTab = class extends import_obsidian7.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    var _a;
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass("zoommap-settings");
    new import_obsidian7.Setting(containerEl).setName("Storage").setHeading();
    new import_obsidian7.Setting(containerEl).setName("Storage location (default)").setDesc(
      "Store your data in json or inline."
    ).addDropdown((d) => {
      var _a2;
      d.addOption("json", "JSON file (beside image)");
      d.addOption("note", "Inside the note (hidden comment)");
      d.setValue((_a2 = this.plugin.settings.storageDefault) != null ? _a2 : "json");
      d.onChange((v) => {
        this.plugin.settings.storageDefault = v === "note" ? "note" : "json";
        void this.plugin.saveSettings();
      });
    });
    new import_obsidian7.Setting(containerEl).setName("Layout").setHeading();
    new import_obsidian7.Setting(containerEl).setName("Default width when wrapped").setDesc(
      "Initial width if wrap: true and no width is set in the code block."
    ).addText((t) => {
      var _a2;
      const ext = this.plugin.settings;
      t.setPlaceholder("50%");
      t.setValue((_a2 = ext.defaultWidthWrapped) != null ? _a2 : "50%");
      t.onChange((v) => {
        ext.defaultWidthWrapped = (v || "50%").trim();
        void this.plugin.saveSettings();
      });
    });
    new import_obsidian7.Setting(containerEl).setName("Interaction").setHeading();
    new import_obsidian7.Setting(containerEl).setName("Mouse wheel zoom factor").setDesc("Multiplier per step. 1.1 = 10% per tick.").addText(
      (t) => t.setPlaceholder("1.1").setValue(String(this.plugin.settings.wheelZoomFactor)).onChange((v) => {
        const n = Number(v);
        if (!Number.isNaN(n) && n > 1.001 && n < 2.5) {
          this.plugin.settings.wheelZoomFactor = n;
          void this.plugin.saveSettings();
        }
      })
    );
    new import_obsidian7.Setting(containerEl).setName("Panning mouse button").setDesc("Which mouse button pans the map?").addDropdown((d) => {
      var _a2;
      d.addOption("left", "Left");
      d.addOption("middle", "Middle");
      d.setValue((_a2 = this.plugin.settings.panMouseButton) != null ? _a2 : "left");
      d.onChange((v) => {
        this.plugin.settings.panMouseButton = v === "middle" ? "middle" : "left";
        void this.plugin.saveSettings();
      });
    });
    new import_obsidian7.Setting(containerEl).setName("Hover popover size").setDesc("Max width and height in pixels.").addText(
      (t) => t.setPlaceholder("360").setValue(String(this.plugin.settings.hoverMaxWidth)).onChange((v) => {
        const n = Number(v);
        if (!Number.isNaN(n) && n >= 200) {
          this.plugin.settings.hoverMaxWidth = n;
          void this.plugin.saveSettings();
        }
      })
    ).addText(
      (t) => t.setPlaceholder("260").setValue(String(this.plugin.settings.hoverMaxHeight)).onChange((v) => {
        const n = Number(v);
        if (!Number.isNaN(n) && n >= 120) {
          this.plugin.settings.hoverMaxHeight = n;
          void this.plugin.saveSettings();
        }
      })
    );
    new import_obsidian7.Setting(containerEl).setName("Force popovers without ctrl").setDesc("Opens preview popovers on simple hover.").addToggle(
      (t) => t.setValue(!!this.plugin.settings.forcePopoverWithoutModKey).onChange((v) => {
        this.plugin.settings.forcePopoverWithoutModKey = v;
        void this.plugin.saveSettings();
      })
    );
    new import_obsidian7.Setting(containerEl).setName("Ruler").setHeading();
    const applyStyleToAll = () => {
      var _a2, _b;
      const color = ((_a2 = this.plugin.settings.measureLineColor) != null ? _a2 : "var(--text-accent)").trim();
      const widthPx = Math.max(1, (_b = this.plugin.settings.measureLineWidth) != null ? _b : 2);
      document.querySelectorAll(".zm-root").forEach((el) => {
        el.style.setProperty("--zm-measure-color", color);
        el.style.setProperty("--zm-measure-width", `${widthPx}px`);
      });
    };
    const colorRow = new import_obsidian7.Setting(containerEl).setName("Line color").setDesc("CSS color, e.g. #ff0055.");
    colorRow.addText(
      (t) => {
        var _a2;
        return t.setPlaceholder("var(--text-accent)").setValue((_a2 = this.plugin.settings.measureLineColor) != null ? _a2 : "var(--text-accent)").onChange((v) => {
          this.plugin.settings.measureLineColor = (v == null ? void 0 : v.trim()) || "var(--text-accent)";
          void this.plugin.saveSettings();
          applyStyleToAll();
        });
      }
    );
    const picker = colorRow.controlEl.createEl("input", {
      attr: {
        type: "color",
        style: "margin-left:8px; vertical-align: middle;"
      }
    });
    const setPickerFromValue = (val) => {
      if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) {
        picker.value = val;
      } else {
        picker.value = "#ff0000";
      }
    };
    setPickerFromValue((_a = this.plugin.settings.measureLineColor) != null ? _a : "");
    picker.oninput = () => {
      this.plugin.settings.measureLineColor = picker.value;
      void this.plugin.saveSettings();
      applyStyleToAll();
    };
    new import_obsidian7.Setting(containerEl).setName("Line width").setDesc("Stroke width in pixels.").addText(
      (t) => {
        var _a2;
        return t.setPlaceholder("2").setValue(String((_a2 = this.plugin.settings.measureLineWidth) != null ? _a2 : 2)).onChange((v) => {
          const n = Number(v);
          if (Number.isFinite(n) && n > 0 && n <= 20) {
            this.plugin.settings.measureLineWidth = n;
            void this.plugin.saveSettings();
            applyStyleToAll();
          }
        });
      }
    );
    new import_obsidian7.Setting(containerEl).setName("Marker icons").setHeading();
    const iconsHead = containerEl.createDiv({
      cls: "zm-icons-grid-head zm-grid"
    });
    iconsHead.createSpan({ text: "Name" });
    iconsHead.createSpan({ text: "Path / data:URL" });
    iconsHead.createSpan({ text: "Size" });
    const headAX = iconsHead.createSpan({ cls: "zm-icohead" });
    const axIco = headAX.createSpan();
    (0, import_obsidian7.setIcon)(axIco, "anchor");
    headAX.appendText(" X");
    const headAY = iconsHead.createSpan({ cls: "zm-icohead" });
    const ayIco = headAY.createSpan();
    (0, import_obsidian7.setIcon)(ayIco, "anchor");
    headAY.appendText(" Y");
    const headTrash = iconsHead.createSpan();
    (0, import_obsidian7.setIcon)(headTrash, "trash");
    const iconsGrid = containerEl.createDiv({
      cls: "zm-icons-grid zm-grid"
    });
    const renderIcons = () => {
      var _a2;
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
        path.value = (_a2 = icon.pathOrDataUrl) != null ? _a2 : "";
        path.oninput = () => {
          icon.pathOrDataUrl = path.value.trim();
          void this.plugin.saveSettings();
        };
        const pick = pathWrap.createEl("button", {
          attr: { title: "Choose file\u2026" }
        });
        pick.classList.add("zm-icon-btn");
        (0, import_obsidian7.setIcon)(pick, "folder-open");
        pick.onclick = () => {
          new ImageFileSuggestModal(this.app, (file) => {
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
        (0, import_obsidian7.setIcon)(del, "trash");
        del.onclick = () => {
          this.plugin.settings.icons = this.plugin.settings.icons.filter(
            (i) => i !== icon
          );
          void this.plugin.saveSettings();
          renderIcons();
        };
      }
    };
    renderIcons();
    new import_obsidian7.Setting(containerEl).setName("Add new icon").setDesc("Creates an empty icon entry; pick a file or paste a data URL.").addButton(
      (b) => b.setButtonText("Add").onClick(() => {
        const idx = this.plugin.settings.icons.length + 1;
        this.plugin.settings.icons.push({
          key: `pin-${idx}`,
          pathOrDataUrl: "",
          size: 24,
          anchorX: 12,
          anchorY: 12
        });
        void this.plugin.saveSettings();
        this.display();
      })
    );
    new import_obsidian7.Setting(containerEl).setName("Favorites (presets)").setHeading();
    const presetsHead = containerEl.createDiv({
      cls: "zm-presets-grid-head zm-grid"
    });
    ["Name", "Icon", "Layer", "Editor", "Link", ""].forEach(
      (h) => presetsHead.createSpan({ text: h })
    );
    const presetsGrid = containerEl.createDiv({
      cls: "zm-presets-grid zm-grid"
    });
    const renderPresets = () => {
      var _a2, _b, _c;
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
        const addOpt = (key, label) => {
          const o = document.createElement("option");
          o.value = key;
          o.textContent = label;
          iconSel.appendChild(o);
        };
        addOpt("", "(Default)");
        for (const icon of this.plugin.settings.icons) {
          addOpt(icon.key, icon.key);
        }
        iconSel.value = (_a2 = p.iconKey) != null ? _a2 : "";
        iconSel.onchange = () => {
          p.iconKey = iconSel.value || void 0;
          void this.plugin.saveSettings();
        };
        const layer = row.createEl("input", { type: "text" });
        layer.value = (_b = p.layerName) != null ? _b : "";
        layer.oninput = () => {
          p.layerName = layer.value.trim() || void 0;
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
        link.value = (_c = p.linkTemplate) != null ? _c : "";
        link.oninput = () => {
          p.linkTemplate = link.value.trim() || void 0;
          void this.plugin.saveSettings();
        };
        const del = row.createEl("button", { attr: { title: "Delete" } });
        del.classList.add("zm-icon-btn");
        (0, import_obsidian7.setIcon)(del, "trash");
        del.onclick = () => {
          this.plugin.settings.presets = this.plugin.settings.presets.filter(
            (x) => x !== p
          );
          void this.plugin.saveSettings();
          renderPresets();
        };
      }
    };
    renderPresets();
    new import_obsidian7.Setting(containerEl).setName("Add new favorite").addButton(
      (b) => b.setButtonText("Add").onClick(() => {
        const p = {
          name: `Favorite ${this.plugin.settings.presets.length + 1}`,
          openEditor: false
        };
        this.plugin.settings.presets.push(p);
        void this.plugin.saveSettings();
        renderPresets();
      })
    );
    new import_obsidian7.Setting(containerEl).setName("Stickers").setHeading();
    const stickersHead = containerEl.createDiv({
      cls: "zm-stickers-grid-head zm-grid"
    });
    ["Name", "Image", "Size", "Layer", ""].forEach(
      (h) => stickersHead.createSpan({ text: h })
    );
    const stickersGrid = containerEl.createDiv({
      cls: "zm-stickers-grid zm-grid"
    });
    const renderStickers = () => {
      var _a2, _b, _c;
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
        path.value = (_a2 = s.imagePath) != null ? _a2 : "";
        path.oninput = () => {
          s.imagePath = path.value.trim();
          void this.plugin.saveSettings();
        };
        const pick = pathWrap.createEl("button", {
          attr: { title: "Choose file\u2026" }
        });
        pick.classList.add("zm-icon-btn");
        (0, import_obsidian7.setIcon)(pick, "folder-open");
        pick.onclick = () => {
          new ImageFileSuggestModal(this.app, (file) => {
            s.imagePath = file.path;
            void this.plugin.saveSettings();
            renderStickers();
          }).open();
        };
        const size = row.createEl("input", { type: "number" });
        size.classList.add("zm-num");
        size.value = String((_b = s.size) != null ? _b : 64);
        size.oninput = () => {
          const n = Number(size.value);
          if (!Number.isNaN(n) && n > 0) {
            s.size = Math.round(n);
            void this.plugin.saveSettings();
          }
        };
        const layer = row.createEl("input", { type: "text" });
        layer.value = (_c = s.layerName) != null ? _c : "";
        layer.oninput = () => {
          s.layerName = layer.value.trim() || void 0;
          void this.plugin.saveSettings();
        };
        const del = row.createEl("button", { attr: { title: "Delete" } });
        del.classList.add("zm-icon-btn");
        (0, import_obsidian7.setIcon)(del, "trash");
        del.onclick = () => {
          this.plugin.settings.stickerPresets = this.plugin.settings.stickerPresets.filter((x) => x !== s);
          void this.plugin.saveSettings();
          renderStickers();
        };
      }
    };
    renderStickers();
    new import_obsidian7.Setting(containerEl).setName("Add new sticker").addButton(
      (b) => b.setButtonText("Add").onClick(() => {
        const s = {
          name: `Sticker ${this.plugin.settings.stickerPresets.length + 1}`,
          imagePath: "",
          size: 64,
          openEditor: false
        };
        this.plugin.settings.stickerPresets.push(s);
        void this.plugin.saveSettings();
        renderStickers();
      })
    );
  }
};
