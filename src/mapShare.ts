import {
  activeDocument,
  Modal,
  Notice,
  Setting,
  TFile,
  normalizePath,
  parseYaml,
  stringifyYaml,
} from "obsidian";
import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import type { App, Editor, MarkdownView } from "obsidian";
import type ZoomMapPlugin from "./main";
import type {
  BaseCollection,
  IconProfile,
  MarkerPreset,
  PingPreset,
  StickerPreset,
  SwapPinPreset,
  MapInstance,
  MapShareExportContext,
} from "./map";
import type {
  BaseImage,
  ImageOverlay,
  MarkerFileData,
  TextLayerStyle,
} from "./markerStore";
import { sanitizeMarkerFileDataForSave } from "./markerStore";
import { FolderSuggestModal } from "./folderSuggest";

const BUNDLE_JSON_PATH = "zoommap-bundle.json";

type BundleAssetKind =
  | "base"
  | "overlay"
  | "frame"
  | "sticker"
  | "drawing"
  | "linked-note"
  | "note-image"
  | "note-video"
  | "note-pdf"
  | "note-audio";

interface BundleAssetEntry {
  kind: BundleAssetKind;
  originalPath: string;
  zipPath: string;
}

type BundleIconProfile = IconProfile & {
  inCollections?: boolean;
};

interface BundleCollectionSubset {
  suggestedName: string;
  pinKeys: string[];
  favorites: MarkerPreset[];
  stickers: StickerPreset[];
  swapPins: SwapPinPreset[];
  pingPins: PingPreset[];
}

interface ZoomMapBundleV1 {
  version: 1;
  exportedAt: string;
  bundleName: string;
  map: {
    sourcePath: string;
    mapId?: string;
    storageMode: "json" | "note";
    markersPath: string;
    yamlBlock: string;
    yamlRaw: string;
    yamlObject: Record<string, unknown> | null;
    markerData: MarkerFileData;
    defaultIconKey?: string;
  };
  icons: BundleIconProfile[];
  collectionSubset?: BundleCollectionSubset;
  assets: BundleAssetEntry[];
  noteResolvedLinks?: Record<string, Record<string, string>>;
  resolvedLinks: Record<string, string>;
  warnings: {
    hasDrawings: boolean;
    hasTextLayers: boolean;
    customFonts: string[];
    usesCustomUnits: boolean;
  };
}

type LoadedBundle = {
  files: Record<string, Uint8Array>;
  bundle: ZoomMapBundleV1;
};

type StorageImportMode = "match-export" | "json" | "note";
type CollectionImportMode = "create" | "merge" | "none";

interface ExportOptions {
  zipName: string;
  includeLinkedNotes: boolean;
  includeRecursiveLinkedNotes: boolean;
  includeNoteImages: boolean;
  includeNoteVideos: boolean;
  includeNotePdfs: boolean;
  includeNoteAudio: boolean;
}

interface ImportOptions {
  targetNotePath: string;
  mapId: string;
  storageMode: StorageImportMode;
  assetsRoot: string;
  drawingsRoot: string;
  notesRoot: string;
  markersRoot: string;
  collectionMode: CollectionImportMode;
  mergeCollectionId?: string;
  newCollectionName?: string;
  stripUnresolvedNoteLinks?: boolean;
}

interface ImportPreparedResult {
  codeBlock: string;
  inlineBlock?: string;
  warnings: string[];
}

interface CollectionImportResult {
  changed: boolean;
  warnings: string[];
  swapIdMap: Map<string, string>;
  pingIdMap: Map<string, string>;
}

interface PreparedExport {
  markerData: MarkerFileData;
  subset: BundleCollectionSubset;
  icons: BundleIconProfile[];
  resolvedLinks: Record<string, string>;
  linkedNotePaths: Set<string>;
  noteResolvedLinks: Record<string, Record<string, string>>;
  mediaAssetPaths: Map<string, BundleAssetKind>;
}

const IMAGE_EXTENSIONS = new Set([
  "png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "avif",
]);
const VIDEO_EXTENSIONS = new Set([
  "mp4", "webm", "mov", "m4v", "avi", "mkv",
]);
const PDF_EXTENSIONS = new Set([
  "pdf",
]);
const AUDIO_EXTENSIONS = new Set([
  "mp3", "wav", "ogg", "m4a", "flac", "aac",
]);

function classifyNoteMediaKind(
  ext: string,
  options: Pick<
    ExportOptions,
    "includeNoteImages" | "includeNoteVideos" | "includeNotePdfs" | "includeNoteAudio"
  >,
): BundleAssetKind | null {
  const e = (ext ?? "").trim().toLowerCase();
  if (!e) return null;
  if (options.includeNoteImages && IMAGE_EXTENSIONS.has(e)) return "note-image";
  if (options.includeNoteVideos && VIDEO_EXTENSIONS.has(e)) return "note-video";
  if (options.includeNotePdfs && PDF_EXTENSIONS.has(e)) return "note-pdf";
  if (options.includeNoteAudio && AUDIO_EXTENSIONS.has(e)) return "note-audio";
  return null;
}

function deepClone<T>(value: T): T {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function stableStringify(value: unknown): string {
  const seen = new WeakSet<object>();
  const norm = (v: unknown): unknown => {
    if (v && typeof v === "object") {
      if (seen.has(v)) return null;
      seen.add(v);
      if (Array.isArray(v)) return v.map(norm);
      const out: Record<string, unknown> = {};
      for (const key of Object.keys(v as Record<string, unknown>).sort()) {
        out[key] = norm((v as Record<string, unknown>)[key]);
      }
      return out;
    }
    return v;
  };
  return JSON.stringify(norm(value));
}

function folderOf(path: string): string {
  const idx = path.lastIndexOf("/");
  return idx >= 0 ? path.slice(0, idx) : "";
}

function basename(path: string): string {
  const idx = path.lastIndexOf("/");
  return idx >= 0 ? path.slice(idx + 1) : path;
}

function fileStem(path: string): string {
  const name = basename(path);
  const idx = name.lastIndexOf(".");
  return idx >= 0 ? name.slice(0, idx) : name;
}

function sanitizeFileName(name: string): string {
  return (name ?? "")
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizePathSegment(seg: string): string {
  const cleaned = sanitizeFileName(seg).replace(/^\.+$/, "_");
  return cleaned || "_";
}

function safeRelativePath(originalPath: string): string {
  const parts = normalizePath(originalPath)
    .split("/")
    .map((p) => p.trim())
    .filter((p) => p.length > 0 && p !== "." && p !== "..")
    .map(sanitizePathSegment);

  return parts.length ? parts.join("/") : sanitizePathSegment(basename(originalPath || "item"));
}

function joinRoot(root: string, originalPath: string): string {
  const rel = safeRelativePath(originalPath);
  return normalizePath(`${root}/${rel}`);
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  );
}

function ensureUint8Array(value: unknown, context: string): Uint8Array {
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  }
  throw new Error(`${context} did not return Uint8Array data.`);
}

function utf8Encode(text: string): Uint8Array {
  return ensureUint8Array(strToU8(text), "strToU8");
}

function utf8Decode(bytes: Uint8Array): string {
  const out: unknown = strFromU8(bytes);
  if (typeof out !== "string") {
    throw new Error("strFromU8 did not return a string.");
  }
  return out;
}

function unzipFilesStrict(bytes: Uint8Array): Record<string, Uint8Array> {
  const raw: unknown = unzipSync(bytes);
  if (!isRecord(raw)) {
    throw new Error("Invalid ZIP payload.");
  }

  const out: Record<string, Uint8Array> = {};
  for (const [path, value] of Object.entries(raw)) {
    out[path] = ensureUint8Array(value, `unzipSync(${path})`);
  }
  return out;
}

