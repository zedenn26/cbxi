import {redirect} from 'next/navigation';import {isAdmin} from '@/lib/admin';import AdminEditor from '@/components/AdminEditor';
export const metadata={title:'Admin',robots:{index:false,follow:false}};
export default async function Admin(){if(!await isAdmin())redirect('/admin/login');return <AdminEditor/>}
