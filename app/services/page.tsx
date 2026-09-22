import {pageMetadata} from '@/lib/seo';
import {Content,CmsImage} from '@/components/Cms';
import ServiceGrid from '@/components/ServiceGrid';
import {getServices} from '@/lib/data';
export const metadata=pageMetadata("IT Infrastructure Maintenance & Software Solutions","IT annual maintenance, business networks, cloud and email, cybersecurity, custom software and websites for businesses worldwide.","/services");
export default async function Services(){const services=await getServices();return <main><section className="page-hero photo-banner"><CmsImage id="services.banner" src="/images/servers.jpg" alt="Business server and networking infrastructure" className="page-banner-photo"/><div className="wrap"><span className="eyebrow light"><Content id="services.text1">Our capabilities</Content></span><h1 className="display mt-5"><Content id="services.text2">IT for your business.</Content></h1><p><Content id="services.intro">Contractual IT infrastructure maintenance and software solutions for businesses worldwide.</Content></p></div></section><section className="section service-grid-section"><div className="wrap"><ServiceGrid services={services}/></div></section></main>}
