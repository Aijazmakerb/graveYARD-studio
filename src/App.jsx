// graveYARD studios — single-page site
// Sections: HERO · THE YARD · RECENTLY INTERRED · LAST RITES · SUMMON

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  BootSequence,
  StatsStrip,
  Manifesto,
  Testimonials,
  Oracle,
  Refactor,
  DigEasterEgg,
  ColorPaint,
} from './extras.jsx';

// Locked-in design tokens. Green theme + cursor mist on.
const CURSOR_MIST_ON = true;
const FOG = 0.65; // hero-grid intensity — bumped up so AMOLED screens have visible texture
const TICKER_SPEED = 60;

// ── Data ───────────────────────────────────────────────────────────────────

const SERVICES = [
  { plot: 'BAY 01', name: 'WEB',      sub: 'sites & marketing',  epitaph: 'Static slop, replaced.\nSites that load before the\ncoffee finishes brewing.',                stack: ['Next.js', 'Astro', 'WebGL'] },
  { plot: 'BAY 02', name: 'SOFTWARE', sub: 'apps & systems',     epitaph: 'From a sketch on a napkin to\na production binary that survives\nits own success.',          stack: ['TypeScript', 'Rust', 'Postgres'] },
  { plot: 'BAY 03', name: 'AI',       sub: 'agents & pipelines', epitaph: 'We ship the boring parts that\nmake models useful: retrieval,\nevals, the plumbing.',         stack: ['Claude', 'pgvector', 'Modal'] },
  { plot: 'BAY 04', name: 'BRAND',    sub: 'identity & rituals', epitaph: "Marks that work at billboard\nscale and at favicon scale.\nWe don't discriminate.",          stack: ['Type', 'Motion', 'Tone'] },
];

const PROJECTS = [
  { date: 'MAR 2026', name: 'NORTHWIND RAIL', kind: 'Internal tooling',     cause: 'shipped' },
  { date: 'FEB 2026', name: '0xHEMLOCK',      kind: 'Smart-contract IDE',   cause: 'shipped' },
  { date: 'JAN 2026', name: 'PALE FOX',       kind: 'Brand + site',         cause: 'shipped' },
  { date: 'DEC 2025', name: 'WAKING HOURS',   kind: 'iOS app',              cause: 'shipped' },
  { date: 'NOV 2025', name: 'SUBSTRATE',      kind: 'AI eval harness',      cause: 'shipped' },
  { date: 'OCT 2025', name: 'LANTERN',        kind: 'Auth platform',        cause: 'shipped' },
  { date: 'SEP 2025', name: 'GHOSTNET',       kind: 'Observability',        cause: 'shipped' },
];

const RITES = [
  { n: '01', title: 'BRIEF', body: "Two weeks. Audits, interviews, a written diagnosis. No code, no Figma. We won't build the wrong thing fast." },
  { n: '02', title: 'SHAPE', body: "Low-fi prototypes you can click, copy you can read aloud. Ideas get killed here so they don't show up in production." },
  { n: '03', title: 'FORGE', body: "Build it. Small commits, weekly demos, no eleventh-hour reveal. You'll see ugly drafts. We prefer it that way." },
  { n: '04', title: 'SHIP',  body: "Push to prod. Two months of support, then it's yours to run. We hand over the keys, not a maintenance contract." },
];

const TICKER_LINES = [
  'now in the yard: a B2B onboarding flow',
  'this quarter: 3 dashboards deleted, 1 shipped',
  'reading list: "the death of the SPA, vol. iv"',
  'office hours: thursdays, by appointment',
  'currently refactoring: an API we used to love',
  'accepting commissions for Q3 2026',
];

// ── Helpers ────────────────────────────────────────────────────────────────

