/**
 * Утилиты для оптимизации 3D моделей и текстур
 * Draco compression, texture optimization, LOD management
 */

import * as THREE from 'three';

// Инициализация DRACO loader
let dracoLoader: unknown = null;

export function getDRACOLoader(): unknown {
  if (!dracoLoader) {
    // DRACOLoader загружается динамически через THREE
    const DRACOLoaderClass = (THREE as unknown as { DRACOLoader?: new () => unknown }).DRACOLoader;
    if (!DRACOLoaderClass) {
      throw new Error('DRACOLoader not available');
    }
    dracoLoader = new DRACOLoaderClass();
    const loader = dracoLoader as { setDecoderPath?: (path: string) => void; setDecoderConfig?: (config: unknown) => void };
    if (loader.setDecoderPath && loader.setDecoderConfig) {
      loader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
      loader.setDecoderConfig({ type: 'js' });
    }
  }
  return dracoLoader;
}

/**
 * Оптимизация геометрии для производительности
 */
export function optimizeGeometry(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
  // Центрируем геометрию
  geometry.center();
  
  // Вычисляем нормали если нет
  if (!geometry.attributes.normal) {
    geometry.computeVertexNormals();
  }
  
  // Вычисляем касательные если нет (для нормал маппинга)
  if (!geometry.attributes.tangent && geometry.attributes.uv) {
    geometry.computeTangents();
  }
  
  // Оптимизируем индексы
  const indices = geometry.getIndex();
  if (indices) {
    const optimized = geometry.toNonIndexed();
    geometry.dispose();
    return optimized;
  }
  
  return geometry;
}

/**
 * Создание упрощенной версии геометрии для LOD
 */
export function createLODGeometry(
  geometry: THREE.BufferGeometry,
  levels: number[] = [1, 0.5, 0.25]
): THREE.BufferGeometry[] {
  return levels.map((ratio) => {
    if (ratio >= 1) return geometry.clone();
    
    // Упрощение через уменьшение количества вершин
    const simplified = geometry.clone();
    const positionAttribute = simplified.attributes.position;
    const newCount = Math.floor(positionAttribute.count * ratio);
    
    // Простое прореживание вершин (для production лучше использовать meshopt simplifier)
    const newPositions = new Float32Array(newCount * 3);
    const step = Math.floor(positionAttribute.count / newCount);
    
    for (let i = 0; i < newCount; i++) {
      const srcIndex = i * step;
      newPositions[i * 3] = positionAttribute.getX(srcIndex);
      newPositions[i * 3 + 1] = positionAttribute.getY(srcIndex);
      newPositions[i * 3 + 2] = positionAttribute.getZ(srcIndex);
    }
    
    simplified.setAttribute(
      'position',
      new THREE.BufferAttribute(newPositions, 3)
    );
    
    simplified.computeVertexNormals();
    return simplified;
  });
}

/**
 * Оптимизация текстур для разных устройств
 */
export interface TextureOptimizationOptions {
  maxSize?: number;
  format?: number;
  generateMipmaps?: boolean;
  minFilter?: number;
  anisotropy?: number;
}

export function optimizeTexture(
  texture: THREE.Texture,
  options: TextureOptimizationOptions = {}
): THREE.Texture {
  const {
    maxSize = 2048,
    format = THREE.RGBAFormat,
    generateMipmaps = true,
    minFilter = THREE.LinearMipmapLinearFilter,
    anisotropy = 4
  } = options;

  // @ts-expect-error - формат текстуры
  texture.format = format;
  texture.generateMipmaps = generateMipmaps;
  // @ts-expect-error - фильтр текстуры
  texture.minFilter = minFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = anisotropy;

  // Ограничение максимального размера
  if (texture.image) {
    const image = texture.image as HTMLImageElement | HTMLCanvasElement;
    const maxDim = Math.max(image.width, image.height);
    if (maxDim > maxSize) {
      console.warn(`Texture ${texture.name || 'unnamed'} is larger than ${maxSize}px`);
    }
  }

  texture.needsUpdate = true;
  return texture;
}

