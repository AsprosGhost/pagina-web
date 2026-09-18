import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {payment,gemReference,exitusReference,sipreReference,bancreaReference,capacityFromIncome,sipreCapacityReference} from '../internal/calculators.js';
import {prepareRequest,requestText} from '../site/quote-request.js';
import {requestContactLink} from '../site/contact.js';
import {reviewCase} from '../internal/review.mjs';
const f=JSON.parse(readFileSync(new URL('./calculator-fixtures.json',import.meta.url)));
const near=(a,b)=>assert(Math.abs(a-b)<.005, `${a} differs from ${b}`);
test('Contact remains disabled with missing or malformed configuration',()=>{
 const config={requestSharingEnabled:true,whatsappNumber:'525500000000',privacyUrl:'https://example.org/privacidad'};
 for(const privacyUrl of ['', 'https://', 'http://example.org', 'javascript:alert(1)', 'https://user:password@example.org']) assert.equal(requestContactLink({...config,privacyUrl},'Consulta'),null);
 for(const whatsappNumber of ['', '+52 55', 'abc']) assert.equal(requestContactLink({...config,whatsappNumber},'Consulta'),null);
 assert.equal(requestContactLink({...config,requestSharingEnabled:false},'Consulta'),null);
 assert.equal(requestContactLink({...config,requestSharingEnabled:undefined},'Consulta'),null);
 const message='Ingreso $7,000 & consulta con acentos: pensión';
 const link=new URL(requestContactLink(config,message));
 assert.equal(link.hostname,'wa.me');assert.equal(link.searchParams.get('text'),message);
});
test('Internal review requires explicit calculator and does not grant public eligibility',()=>{
 assert.throws(()=>reviewCase({principal:50000,periods:12}));
 assert.throws(()=>reviewCase({calculator:'bancrea',principal:50000,periods:12}));
 for(const calculator of ['gem','exitus','sipre','bancrea']){
  const r=reviewCase({calculator,principal:50000,periods:24,annual:.352408});
  assert.equal(r.publicQuoteEnabled,false);assert.equal(r.status,'revision-tecnica');
 }
});
const suggestions=JSON.parse(readFileSync(new URL('./suggestion-fixtures.json',import.meta.url)));
test('Sixteen additional stored scenarios match GEM and SIPRE suggestion sheets',()=>{
 for(const c of suggestions){
  const actual=c.calculator==='gem'?gemReference(c.principal,c.periods).regularPayment:sipreReference(c.principal,c.periods).installment;
  near(actual,c.installment);
 }
});
test('Discounted payments recover principal across amounts, terms and rate boundaries',()=>{
 // Independent cash-flow identity: sum discounted payments, without reusing PMT.
 const pv=(paid,rate,n)=>Array.from({length:n},(_,i)=>paid/(1+rate)**(i+1)).reduce((a,b)=>a+b,0);
 for(const principal of [3000,5000,74999.99,75000,99999.99,100000,150000,300000,600000,750000]){
  for(const months of [12,18,24,30,36,42,48,54,60]){
   const r=sipreReference(principal,months);
   near(pv(r.installment,r.annual*1.16/12,months),principal);
  }
  for(const months of [1,12,36,48]) for(const frequency of ['monthly','fortnightly']){
   const r=exitusReference(principal,months,frequency),factor=frequency==='monthly'?1:2;
   near(pv(r.base,.07779542/factor,months*factor),principal);
   near(r.net+r.commission+r.tax,principal);
   near(r.schedule.reduce((s,row)=>s+row.capital,0),principal);
  }
 }
});
test('GEM rounded schedules reconcile principal and payment components at all supported terms',()=>{
 for(const principal of [3000,5000,67000,99999.99,750000]) for(const term of [24,36,48,60,72,84,96]){
  const r=gemReference(principal,term);
  near(r.schedule.reduce((s,row)=>s+row.capital,0),principal);
  assert.equal(r.schedule.length,term);assert.equal(r.schedule.at(-1).balance,0);
  assert(r.schedule.every(row=>row.balance>=0 && row.capital>=0));
  for(const row of r.schedule) near(row.payment,row.capital+row.interest+row.tax);
 }
});
test('GEM source example reconciles regular, final payment and total',()=>{
 const c=f.gem.cells,r=gemReference(c.F6,c.F8);
 near(r.regularPayment,c.K17);near(r.total,c.F15);near(r.schedule.at(-1).payment,c.D113);
 assert.equal(r.schedule.at(-1).balance,0);
});
test('Exitus source example matches both independently calculated frequencies',()=>{
 const c=f.exitus.cells,m=exitusReference(c.B5,c.B9),q=exitusReference(c.B5,c.B9,'fortnightly');
 near(m.net,c.B17);near(m.base,c.B18);near(m.installment,c.B19);near(q.base,c.B20);near(q.installment,c.B21);
 assert(Math.abs(q.installment-m.installment/2)>1);
});
test('Corrected Exitus schedules stop at selected term and repay only the principal',()=>{
 for(const months of [1,12,36,48]) for(const frequency of ['monthly','fortnightly']){
  const r=exitusReference(30000,months,frequency),rows=r.schedule;
  assert.equal(rows.length,months*(frequency==='monthly'?1:2));
  assert.equal(rows.at(-1).balance,0);assert(rows.every(r=>r.balance>=0));
  near(rows.reduce((s,r)=>s+r.capital,0),30000);
 }
});
test('SIPRE amount/term tier reproduces stored payment without claiming eligibility',()=>{
 const c=f.sipre.cells,r=sipreReference(c.F5,c.F7*12);near(r.installment,c.F10);near(r.total,c.F13);
 assert.equal(sipreReference(99999,36).annual,.3);
 assert.equal(sipreReference(100000,36).annual,.225);
 assert.equal(sipreReference(100000,30).annual,.305);
 assert.throws(()=>sipreReference(100000,96));
});
test('Bancrea uses the rate actually referenced by payment formula',()=>{
 const c=f.bancrea.cells;near(bancreaReference(c.E4,c.E5,c.E7*12),c.I4);
});
test('Invalid inputs and unsupported periods fail; zero interest amortizes correctly',()=>{
 near(payment(12000,0,12),1000);
 for(const n of [0,-1,NaN,Infinity,'30000']) assert.throws(()=>payment(n,.02,12));
 assert.throws(()=>payment(1000,-.1,12));assert.throws(()=>payment(1000,.1,1.5));
 assert.throws(()=>gemReference(1000,120));assert.throws(()=>capacityFromIncome(7000));
 for(const annual of ['.352408',null,undefined,NaN,Infinity,-1]) assert.throws(()=>bancreaReference(50000,annual,12));
});
test('Public request has product-specific limits but never invents loan or installment',()=>{
 const base={product:'direct',mode:'amount',amount:300000,institution:'IMSS'};
 const r=prepareRequest(base);assert.equal(r.estimatedLoan,null);assert.equal(r.installment,null);
 assert.throws(()=>prepareRequest({...base,amount:300001}));
 assert.throws(()=>prepareRequest({...base,amount:2999}));
 assert.equal(prepareRequest({...base,product:'payroll',amount:800000}).amount,800000);
 assert.throws(()=>prepareRequest({...base,product:'payroll',amount:800001}));
 assert.throws(()=>prepareRequest({...base,institution:''}));
 const income=prepareRequest({...base,mode:'pension',amount:7000});
 assert.match(requestText(income),/Ingreso neto mensual después de descuentos/);
 assert.equal(income.estimatedLoan,null);
});

