export function renderAutomations(root, state) {
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="card">
      <div class="card-header"><div class="card-title">Scenes</div><span class="badge">Tap to trigger</span></div>
      <div class="grid cols-4">
        ${state.scenes.map(s => sceneBtn(s)).join('')}
      </div>
    </div>
  `;
  root.appendChild(el);
}

function sceneBtn(s) {
  return `<button class="icon-btn" style="height:64px; justify-content:center; font-weight:600;">${s.name}</button>`;
}
