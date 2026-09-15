// Explicit calculator selection for engineering review; never routes a real customer.
import {gemReference,exitusReference,sipreReference,bancreaReference} from './calculators.js';
export function reviewCase({calculator,principal,periods,frequency='monthly',annual}) {
 let result,unit;
 switch(calculator){
  case 'gem': result=gemReference(principal,periods);unit='quincenas';break;
  case 'exitus': result=exitusReference(principal,periods,frequency);unit='meses';break;
  case 'sipre': result=sipreReference(principal,periods);unit='meses';break;
  case 'bancrea': result={installment:bancreaReference(principal,annual,periods)};unit='meses';break;
  default:throw new Error('Selecciona gem, exitus, sipre o bancrea.');
 }
 return {status:'revision-tecnica',publicQuoteEnabled:false,
  note:'Reproducción de fórmulas. No valida elegibilidad, vigencia ni capacidad de pago.',
  inputs:{calculator,principal,periods,unit,...(calculator==='exitus'?{frequency}:{}),...(calculator==='bancrea'?{annual}:{})},result};
}
