import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useLocation } from "react-router-dom";

const COLORS = {
  bg: "#0A0910",
  card: "#110F1E",
  cardTint: "#1A1730",
  ink: "#EDE9FE",
  muted: "#7C6FAE",
  mutedLight: "#4C4570",
  plum: "#8B5CF6",
  plumLight: "#2C2848",
  plumDark: "#5B21B6",
  rose: "#F43F8E",
  roseLight: "#3D1A5C",
  gold: "#F59E0B",
  goldLight: "#3B2610",
  border: "#2C2848",
  success: "#10B981",
  successLight: "#064E3B",
  warning: "#F59E0B",
  warningLight: "#78350F",
  danger: "#EF4444",
  dangerLight: "#7F1D1D",
};

// ─── MOCK DATA ───────────────────────────────────────────────────────────────

const USER = {
  name: "Aanya Sharma",
  handle: "@aanya_reads",
  avatar: "🌸",
  plan: "Silver",
  planColor: COLORS.plum,
  joinDate: "Jan 2025",
  country: "India",
  coins: 340,
  streak: 12,
};

const USAGE = {
  articlesGenerated: 31,
  articlesLimit: 50,
  aiPanelsUsed: 11,
  aiPanelsLimit: 20,
  storiesRead: 87,
};

const STORIES_CREATED = [
  { id: 1, title: "Echoes of Tomorrow", genre: "Sci-Fi", cover: "🛸", views: "12.4K", likes: 890, status: "published", ranking: 24, bg: "#1E1B4B", updatedAt: "2 days ago" },
  { id: 2, title: "When Cherry Blossoms Fall", genre: "Romance", cover: "🌸", views: "4.1K", likes: 312, status: "published", ranking: 87, bg: "#31102A", updatedAt: "5 days ago" },
  { id: 3, title: "The Iron Witch", genre: "Fantasy", cover: "🧙‍♀️", views: "—", likes: 0, status: "draft", ranking: null, bg: "#2E1065", updatedAt: "Today" },
];

const READING_HISTORY = [
  { id: 1, title: "Crimson Throne", genre: "Romance Fantasy", cover: "💖", bg: "#31102A", progress: 78, lastRead: "Today", ep: "Ep 34" },
  { id: 2, title: "The Shadow Pact", genre: "Fantasy", cover: "🌙", bg: "#2E1065", progress: 45, lastRead: "Yesterday", ep: "Ep 15" },
  { id: 3, title: "Villain's Beloved", genre: "Dark Romance", cover: "🌹", bg: "#31102A", progress: 100, lastRead: "3 days ago", ep: "Completed" },
];

const PAYMENT_HISTORY = [
  { id: "TXN-2024-1182", date: "Apr 1, 2026", amount: "₹420", plan: "Silver Plan", status: "success", method: "UPI" },
  { id: "TXN-2025-0831", date: "Mar 1, 2026", amount: "₹420", plan: "Silver Plan", status: "success", method: "UPI" },
];

