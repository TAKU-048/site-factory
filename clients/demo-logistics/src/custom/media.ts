// 株式会社朝凪運輸（制作デモ）専用：素材の参照と、本文の分解。
// 共通エンジンの site.json は1セクション1画像のため、項目ごとの写真や付帯情報は本文の「|」区切りで持つ。
import site from '../data/site.json';

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

/** 主な行き先（ルート図用）。座標は拠点からの方角を表す模式図で、実際の地図ではない。 */
export const destinations: Record<string, { x: number; y: number; c: [number, number] }> = {
  '東京23区': { x: 404, y: 318, c: [360, 270] },
  '横浜・川崎': { x: 340, y: 432, c: [300, 360] },
  '千葉・幕張': { x: 540, y: 352, c: [430, 260] },
  'さいたま・大宮': { x: 276, y: 128, c: [300, 190] },
  '宇都宮・北関東': { x: 360, y: 34, c: [250, 120] },
  '八王子・多摩': { x: 92, y: 322, c: [190, 230] },
};
export const base = { x: 300, y: 240 };

/** 配車受付時間（平日 7:00〜19:00、日本時間）。0=日曜 */
export const dispatch = { days: [1, 2, 3, 4, 5], open: '07:00', close: '19:00' };

/** 車格ごとのパレット配置（上から見た荷台。2列×n） */
export const truckRows: Record<string, number> = { '2t': 2, '4t': 4, '10t': 8 };
