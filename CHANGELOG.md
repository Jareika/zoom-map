Changelog

# 2.3.0
- Maps gained a per-map zoom lock in the context menu. When enabled, wheel zoom, double-click zoom, pinch zoom and zoom HUD buttons are disabled, while mouse-wheel input is released so embedded or small maps no longer prevent scrolling through the surrounding Markdown note.
- Map context menus were moved into a dedicated menu session module. Temporary document listeners for outside clicks, right clicks and Escape are now removed immediately when a menu closes instead of accumulating for the lifetime of an open map.
- Hex grids can now optionally drive ruler measurements. Configure a distance per hex (for example, 6 mi), select the grid in the Measure menu, and clicks anywhere inside a hex snap to its center for exact hex-to-hex crawl distances. Grid-based measurements also feed travel-time calculations without requiring pixel-scale calibration.
- Measurement routes are also rendered through the centers of adjacent hexes instead of as a misleading straight-line shortcut between distant cells.
- Pins placed through collection menus (`Pins (base)` and `Pins (global)`) now respect the global “scale like sticker by default” preference.
- Always-visible marker labels now fall back to their linked note when Tooltip is empty. The fallback order is explicit tooltip text, Obsidian link alias, then the linked note filename.

# 2.2.8
- Text boxes now use a clearer click-start / click-finish workflow instead of requiring drag input, matching normal drawing behavior. Drawing-region context menus now provide direct access to the normal map context menu, so large interactive regions no longer block pin placement and other map actions.

# 2.2.6
- Player Screen output now respects a changed global second-screen folder even when a map still contains older saved output paths, preventing obsolete ZoomMap folders from being recreated in the vault root.

# 2.2.5
- Edit view was compacted with grouped label-above controls for rendering, zoom, responsive layout, sizing and viewport-frame insets. TTRPG Tools - Controls now provides active-map frame movement actions: left-click nudges the viewport inside its frame by 1 px and right-click nudges it by 5 px.

# 2.2.4
- Settings layout compatibility improved: description-below settings no longer rely on CSS display: contents, avoiding partial Obsidian 1.11.4 support warnings while retaining the responsive controls-and-description layout.

# 2.2.3
- Settings layout was refined for smaller windows and mobile: selected controls now wrap cleanly instead of squeezing descriptions into narrow columns, library and SVG-source descriptions can appear below their controls, hover popover size inputs are compact, and icon-library number fields/gaps were reduced to fit standard settings widths more reliably.

# 2.2.2
- Settings compatibility was updated for Obsidian 1.13: the existing tabbed Maps settings UI now runs through the declarative settings API, supports settings-search keywords, and refreshes through update() instead of deprecated display() calls without changing the available settings features.

# 2.2.1
- 2.2.1 Settings were reorganized into tabbed sections for faster navigation: General, Travel, Collections, SVG icons, Image icons and Preferences. Travel rules and preferences are now available directly from their dedicated settings sections instead of requiring separate navigation through the long settings page.

# 2.2.0
- 2.2.0 Drawing clicks now take precedence over marker and interactive-region links, so polygon, rectangle, circle and polyline points can be placed directly on pins or linked drawing regions without opening notes. Pins and stickers now support a persistent copy/paste clipboard: after copying, right-click offers Paste or Cancel until the clipboard is cleared.

# 2.1.17
- Support for TTRPG Tools - Controls added

# 2.1.16
- TypeScript cleanup: removed an unnecessary PingPreset type assertion from the party-pin fallback preset.

# 2.1.14
- SVG outline preview/save now reapplies the stored foreground color after rebuilding base and outline layers, with inline priority over stale SVG CSS rules, so the main icon color is preserved reliably.

# 2.1.13
- SVG outline editing now receives the current icon SVG and foreground-color snapshot explicitly, so its preview and saved result preserve a newly selected main icon color instead of restoring an older color.

# 2.1.12
- SVG icon color changes now finish before the SVG outline editor opens, preventing the outline modal from previewing and saving an outdated icon color over a freshly selected foreground color.

# 2.1.11
- SVG icon recoloring with attached bases was fixed: color detection now reads only the foreground icon instead of base/outline colors, and recoloring also updates nested SVG groups so selected colors persist correctly after restarting Obsidian.

# 2.1.10
- Obsidian review cleanup: DOM and SVG creation now uses Obsidian element helpers where applicable, unnecessary TypeScript assertions were removed, and map-package clone/cache helpers were tightened for safer typed code.

# 2.1.7
- SVG marker recoloring now correctly targets the foreground icon when an SVG base is attached, and the SVG outline editor gained a live preview for base shape, outline, offsets and shadow settings.

# 2.1.6
- Obsidian 1.13.4 development compatibility was refreshed, SVG icon color/outline updates now discard stale queued updates and immediately refresh open maps, SVG search now continues loading all matching icons while scrolling, marker-link search also matches note aliases, image interpolation modes (auto, pixelated, crisp edges) were added to Edit view, and Reset view now restores a saved default view when available.

# 2.1.3
- Review hardening pass: cross-window safe Element checks were aligned for popout compatibility, zip download switched from global document to activeDocument, and fflate zip/unzip + UTF-8 conversions now run through stricter typed wrappers to reduce automated review warnings.

# 2.1.2
- Export/import switched to a lighter zip backend to avoid review-blocking dynamic script injection signatures, popout-safe window/document handling was cleaned up, and cross-window element checks were hardened to reduce automated review warnings.

# 2.1.1
- Export/import got recursive linked-note packaging upgrades with explicit export toggles for note chains plus optional media bundling for images, videos, PDFs and audio referenced inside those notes, and imported note links/media paths are now rewritten more reliably to their new vault locations.

# 2.1.0
- Drawing region interaction got a new hover-preview toggle, so links can stay clickable without opening a popover preview, while the stable drawing hitbox preview behavior remains available when wanted.

# 2.0.9
- Hitbox for drawings to create stable popover previews.

# 2.0.8
- Drawings invisible mode for regions with tooltips or attached links.

# 2.0.7
- Import/export audit upgrades: linked notes are now collected recursively and rewritten to the new vault structure on import, summary/export preparation now shares one code path for consistent counts, viewport-frame import remapping became clearer, JSON vault writes were aligned with the normal vault APIs, and import now plans paths first with rollback cleanup to avoid half-finished package imports.

# 2.0.6
- Build and lint stability improved: safer map package parsing/export helpers were tightened, marker rendering fixes resolved per-marker size/shadow integration issues, and mobile double-tap handling was hardened for cleaner TypeScript checks.

# 2.0.5
- Import/export workflow polished further with folder-picker groundwork, mobile double-tap interaction got usability upgrades, text box editing/navigation became smoother, pins gained per-marker size overrides, and SVG-based pin visuals got optional shadow support improvements.

# 2.0.4
- Map tool added to work with TTRPG Tools - Player Screen. It is now possible to Play around with a live fog of war on the player screen.
