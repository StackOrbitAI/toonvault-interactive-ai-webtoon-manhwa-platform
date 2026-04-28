import { useState, useEffect, useRef, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ═══════════════════════════════════════════════════════
//  DESIGN TOKENS
// ═══════════════════════════════════════════════════════
const C = {
  bg: "#0A0910",
  surface: "#110F1E",
  surface2: "#1A1730",
  surface3: "#221F38",
  border: "#2C2848",
  borderLight: "#3D3860",
  plum: "#8B5CF6",
  plum2: "#A78BFA",
  plumDark: "#5B21B6",
  rose: "#F43F8E",
  roseDark: "#BE185D",
  gold: "#F59E0B",
  green: "#10B981",
  red: "#EF4444",
  blue: "#38BDF8",
  cyan: "#06B6D4",
  text: "#EDE9FE",
  muted: "#7C6FAE",
  muted2: "#4C4570",
  white: "#FFFFFF",
  paypal: "#003087",
  google: "#4285F4",
  facebook: "#1877F2",
};

// ═══════════════════════════════════════════════════════
//  MOCK DATA
// ═══════════════════════════════════════════════════════
const MOCK_USERS = [
  { id: 1, username: "SakuraDreams", email: "sakura@mail.com", plan: "Gold", status: "Active", joined: "2025-01-15", stories: 12, revenue: 240, country: "JP", avatar: "🌸" },
  { id: 2, username: "NightOwlWriter", email: "night@mail.com", plan: "Silver", status: "Active", joined: "2025-02-20", stories: 5, revenue: 45, country: "US", avatar: "🦉" },
  { id: 3, username: "DragonScribe", email: "dragon@mail.com", plan: "Bronze", status: "Banned", joined: "2024-12-01", stories: 0, revenue: 0, country: "KR", avatar: "🐉" },
  { id: 4, username: "MoonlitPen", email: "moon@mail.com", plan: "Gold", status: "Active", joined: "2025-03-10", stories: 28, revenue: 890, country: "IN", avatar: "🌙" },
  { id: 5, username: "VelvetQuill", email: "velvet@mail.com", plan: "Silver", status: "Pending", joined: "2025-04-01", stories: 3, revenue: 15, country: "FR", avatar: "✒️" },
  { id: 6, username: "CrimsonPetal", email: "crimson@mail.com", plan: "Bronze", status: "Active", joined: "2025-01-30", stories: 1, revenue: 0, country: "US", avatar: "🌹" },
  { id: 7, username: "StarlightArc", email: "star@mail.com", plan: "Gold", status: "Active", joined: "2024-11-15", stories: 45, revenue: 2100, country: "JP", avatar: "⭐" },
  { id: 8, username: "InkAndAsh", email: "ink@mail.com", plan: "Silver", status: "Active", joined: "2025-02-05", stories: 8, revenue: 120, country: "UK", avatar: "🖋️" },
];

const MOCK_STORIES = [
  { id: 1, title: "Crimson Throne", author: "SakuraDreams", genre: "Romance Fantasy", views: "28.8M", status: "Featured", rating: 4.9, chapters: 156, revenue: 4200 },
  { id: 2, title: "The Shadow Pact", author: "MoonlitPen", genre: "Fantasy", views: "9.8M", status: "Approved", rating: 4.8, chapters: 89, revenue: 1800 },
  { id: 3, title: "Stray Signal", author: "StarlightArc", genre: "Sci-Fi", views: "3.3M", status: "Under Review", rating: 4.7, chapters: 42, revenue: 650 },
  { id: 4, title: "Villain's Beloved", author: "VelvetQuill", genre: "Dark Romance", views: "10.1M", status: "Approved", rating: 4.8, chapters: 203, revenue: 3100 },
  { id: 5, title: "Iron Saint", author: "DragonScribe", genre: "Superhero", views: "6.1M", status: "Flagged", rating: 4.6, chapters: 67, revenue: 0 },
  { id: 6, title: "Wolf's Lullaby", author: "InkAndAsh", genre: "GL Fantasy", views: "1.4M", status: "Approved", rating: 4.7, chapters: 31, revenue: 280 },
];

const MOCK_TRANSACTIONS = [
  { id: "TXN001", user: "SakuraDreams", amount: 24, plan: "Gold", method: "PayPal", status: "Success", date: "2026-04-20" },
  { id: "TXN002", user: "NightOwlWriter", amount: 5, plan: "Silver", method: "PayPal", status: "Success", date: "2026-04-19" },
  { id: "TXN003", user: "StarlightArc", amount: 24, plan: "Gold", method: "Card", status: "Success", date: "2026-04-18" },
  { id: "TXN004", user: "VelvetQuill", amount: 5, plan: "Silver", method: "PayPal", status: "Failed", date: "2026-04-17" },
  { id: "TXN005", user: "MoonlitPen", amount: 24, plan: "Gold", method: "Card", status: "Pending", date: "2026-04-16" },
  { id: "TXN006", user: "InkAndAsh", amount: 5, plan: "Silver", method: "PayPal", status: "Success", date: "2026-04-15" },
];

// ═══════════════════════════════════════════════════════
//  REUSABLE COMPONENTS
// ═══════════════════════════════════════════════════════
function Badge({ type, children }) {
  const styles = {
    Active: { bg: "rgba(16,185,129,0.15)", color: C.green },
    Banned: { bg: "rgba(239,68,68,0.15)", color: C.red },
    Pending: { bg: "rgba(245,158,11,0.15)", color: C.gold },
    Gold: { bg: "rgba(245,158,11,0.15)", color: C.gold },
    Silver: { bg: "rgba(139,92,246,0.15)", color: C.plum2 },
    Bronze: { bg: "rgba(124,111,174,0.12)", color: C.muted },
    Featured: { bg: "rgba(248,113,113,0.15)", color: "#F87171" },
    Approved: { bg: "rgba(16,185,129,0.15)", color: C.green },
    "Under Review": { bg: "rgba(245,158,11,0.15)", color: C.gold },
    Flagged: { bg: "rgba(239,68,68,0.15)", color: C.red },
    Success: { bg: "rgba(16,185,129,0.15)", color: C.green },
    Failed: { bg: "rgba(239,68,68,0.15)", color: C.red },
    Free: { bg: "rgba(124,111,174,0.12)", color: C.muted },
  };
  const s = styles[type] || styles[children] || { bg: "rgba(139,92,246,0.15)", color: C.plum2 };
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: 10, fontWeight: 700, padding: "3px 9px",
      borderRadius: 20, letterSpacing: 0.3, whiteSpace: "nowrap",
    }}>{children || type}</span>
  );
}

function StatCard({ icon, label, value, change, color, onClick }) {
  const colors = {
    plum: { bg: "rgba(139,92,246,0.12)", glow: "0 0 30px rgba(139,92,246,0.15)" },
    rose: { bg: "rgba(244,63,142,0.12)", glow: "0 0 30px rgba(244,63,142,0.15)" },
    gold: { bg: "rgba(245,158,11,0.12)", glow: "0 0 30px rgba(245,158,11,0.15)" },
    green: { bg: "rgba(16,185,129,0.12)", glow: "0 0 30px rgba(16,185,129,0.15)" },
  };
  const col = colors[color] || colors.plum;
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? C.surface2 : C.surface,
        border: `1px solid ${hov ? C.borderLight : C.border}`,
        borderRadius: 16, padding: "20px 22px", cursor: onClick ? "pointer" : "default",
        transition: "all 0.25s", boxShadow: hov ? col.glow : "none",
        position: "relative", overflow: "hidden",
      }}>
      <div style={{
        position: "absolute", top: -20, right: -20, width: 90, height: 90,
        borderRadius: "50%", background: col.bg,
      }} />
      <div style={{
        width: 38, height: 38, borderRadius: 11, background: col.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, marginBottom: 14,
      }}>{icon}</div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: -1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: C.green, display: "flex", alignItems: "center", gap: 4 }}>
        <span>▲</span> {change}
      </div>
    </div>
  );
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(4px)",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 20, padding: "28px 30px", width: 520, maxWidth: "95vw",
        maxHeight: "85vh", overflowY: "auto",
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.text }}>{title}</div>
          <button onClick={onClose} style={{
            background: C.surface2, border: `1px solid ${C.border}`,
            color: C.muted, width: 32, height: 32, borderRadius: 8,
            cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder, icon, hint }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 7, letterSpacing: 0.3 }}>{label}</div>}
      <div style={{ position: "relative" }}>
        {icon && <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 15 }}>{icon}</span>}
        <input
          type={type === "password" ? (show ? "text" : "password") : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%", padding: `10px ${type === "password" ? "40px" : "14px"} 10px ${icon ? "38px" : "14px"}`,
            background: C.surface2, border: `1px solid ${C.border}`,
            borderRadius: 10, fontSize: 13, color: C.text, outline: "none",
            transition: "border-color 0.2s", boxSizing: "border-box",
          }}
          onFocus={e => e.target.style.borderColor = C.plum}
          onBlur={e => e.target.style.borderColor = C.border}
        />
        {type === "password" && (
          <button onClick={() => setShow(!show)} style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 13,
          }}>{show ? "🙈" : "👁"}</button>
        )}
      </div>
      {hint && <div style={{ fontSize: 11, color: C.muted, marginTop: 5 }}>{hint}</div>}
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}>
      <span style={{ fontSize: 13, color: C.text }}>{label}</span>
      <div onClick={() => onChange(!checked)} style={{
        width: 44, height: 24, borderRadius: 12, cursor: "pointer",
        background: checked ? C.plum : C.surface3,
        position: "relative", transition: "background 0.25s",
        border: `1px solid ${checked ? C.plum : C.border}`,
      }}>
        <div style={{
          position: "absolute", top: 2, left: checked ? 20 : 2,
          width: 18, height: 18, borderRadius: "50%", background: C.white,
          transition: "left 0.25s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
        }} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  LOGIN PAGE
