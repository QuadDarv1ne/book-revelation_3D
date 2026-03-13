import * as THREE from "three";

interface TextureCacheEntry {
  texture: THREE.Texture;
  loadComplete: boolean;
  promise?: Promise<THREE.Texture>;
}

class TextureManager {
  private cache = new Map<string, TextureCacheEntry>();
  private placeholderCache = new Map<string, THREE.Texture>();

  getTexture(imagePath: string, type: 'cover' | 'spine' | 'back'): THREE.Texture {
    const cacheKey = `${type}-${imagePath}`;
    const cached = this.cache.get(cacheKey);

    if (cached?.loadComplete) return cached.texture;
    if (cached?.promise) return this.getPlaceholder(type);

    const placeholder = this.getPlaceholder(type);
    const promise = this.loadTexture(imagePath);

    this.cache.set(cacheKey, { texture: placeholder, loadComplete: false, promise });
    return placeholder;
  }

  async preloadBookTextures(coverImage: string, spineImage: string, backCoverImage: string): Promise<void> {
    await Promise.all([
      this.loadTexture(coverImage).then(t => this.cache.set(`cover-${coverImage}`, { texture: t, loadComplete: true })).catch(() => {}),
      this.loadTexture(spineImage).then(t => this.cache.set(`spine-${spineImage}`, { texture: t, loadComplete: true })).catch(() => {}),
      this.loadTexture(backCoverImage).then(t => this.cache.set(`back-${backCoverImage}`, { texture: t, loadComplete: true })).catch(() => {})
    ]);
  }

  private loadTexture(imagePath: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      new THREE.TextureLoader().load(imagePath,
        (texture) => {
          texture.anisotropy = 4;
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.generateMipmaps = true;
          texture.minFilter = THREE.LinearMipMapLinearFilter;
          texture.magFilter = THREE.LinearFilter;
          this.completeLoad(imagePath, texture);
          resolve(texture);
        },
        undefined,
        (error) => {
          const fallback = this.getPlaceholder('cover');
          this.completeLoad(imagePath, fallback);
          reject(error);
        }
      );
    });
  }

  private completeLoad(imagePath: string, texture: THREE.Texture) {
    for (const entry of this.cache.values()) {
      if (entry.promise) {
        entry.texture = texture;
        entry.loadComplete = true;
        entry.promise = undefined;
        break;
      }
    }
  }

  private getPlaceholder(type: 'cover' | 'spine' | 'back'): THREE.Texture {
    const cached = this.placeholderCache.get(`placeholder-${type}`);
    if (cached) return cached;

    const placeholder = type === 'spine' ? this.createSpinePlaceholder() : this.createCoverPlaceholder();
    this.placeholderCache.set(`placeholder-${type}`, placeholder);
    return placeholder;
  }

  private createCoverPlaceholder(): THREE.CanvasTexture {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 176;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#1a0f0a");
    gradient.addColorStop(0.5, "#2a1810");
    gradient.addColorStop(1, "#1a0f0a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  private createSpinePlaceholder(): THREE.CanvasTexture {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 176;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, "#150c08");
    gradient.addColorStop(0.5, "#1a0f0a");
    gradient.addColorStop(1, "#150c08");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(4, 11);
    ctx.lineTo(canvas.width - 4, 11);
    ctx.moveTo(4, canvas.height - 11);
    ctx.lineTo(canvas.width - 4, canvas.height - 11);
    ctx.stroke();
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  clear() {
    for (const entry of this.cache.values()) {
      if (!(entry.texture instanceof THREE.DataTexture)) entry.texture.dispose();
    }
    this.cache.clear();
    this.placeholderCache.clear();
  }

  dispose() {
    this.clear();
  }
}

export const textureManager = new TextureManager();
