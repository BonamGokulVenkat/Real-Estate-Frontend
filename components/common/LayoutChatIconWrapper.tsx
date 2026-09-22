"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import FloatingChatButton from "./FloatingChatIcon";
import PropertyChatWidget from "./PropertyChatWidget";

export default function LayoutChatIconWrapper() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (pathname === "/chat" || pathname === "/chat/") {
    return null;
  }

  return (
    <>
      {isOpen && (
        <PropertyChatWidget
          isFullScreen={false}
          onClose={() => setIsOpen(false)}
        />
      )}
      <FloatingChatButton
        isOpen={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      />
    </>
  );
}