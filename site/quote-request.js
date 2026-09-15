// Commercial ranges supplied by Alicia. These are request ranges, not eligibility.
export const products = Object.freeze({
  payroll: Object.freeze({label:'Crédito de nómina', min:3000, max:750000}),
  direct: Object.freeze({label:'Crédito domiciliado', min:3000, max:300000})
});
export function prepareRequest({product, mode, amount, institution}) {
  if (!Object.hasOwn(products, product)) throw new Error('Selecciona el tipo de crédito.');
  if (!['pension','amount'].includes(mode)) throw new Error('Selecciona cómo quieres consultar.');
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) throw new Error('Escribe una cantidad mayor que cero.');
  const selected = products[product];
  if (mode === 'amount' && (amount < selected.min || amount > selected.max)) throw new Error(`El monto solicitado debe estar entre $3,000 y $${selected.max.toLocaleString('es-MX')}.`);
  if (!institution?.trim()) throw new Error('Selecciona tu institución.');
  return {product:selected.label, mode, amount, institution:institution.trim(), status:'selection-only', estimatedLoan:null, installment:null};
}
export function requestText(request) {
  const money = new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(request.amount);
  return `Me interesa un ${request.product.toLowerCase()}. Institución: ${request.institution}. ${request.mode === 'pension' ? 'Ingreso neto mensual después de descuentos' : 'Monto que me gustaría solicitar'}: ${money}. Quisiera recibir asesoría sobre los requisitos y plazos disponibles. Esta selección no es una cotización ni una aprobación.`;
}
