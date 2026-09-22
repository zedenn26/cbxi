import {spawn} from 'node:child_process';
import {createHmac,randomBytes} from 'node:crypto';
import assert from 'node:assert/strict';
const base='http://localhost:3102';const secret=randomBytes(32).toString('hex');
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p','3102'],{env:{...process.env,ADMIN_SESSION_SECRET:secret},stdio:'ignore'});
const check=(value,label)=>{assert.ok(value,label);console.log('PASS:',label);};
try{
 let ready=false;for(let i=0;i<50;i++){try{const r=await fetch(base+'/');if(r.ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,300));}check(ready,'production server boots');
 let r=await fetch(base+'/contact');let html=await r.text();check(r.status===200&&['Bangalore','Delhi','Mumbai','Ahmedabad'].every(city=>html.includes(city)),'four team locations');check(html.includes('https://www.cubixtop.com/contact')&&html.includes('application/ld+json'),'canonical and structured data');check(r.headers.get('x-content-type-options')==='nosniff'&&r.headers.get('x-frame-options')==='DENY'&&r.headers.has('content-security-policy'),'security headers');
 r=await fetch(base+'/sitemap.xml');html=await r.text();check(r.ok&&html.includes('https://www.cubixtop.com/services/it-infrastructure-contractual-maintenance')&&!html.includes('/admin'),'public sitemap');
 r=await fetch(base+'/robots.txt');check((await r.text()).includes('Disallow: /admin'),'crawler rules');
 r=await fetch(base+'/admin',{redirect:'manual'});check(r.status===307,'admin requires authentication');
 r=await fetch(base+'/api/admin/content');check(r.status===401,'private admin API blocked');
 const headers={'Content-Type':'application/json',Origin:base};
 r=await fetch(base+'/api/enquiries',{method:'POST',headers:{...headers,Origin:'https://attacker.example'},body:'{}'});check(r.status===403,'cross-origin form blocked');
 r=await fetch(base+'/api/enquiries',{method:'POST',headers,body:'{'});check(r.status===400,'malformed JSON rejected');
 r=await fetch(base+'/api/enquiries',{method:'POST',headers,body:JSON.stringify({message:'x'.repeat(20000)})});check(r.status===413,'oversized enquiry blocked');
 r=await fetch(base+'/api/enquiries',{method:'POST',headers,body:JSON.stringify({name:'Bot test',email:'test@example.com',phone:'+919481317929',message:'Smoke test',website:'spam'})});check(r.status===400,'honeypot rejected');
 r=await fetch(base+'/api/admin/login',{method:'POST',headers,body:JSON.stringify({password:'invalid'})});check(r.status===401,'production login uses Supabase guard without Redis');
 const payload=`${Date.now()+60000}.${randomBytes(16).toString('hex')}`;const signature=createHmac('sha256',secret).update(payload).digest('hex');const cookie=`cubixtop_admin=${payload}.${signature}`;
 r=await fetch(base+'/api/admin/content',{headers:{Cookie:cookie}});const data=await r.json();check(r.ok&&Array.isArray(data.mail)&&data.services.length>=6,'authenticated editor and email queue available');
 r=await fetch(base+'/api/admin/content',{method:'PUT',headers:{...headers,Cookie:cookie},body:JSON.stringify({type:'content',values:{'home.heroImage':'//evil.example/image'}})});check(r.status===400,'protocol-relative CMS images rejected');
 r=await fetch(base+'/api/admin/content',{method:'PUT',headers:{...headers,Cookie:cookie},body:JSON.stringify({type:'content',values:{'social.instagram':'https://attacker.example'}})});check(r.status===400,'social profile domain validated');
 r=await fetch(base+'/api/cron/enquiries');check(r.status===401,'mail retry cron protected');
 const expired=`${Date.now()-1000}.${randomBytes(16).toString('hex')}`;const expiredSignature=createHmac('sha256',secret).update(expired).digest('hex');r=await fetch(base+'/api/admin/content',{headers:{Cookie:`cubixtop_admin=${expired}.${expiredSignature}`}});check(r.status===401,'expired admin session rejected');
 console.log('No enquiry or email was submitted by these tests.');
}finally{child.kill('SIGTERM');}
