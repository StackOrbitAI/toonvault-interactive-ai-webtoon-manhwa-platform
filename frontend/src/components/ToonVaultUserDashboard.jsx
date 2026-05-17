import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { api, getStoredUser, logout } from "../api";
import AIStoryWizard from "./AIStoryWizard";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// ═══════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════
const C = {
  bg: "#0C0A14",
  surface: "#13101F",
  surfaceHover: "#1A1628",
  card: "#1A1628",
  cardBorder: "#2A2240",
  glass: "rgba(255,255,255,0.04)",
  glassBorder: "rgba(255,255,255,0.08)",
  plum: "#8B5CF6",
  plumLight: "#A78BFA",
  plumDark: "#6D28D9",
  plumGlow: "rgba(139,92,246,0.35)",
  rose: "#F472B6",
  roseGlow: "rgba(244,114,182,0.3)",
  gold: "#F59E0B",
  goldLight: "#FCD34D",
  cyan: "#22D3EE",
  cyanGlow: "rgba(34,211,238,0.25)",
  green: "#10B981",
  orange: "#F97316",
  text: "#F1EEF9",
  textMuted: "#9CA3AF",
  textDim: "#6B7280",
  ink: "#0C0A14",
  gradient: "linear-gradient(135deg, #8B5CF6 0%, #F472B6 100%)",
  gradientGold: "linear-gradient(135deg, #F59E0B 0%, #F97316 100%)",
};

// ═══════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════
const NAV_ITEMS = [
  { id: "public_home", icon: "🌐", label: "Public Homepage" },
  { id: "home", icon: "⬡", label: "Home" },
  { id: "stories", icon: "📖", label: "My Stories" },
  { id: "reading", icon: "👁", label: "Reading" },
  { id: "ai", icon: "✦", label: "AI Studio" },
  { id: "analytics", icon: "◈", label: "Analytics" },
  { id: "wallet", icon: "◎", label: "Wallet" },
  { id: "settings", icon: "⚙", label: "Settings" },
];

const STORIES_DATA = [
  { id: 1, title: "Crimson Throne", genre: "Romance Fantasy", cover: "💖", views: "28.8M", rating: "4.9", status: "Publishing", chapters: 124, bg: "#2D0A2A", earned: "$2,840", trend: "+12%" },
  { id: 2, title: "The Shadow Pact", genre: "Fantasy", cover: "🌙", views: "9.8M", rating: "4.8", status: "Draft", chapters: 48, bg: "#0D0A2E", earned: "$1,240", trend: "+7%" },
  { id: 3, title: "My Wavering Heart", genre: "Drama", cover: "🌊", views: "15.1K", rating: "4.7", status: "Hiatus", chapters: 22, bg: "#0A1A2E", earned: "$340", trend: "-2%" },
  { id: 4, title: "Primal Accord", genre: "Action Fantasy", cover: "⚔️", views: "7.7M", rating: "4.6", status: "Publishing", chapters: 89, bg: "#1A0D00", earned: "$980", trend: "+18%" },
  { id: 5, title: "Duchess Reborn", genre: "Romance Fantasy", cover: "👑", views: "2M", rating: "4.9", status: "Completed", chapters: 200, bg: "#0A200A", earned: "$5,600", trend: "+3%" },
  { id: 6, title: "Villain's Beloved", genre: "Dark Romance", cover: "🌹", views: "10.1M", rating: "4.8", status: "Publishing", chapters: 67, bg: "#2D0A15", earned: "$1,890", trend: "+22%" },
];

const READING_LIST = [
  { id: 1, title: "Wolf's Lullaby", genre: "GL Fantasy", cover: "🐺", progress: 78, chapter: "Ch. 89 / 114", bg: "#1A1240" },
  { id: 2, title: "Stray Signal", genre: "Sci-Fi", cover: "🛸", progress: 45, chapter: "Ch. 42 / 93", bg: "#081828" },
  { id: 3, title: "Iron Saint", genre: "Superhero", cover: "⚡", progress: 92, chapter: "Ch. 106 / 115", bg: "#1A1000" },
  { id: 4, title: "Last Frequency", genre: "BL Romance", cover: "📻", progress: 23, chapter: "Ch. 14 / 61", bg: "#1A0A28" },
  { id: 5, title: "Farm of Forgotten", genre: "Romance Fantasy", cover: "🌻", progress: 60, chapter: "Ch. 52 / 87", bg: "#0A1A08" },
  { id: 6, title: "Soft Apocalypse", genre: "Slice of Life", cover: "🌿", progress: 15, chapter: "Ch. 9 / 58", bg: "#081A0A" },
];

const ACHIEVEMENTS = [
  { icon: "🔥", label: "7-Day Streak", sub: "Read 7 days in a row", earned: true, color: "#F97316" },
  { icon: "📖", label: "Bookworm", sub: "Read 100+ chapters", earned: true, color: "#8B5CF6" },
  { icon: "⭐", label: "Top Reviewer", sub: "50+ ratings given", earned: true, color: "#F59E0B" },
  { icon: "✍️", label: "Author Debut", sub: "Published 1st story", earned: true, color: "#10B981" },
  { icon: "💎", label: "Gold Member", sub: "Upgrade to Gold", earned: false, color: "#F59E0B" },
  { icon: "🏆", label: "Top 100", sub: "Reach Top 100 rankings", earned: false, color: "#F472B6" },
  { icon: "🌟", label: "Viral Story", sub: "1M+ views on a story", earned: false, color: "#22D3EE" },
  { icon: "👥", label: "Team Builder", sub: "Create a writing team", earned: false, color: "#8B5CF6" },
];

const AI_TOOLS = [
  { icon: "🎨", label: "Panel Generator", desc: "Create manga-style panels", uses: 11, max: 20, color: C.plum },
  { icon: "🎀", label: "Manta Creator", desc: "Premium vertical-strip stories", uses: 0, max: 5, color: C.rose },
  { icon: "✍️", label: "Quotes & Wisdom", desc: "Aesthetic quotes with images", uses: 0, max: 50, color: "#A78BFA" },
  { icon: "🎭", label: "Character Design", desc: "Design unique characters", uses: 4, max: 10, color: C.cyan },
  { icon: "🗺️", label: "World Builder", desc: "Generate rich settings", uses: 2, max: 5, color: C.gold },
];

const TRANSACTIONS = [
  { date: "Apr 28", label: "Crimson Throne — Royalties", amount: "+$128.00", type: "income" },
  { date: "Apr 25", label: "Silver Plan Renewal", amount: "-$0.42", type: "expense" },
  { date: "Apr 22", label: "Villain's Beloved — Royalties", amount: "+$89.50", type: "income" },
  { date: "Apr 20", label: "Primal Accord — Royalties", amount: "+$54.20", type: "income" },
  { date: "Apr 18", label: "AI Panel Credits (50 pack)", amount: "-$4.99", type: "expense" },
  { date: "Apr 15", label: "Duchess Reborn — Royalties", amount: "+$210.00", type: "income" },
];

const WEEKLY_STATS = [
  { day: "Mon", views: 42, reads: 28 },
  { day: "Tue", views: 68, reads: 45 },
  { day: "Wed", views: 55, reads: 38 },
  { day: "Thu", views: 94, reads: 71 },
  { day: "Fri", views: 118, reads: 89 },
  { day: "Sat", views: 145, reads: 112 },
  { day: "Sun", views: 97, reads: 76 },
];

// ═══════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════
function Badge({ children, color = C.plum, bg }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
      background: bg || color + "22", color,
      border: `1px solid ${color}40`,
    }}>{children}</span>
  );
}

function GlassCard({ children, style = {}, glow, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? C.surfaceHover : C.card,
        border: `1px solid ${hover ? C.plum + "50" : C.cardBorder}`,
        borderRadius: 18,
        transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: hover && glow ? `0 0 30px ${C.plumGlow}` : "none",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >{children}</div>
  );
}

function ProgressBar({ value, max, color = C.plum, thin }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ background: C.glassBorder, borderRadius: 99, overflow: "hidden", height: thin ? 4 : 8 }}>
      <div style={{
        width: `${pct}%`, height: "100%", borderRadius: 99,
        background: `linear-gradient(90deg, ${color}, ${color}CC)`,
        boxShadow: `0 0 8px ${color}80`,
        transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
      }} />
    </div>
  );
}

function StatPill({ icon, label, value, color = C.plum }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 16px", borderRadius: 12,
      background: color + "12", border: `1px solid ${color}30`,
    }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 18, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TOP NAV
