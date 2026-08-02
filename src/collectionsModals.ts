import { Modal, Setting, TFile } from "obsidian";
import type { App } from "obsidian";
import type ZoomMapPlugin from "./main";
import { ImageFileSuggestModal } from "./iconFileSuggest";
import type {
  BaseCollection,
  MarkerPreset,
  StickerPreset,
  SwapPinPreset,
  SwapPinFrame,
  PingPreset,
} from "./map";

function deepClone<T>(x: T): T {
  if (typeof structuredClone === "function") return structuredClone(x);
  const json = JSON.stringify(x);
  return JSON.parse(json) as T;
}

interface LinkSuggestion {
  label: string;
  value: string;
}

interface CollectionEditorResult {
  updated: boolean;
  deleted: boolean;
}

type CollectionEditorCallback = (result: CollectionEditorResult) => void;

export class CollectionEditorModal extends Modal {
  private plugin: ZoomMapPlugin;
  private original: BaseCollection;
  private working: BaseCollection;
  private onDone: CollectionEditorCallback;

  constructor(
    app: App,
    plugin: ZoomMapPlugin,
    collection: BaseCollection,
    onDone: CollectionEditorCallback,
  ) {
    super(app);
    this.plugin = plugin;
    this.original = collection;
    this.working = deepClone(collection);

    this.working.bindings = this.working.bindings ?? { basePaths: [] };
    this.working.bindings.basePaths = this.working.bindings.basePaths ?? [];
    this.working.include = this.working.include ?? {
      pinKeys: [],
      favorites: [],
      stickers: [],
      swapPins: [],
	  pingPins: [],
    };
    this.working.include.pinKeys = this.working.include.pinKeys ?? [];
    this.working.include.favorites = this.working.include.favorites ?? [];
    this.working.include.stickers = this.working.include.stickers ?? [];
    this.working.include.swapPins = this.working.include.swapPins ?? [];
	this.working.include.pingPins = this.working.include.pingPins ?? [];
    this.onDone = onDone;
  }

