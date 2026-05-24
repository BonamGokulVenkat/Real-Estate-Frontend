"use client";

import { useState, useEffect } from "react";

// ─── Keyframes ────────────────────────────────────────────────────────────────

const KEYFRAMES = `
  @keyframes fcb-pulse {
    0%   { box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.45); }
    70%  { box-shadow: 0 0 0 14px rgba(217, 119, 6, 0); }
    100% { box-shadow: 0 0 0 0 rgba(217, 119, 6, 0); }
  }
  @keyframes fcb-pop-in {
    0%   { opacity: 0; transform: scale(0.6) translateY(12px); }
    70%  { transform: scale(1.08) translateY(-2px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes fcb-tooltip-in {
    0%   { opacity: 0; transform: translateX(8px); }
    100% { opacity: 1; transform: translateX(0); }
  }
  @keyframes fcb-ripple {
    0%   { transform: scale(0); opacity: 0.6; }
    100% { transform: scale(2.4); opacity: 0; }
  }
  @keyframes fcb-badge-pop {
    0%   { transform: scale(0); }
    60%  { transform: scale(1.3); }
    100% { transform: scale(1); }
  }
`;

// ─── Types ────────────────────────────────────────────────────────────────────

interface FloatingChatButtonProps {
  /** Route to open — defaults to "/chat" */
  chatPath?: string;
  /** Whether to open in a new tab — defaults to true */
  newTab?: boolean;
  /** Unread badge count — omit to hide badge */
  unreadCount?: number;
  /** Custom tooltip label */
  label?: string;
  /** Position — defaults to bottom-right */
  position?: "bottom-right" | "bottom-left";
  /** If true, the component completely disappears from the page */
  hide?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FloatingChatButton({
  chatPath = "/chat",
  newTab = true,
  unreadCount,
  label = "Chat with Luxora AI",
  position = "bottom-right",
  hide = false, // Defaults to false so it shows normally
}: FloatingChatButtonProps) {
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [rippling, setRippling] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // If the component is set to hide, don't bother attaching keyframes or handling mount
    if (hide) return;

    // Inject keyframes
    const style = document.createElement("style");
    style.setAttribute("data-fcb", "1");
    style.textContent = KEYFRAMES;
    document.head.appendChild(style);

    // Delay mount for pop-in animation
    const t = setTimeout(() => setMounted(true), 300);
    return () => {
      clearTimeout(t);
      document.head.querySelector("[data-fcb]")?.remove();
    };
  }, [hide]);

  // Click handler to run ripple effect and redirect
  const handleClick = () => {
    setRippling(true);
    setTimeout(() => setRippling(false), 600);

    if (newTab) {
      window.open(chatPath, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = chatPath;
    }
  };

  // Short-circuit render completely if hide prop is true or component isn't mounted yet
  if (hide || !mounted) return null;

  const isRight = position === "bottom-right";

  return (
    <div
      style={{
        position: "fixed",
        bottom: "28px",
        ...(isRight ? { right: "28px" } : { left: "28px" }),
        zIndex: 9999,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "10px",
        animation: "fcb-pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards",
      }}
    >
      {/* Tooltip — shown on hover, right-aligned when button is on the right */}
      {hovered && !dismissed && (
        <div
          style={{
            background: "#1a1a1a",
            color: "#fff",
            fontSize: "13px",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            fontWeight: 500,
            padding: "8px 14px",
            borderRadius: "10px",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            animation: "fcb-tooltip-in 0.18s ease forwards",
            boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
            order: isRight ? -1 : 1,
          }}
        >
          {label}
          {/* Arrow pointing toward button */}
          <span
            style={{
              position: "absolute",
              top: "50%",
              ...(isRight
                ? { right: "-5px", transform: "translateY(-50%) rotate(45deg)" }
                : { left: "-5px", transform: "translateY(-50%) rotate(45deg)" }),
              width: "8px",
              height: "8px",
              background: "#1a1a1a",
              borderRadius: "1px",
            }}
          />
        </div>
      )}

      {/* Main button */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        {/* Pulse ring — only when not hovered */}
        {!hovered && (
          <span
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              animation: "fcb-pulse 2.4s ease-out infinite",
              pointerEvents: "none",
            }}
          />
        )}

        {/* Ripple on click */}
        {rippling && (
          <span
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.35)",
              animation: "fcb-ripple 0.55s ease-out forwards",
              pointerEvents: "none",
            }}
          />
        )}

        <button
          onClick={handleClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          aria-label={label}
          title={label}
          style={{
            width: "58px",
            height: "58px",
            borderRadius: "50%",
            background: hovered
              ? "#b45309"
              : "linear-gradient(135deg, #f59e0b 0%, #D97706 60%, #b45309 100%)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: hovered
              ? "0 8px 32px rgba(217,119,6,0.55), 0 2px 8px rgba(0,0,0,0.18)"
              : "0 4px 18px rgba(217,119,6,0.4), 0 2px 6px rgba(0,0,0,0.15)",
            transition: "background 0.2s, box-shadow 0.2s, transform 0.15s",
            transform: hovered ? "scale(1.08)" : "scale(1)",
            position: "relative",
            flexShrink: 0,
          }}
        >
          {/* House icon */}
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transition: "transform 0.2s",
              transform: hovered ? "scale(1.12)" : "scale(1)",
            }}
            aria-hidden
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>

          {/* Chat bubble dot overlay */}
          <span
            style={{
              position: "absolute",
              bottom: "10px",
              right: "10px",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#fff",
              opacity: 0.9,
            }}
          />
        </button>

        {/* Unread badge */}
        {typeof unreadCount === "number" && unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "0px",
              right: "0px",
              minWidth: "20px",
              height: "20px",
              borderRadius: "999px",
              background: "#ef4444",
              color: "#fff",
              fontSize: "11px",
              fontWeight: 700,
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 5px",
              border: "2px solid #fff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              animation: "fcb-badge-pop 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards",
              pointerEvents: "none",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>
    </div>
  );
}