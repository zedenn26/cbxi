import {serviceCatalog} from './service-catalog';
import {supabase} from './supabase';
export const fallbackServices=serviceCatalog.map((service,index)=>({...service,id:String(index+1)}));
export async function getServices(){if(!supabase)return fallbackServices;const {data,error}=await supabase.from('services').select('id,title,slug,short_description,description,display_order').eq('active',true).order('display_order');return error?fallbackServices:(data||[])}
export async function getService(slug:string){const all=await getServices();return all.find((s:any)=>s.slug===slug)||null}
