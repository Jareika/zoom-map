import { Modal, Notice, Setting, TFile, normalizePath } from "obsidian";
import type { App } from "obsidian";
import type ZoomMapPlugin from "./main";
import type { TravelRulesPack, CustomUnitDef, TerrainDef, TravelTimePreset, TravelPerDayConfig, TravelPerDayPreset } from "./map";
import { JsonFileSuggestModal } from "./jsonFileSuggest";

type DoneCb = () => void;

function genId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function deepClone<T>(x: T): T {
  if (typeof structuredClone === "function") return structuredClone(x);
  return JSON.parse(JSON.stringify(x)) as T;
}

type ExportPayload =
  | { version: 1; packs: TravelRulesPack[]; exportedAt: string }
  | { version: 1; pack: TravelRulesPack; exportedAt: string };
  
function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function isTravelPerDayConfig(x: unknown): x is TravelPerDayConfig {
  if (!isRecord(x)) return false;
  return typeof x.value === "number" && typeof x.unit === "string";
}

function isTravelPerDayPreset(x: unknown): x is TravelPerDayPreset {
  if (!isRecord(x)) return false;
  return (
    typeof x.id === "string" &&
    typeof x.name === "string" &&
    typeof x.value === "number" &&
    typeof x.unit === "string"
  );
}

function isCustomUnitDef(x: unknown): x is CustomUnitDef {
  if (!isRecord(x)) return false;
  return (
    typeof x.id === "string" &&
    typeof x.name === "string" &&
    typeof x.abbreviation === "string" &&
    typeof x.metersPerUnit === "number"
  );
}

function isTravelTimePreset(x: unknown): x is TravelTimePreset {
  if (!isRecord(x)) return false;
  if (typeof x.id !== "string" || typeof x.name !== "string") return false;
  if (typeof x.distanceValue !== "number") return false;
  if (typeof x.distanceUnit !== "string") return false;
  if (typeof x.timeValue !== "number" || typeof x.timeUnit !== "string") return false;
  return true;
}

function isTerrainDef(x: unknown): x is TerrainDef {
  if (!isRecord(x)) return false;
  return typeof x.id === "string" && typeof x.name === "string" && typeof x.factor === "number";
}

function isTravelRulesPack(x: unknown): x is TravelRulesPack {
  if (!isRecord(x)) return false;
  if (typeof x.id !== "string" || typeof x.name !== "string") return false;
  if (!Array.isArray(x.customUnits) || !x.customUnits.every(isCustomUnitDef)) return false;
  if (!Array.isArray(x.terrains) || !x.terrains.every(isTerrainDef)) return false;
  if (!Array.isArray(x.travelTimePresets) || !x.travelTimePresets.every(isTravelTimePreset)) return false;
  const hasNew = Array.isArray(x.travelPerDayPresets) && x.travelPerDayPresets.every(isTravelPerDayPreset);
  const hasOld = isTravelPerDayConfig(x.travelPerDay);
  if (!hasNew && !hasOld) return false;
  if ("enabled" in x && typeof x.enabled !== "boolean") return false;
  return true;
}

async function writeJsonToVault(app: App, path: string, payload: unknown): Promise<string> {
  const p = normalizePath(path);
  const dir = p.split("/").slice(0, -1).join("/");
  if (dir && !app.vault.getAbstractFileByPath(dir)) {
    await app.vault.createFolder(dir);
  }

  const json = JSON.stringify(payload, null, 2);
  //// @ts-expect-error write exists on adapters
  await app.vault.adapter.write(p, json);
  return p;
}

export class TravelRulesManagerModal extends Modal {
  private plugin: ZoomMapPlugin;
  private onDone?: DoneCb;

  constructor(app: App, plugin: ZoomMapPlugin, onDone?: DoneCb) {
    super(app);
    this.plugin = plugin;
    this.onDone = onDone;
  }

  onOpen(): void {
    this.render();
  }

  onClose(): void {
    this.contentEl.empty();
    this.onDone?.();
  }

