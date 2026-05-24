"use client"

import { usePathname } from 'next/navigation';
import FloatingChatButton from './FloatingChatIcon';


export default function LayoutChatIconWrapper(){
    const pathname = usePathname();
    
    if(pathname === '/chat' || pathname === '/chat/'){
        return null;
    }

    return <FloatingChatButton/>
}