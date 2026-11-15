import qrcode from 'qrcode-generator';
qrcode.stringToBytes = (text: string) => Array.from(new TextEncoder().encode(text));
export interface QrMatrix { getModuleCount(): number; isDark(row: number, column: number): boolean; }
export interface QrOptions { color?: string; size?: number; errorCorrection?: 'L' | 'M' | 'Q' | 'H'; }
/** Accept HTTP(S) destinations and supply HTTPS for bare domains. */
export function normalizeUrl(raw: string): string {
 let value=raw.trim();
 if(!value || /\s/.test(value)) throw new Error('Enter a website address without spaces.');
 if(!/^https?:\/\//i.test(value)) {
  if(/^[a-z][a-z\d+.-]*:/i.test(value) && !/^([^/:]+):\d+(\/|$)/.test(value)) throw new Error('Use HTTP or HTTPS.');
  value='https://'+value;
 }
 const url=new URL(value);
 if(!['http:','https:'].includes(url.protocol)||url.username||url.password||(!url.hostname.includes('.')&&url.hostname!=='localhost')) throw new Error('Use a complete HTTP(S) address without login details.');
 return url.href;
}
export function createQrMatrix(url: string, errorCorrection: QrOptions['errorCorrection']='H'): QrMatrix {
 const qr=qrcode(0,errorCorrection);qr.addData(normalizeUrl(url),'Byte');qr.make();return qr;
}
/** Generate an opaque, four-module-bordered SVG without a browser or React. */
export function generateQrSvg(url: string, options: QrOptions={}): string {
 const color=options.color??'#000000',size=options.size??1024;
 if(!/^#[0-9a-f]{6}$/i.test(color)) throw new Error('Color must be a six-digit hex value.');
 if(!Number.isInteger(size)||size<64||size>8192) throw new Error('Size must be an integer from 64 to 8192.');
 const qr=createQrMatrix(url,options.errorCorrection),n=qr.getModuleCount(),extent=n+8;let path='';
 for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(qr.isDark(r,c))path+=`M${c+4} ${r+4}h1v1h-1z`;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${extent} ${extent}" shape-rendering="crispEdges"><rect width="${extent}" height="${extent}" fill="#ffffff"/><path d="${path}" fill="${color}"/></svg>`;
}
