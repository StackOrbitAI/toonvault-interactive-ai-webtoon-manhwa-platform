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
  { id: 1, title: "Crimson Throne", genre: "Romance Fantasy", cover: "💖", views: "28.8M", updated: true, rating: "4.9", mood: ["slow burn", "royalty"], day: "Mon", type: "comic", desc: "She escaped a kingdom that wanted her dead. He's the king who never forgot her face.", bg: "#FDE8F0" },
  { id: 2, title: "The Shadow Pact", genre: "Fantasy", cover: "🌙", views: "9.8M", updated: true, rating: "4.8", mood: ["dark", "magic"], day: "Mon", type: "comic", desc: "Two enemies bound by a curse. One impossible choice.", bg: "#EDE8FA" },
  { id: 3, title: "My Wavering Heart", genre: "Drama", cover: "🌊", views: "15.1K", updated: true, rating: "4.7", mood: ["angst", "realistic"], day: "Tue", type: "comic", desc: "What happens when the person you love stops trying?", bg: "#E8F0FD" },
  { id: 4, title: "Primal Accord", genre: "Action Fantasy", cover: "⚔️", views: "7.7M", updated: true, rating: "4.6", mood: ["action", "found family"], day: "Tue", type: "comic", desc: "A monster hunter. A prophecy. A world on fire.", bg: "#FDF3E0" },
  { id: 5, title: "Duchess Reborn", genre: "Romance Fantasy", cover: "👑", views: "2M", updated: false, rating: "4.9", mood: ["royalty", "revenge"], day: "Wed", type: "comic", desc: "She died once. This time, she rewrites the ending.", bg: "#F0FDE8" },
  { id: 6, title: "Cinderella Protocol", genre: "Comedy Romance", cover: "✨", views: "2.7M", updated: true, rating: "4.5", mood: ["cozy", "funny"], day: "Wed", type: "comic", desc: "Fake dating the most oblivious CEO in the city.", bg: "#FEF3DC" },
  { id: 7, title: "Villain's Beloved", genre: "Romance Fantasy", cover: "🌹", views: "10.1M", updated: true, rating: "4.8", mood: ["dark romance", "redemption"], day: "Thu", type: "comic", desc: "I romanced the villain once. Now he's real, and he remembers.", bg: "#FDE8F0" },
  { id: 8, title: "Stray Signal", genre: "Sci-Fi", cover: "🛸", views: "3.3M", updated: true, rating: "4.7", mood: ["mystery", "suspense"], day: "Thu", type: "comic", desc: "A distress signal from 40 years ago. Someone is still broadcasting.", bg: "#E8F5FD" },
  { id: 9, title: "Soft Apocalypse", genre: "Slice of Life", cover: "🌿", views: "1.6M", updated: false, rating: "4.6", mood: ["cozy", "wholesome"], day: "Fri", type: "novel", desc: "The world nearly ended. We opened a bakery anyway.", bg: "#EAF5E8" },
  { id: 10, title: "Blood & Blossom", genre: "Supernatural", cover: "🌺", views: "5.6M", updated: true, rating: "4.8", mood: ["dark", "romance"], day: "Fri", type: "comic", desc: "A demon who falls in love smells like cherry blossoms and regret.", bg: "#FDE8F0" },
  { id: 11, title: "The Tyrant's Thief", genre: "Historical Romance", cover: "🗡️", views: "4.2M", updated: true, rating: "4.7", mood: ["historical", "enemies-to-lovers"], day: "Sat", type: "comic", desc: "She stole from the emperor. He decided to keep her.", bg: "#F6F0E8" },
  { id: 12, title: "Last Frequency", genre: "BL Romance", cover: "📻", views: "1.9M", updated: true, rating: "4.9", mood: ["soft", "slow burn"], day: "Sat", type: "novel", desc: "They met on a radio station no one listened to. Then everyone did.", bg: "#EDE8FA" },
  { id: 13, title: "Iron Saint", genre: "Superhero Action", cover: "⚡", views: "6.1M", updated: false, rating: "4.6", mood: ["action", "heroic"], day: "Sun", type: "comic", desc: "Saving the world would be easier if the world wanted to be saved.", bg: "#FDF3E0" },
  { id: 14, title: "Farm of the Forgotten", genre: "Romance Fantasy", cover: "🌻", views: "2.2M", updated: true, rating: "4.7", mood: ["cozy", "found family"], day: "Sun", type: "comic", desc: "Fated to die, she got a farm, a fairy, and far too much responsibility.", bg: "#F0FDE8" },
  { id: 15, title: "Moonlit Conspiracy", genre: "Mystery Thriller", cover: "🌑", views: "3.8M", updated: true, rating: "4.8", mood: ["suspense", "mystery"], day: "Mon", type: "comic", desc: "Every witness said the same thing. None of them were there.", bg: "#1F2430", textLight: true },
  { id: 16, title: "Wolf's Lullaby", genre: "GL Fantasy", cover: "🐺", views: "1.4M", updated: true, rating: "4.7", mood: ["fantasy", "GL"], day: "Tue", type: "novel", desc: "How hard could it be to look after one giant, chaotic wolf?", bg: "#EDE8FA" },
];