const GENRES_LIST = ["Romance", "Fantasy", "Action", "Drama", "Sci-Fi", "Horror", "Comedy", "Slice of Life"];

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, color = COLORS.plum, bg }) {
  return (
    <div style={{ background: bg || COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.border}`, padding: "18px 20px", display: "flex", alignItems: "flex-start", gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.ink }}>{value}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.muted }}>{label}</div>
      </div>
    </div>
  );
}

function UsageBar({ label, used, total, color = COLORS.plum, icon }) {
  const pct = Math.min((used / total) * 100, 100);
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.ink }}>{icon} {label}</span>
        <span style={{ fontSize: 12, color: COLORS.muted }}>{used} / {total}</span>
      </div>
      <div style={{ height: 8, background: COLORS.border, borderRadius: 8, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

function Badge({ plan }) {
  const colors = { Free: "#C08030", Silver: COLORS.plum, Gold: COLORS.gold, bronze: "#C08030" };
  const c = colors[plan?.toLowerCase()] || COLORS.plum;
  return (
    <span style={{ background: c + "18", color: c, border: `1px solid ${c}40`, borderRadius: 8, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>⭐ {plan}</span>
  );
}

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────

export default function ToonVaultUserDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [settings, setSettings] = useState({ site_name: "ToonVault", maintenance_mode: "false" });
  const [loading, setLoading] = useState(true);

  // Wizards
  const [showStoryWizard, setShowStoryWizard] = useState(false);
  const [storyStep, setStoryStep] = useState(1);
  const [storyData, setStoryData] = useState({ topic: "", prompt: "", images: 3, category: "Fantasy", status: "published" });
  
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Fetch Settings
    import('axios').then(({ default: axios }) => {
      axios.get('/api/settings/public').then(r => setSettings(prev => ({ ...prev, ...r.data })));
    });

    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setUserData(data);
        } else {
          window.location.href = '/user';
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const open = params.get('open');
    if (open === 'story') setShowStoryWizard(true);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/user';
  };

  if (loading) return <div style={{ background: COLORS.bg, height: "100vh" }} />;

  const displayUser = userData || USER;

  const TABS = [
    { id: "overview",   label: "Overview",          icon: "🏠" },
    { id: "stories",    label: "My Stories",         icon: "📖" },
    { id: "reading",    label: "Reading History",    icon: "👁" },
    { id: "generate",   label: "AI Generator",       icon: "✨" },
    { id: "usage",      label: "Usage & Plan",       icon: "📊" },
    { id: "payments",   label: "Payments",           icon: "💳" },
    { id: "settings",   label: "Settings",           icon: "⚙️" },
  ];

  const handleFinishStory = async () => {
    setIsGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/stories/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(storyData)
      });
      if (res.ok) {
        setShowStoryWizard(false);
        setStoryStep(1);
        setActiveTab("stories");
        navigate("/dashboard");
      } else {
        alert("Failed to generate story. Please check backend.");
      }
    } catch (err) {
      console.error(err);
      alert("Error calling backend generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: COLORS.bg, minHeight: "100vh", color: COLORS.ink }}>
      <Helmet><title>{settings.site_name} Dashboard</title></Helmet>

      {/* ── MAINTENANCE OVERLAY ── */}
      {settings.maintenance_mode === 'true' && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: COLORS.bg, color: "white", zIndex: 10000,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 20
        }}>
          <div style={{ fontSize: 60, marginBottom: 20 }}>🏗️</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12 }}>Under Maintenance</h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", maxWidth: 500 }}>
            {settings.site_name} is currently undergoing scheduled maintenance. We'll be back shortly!
          </p>
          <button onClick={() => { localStorage.removeItem("user"); localStorage.removeItem("token"); navigate("/"); }} style={{ marginTop: 24, padding: "10px 24px", background: COLORS.plum, border: "none", borderRadius: 12, color: "white", fontWeight: 700, cursor: "pointer" }}>Go Home</button>
        </div>
      )}

      <nav style={{ position: "sticky", top: 0, zIndex: 200, background: `${COLORS.card}E6`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", height: 62, display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate("/")}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, ${COLORS.plum}, ${COLORS.rose})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)" }}>📖</div>
            <span style={{ fontSize: 20, fontWeight: 800, color: COLORS.ink, letterSpacing: -0.5 }}>
              {settings.site_name.split('Vault')[0]}<span style={{ color: COLORS.rose }}>{settings.site_name.includes('Vault') ? 'Vault' : ''}</span>
            </span>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ fontSize: 14 }}>🪙 {displayUser.coins || 0}</div>
            <div style={{ fontSize: 14 }}>🔥 {displayUser.streak || 0}d</div>
            <button onClick={() => setNotifOpen(!notifOpen)} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 8, cursor: "pointer" }}>🔔</button>
            <button onClick={() => setProfileOpen(!profileOpen)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 24, cursor: "pointer" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: COLORS.plum }}>{displayUser.avatar || "👤"}</div>
              <span style={{ fontSize: 13 }}>{displayUser.username || "User"}</span>
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px", display: "flex", gap: 24 }}>
        <aside style={{ width: 220, flexShrink: 0 }}>
          <div style={{ background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.border}`, overflow: "hidden", marginBottom: 20 }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ width: "100%", padding: "12px 16px", background: activeTab === tab.id ? COLORS.plumLight : "transparent", border: "none", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 10, color: activeTab === tab.id ? COLORS.plum : COLORS.muted, cursor: "pointer", textAlign: "left", fontWeight: activeTab === tab.id ? 700 : 500 }}>
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>
          <button onClick={() => setShowStoryWizard(true)} style={{ width: "100%", padding: "14px", background: `linear-gradient(135deg, ${COLORS.plum}, ${COLORS.rose})`, color: "white", border: "none", borderRadius: 14, fontWeight: 800, cursor: "pointer", marginBottom: 10 }}>✨ Write Story</button>
        </aside>

        <main style={{ flex: 1 }}>
          {activeTab === "overview" && (
            <div>
              <div style={{ background: `linear-gradient(135deg, #3D1A5C, ${COLORS.plum})`, borderRadius: 20, padding: "28px 32px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h1 style={{ fontSize: 24, fontWeight: 800, color: "white", margin: 0 }}>Hi, {displayUser.username || "User"}!</h1>
                  <p style={{ color: "rgba(255,255,255,0.7)", margin: "4px 0 0" }}>Welcome back to your creator sanctuary.</p>
                </div>
                <button onClick={() => setShowStoryWizard(true)} style={{ padding: "12px 24px", background: "white", color: COLORS.plum, border: "none", borderRadius: 24, fontWeight: 700, cursor: "pointer" }}>✨ Start Creating</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
                <StatCard icon="📖" label="Stories" value={STORIES_CREATED.length} />
                <StatCard icon="👁" label="Total Views" value="12.4K" />
                <StatCard icon="🔥" label="Streak" value={displayUser.streak || 0} />
                <StatCard icon="🪙" label="Coins" value={displayUser.coins || 0} />
              </div>
            </div>
          )}

          {activeTab === "stories" && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>📖 My Stories</h2>
              {STORIES_CREATED.map(s => (
                <div key={s.id} style={{ background: COLORS.card, borderRadius: 16, padding: "16px", marginBottom: 12, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 50, height: 65, background: s.bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{s.cover}</div>
                  <div><div style={{ fontWeight: 700 }}>{s.title}</div><div style={{ fontSize: 12, color: COLORS.muted }}>{s.genre} • {s.status}</div></div>
                </div>
              ))}
            </div>
          )}
          
          {/* ... other tabs ... */}
          {activeTab === "reading" && <div><h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>👁 Reading History</h2>{READING_HISTORY.map(s => <div key={s.id} style={{ background: COLORS.card, borderRadius: 16, padding: "16px", marginBottom: 12, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 16 }}><div style={{ width: 40, height: 55, background: s.bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{s.cover}</div><div style={{ flex: 1 }}><div style={{ fontWeight: 700 }}>{s.title}</div><div style={{ height: 6, background: COLORS.border, borderRadius: 4, marginTop: 8, width: "60%" }}><div style={{ height: "100%", width: `${s.progress}%`, background: COLORS.plum, borderRadius: 4 }} /></div></div></div>)}</div>}
          {activeTab === "generate" && <div style={{ textAlign: "center", padding: "40px" }}><div style={{ fontSize: 40, marginBottom: 20 }}>✨</div><h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>AI Power Tools</h2><p style={{ color: COLORS.muted, marginBottom: 30 }}>Choose what you want to create with AI magic.</p><div style={{ display: "flex", gap: 16, justifyContent: "center" }}><button onClick={() => setShowStoryWizard(true)} style={{ padding: "20px 40px", background: COLORS.plum, color: "white", border: "none", borderRadius: 16, fontWeight: 700, cursor: "pointer" }}>Create Toon Story</button></div></div>}
          {activeTab === "usage" && <div><h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>📊 Usage & Plan</h2><div style={{ background: COLORS.card, borderRadius: 16, padding: "24px", border: `1px solid ${COLORS.border}` }}><UsageBar label="Article Gen" used={31} total={50} /><UsageBar label="AI Panels" used={11} total={20} color={COLORS.rose} /></div></div>}
          {activeTab === "payments" && <div><h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>💳 Payments</h2><div style={{ background: COLORS.card, borderRadius: 16, overflow: "hidden", border: `1px solid ${COLORS.border}` }}>{PAYMENT_HISTORY.map((p, i) => <div key={i} style={{ padding: "16px 20px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between" }}><div><div style={{ fontWeight: 700 }}>{p.plan}</div><div style={{ fontSize: 12, color: COLORS.muted }}>{p.date}</div></div><div style={{ textAlign: "right" }}><div style={{ fontWeight: 700 }}>{p.amount}</div><div style={{ fontSize: 12, color: COLORS.success }}>success</div></div></div>)}</div></div>}
          {activeTab === "settings" && <div><h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>⚙️ Settings</h2><div style={{ background: COLORS.card, borderRadius: 16, padding: "24px", border: `1px solid ${COLORS.border}` }}><div style={{ marginBottom: 20 }}><label style={{ display: "block", fontSize: 12, color: COLORS.muted, marginBottom: 8 }}>DISPLAY NAME</label><input defaultValue={displayUser.username} style={{ width: "100%", padding: "12px", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.ink }} /></div><button style={{ padding: "12px 24px", background: COLORS.plum, color: "white", border: "none", borderRadius: 10, fontWeight: 700 }}>Save Settings</button><button onClick={handleLogout} style={{ marginLeft: 12, padding: "12px 24px", background: "transparent", color: COLORS.danger, border: `1px solid ${COLORS.danger}`, borderRadius: 10, fontWeight: 700 }}>Logout</button></div></div>}
        </main>
      </div>

      {/* STORY WIZARD */}
      {showStoryWizard && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: COLORS.card, width: "100%", maxWidth: 500, borderRadius: 24, padding: 32, border: `1px solid ${COLORS.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>Story Generator Step {storyStep}/2</div>
              <button onClick={() => setShowStoryWizard(false)} style={{ background: "none", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 20 }}>✕</button>
            </div>
            {storyStep === 1 ? (
              <div>
                <input value={storyData.topic} onChange={e => setStoryData({...storyData, topic: e.target.value})} placeholder="Story Topic..." style={{ width: "100%", padding: "12px", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 12, color: COLORS.ink, marginBottom: 20 }} />
                <textarea value={storyData.prompt} onChange={e => setStoryData({...storyData, prompt: e.target.value})} placeholder="Detailed Prompt..." style={{ width: "100%", height: 100, padding: "12px", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 12, color: COLORS.ink, marginBottom: 20 }} />
                <button onClick={() => setStoryStep(2)} style={{ width: "100%", padding: "14px", background: COLORS.plum, color: "white", border: "none", borderRadius: 12, fontWeight: 700 }}>Next Step →</button>
              </div>
            ) : (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                  <select value={storyData.images} onChange={e => setStoryData({...storyData, images: e.target.value})} style={{ padding: "12px", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 12, color: COLORS.ink }}><option value="3">3 Panels</option><option value="5">5 Panels</option><option value="10">10 Panels</option></select>
                  <select value={storyData.category} onChange={e => setStoryData({...storyData, category: e.target.value})} style={{ padding: "12px", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 12, color: COLORS.ink }}>{GENRES_LIST.map(g => <option key={g} value={g}>{g}</option>)}</select>
                </div>
                <button onClick={handleFinishStory} style={{ width: "100%", padding: "14px", background: COLORS.plum, color: "white", border: "none", borderRadius: 12, fontWeight: 700 }}>{isGenerating ? "Generating..." : "✨ Launch Story"}</button>
              </div>
            )}
          </div>
        </div>
      )}


    </div>
  );
}
