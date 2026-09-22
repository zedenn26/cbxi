import type {MetadataRoute} from 'next';import {siteUrl} from '@/lib/seo';import {getServices} from '@/lib/data';
export const revalidate=3600;
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const services=await getServices();return [...['','/about','/services','/contact'].map(path=>({url:siteUrl+path,changeFrequency:'monthly' as const,priority:path?0.8:1})),...services.map(s=>({url:siteUrl+'/services/'+s.slug,changeFrequency:'monthly' as const,priority:0.7}))];}
