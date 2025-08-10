export function renderDoors(root, state) {
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="card">
      <div class="card-header"><div class="card-title">Doors & Windows</div><span class="badge">Contact sensors</span></div>
      <div class="grid cols-3">
        ${state.doors.map(d => `<div class="tile"><div class="metric">${d.id}</div><div class="sub ${d.open?'warn':'ok'}">${d.open?'Open':'Closed'}</div><div class="sub">🔋 ${d.battery}%</div></div>`).join('')}
      </div>
    </div>
  `;
  root.appendChild(el);
}
