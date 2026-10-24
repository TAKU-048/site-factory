// 株式会社朝凪運輸（制作デモ）の動き。
// ・[data-reveal]：画面に入ったら is-in（CSS側で現れ方を決める）
// ・[data-motion-toggle]：ヒーローの光の筋とルート図の走る点を止める／動かす（どのボタンでも全体が切り替わる）
// ・[data-dispatch]：日本時間で、平日7:00〜19:00なら「配車受付中」と表示
// ・[data-routes]：一覧の地域を選ぶと、ルート図の該当する線を強調
// ・[data-picker]：車の大きさを選ぶと、トラックが入れ替わって荷台にパレットが並ぶ
// ・[data-progress]：スクロールに合わせて、道路上のトラックが進む
// 「視差効果を減らす」設定の人には、動きを止めて完成した状態で表示する。
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;
root.classList.add('js');
requestAnimationFrame(() => setTimeout(() => document.body.classList.add('is-loaded'), 60));

const reveals = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
if (reduce || !('IntersectionObserver' in window)) reveals.forEach((el) => el.classList.add('is-in'));
else {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  reveals.forEach((el) => io.observe(el));
}

// 動きの一時停止
const toggles = [...document.querySelectorAll<HTMLButtonElement>('[data-motion-toggle]')];
const svgs = () => [...document.querySelectorAll<SVGSVGElement>('[data-route-svg]')];
function setPaused(paused: boolean) {
  document.body.classList.toggle('motion-paused', paused);
  svgs().forEach((s) => (paused ? s.pauseAnimations() : s.unpauseAnimations()));
  toggles.forEach((b) => {
    b.setAttribute('aria-pressed', String(paused));
    b.textContent = b.classList.contains('motion-toggle--inline') ? (paused ? '走る点を動かす' : '走る点の動きを止める') : (paused ? '背景を動かす' : '背景の動きを止める');
  });
}
toggles.forEach((b) => b.addEventListener('click', () => setPaused(!document.body.classList.contains('motion-paused'))));
if (reduce) setPaused(true);

// 配車受付の表示（日本時間）
for (const el of document.querySelectorAll<HTMLElement>('[data-dispatch]')) {
  const cfg = JSON.parse(el.dataset.dispatch || '{}') as { days: number[]; open: string; close: string };
  const text = el.querySelector<HTMLElement>('[data-dispatch-text]')!;
  const update = () => {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
    const m = now.getHours() * 60 + now.getMinutes();
    const toMin = (t: string) => { const [h, mm] = t.split(':').map(Number); return h * 60 + mm; };
    const open = cfg.days.includes(now.getDay()) && m >= toMin(cfg.open) && m < toMin(cfg.close);
    el.classList.toggle('is-open', open);
    text.textContent = open ? `ただいま配車受付中（平日 ${cfg.open.replace(/^0/, '')}〜${cfg.close}）` : `配車受付は平日 ${cfg.open.replace(/^0/, '')}〜${cfg.close}（受付時間外です）`;
  };
  update();
  setInterval(update, 60000);
}

// ルート図
for (const box of document.querySelectorAll<HTMLElement>('[data-routes]')) {
  const buttons = [...box.querySelectorAll<HTMLButtonElement>('[data-route]')];
  const lines = [...box.querySelectorAll<SVGGElement>('[data-route-line]')];
  const pick = (i: number | null) => {
    box.classList.toggle('has-pick', i !== null);
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.route) === i)));
    lines.forEach((l) => l.classList.toggle('is-picked', Number(l.dataset.routeLine) === i));
  };
  buttons.forEach((b) => {
    const i = Number(b.dataset.route);
    b.addEventListener('click', () => pick(b.getAttribute('aria-pressed') === 'true' ? null : i));
    b.addEventListener('mouseenter', () => { if (!box.querySelector('[data-route][aria-pressed=true]')) lines.forEach((l) => l.classList.toggle('is-hover', Number(l.dataset.routeLine) === i)); });
    b.addEventListener('mouseleave', () => lines.forEach((l) => l.classList.remove('is-hover')));
  });
}

// 車格の選択
for (const box of document.querySelectorAll<HTMLElement>('[data-picker]')) {
  const buttons = [...box.querySelectorAll<HTMLButtonElement>('[data-size]')];
  const trucks = [...box.querySelectorAll<SVGSVGElement>('[data-truck]')];
  const details = [...box.querySelectorAll<HTMLElement>('[data-detail]')];
  buttons.forEach((b) => b.addEventListener('click', () => {
    const size = b.dataset.size!;
    if (b.getAttribute('aria-pressed') === 'true') return;
    buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    details.forEach((d) => (d.hidden = d.dataset.detail !== size));
    trucks.forEach((t) => {
      if (t.classList.contains('is-active')) { t.classList.remove('is-active'); t.classList.add('is-leaving'); setTimeout(() => t.classList.remove('is-leaving'), reduce ? 0 : 700); }
      if (t.dataset.truck === size) t.classList.add('is-active');
    });
  }));
}

// スクロール連動（道路のトラック）
const tracks = [...document.querySelectorAll<HTMLElement>('[data-progress]')];
function update() {
  const vh = window.innerHeight;
  for (const t of tracks) {
    const r = t.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (vh * 0.75 - r.top) / (r.height * 0.85)));
    t.style.setProperty('--p', p.toFixed(3));
  }
}
if (tracks.length) {
  update();
  window.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
  window.addEventListener('resize', update);
}
