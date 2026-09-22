import 'server-only';
import {NextResponse} from 'next/server';
import {createHash} from 'node:crypto';
import {database} from './admin';
import {consumeLimit} from './db-guards';
export class RequestError extends Error{constructor(message:string,public status=400){super(message);}}
export async function readJson(req:Request,maxBytes=16384){if(!req.headers.get('content-type')?.includes('application/json'))throw new RequestError('JSON required.',415);if(Number(req.headers.get('content-length')||0)>maxBytes)throw new RequestError('Request too large.',413);const reader=req.body?.getReader();if(!reader)throw new RequestError('Missing body.');let size=0;const chunks:Uint8Array[]=[];while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>maxBytes){await reader.cancel();throw new RequestError('Request too large.',413);}chunks.push(value);}try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new RequestError('Invalid JSON.');}}
export async function rateLimit(req:Request,scope:'login'|'enquiry'){
 const max=scope==='login'?10:5;
 const ip=process.env.VERCEL?req.headers.get('x-vercel-forwarded-for')?.split(',')[0]||'unknown':'local';
 const key=scope+':'+createHash('sha256').update(ip).digest('hex');
 try{const result=await consumeLimit(database(),key,max);if(!result.allowed)return NextResponse.json({error:'Too many attempts. Please try again later.'},{status:429,headers:{'Retry-After':String(result.retryAfter)}});return null;}
 catch{return NextResponse.json({error:'Temporarily unavailable. Please email info@cubixtop.com.'},{status:503});}
}