// ═══════════════════════════════════════════════════════
function TopNav({ page, setPage, user = {}, onMenuClick, setShowWizard }) {
  const [notifs, setNotifs] = useState(3);
  const avatarLetter = (user.username || user.name || "U")[0].toUpperCase();
  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      height: 62,
      background: "rgba(12,10,20,0.85)",
      backdropFilter: "blur(20px)",
      borderBottom: `1px solid ${C.cardBorder}`,
      display: "flex", alignItems: "center",
      padding: "0 20px 0 0",
      gap: 0,
    }}>
      <div className="logo-container" onClick={() => window.location.href = '/'} style={{
        width: 240, flexShrink: 0,
        display: "flex", alignItems: "center", gap: 10,
        padding: "0 20px",
        cursor: "pointer",
        borderRight: `1px solid ${C.cardBorder}`,
        height: "100%",
        background: `linear-gradient(to bottom, ${C.surface}40, transparent)`
      }}>
        <button className="show-mobile" onClick={(e) => { e.stopPropagation(); onMenuClick(); }} style={{ display: "none", background: "none", border: "none", color: C.plumLight, fontSize: 20, cursor: "pointer", marginRight: 8 }}>☰</button>
        <div style={{
          width: 36, height: 36, borderRadius: 11,
          background: C.gradient,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, boxShadow: `0 4px 15px ${C.plumGlow}`,
        }}>📖</div>
        <div style={{ display: "flex", flexDirection: "column", marginLeft: 4 }}>
          <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.8, color: "white", lineHeight: 1.1 }}>
            Toon<span style={{ color: C.rose }}>Vault</span>
          </span>
          <span style={{ fontSize: 8, color: C.plumLight, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase" }}>Dashboard</span>
        </div>
      </div>

      {/* Center breadcrumb */}
      <div style={{ flex: 1, padding: "0 24px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: C.textDim, fontSize: 13 }}>Dashboard</span>
        <span style={{ color: C.textDim, fontSize: 13 }}>›</span>
        <span style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>
          {NAV_ITEMS.find(n => n.id === page)?.label || "Home"}
        </span>
      </div>

      {/* Right actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Publish Button */}
        <button 
          onClick={() => { setShowWizard(true); }}
          className="publish-btn hide-mobile"
          style={{
            padding: "8px 18px", borderRadius: 12,
            background: C.gradient, border: "none", color: "white",
            fontSize: 13, fontWeight: 800, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8,
            boxShadow: `0 4px 15px ${C.plumGlow}`,
            transition: "all 0.2s",
            animation: "pulse 2s infinite",
          }}
        >
          <span style={{ fontSize: 16 }}>✨</span>
          Publish New Story
        </button>

        {/* Coins & Streak (Hide on small mobile) */}
        <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 20,
            background: C.gold + "18", border: `1px solid ${C.gold}40`,
          }}>
            <span style={{ fontSize: 15 }}>🪙</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.goldLight }}>{(user.coins || 0).toLocaleString()}</span>
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "7px 12px", borderRadius: 20,
            background: C.orange + "18", border: `1px solid ${C.orange}40`,
          }}>
            <span style={{ fontSize: 15 }}>🔥</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.orange }}>{user.streak || 0}d</span>
          </div>
        </div>

        {/* Notifications */}
        <div style={{ position: "relative" }}>
          <button onClick={() => setNotifs(0)} style={{
            width: 38, height: 38, borderRadius: 10,
            background: C.glass, border: `1px solid ${C.glassBorder}`,
            cursor: "pointer", fontSize: 17, display: "flex",
            alignItems: "center", justifyContent: "center", color: C.textMuted,
          }}>🔔</button>
          {notifs > 0 && (
            <div style={{
              position: "absolute", top: 4, right: 4,
              width: 16, height: 16, borderRadius: "50%",
              background: C.rose, border: `2px solid ${C.bg}`,
              fontSize: 9, fontWeight: 800, color: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{notifs}</div>
          )}
        </div>

        {/* Avatar */}
        <div title={user.username} style={{
          width: 38, height: 38, borderRadius: 10,
          background: C.gradient,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, cursor: "pointer",
          boxShadow: `0 0 16px ${C.plumGlow}`,
          fontWeight: 800, color: "white",
        }}>{avatarLetter}</div>

        {/* Desktop & Mobile Logout */}
        <button onClick={() => logout()} style={{
          display: "flex", alignItems: "center", gap: 6,
          height: 38, padding: "0 14px", borderRadius: 10,
          background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
          color: "#EF4444", cursor: "pointer", fontSize: 13, fontWeight: 700,
          transition: "all 0.2s"
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.25)"; e.currentTarget.style.transform = "scale(1.05)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.transform = "scale(1)"; }}
        >
          <span style={{ fontSize: 16 }}>🚪</span> 
          <span className="hide-mobile">Logout</span>
        </button>
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════════════════
function Sidebar({ page, setPage, user = {}, navigate, onLinkClick }) {
  return (
    <aside style={{
      position: "fixed", top: 62, left: 0, bottom: 0,
      width: 240,
      background: C.surface,
      borderRight: `1px solid ${C.cardBorder}`,
      display: "flex", flexDirection: "column",
      zIndex: 900,
      overflowY: "auto",
      overflowX: "hidden",
    }}>
      {/* Plan Badge */}
      <div style={{ padding: "16px 14px 0" }}>
        <div style={{
          borderRadius: 14,
          background: "linear-gradient(135deg, #2A1A4A 0%, #1A0A2E 100%)",
          border: `1px solid ${C.plum}40`,
          padding: "14px 16px",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", right: -20, top: -20,
            width: 80, height: 80, borderRadius: "50%",
            background: C.plumGlow, filter: "blur(20px)",
          }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 20 }}>⬡</span>
            <div>
              <div style={{ fontSize: 11, color: C.textDim, fontWeight: 600, letterSpacing: 0.5 }}>CURRENT PLAN</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.plumLight }}>{user.plan || "Free"}</div>
            </div>
            <Badge color={C.green}>ACTIVE</Badge>
          </div>
          <ProgressBar value={user.articlesGenerated || 0} max={user.plan === "Gold" ? 200 : user.plan === "Silver" ? 100 : user.plan === "Bronze" ? 50 : 10} color={C.plumLight} thin />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: C.textDim }}>
            <span>{user.articlesGenerated || 0} articles used</span>
            <span>{user.storiesRead || 0} read</span>
          </div>
          {user.plan !== "Gold" && (
            <button onClick={() => setPage("plans")} style={{
              width: "100%", marginTop: 10, padding: "8px",
              background: C.gradient, border: "none", borderRadius: 10,
              fontSize: 12, fontWeight: 700, color: "white", cursor: "pointer",
              boxShadow: `0 4px 16px ${C.plumGlow}`,
            }}>✦ Upgrade to Gold</button>
          )}
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{ padding: "16px 10px", flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const active = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { 
                if (item.id === "public_home") {
                  window.location.href = '/';
                } else {
                  setPage(item.id); 
                  if(onLinkClick) onLinkClick(); 
                }
              }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", borderRadius: 12, marginBottom: 3,
                background: active ? C.plum + "22" : "transparent",
                border: active ? `1px solid ${C.plum}50` : "1px solid transparent",
                color: active ? C.plumLight : C.textMuted,
                cursor: "pointer", transition: "all 0.18s",
                textAlign: "left",
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = C.glass; e.currentTarget.style.color = C.text; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textMuted; } }}
            >
              <span style={{ fontSize: 17, width: 22, textAlign: "center" }}>{item.icon}</span>
              <span style={{ fontSize: 14, fontWeight: active ? 600 : 400 }}>{item.label}</span>
              {item.id === "ai" && (
                <span style={{
                  marginLeft: "auto", fontSize: 9, fontWeight: 800,
                  background: C.gradient, color: "white",
                  padding: "2px 7px", borderRadius: 8,
                }}>NEW</span>
              )}
            </button>
          );
        })}
        {user.role === "admin" && (
          <button
            onClick={() => window.location.href = "/dashboard"}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 12,
              padding: "10px 14px", borderRadius: 12, marginBottom: 3,
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.3)",
              color: "#F59E0B",
              cursor: "pointer", transition: "all 0.18s",
              textAlign: "left", marginTop: 10,
            }}
          >
            <span style={{ fontSize: 17, width: 22, textAlign: "center" }}>🛡️</span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Admin Panel</span>
          </button>
        )}
      </nav>

      {/* Bottom Footer Area */}
      <div style={{ padding: "16px", borderTop: `1px solid ${C.cardBorder}`, background: `linear-gradient(to top, rgba(139,92,246,0.05), transparent)` }}>
        <button onClick={() => setPage("ai")} style={{
          width: "100%", padding: "12px",
          background: "rgba(139,92,246,0.1)",
          border: `1px solid ${C.plum}40`,
          borderRadius: 12, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          color: C.plumLight, fontSize: 13, fontWeight: 700, transition: "all 0.2s",
          marginBottom: 10
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(139,92,246,0.2)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(139,92,246,0.1)"; }}
        >
          <span style={{ fontSize: 18 }}>✨</span> AI Story Wizard
        </button>
        
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 4px" }}>
           <div style={{ width: 34, height: 34, borderRadius: 10, background: C.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "white" }}>
             {user?.username ? user.username[0].toUpperCase() : 'U'}
           </div>
           <div style={{ flex: 1, minWidth: 0 }}>
             <div style={{ fontSize: 12, fontWeight: 700, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.username || 'User'}</div>
             <div style={{ fontSize: 10, color: C.textDim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email || 'user@toonvault.com'}</div>
           </div>

        </div>
      </div>
    </aside>
  );
}

// ═══════════════════════════════════════════════════════
// HOME PAGE
// ═══════════════════════════════════════════════════════
function HomePage({ setPage, user = {}, myStories = [], allStories = [] }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const publishingCount = (myStories || []).filter(s => s.status === "Live").length;
  const totalViews = (myStories || []).reduce((sum, s) => sum + (s.views || 0), 0);
  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        borderRadius: 22,
        background: "linear-gradient(135deg, #1A0A2E 0%, #2D0A2A 50%, #0A1A2E 100%)",
        border: `1px solid ${C.plum}40`,
        padding: "28px 32px",
        marginBottom: 24,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", right: -40, top: -60,
          width: 240, height: 240, borderRadius: "50%",
          background: C.plumGlow, filter: "blur(60px)",
        }} />
        <div style={{
          position: "absolute", right: 160, bottom: -40,
          width: 160, height: 160, borderRadius: "50%",
          background: C.roseGlow, filter: "blur(40px)",
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 13, color: C.textDim, marginBottom: 6 }}>{greeting} ✦</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: C.text, margin: "0 0 8px", letterSpacing: -0.5 }}>
            Welcome back, <span style={{ background: C.gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{user.username || "Creator"}</span>
          </h1>
          <p style={{ fontSize: 14, color: C.textMuted, margin: "0 0 20px" }}>
            You have <strong style={{ color: C.plumLight }}>{(myStories || []).length}</strong> stories · <strong style={{ color: C.green }}>{publishingCount}</strong> live · <strong style={{ color: C.cyan }}>{(user.plan || "Free")}</strong> plan
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button 
              onClick={() => setPage('ai')}
              style={{
                padding: "12px 28px", borderRadius: 24,
                background: C.gradient, border: "none",
                color: "white", fontSize: 15, fontWeight: 800, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 10,
                boxShadow: `0 10px 30px ${C.plumGlow}`,
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 15px 40px ${C.plumGlow}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 10px 30px ${C.plumGlow}`; }}
            >
              <span style={{ fontSize: 20 }}>✨</span> Publish New Story
            </button>

            {[
              { label: "Continue Reading", icon: "▶", color: C.plum, action: () => setPage("reading") },
              { label: "New Chapter", icon: "✍️", color: C.rose, action: () => setPage("stories") },
              { label: "AI Studio", icon: "✦", color: C.cyan, action: () => setPage("ai") },
            ].map(btn => (
              <button key={btn.label} onClick={btn.action} style={{
                padding: "12px 22px", borderRadius: 24,
                background: btn.color + "15", border: `1px solid ${btn.color}40`,
                color: btn.color, fontSize: 14, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = btn.color + "25"}
                onMouseLeave={e => e.currentTarget.style.background = btn.color + "15"}
              >
                <span>{btn.icon}</span> {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { icon: "👁", label: "Total Views", value: totalViews > 1000000 ? (totalViews/1000000).toFixed(1)+"M" : totalViews > 1000 ? (totalViews/1000).toFixed(1)+"K" : String(totalViews), color: C.plum, delta: (myStories || []).length + " stories total" },
          { icon: "📖", label: "My Stories", value: String((myStories || []).length), color: C.rose, delta: publishingCount + " live" },
          { icon: "🪙", label: "Coins", value: (user.coins || 0).toLocaleString(), color: C.gold, delta: user.plan + " plan" },
          { icon: "🔥", label: "Streak", value: (user.streak || 0) + " days", color: C.orange, delta: user.storiesRead + " stories read" },
        ].map(stat => (
          <GlassCard key={stat.label} style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 12, color: C.textDim, marginBottom: 8, fontWeight: 500 }}>{stat.icon} {stat.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: stat.color, letterSpacing: -0.5 }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: C.green, marginTop: 4 }}>{stat.delta}</div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Main Content Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
        {/* Left: Chart + Recent */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Views Chart */}
          <GlassCard style={{ padding: "22px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Weekly Views</div>
                <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>Apr 21 — Apr 28, 2026</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {["7D", "1M", "3M"].map((t, i) => (
                  <button key={t} style={{
                    padding: "5px 12px", borderRadius: 10, border: "none", cursor: "pointer",
                    background: i === 0 ? C.plum + "30" : "transparent",
                    color: i === 0 ? C.plumLight : C.textDim, fontSize: 12, fontWeight: 600,
                  }}>{t}</button>
                ))}
              </div>
            </div>
            {/* Mini Chart */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100 }}>
              {WEEKLY_STATS.map((s, i) => {
                const max = 145;
                const vH = (s.views / max) * 100;
                const rH = (s.reads / max) * 100;
                return (
                  <div key={s.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    <div style={{ width: "100%", display: "flex", gap: 2, alignItems: "flex-end", height: 80 }}>
                      <div style={{
                        flex: 1, height: `${vH}%`, borderRadius: "4px 4px 0 0",
                        background: `linear-gradient(to top, ${C.plum}, ${C.plumLight})`,
                        opacity: 0.9,
                      }} />
                      <div style={{
                        flex: 1, height: `${rH}%`, borderRadius: "4px 4px 0 0",
                        background: `linear-gradient(to top, ${C.rose}, ${C.rose}AA)`,
                        opacity: 0.7,
                      }} />
                    </div>
                    <div style={{ fontSize: 10, color: C.textDim }}>{s.day}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: C.plum }} />
                <span style={{ fontSize: 11, color: C.textDim }}>Views</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: C.rose }} />
                <span style={{ fontSize: 11, color: C.textDim }}>Reads</span>
              </div>
            </div>
          </GlassCard>

          {/* Top Stories */}
          <GlassCard style={{ padding: "22px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Top Performing Stories</div>
              <button onClick={() => setPage("stories")} style={{ fontSize: 12, color: C.plumLight, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>View all →</button>
            </div>
            {( (myStories && myStories.length > 0) ? myStories : STORIES_DATA).slice(0, 4).map((s, i) => (
              <div key={s._id || s.id} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 0",
                borderBottom: i < 3 ? `1px solid ${C.cardBorder}` : "none",
              }}>
                <div style={{ fontSize: 22, width: 32, textAlign: "center" }}>{["🥇", "🥈", "🥉", "4"][i]}</div>
                <div style={{
                  width: 40, height: 50, borderRadius: 8, flexShrink: 0,
                  background: s.bg, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 20, overflow: "hidden"
                }}>
                  {s.panels && s.panels[0] ? <img src={s.panels[0]} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (s.cover || "📖")}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{s.genre} · {s.panels?.length || 0} panels</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.plumLight }}>{s.views}</div>
                  <div style={{ fontSize: 11, color: (s.trend || "").startsWith("+") ? C.green : "#EF4444", marginTop: 2 }}>{s.trend || "0%"}</div>
                </div>
              </div>
            ))}
          </GlassCard>
        </div>

        {/* Right: Activity + Achievements */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Quick Actions */}
          <GlassCard style={{ padding: "20px" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 14 }}>Quick Actions</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { icon: "✍️", label: "New Chapter", color: C.plum },
                { icon: "✦", label: "AI Panel", color: C.rose },
                { icon: "📊", label: "Analytics", color: C.cyan, action: () => setPage("analytics") },
                { icon: "🪙", label: "Withdraw", color: C.gold, action: () => setPage("wallet") },
              ].map(a => (
                <button key={a.label} onClick={a.action} style={{
                  padding: "14px", borderRadius: 12,
                  background: a.color + "12", border: `1px solid ${a.color}30`,
                  cursor: "pointer", display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 6, transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = a.color + "25"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = a.color + "12"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <span style={{ fontSize: 22 }}>{a.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: a.color }}>{a.label}</span>
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Continue Reading */}
          <GlassCard style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Continue Reading</div>
              <button onClick={() => setPage("reading")} style={{ fontSize: 11, color: C.plumLight, background: "none", border: "none", cursor: "pointer" }}>See all →</button>
            </div>
            {READING_LIST.slice(0, 3).map(s => (
              <div key={s._id || s.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{
                  width: 36, height: 46, borderRadius: 8, flexShrink: 0,
                  background: s.bg, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 18, overflow: "hidden"
                }}>
                  {s.panels && s.panels[0] ? <img src={s.panels[0]} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (s.cover || "📖")}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                  <div style={{ fontSize: 10, color: C.textDim, marginBottom: 5 }}>{s.chapter}</div>
                  <ProgressBar value={s.progress} max={100} color={C.plumLight} thin />
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.plumLight }}>{s.progress}%</div>
              </div>
            ))}
          </GlassCard>

          {/* Recent Achievements */}
          <GlassCard style={{ padding: "20px" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 14 }}>Achievements</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {ACHIEVEMENTS.slice(0, 4).map(a => (
                <div key={a.label} style={{
                  padding: "12px", borderRadius: 12,
                  background: a.earned ? a.color + "12" : C.glass,
                  border: `1px solid ${a.earned ? a.color + "40" : C.glassBorder}`,
                  opacity: a.earned ? 1 : 0.5,
                }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{a.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: a.earned ? a.color : C.textDim }}>{a.label}</div>
                  <div style={{ fontSize: 10, color: C.textDim, marginTop: 2, lineHeight: 1.3 }}>{a.sub}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MY STORIES PAGE
// ═══════════════════════════════════════════════════════
function MyStoriesPage({ myStories = [], refreshStories, navigate }) {
  const [filter, setFilter] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newStory, setNewStory] = useState({ title: "", genre: "", description: "", type: "Comic" });
  const [deleting, setDeleting] = useState(null);
  const [genEp, setGenEp] = useState(null); // storyId
  const [showEpisodeModal, setShowEpisodeModal] = useState(false);
  const [selectedStoryForEpisode, setSelectedStoryForEpisode] = useState(null);
  const [episodePromptText, setEpisodePromptText] = useState("");
  const [generatingEpisode, setGeneratingEpisode] = useState(false);
  const filters = ["All", "Live", "Draft", "Pending", "Flagged"];

  const filtered = filter === "All" ? (myStories || []) : (myStories || []).filter(s => s.status === filter);
  const totalViews = (myStories || []).reduce((sum, s) => sum + (s.views || 0), 0);

  const handleCreate = async () => {
    if (!newStory.title.trim()) return;
    setCreating(true);
    try {
      await api.createStory(newStory);
      await refreshStories();
      setShowCreate(false);
      setNewStory({ title: "", genre: "", description: "", type: "Comic" });
    } catch (e) { alert("Failed to create story"); }
    finally { setCreating(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this story?")) return;
    setDeleting(id);
    try { await api.deleteStory(id); await refreshStories(); }
    catch (e) { alert("Failed to delete"); }
    finally { setDeleting(null); }
  };

  const handleAddEpisode = (s) => {
    setSelectedStoryForEpisode(s);
    setEpisodePromptText("");
    setShowEpisodeModal(true);
  };

  const submitGenerateEpisode = async () => {
    if (!selectedStoryForEpisode) return;
    const storyId = selectedStoryForEpisode._id || selectedStoryForEpisode.id;
    setGeneratingEpisode(true);
    setGenEp(storyId);
    try {
      await api.generateEpisode(storyId, episodePromptText);
      alert("Next episode generated successfully!");
      setShowEpisodeModal(false);
      if (refreshStories) await refreshStories();
    } catch (e) {
      alert("Failed: " + (e.response?.data?.error || e.message));
    } finally {
      setGeneratingEpisode(false);
      setGenEp(null);
    }
  };

  const statusColor = { Live: C.green, Draft: C.cyan, Pending: C.gold, Flagged: "#EF4444" };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: "0 0 4px" }}>My Stories</h2>
          <p style={{ fontSize: 13, color: C.textDim, margin: 0 }}>{myStories.length} stories total</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{
          padding: "10px 20px", borderRadius: 14,
          background: C.gradient, border: "none", color: "white",
          fontSize: 13, fontWeight: 700, cursor: "pointer",
          boxShadow: `0 4px 16px ${C.plumGlow}`,
        }}>✏️ New Story</button>
      </div>

      {/* Create Story Modal */}
      {showCreate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 24, padding: 32, width: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>✏️ Create New Story</div>
            {[{label:"Title",key:"title",type:"text"},{label:"Genre",key:"genre",type:"text"},{label:"Description",key:"description",type:"textarea"}].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: C.textDim, fontWeight: 700, letterSpacing: 0.5, display: "block", marginBottom: 6 }}>{f.label.toUpperCase()}</label>
                {f.type === "textarea" ? (
                  <textarea value={newStory[f.key]} onChange={e => setNewStory(p => ({...p,[f.key]:e.target.value}))} rows={3}
                    style={{ width: "100%", background: C.bg, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: "10px 14px", color: C.text, fontSize: 13, resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                ) : (
                  <input value={newStory[f.key]} onChange={e => setNewStory(p => ({...p,[f.key]:e.target.value}))}
                    style={{ width: "100%", background: C.bg, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: "10px 14px", color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                )}
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, color: C.textDim, fontWeight: 700, letterSpacing: 0.5, display: "block", marginBottom: 6 }}>TYPE</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["Comic","Novel","Article"].map(t => (
                  <button key={t} onClick={() => setNewStory(p => ({...p,type:t}))} style={{ flex: 1, padding: "8px", borderRadius: 10, border: `1px solid ${newStory.type===t ? C.plum : C.cardBorder}`, background: newStory.type===t ? C.plum+"22" : C.bg, color: newStory.type===t ? C.plumLight : C.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{t}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowCreate(false)} style={{ flex: 1, padding: "12px", borderRadius: 14, background: C.glass, border: `1px solid ${C.glassBorder}`, color: C.textMuted, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleCreate} disabled={creating} style={{ flex: 2, padding: "12px", borderRadius: 14, background: C.gradient, border: "none", color: "white", fontWeight: 700, cursor: creating ? "default" : "pointer", opacity: creating ? 0.7 : 1 }}>{creating ? "Creating..." : `Become ${settings.site_name || 'ToonVault'} Creator`}</button>
            </div>
          </div>
        </div>
      )}

      {/* Next Episode Modal */}
      {showEpisodeModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 24, padding: 32, width: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: C.text }}>✨ Generate Next Episode</div>
            <div style={{ fontSize: 13, color: C.textDim, marginBottom: 20 }}>Story: <span style={{ color: C.plumLight, fontWeight: 600 }}>{selectedStoryForEpisode?.title}</span></div>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, color: C.textDim, fontWeight: 700, letterSpacing: 0.5, display: "block", marginBottom: 6 }}>WHAT SHOULD HAPPEN NEXT?</label>
              <textarea 
                value={episodePromptText} 
                onChange={e => setEpisodePromptText(e.target.value)} 
                rows={4}
                placeholder="Describe the plot twist, dialogue, or narrative goals for the next episode. (Leave blank for AI choice)"
                style={{ width: "100%", background: C.bg, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: "10px 14px", color: C.text, fontSize: 13, resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} 
              />
            </div>
            
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowEpisodeModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 14, background: C.glass, border: `1px solid ${C.glassBorder}`, color: C.textMuted, cursor: "pointer" }}>Cancel</button>
              <button onClick={submitGenerateEpisode} disabled={generatingEpisode} style={{ flex: 2, padding: "12px", borderRadius: 14, background: C.gradient, border: "none", color: "white", fontWeight: 700, cursor: generatingEpisode ? "default" : "pointer", opacity: generatingEpisode ? 0.7 : 1 }}>
                {generatingEpisode ? "Generating Episode..." : "✦ Generate Episode"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total Views", value: totalViews > 1000000 ? (totalViews/1e6).toFixed(1)+"M" : totalViews > 1000 ? (totalViews/1000).toFixed(1)+"K" : String(totalViews), icon: "👁", color: C.plum },
          { label: "Total Stories", value: String(myStories.length), icon: "📖", color: C.rose },
          { label: "Live Stories", value: String(myStories.filter(s=>s.status==="Live").length), icon: "🟢", color: C.green },
          { label: "Avg Rating", value: myStories.length ? (myStories.reduce((s,x)=>s+(x.rating||0),0)/myStories.length).toFixed(1) : "—", icon: "⭐", color: C.gold },
        ].map(s => (
          <GlassCard key={s.label} style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{s.label}</div>
          </GlassCard>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "6px 16px", borderRadius: 20,
            background: filter === f ? C.plum : C.glass,
            color: filter === f ? "white" : C.textMuted,
            fontSize: 13, fontWeight: filter === f ? 700 : 400, cursor: "pointer",
            border: `1px solid ${filter === f ? C.plum : C.glassBorder}`,
            transition: "all 0.18s",
          }}>{f}</button>
        ))}
      </div>

      {/* Story Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0", color: C.textDim }}>
            <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }}>📖</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.textMuted, marginBottom: 6 }}>No stories yet</div>
            <div style={{ fontSize: 13 }}>Click "New Story" to create your first one!</div>
          </div>
        )}
        {filtered.map(s => {
          const sc = statusColor[s.status] || C.textMuted;
          return (
            <GlassCard key={s._id} glow style={{ padding: 0, overflow: "hidden" }}>
              <div style={{
                height: 90, background: s.coverBg || "#1A1628",
                display: "flex", alignItems: "center",
                padding: "0 20px", gap: 16, position: "relative",
              }}>
                <span style={{ fontSize: 36, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {s.panels?.[0] ? <img src={s.panels[0]} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (s.coverIcon || "📖")}
                </span>
                <div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>{s.genre || "—"}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "white" }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2, marginBottom: 2 }}>By {s.authorName || "Creator"}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{s.type}</div>
                </div>
                <div style={{ position: "absolute", top: 10, right: 12 }}>
                  <Badge color={sc}>{s.status}</Badge>
                </div>
              </div>
              <div style={{ padding: "14px 18px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 12 }}>
                  {[
                    { label: "Views", value: (s.views||0).toLocaleString() },
                    { label: "Likes", value: (s.likes||0).toLocaleString() },
                    { label: "Rating", value: s.rating ? `⭐ ${s.rating}` : "—" },
                  ].map(m => (
                    <div key={m.label}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{m.value}</div>
                      <div style={{ fontSize: 10, color: C.textDim }}>{m.label}</div>
                    </div>
                  ))}
                </div>
                {s.description && <div style={{ fontSize: 11, color: C.textDim, marginBottom: 12, lineHeight: 1.5, overflow: "hidden", display:"-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{s.description}</div>}
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => navigate(`/manta/${s._id}`)} style={{ flex: 1, padding: "8px", borderRadius: 10, background: C.plum, border: "none", color: "white", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>📖 Read</button>
                  <button 
                    onClick={() => handleAddEpisode(s)} 
                    disabled={genEp === s._id}
                    style={{ flex: 1, padding: "8px", borderRadius: 10, background: C.rose+"22", border: `1px solid ${C.rose}50`, color: C.rose, fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                  >
                    {genEp === s._id ? "..." : "+ Episode"}
                  </button>
                  <button onClick={() => handleDelete(s._id)} disabled={deleting === s._id} style={{ padding: "8px 12px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444", fontSize: 11, cursor: "pointer" }}>{deleting===s._id ? "..." : "🗑"}</button>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
// ═══════════════════════════════════════════════════════
// READING HISTORY PAGE
// ═══════════════════════════════════════════════════════
function ReadingPage() {
  const [tab, setTab] = useState("In Progress");

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: "0 0 4px" }}>Reading List</h2>
        <p style={{ fontSize: 13, color: C.textDim, margin: 0 }}>Track your reading journey</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["In Progress", "Completed", "Bookmarked", "Following"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "7px 18px", borderRadius: 20,
            background: tab === t ? C.plum : "transparent",
            color: tab === t ? "white" : C.textMuted,
            fontSize: 13, fontWeight: tab === t ? 700 : 400,
            border: `1px solid ${tab === t ? C.plum : C.glassBorder}`,
            cursor: "pointer", transition: "all 0.18s",
          }}>{t}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
        {READING_LIST.map(s => (
          <GlassCard key={s._id || s.id} glow style={{ padding: "16px 20px", display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{
              width: 52, height: 66, borderRadius: 10, flexShrink: 0,
              background: s.bg, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 26, overflow: "hidden",
              boxShadow: `0 4px 16px rgba(0,0,0,0.3)`,
            }}>
              {s.panels && s.panels[0] ? <img src={s.panels[0]} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (s.cover || "📖")}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 3 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{s.title}</div>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.plumLight, marginLeft: 8 }}>{s.progress}%</span>
              </div>
              <div style={{ fontSize: 11, color: C.textDim, marginBottom: 8 }}>{s.genre} · {s.chapter}</div>
              <ProgressBar value={s.progress} max={100} color={s.progress > 80 ? C.green : C.plumLight} />
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button style={{
                  flex: 1, padding: "7px 10px", borderRadius: 10,
                  background: C.plum + "22", border: `1px solid ${C.plum}50`,
                  color: C.plumLight, fontSize: 11, fontWeight: 600, cursor: "pointer",
                }}>▶ Continue</button>
                <button style={{
                  padding: "7px 10px", borderRadius: 10,
                  background: C.glass, border: `1px solid ${C.glassBorder}`,
                  color: C.textMuted, fontSize: 11, cursor: "pointer",
                }}>🔖</button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// AI STUDIO PAGE
// ═══════════════════════════════════════════════════════
function AIStudioPage({ user = {}, refreshStories, initialPrompt, navigate }) {
  const [selected, setSelected] = useState(0);
  const [topic, setTopic] = useState(initialPrompt || "");
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setGenerating(true); setResult(null); setError("");
    try {
      const tool = AI_TOOLS[selected];
      let res;
      if (tool.label === "Manta Creator" || tool.label === "Panel Generator" || tool.label === "Quotes & Wisdom") {
        res = await api.generateStory({ 
          topic, 
          prompt: tool.label === "Quotes & Wisdom" ? `(Aesthetic Quotes) ${prompt}` : prompt, 
          images: tool.label === "Manta Creator" ? 5 : tool.label === "Quotes & Wisdom" ? 5 : 3, 
          category: tool.label === "Quotes & Wisdom" ? "Quotes" : "Fantasy", 
          status: "draft" 
        });
        setResult(res.data.story);
      } else {
        res = await api.generateArticle({ topic, tone: "creative", genre: tool.label, length: "medium" });
        setResult(res.data.article);
      }
      if (refreshStories) refreshStories();
    } catch (e) {
      setError(e.response?.data?.error || "Generation failed. Check AI API keys in Admin Settings.");
    } finally { setGenerating(false); }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: "0 0 4px" }}>
          <span style={{ background: C.gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>✦ AI Studio</span>
        </h2>
        <p style={{ fontSize: 13, color: C.textDim, margin: 0 }}>Supercharge your storytelling with AI-powered tools</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, marginBottom: 28 }}>
        {AI_TOOLS.map((tool, i) => (
          <GlassCard key={tool.label} glow onClick={() => setSelected(i)} style={{
            padding: "18px",
            border: selected === i ? `1px solid ${tool.color}60` : `1px solid ${C.cardBorder}`,
            background: selected === i ? tool.color + "12" : C.card,
            cursor: "pointer",
          }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{tool.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>{tool.label}</div>
            <div style={{ fontSize: 11, color: C.textDim, marginBottom: 12, lineHeight: 1.4 }}>{tool.desc}</div>
            <ProgressBar value={tool.uses} max={tool.max} color={tool.color} thin />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontSize: 10, color: C.textDim }}>
              <span>{tool.uses} / {tool.max} used</span>
              <span style={{ color: tool.color, fontWeight: 600 }}>
                {Math.round((1 - tool.uses / tool.max) * 100)}% left
              </span>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Generator UI */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <GlassCard style={{ padding: "24px" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16 }}>
            {AI_TOOLS[selected].icon} {AI_TOOLS[selected].label}
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: C.textDim, fontWeight: 700, letterSpacing: 0.5, display: "block", marginBottom: 6 }}>TOPIC / TITLE</label>
            <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. The queen discovers betrayal..."
              style={{ width: "100%", background: C.bg, border: `1px solid ${C.cardBorder}`, borderRadius: 10, padding: "10px 14px", color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder={`Additional details or style notes (optional)...`}
            style={{
              width: "100%", height: 110, borderRadius: 12, padding: "12px 14px",
              background: C.bg, border: `1px solid ${C.cardBorder}`,
              color: C.text, fontSize: 13, resize: "none", outline: "none",
              fontFamily: "inherit", lineHeight: 1.6, boxSizing: "border-box",
            }}
          />
          {error && <div style={{ marginTop: 10, padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, color: "#EF4444", fontSize: 12 }}>{error}</div>}
          <button
            onClick={handleGenerate}
            disabled={generating || !topic.trim()}
            style={{
              width: "100%", marginTop: 14, padding: "12px",
              background: (generating || !topic.trim()) ? C.plum + "40" : C.gradient,
              border: "none", borderRadius: 12, color: "white",
              fontSize: 14, fontWeight: 700, cursor: (generating || !topic.trim()) ? "default" : "pointer",
              boxShadow: (generating || !topic.trim()) ? "none" : `0 4px 20px ${C.plumGlow}`,
              transition: "all 0.2s",
            }}
          >
            {generating ? "✦ Generating..." : "✦ Generate"}
          </button>
        </GlassCard>

        <GlassCard style={{ padding: "24px" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 16 }}>Output Preview</div>
          {!result && !generating ? (
            <div style={{
              height: 260, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              border: `1.5px dashed ${C.glassBorder}`, borderRadius: 12,
              color: C.textDim,
            }}>
              <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }}>✦</div>
              <div style={{ fontSize: 13 }}>Your generation will appear here</div>
            </div>
          ) : generating ? (
            <div style={{
              height: 260, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              background: C.plum + "08", borderRadius: 12,
              border: `1px solid ${C.plum}30`,
            }}>
              <div style={{ fontSize: 36, marginBottom: 12, animation: "spin 1s linear infinite" }}>✦</div>
              <div style={{ fontSize: 13, color: C.plumLight }}>Crafting your content...</div>
              <div style={{ fontSize: 11, color: C.textDim, marginTop: 6 }}>This may take 10-30 seconds</div>
            </div>
          ) : (
            <div>
              <div style={{ background: C.bg, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: 16, marginBottom: 14, maxHeight: 220, overflowY: "auto" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.plumLight, marginBottom: 8 }}>✓ {result?.title || "Generated"}</div>
                <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{result?.description || result?.content || "Story generated and saved!"}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setResult(null); setTopic(""); setPrompt(""); }} style={{ flex: 1, padding: "9px", borderRadius: 10, background: C.glass, border: `1px solid ${C.glassBorder}`, color: C.textMuted, fontSize: 12, cursor: "pointer" }}>↺ New</button>
                <button onClick={() => {
                    if (result.type === 'Comic' || result.panels?.length > 0) {
                        navigate(`/manta/${result._id}`);
                    } else {
                        window.location.reload();
                    }
                }} style={{ flex: 1, padding: "9px", borderRadius: 10, background: C.plum+"22", border: `1px solid ${C.plum}50`, color: C.plumLight, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>📖 Read Manta Style</button>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ANALYTICS PAGE
// ═══════════════════════════════════════════════════════
function AnalyticsPage({ myStories = [] }) {
  const displayStories = myStories.length > 0 ? myStories.slice(0, 6) : [];
  const maxViews = Math.max(...displayStories.map(s => s.views || 0), 100);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: "0 0 4px" }}>Analytics</h2>
        <p style={{ fontSize: 13, color: C.textDim, margin: 0 }}>Deep insights into your story performance</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total Views", value: myStories.reduce((s,x)=>s+(x.views||0),0).toLocaleString(), delta: "+12%", icon: "👁", color: C.plum },
          { label: "Unique Readers", value: (myStories.reduce((s,x)=>s+(x.views||0),0)*0.7).toFixed(0).toLocaleString(), delta: "+8%", icon: "👥", color: C.cyan },
          { label: "Avg Session", value: "24 min", delta: "+5min", icon: "⏱", color: C.rose },
          { label: "Retention Rate", value: "78%", delta: "+3%", icon: "📈", color: C.green },
        ].map(s => (
          <GlassCard key={s.label} style={{ padding: "18px 20px" }}>
            <div style={{ fontSize: 22, marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: C.green, marginTop: 4 }}>{s.delta} vs last month</div>
          </GlassCard>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        <GlassCard style={{ padding: "24px" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 20 }}>Views by Story (Monthly)</div>
          {displayStories.length === 0 && <div style={{ color: C.textDim, fontSize: 13, textAlign: "center", padding: "40px 0" }}>No story data available yet.</div>}
          {displayStories.map((s, i) => (
            <div key={s._id} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span>{s.coverIcon || "📖"}</span>
                  <span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{s.title}</span>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: C.textDim }}>{(s.views || 0).toLocaleString()}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.green }}>+{(s.likes || 0)} new</span>
                </div>
              </div>
              <ProgressBar value={s.views || 0} max={maxViews} color={[C.plum, C.rose, C.cyan, C.gold, C.green, C.orange][i % 6]} />
            </div>
          ))}
        </GlassCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <GlassCard style={{ padding: "20px" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 14 }}>Top Genres</div>
            {[
              { label: "Romance Fantasy", pct: 42, color: C.plum },
              { label: "Action", pct: 24, color: C.rose },
              { label: "Drama", pct: 18, color: C.cyan },
              { label: "Sci-Fi", pct: 16, color: C.gold },
            ].map(g => (
              <div key={g.label} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 12 }}>
                  <span style={{ color: C.textMuted }}>{g.label}</span>
                  <span style={{ color: g.color, fontWeight: 700 }}>{g.pct}%</span>
                </div>
                <ProgressBar value={g.pct} max={100} color={g.color} thin />
              </div>
            ))}
          </GlassCard>

          <GlassCard style={{ padding: "20px" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 14 }}>Audience</div>
            {[
              { label: "Mobile", value: "68%", icon: "📱" },
              { label: "Desktop", value: "24%", icon: "🖥" },
              { label: "App", value: "8%", icon: "📲" },
            ].map(a => (
              <div key={a.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: C.textMuted }}>{a.icon} {a.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{a.value}</span>
              </div>
            ))}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// WALLET PAGE
// ═══════════════════════════════════════════════════════
function WalletPage() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: "0 0 4px" }}>Wallet & Payments</h2>
        <p style={{ fontSize: 13, color: C.textDim, margin: 0 }}>Your earnings and transaction history</p>
      </div>

      {/* Balance Card */}
      <div style={{
        borderRadius: 22,
        background: "linear-gradient(135deg, #1A0D00 0%, #2A1500 50%, #1A0A00 100%)",
        border: `1px solid ${C.gold}40`,
        padding: "28px 32px",
        marginBottom: 24,
        position: "relative", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20,
      }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 180, height: 180, borderRadius: "50%", background: "rgba(245,158,11,0.1)", filter: "blur(40px)" }} />
        <div>
          <div style={{ fontSize: 12, color: "rgba(245,158,11,0.6)", fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>TOTAL BALANCE</div>
          <div style={{ fontSize: 44, fontWeight: 900, color: C.gold, letterSpacing: -1 }}>$12,890.40</div>
          <div style={{ fontSize: 13, color: "rgba(245,158,11,0.6)", marginTop: 6 }}>+$482.70 this month · +4.9%</div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button style={{
            padding: "12px 28px", borderRadius: 14,
            background: C.gold, border: "none", color: C.ink,
            fontSize: 14, fontWeight: 800, cursor: "pointer",
          }}>💸 Withdraw</button>
          <button style={{
            padding: "12px 22px", borderRadius: 14,
            background: "rgba(245,158,11,0.15)", border: `1px solid ${C.gold}50`,
            color: C.gold, fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}>📊 Report</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Royalties", value: "$11,650", icon: "📖", color: C.plum },
          { label: "Coins Earned", value: "2,840 🪙", icon: "⭐", color: C.gold },
          { label: "Pending", value: "$482.70", icon: "⏳", color: C.cyan },
        ].map(s => (
          <GlassCard key={s.label} style={{ padding: "18px 20px" }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 3 }}>{s.label}</div>
          </GlassCard>
        ))}
      </div>

      {/* Transactions */}
      <GlassCard style={{ padding: "22px 24px" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16 }}>Transaction History</div>
        {TRANSACTIONS.map((t, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "13px 0",
            borderBottom: i < TRANSACTIONS.length - 1 ? `1px solid ${C.cardBorder}` : "none",
          }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: t.type === "income" ? C.green + "15" : "#EF444415",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 17,
              }}>{t.type === "income" ? "↑" : "↓"}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{t.label}</div>
                <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{t.date}</div>
              </div>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.type === "income" ? C.green : "#EF4444" }}>{t.amount}</div>
          </div>
        ))}
      </GlassCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SETTINGS PAGE
// ═══════════════════════════════════════════════════════
function SettingsPage({ user = {}, setUser }) {
  const [vals, setVals] = useState({ notifEmail: true, notifPush: true, darkMode: true, autoSave: true, publicProfile: true, twoFactor: false });
  const [form, setForm] = useState({ username: user.username || "", phone: user.phone || "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const toggle = k => setVals(v => ({ ...v, [k]: !v[k] }));
  const avatarLetter = (user.username || "U")[0].toUpperCase();

  // Sync form when user loads
  useEffect(() => { setForm({ username: user.username || "", phone: user.phone || "" }); }, [user.username]);

  const handleSave = async () => {
    setSaving(true); setSaved(false);
    try {
      const res = await api.updateProfile({ username: form.username, phone: form.phone });
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify({ ...res.data, id: res.data._id }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { alert("Save failed: " + (e.response?.data?.error || e.message)); }
    finally { setSaving(false); }
  };

  const Toggle = ({ k }) => (
    <div onClick={() => toggle(k)} style={{
      width: 44, height: 24, borderRadius: 12, cursor: "pointer", transition: "all 0.2s",
      background: vals[k] ? C.plum : C.glassBorder, position: "relative",
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: "50%", background: "white",
        position: "absolute", top: 3, left: vals[k] ? 23 : 3,
        transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
      }} />
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: "0 0 4px" }}>Settings</h2>
        <p style={{ fontSize: 13, color: C.textDim, margin: 0 }}>Manage your account preferences</p>
      </div>

      {/* Profile */}
      <GlassCard style={{ padding: "24px", marginBottom: 18 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 18 }}>Profile</div>
        <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 20 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 18,
            background: C.gradient, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 28, fontWeight: 900, color: "white",
            boxShadow: `0 0 24px ${C.plumGlow}`,
          }}>{avatarLetter}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{user.username || "—"}</div>
            <div style={{ fontSize: 13, color: C.textDim, marginTop: 2 }}>{user.email || "—"}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <Badge color={C.plumLight}>{user.plan || "Free"} Plan</Badge>
              <Badge color={C.green}>Active</Badge>
            </div>
          </div>
        </div>
        {[
          { label: "Username", key: "username" },
          { label: "Phone", key: "phone" },
        ].map(field => (
          <div key={field.key} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: C.textDim, fontWeight: 600, letterSpacing: 0.5, marginBottom: 6 }}>{field.label.toUpperCase()}</div>
            <input
              value={form[field.key]}
              onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
              placeholder={field.label}
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 10,
                background: C.bg, border: `1px solid ${C.cardBorder}`,
                color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
        ))}
        <div style={{ fontSize: 11, color: C.textDim, marginBottom: 14 }}>
          Email: <strong style={{ color: C.textMuted }}>{user.email || "—"}</strong> &nbsp;·&nbsp; Member since: <strong style={{ color: C.textMuted }}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</strong>
        </div>
      </GlassCard>

      {/* Preferences */}
      <GlassCard style={{ padding: "24px", marginBottom: 18 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 18 }}>Preferences</div>
        {[
          { k: "notifEmail", label: "Email Notifications", desc: "Receive updates via email" },
          { k: "notifPush", label: "Push Notifications", desc: "Browser & app push alerts" },
          { k: "darkMode", label: "Dark Mode", desc: "Currently using dark theme" },
          { k: "autoSave", label: "Auto-save drafts", desc: "Save your work automatically" },
          { k: "publicProfile", label: "Public Profile", desc: "Allow others to find you" },
          { k: "twoFactor", label: "Two-Factor Auth", desc: "Extra security for your account" },
        ].map((item, i, arr) => (
          <div key={item.k} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 0",
            borderBottom: i < arr.length - 1 ? `1px solid ${C.cardBorder}` : "none",
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{item.label}</div>
              <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{item.desc}</div>
            </div>
            <Toggle k={item.k} />
          </div>
        ))}
      </GlassCard>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button onClick={handleSave} disabled={saving} style={{
          flex: 1, padding: "12px", borderRadius: 14,
          background: saving ? C.plumDark : C.gradient, border: "none", color: "white",
          fontSize: 14, fontWeight: 700, cursor: saving ? "default" : "pointer",
          boxShadow: saving ? "none" : `0 4px 16px ${C.plumGlow}`,
          opacity: saving ? 0.7 : 1,
        }}>{saving ? "Saving..." : saved ? "✓ Saved!" : "Save Changes"}</button>
        <button style={{
          padding: "12px 20px", borderRadius: 14,
          background: "#EF444418", border: `1px solid #EF444450`,
          color: "#EF4444", fontSize: 14, fontWeight: 600, cursor: "pointer",
        }}>Delete Account</button>
      </div>
    </div>
  );
}

