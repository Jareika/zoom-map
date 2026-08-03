import { Modal, Setting } from "obsidian";
import type { App } from "obsidian";
import type ZoomMapPlugin from "./main";
import type { DiceRollSpec } from "./markerStore";

export type DicePinModalValue = {
  iconKey: string;
  rolls: DiceRollSpec[];
  render3d: boolean;
  scaleLikeSticker: boolean;
  placeAsHudPin: boolean;
};

export type DicePinModalResult =
  | { action: "save"; value: DicePinModalValue }
  | { action: "cancel" };

type DoneCb = (res: DicePinModalResult) => void;

const DEFAULT_DICE_SIDES = [4, 6, 8, 10, 12, 20, 100];

function clampInt(n: number, min: number, max: number): number {
  const v = Math.round(n);
  return Math.min(max, Math.max(min, v));
}

function toFormula(rolls: DiceRollSpec[]): string {
  const parts = (rolls ?? [])
    .filter((r) => r && Number.isFinite(r.count) && Number.isFinite(r.sides) && r.count > 0 && r.sides > 0)
    .map((r) => `${Math.round(r.count)}d${Math.round(r.sides)}`);
  return parts.length ? parts.join(" + ") : "1d20";
}

export class DicePinModal extends Modal {
  private plugin: ZoomMapPlugin;
  private value: DicePinModalValue;
  private onDone: DoneCb;

  constructor(
    app: App,
    plugin: ZoomMapPlugin,
    initial: Partial<DicePinModalValue>,
    onDone: DoneCb,
  ) {
    super(app);
    this.plugin = plugin;
    this.onDone = onDone;

    const icons = this.plugin.settings.icons ?? [];
    const defaultIconKey = (initial.iconKey ?? "").trim() || this.plugin.settings.defaultIconKey || (icons[0]?.key ?? "pinRed");

    const rollsRaw = Array.isArray(initial.rolls) ? initial.rolls : [{ count: 1, sides: 20 }];
    const rolls = rollsRaw
      .map((r) => ({
        count: clampInt(Number(r.count ?? 1), 1, 999),
        sides: clampInt(Number(r.sides ?? 20), 2, 1000),
      }))
      .filter((r) => r.count > 0 && r.sides > 0);

    this.value = {
      iconKey: defaultIconKey,
      rolls: rolls.length ? rolls : [{ count: 1, sides: 20 }],
      render3d: !!initial.render3d,
      scaleLikeSticker: !!initial.scaleLikeSticker,
      placeAsHudPin: !!initial.placeAsHudPin,
    };
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Dice pin" });

    new Setting(contentEl)
      .setName("Icon")
      .addDropdown((d) => {
        const sorted = [...(this.plugin.settings.icons ?? [])]
          .map((i) => i?.key ?? "")
          .filter((k) => k.trim().length > 0)
          .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base", numeric: true }));

        for (const key of sorted) d.addOption(key, key);
        d.setValue(this.value.iconKey);
        d.onChange((v) => (this.value.iconKey = v));
      });

    new Setting(contentEl)
      .setName("Graphical roll (3d)")
      .setDesc("Uses dice roller’s dice view (if installed).")
      .addToggle((tg) => {
        tg.setValue(this.value.render3d);
        tg.onChange((on) => (this.value.render3d = on));
      });
	  
    new Setting(contentEl)
      .setName("Scale like sticker")
      .setDesc("Pin scales with the map (no inverse wrapper).")
      .addToggle((tg) => {
        tg.setValue(this.value.scaleLikeSticker);
        tg.onChange((on) => (this.value.scaleLikeSticker = on));
      });

    new Setting(contentEl)
      .setName("Place as hud pin")
      .setDesc("Places the pin in viewport space (stays fixed in the window).")
      .addToggle((tg) => {
        tg.setValue(this.value.placeAsHudPin);
        tg.onChange((on) => (this.value.placeAsHudPin = on));
      });

    const formulaRow = new Setting(contentEl).setName("Formula");
    const formulaEl = formulaRow.controlEl.createEl("code");
    formulaEl.setText(toFormula(this.value.rolls));

    contentEl.createEl("h3", { text: "Dice" });
    const list = contentEl.createDiv({ cls: "zoommap-dice-list" });

    const render = () => {
      list.empty();

      for (let i = 0; i < this.value.rolls.length; i += 1) {
        const r = this.value.rolls[i];
        const row = list.createDiv({ cls: "zoommap-dice-row" });

        const countEl = row.createEl("input", { type: "number" });
        countEl.value = String(r.count ?? 1);
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
          const opt = sidesEl.createEl("option", { text: `d${s}` });
          opt.value = String(s);
        }

        const hasCurrent = Array.from(sidesEl.options).some((o) => Number(o.value) === r.sides);
        if (!hasCurrent) {
          const opt = sidesEl.createEl("option", { text: `d${r.sides}` });
          opt.value = String(r.sides);
        }

        sidesEl.value = String(r.sides);
        sidesEl.onchange = () => {
          r.sides = clampInt(Number(sidesEl.value), 2, 1000);
          formulaEl.setText(toFormula(this.value.rolls));
        };

        const del = row.createEl("button", { text: "Delete" });
        del.onclick = () => {
          this.value.rolls.splice(i, 1);
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
      const cleaned = (this.value.rolls ?? [])
        .map((r) => ({
          count: clampInt(Number(r.count ?? 1), 1, 999),
          sides: clampInt(Number(r.sides ?? 20), 2, 1000),
        }))
        .filter((r) => r.count > 0 && r.sides > 0);

      if (!cleaned.length) cleaned.push({ count: 1, sides: 20 });

      this.close();
      this.onDone({
        action: "save",
        value: {
          iconKey: (this.value.iconKey ?? "").trim(),
          rolls: cleaned,
          render3d: !!this.value.render3d,
          scaleLikeSticker: !!this.value.scaleLikeSticker,
          placeAsHudPin: !!this.value.placeAsHudPin,
        },
      });
    };

    cancel.onclick = () => {
      this.close();
      this.onDone({ action: "cancel" });
    };
  }

  onClose(): void {
    this.contentEl.empty();
  }
}