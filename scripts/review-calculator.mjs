import {parseArgs} from 'node:util';
import {reviewCase} from '../internal/review.mjs';
try {
 const {values}=parseArgs({options:{calculator:{type:'string'},principal:{type:'string'},capacity:{type:'string'},periods:{type:'string'},frequency:{type:'string'},annual:{type:'string'},schedule:{type:'boolean',default:false}}});
 const reviewed=reviewCase({calculator:values.calculator,principal:values.principal===undefined?undefined:Number(values.principal),capacity:values.capacity===undefined?undefined:Number(values.capacity),periods:Number(values.periods),frequency:values.frequency,annual:values.annual===undefined?undefined:Number(values.annual)});
 if(!values.schedule && reviewed.result.schedule){
  const rows=reviewed.result.schedule;
  reviewed.result.scheduleSummary={payments:rows.length,first:rows[0],last:rows.at(-1)};
  delete reviewed.result.schedule;
 }
 console.log(JSON.stringify(reviewed,null,2));
} catch(error){console.error(error.message);process.exitCode=1;}
