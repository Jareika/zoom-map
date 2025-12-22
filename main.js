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
var import_obsidian18 = require("obsidian");

// src/map.ts
var import_obsidian13 = require("obsidian");

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
      image: initialImagePath != null ? initialImagePath : "",
      size,
      layers: baseLayers,
      markers: [],
      bases: initialImagePath ? [initialImagePath] : [],
      overlays: [],
      activeBase: initialImagePath != null ? initialImagePath : "",
      measurement: {
        displayUnit: "auto-metric",
        metersPerPixel: void 0,
        scales: {},
        customUnitId: void 0
      },
      frame: void 0,
      pinSizeOverrides: {},
      panClamp: true,
      drawLayers: [],
      drawings: [],
      textLayers: []
    };
    await this.create(JSON.stringify(data, null, 2));
    new import_obsidian.Notice(`Created marker file: ${this.markersFilePath}`, 2500);
  }
  async load() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
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
      var _a2;
      return {
        id: l.id,
        name: (_a2 = l.name) != null ? _a2 : "Layer",
        visible: typeof l.visible === "boolean" ? l.visible : true,
        locked: !!l.locked,
        boundBase: typeof l.boundBase === "string" && l.boundBase.trim() ? l.boundBase : void 0
      };
    });
    (_a = parsed.markers) != null ? _a : parsed.markers = [];
    (_b = parsed.bases) != null ? _b : parsed.bases = parsed.image ? [parsed.image] : [];
    if (!parsed.activeBase) {
      const firstBase = parsed.bases[0];
      const firstPath = typeof firstBase === "string" ? firstBase : isBaseImage(firstBase) ? firstBase.path : "";
      parsed.activeBase = parsed.image || firstPath || "";
    }
    (_c = parsed.overlays) != null ? _c : parsed.overlays = [];
    (_d = parsed.measurement) != null ? _d : parsed.measurement = {
      displayUnit: "auto-metric",
      metersPerPixel: void 0,
      scales: {}
    };
    (_f = (_e = parsed.measurement).scales) != null ? _f : _e.scales = {};
    (_h = (_g = parsed.measurement).displayUnit) != null ? _h : _g.displayUnit = "auto-metric";
    (_i = parsed.pinSizeOverrides) != null ? _i : parsed.pinSizeOverrides = {};
    if (typeof parsed.panClamp !== "boolean") {
      parsed.panClamp = true;
    }
    (_j = parsed.drawLayers) != null ? _j : parsed.drawLayers = [];
    (_k = parsed.drawings) != null ? _k : parsed.drawings = [];
    (_l = parsed.textLayers) != null ? _l : parsed.textLayers = [];
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
  return !!x && typeof x === "object" && "path" in x && typeof x.path === "string";
}

