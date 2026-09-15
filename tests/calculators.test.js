import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {payment,gemReference,exitusReference,sipreReference,bancreaReference,capacityFromIncome} from '../internal/calculators.js';
import {prepareRequest,requestText} from '../site/quote-request.js';
const f=JSON.parse(readFileSync(new URL('./calculator-fixtures.json',import.meta.url)));
const near=(a,b)=>assert(Math.abs(a-b)<.005, `${a} differs from ${b}`);
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
