import { defineConfig } from 'astro/config';
import fs from 'node:fs';
const data=JSON.parse(fs.readFileSync(new URL('./src/data/site.json',import.meta.url),'utf8'));
export default defineConfig({ output:'static', site:data.company.website||'https://example.invalid', trailingSlash:'always', build:{format:'directory'} });
