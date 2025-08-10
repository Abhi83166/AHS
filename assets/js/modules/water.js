export function renderWater(root, state) {
  const w = state.water;
  const el = document.createElement('div');
  el.innerHTML = `
    <div style="display: flex; flex-wrap: wrap; gap: 16px; width: 100%;">
      <div class="card" style="flex: 1; min-width: 400px; max-width: 600px;">
        <div class="card-header"><div class="card-title">Water Tank</div><span class="badge">AquaGuardian</span></div>
        <div style="display: flex; gap: 16px; align-items: center;">
          <div style="border: 1px solid var(--card-border); border-radius: 10px; height: 260px; width: 140px; position: relative; background: var(--bg-secondary); flex-shrink: 0;">
            <div id="waterFill" style="position: absolute; bottom: 0; left: 0; right: 0; height: ${w.level_pct}%; background: linear-gradient(180deg, var(--primary), var(--primary-2)); border-radius: 0 0 9px 9px;"></div>
          </div>
          <div style="flex: 1;">
            <div class="row"><div class="sub">Level</div><div class="metric">${Math.round(w.level_pct)}%</div></div>
            <div class="row"><div class="sub">Depth</div><div class="metric">${w.depth_cm.toFixed(0)} cm</div></div>
            <div class="row"><div class="sub">Motor</div><div class="metric ${w.motor?'ok':'sub'}">${w.motor?'Running':'Off'}</div></div>
            <div class="row"><div class="sub">Mode</div><div class="metric">${w.mode==='auto'?'Auto':'Manual'}</div></div>
            <div class="row"><div class="sub">Leak</div><div class="metric ${w.leak?'err':'ok'}">${w.leak?'Detected':'None'}</div></div>
          </div>
        </div>
      </div>
      <div class="card" style="flex: 1; min-width: 300px; max-width: 400px;">
        <div class="card-header"><div class="card-title">Usage (7 days)</div></div>
        <canvas id="waterHistory" width="350" height="160" style="width: 100%; height: 160px;"></canvas>
      </div>
      <div class="card" style="flex: 1; min-width: 300px; max-width: 400px;">
        <div class="card-header"><div class="card-title">Power Cost</div></div>
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
    new Chart(ctx, { type:'bar', data:{ labels, datasets:[{ label:'Liters', data:usage, backgroundColor:'rgba(0,122,255,0.6)', borderColor:'rgba(0,122,255,0.9)', borderWidth:1, borderRadius:5 }]}, options:{ plugins:{ legend:{display:false}}, scales:{ x:{ grid:{display:false}, ticks:{ color:getComputedStyle(document.documentElement).getPropertyValue('--muted')}}, y:{ grid:{ color:'rgba(0,0,0,.05)'}, ticks:{ color:getComputedStyle(document.documentElement).getPropertyValue('--muted')} } }, maintainAspectRatio:false, responsive:false } });

    const c2 = el.querySelector('#waterCost').getContext('2d');
    const costs = [rand(4,9), rand(25,45), rand(90,150), rand(900,1600)];
    new Chart(c2, { type:'doughnut', data:{ labels:['Daily','Weekly','Monthly','Yearly'], datasets:[{ data:costs, backgroundColor:['#60a5fa','#22c55e','#f59e0b','#8b5cf6'], borderColor:['#3b82f6','#16a34a','#d97706','#7c3aed'] }]}, options:{ plugins:{ legend:{ position:'bottom', labels:{ color:getComputedStyle(document.documentElement).getPropertyValue('--muted')} } }, cutout:'60%', maintainAspectRatio:false, responsive:false } });
  }
}

function rand(a,b){ return Math.random()*(b-a)+a; }
