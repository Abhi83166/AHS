export function renderAir(root, state) {
  const el = document.createElement('div');
  const rows = state.air.map(r => row(r)).join('');
  el.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">Air Quality</div>
        <span class="badge">PM2.5 / CO2 / TVOC</span>
      </div>
      <div class="grid cols-3">${rows}</div>
    </div>
  `;
  root.appendChild(el);
}

function row(r) {
  const aqi = aqiLabel(r.pm25);
  return `<div class="tile">
    <div>
      <div class="metric">${r.room}</div>
      <div class="sub">${aqi}</div>
    </div>
    <div>
      <div class="sub">PM2.5</div>
      <div class="metric">${r.pm25} <span class="sub">µg/m³</span></div>
    </div>
    <div>
      <div class="sub">CO₂</div>
      <div class="metric">${r.co2} <span class="sub">ppm</span></div>
    </div>
  </div>`;
}

function aqiLabel(p) { if (p < 12) return 'Great'; if (p < 35) return 'Good'; if (p < 55) return 'Moderate'; if (p < 150) return 'Poor'; return 'Severe'; }
