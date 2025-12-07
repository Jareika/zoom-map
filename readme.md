# Zoom Map
A lightweight Obsidian plugin to place interactive markers on a zoomable, pannable image. Supports multiple base images and toggleable PNG overlays, marker layers, hover previews, a ruler (measure distances), HUD pins, and an optional Canvas render mode for smoother performance on mobile.

## Features

- **Pan and zoom**
  - Mouse: wheel, double‑click, drag to pan
  - Mobile: pinch‑zoom, two‑finger pan
  - Panning clamped to image bounds

- **Markers & stickers**
  - Add markers (Shift+Click or via context menu), drag to move, edit/delete via modal
  - Marker layers with visibility toggles and lock
  - Bind layers to specific base images (auto‑show/hide when switching base)
  - Stickers: image markers that scale with the map (decals)

- **HUD pins (viewport‑bound)**
  - “Add HUD pin here” from the context menu
  - Pins stick to viewport edges/center (left/right/center, top/bottom/center)
  - Stable behavior when resizing the map; manual drags re‑classify the pin’s mode

- **Icons & sizes**
  - Marker icons configurable in plugin settings (key, file/data URL, size, anchor X/Y)
  - Per‑map pin sizes: context menu “Pin sizes for this map…” to override icon sizes per map

- **Hover previews**
  - Marker with link → uses Obsidian’s hover popover
  - Marker without link → inline tooltip rendered inside the map

- **Image bases & overlays**
  - Multiple base images and PNG/WebP/SVG/JPG overlays
  - Overlays load on demand and unload when hidden

- **Ruler & scale**
  - Measure multi‑segment distances with live HUD readout
  - Units: auto metric/imperial, m/km/mi/ft, plus custom (fantasy) units
  - Per‑base calibration via context menu (Measure → Calibrate scale…)

- **Per‑marker extras (pins)**
  - Min/Max zoom visibility (now in percent: 100, 150, 300…)
  - “Scale like sticker” option (pins scale with the map instead of staying screen‑constant)

- **Layout & rendering**
  - Per‑block size and resize handles; multiple maps per note supported
  - Responsive mode (width 100%, height from aspect‑ratio) for non‑interactive display blocks
  - Optional Canvas render mode for smoother performance on mobile/large images
  - Persistent window size (when resizable) saved to JSON and restored automatically

- **Storage**
  - JSON marker files beside the image (`<image>.markers.json`)
  - Optional inline storage in the note (hidden comment block)
  - Files only rewritten when content actually changes

## Quick start

### 1) Install (manual)

- Create folder: `<your-vault>/.obsidian/plugins/zoom-map`
- Copy build output into that folder: `manifest.json`, `main.js`, `styles.css`
- Reload Obsidian → Settings → Community plugins → enable **Zoom Map**

