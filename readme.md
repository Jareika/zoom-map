Zoom Map
A lightweight Obsidian plugin to place interactive markers on a zoomable, pannable image. Supports multiple base images and toggleable PNG overlays, marker layers, hover previews, a ruler (measure distances), and an optional Canvas render mode for smoother performance on mobile.

Features
Pan and zoom (wheel, double‑click, drag; pinch‑zoom/two‑finger pan on mobile)
Clamped panning (can’t drag past image bounds)
Add markers (Shift+Click or via context menu), drag to move, edit/delete via modal
Marker layers with visibility toggles
Marker icons configurable in plugin settings (size, anchor X/Y, file or data URL)
Hover previews:
If marker has a link, shows Obsidian’s hover popover
Otherwise shows an inline tooltip
Image bases and overlays (PNG/WebP/SVG/JPG) with on‑demand loading
Ruler: measure multi‑segment distances; selectable units and per‑image scale calibration
Per‑block size and resize handles; multiple maps per note supported
Quick start
Install (manual)
Create folder: <your-vault>/.obsidian/plugins/zoom-map
Copy these files from the build into that folder: manifest.json, main.js, styles.css
Reload Obsidian → Settings → Community plugins → enable “Zoom Map”

[Watch the demo video](https://youtu.be/MkuvFwk1obs)


2. Add a code block to a note

~~~zoommap
image: Assets/Map.jpg
# markers is optional; defaults to <image>.markers.json
# markers: Assets/Map.jpg.markers.json
minZoom: 0.3
maxZoom: 8
height: 560px
width: 100%
resizable: true
align: right       # left | center | right
wrap: true        # only left/right useful -> Text flows
resizeHandle: native  # left | right | both | native (right)
render: canvas   # or: dom
~~~

3) Interact
- Shift+Click to add a marker
- Drag markers to move; right‑click markers to edit/delete
- Right‑click empty map for the menu (add marker, zoom, fit, layers, measure, scale, reload YAML)
- Hover a marker:
  - With “link” → Obsidian preview popover
  - Without link → inline tooltip

## YAML options (per code block)
- image: string (required if imageBases is empty)
- markers: string (optional; default is <image>.markers.json)
- minZoom/maxZoom: number
- width/height: CSS size (e.g., 560px, 60vh, 100%)
- resizable: boolean
- resizeHandle: left | right | both | native
- render: dom | canvas

Layers (optional):
imageBases:
  - { path: Assets/BaseA.png, name: "A" }
  - { path: Assets/BaseB.png, name: "B" }
imageOverlays:
  - { path: Assets/roads.png,  name: "Roads",  visible: false }
  - { path: Assets/labels.png, name: "Labels", visible: true }
render: canvas

Scale (optional): # You can also calibrate via the context menu: Measure → Calibrate scale…
image: Assets/Map.jpg
scale:
  metersPerPixel: 0.25    # or use pixelsPerMeter: 4

## Marker storage
- Markers are saved in a plain JSON file next to the image by default: <image>.markers.json
- The file stores layers, markers, optional bases/overlays, and measurement settings
- Files are only rewritten when content actually changes

## Controls
- Wheel: zoom in/out
- Drag (left or middle button; configurable): pan
- Double‑click: zoom in
- Shift+Click: add marker
- Mobile: pinch‑zoom, two‑finger pan
- Right‑click: context menu

## Settings (plugin)
- Marker icons: name/key, path or data URL, size, anchor X/Y
- Default icon
- Wheel zoom factor
- Pan button: left or middle
- Hover popover size
- “Force popovers without Ctrl/Cmd” (useful on tablets)
- Favorites (presets): quick‑place configured markers from the menu

## Canvas vs DOM
- DOM mode (default): simple, great on desktop
- Canvas mode: base + overlays are composited into one canvas per frame (reduced flicker on mobile/large images)
- Overlays load on demand and are released when hidden to reduce memory usage on tablets

## Tips
- Keep base/overlay dimensions identical
- Prefer WebP/optimized PNG for large layers
- If flicker appears on mobile, try render: canvas

## Build (for developers)
- Requirements: Node 18+ recommended
- Install: npm install
- Dev build: npm run dev
- Production build: npm run build
- Copy manifest.json, main.js, styles.css into your vault’s plugins/zoom-map folder

## License
MIT. Not affiliated with or endorsed by Obsidian.