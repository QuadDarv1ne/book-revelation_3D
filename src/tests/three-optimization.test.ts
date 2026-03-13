import { describe, it, expect, vi } from 'vitest';
import * as THREE from 'three';
import {
  optimizeGeometry,
  createLODGeometry,
  optimizeTexture,
  createOptimizedMaterial,
  LODManager,
  checkWebGLSupport,
  getQualitySettings
} from '@/lib/three-optimization';

describe('Three.js Optimization', () => {
  describe('optimizeGeometry', () => {
    it('должен центрировать геометрию', () => {
      const geometry = new THREE.BoxGeometry(2, 2, 2);
      const optimized = optimizeGeometry(geometry);
      
      const positionAttribute = optimized.attributes.position;
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;
      let minZ = Infinity, maxZ = -Infinity;
      
      for (let i = 0; i < positionAttribute.count; i++) {
        minX = Math.min(minX, positionAttribute.getX(i));
        maxX = Math.max(maxX, positionAttribute.getX(i));
        minY = Math.min(minY, positionAttribute.getY(i));
        maxY = Math.max(maxY, positionAttribute.getY(i));
        minZ = Math.min(minZ, positionAttribute.getZ(i));
        maxZ = Math.max(maxZ, positionAttribute.getZ(i));
      }
      
      expect((minX + maxX) / 2).toBeCloseTo(0, 5);
      expect((minY + maxY) / 2).toBeCloseTo(0, 5);
      expect((minZ + maxZ) / 2).toBeCloseTo(0, 5);
    });

    it('должен вычислять нормали если они отсутствуют', () => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array([
        -1, -1, 0,
        1, -1, 0,
        0, 1, 0
      ]);
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      const optimized = optimizeGeometry(geometry);
      
      expect(optimized.attributes.normal).toBeDefined();
      expect(optimized.attributes.normal.count).toBe(3);
    });
  });

  describe('createLODGeometry', () => {
    it('должен создавать несколько уровней детализации', () => {
      const baseGeometry = new THREE.SphereGeometry(1, 32, 32);
      const lodLevels = createLODGeometry(baseGeometry, [1, 0.5, 0.25]);
      
      expect(lodLevels).toHaveLength(3);
      expect(lodLevels[0]).toBeDefined();
      expect(lodLevels[1]).toBeDefined();
      expect(lodLevels[2]).toBeDefined();
    });

    it('должен уменьшать количество вершин на низких уровнях', () => {
      const baseGeometry = new THREE.BoxGeometry(1, 1, 1);
      const baseVertexCount = baseGeometry.attributes.position.count;
      
      const lodLevels = createLODGeometry(baseGeometry, [1, 0.5]);
      
      expect(lodLevels[1].attributes.position.count).toBeLessThanOrEqual(baseVertexCount);
    });
  });

  describe('optimizeTexture', () => {
    it('должен устанавливать параметры оптимизации', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const texture = new THREE.CanvasTexture(canvas);
      
      const optimized = optimizeTexture(texture, {
        maxSize: 512,
        generateMipmaps: true,
        anisotropy: 8
      });
      
      expect(optimized.generateMipmaps).toBe(true);
      expect(optimized.minFilter).toBe(THREE.LinearMipmapLinearFilter);
      expect(optimized.anisotropy).toBe(8);
    });

    it('должен предупреждать о больших текстурах', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const canvas = document.createElement('canvas');
      canvas.width = 4096;
      canvas.height = 4096;
      const texture = new THREE.CanvasTexture(canvas);
      
      optimizeTexture(texture, { maxSize: 2048 });
      
      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });
  });

  describe('createOptimizedMaterial', () => {
    it('должен создавать материал с оптимизациями', () => {
      const material = createOptimizedMaterial({
        color: '#ff0000',
        roughness: 0.3,
        metalness: 0.7,
        transparent: true,
        opacity: 0.8
      });

      expect(material).toBeInstanceOf(THREE.MeshStandardMaterial);
      expect((material as THREE.MeshStandardMaterial).roughness).toBe(0.3);
      expect((material as THREE.MeshStandardMaterial).metalness).toBe(0.7);
      expect((material as THREE.MeshStandardMaterial).transparent).toBe(true);
      expect((material as THREE.MeshStandardMaterial).opacity).toBe(0.8);
    });

    it('должен использовать значения по умолчанию', () => {
      const material = createOptimizedMaterial();

      expect((material as THREE.MeshStandardMaterial).color.getHex()).toBe(0xffffff);
      expect((material as THREE.MeshStandardMaterial).roughness).toBe(0.5);
      expect((material as THREE.MeshStandardMaterial).metalness).toBe(0.5);
    });
  });

  describe('LODManager', () => {
    it('должен создавать и управлять LOD', () => {
      const manager = new LODManager();
      const geometries = [
        new THREE.SphereGeometry(1, 32, 32),
        new THREE.SphereGeometry(1, 16, 16),
        new THREE.SphereGeometry(1, 8, 8)
      ];
      const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });

      const lod = manager.createLOD(geometries, [material]);

      expect(lod).toBeInstanceOf(THREE.LOD);
      expect(lod.levels).toHaveLength(3);
    });

    it('должен добавлять и получать LOD по ID', () => {
      const manager = new LODManager();
      const lod = new THREE.LOD();

      manager.addLOD('test-lod', lod);
      expect(manager.getLOD('test-lod')).toBe(lod);
      expect(manager.getLOD('non-existent')).toBeUndefined();
    });

    it('должен очищать ресурсы при dispose', () => {
      const manager = new LODManager();
      const geometries = [new THREE.BoxGeometry(1, 1, 1)];
      const material = new THREE.MeshStandardMaterial();
      const lod = manager.createLOD(geometries, [material]);

      manager.addLOD('test', lod);
      manager.dispose();

      expect(manager.getLOD('test')).toBeUndefined();
    });
  });

  describe('checkWebGLSupport', () => {
    it('должен возвращать информацию о поддержке WebGL', () => {
      const support = checkWebGLSupport();

      expect(typeof support.webgl2).toBe('boolean');
      expect(typeof support.draco).toBe('boolean');
      expect(typeof support.anisotropy).toBe('number');
      expect(support.anisotropy).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getQualitySettings', () => {
    it('должен возвращать настройки качества', () => {
      const settings = getQualitySettings();

      expect(settings).toHaveProperty('particleCount');
      expect(settings).toHaveProperty('textureSize');
      expect(settings).toHaveProperty('shadowMapSize');
      expect(settings).toHaveProperty('pixelRatio');
      expect(settings.pixelRatio).toHaveLength(2);
    });

    it('должен иметь разумные значения по умолчанию', () => {
      const settings = getQualitySettings();

      expect(settings.particleCount).toBeGreaterThan(0);
      expect(settings.textureSize).toBeGreaterThan(0);
      expect(settings.shadowMapSize).toBeGreaterThan(0);
    });
  });
});
