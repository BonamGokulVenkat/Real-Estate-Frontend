"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import path from "path";

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");
  const isChat = pathname === '/chat' || pathname === '/chat/'; 

  return (
    <>
      { !isChat && !isAdminPage && <Navbar />}
      <main>{children}</main>
      { !isChat && !isAdminPage && <Footer />}
    </>
  );
}