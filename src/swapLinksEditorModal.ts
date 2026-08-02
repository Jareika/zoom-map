import { Modal, Notice, Setting, TFile } from "obsidian";
import type { App } from "obsidian";
import type ZoomMapPlugin from "./main";
import type { Marker } from "./markerStore";

type SwapPinFrameLite = { iconKey: string; link?: string };
export type SwapPinPresetLite = { id: string; name: string; frames: SwapPinFrameLite[] };

type LinkSuggestion = { label: string; value: string };

export interface SwapLinksEditorResult {
  action: "save" | "cancel";
  swapLinks?: Record<number, string>;
}

type DoneCb = (res: SwapLinksEditorResult) => void;

function deepClone<T>(x: T): T {
  if (typeof structuredClone === "function") return structuredClone(x);
  return JSON.parse(JSON.stringify(x)) as T;
}

function normalizeFrameIndex(rawIndex: number, count: number): number {
  const n = Math.max(1, count);
  return ((rawIndex % n) + n) % n;
}

export class SwapLinksEditorModal extends Modal {
  private plugin: ZoomMapPlugin;
  private marker: Marker;
  private preset: SwapPinPresetLite;
  private onDone: DoneCb;

  private workingLinks: Record<number, string> = {};
  private allSuggestions: LinkSuggestion[] = [];
  private inputs: Map<number, HTMLInputElement> = new Map();

  constructor(
    app: App,
    plugin: ZoomMapPlugin,
    marker: Marker,
    preset: SwapPinPresetLite,
    onDone: DoneCb,
  ) {
    super(app);
    this.plugin = plugin;
    this.marker = marker;
    this.preset = preset;
    this.onDone = onDone;

    // Start from existing per-marker overrides
    this.workingLinks = deepClone(marker.swapLinks ?? {});
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
	this.inputs.clear();
    contentEl.createEl("h2", { text: "Swap links (this pin only)" });

    // Header info
    const rawIndex = typeof this.marker.swapIndex === "number" ? this.marker.swapIndex : 0;
    const idx = normalizeFrameIndex(rawIndex, this.preset.frames.length);
    contentEl.createDiv({ text: `Preset: ${this.preset.name} • Current frame: ${idx + 1}/${this.preset.frames.length}` });

    this.buildLinkSuggestions();

    contentEl.createEl("h3", { text: "Per-frame link overrides" });
    contentEl.createDiv({
      text: "Leave a field empty to fall back to the preset link (or the icon default link).",
    }).addClass("zoommap-muted");

    for (let i = 0; i < this.preset.frames.length; i += 1) {
      const fr = this.preset.frames[i];
      const presetLink = (fr.link ?? "").trim();
      const iconDefault = this.plugin.getIconDefaultLink(fr.iconKey) ?? "";
      const fallback = presetLink || iconDefault;
      const desc = fallback ? `Default: ${fallback}` : "Default: (none)";

      const row = new Setting(contentEl)
        .setName(`Frame ${i + 1}: ${fr.iconKey}`)
        .setDesc(desc);

      // Icon preview
      const iconImg = row.controlEl.createEl("img", { cls: "zoommap-settings__icon-preview" });
      iconImg.src = this.resolveIconUrl(fr.iconKey);

      // Input with autocomplete
      row.addText((t) => {
        t.setPlaceholder("Override link (optional)");
        t.setValue(this.workingLinks[i] ?? "");

        const input = t.inputEl;
		this.inputs.set(i, input);

        this.attachLinkAutocomplete(
          input,
          () => input.value,
          (val) => {
            input.value = val;
            this.setOverride(i, val);
          },
        );

        t.onChange((v) => {
          this.setOverride(i, v);
        });
      });
    }

    new Setting(contentEl)
      .setName("Clear overrides")
      .setDesc("Removes per-frame overrides from this pin.")
      .addButton((b) => {
        b.setButtonText("Clear").onClick(() => {
          this.workingLinks = {};
          for (const input of this.inputs.values()) {
            input.value = "";
          }
          new Notice("Overrides cleared (not saved yet).", 1200);
        });
      });

    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const saveBtn = footer.createEl("button", { text: "Save" });
    const cancelBtn = footer.createEl("button", { text: "Cancel" });

    saveBtn.onclick = () => {
      const cleaned = this.cleanedOverrides(this.workingLinks);
      this.close();
      this.onDone({ action: "save", swapLinks: Object.keys(cleaned).length ? cleaned : undefined });
    };

    cancelBtn.onclick = () => {
      this.close();
      this.onDone({ action: "cancel" });
    };
  }

  onClose(): void {
    this.contentEl.empty();
	this.inputs.clear();
  }

  private setOverride(frameIndex: number, raw: string): void {
    const s = (raw ?? "").trim();
    if (s) this.workingLinks[frameIndex] = s;
    else delete this.workingLinks[frameIndex];
  }

  private cleanedOverrides(raw: Record<number, string>): Record<number, string> {
    const out: Record<number, string> = {};
    for (const [k, v] of Object.entries(raw)) {
      const idx = Number(k);
      const s = (v ?? "").trim();
      if (!Number.isFinite(idx)) continue;
      if (!s) continue;
      out[idx] = s;
    }
    return out;
  }

  private resolveIconUrl(iconKey: string): string {
    const icon =
      (this.plugin.settings.icons ?? []).find((i) => i.key === iconKey) ??
      this.plugin.builtinIcon();

    let src = icon.pathOrDataUrl ?? "";
    if (typeof src !== "string") return "";
    if (src.startsWith("data:")) return src;

    const af = this.app.vault.getAbstractFileByPath(src);
    if (af instanceof TFile) return this.app.vault.getResourcePath(af);

    return src;
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
        suggestions.push({ label: `${baseLink} › ${headingName}`, value: full });
      }
    }

    this.allSuggestions = suggestions;
  }

  private attachLinkAutocomplete(
    input: HTMLInputElement,
    getValue: () => string,
    setValue: (val: string) => void,
  ): void {
    const wrapper = input.parentElement;
    if (!(wrapper instanceof HTMLElement)) return;

    wrapper.classList.add("zoommap-link-input-wrapper");
    const listEl = wrapper.createDiv({ cls: "zoommap-link-suggestions is-hidden" });

    const hide = () => listEl.classList.add("is-hidden");
    const show = () => listEl.classList.remove("is-hidden");
	
	let raf: number | null = null;

    const update = (query: string) => {
      const q = query.trim().toLowerCase();
      listEl.empty();

      if (!q) {
        hide();
        return;
      }

      const matches = this.allSuggestions
        .filter((s) => s.value.toLowerCase().includes(q) || s.label.toLowerCase().includes(q))
        .slice(0, 20);

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
}