# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-04

### Added

- Initial release of Neiki's Social Bar.
- Web Component with Shadow DOM isolation for CSS-conflict-free embedding.
- Support for 12 built-in platforms: Facebook, X, Instagram, LinkedIn, YouTube, TikTok, GitHub, GitLab, Discord, Email, Website and RSS.
- 11 positions: `inline`, `floating-left`, `floating-right`, `top`, `bottom`, `sticky-left`, `sticky-right`, `top-left`, `top-right`, `bottom-left`, `bottom-right`.
- 5 themes: `light`, `dark`, `auto`, `glass`, `minimal`.
- 4 shapes: `square`, `rounded`, `pill`, `circle`.
- 3 sizes: `small`, `medium`, `large`.
- Horizontal, vertical and auto orientation.
- Icon, label, and icon+label display modes.
- Brand, monochrome and custom color modes.
- Optional collapsible mode with keyboard support, `aria-expanded`, and reduced-motion aware transitions.
- Accessible custom tooltips for icon-only mode.
- Declarative attribute configuration and a full JavaScript API: `setConfig`, `getConfig`, `setLinks`, `addLink`, `removeLink`, `show`, `hide`, `toggle`, `open`, `close`, `refresh`.
- `neiki-social-bar:ready`, `:click`, `:open`, `:close`, `:change` and `:error` events.
- URL normalization and protocol allow-listing (`https:`, `http:`, `mailto:`) to reject unsafe schemes.
- Icons loaded on demand from the Iconify CDN, shared and deduplicated across multiple instances.
- CSS variable customization with a consistent `--nsb-*` prefix.
- `minify.py` build script that embeds the component's CSS directly into `dist/neiki-social-bar.js` and `dist/neiki-social-bar.min.js`, so a single script tag is enough at runtime; standalone `dist/neiki-social-bar.css` and `.min.css` are also produced for reference.

[1.0.0]: https://github.com/neikiri/neiki-social-bar/releases/tag/1.0.0