function zipFilesStrict(files: Record<string, Uint8Array>): Uint8Array {
  return ensureUint8Array(
    zipSync(files, { level: 6 }),
    "zipSync",
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isBundleAssetKind(value: unknown): value is BundleAssetKind {
  return (
    value === "base" ||
    value === "overlay" ||
    value === "frame" ||
    value === "sticker" ||
    value === "drawing" ||
    value === "linked-note" ||
    value === "note-image" ||
    value === "note-video" ||
    value === "note-pdf" ||
    value === "note-audio"
  );
}

function isBundleAssetEntry(value: unknown): value is BundleAssetEntry {
  return (
    isRecord(value) &&
    isBundleAssetKind(value.kind) &&
    typeof value.originalPath === "string" &&
    typeof value.zipPath === "string"
  );
}

function isZoomMapBundleV1(value: unknown): value is ZoomMapBundleV1 {
  return (
    isRecord(value) &&
    value.version === 1 &&
    typeof value.exportedAt === "string" &&
    typeof value.bundleName === "string" &&
    isRecord(value.map) &&
    Array.isArray(value.assets) &&
    value.assets.every(isBundleAssetEntry)
  );
}

function mimeFromPath(path: string): string {
  const ext = basename(path).split(".").pop()?.toLowerCase() ?? "";
  switch (ext) {
    case "png": return "image/png";
    case "jpg":
    case "jpeg": return "image/jpeg";
    case "gif": return "image/gif";
    case "webp": return "image/webp";
    case "svg": return "image/svg+xml";
    default: return "application/octet-stream";
  }
}

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  const chunkSize = 0x8000;
  let binary = "";

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return safeBtoa(binary);
}

function dataUrlFromBytes(path: string, buf: ArrayBuffer): string {
  return `data:${mimeFromPath(path)};base64,${arrayBufferToBase64(buf)}`;
}

function safeBtoa(binary: string): string {
  if (typeof window.btoa === "function") {
    return window.btoa(binary);
  }
  throw new Error("No base64 encoder available in this runtime.");
}

function isDataUrl(value: string): boolean {
  return typeof value === "string" && value.startsWith("data:");
}

function normalizeBases(raw: MarkerFileData["bases"]): BaseImage[] {
  const out: BaseImage[] = [];
  for (const item of raw ?? []) {
    if (typeof item === "string") {
      out.push({ path: item });
    } else if (item && typeof item === "object" && "path" in item) {
      const path = (item as { path?: unknown }).path;
      const name = (item as { name?: unknown }).name;
      if (typeof path === "string" && path.trim()) {
        out.push({
          path,
          name: typeof name === "string" && name.trim() ? name : undefined,
        });
      }
    }
  }
  return out;
}

function normalizeOverlays(raw: MarkerFileData["overlays"]): ImageOverlay[] {
  return (raw ?? []).map((o) => ({
    path: o.path,
    visible: o.visible !== false,
    name: o.name,
  }));
}

function splitRawLink(raw: string): {
  path: string;
  anchor?: string;
  alias?: string;
} {
  const trimmed = (raw ?? "").trim();
  const pipeIdx = trimmed.indexOf("|");
  const left = pipeIdx >= 0 ? trimmed.slice(0, pipeIdx) : trimmed;
  const alias = pipeIdx >= 0 ? trimmed.slice(pipeIdx + 1) : undefined;
  const hashIdx = left.indexOf("#");
  if (hashIdx >= 0) {
    return {
      path: left.slice(0, hashIdx).trim(),
      anchor: left.slice(hashIdx + 1).trim() || undefined,
      alias: alias?.trim() || undefined,
    };
  }
  return {
    path: left.trim(),
    alias: alias?.trim() || undefined,
  };
}

function buildRawLink(base: string, anchor?: string, alias?: string): string {
  let out = base;
  if (anchor) out += `#${anchor}`;
  if (alias) out += `|${alias}`;
  return out;
}

function quoteAwareInsertionText(editor: Editor, codeBlock: string, inlineBlock?: string): string {
  const cursor = editor.getCursor();
  const line = editor.getLine(cursor.line) ?? "";
  const m = /^(\s*(?:>\s*)+)/.exec(line);
  const quotePrefix = m?.[1] ?? "";

  const normalizedCode = `${codeBlock.trimEnd()}\n`;
  const normalizedInline = inlineBlock ? `${inlineBlock.trimEnd()}\n` : "";

  if (!quotePrefix) {
    return normalizedInline ? `${normalizedCode}\n${normalizedInline}` : normalizedCode;
  }

  const cursorAfterPrefix = cursor.ch >= quotePrefix.length;
  const quotedCode = normalizedCode
    .split("\n")
    .map((ln, idx) => {
      if (idx === normalizedCode.split("\n").length - 1 && ln === "") return "";
      if (idx === 0 && cursorAfterPrefix) return ln;
      return `${quotePrefix}${ln}`;
    })
    .join("\n")
    .trimEnd() + "\n";

  return normalizedInline ? `${quotedCode}\n${normalizedInline}` : quotedCode;
}

function buildInlineStorageBlock(mapId: string, data: MarkerFileData): string {
  const payload = JSON.stringify(sanitizeMarkerFileDataForSave(data), null, 2);
  return [
    "%%",
    `ZOOMMAP-DATA id=${mapId}`,
    payload,
    "/ZOOMMAP-DATA",
    "%%",
    "",
  ].join("\n");
}

function downloadZip(filename: string, bytes: Uint8Array): void {
  const doc = getActiveDocumentSafe();
  const blob = new Blob([bytes], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const a = doc.createElement("a");
  a.href = url;
  a.download = filename;
  doc.body?.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function getActiveDocumentSafe(): Document {
  const docUnknown: unknown = activeDocument;

  if (
    docUnknown &&
    typeof docUnknown === "object" &&
    "createElement" in docUnknown &&
    typeof (docUnknown as { createElement?: unknown }).createElement === "function"
  ) {
    return docUnknown as Document;
  }

  if (typeof window !== "undefined" && window.document) {
    return window.document;
  }

  throw new Error("No active document available.");
}

async function deleteVaultPathIfExists(app: App, path: string): Promise<void> {
  const existing = app.vault.getAbstractFileByPath(normalizePath(path));
  if (!(existing instanceof TFile)) return;
  await app.fileManager.trashFile(existing, false);
}

async function ensureFolderPathExists(app: App, folder: string): Promise<void> {
  const normalized = normalizePath(folder).trim();
  if (!normalized) return;
  const parts = normalized.split("/").filter(Boolean);
  let current = "";
  for (const part of parts) {
    current = current ? `${current}/${part}` : part;
    if (!app.vault.getAbstractFileByPath(current)) {
      await app.vault.createFolder(current);
    }
  }
}

async function uniqueVaultPath(
  app: App,
  desiredPath: string,
  reserved?: Set<string>,
): Promise<string> {
  const normalized = normalizePath(desiredPath);
  if (!app.vault.getAbstractFileByPath(normalized) && !reserved?.has(normalized)) {
    reserved?.add(normalized);
    return normalized;
  }

  const dir = folderOf(normalized);
  const base = basename(normalized);
  const dot = base.lastIndexOf(".");
  const stem = dot >= 0 ? base.slice(0, dot) : base;
  const ext = dot >= 0 ? base.slice(dot) : "";

  let i = 1;
  while (true) {
    const candidate = normalizePath(`${dir}/${stem}-${i}${ext}`);
    if (!app.vault.getAbstractFileByPath(candidate) && !reserved?.has(candidate)) {
      reserved?.add(candidate);
      return candidate;
    }
    i += 1;
  }
}

async function readVaultBinary(app: App, file: TFile): Promise<Uint8Array> {
  const vaultAny = app.vault as unknown as {
    readBinary?: (f: TFile) => Promise<ArrayBuffer | Uint8Array>;
  };
  if (typeof vaultAny.readBinary === "function") {
    const raw = await vaultAny.readBinary(file);
    return raw instanceof Uint8Array ? raw : new Uint8Array(raw);
  }

  const adapterAny = app.vault.adapter as unknown as {
    readBinary?: (path: string) => Promise<ArrayBuffer | Uint8Array>;
  };
  if (typeof adapterAny.readBinary === "function") {
    const raw = await adapterAny.readBinary(file.path);
    return raw instanceof Uint8Array ? raw : new Uint8Array(raw);
  }

  throw new Error(`Cannot read binary file: ${file.path}`);
}

async function writeVaultBinary(app: App, path: string, bytes: Uint8Array): Promise<void> {
  const normalized = normalizePath(path);
  await ensureFolderPathExists(app, folderOf(normalized));

  const existing = app.vault.getAbstractFileByPath(normalized);
  const buf = toArrayBuffer(bytes);

  const vaultAny = app.vault as unknown as {
    createBinary?: (p: string, data: ArrayBuffer) => Promise<TFile>;
    modifyBinary?: (file: TFile, data: ArrayBuffer) => Promise<void>;
  };

  if (existing instanceof TFile && typeof vaultAny.modifyBinary === "function") {
    await vaultAny.modifyBinary(existing, buf);
    return;
  }

  if (!(existing instanceof TFile) && typeof vaultAny.createBinary === "function") {
    await vaultAny.createBinary(normalized, buf);
    return;
  }

  const adapterAny = app.vault.adapter as unknown as {
    writeBinary?: (p: string, data: ArrayBuffer) => Promise<void>;
  };
  if (typeof adapterAny.writeBinary === "function") {
    await adapterAny.writeBinary(normalized, buf);
    return;
  }

  throw new Error(`Cannot write binary file: ${normalized}`);
}

async function writeVaultText(app: App, path: string, text: string): Promise<void> {
  const normalized = normalizePath(path);
  await ensureFolderPathExists(app, folderOf(normalized));

  const existing = app.vault.getAbstractFileByPath(normalized);
  if (existing instanceof TFile) {
    await app.vault.modify(existing, text);
  } else {
    await app.vault.create(normalized, text);
  }
}

function resolveFile(app: App, pathOrLink: string, fromPath: string): TFile | null {
  const trimmed = (pathOrLink ?? "").trim();
  if (!trimmed) return null;

  const byPath = app.vault.getAbstractFileByPath(trimmed);
  if (byPath instanceof TFile) return byPath;

  const dest = app.metadataCache.getFirstLinkpathDest(trimmed, fromPath);
  return dest instanceof TFile ? dest : null;
}

function normalizeIconSignature(icon: BundleIconProfile): string {
  const copy = deepClone(icon);
  delete (copy as { key?: string }).key;
  return stableStringify(copy);
}

function normalizeSwapSignature(preset: SwapPinPreset): string {
  const copy = deepClone(preset);
  delete (copy as { id?: string }).id;
  return stableStringify(copy);
}

function normalizePingSignature(preset: PingPreset): string {
  const copy = deepClone(preset);
  delete (copy as { id?: string }).id;
  return stableStringify(copy);
}

function normalizeStickerSignature(preset: StickerPreset): string {
  return stableStringify(preset);
}

function uniqueCollectionItemId(prefix: string, taken: Set<string>, desired?: string): string {
  let candidate = (desired ?? "").trim();
  if (!candidate || taken.has(candidate)) candidate = `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
  while (taken.has(candidate)) {
    candidate = `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
  }
  taken.add(candidate);
  return candidate;
}

function bundleUsesCustomUnits(data: MarkerFileData): boolean {
  if (data.measurement?.displayUnit === "custom") return true;
  if ((data.markers ?? []).some((m) => m.pingRadiusUnit === "custom")) return true;
  return false;
}

function isCustomFontValue(value: string): boolean {
  const v = (value ?? "").trim().toLowerCase();
  if (!v) return false;
  if (v.startsWith("var(")) return false;
  if (v === "system-ui" || v === "sans-serif" || v === "serif" || v === "monospace") return false;
  if (v.includes("var(--font-")) return false;
  return true;
}

function collectCustomFonts(data: MarkerFileData): string[] {
  const out = new Set<string>();

  const addStyle = (style?: Partial<TextLayerStyle>) => {
    const family = (style?.fontFamily ?? "").trim();
    if (family && isCustomFontValue(family)) out.add(family);
  };

  for (const layer of data.textLayers ?? []) {
    addStyle(layer.style);
    for (const box of layer.boxes ?? []) addStyle(box.style);
  }

  return [...out].sort((a, b) => a.localeCompare(b));
}

function ensureCollectionArrays(col: BaseCollection): void {
  col.bindings ??= { basePaths: [] };
  col.bindings.basePaths ??= [];
  col.include ??= {
    pinKeys: [],
    favorites: [],
    stickers: [],
    swapPins: [],
    pingPins: [],
  };
  col.include.pinKeys ??= [];
  col.include.favorites ??= [];
  col.include.stickers ??= [];
  col.include.swapPins ??= [];
  col.include.pingPins ??= [];
}

function createSyntheticStickerPresets(data: MarkerFileData): StickerPreset[] {
  const seen = new Set<string>();
  const out: StickerPreset[] = [];

  for (const marker of data.markers ?? []) {
    if (marker.type !== "sticker" || !marker.stickerPath) continue;
    const preset: StickerPreset = {
      name: fileStem(marker.stickerPath) || "Sticker",
      imagePath: marker.stickerPath,
      size: Math.max(1, Math.round(marker.stickerSize ?? 64)),
      openEditor: false,
    };
    const sig = normalizeStickerSignature(preset);
    if (seen.has(sig)) continue;
    seen.add(sig);
    out.push(preset);
  }

  return out;
}

function findSwapPreset(plugin: ZoomMapPlugin, id: string): SwapPinPreset | null {
  const cols = plugin.settings.baseCollections ?? [];
  for (const col of cols) {
    const found = (col.include?.swapPins ?? []).find((sp) => sp.id === id);
    if (found) return deepClone(found);
  }
  return null;
}

function findPingPreset(plugin: ZoomMapPlugin, id: string): PingPreset | null {
  const cols = plugin.settings.baseCollections ?? [];
  for (const col of cols) {
    const found = (col.include?.pingPins ?? []).find((pp) => pp.id === id);
    if (found) return deepClone(found);
  }
  return null;
}

function findIconLike(plugin: ZoomMapPlugin, key: string): BundleIconProfile {
  const existing = (plugin.settings.icons ?? []).find((i) => i.key === key) as BundleIconProfile | undefined;
  if (existing) return deepClone(existing);

  const builtin = plugin.builtinIcon() as BundleIconProfile;
  return {
    ...deepClone(builtin),
    key: key || builtin.key,
    inCollections: true,
  };
}

async function serializeIconForBundle(
  app: App,
  plugin: ZoomMapPlugin,
  sourcePath: string,
  iconKey: string,
): Promise<BundleIconProfile> {
  const icon = findIconLike(plugin, iconKey);
  const src = icon.pathOrDataUrl ?? "";
  if (isDataUrl(src)) return icon;

  const file = resolveFile(app, src, sourcePath);
  if (!file) return icon;

  const bytes = await readVaultBinary(app, file);
  return {
    ...icon,
    pathOrDataUrl: dataUrlFromBytes(file.path, toArrayBuffer(bytes)),
  };
}

function collectUsedCollectionSubset(
  plugin: ZoomMapPlugin,
  data: MarkerFileData,
  bundleName: string,
): BundleCollectionSubset {
  const pinKeys = new Set<string>();
  const swapPins: SwapPinPreset[] = [];
  const pingPins: PingPreset[] = [];
  const seenSwap = new Set<string>();
  const seenPing = new Set<string>();

  for (const marker of data.markers ?? []) {
    if (marker.type !== "sticker") {
      const key = (marker.iconKey ?? plugin.settings.defaultIconKey ?? "").trim();
      if (key) pinKeys.add(key);
    }

    if (marker.type === "swap" && marker.swapKey && !seenSwap.has(marker.swapKey)) {
      const preset = findSwapPreset(plugin, marker.swapKey);
      if (preset) {
        swapPins.push(preset);
        seenSwap.add(marker.swapKey);
        for (const frame of preset.frames ?? []) {
          const key = (frame.iconKey ?? "").trim();
          if (key) pinKeys.add(key);
        }
      }
    }

    if (marker.type === "ping" && marker.pingPresetId && !seenPing.has(marker.pingPresetId)) {
      const preset = findPingPreset(plugin, marker.pingPresetId);
      if (preset) {
        pingPins.push(preset);
        seenPing.add(marker.pingPresetId);
        const key = (preset.iconKey ?? "").trim();
        if (key) pinKeys.add(key);
      }
    }
  }

  return {
    suggestedName: `Imported ${bundleName}`,
    pinKeys: [...pinKeys].sort((a, b) => a.localeCompare(b)),
    favorites: [],
    stickers: createSyntheticStickerPresets(data),
    swapPins,
    pingPins,
  };
}

function collectUsedIconKeys(
  plugin: ZoomMapPlugin,
  data: MarkerFileData,
  subset: BundleCollectionSubset,
  fallbackDefaultIconKey?: string,
): string[] {
  const keys = new Set<string>();
  let needsFallbackDefault = false;

  for (const marker of data.markers ?? []) {
    if (marker.type === "sticker") continue;
    const key = (marker.iconKey ?? "").trim();
    if (key) keys.add(key);
    else needsFallbackDefault = true;
  }

  for (const key of subset.pinKeys) {
    if (key.trim()) keys.add(key.trim());
  }

  for (const preset of subset.swapPins ?? []) {
    for (const frame of preset.frames ?? []) {
      const key = (frame.iconKey ?? "").trim();
      if (key) keys.add(key);
    }
  }

  for (const preset of subset.pingPins ?? []) {
    const key = (preset.iconKey ?? "").trim();
    if (key) keys.add(key);
  }

  const defaultKey = (fallbackDefaultIconKey ?? plugin.settings.defaultIconKey ?? "").trim();
  if (needsFallbackDefault && defaultKey) keys.add(defaultKey);

  return [...keys].sort((a, b) => a.localeCompare(b));
}

function collectConfiguredAssetPaths(ctx: MapShareExportContext): {
  basePaths: string[];
  overlayPaths: string[];
  framePath?: string;
  stickerPaths: string[];
  drawingPaths: string[];
} {
  const markerData = ctx.markerData;
  const basePaths = normalizeBases(markerData.bases).map((b) => b.path);
  const overlayPaths = normalizeOverlays(markerData.overlays).map((o) => o.path);
  const stickerPaths = (markerData.markers ?? [])
    .filter((m) => m.type === "sticker" && typeof m.stickerPath === "string")
    .map((m) => m.stickerPath as string);
  const drawingPaths = (markerData.drawings ?? [])
    .map((d) => d.bakedPath ?? "")
    .filter((p) => !!p);

  let framePath: string | undefined;
  const yamlObj = ctx.yamlObject ?? {};
  const vp = yamlObj["viewportFrame"];
  if (typeof vp === "string" && vp.trim() && !isDataUrl(vp)) framePath = vp.trim();

  return {
    basePaths,
    overlayPaths,
    framePath,
    stickerPaths,
    drawingPaths,
  };
}

function collectDirectResolvedNoteLinks(
  app: App,
  file: TFile,
  options?: Pick<
    ExportOptions,
    "includeNoteImages" | "includeNoteVideos" | "includeNotePdfs" | "includeNoteAudio"
  >,
): {
  resolvedLinks: Record<string, string>;
  notePaths: Set<string>;
  mediaAssetPaths: Map<string, BundleAssetKind>;
} {
  const resolvedLinks: Record<string, string> = {};
  const notePaths = new Set<string>();
  const mediaAssetPaths = new Map<string, BundleAssetKind>();

  const cache = thisSafeFileCache(app, file);
  const rawLinks = new Set<string>();

  for (const entry of cache?.links ?? []) {
    const raw = typeof entry.link === "string" ? entry.link.trim() : "";
    if (raw) rawLinks.add(raw);
  }

  for (const entry of cache?.embeds ?? []) {
    const raw = typeof entry.link === "string" ? entry.link.trim() : "";
    if (raw) rawLinks.add(raw);
  }

  for (const raw of rawLinks) {
    const resolved = resolveFile(app, raw, file.path);
    if (!(resolved instanceof TFile)) continue;
    resolvedLinks[raw] = resolved.path;

    const ext = resolved.extension?.toLowerCase() ?? "";
    if (ext === "md") {
      notePaths.add(resolved.path);
      continue;
    }

    const mediaKind = classifyNoteMediaKind(ext, {
      includeNoteImages: !!options?.includeNoteImages,
      includeNoteVideos: !!options?.includeNoteVideos,
      includeNotePdfs: !!options?.includeNotePdfs,
      includeNoteAudio: !!options?.includeNoteAudio,
    });
    if (mediaKind) {
      mediaAssetPaths.set(resolved.path, mediaKind);
    }
  }

  return { resolvedLinks, notePaths, mediaAssetPaths };
}

function thisSafeFileCache(app: App, file: TFile): {
  links?: { link: string }[];
  embeds?: { link: string }[];
} | null {
  return (app.metadataCache.getFileCache(file) as {
    links?: { link: string }[];
    embeds?: { link: string }[];
  } | null) ?? null;
}

function collectRecursiveLinkedNotes(
  app: App,
  seedPaths: Set<string>,
  options: Pick<
    ExportOptions,
    | "includeRecursiveLinkedNotes"
    | "includeNoteImages"
    | "includeNoteVideos"
    | "includeNotePdfs"
    | "includeNoteAudio"
  >,
): {
  linkedNotePaths: Set<string>;
  noteResolvedLinks: Record<string, Record<string, string>>;
  mediaAssetPaths: Map<string, BundleAssetKind>;
} {
  const linkedNotePaths = new Set<string>();
  const noteResolvedLinks: Record<string, Record<string, string>> = {};
  const mediaAssetPaths = new Map<string, BundleAssetKind>();
  const queue = [...seedPaths];

  while (queue.length > 0) {
    const path = queue.shift();
    if (!path || linkedNotePaths.has(path)) continue;

    const af = app.vault.getAbstractFileByPath(path);
    if (!(af instanceof TFile)) continue;
    if (af.extension?.toLowerCase() !== "md") continue;

    linkedNotePaths.add(af.path);

    const direct = collectDirectResolvedNoteLinks(app, af, options);
    if (Object.keys(direct.resolvedLinks).length > 0) {
      noteResolvedLinks[af.path] = direct.resolvedLinks;
    }

    for (const [mediaPath, kind] of direct.mediaAssetPaths.entries()) {
      if (!mediaAssetPaths.has(mediaPath)) {
        mediaAssetPaths.set(mediaPath, kind);
      }
    }

    if (!options.includeRecursiveLinkedNotes) {
      continue;
    }

    for (const childPath of direct.notePaths) {
      if (!linkedNotePaths.has(childPath)) queue.push(childPath);
    }
  }

  return { linkedNotePaths, noteResolvedLinks, mediaAssetPaths };
}

async function prepareExportData(
  app: App,
  plugin: ZoomMapPlugin,
  ctx: MapShareExportContext,
  options: ExportOptions,
): Promise<PreparedExport> {
  const markerData = deepClone(sanitizeMarkerFileDataForSave(ctx.markerData));
  const subset = collectUsedCollectionSubset(plugin, markerData, options.zipName);
  const fallbackDefaultIconKey =
    ctx.yamlObject && typeof ctx.yamlObject.defaultIconKey === "string"
      ? ctx.yamlObject.defaultIconKey
      : undefined;

  const icons: BundleIconProfile[] = [];
  for (const key of collectUsedIconKeys(plugin, markerData, subset, fallbackDefaultIconKey)) {
    icons.push(await serializeIconForBundle(app, plugin, ctx.sourcePath, key));
  }

  const seedLinks = collectResolvedLinksForExport(
    app,
    ctx,
    markerData,
    icons,
    subset,
    options.includeLinkedNotes,
  );

  const recursive = options.includeLinkedNotes
    ? collectRecursiveLinkedNotes(app, seedLinks.linkedNotePaths, {
        includeRecursiveLinkedNotes: options.includeRecursiveLinkedNotes,
        includeNoteImages: options.includeNoteImages,
        includeNoteVideos: options.includeNoteVideos,
        includeNotePdfs: options.includeNotePdfs,
        includeNoteAudio: options.includeNoteAudio,
      })
    : {
        linkedNotePaths: new Set<string>(),
        noteResolvedLinks: {},
        mediaAssetPaths: new Map<string, BundleAssetKind>(),
      };

  return {
    markerData,
    subset,
    icons,
    resolvedLinks: seedLinks.resolvedLinks,
    linkedNotePaths: recursive.linkedNotePaths,
    noteResolvedLinks: recursive.noteResolvedLinks,
	mediaAssetPaths: recursive.mediaAssetPaths,
  };
}

function buildZipAssetPath(kind: BundleAssetKind, originalPath: string): string {
  return `${kind}/${safeRelativePath(originalPath)}`;
}

function parseBundleSummary(bundle: ZoomMapBundleV1): string[] {
  const data = bundle.map.markerData;
  const noteImages = bundle.assets.filter((a) => a.kind === "note-image").length;
  const noteVideos = bundle.assets.filter((a) => a.kind === "note-video").length;
  const notePdfs = bundle.assets.filter((a) => a.kind === "note-pdf").length;
  const noteAudio = bundle.assets.filter((a) => a.kind === "note-audio").length;
  return [
    `Storage: ${bundle.map.storageMode}`,
    `Bases: ${normalizeBases(data.bases).length}`,
    `Overlays: ${(data.overlays ?? []).length}`,
    `Markers: ${(data.markers ?? []).length}`,
    `Drawings: ${(data.drawings ?? []).length}`,
    `Text layers: ${(data.textLayers ?? []).length}`,
    `Icons: ${(bundle.icons ?? []).length}`,
    `Linked notes: ${bundle.assets.filter((a) => a.kind === "linked-note").length}`,
    `Note images: ${noteImages}`,
    `Note videos: ${noteVideos}`,
    `Note PDFs: ${notePdfs}`,
    `Note audio: ${noteAudio}`,
  ];
}

function stripWikiLinkToText(raw: string): string {
  const parsed = splitRawLink(raw);
  if (parsed.alias?.trim()) return parsed.alias.trim();
  const path = parsed.path.trim();
  if (path) return path;
  return raw.trim();
}

function extractMarkdownHrefTarget(rawHref: string): string {
  const trimmed = rawHref.trim();
  if (trimmed.startsWith("<") && trimmed.endsWith(">")) {
    return trimmed.slice(1, -1).trim();
  }
  const spaceIdx = trimmed.search(/\s/);
  return spaceIdx >= 0 ? trimmed.slice(0, spaceIdx).trim() : trimmed;
}

function isExternalHref(href: string): boolean {
  const v = href.trim().toLowerCase();
  return (
    v.startsWith("http://") ||
    v.startsWith("https://") ||
    v.startsWith("mailto:") ||
    v.startsWith("ftp://")
  );
}

function rewriteImportedNoteText(
  app: App,
  text: string,
  originalSourcePath: string,
  sourceResolvedLinks: Record<string, string> | undefined,
  notePathMap: Map<string, string>,
  filePathMap: Map<string, string>,
  targetNotePath: string,
  stripUnresolved: boolean,
): string {
  const resolvedLookup = sourceResolvedLinks ?? {};

  const rewriteViaImportedPath = (
    rawLink: string,
    fallbackText: string,
  ): string | null => {
    const resolvedOriginalPath =
      resolvedLookup[rawLink.trim()] ??
      resolvedLookup[extractMarkdownHrefTarget(rawLink)] ??
      resolvedLookup[splitRawLink(rawLink).path];

    if (!resolvedOriginalPath) return stripUnresolved ? fallbackText : null;

    const importedPath =
      notePathMap.get(resolvedOriginalPath) ??
      filePathMap.get(resolvedOriginalPath);
    if (!importedPath) return stripUnresolved ? fallbackText : null;

    const af = app.vault.getAbstractFileByPath(importedPath);
    if (!(af instanceof TFile)) return stripUnresolved ? fallbackText : null;

    const parsed = splitRawLink(rawLink);
    const linktext = app.metadataCache.fileToLinktext(af, targetNotePath);
    return buildRawLink(linktext, parsed.anchor, parsed.alias);
  };

  let out = text.replace(/\[\[([^[\]]+)\]\]/g, (full, inner: string) => {
    const raw = inner.trim();
    const rewritten = rewriteViaImportedPath(raw, stripWikiLinkToText(raw));
    if (rewritten === null) return full;
    if (rewritten === stripWikiLinkToText(raw) && stripUnresolved) return rewritten;
    return `[[${rewritten}]]`;
  });

  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (full, label: string, hrefRaw: string) => {
    const target = extractMarkdownHrefTarget(hrefRaw);
    if (!target || isExternalHref(target)) return full;

    const rewritten = rewriteViaImportedPath(target, label);
    if (rewritten === null) return full;
    if (rewritten === label && stripUnresolved) return label;

    return `[[${buildRawLink(rewritten, undefined, label)}]]`;
  });

  return out;
}

function buildExportSummaryLines(
  storageMode: "json" | "note",
  prepared: PreparedExport,
): string[] {
  const markerData = prepared.markerData;
  let noteImages = 0;
  let noteVideos = 0;
  let notePdfs = 0;
  let noteAudio = 0;

  for (const kind of prepared.mediaAssetPaths.values()) {
    if (kind === "note-image") noteImages += 1;
    else if (kind === "note-video") noteVideos += 1;
    else if (kind === "note-pdf") notePdfs += 1;
    else if (kind === "note-audio") noteAudio += 1;
  }

  return [
    `Storage: ${storageMode}`,
    `Bases: ${normalizeBases(markerData.bases).length}`,
    `Overlays: ${(markerData.overlays ?? []).length}`,
    `Markers: ${(markerData.markers ?? []).length}`,
    `Drawings: ${(markerData.drawings ?? []).length}`,
    `Text layers: ${(markerData.textLayers ?? []).length}`,
    `Icons: ${prepared.icons.length}`,
    `Linked notes: ${prepared.linkedNotePaths.size}`,
    `Note images: ${noteImages}`,
    `Note videos: ${noteVideos}`,
    `Note PDFs: ${notePdfs}`,
    `Note audio: ${noteAudio}`,
  ];
}

function addResolvedLink(
  app: App,
  resolvedLinks: Record<string, string>,
  includedNotePaths: Set<string>,
  rawLink: string | undefined,
  fromPath: string,
  includeLinkedNotes: boolean,
): void {
  const raw = (rawLink ?? "").trim();
  if (!raw) return;
  const parsed = splitRawLink(raw);
  if (!parsed.path) return;
  const file = resolveFile(app, parsed.path, fromPath);
  if (!(file instanceof TFile)) return;
  resolvedLinks[raw] = file.path;
  if (includeLinkedNotes && file.extension?.toLowerCase() === "md") {
    includedNotePaths.add(file.path);
  }
}


function collectResolvedLinksForExport(
  app: App,
  ctx: MapShareExportContext,
  markerData: MarkerFileData,
  icons: BundleIconProfile[],
  subset: BundleCollectionSubset,
  includeLinkedNotes: boolean,
): {
  resolvedLinks: Record<string, string>;
  linkedNotePaths: Set<string>;
} {
  const resolvedLinks: Record<string, string> = {};
  const linkedNotePaths = new Set<string>();

  if (!includeLinkedNotes) {
    return { resolvedLinks, linkedNotePaths };
  }

  for (const m of markerData.markers ?? []) {
    addResolvedLink(app, resolvedLinks, linkedNotePaths, m.link, ctx.sourcePath, true);
    if (m.swapLinks) {
      for (const raw of Object.values(m.swapLinks)) {
        addResolvedLink(app, resolvedLinks, linkedNotePaths, raw, ctx.sourcePath, true);
      }
    }
  }

  for (const sp of subset.swapPins ?? []) {
    for (const fr of sp.frames ?? []) {
      addResolvedLink(app, resolvedLinks, linkedNotePaths, fr.link, ctx.sourcePath, true);
    }
  }

  for (const ico of icons ?? []) {
    addResolvedLink(app, resolvedLinks, linkedNotePaths, ico.defaultLink, ctx.sourcePath, true);
  }

  return { resolvedLinks, linkedNotePaths };
}

function rewriteLinkIfImported(
  app: App,
  rawLink: string | undefined,
  resolvedLinks: Record<string, string>,
  notePathMap: Map<string, string>,
  targetNotePath: string,
): string | undefined {
  const raw = (rawLink ?? "").trim();
  if (!raw) return rawLink;

  const resolvedPath = resolvedLinks[raw];
  if (!resolvedPath) return raw;

  const importedPath = notePathMap.get(resolvedPath);
  if (!importedPath) return raw;

  const file = app.vault.getAbstractFileByPath(importedPath);
  if (!(file instanceof TFile)) return raw;

  const parsed = splitRawLink(raw);
  const linktext = app.metadataCache.fileToLinktext(file, targetNotePath);
  return buildRawLink(linktext, parsed.anchor, parsed.alias);
}

function remapBaseBoundPath(path: string | undefined, basePathMap: Map<string, string>): string | undefined {
  if (!path) return undefined;
  return basePathMap.get(path) ?? path;
}

function remapBaseKeyedRecord<T>(
  value: Record<string, T> | undefined,
  basePathMap: Map<string, string>,
): Record<string, T> | undefined {
  if (!value) return value;
  const out: Record<string, T> = {};
  for (const [key, val] of Object.entries(value)) {
    out[basePathMap.get(key) ?? key] = val;
  }
  return out;
}

function patchMarkerDataPaths(
  app: App,
  data: MarkerFileData,
  filePathMap: Map<string, string>,
  notePathMap: Map<string, string>,
  resolvedLinks: Record<string, string>,
  targetNotePath: string,
  defaultIconKeyMap: Map<string, string>,
): MarkerFileData {
  const out = deepClone(data);
  const basePathMap = new Map<string, string>();

  out.bases = normalizeBases(out.bases).map((b) => {
    const nextPath = filePathMap.get(b.path) ?? b.path;
    basePathMap.set(b.path, nextPath);
    return { ...b, path: nextPath };
  });

  if (out.activeBase) out.activeBase = filePathMap.get(out.activeBase) ?? out.activeBase;

  out.overlays = normalizeOverlays(out.overlays).map((o) => ({
    ...o,
    path: filePathMap.get(o.path) ?? o.path,
  }));

  out.layers = (out.layers ?? []).map((l) => ({
    ...l,
    boundBase: remapBaseBoundPath(l.boundBase, basePathMap),
  }));

  out.drawLayers = (out.drawLayers ?? []).map((l) => ({
    ...l,
    boundBase: remapBaseBoundPath(l.boundBase, basePathMap),
  }));

  out.grids = (out.grids ?? []).map((g) => ({
    ...g,
    boundBase: remapBaseBoundPath(g.boundBase, basePathMap),
  }));

  out.textLayers = (out.textLayers ?? []).map((layer) => ({
    ...layer,
    boundBase: remapBaseBoundPath(layer.boundBase, basePathMap),
  }));

  if (out.measurement) {
    out.measurement.scales = remapBaseKeyedRecord(out.measurement.scales, basePathMap) ?? {};
    out.measurement.customUnitPxPerUnit =
      remapBaseKeyedRecord(out.measurement.customUnitPxPerUnit, basePathMap) ?? {};
  }

  out.drawings = (out.drawings ?? []).map((d) => ({
    ...d,
    bakedPath: d.bakedPath ? (filePathMap.get(d.bakedPath) ?? d.bakedPath) : d.bakedPath,
  }));

  out.markers = (out.markers ?? []).map((m) => {
    const next = { ...m };

    if (next.iconKey && defaultIconKeyMap.has(next.iconKey)) {
      next.iconKey = defaultIconKeyMap.get(next.iconKey);
    }

    if (next.link) {
      next.link = rewriteLinkIfImported(
        app,
        next.link,
        resolvedLinks,
        notePathMap,
        targetNotePath,
      ) ?? next.link;
    }

    if (next.swapLinks) {
      const rewritten: Record<number, string> = {};
      for (const [idxRaw, rawLink] of Object.entries(next.swapLinks)) {
        const idx = Number(idxRaw);
        rewritten[idx] =
          rewriteLinkIfImported(
            app,
            rawLink,
            resolvedLinks,
            notePathMap,
            targetNotePath,
          ) ?? rawLink;
      }
      next.swapLinks = rewritten;
    }

    if (next.type === "sticker" && next.stickerPath) {
      next.stickerPath = filePathMap.get(next.stickerPath) ?? next.stickerPath;
    }

    if (next.switchBase) {
      next.switchBase = basePathMap.get(next.switchBase) ?? next.switchBase;
    }

    if (next.pingNotePath) {
      next.pingNotePath = notePathMap.get(next.pingNotePath) ?? next.pingNotePath;
    }

    return next;
  });

  delete out.secondScreen;
  return out;
}

function remapCollectionSubset(
  app: App,
  subset: BundleCollectionSubset,
  iconKeyMap: Map<string, string>,
  filePathMap: Map<string, string>,
  notePathMap: Map<string, string>,
  resolvedLinks: Record<string, string>,
  targetNotePath: string,
  notesRoot: string,
): BundleCollectionSubset {
  const out = deepClone(subset);

  out.pinKeys = out.pinKeys.map((k) => iconKeyMap.get(k) ?? k);

  out.stickers = out.stickers.map((s) => ({
    ...s,
    imagePath: filePathMap.get(s.imagePath) ?? s.imagePath,
  }));

  out.swapPins = out.swapPins.map((sp) => ({
    ...sp,
    frames: (sp.frames ?? []).map((fr) => ({
      ...fr,
      iconKey: iconKeyMap.get(fr.iconKey) ?? fr.iconKey,
      link: rewriteLinkIfImported(
        app,
        fr.link,
        resolvedLinks,
        notePathMap,
        targetNotePath,
      ) ?? fr.link,
    })),
  }));

  out.pingPins = out.pingPins.map((pp) => ({
    ...pp,
    iconKey: pp.iconKey ? (iconKeyMap.get(pp.iconKey) ?? pp.iconKey) : pp.iconKey,
    noteFolder: notesRoot,
  }));

  return out;
}

async function buildBundleBytes(
  app: App,
  plugin: ZoomMapPlugin,
  ctx: MapShareExportContext,
  options: ExportOptions,
  preparedInput?: PreparedExport,
): Promise<Uint8Array> {
  const prepared =
    preparedInput ??
    await prepareExportData(app, plugin, ctx, options);

  const markerData = prepared.markerData;
  const subset = prepared.subset;
  const icons = prepared.icons;

  const configured = collectConfiguredAssetPaths(ctx);
  const assetPaths = new Map<string, BundleAssetKind>();

  for (const p of configured.basePaths) if (p && !isDataUrl(p)) assetPaths.set(p, "base");
  for (const p of configured.overlayPaths) if (p && !isDataUrl(p)) assetPaths.set(p, "overlay");
  for (const p of configured.stickerPaths) if (p && !isDataUrl(p)) assetPaths.set(p, "sticker");
  for (const p of configured.drawingPaths) if (p && !isDataUrl(p)) assetPaths.set(p, "drawing");
  if (configured.framePath && !isDataUrl(configured.framePath)) {
    assetPaths.set(configured.framePath, "frame");
  }

  const assets: BundleAssetEntry[] = [];
  for (const [originalPath, kind] of assetPaths) {
    assets.push({
      kind,
      originalPath,
      zipPath: buildZipAssetPath(kind, originalPath),
    });
  }

  for (const notePath of prepared.linkedNotePaths) {
    assets.push({
      kind: "linked-note",
      originalPath: notePath,
      zipPath: buildZipAssetPath("linked-note", notePath),
    });
  }
  
  for (const [mediaPath, kind] of prepared.mediaAssetPaths.entries()) {
    assets.push({
      kind,
      originalPath: mediaPath,
      zipPath: buildZipAssetPath(kind, mediaPath),
    });
  }

  const bundle: ZoomMapBundleV1 = {
    version: 1,
    exportedAt: new Date().toISOString(),
    bundleName: options.zipName,
    map: {
      sourcePath: ctx.sourcePath,
      mapId: ctx.mapId || undefined,
      storageMode: ctx.storageMode,
      markersPath: ctx.markersPath,
      yamlBlock: ctx.yamlBlock,
      yamlRaw: ctx.yamlRaw,
      yamlObject: ctx.yamlObject,
      markerData,
      defaultIconKey: plugin.settings.defaultIconKey,
    },
    icons,
    collectionSubset: subset,
    assets,
    noteResolvedLinks: prepared.noteResolvedLinks,
    resolvedLinks: prepared.resolvedLinks,
    warnings: {
      hasDrawings: (markerData.drawings ?? []).length > 0,
      hasTextLayers: (markerData.textLayers ?? []).length > 0,
      customFonts: collectCustomFonts(markerData),
      usesCustomUnits: bundleUsesCustomUnits(markerData),
    },
  };

  const files: Record<string, Uint8Array> = {};
  files[BUNDLE_JSON_PATH] = utf8Encode(JSON.stringify(bundle, null, 2));

  for (const asset of assets) {
    const file = app.vault.getAbstractFileByPath(asset.originalPath);
    if (!(file instanceof TFile)) continue;

    if (asset.kind === "linked-note") {
      files[asset.zipPath] = utf8Encode(await app.vault.read(file));
    } else {
      files[asset.zipPath] = await readVaultBinary(app, file);
    }
  }

  return zipFilesStrict(files);
}

async function loadBundleFromFile(file: File): Promise<LoadedBundle> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const files = unzipFilesStrict(bytes);
  const meta = files[BUNDLE_JSON_PATH];
  if (!meta) throw new Error("Bundle manifest not found.");

  const parsedUnknown: unknown = JSON.parse(utf8Decode(meta));
  if (!isZoomMapBundleV1(parsedUnknown)) {
    throw new Error("Unsupported or invalid map bundle.");
  }
  
  const parsed = parsedUnknown;

  return { files, bundle: parsed };
}

