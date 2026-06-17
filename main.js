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
var import_obsidian29 = require("obsidian");

// src/map.ts
var import_obsidian21 = require("obsidian");

// src/markerStore.ts
var import_obsidian = require("obsidian");
function generateId(prefix = "m") {
  const s = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${s}`;
}
function sanitizeMarkerFileDataForSave(data) {
  var _a2, _b2;
  const out = { ...data };
  const deleted = sanitizeDeletedUndoEntries(out.deleted);
  delete out.image;
  delete out.deleted;
  const du = (_b2 = (_a2 = out.measurement) == null ? void 0 : _a2.displayUnit) != null ? _b2 : "";
  if (out.measurement && du) {
    if (du === "auto-metric") out.measurement.displayUnit = "km";
    else if (du === "auto-imperial") out.measurement.displayUnit = "mi";
  }
  if (deleted == null ? void 0 : deleted.length) out.deleted = deleted;
  return out;
}
function isRecord(x2) {
  return typeof x2 === "object" && x2 !== null && !Array.isArray(x2);
}
function sanitizeIndex(x2) {
  const n = typeof x2 === "number" ? x2 : Number(x2);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.floor(n);
}
function sanitizeDeletedIndexedMarker(x2) {
  if (!isRecord(x2) || !isRecord(x2.marker)) return null;
  const index = sanitizeIndex(x2.index);
  if (index === null) return null;
  return {
    marker: x2.marker,
    index
  };
}
function sanitizeDeletedIndexedDrawing(x2) {
  if (!isRecord(x2) || !isRecord(x2.drawing)) return null;
  const index = sanitizeIndex(x2.index);
  if (index === null) return null;
  return {
    drawing: x2.drawing,
    index
  };
}
function sanitizeDeletedUndoPayload(payload) {
  if (!isRecord(payload) || typeof payload.kind !== "string") return null;
  switch (payload.kind) {
    case "marker": {
      if (!isRecord(payload.marker)) return null;
      const index = sanitizeIndex(payload.index);
      if (index === null) return null;
      return {
        kind: "marker",
        marker: payload.marker,
        index
      };
    }
    case "drawing": {
      if (!isRecord(payload.drawing)) return null;
      const index = sanitizeIndex(payload.index);
      if (index === null) return null;
      return {
        kind: "drawing",
        drawing: payload.drawing,
        index
      };
    }
    case "grid": {
      if (!isRecord(payload.grid)) return null;
      const index = sanitizeIndex(payload.index);
      if (index === null) return null;
      return {
        kind: "grid",
        grid: payload.grid,
        index
      };
    }
    case "text-layer": {
      if (!isRecord(payload.layer)) return null;
      const index = sanitizeIndex(payload.index);
      if (index === null) return null;
      return {
        kind: "text-layer",
        layer: payload.layer,
        index
      };
    }
    case "text-box": {
      if (typeof payload.layerId !== "string" || !isRecord(payload.box)) return null;
      const index = sanitizeIndex(payload.index);
      if (index === null) return null;
      return {
        kind: "text-box",
        layerId: payload.layerId,
        box: payload.box,
        index
      };
    }
    case "marker-layer": {
      if (!isRecord(payload.layer)) return null;
      const index = sanitizeIndex(payload.index);
      if (index === null) return null;
      const mode = payload.mode === "move" || payload.mode === "delete-markers" ? payload.mode : null;
      if (!mode) return null;
      const markers = Array.isArray(payload.markers) ? payload.markers.map(sanitizeDeletedIndexedMarker).filter((x2) => !!x2) : void 0;
      const movedMarkerIds = Array.isArray(payload.movedMarkerIds) ? payload.movedMarkerIds.filter((x2) => typeof x2 === "string" && !!x2.trim()) : void 0;
      return {
        kind: "marker-layer",
        layer: payload.layer,
        index,
        mode,
        targetId: typeof payload.targetId === "string" && payload.targetId.trim() ? payload.targetId : void 0,
        markers: (markers == null ? void 0 : markers.length) ? markers : void 0,
        movedMarkerIds: (movedMarkerIds == null ? void 0 : movedMarkerIds.length) ? movedMarkerIds : void 0
      };
    }
    case "draw-layer": {
      if (!isRecord(payload.layer)) return null;
      const index = sanitizeIndex(payload.index);
      if (index === null) return null;
      const drawings = Array.isArray(payload.drawings) ? payload.drawings.map(sanitizeDeletedIndexedDrawing).filter((x2) => !!x2) : [];
      return {
        kind: "draw-layer",
        layer: payload.layer,
        index,
        drawings
      };
    }
    default:
      return null;
  }
}
function sanitizeDeletedUndoEntries(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return void 0;
  const out = entries.map((entry) => {
    if (!isRecord(entry)) return null;
    const payload = sanitizeDeletedUndoPayload(entry.payload);
    if (!payload) return null;
    return {
      id: typeof entry.id === "string" && entry.id.trim() ? entry.id : generateId("undo"),
      label: typeof entry.label === "string" && entry.label.trim() ? entry.label : "Deleted item",
      createdAt: typeof entry.createdAt === "string" && entry.createdAt.trim() ? entry.createdAt : (/* @__PURE__ */ new Date(0)).toISOString(),
      payload
    };
  }).filter((x2) => !!x2).slice(0, 3);
  return out.length ? out : void 0;
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
  serialize(data) {
    return JSON.stringify(sanitizeMarkerFileDataForSave(data), null, 2);
  }
  async ensureExists(initialImagePath, size, markerLayerNames) {
    const abs = this.getFileByPath(this.markersFilePath);
    if (abs) return;
    const baseLayers = markerLayerNames && markerLayerNames.length > 0 ? markerLayerNames.map((name, idx) => ({
      id: idx === 0 ? "default" : generateId("layer"),
      name: name || "Layer",
      visible: true,
      locked: false
    })) : [{ id: "default", name: "Default", visible: true, locked: false }];
    const data = {
      size,
      layers: baseLayers,
      markers: [],
      bases: initialImagePath ? [initialImagePath] : [],
      overlays: [],
      activeBase: initialImagePath != null ? initialImagePath : "",
      measurement: {
        metersPerPixel: void 0,
        scales: {},
        customUnitId: void 0,
        customUnitPxPerUnit: {},
        travelTimePresetIds: [],
        travelDaysEnabled: false,
        travelDayPresetId: void 0
      },
      frame: void 0,
      pinSizeOverrides: {},
      grids: [],
      panClamp: true,
      drawLayers: [],
      drawings: [],
      secondScreen: {},
      textLayers: []
    };
    await this.create(this.serialize(data));
    new import_obsidian.Notice(`Created marker file: ${this.markersFilePath}`, 2500);
  }
  async load() {
    var _a2, _b2, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q;
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
      var _a3;
      return {
        id: l.id,
        name: (_a3 = l.name) != null ? _a3 : "Layer",
        visible: typeof l.visible === "boolean" ? l.visible : true,
        locked: !!l.locked,
        boundBase: typeof l.boundBase === "string" && l.boundBase.trim() ? l.boundBase : void 0
      };
    });
    (_a2 = parsed.markers) != null ? _a2 : parsed.markers = [];
    (_b2 = parsed.bases) != null ? _b2 : parsed.bases = parsed.image ? [parsed.image] : [];
    if (!parsed.activeBase) {
      const firstBase = parsed.bases[0];
      const firstPath = typeof firstBase === "string" ? firstBase : isBaseImage(firstBase) ? firstBase.path : "";
      parsed.activeBase = parsed.activeBase || parsed.image || firstPath || "";
    }
    (_c = parsed.overlays) != null ? _c : parsed.overlays = [];
    (_d = parsed.measurement) != null ? _d : parsed.measurement = {
      displayUnit: "km",
      metersPerPixel: void 0,
      scales: {}
    };
    (_f = (_e = parsed.measurement).scales) != null ? _f : _e.scales = {};
    {
      const raw2 = (_g = parsed.measurement.displayUnit) != null ? _g : "";
      if (raw2 === "auto-metric") parsed.measurement.displayUnit = "km";
      else if (raw2 === "auto-imperial") parsed.measurement.displayUnit = "mi";
      else if (raw2 !== "m" && raw2 !== "km" && raw2 !== "mi" && raw2 !== "ft" && raw2 !== "custom") {
        parsed.measurement.displayUnit = "km";
      }
    }
    (_i = (_h = parsed.measurement).customUnitPxPerUnit) != null ? _i : _h.customUnitPxPerUnit = {};
    if (!Array.isArray(parsed.measurement.travelTimePresetIds)) {
      parsed.measurement.travelTimePresetIds = [];
    }
    if (typeof parsed.measurement.travelDaysEnabled !== "boolean") {
      parsed.measurement.travelDaysEnabled = false;
    }
    if (typeof parsed.measurement.travelDayPresetId !== "string" || !parsed.measurement.travelDayPresetId.trim()) {
      delete parsed.measurement.travelDayPresetId;
    }
    (_j = parsed.pinSizeOverrides) != null ? _j : parsed.pinSizeOverrides = {};
    if (typeof parsed.panClamp !== "boolean") {
      parsed.panClamp = true;
    }
    (_k = parsed.drawLayers) != null ? _k : parsed.drawLayers = [];
    (_l = parsed.drawings) != null ? _l : parsed.drawings = [];
    (_m = parsed.grids) != null ? _m : parsed.grids = [];
    parsed.grids = parsed.grids.map((g) => {
      var _a3;
      return {
        id: g.id,
        name: (_a3 = g.name) != null ? _a3 : "Grid",
        visible: typeof g.visible === "boolean" ? g.visible : true,
        boundBase: typeof g.boundBase === "string" && g.boundBase.trim() ? g.boundBase : void 0,
        shape: g.shape === "hex" ? "hex" : "square",
        color: typeof g.color === "string" && g.color.trim() ? g.color : "#ffffff",
        width: Number.isFinite(g.width) && g.width > 0 ? g.width : 1,
        opacity: Number.isFinite(g.opacity) ? Math.min(Math.max(g.opacity, 0), 1) : 0.5,
        spacing: Number.isFinite(g.spacing) && g.spacing > 1 ? g.spacing : 64,
        offsetX: Number.isFinite(g.offsetX) ? g.offsetX : 0,
        offsetY: Number.isFinite(g.offsetY) ? g.offsetY : 0,
        playerScreen: g.playerScreen === "player-only" || g.playerScreen === "gm-only" ? g.playerScreen : "both"
      };
    });
    (_n = parsed.textLayers) != null ? _n : parsed.textLayers = [];
    parsed.textLayers = parsed.textLayers.map((layer) => {
      var _a3;
      const legacy = layer;
      const boxes = Array.isArray(layer.boxes) ? layer.boxes : [];
      const migratedLegacyBox = boxes.length === 0 ? buildLegacyTextBoxFromLayer(legacy) : null;
      return {
        id: layer.id,
        name: (_a3 = layer.name) != null ? _a3 : "Text layer",
        visible: typeof layer.visible === "boolean" ? layer.visible : true,
        locked: !!layer.locked,
        boundBase: typeof layer.boundBase === "string" && layer.boundBase.trim() ? layer.boundBase : void 0,
        autoFlow: typeof layer.autoFlow === "boolean" ? layer.autoFlow : void 0,
        allowAngledBaselines: typeof layer.allowAngledBaselines === "boolean" ? layer.allowAngledBaselines : void 0,
        style: layer.style,
        boxes: boxes.length > 0 ? boxes : migratedLegacyBox ? [migratedLegacyBox] : []
      };
    });
    (_o = parsed.secondScreen) != null ? _o : parsed.secondScreen = {};
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
    (_p = parsed.deleted) != null ? _p : parsed.deleted = [];
    parsed.deleted = ((_q = sanitizeDeletedUndoEntries(parsed.deleted)) != null ? _q : []).slice(0, 3);
    return parsed;
  }
  async save(data) {
    const f = this.getFileByPath(this.markersFilePath);
    const content = this.serialize(data);
    if (!f) {
      await this.create(content);
    } else {
      await this.app.vault.modify(f, content);
    }
  }
  async wouldChange(data) {
    const f = this.getFileByPath(this.markersFilePath);
    const next = this.serialize(data);
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
  async ensureFolderExists(path) {
    if (!path) return;
    if (this.app.vault.getAbstractFileByPath(path)) return;
    try {
      await this.app.vault.createFolder(path);
    } catch (err2) {
      if (this.app.vault.getAbstractFileByPath(path)) return;
      throw err2;
    }
  }
  async create(content) {
    const dir = this.markersFilePath.split("/").slice(0, -1).join("/");
    await this.ensureFolderExists(dir);
    try {
      await this.app.vault.create(this.markersFilePath, content);
    } catch (err2) {
      if (this.getFileByPath(this.markersFilePath)) return;
      throw err2;
    }
  }
};
function buildLegacyTextBoxFromLayer(layer) {
  const rect = normalizeLegacyRect(layer.rect);
  const lines = normalizeLegacyLines(layer.lines);
  const finalRect = rect != null ? rect : deriveRectFromLegacyLines(lines);
  if (!finalRect) return null;
  const mode = layer.mode === "auto" ? "auto" : "custom";
  return {
    id: generateId("tbox"),
    name: typeof layer.name === "string" && layer.name.trim() ? `${layer.name} box` : "Text box",
    mode,
    rect: finalRect,
    lines,
    auto: mode === "auto" ? layer.auto : void 0,
    sourceDrawingId: typeof layer.sourceDrawingId === "string" && layer.sourceDrawingId.trim() ? layer.sourceDrawingId : void 0,
    sourceDrawingKind: layer.sourceDrawingKind === "polygon" || layer.sourceDrawingKind === "polyline" || layer.sourceDrawingKind === "rect" || layer.sourceDrawingKind === "circle" ? layer.sourceDrawingKind : void 0,
    style: layer.style,
    locked: typeof layer.locked === "boolean" ? layer.locked : void 0,
    autoFlow: typeof layer.autoFlow === "boolean" ? layer.autoFlow : void 0,
    allowAngledBaselines: typeof layer.allowAngledBaselines === "boolean" ? layer.allowAngledBaselines : void 0
  };
}
function normalizeLegacyRect(rect) {
  if (!rect) return null;
  if (!Number.isFinite(rect.x0) || !Number.isFinite(rect.y0) || !Number.isFinite(rect.x1) || !Number.isFinite(rect.y1)) {
    return null;
  }
  return {
    x0: rect.x0,
    y0: rect.y0,
    x1: rect.x1,
    y1: rect.y1
  };
}
function normalizeLegacyLines(lines) {
  if (!Array.isArray(lines)) return [];
  return lines.filter((ln2) => {
    return !!ln2 && Number.isFinite(ln2.x0) && Number.isFinite(ln2.y0) && Number.isFinite(ln2.x1) && Number.isFinite(ln2.y1);
  });
}
function deriveRectFromLegacyLines(lines) {
  if (!lines.length) return null;
  const xs = lines.flatMap((ln2) => [ln2.x0, ln2.x1]);
  const ys = lines.flatMap((ln2) => [ln2.y0, ln2.y1]);
  return {
    x0: Math.min(...xs),
    y0: Math.min(...ys),
    x1: Math.max(...xs),
    y1: Math.max(...ys)
  };
}
function isBaseImage(x2) {
  return !!x2 && typeof x2 === "object" && "path" in x2 && typeof x2.path === "string";
}

// src/markerEditor.ts
var import_obsidian2 = require("obsidian");
function tintSvgMarkup(svg, color) {
  var _a2;
  const c = color.trim();
  if (!c) return svg;
  try {
    const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
    const root = doc.querySelector("svg");
    if (!root) return svg;
    const inner = (_a2 = root.querySelector("#zm-inner")) != null ? _a2 : root;
    const base = root.querySelector("#zm-base");
    const outline = root.querySelector("#zm-outline");
    const shapes = inner.querySelectorAll("path, circle, rect, polygon, polyline, line, ellipse");
    let touched = false;
    shapes.forEach((el) => {
      var _a3, _b2;
      if (base && base.contains(el)) return;
      if (outline && outline.contains(el)) return;
      const styleFill = (_a3 = el.style) == null ? void 0 : _a3.fill;
      const styleStroke = (_b2 = el.style) == null ? void 0 : _b2.stroke;
      const fillAttr = el.getAttribute("fill");
      const strokeAttr = el.getAttribute("stroke");
      const hasFill = typeof styleFill === "string" && styleFill && styleFill.toLowerCase() !== "none" || typeof fillAttr === "string" && fillAttr && fillAttr.toLowerCase() !== "none";
      const hasStroke = typeof styleStroke === "string" && styleStroke && styleStroke.toLowerCase() !== "none" || typeof strokeAttr === "string" && strokeAttr && strokeAttr.toLowerCase() !== "none";
      if (hasFill) {
        el.style.fill = c;
        el.setAttribute("fill", c);
        touched = true;
      }
      if (hasStroke) {
        el.style.stroke = c;
        el.setAttribute("stroke", c);
        touched = true;
      }
    });
    if (!touched) {
      inner.setAttribute("fill", c);
    }
    return new XMLSerializer().serializeToString(root);
  } catch (e) {
    return svg;
  }
}
var MarkerEditorModal = class extends import_obsidian2.Modal {
  constructor(app, plugin, data, marker, onResult) {
    var _a2;
    super(app);
    this.suggestionsEl = null;
    this.allSuggestions = [];
    this.filteredSuggestions = [];
    this.selectedSuggestionIndex = -1;
    this.plugin = plugin;
    this.data = data;
    this.marker = { type: (_a2 = marker.type) != null ? _a2 : "pin", ...marker };
    this.onResult = onResult;
  }
  findSwapPresetById(id) {
    var _a2, _b2, _c;
    const cols = (_a2 = this.plugin.settings.baseCollections) != null ? _a2 : [];
    for (const col of cols) {
      const list = (_c = (_b2 = col == null ? void 0 : col.include) == null ? void 0 : _b2.swapPins) != null ? _c : [];
      const found = list.find((sp) => (sp == null ? void 0 : sp.id) === id);
      if (found && Array.isArray(found.frames)) return found;
    }
    return null;
  }
  normalizeSwapFrameIndex(m, preset) {
    const rawIndex = typeof m.swapIndex === "number" ? m.swapIndex : 0;
    const count = preset.frames.length || 1;
    return (rawIndex % count + count) % count;
  }
  cleanupSwapLinks() {
    if (this.marker.type !== "swap") return;
    const links = this.marker.swapLinks;
    if (!links || typeof links !== "object") {
      delete this.marker.swapLinks;
      return;
    }
    for (const k of Object.keys(links)) {
      const v = links[Number(k)];
      if (typeof v !== "string" || !v.trim()) delete links[Number(k)];
    }
    if (Object.keys(links).length === 0) delete this.marker.swapLinks;
  }
  buildLinkSuggestions() {
    var _a2, _b2, _c, _d;
    const files = this.app.vault.getFiles().filter((f) => {
      var _a3;
      return ((_a3 = f.extension) == null ? void 0 : _a3.toLowerCase()) === "md";
    });
    const suggestions = [];
    const active = this.app.workspace.getActiveFile();
    const fromPath = (_c = (_b2 = active == null ? void 0 : active.path) != null ? _b2 : (_a2 = files[0]) == null ? void 0 : _a2.path) != null ? _c : "";
    for (const file of files) {
      const baseLink = this.app.metadataCache.fileToLinktext(file, fromPath);
      suggestions.push({ label: baseLink, value: baseLink });
      const cache = this.app.metadataCache.getCache(file.path);
      const headings = (_d = cache == null ? void 0 : cache.headings) != null ? _d : [];
      for (const h of headings) {
        const headingName = h.heading;
        const full = `${baseLink}#${headingName}`;
        suggestions.push({
          label: `${baseLink} \u203A ${headingName}`,
          value: full
        });
      }
    }
    this.allSuggestions = suggestions;
  }
  showLinkSuggestions() {
    if (!this.suggestionsEl) return;
    this.suggestionsEl.classList.remove("is-hidden");
  }
  hideLinkSuggestions() {
    if (!this.suggestionsEl) return;
    this.suggestionsEl.classList.add("is-hidden");
    this.suggestionsEl.empty();
    this.filteredSuggestions = [];
    this.selectedSuggestionIndex = -1;
  }
  updateLinkSuggestions(input) {
    if (!this.suggestionsEl) return;
    const query = input.trim().toLowerCase();
    this.suggestionsEl.empty();
    this.filteredSuggestions = [];
    this.selectedSuggestionIndex = -1;
    if (!query) {
      this.hideLinkSuggestions();
      return;
    }
    const maxItems = 20;
    const matches = this.allSuggestions.filter(
      (s) => s.value.toLowerCase().includes(query) || s.label.toLowerCase().includes(query)
    ).slice(0, maxItems);
    if (matches.length === 0) {
      this.hideLinkSuggestions();
      return;
    }
    this.filteredSuggestions = matches;
    this.showLinkSuggestions();
    matches.forEach((s, i2) => {
      const row = this.suggestionsEl.createDiv({
        cls: "zoommap-link-suggestion-item"
      });
      row.setText(s.label);
      if (i2 === 0) {
        row.classList.add("is-selected");
        this.selectedSuggestionIndex = 0;
      }
      row.addEventListener("mousedown", (ev) => {
        ev.preventDefault();
        this.applyLinkSuggestion(i2);
      });
    });
  }
  moveLinkSuggestionSelection(delta) {
    if (!this.suggestionsEl) return;
    const n = this.filteredSuggestions.length;
    if (n === 0) return;
    let idx = this.selectedSuggestionIndex;
    if (idx < 0) idx = 0;
    idx = (idx + delta + n) % n;
    this.selectedSuggestionIndex = idx;
    const rows = this.suggestionsEl.querySelectorAll(
      ".zoommap-link-suggestion-item"
    );
    rows.forEach((row, i2) => {
      if (i2 === idx) row.classList.add("is-selected");
      else row.classList.remove("is-selected");
    });
    const sel = rows[idx];
    if (sel) sel.scrollIntoView({ block: "nearest" });
  }
  applyLinkSuggestion(index) {
    if (!this.linkInput) return;
    if (index < 0 || index >= this.filteredSuggestions.length) return;
    const s = this.filteredSuggestions[index];
    this.linkInput.setValue(s.value);
    this.marker.link = s.value;
    this.hideLinkSuggestions();
    this.linkInput.inputEl.focus();
    const len = s.value.length;
    this.linkInput.inputEl.setSelectionRange(len, len);
  }
  zoomFactorToPercentString(f) {
    if (typeof f !== "number" || !Number.isFinite(f) || f <= 0) return "";
    return String(Math.round(f * 100));
  }
  parseZoomPercentInput(input) {
    let s = input.trim();
    if (!s) return void 0;
    if (s.endsWith("%")) s = s.slice(0, -1).trim();
    s = s.replace(",", ".");
    const n = Number(s);
    if (!Number.isFinite(n) || n <= 0) return void 0;
    return n / 100;
  }
  normalizeZoomRange() {
    let min = this.marker.minZoom;
    let max2 = this.marker.maxZoom;
    if (typeof min !== "number" || !Number.isFinite(min) || min <= 0) {
      min = void 0;
    }
    if (typeof max2 !== "number" || !Number.isFinite(max2) || max2 <= 0) {
      max2 = void 0;
    }
    if (min === void 0 && max2 === void 0) {
      delete this.marker.minZoom;
      delete this.marker.maxZoom;
      return;
    }
    if (min !== void 0 && max2 !== void 0 && min > max2) {
      const tmp = min;
      min = max2;
      max2 = tmp;
    }
    if (min !== void 0) this.marker.minZoom = min;
    else delete this.marker.minZoom;
    if (max2 !== void 0) this.marker.maxZoom = max2;
    else delete this.marker.maxZoom;
  }
  onOpen() {
    var _a2, _b2, _c, _d, _e;
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", {
      text: this.marker.type === "sticker" ? "Edit sticker" : "Edit marker"
    });
    if (this.marker.type !== "sticker") {
      if (this.marker.type === "swap") {
        contentEl.createEl("h3", { text: "Swap pin (this marker only)" });
        const preset = this.marker.swapKey ? this.findSwapPresetById(this.marker.swapKey) : null;
        if (!preset) {
          contentEl.createEl("div", { text: "Swap preset not found. Cannot edit per-frame links." });
        } else {
          const idx = this.normalizeSwapFrameIndex(this.marker, preset);
          contentEl.createEl("div", { text: `Preset: ${preset.name} \u2022 Current frame: ${idx + 1}/${preset.frames.length}` });
          const overrides = (_b2 = (_a2 = this.marker).swapLinks) != null ? _b2 : _a2.swapLinks = {};
          preset.frames.forEach((fr, i2) => {
            var _a3, _b3;
            const presetLink = ((_a3 = fr.link) != null ? _a3 : "").trim();
            const iconDefault = (_b3 = this.plugin.getIconDefaultLink(fr.iconKey)) != null ? _b3 : "";
            const fallback = presetLink || iconDefault;
            const desc = fallback ? `Default: ${fallback}` : "Default: (none)";
            new import_obsidian2.Setting(contentEl).setName(`Frame ${i2 + 1}: ${fr.iconKey}`).setDesc(desc).addText((t) => {
              var _a4;
              t.setPlaceholder("Override link (optional)");
              t.setValue((_a4 = overrides[i2]) != null ? _a4 : "");
              t.onChange((v) => {
                const s = v.trim();
                if (s) overrides[i2] = s;
                else delete overrides[i2];
                if (Object.keys(overrides).length === 0) {
                  delete this.marker.swapLinks;
                } else {
                  this.marker.swapLinks = overrides;
                }
              });
            });
          });
          new import_obsidian2.Setting(contentEl).setName("Clear all overrides").setDesc("Removes per-frame overrides from this marker (falls back to preset/icon defaults).").addButton((b) => {
            b.setButtonText("Clear").onClick(() => {
              delete this.marker.swapLinks;
              this.close();
              this.onResult({ action: "save", marker: this.marker, dataChanged: false });
            });
          });
        }
      } else {
        const linkSetting = new import_obsidian2.Setting(contentEl).setName("Link").setDesc("Wiki link (without [[ ]]). Supports note and note#heading.");
        linkSetting.addText((t) => {
          var _a3;
          this.linkInput = t;
          t.setPlaceholder("Folder/note or note#heading").setValue((_a3 = this.marker.link) != null ? _a3 : "").onChange((v) => {
            this.marker.link = v.trim();
            this.updateLinkSuggestions(v);
          });
          const wrapper = t.inputEl.parentElement;
          if (wrapper instanceof HTMLElement) {
            wrapper.classList.add("zoommap-link-input-wrapper");
            this.suggestionsEl = wrapper.createDiv({
              cls: "zoommap-link-suggestions is-hidden"
            });
          }
          this.buildLinkSuggestions();
          t.inputEl.addEventListener("keydown", (ev) => {
            if (!this.suggestionsEl) return;
            if (this.suggestionsEl.classList.contains("is-hidden")) return;
            if (ev.key === "ArrowDown") {
              ev.preventDefault();
              this.moveLinkSuggestionSelection(1);
            } else if (ev.key === "ArrowUp") {
              ev.preventDefault();
              this.moveLinkSuggestionSelection(-1);
            } else if (ev.key === "Enter") {
              if (this.selectedSuggestionIndex >= 0) {
                ev.preventDefault();
                this.applyLinkSuggestion(this.selectedSuggestionIndex);
              }
            } else if (ev.key === "Escape") {
              this.hideLinkSuggestions();
            }
          });
          t.inputEl.addEventListener("blur", () => {
            window.setTimeout(() => this.hideLinkSuggestions(), 150);
          });
        });
      }
      new import_obsidian2.Setting(contentEl).setName("Tooltip always on").setDesc("Show the tooltip even if this marker has a link.").addToggle((tg) => {
        tg.setValue(!!this.marker.tooltipAlwaysOn).onChange((on) => {
          if (on) {
            this.marker.tooltipAlwaysOn = true;
          } else {
            delete this.marker.tooltipAlwaysOn;
          }
        });
      });
      let labelPosSetting = null;
      let labelOffsetXSetting = null;
      let labelOffsetYSetting = null;
      const toggleLabelExtras = () => {
        const on = !!this.marker.tooltipLabelAlways;
        labelPosSetting == null ? void 0 : labelPosSetting.settingEl.toggle(on);
        labelOffsetXSetting == null ? void 0 : labelOffsetXSetting.settingEl.toggle(on);
        labelOffsetYSetting == null ? void 0 : labelOffsetYSetting.settingEl.toggle(on);
      };
      new import_obsidian2.Setting(contentEl).setName("Tooltip label always visible").setDesc("Renders the tooltip text as a label on the map (useful for village names).").addToggle((tg) => {
        tg.setValue(!!this.marker.tooltipLabelAlways).onChange((on) => {
          if (on) {
            this.marker.tooltipLabelAlways = true;
            if (!this.marker.tooltipLabelPosition) this.marker.tooltipLabelPosition = "below";
          } else {
            delete this.marker.tooltipLabelAlways;
          }
          toggleLabelExtras();
        });
      });
      labelPosSetting = new import_obsidian2.Setting(contentEl).setName("Tooltip label position").setDesc("Where to place the always-visible label relative to the pin anchor.").addDropdown((d) => {
        var _a3;
        d.addOption("below", "Below pin");
        d.addOption("above", "Above pin");
        d.setValue((_a3 = this.marker.tooltipLabelPosition) != null ? _a3 : "below");
        d.onChange((v) => {
          this.marker.tooltipLabelPosition = v === "above" ? "above" : "below";
        });
      });
      labelOffsetXSetting = new import_obsidian2.Setting(contentEl).setName("Label offset X (px)").addText((t) => {
        t.inputEl.type = "number";
        t.setPlaceholder("0");
        t.setValue(
          typeof this.marker.tooltipLabelOffsetX === "number" ? String(this.marker.tooltipLabelOffsetX) : "0"
        );
        t.onChange((v) => {
          const n = Number(String(v).replace(",", "."));
          if (!Number.isFinite(n)) {
            delete this.marker.tooltipLabelOffsetX;
            return;
          }
          this.marker.tooltipLabelOffsetX = n;
        });
      });
      labelOffsetYSetting = new import_obsidian2.Setting(contentEl).setName("Label offset y (px)").setDesc("Positive moves the label down, negative moves it up.").addText((t) => {
        t.inputEl.type = "number";
        t.setPlaceholder("0");
        t.setValue(
          typeof this.marker.tooltipLabelOffsetY === "number" ? String(this.marker.tooltipLabelOffsetY) : "0"
        );
        t.onChange((v) => {
          const n = Number(String(v).replace(",", "."));
          if (!Number.isFinite(n)) {
            delete this.marker.tooltipLabelOffsetY;
            return;
          }
          this.marker.tooltipLabelOffsetY = n;
        });
      });
      toggleLabelExtras();
      new import_obsidian2.Setting(contentEl).setName("Tooltip").addTextArea((a) => {
        var _a3;
        a.setPlaceholder("Optional tooltip text");
        a.inputEl.rows = 3;
        a.setValue((_a3 = this.marker.tooltip) != null ? _a3 : "");
        a.onChange((v) => {
          this.marker.tooltip = v;
        });
      });
      const zoomRow = new import_obsidian2.Setting(contentEl).setName("Zoom range (optional)").setDesc("(in %)");
      zoomRow.addText((t) => {
        t.setPlaceholder("Min (%)");
        t.setValue(this.zoomFactorToPercentString(this.marker.minZoom));
        t.onChange((v) => {
          const factor = this.parseZoomPercentInput(v);
          if (typeof factor === "number") this.marker.minZoom = factor;
          else delete this.marker.minZoom;
        });
      });
      zoomRow.addText((t) => {
        t.setPlaceholder("Max (%)");
        t.setValue(this.zoomFactorToPercentString(this.marker.maxZoom));
        t.onChange((v) => {
          const factor = this.parseZoomPercentInput(v);
          if (typeof factor === "number") this.marker.maxZoom = factor;
          else delete this.marker.maxZoom;
        });
      });
      new import_obsidian2.Setting(contentEl).setName("Scale like sticker").setDesc("Pin scales with the map (no inverse wrapper).").addToggle((tg) => {
        tg.setValue(!!this.marker.scaleLikeSticker).onChange((on) => {
          if (on) this.marker.scaleLikeSticker = true;
          else delete this.marker.scaleLikeSticker;
        });
      });
      if (this.marker.type !== "swap") {
        new import_obsidian2.Setting(contentEl).setName("Icon").setDesc("To set up new icons go to settings.").addDropdown((d) => {
          var _a3, _b3;
          const sortedIcons = [...(_a3 = this.plugin.settings.icons) != null ? _a3 : []].sort(
            (a, b) => {
              var _a4, _b4;
              return String((_a4 = a.key) != null ? _a4 : "").localeCompare(String((_b4 = b.key) != null ? _b4 : ""), void 0, {
                sensitivity: "base",
                numeric: true
              });
            }
          );
          for (const icon of sortedIcons) d.addOption(icon.key, icon.key);
          d.setValue((_b3 = this.marker.iconKey) != null ? _b3 : this.plugin.settings.defaultIconKey);
          d.onChange((v) => {
            this.marker.iconKey = v;
            updatePreview();
          });
        });
      }
      const colorRow = new import_obsidian2.Setting(contentEl).setName("Icon color").setDesc("Overrides the icon color for this marker (SVG icons only).");
      let colorTextEl;
      const colorPickerEl = colorRow.controlEl.createEl("input", {
        attr: {
          type: "color",
          style: "margin-left:8px; vertical-align: middle;"
        }
      });
      colorRow.addText((t) => {
        var _a3;
        t.setPlaceholder("#d23c3c");
        t.setValue((_a3 = this.marker.iconColor) != null ? _a3 : "");
        colorTextEl = t.inputEl;
        t.onChange((v) => {
          const c = v.trim();
          this.marker.iconColor = c || void 0;
          updatePreview();
        });
      });
      const existing = this.marker.iconColor;
      if (existing && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(existing)) {
        if (existing.length === 4) {
          const r = existing[1];
          const g = existing[2];
          const b = existing[3];
          colorPickerEl.value = `#${r}${r}${g}${g}${b}${b}`;
        } else {
          colorPickerEl.value = existing;
        }
      }
      colorPickerEl.oninput = () => {
        const c = colorPickerEl.value;
        colorTextEl.value = c;
        this.marker.iconColor = c;
        updatePreview();
      };
    }
    let newLayerName = "";
    const isExistingMarker = ((_c = this.data.markers) != null ? _c : []).some(
      (m) => m.id === this.marker.id
    );
    if (this.plugin.settings.preferActiveLayerInEditor && !isExistingMarker) {
      const active = (_e = (_d = this.data.layers.find((l) => l.visible && !l.locked)) != null ? _d : this.data.layers.find((l) => l.visible)) != null ? _e : this.data.layers[0];
      if (active) {
        this.marker.layer = active.id;
      }
    }
    new import_obsidian2.Setting(contentEl).setName("Layer").setDesc("Choose an existing layer or type a new name.").addDropdown((d) => {
      var _a3, _b3, _c2, _d2, _e2, _f;
      for (const l of this.data.layers) d.addOption(l.name, l.name);
      const current = (_f = (_e2 = (_c2 = (_a3 = this.data.layers.find((l) => l.id === this.marker.layer)) == null ? void 0 : _a3.name) != null ? _c2 : (_b3 = this.data.layers.find((l) => l.visible && !l.locked)) == null ? void 0 : _b3.name) != null ? _e2 : (_d2 = this.data.layers.find((l) => l.visible)) == null ? void 0 : _d2.name) != null ? _f : this.data.layers[0].name;
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
        var _a3;
        t.setPlaceholder("64");
        t.setValue(String((_a3 = this.marker.stickerSize) != null ? _a3 : 64));
        t.onChange((v) => {
          const n = Number(v);
          if (Number.isFinite(n) && n > 0) {
            this.marker.stickerSize = Math.round(n);
            updatePreview();
          }
        });
      });
    }
    new import_obsidian2.Setting(contentEl).setName("Size override (px)").setDesc("Overrides the icon default size and the map-wide pin size override for this marker only.").addText((t) => {
      t.setPlaceholder("Use icon default");
      t.inputEl.type = "number";
      t.setValue(
        typeof this.marker.sizeOverride === "number" && Number.isFinite(this.marker.sizeOverride) ? String(this.marker.sizeOverride) : ""
      );
      t.onChange((v) => {
        const n = Number(String(v).replace(",", "."));
        if (Number.isFinite(n) && n > 0) this.marker.sizeOverride = Math.round(n);
        else delete this.marker.sizeOverride;
      });
    });
    const preview = contentEl.createDiv({ cls: "zoommap-modal-preview" });
    preview.createSpan({ text: "Preview:" });
    const img = preview.createEl("img");
    const resolvePreview = () => {
      var _a3, _b3, _c2, _d2, _e2, _f;
      if (this.marker.type === "sticker") {
        let url2 = (_a3 = this.marker.stickerPath) != null ? _a3 : "";
        if (url2 && !url2.startsWith("data:")) {
          const file = this.app.vault.getAbstractFileByPath(url2);
          if (file instanceof import_obsidian2.TFile) {
            url2 = this.app.vault.getResourcePath(file);
          }
        }
        const size2 = Math.max(1, Math.round((_b3 = this.marker.stickerSize) != null ? _b3 : 64));
        return {
          url: url2,
          size: size2
        };
      }
      if (this.marker.type === "swap" && this.marker.swapKey) {
        const preset = this.findSwapPresetById(this.marker.swapKey);
        if (preset && preset.frames.length) {
          const idx = this.normalizeSwapFrameIndex(this.marker, preset);
          const frame = preset.frames[idx];
          const key = (frame == null ? void 0 : frame.iconKey) || this.plugin.settings.defaultIconKey;
          const baseIcon2 = (_c2 = this.plugin.settings.icons.find((i2) => i2.key === key)) != null ? _c2 : this.plugin.builtinIcon();
          const size2 = typeof this.marker.sizeOverride === "number" && Number.isFinite(this.marker.sizeOverride) && this.marker.sizeOverride > 0 ? Math.round(this.marker.sizeOverride) : baseIcon2.size;
          let url2 = baseIcon2.pathOrDataUrl;
          const color2 = (_d2 = this.marker.iconColor) == null ? void 0 : _d2.trim();
          if (color2 && url2 && url2.startsWith("data:image/svg+xml")) {
            const comma = url2.indexOf(",");
            if (comma >= 0) {
              try {
                const header = url2.slice(0, comma + 1);
                const payload = url2.slice(comma + 1);
                const svg = decodeURIComponent(payload);
                const tinted = tintSvgMarkup(svg, color2);
                url2 = header + encodeURIComponent(tinted);
              } catch (e) {
              }
            }
          }
          if (url2 && !url2.startsWith("data:")) {
            const file = this.app.vault.getAbstractFileByPath(url2);
            if (file instanceof import_obsidian2.TFile) url2 = this.app.vault.getResourcePath(file);
          }
          return { url: url2, size: size2 };
        }
      }
      const baseIcon = (_e2 = this.plugin.settings.icons.find(
        (i2) => {
          var _a4;
          return i2.key === ((_a4 = this.marker.iconKey) != null ? _a4 : this.plugin.settings.defaultIconKey);
        }
      )) != null ? _e2 : this.plugin.builtinIcon();
      const size = typeof this.marker.sizeOverride === "number" && Number.isFinite(this.marker.sizeOverride) && this.marker.sizeOverride > 0 ? Math.round(this.marker.sizeOverride) : baseIcon.size;
      let url = baseIcon.pathOrDataUrl;
      const color = (_f = this.marker.iconColor) == null ? void 0 : _f.trim();
      if (color && url && url.startsWith("data:image/svg+xml")) {
        const idx = url.indexOf(",");
        if (idx >= 0) {
          try {
            const header = url.slice(0, idx + 1);
            const payload = url.slice(idx + 1);
            const svg = decodeURIComponent(payload);
            const tinted = tintSvgMarkup(svg, color);
            url = header + encodeURIComponent(tinted);
          } catch (e) {
          }
        }
      }
      if (url && !url.startsWith("data:")) {
        const file = this.app.vault.getAbstractFileByPath(url);
        if (file instanceof import_obsidian2.TFile) {
          url = this.app.vault.getResourcePath(file);
        }
      }
      return { url, size };
    };
    const updatePreview = () => {
      const { url, size } = resolvePreview();
      img.src = url || "";
      img.style.width = `${size}px`;
      img.style.height = `${size}px`;
    };
    updatePreview();
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
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
          this.data.layers.push({
            id,
            name: newLayerName,
            visible: true
          });
          this.marker.layer = id;
          dataChanged = true;
        }
      }
      if (this.marker.type !== "sticker") {
        this.normalizeZoomRange();
        if (typeof this.marker.minZoom !== "number") delete this.marker.minZoom;
        if (typeof this.marker.maxZoom !== "number") delete this.marker.maxZoom;
        if (!this.marker.scaleLikeSticker) delete this.marker.scaleLikeSticker;
        if (!this.marker.iconColor) delete this.marker.iconColor;
        if (!this.marker.tooltipAlwaysOn) delete this.marker.tooltipAlwaysOn;
        if (!this.marker.tooltipLabelAlways) delete this.marker.tooltipLabelAlways;
        if (this.marker.tooltipLabelAlways && !this.marker.tooltipLabelPosition) this.marker.tooltipLabelPosition = "below";
        if (!this.marker.tooltipLabelAlways) delete this.marker.tooltipLabelPosition;
        if (typeof this.marker.sizeOverride !== "number" || !Number.isFinite(this.marker.sizeOverride) || this.marker.sizeOverride <= 0) delete this.marker.sizeOverride;
        const normOffset = (x2) => {
          if (typeof x2 !== "number" || !Number.isFinite(x2)) return void 0;
          if (Math.abs(x2) < 1e-9) return void 0;
          return x2;
        };
        const ox = normOffset(this.marker.tooltipLabelOffsetX);
        const oy = normOffset(this.marker.tooltipLabelOffsetY);
        if (ox === void 0) delete this.marker.tooltipLabelOffsetX;
        else this.marker.tooltipLabelOffsetX = ox;
        if (oy === void 0) delete this.marker.tooltipLabelOffsetY;
        else this.marker.tooltipLabelOffsetY = oy;
      }
      if (this.marker.type === "swap") {
        this.cleanupSwapLinks();
      }
      this.close();
      this.onResult({
        action: "save",
        marker: this.marker,
        dataChanged
      });
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
  constructor(app, pxDistance, onOk, options) {
    super(app);
    this.inputValue = "1";
    this.unit = "km";
    this.pxDistance = pxDistance;
    this.onOk = onOk;
    this.options = options != null ? options : {};
    if (this.options.initialUnit) this.unit = this.options.initialUnit;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Calibrate scale" });
    contentEl.createEl("div", {
      text: `Measured pixel distance: ${this.pxDistance.toFixed(1)} px`
    });
    new import_obsidian3.Setting(contentEl).setName("Real world length").addText((t) => {
      t.setPlaceholder("Example 2");
      t.setValue(this.inputValue);
      t.onChange((v) => {
        this.inputValue = v.trim();
      });
    }).addDropdown((d) => {
      var _a2, _b2, _c;
      d.addOption("m", "Meters");
      d.addOption("km", "Kilometers");
      d.addOption("mi", "Miles");
      d.addOption("ft", "Feet");
      const customUnits = ((_a2 = this.options.customUnits) != null ? _a2 : []).filter((u) => !!u && typeof u.id === "string" && u.id.trim().length > 0).slice().sort((a, b) => {
        var _a3, _b3;
        return ((_a3 = a.name) != null ? _a3 : a.id).localeCompare((_b3 = b.name) != null ? _b3 : b.id);
      });
      for (const u of customUnits) {
        const base = ((_b2 = u.name) != null ? _b2 : "").trim() || "Custom unit";
        const abbr = ((_c = u.abbreviation) != null ? _c : "").trim();
        const label = abbr ? `${base} (${abbr})` : base;
        d.addOption(`custom:${u.id}`, label);
      }
      const hasOption = (v) => Array.from(d.selectEl.options).some((o) => o.value === v);
      const initial = hasOption(String(this.unit)) ? String(this.unit) : "km";
      d.setValue(initial);
      d.onChange((v) => {
        this.unit = v;
      });
    });
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const ok = footer.createEl("button", { text: "Save" });
    const cancel = footer.createEl("button", { text: "Cancel" });
    ok.addEventListener("click", () => {
      const val = Number(this.inputValue.replace(",", "."));
      if (!Number.isFinite(val) || val <= 0 || this.pxDistance <= 0) {
        this.close();
        return;
      }
      if (typeof this.unit === "string" && this.unit.startsWith("custom:")) {
        const id = this.unit.slice("custom:".length).trim();
        const pxPerUnit = this.pxDistance / val;
        this.close();
        this.onOk({
          unit: this.unit,
          customUnitId: id,
          pixelsPerUnit: pxPerUnit
        });
        return;
      }
      const meters = this.toMeters(val, this.unit);
      const mpp = meters / this.pxDistance;
      this.close();
      this.onOk({
        unit: this.unit,
        metersPerPixel: mpp
      });
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
      case "m":
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
  async ensureExists(initialImagePath, size, markerLayerNames) {
    const { file } = await this.readNote();
    const baseLayers = markerLayerNames && markerLayerNames.length > 0 ? markerLayerNames.map((name, idx) => ({
      id: idx === 0 ? "default" : `layer_${idx}`,
      name: name || "Layer",
      visible: true,
      locked: false
    })) : [{ id: "default", name: "Default", visible: true, locked: false }];
    const data = {
      size,
      layers: baseLayers,
      markers: [],
      bases: initialImagePath ? [initialImagePath] : [],
      overlays: [],
      activeBase: initialImagePath != null ? initialImagePath : "",
      measurement: {
        displayUnit: "km",
        metersPerPixel: void 0,
        scales: {},
        customUnitId: void 0,
        customUnitPxPerUnit: {},
        travelTimePresetIds: [],
        travelDaysEnabled: false,
        travelDayPresetId: void 0
      },
      frame: void 0,
      pinSizeOverrides: {},
      grids: [],
      panClamp: true,
      drawLayers: [],
      drawings: [],
      textLayers: [],
      secondScreen: { showGrids: true }
    };
    const payload = JSON.stringify(sanitizeMarkerFileDataForSave(data), null, 2);
    const header = this.headerLine();
    const footer = this.footerLine();
    const block = `
%%
${header}
${payload}
${footer}
%%
`;
    await this.app.vault.process(file, (text) => {
      if (this.findBlock(text)) return text;
      let insertAt = text.length;
      if (typeof this.insertAfterLine === "number") {
        const lines = text.split("\n");
        const before = lines.slice(0, this.insertAfterLine + 1).join("\n");
        insertAt = before.length;
      }
      return text.slice(0, insertAt) + block + text.slice(insertAt);
    });
  }
  async load() {
    const { text } = await this.readNote();
    const blk = this.findBlock(text);
    if (!blk) throw new Error("Inline marker block not found.");
    const raw = text.slice(blk.jsonStart, blk.jsonEnd + 1).trim();
    return JSON.parse(raw);
  }
  async save(data) {
    const { file } = await this.readNote();
    const header = this.headerLine();
    const footer = this.footerLine();
    const payload = JSON.stringify(sanitizeMarkerFileDataForSave(data), null, 2);
    await this.app.vault.process(file, (text) => {
      const blk = this.findBlock(text);
      const replacement = `${header}
${payload}
${footer}
`;
      if (blk) {
        return text.slice(0, blk.start) + replacement + text.slice(blk.end);
      } else {
        return `${text}
%%
${header}
${payload}
${footer}
%%
`;
      }
    });
  }
  async wouldChange(data) {
    try {
      const cur = await this.load();
      const a = JSON.stringify(sanitizeMarkerFileDataForSave(cur), null, 2);
      const b = JSON.stringify(sanitizeMarkerFileDataForSave(data), null, 2);
      return a !== b;
    } catch (e) {
      return true;
    }
  }
};

// src/drawingEditorModal.ts
var import_obsidian6 = require("obsidian");

// src/markdownFileSuggest.ts
var import_obsidian5 = require("obsidian");
var MarkdownFileSuggestModal = class extends import_obsidian5.FuzzySuggestModal {
  constructor(app, onChoose) {
    super(app);
    this.appRef = app;
    this.onChoose = onChoose;
    this.files = this.appRef.vault.getFiles().filter((f) => {
      var _a2;
      return ((_a2 = f.extension) == null ? void 0 : _a2.toLowerCase()) === "md";
    }).sort((a, b) => a.path.localeCompare(b.path));
    this.setPlaceholder("Choose note\u2026");
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

// src/drawingEditorModal.ts
var DrawingEditorModal = class extends import_obsidian6.Modal {
  constructor(app, drawing, drawLayers, onResult) {
    var _a2, _b2, _c;
    super(app);
    this.allLinkSuggestions = [];
    this.allowClose = false;
    this.original = drawing;
    this.drawLayers = Array.isArray(drawLayers) ? drawLayers.map((l) => ({ id: l.id, name: l.name })) : [];
    this.working = JSON.parse(JSON.stringify(drawing));
    this.onResult = onResult;
    (_b2 = (_a2 = this.working).style) != null ? _b2 : _a2.style = {
      strokeColor: "#ff0000",
      strokeWidth: 2
    };
    if (this.working.layerId && !this.drawLayers.some((l) => l.id === this.working.layerId)) {
      this.drawLayers.unshift({ id: this.working.layerId, name: "Current layer" });
    }
    const s = this.working.style;
    const isPolyline = this.working.kind === "polyline";
    if (!s.strokeColor) s.strokeColor = "#ff0000";
    if (!Number.isFinite(s.strokeWidth) || s.strokeWidth <= 0) s.strokeWidth = 2;
    if (typeof s.strokeOpacity !== "number") s.strokeOpacity = 1;
    if (isPolyline) {
      if (typeof s.arrowEnd !== "boolean") s.arrowEnd = true;
      if (typeof s.distanceLabel !== "boolean") s.distanceLabel = true;
      delete s.fillColor;
      delete s.fillOpacity;
      delete s.fillPattern;
      delete s.fillPatternAngle;
      delete s.fillPatternSpacing;
      delete s.fillPatternStrokeWidth;
      delete s.fillPatternOpacity;
      return;
    }
    if (!s.fillColor) s.fillColor = "#ff0000";
    if (typeof s.fillOpacity !== "number") s.fillOpacity = 0.15;
    if (!s.fillPattern) s.fillPattern = s.fillColor ? "solid" : "none";
    if (typeof s.fillPatternAngle !== "number") s.fillPatternAngle = 45;
    if (typeof s.fillPatternSpacing !== "number" || s.fillPatternSpacing <= 0) {
      s.fillPatternSpacing = 8;
    }
    if (typeof s.fillPatternStrokeWidth !== "number" || s.fillPatternStrokeWidth <= 0) {
      s.fillPatternStrokeWidth = 1;
    }
    if (typeof s.fillPatternOpacity !== "number") {
      s.fillPatternOpacity = (_c = s.fillOpacity) != null ? _c : 0.15;
    }
  }
  close() {
    if (!this.allowClose) return;
    super.close();
  }
  closeByAction() {
    this.allowClose = true;
    super.close();
  }
  onOpen() {
    var _a2, _b2, _c, _d;
    const { contentEl } = this;
    contentEl.empty();
    const canBeRegion = this.working.kind !== "polyline";
    const isPolyline = this.working.kind === "polyline";
    this.buildLinkSuggestions();
    contentEl.createEl("h2", { text: isPolyline ? "Edit polyline" : "Edit drawing" });
    const style = this.working.style;
    if (!isPolyline) {
      new import_obsidian6.Setting(contentEl).setName("Label").addText((t) => {
        var _a3;
        t.setPlaceholder("Label");
        t.setValue((_a3 = style.label) != null ? _a3 : "");
        t.inputEl.classList.add("zoommap-drawing-editor__label-input");
        t.onChange((v) => {
          style.label = v.trim() || void 0;
        });
      });
    }
    this.renderLayerSetting(contentEl);
    const strokeHeading = contentEl.createDiv({
      cls: "zoommap-drawing-editor__section-heading"
    });
    strokeHeading.textContent = "Stroke";
    const strokePatternSetting = new import_obsidian6.Setting(contentEl).setName("Pattern");
    strokePatternSetting.addDropdown((dd) => {
      dd.addOption("solid", "Solid");
      dd.addOption("dashed", "Dashed");
      dd.addOption("dotted", "Dotted");
      const dash = style.strokeDash;
      let current = "solid";
      if (Array.isArray(dash) && dash.length > 0) {
        current = dash[0] <= 3 ? "dotted" : "dashed";
      }
      dd.setValue(current);
      dd.onChange((v) => {
        if (v === "solid") {
          style.strokeDash = void 0;
        } else if (v === "dashed") {
          style.strokeDash = [8, 4];
        } else {
          style.strokeDash = [2, 4];
        }
      });
    });
    const strokeColorSetting = new import_obsidian6.Setting(contentEl).setName("Color");
    const strokeColorText = strokeColorSetting.controlEl.createEl("input", {
      type: "text"
    });
    strokeColorText.classList.add("zoommap-drawing-editor__color-text");
    strokeColorText.value = (_a2 = style.strokeColor) != null ? _a2 : "#ff0000";
    const strokeColorPicker = strokeColorSetting.controlEl.createEl("input", {
      type: "color"
    });
    strokeColorPicker.classList.add("zoommap-drawing-editor__color-picker");
    strokeColorPicker.value = this.normalizeHex((_b2 = style.strokeColor) != null ? _b2 : "#ff0000");
    strokeColorText.oninput = () => {
      const val = strokeColorText.value.trim() || "#ff0000";
      style.strokeColor = val;
      if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) {
        strokeColorPicker.value = this.normalizeHex(val);
      }
    };
    strokeColorPicker.oninput = () => {
      const hex = strokeColorPicker.value;
      strokeColorText.value = hex;
      style.strokeColor = hex;
    };
    new import_obsidian6.Setting(contentEl).setName("Width").addText((t) => {
      var _a3;
      t.inputEl.type = "number";
      t.inputEl.classList.add("zoommap-drawing-editor__num-input");
      t.setValue(String((_a3 = style.strokeWidth) != null ? _a3 : 2));
      t.onChange((v) => {
        const n = Number(v);
        if (Number.isFinite(n) && n > 0) {
          style.strokeWidth = n;
        }
      });
    });
    new import_obsidian6.Setting(contentEl).setName("Opacity").addText((t) => {
      t.inputEl.type = "number";
      t.inputEl.classList.add("zoommap-drawing-editor__num-input");
      t.setPlaceholder("100");
      t.setValue(this.toPercent(style.strokeOpacity, 100));
      t.onChange((v) => {
        const n = Number(v);
        if (!Number.isFinite(n)) {
          style.strokeOpacity = void 0;
          return;
        }
        const clamped = this.clamp(n, 0, 100);
        style.strokeOpacity = clamped / 100;
      });
    });
    if (isPolyline) {
      new import_obsidian6.Setting(contentEl).setName("Arrow at end").addToggle((tg) => {
        tg.setValue(!!style.arrowEnd).onChange((on) => {
          style.arrowEnd = on ? true : void 0;
        });
      });
      new import_obsidian6.Setting(contentEl).setName("Distance label").setDesc("Uses the current map scale + unit settings.").addToggle((tg) => {
        tg.setValue(!!style.distanceLabel).onChange((on) => {
          style.distanceLabel = on ? true : void 0;
        });
      });
      const footer2 = contentEl.createDiv({ cls: "zoommap-modal-footer" });
      const saveBtn2 = footer2.createEl("button", { text: "Save" });
      const deleteBtn2 = footer2.createEl("button", { text: "Delete" });
      const cancelBtn2 = footer2.createEl("button", { text: "Cancel" });
      saveBtn2.onclick = () => {
        this.normalizeStyle(this.working);
        this.working.id = this.original.id;
        this.working.kind = this.original.kind;
        this.working.rect = this.original.rect;
        this.working.circle = this.original.circle;
        this.working.polygon = this.original.polygon;
        this.working.polyline = this.original.polyline;
        this.closeByAction();
        this.onResult({ action: "save", drawing: this.working });
      };
      deleteBtn2.onclick = () => {
        this.closeByAction();
        this.onResult({ action: "delete" });
      };
      cancelBtn2.onclick = () => {
        this.closeByAction();
        this.onResult({ action: "cancel" });
      };
      return;
    }
    const fillHeading = contentEl.createDiv({
      cls: "zoommap-drawing-editor__section-heading"
    });
    fillHeading.textContent = "Fill";
    const fillPatternSetting = new import_obsidian6.Setting(contentEl).setName("Pattern");
    fillPatternSetting.addDropdown((dd) => {
      var _a3;
      dd.addOption("none", "None");
      dd.addOption("solid", "Solid");
      dd.addOption("striped", "Striped");
      dd.addOption("cross", "Cross");
      dd.addOption("wavy", "Wavy");
      const current = (_a3 = style.fillPattern) != null ? _a3 : style.fillColor ? "solid" : "none";
      dd.setValue(current);
      dd.onChange((v) => {
        const kind = v;
        style.fillPattern = kind;
      });
    });
    const fillColorSetting = new import_obsidian6.Setting(contentEl).setName("Base color");
    const fillColorText = fillColorSetting.controlEl.createEl("input", {
      type: "text"
    });
    fillColorText.classList.add("zoommap-drawing-editor__color-text");
    fillColorText.value = (_c = style.fillColor) != null ? _c : "#ff0000";
    const fillColorPicker = fillColorSetting.controlEl.createEl("input", {
      type: "color"
    });
    fillColorPicker.classList.add("zoommap-drawing-editor__color-picker");
    fillColorPicker.value = this.normalizeHex((_d = style.fillColor) != null ? _d : "#ff0000");
    fillColorText.oninput = () => {
      const val = fillColorText.value.trim();
      if (!val) {
        style.fillColor = void 0;
        return;
      }
      style.fillColor = val;
      if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) {
        fillColorPicker.value = this.normalizeHex(val);
      }
    };
    fillColorPicker.oninput = () => {
      const hex = fillColorPicker.value;
      fillColorText.value = hex;
      style.fillColor = hex;
    };
    new import_obsidian6.Setting(contentEl).setName("Base opacity").addText((t) => {
      t.inputEl.type = "number";
      t.inputEl.classList.add("zoommap-drawing-editor__num-input");
      t.setPlaceholder("15");
      t.setValue(this.toPercent(style.fillOpacity, ""));
      t.onChange((v) => {
        const n = Number(v);
        if (!Number.isFinite(n)) {
          style.fillOpacity = void 0;
          return;
        }
        const clamped = this.clamp(n, 0, 100);
        style.fillOpacity = clamped / 100;
      });
    });
    new import_obsidian6.Setting(contentEl).setName("Spacing").addText((t) => {
      var _a3;
      t.inputEl.type = "number";
      t.inputEl.classList.add("zoommap-drawing-editor__num-input");
      t.setPlaceholder("8");
      t.setValue(String((_a3 = style.fillPatternSpacing) != null ? _a3 : 8));
      t.onChange((v) => {
        const n = Number(v);
        if (!Number.isFinite(n) || n <= 0) {
          style.fillPatternSpacing = void 0;
          return;
        }
        style.fillPatternSpacing = n;
      });
    });
    new import_obsidian6.Setting(contentEl).setName("Angle").addText((t) => {
      var _a3;
      t.inputEl.type = "number";
      t.inputEl.classList.add("zoommap-drawing-editor__num-input");
      t.setPlaceholder("45");
      t.setValue(String((_a3 = style.fillPatternAngle) != null ? _a3 : 45));
      t.onChange((v) => {
        const n = Number(v);
        if (!Number.isFinite(n)) {
          style.fillPatternAngle = void 0;
          return;
        }
        style.fillPatternAngle = n;
      });
    });
    new import_obsidian6.Setting(contentEl).setName("Line width").addText((t) => {
      var _a3;
      t.inputEl.type = "number";
      t.inputEl.classList.add("zoommap-drawing-editor__num-input");
      t.setPlaceholder("1");
      t.setValue(String((_a3 = style.fillPatternStrokeWidth) != null ? _a3 : 1));
      t.onChange((v) => {
        const n = Number(v);
        if (!Number.isFinite(n) || n <= 0) {
          style.fillPatternStrokeWidth = void 0;
          return;
        }
        style.fillPatternStrokeWidth = n;
      });
    });
    new import_obsidian6.Setting(contentEl).setName("Pattern opacity").addText((t) => {
      t.inputEl.type = "number";
      t.inputEl.classList.add("zoommap-drawing-editor__num-input");
      t.setPlaceholder("15");
      t.setValue(this.toPercent(style.fillPatternOpacity, ""));
      t.onChange((v) => {
        const n = Number(v);
        if (!Number.isFinite(n)) {
          style.fillPatternOpacity = void 0;
          return;
        }
        const clamped = this.clamp(n, 0, 100);
        style.fillPatternOpacity = clamped / 100;
      });
    });
    if (canBeRegion) {
      const regionHeading = contentEl.createDiv({
        cls: "zoommap-drawing-editor__section-heading"
      });
      regionHeading.textContent = "Region interaction";
      let regionLinkInput = null;
      new import_obsidian6.Setting(contentEl).setName("Region link").setDesc("Optional wiki link that opens when the region is clicked.").addText((t) => {
        var _a3;
        t.setPlaceholder("Note or note#heading");
        t.setValue((_a3 = style.regionLink) != null ? _a3 : "");
        regionLinkInput = t.inputEl;
        t.onChange((v) => {
          style.regionLink = v.trim() || void 0;
        });
        this.attachLinkAutocomplete(
          t.inputEl,
          () => {
            var _a4;
            return (_a4 = style.regionLink) != null ? _a4 : "";
          },
          (val) => {
            style.regionLink = val.trim() || void 0;
            t.inputEl.value = val;
          }
        );
      }).addButton((b) => {
        b.setButtonText("Pick\u2026").onClick(() => {
          new MarkdownFileSuggestModal(this.app, (file) => {
            var _a3;
            const active = this.app.workspace.getActiveFile();
            const fromPath = (_a3 = active == null ? void 0 : active.path) != null ? _a3 : file.path;
            const link = this.app.metadataCache.fileToLinktext(file, fromPath);
            style.regionLink = link;
            if (regionLinkInput) regionLinkInput.value = link;
          }).open();
        });
      });
      new import_obsidian6.Setting(contentEl).setName("Region tooltip").setDesc("Optional tooltip shown when hovering the region.").addTextArea((a) => {
        var _a3;
        a.inputEl.rows = 3;
        a.setPlaceholder("Region tooltip");
        a.setValue((_a3 = style.regionTooltip) != null ? _a3 : "");
        a.onChange((v) => {
          style.regionTooltip = v.trim() || void 0;
        });
      });
      new import_obsidian6.Setting(contentEl).setName("Hover preview popover").setDesc("If disabled, the region link stays clickable but no hover preview popover is opened.").addToggle((tg) => {
        tg.setValue(style.regionHoverPreview !== false).onChange((on) => {
          style.regionHoverPreview = on ? true : false;
        });
      });
      new import_obsidian6.Setting(contentEl).setName("Hide visual shape").setDesc("Makes the shape invisible, but keeps the region interactive for tooltip/link.").addToggle((tg) => {
        tg.setValue(!!style.regionInvisible).onChange((on) => {
          style.regionInvisible = on ? true : void 0;
        });
      });
    }
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const saveBtn = footer.createEl("button", { text: "Save" });
    const deleteBtn = footer.createEl("button", { text: "Delete" });
    const cancelBtn = footer.createEl("button", { text: "Cancel" });
    saveBtn.onclick = () => {
      this.normalizeStyle(this.working);
      this.working.id = this.original.id;
      this.working.kind = this.original.kind;
      this.working.rect = this.original.rect;
      this.working.circle = this.original.circle;
      this.working.polygon = this.original.polygon;
      this.working.polyline = this.original.polyline;
      this.closeByAction();
      this.onResult({ action: "save", drawing: this.working });
    };
    deleteBtn.onclick = () => {
      this.closeByAction();
      this.onResult({ action: "delete" });
    };
    cancelBtn.onclick = () => {
      this.closeByAction();
      this.onResult({ action: "cancel" });
    };
  }
  onClose() {
    this.contentEl.empty();
  }
  normalizeHex(v) {
    if (!v.startsWith("#")) return v;
    if (v.length === 4) {
      const r = v[1];
      const g = v[2];
      const b = v[3];
      return `#${r}${r}${g}${g}${b}${b}`;
    }
    return v;
  }
  buildLinkSuggestions() {
    var _a2, _b2, _c, _d;
    const files = this.app.vault.getFiles().filter((f) => {
      var _a3;
      return ((_a3 = f.extension) == null ? void 0 : _a3.toLowerCase()) === "md";
    });
    const suggestions = [];
    const active = this.app.workspace.getActiveFile();
    const fromPath = (_c = (_b2 = active == null ? void 0 : active.path) != null ? _b2 : (_a2 = files[0]) == null ? void 0 : _a2.path) != null ? _c : "";
    for (const file of files) {
      const base = this.app.metadataCache.fileToLinktext(file, fromPath);
      suggestions.push({ label: base, value: base });
      const cache = this.app.metadataCache.getCache(file.path);
      const headings = (_d = cache == null ? void 0 : cache.headings) != null ? _d : [];
      for (const h of headings) {
        const heading = h.heading;
        const full = `${base}#${heading}`;
        suggestions.push({
          label: `${base} \u203A ${heading}`,
          value: full
        });
      }
    }
    this.allLinkSuggestions = suggestions;
  }
  attachLinkAutocomplete(input, getValue, setValue) {
    const wrapper = input.parentElement;
    if (!(wrapper instanceof HTMLElement)) return;
    wrapper.classList.add("zoommap-link-input-wrapper");
    const listEl = wrapper.createDiv({
      cls: "zoommap-link-suggestions is-hidden"
    });
    const hide = () => listEl.classList.add("is-hidden");
    const show = () => listEl.classList.remove("is-hidden");
    const update = (query) => {
      const q = query.trim().toLowerCase();
      listEl.empty();
      if (!q) {
        hide();
        return;
      }
      const matches = this.allLinkSuggestions.filter(
        (s) => s.value.toLowerCase().includes(q) || s.label.toLowerCase().includes(q)
      ).slice(0, 20);
      if (!matches.length) {
        hide();
        return;
      }
      show();
      for (const s of matches) {
        const row = listEl.createDiv({
          cls: "zoommap-link-suggestion-item"
        });
        row.setText(s.label);
        row.addEventListener("mousedown", (ev) => {
          ev.preventDefault();
          setValue(s.value);
          hide();
        });
      }
    };
    input.addEventListener("input", () => update(input.value));
    input.addEventListener("focus", () => update(getValue()));
    input.addEventListener("blur", () => {
      window.setTimeout(hide, 150);
    });
    hide();
  }
  renderLayerSetting(container) {
    if (!this.drawLayers.length) return;
    new import_obsidian6.Setting(container).setName("Draw layer").setDesc("Choose the draw layer for this drawing.").addDropdown((dd) => {
      var _a2, _b2;
      for (const layer of this.drawLayers) {
        dd.addOption(layer.id, layer.name || layer.id);
      }
      const fallback = (_b2 = (_a2 = this.drawLayers[0]) == null ? void 0 : _a2.id) != null ? _b2 : this.working.layerId;
      dd.setValue(this.working.layerId || fallback);
      dd.onChange((v) => {
        this.working.layerId = v;
      });
    });
  }
  clamp(v, min, max2) {
    return Math.min(max2, Math.max(min, v));
  }
  toPercent(value, fallback) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return String(fallback);
    }
    return String(Math.round(value * 100));
  }
  normalizeStyle(drawing) {
    var _a2, _b2;
    const style = drawing.style;
    if (!style.strokeColor) style.strokeColor = "#ff0000";
    if (!Number.isFinite(style.strokeWidth) || style.strokeWidth <= 0) {
      style.strokeWidth = 2;
    }
    if (typeof style.strokeOpacity === "number") {
      style.strokeOpacity = this.clamp(style.strokeOpacity, 0, 1);
      if (style.strokeOpacity === 1) delete style.strokeOpacity;
    }
    if (drawing.kind === "polyline") {
      if (!style.arrowEnd) delete style.arrowEnd;
      if (!style.distanceLabel) delete style.distanceLabel;
      delete style.fillPattern;
      delete style.fillColor;
      delete style.fillOpacity;
      delete style.fillPatternSpacing;
      delete style.fillPatternAngle;
      delete style.fillPatternStrokeWidth;
      delete style.fillPatternOpacity;
      delete style.label;
      delete style.regionLink;
      delete style.regionTooltip;
      delete style.regionInvisible;
      delete style.regionHoverPreview;
      return;
    }
    const pattern = (_a2 = style.fillPattern) != null ? _a2 : style.fillColor ? "solid" : "none";
    style.fillPattern = pattern;
    if (style.regionHoverPreview !== false) {
      style.regionHoverPreview = true;
    }
    if (pattern === "none") {
    } else if (pattern === "solid") {
      if (!style.fillColor) style.fillColor = "#ff0000";
      if (!Number.isFinite(style.fillOpacity)) style.fillOpacity = 0.15;
      delete style.fillPatternSpacing;
      delete style.fillPatternAngle;
      delete style.fillPatternStrokeWidth;
      delete style.fillPatternOpacity;
    } else {
      if (!style.fillColor) style.fillColor = "#ff0000";
      if (!Number.isFinite(style.fillOpacity)) style.fillOpacity = 0.15;
      if (!Number.isFinite(style.fillPatternSpacing) || style.fillPatternSpacing <= 0) {
        style.fillPatternSpacing = 8;
      }
      if (!Number.isFinite(style.fillPatternAngle)) {
        style.fillPatternAngle = 45;
      }
      if (!Number.isFinite(style.fillPatternStrokeWidth) || style.fillPatternStrokeWidth <= 0) {
        style.fillPatternStrokeWidth = 1;
      }
      if (!Number.isFinite(style.fillPatternOpacity)) {
        style.fillPatternOpacity = (_b2 = style.fillOpacity) != null ? _b2 : 0.15;
      }
      style.fillPatternOpacity = this.clamp(style.fillPatternOpacity, 0, 1);
    }
  }
};

// src/iconFileSuggest.ts
var import_obsidian7 = require("obsidian");
var ImageFileSuggestModal = class extends import_obsidian7.FuzzySuggestModal {
  constructor(app, onChoose) {
    super(app);
    this.appRef = app;
    this.onChoose = onChoose;
    const exts = /* @__PURE__ */ new Set(["png", "jpg", "jpeg", "gif", "svg", "webp"]);
    this.files = this.appRef.vault.getFiles().filter((f) => {
      var _a2;
      const m = (_a2 = f.extension) == null ? void 0 : _a2.toLowerCase();
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

// src/namePrompt.ts
var import_obsidian8 = require("obsidian");
var NamePromptModal = class extends import_obsidian8.Modal {
  constructor(app, title, defaultName, onOk) {
    super(app);
    this.titleStr = title;
    this.value = defaultName;
    this.onOk = onOk;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: this.titleStr });
    new import_obsidian8.Setting(contentEl).setName("Name").addText((t) => {
      t.setPlaceholder("Layer name");
      t.setValue(this.value);
      t.onChange((v) => this.value = v);
    });
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const ok = footer.createEl("button", { text: "Save" });
    const cancel = footer.createEl("button", { text: "Skip" });
    ok.onclick = () => {
      this.close();
      this.onOk(this.value.trim());
    };
    cancel.onclick = () => {
      this.close();
      this.onOk("");
    };
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/layerManageModals.ts
var import_obsidian9 = require("obsidian");
var RenameLayerModal = class extends import_obsidian9.Modal {
  constructor(app, layer, onDone) {
    var _a2;
    super(app);
    this.value = "";
    this.layer = layer;
    this.onDone = onDone;
    this.value = (_a2 = layer.name) != null ? _a2 : "";
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Rename layer" });
    new import_obsidian9.Setting(contentEl).setName("New name").addText((t) => {
      t.setValue(this.value);
      t.onChange((v) => this.value = v.trim());
    });
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const save = footer.createEl("button", { text: "Save" });
    const cancel = footer.createEl("button", { text: "Cancel" });
    save.onclick = () => {
      const name = this.value || this.layer.name;
      this.close();
      this.onDone(name);
    };
    cancel.onclick = () => this.close();
  }
  onClose() {
    this.contentEl.empty();
  }
};
var DeleteLayerModal = class extends import_obsidian9.Modal {
  constructor(app, layer, targets, hasMarkers, onDone) {
    var _a2, _b2;
    super(app);
    this.mode = "delete-markers";
    this.targetId = "";
    this.layer = layer;
    this.targets = targets;
    this.hasMarkers = hasMarkers;
    this.onDone = onDone;
    this.targetId = (_b2 = (_a2 = targets[0]) == null ? void 0 : _a2.id) != null ? _b2 : "";
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Delete layer" });
    const canMove = this.targets.length > 0;
    const actionSetting = new import_obsidian9.Setting(contentEl).setName("Action");
    actionSetting.addDropdown((d) => {
      d.addOption("delete-markers", "Delete markers");
      if (canMove) d.addOption("move", "Move to layer");
      d.setValue(this.mode);
      d.onChange((v) => {
        this.mode = v;
        targetSetting.settingEl.toggle(this.mode === "move");
      });
    });
    const targetSetting = new import_obsidian9.Setting(contentEl).setName("Target layer").addDropdown((d) => {
      for (const t of this.targets) d.addOption(t.id, t.name);
      d.setValue(this.targetId);
      d.onChange((v) => this.targetId = v);
    });
    targetSetting.settingEl.toggle(this.mode === "move");
    if (!this.hasMarkers) {
      new import_obsidian9.Setting(contentEl).setDesc("This layer has no markers.");
    }
    if (!canMove) {
      new import_obsidian9.Setting(contentEl).setDesc("No other layer available to move markers.");
    }
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const confirm = footer.createEl("button", { text: "Confirm" });
    const cancel = footer.createEl("button", { text: "Cancel" });
    confirm.onclick = () => {
      if (this.mode === "move") {
        if (!this.targetId) {
          this.close();
          return;
        }
        this.close();
        this.onDone({ mode: "move", targetId: this.targetId });
      } else {
        this.close();
        this.onDone({ mode: "delete-markers" });
      }
    };
    cancel.onclick = () => this.close();
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/pinSizeEditorModal.ts
var import_obsidian10 = require("obsidian");
var PinSizeEditorModal = class extends import_obsidian10.Modal {
  constructor(app, rows, onSave, focusIconKey) {
    super(app);
    this.inputs = /* @__PURE__ */ new Map();
    this.rows = rows;
    this.onSave = onSave;
    this.focusIconKey = focusIconKey;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Pin sizes for this map" });
    const info = contentEl.createEl("div", {
      text: "Set per-map sizes for pin icons. Leave the override empty to use the global default size from settings."
    });
    info.addClass("zoommap-pin-size-info");
    const list = contentEl.createDiv({ cls: "zoommap-pin-size-list" });
    for (const row of this.rows) {
      const r = list.createDiv({ cls: "zoommap-pin-size-row" });
      const img = r.createEl("img", { cls: "zoommap-pin-size-icon" });
      img.src = row.imgUrl;
      r.createEl("code", { text: row.iconKey, cls: "zoommap-pin-size-key" });
      r.createEl("span", {
        text: `${row.baseSize}px default`,
        cls: "zoommap-pin-size-base"
      });
      const overrideInput = r.createEl("input", {
        type: "number",
        cls: "zoommap-pin-size-input"
      });
      overrideInput.placeholder = String(row.baseSize);
      if (typeof row.override === "number" && row.override > 0 && row.override !== row.baseSize) {
        overrideInput.value = String(row.override);
      }
      r.createEl("span", {
        text: "Pixels on this map",
        cls: "zoommap-pin-size-label"
      });
      this.inputs.set(row.iconKey, overrideInput);
    }
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const saveBtn = footer.createEl("button", { text: "Save" });
    const cancelBtn = footer.createEl("button", { text: "Cancel" });
    saveBtn.onclick = () => {
      const result = {};
      for (const row of this.rows) {
        const input = this.inputs.get(row.iconKey);
        if (!input) continue;
        const raw = input.value.trim();
        if (!raw) {
          result[row.iconKey] = void 0;
          continue;
        }
        const n = Number(raw);
        if (!Number.isFinite(n) || n <= 0) {
          result[row.iconKey] = void 0;
          continue;
        }
        if (Math.abs(n - row.baseSize) < 1e-4) {
          result[row.iconKey] = void 0;
        } else {
          result[row.iconKey] = Math.round(n);
        }
      }
      this.close();
      this.onSave(result);
    };
    cancelBtn.onclick = () => {
      this.close();
    };
    if (this.focusIconKey) {
      const input = this.inputs.get(this.focusIconKey);
      if (input) {
        window.setTimeout(() => {
          input.focus();
          input.select();
        }, 0);
      }
    }
  }
  onClose() {
    this.contentEl.empty();
    this.inputs.clear();
  }
};

// src/viewEditorModal.ts
var import_obsidian11 = require("obsidian");
var ViewEditorModal = class extends import_obsidian11.Modal {
  constructor(app, initial, onResult, opts) {
    var _a2, _b2, _c, _d, _e, _f, _g, _h, _i, _j;
    super(app);
    this.markersInputEl = null;
    this.cfg = JSON.parse(JSON.stringify(initial));
    this.onResult = onResult;
    this.onPreview = opts == null ? void 0 : opts.onPreview;
    if (!this.cfg.imageBases || this.cfg.imageBases.length === 0) {
      this.cfg.imageBases = [{ path: "", name: "" }];
    }
    (_b2 = (_a2 = this.cfg).overlays) != null ? _b2 : _a2.overlays = [];
    (_d = (_c = this.cfg).markerLayers) != null ? _d : _c.markerLayers = ["Default"];
    (_e = this.cfg).width || (_e.width = "100%");
    (_f = this.cfg).height || (_f.height = "480px");
    (_g = this.cfg).renderMode || (_g.renderMode = "dom");
    (_h = this.cfg).resizeHandle || (_h.resizeHandle = "right");
    if (typeof this.cfg.viewportFrame !== "string") this.cfg.viewportFrame = "";
    (_j = (_i = this.cfg).viewportFrameInsets) != null ? _j : _i.viewportFrameInsets = {
      unit: "framePx",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    };
  }
  factorToPercentString(f) {
    if (typeof f !== "number" || !Number.isFinite(f) || f <= 0) return "";
    return String(Math.round(f * 100));
  }
  percentInputToFactor(input, fallback) {
    let s = input.trim();
    if (!s) return fallback;
    if (s.endsWith("%")) s = s.slice(0, -1).trim();
    s = s.replace(",", ".");
    const n = Number(s);
    if (!Number.isFinite(n) || n <= 0) return fallback;
    return n / 100;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("zoommap-view-editor");
    contentEl.createEl("h2", { text: "Edit view" });
    contentEl.createEl("h3", { text: "Base images" });
    const basesWrap = contentEl.createDiv({ cls: "zoommap-view-editor-section" });
    const renderBases = () => {
      basesWrap.empty();
      this.cfg.imageBases.forEach((b, idx) => {
        var _a2, _b2;
        const row = basesWrap.createDiv({ cls: "zoommap-view-editor-row" });
        const pathInput = row.createEl("input", {
          type: "text"
        });
        pathInput.addClass("zoommap-view-editor-input", "zoommap-view-editor-input-path");
        pathInput.placeholder = idx === 0 ? "Path to base image (required)" : "Path to additional base image";
        pathInput.value = (_a2 = b.path) != null ? _a2 : "";
        pathInput.oninput = () => {
          this.cfg.imageBases[idx].path = pathInput.value.trim();
          this.autoFillMarkersPathFromFirstBase();
        };
        const pickBtn = row.createEl("button", { text: "Pick\u2026" });
        pickBtn.addClass("zoommap-view-editor-button");
        pickBtn.onclick = () => {
          new ImageFileSuggestModal(this.app, (file) => {
            this.cfg.imageBases[idx].path = file.path;
            pathInput.value = file.path;
            this.autoFillMarkersPathFromFirstBase();
          }).open();
        };
        const nameInput = row.createEl("input", { type: "text" });
        nameInput.addClass("zoommap-view-editor-input", "zoommap-view-editor-input-name");
        nameInput.placeholder = "Optional display name";
        nameInput.value = (_b2 = b.name) != null ? _b2 : "";
        nameInput.oninput = () => {
          this.cfg.imageBases[idx].name = nameInput.value.trim() || void 0;
        };
        if (this.cfg.imageBases.length > 1) {
          const delBtn = row.createEl("button", { text: "\u2715" });
          delBtn.addClass("zoommap-view-editor-button", "zoommap-view-editor-button-delete");
          delBtn.onclick = () => {
            this.cfg.imageBases.splice(idx, 1);
            if (this.cfg.imageBases.length === 0) {
              this.cfg.imageBases.push({ path: "", name: "" });
            }
            renderBases();
          };
        }
      });
      const addBtn = basesWrap.createEl("button", { text: "Add base" });
      addBtn.addClass("zoommap-view-editor-button");
      addBtn.onclick = () => {
        this.cfg.imageBases.push({ path: "", name: "" });
        renderBases();
      };
    };
    renderBases();
    contentEl.createEl("h3", { text: "Overlays" });
    const overlaysWrap = contentEl.createDiv({ cls: "zoommap-view-editor-section" });
    const renderOverlays = () => {
      overlaysWrap.empty();
      this.cfg.overlays.forEach((o, idx) => {
        var _a2, _b2;
        const row = overlaysWrap.createDiv({ cls: "zoommap-view-editor-row" });
        const pathInput = row.createEl("input", { type: "text" });
        pathInput.addClass("zoommap-view-editor-input", "zoommap-view-editor-input-path");
        pathInput.placeholder = "Path to overlay image";
        pathInput.value = (_a2 = o.path) != null ? _a2 : "";
        pathInput.oninput = () => {
          this.cfg.overlays[idx].path = pathInput.value.trim();
        };
        const pickBtn = row.createEl("button", { text: "Pick\u2026" });
        pickBtn.addClass("zoommap-view-editor-button");
        pickBtn.onclick = () => {
          new ImageFileSuggestModal(this.app, (file) => {
            this.cfg.overlays[idx].path = file.path;
            pathInput.value = file.path;
          }).open();
        };
        const nameInput = row.createEl("input", { type: "text" });
        nameInput.addClass("zoommap-view-editor-input", "zoommap-view-editor-input-name");
        nameInput.placeholder = "Optional name";
        nameInput.value = (_b2 = o.name) != null ? _b2 : "";
        nameInput.oninput = () => {
          this.cfg.overlays[idx].name = nameInput.value.trim() || void 0;
        };
        const visLabel = row.createEl("label", { cls: "zoommap-view-editor-checkbox-label" });
        const visInput = visLabel.createEl("input", { type: "checkbox" });
        visInput.checked = !!o.visible;
        visInput.onchange = () => {
          this.cfg.overlays[idx].visible = visInput.checked;
        };
        visLabel.appendText("Visible");
        const delBtn = row.createEl("button", { text: "\u2715" });
        delBtn.addClass("zoommap-view-editor-button", "zoommap-view-editor-button-delete");
        delBtn.onclick = () => {
          this.cfg.overlays.splice(idx, 1);
          renderOverlays();
        };
      });
      const addBtn = overlaysWrap.createEl("button", { text: "Add overlay" });
      addBtn.addClass("zoommap-view-editor-button");
      addBtn.onclick = () => {
        this.cfg.overlays.push({ path: "", name: "", visible: true });
        renderOverlays();
      };
    };
    renderOverlays();
    contentEl.createEl("h3", { text: "Marker JSON" });
    new import_obsidian11.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Markers").setDesc("Optional. If empty, <firstBase>.markers.json is used.").addText((t) => {
      var _a2;
      t.setPlaceholder("Path to markers.json");
      t.setValue((_a2 = this.cfg.markersPath) != null ? _a2 : "");
      this.markersInputEl = t.inputEl;
      t.onChange((v) => {
        this.cfg.markersPath = v.trim();
      });
    }).addButton(
      (b) => b.setButtonText("Use first base").onClick(() => {
        var _a2;
        this.autoFillMarkersPathFromFirstBase(true);
        if (this.markersInputEl) this.markersInputEl.value = (_a2 = this.cfg.markersPath) != null ? _a2 : "";
      })
    );
    contentEl.createEl("h3", { text: "Marker layers (names)" });
    const layersWrap = contentEl.createDiv({ cls: "zoommap-view-editor-section" });
    const renderLayers = () => {
      layersWrap.empty();
      if (!this.cfg.markerLayers || this.cfg.markerLayers.length === 0) {
        this.cfg.markerLayers = ["Default"];
      }
      this.cfg.markerLayers.forEach((name, idx) => {
        const row = layersWrap.createDiv({ cls: "zoommap-view-editor-row" });
        const input = row.createEl("input", { type: "text" });
        input.addClass("zoommap-view-editor-input");
        input.placeholder = idx === 0 ? "Default" : "Layer name";
        input.value = name;
        input.oninput = () => {
          this.cfg.markerLayers[idx] = input.value.trim();
        };
        if (this.cfg.markerLayers.length > 1) {
          const delBtn = row.createEl("button", { text: "\u2715" });
          delBtn.addClass("zoommap-view-editor-button", "zoommap-view-editor-button-delete");
          delBtn.onclick = () => {
            this.cfg.markerLayers.splice(idx, 1);
            renderLayers();
          };
        }
      });
      const addBtn = layersWrap.createEl("button", { text: "Add layer" });
      addBtn.addClass("zoommap-view-editor-button");
      addBtn.onclick = () => {
        this.cfg.markerLayers.push("Layer");
        renderLayers();
      };
    };
    renderLayers();
    contentEl.createEl("h3", { text: "View & layout" });
    new import_obsidian11.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Render mode").setDesc("Prefer canvas for larger SVG maps.").addDropdown((d) => {
      var _a2;
      d.addOption("dom", "DOM");
      d.addOption("canvas", "Canvas");
      d.setValue((_a2 = this.cfg.renderMode) != null ? _a2 : "dom");
      d.onChange((v) => {
        this.cfg.renderMode = v;
      });
    });
    new import_obsidian11.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Min zoom (%)").addText((t) => {
      t.setPlaceholder("25");
      t.setValue(this.factorToPercentString(this.cfg.minZoom));
      t.inputEl.classList.add("zoommap-view-editor-input--short");
      t.onChange((v) => {
        this.cfg.minZoom = this.percentInputToFactor(v, 0.25);
      });
    });
    new import_obsidian11.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Max zoom (%)").addText((t) => {
      t.setPlaceholder("200");
      t.setValue(this.factorToPercentString(this.cfg.maxZoom));
      t.inputEl.classList.add("zoommap-view-editor-input--short");
      t.onChange((v) => {
        this.cfg.maxZoom = this.percentInputToFactor(v, 8);
      });
    });
    new import_obsidian11.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Wrap").addDropdown((d) => {
      d.addOption("false", "False");
      d.addOption("true", "True");
      d.setValue(this.cfg.wrap ? "true" : "false");
      d.onChange((v) => {
        this.cfg.wrap = v === "true";
      });
    });
    new import_obsidian11.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Responsive").addDropdown((d) => {
      d.addOption("false", "False");
      d.addOption("true", "True");
      d.setValue(this.cfg.responsive ? "true" : "false");
      d.onChange((v) => {
        this.cfg.responsive = v === "true";
      });
    });
    const widthSetting = new import_obsidian11.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Width");
    widthSetting.addToggle((tg) => {
      tg.setValue(this.cfg.useWidth).onChange((on) => {
        this.cfg.useWidth = on;
      });
    });
    widthSetting.addText((t) => {
      var _a2;
      t.setPlaceholder("100% or 640px");
      t.setValue((_a2 = this.cfg.width) != null ? _a2 : "");
      t.inputEl.classList.add("zoommap-view-editor-input--short");
      t.onChange((v) => {
        this.cfg.width = v.trim();
      });
    });
    {
      const hint = widthSetting.controlEl.createDiv({ cls: "zoommap-info-icon" });
      (0, import_obsidian11.setIcon)(hint, "info");
      hint.setAttr(
        "title",
        "Check to store a fixed width in YAML. Leave both unchecked to resize the map freely; each new size will be saved automatically in markers.json."
      );
    }
    const heightSetting = new import_obsidian11.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Height");
    heightSetting.addToggle((tg) => {
      tg.setValue(this.cfg.useHeight).onChange((on) => {
        this.cfg.useHeight = on;
      });
    });
    heightSetting.addText((t) => {
      var _a2;
      t.setPlaceholder("480px");
      t.setValue((_a2 = this.cfg.height) != null ? _a2 : "");
      t.inputEl.classList.add("zoommap-view-editor-input--short");
      t.onChange((v) => {
        this.cfg.height = v.trim();
      });
    });
    {
      const hint = heightSetting.controlEl.createDiv({ cls: "zoommap-info-icon" });
      (0, import_obsidian11.setIcon)(hint, "info");
      hint.setAttr(
        "title",
        "Check to store a fixed height in YAML. Leave both unchecked to resize the map freely; each new size will be saved automatically in markers.json."
      );
    }
    let handleSetting = null;
    new import_obsidian11.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Resizable").addToggle((tg) => {
      tg.setValue(!!this.cfg.resizable).onChange((on) => {
        this.cfg.resizable = on;
        handleSetting == null ? void 0 : handleSetting.settingEl.toggle(on);
      });
    });
    handleSetting = new import_obsidian11.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Resize handle").addDropdown((d) => {
      var _a2;
      d.addOption("native", "Native");
      d.addOption("left", "Left");
      d.addOption("right", "Right");
      d.addOption("both", "Both");
      d.setValue((_a2 = this.cfg.resizeHandle) != null ? _a2 : "native");
      d.onChange((v) => {
        this.cfg.resizeHandle = v;
      });
    });
    handleSetting.settingEl.toggle(!!this.cfg.resizable);
    new import_obsidian11.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Align").addDropdown((d) => {
      var _a2;
      d.addOption("", "(none)");
      d.addOption("left", "Left");
      d.addOption("center", "Center");
      d.addOption("right", "Right");
      d.setValue((_a2 = this.cfg.align) != null ? _a2 : "");
      d.onChange((v) => {
        this.cfg.align = v || void 0;
      });
    });
    new import_obsidian11.Setting(contentEl).setClass("zoommap-view-editor-row").setName("ID = optional").setDesc("Stable identifier if you store markers inline in the note.").addText((t) => {
      var _a2;
      t.setPlaceholder("Map-world-1");
      t.setValue((_a2 = this.cfg.id) != null ? _a2 : "");
      t.onChange((v) => {
        const val = v.trim();
        this.cfg.id = val.length ? val : void 0;
      });
    });
    contentEl.createEl("h3", { text: "Viewport frame" });
    let frameInputEl = null;
    const insets = this.cfg.viewportFrameInsets;
    const frameSetting = new import_obsidian11.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Frame image (optional)").setDesc("Drawn above the map. Supports overhang.");
    frameSetting.addText((t) => {
      var _a2;
      t.setPlaceholder("Path to frame image.");
      t.setValue((_a2 = this.cfg.viewportFrame) != null ? _a2 : "");
      frameInputEl = t.inputEl;
      t.onChange((v) => {
        const s = v.trim();
        this.cfg.viewportFrame = s.length ? s : void 0;
      });
    });
    frameSetting.addButton(
      (b) => b.setButtonText("Pick\u2026").onClick(() => {
        new ImageFileSuggestModal(this.app, (file) => {
          this.cfg.viewportFrame = file.path;
          if (frameInputEl) frameInputEl.value = file.path;
        }).open();
      })
    );
    frameSetting.addButton(
      (b) => b.setButtonText("Clear").onClick(() => {
        this.cfg.viewportFrame = void 0;
        if (frameInputEl) frameInputEl.value = "";
      })
    );
    frameSetting.addButton(
      (b) => b.setButtonText("Update viewport").onClick(() => {
        if (!this.onPreview) {
          new import_obsidian11.Notice("No active map preview available.", 2e3);
          return;
        }
        this.onPreview(JSON.parse(JSON.stringify(this.cfg)));
        new import_obsidian11.Notice("Viewport updated (preview).", 1200);
      })
    );
    const unitSetting = new import_obsidian11.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Viewport insets unit").setDesc("Framepx = values in the frame image pixel space. Percent = 0..100 of the outer box.");
    unitSetting.addDropdown((d) => {
      d.addOption("framePx", "Framepx");
      d.addOption("percent", "Percent");
      d.setValue(insets.unit);
      d.onChange((v) => {
        insets.unit = v === "percent" ? "percent" : "framePx";
      });
    });
    const insetRow = (label, key) => {
      new import_obsidian11.Setting(contentEl).setClass("zoommap-view-editor-row").setName(`Inset ${label}`).addText((t) => {
        var _a2;
        t.inputEl.type = "number";
        t.inputEl.classList.add("zoommap-view-editor-input--short");
        t.setPlaceholder("0");
        t.setValue(String((_a2 = insets[key]) != null ? _a2 : 0));
        t.onChange((v) => {
          const n = Number(String(v).replace(",", "."));
          if (!Number.isFinite(n) || n < 0) return;
          insets[key] = Math.round(n);
        });
      });
    };
    insetRow("Top", "top");
    insetRow("Right", "right");
    insetRow("Bottom", "bottom");
    insetRow("Left", "left");
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const saveBtn = footer.createEl("button", { text: "Save" });
    const cancelBtn = footer.createEl("button", { text: "Cancel" });
    saveBtn.onclick = () => {
      var _a2, _b2, _c;
      const first = (_b2 = (_a2 = this.cfg.imageBases[0]) == null ? void 0 : _a2.path) == null ? void 0 : _b2.trim();
      if (!first) {
        new import_obsidian11.Notice("Please select at least one base image.", 2500);
        return;
      }
      this.normalizeZoomRange();
      this.autoFillMarkersPathFromFirstBase();
      const frame = ((_c = this.cfg.viewportFrame) != null ? _c : "").trim();
      this.cfg.viewportFrame = frame.length ? frame : void 0;
      if (!this.cfg.viewportFrame) {
        this.cfg.viewportFrameInsets = void 0;
      }
      this.close();
      this.onResult({ action: "save", config: this.cfg });
    };
    cancelBtn.onclick = () => {
      this.close();
      this.onResult({ action: "cancel" });
    };
  }
  onClose() {
    this.contentEl.empty();
    this.markersInputEl = null;
  }
  normalizeZoomRange() {
    let { minZoom, maxZoom } = this.cfg;
    if (!Number.isFinite(minZoom) || minZoom <= 0) minZoom = 0.25;
    if (!Number.isFinite(maxZoom) || maxZoom <= 0) maxZoom = 8;
    if (minZoom > maxZoom) [minZoom, maxZoom] = [maxZoom, minZoom];
    this.cfg.minZoom = minZoom;
    this.cfg.maxZoom = maxZoom;
  }
  autoFillMarkersPathFromFirstBase(force = false) {
    var _a2, _b2;
    const first = (_b2 = (_a2 = this.cfg.imageBases[0]) == null ? void 0 : _a2.path) == null ? void 0 : _b2.trim();
    if (!first) return;
    if (!force && this.cfg.markersPath && this.cfg.markersPath.trim().length > 0) {
      return;
    }
    const dot = first.lastIndexOf(".");
    const base = dot >= 0 ? first.slice(0, dot) : first;
    this.cfg.markersPath = `${base}.markers.json`;
  }
};

// src/collectionsModals.ts
var import_obsidian12 = require("obsidian");
function deepClone(x2) {
  if (typeof structuredClone === "function") return structuredClone(x2);
  const json = JSON.stringify(x2);
  return JSON.parse(json);
}
var CollectionEditorModal = class extends import_obsidian12.Modal {
  constructor(app, plugin, collection, onDone) {
    var _a2, _b2, _c, _d, _e, _f, _g, _h;
    super(app);
    this.plugin = plugin;
    this.original = collection;
    this.working = deepClone(collection);
    this.working.bindings = (_a2 = this.working.bindings) != null ? _a2 : { basePaths: [] };
    this.working.bindings.basePaths = (_b2 = this.working.bindings.basePaths) != null ? _b2 : [];
    this.working.include = (_c = this.working.include) != null ? _c : {
      pinKeys: [],
      favorites: [],
      stickers: [],
      swapPins: [],
      pingPins: []
    };
    this.working.include.pinKeys = (_d = this.working.include.pinKeys) != null ? _d : [];
    this.working.include.favorites = (_e = this.working.include.favorites) != null ? _e : [];
    this.working.include.stickers = (_f = this.working.include.stickers) != null ? _f : [];
    this.working.include.swapPins = (_g = this.working.include.swapPins) != null ? _g : [];
    this.working.include.pingPins = (_h = this.working.include.pingPins) != null ? _h : [];
    this.onDone = onDone;
  }
  onOpen() {
    const { contentEl } = this;
    this.modalEl.addClass("zoommap-modal--wide");
    contentEl.empty();
    contentEl.createEl("h2", { text: "Edit collection" });
    new import_obsidian12.Setting(contentEl).setName("Name").addText((t) => {
      var _a2;
      t.setValue((_a2 = this.working.name) != null ? _a2 : "");
      t.onChange((v) => {
        this.working.name = v.trim();
      });
    });
    contentEl.createEl("h3", { text: "Bindings (base images)" });
    const pathsWrap = contentEl.createDiv();
    const renderPaths = () => {
      pathsWrap.empty();
      if (!this.working.bindings.basePaths.length) {
        pathsWrap.createEl("div", { text: "No base images bound." });
      } else {
        this.working.bindings.basePaths.forEach((p, idx) => {
          const row = pathsWrap.createDiv({
            cls: "zoommap-collection-base-row"
          });
          const code = row.createEl("code", { text: p });
          code.addClass("zoommap-collection-base-path");
          const rm = row.createEl("button", { text: "Remove" });
          rm.onclick = () => {
            this.working.bindings.basePaths.splice(idx, 1);
            renderPaths();
          };
        });
      }
      const addBtn = pathsWrap.createEl("button", { text: "Add base image\u2026" });
      addBtn.onclick = () => {
        new ImageFileSuggestModal(this.app, (file) => {
          const path = file.path;
          if (!this.working.bindings.basePaths.includes(path)) {
            this.working.bindings.basePaths.push(path);
            renderPaths();
          }
        }).open();
      };
    };
    renderPaths();
    contentEl.createEl("h3", { text: "Pins (from icon library)" });
    const pinWrap = contentEl.createDiv();
    const renderPins = () => {
      var _a2, _b2;
      pinWrap.empty();
      pinWrap.createDiv({
        cls: "zoommap-collection-pin-hint",
        text: "Select pins from the icon library:"
      });
      const selected = new Set((_a2 = this.working.include.pinKeys) != null ? _a2 : []);
      const lib = ((_b2 = this.plugin.settings.icons) != null ? _b2 : []).filter((ico) => ico.inCollections !== false || selected.has(ico.key)).sort((a, b) => {
        var _a3, _b3;
        return String((_a3 = a.key) != null ? _a3 : "").localeCompare(String((_b3 = b.key) != null ? _b3 : ""), void 0, { sensitivity: "base", numeric: true });
      });
      if (lib.length === 0) {
        const none = pinWrap.createEl("div", {
          text: "No icons in library yet."
        });
        none.addClass("zoommap-muted");
      } else {
        const list = pinWrap.createDiv({ cls: "zoommap-collection-pin-grid" });
        lib.forEach((ico) => {
          var _a3;
          const cell = list.createDiv({ cls: "zoommap-collection-pin-cell" });
          const cb = cell.createEl("input", { type: "checkbox" });
          cb.checked = this.working.include.pinKeys.includes(ico.key);
          cb.onchange = () => {
            const arr = this.working.include.pinKeys;
            if (cb.checked) {
              if (!arr.includes(ico.key)) arr.push(ico.key);
            } else {
              const i2 = arr.indexOf(ico.key);
              if (i2 >= 0) arr.splice(i2, 1);
            }
          };
          const img = cell.createEl("img");
          img.addClass("zoommap-collection-pin-icon");
          const src = (_a3 = ico.pathOrDataUrl) != null ? _a3 : "";
          if (typeof src === "string") {
            if (src.startsWith("data:")) {
              img.src = src;
            } else if (src) {
              const f = this.app.vault.getAbstractFileByPath(src);
              if (f instanceof import_obsidian12.TFile) {
                img.src = this.app.vault.getResourcePath(f);
              }
            }
          }
          const label = cell.createEl("span", { text: ico.key });
          label.addClass("zoommap-collection-pin-label");
        });
      }
    };
    renderPins();
    contentEl.createEl("h3", { text: "Favorites (presets)" });
    const favWrap = contentEl.createDiv();
    const renderFavs = () => {
      favWrap.empty();
      const list = this.working.include.favorites;
      if (list.length === 0) {
        const none = favWrap.createEl("div", {
          text: "No favorites in this collection."
        });
        none.addClass("zoommap-muted");
      }
      list.forEach((p, idx) => {
        var _a2, _b2, _c, _d, _e;
        const row = favWrap.createDiv({ cls: "zoommap-collection-fav-row" });
        const name = row.createEl("input", { type: "text" });
        name.value = (_a2 = p.name) != null ? _a2 : "";
        name.oninput = () => {
          p.name = name.value.trim();
        };
        const iconSel = row.createEl("select");
        const addOpt = (val, labelText) => {
          const o = iconSel.ownerDocument.createElement("option");
          o.value = val;
          o.textContent = labelText;
          iconSel.appendChild(o);
        };
        addOpt("", "(default)");
        {
          const pool = ((_b2 = this.plugin.settings.icons) != null ? _b2 : []).filter((ico) => {
            var _a3;
            return ico.inCollections !== false || ico.key === ((_a3 = p.iconKey) != null ? _a3 : "");
          }).sort((a, b) => {
            var _a3, _b3;
            return String((_a3 = a.key) != null ? _a3 : "").localeCompare(String((_b3 = b.key) != null ? _b3 : ""), void 0, { sensitivity: "base", numeric: true });
          });
          pool.forEach((ico) => addOpt(ico.key, ico.key));
        }
        iconSel.value = (_c = p.iconKey) != null ? _c : "";
        iconSel.onchange = () => {
          p.iconKey = iconSel.value || void 0;
        };
        const layer = row.createEl("input", { type: "text" });
        layer.placeholder = "Layer (optional)";
        layer.value = (_d = p.layerName) != null ? _d : "";
        layer.oninput = () => {
          p.layerName = layer.value.trim() || void 0;
        };
        const ed = row.createEl("input", { type: "checkbox" });
        ed.checked = !!p.openEditor;
        ed.onchange = () => {
          p.openEditor = ed.checked;
        };
        const link = row.createEl("input", { type: "text" });
        link.placeholder = "Link template (optional)";
        link.value = (_e = p.linkTemplate) != null ? _e : "";
        link.oninput = () => {
          p.linkTemplate = link.value.trim() || void 0;
        };
        const del2 = row.createEl("button", { text: "Delete" });
        del2.onclick = () => {
          this.working.include.favorites.splice(idx, 1);
          renderFavs();
        };
      });
      const add = favWrap.createEl("button", { text: "Add favorite" });
      add.onclick = () => {
        const p = {
          name: `Favorite ${this.working.include.favorites.length + 1}`,
          openEditor: false
        };
        this.working.include.favorites.push(p);
        renderFavs();
      };
    };
    renderFavs();
    contentEl.createEl("h3", { text: "Stickers" });
    const stickerWrap = contentEl.createDiv();
    const renderStickers = () => {
      stickerWrap.empty();
      const list = this.working.include.stickers;
      if (list.length === 0) {
        const none = stickerWrap.createEl("div", {
          text: "No stickers in this collection."
        });
        none.addClass("zoommap-muted");
      }
      list.forEach((s, idx) => {
        var _a2, _b2, _c, _d;
        const row = stickerWrap.createDiv({
          cls: "zoommap-collection-sticker-row"
        });
        const name = row.createEl("input", { type: "text" });
        name.value = (_a2 = s.name) != null ? _a2 : "";
        name.oninput = () => {
          s.name = name.value.trim();
        };
        const path = row.createEl("input", { type: "text" });
        path.placeholder = "Image path or data URL";
        path.value = (_b2 = s.imagePath) != null ? _b2 : "";
        path.oninput = () => {
          s.imagePath = path.value.trim();
        };
        const size = row.createEl("input", { type: "number" });
        size.value = String((_c = s.size) != null ? _c : 64);
        size.oninput = () => {
          const n = Number(size.value);
          if (Number.isFinite(n) && n > 0) s.size = Math.round(n);
        };
        const layer = row.createEl("input", { type: "text" });
        layer.placeholder = "Layer (optional)";
        layer.value = (_d = s.layerName) != null ? _d : "";
        layer.oninput = () => {
          s.layerName = layer.value.trim() || void 0;
        };
        const pick = row.createEl("button", { text: "Pick\u2026" });
        pick.onclick = () => {
          new ImageFileSuggestModal(this.app, (file) => {
            s.imagePath = file.path;
            renderStickers();
          }).open();
        };
        const del2 = row.createEl("button", { text: "Delete" });
        del2.onclick = () => {
          this.working.include.stickers.splice(idx, 1);
          renderStickers();
        };
      });
      const add = stickerWrap.createEl("button", { text: "Add sticker" });
      add.onclick = () => {
        const s = {
          name: `Sticker ${this.working.include.stickers.length + 1}`,
          imagePath: "",
          size: 64,
          openEditor: false
        };
        this.working.include.stickers.push(s);
        renderStickers();
      };
    };
    renderStickers();
    contentEl.createEl("h3", { text: "Swap pins" });
    const swapWrap = contentEl.createDiv();
    const renderSwaps = () => {
      var _a2, _b2;
      swapWrap.empty();
      const swaps = (_b2 = (_a2 = this.working.include).swapPins) != null ? _b2 : _a2.swapPins = [];
      if (swaps.length === 0) {
        const none = swapWrap.createEl("div", {
          text: "No swap pins in this collection."
        });
        none.addClass("zoommap-muted");
      }
      swaps.forEach((sp, idx) => {
        var _a3;
        const row = swapWrap.createDiv({
          cls: "zoommap-collection-sticker-row"
        });
        const name = row.createEl("input", { type: "text" });
        name.value = (_a3 = sp.name) != null ? _a3 : "";
        name.oninput = () => {
          sp.name = name.value.trim();
        };
        const editBtn = row.createEl("button", { text: "Edit\u2026" });
        editBtn.onclick = () => {
          this.openSwapFramesEditor(sp);
        };
        const delBtn = row.createEl("button", { text: "Delete" });
        delBtn.onclick = () => {
          swaps.splice(idx, 1);
          renderSwaps();
        };
      });
      const add = swapWrap.createEl("button", { text: "Add swap pin" });
      add.onclick = () => {
        const id = `swp-${Math.random().toString(36).slice(2, 8)}`;
        const sp = {
          id,
          name: `Swap pin ${swaps.length + 1}`,
          frames: []
        };
        swaps.push(sp);
        renderSwaps();
      };
    };
    renderSwaps();
    contentEl.createEl("h3", { text: "Party pins" });
    const pingWrap = contentEl.createDiv();
    const renderPings = () => {
      var _a2, _b2;
      pingWrap.empty();
      const pings = (_b2 = (_a2 = this.working.include).pingPins) != null ? _b2 : _a2.pingPins = [];
      if (pings.length === 0) {
        pingWrap.createEl("div", { text: "No party pins in this collection." }).addClass("zoommap-muted");
      }
      pings.forEach((pp, idx) => {
        var _a3;
        const row = pingWrap.createDiv({ cls: "zoommap-collection-sticker-row" });
        const name = row.createEl("input", { type: "text" });
        name.value = (_a3 = pp.name) != null ? _a3 : "";
        name.oninput = () => {
          pp.name = name.value.trim();
        };
        const editBtn = row.createEl("button", { text: "Edit\u2026" });
        editBtn.onclick = () => {
          new PingPresetEditorModal(this.app, this.plugin, pp, (updated) => {
            Object.assign(pp, updated);
            renderPings();
          }).open();
        };
        const delBtn = row.createEl("button", { text: "Delete" });
        delBtn.onclick = () => {
          pings.splice(idx, 1);
          renderPings();
        };
      });
      const addBtn = pingWrap.createEl("button", { text: "Add party pin" });
      addBtn.onclick = () => {
        var _a3, _b3;
        const id = `ping-${Math.random().toString(36).slice(2, 8)}`;
        const pp = {
          id,
          name: `Ping ${pings.length + 1}`,
          iconKey: void 0,
          layerName: "Pings",
          distances: [2, 5, 10],
          unit: "km",
          customUnitId: void 0,
          travelPackId: (_b3 = ((_a3 = this.plugin.settings.travelRulesPacks) != null ? _a3 : [])[0]) == null ? void 0 : _b3.id,
          noteFolder: "ZoomMap/Pings",
          filterTags: [],
          filterProps: {},
          relatedLookup: "tags",
          searchLayersMode: "all",
          searchLayerNames: [],
          sections: {
            bases: true,
            related: true,
            tooltips: true,
            travelTimes: true
          },
          refreshSourceNoteOnUpdate: true
        };
        pings.push(pp);
        renderPings();
      };
    };
    renderPings();
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const save = footer.createEl("button", { text: "Save" });
    save.onclick = async () => {
      this.original.name = this.working.name;
      this.original.bindings = deepClone(this.working.bindings);
      this.original.include = deepClone(this.working.include);
      await this.plugin.saveSettings();
      this.close();
      this.onDone({ updated: true, deleted: false });
    };
    const del = footer.createEl("button", { text: "Delete" });
    del.onclick = () => {
      this.close();
      this.onDone({ updated: false, deleted: true });
    };
    const cancel = footer.createEl("button", { text: "Cancel" });
    cancel.onclick = () => {
      this.close();
      this.onDone({ updated: false, deleted: false });
    };
  }
  openSwapFramesEditor(preset) {
    const modal = new SwapFramesEditorModal(
      this.app,
      this.plugin,
      preset,
      (updated) => {
        preset.name = updated.name;
        preset.frames = updated.frames;
        preset.defaultHud = updated.defaultHud;
        preset.defaultScaleLikeSticker = updated.defaultScaleLikeSticker;
        preset.hoverPopover = updated.hoverPopover;
        preset.layerName = updated.layerName;
      }
    );
    modal.open();
  }
  onClose() {
    this.contentEl.empty();
  }
};
var SwapFramesEditorModal = class extends import_obsidian12.Modal {
  constructor(app, plugin, preset, onSave) {
    super(app);
    this.allLinkSuggestions = [];
    this.plugin = plugin;
    this.working = JSON.parse(JSON.stringify(preset));
    this.onSave = onSave;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Swap pin" });
    this.buildLinkSuggestions();
    new import_obsidian12.Setting(contentEl).setName("Name").addText((t) => {
      var _a2;
      t.setValue((_a2 = this.working.name) != null ? _a2 : "");
      t.onChange((v) => {
        this.working.name = v.trim() || this.working.name;
      });
    });
    new import_obsidian12.Setting(contentEl).setName("Marker layer name (optional)").setDesc("If set: newly placed swap pins will be created in this marker layer (created if missing).").addText((t) => {
      var _a2;
      t.setPlaceholder("Layer");
      t.setValue((_a2 = this.working.layerName) != null ? _a2 : "");
      t.onChange((v) => {
        this.working.layerName = v.trim() || void 0;
      });
    });
    new import_obsidian12.Setting(contentEl).setName("Place as hud pin by default").addToggle((tg) => {
      tg.setValue(!!this.working.defaultHud).onChange((on) => {
        this.working.defaultHud = on || void 0;
      });
    });
    new import_obsidian12.Setting(contentEl).setName("Scale like sticker by default").addToggle((tg) => {
      tg.setValue(!!this.working.defaultScaleLikeSticker).onChange((on) => {
        this.working.defaultScaleLikeSticker = on || void 0;
      });
    });
    new import_obsidian12.Setting(contentEl).setName("Hover opens popover automatically").setDesc("If enabled, hovering this swap pin shows a preview without ctrl/cmd.").addToggle((tg) => {
      tg.setValue(!!this.working.hoverPopover).onChange((on) => {
        this.working.hoverPopover = on || void 0;
      });
    });
    const list = contentEl.createDiv();
    const render = () => {
      var _a2, _b2;
      list.empty();
      const frames = (_b2 = (_a2 = this.working).frames) != null ? _b2 : _a2.frames = [];
      if (frames.length === 0) {
        const none = list.createEl("div", { text: "No frames yet." });
        none.addClass("zoommap-muted");
      }
      frames.forEach((fr, idx) => {
        var _a3, _b3;
        const row = list.createDiv({
          cls: "zoommap-collection-sticker-row"
        });
        const iconSel = row.createEl("select");
        const icons = ((_a3 = this.plugin.settings.icons) != null ? _a3 : []).filter((ico) => ico.inCollections !== false || ico.key === fr.iconKey).sort((a, b) => {
          var _a4, _b4;
          return String((_a4 = a.key) != null ? _a4 : "").localeCompare(String((_b4 = b.key) != null ? _b4 : ""), void 0, { sensitivity: "base", numeric: true });
        });
        icons.forEach((ico) => {
          const opt = iconSel.ownerDocument.createElement("option");
          opt.value = ico.key;
          opt.textContent = ico.key;
          iconSel.appendChild(opt);
        });
        iconSel.value = fr.iconKey;
        iconSel.onchange = () => {
          fr.iconKey = iconSel.value;
        };
        const link = row.createEl("input", { type: "text" });
        link.placeholder = "Optional link";
        link.value = (_b3 = fr.link) != null ? _b3 : "";
        link.oninput = () => {
          fr.link = link.value.trim() || void 0;
        };
        this.attachLinkAutocomplete(
          link,
          () => {
            var _a4;
            return (_a4 = fr.link) != null ? _a4 : "";
          },
          (val) => {
            fr.link = val.trim() || void 0;
            link.value = val;
          }
        );
        const del = row.createEl("button", { text: "Delete" });
        del.onclick = () => {
          frames.splice(idx, 1);
          render();
        };
      });
      const add = list.createEl("button", { text: "Add frame" });
      add.onclick = () => {
        var _a3, _b3, _c;
        const firstKey = (_c = (_b3 = (_a3 = this.plugin.settings.icons) == null ? void 0 : _a3[0]) == null ? void 0 : _b3.key) != null ? _c : "";
        const frame = { iconKey: firstKey };
        frames.push(frame);
        render();
      };
    };
    render();
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const saveBtn = footer.createEl("button", { text: "Save" });
    const cancelBtn = footer.createEl("button", { text: "Cancel" });
    saveBtn.onclick = () => {
      this.close();
      this.onSave(this.working);
    };
    cancelBtn.onclick = () => this.close();
  }
  onClose() {
    this.contentEl.empty();
  }
  buildLinkSuggestions() {
    var _a2, _b2, _c, _d;
    const files = this.app.vault.getFiles().filter((f) => {
      var _a3;
      return ((_a3 = f.extension) == null ? void 0 : _a3.toLowerCase()) === "md";
    });
    const suggestions = [];
    const active = this.app.workspace.getActiveFile();
    const fromPath = (_c = (_b2 = active == null ? void 0 : active.path) != null ? _b2 : (_a2 = files[0]) == null ? void 0 : _a2.path) != null ? _c : "";
    for (const file of files) {
      const base = this.app.metadataCache.fileToLinktext(file, fromPath);
      suggestions.push({ label: base, value: base });
      const cache = this.app.metadataCache.getCache(file.path);
      const headings = (_d = cache == null ? void 0 : cache.headings) != null ? _d : [];
      for (const h of headings) {
        const heading = h.heading;
        const full = `${base}#${heading}`;
        suggestions.push({
          label: `${base} \u203A ${heading}`,
          value: full
        });
      }
    }
    this.allLinkSuggestions = suggestions;
  }
  attachLinkAutocomplete(input, getValue, setValue) {
    const wrapper = input.parentElement;
    if (!(wrapper instanceof HTMLElement)) return;
    wrapper.classList.add("zoommap-link-input-wrapper");
    const listEl = wrapper.createDiv({
      cls: "zoommap-link-suggestions is-hidden"
    });
    const hide = () => listEl.classList.add("is-hidden");
    const show = () => listEl.classList.remove("is-hidden");
    const update = (query) => {
      const q = query.trim().toLowerCase();
      listEl.empty();
      if (!q) {
        hide();
        return;
      }
      const matches = this.allLinkSuggestions.filter(
        (s) => s.value.toLowerCase().includes(q) || s.label.toLowerCase().includes(q)
      ).slice(0, 20);
      if (!matches.length) {
        hide();
        return;
      }
      show();
      for (const s of matches) {
        const row = listEl.createDiv({
          cls: "zoommap-link-suggestion-item"
        });
        row.setText(s.label);
        row.addEventListener("mousedown", (ev) => {
          ev.preventDefault();
          setValue(s.value);
          hide();
        });
      }
    };
    input.addEventListener("input", () => update(input.value));
    input.addEventListener("blur", () => {
      window.setTimeout(hide, 150);
    });
    hide();
  }
};
var PingPresetEditorModal = class extends import_obsidian12.Modal {
  constructor(app, plugin, preset, onSave) {
    var _a2, _b2, _c, _d, _e, _f, _g, _h;
    super(app);
    this.plugin = plugin;
    this.working = deepClone(preset);
    this.onSave = onSave;
    (_b2 = (_a2 = this.working).relatedLookup) != null ? _b2 : _a2.relatedLookup = "tags";
    (_d = (_c = this.working).searchLayersMode) != null ? _d : _c.searchLayersMode = "all";
    (_f = (_e = this.working).searchLayerNames) != null ? _f : _e.searchLayerNames = [];
    (_h = (_g = this.working).sections) != null ? _h : _g.sections = {};
  }
  onOpen() {
    var _a2, _b2, _c;
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Party preset" });
    new import_obsidian12.Setting(contentEl).setName("Name").addText((t) => {
      var _a3;
      t.setValue((_a3 = this.working.name) != null ? _a3 : "");
      t.onChange((v) => {
        this.working.name = v.trim();
      });
    });
    new import_obsidian12.Setting(contentEl).setName("Icon").addDropdown((d) => {
      var _a3, _b3;
      d.addOption("", "(default)");
      {
        const pool = ((_a3 = this.plugin.settings.icons) != null ? _a3 : []).filter((ico) => {
          var _a4;
          return ico.inCollections !== false || ico.key === ((_a4 = this.working.iconKey) != null ? _a4 : "");
        }).sort((a, b) => {
          var _a4, _b4;
          return String((_a4 = a.key) != null ? _a4 : "").localeCompare(String((_b4 = b.key) != null ? _b4 : ""), void 0, { sensitivity: "base", numeric: true });
        });
        for (const ico of pool) d.addOption(ico.key, ico.key);
      }
      d.setValue((_b3 = this.working.iconKey) != null ? _b3 : "");
      d.onChange((v) => {
        this.working.iconKey = v || void 0;
      });
    });
    contentEl.createEl("h3", { text: "Generated sections" });
    const sec = (_b2 = (_a2 = this.working).sections) != null ? _b2 : _a2.sections = {};
    new import_obsidian12.Setting(contentEl).setName("Base table (embedded base)").addToggle((tg) => {
      tg.setValue(sec.bases !== false).onChange((on) => {
        sec.bases = on ? true : false;
      });
    });
    new import_obsidian12.Setting(contentEl).setName("Related notes section (tags/backlinks)").addToggle((tg) => {
      tg.setValue(sec.related !== false).onChange((on) => {
        sec.related = on ? true : false;
      });
    });
    new import_obsidian12.Setting(contentEl).setName("Unlinked markers section").addToggle((tg) => {
      tg.setValue(sec.tooltips !== false).onChange((on) => {
        sec.tooltips = on ? true : false;
      });
    });
    new import_obsidian12.Setting(contentEl).setName("Travel times table").addToggle((tg) => {
      tg.setValue(sec.travelTimes !== false).onChange((on) => {
        sec.travelTimes = on ? true : false;
      });
    });
    new import_obsidian12.Setting(contentEl).setName("Refresh source note after update").setDesc("Experimental. Re-renders the note that contains the map/dashboard after this party pin updates.").addToggle((tg) => {
      tg.setValue(this.working.refreshSourceNoteOnUpdate !== false).onChange((on) => {
        this.working.refreshSourceNoteOnUpdate = on ? true : false;
      });
    });
    new import_obsidian12.Setting(contentEl).setName("Related notes lookup").setDesc("Expands the search starting from the in-range linked notes.").addDropdown((d) => {
      var _a3;
      d.addOption("off", "Off");
      d.addOption("backlinks", "Backlinks (notes linking to the in-range note)");
      d.addOption("tags", "Tags (notes with matching tags)");
      d.setValue((_a3 = this.working.relatedLookup) != null ? _a3 : "tags");
      d.onChange((v) => {
        if (v === "off" || v === "tags" || v === "backlinks") {
          this.working.relatedLookup = v;
        } else {
          this.working.relatedLookup = "tags";
        }
      });
    });
    let customLayersSetting = null;
    const renderCustomLayersSetting = () => {
      var _a3;
      if (!customLayersSetting) return;
      customLayersSetting.settingEl.toggle(((_a3 = this.working.searchLayersMode) != null ? _a3 : "all") === "custom");
    };
    new import_obsidian12.Setting(contentEl).setName("Search markers in layers").setDesc("Limits which marker layers are considered when scanning for in-range markers. Custom uses layer *names* (comma separated).").addDropdown((d) => {
      var _a3;
      d.addOption("all", "All layers");
      d.addOption("self", "Only the party pin's layer");
      d.addOption("custom", "Custom list");
      d.setValue((_a3 = this.working.searchLayersMode) != null ? _a3 : "all");
      d.onChange((v) => {
        if (v === "all" || v === "self" || v === "custom") {
          this.working.searchLayersMode = v;
        } else {
          this.working.searchLayersMode = "all";
        }
        renderCustomLayersSetting();
      });
    });
    customLayersSetting = new import_obsidian12.Setting(contentEl).setName("Layer names (comma separated)").setDesc('Example: "npc, shops, quests". If empty, all layers are searched.').addText((t) => {
      var _a3;
      t.setPlaceholder("Npc, shops");
      t.setValue(((_a3 = this.working.searchLayerNames) != null ? _a3 : []).join(", "));
      t.onChange((v) => {
        const arr = v.split(",").map((s) => s.trim()).filter(Boolean);
        this.working.searchLayerNames = arr;
      });
    });
    renderCustomLayersSetting();
    new import_obsidian12.Setting(contentEl).setName("Layer name (optional)").addText((t) => {
      var _a3;
      t.setPlaceholder("Pings");
      t.setValue((_a3 = this.working.layerName) != null ? _a3 : "");
      t.onChange((v) => {
        this.working.layerName = v.trim() || void 0;
      });
    });
    new import_obsidian12.Setting(contentEl).setName("Scale like sticker (default)").setDesc("If enabled, newly created party pins will scale with the map (no inverse wrapper).").addToggle((tg) => {
      tg.setValue(!!this.working.defaultScaleLikeSticker).onChange((on) => {
        this.working.defaultScaleLikeSticker = on ? true : void 0;
      });
    });
    const packs = (_c = this.plugin.settings.travelRulesPacks) != null ? _c : [];
    new import_obsidian12.Setting(contentEl).setName("Travel pack").setDesc("Used to select custom units for party radius.").addDropdown((d) => {
      var _a3;
      d.addOption("", "(none)");
      for (const p of packs) d.addOption(p.id, p.name || p.id);
      d.setValue((_a3 = this.working.travelPackId) != null ? _a3 : "");
      d.onChange((v) => {
        this.working.travelPackId = v || void 0;
        this.renderUnitSetting();
      });
    });
    contentEl.createEl("div", { text: "" });
    this.renderUnitSetting();
    new import_obsidian12.Setting(contentEl).setName("Distances (comma separated)").setDesc("Example: 2, 5, 10").addText((t) => {
      var _a3;
      t.setValue(((_a3 = this.working.distances) != null ? _a3 : []).join(", "));
      t.onChange((v) => {
        const nums = v.split(",").map((s) => Number(s.trim().replace(",", "."))).filter((n) => Number.isFinite(n) && n > 0);
        this.working.distances = nums.length ? nums : [2, 5, 10];
      });
    });
    new import_obsidian12.Setting(contentEl).setName("Party note folder").setDesc("Vault folder where party pin notes are created.").addText((t) => {
      var _a3;
      t.setPlaceholder("Zoommap/pings");
      t.setValue((_a3 = this.working.noteFolder) != null ? _a3 : "");
      t.onChange((v) => {
        this.working.noteFolder = v.trim() || void 0;
      });
    });
    new import_obsidian12.Setting(contentEl).setName("Filter tags (optional, comma separated)").setDesc("These tags are applied as or filter in the embedded bases view.").addText((t) => {
      var _a3;
      t.setPlaceholder("Npc, shop, questgiver");
      t.setValue(((_a3 = this.working.filterTags) != null ? _a3 : []).join(", "));
      t.onChange((v) => {
        const tags = v.split(",").map((s) => s.trim().replace(/^#/, "")).filter(Boolean);
        this.working.filterTags = tags;
      });
    });
    new import_obsidian12.Setting(contentEl).setName("Filter properties (optional)").setDesc("One line per key=value, multiple values with | or ,").addTextArea((a) => {
      var _a3;
      const props = (_a3 = this.working.filterProps) != null ? _a3 : {};
      a.setValue(
        Object.entries(props).map(([k, v]) => {
          var _a4;
          const vals = Array.isArray(v) ? v : [String(v != null ? v : "")];
          const cleaned = vals.map((s) => String(s).trim()).filter(Boolean);
          return cleaned.length > 1 ? `${k}=${cleaned.join(" | ")}` : `${k}=${(_a4 = cleaned[0]) != null ? _a4 : ""}`;
        }).filter((ln2) => ln2.trim().length > 0).join("\n")
      );
      a.onChange((v) => {
        const next = {};
        for (const line of v.split("\n")) {
          const s = line.trim();
          if (!s) continue;
          const i2 = s.indexOf("=");
          if (i2 < 1) continue;
          const k = s.slice(0, i2).trim();
          const raw = s.slice(i2 + 1).trim();
          if (!k || !raw) continue;
          const vals = raw.split(/[|,]/g).map((x2) => x2.trim()).filter(Boolean);
          if (vals.length === 1) next[k] = vals[0];
          else if (vals.length > 1) next[k] = vals;
        }
        this.working.filterProps = next;
      });
    });
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    footer.createEl("button", { text: "Save" }).onclick = () => {
      this.close();
      this.onSave(this.working);
    };
    footer.createEl("button", { text: "Cancel" }).onclick = () => this.close();
  }
  renderUnitSetting() {
    var _a2, _b2;
    const { contentEl } = this;
    const existing = contentEl.querySelector(".zm-ping-unit-setting");
    existing == null ? void 0 : existing.remove();
    const wrap = contentEl.createDiv({ cls: "zm-ping-unit-setting" });
    const pack = ((_a2 = this.plugin.settings.travelRulesPacks) != null ? _a2 : []).find((p) => p.id === this.working.travelPackId);
    const customs = ((_b2 = pack == null ? void 0 : pack.customUnits) != null ? _b2 : []).slice().sort((a, b) => {
      var _a3, _b3;
      return ((_a3 = a.name) != null ? _a3 : a.id).localeCompare((_b3 = b.name) != null ? _b3 : b.id);
    });
    const setting = new import_obsidian12.Setting(wrap).setName("Unit");
    setting.addDropdown((d) => {
      var _a3;
      d.addOption("m", "M");
      d.addOption("km", "Km");
      d.addOption("mi", "Mi");
      d.addOption("ft", "Ft");
      for (const cu of customs) {
        const label = cu.abbreviation ? `${cu.name} (${cu.abbreviation})` : cu.name;
        d.addOption(`custom:${cu.id}`, label);
      }
      const cur = this.working.unit === "custom" ? `custom:${(_a3 = this.working.customUnitId) != null ? _a3 : ""}` : this.working.unit;
      const has = Array.from(d.selectEl.options).some((o) => o.value === cur);
      d.setValue(has ? cur : "km");
      d.onChange((v) => {
        if (v.startsWith("custom:")) {
          this.working.unit = "custom";
          this.working.customUnitId = v.slice("custom:".length) || void 0;
        } else {
          if (v === "m" || v === "km" || v === "mi" || v === "ft") {
            this.working.unit = v;
          } else {
            this.working.unit = "km";
          }
          this.working.customUnitId = void 0;
        }
      });
    });
  }
};

// src/svgRasterExportModal.ts
var import_obsidian13 = require("obsidian");
function fileStem(path) {
  var _a2;
  const name = (_a2 = path.split("/").pop()) != null ? _a2 : path;
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(0, dot) : name;
}
function folderOf(path) {
  const i2 = path.lastIndexOf("/");
  return i2 >= 0 ? path.slice(0, i2) : "";
}
var SvgRasterExportModal = class extends import_obsidian13.Modal {
  constructor(app, opts, onDone) {
    var _a2;
    super(app);
    this.quality = 0.92;
    this.outPath = "";
    this.baseName = "";
    this.moveMarkersJson = false;
    this.suppressAutoDefaults = false;
    this.opts = opts;
    this.onDone = onDone;
    this.longEdge = (_a2 = opts.defaultLongEdge) != null ? _a2 : 8192;
    this.quality = typeof opts.defaultQuality === "number" ? opts.defaultQuality : 0.92;
    const dir = folderOf(opts.svgPath);
    const stem = fileStem(opts.svgPath);
    this.baseName = `${stem} (${this.longEdge / 1024}k)`;
    this.outPath = (0, import_obsidian13.normalizePath)(`${dir}/${stem}-${this.longEdge / 1024}k.webp`);
  }
  onOpen() {
    this.render();
  }
  render() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Export SVG as webp base" });
    contentEl.createEl("div", { text: `SVG: ${this.opts.svgPath}` });
    new import_obsidian13.Setting(contentEl).setName("Long edge").setDesc("Target size for the longer side of the image.").addDropdown((d) => {
      d.addOption("4096", "4k (4096px)");
      d.addOption("8192", "8k (8192px)");
      d.addOption("12288", "12k (12288px)");
      d.setValue(String(this.longEdge));
      d.onChange((v) => {
        this.longEdge = Number(v);
        if (!this.suppressAutoDefaults) {
          const dir = folderOf(this.opts.svgPath);
          const stem = fileStem(this.opts.svgPath);
          this.baseName = `${stem} (${this.longEdge / 1024}k)`;
          this.outPath = (0, import_obsidian13.normalizePath)(`${dir}/${stem}-${this.longEdge / 1024}k.webp`);
        }
        this.render();
      });
    });
    new import_obsidian13.Setting(contentEl).setName("Webp quality").setDesc("0.0\u20131.0 (higher = better quality, larger file).").addText((t) => {
      t.setPlaceholder("0.92");
      t.setValue(String(this.quality));
      t.onChange((v) => {
        const n = Number(String(v).replace(",", "."));
        if (Number.isFinite(n)) this.quality = Math.min(1, Math.max(0.1, n));
      });
    });
    new import_obsidian13.Setting(contentEl).setName("New base name (optional)").addText((t) => {
      t.setValue(this.baseName);
      t.onChange((v) => {
        this.suppressAutoDefaults = true;
        this.baseName = v.trim();
      });
    });
    new import_obsidian13.Setting(contentEl).setName("Output path").setDesc("Will be created in the vault (webp). If it exists, a suffix will be added.").addText((t) => {
      t.setValue(this.outPath);
      t.onChange((v) => {
        this.suppressAutoDefaults = true;
        this.outPath = (0, import_obsidian13.normalizePath)(v.trim());
      });
    });
    new import_obsidian13.Setting(contentEl).setName("Move markers.json to exported base").setDesc("Renames the current markers.json to <exported>.markers.json. WARNING: other maps using the same markers file must be updated manually.").addToggle((tg) => tg.setValue(this.moveMarkersJson).onChange((v) => this.moveMarkersJson = v));
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const exportBtn = footer.createEl("button", { text: "Export" });
    const cancelBtn = footer.createEl("button", { text: "Cancel" });
    exportBtn.onclick = () => {
      if (!this.outPath) {
        new import_obsidian13.Notice("Output path is empty.", 2500);
        return;
      }
      this.close();
      this.onDone({
        action: "export",
        result: {
          longEdge: this.longEdge,
          quality: this.quality,
          outPath: this.outPath,
          baseName: this.baseName || void 0,
          moveMarkersJson: this.moveMarkersJson
        }
      });
    };
    cancelBtn.onclick = () => {
      this.close();
      this.onDone({ action: "cancel" });
    };
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/swapLinksEditorModal.ts
var import_obsidian14 = require("obsidian");
function deepClone2(x2) {
  if (typeof structuredClone === "function") return structuredClone(x2);
  return JSON.parse(JSON.stringify(x2));
}
function normalizeFrameIndex(rawIndex, count) {
  const n = Math.max(1, count);
  return (rawIndex % n + n) % n;
}
var SwapLinksEditorModal = class extends import_obsidian14.Modal {
  constructor(app, plugin, marker, preset, onDone) {
    var _a2;
    super(app);
    this.workingLinks = {};
    this.allSuggestions = [];
    this.inputs = /* @__PURE__ */ new Map();
    this.plugin = plugin;
    this.marker = marker;
    this.preset = preset;
    this.onDone = onDone;
    this.workingLinks = deepClone2((_a2 = marker.swapLinks) != null ? _a2 : {});
  }
  onOpen() {
    var _a2, _b2;
    const { contentEl } = this;
    contentEl.empty();
    this.inputs.clear();
    contentEl.createEl("h2", { text: "Swap links (this pin only)" });
    const rawIndex = typeof this.marker.swapIndex === "number" ? this.marker.swapIndex : 0;
    const idx = normalizeFrameIndex(rawIndex, this.preset.frames.length);
    contentEl.createEl("div", { text: `Preset: ${this.preset.name} \u2022 Current frame: ${idx + 1}/${this.preset.frames.length}` });
    this.buildLinkSuggestions();
    contentEl.createEl("h3", { text: "Per-frame link overrides" });
    contentEl.createEl("div", {
      text: "Leave a field empty to fall back to the preset link (or the icon default link)."
    }).addClass("zoommap-muted");
    for (let i2 = 0; i2 < this.preset.frames.length; i2 += 1) {
      const fr = this.preset.frames[i2];
      const presetLink = ((_a2 = fr.link) != null ? _a2 : "").trim();
      const iconDefault = (_b2 = this.plugin.getIconDefaultLink(fr.iconKey)) != null ? _b2 : "";
      const fallback = presetLink || iconDefault;
      const desc = fallback ? `Default: ${fallback}` : "Default: (none)";
      const row = new import_obsidian14.Setting(contentEl).setName(`Frame ${i2 + 1}: ${fr.iconKey}`).setDesc(desc);
      const iconImg = row.controlEl.createEl("img", { cls: "zoommap-settings__icon-preview" });
      iconImg.src = this.resolveIconUrl(fr.iconKey);
      row.addText((t) => {
        var _a3;
        t.setPlaceholder("Override link (optional)");
        t.setValue((_a3 = this.workingLinks[i2]) != null ? _a3 : "");
        const input = t.inputEl;
        this.inputs.set(i2, input);
        this.attachLinkAutocomplete(
          input,
          () => input.value,
          (val) => {
            input.value = val;
            this.setOverride(i2, val);
          }
        );
        t.onChange((v) => {
          this.setOverride(i2, v);
        });
      });
    }
    new import_obsidian14.Setting(contentEl).setName("Clear overrides").setDesc("Removes per-frame overrides from this pin.").addButton((b) => {
      b.setButtonText("Clear").onClick(() => {
        this.workingLinks = {};
        for (const input of this.inputs.values()) {
          input.value = "";
        }
        new import_obsidian14.Notice("Overrides cleared (not saved yet).", 1200);
      });
    });
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const saveBtn = footer.createEl("button", { text: "Save" });
    const cancelBtn = footer.createEl("button", { text: "Cancel" });
    saveBtn.onclick = () => {
      const cleaned = this.cleanedOverrides(this.workingLinks);
      this.close();
      this.onDone({ action: "save", swapLinks: Object.keys(cleaned).length ? cleaned : void 0 });
    };
    cancelBtn.onclick = () => {
      this.close();
      this.onDone({ action: "cancel" });
    };
  }
  onClose() {
    this.contentEl.empty();
    this.inputs.clear();
  }
  setOverride(frameIndex, raw) {
    const s = (raw != null ? raw : "").trim();
    if (s) this.workingLinks[frameIndex] = s;
    else delete this.workingLinks[frameIndex];
  }
  cleanedOverrides(raw) {
    const out = {};
    for (const [k, v] of Object.entries(raw)) {
      const idx = Number(k);
      const s = (v != null ? v : "").trim();
      if (!Number.isFinite(idx)) continue;
      if (!s) continue;
      out[idx] = s;
    }
    return out;
  }
  resolveIconUrl(iconKey) {
    var _a2, _b2, _c;
    const icon = (_b2 = ((_a2 = this.plugin.settings.icons) != null ? _a2 : []).find((i2) => i2.key === iconKey)) != null ? _b2 : this.plugin.builtinIcon();
    let src = (_c = icon.pathOrDataUrl) != null ? _c : "";
    if (typeof src !== "string") return "";
    if (src.startsWith("data:")) return src;
    const af = this.app.vault.getAbstractFileByPath(src);
    if (af instanceof import_obsidian14.TFile) return this.app.vault.getResourcePath(af);
    return src;
  }
  buildLinkSuggestions() {
    var _a2, _b2, _c, _d;
    const files = this.app.vault.getFiles().filter((f) => {
      var _a3;
      return ((_a3 = f.extension) == null ? void 0 : _a3.toLowerCase()) === "md";
    });
    const suggestions = [];
    const active = this.app.workspace.getActiveFile();
    const fromPath = (_c = (_b2 = active == null ? void 0 : active.path) != null ? _b2 : (_a2 = files[0]) == null ? void 0 : _a2.path) != null ? _c : "";
    for (const file of files) {
      const baseLink = this.app.metadataCache.fileToLinktext(file, fromPath);
      suggestions.push({ label: baseLink, value: baseLink });
      const cache = this.app.metadataCache.getCache(file.path);
      const headings = (_d = cache == null ? void 0 : cache.headings) != null ? _d : [];
      for (const h of headings) {
        const headingName = h.heading;
        const full = `${baseLink}#${headingName}`;
        suggestions.push({ label: `${baseLink} \u203A ${headingName}`, value: full });
      }
    }
    this.allSuggestions = suggestions;
  }
  attachLinkAutocomplete(input, getValue, setValue) {
    const wrapper = input.parentElement;
    if (!(wrapper instanceof HTMLElement)) return;
    wrapper.classList.add("zoommap-link-input-wrapper");
    const listEl = wrapper.createDiv({ cls: "zoommap-link-suggestions is-hidden" });
    const hide = () => listEl.classList.add("is-hidden");
    const show = () => listEl.classList.remove("is-hidden");
    let raf = null;
    const update = (query) => {
      const q = query.trim().toLowerCase();
      listEl.empty();
      if (!q) {
        hide();
        return;
      }
      const matches = this.allSuggestions.filter((s) => s.value.toLowerCase().includes(q) || s.label.toLowerCase().includes(q)).slice(0, 20);
      if (!matches.length) {
        hide();
        return;
      }
      show();
      for (const s of matches) {
        const row = listEl.createDiv({ cls: "zoommap-link-suggestion-item" });
        row.setText(s.label);
        row.addEventListener("mousedown", (ev) => {
          ev.preventDefault();
          setValue(s.value);
          hide();
          input.focus();
          const len = s.value.length;
          input.setSelectionRange(len, len);
        });
      }
    };
    const schedule = () => {
      if (raf !== null) window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(() => {
        raf = null;
        update(getValue());
      });
    };
    input.addEventListener("input", schedule);
    input.addEventListener("focus", schedule);
    input.addEventListener("blur", () => window.setTimeout(hide, 150));
  }
};

// src/measureTerrainModal.ts
var import_obsidian15 = require("obsidian");
var MeasureTerrainModal = class extends import_obsidian15.Modal {
  constructor(app, terrains, segments, onSave) {
    super(app);
    this.terrains = terrains;
    this.segments = segments;
    this.onSave = onSave;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Measure terrains" });
    this.segments.forEach((seg, idx) => {
      new import_obsidian15.Setting(contentEl).setName(`Segment ${idx + 1}`).setDesc(seg.label).addDropdown((d) => {
        for (const t of this.terrains) {
          d.addOption(t.id, `${t.name} (${t.factor}\xD7)`);
        }
        d.setValue(seg.terrainId);
        d.onChange((v) => {
          seg.terrainId = v;
        });
      });
    });
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const saveBtn = footer.createEl("button", { text: "Save" });
    const cancelBtn = footer.createEl("button", { text: "Cancel" });
    saveBtn.onclick = () => {
      this.close();
      this.onSave(this.segments);
    };
    cancelBtn.onclick = () => this.close();
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/gridEditorModal.ts
var import_obsidian16 = require("obsidian");
function deepClone3(x2) {
  if (typeof structuredClone === "function") return structuredClone(x2);
  return JSON.parse(JSON.stringify(x2));
}
function normalizeHex(v) {
  const s = v.trim();
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s)) return s;
  if (s.length === 4) {
    const r = s[1];
    const g = s[2];
    const b = s[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return s;
}
var GridEditorModal = class extends import_obsidian16.Modal {
  constructor(app, grid, onDone) {
    var _a2, _b2;
    super(app);
    this.working = deepClone3(grid);
    this.onDone = onDone;
    this.working.name = (_a2 = this.working.name) != null ? _a2 : "Grid";
    this.working.visible = this.working.visible !== false;
    this.working.shape = this.working.shape === "hex" ? "hex" : "square";
    this.working.color = ((_b2 = this.working.color) != null ? _b2 : "").trim() || "#ffffff";
    this.working.width = Number.isFinite(this.working.width) && this.working.width > 0 ? this.working.width : 1;
    this.working.opacity = Number.isFinite(this.working.opacity) ? Math.min(1, Math.max(0, this.working.opacity)) : 0.5;
    this.working.spacing = Number.isFinite(this.working.spacing) && this.working.spacing > 1 ? this.working.spacing : 64;
    this.working.offsetX = Number.isFinite(this.working.offsetX) ? this.working.offsetX : 0;
    this.working.offsetY = Number.isFinite(this.working.offsetY) ? this.working.offsetY : 0;
    this.working.playerScreen = this.working.playerScreen === "player-only" || this.working.playerScreen === "gm-only" ? this.working.playerScreen : "both";
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Grid" });
    new import_obsidian16.Setting(contentEl).setName("Name").addText((t) => {
      var _a2;
      t.setValue((_a2 = this.working.name) != null ? _a2 : "");
      t.onChange((v) => {
        this.working.name = v.trim() || "Grid";
      });
    });
    new import_obsidian16.Setting(contentEl).setName("Visible").addToggle((tg) => {
      tg.setValue(!!this.working.visible).onChange((on) => {
        this.working.visible = on;
      });
    });
    new import_obsidian16.Setting(contentEl).setName("Show on").setDesc("Controls whether the grid is visible for gm, player screen, or both.").addDropdown((d) => {
      var _a2;
      d.addOption("both", "Gm + player screen");
      d.addOption("gm-only", "Gm only");
      d.addOption("player-only", "Player screen only");
      d.setValue((_a2 = this.working.playerScreen) != null ? _a2 : "both");
      d.onChange((v) => {
        this.working.playerScreen = v === "gm-only" || v === "player-only" ? v : "both";
      });
    });
    new import_obsidian16.Setting(contentEl).setName("Shape").addDropdown((d) => {
      d.addOption("square", "Square");
      d.addOption("hex", "Hex");
      d.setValue(this.working.shape);
      d.onChange((v) => {
        this.working.shape = v === "hex" ? "hex" : "square";
      });
    });
    const colorRow = new import_obsidian16.Setting(contentEl).setName("Grid color").setDesc("SVG stroke color.");
    let colorTextEl;
    const picker = colorRow.controlEl.createEl("input", {
      attr: { type: "color", style: "margin-left:8px; vertical-align: middle;" }
    });
    colorRow.addText((t) => {
      t.setPlaceholder("#ffffff");
      t.setValue(this.working.color);
      colorTextEl = t.inputEl;
      t.onChange((v) => {
        this.working.color = v.trim() || "#ffffff";
        const hex = normalizeHex(this.working.color);
        if (/^#([0-9a-f]{6})$/i.test(hex)) picker.value = hex;
      });
    });
    {
      const hex = normalizeHex(this.working.color);
      if (/^#([0-9a-f]{6})$/i.test(hex)) picker.value = hex;
    }
    picker.oninput = () => {
      this.working.color = picker.value;
      colorTextEl.value = picker.value;
    };
    new import_obsidian16.Setting(contentEl).setName("Line width (px)").addText((t) => {
      t.inputEl.type = "number";
      t.setValue(String(this.working.width));
      t.onChange((v) => {
        const n = Number(String(v).replace(",", "."));
        if (Number.isFinite(n) && n > 0) this.working.width = n;
      });
    });
    new import_obsidian16.Setting(contentEl).setName("Opacity (%)").addText((t) => {
      t.inputEl.type = "number";
      t.setValue(String(Math.round(this.working.opacity * 100)));
      t.onChange((v) => {
        const n = Number(String(v).replace(",", "."));
        if (!Number.isFinite(n)) return;
        const clamped = Math.min(100, Math.max(0, n));
        this.working.opacity = clamped / 100;
      });
    });
    new import_obsidian16.Setting(contentEl).setName("Spacing / cell size (px)").setDesc("Square: cell size. Hex: hex width.").addText((t) => {
      t.inputEl.type = "number";
      t.setValue(String(this.working.spacing));
      t.onChange((v) => {
        const n = Number(String(v).replace(",", "."));
        if (Number.isFinite(n) && n > 1) this.working.spacing = n;
      });
    });
    new import_obsidian16.Setting(contentEl).setName("Offset X / y (px)").setDesc("Absolute anchor in image pixels. For precise alignment use the live alignment command in the map menu.").addText((t) => {
      t.inputEl.type = "number";
      t.setValue(String(this.working.offsetX));
      t.onChange((v) => {
        const n = Number(String(v).replace(",", "."));
        if (Number.isFinite(n)) this.working.offsetX = n;
      });
    }).addText((t) => {
      t.inputEl.type = "number";
      t.setValue(String(this.working.offsetY));
      t.onChange((v) => {
        const n = Number(String(v).replace(",", "."));
        if (Number.isFinite(n)) this.working.offsetY = n;
      });
    });
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const save = footer.createEl("button", { text: "Save" });
    const cancel = footer.createEl("button", { text: "Cancel" });
    save.onclick = () => {
      var _a2, _b2;
      this.working.name = ((_a2 = this.working.name) == null ? void 0 : _a2.trim()) || "Grid";
      this.working.color = ((_b2 = this.working.color) == null ? void 0 : _b2.trim()) || "#ffffff";
      if (!Number.isFinite(this.working.width) || this.working.width <= 0) this.working.width = 1;
      if (!Number.isFinite(this.working.spacing) || this.working.spacing <= 1) this.working.spacing = 64;
      this.working.opacity = Math.min(1, Math.max(0, this.working.opacity));
      this.close();
      this.onDone({ action: "save", grid: this.working });
    };
    cancel.onclick = () => {
      this.close();
      this.onDone({ action: "cancel" });
    };
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/switchPinModal.ts
var import_obsidian17 = require("obsidian");
var SwitchPinModal = class extends import_obsidian17.Modal {
  constructor(app, plugin, initial, onDone) {
    var _a2, _b2, _c;
    super(app);
    this.plugin = plugin;
    this.bases = ((_a2 = initial.bases) != null ? _a2 : []).filter((b) => !!b && typeof b.path === "string" && b.path.trim().length > 0);
    const defaultIcon = ((_b2 = initial.iconKey) != null ? _b2 : "").trim() || this.plugin.settings.defaultIconKey;
    const rotate = !!initial.rotate;
    this.value = {
      iconKey: defaultIcon,
      rotate,
      switchBase: rotate ? void 0 : (_c = initial.switchBase) != null ? _c : "",
      scaleLikeSticker: !!initial.scaleLikeSticker,
      placeAsHudPin: !!initial.placeAsHudPin
    };
    this.onDone = onDone;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Switch pin" });
    new import_obsidian17.Setting(contentEl).setName("Icon").addDropdown((d) => {
      var _a2;
      const sorted = [...(_a2 = this.plugin.settings.icons) != null ? _a2 : []].sort(
        (a, b) => {
          var _a3, _b2;
          return String((_a3 = a.key) != null ? _a3 : "").localeCompare(String((_b2 = b.key) != null ? _b2 : ""), void 0, { sensitivity: "base", numeric: true });
        }
      );
      for (const ico of sorted) {
        if (!(ico == null ? void 0 : ico.key)) continue;
        d.addOption(ico.key, ico.key);
      }
      d.setValue(this.value.iconKey);
      d.onChange((v) => {
        this.value.iconKey = v;
      });
    });
    let baseSetting = null;
    const toggleBaseRow = () => {
      baseSetting == null ? void 0 : baseSetting.settingEl.toggle(!this.value.rotate);
    };
    new import_obsidian17.Setting(contentEl).setName("Rotate (cycle bases)").setDesc("If enabled, right click cycles through all base images.").addToggle((tg) => {
      tg.setValue(this.value.rotate);
      tg.onChange((on) => {
        this.value.rotate = on;
        if (on) this.value.switchBase = void 0;
        toggleBaseRow();
      });
    });
    baseSetting = new import_obsidian17.Setting(contentEl).setName("Switch to base").setDesc("If rotate is disabled, right click switches to this base.").addDropdown((d) => {
      var _a2, _b2, _c;
      d.addOption("", "(none)");
      for (const b of this.bases) {
        const label = ((_a2 = b.name) != null ? _a2 : "").trim() || ((_b2 = b.path.split("/").pop()) != null ? _b2 : b.path);
        d.addOption(b.path, label);
      }
      const cur = ((_c = this.value.switchBase) != null ? _c : "").trim();
      const has = Array.from(d.selectEl.options).some((o) => o.value === cur);
      d.setValue(has ? cur : "");
      d.onChange((v) => {
        const s = (v != null ? v : "").trim();
        this.value.switchBase = s.length ? s : void 0;
      });
    });
    toggleBaseRow();
    new import_obsidian17.Setting(contentEl).setName("Scale like sticker").setDesc("Pin scales with the map (no inverse wrapper).").addToggle((tg) => {
      tg.setValue(this.value.scaleLikeSticker);
      tg.onChange((on) => {
        this.value.scaleLikeSticker = on;
      });
    });
    new import_obsidian17.Setting(contentEl).setName("Place as hud pin").setDesc("Places the pin in viewport space (stays fixed in the window).").addToggle((tg) => {
      tg.setValue(this.value.placeAsHudPin);
      tg.onChange((on) => {
        this.value.placeAsHudPin = on;
      });
    });
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const save = footer.createEl("button", { text: "Save" });
    const cancel = footer.createEl("button", { text: "Cancel" });
    save.onclick = () => {
      this.close();
      this.onDone({ action: "save", value: this.value });
    };
    cancel.onclick = () => {
      this.close();
      this.onDone({ action: "cancel" });
    };
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/textBoxConfigModal.ts
var import_obsidian18 = require("obsidian");
function deepClone4(x2) {
  if (typeof structuredClone === "function") return structuredClone(x2);
  return JSON.parse(JSON.stringify(x2));
}
function normalizeHex2(v) {
  const s = v.trim();
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s)) return s;
  if (s.length === 4) {
    const r = s[1];
    const g = s[2];
    const b = s[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return s;
}
function collectLoadedFontFamilies(doc) {
  const out = /* @__PURE__ */ new Set();
  try {
    const fs = doc.fonts;
    if (fs && typeof fs.forEach === "function") {
      fs.forEach((ff) => {
        var _a2;
        const fam = String((_a2 = ff.family) != null ? _a2 : "").replace(/["']/g, "").trim();
        if (fam) out.add(fam);
      });
    }
  } catch (e) {
  }
  return [...out].sort((a, b) => a.localeCompare(b));
}
function buildFontOptions(doc) {
  const options = [];
  const seen = /* @__PURE__ */ new Set();
  const add = (value, label) => {
    if (seen.has(value)) return;
    seen.add(value);
    options.push({ value, label });
  };
  add("var(--font-text)", "Theme text (default)");
  add("var(--font-interface)", "Theme interface");
  add("var(--font-monospace)", "Theme monospace");
  add("system-ui", "System UI");
  add("sans-serif", "Sans-serif");
  add("serif", "Serif");
  add("monospace", "Monospace");
  for (const fam of collectLoadedFontFamilies(doc)) add(`${fam}, var(--font-text)`, fam);
  return options;
}
var TextBoxConfigModal = class extends import_obsidian18.Modal {
  constructor(app, box, onDone) {
    var _a2, _b2, _c, _d, _e, _f, _g, _h;
    super(app);
    this.working = deepClone4(box);
    this.working.style = this.normalizeStyle(this.working.style);
    (_b2 = (_a2 = this.working).autoFlow) != null ? _b2 : _a2.autoFlow = true;
    (_d = (_c = this.working).allowAngledBaselines) != null ? _d : _c.allowAngledBaselines = false;
    (_f = (_e = this.working).locked) != null ? _f : _e.locked = false;
    if (this.working.mode === "auto") {
      (_h = (_g = this.working).auto) != null ? _h : _g.auto = {
        lineGapPx: 18,
        padLeft: 0,
        padRight: 0,
        padTop: 4,
        padBottom: 4
      };
    }
    this.onDone = onDone;
  }
  onOpen() {
    var _a2, _b2, _c, _d;
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Text box settings" });
    new import_obsidian18.Setting(contentEl).setName("Name").addText((t) => {
      var _a3;
      t.setValue((_a3 = this.working.name) != null ? _a3 : "");
      t.onChange((v) => {
        this.working.name = v.trim() || this.working.name;
      });
    });
    new import_obsidian18.Setting(contentEl).setName("Lock text box").setDesc("Prevents editing and moving this box.").addToggle((tg) => {
      tg.setValue(!!this.working.locked).onChange((on) => {
        this.working.locked = on;
      });
    });
    new import_obsidian18.Setting(contentEl).setName("Auto-flow between baselines").setDesc("If disabled: each baseline keeps its own text.").addToggle((tg) => {
      tg.setValue(this.working.autoFlow !== false).onChange((on) => {
        this.working.autoFlow = on;
      });
    });
    new import_obsidian18.Setting(contentEl).setName("Allow angled baselines").setDesc("If enabled: baselines snap horizontal by default, hold ctrl for free angle.").addToggle((tg) => {
      tg.setValue(!!this.working.allowAngledBaselines).onChange((on) => {
        this.working.allowAngledBaselines = on;
      });
    });
    new import_obsidian18.Setting(contentEl).setName("Mode").setDesc(this.working.mode === "auto" ? "Automatic baselines" : "Custom baselines").addText((t) => {
      t.setValue(this.working.mode);
      t.inputEl.disabled = true;
    });
    contentEl.createEl("h3", { text: "Font" });
    const fontOptions = buildFontOptions(contentEl.ownerDocument);
    const knownValues = new Set(fontOptions.map((o) => o.value));
    const CUSTOM = "__custom__";
    const currentFamily = (_b2 = (_a2 = this.working.style) == null ? void 0 : _a2.fontFamily) != null ? _b2 : "var(--font-text)";
    const initialSelect = knownValues.has(currentFamily) ? currentFamily : CUSTOM;
    let customSetting = null;
    let customInputEl = null;
    new import_obsidian18.Setting(contentEl).setName("Font family").addDropdown((dd) => {
      for (const opt of fontOptions) dd.addOption(opt.value, opt.label);
      dd.addOption(CUSTOM, "Custom\u2026");
      dd.setValue(initialSelect);
      dd.onChange((v) => {
        if (v === CUSTOM) {
          customSetting == null ? void 0 : customSetting.settingEl.toggle(true);
          return;
        }
        this.working.style.fontFamily = v;
        if (customInputEl) customInputEl.value = v;
        customSetting == null ? void 0 : customSetting.settingEl.toggle(false);
      });
    });
    customSetting = new import_obsidian18.Setting(contentEl).setName("Custom font-family").setDesc("CSS font-family value, e.g. Caveat, var(--font-text).");
    customSetting.addText((t) => {
      t.setPlaceholder("Caveat, var(--font-text)");
      t.setValue(currentFamily);
      customInputEl = t.inputEl;
      t.onChange((v) => {
        this.working.style.fontFamily = v.trim() || "var(--font-text)";
      });
    });
    customSetting.settingEl.toggle(initialSelect === CUSTOM);
    new import_obsidian18.Setting(contentEl).setName("Font size (px)").addText((t) => {
      var _a3, _b3;
      t.inputEl.type = "number";
      t.setValue(String((_b3 = (_a3 = this.working.style) == null ? void 0 : _a3.fontSize) != null ? _b3 : 14));
      t.onChange((v) => {
        const n = Number(v);
        if (Number.isFinite(n) && n > 1) this.working.style.fontSize = n;
      });
    });
    const colorRow = new import_obsidian18.Setting(contentEl).setName("Color");
    let colorTextEl;
    const picker = colorRow.controlEl.createEl("input", {
      attr: { type: "color", style: "margin-left:8px; vertical-align: middle;" }
    });
    colorRow.addText((t) => {
      var _a3, _b3;
      t.setPlaceholder("#000000");
      t.setValue((_b3 = (_a3 = this.working.style) == null ? void 0 : _a3.color) != null ? _b3 : "var(--text-normal)");
      colorTextEl = t.inputEl;
      t.onChange((v) => {
        this.working.style.color = v.trim() || "var(--text-normal)";
        const hex = normalizeHex2(this.working.style.color);
        if (/^#([0-9a-f]{6})$/i.test(hex)) picker.value = hex;
      });
    });
    {
      const hex = normalizeHex2((_d = (_c = this.working.style) == null ? void 0 : _c.color) != null ? _d : "");
      if (/^#([0-9a-f]{6})$/i.test(hex)) picker.value = hex;
    }
    picker.oninput = () => {
      this.working.style.color = picker.value;
      colorTextEl.value = picker.value;
    };
    new import_obsidian18.Setting(contentEl).setName("Font weight").addText((t) => {
      var _a3, _b3;
      t.setPlaceholder("400");
      t.setValue((_b3 = (_a3 = this.working.style) == null ? void 0 : _a3.fontWeight) != null ? _b3 : "");
      t.onChange((v) => {
        const s = v.trim();
        this.working.style.fontWeight = s || void 0;
      });
    });
    new import_obsidian18.Setting(contentEl).setName("Italic").addToggle((tg) => {
      var _a3;
      tg.setValue(!!((_a3 = this.working.style) == null ? void 0 : _a3.italic)).onChange((on) => {
        this.working.style.italic = on ? true : void 0;
      });
    });
    new import_obsidian18.Setting(contentEl).setName("Letter spacing (px)").addText((t) => {
      var _a3;
      t.inputEl.type = "number";
      const v = (_a3 = this.working.style) == null ? void 0 : _a3.letterSpacing;
      t.setPlaceholder("0");
      t.setValue(typeof v === "number" ? String(v) : "");
      t.onChange((raw) => {
        const s = raw.trim();
        if (!s) {
          this.working.style.letterSpacing = void 0;
          return;
        }
        const n = Number(s);
        if (Number.isFinite(n)) this.working.style.letterSpacing = n;
      });
    });
    contentEl.createEl("h3", { text: "Layout" });
    new import_obsidian18.Setting(contentEl).setName("Line height (px)").setDesc("Height of each input line box. Leave empty to auto-calc from font size.").addText((t) => {
      var _a3;
      t.inputEl.type = "number";
      const v = (_a3 = this.working.style) == null ? void 0 : _a3.lineHeight;
      t.setPlaceholder("Auto");
      t.setValue(typeof v === "number" ? String(v) : "");
      t.onChange((raw) => {
        const s = raw.trim();
        if (!s) {
          this.working.style.lineHeight = void 0;
          return;
        }
        const n = Number(s);
        if (Number.isFinite(n) && n > 1) this.working.style.lineHeight = n;
      });
    });
    new import_obsidian18.Setting(contentEl).setName("Text padding left / right (px)").addText((t) => {
      var _a3, _b3;
      t.inputEl.type = "number";
      t.setPlaceholder("0");
      t.setValue(String((_b3 = (_a3 = this.working.style) == null ? void 0 : _a3.padLeft) != null ? _b3 : 0));
      t.onChange((v) => {
        const n = Number(v);
        if (Number.isFinite(n) && n >= 0) this.working.style.padLeft = n;
      });
    }).addText((t) => {
      var _a3, _b3;
      t.inputEl.type = "number";
      t.setPlaceholder("0");
      t.setValue(String((_b3 = (_a3 = this.working.style) == null ? void 0 : _a3.padRight) != null ? _b3 : 0));
      t.onChange((v) => {
        const n = Number(v);
        if (Number.isFinite(n) && n >= 0) this.working.style.padRight = n;
      });
    });
    const canConfigureAuto = this.working.mode === "auto" && this.working.sourceDrawingKind !== "polyline";
    if (canConfigureAuto) {
      contentEl.createEl("h3", { text: "Automatic baselines" });
      new import_obsidian18.Setting(contentEl).setName("Line gap (px)").addText((t) => {
        var _a3, _b3;
        t.inputEl.type = "number";
        t.setValue(String((_b3 = (_a3 = this.working.auto) == null ? void 0 : _a3.lineGapPx) != null ? _b3 : 18));
        t.onChange((v) => {
          const n = Number(String(v).replace(",", "."));
          if (Number.isFinite(n) && n > 1) this.working.auto.lineGapPx = n;
        });
      });
      new import_obsidian18.Setting(contentEl).setName("Box inset left / right (px)").setDesc("Shrinks the usable auto-baseline width inside the text box.").addText((t) => {
        var _a3, _b3;
        t.inputEl.type = "number";
        t.setValue(String((_b3 = (_a3 = this.working.auto) == null ? void 0 : _a3.padLeft) != null ? _b3 : 0));
        t.onChange((v) => {
          const n = Number(String(v).replace(",", "."));
          if (Number.isFinite(n) && n >= 0) this.working.auto.padLeft = n;
        });
      }).addText((t) => {
        var _a3, _b3;
        t.inputEl.type = "number";
        t.setValue(String((_b3 = (_a3 = this.working.auto) == null ? void 0 : _a3.padRight) != null ? _b3 : 0));
        t.onChange((v) => {
          const n = Number(String(v).replace(",", "."));
          if (Number.isFinite(n) && n >= 0) this.working.auto.padRight = n;
        });
      });
      new import_obsidian18.Setting(contentEl).setName("Box inset top / bottom (px)").setDesc("Shrinks the usable auto-baseline height inside the text box.").addText((t) => {
        var _a3, _b3;
        t.inputEl.type = "number";
        t.setValue(String((_b3 = (_a3 = this.working.auto) == null ? void 0 : _a3.padTop) != null ? _b3 : 4));
        t.onChange((v) => {
          const n = Number(String(v).replace(",", "."));
          if (Number.isFinite(n) && n >= 0) this.working.auto.padTop = n;
        });
      }).addText((t) => {
        var _a3, _b3;
        t.inputEl.type = "number";
        t.setValue(String((_b3 = (_a3 = this.working.auto) == null ? void 0 : _a3.padBottom) != null ? _b3 : 4));
        t.onChange((v) => {
          const n = Number(String(v).replace(",", "."));
          if (Number.isFinite(n) && n >= 0) this.working.auto.padBottom = n;
        });
      });
    }
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    footer.createEl("button", { text: "Save" }).onclick = () => {
      this.working.style = this.normalizeStyle(this.working.style);
      this.close();
      this.onDone({ action: "save", box: this.working });
    };
    footer.createEl("button", { text: "Cancel" }).onclick = () => {
      this.close();
      this.onDone({ action: "cancel" });
    };
  }
  defaultStyle() {
    return {
      fontFamily: "var(--font-text)",
      fontSize: 14,
      color: "var(--text-normal)",
      fontWeight: "400",
      baselineOffset: 0,
      padLeft: 0,
      padRight: 0
    };
  }
  normalizeStyle(style) {
    var _a2, _b2;
    const s = { ...this.defaultStyle(), ...style != null ? style : {} };
    s.fontFamily = ((_a2 = s.fontFamily) != null ? _a2 : "").trim() || "var(--font-text)";
    s.color = ((_b2 = s.color) != null ? _b2 : "").trim() || "var(--text-normal)";
    if (!Number.isFinite(s.fontSize) || s.fontSize <= 1) s.fontSize = 14;
    if (typeof s.lineHeight === "number" && (!Number.isFinite(s.lineHeight) || s.lineHeight <= 1)) {
      delete s.lineHeight;
    }
    if (typeof s.padLeft !== "number" || !Number.isFinite(s.padLeft) || s.padLeft < 0) s.padLeft = 0;
    if (typeof s.padRight !== "number" || !Number.isFinite(s.padRight) || s.padRight < 0) s.padRight = 0;
    if (typeof s.italic !== "boolean") delete s.italic;
    if (typeof s.letterSpacing === "number" && !Number.isFinite(s.letterSpacing)) delete s.letterSpacing;
    if (s.fontWeight != null) {
      const fw = String(s.fontWeight).trim();
      s.fontWeight = fw.length ? fw : void 0;
    }
    return s;
  }
};

// src/secondScreenLayersModal.ts
var import_obsidian19 = require("obsidian");
var SecondScreenLayersModal = class extends import_obsidian19.Modal {
  constructor(app, input, onDone) {
    super(app);
    this.showGrids = true;
    this.input = input;
    this.onDone = onDone;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.showGrids = !!this.input.showGrids;
    contentEl.createEl("h2", { text: "Second screen layers" });
    contentEl.createEl("div", {
      text: "Choose which layers should be visible when the map is sent to the second screen."
    });
    this.renderSection(contentEl, "Marker layers", this.input.markerLayers);
    this.renderSection(contentEl, "Draw layers", this.input.drawLayers);
    this.renderSection(contentEl, "Text layers", this.input.textLayers);
    contentEl.createEl("h3", { text: "Grids" });
    new import_obsidian19.Setting(contentEl).setName("Show grids on second screen").setDesc("Includes grid overlays in the player screen note.").addToggle((tg) => {
      tg.setValue(this.showGrids).onChange((on) => this.showGrids = on);
    });
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const save = footer.createEl("button", { text: "Save" });
    const cancel = footer.createEl("button", { text: "Cancel" });
    save.onclick = () => {
      this.close();
      this.onDone({
        action: "save",
        markerLayerIds: this.input.markerLayers.filter((x2) => x2.selected).map((x2) => x2.id),
        drawLayerIds: this.input.drawLayers.filter((x2) => x2.selected).map((x2) => x2.id),
        textLayerIds: this.input.textLayers.filter((x2) => x2.selected).map((x2) => x2.id),
        showGrids: this.showGrids
      });
    };
    cancel.onclick = () => {
      this.close();
      this.onDone({ action: "cancel" });
    };
  }
  onClose() {
    this.contentEl.empty();
  }
  renderSection(parent, title, items) {
    parent.createEl("h3", { text: title });
    const actions = parent.createDiv({ cls: "zoommap-modal-footer" });
    const selectAll = actions.createEl("button", { text: "All" });
    const selectNone = actions.createEl("button", { text: "None" });
    const list = parent.createDiv();
    const rerender = () => {
      list.empty();
      if (items.length === 0) {
        list.createEl("div", { text: "None." }).addClass("zoommap-muted");
        return;
      }
      for (const item of items) {
        const row = list.createDiv({ cls: "zoommap-collection-base-row" });
        const cb = row.createEl("input", { type: "checkbox" });
        cb.checked = item.selected;
        cb.onchange = () => {
          item.selected = cb.checked;
        };
        row.createEl("span", { text: item.name || "(unnamed)" });
      }
    };
    selectAll.onclick = () => {
      items.forEach((x2) => x2.selected = true);
      rerender();
    };
    selectNone.onclick = () => {
      items.forEach((x2) => x2.selected = false);
      rerender();
    };
    rerender();
  }
};

// src/dicePinModal.ts
var import_obsidian20 = require("obsidian");
var DEFAULT_DICE_SIDES = [4, 6, 8, 10, 12, 20, 100];
function clampInt(n, min, max2) {
  const v = Math.round(n);
  return Math.min(max2, Math.max(min, v));
}
function toFormula(rolls) {
  const parts = (rolls != null ? rolls : []).filter((r) => r && Number.isFinite(r.count) && Number.isFinite(r.sides) && r.count > 0 && r.sides > 0).map((r) => `${Math.round(r.count)}d${Math.round(r.sides)}`);
  return parts.length ? parts.join(" + ") : "1d20";
}
var DicePinModal = class extends import_obsidian20.Modal {
  constructor(app, plugin, initial, onDone) {
    var _a2, _b2, _c, _d;
    super(app);
    this.plugin = plugin;
    this.onDone = onDone;
    const icons = (_a2 = this.plugin.settings.icons) != null ? _a2 : [];
    const defaultIconKey = ((_b2 = initial.iconKey) != null ? _b2 : "").trim() || this.plugin.settings.defaultIconKey || ((_d = (_c = icons[0]) == null ? void 0 : _c.key) != null ? _d : "pinRed");
    const rollsRaw = Array.isArray(initial.rolls) ? initial.rolls : [{ count: 1, sides: 20 }];
    const rolls = rollsRaw.map((r) => {
      var _a3, _b3;
      return {
        count: clampInt(Number((_a3 = r.count) != null ? _a3 : 1), 1, 999),
        sides: clampInt(Number((_b3 = r.sides) != null ? _b3 : 20), 2, 1e3)
      };
    }).filter((r) => r.count > 0 && r.sides > 0);
    this.value = {
      iconKey: defaultIconKey,
      rolls: rolls.length ? rolls : [{ count: 1, sides: 20 }],
      render3d: !!initial.render3d,
      scaleLikeSticker: !!initial.scaleLikeSticker,
      placeAsHudPin: !!initial.placeAsHudPin
    };
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Dice pin" });
    new import_obsidian20.Setting(contentEl).setName("Icon").addDropdown((d) => {
      var _a2;
      const sorted = [...(_a2 = this.plugin.settings.icons) != null ? _a2 : []].map((i2) => {
        var _a3;
        return (_a3 = i2 == null ? void 0 : i2.key) != null ? _a3 : "";
      }).filter((k) => k.trim().length > 0).sort((a, b) => a.localeCompare(b, void 0, { sensitivity: "base", numeric: true }));
      for (const key of sorted) d.addOption(key, key);
      d.setValue(this.value.iconKey);
      d.onChange((v) => this.value.iconKey = v);
    });
    new import_obsidian20.Setting(contentEl).setName("Graphical roll (3d)").setDesc("Uses dice roller\u2019s dice view (if installed).").addToggle((tg) => {
      tg.setValue(this.value.render3d);
      tg.onChange((on) => this.value.render3d = on);
    });
    new import_obsidian20.Setting(contentEl).setName("Scale like sticker").setDesc("Pin scales with the map (no inverse wrapper).").addToggle((tg) => {
      tg.setValue(this.value.scaleLikeSticker);
      tg.onChange((on) => this.value.scaleLikeSticker = on);
    });
    new import_obsidian20.Setting(contentEl).setName("Place as hud pin").setDesc("Places the pin in viewport space (stays fixed in the window).").addToggle((tg) => {
      tg.setValue(this.value.placeAsHudPin);
      tg.onChange((on) => this.value.placeAsHudPin = on);
    });
    const formulaRow = new import_obsidian20.Setting(contentEl).setName("Formula");
    const formulaEl = formulaRow.controlEl.createEl("code");
    formulaEl.setText(toFormula(this.value.rolls));
    contentEl.createEl("h3", { text: "Dice" });
    const list = contentEl.createDiv({ cls: "zoommap-dice-list" });
    const render = () => {
      var _a2;
      list.empty();
      for (let i2 = 0; i2 < this.value.rolls.length; i2 += 1) {
        const r = this.value.rolls[i2];
        const row = list.createDiv({ cls: "zoommap-dice-row" });
        const countEl = row.createEl("input", { type: "number" });
        countEl.value = String((_a2 = r.count) != null ? _a2 : 1);
        countEl.min = "1";
        countEl.max = "999";
        countEl.oninput = () => {
          const n = Number(countEl.value);
          r.count = clampInt(Number.isFinite(n) ? n : 1, 1, 999);
          countEl.value = String(r.count);
          formulaEl.setText(toFormula(this.value.rolls));
        };
        const sidesEl = row.createEl("select");
        for (const s of DEFAULT_DICE_SIDES) {
          const opt = sidesEl.ownerDocument.createElement("option");
          opt.value = String(s);
          opt.textContent = `d${s}`;
          sidesEl.appendChild(opt);
        }
        const hasCurrent = Array.from(sidesEl.options).some((o) => Number(o.value) === r.sides);
        if (!hasCurrent) {
          const opt = sidesEl.ownerDocument.createElement("option");
          opt.value = String(r.sides);
          opt.textContent = `d${r.sides}`;
          sidesEl.appendChild(opt);
        }
        sidesEl.value = String(r.sides);
        sidesEl.onchange = () => {
          r.sides = clampInt(Number(sidesEl.value), 2, 1e3);
          formulaEl.setText(toFormula(this.value.rolls));
        };
        const del = row.createEl("button", { text: "Delete" });
        del.onclick = () => {
          this.value.rolls.splice(i2, 1);
          if (this.value.rolls.length === 0) this.value.rolls.push({ count: 1, sides: 20 });
          formulaEl.setText(toFormula(this.value.rolls));
          render();
        };
      }
      const add = list.createEl("button", { text: "Add die" });
      add.onclick = () => {
        this.value.rolls.push({ count: 1, sides: 20 });
        formulaEl.setText(toFormula(this.value.rolls));
        render();
      };
    };
    render();
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const save = footer.createEl("button", { text: "Save" });
    const cancel = footer.createEl("button", { text: "Cancel" });
    save.onclick = () => {
      var _a2, _b2;
      const cleaned = ((_a2 = this.value.rolls) != null ? _a2 : []).map((r) => {
        var _a3, _b3;
        return {
          count: clampInt(Number((_a3 = r.count) != null ? _a3 : 1), 1, 999),
          sides: clampInt(Number((_b3 = r.sides) != null ? _b3 : 20), 2, 1e3)
        };
      }).filter((r) => r.count > 0 && r.sides > 0);
      if (!cleaned.length) cleaned.push({ count: 1, sides: 20 });
      this.close();
      this.onDone({
        action: "save",
        value: {
          iconKey: ((_b2 = this.value.iconKey) != null ? _b2 : "").trim(),
          rolls: cleaned,
          render3d: !!this.value.render3d,
          scaleLikeSticker: !!this.value.scaleLikeSticker,
          placeAsHudPin: !!this.value.placeAsHudPin
        }
      });
    };
    cancel.onclick = () => {
      this.close();
      this.onDone({ action: "cancel" });
    };
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/map.ts
var PING_TOOLTIP_BEGIN = "<!-- ZOOMMAP-PING-TOOLTIP:BEGIN -->";
var PING_TOOLTIP_END = "<!-- ZOOMMAP-PING-TOOLTIP:END -->";
var PING_RELATED_BEGIN = "<!-- ZOOMMAP-PING-RELATED:BEGIN -->";
var PING_RELATED_END = "<!-- ZOOMMAP-PING-RELATED:END -->";
var PING_TRAVEL_BEGIN = "<!-- ZOOMMAP-PING-TRAVEL:BEGIN -->";
var PING_TRAVEL_END = "<!-- ZOOMMAP-PING-TRAVEL:END -->";
function clamp(n, min, max2) {
  return Math.min(Math.max(n, min), max2);
}
function basename(p) {
  const idx = p.lastIndexOf("/");
  return idx >= 0 ? p.slice(idx + 1) : p;
}
function setCssProps(el, props) {
  for (const [key, value] of Object.entries(props)) {
    if (value === null) el.style.removeProperty(key);
    else el.style.setProperty(key, value);
  }
}
function cloneForUndo(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}
function insertAtClamped(arr, index, item) {
  arr.splice(Math.max(0, Math.min(index, arr.length)), 0, item);
}
function stableStringify(value) {
  const seen = /* @__PURE__ */ new WeakSet();
  const norm = (v) => {
    if (v && typeof v === "object") {
      if (seen.has(v)) return null;
      seen.add(v);
      if (Array.isArray(v)) return v.map(norm);
      const obj = v;
      const out = {};
      for (const k of Object.keys(obj).sort()) out[k] = norm(obj[k]);
      return out;
    }
    return v;
  };
  return JSON.stringify(norm(value));
}
function stableEqual(a, b) {
  return stableStringify(a) === stableStringify(b);
}
function isImageBitmapLike(x2) {
  return typeof x2 === "object" && x2 !== null && "close" in x2 && typeof x2.close === "function";
}
function isNodeLike(x2) {
  return typeof x2 === "object" && x2 !== null && "nodeType" in x2;
}
function isHtmlImageElementLike(x2) {
  return typeof x2 === "object" && x2 !== null && x2.tagName === "IMG";
}
function isSvgDataUrl(src) {
  return typeof src === "string" && src.startsWith("data:image/svg+xml");
}
function diceRollsToFormula(rolls) {
  const parts = (rolls != null ? rolls : []).filter((r) => r && Number.isFinite(r.count) && Number.isFinite(r.sides) && r.count > 0 && r.sides > 0).map((r) => `${Math.round(r.count)}d${Math.round(r.sides)}`);
  return parts.length ? parts.join(" + ") : "1d20";
}
function localRollDice(rolls) {
  const rs = (rolls != null ? rolls : []).filter((r) => r && Number.isFinite(r.count) && Number.isFinite(r.sides) && r.count > 0 && r.sides > 1);
  const cleaned = rs.length ? rs : [{ count: 1, sides: 20 }];
  const per = [];
  let total = 0;
  for (const r of cleaned) {
    const n = Math.max(1, Math.round(r.count));
    const s = Math.max(2, Math.round(r.sides));
    const vals = [];
    for (let i2 = 0; i2 < n; i2 += 1) {
      const v = 1 + Math.floor(Math.random() * s);
      vals.push(v);
      total += v;
    }
    per.push(`${n}d${s}=[${vals.join(", ")}]`);
  }
  return { total, details: per.join(" + ") };
}
function formatDiceApiResult(x2) {
  if (x2 == null) return "";
  if (typeof x2 === "string") return x2;
  if (typeof x2 === "number" || typeof x2 === "boolean" || typeof x2 === "bigint") return String(x2);
  if (x2 instanceof Error) return x2.message || "Error";
  try {
    return JSON.stringify(x2);
  } catch (e) {
    return "";
  }
}
function splitQuotePrefix(line) {
  const len = line.length;
  let i2 = 0;
  while (i2 < len && (line[i2] === " " || line[i2] === "	")) i2++;
  if (i2 >= len || line[i2] !== ">") return { prefix: "", rest: line };
  while (i2 < len && line[i2] === ">") {
    i2++;
    if (i2 < len && (line[i2] === " " || line[i2] === "	")) i2++;
    let j = i2;
    while (j < len && (line[j] === " " || line[j] === "	")) j++;
    if (j < len && line[j] === ">") {
      i2 = j;
      continue;
    }
    break;
  }
  return { prefix: line.slice(0, i2), rest: line.slice(i2) };
}
function stripQuotePrefix(line) {
  return splitQuotePrefix(line).rest;
}
function tintSvgMarkupLocal(svg, color) {
  var _a2;
  const c = color.trim();
  if (!c) return svg;
  try {
    const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
    const root = doc.querySelector("svg");
    if (!root) return svg;
    const inner = (_a2 = root.querySelector("#zm-inner")) != null ? _a2 : root;
    const base = root.querySelector("#zm-base");
    const outline = root.querySelector("#zm-outline");
    const shapes = inner.querySelectorAll("path, circle, rect, polygon, polyline, line, ellipse");
    let touched = false;
    shapes.forEach((el) => {
      var _a3, _b2;
      if (base && base.contains(el)) return;
      if (outline && outline.contains(el)) return;
      const styleFill = (_a3 = el.style) == null ? void 0 : _a3.fill;
      const styleStroke = (_b2 = el.style) == null ? void 0 : _b2.stroke;
      const fillAttr = el.getAttribute("fill");
      const strokeAttr = el.getAttribute("stroke");
      const hasFill = typeof styleFill === "string" && styleFill && styleFill.toLowerCase() !== "none" || typeof fillAttr === "string" && fillAttr && fillAttr.toLowerCase() !== "none";
      const hasStroke = typeof styleStroke === "string" && styleStroke && styleStroke.toLowerCase() !== "none" || typeof strokeAttr === "string" && strokeAttr && strokeAttr.toLowerCase() !== "none";
      if (hasFill) {
        el.style.fill = c;
        el.setAttribute("fill", c);
        touched = true;
      }
      if (hasStroke) {
        el.style.stroke = c;
        el.setAttribute("stroke", c);
        touched = true;
      }
    });
    if (!touched) {
      inner.setAttribute("fill", c);
    }
    return new XMLSerializer().serializeToString(root);
  } catch (e) {
    return svg;
  }
}
function getMinZoom(m) {
  return m.minZoom;
}
function getMaxZoom(m) {
  return m.maxZoom;
}
function isScaleLikeSticker(m) {
  return !!m.scaleLikeSticker;
}
var MapInstance = class extends import_obsidian21.Component {
  constructor(app, plugin, el, cfg) {
    var _a2, _b2;
    super();
    this.drawEditDrawingId = null;
    this.drawEditMode = null;
    this.drawEditPointIndex = null;
    this.drawEditHandleKind = null;
    this.drawEditPointerId = null;
    this.drawEditOriginalDrawing = null;
    this.gridAlignId = null;
    this.gridAlignPreview = null;
    this.gridAlignOriginalSpacing = null;
    this.zoomHudTimer = null;
    this.initialLayoutDone = false;
    this.initialViewApplied = false;
    this.lastGoodView = null;
    this.overlayMap = /* @__PURE__ */ new Map();
    this.baseCanvas = null;
    this.ctx = null;
    this.baseSource = null;
    this.overlaySources = /* @__PURE__ */ new Map();
    this.overlayLoading = /* @__PURE__ */ new Map();
    // Session-cache tracking (per map instance)
    this.acquiredSessionPaths = /* @__PURE__ */ new Set();
    this.baseIsSvg = false;
    this.svgRasterScale = 1;
    // actual bitmapWidth / logicalWidth for current baseSource
    // Per-note SVG base raster cache (kept while note/tab stays open)
    this.svgBaseCache = /* @__PURE__ */ new Map();
    this.svgUpgradeInFlight = /* @__PURE__ */ new Map();
    // Safety cap (avoid extreme allocations)
    this.svgRasterMaxSidePx = 8192;
    this.textMode = null;
    this.activeTextLayerId = null;
    this.activeTextBoxId = null;
    this.textDrawStart = null;
    this.textDrawPreview = null;
    this.textLineStart = null;
    this.textLinePreview = null;
    this.textInputs = /* @__PURE__ */ new Map();
    this.textDirty = false;
    this.textSaveTimer = null;
    this.textOutsideCleanup = null;
    this.textMoveDragging = false;
    this.textMovePointerId = null;
    this.textDrawBoxMode = "custom";
    this.textMoveStart = null;
    this.textMoveOrig = null;
    this.textMeasureSpan = null;
    // Ping pins (notes + Bases)
    this.pingUpdateTimer = null;
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
    this.drawingHoverAnchorEl = null;
    this.frameLayerEl = null;
    this.viewportFrameEl = null;
    this.frameNaturalW = 0;
    this.frameNaturalH = 0;
    this.ignoreNextModify = false;
    this.ro = null;
    this.calloutMo = null;
    this.ready = false;
    this.openMenu = null;
    this.suppressContextMenuOnce = false;
    this.draggingViewButton = null;
    // Measurement state
    this.measuring = false;
    this.measurePts = [];
    this.measurePreview = null;
    this.measureSegTerrainIds = [];
    // Calibration state
    this.calibrating = false;
    this.calibPts = [];
    this.calibPreview = null;
    // Drawing state
    this.drawingMode = null;
    this.drawingActiveLayerId = null;
    this.drawRectStart = null;
    this.drawCircleCenter = null;
    this.drawPolygonPoints = [];
    this.viewDragDist = 0;
    this.viewDragMoved = false;
    this.suppressTextClickOnce = false;
    this.panRAF = null;
    this.panAccDx = 0;
    this.panAccDy = 0;
    this.activePointers = /* @__PURE__ */ new Map();
    this.pinchActive = false;
    this.pinchStartScale = 1;
    this.pinchStartDist = 0;
    this.pinchPrevCenter = null;
    this.touchGestureCandidate = false;
    this.touchGestureLocked = false;
    this.touchGestureStartX = 0;
    this.touchGestureStartY = 0;
    this.touchGestureLockThresholdPx = 8;
    this.touchGestureEdgeGuardPx = 28;
    this.lastTouchTapTs = 0;
    this.lastTouchTapClient = null;
    this.touchDoubleTapMs = 350;
    this.touchDoubleTapDistPx = 24;
    this.currentBasePath = null;
    this.frameSaveTimer = null;
    this.userResizing = false;
    this.yamlAppliedOnce = false;
    this.secondScreenViewSaveTimer = null;
    this.applyingSecondScreenView = false;
    this.tintedSvgCache = /* @__PURE__ */ new Map();
    this.onNativeTouchStart = (e) => {
      if (!this.canUseNativeTouchCapture()) return;
      if (this.shouldIgnoreNativeTouchCapture(e.target)) return;
      if (e.touches.length <= 0) return;
      const first = e.touches[0];
      const vpRect = this.viewportEl.getBoundingClientRect();
      const x2 = first.clientX - vpRect.left;
      const y = first.clientY - vpRect.top;
      this.touchGestureStartX = x2;
      this.touchGestureStartY = y;
      this.touchGestureCandidate = true;
      this.touchGestureLocked = false;
      const nearEdgeX = x2 <= this.touchGestureEdgeGuardPx || x2 >= vpRect.width - this.touchGestureEdgeGuardPx;
      if (e.touches.length >= 2 || nearEdgeX) {
        this.touchGestureLocked = true;
        this.touchGestureCandidate = false;
        e.preventDefault();
      }
      e.stopPropagation();
    };
    this.onNativeTouchMove = (e) => {
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
          const x2 = first.clientX - vpRect.left;
          const y = first.clientY - vpRect.top;
          const dx = x2 - this.touchGestureStartX;
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
    this.onNativeTouchEnd = (e) => {
      if (e.touches.length === 0) {
        this.resetNativeTouchCapture();
      }
    };
    this.saveDataSoon = /* @__PURE__ */ (() => {
      let t = null;
      return () => new Promise((resolve) => {
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
    this.app = app;
    this.plugin = plugin;
    this.el = el;
    this.cfg = cfg;
    if (this.cfg.storageMode === "note") {
      const id = (_b2 = this.cfg.mapId) != null ? _b2 : `map-${(_a2 = this.cfg.sectionStart) != null ? _a2 : 0}`;
      this.store = new NoteMarkerStore(app, cfg.sourcePath, id, this.cfg.sectionEnd);
    } else {
      this.store = new MarkerStore(app, cfg.sourcePath, cfg.markersPath);
    }
  }
  getSvgRasterMaxScale() {
    var _a2;
    return (_a2 = this.plugin.settings.svgRasterMaxScale) != null ? _a2 : 8;
  }
  ensureMarkerLayersByNames(names) {
    var _a2, _b2;
    if (!this.data) return;
    const list = (names != null ? names : []).map((s) => (s != null ? s : "").trim()).filter(Boolean);
    if (list.length === 0) return;
    (_b2 = (_a2 = this.data).layers) != null ? _b2 : _a2.layers = [{ id: "default", name: "Default", visible: true, locked: false }];
    const existingByName = new Set(this.data.layers.map((l) => {
      var _a3;
      return ((_a3 = l.name) != null ? _a3 : "").trim();
    }));
    for (const name of list) {
      if (existingByName.has(name)) continue;
      const id = generateId("layer");
      this.data.layers.push({ id, name, visible: true, locked: false });
      existingByName.add(name);
    }
  }
  stripYamlScalar(s) {
    const t = s.trim();
    if (t.startsWith('"') && t.endsWith('"') || t.startsWith("'") && t.endsWith("'")) {
      return t.slice(1, -1);
    }
    return t;
  }
  isPlainObject(val) {
    return typeof val === "object" && val !== null && !Array.isArray(val);
  }
  parseZoommapYamlFromBlock(lines, blk) {
    const raw = lines.slice(blk.start + 1, blk.end).map((ln2) => stripQuotePrefix(ln2)).join("\n");
    try {
      const parsed = (0, import_obsidian21.parseYaml)(raw);
      return this.isPlainObject(parsed) ? parsed : null;
    } catch (e) {
      return null;
    }
  }
  firstBasePathFromYaml(obj) {
    const bases = obj["imageBases"];
    if (!Array.isArray(bases) || bases.length === 0) return "";
    const first = bases[0];
    if (typeof first === "string") return first.trim();
    if (this.isPlainObject(first) && typeof first["path"] === "string") return String(first["path"]).trim();
    return "";
  }
  scalarString(obj, key) {
    const v = obj[key];
    return typeof v === "string" ? v.trim() : "";
  }
  computeEffectiveImageFromYaml(obj) {
    return this.scalarString(obj, "image") || this.firstBasePathFromYaml(obj);
  }
  computeEffectiveMarkersFromYaml(obj) {
    const m = this.scalarString(obj, "markers");
    if (m) return m;
    const img = this.computeEffectiveImageFromYaml(obj);
    return img ? `${img}.markers.json` : "";
  }
  findAllZoommapBlocks(lines) {
    const blocks = [];
    for (let i2 = 0; i2 < lines.length; i2++) {
      const ln2 = stripQuotePrefix(lines[i2]).trimStart().toLowerCase();
      if (!ln2.startsWith("```zoommap")) continue;
      let j = i2 + 1;
      while (j < lines.length && !stripQuotePrefix(lines[j]).trimStart().startsWith("```")) j++;
      if (j >= lines.length) break;
      blocks.push({ start: i2, end: j });
      i2 = j;
    }
    return blocks;
  }
  async upsertYamlMarkersPath(newMarkersPath) {
    const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
    if (!(af instanceof import_obsidian21.TFile)) return false;
    let foundBlock = false;
    let didChange = false;
    await this.app.vault.process(af, (text) => {
      var _a2, _b2;
      const lines = text.split("\n");
      const blk = this.findZoommapBlockForThisMap(lines);
      if (!blk) return text;
      foundBlock = true;
      const blkPrefix = splitQuotePrefix((_a2 = lines[blk.start]) != null ? _a2 : "").prefix;
      const content = lines.slice(blk.start + 1, blk.end);
      const keyRe = /^(\s*)markers\s*:\s*(.*)$/i;
      let keyIdx = -1;
      let keyIndent = "";
      let keyPrefix = blkPrefix;
      for (let i2 = 0; i2 < content.length; i2++) {
        const info = splitQuotePrefix(content[i2]);
        const m = keyRe.exec(info.rest);
        if (m) {
          keyIdx = i2;
          keyIndent = (_b2 = m[1]) != null ? _b2 : "";
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
        ...lines.slice(blk.end)
      ].join("\n");
    });
    return foundBlock && didChange;
  }
  computeMarkersPathForBase(basePath) {
    return (0, import_obsidian21.normalizePath)(`${basePath}.markers.json`);
  }
  async ensureFolderForPath(path) {
    const dir = (0, import_obsidian21.normalizePath)(path).split("/").slice(0, -1).join("/");
    if (dir && !this.app.vault.getAbstractFileByPath(dir)) {
      await this.app.vault.createFolder(dir);
    }
  }
  async moveCurrentMarkersFileToBase(newBasePath) {
    if (this.cfg.storageMode !== "json") {
      throw new Error("Cannot move markers.json when storage mode is 'note'.");
    }
    const oldMarkersPath = (0, import_obsidian21.normalizePath)(this.store.getPath());
    const oldAf = this.app.vault.getAbstractFileByPath(oldMarkersPath);
    if (!(oldAf instanceof import_obsidian21.TFile)) {
      throw new Error(`Current markers.json not found: ${oldMarkersPath}`);
    }
    await this.saveDataSoon();
    const wanted = this.computeMarkersPathForBase(newBasePath);
    await this.ensureFolderForPath(wanted);
    let finalPath = (0, import_obsidian21.normalizePath)(wanted);
    const base = finalPath.slice(0, -".markers.json".length);
    let i2 = 1;
    while (this.app.vault.getAbstractFileByPath(finalPath)) {
      finalPath = (0, import_obsidian21.normalizePath)(`${base}-${i2}.markers.json`);
      i2++;
    }
    await this.app.vault.rename(oldAf, finalPath);
    return finalPath;
  }
  readYamlScalarFromBlock(blockLines, key) {
    var _a2;
    const re = new RegExp(`^\\s*${key}\\s*:\\s*(.+)\\s*$`, "i");
    for (const ln2 of blockLines) {
      const rest = stripQuotePrefix(ln2);
      const m = re.exec(rest);
      if (m) return this.stripYamlScalar((_a2 = m[1]) != null ? _a2 : "");
    }
    return null;
  }
  findZoommapBlockForThisMap(lines) {
    var _a2, _b2, _c;
    const wantId = ((_a2 = this.cfg.mapId) != null ? _a2 : "").trim();
    const wantMarkers = this.cfg.storageMode === "json" ? (0, import_obsidian21.normalizePath)((_b2 = this.cfg.markersPath) != null ? _b2 : "") : "";
    const wantImage = (0, import_obsidian21.normalizePath)((_c = this.cfg.imagePath) != null ? _c : "");
    const all = this.findAllZoommapBlocks(lines);
    if (wantId) {
      let found = null;
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
            { id: wantId, duplicates: dupCount + 1, sourcePath: this.cfg.sourcePath }
          );
        }
        return found;
      }
    }
    if (typeof this.cfg.sectionStart === "number") {
      const blk = this.findZoommapBlock(lines, this.cfg.sectionStart);
      if (blk) return blk;
    }
    let best = null;
    for (const blk of all) {
      const y = this.parseZoommapYamlFromBlock(lines, blk);
      if (!y) continue;
      const image = this.computeEffectiveImageFromYaml(y);
      const markers = this.computeEffectiveMarkersFromYaml(y);
      if (!best && wantMarkers && markers && (0, import_obsidian21.normalizePath)(markers) === wantMarkers) {
        best = blk;
        continue;
      }
      if (!best && wantImage && image && (0, import_obsidian21.normalizePath)(image) === wantImage) {
        best = blk;
      }
    }
    return best;
  }
  openViewEditorFromMap() {
    var _a2, _b2, _c, _d, _e, _f;
    if (!this.data) return;
    const bases = this.getBasesNormalized();
    const overlays = (_a2 = this.data.overlays) != null ? _a2 : [];
    const rect = this.viewportEl.getBoundingClientRect();
    const curW = Math.round(rect.width || 0);
    const curH = Math.round(rect.height || 0);
    const cfg = {
      imageBases: bases.map((b) => ({ path: b.path, name: b.name })),
      overlays: overlays.map((o) => ({
        path: o.path,
        name: o.name,
        visible: o.visible
      })),
      markersPath: this.cfg.storageMode === "json" ? this.cfg.markersPath : "",
      renderMode: this.cfg.renderMode,
      minZoom: this.cfg.minZoom,
      maxZoom: this.cfg.maxZoom,
      wrap: !!this.cfg.wrap,
      responsive: !!this.cfg.responsive,
      width: curW > 0 ? `${curW}px` : (_b2 = this.cfg.width) != null ? _b2 : "",
      height: curH > 0 ? `${curH}px` : (_c = this.cfg.height) != null ? _c : "",
      useWidth: !!this.cfg.widthFromYaml,
      useHeight: !!this.cfg.heightFromYaml,
      resizable: !!this.cfg.resizable,
      resizeHandle: (_d = this.cfg.resizeHandle) != null ? _d : "right",
      align: this.cfg.align,
      markerLayers: this.data.layers.map((l) => {
        var _a3;
        return (_a3 = l.name) != null ? _a3 : "Layer";
      }),
      id: this.cfg.mapId,
      viewportFrame: (_e = this.cfg.viewportFrame) != null ? _e : "",
      viewportFrameInsets: (_f = this.cfg.viewportFrameInsets) != null ? _f : {
        unit: "framePx",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    };
    const modal = new ViewEditorModal(this.app, cfg, (res) => {
      if (res.action !== "save" || !res.config) return;
      void this.applyViewEditorResult(res.config);
    }, {
      onPreview: (previewCfg) => {
        this.previewViewportFrameFromViewEditor({
          viewportFrame: previewCfg.viewportFrame,
          viewportFrameInsets: previewCfg.viewportFrameInsets
        });
      }
    });
    modal.open();
  }
  applyInitialView(zoom, center) {
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
  applyInitialViewRect(rect) {
    const r = this.viewportEl.getBoundingClientRect();
    this.vw = r.width;
    this.vh = r.height;
    if (this.vw < 2 || this.vh < 2) return;
    if (!this.imgW || !this.imgH) {
      this.fitToView();
      return;
    }
    const worldW = Math.abs(rect.right - rect.left) * this.imgW;
    const worldH = Math.abs(rect.bottom - rect.top) * this.imgH;
    if (!Number.isFinite(worldW) || !Number.isFinite(worldH) || worldW <= 0 || worldH <= 0) {
      this.fitToView();
      return;
    }
    const center = {
      x: (rect.left + rect.right) / 2,
      y: (rect.top + rect.bottom) / 2
    };
    const zoomX = this.vw / worldW;
    const zoomY = this.vh / worldH;
    const z = clamp(Math.max(zoomX, zoomY), this.cfg.minZoom, this.cfg.maxZoom);
    const worldX = center.x * this.imgW;
    const worldY = center.y * this.imgH;
    const tx = this.vw / 2 - worldX * z;
    const ty = this.vh / 2 - worldY * z;
    this.applyTransform(z, tx, ty);
    this.initialViewApplied = true;
    this.captureViewIfVisible();
    this.renderDrawingEditHandles();
  }
  captureViewIfVisible() {
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
        y: clamp(worldY / this.imgH, 0, 1)
      }
    };
  }
  pushDeleteUndo(payload, label) {
    if (!this.data) return;
    const clonedPayload = cloneForUndo(payload);
    const entry = {
      id: generateId("undo"),
      label: label.trim() || "Deleted item",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      payload: clonedPayload
    };
    const prev = Array.isArray(this.data.deleted) ? this.data.deleted : [];
    this.data.deleted = [entry, ...prev].slice(0, 3);
  }
  getLatestDeleteUndoLabel() {
    var _a2, _b2, _c;
    const label = (_c = (_b2 = (_a2 = this.data) == null ? void 0 : _a2.deleted) == null ? void 0 : _b2[0]) == null ? void 0 : _c.label;
    return typeof label === "string" && label.trim() ? label : null;
  }
  async ensurePingNoteFileForMarker(ping, preset) {
    var _a2, _b2, _c, _d, _e, _f, _g;
    const notePath = ((_a2 = ping.pingNotePath) != null ? _a2 : "").trim();
    if (!notePath) return null;
    const existing = this.app.vault.getAbstractFileByPath(notePath);
    if (existing instanceof import_obsidian21.TFile) return existing;
    await this.ensureFolderForPath(notePath);
    const radius = (_b2 = ping.pingRadius) != null ? _b2 : 0;
    const unit = (_c = ping.pingRadiusUnit) != null ? _c : "km";
    const customUnitId = ping.pingRadiusCustomUnitId;
    const unitLabel = this.pingUnitLabel(unit, customUnitId);
    const distLabel = this.formatPingDistanceLabel(radius, unit, customUnitId);
    const dummyPreset = preset != null ? preset : { id: "", name: "", distances: [], unit: "km" };
    const sections = (_d = preset == null ? void 0 : preset.sections) != null ? _d : {};
    const includeBases = sections.bases !== false;
    const includeTooltips = sections.tooltips !== false;
    const includeRelated = sections.related !== false;
    const includeTravel = sections.travelTimes !== false;
    const fm = {
      zoommapPing: true,
      zoommapPingId: ping.id,
      zoommapPingMapId: (_e = this.cfg.mapId) != null ? _e : "",
      zoommapPingSourcePath: this.cfg.sourcePath,
      zoommapPingSourceFileName: basename(this.cfg.sourcePath),
      zoommapPingBase: this.getActiveBasePath(),
      zoommapPingRadius: radius,
      zoommapPingUnit: unit,
      zoommapPingCustomUnitId: unit === "custom" ? customUnitId : void 0,
      zoommapPingPresetId: (_f = ping.pingPresetId) != null ? _f : "",
      zoommapPingPresetName: (_g = preset == null ? void 0 : preset.name) != null ? _g : "",
      zoommapPingInRangePaths: [],
      zoommapPingDistances: {},
      zoommapPingUpdated: (/* @__PURE__ */ new Date()).toISOString()
    };
    const frontmatter = `---
${(0, import_obsidian21.stringifyYaml)(fm).trimEnd()}
---

`;
    const md = frontmatter + this.buildPingNoteText("", {
      defaultTitle: `# Party pin: ${(preset == null ? void 0 : preset.name) || "Party"} (${distLabel})`,
      baseYamlFallback: this.buildPingBaseYaml(dummyPreset, unitLabel),
      tooltipBody: "*(none)*",
      relatedBody: "*(none)*",
      travelBody: "*(none)*",
      includeBases,
      includeTooltips,
      includeRelated,
      includeTravel
    });
    return this.app.vault.create(notePath, md);
  }
  async undoLastDelete() {
    var _a2, _b2, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z;
    if (!((_b2 = (_a2 = this.data) == null ? void 0 : _a2.deleted) == null ? void 0 : _b2.length)) return;
    const [entry, ...rest] = this.data.deleted;
    const payload = entry.payload;
    let changed = false;
    this.stopTextEdit(false);
    this.finishTextBoxMove(false);
    this.stopEditDrawingGeometry(false);
    this.closeMenu();
    switch (payload.kind) {
      case "marker": {
        (_d = (_c = this.data).markers) != null ? _d : _c.markers = [];
        insertAtClamped(this.data.markers, payload.index, cloneForUndo(payload.marker));
        changed = true;
        break;
      }
      case "drawing": {
        (_f = (_e = this.data).drawings) != null ? _f : _e.drawings = [];
        insertAtClamped(this.data.drawings, payload.index, cloneForUndo(payload.drawing));
        changed = true;
        break;
      }
      case "grid": {
        (_h = (_g = this.data).grids) != null ? _h : _g.grids = [];
        insertAtClamped(this.data.grids, payload.index, cloneForUndo(payload.grid));
        changed = true;
        break;
      }
      case "text-layer": {
        (_j = (_i = this.data).textLayers) != null ? _j : _i.textLayers = [];
        insertAtClamped(this.data.textLayers, payload.index, cloneForUndo(payload.layer));
        changed = true;
        break;
      }
      case "text-box": {
        const layer = ((_k = this.data.textLayers) != null ? _k : []).find((l) => l.id === payload.layerId);
        if (layer) {
          (_l = layer.boxes) != null ? _l : layer.boxes = [];
          insertAtClamped(layer.boxes, payload.index, cloneForUndo(payload.box));
          changed = true;
        }
        break;
      }
      case "marker-layer": {
        (_n = (_m = this.data).layers) != null ? _n : _m.layers = [];
        if (!((_o = this.data.layers) != null ? _o : []).some((l) => l.id === payload.layer.id)) {
          insertAtClamped(this.data.layers, payload.index, cloneForUndo(payload.layer));
        }
        if (payload.mode === "delete-markers") {
          (_q = (_p = this.data).markers) != null ? _q : _p.markers = [];
          for (const item of (_r = payload.markers) != null ? _r : []) {
            insertAtClamped(this.data.markers, item.index, cloneForUndo(item.marker));
          }
        } else {
          const moved = new Set((_s = payload.movedMarkerIds) != null ? _s : []);
          for (const marker of (_t = this.data.markers) != null ? _t : []) {
            if (moved.has(marker.id)) marker.layer = payload.layer.id;
          }
        }
        changed = true;
        break;
      }
      case "draw-layer": {
        (_v = (_u = this.data).drawLayers) != null ? _v : _u.drawLayers = [];
        if (!((_w = this.data.drawLayers) != null ? _w : []).some((l) => l.id === payload.layer.id)) {
          insertAtClamped(this.data.drawLayers, payload.index, cloneForUndo(payload.layer));
        }
        (_y = (_x = this.data).drawings) != null ? _y : _x.drawings = [];
        for (const item of (_z = payload.drawings) != null ? _z : []) {
          insertAtClamped(this.data.drawings, item.index, cloneForUndo(item.drawing));
        }
        changed = true;
        break;
      }
    }
    if (!changed) return;
    this.data.deleted = rest;
    this.renderAll();
    await this.saveDataSoon();
    this.schedulePingUpdate();
    new import_obsidian21.Notice(`Undo: ${entry.label}`, 1400);
  }
  async saveDefaultViewToYaml() {
    const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
    if (!(af instanceof import_obsidian21.TFile)) {
      new import_obsidian21.Notice("Source note not found.", 2500);
      return;
    }
    const z = this.scale;
    if (!this.imgW || !this.imgH || !Number.isFinite(z) || z <= 0) {
      new import_obsidian21.Notice("Cannot store default view (image not ready).", 2500);
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
      var _a2, _b2;
      const lines = text.split("\n");
      const blk = this.findZoommapBlockForThisMap(lines);
      if (!blk) return text;
      foundBlock = true;
      const blkPrefix = splitQuotePrefix((_a2 = lines[blk.start]) != null ? _a2 : "").prefix;
      const content = lines.slice(blk.start + 1, blk.end);
      const keyRe = /^(\s*)view\s*:/;
      let keyIdx = -1;
      let keyIndent = "";
      let keyPrefix = blkPrefix;
      for (let i2 = 0; i2 < content.length; i2++) {
        const info = splitQuotePrefix(content[i2]);
        const m = keyRe.exec(info.rest);
        if (m) {
          keyIdx = i2;
          keyIndent = (_b2 = m[1]) != null ? _b2 : "";
          keyPrefix = info.prefix || blkPrefix;
          break;
        }
      }
      const viewLines = [
        `${keyPrefix}${keyIndent}view:`,
        `${keyPrefix}${keyIndent}  zoom: ${zoom.toFixed(4)}`,
        `${keyPrefix}${keyIndent}  centerX: ${cx.toFixed(6)}`,
        `${keyPrefix}${keyIndent}  centerY: ${cy.toFixed(6)}`
      ];
      const isNextTopLevelKey = (ln2) => {
        var _a3, _b3;
        const rest = stripQuotePrefix(ln2);
        const trimmed = rest.trim();
        if (!trimmed) return false;
        if (trimmed.startsWith("#")) return false;
        const spaces = (_b3 = (_a3 = /^\s*/.exec(rest)) == null ? void 0 : _a3[0].length) != null ? _b3 : 0;
        return spaces <= keyIndent.length && /^[A-Za-z0-9_-]+\s*:/.test(trimmed);
      };
      let newContent;
      if (keyIdx >= 0) {
        let end = keyIdx + 1;
        while (end < content.length && !isNextTopLevelKey(content[end])) end++;
        newContent = [
          ...content.slice(0, keyIdx),
          ...viewLines,
          ...content.slice(end)
        ];
      } else {
        const indent = this.detectYamlKeyIndent(content);
        const pfx = blkPrefix;
        const vLines = [
          `${pfx}${indent}view:`,
          `${pfx}${indent}  zoom: ${zoom.toFixed(4)}`,
          `${pfx}${indent}  centerX: ${cx.toFixed(6)}`,
          `${pfx}${indent}  centerY: ${cy.toFixed(6)}`
        ];
        newContent = [...content, ...vLines];
      }
      if (newContent.join("\n") !== content.join("\n")) didChange = true;
      return [
        ...lines.slice(0, blk.start + 1),
        ...newContent,
        ...lines.slice(blk.end)
      ].join("\n");
    });
    if (!foundBlock) {
      new import_obsidian21.Notice("Could not locate zoommap block (embedded/callout?).", 3500);
      return;
    }
    if (!didChange) {
      new import_obsidian21.Notice("Default view unchanged (already up to date).", 2e3);
      return;
    }
    new import_obsidian21.Notice("Default view stored in YAML.", 2e3);
  }
  async deleteDefaultViewFromYaml() {
    const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
    if (!(af instanceof import_obsidian21.TFile)) {
      new import_obsidian21.Notice("Source note not found.", 2500);
      return;
    }
    let foundBlock = false;
    let didChange = false;
    await this.app.vault.process(af, (text) => {
      var _a2, _b2;
      const lines = text.split("\n");
      const blk = this.findZoommapBlockForThisMap(lines);
      if (!blk) return text;
      foundBlock = true;
      const blkPrefix = splitQuotePrefix((_a2 = lines[blk.start]) != null ? _a2 : "").prefix;
      const content = lines.slice(blk.start + 1, blk.end);
      const keyRe = /^(\s*)view\s*:/i;
      let keyIdx = -1;
      let keyIndent = "";
      for (let i2 = 0; i2 < content.length; i2++) {
        const info = splitQuotePrefix(content[i2]);
        const m = keyRe.exec(info.rest);
        if (m) {
          keyIdx = i2;
          keyIndent = (_b2 = m[1]) != null ? _b2 : "";
          break;
        }
      }
      if (keyIdx < 0) return text;
      const isNextTopLevelKey = (ln2) => {
        var _a3, _b3;
        const rest = stripQuotePrefix(ln2);
        const trimmed = rest.trim();
        if (!trimmed) return false;
        if (trimmed.startsWith("#")) return false;
        const spaces = (_b3 = (_a3 = /^\s*/.exec(rest)) == null ? void 0 : _a3[0].length) != null ? _b3 : 0;
        return spaces <= keyIndent.length && /^[A-Za-z0-9_-]+\s*:/.test(trimmed);
      };
      let end = keyIdx + 1;
      while (end < content.length && !isNextTopLevelKey(content[end])) end++;
      const newContent = [
        ...content.slice(0, keyIdx),
        ...content.slice(end)
      ];
      if (newContent.join("\n") !== content.join("\n")) didChange = true;
      return [
        ...lines.slice(0, blk.start + 1),
        ...newContent.map((ln2) => blkPrefix ? blkPrefix + stripQuotePrefix(ln2) : ln2),
        ...lines.slice(blk.end)
      ].join("\n");
    });
    if (!foundBlock) {
      new import_obsidian21.Notice("Could not locate zoommap block (embedded/callout?).", 3500);
      return;
    }
    if (!didChange) {
      new import_obsidian21.Notice("No default view found in YAML.", 2e3);
      return;
    }
    new import_obsidian21.Notice("Default view removed from YAML.", 2e3);
  }
  async applyViewEditorResult(cfg) {
    const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
    if (!(af instanceof import_obsidian21.TFile)) {
      new import_obsidian21.Notice("Source note not found.", 3e3);
      return;
    }
    const buildYaml = (pluginCfg) => this.plugin.buildYamlFromViewConfig(pluginCfg);
    let foundBlock = false;
    let didChange = false;
    await this.app.vault.process(af, (text) => {
      var _a2, _b2;
      const lines = text.split("\n");
      const blk = this.findZoommapBlockForThisMap(lines);
      if (!blk) return text;
      foundBlock = true;
      const blkPrefix = splitQuotePrefix((_a2 = lines[blk.start]) != null ? _a2 : "").prefix;
      const existingObj = (_b2 = this.parseZoommapYamlFromBlock(lines, blk)) != null ? _b2 : {};
      const nextYamlStr = buildYaml(cfg);
      let nextObj = {};
      try {
        const parsed = (0, import_obsidian21.parseYaml)(nextYamlStr);
        if (this.isPlainObject(parsed)) nextObj = parsed;
      } catch (e) {
        nextObj = {};
      }
      const merged = { ...existingObj, ...nextObj };
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
        "viewportFrameInsets"
      ];
      for (const k of managedKeys) {
        if (!(k in nextObj) && k in merged) {
          delete merged[k];
        }
      }
      const mergedYamlStr = (0, import_obsidian21.stringifyYaml)(merged).trimEnd();
      const yamlLinesRaw = mergedYamlStr.split("\n");
      const yamlLines = blkPrefix ? yamlLinesRaw.map((ln2) => `${blkPrefix}${ln2}`) : yamlLinesRaw;
      const before = lines.slice(blk.start + 1, blk.end).join("\n");
      const after = yamlLines.join("\n");
      if (before !== after) didChange = true;
      return [
        ...lines.slice(0, blk.start + 1),
        ...yamlLines,
        ...lines.slice(blk.end)
      ].join("\n");
    });
    if (!foundBlock) {
      new import_obsidian21.Notice("Could not locate zoommap block (embedded/callout?).", 3500);
      return;
    }
    if (!didChange) {
      new import_obsidian21.Notice("No changes to apply.", 2e3);
      return;
    }
    try {
      this.ensureMarkerLayersByNames(cfg.markerLayers);
      await this.saveDataSoon();
      this.renderMarkersOnly();
    } catch (e) {
      console.warn("Failed to apply markerLayers to marker store", e);
    }
    new import_obsidian21.Notice("View updated.", 2500);
  }
  getScreenDisplayPlugin() {
    var _a2, _b2;
    const registry = (_b2 = (_a2 = this.app.plugins) == null ? void 0 : _a2.plugins) != null ? _b2 : {};
    const raw = registry["ttrpg-tools-screen"];
    if (!raw || typeof raw.sendNoteByPath !== "function" || typeof raw.sendMarkdownWithFog !== "function") return null;
    return {
      sendNoteByPath: raw.sendNoteByPath.bind(raw),
      sendMarkdownWithFog: raw.sendMarkdownWithFog.bind(raw),
      sendZoomMap: typeof raw.sendZoomMap === "function" ? raw.sendZoomMap.bind(raw) : void 0
    };
  }
  isSecondScreenPlayerView() {
    return this.cfg.screenRole === "player";
  }
  isSecondScreenControllerView() {
    return this.cfg.screenRole === "controller";
  }
  getRevealedMarkerIdSet() {
    var _a2, _b2;
    const ids = (_b2 = (_a2 = this.data) == null ? void 0 : _a2.secondScreen) == null ? void 0 : _b2.revealedMarkerIds;
    return new Set(Array.isArray(ids) ? ids : []);
  }
  secondScreenFeatureEnabled() {
    return !!this.plugin.settings.enableSecondScreen;
  }
  ensureSecondScreenConfig() {
    var _a2, _b2;
    if (!this.data) throw new Error("Map data not loaded.");
    (_b2 = (_a2 = this.data).secondScreen) != null ? _b2 : _a2.secondScreen = {};
    return this.data.secondScreen;
  }
  getSecondScreenSelectedIds() {
    var _a2, _b2, _c;
    if (!this.data) {
      return {
        markerLayerIds: /* @__PURE__ */ new Set(),
        drawLayerIds: /* @__PURE__ */ new Set(),
        textLayerIds: /* @__PURE__ */ new Set()
      };
    }
    const sec = this.ensureSecondScreenConfig();
    const markerLayerIds = Array.isArray(sec.markerLayerIds) ? new Set(sec.markerLayerIds) : new Set(((_a2 = this.data.layers) != null ? _a2 : []).map((l) => l.id));
    const drawLayerIds = Array.isArray(sec.drawLayerIds) ? new Set(sec.drawLayerIds) : new Set(((_b2 = this.data.drawLayers) != null ? _b2 : []).map((l) => l.id));
    const textLayerIds = Array.isArray(sec.textLayerIds) ? new Set(sec.textLayerIds) : new Set(((_c = this.data.textLayers) != null ? _c : []).map((l) => l.id));
    return { markerLayerIds, drawLayerIds, textLayerIds };
  }
  openSecondScreenLayersModal() {
    var _a2, _b2, _c, _d, _e, _f;
    if (!this.data) return;
    const sec = this.ensureSecondScreenConfig();
    const markerSelected = Array.isArray(sec.markerLayerIds) ? new Set(sec.markerLayerIds) : new Set(((_a2 = this.data.layers) != null ? _a2 : []).map((l) => l.id));
    const drawSelected = Array.isArray(sec.drawLayerIds) ? new Set(sec.drawLayerIds) : new Set(((_b2 = this.data.drawLayers) != null ? _b2 : []).map((l) => l.id));
    const textSelected = Array.isArray(sec.textLayerIds) ? new Set(sec.textLayerIds) : new Set(((_c = this.data.textLayers) != null ? _c : []).map((l) => l.id));
    new SecondScreenLayersModal(
      this.app,
      {
        markerLayers: ((_d = this.data.layers) != null ? _d : []).map((l) => {
          var _a3;
          return {
            id: l.id,
            name: (_a3 = l.name) != null ? _a3 : "Layer",
            selected: markerSelected.has(l.id)
          };
        }),
        drawLayers: ((_e = this.data.drawLayers) != null ? _e : []).map((l) => {
          var _a3;
          return {
            id: l.id,
            name: (_a3 = l.name) != null ? _a3 : "Draw layer",
            selected: drawSelected.has(l.id)
          };
        }),
        textLayers: ((_f = this.data.textLayers) != null ? _f : []).map((l) => {
          var _a3;
          return {
            id: l.id,
            name: (_a3 = l.name) != null ? _a3 : "Text layer",
            selected: textSelected.has(l.id)
          };
        }),
        showGrids: sec.showGrids !== false
      },
      (res) => {
        if (res.action !== "save" || !this.data) return;
        const cfg = this.ensureSecondScreenConfig();
        cfg.markerLayerIds = res.markerLayerIds;
        cfg.showGrids = res.showGrids;
        cfg.drawLayerIds = res.drawLayerIds;
        cfg.textLayerIds = res.textLayerIds;
        void this.saveDataSoon();
        new import_obsidian21.Notice("Player screen layer setup saved.", 1200);
      }
    ).open();
  }
  async readMarkerFileDataFromPath(path) {
    try {
      const af = this.app.vault.getAbstractFileByPath((0, import_obsidian21.normalizePath)(path));
      if (!(af instanceof import_obsidian21.TFile)) return null;
      const raw = await this.app.vault.read(af);
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }
  mergeSecondScreenSnapshotWithExisting(snapshot, existing) {
    var _a2, _b2, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t;
    if (!existing) {
      (_a2 = snapshot.secondScreen) != null ? _a2 : snapshot.secondScreen = {};
      (_c = (_b2 = snapshot.secondScreen).revealedMarkerIds) != null ? _c : _b2.revealedMarkerIds = [];
      return snapshot;
    }
    const existingSecond = (_d = existing.secondScreen) != null ? _d : {};
    snapshot.secondScreen = {
      ...(_e = snapshot.secondScreen) != null ? _e : {},
      revealedMarkerIds: Array.isArray(existingSecond.revealedMarkerIds) ? [...existingSecond.revealedMarkerIds] : [],
      view: existingSecond.view,
      fogMaskPath: existingSecond.fogMaskPath,
      fogVersion: existingSecond.fogVersion,
      notePath: (_g = (_f = snapshot.secondScreen) == null ? void 0 : _f.notePath) != null ? _g : existingSecond.notePath,
      markersPath: (_i = (_h = snapshot.secondScreen) == null ? void 0 : _h.markersPath) != null ? _i : existingSecond.markersPath,
      markerLayerIds: (_k = (_j = snapshot.secondScreen) == null ? void 0 : _j.markerLayerIds) != null ? _k : existingSecond.markerLayerIds,
      drawLayerIds: (_m = (_l = snapshot.secondScreen) == null ? void 0 : _l.drawLayerIds) != null ? _m : existingSecond.drawLayerIds,
      textLayerIds: (_o = (_n = snapshot.secondScreen) == null ? void 0 : _n.textLayerIds) != null ? _o : existingSecond.textLayerIds,
      showGrids: (_q = (_p = snapshot.secondScreen) == null ? void 0 : _p.showGrids) != null ? _q : existingSecond.showGrids
    };
    const existingMarkers = new Map(((_r = existing.markers) != null ? _r : []).map((m) => [m.id, m]));
    snapshot.markers = ((_s = snapshot.markers) != null ? _s : []).map((fresh) => {
      const old = existingMarkers.get(fresh.id);
      if (!old) return fresh;
      const merged = {
        ...fresh,
        x: old.x,
        y: old.y,
        anchorSpace: old.anchorSpace,
        hudX: old.hudX,
        hudY: old.hudY,
        hudModeX: old.hudModeX,
        hudModeY: old.hudModeY,
        hudLastWidth: old.hudLastWidth,
        hudLastHeight: old.hudLastHeight
      };
      if (typeof old.swapIndex === "number") merged.swapIndex = old.swapIndex;
      return merged;
    });
    const existingBasePaths = new Set(
      ((_t = snapshot.bases) != null ? _t : []).map((b) => typeof b === "string" ? b : b.path)
    );
    if (existing.activeBase && existingBasePaths.has(existing.activeBase)) {
      snapshot.activeBase = existing.activeBase;
    }
    return snapshot;
  }
  async buildSecondScreenSnapshot(playerMarkersPath, notePath) {
    var _a2, _b2, _c, _d, _e, _f, _g;
    if (!this.data) throw new Error("Map data not loaded.");
    const snapshot = JSON.parse(
      JSON.stringify(sanitizeMarkerFileDataForSave(this.data))
    );
    const sec = this.ensureSecondScreenConfig();
    const { markerLayerIds, drawLayerIds, textLayerIds } = this.getSecondScreenSelectedIds();
    snapshot.layers = ((_a2 = snapshot.layers) != null ? _a2 : []).map((l) => ({
      ...l,
      visible: markerLayerIds.has(l.id),
      locked: false
    }));
    snapshot.markers = ((_b2 = snapshot.markers) != null ? _b2 : []).filter((m) => markerLayerIds.has(m.layer));
    snapshot.drawLayers = ((_c = snapshot.drawLayers) != null ? _c : []).map((l) => ({
      ...l,
      visible: drawLayerIds.has(l.id),
      locked: false
    }));
    snapshot.drawings = ((_d = snapshot.drawings) != null ? _d : []).filter((d) => drawLayerIds.has(d.layerId));
    const showGrids = sec.showGrids !== false;
    snapshot.grids = showGrids ? ((_e = snapshot.grids) != null ? _e : []).filter((g) => g.visible !== false && g.playerScreen !== "gm-only") : [];
    snapshot.textLayers = ((_f = snapshot.textLayers) != null ? _f : []).filter((t) => textLayerIds.has(t.id));
    (_g = snapshot.secondScreen) != null ? _g : snapshot.secondScreen = {};
    snapshot.secondScreen.notePath = notePath;
    snapshot.secondScreen.markersPath = playerMarkersPath;
    snapshot.secondScreen.markerLayerIds = [...markerLayerIds];
    snapshot.secondScreen.drawLayerIds = [...drawLayerIds];
    snapshot.secondScreen.textLayerIds = [...textLayerIds];
    snapshot.secondScreen.showGrids = sec.showGrids !== false;
    const existing = await this.readMarkerFileDataFromPath(playerMarkersPath);
    return this.mergeSecondScreenSnapshotWithExisting(snapshot, existing);
  }
  getCurrentViewForSecondScreen() {
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
      centerY: clamp(worldY / this.imgH, 0, 1)
    };
  }
  getCurrentViewRectForSecondScreen() {
    if (!this.imgW || !this.imgH) return null;
    const r = this.viewportEl.getBoundingClientRect();
    const vw = r.width || this.vw || 0;
    const vh = r.height || this.vh || 0;
    if (vw < 2 || vh < 2) return null;
    return {
      left: (0 - this.tx) / this.scale / this.imgW,
      top: (0 - this.ty) / this.scale / this.imgH,
      right: (vw - this.tx) / this.scale / this.imgW,
      bottom: (vh - this.ty) / this.scale / this.imgH
    };
  }
  getCurrentOuterAspectForSecondScreen() {
    const r = this.el.getBoundingClientRect();
    const w = r.width || 0;
    const h = r.height || 0;
    if (w < 2 || h < 2) return null;
    return w / h;
  }
  buildSecondScreenNoteContent(markersPath, role) {
    var _a2;
    const view = this.getCurrentViewForSecondScreen();
    const viewRect = this.getCurrentViewRectForSecondScreen();
    const aspect = this.getCurrentOuterAspectForSecondScreen();
    const padPx = 32;
    const availW = `var(--ttrpg-screen-avail-w, calc(100vw - ${padPx}px))`;
    const availH = `var(--ttrpg-screen-avail-h, calc(100vh - ${padPx}px))`;
    const width = aspect && Number.isFinite(aspect) && aspect > 0 ? `min(${availW}, calc(${availH} * ${aspect.toFixed(6)}))` : availW;
    const height = aspect && Number.isFinite(aspect) && aspect > 0 ? `min(calc(${availW} / ${aspect.toFixed(6)}), ${availH})` : availH;
    const yaml = {
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
      displayOnly: role === "player",
      screenRole: role
    };
    if ((_a2 = this.cfg.viewportFrame) == null ? void 0 : _a2.trim()) {
      yaml.viewportFrame = this.cfg.viewportFrame.trim();
    }
    if (this.cfg.viewportFrameInsets) {
      yaml.viewportFrameInsets = {
        unit: this.cfg.viewportFrameInsets.unit,
        top: this.cfg.viewportFrameInsets.top,
        right: this.cfg.viewportFrameInsets.right,
        bottom: this.cfg.viewportFrameInsets.bottom,
        left: this.cfg.viewportFrameInsets.left
      };
    }
    if (view) {
      yaml.view = {
        zoom: Number(view.zoom.toFixed(4)),
        centerX: Number(view.centerX.toFixed(6)),
        centerY: Number(view.centerY.toFixed(6)),
        ...viewRect ? {
          left: Number(viewRect.left.toFixed(6)),
          top: Number(viewRect.top.toFixed(6)),
          right: Number(viewRect.right.toFixed(6)),
          bottom: Number(viewRect.bottom.toFixed(6)),
          fit: "cover"
        } : {}
      };
    }
    return `\`\`\`zoommap
${(0, import_obsidian21.stringifyYaml)(yaml).trimEnd()}
\`\`\`
`;
  }
  async sendToSecondScreen(useFog = false) {
    var _a2, _b2, _c, _d, _e;
    if (!this.data) return;
    if (!this.secondScreenFeatureEnabled()) {
      new import_obsidian21.Notice("Player screen integration is disabled in preferences.", 2500);
      return;
    }
    const screen = this.getScreenDisplayPlugin();
    if (!screen) {
      new import_obsidian21.Notice("Player screen plugin not found or not enabled.", 3500);
      return;
    }
    const folder = (0, import_obsidian21.normalizePath)(
      ((_a2 = this.plugin.settings.secondScreenFolder) != null ? _a2 : "ZoomMap/SecondScreen").trim() || "ZoomMap/SecondScreen"
    );
    const sec = this.ensureSecondScreenConfig();
    const stemBase = ((_b2 = this.cfg.mapId) == null ? void 0 : _b2.trim()) || basename(this.getActiveBasePath()).replace(/\.[^.]+$/, "") || "map";
    const safeStem = this.sanitizeFileName(`${stemBase}-screen`);
    const notePath = (0, import_obsidian21.normalizePath)((_c = sec.notePath) != null ? _c : `${folder}/${safeStem}.md`);
    const markersPath = (0, import_obsidian21.normalizePath)((_d = sec.markersPath) != null ? _d : `${folder}/${safeStem}.markers.json`);
    await this.ensureFolderForPath(notePath);
    await this.ensureFolderForPath(markersPath);
    const snapshot = await this.buildSecondScreenSnapshot(markersPath, notePath);
    const json = JSON.stringify(sanitizeMarkerFileDataForSave(snapshot), null, 2);
    const screenMarkdown = this.buildSecondScreenNoteContent(markersPath, "player");
    const controllerMarkdown = this.buildSecondScreenNoteContent(markersPath, "controller");
    const markerAf = this.app.vault.getAbstractFileByPath(markersPath);
    if (markerAf instanceof import_obsidian21.TFile) {
      await this.app.vault.modify(markerAf, json);
    } else {
      await this.app.vault.create(markersPath, json);
    }
    const noteAf = this.app.vault.getAbstractFileByPath(notePath);
    if (noteAf instanceof import_obsidian21.TFile) {
      await this.app.vault.modify(noteAf, screenMarkdown);
    } else {
      await this.app.vault.create(notePath, screenMarkdown);
    }
    const fogKey = `zoommap-secondscreen:${markersPath}`;
    sec.notePath = notePath;
    sec.markersPath = markersPath;
    await this.saveDataSoon();
    if (screen.sendZoomMap) {
      await screen.sendZoomMap({
        title: ((_e = this.cfg.mapId) == null ? void 0 : _e.trim()) || basename(this.getActiveBasePath()),
        screenMarkdown,
        controllerMarkdown,
        sourcePath: notePath,
        sourceMarkersPath: this.store.getPath(),
        playerMarkersPath: markersPath,
        playerNotePath: notePath,
        mapId: this.cfg.mapId,
        fogKey: useFog ? fogKey : void 0
      });
    } else if (useFog) {
      await screen.sendMarkdownWithFog(screenMarkdown, notePath, fogKey);
    } else {
      await screen.sendNoteByPath(notePath);
    }
  }
  hasViewportFrame() {
    return typeof this.cfg.viewportFrame === "string" && this.cfg.viewportFrame.trim().length > 0;
  }
  getOuterSizePx() {
    const w = this.el.clientWidth || this.el.getBoundingClientRect().width || 1;
    const h = this.el.clientHeight || this.el.getBoundingClientRect().height || 1;
    return { w, h };
  }
  clampInsetsToMinInner(outerW, outerH, insets) {
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
      l: Math.max(0, Math.round(l))
    };
  }
  computeViewportInsetsPx(outerW, outerH) {
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
  applyViewportInset() {
    const { w, h } = this.getOuterSizePx();
    const { t, r, b, l } = this.computeViewportInsetsPx(w, h);
    this.viewportEl.style.inset = `${t}px ${r}px ${b}px ${l}px`;
    if (this.hudClipEl) {
      this.hudClipEl.style.inset = `${t}px ${r}px ${b}px ${l}px`;
    }
  }
  async loadViewportFrameNaturalSize() {
    const img = this.viewportFrameEl;
    if (!img) return;
    try {
      await img.decode();
    } catch (e) {
    }
    this.frameNaturalW = img.naturalWidth || 0;
    this.frameNaturalH = img.naturalHeight || 0;
  }
  previewViewportFrameFromViewEditor(cfg) {
    void this.previewViewportFrameFromViewEditorAsync(cfg);
  }
  async previewViewportFrameFromViewEditorAsync(cfg) {
    var _a2, _b2, _c, _d;
    const nextFrame = ((_a2 = cfg.viewportFrame) != null ? _a2 : "").trim();
    this.cfg.viewportFrame = nextFrame.length ? nextFrame : void 0;
    this.cfg.viewportFrameInsets = cfg.viewportFrameInsets;
    const wantFrame = typeof this.cfg.viewportFrame === "string" && this.cfg.viewportFrame.trim().length > 0;
    this.el.classList.toggle("zm-root--framepad", wantFrame);
    if (!wantFrame) {
      (_b2 = this.viewportFrameEl) == null ? void 0 : _b2.remove();
      this.viewportFrameEl = null;
      (_c = this.frameLayerEl) == null ? void 0 : _c.remove();
      this.frameLayerEl = null;
      this.frameNaturalW = 0;
      this.frameNaturalH = 0;
      this.applyViewportInset();
      this.onResize();
      return;
    }
    if (!this.frameLayerEl) {
      this.frameLayerEl = this.el.createDiv({ cls: "zm-frame-layer" });
    }
    if (!this.viewportFrameEl) {
      const img = this.frameLayerEl.createEl("img", { cls: "zm-viewport-frame" });
      img.decoding = "async";
      img.draggable = false;
      this.viewportFrameEl = img;
    }
    const src = this.resolveResourceUrl(this.cfg.viewportFrame.trim());
    if (this.viewportFrameEl.src !== src) {
      this.viewportFrameEl.src = src;
    }
    if (((_d = this.cfg.viewportFrameInsets) == null ? void 0 : _d.unit) === "framePx") {
      await this.loadViewportFrameNaturalSize();
    }
    this.applyViewportInset();
    this.onResize();
  }
  getOwnerDocument() {
    return this.el.ownerDocument;
  }
  getOwnerWindow() {
    var _a2;
    return (_a2 = this.getOwnerDocument().defaultView) != null ? _a2 : window;
  }
  getOwnerBody() {
    return this.getOwnerDocument().body;
  }
  isOwnerElement(value) {
    const win = this.getOwnerWindow();
    return !!value && value instanceof win.Element;
  }
  getSourcePath() {
    return this.cfg.sourcePath;
  }
  getMapId() {
    var _a2;
    return (_a2 = this.cfg.mapId) != null ? _a2 : "";
  }
  async buildShareExportContext() {
    var _a2, _b2;
    if (!this.data) return null;
    const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
    if (!(af instanceof import_obsidian21.TFile)) return null;
    const text = await this.app.vault.read(af);
    const lines = text.split("\n");
    const blk = this.findZoommapBlockForThisMap(lines);
    if (!blk) return null;
    const yamlLines = lines.slice(blk.start + 1, blk.end).map((ln2) => stripQuotePrefix(ln2));
    const yamlRaw = yamlLines.join("\n").trimEnd();
    let yamlObject = null;
    try {
      const parsed = (0, import_obsidian21.parseYaml)(yamlRaw);
      if (this.isPlainObject(parsed)) yamlObject = parsed;
    } catch (e) {
      yamlObject = null;
    }
    return {
      sourcePath: this.cfg.sourcePath,
      mapId: (_a2 = this.cfg.mapId) != null ? _a2 : "",
      storageMode: (_b2 = this.cfg.storageMode) != null ? _b2 : "json",
      markersPath: this.cfg.markersPath,
      yamlBlock: `\`\`\`zoommap
${yamlRaw}
\`\`\``,
      yamlRaw,
      yamlObject,
      markerData: cloneForUndo(sanitizeMarkerFileDataForSave(this.data))
    };
  }
  captureRestoreState() {
    if (!this.imgW || !this.imgH) return null;
    this.captureViewIfVisible();
    const view = this.lastGoodView;
    if (!view) return null;
    return {
      activeBase: this.getActiveBasePath(),
      scale: view.scale,
      center: { ...view.center }
    };
  }
  updateZoomControlsVisibility() {
    if (!this.zoomControlsEl) return;
    const show = !!this.plugin.settings.showZoomButtonsHud && !this.cfg.responsive;
    this.zoomControlsEl.classList.toggle("zm-hidden", !show);
  }
  refreshMarkdownViewKeepingScroll(view) {
    var _a2, _b2, _c, _d, _e, _f, _g, _h, _i;
    try {
      const scroll = (_c = (_b2 = (_a2 = view.currentMode) == null ? void 0 : _a2.getScroll) == null ? void 0 : _b2.call(_a2)) != null ? _c : 0;
      if (view.getMode() === "preview") {
        (_e = (_d = view.previewMode) == null ? void 0 : _d.rerender) == null ? void 0 : _e.call(_d, true);
        (_g = (_f = view.previewMode) == null ? void 0 : _f.applyScroll) == null ? void 0 : _g.call(_f, scroll);
        return;
      }
      const data = view.getViewData();
      view.setViewData(data, false);
      (_i = (_h = view.currentMode) == null ? void 0 : _h.applyScroll) == null ? void 0 : _i.call(_h, scroll);
    } catch (err2) {
      console.warn("Zoom Map: failed to refresh markdown view", err2);
    }
  }
  async refreshOpenMarkdownViewsForPaths(paths) {
    const wanted = new Set(
      paths.map((p) => (0, import_obsidian21.normalizePath)((p != null ? p : "").trim())).filter((p) => p.length > 0)
    );
    if (wanted.size === 0) return;
    const leaves = this.app.workspace.getLeavesOfType("markdown");
    for (const leaf of leaves) {
      if (leaf.isDeferred) continue;
      if (!(leaf.view instanceof import_obsidian21.MarkdownView)) continue;
      const file = leaf.view.file;
      if (!(file instanceof import_obsidian21.TFile)) continue;
      const filePath = (0, import_obsidian21.normalizePath)(file.path);
      if (!wanted.has(filePath)) continue;
      this.refreshMarkdownViewKeepingScroll(leaf.view);
    }
  }
  asElement(target) {
    if (!target || typeof target !== "object") return null;
    if ("closest" in target) return target;
    return null;
  }
  startDraw(kind) {
    var _a2;
    if (!this.plugin.settings.enableDrawing) {
      new import_obsidian21.Notice("Drawing tools are disabled in the plugin preferences.", 2e3);
      return;
    }
    if (!this.data) return;
    const layers = (_a2 = this.data.drawLayers) != null ? _a2 : [];
    const visible = layers.find((l) => l.visible);
    if (layers.length === 0) {
      new import_obsidian21.Notice(
        "No draw layers exist yet. Create one under image layers \u2192 draw layers \u2192 add draw layer\u2026",
        6e3
      );
      return;
    }
    if (!visible) {
      new import_obsidian21.Notice(
        "No draw layer is active. Enable a draw layer under image layers \u2192 draw layers.",
        6e3
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
      new import_obsidian21.Notice(
        "Draw rectangle: click start point, move the mouse, click end point. Press esc to cancel.",
        5e3
      );
    } else if (kind === "circle") {
      new import_obsidian21.Notice(
        "Draw circle: click center, move the mouse, click radius point. Press esc to cancel.",
        5e3
      );
    } else if (kind === "polyline") {
      new import_obsidian21.Notice(
        "Draw polyline: click to add points, move the mouse for preview, double-click or right-click to finish. Press esc to cancel.",
        7e3
      );
    } else if (kind === "polygon") {
      new import_obsidian21.Notice(
        "Draw polygon: click to add points, move the mouse for preview, double-click or right-click to finish. Press esc to cancel.",
        7e3
      );
    }
  }
  isCanvas() {
    return this.cfg.renderMode === "canvas";
  }
  updateSvgBaseFlag(path) {
    const isSvg = typeof path === "string" && path.toLowerCase().endsWith(".svg");
    this.baseIsSvg = isSvg;
    this.el.classList.toggle("zm-root--svg-base", isSvg);
  }
  async applySwitchPin(m) {
    var _a2, _b2, _c;
    if (!this.data) return;
    if (m.type !== "switch") return;
    const bases = this.getBasesNormalized();
    if (!bases.length) return;
    const current = this.getActiveBasePath();
    const rotate = !!m.switchRotate || !(typeof m.switchBase === "string" && m.switchBase.trim().length > 0);
    if (rotate) {
      const idx = bases.findIndex((b) => b.path === current);
      const next = (_a2 = bases[((idx >= 0 ? idx : 0) + 1) % bases.length]) == null ? void 0 : _a2.path;
      if (next) await this.setActiveBase(next);
      return;
    }
    const target = ((_b2 = m.switchBase) != null ? _b2 : "").trim();
    if (!target) return;
    const exists = bases.some((b) => b.path === target);
    if (exists) {
      await this.setActiveBase(target);
    } else {
      const idx = bases.findIndex((b) => b.path === current);
      const next = (_c = bases[((idx >= 0 ? idx : 0) + 1) % bases.length]) == null ? void 0 : _c.path;
      if (next) await this.setActiveBase(next);
    }
  }
  openSwitchPinModal(opts, onDone) {
    const modal = new SwitchPinModal(
      this.app,
      this.plugin,
      {
        bases: opts.basePaths,
        iconKey: opts.initialIconKey,
        rotate: opts.initialRotate,
        switchBase: opts.initialSwitchBase,
        scaleLikeSticker: opts.initialScaleLikeSticker,
        placeAsHudPin: opts.initialHud
      },
      onDone
    );
    modal.open();
  }
  onPluginSettingsChanged() {
    this.applyGlobalHoverPopoverStyleVars();
    this.applyMeasureStyle();
    this.updateZoomControlsVisibility();
  }
  onload() {
    this.plugin.registerMapInstance(this);
    void this.bootstrap().catch((err2) => {
      const msg = err2 instanceof Error ? err2.message : String(err2);
      console.error(err2);
      new import_obsidian21.Notice(`Zoom Map error: ${msg}`, 6e3);
    });
  }
  onunload() {
    var _a2, _b2, _c;
    this.plugin.unregisterMapInstance(this);
    if (this.zoomHudTimer !== null) {
      window.clearTimeout(this.zoomHudTimer);
      this.zoomHudTimer = null;
    }
    this.tintedSvgCache.clear();
    (_a2 = this.tooltipEl) == null ? void 0 : _a2.remove();
    (_b2 = this.ro) == null ? void 0 : _b2.disconnect();
    (_c = this.calloutMo) == null ? void 0 : _c.disconnect();
    this.closeMenu();
    this.disposeBitmaps();
    for (const byLod of this.svgBaseCache.values()) {
      for (const bmp of byLod.values()) {
        try {
          bmp.close();
        } catch (e) {
        }
      }
      byLod.clear();
    }
    this.svgBaseCache.clear();
    this.svgUpgradeInFlight.clear();
  }
  collectAncestorCallouts() {
    var _a2;
    const out = [];
    let cur = this.el;
    while (cur) {
      const callout = (_a2 = cur.closest) == null ? void 0 : _a2.call(cur, ".callout");
      if (callout && callout instanceof HTMLElement) {
        if (!out.includes(callout)) out.push(callout);
        cur = callout.parentElement;
      } else {
        break;
      }
    }
    return out;
  }
  scheduleTryApplyInitialViewFromCallout() {
    var _a2;
    if (this.cfg.responsive) return;
    if (!this.cfg.initialViewRect && (!this.cfg.initialZoom || !this.cfg.initialCenter)) return;
    if (this.initialViewApplied) return;
    const callouts = this.collectAncestorCallouts();
    if (callouts.length === 0) return;
    const tryApply = () => {
      if (this.initialViewApplied) return;
      if (callouts.some((c) => c.classList.contains("is-collapsed"))) return;
      const r = this.viewportEl.getBoundingClientRect();
      if ((r.width || 0) < 2 || (r.height || 0) < 2) return;
      if (this.cfg.initialViewRect) {
        this.applyInitialViewRect(this.cfg.initialViewRect);
      } else {
        this.applyInitialView(this.cfg.initialZoom, this.cfg.initialCenter);
      }
      if (this.isCanvas()) this.renderCanvas();
      this.renderMarkersOnly();
    };
    (_a2 = this.calloutMo) == null ? void 0 : _a2.disconnect();
    this.calloutMo = new MutationObserver(() => {
      window.requestAnimationFrame(() => tryApply());
    });
    for (const c of callouts) {
      this.calloutMo.observe(c, { attributes: true, attributeFilter: ["class"] });
    }
    window.requestAnimationFrame(() => tryApply());
  }
  async bootstrap() {
    var _a2, _b2, _c, _d, _e, _f, _g;
    this.el.classList.add("zm-root");
    this.el.classList.toggle("zm-root--framepad", this.hasViewportFrame());
    this.applyGlobalHoverPopoverStyleVars();
    if (this.isCanvas()) this.el.classList.add("zm-root--canvas-mode");
    if (this.cfg.responsive) this.el.classList.add("zm-root--responsive");
    if (this.cfg.responsive) {
      setCssProps(this.el, {
        width: "100%",
        height: "auto"
      });
    } else {
      setCssProps(this.el, {
        width: (_a2 = this.cfg.width) != null ? _a2 : null,
        height: (_b2 = this.cfg.height) != null ? _b2 : null
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
    ((_c = this.cfg.extraClasses) != null ? _c : []).forEach((c) => this.el.classList.add(c));
    this.viewportEl = this.el.createDiv({ cls: "zm-viewport" });
    this.applyViewportInset();
    this.clipEl = this.viewportEl.createDiv({ cls: "zm-clip" });
    if (this.isCanvas()) {
      this.baseCanvas = this.clipEl.createEl("canvas", { cls: "zm-canvas" });
      this.ctx = this.baseCanvas.getContext("2d");
    }
    this.worldEl = this.clipEl.createDiv({ cls: "zm-world" });
    this.imgEl = this.worldEl.createEl("img", { cls: "zm-image" });
    this.overlaysEl = this.worldEl.createDiv({ cls: "zm-overlays" });
    this.setupGridOverlay();
    this.markersEl = this.worldEl.createDiv({ cls: "zm-markers" });
    if (this.hasViewportFrame()) {
      this.frameLayerEl = this.el.createDiv({ cls: "zm-frame-layer" });
      const img = this.frameLayerEl.createEl("img", { cls: "zm-viewport-frame" });
      img.decoding = "async";
      img.draggable = false;
      img.src = this.resolveResourceUrl(this.cfg.viewportFrame.trim());
      this.viewportFrameEl = img;
      if (this.plugin.imageCache) {
        const f = this.resolveTFile(this.cfg.viewportFrame.trim(), this.cfg.sourcePath);
        if (f && !this.acquiredSessionPaths.has(f.path)) {
          void this.plugin.imageCache.acquire(f).then(() => {
            this.acquiredSessionPaths.add(f.path);
          }).catch(() => {
          });
        }
      }
    }
    this.hudClipEl = this.el.createDiv({ cls: "zm-hud-clip" });
    this.applyViewportInset();
    this.hudMarkersEl = this.hudClipEl.createDiv({ cls: "zm-hud-markers" });
    this.measureHud = this.hudClipEl.createDiv({ cls: "zm-measure-hud" });
    this.drawEditHudEl = this.hudClipEl.createDiv({ cls: "zm-draw-edit" });
    this.zoomHud = this.hudClipEl.createDiv({ cls: "zm-zoom-hud" });
    this.zoomControlsEl = this.hudClipEl.createDiv({ cls: "zm-zoom-controls" });
    this.zoomOutBtn = this.zoomControlsEl.createEl("button", {
      cls: "zm-zoom-btn",
      text: "\u2212"
    });
    this.zoomOutBtn.setAttr("aria-label", "Zoom out");
    this.zoomOutBtn.setAttr("title", "Zoom out");
    this.zoomInBtn = this.zoomControlsEl.createEl("button", {
      cls: "zm-zoom-btn",
      text: "+"
    });
    this.zoomInBtn.setAttr("aria-label", "Zoom in");
    this.zoomInBtn.setAttr("title", "Zoom in");
    this.registerDomEvent(this.zoomOutBtn, "click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const r = this.viewportEl.getBoundingClientRect();
      this.zoomAt(r.width / 2, r.height / 2, 1 / 1.2);
    });
    const ownerWindow = this.getOwnerWindow();
    this.registerDomEvent(this.viewportEl, "wheel", (e) => {
      const t = this.asElement(e.target);
      if (t == null ? void 0 : t.closest(".popover")) return;
      if (this.cfg.responsive) return;
      if (t == null ? void 0 : t.closest(".zm-zoom-controls")) return;
      e.preventDefault();
      e.stopPropagation();
      this.onWheel(e);
    });
    this.registerDomEvent(this.zoomInBtn, "click", (e) => {
      if (this.cfg.responsive) return;
      e.preventDefault();
      e.stopPropagation();
      const r = this.viewportEl.getBoundingClientRect();
      this.zoomAt(r.width / 2, r.height / 2, 1.2);
    });
    this.registerDomEvent(this.viewportEl, "pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.closeMenu();
      this.onPointerDownViewport(e);
    });
    this.registerDomEvent(ownerWindow, "pointermove", (e) => this.onPointerMove(e));
    this.registerDomEvent(ownerWindow, "pointerup", (e) => {
      if (this.activePointers.has(e.pointerId)) this.activePointers.delete(e.pointerId);
      if (this.pinchActive && this.activePointers.size < 2) this.endPinch();
      e.preventDefault();
      this.onPointerUp(e);
    });
    this.registerDomEvent(ownerWindow, "pointercancel", (e) => {
      if (this.activePointers.has(e.pointerId)) this.activePointers.delete(e.pointerId);
      if (this.pinchActive && this.activePointers.size < 2) this.endPinch();
    });
    const touchCaptureOpts = {
      passive: false,
      capture: true
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
    this.registerDomEvent(this.viewportEl, "dblclick", (e) => {
      if (this.cfg.responsive) return;
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
    this.registerDomEvent(ownerWindow, "keydown", (e) => {
      if (this.gridAlignId) {
        if (this.isGridAlignIncreaseKey(e)) {
          e.preventDefault();
          e.stopPropagation();
          this.adjustGridAlignSpacing(1);
          return;
        }
        if (this.isGridAlignDecreaseKey(e)) {
          e.preventDefault();
          e.stopPropagation();
          this.adjustGridAlignSpacing(-1);
          return;
        }
      }
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
      if (this.gridAlignId) {
        this.stopGridAlignMode(false);
        this.closeMenu();
        new import_obsidian21.Notice("Grid alignment cancelled.", 1200);
        return;
      }
      if (this.calibrating) {
        this.calibrating = false;
        this.calibPts = [];
        this.calibPreview = null;
        this.renderCalibrate();
        new import_obsidian21.Notice("Calibration cancelled.", 900);
      } else if (this.measuring) {
        this.measuring = false;
        this.measurePreview = null;
        this.updateMeasureHud();
      }
      this.closeMenu();
    });
    this.registerEvent(
      this.app.vault.on("modify", (f) => {
        if (!(f instanceof import_obsidian21.TFile)) return;
        if (f.path !== this.store.getPath()) return;
        if (this.ignoreNextModify) {
          this.ignoreNextModify = false;
          return;
        }
        void this.reloadMarkers();
      })
    );
    await this.loadInitialBase(this.cfg.imagePath);
    if (this.cfg.responsive) this.updateResponsiveAspectRatio();
    if (this.viewportFrameEl && ((_d = this.cfg.viewportFrameInsets) == null ? void 0 : _d.unit) === "framePx") {
      await this.loadViewportFrameNaturalSize();
      this.applyViewportInset();
    } else {
      this.applyViewportInset();
    }
    await this.store.ensureExists(
      this.cfg.imagePath,
      { w: this.imgW, h: this.imgH },
      this.cfg.yamlMarkerLayers
    );
    this.data = await this.store.load();
    const pendingRestore = this.cfg.mapId ? this.plugin.consumeMapRestore(this.cfg.sourcePath, this.cfg.mapId) : null;
    if ((pendingRestore == null ? void 0 : pendingRestore.activeBase) && this.data) {
      if (this.getBasesNormalized().some((b) => b.path === pendingRestore.activeBase)) {
        this.data.activeBase = pendingRestore.activeBase;
      }
    }
    await this.applyYamlOnFirstLoad();
    if (this.cfg.yamlMetersPerPixel && this.getMetersPerPixel() === void 0) {
      this.ensureMeasurement();
      const base = this.getActiveBasePath();
      if ((_e = this.data) == null ? void 0 : _e.measurement) {
        this.data.measurement.metersPerPixel = this.cfg.yamlMetersPerPixel;
        this.data.measurement.scales[base] = this.cfg.yamlMetersPerPixel;
        if (await this.store.wouldChange(this.data)) {
          this.ignoreNextModify = true;
          await this.store.save(this.data);
        }
      }
    }
    if (this.data) {
      if (!((_f = this.data.size) == null ? void 0 : _f.w) || !((_g = this.data.size) == null ? void 0 : _g.h)) {
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
    this.register(() => {
      var _a3;
      return (_a3 = this.ro) == null ? void 0 : _a3.disconnect();
    });
    if (pendingRestore && !this.cfg.responsive) {
      this.applyInitialView(pendingRestore.scale, pendingRestore.center);
    } else if (this.cfg.responsive) {
      this.fitToView();
    } else if (this.cfg.initialViewRect) {
      this.applyInitialViewRect(this.cfg.initialViewRect);
    } else if (this.cfg.initialZoom && this.cfg.initialCenter) {
      this.applyInitialView(this.cfg.initialZoom, this.cfg.initialCenter);
    } else {
      this.fitToView();
    }
    if (this.isSecondScreenPlayerView() || this.isSecondScreenControllerView()) {
      this.applySecondScreenViewFromData();
    }
    if (pendingRestore && !this.cfg.responsive) {
      this.captureViewIfVisible();
    }
    this.scheduleTryApplyInitialViewFromCallout();
    await this.applyActiveBaseAndOverlays();
    this.setupMeasureOverlay();
    this.setupDrawOverlay();
    this.setupTextOverlay();
    this.applyMeasureStyle();
    this.renderAll();
    this.ready = true;
    this.updateZoomControlsVisibility();
  }
  updateResponsiveAspectRatio() {
    if (!this.imgW || !this.imgH) return;
    this.el.style.aspectRatio = `${this.imgW} / ${this.imgH}`;
  }
  disposeBitmaps() {
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
    try {
      if (this.baseSource && isImageBitmapLike(this.baseSource)) this.baseSource.close();
    } catch (error) {
      console.error("Zoom Map: failed to dispose base bitmap", error);
    }
    this.baseSource = null;
    for (const src of this.overlaySources.values()) {
      try {
        if (isImageBitmapLike(src)) src.close();
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
    } catch (e) {
    }
    try {
      return await createImageBitmap(img);
    } catch (e) {
      return null;
    }
  }
  async loadBaseSourceByPath(path) {
    this.updateSvgBaseFlag(path);
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
      const src = await cache.acquire(f);
      cache.release(f.path);
      this.baseSource = src;
      if (isImageBitmapLike(src)) {
        this.imgW = src.width;
        this.imgH = src.height;
      } else if (isHtmlImageElementLike(src)) {
        this.imgW = src.naturalWidth;
        this.imgH = src.naturalHeight;
      }
      this.currentBasePath = path;
      return;
    }
    const bmp = await this.loadBitmapFromPath(path);
    if (!bmp) throw new Error(`Failed to load image: ${path}`);
    this.baseSource = bmp;
    this.imgW = bmp.width;
    this.imgH = bmp.height;
    this.currentBasePath = path;
  }
  async loadBaseImageByPath(path) {
    this.updateSvgBaseFlag(path);
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
  async loadInitialBase(path) {
    this.updateSvgBaseFlag(path);
    if (this.isCanvas()) await this.loadBaseSourceByPath(path);
    else await this.loadBaseImageByPath(path);
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
    } catch (e) {
    }
    try {
      return await createImageBitmap(img);
    } catch (e) {
      return img;
    }
  }
  clampRasterDims(w, h) {
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
  getSvgCache(path) {
    let byLod = this.svgBaseCache.get(path);
    if (!byLod) {
      byLod = /* @__PURE__ */ new Map();
      this.svgBaseCache.set(path, byLod);
    }
    return byLod;
  }
  getSvgInflight(path) {
    let byLod = this.svgUpgradeInFlight.get(path);
    if (!byLod) {
      byLod = /* @__PURE__ */ new Map();
      this.svgUpgradeInFlight.set(path, byLod);
    }
    return byLod;
  }
  evictSvgLods(path, keep) {
    const byLod = this.svgBaseCache.get(path);
    if (!byLod) return;
    for (const [lod, bmp] of byLod.entries()) {
      if (keep.includes(lod)) continue;
      try {
        bmp.close();
      } catch (e) {
      }
      byLod.delete(lod);
    }
  }
  pickDesiredSvgLod(scale) {
    const max2 = this.getSvgRasterMaxScale();
    if (scale < 1.35) return 1;
    if (scale < 2.8) return Math.min(2, max2);
    if (scale < 5.6) return Math.min(4, max2);
    return Math.min(8, max2);
  }
  async loadSvgBitmapAtLod(path, lod) {
    const f = this.resolveTFile(path, this.cfg.sourcePath);
    if (!f) return null;
    const url = this.app.vault.getResourcePath(f);
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    try {
      await img.decode();
    } catch (e) {
    }
    const logicalW = img.naturalWidth || 0;
    const logicalH = img.naturalHeight || 0;
    if (logicalW <= 0 || logicalH <= 0) return null;
    this.imgW = logicalW;
    this.imgH = logicalH;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const targetW = logicalW * lod * dpr;
    const targetH = logicalH * lod * dpr;
    const dims = this.clampRasterDims(targetW, targetH);
    try {
      const opts = {
        resizeWidth: dims.w,
        resizeHeight: dims.h,
        resizeQuality: "high"
      };
      const bmp = await createImageBitmap(img, opts);
      return bmp;
    } catch (e) {
      try {
        return await createImageBitmap(img);
      } catch (e2) {
        return null;
      }
    }
  }
  async ensureSvgLod(path, lod) {
    const byLod = this.getSvgCache(path);
    const cached = byLod.get(lod);
    if (cached) return cached;
    const inflight = this.getSvgInflight(path);
    const running = inflight.get(lod);
    if (running) return running;
    const p = this.loadSvgBitmapAtLod(path, lod).then((bmp) => {
      inflight.delete(lod);
      if (bmp) byLod.set(lod, bmp);
      return bmp;
    }).catch(() => {
      inflight.delete(lod);
      return null;
    });
    inflight.set(lod, p);
    return p;
  }
  async maybeUpgradeSvgBaseForCurrentZoom() {
    var _a2, _b2;
    if (!this.isCanvas()) return;
    if (!this.baseIsSvg) return;
    const path = (_a2 = this.currentBasePath) != null ? _a2 : this.getActiveBasePath();
    if (!path) return;
    const desired = this.pickDesiredSvgLod(this.scale);
    const byLod = this.getSvgCache(path);
    const have = (_b2 = [8, 4, 2, 1].find((l) => byLod.has(l))) != null ? _b2 : 0;
    if (have >= desired) return;
    const bmp = await this.ensureSvgLod(path, desired);
    if (!bmp) return;
    this.baseSource = bmp;
    this.svgRasterScale = bmp.width / this.imgW;
    this.evictSvgLods(path, [desired]);
    if (this.ready) {
      this.renderCanvas();
      this.renderMarkersOnly();
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
    var _a2, _b2, _c;
    const cache = this.plugin.imageCache;
    if (cache) {
      if (this.overlaySources.has(path)) return (_a2 = this.overlaySources.get(path)) != null ? _a2 : null;
      const f = this.resolveTFile(path, this.cfg.sourcePath);
      if (!f) return null;
      if (!this.acquiredSessionPaths.has(f.path)) {
        await cache.acquire(f);
        this.acquiredSessionPaths.add(f.path);
      }
      const src = await cache.acquire(f);
      cache.release(f.path);
      this.overlaySources.set(path, src);
      return src;
    }
    if (this.overlaySources.has(path)) return (_b2 = this.overlaySources.get(path)) != null ? _b2 : null;
    if (this.overlayLoading.has(path)) return (_c = this.overlayLoading.get(path)) != null ? _c : null;
    const p = this.loadCanvasSourceFromPath(path).then((res) => {
      this.overlayLoading.delete(path);
      if (res) this.overlaySources.set(path, res);
      return res;
    }).catch((err2) => {
      this.overlayLoading.delete(path);
      console.warn("Zoom Map: overlay load failed", path, err2);
      return null;
    });
    this.overlayLoading.set(path, p);
    return p;
  }
  async ensureVisibleOverlaysLoaded() {
    var _a2;
    if (!this.data) return;
    const keepAll = !!this.plugin.settings.enableSessionImageCache && !!this.plugin.settings.keepOverlaysLoaded;
    const wantVisible = new Set(
      ((_a2 = this.data.overlays) != null ? _a2 : []).filter((o) => keepAll || o.visible).map((o) => o.path)
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
  renderCanvas() {
    var _a2, _b2;
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
    if ((_b2 = (_a2 = this.data) == null ? void 0 : _a2.overlays) == null ? void 0 : _b2.length) {
      for (const o of this.data.overlays) {
        if (!o.visible) continue;
        const src = this.overlaySources.get(o.path);
        if (src) ctx.drawImage(src, 0, 0);
      }
    }
  }
  setupMeasureOverlay() {
    const doc = this.getOwnerDocument();
    this.measureEl = this.worldEl.createDiv({ cls: "zm-measure" });
    this.measureSvg = doc.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.measureSvg.classList.add("zm-measure__svg");
    this.measureSvg.setAttribute("width", String(this.imgW));
    this.measureSvg.setAttribute("height", String(this.imgH));
    this.measureEl.appendChild(this.measureSvg);
    this.measurePath = doc.createElementNS("http://www.w3.org/2000/svg", "path");
    this.measurePath.classList.add("zm-measure__path");
    this.measureSvg.appendChild(this.measurePath);
    this.measureDots = doc.createElementNS("http://www.w3.org/2000/svg", "g");
    this.measureSvg.appendChild(this.measureDots);
    this.calibPath = doc.createElementNS("http://www.w3.org/2000/svg", "path");
    this.calibPath.classList.add("zm-measure__path", "zm-measure__dash");
    this.measureSvg.appendChild(this.calibPath);
    this.calibDots = doc.createElementNS("http://www.w3.org/2000/svg", "g");
    this.measureSvg.appendChild(this.calibDots);
    this.updateMeasureHud();
  }
  setupGridOverlay() {
    const ns = "http://www.w3.org/2000/svg";
    const doc = this.getOwnerDocument();
    this.gridEl = this.worldEl.createDiv({ cls: "zm-mapgrid" });
    this.gridSvg = doc.createElementNS(ns, "svg");
    this.gridSvg.classList.add("zm-mapgrid__svg");
    this.gridSvg.setAttribute("width", String(this.imgW));
    this.gridSvg.setAttribute("height", String(this.imgH));
    this.gridEl.appendChild(this.gridSvg);
    this.gridStaticLayer = doc.createElementNS(ns, "g");
    this.gridSvg.appendChild(this.gridStaticLayer);
  }
  getGridById(id) {
    var _a2, _b2, _c;
    return (_c = ((_b2 = (_a2 = this.data) == null ? void 0 : _a2.grids) != null ? _b2 : []).find((g) => g.id === id)) != null ? _c : null;
  }
  isGridAlignIncreaseKey(e) {
    return e.key === "+" || e.code === "NumpadAdd" || e.key === "=" && e.shiftKey;
  }
  isGridAlignDecreaseKey(e) {
    return e.key === "-" || e.code === "NumpadSubtract";
  }
  adjustGridAlignSpacing(delta) {
    if (!this.gridAlignId) return;
    const grid = this.getGridById(this.gridAlignId);
    if (!grid) return;
    const current = Number.isFinite(grid.spacing) && grid.spacing > 1 ? grid.spacing : 64;
    const next = Math.max(2, Math.round(current + delta));
    if (next === current) return;
    grid.spacing = next;
    this.renderGrids();
  }
  setupDrawOverlay() {
    const ns = "http://www.w3.org/2000/svg";
    const doc = this.getOwnerDocument();
    this.drawEl = this.worldEl.createDiv({ cls: "zm-draw" });
    this.drawHitboxesEl = this.worldEl.createDiv({ cls: "zm-draw-hitboxes" });
    this.drawSvg = doc.createElementNS(ns, "svg");
    this.drawSvg.classList.add("zm-draw__svg");
    this.drawSvg.setAttribute("width", String(this.imgW));
    this.drawSvg.setAttribute("height", String(this.imgH));
    this.drawEl.appendChild(this.drawSvg);
    this.drawDefs = doc.createElementNS(ns, "defs");
    this.drawSvg.appendChild(this.drawDefs);
    this.drawStaticLayer = doc.createElementNS(ns, "g");
    this.drawSvg.appendChild(this.drawStaticLayer);
    this.drawDraftLayer = doc.createElementNS(ns, "g");
    this.drawSvg.appendChild(this.drawDraftLayer);
  }
  buildSquareGridPath(spacing, anchorX, anchorY) {
    const step = Math.max(2, spacing);
    let d = "";
    const startX = anchorX + Math.floor((0 - anchorX) / step) * step;
    for (let x2 = startX; x2 <= this.imgW; x2 += step) {
      d += `M ${x2} 0 L ${x2} ${this.imgH} `;
    }
    const startY = anchorY + Math.floor((0 - anchorY) / step) * step;
    for (let y = startY; y <= this.imgH; y += step) {
      d += `M 0 ${y} L ${this.imgW} ${y} `;
    }
    return d.trim();
  }
  buildHexGridPath(spacing, anchorX, anchorY) {
    const hexWidth = Math.max(8, spacing);
    const r = hexWidth / 2;
    const hexHeight = Math.sqrt(3) * r;
    const dx = 1.5 * r;
    const dy = hexHeight;
    const round = (n) => Math.round(n * 100) / 100;
    let d = "";
    const startCol = Math.floor((0 - anchorX) / dx) - 3;
    const endCol = Math.ceil((this.imgW - anchorX) / dx) + 3;
    for (let ci = startCol; ci <= endCol; ci += 1) {
      const cx = anchorX + ci * dx;
      const parity = (ci % 2 + 2) % 2;
      const baseCy = anchorY + (parity ? dy / 2 : 0);
      const startRow = Math.floor((0 - baseCy) / dy) - 3;
      const endRow = Math.ceil((this.imgH - baseCy) / dy) + 3;
      for (let ri = startRow; ri <= endRow; ri += 1) {
        const cy = baseCy + ri * dy;
        if (cx + r < 0 || cx - r > this.imgW || cy + hexHeight / 2 < 0 || cy - hexHeight / 2 > this.imgH) {
          continue;
        }
        const pts = [
          [round(cx + r), round(cy)],
          [round(cx + r / 2), round(cy - hexHeight / 2)],
          [round(cx - r / 2), round(cy - hexHeight / 2)],
          [round(cx - r), round(cy)],
          [round(cx - r / 2), round(cy + hexHeight / 2)],
          [round(cx + r / 2), round(cy + hexHeight / 2)]
        ];
        d += `M ${pts[0][0]} ${pts[0][1]} L ${pts[1][0]} ${pts[1][1]} L ${pts[2][0]} ${pts[2][1]} L ${pts[3][0]} ${pts[3][1]} L ${pts[4][0]} ${pts[4][1]} L ${pts[5][0]} ${pts[5][1]} Z `;
      }
    }
    return d.trim();
  }
  renderGrids() {
    var _a2, _b2, _c, _d;
    if (!this.gridSvg || !this.gridStaticLayer) return;
    this.gridSvg.setAttribute("width", String(this.imgW));
    this.gridSvg.setAttribute("height", String(this.imgH));
    this.gridStaticLayer.innerHTML = "";
    if (!this.plugin.settings.enableGrid) return;
    if (!this.data) return;
    const activeBase = this.getActiveBasePath();
    const isPlayerView = !!this.cfg.displayOnly;
    const ns = "http://www.w3.org/2000/svg";
    const doc = this.getOwnerDocument();
    for (const grid of (_a2 = this.data.grids) != null ? _a2 : []) {
      const isPreview = this.gridAlignId === grid.id;
      if (!isPreview && !grid.visible) continue;
      if (!isPreview && grid.boundBase && grid.boundBase !== activeBase) continue;
      if (!isPreview) {
        const target = (_b2 = grid.playerScreen) != null ? _b2 : "both";
        if (!isPlayerView && target === "player-only") continue;
        if (isPlayerView && target === "gm-only") continue;
      }
      const spacing = Math.max(2, Number(grid.spacing) || 64);
      const anchorX = isPreview && this.gridAlignPreview ? this.gridAlignPreview.x : Number.isFinite(grid.offsetX) ? grid.offsetX : 0;
      const anchorY = isPreview && this.gridAlignPreview ? this.gridAlignPreview.y : Number.isFinite(grid.offsetY) ? grid.offsetY : 0;
      const d = grid.shape === "hex" ? this.buildHexGridPath(spacing, anchorX, anchorY) : this.buildSquareGridPath(spacing, anchorX, anchorY);
      if (!d) continue;
      const path = doc.createElementNS(ns, "path");
      path.classList.add("zm-mapgrid__path");
      path.setAttribute("d", d);
      path.setAttribute("stroke", ((_c = grid.color) != null ? _c : "#ffffff").trim() || "#ffffff");
      path.setAttribute("stroke-width", String(Math.max(0.25, Number(grid.width) || 1)));
      path.setAttribute("stroke-opacity", String(
        isPreview ? Math.min(1, Math.max(0.1, ((_d = grid.opacity) != null ? _d : 0.5) * 0.9 + 0.1)) : Math.min(1, Math.max(0, Number(grid.opacity) || 0))
      ));
      path.setAttribute("fill", "none");
      path.setAttribute("pointer-events", "none");
      if (isPreview) {
        path.setAttribute("stroke-dasharray", "8 6");
      }
      this.gridStaticLayer.appendChild(path);
    }
  }
  addGridInteractive() {
    var _a2, _b2;
    if (!this.data) return;
    const draft = {
      id: generateId("grid"),
      name: `Grid ${((_b2 = (_a2 = this.data.grids) == null ? void 0 : _a2.length) != null ? _b2 : 0) + 1}`,
      visible: true,
      shape: "square",
      color: "#ffffff",
      width: 1,
      opacity: 0.5,
      spacing: 64,
      offsetX: 0,
      offsetY: 0,
      playerScreen: "both"
    };
    new GridEditorModal(this.app, draft, (res) => {
      var _a3, _b3;
      if (!this.data) return;
      if (res.action !== "save") return;
      (_b3 = (_a3 = this.data).grids) != null ? _b3 : _a3.grids = [];
      this.data.grids.push(res.grid);
      void this.saveDataSoon();
      this.renderGrids();
      new import_obsidian21.Notice("Grid added.", 1200);
    }).open();
  }
  openGridEditor(grid) {
    new GridEditorModal(this.app, grid, (res) => {
      var _a2;
      if (!this.data) return;
      if (res.action !== "save") return;
      const idx = ((_a2 = this.data.grids) != null ? _a2 : []).findIndex((g) => g.id === grid.id);
      if (idx < 0) return;
      this.data.grids[idx] = res.grid;
      void this.saveDataSoon();
      this.renderGrids();
    }).open();
  }
  startGridAlignMode(gridId) {
    const grid = this.getGridById(gridId);
    if (!grid) return;
    this.stopTextEdit(true);
    this.finishTextBoxMove(false);
    this.stopEditDrawingGeometry(true);
    this.measuring = false;
    this.calibrating = false;
    this.drawingMode = null;
    this.textMode = null;
    this.gridAlignId = gridId;
    this.gridAlignOriginalSpacing = Number.isFinite(grid.spacing) && grid.spacing > 1 ? grid.spacing : 64;
    this.gridAlignPreview = {
      x: Number.isFinite(grid.offsetX) ? grid.offsetX : 0,
      y: Number.isFinite(grid.offsetY) ? grid.offsetY : 0
    };
    this.renderGrids();
    new import_obsidian21.Notice(
      "Grid alignment: move the mouse and click to set the anchor. Press + / - to change spacing. Press esc to cancel.",
      6e3
    );
  }
  stopGridAlignMode(commit) {
    if (!this.gridAlignId) return;
    const grid = this.getGridById(this.gridAlignId);
    if (commit && grid && this.gridAlignPreview) {
      grid.offsetX = this.gridAlignPreview.x;
      grid.offsetY = this.gridAlignPreview.y;
      void this.saveDataSoon();
    } else if (!commit && grid && this.gridAlignOriginalSpacing !== null) {
      grid.spacing = this.gridAlignOriginalSpacing;
    }
    this.gridAlignId = null;
    this.gridAlignPreview = null;
    this.gridAlignOriginalSpacing = null;
    this.renderGrids();
  }
  getDrawingById(id) {
    var _a2, _b2;
    const list = (_b2 = (_a2 = this.data) == null ? void 0 : _a2.drawings) != null ? _b2 : [];
    for (const d of list) {
      if (d.id === id) return d;
    }
    return null;
  }
  applyGlobalHoverPopoverStyleVars() {
    this.plugin.applyGlobalHoverPopoverSettings();
  }
  getEditableDrawingPoints(d) {
    if (d.kind === "polygon" && Array.isArray(d.polygon)) return d.polygon;
    if (d.kind === "polyline" && Array.isArray(d.polyline)) return d.polyline;
    return null;
  }
  getEditableDrawingMode(d) {
    if (d.kind === "polygon" || d.kind === "polyline") return "points";
    if (d.kind === "rect") return "rect";
    if (d.kind === "circle") return "circle";
    return null;
  }
  startEditDrawingGeometry(d) {
    const mode = this.getEditableDrawingMode(d);
    if (!mode) {
      new import_obsidian21.Notice("This drawing cannot be edited right now.", 2500);
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
    this.drawEditOriginalDrawing = JSON.parse(JSON.stringify(d));
    this.renderDrawings();
    this.renderDrawingEditHandles();
    if (mode === "points") {
      new import_obsidian21.Notice("Edit points: drag handles, drag green midpoint handles to add points, ctrl/cmd-click a point to delete it. Press esc to cancel.", 6e3);
    } else if (mode === "rect") {
      new import_obsidian21.Notice("Edit rectangle: drag corner handles. Press esc to cancel.", 4e3);
    } else {
      new import_obsidian21.Notice("Edit circle: drag center or radius handle. Press esc to cancel.", 4e3);
    }
  }
  stopEditDrawingGeometry(commit) {
    if (!this.drawEditDrawingId) return;
    const d = this.getDrawingById(this.drawEditDrawingId);
    if (!commit && d && this.drawEditOriginalDrawing) {
      d.rect = this.drawEditOriginalDrawing.rect ? { ...this.drawEditOriginalDrawing.rect } : void 0;
      d.circle = this.drawEditOriginalDrawing.circle ? { ...this.drawEditOriginalDrawing.circle } : void 0;
      d.polygon = this.drawEditOriginalDrawing.polygon ? this.drawEditOriginalDrawing.polygon.map((p) => ({ x: p.x, y: p.y })) : void 0;
      d.polyline = this.drawEditOriginalDrawing.polyline ? this.drawEditOriginalDrawing.polyline.map((p) => ({ x: p.x, y: p.y })) : void 0;
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
  insertPointIntoEditedDrawing(segmentIndex, p) {
    if (!this.drawEditDrawingId) return null;
    const d = this.getDrawingById(this.drawEditDrawingId);
    if (!d) return null;
    const pts = this.getEditableDrawingPoints(d);
    if (!pts) return null;
    const insertAt = clamp(segmentIndex + 1, 0, pts.length);
    pts.splice(insertAt, 0, {
      x: clamp(p.x, 0, 1),
      y: clamp(p.y, 0, 1)
    });
    return insertAt;
  }
  deletePointFromEditedDrawing(pointIndex) {
    if (!this.drawEditDrawingId) return;
    const d = this.getDrawingById(this.drawEditDrawingId);
    if (!d) return;
    const pts = this.getEditableDrawingPoints(d);
    if (!pts) return;
    const minPoints = d.kind === "polygon" ? 3 : 2;
    if (pts.length <= minPoints) {
      new import_obsidian21.Notice(`This ${d.kind} needs at least ${minPoints} points.`, 2e3);
      return;
    }
    pts.splice(pointIndex, 1);
    if (this.drawEditPointIndex === pointIndex) this.drawEditPointIndex = null;
    else if (this.drawEditPointIndex !== null && this.drawEditPointIndex > pointIndex) this.drawEditPointIndex -= 1;
    this.renderDrawings();
    this.renderDrawingEditHandles();
  }
  updateEditedDrawingHandleFromClient(clientX, clientY) {
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
  isEditedDrawingCurrentlyVisible(d) {
    var _a2, _b2;
    if (!d.visible) return false;
    const layer = ((_b2 = (_a2 = this.data) == null ? void 0 : _a2.drawLayers) != null ? _b2 : []).find((l) => l.id === d.layerId);
    if (!layer || !layer.visible) return false;
    const activeBase = this.getActiveBasePath();
    if (layer.boundBase && layer.boundBase !== activeBase) return false;
    return true;
  }
  renderDrawingEditHandles() {
    if (!this.drawEditHudEl) return;
    this.drawEditHudEl.empty();
    if (!this.drawEditDrawingId || !this.data || !this.drawEditMode) return;
    const d = this.getDrawingById(this.drawEditDrawingId);
    if (!d) return;
    if (!this.isEditedDrawingCurrentlyVisible(d)) return;
    const startDrag = (pointIndex, handleKind, pointerId) => {
      this.drawEditPointIndex = pointIndex;
      this.drawEditHandleKind = handleKind;
      this.drawEditPointerId = pointerId;
      this.plugin.setActiveMap(this);
      this.renderDrawingEditHandles();
    };
    if (this.drawEditMode === "points") {
      const pts = this.getEditableDrawingPoints(d);
      if (!pts || pts.length === 0) return;
      for (let i2 = 0; i2 < pts.length; i2 += 1) {
        const p = pts[i2];
        const sx = this.tx + p.x * this.imgW * this.scale;
        const sy = this.ty + p.y * this.imgH * this.scale;
        const h = this.drawEditHudEl.createDiv({ cls: "zm-draw-handle" });
        if (this.drawEditPointIndex === i2) h.classList.add("zm-draw-handle--active");
        h.style.left = `${sx}px`;
        h.style.top = `${sy}px`;
        h.title = "Drag to move. Ctrl/Cmd + click to delete.";
        h.addEventListener("pointerdown", (e) => {
          if (e.button === 0 && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            e.stopPropagation();
            this.deletePointFromEditedDrawing(i2);
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          startDrag(i2, "point", e.pointerId);
        });
      }
      const segCount = d.kind === "polygon" ? pts.length : Math.max(0, pts.length - 1);
      for (let i2 = 0; i2 < segCount; i2 += 1) {
        const a = pts[i2];
        const b = pts[(i2 + 1) % pts.length];
        if (!a || !b) continue;
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const sx = this.tx + mx * this.imgW * this.scale;
        const sy = this.ty + my * this.imgH * this.scale;
        const h = this.drawEditHudEl.createDiv({ cls: "zm-draw-handle zm-draw-handle--add" });
        h.style.left = `${sx}px`;
        h.style.top = `${sy}px`;
        h.title = "Drag to insert a new point.";
        h.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const inserted = this.insertPointIntoEditedDrawing(i2, { x: mx, y: my });
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
        { key: "x0y1", x: d.rect.x0, y: d.rect.y1 }
      ];
      for (const c of corners) {
        const sx = this.tx + c.x * this.imgW * this.scale;
        const sy = this.ty + c.y * this.imgH * this.scale;
        const h = this.drawEditHudEl.createDiv({ cls: "zm-draw-handle" });
        if (this.drawEditHandleKind === c.key) h.classList.add("zm-draw-handle--active");
        h.style.left = `${sx}px`;
        h.style.top = `${sy}px`;
        h.title = "Drag to resize rectangle.";
        h.addEventListener("pointerdown", (e) => {
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
          title: "Drag to move circle center."
        },
        {
          key: "radius",
          cls: "zm-draw-handle zm-draw-handle--radius",
          xPx: cxPx + rPx,
          yPx: cyPx,
          title: "Drag to change circle radius."
        }
      ];
      for (const c of handles) {
        const sx = this.tx + c.xPx * this.scale;
        const sy = this.ty + c.yPx * this.scale;
        const h = this.drawEditHudEl.createDiv({ cls: c.cls });
        if (this.drawEditHandleKind === c.key) h.classList.add("zm-draw-handle--active");
        h.style.left = `${sx}px`;
        h.style.top = `${sy}px`;
        h.title = c.title;
        h.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          e.stopPropagation();
          startDrag(null, c.key, e.pointerId);
        });
      }
    }
  }
  getTextLayerById(id) {
    var _a2, _b2;
    if (!id || !this.data) return null;
    return (_b2 = ((_a2 = this.data.textLayers) != null ? _a2 : []).find((l) => l.id === id)) != null ? _b2 : null;
  }
  getTextBoxById(layerId, boxId) {
    var _a2, _b2;
    const layer = this.getTextLayerById(layerId);
    if (!layer || !boxId) return null;
    const box = (_b2 = ((_a2 = layer.boxes) != null ? _a2 : []).find((b) => b.id === boxId)) != null ? _b2 : null;
    if (!box) return null;
    return { layer, box };
  }
  isTextLayerVisible(layer) {
    return layer.visible !== false;
  }
  getTextBoxStyle(box, layer) {
    var _a2;
    const style = this.normalizeTextLayerStyle((_a2 = box.style) != null ? _a2 : layer == null ? void 0 : layer.style);
    if (!box.style) box.style = { ...style };
    return style;
  }
  isTextBoxLocked(box, layer) {
    if (typeof box.locked === "boolean") return box.locked;
    return !!(layer == null ? void 0 : layer.locked);
  }
  isTextBoxAutoFlow(box, layer) {
    if (typeof box.autoFlow === "boolean") return box.autoFlow;
    return (layer == null ? void 0 : layer.autoFlow) !== false;
  }
  isTextBoxAllowAngled(box, layer) {
    if (typeof box.allowAngledBaselines === "boolean") return box.allowAngledBaselines;
    return !!(layer == null ? void 0 : layer.allowAngledBaselines);
  }
  defaultTextBoxAutoConfig() {
    return {
      lineGapPx: Math.round(this.defaultTextLayerStyle().fontSize * 1.35),
      padLeft: 0,
      padRight: 0,
      padTop: 4,
      padBottom: 4
    };
  }
  buildAutoTextBoxLines(rect, style, autoCfg, existing) {
    var _a2, _b2, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
    const minX = Math.min(rect.x0, rect.x1) * this.imgW;
    const maxX = Math.max(rect.x0, rect.x1) * this.imgW;
    const minY = Math.min(rect.y0, rect.y1) * this.imgH;
    const maxY = Math.max(rect.y0, rect.y1) * this.imgH;
    const padLeft = Math.max(0, (_a2 = autoCfg.padLeft) != null ? _a2 : 0);
    const padRight = Math.max(0, (_b2 = autoCfg.padRight) != null ? _b2 : 0);
    const padTop = Math.max(0, (_c = autoCfg.padTop) != null ? _c : 0);
    const padBottom = Math.max(0, (_d = autoCfg.padBottom) != null ? _d : 0);
    const x0Px = minX + padLeft;
    const x1Px = maxX - padRight;
    const usableTop = minY + padTop;
    const usableBottom = maxY - padBottom;
    const fontSize = style.fontSize;
    const lineH = Number.isFinite(autoCfg.lineGapPx) && autoCfg.lineGapPx > 1 ? autoCfg.lineGapPx : typeof style.lineHeight === "number" && style.lineHeight > 1 ? style.lineHeight : Math.round(fontSize * 1.35);
    const leading = Math.max(0, lineH - fontSize);
    const ascent = Math.round(fontSize * 0.8);
    const rise = ascent + Math.round(leading / 2);
    const out = [];
    let y = usableTop + rise;
    let idx = 0;
    while (y <= usableBottom) {
      out.push({
        id: (_f = (_e = existing == null ? void 0 : existing[idx]) == null ? void 0 : _e.id) != null ? _f : generateId("tln"),
        x0: x0Px / this.imgW,
        y0: y / this.imgH,
        x1: x1Px / this.imgW,
        y1: y / this.imgH,
        text: (_h = (_g = existing == null ? void 0 : existing[idx]) == null ? void 0 : _g.text) != null ? _h : ""
      });
      y += lineH;
      idx += 1;
    }
    if (out.length === 0) {
      const fallbackY = (minY + maxY) / 2;
      out.push({
        id: (_j = (_i = existing == null ? void 0 : existing[0]) == null ? void 0 : _i.id) != null ? _j : generateId("tln"),
        x0: x0Px / this.imgW,
        y0: fallbackY / this.imgH,
        x1: x1Px / this.imgW,
        y1: fallbackY / this.imgH,
        text: (_l = (_k = existing == null ? void 0 : existing[0]) == null ? void 0 : _k.text) != null ? _l : ""
      });
    }
    return out;
  }
  regenerateAutoTextBoxLines(layer, box) {
    var _a2;
    if (box.mode !== "auto") return;
    if (box.sourceDrawingKind === "polyline") return;
    box.style = this.getTextBoxStyle(box, layer);
    (_a2 = box.auto) != null ? _a2 : box.auto = this.defaultTextBoxAutoConfig();
    box.lines = this.buildAutoTextBoxLines(box.rect, box.style, box.auto, box.lines);
  }
  ensureTextData() {
    var _a2, _b2, _c, _d, _e;
    if (!this.data) return;
    (_b2 = (_a2 = this.data).textLayers) != null ? _b2 : _a2.textLayers = [];
    for (const layer of this.data.textLayers) {
      (_c = layer.boxes) != null ? _c : layer.boxes = [];
      if (typeof layer.visible !== "boolean") layer.visible = true;
      const legacyStyle = this.normalizeTextLayerStyle(layer.style);
      for (const box of layer.boxes) {
        box.style = this.normalizeTextLayerStyle((_d = box.style) != null ? _d : legacyStyle);
        if (typeof box.autoFlow !== "boolean" && typeof layer.autoFlow === "boolean") {
          box.autoFlow = layer.autoFlow;
        }
        if (typeof box.allowAngledBaselines !== "boolean" && typeof layer.allowAngledBaselines === "boolean") {
          box.allowAngledBaselines = layer.allowAngledBaselines;
        }
        if (typeof box.locked !== "boolean" && typeof layer.locked === "boolean") {
          box.locked = layer.locked;
        }
        if (box.mode === "auto") (_e = box.auto) != null ? _e : box.auto = this.defaultTextBoxAutoConfig();
      }
    }
  }
  defaultTextLayerStyle() {
    return {
      fontFamily: "var(--font-text)",
      fontSize: 14,
      color: "var(--text-normal)",
      fontWeight: "400",
      baselineOffset: 0,
      padLeft: 0,
      padRight: 0
    };
  }
  normalizeTextLayerStyle(style) {
    var _a2, _b2, _c, _d, _e, _f, _g;
    const s = { ...this.defaultTextLayerStyle(), ...style != null ? style : {} };
    s.fontFamily = ((_a2 = s.fontFamily) != null ? _a2 : "").trim() || "var(--font-text)";
    s.color = ((_b2 = s.color) != null ? _b2 : "").trim() || "var(--text-normal)";
    if (!Number.isFinite(s.fontSize) || s.fontSize <= 1) s.fontSize = 14;
    if (!Number.isFinite((_c = s.baselineOffset) != null ? _c : 0)) s.baselineOffset = 0;
    if (!Number.isFinite((_d = s.padLeft) != null ? _d : 0) || ((_e = s.padLeft) != null ? _e : 0) < 0) s.padLeft = 0;
    if (!Number.isFinite((_f = s.padRight) != null ? _f : 0) || ((_g = s.padRight) != null ? _g : 0) < 0) s.padRight = 0;
    if (typeof s.italic !== "boolean") delete s.italic;
    if (typeof s.letterSpacing !== "number" || !Number.isFinite(s.letterSpacing)) {
      delete s.letterSpacing;
    }
    if (s.fontWeight != null) {
      const fw = String(s.fontWeight).trim();
      s.fontWeight = fw.length ? fw : void 0;
    }
    return s;
  }
  openTextBoxConfigModal(layer, box) {
    box.style = this.getTextBoxStyle(box, layer);
    new TextBoxConfigModal(this.app, box, (res) => {
      var _a2, _b2, _c;
      if (res.action !== "save" || !this.data) return;
      const target = ((_a2 = layer.boxes) != null ? _a2 : []).find((b) => b.id === box.id);
      if (!target) return;
      target.name = res.box.name;
      target.auto = res.box.auto;
      target.style = this.normalizeTextLayerStyle((_c = (_b2 = res.box.style) != null ? _b2 : target.style) != null ? _c : layer.style);
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
  setupTextOverlay() {
    const ns = "http://www.w3.org/2000/svg";
    const doc = this.getOwnerDocument();
    this.textSvgWrap = this.worldEl.createDiv({ cls: "zm-text" });
    this.textSvg = doc.createElementNS(ns, "svg");
    this.textSvg.classList.add("zm-text__svg");
    this.textSvg.setAttribute("width", String(this.imgW));
    this.textSvg.setAttribute("height", String(this.imgH));
    this.textSvgWrap.appendChild(this.textSvg);
    this.textGuidesLayer = doc.createElementNS(ns, "g");
    this.textSvg.appendChild(this.textGuidesLayer);
    this.textDraftLayer = doc.createElementNS(ns, "g");
    this.textSvg.appendChild(this.textDraftLayer);
    this.textTextLayer = doc.createElementNS(ns, "g");
    this.textSvg.appendChild(this.textTextLayer);
    this.textHitEl = this.worldEl.createDiv({ cls: "zm-text-hitboxes" });
    this.textEditEl = this.worldEl.createDiv({ cls: "zm-text-edit" });
    this.updateTextHitboxInteractivity();
    this.textMeasureSpan = this.viewportEl.createEl("span", { cls: "zm-text-measure" });
  }
  updateTextHitboxInteractivity() {
    if (!this.textHitEl) return;
    const passive = this.measuring || this.calibrating;
    this.textHitEl.classList.toggle("zm-text-hitboxes--passive", passive);
  }
  renderTextLayers() {
    var _a2, _b2, _c, _d, _e, _f;
    if (!this.data || !this.textSvg) return;
    const enabled = !!this.plugin.settings.enableTextLayers;
    this.ensureTextData();
    if (!enabled) {
      this.textGuidesLayer.innerHTML = "";
      this.textDraftLayer.innerHTML = "";
      this.textTextLayer.innerHTML = "";
      this.textHitEl.empty();
      this.stopTextEdit(false);
      return;
    }
    this.textSvg.setAttribute("width", String(this.imgW));
    this.textSvg.setAttribute("height", String(this.imgH));
    this.textGuidesLayer.innerHTML = "";
    this.textTextLayer.innerHTML = "";
    this.textHitEl.empty();
    this.updateTextHitboxInteractivity();
    const ns = "http://www.w3.org/2000/svg";
    const doc = this.getOwnerDocument();
    const abs = (nx, ny) => ({ x: nx * this.imgW, y: ny * this.imgH });
    const rectAbs = (r) => {
      const x2 = Math.min(r.x0, r.x1) * this.imgW;
      const y = Math.min(r.y0, r.y1) * this.imgH;
      const w = Math.abs(r.x1 - r.x0) * this.imgW;
      const h = Math.abs(r.y1 - r.y0) * this.imgH;
      return { x: x2, y, w, h };
    };
    const layers = (_a2 = this.data.textLayers) != null ? _a2 : [];
    for (const layer of layers) {
      if (!this.isTextLayerVisible(layer)) continue;
      const activeBase = this.getActiveBasePath();
      if (layer.boundBase && layer.boundBase !== activeBase) continue;
      const boxes = (_b2 = layer.boxes) != null ? _b2 : [];
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
        const moveActive = this.textMode === "move" && this.activeTextLayerId === layer.id && this.activeTextBoxId === box.id;
        if (moveActive) hb.classList.add("zm-text-hitbox--move");
        else hb.classList.remove("zm-text-hitbox--move");
        hb.addEventListener("pointerdown", (e) => {
          if (!this.data) return;
          if (e.button !== 0) return;
          if (!this.plugin.settings.enableTextLayers) return;
          if (this.isTextBoxLocked(box, layer)) return;
          if (!(this.textMode === "move" && this.activeTextLayerId === layer.id && this.activeTextBoxId === box.id)) return;
          e.preventDefault();
          e.stopPropagation();
          this.plugin.setActiveMap(this);
          const p = this.mouseEventToWorldNorm(e);
          this.startTextBoxMove(layer.id, box.id, p, e.pointerId, hb);
        });
        hb.addEventListener("dblclick", (e) => {
          if (this.drawingMode) {
            e.preventDefault();
            e.stopPropagation();
            this.onDblClickViewport(e);
            return;
          }
          e.stopPropagation();
        });
        hb.addEventListener("click", (e) => {
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
        hb.addEventListener("contextmenu", (e) => {
          if (this.measuring || this.calibrating) {
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          this.forwardContextMenuPastTextHitbox(e);
        });
        const showNow = (this.textMode === "draw-lines" || this.textMode === "move") && this.activeTextLayerId === layer.id && this.activeTextBoxId === box.id;
        if (showNow) {
          const rect = doc.createElementNS(ns, "rect");
          rect.classList.add("zm-text-guide-rect");
          rect.classList.add("zm-text-guide--active");
          rect.setAttribute("x", String(r.x));
          rect.setAttribute("y", String(r.y));
          rect.setAttribute("width", String(r.w));
          rect.setAttribute("height", String(r.h));
          this.textGuidesLayer.appendChild(rect);
          for (const ln2 of (_c = box.lines) != null ? _c : []) {
            const a = abs(ln2.x0, ln2.y0);
            const b = abs(ln2.x1, ln2.y1);
            const line = doc.createElementNS(ns, "line");
            line.classList.add("zm-text-guide-line");
            line.classList.add("zm-text-guide--active");
            line.setAttribute("x1", String(a.x));
            line.setAttribute("y1", String(a.y));
            line.setAttribute("x2", String(b.x));
            line.setAttribute("y2", String(b.y));
            this.textGuidesLayer.appendChild(line);
          }
        }
        const isEditingThis = this.textMode === "edit" && this.activeTextLayerId === layer.id && this.activeTextBoxId === box.id;
        if (isEditingThis) continue;
        const st = this.getTextBoxStyle(box, layer);
        for (const ln2 of (_d = box.lines) != null ? _d : []) {
          const txt = ((_e = ln2.text) != null ? _e : "").trimEnd();
          if (!txt) continue;
          const a = abs(ln2.x0, ln2.y0);
          const b = abs(ln2.x1, ln2.y1);
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const angleDeg = Math.atan2(dy, dx) * 180 / Math.PI;
          const padLeft = (_f = st.padLeft) != null ? _f : 0;
          const x2 = a.x + padLeft;
          const y = a.y;
          const t = doc.createElementNS(ns, "text");
          t.setAttribute("x", String(x2));
          t.setAttribute("y", String(y));
          t.textContent = txt;
          t.style.fill = st.color;
          t.style.fontFamily = st.fontFamily;
          t.style.fontSize = `${st.fontSize}px`;
          if (st.fontWeight) t.style.fontWeight = st.fontWeight;
          if (st.italic) t.classList.add("zm-text-italic");
          if (typeof st.letterSpacing === "number") t.style.letterSpacing = `${st.letterSpacing}px`;
          if (Math.abs(angleDeg) > 0.01) {
            t.setAttribute("transform", `rotate(${angleDeg} ${x2} ${y})`);
          }
          this.textTextLayer.appendChild(t);
        }
      }
    }
    this.renderTextDraft();
  }
  renderTextDraft() {
    if (!this.textDraftLayer) return;
    this.textDraftLayer.innerHTML = "";
    const doc = this.getOwnerDocument();
    const enabled = !!this.plugin.settings.enableTextLayers;
    if (!enabled) return;
    const ns = "http://www.w3.org/2000/svg";
    const abs = (nx, ny) => ({ x: nx * this.imgW, y: ny * this.imgH });
    if (this.textMode === "draw-box" && this.textDrawStart && this.textDrawPreview) {
      const a = abs(this.textDrawStart.x, this.textDrawStart.y);
      const b = abs(this.textDrawPreview.x, this.textDrawPreview.y);
      const x2 = Math.min(a.x, b.x);
      const y = Math.min(a.y, b.y);
      const w = Math.abs(a.x - b.x);
      const h = Math.abs(a.y - b.y);
      const rect = doc.createElementNS(ns, "rect");
      rect.classList.add("zm-text-guide-rect");
      rect.classList.add("zm-text-guide--active");
      rect.setAttribute("x", String(x2));
      rect.setAttribute("y", String(y));
      rect.setAttribute("width", String(w));
      rect.setAttribute("height", String(h));
      this.textDraftLayer.appendChild(rect);
    }
    if (this.textMode === "draw-lines" && this.textLineStart && this.textLinePreview) {
      const a = abs(this.textLineStart.x, this.textLineStart.y);
      const b = abs(this.textLinePreview.x, this.textLinePreview.y);
      const line = doc.createElementNS(ns, "line");
      line.classList.add("zm-text-guide-draft");
      line.classList.add("zm-text-guide--active");
      line.setAttribute("x1", String(a.x));
      line.setAttribute("y1", String(a.y));
      line.setAttribute("x2", String(b.x));
      line.setAttribute("y2", String(b.y));
      this.textDraftLayer.appendChild(line);
    }
  }
  onTextBoxClick(layer, box, ev) {
    var _a2;
    if (!this.data) return;
    if (!this.plugin.settings.enableTextLayers) return;
    if (this.isTextBoxLocked(box, layer)) {
      new import_obsidian21.Notice("Text box is locked.", 1500);
      return;
    }
    const lines = (_a2 = box.lines) != null ? _a2 : [];
    if (lines.length === 0) {
      new import_obsidian21.Notice("No baselines in this text box yet. Use 'draw lines' first.", 3e3);
      return;
    }
    const p = this.mouseEventToWorldNorm(ev);
    this.startTextEdit(layer.id, box.id, p);
  }
  mouseEventToWorldNorm(ev) {
    const vpRect = this.viewportEl.getBoundingClientRect();
    const vx = ev.clientX - vpRect.left;
    const vy = ev.clientY - vpRect.top;
    const wx = (vx - this.tx) / this.scale;
    const wy = (vy - this.ty) / this.scale;
    return {
      x: clamp(wx / this.imgW, 0, 1),
      y: clamp(wy / this.imgH, 0, 1)
    };
  }
  clampTextBoxDelta(rect, dx, dy) {
    const minX = Math.min(rect.x0, rect.x1);
    const maxX = Math.max(rect.x0, rect.x1);
    const minY = Math.min(rect.y0, rect.y1);
    const maxY = Math.max(rect.y0, rect.y1);
    const dxClamped = clamp(dx, -minX, 1 - maxX);
    const dyClamped = clamp(dy, -minY, 1 - maxY);
    return { dx: dxClamped, dy: dyClamped };
  }
  startTextBoxMove(layerId, boxId, start, pointerId, host) {
    var _a2, _b2;
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
      lines: ((_a2 = box.lines) != null ? _a2 : []).map((ln2) => ({ ...ln2 }))
    };
    host.classList.add("zm-text-hitbox--dragging");
    this.getOwnerBody().classList.add("zm-cursor-move-grabbing");
    (_b2 = host.setPointerCapture) == null ? void 0 : _b2.call(host, pointerId);
  }
  updateTextBoxMove(cur) {
    var _a2;
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
      y1: this.textMoveOrig.rect.y1 + dy
    };
    const srcLines = this.textMoveOrig.lines;
    (_a2 = box.lines) != null ? _a2 : box.lines = [];
    if (box.lines.length !== srcLines.length) {
      const byId = new Map(box.lines.map((ln2) => [ln2.id, ln2]));
      box.lines = srcLines.map((s) => {
        const existing = byId.get(s.id);
        return existing != null ? existing : { ...s };
      });
    }
    for (let i2 = 0; i2 < srcLines.length; i2 += 1) {
      const s = srcLines[i2];
      const ln2 = box.lines[i2];
      ln2.x0 = s.x0 + dx;
      ln2.y0 = s.y0 + dy;
      ln2.x1 = s.x1 + dx;
      ln2.y1 = s.y1 + dy;
    }
    this.renderTextLayers();
  }
  finishTextBoxMove(commit) {
    var _a2;
    if (!this.textMoveDragging) return;
    this.textMoveDragging = false;
    this.textMovePointerId = null;
    this.textMoveStart = null;
    this.textMoveOrig = null;
    this.getOwnerBody().classList.remove("zm-cursor-move-grabbing");
    (_a2 = this.textHitEl) == null ? void 0 : _a2.querySelectorAll(".zm-text-hitbox--dragging").forEach((el) => el.classList.remove("zm-text-hitbox--dragging"));
    if (commit) {
      void this.saveDataSoon();
    }
  }
  startTextEdit(layerId, boxId, focus) {
    var _a2, _b2, _c, _d, _e, _f;
    if (!this.data) return;
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
    (_a2 = box.lines) != null ? _a2 : box.lines = [];
    if (typeof box.autoFlow !== "boolean") box.autoFlow = this.isTextBoxAutoFlow(box, layer);
    if (typeof box.allowAngledBaselines !== "boolean") box.allowAngledBaselines = this.isTextBoxAllowAngled(box, layer);
    box.style = this.getTextBoxStyle(box, layer);
    this.textEditEl.empty();
    this.textInputs.clear();
    const st = box.style;
    const sorted = [...(_b2 = box.lines) != null ? _b2 : []].sort((a, b) => {
      const ay = (a.y0 + a.y1) / 2;
      const by = (b.y0 + b.y1) / 2;
      return ay - by || a.x0 - b.x0;
    });
    box.lines = sorted;
    for (let i2 = 0; i2 < box.lines.length; i2 += 1) {
      const ln2 = box.lines[i2];
      const ax0 = ln2.x0 * this.imgW;
      const ay0 = ln2.y0 * this.imgH;
      const ax1 = ln2.x1 * this.imgW;
      const ay1 = ln2.y1 * this.imgH;
      const dx = ax1 - ax0;
      const dy = ay1 - ay0;
      const len = Math.max(1, Math.hypot(dx, dy));
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      const fontSize = st.fontSize;
      const lineH = typeof st.lineHeight === "number" && st.lineHeight > 1 ? st.lineHeight : Math.round(fontSize * 1.35);
      const leading = Math.max(0, lineH - fontSize);
      const ascent = Math.round(fontSize * 0.8);
      const rise = ascent + Math.round(leading / 2);
      const ux = dx / len;
      const uy = dy / len;
      const nx = -uy;
      const ny = ux;
      const row = this.textEditEl.createDiv({ cls: "zm-text-line" });
      row.style.left = `${ax0 - nx * rise}px`;
      row.style.top = `${ay0 - ny * rise}px`;
      row.style.width = `${len}px`;
      row.style.height = `${lineH}px`;
      row.style.transform = `rotate(${angle}deg)`;
      const input = row.createEl("input", { cls: "zm-text-input" });
      input.type = "text";
      input.value = (_c = ln2.text) != null ? _c : "";
      input.style.height = `${lineH}px`;
      input.style.lineHeight = `${lineH}px`;
      input.style.fontFamily = st.fontFamily;
      input.style.fontSize = `${st.fontSize}px`;
      input.style.color = st.color;
      if (st.fontWeight) input.style.fontWeight = st.fontWeight;
      if (st.italic) input.classList.add("zm-text-italic");
      if (typeof st.letterSpacing === "number") input.style.letterSpacing = `${st.letterSpacing}px`;
      input.style.paddingLeft = `${(_d = st.padLeft) != null ? _d : 0}px`;
      input.style.paddingRight = `${(_e = st.padRight) != null ? _e : 0}px`;
      input.addEventListener("pointerdown", (e) => e.stopPropagation());
      input.addEventListener("click", (e) => e.stopPropagation());
      input.addEventListener("dblclick", (e) => e.stopPropagation());
      input.addEventListener("contextmenu", (e) => e.stopPropagation());
      input.addEventListener("keydown", (e) => {
        var _a3, _b3;
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          this.stopTextEdit(true);
          return;
        }
        if (e.key === "Backspace" && this.isTextBoxAutoFlow(box, layer)) {
          const selStart = (_a3 = input.selectionStart) != null ? _a3 : 0;
          const selEnd = (_b3 = input.selectionEnd) != null ? _b3 : selStart;
          if (selStart === 0 && selEnd === 0 && i2 > 0) {
            e.preventDefault();
            e.stopPropagation();
            const prev = this.getTextInputByIndex(i2 - 1);
            if (!prev) return;
            const joinPos = prev.value.length;
            prev.focus();
            prev.setSelectionRange(joinPos, joinPos);
            this.textDirty = true;
            this.reflowTextBox(box, st, i2 - 1, { advanceFocus: false });
            this.scheduleTextSave();
            window.setTimeout(() => {
              if (this.textMode !== "edit") return;
              const pos = Math.min(joinPos, prev.value.length);
              prev.focus();
              prev.setSelectionRange(pos, pos);
            }, 0);
            return;
          }
        }
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          const next = this.getTextInputByIndex(i2 + 1);
          next == null ? void 0 : next.focus();
          return;
        }
        if (e.key === "ArrowDown") {
          const next = this.getTextInputByIndex(i2 + 1);
          if (next) {
            e.preventDefault();
            next.focus();
          }
          return;
        }
        if (e.key === "ArrowUp") {
          const prev = this.getTextInputByIndex(i2 - 1);
          if (prev) {
            e.preventDefault();
            prev.focus();
          }
          return;
        }
      });
      input.addEventListener("input", () => {
        var _a3, _b3, _c2;
        if (this.isTextBoxLocked(box, layer)) {
          input.value = (_a3 = ln2.text) != null ? _a3 : "";
          new import_obsidian21.Notice("Text box is locked.", 1200);
          return;
        }
        if (!this.isTextBoxAutoFlow(box, layer)) {
          ln2.text = input.value;
          this.textDirty = true;
          this.scheduleTextSave();
          return;
        }
        const selStart = (_b3 = input.selectionStart) != null ? _b3 : input.value.length;
        const selEnd = (_c2 = input.selectionEnd) != null ? _c2 : selStart;
        const hasSelection = selEnd !== selStart;
        const atEnd = !hasSelection && selStart === input.value.length;
        ln2.text = input.value;
        this.textDirty = true;
        const move = this.reflowTextBox(box, st, i2, { advanceFocus: atEnd });
        this.scheduleTextSave();
        if (move.advance) {
          window.setTimeout(() => {
            if (this.textMode !== "edit") return;
            const next = this.getTextInputByIndex(move.advance.toIndex);
            if (!next) return;
            next.focus();
            const pos = Math.min(move.advance.caret, next.value.length);
            next.setSelectionRange(pos, pos);
          }, 0);
        }
      });
      this.textInputs.set(ln2.id, input);
    }
    this.installTextOutsideClickHandler();
    if (focus) {
      this.focusNearestBaseline(box, focus);
    } else {
      (_f = this.getTextInputByIndex(0)) == null ? void 0 : _f.focus();
    }
    this.renderTextLayers();
  }
  stopTextEdit(save) {
    var _a2;
    if (this.textMode !== "edit") return;
    this.textMode = null;
    this.activeTextLayerId = null;
    this.activeTextBoxId = null;
    this.textInputs.clear();
    this.textEditEl.empty();
    (_a2 = this.textOutsideCleanup) == null ? void 0 : _a2.call(this);
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
  installTextOutsideClickHandler() {
    var _a2;
    (_a2 = this.textOutsideCleanup) == null ? void 0 : _a2.call(this);
    this.textOutsideCleanup = null;
    const doc = this.el.ownerDocument;
    const handler = (ev) => {
      if (this.textMode !== "edit") return;
      const t = ev.target;
      if (!isNodeLike(t)) return;
      if (this.textEditEl.contains(t)) return;
      if (this.isOwnerElement(t) && t.closest(".zm-text-hitbox")) return;
      if (this.activeTextLayerId && this.activeTextBoxId) {
        const hb = this.textHitEl.querySelector(
          `.zm-text-hitbox[data-layer-id="${this.activeTextLayerId}"][data-box-id="${this.activeTextBoxId}"]`
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
  getTextInputByIndex(index) {
    var _a2, _b2;
    const found = this.getTextBoxById(this.activeTextLayerId, this.activeTextBoxId);
    if (!found) return null;
    const ln2 = (_a2 = found.box.lines) == null ? void 0 : _a2[index];
    if (!ln2) return null;
    return (_b2 = this.textInputs.get(ln2.id)) != null ? _b2 : null;
  }
  focusNearestBaseline(box, p) {
    var _a2, _b2;
    if (!((_a2 = box.lines) == null ? void 0 : _a2.length)) return;
    const py = p.y;
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i2 = 0; i2 < box.lines.length; i2 += 1) {
      const ln2 = box.lines[i2];
      const y = (ln2.y0 + ln2.y1) / 2;
      const d = Math.abs(y - py);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i2;
      }
    }
    (_b2 = this.getTextInputByIndex(bestIdx)) == null ? void 0 : _b2.focus();
  }
  scheduleTextSave(delayMs = 900) {
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
  flushTextSaveNow() {
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
  measureTextWidthPx(style, text) {
    var _a2, _b2;
    const span = this.textMeasureSpan;
    if (!span) return text.length * ((_a2 = style.fontSize) != null ? _a2 : 14);
    span.style.fontFamily = style.fontFamily;
    span.style.fontSize = `${style.fontSize}px`;
    span.style.fontWeight = (_b2 = style.fontWeight) != null ? _b2 : "400";
    span.style.letterSpacing = typeof style.letterSpacing === "number" ? `${style.letterSpacing}px` : "normal";
    span.textContent = text || "";
    return span.getBoundingClientRect().width;
  }
  lineCapacityPx(style, ln2) {
    var _a2, _b2;
    const ax0 = ln2.x0 * this.imgW;
    const ay0 = ln2.y0 * this.imgH;
    const ax1 = ln2.x1 * this.imgW;
    const ay1 = ln2.y1 * this.imgH;
    const len = Math.hypot(ax1 - ax0, ay1 - ay0);
    const cap = len - ((_a2 = style.padLeft) != null ? _a2 : 0) - ((_b2 = style.padRight) != null ? _b2 : 0);
    return Math.max(10, cap);
  }
  splitToFit(style, ln2, text) {
    const cap = this.lineCapacityPx(style, ln2);
    const st = style;
    if (this.measureTextWidthPx(st, text) <= cap) {
      return { fit: text, rest: "", overflowed: false, boundaryOnly: false };
    }
    for (let i2 = text.length - 1; i2 >= 0; i2 -= 1) {
      if (text[i2] !== " ") continue;
      const left = text.slice(0, i2).trimEnd();
      const right = text.slice(i2 + 1).trimStart();
      if (!left) continue;
      if (this.measureTextWidthPx(st, left) <= cap) {
        return { fit: left, rest: right, overflowed: true, boundaryOnly: right.length === 0 };
      }
    }
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
  pullWord(text) {
    var _a2, _b2;
    const s = text.trimStart();
    if (!s) return null;
    const m = /^(\S+)\s*(.*)$/.exec(s);
    if (!m) return null;
    return { word: (_a2 = m[1]) != null ? _a2 : "", rest: (_b2 = m[2]) != null ? _b2 : "" };
  }
  reflowTextBox(box, style, startIndex, opts) {
    var _a2, _b2, _c, _d, _e;
    if (!((_a2 = box.lines) == null ? void 0 : _a2.length)) return {};
    let advance;
    for (let i2 = startIndex; i2 < box.lines.length; i2 += 1) {
      const ln2 = box.lines[i2];
      const txt = (_b2 = ln2.text) != null ? _b2 : "";
      const { fit, rest, overflowed, boundaryOnly } = this.splitToFit(style, ln2, txt);
      if (!overflowed) {
        ln2.text = fit;
        continue;
      }
      ln2.text = fit;
      const next = box.lines[i2 + 1];
      if (!next) {
        new import_obsidian21.Notice("No more baselines in this text box.", 1500);
        continue;
      }
      if (rest) {
        const nextTxt = ((_c = next.text) != null ? _c : "").trimStart();
        next.text = (rest + (nextTxt ? " " + nextTxt : "")).trimEnd();
      }
      if (!advance && i2 === startIndex && (opts == null ? void 0 : opts.advanceFocus)) {
        advance = { toIndex: i2 + 1, caret: boundaryOnly ? 0 : rest.length };
      }
    }
    for (let i2 = startIndex; i2 < box.lines.length - 1; i2 += 1) {
      const cur = box.lines[i2];
      const next = box.lines[i2 + 1];
      if (!next) continue;
      while (true) {
        const pick = this.pullWord((_d = next.text) != null ? _d : "");
        if (!pick) break;
        const candidate = ((_e = cur.text) != null ? _e : "").trimEnd();
        const joined = candidate ? `${candidate} ${pick.word}` : pick.word;
        if (this.measureTextWidthPx(style, joined) <= this.lineCapacityPx(style, cur)) {
          cur.text = joined;
          next.text = pick.rest.trimStart();
        } else {
          break;
        }
      }
    }
    this.syncInputsFromBox(box);
    return { advance };
  }
  syncInputsFromBox(box) {
    var _a2, _b2, _c, _d;
    const active = this.el.ownerDocument.activeElement;
    for (const ln2 of (_a2 = box.lines) != null ? _a2 : []) {
      const input = this.textInputs.get(ln2.id);
      if (!input) continue;
      const want = (_b2 = ln2.text) != null ? _b2 : "";
      if (input.value === want) continue;
      if (active === input) {
        const selStart = (_c = input.selectionStart) != null ? _c : want.length;
        const selEnd = (_d = input.selectionEnd) != null ? _d : want.length;
        input.value = want;
        const s = Math.min(selStart, want.length);
        const e = Math.min(selEnd, want.length);
        input.setSelectionRange(s, e);
      } else {
        input.value = want;
      }
    }
  }
  onTextDrawLineClick(layer, box, ev) {
    var _a2;
    if (!this.data) return;
    if (this.isTextBoxLocked(box, layer)) {
      new import_obsidian21.Notice("Text box is locked.", 1500);
      return;
    }
    const p = this.mouseEventToWorldNorm(ev);
    if (!this.textLineStart) {
      this.textLineStart = p;
      this.textLinePreview = p;
      this.renderTextDraft();
      return;
    }
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
    if (x1 < x0) {
      [x0, x1] = [x1, x0];
      [y0, y1] = [y1, y0];
    }
    x0 = clamp(x0, minX, maxX);
    x1 = clamp(x1, minX, maxX);
    y0 = clamp(y0, minY, maxY);
    y1 = clamp(y1, minY, maxY);
    const pxLen = Math.hypot((x1 - x0) * this.imgW, (y1 - y0) * this.imgH);
    if (pxLen < 6) {
      new import_obsidian21.Notice("Baseline too short.", 1200);
      this.textLineStart = null;
      this.textLinePreview = null;
      this.renderTextDraft();
      return;
    }
    (_a2 = box.lines) != null ? _a2 : box.lines = [];
    box.lines.push({
      id: generateId("tln"),
      x0,
      y0,
      x1,
      y1,
      text: ""
    });
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
  startDrawNewTextBox(layerId, mode) {
    if (!this.data) return;
    if (!this.plugin.settings.enableTextLayers) {
      new import_obsidian21.Notice("Text layers are disabled in preferences.", 2500);
      return;
    }
    const layer = this.getTextLayerById(layerId);
    if (!layer) return;
    if (layer.locked) {
      new import_obsidian21.Notice("Text layer is locked.", 1500);
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
    new import_obsidian21.Notice(`Draw ${mode} text box: drag to create the box. Press esc to cancel.`, 4500);
  }
  finishDrawNewTextBox() {
    var _a2, _b2, _c;
    if (!this.data || !this.textDrawStart || !this.textDrawPreview) return;
    const layer = this.getTextLayerById(this.activeTextLayerId);
    if (!layer) return;
    const a = this.textDrawStart;
    const b = this.textDrawPreview;
    const rect = {
      x0: a.x,
      y0: a.y,
      x1: b.x,
      y1: b.y
    };
    const pxW = Math.abs(rect.x1 - rect.x0) * this.imgW;
    const pxH = Math.abs(rect.y1 - rect.y0) * this.imgH;
    if (pxW < 12 || pxH < 12) {
      new import_obsidian21.Notice("Text box too small.", 1500);
      return;
    }
    const box = {
      id: generateId("tbox"),
      name: `Text box ${((_b2 = (_a2 = layer.boxes) == null ? void 0 : _a2.length) != null ? _b2 : 0) + 1}`,
      mode: this.textDrawBoxMode,
      rect,
      lines: [],
      style: this.normalizeTextLayerStyle(layer.style),
      autoFlow: true,
      allowAngledBaselines: false,
      locked: false
    };
    if (box.mode === "auto") {
      box.auto = this.defaultTextBoxAutoConfig();
      box.lines = this.buildAutoTextBoxLines(box.rect, box.style, box.auto);
    }
    (_c = layer.boxes) != null ? _c : layer.boxes = [];
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
      new import_obsidian21.Notice("Draw baselines: click start + end. Hold ctrl for free angle (if enabled). Esc to exit.", 6e3);
      return;
    }
    this.openTextBoxConfigModal(layer, box);
  }
  renderMeasure() {
    if (!this.measureSvg) return;
    const doc = this.getOwnerDocument();
    this.measureSvg.setAttribute("width", String(this.imgW));
    this.updateTextHitboxInteractivity();
    this.measureSvg.setAttribute("height", String(this.imgH));
    const pts = [...this.measurePts];
    if (this.measuring && this.measurePreview) pts.push(this.measurePreview);
    const toAbs = (p) => ({ x: p.x * this.imgW, y: p.y * this.imgH });
    let d = "";
    pts.forEach((p, i2) => {
      const a = toAbs(p);
      d += i2 === 0 ? `M ${a.x} ${a.y}` : ` L ${a.x} ${a.y}`;
    });
    this.measurePath.setAttribute("d", d);
    while (this.measureDots.firstChild) this.measureDots.removeChild(this.measureDots.firstChild);
    for (const p of this.measurePts) {
      const a = toAbs(p);
      const c = doc.createElementNS("http://www.w3.org/2000/svg", "circle");
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
    this.updateTextHitboxInteractivity();
    const doc = this.getOwnerDocument();
    const toAbs = (p) => ({ x: p.x * this.imgW, y: p.y * this.imgH });
    const pts = [...this.calibPts];
    if (this.calibrating && this.calibPts.length === 1 && this.calibPreview) pts.push(this.calibPreview);
    let d = "";
    pts.forEach((p, i2) => {
      const a = toAbs(p);
      d += i2 === 0 ? `M ${a.x} ${a.y}` : ` L ${a.x} ${a.y}`;
    });
    this.calibPath.setAttribute("d", d);
    while (this.calibDots.firstChild) this.calibDots.removeChild(this.calibDots.firstChild);
    for (const p of this.calibPts) {
      const a = toAbs(p);
      const c = doc.createElementNS("http://www.w3.org/2000/svg", "circle");
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
    this.measureSegTerrainIds = [];
    this.renderMeasure();
  }
  ensureMeasureProTerrainIds() {
    var _a2, _b2;
    if (!this.plugin.settings.enableMeasurePro) return;
    const want = Math.max(0, this.measurePts.length - 1);
    const terrains = this.plugin.getActiveTerrains();
    const def = (_b2 = (_a2 = terrains[0]) == null ? void 0 : _a2.id) != null ? _b2 : "";
    while (this.measureSegTerrainIds.length < want) this.measureSegTerrainIds.push(def);
    if (this.measureSegTerrainIds.length > want) this.measureSegTerrainIds.length = want;
  }
  terrainFactor(id) {
    if (!id) return 1;
    const t = this.plugin.getActiveTerrains().find((x2) => x2.id === id);
    return t ? t.factor : 1;
  }
  computeMeasureSegmentsMeters(includePreview) {
    var _a2, _b2, _c;
    const mpp = this.getMetersPerPixel();
    if (!mpp) return null;
    const pts = [...this.measurePts];
    const terrains = [...this.measureSegTerrainIds];
    if (includePreview && this.measurePreview && pts.length >= 1) {
      pts.push(this.measurePreview);
      terrains.push((_b2 = (_a2 = terrains[terrains.length - 1]) != null ? _a2 : terrains[0]) != null ? _b2 : "");
    }
    if (pts.length < 2) return null;
    const out = [];
    for (let i2 = 1; i2 < pts.length; i2 += 1) {
      const a = pts[i2 - 1];
      const b = pts[i2];
      const dx = (b.x - a.x) * this.imgW;
      const dy = (b.y - a.y) * this.imgH;
      const px = Math.hypot(dx, dy);
      out.push({ meters: px * mpp, terrainId: (_c = terrains[i2 - 1]) != null ? _c : "" });
    }
    return out;
  }
  openMeasureTerrainModal() {
    var _a2, _b2, _c, _d;
    if (!this.plugin.settings.enableMeasurePro) return;
    if (this.measurePts.length < 2) {
      new import_obsidian21.Notice("Measure terrains: add at least 2 points first.", 2500);
      return;
    }
    const terrains = this.plugin.getActiveTerrains();
    if (terrains.length === 0) {
      new import_obsidian21.Notice("No terrains configured. Add terrains in settings \u2192 travel rules.", 4500);
      return;
    }
    this.ensureMeasureProTerrainIds();
    const unit = (_c = (_b2 = (_a2 = this.data) == null ? void 0 : _a2.measurement) == null ? void 0 : _b2.displayUnit) != null ? _c : "auto-metric";
    const mpp = this.getMetersPerPixel();
    if (!mpp && unit !== "custom") {
      new import_obsidian21.Notice("Scale is not calibrated.", 2500);
      return;
    }
    const segments = [];
    for (let i2 = 1; i2 < this.measurePts.length; i2 += 1) {
      const a = this.measurePts[i2 - 1];
      const b = this.measurePts[i2];
      const dx = (b.x - a.x) * this.imgW;
      const dy = (b.y - a.y) * this.imgH;
      const px = Math.hypot(dx, dy);
      const label = unit === "custom" ? this.formatCustomDistanceFromPixels(px) : this.formatDistance(px * mpp);
      segments.push({
        label,
        terrainId: (_d = this.measureSegTerrainIds[i2 - 1]) != null ? _d : terrains[0].id
      });
    }
    new MeasureTerrainModal(this.app, terrains, segments, (res) => {
      this.measureSegTerrainIds = res.map((s) => s.terrainId);
      this.updateMeasureHud();
    }).open();
  }
  toggleMeasureFromCommand() {
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
  clearMeasurementFromCommand() {
    if (!this.ready) return;
    this.clearMeasure();
  }
  getMetersPerPixel() {
    var _a2;
    const base = this.getActiveBasePath();
    const m = (_a2 = this.data) == null ? void 0 : _a2.measurement;
    if (!m) return void 0;
    if (m.scales && base in m.scales) return m.scales[base];
    return m.metersPerPixel;
  }
  ensureMeasurement() {
    var _a2, _b2, _c, _d, _e, _f, _g, _h, _i, _j;
    if (!this.data) return;
    (_b2 = (_a2 = this.data).measurement) != null ? _b2 : _a2.measurement = {
      displayUnit: "km",
      metersPerPixel: void 0,
      scales: {},
      travelTimePresetIds: []
    };
    (_d = (_c = this.data.measurement).scales) != null ? _d : _c.scales = {};
    (_f = (_e = this.data.measurement).displayUnit) != null ? _f : _e.displayUnit = "km";
    (_h = (_g = this.data.measurement).travelTimePresetIds) != null ? _h : _g.travelTimePresetIds = [];
    (_j = (_i = this.data.measurement).customUnitPxPerUnit) != null ? _j : _i.customUnitPxPerUnit = {};
  }
  getCustomPxPerUnit(customUnitId) {
    var _a2, _b2, _c;
    const base = this.getActiveBasePath();
    const map = (_c = (_b2 = (_a2 = this.data) == null ? void 0 : _a2.measurement) == null ? void 0 : _b2.customUnitPxPerUnit) == null ? void 0 : _c[base];
    const v = map == null ? void 0 : map[customUnitId];
    return typeof v === "number" && Number.isFinite(v) && v > 0 ? v : void 0;
  }
  async applyCustomUnitCalibration(customUnitId, pxPerUnit) {
    var _a2, _b2, _c;
    if (!this.data) return;
    this.ensureMeasurement();
    const base = this.getActiveBasePath();
    const meas = this.data.measurement;
    if (!meas) return;
    (_a2 = meas.customUnitPxPerUnit) != null ? _a2 : meas.customUnitPxPerUnit = {};
    (_c = (_b2 = meas.customUnitPxPerUnit)[base]) != null ? _c : _b2[base] = {};
    meas.customUnitPxPerUnit[base][customUnitId] = pxPerUnit;
    meas.displayUnit = "custom";
    meas.customUnitId = customUnitId;
    if (await this.store.wouldChange(this.data)) {
      this.ignoreNextModify = true;
      await this.store.save(this.data);
    }
    this.schedulePingUpdate();
  }
  updateMeasureHud() {
    var _a2, _b2, _c;
    if (!this.measureHud) return;
    const px = this.computeDistancePixels();
    const meters = this.computeDistanceMeters();
    const unit = (_c = (_b2 = (_a2 = this.data) == null ? void 0 : _a2.measurement) == null ? void 0 : _b2.displayUnit) != null ? _c : "km";
    if (this.measuring || this.measurePts.length >= 2) {
      let distTxt = "No scale";
      if (unit === "custom") {
        distTxt = px != null ? this.formatCustomDistanceFromPixels(px) : "No distance";
      } else {
        distTxt = meters != null ? this.formatDistance(meters) : "No scale";
      }
      const lines = [`Distance: ${distTxt}`];
      if (meters != null) {
        const segments = this.plugin.settings.enableMeasurePro ? this.computeMeasureSegmentsMeters(this.measuring && !!this.measurePreview) : null;
        const tt = segments ? this.computeTravelTimeLinesBySegments(segments) : this.computeTravelTimeLines(meters);
        if (tt.length) lines.push(...tt);
      }
      this.measureHud.textContent = lines.join("\n");
      this.measureHud.classList.add("zm-measure-hud-visible");
    } else {
      this.measureHud.classList.remove("zm-measure-hud-visible");
    }
  }
  computeDistanceMeters() {
    if (!this.data) return null;
    if (this.measurePts.length < 2 && !(this.measuring && this.measurePts.length >= 1 && this.measurePreview)) return null;
    const pts = [...this.measurePts];
    if (this.measuring && this.measurePreview) pts.push(this.measurePreview);
    let px = 0;
    for (let i2 = 1; i2 < pts.length; i2 += 1) {
      const a = pts[i2 - 1];
      const b = pts[i2];
      const dx = (b.x - a.x) * this.imgW;
      const dy = (b.y - a.y) * this.imgH;
      px += Math.hypot(dx, dy);
    }
    const mpp = this.getMetersPerPixel();
    if (!mpp) return null;
    return px * mpp;
  }
  computeDistancePixels() {
    if (!this.data) return null;
    if (this.measurePts.length < 2 && !(this.measuring && this.measurePts.length >= 1 && this.measurePreview)) return null;
    const pts = [...this.measurePts];
    if (this.measuring && this.measurePreview) pts.push(this.measurePreview);
    let px = 0;
    for (let i2 = 1; i2 < pts.length; i2 += 1) {
      const a = pts[i2 - 1];
      const b = pts[i2];
      const dx = (b.x - a.x) * this.imgW;
      const dy = (b.y - a.y) * this.imgH;
      px += Math.hypot(dx, dy);
    }
    return px;
  }
  formatCustomDistanceFromPixels(px) {
    var _a2, _b2, _c, _d, _e;
    const meas = (_a2 = this.data) == null ? void 0 : _a2.measurement;
    const defs = this.plugin.getActiveCustomUnits();
    if (!meas || defs.length === 0) return "No custom units";
    const id = (_b2 = meas.customUnitId) != null ? _b2 : defs[0].id;
    const def = (_c = defs.find((d) => d.id === id)) != null ? _c : defs[0];
    if (!def) return "No custom units";
    const pxPerUnit = this.getCustomPxPerUnit(def.id);
    const label = ((_d = def.abbreviation) != null ? _d : "").trim() || ((_e = def.name) != null ? _e : "").trim() || "u";
    if (!pxPerUnit) return `No calibration (${label})`;
    const val = px / pxPerUnit;
    const round = (v, d = 2) => Math.round(v * 10 ** d) / 10 ** d;
    return `${round(val, 2)} ${label}`;
  }
  formatDistance(m) {
    var _a2, _b2, _c, _d;
    const meas = (_a2 = this.data) == null ? void 0 : _a2.measurement;
    const unit = (_b2 = meas == null ? void 0 : meas.displayUnit) != null ? _b2 : "km";
    const round = (v, d = 2) => Math.round(v * 10 ** d) / 10 ** d;
    if (unit === "custom") {
      const defs = this.plugin.getActiveCustomUnits();
      if (defs.length === 0) {
        return `${round(m, 2)} u`;
      }
      const activeId = meas == null ? void 0 : meas.customUnitId;
      const def = (_d = (_c = activeId && defs.find((d) => d.id === activeId)) != null ? _c : defs[0]) != null ? _d : null;
      if (!def) {
        return `${round(m, 2)} u`;
      }
      const val = m / (def.metersPerUnit || 1);
      const label = typeof def.abbreviation === "string" && def.abbreviation.trim() || typeof def.name === "string" && def.name.trim() || "u";
      return `${round(val, 2)} ${label}`;
    }
    switch (unit) {
      case "m":
        return `${Math.round(m)} m`;
      case "km":
        return `${round(m / 1e3, 3)} km`;
      case "mi":
        return `${round(m / 1609.344, 3)} mi`;
      case "ft":
        return `${Math.round(m / 0.3048)} ft`;
      default:
        return `${round(m / 1e3, 3)} km`;
    }
  }
  travelDistanceToMeters(value, unit, customUnitId) {
    var _a2, _b2, _c;
    if (!Number.isFinite(value) || value <= 0) return null;
    switch (unit) {
      case "km":
        return value * 1e3;
      case "mi":
        return value * 1609.344;
      case "ft":
        return value * 0.3048;
      case "custom": {
        const defs = this.plugin.getActiveCustomUnits();
        const id = (_c = customUnitId ? (_a2 = defs.find((d) => d.id === customUnitId)) == null ? void 0 : _a2.id : void 0) != null ? _c : (_b2 = defs[0]) == null ? void 0 : _b2.id;
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
  formatTravelTimeNumber(v) {
    const abs = Math.abs(v);
    const decimals = abs < 10 ? 2 : abs < 100 ? 1 : 0;
    const p = 10 ** decimals;
    return String(Math.round(v * p) / p);
  }
  getSelectedTravelPerDayPreset() {
    var _a2, _b2, _c, _d, _e, _f, _g;
    const info = (_b2 = (_a2 = this.plugin).getActiveTravelPerDayPresets) == null ? void 0 : _b2.call(_a2);
    const presets = (_c = info == null ? void 0 : info.presets) != null ? _c : [];
    const note = (info == null ? void 0 : info.multipleEnabled) ? `Multiple travel packs enabled; using "${(_d = info.packName) != null ? _d : "first enabled"}".` : void 0;
    if (!presets.length) return { preset: null, note };
    const selectedId = ((_g = (_f = (_e = this.data) == null ? void 0 : _e.measurement) == null ? void 0 : _f.travelDayPresetId) != null ? _g : "").trim();
    const picked = selectedId ? presets.find((p) => p.id === selectedId) : void 0;
    return { preset: picked != null ? picked : presets[0], note };
  }
  computeTravelTimeLines(distanceMeters) {
    var _a2, _b2, _c, _d, _e, _f, _g, _h, _i, _j;
    const selected = new Set((_c = (_b2 = (_a2 = this.data) == null ? void 0 : _a2.measurement) == null ? void 0 : _b2.travelTimePresetIds) != null ? _c : []);
    if (selected.size === 0) return [];
    const presets = this.plugin.getActiveTravelTimePresets();
    const out = [];
    const perDaySel = this.getSelectedTravelPerDayPreset();
    const perDayPreset = perDaySel.preset;
    const perDayValue = (_d = perDayPreset == null ? void 0 : perDayPreset.value) != null ? _d : null;
    const perDayUnit = ((_e = perDayPreset == null ? void 0 : perDayPreset.unit) != null ? _e : "").trim();
    const perDayName = ((_f = perDayPreset == null ? void 0 : perDayPreset.name) != null ? _f : "").trim();
    const showDays = !!((_h = (_g = this.data) == null ? void 0 : _g.measurement) == null ? void 0 : _h.travelDaysEnabled);
    for (const p of presets) {
      if (!(p == null ? void 0 : p.id) || !selected.has(p.id)) continue;
      const name = ((_i = p.name) != null ? _i : "").trim();
      const unit = ((_j = p.timeUnit) != null ? _j : "").trim();
      if (!name || !unit) continue;
      if (!Number.isFinite(p.timeValue) || p.timeValue <= 0) continue;
      const refMeters = this.travelDistanceToMeters(
        p.distanceValue,
        p.distanceUnit,
        p.distanceCustomUnitId
      );
      if (!refMeters) continue;
      const t = distanceMeters / refMeters * p.timeValue;
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
          `Travel days${label} (${perDayValue} ${perDayUnit}/day): 0d + ${this.formatTravelTimeNumber(rest)} ${unit}`
        );
      } else {
        out.push(
          `Travel days${label} (${perDayValue} ${perDayUnit}/day): ${fullDays}d + ${this.formatTravelTimeNumber(rest)} ${unit}`
        );
      }
    }
    return out;
  }
  computeTravelTimeLinesBySegments(segments) {
    var _a2, _b2, _c, _d, _e, _f, _g, _h, _i, _j;
    const selected = new Set((_c = (_b2 = (_a2 = this.data) == null ? void 0 : _a2.measurement) == null ? void 0 : _b2.travelTimePresetIds) != null ? _c : []);
    if (selected.size === 0) return [];
    const presets = this.plugin.getActiveTravelTimePresets();
    const out = [];
    const perDaySel = this.getSelectedTravelPerDayPreset();
    const perDayPreset = perDaySel.preset;
    const perDayValue = (_d = perDayPreset == null ? void 0 : perDayPreset.value) != null ? _d : null;
    const perDayUnit = ((_e = perDayPreset == null ? void 0 : perDayPreset.unit) != null ? _e : "").trim();
    const perDayName = ((_f = perDayPreset == null ? void 0 : perDayPreset.name) != null ? _f : "").trim();
    const showDays = !!((_h = (_g = this.data) == null ? void 0 : _g.measurement) == null ? void 0 : _h.travelDaysEnabled);
    for (const p of presets) {
      if (!(p == null ? void 0 : p.id) || !selected.has(p.id)) continue;
      const name = ((_i = p.name) != null ? _i : "").trim();
      const unit = ((_j = p.timeUnit) != null ? _j : "").trim();
      if (!name || !unit) continue;
      if (!Number.isFinite(p.timeValue) || p.timeValue <= 0) continue;
      const refMeters = this.travelDistanceToMeters(
        p.distanceValue,
        p.distanceUnit,
        p.distanceCustomUnitId
      );
      if (!refMeters) continue;
      let t = 0;
      for (const seg of segments) {
        const f = this.terrainFactor(seg.terrainId);
        t += seg.meters / refMeters * p.timeValue / (f > 0 ? f : 1);
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
          `Travel days${label} (${perDayValue} ${perDayUnit}/day): 0d + ${this.formatTravelTimeNumber(rest)} ${unit}`
        );
      } else {
        out.push(
          `Travel days${label} (${perDayValue} ${perDayUnit}/day): ${fullDays}d + ${this.formatTravelTimeNumber(rest)} ${unit}`
        );
      }
    }
    return out;
  }
  resolveTFile(pathOrWiki, from) {
    const byPath = this.app.vault.getAbstractFileByPath(pathOrWiki);
    if (byPath instanceof import_obsidian21.TFile) return byPath;
    const dest = this.app.metadataCache.getFirstLinkpathDest(pathOrWiki, from);
    return dest instanceof import_obsidian21.TFile ? dest : null;
  }
  resolveResourceUrl(pathOrData) {
    if (!pathOrData) return "";
    if (pathOrData.startsWith("data:")) return pathOrData;
    const f = this.resolveTFile(pathOrData, this.cfg.sourcePath);
    if (f) return this.app.vault.getResourcePath(f);
    return pathOrData;
  }
  onResize() {
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
    if (oldVw < 2 || oldVh < 2) {
      if (!this.initialViewApplied) {
        if (this.cfg.initialViewRect) {
          this.applyInitialViewRect(this.cfg.initialViewRect);
        } else if (this.cfg.initialZoom && this.cfg.initialCenter) {
          this.applyInitialView(this.cfg.initialZoom, this.cfg.initialCenter);
        } else {
          this.fitToView();
        }
        this.initialViewApplied = true;
      } else if (this.lastGoodView) {
        this.applyInitialView(this.lastGoodView.scale, this.lastGoodView.center);
      } else {
        this.applyTransform(this.scale, this.tx, this.ty);
      }
      if (this.isCanvas()) this.renderCanvas();
      this.renderMarkersOnly();
      this.renderDrawingEditHandles();
      return;
    }
    const worldCx = (oldVw / 2 - this.tx) / this.scale;
    const worldCy = (oldVh / 2 - this.ty) / this.scale;
    const txNew = this.vw / 2 - worldCx * this.scale;
    const tyNew = this.vh / 2 - worldCy * this.scale;
    this.applyTransform(this.scale, txNew, tyNew, true);
    this.renderMarkersOnly();
    this.renderDrawingEditHandles();
    if (this.shouldUseSavedFrame() && this.cfg.resizable && this.cfg.resizeHandle === "native" && !this.userResizing) {
      if (!this.initialLayoutDone) this.initialLayoutDone = true;
      else if (this.isFrameVisibleEnough()) this.requestPersistFrame();
    }
  }
  onWheel(e) {
    var _a2;
    if (!this.ready) return;
    const factor = (_a2 = this.plugin.settings.wheelZoomFactor) != null ? _a2 : 1.1;
    const step = Math.pow(factor, e.deltaY < 0 ? 1 : -1);
    const vpRect = this.viewportEl.getBoundingClientRect();
    const cx = clamp(e.clientX - vpRect.left, 0, this.vw);
    const cy = clamp(e.clientY - vpRect.top, 0, this.vh);
    this.zoomAt(cx, cy, step);
  }
  panButtonMatches(e) {
    var _a2;
    const want = (_a2 = this.plugin.settings.panMouseButton) != null ? _a2 : "left";
    if (want === "middle") return e.button === 1;
    if (want === "right") return e.button === 2;
    return e.button === 0;
  }
  onPointerDownViewport(e) {
    var _a2;
    if (!this.ready) return;
    if (this.gridAlignId) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
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
    const captureTarget = this.asElement(e.target);
    (_a2 = captureTarget == null ? void 0 : captureTarget.setPointerCapture) == null ? void 0 : _a2.call(captureTarget, e.pointerId);
    const tgt = this.asElement(e.target);
    if (tgt == null ? void 0 : tgt.closest(".zm-marker")) return;
    if (this.cfg.responsive) return;
    if (this.activePointers.size === 2) {
      this.startPinch();
      return;
    }
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
  onPointerMove(e) {
    var _a2, _b2, _c;
    if (!this.ready) return;
    if (this.gridAlignId) {
      const vpRect = this.viewportEl.getBoundingClientRect();
      const vx = e.clientX - vpRect.left;
      const vy = e.clientY - vpRect.top;
      const wx = (vx - this.tx) / this.scale;
      const wy = (vy - this.ty) / this.scale;
      this.gridAlignPreview = { x: clamp(wx, 0, this.imgW), y: clamp(wy, 0, this.imgH) };
      this.renderGrids();
      return;
    }
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
    if (e.pointerType === "touch") {
      if (this.draggingView || this.pinchActive) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
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
      const off = (_a2 = this.dragAnchorOffset) != null ? _a2 : { dx: 0, dy: 0 };
      if (m.anchorSpace === "viewport") {
        const vw = vpRect.width || 1;
        const vh = vpRect.height || 1;
        const leftScreen = vx - off.dx;
        const topScreen = vy - off.dy;
        const prevX = (_b2 = m.hudX) != null ? _b2 : leftScreen;
        const prevY = (_c = m.hudY) != null ? _c : topScreen;
        m.hudX = leftScreen;
        m.hudY = topScreen;
        m.hudLastWidth = vw;
        m.hudLastHeight = vh;
        m.x = vw > 0 ? leftScreen / vw : 0;
        m.y = vh > 0 ? topScreen / vh : 0;
        const movedEnough = Math.hypot(leftScreen - prevX, topScreen - prevY) > 1;
        if (movedEnough) this.dragMoved = true;
      } else {
        const wx = (vx - this.tx) / this.scale;
        const wy = (vy - this.ty) / this.scale;
        const nx = clamp((wx - off.dx) / this.imgW, 0, 1);
        const ny = clamp((wy - off.dy) / this.imgH, 0, 1);
        const movedEnough = Math.hypot(
          (nx - m.x) * this.imgW,
          (ny - m.y) * this.imgH
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
  onPointerUp(e) {
    var _a2;
    if (this.drawEditPointerId !== null && (!e || e.pointerId === this.drawEditPointerId)) {
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
    if (e) {
      this.handleTouchTapOnPointerUp(e);
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
        this.schedulePingUpdate();
      }
      const host = (_a2 = this.markersEl.querySelector(`.zm-marker[data-id="${draggedId}"]`)) != null ? _a2 : this.hudMarkersEl.querySelector(`.zm-marker[data-id="${draggedId}"]`);
      if (host) host.classList.remove("zm-marker--dragging");
    }
    this.draggingMarkerId = null;
    this.dragAnchorOffset = null;
    this.dragMoved = false;
    this.getOwnerBody().classList.remove("zm-cursor-grabbing");
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
  startPinch() {
    const pts = this.getTwoPointers();
    if (!pts) return;
    this.pinchActive = true;
    this.pinchStartScale = this.scale;
    this.pinchPrevCenter = this.mid(pts[0], pts[1]);
    this.pinchStartDist = this.dist(pts[0], pts[1]);
    this.resetTouchDoubleTapState();
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
  canUseNativeTouchCapture() {
    if (!this.ready) return false;
    if (this.cfg.responsive) return false;
    return true;
  }
  resetNativeTouchCapture() {
    this.touchGestureCandidate = false;
    this.touchGestureLocked = false;
    this.touchGestureStartX = 0;
    this.touchGestureStartY = 0;
  }
  shouldIgnoreNativeTouchCapture(target) {
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
        ".zm-text-input"
      ].join(", ")
    );
  }
  resetTouchDoubleTapState() {
    this.lastTouchTapTs = 0;
    this.lastTouchTapClient = null;
  }
  handleTouchTapOnPointerUp(e) {
    if (e.pointerType !== "touch") return;
    const target = e.target;
    if (!this.isOwnerElement(target)) {
      this.resetTouchDoubleTapState();
      return;
    }
    const targetEl = target;
    if (!targetEl || !this.viewportEl.contains(targetEl)) {
      this.resetTouchDoubleTapState();
      return;
    }
    if (targetEl.closest(".zm-marker") || targetEl.closest(".popover") || targetEl.closest(".hover-popover") || targetEl.closest(".zm-menu") || targetEl.closest(".zm-submenu") || targetEl.closest(".zm-tooltip")) {
      this.resetTouchDoubleTapState();
      return;
    }
    if (this.draggingMarkerId || this.viewDragMoved || this.pinchActive || this.calibrating || this.drawingMode || this.textMode === "draw-box" || this.textMode === "draw-lines" || this.textMode === "move") {
      this.resetTouchDoubleTapState();
      return;
    }
    const now = Date.now();
    const prev = this.lastTouchTapClient;
    const isDoubleTap = !!prev && now - this.lastTouchTapTs <= this.touchDoubleTapMs && Math.hypot(prev.x - e.clientX, prev.y - e.clientY) <= this.touchDoubleTapDistPx;
    if (!isDoubleTap) {
      this.lastTouchTapTs = now;
      this.lastTouchTapClient = { x: e.clientX, y: e.clientY };
      return;
    }
    this.resetTouchDoubleTapState();
    this.handleTouchDoubleTapAction(e.clientX, e.clientY);
  }
  handleTouchDoubleTapAction(clientX, clientY) {
    if (!this.ready) return;
    if (this.measuring) {
      this.measuring = false;
      this.clearMeasure();
      this.updateMeasureHud();
      new import_obsidian21.Notice("Measurement cleared.", 1200);
      return;
    }
    if (this.cfg.displayOnly) return;
    if (this.textMode === "edit") return;
    const vpRect = this.viewportEl.getBoundingClientRect();
    const vx = clientX - vpRect.left;
    const vy = clientY - vpRect.top;
    const wx = (vx - this.tx) / this.scale;
    const wy = (vy - this.ty) / this.scale;
    const nx = clamp(wx / this.imgW, 0, 1);
    const ny = clamp(wy / this.imgH, 0, 1);
    this.addMarkerInteractive(nx, ny);
  }
  onDblClickViewport(e) {
    if (!this.ready) return;
    if (this.gridAlignId) {
      return;
    }
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
  onClickViewport(e) {
    var _a2;
    if (!this.ready) return;
    if (this.gridAlignId) {
      const vpRect = this.viewportEl.getBoundingClientRect();
      const vx = e.clientX - vpRect.left;
      const vy = e.clientY - vpRect.top;
      const wx = (vx - this.tx) / this.scale;
      const wy = (vy - this.ty) / this.scale;
      this.gridAlignPreview = {
        x: clamp(wx, 0, this.imgW),
        y: clamp(wy, 0, this.imgH)
      };
      this.stopGridAlignMode(true);
      return;
    }
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
        y: clamp(wy / this.imgH, 0, 1)
      };
      this.calibPts.push(p);
      if (this.calibPts.length === 2) {
        const pxDist = Math.hypot(
          (this.calibPts[1].x - this.calibPts[0].x) * this.imgW,
          (this.calibPts[1].y - this.calibPts[0].y) * this.imgH
        );
        const meas = (_a2 = this.data) == null ? void 0 : _a2.measurement;
        const customDefs = this.plugin.getActiveCustomUnits();
        let initialUnit = "km";
        if ((meas == null ? void 0 : meas.displayUnit) === "custom" && typeof meas.customUnitId === "string" && meas.customUnitId.trim()) {
          initialUnit = `custom:${meas.customUnitId}`;
        } else if ((meas == null ? void 0 : meas.displayUnit) === "m" || (meas == null ? void 0 : meas.displayUnit) === "km" || (meas == null ? void 0 : meas.displayUnit) === "mi" || (meas == null ? void 0 : meas.displayUnit) === "ft") {
          initialUnit = meas.displayUnit;
        }
        new ScaleCalibrateModal(
          this.app,
          pxDist,
          (result) => {
            void (async () => {
              var _a3, _b2, _c;
              if (typeof result.metersPerPixel === "number") {
                await this.applyScaleCalibration(result.metersPerPixel);
                this.ensureMeasurement();
                if ((_a3 = this.data) == null ? void 0 : _a3.measurement) {
                  if (result.unit === "m" || result.unit === "km" || result.unit === "mi" || result.unit === "ft") {
                    this.data.measurement.displayUnit = result.unit;
                    delete this.data.measurement.customUnitId;
                    await this.saveDataSoon();
                  }
                }
                new import_obsidian21.Notice(`Scale set: ${result.metersPerPixel.toFixed(6)} m/px`, 2e3);
              } else if (result.customUnitId && typeof result.pixelsPerUnit === "number") {
                await this.applyCustomUnitCalibration(result.customUnitId, result.pixelsPerUnit);
                const defs = this.plugin.getActiveCustomUnits();
                const def = defs.find((d) => d.id === result.customUnitId);
                const label = ((_c = (_b2 = def == null ? void 0 : def.abbreviation) != null ? _b2 : def == null ? void 0 : def.name) != null ? _c : result.customUnitId).trim();
                new import_obsidian21.Notice(`Unit scale set: ${result.pixelsPerUnit.toFixed(3)} px/${label}`, 2500);
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
            customUnits: customDefs.map((u) => ({ id: u.id, name: u.name, abbreviation: u.abbreviation }))
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
  getLayerById(id) {
    var _a2;
    return (_a2 = this.data) == null ? void 0 : _a2.layers.find((l) => l.id === id);
  }
  getPreferredNewMarkerLayerId() {
    var _a2, _b2, _c, _d, _e, _f;
    if (!this.data || !this.data.layers || this.data.layers.length === 0) {
      return "default";
    }
    const prefer = !!this.plugin.settings.preferActiveLayerInEditor;
    if (prefer) {
      return (_d = (_c = (_a2 = this.data.layers.find((l) => l.visible && !l.locked)) == null ? void 0 : _a2.id) != null ? _c : (_b2 = this.data.layers.find((l) => l.visible)) == null ? void 0 : _b2.id) != null ? _d : this.data.layers[0].id;
    }
    return (_f = (_e = this.data.layers.find((l) => l.visible)) == null ? void 0 : _e.id) != null ? _f : this.data.layers[0].id;
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
  async applyBoundBaseVisibility() {
    var _a2;
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
    for (const dl of (_a2 = this.data.drawLayers) != null ? _a2 : []) {
      if (!dl.boundBase) continue;
      const want = dl.boundBase === active;
      if (dl.visible !== want) {
        dl.visible = want;
        changed = true;
      }
    }
    if (changed) {
      this.renderMarkersOnly();
      this.renderDrawings();
      this.renderTextLayers();
      await this.saveDataSoon();
    }
  }
  /* ===== Collections helpers ===== */
  getActiveBasePath() {
    var _a2, _b2, _c;
    if (!this.data) return this.cfg.imagePath;
    return (_c = (_b2 = this.data.activeBase) != null ? _b2 : (_a2 = this.getBasesNormalized()[0]) == null ? void 0 : _a2.path) != null ? _c : this.cfg.imagePath;
  }
  getCollectionsSplitForActive() {
    var _a2;
    const all = ((_a2 = this.plugin.settings.baseCollections) != null ? _a2 : []).filter(Boolean);
    const active = this.getActiveBasePath();
    const matches = (c) => {
      var _a3, _b2;
      return ((_b2 = (_a3 = c.bindings) == null ? void 0 : _a3.basePaths) != null ? _b2 : []).some((p) => p === active);
    };
    const isGlobal = (c) => {
      var _a3, _b2;
      return !c.bindings || ((_b2 = (_a3 = c.bindings.basePaths) == null ? void 0 : _a3.length) != null ? _b2 : 0) === 0;
    };
    const matched = all.filter(matches);
    const globals = all.filter(isGlobal);
    return { matched, globals };
  }
  computeCollectionSets() {
    const { matched, globals } = this.getCollectionsSplitForActive();
    const pinsBase = [...new Set(matched.flatMap((c) => {
      var _a2, _b2;
      return (_b2 = (_a2 = c.include) == null ? void 0 : _a2.pinKeys) != null ? _b2 : [];
    }))];
    const favsBase = [];
    matched.forEach(
      (c) => {
        var _a2, _b2;
        return ((_b2 = (_a2 = c.include) == null ? void 0 : _a2.favorites) != null ? _b2 : []).forEach((f) => favsBase.push(f));
      }
    );
    const stickersBase = [];
    matched.forEach(
      (c) => {
        var _a2, _b2;
        return ((_b2 = (_a2 = c.include) == null ? void 0 : _a2.stickers) != null ? _b2 : []).forEach((s) => stickersBase.push(s));
      }
    );
    const pinsGlobal = [...new Set(globals.flatMap((c) => {
      var _a2, _b2;
      return (_b2 = (_a2 = c.include) == null ? void 0 : _a2.pinKeys) != null ? _b2 : [];
    }))];
    const favsGlobal = [];
    globals.forEach(
      (c) => {
        var _a2, _b2;
        return ((_b2 = (_a2 = c.include) == null ? void 0 : _a2.favorites) != null ? _b2 : []).forEach((f) => favsGlobal.push(f));
      }
    );
    const stickersGlobal = [];
    globals.forEach(
      (c) => {
        var _a2, _b2;
        return ((_b2 = (_a2 = c.include) == null ? void 0 : _a2.stickers) != null ? _b2 : []).forEach((s) => stickersGlobal.push(s));
      }
    );
    const swapBase = [];
    matched.forEach(
      (c) => {
        var _a2, _b2;
        return ((_b2 = (_a2 = c.include) == null ? void 0 : _a2.swapPins) != null ? _b2 : []).forEach((sp) => swapBase.push(sp));
      }
    );
    const swapGlobal = [];
    globals.forEach(
      (c) => {
        var _a2, _b2;
        return ((_b2 = (_a2 = c.include) == null ? void 0 : _a2.swapPins) != null ? _b2 : []).forEach((sp) => swapGlobal.push(sp));
      }
    );
    const pingBase = [];
    matched.forEach(
      (c) => {
        var _a2, _b2;
        return ((_b2 = (_a2 = c.include) == null ? void 0 : _a2.pingPins) != null ? _b2 : []).forEach((pp) => pingBase.push(pp));
      }
    );
    const pingGlobal = [];
    globals.forEach(
      (c) => {
        var _a2, _b2;
        return ((_b2 = (_a2 = c.include) == null ? void 0 : _a2.pingPins) != null ? _b2 : []).forEach((pp) => pingGlobal.push(pp));
      }
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
      pingGlobal
    };
  }
  findSwapPresetById(id) {
    var _a2, _b2, _c;
    const cols = (_a2 = this.plugin.settings.baseCollections) != null ? _a2 : [];
    for (const col of cols) {
      const list = (_c = (_b2 = col.include) == null ? void 0 : _b2.swapPins) != null ? _c : [];
      const found = list.find((sp) => sp.id === id);
      if (found) return found;
    }
    return void 0;
  }
  findPingPresetById(id) {
    var _a2, _b2, _c;
    const cols = (_a2 = this.plugin.settings.baseCollections) != null ? _a2 : [];
    for (const col of cols) {
      const list = (_c = (_b2 = col.include) == null ? void 0 : _b2.pingPins) != null ? _c : [];
      const found = list.find((pp) => pp.id === id);
      if (found) return found;
    }
    return void 0;
  }
  getSwapFrameForMarker(m) {
    if (m.type !== "swap" || !m.swapKey) return null;
    const preset = this.findSwapPresetById(m.swapKey);
    if (!preset || !preset.frames.length) return null;
    const rawIndex = typeof m.swapIndex === "number" ? m.swapIndex : 0;
    const count = preset.frames.length;
    const idx = (rawIndex % count + count) % count;
    return preset.frames[idx];
  }
  worldNormToViewportPx(nx, ny) {
    return {
      x: this.tx + nx * this.imgW * this.scale,
      y: this.ty + ny * this.imgH * this.scale
    };
  }
  viewportPxToWorldNorm(hx, hy) {
    return {
      x: clamp((hx - this.tx) / this.scale / this.imgW, 0, 1),
      y: clamp((hy - this.ty) / this.scale / this.imgH, 0, 1)
    };
  }
  getPingPresetsSplitForActive() {
    const { pingBase, pingGlobal } = this.computeCollectionSets();
    return { pingBase, pingGlobal };
  }
  getSwapEffectiveLink(m) {
    var _a2, _b2, _c;
    if (m.type !== "swap") return m.link;
    if (!m.swapKey) return m.link;
    const preset = this.findSwapPresetById(m.swapKey);
    if (!preset || !preset.frames.length) return m.link;
    const rawIndex = typeof m.swapIndex === "number" ? m.swapIndex : 0;
    const count = preset.frames.length;
    const idx = (rawIndex % count + count) % count;
    const override = (_a2 = m.swapLinks) == null ? void 0 : _a2[idx];
    if (typeof override === "string" && override.trim()) return override.trim();
    const frame = preset.frames[idx];
    const presetLink = ((_b2 = frame == null ? void 0 : frame.link) != null ? _b2 : "").trim();
    if (presetLink) return presetLink;
    const iconKey = ((_c = frame == null ? void 0 : frame.iconKey) != null ? _c : "").trim();
    if (iconKey) return this.plugin.getIconDefaultLink(iconKey);
    return m.link;
  }
  advanceSwapPin(m) {
    if (m.type !== "swap" || !m.swapKey) return;
    const preset = this.findSwapPresetById(m.swapKey);
    if (!preset || !preset.frames.length) return;
    const rawIndex = typeof m.swapIndex === "number" ? m.swapIndex : 0;
    const next = rawIndex + 1;
    const count = preset.frames.length;
    m.swapIndex = (next % count + count) % count;
  }
  addSwapPinHere(preset, vx, vy) {
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
    const marker = {
      id: generateId("marker"),
      type: "swap",
      layer: layerId,
      x: 0,
      y: 0,
      swapKey: preset.id,
      swapIndex: 0
    };
    if (isHud) {
      marker.anchorSpace = "viewport";
      marker.hudX = vx;
      marker.hudY = vy;
      this.classifyHudMetaFromCurrentPosition(
        marker,
        this.viewportEl.getBoundingClientRect()
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
    new import_obsidian21.Notice("Swap pin added.", 900);
  }
  async rollDiceMarker(m) {
    var _a2;
    if (!this.data) return;
    if (m.type !== "dice") return;
    const rolls = (_a2 = m.diceRolls) != null ? _a2 : [{ count: 1, sides: 20 }];
    const formula = diceRollsToFormula(rolls);
    const want3d = !!m.diceRender3d;
    const w = window;
    const api = w.DiceRoller;
    if (want3d) {
      const ws = this.app.workspace;
      if (ws && typeof ws.trigger === "function") {
        try {
          ws.trigger("dice-roller:render-dice", `${formula}|render`);
          return;
        } catch (e) {
        }
      }
    }
    if (api && typeof api.parseDice === "function") {
      try {
        const res = await api.parseDice(formula, this.cfg.sourcePath);
        new import_obsidian21.Notice(`Roll: ${formula}
Result: ${formatDiceApiResult(res == null ? void 0 : res.result)}`.trim(), 5e3);
        return;
      } catch (e) {
      }
    }
    const local = localRollDice(rolls);
    new import_obsidian21.Notice(`Roll: ${formula}
${local.details}
Total: ${local.total}`, 6e3);
  }
  addDicePinHere(nx, ny, vx, vy) {
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
        placeAsHudPin: false
      },
      (res) => {
        if (!this.data) return;
        if (res.action !== "save") return;
        const marker = {
          id: generateId("dice"),
          type: "dice",
          x: nx,
          y: ny,
          layer: layerId,
          iconKey: res.value.iconKey,
          diceRolls: res.value.rolls,
          diceRender3d: res.value.render3d ? true : void 0,
          scaleLikeSticker: res.value.scaleLikeSticker ? true : void 0,
          tooltip: diceRollsToFormula(res.value.rolls)
        };
        if (res.value.placeAsHudPin && typeof vx === "number" && typeof vy === "number") {
          marker.anchorSpace = "viewport";
          marker.hudX = vx;
          marker.hudY = vy;
          this.classifyHudMetaFromCurrentPosition(
            marker,
            this.viewportEl.getBoundingClientRect()
          );
        }
        this.data.markers.push(marker);
        void this.saveDataSoon();
        this.renderMarkersOnly();
        new import_obsidian21.Notice("Dice pin added.", 900);
      }
    ).open();
  }
  getPreferredTextLayer() {
    var _a2, _b2;
    if (!this.data) return null;
    const activeBase = this.getActiveBasePath();
    const current = this.getTextLayerById(this.activeTextLayerId);
    if (current && this.isTextLayerVisible(current) && (!current.boundBase || current.boundBase === activeBase)) {
      return current;
    }
    return (_b2 = ((_a2 = this.data.textLayers) != null ? _a2 : []).find((l) => this.isTextLayerVisible(l) && (!l.boundBase || l.boundBase === activeBase))) != null ? _b2 : null;
  }
  drawingToTextBoxRect(d) {
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
        y1: clamp(maxY + padY, 0, 1)
      };
    }
    return null;
  }
  polylineToBaselines(points) {
    const out = [];
    for (let i2 = 1; i2 < points.length; i2 += 1) {
      const a = points[i2 - 1];
      const b = points[i2];
      const dxPx = (b.x - a.x) * this.imgW;
      const dyPx = (b.y - a.y) * this.imgH;
      const angleDeg = Math.atan2(dyPx, dxPx) * 180 / Math.PI;
      const start = angleDeg > 90 || angleDeg < -90 ? b : a;
      const end = angleDeg > 90 || angleDeg < -90 ? a : b;
      out.push({
        id: generateId("tln"),
        x0: start.x,
        y0: start.y,
        x1: end.x,
        y1: end.y,
        text: ""
      });
    }
    return out;
  }
  applyDrawingAsTextBox(d, mode) {
    var _a2;
    if (!this.data) return;
    const layer = this.getPreferredTextLayer();
    if (!layer) {
      new import_obsidian21.Notice("Create a visible text layer first.", 2500);
      return;
    }
    const rect = this.drawingToTextBoxRect(d);
    if (!rect) {
      new import_obsidian21.Notice("This drawing cannot be converted to a text box.", 2500);
      return;
    }
    const box = {
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
      sourceDrawingKind: d.kind
    };
    if (d.kind === "polyline" && d.polyline) {
      box.lines = this.polylineToBaselines(d.polyline);
    } else if (mode === "auto") {
      box.auto = this.defaultTextBoxAutoConfig();
      box.lines = this.buildAutoTextBoxLines(rect, box.style, box.auto);
    }
    (_a2 = layer.boxes) != null ? _a2 : layer.boxes = [];
    layer.boxes.push(box);
    void this.saveDataSoon();
    this.renderTextLayers();
  }
  buildMeasureMenuItems() {
    var _a2, _b2, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q;
    const meas = (_a2 = this.data) == null ? void 0 : _a2.measurement;
    const currentUnit = (_b2 = meas == null ? void 0 : meas.displayUnit) != null ? _b2 : "km";
    const currentCustomId = meas == null ? void 0 : meas.customUnitId;
    const unitItems = [
      {
        label: "m",
        checked: currentUnit === "m",
        action: () => {
          var _a3;
          this.ensureMeasurement();
          if ((_a3 = this.data) == null ? void 0 : _a3.measurement) {
            this.data.measurement.displayUnit = "m";
            delete this.data.measurement.customUnitId;
            void this.saveDataSoon();
            this.updateMeasureHud();
          }
          this.closeMenu();
        }
      },
      {
        label: "km",
        checked: currentUnit === "km",
        action: () => {
          var _a3;
          this.ensureMeasurement();
          if ((_a3 = this.data) == null ? void 0 : _a3.measurement) {
            this.data.measurement.displayUnit = "km";
            delete this.data.measurement.customUnitId;
            void this.saveDataSoon();
            this.updateMeasureHud();
          }
          this.closeMenu();
        }
      },
      {
        label: "mi",
        checked: currentUnit === "mi",
        action: () => {
          var _a3;
          this.ensureMeasurement();
          if ((_a3 = this.data) == null ? void 0 : _a3.measurement) {
            this.data.measurement.displayUnit = "mi";
            delete this.data.measurement.customUnitId;
            void this.saveDataSoon();
            this.updateMeasureHud();
          }
          this.closeMenu();
        }
      },
      {
        label: "ft",
        checked: currentUnit === "ft",
        action: () => {
          var _a3;
          this.ensureMeasurement();
          if ((_a3 = this.data) == null ? void 0 : _a3.measurement) {
            this.data.measurement.displayUnit = "ft";
            delete this.data.measurement.customUnitId;
            void this.saveDataSoon();
            this.updateMeasureHud();
          }
          this.closeMenu();
        }
      }
    ];
    const customDefs = this.plugin.getActiveCustomUnits();
    if (customDefs.length > 0) {
      unitItems.push({ type: "separator" });
      for (const def of customDefs) {
        const isActive = currentUnit === "custom" && currentCustomId === def.id;
        unitItems.push({
          label: def.abbreviation ? `${def.name} (${def.abbreviation})` : def.name,
          checked: isActive,
          action: () => {
            var _a3;
            this.ensureMeasurement();
            if ((_a3 = this.data) == null ? void 0 : _a3.measurement) {
              this.data.measurement.displayUnit = "custom";
              this.data.measurement.customUnitId = def.id;
              void this.saveDataSoon();
              this.updateMeasureHud();
            }
            this.closeMenu();
          }
        });
      }
    }
    const travelPresets = this.plugin.getActiveTravelTimePresets();
    const selectedTravel = new Set((_e = (_d = (_c = this.data) == null ? void 0 : _c.measurement) == null ? void 0 : _d.travelTimePresetIds) != null ? _e : []);
    const travelTimeItems = [];
    const perDayInfo = (_g = (_f = this.plugin).getActiveTravelPerDayPresets) == null ? void 0 : _g.call(_f);
    const perDayPresets = (_h = perDayInfo == null ? void 0 : perDayInfo.presets) != null ? _h : [];
    const selectedPerDayId = ((_k = (_j = (_i = this.data) == null ? void 0 : _i.measurement) == null ? void 0 : _j.travelDayPresetId) != null ? _k : "").trim();
    const effectiveId = selectedPerDayId && perDayPresets.some((p) => p.id === selectedPerDayId) ? selectedPerDayId : (_m = (_l = perDayPresets[0]) == null ? void 0 : _l.id) != null ? _m : "";
    travelTimeItems.push({
      label: "Show travel days",
      mark: ((_o = (_n = this.data) == null ? void 0 : _n.measurement) == null ? void 0 : _o.travelDaysEnabled) ? "check" : "x",
      markColor: ((_q = (_p = this.data) == null ? void 0 : _p.measurement) == null ? void 0 : _q.travelDaysEnabled) ? "var(--text-accent)" : "var(--text-muted)",
      action: (rowEl) => {
        var _a3;
        this.ensureMeasurement();
        if (!((_a3 = this.data) == null ? void 0 : _a3.measurement)) return;
        const next = !this.data.measurement.travelDaysEnabled;
        this.data.measurement.travelDaysEnabled = next;
        void this.saveDataSoon();
        this.updateMeasureHud();
        const chk = rowEl.querySelector(".zm-menu__check");
        if (chk) {
          chk.textContent = next ? "\u2713" : "\xD7";
          chk.style.color = next ? "var(--text-accent)" : "var(--text-muted)";
        }
      },
      checked: false
    });
    travelTimeItems.push({
      label: "Max travel time",
      children: perDayPresets.length ? perDayPresets.map((tpd) => ({
        label: tpd.name || tpd.id,
        checked: effectiveId === tpd.id,
        action: (rowEl) => {
          var _a3;
          this.ensureMeasurement();
          if (!((_a3 = this.data) == null ? void 0 : _a3.measurement)) return;
          this.data.measurement.travelDayPresetId = tpd.id;
          void this.saveDataSoon();
          this.updateMeasureHud();
          const menu = rowEl.parentElement;
          menu == null ? void 0 : menu.querySelectorAll(".zm-menu__check").forEach((c) => c.textContent = "");
          const chk = rowEl.querySelector(".zm-menu__check");
          if (chk) chk.textContent = "\u2713";
        }
      })) : [{ label: "(No max travel time presets configured)", action: () => new import_obsidian21.Notice("Configure max travel time presets in settings \u2192 travel rules.", 3500) }]
    });
    travelTimeItems.push({ type: "separator" });
    if (travelPresets.length) {
      travelTimeItems.push(
        ...travelPresets.map((p) => ({
          label: p.name || p.id,
          checked: selectedTravel.has(p.id),
          action: (rowEl) => {
            var _a3, _b3, _c2;
            this.ensureMeasurement();
            if (!((_a3 = this.data) == null ? void 0 : _a3.measurement)) return;
            const arr = (_c2 = (_b3 = this.data.measurement).travelTimePresetIds) != null ? _c2 : _b3.travelTimePresetIds = [];
            const i2 = arr.indexOf(p.id);
            if (i2 >= 0) arr.splice(i2, 1);
            else arr.push(p.id);
            void this.saveDataSoon();
            this.updateMeasureHud();
            const chk = rowEl.querySelector(".zm-menu__check");
            if (chk) chk.textContent = i2 >= 0 ? "" : "\u2713";
          }
        }))
      );
    } else {
      travelTimeItems.push({
        label: "(No travel presets configured)",
        action: () => new import_obsidian21.Notice("Configure presets in settings \u2192 travel rules.", 3e3)
      });
    }
    return [
      {
        label: this.measuring ? "Stop measuring" : "Start measuring",
        action: () => {
          this.measuring = !this.measuring;
          if (!this.measuring) this.measurePreview = null;
          this.updateMeasureHud();
          this.renderMeasure();
          this.closeMenu();
        }
      },
      {
        label: "Clear measurement",
        action: () => this.clearMeasure()
      },
      {
        label: "Remove last point",
        action: () => {
          if (this.measurePts.length > 0) {
            this.measurePts.pop();
            if (this.measureSegTerrainIds.length > 0) this.measureSegTerrainIds.pop();
            this.renderMeasure();
          }
        }
      },
      ...this.plugin.settings.enableMeasurePro ? [
        {
          label: "Terrains\u2026",
          action: () => {
            this.openMeasureTerrainModal();
            this.closeMenu();
          }
        }
      ] : [],
      ...this.plugin.settings.enableDrawing ? [
        {
          label: "Save measurement as polyline\u2026",
          action: () => {
            this.saveMeasurementAsPolyline();
            this.closeMenu();
          }
        }
      ] : [],
      { type: "separator" },
      { label: "Unit", children: unitItems },
      { label: "Travel time", children: travelTimeItems },
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
            new import_obsidian21.Notice("Calibration: click two points.", 1500);
          }
          this.closeMenu();
        }
      }
    ];
  }
  openMeasureOnlyContextMenu(clientX, clientY) {
    this.closeMenu();
    this.openMenu = new ZMMenu(this.el.ownerDocument);
    this.openMenu.open(clientX, clientY, this.buildMeasureMenuItems());
    const doc = this.getOwnerDocument();
    const outside = (event) => {
      if (!this.openMenu) return;
      const t = event.target;
      if (t instanceof HTMLElement && this.openMenu.contains(t)) return;
      this.closeMenu();
    };
    const keyClose = (event) => {
      if (event.key === "Escape") this.closeMenu();
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
  onContextMenuViewport(e) {
    var _a2, _b2, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o;
    if (!this.ready || !this.data) return;
    this.closeMenu();
    if (this.cfg.displayOnly) return;
    if (this.measuring || this.calibrating) {
      e.preventDefault();
      e.stopPropagation();
      this.openMeasureOnlyContextMenu(e.clientX, e.clientY);
      return;
    }
    if (this.gridAlignId) {
      this.stopGridAlignMode(false);
      return;
    }
    if (((_a2 = this.plugin.settings.panMouseButton) != null ? _a2 : "left") === "right" && this.suppressContextMenuOnce) {
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
    const baseItems = bases.map((b) => {
      var _a3;
      return {
        label: (_a3 = b.name) != null ? _a3 : basename(b.path),
        checked: this.getActiveBasePath() === b.path,
        action: (rowEl) => {
          void this.setActiveBase(b.path).then(() => {
            const submenu = rowEl.parentElement;
            const rows = submenu == null ? void 0 : submenu.querySelectorAll(".zm-menu__item");
            rows == null ? void 0 : rows.forEach((r) => {
              const c = r.querySelector(".zm-menu__check");
              if (c) c.textContent = "";
            });
            const chk = rowEl.querySelector(".zm-menu__check");
            if (chk) chk.textContent = "\u2713";
          }).catch((err2) => {
            console.error("Set base failed:", err2);
            new import_obsidian21.Notice("Failed to set base image.", 2500);
          });
        }
      };
    });
    const overlayItems = ((_b2 = this.data.overlays) != null ? _b2 : []).map((o) => {
      var _a3;
      return {
        label: (_a3 = o.name) != null ? _a3 : basename(o.path),
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
    const meas = this.data.measurement;
    const currentUnit = (_c = meas == null ? void 0 : meas.displayUnit) != null ? _c : "km";
    const currentCustomId = meas == null ? void 0 : meas.customUnitId;
    const unitItems = [
      {
        label: "m",
        checked: currentUnit === "m",
        action: () => {
          var _a3;
          this.ensureMeasurement();
          if ((_a3 = this.data) == null ? void 0 : _a3.measurement) {
            this.data.measurement.displayUnit = "m";
            delete this.data.measurement.customUnitId;
            void this.saveDataSoon();
            this.updateMeasureHud();
          }
          this.closeMenu();
        }
      },
      {
        label: "km",
        checked: currentUnit === "km",
        action: () => {
          var _a3;
          this.ensureMeasurement();
          if ((_a3 = this.data) == null ? void 0 : _a3.measurement) {
            this.data.measurement.displayUnit = "km";
            delete this.data.measurement.customUnitId;
            void this.saveDataSoon();
            this.updateMeasureHud();
          }
          this.closeMenu();
        }
      },
      {
        label: "mi",
        checked: currentUnit === "mi",
        action: () => {
          var _a3;
          this.ensureMeasurement();
          if ((_a3 = this.data) == null ? void 0 : _a3.measurement) {
            this.data.measurement.displayUnit = "mi";
            delete this.data.measurement.customUnitId;
            void this.saveDataSoon();
            this.updateMeasureHud();
          }
          this.closeMenu();
        }
      },
      {
        label: "ft",
        checked: currentUnit === "ft",
        action: () => {
          var _a3;
          this.ensureMeasurement();
          if ((_a3 = this.data) == null ? void 0 : _a3.measurement) {
            this.data.measurement.displayUnit = "ft";
            delete this.data.measurement.customUnitId;
            void this.saveDataSoon();
            this.updateMeasureHud();
          }
          this.closeMenu();
        }
      }
    ];
    const customDefs = this.plugin.getActiveCustomUnits();
    if (customDefs.length > 0) {
      unitItems.push({ type: "separator" });
      for (const def of customDefs) {
        const isActive = currentUnit === "custom" && currentCustomId === def.id;
        unitItems.push({
          label: def.abbreviation ? `${def.name} (${def.abbreviation})` : def.name,
          checked: isActive,
          action: () => {
            var _a3;
            this.ensureMeasurement();
            if ((_a3 = this.data) == null ? void 0 : _a3.measurement) {
              this.data.measurement.displayUnit = "custom";
              this.data.measurement.customUnitId = def.id;
              void this.saveDataSoon();
              this.updateMeasureHud();
            }
            this.closeMenu();
          }
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
      pingGlobal
    } = this.computeCollectionSets();
    const pinItemFromKey = (key) => {
      const info = this.getIconInfo(key);
      if (!info) return null;
      return {
        label: key || "(pin)",
        iconUrl: info.imgUrl,
        iconRotationDeg: info.rotationDeg,
        action: () => {
          this.placePinAt(key, nx, ny);
          this.closeMenu();
        }
      };
    };
    const pinsBaseMenu = pinsBase.map(pinItemFromKey).filter((x2) => !!x2);
    const pinsGlobalMenu = pinsGlobal.map(pinItemFromKey).filter((x2) => !!x2);
    const favItems = (arr) => arr.map((p) => {
      const icon = this.getIconInfo(p.iconKey);
      return {
        label: p.name || "(favorite)",
        iconUrl: icon.imgUrl,
        iconRotationDeg: icon.rotationDeg,
        action: () => {
          this.placePresetAt(p, nx, ny);
          this.closeMenu();
        }
      };
    });
    const favsBaseMenu = favItems(favsBase);
    const favsGlobalMenu = favItems(favsGlobal);
    const stickerItems = (arr) => arr.map((sp) => ({
      label: sp.name || "(sticker)",
      iconUrl: this.resolveResourceUrl(sp.imagePath),
      action: () => {
        this.placeStickerPresetAt(sp, nx, ny);
        this.closeMenu();
      }
    }));
    const stickersBaseMenu = stickerItems(stickersBase);
    const stickersGlobalMenu = stickerItems(stickersGlobal);
    const allSwapPresets = [...swapBase, ...swapGlobal];
    const addHereChildren = [
      {
        label: "Default (open editor)",
        action: () => {
          this.addMarkerInteractive(nx, ny);
          this.closeMenu();
        }
      }
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
    const items = [];
    if (favsGlobalMenu.length) {
      addHereChildren.push({ type: "separator" });
      addHereChildren.push({ label: "Favorites (global)", children: favsGlobalMenu });
    }
    if (stickersBaseMenu.length) {
      addHereChildren.push({ type: "separator" });
      addHereChildren.push({
        label: "Stickers (base)",
        children: stickersBaseMenu
      });
    }
    if (stickersGlobalMenu.length) {
      addHereChildren.push({
        label: "Stickers (global)",
        children: stickersGlobalMenu
      });
    }
    addHereChildren.push(
      { type: "separator" },
      {
        label: "Add HUD pin here",
        action: () => {
          this.addHudPin(vx, vy);
          this.closeMenu();
        }
      }
    );
    addHereChildren.push({
      label: "Add base switch pin here\u2026",
      action: () => {
        if (!this.data) return;
        const bases2 = this.getBasesNormalized();
        if (!bases2.length) {
          new import_obsidian21.Notice("No base images configured.", 2500);
          return;
        }
        const iconKey = this.plugin.settings.defaultIconKey;
        const initialScaleLike = this.plugin.settings.defaultScaleLikeSticker ? true : false;
        this.openSwitchPinModal(
          {
            basePaths: bases2,
            initialIconKey: iconKey,
            initialRotate: true,
            initialSwitchBase: void 0,
            initialScaleLikeSticker: initialScaleLike,
            initialHud: false
          },
          (res) => {
            var _a3;
            if (!this.data) return;
            if (res.action !== "save" || !res.value) return;
            const marker = {
              id: generateId("swb"),
              type: "switch",
              layer: this.getPreferredNewMarkerLayerId(),
              x: nx,
              y: ny,
              iconKey: res.value.iconKey,
              switchRotate: res.value.rotate ? true : void 0,
              switchBase: res.value.rotate ? void 0 : (_a3 = res.value.switchBase) != null ? _a3 : void 0,
              scaleLikeSticker: res.value.scaleLikeSticker ? true : void 0
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
            new import_obsidian21.Notice("Switch pin added.", 900);
          }
        );
        this.closeMenu();
      }
    });
    {
      const allPings = [...pingBase, ...pingGlobal].filter(Boolean);
      const buildDistanceItems = (pp) => {
        const vals = Array.isArray(pp.distances) && pp.distances.length ? pp.distances : [2, 5, 10];
        return vals.filter((n) => Number.isFinite(n) && n > 0).map((n) => ({
          label: this.formatPingDistanceLabel(n, pp.unit, pp.customUnitId),
          action: () => {
            void this.addPingPinAt(pp, nx, ny, n);
            this.closeMenu();
          }
        }));
      };
      if (allPings.length === 1) {
        addHereChildren.push(
          { type: "separator" },
          {
            label: `Party pin (${allPings[0].name || "Party"})`,
            children: buildDistanceItems(allPings[0])
          }
        );
      } else if (allPings.length > 1) {
        addHereChildren.push(
          { type: "separator" },
          {
            label: "Party pin",
            children: allPings.map((pp) => ({
              label: pp.name || "(party)",
              children: buildDistanceItems(pp)
            }))
          }
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
        }
      });
    } else if (allSwapPresets.length > 1) {
      addHereChildren.push({
        label: "Add swap pin here",
        children: allSwapPresets.map((sp) => ({
          label: sp.name || "(swap pin)",
          action: () => {
            this.addSwapPinHere(sp, vx, vy);
            this.closeMenu();
          }
        }))
      });
    }
    addHereChildren.push(
      { type: "separator" },
      {
        label: "Add dice pin here\u2026",
        action: () => {
          this.addDicePinHere(nx, ny, vx, vy);
          this.closeMenu();
        }
      }
    );
    items.push(
      { label: "Add marker here", children: addHereChildren }
    );
    if (favsBaseMenu.length) {
      items.push({ label: "Favorites (base)", children: favsBaseMenu });
    }
    const layerChildren = this.data.layers.map((layer) => {
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
    const labelForBase = (p) => {
      var _a3;
      const b = bases.find((bb) => bb.path === p);
      return b ? (_a3 = b.name) != null ? _a3 : basename(b.path) : basename(p);
    };
    const bindLayerSubmenus = this.data.layers.map((l) => {
      const suffix = l.boundBase ? ` \u2192 ${labelForBase(l.boundBase)}` : " \u2192 None";
      return {
        label: `Bind "${l.name}" to base${suffix}`,
        children: [
          {
            label: "None",
            checked: !l.boundBase,
            action: (rowEl) => {
              l.boundBase = void 0;
              void this.saveDataSoon();
              const menu = rowEl.parentElement;
              menu == null ? void 0 : menu.querySelectorAll(".zm-menu__check").forEach((c) => c.textContent = "");
              const chk = rowEl.querySelector(".zm-menu__check");
              if (chk) chk.textContent = "\u2713";
            }
          },
          { type: "separator" },
          ...bases.map((b) => {
            var _a3;
            return {
              label: (_a3 = b.name) != null ? _a3 : basename(b.path),
              checked: l.boundBase === b.path,
              action: (rowEl) => {
                l.boundBase = b.path;
                void this.applyBoundBaseVisibility();
                void this.saveDataSoon();
                const menu = rowEl.parentElement;
                menu == null ? void 0 : menu.querySelectorAll(".zm-menu__check").forEach((c) => c.textContent = "");
                const chk = rowEl.querySelector(".zm-menu__check");
                if (chk) chk.textContent = "\u2713";
              }
            };
          })
        ]
      };
    });
    const drawLayers = (_d = this.data.drawLayers) != null ? _d : [];
    const drawLayerChildren = drawLayers.map((dl) => ({
      label: dl.name,
      checked: !!dl.visible,
      action: (rowEl) => {
        dl.visible = !dl.visible;
        void this.saveDataSoon();
        this.renderDrawings();
        const chk = rowEl.querySelector(".zm-menu__check");
        if (chk) chk.textContent = dl.visible ? "\u2713" : "";
      }
    }));
    const bindDrawLayerSubmenus = drawLayers.map((dl) => {
      const suffix = dl.boundBase ? ` \u2192 ${labelForBase(dl.boundBase)}` : " \u2192 None";
      return {
        label: `Bind "${dl.name}" to base${suffix}`,
        children: [
          {
            label: "None",
            checked: !dl.boundBase,
            action: (rowEl) => {
              dl.boundBase = void 0;
              void this.saveDataSoon();
              const menu = rowEl.parentElement;
              menu == null ? void 0 : menu.querySelectorAll(".zm-menu__check").forEach((c) => c.textContent = "");
              rowEl.querySelector(".zm-menu__check").textContent = "\u2713";
            }
          },
          { type: "separator" },
          ...bases.map((b) => {
            var _a3;
            return {
              label: (_a3 = b.name) != null ? _a3 : basename(b.path),
              checked: dl.boundBase === b.path,
              action: (rowEl) => {
                dl.boundBase = b.path;
                void this.applyBoundBaseVisibility();
                void this.saveDataSoon();
                const menu = rowEl.parentElement;
                menu == null ? void 0 : menu.querySelectorAll(".zm-menu__check").forEach((c) => c.textContent = "");
                rowEl.querySelector(".zm-menu__check").textContent = "\u2713";
              }
            };
          })
        ]
      };
    });
    if (this.plugin.settings.enableDrawing) {
      drawLayerChildren.push(
        { type: "separator" },
        { label: "Bind draw layer to base", children: bindDrawLayerSubmenus },
        { type: "separator" },
        {
          label: "Rename draw layer\u2026",
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
                }
              ).open();
            }
          }))
        },
        {
          label: "Delete draw layer\u2026",
          children: drawLayers.map((dl) => ({
            label: dl.name,
            action: () => {
              var _a3;
              if (!this.data) return;
              const count = ((_a3 = this.data.drawings) != null ? _a3 : []).filter(
                (d) => d.layerId === dl.id
              ).length;
              const msg = count > 0 ? `Delete draw layer "${dl.name}" and ${count} drawings on it?` : `Delete draw layer "${dl.name}"?`;
              new ConfirmModal(this.app, "Delete draw layer", msg, () => {
                var _a4, _b3, _c2, _d2;
                if (!this.data) return;
                this.pushDeleteUndo(
                  {
                    kind: "draw-layer",
                    layer: cloneForUndo(dl),
                    index: ((_a4 = this.data.drawLayers) != null ? _a4 : []).findIndex((l) => l.id === dl.id),
                    drawings: ((_b3 = this.data.drawings) != null ? _b3 : []).map((drawing, index) => ({ drawing, index })).filter((x2) => x2.drawing.layerId === dl.id).map((x2) => ({
                      drawing: cloneForUndo(x2.drawing),
                      index: x2.index
                    }))
                  },
                  `Delete draw layer: ${dl.name}`
                );
                this.data.drawLayers = ((_c2 = this.data.drawLayers) != null ? _c2 : []).filter(
                  (l) => l.id !== dl.id
                );
                this.data.drawings = ((_d2 = this.data.drawings) != null ? _d2 : []).filter(
                  (d) => d.layerId !== dl.id
                );
                void this.saveDataSoon();
                this.renderDrawings();
              }).open();
            }
          }))
        },
        {
          label: "Add draw layer\u2026",
          action: () => {
            if (!this.data) return;
            const baseName = "Draw layer";
            new NamePromptModal(
              this.app,
              "Name for draw layer",
              baseName,
              (value) => {
                var _a3, _b3;
                if (!this.data) return;
                const name = (value || baseName).trim() || baseName;
                const id = generateId("draw");
                (_b3 = (_a3 = this.data).drawLayers) != null ? _b3 : _a3.drawLayers = [];
                this.data.drawLayers.push({
                  id,
                  name,
                  visible: true,
                  locked: false
                });
                void this.saveDataSoon();
                this.renderDrawings();
              }
            ).open();
          }
        }
      );
    }
    const imageLayersChildren = [
      { label: "Base", children: baseItems },
      { label: "Overlays", children: overlayItems }
    ];
    if (this.isActiveBaseSvg()) {
      imageLayersChildren.push(
        { type: "separator" },
        {
          label: "Export active SVG base as WebP\u2026",
          action: () => {
            this.closeMenu();
            this.openSvgExportModal();
          }
        }
      );
    }
    imageLayersChildren.push(
      { type: "separator" },
      {
        label: "Delete base\u2026",
        children: bases.map((b) => {
          var _a3;
          return {
            label: (_a3 = b.name) != null ? _a3 : basename(b.path),
            action: () => {
              this.closeMenu();
              this.confirmDeleteBase(b.path);
            }
          };
        })
      },
      {
        label: "Delete overlay\u2026",
        children: ((_e = this.data.overlays) != null ? _e : []).length > 0 ? ((_f = this.data.overlays) != null ? _f : []).map((o) => {
          var _a3;
          return {
            label: (_a3 = o.name) != null ? _a3 : basename(o.path),
            action: () => {
              this.closeMenu();
              this.confirmDeleteOverlay(o.path);
            }
          };
        }) : [
          {
            label: "(No overlays)",
            action: () => {
              this.closeMenu();
            }
          }
        ]
      },
      { type: "separator" },
      {
        label: "Add layer",
        children: [
          { label: "Base\u2026", action: () => this.promptAddLayer("base") },
          { label: "Overlay\u2026", action: () => this.promptAddLayer("overlay") }
        ]
      }
    );
    const measureMenuItems = this.buildMeasureMenuItems();
    items.push(
      { type: "separator" },
      { label: "Image layers", children: imageLayersChildren },
      {
        label: "Measure",
        children: measureMenuItems
      },
      {
        label: "Marker layers",
        children: [
          ...layerChildren,
          { type: "separator" },
          { label: "Bind layer to base", children: bindLayerSubmenus },
          { type: "separator" },
          {
            label: "Rename layer\u2026",
            children: this.data.layers.map((l) => ({
              label: l.name,
              action: () => {
                new RenameLayerModal(this.app, l, (newName) => {
                  void this.renameMarkerLayer(l, newName);
                }).open();
              }
            }))
          },
          {
            label: "Delete layer\u2026",
            children: this.data.layers.map((l) => ({
              label: l.name,
              action: () => {
                const others = this.data.layers.filter((x2) => x2.id !== l.id);
                if (others.length === 0) {
                  new import_obsidian21.Notice("Cannot delete the last layer.", 2e3);
                  return;
                }
                const hasMarkers = this.data.markers.some(
                  (m) => m.layer === l.id
                );
                new DeleteLayerModal(
                  this.app,
                  l,
                  others,
                  hasMarkers,
                  (decision) => {
                    void this.deleteMarkerLayer(l, decision);
                  }
                ).open();
              }
            }))
          }
        ]
      }
    );
    if (this.plugin.settings.enableTextLayers && this.data) {
      this.ensureTextData();
      const stopTextInteractionForLayer = (layerId) => {
        if (this.textMode === "edit" && this.activeTextLayerId === layerId) {
          this.stopTextEdit(false);
        }
        if (this.textMode === "move" && this.activeTextLayerId === layerId) {
          this.finishTextBoxMove(false);
          this.textMode = null;
          this.activeTextLayerId = null;
          this.activeTextBoxId = null;
        }
        if ((this.textMode === "draw-lines" || this.textMode === "draw-box") && this.activeTextLayerId === layerId) {
          this.textMode = null;
          this.activeTextLayerId = null;
          this.activeTextBoxId = null;
          this.textLineStart = null;
          this.textLinePreview = null;
          this.renderTextDraft();
        }
      };
      const textLayerItems = ((_g = this.data.textLayers) != null ? _g : []).map((tl) => {
        var _a3;
        const boxChildren = ((_a3 = tl.boxes) != null ? _a3 : []).map((box) => {
          const boxLocked = this.isTextBoxLocked(box, tl);
          return {
            label: box.name || "(text box)",
            children: [
              {
                label: "Edit box\u2026",
                action: () => {
                  this.closeMenu();
                  this.openTextBoxConfigModal(tl, box);
                }
              },
              {
                label: "Move",
                checked: this.textMode === "move" && this.activeTextLayerId === tl.id && this.activeTextBoxId === box.id,
                action: (rowEl) => {
                  if (boxLocked) {
                    new import_obsidian21.Notice("Text box is locked.", 1500);
                    return;
                  }
                  const isOn = this.textMode === "move" && this.activeTextLayerId === tl.id && this.activeTextBoxId === box.id;
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
                    new import_obsidian21.Notice("Move mode: drag the text box to move it. Toggle move again to stop.", 4e3);
                  }
                  this.renderTextDraft();
                  this.renderTextLayers();
                  const chk = rowEl.querySelector(".zm-menu__check");
                  if (chk) chk.textContent = isOn ? "" : "\u2713";
                }
              },
              {
                label: "Delete box",
                action: () => {
                  var _a4, _b3;
                  this.pushDeleteUndo(
                    {
                      kind: "text-box",
                      layerId: tl.id,
                      box: cloneForUndo(box),
                      index: ((_a4 = tl.boxes) != null ? _a4 : []).findIndex((b) => b.id === box.id)
                    },
                    `Delete text box: ${box.name || "Text box"}`
                  );
                  tl.boxes = ((_b3 = tl.boxes) != null ? _b3 : []).filter((b) => b.id !== box.id);
                  if (this.textMode === "edit" && this.activeTextLayerId === tl.id && this.activeTextBoxId === box.id) {
                    this.stopTextEdit(false);
                  }
                  if (this.textMode === "move" && this.activeTextLayerId === tl.id && this.activeTextBoxId === box.id) {
                    this.finishTextBoxMove(false);
                    this.textMode = null;
                    this.activeTextLayerId = null;
                    this.activeTextBoxId = null;
                  }
                  void this.saveDataSoon();
                  this.renderTextLayers();
                  this.closeMenu();
                }
              }
            ]
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
                    const chk = rowEl.querySelector(".zm-menu__check");
                    if (chk) chk.textContent = tl.visible ? "\u2713" : "";
                  }
                },
                {
                  label: "Locked",
                  checked: !!tl.locked,
                  action: (rowEl) => {
                    tl.locked = !tl.locked;
                    if (tl.locked) stopTextInteractionForLayer(tl.id);
                    void this.saveDataSoon();
                    this.renderTextLayers();
                    const chk = rowEl.querySelector(".zm-menu__check");
                    if (chk) chk.textContent = tl.locked ? "\u2713" : "";
                  }
                }
              ]
            },
            {
              label: "Add text box",
              children: [
                {
                  label: "Custom",
                  action: () => {
                    this.startDrawNewTextBox(tl.id, "custom");
                    this.closeMenu();
                  }
                },
                {
                  label: "Auto",
                  action: () => {
                    this.startDrawNewTextBox(tl.id, "auto");
                    this.closeMenu();
                  }
                }
              ]
            },
            {
              label: `Bind to base${tl.boundBase ? ` \u2192 ${labelForBase(tl.boundBase)}` : " \u2192 None"}`,
              children: [
                {
                  label: "None",
                  checked: !tl.boundBase,
                  action: (rowEl) => {
                    tl.boundBase = void 0;
                    void this.saveDataSoon();
                    this.renderTextLayers();
                    const menu = rowEl.parentElement;
                    menu == null ? void 0 : menu.querySelectorAll(".zm-menu__check").forEach((c) => {
                      c.textContent = "";
                    });
                    const chk = rowEl.querySelector(".zm-menu__check");
                    if (chk) chk.textContent = "\u2713";
                  }
                },
                { type: "separator" },
                ...bases.map((b) => {
                  var _a4;
                  return {
                    label: (_a4 = b.name) != null ? _a4 : basename(b.path),
                    checked: tl.boundBase === b.path,
                    action: (rowEl) => {
                      tl.boundBase = b.path;
                      void this.saveDataSoon();
                      this.renderTextLayers();
                      const menu = rowEl.parentElement;
                      menu == null ? void 0 : menu.querySelectorAll(".zm-menu__check").forEach((c) => {
                        c.textContent = "";
                      });
                      const chk = rowEl.querySelector(".zm-menu__check");
                      if (chk) chk.textContent = "\u2713";
                    }
                  };
                })
              ]
            },
            ...boxChildren.length ? [{ type: "separator" }, ...boxChildren] : []
          ]
        };
      });
      const deleteChildren = ((_h = this.data.textLayers) != null ? _h : []).length > 0 ? ((_i = this.data.textLayers) != null ? _i : []).map((tl) => ({
        label: tl.name || "(text layer)",
        action: () => {
          new ConfirmModal(
            this.app,
            "Delete text layer",
            `Delete text layer "${tl.name || tl.id}"? This cannot be undone.`,
            () => {
              var _a3, _b3;
              if (!this.data) return;
              this.pushDeleteUndo(
                {
                  kind: "text-layer",
                  layer: cloneForUndo(tl),
                  index: ((_a3 = this.data.textLayers) != null ? _a3 : []).findIndex((x2) => x2.id === tl.id)
                },
                `Delete text layer: ${tl.name || tl.id}`
              );
              if (this.textMode === "edit" && this.activeTextLayerId === tl.id) {
                this.stopTextEdit(false);
              }
              if (this.textMode === "move" && this.activeTextLayerId === tl.id) {
                this.finishTextBoxMove(false);
                this.textMode = null;
                this.activeTextLayerId = null;
                this.activeTextBoxId = null;
              }
              this.data.textLayers = ((_b3 = this.data.textLayers) != null ? _b3 : []).filter((x2) => x2.id !== tl.id);
              void this.saveDataSoon();
              this.renderTextLayers();
            }
          ).open();
          this.closeMenu();
        }
      })) : [{ label: "(No text layers)", action: () => this.closeMenu() }];
      items.push(
        { type: "separator" },
        {
          label: "Text layers",
          children: [
            ...textLayerItems,
            { type: "separator" },
            {
              label: "Add text layer\u2026",
              action: () => {
                var _a3, _b3;
                if (!this.data) return;
                const idx = ((_b3 = (_a3 = this.data.textLayers) == null ? void 0 : _a3.length) != null ? _b3 : 0) + 1;
                const defaultName = `Text layer ${idx}`;
                new NamePromptModal(
                  this.app,
                  "Name for text layer",
                  defaultName,
                  (value) => {
                    var _a4, _b4;
                    if (!this.data) return;
                    const name = (value || defaultName).trim() || defaultName;
                    (_b4 = (_a4 = this.data).textLayers) != null ? _b4 : _a4.textLayers = [];
                    this.data.textLayers.push({
                      id: generateId("txt"),
                      name,
                      visible: true,
                      boxes: []
                    });
                    void this.saveDataSoon();
                    this.renderTextLayers();
                  }
                ).open();
                this.closeMenu();
              }
            },
            {
              label: "Delete layer\u2026",
              children: deleteChildren
            }
          ]
        }
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
              children: drawLayerChildren
            },
            { type: "separator" },
            {
              label: "Rectangle",
              action: () => {
                this.startDraw("rect");
                this.closeMenu();
              }
            },
            {
              label: "Circle",
              action: () => {
                this.startDraw("circle");
                this.closeMenu();
              }
            },
            {
              label: "Polyline",
              action: () => {
                this.startDraw("polyline");
                this.closeMenu();
              }
            },
            {
              label: "Polygon",
              action: () => {
                this.startDraw("polygon");
                this.closeMenu();
              }
            }
          ]
        }
      );
    }
    items.push(
      { type: "separator" },
      {
        label: "Options",
        children: [
          {
            label: "Pin sizes for this map\u2026",
            action: () => {
              this.openPinSizeEditor();
              this.closeMenu();
            }
          },
          {
            label: "Allow panning beyond image",
            checked: !((_k = (_j = this.data) == null ? void 0 : _j.panClamp) != null ? _k : true),
            action: async (rowEl) => {
              var _a3;
              if (!this.data) return;
              const current = (_a3 = this.data.panClamp) != null ? _a3 : true;
              this.data.panClamp = !current;
              await this.saveDataSoon();
              this.applyTransform(this.scale, this.tx, this.ty);
              const chk = rowEl.querySelector(".zm-menu__check");
              if (chk) chk.textContent = this.data.panClamp ? "" : "\u2713";
            }
          },
          {
            label: "Edit view\u2026",
            action: () => {
              this.closeMenu();
              this.openViewEditorFromMap();
            }
          },
          {
            label: "Set default view here",
            action: () => {
              void this.saveDefaultViewToYaml();
              this.closeMenu();
            }
          },
          {
            label: "Delete default view",
            action: () => {
              void this.deleteDefaultViewFromYaml();
              this.closeMenu();
            }
          },
          {
            label: "Export map package\u2026",
            action: () => {
              this.closeMenu();
              this.plugin.openExportMapBundleModal(this);
            }
          },
          ...this.secondScreenFeatureEnabled() ? [
            {
              label: "Player screen layers\u2026",
              action: () => {
                this.closeMenu();
                this.openSecondScreenLayersModal();
              }
            }
          ] : []
        ]
      }
    );
    if (this.plugin.settings.enableGrid) {
      const grids = (_l = this.data.grids) != null ? _l : [];
      const gridItems = [
        {
          label: "Add grid\u2026",
          action: () => {
            this.closeMenu();
            this.addGridInteractive();
          }
        }
      ];
      if (grids.length > 0) {
        gridItems.push({ type: "separator" });
        for (const g of grids) {
          gridItems.push({
            label: `${g.name || "Grid"}${g.boundBase ? ` \u2192 ${labelForBase(g.boundBase)}` : ""}`,
            children: [
              {
                label: "Visible",
                checked: !!g.visible,
                action: (rowEl) => {
                  g.visible = !g.visible;
                  void this.saveDataSoon();
                  this.renderGrids();
                  const chk = rowEl.querySelector(".zm-menu__check");
                  if (chk) chk.textContent = g.visible ? "\u2713" : "";
                }
              },
              {
                label: "Edit grid\u2026",
                action: () => {
                  this.closeMenu();
                  this.openGridEditor(g);
                }
              },
              {
                label: "Align offset live\u2026",
                action: () => {
                  this.closeMenu();
                  this.startGridAlignMode(g.id);
                }
              },
              {
                label: "Bind to base",
                children: [
                  {
                    label: "None",
                    checked: !g.boundBase,
                    action: (rowEl) => {
                      g.boundBase = void 0;
                      void this.saveDataSoon();
                      this.renderGrids();
                      const menu = rowEl.parentElement;
                      menu == null ? void 0 : menu.querySelectorAll(".zm-menu__check").forEach((c) => c.textContent = "");
                      const chk = rowEl.querySelector(".zm-menu__check");
                      if (chk) chk.textContent = "\u2713";
                    }
                  },
                  { type: "separator" },
                  ...bases.map((b) => {
                    var _a3;
                    return {
                      label: (_a3 = b.name) != null ? _a3 : basename(b.path),
                      checked: g.boundBase === b.path,
                      action: (rowEl) => {
                        g.boundBase = b.path;
                        void this.saveDataSoon();
                        this.renderGrids();
                        const menu = rowEl.parentElement;
                        menu == null ? void 0 : menu.querySelectorAll(".zm-menu__check").forEach((c) => c.textContent = "");
                        const chk = rowEl.querySelector(".zm-menu__check");
                        if (chk) chk.textContent = "\u2713";
                      }
                    };
                  })
                ]
              },
              {
                label: "Delete grid",
                action: () => {
                  var _a3, _b3, _c2;
                  this.pushDeleteUndo(
                    {
                      kind: "grid",
                      grid: cloneForUndo(g),
                      index: ((_b3 = (_a3 = this.data) == null ? void 0 : _a3.grids) != null ? _b3 : []).findIndex((x2) => x2.id === g.id)
                    },
                    `Delete grid: ${g.name || "Grid"}`
                  );
                  if (!this.data) return;
                  this.data.grids = ((_c2 = this.data.grids) != null ? _c2 : []).filter((x2) => x2.id !== g.id);
                  if (this.gridAlignId === g.id) this.stopGridAlignMode(false);
                  void this.saveDataSoon();
                  this.renderGrids();
                  this.closeMenu();
                }
              }
            ]
          });
        }
      }
      items.push({ type: "separator" }, { label: "Grid", children: gridItems });
    }
    if (this.secondScreenFeatureEnabled()) {
      items.push(
        { type: "separator" },
        {
          label: "Display on screen",
          children: [
            {
              label: "Normal",
              action: () => {
                this.closeMenu();
                void this.sendToSecondScreen(false);
              }
            },
            {
              label: "Fog of war",
              action: () => {
                this.closeMenu();
                void this.sendToSecondScreen(true);
              }
            }
          ]
        }
      );
    }
    if (!this.cfg.responsive) {
      items.push(
        { type: "separator" },
        { label: "Zoom +", action: () => this.zoomAt(vx, vy, 1.2) },
        { label: "Zoom \u2212", action: () => this.zoomAt(vx, vy, 1 / 1.2) },
        { label: "Fit to window", action: () => this.fitToView() },
        {
          label: "Reset view",
          action: () => this.applyTransform(
            1,
            (this.vw - this.imgW) / 2,
            (this.vh - this.imgH) / 2
          )
        }
      );
    }
    {
      const ptsCount = this.measurePts.length + (this.measuring && this.measurePreview ? 1 : 0);
      if (ptsCount >= 2) {
        const unit = (_o = (_n = (_m = this.data) == null ? void 0 : _m.measurement) == null ? void 0 : _n.displayUnit) != null ? _o : "auto-metric";
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
    const undoLabel = this.getLatestDeleteUndoLabel();
    if (undoLabel) {
      items.push({ type: "separator" });
      items.push({
        label: `Undo delete: ${undoLabel}`,
        action: () => {
          this.closeMenu();
          void this.undoLastDelete();
        }
      });
    }
    this.openMenu = new ZMMenu(this.el.ownerDocument);
    this.openMenu.open(e.clientX, e.clientY, items);
    const doc = this.el.ownerDocument;
    const outside = (ev) => {
      if (!this.openMenu) return;
      const t = ev.target;
      if (t instanceof Node && this.openMenu.contains(t)) return;
      this.closeMenu();
    };
    const keyClose = (ev) => {
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
  forwardContextMenuPastTextHitbox(ev) {
    var _a2, _b2;
    const doc = this.el.ownerDocument;
    const stack = typeof doc.elementsFromPoint === "function" ? doc.elementsFromPoint(ev.clientX, ev.clientY) : [];
    for (const el of stack) {
      if (el.closest(".zm-text-hitbox")) continue;
      const drawEl = el.closest(".zm-draw__shape");
      if (drawEl instanceof SVGElement) {
        const id = (_b2 = (_a2 = drawEl.dataset.id) != null ? _a2 : drawEl.getAttribute("data-id")) != null ? _b2 : "";
        if (id) {
          const drawing = this.getDrawingById(id);
          if (drawing) {
            this.onDrawingContextMenu(ev, drawing);
            return;
          }
        }
      }
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
            metaKey: ev.metaKey
          })
        );
        return;
      }
      if (el === this.viewportEl || this.viewportEl.contains(el)) {
        this.onContextMenuViewport(ev);
        return;
      }
    }
    this.onContextMenuViewport(ev);
  }
  closeMenu() {
    if (this.openMenu) {
      this.openMenu.destroy();
      this.openMenu = null;
    }
  }
  isActiveBaseSvg() {
    const p = this.getActiveBasePath();
    return typeof p === "string" && p.toLowerCase().endsWith(".svg");
  }
  async getSvgIntrinsicSize(svgPath) {
    var _a2, _b2, _c;
    const af = this.app.vault.getAbstractFileByPath(svgPath);
    if (!(af instanceof import_obsidian21.TFile)) return null;
    try {
      const raw = await this.app.vault.read(af);
      const doc = new DOMParser().parseFromString(raw, "image/svg+xml");
      const el = doc.querySelector("svg");
      if (!el) return null;
      const wAttr = (_a2 = el.getAttribute("width")) != null ? _a2 : "";
      const hAttr = (_b2 = el.getAttribute("height")) != null ? _b2 : "";
      const vbAttr = (_c = el.getAttribute("viewBox")) != null ? _c : "";
      const parseLen = (s) => {
        const m = /^([0-9.+-eE]+)\s*(px)?\s*$/.exec(s.trim());
        if (!m) return Number.NaN;
        return Number(m[1]);
      };
      const w = parseLen(wAttr);
      const h = parseLen(hAttr);
      if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
        return { w, h };
      }
      const vb = vbAttr.trim().split(/[\s,]+/).map((x2) => Number(x2));
      if (vb.length === 4 && vb.every((n) => Number.isFinite(n))) {
        const vw = vb[2];
        const vh = vb[3];
        if (vw > 0 && vh > 0) return { w: vw, h: vh };
      }
    } catch (e) {
    }
    return null;
  }
  async exportActiveSvgBaseToWebp(longEdge, quality, outPath) {
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
    try {
      await img.decode();
    } catch (e) {
    }
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
    const maxSide = 16384;
    if (w > maxSide || h > maxSide) {
      throw new Error(`Target size too large (${w}\xD7${h}). Try 8k.`);
    }
    const canvas = this.getOwnerDocument().createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No canvas context.");
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    const q = Math.min(1, Math.max(0.1, quality));
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => b ? resolve(b) : reject(new Error("toBlob failed")),
        "image/webp",
        q
      );
    });
    const dir = outPath.split("/").slice(0, -1).join("/");
    if (dir && !this.app.vault.getAbstractFileByPath(dir)) {
      await this.app.vault.createFolder(dir);
    }
    let finalPath = (0, import_obsidian21.normalizePath)(outPath);
    const lower = finalPath.toLowerCase();
    const base = lower.endsWith(".webp") ? finalPath.slice(0, -5) : finalPath;
    let i2 = 1;
    while (this.app.vault.getAbstractFileByPath(finalPath)) {
      finalPath = (0, import_obsidian21.normalizePath)(`${base}-${i2}.webp`);
      i2++;
    }
    await this.app.vault.adapter.writeBinary(finalPath, await blob.arrayBuffer());
    return finalPath;
  }
  openSvgExportModal() {
    if (!this.data) return;
    const svgPath = this.getActiveBasePath();
    if (!svgPath.toLowerCase().endsWith(".svg")) return;
    new SvgRasterExportModal(
      this.app,
      {
        svgPath,
        sourcePath: this.cfg.sourcePath,
        defaultLongEdge: 8192,
        defaultQuality: 0.92
      },
      (res) => {
        void this.handleSvgExportResult(res);
      }
    ).open();
  }
  async handleSvgExportResult(res) {
    if (res.action !== "export" || !res.result) return;
    try {
      new import_obsidian21.Notice("Exporting SVG\u2026 (this may take a moment)", 4e3);
      const out = await this.exportActiveSvgBaseToWebp(
        res.result.longEdge,
        res.result.quality,
        res.result.outPath
      );
      await this.addBaseByPath(out, res.result.baseName);
      await this.setActiveBase(out);
      if (res.result.moveMarkersJson) {
        if (this.cfg.storageMode !== "json") {
          new import_obsidian21.Notice("Cannot move markers.json when storage mode is 'note'.", 6e3);
        } else {
          await this.saveDataSoon();
          const newMarkersPath = await this.moveCurrentMarkersFileToBase(out);
          this.cfg.markersPath = newMarkersPath;
          this.store = new MarkerStore(this.app, this.cfg.sourcePath, newMarkersPath);
          const ok = await this.upsertYamlMarkersPath(newMarkersPath);
          if (!ok) {
            new import_obsidian21.Notice("Exported and moved markers.json, but YAML could not be updated.", 6e3);
          } else {
            new import_obsidian21.Notice(
              "Markers.json moved to the exported base. Important: other maps using the old markers.json must be updated manually.",
              9e3
            );
          }
        }
      }
      new import_obsidian21.Notice(`Exported: ${out}`, 3e3);
    } catch (e) {
      console.error(e);
      new import_obsidian21.Notice(`SVG export failed: ${e instanceof Error ? e.message : String(e)}`, 6e3);
    }
  }
  triStateIndicator(state) {
    if (state === "visible") return { mark: "check" };
    if (state === "locked") return { mark: "x", color: "var(--text-error, #d23c3c)" };
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
  applySecondScreenViewFromData() {
    var _a2, _b2;
    if (!((_b2 = (_a2 = this.data) == null ? void 0 : _a2.secondScreen) == null ? void 0 : _b2.view)) return false;
    const v = this.data.secondScreen.view;
    if (!Number.isFinite(v.scale) || !Number.isFinite(v.tx) || !Number.isFinite(v.ty)) {
      return false;
    }
    this.applyingSecondScreenView = true;
    try {
      this.applyTransform(v.scale, v.tx, v.ty);
    } finally {
      this.applyingSecondScreenView = false;
    }
    return true;
  }
  persistSecondScreenViewSoon(delayMs = 250) {
    if (!this.isSecondScreenControllerView()) return;
    if (!this.ready || !this.data) return;
    if (this.applyingSecondScreenView) return;
    if (this.secondScreenViewSaveTimer !== null) {
      window.clearTimeout(this.secondScreenViewSaveTimer);
    }
    this.secondScreenViewSaveTimer = window.setTimeout(() => {
      var _a2, _b2;
      this.secondScreenViewSaveTimer = null;
      if (!this.data) return;
      (_b2 = (_a2 = this.data).secondScreen) != null ? _b2 : _a2.secondScreen = {};
      this.data.secondScreen.view = {
        activeBase: this.getActiveBasePath(),
        scale: this.scale,
        tx: this.tx,
        ty: this.ty
      };
      void this.saveDataSoon();
    }, delayMs);
  }
  applyTransform(scale, tx, ty, render = true) {
    var _a2, _b2;
    const prevScale = this.scale;
    const s = clamp(scale, this.cfg.minZoom, this.cfg.maxZoom);
    const scaledW = this.imgW * s;
    const scaledH = this.imgH * s;
    const clampPan = (_b2 = (_a2 = this.data) == null ? void 0 : _a2.panClamp) != null ? _b2 : true;
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
    this.worldEl.style.transform = `translate3d(${this.tx}px, ${this.ty}px, 0) scale3d(${this.scale}, ${this.scale}, 1)`;
    if (render) {
      if (prevScale !== s) {
        this.showZoomHud();
        this.updateMarkerInvScaleOnly();
        this.updateMarkerZoomVisibilityOnly();
        this.renderDrawingEditHandles();
        void this.maybeUpgradeSvgBaseForCurrentZoom();
      }
      this.renderMeasure();
      this.renderCalibrate();
      if (this.isCanvas()) this.renderCanvas();
      this.renderDrawingEditHandles();
    }
    this.persistSecondScreenViewSoon();
  }
  panBy(dx, dy) {
    this.applyTransform(this.scale, this.tx + dx, this.ty + dy);
  }
  zoomAt(cx, cy, factor) {
    const sOld = this.scale;
    const sNew = clamp(sOld * factor, this.cfg.minZoom, this.cfg.maxZoom);
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
  updateMarkerInvScaleOnly() {
    const invScale = this.cfg.responsive ? 1 : 1 / this.scale;
    const updateContainer = (root) => {
      if (!root) return;
      const invs = root.querySelectorAll(".zm-marker-inv");
      invs.forEach((el) => {
        el.style.transform = `scale(${invScale})`;
      });
    };
    updateContainer(this.markersEl);
    updateContainer(this.hudMarkersEl);
  }
  updateMarkerZoomVisibilityOnly() {
    const s = this.scale;
    const updateContainer = (root) => {
      if (!root) return;
      const nodes = root.querySelectorAll(".zm-marker");
      nodes.forEach((el) => {
        const minStr = el.dataset.minz;
        const maxStr = el.dataset.maxz;
        const hasMin = typeof minStr === "string" && minStr.length > 0;
        const hasMax = typeof maxStr === "string" && maxStr.length > 0;
        const min = hasMin ? Number.parseFloat(minStr) : void 0;
        const max2 = hasMax ? Number.parseFloat(maxStr) : void 0;
        const visible = (!hasMin || Number.isFinite(min) && s >= min) && (!hasMax || Number.isFinite(max2) && s <= max2);
        if (visible) el.classList.remove("zm-hidden");
        else el.classList.add("zm-hidden");
      });
    };
    updateContainer(this.markersEl);
    updateContainer(this.hudMarkersEl);
  }
  getBasesNormalized() {
    var _a2, _b2, _c;
    const raw = (_b2 = (_a2 = this.data) == null ? void 0 : _a2.bases) != null ? _b2 : [];
    const out = [];
    for (const it of raw) {
      if (typeof it === "string") out.push({ path: it });
      else if (it && typeof it === "object") {
        const obj = it;
        if (typeof obj.path === "string") out.push({ path: obj.path, name: obj.name });
      }
    }
    if (out.length === 0 && ((_c = this.data) == null ? void 0 : _c.image)) out.push({ path: this.data.image });
    return out;
  }
  addMarkerInteractive(nx, ny) {
    if (!this.data) return;
    const layerId = this.getPreferredNewMarkerLayerId();
    const iconKey = this.plugin.settings.defaultIconKey;
    const defaultLink = this.getIconDefaultLink(iconKey);
    const draft = {
      id: generateId("marker"),
      x: nx,
      y: ny,
      layer: layerId,
      link: defaultLink != null ? defaultLink : "",
      iconKey,
      tooltip: "",
      scaleLikeSticker: this.plugin.settings.defaultScaleLikeSticker ? true : void 0
    };
    const modal = new MarkerEditorModal(this.app, this.plugin, this.data, draft, (res) => {
      if (res.action === "save" && res.marker && this.data) {
        this.data.markers.push(res.marker);
        void this.saveDataSoon();
        new import_obsidian21.Notice("Marker added.", 900);
        this.renderMarkersOnly();
        this.schedulePingUpdate();
      }
    });
    modal.open();
  }
  placePinAt(iconKey, nx, ny) {
    if (!this.data) return;
    const layerId = this.getPreferredNewMarkerLayerId();
    const defaultLink = this.getIconDefaultLink(iconKey);
    const draft = {
      id: generateId("marker"),
      x: nx,
      y: ny,
      layer: layerId,
      link: defaultLink != null ? defaultLink : "",
      iconKey,
      tooltip: ""
    };
    const openEditor = !!this.plugin.settings.pinPlaceOpensEditor;
    if (openEditor) {
      const modal = new MarkerEditorModal(this.app, this.plugin, this.data, draft, (res) => {
        if (res.action === "save" && res.marker && this.data) {
          this.data.markers.push(res.marker);
          void this.saveDataSoon();
          this.renderMarkersOnly();
          new import_obsidian21.Notice("Marker added.", 900);
        }
      });
      modal.open();
    } else {
      this.data.markers.push(draft);
      void this.saveDataSoon();
      this.renderMarkersOnly();
      new import_obsidian21.Notice("Marker added.", 900);
      this.schedulePingUpdate();
    }
  }
  addHudPin(hx, hy) {
    if (!this.data) return;
    const layerId = this.getPreferredNewMarkerLayerId();
    const vpRect = this.viewportEl.getBoundingClientRect();
    const iconKey = this.plugin.settings.defaultIconKey;
    const defaultLink = this.getIconDefaultLink(iconKey);
    const draft = {
      id: generateId("marker"),
      x: 0,
      y: 0,
      layer: layerId,
      link: defaultLink != null ? defaultLink : "",
      iconKey,
      tooltip: "",
      anchorSpace: "viewport"
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
            new import_obsidian21.Notice("Hud pin added.", 900);
          }
        }
      );
      modal.open();
    } else {
      this.data.markers.push(draft);
      void this.saveDataSoon();
      this.renderMarkersOnly();
      new import_obsidian21.Notice("Hud pin added.", 900);
    }
  }
  placePresetAt(p, nx, ny, overrideLayerId) {
    var _a2, _b2, _c;
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
    const draft = {
      id: generateId("marker"),
      x: nx,
      y: ny,
      layer: layerId,
      link: (_a2 = p.linkTemplate) != null ? _a2 : "",
      iconKey: (_b2 = p.iconKey) != null ? _b2 : this.plugin.settings.defaultIconKey,
      tooltip: (_c = p.tooltip) != null ? _c : "",
      scaleLikeSticker: this.plugin.settings.defaultScaleLikeSticker ? true : void 0
    };
    if (p.openEditor) {
      const modal = new MarkerEditorModal(this.app, this.plugin, this.data, draft, (res) => {
        if (res.action === "save" && res.marker && this.data) {
          this.data.markers.push(res.marker);
          void this.saveDataSoon();
          this.renderMarkersOnly();
          new import_obsidian21.Notice("Marker added (favorite).", 900);
        }
      });
      modal.open();
    } else {
      this.data.markers.push(draft);
      void this.saveDataSoon();
      this.renderMarkersOnly();
      new import_obsidian21.Notice("Marker added (favorite).", 900);
      this.schedulePingUpdate();
    }
  }
  placeStickerPresetAt(p, nx, ny) {
    var _a2;
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
    const draft = {
      id: generateId("marker"),
      type: "sticker",
      x: nx,
      y: ny,
      layer: layerId,
      stickerPath: p.imagePath,
      stickerSize: Math.max(1, Math.round((_a2 = p.size) != null ? _a2 : 64))
    };
    if (p.openEditor) {
      const modal = new MarkerEditorModal(this.app, this.plugin, this.data, draft, (res) => {
        if (res.action === "save" && res.marker && this.data) {
          this.data.markers.push(res.marker);
          void this.saveDataSoon();
          this.renderMarkersOnly();
          new import_obsidian21.Notice("Sticker added.", 900);
        }
      });
      modal.open();
    } else {
      this.data.markers.push(draft);
      void this.saveDataSoon();
      this.renderMarkersOnly();
      new import_obsidian21.Notice("Sticker added.", 900);
      this.schedulePingUpdate();
    }
  }
  deleteMarker(m) {
    var _a2;
    if (!this.data) return;
    const index = this.data.markers.findIndex((mm) => mm.id === m.id);
    if (index < 0) return;
    this.pushDeleteUndo(
      {
        kind: "marker",
        marker: cloneForUndo(m),
        index
      },
      `Delete ${(_a2 = m.type) != null ? _a2 : "marker"}`
    );
    void this.deletePingNoteIfOwned(m);
    this.data.markers.splice(index, 1);
    void this.saveDataSoon();
    this.renderMarkersOnly();
    new import_obsidian21.Notice("Marker deleted.", 900);
    this.schedulePingUpdate();
  }
  // ===== Ping pins =====
  sanitizeFileName(s) {
    return (s != null ? s : "").replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g, " ").trim();
  }
  findCustomUnitDef(id) {
    var _a2, _b2;
    const packs = (_a2 = this.plugin.settings.travelRulesPacks) != null ? _a2 : [];
    for (const p of packs) {
      const found = ((_b2 = p.customUnits) != null ? _b2 : []).find((u) => u.id === id);
      if (found) return found;
    }
    return void 0;
  }
  pingUnitLabel(unit, customUnitId) {
    if (unit !== "custom") return unit;
    if (!customUnitId) return "u";
    const def = this.findCustomUnitDef(customUnitId);
    return ((def == null ? void 0 : def.abbreviation) || (def == null ? void 0 : def.name) || "u").trim() || "u";
  }
  formatPingDistanceLabel(value, unit, customUnitId) {
    return `${value} ${this.pingUnitLabel(unit, customUnitId)}`;
  }
  getEffectivePxPerCustomUnit(customUnitId) {
    const direct = this.getCustomPxPerUnit(customUnitId);
    if (direct) return direct;
    const def = this.findCustomUnitDef(customUnitId);
    const mpp = this.getMetersPerPixel();
    if (!def || !mpp) return void 0;
    if (!Number.isFinite(def.metersPerUnit) || def.metersPerUnit <= 0) return void 0;
    return def.metersPerUnit / mpp;
  }
  pingToPixels(value, unit, customUnitId) {
    if (!Number.isFinite(value) || value <= 0) return null;
    if (unit === "custom") {
      if (!customUnitId) return null;
      const pxPerUnit = this.getEffectivePxPerCustomUnit(customUnitId);
      if (!pxPerUnit) return null;
      return value * pxPerUnit;
    }
    const mpp = this.getMetersPerPixel();
    if (!mpp) return null;
    const meters = unit === "km" ? value * 1e3 : unit === "mi" ? value * 1609.344 : unit === "ft" ? value * 0.3048 : value;
    return meters / mpp;
  }
  pingDistanceFromPixels(px, unit, customUnitId) {
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
    if (unit === "km") return meters / 1e3;
    if (unit === "mi") return meters / 1609.344;
    if (unit === "ft") return meters / 0.3048;
    return meters;
  }
  // --- Party pin: expand tags to related notes --------------------------------
  normalizeTagForIndex(tag) {
    return (tag != null ? tag : "").trim().replace(/^#/, "").toLowerCase();
  }
  collectTagsForFile(file) {
    var _a2, _b2, _c;
    const out = /* @__PURE__ */ new Map();
    const add = (raw) => {
      const t = (raw != null ? raw : "").trim();
      if (!t) return;
      const withHash = t.startsWith("#") ? t : `#${t}`;
      const norm = this.normalizeTagForIndex(withHash);
      if (!norm) return;
      if (!out.has(norm)) out.set(norm, withHash);
    };
    const cache = this.app.metadataCache.getFileCache(file);
    for (const tc of (_a2 = cache == null ? void 0 : cache.tags) != null ? _a2 : []) add(tc.tag);
    const fm = (_b2 = cache == null ? void 0 : cache.frontmatter) != null ? _b2 : {};
    const fmTags = (_c = fm["tags"]) != null ? _c : fm["tag"];
    if (typeof fmTags === "string") {
      fmTags.split(/[, ]+/).map((s) => s.trim()).filter(Boolean).forEach(add);
    } else if (Array.isArray(fmTags)) {
      for (const x2 of fmTags) if (typeof x2 === "string") add(x2);
    }
    return out;
  }
  fileMatchesPartyFilters(file, preset) {
    var _a2, _b2, _c, _d;
    if (!preset) return true;
    const wantTagNorms = ((_a2 = preset.filterTags) != null ? _a2 : []).map((t) => this.normalizeTagForIndex(t)).filter(Boolean);
    if (wantTagNorms.length) {
      const tags = this.collectTagsForFile(file);
      const hasAny = wantTagNorms.some((t) => tags.has(t));
      if (!hasAny) return false;
    }
    const props = (_b2 = preset.filterProps) != null ? _b2 : {};
    if (props && Object.keys(props).length) {
      const fm = (_d = (_c = this.app.metadataCache.getFileCache(file)) == null ? void 0 : _c.frontmatter) != null ? _d : {};
      const matchScalar = (x2, want) => {
        if (typeof x2 === "string") return x2.trim() === want;
        if (typeof x2 === "number" || typeof x2 === "boolean") return String(x2).trim() === want;
        return false;
      };
      const clauses = Object.entries(props).flatMap(([kRaw, vRaw]) => {
        const key = (kRaw != null ? kRaw : "").trim();
        if (!key) return [];
        const wants = (Array.isArray(vRaw) ? vRaw.join(" | ") : String(vRaw != null ? vRaw : "")).split(/[|,]/g).map((s) => s.trim()).filter(Boolean);
        if (wants.length === 0) return [];
        return [{ key, wants }];
      });
      if (clauses.length) {
        const matchesAny = clauses.some(({ key, wants }) => {
          const have = fm[key];
          if (have == null) return false;
          const matchesWants = (x2) => wants.some((w) => matchScalar(x2, w));
          if (Array.isArray(have)) return have.some((x2) => matchesWants(x2));
          return matchesWants(have);
        });
        if (!matchesAny) return false;
      }
    }
    return true;
  }
  resolvePingSearchLayerIds(ping, preset) {
    var _a2, _b2, _c;
    if (!this.data) return null;
    const mode = (_a2 = preset == null ? void 0 : preset.searchLayersMode) != null ? _a2 : "all";
    if (mode === "self") {
      return /* @__PURE__ */ new Set([ping.layer]);
    }
    if (mode === "custom") {
      const names = ((_b2 = preset == null ? void 0 : preset.searchLayerNames) != null ? _b2 : []).map((s) => (s != null ? s : "").trim()).filter(Boolean);
      if (names.length === 0) return null;
      const ids = new Set(
        ((_c = this.data.layers) != null ? _c : []).filter((l) => {
          var _a3;
          return names.includes(((_a3 = l.name) != null ? _a3 : "").trim());
        }).map((l) => l.id)
      );
      if (ids.size === 0) return null;
      return ids;
    }
    return null;
  }
  buildTagIndexForTags(want) {
    const index = /* @__PURE__ */ new Map();
    if (want.size === 0) return index;
    const files = this.app.vault.getFiles().filter((f) => {
      var _a2;
      return ((_a2 = f.extension) == null ? void 0 : _a2.toLowerCase()) === "md";
    });
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
  backlinkPathsFromResolvedLinks(target) {
    const out = [];
    const mcAny = this.app.metadataCache;
    const rl = mcAny.resolvedLinks;
    if (!rl) return out;
    const addIfLinksTo = (srcPath, dests) => {
      if (!srcPath || srcPath === target.path) return;
      if (dests && typeof dests === "object") {
        if (dests instanceof Map) {
          if (dests.has(target.path)) out.push(srcPath);
          return;
        }
        const obj = dests;
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
      for (const [srcPath, dests] of Object.entries(rl)) {
        addIfLinksTo(srcPath, dests);
      }
    }
    return out;
  }
  getBacklinkSourcePaths(target) {
    return this.backlinkPathsFromResolvedLinks(target);
  }
  buildTagIndex() {
    const index = /* @__PURE__ */ new Map();
    const files = this.app.vault.getFiles().filter((f) => {
      var _a2;
      return ((_a2 = f.extension) == null ? void 0 : _a2.toLowerCase()) === "md";
    });
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
  formatWikiLink(file, fromPath) {
    const linktext = this.app.metadataCache.fileToLinktext(file, fromPath);
    return `[[${linktext}]]`;
  }
  escapeTableCell(s) {
    return (s != null ? s : "").replace(/\|/g, "\\|");
  }
  splitFrontmatterBlock(text) {
    const m = /^---\n[\s\S]*?\n(?:---|\.\.\.)\n/.exec(text);
    if (!m) return { frontmatter: "", rest: text };
    return { frontmatter: m[0], rest: text.slice(m[0].length) };
  }
  extractFirstMarkdownHeading(text) {
    const m = /^#\s+.*$/m.exec(text);
    return m ? m[0] : null;
  }
  extractFirstCodeFenceBlock(text, lang) {
    const lines = text.split("\n");
    const open = "```" + lang;
    let start = -1;
    for (let i2 = 0; i2 < lines.length; i2 += 1) {
      if (lines[i2].trimStart().startsWith(open)) {
        start = i2;
        break;
      }
    }
    if (start < 0) return null;
    let end = start + 1;
    while (end < lines.length && !lines[end].trimStart().startsWith("```")) end += 1;
    if (end >= lines.length) return null;
    return lines.slice(start, end + 1).join("\n").trimEnd();
  }
  openLinkInNewTab(link) {
    const leaf = this.app.workspace.getLeaf("tab");
    const anyLeaf = leaf;
    if (typeof anyLeaf.openLinkText === "function") {
      void anyLeaf.openLinkText(link, this.cfg.sourcePath);
      return;
    }
    const anyWs = this.app.workspace;
    try {
      void anyWs.openLinkText(link, this.cfg.sourcePath, true);
    } catch (e) {
      void this.app.workspace.openLinkText(link, this.cfg.sourcePath);
    }
  }
  buildPingNoteText(prevText, opts) {
    var _a2, _b2;
    const { frontmatter, rest } = this.splitFrontmatterBlock(prevText);
    const title = ((_a2 = this.extractFirstMarkdownHeading(rest)) != null ? _a2 : opts.defaultTitle).trimEnd();
    const baseBlock = opts.includeBases ? (_b2 = this.extractFirstCodeFenceBlock(rest, "base")) != null ? _b2 : `\`\`\`base
${opts.baseYamlFallback.trimEnd()}
\`\`\`` : "";
    const relatedSection = opts.includeRelated ? `${PING_RELATED_BEGIN}
${opts.relatedBody.trimEnd()}
${PING_RELATED_END}` : "";
    const travelSection = opts.includeTravel ? `## Travel times
${PING_TRAVEL_BEGIN}
${opts.travelBody.trimEnd()}
${PING_TRAVEL_END}` : "";
    const tooltipSection = opts.includeTooltips ? `## In-range markers without note
${PING_TOOLTIP_BEGIN}
${opts.tooltipBody.trimEnd()}
${PING_TOOLTIP_END}` : "";
    const parts = [
      `${frontmatter}${title}`,
      relatedSection,
      travelSection,
      tooltipSection,
      baseBlock
    ].filter((s) => (s != null ? s : "").trim().length > 0);
    return `${parts.join("\n\n").trimEnd()}
`;
  }
  async upsertPingRelatedSection(file, body) {
    await this.app.vault.process(file, (text) => {
      const a = text.indexOf(PING_RELATED_BEGIN);
      const b = text.indexOf(PING_RELATED_END);
      if (a >= 0 && b > a) {
        const before = text.slice(0, a + PING_RELATED_BEGIN.length);
        const after = text.slice(b);
        return `${before}
${body}
${after}`;
      }
      return text;
    });
  }
  schedulePingUpdate(delayMs = 900) {
    var _a2;
    if (!this.data) return;
    if (!((_a2 = this.data.markers) == null ? void 0 : _a2.some((m) => m.type === "ping"))) return;
    if (this.pingUpdateTimer !== null) window.clearTimeout(this.pingUpdateTimer);
    this.pingUpdateTimer = window.setTimeout(() => {
      this.pingUpdateTimer = null;
      void this.updateAllPingNotes();
    }, delayMs);
  }
  async updateAllPingNotes() {
    if (!this.data) return;
    const pings = this.data.markers.filter((m) => m.type === "ping");
    for (const p of pings) {
      try {
        await this.updatePingNoteForMarker(p);
      } catch (e) {
        console.warn("Ping update failed", e);
      }
    }
  }
  buildPingBaseYaml(preset, unitLabel) {
    var _a2, _b2;
    const andFilters = [
      "list(this.zoommapPingInRangePaths).contains(file.path)",
      'file.ext == "md"'
    ];
    const tags = ((_a2 = preset.filterTags) != null ? _a2 : []).map((t) => (t != null ? t : "").trim()).filter(Boolean);
    if (tags.length) {
      andFilters.push({
        or: tags.map((t) => `file.hasTag("${t.replace(/^#/, "")}")`)
      });
    }
    const props = (_b2 = preset.filterProps) != null ? _b2 : {};
    const propClauses = [];
    for (const [kRaw, vRaw] of Object.entries(props)) {
      const k = (kRaw != null ? kRaw : "").trim();
      if (!k) continue;
      const wants = (Array.isArray(vRaw) ? vRaw.join(" | ") : String(vRaw != null ? vRaw : "")).split(/[|,]/g).map((s) => s.trim()).filter(Boolean);
      if (wants.length === 0) continue;
      for (const v of wants) {
        propClauses.push(
          `note["${k.replace(/"/g, '\\"')}"] == "${v.replace(/"/g, '\\"')}"`
        );
      }
    }
    if (propClauses.length) andFilters.push({ or: propClauses });
    const baseObj = {
      filters: { and: andFilters },
      formulas: {
        ping_link: "file.asLink()",
        distance: `this.zoommapPingDistances[file.path]`,
        distance_label: `if(formula.distance, formula.distance.toString() + " ${unitLabel}", "")`
      },
      views: [
        {
          type: "table",
          name: "In range",
          order: ["formula.ping_link", "formula.distance_label", "file.tags"]
        }
      ]
    };
    return (0, import_obsidian21.stringifyYaml)(baseObj).trimEnd();
  }
  buildPingTravelTimesTable(fromPath, inRangeFiles, metersByPath) {
    var _a2;
    const presets = this.plugin.getActiveTravelTimePresets();
    if (!presets.length) return "*(none)*";
    const locs = inRangeFiles.map((x2) => ({ file: x2.file, meters: metersByPath[x2.file.path] })).filter((x2) => typeof x2.meters === "number" && Number.isFinite(x2.meters) && x2.meters >= 0);
    if (!locs.length) return "*(no calibrated scale)*";
    const header = ["Mode", ...locs.map((l) => this.formatWikiLink(l.file, fromPath))];
    const rows = [];
    rows.push(`| ${header.map((c) => this.escapeTableCell(c)).join(" | ")} |`);
    rows.push(`| ${header.map(() => "---").join(" | ")} |`);
    for (const p of presets) {
      const refMeters = this.travelDistanceToMeters(p.distanceValue, p.distanceUnit, p.distanceCustomUnitId);
      const name = p.name || p.id;
      const unit = ((_a2 = p.timeUnit) != null ? _a2 : "").trim() || "h";
      const cells = [name];
      for (const loc of locs) {
        if (!refMeters || !Number.isFinite(refMeters) || refMeters <= 0) {
          cells.push("-");
          continue;
        }
        const t = loc.meters / refMeters * p.timeValue;
        cells.push(`${this.formatTravelTimeNumber(t)} ${unit}`);
      }
      rows.push(`| ${cells.map((c) => this.escapeTableCell(c)).join(" | ")} |`);
    }
    return rows.join("\n").trimEnd();
  }
  async addPingPinAt(preset, nx, ny, distanceValue) {
    var _a2, _b2, _c, _d, _e;
    if (!this.data) return;
    const unit = (_a2 = preset.unit) != null ? _a2 : "km";
    const customUnitId = preset.customUnitId;
    if (unit === "custom" && (!customUnitId || !customUnitId.trim())) {
      new import_obsidian21.Notice("Party preset uses a custom unit but no customunitid is set.", 4e3);
      return;
    }
    const radiusPx = this.pingToPixels(distanceValue, unit, customUnitId);
    if (radiusPx == null) {
      new import_obsidian21.Notice("Cannot create party pin: map scale is not calibrated for this unit.", 5e3);
      return;
    }
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
    const iconKey = (_b2 = preset.iconKey) != null ? _b2 : this.plugin.settings.defaultIconKey;
    const distanceLabel = this.formatPingDistanceLabel(distanceValue, unit, customUnitId);
    const marker = {
      id: generateId("ping"),
      type: "ping",
      x: nx,
      y: ny,
      layer: layerId,
      iconKey,
      tooltip: preset.name ? `Party: ${preset.name} (${distanceLabel})` : `Party (${distanceLabel})`,
      pingPresetId: preset.id,
      pingRadius: distanceValue,
      pingRadiusUnit: unit,
      pingRadiusCustomUnitId: unit === "custom" ? customUnitId : void 0,
      scaleLikeSticker: preset.defaultScaleLikeSticker ? true : void 0
    };
    const folder = ((_c = preset.noteFolder) != null ? _c : "ZoomMap/Pings").trim() || "ZoomMap/Pings";
    const baseName = this.sanitizeFileName(`Party - ${preset.name || "Party"} - ${distanceLabel} - ${marker.id}`);
    let outPath = (0, import_obsidian21.normalizePath)(`${folder}/${baseName}.md`);
    await this.ensureFolderForPath(outPath);
    let i2 = 1;
    while (this.app.vault.getAbstractFileByPath(outPath)) {
      outPath = (0, import_obsidian21.normalizePath)(`${folder}/${baseName}-${i2}.md`);
      i2++;
    }
    const unitLabel = this.pingUnitLabel(unit, customUnitId);
    const baseYaml = this.buildPingBaseYaml(preset, unitLabel);
    const sections = (_d = preset.sections) != null ? _d : {};
    const includeBases = sections.bases !== false;
    const includeTooltips = sections.tooltips !== false;
    const includeRelated = sections.related !== false;
    const includeTravel = sections.travelTimes !== false;
    const fm = {
      zoommapPing: true,
      zoommapPingId: marker.id,
      zoommapPingMapId: (_e = this.cfg.mapId) != null ? _e : "",
      zoommapPingSourcePath: this.cfg.sourcePath,
      zoommapPingSourceFileName: basename(this.cfg.sourcePath),
      zoommapPingBase: this.getActiveBasePath(),
      zoommapPingRadius: distanceValue,
      zoommapPingUnit: unit,
      zoommapPingCustomUnitId: unit === "custom" ? customUnitId : void 0,
      zoommapPingPresetId: preset.id,
      zoommapPingPresetName: preset.name,
      zoommapPingInRangePaths: [],
      zoommapPingDistances: {},
      zoommapPingUpdated: (/* @__PURE__ */ new Date()).toISOString()
    };
    const frontmatter = `---
${(0, import_obsidian21.stringifyYaml)(fm).trimEnd()}
---

`;
    const defaultTitle = `# Party pin: ${preset.name || "Party"} (${distanceLabel})`;
    const relatedBody = "*(none)*";
    const tooltipBody = "*(none)*";
    const travelBody = "*(none)*";
    const baseYamlFallback = baseYaml;
    const md = frontmatter + this.buildPingNoteText("", {
      defaultTitle,
      baseYamlFallback,
      tooltipBody,
      relatedBody,
      travelBody,
      includeBases,
      includeTooltips,
      includeRelated,
      includeTravel
    });
    const file = await this.app.vault.create(outPath, md);
    marker.pingNotePath = file.path;
    marker.link = this.app.metadataCache.fileToLinktext(file, this.cfg.sourcePath);
    this.data.markers.push(marker);
    await this.saveDataSoon();
    this.renderMarkersOnly();
    await this.updatePingNoteForMarker(marker);
    new import_obsidian21.Notice("Party pin created.", 1200);
  }
  async updatePingNoteForMarker(ping) {
    var _a2, _b2, _c, _d, _e, _f, _g, _h, _i;
    if (!this.data) return;
    if (ping.type !== "ping") return;
    const preset = ping.pingPresetId ? this.findPingPresetById(ping.pingPresetId) : void 0;
    const af = await this.ensurePingNoteFileForMarker(ping, preset);
    if (!(af instanceof import_obsidian21.TFile)) return;
    const radius = (_a2 = ping.pingRadius) != null ? _a2 : 0;
    const unit = (_b2 = ping.pingRadiusUnit) != null ? _b2 : "km";
    const customUnitId = ping.pingRadiusCustomUnitId;
    const radiusPx = this.pingToPixels(radius, unit, customUnitId);
    if (radiusPx == null) return;
    const allowedLayerIds = this.resolvePingSearchLayerIds(ping, preset);
    const inRangePaths = /* @__PURE__ */ new Set();
    const distances = {};
    const metersByPath = {};
    const tooltipMap = /* @__PURE__ */ new Map();
    const mpp = this.getMetersPerPixel();
    for (const m of this.data.markers) {
      if (m.id === ping.id) continue;
      if (m.anchorSpace === "viewport") continue;
      if (m.type === "ping") continue;
      if (allowedLayerIds && !allowedLayerIds.has(m.layer)) continue;
      const dx = (m.x - ping.x) * this.imgW;
      const dy = (m.y - ping.y) * this.imgH;
      const pxDist = Math.hypot(dx, dy);
      if (pxDist > radiusPx) continue;
      const distVal = this.pingDistanceFromPixels(pxDist, unit, customUnitId);
      const dist = distVal == null ? 0 : Math.round(distVal * 100) / 100;
      const link = ((_c = m.link) != null ? _c : "").trim();
      if (link) {
        const f = this.resolveTFile(link, this.cfg.sourcePath);
        if (!f) continue;
        inRangePaths.add(f.path);
        const prev2 = distances[f.path];
        if (prev2 == null || dist < prev2) distances[f.path] = dist;
        if (typeof mpp === "number") {
          const meters = pxDist * mpp;
          const prevM = metersByPath[f.path];
          if (prevM == null || meters < prevM) metersByPath[f.path] = meters;
        }
        continue;
      }
      const tip = ((_d = m.tooltip) != null ? _d : "").trim();
      if (!tip) continue;
      const prev = tooltipMap.get(tip);
      if (prev == null || dist < prev) tooltipMap.set(tip, dist);
    }
    const listSorted = Array.from(inRangePaths).sort((a, b) => a.localeCompare(b));
    const distancesSorted = Object.fromEntries(
      Object.entries(distances).sort((a, b) => a[0].localeCompare(b[0]))
    );
    let fmChanged = false;
    await this.app.fileManager.processFrontMatter(af, (fm) => {
      var _a3, _b3;
      const set = (key, value) => {
        const cur = fm[key];
        if (!stableEqual(cur, value)) {
          fm[key] = value;
          fmChanged = true;
        }
      };
      const del = (key) => {
        if (Object.prototype.hasOwnProperty.call(fm, key)) {
          delete fm[key];
          fmChanged = true;
        }
      };
      set("zoommapPing", true);
      set("zoommapPingId", ping.id);
      set("zoommapPingMapId", (_a3 = this.cfg.mapId) != null ? _a3 : "");
      set("zoommapPingSourcePath", this.cfg.sourcePath);
      set("zoommapPingSourceFileName", basename(this.cfg.sourcePath));
      set("zoommapPingBase", this.getActiveBasePath());
      set("zoommapPingRadius", radius);
      set("zoommapPingUnit", unit);
      if (unit === "custom") set("zoommapPingCustomUnitId", customUnitId);
      else del("zoommapPingCustomUnitId");
      set("zoommapPingPresetId", (_b3 = ping.pingPresetId) != null ? _b3 : "");
      set("zoommapPingInRangePaths", listSorted);
      set("zoommapPingDistances", distancesSorted);
      if (fmChanged) {
        set("zoommapPingUpdated", (/* @__PURE__ */ new Date()).toISOString());
      }
    });
    const unitLabel = this.pingUnitLabel(unit, customUnitId);
    const tooltipsSorted = Array.from(tooltipMap.entries()).sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]));
    const tooltipLines = tooltipsSorted.length === 0 ? ["*(none)*"] : tooltipsSorted.map(([txt, d]) => `- ${txt} (${d} ${unitLabel})`);
    const relatedMode = (_e = preset == null ? void 0 : preset.relatedLookup) != null ? _e : "tags";
    const sections = (_f = preset == null ? void 0 : preset.sections) != null ? _f : {};
    const includeBases = sections.bases !== false;
    const includeTooltips = sections.tooltips !== false;
    const includeRelated = sections.related !== false;
    const includeTravel = sections.travelTimes !== false;
    let relatedBody = "";
    const inRangeFiles = listSorted.map((p) => this.app.vault.getAbstractFileByPath(p)).filter((x2) => x2 instanceof import_obsidian21.TFile).map((file) => {
      var _a3;
      return { file, dist: (_a3 = distances[file.path]) != null ? _a3 : 0 };
    }).filter(({ file }) => this.fileMatchesPartyFilters(file, preset)).sort((a, b) => a.dist - b.dist || a.file.path.localeCompare(b.file.path));
    try {
      if (!includeRelated) {
        relatedBody = "*(disabled)*";
      } else if (relatedMode === "off") {
        relatedBody = "*(disabled)*";
      } else if (relatedMode === "backlinks") {
        const maxPerNote = 50;
        const blocks = [];
        if (inRangeFiles.length === 0) {
          relatedBody = "*(none)*";
        } else {
          for (const c of inRangeFiles) {
            const pinLabel = `${this.formatWikiLink(c.file, af.path)} (${c.dist} ${unitLabel})`;
            const lines = [];
            lines.push(`| ${pinLabel} | Backlinks |`);
            lines.push("| --- | --- |");
            const sourcePaths = this.getBacklinkSourcePaths(c.file);
            const sources = sourcePaths.map((p) => this.app.vault.getAbstractFileByPath(p)).filter((x2) => x2 instanceof import_obsidian21.TFile).filter((f) => f.path !== c.file.path && f.path !== af.path).sort((a, b) => a.basename.localeCompare(b.basename, void 0, { sensitivity: "base" }));
            const slice = sources.slice(0, maxPerNote);
            const rest = sources.length - slice.length;
            const links = slice.map((f) => this.formatWikiLink(f, af.path));
            const cell = links.length ? links.join("<br>") + (rest > 0 ? `<br>\u2026 +${rest} more` : "") : "*(none)*";
            lines.push(`| Backlinks | ${cell} |`);
            blocks.push(lines.join("\n"));
          }
          relatedBody = blocks.join("\n\n").trim() || "*(none)*";
        }
      } else {
        const excludeTagNorms = new Set(
          ((_g = preset == null ? void 0 : preset.filterTags) != null ? _g : []).map((t) => this.normalizeTagForIndex(t)).filter(Boolean)
        );
        const candidates = inRangeFiles.map(({ file, dist }) => {
          const tags = this.collectTagsForFile(file);
          for (const ex of excludeTagNorms) tags.delete(ex);
          const norms = [...tags.keys()].sort((aa, bb) => {
            var _a3, _b3;
            const aTag = (_a3 = tags.get(aa)) != null ? _a3 : aa;
            const bTag = (_b3 = tags.get(bb)) != null ? _b3 : bb;
            return aTag.localeCompare(bTag, void 0, { sensitivity: "base" });
          });
          return { file, dist, tags, norms };
        }).filter((c) => c.norms.length > 0);
        if (candidates.length === 0) {
          relatedBody = "*(none)*";
        } else {
          const wantNorms = /* @__PURE__ */ new Set();
          for (const c of candidates) for (const n of c.norms) wantNorms.add(n);
          const tagIndex = this.buildTagIndexForTags(wantNorms);
          const maxPerTag = 50;
          const tables = [];
          for (const c of candidates) {
            const pinLabel = `${this.formatWikiLink(c.file, af.path)} (${c.dist} ${unitLabel})`;
            const lines = [];
            lines.push(`| ${pinLabel} | Notes with tag |`);
            lines.push("| --- | --- |");
            for (const norm of c.norms) {
              const displayTag = (_h = c.tags.get(norm)) != null ? _h : `#${norm}`;
              const matches = ((_i = tagIndex.get(norm)) != null ? _i : []).filter((f) => f.path !== c.file.path && f.path !== af.path).sort((a, b) => a.basename.localeCompare(b.basename, void 0, { sensitivity: "base" }));
              const slice = matches.slice(0, maxPerTag);
              const rest = matches.length - slice.length;
              const links = slice.map((f) => this.formatWikiLink(f, af.path));
              const cell = links.length ? links.join("<br>") + (rest > 0 ? `<br>\u2026 +${rest} more` : "") : "*(none)*";
              lines.push(`| ${this.escapeTableCell(displayTag)} | ${cell} |`);
            }
            tables.push(lines.join("\n"));
          }
          relatedBody = tables.join("\n\n").trim() || "*(none)*";
        }
      }
    } catch (e) {
      console.warn("Zoom Map: related section build failed", e);
      relatedBody = "*(error building related section)*";
    }
    if (!relatedBody.trim()) {
      relatedBody = "*(none)*";
    }
    const dummyPreset = preset != null ? preset : { id: "", name: "", distances: [], unit: "km" };
    const baseYamlFallback = this.buildPingBaseYaml(dummyPreset, unitLabel);
    const distLabel = this.formatPingDistanceLabel(radius, unit, customUnitId);
    const defaultTitle = `# Party pin: ${(preset == null ? void 0 : preset.name) || "Party"} (${distLabel})`;
    const travelBody = includeTravel ? this.buildPingTravelTimesTable(af.path, inRangeFiles, metersByPath) : "*(disabled)*";
    const tooltipBody = includeTooltips ? tooltipLines.join("\n") : "*(disabled)*";
    await this.app.vault.process(af, (text) => {
      const next = this.buildPingNoteText(text, {
        defaultTitle,
        baseYamlFallback,
        relatedBody,
        travelBody,
        tooltipBody,
        includeBases,
        includeTooltips,
        includeRelated,
        includeTravel
      });
      return next === text ? text : next;
    });
    const shouldRefreshSourceNote = (preset == null ? void 0 : preset.refreshSourceNoteOnUpdate) !== false;
    if (!shouldRefreshSourceNote) return;
    this.plugin.snapshotMapsForSourceNote(this.cfg.sourcePath);
    await this.refreshOpenMarkdownViewsForPaths([this.cfg.sourcePath]);
  }
  async deletePingNoteIfOwned(m) {
    var _a2, _b2;
    if (m.type !== "ping") return;
    const p = ((_a2 = m.pingNotePath) != null ? _a2 : "").trim();
    if (!p) return;
    const af = this.app.vault.getAbstractFileByPath(p);
    if (!(af instanceof import_obsidian21.TFile)) return;
    const fm = (_b2 = this.app.metadataCache.getFileCache(af)) == null ? void 0 : _b2.frontmatter;
    const owner = fm == null ? void 0 : fm.zoommapPingId;
    if (owner !== m.id) return;
    try {
      await this.app.fileManager.trashFile(af, true);
    } catch (e) {
      console.warn("Failed to trash ping note", e);
    }
  }
  openPinSizeEditor(focusIconKey) {
    var _a2, _b2, _c, _d, _e;
    if (!this.data) return;
    const usedKeys = /* @__PURE__ */ new Set();
    for (const m of this.data.markers) {
      if (m.type === "sticker") continue;
      if (m.type === "swap" && m.swapKey) {
        const preset = this.findSwapPresetById(m.swapKey);
        if ((_a2 = preset == null ? void 0 : preset.frames) == null ? void 0 : _a2.length) {
          for (const fr of preset.frames) {
            const k = ((_b2 = fr == null ? void 0 : fr.iconKey) != null ? _b2 : "").trim();
            if (k) usedKeys.add(k);
          }
        }
        if (m.iconKey) usedKeys.add(m.iconKey);
        continue;
      }
      const key = ((_c = m.iconKey) != null ? _c : this.plugin.settings.defaultIconKey).trim();
      if (key) usedKeys.add(key);
    }
    if (usedKeys.size === 0) {
      new import_obsidian21.Notice("No pins on this map yet.", 2e3);
      return;
    }
    const rows = [];
    for (const key of usedKeys) {
      const profile = (_d = this.plugin.settings.icons.find((i2) => i2.key === key)) != null ? _d : this.plugin.builtinIcon();
      const baseSize = profile.size;
      const override = (_e = this.data.pinSizeOverrides) == null ? void 0 : _e[key];
      const imgUrl = this.resolveResourceUrl(profile.pathOrDataUrl);
      rows.push({
        iconKey: key,
        baseSize,
        override,
        imgUrl
      });
    }
    rows.sort((a, b) => a.iconKey.localeCompare(b.iconKey));
    const modal = new PinSizeEditorModal(
      this.app,
      rows,
      (updated) => {
        if (!this.data) return;
        const allowed = new Set(rows.map((r) => r.iconKey));
        const next = {};
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
      focusIconKey != null ? focusIconKey : void 0
    );
    modal.open();
  }
  getTintedSvgDataUrl(baseDataUrl, color) {
    const key = `${baseDataUrl}||${color}`;
    const cached = this.tintedSvgCache.get(key);
    if (cached) return cached;
    const idx = baseDataUrl.indexOf(",");
    if (idx < 0) return baseDataUrl;
    const header = baseDataUrl.slice(0, idx + 1);
    const payload = baseDataUrl.slice(idx + 1);
    let svg;
    try {
      svg = decodeURIComponent(payload);
    } catch (e) {
      return baseDataUrl;
    }
    const tinted = tintSvgMarkupLocal(svg, color);
    const out = header + encodeURIComponent(tinted);
    this.tintedSvgCache.set(key, out);
    return out;
  }
  canDrawingUseRegion(d) {
    return d.kind === "polygon" || d.kind === "rect" || d.kind === "circle";
  }
  showDrawingTooltip(clientX, clientY, body, title) {
    var _a2, _b2;
    const text = (body != null ? body : "").trim();
    const head = (title != null ? title : "").trim();
    if (!text && !head) return;
    if (!this.tooltipEl) {
      this.tooltipEl = this.hudClipEl.createDiv({ cls: "zm-tooltip" });
      this.tooltipEl.addEventListener("mouseenter", () => this.cancelHideTooltip());
      this.tooltipEl.addEventListener("mouseleave", () => this.hideTooltipSoon());
    }
    this.tooltipEl.style.maxWidth = `${(_a2 = this.plugin.settings.hoverMaxWidth) != null ? _a2 : 360}px`;
    this.tooltipEl.style.maxHeight = `${(_b2 = this.plugin.settings.hoverMaxHeight) != null ? _b2 : 260}px`;
    this.cancelHideTooltip();
    this.tooltipEl.empty();
    if (head) this.tooltipEl.createEl("div", { cls: "zm-tooltip__title", text: head });
    if (text) this.tooltipEl.createEl("div", { cls: "zm-tooltip__body", text });
    this.positionTooltip(clientX, clientY);
    this.tooltipEl.classList.add("zm-tooltip-visible");
  }
  onDrawingRegionEnter(ev, d) {
    var _a2, _b2;
    if (this.measuring || this.calibrating) return;
    const tooltip = ((_b2 = (_a2 = d.style) == null ? void 0 : _a2.regionTooltip) != null ? _b2 : "").trim();
    if (!tooltip) return;
    this.showDrawingTooltip(ev.clientX, ev.clientY, tooltip);
  }
  triggerDrawingRegionHoverPopover(ev, d, targetEl) {
    var _a2, _b2, _c;
    if (this.measuring || this.calibrating) return;
    const link = ((_b2 = (_a2 = d.style) == null ? void 0 : _a2.regionLink) != null ? _b2 : "").trim();
    if (!link) return;
    if (((_c = d.style) == null ? void 0 : _c.regionHoverPreview) === false) return;
    const forcePopover = this.plugin.settings.forcePopoverWithoutModKey === true;
    const wantsPopover = forcePopover || ev.ctrlKey || ev.metaKey;
    if (!wantsPopover) return;
    this.applyGlobalHoverPopoverStyleVars();
    const eventForPopover = forcePopover ? new MouseEvent("mousemove", {
      clientX: ev.clientX,
      clientY: ev.clientY,
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
      metaKey: true
    }) : ev;
    const hoverTarget = targetEl instanceof HTMLElement ? targetEl : this.getDrawingHoverAnchor(ev.clientX, ev.clientY);
    this.app.workspace.trigger("hover-link", {
      event: eventForPopover,
      source: "zoom-map",
      hoverParent: this,
      targetEl: hoverTarget,
      linktext: link,
      sourcePath: this.cfg.sourcePath
    });
  }
  getDrawingHoverAnchor(clientX, clientY) {
    if (!this.drawingHoverAnchorEl) {
      this.drawingHoverAnchorEl = this.hudClipEl.createDiv();
      this.drawingHoverAnchorEl.setAttr("aria-hidden", "true");
      setCssProps(this.drawingHoverAnchorEl, {
        position: "absolute",
        width: "2px",
        height: "2px",
        pointerEvents: "none",
        opacity: "0",
        transform: "translate(-1px, -1px)",
        left: "0px",
        top: "0px"
      });
    }
    const rect = this.hudClipEl.getBoundingClientRect();
    this.drawingHoverAnchorEl.style.left = `${clientX - rect.left}px`;
    this.drawingHoverAnchorEl.style.top = `${clientY - rect.top}px`;
    return this.drawingHoverAnchorEl;
  }
  openDrawingRegionLink(d, opts) {
    var _a2, _b2;
    const link = ((_b2 = (_a2 = d.style) == null ? void 0 : _a2.regionLink) != null ? _b2 : "").trim();
    if (!link) return;
    if (opts == null ? void 0 : opts.newTab) {
      this.openLinkInNewTab(link);
      return;
    }
    void this.app.workspace.openLinkText(link, this.cfg.sourcePath);
  }
  renderDrawings() {
    var _a2, _b2, _c, _d, _e, _f, _g, _h, _i;
    if (!this.drawSvg || !this.drawStaticLayer || !this.drawDefs) return;
    this.drawSvg.setAttribute("width", String(this.imgW));
    this.drawSvg.setAttribute("height", String(this.imgH));
    while (this.drawStaticLayer.firstChild) {
      this.drawStaticLayer.removeChild(this.drawStaticLayer.firstChild);
    }
    while (this.drawDefs.firstChild) {
      this.drawDefs.removeChild(this.drawDefs.firstChild);
    }
    (_a2 = this.drawHitboxesEl) == null ? void 0 : _a2.empty();
    if (!this.data || !Array.isArray(this.data.drawings) || this.data.drawings.length === 0) {
      return;
    }
    const visibleDrawLayers = new Set(
      ((_b2 = this.data.drawLayers) != null ? _b2 : []).filter((l) => l.visible).map((l) => l.id)
    );
    const toAbs = (nx, ny) => ({
      x: nx * this.imgW,
      y: ny * this.imgH
    });
    const ns = "http://www.w3.org/2000/svg";
    const doc = this.getOwnerDocument();
    for (const d of this.data.drawings) {
      if (!d.visible) continue;
      if (!visibleDrawLayers.has(d.layerId)) continue;
      const style = (_c = d.style) != null ? _c : {};
      const regionLink = ((_d = style.regionLink) != null ? _d : "").trim();
      const regionTooltip = ((_e = style.regionTooltip) != null ? _e : "").trim();
      const regionInvisible = !!style.regionInvisible;
      const interactiveRegion = this.canDrawingUseRegion(d) && (regionInvisible || !!regionLink || !!regionTooltip);
      let shape = null;
      let minX = 0;
      let minY = 0;
      let width = 0;
      let height = 0;
      let polylineLenPx = 0;
      let polylineMid = null;
      if (d.kind === "circle" && d.circle) {
        const { cx, cy, r } = d.circle;
        const c = toAbs(cx, cy);
        const radius = r * Math.max(this.imgW, this.imgH);
        minX = c.x - radius;
        minY = c.y - radius;
        width = radius * 2;
        height = radius * 2;
        const circ = doc.createElementNS(ns, "circle");
        circ.setAttribute("cx", String(c.x));
        circ.setAttribute("cy", String(c.y));
        circ.setAttribute("r", String(radius));
        shape = circ;
      } else if (d.kind === "rect" && d.rect) {
        const { x0, y0, x1, y1 } = d.rect;
        const a = toAbs(x0, y0);
        const b = toAbs(x1, y1);
        const x2 = Math.min(a.x, b.x);
        const y = Math.min(a.y, b.y);
        const w = Math.abs(a.x - b.x);
        const h = Math.abs(a.y - b.y);
        minX = x2;
        minY = y;
        width = w;
        height = h;
        const rEl = doc.createElementNS(ns, "rect");
        rEl.setAttribute("x", String(x2));
        rEl.setAttribute("y", String(y));
        rEl.setAttribute("width", String(w));
        rEl.setAttribute("height", String(h));
        shape = rEl;
      } else if (d.kind === "polygon" && d.polygon && d.polygon.length >= 2) {
        const path = doc.createElementNS(ns, "path");
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
        if (Number.isFinite(minPx) && Number.isFinite(maxPx) && Number.isFinite(minPy) && Number.isFinite(maxPy)) {
          minX = minPx;
          minY = minPy;
          width = maxPx - minPx;
          height = maxPy - minPy;
        }
      } else if (d.kind === "polyline" && d.polyline && d.polyline.length >= 2) {
        const path = doc.createElementNS(ns, "path");
        let dAttr = "";
        let minPx = Infinity;
        let minPy = Infinity;
        let maxPx = -Infinity;
        let maxPy = -Infinity;
        const absPts = d.polyline.map((p) => toAbs(p.x, p.y));
        for (let i2 = 0; i2 < absPts.length; i2 += 1) {
          const a = absPts[i2];
          dAttr += i2 === 0 ? `M ${a.x} ${a.y}` : ` L ${a.x} ${a.y}`;
          minPx = Math.min(minPx, a.x);
          maxPx = Math.max(maxPx, a.x);
          minPy = Math.min(minPy, a.y);
          maxPy = Math.max(maxPy, a.y);
        }
        for (let i2 = 1; i2 < absPts.length; i2 += 1) {
          polylineLenPx += Math.hypot(absPts[i2].x - absPts[i2 - 1].x, absPts[i2].y - absPts[i2 - 1].y);
        }
        if (polylineLenPx > 0) {
          const target = polylineLenPx / 2;
          let acc = 0;
          for (let i2 = 1; i2 < absPts.length; i2 += 1) {
            const p0 = absPts[i2 - 1];
            const p1 = absPts[i2];
            const seg = Math.hypot(p1.x - p0.x, p1.y - p0.y);
            if (acc + seg >= target && seg > 0) {
              const t = (target - acc) / seg;
              const x2 = p0.x + (p1.x - p0.x) * t;
              const y = p0.y + (p1.y - p0.y) * t;
              const angleDeg = Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI;
              polylineMid = { x: x2, y, angleDeg };
              break;
            }
            acc += seg;
          }
        }
        path.setAttribute("d", dAttr);
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-linejoin", "round");
        shape = path;
        if (Number.isFinite(minPx) && Number.isFinite(maxPx) && Number.isFinite(minPy) && Number.isFinite(maxPy)) {
          minX = minPx;
          minY = minPy;
          width = maxPx - minPx;
          height = maxPy - minPy;
        }
      }
      if (!shape || width <= 0 || height <= 0) continue;
      const handleCtx = (ev) => {
        this.hideTooltipSoon(0);
        if (this.measuring || this.calibrating) {
          return;
        }
        ev.preventDefault();
        ev.stopPropagation();
        this.onDrawingContextMenu(ev, d);
      };
      const patternKind = d.kind === "polyline" ? "none" : (_f = style.fillPattern) != null ? _f : style.fillColor ? "solid" : "none";
      if (!regionInvisible && (patternKind === "striped" || patternKind === "cross" || patternKind === "wavy")) {
        const af = d.bakedPath ? this.app.vault.getAbstractFileByPath(d.bakedPath) : null;
        if (!d.bakedPath || !(af instanceof import_obsidian21.TFile)) {
          void this.bakePatternSvgToFile(d, {
            minX,
            minY,
            width,
            height
          });
        }
      }
      let patternHref = null;
      if (!regionInvisible && (patternKind === "striped" || patternKind === "cross" || patternKind === "wavy")) {
        if (d.bakedPath) {
          const af = this.app.vault.getAbstractFileByPath(d.bakedPath);
          if (af instanceof import_obsidian21.TFile) {
            const url = this.app.vault.getResourcePath(af);
            patternHref = url;
          } else {
            console.warn("ZoomMap: baked SVG file not found", {
              id: d.id,
              bakedPath: d.bakedPath
            });
          }
        }
      }
      if (!regionInvisible && patternHref) {
        const img = doc.createElementNS(ns, "image");
        img.setAttribute("href", patternHref);
        img.setAttribute("x", String(minX));
        img.setAttribute("y", String(minY));
        img.setAttribute("width", String(width));
        img.setAttribute("height", String(height));
        img.classList.add("zm-draw__shape");
        img.dataset.id = d.id;
        img.addEventListener("contextmenu", handleCtx);
        this.drawStaticLayer.appendChild(img);
      } else if (!regionInvisible && patternKind !== "none") {
        const fillColor = (_g = style.fillColor) != null ? _g : "none";
        const fillOp = typeof style.fillOpacity === "number" ? Math.min(Math.max(style.fillOpacity, 0), 1) : 0.15;
        const fillShape = shape.cloneNode(false);
        fillShape.classList.add("zm-draw__shape");
        fillShape.dataset.id = d.id;
        fillShape.setAttribute("fill", fillColor);
        fillShape.setAttribute("fill-opacity", String(fillOp));
        fillShape.setAttribute("stroke", "none");
        fillShape.addEventListener("contextmenu", handleCtx);
        this.drawStaticLayer.appendChild(fillShape);
      }
      const strokeColor = ((_h = style.strokeColor) != null ? _h : "#ff0000").trim() || "#ff0000";
      const strokeWidth = Number.isFinite(style.strokeWidth) && style.strokeWidth > 0 ? style.strokeWidth : 2;
      const strokeOpacity = typeof style.strokeOpacity === "number" ? Math.min(Math.max(style.strokeOpacity, 0), 1) : 1;
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
        const marker = doc.createElementNS(ns, "marker");
        marker.setAttribute("id", markerId);
        marker.setAttribute("viewBox", "0 0 10 10");
        marker.setAttribute("refX", "10");
        marker.setAttribute("refY", "5");
        marker.setAttribute("markerWidth", "6");
        marker.setAttribute("markerHeight", "6");
        marker.setAttribute("orient", "auto");
        marker.setAttribute("markerUnits", "strokeWidth");
        const ap = doc.createElementNS(ns, "path");
        ap.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
        ap.setAttribute("fill", strokeColor);
        marker.appendChild(ap);
        this.drawDefs.appendChild(marker);
        outline.setAttribute("marker-end", `url(#${markerId})`);
      } else {
        outline.removeAttribute("marker-end");
      }
      if (!regionInvisible) {
        outline.addEventListener("contextmenu", handleCtx);
        this.drawStaticLayer.appendChild(outline);
        if (d.kind === "polyline" && style.distanceLabel && polylineMid && polylineLenPx > 0) {
          const txt = this.formatPolylineDistance(polylineLenPx);
          if (txt) {
            const tEl = doc.createElementNS(ns, "text");
            tEl.classList.add("zm-draw__label");
            tEl.setAttribute("x", String(polylineMid.x));
            tEl.setAttribute("y", String(polylineMid.y));
            tEl.setAttribute("text-anchor", "middle");
            tEl.setAttribute("dominant-baseline", "middle");
            tEl.setAttribute("fill", strokeColor);
            let ang = polylineMid.angleDeg;
            if (ang > 90 || ang < -90) ang += 180;
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
      if (interactiveRegion && this.drawHitboxesEl) {
        const hit = this.drawHitboxesEl.createDiv({ cls: "zm-draw-hitbox" });
        hit.dataset.id = d.id;
        hit.style.left = `${minX}px`;
        hit.style.top = `${minY}px`;
        hit.style.width = `${width}px`;
        hit.style.height = `${height}px`;
        if (d.kind === "circle") {
          hit.classList.add("zm-draw-hitbox--circle");
        } else if (d.kind === "polygon" && ((_i = d.polygon) == null ? void 0 : _i.length)) {
          const pts = d.polygon.map((p) => {
            const ax = p.x * this.imgW;
            const ay = p.y * this.imgH;
            const px = (ax - minX) / width * 100;
            const py = (ay - minY) / height * 100;
            return `${px}% ${py}%`;
          });
          hit.style.clipPath = `polygon(${pts.join(", ")})`;
        } else {
          hit.style.removeProperty("clip-path");
        }
        hit.addEventListener("mouseenter", (ev) => {
          this.triggerDrawingRegionHoverPopover(ev, d, hit);
          this.onDrawingRegionEnter(ev, d);
        });
        hit.addEventListener("mousemove", (ev) => {
          var _a3, _b3, _c2;
          const forcePopover = this.plugin.settings.forcePopoverWithoutModKey === true;
          if (!forcePopover && (ev.ctrlKey || ev.metaKey)) {
            this.triggerDrawingRegionHoverPopover(ev, d, hit);
          }
          if (((_b3 = (_a3 = d.style) == null ? void 0 : _a3.regionTooltip) != null ? _b3 : "").trim() && ((_c2 = this.tooltipEl) == null ? void 0 : _c2.classList.contains("zm-tooltip-visible"))) {
            this.positionTooltip(ev.clientX, ev.clientY);
          }
        });
        hit.addEventListener("mouseleave", () => {
          this.hideTooltipSoon();
        });
        hit.addEventListener("click", (ev) => {
          if (this.measuring || this.calibrating) return;
          if (!regionLink) return;
          ev.preventDefault();
          ev.stopPropagation();
          this.openDrawingRegionLink(d);
        });
        hit.addEventListener("mousedown", (ev) => {
          if (ev.button !== 1) return;
          if (!this.plugin.settings.middleClickOpensLinkInNewTab) return;
          if (!regionLink) return;
          ev.preventDefault();
          ev.stopPropagation();
        });
        hit.addEventListener("auxclick", (ev) => {
          if (ev.button !== 1) return;
          if (!this.plugin.settings.middleClickOpensLinkInNewTab) return;
          if (!regionLink) return;
          ev.preventDefault();
          ev.stopPropagation();
          this.openDrawingRegionLink(d, { newTab: true });
        });
        hit.addEventListener("contextmenu", handleCtx);
      }
    }
    this.renderDrawingEditHandles();
  }
  formatPolylineDistance(px) {
    var _a2, _b2, _c;
    const unit = (_c = (_b2 = (_a2 = this.data) == null ? void 0 : _a2.measurement) == null ? void 0 : _b2.displayUnit) != null ? _c : "auto-metric";
    if (unit === "custom") return this.formatCustomDistanceFromPixels(px);
    const mpp = this.getMetersPerPixel();
    if (!mpp) return null;
    return this.formatDistance(px * mpp);
  }
  buildPatternSvgMarkup(d, box) {
    var _a2, _b2, _c;
    const style = (_a2 = d.style) != null ? _a2 : {};
    const patternKind = (_b2 = style.fillPattern) != null ? _b2 : style.fillColor ? "solid" : "none";
    if (patternKind === "none" || patternKind === "solid") return null;
    const { minX, minY, width, height } = box;
    const maxX = minX + width;
    const maxY = minY + height;
    const toAbs = (nx, ny) => ({
      x: nx * this.imgW,
      y: ny * this.imgH
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
      const x2 = Math.min(a.x, b.x);
      const y = Math.min(a.y, b.y);
      const w = Math.abs(a.x - b.x);
      const h = Math.abs(a.y - b.y);
      clipBody = `<rect x="${x2}" y="${y}" width="${w}" height="${h}" />`;
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
    const fillColor = (_c = style.fillColor) != null ? _c : "#ff0000";
    const fillOpacity = typeof style.fillOpacity === "number" ? Math.min(Math.max(style.fillOpacity, 0), 1) : 0.15;
    const spacing = typeof style.fillPatternSpacing === "number" && style.fillPatternSpacing > 0 ? style.fillPatternSpacing : 8;
    const rawAngle = typeof style.fillPatternAngle === "number" ? style.fillPatternAngle : 45;
    const angle = (rawAngle % 360 + 360) % 360;
    const strokeWidth = typeof style.fillPatternStrokeWidth === "number" && style.fillPatternStrokeWidth > 0 ? style.fillPatternStrokeWidth : 1;
    const patternOpacity = typeof style.fillPatternOpacity === "number" ? Math.min(Math.max(style.fillPatternOpacity, 0), 1) : fillOpacity;
    const centerX = minX + width / 2;
    const centerY = minY + height / 2;
    let stripeContent = "";
    if (patternKind === "striped" || patternKind === "wavy") {
      for (let x2 = minX - width; x2 <= maxX + width; x2 += spacing) {
        if (patternKind === "striped") {
          const xf = x2.toFixed(2);
          stripeContent += `<line x1="${xf}" y1="${(minY - height).toFixed(
            2
          )}" x2="${xf}" y2="${(maxY + height).toFixed(2)}" />`;
        } else {
          const xf = x2.toFixed(2);
          const amp = height / 6;
          const segments = 8;
          let dPath = `M ${xf} ${minY.toFixed(2)}`;
          for (let i2 = 1; i2 <= segments; i2 += 1) {
            const t = i2 / segments;
            const y = minY + t * height;
            const midY = minY + (t - 0.5 / segments) * height;
            const dir = i2 % 2 === 0 ? -1 : 1;
            const ctrlX = x2 + dir * amp;
            dPath += ` C ${ctrlX.toFixed(2)} ${midY.toFixed(
              2
            )} ${ctrlX.toFixed(2)} ${midY.toFixed(2)} ${xf} ${y.toFixed(2)}`;
          }
          stripeContent += `<path d="${dPath}" />`;
        }
      }
    } else if (patternKind === "cross") {
      for (let x2 = minX - width; x2 <= maxX + width; x2 += spacing) {
        const xf = x2.toFixed(2);
        stripeContent += `<line x1="${xf}" y1="${(minY - height).toFixed(
          2
        )}" x2="${xf}" y2="${(maxY + height).toFixed(2)}" />`;
      }
      for (let y = minY - height; y <= maxY + height; y += spacing) {
        const yf = y.toFixed(2);
        stripeContent += `<line x1="${(minX - width).toFixed(
          2
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
  async bakePatternSvgToFile(d, box) {
    var _a2;
    const svg = this.buildPatternSvgMarkup(d, box);
    if (!svg) return;
    const vault = this.app.vault;
    const folder = "ZoomMap/draw-overlays";
    if (!vault.getAbstractFileByPath(folder)) {
      await vault.createFolder(folder);
    }
    const mapId = (_a2 = this.cfg.mapId) != null ? _a2 : this.cfg.sourcePath.replace(/[\\/]/g, "_").replace(/[^\w.-]/g, "_");
    const fileName = `${mapId}-${d.id}.svg`;
    const fullPath = `${folder}/${fileName}`;
    const existing = vault.getAbstractFileByPath(fullPath);
    if (existing instanceof import_obsidian21.TFile) {
      await vault.modify(existing, svg);
    } else {
      await vault.create(fullPath, svg);
    }
    d.bakedPath = fullPath;
    d.bakedWidth = box.width;
    d.bakedHeight = box.height;
    await this.saveDataSoon();
    if (this.ready) {
      this.renderDrawings();
    }
  }
  async deleteDrawing(d) {
    var _a2, _b2;
    if (!this.data) return;
    const index = ((_a2 = this.data.drawings) != null ? _a2 : []).findIndex((x2) => x2.id === d.id);
    if (index < 0) return;
    this.pushDeleteUndo(
      {
        kind: "drawing",
        drawing: cloneForUndo(d),
        index
      },
      `Delete ${d.kind}`
    );
    if (this.drawEditDrawingId === d.id) {
      this.drawEditDrawingId = null;
      this.drawEditMode = null;
      this.drawEditPointIndex = null;
      this.drawEditHandleKind = null;
      this.drawEditPointerId = null;
      this.drawEditOriginalDrawing = null;
    }
    if (d.bakedPath) {
      const af = this.app.vault.getAbstractFileByPath(d.bakedPath);
      if (af instanceof import_obsidian21.TFile) {
        try {
          await this.app.fileManager.trashFile(af, true);
        } catch (err2) {
          console.error("Zoom Map: failed to delete baked SVG", d.bakedPath, err2);
        }
      }
    }
    this.data.drawings = ((_b2 = this.data.drawings) != null ? _b2 : []).filter((x2) => x2.id !== d.id);
    await this.saveDataSoon();
    this.renderDrawings();
    new import_obsidian21.Notice("Drawing deleted.", 900);
  }
  onDrawingContextMenu(ev, d) {
    if (this.measuring || this.calibrating) {
      ev.preventDefault();
      ev.stopPropagation();
      this.openMeasureOnlyContextMenu(ev.clientX, ev.clientY);
      return;
    }
    this.closeMenu();
    const canApplyTextBox = d.kind === "rect" || d.kind === "polyline";
    const canEditGeometry = d.kind === "polygon" || d.kind === "polyline" || d.kind === "rect" || d.kind === "circle";
    const items = [
      {
        label: "Edit drawing\u2026",
        action: () => {
          var _a2;
          this.closeMenu();
          if (!this.data) return;
          const modal = new DrawingEditorModal(
            this.app,
            d,
            (_a2 = this.data.drawLayers) != null ? _a2 : [],
            (res) => {
              var _a3;
              this.stopEditDrawingGeometry(true);
              if (!this.data) return;
              if (res.action === "save" && res.drawing) {
                const updated = res.drawing;
                const idx = ((_a3 = this.data.drawings) != null ? _a3 : []).findIndex(
                  (x2) => x2.id === d.id
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
            }
          );
          modal.open();
        }
      },
      ...canEditGeometry ? [
        {
          label: this.drawEditDrawingId === d.id ? "Stop editing points" : d.kind === "polygon" || d.kind === "polyline" ? "Edit points\u2026" : "Edit shape\u2026",
          action: () => {
            this.closeMenu();
            if (this.drawEditDrawingId === d.id) {
              this.stopEditDrawingGeometry(true);
            } else {
              this.stopEditDrawingGeometry(true);
              this.startEditDrawingGeometry(d);
            }
          }
        }
      ] : [],
      ...this.plugin.settings.enableTextLayers && canApplyTextBox ? [
        {
          label: "Apply text box",
          children: [
            {
              label: "Custom",
              action: () => {
                this.closeMenu();
                this.applyDrawingAsTextBox(d, "custom");
              }
            },
            {
              label: "Auto",
              action: () => {
                this.closeMenu();
                this.applyDrawingAsTextBox(d, "auto");
              }
            }
          ]
        }
      ] : [],
      {
        label: "Delete drawing",
        action: () => {
          void this.deleteDrawing(d);
        }
      }
    ];
    this.openMenu = new ZMMenu(this.el.ownerDocument);
    this.openMenu.open(ev.clientX, ev.clientY, items);
    const doc = this.getOwnerDocument();
    const outside = (event) => {
      if (!this.openMenu) return;
      const t = event.target;
      if (t instanceof HTMLElement && this.openMenu.contains(t)) return;
      this.closeMenu();
    };
    const keyClose = (event) => {
      if (event.key === "Escape") this.closeMenu();
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
  getOrCreateDefaultDrawLayer() {
    var _a2, _b2, _c;
    if (!this.data) {
      throw new Error("No marker data loaded");
    }
    (_b2 = (_a2 = this.data).drawLayers) != null ? _b2 : _a2.drawLayers = [];
    let layer = (_c = this.data.drawLayers.find((l) => l.visible)) != null ? _c : this.data.drawLayers[0];
    if (!layer) {
      layer = {
        id: generateId("draw"),
        name: "Draw",
        visible: true,
        locked: false
      };
      this.data.drawLayers.push(layer);
    }
    return layer;
  }
  handleDrawClick(e) {
    var _a2, _b2, _c;
    if (!this.drawingMode) return false;
    if (!this.data) return false;
    const vpRect = this.viewportEl.getBoundingClientRect();
    const vx = e.clientX - vpRect.left;
    const vy = e.clientY - vpRect.top;
    const wx = (vx - this.tx) / this.scale;
    const wy = (vy - this.ty) / this.scale;
    const nx = clamp(wx / this.imgW, 0, 1);
    const ny = clamp(wy / this.imgH, 0, 1);
    const layerId = (_a2 = this.drawingActiveLayerId) != null ? _a2 : this.getOrCreateDefaultDrawLayer().id;
    if ((this.drawingMode === "polygon" || this.drawingMode === "polyline") && e.detail > 1) {
      return true;
    }
    if (this.drawingMode === "rect") {
      if (!this.drawRectStart) {
        this.drawRectStart = { x: nx, y: ny };
        return true;
      }
      const start = this.drawRectStart;
      const draft = {
        id: generateId("draw"),
        layerId,
        kind: "rect",
        visible: true,
        rect: { x0: start.x, y0: start.y, x1: nx, y1: ny },
        style: {
          strokeColor: "#ff0000",
          strokeWidth: 2,
          fillColor: "#ff0000",
          fillOpacity: 0.15
        }
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
        (_b2 = this.data.drawLayers) != null ? _b2 : [],
        (res) => {
          var _a3, _b3;
          if (!this.data) return;
          if (res.action === "save" && res.drawing) {
            (_b3 = (_a3 = this.data).drawings) != null ? _b3 : _a3.drawings = [];
            this.data.drawings.push(res.drawing);
            void this.saveDataSoon();
            this.renderDrawings();
          }
        }
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
      const draft = {
        id: generateId("draw"),
        layerId,
        kind: "circle",
        visible: true,
        circle: { cx: center.x, cy: center.y, r: radiusNorm },
        style: {
          strokeColor: "#ff0000",
          strokeWidth: 2,
          fillColor: "#ff0000",
          fillOpacity: 0.15
        }
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
        (_c = this.data.drawLayers) != null ? _c : [],
        (res) => {
          var _a3, _b3;
          if (!this.data) return;
          if (res.action === "save" && res.drawing) {
            (_b3 = (_a3 = this.data).drawings) != null ? _b3 : _a3.drawings = [];
            this.data.drawings.push(res.drawing);
            void this.saveDataSoon();
            this.renderDrawings();
          }
        }
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
  finishPolygonDrawing() {
    var _a2, _b2;
    if (!this.drawingMode || this.drawingMode !== "polygon") return;
    if (!this.data) return;
    if (this.drawPolygonPoints.length < 2) return;
    const layerId = (_a2 = this.drawingActiveLayerId) != null ? _a2 : this.getOrCreateDefaultDrawLayer().id;
    const points = [...this.drawPolygonPoints];
    const draft = {
      id: generateId("draw"),
      layerId,
      kind: "polygon",
      visible: true,
      polygon: points,
      style: {
        strokeColor: "#ff0000",
        strokeWidth: 2,
        fillColor: "#ff0000",
        fillOpacity: 0.15
      }
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
      (_b2 = this.data.drawLayers) != null ? _b2 : [],
      (res) => {
        var _a3, _b3;
        if (!this.data) return;
        if (res.action === "save" && res.drawing) {
          (_b3 = (_a3 = this.data).drawings) != null ? _b3 : _a3.drawings = [];
          this.data.drawings.push(res.drawing);
          void this.saveDataSoon();
          this.renderDrawings();
        }
      }
    );
    modal.open();
  }
  finishPolylineDrawing() {
    var _a2, _b2;
    if (!this.drawingMode || this.drawingMode !== "polyline") return;
    if (!this.data) return;
    if (this.drawPolygonPoints.length < 2) return;
    const layerId = (_a2 = this.drawingActiveLayerId) != null ? _a2 : this.getOrCreateDefaultDrawLayer().id;
    const points = [...this.drawPolygonPoints];
    const draft = {
      id: generateId("draw"),
      layerId,
      kind: "polyline",
      visible: true,
      polyline: points,
      style: {
        strokeColor: "#ff0000",
        strokeWidth: 2,
        arrowEnd: true,
        distanceLabel: false
      }
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
      (_b2 = this.data.drawLayers) != null ? _b2 : [],
      (res) => {
        var _a3, _b3;
        if (!this.data) return;
        if (res.action === "save" && res.drawing) {
          (_b3 = (_a3 = this.data).drawings) != null ? _b3 : _a3.drawings = [];
          this.data.drawings.push(res.drawing);
          void this.saveDataSoon();
          this.renderDrawings();
        }
      }
    );
    modal.open();
  }
  updateDrawPreview(e) {
    if (!this.drawingMode) return false;
    if (!this.drawDraftLayer) return false;
    const doc = this.getOwnerDocument();
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
      const x2 = Math.min(x0, x1);
      const y = Math.min(y0, y1);
      const w = Math.abs(x0 - x1);
      const h = Math.abs(y0 - y1);
      const r = doc.createElementNS("http://www.w3.org/2000/svg", "rect");
      r.setAttribute("x", String(x2));
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
      const c = doc.createElementNS("http://www.w3.org/2000/svg", "circle");
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
      const path = doc.createElementNS("http://www.w3.org/2000/svg", "path");
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
      const path = doc.createElementNS("http://www.w3.org/2000/svg", "path");
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
  saveMeasurementAsPolyline() {
    var _a2, _b2, _c;
    if (!this.plugin.settings.enableDrawing) return;
    if (!this.data) return;
    if (this.measurePts.length < 2) {
      new import_obsidian21.Notice("No measurement to save (need at least 2 points).", 2500);
      return;
    }
    const layerId = this.getOrCreateDefaultDrawLayer().id;
    const points = this.measurePts.map((p) => ({ x: p.x, y: p.y }));
    const draft = {
      id: generateId("draw"),
      layerId,
      kind: "polyline",
      visible: true,
      polyline: points,
      style: {
        strokeColor: (_a2 = this.plugin.settings.measureLineColor) != null ? _a2 : "#ff0000",
        strokeWidth: (_b2 = this.plugin.settings.measureLineWidth) != null ? _b2 : 2,
        arrowEnd: true,
        distanceLabel: true
      }
    };
    new DrawingEditorModal(
      this.app,
      draft,
      (_c = this.data.drawLayers) != null ? _c : [],
      (res) => {
        var _a3, _b3;
        if (!this.data) return;
        if (res.action === "save" && res.drawing) {
          (_b3 = (_a3 = this.data).drawings) != null ? _b3 : _a3.drawings = [];
          this.data.drawings.push(res.drawing);
          void this.saveDataSoon();
          this.renderDrawings();
          new import_obsidian21.Notice("Saved as polyline.", 1200);
        }
      }
    ).open();
  }
  renderAll() {
    this.worldEl.style.width = `${this.imgW}px`;
    this.worldEl.style.height = `${this.imgH}px`;
    this.overlaysEl.style.width = `${this.imgW}px`;
    this.overlaysEl.style.height = `${this.imgH}px`;
    this.gridEl.style.width = `${this.imgW}px`;
    this.gridEl.style.height = `${this.imgH}px`;
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
    if (this.drawHitboxesEl) {
      this.drawHitboxesEl.style.width = `${this.imgW}px`;
      this.drawHitboxesEl.style.height = `${this.imgH}px`;
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
    this.renderGrids();
    this.markersEl.empty();
    this.renderMarkersOnly();
    this.renderMeasure();
    this.renderDrawingEditHandles();
    this.renderCalibrate();
    this.updateZoomControlsVisibility();
    this.renderDrawings();
    if (this.isCanvas()) this.renderCanvas();
    this.renderTextLayers();
  }
  renderMarkersOnly() {
    var _a2, _b2, _c, _d, _e, _f, _g;
    if (!this.data) return;
    const s = this.scale;
    this.markersEl.empty();
    if (this.hudMarkersEl) this.hudMarkersEl.empty();
    const visibleLayers = new Set(
      this.data.layers.filter((l) => l.visible).map((l) => l.id)
    );
    const isPlayerView = this.isSecondScreenPlayerView();
    const isControllerView = this.isSecondScreenControllerView();
    const revealedMarkerIds = this.getRevealedMarkerIdSet();
    const rank = (m) => m.type === "sticker" ? 0 : 1;
    const toRender = this.data.markers.filter((m) => visibleLayers.has(m.layer)).filter((m) => {
      if (!isPlayerView) return true;
      return revealedMarkerIds.has(m.id);
    }).sort((a, b) => rank(a) - rank(b));
    const applyIconStyles = (imgEl, info) => {
      if (info.rotationDeg) imgEl.style.transform = `rotate(${info.rotationDeg}deg)`;
      else imgEl.style.removeProperty("transform");
      if (info.shadowFilter) imgEl.style.filter = info.shadowFilter;
      else imgEl.style.removeProperty("filter");
    };
    const vpRect = this.viewportEl.getBoundingClientRect();
    const vw = vpRect.width || 1;
    const vh = vpRect.height || 1;
    for (const m of toRender) {
      const isHud = m.anchorSpace === "viewport";
      const container = isHud ? this.hudMarkersEl : this.markersEl;
      if (!container) continue;
      let leftScreen;
      let topScreen;
      if (isHud) {
        const hx = (_b2 = m.hudX) != null ? _b2 : ((_a2 = m.x) != null ? _a2 : 0.5) * vw;
        const hy = (_d = m.hudY) != null ? _d : ((_c = m.y) != null ? _c : 0.5) * vh;
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
        const visibleByZoom = (minZ === void 0 || Number.isFinite(minZ) && s >= minZ) && (maxZ === void 0 || Number.isFinite(maxZ) && s <= maxZ);
        if (!visibleByZoom) host.classList.add("zm-hidden");
      }
      if (this.isLayerLocked(m.layer)) host.classList.add("zm-marker--locked");
      if (isControllerView && !revealedMarkerIds.has(m.id)) {
        host.classList.add("zm-marker--player-hidden");
      }
      let icon;
      if (m.type === "sticker") {
        const size = Math.max(1, Math.round((_e = m.stickerSize) != null ? _e : 64));
        const anch = host.createDiv({ cls: "zm-marker-anchor" });
        anch.style.transform = `translate(${-size / 2}px, ${-size / 2}px)`;
        icon = anch.createEl("img", { cls: "zm-marker-icon" });
        icon.src = this.resolveResourceUrl((_f = m.stickerPath) != null ? _f : "");
        icon.style.width = `${size}px`;
        icon.draggable = false;
        anch.appendChild(icon);
      } else {
        const scaleLike = isScaleLikeSticker(m);
        let effectiveKey = m.iconKey;
        if (m.type === "swap") {
          const frame = this.getSwapFrameForMarker(m);
          if (frame == null ? void 0 : frame.iconKey) {
            effectiveKey = frame.iconKey;
          }
        }
        const info = this.getIconInfo(effectiveKey, m.sizeOverride);
        let imgUrl = info.imgUrl;
        const markerColor = (_g = m.iconColor) == null ? void 0 : _g.trim();
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
          applyIconStyles(icon, info);
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
          applyIconStyles(icon, info);
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
          applyIconStyles(icon, info);
          if (info.rotationDeg) {
            icon.style.transform = `rotate(${info.rotationDeg}deg)`;
          }
          anch.appendChild(icon);
        }
      }
      if (m.type !== "sticker" && !!m.tooltipLabelAlways && typeof m.tooltip === "string" && m.tooltip.trim().length > 0) {
        const effectiveKey = (() => {
          var _a3;
          if (m.type === "swap") {
            const fr = this.getSwapFrameForMarker(m);
            if (fr == null ? void 0 : fr.iconKey) return fr.iconKey;
          }
          return (_a3 = m.iconKey) != null ? _a3 : this.plugin.settings.defaultIconKey;
        })();
        const info = this.getIconInfo(effectiveKey, m.sizeOverride);
        const scaleLike = isScaleLikeSticker(m);
        const pos = m.tooltipLabelPosition === "above" ? "above" : "below";
        const gap = 6;
        const offX = typeof m.tooltipLabelOffsetX === "number" && Number.isFinite(m.tooltipLabelOffsetX) ? m.tooltipLabelOffsetX : 0;
        const offY = typeof m.tooltipLabelOffsetY === "number" && Number.isFinite(m.tooltipLabelOffsetY) ? m.tooltipLabelOffsetY : 0;
        const xOff = info.size / 2 - info.anchorX + offX;
        const yOffBase = pos === "above" ? -(info.anchorY + gap) : info.size - info.anchorY + gap;
        const yOff = yOffBase + offY;
        let parent = host;
        if (!isHud && !scaleLike) {
          const invScale = this.cfg.responsive ? 1 : 1 / s;
          let inv = host.querySelector(".zm-marker-inv");
          if (!inv) {
            inv = host.createDiv({ cls: "zm-marker-inv zm-marker-inv--label" });
            inv.style.transform = `scale(${invScale})`;
          }
          parent = inv;
        }
        const label = parent.createDiv({ cls: "zm-marker-label" });
        label.textContent = m.tooltip.trim();
        label.style.left = `${xOff}px`;
        label.style.top = `${yOff}px`;
        label.style.transform = pos === "above" ? "translate(-50%, -100%)" : "translate(-50%, 0)";
      }
      if (!this.cfg.displayOnly) {
        if (m.type !== "sticker") {
          host.addEventListener(
            "mouseenter",
            (ev) => this.onMarkerEnter(ev, m, host)
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
        host.addEventListener("mousedown", (ev) => {
          if (ev.button !== 1) return;
          if (!this.plugin.settings.middleClickOpensLinkInNewTab) return;
          if (this.measuring || this.calibrating) return;
          if (m.type === "sticker") return;
          ev.preventDefault();
          ev.stopPropagation();
        });
        host.addEventListener("auxclick", (ev) => {
          if (ev.button !== 1) return;
          if (!this.plugin.settings.middleClickOpensLinkInNewTab) return;
          if (this.measuring || this.calibrating) return;
          ev.preventDefault();
          ev.stopPropagation();
          if (this.suppressClickMarkerId === m.id || this.dragMoved) return;
          if (m.type === "sticker") return;
          this.openMarkerLink(m, { newTab: true });
        });
        host.addEventListener("pointerdown", (e) => {
          var _a3;
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
              dy: vy - topScreen
            };
          } else {
            const wxPointer = (vx - this.tx) / this.scale;
            const wyPointer = (vy - this.ty) / this.scale;
            const markerWx = m.x * this.imgW;
            const markerWy = m.y * this.imgH;
            this.dragAnchorOffset = {
              dx: wxPointer - markerWx,
              dy: wyPointer - markerWy
            };
          }
          host.classList.add("zm-marker--dragging");
          this.getOwnerBody().classList.add("zm-cursor-grabbing");
          (_a3 = host.setPointerCapture) == null ? void 0 : _a3.call(host, e.pointerId);
          e.preventDefault();
        });
        host.addEventListener("pointerup", () => {
          if (this.draggingMarkerId === m.id) {
            host.classList.remove("zm-marker--dragging");
            this.getOwnerBody().classList.remove("zm-cursor-grabbing");
          }
        });
        host.addEventListener("contextmenu", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          if (this.measuring || this.calibrating) {
            this.openMeasureOnlyContextMenu(ev.clientX, ev.clientY);
            return;
          }
          this.closeMenu();
          if (m.type === "switch") {
            if (!ev.altKey) {
              void this.applySwitchPin(m);
              return;
            }
            const items2 = this.applyPlayerRevealItems([
              {
                label: "Switch base now",
                action: () => {
                  this.closeMenu();
                  void this.applySwitchPin(m);
                }
              },
              {
                label: "Edit switch pin\u2026",
                action: () => {
                  var _a3;
                  this.closeMenu();
                  if (!this.data) return;
                  const bases = this.getBasesNormalized();
                  if (!bases.length) {
                    new import_obsidian21.Notice("No base images configured.", 2500);
                    return;
                  }
                  this.openSwitchPinModal(
                    {
                      basePaths: bases,
                      initialIconKey: ((_a3 = m.iconKey) != null ? _a3 : this.plugin.settings.defaultIconKey).trim() || this.plugin.settings.defaultIconKey,
                      initialRotate: !!m.switchRotate || !(typeof m.switchBase === "string" && m.switchBase.trim().length > 0),
                      initialSwitchBase: m.switchBase,
                      initialScaleLikeSticker: !!m.scaleLikeSticker,
                      initialHud: m.anchorSpace === "viewport"
                    },
                    (res) => {
                      var _a4, _b3, _c2;
                      if (!this.data) return;
                      if (res.action !== "save" || !res.value) return;
                      m.iconKey = res.value.iconKey;
                      if (res.value.rotate) {
                        m.switchRotate = true;
                        delete m.switchBase;
                      } else {
                        delete m.switchRotate;
                        m.switchBase = ((_a4 = res.value.switchBase) != null ? _a4 : "").trim() || void 0;
                      }
                      if (res.value.scaleLikeSticker) m.scaleLikeSticker = true;
                      else delete m.scaleLikeSticker;
                      if (res.value.placeAsHudPin) {
                        if (m.anchorSpace !== "viewport") {
                          m.anchorSpace = "viewport";
                          m.hudX = (_b3 = m.hudX) != null ? _b3 : 0;
                          m.hudY = (_c2 = m.hudY) != null ? _c2 : 0;
                          this.classifyHudMetaFromCurrentPosition(m, this.viewportEl.getBoundingClientRect());
                        }
                      } else {
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
                    }
                  );
                }
              },
              {
                label: "Delete switch pin",
                action: () => {
                  this.closeMenu();
                  this.deleteMarker(m);
                }
              }
            ], m);
            this.openMenu = new ZMMenu(this.el.ownerDocument);
            this.openMenu.open(ev.clientX, ev.clientY, items2);
            return;
          }
          if (m.type === "dice") {
            const items2 = this.applyPlayerRevealItems([
              {
                label: "Roll dice",
                action: () => {
                  this.closeMenu();
                  void this.rollDiceMarker(m);
                }
              },
              {
                label: "Edit dice pin\u2026",
                action: () => {
                  var _a3, _b3;
                  this.closeMenu();
                  if (!this.data) return;
                  new DicePinModal(
                    this.app,
                    this.plugin,
                    {
                      iconKey: ((_a3 = m.iconKey) != null ? _a3 : this.plugin.settings.defaultIconKey).trim(),
                      rolls: (_b3 = m.diceRolls) != null ? _b3 : [{ count: 1, sides: 20 }],
                      scaleLikeSticker: !!m.scaleLikeSticker,
                      placeAsHudPin: m.anchorSpace === "viewport",
                      render3d: !!m.diceRender3d
                    },
                    (res) => {
                      var _a4, _b4, _c2;
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
                      const isHud2 = m.anchorSpace === "viewport";
                      const vpRect2 = this.viewportEl.getBoundingClientRect();
                      if (wantHud && !isHud2) {
                        const pos = this.worldNormToViewportPx(m.x, m.y);
                        m.anchorSpace = "viewport";
                        m.hudX = pos.x;
                        m.hudY = pos.y;
                        this.classifyHudMetaFromCurrentPosition(m, vpRect2);
                      } else if (!wantHud && isHud2) {
                        const hx = typeof m.hudX === "number" ? m.hudX : ((_a4 = m.x) != null ? _a4 : 0.5) * (vpRect2.width || 1);
                        const hy = typeof m.hudY === "number" ? m.hudY : ((_b4 = m.y) != null ? _b4 : 0.5) * (vpRect2.height || 1);
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
                      if (!m.tooltip || m.tooltip.trim() === diceRollsToFormula((_c2 = m.diceRolls) != null ? _c2 : [])) {
                        m.tooltip = diceRollsToFormula(res.value.rolls);
                      }
                      void this.saveDataSoon();
                      this.renderMarkersOnly();
                    }
                  ).open();
                }
              },
              {
                label: "Delete dice pin",
                action: () => {
                  this.closeMenu();
                  this.deleteMarker(m);
                }
              }
            ], m);
            this.openMenu = new ZMMenu(this.el.ownerDocument);
            this.openMenu.open(ev.clientX, ev.clientY, items2);
            return;
          }
          if (m.type === "ping") {
            const items2 = this.applyPlayerRevealItems([
              {
                label: "Open party note",
                action: () => {
                  this.closeMenu();
                  this.openMarkerLink(m);
                }
              },
              {
                label: "Recalculate party",
                action: () => {
                  this.closeMenu();
                  void this.updatePingNoteForMarker(m).then(() => {
                    new import_obsidian21.Notice("Party note updated.", 1200);
                  });
                }
              },
              {
                label: "Delete party pin",
                action: () => {
                  this.closeMenu();
                  this.deleteMarker(m);
                }
              }
            ], m);
            this.openMenu = new ZMMenu(this.el.ownerDocument);
            this.openMenu.open(ev.clientX, ev.clientY, items2);
            return;
          }
          if (m.type === "swap") {
            const preset = m.swapKey ? this.findSwapPresetById(m.swapKey) : void 0;
            if (!preset) return;
            if (!ev.altKey) {
              this.advanceSwapPin(m);
              void this.saveDataSoon();
              this.renderMarkersOnly();
              return;
            }
            const items2 = this.applyPlayerRevealItems([
              {
                label: "Edit swap pin links\u2026 ",
                action: () => {
                  this.closeMenu();
                  if (!this.data) return;
                  new SwapLinksEditorModal(
                    this.app,
                    this.plugin,
                    m,
                    preset,
                    (res) => {
                      if (res.action !== "save") return;
                      if (!this.data) return;
                      if (res.swapLinks && Object.keys(res.swapLinks).length > 0) {
                        m.swapLinks = res.swapLinks;
                      } else {
                        delete m.swapLinks;
                      }
                      void this.saveDataSoon();
                      this.renderMarkersOnly();
                    }
                  ).open();
                }
              },
              {
                label: "Pin sizes for this map\u2026",
                action: () => {
                  var _a3, _b3;
                  this.closeMenu();
                  const fr = this.getSwapFrameForMarker(m);
                  const key = ((_b3 = (_a3 = fr == null ? void 0 : fr.iconKey) != null ? _a3 : m.iconKey) != null ? _b3 : this.plugin.settings.defaultIconKey).trim();
                  this.openPinSizeEditor(key);
                }
              },
              {
                label: "Edit swap preset\u2026",
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
                      preset.defaultScaleLikeSticker = updated.defaultScaleLikeSticker;
                      preset.hoverPopover = updated.hoverPopover;
                      preset.layerName = updated.layerName;
                      void this.plugin.saveSettings();
                      this.renderMarkersOnly();
                    }
                  ).open();
                }
              },
              {
                label: "Delete swap pin",
                action: () => {
                  this.closeMenu();
                  this.deleteMarker(m);
                }
              }
            ], m);
            this.openMenu = new ZMMenu(this.el.ownerDocument);
            this.openMenu.open(ev.clientX, ev.clientY, items2);
            const doc2 = this.getOwnerDocument();
            const outside2 = (event) => {
              if (!this.openMenu) return;
              const t = event.target;
              if (t instanceof HTMLElement && this.openMenu.contains(t)) return;
              this.closeMenu();
            };
            const keyClose2 = (event) => {
              if (event.key === "Escape") this.closeMenu();
            };
            const rightClickClose2 = () => this.closeMenu();
            doc2.addEventListener("pointerdown", outside2, {
              capture: true
            });
            doc2.addEventListener("contextmenu", rightClickClose2, {
              capture: true
            });
            doc2.addEventListener("keydown", keyClose2, { capture: true });
            this.register(() => {
              doc2.removeEventListener("pointerdown", outside2, true);
              doc2.removeEventListener("contextmenu", rightClickClose2, true);
              doc2.removeEventListener("keydown", keyClose2, true);
            });
            return;
          }
          const items = this.applyPlayerRevealItems([
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
                      if (idx >= 0) this.data.markers[idx] = res.marker;
                      void this.saveDataSoon();
                      this.renderMarkersOnly();
                    } else if (res.action === "delete") {
                      this.deleteMarker(m);
                    }
                  }
                );
                this.closeMenu();
                modal.open();
              }
            },
            {
              label: m.type === "sticker" ? "Delete sticker" : "Delete marker",
              action: () => {
                this.deleteMarker(m);
                this.closeMenu();
              }
            }
          ], m);
          if (m.type !== "sticker") {
            items.push({
              label: "Pin sizes for this map\u2026",
              action: () => {
                var _a3;
                const key = (_a3 = m.iconKey) != null ? _a3 : this.plugin.settings.defaultIconKey;
                this.openPinSizeEditor(key);
                this.closeMenu();
              }
            });
          }
          this.openMenu = new ZMMenu(this.el.ownerDocument);
          this.openMenu.open(ev.clientX, ev.clientY, items);
          const doc = this.getOwnerDocument();
          const outside = (event) => {
            if (!this.openMenu) return;
            const t = event.target;
            if (t instanceof HTMLElement && this.openMenu.contains(t))
              return;
            this.closeMenu();
          };
          const keyClose = (event) => {
            if (event.key === "Escape") this.closeMenu();
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
        });
      }
    }
  }
  buildPlayerRevealMenuItems(m) {
    if (!this.isSecondScreenControllerView()) return [];
    if (!this.data) return [];
    const revealed = this.getRevealedMarkerIdSet();
    const isRevealed = revealed.has(m.id);
    return [
      {
        label: isRevealed ? "Hide from players" : "Reveal to players",
        action: () => {
          this.toggleMarkerRevealedForPlayers(m.id);
          this.closeMenu();
        }
      }
    ];
  }
  toggleMarkerRevealedForPlayers(markerId) {
    var _a2, _b2, _c;
    if (!this.data) return;
    (_b2 = (_a2 = this.data).secondScreen) != null ? _b2 : _a2.secondScreen = {};
    const current = new Set((_c = this.data.secondScreen.revealedMarkerIds) != null ? _c : []);
    if (current.has(markerId)) current.delete(markerId);
    else current.add(markerId);
    this.data.secondScreen.revealedMarkerIds = [...current].sort();
    void this.saveDataSoon();
    this.renderMarkersOnly();
  }
  applyPlayerRevealItems(items, m) {
    const reveal = this.buildPlayerRevealMenuItems(m);
    if (!reveal.length) return items;
    return [
      ...reveal,
      { type: "separator" },
      ...items
    ];
  }
  onMarkerEnter(ev, m, hostEl) {
    if (m.type === "sticker") return;
    if (this.measuring || this.calibrating) return;
    let link;
    let hoverOverride = false;
    if (m.type === "swap") {
      link = this.getSwapEffectiveLink(m);
      if (m.swapKey) {
        const preset = this.findSwapPresetById(m.swapKey);
        hoverOverride = !!(preset == null ? void 0 : preset.hoverPopover);
      }
    } else {
      link = m.link;
    }
    const hasTooltipText = !!m.tooltip && m.tooltip.trim().length > 0;
    const wantLinkNameTooltip = !!this.plugin.settings.showLinkFileNameInTooltip && !!link;
    const wantInternalTooltip = hasTooltipText && (!!m.tooltipAlwaysOn || !link) || wantLinkNameTooltip;
    if (link) {
      const workspace = this.app.workspace;
      const forcePopover = this.plugin.settings.forcePopoverWithoutModKey === true || hoverOverride === true;
      this.applyGlobalHoverPopoverStyleVars();
      const eventForPopover = forcePopover ? new MouseEvent("mousemove", {
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
        linktext: link,
        sourcePath: this.cfg.sourcePath
      });
      if (wantInternalTooltip) {
        const title = wantLinkNameTooltip ? this.getLinkDisplayName(link) : void 0;
        this.showInternalTooltip(ev, m, { title });
      }
      return;
    }
    if (wantInternalTooltip) {
      this.showInternalTooltip(ev, m);
    }
  }
  getLinkDisplayName(link) {
    var _a2;
    const f = this.resolveTFile(link, this.cfg.sourcePath);
    if (f) return f.basename;
    const raw = (_a2 = (link != null ? link : "").split("#")[0]) != null ? _a2 : "";
    return basename(raw);
  }
  showInternalTooltip(ev, m, opts) {
    var _a2, _b2, _c, _d;
    if (!this.ready) return;
    const text = ((_a2 = m.tooltip) != null ? _a2 : "").trim();
    const title = ((_b2 = opts == null ? void 0 : opts.title) != null ? _b2 : "").trim();
    if (!text && !title) return;
    if (!this.tooltipEl) {
      this.tooltipEl = this.hudClipEl.createDiv({ cls: "zm-tooltip" });
      this.tooltipEl.addEventListener(
        "mouseenter",
        () => this.cancelHideTooltip()
      );
      this.tooltipEl.addEventListener(
        "mouseleave",
        () => this.hideTooltipSoon()
      );
    }
    this.tooltipEl.style.maxWidth = `${(_c = this.plugin.settings.hoverMaxWidth) != null ? _c : 360}px`;
    this.tooltipEl.style.maxHeight = `${(_d = this.plugin.settings.hoverMaxHeight) != null ? _d : 260}px`;
    this.cancelHideTooltip();
    this.tooltipEl.empty();
    if (title) this.tooltipEl.createEl("div", { cls: "zm-tooltip__title", text: title });
    if (text) this.tooltipEl.createEl("div", { cls: "zm-tooltip__body", text });
    this.positionTooltip(ev.clientX, ev.clientY);
    this.tooltipEl.classList.add("zm-tooltip-visible");
  }
  positionTooltip(clientX, clientY) {
    if (!this.tooltipEl) return;
    const pad = 12;
    const vpRect = this.hudClipEl.getBoundingClientRect();
    let x2 = clientX - vpRect.left + pad;
    let y = clientY - vpRect.top + pad;
    const rect = this.tooltipEl.getBoundingClientRect();
    const vw = vpRect.width;
    const vh = vpRect.height;
    if (x2 + rect.width > vw) x2 = clientX - vpRect.left - rect.width - pad;
    if (x2 < 0) x2 = pad;
    if (y + rect.height > vh) y = clientY - vpRect.top - rect.height - pad;
    if (y < 0) y = pad;
    setCssProps(this.tooltipEl, { left: `${x2}px`, top: `${y}px` });
  }
  hideTooltipSoon(delay = 150) {
    if (!this.tooltipEl) return;
    this.cancelHideTooltip();
    this.tooltipHideTimer = window.setTimeout(() => {
      var _a2;
      (_a2 = this.tooltipEl) == null ? void 0 : _a2.classList.remove("zm-tooltip-visible");
    }, delay);
  }
  cancelHideTooltip() {
    if (this.tooltipHideTimer !== null) {
      window.clearTimeout(this.tooltipHideTimer);
      this.tooltipHideTimer = null;
    }
  }
  getIconInfo(iconKey, sizeOverride) {
    var _a2, _b2, _c, _d, _e;
    const key = iconKey != null ? iconKey : this.plugin.settings.defaultIconKey;
    const profile = (_a2 = this.plugin.settings.icons.find((i2) => i2.key === key)) != null ? _a2 : this.plugin.builtinIcon();
    const baseSize = profile.size;
    const overrideSize = typeof sizeOverride === "number" && Number.isFinite(sizeOverride) && sizeOverride > 0 ? Math.round(sizeOverride) : (_c = (_b2 = this.data) == null ? void 0 : _b2.pinSizeOverrides) == null ? void 0 : _c[key];
    const size = overrideSize && Number.isFinite(overrideSize) && overrideSize > 0 ? overrideSize : baseSize;
    const imgUrl = this.resolveResourceUrl(profile.pathOrDataUrl);
    const rotationDeg = (_d = profile.rotationDeg) != null ? _d : 0;
    const shadowFilter = profile.shadowEnabled ? `drop-shadow(${Number.isFinite(profile.shadowOffsetXPx) ? profile.shadowOffsetXPx : 2}px ${Number.isFinite(profile.shadowOffsetYPx) ? profile.shadowOffsetYPx : 2}px ${Number.isFinite(profile.shadowBlurPx) ? Math.max(0, profile.shadowBlurPx) : 6}px ${((_e = profile.shadowColor) != null ? _e : "#000000").trim() || "#000000"})` : "";
    return {
      imgUrl,
      size,
      anchorX: profile.anchorX,
      anchorY: profile.anchorY,
      rotationDeg,
      shadowFilter
    };
  }
  getIconDefaultLink(iconKey) {
    const key = iconKey != null ? iconKey : this.plugin.settings.defaultIconKey;
    const icon = this.plugin.settings.icons.find((i2) => i2.key === key);
    const raw = icon == null ? void 0 : icon.defaultLink;
    if (!raw) return void 0;
    const trimmed = raw.trim();
    return trimmed.length ? trimmed : void 0;
  }
  classifyHudMetaFromCurrentPosition(m, vpRect) {
    var _a2, _b2;
    const W = vpRect.width || 1;
    const H = vpRect.height || 1;
    const centerX = W / 2;
    const centerY = H / 2;
    const eps = 1;
    let hudX = (_a2 = m.hudX) != null ? _a2 : 0;
    let hudY = (_b2 = m.hudY) != null ? _b2 : 0;
    let modeX;
    if (Math.abs(hudX - centerX) <= eps) {
      modeX = "center";
      hudX = centerX;
    } else if (hudX > centerX) {
      modeX = "right";
    } else {
      modeX = "left";
    }
    let modeY;
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
  updateHudPinsForResize(vpRect) {
    var _a2, _b2, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
    if (!this.data) return;
    const W = vpRect.width || 1;
    const H = vpRect.height || 1;
    const centerX = W / 2;
    const centerY = H / 2;
    for (const m of this.data.markers) {
      if (m.anchorSpace !== "viewport") continue;
      if (!Number.isFinite((_a2 = m.hudLastWidth) != null ? _a2 : NaN) || !Number.isFinite((_b2 = m.hudLastHeight) != null ? _b2 : NaN)) {
        if (typeof m.hudX !== "number" || typeof m.hudY !== "number") {
          const approxX = ((_c = m.x) != null ? _c : 0.5) * W;
          const approxY = ((_d = m.y) != null ? _d : 0.5) * H;
          m.hudX = approxX;
          m.hudY = approxY;
        }
        this.classifyHudMetaFromCurrentPosition(m, vpRect);
        continue;
      }
      const lastW = (_e = m.hudLastWidth) != null ? _e : W;
      const lastH = (_f = m.hudLastHeight) != null ? _f : H;
      const dW = W - lastW;
      const dH = H - lastH;
      let hudX = (_h = m.hudX) != null ? _h : ((_g = m.x) != null ? _g : 0.5) * W;
      let hudY = (_j = m.hudY) != null ? _j : ((_i = m.y) != null ? _i : 0.5) * H;
      const modeX = (_k = m.hudModeX) != null ? _k : "center";
      if (modeX === "left") {
      } else if (modeX === "right") {
        hudX += dW;
        if (hudX <= centerX) {
          hudX = centerX;
          m.hudModeX = "center";
        }
      } else {
        hudX = centerX;
      }
      const modeY = (_l = m.hudModeY) != null ? _l : "center";
      if (modeY === "top") {
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
  openMarkerLink(m, opts) {
    var _a2;
    const link = (_a2 = this.getSwapEffectiveLink(m)) == null ? void 0 : _a2.trim();
    if (!link) return;
    if (opts == null ? void 0 : opts.newTab) {
      this.openLinkInNewTab(link);
      return;
    }
    void this.app.workspace.openLinkText(link, this.cfg.sourcePath);
  }
  async setActiveBase(path) {
    if (!this.data) return;
    if (this.currentBasePath === path && this.imgW > 0 && this.imgH > 0) return;
    this.updateSvgBaseFlag(path);
    this.data.activeBase = path;
    if (this.isCanvas()) {
      await this.loadBaseSourceByPath(path);
    } else {
      const file = this.resolveTFile(path, this.cfg.sourcePath);
      if (!file) {
        new import_obsidian21.Notice(`Base image not found: ${path}`);
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
    if (this.cfg.responsive) this.updateResponsiveAspectRatio();
    this.renderAll();
    if (this.cfg.responsive) this.fitToView();
    else this.applyTransform(this.scale, this.tx, this.ty);
    await this.applyBoundBaseVisibility();
    void this.saveDataSoon();
    this.persistSecondScreenViewSoon();
    if (!this.isCanvas()) this.updateOverlaySizes();
    else this.renderCanvas();
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
    var _a2;
    if (this.isCanvas()) return;
    this.overlayMap.clear();
    this.overlaysEl.empty();
    if (!this.data) return;
    for (const o of (_a2 = this.data.overlays) != null ? _a2 : []) {
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
  updateOverlaySizes() {
    if (this.isCanvas()) return;
    this.overlaysEl.style.width = `${this.imgW}px`;
    this.overlaysEl.style.height = `${this.imgH}px`;
  }
  async updateOverlayVisibility() {
    var _a2;
    if (!this.data) return;
    if (this.isCanvas()) {
      await this.ensureVisibleOverlaysLoaded();
      this.renderCanvas();
      return;
    }
    for (const o of (_a2 = this.data.overlays) != null ? _a2 : []) {
      const el = this.overlayMap.get(o.path);
      if (!el) continue;
      if (o.visible) el.classList.remove("zm-overlay-hidden");
      else el.classList.add("zm-overlay-hidden");
    }
  }
  async reloadMarkers() {
    try {
      const loaded = await this.store.load();
      this.data = loaded;
      if (!this.ready) return;
      await this.applyActiveBaseAndOverlays();
      this.renderMarkersOnly();
      this.renderGrids();
      this.renderMeasure();
      this.renderCalibrate();
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      new import_obsidian21.Notice(`Failed to reload markers: ${message}`);
      return;
    }
    if (this.isSecondScreenPlayerView()) {
      this.applySecondScreenViewFromData();
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
      const ownerWindow = this.getOwnerWindow();
      ownerWindow.removeEventListener("pointermove", onMove);
      ownerWindow.removeEventListener("pointerup", onUp, true);
      this.getOwnerBody().classList.remove("zm-cursor-resize-nwse", "zm-cursor-resize-nesw");
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
      const ownerWindow = this.getOwnerWindow();
      if (side === "right") this.getOwnerBody().classList.add("zm-cursor-resize-nwse");
      else this.getOwnerBody().classList.add("zm-cursor-resize-nesw");
      this.userResizing = true;
      ownerWindow.addEventListener("pointermove", onMove);
      ownerWindow.addEventListener("pointerup", onUp, true);
    });
  }
  shouldUseSavedFrame() {
    var _a2, _b2;
    return !!this.cfg.resizable && !(((_a2 = this.cfg.widthFromYaml) != null ? _a2 : false) || ((_b2 = this.cfg.heightFromYaml) != null ? _b2 : false)) && !this.cfg.responsive;
  }
  isFrameVisibleEnough(minPx = 48) {
    var _a2;
    if (!((_a2 = this.el) == null ? void 0 : _a2.isConnected)) return false;
    if (this.el.offsetParent === null) return false;
    const rect = this.el.getBoundingClientRect();
    return rect.width >= minPx && rect.height >= minPx;
  }
  requestPersistFrame(delay = 500) {
    if (this.frameSaveTimer) window.clearTimeout(this.frameSaveTimer);
    this.frameSaveTimer = window.setTimeout(() => {
      this.frameSaveTimer = null;
      void this.persistFrameNow();
    }, delay);
  }
  persistFrameNow() {
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
    if (w !== (prev == null ? void 0 : prev.w) || h !== (prev == null ? void 0 : prev.h)) {
      this.data.frame = { w, h };
      void this.saveDataSoon();
    }
  }
  applyMeasureStyle() {
    var _a2, _b2;
    const color = ((_a2 = this.plugin.settings.measureLineColor) != null ? _a2 : "var(--text-accent)").trim();
    const widthPx = Math.max(1, (_b2 = this.plugin.settings.measureLineWidth) != null ? _b2 : 2);
    setCssProps(this.el, {
      "--zm-measure-color": color,
      "--zm-measure-width": `${widthPx}px`
    });
  }
  showZoomHud() {
    if (!this.zoomHud) return;
    const percent = Math.round(this.scale * 100);
    this.zoomHud.textContent = `Zoom: ${percent}%`;
    this.zoomHud.classList.add("zm-zoom-hud-visible");
    if (this.zoomHudTimer !== null) {
      window.clearTimeout(this.zoomHudTimer);
    }
    this.zoomHudTimer = window.setTimeout(() => {
      var _a2;
      (_a2 = this.zoomHud) == null ? void 0 : _a2.classList.remove("zm-zoom-hud-visible");
      this.zoomHudTimer = null;
    }, 1e3);
  }
  requestPanFrame() {
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
  async applyYamlOnFirstLoad() {
    var _a2, _b2;
    if (this.yamlAppliedOnce) return;
    this.yamlAppliedOnce = true;
    const yb = (_a2 = this.cfg.yamlBases) != null ? _a2 : [];
    const yo = (_b2 = this.cfg.yamlOverlays) != null ? _b2 : [];
    const overlaysProvided = await this.isYamlKeyPresent("imageOverlays");
    if (yb.length === 0 && yo.length === 0 && !overlaysProvided) return;
    const changed = this.syncYamlLayers(yb, yo, void 0, overlaysProvided);
    if (changed && this.data && await this.store.wouldChange(this.data)) {
      this.ignoreNextModify = true;
      await this.store.save(this.data);
    }
  }
  async isYamlKeyPresent(key) {
    try {
      const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
      if (!(af instanceof import_obsidian21.TFile)) return false;
      const text = await this.app.vault.read(af);
      const lines = text.split("\n");
      const blk = this.findZoommapBlockForThisMap(lines);
      if (!blk) return false;
      const keyLower = key.toLowerCase();
      return lines.slice(blk.start + 1, blk.end).some((ln2) => stripQuotePrefix(ln2).trimStart().toLowerCase().startsWith(`${keyLower}:`));
    } catch (e) {
      return false;
    }
  }
  async replaceYamlScalarIfEquals(key, oldValue, newValue) {
    const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
    if (!(af instanceof import_obsidian21.TFile)) return false;
    let foundBlock = false;
    const stripQuotes = (s) => {
      const t = s.trim();
      if (t.startsWith('"') && t.endsWith('"') || t.startsWith("'") && t.endsWith("'")) {
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
      const out = content.map((ln2) => {
        var _a2, _b2;
        const info = splitQuotePrefix(ln2);
        const m = keyRe.exec(info.rest);
        if (!m) return ln2;
        const indent = (_a2 = m[1]) != null ? _a2 : "";
        const rhs = (_b2 = m[2]) != null ? _b2 : "";
        const val = stripQuotes(rhs);
        if (val === oldValue) {
          changed = true;
          return `${info.prefix}${indent}image: ${JSON.stringify(newValue)}`;
        }
        return ln2;
      });
      if (!changed) return text;
      if (af.path === this.store.getPath()) {
        this.ignoreNextModify = true;
      }
      return [
        ...lines.slice(0, blk.start + 1),
        ...out,
        ...lines.slice(blk.end)
      ].join("\n");
    });
    return foundBlock;
  }
  syncYamlLayers(yamlBases, yamlOverlays, yamlImage, overlaysProvided = false) {
    var _a2;
    if (!this.data) return false;
    let changed = false;
    if (yamlBases && yamlBases.length > 0) {
      const prevActive = this.getActiveBasePath();
      const newBases = yamlBases.map((b) => ({ path: b.path, name: b.name }));
      const newPaths = new Set(newBases.map((b) => b.path));
      let newActive = prevActive;
      if (yamlImage && newPaths.has(yamlImage)) newActive = yamlImage;
      if (!newPaths.has(newActive)) newActive = newBases[0].path;
      this.data.bases = newBases;
      this.data.activeBase = newActive;
      changed = true;
    }
    if (overlaysProvided || yamlOverlays && yamlOverlays.length > 0) {
      const prev = new Map(((_a2 = this.data.overlays) != null ? _a2 : []).map((o) => [o.path, o]));
      const next = (yamlOverlays != null ? yamlOverlays : []).map((o) => {
        var _a3, _b2;
        return {
          path: o.path,
          name: o.name,
          visible: typeof o.visible === "boolean" ? o.visible : (_b2 = (_a3 = prev.get(o.path)) == null ? void 0 : _a3.visible) != null ? _b2 : false
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
    this.schedulePingUpdate();
  }
  promptAddLayer(kind) {
    new ImageFileSuggestModal(this.app, (file) => {
      const base = file.name.replace(/\.[^.]+$/, "");
      const title = kind === "base" ? "Name for base layer" : "Name for overlay";
      new NamePromptModal(this.app, title, base, (name) => {
        if (kind === "base") void this.addBaseByPath(file.path, name);
        else void this.addOverlayByPath(file.path, name);
      }).open();
    }).open();
  }
  async addBaseByPath(path, name) {
    var _a2;
    if (!this.data) return;
    const exists = this.getBasesNormalized().some((b) => b.path === path);
    if (exists) {
      new import_obsidian21.Notice("Base already exists.", 1500);
      return;
    }
    this.data.bases = (_a2 = this.data.bases) != null ? _a2 : [];
    this.data.bases.push({ path, name: (name != null ? name : "") || void 0 });
    await this.saveDataSoon();
    void this.appendLayerToYaml("base", path, name != null ? name : "");
    new import_obsidian21.Notice("Base added.", 1200);
  }
  async addOverlayByPath(path, name) {
    var _a2;
    if (!this.data) return;
    this.data.overlays = (_a2 = this.data.overlays) != null ? _a2 : [];
    if (this.data.overlays.some((o) => o.path === path)) {
      new import_obsidian21.Notice("Overlay already exists.", 1500);
      return;
    }
    this.data.overlays.push({ path, name: (name != null ? name : "") || void 0, visible: true });
    await this.saveDataSoon();
    if (this.isCanvas()) {
      await this.ensureOverlayLoaded(path);
      this.renderCanvas();
    } else {
      this.buildOverlayElements();
      this.updateOverlaySizes();
      await this.updateOverlayVisibility();
    }
    void this.appendLayerToYaml("overlay", path, name != null ? name : "");
    new import_obsidian21.Notice("Overlay added.", 1200);
  }
  confirmDeleteBase(path) {
    var _a2, _b2;
    if (!this.data) return;
    const bases = this.getBasesNormalized();
    if (bases.length <= 1) {
      new import_obsidian21.Notice("Cannot delete the last base image.", 2500);
      return;
    }
    const label = (_b2 = (_a2 = bases.find((b) => b.path === path)) == null ? void 0 : _a2.name) != null ? _b2 : basename(path);
    new ConfirmModal(
      this.app,
      "Delete base image",
      `Remove base "${label}" from this map?`,
      () => {
        void this.deleteBaseByPath(path);
      }
    ).open();
  }
  async deleteBaseByPath(path) {
    var _a2, _b2, _c, _d, _e, _f;
    if (!this.data) return;
    const basesBefore = this.getBasesNormalized();
    if (basesBefore.length <= 1) {
      new import_obsidian21.Notice("Cannot delete the last base image.", 2500);
      return;
    }
    const idx = basesBefore.findIndex((b) => b.path === path);
    if (idx < 0) return;
    const wasActive = this.getActiveBasePath() === path;
    this.data.bases = ((_a2 = this.data.bases) != null ? _a2 : []).filter((it) => {
      if (typeof it === "string") return it !== path;
      if (it && typeof it === "object" && "path" in it) {
        const p = it.path;
        return typeof p !== "string" || p !== path;
      }
      return true;
    });
    if ((_b2 = this.data.measurement) == null ? void 0 : _b2.scales) {
      delete this.data.measurement.scales[path];
    }
    for (const l of this.data.layers) {
      if (l.boundBase === path) l.boundBase = void 0;
    }
    let newActive = null;
    if (wasActive) {
      const basesAfter = this.getBasesNormalized();
      const pick = Math.min(idx, basesAfter.length - 1);
      newActive = (_f = (_e = (_c = basesAfter[pick]) == null ? void 0 : _c.path) != null ? _e : (_d = basesAfter[0]) == null ? void 0 : _d.path) != null ? _f : null;
      if (newActive) {
        await this.setActiveBase(newActive);
      }
    } else {
      await this.saveDataSoon();
    }
    await this.removeFromYamlList("imageBases", path);
    if (newActive) {
      await this.replaceYamlScalarIfEquals("image", path, newActive);
    }
    new import_obsidian21.Notice("Base removed.", 1200);
  }
  confirmDeleteOverlay(path) {
    var _a2, _b2;
    if (!this.data) return;
    const o = ((_a2 = this.data.overlays) != null ? _a2 : []).find((x2) => x2.path === path);
    const label = (_b2 = o == null ? void 0 : o.name) != null ? _b2 : basename(path);
    new ConfirmModal(
      this.app,
      "Delete overlay",
      `Remove overlay "${label}" from this map?`,
      () => {
        void this.deleteOverlayByPath(path);
      }
    ).open();
  }
  async deleteOverlayByPath(path) {
    var _a2, _b2, _c;
    if (!this.data) return;
    const prevCount = ((_a2 = this.data.overlays) != null ? _a2 : []).length;
    this.data.overlays = ((_b2 = this.data.overlays) != null ? _b2 : []).filter((o) => o.path !== path);
    if (((_c = this.data.overlays) != null ? _c : []).length === prevCount) return;
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
    new import_obsidian21.Notice("Overlay removed.", 1200);
  }
  async appendLayerToYaml(kind, path, name) {
    try {
      const key = kind === "base" ? "imageBases" : "imageOverlays";
      const ok = await this.updateYamlList(key, path, { name });
      if (!ok) new import_obsidian21.Notice("Added, but YAML could not be updated.", 2500);
    } catch (err2) {
      console.error("Zoom Map: failed to update YAML", err2);
      new import_obsidian21.Notice("Added, but YAML update failed.", 2500);
    }
  }
  async updateYamlList(key, newPath, opts) {
    const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
    if (!(af instanceof import_obsidian21.TFile)) return false;
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
        ...lines.slice(blk.end)
      ].join("\n");
    });
    return foundBlock;
  }
  async removeFromYamlList(key, removePath) {
    const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
    if (!(af instanceof import_obsidian21.TFile)) return false;
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
        ...lines.slice(blk.end)
      ].join("\n");
    });
    return foundBlock;
  }
  patchYamlListRemove(contentLines, key, removePath) {
    var _a2, _b2, _c, _d, _e, _f;
    const out = contentLines.slice();
    const keyRe = new RegExp(`^(\\s*)${key}\\s*:(.*)$`);
    let keyIdx = -1;
    let keyIndent = "";
    let keyPrefix = "";
    for (let i2 = 0; i2 < out.length; i2++) {
      const info = splitQuotePrefix(out[i2]);
      const m = keyRe.exec(info.rest);
      if (m) {
        keyIdx = i2;
        keyIndent = (_a2 = m[1]) != null ? _a2 : "";
        keyPrefix = info.prefix;
        break;
      }
    }
    if (keyIdx < 0) return { changed: false, out };
    const isNextTopLevelKey = (ln2) => {
      var _a3, _b3;
      const rest = stripQuotePrefix(ln2);
      const trimmed = rest.trim();
      if (!trimmed) return false;
      if (trimmed.startsWith("#")) return false;
      const spaces = (_b3 = (_a3 = /^\s*/.exec(rest)) == null ? void 0 : _a3[0].length) != null ? _b3 : 0;
      return spaces <= keyIndent.length && /^[A-Za-z0-9_-]+\s*:/.exec(trimmed) !== null;
    };
    let regionEnd = keyIdx + 1;
    while (regionEnd < out.length && !isNextTopLevelKey(out[regionEnd])) regionEnd++;
    const region = out.slice(keyIdx + 1, regionEnd);
    const stripQuotes = (s) => {
      const t = s.trim();
      if (t.startsWith('"') && t.endsWith('"') || t.startsWith("'") && t.endsWith("'")) {
        return t.slice(1, -1);
      }
      return t;
    };
    const removed = [];
    let changed = false;
    for (let i2 = 0; i2 < region.length; i2++) {
      const line = region[i2];
      const trimmed = line.trimStart();
      if (!trimmed.startsWith("-")) {
        removed.push(line);
        continue;
      }
      const afterDash = trimmed.slice(1).trimStart();
      const objMatch = /^path\s*:\s*(.+)$/.exec(afterDash);
      if (objMatch) {
        const rawVal2 = stripQuotes((_b2 = objMatch[1]) != null ? _b2 : "");
        if (rawVal2 === removePath) {
          changed = true;
          const baseIndent = (_d = (_c = /^\s*/.exec(line)) == null ? void 0 : _c[0].length) != null ? _d : 0;
          let j = i2 + 1;
          while (j < region.length) {
            const next = region[j];
            const nextIndent = (_f = (_e = /^\s*/.exec(next)) == null ? void 0 : _e[0].length) != null ? _f : 0;
            const nextTrim = next.trimStart();
            if (nextTrim.startsWith("-") && nextIndent === baseIndent) break;
            if (nextTrim && nextIndent <= baseIndent) break;
            j++;
          }
          i2 = j - 1;
          continue;
        }
        removed.push(line);
        continue;
      }
      const rawVal = stripQuotes(afterDash);
      if (rawVal === removePath) {
        changed = true;
        continue;
      }
      removed.push(line);
    }
    const nextOut = [
      ...out.slice(0, keyIdx + 1),
      ...removed,
      ...out.slice(regionEnd)
    ];
    const remainingItems = removed.some((ln2) => ln2.trimStart().startsWith("-"));
    if (!remainingItems) {
      nextOut[keyIdx] = `${keyPrefix}${keyIndent}${key}: []`;
    }
    return { changed, out: nextOut };
  }
  findZoommapBlock(lines, approxLine) {
    let result = null;
    for (let i2 = 0; i2 < lines.length; i2++) {
      const ln2 = stripQuotePrefix(lines[i2]).trimStart().toLowerCase();
      if (ln2.startsWith("```zoommap")) {
        let j = i2 + 1;
        while (j < lines.length && !stripQuotePrefix(lines[j]).trimStart().startsWith("```")) j++;
        if (j >= lines.length) break;
        const block = { start: i2, end: j };
        if (typeof approxLine === "number" && i2 <= approxLine && approxLine <= j) return block;
        result != null ? result : result = block;
        i2 = j;
      }
    }
    return result;
  }
  patchYamlList(contentLines, key, path, opts) {
    var _a2, _b2, _c, _d;
    const out = contentLines.slice();
    const keyRe = new RegExp(`^(\\s*)${key}\\s*:(.*)$`);
    let keyIdx = -1;
    let keyIndent = "";
    let after = "";
    let keyPrefix = "";
    for (let i2 = 0; i2 < out.length; i2++) {
      const info = splitQuotePrefix(out[i2]);
      const m = keyRe.exec(info.rest);
      if (m) {
        keyIdx = i2;
        keyIndent = (_a2 = m[1]) != null ? _a2 : "";
        after = ((_b2 = m[2]) != null ? _b2 : "").trim();
        keyPrefix = info.prefix;
        break;
      }
    }
    const jsonQuoted = JSON.stringify(path);
    const nm = (_c = opts == null ? void 0 : opts.name) != null ? _c : "";
    const itemLines = [];
    const itemIndent = `${keyIndent}  `;
    itemLines.push(`${keyPrefix}${itemIndent}- path: ${jsonQuoted}`);
    itemLines.push(`${keyPrefix}${itemIndent}  name: ${JSON.stringify(nm)}`);
    if (keyIdx >= 0) {
      if (/^\[\s*\]$/.exec(after)) out[keyIdx] = `${keyPrefix}${keyIndent}${key}:`;
      let insertAt = keyIdx + 1;
      let scan = keyIdx + 1;
      const isNextTopLevelKey = (ln2) => {
        var _a3, _b3;
        const rest = stripQuotePrefix(ln2);
        const trimmed = rest.trim();
        if (!trimmed) return false;
        if (trimmed.startsWith("#")) return false;
        const spaces = (_b3 = (_a3 = /^\s*/.exec(rest)) == null ? void 0 : _a3[0].length) != null ? _b3 : 0;
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
    const blockPrefix = (_d = out.map((ln2) => splitQuotePrefix(ln2).prefix).find((p) => p.length > 0)) != null ? _d : "";
    const defaultIndent = this.detectYamlKeyIndent(out);
    out.push(`${blockPrefix}${defaultIndent}${key}:`);
    const itemIndent2 = `${defaultIndent}  `;
    out.push(`${blockPrefix}${itemIndent2}- path: ${jsonQuoted}`);
    out.push(`${blockPrefix}${itemIndent2}  name: ${JSON.stringify(nm)}`);
    return { changed: true, out };
  }
  detectYamlKeyIndent(lines) {
    var _a2;
    for (const ln2 of lines) {
      const m = /^(\s*)[A-Za-z0-9_-]+\s*:/.exec(stripQuotePrefix(ln2));
      if (m) return (_a2 = m[1]) != null ? _a2 : "";
    }
    return "";
  }
  async renameMarkerLayer(layer, newName) {
    if (!this.data) return;
    const exists = this.data.layers.some((l) => l !== layer && l.name === newName);
    const finalName = exists ? `${newName} (${Math.random().toString(36).slice(2, 4)})` : newName;
    layer.name = finalName;
    await this.saveDataSoon();
    this.renderMarkersOnly();
    new import_obsidian21.Notice("Layer renamed.", 1e3);
  }
  async deleteMarkerLayer(layer, decision) {
    if (!this.data) return;
    const others = this.data.layers.filter((l) => l.id !== layer.id);
    if (others.length === 0) {
      new import_obsidian21.Notice("Cannot delete the last layer.", 2e3);
      return;
    }
    const layerIndex = this.data.layers.findIndex((l) => l.id === layer.id);
    const affectedMarkers = this.data.markers.map((marker, index) => ({ marker, index })).filter((x2) => x2.marker.layer === layer.id);
    this.pushDeleteUndo(
      decision.mode === "move" ? {
        kind: "marker-layer",
        layer: cloneForUndo(layer),
        index: layerIndex,
        mode: "move",
        targetId: decision.targetId,
        movedMarkerIds: affectedMarkers.map((x2) => x2.marker.id)
      } : {
        kind: "marker-layer",
        layer: cloneForUndo(layer),
        index: layerIndex,
        mode: "delete-markers",
        markers: affectedMarkers.map((x2) => ({ marker: cloneForUndo(x2.marker), index: x2.index }))
      },
      `Delete marker layer: ${layer.name}`
    );
    if (decision.mode === "move") {
      const targetId = decision.targetId;
      if (!targetId || targetId === layer.id) {
        new import_obsidian21.Notice("Invalid target layer.", 1500);
        return;
      }
      for (const m of this.data.markers) if (m.layer === layer.id) m.layer = targetId;
    } else {
      const removed = this.data.markers.filter((m) => m.layer === layer.id);
      for (const m of removed) {
        await this.deletePingNoteIfOwned(m);
      }
      this.data.markers = this.data.markers.filter((m) => m.layer !== layer.id);
    }
    this.data.layers = this.data.layers.filter((l) => l.id !== layer.id);
    await this.saveDataSoon();
    this.renderMarkersOnly();
    new import_obsidian21.Notice("Layer deleted.", 1e3);
    this.schedulePingUpdate();
  }
};
var ConfirmModal = class extends import_obsidian21.Modal {
  constructor(app, titleText, messageText, onConfirm, opts) {
    var _a2, _b2;
    super(app);
    this.titleText = titleText;
    this.messageText = messageText;
    this.onConfirm = onConfirm;
    this.confirmText = (_a2 = opts == null ? void 0 : opts.confirmText) != null ? _a2 : "Confirm";
    this.cancelText = (_b2 = opts == null ? void 0 : opts.cancelText) != null ? _b2 : "Cancel";
  }
  onOpen() {
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
  onClose() {
    this.contentEl.empty();
  }
};
var ZMMenu = class {
  constructor(doc) {
    this.submenus = [];
    this.items = [];
    this.doc = doc;
    this.root = this.doc.body.createDiv({ cls: "zm-menu" });
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
    var _a2;
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
        const deg = typeof it.iconRotationDeg === "number" && Number.isFinite(it.iconRotationDeg) ? it.iconRotationDeg : 0;
        if (deg) imgLeft.style.transform = `rotate(${deg}deg)`;
        else imgLeft.style.removeProperty("transform");
        label.appendChild(this.doc.createTextNode(" "));
      }
      label.appendText(it.label);
      const right = row.createDiv({ cls: "zm-menu__right" });
      if ((_a2 = it.children) == null ? void 0 : _a2.length) {
        const arrow = right.createDiv({ cls: "zm-menu__arrow" });
        arrow.setText("\u25B6");
        let submenuEl = null;
        const openSub = () => {
          var _a3;
          if (submenuEl) return;
          submenuEl = this.doc.body.createDiv({ cls: "zm-submenu" });
          this.submenus.push(submenuEl);
          this.buildList(submenuEl, it.children);
          const rect = row.getBoundingClientRect();
          const win = (_a3 = this.doc.defaultView) != null ? _a3 : window;
          const pref = rect.right + 260 < win.innerWidth ? "right" : "left";
          const x2 = pref === "right" ? rect.right : rect.left;
          const y = rect.top;
          this.position(submenuEl, x2, y, pref);
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
          chk.setText(it.checked ? "\u2713" : "");
        }
        if (!it.action) {
          row.classList.add("zm-menu__item--info");
        }
        row.addEventListener("click", () => {
          if (!it.action) return;
          try {
            void Promise.resolve(it.action(row, this)).catch(
              (err2) => console.error("Menu item action failed:", err2)
            );
          } catch (err2) {
            console.error("Menu item action failed:", err2);
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
    var _a2;
    const pad = 6;
    const rect = el.getBoundingClientRect();
    let x2 = clientX;
    let y = clientY;
    const win = (_a2 = this.doc.defaultView) != null ? _a2 : window;
    const vw = win.innerWidth;
    const vh = win.innerHeight;
    if (prefer === "right") {
      if (clientX + rect.width + pad > vw) x2 = Math.max(pad, vw - rect.width - pad);
    } else {
      x2 = clientX - rect.width;
      if (x2 < pad) x2 = pad;
    }
    if (clientY + rect.height + pad > vh) y = Math.max(pad, vh - rect.height - pad);
    el.style.left = `${x2}px`;
    el.style.top = `${y}px`;
  }
};

// src/jsonFileSuggest.ts
var import_obsidian22 = require("obsidian");
var JsonFileSuggestModal = class extends import_obsidian22.FuzzySuggestModal {
  constructor(app, onChoose) {
    super(app);
    this.appRef = app;
    this.onChoose = onChoose;
    this.files = this.appRef.vault.getFiles().filter((f) => {
      var _a2;
      return ((_a2 = f.extension) == null ? void 0 : _a2.toLowerCase()) === "json";
    });
    this.setPlaceholder("Choose JSON file\u2026");
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

// src/faIconPickerModal.ts
var import_obsidian23 = require("obsidian");
var FaIconPickerModal = class extends import_obsidian23.Modal {
  constructor(app, folder, onChoose) {
    super(app);
    this.files = [];
    this.currentMatches = [];
    this.listEl = null;
    this.gridEl = null;
    this.statusEl = null;
    this.searchInput = null;
    this.selected = null;
    this.selectedEl = null;
    this.addButton = null;
    this.renderedCount = 0;
    this.desiredRenderCount = 0;
    this.renderToken = 0;
    this.isRendering = false;
    this.searchDebounceTimer = null;
    this.currentQuery = "";
    this.initialVisibleLimit = 30;
    this.searchResultLimit = 50;
    this.scrollLoadStep = 30;
    this.renderChunkSize = 12;
    this.debounceMs = 180;
    this.scrollThresholdPx = 120;
    this.folder = (0, import_obsidian23.normalizePath)(folder);
    this.onChoose = onChoose;
  }
  collectFiles() {
    var _a2;
    const result = [];
    const root = this.app.vault.getAbstractFileByPath(this.folder);
    if (!(root instanceof import_obsidian23.TFolder)) {
      console.warn(`Zoom Map: SVG icon folder not found: ${this.folder}`);
      this.files = [];
      return;
    }
    const stack = [root];
    while (stack.length > 0) {
      const current = stack.pop();
      for (const child of current.children) {
        if (child instanceof import_obsidian23.TFolder) {
          stack.push(child);
        } else if (child instanceof import_obsidian23.TFile) {
          if (((_a2 = child.extension) == null ? void 0 : _a2.toLowerCase()) === "svg") {
            result.push(child);
          }
        }
      }
    }
    result.sort((a, b) => a.path.localeCompare(b.path));
    this.files = result;
  }
  getMatches(filter) {
    const q = filter.trim().toLowerCase();
    const files = Array.isArray(this.files) ? this.files : [];
    const matches = files.filter((f) => {
      if (!q) return true;
      const name = f.name.toLowerCase();
      const path = f.path.toLowerCase();
      return name.includes(q) || path.includes(q);
    });
    return q ? matches.slice(0, this.searchResultLimit) : matches;
  }
  scheduleRender(filter) {
    if (this.searchDebounceTimer !== null) {
      window.clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = null;
    }
    this.searchDebounceTimer = window.setTimeout(() => {
      this.searchDebounceTimer = null;
      this.renderList(filter);
    }, this.debounceMs);
  }
  renderList(filter) {
    if (!this.listEl) return;
    this.currentQuery = filter.trim();
    this.currentMatches = this.getMatches(this.currentQuery);
    this.renderToken += 1;
    this.renderedCount = 0;
    this.desiredRenderCount = 0;
    this.isRendering = false;
    this.gridEl = null;
    this.statusEl = null;
    this.listEl.empty();
    const selectedStillVisible = this.selected !== null && this.currentMatches.some((f) => {
      var _a2;
      return f.path === ((_a2 = this.selected) == null ? void 0 : _a2.path);
    });
    if (!selectedStillVisible) {
      this.selected = null;
      if (this.addButton) this.addButton.disabled = true;
    } else if (this.addButton) {
      this.addButton.disabled = false;
    }
    if (this.selectedEl) {
      this.selectedEl.classList.remove("is-selected");
    }
    this.selectedEl = null;
    if (this.currentMatches.length === 0) {
      this.listEl.createEl("div", {
        text: "No SVG icons found in this folder."
      });
      return;
    }
    this.statusEl = this.listEl.createDiv({ cls: "zoommap-muted" });
    this.gridEl = this.listEl.createDiv({ cls: "zoommap-fa-picker-grid" });
    this.updateStatus();
    this.queueRenderTo(this.initialVisibleLimit);
  }
  updateStatus() {
    if (!this.statusEl) return;
    const total = this.currentMatches.length;
    const rendered = this.renderedCount;
    const searching = this.currentQuery.length > 0;
    if (searching) {
      const limited = total >= this.searchResultLimit;
      if (rendered < total) {
        this.statusEl.setText(
          limited ? `Showing ${rendered} of max. ${this.searchResultLimit} search results. Scroll to load more.` : `Showing ${rendered} of ${total} search results. Scroll to load more.`
        );
      } else {
        this.statusEl.setText(
          limited ? `Showing max. ${this.searchResultLimit} search results.` : `Showing ${total} search results.`
        );
      }
      return;
    }
    if (rendered < total) {
      this.statusEl.setText(`Showing ${rendered} of ${total} icons. Scroll to load more or use search.`);
    } else {
      this.statusEl.setText(`Showing ${total} icons.`);
    }
  }
  queueRenderTo(targetCount) {
    this.desiredRenderCount = Math.min(
      this.currentMatches.length,
      Math.max(this.desiredRenderCount, targetCount)
    );
    if (!this.gridEl || this.isRendering) return;
    this.isRendering = true;
    const token = this.renderToken;
    const step = () => {
      if (token !== this.renderToken) {
        this.isRendering = false;
        return;
      }
      if (!this.gridEl) {
        this.isRendering = false;
        return;
      }
      const maxTarget = Math.min(this.desiredRenderCount, this.currentMatches.length);
      const end = Math.min(this.renderedCount + this.renderChunkSize, maxTarget);
      for (let i2 = this.renderedCount; i2 < end; i2 += 1) {
        this.appendCell(this.currentMatches[i2]);
      }
      this.renderedCount = end;
      this.updateStatus();
      if (this.renderedCount < maxTarget) {
        window.requestAnimationFrame(step);
        return;
      }
      this.isRendering = false;
      this.maybeLoadMoreFromScroll();
    };
    window.requestAnimationFrame(step);
  }
  appendCell(file) {
    if (!this.gridEl) return;
    const cell = this.gridEl.createDiv({ cls: "zoommap-fa-picker-cell" });
    const img = cell.createEl("img", { cls: "zoommap-fa-picker-icon" });
    img.decoding = "async";
    img.loading = "lazy";
    img.src = this.app.vault.getResourcePath(file);
    cell.createDiv({
      cls: "zoommap-fa-picker-label",
      text: file.name.replace(/\.svg$/i, "")
    });
    if (this.selected && this.selected.path === file.path) {
      this.selectedEl = cell;
      cell.classList.add("is-selected");
    }
    cell.onclick = () => {
      this.selected = file;
      if (this.selectedEl && this.selectedEl !== cell) {
        this.selectedEl.classList.remove("is-selected");
      }
      this.selectedEl = cell;
      cell.classList.add("is-selected");
      if (this.addButton) this.addButton.disabled = false;
    };
  }
  maybeLoadMoreFromScroll() {
    if (!this.listEl) return;
    if (this.currentMatches.length === 0) return;
    if (this.desiredRenderCount >= this.currentMatches.length) return;
    const nearBottom = this.listEl.scrollTop + this.listEl.clientHeight >= this.listEl.scrollHeight - this.scrollThresholdPx;
    if (!nearBottom) return;
    this.queueRenderTo(this.desiredRenderCount + this.scrollLoadStep);
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("zoommap-fa-picker");
    this.collectFiles();
    contentEl.createEl("h2", { text: "Pick SVG icon" });
    if (!Array.isArray(this.files) || this.files.length === 0) {
      contentEl.createEl("div", {
        text: "No SVG icons found in the configured folder."
      });
      return;
    }
    const searchRow = contentEl.createDiv({ cls: "zoommap-fa-picker-search" });
    this.searchInput = searchRow.createEl("input", {
      type: "text",
      placeholder: "Search by name or path\u2026"
    });
    this.listEl = contentEl.createDiv({ cls: "zoommap-fa-picker-list" });
    this.listEl.addEventListener("scroll", () => {
      this.maybeLoadMoreFromScroll();
    });
    const footer = contentEl.createDiv({
      cls: "zoommap-fa-picker-footer zoommap-modal-footer"
    });
    this.addButton = footer.createEl("button", { text: "Add" });
    this.addButton.disabled = true;
    this.addButton.textContent = "Add";
    this.addButton.onclick = () => {
      if (!this.selected) return;
      this.onChoose(this.selected);
    };
    const backButton = footer.createEl("button", { text: "Back" });
    backButton.onclick = () => this.close();
    this.searchInput.addEventListener("input", () => {
      var _a2, _b2;
      this.scheduleRender((_b2 = (_a2 = this.searchInput) == null ? void 0 : _a2.value) != null ? _b2 : "");
    });
    this.renderList("");
  }
  onClose() {
    this.contentEl.empty();
    if (this.searchDebounceTimer !== null) {
      window.clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = null;
    }
    this.renderToken += 1;
    this.listEl = null;
    this.gridEl = null;
    this.statusEl = null;
    this.searchInput = null;
    this.files = [];
    this.currentMatches = [];
    this.selected = null;
    this.selectedEl = null;
    this.addButton = null;
    this.isRendering = false;
  }
};

// src/preferencesModal.ts
var import_obsidian24 = require("obsidian");
var PreferencesModal = class extends import_obsidian24.Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Preferences" });
    contentEl.createEl("h3", { text: "Session image cache" });
    let mbInput = null;
    let keepOverlayToggle = null;
    let hybridToggle = null;
    const applyEnabledState = () => {
      const on = !!this.plugin.settings.enableSessionImageCache;
      if (mbInput) mbInput.disabled = !on;
      if (keepOverlayToggle) keepOverlayToggle.disabled = !on;
      if (hybridToggle) hybridToggle.disabled = !on;
    };
    new import_obsidian24.Setting(contentEl).setName("Enable session image cache").setDesc("Caches decoded images across the entire Obsidian session (ref-counted, evicts only when near limit).").addToggle((toggle) => {
      toggle.setValue(!!this.plugin.settings.enableSessionImageCache).onChange(async (value) => {
        this.plugin.settings.enableSessionImageCache = value;
        await this.plugin.saveSettings();
        applyEnabledState();
      });
    });
    new import_obsidian24.Setting(contentEl).setName("Cache size in megabyte").setDesc("Maximum memory used for cached decoded images. Default: 512 megabyte.").addText((t) => {
      var _a2;
      t.inputEl.type = "number";
      t.setValue(String((_a2 = this.plugin.settings.sessionImageCacheMb) != null ? _a2 : 512));
      mbInput = t.inputEl;
      t.onChange(async (v) => {
        const n = Number(String(v).replace(",", "."));
        if (!Number.isFinite(n) || n <= 0) return;
        this.plugin.settings.sessionImageCacheMb = Math.round(n);
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian24.Setting(contentEl).setName("Keep overlays loaded").setDesc("When enabled, all overlays of an open map are kept in the session cache (even if hidden).").addToggle((toggle) => {
      toggle.setValue(!!this.plugin.settings.keepOverlaysLoaded).onChange(async (value) => {
        this.plugin.settings.keepOverlaysLoaded = value;
        await this.plugin.saveSettings();
      });
      keepOverlayToggle = toggle.toggleEl;
    });
    new import_obsidian24.Setting(contentEl).setName("Hybrid render: canvas images + DOM markers").setDesc("When enabled (and cache is enabled), maps will use canvas rendering for base/overlay images while markers stay DOM. Useful for fast image redraw on weaker devices.").addToggle((toggle) => {
      toggle.setValue(!!this.plugin.settings.preferCanvasImagesWhenCaching).onChange(async (value) => {
        this.plugin.settings.preferCanvasImagesWhenCaching = value;
        await this.plugin.saveSettings();
      });
      hybridToggle = toggle.toggleEl;
    });
    contentEl.createEl("h3", { text: "Other preferences" });
    new import_obsidian24.Setting(contentEl).setName("Show linked file name on hover").setDesc("Shows the linked note\u2019s filename inside the map tooltip. Useful when linked notes are still empty.").addToggle((toggle) => {
      toggle.setValue(!!this.plugin.settings.showLinkFileNameInTooltip).onChange(async (value) => {
        this.plugin.settings.showLinkFileNameInTooltip = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian24.Setting(contentEl).setName("Show zoom +/- buttons on maps").setDesc("Displays small hud buttons for zooming in and out.").addToggle((toggle) => {
      toggle.setValue(!!this.plugin.settings.showZoomButtonsHud).onChange(async (value) => {
        this.plugin.settings.showZoomButtonsHud = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian24.Setting(contentEl).setName("Middle click pins opens linked note in new tab").setDesc("When enabled: middle click on a pin opens its linked note in a new tab.").addToggle((toggle) => {
      toggle.setValue(!!this.plugin.settings.middleClickOpensLinkInNewTab).onChange(async (value) => {
        this.plugin.settings.middleClickOpensLinkInNewTab = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian24.Setting(contentEl).setName("Max SVG raster scale").setDesc("Controls the maximum raster lod for SVG base images. Higher = sharper at high zoom, but more RAM and slower upgrades.").addDropdown((d) => {
      var _a2;
      d.addOption("2", "2\xD7 (low-end)");
      d.addOption("4", "4\xD7 (balanced)");
      d.addOption("8", "8\xD7 (high quality)");
      const cur = String((_a2 = this.plugin.settings.svgRasterMaxScale) != null ? _a2 : 8);
      d.setValue(cur);
      d.onChange(async (v) => {
        const n = Number(v);
        this.plugin.settings.svgRasterMaxScale = n === 2 || n === 4 || n === 8 ? n : 8;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian24.Setting(contentEl).setName("Settings UI: show preview for image icons").setDesc("Shows a small preview thumbnail for non-SVG image icons in the icon library list.").addToggle((toggle) => {
      toggle.setValue(!!this.plugin.settings.showImageIconPreviewInSettings).onChange(async (value) => {
        this.plugin.settings.showImageIconPreviewInSettings = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian24.Setting(contentEl).setName("Enable text layers").setDesc("Enables text boxes with baselines and inline typing on maps.").addToggle((toggle) => {
      toggle.setValue(!!this.plugin.settings.enableTextLayers).onChange(async (value) => {
        this.plugin.settings.enableTextLayers = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian24.Setting(contentEl).setName("Enable grids").setDesc("Enables SVG grid overlays, grid editing and grid menu entries on maps.").addToggle((toggle) => {
      toggle.setValue(!!this.plugin.settings.enableGrid).onChange(async (value) => {
        this.plugin.settings.enableGrid = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian24.Setting(contentEl).setName("Enable measure pro (terrain segments)").setDesc("Allows assigning terrain factors per measurement segment for travel time.").addToggle((toggle) => {
      toggle.setValue(!!this.plugin.settings.enableMeasurePro).onChange(async (value) => {
        this.plugin.settings.enableMeasurePro = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian24.Setting(contentEl).setName('Pins: "scale like sticker" by default').setDesc('When enabled, new pins will have "scale like sticker" enabled in the marker editor.').addToggle((toggle) => {
      toggle.setValue(!!this.plugin.settings.defaultScaleLikeSticker).onChange(async (value) => {
        this.plugin.settings.defaultScaleLikeSticker = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian24.Setting(contentEl).setName("Prefer first active layer for new markers").setDesc("When enabled, markers default to the first visible unlocked layer, whether created or placed.").addToggle((toggle) => {
      toggle.setValue(!!this.plugin.settings.preferActiveLayerInEditor).onChange(async (value) => {
        this.plugin.settings.preferActiveLayerInEditor = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian24.Setting(contentEl).setName("Enable drawing tools").setDesc("When enabled, the draw menu and draw layers become available on maps.").addToggle((toggle) => {
      toggle.setValue(!!this.plugin.settings.enableDrawing).onChange(async (value) => {
        this.plugin.settings.enableDrawing = value;
        await this.plugin.saveSettings();
      });
    });
    contentEl.createEl("h3", { text: "Second screen" });
    let folderInput = null;
    const applySecondScreenState = () => {
      const on = !!this.plugin.settings.enableSecondScreen;
      if (folderInput) folderInput.disabled = !on;
    };
    new import_obsidian24.Setting(contentEl).setName("Enable second screen integration").setDesc('Enables "send to screen" integration with the plugin "ttrpg tools: screen display".').addToggle((toggle) => {
      toggle.setValue(!!this.plugin.settings.enableSecondScreen).onChange(async (value) => {
        this.plugin.settings.enableSecondScreen = value;
        await this.plugin.saveSettings();
        applySecondScreenState();
      });
    });
    new import_obsidian24.Setting(contentEl).setName("Second screen note folder").setDesc("Folder where temporary map notes and marker snapshots for the second screen are written.").addText((t) => {
      var _a2;
      t.setPlaceholder("Zoommap/secondscreen");
      t.setValue((_a2 = this.plugin.settings.secondScreenFolder) != null ? _a2 : "ZoomMap/SecondScreen");
      folderInput = t.inputEl;
      t.onChange(async (v) => {
        this.plugin.settings.secondScreenFolder = v.trim() || "ZoomMap/SecondScreen";
        await this.plugin.saveSettings();
      });
    });
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const closeBtn = footer.createEl("button", { text: "Close" });
    closeBtn.onclick = () => this.close();
    applyEnabledState();
    applySecondScreenState();
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/iconOutlineModal.ts
var import_obsidian25 = require("obsidian");
var IconOutlineModal = class extends import_obsidian25.Modal {
  constructor(app, plugin, icon, onApplied) {
    super(app);
    this.svgSource = null;
    // Base options
    this.baseEnabled = false;
    this.baseKind = "icon";
    this.baseIconKey = "";
    this.baseScalePct = 130;
    this.baseFill = "#ffffff";
    this.baseStroke = "#000000";
    this.baseStrokeWidth = 0;
    this.baseStrokeOpacity = 1;
    this.innerOffsetYPx = 0;
    this.innerOffsetXPx = 0;
    this.outlineColor = "#000000";
    this.outlineWidth = 2;
    this.outlineOpacity = 1;
    this.shadowEnabled = false;
    this.shadowColor = "#000000";
    this.shadowBlurPx = 6;
    this.shadowOffsetXPx = 2;
    this.shadowOffsetYPx = 2;
    this.plugin = plugin;
    this.icon = icon;
    this.onApplied = onApplied;
  }
  isSvgIconProfile(i2) {
    var _a2;
    const src = ((_a2 = i2.pathOrDataUrl) != null ? _a2 : "").toLowerCase();
    return src.startsWith("data:image/svg+xml") || src.endsWith(".svg");
  }
  async loadSvgFromIconKey(iconKey) {
    var _a2, _b2, _c;
    const ico = (_b2 = ((_a2 = this.plugin.settings.icons) != null ? _a2 : []).find((i2) => i2.key === iconKey)) != null ? _b2 : null;
    if (!ico) return null;
    const src = (_c = ico.pathOrDataUrl) != null ? _c : "";
    if (!src || typeof src !== "string") return null;
    if (src.startsWith("data:image/svg+xml")) {
      const idx = src.indexOf(",");
      if (idx < 0) return null;
      try {
        return decodeURIComponent(src.slice(idx + 1));
      } catch (e) {
        return null;
      }
    }
    if (src.toLowerCase().endsWith(".svg")) {
      const af = this.app.vault.getAbstractFileByPath(src);
      if (af instanceof import_obsidian25.TFile) {
        try {
          return await this.app.vault.read(af);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }
  parseSvgRoot(svg) {
    try {
      const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
      const svgEl = doc.querySelector("svg");
      return svgEl;
    } catch (e) {
      return null;
    }
  }
  extractViewBox(svg) {
    var _a2;
    const svgEl = this.parseSvgRoot(svg);
    if (!svgEl) return null;
    const vb = ((_a2 = svgEl.getAttribute("viewBox")) != null ? _a2 : "").trim();
    const parts = vb.split(/[\s,]+/).map((x2) => Number(x2));
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
      return { minX: parts[0], minY: parts[1], w: parts[2], h: parts[3] };
    }
    return null;
  }
  stripOuterSvg(svg) {
    var _a2, _b2;
    const svgEl = this.parseSvgRoot(svg);
    if (!svgEl) return null;
    const vb = ((_a2 = svgEl.getAttribute("viewBox")) != null ? _a2 : "").trim();
    const inner = (_b2 = svgEl.innerHTML) != null ? _b2 : "";
    return { inner, viewBox: vb || void 0 };
  }
  readPersistedMeta(svg) {
    var _a2, _b2, _c;
    try {
      const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
      const root = doc.querySelector("svg");
      if (!root) return;
      const getNum = (k) => {
        const v = root.getAttribute(k);
        if (v == null) return null;
        const n = Number(String(v).replace(",", "."));
        return Number.isFinite(n) ? n : null;
      };
      const getStr = (k) => {
        const v = root.getAttribute(k);
        return typeof v === "string" && v.trim().length ? v.trim() : null;
      };
      const baseIcon = getStr("data-zm-base-icon");
      if (baseIcon) {
        this.baseEnabled = true;
        this.baseIconKey = baseIcon;
      }
      const baseScale = getNum("data-zm-base-scale");
      if (baseScale != null && baseScale >= 10 && baseScale <= 1e3) this.baseScalePct = Math.round(baseScale);
      const baseFill = getStr("data-zm-base-fill");
      if (baseFill) this.baseFill = baseFill;
      const baseStroke = getStr("data-zm-base-stroke");
      if (baseStroke) this.baseStroke = baseStroke;
      const baseSw = getNum("data-zm-base-sw");
      if (baseSw != null && baseSw >= 0) this.baseStrokeWidth = baseSw;
      const baseSo = getNum("data-zm-base-so");
      if (baseSo != null) this.baseStrokeOpacity = Math.min(1, Math.max(0, baseSo));
      const dx = getNum("data-zm-inner-dx");
      if (dx != null) this.innerOffsetXPx = Math.max(-500, Math.min(500, dx));
      const dy = getNum("data-zm-inner-dy");
      if (dy != null) this.innerOffsetYPx = Math.max(-500, Math.min(500, dy));
      const oc = getStr("data-zm-outline-color");
      if (oc) this.outlineColor = oc;
      const ow = getNum("data-zm-outline-width");
      if (ow != null && ow >= 0) this.outlineWidth = ow;
      const oo = getNum("data-zm-outline-opacity");
      if (oo != null) this.outlineOpacity = Math.min(1, Math.max(0, oo));
      if (!oc && ow == null && oo == null) {
        const ol = root.querySelector("#zm-outline");
        if (ol instanceof SVGElement) {
          const sc = ((_a2 = ol.getAttribute("stroke")) != null ? _a2 : "").trim();
          if (sc) this.outlineColor = sc;
          const sw = Number(String((_b2 = ol.getAttribute("stroke-width")) != null ? _b2 : "").replace(",", "."));
          if (Number.isFinite(sw) && sw >= 0) this.outlineWidth = sw;
          const so = Number(String((_c = ol.getAttribute("stroke-opacity")) != null ? _c : "").replace(",", "."));
          if (Number.isFinite(so)) this.outlineOpacity = Math.min(1, Math.max(0, so));
        }
      }
    } catch (e) {
    }
  }
  writePersistedMeta(svg) {
    var _a2, _b2, _c;
    try {
      const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
      const root = doc.querySelector("svg");
      if (!root) return svg;
      root.setAttribute("data-zm-outline-color", this.outlineColor);
      root.setAttribute("data-zm-outline-width", String(this.outlineWidth));
      root.setAttribute("data-zm-outline-opacity", String(this.outlineOpacity));
      if (this.baseEnabled) {
        root.setAttribute("data-zm-base-icon", ((_a2 = this.baseIconKey) != null ? _a2 : "").trim());
        root.setAttribute("data-zm-base-scale", String(this.baseScalePct));
        root.setAttribute("data-zm-base-fill", this.baseFill);
        root.setAttribute("data-zm-base-stroke", this.baseStroke);
        root.setAttribute("data-zm-base-sw", String(this.baseStrokeWidth));
        root.setAttribute("data-zm-base-so", String(this.baseStrokeOpacity));
      } else {
        root.removeAttribute("data-zm-base-icon");
        root.removeAttribute("data-zm-base-scale");
        root.removeAttribute("data-zm-base-fill");
        root.removeAttribute("data-zm-base-stroke");
        root.removeAttribute("data-zm-base-sw");
        root.removeAttribute("data-zm-base-so");
      }
      root.setAttribute("data-zm-inner-dx", String((_b2 = this.innerOffsetXPx) != null ? _b2 : 0));
      root.setAttribute("data-zm-inner-dy", String((_c = this.innerOffsetYPx) != null ? _c : 0));
      return new XMLSerializer().serializeToString(root);
    } catch (e) {
      return svg;
    }
  }
  onOpen() {
    void this.renderAsync();
  }
  onClose() {
    this.contentEl.empty();
    this.svgSource = null;
  }
  parseViewBoxString(vb) {
    const parts = (vb != null ? vb : "").trim().split(/[\s,]+/).map((x2) => Number(x2));
    if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return null;
    const [minX, minY, w, h] = parts;
    if (w <= 0 || h <= 0) return null;
    return { minX, minY, w, h };
  }
  getOrigViewBox(svgEl) {
    var _a2, _b2;
    const orig = (_b2 = (_a2 = svgEl.getAttribute("data-zm-orig-viewbox")) != null ? _a2 : svgEl.getAttribute("viewBox")) != null ? _b2 : "";
    return this.parseViewBoxString(orig);
  }
  applyViewBoxPaddingAbsolute(svg, pad) {
    var _a2, _b2;
    try {
      const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
      const svgEl = doc.querySelector("svg");
      if (!svgEl) return svg;
      const origStr = (_b2 = (_a2 = svgEl.getAttribute("data-zm-orig-viewbox")) != null ? _a2 : svgEl.getAttribute("viewBox")) != null ? _b2 : "";
      const orig = this.parseViewBoxString(origStr);
      if (!orig) return svg;
      if (!svgEl.getAttribute("data-zm-orig-viewbox")) {
        svgEl.setAttribute("data-zm-orig-viewbox", `${orig.minX} ${orig.minY} ${orig.w} ${orig.h}`);
      }
      const p = Math.max(0, Number(pad) || 0);
      const minX = orig.minX - p;
      const minY = orig.minY - p;
      const w = orig.w + 2 * p;
      const h = orig.h + 2 * p;
      svgEl.setAttribute("viewBox", `${minX} ${minY} ${w} ${h}`);
      return new XMLSerializer().serializeToString(svgEl);
    } catch (e) {
      return svg;
    }
  }
  async renderAsync() {
    var _a2, _b2, _c, _d, _e;
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "SVG outline" });
    const svg = await this.loadSvgSource();
    if (!svg) {
      contentEl.createEl("div", {
        text: "This icon is not an SVG or could not be loaded."
      });
      return;
    }
    this.svgSource = svg;
    this.baseEnabled = /id="zm-base"/i.test(svg);
    this.baseKind = "icon";
    this.baseIconKey = this.baseIconKey || "";
    this.baseScalePct = 130;
    this.baseFill = "#ffffff";
    this.baseStroke = "#000000";
    this.baseStrokeWidth = 0;
    this.baseStrokeOpacity = 1;
    this.innerOffsetYPx = 0;
    this.innerOffsetXPx = 0;
    this.outlineColor = "#000000";
    this.outlineWidth = 2;
    this.shadowEnabled = !!this.icon.shadowEnabled;
    this.shadowColor = ((_a2 = this.icon.shadowColor) != null ? _a2 : "#000000").trim() || "#000000";
    this.shadowBlurPx = typeof this.icon.shadowBlurPx === "number" && Number.isFinite(this.icon.shadowBlurPx) ? this.icon.shadowBlurPx : 6;
    this.shadowOffsetXPx = typeof this.icon.shadowOffsetXPx === "number" && Number.isFinite(this.icon.shadowOffsetXPx) ? this.icon.shadowOffsetXPx : 2;
    this.shadowOffsetYPx = typeof this.icon.shadowOffsetYPx === "number" && Number.isFinite(this.icon.shadowOffsetYPx) ? this.icon.shadowOffsetYPx : 2;
    this.outlineOpacity = 1;
    this.readPersistedMeta(svg);
    const strokeMatch = /stroke="([^"]+)"/i.exec(svg);
    const widthMatch = /stroke-width="([^"]+)"/i.exec(svg);
    const opacityMatch = /stroke-opacity="([^"]+)"/i.exec(svg);
    let defaultColor = this.outlineColor || (strokeMatch == null ? void 0 : strokeMatch[1]) || "#000000";
    if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(defaultColor)) {
      defaultColor = "#000000";
    }
    let defaultWidth = this.outlineWidth;
    if (!Number.isFinite(defaultWidth)) {
      defaultWidth = Number((_c = (_b2 = widthMatch == null ? void 0 : widthMatch[1]) == null ? void 0 : _b2.replace(",", ".")) != null ? _c : "2");
    }
    if (!Number.isFinite(defaultWidth) || defaultWidth < 0) defaultWidth = 2;
    let defaultOpacity = this.outlineOpacity;
    if (!Number.isFinite(defaultOpacity)) {
      defaultOpacity = Number((_e = (_d = opacityMatch == null ? void 0 : opacityMatch[1]) == null ? void 0 : _d.replace(",", ".")) != null ? _e : "1");
      if (!Number.isFinite(defaultOpacity)) defaultOpacity = 1;
      if (defaultOpacity > 1.001) defaultOpacity = defaultOpacity / 100;
      defaultOpacity = Math.min(1, Math.max(0, defaultOpacity));
    }
    const colorSetting = new import_obsidian25.Setting(contentEl).setName("Outline color");
    this.colorText = colorSetting.controlEl.createEl("input", {
      type: "text"
    });
    this.colorText.classList.add("zoommap-drawing-editor__color-text");
    this.colorText.value = defaultColor;
    this.outlineColor = defaultColor;
    this.colorPicker = colorSetting.controlEl.createEl("input", {
      type: "color"
    });
    this.colorPicker.classList.add("zoommap-drawing-editor__color-picker");
    this.colorPicker.value = this.normalizeHex(defaultColor);
    this.colorText.oninput = () => {
      const val = this.colorText.value.trim();
      if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) {
        this.colorPicker.value = this.normalizeHex(val);
      }
      this.outlineColor = val || "#000000";
    };
    this.colorPicker.oninput = () => {
      const hex = this.colorPicker.value;
      this.colorText.value = hex;
      this.outlineColor = hex;
    };
    const widthSetting = new import_obsidian25.Setting(contentEl).setName("Stroke width");
    this.widthInput = widthSetting.controlEl.createEl("input", {
      type: "number"
    });
    this.widthInput.classList.add("zoommap-drawing-editor__num-input");
    this.widthInput.min = "0";
    this.widthInput.step = "0.5";
    this.widthInput.value = String(defaultWidth);
    this.outlineWidth = defaultWidth;
    const opacitySetting = new import_obsidian25.Setting(contentEl).setName("Opacity (%)");
    this.opacityInput = opacitySetting.controlEl.createEl("input", {
      type: "number"
    });
    this.opacityInput.classList.add("zoommap-drawing-editor__num-input");
    this.opacityInput.min = "0";
    this.opacityInput.max = "100";
    this.opacityInput.step = "5";
    this.opacityInput.value = String(Math.round(defaultOpacity * 100));
    this.outlineOpacity = defaultOpacity;
    contentEl.createEl("h3", { text: "SVG base (background)" });
    let kindSetting = null;
    let scaleSetting = null;
    let fillSetting = null;
    let strokeSetting = null;
    let innerOffsetSetting = null;
    let innerOffsetXSetting = null;
    new import_obsidian25.Setting(contentEl).setName("Add base").setDesc("Adds a background shape under the icon (separate color, optional outline).").addToggle((tg) => {
      tg.setValue(this.baseEnabled).onChange((on) => {
        this.baseEnabled = on;
        kindSetting == null ? void 0 : kindSetting.settingEl.toggle(on);
        scaleSetting == null ? void 0 : scaleSetting.settingEl.toggle(on);
        fillSetting == null ? void 0 : fillSetting.settingEl.toggle(on);
        strokeSetting == null ? void 0 : strokeSetting.settingEl.toggle(on);
        innerOffsetSetting == null ? void 0 : innerOffsetSetting.settingEl.toggle(on);
        innerOffsetXSetting == null ? void 0 : innerOffsetXSetting.settingEl.toggle(on);
      });
    });
    kindSetting = new import_obsidian25.Setting(contentEl).setName("Base shape").setDesc("Use existing SVG icon as the base.").addDropdown((d) => {
      var _a3, _b3, _c2;
      const svgIcons = ((_a3 = this.plugin.settings.icons) != null ? _a3 : []).filter((i2) => this.isSvgIconProfile(i2)).slice().sort((a, b) => {
        var _a4, _b4;
        return String((_a4 = a.key) != null ? _a4 : "").localeCompare(String((_b4 = b.key) != null ? _b4 : ""), void 0, { sensitivity: "base", numeric: true });
      });
      for (const ico of svgIcons) {
        d.addOption(`icon:${ico.key}`, ico.key);
      }
      const fallback = (_c2 = (_b3 = svgIcons[0]) == null ? void 0 : _b3.key) != null ? _c2 : "";
      const curKey = (this.baseIconKey || fallback).trim();
      this.baseIconKey = curKey;
      d.setValue(curKey ? `icon:${curKey}` : "");
      d.onChange((v) => {
        if (v.startsWith("icon:")) this.baseIconKey = v.slice("icon:".length);
      });
    });
    scaleSetting = new import_obsidian25.Setting(contentEl).setName("Base scale (%)").addText((t) => {
      t.inputEl.type = "number";
      t.setValue(String(this.baseScalePct));
      t.onChange((v) => {
        const n = Number(String(v).replace(",", "."));
        if (Number.isFinite(n) && n >= 50 && n <= 400) this.baseScalePct = Math.round(n);
      });
    });
    fillSetting = new import_obsidian25.Setting(contentEl).setName("Base fill");
    {
      const txt = fillSetting.controlEl.createEl("input", { type: "text" });
      txt.classList.add("zoommap-drawing-editor__color-text");
      txt.value = this.baseFill;
      const pick = fillSetting.controlEl.createEl("input", { type: "color" });
      pick.classList.add("zoommap-drawing-editor__color-picker");
      pick.value = this.normalizeHex(this.baseFill);
      txt.oninput = () => {
        const val = txt.value.trim() || "#ffffff";
        this.baseFill = val;
        if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) pick.value = this.normalizeHex(val);
      };
      pick.oninput = () => {
        this.baseFill = pick.value;
        txt.value = pick.value;
      };
    }
    strokeSetting = new import_obsidian25.Setting(contentEl).setName("Base outline");
    {
      const strokeTxt = strokeSetting.controlEl.createEl("input", { type: "text" });
      strokeTxt.classList.add("zoommap-drawing-editor__color-text");
      strokeTxt.value = this.baseStroke;
      const strokePick = strokeSetting.controlEl.createEl("input", { type: "color" });
      strokePick.classList.add("zoommap-drawing-editor__color-picker");
      strokePick.value = this.normalizeHex(this.baseStroke);
      const w = strokeSetting.controlEl.createEl("input", { type: "number" });
      w.classList.add("zoommap-drawing-editor__num-input");
      w.min = "0";
      w.value = String(this.baseStrokeWidth);
      w.title = "Stroke width";
      const op = strokeSetting.controlEl.createEl("input", { type: "number" });
      op.classList.add("zoommap-drawing-editor__num-input");
      op.value = String(Math.round(this.baseStrokeOpacity * 100));
      op.title = "Opacity (%)";
      strokeTxt.oninput = () => {
        const val = strokeTxt.value.trim() || "#000000";
        this.baseStroke = val;
        if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) strokePick.value = this.normalizeHex(val);
      };
      strokePick.oninput = () => {
        this.baseStroke = strokePick.value;
        strokeTxt.value = strokePick.value;
      };
      w.oninput = () => {
        const n = Number(String(w.value).replace(",", "."));
        if (Number.isFinite(n) && n >= 0) this.baseStrokeWidth = n;
      };
      op.oninput = () => {
        const n = Number(String(op.value).replace(",", "."));
        if (!Number.isFinite(n)) return;
        const clamped = Math.min(100, Math.max(0, n));
        this.baseStrokeOpacity = clamped / 100;
      };
    }
    innerOffsetXSetting = new import_obsidian25.Setting(contentEl).setName("Icon offset X (px)").setDesc("Moves the actual icon relative to the base. Negative = left, positive = right.").addText((t) => {
      var _a3;
      t.inputEl.type = "number";
      t.setPlaceholder("0");
      t.setValue(String((_a3 = this.innerOffsetXPx) != null ? _a3 : 0));
      t.onChange((v) => {
        const n = Number(String(v).replace(",", "."));
        if (!Number.isFinite(n)) return;
        this.innerOffsetXPx = Math.max(-500, Math.min(500, n));
      });
    });
    innerOffsetSetting = new import_obsidian25.Setting(contentEl).setName("Icon offset y (px)").setDesc("Moves the actual icon relative to the base. Negative = up, positive = down.").addText((t) => {
      var _a3;
      t.inputEl.type = "number";
      t.setPlaceholder("0");
      t.setValue(String((_a3 = this.innerOffsetYPx) != null ? _a3 : 0));
      t.onChange((v) => {
        const n = Number(String(v).replace(",", "."));
        if (!Number.isFinite(n)) return;
        this.innerOffsetYPx = Math.max(-500, Math.min(500, n));
      });
    });
    kindSetting.settingEl.toggle(this.baseEnabled);
    scaleSetting.settingEl.toggle(this.baseEnabled);
    fillSetting.settingEl.toggle(this.baseEnabled);
    contentEl.createEl("h3", { text: "Shadow" });
    let shadowColorSetting = null;
    let shadowBlurSetting = null;
    let shadowOffsetXSetting = null;
    let shadowOffsetYSetting = null;
    const toggleShadowRows = () => {
      const on = !!this.shadowEnabled;
      shadowColorSetting == null ? void 0 : shadowColorSetting.settingEl.toggle(on);
      shadowBlurSetting == null ? void 0 : shadowBlurSetting.settingEl.toggle(on);
      shadowOffsetXSetting == null ? void 0 : shadowOffsetXSetting.settingEl.toggle(on);
      shadowOffsetYSetting == null ? void 0 : shadowOffsetYSetting.settingEl.toggle(on);
    };
    new import_obsidian25.Setting(contentEl).setName("Enable shadow").addToggle((tg) => {
      tg.setValue(this.shadowEnabled).onChange((on) => {
        this.shadowEnabled = on;
        toggleShadowRows();
      });
    });
    shadowColorSetting = new import_obsidian25.Setting(contentEl).setName("Shadow color");
    {
      const txt = shadowColorSetting.controlEl.createEl("input", { type: "text" });
      txt.classList.add("zoommap-drawing-editor__color-text");
      txt.value = this.shadowColor;
      const pick = shadowColorSetting.controlEl.createEl("input", { type: "color" });
      pick.classList.add("zoommap-drawing-editor__color-picker");
      pick.value = this.normalizeHex(this.shadowColor);
      txt.oninput = () => {
        const val = txt.value.trim() || "#000000";
        this.shadowColor = val;
        if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) pick.value = this.normalizeHex(val);
      };
      pick.oninput = () => {
        this.shadowColor = pick.value;
        txt.value = pick.value;
      };
    }
    shadowBlurSetting = new import_obsidian25.Setting(contentEl).setName("Shadow blur (px)").addText((t) => {
      t.inputEl.type = "number";
      t.setValue(String(this.shadowBlurPx));
      t.onChange((v) => {
        const n = Number(String(v).replace(",", "."));
        if (Number.isFinite(n) && n >= 0) this.shadowBlurPx = n;
      });
    });
    shadowOffsetXSetting = new import_obsidian25.Setting(contentEl).setName("Shadow offset x (px)").addText((t) => {
      t.inputEl.type = "number";
      t.setValue(String(this.shadowOffsetXPx));
      t.onChange((v) => {
        const n = Number(String(v).replace(",", "."));
        if (Number.isFinite(n)) this.shadowOffsetXPx = n;
      });
    });
    shadowOffsetYSetting = new import_obsidian25.Setting(contentEl).setName("Shadow offset y (px)").addText((t) => {
      t.inputEl.type = "number";
      t.setValue(String(this.shadowOffsetYPx));
      t.onChange((v) => {
        const n = Number(String(v).replace(",", "."));
        if (Number.isFinite(n)) this.shadowOffsetYPx = n;
      });
    });
    toggleShadowRows();
    strokeSetting.settingEl.toggle(this.baseEnabled);
    innerOffsetSetting.settingEl.toggle(this.baseEnabled);
    innerOffsetXSetting.settingEl.toggle(this.baseEnabled);
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const saveBtn = footer.createEl("button", { text: "Save" });
    const cancelBtn = footer.createEl("button", { text: "Cancel" });
    saveBtn.onclick = () => {
      void this.applyAndSave();
    };
    cancelBtn.onclick = () => this.close();
  }
  async loadSvgSource() {
    const src = this.icon.pathOrDataUrl;
    if (!src || typeof src !== "string") return null;
    if (src.startsWith("data:image/svg+xml")) {
      const idx = src.indexOf(",");
      if (idx < 0) return null;
      try {
        return decodeURIComponent(src.slice(idx + 1));
      } catch (e) {
        return null;
      }
    }
    if (src.toLowerCase().endsWith(".svg")) {
      const af = this.app.vault.getAbstractFileByPath(src);
      if (af instanceof import_obsidian25.TFile) {
        return this.app.vault.read(af);
      }
    }
    return null;
  }
  async applyAndSave() {
    var _a2, _b2, _c;
    if (!this.svgSource) {
      new import_obsidian25.Notice("SVG content not loaded.", 2e3);
      return;
    }
    if (this.baseEnabled) {
      const k = ((_a2 = this.baseIconKey) != null ? _a2 : "").trim();
      const svgIcons = ((_b2 = this.plugin.settings.icons) != null ? _b2 : []).filter((i2) => this.isSvgIconProfile(i2));
      const exists = svgIcons.some((i2) => i2.key === k);
      if (!k || !exists) {
        new import_obsidian25.Notice("Please choose a base icon (SVG) from the library.", 3e3);
        return;
      }
    }
    const color = this.colorText.value.trim() || "#000000";
    let width = Number(this.widthInput.value.replace(",", "."));
    if (!Number.isFinite(width) || width < 0) width = 2;
    let opacity = Number(this.opacityInput.value.replace(",", "."));
    if (!Number.isFinite(opacity)) opacity = 100;
    if (opacity > 1.001) opacity = opacity / 100;
    opacity = Math.min(1, Math.max(0, opacity));
    if (this.shadowEnabled) {
      this.icon.shadowEnabled = true;
      this.icon.shadowColor = ((_c = this.shadowColor) != null ? _c : "").trim() || "#000000";
      this.icon.shadowBlurPx = Math.max(0, Number(this.shadowBlurPx) || 0);
      this.icon.shadowOffsetXPx = Number.isFinite(this.shadowOffsetXPx) ? this.shadowOffsetXPx : 2;
      this.icon.shadowOffsetYPx = Number.isFinite(this.shadowOffsetYPx) ? this.shadowOffsetYPx : 2;
    } else {
      delete this.icon.shadowEnabled;
      delete this.icon.shadowColor;
      delete this.icon.shadowBlurPx;
      delete this.icon.shadowOffsetXPx;
      delete this.icon.shadowOffsetYPx;
    }
    this.outlineColor = color;
    this.outlineWidth = width;
    this.outlineOpacity = opacity;
    const updatedSvg = this.applyOutline(
      this.svgSource,
      color,
      width,
      opacity
    );
    const dataUrl = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(updatedSvg);
    this.icon.pathOrDataUrl = dataUrl;
    await this.plugin.saveSettings();
    if (this.onApplied) {
      this.onApplied(dataUrl);
    }
    this.close();
  }
  applyOutline(svg, color, width, opacity) {
    var _a2, _b2, _c, _d, _e;
    let s = this.removeExistingZmOutline(svg);
    s = this.removeExistingZmBase(s);
    const outlinePad = Math.max(0, width) * 2;
    const basePad = this.baseEnabled ? this.computeBasePadFromOrigViewBox(s) : 0;
    const offsetPad = Math.max(Math.abs((_a2 = this.innerOffsetXPx) != null ? _a2 : 0), Math.abs((_b2 = this.innerOffsetYPx) != null ? _b2 : 0));
    const pad = Math.max(outlinePad, basePad, offsetPad);
    s = this.applyViewBoxPaddingAbsolute(s, pad);
    const openMatch = /<svg[^>]*>/i.exec(s);
    const closeIndex = s.lastIndexOf("</svg>");
    if (!openMatch || closeIndex < 0) {
      return s;
    }
    const openTag = openMatch[0];
    const openEnd = ((_c = openMatch.index) != null ? _c : 0) + openTag.length;
    const inner = s.slice(openEnd, closeIndex);
    const baseGroup = this.baseEnabled ? this.buildBaseGroup(s) : "";
    const dx = Number((_d = this.innerOffsetXPx) != null ? _d : 0);
    const dy = Number((_e = this.innerOffsetYPx) != null ? _e : 0);
    const hasOffset = Number.isFinite(dx) && dx !== 0 || Number.isFinite(dy) && dy !== 0;
    const tr = hasOffset ? ` transform="translate(${dx} ${dy})"` : "";
    const outlineEnabled = Number.isFinite(width) && width > 0 && Number.isFinite(opacity) && opacity > 0;
    let outlineGroup = "";
    if (outlineEnabled) {
      const outlineInner = this.stripFillAndStrokeForOutline(inner);
      outlineGroup = `<g id="zm-outline"${tr} fill="none" stroke="${color}" stroke-width="${width}" stroke-opacity="${opacity}" vector-effect="non-scaling-stroke">` + outlineInner + `</g>`;
    }
    const innerGroup = `<g id="zm-inner"${tr}>${inner}</g>`;
    const newInner = baseGroup + outlineGroup + innerGroup;
    const merged = s.slice(0, openEnd) + newInner + s.slice(closeIndex);
    return this.writePersistedMeta(merged);
  }
  removeExistingZmBase(svg) {
    var _a2;
    try {
      const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
      const svgEl = doc.querySelector("svg");
      if (!svgEl) return svg;
      (_a2 = svgEl.querySelector("#zm-base")) == null ? void 0 : _a2.remove();
      return new XMLSerializer().serializeToString(svgEl);
    } catch (e) {
      return svg;
    }
  }
  computeBasePadFromOrigViewBox(svg) {
    const svgEl = this.parseSvgRoot(svg);
    if (!svgEl) return 0;
    const orig = this.getOrigViewBox(svgEl);
    if (!orig) return 0;
    const baseScale = (this.baseScalePct || 100) / 100;
    const halfMin = Math.min(orig.w, orig.h) / 2;
    const r = halfMin * baseScale;
    const extra = Math.max(0, r - halfMin);
    const strokePad = Math.max(0, this.baseStrokeWidth || 0) * 2;
    return extra + strokePad;
  }
  buildBaseGroup(svg) {
    var _a2, _b2, _c, _d;
    const svgEl = this.parseSvgRoot(svg);
    if (!svgEl) return "";
    const orig = this.getOrigViewBox(svgEl);
    if (!orig) return "";
    const minX = orig.minX, minY = orig.minY, w = orig.w, h = orig.h;
    const cx = minX + w / 2;
    const cy = minY + h / 2;
    const halfMin = Math.min(w, h) / 2;
    const r = halfMin * ((this.baseScalePct || 100) / 100);
    const fill = this.baseFill || "#ffffff";
    const stroke = this.baseStroke || "#000000";
    const sw = Math.max(0, Number(this.baseStrokeWidth) || 0);
    const so = Math.min(1, Math.max(0, Number(this.baseStrokeOpacity) || 0));
    if (this.baseKind === "icon" && this.baseIconKey) {
      const ico = ((_a2 = this.plugin.settings.icons) != null ? _a2 : []).find((i2) => i2.key === this.baseIconKey);
      const src = (_b2 = ico == null ? void 0 : ico.pathOrDataUrl) != null ? _b2 : "";
      if (typeof src === "string" && src.startsWith("data:image/svg+xml")) {
        const idx = src.indexOf(",");
        if (idx >= 0) {
          try {
            const baseSvg = decodeURIComponent(src.slice(idx + 1));
            const stripped = this.stripOuterSvg(baseSvg);
            const vb2 = (_c = stripped == null ? void 0 : stripped.viewBox) != null ? _c : "0 0 24 24";
            const p2 = vb2.trim().split(/[\s,]+/).map((x2) => Number(x2));
            if (p2.length === 4 && p2.every((n) => Number.isFinite(n))) {
              const bw = p2[2], bh = p2[3];
              const target = 2 * r;
              const k = target / Math.max(1, Math.max(bw, bh));
              const tx = cx - bw * k / 2;
              const ty = cy - bh * k / 2;
              const inner = (_d = stripped == null ? void 0 : stripped.inner) != null ? _d : "";
              return `<g id="zm-base" fill="none">
  <g transform="translate(${tx} ${ty}) scale(${k})"
     fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${so}">
    ${inner}
  </g>
</g>`;
            }
          } catch (e) {
          }
        }
      }
    }
    return "";
  }
  removeExistingZmOutline(svg) {
    try {
      const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
      const svgEl = doc.querySelector("svg");
      if (!svgEl) return svg;
      const oldOutline = svgEl.querySelector("#zm-outline");
      oldOutline == null ? void 0 : oldOutline.remove();
      const oldInner = svgEl.querySelector("#zm-inner");
      if (oldInner) {
        const frag = doc.createDocumentFragment();
        while (oldInner.firstChild) frag.appendChild(oldInner.firstChild);
        oldInner.replaceWith(frag);
      }
      return new XMLSerializer().serializeToString(svgEl);
    } catch (e) {
      return svg;
    }
  }
  applyViewBoxPaddingFromOriginal(svg, strokeWidth) {
    var _a2;
    try {
      const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
      const svgEl = doc.querySelector("svg");
      if (!svgEl) return svg;
      const orig = (_a2 = svgEl.getAttribute("data-zm-orig-viewbox")) != null ? _a2 : svgEl.getAttribute("viewBox");
      if (!orig) return svg;
      if (!svgEl.getAttribute("data-zm-orig-viewbox")) {
        svgEl.setAttribute("data-zm-orig-viewbox", orig);
      }
      const parts = orig.trim().split(/[\s,]+/).map((x2) => Number(x2));
      if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return svg;
      const [minX, minY, w, h] = parts;
      if (w <= 0 || h <= 0) return svg;
      const pad = strokeWidth * 2;
      const newMinX = minX - pad;
      const newMinY = minY - pad;
      const newW = w + pad * 2;
      const newH = h + pad * 2;
      svgEl.setAttribute("viewBox", `${newMinX} ${newMinY} ${newW} ${newH}`);
      return new XMLSerializer().serializeToString(svgEl);
    } catch (e) {
      return svg;
    }
  }
  stripFillAndStrokeForOutline(src) {
    let s = src;
    s = s.replace(/fill="[^"]*"/gi, "");
    s = s.replace(/stroke="[^"]*"/gi, "");
    s = s.replace(/stroke-width="[^"]*"/gi, "");
    s = s.replace(/stroke-opacity="[^"]*"/gi, "");
    s = s.replace(/style="([^"]*)"/gi, (_m, style) => {
      let st = style;
      st = st.replace(/(?:^|;)\s*fill\s*:[^;]*/gi, "");
      st = st.replace(/(?:^|;)\s*stroke\s*:[^;]*/gi, "");
      st = st.replace(/(?:^|;)\s*stroke-width\s*:[^;]*/gi, "");
      st = st.replace(/(?:^|;)\s*stroke-opacity\s*:[^;]*/gi, "");
      st = st.replace(/;;+/g, ";").replace(/^;/, "").replace(/;$/, "").trim();
      if (!st) return "";
      return `style="${st}"`;
    });
    return s;
  }
  normalizeHex(v) {
    if (!v.startsWith("#")) return v;
    if (v.length === 4) {
      const r = v[1];
      const g = v[2];
      const b = v[3];
      return `#${r}${r}${g}${g}${b}${b}`;
    }
    return v;
  }
};

// src/imageCache.ts
function isImageBitmapLike2(x2) {
  return typeof x2 === "object" && x2 !== null && "close" in x2 && typeof x2.close === "function";
}
function approxBytesForSource(src) {
  var _a2, _b2;
  if (isImageBitmapLike2(src)) return src.width * src.height * 4;
  const w = (_a2 = src.naturalWidth) != null ? _a2 : 0;
  const h = (_b2 = src.naturalHeight) != null ? _b2 : 0;
  if (w > 0 && h > 0) return w * h * 4;
  return 0;
}
var ImageCache = class {
  constructor(app, maxBytes) {
    this.startEvictRatio = 0.9;
    // start evicting above 90%
    this.targetEvictRatio = 0.8;
    // evict down to 80% (free ~10% headroom)
    this.entries = /* @__PURE__ */ new Map();
    this.refs = /* @__PURE__ */ new Map();
    this.loading = /* @__PURE__ */ new Map();
    this.app = app;
    this.maxBytes = Math.max(64 * 1024 * 1024, maxBytes);
  }
  setMaxBytes(maxBytes) {
    this.maxBytes = Math.max(64 * 1024 * 1024, maxBytes);
    this.evictIfNeeded();
  }
  getMaxBytes() {
    return this.maxBytes;
  }
  getRefCount(path) {
    var _a2;
    return (_a2 = this.refs.get(path)) != null ? _a2 : 0;
  }
  getTotalBytes() {
    let total = 0;
    for (const e of this.entries.values()) total += e.bytes;
    return total;
  }
  clear() {
    for (const [path, e] of this.entries) {
      this.closeEntry(path, e);
    }
    this.entries.clear();
    this.refs.clear();
    this.loading.clear();
  }
  /**
   * Acquire a cached image for the session.
   * - Increments refcount (must be paired with release()).
   * - Loads and decodes at most once per session (per path), unless evicted.
   */
  async acquire(file) {
    var _a2;
    const key = file.path;
    this.refs.set(key, ((_a2 = this.refs.get(key)) != null ? _a2 : 0) + 1);
    const existing = this.entries.get(key);
    if (existing) {
      existing.lastUsed = Date.now();
      return existing.src;
    }
    const inflight = this.loading.get(key);
    if (inflight) return inflight;
    const p = this.loadSource(file).then((src) => {
      const bytes = approxBytesForSource(src);
      this.entries.set(key, { src, bytes, lastUsed: Date.now() });
      this.loading.delete(key);
      this.evictIfNeeded();
      return src;
    }).catch((err2) => {
      this.loading.delete(key);
      this.release(key);
      throw err2;
    });
    this.loading.set(key, p);
    return p;
  }
  /**
   * Release a previously acquired image path.
   * Eviction can only happen when refcount == 0 AND cache is above the high watermark.
   */
  release(path) {
    var _a2;
    const cur = (_a2 = this.refs.get(path)) != null ? _a2 : 0;
    if (cur <= 1) this.refs.delete(path);
    else this.refs.set(path, cur - 1);
    this.evictIfNeeded();
  }
  async loadSource(file) {
    const url = this.app.vault.getResourcePath(file);
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    try {
      await img.decode();
    } catch (e) {
    }
    try {
      return await createImageBitmap(img);
    } catch (e) {
      return img;
    }
  }
  evictIfNeeded() {
    const total = this.getTotalBytes();
    const start = this.maxBytes * this.startEvictRatio;
    if (total <= start) return;
    const target = this.maxBytes * this.targetEvictRatio;
    let curTotal = total;
    const candidates = [...this.entries.entries()].filter(([path]) => {
      var _a2;
      return ((_a2 = this.refs.get(path)) != null ? _a2 : 0) === 0;
    }).sort((a, b) => a[1].lastUsed - b[1].lastUsed);
    for (const [path, e] of candidates) {
      if (curTotal <= target) break;
      curTotal -= e.bytes;
      this.closeEntry(path, e);
      this.entries.delete(path);
    }
  }
  closeEntry(path, e) {
    try {
      if (isImageBitmapLike2(e.src)) e.src.close();
    } catch (error) {
      console.warn("Zoom Map: failed to close cached image", { path, error });
    }
  }
};

// src/mapShare.ts
var import_obsidian27 = require("obsidian");

// node_modules/fflate/esm/browser.js
var u8 = Uint8Array;
var u16 = Uint16Array;
var i32 = Int32Array;
var fleb = new u8([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
  /* unused */
  0,
  0,
  /* impossible */
  0
]);
var fdeb = new u8([
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13,
  /* unused */
  0,
  0
]);
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
var freb = function(eb, start) {
  var b = new u16(31);
  for (var i2 = 0; i2 < 31; ++i2) {
    b[i2] = start += 1 << eb[i2 - 1];
  }
  var r = new i32(b[30]);
  for (var i2 = 1; i2 < 30; ++i2) {
    for (var j = b[i2]; j < b[i2 + 1]; ++j) {
      r[j] = j - b[i2] << 5 | i2;
    }
  }
  return { b, r };
};
var _a = freb(fleb, 2);
var fl = _a.b;
var revfl = _a.r;
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0);
var fd = _b.b;
var revfd = _b.r;
var rev = new u16(32768);
for (i = 0; i < 32768; ++i) {
  x = (i & 43690) >> 1 | (i & 21845) << 1;
  x = (x & 52428) >> 2 | (x & 13107) << 2;
  x = (x & 61680) >> 4 | (x & 3855) << 4;
  rev[i] = ((x & 65280) >> 8 | (x & 255) << 8) >> 1;
}
var x;
var i;
var hMap = (function(cd, mb, r) {
  var s = cd.length;
  var i2 = 0;
  var l = new u16(mb);
  for (; i2 < s; ++i2) {
    if (cd[i2])
      ++l[cd[i2] - 1];
  }
  var le = new u16(mb);
  for (i2 = 1; i2 < mb; ++i2) {
    le[i2] = le[i2 - 1] + l[i2 - 1] << 1;
  }
  var co;
  if (r) {
    co = new u16(1 << mb);
    var rvb = 15 - mb;
    for (i2 = 0; i2 < s; ++i2) {
      if (cd[i2]) {
        var sv = i2 << 4 | cd[i2];
        var r_1 = mb - cd[i2];
        var v = le[cd[i2] - 1]++ << r_1;
        for (var m = v | (1 << r_1) - 1; v <= m; ++v) {
          co[rev[v] >> rvb] = sv;
        }
      }
    }
  } else {
    co = new u16(s);
    for (i2 = 0; i2 < s; ++i2) {
      if (cd[i2]) {
        co[i2] = rev[le[cd[i2] - 1]++] >> 15 - cd[i2];
      }
    }
  }
  return co;
});
var flt = new u8(288);
for (i = 0; i < 144; ++i)
  flt[i] = 8;
var i;
for (i = 144; i < 256; ++i)
  flt[i] = 9;
var i;
for (i = 256; i < 280; ++i)
  flt[i] = 7;
var i;
for (i = 280; i < 288; ++i)
  flt[i] = 8;
var i;
var fdt = new u8(32);
for (i = 0; i < 32; ++i)
  fdt[i] = 5;
var i;
var flm = /* @__PURE__ */ hMap(flt, 9, 0);
var flrm = /* @__PURE__ */ hMap(flt, 9, 1);
var fdm = /* @__PURE__ */ hMap(fdt, 5, 0);
var fdrm = /* @__PURE__ */ hMap(fdt, 5, 1);
var max = function(a) {
  var m = a[0];
  for (var i2 = 1; i2 < a.length; ++i2) {
    if (a[i2] > m)
      m = a[i2];
  }
  return m;
};
var bits = function(d, p, m) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8) >> (p & 7) & m;
};
var bits16 = function(d, p) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8 | d[o + 2] << 16) >> (p & 7);
};
var shft = function(p) {
  return (p + 7) / 8 | 0;
};
var slc = function(v, s, e) {
  if (s == null || s < 0)
    s = 0;
  if (e == null || e > v.length)
    e = v.length;
  return new u8(v.subarray(s, e));
};
var ec = [
  "unexpected EOF",
  "invalid block type",
  "invalid length/literal",
  "invalid distance",
  "stream finished",
  "no stream handler",
  ,
  // determined by compression function
  "no callback",
  "invalid UTF-8 data",
  "extra field too long",
  "date not in range 1980-2099",
  "filename too long",
  "stream finishing",
  "invalid zip data"
  // determined by unknown compression method
];
var err = function(ind, msg, nt) {
  var e = new Error(msg || ec[ind]);
  e.code = ind;
  if (Error.captureStackTrace)
    Error.captureStackTrace(e, err);
  if (!nt)
    throw e;
  return e;
};
var inflt = function(dat, st, buf, dict) {
  var sl = dat.length, dl = dict ? dict.length : 0;
  if (!sl || st.f && !st.l)
    return buf || new u8(0);
  var noBuf = !buf;
  var resize = noBuf || st.i != 2;
  var noSt = st.i;
  if (noBuf)
    buf = new u8(sl * 3);
  var cbuf = function(l2) {
    var bl = buf.length;
    if (l2 > bl) {
      var nbuf = new u8(Math.max(bl * 2, l2));
      nbuf.set(buf);
      buf = nbuf;
    }
  };
  var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
  var tbts = sl * 8;
  do {
    if (!lm) {
      final = bits(dat, pos, 1);
      var type = bits(dat, pos + 1, 3);
      pos += 3;
      if (!type) {
        var s = shft(pos) + 4, l = dat[s - 4] | dat[s - 3] << 8, t = s + l;
        if (t > sl) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt + l);
        buf.set(dat.subarray(s, t), bt);
        st.b = bt += l, st.p = pos = t * 8, st.f = final;
        continue;
      } else if (type == 1)
        lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
      else if (type == 2) {
        var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
        var tl = hLit + bits(dat, pos + 5, 31) + 1;
        pos += 14;
        var ldt = new u8(tl);
        var clt = new u8(19);
        for (var i2 = 0; i2 < hcLen; ++i2) {
          clt[clim[i2]] = bits(dat, pos + i2 * 3, 7);
        }
        pos += hcLen * 3;
        var clb = max(clt), clbmsk = (1 << clb) - 1;
        var clm = hMap(clt, clb, 1);
        for (var i2 = 0; i2 < tl; ) {
          var r = clm[bits(dat, pos, clbmsk)];
          pos += r & 15;
          var s = r >> 4;
          if (s < 16) {
            ldt[i2++] = s;
          } else {
            var c = 0, n = 0;
            if (s == 16)
              n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i2 - 1];
            else if (s == 17)
              n = 3 + bits(dat, pos, 7), pos += 3;
            else if (s == 18)
              n = 11 + bits(dat, pos, 127), pos += 7;
            while (n--)
              ldt[i2++] = c;
          }
        }
        var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
        lbt = max(lt);
        dbt = max(dt);
        lm = hMap(lt, lbt, 1);
        dm = hMap(dt, dbt, 1);
      } else
        err(1);
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
    }
    if (resize)
      cbuf(bt + 131072);
    var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
    var lpos = pos;
    for (; ; lpos = pos) {
      var c = lm[bits16(dat, pos) & lms], sym = c >> 4;
      pos += c & 15;
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
      if (!c)
        err(2);
      if (sym < 256)
        buf[bt++] = sym;
      else if (sym == 256) {
        lpos = pos, lm = null;
        break;
      } else {
        var add = sym - 254;
        if (sym > 264) {
          var i2 = sym - 257, b = fleb[i2];
          add = bits(dat, pos, (1 << b) - 1) + fl[i2];
          pos += b;
        }
        var d = dm[bits16(dat, pos) & dms], dsym = d >> 4;
        if (!d)
          err(3);
        pos += d & 15;
        var dt = fd[dsym];
        if (dsym > 3) {
          var b = fdeb[dsym];
          dt += bits16(dat, pos) & (1 << b) - 1, pos += b;
        }
        if (pos > tbts) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt + 131072);
        var end = bt + add;
        if (bt < dt) {
          var shift = dl - dt, dend = Math.min(dt, end);
          if (shift + bt < 0)
            err(3);
          for (; bt < dend; ++bt)
            buf[bt] = dict[shift + bt];
        }
        for (; bt < end; ++bt)
          buf[bt] = buf[bt - dt];
      }
    }
    st.l = lm, st.p = lpos, st.b = bt, st.f = final;
    if (lm)
      final = 1, st.m = lbt, st.d = dm, st.n = dbt;
  } while (!final);
  return bt != buf.length && noBuf ? slc(buf, 0, bt) : buf.subarray(0, bt);
};
var wbits = function(d, p, v) {
  v <<= p & 7;
  var o = p / 8 | 0;
  d[o] |= v;
  d[o + 1] |= v >> 8;
};
var wbits16 = function(d, p, v) {
  v <<= p & 7;
  var o = p / 8 | 0;
  d[o] |= v;
  d[o + 1] |= v >> 8;
  d[o + 2] |= v >> 16;
};
var hTree = function(d, mb) {
  var t = [];
  for (var i2 = 0; i2 < d.length; ++i2) {
    if (d[i2])
      t.push({ s: i2, f: d[i2] });
  }
  var s = t.length;
  var t2 = t.slice();
  if (!s)
    return { t: et, l: 0 };
  if (s == 1) {
    var v = new u8(t[0].s + 1);
    v[t[0].s] = 1;
    return { t: v, l: 1 };
  }
  t.sort(function(a, b) {
    return a.f - b.f;
  });
  t.push({ s: -1, f: 25001 });
  var l = t[0], r = t[1], i0 = 0, i1 = 1, i22 = 2;
  t[0] = { s: -1, f: l.f + r.f, l, r };
  while (i1 != s - 1) {
    l = t[t[i0].f < t[i22].f ? i0++ : i22++];
    r = t[i0 != i1 && t[i0].f < t[i22].f ? i0++ : i22++];
    t[i1++] = { s: -1, f: l.f + r.f, l, r };
  }
  var maxSym = t2[0].s;
  for (var i2 = 1; i2 < s; ++i2) {
    if (t2[i2].s > maxSym)
      maxSym = t2[i2].s;
  }
  var tr = new u16(maxSym + 1);
  var mbt = ln(t[i1 - 1], tr, 0);
  if (mbt > mb) {
    var i2 = 0, dt = 0;
    var lft = mbt - mb, cst = 1 << lft;
    t2.sort(function(a, b) {
      return tr[b.s] - tr[a.s] || a.f - b.f;
    });
    for (; i2 < s; ++i2) {
      var i2_1 = t2[i2].s;
      if (tr[i2_1] > mb) {
        dt += cst - (1 << mbt - tr[i2_1]);
        tr[i2_1] = mb;
      } else
        break;
    }
    dt >>= lft;
    while (dt > 0) {
      var i2_2 = t2[i2].s;
      if (tr[i2_2] < mb)
        dt -= 1 << mb - tr[i2_2]++ - 1;
      else
        ++i2;
    }
    for (; i2 >= 0 && dt; --i2) {
      var i2_3 = t2[i2].s;
      if (tr[i2_3] == mb) {
        --tr[i2_3];
        ++dt;
      }
    }
    mbt = mb;
  }
  return { t: new u8(tr), l: mbt };
};
var ln = function(n, l, d) {
  return n.s == -1 ? Math.max(ln(n.l, l, d + 1), ln(n.r, l, d + 1)) : l[n.s] = d;
};
var lc = function(c) {
  var s = c.length;
  while (s && !c[--s])
    ;
  var cl = new u16(++s);
  var cli = 0, cln = c[0], cls = 1;
  var w = function(v) {
    cl[cli++] = v;
  };
  for (var i2 = 1; i2 <= s; ++i2) {
    if (c[i2] == cln && i2 != s)
      ++cls;
    else {
      if (!cln && cls > 2) {
        for (; cls > 138; cls -= 138)
          w(32754);
        if (cls > 2) {
          w(cls > 10 ? cls - 11 << 5 | 28690 : cls - 3 << 5 | 12305);
          cls = 0;
        }
      } else if (cls > 3) {
        w(cln), --cls;
        for (; cls > 6; cls -= 6)
          w(8304);
        if (cls > 2)
          w(cls - 3 << 5 | 8208), cls = 0;
      }
      while (cls--)
        w(cln);
      cls = 1;
      cln = c[i2];
    }
  }
  return { c: cl.subarray(0, cli), n: s };
};
var clen = function(cf, cl) {
  var l = 0;
  for (var i2 = 0; i2 < cl.length; ++i2)
    l += cf[i2] * cl[i2];
  return l;
};
var wfblk = function(out, pos, dat) {
  var s = dat.length;
  var o = shft(pos + 2);
  out[o] = s & 255;
  out[o + 1] = s >> 8;
  out[o + 2] = out[o] ^ 255;
  out[o + 3] = out[o + 1] ^ 255;
  for (var i2 = 0; i2 < s; ++i2)
    out[o + i2 + 4] = dat[i2];
  return (o + 4 + s) * 8;
};
var wblk = function(dat, out, final, syms, lf, df, eb, li, bs, bl, p) {
  wbits(out, p++, final);
  ++lf[256];
  var _a2 = hTree(lf, 15), dlt = _a2.t, mlb = _a2.l;
  var _b2 = hTree(df, 15), ddt = _b2.t, mdb = _b2.l;
  var _c = lc(dlt), lclt = _c.c, nlc = _c.n;
  var _d = lc(ddt), lcdt = _d.c, ndc = _d.n;
  var lcfreq = new u16(19);
  for (var i2 = 0; i2 < lclt.length; ++i2)
    ++lcfreq[lclt[i2] & 31];
  for (var i2 = 0; i2 < lcdt.length; ++i2)
    ++lcfreq[lcdt[i2] & 31];
  var _e = hTree(lcfreq, 7), lct = _e.t, mlcb = _e.l;
  var nlcc = 19;
  for (; nlcc > 4 && !lct[clim[nlcc - 1]]; --nlcc)
    ;
  var flen = bl + 5 << 3;
  var ftlen = clen(lf, flt) + clen(df, fdt) + eb;
  var dtlen = clen(lf, dlt) + clen(df, ddt) + eb + 14 + 3 * nlcc + clen(lcfreq, lct) + 2 * lcfreq[16] + 3 * lcfreq[17] + 7 * lcfreq[18];
  if (bs >= 0 && flen <= ftlen && flen <= dtlen)
    return wfblk(out, p, dat.subarray(bs, bs + bl));
  var lm, ll, dm, dl;
  wbits(out, p, 1 + (dtlen < ftlen)), p += 2;
  if (dtlen < ftlen) {
    lm = hMap(dlt, mlb, 0), ll = dlt, dm = hMap(ddt, mdb, 0), dl = ddt;
    var llm = hMap(lct, mlcb, 0);
    wbits(out, p, nlc - 257);
    wbits(out, p + 5, ndc - 1);
    wbits(out, p + 10, nlcc - 4);
    p += 14;
    for (var i2 = 0; i2 < nlcc; ++i2)
      wbits(out, p + 3 * i2, lct[clim[i2]]);
    p += 3 * nlcc;
    var lcts = [lclt, lcdt];
    for (var it = 0; it < 2; ++it) {
      var clct = lcts[it];
      for (var i2 = 0; i2 < clct.length; ++i2) {
        var len = clct[i2] & 31;
        wbits(out, p, llm[len]), p += lct[len];
        if (len > 15)
          wbits(out, p, clct[i2] >> 5 & 127), p += clct[i2] >> 12;
      }
    }
  } else {
    lm = flm, ll = flt, dm = fdm, dl = fdt;
  }
  for (var i2 = 0; i2 < li; ++i2) {
    var sym = syms[i2];
    if (sym > 255) {
      var len = sym >> 18 & 31;
      wbits16(out, p, lm[len + 257]), p += ll[len + 257];
      if (len > 7)
        wbits(out, p, sym >> 23 & 31), p += fleb[len];
      var dst = sym & 31;
      wbits16(out, p, dm[dst]), p += dl[dst];
      if (dst > 3)
        wbits16(out, p, sym >> 5 & 8191), p += fdeb[dst];
    } else {
      wbits16(out, p, lm[sym]), p += ll[sym];
    }
  }
  wbits16(out, p, lm[256]);
  return p + ll[256];
};
var deo = /* @__PURE__ */ new i32([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
var et = /* @__PURE__ */ new u8(0);
var dflt = function(dat, lvl, plvl, pre, post, st) {
  var s = st.z || dat.length;
  var o = new u8(pre + s + 5 * (1 + Math.ceil(s / 7e3)) + post);
  var w = o.subarray(pre, o.length - post);
  var lst = st.l;
  var pos = (st.r || 0) & 7;
  if (lvl) {
    if (pos)
      w[0] = st.r >> 3;
    var opt = deo[lvl - 1];
    var n = opt >> 13, c = opt & 8191;
    var msk_1 = (1 << plvl) - 1;
    var prev = st.p || new u16(32768), head = st.h || new u16(msk_1 + 1);
    var bs1_1 = Math.ceil(plvl / 3), bs2_1 = 2 * bs1_1;
    var hsh = function(i3) {
      return (dat[i3] ^ dat[i3 + 1] << bs1_1 ^ dat[i3 + 2] << bs2_1) & msk_1;
    };
    var syms = new i32(25e3);
    var lf = new u16(288), df = new u16(32);
    var lc_1 = 0, eb = 0, i2 = st.i || 0, li = 0, wi = st.w || 0, bs = 0;
    for (; i2 + 2 < s; ++i2) {
      var hv = hsh(i2);
      var imod = i2 & 32767, pimod = head[hv];
      prev[imod] = pimod;
      head[hv] = imod;
      if (wi <= i2) {
        var rem = s - i2;
        if ((lc_1 > 7e3 || li > 24576) && (rem > 423 || !lst)) {
          pos = wblk(dat, w, 0, syms, lf, df, eb, li, bs, i2 - bs, pos);
          li = lc_1 = eb = 0, bs = i2;
          for (var j = 0; j < 286; ++j)
            lf[j] = 0;
          for (var j = 0; j < 30; ++j)
            df[j] = 0;
        }
        var l = 2, d = 0, ch_1 = c, dif = imod - pimod & 32767;
        if (rem > 2 && hv == hsh(i2 - dif)) {
          var maxn = Math.min(n, rem) - 1;
          var maxd = Math.min(32767, i2);
          var ml = Math.min(258, rem);
          while (dif <= maxd && --ch_1 && imod != pimod) {
            if (dat[i2 + l] == dat[i2 + l - dif]) {
              var nl = 0;
              for (; nl < ml && dat[i2 + nl] == dat[i2 + nl - dif]; ++nl)
                ;
              if (nl > l) {
                l = nl, d = dif;
                if (nl > maxn)
                  break;
                var mmd = Math.min(dif, nl - 2);
                var md = 0;
                for (var j = 0; j < mmd; ++j) {
                  var ti = i2 - dif + j & 32767;
                  var pti = prev[ti];
                  var cd = ti - pti & 32767;
                  if (cd > md)
                    md = cd, pimod = ti;
                }
              }
            }
            imod = pimod, pimod = prev[imod];
            dif += imod - pimod & 32767;
          }
        }
        if (d) {
          syms[li++] = 268435456 | revfl[l] << 18 | revfd[d];
          var lin = revfl[l] & 31, din = revfd[d] & 31;
          eb += fleb[lin] + fdeb[din];
          ++lf[257 + lin];
          ++df[din];
          wi = i2 + l;
          ++lc_1;
        } else {
          syms[li++] = dat[i2];
          ++lf[dat[i2]];
        }
      }
    }
    for (i2 = Math.max(i2, wi); i2 < s; ++i2) {
      syms[li++] = dat[i2];
      ++lf[dat[i2]];
    }
    pos = wblk(dat, w, lst, syms, lf, df, eb, li, bs, i2 - bs, pos);
    if (!lst) {
      st.r = pos & 7 | w[pos / 8 | 0] << 3;
      pos -= 7;
      st.h = head, st.p = prev, st.i = i2, st.w = wi;
    }
  } else {
    for (var i2 = st.w || 0; i2 < s + lst; i2 += 65535) {
      var e = i2 + 65535;
      if (e >= s) {
        w[pos / 8 | 0] = lst;
        e = s;
      }
      pos = wfblk(w, pos + 1, dat.subarray(i2, e));
    }
    st.i = s;
  }
  return slc(o, 0, pre + shft(pos) + post);
};
var crct = /* @__PURE__ */ (function() {
  var t = new Int32Array(256);
  for (var i2 = 0; i2 < 256; ++i2) {
    var c = i2, k = 9;
    while (--k)
      c = (c & 1 && -306674912) ^ c >>> 1;
    t[i2] = c;
  }
  return t;
})();
var crc = function() {
  var c = -1;
  return {
    p: function(d) {
      var cr = c;
      for (var i2 = 0; i2 < d.length; ++i2)
        cr = crct[cr & 255 ^ d[i2]] ^ cr >>> 8;
      c = cr;
    },
    d: function() {
      return ~c;
    }
  };
};
var dopt = function(dat, opt, pre, post, st) {
  if (!st) {
    st = { l: 1 };
    if (opt.dictionary) {
      var dict = opt.dictionary.subarray(-32768);
      var newDat = new u8(dict.length + dat.length);
      newDat.set(dict);
      newDat.set(dat, dict.length);
      dat = newDat;
      st.w = dict.length;
    }
  }
  return dflt(dat, opt.level == null ? 6 : opt.level, opt.mem == null ? st.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(dat.length))) * 1.5) : 20 : 12 + opt.mem, pre, post, st);
};
var mrg = function(a, b) {
  var o = {};
  for (var k in a)
    o[k] = a[k];
  for (var k in b)
    o[k] = b[k];
  return o;
};
var b2 = function(d, b) {
  return d[b] | d[b + 1] << 8;
};
var b4 = function(d, b) {
  return (d[b] | d[b + 1] << 8 | d[b + 2] << 16 | d[b + 3] << 24) >>> 0;
};
var b8 = function(d, b) {
  return b4(d, b) + b4(d, b + 4) * 4294967296;
};
var wbytes = function(d, b, v) {
  for (; v; ++b)
    d[b] = v, v >>>= 8;
};
function deflateSync(data, opts) {
  return dopt(data, opts || {}, 0, 0);
}
function inflateSync(data, opts) {
  return inflt(data, { i: 2 }, opts && opts.out, opts && opts.dictionary);
}
var fltn = function(d, p, t, o) {
  for (var k in d) {
    var val = d[k], n = p + k, op = o;
    if (Array.isArray(val))
      op = mrg(o, val[1]), val = val[0];
    if (ArrayBuffer.isView(val))
      t[n] = [val, op];
    else {
      t[n += "/"] = [new u8(0), op];
      fltn(val, n, t, o);
    }
  }
};
var te = typeof TextEncoder != "undefined" && /* @__PURE__ */ new TextEncoder();
var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
var tds = 0;
try {
  td.decode(et, { stream: true });
  tds = 1;
} catch (e) {
}
var dutf8 = function(d) {
  for (var r = "", i2 = 0; ; ) {
    var c = d[i2++];
    var eb = (c > 127) + (c > 223) + (c > 239);
    if (i2 + eb > d.length)
      return { s: r, r: slc(d, i2 - 1) };
    if (!eb)
      r += String.fromCharCode(c);
    else if (eb == 3) {
      c = ((c & 15) << 18 | (d[i2++] & 63) << 12 | (d[i2++] & 63) << 6 | d[i2++] & 63) - 65536, r += String.fromCharCode(55296 | c >> 10, 56320 | c & 1023);
    } else if (eb & 1)
      r += String.fromCharCode((c & 31) << 6 | d[i2++] & 63);
    else
      r += String.fromCharCode((c & 15) << 12 | (d[i2++] & 63) << 6 | d[i2++] & 63);
  }
};
function strToU8(str, latin1) {
  if (latin1) {
    var ar_1 = new u8(str.length);
    for (var i2 = 0; i2 < str.length; ++i2)
      ar_1[i2] = str.charCodeAt(i2);
    return ar_1;
  }
  if (te)
    return te.encode(str);
  var l = str.length;
  var ar = new u8(str.length + (str.length >> 1));
  var ai = 0;
  var w = function(v) {
    ar[ai++] = v;
  };
  for (var i2 = 0; i2 < l; ++i2) {
    if (ai + 5 > ar.length) {
      var n = new u8(ai + 8 + (l - i2 << 1));
      n.set(ar);
      ar = n;
    }
    var c = str.charCodeAt(i2);
    if (c < 128 || latin1)
      w(c);
    else if (c < 2048)
      w(192 | c >> 6), w(128 | c & 63);
    else if (c > 55295 && c < 57344)
      c = 65536 + (c & 1023 << 10) | str.charCodeAt(++i2) & 1023, w(240 | c >> 18), w(128 | c >> 12 & 63), w(128 | c >> 6 & 63), w(128 | c & 63);
    else
      w(224 | c >> 12), w(128 | c >> 6 & 63), w(128 | c & 63);
  }
  return slc(ar, 0, ai);
}
function strFromU8(dat, latin1) {
  if (latin1) {
    var r = "";
    for (var i2 = 0; i2 < dat.length; i2 += 16384)
      r += String.fromCharCode.apply(null, dat.subarray(i2, i2 + 16384));
    return r;
  } else if (td) {
    return td.decode(dat);
  } else {
    var _a2 = dutf8(dat), s = _a2.s, r = _a2.r;
    if (r.length)
      err(8);
    return s;
  }
}
var slzh = function(d, b) {
  return b + 30 + b2(d, b + 26) + b2(d, b + 28);
};
var zh = function(d, b, z) {
  var fnl = b2(d, b + 28), efl = b2(d, b + 30), fn = strFromU8(d.subarray(b + 46, b + 46 + fnl), !(b2(d, b + 8) & 2048)), es = b + 46 + fnl;
  var _a2 = z64hs(d, es, efl, z, b4(d, b + 20), b4(d, b + 24), b4(d, b + 42)), sc = _a2[0], su = _a2[1], off = _a2[2];
  return [b2(d, b + 10), sc, su, fn, es + efl + b2(d, b + 32), off];
};
var z64hs = function(d, b, l, z, sc, su, off) {
  var nsc = sc == 4294967295, nsu = su == 4294967295, noff = off == 4294967295, e = b + l;
  var nf = nsc + nsu + noff;
  if (z && nf) {
    for (; b + 4 < e; b += 4 + b2(d, b + 2)) {
      if (b2(d, b) == 1) {
        return [
          nsc ? b8(d, b + 4 + 8 * nsu) : sc,
          nsu ? b8(d, b + 4) : su,
          noff ? b8(d, b + 4 + 8 * (nsu + nsc)) : off,
          1
        ];
      }
    }
    if (z < 2)
      err(13);
  }
  return [sc, su, off, 0];
};
var exfl = function(ex) {
  var le = 0;
  if (ex) {
    for (var k in ex) {
      var l = ex[k].length;
      if (l > 65535)
        err(9);
      le += l + 4;
    }
  }
  return le;
};
var wzh = function(d, b, f, fn, u, c, ce, co) {
  var fl2 = fn.length, ex = f.extra, col = co && co.length;
  var exl = exfl(ex);
  wbytes(d, b, ce != null ? 33639248 : 67324752), b += 4;
  if (ce != null)
    d[b++] = 20, d[b++] = f.os;
  d[b] = 20, b += 2;
  d[b++] = f.flag << 1 | (c < 0 && 8), d[b++] = u && 8;
  d[b++] = f.compression & 255, d[b++] = f.compression >> 8;
  var dt = new Date(f.mtime == null ? Date.now() : f.mtime), y = dt.getFullYear() - 1980;
  if (y < 0 || y > 119)
    err(10);
  wbytes(d, b, y << 25 | dt.getMonth() + 1 << 21 | dt.getDate() << 16 | dt.getHours() << 11 | dt.getMinutes() << 5 | dt.getSeconds() >> 1), b += 4;
  if (c != -1) {
    wbytes(d, b, f.crc);
    wbytes(d, b + 4, c < 0 ? -c - 2 : c);
    wbytes(d, b + 8, f.size);
  }
  wbytes(d, b + 12, fl2);
  wbytes(d, b + 14, exl), b += 16;
  if (ce != null) {
    wbytes(d, b, col);
    wbytes(d, b + 6, f.attrs);
    wbytes(d, b + 10, ce), b += 14;
  }
  d.set(fn, b);
  b += fl2;
  if (exl) {
    for (var k in ex) {
      var exf = ex[k], l = exf.length;
      wbytes(d, b, +k);
      wbytes(d, b + 2, l);
      d.set(exf, b + 4), b += 4 + l;
    }
  }
  if (col)
    d.set(co, b), b += col;
  return b;
};
var wzf = function(o, b, c, d, e) {
  wbytes(o, b, 101010256);
  wbytes(o, b + 8, c);
  wbytes(o, b + 10, c);
  wbytes(o, b + 12, d);
  wbytes(o, b + 16, e);
};
function zipSync(data, opts) {
  if (!opts)
    opts = {};
  var r = {};
  var files = [];
  fltn(data, "", r, opts);
  var o = 0;
  var tot = 0;
  for (var fn in r) {
    var _a2 = r[fn], file = _a2[0], p = _a2[1];
    var compression = p.level == 0 ? 0 : 8;
    var f = strToU8(fn), s = f.length;
    var com = p.comment, m = com && strToU8(com), ms = m && m.length;
    var exl = exfl(p.extra);
    if (s > 65535)
      err(11);
    var d = compression ? deflateSync(file, p) : file, l = d.length;
    var c = crc();
    c.p(file);
    files.push(mrg(p, {
      size: file.length,
      crc: c.d(),
      c: d,
      f,
      m,
      u: s != fn.length || m && com.length != ms,
      o,
      compression
    }));
    o += 30 + s + exl + l;
    tot += 76 + 2 * (s + exl) + (ms || 0) + l;
  }
  var out = new u8(tot + 22), oe = o, cdl = tot - o;
  for (var i2 = 0; i2 < files.length; ++i2) {
    var f = files[i2];
    wzh(out, f.o, f, f.f, f.u, f.c.length);
    var badd = 30 + f.f.length + exfl(f.extra);
    out.set(f.c, f.o + badd);
    wzh(out, o, f, f.f, f.u, f.c.length, f.o, f.m), o += 16 + badd + (f.m ? f.m.length : 0);
  }
  wzf(out, o, files.length, cdl, oe);
  return out;
}
function unzipSync(data, opts) {
  var files = {};
  var e = data.length - 22;
  for (; b4(data, e) != 101010256; --e) {
    if (!e || data.length - e > 65558)
      err(13);
  }
  ;
  var c = b2(data, e + 8);
  if (!c)
    return {};
  var o = b4(data, e + 16);
  var z = b4(data, e - 20) == 117853008;
  if (z) {
    var ze = b4(data, e - 12);
    z = b4(data, ze) == 101075792;
    if (z) {
      c = b4(data, ze + 32);
      o = b4(data, ze + 48);
    }
  }
  var fltr = opts && opts.filter;
  for (var i2 = 0; i2 < c; ++i2) {
    var _a2 = zh(data, o, z), c_2 = _a2[0], sc = _a2[1], su = _a2[2], fn = _a2[3], no = _a2[4], off = _a2[5], b = slzh(data, off);
    o = no;
    if (!fltr || fltr({
      name: fn,
      size: sc,
      originalSize: su,
      compression: c_2
    })) {
      if (!c_2)
        files[fn] = slc(data, b, b + sc);
      else if (c_2 == 8)
        files[fn] = inflateSync(data.subarray(b, b + sc), { out: new u8(su) });
      else
        err(14, "unknown compression type " + c_2);
    }
  }
  return files;
}

// src/folderSuggest.ts
var import_obsidian26 = require("obsidian");
var FolderSuggestModal = class extends import_obsidian26.FuzzySuggestModal {
  constructor(app, onChoose) {
    super(app);
    this.appRef = app;
    this.onChoose = onChoose;
    this.folders = this.appRef.vault.getAllLoadedFiles().filter((f) => f instanceof import_obsidian26.TFolder).sort((a, b) => a.path.localeCompare(b.path));
    this.setPlaceholder("Choose folder\u2026");
  }
  getItems() {
    return this.folders;
  }
  getItemText(item) {
    return item.path;
  }
  onChooseItem(item) {
    this.onChoose(item);
  }
};

// src/mapShare.ts
var BUNDLE_JSON_PATH = "zoommap-bundle.json";
var IMAGE_EXTENSIONS = /* @__PURE__ */ new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "svg",
  "bmp",
  "avif"
]);
var VIDEO_EXTENSIONS = /* @__PURE__ */ new Set([
  "mp4",
  "webm",
  "mov",
  "m4v",
  "avi",
  "mkv"
]);
var PDF_EXTENSIONS = /* @__PURE__ */ new Set([
  "pdf"
]);
var AUDIO_EXTENSIONS = /* @__PURE__ */ new Set([
  "mp3",
  "wav",
  "ogg",
  "m4a",
  "flac",
  "aac"
]);
function classifyNoteMediaKind(ext, options) {
  const e = (ext != null ? ext : "").trim().toLowerCase();
  if (!e) return null;
  if (options.includeNoteImages && IMAGE_EXTENSIONS.has(e)) return "note-image";
  if (options.includeNoteVideos && VIDEO_EXTENSIONS.has(e)) return "note-video";
  if (options.includeNotePdfs && PDF_EXTENSIONS.has(e)) return "note-pdf";
  if (options.includeNoteAudio && AUDIO_EXTENSIONS.has(e)) return "note-audio";
  return null;
}
function deepClone5(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}
function stableStringify2(value) {
  const seen = /* @__PURE__ */ new WeakSet();
  const norm = (v) => {
    if (v && typeof v === "object") {
      if (seen.has(v)) return null;
      seen.add(v);
      if (Array.isArray(v)) return v.map(norm);
      const out = {};
      for (const key of Object.keys(v).sort()) {
        out[key] = norm(v[key]);
      }
      return out;
    }
    return v;
  };
  return JSON.stringify(norm(value));
}
function folderOf2(path) {
  const idx = path.lastIndexOf("/");
  return idx >= 0 ? path.slice(0, idx) : "";
}
function basename2(path) {
  const idx = path.lastIndexOf("/");
  return idx >= 0 ? path.slice(idx + 1) : path;
}
function fileStem2(path) {
  const name = basename2(path);
  const idx = name.lastIndexOf(".");
  return idx >= 0 ? name.slice(0, idx) : name;
}
function sanitizeFileName(name) {
  return (name != null ? name : "").replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g, " ").trim();
}
function sanitizePathSegment(seg) {
  const cleaned = sanitizeFileName(seg).replace(/^\.+$/, "_");
  return cleaned || "_";
}
function safeRelativePath(originalPath) {
  const parts = (0, import_obsidian27.normalizePath)(originalPath).split("/").map((p) => p.trim()).filter((p) => p.length > 0 && p !== "." && p !== "..").map(sanitizePathSegment);
  return parts.length ? parts.join("/") : sanitizePathSegment(basename2(originalPath || "item"));
}
function joinRoot(root, originalPath) {
  const rel = safeRelativePath(originalPath);
  return (0, import_obsidian27.normalizePath)(`${root}/${rel}`);
}
function toArrayBuffer(bytes) {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  );
}
function ensureUint8Array(value, context) {
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  }
  throw new Error(`${context} did not return Uint8Array data.`);
}
function utf8Encode(text) {
  return ensureUint8Array(strToU8(text), "strToU8");
}
function utf8Decode(bytes) {
  const out = strFromU8(bytes);
  if (typeof out !== "string") {
    throw new Error("strFromU8 did not return a string.");
  }
  return out;
}
function unzipFilesStrict(bytes) {
  const raw = unzipSync(bytes);
  if (!isRecord2(raw)) {
    throw new Error("Invalid ZIP payload.");
  }
  const out = {};
  for (const [path, value] of Object.entries(raw)) {
    out[path] = ensureUint8Array(value, `unzipSync(${path})`);
  }
  return out;
}
function zipFilesStrict(files) {
  return ensureUint8Array(
    zipSync(files, { level: 6 }),
    "zipSync"
  );
}
function isRecord2(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isBundleAssetKind(value) {
  return value === "base" || value === "overlay" || value === "frame" || value === "sticker" || value === "drawing" || value === "linked-note" || value === "note-image" || value === "note-video" || value === "note-pdf" || value === "note-audio";
}
function isBundleAssetEntry(value) {
  return isRecord2(value) && isBundleAssetKind(value.kind) && typeof value.originalPath === "string" && typeof value.zipPath === "string";
}
function isZoomMapBundleV1(value) {
  return isRecord2(value) && value.version === 1 && typeof value.exportedAt === "string" && typeof value.bundleName === "string" && isRecord2(value.map) && Array.isArray(value.assets) && value.assets.every(isBundleAssetEntry);
}
function mimeFromPath(path) {
  var _a2, _b2;
  const ext = (_b2 = (_a2 = basename2(path).split(".").pop()) == null ? void 0 : _a2.toLowerCase()) != null ? _b2 : "";
  switch (ext) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}
function arrayBufferToBase64(buf) {
  const bytes = new Uint8Array(buf);
  const chunkSize = 32768;
  let binary = "";
  for (let i2 = 0; i2 < bytes.length; i2 += chunkSize) {
    const chunk = bytes.subarray(i2, i2 + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return safeBtoa(binary);
}
function dataUrlFromBytes(path, buf) {
  return `data:${mimeFromPath(path)};base64,${arrayBufferToBase64(buf)}`;
}
function safeBtoa(binary) {
  if (typeof window.btoa === "function") {
    return window.btoa(binary);
  }
  throw new Error("No base64 encoder available in this runtime.");
}
function isDataUrl(value) {
  return typeof value === "string" && value.startsWith("data:");
}
function normalizeBases(raw) {
  const out = [];
  for (const item of raw != null ? raw : []) {
    if (typeof item === "string") {
      out.push({ path: item });
    } else if (item && typeof item === "object" && "path" in item) {
      const path = item.path;
      const name = item.name;
      if (typeof path === "string" && path.trim()) {
        out.push({
          path,
          name: typeof name === "string" && name.trim() ? name : void 0
        });
      }
    }
  }
  return out;
}
function normalizeOverlays(raw) {
  return (raw != null ? raw : []).map((o) => ({
    path: o.path,
    visible: o.visible !== false,
    name: o.name
  }));
}
function splitRawLink(raw) {
  const trimmed = (raw != null ? raw : "").trim();
  const pipeIdx = trimmed.indexOf("|");
  const left = pipeIdx >= 0 ? trimmed.slice(0, pipeIdx) : trimmed;
  const alias = pipeIdx >= 0 ? trimmed.slice(pipeIdx + 1) : void 0;
  const hashIdx = left.indexOf("#");
  if (hashIdx >= 0) {
    return {
      path: left.slice(0, hashIdx).trim(),
      anchor: left.slice(hashIdx + 1).trim() || void 0,
      alias: (alias == null ? void 0 : alias.trim()) || void 0
    };
  }
  return {
    path: left.trim(),
    alias: (alias == null ? void 0 : alias.trim()) || void 0
  };
}
function buildRawLink(base, anchor, alias) {
  let out = base;
  if (anchor) out += `#${anchor}`;
  if (alias) out += `|${alias}`;
  return out;
}
function quoteAwareInsertionText(editor, codeBlock, inlineBlock) {
  var _a2, _b2;
  const cursor = editor.getCursor();
  const line = (_a2 = editor.getLine(cursor.line)) != null ? _a2 : "";
  const m = /^(\s*(?:>\s*)+)/.exec(line);
  const quotePrefix = (_b2 = m == null ? void 0 : m[1]) != null ? _b2 : "";
  const normalizedCode = `${codeBlock.trimEnd()}
`;
  const normalizedInline = inlineBlock ? `${inlineBlock.trimEnd()}
` : "";
  if (!quotePrefix) {
    return normalizedInline ? `${normalizedCode}
${normalizedInline}` : normalizedCode;
  }
  const cursorAfterPrefix = cursor.ch >= quotePrefix.length;
  const quotedCode = normalizedCode.split("\n").map((ln2, idx) => {
    if (idx === normalizedCode.split("\n").length - 1 && ln2 === "") return "";
    if (idx === 0 && cursorAfterPrefix) return ln2;
    return `${quotePrefix}${ln2}`;
  }).join("\n").trimEnd() + "\n";
  return normalizedInline ? `${quotedCode}
${normalizedInline}` : quotedCode;
}
function buildInlineStorageBlock(mapId, data) {
  const payload = JSON.stringify(sanitizeMarkerFileDataForSave(data), null, 2);
  return [
    "%%",
    `ZOOMMAP-DATA id=${mapId}`,
    payload,
    "/ZOOMMAP-DATA",
    "%%",
    ""
  ].join("\n");
}
function downloadZip(filename, bytes) {
  var _a2;
  const doc = getActiveDocumentSafe();
  const blob = new Blob([bytes], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const a = doc.createElement("a");
  a.href = url;
  a.download = filename;
  (_a2 = doc.body) == null ? void 0 : _a2.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1e3);
}
function getActiveDocumentSafe() {
  const docUnknown = import_obsidian27.activeDocument;
  if (docUnknown && typeof docUnknown === "object" && "createElement" in docUnknown && typeof docUnknown.createElement === "function") {
    return docUnknown;
  }
  if (typeof window !== "undefined" && window.document) {
    return window.document;
  }
  throw new Error("No active document available.");
}
async function deleteVaultPathIfExists(app, path) {
  const existing = app.vault.getAbstractFileByPath((0, import_obsidian27.normalizePath)(path));
  if (!(existing instanceof import_obsidian27.TFile)) return;
  await app.fileManager.trashFile(existing, false);
}
async function ensureFolderPathExists(app, folder) {
  const normalized = (0, import_obsidian27.normalizePath)(folder).trim();
  if (!normalized) return;
  const parts = normalized.split("/").filter(Boolean);
  let current = "";
  for (const part of parts) {
    current = current ? `${current}/${part}` : part;
    if (!app.vault.getAbstractFileByPath(current)) {
      await app.vault.createFolder(current);
    }
  }
}
async function uniqueVaultPath(app, desiredPath, reserved) {
  const normalized = (0, import_obsidian27.normalizePath)(desiredPath);
  if (!app.vault.getAbstractFileByPath(normalized) && !(reserved == null ? void 0 : reserved.has(normalized))) {
    reserved == null ? void 0 : reserved.add(normalized);
    return normalized;
  }
  const dir = folderOf2(normalized);
  const base = basename2(normalized);
  const dot = base.lastIndexOf(".");
  const stem = dot >= 0 ? base.slice(0, dot) : base;
  const ext = dot >= 0 ? base.slice(dot) : "";
  let i2 = 1;
  while (true) {
    const candidate = (0, import_obsidian27.normalizePath)(`${dir}/${stem}-${i2}${ext}`);
    if (!app.vault.getAbstractFileByPath(candidate) && !(reserved == null ? void 0 : reserved.has(candidate))) {
      reserved == null ? void 0 : reserved.add(candidate);
      return candidate;
    }
    i2 += 1;
  }
}
async function readVaultBinary(app, file) {
  const vaultAny = app.vault;
  if (typeof vaultAny.readBinary === "function") {
    const raw = await vaultAny.readBinary(file);
    return raw instanceof Uint8Array ? raw : new Uint8Array(raw);
  }
  const adapterAny = app.vault.adapter;
  if (typeof adapterAny.readBinary === "function") {
    const raw = await adapterAny.readBinary(file.path);
    return raw instanceof Uint8Array ? raw : new Uint8Array(raw);
  }
  throw new Error(`Cannot read binary file: ${file.path}`);
}
async function writeVaultBinary(app, path, bytes) {
  const normalized = (0, import_obsidian27.normalizePath)(path);
  await ensureFolderPathExists(app, folderOf2(normalized));
  const existing = app.vault.getAbstractFileByPath(normalized);
  const buf = toArrayBuffer(bytes);
  const vaultAny = app.vault;
  if (existing instanceof import_obsidian27.TFile && typeof vaultAny.modifyBinary === "function") {
    await vaultAny.modifyBinary(existing, buf);
    return;
  }
  if (!(existing instanceof import_obsidian27.TFile) && typeof vaultAny.createBinary === "function") {
    await vaultAny.createBinary(normalized, buf);
    return;
  }
  const adapterAny = app.vault.adapter;
  if (typeof adapterAny.writeBinary === "function") {
    await adapterAny.writeBinary(normalized, buf);
    return;
  }
  throw new Error(`Cannot write binary file: ${normalized}`);
}
async function writeVaultText(app, path, text) {
  const normalized = (0, import_obsidian27.normalizePath)(path);
  await ensureFolderPathExists(app, folderOf2(normalized));
  const existing = app.vault.getAbstractFileByPath(normalized);
  if (existing instanceof import_obsidian27.TFile) {
    await app.vault.modify(existing, text);
  } else {
    await app.vault.create(normalized, text);
  }
}
function resolveFile(app, pathOrLink, fromPath) {
  const trimmed = (pathOrLink != null ? pathOrLink : "").trim();
  if (!trimmed) return null;
  const byPath = app.vault.getAbstractFileByPath(trimmed);
  if (byPath instanceof import_obsidian27.TFile) return byPath;
  const dest = app.metadataCache.getFirstLinkpathDest(trimmed, fromPath);
  return dest instanceof import_obsidian27.TFile ? dest : null;
}
function normalizeIconSignature(icon) {
  const copy = deepClone5(icon);
  delete copy.key;
  return stableStringify2(copy);
}
function normalizeSwapSignature(preset) {
  const copy = deepClone5(preset);
  delete copy.id;
  return stableStringify2(copy);
}
function normalizePingSignature(preset) {
  const copy = deepClone5(preset);
  delete copy.id;
  return stableStringify2(copy);
}
function normalizeStickerSignature(preset) {
  return stableStringify2(preset);
}
function uniqueCollectionItemId(prefix, taken, desired) {
  let candidate = (desired != null ? desired : "").trim();
  if (!candidate || taken.has(candidate)) candidate = `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
  while (taken.has(candidate)) {
    candidate = `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
  }
  taken.add(candidate);
  return candidate;
}
function bundleUsesCustomUnits(data) {
  var _a2, _b2;
  if (((_a2 = data.measurement) == null ? void 0 : _a2.displayUnit) === "custom") return true;
  if (((_b2 = data.markers) != null ? _b2 : []).some((m) => m.pingRadiusUnit === "custom")) return true;
  return false;
}
function isCustomFontValue(value) {
  const v = (value != null ? value : "").trim().toLowerCase();
  if (!v) return false;
  if (v.startsWith("var(")) return false;
  if (v === "system-ui" || v === "sans-serif" || v === "serif" || v === "monospace") return false;
  if (v.includes("var(--font-")) return false;
  return true;
}
function collectCustomFonts(data) {
  var _a2, _b2;
  const out = /* @__PURE__ */ new Set();
  const addStyle = (style) => {
    var _a3;
    const family = ((_a3 = style == null ? void 0 : style.fontFamily) != null ? _a3 : "").trim();
    if (family && isCustomFontValue(family)) out.add(family);
  };
  for (const layer of (_a2 = data.textLayers) != null ? _a2 : []) {
    addStyle(layer.style);
    for (const box of (_b2 = layer.boxes) != null ? _b2 : []) addStyle(box.style);
  }
  return [...out].sort((a, b) => a.localeCompare(b));
}
function ensureCollectionArrays(col) {
  var _a2, _b2, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
  (_a2 = col.bindings) != null ? _a2 : col.bindings = { basePaths: [] };
  (_c = (_b2 = col.bindings).basePaths) != null ? _c : _b2.basePaths = [];
  (_d = col.include) != null ? _d : col.include = {
    pinKeys: [],
    favorites: [],
    stickers: [],
    swapPins: [],
    pingPins: []
  };
  (_f = (_e = col.include).pinKeys) != null ? _f : _e.pinKeys = [];
  (_h = (_g = col.include).favorites) != null ? _h : _g.favorites = [];
  (_j = (_i = col.include).stickers) != null ? _j : _i.stickers = [];
  (_l = (_k = col.include).swapPins) != null ? _l : _k.swapPins = [];
  (_n = (_m = col.include).pingPins) != null ? _n : _m.pingPins = [];
}
function createSyntheticStickerPresets(data) {
  var _a2, _b2;
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const marker of (_a2 = data.markers) != null ? _a2 : []) {
    if (marker.type !== "sticker" || !marker.stickerPath) continue;
    const preset = {
      name: fileStem2(marker.stickerPath) || "Sticker",
      imagePath: marker.stickerPath,
      size: Math.max(1, Math.round((_b2 = marker.stickerSize) != null ? _b2 : 64)),
      openEditor: false
    };
    const sig = normalizeStickerSignature(preset);
    if (seen.has(sig)) continue;
    seen.add(sig);
    out.push(preset);
  }
  return out;
}
function findSwapPreset(plugin, id) {
  var _a2, _b2, _c;
  const cols = (_a2 = plugin.settings.baseCollections) != null ? _a2 : [];
  for (const col of cols) {
    const found = ((_c = (_b2 = col.include) == null ? void 0 : _b2.swapPins) != null ? _c : []).find((sp) => sp.id === id);
    if (found) return deepClone5(found);
  }
  return null;
}
function findPingPreset(plugin, id) {
  var _a2, _b2, _c;
  const cols = (_a2 = plugin.settings.baseCollections) != null ? _a2 : [];
  for (const col of cols) {
    const found = ((_c = (_b2 = col.include) == null ? void 0 : _b2.pingPins) != null ? _c : []).find((pp) => pp.id === id);
    if (found) return deepClone5(found);
  }
  return null;
}
function findIconLike(plugin, key) {
  var _a2;
  const existing = ((_a2 = plugin.settings.icons) != null ? _a2 : []).find((i2) => i2.key === key);
  if (existing) return deepClone5(existing);
  const builtin = plugin.builtinIcon();
  return {
    ...deepClone5(builtin),
    key: key || builtin.key,
    inCollections: true
  };
}
async function serializeIconForBundle(app, plugin, sourcePath, iconKey) {
  var _a2;
  const icon = findIconLike(plugin, iconKey);
  const src = (_a2 = icon.pathOrDataUrl) != null ? _a2 : "";
  if (isDataUrl(src)) return icon;
  const file = resolveFile(app, src, sourcePath);
  if (!file) return icon;
  const bytes = await readVaultBinary(app, file);
  return {
    ...icon,
    pathOrDataUrl: dataUrlFromBytes(file.path, toArrayBuffer(bytes))
  };
}
function collectUsedCollectionSubset(plugin, data, bundleName) {
  var _a2, _b2, _c, _d, _e, _f;
  const pinKeys = /* @__PURE__ */ new Set();
  const swapPins = [];
  const pingPins = [];
  const seenSwap = /* @__PURE__ */ new Set();
  const seenPing = /* @__PURE__ */ new Set();
  for (const marker of (_a2 = data.markers) != null ? _a2 : []) {
    if (marker.type !== "sticker") {
      const key = ((_c = (_b2 = marker.iconKey) != null ? _b2 : plugin.settings.defaultIconKey) != null ? _c : "").trim();
      if (key) pinKeys.add(key);
    }
    if (marker.type === "swap" && marker.swapKey && !seenSwap.has(marker.swapKey)) {
      const preset = findSwapPreset(plugin, marker.swapKey);
      if (preset) {
        swapPins.push(preset);
        seenSwap.add(marker.swapKey);
        for (const frame of (_d = preset.frames) != null ? _d : []) {
          const key = ((_e = frame.iconKey) != null ? _e : "").trim();
          if (key) pinKeys.add(key);
        }
      }
    }
    if (marker.type === "ping" && marker.pingPresetId && !seenPing.has(marker.pingPresetId)) {
      const preset = findPingPreset(plugin, marker.pingPresetId);
      if (preset) {
        pingPins.push(preset);
        seenPing.add(marker.pingPresetId);
        const key = ((_f = preset.iconKey) != null ? _f : "").trim();
        if (key) pinKeys.add(key);
      }
    }
  }
  return {
    suggestedName: `Imported ${bundleName}`,
    pinKeys: [...pinKeys].sort((a, b) => a.localeCompare(b)),
    favorites: [],
    stickers: createSyntheticStickerPresets(data),
    swapPins,
    pingPins
  };
}
function collectUsedIconKeys(plugin, data, subset, fallbackDefaultIconKey) {
  var _a2, _b2, _c, _d, _e, _f, _g, _h;
  const keys = /* @__PURE__ */ new Set();
  let needsFallbackDefault = false;
  for (const marker of (_a2 = data.markers) != null ? _a2 : []) {
    if (marker.type === "sticker") continue;
    const key = ((_b2 = marker.iconKey) != null ? _b2 : "").trim();
    if (key) keys.add(key);
    else needsFallbackDefault = true;
  }
  for (const key of subset.pinKeys) {
    if (key.trim()) keys.add(key.trim());
  }
  for (const preset of (_c = subset.swapPins) != null ? _c : []) {
    for (const frame of (_d = preset.frames) != null ? _d : []) {
      const key = ((_e = frame.iconKey) != null ? _e : "").trim();
      if (key) keys.add(key);
    }
  }
  for (const preset of (_f = subset.pingPins) != null ? _f : []) {
    const key = ((_g = preset.iconKey) != null ? _g : "").trim();
    if (key) keys.add(key);
  }
  const defaultKey = ((_h = fallbackDefaultIconKey != null ? fallbackDefaultIconKey : plugin.settings.defaultIconKey) != null ? _h : "").trim();
  if (needsFallbackDefault && defaultKey) keys.add(defaultKey);
  return [...keys].sort((a, b) => a.localeCompare(b));
}
function collectConfiguredAssetPaths(ctx) {
  var _a2, _b2, _c;
  const markerData = ctx.markerData;
  const basePaths = normalizeBases(markerData.bases).map((b) => b.path);
  const overlayPaths = normalizeOverlays(markerData.overlays).map((o) => o.path);
  const stickerPaths = ((_a2 = markerData.markers) != null ? _a2 : []).filter((m) => m.type === "sticker" && typeof m.stickerPath === "string").map((m) => m.stickerPath);
  const drawingPaths = ((_b2 = markerData.drawings) != null ? _b2 : []).map((d) => {
    var _a3;
    return (_a3 = d.bakedPath) != null ? _a3 : "";
  }).filter((p) => !!p);
  let framePath;
  const yamlObj = (_c = ctx.yamlObject) != null ? _c : {};
  const vp = yamlObj["viewportFrame"];
  if (typeof vp === "string" && vp.trim() && !isDataUrl(vp)) framePath = vp.trim();
  return {
    basePaths,
    overlayPaths,
    framePath,
    stickerPaths,
    drawingPaths
  };
}
function collectDirectResolvedNoteLinks(app, file, options) {
  var _a2, _b2, _c, _d;
  const resolvedLinks = {};
  const notePaths = /* @__PURE__ */ new Set();
  const mediaAssetPaths = /* @__PURE__ */ new Map();
  const cache = thisSafeFileCache(app, file);
  const rawLinks = /* @__PURE__ */ new Set();
  for (const entry of (_a2 = cache == null ? void 0 : cache.links) != null ? _a2 : []) {
    const raw = typeof entry.link === "string" ? entry.link.trim() : "";
    if (raw) rawLinks.add(raw);
  }
  for (const entry of (_b2 = cache == null ? void 0 : cache.embeds) != null ? _b2 : []) {
    const raw = typeof entry.link === "string" ? entry.link.trim() : "";
    if (raw) rawLinks.add(raw);
  }
  for (const raw of rawLinks) {
    const resolved = resolveFile(app, raw, file.path);
    if (!(resolved instanceof import_obsidian27.TFile)) continue;
    resolvedLinks[raw] = resolved.path;
    const ext = (_d = (_c = resolved.extension) == null ? void 0 : _c.toLowerCase()) != null ? _d : "";
    if (ext === "md") {
      notePaths.add(resolved.path);
      continue;
    }
    const mediaKind = classifyNoteMediaKind(ext, {
      includeNoteImages: !!(options == null ? void 0 : options.includeNoteImages),
      includeNoteVideos: !!(options == null ? void 0 : options.includeNoteVideos),
      includeNotePdfs: !!(options == null ? void 0 : options.includeNotePdfs),
      includeNoteAudio: !!(options == null ? void 0 : options.includeNoteAudio)
    });
    if (mediaKind) {
      mediaAssetPaths.set(resolved.path, mediaKind);
    }
  }
  return { resolvedLinks, notePaths, mediaAssetPaths };
}
function thisSafeFileCache(app, file) {
  var _a2;
  return (_a2 = app.metadataCache.getFileCache(file)) != null ? _a2 : null;
}
function collectRecursiveLinkedNotes(app, seedPaths, options) {
  var _a2;
  const linkedNotePaths = /* @__PURE__ */ new Set();
  const noteResolvedLinks = {};
  const mediaAssetPaths = /* @__PURE__ */ new Map();
  const queue = [...seedPaths];
  while (queue.length > 0) {
    const path = queue.shift();
    if (!path || linkedNotePaths.has(path)) continue;
    const af = app.vault.getAbstractFileByPath(path);
    if (!(af instanceof import_obsidian27.TFile)) continue;
    if (((_a2 = af.extension) == null ? void 0 : _a2.toLowerCase()) !== "md") continue;
    linkedNotePaths.add(af.path);
    const direct = collectDirectResolvedNoteLinks(app, af, options);
    if (Object.keys(direct.resolvedLinks).length > 0) {
      noteResolvedLinks[af.path] = direct.resolvedLinks;
    }
    for (const [mediaPath, kind] of direct.mediaAssetPaths.entries()) {
      if (!mediaAssetPaths.has(mediaPath)) {
        mediaAssetPaths.set(mediaPath, kind);
      }
    }
    if (!options.includeRecursiveLinkedNotes) {
      continue;
    }
    for (const childPath of direct.notePaths) {
      if (!linkedNotePaths.has(childPath)) queue.push(childPath);
    }
  }
  return { linkedNotePaths, noteResolvedLinks, mediaAssetPaths };
}
async function prepareExportData(app, plugin, ctx, options) {
  const markerData = deepClone5(sanitizeMarkerFileDataForSave(ctx.markerData));
  const subset = collectUsedCollectionSubset(plugin, markerData, options.zipName);
  const fallbackDefaultIconKey = ctx.yamlObject && typeof ctx.yamlObject.defaultIconKey === "string" ? ctx.yamlObject.defaultIconKey : void 0;
  const icons = [];
  for (const key of collectUsedIconKeys(plugin, markerData, subset, fallbackDefaultIconKey)) {
    icons.push(await serializeIconForBundle(app, plugin, ctx.sourcePath, key));
  }
  const seedLinks = collectResolvedLinksForExport(
    app,
    ctx,
    markerData,
    icons,
    subset,
    options.includeLinkedNotes
  );
  const recursive = options.includeLinkedNotes ? collectRecursiveLinkedNotes(app, seedLinks.linkedNotePaths, {
    includeRecursiveLinkedNotes: options.includeRecursiveLinkedNotes,
    includeNoteImages: options.includeNoteImages,
    includeNoteVideos: options.includeNoteVideos,
    includeNotePdfs: options.includeNotePdfs,
    includeNoteAudio: options.includeNoteAudio
  }) : {
    linkedNotePaths: /* @__PURE__ */ new Set(),
    noteResolvedLinks: {},
    mediaAssetPaths: /* @__PURE__ */ new Map()
  };
  return {
    markerData,
    subset,
    icons,
    resolvedLinks: seedLinks.resolvedLinks,
    linkedNotePaths: recursive.linkedNotePaths,
    noteResolvedLinks: recursive.noteResolvedLinks,
    mediaAssetPaths: recursive.mediaAssetPaths
  };
}
function buildZipAssetPath(kind, originalPath) {
  return `${kind}/${safeRelativePath(originalPath)}`;
}
function parseBundleSummary(bundle) {
  var _a2, _b2, _c, _d, _e;
  const data = bundle.map.markerData;
  const noteImages = bundle.assets.filter((a) => a.kind === "note-image").length;
  const noteVideos = bundle.assets.filter((a) => a.kind === "note-video").length;
  const notePdfs = bundle.assets.filter((a) => a.kind === "note-pdf").length;
  const noteAudio = bundle.assets.filter((a) => a.kind === "note-audio").length;
  return [
    `Storage: ${bundle.map.storageMode}`,
    `Bases: ${normalizeBases(data.bases).length}`,
    `Overlays: ${((_a2 = data.overlays) != null ? _a2 : []).length}`,
    `Markers: ${((_b2 = data.markers) != null ? _b2 : []).length}`,
    `Drawings: ${((_c = data.drawings) != null ? _c : []).length}`,
    `Text layers: ${((_d = data.textLayers) != null ? _d : []).length}`,
    `Icons: ${((_e = bundle.icons) != null ? _e : []).length}`,
    `Linked notes: ${bundle.assets.filter((a) => a.kind === "linked-note").length}`,
    `Note images: ${noteImages}`,
    `Note videos: ${noteVideos}`,
    `Note PDFs: ${notePdfs}`,
    `Note audio: ${noteAudio}`
  ];
}
function stripWikiLinkToText(raw) {
  var _a2;
  const parsed = splitRawLink(raw);
  if ((_a2 = parsed.alias) == null ? void 0 : _a2.trim()) return parsed.alias.trim();
  const path = parsed.path.trim();
  if (path) return path;
  return raw.trim();
}
function extractMarkdownHrefTarget(rawHref) {
  const trimmed = rawHref.trim();
  if (trimmed.startsWith("<") && trimmed.endsWith(">")) {
    return trimmed.slice(1, -1).trim();
  }
  const spaceIdx = trimmed.search(/\s/);
  return spaceIdx >= 0 ? trimmed.slice(0, spaceIdx).trim() : trimmed;
}
function isExternalHref(href) {
  const v = href.trim().toLowerCase();
  return v.startsWith("http://") || v.startsWith("https://") || v.startsWith("mailto:") || v.startsWith("ftp://");
}
function rewriteImportedNoteText(app, text, originalSourcePath, sourceResolvedLinks, notePathMap, filePathMap, targetNotePath, stripUnresolved) {
  const resolvedLookup = sourceResolvedLinks != null ? sourceResolvedLinks : {};
  const rewriteViaImportedPath = (rawLink, fallbackText) => {
    var _a2, _b2, _c;
    const resolvedOriginalPath = (_b2 = (_a2 = resolvedLookup[rawLink.trim()]) != null ? _a2 : resolvedLookup[extractMarkdownHrefTarget(rawLink)]) != null ? _b2 : resolvedLookup[splitRawLink(rawLink).path];
    if (!resolvedOriginalPath) return stripUnresolved ? fallbackText : null;
    const importedPath = (_c = notePathMap.get(resolvedOriginalPath)) != null ? _c : filePathMap.get(resolvedOriginalPath);
    if (!importedPath) return stripUnresolved ? fallbackText : null;
    const af = app.vault.getAbstractFileByPath(importedPath);
    if (!(af instanceof import_obsidian27.TFile)) return stripUnresolved ? fallbackText : null;
    const parsed = splitRawLink(rawLink);
    const linktext = app.metadataCache.fileToLinktext(af, targetNotePath);
    return buildRawLink(linktext, parsed.anchor, parsed.alias);
  };
  let out = text.replace(/\[\[([^[\]]+)\]\]/g, (full, inner) => {
    const raw = inner.trim();
    const rewritten = rewriteViaImportedPath(raw, stripWikiLinkToText(raw));
    if (rewritten === null) return full;
    if (rewritten === stripWikiLinkToText(raw) && stripUnresolved) return rewritten;
    return `[[${rewritten}]]`;
  });
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (full, label, hrefRaw) => {
    const target = extractMarkdownHrefTarget(hrefRaw);
    if (!target || isExternalHref(target)) return full;
    const rewritten = rewriteViaImportedPath(target, label);
    if (rewritten === null) return full;
    if (rewritten === label && stripUnresolved) return label;
    return `[[${buildRawLink(rewritten, void 0, label)}]]`;
  });
  return out;
}
function buildExportSummaryLines(storageMode, prepared) {
  var _a2, _b2, _c, _d;
  const markerData = prepared.markerData;
  let noteImages = 0;
  let noteVideos = 0;
  let notePdfs = 0;
  let noteAudio = 0;
  for (const kind of prepared.mediaAssetPaths.values()) {
    if (kind === "note-image") noteImages += 1;
    else if (kind === "note-video") noteVideos += 1;
    else if (kind === "note-pdf") notePdfs += 1;
    else if (kind === "note-audio") noteAudio += 1;
  }
  return [
    `Storage: ${storageMode}`,
    `Bases: ${normalizeBases(markerData.bases).length}`,
    `Overlays: ${((_a2 = markerData.overlays) != null ? _a2 : []).length}`,
    `Markers: ${((_b2 = markerData.markers) != null ? _b2 : []).length}`,
    `Drawings: ${((_c = markerData.drawings) != null ? _c : []).length}`,
    `Text layers: ${((_d = markerData.textLayers) != null ? _d : []).length}`,
    `Icons: ${prepared.icons.length}`,
    `Linked notes: ${prepared.linkedNotePaths.size}`,
    `Note images: ${noteImages}`,
    `Note videos: ${noteVideos}`,
    `Note PDFs: ${notePdfs}`,
    `Note audio: ${noteAudio}`
  ];
}
function addResolvedLink(app, resolvedLinks, includedNotePaths, rawLink, fromPath, includeLinkedNotes) {
  var _a2;
  const raw = (rawLink != null ? rawLink : "").trim();
  if (!raw) return;
  const parsed = splitRawLink(raw);
  if (!parsed.path) return;
  const file = resolveFile(app, parsed.path, fromPath);
  if (!(file instanceof import_obsidian27.TFile)) return;
  resolvedLinks[raw] = file.path;
  if (includeLinkedNotes && ((_a2 = file.extension) == null ? void 0 : _a2.toLowerCase()) === "md") {
    includedNotePaths.add(file.path);
  }
}
function collectResolvedLinksForExport(app, ctx, markerData, icons, subset, includeLinkedNotes) {
  var _a2, _b2, _c;
  const resolvedLinks = {};
  const linkedNotePaths = /* @__PURE__ */ new Set();
  if (!includeLinkedNotes) {
    return { resolvedLinks, linkedNotePaths };
  }
  for (const m of (_a2 = markerData.markers) != null ? _a2 : []) {
    addResolvedLink(app, resolvedLinks, linkedNotePaths, m.link, ctx.sourcePath, true);
    if (m.swapLinks) {
      for (const raw of Object.values(m.swapLinks)) {
        addResolvedLink(app, resolvedLinks, linkedNotePaths, raw, ctx.sourcePath, true);
      }
    }
  }
  for (const sp of (_b2 = subset.swapPins) != null ? _b2 : []) {
    for (const fr of (_c = sp.frames) != null ? _c : []) {
      addResolvedLink(app, resolvedLinks, linkedNotePaths, fr.link, ctx.sourcePath, true);
    }
  }
  for (const ico of icons != null ? icons : []) {
    addResolvedLink(app, resolvedLinks, linkedNotePaths, ico.defaultLink, ctx.sourcePath, true);
  }
  return { resolvedLinks, linkedNotePaths };
}
function rewriteLinkIfImported(app, rawLink, resolvedLinks, notePathMap, targetNotePath) {
  const raw = (rawLink != null ? rawLink : "").trim();
  if (!raw) return rawLink;
  const resolvedPath = resolvedLinks[raw];
  if (!resolvedPath) return raw;
  const importedPath = notePathMap.get(resolvedPath);
  if (!importedPath) return raw;
  const file = app.vault.getAbstractFileByPath(importedPath);
  if (!(file instanceof import_obsidian27.TFile)) return raw;
  const parsed = splitRawLink(raw);
  const linktext = app.metadataCache.fileToLinktext(file, targetNotePath);
  return buildRawLink(linktext, parsed.anchor, parsed.alias);
}
function remapBaseBoundPath(path, basePathMap) {
  var _a2;
  if (!path) return void 0;
  return (_a2 = basePathMap.get(path)) != null ? _a2 : path;
}
function remapBaseKeyedRecord(value, basePathMap) {
  var _a2;
  if (!value) return value;
  const out = {};
  for (const [key, val] of Object.entries(value)) {
    out[(_a2 = basePathMap.get(key)) != null ? _a2 : key] = val;
  }
  return out;
}
function patchMarkerDataPaths(app, data, filePathMap, notePathMap, resolvedLinks, targetNotePath, defaultIconKeyMap) {
  var _a2, _b2, _c, _d, _e, _f, _g, _h, _i;
  const out = deepClone5(data);
  const basePathMap = /* @__PURE__ */ new Map();
  out.bases = normalizeBases(out.bases).map((b) => {
    var _a3;
    const nextPath = (_a3 = filePathMap.get(b.path)) != null ? _a3 : b.path;
    basePathMap.set(b.path, nextPath);
    return { ...b, path: nextPath };
  });
  if (out.activeBase) out.activeBase = (_a2 = filePathMap.get(out.activeBase)) != null ? _a2 : out.activeBase;
  out.overlays = normalizeOverlays(out.overlays).map((o) => {
    var _a3;
    return {
      ...o,
      path: (_a3 = filePathMap.get(o.path)) != null ? _a3 : o.path
    };
  });
  out.layers = ((_b2 = out.layers) != null ? _b2 : []).map((l) => ({
    ...l,
    boundBase: remapBaseBoundPath(l.boundBase, basePathMap)
  }));
  out.drawLayers = ((_c = out.drawLayers) != null ? _c : []).map((l) => ({
    ...l,
    boundBase: remapBaseBoundPath(l.boundBase, basePathMap)
  }));
  out.grids = ((_d = out.grids) != null ? _d : []).map((g) => ({
    ...g,
    boundBase: remapBaseBoundPath(g.boundBase, basePathMap)
  }));
  out.textLayers = ((_e = out.textLayers) != null ? _e : []).map((layer) => ({
    ...layer,
    boundBase: remapBaseBoundPath(layer.boundBase, basePathMap)
  }));
  if (out.measurement) {
    out.measurement.scales = (_f = remapBaseKeyedRecord(out.measurement.scales, basePathMap)) != null ? _f : {};
    out.measurement.customUnitPxPerUnit = (_g = remapBaseKeyedRecord(out.measurement.customUnitPxPerUnit, basePathMap)) != null ? _g : {};
  }
  out.drawings = ((_h = out.drawings) != null ? _h : []).map((d) => {
    var _a3;
    return {
      ...d,
      bakedPath: d.bakedPath ? (_a3 = filePathMap.get(d.bakedPath)) != null ? _a3 : d.bakedPath : d.bakedPath
    };
  });
  out.markers = ((_i = out.markers) != null ? _i : []).map((m) => {
    var _a3, _b3, _c2, _d2, _e2;
    const next = { ...m };
    if (next.iconKey && defaultIconKeyMap.has(next.iconKey)) {
      next.iconKey = defaultIconKeyMap.get(next.iconKey);
    }
    if (next.link) {
      next.link = (_a3 = rewriteLinkIfImported(
        app,
        next.link,
        resolvedLinks,
        notePathMap,
        targetNotePath
      )) != null ? _a3 : next.link;
    }
    if (next.swapLinks) {
      const rewritten = {};
      for (const [idxRaw, rawLink] of Object.entries(next.swapLinks)) {
        const idx = Number(idxRaw);
        rewritten[idx] = (_b3 = rewriteLinkIfImported(
          app,
          rawLink,
          resolvedLinks,
          notePathMap,
          targetNotePath
        )) != null ? _b3 : rawLink;
      }
      next.swapLinks = rewritten;
    }
    if (next.type === "sticker" && next.stickerPath) {
      next.stickerPath = (_c2 = filePathMap.get(next.stickerPath)) != null ? _c2 : next.stickerPath;
    }
    if (next.switchBase) {
      next.switchBase = (_d2 = basePathMap.get(next.switchBase)) != null ? _d2 : next.switchBase;
    }
    if (next.pingNotePath) {
      next.pingNotePath = (_e2 = notePathMap.get(next.pingNotePath)) != null ? _e2 : next.pingNotePath;
    }
    return next;
  });
  delete out.secondScreen;
  return out;
}
function remapCollectionSubset(app, subset, iconKeyMap, filePathMap, notePathMap, resolvedLinks, targetNotePath, notesRoot) {
  const out = deepClone5(subset);
  out.pinKeys = out.pinKeys.map((k) => {
    var _a2;
    return (_a2 = iconKeyMap.get(k)) != null ? _a2 : k;
  });
  out.stickers = out.stickers.map((s) => {
    var _a2;
    return {
      ...s,
      imagePath: (_a2 = filePathMap.get(s.imagePath)) != null ? _a2 : s.imagePath
    };
  });
  out.swapPins = out.swapPins.map((sp) => {
    var _a2;
    return {
      ...sp,
      frames: ((_a2 = sp.frames) != null ? _a2 : []).map((fr) => {
        var _a3, _b2;
        return {
          ...fr,
          iconKey: (_a3 = iconKeyMap.get(fr.iconKey)) != null ? _a3 : fr.iconKey,
          link: (_b2 = rewriteLinkIfImported(
            app,
            fr.link,
            resolvedLinks,
            notePathMap,
            targetNotePath
          )) != null ? _b2 : fr.link
        };
      })
    };
  });
  out.pingPins = out.pingPins.map((pp) => {
    var _a2;
    return {
      ...pp,
      iconKey: pp.iconKey ? (_a2 = iconKeyMap.get(pp.iconKey)) != null ? _a2 : pp.iconKey : pp.iconKey,
      noteFolder: notesRoot
    };
  });
  return out;
}
async function buildBundleBytes(app, plugin, ctx, options, preparedInput) {
  var _a2, _b2;
  const prepared = preparedInput != null ? preparedInput : await prepareExportData(app, plugin, ctx, options);
  const markerData = prepared.markerData;
  const subset = prepared.subset;
  const icons = prepared.icons;
  const configured = collectConfiguredAssetPaths(ctx);
  const assetPaths = /* @__PURE__ */ new Map();
  for (const p of configured.basePaths) if (p && !isDataUrl(p)) assetPaths.set(p, "base");
  for (const p of configured.overlayPaths) if (p && !isDataUrl(p)) assetPaths.set(p, "overlay");
  for (const p of configured.stickerPaths) if (p && !isDataUrl(p)) assetPaths.set(p, "sticker");
  for (const p of configured.drawingPaths) if (p && !isDataUrl(p)) assetPaths.set(p, "drawing");
  if (configured.framePath && !isDataUrl(configured.framePath)) {
    assetPaths.set(configured.framePath, "frame");
  }
  const assets = [];
  for (const [originalPath, kind] of assetPaths) {
    assets.push({
      kind,
      originalPath,
      zipPath: buildZipAssetPath(kind, originalPath)
    });
  }
  for (const notePath of prepared.linkedNotePaths) {
    assets.push({
      kind: "linked-note",
      originalPath: notePath,
      zipPath: buildZipAssetPath("linked-note", notePath)
    });
  }
  for (const [mediaPath, kind] of prepared.mediaAssetPaths.entries()) {
    assets.push({
      kind,
      originalPath: mediaPath,
      zipPath: buildZipAssetPath(kind, mediaPath)
    });
  }
  const bundle = {
    version: 1,
    exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
    bundleName: options.zipName,
    map: {
      sourcePath: ctx.sourcePath,
      mapId: ctx.mapId || void 0,
      storageMode: ctx.storageMode,
      markersPath: ctx.markersPath,
      yamlBlock: ctx.yamlBlock,
      yamlRaw: ctx.yamlRaw,
      yamlObject: ctx.yamlObject,
      markerData,
      defaultIconKey: plugin.settings.defaultIconKey
    },
    icons,
    collectionSubset: subset,
    assets,
    noteResolvedLinks: prepared.noteResolvedLinks,
    resolvedLinks: prepared.resolvedLinks,
    warnings: {
      hasDrawings: ((_a2 = markerData.drawings) != null ? _a2 : []).length > 0,
      hasTextLayers: ((_b2 = markerData.textLayers) != null ? _b2 : []).length > 0,
      customFonts: collectCustomFonts(markerData),
      usesCustomUnits: bundleUsesCustomUnits(markerData)
    }
  };
  const files = {};
  files[BUNDLE_JSON_PATH] = utf8Encode(JSON.stringify(bundle, null, 2));
  for (const asset of assets) {
    const file = app.vault.getAbstractFileByPath(asset.originalPath);
    if (!(file instanceof import_obsidian27.TFile)) continue;
    if (asset.kind === "linked-note") {
      files[asset.zipPath] = utf8Encode(await app.vault.read(file));
    } else {
      files[asset.zipPath] = await readVaultBinary(app, file);
    }
  }
  return zipFilesStrict(files);
}
async function loadBundleFromFile(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const files = unzipFilesStrict(bytes);
  const meta = files[BUNDLE_JSON_PATH];
  if (!meta) throw new Error("Bundle manifest not found.");
  const parsedUnknown = JSON.parse(utf8Decode(meta));
  if (!isZoomMapBundleV1(parsedUnknown)) {
    throw new Error("Unsupported or invalid map bundle.");
  }
  const parsed = parsedUnknown;
  return { files, bundle: parsed };
}
function nextUniqueMapId(editor, baseId) {
  const content = editor.getValue();
  const seed = sanitizeFileName((baseId != null ? baseId : "").trim()) || `map-${Date.now().toString(36)}`;
  let candidate = seed;
  let i2 = 1;
  while (content.includes(`ZOOMMAP-DATA id=${candidate}`) || new RegExp(`(^|\\n)\\s*id\\s*:\\s*["']?${candidate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']?(\\n|$)`, "m").test(content)) {
    candidate = `${seed}-${i2}`;
    i2 += 1;
  }
  return candidate;
}
function existingCollectionOptions(plugin) {
  var _a2;
  return ((_a2 = plugin.settings.baseCollections) != null ? _a2 : []).map((c) => ({
    id: c.id,
    name: c.name || "(unnamed collection)"
  }));
}
function ensureImportedIcons(app, plugin, icons, resolvedLinks, notePathMap, targetNotePath) {
  var _a2;
  const keyMap = /* @__PURE__ */ new Map();
  let changed = false;
  const all = [...(_a2 = plugin.settings.icons) != null ? _a2 : []];
  const existingByKey = new Map(all.map((i2) => [i2.key, i2]));
  for (const importedRaw of icons != null ? icons : []) {
    const imported = deepClone5(importedRaw);
    imported.defaultLink = rewriteLinkIfImported(
      app,
      imported.defaultLink,
      resolvedLinks,
      notePathMap,
      targetNotePath
    );
    const current = existingByKey.get(imported.key);
    if (current) {
      if (normalizeIconSignature(current) === normalizeIconSignature(imported)) {
        keyMap.set(importedRaw.key, current.key);
        continue;
      }
      let nextKey = imported.key;
      let i2 = 1;
      while (existingByKey.has(nextKey)) {
        nextKey = `${imported.key}-${i2}`;
        i2 += 1;
      }
      imported.key = nextKey;
    }
    existingByKey.set(imported.key, imported);
    all.push(imported);
    keyMap.set(importedRaw.key, imported.key);
    changed = true;
  }
  if (changed) plugin.settings.icons = all;
  return { changed, keyMap };
}
function importCollectionSubset(plugin, subset, mode, importedBasePaths, mergeCollectionId, newCollectionName) {
  var _a2, _b2, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m;
  const warnings = [];
  const swapIdMap = /* @__PURE__ */ new Map();
  const pingIdMap = /* @__PURE__ */ new Map();
  if (!subset) {
    return { changed: false, warnings, swapIdMap, pingIdMap };
  }
  const needsCollection = ((_b2 = (_a2 = subset.swapPins) == null ? void 0 : _a2.length) != null ? _b2 : 0) > 0 || ((_d = (_c = subset.pingPins) == null ? void 0 : _c.length) != null ? _d : 0) > 0;
  if (mode === "none") {
    if (needsCollection) {
      warnings.push("Collections were skipped. Swap pins and party pins may not work until their presets are imported.");
    }
    return { changed: false, warnings, swapIdMap, pingIdMap };
  }
  const collections = (_f = (_e = plugin.settings).baseCollections) != null ? _f : _e.baseCollections = [];
  let target;
  let changed = false;
  if (mode === "merge") {
    target = collections.find((c) => c.id === mergeCollectionId);
    if (!target) {
      warnings.push("Selected collection not found. Imported subset was added as a new collection instead.");
    }
  }
  if (!target) {
    target = {
      id: `col-${Math.random().toString(36).slice(2, 8)}`,
      name: (newCollectionName != null ? newCollectionName : "").trim() || subset.suggestedName || "Imported map",
      bindings: { basePaths: [] },
      include: {
        pinKeys: [],
        favorites: [],
        stickers: [],
        swapPins: [],
        pingPins: []
      }
    };
    collections.push(target);
    changed = true;
  }
  ensureCollectionArrays(target);
  for (const p of importedBasePaths) {
    if (!target.bindings.basePaths.includes(p)) {
      target.bindings.basePaths.push(p);
      changed = true;
    }
  }
  for (const key of (_g = subset.pinKeys) != null ? _g : []) {
    if (!target.include.pinKeys.includes(key)) {
      target.include.pinKeys.push(key);
      changed = true;
    }
  }
  for (const sticker of (_h = subset.stickers) != null ? _h : []) {
    const sig = normalizeStickerSignature(sticker);
    const exists = ((_i = target.include.stickers) != null ? _i : []).some((s) => normalizeStickerSignature(s) === sig);
    if (!exists) {
      target.include.stickers.push(deepClone5(sticker));
      changed = true;
    }
  }
  const takenIds = new Set(collections.flatMap((c) => {
    var _a3, _b3, _c2, _d2;
    return [
      ...((_b3 = (_a3 = c.include) == null ? void 0 : _a3.swapPins) != null ? _b3 : []).map((p) => p.id),
      ...((_d2 = (_c2 = c.include) == null ? void 0 : _c2.pingPins) != null ? _d2 : []).map((p) => p.id)
    ];
  }));
  for (const preset of (_j = subset.swapPins) != null ? _j : []) {
    const sig = normalizeSwapSignature(preset);
    const same = ((_k = target.include.swapPins) != null ? _k : []).find((sp) => normalizeSwapSignature(sp) === sig);
    if (same) {
      swapIdMap.set(preset.id, same.id);
      continue;
    }
    const clone = deepClone5(preset);
    clone.id = uniqueCollectionItemId("swp", takenIds, clone.id);
    target.include.swapPins.push(clone);
    swapIdMap.set(preset.id, clone.id);
    changed = true;
  }
  for (const preset of (_l = subset.pingPins) != null ? _l : []) {
    const sig = normalizePingSignature(preset);
    const same = ((_m = target.include.pingPins) != null ? _m : []).find((pp) => normalizePingSignature(pp) === sig);
    if (same) {
      pingIdMap.set(preset.id, same.id);
      continue;
    }
    const clone = deepClone5(preset);
    clone.id = uniqueCollectionItemId("ping", takenIds, clone.id);
    target.include.pingPins.push(clone);
    pingIdMap.set(preset.id, clone.id);
    changed = true;
  }
  return { changed, warnings, swapIdMap, pingIdMap };
}
function remapImportedPresetIds(data, swapIdMap, pingIdMap) {
  var _a2;
  const out = deepClone5(data);
  out.markers = ((_a2 = out.markers) != null ? _a2 : []).map((m) => {
    var _a3, _b2;
    return {
      ...m,
      swapKey: m.swapKey ? (_a3 = swapIdMap.get(m.swapKey)) != null ? _a3 : m.swapKey : m.swapKey,
      pingPresetId: m.pingPresetId ? (_b2 = pingIdMap.get(m.pingPresetId)) != null ? _b2 : m.pingPresetId : m.pingPresetId
    };
  });
  return out;
}
function collectImportedBasePaths(data) {
  return normalizeBases(data.bases).map((b) => b.path);
}
function rewriteYamlForImport(bundle, data, mapId, storageMode, markersPath, framePath) {
  var _a2, _b2;
  let obj = {};
  if (bundle.map.yamlObject && typeof bundle.map.yamlObject === "object") {
    obj = deepClone5(bundle.map.yamlObject);
  } else {
    try {
      const parsed = (0, import_obsidian27.parseYaml)(bundle.map.yamlRaw);
      if (isRecord2(parsed)) {
        obj = parsed;
      }
    } catch (e) {
      obj = {};
    }
  }
  const bases = normalizeBases(data.bases);
  const overlays = normalizeOverlays(data.overlays);
  obj.image = (_b2 = (_a2 = bases[0]) == null ? void 0 : _a2.path) != null ? _b2 : obj.image;
  obj.imageBases = bases.map((b) => b.name ? { path: b.path, name: b.name } : { path: b.path });
  obj.imageOverlays = overlays.map((o) => ({
    path: o.path,
    name: o.name,
    visible: o.visible
  }));
  obj.id = mapId;
  obj.storage = storageMode;
  if (storageMode === "json") obj.markers = markersPath;
  else delete obj.markers;
  if (framePath) {
    obj.viewportFrame = framePath;
  } else {
    const vf = obj.viewportFrame;
    if (typeof vf === "string" && !vf.trim()) delete obj.viewportFrame;
  }
  return `\`\`\`zoommap
${(0, import_obsidian27.stringifyYaml)(obj).trimEnd()}
\`\`\`
`;
}
async function importBundleToVault(app, plugin, loaded, options) {
  var _a2, _b2, _c, _d, _e, _f, _g, _h, _i, _j, _k;
  const { bundle, files } = loaded;
  const warnings = [];
  const writtenPaths = [];
  const effectiveStorage = options.storageMode === "match-export" ? bundle.map.storageMode : options.storageMode;
  if (bundle.warnings.hasDrawings && !plugin.settings.enableDrawing) {
    warnings.push("This bundle contains drawings, but drawings are disabled in your plugin settings.");
  }
  if (bundle.warnings.hasTextLayers && !plugin.settings.enableTextLayers) {
    warnings.push("This bundle contains text layers, but text layers are disabled in your plugin settings.");
  }
  if (((_a2 = bundle.warnings.customFonts) != null ? _a2 : []).length > 0) {
    warnings.push(`Custom fonts used by this map are not installed automatically: ${bundle.warnings.customFonts.join(", ")}`);
  }
  if (bundle.warnings.usesCustomUnits) {
    warnings.push("The bundle uses custom travel/measurement units. Their travel-rule definitions are not imported automatically.");
  }
  const previousIcons = deepClone5((_b2 = plugin.settings.icons) != null ? _b2 : []);
  const previousCollections = deepClone5((_c = plugin.settings.baseCollections) != null ? _c : []);
  const filePathMap = /* @__PURE__ */ new Map();
  const notePathMap = /* @__PURE__ */ new Map();
  const reservedPaths = /* @__PURE__ */ new Set();
  try {
    for (const asset of (_d = bundle.assets) != null ? _d : []) {
      const entry = files[asset.zipPath];
      if (!entry) {
        throw new Error(`Missing asset in ZIP: ${asset.zipPath}`);
      }
      if (asset.kind === "linked-note") {
        const desired2 = await uniqueVaultPath(
          app,
          joinRoot(options.notesRoot, asset.originalPath),
          reservedPaths
        );
        notePathMap.set(asset.originalPath, desired2);
        continue;
      }
      const root = asset.kind === "drawing" ? options.drawingsRoot : options.assetsRoot;
      const desired = await uniqueVaultPath(
        app,
        joinRoot(root, asset.originalPath),
        reservedPaths
      );
      filePathMap.set(asset.originalPath, desired);
    }
    const importedIcons = ensureImportedIcons(
      app,
      plugin,
      (_e = bundle.icons) != null ? _e : [],
      (_f = bundle.resolvedLinks) != null ? _f : {},
      notePathMap,
      options.targetNotePath
    );
    let subset = bundle.collectionSubset ? remapCollectionSubset(
      app,
      bundle.collectionSubset,
      importedIcons.keyMap,
      filePathMap,
      notePathMap,
      (_g = bundle.resolvedLinks) != null ? _g : {},
      options.targetNotePath,
      options.notesRoot
    ) : void 0;
    let data = patchMarkerDataPaths(
      app,
      bundle.map.markerData,
      filePathMap,
      notePathMap,
      (_h = bundle.resolvedLinks) != null ? _h : {},
      options.targetNotePath,
      importedIcons.keyMap
    );
    const collectionImport = importCollectionSubset(
      plugin,
      subset,
      options.collectionMode,
      collectImportedBasePaths(data),
      options.mergeCollectionId,
      options.newCollectionName
    );
    warnings.push(...collectionImport.warnings);
    data = remapImportedPresetIds(data, collectionImport.swapIdMap, collectionImport.pingIdMap);
    const settingsChanged = importedIcons.changed || collectionImport.changed;
    let markersPath;
    if (effectiveStorage === "json") {
      const baseName = sanitizeFileName(basename2(bundle.map.markersPath || `${bundle.bundleName}.markers.json`));
      markersPath = await uniqueVaultPath(
        app,
        (0, import_obsidian27.normalizePath)(`${options.markersRoot}/${baseName || `${sanitizeFileName(bundle.bundleName)}.markers.json`}`),
        reservedPaths
      );
    }
    for (const asset of (_i = bundle.assets) != null ? _i : []) {
      const entry = files[asset.zipPath];
      if (!entry) {
        throw new Error(`Missing asset in ZIP: ${asset.zipPath}`);
      }
      if (asset.kind === "linked-note") {
        const targetPath2 = notePathMap.get(asset.originalPath);
        if (!targetPath2) continue;
        const rawText = strFromU8(entry);
        const rewrittenText = rewriteImportedNoteText(
          app,
          rawText,
          asset.originalPath,
          (_j = bundle.noteResolvedLinks) == null ? void 0 : _j[asset.originalPath],
          notePathMap,
          filePathMap,
          targetPath2,
          !!options.stripUnresolvedNoteLinks
        );
        await writeVaultText(app, targetPath2, rewrittenText);
        writtenPaths.push(targetPath2);
        continue;
      }
      const targetPath = filePathMap.get(asset.originalPath);
      if (!targetPath) continue;
      await writeVaultBinary(app, targetPath, entry);
      writtenPaths.push(targetPath);
    }
    if (markersPath) {
      await writeVaultText(app, markersPath, JSON.stringify(sanitizeMarkerFileDataForSave(data), null, 2));
      writtenPaths.push(markersPath);
    }
    const originalFramePath = typeof ((_k = bundle.map.yamlObject) == null ? void 0 : _k.viewportFrame) === "string" ? bundle.map.yamlObject.viewportFrame.trim() : void 0;
    const importedFramePath = originalFramePath ? filePathMap.get(originalFramePath) : void 0;
    const yaml = rewriteYamlForImport(
      bundle,
      data,
      options.mapId,
      effectiveStorage,
      markersPath,
      importedFramePath
    );
    if (settingsChanged) {
      await plugin.saveSettings();
    }
    return {
      codeBlock: yaml,
      inlineBlock: effectiveStorage === "note" ? buildInlineStorageBlock(options.mapId, data) : void 0,
      warnings
    };
  } catch (err2) {
    plugin.settings.icons = previousIcons;
    plugin.settings.baseCollections = previousCollections;
    for (let i2 = writtenPaths.length - 1; i2 >= 0; i2 -= 1) {
      try {
        await deleteVaultPathIfExists(app, writtenPaths[i2]);
      } catch (e) {
      }
    }
    throw err2;
  }
}
var ExportMapBundleModal = class extends import_obsidian27.Modal {
  constructor(app, plugin, map) {
    super(app);
    this.ctx = null;
    this.zipName = "zoommap-export";
    this.includeLinkedNotes = true;
    this.includeRecursiveLinkedNotes = true;
    this.includeNoteImages = false;
    this.includeNoteVideos = false;
    this.includeNotePdfs = false;
    this.includeNoteAudio = false;
    this.summaryEl = null;
    this.refreshSummaryToken = 0;
    this.includeRecursiveToggleEl = null;
    this.includeNoteImagesToggleEl = null;
    this.includeNoteVideosToggleEl = null;
    this.includeNotePdfsToggleEl = null;
    this.includeNoteAudioToggleEl = null;
    this.summaryBodyEl = null;
    this.summaryStatusEl = null;
    this.summaryRefreshTimer = null;
    this.summaryMinHeightPx = 0;
    this.plugin = plugin;
    this.map = map;
  }
  onOpen() {
    void this.renderAsync();
  }
  onClose() {
    if (this.summaryRefreshTimer !== null) {
      window.clearTimeout(this.summaryRefreshTimer);
      this.summaryRefreshTimer = null;
    }
    this.summaryEl = null;
    this.summaryBodyEl = null;
    this.summaryStatusEl = null;
    this.includeRecursiveToggleEl = null;
    this.includeNoteImagesToggleEl = null;
    this.includeNoteVideosToggleEl = null;
    this.includeNotePdfsToggleEl = null;
    this.includeNoteAudioToggleEl = null;
    this.contentEl.empty();
  }
  currentExportOptions() {
    return {
      zipName: this.zipName,
      includeLinkedNotes: this.includeLinkedNotes,
      includeRecursiveLinkedNotes: this.includeRecursiveLinkedNotes,
      includeNoteImages: this.includeNoteImages,
      includeNoteVideos: this.includeNoteVideos,
      includeNotePdfs: this.includeNotePdfs,
      includeNoteAudio: this.includeNoteAudio
    };
  }
  applyLinkedNotesToggleState() {
    const disabled = !this.includeLinkedNotes;
    if (this.includeRecursiveToggleEl) this.includeRecursiveToggleEl.disabled = disabled;
    if (this.includeNoteImagesToggleEl) this.includeNoteImagesToggleEl.disabled = disabled;
    if (this.includeNoteVideosToggleEl) this.includeNoteVideosToggleEl.disabled = disabled;
    if (this.includeNotePdfsToggleEl) this.includeNotePdfsToggleEl.disabled = disabled;
    if (this.includeNoteAudioToggleEl) this.includeNoteAudioToggleEl.disabled = disabled;
  }
  setSummaryBusyState(text) {
    if (!this.summaryStatusEl) return;
    this.summaryStatusEl.setText(text);
  }
  updateSummaryMinHeight() {
    if (!this.summaryBodyEl) return;
    const h = Math.ceil(this.summaryBodyEl.getBoundingClientRect().height);
    if (h > this.summaryMinHeightPx) {
      this.summaryMinHeightPx = h;
      this.summaryBodyEl.style.minHeight = `${this.summaryMinHeightPx}px`;
    }
  }
  scheduleRefreshSummary(delay = 160) {
    if (!this.summaryEl || !this.ctx) return;
    if (this.summaryRefreshTimer !== null) {
      window.clearTimeout(this.summaryRefreshTimer);
    }
    this.summaryRefreshTimer = window.setTimeout(() => {
      this.summaryRefreshTimer = null;
      void this.refreshSummary();
    }, delay);
  }
  async refreshSummary() {
    if (!this.summaryEl || !this.summaryBodyEl || !this.ctx) return;
    const token = ++this.refreshSummaryToken;
    const summaryBodyEl = this.summaryBodyEl;
    this.updateSummaryMinHeight();
    try {
      const prepared = await prepareExportData(
        this.app,
        this.plugin,
        this.ctx,
        this.currentExportOptions()
      );
      if (token !== this.refreshSummaryToken || this.summaryBodyEl !== summaryBodyEl) return;
      summaryBodyEl.empty();
      const lines = buildExportSummaryLines(this.ctx.storageMode, prepared);
      for (const line of lines) {
        summaryBodyEl.createEl("div", { text: line }).addClass("zoommap-muted");
      }
      this.updateSummaryMinHeight();
      this.setSummaryBusyState("");
    } catch (err2) {
      if (token !== this.refreshSummaryToken || this.summaryBodyEl !== summaryBodyEl) return;
      summaryBodyEl.empty();
      summaryBodyEl.createEl("div", {
        text: `Summary update failed: ${err2 instanceof Error ? err2.message : String(err2)}`
      }).addClass("zoommap-muted");
      this.updateSummaryMinHeight();
      this.setSummaryBusyState("");
    }
  }
  async renderAsync() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Export map package" });
    this.ctx = await this.map.buildShareExportContext();
    if (!this.ctx) {
      contentEl.createEl("div", {
        text: "Could not read the current zoommap block. Please save the note and try again."
      });
      const footer2 = contentEl.createDiv({ cls: "zoommap-modal-footer" });
      footer2.createEl("button", { text: "Close" }).onclick = () => this.close();
      return;
    }
    const suggested = sanitizeFileName(fileStem2(this.ctx.sourcePath) || this.map.getMapId() || "zoommap-export");
    if (!this.zipName.trim()) {
      this.zipName = suggested || "zoommap-export";
    }
    new import_obsidian27.Setting(contentEl).setName("ZIP name").setDesc("The exported file will be downloaded as a ZIP.").addText((t) => {
      t.setPlaceholder("zoommap-export");
      t.setValue(this.zipName);
      t.onChange((v) => {
        this.zipName = sanitizeFileName(v) || suggested || "zoommap-export";
      });
    });
    new import_obsidian27.Setting(contentEl).setName("Include linked notes from pins").setDesc("Copies linked .md files referenced by pins, swap-pin frames and imported icon default links.").addToggle((tg) => {
      tg.setValue(this.includeLinkedNotes).onChange((on) => {
        this.includeLinkedNotes = on;
        this.applyLinkedNotesToggleState();
        this.scheduleRefreshSummary();
      });
    });
    new import_obsidian27.Setting(contentEl).setName("Follow note links recursively").setDesc("Also include notes that are linked inside already included notes.").addToggle((tg) => {
      tg.setValue(this.includeRecursiveLinkedNotes).onChange((on) => {
        this.includeRecursiveLinkedNotes = on;
        this.scheduleRefreshSummary();
      });
      this.includeRecursiveToggleEl = tg.toggleEl;
      tg.setDisabled(!this.includeLinkedNotes);
    });
    new import_obsidian27.Setting(contentEl).setName("Include note images").setDesc("Exports image files referenced inside included notes.").addToggle((tg) => {
      tg.setValue(this.includeNoteImages).onChange((on) => {
        this.includeNoteImages = on;
        this.scheduleRefreshSummary();
      });
      this.includeNoteImagesToggleEl = tg.toggleEl;
      tg.setDisabled(!this.includeLinkedNotes);
    });
    new import_obsidian27.Setting(contentEl).setName("Include note videos").setDesc("Exports video files referenced inside included notes.").addToggle((tg) => {
      tg.setValue(this.includeNoteVideos).onChange((on) => {
        this.includeNoteVideos = on;
        this.scheduleRefreshSummary();
      });
      this.includeNoteVideosToggleEl = tg.toggleEl;
      tg.setDisabled(!this.includeLinkedNotes);
    });
    new import_obsidian27.Setting(contentEl).setName("Include note PDFs").setDesc("Exports PDF files referenced inside included notes.").addToggle((tg) => {
      tg.setValue(this.includeNotePdfs).onChange((on) => {
        this.includeNotePdfs = on;
        this.scheduleRefreshSummary();
      });
      this.includeNotePdfsToggleEl = tg.toggleEl;
      tg.setDisabled(!this.includeLinkedNotes);
    });
    new import_obsidian27.Setting(contentEl).setName("Include note audio").setDesc("Exports audio files referenced inside included notes.").addToggle((tg) => {
      tg.setValue(this.includeNoteAudio).onChange((on) => {
        this.includeNoteAudio = on;
        this.scheduleRefreshSummary();
      });
      this.includeNoteAudioToggleEl = tg.toggleEl;
      tg.setDisabled(!this.includeLinkedNotes);
    });
    this.summaryEl = contentEl.createDiv();
    this.summaryEl.createEl("h3", { text: "Summary" });
    this.summaryBodyEl = this.summaryEl.createDiv();
    this.summaryStatusEl = this.summaryEl.createDiv();
    this.summaryStatusEl.addClass("zoommap-muted");
    this.applyLinkedNotesToggleState();
    await this.refreshSummary();
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const exportBtn = footer.createEl("button", { text: "Export" });
    const cancelBtn = footer.createEl("button", { text: "Cancel" });
    exportBtn.onclick = () => {
      void this.runExport();
    };
    cancelBtn.onclick = () => this.close();
  }
  async runExport() {
    if (!this.ctx) return;
    try {
      const fileName = `${sanitizeFileName(this.zipName || "zoommap-export") || "zoommap-export"}.zip`;
      new import_obsidian27.Notice("Building map package\u2026", 2e3);
      const prepared = await prepareExportData(this.app, this.plugin, this.ctx, {
        zipName: sanitizeFileName(this.zipName || "zoommap-export") || "zoommap-export",
        includeLinkedNotes: this.includeLinkedNotes,
        includeRecursiveLinkedNotes: this.includeRecursiveLinkedNotes,
        includeNoteImages: this.includeNoteImages,
        includeNoteVideos: this.includeNoteVideos,
        includeNotePdfs: this.includeNotePdfs,
        includeNoteAudio: this.includeNoteAudio
      });
      const bytes = await buildBundleBytes(this.app, this.plugin, this.ctx, {
        zipName: sanitizeFileName(this.zipName || "zoommap-export") || "zoommap-export",
        includeLinkedNotes: this.includeLinkedNotes,
        includeRecursiveLinkedNotes: this.includeRecursiveLinkedNotes,
        includeNoteImages: this.includeNoteImages,
        includeNoteVideos: this.includeNoteVideos,
        includeNotePdfs: this.includeNotePdfs,
        includeNoteAudio: this.includeNoteAudio
      }, prepared);
      downloadZip(fileName, bytes);
      new import_obsidian27.Notice(`Export ready: ${fileName}`, 2500);
      this.close();
    } catch (err2) {
      console.error(err2);
      new import_obsidian27.Notice(`Export failed: ${err2 instanceof Error ? err2.message : String(err2)}`, 5e3);
    }
  }
};
var ImportMapBundleModal = class extends import_obsidian27.Modal {
  constructor(app, plugin, editor, view) {
    super(app);
    this.selectedFile = null;
    this.loaded = null;
    this.storageMode = "match-export";
    this.assetsRoot = "ZoomMap/Imports/assets";
    this.drawingsRoot = "ZoomMap/Imports/drawings";
    this.notesRoot = "ZoomMap/Imports/notes";
    this.markersRoot = "ZoomMap/Imports/data";
    this.collectionMode = "create";
    this.mergeCollectionId = "";
    this.newCollectionName = "Imported map";
    this.stripUnresolvedNoteLinks = false;
    this.plugin = plugin;
    this.editor = editor;
    this.view = view;
  }
  getImportDefaults() {
    var _a2, _b2, _c;
    const safeBundleName = sanitizeFileName(((_a2 = this.loaded) == null ? void 0 : _a2.bundle.bundleName) || fileStem2((_c = (_b2 = this.selectedFile) == null ? void 0 : _b2.name) != null ? _c : "import")) || "import";
    return {
      assetsRoot: `ZoomMap/Imports/${safeBundleName}/assets`,
      drawingsRoot: `ZoomMap/Imports/${safeBundleName}/drawings`,
      notesRoot: `ZoomMap/Imports/${safeBundleName}/notes`,
      markersRoot: `ZoomMap/Imports/${safeBundleName}/data`
    };
  }
  openFolderPicker(onPick) {
    new FolderSuggestModal(this.app, (folder) => {
      onPick(folder.path);
    }).open();
  }
  onOpen() {
    this.render();
  }
  onClose() {
    this.contentEl.empty();
  }
  render() {
    var _a2, _b2, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m;
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Import map package" });
    const pickerWrap = contentEl.createDiv();
    pickerWrap.createEl("div", { text: "ZIP file" });
    const fileInput = pickerWrap.createEl("input");
    fileInput.type = "file";
    fileInput.accept = ".zip,application/zip";
    fileInput.addEventListener("change", () => {
      var _a3, _b3;
      const file = (_b3 = (_a3 = fileInput.files) == null ? void 0 : _a3[0]) != null ? _b3 : null;
      if (!file) return;
      void this.loadSelectedFile(file);
    });
    if (this.selectedFile) {
      pickerWrap.createEl("div", { text: `Selected: ${this.selectedFile.name}` }).addClass("zoommap-muted");
    }
    if (!this.loaded) {
      const footer2 = contentEl.createDiv({ cls: "zoommap-modal-footer" });
      footer2.createEl("button", { text: "Cancel" }).onclick = () => this.close();
      return;
    }
    const bundle = this.loaded.bundle;
    const defaults = this.getImportDefaults();
    this.assetsRoot = this.assetsRoot.trim() || defaults.assetsRoot;
    this.drawingsRoot = this.drawingsRoot.trim() || defaults.drawingsRoot;
    this.notesRoot = this.notesRoot.trim() || defaults.notesRoot;
    this.markersRoot = this.markersRoot.trim() || defaults.markersRoot;
    contentEl.createEl("h3", { text: "Summary" });
    for (const line of parseBundleSummary(bundle)) {
      contentEl.createEl("div", { text: line }).addClass("zoommap-muted");
    }
    const warningWrap = contentEl.createDiv();
    const warnings = [];
    if (bundle.warnings.hasDrawings && !this.plugin.settings.enableDrawing) {
      warnings.push("This package contains drawings, but drawings are disabled in your settings.");
    }
    if (bundle.warnings.hasTextLayers && !this.plugin.settings.enableTextLayers) {
      warnings.push("This package contains text layers, but text layers are disabled in your settings.");
    }
    if (((_a2 = bundle.warnings.customFonts) != null ? _a2 : []).length > 0) {
      warnings.push(`Fonts are not installed automatically: ${bundle.warnings.customFonts.join(", ")}`);
    }
    if (bundle.warnings.usesCustomUnits) {
      warnings.push("Custom travel/measurement units are not imported automatically.");
    }
    for (const line of warnings) {
      warningWrap.createEl("div", { text: `\u2022 ${line}` }).addClass("zoommap-muted");
    }
    contentEl.createEl("h3", { text: "Import options" });
    new import_obsidian27.Setting(contentEl).setName("Import storage mode").setDesc("Import as JSON beside the map or inline inside the current note.").addDropdown((d) => {
      d.addOption("match-export", `Match export (${bundle.map.storageMode})`);
      d.addOption("json", "JSON file");
      d.addOption("note", "Inline in note");
      d.setValue(this.storageMode);
      d.onChange((v) => {
        if (v === "json" || v === "note" || v === "match-export") {
          this.storageMode = v;
          this.render();
        }
      });
    });
    new import_obsidian27.Setting(contentEl).setName("Assets folder").setDesc("Base images, overlays, frame image and sticker images are copied here.").addText((t) => {
      t.setPlaceholder(defaults.assetsRoot);
      t.setValue(this.assetsRoot);
      t.onChange((v) => {
        const next = v.trim() || defaults.assetsRoot;
        this.assetsRoot = next;
        if (!v.trim()) t.setValue(next);
      });
    }).addButton((b) => {
      b.setButtonText("Pick\u2026").onClick(() => {
        this.openFolderPicker((path) => {
          this.assetsRoot = path.trim() || defaults.assetsRoot;
          this.render();
        });
      });
    });
    new import_obsidian27.Setting(contentEl).setName("Drawings folder").setDesc("Pattern SVG files are copied here.").addText((t) => {
      t.setPlaceholder(defaults.drawingsRoot);
      t.setValue(this.drawingsRoot);
      t.onChange((v) => {
        const next = v.trim() || defaults.drawingsRoot;
        this.drawingsRoot = next;
        if (!v.trim()) t.setValue(next);
      });
    }).addButton((b) => {
      b.setButtonText("Pick\u2026").onClick(() => {
        this.openFolderPicker((path) => {
          this.drawingsRoot = path.trim() || defaults.drawingsRoot;
          this.render();
        });
      });
    });
    new import_obsidian27.Setting(contentEl).setName("Notes folder").setDesc("Imported linked note files are copied here.").addText((t) => {
      t.setPlaceholder(defaults.notesRoot);
      t.setValue(this.notesRoot);
      t.onChange((v) => {
        const next = v.trim() || defaults.notesRoot;
        this.notesRoot = next;
        if (!v.trim()) t.setValue(next);
      });
    }).addButton((b) => {
      b.setButtonText("Pick\u2026").onClick(() => {
        this.openFolderPicker((path) => {
          this.notesRoot = path.trim() || defaults.notesRoot;
          this.render();
        });
      });
    });
    new import_obsidian27.Setting(contentEl).setName("Remove unresolved links inside imported notes").setDesc("If enabled, links inside imported note files that were not imported will be converted to plain text instead of keeping broken links.").addToggle((tg) => {
      tg.setValue(this.stripUnresolvedNoteLinks).onChange((on) => {
        this.stripUnresolvedNoteLinks = on;
      });
    });
    if (this.storageMode === "json" || this.storageMode === "match-export" && bundle.map.storageMode === "json") {
      new import_obsidian27.Setting(contentEl).setName("Marker JSON folder").setDesc("The marker.json is copied here when importing as JSON.").addText((t) => {
        t.setPlaceholder(defaults.markersRoot);
        t.setValue(this.markersRoot);
        t.onChange((v) => {
          const next = v.trim() || defaults.markersRoot;
          this.markersRoot = next;
          if (!v.trim()) t.setValue(next);
        });
      }).addButton((b) => {
        b.setButtonText("Pick\u2026").onClick(() => {
          this.openFolderPicker((path) => {
            this.markersRoot = path.trim() || defaults.markersRoot;
            this.render();
          });
        });
      });
    }
    const hasCollectionSubset = ((_d = (_c = (_b2 = bundle.collectionSubset) == null ? void 0 : _b2.swapPins) == null ? void 0 : _c.length) != null ? _d : 0) > 0 || ((_g = (_f = (_e = bundle.collectionSubset) == null ? void 0 : _e.pingPins) == null ? void 0 : _f.length) != null ? _g : 0) > 0 || ((_j = (_i = (_h = bundle.collectionSubset) == null ? void 0 : _h.pinKeys) == null ? void 0 : _i.length) != null ? _j : 0) > 0 || ((_m = (_l = (_k = bundle.collectionSubset) == null ? void 0 : _k.stickers) == null ? void 0 : _l.length) != null ? _m : 0) > 0;
    if (hasCollectionSubset) {
      const collections = existingCollectionOptions(this.plugin);
      new import_obsidian27.Setting(contentEl).setName("Collection import").setDesc("Used items from collections can be merged into an existing collection or imported into a new one.").addDropdown((d) => {
        d.addOption("create", "Create new collection");
        d.addOption("merge", "Merge into existing collection");
        d.addOption("none", "Do not import collection items");
        d.setValue(this.collectionMode);
        d.onChange((v) => {
          if (v === "create" || v === "merge" || v === "none") {
            this.collectionMode = v;
            this.render();
          }
        });
      });
      if (this.collectionMode === "create") {
        new import_obsidian27.Setting(contentEl).setName("New collection name").addText((t) => {
          var _a3, _b3;
          t.setPlaceholder((_b3 = (_a3 = bundle.collectionSubset) == null ? void 0 : _a3.suggestedName) != null ? _b3 : "Imported map");
          t.setValue(this.newCollectionName);
          t.onChange((v) => {
            var _a4;
            this.newCollectionName = v.trim() || ((_a4 = bundle.collectionSubset) == null ? void 0 : _a4.suggestedName) || "Imported map";
          });
        });
      }
      if (this.collectionMode === "merge") {
        new import_obsidian27.Setting(contentEl).setName("Target collection").addDropdown((d) => {
          var _a3;
          for (const opt of collections) d.addOption(opt.id, opt.name);
          d.setValue(this.mergeCollectionId || ((_a3 = collections[0]) == null ? void 0 : _a3.id) || "");
          d.onChange((v) => {
            this.mergeCollectionId = v;
          });
        });
      }
    }
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const importBtn = footer.createEl("button", { text: "Import" });
    const cancelBtn = footer.createEl("button", { text: "Cancel" });
    importBtn.onclick = () => {
      void this.runImport();
    };
    cancelBtn.onclick = () => this.close();
  }
  async loadSelectedFile(file) {
    var _a2, _b2;
    try {
      this.selectedFile = file;
      this.loaded = await loadBundleFromFile(file);
      const defaults = this.getImportDefaults();
      this.assetsRoot = defaults.assetsRoot;
      this.drawingsRoot = defaults.drawingsRoot;
      this.notesRoot = defaults.notesRoot;
      this.markersRoot = defaults.markersRoot;
      const safeBundleName = sanitizeFileName(this.loaded.bundle.bundleName || fileStem2(file.name)) || "import";
      this.newCollectionName = ((_a2 = this.loaded.bundle.collectionSubset) == null ? void 0 : _a2.suggestedName) || `Imported ${safeBundleName}`;
      const firstCollection = existingCollectionOptions(this.plugin)[0];
      this.mergeCollectionId = (_b2 = firstCollection == null ? void 0 : firstCollection.id) != null ? _b2 : "";
      this.render();
    } catch (err2) {
      console.error(err2);
      new import_obsidian27.Notice(`Import file could not be read: ${err2 instanceof Error ? err2.message : String(err2)}`, 5e3);
    }
  }
  async runImport() {
    if (!this.loaded) return;
    if (!this.view.file) {
      new import_obsidian27.Notice("Please import into a saved note.", 3e3);
      return;
    }
    try {
      const defaults = this.getImportDefaults();
      const mapId = nextUniqueMapId(this.editor, this.loaded.bundle.map.mapId);
      const prepared = await importBundleToVault(this.app, this.plugin, this.loaded, {
        targetNotePath: this.view.file.path,
        mapId,
        storageMode: this.storageMode,
        assetsRoot: this.assetsRoot.trim() || defaults.assetsRoot,
        drawingsRoot: this.drawingsRoot.trim() || defaults.drawingsRoot,
        notesRoot: this.notesRoot.trim() || defaults.notesRoot,
        markersRoot: this.markersRoot.trim() || defaults.markersRoot,
        collectionMode: this.collectionMode,
        mergeCollectionId: this.mergeCollectionId,
        newCollectionName: this.newCollectionName,
        stripUnresolvedNoteLinks: this.stripUnresolvedNoteLinks
      });
      const insertText = quoteAwareInsertionText(
        this.editor,
        prepared.codeBlock,
        prepared.inlineBlock
      );
      this.editor.replaceRange(insertText, this.editor.getCursor());
      const allWarnings = prepared.warnings;
      if (allWarnings.length > 0) {
        new import_obsidian27.Notice(allWarnings.join("\n"), 9e3);
      } else {
        new import_obsidian27.Notice("Map package imported.", 2500);
      }
      this.close();
    } catch (err2) {
      console.error(err2);
      new import_obsidian27.Notice(`Import failed: ${err2 instanceof Error ? err2.message : String(err2)}`, 6e3);
    }
  }
};

// src/travelRulesModals.ts
var import_obsidian28 = require("obsidian");
function genId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}
function deepClone6(x2) {
  if (typeof structuredClone === "function") return structuredClone(x2);
  return JSON.parse(JSON.stringify(x2));
}
function isRecord3(x2) {
  return typeof x2 === "object" && x2 !== null && !Array.isArray(x2);
}
function isTravelPerDayConfig(x2) {
  if (!isRecord3(x2)) return false;
  return typeof x2.value === "number" && typeof x2.unit === "string";
}
function isTravelPerDayPreset(x2) {
  if (!isRecord3(x2)) return false;
  return typeof x2.id === "string" && typeof x2.name === "string" && typeof x2.value === "number" && typeof x2.unit === "string";
}
function isCustomUnitDef(x2) {
  if (!isRecord3(x2)) return false;
  return typeof x2.id === "string" && typeof x2.name === "string" && typeof x2.abbreviation === "string" && typeof x2.metersPerUnit === "number";
}
function isTravelTimePreset(x2) {
  if (!isRecord3(x2)) return false;
  if (typeof x2.id !== "string" || typeof x2.name !== "string") return false;
  if (typeof x2.distanceValue !== "number") return false;
  if (typeof x2.distanceUnit !== "string") return false;
  if (typeof x2.timeValue !== "number" || typeof x2.timeUnit !== "string") return false;
  return true;
}
function isTerrainDef(x2) {
  if (!isRecord3(x2)) return false;
  return typeof x2.id === "string" && typeof x2.name === "string" && typeof x2.factor === "number";
}
function isTravelRulesPack(x2) {
  if (!isRecord3(x2)) return false;
  if (typeof x2.id !== "string" || typeof x2.name !== "string") return false;
  if (!Array.isArray(x2.customUnits) || !x2.customUnits.every(isCustomUnitDef)) return false;
  if (!Array.isArray(x2.terrains) || !x2.terrains.every(isTerrainDef)) return false;
  if (!Array.isArray(x2.travelTimePresets) || !x2.travelTimePresets.every(isTravelTimePreset)) return false;
  const hasNew = Array.isArray(x2.travelPerDayPresets) && x2.travelPerDayPresets.every(isTravelPerDayPreset);
  const hasOld = isTravelPerDayConfig(x2.travelPerDay);
  if (!hasNew && !hasOld) return false;
  if ("enabled" in x2 && typeof x2.enabled !== "boolean") return false;
  return true;
}
async function ensureFolderPathExists2(app, folder) {
  const normalized = (0, import_obsidian28.normalizePath)(folder).trim();
  if (!normalized) return;
  const parts = normalized.split("/").filter(Boolean);
  let current = "";
  for (const part of parts) {
    current = current ? `${current}/${part}` : part;
    if (!app.vault.getAbstractFileByPath(current)) {
      await app.vault.createFolder(current);
    }
  }
}
async function writeVaultText2(app, path, text) {
  const normalized = (0, import_obsidian28.normalizePath)(path);
  await ensureFolderPathExists2(app, normalized.split("/").slice(0, -1).join("/"));
  const existing = app.vault.getAbstractFileByPath(normalized);
  if (existing instanceof import_obsidian28.TFile) {
    await app.vault.modify(existing, text);
  } else {
    await app.vault.create(normalized, text);
  }
}
async function writeJsonToVault(app, path, payload) {
  const p = (0, import_obsidian28.normalizePath)(path);
  const json = JSON.stringify(payload, null, 2);
  await writeVaultText2(
    app,
    p,
    json
  );
  return p;
}
var TravelRulesManagerModal = class extends import_obsidian28.Modal {
  constructor(app, plugin, onDone) {
    super(app);
    this.plugin = plugin;
    this.onDone = onDone;
  }
  onOpen() {
    this.render();
  }
  onClose() {
    var _a2;
    this.contentEl.empty();
    (_a2 = this.onDone) == null ? void 0 : _a2.call(this);
  }
  render() {
    var _a2, _b2;
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Travel rules" });
    const packs = (_b2 = (_a2 = this.plugin.settings).travelRulesPacks) != null ? _b2 : _a2.travelRulesPacks = [];
    const list = contentEl.createDiv();
    if (packs.length === 0) {
      list.createEl("div", { text: "No travel packs yet." });
    }
    packs.forEach((p, idx) => {
      var _a3, _b3, _c, _d, _e, _f;
      const row = list.createDiv({ cls: "zoommap-travel-pack-row" });
      const enabled = row.createEl("input", { type: "checkbox" });
      enabled.addClass("zoommap-travel-pack-enabled");
      enabled.checked = p.enabled === true;
      enabled.onchange = () => {
        p.enabled = enabled.checked ? true : false;
        void this.plugin.saveSettings();
      };
      const left = row.createDiv({ cls: "zoommap-travel-pack-left" });
      left.createEl("div", { text: p.name || "(unnamed pack)" }).addClass("zoommap-collections-name");
      left.createEl("div", {
        text: `${(_b3 = (_a3 = p.customUnits) == null ? void 0 : _a3.length) != null ? _b3 : 0} custom units \u2022 ${(_d = (_c = p.terrains) == null ? void 0 : _c.length) != null ? _d : 0} terrains \u2022 ${(_f = (_e = p.travelTimePresets) == null ? void 0 : _e.length) != null ? _f : 0} travel presets`
      }).addClass("zoommap-collections-meta");
      const actions2 = row.createDiv({ cls: "zoommap-travel-pack-actions" });
      const edit = actions2.createEl("button", { text: "Edit" });
      edit.onclick = () => {
        new TravelRulesPackEditorModal(this.app, this.plugin, p, (res) => {
          if (res.action !== "save" || !res.pack) return;
          packs[idx] = res.pack;
          void this.plugin.saveSettings().then(() => this.render());
        }).open();
      };
      const exportBtn = actions2.createEl("button", { text: "Export" });
      exportBtn.addClass("zm-btn-sm");
      exportBtn.onclick = () => {
        void (async () => {
          try {
            const outPath = (0, import_obsidian28.normalizePath)(`ZoomMap/travel-pack-${p.id}.json`);
            const payload = {
              version: 1,
              pack: p,
              exportedAt: (/* @__PURE__ */ new Date()).toISOString()
            };
            const written = await writeJsonToVault(this.app, outPath, payload);
            new import_obsidian28.Notice(`Exported: ${written}`, 2500);
          } catch (e) {
            console.error(e);
            new import_obsidian28.Notice("Export failed.", 3e3);
          }
        })();
      };
      const del = actions2.createEl("button", { text: "Delete" });
      del.onclick = () => {
        packs.splice(idx, 1);
        void this.plugin.saveSettings().then(() => this.render());
      };
    });
    const actions = contentEl.createDiv({ cls: "zoommap-collections-actions" });
    const addBtn = actions.createEl("button", { text: "Add pack" });
    addBtn.onclick = () => {
      packs.push({
        id: genId("trp"),
        name: `Travel pack ${packs.length + 1}`,
        enabled: packs.length === 0,
        customUnits: [],
        terrains: [{ id: genId("ter"), name: "Normal", factor: 1 }],
        travelTimePresets: [],
        travelPerDayPresets: [{ id: genId("tpd"), name: "Default", value: 8, unit: "h" }],
        travelPerDay: { value: 8, unit: "h" }
        // legacy mirror
      });
      void this.plugin.saveSettings().then(() => this.render());
    };
    const importBtn = actions.createEl("button", { text: "Import\u2026" });
    importBtn.onclick = () => {
      new JsonFileSuggestModal(this.app, (file) => {
        void (async () => {
          await this.importFromFile(file);
          this.render();
        })();
      }).open();
    };
    const exportAllBtn = actions.createEl("button", { text: "Export all" });
    exportAllBtn.onclick = () => {
      void (async () => {
        try {
          const outPath = (0, import_obsidian28.normalizePath)("ZoomMap/travel-rules-packs.json");
          const payload = { version: 1, packs, exportedAt: (/* @__PURE__ */ new Date()).toISOString() };
          const written = await writeJsonToVault(this.app, outPath, payload);
          new import_obsidian28.Notice(`Exported: ${written}`, 2500);
        } catch (e) {
          console.error(e);
          new import_obsidian28.Notice("Export failed.", 3e3);
        }
      })();
    };
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    footer.createEl("button", { text: "Close" }).onclick = () => this.close();
  }
  async importFromFile(file) {
    var _a2, _b2;
    try {
      const raw = await this.app.vault.read(file);
      const obj = JSON.parse(raw);
      const packs = (_b2 = (_a2 = this.plugin.settings).travelRulesPacks) != null ? _b2 : _a2.travelRulesPacks = [];
      const existingIds = new Set(packs.map((p) => p.id));
      const addPack = (p) => {
        var _a3, _b3, _c;
        const next = deepClone6(p);
        if (!next.id || existingIds.has(next.id)) next.id = genId("trp");
        if (!next.name) next.name = `Imported pack ${packs.length + 1}`;
        (_a3 = next.customUnits) != null ? _a3 : next.customUnits = [];
        (_b3 = next.travelTimePresets) != null ? _b3 : next.travelTimePresets = [];
        (_c = next.travelPerDay) != null ? _c : next.travelPerDay = { value: 8, unit: "h" };
        packs.push(next);
        existingIds.add(next.id);
      };
      if (isRecord3(obj) && "version" in obj) {
        const v = obj.version;
        if (v !== 1) {
          new import_obsidian28.Notice("Unsupported import format.", 3500);
          return;
        }
        if ("packs" in obj && Array.isArray(obj.packs)) {
          for (const p of obj.packs) {
            if (isTravelRulesPack(p)) addPack(p);
          }
        } else if ("pack" in obj && isTravelRulesPack(obj.pack)) {
          addPack(obj.pack);
        } else {
          new import_obsidian28.Notice("Invalid travel rules JSON.", 3500);
          return;
        }
      } else {
        if (!isTravelRulesPack(obj)) {
          new import_obsidian28.Notice("Invalid travel pack JSON.", 3500);
          return;
        }
        addPack(obj);
      }
      await this.plugin.saveSettings();
      new import_obsidian28.Notice("Import successful.", 2e3);
    } catch (e) {
      console.error(e);
      new import_obsidian28.Notice("Import failed.", 3e3);
    }
  }
};
var TravelRulesPackEditorModal = class extends import_obsidian28.Modal {
  constructor(app, plugin, pack, onDone) {
    var _a2, _b2, _c, _d, _e, _f, _g, _h, _i, _j;
    super(app);
    this.plugin = plugin;
    this.original = pack;
    this.working = deepClone6(pack);
    (_b2 = (_a2 = this.working).customUnits) != null ? _b2 : _a2.customUnits = [];
    (_d = (_c = this.working).terrains) != null ? _d : _c.terrains = [];
    (_f = (_e = this.working).travelTimePresets) != null ? _f : _e.travelTimePresets = [];
    (_h = (_g = this.working).travelPerDayPresets) != null ? _h : _g.travelPerDayPresets = [{ id: genId("tpd"), name: "Default", value: 8, unit: "h" }];
    (_j = (_i = this.working).travelPerDay) != null ? _j : _i.travelPerDay = { value: 8, unit: "h" };
    this.onDone = onDone;
  }
  onOpen() {
    this.modalEl.addClass("zoommap-modal--travel");
    this.render();
  }
  onClose() {
    this.contentEl.empty();
  }
  render() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Edit travel pack" });
    new import_obsidian28.Setting(contentEl).setName("Name").addText((t) => {
      var _a2;
      t.setValue((_a2 = this.working.name) != null ? _a2 : "");
      t.onChange((v) => this.working.name = v.trim() || this.working.name);
    });
    contentEl.createEl("h3", { text: "Max travel time presets" });
    const perDayWrap = contentEl.createDiv();
    const renderPerDayPresets = () => {
      var _a2, _b2;
      perDayWrap.empty();
      const list = (_b2 = (_a2 = this.working).travelPerDayPresets) != null ? _b2 : _a2.travelPerDayPresets = [];
      if (list.length === 0) {
        perDayWrap.createEl("div", { text: "No max travel time presets." }).addClass("zoommap-muted");
      }
      list.forEach((p, idx) => {
        var _a3, _b3, _c;
        const row = perDayWrap.createDiv({ cls: "zoommap-travel-perday-row" });
        const name = row.createEl("input", { type: "text" });
        name.placeholder = "Name";
        name.value = (_a3 = p.name) != null ? _a3 : "";
        name.oninput = () => {
          p.name = name.value.trim();
        };
        const val = row.createEl("input", { type: "number" });
        val.placeholder = "8";
        val.value = String((_b3 = p.value) != null ? _b3 : 8);
        val.oninput = () => {
          const n = Number(String(val.value).replace(",", "."));
          if (Number.isFinite(n) && n > 0) p.value = n;
        };
        const unit = row.createEl("input", { type: "text" });
        unit.placeholder = "H";
        unit.value = (_c = p.unit) != null ? _c : "h";
        unit.oninput = () => {
          p.unit = unit.value.trim() || "h";
        };
        const delBtn = row.createEl("button", { text: "Delete" });
        delBtn.onclick = () => {
          list.splice(idx, 1);
          renderPerDayPresets();
        };
      });
      const addBtn = perDayWrap.createEl("button", { text: "Add max travel time" });
      addBtn.onclick = () => {
        list.push({ id: genId("tpd"), name: `Mode ${list.length + 1}`, value: 8, unit: "h" });
        renderPerDayPresets();
      };
    };
    renderPerDayPresets();
    contentEl.createEl("h3", { text: "Custom units" });
    const unitsWrap = contentEl.createDiv();
    const renderUnits = () => {
      var _a2, _b2;
      unitsWrap.empty();
      const units = (_b2 = (_a2 = this.working).customUnits) != null ? _b2 : _a2.customUnits = [];
      if (units.length === 0) {
        unitsWrap.createEl("div", { text: "No custom units." }).addClass("zoommap-muted");
      }
      units.forEach((u, idx) => {
        var _a3, _b3;
        const row = unitsWrap.createDiv({ cls: "zoommap-custom-unit-row" });
        const nameInput = row.createEl("input", { type: "text" });
        nameInput.classList.add("zm-cu-name");
        nameInput.placeholder = "Name";
        nameInput.value = (_a3 = u.name) != null ? _a3 : "";
        nameInput.oninput = () => u.name = nameInput.value.trim();
        const abbrInput = row.createEl("input", { type: "text" });
        abbrInput.classList.add("zm-cu-abbr");
        abbrInput.placeholder = "Abbreviation";
        abbrInput.value = (_b3 = u.abbreviation) != null ? _b3 : "";
        abbrInput.oninput = () => u.abbreviation = abbrInput.value.trim();
        const hint = row.createEl("div");
        hint.addClass("zoommap-muted");
        hint.setText("Calibrate on map");
        const delBtn = row.createEl("button", { text: "Delete" });
        delBtn.onclick = () => {
          units.splice(idx, 1);
          renderUnits();
        };
      });
      const addBtn = unitsWrap.createEl("button", { text: "Add custom unit" });
      addBtn.onclick = () => {
        units.push({
          id: genId("cu"),
          name: "Hex",
          abbreviation: "hex",
          metersPerUnit: 5 * 0.3048
        });
        renderUnits();
      };
    };
    renderUnits();
    contentEl.createEl("h3", { text: "Terrains" });
    const terrainsWrap = contentEl.createDiv();
    const renderTerrains = () => {
      var _a2, _b2;
      terrainsWrap.empty();
      const terrains = (_b2 = (_a2 = this.working).terrains) != null ? _b2 : _a2.terrains = [];
      if (terrains.length === 0) {
        terrainsWrap.createEl("div", { text: "No terrains." }).addClass("zoommap-muted");
      }
      terrains.forEach((t, idx) => {
        var _a3, _b3;
        const row = terrainsWrap.createDiv({ cls: "zoommap-custom-unit-row" });
        const nameInput = row.createEl("input", { type: "text" });
        nameInput.classList.add("zm-cu-name");
        nameInput.placeholder = "Name";
        nameInput.value = (_a3 = t.name) != null ? _a3 : "";
        nameInput.oninput = () => t.name = nameInput.value.trim();
        const factorInput = row.createEl("input", { type: "number" });
        factorInput.classList.add("zm-cu-factor");
        factorInput.placeholder = "1";
        factorInput.value = String((_b3 = t.factor) != null ? _b3 : 1);
        factorInput.oninput = () => {
          const n = Number(String(factorInput.value).replace(",", "."));
          if (Number.isFinite(n) && n > 0) t.factor = n;
        };
        const hint = row.createEl("div");
        hint.addClass("zoommap-muted");
        hint.setText("Speed factor");
        const delBtn = row.createEl("button", { text: "Delete" });
        delBtn.onclick = () => {
          terrains.splice(idx, 1);
          renderTerrains();
        };
      });
      const addBtn = terrainsWrap.createEl("button", { text: "Add terrain" });
      addBtn.onclick = () => {
        terrains.push({ id: genId("ter"), name: "Road", factor: 2 });
        renderTerrains();
      };
    };
    renderTerrains();
    contentEl.createEl("h3", { text: "Travel time presets" });
    const presetsWrap = contentEl.createDiv();
    const renderPresets = () => {
      var _a2, _b2, _c;
      presetsWrap.empty();
      const presets = (_b2 = (_a2 = this.working).travelTimePresets) != null ? _b2 : _a2.travelTimePresets = [];
      const customDefs = (_c = this.working.customUnits) != null ? _c : [];
      const head = presetsWrap.createDiv({ cls: "zm-travel-grid-head" });
      head.createSpan({ text: "Mode" });
      head.createSpan({ text: "Dist" });
      head.createSpan({ text: "Unit" });
      head.createSpan({ text: "Time" });
      head.createSpan({ text: "Time unit" });
      head.createSpan({ text: "" });
      const grid = presetsWrap.createDiv({ cls: "zm-travel-grid" });
      const addUnitOptions = (sel) => {
        const add = (value, label) => {
          const opt = sel.ownerDocument.createElement("option");
          opt.value = value;
          opt.textContent = label;
          sel.appendChild(opt);
        };
        add("m", "m");
        add("km", "km");
        add("mi", "mi");
        add("ft", "ft");
        for (const def of customDefs) {
          const label = def.abbreviation ? `${def.name} (${def.abbreviation})` : def.name;
          add(`custom:${def.id}`, label);
        }
      };
      presets.forEach((p, idx) => {
        var _a3, _b3, _c2, _d, _e;
        const name = grid.createEl("input", { type: "text", cls: "zm-travel-name" });
        name.value = (_a3 = p.name) != null ? _a3 : "";
        name.oninput = () => p.name = name.value.trim();
        const distVal = grid.createEl("input", { type: "number", cls: "zm-travel-num" });
        distVal.value = String((_b3 = p.distanceValue) != null ? _b3 : 1);
        distVal.oninput = () => {
          const n = Number(distVal.value);
          if (Number.isFinite(n) && n > 0) p.distanceValue = n;
        };
        const unitSel = grid.createEl("select", { cls: "zm-travel-unit" });
        addUnitOptions(unitSel);
        const current = p.distanceUnit === "custom" ? `custom:${(_c2 = p.distanceCustomUnitId) != null ? _c2 : ""}` : p.distanceUnit;
        unitSel.value = Array.from(unitSel.options).some((o) => o.value === current) ? current : "km";
        unitSel.onchange = () => {
          const v = unitSel.value;
          if (v.startsWith("custom:")) {
            p.distanceUnit = "custom";
            p.distanceCustomUnitId = v.slice("custom:".length) || void 0;
          } else {
            const isStd = v === "m" || v === "km" || v === "mi" || v === "ft";
            if (isStd) {
              p.distanceUnit = v;
            } else {
              p.distanceUnit = "km";
            }
            p.distanceCustomUnitId = void 0;
          }
        };
        const timeVal = grid.createEl("input", { type: "number", cls: "zm-travel-num" });
        timeVal.value = String((_d = p.timeValue) != null ? _d : 1);
        timeVal.oninput = () => {
          const n = Number(timeVal.value);
          if (Number.isFinite(n) && n > 0) p.timeValue = n;
        };
        const timeUnit = grid.createEl("input", { type: "text", cls: "zm-travel-timeunit" });
        timeUnit.value = (_e = p.timeUnit) != null ? _e : "";
        timeUnit.oninput = () => {
          p.timeUnit = timeUnit.value.trim();
        };
        const del = grid.createEl("button", { text: "Delete" });
        del.onclick = () => {
          presets.splice(idx, 1);
          renderPresets();
        };
      });
      const addBtn = presetsWrap.createEl("button", { text: "Add travel preset" });
      addBtn.onclick = () => {
        presets.push({
          id: genId("tt"),
          name: "Donkey",
          distanceValue: 1,
          distanceUnit: "mi",
          timeValue: 4,
          timeUnit: "h"
        });
        renderPresets();
      };
    };
    renderPresets();
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const saveBtn = footer.createEl("button", { text: "Save" });
    const cancelBtn = footer.createEl("button", { text: "Cancel" });
    saveBtn.onclick = () => {
      var _a2, _b2, _c, _d;
      this.original.name = this.working.name;
      this.original.enabled = this.working.enabled;
      this.original.customUnits = (_a2 = this.working.customUnits) != null ? _a2 : [];
      this.original.terrains = (_b2 = this.working.terrains) != null ? _b2 : [];
      this.original.travelTimePresets = (_c = this.working.travelTimePresets) != null ? _c : [];
      this.original.travelPerDayPresets = (_d = this.working.travelPerDayPresets) != null ? _d : [];
      const first = this.original.travelPerDayPresets[0];
      this.original.travelPerDay = first ? { value: first.value, unit: first.unit } : { value: 8, unit: "h" };
      this.close();
      this.onDone({ action: "save", pack: this.original });
    };
    cancelBtn.onclick = () => {
      this.close();
      this.onDone({ action: "cancel" });
    };
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
function toCssSize(v, fallback) {
  if (typeof v === "number" && Number.isFinite(v)) return `${v}px`;
  if (typeof v === "string" && v.trim().length > 0) return v.trim();
  return fallback;
}
function folderOf3(path) {
  const i2 = path.lastIndexOf("/");
  return i2 >= 0 ? path.slice(0, i2) : "";
}
var DEFAULT_FA_ZIP_URL = "https://use.fontawesome.com/releases/v6.4.0/fontawesome-free-6.4.0-web.zip";
var DEFAULT_RPG_ZIP_URL = "https://github.com/nagoshiashumari/rpg-awesome-raw/archive/refs/heads/master.zip";
function isPlainObject(val) {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}
function setCssProps2(el, props) {
  for (const [key, value] of Object.entries(props)) {
    if (value === null) el.style.removeProperty(key);
    else el.style.setProperty(key, value);
  }
}
function isCrossWindowHTMLElement(el, uiWin) {
  const candidate = el;
  const crossWin = uiWin;
  if (typeof crossWin.HTMLElement !== "function") {
    return false;
  }
  return candidate.instanceOf(crossWin.HTMLElement);
}
var DEFAULT_SETTINGS = {
  icons: [
    {
      key: "pinRed",
      pathOrDataUrl: svgPinDataUrl("#d23c3c"),
      size: 24,
      anchorX: 12,
      anchorY: 12,
      inCollections: true
    },
    {
      key: "pinBlue",
      pathOrDataUrl: svgPinDataUrl("#3c62d2"),
      size: 24,
      anchorX: 12,
      anchorY: 12,
      inCollections: true
    }
  ],
  defaultIconKey: "pinRed",
  wheelZoomFactor: 1.1,
  panMouseButton: "left",
  hoverMaxWidth: 360,
  applyHoverPopoverSizeGlobally: false,
  hoverMaxHeight: 260,
  showLinkFileNameInTooltip: false,
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
  travelTimePresets: [],
  travelPerDay: { value: 8, unit: "h" },
  travelRulesPacks: [],
  defaultScaleLikeSticker: false,
  enableDrawing: false,
  preferActiveLayerInEditor: false,
  enableTextLayers: false,
  enableMeasurePro: false,
  enableSessionImageCache: false,
  showZoomButtonsHud: false,
  sessionImageCacheMb: 512,
  keepOverlaysLoaded: false,
  preferCanvasImagesWhenCaching: false,
  svgRasterMaxScale: 8,
  showImageIconPreviewInSettings: false,
  enableGrid: false,
  middleClickOpensLinkInNewTab: false,
  enableSecondScreen: false,
  secondScreenFolder: "ZoomMap/SecondScreen"
};
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
function parseZoomYaml(value, fallback) {
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
function parsePxNumber(value, fallback) {
  var _a2;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const s = value.trim();
    if (!s) return fallback;
    const m = (_a2 = /^(-?\d+(?:[.,]\d+)?)\s*px$/i.exec(s)) != null ? _a2 : /^(-?\d+(?:[.,]\d+)?)$/.exec(s);
    if (m) {
      const n = Number(m[1].replace(",", "."));
      if (Number.isFinite(n)) return n;
    }
  }
  return fallback;
}
function parseFrameInsetsYaml(v) {
  if (!v || typeof v !== "object") return void 0;
  const o = v;
  const unit = o.unit === "percent" ? "percent" : "framePx";
  const parsePercent = (x2) => {
    if (typeof x2 === "number") return x2;
    if (typeof x2 === "string") {
      let s = x2.trim();
      if (!s) return Number.NaN;
      if (s.endsWith("%")) s = s.slice(0, -1).trim();
      const n = Number(s.replace(",", "."));
      return n;
    }
    return Number.NaN;
  };
  const parseFramePx = (x2) => {
    return parsePxNumber(x2, Number.NaN);
  };
  const top = unit === "percent" ? parsePercent(o.top) : parseFramePx(o.top);
  const right = unit === "percent" ? parsePercent(o.right) : parseFramePx(o.right);
  const bottom = unit === "percent" ? parsePercent(o.bottom) : parseFramePx(o.bottom);
  const left = unit === "percent" ? parsePercent(o.left) : parseFramePx(o.left);
  if (![top, right, bottom, left].every((n) => Number.isFinite(n) && n >= 0)) {
    return void 0;
  }
  return { unit, top, right, bottom, left };
}
function parseAlign(v) {
  if (v === "left" || v === "center" || v === "right") return v;
  return void 0;
}
function parseResizeHandle(v) {
  return v === "left" || v === "right" || v === "both" || v === "native" ? v : "right";
}
async function readSavedFrame(app, markersPath) {
  try {
    const file = app.vault.getAbstractFileByPath((0, import_obsidian29.normalizePath)(markersPath));
    if (!(file instanceof import_obsidian29.TFile)) return null;
    const raw = await app.vault.read(file);
    const parsed = JSON.parse(raw);
    let fw = Number.NaN;
    let fh = Number.NaN;
    if (isPlainObject(parsed)) {
      const frame = parsed.frame;
      if (frame && typeof frame === "object") {
        const fr = frame;
        fw = typeof fr.w === "number" ? fr.w : Number(fr.w);
        fh = typeof fr.h === "number" ? fr.h : Number(fr.h);
      }
    }
    if (Number.isFinite(fw) && Number.isFinite(fh) && fw >= 48 && fh >= 48) {
      return { w: Math.round(fw), h: Math.round(fh) };
    }
  } catch (e) {
  }
  return null;
}
var ZoomMapPlugin = class extends import_obsidian29.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
    this.imageCache = null;
    this.mapInstances = /* @__PURE__ */ new Set();
    this.pendingMapRestores = /* @__PURE__ */ new Map();
    this.activeMap = null;
  }
  makeMapRestoreKey(sourcePath, mapId) {
    return `${(0, import_obsidian29.normalizePath)(sourcePath)}::${mapId.trim()}`;
  }
  registerMapInstance(inst) {
    this.mapInstances.add(inst);
  }
  unregisterMapInstance(inst) {
    this.mapInstances.delete(inst);
    if (this.activeMap === inst) this.activeMap = null;
  }
  stashMapRestore(sourcePath, mapId, state) {
    if (!mapId.trim()) return;
    this.pendingMapRestores.set(this.makeMapRestoreKey(sourcePath, mapId), state);
  }
  consumeMapRestore(sourcePath, mapId) {
    var _a2;
    if (!mapId.trim()) return null;
    const key = this.makeMapRestoreKey(sourcePath, mapId);
    const state = (_a2 = this.pendingMapRestores.get(key)) != null ? _a2 : null;
    if (state) this.pendingMapRestores.delete(key);
    return state;
  }
  snapshotMapsForSourceNote(sourcePath) {
    for (const inst of this.mapInstances) {
      if ((0, import_obsidian29.normalizePath)(inst.getSourcePath()) !== (0, import_obsidian29.normalizePath)(sourcePath)) continue;
      const mapId = inst.getMapId();
      const state = inst.captureRestoreState();
      if (state && mapId.trim()) this.stashMapRestore(sourcePath, mapId, state);
    }
  }
  setActiveMap(inst) {
    this.activeMap = inst;
  }
  notifyMapInstancesSettingsChanged() {
    for (const inst of this.mapInstances) {
      inst.onPluginSettingsChanged();
    }
  }
  getUiDocument() {
    return this.app.workspace.containerEl.ownerDocument;
  }
  clearGlobalHoverPopoverSettings() {
    const doc = this.getUiDocument();
    const root = doc.documentElement;
    const body = doc.body;
    if (!root || !body) return;
    body.classList.remove("zm-global-hover-popover-size");
    root.style.removeProperty("--zm-hover-popover-max-width");
    root.style.removeProperty("--zm-hover-popover-max-height");
    root.style.removeProperty("--popover-width");
    root.style.removeProperty("--popover-height");
    root.style.removeProperty("--popover-max-height");
    body.style.removeProperty("--zm-hover-popover-max-width");
    body.style.removeProperty("--zm-hover-popover-max-height");
    body.style.removeProperty("--popover-width");
    body.style.removeProperty("--popover-height");
    body.style.removeProperty("--popover-max-height");
  }
  applyGlobalHoverPopoverSettings() {
    var _a2, _b2;
    const doc = this.getUiDocument();
    const root = doc.documentElement;
    const body = doc.body;
    if (!root || !body) return;
    if (!this.settings.applyHoverPopoverSizeGlobally) {
      this.clearGlobalHoverPopoverSettings();
      return;
    }
    const maxW = Math.max(200, (_a2 = this.settings.hoverMaxWidth) != null ? _a2 : 360);
    const maxH = Math.max(120, (_b2 = this.settings.hoverMaxHeight) != null ? _b2 : 260);
    body.classList.add("zm-global-hover-popover-size");
    root.style.setProperty("--zm-hover-popover-max-width", `${maxW}px`);
    root.style.setProperty("--zm-hover-popover-max-height", `${maxH}px`);
  }
  async onload() {
    await this.loadSettings();
    this.applyGlobalHoverPopoverSettings();
    this.applyImageCacheSettings();
    this.addCommand({
      id: "insert-new-map",
      name: "Insert new map\u2026",
      editorCallback: (editor, view) => {
        const file = view.file;
        if (!file) return;
        const initialConfig = {
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
          align: void 0,
          markerLayers: ["Default"],
          id: `map-${Date.now().toString(36)}`,
          viewportFrame: "",
          viewportFrameInsets: {
            unit: "framePx",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          }
        };
        new ViewEditorModal(this.app, initialConfig, (res) => {
          var _a2, _b2;
          if (res.action !== "save" || !res.config) return;
          const yaml = this.buildYamlFromViewConfig(res.config);
          const block = "```zoommap\n" + yaml + "\n```\n";
          const cur = editor.getCursor();
          const curLineText = (_a2 = editor.getLine(cur.line)) != null ? _a2 : "";
          const m = /^(\s*(?:>\s*)+)/.exec(curLineText);
          const quotePrefix = (_b2 = m == null ? void 0 : m[1]) != null ? _b2 : "";
          if (!quotePrefix) {
            editor.replaceRange(block, cur);
            return;
          }
          const cursorAfterPrefix = cur.ch >= quotePrefix.length;
          const lines = block.split("\n");
          const quoted = lines.map((ln2, idx) => {
            if (idx === 0 && cursorAfterPrefix) return ln2;
            return quotePrefix + ln2;
          }).join("\n");
          editor.replaceRange(quoted, cur);
        }).open();
      }
    });
    this.addCommand({
      id: "export-active-map-package",
      name: "Export active map package\u2026",
      checkCallback: (checking) => {
        const map = this.activeMap;
        if (!map) return false;
        if (!checking) this.openExportMapBundleModal(map);
        return true;
      }
    });
    this.addCommand({
      id: "import-map-package",
      name: "Import map package\u2026",
      editorCallback: (editor, view) => {
        const mdView = view;
        const file = mdView.file;
        if (!file) {
          new import_obsidian29.Notice("Please open a note in edit mode first.", 2500);
          return;
        }
        new ImportMapBundleModal(this.app, this, editor, mdView).open();
      }
    });
    this.addCommand({
      id: "toggle-measure-mode",
      name: "Toggle measure mode",
      checkCallback: (checking) => {
        const map = this.activeMap;
        if (!map) return false;
        if (!checking) map.toggleMeasureFromCommand();
        return true;
      }
    });
    this.addCommand({
      id: "clear-measurement",
      name: "Clear measurement",
      checkCallback: (checking) => {
        const map = this.activeMap;
        if (!map) return false;
        if (!checking) map.clearMeasurementFromCommand();
        return true;
      }
    });
    this.registerMarkdownCodeBlockProcessor(
      "zoommap",
      async (src, el, ctx) => {
        var _a2, _b2, _c, _d;
        let opts = {};
        try {
          const parsed = (0, import_obsidian29.parseYaml)(src);
          if (parsed && typeof parsed === "object") {
            opts = parsed;
          }
        } catch (error) {
          console.error("Zoom Map: failed to parse zoommap block", error);
        }
        const yamlBases = parseBasesYaml(opts.imageBases);
        const yamlOverlays = parseOverlaysYaml(opts.imageOverlays);
        const yamlMetersPerPixel = parseScaleYaml(opts.scale);
        const yamlFrameInsets = parseFrameInsetsYaml(opts.viewportFrameInsets);
        let initialZoom;
        let initialCenter;
        let initialViewRect;
        const viewOpt = opts.view;
        if (viewOpt && typeof viewOpt === "object") {
          const rawZoom = parseZoomYaml(viewOpt.zoom, NaN);
          if (!Number.isFinite(rawZoom) || rawZoom <= 0) {
            initialZoom = void 0;
          } else {
            initialZoom = rawZoom;
          }
          const cx = typeof viewOpt.centerX === "number" ? viewOpt.centerX : NaN;
          const cy = typeof viewOpt.centerY === "number" ? viewOpt.centerY : NaN;
          if (Number.isFinite(cx) && Number.isFinite(cy)) {
            initialCenter = {
              x: Math.min(Math.max(cx, 0), 1),
              y: Math.min(Math.max(cy, 0), 1)
            };
          }
          const left = typeof viewOpt.left === "number" ? viewOpt.left : Number.NaN;
          const top = typeof viewOpt.top === "number" ? viewOpt.top : Number.NaN;
          const right = typeof viewOpt.right === "number" ? viewOpt.right : Number.NaN;
          const bottom = typeof viewOpt.bottom === "number" ? viewOpt.bottom : Number.NaN;
          if (Number.isFinite(left) && Number.isFinite(top) && Number.isFinite(right) && Number.isFinite(bottom) && right > left && bottom > top) {
            initialViewRect = { left, top, right, bottom };
          }
        }
        const preferCanvas = !!this.settings.enableSessionImageCache && !!this.settings.preferCanvasImagesWhenCaching;
        const yamlRender = typeof opts.render === "string" ? opts.render.trim().toLowerCase() : "";
        const renderMode = yamlRender === "canvas" ? "canvas" : yamlRender === "dom" ? "dom" : preferCanvas ? "canvas" : "dom";
        let image = typeof opts.image === "string" ? opts.image.trim() : "";
        if (!image && yamlBases.length > 0) image = yamlBases[0].path;
        if (!image) {
          el.createEl("div", { text: "Image is missing." });
          return;
        }
        const responsive = !!((_a2 = opts.responsive) != null ? _a2 : opts.responsiv);
        const storageRaw = typeof opts.storage === "string" ? opts.storage.toLowerCase() : "";
        const storageMode = storageRaw === "note" || storageRaw === "inline" || storageRaw === "in-note" ? "note" : storageRaw === "json" ? "json" : (_b2 = this.settings.storageDefault) != null ? _b2 : "json";
        const sectionInfo = ctx.getSectionInfo(el);
        const defaultId = `map-${(_c = sectionInfo == null ? void 0 : sectionInfo.lineStart) != null ? _c : Date.now()}`;
        const idFromYaml = opts.id;
        const mapId = typeof idFromYaml === "string" && idFromYaml.trim() ? idFromYaml.trim() : defaultId;
        const screenRole = opts.screenRole === "player" || opts.screenRole === "controller" ? opts.screenRole : void 0;
        const markersPathRaw = typeof opts.markers === "string" ? opts.markers : void 0;
        const minZoom = responsive ? 1e-6 : parseZoomYaml(opts.minZoom, 0.25);
        const maxZoom = responsive ? 1e6 : parseZoomYaml(opts.maxZoom, 8);
        const markersPath = (0, import_obsidian29.normalizePath)(markersPathRaw != null ? markersPathRaw : `${image}.markers.json`);
        const align = parseAlign(opts.align);
        const wrap = !!opts.wrap;
        const classesValue = opts.classes;
        const extraClasses = Array.isArray(classesValue) ? classesValue.map((c) => String(c)) : typeof classesValue === "string" ? classesValue.split(/\s+/).map((c) => c.trim()).filter(Boolean) : [];
        const resizable = responsive ? false : typeof opts.resizable === "boolean" ? opts.resizable : this.settings.defaultResizable;
        const resizeHandle = responsive ? "right" : parseResizeHandle(opts.resizeHandle);
        const widthFromYaml = Object.prototype.hasOwnProperty.call(opts, "width");
        const heightFromYaml = Object.prototype.hasOwnProperty.call(opts, "height");
        const extSettings = this.settings;
        const widthDefault = wrap ? (_d = extSettings.defaultWidthWrapped) != null ? _d : "50%" : this.settings.defaultWidth;
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
        const markerLayersFromYaml = Array.isArray(opts.markerLayers) ? opts.markerLayers.map((v) => {
          if (typeof v === "string") {
            return v.trim();
          }
          if (v && typeof v === "object" && "name" in v) {
            const name = v.name;
            return typeof name === "string" ? name.trim() : "";
          }
          return "";
        }).filter((s) => s.length > 0) : void 0;
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
          mapId,
          responsive,
          yamlMarkerLayers: markerLayersFromYaml,
          displayOnly: !!opts.displayOnly,
          initialZoom,
          initialCenter,
          initialViewRect,
          screenRole,
          viewportFrame: typeof opts.viewportFrame === "string" ? opts.viewportFrame.trim() : void 0,
          viewportFrameInsets: yamlFrameInsets
        };
        const inst = new MapInstance(this.app, this, el, cfg);
        ctx.addChild(inst);
      }
    );
    this.addSettingTab(new ZoomMapSettingTab(this.app, this));
  }
  getIconDefaultLink(iconKey) {
    var _a2;
    const key = (iconKey != null ? iconKey : "").trim();
    if (!key) return void 0;
    const icon = (_a2 = this.settings.icons) == null ? void 0 : _a2.find((i2) => i2.key === key);
    const raw = icon == null ? void 0 : icon.defaultLink;
    const trimmed = typeof raw === "string" ? raw.trim() : "";
    return trimmed.length ? trimmed : void 0;
  }
  openExportMapBundleModal(map) {
    new ExportMapBundleModal(this.app, this, map).open();
  }
  getEnabledTravelPacks() {
    var _a2;
    const packsRaw = (_a2 = this.settings.travelRulesPacks) != null ? _a2 : [];
    const packs = packsRaw.filter((p) => {
      if (!p || typeof p !== "object") return false;
      if (Array.isArray(p)) return false;
      const r = p;
      return typeof r.id === "string";
    });
    return packs.filter((p) => p.enabled === true);
  }
  getActiveCustomUnits() {
    const packs = this.getEnabledTravelPacks();
    return packs.flatMap((p) => {
      var _a2;
      return (_a2 = p.customUnits) != null ? _a2 : [];
    });
  }
  getActiveTerrains() {
    const packs = this.getEnabledTravelPacks();
    return packs.flatMap((p) => {
      var _a2;
      return (_a2 = p.terrains) != null ? _a2 : [];
    });
  }
  getActiveTravelTimePresets() {
    const packs = this.getEnabledTravelPacks();
    return packs.flatMap((p) => {
      var _a2;
      return (_a2 = p.travelTimePresets) != null ? _a2 : [];
    });
  }
  getActiveTravelPerDayPresets() {
    var _a2;
    const packs = this.getEnabledTravelPacks();
    if (packs.length === 0) return null;
    const first = packs[0];
    const presets = ((_a2 = first.travelPerDayPresets) != null ? _a2 : []).filter((x2) => !!x2 && typeof x2.id === "string");
    return {
      presets,
      packName: first.name,
      multipleEnabled: packs.length > 1
    };
  }
  onunload() {
    var _a2;
    this.clearGlobalHoverPopoverSettings();
    (_a2 = this.imageCache) == null ? void 0 : _a2.clear();
    this.imageCache = null;
  }
  builtinIcon() {
    var _a2;
    return (_a2 = this.settings.icons[0]) != null ? _a2 : {
      key: "builtin",
      pathOrDataUrl: svgPinDataUrl("#d23c3c"),
      size: 24,
      anchorX: 12,
      anchorY: 12,
      inCollections: true
    };
  }
  async loadSettings() {
    var _a2, _b2, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J, _K, _L, _M, _N, _O, _P, _Q, _R, _S, _T, _U, _V, _W, _X, _Y, _Z, __, _$, _aa;
    const savedUnknown = await this.loadData();
    const merged = { ...DEFAULT_SETTINGS };
    if (isPlainObject(savedUnknown)) {
      Object.assign(merged, savedUnknown);
    }
    this.settings = merged;
    const ext = this.settings;
    (_b2 = (_a2 = this.settings).baseCollections) != null ? _b2 : _a2.baseCollections = [];
    (_c = ext.defaultWidthWrapped) != null ? _c : ext.defaultWidthWrapped = "50%";
    (_d = ext.libraryFilePath) != null ? _d : ext.libraryFilePath = "ZoomMap/library.json";
    (_e = ext.faFolderPath) != null ? _e : ext.faFolderPath = "ZoomMap/SVGs";
    (_g = (_f = this.settings).customUnits) != null ? _g : _f.customUnits = [];
    (_i = (_h = this.settings).travelTimePresets) != null ? _i : _h.travelTimePresets = [];
    (_k = (_j = this.settings).travelPerDay) != null ? _k : _j.travelPerDay = { value: 8, unit: "h" };
    (_m = (_l = this.settings).travelRulesPacks) != null ? _m : _l.travelRulesPacks = [];
    if (Array.isArray(this.settings.travelRulesPacks)) {
      for (const p of this.settings.travelRulesPacks) {
        if (typeof p.enabled !== "boolean") {
          p.enabled = true;
        }
        (_n = p.customUnits) != null ? _n : p.customUnits = [];
        (_o = p.terrains) != null ? _o : p.terrains = [];
        (_p = p.travelTimePresets) != null ? _p : p.travelTimePresets = [];
        (_q = p.travelPerDay) != null ? _q : p.travelPerDay = { value: 8, unit: "h" };
        const perDay = p.travelPerDay;
        if (!Number.isFinite(perDay.value) || perDay.value <= 0) perDay.value = 8;
        perDay.unit = ((_r = perDay.unit) != null ? _r : "").trim() || "h";
      }
    }
    if (((_t = (_s = this.settings.travelRulesPacks) == null ? void 0 : _s.length) != null ? _t : 0) === 0) {
      const legacyUnits = (_u = this.settings.customUnits) != null ? _u : [];
      const legacyPresets = (_v = this.settings.travelTimePresets) != null ? _v : [];
      const legacyPerDay = (_w = this.settings.travelPerDay) != null ? _w : { value: 8, unit: "h" };
      const shouldCreate = legacyUnits.length > 0 || legacyPresets.length > 0 || !!legacyPerDay;
      if (shouldCreate) {
        const pack = {
          id: `trp-${Math.random().toString(36).slice(2, 8)}`,
          name: "Default travel rules",
          enabled: true,
          customUnits: legacyUnits,
          travelTimePresets: legacyPresets,
          travelPerDay: legacyPerDay
        };
        this.settings.travelRulesPacks = [pack];
      }
    }
    if (!Number.isFinite(this.settings.travelPerDay.value) || this.settings.travelPerDay.value <= 0) {
      this.settings.travelPerDay.value = 8;
    }
    this.settings.travelPerDay.unit = ((_x = this.settings.travelPerDay.unit) != null ? _x : "").trim() || "h";
    (_z = (_y = this.settings).enableTextLayers) != null ? _z : _y.enableTextLayers = false;
    (_B = (_A = this.settings).enableMeasurePro) != null ? _B : _A.enableMeasurePro = false;
    (_D = (_C = this.settings).showLinkFileNameInTooltip) != null ? _D : _C.showLinkFileNameInTooltip = false;
    (_F = (_E = this.settings).showZoomButtonsHud) != null ? _F : _E.showZoomButtonsHud = false;
    (_H = (_G = this.settings).enableGrid) != null ? _H : _G.enableGrid = false;
    (_J = (_I = this.settings).applyHoverPopoverSizeGlobally) != null ? _J : _I.applyHoverPopoverSizeGlobally = false;
    (_L = (_K = this.settings).enableSessionImageCache) != null ? _L : _K.enableSessionImageCache = false;
    (_N = (_M = this.settings).sessionImageCacheMb) != null ? _N : _M.sessionImageCacheMb = 512;
    (_P = (_O = this.settings).keepOverlaysLoaded) != null ? _P : _O.keepOverlaysLoaded = false;
    (_R = (_Q = this.settings).preferCanvasImagesWhenCaching) != null ? _R : _Q.preferCanvasImagesWhenCaching = false;
    (_T = (_S = this.settings).svgRasterMaxScale) != null ? _T : _S.svgRasterMaxScale = 8;
    (_V = (_U = this.settings).showImageIconPreviewInSettings) != null ? _V : _U.showImageIconPreviewInSettings = false;
    (_X = (_W = this.settings).middleClickOpensLinkInNewTab) != null ? _X : _W.middleClickOpensLinkInNewTab = false;
    (_Z = (_Y = this.settings).enableSecondScreen) != null ? _Z : _Y.enableSecondScreen = false;
    (_$ = (__ = this.settings).secondScreenFolder) != null ? _$ : __.secondScreenFolder = "ZoomMap/SecondScreen";
    for (const ico of (_aa = this.settings.icons) != null ? _aa : []) {
      if (typeof ico.inCollections !== "boolean") {
        ico.inCollections = true;
      }
    }
  }
  async saveSettings() {
    await this.saveData(this.settings);
    this.applyGlobalHoverPopoverSettings();
    this.notifyMapInstancesSettingsChanged();
    this.applyImageCacheSettings();
  }
  applyImageCacheSettings() {
    var _a2, _b2;
    const enabled = !!this.settings.enableSessionImageCache;
    if (!enabled) {
      (_a2 = this.imageCache) == null ? void 0 : _a2.clear();
      this.imageCache = null;
      return;
    }
    const mbRaw = (_b2 = this.settings.sessionImageCacheMb) != null ? _b2 : 512;
    const mb = Number.isFinite(mbRaw) && mbRaw > 0 ? mbRaw : 512;
    const bytes = Math.round(mb * 1024 * 1024);
    if (!this.imageCache) {
      this.imageCache = new ImageCache(this.app, bytes);
    } else {
      this.imageCache.setMaxBytes(bytes);
    }
  }
  /* -------- Library file (icons + collections) -------- */
  async ensureFolder(path) {
    const folder = folderOf3(path);
    if (!folder) return;
    if (!this.app.vault.getAbstractFileByPath(folder)) {
      await this.app.vault.createFolder(folder);
    }
  }
  async saveLibraryToPath(path) {
    var _a2, _b2, _c;
    const p = (0, import_obsidian29.normalizePath)(path);
    const ext = this.settings;
    const payload = {
      version: 1,
      icons: (_a2 = this.settings.icons) != null ? _a2 : [],
      baseCollections: (_b2 = this.settings.baseCollections) != null ? _b2 : [],
      travelRulesPacks: (_c = this.settings.travelRulesPacks) != null ? _c : [],
      exportedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    try {
      await this.ensureFolder(p);
      const existing = this.app.vault.getAbstractFileByPath(p);
      const json = JSON.stringify(payload, null, 2);
      if (existing instanceof import_obsidian29.TFile) {
        await this.app.vault.modify(existing, json);
      } else {
        await this.app.vault.create(p, json);
      }
      ext.libraryFilePath = p;
      await this.saveSettings();
      new import_obsidian29.Notice(`Library saved to ${p}`, 2e3);
    } catch (e) {
      console.error("Save library failed", e);
      new import_obsidian29.Notice("Failed to save library.", 2500);
    }
  }
  async loadLibraryFromFile(file) {
    try {
      const raw = await this.app.vault.read(file);
      const obj = JSON.parse(raw);
      if (!isPlainObject(obj)) {
        new import_obsidian29.Notice("Invalid library file.", 2500);
        return;
      }
      const hasIcons = (x2) => isPlainObject(x2) && "icons" in x2;
      const hasBaseCollections = (x2) => isPlainObject(x2) && "baseCollections" in x2;
      let icons = [];
      if (hasIcons(obj) && Array.isArray(obj.icons)) {
        icons = obj.icons;
      }
      let cols = [];
      if (hasBaseCollections(obj) && Array.isArray(obj.baseCollections)) {
        cols = obj.baseCollections;
      }
      this.settings.icons = icons;
      this.settings.baseCollections = cols;
      this.settings.libraryFilePath = file.path;
      await this.saveSettings();
      new import_obsidian29.Notice(`Library loaded from ${file.path}`, 2e3);
    } catch (e) {
      console.error("Load library failed", e);
      new import_obsidian29.Notice("Failed to load library.", 2500);
    }
  }
  async downloadFontAwesomeZip() {
    var _a2;
    const ext = this.settings;
    const folder = (0, import_obsidian29.normalizePath)(((_a2 = ext.faFolderPath) == null ? void 0 : _a2.trim()) || "ZoomMap/SVGs");
    const zipPath = (0, import_obsidian29.normalizePath)(`${folder}/fontawesome-free.zip`);
    try {
      if (!this.app.vault.getAbstractFileByPath(folder)) {
        await this.app.vault.createFolder(folder);
      }
      new import_obsidian29.Notice("Downloading font awesome free zip\u2026", 2500);
      const res = await (0, import_obsidian29.requestUrl)({
        url: DEFAULT_FA_ZIP_URL,
        method: "GET"
      });
      await this.app.vault.adapter.writeBinary(zipPath, res.arrayBuffer);
      new import_obsidian29.Notice(
        `Downloaded Font Awesome ZIP to ${zipPath}. Please unzip it so that SVG files are available in this folder.`,
        6e3
      );
    } catch (e) {
      console.error("Download Font Awesome ZIP failed", e);
      new import_obsidian29.Notice("Failed to download font awesome zip.", 4e3);
    }
  }
  async downloadRpgAwesomeZip() {
    var _a2;
    const ext = this.settings;
    const folder = (0, import_obsidian29.normalizePath)(((_a2 = ext.faFolderPath) == null ? void 0 : _a2.trim()) || "ZoomMap/SVGs");
    const zipPath = (0, import_obsidian29.normalizePath)(`${folder}/rpg-awesome.zip`);
    try {
      if (!this.app.vault.getAbstractFileByPath(folder)) {
        await this.app.vault.createFolder(folder);
      }
      new import_obsidian29.Notice("Downloading rpg awesome SVG pack\u2026", 2500);
      const res = await (0, import_obsidian29.requestUrl)({
        url: DEFAULT_RPG_ZIP_URL,
        method: "GET"
      });
      await this.app.vault.adapter.writeBinary(zipPath, res.arrayBuffer);
      new import_obsidian29.Notice(
        `Downloaded RPG Awesome ZIP to ${zipPath}. Please unzip it so that the SVG files are available in this folder.`,
        6e3
      );
    } catch (e) {
      console.error("Download RPG Awesome ZIP failed", e);
      new import_obsidian29.Notice("Failed to download rpg awesome zip.", 4e3);
    }
  }
  rescanSvgFolder() {
    var _a2;
    const ext = this.settings;
    const folder = (0, import_obsidian29.normalizePath)(((_a2 = ext.faFolderPath) == null ? void 0 : _a2.trim()) || "ZoomMap/SVGs");
    const files = this.app.vault.getFiles();
    const prefix = folder.endsWith("/") ? folder : folder + "/";
    const count = files.filter((f) => {
      var _a3;
      if (((_a3 = f.extension) == null ? void 0 : _a3.toLowerCase()) !== "svg") return false;
      return f.path === folder || f.path.startsWith(prefix);
    }).length;
    new import_obsidian29.Notice(
      `Found ${count} SVG files under ${folder}. They will be available in the \u201CAdd SVG icon\u201D picker.`,
      4e3
    );
    return count;
  }
  buildYamlFromViewConfig(cfg) {
    var _a2, _b2, _c, _d;
    const obj = {};
    const bases = ((_a2 = cfg.imageBases) != null ? _a2 : []).filter(
      (b) => b.path && b.path.trim().length > 0
    );
    if (bases.length > 0) {
      obj.imageBases = bases.map(
        (b) => b.name ? { path: b.path, name: b.name } : { path: b.path }
      );
    }
    const overlays = ((_b2 = cfg.overlays) != null ? _b2 : []).filter(
      (o) => o.path && o.path.trim().length > 0
    );
    if (overlays.length > 0) {
      obj.imageOverlays = overlays.map((o) => {
        const r = {
          path: o.path
        };
        if (o.name) r.name = o.name;
        if (typeof o.visible === "boolean") r.visible = o.visible;
        return r;
      });
    }
    let markersPath = (_c = cfg.markersPath) == null ? void 0 : _c.trim();
    if ((!markersPath || !markersPath.length) && bases.length > 0) {
      const first = bases[0].path;
      const dot = first.lastIndexOf(".");
      const base = dot >= 0 ? first.slice(0, dot) : first;
      markersPath = `${base}.markers.json`;
    }
    if (markersPath) obj.markers = markersPath;
    if (cfg.markerLayers && cfg.markerLayers.length > 0) {
      obj.markerLayers = cfg.markerLayers.map((n) => n.trim()).filter((n) => n.length > 0);
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
    obj.render = cfg.renderMode;
    if (cfg.align) obj.align = cfg.align;
    if (cfg.id && cfg.id.trim().length > 0) {
      obj.id = cfg.id.trim();
    }
    const frame = (_d = cfg.viewportFrame) == null ? void 0 : _d.trim();
    if (frame) {
      obj.viewportFrame = frame;
      if (cfg.viewportFrameInsets) {
        obj.viewportFrameInsets = {
          unit: cfg.viewportFrameInsets.unit,
          top: cfg.viewportFrameInsets.top,
          right: cfg.viewportFrameInsets.right,
          bottom: cfg.viewportFrameInsets.bottom,
          left: cfg.viewportFrameInsets.left
        };
      }
    }
    return (0, import_obsidian29.stringifyYaml)(obj).trimEnd();
  }
};
function tintSvgMarkup2(svg, color) {
  var _a2;
  const c = color.trim();
  if (!c) return svg;
  try {
    const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
    const root = doc.querySelector("svg");
    if (!root) return svg;
    const inner = (_a2 = root.querySelector("#zm-inner")) != null ? _a2 : root;
    const base = root.querySelector("#zm-base");
    const outline = root.querySelector("#zm-outline");
    const shapes = inner.querySelectorAll("path, circle, rect, polygon, polyline, line, ellipse");
    let touched = false;
    shapes.forEach((el) => {
      var _a3, _b2;
      if (base && base.contains(el)) return;
      if (outline && outline.contains(el)) return;
      const styleFill = (_a3 = el.style) == null ? void 0 : _a3.fill;
      const styleStroke = (_b2 = el.style) == null ? void 0 : _b2.stroke;
      const fillAttr = el.getAttribute("fill");
      const strokeAttr = el.getAttribute("stroke");
      const hasFill = typeof styleFill === "string" && styleFill && styleFill.toLowerCase() !== "none" || typeof fillAttr === "string" && fillAttr && fillAttr.toLowerCase() !== "none";
      const hasStroke = typeof styleStroke === "string" && styleStroke && styleStroke.toLowerCase() !== "none" || typeof strokeAttr === "string" && strokeAttr && strokeAttr.toLowerCase() !== "none";
      if (hasFill) {
        el.style.fill = c;
        el.setAttribute("fill", c);
        touched = true;
      }
      if (hasStroke) {
        el.style.stroke = c;
        el.setAttribute("stroke", c);
        touched = true;
      }
    });
    if (!touched) {
      inner.setAttribute("fill", c);
    }
    return new XMLSerializer().serializeToString(root);
  } catch (e) {
    return svg;
  }
}
var ZoomMapSettingTab = class extends import_obsidian29.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.svgFileCache = /* @__PURE__ */ new Map();
    this.plugin = plugin;
  }
  async addFontAwesomeIcon(file) {
    var _a2;
    try {
      const svg = await this.app.vault.read(file);
      const defaultColor = "#b0b0b0";
      const tinted = tintSvgMarkup2(svg, defaultColor);
      const dataUrl = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(tinted);
      const icons = (_a2 = this.plugin.settings.icons) != null ? _a2 : [];
      let baseKey = file.name.replace(/\.svg$/i, "");
      baseKey = baseKey.replace(/\s+/g, "-");
      let key = baseKey;
      let idx = 1;
      while (icons.some((i2) => i2.key === key)) {
        key = `${baseKey}-${idx++}`;
      }
      icons.unshift({
        key,
        pathOrDataUrl: dataUrl,
        size: 24,
        anchorX: 12,
        anchorY: 12,
        defaultLink: "",
        inCollections: true
      });
      this.plugin.settings.icons = icons;
      await this.plugin.saveSettings();
      this.display();
    } catch (e) {
      console.error("Zoom Map: failed to add Font Awesome icon", e);
      new import_obsidian29.Notice("Failed to add font awesome icon.", 2500);
    }
  }
  async recolorIconSvg(icon, color) {
    var _a2;
    const c = color.trim();
    if (!c) return;
    let svg = null;
    const src = (_a2 = icon.pathOrDataUrl) != null ? _a2 : "";
    if (typeof src === "string" && src.startsWith("data:image/svg+xml")) {
      const idx = src.indexOf(",");
      if (idx >= 0) {
        try {
          const payload = src.slice(idx + 1);
          svg = decodeURIComponent(payload);
        } catch (e) {
          svg = null;
        }
      }
    } else if (typeof src === "string" && src.toLowerCase().endsWith(".svg")) {
      const cached = this.svgFileCache.get(src);
      if (cached) {
        svg = cached;
      } else {
        const f = this.app.vault.getAbstractFileByPath(src);
        if (f instanceof import_obsidian29.TFile) {
          try {
            const text = await this.app.vault.read(f);
            this.svgFileCache.set(src, text);
            svg = text;
          } catch (e) {
            svg = null;
          }
        }
      }
    }
    if (!svg) return;
    const tinted = tintSvgMarkup2(svg, c);
    const dataUrl = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(tinted);
    icon.pathOrDataUrl = dataUrl;
    await this.plugin.saveSettings();
  }
  getSvgColorFromDataUrl(dataUrl) {
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
    } catch (e) {
      return null;
    }
  }
  display() {
    var _a2;
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass("zoommap-settings");
    containerEl.classList.toggle(
      "zoommap-settings--imgpreview",
      !!this.plugin.settings.showImageIconPreviewInSettings
    );
    new import_obsidian29.Setting(containerEl).setName("Storage").setHeading();
    new import_obsidian29.Setting(containerEl).setName("Storage location by default").setDesc("Store marker data in JSON beside image, or inline in the note.").addDropdown((d) => {
      var _a3;
      d.addOption("json", "JSON file (beside image)");
      d.addOption("note", "Inside the note (hidden comment)");
      d.setValue((_a3 = this.plugin.settings.storageDefault) != null ? _a3 : "json");
      d.onChange((v) => {
        this.plugin.settings.storageDefault = v === "note" ? "note" : "json";
        void this.plugin.saveSettings();
      });
    });
    new import_obsidian29.Setting(containerEl).setName("Layout").setHeading();
    new import_obsidian29.Setting(containerEl).setName("Default width when wrapped").setDesc("Initial width if wrap: true and no width is set in the code block.").addText((t) => {
      var _a3;
      const ext = this.plugin.settings;
      t.setPlaceholder("50%");
      t.setValue((_a3 = ext.defaultWidthWrapped) != null ? _a3 : "50%");
      t.onChange((v) => {
        ext.defaultWidthWrapped = (v || "50%").trim();
        void this.plugin.saveSettings();
      });
    });
    new import_obsidian29.Setting(containerEl).setName("Interaction").setHeading();
    new import_obsidian29.Setting(containerEl).setName("Mouse wheel zoom factor").setDesc("Multiplier per step. 1.1 = 10% per tick.").addText(
      (t) => t.setPlaceholder("1.1").setValue(String(this.plugin.settings.wheelZoomFactor)).onChange((v) => {
        const n = Number(v);
        if (!Number.isNaN(n) && n > 1.001 && n < 2.5) {
          this.plugin.settings.wheelZoomFactor = n;
          void this.plugin.saveSettings();
        }
      })
    );
    new import_obsidian29.Setting(containerEl).setName("Panning mouse button").setDesc("Which mouse button pans the map?").addDropdown((d) => {
      var _a3;
      d.addOption("left", "Left");
      d.addOption("middle", "Middle");
      d.addOption("right", "Right");
      d.setValue((_a3 = this.plugin.settings.panMouseButton) != null ? _a3 : "left");
      d.onChange((v) => {
        const next = v === "left" || v === "middle" || v === "right" ? v : "left";
        this.plugin.settings.panMouseButton = next;
        void this.plugin.saveSettings();
      });
    });
    new import_obsidian29.Setting(containerEl).setName("Hover popover size").setDesc("Max width and height in pixels.").addToggle(
      (tg) => tg.setValue(!!this.plugin.settings.applyHoverPopoverSizeGlobally).onChange((v) => {
        this.plugin.settings.applyHoverPopoverSizeGlobally = v;
        void this.plugin.saveSettings();
      })
    ).addText(
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
    new import_obsidian29.Setting(containerEl).setName("Force popovers without ctrl").setDesc("Opens preview popovers on simple hover.").addToggle(
      (t) => t.setValue(!!this.plugin.settings.forcePopoverWithoutModKey).onChange((v) => {
        this.plugin.settings.forcePopoverWithoutModKey = v;
        void this.plugin.saveSettings();
      })
    );
    new import_obsidian29.Setting(containerEl).setName("Open editor when placing pin from menu").setDesc("When enabled, placing a pin from the pins menu opens the marker editor.").addToggle(
      (t) => t.setValue(!!this.plugin.settings.pinPlaceOpensEditor).onChange((v) => {
        this.plugin.settings.pinPlaceOpensEditor = v;
        void this.plugin.saveSettings();
      })
    );
    new import_obsidian29.Setting(containerEl).setName("Preferences").setDesc("Global defaults for marker creation and behavior.").addButton(
      (b) => b.setButtonText("Open\u2026").onClick(() => {
        new PreferencesModal(this.app, this.plugin).open();
      })
    );
    new import_obsidian29.Setting(containerEl).setName("Ruler").setHeading();
    const applyStyleToAll = () => {
      var _a3, _b2;
      const color = ((_a3 = this.plugin.settings.measureLineColor) != null ? _a3 : "var(--text-accent)").trim();
      const widthPx = Math.max(1, (_b2 = this.plugin.settings.measureLineWidth) != null ? _b2 : 2);
      const uiDoc = this.plugin.app.workspace.containerEl.ownerDocument;
      const uiWin = uiDoc.defaultView;
      if (!uiWin) return;
      uiDoc.querySelectorAll(".zm-root").forEach((el) => {
        if (isCrossWindowHTMLElement(el, uiWin)) {
          setCssProps2(el, {
            "--zm-measure-color": color,
            "--zm-measure-width": `${widthPx}px`
          });
        }
      });
    };
    const colorRow = new import_obsidian29.Setting(containerEl).setName("Line color").setDesc("CSS color, e.g. #ff0055.");
    colorRow.addText(
      (t) => {
        var _a3;
        return t.setPlaceholder("Default").setValue((_a3 = this.plugin.settings.measureLineColor) != null ? _a3 : "var(--text-accent)").onChange((v) => {
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
      if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) picker.value = val;
      else picker.value = "#ff0000";
    };
    setPickerFromValue((_a2 = this.plugin.settings.measureLineColor) != null ? _a2 : "");
    picker.oninput = () => {
      this.plugin.settings.measureLineColor = picker.value;
      void this.plugin.saveSettings();
      applyStyleToAll();
    };
    new import_obsidian29.Setting(containerEl).setName("Line width").setDesc("Stroke width in pixels.").addText(
      (t) => {
        var _a3;
        return t.setPlaceholder("2").setValue(String((_a3 = this.plugin.settings.measureLineWidth) != null ? _a3 : 2)).onChange((v) => {
          const n = Number(v);
          if (Number.isFinite(n) && n > 0 && n <= 20) {
            this.plugin.settings.measureLineWidth = n;
            void this.plugin.saveSettings();
            applyStyleToAll();
          }
        });
      }
    );
    new import_obsidian29.Setting(containerEl).setName("Travel rules").setHeading();
    new import_obsidian29.Setting(containerEl).setName("Manage travel rules packs").setDesc("Custom units + distance\u2192time presets are managed in packs (import/export supported).").addButton(
      (b) => b.setButtonText("Open\u2026").onClick(() => {
        new TravelRulesManagerModal(this.app, this.plugin, () => {
          this.display();
        }).open();
      })
    );
    new import_obsidian29.Setting(containerEl).setName("Collections (base-bound)").setHeading();
    const collectionsWrap = containerEl.createDiv();
    const renderCollections = () => {
      var _a3;
      collectionsWrap.empty();
      const hint = collectionsWrap.createEl("div", {
        text: "Collections bundle pins, favorites and stickers for specific base images. Create a 'global' collection without bindings for items that should be available everywhere."
      });
      hint.addClass("zoommap-collections-hint");
      const list = collectionsWrap.createDiv();
      const cols = (_a3 = this.plugin.settings.baseCollections) != null ? _a3 : [];
      if (cols.length === 0) {
        list.createEl("div", { text: "No collections yet." });
      } else {
        cols.forEach((c) => {
          var _a4, _b2, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o;
          const row = list.createDiv({ cls: "zoommap-collections-row" });
          const left = row.createDiv();
          const name = left.createEl("div", { text: c.name || "(unnamed collection)" });
          name.addClass("zoommap-collections-name");
          const meta = left.createEl("div", {
            text: `${(_c = (_b2 = (_a4 = c.bindings) == null ? void 0 : _a4.basePaths) == null ? void 0 : _b2.length) != null ? _c : 0} bases \u2022 ${(_f = (_e = (_d = c.include) == null ? void 0 : _d.pinKeys) == null ? void 0 : _e.length) != null ? _f : 0} pins \u2022 ${(_i = (_h = (_g = c.include) == null ? void 0 : _g.favorites) == null ? void 0 : _h.length) != null ? _i : 0} favorites \u2022 ${(_l = (_k = (_j = c.include) == null ? void 0 : _j.stickers) == null ? void 0 : _k.length) != null ? _l : 0} stickers \u2022 ${(_o = (_n = (_m = c.include) == null ? void 0 : _m.swapPins) == null ? void 0 : _n.length) != null ? _o : 0} swap pins`
          });
          meta.addClass("zoommap-collections-meta");
          const edit = row.createEl("button", { text: "Edit" });
          edit.onclick = () => {
            new CollectionEditorModal(this.app, this.plugin, c, ({ updated, deleted }) => {
              var _a5;
              if (deleted) {
                const arr = (_a5 = this.plugin.settings.baseCollections) != null ? _a5 : [];
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
            var _a5;
            const arr = (_a5 = this.plugin.settings.baseCollections) != null ? _a5 : [];
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
        const fresh = {
          id: `col-${Math.random().toString(36).slice(2, 8)}`,
          name: "New Collection",
          bindings: { basePaths: [] },
          include: { pinKeys: [], favorites: [], stickers: [], swapPins: [], pingPins: [] }
        };
        new CollectionEditorModal(this.app, this.plugin, fresh, ({ updated, deleted }) => {
          var _a4;
          if (deleted) return;
          if (updated) {
            this.plugin.settings.baseCollections = (_a4 = this.plugin.settings.baseCollections) != null ? _a4 : [];
            this.plugin.settings.baseCollections.push(fresh);
            void this.plugin.saveSettings().then(() => {
              renderCollections();
            });
          }
        }).open();
      };
    };
    renderCollections();
    new import_obsidian29.Setting(containerEl).setName("Marker icons (library)").setHeading();
    const libRow = new import_obsidian29.Setting(containerEl).setName("Library file (icons + collections)").setDesc("Save/load your icons and collections to/from a JSON file.");
    libRow.addText((t) => {
      var _a3;
      const ext = this.plugin.settings;
      t.setPlaceholder("ZoomMap/library.json");
      t.setValue((_a3 = ext.libraryFilePath) != null ? _a3 : "ZoomMap/library.json");
      t.onChange((v) => {
        this.plugin.settings.libraryFilePath = v.trim() || "ZoomMap/library.json";
        void this.plugin.saveSettings();
      });
    });
    libRow.addButton(
      (b) => b.setButtonText("Pick\u2026").onClick(() => {
        new JsonFileSuggestModal(this.app, (file) => {
          this.plugin.settings.libraryFilePath = file.path;
          void this.plugin.saveSettings().then(() => {
            this.display();
          });
        }).open();
      })
    );
    libRow.addButton(
      (b) => b.setButtonText("Save now").onClick(() => {
        var _a3, _b2;
        const ext = this.plugin.settings;
        const p = (_b2 = (_a3 = ext.libraryFilePath) == null ? void 0 : _a3.trim()) != null ? _b2 : "ZoomMap/library.json";
        void this.plugin.saveLibraryToPath(p);
      })
    );
    libRow.addButton(
      (b) => b.setButtonText("Load\u2026").onClick(() => {
        new JsonFileSuggestModal(this.app, (file) => {
          void this.plugin.loadLibraryFromFile(file).then(() => {
            this.display();
          });
        }).open();
      })
    );
    new import_obsidian29.Setting(containerEl).setName("SVG icon sources").setHeading();
    const svgFolderRow = new import_obsidian29.Setting(containerEl).setName("SVG icon folder in vault").setDesc("Folder that contains SVG packs.");
    svgFolderRow.addText((t) => {
      var _a3;
      const ext = this.plugin.settings;
      t.setPlaceholder("e.g. ZoomMap/SVGs");
      t.setValue((_a3 = ext.faFolderPath) != null ? _a3 : "ZoomMap/SVGs");
      t.onChange((v) => {
        ext.faFolderPath = (v || "ZoomMap/SVGs").trim();
        void this.plugin.saveSettings();
      });
    });
    svgFolderRow.addButton(
      (b) => b.setButtonText("Ensure folder").onClick(() => {
        var _a3;
        const ext = this.plugin.settings;
        const folder = (0, import_obsidian29.normalizePath)(((_a3 = ext.faFolderPath) == null ? void 0 : _a3.trim()) || "ZoomMap/SVGs");
        if (!this.app.vault.getAbstractFileByPath(folder)) {
          void this.app.vault.createFolder(folder).then(() => {
            new import_obsidian29.Notice(`Created folder: ${folder}`, 2e3);
          });
        } else {
          new import_obsidian29.Notice("Folder already exists.", 1500);
        }
      })
    );
    svgFolderRow.addButton(
      (b) => b.setButtonText("Rescan icons").onClick(() => {
        this.plugin.rescanSvgFolder();
      })
    );
    const svgDownloadRow = new import_obsidian29.Setting(containerEl).setName("Download icon packs").setDesc("Download common SVG packs into the configured folder.");
    svgDownloadRow.addButton(
      (b) => b.setButtonText("Download font awesome free").onClick(() => {
        void this.plugin.downloadFontAwesomeZip();
      })
    );
    svgDownloadRow.addButton(
      (b) => b.setButtonText("Download rpg awesome").onClick(() => {
        void this.plugin.downloadRpgAwesomeZip();
      })
    );
    const buildLinkSuggestions = () => {
      var _a3, _b2, _c, _d;
      const files = this.app.vault.getFiles().filter((f) => {
        var _a4;
        return ((_a4 = f.extension) == null ? void 0 : _a4.toLowerCase()) === "md";
      });
      const suggestions = [];
      const active = this.app.workspace.getActiveFile();
      const fromPath = (_c = (_b2 = active == null ? void 0 : active.path) != null ? _b2 : (_a3 = files[0]) == null ? void 0 : _a3.path) != null ? _c : "";
      for (const file of files) {
        const baseLink = this.app.metadataCache.fileToLinktext(file, fromPath);
        suggestions.push({ label: baseLink, value: baseLink });
        const cache = this.app.metadataCache.getCache(file.path);
        const headings = (_d = cache == null ? void 0 : cache.headings) != null ? _d : [];
        for (const h of headings) {
          const headingName = h.heading;
          const full = `${baseLink}#${headingName}`;
          suggestions.push({ label: `${baseLink} \u203A ${headingName}`, value: full });
        }
      }
      return suggestions;
    };
    const allLinkSuggestions = buildLinkSuggestions();
    const attachLinkAutocomplete = (input, getValue, setValue) => {
      const wrapper = input.parentElement;
      if (!wrapper) return;
      wrapper.classList.add("zoommap-link-input-wrapper");
      const listEl = wrapper.createDiv({ cls: "zoommap-link-suggestions is-hidden" });
      const hide = () => listEl.classList.add("is-hidden");
      const show = () => listEl.classList.remove("is-hidden");
      const updateList = (query) => {
        const q = query.trim().toLowerCase();
        listEl.empty();
        if (!q) {
          hide();
          return;
        }
        const maxItems = 20;
        const matches = allLinkSuggestions.filter((s) => s.value.toLowerCase().includes(q) || s.label.toLowerCase().includes(q)).slice(0, maxItems);
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
    const isSvgIcon = (icon) => {
      var _a3;
      const src = (_a3 = icon.pathOrDataUrl) != null ? _a3 : "";
      if (typeof src !== "string") return false;
      const lower = src.toLowerCase();
      return lower.startsWith("data:image/svg+xml") || lower.endsWith(".svg");
    };
    new import_obsidian29.Setting(containerEl).setName("SVG icons").setHeading();
    const addSvgSetting = new import_obsidian29.Setting(containerEl).setName("Add SVG icon or sort the list").setDesc("Create a pin icon from an SVG file in the configured folder, or sort the SVG icon list alphabetically.");
    const infoIcon = addSvgSetting.controlEl.createDiv({ cls: "zoommap-info-icon" });
    (0, import_obsidian29.setIcon)(infoIcon, "info");
    infoIcon.setAttr(
      "title",
      "Rendering many SVG files in the picker can cause noticeable delays while all previews are generated. Once the icons are cached, searching and adding should feel much faster."
    );
    addSvgSetting.addButton(
      (b) => b.setButtonText("Sort a\u2192z").onClick(() => {
        var _a3;
        const icons = (_a3 = this.plugin.settings.icons) != null ? _a3 : [];
        if (icons.length === 0) return;
        const svgIcons = icons.filter((i2) => isSvgIcon(i2));
        if (svgIcons.length <= 1) {
          new import_obsidian29.Notice("No SVG icons to sort.", 2e3);
          return;
        }
        const keyOf = (i2) => {
          var _a4;
          return String((_a4 = i2.key) != null ? _a4 : "").trim();
        };
        const sorted = [...svgIcons].sort(
          (a, b3) => keyOf(a).localeCompare(keyOf(b3), void 0, { sensitivity: "base", numeric: true })
        );
        let j = 0;
        const next = icons.map((ico) => isSvgIcon(ico) ? sorted[j++] : ico);
        this.plugin.settings.icons = next;
        void this.plugin.saveSettings().then(() => {
          renderIcons == null ? void 0 : renderIcons();
          new import_obsidian29.Notice(`Sorted ${sorted.length} SVG icons.`, 2e3);
        });
      })
    );
    addSvgSetting.addButton(
      (b) => b.setButtonText("Add SVG icon").onClick(() => {
        var _a3;
        const ext = this.plugin.settings;
        const folder = ((_a3 = ext.faFolderPath) == null ? void 0 : _a3.trim()) || "ZoomMap/SVGs";
        new FaIconPickerModal(this.app, folder, (file) => {
          void this.addFontAwesomeIcon(file);
        }).open();
      })
    );
    const svgIconsHead = containerEl.createDiv({ cls: "zm-icons-grid-head zm-grid" });
    svgIconsHead.createSpan();
    svgIconsHead.createSpan({ text: "Name" });
    svgIconsHead.createSpan({ text: "Preview / color / link" });
    svgIconsHead.createSpan({ text: "Size" });
    const headSvgAX = svgIconsHead.createSpan({ cls: "zm-icohead" });
    const svgAxIco = headSvgAX.createSpan();
    (0, import_obsidian29.setIcon)(svgAxIco, "anchor");
    headSvgAX.appendText(" X");
    const headSvgAY = svgIconsHead.createSpan({ cls: "zm-icohead" });
    const svgAyIco = headSvgAY.createSpan();
    (0, import_obsidian29.setIcon)(svgAyIco, "anchor");
    headSvgAY.appendText(" Y");
    svgIconsHead.createSpan({ text: "Angle" });
    const headSvgTrash = svgIconsHead.createSpan();
    (0, import_obsidian29.setIcon)(headSvgTrash, "trash");
    const svgIconsGrid = containerEl.createDiv({ cls: "zm-icons-grid zm-grid" });
    new import_obsidian29.Setting(containerEl).setName("Image icons").setHeading();
    new import_obsidian29.Setting(containerEl).setName("Add new icon or sort the list").setDesc("Create a new image-based icon entry, or sort the image icon list alphabetically.").addButton(
      (b) => b.setButtonText("Sort a\u2192z").onClick(() => {
        var _a3;
        const icons = (_a3 = this.plugin.settings.icons) != null ? _a3 : [];
        if (icons.length === 0) return;
        const imgIcons = icons.filter((i2) => !isSvgIcon(i2));
        if (imgIcons.length <= 1) {
          new import_obsidian29.Notice("No image icons to sort.", 2e3);
          return;
        }
        const keyOf = (i2) => {
          var _a4;
          return String((_a4 = i2.key) != null ? _a4 : "").trim();
        };
        const sorted = [...imgIcons].sort(
          (a, b3) => keyOf(a).localeCompare(keyOf(b3), void 0, { sensitivity: "base", numeric: true })
        );
        let j = 0;
        const next = icons.map((ico) => isSvgIcon(ico) ? ico : sorted[j++]);
        this.plugin.settings.icons = next;
        void this.plugin.saveSettings().then(() => {
          renderIcons == null ? void 0 : renderIcons();
          new import_obsidian29.Notice(`Sorted ${sorted.length} image icons.`, 2e3);
        });
      })
    ).addButton(
      (b) => b.setButtonText("Add").onClick(() => {
        const idx = this.plugin.settings.icons.length + 1;
        this.plugin.settings.icons.unshift({
          key: `pin-${idx}`,
          pathOrDataUrl: "",
          size: 24,
          anchorX: 12,
          anchorY: 12,
          inCollections: true
        });
        void this.plugin.saveSettings();
        renderIcons == null ? void 0 : renderIcons();
      })
    );
    const imgIconsHead = containerEl.createDiv({ cls: "zm-icons-grid-head zm-grid zm-icons-grid-head--img" });
    imgIconsHead.createSpan();
    imgIconsHead.createSpan({ text: "Name" });
    if (this.plugin.settings.showImageIconPreviewInSettings) {
      imgIconsHead.createSpan();
    }
    imgIconsHead.createSpan({ text: "Path / data:URL + default link" });
    imgIconsHead.createSpan({ text: "Size" });
    const headImgAX = imgIconsHead.createSpan({ cls: "zm-icohead" });
    const axIco = headImgAX.createSpan();
    (0, import_obsidian29.setIcon)(axIco, "anchor");
    headImgAX.appendText(" X");
    const headImgAY = imgIconsHead.createSpan({ cls: "zm-icohead" });
    const ayIco = headImgAY.createSpan();
    (0, import_obsidian29.setIcon)(ayIco, "anchor");
    headImgAY.appendText(" Y");
    imgIconsHead.createSpan({ text: "Angle" });
    const headImgTrash = imgIconsHead.createSpan();
    (0, import_obsidian29.setIcon)(headImgTrash, "trash");
    const imgIconsGrid = containerEl.createDiv({ cls: "zm-icons-grid zm-grid zm-icons-grid--img" });
    let renderIcons;
    renderIcons = () => {
      var _a3, _b2, _c, _d, _e, _f, _g;
      svgIconsGrid.empty();
      imgIconsGrid.empty();
      for (const icon of this.plugin.settings.icons) {
        if (isSvgIcon(icon)) {
          const row = svgIconsGrid.createDiv({ cls: "zm-row" });
          const enabled = row.createEl("input", { type: "checkbox" });
          enabled.addClass("zoommap-settings__icon-collections-toggle");
          enabled.checked = icon.inCollections !== false;
          enabled.onchange = () => {
            icon.inCollections = enabled.checked;
            void this.plugin.saveSettings();
          };
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
          let src = (_a3 = icon.pathOrDataUrl) != null ? _a3 : "";
          if (typeof src === "string" && !src.startsWith("data:") && src) {
            const f = this.app.vault.getAbstractFileByPath(src);
            if (f instanceof import_obsidian29.TFile) {
              src = this.app.vault.getResourcePath(f);
            }
          }
          img.src = typeof src === "string" ? src : "";
          const applyRotationPreview = () => {
            var _a4;
            const deg = (_a4 = icon.rotationDeg) != null ? _a4 : 0;
            setCssProps2(img, {
              transform: deg ? `rotate(${deg}deg)` : null
            });
          };
          applyRotationPreview();
          const rawSrc = (_b2 = icon.pathOrDataUrl) != null ? _b2 : "";
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
          const applyColor = (val) => {
            const c = val.trim();
            if (!c) return;
            void this.recolorIconSvg(icon, c).then(() => {
              var _a4;
              const updated = (_a4 = icon.pathOrDataUrl) != null ? _a4 : "";
              let out = updated;
              if (typeof out === "string" && !out.startsWith("data:") && out) {
                const f = this.app.vault.getAbstractFileByPath(out);
                if (f instanceof import_obsidian29.TFile) out = this.app.vault.getResourcePath(f);
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
          linkInput.value = (_c = icon.defaultLink) != null ? _c : "";
          linkInput.oninput = () => {
            icon.defaultLink = linkInput.value.trim() || void 0;
            void this.plugin.saveSettings();
          };
          attachLinkAutocomplete(
            linkInput,
            () => {
              var _a4;
              return (_a4 = icon.defaultLink) != null ? _a4 : "";
            },
            (val) => {
              icon.defaultLink = val;
              linkInput.value = val;
              void this.plugin.saveSettings();
            }
          );
          const outlineBtn = previewCell.createEl("button", {
            attr: { title: "SVG outline\u2026" }
          });
          outlineBtn.classList.add("zm-icon-btn");
          (0, import_obsidian29.setIcon)(outlineBtn, "gear");
          outlineBtn.onclick = () => {
            new IconOutlineModal(this.app, this.plugin, icon, (newDataUrl) => {
              img.src = newDataUrl;
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
          const angle = row.createEl("input", { type: "number" });
          angle.classList.add("zm-num");
          angle.value = String((_d = icon.rotationDeg) != null ? _d : 0);
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
          (0, import_obsidian29.setIcon)(del, "trash");
          del.onclick = () => {
            this.plugin.settings.icons = this.plugin.settings.icons.filter((i2) => i2 !== icon);
            void this.plugin.saveSettings();
            renderIcons();
          };
        } else {
          const row = imgIconsGrid.createDiv({ cls: "zm-row" });
          const enabled = row.createEl("input", { type: "checkbox" });
          enabled.addClass("zoommap-settings__icon-collections-toggle");
          enabled.checked = icon.inCollections !== false;
          enabled.onchange = () => {
            icon.inCollections = enabled.checked;
            void this.plugin.saveSettings();
          };
          const name = row.createEl("input", { type: "text" });
          name.classList.add("zm-name");
          name.value = icon.key;
          name.oninput = () => {
            icon.key = name.value.trim();
            void this.plugin.saveSettings();
          };
          const showPreview = !!this.plugin.settings.showImageIconPreviewInSettings;
          let previewImg = null;
          const refreshPreview = () => {
            var _a4;
            if (!previewImg) return;
            let src = ((_a4 = icon.pathOrDataUrl) != null ? _a4 : "").trim();
            if (!src) {
              previewImg.src = "";
              return;
            }
            if (src.startsWith("data:")) {
              previewImg.src = src;
              return;
            }
            const f = this.app.vault.getAbstractFileByPath(src);
            if (f instanceof import_obsidian29.TFile) {
              previewImg.src = this.app.vault.getResourcePath(f);
              return;
            }
            previewImg.src = src;
          };
          if (showPreview) {
            previewImg = row.createEl("img", { cls: "zoommap-settings__icon-preview zoommap-settings__icon-preview--img" });
            refreshPreview();
          }
          const pathWrap = row.createDiv({ cls: "zm-path-wrap" });
          const path = pathWrap.createEl("input", { type: "text" });
          path.addClass("zoommap-settings__icon-path-input");
          path.value = (_e = icon.pathOrDataUrl) != null ? _e : "";
          path.oninput = () => {
            icon.pathOrDataUrl = path.value.trim();
            void this.plugin.saveSettings();
            refreshPreview();
          };
          const pick = pathWrap.createEl("button", { attr: { title: "Choose file\u2026" } });
          pick.classList.add("zm-icon-btn");
          (0, import_obsidian29.setIcon)(pick, "folder-open");
          pick.onclick = () => {
            new ImageFileSuggestModal(this.app, (file) => {
              icon.pathOrDataUrl = file.path;
              void this.plugin.saveSettings();
              path.value = file.path;
              refreshPreview();
              renderIcons();
            }).open();
          };
          const linkInput = pathWrap.createEl("input", { type: "text" });
          linkInput.addClass("zoommap-settings__link-input--medium");
          linkInput.placeholder = "Default link (optional)";
          linkInput.value = (_f = icon.defaultLink) != null ? _f : "";
          linkInput.oninput = () => {
            icon.defaultLink = linkInput.value.trim() || void 0;
            void this.plugin.saveSettings();
          };
          attachLinkAutocomplete(
            linkInput,
            () => {
              var _a4;
              return (_a4 = icon.defaultLink) != null ? _a4 : "";
            },
            (val) => {
              icon.defaultLink = val;
              linkInput.value = val;
              void this.plugin.saveSettings();
            }
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
          angle.value = String((_g = icon.rotationDeg) != null ? _g : 0);
          angle.oninput = () => {
            const n = Number(angle.value);
            if (!Number.isNaN(n)) {
              icon.rotationDeg = n || 0;
              void this.plugin.saveSettings();
            }
          };
          const del = row.createEl("button", { attr: { title: "Delete" } });
          del.classList.add("zm-icon-btn");
          (0, import_obsidian29.setIcon)(del, "trash");
          del.onclick = () => {
            this.plugin.settings.icons = this.plugin.settings.icons.filter((i2) => i2 !== icon);
            void this.plugin.saveSettings();
            renderIcons();
          };
        }
      }
    };
    renderIcons();
  }
};
