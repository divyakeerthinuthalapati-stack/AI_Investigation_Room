# AI Mystery Room

A fictional, evidence-driven mystery investigation app. React/Vite is the client; Express, MongoDB, Gemini and Zod power the API. The server keeps canonical solutions private until an accusation is submitted.

## Requirements

- Node.js 20 or newer
- MongoDB
- A Gemini API key for generated cases

## Start locally

1. Run `npm.cmd install` at the project root in Windows PowerShell (`npm install` also works in Command Prompt, macOS, or Linux).
2. Copy `server/.env.example` to `server/.env` and configure `MONGODB_URI`, `GEMINI_API_KEY`, and `SESSION_TOKEN_SECRET`.
3. Run `npm.cmd run dev` in Windows PowerShell (`npm run dev` in Command Prompt, macOS, or Linux) and open the Vite URL shown in the terminal.

To explore without external services, set `LOCAL_DEMO_MODE=true` in `server/.env`. This enables an explicitly labeled, fixed fictional demonstration case; it does not replace Gemini in normal mode. The demo requires no Mongo connection.

The frontend is available at `http://localhost:5173`; the API is at `http://localhost:5000/api/v1`. For a separately hosted frontend, set `VITE_API_URL` to the API origin. Never put backend secrets in client environment variables.

## Configuration

See [server/.env.example](server/.env.example). `GEMINI_MODEL` defaults to `gemini-3.5-flash-lite`, with `gemini-3.6-flash` as a fallback. Gateway deadline errors switch to the fallback immediately; other temporary Gemini 429/5xx responses use bounded retries. Set `GEMINI_FALLBACK_MODEL=` to disable fallback. `IMAGE_PROVIDER`, `VIDEO_PROVIDER`, and media storage are optional. Image evidence and CCTV evidence have clearly labeled text/simulated-frame fallbacks when providers are absent.

## Implemented flow

Create a case → poll its generation job → inspect suspects, timeline and typed evidence → save opened evidence and notes → submit one final accusation → view the server-evaluated solution. Anonymous session tokens are returned at session creation and stored in session-scoped browser storage.

All cases are fictional. Simulated surveillance is labeled as simulated. See [spec.md](spec.md) for the product source of truth.
