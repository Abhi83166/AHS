export function renderGarden(root, state) {
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="card">
      <div class="card-header"><div class="card-title">Garden & Irrigation</div></div>
      <div class="grid cols-3">
        ${state.garden.map(z => `<div class="tile"><div><div class="sub">${z.zone}</div><div class="metric">${z.moisture_pct}%</div></div><div class="sub">Next: ${eta(z.next_run)}</div></div>`).join('')}
      </div>
    </div>
  `;
  root.appendChild(el);
}

function eta(ts){ const s=Math.max(0, ts - Math.floor(Date.now()/1000)); const h=Math.floor(s/3600); const m=Math.floor((s%3600)/60); return h? `${h}h ${m}m` : `${m}m`; }
