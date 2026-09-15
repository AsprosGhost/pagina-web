import { config } from './config.js';
import { products, prepareRequest, requestText } from './quote-request.js';
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
const productSelect=document.querySelector('#creditType');
const summary=document.querySelector('#requestSummary');
const maxAmount=()=>products[productSelect.value].max;
let mode='pension';
const values={pension:'10000',amount:'50000'};
function refresh(){
 const n=Number(input.value);values[mode]=input.value;
 presets.forEach(b=>b.setAttribute('aria-pressed',String(input.value!==''&&Number(b.dataset.amount)===n)));
 document.querySelectorAll('[data-step]').forEach(b=>{b.disabled=Number(b.dataset.step)<0?n<=Number(input.min):mode==='amount'&&n>=maxAmount();});
 if(mode==='amount'){
  range.value=String(Math.min(maxAmount(),Math.max(3000,n||3000)));
  range.style.setProperty('--range-fill',`${(Number(range.value)-3000)/(maxAmount()-3000)*100}%`);
  range.setAttribute('aria-valuetext',currency.format(Number(range.value)));
 }
 summary.hidden=true;
 document.querySelector('#copyStatus').textContent='';
 help.classList.remove('selection-ready');
 help.textContent='Revisa tu selección. El monto autorizado y el pago requieren una valoración; esta demo no envía solicitudes.';
}
function setAmount(value){input.value=String(value);refresh();}
document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{
 mode=button.dataset.mode;
 document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 document.querySelector('#quoteLabel').textContent=mode==='pension'?'¿Cuánto recibes neto al mes?':'¿Qué monto de crédito te gustaría solicitar?';
 input.min=mode==='amount'?'3000':'1';
 if(mode==='amount')input.max=String(maxAmount());else input.removeAttribute('max');
 document.querySelector('#amountHint').textContent=mode==='pension'?'Escribe lo que recibes después de los descuentos de tu pensión o nómina.':'Esta cantidad es lo que te gustaría solicitar, no un monto autorizado.';
 slider.hidden=mode!=='amount';
 const examples=mode==='pension'?[5000,10000,15000]:[25000,50000,100000];
 presets.forEach((b,i)=>{b.dataset.amount=String(examples[i]);b.textContent=currency.format(examples[i]);});
 input.value=values[mode];refresh();
}));
presets.forEach(b=>b.addEventListener('click',()=>setAmount(Number(b.dataset.amount))));
document.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>{
 const next=(Number(input.value)||0)+Number(b.dataset.step)*(mode==='pension'?500:1000);
 setAmount(Math.min(mode==='amount'?maxAmount():Infinity,Math.max(Number(input.min),next)));
}));
input.addEventListener('input',refresh);
range.addEventListener('input',()=>setAmount(Number(range.value)));
document.querySelector('#institution').addEventListener('change',refresh);
productSelect.addEventListener('change',()=>{
 range.max=String(maxAmount());
 document.querySelector('#rangeMax').textContent=currency.format(maxAmount());
 if(mode==='amount') input.max=String(maxAmount());
 // Preserve a typed amount: show validation rather than silently changing the request.
 refresh();
});
document.querySelector('#quoteButton').addEventListener('click',()=>{
 try {
  if(!input.value || !input.checkValidity()) throw new Error(mode==='amount'?`Escribe un monto entre $3,000 y ${currency.format(maxAmount())}.`:'Escribe un ingreso neto mayor que cero.');
  const request=prepareRequest({product:productSelect.value,mode,amount:Number(input.value),institution:document.querySelector('#institution').value});
  const message=requestText(request);
  document.querySelector('#requestText').textContent=message;
  summary.hidden=false;
  help.textContent='Resumen preparado. Todavía no se ha enviado ninguna solicitud.';
  help.classList.add('selection-ready');
  const send=document.querySelector('#sendRequest');
  send.hidden=!(hasWhatsApp && config.privacyUrl.startsWith('https://'));
  if(!send.hidden) send.href=`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(message)}`;
 } catch(error) {
  summary.hidden=true;help.textContent=error.message;
  if(!input.value || !input.checkValidity()) input.focus();
  else document.querySelector('#institution').focus();
 }
});
document.querySelector('#copyRequest').addEventListener('click',async()=>{
 try {await navigator.clipboard.writeText(document.querySelector('#requestText').textContent);document.querySelector('#copyStatus').textContent='Resumen copiado. Puedes pegarlo al hablar con tu asesor.';}
 catch {document.querySelector('#copyStatus').textContent='No se pudo copiar automáticamente. Selecciona y copia el texto del resumen.';}
});
refresh();
const hasWhatsApp=/^[1-9]\d{7,14}$/.test(config.whatsappNumber);
const contact=document.querySelector('#whatsappLink');
if(hasWhatsApp){contact.href=`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent('Hola, quiero conocer las opciones de crédito para mi pensión.')}`;document.querySelector('#contactStatus').textContent='Abre WhatsApp para conversar con nuestro equipo.';}
document.querySelectorAll('[data-contact]').forEach(button=>button.addEventListener('click',()=>{if(hasWhatsApp)contact.click();else notify('Estamos configurando el número oficial. Esta demo todavía no recibe solicitudes.');}));
document.querySelector('.legal-button').addEventListener('click',()=>notify('El aviso de privacidad y la información comercial están pendientes de validación. Esta demo no envía ni guarda los datos del cotizador.'));
if(config.privacyUrl.startsWith('https://')){const a=document.querySelector('#privacyLink');a.href=config.privacyUrl;a.hidden=false;document.querySelector('.legal-button').hidden=true;}