[Watch the demo video](https://youtu.be/MkuvFwk1obs)

### 2) Add a code block to a note

~~~
```zoommap
image: Assets/Map.jpg
# markers is optional; defaults to <image>.markers.json
# markers: Assets/Map.jpg.markers.json

# Map view limits
minZoom: 0.3
maxZoom: 8

# Size & interactivity
height: 560px
width: 100%
resizable: true
resizeHandle: native     # left | right | both | native
render: canvas           # or: dom

# Responsive display (fit into width, no wheel/pinch/dblclick pan/zoom)
responsive: false        # true → always fit; disables pan/zoom gestures

# Storage (optional)
# storage: note          # default is json; use "note" to store markers inline
# id: map-1              # optional stable id for inline storage (per code block)

# Alignment / wrapping (optional)
align: right             # left | center | right
wrap: true               # wrap text; useful with left/right alignment
```
~~~

### 3) Interact

- **Add markers**
  - Shift+Click on the map, or use the context menu → “Add marker here”
  - Drag markers to move; right‑click markers to edit/delete
- **HUD pins**
  - Right‑click map → “Add HUD pin here” to add a viewport‑bound pin
- **Context menu (right‑click empty map)**
  - Add marker / HUD pin / stickers / favorites
  - Zoom in/out, fit, reset view
  - Image layers (bases/overlays)
  - Marker layers (visibility/lock, bind layer to base)
  - Measure (start/stop, clear, unit, calibrate scale)
  - Pin sizes for this map…
- **Hover a marker**
  - With `link` → Obsidian hover preview
  - Without link → inline tooltip

## YAML options (per code block)

- `image`: string (required if `imageBases` is empty)
- `markers`: string (optional; default is `<image>.markers.json`)
- `minZoom` / `maxZoom`:
  - Map‑level zoom limits
  - Accept raw factors (e.g. `0.25`, `4`) or strings with `%` (e.g. `"150%"`)
- `width` / `height`: CSS size (e.g., `560px`, `60vh`, `100%`)
- `resizable`: boolean (when true, window size is persisted to JSON)
- `resizeHandle`: `left | right | both | native`
- `render`: `dom | canvas`
- `responsive`: `true | false`  
  `true` = map always fits width, zoom/pan gestures disabled; markers remain interactive
- `storage`: `json | note`
  - `json`: beside image (default)
  - `note`: inline hidden block inside the note
- `id`: optional map id (useful with `storage: note`)
- `align`: `left | center | right`
- `wrap`: `true | false` (text wraps around the map when left/right aligned)

### Image bases & overlays (optional)

~~~
```yaml
imageBases:
  - { path: Assets/BaseA.png, name: "A" }
  - { path: Assets/BaseB.png, name: "B" }

imageOverlays:
  - { path: Assets/roads.png,  name: "Roads",  visible: false }
  - { path: Assets/labels.png, name: "Labels", visible: true }
```
~~~

### Scale (optional)

You can also calibrate via the context menu: **Measure → Calibrate scale…**
~~~
```yaml
image: Assets/Map.jpg
scale:
  metersPerPixel: 0.25     # or use pixelsPerMeter: 4
```
~~~

## Marker storage

- **JSON (default)**  
  Plain JSON file next to the image: `<image>.markers.json`
- **Inline (optional)**  
  Set `storage: note` in YAML to store data inside the note as a hidden comment block:

  ```text
  %%
  ZOOMMAP-DATA id=map-123
  { ... JSON ... }
  /ZOOMMAP-DATA
  %%
  ```

- Marker files are only rewritten when the serialized content actually changes.

## Marker editing (modal)

- **Link**
  - Enter a wiki‑link path without brackets (e.g. `Folder/Note` or `Note#Heading`)
  - Do not include `[[…]]` – the plugin expects the plain linktext
  - Suggestions popup with notes and headings is available while typing
- **Tooltip**: optional plain text rendered as an inline tooltip
- **Icon**: choose one of your configured icons
- **Layer**: choose existing layer or type a new layer name
- **Zoom range (optional, pins only)**
  - `Min zoom` / `Max zoom` in percent (e.g. `100`, `150`, `300`)
  - Leave empty to show the pin at all zoom levels
  - Values are normalized and clamped to the map’s zoom range
- **Scale like sticker (pins only)**
  - When enabled, the pin scales with the map (like stickers)
  - When disabled (default), pins keep a constant screen size (inverse scaling wrapper)

## Stickers

- Image markers that always scale with the map (size = pixels at image scale, e.g. `64`).
- Can be defined via Collections (see below) and placed from the context menu:
  - “Add marker here → Stickers (base/global)”

## Collections (base‑bound menus)

- Settings → **Collections (base‑bound)** lets you define which items appear in the context menu, depending on the active base image:
  - **Pins**: by icon key from your icon library
  - **Favorites**: presets with name, optional layer, link template, and “open editor” flag
  - **Stickers**: image path + size + optional layer
- Bindings:
  - Add base image paths to bind a collection to specific bases
  - Create a **global** collection (no bindings) for items that should be available everywhere
- Collections populate the context menu under:
  - `Pins (base/global)`
  - `Favorites (base/global)`
  - `Stickers (base/global)`

## Settings (plugin)

- **Storage default**
  - Where new maps store their markers: JSON file beside image or inline in the note
- **Marker icons (library)**
  - Key, path or data URL, size, anchor X/Y
  - Anchor X/Y are in icon pixels; defines the point that “sticks” to the map  
    - For “grow around center”: use X≈size/2, Y≈size/2  
    - For “pin tip on coordinate”: use tip position (e.g. size 24 → X=12, Y=24)
- **Pin sizes for this map…**
  - Per‑map overrides for icon sizes, available from the map’s context menu
- **Wheel zoom factor**
- **Panning button**: left or middle
- **Hover popover size** (max width/height)
- **Force popovers without Ctrl/Cmd**
- **Ruler style**
  - Line color (CSS color) and width (px)
- **Custom units**
  - Define fantasy/custom distance units (`name`, `abbreviation`, `metersPerUnit`)
  - Select them via context menu → Measure → Unit
- **Collections (base‑bound)**
  - Configure pins/favorites/stickers per base image
- **Library file (icons + collections)**
  - Choose a JSON file in your vault to export/import your icon library + collections
- **Font awesome integration**
  - Configure a Font Awesome SVG folder in your vault
  - Download the free web ZIP directly into that folder
  - Pick SVGs via a grid‑based icon picker, then create recolored icons from them

## Image layers from the menu

- Right‑click empty map → **Image layers**:
  - Switch bases and overlays
  - “Add layer → Base/Overlay…” to pick additional files
- Marker layers can be bound to a base and will auto‑toggle when switching base.

## Canvas vs DOM

- **DOM mode** (default): HTML `<img>` + absolutely positioned markers
- **Canvas mode**:
  - Base + visible overlays are composited per frame
  - Often reduces flicker and improves performance on mobile / large images
  - Overlays are loaded/unloaded dynamically to limit memory usage

## Responsive mode

- `responsive: true` makes the map fill the available width; height is derived from the image aspect ratio.
- Zoom/pan gestures (wheel, double‑click, pinch, drag‑to‑pan) are disabled.
- Markers remain interactive (hover, click, add/edit via context menu).

## Persistent window size

- When `resizable: true` and **not** in responsive mode:
  - The current map window size is saved to JSON as `frame: { w, h }`
  - On next load, this size is restored (unless explicit `width`/`height` are set in YAML)

## Tips

- Keep base + overlay images at identical dimensions.
- Use optimized PNG/WebP for large layers.
- If flicker appears on mobile, try `render: canvas`.
- For classic pin behavior (tip sits on the coordinate), set the anchor to the visual tip.
- For “grow around center”, anchor at the visual center of the icon.

## Build (for developers)

- Requirements: Node 18+ recommended
- Install deps: `npm install`
- Dev build (watch): `npm run dev`
- Production build: `npm run build`
- Copy `manifest.json`, `main.js`, `styles.css` into your vault’s  
  `.obsidian/plugins/zoom-map` folder

## License

MIT. Not affiliated with or endorsed by Obsidian.