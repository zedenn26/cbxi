import {CmsImage} from './Cms';
import {serviceImages} from '@/lib/service-images';
import Link from 'next/link';
import {ArrowUpRight,Headset,Network,Code2,Cloud,ShieldCheck,Globe} from 'lucide-react';
const icons:Record<string,typeof Cloud>={
 'it-infrastructure-contractual-maintenance':Headset,'it-infrastructure-and-networking':Network,
 'custom-application-development':Code2,'cloud-operations-and-setup':Cloud,
 'cybersecurity-and-backup':ShieldCheck,'customized-website-design':Globe,
};
type Service={id:string,title:string,slug:string,short_description:string};
export default function ServiceGrid({services}:{services:Service[]}){return <div className="service-grid">{services.map(service=>{const Icon=icons[service.slug]||Network;const photo=serviceImages[service.slug]||serviceImages['it-infrastructure-and-networking'];return <Link key={service.id} href={'/services/'+service.slug} className="service-card"><CmsImage id={`services.photo.${service.slug}`} src={photo.src} alt={photo.alt} className="service-card-photo" loading="lazy"/><div className="service-card-icon"><Icon size={29} strokeWidth={1.5}/><ArrowUpRight size={21} className="service-card-arrow"/></div><h3>{service.title}</h3><p>{service.short_description}</p><span className="service-card-link">Explore solution <ArrowUpRight size={16}/></span></Link>;})}</div>}
