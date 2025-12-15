import { Modal, Setting, Notice, setIcon } from "obsidian";
import type { App } from "obsidian";
import { ImageFileSuggestModal } from "./iconFileSuggest";

export type RenderMode = "dom" | "canvas";
export type ResizeHandle = "left" | "right" | "both" | "native";
export type AlignMode = "left" | "center" | "right";

export interface ViewEditorConfig {
  imageBases: { path: string; name?: string }[];
  overlays: { path: string; name?: string; visible?: boolean }[];
  markersPath: string;
  renderMode: RenderMode;
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
}

export interface ViewEditorResult {
  action: "save" | "cancel";
  config?: ViewEditorConfig;
}

type ViewEditorCallback = (result: ViewEditorResult) => void;

export class ViewEditorModal extends Modal {
  private cfg: ViewEditorConfig;
  private onResult: ViewEditorCallback;

  constructor(app: App, initial: ViewEditorConfig, onResult: ViewEditorCallback) {
    super(app);
    this.cfg = JSON.parse(JSON.stringify(initial)) as ViewEditorConfig;
    this.onResult = onResult;

    if (!this.cfg.imageBases || this.cfg.imageBases.length === 0) {
      this.cfg.imageBases = [{ path: "", name: "" }];
    }
    this.cfg.overlays ??= [];
    this.cfg.markerLayers ??= ["Default"];
    this.cfg.width ||= "100%";
    this.cfg.height ||= "480px";
    this.cfg.renderMode ||= "dom";
    this.cfg.resizeHandle ||= "right";
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

    new Setting(contentEl)
      .setClass("zoommap-view-editor-row")
      .setName("Markers")
      .setDesc("Optional. If empty, <firstBase>.markers.json is used.")
      .addText((t) => {
        t.setPlaceholder("Path to markers.json");
        t.setValue(this.cfg.markersPath ?? "");
        t.onChange((v) => {
          this.cfg.markersPath = v.trim();
        });
      })
      .addButton((b) =>
        b
          .setButtonText("Use first base")
          .onClick(() => {
            this.autoFillMarkersPathFromFirstBase(true);
          }),
      );

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

    // Render
    new Setting(contentEl)
      .setClass("zoommap-view-editor-row")
      .setName("Render mode")
      .addDropdown((d) => {
        d.addOption("dom", "DOM");
        d.addOption("canvas", "Canvas");
        d.setValue(this.cfg.renderMode ?? "dom");
        d.onChange((v) => {
          this.cfg.renderMode = v as RenderMode;
        });
      });

    // Zoom
    new Setting(contentEl)
	  .setClass("zoommap-view-editor-row")
	  .setName("Min zoom (%)")
	  .addText((t) => {
		t.setPlaceholder("25");
		t.setValue(this.factorToPercentString(this.cfg.minZoom));
		t.inputEl.classList.add("zoommap-view-editor-input--short");
		t.onChange((v) => {
		  this.cfg.minZoom = this.percentInputToFactor(v, 0.25);
		});
	  });

	new Setting(contentEl)
	  .setClass("zoommap-view-editor-row")
	  .setName("Max zoom (%)")
	  .addText((t) => {
		t.setPlaceholder("200");
		t.setValue(this.factorToPercentString(this.cfg.maxZoom));
		t.inputEl.classList.add("zoommap-view-editor-input--short");
		t.onChange((v) => {
		  this.cfg.maxZoom = this.percentInputToFactor(v, 8);
		});
	  });

    // Wrap
    new Setting(contentEl)
      .setClass("zoommap-view-editor-row")
      .setName("Wrap")
      .addDropdown((d) => {
        d.addOption("false", "False");
        d.addOption("true", "True");
        d.setValue(this.cfg.wrap ? "true" : "false");
        d.onChange((v) => {
          this.cfg.wrap = v === "true";
        });
      });

    // Responsive
    new Setting(contentEl)
      .setClass("zoommap-view-editor-row")
      .setName("Responsive")
      .addDropdown((d) => {
        d.addOption("false", "False");
        d.addOption("true", "True");
        d.setValue(this.cfg.responsive ? "true" : "false");
        d.onChange((v) => {
          this.cfg.responsive = v === "true";
        });
      });

	 // Width
	const widthSetting = new Setting(contentEl)
	  .setClass("zoommap-view-editor-row")
	  .setName("Width");

	widthSetting.addToggle((tg) => {
	  tg.setValue(this.cfg.useWidth).onChange((on) => {
		this.cfg.useWidth = on;
	  });
	});

	widthSetting.addText((t) => {
	  t.setPlaceholder("100% or 640px");
	  t.setValue(this.cfg.width ?? "");
	  t.inputEl.classList.add("zoommap-view-editor-input--short");
	  t.onChange((v) => {
		this.cfg.width = v.trim();
	  });
	});

	// Info-Icon
	{
	  const hint = widthSetting.controlEl.createDiv({ cls: "zoommap-info-icon" });
	  setIcon(hint, "info");
	  hint.setAttr(
		"title",
		"Check to store width in YAML. Leave unchecked to let the map remember its size in markers.json only.",
	  );
	}

	// Height
	const heightSetting = new Setting(contentEl)
	  .setClass("zoommap-view-editor-row")
	  .setName("Height");

	heightSetting.addToggle((tg) => {
	  tg.setValue(this.cfg.useHeight).onChange((on) => {
		this.cfg.useHeight = on;
	  });
	});

	heightSetting.addText((t) => {
	  t.setPlaceholder("480px");
	  t.setValue(this.cfg.height ?? "");
	  t.inputEl.classList.add("zoommap-view-editor-input--short");
	  t.onChange((v) => {
		this.cfg.height = v.trim();
	  });
	});

	// Info-Icon
	{
	  const hint = heightSetting.controlEl.createDiv({ cls: "zoommap-info-icon" });
	  setIcon(hint, "info");
	  hint.setAttr(
		"title",
		"Check to store height in YAML. Leave unchecked to let the map remember its height in markers.json only.",
	  );
	}

    // Resizable + handle
    let handleSetting: Setting | null = null;

	new Setting(contentEl)
	  .setClass("zoommap-view-editor-row")
	  .setName("Resizable")
	  .addToggle((tg) => {
		tg.setValue(!!this.cfg.resizable).onChange((on) => {
		  this.cfg.resizable = on;
		  handleSetting?.settingEl.toggle(on);
		});
	  });

	handleSetting = new Setting(contentEl)
	  .setClass("zoommap-view-editor-row")
	  .setName("Resize handle")
	  .addDropdown((d) => {
		d.addOption("native", "Native");
		d.addOption("left", "Left");
		d.addOption("right", "Right");
		d.addOption("both", "Both");
		d.setValue(this.cfg.resizeHandle ?? "native");
		d.onChange((v) => {
		  this.cfg.resizeHandle = v as "left" | "right" | "both" | "native";
		});
	  });

	handleSetting.settingEl.toggle(!!this.cfg.resizable);

    // Align
    new Setting(contentEl)
      .setClass("zoommap-view-editor-row")
      .setName("Align")
      .addDropdown((d) => {
        d.addOption("", "(none)");
        d.addOption("left", "Left");
        d.addOption("center", "Center");
        d.addOption("right", "Right");
        d.setValue(this.cfg.align ?? "");
        d.onChange((v) => {
          this.cfg.align = (v || undefined) as AlignMode | undefined;
        });
      });
	  
	  // ID
	new Setting(contentEl)
	  .setClass("zoommap-view-editor-row")
	  .setName("ID (optional)")
	  .setDesc("Stable identifier if you store markers inline in the note.")
	  .addText((t) => {
		t.setPlaceholder("Map-world-1");
		t.setValue(this.cfg.id ?? "");
		t.onChange((v) => {
		  const val = v.trim();
		  this.cfg.id = val.length ? val : undefined;
		});
	  });

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