function nextUniqueMapId(editor: Editor, baseId?: string): string {
  const content = editor.getValue();
  const seed = sanitizeFileName((baseId ?? "").trim()) || `map-${Date.now().toString(36)}`;
  let candidate = seed;
  let i = 1;
  while (
    content.includes(`ZOOMMAP-DATA id=${candidate}`) ||
    new RegExp(`(^|\\n)\\s*id\\s*:\\s*["']?${candidate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']?(\\n|$)`, "m").test(content)
  ) {
    candidate = `${seed}-${i}`;
    i += 1;
  }
  return candidate;
}

function existingCollectionOptions(plugin: ZoomMapPlugin): { id: string; name: string }[] {
  return (plugin.settings.baseCollections ?? []).map((c) => ({
    id: c.id,
    name: c.name || "(unnamed collection)",
  }));
}

function ensureImportedIcons(
  app: App,
  plugin: ZoomMapPlugin,
  icons: BundleIconProfile[],
  resolvedLinks: Record<string, string>,
  notePathMap: Map<string, string>,
  targetNotePath: string,
): { changed: boolean; keyMap: Map<string, string> } {
  const keyMap = new Map<string, string>();
  let changed = false;

  const all: BundleIconProfile[] = [...(plugin.settings.icons ?? [])];
  const existingByKey = new Map(all.map((i) => [i.key, i]));

  for (const importedRaw of icons ?? []) {
    const imported = deepClone(importedRaw);
    imported.defaultLink = rewriteLinkIfImported(
      app,
      imported.defaultLink,
      resolvedLinks,
      notePathMap,
      targetNotePath,
    );

    const current = existingByKey.get(imported.key);
    if (current) {
      if (normalizeIconSignature(current) === normalizeIconSignature(imported)) {
        keyMap.set(importedRaw.key, current.key);
        continue;
      }

      let nextKey = imported.key;
      let i = 1;
      while (existingByKey.has(nextKey)) {
        nextKey = `${imported.key}-${i}`;
        i += 1;
      }
      imported.key = nextKey;
    }

    existingByKey.set(imported.key, imported);
    all.push(imported);
    keyMap.set(importedRaw.key, imported.key);
    changed = true;
  }

  if (changed) plugin.settings.icons = all;
  return { changed, keyMap };
}

