import { useEffect, useRef, type HTMLAttributes } from 'react';
import { mountStudio } from './studio.js';
export type QRStudioProps = HTMLAttributes<HTMLDivElement>;
/** Full QR Studio editor with styles isolated in a shadow root. Browser only. */
export function QRStudio(props: QRStudioProps) {
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(ref.current)return mountStudio(ref.current);},[]);
 return <div {...props} ref={ref}/>;
}
