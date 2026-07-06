# Caught

A mobile-first fishing catch log. Press one big button — **Caught** — and the moment is saved instantly with date, time, GPS, weather, pressure, wind, moon phase and tide (when near the sea). Fill in the fish details now or later.

## Features

- **One-tap capture** — instant offline save to IndexedDB, conditions enriched in the background
- **Quick catch form** — species (smart suggestions), weight (kg or lb/oz), photo, bait/method, water type, notes, kept/released
- **Catch log** — full list with incomplete filter and per-catch conditions
- **Map view** — previous catches on an OpenStreetMap map
- **Calendar view** — catches by date
- **Insights** — per-species condition profiles, analytics breakdowns, and upcoming fishing windows matched against the 6-day forecast
- **Export** — CSV and PDF catch reports
- **Settings** — units, GPS privacy, favourite species, default water type
- **PWA** — installable, works offline; map tiles cached

## Data sources

- Weather, pressure, wind: [Open-Meteo](https://open-meteo.com) (free, no API key)
- Tide: Open-Meteo Marine API (sea level height; used when near the coast)
- Moon phase: computed locally

All catch data is stored locally on the device. Nothing is uploaded.

## Run

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Stack

React 19 + TypeScript, Vite, Tailwind CSS v4, Dexie (IndexedDB), react-leaflet, jsPDF, vite-plugin-pwa.
