import { config } from './config.js';
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('nav');
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir menú');}
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');});
nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus();}});
let toastTimer;
function notify(text){const toast=document.querySelector('#toast');toast.textContent=text;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),6500);}
const input=document.querySelector('#quoteValue'),help=document.querySelector('#quoteHelp');
document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));document.querySelector('#quoteLabel').textContent=button.dataset.mode==='pension'?'¿Cuánto recibes de pensión al mes?':'¿Qué monto de crédito te gustaría solicitar?';input.value='';help.textContent='Vista previa del cotizador. Cálculo disponible al incorporar las condiciones vigentes.';}));
document.querySelector('#quoteButton').addEventListener('click',()=>{if(!input.value||!input.checkValidity()){help.textContent='Escribe una cantidad mayor que cero para continuar.';input.focus();return;}help.textContent='El cálculo aún no está habilitado. Incorporaremos los montos y plazos oficiales antes de ofrecer una cotización.';});
const hasWhatsApp=/^[1-9]\d{7,14}$/.test(config.whatsappNumber);
const contact=document.querySelector('#whatsappLink');
if(hasWhatsApp){contact.href=`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent('Hola, quiero conocer las opciones de crédito para mi pensión.')}`;document.querySelector('#contactStatus').textContent='Abre WhatsApp para conversar con nuestro equipo.';}
document.querySelectorAll('[data-contact]').forEach(button=>button.addEventListener('click',()=>{if(hasWhatsApp)contact.click();else notify('Estamos configurando el número oficial. Esta demo todavía no recibe solicitudes.');}));
document.querySelector('.legal-button').addEventListener('click',()=>notify('El aviso de privacidad y la información comercial están pendientes de validación. Esta demo no envía ni guarda los datos del cotizador.'));
if(config.privacyUrl.startsWith('https://')){const a=document.querySelector('#privacyLink');a.href=config.privacyUrl;a.hidden=false;document.querySelector('.legal-button').hidden=true;}
