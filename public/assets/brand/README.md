# Brand assets (to be supplied)

Drop the official files into this folder using the filenames below. **No code change is needed** when the
filename matches: the site checks for each file at build time and switches from its fallback to the real asset
automatically. Paths are configured in `src/config/site.config.mjs` (`assets`). A path without an extension
auto-detects `.svg`, `.png`, `.webp`, `.jpg`, `.jpeg` (in that order).

| Added to folder | Asset | Expected filename | Used for | Fallback while missing |
| :---: | --- | --- | --- | --- |
| V | English logo | `daphi-logo-en.svg` | Header (English pages), left side | Plain text wordmark "Daphi", dashed-underlined |
| V | Hebrew logo | `daphi-logo-he.svg` | Header (Hebrew pages), right side | Plain text wordmark "דפי", dashed-underlined |
| V | Email icon | `email-icon.svg` | Footer and contact blocks | Text-only email link |
| | FLW-prevention infographic | `flw-prevention-infographic.svg` (or `.png`/`.webp`) | FLW Prevention page (Stage 3) | Labelled infographic placeholder block |
| | Sensor-project image (optional) | `sensor-project.webp` (or `.svg`/`.png`/`.jpg`) | Sensor sections (Stage 3) | Section renders without an image |
| | Open Graph share image (optional) | `og-image.png` (1200x630) | Social previews | `og:image` omitted |

Notes

- Logos are **never mirrored** in RTL; only directional icons (arrows, chevrons) are mirrored.
- SVG logos should have a `viewBox` (or width/height) so the build can set intrinsic dimensions and avoid layout shift.
- **Do not** add redrawn or approximated logos here; the fallbacks exist precisely so no unofficial logo is shown.
- The favicon is `public/favicon.svg`: a neutral, temporary ring that is **not** a Daphi logo. Replace it with the
  official favicon when available.
