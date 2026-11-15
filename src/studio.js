import { createQrMatrix, normalizeUrl } from './index.js';
import { template } from './template.js';
export function mountStudio(container) {
const root=container.shadowRoot || container.attachShadow({mode:'open'});
root.innerHTML=template;


const $=id=>root.getElementById(id);let code=null,currentUrl='',logo=null,logoBusy=false,logoLoadId=0;
const makeCode=createQrMatrix;
let artworkCache=null;
function visibleLogoBounds(canvas){const {width,height}=canvas,data=canvas.getContext('2d').getImageData(0,0,width,height).data;let left=width,top=height,right=-1,bottom=-1;for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(data[(y*width+x)*4+3]>8){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}if(right<left)throw Error('Choose a logo with visible artwork.');return {x:left,y:top,width:right-left+1,height:bottom-top+1};}
function centerArtwork(){
 const brand=$('brand').value.trim(),color=$('color').value,layoutKey=['logo-scale','text-size','brand-gap','brand-padding'].map(id=>$(id).value).join(',')+','+$('trim-logo').checked;
 if(!logo&&!brand)return null;
 if(artworkCache&&artworkCache.logo===logo&&artworkCache.brand===brand&&artworkCache.color===color&&artworkCache.layoutKey===layoutKey)return artworkCache;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,1024,1024);
 const padding=1024*Number($('brand-padding').value)/100,inner=1024-2*padding,gap=logo&&brand?1024*Number($('brand-gap').value)/100:0;
 let fontSize=1024*Number($('text-size').value)/100,textHeight=0,ascent=0;
 if(brand){ctx.font=`700 ${fontSize}px Arial, sans-serif`;while(ctx.measureText(brand).width>inner&&fontSize>16){fontSize--;ctx.font=`700 ${fontSize}px Arial, sans-serif`;}const metrics=ctx.measureText(brand);ascent=metrics.actualBoundingBoxAscent;textHeight=ascent+metrics.actualBoundingBoxDescent;}
 let width=0,height=0,crop;
 if(logo){crop=$('trim-logo').checked?logo.crop:{x:0,y:0,width:logo.image.width,height:logo.image.height};const availableHeight=inner-textHeight-gap,scale=Math.min(inner/crop.width,availableHeight/crop.height)*Number($('logo-scale').value)/100;width=crop.width*scale;height=crop.height*scale;}
 const top=(1024-height-gap-textHeight)/2;
 if(logo)ctx.drawImage(logo.image,crop.x,crop.y,crop.width,crop.height,(1024-width)/2,top,width,height);
 if(brand){ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.fillText(brand,512,top+height+gap+ascent);}
 artworkCache={logo,brand,color,layoutKey,canvas,data:canvas.toDataURL('image/png')};return artworkCache;
}
function logoGeometry(qr){const n=qr.getModuleCount(),box=n*Number($('center-size').value);return {box,start:4+(n-box)/2};}
function logoSvg(qr){const artwork=centerArtwork();if(!artwork)return '';const {box,start}=logoGeometry(qr);return `<image href="${artwork.data}" x="${start}" y="${start}" width="${box}" height="${box}" preserveAspectRatio="xMidYMid meet" style="image-rendering:auto"/>`;}
function svgText(qr){const n=qr.getModuleCount(),extent=n+8;let path='';for(let row=0;row<n;row++)for(let col=0;col<n;col++)if(qr.isDark(row,col))path+=`M${col+4} ${row+4}h1v1h-1z`;return `<svg xmlns="http://www.w3.org/2000/svg" width="${extent}" height="${extent}" viewBox="0 0 ${extent} ${extent}" shape-rendering="crispEdges"><rect width="${extent}" height="${extent}" fill="#ffffff"/><path d="${path}" fill="${$('color').value}"/>${logoSvg(qr)}</svg>`;}
function preview(qr){$('qr').innerHTML=svgText(qr);}

