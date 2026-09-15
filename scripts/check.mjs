import assert from 'node:assert/strict';
import { readFile, access, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { config } from '../site/config.js';
const html=await readFile('site/index.html','utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,ids.length,'Duplicate IDs');
for(const [,url] of html.matchAll(/(?:src|href)="([^"]+)"/g)){
 if(url.startsWith('#')) assert(ids.includes(url.slice(1)),`Broken anchor: ${url}`);
 else if(!/^(https?:|data:)/.test(url)) await access(resolve('site',url));
}
for(const file of await readdir('site')) if(file.endsWith('.js')) execFileSync(process.execPath,['--check',`site/${file}`]);
assert(!/multiva|bancrea|modalidad\s*40|24 horas/i.test(html),'Unapproved content');
assert(!html.includes('<form'),'Contact collection must not be added without a verified endpoint and privacy notice');
assert(config.whatsappNumber===''||/^[1-9]\d{7,14}$/.test(config.whatsappNumber),'Invalid WhatsApp number');
assert(config.privacyUrl===''||config.privacyUrl.startsWith('https://'),'Invalid privacy URL');
assert(html.includes('noindex,nofollow'),'Preview must not be indexed');
console.log('Checks passed: assets, anchors, scripts, preview content and contact configuration.');
execFileSync(process.execPath,['--test','tests/calculators.test.js'],{stdio:'inherit'});
