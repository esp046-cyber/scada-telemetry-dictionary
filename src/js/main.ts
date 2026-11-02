import type { Term, State } from './types';
import { search, suggest, ambient, toExport, escapeHtml as h } from './utils';
import { load, save } from './store';
import { tick } from './feedback';
import { card } from '../components/card';
import { detail } from '../components/detail';

const $ = <T extends HTMLElement>(s: string): T => document.querySelector(s) as T;
const state: State = load();
let terms: Term[] = [];
let protocol = 'All', industry = 'All', openId: string | null = null;

async function boot(): Promise<void> {
  try {
    const r = await fetch('./terms.json'); if (!r.ok) throw new Error(String(r.status));
    terms = (await r.json()) as Term[];
  } catch { $('#grid').innerHTML = '<p role="alert">Could not load the dictionary. Reconnect once to cache it for offline use.</p>'; return; }
  initSentry();
  applyPrefs(); fillFilters(); render(); dashboard(); wire();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => undefined);
  if (!localStorage.getItem('agac-toured')) import('../components/tour').then(m => m.runTour($('#overlay'), () => localStorage.setItem('agac-toured', '1')));
}
// Set a DSN via <meta name="sentry-dsn">; the Sentry chunk loads only when configured.
function initSentry(): void {
  const dsn = document.querySelector<HTMLMetaElement>('meta[name="sentry-dsn"]')?.content;
  if (dsn) import('@sentry/browser').then(S => S.init({ dsn })).catch(() => undefined);
}
function persist(): void { save(state); }
function applyPrefs(): void {
  const p = state.prefs, d = document.documentElement;
  d.dataset.theme = p.dark ? 'dark' : 'light'; d.dataset.contrast = String(p.contrast); d.dataset.focus = String(p.focus);
  d.dataset.light = ambient(new Date().getHours()); d.style.setProperty('--scale', String(p.size / 100));
}
function fillFilters(): void {
  const opts = (id: string, vals: string[]): void => { $(id).innerHTML = ['All', ...vals].map(v => `<option>${h(v)}</option>`).join(''); };
  opts('#f-protocol', [...new Set(terms.map(t => t.protocol))]);
  opts('#f-industry', [...new Set(terms.flatMap(t => t.industry))]);
}
function render(): void {
  const q = $<HTMLInputElement>('#q').value;
  const list = search(terms, q, protocol, industry);
  // Predictive personalisation: most-visited terms float first when no query is typed.
  if (!q) list.sort((a, b) => (state.visits[b.id] || 0) - (state.visits[a.id] || 0));
  $('#grid').innerHTML = list.length ? list.map((t, i) => card(t, state.bookmarks.includes(t.id), i)).join('') : '<p>No terms match. Clear the search or choose All.</p>';
  $('#count').textContent = `${list.length} terms`;
}
function dashboard(): void {
  const pct = Math.round((state.studied.length / terms.length) * 100);
  $('#progress').style.setProperty('--p', `${pct}%`);
  $('#progress-text').textContent = `${state.studied.length} of ${terms.length} studied`;
  const items = state.recent.map(id => terms.find(t => t.id === id)).filter((t): t is Term => Boolean(t)).slice(0, 4);
  $('#recent').innerHTML = items.map(t => `<button class="chip" data-open="${h(t.id)}">${h(t.term)}</button>`).join(' ') || 'Terms you open appear here.';
}
function open(id: string): void {
  const t = terms.find(x => x.id === id); if (!t) return;
  openId = id; state.recent = [id, ...state.recent.filter(x => x !== id)].slice(0, 8); state.visits[id] = (state.visits[id] || 0) + 1; persist();
  const view = $('#detail'); view.innerHTML = detail(t, state.prefs.deep); view.hidden = false; $('#list').hidden = true;
  view.classList.add('enter'); view.querySelector<HTMLElement>('button')?.focus(); tick(state.prefs.sound, 640); dashboard();
}
function close(): void { openId = null; $('#detail').hidden = true; $('#list').hidden = false; tick(state.prefs.sound, 420); }
async function share(id: string): Promise<void> {
  const t = terms.find(x => x.id === id); if (!t) return;
  const text = toExport(t);
  if (navigator.share) { try { await navigator.share({ title: t.term, text }); return; } catch { /* cancelled */ } }
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([text], { type: 'text/plain' })), download: `${t.id}.txt` }); a.click(); URL.revokeObjectURL(a.href);
}
type Rec = { lang: string; onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; start(): void };
function voice(): void {
  const W = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
  const Ctor = W.SpeechRecognition || W.webkitSpeechRecognition;
  if (!Ctor) { $('#status').textContent = 'Voice input is not supported in this browser.'; return; }
  const r = new Ctor(); r.lang = 'en-US';
  r.onresult = (e): void => {
    const raw = e.results[0][0].transcript.toLowerCase(), said = raw.replace(/^open\s+/, '');
    const hit = search(terms, said)[0];
    if (/^(back|close)$/.test(raw)) close();
    else if (hit && raw.startsWith('open')) open(hit.id);
    else { $<HTMLInputElement>('#q').value = said; render(); }
    $('#status').textContent = `Heard: ${said}`;
  };
  r.start();
}
function setSize(delta: number): void { state.prefs.size = Math.max(80, Math.min(150, state.prefs.size + delta)); persist(); applyPrefs(); }
function wire(): void {
  const q = $<HTMLInputElement>('#q');
  q.addEventListener('input', () => { $('#sugg').innerHTML = suggest(terms, q.value).map(s => `<option value="${h(s)}"></option>`).join(''); render(); });
  $('#f-protocol').addEventListener('change', e => { protocol = (e.target as HTMLSelectElement).value; render(); });
  $('#f-industry').addEventListener('change', e => { industry = (e.target as HTMLSelectElement).value; render(); });
  $('#mic').addEventListener('click', voice);
  $('#bigger').addEventListener('click', () => setSize(10));
  $('#smaller').addEventListener('click', () => setSize(-10));
  $('#saved-only').addEventListener('click', () => { q.value = ''; $('#grid').innerHTML = terms.filter(t => state.bookmarks.includes(t.id)).map((t, i) => card(t, true, i)).join('') || '<p>No saved terms yet. Tap a star to save one.</p>'; });
  document.addEventListener('click', e => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-open],[data-star],[data-close],[data-deep],[data-share],[data-studied],[data-pref]'); if (!el) return;
    const d = el.dataset;
    if (d.open) open(d.open);
    else if (d.star) { const s = state.bookmarks; state.bookmarks = s.includes(d.star) ? s.filter(x => x !== d.star) : [...s, d.star]; tick(state.prefs.sound, 780); persist(); render(); }
    else if (d.close !== undefined) close();
    else if (d.deep !== undefined && openId) { state.prefs.deep = true; persist(); open(openId); }
    else if (d.share) void share(d.share);
    else if (d.studied) { if (!state.studied.includes(d.studied)) state.studied.push(d.studied); persist(); dashboard(); $('#status').textContent = 'Marked as studied.'; tick(state.prefs.sound, 880); }
    else if (d.pref) { const k = d.pref as 'dark' | 'contrast' | 'focus' | 'sound'; state.prefs[k] = !state.prefs[k]; persist(); applyPrefs(); tick(state.prefs.sound); }
  });
  document.addEventListener('keydown', e => {
    const typing = (e.target as HTMLElement).matches('input,select,textarea');
    if (e.key === '/' && !typing) { e.preventDefault(); q.focus(); }
    else if (e.key === 'Escape') { if (openId) close(); else q.blur(); }
    else if (!typing && e.key.toLowerCase() === 'd') { state.prefs.dark = !state.prefs.dark; persist(); applyPrefs(); }
    else if (!typing && e.key.toLowerCase() === 'f') { state.prefs.focus = !state.prefs.focus; persist(); applyPrefs(); }
  });
  // Pointer, device tilt and scroll drive depth and variable-font motion. Skipped for reduced motion.
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.addEventListener('pointermove', e => {
      const c = (e.target as HTMLElement).closest<HTMLElement>('[data-tilt]'); if (!c) return;
      const r = c.getBoundingClientRect(); c.style.setProperty('--rx', `${((e.clientY - r.top) / r.height - 0.5) * -8}deg`); c.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 8}deg`);
    });
    window.addEventListener('deviceorientation', e => { document.documentElement.style.setProperty('--tilt', ((e.gamma ?? 0) / 45).toFixed(2)); });
    window.addEventListener('scroll', () => document.documentElement.style.setProperty('--scroll', String(Math.min(window.scrollY / 600, 1))), { passive: true });
  }
}
void boot();
