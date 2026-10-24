// デイサービス こもれび舎（制作デモ）専用：素材の参照と、本文の分解。
// 共通エンジンの site.json は1セクション1画像のため、項目ごとの写真はここ、または本文の「|」区切りで持つ。
import site from '../data/site.json';

export const itemImages: Record<string, string[]> = {
  moments: ['care-meal', 'care-coloring', 'care-garden', 'care-reading'],
};

export function asset(id: string | undefined) {
  return id ? site.assets.find((a) => a.id === id) : undefined;
}

export function srcset(path: string) {
  return `/assets/${path.replace(/\.webp$/, '-800.webp')} 800w, /assets/${path} 1600w`;
}

/** 「本文|付帯1|付帯2…」を分ける */
export function parts(body: string) {
  const [text, ...rest] = body.split('|');
  return { text, rest };
}

/** 「8:30　お迎え」を時刻と見出しに分ける */
export function splitTime(title: string) {
  const [time, ...rest] = title.split('　');
  return { time, label: rest.join('　') };
}
