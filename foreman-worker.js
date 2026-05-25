// foreman-worker.js
// Cloudflare Worker that proxies the Oracle / "foreman" question to Gemini.
// The Gemini API key lives only as a Worker secret — it never reaches the
// browser. The frontend POSTs { question: string } and gets back { text }.
//
// ─── Deploy via the Cloudflare Dashboard (no CLI) ───────────────────────────
//
//   Easiest path — the Workers Playground:
//
//   1. Get a Gemini API key (free):  https://aistudio.google.com/apikey
//
//   2. Open https://workers.cloudflare.com/playground
//      Select-all + delete the placeholder code in the editor.
//      Paste THIS ENTIRE FILE.
//      Click Deploy → sign in → name it "foreman" → Save and Deploy.
//
//   3. On the Worker overview, click Settings → Variables and Secrets
//      → Add variable:
//        Variable name:  GEMINI_API_KEY
//        Value:          (paste the key)
//        Toggle "Encrypt" ON so it becomes a secret.
//      Save and deploy.
//
//   4. Update ALLOWED_ORIGINS below to match your real site origins.
//      Paste the file again and re-deploy.
//
//   5. Copy the Worker URL (https://foreman.<account>.workers.dev) and
//      paste it into FOREMAN_ENDPOINT in src/extras.jsx, then `npm run build`.
//
//   ⚠ Do NOT use any dashboard tile labeled "Upload assets" / "Import a
//     repository" / "Workers Builds" for this single-file Worker — those
//     paths expect a project with a build step and will reject a lone .js
//     with: "This uploader does not yet support projects that require a
//     build process". Use the Playground or the inline "Edit code"
//     editor on the Worker overview page instead.
//
// Free tier: 100 000 Worker requests/day and Gemini's generous free quota.
// ────────────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are "the foreman" — a persona created and used by graveYARD studios, a small software studio in Kanpur, Uttar Pradesh that builds websites, software, and AI work for founders. The user has come to ask the studio a question. Respond IN PERSONA:

- Tone: dry, deadpan, a touch sardonic. Bone-deep practical. A senior craftsperson who's seen things.
- Length: match the question. Flippant or one-liner questions get 1–2 sentences. Serious software questions get 3–6 sentences with one concrete, actionable piece of advice. Never pad. Never write filler.
- Use lowercase except for proper nouns. No emoji. No exclamation marks.
- If asked something flippant, answer plainly. If asked something serious about software, give one real, useful piece of advice in the same voice.
- Stay in persona by default. If a user directly and sincerely asks whether you are an AI / a language model / a bot, briefly acknowledge in one sentence that you are a general-purpose language model wearing the studio's voice, then return to the persona. Never claim to be a human.`;

// Lock CORS to the domains that should be allowed to call this Worker.
// Add localhost for dev. Anything else gets a 403-equivalent (origin not matched).
const ALLOWED_ORIGINS = [
  "https://graveyardstudios.tech",
  "https://www.graveyardstudios.tech",
  "http://localhost:5173",
  "http://localhost:4173",
];

// Current Gemini lineup as of 2025: 2.0 and 2.5. There is no 3.5.
//   gemini-2.5-flash      — recommended: latest stable, fast, free tier
//   gemini-2.5-pro        — smarter, slower, paid past the free quota
//   gemini-2.0-flash      — older fallback
//   gemini-2.0-flash-lite — cheapest, weakest
const GEMINI_MODEL = "gemini-2.5-flash";

export default {
  async fetch(req, env) {
    const origin = req.headers.get("Origin") || "";
    const cors = corsHeaders(origin);

    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST")
      return json({ error: "method not allowed" }, 405, cors);

    let body;
    try {
      body = await req.json();
    } catch {
      return json({ error: "invalid json" }, 400, cors);
    }

    const question = String(body?.question || "")
      .slice(0, 600)
      .trim();
    if (!question) return json({ error: "empty question" }, 400, cors);

    if (!env.GEMINI_API_KEY) {
      return json(
        { error: "GEMINI_API_KEY not configured on the Worker" },
        500,
        cors,
      );
    }

    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: question }] }],
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            generationConfig: {
              temperature: 0.85,
              topP: 0.9,
              // ~400 tokens ≈ 300 words — enough headroom for a 4–6 sentence
              // answer when the question deserves depth. Lower this if you
              // want shorter answers; the prompt already biases toward brevity.
              maxOutputTokens: 400,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_ONLY_HIGH",
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_ONLY_HIGH",
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_ONLY_HIGH",
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_ONLY_HIGH",
              },
            ],
          }),
        },
      );

      if (!r.ok) {
        const detail = await r.text().catch(() => "");
        return json(
          { error: "gemini upstream", status: r.status, detail },
          502,
          cors,
        );
      }

      const data = await r.json();
      const text = (
        data?.candidates?.[0]?.content?.parts?.[0]?.text || ""
      ).trim();
      if (!text) return json({ error: "no answer from foreman" }, 502, cors);
      return json({ text }, 200, cors);
    } catch (err) {
      return json(
        { error: "foreman unreachable", detail: String(err) },
        502,
        cors,
      );
    }
  },
};

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    Vary: "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function json(obj, status = 200, extra = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...extra, "Content-Type": "application/json; charset=utf-8" },
  });
}
