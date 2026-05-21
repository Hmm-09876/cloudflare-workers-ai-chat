# AI Chat Demo (Cloudflare Workers)

This project is a small chat website for a portfolio. It uses **Cloudflare Workers AI** to answer questions in the browser. The goal is to show basic full-stack skills: a React front end, an API on Cloudflare, and simple safety rules (message limits and cooldown).

---

## What the app can do

- Chat with an AI model (`@cf/meta/llama-3.1-8b-instruct`).
- Two modes:
  - **Fast** - quick answers, no web search.
  - **Smart** - can search the web (needs a Tavily API key) for newer facts.
- Each message is limited to **150 characters**.
- The chat keeps only the **last 10 messages** in the request.
- **Usage limit:** 10 free chats per session (stored in the browser).
  - After each chat, one turn is used.
  - A **45 second** cooldown refills one turn.
  - If many turns are used quickly, cooldowns run **one after another** (not at the same time).
  - When turns reach **0**, the app shows *"You reached your limit"* and the send button is disabled until a turn comes back.
  - Limit data is saved in **localStorage**, so a page refresh keeps the count, cooldown, and the limit message.
- **Clear chat** button (top-right of the message area) removes history only; turn count and cooldown stay the same.

---

## Tech stack

| Part | Tool |
|------|------|
| UI | React + Vite |
| API & AI | Cloudflare Workers, Workers AI |
| Web search (smart mode) | Tavily API |
| Rate limit (server, optional) | Durable Object `RateLimiter` |

---

## Before you start

You need:

- [Node.js](https://nodejs.org/) (LTS version is fine)
- A [Cloudflare](https://dash.cloudflare.com/) account
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) (installed with the project as `npm` dev dependency)

For **smart mode**, create a Tavily key and set it as a secret:

```bash
npx wrangler secret put TAVILY_API_KEY
```

---

## Run on your computer

1. Clone the repo and open the folder.

2. Install packages:

```bash
npm install
```

3. Start the Worker (API) in one terminal:

```bash
npx wrangler dev
```

4. Start the web UI in another terminal:

```bash
npm run dev
```

5. Open the URL shown by Vite (often `http://localhost:5173`).  
   The UI sends `/api` requests to the Worker through the proxy in `vite.config.js`.

---

## Build for production

```bash
npm run build
npx wrangler deploy
```

Check `wrangler.toml` for the Worker name and Durable Object settings.

---

## Main folders

```
src/
  components/     React UI (chat box, input, mode toggle)
  hooks/          useChat — messages + limit + cooldown
  lib/            Search, rate limit, response filter
  index.ts        Worker entry — /api/chat
```

---

## Chat limit (how it works)

- Start with **10** turns.
- Each successful reply costs **1** turn and adds a **45s** refill to a queue.
- The timer in the footer shows the **first** refill in the queue.
- When turns are back at **10**, the timer stops and extra queue items are cleared.
- State keys in the browser:
  - `demo-chat-limit` — turns left + refill timestamps
  - `demo-chat-messages` — chat history (including the limit notice)

To reset everything during testing, clear site data for localhost in the browser dev tools.

---

## Notes for reviewers

- This is a **learning / portfolio** project, not a production product.
- Secrets must never be committed; use Wrangler secrets.
- Smart mode costs more (search + bigger prompts), so limits help control abuse on a free tier.

