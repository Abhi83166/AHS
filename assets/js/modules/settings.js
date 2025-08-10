export function renderSettings(root) {
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="card">
      <div class="card-header"><div class="card-title">Settings</div><span class="badge">Local only</span></div>
      <div class="grid cols-2">
        <div>
          <div class="sub">Theme</div>
          <div class="row"><button class="icon-btn">Dark</button><button class="icon-btn">Auto</button></div>
        </div>
        <div>
          <div class="sub">Data Source</div>
          <div class="row"><span class="badge">Demo</span><span class="badge">API (coming soon)</span></div>
        </div>
      </div>
    </div>
  `;
  root.appendChild(el);
}