function importCollectionSubset(
  plugin: ZoomMapPlugin,
  subset: BundleCollectionSubset | undefined,
  mode: CollectionImportMode,
  importedBasePaths: string[],
  mergeCollectionId?: string,
  newCollectionName?: string,
): CollectionImportResult {
  const warnings: string[] = [];
  const swapIdMap = new Map<string, string>();
  const pingIdMap = new Map<string, string>();

  if (!subset) {
    return { changed: false, warnings, swapIdMap, pingIdMap };
  }

  const needsCollection = (subset.swapPins?.length ?? 0) > 0 || (subset.pingPins?.length ?? 0) > 0;
  if (mode === "none") {
    if (needsCollection) {
      warnings.push("Collections were skipped. Swap pins and party pins may not work until their presets are imported.");
    }
    return { changed: false, warnings, swapIdMap, pingIdMap };
  }

  const collections = (plugin.settings.baseCollections ??= []);
  let target: BaseCollection | undefined;
  let changed = false;

  if (mode === "merge") {
    target = collections.find((c) => c.id === mergeCollectionId);
    if (!target) {
      warnings.push("Selected collection not found. Imported subset was added as a new collection instead.");
    }
  }

  if (!target) {
    target = {
      id: `col-${Math.random().toString(36).slice(2, 8)}`,
      name: (newCollectionName ?? "").trim() || subset.suggestedName || "Imported map",
      bindings: { basePaths: [] },
      include: {
        pinKeys: [],
        favorites: [],
        stickers: [],
        swapPins: [],
        pingPins: [],
      },
    };
    collections.push(target);
    changed = true;
  }

  ensureCollectionArrays(target);

  for (const p of importedBasePaths) {
    if (!target.bindings.basePaths.includes(p)) {
      target.bindings.basePaths.push(p);
      changed = true;
    }
  }

  for (const key of subset.pinKeys ?? []) {
    if (!target.include.pinKeys.includes(key)) {
      target.include.pinKeys.push(key);
      changed = true;
    }
  }

  for (const sticker of subset.stickers ?? []) {
    const sig = normalizeStickerSignature(sticker);
    const exists = (target.include.stickers ?? []).some((s) => normalizeStickerSignature(s) === sig);
    if (!exists) {
      target.include.stickers.push(deepClone(sticker));
      changed = true;
    }
  }

  const takenIds = new Set<string>(collections.flatMap((c) => [
    ...(c.include?.swapPins ?? []).map((p) => p.id),
    ...(c.include?.pingPins ?? []).map((p) => p.id),
  ]));

  for (const preset of subset.swapPins ?? []) {
    const sig = normalizeSwapSignature(preset);
    const same = (target.include.swapPins ?? []).find((sp) => normalizeSwapSignature(sp) === sig);
    if (same) {
      swapIdMap.set(preset.id, same.id);
      continue;
    }

    const clone = deepClone(preset);
    clone.id = uniqueCollectionItemId("swp", takenIds, clone.id);
    target.include.swapPins.push(clone);
    swapIdMap.set(preset.id, clone.id);
    changed = true;
  }

  for (const preset of subset.pingPins ?? []) {
    const sig = normalizePingSignature(preset);
    const same = (target.include.pingPins ?? []).find((pp) => normalizePingSignature(pp) === sig);
    if (same) {
      pingIdMap.set(preset.id, same.id);
      continue;
    }

    const clone = deepClone(preset);
    clone.id = uniqueCollectionItemId("ping", takenIds, clone.id);
    target.include.pingPins.push(clone);
    pingIdMap.set(preset.id, clone.id);
    changed = true;
  }

  return { changed, warnings, swapIdMap, pingIdMap };
}