function useMouse() {
  const [m, setM] = useState({ x: -999, y: -999 });
  useEffect(() => {
    const h = (e) => setM({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);
  return m;
}

function CursorMist({ enabled }) {
  const [pts, setPts] = useState([]);
  const idRef = useRef(0);
  useEffect(() => {
    if (!enabled) return;
    let last = 0;
    const h = (e) => {
      const t = performance.now();
      if (t - last < 30) return;
      last = t;
      idRef.current += 1;
      const id = idRef.current;
      setPts((p) => [...p.slice(-18), { id, x: e.clientX, y: e.clientY, t }]);
      setTimeout(() => setPts((p) => p.filter((q) => q.id !== id)), 1400);
    };
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, [enabled]);
  if (!enabled) return null;
  return (
    <div className="mist-layer" aria-hidden="true">
      {pts.map((p, i) => (
        <span
          key={p.id}
          className="mist-puff"
          style={{ left: p.x, top: p.y, '--age': i / pts.length }}
        />
      ))}
    </div>
  );
}

// ── Sections ───────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'yard',     label: 'the yard' },
  { id: 'code',     label: 'the code' },
  { id: 'interred', label: 'interred' },
  { id: 'refactor', label: 'refactor' },
  { id: 'oracle',   label: 'oracle' },
  { id: 'summon',   label: 'summon' },
];

function useActiveSection(ids) {
  const [active, setActive] = useState(null);
  useEffect(() => {
    // Section is "active" when its top has scrolled above an invisible line
    // ~120px from the viewport top (just below the sticky topbar). Pick the
    // bottom-most section that satisfies this so each one wins as you scroll.
    const update = () => {
      const threshold = 120;
      let current = null;
      let currentTop = -Infinity;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= threshold && top > currentTop) {
          currentTop = top;
          current = id;
        }
      }
      setActive(current);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [ids.join(',')]);
  return active;
}

function TopBar({ time }) {
  const active = useActiveSection(NAV_ITEMS.map((n) => n.id));
  const handle = (e, id) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', `#${id}`);
  };
  return (
    <header className="topbar">
      <div className="tb-left">
        <span className="tb-dot" />{' '}
        <span className="tb-left-text">
          OPEN<span className="tb-left-long"> · accepting Q3 commissions</span>
        </span>
      </div>
      <nav className="tb-nav">
        {NAV_ITEMS.map((n) => (
          <a
            key={n.id}
            href={`#${n.id}`}
            onClick={(e) => handle(e, n.id)}
            className={active === n.id ? 'is-active' : ''}
          >
            {n.label}
          </a>
        ))}
      </nav>
      <div className="tb-right">{time}</div>
    </header>
  );
}

function HeroMarquee() {
  const items = [
    'OPEN FOR Q3 2026',
    '04 PROJECTS IN THE YARD',
    'NEXT SLOT — AUG',
    'REPLY IN 48 HOURS',
    'SHIPPED 48 / DELETED 12',
    'EST · MMXXII · BUILT BY HUMANS',
  ];
  const all = [...items, ...items, ...items];
  return (
    <div className="hero-marquee" aria-hidden="true">
      <div className="hero-marquee-track">
        {all.map((t, i) => (
          <span key={i} className="hero-marquee-item">
            <span className="hero-marquee-dot" /> {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function Hero({ fog }) {
  const m = useMouse();
  const px = ((m.x || 0) - (typeof window !== 'undefined' ? window.innerWidth : 0) / 2) * -0.008;
  const py = ((m.y || 0) - (typeof window !== 'undefined' ? window.innerHeight : 0) / 2) * -0.008;
  const tags = useMemo(
    () => ['websites', 'software', 'AI', 'brand systems', 'internal tools', 'iOS apps'],
    []
  );
  const [tag, setTag] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTag((t) => (t + 1) % tags.length), 1600);
    return () => clearInterval(id);
  }, [tags.length]);

  const [clock, setClock] = useState('');
  useEffect(() => {
    // Always show the studio's local time (IST, Asia/Kolkata) regardless of
    // where the visitor is — we want them to feel the time-zone gap.
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    });
    const f = () => setClock(fmt.format(new Date()));
    f();
    const id = setInterval(f, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="hero">
      <HeroMarquee />

      <div className="hero-ruler hero-ruler-t" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} className={`tick ${i % 4 === 0 ? 'tick-lg' : ''}`} />
        ))}
      </div>
      <div className="hero-ruler hero-ruler-l" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className={`tick ${i % 4 === 0 ? 'tick-lg' : ''}`} />
        ))}
      </div>

      <div
        className="hero-grid"
        aria-hidden="true"
        style={{ transform: `translate(${px}px, ${py}px)`, opacity: 0.4 + fog * 0.3 }}
      />

      <div className="hero-watermark" aria-hidden="true">
        <div className="wm-row">EST·2022 · EST·2022 · EST·2022 · EST·2022</div>
        <div className="wm-row wm-row-rev">BUILD·YARD · BUILD·YARD · BUILD·YARD</div>
      </div>

      <span className="corner corner-tl">◢</span>
      <span className="corner corner-tr">◣</span>
      <span className="corner corner-bl">◥</span>
      <span className="corner corner-br">◤</span>

      <div className="hero-inner">
        <div className="hero-marks mono">
          <span>● LIVE · NOW IN THE YARD</span>
          <span className="dim">— Q3 2026 · OPEN FOR COMMISSIONS —</span>
          <span className="dim">FILE: 048 · REV / 02</span>
        </div>

        <div className="hero-main">
          <div className="hero-left">
            <div className="lockup">
              <div className="lockup-row">
                <span className="lockup-bracket mono">[ 01 ]</span>
                <div className="lockup-prefix mono">noun /</div>
                <h1 className="lockup-grave">grave</h1>
              </div>

              <div className="lockup-yard-wrap">
                <span className="annotation annotation-left mono">
                  <span className="ann-dim">∅ MAX</span>
                  <span className="ann-line" />
                </span>
                <h1 className="lockup-yard" data-text="YARD">YARD</h1>
                <span className="annotation annotation-right mono">
                  <span className="ann-line" />
                  <span className="ann-dim">800/800</span>
                </span>
                <span className="annotation annotation-bottom mono">
                  <span className="ann-line-h" />
                  <span className="ann-dim">— BUILD ZONE —</span>
                </span>
              </div>

              <div className="lockup-row lockup-row-end">
                <span className="lockup-bracket mono">[ 02 ]</span>
                <h1 className="lockup-studios">studios</h1>
                <span className="lockup-suffix mono">/ build·co · est.2022</span>
              </div>
            </div>

            <div className="hero-tag-wrap">
              <div className="hero-tag-rule" />
              <p className="hero-tag">
                A small studio that builds&nbsp;
                <span className="tag-rotator" key={tag}>
                  <span className="tag-glow">{tags[tag]}</span>
                </span>
                <br />for founders who'd rather <em>ship</em> than wait.
              </p>
              <div className="hero-cta">
                <a className="btn-primary" href="#summon">
                  <span>START A PROJECT</span>
                  <span className="btn-glyph">→</span>
                </a>
                <a className="btn-ghost" href="#interred">recent shipments&nbsp;{'↗︎'}</a>
              </div>

              <div className="hero-keymeta">
                <div className="km"><div className="km-n">04</div><div className="km-l mono">in the yard</div></div>
                <div className="km"><div className="km-n">06</div><div className="km-l mono">slots / year</div></div>
                <div className="km"><div className="km-n">48h</div><div className="km-l mono">reply time</div></div>
                <div className="km"><div className="km-n">0</div><div className="km-l mono">retainers</div></div>
              </div>
            </div>
          </div>

          <aside className="hero-right">
            <div className="hero-r-top">
              <div className="sticker-stamp mono">
                <div className="sticker-stamp-l1">APPROVED</div>
                <div className="sticker-stamp-l2">FOR SHIPMENT</div>
                <div className="sticker-stamp-l3">N° 048 / 26</div>
              </div>
            </div>

            <div className="hero-panel">
              <div className="panel-bar mono">
                <span className="panel-dot" /> NOW IN THE YARD
                <span className="panel-count">04 / 06</span>
              </div>
              <ul className="panel-list">
                {[
                  { name: 'NORTHWIND RAIL', kind: 'internal tools',  pct: 72, eta: 'ships 14d' },
                  { name: 'PALE FOX v2',    kind: 'marketing site',  pct: 91, eta: 'ships 03d' },
                  { name: 'SUBSTRATE',      kind: 'AI eval harness', pct: 38, eta: 'ships 21d' },
                  { name: 'WAKING HOURS',   kind: 'iOS',             pct: 84, eta: 'in QA'     },
                ].map((p) => (
                  <li key={p.name} className="panel-item">
                    <span className="panel-name">{p.name}</span>
                    <span className="panel-eta mono">{p.eta}</span>
                    <span className="panel-kind mono dim">{p.kind}</span>
                    <span className="panel-pct mono">{p.pct}%</span>
                    <span className="panel-bar-track" aria-hidden="true">
                      <span className="panel-bar-fill" style={{ width: `${p.pct}%` }} />
                    </span>
                  </li>
                ))}
              </ul>
              <div className="panel-foot mono">
                <span className="dim">queue: 02</span>
                <span className="panel-foot-mid">·</span>
                <span className="dim">next slot:</span>
                <span className="panel-foot-acc">AUG 2026</span>
              </div>
            </div>

            <div className="hero-clock mono">
              <div className="clock-row">
                <span className="clock-l dim">LOCAL TIME</span>
                <span className="clock-v">{clock || '00:00:00'}<span className="clock-tz">IST</span></span>
              </div>
              <div className="clock-row">
                <span className="clock-l dim">STUDIO STATUS</span>
                <span className="clock-v clock-acc">● ON · WED–SUN</span>
              </div>
              <div className="clock-row">
                <span className="clock-l dim">FORECAST</span>
                <span className="clock-v">34° · hazy</span>
              </div>
            </div>
          </aside>
        </div>

        <div className="hero-belt mono" aria-hidden="true">
          <div className="hero-belt-track">
            {['WEB','SOFTWARE','AI','BRAND','iOS','INTERNAL TOOLS','EVALS','DESIGN SYSTEMS','PROTOTYPES','MARKETING SITES','WEB','SOFTWARE','AI','BRAND','iOS','INTERNAL TOOLS','EVALS','DESIGN SYSTEMS','PROTOTYPES','MARKETING SITES'].map((s, i) => (
              <span key={i} className="hero-belt-item">
                <span className="hero-belt-glyph">◇</span>{s}
              </span>
            ))}
          </div>
        </div>

        <div className="hero-foot mono dim">
          <span>↓ scroll the yard</span>
          <span className="hero-foot-line" />
          <span>v.26.05 / alive</span>
        </div>
      </div>
    </section>
  );
}

