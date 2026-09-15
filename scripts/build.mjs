import { cp, mkdir, rm } from 'node:fs/promises';
await rm('dist', { recursive: true, force: true });
await mkdir('dist');
await cp('site', 'dist', { recursive: true });
console.log('Built site into dist/');
// Preview-only frame to inspect the genuine mobile media queries without exposing a QA page in production.
if (process.env.VERCEL_ENV === 'preview') {
  const { writeFile } = await import('node:fs/promises');
  await writeFile('dist/__review.html', `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>Revisión adaptable</title><body style="margin:0;background:#dce5ed;font-family:sans-serif"><label style="display:block;padding:12px">Ancho de prueba <select id="width"><option>320</option><option selected>390</option><option>768</option><option>1024</option></select> px</label><iframe title="Demo adaptable" src="/" width="390" height="900" style="display:block;border:0;background:white"></iframe><script>document.querySelector('#width').addEventListener('change',e=>document.querySelector('iframe').width=e.target.value)</script></body></html>`);
}