function remapImportedPresetIds(data: MarkerFileData, swapIdMap: Map<string, string>, pingIdMap: Map<string, string>): MarkerFileData {
  const out = deepClone(data);
  out.markers = (out.markers ?? []).map((m) => ({
    ...m,
    swapKey: m.swapKey ? (swapIdMap.get(m.swapKey) ?? m.swapKey) : m.swapKey,
    pingPresetId: m.pingPresetId ? (pingIdMap.get(m.pingPresetId) ?? m.pingPresetId) : m.pingPresetId,
  }));
  return out;
}

function collectImportedBasePaths(data: MarkerFileData): string[] {
  return normalizeBases(data.bases).map((b) => b.path);
}

function rewriteYamlForImport(
  bundle: ZoomMapBundleV1,
  data: MarkerFileData,
  mapId: string,
  storageMode: "json" | "note",
  markersPath?: string,
  framePath?: string,
): string {
  let obj: Record<string, unknown> = {};

  if (bundle.map.yamlObject && typeof bundle.map.yamlObject === "object") {
    obj = deepClone(bundle.map.yamlObject);
  } else {
    try {
      const parsed: unknown = parseYaml(bundle.map.yamlRaw);
      if (isRecord(parsed)) {
        obj = parsed;
      }
    } catch {
      obj = {};
    }
  }

  const bases = normalizeBases(data.bases);
  const overlays = normalizeOverlays(data.overlays);

  obj.image = bases[0]?.path ?? obj.image;
  obj.imageBases = bases.map((b) => (b.name ? { path: b.path, name: b.name } : { path: b.path }));
  obj.imageOverlays = overlays.map((o) => ({
    path: o.path,
    name: o.name,
    visible: o.visible,
  }));

  obj.id = mapId;
  obj.storage = storageMode;

  if (storageMode === "json") obj.markers = markersPath;
  else delete obj.markers;

  if (framePath) {
    obj.viewportFrame = framePath;
  } else {
    const vf = obj.viewportFrame;
    if (typeof vf === "string" && !vf.trim()) delete obj.viewportFrame;
  }

  return `\`\`\`zoommap\n${stringifyYaml(obj).trimEnd()}\n\`\`\`\n`;
}

