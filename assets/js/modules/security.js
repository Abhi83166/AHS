export function renderSecurity(root, state) {
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="card">
      <div class="card-header"><div class="card-title">Cameras</div><span class="badge">Demo</span></div>
      <div class="grid cols-3">
        ${state.security.cams.map(c => camCard(c)).join('')}
      </div>
    </div>
  `;
  root.appendChild(el);
}

function camCard(c) {
  return `<div class="tile">
    <div>
      <div class="metric">${c.cam}</div>
      <div class="sub ${c.online ? 'ok':'err'}">${c.online ? 'Online':'Offline'}</div>
    </div>
    <div class="sub ${c.motion?'warn':''}">${c.motion? 'Motion' : 'Idle'}</div>
    <div>→</div>
  </div>`
}
