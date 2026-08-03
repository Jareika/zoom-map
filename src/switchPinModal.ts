import { Modal, Setting } from "obsidian";
import type { App } from "obsidian";
import type ZoomMapPlugin from "./main";
import type { BaseImage } from "./markerStore";

export type SwitchPinModalValue = {
  iconKey: string;
  rotate: boolean;
  switchBase?: string;
  scaleLikeSticker: boolean;
  placeAsHudPin: boolean;
};

export type SwitchPinModalResult =
  | { action: "save"; value: SwitchPinModalValue }
  | { action: "cancel" };

type DoneCb = (res: SwitchPinModalResult) => void;

export class SwitchPinModal extends Modal {
  private plugin: ZoomMapPlugin;
  private bases: BaseImage[];
  private value: SwitchPinModalValue;
  private onDone: DoneCb;

  constructor(
    app: App,
    plugin: ZoomMapPlugin,
    initial: {
      bases: BaseImage[];
      iconKey: string;
      rotate: boolean;
      switchBase?: string;
      scaleLikeSticker: boolean;
      placeAsHudPin: boolean;
    },
    onDone: DoneCb,
  ) {
    super(app);
    this.plugin = plugin;
    this.bases = (initial.bases ?? []).filter((b) => !!b && typeof b.path === "string" && b.path.trim().length > 0);

    const defaultIcon = (initial.iconKey ?? "").trim() || this.plugin.settings.defaultIconKey;
    const rotate = !!initial.rotate;

    this.value = {
      iconKey: defaultIcon,
      rotate,
      switchBase: rotate ? undefined : (initial.switchBase ?? ""),
      scaleLikeSticker: !!initial.scaleLikeSticker,
      placeAsHudPin: !!initial.placeAsHudPin,
    };

    this.onDone = onDone;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Switch pin" });

    new Setting(contentEl)
      .setName("Icon")
      .addDropdown((d) => {
        const sorted = [...(this.plugin.settings.icons ?? [])].sort((a, b) =>
          String(a.key ?? "").localeCompare(String(b.key ?? ""), undefined, { sensitivity: "base", numeric: true }),
        );
        for (const ico of sorted) {
          if (!ico?.key) continue;
          d.addOption(ico.key, ico.key);
        }
        d.setValue(this.value.iconKey);
        d.onChange((v) => {
          this.value.iconKey = v;
        });
      });

    let baseSetting: Setting | null = null;
    const toggleBaseRow = () => {
      baseSetting?.settingEl.toggle(!this.value.rotate);
    };

    new Setting(contentEl)
      .setName("Rotate (cycle bases)")
      .setDesc("If enabled, right click cycles through all base images.")
      .addToggle((tg) => {
        tg.setValue(this.value.rotate);
        tg.onChange((on) => {
          this.value.rotate = on;
          if (on) this.value.switchBase = undefined;
          toggleBaseRow();
        });
      });

    baseSetting = new Setting(contentEl)
      .setName("Switch to base")
      .setDesc("If rotate is disabled, right click switches to this base.")
      .addDropdown((d) => {
        d.addOption("", "(None)");
        for (const b of this.bases) {
          const label = (b.name ?? "").trim() || (b.path.split("/").pop() ?? b.path);
          d.addOption(b.path, label);
        }

        const cur = (this.value.switchBase ?? "").trim();
        const has = Array.from(d.selectEl.options).some((o) => o.value === cur);
        d.setValue(has ? cur : "");

        d.onChange((v) => {
          const s = (v ?? "").trim();
          this.value.switchBase = s.length ? s : undefined;
        });
      });
    toggleBaseRow();

    new Setting(contentEl)
      .setName("Scale like sticker")
      .setDesc("Pin scales with the map (no inverse wrapper).")
      .addToggle((tg) => {
        tg.setValue(this.value.scaleLikeSticker);
        tg.onChange((on) => {
          this.value.scaleLikeSticker = on;
        });
      });

    new Setting(contentEl)
      .setName("Place as hud pin")
      .setDesc("Places the pin in viewport space (stays fixed in the window).")
      .addToggle((tg) => {
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

  onClose(): void {
    this.contentEl.empty();
  }
}