export function renderPresence(root, state) {
  const el = document.createElement('div');
  const p = state.presence;
  const rooms = Object.entries(p.rooms).map(([k,v]) => `<div class="tile"><div class="metric">${k}</div><div class="sub">${v} present</div></div>`).join('');
  el.innerHTML = `
    <div class="card">
      <div class="card-header"><div class="card-title">Presence</div></div>
      <div class="grid cols-3">
        <div class="tile"><div class="metric">People at home</div><div class="sub">${p.people} (${p.names.join(', ')})</div></div>
        ${rooms}
      </div>
    </div>
  `;
  root.appendChild(el);
}
