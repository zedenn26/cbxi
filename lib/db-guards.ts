import type {SupabaseClient} from '@supabase/supabase-js';

// Compare-and-swap updates make these guards safe across Vercel instances.
// The existing unique(setting_group, setting_key) constraint handles first use.
export async function consumeLimit(db:SupabaseClient,key:string,max:number,windowMs=900000){
 for(let attempt=0;attempt<30;attempt++){
  const {data,error}=await db.from('site_settings').select('setting_value').eq('setting_group','request_limits').eq('setting_key',key).maybeSingle();
  if(error)throw new Error('Rate limit store unavailable');
  const now=Date.now();const previous=data?.setting_value;
  if(previous&&previous.until>now&&previous.count>=max)return {allowed:false,retryAfter:Math.max(1,Math.ceil((previous.until-now)/1000))};
  const next={count:previous&&previous.until>now?previous.count+1:1,until:previous&&previous.until>now?previous.until:now+windowMs,version:crypto.randomUUID()};
  if(!data){const result=await db.from('site_settings').insert({setting_group:'request_limits',setting_key:key,setting_value:next,updated_at:new Date().toISOString()});if(!result.error)return {allowed:true,retryAfter:0};if(result.error.code!=='23505')throw new Error('Rate limit store unavailable');}
  else{const result=await db.from('site_settings').update({setting_value:next,updated_at:new Date().toISOString()}).eq('setting_group','request_limits').eq('setting_key',key).eq('setting_value->>version',previous.version).select('id');if(result.error)throw new Error('Rate limit store unavailable');if(result.data?.length)return {allowed:true,retryAfter:0};}
 }
 throw new Error('Rate limit store busy');
}

export async function claimMail(db:SupabaseClient,reference:string){
 const {data,error}=await db.from('site_settings').select('setting_value').eq('setting_group','enquiry_mail').eq('setting_key',reference).maybeSingle();
 if(error)throw new Error('Mail queue unavailable');if(!data)return null;
 const item=data.setting_value;if(item.status==='sent')return {sent:true as const};
 if(item.lock_until&&item.lock_until>Date.now())return null;
 const token=crypto.randomUUID();const claimed={...item,lock_version:token,lock_until:Date.now()+120000};
 let query=db.from('site_settings').update({setting_value:claimed,updated_at:new Date().toISOString()}).eq('setting_group','enquiry_mail').eq('setting_key',reference);
 query=item.lock_version?query.eq('setting_value->>lock_version',item.lock_version):query.is('setting_value->>lock_version',null);
 const result=await query.select('id');if(result.error)throw new Error('Mail lock unavailable');if(!result.data?.length)return null;
 return {sent:false as const,token,item:claimed};
}
