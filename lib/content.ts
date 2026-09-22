import 'server-only';
import {database} from './admin';
export async function getContent():Promise<Record<string,string>>{try{const {data,error}=await database().from('site_settings').select('setting_value').eq('setting_group','website').eq('setting_key','content').maybeSingle();if(error)return {};return data?.setting_value||{};}catch{return {};}}
