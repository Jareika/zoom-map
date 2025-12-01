import { Modal, Setting, TFile } from "obsidian";
import type { App } from "obsidian";
import type ZoomMapPlugin from "./main";
import { ImageFileSuggestModal } from "./iconFileSuggest";
import type { BaseCollection, MarkerPreset, StickerPreset } from "./map";

function deepClone<T>(x: T): T {
  if (typeof structuredClone === "function") return structuredClone(x);
  const json = JSON.stringify(x);
  return JSON.parse(json) as unknown as T;
}

export class CollectionEditorModal extends Modal {
  private plugin: ZoomMapPlugin;
  private original: BaseCollection;
  private working: BaseCollection;
  private onDone: (updated: boolean, deleted: boolean) => void;

  constructor(
    app: App,
    plugin: ZoomMapPlugin,
    collection: BaseCollection,
    onDone: (updated: boolean, deleted: boolean) => void,
  ) {
    super(app);
    this.plugin = plugin;
    this.original = collection;
    this.working = deepClone(collection);
    // normalize
    this.working.bindings = this.working.bindings ?? { basePaths: [] };
    this.working.bindings.basePaths = this.working.bindings.basePaths ?? [];
    this.working.include = this.working.include ?? { pinKeys: [], favorites: [], stickers: [] };
    this.working.include.pinKeys = this.working.include.pinKeys ?? [];
    this.working.include.favorites = this.working.include.favorites ?? [];
    this.working.include.stickers = this.working.include.stickers ?? [];
    this.onDone = onDone;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl("h2", { text: "Edit collection" });

    new Setting(contentEl)
      .setName("Name")
      .addText((t) => {
        t.setValue(this.working.name ?? "");
        t.onChange((v) => (this.working.name = v.trim()));
      });

    // Bindings (Base paths only)
    contentEl.createEl("h3", { text: "Bindings (base images)" });

    const pathsWrap = contentEl.createDiv();
    const renderPaths = () => {
      pathsWrap.empty();
      if (!this.working.bindings.basePaths.length) {
        pathsWrap.createEl("div", { text: "No base images bound." });
      } else {
        this.working.bindings.basePaths.forEach((p, idx) => {
          const row = pathsWrap.createDiv({
            attr: {
              style:
                "display:flex; align-items:center; gap:8px; margin:4px 0; border:1px solid var(--background-modifier-border); border-radius:6px; padding:4px 6px; overflow:auto;",
            },
          });
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
      const addBtn = pathsWrap.createEl("button", { text: "Add base image…" });
      addBtn.onclick = () => {
        new ImageFileSuggestModal(this.app, (file: TFile) => {
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

    // Pins selection from library
    contentEl.createEl("h3", { text: "Pins (from icon library)" });

    const pinWrap = contentEl.createDiv();
    const renderPins = () => {
      pinWrap.empty();

      pinWrap.createEl("div", {
        text: "Select pins from the icon library:",
        attr: { style: "margin-bottom:6px; font-weight:600;" },
      });

      const lib = this.plugin.settings.icons ?? [];
      if (lib.length === 0) {
        pinWrap.createEl("div", {
          text: "No icons in library yet. Add some in 'Marker icons (library)'.",
          attr: { style: "color: var(--text-muted);" },
        });
      } else {
        const list = pinWrap.createDiv({
          attr: {
            style:
              "display:grid; grid-template-columns: repeat(auto-fill, minmax(220px,1fr)); gap:8px; margin-bottom:6px;",
          },
        });
        lib.forEach((ico) => {
          const cell = list.createDiv({
            attr: {
              style:
                "display:flex; align-items:center; gap:8px; padding:6px; border:1px solid var(--background-modifier-border); border-radius:6px; min-width:0;",
            },
          });

          // Checkbox
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

          // Icon image (defensiv, ohne Exceptions)
          const img = cell.createEl("img", {
            attr: { style: "width:18px;height:18px;object-fit:contain;flex:0 0 auto;" },
          });

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

          // Label
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

    // Favorites (presets)
    contentEl.createEl("h3", { text: "Favorites (presets)" });

    const favWrap = contentEl.createDiv();
    const renderFavs = () => {
      favWrap.empty();
      const list = this.working.include.favorites;
      if (list.length === 0) {
        favWrap.createEl("div", {
          text: "No favorites in this collection.",
          attr: { style: "color: var(--text-muted);" },
        });
      }
      list.forEach((p, idx) => {
        const row = favWrap.createDiv({
          attr: {
            style:
              "display:grid; grid-template-columns: 14ch 12ch 12ch 8ch minmax(18ch,1fr) auto; gap:6px; align-items:center; margin:6px 0;",
          },
        });
        // Name
        const name = row.createEl("input", { type: "text" });
        name.value = p.name ?? "";
        name.oninput = () => (p.name = name.value.trim());

        // Icon key from library
        const iconSel = row.createEl("select");
        const addOpt = (val: string, labelText: string) => {
          const o = document.createElement("option");
          o.value = val;
          o.textContent = labelText;
          iconSel.appendChild(o);
        };
        addOpt("", "(default)");
        (this.plugin.settings.icons ?? []).forEach((ico) => addOpt(ico.key, ico.key));
        iconSel.value = p.iconKey ?? "";
        iconSel.onchange = () => (p.iconKey = iconSel.value || undefined);

        // Layer name
        const layer = row.createEl("input", { type: "text" });
        layer.placeholder = "Layer (optional)";
        layer.value = p.layerName ?? "";
        layer.oninput = () => (p.layerName = layer.value.trim() || undefined);

        // Open editor toggle
        const ed = row.createEl("input", { type: "checkbox" });
        ed.checked = !!p.openEditor;
        ed.onchange = () => (p.openEditor = ed.checked);

        // Link template
        const link = row.createEl("input", { type: "text" });
        link.placeholder = "Link template (optional)";
        link.value = p.linkTemplate ?? "";
        link.oninput = () => (p.linkTemplate = link.value.trim() || undefined);

        const del = row.createEl("button", { text: "Delete" });
        del.onclick = () => {
          this.working.include.favorites.splice(idx, 1);
          renderFavs();
        };
      });

      const add = favWrap.createEl("button", { text: "Add favorite" });
      add.onclick = () => {
        const p: MarkerPreset = { name: `Favorite ${this.working.include.favorites.length + 1}`, openEditor: false };
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
        stickerWrap.createEl("div", {
          text: "No stickers in this collection.",
          attr: { style: "color: var(--text-muted);" },
        });
      }
      list.forEach((s, idx) => {
        const row = stickerWrap.createDiv({
          attr: {
            style:
              "display:grid; grid-template-columns: 14ch minmax(20ch,1fr) 8ch 12ch auto; gap:6px; align-items:center; margin:6px 0;",
          },
        });
        const name = row.createEl("input", { type: "text" });
        name.value = s.name ?? "";
        name.oninput = () => (s.name = name.value.trim());

        const path = row.createEl("input", { type: "text" });
        path.placeholder = "image path or data URL";
        path.value = s.imagePath ?? "";
        path.oninput = () => (s.imagePath = path.value.trim());

        const size = row.createEl("input", { type: "number" });
        size.value = String(s.size ?? 64);
        size.oninput = () => {
          const n = Number(size.value);
          if (Number.isFinite(n) && n > 0) s.size = Math.round(n);
        };

        const layer = row.createEl("input", { type: "text" });
        layer.placeholder = "Layer (optional)";
        layer.value = s.layerName ?? "";
        layer.oninput = () => (s.layerName = layer.value.trim() || undefined);

        const pick = row.createEl("button", { text: "Pick…" });
        pick.onclick = () => {
          new ImageFileSuggestModal(this.app, (file: TFile) => {
            if (file) {
              s.imagePath = file.path;
              renderStickers();
            }
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
        const s: StickerPreset = { name: `Sticker ${this.working.include.stickers.length + 1}`, imagePath: "", size: 64, openEditor: false };
        this.working.include.stickers.push(s);
        renderStickers();
      };
    };
    renderStickers();

    // Footer
    const footer = contentEl.createDiv({
      attr: { style: "display:flex; gap:8px; justify-content:flex-end; margin-top:14px;" },
    });

    const save = footer.createEl("button", { text: "Save" });
    save.onclick = async () => {
      // copy working back to original
      this.original.name = this.working.name;
      this.original.bindings = deepClone(this.working.bindings);
      this.original.include = deepClone(this.working.include);
      await this.plugin.saveSettings();
      this.close();
      this.onDone(true, false);
    };

    const del = footer.createEl("button", { text: "Delete" });
    del.onclick = () => {
      this.close();
      this.onDone(false, true);
    };

    const cancel = footer.createEl("button", { text: "Cancel" });
    cancel.onclick = () => {
      this.close();
      this.onDone(false, false);
    };
  }

  onClose(): void {
    this.contentEl.empty();
  }
}