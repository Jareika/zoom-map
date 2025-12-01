# Zoom Map
A lightweight Obsidian plugin to place interactive markers on a zoomable, pannable image. Supports multiple base images and toggleable PNG overlays, marker layers, hover previews, a ruler (measure distances), and an optional Canvas render mode for smoother performance on mobile.

## Features
- Pan and zoom: wheel, double‑click, drag; pinch‑zoom/two‑finger pan on mobile
- Clamped panning (can’t drag past image bounds)
- Add markers (Shift+Click or via context menu), drag to move, edit/delete via modal
- Marker layers with visibility toggles; layer lock; bind layers to specific base images
- Marker icons configurable in plugin settings (size, anchor X/Y, file or data URL)
- Hover previews:
  - If a marker has a link, it shows Obsidian’s hover popover
  - Otherwise an inline tooltip is rendered inside the map
- Image bases and overlays (PNG/WebP/SVG/JPG); overlays load on demand and unload when hidden
- Ruler: measure multi‑segment distances; selectable units; per‑image scale calibration
- Stickers: image markers that scale with the map (like decals)
- Per‑pin extras:
  - Min/Max zoom visibility (show a pin only within a zoom range)
  - “Scale like sticker” option (pins scale with the map instead of staying screen‑constant)
- Per‑block size and resize handles; multiple maps per note supported
- Responsive mode (width 100%, height from aspect‑ratio) for non‑interactive display blocks
- Optional Canvas render mode for smoother performance on mobile/large images
- Persistent window size (when resizable) saved to JSON and restored automatically

## Quick start

### 1) Install (manual)
- Create folder: `<your-vault>/.obsidian/plugins/zoom-map`
- Copy these files from the build into that folder: `manifest.json`, `main.js`, `styles.css`
- Reload Obsidian → Settings → Community plugins → enable “Zoom Map”

