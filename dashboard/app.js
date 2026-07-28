async function loadMemory() {
  const el = document.getElementById("memory-list");
  try {
    const res = await fetch("/.memory/index.json");
    if (!res.ok) throw new Error("no memory");
    const data = await res.json();
    el.innerHTML = `<div class="mem-item"><span class="mem-name">index</span><span class="mem-meta">${data.memory_count ?? 0} entries · conf ${data.confidence ?? "?"}%</span></div>`;
  } catch {
    el.innerHTML = '<p class="dim">No memory. Start a session first.</p>';
  }
}

async function loadPipeline() {
  const el = document.getElementById("pipeline-list");
  try {
    const res = await fetch("/.pipeline-state.json");
    if (!res.ok) throw new Error("no pipeline");
    const data = await res.json();
    el.innerHTML = data.map(s =>
      `<div class="mem-item"><span class="mem-name">${s.phase}</span><span class="mem-meta">→ ${s.agent ?? "?"} · ${s.status ?? "pending"}</span></div>`
    ).join("");
  } catch {
    el.innerHTML = '<p class="dim">No active pipeline.</p>';
  }
}

async function loadVersion() {
  try {
    const res = await fetch("/package.json");
    const data = await res.json();
    document.getElementById("version").textContent = `v${data.version}`;
  } catch { /* ignore */ }
}

loadMemory();
loadPipeline();
loadVersion();
