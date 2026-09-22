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
        <>
          {/* Backdrop overlay so clicking remaining screen closes chatbot */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9990,
              background: "transparent",
            }}
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <PropertyChatWidget
            isFullScreen={false}
            onClose={() => setIsOpen(false)}
          />
        </>
      )}
      <FloatingChatButton
        isOpen={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      />
    </>
  );
}