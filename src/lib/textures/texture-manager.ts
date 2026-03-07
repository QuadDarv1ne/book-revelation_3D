/**
 * Оптимизированный менеджер текстур
 * - Ленивая загрузка (lazy loading)
 * - Кэширование загруженных текстур
 * - Предзагрузка для быстрой смены книг
 * - Очистка неиспользуемых текстур из памяти
 */

import * as THREE from "three";

interface TextureCacheEntry {
  texture: THREE.Texture;
  lastUsed: number;
  loadComplete: boolean;
  promise?: Promise<THREE.Texture>;
}

class TextureManager {
  private cache = new Map<string, TextureCacheEntry>();
  private maxCacheSize = 10; // Максимум текстур в кэше
  private placeholderCache = new Map<string, THREE.Texture>();
  
  // Статистика для отладки
  public stats = {
    hits: 0,
    misses: 0,
    loads: 0,
    cacheSize: 0
  };

  /**
   * Получить текстуру с ленивой загрузкой и кэшированием
   */
  getTexture(imagePath: string, type: 'cover' | 'spine' | 'back'): THREE.Texture {
    const cacheKey = `${type}-${imagePath}`;
    const cached = this.cache.get(cacheKey);
    
    // Текстура уже загружена
    if (cached && cached.loadComplete) {
      this.stats.hits++;
      cached.lastUsed = Date.now();
      return cached.texture;
    }
    
    // Текстура в процессе загрузки
    if (cached && cached.promise) {
      this.stats.hits++;
      cached.lastUsed = Date.now();
      return this.getPlaceholder(type);
    }
    
    // Кэш полон, очищаем старые текстуры
    if (this.cache.size >= this.maxCacheSize) {
      this.evictOldestTextures();
    }
    
    this.stats.misses++;
    
    // Создаём placeholder
    const placeholder = this.getPlaceholder(type);
    
    // Начинаем загрузку
    const promise = this.loadTexture(imagePath);
    
    // Сохраняем в кэш
    this.cache.set(cacheKey, {
      texture: placeholder,
      lastUsed: Date.now(),
      loadComplete: false,
      promise
    });
    
    this.stats.cacheSize = this.cache.size;
    
    return placeholder;
  }

  /**
   * Предзагрузка текстур для книги
   */
  async preloadBookTextures(
    coverImage: string,
    spineImage: string,
    backCoverImage: string
  ): Promise<void> {
    const textures = [
      { path: coverImage, type: 'cover' as const },
      { path: spineImage, type: 'spine' as const },
      { path: backCoverImage, type: 'back' as const }
    ];
    
    const loadPromises = textures.map(({ path, type }) => {
      const cacheKey = `${type}-${path}`;
      if (this.cache.has(cacheKey)) return Promise.resolve();
      
      return this.loadTexture(path).then(texture => {
        this.cache.set(cacheKey, {
          texture,
          lastUsed: Date.now(),
          loadComplete: true
        });
      }).catch(() => {
        // Игнорируем ошибки предзагрузки
      });
    });
    
    await Promise.all(loadPromises);
  }

  /**
   * Загрузка текстуры с оптимизациями
   */
  private loadTexture(imagePath: string): Promise<THREE.Texture> {
    this.stats.loads++;
    
    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader();
      
      loader.load(
        imagePath,
        (texture) => {
          // Оптимизации для производительности
          texture.anisotropy = 4; // Уменьшено с 8 для производительности
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.generateMipmaps = true;
          texture.minFilter = THREE.LinearMipMapLinearFilter;
          texture.magFilter = THREE.LinearFilter;
          
          // Обновляем кэш
          const entry = this.findEntryByPath(imagePath);
          if (entry) {
            entry.texture = texture;
            entry.loadComplete = true;
            entry.promise = undefined;
          }
          
          resolve(texture);
        },
        undefined,
        (error) => {
          console.warn(`Failed to load texture: ${imagePath}`, error);
          
          // Создаём fallback текстуру
          const fallback = this.getPlaceholder('cover');
          const entry = this.findEntryByPath(imagePath);
          if (entry) {
            entry.texture = fallback;
            entry.loadComplete = true;
            entry.promise = undefined;
          }
          
          reject(error);
        }
      );
    });
  }

  /**
   * Очистка старых текстур из кэша
   */
  private evictOldestTextures() {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 минут
    
    const entries = Array.from(this.cache.entries())
      .filter(([_, entry]) => now - entry.lastUsed > maxAge)
      .sort((a, b) => a[1].lastUsed - b[1].lastUsed);
    
    // Удаляем половину старых текстур
    const toRemove = entries.slice(0, Math.floor(entries.length / 2));
    
    for (const [key, entry] of toRemove) {
      // Освобождаем память
      if (entry.texture && !(entry.texture instanceof THREE.DataTexture)) {
        entry.texture.dispose();
      }
      this.cache.delete(key);
    }
    
    this.stats.cacheSize = this.cache.size;
  }

  /**
   * Получить placeholder текстуру
   */
  private getPlaceholder(type: 'cover' | 'spine' | 'back'): THREE.Texture {
    const cacheKey = `placeholder-${type}`;
    const cached = this.placeholderCache.get(cacheKey);
    if (cached) return cached;
    
    const placeholder = type === 'spine' 
      ? this.createPlaceholderSpineTexture()
      : this.createPlaceholderCoverTexture();
    
    this.placeholderCache.set(cacheKey, placeholder);
    return placeholder;
  }

  /**
   * Найти запись в кэше по пути
   */
  private findEntryByPath(_imagePath: string): TextureCacheEntry | undefined {
    for (const entry of this.cache.values()) {
      if (entry.promise) {
        return entry;
      }
    }
    return undefined;
  }

  /**
   * Создать placeholder для обложки
   */
  private createPlaceholderCoverTexture(): THREE.CanvasTexture {
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

  /**
   * Создать placeholder для корешка
   */
  private createPlaceholderSpineTexture(): THREE.CanvasTexture {
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
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(4, canvas.height - 11);
    ctx.lineTo(canvas.width - 4, canvas.height - 11);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /**
   * Очистить весь кэш
   */
  clear() {
    for (const [_, entry] of this.cache.entries()) {
      if (entry.texture && !(entry.texture instanceof THREE.DataTexture)) {
        entry.texture.dispose();
      }
    }
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, loads: 0, cacheSize: 0 };
  }

  /**
   * Получить статистику
   */
  getStats() {
    return { ...this.stats };
  }
}

// Глобальный экземпляр
export const textureManager = new TextureManager();

// Обратная совместимость
export function loadRealBookCoverTexture(imagePath: string): THREE.Texture {
  return textureManager.getTexture(imagePath, 'cover');
}

export function loadRealSpineTexture(imagePath: string): THREE.Texture {
  return textureManager.getTexture(imagePath, 'spine');
}

export function loadRealBackCoverTexture(imagePath: string): THREE.Texture {
  return textureManager.getTexture(imagePath, 'back');
}
