import { sparkline } from '../widgets/spark.js';

export function renderDashboard(root, state) {
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="grid cols-4">
      ${tile('Water Tank', '#/water', `${Math.round(state.water.level_pct)}%`, 'Level', icon('water'), state.water.leak ? tag('Leak', 'err') : tag(state.water.mode === 'auto' ? 'Auto' : 'Manual'))}
      ${tile('Energy', '#/energy', `${state.energy.kw.toFixed(2)} kW`, 'Live Load', icon('bolt'), tag(`${state.energy.kwh_today.toFixed(1)} kWh`))}
      ${tile('Air Quality', '#/air', aqiLabel(state.air), 'PM2.5/CO2', icon('wind'), tag(`${state.air[0].pm25} µg/m³`))}
      ${tile('Security', '#/security', onlineCams(state) + ' online', 'Cameras', icon('shield'), tag(motionBadge(state)))}
    </div>

    <div style="height:8px"></div>

    <div class="grid cols-3">
      ${tile('Doors & Windows', '#/doors', openDoors(state), 'Open', icon('door'))}
      ${tile('Presence', '#/presence', `${state.presence.people} home`, 'People', icon('users'))}
      ${tile('Weather', '#/weather', `${state.weather.t.toFixed(1)}°C`, `${state.weather.rh}% RH`, icon('sun'))}
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">House Health</div>
        <span class="badge">Local-first</span>
      </div>
      <div class="grid cols-4">
        ${kpi('CPU', state.system.cpu + '%')}
        ${kpi('RAM', state.system.ram + '%')}
        ${kpi('Disk', state.system.disk + '%')}
        ${kpi('Backup', timeAgo(state.system.last_backup))}
      </div>
    </div>
  `;

  root.appendChild(el);

  // attach spark lines to main tiles
  const waterSpark = el.querySelector('[data-spark="water"]');
  if (waterSpark) sparkline(waterSpark, genSpark(24, 45, 95));
  const energySpark = el.querySelector('[data-spark="energy"]');
  if (energySpark) sparkline(energySpark, genSpark(24, 0.2, 2.2));
}

function tile(title, href, metric, sub, svg, badge = '') {
  return `
    <a class="tile" href="${href}">
      <div>${svg}</div>
      <div style="flex: 1; margin-left: 8px;">
        <div class="kpi">
          <div>
            <div class="metric">${metric}</div>
            <div class="sub">${sub}</div>
          </div>
          ${badge}
        </div>
      </div>
      <div style="margin-left: auto; color: var(--muted);">→</div>
    </a>
  `;
}

function kpi(name, value) {
  return `<div class="tile" style="flex-direction: column; text-align: center; min-width: 120px;">
    <div class="sub">${name}</div>
    <div class="metric">${value}</div>
  </div>`
}

function tag(text, tone='ok') { return `<span class="badge ${tone}">${text}</span>`; }
function icon(name) {
  const map = {
    water: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2s7 8 7 12a7 7 0 1 1-14 0C5 10 12 2 12 2Z" stroke="var(--primary-2)" stroke-width="1.6"/></svg>`,
    bolt: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M13 2 3 14h7l-1 8 12-14h-7l-1-6Z" stroke="var(--accent)" stroke-width="1.6"/></svg>`,
    wind: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 12h10a3 3 0 1 0-3-3" stroke="var(--primary-2)" stroke-width="1.6"/><path d="M2 18h14a3 3 0 1 1-3 3" stroke="var(--accent)" stroke-width="1.6"/></svg>`,
    shield: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 3 4 6v6c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V6l-8-3Z" stroke="#9cc0ff" stroke-width="1.6"/></svg>`,
    door: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 21h12V3H8v14H6v4Z" stroke="#b3c2da" stroke-width="1.6"/></svg>`,
    users: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="4" stroke="#b3c2da" stroke-width="1.6"/><path d="M17 11a4 4 0 1 0 0-8 4 4 0 0 1 0 8Zm-12 9a7 7 0 1 1 14 0" stroke="#9cc0ff" stroke-width="1.6"/></svg>`,
    sun: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke="#ffd86b" stroke-width="1.6"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.2 4.2 6.3 6.3m11.4 11.4 2.1 2.1M17.7 6.3l2.1-2.1M4.2 19.8l2.1-2.1" stroke="#ffd86b" stroke-width="1.6"/></svg>`
  };
  return map[name] || '';
}

function aqiLabel(rooms) {
  const p = Math.max(...rooms.map(r => r.pm25));
  if (p < 12) return 'Great'; if (p < 35) return 'Good'; if (p < 55) return 'Moderate'; if (p < 150) return 'Poor'; return 'Severe';
}
function onlineCams(state) { return state.security.cams.filter(c => c.online).length + '/' + state.security.cams.length; }
function motionBadge(state) { return state.security.cams.some(c => c.motion) ? 'Motion' : 'Idle'; }
function openDoors(state) { return state.doors.filter(d => d.open).length + ' open'; }
function timeAgo(ts) { const s = Math.floor(Date.now()/1000 - ts); const h = Math.floor(s/3600); return h>0? `${h}h ago` : `${Math.floor(s/60)}m ago`; }
function genSpark(n, min, max) { return Array.from({length:n}, () => (Math.random()*(max-min)+min)); }
