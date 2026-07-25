#!/usr/bin/env node
import fs from 'fs'
import { execSync } from 'child_process'

// Extract from git HEAD
const headHtml = execSync('git -C D:/pxhopencode show HEAD:skills/virtual-office/extension/media/office.html', { encoding: 'utf8' })

// Find the second script block (/* OFFICE_JS */)
let idx1 = headHtml.indexOf('/* OFFICE_JS */')
let idx2 = headHtml.indexOf('</script>', idx1)
const headJs = headHtml.substring(idx1 + '/* OFFICE_JS */'.length, idx2).trim()

fs.writeFileSync('D:/pxhopencode/_shared/head-office-js.txt', headJs)
console.log('HEAD JS extracted:', headJs.length, 'bytes')
console.log('First 300 chars:', headJs.substring(0, 300))
