import { config } from './config.js';
import { products, prepareRequest, requestText, validateContact } from './quote-request.js';
import { isPrivacyUrl, requestContactLink } from './contact.js';
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
let mode='amount';
const nameInput=document.querySelector('#clientName'),phoneInput=document.querySelector('#clientPhone');
nameInput.addEventListener('input',refresh);phoneInput.addEventListener('input',refresh);
const values={capacity:'',amount:'50000',advice:''};
function refresh(){
 input.removeAttribute('aria-invalid');
 nameInput.removeAttribute('aria-invalid');phoneInput.removeAttribute('aria-invalid');
 document.querySelector('#institution').removeAttribute('aria-invalid');
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
 document.querySelector('.amount-playground').hidden=mode==='advice';
 document.querySelector('#capacityAdvice').hidden=mode!=='advice';
 input.disabled=mode==='advice';
 input.required=mode!=='advice';
 document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 document.querySelector('#quoteLabel').textContent=mode==='capacity'?'¿Cuál es tu capacidad de pago mensual aproximada?':'¿Qué monto de crédito te gustaría solicitar?';
 input.min=mode==='amount'?'3000':'1';
 if(mode==='amount')input.max=String(maxAmount());else input.removeAttribute('max');
 document.querySelector('#amountHint').textContent=mode==='capacity'?'Indica tu capacidad disponible aproximada, no tu ingreso total. El asesor la verificará con tus documentos.':'Esta cantidad es lo que te gustaría solicitar, no un monto autorizado.';
 slider.hidden=mode!=='amount';
 presets[0].parentElement.hidden=mode!=='amount';
 const examples=mode==='capacity'?[5000,10000,15000]:[25000,50000,100000];
 presets.forEach((b,i)=>{b.dataset.amount=String(examples[i]);b.textContent=currency.format(examples[i]);});
 input.value=values[mode];refresh();
}));
presets.forEach(b=>b.addEventListener('click',()=>setAmount(Number(b.dataset.amount))));
document.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>{
 const next=(Number(input.value)||0)+Number(b.dataset.step)*(mode==='capacity'?500:1000);
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
  if(mode!=='advice' && (!input.value || !input.checkValidity())) throw new Error(mode==='amount'?`Escribe un monto entre $3,000 y ${currency.format(maxAmount())}.`:'Escribe una capacidad de pago mayor que cero o elige asesoría.');
  const request=prepareRequest({product:productSelect.value,mode,amount:mode==='advice'?null:Number(input.value),institution:document.querySelector('#institution').value});
  const contactDetails=validateContact(nameInput.value,phoneInput.value);
  const message=`Nombre: ${contactDetails.name}. WhatsApp: ${contactDetails.phone}. ${requestText(request)}`;
  document.querySelector('#requestText').textContent=message;
  summary.hidden=false;
  help.textContent='Resumen preparado. Todavía no se ha enviado ninguna solicitud.';
  help.classList.add('selection-ready');
  const send=document.querySelector('#sendRequest');
  const link=requestContactLink(config,message);
  send.hidden=!link;
  document.querySelector('#contactAlternative').hidden=Boolean(link)||!hasWhatsApp;
  if(link) send.href=link;else send.removeAttribute('href');
 } catch(error) {
  summary.hidden=true;help.textContent=error.message;
  let invalid=(mode!=='advice' && (!input.value || !input.checkValidity()))?input:document.querySelector('#institution');
  if(error.message.includes('tu nombre'))invalid=nameInput;
  if(error.message.includes('WhatsApp de México'))invalid=phoneInput;
  invalid.setAttribute('aria-invalid','true');invalid.focus();
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
document.querySelectorAll('[data-contact]').forEach(button=>button.addEventListener('click',()=>{if(hasWhatsApp)contact.click();else notify('Los números oficiales están publicados al pie. El envío desde esta demo todavía no está habilitado.');}));
document.querySelector('.legal-button').addEventListener('click',()=>notify('El aviso de privacidad y la información comercial están pendientes de validación. Esta demo no envía ni guarda los datos del cotizador.'));
if(isPrivacyUrl(config.privacyUrl)){
 document.querySelectorAll('#privacyLink, #formPrivacyLink').forEach(a=>{a.href=config.privacyUrl;a.hidden=false;});
 document.querySelector('.legal-button').hidden=true;
}

const productTabs=[...document.querySelectorAll('[data-product-tab]')];
let exploredProduct='payroll';
function showProduct(product){
 exploredProduct=product;
 const payroll=product==='payroll';
 productTabs.forEach(tab=>{const selected=tab.dataset.productTab===product;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;});
 document.querySelector('#product-panel').setAttribute('aria-labelledby',`tab-${product}`);
 document.querySelector('#product-title').textContent=payroll?'Crédito nuevo':'Crédito domiciliado';
 const description=document.querySelector('#product-description');
 const amount=document.createElement('strong');amount.textContent=payroll?'$3,000 hasta $750,000':'$3,000 hasta $300,000';
 description.replaceChildren('Desde ',amount,payroll?', con descuentos vía nómina. Consulta también estas opciones:':', con cobro directo por la financiera. Consulta estas opciones:');
 document.querySelector('#product-options').replaceChildren(...(payroll?['Renovación','Compra de crédito','Crédito adicional']:['Crédito nuevo','Segundo crédito','Renovación']).map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
}
productTabs.forEach((tab,index)=>{
 tab.addEventListener('click',()=>showProduct(tab.dataset.productTab));
 tab.addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();
  const next=event.key==='Home'?0:event.key==='End'?productTabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+productTabs.length)%productTabs.length;
  showProduct(productTabs[next].dataset.productTab);productTabs[next].focus();
 });
});
document.querySelector('#consult-product').addEventListener('click',()=>{
 productSelect.value=exploredProduct;productSelect.dispatchEvent(new Event('change'));
 (mode==='advice'?nameInput:input).focus({preventScroll:true});
});
