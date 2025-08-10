export function renderSafety(root, state) {
  const s = state.safety;
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="card">
      <div class="card-header"><div class="card-title">Gas & Smoke</div></div>
      <div class="grid cols-3">
        <div class="tile"><div class="sub">LPG</div><div class="metric ${s.lpg>200?'warn':''}">${s.lpg} ppm</div></div>
        <div class="tile"><div class="sub">CO</div><div class="metric ${s.co>20?'warn':''}">${s.co} ppm</div></div>
        <div class="tile"><div class="sub">Smoke</div><div class="metric ${s.smoke>2?'warn':''}">${s.smoke}</div></div>
      </div>
    </div>
  `;
  root.appendChild(el);
}