  onOpen(): void {
    const { contentEl } = this;
	this.modalEl.addClass("zoommap-modal--wide");
    contentEl.empty();

    contentEl.createEl("h2", { text: "Edit collection" });

    new Setting(contentEl).setName("Name").addText((t) => {
      t.setValue(this.working.name ?? "");
      t.onChange((v) => {
        this.working.name = v.trim();
      });
    });

    // Bindings
    contentEl.createEl("h3", { text: "Bindings (base images)" });

    const pathsWrap = contentEl.createDiv();
    const renderPaths = () => {
      pathsWrap.empty();
      if (!this.working.bindings.basePaths.length) {
        pathsWrap.createDiv({ text: "No base images bound." });
      } else {
        this.working.bindings.basePaths.forEach((p, idx) => {
          const row = pathsWrap.createDiv({
            cls: "zoommap-collection-base-row",
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

      const addBtn = pathsWrap.createEl("button", { text: "Add base image…" });
      addBtn.onclick = () => {
        new ImageFileSuggestModal(this.app, (file: TFile) => {
          const path = file.path;
          if (!this.working.bindings.basePaths.includes(path)) {
            this.working.bindings.basePaths.push(path);
            renderPaths();
          }
        }).open();
      };
    };
    renderPaths();

    // Pins from library
    contentEl.createEl("h3", { text: "Pins (from icon library)" });

    const pinWrap = contentEl.createDiv();
    const renderPins = () => {
      pinWrap.empty();

      pinWrap.createDiv({
        cls: "zoommap-collection-pin-hint",
        text: "Select pins from the icon library:",
      });

      const selected = new Set(this.working.include.pinKeys ?? []);
      const lib = (this.plugin.settings.icons ?? [])
        .filter((ico) => ico.inCollections !== false || selected.has(ico.key))
        .sort((a, b) => String(a.key ?? "").localeCompare(String(b.key ?? ""), undefined, { sensitivity: "base", numeric: true }));
      if (lib.length === 0) {
        const none = pinWrap.createDiv({
          text: "No icons in library yet.",
        });
        none.addClass("zoommap-muted");
      } else {
        const list = pinWrap.createDiv({ cls: "zoommap-collection-pin-grid" });
        lib.forEach((ico) => {
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

          const src = ico.pathOrDataUrl ?? "";
          if (typeof src === "string") {
            if (src.startsWith("data:")) {
              img.src = src;
            } else if (src) {
              const f = this.app.vault.getAbstractFileByPath(src);
              if (f instanceof TFile) {
                img.src = this.app.vault.getResourcePath(f);
              }
            }
          }

          const label = cell.createSpan({ text: ico.key });
          label.addClass("zoommap-collection-pin-label");
        });
      }
    };
    renderPins();

    // Favorites
    contentEl.createEl("h3", { text: "Favorites (presets)" });

    const favWrap = contentEl.createDiv();
    const renderFavs = () => {
      favWrap.empty();
      const list = this.working.include.favorites;

      if (list.length === 0) {
        const none = favWrap.createDiv({
          text: "No favorites in this collection.",
        });
        none.addClass("zoommap-muted");
      }

      list.forEach((p, idx) => {
        const row = favWrap.createDiv({ cls: "zoommap-collection-fav-row" });

        const name = row.createEl("input", { type: "text" });
        name.value = p.name ?? "";
        name.oninput = () => {
          p.name = name.value.trim();
        };

        const iconSel = row.createEl("select");
        const addOpt = (val: string, labelText: string) => {
          const o = iconSel.ownerDocument.createElement("option");
          o.value = val;
          o.textContent = labelText;
          iconSel.appendChild(o);
        };

        addOpt("", "(default)");
        {
          const pool = (this.plugin.settings.icons ?? [])
            .filter((ico) => ico.inCollections !== false || ico.key === (p.iconKey ?? ""))
            .sort((a, b) => String(a.key ?? "").localeCompare(String(b.key ?? ""), undefined, { sensitivity: "base", numeric: true }));
          pool.forEach((ico) => addOpt(ico.key, ico.key));
        }

        iconSel.value = p.iconKey ?? "";
        iconSel.onchange = () => {
          p.iconKey = iconSel.value || undefined;
        };

        const layer = row.createEl("input", { type: "text" });
        layer.placeholder = "Layer (optional)";
        layer.value = p.layerName ?? "";
        layer.oninput = () => {
          p.layerName = layer.value.trim() || undefined;
        };

        const ed = row.createEl("input", { type: "checkbox" });
        ed.checked = !!p.openEditor;
        ed.onchange = () => {
          p.openEditor = ed.checked;
        };

        const link = row.createEl("input", { type: "text" });
        link.placeholder = "Link template (optional)";
        link.value = p.linkTemplate ?? "";
        link.oninput = () => {
          p.linkTemplate = link.value.trim() || undefined;
        };

        const del = row.createEl("button", { text: "Delete" });
        del.onclick = () => {
          this.working.include.favorites.splice(idx, 1);
          renderFavs();
        };
      });

      const add = favWrap.createEl("button", { text: "Add favorite" });
      add.onclick = () => {
        const p: MarkerPreset = {
          name: `Favorite ${this.working.include.favorites.length + 1}`,
          openEditor: false,
        };
        this.working.include.favorites.push(p);
        renderFavs();
      };
    };
    renderFavs();

    // Stickers
    contentEl.createEl("h3", { text: "Stickers" });

    const stickerWrap = contentEl.createDiv();
    const renderStickers = () => {
      stickerWrap.empty();
      const list = this.working.include.stickers;

      if (list.length === 0) {
        const none = stickerWrap.createDiv({
          text: "No stickers in this collection.",
        });
        none.addClass("zoommap-muted");
      }

      list.forEach((s, idx) => {
        const row = stickerWrap.createDiv({
          cls: "zoommap-collection-sticker-row",
        });

        const name = row.createEl("input", { type: "text" });
        name.value = s.name ?? "";
        name.oninput = () => {
          s.name = name.value.trim();
        };

        const path = row.createEl("input", { type: "text" });
        path.placeholder = "Image path or data URL";
        path.value = s.imagePath ?? "";
        path.oninput = () => {
          s.imagePath = path.value.trim();
        };

        const size = row.createEl("input", { type: "number" });
        size.value = String(s.size ?? 64);
        size.oninput = () => {
          const n = Number(size.value);
          if (Number.isFinite(n) && n > 0) s.size = Math.round(n);
        };

        const layer = row.createEl("input", { type: "text" });
        layer.placeholder = "Layer (optional)";
        layer.value = s.layerName ?? "";
        layer.oninput = () => {
          s.layerName = layer.value.trim() || undefined;
        };

        const pick = row.createEl("button", { text: "Pick…" });
        pick.onclick = () => {
          new ImageFileSuggestModal(this.app, (file: TFile) => {
            s.imagePath = file.path;
            renderStickers();
          }).open();
        };

        const del = row.createEl("button", { text: "Delete" });
        del.onclick = () => {
          this.working.include.stickers.splice(idx, 1);
          renderStickers();
        };
      });

      const add = stickerWrap.createEl("button", { text: "Add sticker" });
      add.onclick = () => {
        const s: StickerPreset = {
          name: `Sticker ${this.working.include.stickers.length + 1}`,
          imagePath: "",
          size: 64,
          openEditor: false,
        };
        this.working.include.stickers.push(s);
        renderStickers();
      };
    };
    renderStickers();

    // Swap pins
    contentEl.createEl("h3", { text: "Swap pins" });

    const swapWrap = contentEl.createDiv();
    const renderSwaps = () => {
      swapWrap.empty();

      const swaps = (this.working.include.swapPins ??= []);

      if (swaps.length === 0) {
        const none = swapWrap.createDiv({
          text: "No swap pins in this collection.",
        });
        none.addClass("zoommap-muted");
      }

      swaps.forEach((sp, idx) => {
        const row = swapWrap.createDiv({
          cls: "zoommap-collection-sticker-row",
        });

        const name = row.createEl("input", { type: "text" });
        name.value = sp.name ?? "";
        name.oninput = () => {
          sp.name = name.value.trim();
        };

        const editBtn = row.createEl("button", { text: "Edit…" });
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
        const sp: SwapPinPreset = {
          id,
          name: `Swap pin ${swaps.length + 1}`,
          frames: [],
        };
        swaps.push(sp);
        renderSwaps();
      };
    };
    renderSwaps();
	
    // Party pins (internal type is "ping")
    contentEl.createEl("h3", { text: "Party pins" });

    const pingWrap = contentEl.createDiv();
    const renderPings = () => {
      pingWrap.empty();
      const pings = (this.working.include.pingPins ??= []);

      if (pings.length === 0) {
        pingWrap.createDiv({ text: "No party pins in this collection." }).addClass("zoommap-muted");
      }

      pings.forEach((pp, idx) => {
        const row = pingWrap.createDiv({ cls: "zoommap-collection-sticker-row" });

        const name = row.createEl("input", { type: "text" });
        name.value = pp.name ?? "";
        name.oninput = () => { pp.name = name.value.trim(); };

        const editBtn = row.createEl("button", { text: "Edit…" });
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
        const id = `ping-${Math.random().toString(36).slice(2, 8)}`;
        const pp: PingPreset = {
          id,
          name: `Ping ${pings.length + 1}`,
          iconKey: undefined,
          layerName: "Pings",
          distances: [2, 5, 10],
          unit: "km",
          customUnitId: undefined,
          travelPackId: (this.plugin.settings.travelRulesPacks ?? [])[0]?.id,
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
            travelTimes: true,
          },
		  refreshSourceNoteOnUpdate: true,
        };
        pings.push(pp);
        renderPings();
      };
    };
    renderPings();

    // Footer
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

  private openSwapFramesEditor(preset: SwapPinPreset): void {
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
      },
    );
    modal.open();
  }

  onClose(): void {
    this.contentEl.empty();
  }
}

export class SwapFramesEditorModal extends Modal {
  private plugin: ZoomMapPlugin;
  private working: SwapPinPreset;
  private onSave: (preset: SwapPinPreset) => void;

  private allLinkSuggestions: LinkSuggestion[] = [];

  constructor(
    app: App,
    plugin: ZoomMapPlugin,
    preset: SwapPinPreset,
    onSave: (preset: SwapPinPreset) => void,
  ) {
    super(app);
    this.plugin = plugin;
    this.working = JSON.parse(JSON.stringify(preset)) as SwapPinPreset;
    this.onSave = onSave;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Swap pin" });

    this.buildLinkSuggestions();

    new Setting(contentEl)
      .setName("Name")
      .addText((t) => {
        t.setValue(this.working.name ?? "");
        t.onChange((v) => {
          this.working.name = v.trim() || this.working.name;
        });
      });
	  
    new Setting(contentEl)
      .setName("Marker layer name (optional)")
      .setDesc("If set: newly placed swap pins will be created in this marker layer (created if missing).")
      .addText((t) => {
        t.setPlaceholder("Layer");
        t.setValue(this.working.layerName ?? "");
        t.onChange((v) => { this.working.layerName = v.trim() || undefined; });
      });

    new Setting(contentEl)
      .setName("Place as hud pin by default")
      .addToggle((tg) => {
        tg.setValue(!!this.working.defaultHud).onChange((on) => {
          this.working.defaultHud = on || undefined;
        });
      });

    new Setting(contentEl)
      .setName("Scale like sticker by default")
      .addToggle((tg) => {
        tg.setValue(!!this.working.defaultScaleLikeSticker).onChange((on) => {
          this.working.defaultScaleLikeSticker = on || undefined;
        });
      });

    new Setting(contentEl)
      .setName("Hover opens popover automatically")
      .setDesc("If enabled, hovering this swap pin shows a preview without ctrl/cmd.")
      .addToggle((tg) => {
        tg.setValue(!!this.working.hoverPopover).onChange((on) => {
          this.working.hoverPopover = on || undefined;
        });
      });

    const list = contentEl.createDiv();

    const render = () => {
      list.empty();

      const frames = (this.working.frames ??= []);

      if (frames.length === 0) {
        const none = list.createDiv({ text: "No frames yet." });
        none.addClass("zoommap-muted");
      }

      frames.forEach((fr, idx) => {
        const row = list.createDiv({
          cls: "zoommap-collection-sticker-row",
        });

        const iconSel = row.createEl("select");
        const icons = (this.plugin.settings.icons ?? [])
          .filter((ico) => ico.inCollections !== false || ico.key === fr.iconKey)
          .sort((a, b) => String(a.key ?? "").localeCompare(String(b.key ?? ""), undefined, { sensitivity: "base", numeric: true }));
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
        link.value = fr.link ?? "";
        link.oninput = () => {
          fr.link = link.value.trim() || undefined;
        };

        this.attachLinkAutocomplete(
          link,
          () => fr.link ?? "",
          (val) => {
            fr.link = val.trim() || undefined;
            link.value = val;
          },
        );

        const del = row.createEl("button", { text: "Delete" });
        del.onclick = () => {
          frames.splice(idx, 1);
          render();
        };
      });

      const add = list.createEl("button", { text: "Add frame" });
      add.onclick = () => {
        const firstKey = this.plugin.settings.icons?.[0]?.key ?? "";
        const frame: SwapPinFrame = { iconKey: firstKey };
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

  onClose(): void {
    this.contentEl.empty();
  }

  private buildLinkSuggestions(): void {
    const files = this.app.vault
      .getFiles()
      .filter((f) => f.extension?.toLowerCase() === "md");

    const suggestions: LinkSuggestion[] = [];
    const active = this.app.workspace.getActiveFile();
    const fromPath = active?.path ?? files[0]?.path ?? "";

    for (const file of files) {
      const base = this.app.metadataCache.fileToLinktext(file, fromPath);
      suggestions.push({ label: base, value: base });

      const cache = this.app.metadataCache.getCache(file.path);
      const headings = cache?.headings ?? [];
      for (const h of headings) {
        const heading = h.heading;
        const full = `${base}#${heading}`;
        suggestions.push({
          label: `${base} › ${heading}`,
          value: full,
        });
      }
    }

    this.allLinkSuggestions = suggestions;
  }

  private attachLinkAutocomplete(
    input: HTMLInputElement,
    getValue: () => string,
    setValue: (val: string) => void,
  ): void {
    const wrapper = input.parentElement;
    if (!(wrapper instanceof HTMLElement)) return;

    wrapper.classList.add("zoommap-link-input-wrapper");
    const listEl = wrapper.createDiv({
      cls: "zoommap-link-suggestions is-hidden",
    });

    const hide = () => listEl.classList.add("is-hidden");
    const show = () => listEl.classList.remove("is-hidden");

    const update = (query: string) => {
      const q = query.trim().toLowerCase();
      listEl.empty();

      if (!q) {
        hide();
        return;
      }

      const matches = this.allLinkSuggestions
        .filter(
          (s) =>
            s.value.toLowerCase().includes(q) ||
            s.label.toLowerCase().includes(q),
        )
        .slice(0, 20);

      if (!matches.length) {
        hide();
        return;
      }

      show();
      for (const s of matches) {
        const row = listEl.createDiv({
          cls: "zoommap-link-suggestion-item",
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
}

class PingPresetEditorModal extends Modal {
  private plugin: ZoomMapPlugin;
  private working: PingPreset;
  private onSave: (preset: PingPreset) => void;

  constructor(app: App, plugin: ZoomMapPlugin, preset: PingPreset, onSave: (preset: PingPreset) => void) {
    super(app);
    this.plugin = plugin;
    this.working = deepClone(preset);
    this.onSave = onSave;

    this.working.relatedLookup ??= "tags";
    this.working.searchLayersMode ??= "all";
    this.working.searchLayerNames ??= [];
	this.working.sections ??= {};
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Party preset" });

    new Setting(contentEl).setName("Name").addText((t) => {
      t.setValue(this.working.name ?? "");
      t.onChange((v) => { this.working.name = v.trim(); });
    });

    new Setting(contentEl).setName("Icon").addDropdown((d) => {
      d.addOption("", "(default)");
      {
        const pool = (this.plugin.settings.icons ?? [])
          .filter((ico) => ico.inCollections !== false || ico.key === (this.working.iconKey ?? ""))
          .sort((a, b) => String(a.key ?? "").localeCompare(String(b.key ?? ""), undefined, { sensitivity: "base", numeric: true }));
        for (const ico of pool) d.addOption(ico.key, ico.key);
      }
      d.setValue(this.working.iconKey ?? "");
      d.onChange((v) => { this.working.iconKey = v || undefined; });
    });
	
    contentEl.createEl("h3", { text: "Generated sections" });

    const sec = (this.working.sections ??= {});

    new Setting(contentEl)
      .setName("Base table (embedded base)")
      .addToggle((tg) => {
        tg.setValue(sec.bases !== false).onChange((on) => {
          sec.bases = on ? true : false;
        });
      });

    new Setting(contentEl)
      .setName("Related notes section (tags/backlinks)")
      .addToggle((tg) => {
        tg.setValue(sec.related !== false).onChange((on) => {
          sec.related = on ? true : false;
        });
      });

    new Setting(contentEl)
      .setName("Unlinked markers section")
      .addToggle((tg) => {
        tg.setValue(sec.tooltips !== false).onChange((on) => {
          sec.tooltips = on ? true : false;
        });
      });

    new Setting(contentEl)
      .setName("Travel times table")
      .addToggle((tg) => {
        tg.setValue(sec.travelTimes !== false).onChange((on) => {
          sec.travelTimes = on ? true : false;
        });
      });
	  
    new Setting(contentEl)
      .setName("Refresh source note after update")
      .setDesc("Experimental. Re-renders the note that contains the map/dashboard after this party pin updates.")
      .addToggle((tg) => {
        tg.setValue(this.working.refreshSourceNoteOnUpdate !== false).onChange((on) => {
          this.working.refreshSourceNoteOnUpdate = on ? true : false;
        });
      });

    new Setting(contentEl)
      .setName("Related notes lookup")
      .setDesc("Expands the search starting from the in-range linked notes.")
      .addDropdown((d) => {
        d.addOption("off", "Off");
        d.addOption("backlinks", "Backlinks (notes linking to the in-range note)");
        d.addOption("tags", "Tags (notes with matching tags)");
        d.setValue(this.working.relatedLookup ?? "tags");
        d.onChange((v) => {
          if (v === "off" || v === "tags" || v === "backlinks") {
            this.working.relatedLookup = v;
          } else {
            this.working.relatedLookup = "tags";
          }
        });
      });

    let customLayersSetting: Setting | null = null;
    const renderCustomLayersSetting = () => {
      if (!customLayersSetting) return;
      customLayersSetting.settingEl.toggle((this.working.searchLayersMode ?? "all") === "custom");
    };

    new Setting(contentEl)
      .setName("Search markers in layers")
      .setDesc("Limits which marker layers are considered when scanning for in-range markers. Custom uses layer *names* (comma separated).")
      .addDropdown((d) => {
        d.addOption("all", "All layers");
        d.addOption("self", "Only the party pin's layer");
        d.addOption("custom", "Custom list");
        d.setValue(this.working.searchLayersMode ?? "all");
        d.onChange((v) => {
          if (v === "all" || v === "self" || v === "custom") {
            this.working.searchLayersMode = v;
          } else {
            this.working.searchLayersMode = "all";
          }
          renderCustomLayersSetting();
        });
      });

    customLayersSetting = new Setting(contentEl)
      .setName("Layer names (comma separated)")
      .setDesc('Example: "npc, shops, quests". If empty, all layers are searched.')
      .addText((t) => {
        t.setPlaceholder("Npc, shops");
        t.setValue((this.working.searchLayerNames ?? []).join(", "));
        t.onChange((v) => {
          const arr = v.split(",").map((s) => s.trim()).filter(Boolean);
          this.working.searchLayerNames = arr;
        });
      });
    renderCustomLayersSetting();

    new Setting(contentEl).setName("Layer name (optional)").addText((t) => {
      t.setPlaceholder("Pings");
      t.setValue(this.working.layerName ?? "");
      t.onChange((v) => { this.working.layerName = v.trim() || undefined; });
    });
	
    new Setting(contentEl)
      .setName("Scale like sticker (default)")
      .setDesc("If enabled, newly created party pins will scale with the map (no inverse wrapper).")
      .addToggle((tg) => {
        tg.setValue(!!this.working.defaultScaleLikeSticker).onChange((on) => {
          this.working.defaultScaleLikeSticker = on ? true : undefined;
        });
      });

    const packs = (this.plugin.settings.travelRulesPacks ?? []);
    new Setting(contentEl)
      .setName("Travel pack")
      .setDesc("Used to select custom units for party radius.")
      .addDropdown((d) => {
        d.addOption("", "(none)");
        for (const p of packs) d.addOption(p.id, p.name || p.id);
        d.setValue(this.working.travelPackId ?? "");
        d.onChange((v) => { this.working.travelPackId = v || undefined; this.renderUnitSetting(); });
      });

    contentEl.createDiv({ text: "" });
    this.renderUnitSetting();

    new Setting(contentEl)
      .setName("Distances (comma separated)")
      .setDesc("Example: 2, 5, 10")
      .addText((t) => {
        t.setValue((this.working.distances ?? []).join(", "));
        t.onChange((v) => {
          const nums = v.split(",")
            .map((s) => Number(s.trim().replace(",", ".")))
            .filter((n) => Number.isFinite(n) && n > 0);
          this.working.distances = nums.length ? nums : [2, 5, 10];
        });
      });

    new Setting(contentEl)
      .setName("Party note folder")
      .setDesc("Vault folder where party pin notes are created.")
      .addText((t) => {
        t.setPlaceholder("Zoommap/pings");
        t.setValue(this.working.noteFolder ?? "");
        t.onChange((v) => { this.working.noteFolder = v.trim() || undefined; });
      });

    new Setting(contentEl)
      .setName("Filter tags (optional, comma separated)")
      .setDesc("These tags are applied as or filter in the embedded bases view.")
      .addText((t) => {
        t.setPlaceholder("Npc, shop, questgiver");
        t.setValue((this.working.filterTags ?? []).join(", "));
        t.onChange((v) => {
          const tags = v.split(",").map((s) => s.trim().replace(/^#/, "")).filter(Boolean);
          this.working.filterTags = tags;
        });
      });

    new Setting(contentEl)
      .setName("Filter properties (optional)")
      .setDesc('One line per key=value, multiple values with | or ,')
      .addTextArea((a) => {
        const props = this.working.filterProps ?? {};
        a.setValue(
          Object.entries(props)
            .map(([k, v]) => {
              const vals = Array.isArray(v) ? v : [String(v ?? "")];
              const cleaned = vals.map((s) => String(s).trim()).filter(Boolean);
              return cleaned.length > 1 ? `${k}=${cleaned.join(" | ")}` : `${k}=${cleaned[0] ?? ""}`;
            })
            .filter((ln) => ln.trim().length > 0)
            .join("\n"),
        );
        a.onChange((v) => {
		  const next: Record<string, string | string[]> = {};
          for (const line of v.split("\n")) {
            const s = line.trim();
            if (!s) continue;
            const i = s.indexOf("=");
            if (i < 1) continue;
            const k = s.slice(0, i).trim();
            const raw = s.slice(i + 1).trim();
            if (!k || !raw) continue;

            const vals = raw
              .split(/[|,]/g)
              .map((x) => x.trim())
              .filter(Boolean);

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

  private renderUnitSetting(): void {
    const { contentEl } = this;
    // remove any previous unit block (simple approach: clear + rebuild would be too much)
    const existing = contentEl.querySelector(".zm-ping-unit-setting");
    existing?.remove();

    const wrap = contentEl.createDiv({ cls: "zm-ping-unit-setting" });

    const pack = (this.plugin.settings.travelRulesPacks ?? []).find((p) => p.id === this.working.travelPackId);
    const customs = (pack?.customUnits ?? []).slice().sort((a, b) => (a.name ?? a.id).localeCompare(b.name ?? b.id));

    const setting = new Setting(wrap).setName("Unit");
    setting.addDropdown((d) => {
      d.addOption("m", "M");
      d.addOption("km", "Km");
      d.addOption("mi", "Mi");
      d.addOption("ft", "Ft");
      for (const cu of customs) {
        const label = cu.abbreviation ? `${cu.name} (${cu.abbreviation})` : cu.name;
        d.addOption(`custom:${cu.id}`, label);
      }

      const cur = this.working.unit === "custom" ? `custom:${this.working.customUnitId ?? ""}` : this.working.unit;
      const has = Array.from(d.selectEl.options).some((o) => o.value === cur);
      d.setValue(has ? cur : "km");

      d.onChange((v) => {
        if (v.startsWith("custom:")) {
          this.working.unit = "custom";
          this.working.customUnitId = v.slice("custom:".length) || undefined;
        } else {
          if (v === "m" || v === "km" || v === "mi" || v === "ft") {
            this.working.unit = v;
          } else {
            this.working.unit = "km";
          }
          this.working.customUnitId = undefined;
        }
      });
    });
  }
}