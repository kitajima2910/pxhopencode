const fs = require('fs');
const path = require('path');

const templatePath = 'D:/pxhopencode/skills/virtual-office/extension/media/office.html';
const rendererStatePath = 'D:/pxhopencode/skills/virtual-office/extension/media/renderer-state.js';
const officeJsPath = 'D:/pxhopencode/skills/virtual-office/extension/media/office.js';

let html = fs.readFileSync(templatePath, 'utf-8');
console.log('Template size:', html.length);
console.log('Has /* RENDERER_STATE */:', html.includes('/* RENDERER_STATE */'));
console.log('Has /* OFFICE_JS */:', html.includes('/* OFFICE_JS */'));
console.log('Has NONCE:', html.includes('NONCE'));

const nonce = require('crypto').randomBytes(16).toString('base64');
html = html.replace(/NONCE/g, nonce);
console.log('After NONCE replace - has NONCE:', html.includes('NONCE'));
console.log('Nonce used:', nonce);

const rs = fs.readFileSync(rendererStatePath, 'utf-8');
console.log('Renderer state size:', rs.length);
html = html.replace('/* RENDERER_STATE */', rs);
console.log('After RENDERER_STATE replace:', html.includes('/* RENDERER_STATE */'));

const oj = fs.readFileSync(officeJsPath, 'utf-8');
console.log('Office JS size:', oj.length);
html = html.replace('/* OFFICE_JS */', oj);
console.log('After OFFICE_JS replace:', html.includes('/* OFFICE_JS */'));

console.log('Final HTML size:', html.length);
console.log('First 500 chars:', html.substring(0, 500));
