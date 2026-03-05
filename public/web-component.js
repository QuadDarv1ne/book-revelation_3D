/**
 * Stoic Book 3D Web Component
 * 
 * Использование:
 * <stoic-book-3d src="https://your-domain.com" height="600"></stoic-book-3d>
 */
class StoicBook3D extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['src', 'height', 'theme', 'quotes-count'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.render();
    }
  }

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

  render() {
    const params = new URLSearchParams({
      theme: this.theme,
      quotes: this.quotesCount,
    });

    this._shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: ${this.height}px;
        }
        
        iframe {
          width: 100%;
          height: 100%;
          border: none;
          border-radius: 12px;
          overflow: hidden;
        }

        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: #07070d;
          color: #d4af37;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 14px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(212, 175, 55, 0.3);
          border-top-color: #d4af37;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
      <iframe
        src="${this.src}/?${params.toString()}"
        title="Stoic Book 3D — Интерактивные цитаты"
        loading="lazy"
        allow="gyroscope; accelerometer"
        referrerpolicy="no-referrer"
        sandbox="allow-scripts allow-same-origin allow-pointer-lock"
      ></iframe>
      <div class="loading" hidden>
        <div class="spinner"></div>
      </div>
    `;

    const iframe = this._shadowRoot.querySelector('iframe');
    const loading = this._shadowRoot.querySelector('.loading');

    if (iframe && loading) {
      iframe.addEventListener('load', () => {
        loading.hidden = true;
      });

      iframe.addEventListener('error', () => {
        loading.innerHTML = '<p>Ошибка загрузки 3D модуля</p>';
      });
    }
  }

  // Метод для обновления темы
  setTheme(theme) {
    this.setAttribute('theme', theme);
  }

  // Метод для обновления высоты
  setHeight(height) {
    this.setAttribute('height', height);
  }

  // Метод для паузы/восстановления вращения
  toggleRotation() {
    this._shadowRoot.querySelector('iframe')?.contentWindow?.postMessage(
      { type: 'TOGGLE_ROTATION' },
      this.src
    );
  }
}

// Регистрация компонента
if (!customElements.get('stoic-book-3d')) {
  customElements.define('stoic-book-3d', StoicBook3D);
}

// Экспорт для модульной загрузки
export { StoicBook3D };
