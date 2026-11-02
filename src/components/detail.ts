import type { Term } from '../js/types';
import { escapeHtml as h } from '../js/utils';
export function detail(t: Term, deep: boolean): string {
  const hasDeep = Boolean(t.integration);
  const integ = hasDeep ? `<section><h3>Integration steps</h3><p>${h(t.integration)}</p></section>` : '';
  const trouble = `<section><h3>Troubleshooting</h3><p>${h(t.troubleshooting)}</p></section>`;
  const extra = deep || !hasDeep ? integ + trouble : `<button class="btn" data-deep>Show integration and troubleshooting</button>`;
  return `<div class="detail"><button class="btn" data-close>Back to terms</button><span class="chip">${h(t.protocol)}</span><h2 class="kinetic">${h(t.term)}</h2><p class="lead">${h(t.summary)}</p><section><h3>Real-world scenario</h3><p>${h(t.scenario)}</p></section>${extra}<div class="row"><button class="btn" data-share="${h(t.id)}">Share term</button><button class="btn" data-studied="${h(t.id)}">Mark as studied</button></div></div>`;
}
