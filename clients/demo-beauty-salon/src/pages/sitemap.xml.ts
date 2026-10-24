import type { APIRoute } from 'astro';
import site from '../data/site.json';
const escape=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export const GET:APIRoute=({site:base})=>new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${site.pages.map(p=>`<url><loc>${escape(new URL(p.slug?`/${p.slug}/`:'/',base).href)}</loc></url>`).join('')}</urlset>`,{headers:{'Content-Type':'application/xml; charset=utf-8'}});
