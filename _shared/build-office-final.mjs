#!/usr/bin/env node
/**
 * Build the final office.js with:
 * 1. Correct JS from git HEAD~1
 * 2. VSCode Bridge from current office.js
 * 3. Per-agent log dialog boxes showing _monitorLog entries when agents sit at desks
 */

import fs from 'fs'

const js = fs.readFileSync('_shared/prev-office.js', 'utf-8')
const current = fs.readFileSync('skills/virtual-office/extension/media/office.js', 'utf-8')

// Extract VSCode Bridge from current office.js
const bridgeStart = current.indexOf('// VSCode Bridge')
const bridgeCode = bridgeStart >= 0 ? current.substring(bridgeStart) : ''

if (!bridgeCode) {
  console.error('Bridge not found!')
  process.exit(1)
}

// Strip trailing newline
let modified = js.replace(/\n+$/, '')

// ── MODIFICATION 1: drawComicBubble → show up to 5 lines for agent log dialog ──
// Replace slice(-2) with slice(-5) and increase bubble height
modified = modified.replace(
  'const maxW=Math.max(...lines.map(m=>m.length))*5.5+24,bh=lines.length*14+16',
  'const maxW=Math.max(...lines.map(m=>m.length))*5+30,bh=Math.min(lines.length,5)*16+20'
)

// ── MODIFICATION 2: When agent is at desk (not standing/walking), show a larger log dialog ──
// Draw a semi-transparent panel with log entries near the agent's desk
// We want to show recent _monitorLog entries instead of just the current speech bubble

// Find where speech bubble is drawn for sitting agents (else branch of st check)
// Current: if(ch.tsm)drawComicBubble(0,hcy-58,ch.tsm,ch._bcol||a.c)
// Replace with enhanced version that shows _monitorLog contents
modified = modified.replace(
  'if(ch.tsm)drawComicBubble(0,hcy-58,ch.tsm,ch._bcol||a.c)',
  'if(ch.tsm||(ch._monitorLog&&ch._monitorLog.length)){var logLines=ch.tsm?ch.tsm:[];if(ch._monitorLog&&ch._monitorLog.length){var recentLogs=ch._monitorLog.slice(-5).map(function(e){return(e.s?("["+e.s.slice(0,8)+"]"):"")+" "+(e.m?e.m.slice(0,30):"")});if(recentLogs.length>0){logLines=logLines.length?logLines.concat(recentLogs.slice(0,3)):recentLogs}}if(logLines.length)drawAgentLogDialog(0,hcy-65,logLines,ch._bcol||a.c)}'
)

// Add the drawAgentLogDialog function before init()
modified = modified.replace(
  'function init()',
  `function drawAgentLogDialog(cx,cy,lines,accent){
  if(!lines||!lines.length)return
  ctx.save()
  const maxLines=Math.min(lines.length,5)
  const maxW=Math.max.apply(null,lines.map(function(m){return m.length}))*4.5+32
  const bh=maxLines*15+24
  // Background panel with rounded corners
  ctx.fillStyle='rgba(10,14,23,0.92)'
  ctx.beginPath();ctx.roundRect(cx-maxW/2,cy-bh,maxW,bh,10);ctx.fill()
  ctx.strokeStyle=accent||'#58a6ff';ctx.lineWidth=1.5
  ctx.beginPath();ctx.roundRect(cx-maxW/2,cy-bh,maxW,bh,10);ctx.stroke()
  // Title bar
  ctx.fillStyle=accent||'#58a6ff'
  ctx.beginPath();ctx.roundRect(cx-maxW/2,cy-bh,maxW,20,{tl:10,tr:10,br:0,bl:0});ctx.fill()
  ctx.fillStyle='#fff';ctx.font='bold 8px "Consolas",monospace';ctx.textAlign='center'
  ctx.fillText('Agent Log',cx,cy-bh+14)
  // Log lines
  lines.slice(0,maxLines).forEach(function(m,i){
    var color='#c9d1d9'
    if(m.indexOf('[error')>=0||m.indexOf('[fix')>=0)color='#f85149'
    else if(m.indexOf('[read')>=0||m.indexOf('[search')>=0)color='#58a6ff'
    else if(m.indexOf('[edit')>=0||m.indexOf('[write')>=0)color='#3fb950'
    else if(m.indexOf('[build')>=0||m.indexOf('[test')>=0)color='#d29922'
    ctx.fillStyle=color
    ctx.font='9px "Consolas",monospace'
    ctx.textAlign='left'
    var txt=m.length>34?m.slice(0,31)+'...':m
    ctx.fillText(txt,cx-maxW/2+10,cy-bh+35+i*14)
  })
  ctx.restore()
}\n\nfunction init()`
)

// ── MODIFICATION 3: When setting speech bubble, retain it longer for active agents ──
// The bubble clear timeout should not trigger while agent is active
modified = modified.replace(
  "clearTimeout(ch._bt)\n        ch._bt=setTimeout(()=>{ch.tsm='';ch.ts=''},3000)",
  "clearTimeout(ch._bt)\n        if(isIdle||!isActive){ch._bt=setTimeout(()=>{ch.tsm='';ch.ts=''},3000)}else{ch._bt=setTimeout(()=>{if(ch.w||ch.state!=='idle'){if(ch.tsm&&Array.isArray(ch.tsm)&&ch.tsm.length>2)ch.tsm=ch.tsm.slice(-2)}else{ch.tsm='';ch.ts=''}},8000)}"
)

// ── MODIFICATION 4: Increase _msgs from 2 to 5 entries for richer speech bubble ──
modified = modified.replace(
  "if(ch._msgs.length>2)ch._msgs.shift()",
  "if(ch._msgs.length>5)ch._msgs.shift()"
)

// ── Write final office.js ──
const final = modified + '\n\n' + bridgeCode
fs.writeFileSync('skills/virtual-office/extension/media/office.js', final, 'utf-8')
console.log('office.js built successfully:', final.length, 'bytes')
console.log('Contains drawAgentLogDialog:', final.includes('drawAgentLogDialog'))
console.log('Contains VSCode Bridge:', final.includes('normalizeVSCodeEvent'))
console.log('Contains 5-line speech:', final.includes('slice(-5)'))
console.log('Contains larger _msgs:', final.includes('_msgs.length>5'))
