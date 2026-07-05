# Security Policy

## Supported Versions

Only the latest published release of Neiki's Social Bar receives security fixes.

| Version | Supported |
| --- | --- |
| 1.x | ✅ |
| < 1.0 | ❌ |

## Reporting a Vulnerability

Please do not open a public GitHub issue for security vulnerabilities.

Instead, report it privately by emailing **neikiri@neikiri.dev** with:

- A description of the vulnerability and its potential impact
- Steps to reproduce it, including a minimal example if possible
- The affected version(s)

You should receive an initial response within **72 hours**. We will keep you updated as the issue is investigated and fixed, and will credit you in the release notes unless you prefer to stay anonymous.

## Scope

This policy covers the code in this repository (`src/`, `dist/`, `demo/`, `minify.py`). It does not cover:

- Third-party icon data served by the Iconify CDN that the component loads at runtime.
- Third-party CDNs or package registries used to distribute the built files.

## Security Design Notes

- Every link URL is normalized and validated before rendering. Only the `https:`, `http:`, and `mailto:` protocols are allowed — schemes such as `javascript:` are rejected and never reach the DOM.
- Email addresses are automatically normalized to `mailto:` links.
- External links open with `rel="noopener noreferrer"` by default, preventing the opened tab from accessing `window.opener`.
- Malformed or unsafe links are skipped and reported through a `neiki-social-bar:error` event instead of breaking the component.
- The component renders inside a Shadow DOM, isolating its markup and styles from the host page.
- The component does not collect, store, or transmit any user data. It has no network calls of its own beyond loading its own stylesheet and the Iconify icon loader script.

See [README.md](README.md#security) for more details on the security model.
