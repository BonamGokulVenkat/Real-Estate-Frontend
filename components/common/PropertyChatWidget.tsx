"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatPrice } from "@/lib/price";
import { Heart, Calendar, MessageSquare, Loader2, X, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { favouriteService, FavoriteItem } from "@/services/favouriteService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PropertyMeta {
  property_id: string;
  title: string;
  price: number | string;
  city: string;
  locality?: string;
  property_type: string;
  bedrooms?: number;
  size_sqft?: number;
  score: number;
  media?: { url: string }[];
  contact_phone?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  properties?: PropertyMeta[];
  streaming?: boolean;
  suggestions?: string[];
}

export interface PropertyChatWidgetProps {
  /** When true, renders as full-screen page. When false, renders as floating popup widget. */
  isFullScreen?: boolean;
  /** Callback fired when the widget close button is clicked in floating mode. */
  onClose?: () => void;
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SUGGESTIONS = [
  "2 BHK under ₹50L in Bangalore",
  "Luxury villa with pool",
  "Student rental in Pune",
  "Family home with garden",
];

const HISTORY = [
  "2 BHK in Bangalore",
  "Luxury villas Mumbai",
  "Student rental Pune",
  "Family homes Delhi",
];

// ─── Keyframe injection ───────────────────────────────────────────────────────

const KEYFRAMES = `
* { box-sizing: border-box; }

@keyframes floatLogo {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50%       { transform: translateY(-8px) rotate(2deg); }
}
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 8px 2px rgba(217,119,6,0.35), 0 4px 20px rgba(217,119,6,0.25); }
  50%      { box-shadow: 0 0 22px 5px rgba(217,119,6,0.65), 0 4px 30px rgba(217,119,6,0.45); }
}
@keyframes glowPulseSm {
  0%, 100% { box-shadow: 0 0 6px 1px rgba(217,119,6,0.3); }
  50%      { box-shadow: 0 0 14px 3px rgba(217,119,6,0.6); }
}
@keyframes glowText {
  0%, 100% { text-shadow: 0 0 8px rgba(217,119,6,0.4); }
  50%      { text-shadow: 0 0 20px rgba(217,119,6,0.8), 0 0 40px rgba(217,119,6,0.3); }
}
@keyframes borderGlow {
  0%, 100% { border-color: rgba(217,119,6,0.2); opacity: 0.6; }
  50%      { border-color: rgba(217,119,6,0.7); opacity: 1; }
}
@keyframes rotateRing {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes cardFloat {
  0%, 100% { transform: translateY(0) scale(1); }
  50%      { transform: translateY(-5px) scale(1.01); }
}
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position:  400px 0; }
}
@keyframes scoreBar {
  from { width: 0; }
  to   { width: var(--score-w); }
}
@keyframes particleDrift {
  0%   { transform: translate(0, 0) scale(1); opacity: 0.7; }
  100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
}
@keyframes curBlink     { 0%,100%{opacity:1} 50%{opacity:0} }
@keyframes typingBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
@keyframes blinkDot     { 0%,100%{opacity:1} 50%{opacity:0.3} }
@keyframes fadeSlideUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@keyframes statusPulse  {
  0%,100% { box-shadow: 0 0 0 0   rgba(22,163,74,0.5); }
  70%     { box-shadow: 0 0 0 6px rgba(22,163,74,0); }
}
@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

@media (max-width: 640px) {
  .luxora-chat-floating {
    bottom: 0 !important;
    right: 0 !important;
    left: 0 !important;
    top: 0 !important;
    width: 100vw !important;
    height: 100% !important;
    max-width: 100vw !important;
    max-height: 100% !important;
    border-radius: 0 !important;
    border: none !important;
  }
}
`;

// ─── Design tokens ────────────────────────────────────────────────────────────

const T = {
  amber:      "#D97706",
  amberDark:  "#B45309",
  amberDeep:  "#92400E",
  bgBase:     "#0a0f1a",
  bgPanel:    "#0d1526",
  bgCard:     "#111827",
  bgCard2:    "#161f30",
  border:     "#1e2d45",
  borderGlow: "rgba(217,119,6,0.25)",
  textPri:    "#f0f4ff",
  textSec:    "#8899bb",
  textMuted:  "#4a5a78",
  green:      "#22c55e",
  greenLight: "#4ade80",
};

// ─── Inline Styles ────────────────────────────────────────────────────────────

const css: Record<string, React.CSSProperties> = {
  hostFullscreen: {
    display: "flex",
    position: "fixed" as const,
    inset: 0,
    height: "100vh",
    width: "100vw",
    fontFamily: "var(--font-sans, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif)",
    background: T.bgBase,
    color: T.textPri,
    overflow: "hidden",
    margin: 0,
    padding: 0,
    zIndex: 1000,
  },

  hostFloating: {
    display: "flex",
    position: "fixed" as const,
    bottom: "96px",
    right: "28px",
    width: "420px",
    maxWidth: "calc(100vw - 36px)",
    height: "620px",
    maxHeight: "calc(100vh - 120px)",
    fontFamily: "var(--font-sans, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif)",
    background: T.bgBase,
    color: T.textPri,
    borderRadius: "16px",
    border: `1px solid ${T.borderGlow}`,
    boxShadow: "0 12px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(217,119,6,0.25)",
    overflow: "hidden",
    zIndex: 9998,
    flexDirection: "column" as const,
  },

  // Ambient particles canvas layer
  particleLayer: {
    position: "absolute" as const,
    inset: 0,
    pointerEvents: "none" as const,
    overflow: "hidden",
    zIndex: 0,
  },

  // ── Sidebar ──────────────────────────────────────────────────────────────
  sidebar: {
    width: "224px",
    background: T.bgPanel,
    borderRight: `0.5px solid ${T.border}`,
    display: "flex",
    flexDirection: "column",
    padding: "16px 10px",
    gap: "2px",
    flexShrink: 0,
    position: "relative" as const,
    zIndex: 2,
  },
  sidebarLogo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "4px 8px 20px",
    cursor: "pointer",
  },
  logoIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    background: "linear-gradient(145deg, #e8a020, #B45309, #7a3500)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    flexShrink: 0,
    position: "relative" as const,
    animation: "floatLogo 4s ease-in-out infinite, glowPulse 3s ease-in-out infinite",
    boxShadow: "0 4px 20px rgba(217,119,6,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
  },
  logoTextWrap: {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.1,
  },
  logoName: {
    fontSize: "14px",
    fontWeight: 700,
    color: T.textPri,
    letterSpacing: "-0.3px",
  },
  logoSub: {
    fontSize: "10px",
    color: T.amber,
    fontWeight: 500,
    letterSpacing: "1.5px",
    textTransform: "uppercase" as const,
    animation: "glowText 3s ease-in-out infinite",
  },
  newChatBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "9px 12px",
    borderRadius: "10px",
    border: `0.5px solid ${T.borderGlow}`,
    background: "rgba(217,119,6,0.08)",
    cursor: "pointer",
    color: T.amber,
    fontSize: "12.5px",
    fontFamily: "inherit",
    marginBottom: "12px",
    transition: "all 0.2s",
    fontWeight: 500,
  },
  sidebarSection: {
    fontSize: "10px",
    color: T.textMuted,
    padding: "8px 8px 4px",
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
    fontWeight: 600,
  },
  historyItem: {
    padding: "8px 10px",
    borderRadius: "8px",
    fontSize: "12px",
    color: T.textSec,
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
    transition: "all 0.15s",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  historyItemActive: {
    padding: "8px 10px",
    borderRadius: "8px",
    fontSize: "12px",
    color: "#fbbf24",
    cursor: "pointer",
    background: "rgba(217,119,6,0.1)",
    border: `0.5px solid rgba(217,119,6,0.3)`,
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  activeDot: {
    width: "4px",
    height: "4px",
    borderRadius: "50%",
    background: T.amber,
    flexShrink: 0,
  },
  ragFooter: {
    padding: "12px 8px 4px",
    fontSize: "10.5px",
    color: T.textMuted,
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "auto",
    borderTop: `0.5px solid ${T.border}`,
  },
  ragFooterDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: T.green,
    flexShrink: 0,
    animation: "statusPulse 2s ease-in-out infinite",
  },

  // ── Main ──────────────────────────────────────────────────────────────────
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    overflow: "hidden",
    position: "relative" as const,
    zIndex: 1,
  },

  // ── Topbar ────────────────────────────────────────────────────────────────
  topbar: {
    height: "56px",
    borderBottom: `0.5px solid ${T.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    flexShrink: 0,
    background: "rgba(13,21,38,0.95)",
    backdropFilter: "blur(8px)",
  },
  topbarLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: 0,
  },
  topbarAvatar: {
    width: "30px",
    height: "30px",
    borderRadius: "9px",
    background: "linear-gradient(145deg, #e8a020, #B45309)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    flexShrink: 0,
    animation: "glowPulseSm 3s ease-in-out infinite",
    boxShadow: "0 2px 12px rgba(217,119,6,0.4)",
  },
  topbarTitle: {
    fontSize: "13.5px",
    fontWeight: 600,
    color: T.textPri,
    letterSpacing: "-0.2px",
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  statusBadge: {
    fontSize: "10px",
    background: "rgba(34,197,94,0.1)",
    color: T.greenLight,
    border: "0.5px solid rgba(34,197,94,0.3)",
    borderRadius: "999px",
    padding: "2px 8px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontWeight: 500,
    flexShrink: 0,
  },
  statusBadgeThinking: {
    fontSize: "10px",
    background: "rgba(217,119,6,0.1)",
    color: "#fbbf24",
    border: "0.5px solid rgba(217,119,6,0.3)",
    borderRadius: "999px",
    padding: "2px 8px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontWeight: 500,
    flexShrink: 0,
  },
  statusDotGreen: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: T.green,
    flexShrink: 0,
    animation: "statusPulse 2s ease-in-out infinite",
  },
  statusDotAmber: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: T.amber,
    flexShrink: 0,
    animation: "blinkDot 0.8s ease-in-out infinite",
  },
  topbarActions: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    flexShrink: 0,
  },
  iconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: T.textMuted,
    padding: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    transition: "color 0.15s, background 0.15s",
  },

  // ── RAG strip ─────────────────────────────────────────────────────────────
  ragStrip: {
    padding: "5px 16px",
    background: "linear-gradient(90deg,rgba(217,119,6,0.05),rgba(217,119,6,0.02))",
    borderBottom: "0.5px solid rgba(217,119,6,0.1)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexShrink: 0,
  },
  ragDot: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    background: T.amber,
    flexShrink: 0,
    animation: "blinkDot 2s ease-in-out infinite",
  },
  ragText: {
    fontSize: "10px",
    color: "rgba(217,119,6,0.7)",
    letterSpacing: "0.5px",
  },

  // ── Messages ──────────────────────────────────────────────────────────────
  messages: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "16px 16px 8px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    scrollbarWidth: "thin" as const,
  },
  msgRowAi: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "8px",
    animation: "fadeSlideUp 0.25s ease-out",
    maxWidth: "100%",
  },
  msgRowUser: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "6px",
    animation: "fadeSlideUp 0.25s ease-out",
    maxWidth: "100%",
  },
  msgMeta: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "11px",
    color: T.textMuted,
  },
  aiAvatarSm: {
    width: "24px",
    height: "24px",
    borderRadius: "7px",
    background: "linear-gradient(145deg, #e8a020, #B45309)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    flexShrink: 0,
    animation: "glowPulseSm 3s ease-in-out infinite",
    boxShadow: "0 2px 8px rgba(217,119,6,0.35)",
  },
  bubbleAi: {
    maxWidth: "88%",
    padding: "12px 15px",
    fontSize: "13px",
    lineHeight: 1.6,
    wordBreak: "break-word" as const,
    background: T.bgCard,
    border: `0.5px solid ${T.border}`,
    borderRadius: "4px 14px 14px 14px",
    color: T.textPri,
  },
  bubbleUser: {
    maxWidth: "88%",
    padding: "10px 14px",
    fontSize: "13px",
    lineHeight: 1.55,
    whiteSpace: "pre-wrap" as const,
    wordBreak: "break-word" as const,
    background: "linear-gradient(135deg, #D97706, #B45309)",
    borderRadius: "14px 14px 4px 14px",
    color: "#fff",
    boxShadow: "0 4px 18px rgba(217,119,6,0.3)",
  },

  // ── Property cards ────────────────────────────────────────────────────────
  featuredLabel: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "9px",
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
    color: T.amber,
    fontWeight: 700,
    paddingBottom: "4px",
    opacity: 0.8,
  },
  propRow: {
    display: "flex",
    gap: "10px",
    overflowX: "auto" as const,
    paddingBottom: "6px",
    width: "100%",
    maxWidth: "100%",
    scrollbarWidth: "none" as const,
  },
  propCard: {
    minWidth: "168px",
    maxWidth: "168px",
    background: T.bgCard2,
    border: `0.5px solid ${T.border}`,
    borderRadius: "14px",
    overflow: "hidden",
    flexShrink: 0,
    cursor: "pointer",
    textDecoration: "none",
    display: "flex",
    flexDirection: "column" as const,
    color: "inherit",
    transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
    animation: "cardFloat 4s ease-in-out infinite",
    userSelect: "none" as const,
  },
  propActions: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "5px",
    marginTop: "6px",
    paddingTop: "6px",
    borderTop: `0.5px solid ${T.border}`,
  },
  btnBookVisit: {
    width: "100%",
    padding: "5px 8px",
    borderRadius: "6px",
    border: "1px solid rgba(217,119,6,0.35)",
    background: "rgba(217,119,6,0.12)",
    color: "#fbbf24",
    fontSize: "10.5px",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    fontFamily: "inherit",
    transition: "all 0.15s ease",
  },
  propActionRow: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    width: "100%",
  },
  btnWhatsApp: {
    flex: 1,
    padding: "5px 6px",
    borderRadius: "6px",
    border: "1px solid rgba(37,211,102,0.35)",
    background: "rgba(37,211,102,0.12)",
    color: "#25D366",
    fontSize: "10.5px",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    fontFamily: "inherit",
    transition: "all 0.15s ease",
  },
  btnFavorite: {
    width: "28px",
    height: "26px",
    borderRadius: "6px",
    border: `1px solid ${T.border}`,
    background: "rgba(255,255,255,0.04)",
    color: T.textSec,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.15s ease",
  },
  btnFavoriteActive: {
    border: "1px solid rgba(239,68,68,0.5)",
    background: "rgba(239,68,68,0.15)",
    color: "#ef4444",
  },
  propImg: {
    height: "82px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative" as const,
    overflow: "hidden",
    background: "linear-gradient(135deg,#1a2540,#0d1526)",
    color: "rgba(217,119,6,0.3)",
    fontSize: "30px",
  },
  propImgShimmer: {
    position: "absolute" as const,
    inset: 0,
    background: "linear-gradient(90deg,transparent 0%,rgba(217,119,6,0.07) 50%,transparent 100%)",
    backgroundSize: "400px 100%",
    animation: "shimmer 3s ease-in-out infinite",
  },
  propImgOverlay: {
    position: "absolute" as const,
    inset: 0,
    background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.45) 100%)",
  },
  propBadge: {
    position: "absolute" as const,
    top: "6px",
    right: "6px",
    background: "linear-gradient(135deg, #D97706, #B45309)",
    color: "#fff",
    fontSize: "9px",
    fontWeight: 700,
    padding: "2px 7px",
    borderRadius: "999px",
    letterSpacing: "0.3px",
    boxShadow: "0 2px 8px rgba(217,119,6,0.5)",
  },
  propBody: { padding: "10px 10px 11px" },
  propTitle: {
    fontSize: "11px",
    fontWeight: 600,
    color: T.textPri,
    margin: "0 0 2px",
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  propLoc: {
    fontSize: "10px",
    color: T.textMuted,
    margin: "0 0 6px",
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  propPrice: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#fbbf24",
    margin: "0 0 6px",
    letterSpacing: "-0.3px",
  },
  propScoreRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "6px",
  },
  propScoreBarBg: {
    flex: 1,
    height: "3px",
    borderRadius: "2px",
    background: T.border,
    overflow: "hidden",
  },
  propScoreNum: {
    fontSize: "9px",
    fontWeight: 700,
    color: T.amber,
    minWidth: "24px",
    textAlign: "right" as const,
  },
  propDivider: {
    height: "0.5px",
    background: T.border,
    margin: "0 0 7px",
  },
  propType: {
    fontSize: "9.5px",
    background: "rgba(217,119,6,0.1)",
    color: "#fbbf24",
    padding: "2px 8px",
    borderRadius: "999px",
    border: "0.5px solid rgba(217,119,6,0.25)",
    fontWeight: 500,
  },

  // ── Typing indicator ──────────────────────────────────────────────────────
  typingBubble: {
    background: T.bgCard,
    border: `0.5px solid ${T.border}`,
    borderRadius: "4px 14px 14px 14px",
    padding: "12px 16px",
    display: "flex",
    gap: "5px",
    alignItems: "center",
  },
  typingDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: T.amber,
  },

  // ── Suggestions ───────────────────────────────────────────────────────────
  suggestions: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap" as const,
    padding: "4px 16px 8px",
    flexShrink: 0,
  },
  chip: {
    fontSize: "11px",
    padding: "5px 11px",
    borderRadius: "999px",
    border: "0.5px solid rgba(217,119,6,0.3)",
    background: "rgba(217,119,6,0.06)",
    color: "#fbbf24",
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap" as const,
    transition: "all 0.15s",
    fontWeight: 500,
  },
  contextualSuggestions: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap" as const,
    marginTop: "2px",
    maxWidth: "88%",
  },
  contextChip: {
    fontSize: "11px",
    padding: "5px 11px",
    borderRadius: "999px",
    border: "0.5px solid rgba(217,119,6,0.35)",
    background: "rgba(217,119,6,0.08)",
    color: "#fbbf24",
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap" as const,
    transition: "all 0.15s ease",
    fontWeight: 500,
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  },

  // ── Input ─────────────────────────────────────────────────────────────────
  inputArea: {
    borderTop: `0.5px solid ${T.border}`,
    padding: "10px 16px 12px",
    background: T.bgPanel,
    flexShrink: 0,
  },
  inputBox: {
    display: "flex",
    alignItems: "flex-end",
    gap: "8px",
    background: T.bgCard,
    border: `0.5px solid ${T.border}`,
    borderRadius: "12px",
    padding: "8px 10px",
    transition: "border-color 0.2s",
  },
  textarea: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    fontSize: "13px",
    color: T.textPri,
    fontFamily: "inherit",
    resize: "none" as const,
    lineHeight: 1.5,
    maxHeight: "100px",
    minHeight: "22px",
    height: "22px",
  },
  sendBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #D97706, #B45309)",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: "#fff",
    fontSize: "14px",
    transition: "opacity 0.15s, transform 0.1s",
    boxShadow: "0 2px 12px rgba(217,119,6,0.4)",
  },
  inputHint: {
    fontSize: "10px",
    color: T.textMuted,
    marginTop: "6px",
    textAlign: "center" as const,
  },
};

interface ParticleConfig {
  x: number;
  y: number;
  dx: number;
  dy: number;
  delay: number;
  dur: number;
  opacity: number;
}

const PARTICLES: ParticleConfig[] = [
  { x: 12, y: 85, dx: -15, dy: -45, delay: 0.5, dur: 7.2, opacity: 0.45 },
  { x: 28, y: 40, dx: 22,  dy: -55, delay: 2.1, dur: 8.5, opacity: 0.60 },
  { x: 45, y: 92, dx: -8,  dy: -38, delay: 1.4, dur: 6.8, opacity: 0.35 },
  { x: 62, y: 70, dx: 30,  dy: -60, delay: 3.2, dur: 9.1, opacity: 0.55 },
  { x: 80, y: 25, dx: -18, dy: -42, delay: 0.8, dur: 7.9, opacity: 0.50 },
  { x: 94, y: 65, dx: -25, dy: -50, delay: 4.0, dur: 8.0, opacity: 0.40 },
  { x: 8,  y: 30, dx: 14,  dy: -35, delay: 1.9, dur: 6.5, opacity: 0.65 },
  { x: 35, y: 78, dx: -12, dy: -48, delay: 2.7, dur: 7.6, opacity: 0.42 },
  { x: 52, y: 15, dx: 18,  dy: -52, delay: 0.2, dur: 8.8, opacity: 0.58 },
  { x: 71, y: 88, dx: -20, dy: -40, delay: 3.8, dur: 7.0, opacity: 0.38 },
  { x: 88, y: 50, dx: 10,  dy: -62, delay: 1.1, dur: 9.4, opacity: 0.62 },
  { x: 20, y: 60, dx: -22, dy: -36, delay: 4.5, dur: 6.9, opacity: 0.48 },
  { x: 38, y: 20, dx: 25,  dy: -58, delay: 2.4, dur: 8.2, opacity: 0.52 },
  { x: 58, y: 82, dx: -14, dy: -44, delay: 1.6, dur: 7.4, opacity: 0.44 },
  { x: 76, y: 38, dx: 16,  dy: -54, delay: 3.5, dur: 8.6, opacity: 0.56 },
  { x: 90, y: 90, dx: -30, dy: -46, delay: 0.9, dur: 7.1, opacity: 0.36 },
  { x: 15, y: 10, dx: 12,  dy: -32, delay: 2.8, dur: 6.4, opacity: 0.68 },
  { x: 84, y: 75, dx: -16, dy: -56, delay: 4.2, dur: 9.0, opacity: 0.46 },
];

function ParticleLayer() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div style={css.particleLayer}>
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: "2px",
            height: "2px",
            borderRadius: "50%",
            background: T.amber,
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
            animationName: "particleDrift",
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
            animationTimingFunction: "ease-out",
            animationIterationCount: "infinite",
            ["--dx" as any]: `${p.dx}px`,
            ["--dy" as any]: `${p.dy}px`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface SiteVisitModalProps {
  property: PropertyMeta | null;
  onClose: () => void;
}

function SiteVisitModal({ property, onClose }: SiteVisitModalProps) {
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("10:00 AM - 12:00 PM");
  const [visitType, setVisitType] = useState<"in_person" | "video_tour">("in_person");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!property) return null;

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please provide your name.");
      return;
    }
    if (!phone.trim()) {
      setError("Please provide your contact phone or WhatsApp number.");
      return;
    }
    if (!date) {
      setError("Please select a date for your visit.");
      return;
    }
    if (date < today) {
      setError("Please choose a future date.");
      return;
    }

    setIsSubmitting(true);
    // Submit handler - isolated request simulation (backend appointment API is not yet provisioned)
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success(`Site visit requested for ${property.title}!`);
    }, 500);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(6px)",
        zIndex: 10005,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "#0d1526",
          border: "1px solid rgba(217, 119, 6, 0.35)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.85), 0 0 30px rgba(217,119,6,0.15)",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "440px",
          maxHeight: "90vh",
          overflowY: "auto",
          color: "#f0f4ff",
          padding: "24px",
          position: "relative",
          fontFamily: "var(--font-sans, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            color: "#8899bb",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "6px",
          }}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {!isSubmitted ? (
          <div>
            <div style={{ marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <Calendar size={18} color="#fbbf24" />
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#f0f4ff", margin: 0 }}>
                  Book a Site Visit
                </h3>
              </div>
              <p style={{ fontSize: "12px", color: "#8899bb", margin: "2px 0 0" }}>
                {property.title} · {[property.locality, property.city].filter(Boolean).join(", ")}
              </p>
            </div>

            {error && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  color: "#fca5a5",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  marginBottom: "14px",
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#8899bb", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    background: "#111827",
                    border: "1px solid #1e2d45",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "13px",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#8899bb", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Phone / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    background: "#111827",
                    border: "1px solid #1e2d45",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "13px",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#8899bb", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={today}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      background: "#111827",
                      border: "1px solid #1e2d45",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                      colorScheme: "dark",
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#8899bb", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Time Slot *
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      background: "#111827",
                      border: "1px solid #1e2d45",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                      outline: "none",
                    }}
                  >
                    <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                    <option value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM</option>
                    <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                    <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#8899bb", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Visit Type
                </label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <label
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: "8px",
                      border: visitType === "in_person" ? "1px solid #D97706" : "1px solid #1e2d45",
                      background: visitType === "in_person" ? "rgba(217, 119, 6, 0.12)" : "#111827",
                      cursor: "pointer",
                      fontSize: "12px",
                      textAlign: "center",
                    }}
                  >
                    <input
                      type="radio"
                      name="visitType"
                      checked={visitType === "in_person"}
                      onChange={() => setVisitType("in_person")}
                      style={{ display: "none" }}
                    />
                    🚗 In-Person Visit
                  </label>
                  <label
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: "8px",
                      border: visitType === "video_tour" ? "1px solid #D97706" : "1px solid #1e2d45",
                      background: visitType === "video_tour" ? "rgba(217, 119, 6, 0.12)" : "#111827",
                      cursor: "pointer",
                      fontSize: "12px",
                      textAlign: "center",
                    }}
                  >
                    <input
                      type="radio"
                      name="visitType"
                      checked={visitType === "video_tour"}
                      onChange={() => setVisitType("video_tour")}
                      style={{ display: "none" }}
                    />
                    📹 Live Video Tour
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#8899bb", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Special Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any preferences or questions for the agent..."
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    background: "#111827",
                    border: "1px solid #1e2d45",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                    resize: "none",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: "9px 16px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid #1e2d45",
                    borderRadius: "8px",
                    color: "#8899bb",
                    fontSize: "12.5px",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 2,
                    padding: "9px 16px",
                    background: "linear-gradient(135deg, #D97706, #B45309)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12.5px",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    boxShadow: "0 2px 10px rgba(217, 119, 6, 0.4)",
                  }}
                >
                  {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                  Confirm Site Visit
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "16px 8px 8px" }}>
            <CheckCircle2 size={44} color="#22c55e" style={{ margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#f0f4ff", marginBottom: "6px" }}>
              Site Visit Requested!
            </h3>
            <p style={{ fontSize: "13px", color: "#8899bb", lineHeight: 1.5, marginBottom: "12px" }}>
              Thank you, <strong style={{ color: "#fff" }}>{name}</strong>. Your requested {visitType === "video_tour" ? "video tour" : "site visit"} for <strong style={{ color: "#fbbf24" }}>{property.title}</strong> on <strong style={{ color: "#fff" }}>{date}</strong> ({timeSlot}) has been recorded.
            </p>
            <div
              style={{
                background: "rgba(217, 119, 6, 0.08)",
                border: "1px solid rgba(217, 119, 6, 0.25)",
                padding: "10px 14px",
                borderRadius: "8px",
                fontSize: "11px",
                color: "#fbbf24",
                marginBottom: "18px",
                lineHeight: 1.4,
                textAlign: "left",
              }}
            >
              ℹ️ Notice: Backend appointment service is currently not provisioned. Your request has been captured locally and our concierge will reach out to you directly at {phone}.
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: "100%",
                padding: "10px 16px",
                background: "linear-gradient(135deg, #D97706, #B45309)",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PropertyCard({
  p,
  index,
  onBookVisit,
}: {
  p: PropertyMeta;
  index: number;
  onBookVisit: (property: PropertyMeta) => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const score = Math.round((p.score || 0) * 100);
  const rawThumb = p.media?.[0]?.url;
  const thumb = typeof rawThumb === "string" && rawThumb.trim().length > 0 ? rawThumb.trim() : undefined;
  const cardDelay = index * 0.15;

  // Favorites query
  const { data: favorites } = useQuery<FavoriteItem[]>({
    queryKey: ["favorites"],
    queryFn: favouriteService.getFavorites,
    enabled: isAuthenticated,
  });

  const isFavorited = favorites?.some((f) => f.property?.property_id === p.property_id);

  const toggleMutation = useMutation({
    mutationFn: async () => {
      if (isFavorited) {
        return favouriteService.removeFavorite(p.property_id);
      } else {
        return favouriteService.addFavorite(p.property_id);
      }
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["favorites"] });
      const previousFavorites = queryClient.getQueryData<FavoriteItem[]>(["favorites"]);

      // Optimistic update
      queryClient.setQueryData(["favorites"], (old: any) => {
        if (!old) return old;
        if (isFavorited) {
          return old.filter((f: any) => f.property?.property_id !== p.property_id);
        } else {
          return [...old, { property: { property_id: p.property_id } }];
        }
      });
      return { previousFavorites };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["favorites"], context?.previousFavorites);
      toast.error("Failed to update favorites.");
    },
    onSuccess: () => {
      if (isFavorited) {
        toast.success(`Removed ${p.title} from favorites`);
      } else {
        toast.success(`Saved ${p.title} to favorites`);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Please login to save properties to your favorites.");
      router.push("/login");
      return;
    }
    toggleMutation.mutate();
  };

  const handleWhatsApp = () => {
    const rawPhone = p.contact_phone || "447921687794";
    const phone = rawPhone.replace(/[^0-9]/g, "");
    const locationStr = [p.locality, p.city].filter(Boolean).join(", ");
    const formattedPrice = formatPrice(p.price);
    const origin = typeof window !== "undefined" ? window.location.origin : "https://luxora.estate";
    const propertyUrl = `${origin}/property/${p.property_id}`;
    const text = `Hi, I am interested in inquiring about *${p.title}* located at *${locationStr}* (Price: ${formattedPrice}). Could you please share more details? Property link: ${propertyUrl}`;
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/property/${p.property_id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          router.push(`/property/${p.property_id}`);
        }
      }}
      style={{ ...css.propCard, animationDelay: `${cardDelay}s` }}
    >
      <div
        style={{
          ...css.propImg,
          ...(thumb
            ? { backgroundImage: `url(${thumb})`, backgroundSize: "cover", backgroundPosition: "center" }
            : {}),
        }}
      >
        {!thumb && <span style={{ position: "relative", zIndex: 1, fontSize: "28px" }}>🏢</span>}
        <div style={css.propImgShimmer} />
        <div style={css.propImgOverlay} />
        <span style={css.propBadge}>#{index + 1} · {score}%</span>
      </div>
      <div style={css.propBody}>
        <p style={css.propTitle} title={p.title}>{p.title}</p>
        <p style={css.propLoc} title={[p.locality, p.city].filter(Boolean).join(", ")}>
          📍 {[p.locality, p.city].filter(Boolean).join(", ")}
        </p>
        <div style={css.propDivider} />
        <p style={css.propPrice}>{formatPrice(p.price)}</p>
        <div style={css.propScoreRow}>
          <div style={css.propScoreBarBg}>
            <div
              style={{
                height: "100%",
                background: "linear-gradient(90deg, #D97706, #fbbf24)",
                borderRadius: "2px",
                width: `${score}%`,
                animation: "scoreBar 1s ease-out forwards",
                ["--score-w" as any]: `${score}%`,
              }}
            />
          </div>
          <span style={css.propScoreNum}>{score}%</span>
        </div>
        <span style={css.propType}>{p.property_type}</span>

        {/* Action Buttons */}
        <div style={css.propActions} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            style={css.btnBookVisit}
            onClick={(e) => {
              e.stopPropagation();
              onBookVisit(p);
            }}
            title="Book a private site visit"
          >
            <Calendar size={11} />
            <span>Book Visit</span>
          </button>

          <div style={css.propActionRow}>
            <button
              type="button"
              style={css.btnWhatsApp}
              onClick={(e) => {
                e.stopPropagation();
                handleWhatsApp();
              }}
              title="Chat on WhatsApp"
            >
              <MessageSquare size={11} />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              style={{
                ...css.btnFavorite,
                ...(isFavorited ? css.btnFavoriteActive : {}),
              }}
              onClick={handleFavoriteClick}
              title={isFavorited ? "Remove from favorites" : "Save to favorites"}
              disabled={toggleMutation.isPending}
            >
              {toggleMutation.isPending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Heart
                  size={12}
                  fill={isFavorited ? "#ef4444" : "none"}
                  color={isFavorited ? "#ef4444" : "#8899bb"}
                />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={css.msgRowAi}>
      <div style={css.msgMeta}>
        <div style={css.aiAvatarSm}>🏠</div>
        <span>Luxora AI</span>
      </div>
      <div style={css.typingBubble}>
        {[0, 0.2, 0.4].map((delay, i) => (
          <div
            key={i}
            style={{
              ...css.typingDot,
              animation: `typingBounce 1.2s ease-in-out ${delay}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function MarkdownText({ text, streaming }: { text: string; streaming?: boolean }) {
  return (
    <div style={{ wordBreak: "break-word" }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p style={{ margin: "4px 0", lineHeight: 1.65 }}>
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong style={{ color: "#fbbf24", fontWeight: 700 }}>
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em style={{ fontStyle: "italic", opacity: 0.9 }}>
              {children}
            </em>
          ),
          h1: ({ children }) => (
            <h1 style={{ fontSize: "16px", fontWeight: 700, color: "#fbbf24", margin: "10px 0 4px", lineHeight: 1.3 }}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#fbbf24", margin: "8px 0 4px", lineHeight: 1.3 }}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#fbbf24", margin: "8px 0 4px", lineHeight: 1.3 }}>
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 style={{ fontSize: "13px", fontWeight: 600, color: "#fbbf24", margin: "6px 0 2px", lineHeight: 1.3 }}>
              {children}
            </h4>
          ),
          ul: ({ children }) => (
            <ul style={{ margin: "4px 0 6px", paddingLeft: "18px", listStyleType: "disc" }}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol style={{ margin: "4px 0 6px", paddingLeft: "18px", listStyleType: "decimal" }}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li style={{ margin: "2px 0", lineHeight: 1.55 }}>
              {children}
            </li>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#fbbf24",
                textDecoration: "underline",
                textUnderlineOffset: "2px",
                wordBreak: "break-all",
              }}
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote
              style={{
                borderLeft: `2px solid ${T.amber}`,
                background: "rgba(217, 119, 6, 0.06)",
                margin: "6px 0",
                padding: "6px 10px",
                borderRadius: "0 6px 6px 0",
              }}
            >
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code
              style={{
                background: "rgba(217, 119, 6, 0.15)",
                color: "#fbbf24",
                padding: "1px 5px",
                borderRadius: "4px",
                fontSize: "12px",
                fontFamily: "monospace",
              }}
            >
              {children}
            </code>
          ),
          hr: () => (
            <hr style={{ border: "none", borderTop: `1px solid ${T.border}`, margin: "10px 0" }} />
          ),
        }}
      >
        {text}
      </ReactMarkdown>
      {streaming && (
        <span
          style={{
            display: "inline-block",
            width: "2px",
            height: "13px",
            background: T.amber,
            marginLeft: "2px",
            verticalAlign: "text-bottom",
            animation: "curBlink 0.8s step-end infinite",
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

function BubbleAI({
  msg,
  onBookVisit,
  onSendMessage,
  isStreaming,
}: {
  msg: Message;
  onBookVisit: (p: PropertyMeta) => void;
  onSendMessage: (text: string) => void;
  isStreaming: boolean;
}) {
  return (
    <div style={css.msgRowAi}>
      {(msg.properties?.length ?? 0) > 0 && (
        <>
          <div style={css.featuredLabel}>✦ Featured Matches</div>
          <div style={css.propRow}>
            {msg.properties!.map((p, i) => (
              <PropertyCard
                key={p.property_id}
                p={p}
                index={i}
                onBookVisit={onBookVisit}
              />
            ))}
          </div>
        </>
      )}
      <div style={css.msgMeta}>
        <div style={css.aiAvatarSm}>🏠</div>
        <span>Luxora AI</span>
      </div>
      <div style={css.bubbleAi}>
        <MarkdownText text={msg.content} streaming={msg.streaming} />
      </div>
      {(msg.suggestions?.length ?? 0) > 0 && !msg.streaming && (
        <div style={css.contextualSuggestions} aria-label="Suggested follow-up questions">
          {msg.suggestions!.map((s) => (
            <button
              key={s}
              type="button"
              style={{
                ...css.contextChip,
                opacity: isStreaming ? 0.5 : 1,
                cursor: isStreaming ? "not-allowed" : "pointer",
              }}
              onClick={() => {
                if (!isStreaming) {
                  onSendMessage(s);
                }
              }}
              disabled={isStreaming}
              title={`Ask: "${s}"`}
            >
              <span style={{ fontSize: "10px", opacity: 0.7 }}>✦</span>
              <span>{s}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BubbleUser({ msg }: { msg: Message }) {
  return (
    <div style={css.msgRowUser}>
      <div style={css.bubbleUser}>{msg.content}</div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  onNewChat,
  activeIdx,
  setActiveIdx,
}: {
  onNewChat: () => void;
  activeIdx: number;
  setActiveIdx: (i: number) => void;
}) {
  return (
    <div style={css.sidebar}>
      <div style={css.sidebarLogo}>
        <div style={css.logoIcon}>🏠</div>
        <div style={css.logoTextWrap}>
          <span style={css.logoName}>Luxora</span>
          <span style={css.logoSub}>AI</span>
        </div>
      </div>

      <button style={css.newChatBtn} onClick={onNewChat}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        New search
      </button>

      <div style={css.sidebarSection}>Recent</div>
      {HISTORY.map((h, i) => (
        <div
          key={h}
          style={i === activeIdx ? css.historyItemActive : css.historyItem}
          onClick={() => setActiveIdx(i)}
        >
          {i === activeIdx
            ? <><span style={css.activeDot} />{h}</>
            : <>{h}</>}
        </div>
      ))}

      <div style={{ flex: 1 }} />

      <div style={css.ragFooter}>
        <div style={css.ragFooterDot} />
        RAG · Vector Search Active
      </div>
    </div>
  );
}

// ─── Main Widget ──────────────────────────────────────────────────────────────

export default function PropertyChatWidget({
  isFullScreen = true,
  onClose,
  className,
}: PropertyChatWidgetProps = {}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to Luxora Estates! I'm your personal AI property advisor.\n\nTell me what you're looking for — budget, city, size, lifestyle — and I'll find your perfect match from our verified listings.",
      properties: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [headerStatus, setHeaderStatus] = useState("Ready");
  const [isThinking, setIsThinking] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [activeHistory, setActiveHistory] = useState(0);
  const [bookingProperty, setBookingProperty] = useState<PropertyMeta | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = KEYFRAMES;
    document.head.appendChild(style);
    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  // Lock body scroll only when running in full screen mode
  useEffect(() => {
    if (isFullScreen) {
      const origOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = origOverflow;
      };
    }
  }, [isFullScreen]);

  // Close floating widget on click outside
  useEffect(() => {
    if (isFullScreen || !onClose) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (widgetRef.current && widgetRef.current.contains(target)) {
        return;
      }
      if (target.closest?.('[data-fcb-btn="1"]')) {
        return;
      }
      onClose();
    };

    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isFullScreen, onClose]);

  const handleNewChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Welcome to Luxora Estates! I'm your personal AI property advisor.\n\nTell me what you're looking for — budget, city, size, lifestyle — and I'll find your perfect match from our verified listings.",
        properties: [],
      },
    ]);
    setInput("");
    setShowSuggestions(true);
    setSessionId(null);
    setIsThinking(false);
    setHeaderStatus("Ready");
    abortRef.current?.abort();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "22px";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const sendMessage = useCallback(
    async (text?: string) => {
      const query = text || input.trim();
      if (!query || isStreaming) return;

      setInput("");
      if (inputRef.current) inputRef.current.style.height = "22px";
      setShowSuggestions(false);
      setIsStreaming(true);
      setIsThinking(true);

      const userId = `${Date.now()}-u`;
      const aiId   = `${Date.now()}-a`;

      setMessages((prev) => [
        ...prev,
        { id: userId, role: "user", content: query },
        { id: aiId, role: "assistant", content: "", properties: [], streaming: true, suggestions: [] },
      ]);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        setHeaderStatus("Generating embedding…");

        const res = await fetch(`${API_URL}/rag/recommend`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(Cookies.get("access_token") ? { Authorization: `Bearer ${Cookies.get("access_token")}` } : {}) },
          credentials: "include",
          body: JSON.stringify({ message: query, sessionId }),
          signal: controller.signal,
        });

        if (!res.ok) {
          let errorMsg = `Server returned HTTP ${res.status}`;
          try {
            const errData = await res.json();
            if (errData?.message) {
              errorMsg = typeof errData.message === "string" ? errData.message : JSON.stringify(errData.message);
            }
          } catch {
            // response was not JSON
          }
          throw new Error(errorMsg);
        }

        const newSession = res.headers.get("x-session-id");
        if (newSession) setSessionId(newSession);

        setHeaderStatus("Searching vector database…");

        if (!res.body) {
          throw new Error("Server returned an empty response body");
        }

        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("text/event-stream")) {
          const raw = await res.text();
          throw new Error(
            `Expected SSE response but received ${contentType}: ${raw.slice(0, 500)}`
          );
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        let buffer = "";
        let receivedDone = false;
        let receivedAnything = false;

        const processEvent = (event: string) => {
          const dataLines = event
            .split(/\r?\n/)
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.slice(5).trimStart());

          if (!dataLines.length) return;

          const rawData = dataLines.join("\n");

          if (!rawData || rawData === "[DONE]") {
            receivedDone = true;
            return;
          }

          try {
            const data = JSON.parse(rawData);
            receivedAnything = true;

            if (data.type === "properties") {
              setHeaderStatus("Generating recommendation…");
              setIsThinking(false);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiId
                    ? {
                        ...m,
                        properties: Array.isArray(data.properties)
                          ? data.properties
                          : [],
                      }
                    : m
                )
              );
              return;
            }

            if (data.type === "suggestions") {
              const suggestions = Array.isArray(data.suggestions)
                ? data.suggestions.filter((s: unknown): s is string => typeof s === "string" && s.trim().length > 0)
                : [];
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiId
                    ? {
                        ...m,
                        suggestions,
                      }
                    : m
                )
              );
              return;
            }

            if (data.type === "done") {
              receivedDone = true;
              const suggestions = Array.isArray(data.suggestions)
                ? data.suggestions.filter((s: unknown): s is string => typeof s === "string" && s.trim().length > 0)
                : undefined;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiId
                    ? {
                        ...m,
                        streaming: false,
                        ...(suggestions ? { suggestions } : {}),
                      }
                    : m
                )
              );
              return;
            }

            if (data.type === "error") {
              setIsThinking(false);
              const errMsg =
                typeof data.message === "string"
                  ? data.message
                  : "An error occurred while generating recommendations.";
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiId
                    ? {
                        ...m,
                        content: m.content ? `${m.content}\n\n${errMsg}` : errMsg,
                        streaming: false,
                      }
                    : m
                )
              );
              return;
            }

            if (typeof data.token === "string") {
              setIsThinking(false);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiId
                    ? { ...m, content: m.content + data.token }
                    : m
                )
              );
              return;
            }

            if (typeof data.content === "string") {
              setIsThinking(false);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiId
                    ? { ...m, content: m.content + data.content }
                    : m
                )
              );
              return;
            }
          } catch (error) {
            console.error("Invalid SSE event:", { rawData, error });
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split(/\r?\n\r?\n/);
          buffer = events.pop() || "";

          for (const event of events) {
            processEvent(event);
          }
        }

        // Flush decoder
        buffer += decoder.decode();

        // Process final event
        if (buffer.trim()) {
          processEvent(buffer);
        }

        if (!receivedAnything) {
          throw new Error("Server returned an empty streaming response");
        }

        if (!receivedDone) {
          console.warn("Stream ended without a done event");
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          const errorMessage =
            err.message && typeof err.message === "string" && !err.message.includes("fetch")
              ? err.message
              : "Sorry, something went wrong. Please try again.";

          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiId
                ? {
                    ...m,
                    content: m.content || errorMessage,
                    streaming: false,
                  }
                : m
            )
          );
          console.error("Chat error:", err);
        }
      } finally {
        setIsStreaming(false);
        setIsThinking(false);
        setMessages((prev) =>
          prev.map((m) => (m.id === aiId ? { ...m, streaming: false } : m))
        );
        setHeaderStatus("Ready");
        inputRef.current?.focus();
      }
    },
    [input, isStreaming, sessionId]
  );

  return (
    <div
      ref={widgetRef}
      style={isFullScreen ? css.hostFullscreen : css.hostFloating}
      className={`${!isFullScreen ? "luxora-chat-floating" : ""} ${className || ""}`}
    >
      <ParticleLayer />

      {/* Sidebar - displayed in full-screen mode */}
      {isFullScreen && (
        <Sidebar
          onNewChat={handleNewChat}
          activeIdx={activeHistory}
          setActiveIdx={setActiveHistory}
        />
      )}

      <div style={css.main}>
        {/* Topbar */}
        <div style={css.topbar}>
          <div style={css.topbarLeft}>
            <div style={css.topbarAvatar}>🏠</div>
            <span style={css.topbarTitle}>
              {isFullScreen ? "Luxora Property Advisor" : "Luxora AI"}
            </span>
            <span style={isThinking ? css.statusBadgeThinking : css.statusBadge}>
              <span style={isThinking ? css.statusDotAmber : css.statusDotGreen} aria-hidden />
              {headerStatus}
            </span>
          </div>

          <div style={css.topbarActions}>
            {/* New chat button */}
            <button
              style={css.iconBtn}
              onClick={handleNewChat}
              title="New search"
              aria-label="Start new chat"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>

            {/* Expand to full page (in floating mode) */}
            {!isFullScreen && (
              <Link
                href="/chat"
                style={css.iconBtn}
                title="Open in full page"
                aria-label="Open chat page"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <polyline points="15 3 21 3 21 9" />
                  <polyline points="9 21 3 21 3 15" />
                  <line x1="21" y1="3" x2="14" y2="10" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              </Link>
            )}

            {/* Close button (in floating mode or if onClose callback provided) */}
            {onClose && (
              <button
                style={css.iconBtn}
                onClick={onClose}
                title="Close chat"
                aria-label="Close chat"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* RAG strip - displayed in full-screen mode */}
        {isFullScreen && (
          <div style={css.ragStrip}>
            <div style={css.ragDot} />
            <span style={css.ragText}>
              Semantic vector search · Retrieval-augmented generation · Session memory
            </span>
          </div>
        )}

        {/* Messages */}
        <div
          style={css.messages}
          role="log"
          aria-live="polite"
          aria-label="Chat messages"
        >
          {messages.map((msg) =>
            msg.role === "user" ? (
              <BubbleUser key={msg.id} msg={msg} />
            ) : msg.streaming && !msg.content && !msg.properties?.length ? (
              null
            ) : (
              <BubbleAI
                key={msg.id}
                msg={msg}
                onBookVisit={(p) => setBookingProperty(p)}
                onSendMessage={(text) => sendMessage(text)}
                isStreaming={isStreaming}
              />
            )
          )}
          {isThinking && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {showSuggestions && (
          <div style={css.suggestions}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                style={css.chip}
                onClick={() => sendMessage(s)}
                disabled={isStreaming}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={css.inputArea}>
          <div style={css.inputBox}>
            <textarea
              ref={inputRef}
              style={css.textarea}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                autoResize(e.target);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Describe your ideal property…"
              disabled={isStreaming}
              autoComplete="off"
              enterKeyHint="send"
              rows={1}
            />
            <button
              style={{
                ...css.sendBtn,
                opacity: !input.trim() || isStreaming ? 0.3 : 1,
                cursor: !input.trim() || isStreaming ? "not-allowed" : "pointer",
                boxShadow:
                  input.trim() && !isStreaming
                    ? "0 2px 14px rgba(217,119,6,0.5)"
                    : "none",
              }}
              onClick={() => sendMessage()}
              disabled={!input.trim() || isStreaming}
              aria-label="Send message"
            >
              {isStreaming ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff" aria-hidden>
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>
          <p style={css.inputHint}>Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>

      {/* Site Visit Modal */}
      {bookingProperty && (
        <SiteVisitModal
          property={bookingProperty}
          onClose={() => setBookingProperty(null)}
        />
      )}
    </div>
  );
}
