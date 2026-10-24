type Page = {slug:string;sections:{id:string;type:string}[]};
export const pageHref=(slug:string)=>slug?`/${slug}/`:'/';
export function sectionHref(pages:Page[],type:string):string|undefined{
 for(const page of pages){const section=page.sections.find(s=>s.type===type);if(section)return `${pageHref(page.slug)}#${section.id}`;}
}
export function siteLinks(pages:Page[]){
 const approach=pages.find(p=>p.slug==='approach');
 return {approach:approach?pageHref(approach.slug):sectionHref(pages,'intro'),contact:sectionHref(pages,'form'),privacy:pages.some(p=>p.slug==='privacy')?'/privacy/':undefined};
}
