/**
 * Проверка поддержки WebGL в браузере
 */

export interface WebGLInfo {
  supported: boolean;
  version: string;
  renderer: string;
  vendor: string;
  error?: string;
}

export function checkWebGLSupport(): WebGLInfo {
  try {
    const canvas = document.createElement('canvas');
    
    // Пробуем WebGL 2
    let gl: WebGLRenderingContext | WebGL2RenderingContext | null = 
      canvas.getContext('webgl2') as WebGL2RenderingContext | null;
    
    if (gl) {
      const webGL2Info = getWebGLInfo(gl as WebGL2RenderingContext);
      if (webGL2Info.supported) {
        return webGL2Info;
      }
    }
    
    // Пробуем WebGL 1
    gl = canvas.getContext('webgl') as WebGLRenderingContext | null;
    
    if (gl) {
      return getWebGLInfo(gl as WebGLRenderingContext);
    }
    
    // Пробуем экспериментальный WebGL
    gl = canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    
    if (gl) {
      return getWebGLInfo(gl as WebGLRenderingContext);
    }
    
    return {
      supported: false,
      version: 'none',
      renderer: 'none',
      vendor: 'none',
      error: 'WebGL контекст не получен'
    };
  } catch (e) {
    return {
      supported: false,
      version: 'none',
      renderer: 'none',
      vendor: 'none',
      error: e instanceof Error ? e.message : 'Неизвестная ошибка'
    };
  }
}

function getWebGLInfo(gl: WebGLRenderingContext | WebGL2RenderingContext): WebGLInfo {
  // Проверяем, не потерян ли контекст
  if ('isContextLost' in gl && gl.isContextLost()) {
    return {
      supported: false,
      version: 'lost',
      renderer: 'lost',
      vendor: 'lost',
      error: 'Контекст WebGL потерян'
    };
  }
  
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = debugInfo 
    ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) 
    : gl.getParameter(gl.RENDERER);
  const vendor = debugInfo
    ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
    : gl.getParameter(gl.VENDOR);
  
  const isWebGL2 = 'drawBuffers' in gl;
  
  return {
    supported: true,
    version: isWebGL2 ? 'WebGL 2.0' : 'WebGL 1.0',
    renderer: renderer || 'Unknown',
    vendor: vendor || 'Unknown'
  };
}

/**
 * Хук для проверки WebGL поддержки
 */
export function useWebGLCheck() {
  if (typeof window === 'undefined') {
    return {
      supported: false,
      version: 'none',
      renderer: 'none',
      vendor: 'none',
      error: 'SSR mode'
    };
  }
  
  return checkWebGLSupport();
}
