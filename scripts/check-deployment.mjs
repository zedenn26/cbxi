import {createClient} from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
const required=['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY','NEXT_PUBLIC_SITE_URL','ADMIN_PASSWORD','ADMIN_SESSION_SECRET','ZOHO_SMTP_HOST','ZOHO_SMTP_USER','ZOHO_SMTP_PASSWORD','CRON_SECRET'];
const missing=required.filter(key=>!process.env[key]);for(const key of missing)console.error('MISSING:',key);
if(process.env.NEXT_PUBLIC_SITE_URL!=='https://www.cubixtop.com'){console.error('Canonical domain must be https://www.cubixtop.com');process.exitCode=1;}
for(const key of ['CRON_SECRET','ADMIN_SESSION_SECRET'])if(process.env[key]&&process.env[key].length<32){console.error('Too short:',key);process.exitCode=1;}
if(process.env.ADMIN_PASSWORD&&process.env.ADMIN_PASSWORD.length<12){console.error('Admin password must contain at least 12 characters');process.exitCode=1;}
if(missing.length){process.exitCode=1;console.error('Deployment setup incomplete; no test email was sent.');}else{
 try{const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);for(const table of ['services','enquiries','site_settings']){const {error}=await sb.from(table).select('id',{head:true,count:'exact'});if(error)throw new Error('Database access check failed: '+table);}console.log('PASS: database access');const port=Number(process.env.ZOHO_SMTP_PORT||465);const transport=nodemailer.createTransport({host:process.env.ZOHO_SMTP_HOST,port,secure:port===465,requireTLS:true,auth:{user:process.env.ZOHO_SMTP_USER,pass:process.env.ZOHO_SMTP_PASSWORD},tls:{minVersion:'TLSv1.2'},connectionTimeout:10000});await transport.verify();console.log('PASS: SMTP authentication (no message sent)');}catch(error){console.error('Provider verification failed:', ['EAUTH','ECONNECTION','ETIMEDOUT','ESOCKET'].includes(error.code)?error.code:'configuration or connectivity error');process.exitCode=1;}
}
