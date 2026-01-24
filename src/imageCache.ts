import type { App, TFile } from "obsidian";

export type CachedImageSource = ImageBitmap | HTMLImageElement;

function isImageBitmapLike(x: unknown): x is ImageBitmap {
  return typeof x === "object" && x !== null && "close" in x && typeof (x as { close: unknown }).close === "function";
}

function approxBytesForSource(src: CachedImageSource): number {
  if (isImageBitmapLike(src)) return src.width * src.height * 4;
  // HTMLImageElement: naturalWidth/Height available after load/decode (usually)
  const w = src.naturalWidth ?? 0;
  const h = src.naturalHeight ?? 0;
  if (w > 0 && h > 0) return w * h * 4;
  return 0;
}

type Entry = {
  src: CachedImageSource;
  bytes: number;
  lastUsed: number;
};

export class ImageCache {
  private app: App;

  private maxBytes: number;
  private readonly startEvictRatio = 0.9;  // start evicting above 90%
  private readonly targetEvictRatio = 0.8; // evict down to 80% (free ~10% headroom)

  private entries = new Map<string, Entry>();
  private refs = new Map<string, number>();
  private loading = new Map<string, Promise<CachedImageSource>>();

  constructor(app: App, maxBytes: number) {
    this.app = app;
    this.maxBytes = Math.max(64 * 1024 * 1024, maxBytes); // min 64MB
  }

  setMaxBytes(maxBytes: number): void {
    this.maxBytes = Math.max(64 * 1024 * 1024, maxBytes);
    this.evictIfNeeded();
  }

  getMaxBytes(): number {
    return this.maxBytes;
  }

  getRefCount(path: string): number {
    return this.refs.get(path) ?? 0;
  }

  getTotalBytes(): number {
    let total = 0;
    for (const e of this.entries.values()) total += e.bytes;
    return total;
  }

  clear(): void {
    for (const [path, e] of this.entries) {
      this.closeEntry(path, e);
    }
    this.entries.clear();
    this.refs.clear();
    this.loading.clear();
  }

  /**
   * Acquire a cached image for the session.
   * - Increments refcount (must be paired with release()).
   * - Loads and decodes at most once per session (per path), unless evicted.
   * - Supports both TFile and network URLs.
   */
  async acquire(fileOrUrl: TFile | string): Promise<CachedImageSource> {
    const key = typeof fileOrUrl === "string" ? fileOrUrl : fileOrUrl.path;

    // refcount first (so even inflight loads are "owned")
    this.refs.set(key, (this.refs.get(key) ?? 0) + 1);

    const existing = this.entries.get(key);
    if (existing) {
      existing.lastUsed = Date.now();
      return existing.src;
    }

    const inflight = this.loading.get(key);
    if (inflight) return inflight;

    const p = this.loadSource(fileOrUrl)
      .then((src) => {
        const bytes = approxBytesForSource(src);
        this.entries.set(key, { src, bytes, lastUsed: Date.now() });
        this.loading.delete(key);
        this.evictIfNeeded();
        return src;
      })
      .catch((err) => {
        this.loading.delete(key);
        // rollback refcount on failed acquire
        this.release(key);
        throw err;
      });

    this.loading.set(key, p);
    return p;
  }

  /**
   * Release a previously acquired image path.
   * Eviction can only happen when refcount == 0 AND cache is above the high watermark.
   */
  release(path: string): void {
    const cur = this.refs.get(path) ?? 0;
    if (cur <= 1) this.refs.delete(path);
    else this.refs.set(path, cur - 1);

    this.evictIfNeeded();
  }

  private async loadSource(fileOrUrl: TFile | string): Promise<CachedImageSource> {
    let url: string;

    // Handle network URLs directly
    if (typeof fileOrUrl === "string" && /^https?:\/\//i.test(fileOrUrl)) {
      url = fileOrUrl;
      
      // Try loading without CORS first
      const tryLoad = async (useCors: boolean): Promise<CachedImageSource> => {
        const img = new Image();
        img.decoding = "async";
        if (useCors) img.crossOrigin = "anonymous";
        img.src = url;

        try {
          await img.decode();
        } catch {
          // decode() can fail even when the image later renders; do not treat as fatal here.
        }

        try {
          return await createImageBitmap(img);
        } catch {
          // Fallback for cases where createImageBitmap is not supported for a format.
          return img;
        }
      };

      try {
        return await tryLoad(false);
      } catch {
        // Retry with CORS if first attempt fails
        return await tryLoad(true);
      }
    } else if (typeof fileOrUrl === "string") {
      // String but not a URL - shouldn't happen in normal usage
      throw new Error("Invalid input: expected TFile or URL");
    } else {
      // TFile - get vault resource path
      url = this.app.vault.getResourcePath(fileOrUrl);
      
      const img = new Image();
      img.decoding = "async";
      img.src = url;

      try {
        await img.decode();
      } catch {
        // decode() can fail even when the image later renders; do not treat as fatal here.
      }

      try {
        return await createImageBitmap(img);
      } catch {
        // Fallback for cases where createImageBitmap is not supported for a format.
        return img;
      }
    }
  }

  private evictIfNeeded(): void {
    const total = this.getTotalBytes();
    const start = this.maxBytes * this.startEvictRatio;
    if (total <= start) return;

    const target = this.maxBytes * this.targetEvictRatio;
    let curTotal = total;

    // Only evict unreferenced entries (all notes/maps using it are closed)
    const candidates = [...this.entries.entries()]
      .filter(([path]) => (this.refs.get(path) ?? 0) === 0)
      .sort((a, b) => a[1].lastUsed - b[1].lastUsed);

    for (const [path, e] of candidates) {
      if (curTotal <= target) break;
      curTotal -= e.bytes;
      this.closeEntry(path, e);
      this.entries.delete(path);
    }
  }

  private closeEntry(path: string, e: Entry): void {
    try {
      if (isImageBitmapLike(e.src)) e.src.close();
    } catch (error) {
      console.warn("Zoom Map: failed to close cached image", { path, error });
    }
  }
}