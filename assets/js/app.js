import { bus, initDataLayer, getState } from './datastore.js';
import { renderDashboard } from './modules/dashboard.js';
import { renderWater } from './modules/water.js';
import { renderAir } from './modules/air.js';
import { renderEnergy } from './modules/energy.js';
import { renderSecurity } from './modules/security.js';
import { renderAutomations } from './modules/automations.js';
import { renderSettings } from './modules/settings.js';
import { renderGarden } from './modules/garden.js';
import { renderSafety } from './modules/safety.js';
import { renderLeaks } from './modules/leaks.js';
import { renderDoors } from './modules/doors.js';
import { renderWeather } from './modules/weather.js';
import { renderPresence } from './modules/presence.js';

// Tiny client-side router (hash-based)
const routes = {
  '': renderDashboard,
  '#/': renderDashboard,
  '#/dashboard': renderDashboard,
  '#/water': renderWater,
  '#/air': renderAir,
  '#/energy': renderEnergy,
  '#/security': renderSecurity,
  '#/automations': renderAutomations,
  '#/garden': renderGarden,
  '#/safety': renderSafety,
  '#/leaks': renderLeaks,
  '#/doors': renderDoors,
  '#/weather': renderWeather,
  '#/presence': renderPresence,
  '#/settings': renderSettings,
};

function setActiveNav(hash) {
  document.querySelectorAll('.nav-link').forEach(a => a.classList.toggle('active', a.getAttribute('href') === hash));
}

function render() {
  const root = document.getElementById('view');
  const hash = location.hash || '#/dashboard';
  const fn = routes[hash] || renderDashboard;
  setActiveNav(hash || '#/dashboard');
  root.innerHTML = '';
  const state = getState();
  fn(root, state);
}

window.addEventListener('hashchange', render);

// Disable automatic re-renders to prevent layout issues
// bus.on('state:update', () => {
//   const currentHash = location.hash || '#/dashboard';
//   if (currentHash === '#/dashboard' || currentHash === '#/' || currentHash === '') {
//     updateDashboardData();
//   }
// });

function updateDashboardData() {
  const root = document.getElementById('view');
  if (root && root.innerHTML.includes('dashboard')) {
    const state = getState();
    // Update only data elements, not the entire structure
    updateDataElements(state);
  }
}

function updateDataElements(state) {
  // Update metrics without full re-render
  document.querySelectorAll('[data-metric]').forEach(el => {
    const metric = el.dataset.metric;
    const [module, field] = metric.split('.');
    
    if (state[module]) {
      let value = state[module];
      if (field) {
        value = field.split('.').reduce((obj, key) => obj?.[key], value);
      }
      
      if (value !== undefined) {
        if (el.classList.contains('metric')) {
          el.textContent = formatMetricValue(metric, value);
        } else {
          el.textContent = value;
        }
      }
    }
  });
  
  // Update status indicators
  document.querySelectorAll('[data-status]').forEach(el => {
    const statusPath = el.dataset.status;
    const [module, ...fields] = statusPath.split('.');
    
    if (state[module]) {
      let value = fields.reduce((obj, key) => obj?.[key], state[module]);
      if (value !== undefined) {
        updateStatusClass(el, value);
      }
    }
  });
}

function formatMetricValue(metric, value) {
  switch(metric) {
    case 'water.level_pct':
      return `${Math.round(value)}%`;
    case 'energy.kw':
      return `${value.toFixed(2)} kW`;
    case 'energy.kwh_today':
      return `${value.toFixed(1)} kWh`;
    default:
      return typeof value === 'number' ? value.toFixed(1) : value;
  }
}

function updateStatusClass(el, value) {
  el.classList.remove('ok', 'warn', 'err');
  if (typeof value === 'boolean') {
    el.classList.add(value ? 'ok' : 'err');
  } else if (typeof value === 'string') {
    if (value === 'ok' || value === 'online') el.classList.add('ok');
    else if (value === 'warn' || value === 'warning') el.classList.add('warn');
    else if (value === 'error' || value === 'offline') el.classList.add('err');
  }
}

// Mobile menu toggle
function initMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.querySelector('.sidebar');
  
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      sidebar.classList.toggle('open');
    });
    
    // Close menu when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 1200) {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
          menuToggle.classList.remove('active');
          sidebar.classList.remove('open');
        }
      }
    });
  }
}

// Initialize
(async function init() {
  await initDataLayer();
  render();
  initMobileMenu();
})();
