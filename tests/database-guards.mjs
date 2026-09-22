import {createClient} from '@supabase/supabase-js';
import assert from 'node:assert/strict';
import {consumeLimit,claimMail} from '../lib/db-guards.ts';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
const key='test:'+crypto.randomUUID(),reference='test-mail:'+crypto.randomUUID();
try{
 const results=await Promise.all(Array.from({length:12},()=>consumeLimit(db,key,5)));
 assert.equal(results.filter(r=>r.allowed).length,5);console.log('PASS: concurrent requests admit exactly five, reject seven');
 assert.equal((await consumeLimit(db,key,5)).allowed,false);console.log('PASS: limits persist across calls');
 const {data:row}=await db.from('site_settings').select('setting_value').eq('setting_group','request_limits').eq('setting_key',key).single();
 await db.from('site_settings').update({setting_value:{...row.setting_value,until:Date.now()-1}}).eq('setting_group','request_limits').eq('setting_key',key);
 assert.equal((await consumeLimit(db,key,5)).allowed,true);console.log('PASS: expired limit windows reset');
 const {error}=await db.from('site_settings').insert({setting_group:'enquiry_mail',setting_key:reference,setting_value:{status:'pending',attempts:0}});if(error)throw error;
 const claims=await Promise.all(Array.from({length:12},()=>claimMail(db,reference)));assert.equal(claims.filter(Boolean).length,1);console.log('PASS: one concurrent mail sender wins the database lock');
 const first=claims.find(Boolean);assert.equal(await claimMail(db,reference),null);
 await db.from('site_settings').update({setting_value:{...first.item,lock_until:Date.now()-1}}).eq('setting_group','enquiry_mail').eq('setting_key',reference);
 const reclaimed=await claimMail(db,reference);assert.ok(reclaimed);assert.notEqual(reclaimed.token,first.token);console.log('PASS: expired mail lock can be recovered');
 await db.from('site_settings').update({setting_value:{...reclaimed.item,status:'sent'}}).eq('setting_group','enquiry_mail').eq('setting_key',reference);
 assert.equal((await claimMail(db,reference)).sent,true);console.log('PASS: delivered mail cannot be claimed for re-send');
}finally{await db.from('site_settings').delete().eq('setting_group','request_limits').eq('setting_key',key);await db.from('site_settings').delete().eq('setting_group','enquiry_mail').eq('setting_key',reference);console.log('Removed test-only guard records; no email sent.');}
