// 杣建築工房（制作デモ）の動き。
// ・[data-reveal]：画面に入ったら is-in（写真は障子が左右に開くように現れる。CSS側）
// ・[data-slideshow]：トップの写真をゆっくり切り替える（止めるボタンあり）
// ・[data-parallax]：写真をスクロールに合わせてわずかに動かす
// ・[data-lightbox]：施工例を大きく表示するダイアログ
// 「視差効果を減らす」設定の人には、切り替え・視差を止め、完成した状態で表示する。
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('js');
requestAnimationFrame(() => document.body.classList.add('is-loaded'));

const reveals = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
if (reduce || !('IntersectionObserver' in window)) reveals.forEach((el) => el.classList.add('is-in'));
else {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
  reveals.forEach((el) => io.observe(el));
}

// スライドショー
for (const show of document.querySelectorAll<HTMLElement>('[data-slideshow]')) {
  const slides = [...show.querySelectorAll<HTMLElement>('[data-slide]')];
  const dots = [...show.querySelectorAll<HTMLButtonElement>('[data-dot]')];
  const toggle = show.querySelector<HTMLButtonElement>('[data-slideshow-toggle]');
  let i = 0, timer = 0, playing = !reduce;
  const go = (n: number) => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
    dots.forEach((d, k) => d.setAttribute('aria-current', String(k === i)));
  };
  const play = () => { clearInterval(timer); if (playing) timer = window.setInterval(() => go(i + 1), 6500); };
  dots.forEach((d, k) => d.addEventListener('click', () => { go(k); play(); }));
  const label = () => { if (!toggle) return; toggle.setAttribute('aria-pressed', String(!playing)); toggle.textContent = playing ? '切り替えを止める' : '切り替える'; };
  toggle?.addEventListener('click', () => { playing = !playing; show.classList.toggle('is-paused', !playing); label(); play(); });
  show.classList.toggle('is-paused', !playing); label(); go(0); play();
}

// 視差
const para = [...document.querySelectorAll<HTMLElement>('[data-parallax]')];
if (!reduce && para.length) {
  const tick = () => {
    const vh = window.innerHeight;
    for (const el of para) {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) continue;
      const p = (r.top + r.height / 2 - vh / 2) / vh; // -1〜1
      el.style.setProperty('--py', `${(p * -40).toFixed(1)}px`);
    }
  };
  tick();
  window.addEventListener('scroll', () => requestAnimationFrame(tick), { passive: true });
}

// 施工例を大きく見る
const dialog = document.querySelector<HTMLDialogElement>('[data-lightbox]');
if (dialog) {
  const items = [...document.querySelectorAll<HTMLButtonElement>('[data-open-work]')];
  const img = dialog.querySelector<HTMLImageElement>('img')!;
  const title = dialog.querySelector<HTMLElement>('[data-lb-title]')!;
  const cat = dialog.querySelector<HTMLElement>('[data-lb-cat]')!;
  const text = dialog.querySelector<HTMLElement>('[data-lb-text]')!;
  const count = dialog.querySelector<HTMLElement>('[data-lb-count]')!;
  let cur = 0, opener: HTMLElement | null = null;
  const visible = () => items.filter((b) => !b.closest('li')?.hidden);
  const show = (n: number) => {
    const list = visible(); cur = (n + list.length) % list.length; const b = list[cur];
    img.src = b.dataset.src!; img.srcset = b.dataset.srcset!; img.alt = b.dataset.alt!;
    title.textContent = b.dataset.title!; cat.textContent = b.dataset.cat!; text.textContent = b.dataset.text!;
    count.textContent = `${cur + 1} / ${list.length}`;
  };
  items.forEach((b) => b.addEventListener('click', () => { opener = b; show(visible().indexOf(b)); dialog.showModal(); }));
  dialog.querySelector('[data-lb-prev]')?.addEventListener('click', () => show(cur - 1));
  dialog.querySelector('[data-lb-next]')?.addEventListener('click', () => show(cur + 1));
  dialog.querySelector('[data-lb-close]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') show(cur + 1); if (e.key === 'ArrowLeft') show(cur - 1); });
  dialog.addEventListener('close', () => opener?.focus());
}