  private render(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Travel rules" });

    const packs = (this.plugin.settings.travelRulesPacks ??= []);

    const list = contentEl.createDiv();
    if (packs.length === 0) {
      list.createEl("div", { text: "No travel packs yet." });
    }

    packs.forEach((p, idx) => {
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
        text:
          `${p.customUnits?.length ?? 0} custom units` +
		  ` • ${p.terrains?.length ?? 0} terrains` +
          ` • ${p.travelTimePresets?.length ?? 0} travel presets`,
      }).addClass("zoommap-collections-meta");

      const actions = row.createDiv({ cls: "zoommap-travel-pack-actions" });

      const edit = actions.createEl("button", { text: "Edit" });
      edit.onclick = () => {
        new TravelRulesPackEditorModal(this.app, this.plugin, p, (res) => {
          if (res.action !== "save" || !res.pack) return;
          packs[idx] = res.pack;
          void this.plugin.saveSettings().then(() => this.render());
        }).open();
      };

      const exportBtn = actions.createEl("button", { text: "Export" });
      exportBtn.addClass("zm-btn-sm");
      exportBtn.onclick = () => {
        void (async () => {
          try {
            const outPath = normalizePath(`ZoomMap/travel-pack-${p.id}.json`);
            const payload: ExportPayload = {
              version: 1,
              pack: p,
              exportedAt: new Date().toISOString(),
            };
            const written = await writeJsonToVault(this.app, outPath, payload);
            new Notice(`Exported: ${written}`, 2500);
          } catch (e) {
            console.error(e);
            new Notice("Export failed.", 3000);
          }
        })();
      };

      const del = actions.createEl("button", { text: "Delete" });
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
        travelPerDay: { value: 8, unit: "h" }, // legacy mirror
      });
      void this.plugin.saveSettings().then(() => this.render());
    };

    const importBtn = actions.createEl("button", { text: "Import…" });
    importBtn.onclick = () => {
      new JsonFileSuggestModal(this.app, (file: TFile) => {
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
          const outPath = normalizePath("ZoomMap/travel-rules-packs.json");
          const payload: ExportPayload = { version: 1, packs, exportedAt: new Date().toISOString() };
          const written = await writeJsonToVault(this.app, outPath, payload);
          new Notice(`Exported: ${written}`, 2500);
        } catch (e) {
          console.error(e);
          new Notice("Export failed.", 3000);
        }
      })();
    };

    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    footer.createEl("button", { text: "Close" }).onclick = () => this.close();
  }

  private async importFromFile(file: TFile): Promise<void> {
    try {
      const raw = await this.app.vault.read(file);
      const obj: unknown = JSON.parse(raw);

      const packs = (this.plugin.settings.travelRulesPacks ??= []);
      const existingIds = new Set(packs.map((p) => p.id));

      const addPack = (p: TravelRulesPack) => {
        const next = deepClone(p);
        if (!next.id || existingIds.has(next.id)) next.id = genId("trp");
        if (!next.name) next.name = `Imported pack ${packs.length + 1}`;
        next.customUnits ??= [];
        next.travelTimePresets ??= [];
        next.travelPerDay ??= { value: 8, unit: "h" };
        packs.push(next);
        existingIds.add(next.id);
      };

      if (isRecord(obj) && "version" in obj) {
        const v = obj.version;
        if (v !== 1) {
          new Notice("Unsupported import format.", 3500);
          return;
        }
        if ("packs" in obj && Array.isArray(obj.packs)) {
          for (const p of obj.packs) {
            if (isTravelRulesPack(p)) addPack(p);
          }
        } else if ("pack" in obj && isTravelRulesPack(obj.pack)) {
          addPack(obj.pack);
        } else {
          new Notice("Invalid travel rules JSON.", 3500);
          return;
        }
      } else {
        if (!isTravelRulesPack(obj)) {
          new Notice("Invalid travel pack JSON.", 3500);
          return;
        }
        addPack(obj);
      }

      await this.plugin.saveSettings();
      new Notice("Import successful.", 2000);
    } catch (e) {
      console.error(e);
      new Notice("Import failed.", 3000);
    }
  }
}

