import { Modal, Setting } from "obsidian";
import type { App } from "obsidian";
import type { GridOverlay } from "./markerStore";

export type GridEditorModalResult =
  | { action: "save"; grid: GridOverlay }
  | { action: "cancel" };

type DoneCb = (res: GridEditorModalResult) => void;

function deepClone<T>(x: T): T {
  if (typeof structuredClone === "function") return structuredClone(x);
  return JSON.parse(JSON.stringify(x)) as T;
}

function normalizeHex(v: string): string {
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

function moveSettingDescriptionBelow(setting: Setting): void {
  const description = setting.settingEl.querySelector(".setting-item-description");
  if (description) setting.settingEl.appendChild(description);
}

export class GridEditorModal extends Modal {
  private working: GridOverlay;
  private onDone: DoneCb;

  constructor(app: App, grid: GridOverlay, onDone: DoneCb) {
    super(app);
    this.working = deepClone(grid);
    this.onDone = onDone;

    this.working.name = this.working.name ?? "Grid";
    this.working.visible = this.working.visible !== false;
    this.working.shape = this.working.shape === "hex" ? "hex" : "square";
    this.working.color = (this.working.color ?? "").trim() || "#ffffff";
    this.working.width = Number.isFinite(this.working.width) && this.working.width > 0 ? this.working.width : 1;
    this.working.opacity =
      Number.isFinite(this.working.opacity) ? Math.min(1, Math.max(0, this.working.opacity)) : 0.5;
    this.working.spacing =
      Number.isFinite(this.working.spacing) && this.working.spacing > 1 ? this.working.spacing : 64;
    this.working.offsetX = Number.isFinite(this.working.offsetX) ? this.working.offsetX : 0;
    this.working.offsetY = Number.isFinite(this.working.offsetY) ? this.working.offsetY : 0;
    this.working.playerScreen =
      this.working.playerScreen === "player-only" || this.working.playerScreen === "gm-only"
        ? this.working.playerScreen
        : "both";
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl("h2", { text: "Grid" });

    new Setting(contentEl)
      .setName("Name")
      .addText((t) => {
        t.setValue(this.working.name ?? "");
        t.onChange((v) => {
          this.working.name = v.trim() || "Grid";
        });
      });

    new Setting(contentEl)
      .setName("Visible")
      .addToggle((tg) => {
        tg.setValue(!!this.working.visible).onChange((on) => {
          this.working.visible = on;
        });
      });

    new Setting(contentEl)
      .setName("Show on")
      .setDesc("Controls whether the grid is visible for gm, player screen, or both.")
      .addDropdown((d) => {
        d.addOption("both", "Gm + player screen");
        d.addOption("gm-only", "Gm only");
        d.addOption("player-only", "Player screen only");
        d.setValue(this.working.playerScreen ?? "both");
        d.onChange((v) => {
          this.working.playerScreen =
            v === "gm-only" || v === "player-only" ? v : "both";
        });
      });

    new Setting(contentEl)
      .setName("Shape")
      .addDropdown((d) => {
        d.addOption("square", "Square");
        d.addOption("hex", "Hex");
        d.setValue(this.working.shape);
        d.onChange((v) => {
          this.working.shape = v === "hex" ? "hex" : "square";
        });
      });

    const colorRow = new Setting(contentEl)
      .setName("Grid color")
      .setDesc("SVG stroke color.");

    let colorTextEl: HTMLInputElement;
    const picker = colorRow.controlEl.createEl("input", {
      attr: { type: "color", style: "margin-left:8px; vertical-align: middle;" },
    });

    colorRow.addText((t) => {
      t.setPlaceholder(this.working.color);
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

    new Setting(contentEl)
      .setName("Line width (px)")
      .addText((t) => {
        t.inputEl.type = "number";
        t.setValue(String(this.working.width));
        t.onChange((v) => {
          const n = Number(String(v).replace(",", "."));
          if (Number.isFinite(n) && n > 0) this.working.width = n;
        });
      });

    new Setting(contentEl)
      .setName("Opacity (%)")
      .addText((t) => {
        t.inputEl.type = "number";
        t.setValue(String(Math.round(this.working.opacity * 100)));
        t.onChange((v) => {
          const n = Number(String(v).replace(",", "."));
          if (!Number.isFinite(n)) return;
          const clamped = Math.min(100, Math.max(0, n));
          this.working.opacity = clamped / 100;
        });
      });

    new Setting(contentEl)
      .setName("Spacing / cell size (px)")
      .setDesc("Square: cell size. Hex: hex width.")
      .addText((t) => {
        t.inputEl.type = "number";
        t.setValue(String(this.working.spacing));
        t.onChange((v) => {
          const n = Number(String(v).replace(",", "."));
          if (Number.isFinite(n) && n > 1) this.working.spacing = n;
        });
      });

    const offsetSetting = new Setting(contentEl)
      .setName("Offset x / y (px)")
      .setDesc("Absolute anchor in image pixels. For precise alignment use the live alignment command in the map menu.")
      .setClass("zoommap-setting--desc-below zoommap-setting--wrap-control")
	  .addText((t) => {
        t.inputEl.type = "number";
        t.setValue(String(this.working.offsetX));
        t.onChange((v) => {
          const n = Number(String(v).replace(",", "."));
          if (Number.isFinite(n)) this.working.offsetX = n;
        });
      })
      .addText((t) => {
        t.inputEl.type = "number";
        t.setValue(String(this.working.offsetY));
        t.onChange((v) => {
          const n = Number(String(v).replace(",", "."));
          if (Number.isFinite(n)) this.working.offsetY = n;
        });
      });
    moveSettingDescriptionBelow(offsetSetting);

    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const save = footer.createEl("button", { text: "Save" });
    const cancel = footer.createEl("button", { text: "Cancel" });

    save.onclick = () => {
      this.working.name = this.working.name?.trim() || "Grid";
      this.working.color = this.working.color?.trim() || "#ffffff";
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

  onClose(): void {
    this.contentEl.empty();
  }
}