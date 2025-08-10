export function renderWeather(root, state) {
  const w = state.weather;
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="card">
      <div class="card-header"><div class="card-title">Weather</div></div>
      <div class="grid cols-3">
        <div class="tile"><div class="sub">Temperature</div><div class="metric">${w.t.toFixed(1)}°C</div></div>
        <div class="tile"><div class="sub">Humidity</div><div class="metric">${w.rh}%</div></div>
        <div class="tile"><div class="sub">PM2.5</div><div class="metric">${w.pm25}</div></div>
      </div>
    </div>
  `;
  root.appendChild(el);
}
