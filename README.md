# Anti-Portfolio (Next.js) — Integrated App

Questa cartella contiene la **webapp principale** (Next.js) che unifica:

- onboarding (upload CV + link)
- analisi AI + generazione dati anti-portfolio
- rendering “cosmico”
- download **Flight Log** `.json` (ri-caricabile dalla home)

## Requisiti

- Node.js 18+
- `OPENAI_API_KEY`

## Avvia

```bash
npm install
npm run dev
```

Apri:

- `http://localhost:3000/` (landing)
- `http://localhost:3000/onboarding` (upload + genera)
- `http://localhost:3000/anti-portfolio` (render)

## API

- `POST /api/build`
  - input: multipart `files[]` (PDF) + `links` (JSON array string)
  - output: `AntiPortfolioData`

## Flight Log (.json)

- In `/portfolio` il bottone **DOWNLOAD FLIGHT LOG** scarica `flight-log.json`.
- Nella home (`/`) puoi usare **Carica Flight Log (.json)** per ricaricarlo e riaprire il portfolio.