async function importBundleToVault(
  app: App,
  plugin: ZoomMapPlugin,
  loaded: LoadedBundle,
  options: ImportOptions,
): Promise<ImportPreparedResult> {
  const { bundle, files } = loaded;
  const warnings: string[] = [];
  const writtenPaths: string[] = [];

  const effectiveStorage: "json" | "note" =
    options.storageMode === "match-export"
      ? bundle.map.storageMode
      : options.storageMode;

  if (bundle.warnings.hasDrawings && !plugin.settings.enableDrawing) {
    warnings.push("This bundle contains drawings, but drawings are disabled in your plugin settings.");
  }
  if (bundle.warnings.hasTextLayers && !plugin.settings.enableTextLayers) {
    warnings.push("This bundle contains text layers, but text layers are disabled in your plugin settings.");
  }
  if ((bundle.warnings.customFonts ?? []).length > 0) {
    warnings.push(`Custom fonts used by this map are not installed automatically: ${bundle.warnings.customFonts.join(", ")}`);
  }
  if (bundle.warnings.usesCustomUnits) {
    warnings.push("The bundle uses custom travel/measurement units. Their travel-rule definitions are not imported automatically.");
  }
  
  const previousIcons = deepClone(plugin.settings.icons ?? []);
  const previousCollections = deepClone(plugin.settings.baseCollections ?? []);

  const filePathMap = new Map<string, string>();
  const notePathMap = new Map<string, string>();
  const reservedPaths = new Set<string>();

  try {
    for (const asset of bundle.assets ?? []) {
      const entry = files[asset.zipPath];
      if (!entry) {
        throw new Error(`Missing asset in ZIP: ${asset.zipPath}`);
      }

      if (asset.kind === "linked-note") {
        const desired = await uniqueVaultPath(
          app,
          joinRoot(options.notesRoot, asset.originalPath),
          reservedPaths,
        );
        notePathMap.set(asset.originalPath, desired);
        continue;
      }

      const root = asset.kind === "drawing" ? options.drawingsRoot : options.assetsRoot;
      const desired = await uniqueVaultPath(
        app,
        joinRoot(root, asset.originalPath),
        reservedPaths,
      );
      filePathMap.set(asset.originalPath, desired);
    }

    const importedIcons = ensureImportedIcons(
      app,
      plugin,
      bundle.icons ?? [],
      bundle.resolvedLinks ?? {},
      notePathMap,
      options.targetNotePath,
    );

    let subset = bundle.collectionSubset
      ? remapCollectionSubset(
          app,
          bundle.collectionSubset,
          importedIcons.keyMap,
          filePathMap,
          notePathMap,
          bundle.resolvedLinks ?? {},
          options.targetNotePath,
          options.notesRoot,
        )
      : undefined;

    let data = patchMarkerDataPaths(
      app,
      bundle.map.markerData,
      filePathMap,
      notePathMap,
      bundle.resolvedLinks ?? {},
      options.targetNotePath,
      importedIcons.keyMap,
    );

    const collectionImport = importCollectionSubset(
      plugin,
      subset,
      options.collectionMode,
      collectImportedBasePaths(data),
      options.mergeCollectionId,
      options.newCollectionName,
    );

    warnings.push(...collectionImport.warnings);

    data = remapImportedPresetIds(data, collectionImport.swapIdMap, collectionImport.pingIdMap);

    const settingsChanged = importedIcons.changed || collectionImport.changed;

    let markersPath: string | undefined;
    if (effectiveStorage === "json") {
      const baseName = sanitizeFileName(basename(bundle.map.markersPath || `${bundle.bundleName}.markers.json`));
      markersPath = await uniqueVaultPath(
        app,
        normalizePath(`${options.markersRoot}/${baseName || `${sanitizeFileName(bundle.bundleName)}.markers.json`}`),
        reservedPaths,
      );
    }

    for (const asset of bundle.assets ?? []) {
      const entry = files[asset.zipPath];
      if (!entry) {
        throw new Error(`Missing asset in ZIP: ${asset.zipPath}`);
      }

      if (asset.kind === "linked-note") {
        const targetPath = notePathMap.get(asset.originalPath);
        if (!targetPath) continue;

        const rawText = strFromU8(entry);
        const rewrittenText = rewriteImportedNoteText(
          app,
          rawText,
          asset.originalPath,
          bundle.noteResolvedLinks?.[asset.originalPath],
          notePathMap,
		  filePathMap,
          targetPath,
          !!options.stripUnresolvedNoteLinks,
        );
        await writeVaultText(app, targetPath, rewrittenText);
        writtenPaths.push(targetPath);
        continue;
      }

      const targetPath = filePathMap.get(asset.originalPath);
      if (!targetPath) continue;
      await writeVaultBinary(app, targetPath, entry);
      writtenPaths.push(targetPath);
    }

    if (markersPath) {
      await writeVaultText(app, markersPath, JSON.stringify(sanitizeMarkerFileDataForSave(data), null, 2));
      writtenPaths.push(markersPath);
    }

    const originalFramePath =
      typeof bundle.map.yamlObject?.viewportFrame === "string"
        ? bundle.map.yamlObject.viewportFrame.trim()
        : undefined;
    const importedFramePath = originalFramePath
      ? filePathMap.get(originalFramePath)
      : undefined;

    const yaml = rewriteYamlForImport(
      bundle,
      data,
      options.mapId,
      effectiveStorage,
      markersPath,
      importedFramePath,
    );

    if (settingsChanged) {
      await plugin.saveSettings();
    }

    return {
      codeBlock: yaml,
      inlineBlock: effectiveStorage === "note" ? buildInlineStorageBlock(options.mapId, data) : undefined,
      warnings,
    };
  } catch (err) {
    plugin.settings.icons = previousIcons;
    plugin.settings.baseCollections = previousCollections;

    for (let i = writtenPaths.length - 1; i >= 0; i -= 1) {
      try {
        await deleteVaultPathIfExists(app, writtenPaths[i]);
      } catch {
        // ignore rollback cleanup failures
      }
    }

    throw err;
  }
}

export class ExportMapBundleModal extends Modal {
  private plugin: ZoomMapPlugin;
  private map: MapInstance;
  private ctx: MapShareExportContext | null = null;

  private zipName = "zoommap-export";
  private includeLinkedNotes = true;
  private includeRecursiveLinkedNotes = true;
  private includeNoteImages = false;
  private includeNoteVideos = false;
  private includeNotePdfs = false;
  private includeNoteAudio = false;

  private summaryEl: HTMLDivElement | null = null;
  private refreshSummaryToken = 0;

  private includeRecursiveToggleEl: HTMLInputElement | null = null;
  private includeNoteImagesToggleEl: HTMLInputElement | null = null;
  private includeNoteVideosToggleEl: HTMLInputElement | null = null;
  private includeNotePdfsToggleEl: HTMLInputElement | null = null;
  private includeNoteAudioToggleEl: HTMLInputElement | null = null;
  private summaryBodyEl: HTMLDivElement | null = null;
  private summaryStatusEl: HTMLDivElement | null = null;
  private summaryRefreshTimer: number | null = null;
  private summaryMinHeightPx = 0;

  constructor(app: App, plugin: ZoomMapPlugin, map: MapInstance) {
    super(app);
    this.plugin = plugin;
    this.map = map;
  }

  onOpen(): void {
    void this.renderAsync();
  }

