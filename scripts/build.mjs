import { cp, mkdir, rm } from 'node:fs/promises';
await rm('dist', { recursive: true, force: true });
await mkdir('dist');
await cp('site', 'dist', { recursive: true });
console.log('Built site into dist/');