test('Contact preparation normalizes Mexican numbers and rejects missing or malformed data', async () => {
 const {validateContact}=await import('../site/quote-request.js');
 assert.deepEqual(validateContact('  José   Pérez  ', '+52 55 1234 5678'), {name:'José Pérez',phone:'5512345678'});
 for(const [name,phone] of [['','5512345678'],['123','5512345678'],['Ana','55123'],['Ana','+1 5551234567'],['Ana','5512345678abc']]) assert.throws(()=>validateContact(name,phone));
});

test('Declared capacity and unknown capacity remain distinct from requested credit', async () => {
 const {prepareRequest,requestText}=await import('../site/quote-request.js');
 const base={product:'payroll',institution:'IMSS'};
 const capacity=prepareRequest({...base,mode:'capacity',amount:7000});
 assert.match(requestText(capacity),/Capacidad de pago mensual aproximada declarada/);
 assert.equal(capacity.estimatedLoan,null);
 assert.equal(capacity.installment,null);
 const unknown=prepareRequest({...base,mode:'advice',amount:7000});
 assert.equal(unknown.amount,null);
 assert.match(requestText(unknown),/Necesito asesoría sin indicar/);
 assert(!requestText(unknown).includes('7,000'));
 for(const amount of [0,-1,NaN,null])assert.throws(()=>prepareRequest({...base,mode:'capacity',amount}));
 assert.throws(()=>prepareRequest({...base,mode:'amount',amount:800001}));
});

test('Declared capacity reproduces all nine Alicia screenshot suggestions',()=>{
 const cases=[[12,69600,6990.77],[18,96300,6999.87],[24,118500,6994.61],[30,138100,6998.79],[36,173500,6999.67],[42,191400,6997.32],[48,207200,6997.89],[54,221100,6998.75],[60,233300,6998.93]];
 for(const [months,principal,installment] of cases){
  const r=sipreCapacityReference(7000,months);
  assert.equal(r.principal,principal);near(r.installment,installment);assert.equal(r.withinDeclaredCapacity,true);
 }
});
test('Capacity inverse matches stored sheet and respects source bounds',()=>{
 for(const c of suggestions.filter(c=>c.calculator==='sipre')){
  const r=sipreCapacityReference(3000,c.periods);assert.equal(r.principal,c.principal);near(r.installment,c.installment);
 }
 assert.deepEqual(sipreCapacityReference(7000.99,60),sipreCapacityReference(7000,60));
 assert.equal(sipreCapacityReference(100000,60).principal,700000);
 assert.equal(sipreCapacityReference(100,60).status,'no-reference');
 for(const capacity of [0,-1,NaN,Infinity,'7000']) assert.throws(()=>sipreCapacityReference(capacity,60));
 assert.throws(()=>sipreCapacityReference(7000,61));
 const r=reviewCase({calculator:'sipre',capacity:7000,periods:60});
 assert.equal(r.publicQuoteEnabled,false);assert.equal(r.inputs.capacitySource,'declared-monthly-unverified');
 assert.throws(()=>reviewCase({calculator:'exitus',capacity:7000,periods:36}));
 assert.throws(()=>reviewCase({calculator:'sipre',principal:50000,capacity:7000,periods:60}));
});

test('Pension institution routes advisor review independently of the visible agreements', async()=>{
 const {productForInstitution}=await import('../site/quote-request.js');
 assert.equal(productForInstitution(''),null);
 for(const institution of ['IMSS','Gobierno del Estado de México']) assert.equal(productForInstitution(institution),'payroll');
 for(const institution of ['ISSSTE','PEMEX','CFE','SEP','Otra institución']) assert.equal(productForInstitution(institution),'direct');
});
