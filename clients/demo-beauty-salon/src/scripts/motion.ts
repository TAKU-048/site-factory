// hair studio Lune（制作デモ）の動き。
// ・[data-reveal]：画面に入ったら is-in（写真はアーチ型の鏡の形に下から現れる。CSS側）
// ・[data-carousel]：スタイルの横スクロールを前後ボタンでも動かす
// ・[data-filters]：スタイル一覧の絞り込み
// 「視差効果を減らす」設定の人には、動きを止めて完成した状態で表示する。
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('js');
requestAnimationFrame(() => setTimeout(() => document.body.classList.add('is-loaded'), 60));

const reveals = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
if (reduce || !('IntersectionObserver' in window)) reveals.forEach((el) => el.classList.add('is-in'));
else {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  reveals.forEach((el) => io.observe(el));
}

for (const box of document.querySelectorAll<HTMLElement>('[data-carousel]')) {
  const track = box.querySelector<HTMLElement>('[data-track]')!;
  const step = () => (track.querySelector('li')?.getBoundingClientRect().width || 300) + 24;
  box.querySelector('[data-prev]')?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }));
  box.querySelector('[data-next]')?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }));
}

for (const box of document.querySelectorAll<HTMLElement>('[data-filters]')) {
  box.hidden = false;
  const items = [...document.querySelectorAll<HTMLElement>('[data-category]')];
  const status = document.querySelector<HTMLElement>('[data-filter-status]');
  box.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest('button'); if (!b) return;
    const f = b.dataset.filter!;
    box.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    let n = 0;
    items.forEach((it) => { const show = f === 'all' || it.dataset.category === f; it.hidden = !show; if (show) { n++; it.querySelector('[data-reveal]')?.classList.add('is-in'); } });
    if (status) status.textContent = `${f === 'all' ? 'すべて' : f}のスタイルを${n}件表示しています。`;
  });
}

// スマホでは、ヒーローが見えている間は画面下の予約ボタンを隠す
const hero = document.querySelector('.hero');
if (hero && 'IntersectionObserver' in window) new IntersectionObserver(([e]) => document.body.classList.toggle('hero-in-view', e.isIntersecting)).observe(hero);