// ═══════════════════════════════════════════════════════
function LoginPage({ onLogin }) {
  const [tab, setTab] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email || !password) { setError("Please fill all fields"); return; }
    setLoading(true); setError("");
    await new Promise(r => setTimeout(r, 1200));
    if (tab === "login" && email === "admin@toonvault.io" && password === "admin123") {
      onLogin({ name: "Super Admin", email, role: "admin", avatar: "SA" });
    } else if (tab === "signup") {
      onLogin({ name: name || email.split("@")[0], email, role: "admin", avatar: name?.[0]?.toUpperCase() || "A" });
    } else {
      setError("Invalid credentials. Try admin@toonvault.io / admin123");
    }
    setLoading(false);
  };

  const SocialBtn = ({ icon, label, color, bg }) => (
    <button style={{
      flex: 1, padding: "11px 10px", borderRadius: 11, border: `1px solid ${C.border}`,
      background: C.surface2, color: C.text, fontSize: 12, fontWeight: 600,
      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
      gap: 8, transition: "all 0.2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = bg; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface2; }}
      onClick={() => onLogin({ name: `${label} User`, email: `${label.toLowerCase()}@oauth.com`, role: "admin", avatar: icon })}
    >
      <span style={{ fontSize: 16 }}>{icon}</span> {label}
    </button>
  );

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      backgroundImage: "radial-gradient(ellipse at 20% 30%, rgba(139,92,246,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(244,63,142,0.06) 0%, transparent 50%)",
    }}>
      {/* Glow orbs */}
      <div style={{ position: "fixed", top: "15%", left: "10%", width: 300, height: 300, borderRadius: "50%", background: "rgba(139,92,246,0.06)", filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "15%", right: "10%", width: 250, height: 250, borderRadius: "50%", background: "rgba(244,63,142,0.05)", filter: "blur(60px)", pointerEvents: "none" }} />

      <div style={{ width: 420, padding: "0 20px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: "linear-gradient(135deg, #8B5CF6, #F43F8E)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, marginBottom: 14, boxShadow: "0 8px 32px rgba(139,92,246,0.4)",
          }}>📖</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: -0.5 }}>
            Toon<span style={{ color: C.rose }}>Vault</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginLeft: 8, letterSpacing: 1 }}>ADMIN</span>
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>Command center for your platform</div>
        </div>

        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 20, padding: "28px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        }}>
          {/* Tabs */}
          <div style={{ display: "flex", background: C.surface2, borderRadius: 12, padding: 4, marginBottom: 24 }}>
            {["login", "signup"].map(t => (
              <button key={t} onClick={() => { setTab(t); setError(""); }} style={{
                flex: 1, padding: "8px", borderRadius: 9, border: "none",
                background: tab === t ? C.plum : "transparent",
                color: tab === t ? C.white : C.muted,
                fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                textTransform: "capitalize",
              }}>{t === "login" ? "Sign In" : "Create Account"}</button>
            ))}
          </div>

          {/* Social Auth */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <SocialBtn icon="G" label="Google" color={C.google} bg="rgba(66,133,244,0.08)" />
            <SocialBtn icon="f" label="Facebook" color={C.facebook} bg="rgba(24,119,242,0.08)" />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: C.border }} />
            <span style={{ fontSize: 11, color: C.muted2 }}>OR CONTINUE WITH EMAIL</span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>

          {tab === "signup" && (
            <Input label="FULL NAME" value={name} onChange={setName} placeholder="Your display name" icon="👤" />
          )}
          <Input label="EMAIL ADDRESS" value={email} onChange={setEmail} placeholder="admin@toonvault.io" icon="✉️" type="email" />
          <Input label="PASSWORD" value={password} onChange={setPassword} placeholder="••••••••" icon="🔐" type="password"
            hint={tab === "login" ? "Demo: admin@toonvault.io / admin123" : "Min 8 characters"} />

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 10, padding: "10px 14px", fontSize: 12, color: C.red, marginBottom: 16,
            }}>⚠️ {error}</div>
          )}

          <button onClick={handleSubmit} disabled={loading} style={{
            width: "100%", padding: "13px",
            background: loading ? C.muted2 : "linear-gradient(135deg, #8B5CF6, #F43F8E)",
            border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700,
            color: C.white, cursor: loading ? "default" : "pointer",
            transition: "all 0.2s", letterSpacing: 0.3,
            boxShadow: loading ? "none" : "0 4px 20px rgba(139,92,246,0.4)",
          }}>
            {loading ? "⏳ Authenticating..." : tab === "login" ? "🚀 Sign In to Dashboard" : "✨ Create Account"}
          </button>

          {tab === "login" && (
            <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: C.muted }}>
              Forgot password?{" "}
              <span style={{ color: C.plum2, cursor: "pointer" }}>Reset here</span>
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: C.muted2 }}>
          Protected by ToonVault Security · 256-bit encryption
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  NAV ITEMS
// ═══════════════════════════════════════════════════════
const NAV_ITEMS = [
  { id: "dashboard", icon: "📊", label: "Dashboard", section: "Overview" },
  { id: "analytics", icon: "📈", label: "Analytics", section: "Overview" },
  { id: "users", icon: "👥", label: "Users", section: "Management", badge: true },
  { id: "stories", icon: "📚", label: "Stories", section: "Management" },
  { id: "revenue", icon: "💰", label: "Revenue", section: "Management" },
  { id: "imagegen", icon: "🎨", label: "Image Gen", section: "AI Tools" },
  { id: "apikeys", icon: "🔑", label: "API Keys", section: "AI Tools" },
  { id: "payments", icon: "💳", label: "PayPal Setup", section: "Integrations" },
  { id: "settings", icon: "⚙️", label: "Settings", section: "System" },
];