function invalidate(){code=null;currentUrl='';$('png').disabled=$('svg').disabled=true;$('badge').textContent='Preview needed';$('destination').textContent='Create a QR code for your updated link';$('qr').style.opacity='.18';$('status').textContent='';$('error').textContent='';$('url').removeAttribute('aria-invalid');}
$('url').addEventListener('input',invalidate);
$('form').addEventListener('submit',event=>{event.preventDefault();$('error').textContent='';$('url').removeAttribute('aria-invalid');try{const normalized=normalizeUrl($('url').value);let generated;try{generated=makeCode(normalized);}catch{throw Error('This link is too long for a high-quality QR code. Try a shorter address.');}code=generated;currentUrl=normalized;preview(code);$('qr').style.opacity='1';$('qr').setAttribute('aria-label','QR code for '+currentUrl);$('destination').textContent=currentUrl;$('badge').textContent='Ready to share';$('png').disabled=$('svg').disabled=logoBusy;$('status').textContent='Your QR code is ready. Download it below.';}catch(error){code=null;$('png').disabled=$('svg').disabled=true;$('error').textContent=error.message;$('url').setAttribute('aria-invalid','true');$('url').focus();}});
$('color').addEventListener('change',()=>preview(code||makeCode('https://example.com/')));
$('brand').addEventListener('input',()=>preview(code||makeCode('https://example.com/')));
$('center-size').addEventListener('change',()=>preview(code||makeCode('https://example.com/')));
const layoutDefaults={'logo-scale':'100','text-size':'16','brand-gap':'1','brand-padding':'4'};
function updateLayout(){for(const id of Object.keys(layoutDefaults))$(id+'-value').textContent=$(id).value+'%';preview(code||makeCode('https://example.com/'));}
for(const id of Object.keys(layoutDefaults))$(id).addEventListener('input',updateLayout);
$('trim-logo').addEventListener('change',updateLayout);
$('reset-layout').addEventListener('click',()=>{for(const [id,value] of Object.entries(layoutDefaults))$(id).value=value;$('trim-logo').checked=true;updateLayout();});

