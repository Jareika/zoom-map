import { Modal, Setting, TFile } from "obsidian";
import type { App, TextComponent } from "obsidian";
import type { Marker, MarkerFileData } from "./markerStore";
import type ZoomMapPlugin from "./main";

type SwapPinFrameLite = { iconKey: string; link?: string };
type SwapPinPresetLite = { id: string; name: string; frames: SwapPinFrameLite[]; layerName?: string };

interface LinkSuggestion {
  label: string;
  value: string;
}

export interface MarkerEditorResult {
  action: "save" | "delete" | "cancel";
  marker?: Marker;
  dataChanged?: boolean;
}

type MarkerEditorCallback = (result: MarkerEditorResult) => void;

function tintSvgMarkup(svg: string, color: string): string {
  const c = color.trim();
  if (!c) return svg;

  try {
    const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
    const root = doc.querySelector("svg");
    if (!root) return svg;

    const inner = root.querySelector("#zm-inner") ?? root;
    const base = root.querySelector("#zm-base");
    const outline = root.querySelector("#zm-outline");

    const shapes = inner.querySelectorAll<SVGElement>("path, circle, rect, polygon, polyline, line, ellipse");
    let touched = false;

    shapes.forEach((el) => {
      if (base && base.contains(el)) return;
      if (outline && outline.contains(el)) return;

      const styleFill = (el as unknown as { style?: CSSStyleDeclaration }).style?.fill;
      const styleStroke = (el as unknown as { style?: CSSStyleDeclaration }).style?.stroke;
      const fillAttr = el.getAttribute("fill");
      const strokeAttr = el.getAttribute("stroke");

      const hasFill =
        (typeof styleFill === "string" && styleFill && styleFill.toLowerCase() !== "none") ||
        (typeof fillAttr === "string" && fillAttr && fillAttr.toLowerCase() !== "none");
      const hasStroke =
        (typeof styleStroke === "string" && styleStroke && styleStroke.toLowerCase() !== "none") ||
        (typeof strokeAttr === "string" && strokeAttr && strokeAttr.toLowerCase() !== "none");

      if (hasFill) {
        (el as unknown as { style: CSSStyleDeclaration }).style.fill = c;
        el.setAttribute("fill", c);
        touched = true;
      }
      if (hasStroke) {
        (el as unknown as { style: CSSStyleDeclaration }).style.stroke = c;
        el.setAttribute("stroke", c);
        touched = true;
      }
    });

    if (!touched) {
      (inner as SVGElement).setAttribute("fill", c);
    }

    return new XMLSerializer().serializeToString(root);
  } catch {
    return svg;
  }
}

export class MarkerEditorModal extends Modal {
  private plugin: ZoomMapPlugin;
  private data: MarkerFileData;
  private marker: Marker;
  private onResult: MarkerEditorCallback;

  private linkInput?: TextComponent;

  private suggestionsEl: HTMLDivElement | null = null;
  private allSuggestions: LinkSuggestion[] = [];
  private filteredSuggestions: LinkSuggestion[] = [];
  private selectedSuggestionIndex = -1;
  
  private findSwapPresetById(id: string): SwapPinPresetLite | null {
    const cols =
      (this.plugin.settings as unknown as {
        baseCollections?: { include?: { swapPins?: SwapPinPresetLite[] } }[];
      }).baseCollections ?? [];

    for (const col of cols) {
      const list = col?.include?.swapPins ?? [];
      const found = list.find((sp) => sp?.id === id);
      if (found && Array.isArray(found.frames)) return found;
    }
    return null;
  }

  private normalizeSwapFrameIndex(m: Marker, preset: SwapPinPresetLite): number {
    const rawIndex = typeof m.swapIndex === "number" ? m.swapIndex : 0;
    const count = preset.frames.length || 1;
    return ((rawIndex % count) + count) % count;
  }

  private cleanupSwapLinks(): void {
    if (this.marker.type !== "swap") return;
    const links = this.marker.swapLinks;
    if (!links || typeof links !== "object") {
      delete this.marker.swapLinks;
      return;
    }
    // Remove empty strings
    for (const k of Object.keys(links)) {
      const v = links[Number(k)];
      if (typeof v !== "string" || !v.trim()) delete links[Number(k)];
    }
    if (Object.keys(links).length === 0) delete this.marker.swapLinks;
  }

  constructor(
    app: App,
    plugin: ZoomMapPlugin,
    data: MarkerFileData,
    marker: Marker,
    onResult: MarkerEditorCallback,
  ) {
    super(app);
    this.plugin = plugin;
    this.data = data;
    this.marker = { type: marker.type ?? "pin", ...marker };
    this.onResult = onResult;
  }

