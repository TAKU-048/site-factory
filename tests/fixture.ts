export function fixture() {
  return {
    company: { name: '検証企業（デモ）', tagline: '企業に固有の価値を、伝える。', description: '制作システム検証用の架空企業です。', email: 'contact@example.com', address: '所在地未設定', phone: '', philosophy: '顧客の実際の情報を丁寧に伝える。' },
    industry: 'b2b', demo: true, factsConfirmed: true,
    assets: [] as Array<{id:string;path:string;alt:string;permitted:boolean}>,
    form: { connected: false, fields: ['name','email','message'] },
    pages: [
      { slug: '', title: 'ホーム', description: '検証用サイト', sections: [{ id: 'hero', type: 'hero', heading: '企業に固有の価値を、伝える。', body: '検証用の文章です。' }] },
      { slug: 'services', title: '事業紹介', description: '提供内容', sections: [{id:'services',type:'services',heading:'事業紹介',items:[{title:'相談',body:'掲載情報を整理します。'}]}] },
      { slug: 'company', title: '会社概要', description: '会社の情報', sections: [{id:'company',type:'company',heading:'会社概要'}] },
      { slug: 'approach', title: '大切にすること', description: '理念', sections: [{id:'intro',type:'intro',heading:'大切にすること',body:'事実を大切にします。'}] },
      { slug: 'contact', title: 'お問い合わせ', description: 'ご相談の入口', sections: [{id:'contact',type:'form',heading:'お問い合わせ'}] },
      { slug: 'privacy', title: 'プライバシーポリシー', description: '個人情報の扱い', sections: [{id:'privacy',type:'prose',heading:'プライバシーポリシー',body:'検証用のサンプルです。'}] }
    ]
  };
}