const TRENDING_COLLECTIONS = [
  { label: "MLs Locked In Love 💘", desc: "Zero doubts. Just pure love.", emoji: "💕" },
  { label: "Beyond Human, Beyond Hot 🚩", desc: "These non-humans are next level", emoji: "🔥" },
  { label: "Superpower Unleashed 🌟", desc: "Heroines with special powers", emoji: "⚡" },
  { label: "Rise of the Demon Lords 😈", desc: "Rulers of darkness", emoji: "👿" },
];

const FEATURED = [
  { title: "Crimson Throne", subtitle: "She started a new life, but he's still living in the one she left.", genre: "Romance Fantasy", badge: "NEW ✨", bg: "linear-gradient(135deg, #3D1A5C 0%, #E8336D 60%, #C9922A 100%)", cover: "💖" },
  { title: "The Shadow Pact", subtitle: "Two enemies bound by a curse that only love can break.", genre: "Fantasy", badge: "TRENDING", bg: "linear-gradient(135deg, #1A0A2E 0%, #4C2DB5 50%, #7B4FA6 100%)", cover: "🌙" },
  { title: "Villain's Beloved", subtitle: "Fate destroyed their love. But fate is meant to be defied.", genre: "Dark Romance", badge: "EVENT 🎉", bg: "linear-gradient(135deg, #2D1A1A 0%, #8B1A3A 50%, #E86A8A 100%)", cover: "🌹" },
];

