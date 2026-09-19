import { config } from './config.js';
import { products, prepareRequest, requestText, validateContact, productForInstitution } from './quote-request.js';
import { isPrivacyUrl, requestContactLink } from './contact.js';
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('nav');
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir menú');}
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');});
nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus();}});
let toastTimer;
function notify(text){const toast=document.querySelector('#toast');toast.textContent=text;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),6500);}
const input=document.querySelector('#quoteValue'),help=document.querySelector('#quoteHelp');
const institution=document.querySelector('#institution'),modeSelect=document.querySelector('#requestMode');
const nameInput=document.querySelector('#clientName'),phoneInput=document.querySelector('#clientPhone');
const summary=document.querySelector('#requestSummary');
const consent=document.querySelector('#shareConsent');
consent.addEventListener('change',refresh);
const currency=new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:2});
function refresh(){
 for(const field of [input,institution,nameInput,phoneInput,consent])field.removeAttribute('aria-invalid');
 summary.hidden=true;
 document.querySelector('#requestText').textContent='';
 document.querySelector('#copyStatus').textContent='';
 document.querySelector('#sendRequest').removeAttribute('href');
 help.classList.remove('selection-ready');
 help.textContent='El botón abre WhatsApp con tus datos. Confirma el envío dentro de WhatsApp.';
 const product=productForInstitution(institution.value),mode=modeSelect.value;
 document.querySelector('#productHint').textContent=product?`Consulta orientada a ${products[product].label.toLowerCase()}. Sujeto a revisión del asesor.`:'Tu institución nos ayuda a orientar la consulta.';
 document.querySelector('#amountField').hidden=mode==='advice';input.disabled=mode==='advice';
 input.min=mode==='capacity'?'1':'3000';
 if(mode==='amount')input.max=String(products[product||'payroll'].max);else input.removeAttribute('max');
 document.querySelector('#quoteLabel').textContent=mode==='capacity'?'Capacidad de pago mensual aproximada (opcional)':'Monto deseado (opcional)';
 document.querySelector('#amountHint').textContent=mode==='advice'?'Puedes continuar sin indicar una cantidad.':mode==='capacity'?'Es lo que podrías destinar al pago, no tu ingreso total. El asesor lo verificará.':'Puedes dejarlo vacío si prefieres orientación. No es un monto autorizado.';
}
for(const field of [input,nameInput,phoneInput])field.addEventListener('input',refresh);
institution.addEventListener('change',refresh);
modeSelect.addEventListener('change',()=>{input.value='';refresh();});
document.querySelector('#quoteButton').addEventListener('click',()=>{
 let invalid=institution;
 try {
  if(!institution.value)throw new Error('Selecciona quién paga tu pensión o nómina.');
  invalid=nameInput;
  const contactDetails=validateContact(nameInput.value,phoneInput.value);
  const product=productForInstitution(institution.value);
  invalid=input;
  if(input.validity.badInput || (!input.disabled && input.value && !input.checkValidity()))throw new Error(modeSelect.value==='capacity'?'Escribe una capacidad mayor que cero o deja el campo vacío.':`Escribe un monto entre $3,000 y ${currency.format(products[product].max)}, o deja el campo vacío.`);
  const mode=modeSelect.value==='advice'||input.value===''?'advice':modeSelect.value;
  const request=prepareRequest({product,mode,amount:mode==='advice'?null:Number(input.value),institution:institution.value});
  const message=`Nombre: ${contactDetails.name}. WhatsApp: ${contactDetails.phone}. ${requestText(request)}`;
  invalid=consent;
  if(!consent.checked)throw new Error('Autoriza compartir tus datos para continuar en WhatsApp.');
  document.querySelector('#requestText').textContent=message;
  summary.hidden=false;help.textContent='Continúa en WhatsApp y pulsa Enviar. Si no se abrió, usa el enlace del resumen.';help.classList.add('selection-ready');
  const send=document.querySelector('#sendRequest'),link=requestContactLink(config,message);
  send.hidden=!link;document.querySelector('#contactAlternative').hidden=Boolean(link)||!hasWhatsApp;
  if(link){send.href=link;send.click();}else{send.removeAttribute('href');help.textContent='El envío no está disponible. Puedes copiar el resumen y contactar al asesor.';}
 }catch(error){
  summary.hidden=true;help.textContent=error.message;
  if(error.message.includes('WhatsApp de México'))invalid=phoneInput;
  invalid.setAttribute('aria-invalid','true');invalid.focus();
 }
});
// Enter follows the same validated, consented WhatsApp flow as the button.
for(const field of [nameInput,phoneInput,input])field.addEventListener('keydown',event=>{
 if(event.key==='Enter' && !event.isComposing){event.preventDefault();document.querySelector('#quoteButton').click();}
});
document.querySelector('#copyRequest').addEventListener('click',async()=>{
 try {await navigator.clipboard.writeText(document.querySelector('#requestText').textContent);document.querySelector('#copyStatus').textContent='Resumen copiado. Puedes pegarlo al hablar con tu asesor.';}
 catch {document.querySelector('#copyStatus').textContent='No se pudo copiar automáticamente. Selecciona y copia el texto del resumen.';}
});
refresh();
const hasWhatsApp=/^[1-9]\d{7,14}$/.test(config.whatsappNumber);
const contact=document.querySelector('#whatsappLink');
if(hasWhatsApp){contact.href=`https://wa.me/${config.whatsappNumber}`;document.querySelector('#contactStatus').textContent='Abre WhatsApp para conversar con nuestro equipo.';}
document.querySelectorAll('[data-contact]').forEach(button=>button.addEventListener('click',()=>{if(hasWhatsApp)contact.click();else notify('Los números oficiales están publicados al pie. El envío desde esta demo todavía no está habilitado.');}));
document.querySelector('.legal-button').addEventListener('click',()=>notify('El aviso de privacidad y la información comercial están pendientes de validación. El formulario abre WhatsApp con tu consulta cuando autorizas compartirla.'));
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
 const amount=document.createElement('strong');amount.textContent=payroll?'$3,000 hasta $800,000':'$3,000 hasta $300,000';
 description.replaceChildren('Desde ',amount,payroll?', con descuentos vía nómina, sujeto a evaluación y autorización. Consulta también estas opciones:':', con cobro directo por la financiera. Consulta estas opciones:');
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
 institution.focus({preventScroll:true});
});
