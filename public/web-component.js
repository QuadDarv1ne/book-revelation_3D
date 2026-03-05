/**
 * Stoic Book 3D Web Component v2
 * 
 * @element stoic-book-3d
 * 
 * @attr {string} src - Base URL of the 3D module
 * @attr {string} height - Component height in pixels (default: 600)
 * @attr {string} theme - Theme: 'dark' | 'light' (default: dark)
 * @attr {string} quotes-count - Number of quotes to display (default: 8)
 * @attr {string} language - Language code (default: ru)
 * @attr {boolean} autoplay - Auto-rotate on load (default: true)
 * @attr {string} border-radius - Border radius in pixels (default: 12)
 * @attr {boolean} shadow - Enable box shadow (default: true)
 * 
 * @event ready - Fired when component is loaded
 * @event error - Fired on load error
 * @event quote-change - Fired when active quote changes
 * @event theme-change - Fired when theme changes
 * 
 * @method setTheme - Change theme
 * @method setHeight - Change height
 * @method toggleRotation - Toggle auto-rotation
 * @method setActiveQuote - Set active quote index
 * @method refresh - Reload the iframe
 * 
 * @example
 * <stoic-book-3d 
 *   src="https://your-domain.com" 
 *   height="600"
 *   theme="dark"
 *   quotes-count="8"
 * ></stoic-book-3d>
 */
