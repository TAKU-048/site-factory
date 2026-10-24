// このデモ専用の線画アイコン（自作。24pxグリッド、線幅1.75、currentColor）
export const icons: Record<string, string> = {
  certificate: '<path d="M5 4h14v11H5z"/><path d="M8 8h8M8 11h5"/><circle cx="15.5" cy="17" r="2.5"/><path d="M14 19l-1 3 2.5-1 2.5 1-1-3"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="1"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/><path d="M8 14h2M14 14h2M8 17h2"/>',
  toolbox: '<path d="M3 10h18v9H3z"/><path d="M9 10V7h6v3"/><path d="M3 14h18M10 13v2M14 13v2"/>',
  car: '<path d="M4 16v-3l2-5h12l2 5v3z"/><path d="M4 13h16"/><circle cx="7.5" cy="17" r="1.6"/><circle cx="16.5" cy="17" r="1.6"/>',
  shield: '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
  helmet: '<path d="M4 16a8 8 0 0116 0z"/><path d="M3 16h18v2H3zM12 8v3M9.5 9l.8 2.5M14.5 9l-.8 2.5"/>',
  coin: '<circle cx="12" cy="12" r="8"/><path d="M9 8l3 4 3-4M12 12v5M9.5 13.5h5M9.5 15.5h5"/>',
};

// セクションIDごとに、項目の順番どおりにアイコンを割り当てる
export const itemIcons: Record<string, string[]> = {
  environment: ['certificate', 'calendar', 'toolbox', 'car'],
  benefits: ['certificate', 'calendar', 'shield', 'helmet', 'coin', 'car'],
};
