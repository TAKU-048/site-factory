// デイサービス こもれび舎（制作デモ）の動き。
// ・[data-reveal]：画面に入ったら is-in（CSS側で現れ方を決める）
// ・[data-text-size]：文字を大きくする（この端末のブラウザにだけ記憶。保存できない環境でも表示はそのまま動く）
// ・[data-motion-toggle]：木漏れ日・葉・季節の舞う動きを止める／動かす
// ・[data-sunday]：1日の予定をスクロールすると、太陽が空をたどり、空の色が朝→昼→夕に変わる
// ・[data-seasons]：季節を選ぶと、背景の色と舞うもの（花びら・蛍・葉・雪）が変わる
// 「視差効果を減らす」設定の人には、自動で動くものを止めて完成した状態で表示する。
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

// 文字の大きさ
for (const b of document.querySelectorAll<HTMLButtonElement>('[data-text-size]')) {
  const label = b.querySelector<HTMLElement>('[data-text-size-label]')!;
  const sync = () => { const on = root.classList.contains('text-large'); b.setAttribute('aria-pressed', String(on)); label.textContent = on ? '文字を元に戻す' : '文字を大きく'; };
  sync();
  b.addEventListener('click', () => {
    const on = root.classList.toggle('text-large');
    try { localStorage.setItem('komorebi-text', on ? 'large' : 'normal'); } catch { /* 保存できない環境では、このページを開いている間だけ有効 */ }
    sync();
    updateSun();
  });
}

// 自動で動くものの一時停止
const toggles = [...document.querySelectorAll<HTMLButtonElement>('[data-motion-toggle]')];
const labels = new Map(toggles.map((b) => [b, b.textContent || '']));
function setPaused(paused: boolean) {
  document.body.classList.toggle('motion-paused', paused);
  toggles.forEach((b) => { b.setAttribute('aria-pressed', String(paused)); b.textContent = paused ? '動きを再開する' : labels.get(b)!; });
}
toggles.forEach((b) => b.addEventListener('click', () => setPaused(!document.body.classList.contains('motion-paused'))));
if (reduce) setPaused(true);

// 1日の太陽
const sky = [[214, 233, 238], [255, 240, 200], [246, 205, 170]];
const mix = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
function updateSun() {
  for (const box of document.querySelectorAll<HTMLElement>('[data-sunday]')) {
    const steps = [...box.querySelectorAll<HTMLElement>('[data-step]')];
    if (!steps.length) continue;
    const line = window.innerHeight * 0.5;
    const first = steps[0].getBoundingClientRect().top, last = steps[steps.length - 1].getBoundingClientRect().top;
    const p = Math.min(1, Math.max(0, (line - first) / Math.max(1, last - first)));
    let active = 0;
    steps.forEach((s, i) => { if (s.getBoundingClientRect().top <= line) active = i; });
    steps.forEach((s, i) => s.classList.toggle('is-now', i === active));
    const a = Math.PI * (1 - p);
    const sun = box.querySelector<SVGGElement>('[data-sun]');
    sun?.setAttribute('transform', `translate(${(200 + 170 * Math.cos(a)).toFixed(1)} ${(206 - 170 * Math.sin(a)).toFixed(1)})`);
    const c = p < 0.5 ? mix(sky[0], sky[1], p * 2) : mix(sky[1], sky[2], (p - 0.5) * 2);
    box.style.setProperty('--sky', `rgb(${c.join(',')})`);
    const t = box.querySelector<HTMLElement>('[data-sky-time]'), l = box.querySelector<HTMLElement>('[data-sky-label]');
    if (t) t.textContent = steps[active].dataset.time || '';
    if (l) l.textContent = steps[active].dataset.label || '';
  }
}
if (document.querySelector('[data-sunday]')) {
  updateSun();
  window.addEventListener('scroll', () => requestAnimationFrame(updateSun), { passive: true });
  window.addEventListener('resize', updateSun);
}

// 季節
for (const box of document.querySelectorAll<HTMLElement>('[data-seasons]')) {
  const buttons = [...box.querySelectorAll<HTMLButtonElement>('[data-season-btn]')];
  const panels = [...box.querySelectorAll<HTMLElement>('[data-season-panel]')];
  buttons.forEach((b) => b.addEventListener('click', () => {
    const k = b.dataset.seasonBtn!;
    box.dataset.season = k;
    buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    panels.forEach((p) => (p.hidden = p.dataset.seasonPanel !== k));
  }));
}