  onClose(): void {
    if (this.summaryRefreshTimer !== null) {
      window.clearTimeout(this.summaryRefreshTimer);
      this.summaryRefreshTimer = null;
    }
    this.summaryEl = null;
    this.summaryBodyEl = null;
    this.summaryStatusEl = null;
    this.includeRecursiveToggleEl = null;
    this.includeNoteImagesToggleEl = null;
    this.includeNoteVideosToggleEl = null;
    this.includeNotePdfsToggleEl = null;
    this.includeNoteAudioToggleEl = null;
    this.contentEl.empty();
  }
  
  private currentExportOptions(): ExportOptions {
    return {
      zipName: this.zipName,
      includeLinkedNotes: this.includeLinkedNotes,
      includeRecursiveLinkedNotes: this.includeRecursiveLinkedNotes,
      includeNoteImages: this.includeNoteImages,
      includeNoteVideos: this.includeNoteVideos,
      includeNotePdfs: this.includeNotePdfs,
      includeNoteAudio: this.includeNoteAudio,
    };
  }

  private applyLinkedNotesToggleState(): void {
    const disabled = !this.includeLinkedNotes;
    if (this.includeRecursiveToggleEl) this.includeRecursiveToggleEl.disabled = disabled;
    if (this.includeNoteImagesToggleEl) this.includeNoteImagesToggleEl.disabled = disabled;
    if (this.includeNoteVideosToggleEl) this.includeNoteVideosToggleEl.disabled = disabled;
    if (this.includeNotePdfsToggleEl) this.includeNotePdfsToggleEl.disabled = disabled;
    if (this.includeNoteAudioToggleEl) this.includeNoteAudioToggleEl.disabled = disabled;
  }
  
  private setSummaryBusyState(text: string): void {
    if (!this.summaryStatusEl) return;
    this.summaryStatusEl.setText(text);
  }

  private updateSummaryMinHeight(): void {
    if (!this.summaryBodyEl) return;
    const h = Math.ceil(this.summaryBodyEl.getBoundingClientRect().height);
    if (h > this.summaryMinHeightPx) {
      this.summaryMinHeightPx = h;
      this.summaryBodyEl.style.minHeight = `${this.summaryMinHeightPx}px`;
    }
  }

  private scheduleRefreshSummary(delay = 160): void {
    if (!this.summaryEl || !this.ctx) return;

    if (this.summaryRefreshTimer !== null) {
      window.clearTimeout(this.summaryRefreshTimer);
    }

    //this.setSummaryBusyState("Updating…");

    this.summaryRefreshTimer = window.setTimeout(() => {
      this.summaryRefreshTimer = null;
      void this.refreshSummary();
    }, delay);
  }

  private async refreshSummary(): Promise<void> {
    if (!this.summaryEl || !this.summaryBodyEl || !this.ctx) return;

    const token = ++this.refreshSummaryToken;
    const summaryBodyEl = this.summaryBodyEl;

    this.updateSummaryMinHeight();
    //this.setSummaryBusyState("Updating…");

    try {
      const prepared = await prepareExportData(
        this.app,
        this.plugin,
        this.ctx,
        this.currentExportOptions(),
      );

      if (token !== this.refreshSummaryToken || this.summaryBodyEl !== summaryBodyEl) return;

      summaryBodyEl.empty();
      const lines = buildExportSummaryLines(this.ctx.storageMode, prepared);
      for (const line of lines) {
        summaryBodyEl.createDiv({ text: line }).addClass("zoommap-muted");
      }
      this.updateSummaryMinHeight();
      this.setSummaryBusyState("");
    } catch (err) {
      if (token !== this.refreshSummaryToken || this.summaryBodyEl !== summaryBodyEl) return;

      summaryBodyEl.empty();
      summaryBodyEl.createDiv({
          text: `Summary update failed: ${err instanceof Error ? err.message : String(err)}`,
        })
        .addClass("zoommap-muted");
      this.updateSummaryMinHeight();
      this.setSummaryBusyState("");
    }
  }

  private async renderAsync(): Promise<void> {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Export map package" });

    this.ctx = await this.map.buildShareExportContext();
    if (!this.ctx) {
      contentEl.createDiv({
        text: "Could not read the current zoommap block. Please save the note and try again.",
      });
      const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
      footer.createEl("button", { text: "Close" }).onclick = () => this.close();
      return;
    }

    const suggested = sanitizeFileName(fileStem(this.ctx.sourcePath) || this.map.getMapId() || "zoommap-export");
    if (!this.zipName.trim()) {
      this.zipName = suggested || "zoommap-export";
    }

    new Setting(contentEl)
      .setName("ZIP name")
      .setDesc("The exported file will be downloaded as a ZIP.")
      .addText((t) => {
        t.setPlaceholder("zoommap-export");
        t.setValue(this.zipName);
        t.onChange((v) => {
          this.zipName = sanitizeFileName(v) || suggested || "zoommap-export";
        });
      });

    new Setting(contentEl)
      .setName("Include linked notes from pins")
      .setDesc("Copies linked .md files referenced by pins, swap-pin frames and imported icon default links.")
      .addToggle((tg) => {
        tg.setValue(this.includeLinkedNotes).onChange((on) => {
          this.includeLinkedNotes = on;
          this.applyLinkedNotesToggleState();
          this.scheduleRefreshSummary();
        });
      });
	  
    new Setting(contentEl)
      .setName("Follow note links recursively")
      .setDesc("Also include notes that are linked inside already included notes.")
      .addToggle((tg) => {
        tg.setValue(this.includeRecursiveLinkedNotes).onChange((on) => {
          this.includeRecursiveLinkedNotes = on;
          this.scheduleRefreshSummary();
        });
        this.includeRecursiveToggleEl = tg.toggleEl;
        tg.setDisabled(!this.includeLinkedNotes);
      });

    new Setting(contentEl)
      .setName("Include note images")
      .setDesc("Exports image files referenced inside included notes.")
      .addToggle((tg) => {
        tg.setValue(this.includeNoteImages).onChange((on) => {
          this.includeNoteImages = on;
          this.scheduleRefreshSummary();
        });
        this.includeNoteImagesToggleEl = tg.toggleEl;
        tg.setDisabled(!this.includeLinkedNotes);
      });

    new Setting(contentEl)
      .setName("Include note videos")
      .setDesc("Exports video files referenced inside included notes.")
      .addToggle((tg) => {
        tg.setValue(this.includeNoteVideos).onChange((on) => {
          this.includeNoteVideos = on;
          this.scheduleRefreshSummary();
        });
        this.includeNoteVideosToggleEl = tg.toggleEl;
        tg.setDisabled(!this.includeLinkedNotes);
      });

    new Setting(contentEl)
      .setName("Include note PDFs")
      .setDesc("Exports PDF files referenced inside included notes.")
      .addToggle((tg) => {
        tg.setValue(this.includeNotePdfs).onChange((on) => {
          this.includeNotePdfs = on;
          this.scheduleRefreshSummary();
        });
        this.includeNotePdfsToggleEl = tg.toggleEl;
        tg.setDisabled(!this.includeLinkedNotes);
      });

    new Setting(contentEl)
      .setName("Include note audio")
      .setDesc("Exports audio files referenced inside included notes.")
      .addToggle((tg) => {
        tg.setValue(this.includeNoteAudio).onChange((on) => {
          this.includeNoteAudio = on;
          this.scheduleRefreshSummary();
        });
        this.includeNoteAudioToggleEl = tg.toggleEl;
        tg.setDisabled(!this.includeLinkedNotes);
      });

    this.summaryEl = contentEl.createDiv();
    this.summaryEl.createEl("h3", { text: "Summary" });
    this.summaryBodyEl = this.summaryEl.createDiv();
    this.summaryStatusEl = this.summaryEl.createDiv();
    this.summaryStatusEl.addClass("zoommap-muted");

    this.applyLinkedNotesToggleState();
    await this.refreshSummary();

    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const exportBtn = footer.createEl("button", { text: "Export" });
    const cancelBtn = footer.createEl("button", { text: "Cancel" });

    exportBtn.onclick = () => {
      void this.runExport();
    };
    cancelBtn.onclick = () => this.close();
  }

  private async runExport(): Promise<void> {
    if (!this.ctx) return;

    try {
      const fileName = `${sanitizeFileName(this.zipName || "zoommap-export") || "zoommap-export"}.zip`;
      new Notice("Building map package…", 2000);
      const prepared = await prepareExportData(this.app, this.plugin, this.ctx, {
        zipName: sanitizeFileName(this.zipName || "zoommap-export") || "zoommap-export",
        includeLinkedNotes: this.includeLinkedNotes,
        includeRecursiveLinkedNotes: this.includeRecursiveLinkedNotes,
        includeNoteImages: this.includeNoteImages,
        includeNoteVideos: this.includeNoteVideos,
        includeNotePdfs: this.includeNotePdfs,
        includeNoteAudio: this.includeNoteAudio,
      });
      const bytes = await buildBundleBytes(this.app, this.plugin, this.ctx, {
        zipName: sanitizeFileName(this.zipName || "zoommap-export") || "zoommap-export",
        includeLinkedNotes: this.includeLinkedNotes,
        includeRecursiveLinkedNotes: this.includeRecursiveLinkedNotes,
        includeNoteImages: this.includeNoteImages,
        includeNoteVideos: this.includeNoteVideos,
        includeNotePdfs: this.includeNotePdfs,
        includeNoteAudio: this.includeNoteAudio,
      }, prepared);
      downloadZip(fileName, bytes);
      new Notice(`Export ready: ${fileName}`, 2500);
      this.close();
    } catch (err) {
      console.error(err);
      new Notice(`Export failed: ${err instanceof Error ? err.message : String(err)}`, 5000);
    }
  }
}

export class ImportMapBundleModal extends Modal {
  private plugin: ZoomMapPlugin;
  private editor: Editor;
  private view: MarkdownView;

  private selectedFile: File | null = null;
  private loaded: LoadedBundle | null = null;

  private storageMode: StorageImportMode = "match-export";
  private assetsRoot = "ZoomMap/Imports/assets";
  private drawingsRoot = "ZoomMap/Imports/drawings";
  private notesRoot = "ZoomMap/Imports/notes";
  private markersRoot = "ZoomMap/Imports/data";
  private collectionMode: CollectionImportMode = "create";
  private mergeCollectionId = "";
  private newCollectionName = "Imported map";
  private stripUnresolvedNoteLinks = false;

  constructor(
    app: App,
    plugin: ZoomMapPlugin,
    editor: Editor,
    view: MarkdownView,
  ) {
    super(app);
    this.plugin = plugin;
    this.editor = editor;
    this.view = view;
  }
  
  private getImportDefaults(): {
    assetsRoot: string;
    drawingsRoot: string;
    notesRoot: string;
    markersRoot: string;
  } {
    const safeBundleName =
      sanitizeFileName(this.loaded?.bundle.bundleName || fileStem(this.selectedFile?.name ?? "import")) ||
      "import";

    return {
      assetsRoot: `ZoomMap/Imports/${safeBundleName}/assets`,
      drawingsRoot: `ZoomMap/Imports/${safeBundleName}/drawings`,
      notesRoot: `ZoomMap/Imports/${safeBundleName}/notes`,
      markersRoot: `ZoomMap/Imports/${safeBundleName}/data`,
    };
  }

