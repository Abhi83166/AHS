# Arunoday Home Systems (HomeHub)

A local‑first, private smart‑home dashboard for **your Raspberry Pi** with a **free static UI hosted on Sevella**. Everything heavy (MQTT, rules, camera proxy, DB) runs on your Pi. The cloud only serves the static website.

> Goal: **₹0/month** hosting (or near‑zero) while keeping full remote access and a premium, modular dashboard.

---

## Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [System Architecture](#system-architecture)
4. [Modules & Data Contracts](#modules--data-contracts)
5. [Repository Structure](#repository-structure)
6. [Quick Start (₹0 path)](#quick-start-₹0-path)
7. [Raspberry Pi Setup](#raspberry-pi-setup)
8. [Backend Services (Docker)](#backend-services-docker)
9. [Cameras (RTSP → HLS/WebRTC)](#cameras-rtsp--hlswebrtc)
10. [Frontend (Static UI)](#frontend-static-ui)
11. [Configuration](#configuration)
12. [Security & Privacy](#security--privacy)
13. [Remote Access (Free Options)](#remote-access-free-options)
14. [Automations Cookbook](#automations-cookbook)
15. [Troubleshooting](#troubleshooting)
16. [Roadmap](#roadmap)
17. [License](#license)

---

## Overview

**Arunoday Home Systems** is a modular LAN dashboard. The **Dashboard** shows status tiles (widgets); clicking a tile opens a **detail page** with charts, logs, and controls. It’s designed to keep your data local, be resilient offline, and scale from one sensor to many.

**Why this architecture?**

* **Privacy-first**: No live data leaves your LAN.
* **Zero cloud costs**: Static UI on Sevella is free; all compute is on your Pi.
* **Modular**: Add/disable modules via config. Swap demo data for real sensors incrementally.

---

## Key Features

* **Dashboard grid** with color-coded tiles and mini sparklines.
* **Modules**: Water Tank, Air Quality, Security (10 cameras), Doors/Windows, Presence, Garden/Irrigation, Power/Energy, Gas/Smoke, Leak Sensors, Weather, Scenes/Automations, System Health.
* **Local message bus** via MQTT.
* **Rules engine** (Node.js service or Node‑RED) with IF/THEN logic, delays, quiet hours, and safety interlocks.
* **Time‑series storage**: default **SQLite** (zero maintenance) with a simple append log; optional InfluxDB/Timescale for richer charts.
* **Camera proxy**: MediaMTX converts **RTSP → HLS/WebRTC** for browser playback; optional snapshots and motion badges.
* **Auth & roles**: Owner/Family/Guest, tokens for API/WebSocket.
* **Offline‑friendly**: UI caches and falls back to demo data if the API is unreachable.

---

## System Architecture

```
[ Static UI on Sevella ]  --->  calls  --->  https://<tunnel_or_tailscale>/api & /ws
          |                                     ^
          |                                     |
          v                                     |
  Browser (Mobile/Desktop) <--- WebSocket ------+

                    (LAN on Raspberry Pi)
+-----------------------------+   +---------------------+
|  API Gateway (Node.js)      |   |  Automations/Rules  |
|  /api  /ws  CORS  Auth      |   |  (Node.js or Node-RED)
+--------------+--------------+   +----------+----------+
               |                             |
               v                             v
          [ MQTT Broker ] <----> Device Bridges / Sensors
               |
               +--> Storage (SQLite default; optional InfluxDB)
               |
               +--> MediaMTX (RTSP->HLS/WebRTC) + Snapshotter (ffmpeg)
```

---

## Modules & Data Contracts

Below are the **topic names** (MQTT) and **REST payloads** the UI/API expect. Use these as contracts when you replace demo data.

### 1) Water Tank (AquaGuardian Pro)

* **MQTT topic**: `home/water/main`
* **Live JSON**:

```json
{
  "level_pct": 72.3,
  "depth_cm": 128.0,
  "motor": true,
  "mode": "auto",
  "leak": false,
  "ts": 1733870400
}
```

* **History endpoint**: `GET /api/history/water?since=7d`

### 2) Air Quality

* **Topic**: `home/air/<room>`
* **JSON**:

```json
{"pm1":6,"pm25":22,"pm10":34,"co2":780,"tvoc":120,"t":28.2,"rh":55,"room":"living","ts":1733870400}
```

### 3) Security & Cameras

* **Topics**: `home/security/<camId>/motion`, `home/security/<camId>/status`
* **Event JSON**:

```json
{"cam":"gate","motion":true,"snapshot":"/snap/gate.jpg","ts":1733870400}
```

* **Streams** served by MediaMTX as HLS/WebRTC.

### 4) Doors & Windows

* **Topic**: `home/doors/<id>`
* **JSON**: `{ "open": true, "battery": 95, "ts": 1733870400 }`

### 5) Presence & Occupancy

* **Topic**: `home/presence`
* **JSON**: `{ "people": 2, "names": ["A","B"], "rooms": {"living":1,"kitchen":1}, "ts": 1733870400 }`

### 6) Garden & Irrigation

* **Topic**: `home/garden/<zone>`
* **JSON**: `{ "moisture_pct": 41, "next_run": 1733900000, "ts": 1733870400 }`

### 7) Power & Energy

* **Topic**: `home/energy/main`
* **JSON**: `{ "kw": 0.86, "kwh_today": 7.2, "voltage": 229, "ts": 1733870400 }`

### 8) Gas & Smoke

* **Topic**: `home/safety/<type>`
* **JSON**: `{ "lpg": 120, "co": 8, "smoke": 0, "status": "ok", "ts": 1733870400 }`

### 9) Water Leaks

* **Topic**: `home/leaks/<location>`
* **JSON**: `{ "wet": false, "battery": 84, "ts": 1733870400 }`

### 10) Weather (Local)

* **Topic**: `home/weather/outdoor`
* **JSON**: `{ "t": 34.1, "rh": 63, "pressure": 1004.2, "pm25": 48, "ts": 1733870400 }`

### 11) Scenes & Automations

* **Topic**: `home/scene/<name>` (publish to trigger)
* **JSON**: `{ "triggered": true, "by": "user", "ts": 1733870400 }`

### 12) System Health

* **Topic**: `home/system`
* **JSON**: `{ "cpu": 23, "ram": 46, "disk": 58, "last_backup": 1733800000, "ts": 1733870400 }`

---

## Repository Structure

```
/ (root)
├─ web/                     # static site (host on Sevella)
│  ├─ index.html            # dashboard grid
│  ├─ pages/                # module detail pages
│  │  ├─ water.html
│  │  ├─ air.html
│  │  ├─ security.html
│  │  └─ ...
│  ├─ assets/
│  │  ├─ css/
│  │  ├─ js/                # api.js, charts.js, widgets.js, pages/*
│  │  └─ img/
│  └─ config/config.json    # runtime configuration fetched by UI
├─ backend/
│  ├─ docker-compose.yml    # mosquitto, mediamtx, api, automations, (optional) db
│  ├─ services/
│  │  ├─ api/               # Node.js REST + WebSocket
│  │  ├─ automations/       # Rules engine
│  │  ├─ snapshotter/       # ffmpeg-based JPEG snapshots (optional)
│  │  └─ bridges/           # MQTT bridges to real devices
│  └─ config/
│     ├─ mediamtx.yml
│     ├─ mosquitto.conf
│     └─ .env
└─ README.md
```

---

## Quick Start (₹0 path)

1. **Clone repo to your Raspberry Pi.**
2. **Install Docker & Compose** (see below).
3. Edit `backend/config/.env` and `web/config/config.json` (samples provided here).
4. `cd backend && docker compose up -d` to start **MQTT**, **API**, **Automations**, **MediaMTX**.
5. Open `http://<pi-ip>:8080` to verify API health.
6. Deploy **/web** to **Sevella Static Sites** (publish directory = `web`).
7. Browse your Sevella URL — the UI will fetch config, connect to your Pi, and display live tiles.

> Tip: If you want remote access without opening ports, set up **Tailscale** or **Cloudflare Tunnel** (steps below) and point `API_BASE_URL` to that address.

---

## Raspberry Pi Setup

* Raspberry Pi 4/5 (recommended 4GB+), 32‑bit or 64‑bit Raspberry Pi OS Lite, SSD/fast SD card.
* Reserve a static IP or DHCP reservation on your router.

**Install Docker & Compose**

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# log out/in or reboot
sudo apt-get update && sudo apt-get install -y docker-compose-plugin
```

---

## Backend Services (Docker)

**`backend/docker-compose.yml` (example)**

```yaml
version: "3.9"
services:
  mosquitto:
    image: eclipse-mosquitto:2
    container_name: mosquitto
    restart: unless-stopped
    ports: ["1883:1883"]
    volumes:
      - ./config/mosquitto.conf:/mosquitto/config/mosquitto.conf:ro
      - mosquitto-data:/mosquitto/data

  mediamtx:
    image: bluenviron/mediamtx:latest
    container_name: mediamtx
    restart: unless-stopped
    network_mode: host  # simplifies UDP/TCP for RTSP/WebRTC
    volumes:
      - ./config/mediamtx.yml:/mediamtx.yml:ro

  api:
    build: ./services/api
    container_name: homehub-api
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - MQTT_URL=${MQTT_URL}
      - MQTT_USER=${MQTT_USER}
      - MQTT_PASS=${MQTT_PASS}
      - DB_PATH=/data/state.sqlite
      - JWT_SECRET=${JWT_SECRET}
      - CORS_ORIGINS=${CORS_ORIGINS}
    ports: ["8080:8080"]
    volumes:
      - api-data:/data
    depends_on: [mosquitto]

  automations:
    build: ./services/automations
    container_name: homehub-automations
    restart: unless-stopped
    environment:
      - MQTT_URL=${MQTT_URL}
      - MQTT_USER=${MQTT_USER}
      - MQTT_PASS=${MQTT_PASS}
      - TZ=Asia/Kolkata
    depends_on: [mosquitto]

  snapshotter:
    build: ./services/snapshotter
    container_name: homehub-snapshotter
    restart: unless-stopped
    environment:
      - CAM_CONFIG=/config/cameras.json
    volumes:
      - ./config/cameras.json:/config/cameras.json:ro
      - ./snapshots:/snap

volumes:
  mosquitto-data:
  api-data:
```

**`backend/config/.env` (example)**

```
MQTT_URL=mqtt://mosquitto:1883
MQTT_USER=home
MQTT_PASS=supersecret
JWT_SECRET=change_me
CORS_ORIGINS=https://YOUR-SEVELLA-URL,https://localhost
```

**`backend/config/mosquitto.conf` (minimal)**

```
listener 1883
allow_anonymous false
password_file /mosquitto/config/passwords
persistence true
```

> Create `/backend/config/passwords` with `mosquitto_passwd -c passwords home` then enter your password.

---

## Cameras (RTSP → HLS/WebRTC)

**`backend/config/mediamtx.yml` (example)**

```yaml
paths:
  cam1:
    source: rtsp://USER:PASS@192.168.1.10:554/stream
  cam2:
    source: rtsp://USER:PASS@192.168.1.11:554/stream
# ... up to cam10
# MediaMTX will expose:
# - HLS at:  http://<pi-ip>:8888/cam1/index.m3u8
# - WebRTC:  http://<pi-ip>:8889 (signaling) with /cam1
```

**Snapshots**

* The `snapshotter` service polls `rtsp://` via ffmpeg and writes `/snap/<camId>.jpg` for dashboard thumbnails.
* The Security page can show live HLS/WebRTC and click‑to‑zoom snapshots.

---

## Frontend (Static UI)

* The **entire `web/` folder** is a static site (HTML + JS + CSS). No server code needed.
* UI reads runtime config from `web/config/config.json` so you can point it at your Pi without rebuilds.

**`web/config/config.json` (example)**

```json
{
  "API_BASE_URL": "https://your-tunnel-or-tailscale:8080",
  "WS_URL": "wss://your-tunnel-or-tailscale:8080/ws",
  "CAMERAS": [
    { "id": "cam1", "name": "Gate", "hls": "http://pi:8888/cam1/index.m3u8", "snapshot": "/snap/cam1.jpg" },
    { "id": "cam2", "name": "Driveway", "hls": "http://pi:8888/cam2/index.m3u8", "snapshot": "/snap/cam2.jpg" }
  ],
  "MODULES": {
    "water": true,
    "air": true,
    "security": true,
    "doors": true,
    "presence": true,
    "garden": true,
    "energy": true,
    "safety": true,
    "leaks": true,
    "weather": true,
    "automations": true,
    "system": true
  }
}
```

**Sevella Deploy (static)**

1. Connect your repo.
2. Build command: `—` (none) or `npm run build` if you later add a bundler.
3. Publish directory: `web`.
4. After deploy, open the site → it will fetch `/config/config.json` and call your Pi.

---

## Configuration

### API routes (minimal spec)

* `GET /api/health` → `{ ok: true, time: 1733870400 }`
* `GET /api/state` → current snapshot of all enabled modules.
* `GET /api/history/:module?since=7d` → time‑series for charts.
* `POST /api/commands` → perform actions (e.g., start pump, trigger scene). Body:

```json
{ "target": "water", "action": "pump_on", "args": {"max_minutes": 20} }
```

* `POST /api/login` → `{ token }` (JWT). UI stores in `localStorage` and sends `Authorization: Bearer <token>`.

### WebSocket

* URL: `/ws`
* Events: `state:update`, `alert:new`, `scene:run`.
* Example push:

```json
{"type":"state:update","module":"air","room":"living","pm25":32,"ts":1733870400}
```

### Chart aggregation

* Keep raw samples at 30–60s resolution in SQLite (append‑only table). Aggregate in API for 7/30/365‑day charts.

---

## Security & Privacy

* **Local auth** with hashed passwords (bcrypt/argon2). Roles: Owner/Family/Guest.
* **JWT tokens** for API/WS with short expiry + refresh.
* **CORS**: restrict to your Sevella domain and `localhost` during dev.
* **HTTPS**: terminate TLS at your tunnel (Cloudflare Tunnel does this automatically). Tailscale is already encrypted.
* **Privacy switch**: API flag to pause camera streams and mask snapshots in the UI.

---

## Remote Access (Free Options)

### Option A: Tailscale (private mesh)

1. Install Tailscale on the Pi and your phone/laptop.
2. Note the Pi’s Tailscale IP (e.g., `100.x.y.z`).
3. Set `API_BASE_URL` to `http://100.x.y.z:8080` and `WS_URL` to `ws://100.x.y.z:8080/ws`.

### Option B: Cloudflare Tunnel (public URL, no port‑forward)

1. Install `cloudflared` on the Pi and authenticate.
2. Create a tunnel that maps `https://home.yourdomain.com` → `http://localhost:8080` and `http://localhost:8888` (HLS) if desired.
3. Set `API_BASE_URL` & `WS_URL` with `https://home.yourdomain.com`.

> You can use both: Tailscale for admin, Tunnel for family access.

---

## Automations Cookbook

* **Air quality purge**: If `pm25 > 100` for 10 min → turn on purifier plug for 30 min; notify.
* **Smart pump**: If `level_pct < 20%` outside quiet hours → start pump; stop at 90% or on leak; alert on timeout.
* **Perimeter chime**: Door opens while `presence.people == 0` → play chime + capture gate snapshot.
* **Irrigation rain‑skip**: Skip garden zone if rainfall in last 24h or `weather.pm25 < 50 & t < 32°C` → window open suggestion.
* **Night scene**: After 11 PM → disable camera thumbnails in UI, set quiet notifications.

---

## Troubleshooting

* **UI shows “API unreachable”**: Check `API_BASE_URL` in `web/config/config.json`, verify Pi IP, and that port `8080` is open internally.
* **CORS error**: Add your Sevella domain to `CORS_ORIGINS` in `.env` and restart API.
* **No camera video in browser**: Ensure you’re using HLS (`index.m3u8`) or WebRTC via MediaMTX; pure RTSP won’t play in browsers.
* **High Pi CPU**: Reduce snapshot frequency, disable WebRTC on unused cameras, lower ffmpeg scale.

---

## Roadmap

* **Phase 1**: Static UI + demo data; MQTT wiring; Water, Air, Security, System tiles; HLS playback; basic auth.
* **Phase 2**: Replace demo data for Water & Air; pump control; presence; doors/windows; automations editor.
* **Phase 3**: Energy meter integration; irrigation scheduling; gas/smoke/leak interlocks; backups and multi‑home support.

---

## License

Private/Proprietary for now (personal project). Add a license when you’re ready to open source or share.
