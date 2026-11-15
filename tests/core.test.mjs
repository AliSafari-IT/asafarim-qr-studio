import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateQrSvg,normalizeUrl,createQrMatrix} from '../dist/index.js';
test('URL normalization retains destination',()=>{assert.equal(normalizeUrl('example.com/é?q=1#x'),'https://example.com/%C3%A9?q=1#x');});
test('unsafe and incomplete destinations rejected',()=>{for(const value of ['javascript:alert(1)','ftp://example.com','https://user:pass@example.com','no spaces here','word'])assert.throws(()=>normalizeUrl(value));});
test('SVG export has dimensions, opaque border and escaped inputs',()=>{const svg=generateQrSvg('example.com',{size:2048,color:'#08635d'});assert.match(svg,/width="2048"/);assert.match(svg,/fill="#ffffff"/);assert.match(svg,/fill="#08635d"/);assert.throws(()=>generateQrSvg('example.com',{color:'" onload="alert(1)'}));assert.throws(()=>generateQrSvg('example.com',{size:NaN}));});
test('matrix handles Unicode and rejects capacity overflow',()=>{assert(createQrMatrix('https://example.com/你好').getModuleCount()>20);assert.throws(()=>createQrMatrix('https://example.com/'+ 'a'.repeat(5000)));});
