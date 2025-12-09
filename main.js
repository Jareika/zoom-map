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
var import_obsidian14 = require("obsidian");

// src/map.ts
var import_obsidian9 = require("obsidian");

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
      layers: [{ id: "default", name: "Default", visible: true, locked: false }],
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
      panClamp: true
    };
    await this.create(JSON.stringify(data, null, 2));
    new import_obsidian.Notice(`Created marker file: ${this.markersFilePath}`, 2500);
  }
  async load() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    const f = this.getFileByPath(this.markersFilePath);
    if (!f) throw new Error(`Marker file missing: ${this.markersFilePath}`);
    const raw = await this.app.vault.read(f);
    const parsed = JSON.parse(raw);
    if (!parsed.layers || parsed.layers.length === 0) {
      parsed.layers = [{ id: "default", name: "Default", visible: true, locked: false }];
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
      suggestions.push({
        label: baseLink,
        value: baseLink
      });
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
  updateLinkSuggestions(input) {
    if (!this.suggestionsEl) return;
    const query = input.trim().toLowerCase();
    this.suggestionsEl.empty();
    this.filteredSuggestions = [];
    this.selectedSuggestionIndex = -1;
    if (!query) {
      this.suggestionsEl.style.display = "none";
      return;
    }
    const maxItems = 20;
    const matches = this.allSuggestions.filter(
      (s) => s.value.toLowerCase().includes(query) || s.label.toLowerCase().includes(query)
    ).slice(0, maxItems);
    if (matches.length === 0) {
      this.suggestionsEl.style.display = "none";
      return;
    }
    this.filteredSuggestions = matches;
    this.suggestionsEl.style.display = "";
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
  hideLinkSuggestions() {
    if (!this.suggestionsEl) return;
    this.suggestionsEl.style.display = "none";
    this.suggestionsEl.empty();
    this.filteredSuggestions = [];
    this.selectedSuggestionIndex = -1;
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
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", {
      text: this.marker.type === "sticker" ? "Edit sticker" : "Edit marker"
    });
    if (this.marker.type !== "sticker") {
      const linkSetting = new import_obsidian2.Setting(contentEl).setName("Link").setDesc(
        "Wiki link (without [[ ]]). Supports note and note#heading."
      );
      linkSetting.addText((t) => {
        var _a;
        this.linkInput = t;
        t.setPlaceholder("Folder/note or note#heading").setValue((_a = this.marker.link) != null ? _a : "").onChange((v) => {
          this.marker.link = v.trim();
          this.updateLinkSuggestions(v);
        });
        const wrapper = t.inputEl.parentElement;
        if (wrapper instanceof HTMLElement) {
          wrapper.classList.add("zoommap-link-input-wrapper");
          this.suggestionsEl = wrapper.createDiv({
            cls: "zoommap-link-suggestions"
          });
          this.suggestionsEl.style.display = "none";
        }
        this.buildLinkSuggestions();
        t.inputEl.addEventListener("keydown", (ev) => {
          if (!this.suggestionsEl || this.suggestionsEl.style.display === "none")
            return;
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
      new import_obsidian2.Setting(contentEl).setName("Tooltip").addTextArea((a) => {
        var _a;
        a.setPlaceholder("Optional tooltip text");
        a.inputEl.rows = 3;
        a.setValue((_a = this.marker.tooltip) != null ? _a : "");
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
        var _a;
        for (const icon of this.plugin.settings.icons) {
          d.addOption(icon.key, icon.key);
        }
        d.setValue(
          (_a = this.marker.iconKey) != null ? _a : this.plugin.settings.defaultIconKey
        );
        d.onChange((v) => {
          this.marker.iconKey = v;
          updatePreview();
        });
      });
      const colorRow = new import_obsidian2.Setting(contentEl).setName("Icon color").setDesc(
        "Overrides the icon color for this marker (SVG icons only)."
      );
      let colorTextEl;
      const colorPickerEl = colorRow.controlEl.createEl("input", {
        attr: {
          type: "color",
          style: "margin-left:8px; vertical-align: middle;"
        }
      });
      colorRow.addText((t) => {
        var _a;
        t.setPlaceholder("#d23c3c");
        t.setValue((_a = this.marker.iconColor) != null ? _a : "");
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
    new import_obsidian2.Setting(contentEl).setName("Layer").setDesc("Choose an existing layer or type a new name.").addDropdown((d) => {
      var _a, _b;
      for (const l of this.data.layers) d.addOption(l.name, l.name);
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
    }
    const preview = contentEl.createDiv({ cls: "zoommap-modal-preview" });
    preview.createSpan({ text: "Preview:" });
    const img = preview.createEl("img");
    const resolvePreview = () => {
      var _a, _b, _c, _d;
      if (this.marker.type === "sticker") {
        let url2 = (_a = this.marker.stickerPath) != null ? _a : "";
        if (url2 && !url2.startsWith("data:")) {
          const file = this.app.vault.getAbstractFileByPath(url2);
          if (file instanceof import_obsidian2.TFile) {
            url2 = this.app.vault.getResourcePath(file);
          }
        }
        const size2 = Math.max(
          1,
          Math.round((_b = this.marker.stickerSize) != null ? _b : 64)
        );
        return { url: url2, size: size2 };
      }
      const baseIcon = (_c = this.plugin.settings.icons.find(
        (i) => {
          var _a2;
          return i.key === ((_a2 = this.marker.iconKey) != null ? _a2 : this.plugin.settings.defaultIconKey);
        }
      )) != null ? _c : this.plugin.builtinIcon();
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
        const exists = this.data.layers.find(
          (l) => l.name === newLayerName
        );
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
        if (typeof this.marker.minZoom !== "number")
          delete this.marker.minZoom;
        if (typeof this.marker.maxZoom !== "number")
          delete this.marker.maxZoom;
        if (!this.marker.scaleLikeSticker)
          delete this.marker.scaleLikeSticker;
        if (!this.marker.iconColor)
          delete this.marker.iconColor;
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
    return { start: headerLineStart, end: endExclusive, jsonStart, jsonEnd: Math.max(jsonStart, jsonEnd) };
  }
  async ensureExists(initialImagePath, size) {
    const { file } = await this.readNote();
    const data = {
      image: initialImagePath != null ? initialImagePath : "",
      size,
      layers: [{ id: "default", name: "Default", visible: true, locked: false }],
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
      panClamp: true
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
        return text + `
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

// src/iconFileSuggest.ts
var import_obsidian5 = require("obsidian");
var ImageFileSuggestModal = class extends import_obsidian5.FuzzySuggestModal {
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
var import_obsidian6 = require("obsidian");
var NamePromptModal = class extends import_obsidian6.Modal {
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
    new import_obsidian6.Setting(contentEl).setName("Name").addText((t) => {
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
var import_obsidian7 = require("obsidian");
var RenameLayerModal = class extends import_obsidian7.Modal {
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
    new import_obsidian7.Setting(contentEl).setName("New name").addText((t) => {
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
var DeleteLayerModal = class extends import_obsidian7.Modal {
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
    const actionSetting = new import_obsidian7.Setting(contentEl).setName("Action");
    actionSetting.addDropdown((d) => {
      d.addOption("delete-markers", "Delete markers");
      if (canMove) d.addOption("move", "Move to layer");
      d.setValue(this.mode);
      d.onChange((v) => {
        this.mode = v;
        targetSetting.settingEl.toggle(this.mode === "move");
      });
    });
    const targetSetting = new import_obsidian7.Setting(contentEl).setName("Target layer").addDropdown((d) => {
      for (const t of this.targets) d.addOption(t.id, t.name);
      d.setValue(this.targetId);
      d.onChange((v) => this.targetId = v);
    });
    targetSetting.settingEl.toggle(this.mode === "move");
    if (!this.hasMarkers) {
      new import_obsidian7.Setting(contentEl).setDesc("This layer has no markers.");
    }
    if (!canMove) {
      new import_obsidian7.Setting(contentEl).setDesc("No other layer available to move markers.");
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
var import_obsidian8 = require("obsidian");
var PinSizeEditorModal = class extends import_obsidian8.Modal {
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
    info.style.marginBottom = "8px";
    const list = contentEl.createDiv();
    list.style.display = "flex";
    list.style.flexDirection = "column";
    list.style.gap = "6px";
    for (const row of this.rows) {
      const r = list.createDiv();
      r.style.display = "flex";
      r.style.alignItems = "center";
      r.style.gap = "8px";
      const img = r.createEl("img");
      img.src = row.imgUrl;
      img.style.width = "18px";
      img.style.height = "18px";
      img.style.objectFit = "contain";
      const keySpan = r.createEl("code", { text: row.iconKey });
      keySpan.style.minWidth = "0";
      keySpan.style.whiteSpace = "nowrap";
      const baseSpan = r.createEl("span", {
        text: `${row.baseSize}px default`
      });
      baseSpan.style.fontSize = "11px";
      baseSpan.style.color = "var(--text-muted)";
      const overrideInput = r.createEl("input", { type: "number" });
      overrideInput.style.width = "7ch";
      overrideInput.placeholder = String(row.baseSize);
      if (typeof row.override === "number" && row.override > 0 && row.override !== row.baseSize) {
        overrideInput.value = String(row.override);
      }
      const label = r.createEl("span", { text: "Pixels on this map" });
      label.style.fontSize = "11px";
      label.style.color = "var(--text-muted)";
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
var MapInstance = class extends import_obsidian9.Component {
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
  isCanvas() {
    return this.cfg.renderMode === "canvas";
  }
  onload() {
    void this.bootstrap().catch((err) => {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(err);
      new import_obsidian9.Notice(`Zoom Map error: ${msg}`, 6e3);
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
      this.el.style.setProperty("width", "100%");
      this.el.style.setProperty("height", "auto");
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
      if (this.calibrating) {
        this.calibrating = false;
        this.calibPts = [];
        this.calibPreview = null;
        this.renderCalibrate();
        new import_obsidian9.Notice("Calibration cancelled.", 900);
      } else if (this.measuring) {
        this.measuring = false;
        this.measurePreview = null;
        this.updateMeasureHud();
      }
      this.closeMenu();
    });
    this.registerEvent(
      this.app.vault.on("modify", (f) => {
        if (!(f instanceof import_obsidian9.TFile)) return;
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
    await this.store.ensureExists(this.cfg.imagePath, { w: this.imgW, h: this.imgH });
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
    this.fitToView();
    await this.applyActiveBaseAndOverlays();
    this.setupMeasureOverlay();
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
    if (byPath instanceof import_obsidian9.TFile) return byPath;
    const dest = this.app.metadataCache.getFirstLinkpathDest(pathOrWiki, from);
    return dest instanceof import_obsidian9.TFile ? dest : null;
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
    if (this.pinchActive) return;
    if (!this.panButtonMatches(e)) return;
    this.draggingView = true;
    this.lastPos = { x: e.clientX, y: e.clientY };
  }
  onPointerMove(e) {
    var _a, _b, _c;
    if (!this.ready) return;
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
    this.lastPos = { x: e.clientX, y: e.clientY };
    this.panAccDx += dx;
    this.panAccDy += dy;
    this.requestPanFrame();
  }
  onPointerUp() {
    var _a;
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
            new import_obsidian9.Notice(
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
    matched.forEach((c) => {
      var _a, _b;
      return ((_b = (_a = c.include) == null ? void 0 : _a.favorites) != null ? _b : []).forEach((f) => favsBase.push(f));
    });
    const stickersBase = [];
    matched.forEach((c) => {
      var _a, _b;
      return ((_b = (_a = c.include) == null ? void 0 : _a.stickers) != null ? _b : []).forEach((s) => stickersBase.push(s));
    });
    const pinsGlobal = [...new Set(globals.flatMap((c) => {
      var _a, _b;
      return (_b = (_a = c.include) == null ? void 0 : _a.pinKeys) != null ? _b : [];
    }))];
    const favsGlobal = [];
    globals.forEach((c) => {
      var _a, _b;
      return ((_b = (_a = c.include) == null ? void 0 : _a.favorites) != null ? _b : []).forEach((f) => favsGlobal.push(f));
    });
    const stickersGlobal = [];
    globals.forEach((c) => {
      var _a, _b;
      return ((_b = (_a = c.include) == null ? void 0 : _a.stickers) != null ? _b : []).forEach((s) => stickersGlobal.push(s));
    });
    return { pinsBase, pinsGlobal, favsBase, favsGlobal, stickersBase, stickersGlobal };
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
            const rows = submenu == null ? void 0 : submenu.querySelectorAll(".zm-menu__item");
            rows == null ? void 0 : rows.forEach((r) => {
              const c = r.querySelector(".zm-menu__check");
              if (c) c.textContent = "";
            });
            const chk = rowEl.querySelector(".zm-menu__check");
            if (chk) chk.textContent = "\u2713";
          }).catch((err) => {
            console.error("Set base failed:", err);
            new import_obsidian9.Notice("Failed to set base image.", 2500);
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
    const { pinsBase, pinsGlobal, favsBase, favsGlobal, stickersBase, stickersGlobal } = this.computeCollectionSets();
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
    const imageLayersChildren = [
      { label: "Base", children: baseItems },
      { label: "Overlays", children: overlayItems },
      { type: "separator" },
      {
        label: "Add layer",
        children: [
          { label: "Base\u2026", action: () => this.promptAddLayer("base") },
          { label: "Overlay\u2026", action: () => this.promptAddLayer("overlay") }
        ]
      }
    ];
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
                new import_obsidian9.Notice("Calibration: click two points.", 1500);
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
                  new import_obsidian9.Notice("Cannot delete the last layer.", 2e3);
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
            checked: !((_e = (_d = this.data) == null ? void 0 : _d.panClamp) != null ? _e : true),
            action: async () => {
              var _a2;
              if (!this.data) return;
              const current = (_a2 = this.data.panClamp) != null ? _a2 : true;
              this.data.panClamp = !current;
              await this.saveDataSoon();
              this.applyTransform(this.scale, this.tx, this.ty);
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
    this.openMenu = new ZMMenu();
    this.openMenu.open(e.clientX, e.clientY, items);
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
    document.addEventListener("pointerdown", outside, { capture: true });
    document.addEventListener("contextmenu", rightClickClose, { capture: true });
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
        el.style.display = visible ? "" : "none";
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
    var _a;
    if (!this.data) return;
    const defaultLayer = (_a = this.data.layers.find((l) => l.visible)) != null ? _a : this.data.layers[0];
    const iconKey = this.plugin.settings.defaultIconKey;
    const defaultLink = this.getIconDefaultLink(iconKey);
    const draft = {
      id: generateId("marker"),
      x: nx,
      y: ny,
      layer: defaultLayer.id,
      link: defaultLink != null ? defaultLink : "",
      iconKey,
      tooltip: "",
      scaleLikeSticker: this.plugin.settings.defaultScaleLikeSticker ? true : void 0
    };
    const modal = new MarkerEditorModal(this.app, this.plugin, this.data, draft, (res) => {
      if (res.action === "save" && res.marker && this.data) {
        this.data.markers.push(res.marker);
        void this.saveDataSoon();
        new import_obsidian9.Notice("Marker added.", 900);
        this.renderMarkersOnly();
      }
    });
    modal.open();
  }
  placePinAt(iconKey, nx, ny) {
    var _a;
    if (!this.data) return;
    const defaultLayer = (_a = this.data.layers.find((l) => l.visible)) != null ? _a : this.data.layers[0];
    const defaultLink = this.getIconDefaultLink(iconKey);
    const draft = {
      id: generateId("marker"),
      x: nx,
      y: ny,
      layer: defaultLayer.id,
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
          new import_obsidian9.Notice("Marker added.", 900);
        }
      });
      modal.open();
    } else {
      this.data.markers.push(draft);
      void this.saveDataSoon();
      this.renderMarkersOnly();
      new import_obsidian9.Notice("Marker added.", 900);
    }
  }
  addHudPin(hx, hy) {
    var _a;
    if (!this.data) return;
    const defaultLayer = (_a = this.data.layers.find((l) => l.visible)) != null ? _a : this.data.layers[0];
    const vpRect = this.viewportEl.getBoundingClientRect();
    const iconKey = this.plugin.settings.defaultIconKey;
    const defaultLink = this.getIconDefaultLink(iconKey);
    const draft = {
      id: generateId("marker"),
      x: 0,
      y: 0,
      layer: defaultLayer.id,
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
            new import_obsidian9.Notice("Hud pin added.", 900);
          }
        }
      );
      modal.open();
    } else {
      this.data.markers.push(draft);
      void this.saveDataSoon();
      this.renderMarkersOnly();
      new import_obsidian9.Notice("Hud pin added.", 900);
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
      const vis = this.data.layers.find((l) => l.visible);
      if (vis) layerId = vis.id;
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
          new import_obsidian9.Notice("Marker added (favorite).", 900);
        }
      });
      modal.open();
    } else {
      this.data.markers.push(draft);
      void this.saveDataSoon();
      this.renderMarkersOnly();
      new import_obsidian9.Notice("Marker added (favorite).", 900);
    }
  }
  placeStickerPresetAt(p, nx, ny) {
    var _a;
    if (!this.data) return;
    let layerId = this.data.layers[0].id;
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
          new import_obsidian9.Notice("Sticker added.", 900);
        }
      });
      modal.open();
    } else {
      this.data.markers.push(draft);
      void this.saveDataSoon();
      this.renderMarkersOnly();
      new import_obsidian9.Notice("Sticker added.", 900);
    }
  }
  deleteMarker(m) {
    if (!this.data) return;
    this.data.markers = this.data.markers.filter((mm) => mm.id !== m.id);
    void this.saveDataSoon();
    this.renderMarkersOnly();
    new import_obsidian9.Notice("Marker deleted.", 900);
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
      new import_obsidian9.Notice("No pins on this map yet.", 2e3);
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
        if (!visibleByZoom) host.style.display = "none";
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
        icon.style.height = "auto";
        icon.draggable = false;
        anch.appendChild(icon);
      } else {
        const scaleLike = isScaleLikeSticker(m);
        const info = this.getIconInfo(m.iconKey);
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
          icon.style.height = "auto";
          icon.draggable = false;
          anch.appendChild(icon);
        } else if (scaleLike) {
          const anch = host.createDiv({ cls: "zm-marker-anchor" });
          anch.style.transform = `translate(${-info.anchorX}px, ${-info.anchorY}px)`;
          icon = anch.createEl("img", { cls: "zm-marker-icon" });
          icon.src = imgUrl;
          icon.style.width = `${info.size}px`;
          icon.style.height = "auto";
          icon.draggable = false;
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
          icon.style.height = "auto";
          icon.draggable = false;
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
        this.openMenu = new ZMMenu();
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
        document.addEventListener("pointerdown", outside, {
          capture: true
        });
        document.addEventListener("contextmenu", rightClickClose, {
          capture: true
        });
        document.addEventListener("keydown", keyClose, {
          capture: true
        });
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
    var _a, _b;
    if (!this.ready) return;
    if (!this.tooltipEl) {
      this.tooltipEl = this.viewportEl.createDiv({ cls: "zm-tooltip" });
      this.tooltipEl.addEventListener("mouseenter", () => this.cancelHideTooltip());
      this.tooltipEl.addEventListener("mouseleave", () => this.hideTooltipSoon());
    }
    this.tooltipEl.style.maxWidth = `${(_a = this.plugin.settings.hoverMaxWidth) != null ? _a : 360}px`;
    this.tooltipEl.style.maxHeight = `${(_b = this.plugin.settings.hoverMaxHeight) != null ? _b : 260}px`;
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
    var _a, _b, _c;
    const key = iconKey != null ? iconKey : this.plugin.settings.defaultIconKey;
    const profile = (_a = this.plugin.settings.icons.find((i) => i.key === key)) != null ? _a : this.plugin.builtinIcon();
    const baseSize = profile.size;
    const overrideSize = (_c = (_b = this.data) == null ? void 0 : _b.pinSizeOverrides) == null ? void 0 : _c[key];
    const size = overrideSize && Number.isFinite(overrideSize) && overrideSize > 0 ? overrideSize : baseSize;
    const imgUrl = this.resolveResourceUrl(profile.pathOrDataUrl);
    return {
      imgUrl,
      size,
      anchorX: profile.anchorX,
      anchorY: profile.anchorY
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
    if (!m.link) return;
    void this.app.workspace.openLinkText(m.link, this.cfg.sourcePath);
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
        new import_obsidian9.Notice(`Base image not found: ${path}`);
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
      new import_obsidian9.Notice(`Failed to reload markers: ${message}`);
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
      if (!(af instanceof import_obsidian9.TFile)) return false;
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
      new import_obsidian9.Notice("Base already exists.", 1500);
      return;
    }
    this.data.bases = (_a = this.data.bases) != null ? _a : [];
    this.data.bases.push({ path, name: (name != null ? name : "") || void 0 });
    await this.saveDataSoon();
    void this.appendLayerToYaml("base", path, name != null ? name : "");
    new import_obsidian9.Notice("Base added.", 1200);
  }
  async addOverlayByPath(path, name) {
    var _a;
    if (!this.data) return;
    this.data.overlays = (_a = this.data.overlays) != null ? _a : [];
    if (this.data.overlays.some((o) => o.path === path)) {
      new import_obsidian9.Notice("Overlay already exists.", 1500);
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
    new import_obsidian9.Notice("Overlay added.", 1200);
  }
  async appendLayerToYaml(kind, path, name) {
    try {
      const key = kind === "base" ? "imageBases" : "imageOverlays";
      const ok = await this.updateYamlList(key, path, { name });
      if (!ok) new import_obsidian9.Notice("Added, but YAML could not be updated.", 2500);
    } catch (err) {
      console.error("Zoom Map: failed to update YAML", err);
      new import_obsidian9.Notice("Added, but YAML update failed.", 2500);
    }
  }
  async updateYamlList(key, newPath, opts) {
    if (typeof this.cfg.sectionStart !== "number" || typeof this.cfg.sectionEnd !== "number") return false;
    const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
    if (!(af instanceof import_obsidian9.TFile)) return false;
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
    new import_obsidian9.Notice("Layer renamed.", 1e3);
  }
  async deleteMarkerLayer(layer, decision) {
    if (!this.data) return;
    const others = this.data.layers.filter((l) => l.id !== layer.id);
    if (others.length === 0) {
      new import_obsidian9.Notice("Cannot delete the last layer.", 2e3);
      return;
    }
    if (decision.mode === "move") {
      const targetId = decision.targetId;
      if (!targetId || targetId === layer.id) {
        new import_obsidian9.Notice("Invalid target layer.", 1500);
        return;
      }
      for (const m of this.data.markers) if (m.layer === layer.id) m.layer = targetId;
    } else {
      this.data.markers = this.data.markers.filter((m) => m.layer !== layer.id);
    }
    this.data.layers = this.data.layers.filter((l) => l.id !== layer.id);
    await this.saveDataSoon();
    this.renderMarkersOnly();
    new import_obsidian9.Notice("Layer deleted.", 1e3);
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
            void Promise.resolve(it.action(row, this)).catch((err) => console.error("Menu item action failed:", err));
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
    const pad = 6;
    const rect = el.getBoundingClientRect();
    let x = clientX;
    let y = clientY;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
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

// src/collectionsModals.ts
var import_obsidian10 = require("obsidian");
function deepClone(x) {
  if (typeof structuredClone === "function") return structuredClone(x);
  const json = JSON.stringify(x);
  return JSON.parse(json);
}
var CollectionEditorModal = class extends import_obsidian10.Modal {
  constructor(app, plugin, collection, onDone) {
    var _a, _b, _c, _d, _e, _f;
    super(app);
    this.plugin = plugin;
    this.original = collection;
    this.working = deepClone(collection);
    this.working.bindings = (_a = this.working.bindings) != null ? _a : { basePaths: [] };
    this.working.bindings.basePaths = (_b = this.working.bindings.basePaths) != null ? _b : [];
    this.working.include = (_c = this.working.include) != null ? _c : { pinKeys: [], favorites: [], stickers: [] };
    this.working.include.pinKeys = (_d = this.working.include.pinKeys) != null ? _d : [];
    this.working.include.favorites = (_e = this.working.include.favorites) != null ? _e : [];
    this.working.include.stickers = (_f = this.working.include.stickers) != null ? _f : [];
    this.onDone = onDone;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Edit collection" });
    new import_obsidian10.Setting(contentEl).setName("Name").addText((t) => {
      var _a;
      t.setValue((_a = this.working.name) != null ? _a : "");
      t.onChange((v) => this.working.name = v.trim());
    });
    contentEl.createEl("h3", { text: "Bindings (base images)" });
    const pathsWrap = contentEl.createDiv();
    const renderPaths = () => {
      pathsWrap.empty();
      if (!this.working.bindings.basePaths.length) {
        pathsWrap.createEl("div", { text: "No base images bound." });
      } else {
        this.working.bindings.basePaths.forEach((p, idx) => {
          const row = pathsWrap.createDiv({ cls: "zoommap-collection-base-row" });
          const code = row.createEl("code", { text: p });
          code.style.whiteSpace = "pre-wrap";
          code.style.wordBreak = "break-word";
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
          if (!file) return;
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
      pinWrap.createEl("div", {
        text: "Select pins from the icon library:",
        attr: { style: "margin-bottom:6px; font-weight:600;" }
      });
      const lib = (_a = this.plugin.settings.icons) != null ? _a : [];
      if (lib.length === 0) {
        pinWrap.createEl("div", {
          text: "No icons in library yet.",
          attr: { style: "color: var(--text-muted);" }
        });
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
          const img = cell.createEl("img", {
            attr: { style: "width:18px;height:18px;object-fit:contain;flex:0 0 auto;" }
          });
          const src = (_a2 = ico.pathOrDataUrl) != null ? _a2 : "";
          if (typeof src === "string") {
            if (src.startsWith("data:")) {
              img.src = src;
            } else if (src) {
              const f = this.app.vault.getAbstractFileByPath(src);
              if (f instanceof import_obsidian10.TFile) {
                img.src = this.app.vault.getResourcePath(f);
              }
            }
          }
          const label = cell.createEl("span", { text: ico.key });
          label.style.flex = "1 1 auto";
          label.style.minWidth = "0";
          label.style.whiteSpace = "normal";
          label.style.wordBreak = "break-word";
          label.style.overflowWrap = "anywhere";
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
        favWrap.createEl("div", {
          text: "No favorites in this collection.",
          attr: { style: "color: var(--text-muted);" }
        });
      }
      list.forEach((p, idx) => {
        var _a, _b, _c, _d, _e;
        const row = favWrap.createDiv({ cls: "zoommap-collection-fav-row" });
        const name = row.createEl("input", { type: "text" });
        name.value = (_a = p.name) != null ? _a : "";
        name.oninput = () => p.name = name.value.trim();
        const iconSel = row.createEl("select");
        const addOpt = (val, labelText) => {
          const o = document.createElement("option");
          o.value = val;
          o.textContent = labelText;
          iconSel.appendChild(o);
        };
        addOpt("", "(default)");
        ((_b = this.plugin.settings.icons) != null ? _b : []).forEach((ico) => addOpt(ico.key, ico.key));
        iconSel.value = (_c = p.iconKey) != null ? _c : "";
        iconSel.onchange = () => p.iconKey = iconSel.value || void 0;
        const layer = row.createEl("input", { type: "text" });
        layer.placeholder = "Layer (optional)";
        layer.value = (_d = p.layerName) != null ? _d : "";
        layer.oninput = () => p.layerName = layer.value.trim() || void 0;
        const ed = row.createEl("input", { type: "checkbox" });
        ed.checked = !!p.openEditor;
        ed.onchange = () => p.openEditor = ed.checked;
        const link = row.createEl("input", { type: "text" });
        link.placeholder = "Link template (optional)";
        link.value = (_e = p.linkTemplate) != null ? _e : "";
        link.oninput = () => p.linkTemplate = link.value.trim() || void 0;
        const del2 = row.createEl("button", { text: "Delete" });
        del2.onclick = () => {
          this.working.include.favorites.splice(idx, 1);
          renderFavs();
        };
      });
      const add = favWrap.createEl("button", { text: "Add favorite" });
      add.onclick = () => {
        const p = { name: `Favorite ${this.working.include.favorites.length + 1}`, openEditor: false };
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
        stickerWrap.createEl("div", {
          text: "No stickers in this collection.",
          attr: { style: "color: var(--text-muted);" }
        });
      }
      list.forEach((s, idx) => {
        var _a, _b, _c, _d;
        const row = stickerWrap.createDiv({ cls: "zoommap-collection-sticker-row" });
        const name = row.createEl("input", { type: "text" });
        name.value = (_a = s.name) != null ? _a : "";
        name.oninput = () => s.name = name.value.trim();
        const path = row.createEl("input", { type: "text" });
        path.placeholder = "Image path or data URL";
        path.value = (_b = s.imagePath) != null ? _b : "";
        path.oninput = () => s.imagePath = path.value.trim();
        const size = row.createEl("input", { type: "number" });
        size.value = String((_c = s.size) != null ? _c : 64);
        size.oninput = () => {
          const n = Number(size.value);
          if (Number.isFinite(n) && n > 0) s.size = Math.round(n);
        };
        const layer = row.createEl("input", { type: "text" });
        layer.placeholder = "Layer (optional)";
        layer.value = (_d = s.layerName) != null ? _d : "";
        layer.oninput = () => s.layerName = layer.value.trim() || void 0;
        const pick = row.createEl("button", { text: "Pick\u2026" });
        pick.onclick = () => {
          new ImageFileSuggestModal(this.app, (file) => {
            if (file) {
              s.imagePath = file.path;
              renderStickers();
            }
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
        const s = { name: `Sticker ${this.working.include.stickers.length + 1}`, imagePath: "", size: 64, openEditor: false };
        this.working.include.stickers.push(s);
        renderStickers();
      };
    };
    renderStickers();
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
  onClose() {
    this.contentEl.empty();
  }
};

// src/jsonFileSuggest.ts
var import_obsidian11 = require("obsidian");
var JsonFileSuggestModal = class extends import_obsidian11.FuzzySuggestModal {
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
var import_obsidian12 = require("obsidian");
var FaIconPickerModal = class extends import_obsidian12.Modal {
  constructor(app, folder, onChoose) {
    super(app);
    this.files = [];
    this.listEl = null;
    this.searchInput = null;
    this.selected = null;
    this.selectedEl = null;
    this.addButton = null;
    this.folder = (0, import_obsidian12.normalizePath)(folder);
    this.onChoose = onChoose;
  }
  collectFiles() {
    var _a;
    const result = [];
    const root = this.app.vault.getAbstractFileByPath(this.folder);
    if (!(root instanceof import_obsidian12.TFolder)) {
      console.warn(`Zoom Map: SVG icon folder not found: ${this.folder}`);
      this.files = [];
      return;
    }
    const stack = [root];
    while (stack.length > 0) {
      const current = stack.pop();
      for (const child of current.children) {
        if (child instanceof import_obsidian12.TFolder) {
          stack.push(child);
        } else if (child instanceof import_obsidian12.TFile) {
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
var import_obsidian13 = require("obsidian");
var PreferencesModal = class extends import_obsidian13.Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Preferences" });
    new import_obsidian13.Setting(contentEl).setName('Pins: "scale like sticker" by default').setDesc('When enabled, new pins will have "scale like sticker" enabled in the marker editor.').addToggle((toggle) => {
      toggle.setValue(!!this.plugin.settings.defaultScaleLikeSticker).onChange(async (value) => {
        this.plugin.settings.defaultScaleLikeSticker = value;
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
var DEFAULT_SETTINGS = {
  icons: [
    { key: "pinRed", pathOrDataUrl: svgPinDataUrl("#d23c3c"), size: 24, anchorX: 12, anchorY: 12 },
    { key: "pinBlue", pathOrDataUrl: svgPinDataUrl("#3c62d2"), size: 24, anchorX: 12, anchorY: 12 }
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
  defaultScaleLikeSticker: false
};
function parseBasesYaml(v) {
  if (!Array.isArray(v)) return [];
  return v.map((it) => {
    if (typeof it === "string") return { path: it };
    if (it && typeof it === "object" && "path" in it) {
      const obj = it;
      if (typeof obj.path === "string") {
        return { path: obj.path, name: typeof obj.name === "string" ? obj.name : void 0 };
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
    const file = app.vault.getAbstractFileByPath((0, import_obsidian14.normalizePath)(markersPath));
    if (!(file instanceof import_obsidian14.TFile)) return null;
    const raw = await app.vault.read(file);
    const parsed = JSON.parse(raw);
    let fw = NaN;
    let fh = NaN;
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
var ZoomMapPlugin = class extends import_obsidian14.Plugin {
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
          const parsed = (0, import_obsidian14.parseYaml)(src);
          if (parsed && typeof parsed === "object") {
            opts = parsed;
          }
        } catch (error) {
          console.error("Zoom Map: failed to parse zoommap block", error);
        }
        const yamlBases = parseBasesYaml(opts.imageBases);
        const yamlOverlays = parseOverlaysYaml(opts.imageOverlays);
        const yamlMetersPerPixel = parseScaleYaml(opts.scale);
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
        const markersPath = (0, import_obsidian14.normalizePath)(markersPathRaw != null ? markersPathRaw : `${image}.markers.json`);
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
          responsive
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
    var _a, _b, _c, _d, _e, _f, _g;
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
    const p = (0, import_obsidian14.normalizePath)(path);
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
      if (existing instanceof import_obsidian14.TFile) {
        await this.app.vault.modify(existing, json);
      } else {
        await this.app.vault.create(p, json);
      }
      ext.libraryFilePath = p;
      await this.saveSettings();
      new import_obsidian14.Notice(`Library saved to ${p}`, 2e3);
    } catch (e) {
      console.error("Save library failed", e);
      new import_obsidian14.Notice("Failed to save library.", 2500);
    }
  }
  async loadLibraryFromFile(file) {
    try {
      const raw = await this.app.vault.read(file);
      const obj = JSON.parse(raw);
      if (!isPlainObject(obj)) {
        new import_obsidian14.Notice("Invalid library file.", 2500);
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
      new import_obsidian14.Notice(`Library loaded from ${file.path}`, 2e3);
    } catch (e) {
      console.error("Load library failed", e);
      new import_obsidian14.Notice("Failed to load library.", 2500);
    }
  }
  async downloadFontAwesomeZip() {
    var _a;
    const ext = this.settings;
    const folder = (0, import_obsidian14.normalizePath)(((_a = ext.faFolderPath) == null ? void 0 : _a.trim()) || "ZoomMap/SVGs");
    const zipPath = (0, import_obsidian14.normalizePath)(`${folder}/fontawesome-free.zip`);
    try {
      if (!this.app.vault.getAbstractFileByPath(folder)) {
        await this.app.vault.createFolder(folder);
      }
      new import_obsidian14.Notice("Downloading font awesome free zip\u2026", 2500);
      const res = await (0, import_obsidian14.requestUrl)({
        url: DEFAULT_FA_ZIP_URL,
        method: "GET"
      });
      await this.app.vault.adapter.writeBinary(zipPath, res.arrayBuffer);
      new import_obsidian14.Notice(
        `Downloaded Font Awesome ZIP to ${zipPath}. Please unzip it so that SVG files are available in this folder.`,
        6e3
      );
    } catch (e) {
      console.error("Download Font Awesome ZIP failed", e);
      new import_obsidian14.Notice("Failed to download font awesome zip.", 4e3);
    }
  }
  async downloadRpgAwesomeZip() {
    var _a;
    const ext = this.settings;
    const folder = (0, import_obsidian14.normalizePath)(((_a = ext.faFolderPath) == null ? void 0 : _a.trim()) || "ZoomMap/SVGs");
    const zipPath = (0, import_obsidian14.normalizePath)(`${folder}/rpg-awesome.zip`);
    try {
      if (!this.app.vault.getAbstractFileByPath(folder)) {
        await this.app.vault.createFolder(folder);
      }
      new import_obsidian14.Notice("Downloading rpg awesome SVG pack\u2026", 2500);
      const res = await (0, import_obsidian14.requestUrl)({
        url: DEFAULT_RPG_ZIP_URL,
        method: "GET"
      });
      await this.app.vault.adapter.writeBinary(zipPath, res.arrayBuffer);
      new import_obsidian14.Notice(
        `Downloaded RPG Awesome ZIP to ${zipPath}. Please unzip it so that the SVG files are available in this folder.`,
        6e3
      );
    } catch (e) {
      console.error("Download RPG Awesome ZIP failed", e);
      new import_obsidian14.Notice("Failed to download rpg awesome zip.", 4e3);
    }
  }
  async rescanSvgFolder() {
    var _a;
    const ext = this.settings;
    const folder = (0, import_obsidian14.normalizePath)(((_a = ext.faFolderPath) == null ? void 0 : _a.trim()) || "ZoomMap/SVGs");
    const files = this.app.vault.getFiles();
    const prefix = folder.endsWith("/") ? folder : folder + "/";
    const count = files.filter((f) => {
      var _a2;
      if (((_a2 = f.extension) == null ? void 0 : _a2.toLowerCase()) !== "svg") return false;
      return f.path === folder || f.path.startsWith(prefix);
    }).length;
    new import_obsidian14.Notice(
      `Found ${count} SVG files under ${folder}. They will be available in the \u201CAdd SVG icon\u201D picker.`,
      4e3
    );
    return count;
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
var ZoomMapSettingTab = class extends import_obsidian14.PluginSettingTab {
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
      new import_obsidian14.Notice("Failed to add font awesome icon.", 2500);
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
        if (f instanceof import_obsidian14.TFile) {
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
    new import_obsidian14.Setting(containerEl).setName("Storage").setHeading();
    new import_obsidian14.Setting(containerEl).setName("Storage location by default").setDesc(
      "Store marker data in JSON beside image, or inline in the note."
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
    new import_obsidian14.Setting(containerEl).setName("Layout").setHeading();
    new import_obsidian14.Setting(containerEl).setName("Default width when wrapped").setDesc(
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
    new import_obsidian14.Setting(containerEl).setName("Interaction").setHeading();
    new import_obsidian14.Setting(containerEl).setName("Mouse wheel zoom factor").setDesc("Multiplier per step. 1.1 = 10% per tick.").addText(
      (t) => t.setPlaceholder("1.1").setValue(String(this.plugin.settings.wheelZoomFactor)).onChange((v) => {
        const n = Number(v);
        if (!Number.isNaN(n) && n > 1.001 && n < 2.5) {
          this.plugin.settings.wheelZoomFactor = n;
          void this.plugin.saveSettings();
        }
      })
    );
    new import_obsidian14.Setting(containerEl).setName("Panning mouse button").setDesc("Which mouse button pans the map?").addDropdown((d) => {
      var _a2;
      d.addOption("left", "Left");
      d.addOption("middle", "Middle");
      d.setValue((_a2 = this.plugin.settings.panMouseButton) != null ? _a2 : "left");
      d.onChange((v) => {
        this.plugin.settings.panMouseButton = v === "middle" ? "middle" : "left";
        void this.plugin.saveSettings();
      });
    });
    new import_obsidian14.Setting(containerEl).setName("Hover popover size").setDesc("Max width and height in pixels.").addText(
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
    new import_obsidian14.Setting(containerEl).setName("Force popovers without ctrl").setDesc("Opens preview popovers on simple hover.").addToggle(
      (t) => t.setValue(!!this.plugin.settings.forcePopoverWithoutModKey).onChange((v) => {
        this.plugin.settings.forcePopoverWithoutModKey = v;
        void this.plugin.saveSettings();
      })
    );
    new import_obsidian14.Setting(containerEl).setName("Open editor when placing pin from menu").setDesc(
      "When enabled, placing a pin from the pins menu opens the marker editor."
    ).addToggle(
      (t) => t.setValue(!!this.plugin.settings.pinPlaceOpensEditor).onChange((v) => {
        this.plugin.settings.pinPlaceOpensEditor = v;
        void this.plugin.saveSettings();
      })
    );
    new import_obsidian14.Setting(containerEl).setName("Preferences").setDesc("Global defaults for marker creation and behavior.").addButton(
      (b) => b.setButtonText("Open\u2026").onClick(() => {
        new PreferencesModal(this.app, this.plugin).open();
      })
    );
    new import_obsidian14.Setting(containerEl).setName("Ruler").setHeading();
    const applyStyleToAll = () => {
      var _a2, _b;
      const color = ((_a2 = this.plugin.settings.measureLineColor) != null ? _a2 : "var(--text-accent)").trim();
      const widthPx = Math.max(
        1,
        (_b = this.plugin.settings.measureLineWidth) != null ? _b : 2
      );
      document.querySelectorAll(".zm-root").forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.setProperty("--zm-measure-color", color);
          el.style.setProperty("--zm-measure-width", `${widthPx}px`);
        }
      });
    };
    const colorRow = new import_obsidian14.Setting(containerEl).setName("Line color").setDesc("CSS color, e.g. #ff0055.");
    colorRow.addText(
      (t) => {
        var _a2;
        return t.setPlaceholder("Default").setValue(
          (_a2 = this.plugin.settings.measureLineColor) != null ? _a2 : "var(--text-accent)"
        ).onChange((v) => {
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
    new import_obsidian14.Setting(containerEl).setName("Line width").setDesc("Stroke width in pixels.").addText(
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
    new import_obsidian14.Setting(containerEl).setName("Custom units").setHeading();
    const customUnitsWrap = containerEl.createDiv();
    const renderCustomUnits = () => {
      var _a2;
      customUnitsWrap.empty();
      const ext = this.plugin.settings;
      (_a2 = ext.customUnits) != null ? _a2 : ext.customUnits = [];
      const units = ext.customUnits;
      if (units.length === 0) {
        customUnitsWrap.createEl("div", {
          text: "No custom units defined yet."
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
        text: "Add custom unit"
      });
      addBtn.style.marginTop = "6px";
      addBtn.onclick = async () => {
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
        await this.plugin.saveSettings();
        renderCustomUnits();
      };
    };
    renderCustomUnits();
    new import_obsidian14.Setting(containerEl).setName("Collections (base-bound)").setHeading();
    const collectionsWrap = containerEl.createDiv();
    const renderCollections = () => {
      var _a2;
      collectionsWrap.empty();
      const hint = collectionsWrap.createEl("div", {
        text: "Collections bundle pins, favorites and stickers for specific base images. Create a 'global' collection without bindings for items that should be available everywhere."
      });
      hint.style.marginBottom = "8px";
      const list = collectionsWrap.createDiv();
      const cols = (_a2 = this.plugin.settings.baseCollections) != null ? _a2 : [];
      if (cols.length === 0) {
        list.createEl("div", { text: "No collections yet." });
      } else {
        cols.forEach((c) => {
          var _a3, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
          const row = list.createDiv({ cls: "zoommap-collections-row" });
          const left = row.createDiv();
          const name = left.createEl("div", {
            text: c.name || "(unnamed collection)"
          });
          name.style.fontWeight = "600";
          const meta = left.createEl("div", {
            text: `${(_c = (_b = (_a3 = c.bindings) == null ? void 0 : _a3.basePaths) == null ? void 0 : _b.length) != null ? _c : 0} bases \u2022 ${(_f = (_e = (_d = c.include) == null ? void 0 : _d.pinKeys) == null ? void 0 : _e.length) != null ? _f : 0} pins \u2022 ${(_i = (_h = (_g = c.include) == null ? void 0 : _g.favorites) == null ? void 0 : _h.length) != null ? _i : 0} favorites \u2022 ${(_l = (_k = (_j = c.include) == null ? void 0 : _j.stickers) == null ? void 0 : _k.length) != null ? _l : 0} stickers`
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
                var _a4;
                if (deleted) {
                  const arr = (_a4 = this.plugin.settings.baseCollections) != null ? _a4 : [];
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
              }
            ).open();
          };
          const del = row.createEl("button", { text: "Delete" });
          del.onclick = async () => {
            var _a4;
            const arr = (_a4 = this.plugin.settings.baseCollections) != null ? _a4 : [];
            const pos = arr.indexOf(c);
            if (pos >= 0) arr.splice(pos, 1);
            await this.plugin.saveSettings();
            renderCollections();
          };
        });
      }
      const actions = collectionsWrap.createDiv({
        cls: "zoommap-collections-actions"
      });
      const add = actions.createEl("button", { text: "Add collection" });
      add.onclick = () => {
        const fresh = {
          id: `col-${Math.random().toString(36).slice(2, 8)}`,
          name: "New Collection",
          bindings: { basePaths: [] },
          include: { pinKeys: [], favorites: [], stickers: [] }
        };
        new CollectionEditorModal(
          this.app,
          this.plugin,
          fresh,
          async ({ updated, deleted }) => {
            var _a3;
            if (deleted) return;
            if (updated) {
              this.plugin.settings.baseCollections = (_a3 = this.plugin.settings.baseCollections) != null ? _a3 : [];
              this.plugin.settings.baseCollections.push(fresh);
              await this.plugin.saveSettings();
              renderCollections();
            }
          }
        ).open();
      };
    };
    renderCollections();
    new import_obsidian14.Setting(containerEl).setName("Marker icons (library)").setHeading();
    const libRow = new import_obsidian14.Setting(containerEl).setName("Library file (icons + collections)").setDesc(
      "Choose a JSON file in the vault to save/load your icon library and collections."
    );
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
        new JsonFileSuggestModal(this.app, async (file) => {
          this.plugin.settings.libraryFilePath = file.path;
          await this.plugin.saveSettings();
          this.display();
        }).open();
      })
    );
    libRow.addButton(
      (b) => b.setButtonText("Save now").onClick(async () => {
        var _a2, _b;
        const ext = this.plugin.settings;
        const p = (_b = (_a2 = ext.libraryFilePath) == null ? void 0 : _a2.trim()) != null ? _b : "ZoomMap/library.json";
        await this.plugin.saveLibraryToPath(p);
      })
    );
    libRow.addButton(
      (b) => b.setButtonText("Load\u2026").onClick(() => {
        new JsonFileSuggestModal(this.app, async (file) => {
          await this.plugin.loadLibraryFromFile(file);
          this.display();
        }).open();
      })
    );
    new import_obsidian14.Setting(containerEl).setName("SVG icons").setHeading();
    const svgFolderRow = new import_obsidian14.Setting(containerEl).setName("SVG icon folder in vault").setDesc(
      "Folder that contains SVG packs."
    );
    svgFolderRow.addText((t) => {
      var _a2;
      const ext = this.plugin.settings;
      t.setPlaceholder("ZoomMap/SVGs");
      t.setValue((_a2 = ext.faFolderPath) != null ? _a2 : "ZoomMap/SVGs");
      t.onChange((v) => {
        ext.faFolderPath = (v || "ZoomMap/SVGs").trim();
        void this.plugin.saveSettings();
      });
    });
    svgFolderRow.addButton(
      (b) => b.setButtonText("Ensure folder").onClick(async () => {
        var _a2;
        const ext = this.plugin.settings;
        const folder = (0, import_obsidian14.normalizePath)(
          ((_a2 = ext.faFolderPath) == null ? void 0 : _a2.trim()) || "ZoomMap/SVGs"
        );
        if (!this.app.vault.getAbstractFileByPath(folder)) {
          await this.app.vault.createFolder(folder);
          new import_obsidian14.Notice(`Created folder: ${folder}`, 2e3);
        } else {
          new import_obsidian14.Notice("Folder already exists.", 1500);
        }
      })
    );
    svgFolderRow.addButton(
      (b) => b.setButtonText("Rescan icons").onClick(async () => {
        await this.plugin.rescanSvgFolder();
      })
    );
    const svgDownloadRow = new import_obsidian14.Setting(containerEl).setName("Download icon packs").setDesc("Download common SVG packs into the configured folder.");
    svgDownloadRow.addButton(
      (b) => b.setButtonText("Dl font awesome free").onClick(async () => {
        await this.plugin.downloadFontAwesomeZip();
      })
    );
    svgDownloadRow.addButton(
      (b) => b.setButtonText("Dl rpg awesome").onClick(async () => {
        await this.plugin.downloadRpgAwesomeZip();
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
        suggestions.push({
          label: baseLink,
          value: baseLink
        });
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
      return suggestions;
    };
    const allLinkSuggestions = buildLinkSuggestions();
    const attachLinkAutocomplete = (input, getValue, setValue) => {
      const wrapper = input.parentElement;
      if (!(wrapper instanceof HTMLElement)) return;
      wrapper.classList.add("zoommap-link-input-wrapper");
      const listEl = wrapper.createDiv({
        cls: "zoommap-link-suggestions"
      });
      listEl.style.display = "none";
      const updateList = (query) => {
        const q = query.trim().toLowerCase();
        listEl.empty();
        if (!q) {
          listEl.style.display = "none";
          return;
        }
        const maxItems = 20;
        const matches = allLinkSuggestions.filter(
          (s) => s.value.toLowerCase().includes(q) || s.label.toLowerCase().includes(q)
        ).slice(0, maxItems);
        if (matches.length === 0) {
          listEl.style.display = "none";
          return;
        }
        listEl.style.display = "";
        matches.forEach((s) => {
          const row = listEl.createDiv({
            cls: "zoommap-link-suggestion-item"
          });
          row.setText(s.label);
          row.addEventListener("mousedown", (ev) => {
            ev.preventDefault();
            setValue(s.value);
            listEl.style.display = "none";
          });
        });
      };
      input.addEventListener("input", () => {
        updateList(input.value);
      });
      input.addEventListener("blur", () => {
        window.setTimeout(() => {
          listEl.style.display = "none";
        }, 150);
      });
    };
    const isSvgIcon = (icon) => {
      var _a2;
      const src = (_a2 = icon.pathOrDataUrl) != null ? _a2 : "";
      if (typeof src !== "string") return false;
      const lower = src.toLowerCase();
      return lower.startsWith("data:image/svg+xml") || lower.endsWith(".svg");
    };
    const svgIconsHead = containerEl.createDiv({
      cls: "zm-icons-grid-head zm-grid"
    });
    svgIconsHead.createSpan({ text: "Name" });
    svgIconsHead.createSpan({ text: "Preview / color / link" });
    svgIconsHead.createSpan({ text: "Size" });
    const headSvgAX = svgIconsHead.createSpan({ cls: "zm-icohead" });
    const svgAxIco = headSvgAX.createSpan();
    (0, import_obsidian14.setIcon)(svgAxIco, "anchor");
    headSvgAX.appendText(" X");
    const headSvgAY = svgIconsHead.createSpan({ cls: "zm-icohead" });
    const svgAyIco = headSvgAY.createSpan();
    (0, import_obsidian14.setIcon)(svgAyIco, "anchor");
    headSvgAY.appendText(" Y");
    const headSvgTrash = svgIconsHead.createSpan();
    (0, import_obsidian14.setIcon)(headSvgTrash, "trash");
    const svgIconsGrid = containerEl.createDiv({
      cls: "zm-icons-grid zm-grid"
    });
    new import_obsidian14.Setting(containerEl).setName("Add SVG icon").setDesc("Create a pin icon from an SVG file in the configured folder.").addButton(
      (b) => b.setButtonText("Add SVG icon").onClick(() => {
        var _a2;
        const ext = this.plugin.settings;
        const folder = ((_a2 = ext.faFolderPath) == null ? void 0 : _a2.trim()) || "ZoomMap/SVGs";
        new FaIconPickerModal(this.app, folder, (file) => {
          void this.addFontAwesomeIcon(file);
        }).open();
      })
    );
    new import_obsidian14.Setting(containerEl).setName("Image icons").setHeading();
    const imgIconsHead = containerEl.createDiv({
      cls: "zm-icons-grid-head zm-grid"
    });
    imgIconsHead.createSpan({ text: "Name" });
    imgIconsHead.createSpan({ text: "Path / data:URL + default link" });
    imgIconsHead.createSpan({ text: "Size" });
    const headImgAX = imgIconsHead.createSpan({ cls: "zm-icohead" });
    const axIco = headImgAX.createSpan();
    (0, import_obsidian14.setIcon)(axIco, "anchor");
    headImgAX.appendText(" X");
    const headImgAY = imgIconsHead.createSpan({ cls: "zm-icohead" });
    const ayIco = headImgAY.createSpan();
    (0, import_obsidian14.setIcon)(ayIco, "anchor");
    headImgAY.appendText(" Y");
    const headImgTrash = imgIconsHead.createSpan();
    (0, import_obsidian14.setIcon)(headImgTrash, "trash");
    const imgIconsGrid = containerEl.createDiv({
      cls: "zm-icons-grid zm-grid"
    });
    const renderIcons = () => {
      var _a2, _b, _c, _d, _e;
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
          const previewCell = row.createDiv();
          previewCell.style.display = "flex";
          previewCell.style.alignItems = "center";
          previewCell.style.gap = "6px";
          previewCell.style.flexWrap = "wrap";
          const img = previewCell.createEl("img", {
            cls: "zoommap-fa-picker-icon"
          });
          let src = (_a2 = icon.pathOrDataUrl) != null ? _a2 : "";
          if (typeof src === "string" && !src.startsWith("data:") && src) {
            const f = this.app.vault.getAbstractFileByPath(src);
            if (f instanceof import_obsidian14.TFile) {
              src = this.app.vault.getResourcePath(f);
            }
          }
          img.src = typeof src === "string" ? src : "";
          img.style.width = "24px";
          img.style.height = "24px";
          img.style.objectFit = "contain";
          const rawSrc = (_b = icon.pathOrDataUrl) != null ? _b : "";
          const isSvgData = typeof rawSrc === "string" && rawSrc.startsWith("data:image/svg+xml");
          let currentColor = "";
          if (isSvgData) {
            const c = this.getSvgColorFromDataUrl(rawSrc);
            if (c) currentColor = c;
          }
          const colorInput = previewCell.createEl("input", { type: "text" });
          colorInput.placeholder = "Color";
          colorInput.style.width = "9ch";
          colorInput.value = currentColor;
          const colorPicker = previewCell.createEl("input", {
            type: "color"
          });
          colorPicker.style.width = "32px";
          colorPicker.style.padding = "0";
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
                if (f instanceof import_obsidian14.TFile) {
                  out = this.app.vault.getResourcePath(f);
                }
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
          linkInput.placeholder = "Default link (optional)";
          linkInput.style.flex = "1 1 45%";
          linkInput.style.minWidth = "140px";
          linkInput.style.maxWidth = "260px";
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
          (0, import_obsidian14.setIcon)(del, "trash");
          del.onclick = () => {
            this.plugin.settings.icons = this.plugin.settings.icons.filter(
              (i) => i !== icon
            );
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
          path.value = (_d = icon.pathOrDataUrl) != null ? _d : "";
          path.style.width = "50%";
          path.oninput = () => {
            icon.pathOrDataUrl = path.value.trim();
            void this.plugin.saveSettings();
          };
          const pick = pathWrap.createEl("button", {
            attr: { title: "Choose file\u2026" }
          });
          pick.classList.add("zm-icon-btn");
          (0, import_obsidian14.setIcon)(pick, "folder-open");
          pick.onclick = () => {
            new ImageFileSuggestModal(this.app, (file) => {
              icon.pathOrDataUrl = file.path;
              void this.plugin.saveSettings();
              renderIcons();
            }).open();
          };
          const linkInput = pathWrap.createEl("input", { type: "text" });
          linkInput.placeholder = "Default link (optional)";
          linkInput.value = (_e = icon.defaultLink) != null ? _e : "";
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
          const del = row.createEl("button", { attr: { title: "Delete" } });
          del.classList.add("zm-icon-btn");
          (0, import_obsidian14.setIcon)(del, "trash");
          del.onclick = () => {
            this.plugin.settings.icons = this.plugin.settings.icons.filter(
              (i) => i !== icon
            );
            void this.plugin.saveSettings();
            renderIcons();
          };
        }
      }
    };
    renderIcons();
    new import_obsidian14.Setting(containerEl).setName("Add new icon").setDesc("Create a new image-based icon entry.").addButton(
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