function StoryCard({ story, size = "normal" }) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const navigate = useNavigate();
  return (
    <div style={{
      background: COLORS.card,
      borderRadius: 16,
      border: `1px solid ${COLORS.border}`,
      overflow: "hidden",
      cursor: "pointer",
      transition: "transform 0.2s, box-shadow 0.2s",
      flexShrink: 0,
      width: size === "large" ? 180 : size === "small" ? 130 : 155,
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(109,74,232,0.12)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
      onClick={() => navigate(`/story/${story.id}`)}
    >
      <div style={{
        height: size === "large" ? 220 : size === "small" ? 150 : 185,
        background: story.bg || COLORS.plumLight,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size === "large" ? 60 : 48,
        position: "relative",
      }}>
        <span>{story.cover}</span>
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
          background: "linear-gradient(to top, rgba(31,36,48,0.6), transparent)",
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

function SectionHeader({ title, viewAll, sub }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: COLORS.ink, margin: 0 }}>{title}</h2>
        {sub && <p style={{ fontSize: 13, color: COLORS.muted, margin: "4px 0 0" }}>{sub}</p>}
      </div>
      {viewAll && (
        <button style={{ fontSize: 13, color: COLORS.plum, fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: "4px 10px", borderRadius: 8, transition: "background 0.2s" }}
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
  const [activeCategoryTab, setActiveCategoryTab] = useState("Drama");
  const [heroIndex, setHeroIndex] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [liveStories, setLiveStories] = useState(STORIES);
  const genreScrollRef = useRef();

  const scrollGenres = (dir) => {
    genreScrollRef.current?.scrollBy({ left: dir * 250, behavior: "smooth" });
  };

  useEffect(() => {
    const t = setInterval(() => setHeroIndex(i => (i + 1) % FEATURED.length), 4000);
    axios.get("/api/stories").then(r => {
      if(r.data && r.data.length > 0) {
        const fetched = r.data.map(s => ({
          ...s, 
          id: s._id, 
          cover: s.coverIcon || "📖", 
          bg: s.coverBg || "#EDE8FA", 
          mood: [], 
          day: "Mon", 
          updated: s.status === "Live"
        }));
        setLiveStories([...fetched, ...STORIES]);
      } else {
        setLiveStories(STORIES);
      }
    }).catch(()=>{
      setLiveStories(STORIES);
    });
    return () => clearInterval(t);
  }, []);

  const categoryTabs = ["Drama", "Fantasy", "Comedy", "Action", "Slice of life", "Romance", "Superhero", "Sci-fi"];
  const dailyStories = liveStories.filter(s => s.day === activeDay);
  const featured = FEATURED[heroIndex];

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: COLORS.bg, minHeight: "100vh", color: COLORS.ink }}>

      {/* ═══ TOP NAV ═══ */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 200,
        background: "rgba(250,247,242,0.96)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${COLORS.border}`,
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, ${COLORS.plum}, ${COLORS.rose})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📖</div>
              <span style={{ fontSize: 20, fontWeight: 800, color: COLORS.plum, letterSpacing: -0.5 }}>Toon<span style={{ color: COLORS.rose }}>Vault</span></span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {["Originals", "Categories", "Rankings", "Canvas", "Shop", "Creators 101"].map(item => (
              <button key={item} style={{
                padding: "8px 13px", border: "none", background: "none",
                fontSize: 14, fontWeight: 500, color: COLORS.muted, cursor: "pointer",
                borderRadius: 8, transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = COLORS.plumLight; e.currentTarget.style.color = COLORS.plum; }}
                onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = COLORS.muted; }}
              >{item}</button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative" }}>
              {searchOpen ? (
                <input
                  autoFocus
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  onBlur={() => { if (!searchVal) setSearchOpen(false); }}
                  placeholder="Search stories, genres..."
                  style={{
                    padding: "8px 36px 8px 14px", borderRadius: 20, border: `1.5px solid ${COLORS.plum}`,
                    background: COLORS.card, fontSize: 13, color: COLORS.ink, outline: "none", width: 220,
                  }}
                />
              ) : (
                <button onClick={() => setSearchOpen(true)} style={{
                  padding: "8px 14px", border: `1px solid ${COLORS.border}`, background: COLORS.card,
                  borderRadius: 20, fontSize: 13, color: COLORS.muted, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  🔍 <span>Search</span>
                </button>
              )}
            </div>
            <button onClick={() => navigate('/user')} style={{
              padding: "9px 18px", border: `1.5px solid ${COLORS.plum}`,
              background: "transparent", borderRadius: 22, fontSize: 13,
              fontWeight: 600, color: COLORS.plum, cursor: "pointer",
            }}>Log in</button>
            <button style={{
              padding: "9px 20px", border: "none",
              background: `linear-gradient(135deg, ${COLORS.plum}, ${COLORS.plumDark})`,
              borderRadius: 22, fontSize: 13, fontWeight: 600, color: "white",
              cursor: "pointer", boxShadow: "0 2px 10px rgba(109,74,232,0.3)",
            }}>✏️ Publish</button>
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${COLORS.border}`, position: "relative", display: "flex", alignItems: "center", maxWidth: 1280, margin: "0 auto", width: "100%" }}>
          <button onClick={() => scrollGenres(-1)} style={{ position: "absolute", left: 4, zIndex: 10, width: 32, height: 32, border: "none", borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.plum}, ${COLORS.rose})`, boxShadow: "0 4px 8px rgba(109,74,232,0.3)", cursor: "pointer", fontSize: 20, color: "white", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}>{"<"}</button>
          <div ref={genreScrollRef} style={{ display: "flex", gap: 6, padding: "8px 40px", overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none", width: "100%" }}>
            {GENRES.map(g => (
              <button key={g.id} onClick={() => setActiveGenre(g.id)} style={{
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
          <div style={{
            borderRadius: 24,
            background: featured.bg,
            padding: "48px 56px",
            minHeight: 320,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            overflow: "hidden", position: "relative", transition: "all 0.6s",
          }}>
            <div style={{ maxWidth: 480, zIndex: 2, position: "relative" }}>
              <span style={{
                display: "inline-block",
                background: "rgba(255,255,255,0.2)", color: "white",
                fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 12,
                letterSpacing: 1, marginBottom: 14, backdropFilter: "blur(8px)",
              }}>{featured.badge}</span>
              <h1 style={{ fontSize: 36, fontWeight: 800, color: "white", margin: "0 0 10px", lineHeight: 1.2, letterSpacing: -0.5 }}>{featured.title}</h1>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.82)", margin: "0 0 8px", lineHeight: 1.6 }}>{featured.subtitle}</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: "0 0 28px" }}>{featured.genre}</p>
              <div style={{ display: "flex", gap: 12 }}>
                <button style={{
                  padding: "12px 28px", background: "white", color: COLORS.plum,
                  border: "none", borderRadius: 24, fontSize: 14, fontWeight: 700, cursor: "pointer",
                }}>▶ Start reading</button>
                <button style={{
                  padding: "12px 24px", background: "rgba(255,255,255,0.18)",
                  color: "white", border: "1.5px solid rgba(255,255,255,0.4)",
                  borderRadius: 24, fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}>+ Follow story</button>
              </div>
            </div>
            <div style={{ fontSize: 120, opacity: 0.4, position: "absolute", right: 60, bottom: -10, filter: "blur(1px)", userSelect: "none" }}>{featured.cover}</div>
            <div style={{ position: "absolute", right: 180, top: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
            <div style={{ position: "absolute", right: 100, bottom: -60, width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, justifyContent: "center" }}>
            {FEATURED.map((f, i) => (
              <button key={i} onClick={() => setHeroIndex(i)} style={{
                width: i === heroIndex ? 28 : 8, height: 8,
                borderRadius: 6, border: "none", cursor: "pointer", transition: "all 0.3s",
                background: i === heroIndex ? COLORS.plum : COLORS.border,
              }} />
            ))}
          </div>
        </div>

        {/* ═══ ANNOUNCEMENT BANNERS ═══ */}
        <div style={{ display: "flex", gap: 12, marginBottom: 36, overflowX: "auto", scrollbarWidth: "none" }}>
          {[
            { text: "22 comics · 2,300+ episodes 📚 Dive all the way in!", color: COLORS.plumLight, accent: COLORS.plum },
            { text: "Check in daily & catch 100 free episodes!", color: "#FEF3DC", accent: COLORS.gold },
            { text: "Mature versions available 🔥 Spicier cuts on website!", color: COLORS.roseLight, accent: COLORS.rose },
          ].map((b, i) => (
            <div key={i} style={{
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
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: COLORS.ink, margin: 0 }}>🔥 Trending & Popular</h2>
            {["Trending", "Popular", "New"].map(tab => (
              <button key={tab} style={{
                padding: "5px 14px", border: `1px solid ${COLORS.border}`,
                background: tab === "Trending" ? COLORS.plum : COLORS.card,
                color: tab === "Trending" ? "white" : COLORS.muted,
                borderRadius: 16, fontSize: 12, fontWeight: 500, cursor: "pointer",
              }}>{tab}</button>
            ))}
            <button style={{ marginLeft: "auto", fontSize: 13, color: COLORS.plum, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>View all →</button>
          </div>
          <HorizontalScroll>
            {liveStories.slice(0, 10).map(s => <StoryCard key={s.id} story={s} size="large" />)}
          </HorizontalScroll>
        </section>

        {/* ═══ POPULAR BY CATEGORY ═══ */}
        <section style={{ marginBottom: 44 }}>
          <SectionHeader title="📚 Popular by Category" viewAll />
          <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", scrollbarWidth: "none" }}>
            {categoryTabs.map(tab => (
              <button key={tab} onClick={() => setActiveCategoryTab(tab)} style={{
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
            {liveStories.filter(s => activeCategoryTab === "All" || s.genre?.toLowerCase().includes(activeCategoryTab.toLowerCase())).map(s => <StoryCard key={s.id} story={s} />)}
          </HorizontalScroll>
        </section>

        {/* ═══ THEMATIC COLLECTIONS ═══ */}
        <section style={{ marginBottom: 44 }}>
          <SectionHeader title="💫 Collections for You" sub="Handpicked themes our readers love" viewAll />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
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

        {/* ═══ NEWLY RELEASED ═══ */}
        <section style={{ marginBottom: 44 }}>
          <SectionHeader title="✨ Newly Released" sub="Fresh stories just went live" viewAll />
          <HorizontalScroll>
            {liveStories.slice(8).map(s => <StoryCard key={s.id} story={s} size="normal" />)}
          </HorizontalScroll>
        </section>

        {/* ═══ DAILY SCHEDULE ═══ */}
        <section style={{ marginBottom: 44 }}>
          <SectionHeader title="📅 Daily Schedule" viewAll />
          <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
            {DAYS.map(day => (
              <button key={day} onClick={() => setActiveDay(day)} style={{
                padding: "7px 16px", borderRadius: 20,
                background: activeDay === day ? COLORS.plum : COLORS.card,
                color: activeDay === day ? "white" : COLORS.muted,
                fontSize: 13, fontWeight: 500, cursor: "pointer",
                border: activeDay === day ? "none" : `1px solid ${COLORS.border}`,
                transition: "all 0.18s",
              }}>{day}</button>
            ))}
          </div>
          {dailyStories.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: COLORS.muted, fontSize: 14 }}>
              No updates scheduled for this day — check back soon! 🌙
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: 14 }}>
              {dailyStories.map(s => (
                <div key={s.id} style={{
                  background: COLORS.card, borderRadius: 14, border: `1px solid ${COLORS.border}`,
                  overflow: "hidden", cursor: "pointer", transition: "transform 0.2s",
                }}
                  onClick={() => navigate(`/story/${s.id}`)}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                >
                  <div style={{
                    height: 130, background: s.bg || COLORS.plumLight,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 44, position: "relative",
                  }}>
                    {s.cover}
                    {s.updated && (
                      <span style={{
                        position: "absolute", top: 7, left: 7,
                        background: COLORS.rose, color: "white",
                        fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 5,
                      }}>UP</span>
                    )}
                  </div>
                  <div style={{ padding: "10px 11px" }}>
                    <div style={{ fontSize: 10, color: COLORS.rose, fontWeight: 600, marginBottom: 2 }}>{s.genre}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.ink, marginBottom: 4, lineHeight: 1.3 }}>{s.title}</div>
                    <div style={{ fontSize: 11, color: COLORS.mutedLight }}>👁 {s.views}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ═══ RANKINGS ═══ */}
        <section style={{ marginBottom: 44 }}>
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
                  background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                }}>{s.cover}</div>
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
              <h3 style={{ fontSize: 18, fontWeight: 700, color: COLORS.ink, margin: "0 0 6px" }}>Free every 3 hours!</h3>
              <p style={{ fontSize: 14, color: COLORS.muted, margin: 0, maxWidth: 380 }}>New episodes unlock automatically. Follow your favorites and never miss an update — no coins needed.</p>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button style={{
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
        <section style={{ marginBottom: 44 }}>
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
            <button style={{
              position: "relative", zIndex: 1,
              padding: "14px 32px", background: COLORS.plum, color: "white",
              border: "none", borderRadius: 28, fontSize: 15, fontWeight: 700,
              cursor: "pointer", whiteSpace: "nowrap",
              boxShadow: "0 4px 16px rgba(109,74,232,0.4)",
            }}>✏️ Start publishing free</button>
          </div>
        </section>

        {/* ═══ MEMBERSHIP TIERS ═══ */}
        <section style={{ marginBottom: 44 }}>
          <SectionHeader title="💎 Membership Plans" sub="Unlock more of ToonVault" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
            {[
              { name: "Bronze", price: "Free", color: "#C08030", bg: "#FEF3E2", desc: "Read & influence stories", perks: ["View all public stories", "Like · Bookmark · Flag", "Choose story paths", "Earn engagement royalties"] },
              { name: "Silver", price: "$5/yr", color: COLORS.plum, bg: COLORS.plumLight, desc: "Create your own stories", popular: true, perks: ["All Bronze features", "Create public stories", "Generate AI panels", "Community feed access"] },
              { name: "Gold", price: "$24/yr", color: "#C9922A", bg: "#FEF3DC", desc: "Collaborate like a studio", perks: ["All Silver features", "Create & manage teams", "Private stories", "Creator analytics"] },
            ].map(tier => (
              <div key={tier.name} style={{
                background: tier.bg, borderRadius: 18,
                border: `2px solid ${tier.popular ? tier.color : COLORS.border}`,
                padding: "22px 22px 20px", position: "relative",
              }}>
                {tier.popular && (
                  <span style={{
                    position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                    background: COLORS.plum, color: "white", fontSize: 10, fontWeight: 700,
                    padding: "3px 14px", borderRadius: 10, letterSpacing: 0.5,
                  }}>MOST POPULAR</span>
                )}
                <div style={{ fontSize: 22, fontWeight: 800, color: tier.color, marginBottom: 2 }}>{tier.name}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.ink, margin: "4px 0 2px" }}>{tier.price}</div>
                <div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 14 }}>{tier.desc}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 18 }}>
                  {tier.perks.map(p => (
                    <div key={p} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: COLORS.ink }}>
                      <span style={{ color: "#2E8B6E", fontWeight: 700 }}>✓</span> {p}
                    </div>
                  ))}
                </div>
                <button style={{
                  width: "100%", padding: "10px", background: tier.popular ? tier.color : "white",
                  color: tier.popular ? "white" : tier.color,
                  border: `1.5px solid ${tier.color}`, borderRadius: 14,
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}>
                  {tier.name === "Bronze" ? "Get started free" : `Upgrade to ${tier.name}`}
                </button>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* ═══ FOOTER ═══ */}
      <footer style={{
        background: COLORS.ink, color: "rgba(255,255,255,0.6)",
        marginTop: 20, padding: "40px 24px 24px",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 32, marginBottom: 36 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${COLORS.plum}, ${COLORS.rose})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📖</div>
                <span style={{ fontSize: 18, fontWeight: 800, color: "white" }}>ToonVault</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 200 }}>An AI-powered interactive storytelling platform where choices shape every story.</p>
            </div>
            {[
              { title: "Discover", links: ["Originals", "Categories", "Rankings", "New releases", "Canvas"] },
              { title: "Create", links: ["Publish a story", "Creators 101", "Team features", "Creator tools", "Earnings"] },
              { title: "Company", links: ["About", "Help center", "Community", "Terms", "Privacy"] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "white", letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>{col.title}</div>
                {col.links.map(l => (
                  <div key={l} style={{ fontSize: 13, marginBottom: 9, cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.color = "white"}
                    onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
                  >{l}</div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontSize: 12 }}>© 2026 ToonVault. All rights reserved.</div>
            <div style={{ display: "flex", gap: 14 }}>
              {["Discord", "Instagram", "Twitter", "YouTube"].map(s => (
                <span key={s} style={{ fontSize: 12, cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.color = "white"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
                >{s}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
