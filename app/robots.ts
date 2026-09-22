import type {MetadataRoute} from 'next';import {siteUrl} from '@/lib/seo';
export default function robots():MetadataRoute.Robots{const preview=process.env.VERCEL_ENV&&process.env.VERCEL_ENV!=='production';return {rules:preview?{userAgent:'*',disallow:'/'}:{userAgent:'*',allow:'/',disallow:['/admin','/api/']},sitemap:siteUrl+'/sitemap.xml'};}
