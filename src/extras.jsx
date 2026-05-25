// graveYARD studios — extra sections (boot, stats, manifesto, testimonials, oracle, dig)

import React, { useState, useEffect, useRef } from 'react';

// ─── Boot sequence ──────────────────────────────────────────────────────────

export function BootSequence({ onDone }) {
  const lines = [
    { t: 80,  s: "$ ./startup --boot graveyard.studios" },
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

  const buried  = useTickUp(48,     1400, vis);
  const loc     = useTickUp(2_347,  1800, vis);
  const bugs    = useTickUp(1_847,  1600, vis);
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
  "Ship something ugly before you ship something beautiful.",
  "Refuse the meeting that could have been a paragraph.",
  "Delete code on Fridays. It feels good. Try it.",
  "Estimate in weeks, not days. Days are a lie clients tell themselves.",
  "Write the docs first or accept that there will be none.",
  "A demo on Tuesday beats a deck on Thursday, every time.",
  "Stay small. Stay weird. Build the thing.",
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
              <span className="tablet-n mono">{String(i + 1).padStart(2, '0')}.</span>
              <span className="tablet-t">{r}</span>
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
    body: "They killed our SPA, replaced it with something boring, and our pageviews doubled. I have no further questions.",
    who: "M. Halloran",
    role: "CEO, Pale Fox",
    yr: "MMXXVI",
  },
  {
    body: "First agency to ever turn down our brief. Also the first to deliver early. I think those two facts are related.",
    who: "S. Okafor",
    role: "Founder, Lantern",
    yr: "MMXXV",
  },
  {
    body: "Got an actual diagnosis before they wrote a line of code. Felt like therapy. Cost less.",
    who: "J. Maeda",
    role: "VP Eng, Northwind",
    yr: "MMXXV",
  },
];

export function Testimonials() {
  return (
    <section className="testimonials">
      <Divider label="—   in their words   —" />
      <div className="testimonials-grid">
        {QUOTES.map((q, i) => (
          <figure key={i} className="quote">
            <div className="quote-mark">“</div>
            <blockquote className="quote-body">{q.body}</blockquote>
            <figcaption className="quote-cite">
              <div className="quote-rule" />
              <div className="quote-who">{q.who}</div>
              <div className="mono dim">{q.role} · {q.yr}</div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

// ─── Oracle ─────────────────────────────────────────────────────────────────
// Uses window.claude.complete() when running inside the Claude design sandbox.
// Outside the sandbox, falls back to a friendly stub so the UI stays usable.

async function askForeman(question) {
  if (typeof window !== 'undefined' && window.claude?.complete) {
    return window.claude.complete({
      messages: [
        {
          role: 'user',
          content:
`You are the foreman at graveYARD studios — a small software studio in Kanpur, Uttar Pradesh that builds websites, software, and AI work for founders. The user has come to ask the studio a question. Respond IN CHARACTER:

- 2–3 short sentences. Total under 60 words.
- Tone: dry, deadpan, a touch sardonic. Bone-deep practical. A senior craftsperson who's seen things.
- Use lowercase except for proper nouns. No emoji. No exclamation marks.
- If asked something flippant, answer plainly. If asked something serious about software, give one real, useful piece of advice in the same voice.
- Never break character. Never mention being an AI or a language model.

The question:
${question}`,
        },
      ],
    });
  }
  // Local-dev fallback. Wire this to a real /api/foreman endpoint in production.
  await new Promise((r) => setTimeout(r, 700));
  return "the foreman is on a smoke break. wire window.claude.complete or a /api/foreman endpoint and try again.";
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
            We trained a small bot on a decade of our worst opinions.
            It answers in under sixty words. It is rarely polite.
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
