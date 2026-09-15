import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {payment,gemReference,exitusReference,sipreReference,bancreaReference,capacityFromIncome} from '../internal/calculators.js';
import {prepareRequest,requestText} from '../site/quote-request.js';
import {requestContactLink} from '../site/contact.js';
import {reviewCase} from '../internal/review.mjs';
const f=JSON.parse(readFileSync(new URL('./calculator-fixtures.json',import.meta.url)));
const near=(a,b)=>assert(Math.abs(a-b)<.005, `${a} differs from ${b}`);
test('Contact remains disabled with missing or malformed configuration',()=>{
 const config={whatsappNumber:'525500000000',privacyUrl:'https://example.org/privacidad'};
 for(const privacyUrl of ['', 'https://', 'http://example.org', 'javascript:alert(1)', 'https://user:password@example.org']) assert.equal(requestContactLink({...config,privacyUrl},'Consulta'),null);
 for(const whatsappNumber of ['', '+52 55', 'abc']) assert.equal(requestContactLink({...config,whatsappNumber},'Consulta'),null);
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
 assert.equal(prepareRequest({...base,product:'payroll',amount:750000}).amount,750000);
 assert.throws(()=>prepareRequest({...base,product:'payroll',amount:750001}));
 assert.throws(()=>prepareRequest({...base,institution:''}));
 const income=prepareRequest({...base,mode:'pension',amount:7000});
 assert.match(requestText(income),/Ingreso neto mensual después de descuentos/);
 assert.equal(income.estimatedLoan,null);
});
