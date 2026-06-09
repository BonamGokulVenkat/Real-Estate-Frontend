"use client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ─── Types ────────────────────────────────────────────────────────────────────

interface PropertyMeta {
  property_id: string;
  title: string;
  price: number;
  city: string;
  locality?: string;
  property_type: string;
  bedrooms?: number;
  size_sqft?: number;
  score: number;
  media?: { url: string }[];
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  properties?: PropertyMeta[];
  streaming?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  const n = Number(price);
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)} Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

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
html, body { margin: 0 !important; padding: 0 !important; height: 100%; overflow: hidden; }
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
  host: {
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
    padding: "0 20px",
    flexShrink: 0,
    background: "rgba(13,21,38,0.95)",
    backdropFilter: "blur(8px)",
  },
  topbarLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
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
    fontSize: "14px",
    fontWeight: 600,
    color: T.textPri,
    letterSpacing: "-0.2px",
  },
  statusBadge: {
    fontSize: "10px",
    background: "rgba(34,197,94,0.1)",
    color: T.greenLight,
    border: "0.5px solid rgba(34,197,94,0.3)",
    borderRadius: "999px",
    padding: "3px 10px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontWeight: 500,
  },
  statusBadgeThinking: {
    fontSize: "10px",
    background: "rgba(217,119,6,0.1)",
    color: "#fbbf24",
    border: "0.5px solid rgba(217,119,6,0.3)",
    borderRadius: "999px",
    padding: "3px 10px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontWeight: 500,
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

  // ── RAG strip ─────────────────────────────────────────────────────────────
  ragStrip: {
    padding: "5px 20px",
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
    padding: "20px 20px 8px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    scrollbarWidth: "thin" as const,
  },
  msgRowAi: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "8px",
    animation: "fadeSlideUp 0.25s ease-out",
  },
  msgRowUser: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "6px",
    animation: "fadeSlideUp 0.25s ease-out",
  },
  msgMeta: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "11px",
    color: T.textMuted,
  },
  aiAvatarSm: {
    width: "26px",
    height: "26px",
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
    maxWidth: "82%",
    padding: "12px 16px",
    fontSize: "13.5px",
    lineHeight: 1.65,
    whiteSpace: "pre-wrap" as const,
    wordBreak: "break-word" as const,
    background: T.bgCard,
    border: `0.5px solid ${T.border}`,
    borderRadius: "4px 14px 14px 14px",
    color: T.textPri,
  },
  bubbleUser: {
    maxWidth: "82%",
    padding: "11px 16px",
    fontSize: "13.5px",
    lineHeight: 1.65,
    whiteSpace: "pre-wrap" as const,
    wordBreak: "break-word" as const,
    background: "linear-gradient(135deg, #D97706, #B45309)",
    borderRadius: "14px 14px 4px 14px",
    color: "#fff",
    boxShadow: "0 4px 20px rgba(217,119,6,0.3)",
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
    scrollbarWidth: "none" as const,
  },
  propCard: {
    minWidth: "152px",
    maxWidth: "152px",
    background: T.bgCard2,
    border: `0.5px solid ${T.border}`,
    borderRadius: "14px",
    overflow: "hidden",
    flexShrink: 0,
    cursor: "pointer",
    textDecoration: "none",
    display: "block",
    color: "inherit",
    transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
    animation: "cardFloat 4s ease-in-out infinite",
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
    padding: "14px 18px",
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
    gap: "7px",
    flexWrap: "wrap" as const,
    padding: "4px 20px 10px",
    flexShrink: 0,
  },
  chip: {
    fontSize: "11.5px",
    padding: "6px 13px",
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

  // ── Input ─────────────────────────────────────────────────────────────────
  inputArea: {
    borderTop: `0.5px solid ${T.border}`,
    padding: "12px 20px 14px",
    background: T.bgPanel,
    flexShrink: 0,
  },
  inputBox: {
    display: "flex",
    alignItems: "flex-end",
    gap: "10px",
    background: T.bgCard,
    border: `0.5px solid ${T.border}`,
    borderRadius: "14px",
    padding: "10px 12px",
    transition: "border-color 0.2s",
  },
  textarea: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    fontSize: "13.5px",
    color: T.textPri,
    fontFamily: "inherit",
    resize: "none" as const,
    lineHeight: 1.5,
    maxHeight: "120px",
    minHeight: "22px",
    height: "22px",
  },
  sendBtn: {
    width: "34px",
    height: "34px",
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
    fontSize: "10.5px",
    color: T.textMuted,
    marginTop: "7px",
    textAlign: "center" as const,
  },
};

// ─── Ambient Particles ────────────────────────────────────────────────────────

