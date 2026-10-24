// 中華そば 灯（制作デモ）の動き。
// ・読み込み時に暖簾が開く（is-loaded）。湯気・提灯・暖簾の揺れはCSS。
// ・[data-reveal]：画面に入ったら is-in。
// ・[data-open-status]：いまの時刻（日本時間）から営業中かどうかを表示する。
// ・[data-route]：地図の道順の線を、画面に入ったら描く。
// 「視差効果を減らす」設定の人には、揺れ・湯気を止め、完成した状態で表示する。
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('js');
requestAnimationFrame(() => setTimeout(() => document.body.classList.add('is-loaded'), 60));

const reveals = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
if (reduce || !('IntersectionObserver' in window)) reveals.forEach((el) => el.classList.add('is-in'));
else {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
  reveals.forEach((el) => io.observe(el));
}

// 営業中の表示
for (const el of document.querySelectorAll<HTMLElement>('[data-open-status]')) {
  const closedDay = Number(el.dataset.closed);
  const slots: [string, string][] = JSON.parse(el.dataset.slots || '[]');
  const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const render = () => {
    const parts = new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
    const wd = ['日', '月', '火', '水', '木', '金', '土'].indexOf(parts.find((p) => p.type === 'weekday')!.value);
    const now = Number(parts.find((p) => p.type === 'hour')!.value) * 60 + Number(parts.find((p) => p.type === 'minute')!.value);
    let open = false, next = '';
    if (wd !== closedDay) {
      for (const [a, b] of slots) { if (now >= toMin(a) && now < toMin(b)) { open = true; next = b; break; } }
      if (!open) { const later = slots.find(([a]) => toMin(a) > now); if (later) next = later[0]; }
    }
    el.classList.toggle('is-open', open);
    el.querySelector('[data-status-text]')!.textContent = open
      ? `ただいま営業中（${next}まで）`
      : wd === closedDay ? '本日は定休日です' : next ? `準備中｜次は${next}から` : '本日の営業は終了しました';
  };
  render();
  setInterval(render, 60000);
}

// 地図の道順
for (const route of document.querySelectorAll<SVGElement>('[data-route]')) {
  if (reduce || !('IntersectionObserver' in window)) { route.classList.add('is-in'); continue; }
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { route.classList.add('is-in'); io.disconnect(); } }, { threshold: 0.3 });
  io.observe(route);
}