/**
 * Создание оптимизированного материала
 */
export function createOptimizedMaterial(
  options: {
    map?: THREE.Texture | null;
    color?: string | number;
    roughness?: number;
    metalness?: number;
    transparent?: boolean;
    opacity?: number;
  } = {}
): THREE.MeshStandardMaterial {
  const {
    map = null,
    color = 0xffffff,
    roughness = 0.5,
    metalness = 0.5,
    transparent = false,
    opacity = 1
  } = options;

  return new THREE.MeshStandardMaterial({
    map,
    color,
    roughness,
    metalness,
    transparent,
    opacity,
    // Оптимизации
    precision: 'mediump',
    forceSinglePass: true
  });
}

/**
 * Менеджер LOD (Level of Detail)
 */
export class LODManager {
  private lods = new Map<string, THREE.LOD>();
  private camera: THREE.Camera | null = null;

  setCamera(camera: THREE.Camera) {
    this.camera = camera;
  }

  createLOD(
    geometries: THREE.BufferGeometry[],
    materials: THREE.Material[]
  ): THREE.LOD {
    const lod = new THREE.LOD();
    
    geometries.forEach((geometry, index) => {
      const mesh = new THREE.Mesh(geometry, materials[index] || materials[0]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      // Расстояния для разных уровней детализации
      const distance = index === 0 ? 0 : index === 1 ? 5 : 10;
      lod.addLevel(mesh, distance);
    });
    
    return lod;
  }

  addLOD(id: string, lod: THREE.LOD) {
    this.lods.set(id, lod);
  }

  getLOD(id: string): THREE.LOD | undefined {
    return this.lods.get(id);
  }

  update() {
    if (!this.camera) return;
    this.lods.forEach((lod) => {
      lod.update(this.camera!);
    });
  }

  dispose() {
    this.lods.forEach((lod) => {
      lod.levels.forEach((level) => {
        const mesh = level.object as THREE.Mesh;
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material.dispose();
        }
      });
    });
    this.lods.clear();
  }
}

/**
 * Проверка поддержки WebGL2 и расширений
 */
export function checkWebGLSupport(): {
  webgl2: boolean;
  draco: boolean;
  anisotropy: number;
} {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  
  if (!gl) {
    return { webgl2: false, draco: false, anisotropy: 1 };
  }

  const isWebGL2 = 'webgl2' in canvas;
  
  // Проверка поддержки Draco
  const dracoSupported = typeof WebAssembly !== 'undefined';
  
  // Проверка анизотропной фильтрации
  const extension = gl.getExtension('EXT_texture_filter_anisotropic') ||
                    gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic') ||
                    gl.getExtension('MOZ_EXT_texture_filter_anisotropic');
  
  let maxAnisotropy = 1;
  if (extension) {
    maxAnisotropy = gl.getParameter(extension.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
  }

  return {
    webgl2: isWebGL2,
    draco: dracoSupported,
    anisotropy: maxAnisotropy
  };
}

/**
 * Балансировка качества в зависимости от устройства
 */
export function getQualitySettings(): {
  particleCount: number;
  textureSize: number;
  shadowMapSize: number;
  pixelRatio: [number, number];
} {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
  
  if (isLowEnd) {
    return {
      particleCount: 50,
      textureSize: 512,
      shadowMapSize: 512,
      pixelRatio: [0.5, 1]
    };
  }
  
  if (isMobile) {
    return {
      particleCount: 100,
      textureSize: 1024,
      shadowMapSize: 1024,
      pixelRatio: [1, 1.5]
    };
  }
  
  return {
    particleCount: 200,
    textureSize: 2048,
    shadowMapSize: 2048,
    pixelRatio: [1, 2]
  };
}
