import * as THREE from "three";

interface TextureCacheEntry {
  texture: THREE.Texture;
  loadComplete: boolean;
  promise?: Promise<THREE.Texture>;
  error?: Error;
  lastAccessed: number;
}

interface TextureManagerOptions {
  maxRetries?: number;
  maxCacheSize?: number;
  onTextureLoadError?: (path: string, error: Error) => void;
}

const MAX_CACHE_SIZE = 50;
const PLACEHOLDER_CACHE = new Map<string, THREE.CanvasTexture>();

class TextureManager {
  private cache = new Map<string, TextureCacheEntry>();
  private readonly maxRetries: number;
  private readonly maxCacheSize: number;
  private readonly onTextureLoadError?: (path: string, error: Error) => void;
  private preloadPromises = new Map<string, Promise<THREE.Texture>>();

  constructor(options?: TextureManagerOptions) {
    this.maxRetries = options?.maxRetries ?? 3;
    this.maxCacheSize = options?.maxCacheSize ?? MAX_CACHE_SIZE;
    this.onTextureLoadError = options?.onTextureLoadError;
  }

  getTexture(imagePath: string, type: 'cover' | 'spine' | 'back'): THREE.Texture {
    const cacheKey = `${type}-${imagePath}`;
    const cached = this.cache.get(cacheKey);

    if (cached?.loadComplete) {
      cached.lastAccessed = Date.now();
      return cached.texture;
    }
    if (cached?.promise) return this.getPlaceholder(type);

    const placeholder = this.getPlaceholder(type);
    const promise = this.loadTextureWithRetry(imagePath, this.maxRetries);

    this.cache.set(cacheKey, { 
      texture: placeholder, 
      loadComplete: false, 
      promise,
      lastAccessed: Date.now()
    });
    
    this.pruneCache();
    return placeholder;
  }

  async preloadBookTextures(coverImage: string, spineImage: string, backCoverImage: string): Promise<void> {
    const texturePaths = [
      { key: `cover-${coverImage}`, path: coverImage, type: 'cover' as const },
      { key: `spine-${spineImage}`, path: spineImage, type: 'spine' as const },
      { key: `back-${backCoverImage}`, path: backCoverImage, type: 'back' as const }
    ];

    const results = await Promise.allSettled(
      texturePaths.map(({ path }) => {
        if (!this.preloadPromises.get(path)) {
          this.preloadPromises.set(path, this.loadTextureWithRetry(path, this.maxRetries));
        }
        return this.preloadPromises.get(path)!;
      })
    );

    results.forEach((result, index) => {
      const { key, path, type } = texturePaths[index];
      if (result.status === 'fulfilled') {
        this.cache.set(key, { 
          texture: result.value, 
          loadComplete: true,
          lastAccessed: Date.now()
        });
        this.preloadPromises.delete(path);
      } else {
        const error = result.reason as Error;
        this.cache.set(key, {
          texture: this.getPlaceholder(type),
          loadComplete: true,
          error,
          lastAccessed: Date.now()
        });
        this.preloadPromises.delete(path);
        this.onTextureLoadError?.(path, error);
      }
    });
  }

  private async loadTextureWithRetry(path: string, retries: number): Promise<THREE.Texture> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await this.loadTexture(path);
      } catch (error) {
        lastError = error as Error;
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
        }
      }
    }

    throw lastError ?? new Error(`Failed to load texture: ${path}`);
  }

  private loadTexture(imagePath: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader();

      loader.load(
        imagePath,
        (texture) => {
          texture.anisotropy = 8;
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.generateMipmaps = true;
          texture.minFilter = THREE.LinearMipMapLinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.wrapS = THREE.ClampToEdgeWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
          texture.needsUpdate = true;
          this.completeLoad(imagePath, texture);
          resolve(texture);
        },
        undefined,
        (error) => {
          const fallback = this.getPlaceholder('cover');
          this.completeLoad(imagePath, fallback);
          reject(new Error(`Texture load error: ${imagePath}`, { cause: error }));
        }
      );
    });
  }

  private completeLoad(imagePath: string, texture: THREE.Texture) {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.promise && (key.endsWith(imagePath) || (entry.texture.image as HTMLImageElement)?.src === imagePath)) {
        entry.texture.dispose?.();
        entry.texture = texture;
        entry.loadComplete = true;
        entry.promise = undefined;
        entry.lastAccessed = Date.now();
        break;
      }
    }
  }

  private pruneCache(): void {
    if (this.cache.size <= this.maxCacheSize) return;

    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

    const toDelete = entries.slice(0, entries.length - this.maxCacheSize);
    for (const [key, entry] of toDelete) {
      if (!entry.promise && !(entry.texture instanceof THREE.DataTexture)) {
        entry.texture.dispose();
      }
      this.cache.delete(key);
    }
  }

  private getPlaceholder(type: 'cover' | 'spine' | 'back'): THREE.CanvasTexture {
    const cacheKey = `placeholder-${type}`;
    const cached = PLACEHOLDER_CACHE.get(cacheKey);
    if (cached) return cached;

    const placeholder = type === 'spine' ? this.createSpinePlaceholder() : this.createCoverPlaceholder();
    PLACEHOLDER_CACHE.set(cacheKey, placeholder);
    return placeholder;
  }

  private createCoverPlaceholder(): THREE.CanvasTexture {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 88;
    const ctx = canvas.getContext("2d", { willReadFrequently: false })!;
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#1a0f0a");
    gradient.addColorStop(0.5, "#2a1810");
    gradient.addColorStop(1, "#1a0f0a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 2;
    ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }

  private createSpinePlaceholder(): THREE.CanvasTexture {
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 88;
    const ctx = canvas.getContext("2d", { willReadFrequently: false })!;
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, "#150c08");
    gradient.addColorStop(0.5, "#1a0f0a");
    gradient.addColorStop(1, "#150c08");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(2, 5);
    ctx.lineTo(canvas.width - 2, 5);
    ctx.moveTo(2, canvas.height - 5);
    ctx.lineTo(canvas.width - 2, canvas.height - 5);
    ctx.stroke();
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }

  clear(): void {
    for (const entry of this.cache.values()) {
      if (entry.promise) continue;
      if (!(entry.texture instanceof THREE.DataTexture)) {
        entry.texture.dispose();
      }
    }
    this.cache.clear();
    this.preloadPromises.clear();
  }

  dispose(): void {
    this.clear();
    PLACEHOLDER_CACHE.forEach(texture => texture.dispose());
    PLACEHOLDER_CACHE.clear();
  }

  getCacheStats(): { size: number; loaded: number; pending: number } {
    let loaded = 0;
    let pending = 0;
    for (const entry of this.cache.values()) {
      if (entry.loadComplete) loaded++;
      else if (entry.promise) pending++;
    }
    return { size: this.cache.size, loaded, pending };
  }
}

export const textureManager = new TextureManager({ maxCacheSize: 30 });
