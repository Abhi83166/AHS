export function renderWater(root, state) {
  const w = state.water;
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="module-container water-module">
      <div class="card main-card water-themed">
        <div class="card-header"><div class="card-title" style="color: var(--water-primary);">Water Tank</div><span class="badge" style="background: var(--water-matte); color: var(--water-primary); border-color: var(--water-primary);">AquaGuardian</span></div>
        <div class="tank-display">
          <div class="tank-visual">
            <div id="waterFill" style="position: absolute; bottom: 0; left: 0; right: 0; height: ${w.level_pct}%; background: linear-gradient(180deg, var(--water-primary), rgba(14, 165, 233, 0.7)); border-radius: 0 0 14px 14px; box-shadow: 0 -4px 16px rgba(14, 165, 233, 0.3);"></div>
          </div>
          <div class="tank-metrics">
            <div class="row"><div class="sub">Level</div><div class="metric">${Math.round(w.level_pct)}%</div></div>
            <div class="row"><div class="sub">Depth</div><div class="metric">${w.depth_cm.toFixed(0)} cm</div></div>
            <div class="row"><div class="sub">Motor</div><div class="metric ${w.motor?'ok':'sub'}">${w.motor?'Running':'Off'}</div></div>
            <div class="row"><div class="sub">Mode</div><div class="metric">${w.mode==='auto'?'Auto':'Manual'}</div></div>
            <div class="row"><div class="sub">Leak</div><div class="metric ${w.leak?'err':'ok'}">${w.leak?'Detected':'None'}</div></div>
          </div>
        </div>
      </div>
      <div class="card chart-card">
        <div class="card-header"><div class="card-title" style="color: var(--water-primary);">Usage (7 days)</div></div>
        <canvas id="waterHistory" width="350" height="160" style="width: 100%; height: 160px;"></canvas>
      </div>
      <div class="card chart-card">
        <div class="card-header"><div class="card-title" style="color: var(--water-primary);">Power Cost</div></div>
        <canvas id="waterCost" width="350" height="160" style="width: 100%; height: 160px;"></canvas>
      </div>
    </div>
  `;
  root.appendChild(el);

  // lazy import chart.js from global if available
  if (window.Chart) {
    const ctx = el.querySelector('#waterHistory').getContext('2d');
    const labels = Array.from({length:7}).map((_,i)=>['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][(new Date(Date.now()- (6-i)*86400000)).getDay()]);
    const usage = Array.from({length:7}).map(()=>Math.round( rand(120, 350) ));
    new Chart(ctx, { type:'bar', data:{ labels, datasets:[{ label:'Liters', data:usage, backgroundColor:'rgba(14, 165, 233, 0.6)', borderColor:'rgba(14, 165, 233, 0.9)', borderWidth:1, borderRadius:8 }]}, options:{ plugins:{ legend:{display:false}}, scales:{ x:{ grid:{display:false}, ticks:{ color:'#6b7280'}}, y:{ grid:{ color:'rgba(14, 165, 233, 0.1)'}, ticks:{ color:'#6b7280'} } }, maintainAspectRatio:false, responsive:false } });

    const c2 = el.querySelector('#waterCost').getContext('2d');
    const costs = [rand(4,9), rand(25,45), rand(90,150), rand(900,1600)];
    new Chart(c2, { type:'doughnut', data:{ labels:['Daily','Weekly','Monthly','Yearly'], datasets:[{ data:costs, backgroundColor:['rgba(14, 165, 233, 0.8)','rgba(14, 165, 233, 0.6)','rgba(14, 165, 233, 0.4)','rgba(14, 165, 233, 0.2)'], borderColor:'#ffffff', borderWidth:2 }]}, options:{ plugins:{ legend:{ position:'bottom', labels:{ color:'#6b7280', usePointStyle: true, padding: 20} } }, cutout:'65%', maintainAspectRatio:false, responsive:false } });
  }
}

function rand(a,b){ return Math.random()*(b-a)+a; }
