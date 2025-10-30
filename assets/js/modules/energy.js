export function renderEnergy(root, state) {
  const e = state.energy;
  const el = document.createElement('div');
  
  // Calculate today's cost and efficiency
  const todayCost = (e.kwh_today * 7).toFixed(1);
  const efficiency = e.kw < 1.5 ? 'Efficient' : e.kw < 2.0 ? 'Normal' : 'High';
  const efficiencyColor = e.kw < 1.5 ? '#10b981' : e.kw < 2.0 ? '#f59e0b' : '#ef4444';
  
  el.innerHTML = `
    <div class="module-container energy-module">
      <div class="card main-card energy-themed">
        <div class="card-header">
          <div class="card-title" style="color: var(--energy-primary);">Power Monitoring</div>
          <span class="badge" style="background: var(--energy-matte); color: var(--energy-primary); border-color: var(--energy-primary);">Live</span>
        </div>
        <div class="power-metrics">
          <div class="power-metric">
            <div class="sub" style="margin-bottom: 8px;">Current Load</div>
            <div class="metric" style="font-size: 32px; color: var(--energy-primary); margin-bottom: 8px;">${e.kw.toFixed(2)}</div>
            <div class="sub" style="font-weight: 600;">kW</div>
            <div style="margin-top: 12px; font-size: 12px; color: ${efficiencyColor}; font-weight: 600;">${efficiency} Usage</div>
          </div>
          <div class="power-metric">
            <div class="sub" style="margin-bottom: 8px;">Grid Voltage</div>
            <div class="metric" style="font-size: 32px; color: var(--energy-primary); margin-bottom: 8px;">${e.voltage}</div>
            <div class="sub" style="font-weight: 600;">V</div>
            <div style="margin-top: 12px; font-size: 12px; color: ${e.voltage >= 220 && e.voltage <= 240 ? '#10b981' : '#ef4444'}; font-weight: 600;">${e.voltage >= 220 && e.voltage <= 240 ? 'Normal' : 'Alert'}</div>
          </div>
        </div>
        <div class="consumption-summary">
          <div class="consumption-item">
            <div class="sub">Today's Consumption</div>
            <div class="metric" style="color: var(--energy-primary);">${e.kwh_today.toFixed(1)} kWh</div>
          </div>
          <div class="consumption-item">
            <div class="sub">Estimated Cost</div>
            <div class="metric" style="color: var(--energy-primary);">₹${todayCost}</div>
          </div>
        </div>
      </div>
      
      <div class="card chart-card">
        <div class="card-header">
          <div class="card-title" style="color: var(--energy-primary);">48-Hour Trend</div>
        </div>
        <canvas id="energyTrend" width="350" height="180" style="width: 100%; height: 180px;"></canvas>
      </div>
      
      <div class="card chart-card">
        <div class="card-header">
          <div class="card-title" style="color: var(--energy-primary);">Weekly Overview</div>
        </div>
        <canvas id="energyWeekly" width="350" height="180" style="width: 100%; height: 180px;"></canvas>
      </div>
    </div>
  `;
  root.appendChild(el);
  
  if (window.Chart) {
    // 48-Hour Trend Chart
    const trendCtx = el.querySelector('#energyTrend')?.getContext('2d');
    if (trendCtx) {
      const data = Array.from({length:48}).map(()=>Math.random()*2.5+0.2);
      new Chart(trendCtx, {
        type: 'line',
        data: { 
          labels: data.map((_, i) => i % 2 === 0 ? i/2 + 'h' : ''),
          datasets: [{ 
            data, 
            borderColor: 'rgba(249, 115, 22, 0.9)', 
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            fill: true, 
            tension: 0.35,
            borderWidth: 2
          }] 
        },
        options: {
          plugins: { legend: { display: false } },
          scales: { 
            x: { grid: { display: false }, ticks: { color: '#6b7280' } },
            y: { grid: { color: 'rgba(249, 115, 22, 0.1)' }, ticks: { color: '#6b7280' } }
          },
          elements: { point: { radius: 0 } },
          maintainAspectRatio: false,
          responsive: false
        }
      });
    }
    
    // Weekly Overview Chart
    const weeklyCtx = el.querySelector('#energyWeekly')?.getContext('2d');
    if (weeklyCtx) {
      const weekData = Array.from({length: 7}, () => Math.round(Math.random() * 15 + 5));
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      new Chart(weeklyCtx, {
        type: 'bar',
        data: {
          labels: days,
          datasets: [{
            label: 'kWh',
            data: weekData,
            backgroundColor: 'rgba(249, 115, 22, 0.6)',
            borderColor: 'rgba(249, 115, 22, 0.9)',
            borderWidth: 1,
            borderRadius: 8
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#6b7280' } },
            y: { grid: { color: 'rgba(249, 115, 22, 0.1)' }, ticks: { color: '#6b7280' } }
          },
          maintainAspectRatio: false,
          responsive: false
        }
      });
    }
  }
}
