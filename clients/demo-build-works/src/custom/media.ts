// このデモ専用：施工例ごとの写真。共通エンジンの site.json は1セクション1画像のため、項目単位の写真はここで持つ。
import site from '../data/site.json';

export const itemImages: Record<string, string[]> = {
  hero: ['works-hero', 'works-living', 'works-dining', 'works-garden-room'],
  pickup: ['works-facade', 'works-living', 'works-dining'],
  'works-list': ['works-facade', 'works-living', 'works-kitchen', 'works-stair', 'works-dining', 'works-garden-room', 'works-snow', 'works-wall'],
};

export function asset(id: string | undefined) {
  return site.assets.find((a) => a.id === id);
}

export function srcset(path: string) {
  return `/assets/${path.replace(/\.webp$/, '-800.webp')} 800w, /assets/${path} 1600w`;
}

// 施工例の本文は「区分|説明」の形で持つ
export function splitWork(body: string) {
  const [category, ...rest] = body.split('|');
  return { category, text: rest.join('|') };
}