type PackEditorResult = { action: "save" | "cancel"; pack?: TravelRulesPack };
type PackEditorCb = (res: PackEditorResult) => void;

class TravelRulesPackEditorModal extends Modal {
  private plugin: ZoomMapPlugin;
  private original: TravelRulesPack;
  private working: TravelRulesPack;
  private onDone: PackEditorCb;

  constructor(app: App, plugin: ZoomMapPlugin, pack: TravelRulesPack, onDone: PackEditorCb) {
    super(app);
    this.plugin = plugin;
    this.original = pack;
    this.working = deepClone(pack);
    this.working.customUnits ??= [];
	this.working.terrains ??= [];
    this.working.travelTimePresets ??= [];
    this.working.travelPerDayPresets ??= [{ id: genId("tpd"), name: "Default", value: 8, unit: "h" }];
    this.working.travelPerDay ??= { value: 8, unit: "h" }; // legacy mirror
    this.onDone = onDone;
  }

  onOpen(): void {
    this.modalEl.addClass("zoommap-modal--travel");
    this.render();
  }

  onClose(): void {
    this.contentEl.empty();
  }

  private render(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Edit travel pack" });

    new Setting(contentEl).setName("Name").addText((t) => {
      t.setValue(this.working.name ?? "");
      t.onChange((v) => (this.working.name = v.trim() || this.working.name));
    });

    // Max travel time presets (per day)
    contentEl.createEl("h3", { text: "Max travel time presets" });
    const perDayWrap = contentEl.createDiv();

    const renderPerDayPresets = () => {
      perDayWrap.empty();
      const list = (this.working.travelPerDayPresets ??= []);

      if (list.length === 0) {
        perDayWrap.createEl("div", { text: "No max travel time presets." }).addClass("zoommap-muted");
      }

      list.forEach((p, idx) => {
        const row = perDayWrap.createDiv({ cls: "zoommap-travel-perday-row" });

        const name = row.createEl("input", { type: "text" });
        name.placeholder = "Name";
        name.value = p.name ?? "";
        name.oninput = () => { p.name = name.value.trim(); };

        const val = row.createEl("input", { type: "number" });
        val.placeholder = "8";
        val.value = String(p.value ?? 8);
        val.oninput = () => {
          const n = Number(String(val.value).replace(",", "."));
          if (Number.isFinite(n) && n > 0) p.value = n;
        };

        const unit = row.createEl("input", { type: "text" });
        unit.placeholder = "H";
        unit.value = p.unit ?? "h";
        unit.oninput = () => { p.unit = unit.value.trim() || "h"; };

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

    // Custom units
    contentEl.createEl("h3", { text: "Custom units" });
    const unitsWrap = contentEl.createDiv();
    const renderUnits = () => {
      unitsWrap.empty();
      const units = (this.working.customUnits ??= []);

      if (units.length === 0) {
        unitsWrap.createEl("div", { text: "No custom units." }).addClass("zoommap-muted");
      }

      units.forEach((u, idx) => {
        const row = unitsWrap.createDiv({ cls: "zoommap-custom-unit-row" });

        const nameInput = row.createEl("input", { type: "text" });
		nameInput.classList.add("zm-cu-name");
        nameInput.placeholder = "Name";
        nameInput.value = u.name ?? "";
        nameInput.oninput = () => (u.name = nameInput.value.trim());

        const abbrInput = row.createEl("input", { type: "text" });
		abbrInput.classList.add("zm-cu-abbr");
        abbrInput.placeholder = "Abbreviation";
        abbrInput.value = u.abbreviation ?? "";
        abbrInput.oninput = () => (u.abbreviation = abbrInput.value.trim());

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
          metersPerUnit: 5 * 0.3048,
        });
        renderUnits();
      };
    };
    renderUnits();
	
    // Terrains
    contentEl.createEl("h3", { text: "Terrains" });
    const terrainsWrap = contentEl.createDiv();
    const renderTerrains = () => {
      terrainsWrap.empty();
      const terrains = (this.working.terrains ??= []);

      if (terrains.length === 0) {
        terrainsWrap.createEl("div", { text: "No terrains." }).addClass("zoommap-muted");
      }

      terrains.forEach((t, idx) => {
        const row = terrainsWrap.createDiv({ cls: "zoommap-custom-unit-row" });

        const nameInput = row.createEl("input", { type: "text" });
        nameInput.classList.add("zm-cu-name");
        nameInput.placeholder = "Name";
        nameInput.value = t.name ?? "";
        nameInput.oninput = () => (t.name = nameInput.value.trim());

        const factorInput = row.createEl("input", { type: "number" });
        factorInput.classList.add("zm-cu-factor");
        factorInput.placeholder = "1";
        factorInput.value = String(t.factor ?? 1);
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

    // Travel presets
    contentEl.createEl("h3", { text: "Travel time presets" });
    const presetsWrap = contentEl.createDiv();
    const renderPresets = () => {
      presetsWrap.empty();
      const presets = (this.working.travelTimePresets ??= []);

      const customDefs = this.working.customUnits ?? [];

      const head = presetsWrap.createDiv({ cls: "zm-travel-grid-head" });
      head.createSpan({ text: "Mode" });
      head.createSpan({ text: "Dist" });
      head.createSpan({ text: "Unit" });
      head.createSpan({ text: "Time" });
      head.createSpan({ text: "Time unit" });
      head.createSpan({ text: "" });

      const grid = presetsWrap.createDiv({ cls: "zm-travel-grid" });

      const addUnitOptions = (sel: HTMLSelectElement) => {
        const add = (value: string, label: string) => {
          const opt = document.createElement("option");
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
        const name = grid.createEl("input", { type: "text", cls: "zm-travel-name" });
        name.value = p.name ?? "";
        name.oninput = () => (p.name = name.value.trim());

        const distVal = grid.createEl("input", { type: "number", cls: "zm-travel-num" });
        distVal.value = String(p.distanceValue ?? 1);
        distVal.oninput = () => {
          const n = Number(distVal.value);
          if (Number.isFinite(n) && n > 0) p.distanceValue = n;
        };

        const unitSel = grid.createEl("select", { cls: "zm-travel-unit" });
        addUnitOptions(unitSel);
        const current =
          p.distanceUnit === "custom" ? `custom:${p.distanceCustomUnitId ?? ""}` : p.distanceUnit;
        unitSel.value =
          Array.from(unitSel.options).some((o) => o.value === current) ? current : "km";

        unitSel.onchange = () => {
          const v = unitSel.value;
          if (v.startsWith("custom:")) {
            p.distanceUnit = "custom";
            p.distanceCustomUnitId = v.slice("custom:".length) || undefined;
          } else {
            const isStd =
              v === "m" || v === "km" || v === "mi" || v === "ft";
            if (isStd) {
              p.distanceUnit = v;
            } else {
              p.distanceUnit = "km";
            }
            p.distanceCustomUnitId = undefined;
          }
        };

        const timeVal = grid.createEl("input", { type: "number", cls: "zm-travel-num" });
        timeVal.value = String(p.timeValue ?? 1);
        timeVal.oninput = () => {
          const n = Number(timeVal.value);
          if (Number.isFinite(n) && n > 0) p.timeValue = n;
        };

        const timeUnit = grid.createEl("input", { type: "text", cls: "zm-travel-timeunit" });
        timeUnit.value = p.timeUnit ?? "";
        timeUnit.oninput = () => { p.timeUnit = timeUnit.value.trim(); };

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
          timeUnit: "h",
        });
        renderPresets();
      };
    };
    renderPresets();

    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const saveBtn = footer.createEl("button", { text: "Save" });
    const cancelBtn = footer.createEl("button", { text: "Cancel" });

    saveBtn.onclick = () => {
      // write back
      this.original.name = this.working.name;
      this.original.enabled = this.working.enabled;
      this.original.customUnits = this.working.customUnits ?? [];
	  this.original.terrains = this.working.terrains ?? [];
      this.original.travelTimePresets = this.working.travelTimePresets ?? [];
      this.original.travelPerDayPresets = this.working.travelPerDayPresets ?? [];
      // legacy mirror: keep first preset as old travelPerDay
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
}