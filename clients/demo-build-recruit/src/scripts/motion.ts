// ミナモト建設（制作デモ）の動き。
// ・[data-reveal]：画面に入ったら is-in を付ける（黄色い仮囲いの板が外れる演出はCSS側）
// ・[data-progress]：要素の中をスクロールした割合を --p（0〜1）に入れる（育ち方の線が伸びる）
// 「視差効果を減らす」設定の人には、最初から完成した状態で表示する。
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('js');
requestAnimationFrame(() => document.body.classList.add('is-loaded'));

const reveals = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
if (reduce || !('IntersectionObserver' in window)) {
  reveals.forEach((el) => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
  reveals.forEach((el) => io.observe(el));
}

const tracks = [...document.querySelectorAll<HTMLElement>('[data-progress]')];
function update() {
  const vh = window.innerHeight;
  for (const t of tracks) {
    const r = t.getBoundingClientRect();
    const p = reduce ? 1 : Math.min(1, Math.max(0, (vh * 0.6 - r.top) / r.height));
    t.style.setProperty('--p', p.toFixed(3));
    t.querySelectorAll<HTMLElement>('[data-step]').forEach((s) => {
      const sr = s.getBoundingClientRect();
      s.classList.toggle('is-passed', reduce || sr.top < vh * 0.6);
    });
  }
}
if (tracks.length) {
  update();
  window.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
  window.addEventListener('resize', update);
}

// 横断幕の帯：止める／流すを切り替える（動き続ける表示を止められるように）
document.querySelectorAll<HTMLButtonElement>('[data-ticker-toggle]').forEach((btn) => {
  const box = btn.closest<HTMLElement>('[data-ticker]')!;
  if (reduce) { box.classList.add('is-paused'); btn.setAttribute('aria-pressed', 'true'); btn.textContent = '流す'; }
  btn.addEventListener('click', () => {
    const paused = box.classList.toggle('is-paused');
    btn.setAttribute('aria-pressed', String(paused));
    btn.textContent = paused ? '流す' : '流れを止める';
  });
});
