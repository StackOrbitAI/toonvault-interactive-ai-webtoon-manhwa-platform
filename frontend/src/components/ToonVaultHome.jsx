import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const COLORS = {
  bg: "#FAF7F2",
  card: "#FFFFFF",
  cardTint: "#F6F0E8",
  ink: "#1F2430",
  muted: "#6B7280",
  mutedLight: "#9CA3AF",
  plum: "#6D4AE8",
  plumLight: "#EDE8FD",
  plumDark: "#4C2DB5",
  rose: "#E86A8A",
  roseLight: "#FDEEF3",
  gold: "#D79A2B",
  goldLight: "#FEF3DC",
  border: "#EDE8DF",
  success: "#2E8B6E",
};

const GENRES = [
  { id: "all", label: "All", emoji: "✨" },
  { id: "romance", label: "Romance", emoji: "💕" },
  { id: "fantasy", label: "Fantasy", emoji: "🏰" },
  { id: "drama", label: "Drama", emoji: "🎭" },
  { id: "action", label: "Action", emoji: "⚔️" },
  { id: "comedy", label: "Comedy", emoji: "😂" },
  { id: "sliceoflife", label: "Slice of Life", emoji: "🌸" },
  { id: "scifi", label: "Sci-Fi", emoji: "🚀" },
  { id: "supernatural", label: "Supernatural", emoji: "👻" },
  { id: "mystery", label: "Mystery", emoji: "🔍" },
  { id: "thriller", label: "Thriller", emoji: "😱" },
  { id: "bl", label: "BL", emoji: "💙" },
  { id: "gl", label: "GL", emoji: "💜" },
  { id: "historical", label: "Historical", emoji: "📜" },
  { id: "horror", label: "Horror", emoji: "🩸" },
  { id: "sports", label: "Sports", emoji: "🏆" },
  { id: "superhero", label: "Superhero", emoji: "⚡" },
  { id: "heartwarming", label: "Heartwarming", emoji: "🤍" },
  { id: "informative", label: "Informative", emoji: "📚" },
  { id: "graphic", label: "Graphic Novel", emoji: "🎨" },
  { id: "mature", label: "Mature 18+", emoji: "🔥" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Completed"];

const STORIES = [
  { title: "ToonVault Originals", subtitle: "Experience stories crafted by advanced AI.", genre: "AI Powered", badge: "NEW", bg: "linear-gradient(135deg, #3D1A5C 0%, #E8336D 100%)", cover: "✨" }
];

const TRENDING_COLLECTIONS = [
  { label: "MLs Locked In Love 💘", desc: "Zero doubts. Just pure love.", emoji: "💕" },
  { label: "Beyond Human, Beyond Hot 🚩", desc: "These non-humans are next level", emoji: "🔥" },
  { label: "Superpower Unleashed 🌟", desc: "Heroines with special powers", emoji: "⚡" },
  { label: "Rise of the Demon Lords 😈", desc: "Rulers of darkness", emoji: "👿" },
];

const FEATURED = [
  { title: "ToonVault Originals", subtitle: "Experience stories crafted by advanced AI.", genre: "AI Powered", badge: "NEW", bg: "linear-gradient(135deg, #3D1A5C 0%, #E8336D 100%)", cover: "✨" }
];

function StoryCard({ story, size = "normal" }) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const navigate = useNavigate();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 900;
  
  const cardWidth = isMobile 
    ? (size === "large" ? 150 : size === "small" ? 110 : 130)
    : (size === "large" ? 180 : size === "small" ? 130 : 155);

  return (
    <div style={{
      background: COLORS.card,
      borderRadius: 16,
      border: `1px solid ${COLORS.border}`,
      overflow: "hidden",
      cursor: "pointer",
      transition: "transform 0.2s, box-shadow 0.2s",
      flexShrink: 0,
      width: cardWidth,
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(109,74,232,0.12)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
      onClick={() => navigate(`/story/${story.id}`)}
    >
      <div style={{
        height: isMobile ? (size === "large" ? 190 : size === "small" ? 130 : 160) : (size === "large" ? 220 : size === "small" ? 150 : 185),
        background: story.bg || COLORS.plumLight,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size === "large" ? 60 : 48,
        position: "relative",
      }}>
        {String(story.cover || "").trim().includes("http") ? (
          <img src={String(story.cover).trim()} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={story.title} />
        ) : (
          <span>{story.cover || "📖"}</span>
        )}
        {story.updated && (
          <span style={{
            position: "absolute", top: 8, left: 8,
            background: COLORS.rose, color: "white",
            fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 6, letterSpacing: 0.5,
          }}>UP</span>
        )}
        {story.type === "novel" && (
          <span style={{
            position: "absolute", top: 8, right: 8,
            background: COLORS.gold, color: "white",
            fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 6,
          }}>NOVEL</span>
        )}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 60,
          background: "linear-gradient(to top, rgba(31,36,48,0.7), transparent)",
        }} />
        <div style={{
          position: "absolute", bottom: 8, right: 8, display: "flex", gap: 6,
        }}>
          <button onClick={e => { e.stopPropagation(); setBookmarked(!bookmarked); }} style={{
            background: bookmarked ? COLORS.plum : "rgba(255,255,255,0.85)",
            border: "none", borderRadius: 6, width: 28, height: 28,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: 13, color: bookmarked ? "white" : COLORS.ink, transition: "all 0.2s",
          }}>{bookmarked ? "🔖" : "🔖"}</button>
        </div>
      </div>
      <div style={{ padding: "10px 11px 11px" }}>
        <div style={{ fontSize: 10, color: COLORS.rose, fontWeight: 600, marginBottom: 3, letterSpacing: 0.4 }}>{story.genre}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.ink, marginBottom: 5, lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{story.title}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: COLORS.mutedLight }}>👁 {story.views}</span>
          <span style={{ fontSize: 11, color: COLORS.gold }}>⭐ {story.rating}</span>
        </div>
        {story.mood && (
          <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
            {story.mood.slice(0, 2).map(m => (
              <span key={m} style={{
                fontSize: 10, padding: "2px 7px", borderRadius: 10,
                background: COLORS.plumLight, color: COLORS.plum, fontWeight: 500,
              }}>{m}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HorizontalScroll({ children, gap = 14 }) {
  const ref = useRef();
  const scroll = dir => {
    ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => scroll(-1)} style={{
        position: "absolute", left: -14, top: "40%", zIndex: 10,
        background: COLORS.card, border: `1px solid ${COLORS.border}`,
        borderRadius: "50%", width: 34, height: 34, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, color: COLORS.ink, boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}>‹</button>
      <div ref={ref} style={{
        display: "flex", gap, overflowX: "auto", paddingBottom: 8,
        scrollbarWidth: "none", msOverflowStyle: "none",
      }}>
        {children}
      </div>
      <button onClick={() => scroll(1)} style={{
        position: "absolute", right: -14, top: "40%", zIndex: 10,
        background: COLORS.card, border: `1px solid ${COLORS.border}`,
        borderRadius: "50%", width: 34, height: 34, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, color: COLORS.ink, boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}>›</button>
    </div>
  );
}

function SectionHeader({ title, viewAll, sub, target }) {
  const navigate = useNavigate();
  const handleViewAll = () => {
    navigate('/browse');
  };

  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, gap: 10 }}>
      <div style={{ flex: 1 }}>
        <h2 className="section-title" style={{ fontSize: 20, fontWeight: 700, color: COLORS.ink, margin: 0, lineHeight: 1.2 }}>{title}</h2>
        {sub && <p style={{ fontSize: 13, color: COLORS.muted, margin: "4px 0 0", lineHeight: 1.4 }}>{sub}</p>}
      </div>
      {viewAll && (
        <button 
          onClick={handleViewAll}
          style={{ fontSize: 13, color: COLORS.plum, fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: "4px 10px", borderRadius: 8, transition: "background 0.2s", whiteSpace: "nowrap", flexShrink: 0 }}
          onMouseEnter={e => e.currentTarget.style.background = COLORS.plumLight}
          onMouseLeave={e => e.currentTarget.style.background = "none"}
        >View all →</button>
      )}
    </div>
  );
}

export default function ToonVaultHome() {
  const navigate = useNavigate();
  const [activeDay, setActiveDay] = useState("Mon");
  const [activeGenre, setActiveGenre] = useState("all");
  const [activeCategoryTab, setActiveCategoryTab] = useState("All");
  const [activeTrendingTab, setActiveTrendingTab] = useState("Trending");
  const [heroIndex, setHeroIndex] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [liveStories, setLiveStories] = useState([]);
  const featuredStories = liveStories.length > 0 ? liveStories.slice(0, 5) : STORIES;
  const [showPopup, setShowPopup] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [settings, setSettings] = useState({
    site_name: "ToonVault",
    maintenance_mode: "false",
    free_episode_interval_hrs: "3",
    show_creator_popup: "true"
  });
  const searchRef = useRef(null);
  const genreScrollRef = useRef();

  const scrollGenres = (dir) => {
    genreScrollRef.current?.scrollBy({ left: dir * 250, behavior: "smooth" });
  };

  useEffect(() => {
    axios.get('/api/stories')
      .then(res => {
        if (Array.isArray(res.data)) {
          const mapped = res.data.map(s => ({
            ...s,
            id: s._id,
            cover: s.panels && s.panels.length > 0 ? s.panels[0] : (s.coverIcon || "📖"),
            bg: "linear-gradient(135deg, #121315 0%, #1A1B1E 100%)",
            mood: s.genre ? [s.genre.toLowerCase()] : ["fantasy"],
            day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][Math.floor(Math.random() * 7)],
            updated: true,
            rating: s.rating || "4.9",
            views: s.views > 1000 ? (s.views / 1000).toFixed(1) + "K" : s.views
          }));
          setLiveStories(mapped);
        }
      })
      .catch(err => console.error("Error fetching stories:", err));
  }, []);

  useEffect(() => {
    // Fetch all public settings
    axios.get('/api/settings/public')
      .then(r => {
        setSettings(prev => ({ ...prev, ...r.data }));
        if (r.data.show_creator_popup === 'true') {
           setTimeout(() => setShowPopup(true), 2500);
        }
      })
      .catch(() => {
         // Fallback behavior if API fails or not set
         setTimeout(() => setShowPopup(true), 6000);
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
        setSearchVal("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchVal.trim()) {
      const filtered = liveStories.filter(s => 
        s.title.toLowerCase().includes(searchVal.toLowerCase()) ||
        s.genre?.toLowerCase().includes(searchVal.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 6));
    } else {
      setSearchResults([]);
    }
  }, [searchVal, liveStories]);

  useEffect(() => {
    const t = setInterval(() => setHeroIndex(i => (i + 1) % (featuredStories.length || 1)), 6000);
    return () => clearInterval(t);
  }, [featuredStories.length]);

  const categoryTabs = ["All", "Romance", "Fantasy", "Drama", "Action", "Comedy", "Thriller", "Sci-Fi", "Mystery", "Slice of Life"];
  
  useEffect(() => {
    if (activeGenre !== "all") {
      const genreLabel = GENRES.find(g => g.id === activeGenre)?.label;
      if (genreLabel) {
        setActiveCategoryTab(genreLabel);
        document.querySelector("#categories")?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [activeGenre]);

  const handleNav = (item) => {
    if (item.path) {
      navigate(item.path);
    } else if (item.target) {
      if (item.target.startsWith('/')) {
        navigate(item.target);
      } else {
        const el = document.querySelector(item.target);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  const dailyStories = liveStories.filter(s => s.day === activeDay);
  const featured = featuredStories[heroIndex] || (featuredStories.length > 0 ? featuredStories[0] : (STORIES[0] || { 
    title: "ToonVault Originals", 
    subtitle: "Experience stories crafted by advanced AI.", 
    genre: "AI Powered", 
    badge: "NEW", 
    bg: "linear-gradient(135deg, #3D1A5C 0%, #E8336D 100%)", 
    cover: "✨" 
  }));

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: COLORS.bg, minHeight: "100vh", color: COLORS.ink }}>

      <style>{`
        @media (max-width: 900px) {
          .desktop-only { display: none !important; }
          .search-container { width: 100% !important; max-width: 140px !important; }
          .hero-container { padding: 24px 16px !important; flex-direction: column !important; text-align: center !important; min-height: auto !important; gap: 20px !important; }
          .hero-content { max-width: 100% !important; margin-bottom: 0 !important; display: flex !important; flex-direction: column !important; align-items: center !important; }
          .hero-image { position: relative !important; right: auto !important; top: auto !important; bottom: auto !important; width: 100% !important; max-width: 140px !important; margin: 0 auto !important; order: -1 !important; transform: none !important; height: 180px !important; }
          .hero-title { font-size: 22px !important; line-height: 1.2 !important; margin-bottom: 8px !important; }
          .hero-subtitle { font-size: 13px !important; margin-bottom: 12px !important; }
          .collections-grid { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
          .schedule-grid { grid-template-columns: 1fr 1fr !important; gap: 12px !important; }
          .day-selector { flex-wrap: nowrap !important; overflow-x: auto !important; padding-bottom: 10px !important; -webkit-overflow-scrolling: touch !important; }
          .day-button { flex-shrink: 0 !important; font-size: 12px !important; padding: 6px 14px !important; }
          .banner-container { justify-content: center !important; padding: 0 10px !important; }
          .banner-item { font-size: 12px !important; padding: 8px 14px !important; }
          .section-title { font-size: 18px !important; }
          .fab-button { width: 44px !important; height: 44px !important; bottom: 20px !important; right: 20px !important; font-size: 20px !important; }
        }
        @media (min-width: 901px) {
          .mobile-only { display: none !important; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>

      {/* ═══ TOP NAV ═══ */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 200,
        background: COLORS.bg, // Solid background
        borderBottom: `1px solid ${COLORS.border}`,
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 32, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate("/")}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, ${COLORS.plum}, ${COLORS.rose})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: "0 4px 12px rgba(109,74,232,0.2)" }}>📖</div>
              <span style={{ fontSize: 20, fontWeight: 800, color: COLORS.ink, letterSpacing: -0.5 }}>
                Toon<span style={{ color: COLORS.rose }}>Vault</span>
              </span>
            </div>
          </div>

          <div className="desktop-only" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {[
              { label: "Originals", target: "#daily-schedule" },
              { label: "Rankings", target: "#rankings" },
              { label: "Canvas", target: "#collections" },
              { label: "Browse", target: "/browse" },
              { label: "Pricing", target: "#pricing" },
            ].map(item => (
              <button key={item.label} onClick={() => handleNav(item)} style={{
                padding: "8px 13px", border: "none", background: "none",
                fontSize: 14, fontWeight: 600, color: COLORS.ink, cursor: "pointer",
                borderRadius: 8, transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = COLORS.plumLight; e.currentTarget.style.color = COLORS.plum; }}
                onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = COLORS.ink; }}
              >{item.label}</button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 1, justifyContent: "flex-end", minWidth: 0 }}>
            <div ref={searchRef} style={{ position: "relative", minWidth: 0 }}>
              {searchOpen ? (
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input
                    autoFocus
                    value={searchVal}
                    onChange={e => {
                      setSearchVal(e.target.value);
                      if (!searchOpen) setSearchOpen(true);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && searchResults.length > 0) {
                        navigate(`/story/${searchResults[0].id}`);
                        setSearchOpen(false);
                      }
                    }}
                    placeholder="Search..."
                    className="search-container"
                    style={{
                      padding: "8px 60px 8px 12px", borderRadius: 20, border: `2px solid ${COLORS.plum}`,
                      background: COLORS.card, fontSize: 13, color: COLORS.ink, outline: "none", width: 220,
                      boxShadow: "0 4px 12px rgba(109,74,232,0.15)", transition: "all 0.3s",
                    }}
                  />
                  <button 
                    onClick={() => {
                      if (searchResults.length > 0) navigate(`/story/${searchResults[0].id}`);
                    }}
                    style={{ 
                      position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", 
                      fontSize: 10, background: COLORS.plum, color: "white", border: "none", 
                      borderRadius: 16, padding: "5px 10px", fontWeight: 700, cursor: "pointer"
                    }}
                  ><span className="desktop-only">Search</span><span className="mobile-only">🔍</span></button>
                  
                  {/* LIVE SEARCH DROPDOWN */}
                  {searchVal && (
                    <div style={{
                      position: "absolute", top: "110%", right: 0,
                      background: "white", borderRadius: 16, border: `1px solid ${COLORS.border}`,
                      boxShadow: "0 10px 30px rgba(0,0,0,0.12)", zIndex: 1000, overflow: "hidden",
                      width: 280, maxHeight: 400, overflowY: "auto"
                    }}>
                      {searchResults.length > 0 ? (
                        searchResults.map(s => (
                          <div key={s.id} 
                            onClick={() => { navigate(`/story/${s.id}`); setSearchOpen(false); setSearchVal(""); }}
                            style={{ 
                              display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", 
                              cursor: "pointer", borderBottom: `1px solid ${COLORS.border}`,
                              transition: "background 0.2s"
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = COLORS.plumLight}
                            onMouseLeave={e => e.currentTarget.style.background = "white"}
                          >
                            <div style={{ width: 40, height: 40, borderRadius: 6, background: "#f0f0f0", overflow: "hidden" }}>
                              {s.cover?.startsWith('http') ? (
                                <img src={s.cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              ) : (
                                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{s.cover || '📖'}</div>
                              )}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.ink }}>{s.title}</div>
                              <div style={{ fontSize: 11, color: COLORS.muted }}>{s.genre}</div>
                            </div>
                            <div style={{ fontSize: 12, color: COLORS.gold }}>⭐ {s.rating || "4.8"}</div>
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: "20px", textAlign: "center", color: COLORS.muted, fontSize: 13 }}>
                          No stories found 🔍
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={() => setSearchOpen(true)} style={{
                  padding: "8px 14px", border: `1px solid ${COLORS.border}`, background: COLORS.card,
                  borderRadius: 20, fontSize: 13, color: COLORS.muted, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.plum}
                >
                  🔍 <span className="desktop-only" style={{ fontWeight: 500 }}>Search...</span>
                </button>
              )}
            </div>

            <button className="desktop-only" onClick={() => navigate(isLoggedIn ? '/dashboard' : '/user')} style={{
              padding: "9px 18px", border: `1.5px solid ${COLORS.plum}`,
              background: isLoggedIn ? COLORS.plum : "transparent", borderRadius: 22, fontSize: 13,
              fontWeight: 600, color: isLoggedIn ? "white" : COLORS.plum, cursor: "pointer", whiteSpace: "nowrap"
            }}>{isLoggedIn ? "Dashboard" : "Log in"}</button>
            <button className="desktop-only" onClick={() => navigate('/creators')} style={{
              padding: "9px 20px", border: "none",
              background: `linear-gradient(135deg, ${COLORS.plum}, ${COLORS.plumDark})`,
              borderRadius: 22, fontSize: 13, fontWeight: 600, color: "white",
              cursor: "pointer", boxShadow: "0 2px 10px rgba(109,74,232,0.3)",
              display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap"
            }}><span>✨</span> Become Creator</button>

            <div className="mobile-only">
              <button onClick={() => setMobileMenuOpen(true)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: COLORS.ink }}>☰</button>
            </div>
          </div>
        </div>

        {/* MOBILE DRAWER */}
        {mobileMenuOpen && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.5)", zIndex: 1000,
            display: "flex", justifyContent: "flex-end"
          }} onClick={() => setMobileMenuOpen(false)}>
            <div style={{
              width: 280, height: "100%", background: "white", padding: "24px",
              display: "flex", flexDirection: "column", gap: 12,
              animation: "slideInRight 0.3s ease both"
            }} onClick={e => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <span style={{ fontWeight: 800, fontSize: 18, color: COLORS.plum }}>Menu</span>
                <button onClick={() => setMobileMenuOpen(false)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer" }}>×</button>
              </div>
              {[
                { label: "Originals", target: "#daily-schedule" },
                { label: "Rankings", target: "#rankings" },
                { label: "Canvas", target: "#collections" },
                { label: "Browse", target: "/browse" },
                { label: "Pricing", target: "#pricing" },
              ].map(item => (
                <div key={item.label} onClick={() => { handleNav(item); setMobileMenuOpen(false); }} style={{
                  padding: "12px 16px", borderRadius: 12, fontSize: 16, fontWeight: 500, color: COLORS.ink,
                  cursor: "pointer", borderBottom: `1px solid ${COLORS.border}`
                }}>{item.label}</div>
              ))}
              <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
                <button onClick={() => { navigate(isLoggedIn ? '/dashboard' : '/user'); setMobileMenuOpen(false); }} style={{
                  padding: "14px", border: `1.5px solid ${COLORS.plum}`,
                  background: isLoggedIn ? COLORS.plum : "transparent", borderRadius: 12, fontSize: 14,
                  fontWeight: 600, color: isLoggedIn ? "white" : COLORS.plum, cursor: "pointer",
                }}>{isLoggedIn ? "Dashboard" : "Log in"}</button>
                <button onClick={() => { navigate('/creators'); setMobileMenuOpen(false); }} style={{
                  padding: "14px", border: "none",
                  background: `linear-gradient(135deg, ${COLORS.plum}, ${COLORS.plumDark})`,
                  borderRadius: 12, fontSize: 13, fontWeight: 700, color: "white",
                  cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                }}>✨ Become Creator</button>
              </div>
            </div>
          </div>
        )}

        <div style={{ borderTop: `1px solid ${COLORS.border}`, position: "relative", display: "flex", alignItems: "center", maxWidth: 1280, margin: "0 auto", width: "100%" }}>
          <button onClick={() => scrollGenres(-1)} style={{ position: "absolute", left: 4, zIndex: 10, width: 32, height: 32, border: "none", borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.plum}, ${COLORS.rose})`, boxShadow: "0 4px 8px rgba(109,74,232,0.3)", cursor: "pointer", fontSize: 20, color: "white", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}>{"<"}</button>
          <div ref={genreScrollRef} style={{ display: "flex", gap: 6, padding: "8px 40px", overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none", width: "100%" }}>
            {GENRES.map(g => (
              <button key={g.id} onClick={() => navigate(`/browse?genre=${g.id === 'all' ? 'all' : g.label}`)} style={{
                padding: "5px 14px", borderRadius: 20,
                background: activeGenre === g.id ? COLORS.plum : COLORS.card,
                color: activeGenre === g.id ? "white" : COLORS.muted,
                fontSize: 12, fontWeight: 500, cursor: "pointer",
                whiteSpace: "nowrap", transition: "all 0.18s", flexShrink: 0,
                border: activeGenre === g.id ? "none" : `1px solid ${COLORS.border}`,
              }}>
                {g.emoji} {g.label}
              </button>
            ))}
          </div>
          <button onClick={() => scrollGenres(1)} style={{ position: "absolute", right: 4, zIndex: 10, width: 32, height: 32, border: "none", borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.plum}, ${COLORS.rose})`, boxShadow: "0 4px 8px rgba(109,74,232,0.3)", cursor: "pointer", fontSize: 20, color: "white", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}>{">"}</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>

        {/* ═══ HERO CAROUSEL ═══ */}
        <div style={{ padding: "24px 0 32px", position: "relative" }}>
          <div className="hero-container" style={{
            borderRadius: 24,
            background: featured.bg,
            padding: "48px 56px",
            minHeight: 380,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            overflow: "hidden", position: "relative", transition: "all 0.6s",
          }}>
            <div className="hero-content" style={{ maxWidth: 480, zIndex: 2, position: "relative" }}>
              <span style={{
                display: "inline-block",
                background: "rgba(255,255,255,0.2)", color: "white",
                fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 12,
                letterSpacing: 1, marginBottom: 14, backdropFilter: "blur(8px)",
              }}>{featured.badge}</span>
              <h1 className="hero-title" style={{ fontSize: 36, fontWeight: 800, color: "white", margin: "0 0 10px", lineHeight: 1.2, letterSpacing: -0.5 }}>{featured.title}</h1>
              <p className="hero-subtitle" style={{ fontSize: 16, color: "rgba(255,255,255,0.82)", margin: "0 0 8px", lineHeight: 1.6 }}>{featured.subtitle}</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: "0 0 28px" }}>{featured.genre}</p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "inherit" }}>
                <button onClick={() => {
                  const story = liveStories.find(s => s.title === featured.title);
                  if (story) navigate(`/story/${story.id}`);
                  else navigate(`/story/1`);
                }} style={{
                  padding: "12px 28px", background: "white", color: COLORS.plum,
                  border: "none", borderRadius: 24, fontSize: 14, fontWeight: 700, cursor: "pointer",
                }}>▶ Start reading</button>
                <button onClick={() => navigate('/creators')} style={{
                  padding: "12px 24px", background: `linear-gradient(135deg, ${COLORS.plum}, ${COLORS.rose})`,
                  color: "white", border: "none",
                  borderRadius: 24, fontSize: 14, fontWeight: 600, cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(232,106,138,0.4)",
                  display: "flex", alignItems: "center", gap: 8
                }}><span>✨</span> Become ToonVault Creator</button>
              </div>
            </div>
            <div className="hero-image" style={{ position: "absolute", right: 60, top: "10%", bottom: "10%", width: 280, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
              {String(featured.cover || "").trim().includes("http") ? (
                <img src={String(featured.cover).trim()} style={{ height: "100%", borderRadius: 16, boxShadow: "0 20px 40px rgba(0,0,0,0.3)", transform: "rotate(3deg)" }} />
              ) : (
                <div style={{ fontSize: 120, opacity: 0.4, filter: "blur(1px)" }}>{featured.cover}</div>
              )}
            </div>
            <div style={{ position: "absolute", right: 180, top: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
            <div style={{ position: "absolute", right: 100, bottom: -60, width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, justifyContent: "center" }}>
            {featuredStories.map((f, i) => (
              <button key={i} onClick={() => setHeroIndex(i)} style={{
                width: i === heroIndex ? 28 : 8, height: 8,
                borderRadius: 6, border: "none", cursor: "pointer", transition: "all 0.3s",
                background: i === heroIndex ? COLORS.plum : COLORS.border,
              }} />
            ))}
          </div>
        </div>

        {/* ═══ ANNOUNCEMENT BANNERS ═══ */}
        <div className="banner-container" style={{ display: "flex", gap: 12, marginBottom: 36, overflowX: "auto", scrollbarWidth: "none" }}>
          {[
            { text: "22 comics · 2,300+ episodes 📚 Dive all the way in!", color: COLORS.plumLight, accent: COLORS.plum },
            { text: "Check in daily & catch 100 free episodes!", color: "#FEF3DC", accent: COLORS.gold },
            { text: "Mature versions available 🔥 Spicier cuts on website!", color: COLORS.roseLight, accent: COLORS.rose },
          ].map((b, i) => (
            <div key={i} className="banner-item" style={{
              flexShrink: 0, background: b.color, border: `1px solid ${b.accent}30`,
              borderRadius: 12, padding: "10px 18px",
              fontSize: 13, fontWeight: 500, color: b.accent, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
              whiteSpace: "nowrap",
            }}>
              <span style={{ fontSize: 16 }}>📣</span> {b.text}
            </div>
          ))}
        </div>

        {/* ═══ TRENDING & POPULAR ═══ */}
        <section style={{ marginBottom: 44 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
            <h2 className="section-title" style={{ fontSize: 20, fontWeight: 700, color: COLORS.ink, margin: 0 }}>🔥 Trending & Popular</h2>
            {["Trending", "Popular", "New"].map(tab => (
              <button key={tab} 
                onClick={() => setActiveTrendingTab(tab)}
                style={{
                  padding: "5px 14px", border: `1px solid ${COLORS.border}`,
                  background: activeTrendingTab === tab ? COLORS.plum : COLORS.card,
                  color: activeTrendingTab === tab ? "white" : COLORS.muted,
                  borderRadius: 16, fontSize: 12, fontWeight: 500, cursor: "pointer",
                  transition: "all 0.2s"
                }}>{tab}</button>
            ))}
            <button 
              onClick={() => navigate('/browse')}
              style={{ marginLeft: "auto", fontSize: 13, color: COLORS.plum, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}
            >View all →</button>
          </div>
          <HorizontalScroll>
            {liveStories.filter(s => {
              if (activeTrendingTab === "New") return s.badge === "NEW" || true; // Just a mock for now
              if (activeTrendingTab === "Popular") return parseFloat(s.rating) > 4.5;
              return true; // Trending as default
            }).slice(0, 10).map(s => <StoryCard key={s.id} story={s} size="large" />)}
          </HorizontalScroll>
        </section>

        {/* ═══ POPULAR BY CATEGORY ═══ */}
        <section id="categories" style={{ marginBottom: 44, scrollMarginTop: 80 }}>
          <SectionHeader title="📚 Popular by Category" viewAll />
          <div className="day-selector" style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {categoryTabs.map(tab => (
              <button key={tab} className="day-button" onClick={() => setActiveCategoryTab(tab)} style={{
                padding: "7px 18px", borderRadius: 20,
                background: activeCategoryTab === tab ? COLORS.plum : COLORS.card,
                color: activeCategoryTab === tab ? "white" : COLORS.muted,
                fontSize: 13, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap",
                border: activeCategoryTab === tab ? "none" : `1px solid ${COLORS.border}`,
                transition: "all 0.18s",
              }}>{tab}</button>
            ))}
          </div>
          <HorizontalScroll>
            {liveStories.filter(s => {
              if (activeCategoryTab === "All") return true;
              const genreStr = Array.isArray(s.genre) ? s.genre.join(' ') : (s.genre || "");
              return genreStr.toLowerCase().includes(activeCategoryTab.toLowerCase());
            }).map(s => <StoryCard key={s.id} story={s} />)}
          </HorizontalScroll>
        </section>

        {/* ═══ THEMATIC COLLECTIONS ═══ */}
        <section id="collections" style={{ marginBottom: 44, scrollMarginTop: 80 }}>
          <SectionHeader title="💫 Collections for You" sub="Handpicked themes our readers love" viewAll />
          <div className="collections-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
            {TRENDING_COLLECTIONS.map((c, i) => (
              <div key={i} style={{
                background: i % 2 === 0 ? COLORS.plumLight : COLORS.roseLight,
                borderRadius: 16, padding: "18px 20px", cursor: "pointer",
                border: `1px solid ${i % 2 === 0 ? "#D4C8FA" : "#F5C8D8"}`,
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(109,74,232,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>{c.emoji}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.ink, marginBottom: 4 }}>{c.label}</div>
                <div style={{ fontSize: 12, color: COLORS.muted }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ TOP RANKING ═══ */}
        <section id="ranking" style={{ marginBottom: 44, scrollMarginTop: 80 }}>
          <SectionHeader title="🏆 Top Ranking" sub="The most read stories this week" viewAll />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {liveStories.slice(0, 3).map((s, i) => (
              <div key={s.id} onClick={() => navigate(`/story/${s.id}`)} style={{
                display: "flex", gap: 16, background: COLORS.card, borderRadius: 16, 
                padding: "12px", border: `1px solid ${COLORS.border}`, cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.plum}
              onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}
              >
                <div style={{ position: "relative", width: 80, height: 110, borderRadius: 10, overflow: "hidden", background: s.bg, flexShrink: 0 }}>
                   <div style={{ 
                     position: "absolute", top: 0, left: 0, padding: "2px 8px", 
                     background: i === 0 ? COLORS.gold : i === 1 ? "#A1A1AA" : "#CD7F32",
                     color: "white", fontSize: 16, fontWeight: 900, borderBottomRightRadius: 10 
                   }}>{i + 1}</div>
                   <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
                     {String(s.cover || "").trim().includes("http") ? (
                       <img src={String(s.cover).trim()} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                     ) : s.cover}
                   </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <div style={{ fontSize: 11, color: COLORS.rose, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>{s.genre}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.ink, marginBottom: 6 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{s.description}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: COLORS.mutedLight }}>
                    <span>👁 {s.views}</span>
                    <span>⭐ {s.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ NEWLY RELEASED ═══ */}
        <section style={{ marginBottom: 44 }}>
          <SectionHeader title="✨ Newly Released" sub="Fresh stories just went live" viewAll />
          <HorizontalScroll>
            {liveStories.slice(8).map(s => <StoryCard key={s.id} story={s} size="normal" />)}
          </HorizontalScroll>
        </section>

        {/* ═══ DAILY SCHEDULE ═══ */}
        <section id="daily-schedule" style={{ marginBottom: 44, scrollMarginTop: 80 }}>
          <SectionHeader title="📅 Daily Schedule" viewAll />
          <div className="day-selector" style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap", scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {DAYS.map(day => (
              <button key={day} className="day-button" onClick={() => setActiveDay(day)} style={{
                padding: "7px 16px", borderRadius: 20,
                background: activeDay === day ? COLORS.plum : COLORS.card,
                color: activeDay === day ? "white" : COLORS.muted,
                fontSize: 13, fontWeight: 500, cursor: "pointer",
                border: activeDay === day ? "none" : `1px solid ${COLORS.border}`,
                transition: "all 0.18s",
                whiteSpace: "nowrap"
              }}>{day}</button>
            ))}
          </div>
          {dailyStories.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: COLORS.muted, fontSize: 14 }}>
              No updates scheduled for this day — check back soon! 🌙
            </div>
          ) : (
            <div className="schedule-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: 14 }}>
              {dailyStories.map(s => <StoryCard key={s.id} story={s} size="small" />)}
            </div>
          )}
        </section>

        {/* ═══ RANKINGS ═══ */}
        <section id="rankings" style={{ marginBottom: 44, scrollMarginTop: 80 }}>
          <SectionHeader title="🏆 Rankings" sub="Most read this week" viewAll />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 10 }}>
            {liveStories.slice(0, 8).map((s, i) => (
              <div key={s.id} style={{
                display: "flex", alignItems: "center", gap: 14,
                background: COLORS.card, borderRadius: 14, padding: "12px 14px",
                border: `1px solid ${COLORS.border}`, cursor: "pointer", transition: "all 0.2s",
              }}
                onClick={() => navigate(`/story/${s.id}`)}
                onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.plum + "60"; e.currentTarget.style.background = COLORS.plumLight + "50"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.background = COLORS.card; }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: i < 3 ? `linear-gradient(135deg, ${COLORS.plum}, ${COLORS.rose})` : COLORS.border,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: i < 3 ? 15 : 13, fontWeight: 800,
                  color: i < 3 ? "white" : COLORS.muted,
                }}>
                  {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
                </div>
                <div style={{
                  width: 42, height: 54, borderRadius: 8, flexShrink: 0,
                  background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", 
                  fontSize: 20, overflow: "hidden"
                }}>
                  {String(s.cover || "").trim().includes("http") ? (
                    <img src={String(s.cover).trim()} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : s.cover}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.ink, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: COLORS.muted }}>{s.genre}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.plum }}>{s.views}</div>
                  <div style={{ fontSize: 10, color: COLORS.mutedLight }}>views</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ INDIE CREATORS ═══ */}
        <section style={{ marginBottom: 44 }}>
          <SectionHeader title="🌱 Indie Creator Spotlight" sub="Stories from independent creators" viewAll />
          <HorizontalScroll>
            {liveStories.slice(5, 14).map(s => <StoryCard key={s.id} story={s} size="small" />)}
          </HorizontalScroll>
        </section>

        {/* ═══ FREE TO READ SECTION ═══ */}
        <section style={{ marginBottom: 44 }}>
          <div style={{
            background: `linear-gradient(135deg, ${COLORS.plumLight} 0%, ${COLORS.roseLight} 100%)`,
            borderRadius: 20, padding: "28px 32px",
            border: `1px solid ${COLORS.border}`,
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20,
          }}>
            <div>
              <div style={{ fontSize: 24, marginBottom: 6 }}>⏰</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: COLORS.ink, margin: "0 0 6px" }}>Free every {settings.free_episode_interval_hrs} hours!</h3>
              <p style={{ fontSize: 14, color: COLORS.muted, margin: 0, maxWidth: 380 }}>New episodes unlock automatically. Follow your favorites and never miss an update — no coins needed.</p>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button 
                onClick={() => navigate('/browse')}
                style={{
                padding: "12px 26px", background: COLORS.plum, color: "white",
                border: "none", borderRadius: 24, fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}>Browse free stories</button>
              <button style={{
                padding: "12px 26px", background: "white", color: COLORS.plum,
                border: `1.5px solid ${COLORS.plum}`, borderRadius: 24, fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}>Get the app</button>
            </div>
          </div>
        </section>

        {/* ═══ FOR CREATORS CTA ═══ */}
        <section id="creators" style={{ marginBottom: 44, scrollMarginTop: 80 }}>
          <div style={{
            background: `linear-gradient(135deg, ${COLORS.ink} 0%, #3D1A5C 100%)`,
            borderRadius: 20, padding: "40px 44px",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24,
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", right: 60, top: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(109,74,232,0.15)" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.rose, letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 10 }}>Creators 101</span>
              <h3 style={{ fontSize: 26, fontWeight: 800, color: "white", margin: "0 0 10px", lineHeight: 1.2 }}>Publish your story.<br />Own your world.</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", margin: "0 0 24px", lineHeight: 1.7, maxWidth: 420 }}>Build branching interactive stories, grow a fanbase, and earn royalties. ToonVault's creator tools are built for writers who take storytelling seriously.</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {["✏️ Start writing", "👥 Build a team", "📊 Earn royalties"].map((f, i) => (
                  <span key={i} style={{
                    fontSize: 13, color: "rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.1)",
                    padding: "6px 14px", borderRadius: 16,
                  }}>{f}</span>
                ))}
              </div>
            </div>
            <button onClick={() => setShowAIModal(true)} style={{
              position: "relative", zIndex: 1,
              padding: "14px 32px", background: COLORS.plum, color: "white",
              border: "none", borderRadius: 28, fontSize: 15, fontWeight: 700,
              cursor: "pointer", whiteSpace: "nowrap",
              boxShadow: "0 4px 16px rgba(109,74,232,0.4)",
            }}>✏️ Start publishing free</button>
          </div>
        </section>

        {/* ═══ PREMIUM MEMBERSHIP PLANS ═══ */}
        <section id="pricing" style={{ marginBottom: 80, scrollMarginTop: 80 }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: COLORS.ink, marginBottom: 12 }}>Choose Your Journey</h2>
            <p style={{ fontSize: 16, color: COLORS.muted, maxWidth: 500, margin: "0 auto" }}>Unlock unlimited storytelling and support your favorite creators.</p>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {[
              { name: "Free", price: "0", accent: COLORS.muted, bg: COLORS.card, features: ["Read 10 stories/mo", "5 AI Generations", "Community access", "Standard reading"] },
              { name: "Bronze", price: settings.price_bronze || "4.99", accent: COLORS.plum, bg: COLORS.plumLight+"10", features: ["Read 50 stories/mo", "20 AI Generations", "Advanced AI tools", "No ads", "Offline reading"] },
              { name: "Silver", price: settings.price_silver || "9.99", accent: COLORS.rose, bg: COLORS.roseLight+"10", popular: true, features: ["Read 100 stories/mo", "50 AI Generations", "Priority AI gen", "Early access", "Custom themes"] },
              { name: "Gold", price: settings.price_gold || "19.99", accent: COLORS.gold, bg: COLORS.goldLight+"10", features: ["Unlimited reading", "Unlimited AI Generations", "Pro AI studio", "Direct support", "Exclusive content"] }
            ].map((plan, i) => (
              <div key={i} style={{
                background: plan.bg, borderRadius: 24, padding: "36px 30px",
                border: `2px solid ${plan.popular ? plan.accent : COLORS.border}`,
                position: "relative", textAlign: "left", transition: "transform 0.3s",
                boxShadow: plan.popular ? "0 15px 30px rgba(109,74,232,0.1)" : "none",
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-8px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                {plan.popular && (
                  <div style={{
                    position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                    background: plan.accent, color: "white", padding: "4px 16px", borderRadius: 20,
                    fontSize: 10, fontWeight: 800, textTransform: "uppercase"
                  }}>Most Popular</div>
                )}
                <div style={{ fontSize: 22, fontWeight: 800, color: plan.accent, marginBottom: 8 }}>{plan.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 24 }}>
                  <span style={{ fontSize: 32, fontWeight: 900 }}>${plan.price}</span>
                  <span style={{ fontSize: 14, color: COLORS.muted }}>/mo</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                  {plan.features.map((f, fi) => (
                    <div key={fi} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: COLORS.ink, fontWeight: 500 }}>
                      <span style={{ color: plan.accent }}>✓</span> {f}
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => navigate(`/user?plan=${plan.name}`)}
                  style={{
                    width: "100%", padding: "14px", borderRadius: 14,
                    background: plan.popular ? plan.accent : "white",
                    color: plan.popular ? "white" : plan.accent,
                    border: `1.5px solid ${plan.accent}`,
                    fontSize: 14, fontWeight: 700, cursor: "pointer"
                  }}
                >
                  {plan.price === "0" ? "Start Free" : "Upgrade Now"}
                </button>
              </div>
            ))}
          </div>
        </section>
        {/* ═══ ABOUT SECTION ═══ */}
        <section id="about" style={{ marginBottom: 80, scrollMarginTop: 80, padding: "60px 0", borderTop: `1px solid ${COLORS.border}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 40, alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: 32, fontWeight: 900, color: COLORS.ink, marginBottom: 20 }}>Every Choice Matters.</h2>
              <p style={{ fontSize: 16, color: COLORS.muted, lineHeight: 1.8, marginBottom: 24 }}>
                ToonVault is the world's first AI-powered interactive storytelling platform. We bridge the gap between creators and readers by providing state-of-the-art AI tools to build worlds that react to reader choices.
              </p>
              <div style={{ display: "flex", gap: 20 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: COLORS.plum }}>50k+</div>
                  <div style={{ fontSize: 12, color: COLORS.muted }}>Stories</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: COLORS.rose }}>1M+</div>
                  <div style={{ fontSize: 12, color: COLORS.muted }}>Readers</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: COLORS.gold }}>10k+</div>
                  <div style={{ fontSize: 12, color: COLORS.muted }}>Creators</div>
                </div>
              </div>
            </div>
            <div style={{ background: COLORS.plumLight, borderRadius: 32, height: 340, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 120 }}>
              🎭
            </div>
          </div>
        </section>

        {/* ═══ COMMUNITY & HELP ═══ */}
        <section id="community" style={{ marginBottom: 80, scrollMarginTop: 80 }}>
           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
              <div id="help" style={{ background: "white", padding: 32, borderRadius: 24, border: `1px solid ${COLORS.border}` }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>🤝</div>
                <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Help Center</h3>
                <p style={{ fontSize: 14, color: COLORS.muted, lineHeight: 1.6, marginBottom: 20 }}>Got questions? Our support team and documentation are here to help you get started.</p>
                <button style={{ background: "none", border: "none", color: COLORS.plum, fontWeight: 700, fontSize: 14, cursor: "pointer", padding: 0 }}>Visit Help Center →</button>
              </div>
              <div style={{ background: "white", padding: 32, borderRadius: 24, border: `1px solid ${COLORS.border}` }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>🌐</div>
                <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Community</h3>
                <p style={{ fontSize: 14, color: COLORS.muted, lineHeight: 1.6, marginBottom: 20 }}>Join thousands of creators and readers on our Discord and social platforms.</p>
                <button style={{ background: "none", border: "none", color: COLORS.rose, fontWeight: 700, fontSize: 14, cursor: "pointer", padding: 0 }}>Join Discord →</button>
              </div>
           </div>
        </section>

      </div>

      {/* ── MAINTENANCE OVERLAY ── */}
      {settings.maintenance_mode === 'true' && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: COLORS.ink, color: "white", zIndex: 10000,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 20
        }}>
          <div style={{ fontSize: 60, marginBottom: 20 }}>🏗️</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12 }}>Under Maintenance</h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", maxWidth: 500 }}>
            {settings.site_name} is currently undergoing scheduled maintenance. We'll be back shortly with even better stories!
          </p>
        </div>
      )}

      {/* ═══ FOOTER ═══ */}
      <footer style={{
        background: COLORS.ink, color: "rgba(255,255,255,0.45)",
        marginTop: 0, padding: "80px 24px 40px",
        borderTop: "1px solid rgba(255,255,255,0.05)"
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 48, marginBottom: 60 }}>
            <div style={{ gridColumn: "span 1.5" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, cursor: "pointer" }} onClick={() => navigate("/")}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: `linear-gradient(135deg, ${COLORS.plum}, ${COLORS.rose})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 4px 15px rgba(109,74,232,0.3)" }}>📖</div>
                <span style={{ fontSize: 22, fontWeight: 900, color: "white", letterSpacing: -0.8 }}>Toon<span style={{ color: COLORS.rose }}>Vault</span></span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.8, maxWidth: 300, color: "rgba(255,255,255,0.5)" }}>
                An AI-powered interactive storytelling platform where choices shape every story. Create, share, and monetize your imagination.
              </p>
            </div>
            {[
              { 
                title: "Discover", 
                links: [
                  { l: "Browse", t: "/browse" },
                  { l: "Originals", t: "#daily-schedule" },
                  { l: "Categories", t: "#categories" },
                  { l: "Rankings", t: "#rankings" },
                  { l: "New releases", t: "#daily-schedule" },
                  { l: "Canvas", t: "#collections" },
                  { l: "Pricing", t: "#pricing" }
                ] 
              },
              { 
                title: "Create", 
                links: [
                  { l: "Publish a story", t: "/dashboard?page=ai" },
                  { l: "Creators 101", t: "#creators" },
                  { l: "Team features", t: "#creators" },
                  { l: "Creator tools", t: "#creators" },
                  { l: "Earnings", t: "/dashboard" }
                ] 
              },
              { 
                title: "Company", 
                links: [
                  { l: "About", t: "/about" },
                  { l: "Help center", t: "/help" },
                  { l: "Community", t: "/community" },
                  { l: "Terms", t: "/terms" },
                  { l: "Privacy", t: "/privacy" }
                ] 
              },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "white", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 24 }}>{col.title}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {col.links.map(link => (
                    <div key={link.l} 
                      onClick={() => handleNav({ target: link.t })}
                      style={{ fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.color = COLORS.plumLight}
                      onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.45)"}
                    >{link.l}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 32, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>© 2026 ToonVault. All rights reserved.</div>
            <div style={{ display: "flex", gap: 24 }}>
              {["Discord", "Instagram", "Twitter", "YouTube"].map(s => (
                <span key={s} style={{ fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "white"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.45)"}
                >{s}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ═══ BECOME A CREATOR POPUP ═══ */}
      {showPopup && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
          padding: 20
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#08090A", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 32, width: "100%", maxWidth: 900, display: "flex",
            position: "relative", textAlign: "center", overflow: "hidden",
            boxShadow: "0 40px 100px rgba(0,0,0,0.8)",
          }}>
            {/* Left Side: Dynamic Preview */}
            <div style={{ flex: 1, position: "relative", background: "#121315", overflow: "hidden", minHeight: 450, display: window.innerWidth > 768 ? "block" : "none" }}>
               <div style={{
                 position: "absolute", inset: 0, 
                 backgroundImage: `url(${featured.cover && String(featured.cover).includes('http') ? featured.cover.trim() : 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23'})`,
                 backgroundSize: "cover", backgroundPosition: "center",
                 filter: "brightness(0.6)", transition: "all 1s ease"
               }} />
               <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #08090A 10%, transparent 90%)" }} />
               <div style={{ position: "absolute", bottom: 40, left: 30, right: 30, textAlign: "left" }}>
                 <div style={{ fontSize: 11, color: COLORS.rose, fontWeight: 700, textTransform: "uppercase", marginBottom: 8, letterSpacing: 1 }}>Top Trending Preview</div>
                 <div style={{ fontSize: 24, fontWeight: 900, color: "white", marginBottom: 6 }}>{featured.title}</div>
                 <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.5, marginBottom: 16, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{featured.subtitle || featured.description}</div>
                 <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: COLORS.plum, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✨</div>
                    <div style={{ fontSize: 13, color: "white", fontWeight: 600 }}>By ToonVault AI Creator</div>
                 </div>
               </div>
            </div>

            {/* Right Side: Content */}
            <div style={{ flex: 1, padding: "48px 40px", position: "relative" }}>
              <button onClick={() => setShowPopup(false)} style={{
                position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", width: 32, height: 32, borderRadius: 16,
                fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s", zIndex: 10
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "white"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
              >×</button>
              
              <div style={{
                width: 52, height: 52, borderRadius: 16, margin: "0 auto 16px",
                background: "linear-gradient(135deg, #8B5CF6, #F43F8E)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
                boxShadow: "0 10px 24px rgba(139,92,246,0.3)"
              }}>✍️</div>
              
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "white", margin: "0 0 10px", letterSpacing: -0.5 }}>
                Become a ToonVault Creator
              </h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", margin: "0 auto 24px", lineHeight: 1.5 }}>
                Share your worlds with millions. Whether it's a comic or an immersive novel, your audience is waiting.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28, textAlign: "left" }}>
                {[
                  { icon: "💰", title: "Monetize Day One", desc: "Earn royalties now." },
                  { icon: "🎨", title: "AI Panels", desc: "Generate art with AI." },
                  { icon: "👥", title: "Global Reach", desc: "Reach millions instantly." },
                  { icon: "📊", title: "Live Analytics", desc: "Track your story growth." }
                ].map((feat, idx) => (
                  <div key={idx} style={{
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 14, padding: "12px", display: "flex", gap: 10, alignItems: "center",
                  }}>
                    <div style={{ fontSize: 20 }}>{feat.icon}</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "white", marginBottom: 1 }}>{feat.title}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", lineHeight: 1.2 }}>{feat.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button onClick={() => navigate('/dashboard?page=stories')} style={{
                width: "100%", padding: "15px", border: "none",
                background: "linear-gradient(135deg, #8B5CF6, #F43F8E)",
                borderRadius: 14, fontSize: 15, fontWeight: 700, color: "white",
                cursor: "pointer", boxShadow: "0 8px 24px rgba(139,92,246,0.25)",
                transition: "transform 0.2s"
              }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                Become ToonVault Creator 🚀
              </button>
              <button onClick={() => setShowPopup(false)} style={{
                background: "none", border: "none", color: "rgba(255,255,255,0.35)",
                fontSize: 12, marginTop: 16, cursor: "pointer", transition: "color 0.2s"
              }}
                onMouseEnter={e => e.currentTarget.style.color = "white"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}
              >I'll explore first</button>
            </div>
          </div>
        </div>
      )}
      {/* ═══ AI INSTRUCTION MODAL ═══ */}
      {showAIModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 3000, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "white", borderRadius: 32, width: "100%", maxWidth: 600, overflow: "hidden", position: "relative", boxShadow: "0 30px 60px rgba(0,0,0,0.4)" }}>
            <div style={{ height: 160, background: `linear-gradient(135deg, ${COLORS.plum}, ${COLORS.rose})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white" }}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>🎀</div>
              <h2 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>Manta AI Story Creator</h2>
              <p style={{ fontSize: 14, opacity: 0.8 }}>Turn your ideas into professional webtoons</p>
            </div>
            <div style={{ padding: 40 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 15, color: COLORS.ink }}>What's your story about?</h3>
              <textarea 
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="e.g. A princess who discovers she can talk to dragons in a kingdom of ice..."
                style={{ width: "100%", height: 120, borderRadius: 16, border: `2px solid ${COLORS.border}`, padding: 20, fontSize: 15, outline: "none", fontFamily: "inherit", resize: "none", transition: "all 0.3s" }}
                onFocus={e => e.currentTarget.style.borderColor = COLORS.plum}
                onBlur={e => e.currentTarget.style.borderColor = COLORS.border}
              />
              <div style={{ marginTop: 25, display: "flex", gap: 12 }}>
                <button onClick={() => setShowAIModal(false)} style={{ flex: 1, padding: "16px", borderRadius: 16, border: `2px solid ${COLORS.border}`, background: "none", color: COLORS.muted, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                <button 
                  onClick={() => {
                    const user = JSON.parse(localStorage.getItem('user'));
                    if(!user) navigate('/user');
                    else navigate('/dashboard?page=ai&prompt=' + encodeURIComponent(aiPrompt));
                  }}
                  style={{ flex: 2, padding: "16px", borderRadius: 16, background: `linear-gradient(135deg, ${COLORS.plum}, ${COLORS.plumDark})`, color: "white", border: "none", fontWeight: 700, cursor: "pointer", boxShadow: `0 8px 20px ${COLORS.plum}44` }}
                >
                  ✨ Start AI Generation
                </button>
              </div>
              <p style={{ fontSize: 12, color: COLORS.muted, textAlign: "center", marginTop: 20 }}>Using <strong>Runware Flux AI</strong> · High Fidelity Manta Style</p>
            </div>
            <button onClick={() => setShowAIModal(false)} style={{ position: "absolute", top: 15, right: 15, width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,0.2)", border: "none", color: "white", cursor: "pointer", fontSize: 18 }}>×</button>
          </div>
        </div>
      )}

      {/* ═══ FLOATING AI BUTTON ═══ */}
      <button 
        className="fab-button"
        onClick={() => setShowAIModal(true)} style={{
        position: "fixed", bottom: 30, right: 30, width: 70, height: 70,
        borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.plum}, ${COLORS.rose})`,
        border: "none", color: "white", fontSize: 28, cursor: "pointer",
        boxShadow: "0 10px 30px rgba(109,74,232,0.4)", zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.3s",
      }}
      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1) rotate(10deg)"}
      onMouseLeave={e => e.currentTarget.style.transform = "scale(1) rotate(0deg)"}
      >
        ✨
      </button>
    </div>
  );
}