function PlansPage({ user, setUser }) {
  const [selected, setSelected] = useState(null);
  const [upgrading, setUpgrading] = useState(false);
  const [paypalId, setPaypalId] = useState("test");

  useEffect(() => {
    api.getPublicSettings().then(res => {
      if (res.data.paypal_client_id) setPaypalId(res.data.paypal_client_id);
    }).catch(() => {});
  }, []);

  const handleUpgrade = async (planName) => {
    setUpgrading(true);
    try {
      const res = await api.updatePlan(planName);
      const newUser = { ...user, plan: res.data.plan };
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      setSelected(null);
      alert(`🎉 Congratulations! You have successfully upgraded to the ${planName} plan.`);
    } catch (e) {
      alert("Upgrade failed. Please contact support.");
    } finally { setUpgrading(false); }
  };

  const PLANS = [
    { name: "Free", price: "0", limit: 10, color: C.textDim, features: ["Read 10 stories/mo", "5 AI Story Generations", "Community access", "Standard reading mode"] },
    { name: "Bronze", price: "4.99", limit: 50, color: C.plum, features: ["Read 50 stories/mo", "20 AI Story Generations", "Advanced AI tools", "No ads", "Offline mode"] },
    { name: "Silver", price: "9.99", limit: 100, color: C.rose, features: ["Read 100 stories/mo", "50 AI Story Generations", "Priority AI gen", "Early access", "Custom themes"] },
    { name: "Gold", price: "19.99", limit: 9999, color: C.gold, features: ["Unlimited reading", "Unlimited Story Generations", "Pro AI story studio", "Direct support", "Exclusive content"] },
  ];

  const handleSelectPlan = (plan) => {
    if (user.plan === plan.name) return;
    if (plan.name === "Free") {
      if (window.confirm("Switch back to Free plan? Some premium features will be disabled.")) {
        handleUpgrade("Free");
      }
    } else {
      setSelected(plan.name);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: "0 0 4px" }}>Membership Plans</h2>
        <p style={{ fontSize: 13, color: C.textDim, margin: 0 }}>Choose the perfect plan for your storytelling journey</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 40 }}>
        {PLANS.map(p => (
          <GlassCard key={p.name} onClick={() => handleSelectPlan(p)} style={{
            padding: "32px 24px", textAlign: "center", cursor: user.plan === p.name ? "default" : "pointer",
            border: (selected === p.name || user.plan === p.name) ? `2px solid ${p.color}` : `1px solid ${C.cardBorder}`,
            background: (selected === p.name || user.plan === p.name) ? `linear-gradient(180deg, ${p.color}15 0%, ${C.card} 100%)` : C.card,
            transform: selected === p.name ? "translateY(-8px) scale(1.02)" : "none",
            boxShadow: selected === p.name ? `0 20px 40px ${p.color}20` : "none",
            transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Popular Badge */}
            {p.name === "Silver" && (
              <div style={{
                position: "absolute", top: 12, right: -30, background: C.rose, color: "white",
                fontSize: 9, fontWeight: 900, padding: "4px 30px", transform: "rotate(45deg)",
                boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
              }}>POPULAR</div>
            )}

            {user.plan === p.name && <div style={{ fontSize: 10, fontWeight: 900, color: p.color, marginBottom: 12, letterSpacing: 1.5 }}>ACTIVE PLAN</div>}
            
            <div style={{ fontSize: 24, fontWeight: 900, color: p.color, marginBottom: 10 }}>{p.name}</div>
            
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 2, margin: "20px 0" }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: C.text }}>${p.price}</span>
              <span style={{ fontSize: 14, color: C.textDim }}>/mo</span>
            </div>

            <div style={{ textAlign: "left", marginBottom: 32, padding: "0 10px" }}>
              {p.features.map(f => (
                <div key={f} style={{ fontSize: 13, color: C.textMuted, marginBottom: 12, display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: p.color + "20", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ color: p.color, fontSize: 10, fontWeight: 900 }}>✓</span>
                  </div>
                  {f}
                </div>
              ))}
            </div>

            {user.plan === p.name ? (
              <div style={{ 
                padding: "14px", borderRadius: 16, background: "rgba(16,185,129,0.1)", 
                color: C.green, fontSize: 14, fontWeight: 800, border: `1px solid ${C.green}30` 
              }}>Current Membership</div>
            ) : (
              <div style={{ 
                padding: "14px", borderRadius: 16, 
                background: selected === p.name ? p.color : C.glass, 
                color: selected === p.name ? "white" : C.textMuted, 
                fontSize: 14, fontWeight: 800,
                border: selected === p.name ? "none" : `1px solid ${C.glassBorder}`,
                boxShadow: selected === p.name ? `0 8px 20px ${p.color}40` : "none"
              }}>
                {selected === p.name ? "Selected" : "Choose Plan"}
              </div>
            )}
          </GlassCard>
        ))}
      </div>

      {selected && (
        <div style={{ 
          position: "fixed", inset: 0, zIndex: 2000, 
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }}>
          <div style={{ animation: "fadeIn 0.3s ease", width: "100%", maxWidth: 500 }}>
            <GlassCard style={{ padding: "40px", textAlign: "center", border: `1px solid ${PLANS.find(p => p.name === selected).color}80`, position: "relative", background: C.card }}>
              {/* Close Icon */}
              <button 
                onClick={() => setSelected(null)}
                style={{
                  position: "absolute", top: 20, right: 20, width: 32, height: 32,
                  borderRadius: "50%", background: "rgba(255,255,255,0.05)",
                  border: "none", color: C.textDim, fontSize: 20, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = C.text; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = C.textDim; }}
              >
                ×
              </button>

              <div style={{ 
                width: 64, height: 64, borderRadius: "50%", background: PLANS.find(p => p.name === selected).color + "15",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 20px"
              }}>✦</div>
              
              <h3 style={{ fontSize: 24, fontWeight: 900, color: C.text, margin: "0 0 10px" }}>Upgrade to {selected}</h3>
              <p style={{ fontSize: 14, color: C.textDim, marginBottom: 30, lineHeight: 1.5 }}>
                You are about to upgrade your plan. Secure checkout via PayPal. Your account will be upgraded immediately after payment.
              </p>
              
              <PayPalScriptProvider options={{ "client-id": paypalId }}>
                <div style={{ minHeight: 150 }}>
                  <PayPalButtons 
                    style={{ layout: "vertical", shape: "rect", color: "gold" }}
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        purchase_units: [{
                          amount: { value: PLANS.find(p => p.name === selected).price }
                        }]
                      });
                    }}
                    onApprove={async (data, actions) => {
                      await actions.order.capture();
                      handleUpgrade(selected);
                    }}
                  />
                </div>
              </PayPalScriptProvider>
              
              <button 
                onClick={() => setSelected(null)} 
                style={{ 
                  marginTop: 20, background: "none", border: "none", 
                  color: C.textDim, fontSize: 14, fontWeight: 600, cursor: "pointer",
                  textDecoration: "underline" 
                }}
              >
                Cancel and go back
              </button>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════