function MarqueeTicker({ speed }) {
  const items = [...TICKER_LINES, ...TICKER_LINES];
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track" style={{ animationDuration: `${speed}s` }}>
        {items.map((t, i) => (
          <span key={i} className="ticker-item">
            <span className="ticker-glyph">✦</span>&nbsp;&nbsp;{t}&nbsp;&nbsp;
          </span>
        ))}
      </div>
    </div>
  );
}

function Yard() {
  const [active, setActive] = useState(null);
  return (
    <section id="yard" className="yard">
      <div className="section-head">
        <span className="mono dim">§ 01 — the yard</span>
        <h2>What we build.</h2>
        <p className="section-lede">
          Four practices. Pick the one closest to the thing keeping
          you up at night — we'll handle the rest.
        </p>
      </div>

      <div className="plots">
        {SERVICES.map((s, i) => (
          <article
            key={s.plot}
            className={`plot ${active === i ? 'is-open' : ''}`}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
          >
            <div className="plot-stone">
              <div className="plot-arch" />
              <div className="plot-meta mono">{s.plot}</div>
              <div className="plot-rip mono">— R.I.P. —</div>
              <h3 className="plot-name">{s.name}</h3>
              <div className="plot-sub mono">{s.sub}</div>
              <div className="plot-cross">†</div>
              <pre className="plot-epitaph">{s.epitaph}</pre>
            </div>
            <div className="plot-base">
              <div className="plot-stack">
                {s.stack.map((x) => (
                  <span key={x} className="chip">{x}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Interred({ tickerSpeed }) {
  return (
    <section id="interred" className="interred">
      <MarqueeTicker speed={tickerSpeed} />

      <div className="section-head">
        <span className="mono dim">§ 02 — recent shipments</span>
        <h2>Things we shipped lately.</h2>
        <p className="section-lede">
          A reverse-chronological register of work that left the yard.
          Names blurred where NDAs apply.
        </p>
      </div>

      <div className="register">
        <div className="reg-head mono">
          <span>date</span>
          <span>name</span>
          <span>type</span>
          <span>cause</span>
          <span></span>
        </div>
        {PROJECTS.map((p, i) => (
          <a key={p.name} href="#" className="reg-row" style={{ '--i': i }}>
            <span className="mono dim">{p.date}</span>
            <span className="reg-name">{p.name}</span>
            <span className="reg-kind">{p.kind}</span>
            <span className="reg-cause mono">— {p.cause} —</span>
            <span className="reg-arrow">{'↗︎'}</span>
          </a>
        ))}
        <div className="reg-foot mono dim">
          + 41 earlier plots · archived since 2022
        </div>
      </div>
    </section>
  );
}

function Rites() {
  return (
    <section id="rites" className="rites">
      <div className="section-head">
        <span className="mono dim">§ 03 — process</span>
        <h2>How a project gets built.</h2>
        <p className="section-lede">
          Four phases. We don't start phase 03 until phase 01 is actually
          finished. The whole thing takes 6 – 16 weeks.
        </p>
      </div>

      <ol className="rites-list">
        {RITES.map((r) => (
          <li key={r.n} className="rite">
            <div className="rite-roman">{r.n}.</div>
            <div className="rite-title">{r.title}</div>
            <p className="rite-body">{r.body}</p>
            <div className="rite-rule" />
          </li>
        ))}
      </ol>
    </section>
  );
}

// ── Summon — real form delivery ────────────────────────────────────────────
// Two-path delivery:
//  1. If FORM_ENDPOINT is set, POST JSON to it (works with Formspree, Web3Forms,
//     Getform, Basin, or any endpoint that accepts JSON and replies 2xx).
//  2. Otherwise (or on failure) open the visitor's mail client via mailto:
//     with the brief pre-filled. The email lands at CONTACT_EMAIL.
//
// To wire Formspree:
//   1. Sign up at https://formspree.io (free tier: 50 submissions/month)
//   2. Create a form, copy the endpoint that looks like:
//        https://formspree.io/f/xxxxxxxx
//   3. Paste it into FORM_ENDPOINT below — done. Submissions arrive in your inbox.
//
// To wire Web3Forms instead:
//   - Get an access_key at https://web3forms.com
//   - Set FORM_ENDPOINT = 'https://api.web3forms.com/submit'
//   - Add { access_key: 'YOUR_KEY' } to the request body in submit()
const FORM_ENDPOINT = 'https://formspree.io/f/maqkdknn';                     
const CONTACT_EMAIL = 'gr4veyardstudio@gmail.com';

function Summon() {
  const [form, setForm] = useState({ name: '', email: '', brief: '' });
  // status: idle | sending | sent | error
  const [status, setStatus] = useState('idle');
  const [errMsg, setErrMsg] = useState('');

  const valid = form.name.trim() && form.email.trim() && form.brief.trim();

  const buildMailto = () => {
    const subject = `brief from ${form.name || 'someone'}`;
    const body =
      `from: ${form.name}\n` +
      `contact: ${form.email}\n\n` +
      `brief:\n${form.brief}\n`;
    return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!valid || status === 'sending') return;
    setStatus('sending');
    setErrMsg('');

    // Path 1 — POST to endpoint (Formspree-compatible).
    if (FORM_ENDPOINT) {
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            brief: form.brief,
            _subject: `brief from ${form.name}`,
            _from: 'graveyardstudios.tech',
          }),
        });
        if (!res.ok) throw new Error(`server ${res.status}`);
        setStatus('sent');
        setForm({ name: '', email: '', brief: '' });
        return;
      } catch (err) {
        setStatus('error');
        setErrMsg("the wire dropped. open your mail app below — same effect.");
        return;
      }
    }

    // Path 2 — no endpoint configured: open mail client.
    window.location.href = buildMailto();
    setStatus('sent');
  };

  const sent = status === 'sent';
  const sending = status === 'sending';
  const errored = status === 'error';

  return (
    <section id="summon" className="summon">
      <div className="summon-grid">
        <div className="summon-left">
          <span className="mono dim">§ 04 — summon</span>
          <h2>
            Got something
            <br />that needs
            <br /><em>to&nbsp;ship</em>?
          </h2>
          <p className="section-lede">
            We take 4 – 6 commissions a year. Brief us in three sentences
            and we'll respond inside 48 hours.
          </p>

          <div className="summon-meta mono">
            <div><span className="dim">studio.</span> INDEPENDENT</div>
            <div><span className="dim">founder.</span> MOHD AIJAZ</div>
            <div><span className="dim">hours.</span> WED–SUN · 11–19h IST</div>
            <div>
              <span className="dim">signal.</span>{' '}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </div>
            <div><span className="dim">crypt.</span> @graveyardstudios</div>
          </div>
        </div>

        <form className={`summon-form ${sent ? 'is-sent' : ''}`} onSubmit={submit} noValidate>
          <div className="terminal-bar mono">
            <span>● ● ●</span>
            <span>seance.sh — bash</span>
            <span></span>
          </div>
          <div className="terminal-body">
            <label>
              <span className="mono dim">$ name</span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="who's calling"
                disabled={sending || sent}
                required
              />
            </label>
            <label>
              <span className="mono dim">$ contact</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email"
                disabled={sending || sent}
                required
              />
            </label>
            <label>
              <span className="mono dim">$ brief --three-sentences</span>
              <textarea
                rows={5}
                value={form.brief}
                onChange={(e) => setForm({ ...form, brief: e.target.value })}
                placeholder={'1. what is it\n2. who is it for\n3. when does it have to ship'}
                disabled={sending || sent}
                required
              />
            </label>
            <div className="terminal-foot">
              <span className="mono dim">
                ↳ replies within 48 hours. or email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> directly.
              </span>
              <button
                type="submit"
                className="btn-primary"
                disabled={!valid || sending || sent}
              >
                <span>
                  {sent ? 'TRANSMITTED' : sending ? 'SENDING' : 'SEND BRIEF'}
                </span>
                <span className="btn-glyph">
                  {sent ? '✓' : sending ? '…' : '→'}
                </span>
              </button>
            </div>
            {sent && (
              <div className="terminal-out mono">
                &gt; brief received. we'll be in touch within 48 hours.
              </div>
            )}
            {errored && (
              <div className="terminal-out mono terminal-out-err">
                &gt; {errMsg}
                <br />
                &gt;{' '}
                <a className="terminal-mailto" href={buildMailto()}>
                  open mail client with the brief pre-filled {'↗︎'}
                </a>
              </div>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="foot">
      <div className="foot-rule">
        <span className="mono dim">— end of plot —</span>
      </div>
      <pre className="foot-ascii">{String.raw`
   ╷                              ╷
   │   everything ships from      │
   │   the yard, eventually.      │
   │   no exceptions.             │
   ╵                              ╵
`}</pre>
      <div className="foot-bottom mono dim">
        <span>graveYARD studios · MMXXII–MMXXVI</span>
        <span>no analytics · no cookies · no ghosts (we checked)</span>
        <span>↑ to top</span>
      </div>
    </footer>
  );
}

// ── App ────────────────────────────────────────────────────────────────────

export default function App() {
  const [time, setTime] = useState('');
  const [booted, setBooted] = useState(
    () => typeof sessionStorage !== 'undefined' && sessionStorage.getItem('gy_booted_v2') === '1'
  );

  const finishBoot = () => {
    sessionStorage.setItem('gy_booted_v2', '1');
    setBooted(true);
  };

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    });
    const f = () => setTime(`${fmt.format(new Date())} IST`);
    f();
    const id = setInterval(f, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="app">
      {!booted && <BootSequence onDone={finishBoot} />}
      <CursorMist enabled={CURSOR_MIST_ON} />
      <DigEasterEgg />
      <TopBar time={time} />
      <Hero fog={FOG} />
      <StatsStrip />
      <Yard />
      <Manifesto />
      <Interred tickerSpeed={TICKER_SPEED} />
      <Testimonials />
      <Rites />
      <Refactor />
      <Oracle />
      <Summon />
      <Footer />
      <ColorPaint />
    </div>
  );
}
