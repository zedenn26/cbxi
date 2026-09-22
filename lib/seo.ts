import type {Metadata} from 'next';
export const siteUrl=(process.env.NEXT_PUBLIC_SITE_URL||'https://www.cubixtop.com').replace(/\/$/,'');
export const cities=['Bangalore (Bengaluru)','Delhi','Mumbai','Ahmedabad'];
export function pageMetadata(title:string,description:string,path:string):Metadata{return {title,description,alternates:{canonical:siteUrl+path},openGraph:{type:'website',locale:'en_US',url:siteUrl+path,siteName:'Cubixtop India',title,description,images:[{url:siteUrl+'/images/code.jpg',width:1800,height:1200,alt:'Cubixtop India business technology services'}]},twitter:{card:'summary_large_image',title,description,images:[siteUrl+'/images/code.jpg']}};}
