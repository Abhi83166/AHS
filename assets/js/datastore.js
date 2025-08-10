// Simple event bus
export const bus = {
  events: {},
  on(evt, cb) { (this.events[evt] ??= []).push(cb); return () => this.off(evt, cb); },
  off(evt, cb) { this.events[evt] = (this.events[evt]||[]).filter(f => f!==cb); },
  emit(evt, data) { (this.events[evt]||[]).forEach(cb => cb(data)); }
};

// Config (runtime overrideable via /config/config.json)
export let config = {
  demo: true,
  apiBaseUrl: '', // e.g. http://pi:8080
};

async function loadConfig() {
  try {
    const res = await fetch('config/config.json', { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      config = { ...config, ...json };
    }
  } catch (_) { /* ignore, stay with defaults */ }
}

// Demo data generators
function rand(min, max) { return Math.random() * (max - min) + min; }
function now() { return Math.floor(Date.now()/1000); }
function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

const state = {
  water: { level_pct: 72, depth_cm: 120, motor: false, mode: 'auto', leak: false, ts: now() },
  air: [
    { room: 'living', pm25: 18, co2: 720, tvoc: 110, t: 28.2, rh: 52, ts: now() },
    { room: 'bedroom', pm25: 10, co2: 650, tvoc: 90, t: 27.1, rh: 56, ts: now() },
  ],
  energy: { kw: 0.82, kwh_today: 7.8, voltage: 229, ts: now() },
  security: {
    cams: [
      { cam: 'gate', online: true, motion: false, snapshot: '', ts: now() },
      { cam: 'driveway', online: true, motion: false, snapshot: '', ts: now() },
      { cam: 'backyard', online: false, motion: false, snapshot: '', ts: now() },
    ]
  },
  doors: [ { id: 'main', open: false, battery: 92, ts: now() }, { id: 'kitchen', open: true, battery: 86, ts: now() } ],
  presence: { people: 2, names: ['A','B'], rooms: { living:1, kitchen:1 }, ts: now() },
  garden: [ { zone: 'lawn', moisture_pct: 41, next_run: now()+3600 }, { zone: 'hedge', moisture_pct: 55, next_run: now()+7200 } ],
  safety: { lpg: 120, co: 8, smoke: 0, status: 'ok', ts: now() },
  leaks: [ { location: 'bath1', wet: false, battery: 84, ts: now() }, { location: 'sink', wet: false, battery: 73, ts: now() } ],
  weather: { t: 34.1, rh: 63, pressure: 1004.2, pm25: 48, ts: now() },
  system: { cpu: 23, ram: 46, disk: 58, last_backup: now()-86400, ts: now() },
  scenes: [ { name:'Good Night', id:'good_night'}, {name:'Away', id:'away'}, {name:'Movie', id:'movie'} ],
};

// Periodic demo updates to simulate live system
function tick() {
  // water
  const w = state.water;
  const delta = (w.mode === 'auto' && w.motor) ? rand(0.3, 1.2) : rand(-0.6, 0.3);
  w.level_pct = clamp(w.level_pct + delta, 5, 100);
  w.depth_cm = clamp(180 - (w.level_pct/100)*180, 0, 180);
  if (Math.random() < 0.05) w.motor = !w.motor;
  if (Math.random() < 0.01) w.leak = true; else if (Math.random() < 0.2) w.leak = false;
  w.ts = now();

  // energy
  state.energy.kw = clamp(state.energy.kw + rand(-0.15, 0.25), 0.2, 2.6);
  state.energy.kwh_today = clamp(state.energy.kwh_today + state.energy.kw/60, 0, 24);
  state.energy.voltage = clamp(state.energy.voltage + rand(-1.5, 1.5), 220, 240);
  state.energy.ts = now();

  // air rooms
  state.air = state.air.map(r => ({
    ...r,
    pm25: clamp(r.pm25 + rand(-5, 6), 5, 120),
    co2: clamp(r.co2 + rand(-40, 55), 450, 1500),
    tvoc: clamp(r.tvoc + rand(-20, 25), 50, 400),
    t: clamp(r.t + rand(-0.2, 0.3), 22, 33),
    rh: clamp(r.rh + rand(-2, 2.5), 35, 75),
    ts: now()
  }));

  // security cams
  state.security.cams = state.security.cams.map(c => ({
    ...c,
    motion: Math.random() < 0.07,
    online: Math.random() < 0.98 ? c.online : !c.online,
    ts: now()
  }));

  // presence
  state.presence.ts = now();

  // safety
  state.safety = { ...state.safety, lpg: clamp(state.safety.lpg + rand(-10, 12), 80, 250), co: clamp(state.safety.co + rand(-2, 3), 1, 25), smoke: clamp(state.safety.smoke + rand(-1, 1.5), 0, 5), status: 'ok', ts: now() };

  // weather
  state.weather = { ...state.weather, t: clamp(state.weather.t + rand(-0.3, 0.4), 25, 40), rh: clamp(state.weather.rh + rand(-1.5, 1.5), 40, 80), pressure: clamp(state.weather.pressure + rand(-0.8, 0.8), 995, 1015), pm25: clamp(state.weather.pm25 + rand(-6, 6), 10, 180), ts: now() };

  bus.emit('state:update', state);
}

let tickHandle;
export function startDemo() { 
  // Disabled demo updates to prevent layout issues
  // if (!tickHandle) tickHandle = setInterval(tick, 5000); 
  bus.emit('state:update', state); 
}
export function stopDemo() { clearInterval(tickHandle); tickHandle = null; }
export function getState() { return state; }

// Placeholder for real API switch
export async function initDataLayer() {
  await loadConfig();
  if (config.demo) { startDemo(); return; }
  // else: fetch config, open WS, subscribe to topics, etc.
}