class StoicBook3D extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: 'open' });
    this._iframe = null;
    this._loading = true;
    this._retryCount = 0;
    this._maxRetries = 3;
    this._messageHandler = null;
  }

  static get observedAttributes() {
    return ['src', 'height', 'theme', 'quotes-count', 'language', 'autoplay', 'border-radius', 'shadow'];
  }

  static get version() {
    return '2.0.0';
  }

  connectedCallback() {
    this.setAttribute('role', 'application');
    this.setAttribute('aria-label', 'Stoic Book 3D — Интерактивные цитаты стоических философов');
    this.render();
    this._setupMessageListener();
    this._dispatchEvent('ready', { version: StoicBook3D.version });
  }

  disconnectedCallback() {
    this._cleanupMessageListener();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this.isConnected) {
      if (['src', 'theme', 'quotes-count', 'language', 'autoplay'].includes(name)) {
        this._debounceRender();
      } else {
        this._updateStyles();
      }
    }
  }

  // Getters
  get src() {
    return this.getAttribute('src') || window.location.origin;
  }

  get height() {
    return this.getAttribute('height') || '600';
  }

  get theme() {
    return this.getAttribute('theme') || 'dark';
  }

  get quotesCount() {
    return this.getAttribute('quotes-count') || '8';
  }

  get language() {
    return this.getAttribute('language') || 'ru';
  }

  get autoplay() {
    return this.getAttribute('autoplay') !== 'false';
  }

  get borderRadius() {
    return this.getAttribute('border-radius') || '12';
  }

  get shadow() {
    return this.getAttribute('shadow') !== 'false';
  }

  // Public methods
  setTheme(theme) {
    this.setAttribute('theme', theme);
  }

  setHeight(height) {
    this.setAttribute('height', height);
  }

  toggleRotation() {
    this._postMessage({ type: 'TOGGLE_ROTATION' });
  }

  setActiveQuote(index) {
    this._postMessage({ type: 'SET_ACTIVE_QUOTE', index });
  }

  refresh() {
    this.render();
  }

  // Private methods
  _postMessage(message) {
    if (this._iframe) {
      this._iframe.contentWindow?.postMessage(message, this.src);
    }
  }

  _setupMessageListener() {
    this._messageHandler = (event) => {
      if (event.origin !== this.src) return;
      
      const { type, detail } = event.data || {};
      
      switch (type) {
        case 'QUOTE_CHANGE':
          this._dispatchEvent('quote-change', detail);
          break;
        case 'THEME_CHANGE':
          this._dispatchEvent('theme-change', detail);
          break;
        case 'LOADED':
          this._loading = false;
          this._hideLoading();
          break;
        case 'ERROR':
          this._handleError(detail);
          break;
      }
    };

    window.addEventListener('message', this._messageHandler);
  }

  _cleanupMessageListener() {
    if (this._messageHandler) {
      window.removeEventListener('message', this._messageHandler);
    }
  }

  _dispatchEvent(name, detail = {}) {
    this.dispatchEvent(new CustomEvent(name, {
      detail,
      bubbles: true,
      composed: true
    }));
  }

  _debounceRender() {
    clearTimeout(this._renderTimeout);
    this._renderTimeout = setTimeout(() => this.render(), 150);
  }

  _handleError(detail) {
    this._retryCount++;
    this._dispatchEvent('error', detail);
    
    if (this._retryCount < this._maxRetries) {
      setTimeout(() => this.render(), 1000 * this._retryCount);
    } else {
      this._showError();
    }
  }

  _hideLoading() {
    const loading = this._shadowRoot.querySelector('.loading');
    if (loading) loading.hidden = true;
  }

  _showError() {
    const loading = this._shadowRoot.querySelector('.loading');
    if (loading) {
      loading.innerHTML = `
        <div class="error">
          <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>Ошибка загрузки модуля</p>
          <button onclick="this.getRootNode().host.refresh()">Попробовать снова</button>
        </div>
      `;
    }
  }

  _getStyles() {
    return `
      <style>
        :host {
          display: block;
          width: 100%;
          height: ${this.height}px;
          --sb3d-primary: #d4af37;
          --sb3d-background: ${this.theme === 'dark' ? '#07070d' : '#faf8f5'};
          --sb3d-radius: ${this.borderRadius}px;
          --sb3d-shadow: ${this.shadow ? '0 10px 40px rgba(0,0,0,0.3)' : 'none'};
        }

        .container {
          width: 100%;
          height: 100%;
          position: relative;
          background: var(--sb3d-background);
          border-radius: var(--sb3d-radius);
          box-shadow: var(--sb3d-shadow);
          overflow: hidden;
        }

        iframe {
          width: 100%;
          height: 100%;
          border: none;
          display: block;
        }

        .loading {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--sb3d-background);
          color: var(--sb3d-primary);
          font-family: system-ui, -apple-system, sans-serif;
          z-index: 10;
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 3px solid rgba(212, 175, 55, 0.2);
          border-top-color: var(--sb3d-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        .loading-text {
          font-size: 14px;
          opacity: 0.8;
        }

        .error {
          text-align: center;
          padding: 20px;
        }

        .error-icon {
          width: 48px;
          height: 48px;
          color: #ef4444;
          margin-bottom: 12px;
        }

        .error p {
          font-size: 14px;
          margin-bottom: 16px;
          color: var(--sb3d-primary);
        }

        .error button {
          padding: 10px 20px;
          background: var(--sb3d-primary);
          color: ${this.theme === 'dark' ? '#000' : '#fff'};
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: opacity 0.2s;
        }

        .error button:hover {
          opacity: 0.8;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .spinner {
            animation: none;
            border-color: var(--sb3d-primary);
          }
        }
      </style>
    `;
  }

  _updateStyles() {
    const host = this._shadowRoot.querySelector(':host');
    if (host) {
      host.style.height = `${this.height}px`;
      host.style.setProperty('--sb3d-background', this.theme === 'dark' ? '#07070d' : '#faf8f5');
      host.style.setProperty('--sb3d-radius', `${this.borderRadius}px`);
      host.style.setProperty('--sb3d-shadow', this.shadow ? '0 10px 40px rgba(0,0,0,0.3)' : 'none');
    }
  }

  render() {
    const params = new URLSearchParams({
      theme: this.theme,
      quotes: this.quotesCount,
      lang: this.language,
      autoplay: this.autoplay.toString(),
      wc: 'true',
    });

    const url = `${this.src}/?${params.toString()}`;

    this._shadowRoot.innerHTML = `
      ${this._getStyles()}
      <div class="container">
        <iframe
          src="${url}"
          title="Stoic Book 3D — Интерактивные цитаты стоических философов"
          loading="lazy"
          allow="gyroscope; accelerometer"
          referrerpolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-pointer-lock"
          aria-label="3D книга с цитатами стоических философов"
        ></iframe>
        <div class="loading" ${!this._loading ? 'hidden' : ''}>
          <div class="spinner"></div>
          <span class="loading-text">Загрузка 3D модуля...</span>
        </div>
      </div>
    `;

    this._iframe = this._shadowRoot.querySelector('iframe');
    this._loading = true;
    this._retryCount = 0;

    // Fallback timeout
    clearTimeout(this._loadTimeout);
    this._loadTimeout = setTimeout(() => {
      if (this._loading) {
        this._hideLoading();
      }
    }, 5000);
  }
}

// Auto-register if not already defined
if (!customElements.get('stoic-book-3d')) {
  customElements.define('stoic-book-3d', StoicBook3D);
}

// Export for module usage
export { StoicBook3D };