function ParticleLayer() {
  const [mounted, setMounted] = useState(false);

  const particles = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        dx: (Math.random() - 0.5) * 80,
        dy: -(Math.random() * 60 + 20),
        delay: Math.random() * 6,
        dur: 5 + Math.random() * 5,
        opacity: 0.3 + Math.random() * 0.4,
      })),
    []
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent SSR render
  if (!mounted) return null;

  return (
    <div style={css.particleLayer}>
      {particles.map((p) => (
        <div
          key={p.id}
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

function PropertyCard({ p, index }: { p: PropertyMeta; index: number }) {
  const score = Math.round((p.score || 0) * 100);
  const thumb = p.media?.[0]?.url;
  const cardDelay = index * 0.15;

  return (
    <Link
      href={`/property/${p.property_id}`}
      style={{ ...css.propCard, animationDelay: `${cardDelay}s` }}
      prefetch={false}
      scroll={false}
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
        <p style={css.propTitle}>{p.title}</p>
        <p style={css.propLoc}>📍 {[p.locality, p.city].filter(Boolean).join(", ")}</p>
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
      </div>
    </Link>
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

function BubbleAI({ msg }: { msg: Message }) {
  return (
    <div style={css.msgRowAi}>
      {(msg.properties?.length ?? 0) > 0 && (
        <>
          <div style={css.featuredLabel}>✦ Featured Matches</div>
          <div style={css.propRow}>
            {msg.properties!.map((p, i) => (
              <PropertyCard key={p.property_id} p={p} index={i} />
            ))}
          </div>
        </>
      )}
      <div style={css.msgMeta}>
        <div style={css.aiAvatarSm}>🏠</div>
        <span>Luxora AI</span>
      </div>
      <div style={css.bubbleAi}>
        {msg.content}
        {msg.streaming && (
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
            aria-hidden
          />
        )}
      </div>
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

export default function PropertyChatWidget() {
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

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = KEYFRAMES;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

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
        { id: aiId, role: "assistant", content: "", properties: [], streaming: true },
      ]);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        setHeaderStatus("Generating embedding…");

        const res = await fetch(`${API_URL}/rag/recommend`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: query, sessionId }),
          signal: controller.signal,
        });

        const newSession = res.headers.get("x-session-id");
        if (newSession) setSessionId(newSession);

        setHeaderStatus("Searching vector database…");

        const reader  = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "properties") {
                setHeaderStatus("Generating recommendation…");
                setIsThinking(false);
                setMessages((prev) =>
                  prev.map((m) => m.id === aiId ? { ...m, properties: data.properties } : m)
                );
              } else if (data.type === "done") {
                setMessages((prev) =>
                  prev.map((m) => m.id === aiId ? { ...m, streaming: false } : m)
                );
              } else if (data.token) {
                setIsThinking(false);
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiId ? { ...m, content: m.content + data.token } : m
                  )
                );
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiId
                ? { ...m, content: "Sorry, something went wrong. Please try again.", streaming: false }
                : m
            )
          );
        }
      } finally {
        setIsStreaming(false);
        setIsThinking(false);
        setMessages((prev) =>
          prev.map((m) => m.id === aiId ? { ...m, streaming: false } : m)
        );
        setHeaderStatus("Ready");
        inputRef.current?.focus();
      }
    },
    [input, isStreaming, sessionId]
  );

  return (
    <div style={css.host}>
      <ParticleLayer />

      <Sidebar
        onNewChat={handleNewChat}
        activeIdx={activeHistory}
        setActiveIdx={setActiveHistory}
      />

      <div style={css.main}>
        {/* Topbar */}
        <div style={css.topbar}>
          <div style={css.topbarLeft}>
            <div style={css.topbarAvatar}>🏠</div>
            <span style={css.topbarTitle}>Luxora Property Advisor</span>
            <span style={isThinking ? css.statusBadgeThinking : css.statusBadge}>
              <span style={isThinking ? css.statusDotAmber : css.statusDotGreen} aria-hidden />
              {headerStatus}
            </span>
          </div>
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: T.textMuted,
              padding: "6px",
              display: "flex",
              alignItems: "center",
              borderRadius: "8px",
            }}
            onClick={handleNewChat}
            title="New chat"
            aria-label="Start new chat"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>

        {/* RAG strip */}
        <div style={css.ragStrip}>
          <div style={css.ragDot} />
          <span style={css.ragText}>
            Semantic vector search · Retrieval-augmented generation · Session memory
          </span>
        </div>

        {/* Messages */}
        <div
          style={css.messages}
          role="log"
          aria-live="polite"
          aria-label="Chat messages"
        >
          {messages.map((msg) =>
              msg.role === "user"
                ? <BubbleUser key={msg.id} msg={msg} />
                : (msg.streaming && !msg.content && !msg.properties?.length)
                  ? null
                  : <BubbleAI key={msg.id} msg={msg} />
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff" aria-hidden>
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>
          <p style={css.inputHint}>Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}