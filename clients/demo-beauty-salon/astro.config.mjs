import { defineConfig } from 'astro/config';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const data=JSON.parse(fs.readFileSync(new URL('./src/data/site.json',import.meta.url),'utf8'));
export default defineConfig({ output:'static', vite:{cacheDir:fileURLToPath(new URL('./.astro/vite',import.meta.url))}, site:data.company.website||'https://example.invalid', trailingSlash:'always', build:{format:'directory'} });
