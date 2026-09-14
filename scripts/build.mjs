import { cp, mkdir, rm } from 'node:fs/promises';
await rm('dist', { recursive: true, force: true });
await mkdir('dist');
await cp('site', 'dist', { recursive: true });
console.log('Built site into dist/');
// Preview-only frame to inspect the genuine mobile media queries without exposing a QA page in production.
if (process.env.VERCEL_ENV === 'preview') {
  const { writeFile } = await import('node:fs/promises');
  await writeFile('dist/__review.html', '<!doctype html><html lang="es"><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>Revisión móvil</title><body style="margin:0;background:#dce5ed;font-family:sans-serif"><p>Vista móvil de 390 px</p><iframe title="Demo móvil" src="/" width="390" height="844" style="border:0;background:white"></iframe></body></html>');
}
