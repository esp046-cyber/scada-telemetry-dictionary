import type { Term } from '../js/types';
import { escapeHtml as h } from '../js/utils';
export function card(t: Term, saved: boolean, i: number): string {
  const size = i === 0 ? 'wide' : i % 4 === 3 ? 'tall' : '';
  return `<article class="card ${size}" data-tilt><button class="card__open" data-open="${h(t.id)}" aria-label="Open ${h(t.term)}"><span class="chip">${h(t.protocol)}</span><h3>${h(t.term)}</h3><p>${h(t.summary)}</p></button><button class="star" data-star="${h(t.id)}" aria-pressed="${saved}" aria-label="Bookmark ${h(t.term)}">${saved ? '★' : '☆'}</button></article>`;
}
