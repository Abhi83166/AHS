export function renderAir(root, state) {
  const el = document.createElement('div');
  const rows = state.air.map(r => row(r)).join('');
  el.innerHTML = `
    <div class="module-container air-module">
      <div class="card main-card air-themed">
        <div class="card-header">
          <div class="card-title" style="color: var(--air-primary);">Air Quality Monitoring</div>
          <span class="badge" style="background: var(--air-matte); color: var(--air-primary); border-color: var(--air-primary);">Real-time</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 16px;">${rows}</div>
      </div>
      
      <div class="card chart-card">
        <div class="card-header">
          <div class="card-title" style="color: var(--air-primary);">Air Quality Index</div>
        </div>
        <canvas id="airChart" width="350" height="200" style="width: 100%; height: 200px;"></canvas>
      </div>
      
      <div class="card chart-card">
        <div class="card-header">
          <div class="card-title" style="color: var(--air-primary);">24-Hour Trend</div>
        </div>
        <canvas id="airTrend" width="350" height="200" style="width: 100%; height: 200px;"></canvas>
      </div>
    </div>
  `;
  root.appendChild(el);
  
  // Add charts if Chart.js is available
  if (window.Chart) {
    // AQI Gauge Chart
    const aqiCtx = el.querySelector('#airChart')?.getContext('2d');
    if (aqiCtx) {
      const avgPM25 = state.air.reduce((sum, r) => sum + r.pm25, 0) / state.air.length;
      new Chart(aqiCtx, {
        type: 'doughnut',
        data: {
          labels: ['Great', 'Good', 'Moderate', 'Poor', 'Severe'],
          datasets: [{
            data: [12, 23, 20, 95, Math.max(0, 200-avgPM25)],
            backgroundColor: [
              'rgba(16, 185, 129, 0.8)',
              'rgba(16, 185, 129, 0.6)', 
              'rgba(16, 185, 129, 0.4)',
              'rgba(16, 185, 129, 0.3)',
              'rgba(16, 185, 129, 0.1)'
            ],
            borderColor: '#ffffff',
            borderWidth: 2
          }]
        },
        options: {
          plugins: { 
            legend: { position: 'bottom', labels: { color: '#6b7280', usePointStyle: true, padding: 15 } }
          },
          cutout: '70%',
          maintainAspectRatio: false,
          responsive: false
        }
      });
    }
    
    // Trend Chart
    const trendCtx = el.querySelector('#airTrend')?.getContext('2d');
    if (trendCtx) {
      const hours = Array.from({length: 24}, (_, i) => i + 'h');
      const pm25Data = Array.from({length: 24}, () => Math.round(Math.random() * 40 + 10));
      
      new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: hours,
          datasets: [{
            label: 'PM2.5',
            data: pm25Data,
            borderColor: 'rgba(16, 185, 129, 0.9)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#6b7280' } },
            y: { grid: { color: 'rgba(16, 185, 129, 0.1)' }, ticks: { color: '#6b7280' } }
          },
          maintainAspectRatio: false,
          responsive: false
        }
      });
    }
  }
}

function row(r) {
  const aqi = aqiLabel(r.pm25);
  const aqiColor = getAQIColor(r.pm25);
  return `<div class="tile" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.04) 0%, rgba(255,255,255,0.8) 100%); border-color: rgba(16, 185, 129, 0.1); justify-content: space-between; align-items: center; padding: 20px 24px;">
    <div style="display: flex; align-items: center; gap: 16px;">
      <div style="width: 12px; height: 12px; border-radius: 50%; background: ${aqiColor}; box-shadow: 0 0 8px ${aqiColor};"></div>
      <div>
        <div class="metric" style="font-size: 18px; margin-bottom: 4px;">${r.room}</div>
        <div class="sub" style="color: ${aqiColor}; font-weight: 600;">${aqi}</div>
      </div>
    </div>
    <div style="display: flex; gap: 32px; text-align: center;">
      <div>
        <div class="sub" style="margin-bottom: 4px;">PM2.5</div>
        <div class="metric" style="color: var(--air-primary);">${r.pm25}</div>
        <div class="sub" style="font-size: 11px;">µg/m³</div>
      </div>
      <div>
        <div class="sub" style="margin-bottom: 4px;">CO₂</div>
        <div class="metric" style="color: var(--air-primary);">${r.co2}</div>
        <div class="sub" style="font-size: 11px;">ppm</div>
      </div>
      <div>
        <div class="sub" style="margin-bottom: 4px;">Temp</div>
        <div class="metric" style="color: var(--air-primary);">${r.t.toFixed(1)}°</div>
        <div class="sub" style="font-size: 11px;">Celsius</div>
      </div>
    </div>
  </div>`;
}

function getAQIColor(pm25) {
  if (pm25 < 12) return '#10b981';  // Great - green
  if (pm25 < 35) return '#22c55e';  // Good - light green
  if (pm25 < 55) return '#f59e0b';  // Moderate - yellow
  if (pm25 < 150) return '#f97316'; // Poor - orange
  return '#ef4444';                 // Severe - red
}

function aqiLabel(p) { if (p < 12) return 'Great'; if (p < 35) return 'Good'; if (p < 55) return 'Moderate'; if (p < 150) return 'Poor'; return 'Severe'; }
