export function renderEnergy(root, state) {
  const e = state.energy;
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="grid cols-3">
      <div class="card">
        <div class="card-header"><div class="card-title">Live Load</div></div>
        <div class="metric">${e.kw.toFixed(2)} kW</div>
        <div class="sub">Voltage ${e.voltage} V</div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">Today</div></div>
        <div class="metric">${e.kwh_today.toFixed(1)} kWh</div>
        <div class="sub">Estimate ₹ ${(e.kwh_today*7).toFixed(1)}</div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">Trend</div></div>
        <canvas id="energySpark" height="120"></canvas>
      </div>
    </div>
  `;
  root.appendChild(el);
  if (window.Chart) {
    const ctx = el.querySelector('#energySpark').getContext('2d');
    const data = Array.from({length:48}).map(()=>Math.random()*2.5+0.2);
    new Chart(ctx, {
      type:'line',
      data:{ labels:data.map((_,i)=>i), datasets:[{ data, borderColor:'#60a5fa', fill:false, tension:.35 }] },
      options:{
        plugins:{legend:{display:false}},
        scales:{ x:{ display:false }, y:{ display:false } },
        elements:{ point:{ radius:0 }},
        maintainAspectRatio:false,
        responsive:true
      }
    });
  }
}
