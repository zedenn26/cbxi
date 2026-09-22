import {validRequestOrigin} from './request-origin';
import 'server-only';
import {createHmac, timingSafeEqual, randomBytes} from 'node:crypto';
import {cookies} from 'next/headers';
import {createClient} from '@supabase/supabase-js';
export const cookieName='cubixtop_admin';
export function passwordMatches(value:string){const expected=process.env.ADMIN_PASSWORD; if(!expected||expected.length<12)return false;const a=Buffer.from(value),b=Buffer.from(expected);return a.length===b.length&&timingSafeEqual(a,b);}
function sign(value:string){return createHmac('sha256',process.env.ADMIN_SESSION_SECRET||process.env.ADMIN_PASSWORD||'disabled').update(value).digest('hex');}
export function createSession(){const payload=`${Date.now()+8*60*60*1000}.${randomBytes(16).toString('hex')}`;return `${payload}.${sign(payload)}`;}
export async function isAdmin(){if(!process.env.ADMIN_PASSWORD||process.env.ADMIN_PASSWORD.length<12)return false;const token=(await cookies()).get(cookieName)?.value;if(!token)return false;if(!/^\d{13}\.[a-f0-9]{32}\.[a-f0-9]{64}$/.test(token))return false;const [expires,nonce,signature]=token.split('.');if(!expires||!nonce||!signature||Number(expires)<Date.now())return false;const a=Buffer.from(signature),b=Buffer.from(sign(`${expires}.${nonce}`));return a.length===b.length&&timingSafeEqual(a,b);}
export function database(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw new Error('Database configuration is missing.');return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});}
export function sameOrigin(request:Request){return validRequestOrigin(request,process.env.NODE_ENV==='development');}
