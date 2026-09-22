import 'server-only';
import nodemailer from 'nodemailer';
import {database} from './admin';
import {claimMail} from './db-guards';
export type MailEnquiry={reference_number:string,name:string,email:string,phone:string,message:string,service_label:string};
export function mailConfigured(){return Boolean(process.env.ZOHO_SMTP_HOST&&process.env.ZOHO_SMTP_USER&&process.env.ZOHO_SMTP_PASSWORD);}
export function mailTransport(){if(!mailConfigured())throw new Error('Mail is not configured');const port=Number(process.env.ZOHO_SMTP_PORT||465);if(![465,587].includes(port))throw new Error('Invalid SMTP port');return nodemailer.createTransport({host:process.env.ZOHO_SMTP_HOST,port,secure:port===465,requireTLS:true,auth:{user:process.env.ZOHO_SMTP_USER,pass:process.env.ZOHO_SMTP_PASSWORD},tls:{minVersion:'TLSv1.2',rejectUnauthorized:true},connectionTimeout:10000,greetingTimeout:10000,socketTimeout:15000,disableFileAccess:true,disableUrlAccess:true});}
export async function queueMail(enquiry:MailEnquiry){const {error}=await database().from('site_settings').insert({setting_group:'enquiry_mail',setting_key:enquiry.reference_number,setting_value:{status:'pending',enquiry,attempts:0},updated_at:new Date().toISOString()});if(error)throw new Error('Unable to queue email');}
export async function deliverMail(reference:string){
 const db=database();
 try{const claim=await claimMail(db,reference);if(!claim)return false;if(claim.sent)return true;
 const {item,token}=claim;const e=item.enquiry as MailEnquiry;
 try{const sent=await mailTransport().sendMail({from:{name:'Cubixtop Website',address:process.env.ZOHO_SMTP_USER!},to:'info@cubixtop.com',replyTo:e.email,subject:`Website enquiry ${e.reference_number}`,messageId:`<${e.reference_number}@cubixtop.com>`,text:`New website enquiry\n\nReference: ${e.reference_number}\nName: ${e.name}\nEmail: ${e.email}\nPhone: ${e.phone}\nService: ${e.service_label}\n\n${e.message}\n`});if(!sent.accepted?.length)throw new Error('Not accepted');
 const {error:saved}=await db.from('site_settings').update({setting_value:{...item,status:'sent',sent_at:new Date().toISOString(),attempts:(item.attempts||0)+1,lock_until:0},updated_at:new Date().toISOString()}).eq('setting_group','enquiry_mail').eq('setting_key',reference).eq('setting_value->>lock_version',token);
 if(saved)throw new Error('Delivery status unavailable');return true;
 }catch{await db.from('site_settings').update({setting_value:{...item,status:'pending',attempts:(item.attempts||0)+1,last_attempt:new Date().toISOString(),lock_until:0},updated_at:new Date().toISOString()}).eq('setting_group','enquiry_mail').eq('setting_key',reference).eq('setting_value->>lock_version',token);console.error('Enquiry email pending retry:',reference);return false;}
 }catch{console.error('Enquiry email queue temporarily unavailable:',reference);return false;}
}