function download(blob,filename){const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=filename;link.click();setTimeout(()=>URL.revokeObjectURL(url),1500);}
function filename(extension){const custom=$('filename').value.trim().replace(/[<>:"/\\|?*\x00-\x1f\x7f]/g,'-').replace(/(?:\.(?:png|svg))+$/i,'').replace(/^[. ]+|[. ]+$/g,'').slice(0,100).replace(/[. ]+$/g,'');const fallback='qr-'+new URL(currentUrl).hostname.replace(/[^a-z0-9.-]/gi,'-');return (custom||fallback)+'.'+extension;}
$('svg').addEventListener('click',()=>{if(!code||logoBusy)return;download(new Blob([svgText(code)],{type:'image/svg+xml'}),filename('svg'));$('status').textContent='SVG download started. Ready for any print size.';});
$('png').addEventListener('click',()=>{if(!code||logoBusy)return;const name=filename('png'),size=Number($('size').value),n=code.getModuleCount(),extent=n+8,canvas=document.createElement('canvas');canvas.width=canvas.height=size;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,size,size);ctx.fillStyle=$('color').value;for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(code.isDark(r,c)){const x=Math.round((c+4)*size/extent),y=Math.round((r+4)*size/extent);ctx.fillRect(x,y,Math.round((c+5)*size/extent)-x,Math.round((r+5)*size/extent)-y);}const artwork=centerArtwork();if(artwork){const {box,start}=logoGeometry(code),x=Math.round(start*size/extent),edge=Math.round((start+box)*size/extent);ctx.drawImage(artwork.canvas,x,x,edge-x,edge-x);}canvas.toBlob(blob=>{if(blob){download(blob,name);$('status').textContent=`${size} × ${size} PNG download started.`;}else $('status').textContent='Download failed. Try SVG instead.';},'image/png');});
function refreshLogo(){preview(code||makeCode('https://example.com/'));$('png').disabled=$('svg').disabled=!code||logoBusy;$('logo-row').hidden=!logo;if(logo){$('logo-thumbnail').src=logo.data;$('logo-name').textContent=logo.name;}else{$('logo-thumbnail').removeAttribute('src');$('logo-name').textContent='';}}
async function logoImageSource(file,isSvg){if(!isSvg)return file;const document=new DOMParser().parseFromString(await file.text(),'image/svg+xml'),root=document.documentElement;if(document.querySelector('parsererror')||root.localName!=='svg'||root.namespaceURI!=='http://www.w3.org/2000/svg')throw Error('Choose a valid SVG logo.');const viewBox=(root.getAttribute('viewBox')||'').trim().split(/[\s,]+/).map(Number);if(viewBox.length===4&&viewBox.every(Number.isFinite)&&viewBox[2]>0&&viewBox[3]>0){const ratio=1024/Math.max(viewBox[2],viewBox[3]);root.setAttribute('width',Math.max(1,Math.round(viewBox[2]*ratio)));root.setAttribute('height',Math.max(1,Math.round(viewBox[3]*ratio)));}return new Blob([new XMLSerializer().serializeToString(root)],{type:'image/svg+xml'});}
$('logo').addEventListener('change',async()=>{const file=$('logo').files[0];if(!file)return;const request=++logoLoadId;$('logo-error').textContent='';logoBusy=true;$('logo-status').textContent='Preparing your logo…';refreshLogo();let objectUrl;try{const isSvg=file.type==='image/svg+xml'||/\.svg$/i.test(file.name);if(!isSvg&&!['image/png','image/jpeg','image/webp'].includes(file.type))throw Error('Choose an SVG, PNG, JPG or WebP image.');if(file.size>5*1024*1024)throw Error('Choose an image smaller than 5 MB.');objectUrl=URL.createObjectURL(await logoImageSource(file,isSvg));const original=new Image();original.src=objectUrl;await original.decode();if(original.width>8192||original.height>8192)throw Error('Choose an image no larger than 8192 pixels per side.');const scale=isSvg?1024/Math.max(original.width,original.height):Math.min(1,1024/Math.max(original.width,original.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(original.width*scale));canvas.height=Math.max(1,Math.round(original.height*scale));canvas.getContext('2d').drawImage(original,0,0,canvas.width,canvas.height);const data=canvas.toDataURL('image/png'),image=new Image();image.src=data;await image.decode();if(request!==logoLoadId)return;logo={data,image,name:file.name,crop:visibleLogoBounds(canvas)};$('logo-status').textContent='Logo added. It’s included in your preview and downloads.';}catch(error){if(request!==logoLoadId)return;$('logo-error').textContent=error.message.startsWith('Choose ')?error.message:'We couldn’t read this image. Try a standalone SVG, PNG, JPG or WebP.';$('logo-status').textContent='';$('logo').value='';}finally{if(objectUrl)URL.revokeObjectURL(objectUrl);if(request===logoLoadId){logoBusy=false;refreshLogo();}}});
$('remove-logo').addEventListener('click',()=>{logoLoadId++;logo=null;logoBusy=false;$('logo').value='';$('logo-error').textContent='';$('logo-status').textContent='Logo removed.';refreshLogo();});
for(const id of Object.keys(layoutDefaults))$(id+'-value').textContent=$(id).value+'%';
$('logo').value='';$('logo-row').hidden=true;$('logo-thumbnail').removeAttribute('src');$('logo-name').textContent='';$('logo-error').textContent='';$('logo-status').textContent='';
$('png').disabled=$('svg').disabled=true; $('badge').textContent='Example preview'; $('destination').textContent='Your link will appear here'; $('qr').style.opacity='1'; $('qr').setAttribute('aria-label','Example QR code for https://example.com/'); $('error').textContent=''; $('status').textContent=''; preview(makeCode('https://example.com/'));

return () => {logoLoadId++;root.replaceChildren();};
}