  private openFolderPicker(onPick: (path: string) => void): void {
    new FolderSuggestModal(this.app, (folder) => {
      onPick(folder.path);
    }).open();
  }

  onOpen(): void {
    this.render();
  }

  onClose(): void {
    this.contentEl.empty();
  }

  private render(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Import map package" });

    const pickerWrap = contentEl.createDiv();
    pickerWrap.createDiv({ text: "ZIP file" });

    const fileInput = pickerWrap.createEl("input");
    fileInput.type = "file";
    fileInput.accept = ".zip,application/zip";
    fileInput.addEventListener("change", () => {
      const file = fileInput.files?.[0] ?? null;
      if (!file) return;
      void this.loadSelectedFile(file);
    });

    if (this.selectedFile) {
      pickerWrap.createDiv({ text: `Selected: ${this.selectedFile.name}` }).addClass("zoommap-muted");
    }

    if (!this.loaded) {
      const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
      footer.createEl("button", { text: "Cancel" }).onclick = () => this.close();
      return;
    }

    const bundle = this.loaded.bundle;
    const defaults = this.getImportDefaults();
    this.assetsRoot = this.assetsRoot.trim() || defaults.assetsRoot;
    this.drawingsRoot = this.drawingsRoot.trim() || defaults.drawingsRoot;
    this.notesRoot = this.notesRoot.trim() || defaults.notesRoot;
    this.markersRoot = this.markersRoot.trim() || defaults.markersRoot;

    contentEl.createEl("h3", { text: "Summary" });
    for (const line of parseBundleSummary(bundle)) {
      contentEl.createDiv({ text: line }).addClass("zoommap-muted");
    }

    const warningWrap = contentEl.createDiv();
    const warnings: string[] = [];
    if (bundle.warnings.hasDrawings && !this.plugin.settings.enableDrawing) {
      warnings.push("This package contains drawings, but drawings are disabled in your settings.");
    }
    if (bundle.warnings.hasTextLayers && !this.plugin.settings.enableTextLayers) {
      warnings.push("This package contains text layers, but text layers are disabled in your settings.");
    }
    if ((bundle.warnings.customFonts ?? []).length > 0) {
      warnings.push(`Fonts are not installed automatically: ${bundle.warnings.customFonts.join(", ")}`);
    }
    if (bundle.warnings.usesCustomUnits) {
      warnings.push("Custom travel/measurement units are not imported automatically.");
    }
    for (const line of warnings) {
      warningWrap.createDiv({ text: `• ${line}` }).addClass("zoommap-muted");
    }

    contentEl.createEl("h3", { text: "Import options" });

    new Setting(contentEl)
      .setName("Import storage mode")
      .setDesc("Import as JSON beside the map or inline inside the current note.")
      .addDropdown((d) => {
        d.addOption("match-export", `Match export (${bundle.map.storageMode})`);
        d.addOption("json", "JSON file");
        d.addOption("note", "Inline in note");
        d.setValue(this.storageMode);
        d.onChange((v) => {
          if (v === "json" || v === "note" || v === "match-export") {
            this.storageMode = v;
            this.render();
          }
        });
      });

    new Setting(contentEl)
      .setName("Assets folder")
      .setDesc("Base images, overlays, frame image and sticker images are copied here.")
      .addText((t) => {
        t.setPlaceholder(defaults.assetsRoot);
        t.setValue(this.assetsRoot);
        t.onChange((v) => {
          const next = v.trim() || defaults.assetsRoot;
          this.assetsRoot = next;
          if (!v.trim()) t.setValue(next);
        });
	  
      })
      .addButton((b) => {
        b.setButtonText("Pick…").onClick(() => {
          this.openFolderPicker((path) => {
            this.assetsRoot = path.trim() || defaults.assetsRoot;
            this.render();
          });
        });
      });

    new Setting(contentEl)
      .setName("Drawings folder")
      .setDesc("Pattern SVG files are copied here.")
      .addText((t) => {
        t.setPlaceholder(defaults.drawingsRoot);
        t.setValue(this.drawingsRoot);
        t.onChange((v) => {
          const next = v.trim() || defaults.drawingsRoot;
          this.drawingsRoot = next;
          if (!v.trim()) t.setValue(next);
        });
	  
      })
      .addButton((b) => {
        b.setButtonText("Pick…").onClick(() => {
          this.openFolderPicker((path) => {
            this.drawingsRoot = path.trim() || defaults.drawingsRoot;
            this.render();
          });
        });
      });

    new Setting(contentEl)
      .setName("Notes folder")
      .setDesc("Imported linked note files are copied here.")
      .addText((t) => {
        t.setPlaceholder(defaults.notesRoot);
        t.setValue(this.notesRoot);
        t.onChange((v) => {
          const next = v.trim() || defaults.notesRoot;
          this.notesRoot = next;
          if (!v.trim()) t.setValue(next);
        });
		
      })
      .addButton((b) => {
        b.setButtonText("Pick…").onClick(() => {
          this.openFolderPicker((path) => {
            this.notesRoot = path.trim() || defaults.notesRoot;
            this.render();
          });
        });
      });
	  
    new Setting(contentEl)
      .setName("Remove unresolved links inside imported notes")
      .setDesc("If enabled, links inside imported note files that were not imported will be converted to plain text instead of keeping broken links.")
      .addToggle((tg) => {
        tg.setValue(this.stripUnresolvedNoteLinks).onChange((on) => {
          this.stripUnresolvedNoteLinks = on;
        });
      });
	  

    if ((this.storageMode === "json") || (this.storageMode === "match-export" && bundle.map.storageMode === "json")) {
      new Setting(contentEl)
        .setName("Marker JSON folder")
        .setDesc("The marker.json is copied here when importing as JSON.")
        .addText((t) => {
          t.setPlaceholder(defaults.markersRoot);
          t.setValue(this.markersRoot);
          t.onChange((v) => {
            const next = v.trim() || defaults.markersRoot;
            this.markersRoot = next;
            if (!v.trim()) t.setValue(next);
          });
        })
        .addButton((b) => {
          b.setButtonText("Pick…").onClick(() => {
            this.openFolderPicker((path) => {
              this.markersRoot = path.trim() || defaults.markersRoot;
              this.render();
            });
          });
        });
    }

    const hasCollectionSubset =
      (bundle.collectionSubset?.swapPins?.length ?? 0) > 0 ||
      (bundle.collectionSubset?.pingPins?.length ?? 0) > 0 ||
      (bundle.collectionSubset?.pinKeys?.length ?? 0) > 0 ||
      (bundle.collectionSubset?.stickers?.length ?? 0) > 0;

    if (hasCollectionSubset) {
      const collections = existingCollectionOptions(this.plugin);

      new Setting(contentEl)
        .setName("Collection import")
        .setDesc("Used items from collections can be merged into an existing collection or imported into a new one.")
        .addDropdown((d) => {
          d.addOption("create", "Create new collection");
          d.addOption("merge", "Merge into existing collection");
          d.addOption("none", "Do not import collection items");
          d.setValue(this.collectionMode);
          d.onChange((v) => {
            if (v === "create" || v === "merge" || v === "none") {
              this.collectionMode = v;
              this.render();
            }
          });
        });

      if (this.collectionMode === "create") {
        new Setting(contentEl)
          .setName("New collection name")
          .addText((t) => {
            t.setPlaceholder(bundle.collectionSubset?.suggestedName ?? "Imported map");
            t.setValue(this.newCollectionName);
            t.onChange((v) => {
              this.newCollectionName = v.trim() || bundle.collectionSubset?.suggestedName || "Imported map";
            });
          });
      }

      if (this.collectionMode === "merge") {
        new Setting(contentEl)
          .setName("Target collection")
          .addDropdown((d) => {
            for (const opt of collections) d.addOption(opt.id, opt.name);
            d.setValue(this.mergeCollectionId || collections[0]?.id || "");
            d.onChange((v) => {
              this.mergeCollectionId = v;
            });
          });
      }
    }

    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const importBtn = footer.createEl("button", { text: "Import" });
    const cancelBtn = footer.createEl("button", { text: "Cancel" });

    importBtn.onclick = () => {
      void this.runImport();
    };
    cancelBtn.onclick = () => this.close();
  }

  private async loadSelectedFile(file: File): Promise<void> {
    try {
      this.selectedFile = file;
      this.loaded = await loadBundleFromFile(file);

      const defaults = this.getImportDefaults();
      this.assetsRoot = defaults.assetsRoot;
      this.drawingsRoot = defaults.drawingsRoot;
      this.notesRoot = defaults.notesRoot;
      this.markersRoot = defaults.markersRoot;
      const safeBundleName =
        sanitizeFileName(this.loaded.bundle.bundleName || fileStem(file.name)) || "import";
      this.newCollectionName =
        this.loaded.bundle.collectionSubset?.suggestedName || `Imported ${safeBundleName}`;

      const firstCollection = existingCollectionOptions(this.plugin)[0];
      this.mergeCollectionId = firstCollection?.id ?? "";

      this.render();
    } catch (err) {
      console.error(err);
      new Notice(`Import file could not be read: ${err instanceof Error ? err.message : String(err)}`, 5000);
    }
  }

  private async runImport(): Promise<void> {
    if (!this.loaded) return;
    if (!this.view.file) {
      new Notice("Please import into a saved note.", 3000);
      return;
    }

    try {
	  const defaults = this.getImportDefaults();
      const mapId = nextUniqueMapId(this.editor, this.loaded.bundle.map.mapId);
      const prepared = await importBundleToVault(this.app, this.plugin, this.loaded, {
        targetNotePath: this.view.file.path,
        mapId,
        storageMode: this.storageMode,
        assetsRoot: this.assetsRoot.trim() || defaults.assetsRoot,
        drawingsRoot: this.drawingsRoot.trim() || defaults.drawingsRoot,
        notesRoot: this.notesRoot.trim() || defaults.notesRoot,
        markersRoot: this.markersRoot.trim() || defaults.markersRoot,
        collectionMode: this.collectionMode,
        mergeCollectionId: this.mergeCollectionId,
        newCollectionName: this.newCollectionName,
		stripUnresolvedNoteLinks: this.stripUnresolvedNoteLinks,
      });

      const insertText = quoteAwareInsertionText(
        this.editor,
        prepared.codeBlock,
        prepared.inlineBlock,
      );

      this.editor.replaceRange(insertText, this.editor.getCursor());

      const allWarnings = prepared.warnings;
      if (allWarnings.length > 0) {
        new Notice(allWarnings.join("\n"), 9000);
      } else {
        new Notice("Map package imported.", 2500);
      }

      this.close();
    } catch (err) {
      console.error(err);
      new Notice(`Import failed: ${err instanceof Error ? err.message : String(err)}`, 6000);
    }
  }
}