  private buildLinkSuggestions(): void {
    const files = this.app.vault
      .getFiles()
      .filter((f) => f.extension?.toLowerCase() === "md");

    const suggestions: LinkSuggestion[] = [];
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
        suggestions.push({
          label: `${baseLink} › ${headingName}`,
          value: full,
        });
      }
    }

    this.allSuggestions = suggestions;
  }

  private showLinkSuggestions(): void {
    if (!this.suggestionsEl) return;
    this.suggestionsEl.classList.remove("is-hidden");
  }

  private hideLinkSuggestions(): void {
    if (!this.suggestionsEl) return;
    this.suggestionsEl.classList.add("is-hidden");
    this.suggestionsEl.empty();
    this.filteredSuggestions = [];
    this.selectedSuggestionIndex = -1;
  }

  private updateLinkSuggestions(input: string): void {
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
    const matches = this.allSuggestions
      .filter(
        (s) =>
          s.value.toLowerCase().includes(query) ||
          s.label.toLowerCase().includes(query),
      )
      .slice(0, maxItems);

    if (matches.length === 0) {
      this.hideLinkSuggestions();
      return;
    }

    this.filteredSuggestions = matches;
    this.showLinkSuggestions();

    matches.forEach((s, i) => {
      const row = this.suggestionsEl!.createDiv({
        cls: "zoommap-link-suggestion-item",
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

  private moveLinkSuggestionSelection(delta: number): void {
    if (!this.suggestionsEl) return;
    const n = this.filteredSuggestions.length;
    if (n === 0) return;

    let idx = this.selectedSuggestionIndex;
    if (idx < 0) idx = 0;
    idx = (idx + delta + n) % n;
    this.selectedSuggestionIndex = idx;

    const rows =
      this.suggestionsEl.querySelectorAll<HTMLDivElement>(
        ".zoommap-link-suggestion-item",
      );
    rows.forEach((row, i) => {
      if (i === idx) row.classList.add("is-selected");
      else row.classList.remove("is-selected");
    });

    const sel = rows[idx];
    if (sel) sel.scrollIntoView({ block: "nearest" });
  }

  private applyLinkSuggestion(index: number): void {
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

  private zoomFactorToPercentString(f?: number): string {
    if (typeof f !== "number" || !Number.isFinite(f) || f <= 0) return "";
    return String(Math.round(f * 100));
  }

  private parseZoomPercentInput(input: string): number | undefined {
    let s = input.trim();
    if (!s) return undefined;
    if (s.endsWith("%")) s = s.slice(0, -1).trim();
    s = s.replace(",", ".");
    const n = Number(s);
    if (!Number.isFinite(n) || n <= 0) return undefined;
    return n / 100;
  }

  private normalizeZoomRange(): void {
    let min = this.marker.minZoom;
    let max = this.marker.maxZoom;

    if (typeof min !== "number" || !Number.isFinite(min) || min <= 0) {
      min = undefined;
    }
    if (typeof max !== "number" || !Number.isFinite(max) || max <= 0) {
      max = undefined;
    }

    if (min === undefined && max === undefined) {
      delete this.marker.minZoom;
      delete this.marker.maxZoom;
      return;
    }

    if (min !== undefined && max !== undefined && min > max) {
      const tmp = min;
      min = max;
      max = tmp;
    }

    if (min !== undefined) this.marker.minZoom = min;
    else delete this.marker.minZoom;

    if (max !== undefined) this.marker.maxZoom = max;
    else delete this.marker.maxZoom;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", {
      text: this.marker.type === "sticker" ? "Edit sticker" : "Edit marker",
    });

    if (this.marker.type !== "sticker") {
      if (this.marker.type === "swap") {
        contentEl.createEl("h3", { text: "Swap pin (this marker only)" });

        const preset = this.marker.swapKey ? this.findSwapPresetById(this.marker.swapKey) : null;
        if (!preset) {
          contentEl.createEl("div", { text: "Swap preset not found. Cannot edit per-frame links." });
        } else {
          const idx = this.normalizeSwapFrameIndex(this.marker, preset);
          contentEl.createEl("div", { text: `Preset: ${preset.name} • Current frame: ${idx + 1}/${preset.frames.length}` });

          const overrides = (this.marker.swapLinks ??= {});

          preset.frames.forEach((fr, i) => {
            const presetLink = (fr.link ?? "").trim();
            const iconDefault = this.plugin.getIconDefaultLink(fr.iconKey) ?? "";
            const fallback = presetLink || iconDefault;
            const desc = fallback ? `Default: ${fallback}` : "Default: (none)";

            new Setting(contentEl)
              .setName(`Frame ${i + 1}: ${fr.iconKey}`)
              .setDesc(desc)
              .addText((t) => {
                t.setPlaceholder("Override link (optional)");
                t.setValue(overrides[i] ?? "");
                t.onChange((v) => {
                  const s = v.trim();
                  if (s) overrides[i] = s;
                  else delete overrides[i];

                  if (Object.keys(overrides).length === 0) {
                    delete this.marker.swapLinks;
                  } else {
                    this.marker.swapLinks = overrides;
                  }
                });
              });
          });

          new Setting(contentEl)
            .setName("Clear all overrides")
            .setDesc("Removes per-frame overrides from this marker (falls back to preset/icon defaults).")
            .addButton((b) => {
              b.setButtonText("Clear").onClick(() => {
                delete this.marker.swapLinks;
                this.close();
                this.onResult({ action: "save", marker: this.marker, dataChanged: false });
              });
            });
        }
      } else {
        const linkSetting = new Setting(contentEl)
          .setName("Link")
          .setDesc("Wiki link (without [[ ]]). Supports note and note#heading.");

        linkSetting.addText((t) => {
          this.linkInput = t;

          t.setPlaceholder("Folder/note or note#heading")
            .setValue(this.marker.link ?? "")
            .onChange((v) => {
              this.marker.link = v.trim();
              this.updateLinkSuggestions(v);
            });

          const wrapper = t.inputEl.parentElement;
          if (wrapper instanceof HTMLElement) {
            wrapper.classList.add("zoommap-link-input-wrapper");
            this.suggestionsEl = wrapper.createDiv({
              cls: "zoommap-link-suggestions is-hidden",
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
	  
	  new Setting(contentEl)
       .setName("Tooltip always on")
       .setDesc("Show the tooltip even if this marker has a link.")
       .addToggle((tg) => {
       tg.setValue(!!this.marker.tooltipAlwaysOn).onChange((on) => {
          if (on) {
            this.marker.tooltipAlwaysOn = true;
          } else {
            delete this.marker.tooltipAlwaysOn;
          }
        });
      });
	  
      // Always-visible tooltip label (pin caption)
      let labelPosSetting: Setting | null = null;
      let labelOffsetXSetting: Setting | null = null;
      let labelOffsetYSetting: Setting | null = null;

      const toggleLabelExtras = () => {
        const on = !!this.marker.tooltipLabelAlways;
        labelPosSetting?.settingEl.toggle(on);
        labelOffsetXSetting?.settingEl.toggle(on);
        labelOffsetYSetting?.settingEl.toggle(on);
      };
      new Setting(contentEl)
        .setName("Tooltip label always visible")
        .setDesc("Renders the tooltip text as a label on the map (useful for village names).")
        .addToggle((tg) => {
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

      labelPosSetting = new Setting(contentEl)
        .setName("Tooltip label position")
        .setDesc("Where to place the always-visible label relative to the pin anchor.")
        .addDropdown((d) => {
          d.addOption("below", "Below pin");
          d.addOption("above", "Above pin");
          d.setValue(this.marker.tooltipLabelPosition ?? "below");
          d.onChange((v) => {
            this.marker.tooltipLabelPosition = (v === "above" ? "above" : "below");
          });
        });
      // Offsets (px)
      labelOffsetXSetting = new Setting(contentEl)
        .setName("Label offset X (px)")
        .addText((t) => {
          t.inputEl.type = "number";
          t.setPlaceholder("0");
          t.setValue(
            typeof this.marker.tooltipLabelOffsetX === "number"
              ? String(this.marker.tooltipLabelOffsetX)
              : "0",
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

      labelOffsetYSetting = new Setting(contentEl)
        .setName("Label offset y (px)")
        .setDesc("Positive moves the label down, negative moves it up.")
        .addText((t) => {
          t.inputEl.type = "number";
          t.setPlaceholder("0");
          t.setValue(
            typeof this.marker.tooltipLabelOffsetY === "number"
              ? String(this.marker.tooltipLabelOffsetY)
              : "0",
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

      new Setting(contentEl).setName("Tooltip").addTextArea((a) => {
        a.setPlaceholder("Optional tooltip text");
        a.inputEl.rows = 3;
        a.setValue(this.marker.tooltip ?? "");
        a.onChange((v) => {
          this.marker.tooltip = v;
        });
      });

      const zoomRow = new Setting(contentEl)
        .setName("Zoom range (optional)")
        .setDesc("(in %)");

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

      new Setting(contentEl)
        .setName("Scale like sticker")
        .setDesc("Pin scales with the map (no inverse wrapper).")
        .addToggle((tg) => {
          tg.setValue(!!this.marker.scaleLikeSticker).onChange((on) => {
            if (on) this.marker.scaleLikeSticker = true;
            else delete this.marker.scaleLikeSticker;
          });
        });

      if (this.marker.type !== "swap") {
        new Setting(contentEl)
          .setName("Icon")
          .setDesc("To set up new icons go to settings.")
          .addDropdown((d) => {
            const sortedIcons = [...(this.plugin.settings.icons ?? [])].sort((a, b) =>
              String(a.key ?? "").localeCompare(String(b.key ?? ""), undefined, {
                sensitivity: "base",
                numeric: true,
              }),
            );

            for (const icon of sortedIcons) d.addOption(icon.key, icon.key);
            d.setValue(this.marker.iconKey ?? this.plugin.settings.defaultIconKey);
            d.onChange((v) => {
              this.marker.iconKey = v;
              updatePreview();
            });
          });
      }

      const colorRow = new Setting(contentEl)
        .setName("Icon color")
        .setDesc("Overrides the icon color for this marker (SVG icons only).");

      let colorTextEl: HTMLInputElement;
      const colorPickerEl = colorRow.controlEl.createEl("input", {
        attr: {
          type: "color",
          style: "margin-left:8px; vertical-align: middle;",
        },
      });

      colorRow.addText((t) => {
        t.setPlaceholder("#d23c3c");
        t.setValue(this.marker.iconColor ?? "");
        colorTextEl = t.inputEl;
        t.onChange((v) => {
          const c = v.trim();
          this.marker.iconColor = c || undefined;
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

    // Layer
    let newLayerName = "";

    const isExistingMarker = (this.data.markers ?? []).some(
      (m) => m.id === this.marker.id,
    );

    if (this.plugin.settings.preferActiveLayerInEditor && !isExistingMarker) {
      const active =
        this.data.layers.find((l) => l.visible && !l.locked) ??
        this.data.layers.find((l) => l.visible) ??
        this.data.layers[0];

      if (active) {
        this.marker.layer = active.id;
      }
    }

    new Setting(contentEl)
      .setName("Layer")
      .setDesc("Choose an existing layer or type a new name.")
      .addDropdown((d) => {
        for (const l of this.data.layers) d.addOption(l.name, l.name);

        const current =
          this.data.layers.find((l) => l.id === this.marker.layer)?.name ??
          this.data.layers.find((l) => l.visible && !l.locked)?.name ??
          this.data.layers.find((l) => l.visible)?.name ??
          this.data.layers[0].name;

        d.setValue(current).onChange((v) => {
          const lyr = this.data.layers.find((l) => l.name === v);
          if (lyr) this.marker.layer = lyr.id;
        });
      })
      .addText((t) =>
        t.setPlaceholder("Create new layer (optional)").onChange((v) => {
          newLayerName = v.trim();
        }),
      );

    if (this.marker.type === "sticker") {
      new Setting(contentEl).setName("Size").addText((t) => {
        t.setPlaceholder("64");
        t.setValue(String(this.marker.stickerSize ?? 64));
        t.onChange((v) => {
          const n = Number(v);
          if (Number.isFinite(n) && n > 0) {
            this.marker.stickerSize = Math.round(n);
            updatePreview();
          }
        });
      });
    }
	
      new Setting(contentEl)
        .setName("Size override (px)")
        .setDesc("Overrides the icon default size and the map-wide pin size override for this marker only.")
        .addText((t) => {
          t.setPlaceholder("Use icon default");
          t.inputEl.type = "number";
          t.setValue(
            typeof this.marker.sizeOverride === "number" && Number.isFinite(this.marker.sizeOverride)
              ? String(this.marker.sizeOverride)
              : "",
          );
          t.onChange((v) => {
            const n = Number(String(v).replace(",", "."));
            if (Number.isFinite(n) && n > 0) this.marker.sizeOverride = Math.round(n);
            else delete this.marker.sizeOverride;
          });
        });

    // Preview
    const preview = contentEl.createDiv({ cls: "zoommap-modal-preview" });
    preview.createSpan({ text: "Preview:" });
    const img = preview.createEl("img");

    const resolvePreview = (): { url: string; size: number } => {
      if (this.marker.type === "sticker") {
        let url = this.marker.stickerPath ?? "";
        if (url && !url.startsWith("data:")) {
          const file = this.app.vault.getAbstractFileByPath(url);
          if (file instanceof TFile) {
            url = this.app.vault.getResourcePath(file);
          }
        }
        const size = Math.max(1, Math.round(this.marker.stickerSize ?? 64));
        return {
          url,
          size,
        };
      }
	  
      // Swap pins: preview the current frame icon
      if (this.marker.type === "swap" && this.marker.swapKey) {
        const preset = this.findSwapPresetById(this.marker.swapKey);
        if (preset && preset.frames.length) {
          const idx = this.normalizeSwapFrameIndex(this.marker, preset);
          const frame = preset.frames[idx];
          const key = frame?.iconKey || this.plugin.settings.defaultIconKey;
          const baseIcon =
            this.plugin.settings.icons.find((i) => i.key === key) ?? this.plugin.builtinIcon();
          const size =
            typeof this.marker.sizeOverride === "number" &&
            Number.isFinite(this.marker.sizeOverride) &&
            this.marker.sizeOverride > 0
              ? Math.round(this.marker.sizeOverride)
              : baseIcon.size;
          let url = baseIcon.pathOrDataUrl;

          const color = this.marker.iconColor?.trim();
          if (color && url && url.startsWith("data:image/svg+xml")) {
            const comma = url.indexOf(",");
            if (comma >= 0) {
              try {
                const header = url.slice(0, comma + 1);
                const payload = url.slice(comma + 1);
                const svg = decodeURIComponent(payload);
                const tinted = tintSvgMarkup(svg, color);
                url = header + encodeURIComponent(tinted);
              } catch {
                // ignore
              }
            }
          }

          if (url && !url.startsWith("data:")) {
            const file = this.app.vault.getAbstractFileByPath(url);
            if (file instanceof TFile) url = this.app.vault.getResourcePath(file);
          }

          return { url, size };
        }
      }

      const baseIcon =
        this.plugin.settings.icons.find(
          (i) => i.key === (this.marker.iconKey ?? this.plugin.settings.defaultIconKey),
        ) ?? this.plugin.builtinIcon();
      const size =
        typeof this.marker.sizeOverride === "number" &&
        Number.isFinite(this.marker.sizeOverride) &&
        this.marker.sizeOverride > 0
          ? Math.round(this.marker.sizeOverride)
          : baseIcon.size;

      let url = baseIcon.pathOrDataUrl;

      const color = this.marker.iconColor?.trim();
      if (color && url && url.startsWith("data:image/svg+xml")) {
        const idx = url.indexOf(",");
        if (idx >= 0) {
          try {
            const header = url.slice(0, idx + 1);
            const payload = url.slice(idx + 1);
            const svg = decodeURIComponent(payload);
            const tinted = tintSvgMarkup(svg, color);
            url = header + encodeURIComponent(tinted);
          } catch {
            // ignore, fall back to original URL
          }
        }
      }

      if (url && !url.startsWith("data:")) {
        const file = this.app.vault.getAbstractFileByPath(url);
        if (file instanceof TFile) {
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

    // Footer
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const btnSave = footer.createEl("button", { text: "Save" });
    const btnDelete = footer.createEl("button", {
      text: this.marker.type === "sticker" ? "Delete sticker" : "Delete marker",
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
            visible: true,
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
        if (
          typeof this.marker.sizeOverride !== "number" ||
          !Number.isFinite(this.marker.sizeOverride) ||
          this.marker.sizeOverride <= 0
        ) delete this.marker.sizeOverride;	
        const normOffset = (x: unknown): number | undefined => {
          if (typeof x !== "number" || !Number.isFinite(x)) return undefined;
          if (Math.abs(x) < 1e-9) return undefined;
          return x;
        };
        const ox = normOffset(this.marker.tooltipLabelOffsetX);
        const oy = normOffset(this.marker.tooltipLabelOffsetY);
        if (ox === undefined) delete this.marker.tooltipLabelOffsetX;
        else this.marker.tooltipLabelOffsetX = ox;
        if (oy === undefined) delete this.marker.tooltipLabelOffsetY;
        else this.marker.tooltipLabelOffsetY = oy;
	  }
	  
      if (this.marker.type === "swap") {
        this.cleanupSwapLinks();
      }

      this.close();
      this.onResult({
        action: "save",
        marker: this.marker,
        dataChanged,
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

  onClose(): void {
    this.contentEl.empty();
  }
}