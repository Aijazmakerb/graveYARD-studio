// graveYARD studios — extra sections (boot, stats, manifesto, testimonials, oracle, dig)

import React, { useState, useEffect, useRef } from 'react';

// ─── Boot sequence ──────────────────────────────────────────────────────────

export function BootSequence({ onDone }) {
  const lines = [
    { t: 80, s: "$ ./startup --boot graveyardstudios.tech" },
    { t: 280, s: "  loading manifest ............ ok" },
    { t: 200, s: "  spinning up the yard ........ ok" },
    { t: 200, s: "  connecting to the foreman ... " },
    { t: 700, s: "  connecting to the foreman ... ok" },
    { t: 200, s: "  mounting 48 projects ........ ok" },
    { t: 250, s: "  status: open for Q3 ......... ok" },
    { t: 400, s: "$ ready. press any key to enter." },
  ];
  const [shown, setShown] = useState([]);
  const [done, setDone] = useState(false);
  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (let i = 0; i < lines.length; i++) {
        await new Promise((r) => setTimeout(r, lines[i].t));
        if (cancelled) return;
        setShown((prev) => {
          if (i === 4) return [...prev.slice(0, -1), lines[i].s];
          return [...prev, lines[i].s];
        });
      }
      setDone(true);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (done || e.key) {
        setSkipped(true);
        setTimeout(onDone, 400);
      }
    };
    window.addEventListener('keydown', h);
    window.addEventListener('click', h);
    return () => {
      window.removeEventListener('keydown', h);
      window.removeEventListener('click', h);
    };
  }, [done, onDone]);

  return (
    <div className={`boot ${skipped ? 'boot-out' : ''}`}>
      <div className="boot-inner">
        <div className="boot-glyph">graveYARD</div>
        <pre className="boot-log mono">
          {shown.map((l, i) => <div key={i} className="boot-line">{l}</div>)}
          {!done && <div className="boot-caret">_</div>}
        </pre>
        {done && (
          <div className="boot-prompt mono">
            <span className="boot-blink">▍</span> press any key
          </div>
        )}
        <button
          className="boot-skip mono"
          onClick={() => { setSkipped(true); setTimeout(onDone, 400); }}
        >
          skip →
        </button>
      </div>
    </div>
  );
}

// ─── Stats strip ────────────────────────────────────────────────────────────

function useTickUp(target, durMs = 1400, start = false) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!start) return;
    const t0 = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / durMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durMs, start]);
  return n;
}