[Watch the demo video](https://youtu.be/MkuvFwk1obs)

### 2) Add a code block to a note

~~~
```zoommap
image: Assets/Map.jpg
# markers is optional; defaults to <image>.markers.json
# markers: Assets/Map.jpg.markers.json
minZoom: 0.3
maxZoom: 8
height: 560px
width: 100%
resizable: true
responsive: false # true set's the window to max
align: right       # left | center | right
wrap: true        # only left/right useful -> Text flows
resizeHandle: native  # left | right | both | native (right)
render: canvas   # or: dom```
~~~

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
resizeHandle: native     # left | right | both | native (right)
render: canvas           # or: dom

# Responsive display (fit into width, no wheel/pinch/dblclick pan/zoom)
responsive: false        # true → always fit; disables pan/zoom gestures

# Storage (optional)
# storage: note          # default is json; use "note" to store markers inline in the note
# id: map-1              # optional stable id for inline storage (per code block)

# Alignment / wrapping (optional)
align: right             # left | center | right
wrap: true               # wrap text; useful with left/right alignment

### 3) Interact
- Shift+Click to add a marker
- Drag markers to move; right‑click markers to edit/delete
- Right‑click empty map for the menu (add marker, zoom, fit, image layers, marker layers, measure, scale/calibration, add base/overlay)
- Hover a marker:
  - With “link” → Obsidian preview popover
  - Without link → inline tooltip

## YAML options (per code block)
- image: string (required if imageBases is empty)
- markers: string (optional; default is `<image>.markers.json`)
- minZoom / maxZoom: number (map‑level zoom limits)
- width / height: CSS size (e.g., `560px`, `60vh`, `100%`)
- resizable: boolean (when true, window size is persisted to JSON)
- resizeHandle: `left | right | both | native`
- render: `dom | canvas`
- responsive: `true | false` (true = map always fits, zoom/pan gestures disabled; markers still interactive)
- storage: `json | note` (json beside image; note = inline hidden block)
- id: optional map id (useful with `storage: note`)
- align: `left | center | right`, wrap: `true | false`

### Layers (optional)
```yaml
imageBases:
  - { path: Assets/BaseA.png, name: "A" }
  - { path: Assets/BaseB.png, name: "B" }
imageOverlays:
  - { path: Assets/roads.png,  name: "Roads",  visible: false }
  - { path: Assets/labels.png, name: "Labels", visible: true }
```

### Scale (optional)
You can also calibrate via the context menu: Measure → Calibrate scale…
```yaml
image: Assets/Map.jpg
scale:
  metersPerPixel: 0.25     # or use pixelsPerMeter: 4
```

## Marker storage
- Default: plain JSON next to the image: `<image>.markers.json`
- Inline (optional): set `storage: note` in YAML to store data inside the note as a hidden comment block:
  ```
  %%
  ZOOMMAP-DATA id=map-123
  { ... JSON ... }
  /ZOOMMAP-DATA
  %%
  ```
- Files are only rewritten when content actually changes.

## Marker editing (modal)
- Link: enter a wiki link path without brackets (e.g., `Folder/Note`), or use “Pick…” to fill it
  - Do not include `[[…]]` – the plugin expects the plain linktext
- Tooltip: optional plain text rendered as an inline tooltip
- Icon: choose one of your configured icons
- Layer: choose existing layer or type a new layer name
- Zoom range (optional, pins only): `Min zoom` and `Max zoom`
  - Leave empty to show the pin at all zoom levels (no entry written to JSON)
- Scale like sticker (pins only): when enabled, the pin scales with the map (like stickers)
  - When disabled (default), pins keep a constant screen size (inverse scale wrapper)

## Stickers
- Stickers are image markers that always scale with the map (size in pixels at image scale, e.g., 64 px).
- Configure and place stickers via Collections (see below) and the context menu “Add marker here → Stickers”.

## Collections (base‑bound menus)
- Settings → Collections let you define which items appear in the context menu depending on the active base image:
  - Pins (by icon key from your icon library)
  - Favorites (presets with optional layer name, link template, open‑editor toggle)
  - Stickers (image + size)
- Create a “Global” collection (no bindings) for items available on all bases.
- Collections populate the context menu under “Pins (Base/Global)”, “Favorites (Base/Global)”, and “Stickers (Base/Global)”.

## Settings (plugin)
- Marker icons (library): key, path or data URL, size, anchor X/Y
  - Anchor X/Y are in icon pixels (of the configured size). X/Y define the point that “sticks” to the map.
  - If the anchor is half the size the pin scales in it's center when zooming. Example: Size 24 and Anchor 12/12, or Size 48 and Anchor 24/24.
- Default icon
- Wheel zoom factor
- Pan button: left or middle
- Hover popover size (width/height)
- “Force popovers without Ctrl/Cmd” (useful on tablets)
- Ruler style: color and line width
- Collections (base‑bound): configure pins/favorites/stickers per base
- Library file (icons + collections): choose a JSON file in your vault to save/load your library

## Image layers from the menu
- Right‑click empty map → Image layers → Add layer → Base/Overlay… to pick a file.
- Marker layers can be bound to a base (turn off/on automatically when switching base).

## Canvas vs DOM
- DOM mode (default): simple, great on desktop
- Canvas mode: base + visible overlays are composited per frame (reduced flicker on mobile/large images)
- Overlays load on demand and are released when hidden to reduce memory usage on tablets

## Responsive mode
- `responsive: true` makes the map fill the width; height is derived from the image aspect ratio.
- Zoom/pan gestures (wheel, dbl‑click, pinch, drag‑to‑pan) are disabled; markers remain interactive (hover/click, add/edit).

## Persistent window size
- When `resizable: true` and not in responsive mode, the current map window size is saved to JSON and restored on next load.
- Explicit `width`/`height` in YAML override the saved size.

## Tips
- Keep base/overlay dimensions identical
- Prefer WebP/optimized PNG for large layers
- If flicker appears on mobile, try `render: canvas`
- For classic pin behavior (tip sits on the coordinate), set anchor to the tip (e.g., for size 24 → X=12, Y=24).
- For “grow around center”, use the visual center as anchor (often X≈size/2, Y≈size/2; adjust if transparent margins differ).

## Build (for developers)
- Requirements: Node 18+ recommended
- Install: `npm install`
- Dev build: `npm run dev`
- Production build: `npm run build`
- Copy `manifest.json`, `main.js`, `styles.css` into your vault’s `plugins/zoom-map` folder

## License
MIT. Not affiliated with or endorsed by Obsidian.