// src/markerEditor.ts
var import_obsidian2 = require("obsidian");
function tintSvgMarkup(svg, color) {
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
var MarkerEditorModal = class extends import_obsidian2.Modal {
  constructor(app, plugin, data, marker, onResult) {
    var _a;
    super(app);
    this.suggestionsEl = null;
    this.allSuggestions = [];
    this.filteredSuggestions = [];
    this.selectedSuggestionIndex = -1;
    this.plugin = plugin;
    this.data = data;
    this.marker = { type: (_a = marker.type) != null ? _a : "pin", ...marker };
    this.onResult = onResult;
  }
  buildLinkSuggestions() {
    var _a, _b, _c, _d;
    const files = this.app.vault.getFiles().filter((f) => {
      var _a2;
      return ((_a2 = f.extension) == null ? void 0 : _a2.toLowerCase()) === "md";
    });
    const suggestions = [];
    const active = this.app.workspace.getActiveFile();
    const fromPath = (_c = (_b = active == null ? void 0 : active.path) != null ? _b : (_a = files[0]) == null ? void 0 : _a.path) != null ? _c : "";
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
    matches.forEach((s, i) => {
      const row = this.suggestionsEl.createDiv({
        cls: "zoommap-link-suggestion-item"
      });
      row.setText(s.label);
      if (i === 0) {
        row.classList.add("is-selected");
        this.selectedSuggestionIndex = 0;
      }
      row.addEventListener("mousedown", (ev) => {
        ev.preventDefault();
        this.applyLinkSuggestion(i);
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
    rows.forEach((row, i) => {
      if (i === idx) row.classList.add("is-selected");
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
    let max = this.marker.maxZoom;
    if (typeof min !== "number" || !Number.isFinite(min) || min <= 0) {
      min = void 0;
    }
    if (typeof max !== "number" || !Number.isFinite(max) || max <= 0) {
      max = void 0;
    }
    if (min === void 0 && max === void 0) {
      delete this.marker.minZoom;
      delete this.marker.maxZoom;
      return;
    }
    if (min !== void 0 && max !== void 0 && min > max) {
      const tmp = min;
      min = max;
      max = tmp;
    }
    if (min !== void 0) this.marker.minZoom = min;
    else delete this.marker.minZoom;
    if (max !== void 0) this.marker.maxZoom = max;
    else delete this.marker.maxZoom;
  }
  onOpen() {
    var _a, _b, _c;
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", {
      text: this.marker.type === "sticker" ? "Edit sticker" : "Edit marker"
    });
    if (this.marker.type !== "sticker") {
      const linkSetting = new import_obsidian2.Setting(contentEl).setName("Link").setDesc("Wiki link (without [[ ]]). Supports note and note#heading.");
      linkSetting.addText((t) => {
        var _a2;
        this.linkInput = t;
        t.setPlaceholder("Folder/note or note#heading").setValue((_a2 = this.marker.link) != null ? _a2 : "").onChange((v) => {
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
      new import_obsidian2.Setting(contentEl).setName("Tooltip always on").setDesc("Show the tooltip even if this marker has a link.").addToggle((tg) => {
        tg.setValue(!!this.marker.tooltipAlwaysOn).onChange((on) => {
          if (on) {
            this.marker.tooltipAlwaysOn = true;
          } else {
            delete this.marker.tooltipAlwaysOn;
          }
        });
      });
      new import_obsidian2.Setting(contentEl).setName("Tooltip").addTextArea((a) => {
        var _a2;
        a.setPlaceholder("Optional tooltip text");
        a.inputEl.rows = 3;
        a.setValue((_a2 = this.marker.tooltip) != null ? _a2 : "");
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
      new import_obsidian2.Setting(contentEl).setName("Icon").setDesc("To set up new icons go to settings.").addDropdown((d) => {
        var _a2;
        for (const icon of this.plugin.settings.icons) {
          d.addOption(icon.key, icon.key);
        }
        d.setValue((_a2 = this.marker.iconKey) != null ? _a2 : this.plugin.settings.defaultIconKey);
        d.onChange((v) => {
          this.marker.iconKey = v;
          updatePreview();
        });
      });
      const colorRow = new import_obsidian2.Setting(contentEl).setName("Icon color").setDesc("Overrides the icon color for this marker (SVG icons only).");
      let colorTextEl;
      const colorPickerEl = colorRow.controlEl.createEl("input", {
        attr: {
          type: "color",
          style: "margin-left:8px; vertical-align: middle;"
        }
      });
      colorRow.addText((t) => {
        var _a2;
        t.setPlaceholder("#d23c3c");
        t.setValue((_a2 = this.marker.iconColor) != null ? _a2 : "");
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
    const isExistingMarker = ((_a = this.data.markers) != null ? _a : []).some(
      (m) => m.id === this.marker.id
    );
    if (this.plugin.settings.preferActiveLayerInEditor && !isExistingMarker) {
      const active = (_c = (_b = this.data.layers.find((l) => l.visible && !l.locked)) != null ? _b : this.data.layers.find((l) => l.visible)) != null ? _c : this.data.layers[0];
      if (active) {
        this.marker.layer = active.id;
      }
    }
    new import_obsidian2.Setting(contentEl).setName("Layer").setDesc("Choose an existing layer or type a new name.").addDropdown((d) => {
      var _a2, _b2, _c2, _d, _e, _f;
      for (const l of this.data.layers) d.addOption(l.name, l.name);
      const current = (_f = (_e = (_c2 = (_a2 = this.data.layers.find((l) => l.id === this.marker.layer)) == null ? void 0 : _a2.name) != null ? _c2 : (_b2 = this.data.layers.find((l) => l.visible && !l.locked)) == null ? void 0 : _b2.name) != null ? _e : (_d = this.data.layers.find((l) => l.visible)) == null ? void 0 : _d.name) != null ? _f : this.data.layers[0].name;
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
        var _a2;
        t.setPlaceholder("64");
        t.setValue(String((_a2 = this.marker.stickerSize) != null ? _a2 : 64));
        t.onChange((v) => {
          const n = Number(v);
          if (Number.isFinite(n) && n > 0) {
            this.marker.stickerSize = Math.round(n);
            updatePreview();
          }
        });
      });
    }
    const preview = contentEl.createDiv({ cls: "zoommap-modal-preview" });
    preview.createSpan({ text: "Preview:" });
    const img = preview.createEl("img");
    const resolvePreview = () => {
      var _a2, _b2, _c2, _d;
      if (this.marker.type === "sticker") {
        let url2 = (_a2 = this.marker.stickerPath) != null ? _a2 : "";
        if (url2 && !url2.startsWith("data:")) {
          const file = this.app.vault.getAbstractFileByPath(url2);
          if (file instanceof import_obsidian2.TFile) {
            url2 = this.app.vault.getResourcePath(file);
          }
        }
        const size2 = Math.max(1, Math.round((_b2 = this.marker.stickerSize) != null ? _b2 : 64));
        return { url: url2, size: size2 };
      }
      const baseIcon = (_c2 = this.plugin.settings.icons.find(
        (i) => {
          var _a3;
          return i.key === ((_a3 = this.marker.iconKey) != null ? _a3 : this.plugin.settings.defaultIconKey);
        }
      )) != null ? _c2 : this.plugin.builtinIcon();
      let url = baseIcon.pathOrDataUrl;
      const size = baseIcon.size;
      const color = (_d = this.marker.iconColor) == null ? void 0 : _d.trim();
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
    if (this.options.initialUnit) {
      this.unit = this.options.initialUnit;
    }
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
      var _a;
      d.addOption("m", "Meters");
      d.addOption("km", "Kilometers");
      d.addOption("mi", "Miles");
      d.addOption("ft", "Feet");
      if (this.options.customMetersPerUnit && (this.options.customLabel || this.options.customAbbreviation)) {
        const base = (_a = this.options.customLabel) != null ? _a : "Custom unit";
        const abbr = this.options.customAbbreviation;
        const label = abbr ? `${base} (${abbr})` : base;
        d.addOption("custom", label);
      }
      d.setValue(this.unit);
      d.onChange((v) => {
        this.unit = v;
      });
    });
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
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
      case "custom": {
        const factor = this.options.customMetersPerUnit;
        return v * (factor && factor > 0 ? factor : 1);
      }
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
      image: initialImagePath != null ? initialImagePath : "",
      size,
      layers: baseLayers,
      markers: [],
      bases: initialImagePath ? [initialImagePath] : [],
      overlays: [],
      activeBase: initialImagePath != null ? initialImagePath : "",
      measurement: {
        displayUnit: "auto-metric",
        metersPerPixel: void 0,
        scales: {},
        customUnitId: void 0
      },
      frame: void 0,
      pinSizeOverrides: {},
      panClamp: true,
      drawLayers: [],
      drawings: [],
      textLayers: []
    };
    const payload = JSON.stringify(data, null, 2);
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
    const payload = JSON.stringify(data, null, 2);
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
      const a = JSON.stringify(cur, null, 2);
      const b = JSON.stringify(data, null, 2);
      return a !== b;
    } catch (e) {
      return true;
    }
  }
};

// src/drawingEditorModal.ts
var import_obsidian5 = require("obsidian");
var DrawingEditorModal = class extends import_obsidian5.Modal {
  constructor(app, drawing, onResult) {
    var _a, _b, _c;
    super(app);
    this.original = drawing;
    this.working = JSON.parse(JSON.stringify(drawing));
    this.onResult = onResult;
    (_b = (_a = this.working).style) != null ? _b : _a.style = {
      strokeColor: "#ff0000",
      strokeWidth: 2
    };
    const s = this.working.style;
    if (!s.strokeColor) s.strokeColor = "#ff0000";
    if (!Number.isFinite(s.strokeWidth) || s.strokeWidth <= 0) s.strokeWidth = 2;
    if (typeof s.strokeOpacity !== "number") s.strokeOpacity = 1;
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
  onOpen() {
    var _a, _b, _c, _d;
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Edit drawing" });
    const style = this.working.style;
    new import_obsidian5.Setting(contentEl).setName("Label").addText((t) => {
      var _a2;
      t.setPlaceholder("Label");
      t.setValue((_a2 = style.label) != null ? _a2 : "");
      t.inputEl.classList.add("zoommap-drawing-editor__label-input");
      t.onChange((v) => {
        style.label = v.trim() || void 0;
      });
    });
    const strokeHeading = contentEl.createDiv({
      cls: "zoommap-drawing-editor__section-heading"
    });
    strokeHeading.textContent = "Stroke";
    const strokePatternSetting = new import_obsidian5.Setting(contentEl).setName("Pattern");
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
    const strokeColorSetting = new import_obsidian5.Setting(contentEl).setName("Color");
    const strokeColorText = strokeColorSetting.controlEl.createEl("input", {
      type: "text"
    });
    strokeColorText.classList.add("zoommap-drawing-editor__color-text");
    strokeColorText.value = (_a = style.strokeColor) != null ? _a : "#ff0000";
    const strokeColorPicker = strokeColorSetting.controlEl.createEl("input", {
      type: "color"
    });
    strokeColorPicker.classList.add("zoommap-drawing-editor__color-picker");
    strokeColorPicker.value = this.normalizeHex((_b = style.strokeColor) != null ? _b : "#ff0000");
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
    new import_obsidian5.Setting(contentEl).setName("Width").addText((t) => {
      var _a2;
      t.inputEl.type = "number";
      t.inputEl.classList.add("zoommap-drawing-editor__num-input");
      t.setValue(String((_a2 = style.strokeWidth) != null ? _a2 : 2));
      t.onChange((v) => {
        const n = Number(v);
        if (Number.isFinite(n) && n > 0) {
          style.strokeWidth = n;
        }
      });
    });
    new import_obsidian5.Setting(contentEl).setName("Opacity").addText((t) => {
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
    const fillHeading = contentEl.createDiv({
      cls: "zoommap-drawing-editor__section-heading"
    });
    fillHeading.textContent = "Fill";
    const fillPatternSetting = new import_obsidian5.Setting(contentEl).setName("Pattern");
    fillPatternSetting.addDropdown((dd) => {
      var _a2;
      dd.addOption("none", "None");
      dd.addOption("solid", "Solid");
      dd.addOption("striped", "Striped");
      dd.addOption("cross", "Cross");
      dd.addOption("wavy", "Wavy");
      const current = (_a2 = style.fillPattern) != null ? _a2 : style.fillColor ? "solid" : "none";
      dd.setValue(current);
      dd.onChange((v) => {
        const kind = v;
        style.fillPattern = kind;
      });
    });
    const fillColorSetting = new import_obsidian5.Setting(contentEl).setName("Base color");
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
    new import_obsidian5.Setting(contentEl).setName("Base opacity").addText((t) => {
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
    new import_obsidian5.Setting(contentEl).setName("Spacing").addText((t) => {
      var _a2;
      t.inputEl.type = "number";
      t.inputEl.classList.add("zoommap-drawing-editor__num-input");
      t.setPlaceholder("8");
      t.setValue(String((_a2 = style.fillPatternSpacing) != null ? _a2 : 8));
      t.onChange((v) => {
        const n = Number(v);
        if (!Number.isFinite(n) || n <= 0) {
          style.fillPatternSpacing = void 0;
          return;
        }
        style.fillPatternSpacing = n;
      });
    });
    new import_obsidian5.Setting(contentEl).setName("Angle").addText((t) => {
      var _a2;
      t.inputEl.type = "number";
      t.inputEl.classList.add("zoommap-drawing-editor__num-input");
      t.setPlaceholder("45");
      t.setValue(String((_a2 = style.fillPatternAngle) != null ? _a2 : 45));
      t.onChange((v) => {
        const n = Number(v);
        if (!Number.isFinite(n)) {
          style.fillPatternAngle = void 0;
          return;
        }
        style.fillPatternAngle = n;
      });
    });
    new import_obsidian5.Setting(contentEl).setName("Line width").addText((t) => {
      var _a2;
      t.inputEl.type = "number";
      t.inputEl.classList.add("zoommap-drawing-editor__num-input");
      t.setPlaceholder("1");
      t.setValue(String((_a2 = style.fillPatternStrokeWidth) != null ? _a2 : 1));
      t.onChange((v) => {
        const n = Number(v);
        if (!Number.isFinite(n) || n <= 0) {
          style.fillPatternStrokeWidth = void 0;
          return;
        }
        style.fillPatternStrokeWidth = n;
      });
    });
    new import_obsidian5.Setting(contentEl).setName("Pattern opacity").addText((t) => {
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
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const saveBtn = footer.createEl("button", { text: "Save" });
    const deleteBtn = footer.createEl("button", { text: "Delete" });
    const cancelBtn = footer.createEl("button", { text: "Cancel" });
    saveBtn.onclick = () => {
      this.normalizeStyle(this.working.style);
      this.working.id = this.original.id;
      this.working.layerId = this.original.layerId;
      this.working.kind = this.original.kind;
      this.working.rect = this.original.rect;
      this.working.circle = this.original.circle;
      this.working.polygon = this.original.polygon;
      this.close();
      this.onResult({ action: "save", drawing: this.working });
    };
    deleteBtn.onclick = () => {
      this.close();
      this.onResult({ action: "delete" });
    };
    cancelBtn.onclick = () => {
      this.close();
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
  clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }
  toPercent(value, fallback) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return String(fallback);
    }
    return String(Math.round(value * 100));
  }
  normalizeStyle(style) {
    var _a, _b;
    if (!style.strokeColor) style.strokeColor = "#ff0000";
    if (!Number.isFinite(style.strokeWidth) || style.strokeWidth <= 0) {
      style.strokeWidth = 2;
    }
    if (typeof style.strokeOpacity === "number") {
      style.strokeOpacity = this.clamp(style.strokeOpacity, 0, 1);
      if (style.strokeOpacity === 1) delete style.strokeOpacity;
    }
    const pattern = (_a = style.fillPattern) != null ? _a : style.fillColor ? "solid" : "none";
    style.fillPattern = pattern;
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
        style.fillPatternOpacity = (_b = style.fillOpacity) != null ? _b : 0.15;
      }
      style.fillPatternOpacity = this.clamp(style.fillPatternOpacity, 0, 1);
    }
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

// src/namePrompt.ts
var import_obsidian7 = require("obsidian");
var NamePromptModal = class extends import_obsidian7.Modal {
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
    new import_obsidian7.Setting(contentEl).setName("Name").addText((t) => {
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
var import_obsidian8 = require("obsidian");
var RenameLayerModal = class extends import_obsidian8.Modal {
  constructor(app, layer, onDone) {
    var _a;
    super(app);
    this.value = "";
    this.layer = layer;
    this.onDone = onDone;
    this.value = (_a = layer.name) != null ? _a : "";
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Rename layer" });
    new import_obsidian8.Setting(contentEl).setName("New name").addText((t) => {
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
var DeleteLayerModal = class extends import_obsidian8.Modal {
  constructor(app, layer, targets, hasMarkers, onDone) {
    var _a, _b;
    super(app);
    this.mode = "delete-markers";
    this.targetId = "";
    this.layer = layer;
    this.targets = targets;
    this.hasMarkers = hasMarkers;
    this.onDone = onDone;
    this.targetId = (_b = (_a = targets[0]) == null ? void 0 : _a.id) != null ? _b : "";
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Delete layer" });
    const canMove = this.targets.length > 0;
    const actionSetting = new import_obsidian8.Setting(contentEl).setName("Action");
    actionSetting.addDropdown((d) => {
      d.addOption("delete-markers", "Delete markers");
      if (canMove) d.addOption("move", "Move to layer");
      d.setValue(this.mode);
      d.onChange((v) => {
        this.mode = v;
        targetSetting.settingEl.toggle(this.mode === "move");
      });
    });
    const targetSetting = new import_obsidian8.Setting(contentEl).setName("Target layer").addDropdown((d) => {
      for (const t of this.targets) d.addOption(t.id, t.name);
      d.setValue(this.targetId);
      d.onChange((v) => this.targetId = v);
    });
    targetSetting.settingEl.toggle(this.mode === "move");
    if (!this.hasMarkers) {
      new import_obsidian8.Setting(contentEl).setDesc("This layer has no markers.");
    }
    if (!canMove) {
      new import_obsidian8.Setting(contentEl).setDesc("No other layer available to move markers.");
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
var import_obsidian9 = require("obsidian");
var PinSizeEditorModal = class extends import_obsidian9.Modal {
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
var import_obsidian10 = require("obsidian");
var ViewEditorModal = class extends import_obsidian10.Modal {
  constructor(app, initial, onResult) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    super(app);
    this.cfg = JSON.parse(JSON.stringify(initial));
    this.onResult = onResult;
    if (!this.cfg.imageBases || this.cfg.imageBases.length === 0) {
      this.cfg.imageBases = [{ path: "", name: "" }];
    }
    (_b = (_a = this.cfg).overlays) != null ? _b : _a.overlays = [];
    (_d = (_c = this.cfg).markerLayers) != null ? _d : _c.markerLayers = ["Default"];
    (_e = this.cfg).width || (_e.width = "100%");
    (_f = this.cfg).height || (_f.height = "480px");
    (_g = this.cfg).renderMode || (_g.renderMode = "dom");
    (_h = this.cfg).resizeHandle || (_h.resizeHandle = "right");
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
        var _a, _b;
        const row = basesWrap.createDiv({ cls: "zoommap-view-editor-row" });
        const pathInput = row.createEl("input", {
          type: "text"
        });
        pathInput.addClass("zoommap-view-editor-input", "zoommap-view-editor-input-path");
        pathInput.placeholder = idx === 0 ? "Path to base image (required)" : "Path to additional base image";
        pathInput.value = (_a = b.path) != null ? _a : "";
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
        nameInput.value = (_b = b.name) != null ? _b : "";
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
        var _a, _b;
        const row = overlaysWrap.createDiv({ cls: "zoommap-view-editor-row" });
        const pathInput = row.createEl("input", { type: "text" });
        pathInput.addClass("zoommap-view-editor-input", "zoommap-view-editor-input-path");
        pathInput.placeholder = "Path to overlay image";
        pathInput.value = (_a = o.path) != null ? _a : "";
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
        nameInput.value = (_b = o.name) != null ? _b : "";
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
    new import_obsidian10.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Markers").setDesc("Optional. If empty, <firstBase>.markers.json is used.").addText((t) => {
      var _a;
      t.setPlaceholder("Path to markers.json");
      t.setValue((_a = this.cfg.markersPath) != null ? _a : "");
      t.onChange((v) => {
        this.cfg.markersPath = v.trim();
      });
    }).addButton(
      (b) => b.setButtonText("Use first base").onClick(() => {
        this.autoFillMarkersPathFromFirstBase(true);
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
    new import_obsidian10.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Render mode").addDropdown((d) => {
      var _a;
      d.addOption("dom", "DOM");
      d.addOption("canvas", "Canvas");
      d.setValue((_a = this.cfg.renderMode) != null ? _a : "dom");
      d.onChange((v) => {
        this.cfg.renderMode = v;
      });
    });
    new import_obsidian10.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Min zoom (%)").addText((t) => {
      t.setPlaceholder("25");
      t.setValue(this.factorToPercentString(this.cfg.minZoom));
      t.inputEl.classList.add("zoommap-view-editor-input--short");
      t.onChange((v) => {
        this.cfg.minZoom = this.percentInputToFactor(v, 0.25);
      });
    });
    new import_obsidian10.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Max zoom (%)").addText((t) => {
      t.setPlaceholder("200");
      t.setValue(this.factorToPercentString(this.cfg.maxZoom));
      t.inputEl.classList.add("zoommap-view-editor-input--short");
      t.onChange((v) => {
        this.cfg.maxZoom = this.percentInputToFactor(v, 8);
      });
    });
    new import_obsidian10.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Wrap").addDropdown((d) => {
      d.addOption("false", "False");
      d.addOption("true", "True");
      d.setValue(this.cfg.wrap ? "true" : "false");
      d.onChange((v) => {
        this.cfg.wrap = v === "true";
      });
    });
    new import_obsidian10.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Responsive").addDropdown((d) => {
      d.addOption("false", "False");
      d.addOption("true", "True");
      d.setValue(this.cfg.responsive ? "true" : "false");
      d.onChange((v) => {
        this.cfg.responsive = v === "true";
      });
    });
    const widthSetting = new import_obsidian10.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Width");
    widthSetting.addToggle((tg) => {
      tg.setValue(this.cfg.useWidth).onChange((on) => {
        this.cfg.useWidth = on;
      });
    });
    widthSetting.addText((t) => {
      var _a;
      t.setPlaceholder("100% or 640px");
      t.setValue((_a = this.cfg.width) != null ? _a : "");
      t.inputEl.classList.add("zoommap-view-editor-input--short");
      t.onChange((v) => {
        this.cfg.width = v.trim();
      });
    });
    {
      const hint = widthSetting.controlEl.createDiv({ cls: "zoommap-info-icon" });
      (0, import_obsidian10.setIcon)(hint, "info");
      hint.setAttr(
        "title",
        "Check to store width in YAML. Leave unchecked to let the map remember its size in markers.json only."
      );
    }
    const heightSetting = new import_obsidian10.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Height");
    heightSetting.addToggle((tg) => {
      tg.setValue(this.cfg.useHeight).onChange((on) => {
        this.cfg.useHeight = on;
      });
    });
    heightSetting.addText((t) => {
      var _a;
      t.setPlaceholder("480px");
      t.setValue((_a = this.cfg.height) != null ? _a : "");
      t.inputEl.classList.add("zoommap-view-editor-input--short");
      t.onChange((v) => {
        this.cfg.height = v.trim();
      });
    });
    {
      const hint = heightSetting.controlEl.createDiv({ cls: "zoommap-info-icon" });
      (0, import_obsidian10.setIcon)(hint, "info");
      hint.setAttr(
        "title",
        "Check to store height in YAML. Leave unchecked to let the map remember its height in markers.json only."
      );
    }
    let handleSetting = null;
    new import_obsidian10.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Resizable").addToggle((tg) => {
      tg.setValue(!!this.cfg.resizable).onChange((on) => {
        this.cfg.resizable = on;
        handleSetting == null ? void 0 : handleSetting.settingEl.toggle(on);
      });
    });
    handleSetting = new import_obsidian10.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Resize handle").addDropdown((d) => {
      var _a;
      d.addOption("native", "Native");
      d.addOption("left", "Left");
      d.addOption("right", "Right");
      d.addOption("both", "Both");
      d.setValue((_a = this.cfg.resizeHandle) != null ? _a : "native");
      d.onChange((v) => {
        this.cfg.resizeHandle = v;
      });
    });
    handleSetting.settingEl.toggle(!!this.cfg.resizable);
    new import_obsidian10.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Align").addDropdown((d) => {
      var _a;
      d.addOption("", "(none)");
      d.addOption("left", "Left");
      d.addOption("center", "Center");
      d.addOption("right", "Right");
      d.setValue((_a = this.cfg.align) != null ? _a : "");
      d.onChange((v) => {
        this.cfg.align = v || void 0;
      });
    });
    new import_obsidian10.Setting(contentEl).setClass("zoommap-view-editor-row").setName("ID (optional)").setDesc("Stable identifier if you store markers inline in the note.").addText((t) => {
      var _a;
      t.setPlaceholder("Map-world-1");
      t.setValue((_a = this.cfg.id) != null ? _a : "");
      t.onChange((v) => {
        const val = v.trim();
        this.cfg.id = val.length ? val : void 0;
      });
    });
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const saveBtn = footer.createEl("button", { text: "Save" });
    const cancelBtn = footer.createEl("button", { text: "Cancel" });
    saveBtn.onclick = () => {
      var _a, _b;
      const first = (_b = (_a = this.cfg.imageBases[0]) == null ? void 0 : _a.path) == null ? void 0 : _b.trim();
      if (!first) {
        new import_obsidian10.Notice("Please select at least one base image.", 2500);
        return;
      }
      this.normalizeZoomRange();
      this.autoFillMarkersPathFromFirstBase();
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
    var _a, _b;
    const first = (_b = (_a = this.cfg.imageBases[0]) == null ? void 0 : _a.path) == null ? void 0 : _b.trim();
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
var import_obsidian11 = require("obsidian");
function deepClone(x) {
  if (typeof structuredClone === "function") return structuredClone(x);
  const json = JSON.stringify(x);
  return JSON.parse(json);
}
var CollectionEditorModal = class extends import_obsidian11.Modal {
  constructor(app, plugin, collection, onDone) {
    var _a, _b, _c, _d, _e, _f, _g;
    super(app);
    this.plugin = plugin;
    this.original = collection;
    this.working = deepClone(collection);
    this.working.bindings = (_a = this.working.bindings) != null ? _a : { basePaths: [] };
    this.working.bindings.basePaths = (_b = this.working.bindings.basePaths) != null ? _b : [];
    this.working.include = (_c = this.working.include) != null ? _c : {
      pinKeys: [],
      favorites: [],
      stickers: [],
      swapPins: []
    };
    this.working.include.pinKeys = (_d = this.working.include.pinKeys) != null ? _d : [];
    this.working.include.favorites = (_e = this.working.include.favorites) != null ? _e : [];
    this.working.include.stickers = (_f = this.working.include.stickers) != null ? _f : [];
    this.working.include.swapPins = (_g = this.working.include.swapPins) != null ? _g : [];
    this.onDone = onDone;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Edit collection" });
    new import_obsidian11.Setting(contentEl).setName("Name").addText((t) => {
      var _a;
      t.setValue((_a = this.working.name) != null ? _a : "");
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
      var _a;
      pinWrap.empty();
      pinWrap.createDiv({
        cls: "zoommap-collection-pin-hint",
        text: "Select pins from the icon library:"
      });
      const lib = (_a = this.plugin.settings.icons) != null ? _a : [];
      if (lib.length === 0) {
        const none = pinWrap.createEl("div", {
          text: "No icons in library yet."
        });
        none.addClass("zoommap-muted");
      } else {
        const list = pinWrap.createDiv({ cls: "zoommap-collection-pin-grid" });
        lib.forEach((ico) => {
          var _a2;
          const cell = list.createDiv({ cls: "zoommap-collection-pin-cell" });
          const cb = cell.createEl("input", { type: "checkbox" });
          cb.checked = this.working.include.pinKeys.includes(ico.key);
          cb.onchange = () => {
            const arr = this.working.include.pinKeys;
            if (cb.checked) {
              if (!arr.includes(ico.key)) arr.push(ico.key);
            } else {
              const i = arr.indexOf(ico.key);
              if (i >= 0) arr.splice(i, 1);
            }
          };
          const img = cell.createEl("img");
          img.addClass("zoommap-collection-pin-icon");
          const src = (_a2 = ico.pathOrDataUrl) != null ? _a2 : "";
          if (typeof src === "string") {
            if (src.startsWith("data:")) {
              img.src = src;
            } else if (src) {
              const f = this.app.vault.getAbstractFileByPath(src);
              if (f instanceof import_obsidian11.TFile) {
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
        var _a, _b, _c, _d, _e;
        const row = favWrap.createDiv({ cls: "zoommap-collection-fav-row" });
        const name = row.createEl("input", { type: "text" });
        name.value = (_a = p.name) != null ? _a : "";
        name.oninput = () => {
          p.name = name.value.trim();
        };
        const iconSel = row.createEl("select");
        const addOpt = (val, labelText) => {
          const o = document.createElement("option");
          o.value = val;
          o.textContent = labelText;
          iconSel.appendChild(o);
        };
        addOpt("", "(default)");
        ((_b = this.plugin.settings.icons) != null ? _b : []).forEach(
          (ico) => addOpt(ico.key, ico.key)
        );
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
        var _a, _b, _c, _d;
        const row = stickerWrap.createDiv({
          cls: "zoommap-collection-sticker-row"
        });
        const name = row.createEl("input", { type: "text" });
        name.value = (_a = s.name) != null ? _a : "";
        name.oninput = () => {
          s.name = name.value.trim();
        };
        const path = row.createEl("input", { type: "text" });
        path.placeholder = "Image path or data URL";
        path.value = (_b = s.imagePath) != null ? _b : "";
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
      var _a, _b;
      swapWrap.empty();
      const swaps = (_b = (_a = this.working.include).swapPins) != null ? _b : _a.swapPins = [];
      if (swaps.length === 0) {
        const none = swapWrap.createEl("div", {
          text: "No swap pins in this collection."
        });
        none.addClass("zoommap-muted");
      }
      swaps.forEach((sp, idx) => {
        var _a2;
        const row = swapWrap.createDiv({
          cls: "zoommap-collection-sticker-row"
        });
        const name = row.createEl("input", { type: "text" });
        name.value = (_a2 = sp.name) != null ? _a2 : "";
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
      }
    );
    modal.open();
  }
  onClose() {
    this.contentEl.empty();
  }
};
var SwapFramesEditorModal = class extends import_obsidian11.Modal {
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
    new import_obsidian11.Setting(contentEl).setName("Name").addText((t) => {
      var _a;
      t.setValue((_a = this.working.name) != null ? _a : "");
      t.onChange((v) => {
        this.working.name = v.trim() || this.working.name;
      });
    });
    new import_obsidian11.Setting(contentEl).setName("Place as hud pin by default").addToggle((tg) => {
      tg.setValue(!!this.working.defaultHud).onChange((on) => {
        this.working.defaultHud = on || void 0;
      });
    });
    new import_obsidian11.Setting(contentEl).setName("Scale like sticker by default").addToggle((tg) => {
      tg.setValue(!!this.working.defaultScaleLikeSticker).onChange((on) => {
        this.working.defaultScaleLikeSticker = on || void 0;
      });
    });
    new import_obsidian11.Setting(contentEl).setName("Hover opens popover automatically").setDesc("If enabled, hovering this swap pin shows a preview without ctrl/cmd.").addToggle((tg) => {
      tg.setValue(!!this.working.hoverPopover).onChange((on) => {
        this.working.hoverPopover = on || void 0;
      });
    });
    const list = contentEl.createDiv();
    const render = () => {
      var _a, _b;
      list.empty();
      const frames = (_b = (_a = this.working).frames) != null ? _b : _a.frames = [];
      if (frames.length === 0) {
        const none = list.createEl("div", { text: "No frames yet." });
        none.addClass("zoommap-muted");
      }
      frames.forEach((fr, idx) => {
        var _a2, _b2;
        const row = list.createDiv({
          cls: "zoommap-collection-sticker-row"
        });
        const iconSel = row.createEl("select");
        const icons = (_a2 = this.plugin.settings.icons) != null ? _a2 : [];
        icons.forEach((ico) => {
          const opt = document.createElement("option");
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
        link.value = (_b2 = fr.link) != null ? _b2 : "";
        link.oninput = () => {
          fr.link = link.value.trim() || void 0;
        };
        this.attachLinkAutocomplete(
          link,
          () => {
            var _a3;
            return (_a3 = fr.link) != null ? _a3 : "";
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
        var _a2, _b2, _c;
        const firstKey = (_c = (_b2 = (_a2 = this.plugin.settings.icons) == null ? void 0 : _a2[0]) == null ? void 0 : _b2.key) != null ? _c : "";
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
    var _a, _b, _c, _d;
    const files = this.app.vault.getFiles().filter((f) => {
      var _a2;
      return ((_a2 = f.extension) == null ? void 0 : _a2.toLowerCase()) === "md";
    });
    const suggestions = [];
    const active = this.app.workspace.getActiveFile();
    const fromPath = (_c = (_b = active == null ? void 0 : active.path) != null ? _b : (_a = files[0]) == null ? void 0 : _a.path) != null ? _c : "";
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

// src/textLayerStyleModal.ts
var import_obsidian12 = require("obsidian");
function deepClone2(x) {
  if (typeof structuredClone === "function") return structuredClone(x);
  return JSON.parse(JSON.stringify(x));
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
function collectLoadedFontFamilies() {
  const out = /* @__PURE__ */ new Set();
  try {
    const fs = document.fonts;
    if (fs && typeof fs.forEach === "function") {
      fs.forEach((ff) => {
        var _a;
        const fam = String((_a = ff.family) != null ? _a : "").replace(/["']/g, "").trim();
        if (!fam) return;
        out.add(fam);
      });
    }
  } catch (e) {
  }
  return [...out].sort((a, b) => a.localeCompare(b));
}
function buildFontOptions() {
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
  const loaded = collectLoadedFontFamilies();
  for (const fam of loaded) {
    add(`${fam}, var(--font-text)`, fam);
  }
  return options;
}
var TextLayerStyleModal = class extends import_obsidian12.Modal {
  constructor(app, layer, onDone) {
    super(app);
    this.applyToAll = false;
    this.original = layer;
    this.working = deepClone2(layer);
    this.onDone = onDone;
    this.working.style = this.normalizeStyle(this.working.style);
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Text layer settings" });
    new import_obsidian12.Setting(contentEl).setName("Name").addText((t) => {
      var _a;
      t.setValue((_a = this.working.name) != null ? _a : "");
      t.onChange((v) => this.working.name = v.trim() || "Text layer");
    });
    new import_obsidian12.Setting(contentEl).setName("Allow angled baselines").setDesc("If enabled: baselines snap horizontal by default; hold ctrl for free angle.").addToggle((tg) => {
      tg.setValue(!!this.working.allowAngledBaselines).onChange((on) => {
        this.working.allowAngledBaselines = on;
      });
    });
    contentEl.createEl("h3", { text: "Font" });
    const fontOptions = buildFontOptions();
    const knownValues = new Set(fontOptions.map((o) => o.value));
    const CUSTOM = "__custom__";
    const currentFamily = this.working.style.fontFamily;
    const initialSelect = knownValues.has(currentFamily) ? currentFamily : CUSTOM;
    let customSetting = null;
    let customInputEl = null;
    new import_obsidian12.Setting(contentEl).setName("Font family").addDropdown((dd) => {
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
    customSetting = new import_obsidian12.Setting(contentEl).setName("Custom font-family").setDesc("CSS font-family value, e.g. 'caveat, font-text'.");
    customSetting.addText((t) => {
      t.setPlaceholder("Caveat, var(--font-text)");
      t.setValue(currentFamily);
      customInputEl = t.inputEl;
      t.onChange((v) => {
        this.working.style.fontFamily = v.trim() || "var(--font-text)";
      });
    });
    customSetting.settingEl.toggle(initialSelect === CUSTOM);
    new import_obsidian12.Setting(contentEl).setName("Font size (px)").addText((t) => {
      t.inputEl.type = "number";
      t.setValue(String(this.working.style.fontSize));
      t.onChange((v) => {
        const n = Number(v);
        if (Number.isFinite(n) && n > 1) this.working.style.fontSize = n;
      });
    });
    const colorRow = new import_obsidian12.Setting(contentEl).setName("Color");
    let colorTextEl;
    const picker = colorRow.controlEl.createEl("input", {
      attr: { type: "color", style: "margin-left:8px; vertical-align: middle;" }
    });
    colorRow.addText((t) => {
      t.setPlaceholder("#000000");
      t.setValue(this.working.style.color);
      colorTextEl = t.inputEl;
      t.onChange((v) => {
        this.working.style.color = v.trim() || "var(--text-normal)";
        const hex = normalizeHex(this.working.style.color);
        if (/^#([0-9a-f]{6})$/i.test(hex)) picker.value = hex;
      });
    });
    {
      const hex = normalizeHex(this.working.style.color);
      if (/^#([0-9a-f]{6})$/i.test(hex)) picker.value = hex;
    }
    picker.oninput = () => {
      this.working.style.color = picker.value;
      colorTextEl.value = picker.value;
    };
    new import_obsidian12.Setting(contentEl).setName("Font weight").addText((t) => {
      var _a;
      t.setPlaceholder("400");
      t.setValue((_a = this.working.style.fontWeight) != null ? _a : "");
      t.onChange((v) => {
        const s = v.trim();
        this.working.style.fontWeight = s || void 0;
      });
    });
    new import_obsidian12.Setting(contentEl).setName("Italic").addToggle((tg) => {
      tg.setValue(!!this.working.style.italic).onChange((on) => {
        this.working.style.italic = on ? true : void 0;
      });
    });
    new import_obsidian12.Setting(contentEl).setName("Letter spacing (px)").addText((t) => {
      t.inputEl.type = "number";
      t.setPlaceholder("0");
      t.setValue(
        typeof this.working.style.letterSpacing === "number" ? String(this.working.style.letterSpacing) : ""
      );
      t.onChange((v) => {
        const s = v.trim();
        if (!s) {
          this.working.style.letterSpacing = void 0;
          return;
        }
        const n = Number(s);
        if (Number.isFinite(n)) this.working.style.letterSpacing = n;
      });
    });
    contentEl.createEl("h3", { text: "Layout" });
    new import_obsidian12.Setting(contentEl).setName("Line height (px)").setDesc("Height of each input line box. Leave empty to auto-calc from font size.").addText((t) => {
      t.inputEl.type = "number";
      const v = this.working.style.lineHeight;
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
    new import_obsidian12.Setting(contentEl).setName("Padding left (px)").addText((t) => {
      var _a;
      t.inputEl.type = "number";
      t.setPlaceholder("0");
      t.setValue(String((_a = this.working.style.padLeft) != null ? _a : 0));
      t.onChange((v) => {
        const n = Number(v);
        if (Number.isFinite(n) && n >= 0) this.working.style.padLeft = n;
      });
    });
    new import_obsidian12.Setting(contentEl).setName("Padding right (px)").addText((t) => {
      var _a;
      t.inputEl.type = "number";
      t.setPlaceholder("0");
      t.setValue(String((_a = this.working.style.padRight) != null ? _a : 0));
      t.onChange((v) => {
        const n = Number(v);
        if (Number.isFinite(n) && n >= 0) this.working.style.padRight = n;
      });
    });
    new import_obsidian12.Setting(contentEl).setName("Apply style to all text layers").setDesc("Copies font + layout settings to every text layer on this map.").addToggle((tg) => {
      tg.setValue(this.applyToAll).onChange((on) => {
        this.applyToAll = on;
      });
    });
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const save = footer.createEl("button", { text: "Save" });
    const cancel = footer.createEl("button", { text: "Cancel" });
    save.onclick = () => {
      this.working.style = this.normalizeStyle(this.working.style);
      this.original.name = this.working.name;
      this.original.allowAngledBaselines = !!this.working.allowAngledBaselines;
      this.original.style = this.working.style;
      this.close();
      this.onDone({
        action: "save",
        layer: this.original,
        applyStyleToAll: this.applyToAll
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
  normalizeStyle(style) {
    var _a, _b;
    const s = { ...style != null ? style : {} };
    s.fontFamily = ((_a = s.fontFamily) != null ? _a : "").trim() || "var(--font-text)";
    s.color = ((_b = s.color) != null ? _b : "").trim() || "var(--text-normal)";
    if (!Number.isFinite(s.fontSize) || s.fontSize <= 1) s.fontSize = 14;
    if (typeof s.lineHeight === "number") {
      if (!Number.isFinite(s.lineHeight) || s.lineHeight <= 1) {
        delete s.lineHeight;
      }
    } else {
      delete s.lineHeight;
    }
    if (typeof s.padLeft !== "number" || !Number.isFinite(s.padLeft) || s.padLeft < 0) s.padLeft = 0;
    if (typeof s.padRight !== "number" || !Number.isFinite(s.padRight) || s.padRight < 0) s.padRight = 0;
    if (typeof s.italic !== "boolean") delete s.italic;
    if (typeof s.letterSpacing === "number" && !Number.isFinite(s.letterSpacing)) {
      delete s.letterSpacing;
    }
    if (s.fontWeight != null) {
      const fw = String(s.fontWeight).trim();
      s.fontWeight = fw.length ? fw : void 0;
    }
    return s;
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
    if (value === null) el.style.removeProperty(key);
    else el.style.setProperty(key, value);
  }
}
function isImageBitmapLike(x) {
  return typeof x === "object" && x !== null && "close" in x && typeof x.close === "function";
}
function isSvgDataUrl(src) {
  return typeof src === "string" && src.startsWith("data:image/svg+xml");
}
function tintSvgMarkupLocal(svg, color) {
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
function getMinZoom(m) {
  return m.minZoom;
}
function getMaxZoom(m) {
  return m.maxZoom;
}
function isScaleLikeSticker(m) {
  return !!m.scaleLikeSticker;
}
var MapInstance = class extends import_obsidian13.Component {
  constructor(app, plugin, el, cfg) {
    var _a, _b;
    super();
    this.zoomHudTimer = null;
    this.initialLayoutDone = false;
    this.overlayMap = /* @__PURE__ */ new Map();
    this.baseCanvas = null;
    this.ctx = null;
    this.baseBitmap = null;
    this.overlaySources = /* @__PURE__ */ new Map();
    this.overlayLoading = /* @__PURE__ */ new Map();
    this.textMode = null;
    this.activeTextLayerId = null;
    this.textDrawStart = null;
    this.textDrawPreview = null;
    this.textLineStart = null;
    this.textLinePreview = null;
    this.textInputs = /* @__PURE__ */ new Map();
    this.textDirty = false;
    this.textSaveTimer = null;
    this.textOutsideCleanup = null;
    this.textMeasureSpan = null;
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
    this.currentBasePath = null;
    this.frameSaveTimer = null;
    this.userResizing = false;
    this.yamlAppliedOnce = false;
    this.tintedSvgCache = /* @__PURE__ */ new Map();
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
      const id = (_b = this.cfg.mapId) != null ? _b : `map-${(_a = this.cfg.sectionStart) != null ? _a : 0}`;
      this.store = new NoteMarkerStore(app, cfg.sourcePath, id, this.cfg.sectionEnd);
    } else {
      this.store = new MarkerStore(app, cfg.sourcePath, cfg.markersPath);
    }
  }
  openViewEditorFromMap() {
    var _a, _b, _c, _d;
    if (!this.data) return;
    const bases = this.getBasesNormalized();
    const overlays = (_a = this.data.overlays) != null ? _a : [];
    const rect = this.el.getBoundingClientRect();
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
      width: curW > 0 ? `${curW}px` : (_b = this.cfg.width) != null ? _b : "",
      height: curH > 0 ? `${curH}px` : (_c = this.cfg.height) != null ? _c : "",
      useWidth: !!this.cfg.widthFromYaml,
      useHeight: !!this.cfg.heightFromYaml,
      resizable: !!this.cfg.resizable,
      resizeHandle: (_d = this.cfg.resizeHandle) != null ? _d : "right",
      align: this.cfg.align,
      markerLayers: this.data.layers.map((l) => {
        var _a2;
        return (_a2 = l.name) != null ? _a2 : "Layer";
      }),
      id: this.cfg.mapId
    };
    const modal = new ViewEditorModal(this.app, cfg, (res) => {
      if (res.action !== "save" || !res.config) return;
      void this.applyViewEditorResult(res.config);
    });
    modal.open();
  }
  applyInitialView(zoom, center) {
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
  async saveDefaultViewToYaml() {
    if (typeof this.cfg.sectionStart !== "number") {
      new import_obsidian13.Notice("Cannot store default view (no YAML section info).", 2500);
      return;
    }
    const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
    if (!(af instanceof import_obsidian13.TFile)) {
      new import_obsidian13.Notice("Source note not found.", 2500);
      return;
    }
    const z = this.scale;
    if (!this.imgW || !this.imgH || !Number.isFinite(z) || z <= 0) {
      new import_obsidian13.Notice("Cannot store default view (image not ready).", 2500);
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
      var _a;
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
          keyIndent = (_a = m[1]) != null ? _a : "";
          break;
        }
      }
      const viewLines = [
        `${keyIndent}view:`,
        `${keyIndent}  zoom: ${zoom.toFixed(4)}`,
        `${keyIndent}  centerX: ${cx.toFixed(6)}`,
        `${keyIndent}  centerY: ${cy.toFixed(6)}`
      ];
      const isNextTopLevelKey = (ln) => {
        var _a2, _b;
        const trimmed = ln.trim();
        if (!trimmed) return false;
        if (trimmed.startsWith("#")) return false;
        const spaces = (_b = (_a2 = /^\s*/.exec(ln)) == null ? void 0 : _a2[0].length) != null ? _b : 0;
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
        const vLines = [
          `${indent}view:`,
          `${indent}  zoom: ${zoom.toFixed(4)}`,
          `${indent}  centerX: ${cx.toFixed(6)}`,
          `${indent}  centerY: ${cy.toFixed(6)}`
        ];
        newContent = [...content, ...vLines];
      }
      return [
        ...lines.slice(0, blk.start + 1),
        ...newContent,
        ...lines.slice(blk.end)
      ].join("\n");
    });
    new import_obsidian13.Notice("Default view stored in YAML.", 2e3);
  }
  async applyViewEditorResult(cfg) {
    if (typeof this.cfg.sectionStart !== "number") {
      new import_obsidian13.Notice("Cannot update YAML for this map (no section info).", 3e3);
      return;
    }
    const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
    if (!(af instanceof import_obsidian13.TFile)) {
      new import_obsidian13.Notice("Source note not found.", 3e3);
      return;
    }
    const buildYaml = (pluginCfg) => {
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
        ...lines.slice(blk.end)
      ].join("\n");
    });
    new import_obsidian13.Notice("View updated. Reload the note to see changes.", 2500);
  }
  startDraw(kind) {
    var _a;
    if (!this.plugin.settings.enableDrawing) {
      new import_obsidian13.Notice("Drawing tools are disabled in the plugin preferences.", 2e3);
      return;
    }
    if (!this.data) return;
    const layers = (_a = this.data.drawLayers) != null ? _a : [];
    const visible = layers.find((l) => l.visible);
    if (layers.length === 0) {
      new import_obsidian13.Notice(
        "No draw layers exist yet. Create one under image layers \u2192 draw layers \u2192 add draw layer\u2026",
        6e3
      );
      return;
    }
    if (!visible) {
      new import_obsidian13.Notice(
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
      new import_obsidian13.Notice(
        "Draw rectangle: click start point, move the mouse, click end point. Press esc to cancel.",
        5e3
      );
    } else if (kind === "circle") {
      new import_obsidian13.Notice(
        "Draw circle: click center, move the mouse, click radius point. Press esc to cancel.",
        5e3
      );
    } else if (kind === "polygon") {
      new import_obsidian13.Notice(
        "Draw polygon: click to add points, move the mouse for preview, double-click or right-click to finish. Press esc to cancel.",
        7e3
      );
    }
  }
  isCanvas() {
    return this.cfg.renderMode === "canvas";
  }
  onload() {
    void this.bootstrap().catch((err) => {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(err);
      new import_obsidian13.Notice(`Zoom Map error: ${msg}`, 6e3);
    });
  }
  onunload() {
    var _a, _b;
    if (this.zoomHudTimer !== null) {
      window.clearTimeout(this.zoomHudTimer);
      this.zoomHudTimer = null;
    }
    this.tintedSvgCache.clear();
    (_a = this.tooltipEl) == null ? void 0 : _a.remove();
    (_b = this.ro) == null ? void 0 : _b.disconnect();
    this.closeMenu();
    this.disposeBitmaps();
  }
  async bootstrap() {
    var _a, _b, _c, _d, _e, _f;
    this.el.classList.add("zm-root");
    if (this.isCanvas()) this.el.classList.add("zm-root--canvas-mode");
    if (this.cfg.responsive) this.el.classList.add("zm-root--responsive");
    if (this.cfg.responsive) {
      setCssProps(this.el, {
        width: "100%",
        height: "auto"
      });
    } else {
      setCssProps(this.el, {
        width: (_a = this.cfg.width) != null ? _a : null,
        height: (_b = this.cfg.height) != null ? _b : null
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
    this.registerDomEvent(this.viewportEl, "wheel", (e) => {
      const t = e.target;
      if (t instanceof Element && t.closest(".popover")) return;
      if (this.cfg.responsive) return;
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
    this.registerDomEvent(window, "pointermove", (e) => this.onPointerMove(e));
    this.registerDomEvent(window, "pointerup", (e) => {
      if (this.activePointers.has(e.pointerId)) this.activePointers.delete(e.pointerId);
      if (this.pinchActive && this.activePointers.size < 2) this.endPinch();
      e.preventDefault();
      this.onPointerUp();
    });
    this.registerDomEvent(window, "pointercancel", (e) => {
      if (this.activePointers.has(e.pointerId)) this.activePointers.delete(e.pointerId);
      if (this.pinchActive && this.activePointers.size < 2) this.endPinch();
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
    this.registerDomEvent(window, "keydown", (e) => {
      if (e.key !== "Escape") return;
      if (this.textMode === "edit") {
        this.stopTextEdit(true);
        this.closeMenu();
        return;
      }
      if (this.textMode === "draw-layer" || this.textMode === "draw-lines") {
        this.textMode = null;
        this.activeTextLayerId = null;
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
        new import_obsidian13.Notice("Calibration cancelled.", 900);
      } else if (this.measuring) {
        this.measuring = false;
        this.measurePreview = null;
        this.updateMeasureHud();
      }
      this.closeMenu();
    });
    this.registerEvent(
      this.app.vault.on("modify", (f) => {
        if (!(f instanceof import_obsidian13.TFile)) return;
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
    await this.store.ensureExists(
      this.cfg.imagePath,
      { w: this.imgW, h: this.imgH },
      this.cfg.yamlMarkerLayers
    );
    this.data = await this.store.load();
    await this.applyYamlOnFirstLoad();
    if (this.cfg.yamlMetersPerPixel && this.getMetersPerPixel() === void 0) {
      this.ensureMeasurement();
      const base = this.getActiveBasePath();
      if ((_d = this.data) == null ? void 0 : _d.measurement) {
        this.data.measurement.metersPerPixel = this.cfg.yamlMetersPerPixel;
        this.data.measurement.scales[base] = this.cfg.yamlMetersPerPixel;
        if (await this.store.wouldChange(this.data)) {
          this.ignoreNextModify = true;
          await this.store.save(this.data);
        }
      }
    }
    if (this.data) {
      if (!((_e = this.data.size) == null ? void 0 : _e.w) || !((_f = this.data.size) == null ? void 0 : _f.h)) {
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
      var _a2;
      return (_a2 = this.ro) == null ? void 0 : _a2.disconnect();
    });
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
    this.setupTextOverlay();
    this.applyMeasureStyle();
    this.renderAll();
    this.ready = true;
  }
  updateResponsiveAspectRatio() {
    if (!this.imgW || !this.imgH) return;
    this.el.style.aspectRatio = `${this.imgW} / ${this.imgH}`;
  }
  disposeBitmaps() {
    try {
      if (this.baseBitmap && isImageBitmapLike(this.baseBitmap)) this.baseBitmap.close();
    } catch (error) {
      console.error("Zoom Map: failed to dispose base bitmap", error);
    }
    this.baseBitmap = null;
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
  async loadBaseBitmapByPath(path) {
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
  async loadInitialBase(path) {
    if (this.isCanvas()) await this.loadBaseBitmapByPath(path);
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
  closeCanvasSource(src) {
    try {
      if (isImageBitmapLike(src)) src.close();
    } catch (error) {
      console.error("Zoom Map: failed to dispose canvas source", error);
    }
  }
  async ensureOverlayLoaded(path) {
    var _a, _b;
    if (this.overlaySources.has(path)) return (_a = this.overlaySources.get(path)) != null ? _a : null;
    if (this.overlayLoading.has(path)) return (_b = this.overlayLoading.get(path)) != null ? _b : null;
    const p = this.loadCanvasSourceFromPath(path).then((res) => {
      this.overlayLoading.delete(path);
      if (res) this.overlaySources.set(path, res);
      return res;
    }).catch((err) => {
      this.overlayLoading.delete(path);
      console.warn("Zoom Map: overlay load failed", path, err);
      return null;
    });
    this.overlayLoading.set(path, p);
    return p;
  }
  async ensureVisibleOverlaysLoaded() {
    var _a;
    if (!this.data) return;
    const wantVisible = new Set(((_a = this.data.overlays) != null ? _a : []).filter((o) => o.visible).map((o) => o.path));
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
  setupDrawOverlay() {
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
  ensureTextData() {
    var _a, _b;
    if (!this.data) return;
    (_b = (_a = this.data).textLayers) != null ? _b : _a.textLayers = [];
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
    var _a, _b, _c, _d, _e, _f, _g;
    const s = { ...this.defaultTextLayerStyle(), ...style != null ? style : {} };
    s.fontFamily = ((_a = s.fontFamily) != null ? _a : "").trim() || "var(--font-text)";
    s.color = ((_b = s.color) != null ? _b : "").trim() || "var(--text-normal)";
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
  setupTextOverlay() {
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
    this.textMeasureSpan = this.viewportEl.createEl("span", { cls: "zm-text-measure" });
  }
  renderTextLayers() {
    var _a, _b, _c, _d, _e;
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
    const ns = "http://www.w3.org/2000/svg";
    const abs = (nx, ny) => ({ x: nx * this.imgW, y: ny * this.imgH });
    const rectAbs = (r) => {
      const x = Math.min(r.x0, r.x1) * this.imgW;
      const y = Math.min(r.y0, r.y1) * this.imgH;
      const w = Math.abs(r.x1 - r.x0) * this.imgW;
      const h = Math.abs(r.y1 - r.y0) * this.imgH;
      return { x, y, w, h };
    };
    const layers = (_a = this.data.textLayers) != null ? _a : [];
    for (const layer of layers) {
      layer.style = this.normalizeTextLayerStyle(layer.style);
      const r = rectAbs(layer.rect);
      const hb = this.textHitEl.createDiv({ cls: "zm-text-hitbox" });
      hb.dataset.id = layer.id;
      hb.style.left = `${r.x}px`;
      hb.style.top = `${r.y}px`;
      hb.style.width = `${r.w}px`;
      hb.style.height = `${r.h}px`;
      hb.ondragstart = (ev) => ev.preventDefault();
      hb.addEventListener("dblclick", (e) => {
        e.stopPropagation();
      });
      hb.addEventListener("click", (e) => {
        e.stopPropagation();
        if (this.suppressTextClickOnce) return;
        if (this.textMode === "draw-lines" && this.activeTextLayerId === layer.id) {
          this.onTextDrawLineClick(layer, e);
          return;
        }
        this.onTextLayerClick(layer, e);
      });
      const showNow = this.textMode === "draw-lines" && this.activeTextLayerId === layer.id;
      if (showNow) {
        const rect = document.createElementNS(ns, "rect");
        rect.classList.add("zm-text-guide-rect");
        rect.setAttribute("x", String(r.x));
        rect.setAttribute("y", String(r.y));
        rect.setAttribute("width", String(r.w));
        rect.setAttribute("height", String(r.h));
        this.textGuidesLayer.appendChild(rect);
        for (const ln of (_b = layer.lines) != null ? _b : []) {
          const a = abs(ln.x0, ln.y0);
          const b = abs(ln.x1, ln.y1);
          const line = document.createElementNS(ns, "line");
          line.classList.add("zm-text-guide-line");
          line.setAttribute("x1", String(a.x));
          line.setAttribute("y1", String(a.y));
          line.setAttribute("x2", String(b.x));
          line.setAttribute("y2", String(b.y));
          this.textGuidesLayer.appendChild(line);
        }
      }
      const isEditingThis = this.textMode === "edit" && this.activeTextLayerId === layer.id;
      if (isEditingThis) continue;
      const st = layer.style;
      for (const ln of (_c = layer.lines) != null ? _c : []) {
        const txt = ((_d = ln.text) != null ? _d : "").trimEnd();
        if (!txt) continue;
        const a = abs(ln.x0, ln.y0);
        const b = abs(ln.x1, ln.y1);
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const angleDeg = Math.atan2(dy, dx) * 180 / Math.PI;
        const padLeft = (_e = st.padLeft) != null ? _e : 0;
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
    this.renderTextDraft();
  }
  renderTextDraft() {
    if (!this.textDraftLayer) return;
    this.textDraftLayer.innerHTML = "";
    const enabled = !!this.plugin.settings.enableTextLayers;
    if (!enabled) return;
    const ns = "http://www.w3.org/2000/svg";
    const abs = (nx, ny) => ({ x: nx * this.imgW, y: ny * this.imgH });
    if (this.textMode === "draw-layer" && this.textDrawStart && this.textDrawPreview) {
      const a = abs(this.textDrawStart.x, this.textDrawStart.y);
      const b = abs(this.textDrawPreview.x, this.textDrawPreview.y);
      const x = Math.min(a.x, b.x);
      const y = Math.min(a.y, b.y);
      const w = Math.abs(a.x - b.x);
      const h = Math.abs(a.y - b.y);
      const rect = document.createElementNS(ns, "rect");
      rect.classList.add("zm-text-guide-rect");
      rect.setAttribute("x", String(x));
      rect.setAttribute("y", String(y));
      rect.setAttribute("width", String(w));
      rect.setAttribute("height", String(h));
      this.textDraftLayer.appendChild(rect);
    }
    if (this.textMode === "draw-lines" && this.textLineStart && this.textLinePreview) {
      const a = abs(this.textLineStart.x, this.textLineStart.y);
      const b = abs(this.textLinePreview.x, this.textLinePreview.y);
      const line = document.createElementNS(ns, "line");
      line.classList.add("zm-text-guide-draft");
      line.setAttribute("x1", String(a.x));
      line.setAttribute("y1", String(a.y));
      line.setAttribute("x2", String(b.x));
      line.setAttribute("y2", String(b.y));
      this.textDraftLayer.appendChild(line);
    }
  }
  onTextLayerClick(layer, ev) {
    var _a;
    if (!this.data) return;
    if (!this.plugin.settings.enableTextLayers) return;
    if (layer.locked) {
      new import_obsidian13.Notice("Text layer is locked.", 1500);
      return;
    }
    const lines = (_a = layer.lines) != null ? _a : [];
    if (lines.length === 0) {
      new import_obsidian13.Notice("No baselines in this layer yet. Use 'draw lines' first.", 3e3);
      return;
    }
    const p = this.mouseEventToWorldNorm(ev);
    this.startTextEdit(layer.id, p);
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
  startTextEdit(layerId, focus) {
    var _a, _b, _c, _d, _e, _f;
    if (!this.data) return;
    this.measuring = false;
    this.calibrating = false;
    this.drawingMode = null;
    this.stopTextEdit(true);
    this.textMode = "edit";
    this.activeTextLayerId = layerId;
    this.textDirty = false;
    const layer = ((_a = this.data.textLayers) != null ? _a : []).find((l) => l.id === layerId);
    if (!layer) return;
    layer.style = this.normalizeTextLayerStyle(layer.style);
    this.textEditEl.empty();
    this.textInputs.clear();
    const st = layer.style;
    const sorted = [...(_b = layer.lines) != null ? _b : []].sort((a, b) => {
      const ay = (a.y0 + a.y1) / 2;
      const by = (b.y0 + b.y1) / 2;
      return ay - by || a.x0 - b.x0;
    });
    layer.lines = sorted;
    for (let i = 0; i < layer.lines.length; i += 1) {
      const ln = layer.lines[i];
      const ax0 = ln.x0 * this.imgW;
      const ay0 = ln.y0 * this.imgH;
      const ax1 = ln.x1 * this.imgW;
      const ay1 = ln.y1 * this.imgH;
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
      input.value = (_c = ln.text) != null ? _c : "";
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
        var _a2, _b2;
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          this.stopTextEdit(true);
          return;
        }
        if (e.key === "Backspace") {
          const selStart = (_a2 = input.selectionStart) != null ? _a2 : 0;
          const selEnd = (_b2 = input.selectionEnd) != null ? _b2 : selStart;
          if (selStart === 0 && selEnd === 0 && i > 0) {
            e.preventDefault();
            e.stopPropagation();
            const prev = this.getTextInputByIndex(i - 1);
            if (!prev) return;
            const joinPos = prev.value.length;
            prev.focus();
            prev.setSelectionRange(joinPos, joinPos);
            this.textDirty = true;
            this.reflowTextLayer(layer, i - 1, { advanceFocus: false });
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
          const next = this.getTextInputByIndex(i + 1);
          next == null ? void 0 : next.focus();
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
        var _a2, _b2, _c2;
        if (layer.locked) {
          input.value = (_a2 = ln.text) != null ? _a2 : "";
          new import_obsidian13.Notice("Text layer is locked.", 1200);
          return;
        }
        const selStart = (_b2 = input.selectionStart) != null ? _b2 : input.value.length;
        const selEnd = (_c2 = input.selectionEnd) != null ? _c2 : selStart;
        const hasSelection = selEnd !== selStart;
        const atEnd = !hasSelection && selStart === input.value.length;
        ln.text = input.value;
        this.textDirty = true;
        const move = this.reflowTextLayer(layer, i, { advanceFocus: atEnd });
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
      this.textInputs.set(ln.id, input);
    }
    this.installTextOutsideClickHandler();
    if (focus) {
      this.focusNearestBaseline(layer, focus);
    } else {
      (_f = this.getTextInputByIndex(0)) == null ? void 0 : _f.focus();
    }
    this.renderTextLayers();
  }
  stopTextEdit(save) {
    var _a;
    if (this.textMode !== "edit") return;
    this.textMode = null;
    this.activeTextLayerId = null;
    this.textInputs.clear();
    this.textEditEl.empty();
    (_a = this.textOutsideCleanup) == null ? void 0 : _a.call(this);
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
    var _a;
    (_a = this.textOutsideCleanup) == null ? void 0 : _a.call(this);
    this.textOutsideCleanup = null;
    const doc = this.el.ownerDocument;
    const handler = (ev) => {
      if (this.textMode !== "edit") return;
      const t = ev.target;
      if (!(t instanceof Node)) return;
      if (this.textEditEl.contains(t)) return;
      if (this.activeTextLayerId) {
        const hb = this.textHitEl.querySelector(
          `.zm-text-hitbox[data-id="${this.activeTextLayerId}"]`
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
    var _a, _b, _c;
    if (!this.data || !this.activeTextLayerId) return null;
    const layer = ((_a = this.data.textLayers) != null ? _a : []).find((l) => l.id === this.activeTextLayerId);
    if (!layer) return null;
    const ln = (_b = layer.lines) == null ? void 0 : _b[index];
    if (!ln) return null;
    return (_c = this.textInputs.get(ln.id)) != null ? _c : null;
  }
  focusNearestBaseline(layer, p) {
    var _a, _b;
    if (!((_a = layer.lines) == null ? void 0 : _a.length)) return;
    const py = p.y;
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < layer.lines.length; i += 1) {
      const ln = layer.lines[i];
      const y = (ln.y0 + ln.y1) / 2;
      const d = Math.abs(y - py);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    (_b = this.getTextInputByIndex(bestIdx)) == null ? void 0 : _b.focus();
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
    var _a, _b;
    const span = this.textMeasureSpan;
    if (!span) return text.length * ((_a = style.fontSize) != null ? _a : 14);
    span.style.fontFamily = style.fontFamily;
    span.style.fontSize = `${style.fontSize}px`;
    span.style.fontWeight = (_b = style.fontWeight) != null ? _b : "400";
    span.style.fontStyle = style.italic ? "italic" : "normal";
    span.style.letterSpacing = typeof style.letterSpacing === "number" ? `${style.letterSpacing}px` : "normal";
    span.textContent = text || "";
    return span.getBoundingClientRect().width;
  }
  lineCapacityPx(layer, ln) {
    var _a, _b;
    const st = layer.style;
    const ax0 = ln.x0 * this.imgW;
    const ay0 = ln.y0 * this.imgH;
    const ax1 = ln.x1 * this.imgW;
    const ay1 = ln.y1 * this.imgH;
    const len = Math.hypot(ax1 - ax0, ay1 - ay0);
    const cap = len - ((_a = st.padLeft) != null ? _a : 0) - ((_b = st.padRight) != null ? _b : 0);
    return Math.max(10, cap);
  }
  splitToFit(layer, ln, text) {
    const cap = this.lineCapacityPx(layer, ln);
    const st = layer.style;
    if (this.measureTextWidthPx(st, text) <= cap) return { fit: text, rest: "" };
    for (let i = text.length - 1; i >= 0; i -= 1) {
      if (text[i] !== " ") continue;
      const left = text.slice(0, i).trimEnd();
      const right = text.slice(i + 1).trimStart();
      if (!left) continue;
      if (this.measureTextWidthPx(st, left) <= cap) {
        return { fit: left, rest: right };
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
    return { fit, rest };
  }
  pullWord(text) {
    var _a, _b;
    const s = text.trimStart();
    if (!s) return null;
    const m = /^(\S+)\s*(.*)$/.exec(s);
    if (!m) return null;
    return { word: (_a = m[1]) != null ? _a : "", rest: (_b = m[2]) != null ? _b : "" };
  }
  reflowTextLayer(layer, startIndex, opts) {
    var _a, _b, _c, _d, _e;
    if (!((_a = layer.lines) == null ? void 0 : _a.length)) return {};
    let advance;
    for (let i = startIndex; i < layer.lines.length; i += 1) {
      const ln = layer.lines[i];
      const txt = (_b = ln.text) != null ? _b : "";
      const { fit, rest } = this.splitToFit(layer, ln, txt);
      if (!rest) {
        ln.text = fit;
        continue;
      }
      ln.text = fit;
      const next = layer.lines[i + 1];
      if (!next) {
        new import_obsidian13.Notice("No more baselines in this text layer.", 1500);
        continue;
      }
      const nextTxt = ((_c = next.text) != null ? _c : "").trimStart();
      next.text = (rest + (nextTxt ? " " + nextTxt : "")).trimEnd();
      if (!advance && i === startIndex && (opts == null ? void 0 : opts.advanceFocus)) {
        advance = { toIndex: i + 1, caret: rest.length };
      }
    }
    for (let i = startIndex; i < layer.lines.length - 1; i += 1) {
      const cur = layer.lines[i];
      const next = layer.lines[i + 1];
      if (!next) continue;
      while (true) {
        const pick = this.pullWord((_d = next.text) != null ? _d : "");
        if (!pick) break;
        const candidate = ((_e = cur.text) != null ? _e : "").trimEnd();
        const joined = candidate ? `${candidate} ${pick.word}` : pick.word;
        if (this.measureTextWidthPx(layer.style, joined) <= this.lineCapacityPx(layer, cur)) {
          cur.text = joined;
          next.text = pick.rest.trimStart();
        } else {
          break;
        }
      }
    }
    this.syncInputsFromLayer(layer);
    return { advance };
  }
  syncInputsFromLayer(layer) {
    var _a, _b, _c, _d;
    const active = this.el.ownerDocument.activeElement;
    for (const ln of (_a = layer.lines) != null ? _a : []) {
      const input = this.textInputs.get(ln.id);
      if (!input) continue;
      const want = (_b = ln.text) != null ? _b : "";
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
  onTextDrawLineClick(layer, ev) {
    var _a;
    if (!this.data) return;
    if (layer.locked) {
      new import_obsidian13.Notice("Text layer is locked.", 1500);
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
    const rect = layer.rect;
    const minX = Math.min(rect.x0, rect.x1);
    const maxX = Math.max(rect.x0, rect.x1);
    const minY = Math.min(rect.y0, rect.y1);
    const maxY = Math.max(rect.y0, rect.y1);
    let x0 = a.x;
    let y0 = a.y;
    let x1 = b.x;
    let y1 = b.y;
    const allowAngled = !!layer.allowAngledBaselines;
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
      new import_obsidian13.Notice("Baseline too short.", 1200);
      this.textLineStart = null;
      this.textLinePreview = null;
      this.renderTextDraft();
      return;
    }
    (_a = layer.lines) != null ? _a : layer.lines = [];
    layer.lines.push({
      id: generateId("tln"),
      x0,
      y0,
      x1,
      y1,
      text: ""
    });
    layer.lines.sort((u, v) => {
      const uy = (u.y0 + u.y1) / 2;
      const vy = (v.y0 + v.y1) / 2;
      return uy - vy || u.x0 - v.x0;
    });
    this.textLineStart = null;
    this.textLinePreview = null;
    void this.saveDataSoon();
    this.renderTextLayers();
  }
  startDrawNewTextLayer() {
    if (!this.data) return;
    if (!this.plugin.settings.enableTextLayers) {
      new import_obsidian13.Notice("Text layers are disabled in preferences.", 2500);
      return;
    }
    this.stopTextEdit(true);
    this.measuring = false;
    this.calibrating = false;
    this.drawingMode = null;
    this.textMode = "draw-layer";
    this.activeTextLayerId = null;
    this.textDrawStart = null;
    this.textDrawPreview = null;
    new import_obsidian13.Notice("Draw text layer: drag to create the box. Press esc to cancel.", 4500);
  }
  finishDrawNewTextLayer() {
    var _a, _b, _c, _d;
    if (!this.data || !this.textDrawStart || !this.textDrawPreview) return;
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
      new import_obsidian13.Notice("Text layer box too small.", 1500);
      return;
    }
    const idx = ((_b = (_a = this.data.textLayers) == null ? void 0 : _a.length) != null ? _b : 0) + 1;
    const layer = {
      id: generateId("txt"),
      name: `Text layer ${idx}`,
      locked: false,
      showGuides: true,
      rect,
      lines: [],
      allowAngledBaselines: false,
      style: this.defaultTextLayerStyle()
    };
    (_d = (_c = this.data).textLayers) != null ? _d : _c.textLayers = [];
    this.data.textLayers.push(layer);
    this.textMode = null;
    this.textDrawStart = null;
    this.textDrawPreview = null;
    this.renderTextLayers();
    void this.saveDataSoon();
    new TextLayerStyleModal(this.app, layer, (res) => {
      var _a2;
      if (res.action !== "save" || !this.data) return;
      if (res.applyStyleToAll) {
        for (const l of (_a2 = this.data.textLayers) != null ? _a2 : []) {
          l.style = { ...layer.style };
        }
      }
      void this.saveDataSoon();
      this.renderTextLayers();
    }).open();
  }
  renderMeasure() {
    if (!this.measureSvg) return;
    this.measureSvg.setAttribute("width", String(this.imgW));
    this.measureSvg.setAttribute("height", String(this.imgH));
    const pts = [...this.measurePts];
    if (this.measuring && this.measurePreview) pts.push(this.measurePreview);
    const toAbs = (p) => ({ x: p.x * this.imgW, y: p.y * this.imgH });
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
  renderCalibrate() {
    if (!this.measureSvg) return;
    const toAbs = (p) => ({ x: p.x * this.imgW, y: p.y * this.imgH });
    const pts = [...this.calibPts];
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
  clearMeasure() {
    this.measurePts = [];
    this.measurePreview = null;
    this.renderMeasure();
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
  getMetersPerPixel() {
    var _a;
    const base = this.getActiveBasePath();
    const m = (_a = this.data) == null ? void 0 : _a.measurement;
    if (!m) return void 0;
    if (m.scales && base in m.scales) return m.scales[base];
    return m.metersPerPixel;
  }
  ensureMeasurement() {
    var _a, _b, _c, _d, _e, _f;
    if (!this.data) return;
    (_b = (_a = this.data).measurement) != null ? _b : _a.measurement = { displayUnit: "auto-metric", metersPerPixel: void 0, scales: {} };
    (_d = (_c = this.data.measurement).scales) != null ? _d : _c.scales = {};
    (_f = (_e = this.data.measurement).displayUnit) != null ? _f : _e.displayUnit = "auto-metric";
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
    if (this.measurePts.length < 2 && !(this.measuring && this.measurePts.length >= 1 && this.measurePreview)) return null;
    const pts = [...this.measurePts];
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
  formatDistance(m) {
    var _a, _b, _c, _d;
    const meas = (_a = this.data) == null ? void 0 : _a.measurement;
    const unit = (_b = meas == null ? void 0 : meas.displayUnit) != null ? _b : "auto-metric";
    const round = (v, d = 2) => Math.round(v * 10 ** d) / 10 ** d;
    if (unit === "custom") {
      const defs = (_c = this.plugin.settings.customUnits) != null ? _c : [];
      if (defs.length === 0) {
        return `${round(m, 2)} u`;
      }
      const activeId = meas == null ? void 0 : meas.customUnitId;
      const def = (_d = activeId && defs.find((d) => d.id === activeId)) != null ? _d : defs[0];
      const val = m / (def.metersPerUnit || 1);
      const label = def.abbreviation || def.name || "u";
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
      case "auto-imperial": {
        const mi = m / 1609.344;
        return mi >= 0.25 ? `${round(mi, 2)} mi` : `${Math.round(m / 0.3048)} ft`;
      }
      case "auto-metric":
      default:
        return m >= 1e3 ? `${round(m / 1e3, 2)} km` : `${Math.round(m)} m`;
    }
  }
  resolveTFile(pathOrWiki, from) {
    const byPath = this.app.vault.getAbstractFileByPath(pathOrWiki);
    if (byPath instanceof import_obsidian13.TFile) return byPath;
    const dest = this.app.metadataCache.getFirstLinkpathDest(pathOrWiki, from);
    return dest instanceof import_obsidian13.TFile ? dest : null;
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
    this.updateHudPinsForResize(r);
    if (this.cfg.responsive) {
      this.fitToView();
      if (this.isCanvas()) this.renderCanvas();
      this.renderMarkersOnly();
      return;
    }
    this.applyTransform(this.scale, this.tx, this.ty, true);
    this.renderMarkersOnly();
    if (this.shouldUseSavedFrame() && this.cfg.resizable && this.cfg.resizeHandle === "native" && !this.userResizing) {
      if (!this.initialLayoutDone) this.initialLayoutDone = true;
      else if (this.isFrameVisibleEnough()) this.requestPersistFrame();
    }
  }
  onWheel(e) {
    var _a;
    if (!this.ready) return;
    const factor = (_a = this.plugin.settings.wheelZoomFactor) != null ? _a : 1.1;
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
    if (!this.ready) return;
    if (this.textMode === "draw-layer") {
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
    if (e.target instanceof Element && e.target.setPointerCapture) e.target.setPointerCapture(e.pointerId);
    const tgt = e.target;
    if (tgt instanceof Element && tgt.closest(".zm-marker")) return;
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
    this.lastPos = { x: e.clientX, y: e.clientY };
    this.viewDragDist = 0;
    this.viewDragMoved = false;
  }
  onPointerMove(e) {
    var _a, _b, _c;
    if (!this.ready) return;
    if (this.textMode === "draw-layer" && this.textDrawStart) {
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
      const off = (_a = this.dragAnchorOffset) != null ? _a : { dx: 0, dy: 0 };
      if (m.anchorSpace === "viewport") {
        const vw = vpRect.width || 1;
        const vh = vpRect.height || 1;
        const leftScreen = vx - off.dx;
        const topScreen = vy - off.dy;
        const prevX = (_b = m.hudX) != null ? _b : leftScreen;
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
    this.lastPos = { x: e.clientX, y: e.clientY };
    this.panAccDx += dx;
    this.panAccDy += dy;
    this.requestPanFrame();
  }
  onPointerUp() {
    var _a;
    if (this.textMode === "draw-layer" && this.textDrawStart && this.textDrawPreview) {
      this.finishDrawNewTextLayer();
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
      }
      const host = (_a = this.markersEl.querySelector(`.zm-marker[data-id="${draggedId}"]`)) != null ? _a : this.hudMarkersEl.querySelector(`.zm-marker[data-id="${draggedId}"]`);
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
  onDblClickViewport(e) {
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
  onClickViewport(e) {
    var _a, _b, _c;
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
        y: clamp(wy / this.imgH, 0, 1)
      };
      this.calibPts.push(p);
      if (this.calibPts.length === 2) {
        const pxDist = Math.hypot(
          (this.calibPts[1].x - this.calibPts[0].x) * this.imgW,
          (this.calibPts[1].y - this.calibPts[0].y) * this.imgH
        );
        const meas = (_a = this.data) == null ? void 0 : _a.measurement;
        let initialUnit;
        let customLabel;
        let customAbbr;
        let customMetersPerUnit;
        if ((meas == null ? void 0 : meas.displayUnit) === "custom") {
          const defs = (_b = this.plugin.settings.customUnits) != null ? _b : [];
          const def = (_c = meas.customUnitId && defs.find((d) => d.id === meas.customUnitId)) != null ? _c : defs[0];
          if (def) {
            initialUnit = "custom";
            customLabel = def.name;
            customAbbr = def.abbreviation;
            customMetersPerUnit = def.metersPerUnit;
          }
        } else if ((meas == null ? void 0 : meas.displayUnit) === "m" || (meas == null ? void 0 : meas.displayUnit) === "km" || (meas == null ? void 0 : meas.displayUnit) === "mi" || (meas == null ? void 0 : meas.displayUnit) === "ft") {
          initialUnit = meas.displayUnit;
        } else {
          initialUnit = "km";
        }
        new ScaleCalibrateModal(
          this.app,
          pxDist,
          (result) => {
            void this.applyScaleCalibration(result.metersPerPixel);
            new import_obsidian13.Notice(
              `Scale set: ${result.metersPerPixel.toFixed(6)} m/px`,
              2e3
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
            customMetersPerUnit
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
  getPreferredNewMarkerLayerId() {
    var _a, _b, _c, _d, _e, _f;
    if (!this.data || !this.data.layers || this.data.layers.length === 0) {
      return "default";
    }
    const prefer = !!this.plugin.settings.preferActiveLayerInEditor;
    if (prefer) {
      return (_d = (_c = (_a = this.data.layers.find((l) => l.visible && !l.locked)) == null ? void 0 : _a.id) != null ? _c : (_b = this.data.layers.find((l) => l.visible)) == null ? void 0 : _b.id) != null ? _d : this.data.layers[0].id;
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
  getActiveBasePath() {
    var _a, _b;
    if (!this.data) return this.cfg.imagePath;
    return (_b = (_a = this.data.activeBase) != null ? _a : this.data.image) != null ? _b : this.cfg.imagePath;
  }
  getCollectionsSplitForActive() {
    var _a;
    const all = ((_a = this.plugin.settings.baseCollections) != null ? _a : []).filter(Boolean);
    const active = this.getActiveBasePath();
    const matches = (c) => {
      var _a2, _b;
      return ((_b = (_a2 = c.bindings) == null ? void 0 : _a2.basePaths) != null ? _b : []).some((p) => p === active);
    };
    const isGlobal = (c) => {
      var _a2, _b;
      return !c.bindings || ((_b = (_a2 = c.bindings.basePaths) == null ? void 0 : _a2.length) != null ? _b : 0) === 0;
    };
    const matched = all.filter(matches);
    const globals = all.filter(isGlobal);
    return { matched, globals };
  }
  computeCollectionSets() {
    const { matched, globals } = this.getCollectionsSplitForActive();
    const pinsBase = [...new Set(matched.flatMap((c) => {
      var _a, _b;
      return (_b = (_a = c.include) == null ? void 0 : _a.pinKeys) != null ? _b : [];
    }))];
    const favsBase = [];
    matched.forEach(
      (c) => {
        var _a, _b;
        return ((_b = (_a = c.include) == null ? void 0 : _a.favorites) != null ? _b : []).forEach((f) => favsBase.push(f));
      }
    );
    const stickersBase = [];
    matched.forEach(
      (c) => {
        var _a, _b;
        return ((_b = (_a = c.include) == null ? void 0 : _a.stickers) != null ? _b : []).forEach((s) => stickersBase.push(s));
      }
    );
    const pinsGlobal = [...new Set(globals.flatMap((c) => {
      var _a, _b;
      return (_b = (_a = c.include) == null ? void 0 : _a.pinKeys) != null ? _b : [];
    }))];
    const favsGlobal = [];
    globals.forEach(
      (c) => {
        var _a, _b;
        return ((_b = (_a = c.include) == null ? void 0 : _a.favorites) != null ? _b : []).forEach((f) => favsGlobal.push(f));
      }
    );
    const stickersGlobal = [];
    globals.forEach(
      (c) => {
        var _a, _b;
        return ((_b = (_a = c.include) == null ? void 0 : _a.stickers) != null ? _b : []).forEach((s) => stickersGlobal.push(s));
      }
    );
    const swapBase = [];
    matched.forEach(
      (c) => {
        var _a, _b;
        return ((_b = (_a = c.include) == null ? void 0 : _a.swapPins) != null ? _b : []).forEach((sp) => swapBase.push(sp));
      }
    );
    const swapGlobal = [];
    globals.forEach(
      (c) => {
        var _a, _b;
        return ((_b = (_a = c.include) == null ? void 0 : _a.swapPins) != null ? _b : []).forEach((sp) => swapGlobal.push(sp));
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
      swapGlobal
    };
  }
  findSwapPresetById(id) {
    var _a, _b, _c;
    const cols = (_a = this.plugin.settings.baseCollections) != null ? _a : [];
    for (const col of cols) {
      const list = (_c = (_b = col.include) == null ? void 0 : _b.swapPins) != null ? _c : [];
      const found = list.find((sp) => sp.id === id);
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
    const layerId = this.getPreferredNewMarkerLayerId();
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
    new import_obsidian13.Notice("Swap pin added.", 900);
  }
  onContextMenuViewport(e) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
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
    const baseItems = bases.map((b) => {
      var _a2;
      return {
        label: (_a2 = b.name) != null ? _a2 : basename(b.path),
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
          }).catch((err) => {
            console.error("Set base failed:", err);
            new import_obsidian13.Notice("Failed to set base image.", 2500);
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
    const meas = this.data.measurement;
    const currentUnit = (_b = meas == null ? void 0 : meas.displayUnit) != null ? _b : "auto-metric";
    const currentCustomId = meas == null ? void 0 : meas.customUnitId;
    const unitItems = [
      {
        label: "Auto (m/km)",
        checked: currentUnit === "auto-metric",
        action: () => {
          var _a2;
          this.ensureMeasurement();
          if ((_a2 = this.data) == null ? void 0 : _a2.measurement) {
            this.data.measurement.displayUnit = "auto-metric";
            delete this.data.measurement.customUnitId;
            void this.saveDataSoon();
            this.updateMeasureHud();
          }
          this.closeMenu();
        }
      },
      {
        label: "Auto (mi/ft)",
        checked: currentUnit === "auto-imperial",
        action: () => {
          var _a2;
          this.ensureMeasurement();
          if ((_a2 = this.data) == null ? void 0 : _a2.measurement) {
            this.data.measurement.displayUnit = "auto-imperial";
            delete this.data.measurement.customUnitId;
            void this.saveDataSoon();
            this.updateMeasureHud();
          }
          this.closeMenu();
        }
      },
      {
        label: "m",
        checked: currentUnit === "m",
        action: () => {
          var _a2;
          this.ensureMeasurement();
          if ((_a2 = this.data) == null ? void 0 : _a2.measurement) {
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
          var _a2;
          this.ensureMeasurement();
          if ((_a2 = this.data) == null ? void 0 : _a2.measurement) {
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
          var _a2;
          this.ensureMeasurement();
          if ((_a2 = this.data) == null ? void 0 : _a2.measurement) {
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
          var _a2;
          this.ensureMeasurement();
          if ((_a2 = this.data) == null ? void 0 : _a2.measurement) {
            this.data.measurement.displayUnit = "ft";
            delete this.data.measurement.customUnitId;
            void this.saveDataSoon();
            this.updateMeasureHud();
          }
          this.closeMenu();
        }
      }
    ];
    const customDefs = (_c = this.plugin.settings.customUnits) != null ? _c : [];
    if (customDefs.length > 0) {
      unitItems.push({ type: "separator" });
      for (const def of customDefs) {
        const isActive = currentUnit === "custom" && currentCustomId === def.id;
        unitItems.push({
          label: def.abbreviation ? `${def.name} (${def.abbreviation})` : def.name,
          checked: isActive,
          action: () => {
            var _a2;
            this.ensureMeasurement();
            if ((_a2 = this.data) == null ? void 0 : _a2.measurement) {
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
      swapGlobal
    } = this.computeCollectionSets();
    const pinItemFromKey = (key) => {
      const info = this.getIconInfo(key);
      if (!info) return null;
      return {
        label: key || "(pin)",
        iconUrl: info.imgUrl,
        action: () => {
          this.placePinAt(key, nx, ny);
          this.closeMenu();
        }
      };
    };
    const pinsBaseMenu = pinsBase.map(pinItemFromKey).filter((x) => !!x);
    const pinsGlobalMenu = pinsGlobal.map(pinItemFromKey).filter((x) => !!x);
    const favItems = (arr) => arr.map((p) => {
      const ico = this.getIconInfo(p.iconKey);
      return {
        label: p.name || "(favorite)",
        iconUrl: ico.imgUrl,
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
        children: favsGlobalMenu
      });
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
    const items = [
      { label: "Add marker here", children: addHereChildren }
    ];
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
      var _a2;
      const b = bases.find((bb) => bb.path === p);
      return b ? (_a2 = b.name) != null ? _a2 : basename(b.path) : basename(p);
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
            var _a2;
            return {
              label: (_a2 = b.name) != null ? _a2 : basename(b.path),
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
    if (this.plugin.settings.enableDrawing) {
      drawLayerChildren.push(
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
              var _a2;
              if (!this.data) return;
              const count = ((_a2 = this.data.drawings) != null ? _a2 : []).filter(
                (d) => d.layerId === dl.id
              ).length;
              const msg = count > 0 ? `Delete draw layer "${dl.name}" and ${count} drawings on it?` : `Delete draw layer "${dl.name}"?`;
              new ConfirmModal(this.app, "Delete draw layer", msg, () => {
                var _a3, _b2;
                if (!this.data) return;
                this.data.drawLayers = ((_a3 = this.data.drawLayers) != null ? _a3 : []).filter(
                  (l) => l.id !== dl.id
                );
                this.data.drawings = ((_b2 = this.data.drawings) != null ? _b2 : []).filter(
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
                var _a2, _b2;
                if (!this.data) return;
                const name = (value || baseName).trim() || baseName;
                const id = generateId("draw");
                (_b2 = (_a2 = this.data).drawLayers) != null ? _b2 : _a2.drawLayers = [];
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
    if (this.plugin.settings.enableDrawing) {
      imageLayersChildren.push({
        label: "Draw layers",
        children: drawLayerChildren
      });
    }
    imageLayersChildren.push(
      { type: "separator" },
      {
        label: "Delete base\u2026",
        children: bases.map((b) => {
          var _a2;
          return {
            label: (_a2 = b.name) != null ? _a2 : basename(b.path),
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
          var _a2;
          return {
            label: (_a2 = o.name) != null ? _a2 : basename(o.path),
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
                new import_obsidian13.Notice("Calibration: click two points.", 1500);
              }
              this.closeMenu();
            }
          }
        ]
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
                const others = this.data.layers.filter((x) => x.id !== l.id);
                if (others.length === 0) {
                  new import_obsidian13.Notice("Cannot delete the last layer.", 2e3);
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
      const textLayerItems = ((_g = this.data.textLayers) != null ? _g : []).map((tl) => ({
        label: tl.name || "(text layer)",
        children: [
          {
            label: "Edit\u2026",
            action: () => {
              if (tl.locked) {
                new import_obsidian13.Notice("Text layer is locked.", 1500);
                return;
              }
              new TextLayerStyleModal(this.app, tl, (res) => {
                var _a2;
                if (res.action !== "save" || !this.data) return;
                if (res.applyStyleToAll) {
                  for (const l of (_a2 = this.data.textLayers) != null ? _a2 : []) {
                    l.style = { ...tl.style };
                  }
                }
                void this.saveDataSoon();
                this.renderTextLayers();
                if (this.textMode === "edit" && this.activeTextLayerId === tl.id) {
                  this.startTextEdit(tl.id);
                }
              }).open();
              this.closeMenu();
            }
          },
          {
            label: "Lock",
            checked: !!tl.locked,
            action: (rowEl) => {
              tl.locked = !tl.locked;
              void this.saveDataSoon();
              if (tl.locked && this.textMode === "edit" && this.activeTextLayerId === tl.id) {
                this.stopTextEdit(true);
              }
              const chk = rowEl.querySelector(".zm-menu__check");
              if (chk) chk.textContent = tl.locked ? "\u2713" : "";
            }
          },
          { type: "separator" },
          {
            label: "Draw lines",
            action: () => {
              if (tl.locked) {
                new import_obsidian13.Notice("Text layer is locked.", 1500);
                return;
              }
              this.stopTextEdit(true);
              this.textMode = "draw-lines";
              this.activeTextLayerId = tl.id;
              this.textLineStart = null;
              this.textLinePreview = null;
              this.renderTextLayers();
              new import_obsidian13.Notice(
                "Draw baselines: click start + end. Hold ctrl for free angle (if enabled). Esc to exit.",
                6e3
              );
              this.closeMenu();
            }
          }
        ]
      }));
      const deleteChildren = ((_h = this.data.textLayers) != null ? _h : []).length > 0 ? ((_i = this.data.textLayers) != null ? _i : []).map((tl) => ({
        label: tl.name || "(text layer)",
        action: () => {
          new ConfirmModal(
            this.app,
            "Delete text layer",
            `Delete text layer "${tl.name || tl.id}"? This cannot be undone.`,
            () => {
              var _a2;
              if (!this.data) return;
              if (this.textMode === "edit" && this.activeTextLayerId === tl.id) {
                this.stopTextEdit(false);
              }
              this.data.textLayers = ((_a2 = this.data.textLayers) != null ? _a2 : []).filter((x) => x.id !== tl.id);
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
                this.startDrawNewTextLayer();
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
              var _a2;
              if (!this.data) return;
              const current = (_a2 = this.data.panClamp) != null ? _a2 : true;
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
          }
        ]
      }
    );
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
  closeMenu() {
    if (this.openMenu) {
      this.openMenu.destroy();
      this.openMenu = null;
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
  applyTransform(scale, tx, ty, render = true) {
    var _a, _b;
    const prevScale = this.scale;
    const s = clamp(scale, this.cfg.minZoom, this.cfg.maxZoom);
    const scaledW = this.imgW * s;
    const scaledH = this.imgH * s;
    const clampPan = (_b = (_a = this.data) == null ? void 0 : _a.panClamp) != null ? _b : true;
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
      }
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
    if (!this.imgW || !this.imgH) return;
    const s = Math.min(this.vw / this.imgW, this.vh / this.imgH);
    const scale = clamp(s, this.cfg.minZoom, this.cfg.maxZoom);
    const tx = (this.vw - this.imgW * scale) / 2;
    const ty = (this.vh - this.imgH * scale) / 2;
    this.applyTransform(scale, tx, ty);
  }
  updateMarkerInvScaleOnly() {
    const invScale = this.cfg.responsive ? 1 : 1 / this.scale;
    const invs = this.markersEl.querySelectorAll(".zm-marker-inv");
    invs.forEach((el) => {
      el.style.transform = `scale(${invScale})`;
    });
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
        const max = hasMax ? Number.parseFloat(maxStr) : void 0;
        const visible = (!hasMin || Number.isFinite(min) && s >= min) && (!hasMax || Number.isFinite(max) && s <= max);
        if (visible) el.classList.remove("zm-hidden");
        else el.classList.add("zm-hidden");
      });
    };
    updateContainer(this.markersEl);
    updateContainer(this.hudMarkersEl);
  }
  getBasesNormalized() {
    var _a, _b, _c;
    const raw = (_b = (_a = this.data) == null ? void 0 : _a.bases) != null ? _b : [];
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
        new import_obsidian13.Notice("Marker added.", 900);
        this.renderMarkersOnly();
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
          new import_obsidian13.Notice("Marker added.", 900);
        }
      });
      modal.open();
    } else {
      this.data.markers.push(draft);
      void this.saveDataSoon();
      this.renderMarkersOnly();
      new import_obsidian13.Notice("Marker added.", 900);
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
            new import_obsidian13.Notice("Hud pin added.", 900);
          }
        }
      );
      modal.open();
    } else {
      this.data.markers.push(draft);
      void this.saveDataSoon();
      this.renderMarkersOnly();
      new import_obsidian13.Notice("Hud pin added.", 900);
    }
  }
  placePresetAt(p, nx, ny, overrideLayerId) {
    var _a, _b, _c;
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
      link: (_a = p.linkTemplate) != null ? _a : "",
      iconKey: (_b = p.iconKey) != null ? _b : this.plugin.settings.defaultIconKey,
      tooltip: (_c = p.tooltip) != null ? _c : "",
      scaleLikeSticker: this.plugin.settings.defaultScaleLikeSticker ? true : void 0
    };
    if (p.openEditor) {
      const modal = new MarkerEditorModal(this.app, this.plugin, this.data, draft, (res) => {
        if (res.action === "save" && res.marker && this.data) {
          this.data.markers.push(res.marker);
          void this.saveDataSoon();
          this.renderMarkersOnly();
          new import_obsidian13.Notice("Marker added (favorite).", 900);
        }
      });
      modal.open();
    } else {
      this.data.markers.push(draft);
      void this.saveDataSoon();
      this.renderMarkersOnly();
      new import_obsidian13.Notice("Marker added (favorite).", 900);
    }
  }
  placeStickerPresetAt(p, nx, ny) {
    var _a;
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
      stickerSize: Math.max(1, Math.round((_a = p.size) != null ? _a : 64))
    };
    if (p.openEditor) {
      const modal = new MarkerEditorModal(this.app, this.plugin, this.data, draft, (res) => {
        if (res.action === "save" && res.marker && this.data) {
          this.data.markers.push(res.marker);
          void this.saveDataSoon();
          this.renderMarkersOnly();
          new import_obsidian13.Notice("Sticker added.", 900);
        }
      });
      modal.open();
    } else {
      this.data.markers.push(draft);
      void this.saveDataSoon();
      this.renderMarkersOnly();
      new import_obsidian13.Notice("Sticker added.", 900);
    }
  }
  deleteMarker(m) {
    if (!this.data) return;
    this.data.markers = this.data.markers.filter((mm) => mm.id !== m.id);
    void this.saveDataSoon();
    this.renderMarkersOnly();
    new import_obsidian13.Notice("Marker deleted.", 900);
  }
  openPinSizeEditor(focusIconKey) {
    var _a, _b, _c;
    if (!this.data) return;
    const usedKeys = /* @__PURE__ */ new Set();
    for (const m of this.data.markers) {
      if (m.type === "sticker") continue;
      const key = (_a = m.iconKey) != null ? _a : this.plugin.settings.defaultIconKey;
      usedKeys.add(key);
    }
    if (usedKeys.size === 0) {
      new import_obsidian13.Notice("No pins on this map yet.", 2e3);
      return;
    }
    const rows = [];
    for (const key of usedKeys) {
      const profile = (_b = this.plugin.settings.icons.find((i) => i.key === key)) != null ? _b : this.plugin.builtinIcon();
      const baseSize = profile.size;
      const override = (_c = this.data.pinSizeOverrides) == null ? void 0 : _c[key];
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
        var _a2, _b2;
        if (!this.data) return;
        (_b2 = (_a2 = this.data).pinSizeOverrides) != null ? _b2 : _a2.pinSizeOverrides = {};
        const existing = this.data.pinSizeOverrides;
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
  renderDrawings() {
    var _a, _b, _c, _d, _e;
    if (!this.drawSvg || !this.drawStaticLayer || !this.drawDefs) return;
    this.drawSvg.setAttribute("width", String(this.imgW));
    this.drawSvg.setAttribute("height", String(this.imgH));
    while (this.drawStaticLayer.firstChild) {
      this.drawStaticLayer.removeChild(this.drawStaticLayer.firstChild);
    }
    while (this.drawDefs.firstChild) {
      this.drawDefs.removeChild(this.drawDefs.firstChild);
    }
    if (!this.data || !Array.isArray(this.data.drawings) || this.data.drawings.length === 0) {
      return;
    }
    const visibleDrawLayers = new Set(
      ((_a = this.data.drawLayers) != null ? _a : []).filter((l) => l.visible).map((l) => l.id)
    );
    const toAbs = (nx, ny) => ({
      x: nx * this.imgW,
      y: ny * this.imgH
    });
    const ns = "http://www.w3.org/2000/svg";
    for (const d of this.data.drawings) {
      if (!d.visible) continue;
      if (!visibleDrawLayers.has(d.layerId)) continue;
      const style = (_b = d.style) != null ? _b : {};
      let shape = null;
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
        if (Number.isFinite(minPx) && Number.isFinite(maxPx) && Number.isFinite(minPy) && Number.isFinite(maxPy)) {
          minX = minPx;
          minY = minPy;
          width = maxPx - minPx;
          height = maxPy - minPy;
        }
      }
      if (!shape || width <= 0 || height <= 0) continue;
      const handleCtx = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        this.onDrawingContextMenu(ev, d);
      };
      const patternKind = (_c = style.fillPattern) != null ? _c : style.fillColor ? "solid" : "none";
      if (patternKind === "striped" || patternKind === "cross" || patternKind === "wavy") {
        const af = d.bakedPath ? this.app.vault.getAbstractFileByPath(d.bakedPath) : null;
        if (!d.bakedPath || !(af instanceof import_obsidian13.TFile)) {
          void this.bakePatternSvgToFile(d, {
            minX,
            minY,
            width,
            height
          });
        }
      }
      let patternHref = null;
      if (patternKind === "striped" || patternKind === "cross" || patternKind === "wavy") {
        if (d.bakedPath) {
          const af = this.app.vault.getAbstractFileByPath(d.bakedPath);
          if (af instanceof import_obsidian13.TFile) {
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
        const fillColor = (_d = style.fillColor) != null ? _d : "none";
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
      const strokeColor = ((_e = style.strokeColor) != null ? _e : "#ff0000").trim() || "#ff0000";
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
      outline.addEventListener("contextmenu", handleCtx);
      this.drawStaticLayer.appendChild(outline);
    }
  }
  buildPatternSvgMarkup(d, box) {
    var _a, _b, _c;
    const style = (_a = d.style) != null ? _a : {};
    const patternKind = (_b = style.fillPattern) != null ? _b : style.fillColor ? "solid" : "none";
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
      for (let x = minX - width; x <= maxX + width; x += spacing) {
        if (patternKind === "striped") {
          const xf = x.toFixed(2);
          stripeContent += `<line x1="${xf}" y1="${(minY - height).toFixed(
            2
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
              2
            )} ${ctrlX.toFixed(2)} ${midY.toFixed(2)} ${xf} ${y.toFixed(2)}`;
          }
          stripeContent += `<path d="${dPath}" />`;
        }
      }
    } else if (patternKind === "cross") {
      for (let x = minX - width; x <= maxX + width; x += spacing) {
        const xf = x.toFixed(2);
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
    var _a;
    const svg = this.buildPatternSvgMarkup(d, box);
    if (!svg) return;
    const vault = this.app.vault;
    const folder = "ZoomMap/draw-overlays";
    if (!vault.getAbstractFileByPath(folder)) {
      await vault.createFolder(folder);
    }
    const mapId = (_a = this.cfg.mapId) != null ? _a : this.cfg.sourcePath.replace(/[\\/]/g, "_").replace(/[^\w.-]/g, "_");
    const fileName = `${mapId}-${d.id}.svg`;
    const fullPath = `${folder}/${fileName}`;
    const existing = vault.getAbstractFileByPath(fullPath);
    if (existing instanceof import_obsidian13.TFile) {
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
    var _a;
    if (!this.data) return;
    if (d.bakedPath) {
      const af = this.app.vault.getAbstractFileByPath(d.bakedPath);
      if (af instanceof import_obsidian13.TFile) {
        try {
          await this.app.fileManager.trashFile(af, true);
        } catch (err) {
          console.error("Zoom Map: failed to delete baked SVG", d.bakedPath, err);
        }
      }
    }
    this.data.drawings = ((_a = this.data.drawings) != null ? _a : []).filter((x) => x.id !== d.id);
    await this.saveDataSoon();
    this.renderDrawings();
    new import_obsidian13.Notice("Drawing deleted.", 900);
  }
  onDrawingContextMenu(ev, d) {
    this.closeMenu();
    const items = [
      {
        label: "Edit drawing\u2026",
        action: () => {
          this.closeMenu();
          if (!this.data) return;
          const modal = new DrawingEditorModal(this.app, d, (res) => {
            var _a;
            if (!this.data) return;
            if (res.action === "save" && res.drawing) {
              const updated = res.drawing;
              const idx = ((_a = this.data.drawings) != null ? _a : []).findIndex(
                (x) => x.id === d.id
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
        }
      },
      {
        label: "Delete drawing",
        action: () => {
          void this.deleteDrawing(d);
        }
      }
    ];
    this.openMenu = new ZMMenu(this.el.ownerDocument);
    this.openMenu.open(ev.clientX, ev.clientY, items);
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
    document.addEventListener("pointerdown", outside, { capture: true });
    document.addEventListener("contextmenu", rightClickClose, { capture: true });
    document.addEventListener("keydown", keyClose, { capture: true });
    this.register(() => {
      document.removeEventListener("pointerdown", outside, true);
      document.removeEventListener("contextmenu", rightClickClose, true);
      document.removeEventListener("keydown", keyClose, true);
    });
  }
  getOrCreateDefaultDrawLayer() {
    var _a, _b, _c;
    if (!this.data) {
      throw new Error("No marker data loaded");
    }
    (_b = (_a = this.data).drawLayers) != null ? _b : _a.drawLayers = [];
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
    var _a;
    if (!this.drawingMode) return false;
    if (!this.data) return false;
    const vpRect = this.viewportEl.getBoundingClientRect();
    const vx = e.clientX - vpRect.left;
    const vy = e.clientY - vpRect.top;
    const wx = (vx - this.tx) / this.scale;
    const wy = (vy - this.ty) / this.scale;
    const nx = clamp(wx / this.imgW, 0, 1);
    const ny = clamp(wy / this.imgH, 0, 1);
    const layerId = (_a = this.drawingActiveLayerId) != null ? _a : this.getOrCreateDefaultDrawLayer().id;
    if (this.drawingMode === "polygon" && e.detail > 1) {
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
      const modal = new DrawingEditorModal(this.app, draft, (res) => {
        var _a2, _b;
        if (!this.data) return;
        if (res.action === "save" && res.drawing) {
          (_b = (_a2 = this.data).drawings) != null ? _b : _a2.drawings = [];
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
      const modal = new DrawingEditorModal(this.app, draft, (res) => {
        var _a2, _b;
        if (!this.data) return;
        if (res.action === "save" && res.drawing) {
          (_b = (_a2 = this.data).drawings) != null ? _b : _a2.drawings = [];
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
  finishPolygonDrawing() {
    var _a;
    if (!this.drawingMode || this.drawingMode !== "polygon") return;
    if (!this.data) return;
    if (this.drawPolygonPoints.length < 2) return;
    const layerId = (_a = this.drawingActiveLayerId) != null ? _a : this.getOrCreateDefaultDrawLayer().id;
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
    const modal = new DrawingEditorModal(this.app, draft, (res) => {
      var _a2, _b;
      if (!this.data) return;
      if (res.action === "save" && res.drawing) {
        (_b = (_a2 = this.data).drawings) != null ? _b : _a2.drawings = [];
        this.data.drawings.push(res.drawing);
        void this.saveDataSoon();
        this.renderDrawings();
      }
    });
    modal.open();
  }
  updateDrawPreview(e) {
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
    this.renderCalibrate();
    this.renderDrawings();
    if (this.isCanvas()) this.renderCanvas();
    this.renderTextLayers();
  }
  renderMarkersOnly() {
    var _a, _b, _c, _d, _e, _f, _g;
    if (!this.data) return;
    const s = this.scale;
    this.markersEl.empty();
    if (this.hudMarkersEl) this.hudMarkersEl.empty();
    const visibleLayers = new Set(
      this.data.layers.filter((l) => l.visible).map((l) => l.id)
    );
    const rank = (m) => m.type === "sticker" ? 0 : 1;
    const toRender = this.data.markers.filter((m) => visibleLayers.has(m.layer)).sort((a, b) => rank(a) - rank(b));
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
        const hx = (_b = m.hudX) != null ? _b : ((_a = m.x) != null ? _a : 0.5) * vw;
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
        const info = this.getIconInfo(effectiveKey);
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
        var _a2;
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
        document.body.classList.add("zm-cursor-grabbing");
        (_a2 = host.setPointerCapture) == null ? void 0 : _a2.call(host, e.pointerId);
        e.preventDefault();
      });
      host.addEventListener("pointerup", () => {
        if (this.draggingMarkerId === m.id) {
          host.classList.remove("zm-marker--dragging");
          document.body.classList.remove("zm-cursor-grabbing");
        }
      });
      host.addEventListener("contextmenu", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        this.closeMenu();
        if (m.type === "swap") {
          const preset = m.swapKey ? this.findSwapPresetById(m.swapKey) : void 0;
          if (!preset) return;
          if (!ev.altKey) {
            this.advanceSwapPin(m);
            void this.saveDataSoon();
            this.renderMarkersOnly();
            return;
          }
          const items2 = [
            {
              label: "Edit swap pin",
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
          ];
          this.openMenu = new ZMMenu(this.el.ownerDocument);
          this.openMenu.open(ev.clientX, ev.clientY, items2);
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
          document.addEventListener("pointerdown", outside2, {
            capture: true
          });
          document.addEventListener("contextmenu", rightClickClose2, {
            capture: true
          });
          document.addEventListener("keydown", keyClose2, { capture: true });
          this.register(() => {
            document.removeEventListener("pointerdown", outside2, true);
            document.removeEventListener("contextmenu", rightClickClose2, true);
            document.removeEventListener("keydown", keyClose2, true);
          });
          return;
        }
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
        ];
        if (m.type !== "sticker") {
          items.push({
            label: "Pin sizes for this map\u2026",
            action: () => {
              var _a2;
              const key = (_a2 = m.iconKey) != null ? _a2 : this.plugin.settings.defaultIconKey;
              this.openPinSizeEditor(key);
              this.closeMenu();
            }
          });
        }
        this.openMenu = new ZMMenu(this.el.ownerDocument);
        this.openMenu.open(ev.clientX, ev.clientY, items);
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
  onMarkerEnter(ev, m, hostEl) {
    if (m.type === "sticker") return;
    let link;
    let hoverOverride = false;
    if (m.type === "swap") {
      const frame = this.getSwapFrameForMarker(m);
      link = frame == null ? void 0 : frame.link;
      if (m.swapKey) {
        const preset = this.findSwapPresetById(m.swapKey);
        hoverOverride = !!(preset == null ? void 0 : preset.hoverPopover);
      }
    } else {
      link = m.link;
    }
    const hasTooltipText = !!m.tooltip && m.tooltip.trim().length > 0;
    const wantInternalTooltip = hasTooltipText && (!!m.tooltipAlwaysOn || !link);
    if (link) {
      const workspace = this.app.workspace;
      const forcePopover = this.plugin.settings.forcePopoverWithoutModKey || hoverOverride;
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
        this.showInternalTooltip(ev, m);
      }
      return;
    }
    if (wantInternalTooltip) {
      this.showInternalTooltip(ev, m);
    }
  }
  showInternalTooltip(ev, m) {
    var _a, _b, _c;
    if (!this.ready) return;
    const text = ((_a = m.tooltip) != null ? _a : "").trim();
    if (!text) return;
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
    this.tooltipEl.style.maxWidth = `${(_b = this.plugin.settings.hoverMaxWidth) != null ? _b : 360}px`;
    this.tooltipEl.style.maxHeight = `${(_c = this.plugin.settings.hoverMaxHeight) != null ? _c : 260}px`;
    this.cancelHideTooltip();
    this.tooltipEl.empty();
    this.tooltipEl.createEl("div", { text });
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
    setCssProps(this.tooltipEl, { left: `${x}px`, top: `${y}px` });
  }
  hideTooltipSoon(delay = 150) {
    if (!this.tooltipEl) return;
    this.cancelHideTooltip();
    this.tooltipHideTimer = window.setTimeout(() => {
      var _a;
      (_a = this.tooltipEl) == null ? void 0 : _a.classList.remove("zm-tooltip-visible");
    }, delay);
  }
  cancelHideTooltip() {
    if (this.tooltipHideTimer !== null) {
      window.clearTimeout(this.tooltipHideTimer);
      this.tooltipHideTimer = null;
    }
  }
  getIconInfo(iconKey) {
    var _a, _b, _c, _d;
    const key = iconKey != null ? iconKey : this.plugin.settings.defaultIconKey;
    const profile = (_a = this.plugin.settings.icons.find((i) => i.key === key)) != null ? _a : this.plugin.builtinIcon();
    const baseSize = profile.size;
    const overrideSize = (_c = (_b = this.data) == null ? void 0 : _b.pinSizeOverrides) == null ? void 0 : _c[key];
    const size = overrideSize && Number.isFinite(overrideSize) && overrideSize > 0 ? overrideSize : baseSize;
    const imgUrl = this.resolveResourceUrl(profile.pathOrDataUrl);
    const rotationDeg = (_d = profile.rotationDeg) != null ? _d : 0;
    return {
      imgUrl,
      size,
      anchorX: profile.anchorX,
      anchorY: profile.anchorY,
      rotationDeg
    };
  }
  getIconDefaultLink(iconKey) {
    const key = iconKey != null ? iconKey : this.plugin.settings.defaultIconKey;
    const icon = this.plugin.settings.icons.find((i) => i.key === key);
    const raw = icon == null ? void 0 : icon.defaultLink;
    if (!raw) return void 0;
    const trimmed = raw.trim();
    return trimmed.length ? trimmed : void 0;
  }
  classifyHudMetaFromCurrentPosition(m, vpRect) {
    var _a, _b;
    const W = vpRect.width || 1;
    const H = vpRect.height || 1;
    const centerX = W / 2;
    const centerY = H / 2;
    const eps = 1;
    let hudX = (_a = m.hudX) != null ? _a : 0;
    let hudY = (_b = m.hudY) != null ? _b : 0;
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
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
    if (!this.data) return;
    const W = vpRect.width || 1;
    const H = vpRect.height || 1;
    const centerX = W / 2;
    const centerY = H / 2;
    for (const m of this.data.markers) {
      if (m.anchorSpace !== "viewport") continue;
      if (!Number.isFinite((_a = m.hudLastWidth) != null ? _a : NaN) || !Number.isFinite((_b = m.hudLastHeight) != null ? _b : NaN)) {
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
  openMarkerLink(m) {
    let link = m.link;
    if (m.type === "swap") {
      const frame = this.getSwapFrameForMarker(m);
      link = frame == null ? void 0 : frame.link;
    }
    if (!link) return;
    void this.app.workspace.openLinkText(link, this.cfg.sourcePath);
  }
  async setActiveBase(path) {
    if (!this.data) return;
    if (this.currentBasePath === path && this.imgW > 0 && this.imgH > 0) return;
    this.data.activeBase = path;
    this.data.image = path;
    if (this.isCanvas()) {
      await this.loadBaseBitmapByPath(path);
    } else {
      const file = this.resolveTFile(path, this.cfg.sourcePath);
      if (!file) {
        new import_obsidian13.Notice(`Base image not found: ${path}`);
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
    var _a;
    if (this.isCanvas()) return;
    this.overlayMap.clear();
    this.overlaysEl.empty();
    if (!this.data) return;
    const mkImgEl = (url) => {
      const el = this.overlaysEl.createEl("img", { cls: "zm-overlay-image" });
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
      void pre.decode().catch((error) => {
        console.error("Zoom Map: overlay decode error", error);
      }).finally(() => {
        const el = mkImgEl(url);
        if (!o.visible) el.classList.add("zm-overlay-hidden");
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
      this.renderMeasure();
      this.renderCalibrate();
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      new import_obsidian13.Notice(`Failed to reload markers: ${message}`);
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
  shouldUseSavedFrame() {
    var _a, _b;
    return !!this.cfg.resizable && !(((_a = this.cfg.widthFromYaml) != null ? _a : false) || ((_b = this.cfg.heightFromYaml) != null ? _b : false)) && !this.cfg.responsive;
  }
  isFrameVisibleEnough(minPx = 48) {
    var _a;
    if (!((_a = this.el) == null ? void 0 : _a.isConnected)) return false;
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
    const wNow = this.el.offsetWidth;
    const hNow = this.el.offsetHeight;
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
    var _a, _b;
    const color = ((_a = this.plugin.settings.measureLineColor) != null ? _a : "var(--text-accent)").trim();
    const widthPx = Math.max(1, (_b = this.plugin.settings.measureLineWidth) != null ? _b : 2);
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
      var _a;
      (_a = this.zoomHud) == null ? void 0 : _a.classList.remove("zm-zoom-hud-visible");
      this.zoomHudTimer = null;
    }, 5e3);
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
    var _a, _b;
    if (this.yamlAppliedOnce) return;
    this.yamlAppliedOnce = true;
    const yb = (_a = this.cfg.yamlBases) != null ? _a : [];
    const yo = (_b = this.cfg.yamlOverlays) != null ? _b : [];
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
      if (typeof this.cfg.sectionStart !== "number" || typeof this.cfg.sectionEnd !== "number") return false;
      const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
      if (!(af instanceof import_obsidian13.TFile)) return false;
      const text = await this.app.vault.read(af);
      const lines = text.split("\n");
      const blk = this.findZoommapBlock(lines, this.cfg.sectionStart);
      if (!blk) return false;
      const content = lines.slice(blk.start + 1, blk.end).join("\n");
      const keyLower = key.toLowerCase();
      return content.split("\n").some((ln) => ln.trimStart().toLowerCase().startsWith(`${keyLower}:`));
    } catch (e) {
      return false;
    }
  }
  async replaceYamlScalarIfEquals(key, oldValue, newValue) {
    if (typeof this.cfg.sectionStart !== "number" || typeof this.cfg.sectionEnd !== "number") {
      return false;
    }
    const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
    if (!(af instanceof import_obsidian13.TFile)) return false;
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
      const blk = this.findZoommapBlock(lines, this.cfg.sectionStart);
      if (!blk) return text;
      foundBlock = true;
      const content = lines.slice(blk.start + 1, blk.end);
      let changed = false;
      const keyRe = /^(\s*)image\s*:\s*(.*)$/i;
      const out = content.map((ln) => {
        var _a, _b;
        const m = keyRe.exec(ln);
        if (!m) return ln;
        const indent = (_a = m[1]) != null ? _a : "";
        const rhs = (_b = m[2]) != null ? _b : "";
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
        ...lines.slice(blk.end)
      ].join("\n");
    });
    return foundBlock;
  }
  syncYamlLayers(yamlBases, yamlOverlays, yamlImage, overlaysProvided = false) {
    var _a;
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
      this.data.image = newActive;
      changed = true;
    }
    if (overlaysProvided || yamlOverlays && yamlOverlays.length > 0) {
      const prev = new Map(((_a = this.data.overlays) != null ? _a : []).map((o) => [o.path, o]));
      const next = (yamlOverlays != null ? yamlOverlays : []).map((o) => {
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
    var _a;
    if (!this.data) return;
    const exists = this.getBasesNormalized().some((b) => b.path === path);
    if (exists) {
      new import_obsidian13.Notice("Base already exists.", 1500);
      return;
    }
    this.data.bases = (_a = this.data.bases) != null ? _a : [];
    this.data.bases.push({ path, name: (name != null ? name : "") || void 0 });
    await this.saveDataSoon();
    void this.appendLayerToYaml("base", path, name != null ? name : "");
    new import_obsidian13.Notice("Base added.", 1200);
  }
  async addOverlayByPath(path, name) {
    var _a;
    if (!this.data) return;
    this.data.overlays = (_a = this.data.overlays) != null ? _a : [];
    if (this.data.overlays.some((o) => o.path === path)) {
      new import_obsidian13.Notice("Overlay already exists.", 1500);
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
    new import_obsidian13.Notice("Overlay added.", 1200);
  }
  confirmDeleteBase(path) {
    var _a, _b;
    if (!this.data) return;
    const bases = this.getBasesNormalized();
    if (bases.length <= 1) {
      new import_obsidian13.Notice("Cannot delete the last base image.", 2500);
      return;
    }
    const label = (_b = (_a = bases.find((b) => b.path === path)) == null ? void 0 : _a.name) != null ? _b : basename(path);
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
    var _a, _b, _c, _d, _e, _f;
    if (!this.data) return;
    const basesBefore = this.getBasesNormalized();
    if (basesBefore.length <= 1) {
      new import_obsidian13.Notice("Cannot delete the last base image.", 2500);
      return;
    }
    const idx = basesBefore.findIndex((b) => b.path === path);
    if (idx < 0) return;
    const wasActive = this.getActiveBasePath() === path;
    this.data.bases = ((_a = this.data.bases) != null ? _a : []).filter((it) => {
      if (typeof it === "string") return it !== path;
      if (it && typeof it === "object" && "path" in it) {
        const p = it.path;
        return typeof p !== "string" || p !== path;
      }
      return true;
    });
    if ((_b = this.data.measurement) == null ? void 0 : _b.scales) {
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
    new import_obsidian13.Notice("Base removed.", 1200);
  }
  confirmDeleteOverlay(path) {
    var _a, _b;
    if (!this.data) return;
    const o = ((_a = this.data.overlays) != null ? _a : []).find((x) => x.path === path);
    const label = (_b = o == null ? void 0 : o.name) != null ? _b : basename(path);
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
    var _a, _b, _c;
    if (!this.data) return;
    const prevCount = ((_a = this.data.overlays) != null ? _a : []).length;
    this.data.overlays = ((_b = this.data.overlays) != null ? _b : []).filter((o) => o.path !== path);
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
    new import_obsidian13.Notice("Overlay removed.", 1200);
  }
  async appendLayerToYaml(kind, path, name) {
    try {
      const key = kind === "base" ? "imageBases" : "imageOverlays";
      const ok = await this.updateYamlList(key, path, { name });
      if (!ok) new import_obsidian13.Notice("Added, but YAML could not be updated.", 2500);
    } catch (err) {
      console.error("Zoom Map: failed to update YAML", err);
      new import_obsidian13.Notice("Added, but YAML update failed.", 2500);
    }
  }
  async updateYamlList(key, newPath, opts) {
    if (typeof this.cfg.sectionStart !== "number" || typeof this.cfg.sectionEnd !== "number") return false;
    const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
    if (!(af instanceof import_obsidian13.TFile)) return false;
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
        ...lines.slice(blk.end)
      ].join("\n");
    });
    return foundBlock;
  }
  async removeFromYamlList(key, removePath) {
    if (typeof this.cfg.sectionStart !== "number" || typeof this.cfg.sectionEnd !== "number") {
      return false;
    }
    const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
    if (!(af instanceof import_obsidian13.TFile)) return false;
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
        ...lines.slice(blk.end)
      ].join("\n");
    });
    return foundBlock;
  }
  patchYamlListRemove(contentLines, key, removePath) {
    var _a, _b, _c, _d, _e, _f;
    const out = contentLines.slice();
    const keyRe = new RegExp(`^(\\s*)${key}\\s*:(.*)$`);
    let keyIdx = -1;
    let keyIndent = "";
    for (let i = 0; i < out.length; i++) {
      const m = keyRe.exec(out[i]);
      if (m) {
        keyIdx = i;
        keyIndent = (_a = m[1]) != null ? _a : "";
        break;
      }
    }
    if (keyIdx < 0) return { changed: false, out };
    const isNextTopLevelKey = (ln) => {
      var _a2, _b2;
      const trimmed = ln.trim();
      if (!trimmed) return false;
      if (trimmed.startsWith("#")) return false;
      const spaces = (_b2 = (_a2 = /^\s*/.exec(ln)) == null ? void 0 : _a2[0].length) != null ? _b2 : 0;
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
    for (let i = 0; i < region.length; i++) {
      const line = region[i];
      const trimmed = line.trimStart();
      if (!trimmed.startsWith("-")) {
        removed.push(line);
        continue;
      }
      const afterDash = trimmed.slice(1).trimStart();
      const objMatch = /^path\s*:\s*(.+)$/.exec(afterDash);
      if (objMatch) {
        const rawVal2 = stripQuotes((_b = objMatch[1]) != null ? _b : "");
        if (rawVal2 === removePath) {
          changed = true;
          const baseIndent = (_d = (_c = /^\s*/.exec(line)) == null ? void 0 : _c[0].length) != null ? _d : 0;
          let j = i + 1;
          while (j < region.length) {
            const next = region[j];
            const nextIndent = (_f = (_e = /^\s*/.exec(next)) == null ? void 0 : _e[0].length) != null ? _f : 0;
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
    const remainingItems = removed.some((ln) => ln.trimStart().startsWith("-"));
    if (!remainingItems) {
      nextOut[keyIdx] = `${keyIndent}${key}: []`;
    }
    return { changed, out: nextOut };
  }
  findZoommapBlock(lines, approxLine) {
    let result = null;
    for (let i = 0; i < lines.length; i++) {
      const ln = lines[i].trimStart().toLowerCase();
      if (ln.startsWith("```zoommap")) {
        let j = i + 1;
        while (j < lines.length && !lines[j].trimStart().startsWith("```")) j++;
        if (j >= lines.length) break;
        const block = { start: i, end: j };
        if (typeof approxLine === "number" && i <= approxLine && approxLine <= j) return block;
        result != null ? result : result = block;
        i = j;
      }
    }
    return result;
  }
  patchYamlList(contentLines, key, path, opts) {
    var _a, _b, _c;
    const out = contentLines.slice();
    const keyRe = new RegExp(`^(\\s*)${key}\\s*:(.*)$`);
    let keyIdx = -1;
    let keyIndent = "";
    let after = "";
    for (let i = 0; i < out.length; i++) {
      const m = keyRe.exec(out[i]);
      if (m) {
        keyIdx = i;
        keyIndent = (_a = m[1]) != null ? _a : "";
        after = ((_b = m[2]) != null ? _b : "").trim();
        break;
      }
    }
    const jsonQuoted = JSON.stringify(path);
    const nm = (_c = opts == null ? void 0 : opts.name) != null ? _c : "";
    const itemLines = [];
    const itemIndent = `${keyIndent}  `;
    itemLines.push(`${itemIndent}- path: ${jsonQuoted}`);
    itemLines.push(`${itemIndent}  name: ${JSON.stringify(nm)}`);
    if (keyIdx >= 0) {
      if (/^\[\s*\]$/.exec(after)) out[keyIdx] = `${keyIndent}${key}:`;
      let insertAt = keyIdx + 1;
      let scan = keyIdx + 1;
      const isNextTopLevelKey = (ln) => {
        var _a2, _b2;
        const trimmed = ln.trim();
        if (!trimmed) return false;
        if (trimmed.startsWith("#")) return false;
        const spaces = (_b2 = (_a2 = /^\s*/.exec(ln)) == null ? void 0 : _a2[0].length) != null ? _b2 : 0;
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
  detectYamlKeyIndent(lines) {
    var _a;
    for (const ln of lines) {
      const m = /^(\s*)[A-Za-z0-9_-]+\s*:/.exec(ln);
      if (m) return (_a = m[1]) != null ? _a : "";
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
    new import_obsidian13.Notice("Layer renamed.", 1e3);
  }
  async deleteMarkerLayer(layer, decision) {
    if (!this.data) return;
    const others = this.data.layers.filter((l) => l.id !== layer.id);
    if (others.length === 0) {
      new import_obsidian13.Notice("Cannot delete the last layer.", 2e3);
      return;
    }
    if (decision.mode === "move") {
      const targetId = decision.targetId;
      if (!targetId || targetId === layer.id) {
        new import_obsidian13.Notice("Invalid target layer.", 1500);
        return;
      }
      for (const m of this.data.markers) if (m.layer === layer.id) m.layer = targetId;
    } else {
      this.data.markers = this.data.markers.filter((m) => m.layer !== layer.id);
    }
    this.data.layers = this.data.layers.filter((l) => l.id !== layer.id);
    await this.saveDataSoon();
    this.renderMarkersOnly();
    new import_obsidian13.Notice("Layer deleted.", 1e3);
  }
};
var ConfirmModal = class extends import_obsidian13.Modal {
  constructor(app, titleText, messageText, onConfirm, opts) {
    var _a, _b;
    super(app);
    this.titleText = titleText;
    this.messageText = messageText;
    this.onConfirm = onConfirm;
    this.confirmText = (_a = opts == null ? void 0 : opts.confirmText) != null ? _a : "Confirm";
    this.cancelText = (_b = opts == null ? void 0 : opts.cancelText) != null ? _b : "Cancel";
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
    var _a;
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
      if ((_a = it.children) == null ? void 0 : _a.length) {
        const arrow = right.createDiv({ cls: "zm-menu__arrow" });
        arrow.setText("\u25B6");
        let submenuEl = null;
        const openSub = () => {
          var _a2;
          if (submenuEl) return;
          submenuEl = this.doc.body.createDiv({ cls: "zm-submenu" });
          this.submenus.push(submenuEl);
          this.buildList(submenuEl, it.children);
          const rect = row.getBoundingClientRect();
          const win = (_a2 = this.doc.defaultView) != null ? _a2 : window;
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
          chk.setText(it.checked ? "\u2713" : "");
        }
        row.addEventListener("click", () => {
          if (!it.action) return;
          try {
            void Promise.resolve(it.action(row, this)).catch(
              (err) => console.error("Menu item action failed:", err)
            );
          } catch (err) {
            console.error("Menu item action failed:", err);
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
    var _a;
    const pad = 6;
    const rect = el.getBoundingClientRect();
    let x = clientX;
    let y = clientY;
    const win = (_a = this.doc.defaultView) != null ? _a : window;
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
};

// src/jsonFileSuggest.ts
var import_obsidian14 = require("obsidian");
var JsonFileSuggestModal = class extends import_obsidian14.FuzzySuggestModal {
  constructor(app, onChoose) {
    super(app);
    this.appRef = app;
    this.onChoose = onChoose;
    this.files = this.appRef.vault.getFiles().filter((f) => {
      var _a;
      return ((_a = f.extension) == null ? void 0 : _a.toLowerCase()) === "json";
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
var import_obsidian15 = require("obsidian");
var FaIconPickerModal = class extends import_obsidian15.Modal {
  constructor(app, folder, onChoose) {
    super(app);
    this.files = [];
    this.listEl = null;
    this.searchInput = null;
    this.selected = null;
    this.selectedEl = null;
    this.addButton = null;
    this.folder = (0, import_obsidian15.normalizePath)(folder);
    this.onChoose = onChoose;
  }
  collectFiles() {
    var _a;
    const result = [];
    const root = this.app.vault.getAbstractFileByPath(this.folder);
    if (!(root instanceof import_obsidian15.TFolder)) {
      console.warn(`Zoom Map: SVG icon folder not found: ${this.folder}`);
      this.files = [];
      return;
    }
    const stack = [root];
    while (stack.length > 0) {
      const current = stack.pop();
      for (const child of current.children) {
        if (child instanceof import_obsidian15.TFolder) {
          stack.push(child);
        } else if (child instanceof import_obsidian15.TFile) {
          if (((_a = child.extension) == null ? void 0 : _a.toLowerCase()) === "svg") {
            result.push(child);
          }
        }
      }
    }
    result.sort((a, b) => a.path.localeCompare(b.path));
    this.files = result;
  }
  renderList(filter) {
    if (!this.listEl) return;
    const files = Array.isArray(this.files) ? this.files : [];
    this.files = files;
    this.listEl.empty();
    this.selected = null;
    if (this.selectedEl) {
      this.selectedEl.classList.remove("is-selected");
      this.selectedEl = null;
    }
    if (this.addButton) this.addButton.disabled = true;
    const q = filter.trim().toLowerCase();
    const matches = files.filter((f) => {
      if (!q) return true;
      const name = f.name.toLowerCase();
      const path = f.path.toLowerCase();
      return name.includes(q) || path.includes(q);
    });
    if (matches.length === 0) {
      this.listEl.createEl("div", {
        text: "No SVG icons found in this folder."
      });
      return;
    }
    const grid = this.listEl.createDiv({ cls: "zoommap-fa-picker-grid" });
    for (const file of matches) {
      const cell = grid.createDiv({ cls: "zoommap-fa-picker-cell" });
      const img = cell.createEl("img", { cls: "zoommap-fa-picker-icon" });
      img.src = this.app.vault.getResourcePath(file);
      cell.createDiv({
        cls: "zoommap-fa-picker-label",
        text: file.name.replace(/\.svg$/i, "")
      });
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
    const footer = contentEl.createDiv({
      cls: "zoommap-fa-picker-footer zoommap-modal-footer"
    });
    this.addButton = footer.createEl("button", { text: "Add" });
    this.addButton.disabled = true;
    this.addButton.onclick = () => {
      if (!this.selected) return;
      this.onChoose(this.selected);
    };
    const backButton = footer.createEl("button", { text: "Back" });
    backButton.onclick = () => this.close();
    this.searchInput.addEventListener("input", () => {
      var _a, _b;
      this.renderList((_b = (_a = this.searchInput) == null ? void 0 : _a.value) != null ? _b : "");
    });
    this.renderList("");
  }
  onClose() {
    this.contentEl.empty();
    this.listEl = null;
    this.searchInput = null;
    this.files = [];
    this.selected = null;
    this.selectedEl = null;
    this.addButton = null;
  }
};

// src/preferencesModal.ts
var import_obsidian16 = require("obsidian");
var PreferencesModal = class extends import_obsidian16.Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Preferences" });
    new import_obsidian16.Setting(contentEl).setName("Enable text layers").setDesc("Enables text boxes with baselines and inline typing on maps.").addToggle((toggle) => {
      toggle.setValue(!!this.plugin.settings.enableTextLayers).onChange(async (value) => {
        this.plugin.settings.enableTextLayers = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian16.Setting(contentEl).setName('Pins: "scale like sticker" by default').setDesc('When enabled, new pins will have "scale like sticker" enabled in the marker editor.').addToggle((toggle) => {
      toggle.setValue(!!this.plugin.settings.defaultScaleLikeSticker).onChange(async (value) => {
        this.plugin.settings.defaultScaleLikeSticker = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian16.Setting(contentEl).setName("Prefer first active layer for new markers").setDesc("When enabled, markers default to the first visible unlocked layer, whether created or placed.").addToggle((toggle) => {
      toggle.setValue(!!this.plugin.settings.preferActiveLayerInEditor).onChange(async (value) => {
        this.plugin.settings.preferActiveLayerInEditor = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian16.Setting(contentEl).setName("Enable drawing tools").setDesc("When enabled, the draw menu and draw layers become available on maps.").addToggle((toggle) => {
      toggle.setValue(!!this.plugin.settings.enableDrawing).onChange(async (value) => {
        this.plugin.settings.enableDrawing = value;
        await this.plugin.saveSettings();
      });
    });
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const closeBtn = footer.createEl("button", { text: "Close" });
    closeBtn.onclick = () => this.close();
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/iconOutlineModal.ts
var import_obsidian17 = require("obsidian");
var IconOutlineModal = class extends import_obsidian17.Modal {
  constructor(app, plugin, icon, onApplied) {
    super(app);
    this.svgSource = null;
    this.plugin = plugin;
    this.icon = icon;
    this.onApplied = onApplied;
  }
  onOpen() {
    void this.renderAsync();
  }
  onClose() {
    this.contentEl.empty();
    this.svgSource = null;
  }
  async renderAsync() {
    var _a, _b, _c, _d, _e;
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
    const strokeMatch = /stroke="([^"]+)"/i.exec(svg);
    const widthMatch = /stroke-width="([^"]+)"/i.exec(svg);
    const opacityMatch = /stroke-opacity="([^"]+)"/i.exec(svg);
    let defaultColor = (_a = strokeMatch == null ? void 0 : strokeMatch[1]) != null ? _a : "#000000";
    if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(defaultColor)) {
      defaultColor = "#000000";
    }
    let defaultWidth = Number((_c = (_b = widthMatch == null ? void 0 : widthMatch[1]) == null ? void 0 : _b.replace(",", ".")) != null ? _c : "2");
    if (!Number.isFinite(defaultWidth) || defaultWidth <= 0) defaultWidth = 2;
    let defaultOpacity = Number(
      (_e = (_d = opacityMatch == null ? void 0 : opacityMatch[1]) == null ? void 0 : _d.replace(",", ".")) != null ? _e : "1"
    );
    if (!Number.isFinite(defaultOpacity)) defaultOpacity = 1;
    if (defaultOpacity > 1.001) defaultOpacity = defaultOpacity / 100;
    defaultOpacity = Math.min(1, Math.max(0, defaultOpacity));
    const colorSetting = new import_obsidian17.Setting(contentEl).setName("Outline color");
    this.colorText = colorSetting.controlEl.createEl("input", {
      type: "text"
    });
    this.colorText.classList.add("zoommap-drawing-editor__color-text");
    this.colorText.value = defaultColor;
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
    };
    this.colorPicker.oninput = () => {
      const hex = this.colorPicker.value;
      this.colorText.value = hex;
    };
    const widthSetting = new import_obsidian17.Setting(contentEl).setName("Stroke width");
    this.widthInput = widthSetting.controlEl.createEl("input", {
      type: "number"
    });
    this.widthInput.classList.add("zoommap-drawing-editor__num-input");
    this.widthInput.min = "0";
    this.widthInput.step = "0.5";
    this.widthInput.value = String(defaultWidth);
    const opacitySetting = new import_obsidian17.Setting(contentEl).setName("Opacity (%)");
    this.opacityInput = opacitySetting.controlEl.createEl("input", {
      type: "number"
    });
    this.opacityInput.classList.add("zoommap-drawing-editor__num-input");
    this.opacityInput.min = "0";
    this.opacityInput.max = "100";
    this.opacityInput.step = "5";
    this.opacityInput.value = String(Math.round(defaultOpacity * 100));
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
      if (af instanceof import_obsidian17.TFile) {
        return this.app.vault.read(af);
      }
    }
    return null;
  }
  async applyAndSave() {
    if (!this.svgSource) {
      new import_obsidian17.Notice("SVG content not loaded.", 2e3);
      return;
    }
    const color = this.colorText.value.trim() || "#000000";
    let width = Number(this.widthInput.value.replace(",", "."));
    if (!Number.isFinite(width) || width <= 0) width = 2;
    let opacity = Number(this.opacityInput.value.replace(",", "."));
    if (!Number.isFinite(opacity)) opacity = 100;
    if (opacity > 1.001) opacity = opacity / 100;
    opacity = Math.min(1, Math.max(0, opacity));
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
    var _a;
    let s = this.expandViewBoxForStroke(svg, width);
    const openMatch = /<svg[^>]*>/i.exec(s);
    const closeIndex = s.lastIndexOf("</svg>");
    if (!openMatch || closeIndex < 0) {
      return s;
    }
    const openTag = openMatch[0];
    const openEnd = ((_a = openMatch.index) != null ? _a : 0) + openTag.length;
    const inner = s.slice(openEnd, closeIndex);
    const outlineInner = this.stripFillAndStrokeForOutline(inner);
    const outlineGroup = `<g id="zm-outline" fill="none" stroke="${color}" stroke-width="${width}" stroke-opacity="${opacity}" vector-effect="non-scaling-stroke">` + outlineInner + `</g>`;
    const innerGroup = `<g id="zm-inner">${inner}</g>`;
    const newInner = outlineGroup + innerGroup;
    return s.slice(0, openEnd) + newInner + s.slice(closeIndex);
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
  expandViewBoxForStroke(svg, strokeWidth) {
    const m = /viewBox="\s*([0-9.+\-eE]+)\s+([0-9.+\-eE]+)\s+([0-9.+\-eE]+)\s+([0-9.+\-eE]+)\s*"/i.exec(
      svg
    );
    if (!m) return svg;
    const minX = Number(m[1]);
    const minY = Number(m[2]);
    const width = Number(m[3]);
    const height = Number(m[4]);
    if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      return svg;
    }
    const pad = strokeWidth * 2;
    const newMinX = minX - pad;
    const newMinY = minY - pad;
    const newWidth = width + pad * 2;
    const newHeight = height + pad * 2;
    const oldAttr = m[0];
    const newAttr = `viewBox="${newMinX} ${newMinY} ${newWidth} ${newHeight}"`;
    return svg.replace(oldAttr, newAttr);
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
function folderOf(path) {
  const i = path.lastIndexOf("/");
  return i >= 0 ? path.slice(0, i) : "";
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
  defaultWidthWrapped: "50%",
  baseCollections: [],
  pinPlaceOpensEditor: false,
  libraryFilePath: "ZoomMap/library.json",
  faFolderPath: "ZoomMap/SVGs",
  customUnits: [],
  defaultScaleLikeSticker: false,
  enableDrawing: false,
  preferActiveLayerInEditor: false,
  enableTextLayers: false
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
function parseAlign(v) {
  if (v === "left" || v === "center" || v === "right") return v;
  return void 0;
}
function parseResizeHandle(v) {
  return v === "left" || v === "right" || v === "both" || v === "native" ? v : "right";
}
async function readSavedFrame(app, markersPath) {
  try {
    const file = app.vault.getAbstractFileByPath((0, import_obsidian18.normalizePath)(markersPath));
    if (!(file instanceof import_obsidian18.TFile)) return null;
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
var ZoomMapPlugin = class extends import_obsidian18.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
    this.activeMap = null;
  }
  setActiveMap(inst) {
    this.activeMap = inst;
  }
  async onload() {
    await this.loadSettings();
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
          id: `map-${Date.now().toString(36)}`
        };
        new ViewEditorModal(this.app, initialConfig, (res) => {
          if (res.action !== "save" || !res.config) return;
          const yaml = this.buildYamlFromViewConfig(res.config);
          const block = "```zoommap\n" + yaml + "\n```\n";
          editor.replaceRange(block, editor.getCursor());
        }).open();
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
    this.registerMarkdownCodeBlockProcessor(
      "zoommap",
      async (src, el, ctx) => {
        var _a, _b, _c, _d;
        let opts = {};
        try {
          const parsed = (0, import_obsidian18.parseYaml)(src);
          if (parsed && typeof parsed === "object") {
            opts = parsed;
          }
        } catch (error) {
          console.error("Zoom Map: failed to parse zoommap block", error);
        }
        const yamlBases = parseBasesYaml(opts.imageBases);
        const yamlOverlays = parseOverlaysYaml(opts.imageOverlays);
        const yamlMetersPerPixel = parseScaleYaml(opts.scale);
        let initialZoom;
        let initialCenter;
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
        }
        const renderMode = opts.render === "canvas" ? "canvas" : "dom";
        let image = typeof opts.image === "string" ? opts.image.trim() : "";
        if (!image && yamlBases.length > 0) image = yamlBases[0].path;
        if (!image) {
          el.createEl("div", { text: "Image is missing." });
          return;
        }
        const responsive = !!((_a = opts.responsive) != null ? _a : opts.responsiv);
        const storageRaw = typeof opts.storage === "string" ? opts.storage.toLowerCase() : "";
        const storageMode = storageRaw === "note" || storageRaw === "inline" || storageRaw === "in-note" ? "note" : storageRaw === "json" ? "json" : (_b = this.settings.storageDefault) != null ? _b : "json";
        const sectionInfo = ctx.getSectionInfo(el);
        const defaultId = `map-${(_c = sectionInfo == null ? void 0 : sectionInfo.lineStart) != null ? _c : Date.now()}`;
        const idFromYaml = opts.id;
        const mapId = typeof idFromYaml === "string" && idFromYaml.trim() ? idFromYaml.trim() : defaultId;
        const markersPathRaw = typeof opts.markers === "string" ? opts.markers : void 0;
        const minZoom = responsive ? 1e-6 : parseZoomYaml(opts.minZoom, 0.25);
        const maxZoom = responsive ? 1e6 : parseZoomYaml(opts.maxZoom, 8);
        const markersPath = (0, import_obsidian18.normalizePath)(markersPathRaw != null ? markersPathRaw : `${image}.markers.json`);
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
          initialZoom,
          initialCenter
        };
        const inst = new MapInstance(this.app, this, el, cfg);
        ctx.addChild(inst);
      }
    );
    this.addSettingTab(new ZoomMapSettingTab(this.app, this));
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
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    const savedUnknown = await this.loadData();
    const merged = { ...DEFAULT_SETTINGS };
    if (isPlainObject(savedUnknown)) {
      Object.assign(merged, savedUnknown);
    }
    this.settings = merged;
    const ext = this.settings;
    (_b = (_a = this.settings).baseCollections) != null ? _b : _a.baseCollections = [];
    (_c = ext.defaultWidthWrapped) != null ? _c : ext.defaultWidthWrapped = "50%";
    (_d = ext.libraryFilePath) != null ? _d : ext.libraryFilePath = "ZoomMap/library.json";
    (_e = ext.faFolderPath) != null ? _e : ext.faFolderPath = "ZoomMap/SVGs";
    (_g = (_f = this.settings).customUnits) != null ? _g : _f.customUnits = [];
    (_i = (_h = this.settings).enableTextLayers) != null ? _i : _h.enableTextLayers = false;
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  /* -------- Library file (icons + collections) -------- */
  async ensureFolder(path) {
    const folder = folderOf(path);
    if (!folder) return;
    if (!this.app.vault.getAbstractFileByPath(folder)) {
      await this.app.vault.createFolder(folder);
    }
  }
  async saveLibraryToPath(path) {
    var _a, _b;
    const p = (0, import_obsidian18.normalizePath)(path);
    const ext = this.settings;
    const payload = {
      version: 1,
      icons: (_a = this.settings.icons) != null ? _a : [],
      baseCollections: (_b = this.settings.baseCollections) != null ? _b : [],
      exportedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    try {
      await this.ensureFolder(p);
      const existing = this.app.vault.getAbstractFileByPath(p);
      const json = JSON.stringify(payload, null, 2);
      if (existing instanceof import_obsidian18.TFile) {
        await this.app.vault.modify(existing, json);
      } else {
        await this.app.vault.create(p, json);
      }
      ext.libraryFilePath = p;
      await this.saveSettings();
      new import_obsidian18.Notice(`Library saved to ${p}`, 2e3);
    } catch (e) {
      console.error("Save library failed", e);
      new import_obsidian18.Notice("Failed to save library.", 2500);
    }
  }
  async loadLibraryFromFile(file) {
    try {
      const raw = await this.app.vault.read(file);
      const obj = JSON.parse(raw);
      if (!isPlainObject(obj)) {
        new import_obsidian18.Notice("Invalid library file.", 2500);
        return;
      }
      const hasIcons = (x) => isPlainObject(x) && "icons" in x;
      const hasBaseCollections = (x) => isPlainObject(x) && "baseCollections" in x;
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
      new import_obsidian18.Notice(`Library loaded from ${file.path}`, 2e3);
    } catch (e) {
      console.error("Load library failed", e);
      new import_obsidian18.Notice("Failed to load library.", 2500);
    }
  }
  async downloadFontAwesomeZip() {
    var _a;
    const ext = this.settings;
    const folder = (0, import_obsidian18.normalizePath)(((_a = ext.faFolderPath) == null ? void 0 : _a.trim()) || "ZoomMap/SVGs");
    const zipPath = (0, import_obsidian18.normalizePath)(`${folder}/fontawesome-free.zip`);
    try {
      if (!this.app.vault.getAbstractFileByPath(folder)) {
        await this.app.vault.createFolder(folder);
      }
      new import_obsidian18.Notice("Downloading font awesome free zip\u2026", 2500);
      const res = await (0, import_obsidian18.requestUrl)({
        url: DEFAULT_FA_ZIP_URL,
        method: "GET"
      });
      await this.app.vault.adapter.writeBinary(zipPath, res.arrayBuffer);
      new import_obsidian18.Notice(
        `Downloaded Font Awesome ZIP to ${zipPath}. Please unzip it so that SVG files are available in this folder.`,
        6e3
      );
    } catch (e) {
      console.error("Download Font Awesome ZIP failed", e);
      new import_obsidian18.Notice("Failed to download font awesome zip.", 4e3);
    }
  }
  async downloadRpgAwesomeZip() {
    var _a;
    const ext = this.settings;
    const folder = (0, import_obsidian18.normalizePath)(((_a = ext.faFolderPath) == null ? void 0 : _a.trim()) || "ZoomMap/SVGs");
    const zipPath = (0, import_obsidian18.normalizePath)(`${folder}/rpg-awesome.zip`);
    try {
      if (!this.app.vault.getAbstractFileByPath(folder)) {
        await this.app.vault.createFolder(folder);
      }
      new import_obsidian18.Notice("Downloading rpg awesome SVG pack\u2026", 2500);
      const res = await (0, import_obsidian18.requestUrl)({
        url: DEFAULT_RPG_ZIP_URL,
        method: "GET"
      });
      await this.app.vault.adapter.writeBinary(zipPath, res.arrayBuffer);
      new import_obsidian18.Notice(
        `Downloaded RPG Awesome ZIP to ${zipPath}. Please unzip it so that the SVG files are available in this folder.`,
        6e3
      );
    } catch (e) {
      console.error("Download RPG Awesome ZIP failed", e);
      new import_obsidian18.Notice("Failed to download rpg awesome zip.", 4e3);
    }
  }
  rescanSvgFolder() {
    var _a;
    const ext = this.settings;
    const folder = (0, import_obsidian18.normalizePath)(((_a = ext.faFolderPath) == null ? void 0 : _a.trim()) || "ZoomMap/SVGs");
    const files = this.app.vault.getFiles();
    const prefix = folder.endsWith("/") ? folder : folder + "/";
    const count = files.filter((f) => {
      var _a2;
      if (((_a2 = f.extension) == null ? void 0 : _a2.toLowerCase()) !== "svg") return false;
      return f.path === folder || f.path.startsWith(prefix);
    }).length;
    new import_obsidian18.Notice(
      `Found ${count} SVG files under ${folder}. They will be available in the \u201CAdd SVG icon\u201D picker.`,
      4e3
    );
    return count;
  }
  buildYamlFromViewConfig(cfg) {
    var _a, _b, _c;
    const obj = {};
    const bases = ((_a = cfg.imageBases) != null ? _a : []).filter(
      (b) => b.path && b.path.trim().length > 0
    );
    if (bases.length > 0) {
      obj.image = bases[0].path;
      obj.imageBases = bases.map(
        (b) => b.name ? { path: b.path, name: b.name } : { path: b.path }
      );
    }
    const overlays = ((_b = cfg.overlays) != null ? _b : []).filter(
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
    if (cfg.renderMode === "canvas") obj.render = "canvas";
    if (cfg.align) obj.align = cfg.align;
    if (cfg.id && cfg.id.trim().length > 0) {
      obj.id = cfg.id.trim();
    }
    return (0, import_obsidian18.stringifyYaml)(obj).trimEnd();
  }
};
function tintSvgMarkup2(svg, color) {
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
var ZoomMapSettingTab = class extends import_obsidian18.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.svgFileCache = /* @__PURE__ */ new Map();
    this.plugin = plugin;
  }
  async addFontAwesomeIcon(file) {
    var _a;
    try {
      const svg = await this.app.vault.read(file);
      const defaultColor = "#b0b0b0";
      const tinted = tintSvgMarkup2(svg, defaultColor);
      const dataUrl = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(tinted);
      const icons = (_a = this.plugin.settings.icons) != null ? _a : [];
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
        defaultLink: ""
      });
      this.plugin.settings.icons = icons;
      await this.plugin.saveSettings();
      this.display();
    } catch (e) {
      console.error("Zoom Map: failed to add Font Awesome icon", e);
      new import_obsidian18.Notice("Failed to add font awesome icon.", 2500);
    }
  }
  async recolorIconSvg(icon, color) {
    var _a;
    const c = color.trim();
    if (!c) return;
    let svg = null;
    const src = (_a = icon.pathOrDataUrl) != null ? _a : "";
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
        if (f instanceof import_obsidian18.TFile) {
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
    var _a;
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass("zoommap-settings");
    new import_obsidian18.Setting(containerEl).setName("Storage").setHeading();
    new import_obsidian18.Setting(containerEl).setName("Storage location by default").setDesc("Store marker data in JSON beside image, or inline in the note.").addDropdown((d) => {
      var _a2;
      d.addOption("json", "JSON file (beside image)");
      d.addOption("note", "Inside the note (hidden comment)");
      d.setValue((_a2 = this.plugin.settings.storageDefault) != null ? _a2 : "json");
      d.onChange((v) => {
        this.plugin.settings.storageDefault = v === "note" ? "note" : "json";
        void this.plugin.saveSettings();
      });
    });
    new import_obsidian18.Setting(containerEl).setName("Layout").setHeading();
    new import_obsidian18.Setting(containerEl).setName("Default width when wrapped").setDesc("Initial width if wrap: true and no width is set in the code block.").addText((t) => {
      var _a2;
      const ext = this.plugin.settings;
      t.setPlaceholder("50%");
      t.setValue((_a2 = ext.defaultWidthWrapped) != null ? _a2 : "50%");
      t.onChange((v) => {
        ext.defaultWidthWrapped = (v || "50%").trim();
        void this.plugin.saveSettings();
      });
    });
    new import_obsidian18.Setting(containerEl).setName("Interaction").setHeading();
    new import_obsidian18.Setting(containerEl).setName("Mouse wheel zoom factor").setDesc("Multiplier per step. 1.1 = 10% per tick.").addText(
      (t) => t.setPlaceholder("1.1").setValue(String(this.plugin.settings.wheelZoomFactor)).onChange((v) => {
        const n = Number(v);
        if (!Number.isNaN(n) && n > 1.001 && n < 2.5) {
          this.plugin.settings.wheelZoomFactor = n;
          void this.plugin.saveSettings();
        }
      })
    );
    new import_obsidian18.Setting(containerEl).setName("Panning mouse button").setDesc("Which mouse button pans the map?").addDropdown((d) => {
      var _a2;
      d.addOption("left", "Left");
      d.addOption("middle", "Middle");
      d.setValue((_a2 = this.plugin.settings.panMouseButton) != null ? _a2 : "left");
      d.onChange((v) => {
        this.plugin.settings.panMouseButton = v === "middle" ? "middle" : "left";
        void this.plugin.saveSettings();
      });
    });
    new import_obsidian18.Setting(containerEl).setName("Hover popover size").setDesc("Max width and height in pixels.").addText(
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
    new import_obsidian18.Setting(containerEl).setName("Force popovers without ctrl").setDesc("Opens preview popovers on simple hover.").addToggle(
      (t) => t.setValue(!!this.plugin.settings.forcePopoverWithoutModKey).onChange((v) => {
        this.plugin.settings.forcePopoverWithoutModKey = v;
        void this.plugin.saveSettings();
      })
    );
    new import_obsidian18.Setting(containerEl).setName("Open editor when placing pin from menu").setDesc("When enabled, placing a pin from the pins menu opens the marker editor.").addToggle(
      (t) => t.setValue(!!this.plugin.settings.pinPlaceOpensEditor).onChange((v) => {
        this.plugin.settings.pinPlaceOpensEditor = v;
        void this.plugin.saveSettings();
      })
    );
    new import_obsidian18.Setting(containerEl).setName("Preferences").setDesc("Global defaults for marker creation and behavior.").addButton(
      (b) => b.setButtonText("Open\u2026").onClick(() => {
        new PreferencesModal(this.app, this.plugin).open();
      })
    );
    new import_obsidian18.Setting(containerEl).setName("Ruler").setHeading();
    const applyStyleToAll = () => {
      var _a2, _b;
      const color = ((_a2 = this.plugin.settings.measureLineColor) != null ? _a2 : "var(--text-accent)").trim();
      const widthPx = Math.max(1, (_b = this.plugin.settings.measureLineWidth) != null ? _b : 2);
      document.querySelectorAll(".zm-root").forEach((el) => {
        if (el instanceof HTMLElement) {
          setCssProps2(el, {
            "--zm-measure-color": color,
            "--zm-measure-width": `${widthPx}px`
          });
        }
      });
    };
    const colorRow = new import_obsidian18.Setting(containerEl).setName("Line color").setDesc("CSS color, e.g. #ff0055.");
    colorRow.addText(
      (t) => {
        var _a2;
        return t.setPlaceholder("Default").setValue((_a2 = this.plugin.settings.measureLineColor) != null ? _a2 : "var(--text-accent)").onChange((v) => {
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
    setPickerFromValue((_a = this.plugin.settings.measureLineColor) != null ? _a : "");
    picker.oninput = () => {
      this.plugin.settings.measureLineColor = picker.value;
      void this.plugin.saveSettings();
      applyStyleToAll();
    };
    new import_obsidian18.Setting(containerEl).setName("Line width").setDesc("Stroke width in pixels.").addText(
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
    new import_obsidian18.Setting(containerEl).setName("Custom units").setHeading();
    const customUnitsWrap = containerEl.createDiv();
    const renderCustomUnits = () => {
      var _a2;
      customUnitsWrap.empty();
      const ext = this.plugin.settings;
      (_a2 = ext.customUnits) != null ? _a2 : ext.customUnits = [];
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
        var _a3;
        const ext2 = this.plugin.settings;
        (_a3 = ext2.customUnits) != null ? _a3 : ext2.customUnits = [];
        const id = `cu-${Math.random().toString(36).slice(2, 8)}`;
        ext2.customUnits.push({
          id,
          name: "Hex",
          abbreviation: "hex",
          metersPerUnit: 5 * 0.3048
        });
        void this.plugin.saveSettings().then(() => {
          renderCustomUnits();
        });
      };
    };
    renderCustomUnits();
    new import_obsidian18.Setting(containerEl).setName("Collections (base-bound)").setHeading();
    const collectionsWrap = containerEl.createDiv();
    const renderCollections = () => {
      var _a2;
      collectionsWrap.empty();
      const hint = collectionsWrap.createEl("div", {
        text: "Collections bundle pins, favorites and stickers for specific base images. Create a 'global' collection without bindings for items that should be available everywhere."
      });
      hint.addClass("zoommap-collections-hint");
      const list = collectionsWrap.createDiv();
      const cols = (_a2 = this.plugin.settings.baseCollections) != null ? _a2 : [];
      if (cols.length === 0) {
        list.createEl("div", { text: "No collections yet." });
      } else {
        cols.forEach((c) => {
          var _a3, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o;
          const row = list.createDiv({ cls: "zoommap-collections-row" });
          const left = row.createDiv();
          const name = left.createEl("div", { text: c.name || "(unnamed collection)" });
          name.addClass("zoommap-collections-name");
          const meta = left.createEl("div", {
            text: `${(_c = (_b = (_a3 = c.bindings) == null ? void 0 : _a3.basePaths) == null ? void 0 : _b.length) != null ? _c : 0} bases \u2022 ${(_f = (_e = (_d = c.include) == null ? void 0 : _d.pinKeys) == null ? void 0 : _e.length) != null ? _f : 0} pins \u2022 ${(_i = (_h = (_g = c.include) == null ? void 0 : _g.favorites) == null ? void 0 : _h.length) != null ? _i : 0} favorites \u2022 ${(_l = (_k = (_j = c.include) == null ? void 0 : _j.stickers) == null ? void 0 : _k.length) != null ? _l : 0} stickers \u2022 ${(_o = (_n = (_m = c.include) == null ? void 0 : _m.swapPins) == null ? void 0 : _n.length) != null ? _o : 0} swap pins`
          });
          meta.addClass("zoommap-collections-meta");
          const edit = row.createEl("button", { text: "Edit" });
          edit.onclick = () => {
            new CollectionEditorModal(this.app, this.plugin, c, ({ updated, deleted }) => {
              var _a4;
              if (deleted) {
                const arr = (_a4 = this.plugin.settings.baseCollections) != null ? _a4 : [];
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
            var _a4;
            const arr = (_a4 = this.plugin.settings.baseCollections) != null ? _a4 : [];
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
          include: { pinKeys: [], favorites: [], stickers: [] }
        };
        new CollectionEditorModal(this.app, this.plugin, fresh, ({ updated, deleted }) => {
          var _a3;
          if (deleted) return;
          if (updated) {
            this.plugin.settings.baseCollections = (_a3 = this.plugin.settings.baseCollections) != null ? _a3 : [];
            this.plugin.settings.baseCollections.push(fresh);
            void this.plugin.saveSettings().then(() => {
              renderCollections();
            });
          }
        }).open();
      };
    };
    renderCollections();
    new import_obsidian18.Setting(containerEl).setName("Marker icons (library)").setHeading();
    const libRow = new import_obsidian18.Setting(containerEl).setName("Library file (icons + collections)").setDesc("Choose a JSON file in the vault to save/load your icon library and collections.");
    libRow.addText((t) => {
      var _a2;
      const ext = this.plugin.settings;
      t.setPlaceholder("ZoomMap/library.json");
      t.setValue((_a2 = ext.libraryFilePath) != null ? _a2 : "ZoomMap/library.json");
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
        var _a2, _b;
        const ext = this.plugin.settings;
        const p = (_b = (_a2 = ext.libraryFilePath) == null ? void 0 : _a2.trim()) != null ? _b : "ZoomMap/library.json";
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
    new import_obsidian18.Setting(containerEl).setName("SVG icons").setHeading();
    const svgFolderRow = new import_obsidian18.Setting(containerEl).setName("SVG icon folder in vault").setDesc("Folder that contains SVG packs.");
    svgFolderRow.addText((t) => {
      var _a2;
      const ext = this.plugin.settings;
      t.setPlaceholder("e.g. ZoomMap/SVGs");
      t.setValue((_a2 = ext.faFolderPath) != null ? _a2 : "ZoomMap/SVGs");
      t.onChange((v) => {
        ext.faFolderPath = (v || "ZoomMap/SVGs").trim();
        void this.plugin.saveSettings();
      });
    });
    svgFolderRow.addButton(
      (b) => b.setButtonText("Ensure folder").onClick(() => {
        var _a2;
        const ext = this.plugin.settings;
        const folder = (0, import_obsidian18.normalizePath)(((_a2 = ext.faFolderPath) == null ? void 0 : _a2.trim()) || "ZoomMap/SVGs");
        if (!this.app.vault.getAbstractFileByPath(folder)) {
          void this.app.vault.createFolder(folder).then(() => {
            new import_obsidian18.Notice(`Created folder: ${folder}`, 2e3);
          });
        } else {
          new import_obsidian18.Notice("Folder already exists.", 1500);
        }
      })
    );
    svgFolderRow.addButton(
      (b) => b.setButtonText("Rescan icons").onClick(() => {
        this.plugin.rescanSvgFolder();
      })
    );
    const svgDownloadRow = new import_obsidian18.Setting(containerEl).setName("Download icon packs").setDesc("Download common SVG packs into the configured folder.");
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
      var _a2, _b, _c, _d;
      const files = this.app.vault.getFiles().filter((f) => {
        var _a3;
        return ((_a3 = f.extension) == null ? void 0 : _a3.toLowerCase()) === "md";
      });
      const suggestions = [];
      const active = this.app.workspace.getActiveFile();
      const fromPath = (_c = (_b = active == null ? void 0 : active.path) != null ? _b : (_a2 = files[0]) == null ? void 0 : _a2.path) != null ? _c : "";
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
      if (!(wrapper instanceof HTMLElement)) return;
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
      var _a2;
      const src = (_a2 = icon.pathOrDataUrl) != null ? _a2 : "";
      if (typeof src !== "string") return false;
      const lower = src.toLowerCase();
      return lower.startsWith("data:image/svg+xml") || lower.endsWith(".svg");
    };
    const svgIconsHead = containerEl.createDiv({ cls: "zm-icons-grid-head zm-grid" });
    svgIconsHead.createSpan({ text: "Name" });
    svgIconsHead.createSpan({ text: "Preview / color / link" });
    svgIconsHead.createSpan({ text: "Size" });
    const headSvgAX = svgIconsHead.createSpan({ cls: "zm-icohead" });
    const svgAxIco = headSvgAX.createSpan();
    (0, import_obsidian18.setIcon)(svgAxIco, "anchor");
    headSvgAX.appendText(" X");
    const headSvgAY = svgIconsHead.createSpan({ cls: "zm-icohead" });
    const svgAyIco = headSvgAY.createSpan();
    (0, import_obsidian18.setIcon)(svgAyIco, "anchor");
    headSvgAY.appendText(" Y");
    svgIconsHead.createSpan({ text: "Angle" });
    const headSvgTrash = svgIconsHead.createSpan();
    (0, import_obsidian18.setIcon)(headSvgTrash, "trash");
    const svgIconsGrid = containerEl.createDiv({ cls: "zm-icons-grid zm-grid" });
    const addSvgSetting = new import_obsidian18.Setting(containerEl).setName("Add SVG icon").setDesc("Create a pin icon from an SVG file in the configured folder.");
    const infoIcon = addSvgSetting.controlEl.createDiv({ cls: "zoommap-info-icon" });
    (0, import_obsidian18.setIcon)(infoIcon, "info");
    infoIcon.setAttr(
      "title",
      "Rendering many SVG files in the picker can cause noticeable delays while all previews are generated. Once the icons are cached, searching and adding should feel much faster."
    );
    addSvgSetting.addButton(
      (b) => b.setButtonText("Add SVG icon").onClick(() => {
        var _a2;
        const ext = this.plugin.settings;
        const folder = ((_a2 = ext.faFolderPath) == null ? void 0 : _a2.trim()) || "ZoomMap/SVGs";
        new FaIconPickerModal(this.app, folder, (file) => {
          void this.addFontAwesomeIcon(file);
        }).open();
      })
    );
    new import_obsidian18.Setting(containerEl).setName("Image icons").setHeading();
    const imgIconsHead = containerEl.createDiv({ cls: "zm-icons-grid-head zm-grid" });
    imgIconsHead.createSpan({ text: "Name" });
    imgIconsHead.createSpan({ text: "Path / data:URL + default link" });
    imgIconsHead.createSpan({ text: "Size" });
    const headImgAX = imgIconsHead.createSpan({ cls: "zm-icohead" });
    const axIco = headImgAX.createSpan();
    (0, import_obsidian18.setIcon)(axIco, "anchor");
    headImgAX.appendText(" X");
    const headImgAY = imgIconsHead.createSpan({ cls: "zm-icohead" });
    const ayIco = headImgAY.createSpan();
    (0, import_obsidian18.setIcon)(ayIco, "anchor");
    headImgAY.appendText(" Y");
    imgIconsHead.createSpan({ text: "Angle" });
    const headImgTrash = imgIconsHead.createSpan();
    (0, import_obsidian18.setIcon)(headImgTrash, "trash");
    const imgIconsGrid = containerEl.createDiv({ cls: "zm-icons-grid zm-grid" });
    const renderIcons = () => {
      var _a2, _b, _c, _d, _e, _f, _g;
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
          let src = (_a2 = icon.pathOrDataUrl) != null ? _a2 : "";
          if (typeof src === "string" && !src.startsWith("data:") && src) {
            const f = this.app.vault.getAbstractFileByPath(src);
            if (f instanceof import_obsidian18.TFile) {
              src = this.app.vault.getResourcePath(f);
            }
          }
          img.src = typeof src === "string" ? src : "";
          const applyRotationPreview = () => {
            var _a3;
            const deg = (_a3 = icon.rotationDeg) != null ? _a3 : 0;
            setCssProps2(img, {
              transform: deg ? `rotate(${deg}deg)` : null
            });
          };
          applyRotationPreview();
          const rawSrc = (_b = icon.pathOrDataUrl) != null ? _b : "";
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
              var _a3;
              const updated = (_a3 = icon.pathOrDataUrl) != null ? _a3 : "";
              let out = updated;
              if (typeof out === "string" && !out.startsWith("data:") && out) {
                const f = this.app.vault.getAbstractFileByPath(out);
                if (f instanceof import_obsidian18.TFile) out = this.app.vault.getResourcePath(f);
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
              var _a3;
              return (_a3 = icon.defaultLink) != null ? _a3 : "";
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
          (0, import_obsidian18.setIcon)(outlineBtn, "gear");
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
          (0, import_obsidian18.setIcon)(del, "trash");
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
          path.value = (_e = icon.pathOrDataUrl) != null ? _e : "";
          path.oninput = () => {
            icon.pathOrDataUrl = path.value.trim();
            void this.plugin.saveSettings();
          };
          const pick = pathWrap.createEl("button", { attr: { title: "Choose file\u2026" } });
          pick.classList.add("zm-icon-btn");
          (0, import_obsidian18.setIcon)(pick, "folder-open");
          pick.onclick = () => {
            new ImageFileSuggestModal(this.app, (file) => {
              icon.pathOrDataUrl = file.path;
              void this.plugin.saveSettings();
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
              var _a3;
              return (_a3 = icon.defaultLink) != null ? _a3 : "";
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
          (0, import_obsidian18.setIcon)(del, "trash");
          del.onclick = () => {
            this.plugin.settings.icons = this.plugin.settings.icons.filter((i) => i !== icon);
            void this.plugin.saveSettings();
            renderIcons();
          };
        }
      }
    };
    renderIcons();
    new import_obsidian18.Setting(containerEl).setName("Add new icon").setDesc("Create a new image-based icon entry.").addButton(
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
  }
};