export default function ToonVaultUserDashboard() {
  const navigate = useNavigate();
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(getStoredUser());
  const [myStories, setMyStories] = useState([]);
  const [allStories, setAllStories] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [initialPrompt, setInitialPrompt] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get("page");
    const promptParam = params.get("prompt");
    const openParam = params.get("open");

    if (pageParam) setPage(pageParam);
    else if (openParam === "story") setPage("stories");
    else if (openParam === "ai") setPage("ai");

    if (promptParam) setInitialPrompt(promptParam);

    const token = localStorage.getItem("token");
    if (!token) { navigate("/user"); return; }

    const load = async () => {
      setLoadingData(true);
      try {
        const [profileRes, myStoriesRes, allStoriesRes] = await Promise.allSettled([
          api.getProfile(),
          api.getMyStories(),
          api.getAllStories(),
        ]);
        if (profileRes.status === "rejected") {
          if (profileRes.reason?.response?.status === 401) {
            logout();
            return;
          }
          console.error("Profile load failed:", profileRes.reason);
        } else {
          const u = profileRes.value.data || {};
          setUser(u);
          localStorage.setItem("user", JSON.stringify({ ...u, id: u._id }));
        }
        
        if (myStoriesRes.status === "fulfilled") setMyStories(myStoriesRes.value.data || []);
        else console.error("My Stories load failed:", myStoriesRes.reason);
        
        if (allStoriesRes.status === "fulfilled") setAllStories(allStoriesRes.value.data || []);
        else console.error("All Stories load failed:", allStoriesRes.reason);
      } catch (e) {
        console.error("Dashboard load crash:", e);
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, []);

  const refreshStories = async () => {
    try {
      const res = await api.getMyStories();
      setMyStories(res.data);
    } catch (e) {}
  };

  const PAGES = {
    home: <HomePage setPage={setPage} user={user} myStories={myStories} allStories={allStories} />,
    stories: <MyStoriesPage user={user} myStories={myStories} refreshStories={refreshStories} navigate={navigate} />,
    reading: <ReadingPage allStories={allStories} />,
    ai: <AIStudioPage user={user} refreshStories={refreshStories} initialPrompt={initialPrompt} navigate={navigate} />,
    analytics: <AnalyticsPage myStories={myStories} />,
    wallet: <WalletPage user={user} />,
    settings: <SettingsPage user={user} setUser={setUser} />,
    plans: <PlansPage user={user} setUser={setUser} />,
  };

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
      background: C.bg,
      minHeight: "100vh",
      color: C.text,
    }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: ${C.surface}; }
        ::-webkit-scrollbar-thumb { background: ${C.plum}60; border-radius: 10px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        input { background: transparent; }
        button { font-family: inherit; }
        textarea { font-family: inherit; }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(139, 92, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
        }
        .publish-btn:hover { animation: none !important; transform: translateY(-2px); }
        @media (max-width: 900px) {
          .logo-container { 
            width: auto !important; 
            border-right: none !important;
            padding: 0 16px !important;
          }
        }
        @media (max-width: 768px) {
          .sidebar { 
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            display: block !important;
            z-index: 1000;
          }
          .sidebar.open {
            transform: translateX(0);
          }
          .main-content { margin-left: 0 !important; padding: 16px !important; }
          .hide-mobile { display: none !important; }
          .show-mobile { display: block !important; }
        }
      `}</style>

      <TopNav page={page} setPage={setPage} user={user} onMenuClick={() => setMobileMenuOpen(true)} setShowWizard={setShowWizard} />
      
      <AIStoryWizard 
        isOpen={showWizard} 
        onClose={() => setShowWizard(false)} 
        onFinish={(story) => {
          setShowWizard(false);
          setPage('ai'); // Go to AI Studio to see/edit it
        }}
      />

      <div style={{ display: "flex", paddingTop: 62 }}>
        <div className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
          <Sidebar page={page} setPage={setPage} user={user} navigate={navigate} onLinkClick={() => setMobileMenuOpen(false)} />
        </div>
        {mobileMenuOpen && <div onClick={() => setMobileMenuOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 999 }} />}

        <main
          className="main-content"
          style={{
            marginLeft: 240,
            flex: 1,
            padding: "28px 28px 48px",
            minHeight: "calc(100vh - 62px)",
            animation: "fadeIn 0.3s ease",
          }}
          key={page}
        >
          {loadingData ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: C.textDim }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 12, animation: "spin 1s linear infinite", display: "inline-block" }}>✦</div>
                <div>Loading your dashboard...</div>
              </div>
            </div>
          ) : PAGES[page]}
        </main>
      </div>
    </div>
  );
}