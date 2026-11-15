import React from 'react';
import { createRoot } from 'react-dom/client';
import { QRStudio } from '@asafarim/qr-studio/react';
import './style.css';
function Demo() {
  return <>
    <header className="demo-header">
      <a className="demo-brand" href="https://asafarim.be/applications/qr-studio" target="_blank" rel="noopener noreferrer">ASafariM <span>QR Studio</span></a>
      <nav aria-label="Demo navigation">
        <details><summary>How to use</summary><ol><li>Enter a website address and choose Create QR code.</li><li>Add an optional logo and brand name. Fine-tune spacing, size and padding.</li><li>Choose a filename and color, then download PNG or SVG. Scan the finished code before printing.</li></ol></details>
        <a href="https://github.com/AliSafari-IT/asafarim-qr-studio" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
        <a href="https://www.npmjs.com/package/@asafarim/qr-studio" target="_blank" rel="noopener noreferrer">npm ↗</a>
        <a href="https://asafarim.be/packages/qr-studio" target="_blank" rel="noopener noreferrer">DevTools ↗</a>
      </nav>
    </header>
    <QRStudio />
  </>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><Demo/></React.StrictMode>);
