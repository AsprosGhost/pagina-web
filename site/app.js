import { config } from './config.js';
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('nav');
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir menú');}
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');});
nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus();}});
let toastTimer;
function notify(text){const toast=document.querySelector('#toast');toast.textContent=text;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),6500);}
const input=document.querySelector('#quoteValue'),help=document.querySelector('#quoteHelp');
const range=document.querySelector('#quoteRange'),slider=document.querySelector('.amount-slider');
const presets=[...document.querySelectorAll('[data-amount]')];
const currency=new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:2});
let mode='pension';
const values={pension:'10000',amount:'50000'};
function refresh(){
 const n=Number(input.value);values[mode]=input.value;
 presets.forEach(b=>b.setAttribute('aria-pressed',String(input.value!==''&&Number(b.dataset.amount)===n)));
 document.querySelectorAll('[data-step]').forEach(b=>{b.disabled=Number(b.dataset.step)<0?n<=Number(input.min):mode==='amount'&&n>=750000;});
 if(mode==='amount'){
  range.value=String(Math.min(750000,Math.max(3000,n||3000)));
  range.style.setProperty('--range-fill',`${(Number(range.value)-3000)/747000*100}%`);
  range.setAttribute('aria-valuetext',currency.format(Number(range.value)));
 }
 help.classList.remove('selection-ready');
 help.textContent='Puedes explorar cantidades. La cotización real aún no está disponible.';
}
function setAmount(value){input.value=String(value);refresh();}
document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{
 mode=button.dataset.mode;
 document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 document.querySelector('#quoteLabel').textContent=mode==='pension'?'¿Cuánto recibes de pensión al mes?':'¿Qué monto de crédito te gustaría solicitar?';
 input.min=mode==='amount'?'3000':'1';
 if(mode==='amount')input.max='750000';else input.removeAttribute('max');
 slider.hidden=mode!=='amount';
 const examples=mode==='pension'?[5000,10000,15000]:[25000,50000,100000];
 presets.forEach((b,i)=>{b.dataset.amount=String(examples[i]);b.textContent=currency.format(examples[i]);});
 input.value=values[mode];refresh();
}));
presets.forEach(b=>b.addEventListener('click',()=>setAmount(Number(b.dataset.amount))));
document.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>{
 const next=(Number(input.value)||0)+Number(b.dataset.step)*(mode==='pension'?500:1000);
 setAmount(Math.min(mode==='amount'?750000:Infinity,Math.max(Number(input.min),next)));
}));
input.addEventListener('input',refresh);
range.addEventListener('input',()=>setAmount(Number(range.value)));
document.querySelector('#institution').addEventListener('change',refresh);
document.querySelector('#quoteButton').addEventListener('click',()=>{
 if(!input.value||!input.checkValidity()){
  help.textContent=mode==='amount'?'Elige un monto entre $3,000 y $750,000.':'Escribe una pensión mayor que cero.';
  input.focus();return;
 }
 const institution=document.querySelector('#institution');
 if(!institution.value){help.textContent='Selecciona tu institución para revisar los datos.';institution.focus();return;}
 help.classList.add('selection-ready');
 help.textContent=`Tu selección: ${mode==='pension'?'pensión mensual':'crédito solicitado'} de ${currency.format(Number(input.value))} · ${institution.value}. No es una cotización ni una solicitud enviada; el cálculo real sigue pendiente de habilitación.`;
});
refresh();
const hasWhatsApp=/^[1-9]\d{7,14}$/.test(config.whatsappNumber);
const contact=document.querySelector('#whatsappLink');
if(hasWhatsApp){contact.href=`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent('Hola, quiero conocer las opciones de crédito para mi pensión.')}`;document.querySelector('#contactStatus').textContent='Abre WhatsApp para conversar con nuestro equipo.';}
document.querySelectorAll('[data-contact]').forEach(button=>button.addEventListener('click',()=>{if(hasWhatsApp)contact.click();else notify('Estamos configurando el número oficial. Esta demo todavía no recibe solicitudes.');}));
document.querySelector('.legal-button').addEventListener('click',()=>notify('El aviso de privacidad y la información comercial están pendientes de validación. Esta demo no envía ni guarda los datos del cotizador.'));
if(config.privacyUrl.startsWith('https://')){const a=document.querySelector('#privacyLink');a.href=config.privacyUrl;a.hidden=false;document.querySelector('.legal-button').hidden=true;}
