import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {products,prepareRequest,requestText,validateContact} from '../site/quote-request.js';
import {isPrivacyUrl,requestContactLink} from '../site/contact.js';
import {config} from '../site/config.js';
// Exercise the real app event handlers without sending messages or opening external pages.
function setup(){
 const elements=new Map();
 function element(key){
  if(elements.has(key))return elements.get(key);
  const handlers={};const e={value:'',checked:false,hidden:false,disabled:false,textContent:'',min:'3000',max:'800000',validity:{badInput:false},dataset:{},style:{setProperty(){}},classList:{remove(){},add(){},contains(){return false;}},
   addEventListener(type,fn){handlers[type]=fn;},fire(type){handlers[type]?.({key:'',preventDefault(){}});},setAttribute(k,v){this[k]=v;},removeAttribute(k){delete this[k];},focus(){},click(){this.clicked=true;this.fire('click');},checkValidity(){return Number(this.value)>=Number(this.min)&&(!this.max||Number(this.value)<=Number(this.max));},replaceChildren(){}};
  elements.set(key,e);return e;
 }
 const radios=['payroll','direct'].map(value=>Object.assign(element(value),{value,checked:value==='payroll'}));
 const document={querySelector:element,querySelectorAll:s=>s==='[name="requestedProduct"]'?radios:[],addEventListener(){},createElement:()=>element('created')};
 const source=readFileSync(new URL('../site/app.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
 vm.runInNewContext(source,{document,config,products,prepareRequest,requestText,validateContact,isPrivacyUrl,requestContactLink,Intl,setTimeout,clearTimeout});
 element('#institution').value='IMSS';element('#clientName').value='Prueba Sitio';element('#clientPhone').value='5512345678';element('#shareConsent').checked=true;
 return {element,choose:value=>{radios.forEach(r=>r.checked=r.value===value);element(value).fire('change');}};
}
test('Form sends selected product and amount; switching products clears stale summary and excessive amount',()=>{
 const {element:e,choose}=setup();e('#quoteValue').value='800000';e('#quoteButton').click();
 assert.equal(e('#requestSummary').hidden,false);assert.match(e('#requestText').textContent,/nómina/);assert.match(e('#requestText').textContent,/800,000/);
 choose('direct');assert.equal(e('#quoteValue').value,'');assert.equal(e('#quoteRange').max,'300000');assert.equal(e('#requestSummary').hidden,true);assert.equal(e('#sendRequest').href,undefined);
 e('#quoteValue').value='300001';e('#quoteButton').click();assert.equal(e('#requestSummary').hidden,true);assert.match(e('#quoteHelp').textContent,/300,000/);
 e('#quoteValue').value='300000';e('#quoteButton').click();assert.match(e('#requestText').textContent,/domiciliado/);assert.match(e('#sendRequest').href,/525587711739/);
 e('#needsAdvice').checked=true;e('#needsAdvice').fire('change');assert.equal(e('#amountField').hidden,true);assert.equal(e('#quoteValue').value,'');e('#quoteButton').click();assert.match(e('#requestText').textContent,/asesoría sin indicar una cantidad/);assert.doesNotMatch(e('#requestText').textContent,/300,000/);
});