// ═══════════════════════════════════════════════════════
//  DASHBOARD PAGE
// ═══════════════════════════════════════════════════════
function DashboardPage({ setPage }) {
  const stats = [
    { icon: "👥", label: "Total Users", value: "48,291", change: "+12.4% this month", color: "plum" },
    { icon: "📚", label: "Active Stories", value: "2,847", change: "+8.1% this week", color: "rose" },
    { icon: "💰", label: "Monthly Revenue", value: "$18,420", change: "+22.7% vs last month", color: "gold" },
    { icon: "👁", label: "Total Views", value: "142.6M", change: "+5.3% today", color: "green" },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Dashboard Overview</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>Welcome back! Here's what's happening on ToonVault.</div>
        </div>
        <select style={{
          padding: "8px 14px", background: C.surface2, border: `1px solid ${C.border}`,
          borderRadius: 10, fontSize: 13, color: C.text, outline: "none", cursor: "pointer",
        }}>
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>This month</option>
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {stats.map(s => <StatCard key={s.label} {...s} onClick={() => setPage(s.label === "Total Users" ? "users" : s.label === "Active Stories" ? "stories" : s.label === "Monthly Revenue" ? "revenue" : "analytics")} />)}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14, marginBottom: 24 }}>
        {/* Revenue Chart (SVG simulated) */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Revenue & User Growth</div>
            <div style={{ display: "flex", gap: 6 }}>
              {["7D", "1M", "3M", "1Y"].map((t, i) => (
                <button key={t} style={{
                  padding: "4px 10px", borderRadius: 8, border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer",
                  background: i === 1 ? "rgba(139,92,246,0.15)" : "transparent",
                  color: i === 1 ? C.plum2 : C.muted,
                }}>{t}</button>
              ))}
            </div>
          </div>
          {/* Simple SVG Chart */}
          <svg viewBox="0 0 500 160" style={{ width: "100%", height: 160 }}>
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="roseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F43F8E" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#F43F8E" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Grid lines */}
            {[0, 40, 80, 120, 160].map(y => (
              <line key={y} x1="0" y1={y} x2="500" y2={y} stroke={C.border} strokeWidth="0.5" />
            ))}
            {/* Revenue area */}
            <path d="M0,140 C60,130 100,100 140,90 C180,80 220,70 260,55 C300,40 340,35 380,25 C420,15 460,18 500,10 L500,160 L0,160 Z"
              fill="url(#lineGrad)" />
            <path d="M0,140 C60,130 100,100 140,90 C180,80 220,70 260,55 C300,40 340,35 380,25 C420,15 460,18 500,10"
              fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" />
            {/* Users area */}
            <path d="M0,155 C60,148 100,138 140,128 C180,118 220,110 260,100 C300,90 340,80 380,65 C420,50 460,45 500,38 L500,160 L0,160 Z"
              fill="url(#roseGrad)" />
            <path d="M0,155 C60,148 100,138 140,128 C180,118 220,110 260,100 C300,90 340,80 380,65 C420,50 460,45 500,38"
              fill="none" stroke="#F43F8E" strokeWidth="2" strokeDasharray="5,3" strokeLinecap="round" />
            {/* Labels */}
            {["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"].map((m, i) => (
              <text key={m} x={i * 64 + 20} y={155} fill={C.muted2} fontSize="10">{m}</text>
            ))}
          </svg>
          <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.muted }}>
              <div style={{ width: 20, height: 2, background: C.plum, borderRadius: 1 }} /> Revenue
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.muted }}>
              <div style={{ width: 20, height: 2, background: C.rose, borderRadius: 1, borderTop: "2px dashed" }} /> Users
            </div>
          </div>
        </div>

        {/* Plan Donut */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 22px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>Plan Distribution</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <svg viewBox="0 0 120 120" width={140} height={140}>
              <circle cx="60" cy="60" r="45" fill="none" stroke={C.muted2} strokeWidth="18" strokeOpacity="0.3" />
              <circle cx="60" cy="60" r="45" fill="none" stroke={C.plum} strokeWidth="18"
                strokeDasharray={`${0.75 * 283} ${283}`} strokeDashoffset="0" strokeLinecap="round"
                transform="rotate(-90 60 60)" />
              <circle cx="60" cy="60" r="45" fill="none" stroke={C.gold} strokeWidth="18"
                strokeDasharray={`${0.16 * 283} ${283}`} strokeDashoffset={`${-0.75 * 283}`}
                transform="rotate(-90 60 60)" />
              <circle cx="60" cy="60" r="45" fill="none" stroke={C.green} strokeWidth="18"
                strokeDasharray={`${0.09 * 283} ${283}`} strokeDashoffset={`${-(0.75 + 0.16) * 283}`}
                transform="rotate(-90 60 60)" />
              <text x="60" y="55" textAnchor="middle" fill={C.text} fontSize="14" fontWeight="800">48.3K</text>
              <text x="60" y="69" textAnchor="middle" fill={C.muted} fontSize="8">total users</text>
            </svg>
          </div>
          {[
            { label: "Bronze (Free)", pct: "75%", color: C.plum, count: "36.2K" },
            { label: "Silver ($5/yr)", pct: "16%", color: C.gold, count: "7.7K" },
            { label: "Gold ($24/yr)", pct: "9%", color: C.green, count: "4.4K" },
          ].map(p => (
            <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: p.color, flexShrink: 0 }} />
              <div style={{ fontSize: 12, color: C.muted, flex: 1 }}>{p.label}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{p.pct}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Recent Transactions</div>
          <button onClick={() => setPage("revenue")} style={{ fontSize: 12, color: C.plum2, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>View all →</button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: C.surface2 }}>
              {["Transaction", "User", "Amount", "Method", "Status", "Date"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_TRANSACTIONS.slice(0, 4).map(t => (
              <tr key={t.id} style={{ borderBottom: `1px solid ${C.border}` }}
                onMouseEnter={e => e.currentTarget.style.background = C.surface2}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "12px 16px", fontSize: 12, fontFamily: "monospace", color: C.blue }}>{t.id}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: C.text }}>{t.user}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: C.green }}>${t.amount}</td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: C.muted }}>
                  {t.method === "PayPal" ? "🅿 PayPal" : "💳 Card"}
                </td>
                <td style={{ padding: "12px 16px" }}><Badge type={t.status}>{t.status}</Badge></td>
                <td style={{ padding: "12px 16px", fontSize: 11, color: C.muted }}>{t.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  USERS PAGE
// ═══════════════════════════════════════════════════════
function UsersPage() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [editUser, setEditUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [editForm, setEditForm] = useState({});

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchFilter = filter === "All" || u.plan === filter || u.status === filter;
    return matchSearch && matchFilter;
  });

  const handleEdit = (u) => { setEditUser(u); setEditForm({ ...u }); };
  const handleSave = () => {
    setUsers(prev => prev.map(u => u.id === editForm.id ? editForm : u));
    setEditUser(null);
  };
  const handleDelete = (id) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    setDeleteConfirm(null);
  };
  const handleBan = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === "Banned" ? "Active" : "Banned" } : u));
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>User Management</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>{users.length} total users registered</div>
        </div>
        <button style={{
          padding: "10px 18px", background: "linear-gradient(135deg, #8B5CF6, #F43F8E)",
          border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, color: C.white,
          cursor: "pointer",
        }}>+ Add User</button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.muted }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search users..."
            style={{
              width: "100%", padding: "9px 14px 9px 36px", background: C.surface2,
              border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, color: C.text,
              outline: "none", boxSizing: "border-box",
            }} />
        </div>
        {["All", "Gold", "Silver", "Bronze", "Active", "Banned"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "8px 14px", borderRadius: 20, border: `1px solid ${filter === f ? C.plum : C.border}`,
            background: filter === f ? "rgba(139,92,246,0.15)" : C.surface2,
            color: filter === f ? C.plum2 : C.muted, fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>{f}</button>
        ))}
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: C.surface2 }}>
              {["User", "Plan", "Stories", "Revenue", "Joined", "Status", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} style={{ borderBottom: `1px solid ${C.border}`, transition: "background 0.15s", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = C.surface2}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                      background: "linear-gradient(135deg, #8B5CF6, #F43F8E)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
                    }}>{u.avatar}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{u.username}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "12px 16px" }}><Badge type={u.plan}>{u.plan}</Badge></td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: C.text }}>{u.stories}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: C.green }}>${u.revenue}</td>
                <td style={{ padding: "12px 16px", fontSize: 11, color: C.muted }}>{u.joined}</td>
                <td style={{ padding: "12px 16px" }}><Badge type={u.status}>{u.status}</Badge></td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 5 }}>
                    {[
                      { label: "👁", tip: "View", color: C.blue, onClick: () => setViewUser(u) },
                      { label: "✏️", tip: "Edit", color: C.gold, onClick: () => handleEdit(u) },
                      { label: u.status === "Banned" ? "✅" : "🚫", tip: u.status === "Banned" ? "Unban" : "Ban", color: u.status === "Banned" ? C.green : C.red, onClick: () => handleBan(u.id) },
                      { label: "🗑", tip: "Delete", color: C.red, onClick: () => setDeleteConfirm(u) },
                    ].map(b => (
                      <button key={b.tip} onClick={b.onClick} title={b.tip} style={{
                        padding: "5px 8px", borderRadius: 7, border: "none", cursor: "pointer",
                        background: C.surface3, fontSize: 12, transition: "all 0.15s",
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = `${b.color}20`}
                        onMouseLeave={e => e.currentTarget.style.background = C.surface3}
                      >{b.label}</button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View User Modal */}
      <Modal open={!!viewUser} onClose={() => setViewUser(null)} title={`👤 ${viewUser?.username}`}>
        {viewUser && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: "linear-gradient(135deg,#8B5CF6,#F43F8E)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{viewUser.avatar}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginTop: 10 }}>{viewUser.username}</div>
              <Badge type={viewUser.plan}>{viewUser.plan}</Badge>
            </div>
            {[
              ["Email", viewUser.email],
              ["Status", viewUser.status],
              ["Country", viewUser.country],
              ["Joined", viewUser.joined],
              ["Stories Published", viewUser.stories],
              ["Revenue Generated", `$${viewUser.revenue}`],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                <span style={{ color: C.muted }}>{k}</span>
                <span style={{ fontWeight: 600, color: C.text }}>{v}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="✏️ Edit User">
        {editUser && (
          <div>
            <Input label="USERNAME" value={editForm.username || ""} onChange={v => setEditForm(p => ({ ...p, username: v }))} icon="👤" />
            <Input label="EMAIL" value={editForm.email || ""} onChange={v => setEditForm(p => ({ ...p, email: v }))} icon="✉️" type="email" />
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 7 }}>PLAN</div>
              <div style={{ display: "flex", gap: 8 }}>
                {["Bronze", "Silver", "Gold"].map(p => (
                  <button key={p} onClick={() => setEditForm(prev => ({ ...prev, plan: p }))} style={{
                    flex: 1, padding: "9px", borderRadius: 10, border: `1px solid ${editForm.plan === p ? C.plum : C.border}`,
                    background: editForm.plan === p ? "rgba(139,92,246,0.15)" : C.surface2,
                    color: editForm.plan === p ? C.plum2 : C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}>{p}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 7 }}>STATUS</div>
              <div style={{ display: "flex", gap: 8 }}>
                {["Active", "Pending", "Banned"].map(s => (
                  <button key={s} onClick={() => setEditForm(prev => ({ ...prev, status: s }))} style={{
                    flex: 1, padding: "9px", borderRadius: 10, border: `1px solid ${editForm.status === s ? C.plum : C.border}`,
                    background: editForm.status === s ? "rgba(139,92,246,0.15)" : C.surface2,
                    color: editForm.status === s ? C.plum2 : C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}>{s}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setEditUser(null)} style={{ flex: 1, padding: "11px", border: `1px solid ${C.border}`, background: C.surface2, borderRadius: 10, color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleSave} style={{ flex: 2, padding: "11px", background: "linear-gradient(135deg,#8B5CF6,#F43F8E)", border: "none", borderRadius: 10, color: C.white, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Save Changes</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="🗑 Confirm Delete">
        {deleteConfirm && (
          <div>
            <div style={{ textAlign: "center", padding: "10px 0 24px", color: C.muted, fontSize: 14 }}>
              Are you sure you want to permanently delete <strong style={{ color: C.rose }}>{deleteConfirm.username}</strong>? This action cannot be undone.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: "11px", border: `1px solid ${C.border}`, background: C.surface2, borderRadius: 10, color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm.id)} style={{ flex: 1, padding: "11px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, color: C.red, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>🗑 Delete User</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  STORIES PAGE
// ═══════════════════════════════════════════════════════
function StoriesPage() {
  const [stories, setStories] = useState(MOCK_STORIES);
  const [search, setSearch] = useState("");

  const handleStatus = (id, status) => {
    setStories(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const filtered = stories.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Stories Management</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>{stories.length} stories in platform</div>
        </div>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.muted }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search stories..."
            style={{ padding: "9px 14px 9px 36px", background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, color: C.text, outline: "none", width: 220 }} />
        </div>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: C.surface2 }}>
              {["Story", "Author", "Genre", "Views", "Rating", "Status", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}` }}
                onMouseEnter={e => e.currentTarget.style.background = C.surface2}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{s.chapters} chapters</div>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: C.muted }}>{s.author}</td>
                <td style={{ padding: "12px 16px" }}><Badge type="Silver">{s.genre}</Badge></td>
                <td style={{ padding: "12px 16px", fontSize: 12, fontWeight: 600, color: C.blue }}>{s.views}</td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: C.gold }}>⭐ {s.rating}</td>
                <td style={{ padding: "12px 16px" }}><Badge type={s.status}>{s.status}</Badge></td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 5 }}>
                    {[
                      { label: "Approve", color: C.green, status: "Approved" },
                      { label: "Feature", color: C.gold, status: "Featured" },
                      { label: "Remove", color: C.red, status: "Flagged" },
                    ].map(b => (
                      <button key={b.label} onClick={() => handleStatus(s.id, b.status)} style={{
                        padding: "4px 10px", borderRadius: 7, border: `1px solid ${b.color}30`,
                        background: `${b.color}10`, color: b.color, fontSize: 11, fontWeight: 600, cursor: "pointer",
                      }}>{b.label}</button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  REVENUE PAGE
// ═══════════════════════════════════════════════════════
function RevenuePage() {
  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 6 }}>Revenue & Subscriptions</div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Track all incoming payments and subscription data</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Monthly Recurring", value: "$14,680", icon: "📅", color: C.plum },
          { label: "Annual Recurring", value: "$142,200", icon: "📆", color: C.gold },
          { label: "Pending Payouts", value: "$3,240", icon: "⏳", color: C.rose },
        ].map(s => (
          <div key={s.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Plan Breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 14, marginBottom: 24 }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>Revenue by Plan</div>
          {[
            { plan: "Gold ($24/yr)", count: "4,347", rev: "$104,328", pct: 73, color: C.gold },
            { plan: "Silver ($5/yr)", count: "7,724", rev: "$38,620", pct: 27, color: C.plum },
            { plan: "Bronze (Free)", count: "36.2K", rev: "$0", pct: 0, color: C.muted2 },
          ].map(p => (
            <div key={p.plan} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{p.plan}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{p.count} users</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.green, textAlign: "right" }}>
                  {p.rev}<div style={{ fontSize: 10, color: C.muted, fontWeight: 400 }}>{p.pct}% of revenue</div>
                </div>
              </div>
              <div style={{ height: 5, background: C.surface3, borderRadius: 3 }}>
                <div style={{ height: 5, width: `${p.pct}%`, background: p.color, borderRadius: 3, transition: "width 0.6s" }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Recent Transactions</div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: C.surface2 }}>
              {["User", "Plan", "Amount", "Method", "Status"].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, color: C.muted, fontWeight: 600 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {MOCK_TRANSACTIONS.map(t => (
                <tr key={t.id} style={{ borderBottom: `1px solid ${C.border}` }}
                  onMouseEnter={e => e.currentTarget.style.background = C.surface2}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "11px 14px", fontSize: 13, color: C.text }}>{t.user}</td>
                  <td style={{ padding: "11px 14px" }}><Badge type={t.plan}>{t.plan}</Badge></td>
                  <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 700, color: C.green }}>${t.amount}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: C.muted }}>{t.method === "PayPal" ? "🅿 " : "💳 "}{t.method}</td>
                  <td style={{ padding: "11px 14px" }}><Badge type={t.status}>{t.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  IMAGE GEN PAGE (Runware.ai)
// ═══════════════════════════════════════════════════════
function ImageGenPage({ apiKeys }) {
  const [prompt, setPrompt] = useState("");
  const [negPrompt, setNegPrompt] = useState("blurry, low quality, distorted");
  const [model, setModel] = useState("runware:100@1");
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(768);
  const [steps, setSteps] = useState(20);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [batchCount, setBatchCount] = useState(1);

  const MODELS = [
    { id: "runware:100@1", name: "Runware Turbo v1", desc: "Fast, high quality" },
    { id: "runware:101@1", name: "Runware HD v1", desc: "Ultra detail" },
    { id: "civitai:133005@782002", name: "Anything v5", desc: "Anime style" },
  ];

  const generate = async () => {
    if (!prompt.trim()) { setError("Please enter a prompt"); return; }
    if (!apiKeys.runware) { setError("Runware API key not set. Go to API Keys settings."); return; }
    setLoading(true); setError("");

    try {
      const socket = new WebSocket("wss://ws-api.runware.ai/v1");
      const results = [];

      await new Promise((resolve, reject) => {
        socket.onopen = () => {
          socket.send(JSON.stringify([{
            taskType: "authentication",
            apiKey: apiKeys.runware,
          }]));
        };
        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.error) { reject(new Error(data.error.message)); return; }
          const msgs = Array.isArray(data) ? data : [data];
          msgs.forEach(msg => {
            if (msg.taskType === "imageInference" && msg.imageURL) {
              results.push({ url: msg.imageURL, taskUUID: msg.taskUUID });
              if (results.length >= batchCount) { socket.close(); resolve(); }
            }
          });
          if (msgs[0]?.taskType === "authentication") {
            const tasks = Array.from({ length: batchCount }, (_, i) => ({
              taskType: "imageInference",
              taskUUID: `task-${Date.now()}-${i}`,
              positivePrompt: prompt,
              negativePrompt: negPrompt,
              model,
              width, height, steps,
              numberResults: 1,
              outputFormat: "WEBP",
            }));
            socket.send(JSON.stringify(tasks));
          }
        };
        socket.onerror = (e) => reject(new Error("WebSocket error"));
        setTimeout(() => reject(new Error("Timeout - check API key")), 60000);
      });

      setImages(prev => [...results.map((r, i) => ({
        id: Date.now() + i, url: r.url, prompt, model, timestamp: new Date().toLocaleTimeString(),
      })), ...prev]);
    } catch (err) {
      setError(`Generation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 6 }}>🎨 AI Image Generation</div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Powered by Runware.ai — generate story covers and comic panels</div>

      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 20 }}>
        {/* Controls */}
        <div>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>Generation Settings</div>

            {/* Prompt */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 7 }}>PROMPT</div>
              <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
                placeholder="A beautiful anime girl with purple hair in a fantasy kingdom, detailed illustration, cinematic lighting..."
                rows={4} style={{
                  width: "100%", padding: "10px 14px", background: C.surface2,
                  border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 12,
                  color: C.text, outline: "none", resize: "vertical",
                  lineHeight: 1.6, boxSizing: "border-box",
                }} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 7 }}>NEGATIVE PROMPT</div>
              <textarea value={negPrompt} onChange={e => setNegPrompt(e.target.value)}
                rows={2} style={{
                  width: "100%", padding: "10px 14px", background: C.surface2,
                  border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 12,
                  color: C.muted, outline: "none", resize: "vertical", boxSizing: "border-box",
                }} />
            </div>

            {/* Model */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 7 }}>MODEL</div>
              {MODELS.map(m => (
                <div key={m.id} onClick={() => setModel(m.id)} style={{
                  padding: "10px 14px", borderRadius: 10, border: `1px solid ${model === m.id ? C.plum : C.border}`,
                  background: model === m.id ? "rgba(139,92,246,0.1)" : C.surface2,
                  cursor: "pointer", marginBottom: 6, transition: "all 0.15s",
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: model === m.id ? C.plum2 : C.text }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{m.desc}</div>
                </div>
              ))}
            </div>

            {/* Size */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
              {[
                { label: "WIDTH", value: width, set: setWidth, opts: [512, 768, 1024] },
                { label: "HEIGHT", value: height, set: setHeight, opts: [512, 768, 1024] },
                { label: "STEPS", value: steps, set: setSteps, opts: [10, 20, 30, 50] },
              ].map(f => (
                <div key={f.label}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, marginBottom: 5 }}>{f.label}</div>
                  <select value={f.value} onChange={e => f.set(Number(e.target.value))} style={{
                    width: "100%", padding: "7px 10px", background: C.surface2,
                    border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12,
                    color: C.text, outline: "none",
                  }}>
                    {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 7 }}>BATCH COUNT: {batchCount}</div>
              <input type="range" min={1} max={4} value={batchCount} onChange={e => setBatchCount(Number(e.target.value))}
                style={{ width: "100%", accentColor: C.plum }} />
            </div>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px", fontSize: 12, color: C.red, marginBottom: 14 }}>
                ⚠️ {error}
              </div>
            )}

            <button onClick={generate} disabled={loading} style={{
              width: "100%", padding: "13px",
              background: loading ? C.muted2 : "linear-gradient(135deg,#8B5CF6,#F43F8E)",
              border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700,
              color: C.white, cursor: loading ? "default" : "pointer",
              boxShadow: loading ? "none" : "0 4px 20px rgba(139,92,246,0.35)",
            }}>
              {loading ? "⏳ Generating..." : `✨ Generate ${batchCount > 1 ? `${batchCount} Images` : "Image"}`}
            </button>
          </div>
        </div>

        {/* Gallery */}
        <div>
          {images.length === 0 ? (
            <div style={{
              background: C.surface, border: `2px dashed ${C.border}`, borderRadius: 16,
              padding: "60px 20px", textAlign: "center",
            }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>🖼</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.muted, marginBottom: 8 }}>No images generated yet</div>
              <div style={{ fontSize: 13, color: C.muted2 }}>Enter a prompt and click Generate to create AI images</div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 14 }}>{images.length} image{images.length !== 1 ? "s" : ""} generated</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                {images.map(img => (
                  <div key={img.id} style={{
                    background: C.surface, border: `1px solid ${C.border}`,
                    borderRadius: 14, overflow: "hidden", cursor: "pointer",
                    transition: "transform 0.2s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                    <img src={img.url} alt={img.prompt} style={{ width: "100%", display: "block" }} />
                    <div style={{ padding: "10px 12px" }}>
                      <div style={{ fontSize: 11, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{img.prompt}</div>
                      <div style={{ fontSize: 10, color: C.muted2, marginTop: 4 }}>{img.timestamp}</div>
                      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                        <a href={img.url} download style={{
                          flex: 1, padding: "5px", background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)",
                          borderRadius: 7, fontSize: 11, fontWeight: 600, color: C.plum2,
                          textDecoration: "none", textAlign: "center",
                        }}>⬇ Download</a>
                        <button onClick={() => setImages(prev => prev.filter(i => i.id !== img.id))} style={{
                          padding: "5px 8px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                          borderRadius: 7, fontSize: 11, color: C.red, cursor: "pointer",
                        }}>🗑</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  API KEYS PAGE
// ═══════════════════════════════════════════════════════
function APIKeysPage({ apiKeys, setApiKeys }) {
  const [visible, setVisible] = useState({});
  const [saved, setSaved] = useState({});
  const [localKeys, setLocalKeys] = useState({ ...apiKeys });

  useEffect(() => {
    setLocalKeys({ ...apiKeys });
  }, [apiKeys]);

  const handleSave = (key) => {
    setApiKeys(prev => ({ ...prev, [key]: localKeys[key] }));
    setSaved(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setSaved(prev => ({ ...prev, [key]: false })), 2000);
  };

  const API_CONFIGS = [
    {
      id: "gemini", name: "Google Gemini", icon: "G", color: C.google,
      label: "GEMINI API KEY", placeholder: "AIzaSy...",
      desc: "Used for AI story generation, summaries, and content moderation",
      docsUrl: "https://aistudio.google.com/app/apikey",
      models: ["gemini-1.5-pro", "gemini-2.0-flash", "gemini-pro-vision"],
    },
    {
      id: "mistral", name: "Mistral AI", icon: "M", color: "#FF7000",
      label: "MISTRAL API KEY", placeholder: "sk-...",
      desc: "Alternative LLM for story continuations and dialogue generation",
      docsUrl: "https://console.mistral.ai/api-keys/",
      models: ["mistral-large-latest", "mistral-medium", "mistral-small"],
    },
    {
      id: "runware", name: "Runware.ai", icon: "R", color: C.rose,
      label: "RUNWARE API KEY", placeholder: "your-api-key...",
      desc: "Generates story cover art and comic panels for creators",
      docsUrl: "https://runware.ai/",
      models: ["runware:100@1 (Turbo)", "runware:101@1 (HD)", "Civitai Models"],
    },
    {
      id: "openrouter", name: "OpenRouter", icon: "O", color: "#3B82F6",
      label: "OPENROUTER API KEY", placeholder: "sk-or-v1-...",
      desc: "Universal API to access Claude, Llama, OpenAI, and more for story generation",
      docsUrl: "https://openrouter.ai/keys",
      models: ["anthropic/claude-3-opus", "meta-llama/llama-3-70b", "openai/gpt-4-turbo", "google/gemini-1.5-pro"],
    },
  ];

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 6 }}>🔑 API Key Management</div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>Securely configure AI provider integrations</div>
      <div style={{
        background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
        borderRadius: 12, padding: "12px 16px", fontSize: 12, color: C.gold, marginBottom: 24,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        🔒 API keys are stored locally in your browser session. For production, use environment variables in your .env file.
      </div>

      {API_CONFIGS.map(api => (
        <div key={api.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "22px 24px", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: `${api.color}20`, border: `1px solid ${api.color}40`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 800, color: api.color,
            }}>{api.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{api.name}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{api.desc}</div>
            </div>
            <div style={{
              padding: "4px 10px", borderRadius: 20,
              background: localKeys[api.id] ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.1)",
              color: localKeys[api.id] ? C.green : C.red, fontSize: 11, fontWeight: 600,
            }}>
              {localKeys[api.id] ? "✓ Connected" : "Not configured"}
            </div>
          </div>

          {/* Available Models */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
            {api.models.map(m => (
              <span key={m} style={{
                padding: "3px 10px", borderRadius: 20, background: C.surface2,
                border: `1px solid ${C.border}`, fontSize: 11, color: C.muted,
              }}>{m}</span>
            ))}
          </div>

          {/* Key Input */}
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 7 }}>{api.label}</div>
              <div style={{ position: "relative" }}>
                <input
                  type={visible[api.id] ? "text" : "password"}
                  value={localKeys[api.id] || ""}
                  onChange={e => setLocalKeys(prev => ({ ...prev, [api.id]: e.target.value }))}
                  placeholder={api.placeholder}
                  style={{
                    width: "100%", padding: "10px 44px 10px 14px",
                    background: C.surface2, border: `1px solid ${C.border}`,
                    borderRadius: 10, fontSize: 13, color: C.text, outline: "none",
                    boxSizing: "border-box", fontFamily: "monospace",
                  }}
                  onFocus={e => e.target.style.borderColor = api.color}
                  onBlur={e => e.target.style.borderColor = C.border}
                />
                <button onClick={() => setVisible(p => ({ ...p, [api.id]: !p[api.id] }))} style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 14,
                }}>{visible[api.id] ? "🙈" : "👁"}</button>
              </div>
            </div>
            <button onClick={() => handleSave(api.id)} style={{
              padding: "11px 20px", borderRadius: 10, border: "none",
              background: saved[api.id] ? C.green : `${api.color}`,
              color: C.white, fontSize: 13, fontWeight: 700, cursor: "pointer",
              transition: "all 0.2s", whiteSpace: "nowrap", flexShrink: 0,
            }}>{saved[api.id] ? "✓ Saved!" : "Save Key"}</button>
            <a href={api.docsUrl} target="_blank" rel="noreferrer" style={{
              padding: "11px 14px", borderRadius: 10, border: `1px solid ${C.border}`,
              background: C.surface2, color: C.muted, fontSize: 12, fontWeight: 600,
              textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0,
            }}>Get Key ↗</a>
          </div>
        </div>
      ))}

      {/* ENV Guide */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "22px 24px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>📄 .env Configuration (Production)</div>
        <div style={{
          background: "#0D0B16", border: `1px solid ${C.border}`, borderRadius: 12,
          padding: "16px 18px", fontFamily: "monospace", fontSize: 12, lineHeight: 1.9,
          color: "#C8D3F5",
        }}>
          <div><span style={{ color: "#565F89" }}># ToonVault API Keys - .env file</span></div>
          <div><span style={{ color: "#BB9AF7" }}>OPENROUTER_API_KEY</span>=<span style={{ color: "#9ECE6A" }}>your_openrouter_key_here</span></div>
          <div><span style={{ color: "#BB9AF7" }}>GEMINI_API_KEY</span>=<span style={{ color: "#9ECE6A" }}>your_gemini_key_here</span></div>
          <div><span style={{ color: "#BB9AF7" }}>MISTRAL_API_KEY</span>=<span style={{ color: "#9ECE6A" }}>your_mistral_key_here</span></div>
          <div><span style={{ color: "#BB9AF7" }}>RUNWARE_API_KEY</span>=<span style={{ color: "#9ECE6A" }}>your_runware_key_here</span></div>
          <div><span style={{ color: "#BB9AF7" }}>PAYPAL_CLIENT_ID</span>=<span style={{ color: "#9ECE6A" }}>your_paypal_client_id</span></div>
          <div><span style={{ color: "#BB9AF7" }}>PAYPAL_SECRET</span>=<span style={{ color: "#9ECE6A" }}>your_paypal_secret</span></div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  PAYPAL SETUP PAGE
// ═══════════════════════════════════════════════════════
function PayPalPage({ apiKeys, setApiKeys }) {
  const [clientId, setClientId] = useState(apiKeys.paypalClientId || "");
  const [secret, setSecret] = useState(apiKeys.paypalSecret || "");
  const [mode, setMode] = useState("sandbox");
  const [webhookUrl, setWebhookUrl] = useState("https://yourdomain.com/api/webhooks/paypal");
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);

  const handleSave = () => {
    setApiKeys(prev => ({ ...prev, paypalClientId: clientId, paypalSecret: secret }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const testConnection = async () => {
    setTesting(true);
    await new Promise(r => setTimeout(r, 1500));
    setTesting(false);
  };

  const PLANS_CONFIG = [
    { name: "Silver", price: "5.00", currency: "USD", interval: "YEAR", productId: "TOONVAULT-SILVER" },
    { name: "Gold", price: "24.00", currency: "USD", interval: "YEAR", productId: "TOONVAULT-GOLD" },
  ];

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 6 }}>🅿 PayPal Integration</div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Configure PayPal subscriptions for Silver & Gold plans</div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {["sandbox", "live"].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: "10px 22px", borderRadius: 12,
            border: `1px solid ${mode === m ? C.paypal + "AA" : C.border}`,
            background: mode === m ? `rgba(0,48,135,0.15)` : C.surface2,
            color: mode === m ? "#4FC3F7" : C.muted,
            fontSize: 13, fontWeight: 600, cursor: "pointer", textTransform: "capitalize",
          }}>
            {m === "sandbox" ? "🧪 Sandbox (Testing)" : "🚀 Live (Production)"}
          </button>
        ))}
        {mode === "live" && (
          <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, fontSize: 12, color: C.red }}>
            ⚠️ Live mode processes real payments
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(0,48,135,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🅿</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>PayPal Credentials</div>
          </div>
          <Input label="CLIENT ID" value={clientId} onChange={setClientId} placeholder="AaBbCcDd..." icon="🔑" />
          <Input label="CLIENT SECRET" value={secret} onChange={setSecret} placeholder="EeFfGgHh..." icon="🔐" type="password" />
          <Input label="WEBHOOK URL" value={webhookUrl} onChange={setWebhookUrl} placeholder="https://..." icon="🔗" />
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button onClick={testConnection} disabled={testing} style={{
              flex: 1, padding: "11px", border: `1px solid ${C.border}`,
              background: C.surface2, borderRadius: 10, color: C.text, fontSize: 13, fontWeight: 600, cursor: testing ? "default" : "pointer",
            }}>{testing ? "⏳ Testing..." : "🔌 Test Connection"}</button>
            <button onClick={handleSave} style={{
              flex: 1, padding: "11px", background: saved ? C.green : `rgba(0,48,135,0.8)`,
              border: "none", borderRadius: 10, color: C.white, fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>{saved ? "✓ Saved!" : "💾 Save Config"}</button>
          </div>
        </div>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "22px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>💳 Subscription Plans</div>
          {PLANS_CONFIG.map(plan => (
            <div key={plan.name} style={{
              padding: "14px 16px", background: C.surface2, borderRadius: 12,
              border: `1px solid ${C.border}`, marginBottom: 10,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{plan.name} Plan</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.gold }}>${plan.price}/{plan.interval.toLowerCase()}</div>
              </div>
              <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace" }}>Product ID: {plan.productId}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button style={{ flex: 1, padding: "7px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface3, color: C.muted, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Edit Plan</button>
                <button style={{ flex: 1, padding: "7px", borderRadius: 8, border: "1px solid rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.08)", color: C.green, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Activate</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  SETTINGS PAGE
// ═══════════════════════════════════════════════════════
function SettingsPage({ user, onLogout }) {
  const [dbSettings, setDbSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/admin/settings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDbSettings(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const updateSetting = async (key, value) => {
    try {
      await axios.post('/api/admin/settings', { key, value }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDbSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) { console.error(err); }
  };

  const getVal = (key) => dbSettings.find(s => s.key === key)?.value;

  if (loading) return <div style={{ color: C.muted, padding: 20 }}>Loading settings...</div>;

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 24 }}>⚙️ Platform Settings</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* General Settings */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "22px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 18 }}>🌐 General Settings</div>
          <Input label="SITE NAME" value={getVal('site_name') || "ToonVault"} onChange={v => updateSetting('site_name', v)} icon="🏷" />
          <div style={{ marginTop: 20 }}>
             <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 10 }}>PLATFORM STATUS</div>
             <Toggle 
                label="Maintenance Mode" 
                checked={getVal('maintenance_mode') === 'true'} 
                onChange={v => updateSetting('maintenance_mode', v.toString())} 
              />
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: saved ? C.green : C.muted }}>
             {saved ? "✅ Setting saved!" : "Changes are saved automatically."}
          </div>
        </div>

        {/* Toggle Settings */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "22px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 10 }}>🔧 Popup & Interface</div>
          <div style={{ background: C.surface2, padding: "12px 16px", borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 16 }}>
            <Toggle 
              label="Show 'Become a Creator' Popup" 
              checked={getVal('show_creator_popup') === 'true'} 
              onChange={v => updateSetting('show_creator_popup', v.toString())} 
            />
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
              When enabled, the creator recruitment popup appears on the homepage for all visitors.
            </div>
          </div>
          <Toggle label="Auto-Approve Stories" checked={false} onChange={() => {}} />
          <Toggle label="Open Registrations" checked={true} onChange={() => {}} />
          <Toggle label="Email Notifications" checked={true} onChange={() => {}} />
        </div>

        {/* Payment Gateways */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "22px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 18 }}>💳 Payment Gateways</div>
          <div style={{ background: C.surface2, padding: "12px 16px", borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 16 }}>
            <Toggle 
              label="Enable PayPal Checkout" 
              checked={getVal('payment_paypal_enabled') === 'true'} 
              onChange={v => updateSetting('payment_paypal_enabled', v.toString())} 
            />
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
              When enabled, users can select PayPal during signup and membership upgrades.
            </div>
          </div>
          <div style={{ background: C.surface2, padding: "12px 16px", borderRadius: 12, border: `1px solid ${C.border}` }}>
            <Toggle 
              label="Enable Stripe Payments" 
              checked={getVal('payment_stripe_enabled') === 'true'} 
              onChange={v => updateSetting('payment_stripe_enabled', v.toString())} 
            />
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
              Allows credit card payments via Stripe. (Configuration required in backend)
            </div>
          </div>
        </div>

        {/* Admin Profile */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "22px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 18 }}>👤 Admin Profile</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, padding: "14px", background: C.surface2, borderRadius: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#8B5CF6,#F43F8E)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: C.white,
            }}>{user?.avatar || "A"}</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{user?.name || "Admin"}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{user?.email}</div>
            </div>
          </div>
          <button onClick={onLogout} style={{
            width: "100%", padding: "11px", marginTop: 8,
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 10, color: C.red, fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>🚪 Sign Out</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  ANALYTICS PAGE
// ═══════════════════════════════════════════════════════
function AnalyticsPage() {
  const topGenres = [
    { genre: "Romance Fantasy", views: "48.2M", pct: 100 },
    { genre: "Fantasy", views: "32.1M", pct: 67 },
    { genre: "BL/GL Romance", views: "18.6M", pct: 39 },
    { genre: "Sci-Fi", views: "14.3M", pct: 30 },
    { genre: "Thriller", views: "10.7M", pct: 22 },
    { genre: "Slice of Life", views: "8.4M", pct: 17 },
  ];

  const countries = [
    { name: "🇯🇵 Japan", users: "12.4K", pct: 26 },
    { name: "🇰🇷 Korea", users: "10.8K", pct: 22 },
    { name: "🇺🇸 United States", users: "9.2K", pct: 19 },
    { name: "🇮🇳 India", users: "7.1K", pct: 15 },
    { name: "🇧🇷 Brazil", users: "4.3K", pct: 9 },
    { name: "🌍 Others", users: "4.5K", pct: 9 },
  ];

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 24 }}>📈 Platform Analytics</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Genre Chart */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "22px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 18 }}>Top Genres by Views</div>
          {topGenres.map((g, i) => (
            <div key={g.genre} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{g.genre}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.blue }}>{g.views}</span>
              </div>
              <div style={{ height: 6, background: C.surface3, borderRadius: 3 }}>
                <div style={{
                  height: 6, borderRadius: 3, transition: "width 0.8s",
                  width: `${g.pct}%`,
                  background: `linear-gradient(90deg, ${[C.plum, C.rose, C.gold, C.blue, C.green, C.cyan][i]}, ${[C.plum2, C.roseDark, C.gold, C.cyan, C.green, C.blue][i]})`,
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Countries */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "22px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 18 }}>Users by Country</div>
          {countries.map((c, i) => (
            <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 28, fontSize: 13, fontWeight: 700, color: C.muted2 }}>#{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: C.text }}>{c.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.green }}>{c.users}</span>
                </div>
                <div style={{ height: 4, background: C.surface3, borderRadius: 2 }}>
                  <div style={{ height: 4, width: `${c.pct}%`, background: C.plum, borderRadius: 2 }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DAU Chart */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "22px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>Daily Active Users (7 days)</div>
          <svg viewBox="0 0 400 100" style={{ width: "100%" }}>
            {[20, 40, 60, 80, 100].map(y => <line key={y} x1="0" y1={y} x2="400" y2={y} stroke={C.border} strokeWidth="0.5" />)}
            {[42, 56, 48, 71, 63, 80, 75].map((v, i) => (
              <rect key={i} x={i * 55 + 8} y={100 - v} width={38} height={v}
                rx={4} fill={`rgba(139,92,246,${0.3 + i * 0.07})`}
                stroke={C.plum} strokeWidth="0.5" />
            ))}
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
              <text key={d} x={i * 55 + 26} y={115} textAnchor="middle" fill={C.muted2} fontSize="8">{d}</text>
            ))}
          </svg>
        </div>

        {/* Key Metrics */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "22px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 18 }}>Key Metrics</div>
          {[
            { label: "Avg. Session Duration", value: "14m 32s", change: "+2m", up: true },
            { label: "New Users Today", value: "342", change: "+18%", up: true },
            { label: "Chapter Completion Rate", value: "67%", change: "+3%", up: true },
            { label: "Churn Rate (Monthly)", value: "4.2%", change: "-0.8%", up: false },
            { label: "Conversion to Paid", value: "12.4%", change: "+1.1%", up: true },
            { label: "Avg Revenue per User", value: "$3.81", change: "+$0.42", up: true },
          ].map(m => (
            <div key={m.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 12, color: C.muted }}>{m.label}</span>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.text, marginRight: 8 }}>{m.value}</span>
                <span style={{ fontSize: 11, color: m.up ? C.green : C.red }}>{m.change}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════════
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [page, setPage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [apiKeys, setApiKeys] = useState({ gemini: "", mistral: "", runware: "", openrouter: "", paypalClientId: "", paypalSecret: "" });

  // Generation Wizards State
  const [showGenWizard, setShowGenWizard] = useState(false);
  const [genStep, setGenStep] = useState(1);
  const [genData, setGenData] = useState({ topic: "", prompt: "", images: 3, category: "Fantasy", status: "published" });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleFinishStory = async () => {
    setIsGenerating(true);
    try {
      const res = await axios.post('/api/stories/generate', genData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.status === 200) {
        setShowGenWizard(false);
        setGenStep(1);
        setPage("stories");
      }
    } catch (err) {
      console.error(err);
      alert("Story generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const GENRES_LIST = ["Romance", "Fantasy", "Action", "Drama", "Sci-Fi", "Horror", "Comedy", "Slice of Life"];

  useEffect(() => {
    // Fetch initial API keys from backend
    axios.get("/api/admin/apikeys", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
      .then(res => {
        setApiKeys(prev => ({ ...prev, ...res.data }));
      })
      .catch(err => console.error("Error fetching API keys:", err));
  }, []);
  const [notifications, setNotifications] = useState(3);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/user';
  };

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <DashboardPage setPage={setPage} />;
      case "users": return <UsersPage />;
      case "stories": return <StoriesPage />;
      case "revenue": return <RevenuePage />;
      case "analytics": return <AnalyticsPage />;
      case "imagegen": return <ImageGenPage apiKeys={apiKeys} />;
      case "apikeys": return <APIKeysPage apiKeys={apiKeys} setApiKeys={setApiKeys} />;
      case "payments": return <PayPalPage apiKeys={apiKeys} setApiKeys={setApiKeys} />;
      case "settings": return <SettingsPage user={user} onLogout={handleLogout} />;
      default: return <DashboardPage setPage={setPage} />;
    }
  };

  // Group nav items by section
  const sections = [...new Set(NAV_ITEMS.map(n => n.section))];

  const sideW = sidebarCollapsed ? 64 : 220;

  return (
    <div style={{
      display: "flex", minHeight: "100vh", background: C.bg,
      fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
      color: C.text,
    }}>
      <Helmet>
        <title>Admin Dashboard | ToonVault Control Center</title>
        <meta name="description" content="ToonVault administrative control center for managing users, stories, and platform analytics." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {/* ── SIDEBAR ── */}
      <aside style={{
        width: sideW, minHeight: "100vh", background: C.surface,
        borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column",
        position: "fixed", top: 0, left: 0, height: "100%", zIndex: 100,
        transition: "width 0.25s",
      }}>
        {/* Logo */}
        <div style={{ padding: "18px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, minHeight: 60, cursor: "pointer" }} onClick={() => navigate("/")}>
          <div style={{
            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
            background: "linear-gradient(135deg, #8B5CF6, #F43F8E)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
          }}>📖</div>
          {!sidebarCollapsed && (
            <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.3, whiteSpace: "nowrap" }}>
              Toon<span style={{ color: C.rose }}>Vault</span>
              <span style={{ fontSize: 10, color: C.muted, letterSpacing: 1, fontWeight: 600, marginLeft: 4 }}>ADMIN</span>
            </span>
          )}
          <button onClick={(e) => { e.stopPropagation(); setSidebarCollapsed(p => !p); }} style={{
            marginLeft: "auto", background: "none", border: "none", color: C.muted,
            cursor: "pointer", fontSize: 16, padding: "2px 4px", flexShrink: 0,
          }}>{sidebarCollapsed ? "›" : "‹"}</button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "10px 0", overflowY: "auto" }}>
          {sections.map(section => (
            <div key={section}>
              {!sidebarCollapsed && (
                <div style={{ fontSize: 9, fontWeight: 700, color: C.muted2, letterSpacing: 1.4, padding: "12px 16px 5px", textTransform: "uppercase" }}>{section}</div>
              )}
              {NAV_ITEMS.filter(n => n.section === section).map(item => {
                const active = page === item.id;
                return (
                  <div key={item.id} onClick={() => setPage(item.id)} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: sidebarCollapsed ? "10px 0" : "10px 16px",
                    justifyContent: sidebarCollapsed ? "center" : "flex-start",
                    cursor: "pointer", borderLeft: `3px solid ${active ? C.plum : "transparent"}`,
                    background: active ? "rgba(139,92,246,0.1)" : "transparent",
                    color: active ? C.plum2 : C.muted, fontSize: 13, fontWeight: 500,
                    transition: "all 0.15s",
                  }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = C.surface2; e.currentTarget.style.color = C.text; } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.muted; } }}
                  >
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                    {!sidebarCollapsed && (
                      <>
                        <span style={{ flex: 1, whiteSpace: "nowrap" }}>{item.label}</span>
                        {item.badge && notifications > 0 && (
                          <span style={{ background: C.rose, color: C.white, fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 10 }}>{notifications}</span>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Quick Actions */}
        {!sidebarCollapsed && (
          <div style={{ padding: "0 16px", marginBottom: 20 }}>
            <button 
              onClick={() => setShowGenWizard(true)}
              style={{
                width: "100%", padding: "12px", background: `linear-gradient(135deg, ${C.plum}, ${C.rose})`,
                color: "white", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 800,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: `0 8px 20px ${C.plum}40`, transition: "all 0.2s", marginBottom: 10
              }}
            >
              <span style={{ fontSize: 16 }}>✨</span> Write Story
            </button>
          </div>
        )}

        {/* User footer */}
        {!sidebarCollapsed && (
          <div style={{ padding: "14px 16px", borderTop: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#8B5CF6,#F43F8E)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0,
              }}>{user?.avatar || (user?.username || user?.name || "A")[0].toUpperCase()}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.username || user?.name || "Admin User"}</div>
                <div style={{ fontSize: 10, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ── MAIN ── */}
      <main style={{ marginLeft: sideW, flex: 1, display: "flex", flexDirection: "column", transition: "margin-left 0.25s", minHeight: "100vh" }}>
        {/* Topbar */}
        <div style={{
          height: 56, background: C.surface, borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", padding: "0 24px", gap: 14,
          position: "sticky", top: 0, zIndex: 50,
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, flex: 1, textTransform: "capitalize" }}>
            {NAV_ITEMS.find(n => n.id === page)?.icon} {NAV_ITEMS.find(n => n.id === page)?.label || "Dashboard"}
          </div>

          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 20, padding: "6px 14px" }}>
            <span style={{ fontSize: 13, color: C.muted }}>🔍</span>
            <input placeholder="Search..." style={{
              background: "none", border: "none", outline: "none",
              fontSize: 13, color: C.text, width: 160,
            }} />
          </div>

          {/* Notifications */}
          <button onClick={() => setNotifications(0)} style={{
            position: "relative", padding: "7px 10px", background: C.surface2,
            border: `1px solid ${C.border}`, borderRadius: 10, cursor: "pointer", fontSize: 15,
          }}>
            🔔
            {notifications > 0 && (
              <span style={{
                position: "absolute", top: 4, right: 4, width: 8, height: 8,
                borderRadius: "50%", background: C.rose, border: `1.5px solid ${C.surface}`,
              }} />
            )}
          </button>

          {/* Quick actions */}
          <button onClick={() => setPage("stories")} style={{
            padding: "7px 14px", background: "linear-gradient(135deg,#8B5CF6,#F43F8E)",
            border: "none", borderRadius: 10, fontSize: 12, fontWeight: 600, color: C.white, cursor: "pointer",
          }}>+ New Report</button>
        </div>

        {/* Content */}
        <div style={{ padding: "24px", flex: 1, overflowY: "auto" }}>
          {renderPage()}
        </div>
      </main>
      {/* ═══ GENERATION WIZARD MODAL ═══ */}
      {showGenWizard && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
          padding: 20
        }}>
          <div style={{
            background: C.surface, borderRadius: 24, width: "100%", maxWidth: 500,
            padding: 32, border: `1px solid ${C.border}`, boxShadow: "0 24px 64px rgba(0,0,0,0.5)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>
                {genStep === 1 ? "Step 1: Core Concept" : "Step 2: Configuration"}
              </div>
              <button onClick={() => setShowGenWizard(false)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 20 }}>✕</button>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
              {[1, 2].map(s => (
                <div key={s} style={{ height: 4, flex: 1, borderRadius: 2, background: s <= genStep ? C.plum : C.border }} />
              ))}
            </div>

            {genStep === 1 ? (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8, letterSpacing: 0.5 }}>STORY TOPIC / TITLE</div>
                <input 
                  type="text" 
                  value={genData.topic} 
                  onChange={e => setGenData({...genData, topic: e.target.value})}
                  placeholder="The Cyberpunk Samurai's Vow" 
                  style={{ width: "100%", padding: "14px 18px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, color: C.text, fontSize: 14, marginBottom: 22 }}
                />

                <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8, letterSpacing: 0.5 }}>STORY PREMISE (OPTIONAL)</div>
                <textarea 
                  value={genData.prompt}
                  onChange={e => setGenData({...genData, prompt: e.target.value})}
                  placeholder="Briefly describe the plot or characters..." 
                  style={{ width: "100%", height: 110, padding: "14px 18px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, color: C.text, fontSize: 14, resize: "none" }}
                />

                <button 
                  onClick={() => setGenStep(2)}
                  disabled={!genData.topic}
                  style={{ width: "100%", marginTop: 28, padding: "16px", background: C.plum, color: "white", border: "none", borderRadius: 14, fontWeight: 800, cursor: "pointer", opacity: genData.topic ? 1 : 0.5 }}
                >
                  Configure Options →
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 8 }}>AI PANELS</div>
                    <select 
                      value={genData.images}
                      onChange={e => setGenData({...genData, images: parseInt(e.target.value)})}
                      style={{ width: "100%", padding: "12px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, color: C.text }}
                    >
                      {[1, 3, 5, 8, 12].map(n => <option key={n} value={n}>{n} Panels</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 8 }}>CATEGORY</div>
                    <select 
                      value={genData.category}
                      onChange={e => setGenData({...genData, category: e.target.value})}
                      style={{ width: "100%", padding: "12px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, color: C.text }}
                    >
                      {GENRES_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 10 }}>STORY STATUS</div>
                <div style={{ display: "flex", gap: 12, marginBottom: 30 }}>
                  {["draft", "published", "pending"].map(s => (
                    <button 
                      key={s}
                      onClick={() => setGenData({...genData, status: s})}
                      style={{ 
                        flex: 1, padding: "12px", borderRadius: 12, border: `1px solid ${genData.status === s ? C.plum : C.border}`,
                        background: genData.status === s ? `${C.plum}15` : "transparent",
                        color: genData.status === s ? C.plum : C.muted,
                        fontSize: 12, fontWeight: 700, cursor: "pointer", textTransform: "capitalize"
                      }}
                    >{s}</button>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 14 }}>
                  <button onClick={() => setGenStep(1)} style={{ flex: 1, padding: "16px", background: "none", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 14, fontWeight: 700, cursor: "pointer" }}>Back</button>
                  <button 
                    onClick={handleFinishStory}
                    disabled={isGenerating}
                    style={{ flex: 2, padding: "16px", background: `linear-gradient(135deg, ${C.plum}, ${C.rose})`, color: "white", border: "none", borderRadius: 14, fontWeight: 800, cursor: "pointer" }}
                  >
                    {isGenerating ? "Processing AI..." : "🚀 Launch Generation"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}