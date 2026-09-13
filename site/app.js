import { config } from './config.js';
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('nav');
function closeMenu() { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Abrir menú'); }
menu.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
});
nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeMenu(); menu.focus(); } });
if (/^[1-9]\d{7,14}$/.test(config.whatsappNumber)) {
  const link = document.querySelector('#whatsappLink');
  link.href = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent('Hola, quiero conocer las opciones de crédito para mi pensión.')}`;
  link.hidden = false;
  document.querySelector('#contactStatus').textContent = 'Abre WhatsApp para conversar con nuestro equipo. Tú decides cuándo enviar el mensaje.';
}
if (config.privacyUrl.startsWith('https://')) {
  const link = document.querySelector('#privacyLink');
  link.href = config.privacyUrl;
  link.hidden = false;
}