export function StatsStrip() {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setVis(true),
      { threshold: 0.3 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const buried = useTickUp(48, 1400, vis);
  const loc = useTickUp(2_347, 1800, vis);
  const bugs = useTickUp(1_847, 1600, vis);
  const coffees = useTickUp(11_204, 2000, vis);

  return (
    <section ref={ref} className="stats">
      <div className="stats-inner">
        <div className="stat">
          <div className="stat-n">{buried}</div>
          <div className="stat-l mono">projects shipped</div>
          <div className="stat-sub mono dim">since 2022</div>
        </div>
        <div className="stat-div" />
        <div className="stat">
          <div className="stat-n">{loc.toLocaleString()}<span className="stat-unit">K</span></div>
          <div className="stat-l mono">lines, in prod</div>
          <div className="stat-sub mono dim">post-deletion</div>
        </div>
        <div className="stat-div" />
        <div className="stat">
          <div className="stat-n">{bugs.toLocaleString()}</div>
          <div className="stat-l mono">bugs squashed</div>
          <div className="stat-sub mono dim">this year</div>
        </div>
        <div className="stat-div" />
        <div className="stat">
          <div className="stat-n">{coffees.toLocaleString()}</div>
          <div className="stat-l mono">coffees, black</div>
          <div className="stat-sub mono dim">no sugar, no milk</div>
        </div>
      </div>
    </section>
  );
}

// ─── Manifesto / The Code ───────────────────────────────────────────────────

const CODE_RULES = [
  {
    main: "Ship something ugly before something beautiful.",
    sub: "Drafts in prod beat masterpieces in Figma.",
  },
  {
    main: "Refuse the meeting that could have been a paragraph.",
    sub: "Then write the paragraph.",
  },
  {
    main: "Delete code on Fridays.",
    sub: "Fewer lines, fewer bugs. Try it once.",
  },
  {
    main: "Estimate in weeks, not days.",
    sub: "Days are a lie clients tell themselves.",
  },
  {
    main: "Write the docs first.",
    sub: "Or accept there will be none.",
  },
  {
    main: "A demo on Tuesday beats a deck on Thursday.",
    sub: "Show, don't tell. Every time.",
  },
  {
    main: "Stay small. Stay weird. Build the thing.",
    sub: "Everything else follows.",
  },
];

export function Manifesto() {
  return (
    <section id="code" className="manifesto">
      <Divider label="·   ·   ·" />
      <div className="manifesto-inner">
        <div className="manifesto-side">
          <span className="mono dim">§ 01½ — the code</span>
          <h2>Seven rules<br />we work by.</h2>
          <p className="section-lede">
            We don't sign NDAs we haven't read. We don't take retainers we
            can't honour. The rest of how we work fits on a tablet.
          </p>
          <div className="manifesto-seal">
            <div className="seal-ring">
              <div className="seal-inner">
                <span className="mono">EST · MMXXII</span>
                <div className="seal-glyph">gY</div>
                <span className="mono">KANPUR · UP</span>
              </div>
            </div>
          </div>
        </div>
        <ol className="tablet">
          {CODE_RULES.map((r, i) => (
            <li key={i} className="tablet-rule">
              <span className="tablet-n mono">{String(i + 1).padStart(2, '0')}</span>
              <div className="tablet-body">
                <span className="tablet-t">{r.main}</span>
                {r.sub && <span className="tablet-sub">{r.sub}</span>}
              </div>
              <span className="tablet-mark" aria-hidden="true">↗</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ─── Testimonials ───────────────────────────────────────────────────────────

const QUOTES = [
  {
    body: "Replaced our jQuery mess with a Next.js rewrite in four weeks. Lighthouse went from 38 to 96, conversions ticked up 22 percent. They left the codebase cleaner than they found it and the handover doc was actually readable.",
    who: "Aarav Sharma",
    tag: "WEB",
    yr: "MMXXVI",
  },
  {
    body: "Hired them to build a B2B dashboard. They spent the first week telling us not to build a dashboard. They were right. We shipped a workflow tool instead and saved six months of dead code.",
    who: "Meera Krishnan",
    tag: "SOFTWARE",
    yr: "MMXXV",
  },
  {
    body: "Three founders, zero engineers, two weeks until demo day. They scoped the MVP, designed the brand, and shipped both without asking a single dumb question. We got into the cohort.",
    who: "Rohan Mehta",
    tag: "SOFTWARE · BRAND",
    yr: "MMXXV",
  },
  {
    body: "Asked for an AI feature. Got the feature, a small eval harness, and a one-page memo on why we shouldn't ship it yet. We kept the memo, fixed the data, then shipped. Both still in prod.",
    who: "Karthik Nair",
    tag: "AI",
    yr: "MMXXIV",
  },
];

export function Testimonials() {
  return (
    <section className="testimonials">
      <Divider label="—   in their words   —" />
      <div className="testimonials-grid">
        {QUOTES.map((q, i) => {
          // Surname initial → avatar letter (handles "A. Sharma" → "S")
          const parts = q.who.split(/\s+/);
          const initial = (parts[parts.length - 1] || q.who).charAt(0).toUpperCase();
          return (
            <figure key={i} className="quote">
              <div className="quote-mark" aria-hidden="true">“</div>
              <blockquote className="quote-body">{q.body}</blockquote>
              <figcaption className="quote-cite">
                <div className="quote-rule" />
                <div className="quote-foot">
                  <div className="quote-avatar" aria-hidden="true">{initial}</div>
                  <div className="quote-meta">
                    <div className="quote-who">{q.who}</div>
                    <div className="mono dim">
                      {q.tag && <span className="quote-tag">{q.tag}</span>}
                      {q.tag && ' · '}{q.yr}
                    </div>
                  </div>
                </div>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}

// ─── Oracle ─────────────────────────────────────────────────────────────────
// Three-path delivery, in order of preference:
//   1. window.claude.complete()      — when running inside the Anthropic
//                                       design sandbox (dev convenience).
//   2. FOREMAN_ENDPOINT (POST JSON)  — your own proxy. Recommended path for
//                                       production. See foreman-worker.js in
//                                       the project root for a 50-line
//                                       Cloudflare Worker that proxies to
//                                       Gemini (or OpenAI, Claude, etc.).
//   3. Stub answer                   — friendly placeholder if neither is set.
//
// Paste your deployed Worker URL below. The Worker holds the API key as a
// secret — the key never reaches the browser.
const FOREMAN_ENDPOINT = 'https://gentle-bar-7552.786aijazusmaan.workers.dev/'; // e.g. 'https://foreman.your-name.workers.dev'

async function askForeman(question) {
  // Path 1 — Anthropic design sandbox
  if (typeof window !== 'undefined' && window.claude?.complete) {
    return window.claude.complete({
      messages: [
        {
          role: 'user',
          content:
            `You are "the foreman" — a persona created and used by graveYARD studios, a small software studio in Kanpur, Uttar Pradesh that builds websites, software, and AI work for founders. The user has come to ask the studio a question. Respond IN PERSONA:

- Tone: dry, deadpan, a touch sardonic. Bone-deep practical. A senior craftsperson who's seen things.
- Length: match the question. Flippant or one-liner questions get 1–2 sentences. Serious software questions get 3–6 sentences with one concrete, actionable piece of advice. Never pad. Never write filler.
- Use lowercase except for proper nouns. No emoji. No exclamation marks.
- If asked something flippant, answer plainly. If asked something serious about software, give one real, useful piece of advice in the same voice.
- Stay in persona by default. If a user directly and sincerely asks whether you are an AI / a language model / a bot, briefly acknowledge in one sentence that you are a general-purpose language model wearing the studio's voice, then return to the persona. Never claim to be a human.

The question:
${question}`,
        },
      ],
    });
  }

  // Path 2 — your own proxy (Cloudflare Worker, Vercel function, etc.)
  if (FOREMAN_ENDPOINT) {
    const res = await fetch(FOREMAN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    if (!res.ok) throw new Error(`foreman ${res.status}`);
    const data = await res.json();
    const text = (data?.text || '').trim();
    if (!text) throw new Error('empty answer');
    return text;
  }

  // Path 3 — stub
  await new Promise((r) => setTimeout(r, 700));
  return "the foreman is on a smoke break. wire FOREMAN_ENDPOINT (extras.jsx) to a small Gemini proxy and try again — see foreman-worker.js for a 5-minute setup.";
}

export function Oracle() {
  const [q, setQ] = useState('');
  const [a, setA] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [err, setErr] = useState('');

  const ask = async (e) => {
    e?.preventDefault?.();
    const question = q.trim();
    if (!question || loading) return;
    setLoading(true);
    setA('');
    setErr('');
    try {
      const text = await askForeman(question);
      setA(text);
      setHistory((h) => [{ q: question, a: text }, ...h].slice(0, 5));
      setQ('');
    } catch {
      setErr('the line is cold. try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const samples = [
    'should I rewrite it in Rust?',
    'is my startup cooked?',
    "what's wrong with my landing page?",
    'give me a hard truth about my codebase',
  ];

  return (
    <section id="oracle" className="oracle">
      <Divider label="✦   ·   the foreman   ·   ✦" />
      <div className="oracle-inner">
        <div className="oracle-head">
          <span className="mono dim">§ 03½ — ask the foreman</span>
          <h2>
            Ask the studio
            <br /><em>anything.</em>
          </h2>
          <p className="section-lede">
            An off-the-shelf language model dressed in our house voice.
            Under sixty words per answer, rarely polite, not always right.
            It's a prompt, not a prophecy — don't bet a startup on it.
          </p>
        </div>

        <div className="oracle-board">
          <div className="oracle-screen">
            <div className="oracle-eye">
              <div className={`eye ${loading ? 'is-thinking' : ''}`}>
                <div className="eye-iris" />
                <div className="eye-pupil" />
              </div>
            </div>
            <div className="oracle-output mono">
              {err && <div className="oracle-err">› {err}</div>}
              {!a && !loading && !err && (
                <div className="oracle-idle">› the foreman is listening.</div>
              )}
              {loading && (
                <div className="oracle-loading">
                  › thinking
                  <span className="dot-1">.</span>
                  <span className="dot-2">.</span>
                  <span className="dot-3">.</span>
                </div>
              )}
              {a && !loading && (
                <div className="oracle-answer">
                  <div className="oracle-line">› {a}</div>
                </div>
              )}
            </div>
          </div>

          <form className="oracle-input" onSubmit={ask}>
            <span className="mono dim oracle-prompt">ask&nbsp;›</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="type a question, press enter"
              disabled={loading}
            />
            <button
              type="submit"
              className="oracle-send"
              disabled={loading || !q.trim()}
            >
              <span className="mono">{loading ? '...' : 'send'}</span>
              <span>↵</span>
            </button>
          </form>

          <div className="oracle-samples">
            {samples.map((s) => (
              <button
                key={s}
                className="sample mono"
                onClick={() => setQ(s)}
                disabled={loading}
              >
                {s}
              </button>
            ))}
          </div>

          {history.length > 0 && (
            <details className="oracle-history">
              <summary className="mono dim">— prior readings ({history.length})</summary>
              <ul>
                {history.map((h, i) => (
                  <li key={i}>
                    <div className="mono dim">› {h.q}</div>
                    <div>{h.a}</div>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Refactor — Simon-says memory game ──────────────────────────────────────
// 2×2 grid of bracket-glyph cells. The board flashes a sequence; the player
// taps it back from memory. Each successful round adds one more step and the
// tempo nudges faster. One miss ends the run. Best streak persisted locally.
// Works with mouse and touch on every screen — cells stay ≥ 90px square.

const REFACTOR_KEYS = [
  { glyph: '{ }', name: 'TL' },
  { glyph: '[ ]', name: 'TR' },
  { glyph: '( )', name: 'BL' },
  { glyph: '⟨ ⟩', name: 'BR' },
];
const REFACTOR_BEST_KEY = 'gy_refactor_best';
const STEP_BASE_MS = 560;
const STEP_MIN_MS = 220;

export function Refactor() {
  // phase: idle | watch | play | over
  const [phase, setPhase] = useState('idle');
  const [sequence, setSequence] = useState([]);
  const [inputIdx, setInputIdx] = useState(0);
  const [lit, setLit] = useState(-1);
  const [wrong, setWrong] = useState(-1);
  const [best, setBest] = useState(0);

  useEffect(() => {
    const saved = parseInt(localStorage.getItem(REFACTOR_BEST_KEY) || '0', 10);
    if (!Number.isNaN(saved)) setBest(saved);
  }, []);

  // Visual playback of the sequence during 'watch'. Each step shortens as the
  // sequence grows — by step 14 we're at the floor (220 ms on, ~80 ms gap).
  useEffect(() => {
    if (phase !== 'watch' || sequence.length === 0) return;
    let cancelled = false;
    const stepMs = Math.max(STEP_MIN_MS, STEP_BASE_MS - sequence.length * 22);
    const gapMs = Math.max(80, stepMs * 0.35);

    (async () => {
      await new Promise((r) => setTimeout(r, 350));
      if (cancelled) return;
      for (let i = 0; i < sequence.length; i++) {
        setLit(sequence[i]);
        await new Promise((r) => setTimeout(r, stepMs));
        if (cancelled) return;
        setLit(-1);
        await new Promise((r) => setTimeout(r, gapMs));
        if (cancelled) return;
      }
      setInputIdx(0);
      setPhase('play');
    })();

    return () => { cancelled = true; };
  }, [phase, sequence]);

  const start = () => {
    const first = Math.floor(Math.random() * 4);
    setSequence([first]);
    setInputIdx(0);
    setLit(-1);
    setWrong(-1);
    setPhase('watch');
  };

  const tap = (idx) => {
    if (phase !== 'play') return;
    setLit(idx);
    setTimeout(() => setLit((l) => (l === idx ? -1 : l)), 180);

    if (sequence[inputIdx] === idx) {
      const next = inputIdx + 1;
      if (next === sequence.length) {
        // Round complete — that streak is now the player's best-known result.
        const streak = sequence.length;
        if (streak > best) {
          setBest(streak);
          localStorage.setItem(REFACTOR_BEST_KEY, String(streak));
        }
        setTimeout(() => {
          setSequence((prev) => [...prev, Math.floor(Math.random() * 4)]);
          setPhase('watch');
        }, 600);
      } else {
        setInputIdx(next);
      }
    } else {
      setWrong(idx);
      setLit(idx);
      setPhase('over');
    }
  };

  const status =
    phase === 'idle' ? 'press start to begin'
      : phase === 'watch' ? 'watch the sequence'
        : phase === 'play' ? `your turn — ${inputIdx + 1} / ${sequence.length}`
          : phase === 'over' ? `miss — round was ${sequence.length}`
            : '';
  const completedStreak = sequence.length - 1;

  return (
    <section id="refactor" className="refactor">
      <Divider label="⟨   ·   the refactor   ·   ⟩" />
      <div className="refactor-inner">
        <div className="refactor-head">
          <span className="mono dim">§ 03¾ — the refactor</span>
          <h2>
            Match the pattern
            <br /><em>before it ships broken.</em>
          </h2>
          <p className="section-lede">
            Watch the sequence. Tap it back from memory. One miss ends the run;
            best streak is saved on your device. No telemetry.
          </p>
        </div>

        <div className="refactor-board">
          <div className="rf-stats mono">
            <div className="rf-stat">
              <span className="rf-stat-l dim">round</span>
              <span className="rf-stat-v">{phase === 'idle' ? '–' : sequence.length}</span>
            </div>
            <div className="rf-stat">
              <span className="rf-stat-l dim">progress</span>
              <span className="rf-stat-v">
                {phase === 'play' ? `${inputIdx} / ${sequence.length}` : '–'}
              </span>
            </div>
            <div className="rf-stat">
              <span className="rf-stat-l dim">best streak</span>
              <span className="rf-stat-v rf-stat-acc">{best}</span>
            </div>
          </div>

          <div className={`rf-status mono is-${phase}`}>
            <span className="rf-status-dot" /> {status}
          </div>

          <div className="rf-grid" data-phase={phase}>
            {REFACTOR_KEYS.map((k, i) => (
              <button
                key={i}
                type="button"
                className={`rf-cell rf-cell-${i} ${lit === i ? 'is-lit' : ''} ${wrong === i ? 'is-wrong' : ''}`}
                onClick={() => tap(i)}
                onTouchStart={(e) => {
                  if (phase === 'play') {
                    e.preventDefault();
                    tap(i);
                  }
                }}
                disabled={phase !== 'play'}
                aria-label={`pattern key ${k.name}`}
              >
                <span className="rf-glyph" aria-hidden="true">{k.glyph}</span>
                <span className="rf-cell-meta mono">{k.name}</span>
              </button>
            ))}
          </div>

          <div className="rf-cta">
            {phase === 'idle' && (
              <button type="button" className="btn-primary rf-start" onClick={start}>
                <span>START</span>
                <span className="btn-glyph">▸</span>
              </button>
            )}
            {phase === 'over' && (
              <div className="rf-result">
                <div className="rf-result-line mono">
                  → run ended. streak: <span className="rf-stat-acc">{completedStreak}</span>
                  {completedStreak > 0 && completedStreak === best && (
                    <span className="rf-pb"> · new personal best</span>
                  )}
                </div>
                <button type="button" className="btn-primary rf-start" onClick={start}>
                  <span>AGAIN</span>
                  <span className="btn-glyph">↻</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Divider ────────────────────────────────────────────────────────────────

export function Divider({ label = '·   ·   ·' }) {
  return (
    <div className="divider" aria-hidden="true">
      <span className="div-line" />
      <span className="div-glyph mono">{label}</span>
      <span className="div-line" />
    </div>
  );
}

// ─── Dig easter egg ─────────────────────────────────────────────────────────

export function DigEasterEgg() {
  const [active, setActive] = useState(false);
  const [shovels, setShovels] = useState([]);
  useEffect(() => {
    const h = (e) => {
      const tag = document.activeElement?.tagName;
      if (
        e.key.toLowerCase() === 'd' &&
        !e.metaKey &&
        !e.ctrlKey &&
        tag !== 'INPUT' &&
        tag !== 'TEXTAREA'
      ) {
        setActive(true);
        setShovels((s) =>
          [...s, { id: Date.now(), x: Math.random() * 100, y: Math.random() * 100 }].slice(-20)
        );
        setTimeout(() => setActive(false), 600);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  return (
    <>
      <div className={`dig-hint mono ${active ? 'is-dug' : ''}`}>
        press <kbd>D</kbd> to dig
      </div>
      <div className="dig-layer" aria-hidden="true">
        {shovels.map((s) => (
          <span
            key={s.id}
            className="dig-shovel"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
          >
            ⚰
          </span>
        ))}
      </div>
    </>
  );
}
