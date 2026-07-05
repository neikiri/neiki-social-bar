/*!
 * Neiki's Social Bar 1.0.0
 * A lightweight, dependency-free social links Web Component.
 * https://github.com/neikiri/neiki-social-bar
 * MIT License
 */
(function () {
  'use strict';

  if (customElements.get('neiki-social-bar')) {
    return;
  }

  var ICONIFY_SRC = 'https://cdn.jsdelivr.net/npm/iconify-icon@2/dist/iconify-icon.min.js';

  /**
   * Loads the Iconify web component script once, regardless of how many
   * neiki-social-bar instances exist on the page.
   */
  function ensureIconLoader() {
    if (customElements.get('iconify-icon')) return;
    if (document.querySelector('script[data-nsb-iconify]')) return;
    var script = document.createElement('script');
    script.src = ICONIFY_SRC;
    script.async = true;
    script.setAttribute('data-nsb-iconify', '');
    (document.head || document.documentElement).appendChild(script);
  }

  var PLATFORMS = {
    facebook: { label: 'Facebook', icon: 'simple-icons:facebook', color: '#1877F2' },
    x: { label: 'X (Twitter)', icon: 'simple-icons:x', color: '#000000' },
    instagram: { label: 'Instagram', icon: 'simple-icons:instagram', color: '#E4405F' },
    linkedin: { label: 'LinkedIn', icon: 'simple-icons:linkedin', color: '#0A66C2' },
    youtube: { label: 'YouTube', icon: 'simple-icons:youtube', color: '#FF0000' },
    tiktok: { label: 'TikTok', icon: 'simple-icons:tiktok', color: '#000000' },
    github: { label: 'GitHub', icon: 'simple-icons:github', color: '#181717' },
    gitlab: { label: 'GitLab', icon: 'simple-icons:gitlab', color: '#FC6D26' },
    discord: { label: 'Discord', icon: 'simple-icons:discord', color: '#5865F2' },
    email: { label: 'Email', icon: 'mdi:email-outline', color: '#6B7280' },
    website: { label: 'Website', icon: 'mdi:web', color: '#6B7280' },
    rss: { label: 'RSS Feed', icon: 'mdi:rss', color: '#EE802F' }
  };

  var KNOWN_PLATFORM_ATTRS = Object.keys(PLATFORMS);

  var ALLOWED_PROTOCOLS = ['http:', 'https:', 'mailto:'];

  var VALID_POSITIONS = [
    'inline', 'floating-left', 'floating-right', 'top', 'bottom',
    'sticky-left', 'sticky-right', 'bottom-left', 'bottom-right', 'top-left', 'top-right'
  ];
  var VALID_THEMES = ['light', 'dark', 'auto', 'glass', 'minimal'];
  var VALID_SHAPES = ['square', 'rounded', 'pill', 'circle'];
  var VALID_SIZES = ['small', 'medium', 'large'];
  var VALID_ORIENTATIONS = ['horizontal', 'vertical', 'auto'];
  var VALID_DISPLAYS = ['icons', 'labels', 'icons-labels'];
  var VALID_COLORS = ['brand', 'monochrome', 'custom'];

  var DEFAULT_CONFIG = {
    position: 'inline',
    theme: 'auto',
    shape: 'rounded',
    size: 'medium',
    orientation: 'auto',
    display: 'icons',
    color: 'brand',
    collapsible: false,
    collapsed: false,
    label: 'Social links'
  };

  function oneOf(value, list, fallback) {
    return list.indexOf(value) !== -1 ? value : fallback;
  }

  function looksLikeEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  /**
   * Normalizes and validates a raw URL for a given platform.
   * Returns { url, ok } — ok is false when the link must be rejected.
   */
  function normalizeUrl(platform, rawUrl) {
    if (typeof rawUrl !== 'string') return { url: '', ok: false };
    var value = rawUrl.trim();
    if (!value) return { url: '', ok: false };

    if (platform === 'email' || looksLikeEmail(value)) {
      if (!/^mailto:/i.test(value)) {
        value = 'mailto:' + value.replace(/^mailto:/i, '');
      }
    } else if (!/^[a-z][a-z0-9+.-]*:/i.test(value)) {
      // No scheme present — assume https for bare domains/paths.
      value = 'https://' + value.replace(/^\/+/, '');
    }

    try {
      var parsed = new URL(value, window.location.href);
      if (ALLOWED_PROTOCOLS.indexOf(parsed.protocol) === -1) {
        return { url: '', ok: false };
      }
      return { url: parsed.href, ok: true };
    } catch (err) {
      return { url: '', ok: false };
    }
  }

  // Replaced by minify.py at build time with the actual (minified) CSS text.
  // Stays empty in src/ so development can edit neiki-social-bar.css without
  // rebuilding — the component falls back to a sibling <link> in that case.
  var EMBEDDED_CSS = "/*!\n * Neiki's Social Bar 1.0.0 \u2014 styles\n * MIT License\n */\n\n:host {\n  --nsb-size: 44px;\n  --nsb-icon-size: 20px;\n  --nsb-gap: 10px;\n  --nsb-radius: 10px;\n  --nsb-padding: 8px;\n  --nsb-font-size: 14px;\n  --nsb-z-index: 999;\n  --nsb-transition: 160ms ease;\n  --nsb-shadow: 0 4px 16px rgba(0, 0, 0, 0.16);\n\n  --nsb-bg: #ffffff;\n  --nsb-color: #1f2328;\n  --nsb-border: rgba(0, 0, 0, 0.08);\n  --nsb-bg-hover: #f2f3f5;\n  --nsb-color-hover: #0a0a0a;\n  --nsb-accent: #2563eb;\n  --nsb-focus-ring: #2563eb;\n  --nsb-tooltip-bg: #1f2328;\n  --nsb-tooltip-color: #ffffff;\n\n  display: block;\n  font-family: system-ui, -apple-system, \"Segoe UI\", Roboto, sans-serif;\n  font-size: var(--nsb-font-size);\n  line-height: 1;\n}\n\n:host([hidden]) {\n  display: none !important;\n}\n\n:host([resolved-theme=\"dark\"]) {\n  --nsb-bg: #1f2328;\n  --nsb-color: #f2f3f5;\n  --nsb-border: rgba(255, 255, 255, 0.12);\n  --nsb-bg-hover: #2b3038;\n  --nsb-color-hover: #ffffff;\n  --nsb-tooltip-bg: #f2f3f5;\n  --nsb-tooltip-color: #1f2328;\n}\n\n:host([theme=\"glass\"]) {\n  --nsb-bg: rgba(255, 255, 255, 0.35);\n  --nsb-border: rgba(255, 255, 255, 0.45);\n  --nsb-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);\n  --nsb-gap: calc(var(--nsb-gap) + 2px);\n}\n:host([theme=\"glass\"][resolved-theme=\"dark\"]) {\n  --nsb-bg: rgba(20, 22, 26, 0.35);\n  --nsb-color: #f2f3f5;\n  --nsb-border: rgba(255, 255, 255, 0.22);\n}\n\n:host([theme=\"minimal\"]) {\n  --nsb-bg: transparent;\n  --nsb-border: transparent;\n  --nsb-shadow: none;\n  --nsb-bg-hover: transparent;\n  --nsb-gap: calc(var(--nsb-gap) - 2px);\n}\n\n* {\n  box-sizing: border-box;\n}\n\n.nsb-root {\n  position: static;\n}\n\n.nsb-bar {\n  display: flex;\n  align-items: center;\n  gap: var(--nsb-gap);\n}\n\n.nsb-list {\n  list-style: none;\n  margin: 0;\n  padding: var(--nsb-padding);\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: var(--nsb-gap);\n  background: var(--nsb-bg);\n  border: 1px solid var(--nsb-border);\n  border-radius: var(--nsb-radius);\n  box-shadow: var(--nsb-shadow);\n  transition: max-height var(--nsb-transition), opacity var(--nsb-transition), padding var(--nsb-transition);\n}\n\n:host([theme=\"glass\"]) .nsb-list {\n  backdrop-filter: blur(14px) saturate(160%);\n  -webkit-backdrop-filter: blur(14px) saturate(160%);\n}\n\n:host([theme=\"minimal\"]) .nsb-list {\n  box-shadow: none;\n  padding: 2px;\n}\n\n:host([resolved-orientation=\"vertical\"]) .nsb-list {\n  flex-direction: column;\n  align-items: stretch;\n}\n\n.nsb-item {\n  position: relative;\n  display: flex;\n}\n\n.nsb-link {\n  position: relative;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  min-width: var(--nsb-size);\n  min-height: var(--nsb-size);\n  padding: 0 12px;\n  color: var(--nsb-color);\n  background: transparent;\n  text-decoration: none;\n  border-radius: calc(var(--nsb-radius) - 4px);\n  transition: background var(--nsb-transition), color var(--nsb-transition), transform var(--nsb-transition), box-shadow var(--nsb-transition);\n  outline-offset: 2px;\n}\n\n:host([display=\"icons\"]) .nsb-link {\n  padding: 0;\n  width: var(--nsb-size);\n}\n\n.nsb-link:hover {\n  background: var(--nsb-bg-hover);\n  color: var(--nsb-color-hover);\n}\n\n.nsb-link:focus-visible {\n  outline: 2px solid var(--nsb-focus-ring);\n}\n\n.nsb-icon {\n  width: var(--nsb-icon-size);\n  height: var(--nsb-icon-size);\n  font-size: var(--nsb-icon-size);\n  flex-shrink: 0;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n}\n\n:host([color=\"monochrome\"]) .nsb-link {\n  color: var(--nsb-color);\n}\n\n/* Brand color mode renders each link as a solid brand-color chip, so icons\n   read consistently regardless of theme (light/dark/glass all get chips;\n   only \"minimal\" flattens them back to plain glyphs below). */\n:host([color=\"brand\"]) .nsb-link {\n  background: var(--nsb-item-color, var(--nsb-bg-hover));\n  color: #ffffff;\n}\n:host([color=\"brand\"]) .nsb-link:hover {\n  filter: brightness(1.08);\n  transform: translateY(-2px);\n  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.22);\n}\n\n:host([theme=\"glass\"][color=\"brand\"]) .nsb-link {\n  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35);\n}\n\n:host([theme=\"minimal\"]) .nsb-link,\n:host([theme=\"minimal\"][color=\"brand\"]) .nsb-link {\n  background: transparent !important;\n  color: var(--nsb-item-color, var(--nsb-color));\n  box-shadow: none;\n}\n:host([theme=\"minimal\"][color=\"monochrome\"]) .nsb-link {\n  color: var(--nsb-color);\n}\n:host([theme=\"minimal\"]) .nsb-link:hover {\n  background: var(--nsb-bg-hover) !important;\n  color: var(--nsb-color-hover);\n  transform: none;\n  box-shadow: none;\n  filter: none;\n}\n\n.nsb-text {\n  white-space: nowrap;\n  font-weight: 500;\n}\n\n/* Shapes */\n:host([shape=\"square\"]) .nsb-list,\n:host([shape=\"square\"]) .nsb-link {\n  border-radius: 0;\n}\n:host([shape=\"rounded\"]) .nsb-link {\n  border-radius: 8px;\n}\n:host([shape=\"pill\"]) .nsb-list {\n  border-radius: 999px;\n}\n:host([shape=\"pill\"]) .nsb-link {\n  border-radius: 999px;\n}\n:host([shape=\"circle\"]) .nsb-link {\n  border-radius: 50%;\n}\n\n/* Sizes */\n:host([size=\"small\"]) {\n  --nsb-size: 34px;\n  --nsb-icon-size: 16px;\n  --nsb-gap: 6px;\n  --nsb-font-size: 13px;\n}\n:host([size=\"medium\"]) {\n  --nsb-size: 44px;\n  --nsb-icon-size: 20px;\n  --nsb-gap: 10px;\n  --nsb-font-size: 14px;\n}\n:host([size=\"large\"]) {\n  --nsb-size: 56px;\n  --nsb-icon-size: 26px;\n  --nsb-gap: 14px;\n  --nsb-font-size: 16px;\n}\n\n/* Tooltips */\n.nsb-tooltip {\n  position: absolute;\n  bottom: calc(100% + 8px);\n  left: 50%;\n  transform: translateX(-50%) translateY(4px);\n  background: var(--nsb-tooltip-bg);\n  color: var(--nsb-tooltip-color);\n  padding: 4px 8px;\n  border-radius: 6px;\n  font-size: 12px;\n  white-space: nowrap;\n  pointer-events: none;\n  opacity: 0;\n  visibility: hidden;\n  transition: opacity var(--nsb-transition), transform var(--nsb-transition), visibility var(--nsb-transition);\n  z-index: 1;\n}\n\n:host([resolved-orientation=\"vertical\"]) .nsb-tooltip {\n  bottom: auto;\n  left: calc(100% + 8px);\n  top: 50%;\n  transform: translateY(-50%) translateX(-4px);\n}\n\n.nsb-item:hover .nsb-tooltip,\n.nsb-link:focus-visible + .nsb-tooltip {\n  opacity: 1;\n  visibility: visible;\n  transform: translateX(-50%) translateY(0);\n}\n\n:host([resolved-orientation=\"vertical\"]) .nsb-item:hover .nsb-tooltip,\n:host([resolved-orientation=\"vertical\"]) .nsb-link:focus-visible + .nsb-tooltip {\n  transform: translateY(-50%) translateX(0);\n}\n\n/* Collapsible */\n.nsb-toggle {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: var(--nsb-size);\n  height: var(--nsb-size);\n  padding: 0;\n  border: 1px solid var(--nsb-border);\n  border-radius: var(--nsb-radius);\n  background: var(--nsb-bg);\n  color: var(--nsb-color);\n  box-shadow: var(--nsb-shadow);\n  cursor: pointer;\n  transition: background var(--nsb-transition), transform var(--nsb-transition);\n}\n.nsb-toggle:hover {\n  background: var(--nsb-bg-hover);\n}\n.nsb-toggle:focus-visible {\n  outline: 2px solid var(--nsb-focus-ring);\n  outline-offset: 2px;\n}\n.nsb-toggle-icon {\n  width: var(--nsb-icon-size);\n  height: var(--nsb-icon-size);\n  font-size: var(--nsb-icon-size);\n}\n\n.nsb-root.is-collapsed .nsb-list {\n  max-height: 0;\n  padding-top: 0;\n  padding-bottom: 0;\n  opacity: 0;\n  overflow: hidden;\n  border-width: 0;\n  box-shadow: none;\n}\n.nsb-root:not(.is-collapsed) .nsb-list {\n  max-height: 1000px;\n}\n\n.nsb-sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  border: 0;\n}\n\n/* Positions */\n:host([position=\"floating-left\"]),\n:host([position=\"floating-right\"]) {\n  position: fixed;\n  top: 50%;\n  transform: translateY(-50%);\n  z-index: var(--nsb-z-index);\n}\n:host([position=\"floating-left\"]) { left: 16px; }\n:host([position=\"floating-right\"]) { right: 16px; }\n\n:host([position=\"sticky-left\"]),\n:host([position=\"sticky-right\"]) {\n  position: sticky;\n  top: 50%;\n  z-index: var(--nsb-z-index);\n}\n:host([position=\"sticky-left\"]) { left: 16px; }\n:host([position=\"sticky-right\"]) { right: 16px; }\n\n:host([position=\"top\"]),\n:host([position=\"bottom\"]) {\n  position: fixed;\n  left: 0;\n  right: 0;\n  z-index: var(--nsb-z-index);\n  display: flex;\n  justify-content: center;\n}\n:host([position=\"top\"]) { top: 0; }\n:host([position=\"bottom\"]) { bottom: 0; }\n:host([position=\"top\"]) .nsb-list,\n:host([position=\"bottom\"]) .nsb-list {\n  border-radius: 0;\n}\n\n:host([position=\"top-left\"]),\n:host([position=\"top-right\"]),\n:host([position=\"bottom-left\"]),\n:host([position=\"bottom-right\"]) {\n  position: fixed;\n  z-index: var(--nsb-z-index);\n}\n:host([position=\"top-left\"]) { top: 16px; left: 16px; }\n:host([position=\"top-right\"]) { top: 16px; right: 16px; }\n:host([position=\"bottom-left\"]) { bottom: 16px; left: 16px; }\n:host([position=\"bottom-right\"]) { bottom: 16px; right: 16px; }\n\n/* Reduced motion */\n@media (prefers-reduced-motion: reduce) {\n  .nsb-list,\n  .nsb-link,\n  .nsb-tooltip,\n  .nsb-toggle,\n  .nsb-toggle-icon {\n    transition: none !important;\n  }\n}\n\n/* Mobile */\n@media (max-width: 480px) {\n  :host([position=\"floating-left\"]) { left: 10px; }\n  :host([position=\"floating-right\"]) { right: 10px; }\n  :host([position=\"top-left\"]),\n  :host([position=\"bottom-left\"]) { left: 10px; }\n  :host([position=\"top-right\"]),\n  :host([position=\"bottom-right\"]) { right: 10px; }\n}\n";

  var sharedSheet = null;
  var sharedSheetFailed = false;

  function getSharedSheet(cssText) {
    if (sharedSheet || sharedSheetFailed) return sharedSheet;
    if (typeof CSSStyleSheet === 'undefined' || !('adoptedStyleSheets' in Document.prototype)) {
      sharedSheetFailed = true;
      return null;
    }
    try {
      sharedSheet = new CSSStyleSheet();
      sharedSheet.replaceSync(cssText);
    } catch (err) {
      sharedSheet = null;
      sharedSheetFailed = true;
    }
    return sharedSheet;
  }

  var TEMPLATE = document.createElement('template');
  TEMPLATE.innerHTML =
    '<div class="nsb-root" part="root">' +
    '<div class="nsb-bar" part="bar">' +
    '<button type="button" class="nsb-toggle" part="toggle" hidden>' +
    '<iconify-icon class="nsb-toggle-icon" icon="mdi:share-variant" aria-hidden="true"></iconify-icon>' +
    '<span class="nsb-sr-only nsb-toggle-label"></span>' +
    '</button>' +
    '<ul class="nsb-list" part="list"></ul>' +
    '</div>' +
    '</div>';

  class NeikiSocialBar extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  NeikiSocialBar.observedAttributes = KNOWN_PLATFORM_ATTRS.concat([
    'position', 'theme', 'shape', 'size', 'orientation', 'display', 'color',
    'collapsible', 'collapsed', 'label'
  ]);

  NeikiSocialBar.prototype._init = function () {
    this._reflecting = false;
    this._ready = false;
    this._mediaQuery = null;
    this._config = Object.assign({}, DEFAULT_CONFIG, { links: {} });

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
    this._injectStyles();

    this._root = this.shadowRoot.querySelector('.nsb-root');
    this._list = this.shadowRoot.querySelector('.nsb-list');
    this._toggle = this.shadowRoot.querySelector('.nsb-toggle');
    this._toggle.addEventListener('click', this._onToggleClick.bind(this));

    this._onMediaChange = this._onMediaChange.bind(this);
  };

  NeikiSocialBar.prototype._injectStyles = function () {
    if (EMBEDDED_CSS) {
      var sheet = getSharedSheet(EMBEDDED_CSS);
      if (sheet) {
        this.shadowRoot.adoptedStyleSheets = [sheet];
        return;
      }
      var style = document.createElement('style');
      style.textContent = EMBEDDED_CSS;
      this.shadowRoot.insertBefore(style, this.shadowRoot.firstChild);
      return;
    }
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = this._resolveStylesheetUrl();
    this.shadowRoot.insertBefore(link, this.shadowRoot.firstChild);
  };

  NeikiSocialBar.prototype._resolveStylesheetUrl = function () {
    var scriptEl = document.currentScript;
    if (!scriptEl) {
      var scripts = document.querySelectorAll('script[src]');
      for (var i = scripts.length - 1; i >= 0; i--) {
        if (/neiki-social-bar(\.min)?\.js/.test(scripts[i].src)) {
          scriptEl = scripts[i];
          break;
        }
      }
    }
    var src = scriptEl ? scriptEl.src : '';
    if (/\.min\.js(\?.*)?$/.test(src)) {
      return src.replace(/\.min\.js(\?.*)?$/, '.min.css$1');
    }
    if (/\.js(\?.*)?$/.test(src)) {
      return src.replace(/\.js(\?.*)?$/, '.css$1');
    }
    return 'neiki-social-bar.css';
  };

  NeikiSocialBar.prototype.connectedCallback = function () {
    ensureIconLoader();
    this._readAttributesIntoConfig();
    this._render();
    if (!this._ready) {
      this._ready = true;
      this._emit('ready', { config: this.getConfig() });
    }
  };

  NeikiSocialBar.prototype.disconnectedCallback = function () {
    if (this._mediaQuery) {
      this._mediaQuery.removeEventListener('change', this._onMediaChange);
      this._mediaQuery = null;
    }
  };

  NeikiSocialBar.prototype.attributeChangedCallback = function (name, oldValue, newValue) {
    if (this._reflecting || oldValue === newValue) return;
    if (KNOWN_PLATFORM_ATTRS.indexOf(name) !== -1) {
      if (newValue === null) {
        delete this._config.links[name];
      } else {
        this._setLink(name, newValue, { silent: true });
      }
    } else {
      this._readAttributesIntoConfig();
    }
    if (this.isConnected) this._render();
  };

  NeikiSocialBar.prototype._readAttributesIntoConfig = function () {
    var cfg = this._config;
    cfg.position = oneOf(this.getAttribute('position'), VALID_POSITIONS, cfg.position || DEFAULT_CONFIG.position);
    cfg.theme = oneOf(this.getAttribute('theme'), VALID_THEMES, cfg.theme || DEFAULT_CONFIG.theme);
    cfg.shape = oneOf(this.getAttribute('shape'), VALID_SHAPES, cfg.shape || DEFAULT_CONFIG.shape);
    cfg.size = oneOf(this.getAttribute('size'), VALID_SIZES, cfg.size || DEFAULT_CONFIG.size);
    cfg.orientation = oneOf(this.getAttribute('orientation'), VALID_ORIENTATIONS, cfg.orientation || DEFAULT_CONFIG.orientation);
    cfg.display = oneOf(this.getAttribute('display'), VALID_DISPLAYS, cfg.display || DEFAULT_CONFIG.display);
    cfg.color = oneOf(this.getAttribute('color'), VALID_COLORS, cfg.color || DEFAULT_CONFIG.color);
    cfg.collapsible = this.hasAttribute('collapsible');
    cfg.collapsed = this.hasAttribute('collapsed');
    cfg.label = this.getAttribute('label') || DEFAULT_CONFIG.label;

    for (var i = 0; i < KNOWN_PLATFORM_ATTRS.length; i++) {
      var platform = KNOWN_PLATFORM_ATTRS[i];
      if (this.hasAttribute(platform) && !cfg.links[platform]) {
        this._setLink(platform, this.getAttribute(platform), { silent: true });
      }
    }
  };

  NeikiSocialBar.prototype._setLink = function (key, urlOrOptions, opts) {
    opts = opts || {};
    var options = typeof urlOrOptions === 'string' ? { url: urlOrOptions } : (urlOrOptions || {});
    var meta = PLATFORMS[key] || {};
    var normalized = normalizeUrl(key, options.url);

    if (!normalized.ok) {
      this._emit('error', { platform: key, url: options.url, reason: 'invalid-or-unsafe-url' });
      return false;
    }

    this._config.links[key] = {
      platform: key,
      url: normalized.url,
      label: options.label || meta.label || key,
      icon: options.icon || meta.icon || 'mdi:link-variant',
      color: options.color || meta.color || '#6B7280'
    };

    if (!opts.silent) this._emit('change', { config: this.getConfig() });
    return true;
  };

  NeikiSocialBar.prototype._reflectAttributes = function () {
    this._reflecting = true;
    var cfg = this._config;
    this.setAttribute('position', cfg.position);
    this.setAttribute('theme', cfg.theme);
    this.setAttribute('shape', cfg.shape);
    this.setAttribute('size', cfg.size);
    this.setAttribute('orientation', cfg.orientation);
    this.setAttribute('display', cfg.display);
    this.setAttribute('color', cfg.color);
    if (cfg.label) this.setAttribute('label', cfg.label);

    if (cfg.collapsible) this.setAttribute('collapsible', '');
    else this.removeAttribute('collapsible');

    if (cfg.collapsed) this.setAttribute('collapsed', '');
    else this.removeAttribute('collapsed');

    this._reflecting = false;
  };

  NeikiSocialBar.prototype._resolveTheme = function () {
    if (this._config.theme !== 'auto') return this._config.theme;
    if (!this._mediaQuery) {
      this._mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this._mediaQuery.addEventListener('change', this._onMediaChange);
    }
    return this._mediaQuery.matches ? 'dark' : 'light';
  };

  NeikiSocialBar.prototype._onMediaChange = function () {
    if (this._config.theme === 'auto') this._render();
  };

  NeikiSocialBar.prototype._resolveOrientation = function () {
    if (this._config.orientation !== 'auto') return this._config.orientation;
    var pos = this._config.position;
    if (pos === 'top' || pos === 'bottom' || pos === 'inline') return 'horizontal';
    return 'vertical';
  };

  NeikiSocialBar.prototype._render = function () {
    var cfg = this._config;
    this._reflectAttributes();

    this.setAttribute('resolved-theme', this._resolveTheme());
    this.setAttribute('resolved-orientation', this._resolveOrientation());

    this._root.setAttribute('role', 'navigation');
    this._root.setAttribute('aria-label', cfg.label);

    var links = Object.keys(cfg.links).map(function (key) { return cfg.links[key]; });

    this._toggle.hidden = !cfg.collapsible;
    if (cfg.collapsible) {
      var expanded = !cfg.collapsed;
      this._toggle.setAttribute('aria-expanded', String(expanded));
      this._toggle.setAttribute('aria-controls', this._listId());
      this._toggle.querySelector('.nsb-toggle-label').textContent = expanded
        ? 'Collapse ' + cfg.label
        : 'Expand ' + cfg.label;
      this._list.id = this._listId();
      this._root.classList.toggle('is-collapsed', !!cfg.collapsed);
    } else {
      this._root.classList.remove('is-collapsed');
    }

    this._renderLinks(links);
  };

  NeikiSocialBar.prototype._listId = function () {
    if (!this._listIdValue) {
      this._listIdValue = 'nsb-list-' + Math.random().toString(36).slice(2, 9);
    }
    return this._listIdValue;
  };

  NeikiSocialBar.prototype._renderLinks = function (links) {
    var self = this;
    var cfg = this._config;
    var showIcon = cfg.display !== 'labels';
    var showLabel = cfg.display !== 'icons';
    var tooltips = cfg.display === 'icons';
    var collapsedInert = cfg.collapsible && cfg.collapsed;

    this._list.textContent = '';

    links.forEach(function (link) {
      var li = document.createElement('li');
      li.className = 'nsb-item';
      li.setAttribute('part', 'item');
      li.dataset.platform = link.platform;

      var a = document.createElement('a');
      a.className = 'nsb-link';
      a.setAttribute('part', 'link');
      a.href = link.url;
      a.setAttribute('aria-label', link.label);
      if (link.url.indexOf('mailto:') !== 0) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
      if (cfg.color === 'brand') {
        a.style.setProperty('--nsb-item-color', link.color);
      }
      if (collapsedInert) {
        a.setAttribute('tabindex', '-1');
      }

      var tooltipId = null;
      if (tooltips) {
        tooltipId = 'nsb-tip-' + link.platform + '-' + Math.random().toString(36).slice(2, 7);
        a.setAttribute('aria-describedby', tooltipId);
      }

      a.addEventListener('click', function (event) {
        self._emit('click', { platform: link.platform, url: link.url, originalEvent: event });
      });

      if (showIcon) {
        var icon = document.createElement('iconify-icon');
        icon.className = 'nsb-icon';
        icon.setAttribute('icon', link.icon);
        icon.setAttribute('aria-hidden', 'true');
        a.appendChild(icon);
      }

      if (showLabel) {
        var span = document.createElement('span');
        span.className = 'nsb-text';
        span.textContent = link.label;
        a.appendChild(span);
      }

      li.appendChild(a);

      if (tooltips) {
        var tip = document.createElement('span');
        tip.className = 'nsb-tooltip';
        tip.setAttribute('role', 'tooltip');
        tip.id = tooltipId;
        tip.textContent = link.label;
        li.appendChild(tip);
      }

      self._list.appendChild(li);
    });
  };

  NeikiSocialBar.prototype._emit = function (name, detail) {
    this.dispatchEvent(new CustomEvent('neiki-social-bar:' + name, {
      detail: detail,
      bubbles: true,
      composed: true
    }));
  };

  // ---------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------

  NeikiSocialBar.prototype.setConfig = function (config) {
    config = config || {};
    var cfg = this._config;

    if (config.position !== undefined) cfg.position = oneOf(config.position, VALID_POSITIONS, cfg.position);
    if (config.theme !== undefined) cfg.theme = oneOf(config.theme, VALID_THEMES, cfg.theme);
    if (config.shape !== undefined) cfg.shape = oneOf(config.shape, VALID_SHAPES, cfg.shape);
    if (config.size !== undefined) cfg.size = oneOf(config.size, VALID_SIZES, cfg.size);
    if (config.orientation !== undefined) cfg.orientation = oneOf(config.orientation, VALID_ORIENTATIONS, cfg.orientation);
    if (config.display !== undefined) cfg.display = oneOf(config.display, VALID_DISPLAYS, cfg.display);
    if (config.color !== undefined) cfg.color = oneOf(config.color, VALID_COLORS, cfg.color);
    if (config.collapsible !== undefined) cfg.collapsible = !!config.collapsible;
    if (config.collapsed !== undefined) cfg.collapsed = !!config.collapsed;
    if (config.label !== undefined) cfg.label = String(config.label);

    if (config.links && typeof config.links === 'object') {
      this._applyLinks(config.links, { replace: false });
    }

    if (this.isConnected) this._render();
    this._emit('change', { config: this.getConfig() });
    return this;
  };

  NeikiSocialBar.prototype.getConfig = function () {
    var cfg = this._config;
    var links = {};
    Object.keys(cfg.links).forEach(function (key) {
      links[key] = Object.assign({}, cfg.links[key]);
    });
    return {
      position: cfg.position,
      theme: cfg.theme,
      shape: cfg.shape,
      size: cfg.size,
      orientation: cfg.orientation,
      display: cfg.display,
      color: cfg.color,
      collapsible: cfg.collapsible,
      collapsed: cfg.collapsed,
      label: cfg.label,
      links: links
    };
  };

  NeikiSocialBar.prototype._applyLinks = function (links, opts) {
    opts = opts || {};
    if (opts.replace) this._config.links = {};
    var self = this;
    Object.keys(links).forEach(function (key) {
      self._setLink(key, links[key], { silent: true });
    });
  };

  NeikiSocialBar.prototype.setLinks = function (links) {
    this._applyLinks(links || {}, { replace: true });
    if (this.isConnected) this._render();
    this._emit('change', { config: this.getConfig() });
    return this;
  };

  NeikiSocialBar.prototype.addLink = function (platform, url, options) {
    if (!platform) return this;
    var payload = Object.assign({ url: url }, options || {});
    var ok = this._setLink(platform, payload, { silent: true });
    if (ok) {
      if (this.isConnected) this._render();
      this._emit('change', { config: this.getConfig() });
    }
    return this;
  };

  NeikiSocialBar.prototype.removeLink = function (platform) {
    if (this._config.links[platform]) {
      delete this._config.links[platform];
      if (this.hasAttribute(platform)) {
        this._reflecting = true;
        this.removeAttribute(platform);
        this._reflecting = false;
      }
      if (this.isConnected) this._render();
      this._emit('change', { config: this.getConfig() });
    }
    return this;
  };

  NeikiSocialBar.prototype.show = function () {
    this.hidden = false;
    return this;
  };

  NeikiSocialBar.prototype.hide = function () {
    this.hidden = true;
    return this;
  };

  NeikiSocialBar.prototype.toggle = function () {
    if (!this._config.collapsible) return this;
    return this._config.collapsed ? this.open() : this.close();
  };

  NeikiSocialBar.prototype.open = function () {
    if (!this._config.collapsible || !this._config.collapsed) return this;
    this._config.collapsed = false;
    if (this.isConnected) this._render();
    this._emit('open', { config: this.getConfig() });
    return this;
  };

  NeikiSocialBar.prototype.close = function () {
    if (!this._config.collapsible || this._config.collapsed) return this;
    this._config.collapsed = true;
    if (this.isConnected) this._render();
    this._emit('close', { config: this.getConfig() });
    return this;
  };

  NeikiSocialBar.prototype.refresh = function () {
    if (this.isConnected) this._render();
    return this;
  };

  NeikiSocialBar.prototype._onToggleClick = function () {
    this.toggle();
  };

  customElements.define('neiki-social-bar', NeikiSocialBar);
})();
