// 中華そば 灯（制作デモ）専用：品目ごとの写真と、価格つき本文の分解。
import site from '../data/site.json';

export const itemImages: Record<string, (string | undefined)[]> = {
  recommend: ['ramen-shoyu', 'ramen-special', 'ramen-shio'],
  'menu-ramen': ['ramen-hero', 'ramen-special', 'ramen-shio', 'ramen-miso', undefined],
  'menu-side': ['side-gyoza', undefined, undefined, undefined],
};

export function asset(id: string | undefined) {
  return id ? site.assets.find((a) => a.id === id) : undefined;
}

export function srcset(path: string) {
  return `/assets/${path.replace(/\.webp$/, '-800.webp')} 800w, /assets/${path} 1600w`;
}

// 本文は「価格|説明」の形で持つ
export function splitPrice(body: string) {
  const [price, ...rest] = body.split('|');
  return { price, text: rest.join('|') };
}

// 営業時間（トップの「ただいま営業中」表示に使う）。定休日は火曜（0=日曜）。
export const hours = { closedDay: 2, slots: [['11:30', '15:00'], ['17:30', '23:00']] as [string, string][] };
