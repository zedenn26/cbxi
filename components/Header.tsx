'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useRef,useState} from 'react';
import {ArrowUpRight, X} from 'lucide-react';
import EnquiryModal from './EnquiryModal';
export default function Header(){
 const[open,setOpen]=useState(false),[menu,setMenu]=useState(false),[scrolled,setScrolled]=useState(false);
 const dialog=useRef<HTMLDialogElement>(null);const path=usePathname();
 useEffect(()=>{const update=()=>setScrolled(window.scrollY>30);update();window.addEventListener('scroll',update,{passive:true});return()=>window.removeEventListener('scroll',update);},[]);
 useEffect(()=>{if(!menu)return;dialog.current?.showModal();const before=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{dialog.current?.close();document.body.style.overflow=before;};},[menu]);
 const admin=path.startsWith('/admin');
 return <><header className={`site-header modern-header ${scrolled?'is-scrolled':''} ${admin?'admin-header':''}`}><div className="wrap header-inner"><Link href="/" aria-label="Cubixtop India home" className="brand"><img src="/logo-transparent.png" alt="Cubixtop India"/></Link><div className="header-actions"><a className="header-phone" href="tel:+919481317929">+91 9481 317 929</a><button className="header-cta" onClick={()=>setOpen(true)}>Let’s talk <ArrowUpRight size={18}/></button><button className="hamburger-control" aria-label="Open navigation" aria-expanded={menu} aria-controls="full-navigation" onClick={()=>setMenu(true)}><span>Menu</span><span className="hamburger-lines"><i/><i/></span></button></div></div></header>
 <dialog id="full-navigation" ref={dialog} className="navigation-dialog" aria-label="Main navigation" onCancel={()=>setMenu(false)}><div className="navigation-top"><Link href="/" onClick={()=>setMenu(false)}><img src="/logo-transparent.png" alt="Cubixtop India"/></Link><button className="navigation-close" onClick={()=>setMenu(false)} aria-label="Close navigation">Close <X size={22}/></button></div><div className="navigation-layout"><div className="navigation-photo"><img src="/images/circuit.jpg" alt="Electronic circuits and technology components"/><div><span>CONNECTED THINKING.</span><p>Technology for<br/>what’s next.</p></div></div><div className="navigation-content"><span className="eyebrow light">Explore Cubixtop</span><nav>{[['/','Home'],['/about','About us'],['/services','Our services'],['/contact','Contact']].map(([href,label],i)=><Link key={href} style={{animationDelay:`${i*65}ms`}} href={href} aria-current={path===href?'page':undefined} onClick={()=>setMenu(false)}><small>0{i+1}</small><span>{label}</span><ArrowUpRight/></Link>)}</nav><div className="navigation-contact"><a href="mailto:info@cubixtop.com">info@cubixtop.com ↗</a><a href="tel:+919481317929">+91 9481 317 929</a></div></div></div></dialog><EnquiryModal open={open} close={()=>setOpen(false)}/></>;
}
