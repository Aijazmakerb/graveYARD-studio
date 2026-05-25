# Wiring the Oracle (foreman) to Gemini — Cloudflare Dashboard

The Oracle widget asks an LLM a short question and shows an in-character answer. Out of the box it returns a stub. Follow this guide to make it actually answer using Gemini, deployed via the Cloudflare web dashboard (no CLI needed).

## Why a proxy, not direct?

You **can** call Gemini's REST API directly from the browser. Don't. The API key sits in the request URL, anyone visiting your site can grab it from DevTools → Network, and your free quota is gone in an afternoon.

The Worker in [`foreman-worker.js`](./foreman-worker.js) is a tiny proxy: it holds the key as an encrypted secret, accepts `{ question }` from your site, and returns `{ text }`. The browser never sees the key.

## Setup (≈8 minutes, no CLI)

### 1. Get a Gemini API key (free)

Open https://aistudio.google.com/apikey → **Create API key**. Copy it somewhere safe — you'll paste it in step 4.

### 2. Sign up for Cloudflare (free)

If you don't have an account: https://dash.cloudflare.com/sign-up

### 3. Create a new Worker — via the inline editor (NOT the uploader)

Cloudflare's dashboard offers two paths and they look similar but only one of them works for a single `.js` file. Use the **inline code editor**. Do **not** use the file uploader.

> ⚠️ **If you see this error:** *"This uploader does not yet support projects that require a build process. At least one JavaScript file was found. Please use `wrangler deploy` instead."* — you went down the wrong path. Cancel out and follow the clicks below.

The clean path (≈ 60 seconds):

1. Open the **Workers Playground**: <https://workers.cloudflare.com/playground>
2. You'll land in a full-screen code editor with placeholder code in the left pane and a live response preview on the right. **Select-all + delete** the placeholder code.
3. **Paste the entire contents of [`foreman-worker.js`](./foreman-worker.js)** into the editor.
4. Click **Deploy** (top-right of the page).
5. It'll ask you to **sign in** (or sign up — free) and pick a name. Use `foreman` (or anything; it becomes part of the URL).
6. Click **Save and Deploy**. Cloudflare prints your URL — it looks like `https://foreman.<your-account>.workers.dev`. Copy it.

That's it — the Worker is live. Skip the rest of step 3.

#### Alternative path through the main dashboard

If the Playground link won't open in your region, do this instead (same end result, more clicks):

1. Go to <https://dash.cloudflare.com> → left sidebar **Workers & Pages**.
2. Top-right click **Create** → on the next screen pick the **Workers** tab → click **Hello world**. **Do not** click "Import a repository", "Upload assets", or any tile with the words *build* / *upload* / *git*. Those routes expect a project structure and will trigger the error you saw.
3. Name it `foreman` → **Deploy** (this just deploys the Hello-World stub so the Worker exists).
4. On the Worker overview page, click **Edit code** (top-right of the page).
5. In the code editor, **select all + delete** the Hello-World snippet, then **paste the entire contents of [`foreman-worker.js`](./foreman-worker.js)**.
6. Click **Deploy** in the editor.

### 4. Add your Gemini key as a Worker secret

1. Back on the Worker's overview page, click **Settings** tab.
2. In the left submenu, click **Variables and Secrets** (older UI calls it "Variables").
3. Under **Environment Variables**, click **Add variable**.
4. Set:
   - **Variable name:** `GEMINI_API_KEY`
   - **Value:** paste the key from step 1
   - Click the **Encrypt** toggle on (turns it into a secret — the value is hidden from the dashboard after saving)
5. Click **Save and deploy**.

Secrets are encrypted at rest, never appear in logs, and are NOT exposed to the browser.

### 5. Update the allowed origins

Open [`foreman-worker.js`](./foreman-worker.js) and check the `ALLOWED_ORIGINS` array at the top:

```js
const ALLOWED_ORIGINS = [
  "https://graveyardstudios.tech",
  "https://www.graveyardstudios.tech",
  "http://localhost:5173",
  "http://localhost:4173",
];
```

Add or remove entries to match the exact origin(s) your site is served from. Anything not in the list gets a CORS-blocked response, which means random websites can't abuse your Worker. Paste the updated file back into the dashboard editor and hit **Deploy** again.

### 6. Plug the Worker URL into the site

On the Worker overview page Cloudflare gives you a URL that looks like:

```
https://foreman.<your-account>.workers.dev
```

Copy it. Open [`src/extras.jsx`](./src/extras.jsx), find the `FOREMAN_ENDPOINT` constant near the top of the Oracle section, and paste:

```js
const FOREMAN_ENDPOINT = 'https://foreman.<your-account>.workers.dev';
```

Then rebuild:

```bash
npm run build
```

Deploy the new `dist/` folder. Open the site, scroll to the Oracle, ask "is my startup cooked?" — Gemini answers in the foreman voice.

## Quick sanity test

Right from the dashboard you can test the Worker without touching the site. On the Worker overview page click **Quick edit** → **HTTP** tab and send:

```
POST /
Body:  { "question": "should I rewrite it in Rust?" }
```

You should get back `{ "text": "..." }` with the answer. If you get `{ error: "GEMINI_API_KEY not configured" }`, your secret wasn't saved — redo step 4. If you get `{ error: "gemini upstream" }`, your key is wrong or out of quota.

## Editing the Worker later

Any time you want to tweak the system prompt, allowed origins, model name, etc.:

1. Cloudflare dashboard → **Workers & Pages** → **foreman** → **Edit code**.
2. Paste the new contents of [`foreman-worker.js`](./foreman-worker.js).
3. Click **Deploy**.

No restart of the site needed — the Worker takes effect immediately for the next request.

## Cost

- Cloudflare Workers free plan: **100 000 requests/day** (≈ 3 M / month).
- Gemini free tier: generous monthly token allowance on `gemini-2.0-flash`.

For a marketing site, effectively zero cost until you're famous.

## Swapping models

Top of `foreman-worker.js`:

```js
const GEMINI_MODEL = 'gemini-2.0-flash';        // current — fast & free
// const GEMINI_MODEL = 'gemini-2.0-flash-lite';  // cheaper, weaker
// const GEMINI_MODEL = 'gemini-2.5-pro';         // smarter, paid tier
```

Paste-deploy and you're on the new model.

## Want to use OpenAI / Claude / Mistral instead?

Same architecture — change the `fetch()` block inside `foreman-worker.js` to that provider's endpoint and pull `text` out of their response shape. The frontend doesn't need to change.
