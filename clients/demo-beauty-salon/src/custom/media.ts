// hair studio Lune（制作デモ）専用：項目ごとの写真と、区分つき本文の分解。
import site from '../data/site.json';

export const itemImages: Record<string, (string | undefined)[]> = {
  styles: ['style-short-red', 'style-pixie', 'style-bob', 'style-color'],
  'style-gallery': ['style-short-red', 'style-pixie', 'style-bob', 'style-color', 'style-side'],
};

export function asset(id: string | undefined) {
  return id ? site.assets.find((a) => a.id === id) : undefined;
}

export function srcset(path: string) {
  return `/assets/${path.replace(/\.webp$/, '-800.webp')} 800w, /assets/${path} 1600w`;
}

// 本文は「区分|説明」の形で持つ（スタイル一覧）
export function splitCat(body: string) {
  const [category, ...rest] = body.split('|');
  return rest.length ? { category, text: rest.join('|') } : { category: '', text: body };
}
