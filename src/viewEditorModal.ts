import { Modal, Setting, Notice } from "obsidian";
import type { App } from "obsidian";
import { ImageFileSuggestModal } from "./iconFileSuggest";

export type RenderMode = "dom" | "canvas";
export type ResizeHandle = "left" | "right" | "both" | "native";
export type ImageRenderingMode = "auto" | "pixelated" | "crisp-edges";
export type AlignMode = "left" | "center" | "right";

export interface ViewEditorConfig {
  imageBases: { path: string; name?: string }[];
  overlays: { path: string; name?: string; visible?: boolean }[];
  markersPath: string;
  renderMode: RenderMode;
  imageRendering?: ImageRenderingMode;
  minZoom: number;
  maxZoom: number;
  wrap: boolean;
  responsive: boolean;
  width: string;
  height: string;
  useWidth: boolean;
  useHeight: boolean;
  resizable: boolean;
  resizeHandle: ResizeHandle;
  align?: AlignMode;
  markerLayers: string[];
  id?: string;
  viewportFrame?: string;
  viewportFrameInsets?: {
    unit: "framePx" | "percent";
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface ViewEditorResult {
  action: "save" | "cancel";
  config?: ViewEditorConfig;
}

type ViewEditorCallback = (result: ViewEditorResult) => void;
type ViewEditorPreviewCallback = (config: ViewEditorConfig) => void;

export class ViewEditorModal extends Modal {
  private markersInputEl: HTMLInputElement | null = null;

  private cfg: ViewEditorConfig;
  private onResult: ViewEditorCallback;
  private onPreview?: ViewEditorPreviewCallback;

  constructor(app: App, initial: ViewEditorConfig, onResult: ViewEditorCallback, opts?: { onPreview?: ViewEditorPreviewCallback }) {
    super(app);
    this.cfg = JSON.parse(JSON.stringify(initial)) as ViewEditorConfig;
    this.onResult = onResult;
	this.onPreview = opts?.onPreview;

    if (!this.cfg.imageBases || this.cfg.imageBases.length === 0) {
      this.cfg.imageBases = [{ path: "", name: "" }];
    }
    this.cfg.overlays ??= [];
    this.cfg.markerLayers ??= ["Default"];
    this.cfg.width ||= "100%";
    this.cfg.height ||= "480px";
    this.cfg.renderMode ||= "dom";
    this.cfg.resizeHandle ||= "right";
	this.cfg.imageRendering ||= "auto";

    if (typeof this.cfg.viewportFrame !== "string") this.cfg.viewportFrame = "";
    this.cfg.viewportFrameInsets ??= {
      unit: "framePx",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    };
  }
  
  private factorToPercentString(f?: number): string {
    if (typeof f !== "number" || !Number.isFinite(f) || f <= 0) return "";
    return String(Math.round(f * 100));
  }

  private percentInputToFactor(input: string, fallback: number): number {
    let s = input.trim();
    if (!s) return fallback;
    if (s.endsWith("%")) s = s.slice(0, -1).trim();
    s = s.replace(",", ".");
    const n = Number(s);
    if (!Number.isFinite(n) || n <= 0) return fallback;
    return n / 100;
  }
  
  private createCompactGrid(
    parent: HTMLElement,
    columns = 4,
  ): HTMLDivElement {
    const grid = parent.createDiv({
      cls: "zoommap-view-editor-compact-grid",
    });
    grid.style.setProperty(
      "--zoommap-view-editor-compact-columns",
      String(columns),
    );
    return grid;
  }

  private createCompactField(
    parent: HTMLElement,
    label: string,
    opts?: { hint?: string; wide?: boolean },
  ): HTMLDivElement {
    const field = parent.createDiv({
      cls: "zoommap-view-editor-compact-field",
    });

    if (opts?.wide) {
      field.addClass("zoommap-view-editor-compact-field--wide");
    }

    const labelEl = field.createEl("label", { text: label });
    if (opts?.hint) {
      labelEl.setAttr("title", opts.hint);
      labelEl.addClass("zoommap-view-editor-compact-label--hint");
    }

    return field;
  }
  
  private createInlineLabel(
    parent: HTMLElement,
    text: string,
    hint?: string
  ): HTMLSpanElement {
    const label = parent.createSpan({
      cls: "zoommap-view-editor-inline-label",
      text
    });

    if (hint) {
      label.setAttr("title", hint);
      label.addClass("zoommap-view-editor-inline-label--hint");
    }

    return label;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("zoommap-view-editor");

    contentEl.createEl("h2", { text: "Edit view" });

    /* -------- Bases -------- */
    contentEl.createEl("h3", { text: "Base images" });

    const basesWrap = contentEl.createDiv({ cls: "zoommap-view-editor-section" });
    const renderBases = () => {
      basesWrap.empty();

      this.cfg.imageBases.forEach((b, idx) => {
        const row = basesWrap.createDiv({ cls: "zoommap-view-editor-row" });

        // Path
        const pathInput = row.createEl("input", {
          type: "text",
        });
        pathInput.addClass("zoommap-view-editor-input", "zoommap-view-editor-input-path");
        pathInput.placeholder = idx === 0 ? "Path to base image (required)" : "Path to additional base image";
        pathInput.value = b.path ?? "";
        pathInput.oninput = () => {
          this.cfg.imageBases[idx].path = pathInput.value.trim();
          this.autoFillMarkersPathFromFirstBase();
        };

        // File picker
        const pickBtn = row.createEl("button", { text: "Pick…" });
        pickBtn.addClass("zoommap-view-editor-button");
        pickBtn.onclick = () => {
          new ImageFileSuggestModal(this.app, (file) => {
            this.cfg.imageBases[idx].path = file.path;
            pathInput.value = file.path;
            this.autoFillMarkersPathFromFirstBase();
          }).open();
        };

        // Name
        const nameInput = row.createEl("input", { type: "text" });
        nameInput.addClass("zoommap-view-editor-input", "zoommap-view-editor-input-name");
        nameInput.placeholder = "Optional display name";
        nameInput.value = b.name ?? "";
        nameInput.oninput = () => {
          this.cfg.imageBases[idx].name = nameInput.value.trim() || undefined;
        };

        // Delete
        if (this.cfg.imageBases.length > 1) {
          const delBtn = row.createEl("button", { text: "✕" });
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

    /* -------- Overlays -------- */
    contentEl.createEl("h3", { text: "Overlays" });

    const overlaysWrap = contentEl.createDiv({ cls: "zoommap-view-editor-section" });
    const renderOverlays = () => {
      overlaysWrap.empty();

      this.cfg.overlays.forEach((o, idx) => {
        const row = overlaysWrap.createDiv({ cls: "zoommap-view-editor-row" });

        const pathInput = row.createEl("input", { type: "text" });
        pathInput.addClass("zoommap-view-editor-input", "zoommap-view-editor-input-path");
        pathInput.placeholder = "Path to overlay image";
        pathInput.value = o.path ?? "";
        pathInput.oninput = () => {
          this.cfg.overlays[idx].path = pathInput.value.trim();
        };

        const pickBtn = row.createEl("button", { text: "Pick…" });
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
        nameInput.value = o.name ?? "";
        nameInput.oninput = () => {
          this.cfg.overlays[idx].name = nameInput.value.trim() || undefined;
        };

        const visLabel = row.createEl("label", { cls: "zoommap-view-editor-checkbox-label" });
        const visInput = visLabel.createEl("input", { type: "checkbox" });
        visInput.checked = !!o.visible;
        visInput.onchange = () => {
          this.cfg.overlays[idx].visible = visInput.checked;
        };
        visLabel.appendText("Visible");

        const delBtn = row.createEl("button", { text: "✕" });
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

    /* -------- Marker.json -------- */
    contentEl.createEl("h3", { text: "Marker JSON" });

    {
      const row = contentEl.createDiv({
        cls: "zoommap-view-editor-row"
      });

      this.createInlineLabel(
        row,
        "Markers",
        "Optional. If empty, <firstBase>.markers.json is used."
      );

      const input = row.createEl("input", { type: "text" });
      input.addClass(
        "zoommap-view-editor-input",
        "zoommap-view-editor-input-path"
      );
      input.placeholder = "Path to markers.json";
      input.value = this.cfg.markersPath ?? "";
      input.oninput = () => {
        this.cfg.markersPath = input.value.trim();
      };
      this.markersInputEl = input;

      const button = row.createEl("button", {
        text: "Use first base"
      });
      button.addClass("zoommap-view-editor-button");
      button.onclick = () => {
        this.autoFillMarkersPathFromFirstBase(true);
        input.value = this.cfg.markersPath ?? "";
      };
    }

    /* -------- Marker layers (Namen) -------- */
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
          const delBtn = row.createEl("button", { text: "✕" });
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

    /* -------- View & layout -------- */
    contentEl.createEl("h3", { text: "View & layout" });

    const renderGrid = this.createCompactGrid(contentEl, 2);

    {
      const field = this.createCompactField(renderGrid, "Render mode", {
        hint: "Canvas is usually smoother for large SVG maps or weaker devices.",
      });
      const input = field.createEl("select");
      input.createEl("option", { text: "DOM", value: "dom" });
      input.createEl("option", { text: "Canvas", value: "canvas" });
      input.value = this.cfg.renderMode ?? "dom";
      input.onchange = () => {
        this.cfg.renderMode = input.value === "canvas" ? "canvas" : "dom";
      };
    }

    {
      const field = this.createCompactField(renderGrid, "Interpolation", {
        hint: "Auto is smooth. Pixelated and crisp edges are useful for pixel-art maps.",
      });
      const input = field.createEl("select");
      input.createEl("option", { text: "Auto / smooth", value: "auto" });
      input.createEl("option", { text: "Pixelated", value: "pixelated" });
      input.createEl("option", { text: "Crisp edges", value: "crisp-edges" });
      input.value = this.cfg.imageRendering ?? "auto";
      input.onchange = () => {
        this.cfg.imageRendering =
          input.value === "pixelated" || input.value === "crisp-edges"
            ? input.value
            : "auto";
      };
    }

    const viewGrid = this.createCompactGrid(contentEl, 4);

    {
      const field = this.createCompactField(viewGrid, "Min zoom (%)");
      const input = field.createEl("input", { type: "number" });
      input.placeholder = "25";
      input.value = this.factorToPercentString(this.cfg.minZoom);
      input.oninput = () => {
        this.cfg.minZoom = this.percentInputToFactor(input.value, 0.25);
      };
    }

    {
      const field = this.createCompactField(viewGrid, "Max zoom (%)");
      const input = field.createEl("input", { type: "number" });
      input.placeholder = "800";
      input.value = this.factorToPercentString(this.cfg.maxZoom);
      input.oninput = () => {
        this.cfg.maxZoom = this.percentInputToFactor(input.value, 8);
      };
    }

    {
      const field = this.createCompactField(viewGrid, "Wrap", {
        hint: "Allows surrounding text to flow around a left- or right-aligned map."
      });
      const input = field.createEl("input", { type: "checkbox" });
      input.checked = !!this.cfg.wrap;
      input.onchange = () => {
        this.cfg.wrap = input.checked;
      };
    }

    {
      const field = this.createCompactField(viewGrid, "Responsive", {
        hint: "Fits the map to its available width and disables pan/zoom gestures.",
      });
      const input = field.createEl("input", { type: "checkbox" });
      input.checked = !!this.cfg.responsive;
      input.onchange = () => {
        this.cfg.responsive = input.checked;
      };
    }

    const layoutGrid = this.createCompactGrid(contentEl, 5);
    const savedSizeHint =
      "Enable this to write a fixed value to YAML. If width and height are disabled, manual resizing is saved in markers.json.";

    {
      const field = this.createCompactField(layoutGrid, "Width", {
        hint: savedSizeHint,
      });
      const row = field.createDiv({ cls: "zoommap-view-editor-compact-inline" });
      const enabled = row.createEl("input", { type: "checkbox" });
      enabled.checked = !!this.cfg.useWidth;
      enabled.title = "Store width in YAML";
      const input = row.createEl("input", { type: "text" });
      input.placeholder = "100%";
      input.value = this.cfg.width ?? "";
      enabled.onchange = () => {
        this.cfg.useWidth = enabled.checked;
      };
      input.oninput = () => {
        this.cfg.width = input.value.trim();
      };
    }

    {
      const field = this.createCompactField(layoutGrid, "Height", {
        hint: savedSizeHint,
      });
      const row = field.createDiv({ cls: "zoommap-view-editor-compact-inline" });
      const enabled = row.createEl("input", { type: "checkbox" });
      enabled.checked = !!this.cfg.useHeight;
      enabled.title = "Store height in YAML";
      const input = row.createEl("input", { type: "text" });
      input.placeholder = "480px";
      input.value = this.cfg.height ?? "";
      enabled.onchange = () => {
        this.cfg.useHeight = enabled.checked;
      };
      input.oninput = () => {
        this.cfg.height = input.value.trim();
      };
    }

    let resizeHandleInput: HTMLSelectElement | null = null;
    {
      const field = this.createCompactField(layoutGrid, "Resizable");
      const input = field.createEl("input", { type: "checkbox" });
      input.checked = !!this.cfg.resizable;
      input.onchange = () => {
        this.cfg.resizable = input.checked;
        if (resizeHandleInput) resizeHandleInput.disabled = !input.checked;
      };
    }

    {
      const field = this.createCompactField(layoutGrid, "Resize handle");
      const input = field.createEl("select");
      input.createEl("option", { text: "Native", value: "native" });
      input.createEl("option", { text: "Left", value: "left" });
      input.createEl("option", { text: "Right", value: "right" });
      input.createEl("option", { text: "Both", value: "both" });
      input.value = this.cfg.resizeHandle ?? "native";
      input.disabled = !this.cfg.resizable;
      input.onchange = () => {
        this.cfg.resizeHandle = input.value as ResizeHandle;
      };
      resizeHandleInput = input;
    }

    {
      const field = this.createCompactField(layoutGrid, "Align");
      const input = field.createEl("select");
      input.createEl("option", { text: "None", value: "" });
      input.createEl("option", { text: "Left", value: "left" });
      input.createEl("option", { text: "Center", value: "center" });
      input.createEl("option", { text: "Right", value: "right" });
      input.value = this.cfg.align ?? "";
      input.onchange = () => {
        this.cfg.align = (input.value || undefined) as AlignMode | undefined;
      };
    }
	  
	// ID
    {
      const row = contentEl.createDiv({
        cls: "zoommap-view-editor-row"
      });

      this.createInlineLabel(
        row,
        "ID",
        "Optional stable identifier when markers are stored inline in the note."
      );

      const input = row.createEl("input", { type: "text" });
      input.addClass("zoommap-view-editor-input");
      input.placeholder = "map-world-1";
      input.value = this.cfg.id ?? "";
      input.oninput = () => {
        const value = input.value.trim();
        this.cfg.id = value.length > 0 ? value : undefined;
      };
    }
	  
    /* -------- Viewport frame -------- */
    contentEl.createEl("h3", { text: "Viewport frame" });

    let frameInputEl: HTMLInputElement | null = null;
    const insets = this.cfg.viewportFrameInsets!;
	
    const frameSetting = new Setting(contentEl)
      .setClass("zoommap-view-editor-row")
      .setName("Frame image");

    frameSetting.nameEl.setAttr("title", "Optional. Drawn above the map and supports overhang.");
    frameSetting.nameEl.addClass("zoommap-view-editor-inline-label--hint");

    frameSetting.addText((t) => {
      t.setPlaceholder("Path to frame image.");
      t.setValue(this.cfg.viewportFrame ?? "");
      frameInputEl = t.inputEl;
      t.onChange((v) => {
        const s = v.trim();
        this.cfg.viewportFrame = s.length ? s : undefined;
      });
    });

    frameSetting.addButton((b) =>
      b.setButtonText("Pick…").onClick(() => {
        new ImageFileSuggestModal(this.app, (file) => {
          this.cfg.viewportFrame = file.path;
          if (frameInputEl) frameInputEl.value = file.path;
        }).open();
      }),
    );

    frameSetting.addButton((b) =>
      b.setButtonText("Clear").onClick(() => {
        this.cfg.viewportFrame = undefined;
        if (frameInputEl) frameInputEl.value = "";
      }),
    );
	
    frameSetting.addButton((b) =>
      b.setButtonText("Update viewport").onClick(() => {
        if (!this.onPreview) {
          new Notice("No active map preview available.", 2000);
          return;
        }
        this.onPreview(JSON.parse(JSON.stringify(this.cfg)) as ViewEditorConfig);
        new Notice("Viewport updated (preview).", 1200);
      }),
    );

    const frameGrid = this.createCompactGrid(contentEl, 5);

    {
      const field = this.createCompactField(frameGrid, "Insets unit", {
        hint: "Framepx uses the original pixel space of the frame image. Percent uses the outer map size.",
      });
      const input = field.createEl("select");
      input.createEl("option", { text: "Frame px", value: "framePx" });
      input.createEl("option", { text: "Percent", value: "percent" });
      input.value = insets.unit;
      input.onchange = () => {
        insets.unit = input.value === "percent" ? "percent" : "framePx";
      };
    }

    const addInsetField = (
      label: string,
      key: "top" | "right" | "bottom" | "left",
    ) => {
      const field = this.createCompactField(frameGrid, label);
      const input = field.createEl("input", { type: "number" });
      input.min = "0";
      input.placeholder = "0";
      input.value = String(insets[key] ?? 0);
      input.oninput = () => {
        const n = Number(input.value.replace(",", "."));
        if (Number.isFinite(n) && n >= 0) {
          insets[key] = Math.round(n);
        }
      };
    };

    addInsetField("Top", "top");
    addInsetField("Right", "right");
    addInsetField("Bottom", "bottom");
    addInsetField("Left", "left");

    /* -------- Footer -------- */
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const saveBtn = footer.createEl("button", { text: "Save" });
    const cancelBtn = footer.createEl("button", { text: "Cancel" });

    saveBtn.onclick = () => {
      const first = this.cfg.imageBases[0]?.path?.trim();
      if (!first) {
        new Notice("Please select at least one base image.", 2500);
        return;
      }

      this.normalizeZoomRange();
      this.autoFillMarkersPathFromFirstBase();

      // Normalize viewport frame values
      const frame = (this.cfg.viewportFrame ?? "").trim();
      this.cfg.viewportFrame = frame.length ? frame : undefined;
      if (!this.cfg.viewportFrame) {
        this.cfg.viewportFrameInsets = undefined;
      }

	  this.close();
	  this.onResult({ action: "save", config: this.cfg });
	};

    cancelBtn.onclick = () => {
      this.close();
      this.onResult({ action: "cancel" });
    };
  }

  onClose(): void {
    this.contentEl.empty();
	this.markersInputEl = null;
  }

  private normalizeZoomRange(): void {
    let { minZoom, maxZoom } = this.cfg;
    if (!Number.isFinite(minZoom) || minZoom <= 0) minZoom = 0.25;
    if (!Number.isFinite(maxZoom) || maxZoom <= 0) maxZoom = 8;
    if (minZoom > maxZoom) [minZoom, maxZoom] = [maxZoom, minZoom];
    this.cfg.minZoom = minZoom;
    this.cfg.maxZoom = maxZoom;
  }

  private autoFillMarkersPathFromFirstBase(force = false): void {
    const first = this.cfg.imageBases[0]?.path?.trim();
    if (!first) return;
    if (!force && this.cfg.markersPath && this.cfg.markersPath.trim().length > 0) {
      return;
    }
    const dot = first.lastIndexOf(".");
    const base = dot >= 0 ? first.slice(0, dot) : first;
    this.cfg.markersPath = `${base}.markers.json`;
  }
}