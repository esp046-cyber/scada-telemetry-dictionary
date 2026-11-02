const STEPS = ['Press / to search. Suggestions appear as you type.', 'Tap the star to save a term. Saved terms work offline.', 'Press F for focus mode, D for dark mode, or tap Mic and say "open unsolicited response".', 'Terms show the essentials first. Choose "Show integration and troubleshooting" for the deep dive.'];
export function runTour(root: HTMLElement, done: () => void): void {
  let i = 0;
  const show = (): void => {
    root.innerHTML = `<div class="tour" role="dialog" aria-modal="true" aria-label="Quick-start tour"><p>${STEPS[i]}</p><button class="btn" id="next">${i === STEPS.length - 1 ? 'Start' : 'Next'}</button></div>`;
    root.querySelector<HTMLButtonElement>('#next')?.addEventListener('click', () => { if (++i < STEPS.length) show(); else { root.innerHTML = ''; done(); } });
    root.querySelector<HTMLButtonElement>('#next')?.focus();
  };
  show();
}
