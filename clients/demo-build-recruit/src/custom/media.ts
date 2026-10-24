// このデモ専用：セクション内の項目ごとの写真と、ページ内リンク。
// 共通エンジンの site.json は1セクション1画像のため、項目単位の写真はここで持つ。
import site from '../data/site.json';

export const itemImages: Record<string, string[]> = {
  jobs: ['job-manager', 'job-site', 'job-carpenter'],
  'job-detail': ['job-manager', 'job-foundation', 'job-carpenter'],
};

export function asset(id: string | undefined) {
  return site.assets.find((a) => a.id === id);
}

// 1600px版と800px版（-800）を srcset で出し分ける
export function srcset(path: string) {
  const small = path.replace(/\.webp$/, '-800.webp');
  return `/assets/${small} 800w, /assets/${path} 1600w`;
}

export const jobAnchors = ['job-manager', 'job-site', 'job-carpenter'];
