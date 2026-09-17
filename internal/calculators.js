// Engineering reproductions of the supplied workbooks. Never shipped in site/.
// No eligibility, approval or income-to-payment-capacity rules are implied.
export const roundMoney = n => Math.round((n + Number.EPSILON) * 100) / 100;
function positive(n, name) {
  if (typeof n !== 'number' || !Number.isFinite(n) || n <= 0) throw new RangeError(name);
}
export function payment(principal, rate, periods) {
  positive(principal, 'principal'); positive(periods, 'periods');
  if (!Number.isInteger(periods) || periods > 1200 || !Number.isFinite(rate) || rate < 0) throw new RangeError('rate/periods');
  return rate === 0 ? principal / periods : principal * rate / -Math.expm1(-periods * Math.log1p(rate));
}
export function amortize(principal, rate, periods, fee = 0) {
  const base = payment(principal, rate, periods);
  if (!Number.isFinite(fee) || fee < 0) throw new RangeError('fee');
  let balance = principal;
  return Array.from({length: periods}, (_, i) => {
    const interest = balance * rate;
    const capital = i === periods - 1 ? balance : Math.min(balance, base - interest);
    balance = Math.max(0, balance - capital);
    return {period: i + 1, capital, interest, fee, payment: capital + interest + fee, balance};
  });
}
export function gemReference(principal, fortnights) {
  if (![24,36,48,60,72,84,96].includes(fortnights)) throw new RangeError('unsupported term');
  const annual = .31, vat = .16;
  const regularPayment = roundMoney(payment(principal, annual * (1 + vat) / 24, fortnights));
  let balance = principal;
  const schedule = Array.from({length: fortnights}, (_, i) => {
    const interest = roundMoney(balance * annual / 24), tax = roundMoney(interest * vat);
    const capital = i === fortnights - 1 ? balance : regularPayment - interest - tax;
    const paid = roundMoney(capital + interest + tax);
    balance = roundMoney(balance - capital);
    return {period: i + 1, capital, interest, tax, payment: paid, balance};
  });
  return {regularPayment, schedule, total: roundMoney(schedule.reduce((a,r) => a+r.payment,0))};
}
export function exitusReference(principal, months, frequency = 'monthly') {
  if (!Number.isInteger(months) || months < 1 || months > 48) throw new RangeError('reference table supports at most 48 months; not an approved product term');
  if (!['monthly','fortnightly'].includes(frequency)) throw new RangeError('frequency');
  const factor = frequency === 'monthly' ? 1 : 2;
  // B11 (adjusted rate), NOT B6 (promotional label). B7, B8, B10 preserved.
  const rate = .07779542 / factor, periods = months * factor, fee = 123.31 / factor;
  const base = payment(principal, rate, periods);
  const commission = principal * .05, tax = commission * .16;
  return {base, installment: base + fee, net: principal - commission - tax,
    commission, tax, schedule: amortize(principal, rate, periods, fee)};
}
export function sipreReference(principal, months) {
  const terms = [12,18,24,30,36,42,48,54,60];
  const index = terms.indexOf(months);
  if (index < 0) throw new RangeError('unsupported term');
  const rates = principal >= 100000 ? [.31,.31,.31,.305,.225,.225,.225,.225,.225] : [.31,.31,.31,.305,.3,.28,.26,.25,.25];
  const annual = rates[index], rate = annual * 1.16 / 12;
  const installment = payment(principal, rate, months);
  return {annual, installment, total: roundMoney(installment) * months};
}
export function bancreaReference(principal, annual, months) {
  // Calculadora!E5 and local defined name Pago_Mensual use annual/12, not E12.
  if (typeof annual !== 'number' || !Number.isFinite(annual) || annual < 0) throw new RangeError('annual rate');
  return payment(principal, annual / 12, months);
}
export function capacityFromIncome() {
  throw new Error('Pending: confirmed rule converting net income to payment capacity');
}

// SIPRE Sugerencias: O4, M_12...M_60, P:R and S -> D.
// Capacity is declared monthly payment capacity, never income.
export function sipreCapacityReference(capacity, months) {
  positive(capacity, 'declared monthly capacity');
  const normalizedCapacity = Math.floor(capacity);
  // M_* thresholds use the principal tiers in D33:D39.
  const thresholds = [5000,75000,100000,150000,200000,250000,500000];
  let selectedAnnual;
  for (const principal of thresholds) {
    const candidate = sipreReference(principal, months);
    if (candidate.installment <= normalizedCapacity) selectedAnnual = candidate.annual;
  }
  if (selectedAnnual === undefined) return {status:'no-reference',normalizedCapacity,principal:null,installment:null};
  const factor = 1 / payment(1, selectedAnnual * 1.16 / 12, months);
  const principal = Math.min(Math.floor(normalizedCapacity * factor / 100) * 100,700000);
  const revised = sipreReference(principal,months);
  return {status:'reference-only',normalizedCapacity,principal,selectedAnnual,...revised,
    withinDeclaredCapacity:revised.installment <= normalizedCapacity};
}
