export function renderLeaks(root, state) {
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="card">
      <div class="card-header"><div class="card-title">Water Leaks</div></div>
      <div class="grid cols-3">
        ${state.leaks.map(l => `<div class="tile"><div class="metric">${l.location}</div><div class="sub ${l.wet?'err':'ok'}">${l.wet?'Wet':'Dry'}</div><div class="sub">${l.battery}%</div></div>`).join('')}
      </div>
    </div>
  `;
  root.appendChild(el);
}
