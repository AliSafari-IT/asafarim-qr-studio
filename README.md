# ASafariM QR Studio

A private, browser-based QR editor and a framework-independent TypeScript QR API.

```sh
pnpm add @asafarim/qr-studio
```

## Generate an SVG

```ts
import { generateQrSvg } from '@asafarim/qr-studio';
const svg = generateQrSvg('https://example.com', {
  color: '#08635d',
  size: 2048,
});
```

The core runs in Node or browsers without React. It exports `normalizeUrl`,
`createQrMatrix`, and `generateQrSvg`. Destinations must use HTTP(S); bare domains
get HTTPS. The SVG API creates a plain QR code with a four-module white border.

## React editor

```tsx
import { QRStudio } from '@asafarim/qr-studio/react';
export default function App() {
  return <QRStudio />;
}
```

React 18 and 19 are supported. The interactive editor runs in the browser and
isolates its styling in a shadow root. It includes SVG/PNG/JPEG/WebP logo uploads,
brand names, layout controls, six dark colors, custom filenames, and PNG/SVG
exports. Images are processed locally. Branding is embedded as raster artwork
in SVG exports; the QR modules remain vectors. Scan finished codes before printing.

## Development

Use Node 24 and the pinned pnpm version.

```sh
pnpm install
pnpm build
pnpm typecheck
pnpm test
pnpm demo
pnpm build:demo
npm pack --dry-run
```

`demo/` imports this package through the workspace. `standalone/` preserves the
original downloadable HTML editions. `dist/` is generated package output.

CI validates the package and demo. The Pages workflow deploys `demo/dist` after
changes land on main; enable GitHub Pages with GitHub Actions as the source.
The first npm release requires access to the `@asafarim` scope and npm authentication.

This repository prepares version 1.4.0; package installation becomes available
once that release is published to npm.
