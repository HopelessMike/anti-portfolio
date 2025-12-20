# Anti-Portfolio (Next.js) — Integrated App

Webapp **Next.js (App Router)** che genera un “anti‑portfolio” interattivo in stile cosmico partendo da CV/link (e opzionalmente un briefing).

Funzionalità principali:
- **Onboarding**: upload PDF + link + briefing
- **Analisi AI**: estrazione/riassunto e generazione di un `Mission Log` JSON (con regole anti‑invenzione)
- **Render**: sistema solare 2D con nodi cliccabili e pannello dettagli
- **Export/Import**: download e ricarica del `flight-log.json`

## Requisiti

- Node.js 18+
- `OPENAI_API_KEY`

## Avvia

```bash
npm install
npm run dev
```

## Rotte principali

- `/` landing + import del Mission Log
- `/onboarding` flusso di generazione (upload/link/briefing)
- `/anti-portfolio` render della visualizzazione interattiva
- `/portfolio` redirect legacy a `/anti-portfolio`

## API

- `POST /api/build`
  - **input**: multipart `files[]` (PDF), `links` (string JSON array), `briefing` (string opzionale)
  - **output**: `AntiPortfolioData` (Mission Log validato)

## Mission Log (.json)

- In `/anti-portfolio` il bottone **DOWNLOAD MISSION LOG** scarica `flight-log.json`.
- Nella home (`/`) puoi usare **Carica Mission Log (.json)** per ricaricarlo e riaprire l’anti‑portfolio.

