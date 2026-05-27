import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Plus, 
  Check, 
  Award, 
  ArrowLeft, 
  AlertTriangle, 
  Send, 
  Sparkles, 
  BookOpen, 
  Bookmark, 
  User, 
  ChevronRight, 
  UserPlus, 
  UserCheck, 
  Flame, 
  Star,
  Lock,
  Unlock,
  ChevronDown,
  Info
} from "lucide-react";
import axios from "axios";
import Header from "./Header";
import Footer from "./Footer";

// ─── Theme Configuration ──────────────────────────────────────────────────────
const COLORS = {
  bg: "#0B0A14",
  bgSubtle: "#121022",
  card: "rgba(255, 255, 255, 0.03)",
  cardHover: "rgba(255, 255, 255, 0.06)",
  border: "rgba(255, 255, 255, 0.08)",
  borderHover: "rgba(139, 92, 246, 0.3)",
  text: "#FFFFFF",
  textMuted: "#9CA3AF",
  purple: "#8B5CF6",
  purpleLight: "rgba(139, 92, 246, 0.15)",
  rose: "#EC4899",
  roseLight: "rgba(236, 72, 153, 0.15)",
  gold: "#F59E0B",
  emerald: "#10B981",
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const STORY_MOCK = {
  id: "tyrants-secret-healer",
  title: "I Became the Tyrant's Secret Healer",
  chapter: "Chapter 1: The Beginning",
  scene: 4,
  totalScenes: 10,
  author: "admin",
  authorVerified: true,
  authorFollowers: 12432,
  authorBio: "Lead author & fantasy world builder on ToonVault. Crafting tales of secrets, magic, and forbidden royal romance.",
  genres: ["Romance", "Fantasy", "Drama"],
  rating: "9.9",
  ageRating: "16+",
  coverImage: "/covers/secret_healer_scene.png",
  dialogue: { speaker: "System", text: "The path ahead is uncertain. What will you choose?" }
};

const INITIAL_CHOICES = [
  { label: "A", title: "Protect the Secret", desc: "Keep your healing powers hidden a little longer, fearing his suspicion.", tags: ["Mystery", "Suspense"], votes: 8724, popular: true, ageRestricted: false },
  { label: "B", title: "Follow Your Heart", desc: "Confess what you've been holding in and risk everything.", tags: ["Romance", "Drama"], votes: 2145, popular: false, ageRestricted: false },
  { label: "C", title: "Chase the Truth", desc: "Dig deeper into the source of his curse, no matter the consequence.", tags: ["Adventure", "Mystery"], votes: 1612, popular: false, ageRestricted: true },
  { label: "D", title: "Write Your Own Story", desc: "Create your own twist — you decide what happens next in this chamber.", tags: [], votes: 0, popular: false, isWrite: true, ageRestricted: false },
];

const INITIAL_COMMENTS = [
  { id: 1, user: "LunaDreams", avatar: "LD", level: 28, time: "5m ago", text: "A is safer, but B is the one that hurts in the best way. The tension is real!", likes: 128, isLiked: false },
  { id: 2, user: "ChronoMage", avatar: "CM", level: 32, time: "2h ago", text: "Team A! The kingdom needs a hero, and a secret healer is the ultimate wild card.", likes: 312, isLiked: false },
  { id: 3, user: "LunaWrites", avatar: "LW", level: 28, time: "1h ago", text: "B all the way. Love over everything, even if the tyrant is terrifying.", likes: 198, isLiked: false },
];

const STORY_MAP_NODES = [
  { id: 1, label: "Scene 1", status: "read", active: false },
  { id: 2, label: "Scene 2", status: "read", active: false },
  { id: 3, label: "Scene 3", status: "bookmarked", active: false },
  { id: 4, label: "Scene 4", status: "current", active: true, branches: [
    { label: "A", title: "Protect the Secret", status: "popular", isUserCreated: false },
    { label: "B", title: "Follow Your Heart", status: "unread", isUserCreated: false },
    { label: "C", title: "Chase the Truth", status: "age_restricted", isUserCreated: false },
    { label: "D", title: "Write Your Own", status: "user_created", isUserCreated: true },
  ]},
  { id: 5, label: "Scene 5", status: "locked", active: false }
];

const VAULT_STORIES = [
  { id: "hearts-of-ash", title: "Hearts of Ash", status: "Continue", scene: "Chapter 7, Scene 4", choice: "Protect the Secret", verified: true }
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Badge({ label, color = COLORS.purple, bg }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: 11, fontWeight: 700,
      padding: "3px 10px", borderRadius: 20,
      background: bg || `${color}20`, color,
      border: `1px solid ${color}35`, letterSpacing: 0.3, fontFamily: "'Inter', sans-serif",
    }}>
      {label}
    </span>
  );
}

function Avatar({ initials, size = 36, color = COLORS.purple }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${color}, ${color}99)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 800, color: "#FFF", fontFamily: "'Inter', sans-serif",
      flexShrink: 0, boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
    }}>{initials}</div>
  );
}

function AgeGateModal({ rating, onConsent, onDecline }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(5, 4, 10, 0.85)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: COLORS.bgSubtle, border: `1px solid ${COLORS.border}`,
        borderRadius: 24, padding: "40px", maxWidth: 420, width: "90%",
        textAlign: "center", boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: `${COLORS.rose}20`, border: `2px solid ${COLORS.rose}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px", fontSize: 20, fontWeight: 800,
          color: COLORS.rose, fontFamily: "'Inter', sans-serif"
        }}>{rating}</div>
        <h2 style={{ color: "#FFF", fontSize: 22, fontWeight: 800, marginBottom: 12, fontFamily: "'Inter', sans-serif" }}>
          Rated <span style={{ color: COLORS.rose }}>{rating}</span>
        </h2>
        <p style={{ color: COLORS.textMuted, fontSize: 14, lineHeight: 1.6, marginBottom: 28, fontFamily: "'Inter', sans-serif" }}>
          This storyline contains mature themes. Please confirm that you are over 16 to explore this pathway.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onDecline} style={{
            flex: 1, padding: "12px 0", borderRadius: 12,
            border: `1px solid ${COLORS.border}`, background: "transparent",
            color: COLORS.textMuted, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif",
            transition: "all 0.2s"
          }}>Go Back</button>
          <button onClick={onConsent} style={{
            flex: 1, padding: "12px 0", borderRadius: 12,
            background: COLORS.rose, border: "none",
            color: "#FFF", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Inter', sans-serif",
            boxShadow: `0 4px 14px ${COLORS.rose}40`, transition: "all 0.2s"
          }}>I am {rating.replace("+", "")}+</button>
        </div>
      </div>
    </div>
  );
}

function WriteModal({ onClose, onSubmit }) {
  const [text, setText] = useState("");
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(5, 4, 10, 0.85)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div style={{
        background: COLORS.bgSubtle, border: `1px solid ${COLORS.border}`,
        borderRadius: 24, padding: "34px", maxWidth: 500, width: "92%",
        boxShadow: "0 25px 60px rgba(0,0,0,0.6)"
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h2 style={{ color: "#FFF", fontSize: 22, fontWeight: 800, marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>Write Your Own Scene</h2>
            <p style={{ color: COLORS.textMuted, fontSize: 13, fontFamily: "'Inter', sans-serif" }}>You guide the healer's fate. Describe what she says or does next.</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 20 }}>✕</button>
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="e.g., Elara steps closer, placing her glowing hands on his chest and whispering the ancient words she swore never to speak..."
          style={{
            width: "100%", minHeight: 140, background: "rgba(0,0,0,0.2)",
            border: `1px solid ${COLORS.border}`, borderRadius: 12,
            color: "#FFF", padding: "14px", fontSize: 13, lineHeight: 1.6,
            resize: "vertical", outline: "none", fontFamily: "'Inter', sans-serif", boxSizing: "border-box",
            transition: "all 0.2s"
          }}
          onFocus={e => e.target.style.borderColor = COLORS.purple}
          onBlur={e => e.target.style.borderColor = COLORS.border}
        />
        <button 
          onClick={() => { if (text.trim()) onSubmit(text); }}
          style={{
            marginTop: 18, width: "100%", padding: "14px 0",
            background: `linear-gradient(135deg, ${COLORS.purple}, #A78BFA)`,
            border: "none", borderRadius: 12, color: "#FFF",
            fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif",
            boxShadow: `0 4px 15px ${COLORS.purple}40`
          }}
        >Submit Scene Twist ✦</button>
        <p style={{ color: COLORS.textMuted, fontSize: 11, textAlign: "center", marginTop: 14, lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>
          💡 High quality user twists are highlighted dynamically and eligible for creator reward points!
        </p>
      </div>
    </div>
  );
}

function StoryMap({ nodes, activeScene, onSelectScene, onSelectChoice, chosenLabel, isMobile }) {
  const LEGEND = [
    { status: "read", label: "Read" },
    { status: "unread", label: "Unread" },
    { status: "bookmarked", label: "Bookmarked" },
    { status: "popular", label: "Popular" },
    { status: "age_restricted", label: "Age restricted" },
    { status: "user_created", label: "User-written" },
    { status: "locked", label: "Locked" },
    { status: "unlocked", label: "Unlocked" },
  ];

  return (
    <div style={{ background: COLORS.bgSubtle, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: "20px", width: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ color: "#FFF", fontWeight: 800, fontSize: 15, fontFamily: "'Inter', sans-serif" }}>Story Flow Map</div>
          <div style={{ color: COLORS.textMuted, fontSize: 11, fontFamily: "'Inter', sans-serif" }}>I Became the Tyrant's Secret Healer</div>
        </div>
        <button style={{
          background: "rgba(139, 92, 246, 0.1)", border: `1px solid ${COLORS.purple}30`,
          color: COLORS.purple, fontSize: 10, fontWeight: 700, padding: "4px 8px",
          borderRadius: 8, cursor: "pointer", fontFamily: "'Inter', sans-serif"
        }}>How it works</button>
      </div>

      {/* Nodes visual flow */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, overflowX: "auto", padding: "10px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: isMobile ? "auto" : "max-content" }}>
          {nodes.map((node, i) => {
            const isNodeActive = activeScene === node.id;
            return (
              <div key={node.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {i > 0 && (
                  <div style={{
                    width: 20, height: 2,
                    background: activeScene >= node.id ? COLORS.purple : "rgba(255,255,255,0.08)"
                  }} />
                )}
                <button 
                  onClick={() => onSelectScene(node.id)}
                  disabled={node.status === "locked"}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                    background: "none", border: "none", cursor: node.status === "locked" ? "not-allowed" : "pointer",
                    position: "relative"
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: isNodeActive ? `linear-gradient(135deg, ${COLORS.purple}, #A78BFA)` : "rgba(255,255,255,0.04)",
                    border: isNodeActive ? "none" : `1.5px solid ${node.status === "locked" ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.15)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s"
                  }}>
                    {node.status === "locked" ? <Lock size={12} color="rgba(255,255,255,0.3)" /> : (
                      <span style={{ fontSize: 11, fontWeight: 800, color: isNodeActive ? "#FFF" : COLORS.textMuted }}>
                        {node.status === "read" ? "✓" : node.status === "bookmarked" ? "⊛" : node.id}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 9, color: isNodeActive ? "#FFF" : COLORS.textMuted, fontWeight: 600 }}>Scene {node.id}</span>
                  {isNodeActive && (
                    <span style={{
                      position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
                      background: COLORS.purple, color: "#FFF", fontSize: 7, fontWeight: 800,
                      padding: "1px 4px", borderRadius: 4, whiteSpace: "nowrap"
                    }}>You are here</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Branching Nodes for Scene 4 */}
        {nodes.map(node => {
          if (node.id === activeScene && node.branches) {
            return (
              <div key={`branches-${node.id}`} style={{
                marginTop: 8, display: "flex", flexDirection: "column", gap: 8,
                paddingLeft: 12, borderLeft: `2px solid ${COLORS.purple}40`,
                width: "100%", boxSizing: "border-box"
              }}>
                <div style={{ color: COLORS.textMuted, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                  Branch Pathways:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {node.branches.map(b => {
                    const isSelected = chosenLabel === b.label;
                    return (
                      <button
                        key={b.label}
                        onClick={() => onSelectChoice(b)}
                        style={{
                          display: "flex", alignItems: "center", gap: 8,
                          background: isSelected ? "rgba(139, 92, 246, 0.12)" : "rgba(255,255,255,0.02)",
                          border: isSelected ? `1.5px solid ${COLORS.purple}` : `1px solid ${COLORS.border}`,
                          borderRadius: 10, padding: "8px 12px", width: "100%", textAlign: "left",
                          cursor: "pointer", transition: "all 0.2s"
                        }}
                      >
                        <span style={{
                          width: 20, height: 20, borderRadius: 5,
                          background: `linear-gradient(135deg, ${COLORS.purple}, #A78BFA)`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 9, fontWeight: 900, color: "#FFF"
                        }}>{b.label}</span>
                        
                        <span style={{ color: isSelected ? "#FFF" : COLORS.textMuted, fontSize: 11, fontWeight: 600, flex: 1 }}>
                          {b.title}
                        </span>

                        {/* Status symbols next to branch titles in Map */}
                        {b.status === "popular" && <span title="Popular" style={{ color: COLORS.rose, fontSize: 11 }}>🔥</span>}
                        {b.status === "unread" && <span title="Unread" style={{ color: COLORS.textMuted, fontSize: 11 }}>○</span>}
                        {b.status === "age_restricted" && <span title="Age Restricted" style={{ color: COLORS.rose, fontSize: 11 }}>⚠</span>}
                        {b.status === "user_created" && <span title="User-written" style={{ color: COLORS.purple, fontSize: 11 }}>✎</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>

      {/* Legend Block */}
      <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${COLORS.border}` }}>
        <div style={{ color: "#FFF", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
          Map Legend:
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px" }}>
          {LEGEND.map(l => {
            const symbols = {
              read: "✓", unread: "○", bookmarked: "⊛", popular: "🔥",
              age_restricted: "⚠", user_created: "✎", locked: "🔒", unlocked: "✦"
            };
            const colors = {
              read: COLORS.emerald, unread: COLORS.textMuted, bookmarked: COLORS.gold,
              popular: COLORS.rose, age_restricted: COLORS.rose, user_created: COLORS.purple,
              locked: "rgba(255,255,255,0.2)", unlocked: COLORS.purple
            };
            return (
              <div key={l.status} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: COLORS.textMuted }}>
                <span style={{ 
                  color: colors[l.status], fontWeight: 800, fontSize: 12, width: 14, 
                  display: "inline-flex", justifyContent: "center"
                }}>
                  {l.status === "locked" ? <Lock size={10} /> : l.status === "unlocked" ? <Unlock size={10} /> : symbols[l.status]}
                </span>
                <span>{l.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function VaultPanel({ stories, onRemove, onNavigate }) {
  const tabs = ["Continue Reading", "Unlocked", "Favorites"];
  const [tab, setTab] = useState(0);

  return (
    <div style={{ background: COLORS.bgSubtle, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: "20px", height: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ color: "#FFF", fontWeight: 800, fontSize: 15, fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
          <Bookmark size={16} color={COLORS.purple} /> My Vault
        </div>
        <button style={{
          background: "transparent", border: `1px solid ${COLORS.border}`,
          color: COLORS.textMuted, fontSize: 10, fontWeight: 700,
          padding: "5px 10px", borderRadius: 8, cursor: "pointer", fontFamily: "'Inter', sans-serif",
          transition: "all 0.2s"
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.purple}
          onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}
        >+ Folder</button>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 16, background: "rgba(0,0,0,0.15)", borderRadius: 10, padding: 4 }}>
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} style={{
            flex: 1, padding: "6px 2px", borderRadius: 7,
            background: tab === i ? COLORS.purple : "transparent",
            border: "none",
            color: tab === i ? "#FFF" : COLORS.textMuted,
            fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif",
            transition: "all 0.2s"
          }}>{t}</button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {stories.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px 0", color: COLORS.textMuted, fontSize: 12 }}>
            Your vault is currently empty. Click "+ Vault" to save this story!
          </div>
        ) : (
          stories.map(s => (
            <div key={s.id} style={{
              display: "flex", gap: 12, alignItems: "center",
              padding: "12px", background: "rgba(255,255,255,0.02)",
              border: `1px solid ${COLORS.border}`, borderRadius: 12,
              position: "relative"
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 8,
                background: `linear-gradient(135deg, ${COLORS.purple}30, ${COLORS.rose}30)`,
                flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, border: `1px solid ${COLORS.purple}30`
              }}>📖</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 1 }}>
                  <span style={{ color: "#FFF", fontSize: 12, fontWeight: 700, fontFamily: "'Inter', sans-serif", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{s.title}</span>
                  {s.verified && <span style={{ color: COLORS.purple, fontSize: 10 }}>✓</span>}
                </div>
                <div style={{ color: COLORS.textMuted, fontSize: 10, fontFamily: "'Inter', sans-serif" }}>You chose: {s.choice}</div>
                <div style={{ color: COLORS.purple, fontSize: 9, fontWeight: 600, marginTop: 2 }}>{s.scene}</div>
              </div>
              <button 
                onClick={() => onNavigate(s.id)}
                style={{
                  background: COLORS.purple, border: "none",
                  color: "#FFF", fontSize: 10, fontWeight: 700,
                  padding: "5px 10px", borderRadius: 8, cursor: "pointer", fontFamily: "'Inter', sans-serif",
                }}
              >Read</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // ── States ──
  const [story, setStory] = useState(STORY_MOCK);
  const [loading, setLoading] = useState(false);
  const [activeScene, setActiveScene] = useState(4);
  const [activeDialogue, setActiveDialogue] = useState(STORY_MOCK.dialogue);

  const [showAgeGate, setShowAgeGate] = useState(false);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [pendingChoice, setPendingChoice] = useState(null);
  
  // Voting & Choices
  const [choicesList, setChoicesList] = useState(INITIAL_CHOICES);
  const [chosenLabel, setChosenLabel] = useState(null);
  const [showUnlock, setShowUnlock] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [totalVotes, setTotalVotes] = useState(28322);

  // Vault Interactions
  const [savedVault, setSavedVault] = useState(false);
  const [vaultStories, setVaultStories] = useState(VAULT_STORIES);
  const [vaultToast, setVaultToast] = useState("");

  // Social & Follow
  const [isFollowing, setIsFollowing] = useState(false);
  const [authorFollowers, setAuthorFollowers] = useState(STORY_MOCK.authorFollowers);

  // Comments
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [commentText, setCommentText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState("");

  // Responsiveness
  const [isMobile, setIsMobile] = useState(false);

  // Story Nodes (Progression)
  const [storyNodes, setStoryNodes] = useState(STORY_MAP_NODES);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Sync follower count
  useEffect(() => {
    setAuthorFollowers(isFollowing ? STORY_MOCK.authorFollowers + 1 : STORY_MOCK.authorFollowers);
  }, [isFollowing]);

  // Sync Vault status
  const handleVaultToggle = () => {
    if (savedVault) {
      setSavedVault(false);
      setVaultStories(prev => prev.filter(item => item.id !== "tyrants-secret-healer"));
      triggerToast("Removed from your Vault!");
    } else {
      setSavedVault(true);
      const newVaultItem = {
        id: "tyrants-secret-healer",
        title: "Tyrant's Secret Healer",
        status: "Continue",
        scene: `Chapter 1, Scene ${activeScene}`,
        choice: chosenLabel ? choicesList.find(c => c.label === chosenLabel)?.title : "Not chosen yet",
        verified: true
      };
      setVaultStories(prev => [newVaultItem, ...prev]);
      triggerToast("Added to your Vault!");
    }
  };

  const triggerToast = (msg) => {
    setVaultToast(msg);
    setTimeout(() => setVaultToast(""), 3000);
  };

  // Choice Handling
  const handleChoice = (choice) => {
    if (choice.isWrite) { 
      setShowWriteModal(true); 
      return; 
    }
    
    if (choice.ageRestricted) {
      const numRating = parseInt(story.ageRating || "16");
      const hasConsented = localStorage.getItem("tv_age_consent") === "true";
      if (!hasConsented) {
        setPendingChoice(choice);
        setShowAgeGate(true);
        return;
      }
    }
    
    selectChoice(choice.label);
  };

  const selectChoice = (label) => {
    setChosenLabel(label);
    setShowUnlock(true);
    
    // Cast dynamic vote in chart
    if (!hasVoted) {
      setHasVoted(true);
      setTotalVotes(prev => prev + 1);
      setChoicesList(prev => prev.map(c => {
        if (c.label === label) {
          return { ...c, votes: (c.votes || 0) + 1 };
        }
        return c;
      }));
    }

    // Update Story Dialogue banner based on choices
    let text = "";
    if (label === "A") {
      text = "Elara: 'If I confess my healing magic to him now, he might lock me in the deep dungeons.'";
    } else if (label === "B") {
      text = "Elara: 'Your Majesty... the warmth in your chest is my hand. I am the one who keeps you alive.'";
    } else if (label === "C") {
      text = "Elara: 'This black mark on your chest... it is not a wound from the war. It is a curse of royal blood magic.'";
    }
    setActiveDialogue({ speaker: "Elara", text });

    // Enable next scene (Scene 5) in flow map
    setStoryNodes(prev => prev.map(n => {
      if (n.id === 5) {
        return { ...n, status: "unread" };
      }
      return n;
    }));
  };

  const handleAgeConsent = () => {
    localStorage.setItem("tv_age_consent", "true");
    setShowAgeGate(false);
    if (pendingChoice) {
      selectChoice(pendingChoice.label);
      setPendingChoice(null);
    }
  };

  const handleCustomSceneSubmit = (customText) => {
    setShowWriteModal(false);
    setChosenLabel("D");
    setShowUnlock(true);

    if (!hasVoted) {
      setHasVoted(true);
      setTotalVotes(prev => prev + 1);
      setChoicesList(prev => prev.map(c => {
        if (c.label === "D") {
          return { ...c, votes: 1 };
        }
        return c;
      }));
    }

    setActiveDialogue({
      speaker: "Elara (Custom)",
      text: customText
    });

    // Enable next scene (Scene 5) in flow map
    setStoryNodes(prev => prev.map(n => {
      if (n.id === 5) {
        return { ...n, status: "unread" };
      }
      return n;
    }));
  };

  // Scene navigation
  const handleProceedToScene = (sceneNum) => {
    if (sceneNum > 5) return;
    setActiveScene(sceneNum);
    setShowUnlock(false);
    
    // Update map active status
    setStoryNodes(prev => prev.map(n => ({
      ...n,
      active: n.id === sceneNum,
      status: n.id < sceneNum ? "read" : (n.id === sceneNum ? "current" : n.status)
    })));

    if (sceneNum === 5) {
      setActiveDialogue({
        speaker: "Tyrant Emperor",
        text: "Tyrant: 'Your hands... they feel like spring breeze. Don't leave my chamber tonight, healer.'"
      });
      triggerToast("Advanced to Scene 5!");
    } else {
      setActiveDialogue(story.dialogue);
      setChosenLabel(null);
      setHasVoted(false);
      triggerToast(`Returned to Scene ${sceneNum}!`);
    }
  };

  // Follow author action
  const toggleFollow = () => {
    setIsFollowing(prev => !prev);
    triggerToast(isFollowing ? "Unfollowed admin" : "Following admin!");
  };

  // Comments interaction
  const handlePostComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now(),
      user: "You",
      avatar: "YO",
      level: 1,
      time: "Just now",
      text: commentText.trim(),
      likes: 0,
      isLiked: false
    };

    setComments(prev => [newComment, ...prev]);
    setCommentText("");
    triggerToast("Comment posted!");
  };

  const handleLikeComment = (id) => {
    setComments(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          likes: c.isLiked ? c.likes - 1 : c.likes + 1,
          isLiked: !c.isLiked
        };
      }
      return c;
    }));
  };

  const handleReplySubmit = (id) => {
    if (!replyText.trim()) return;
    triggerToast(`Replied to comment!`);
    setReplyText("");
    setActiveReplyId(null);
  };

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.text, fontFamily: "'Inter', sans-serif", overflowX: "hidden" }}>
      <Header />
      
      {/* Modals */}
      {showAgeGate && <AgeGateModal rating={story.ageRating} onConsent={handleAgeConsent} onDecline={() => setShowAgeGate(false)} />}
      {showWriteModal && <WriteModal onClose={() => setShowWriteModal(false)} onSubmit={handleCustomSceneSubmit} />}

      {/* Floating Alerts/Toasts */}
      <AnimatePresence>
        {vaultToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            style={{
              position: "fixed", bottom: isMobile ? 80 : 30, right: 30, zIndex: 999,
              background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
              color: "#FFF", padding: "12px 24px", borderRadius: 16,
              boxShadow: "0 10px 30px rgba(139,92,246,0.4)", display: "flex", alignItems: "center", gap: 10,
              fontSize: 14, fontWeight: 700
            }}
          >
            <Sparkles size={16} />
            {vaultToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Premium Story Sticky Sub-Header ─── */}
      <div style={{
        position: "sticky", top: 60, zIndex: 100,
        background: "rgba(11, 10, 20, 0.8)", backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${COLORS.border}`,
      }}>
        <div style={{
          maxWidth: 1300, margin: "0 auto",
          display: "flex", alignItems: "center", justifyItems: "center",
          padding: isMobile ? "12px 16px" : "14px 24px",
          gap: 16
        }}>
          {/* Back Icon */}
          <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", display: "flex", alignItems: "center", padding: 4 }}>
            <ArrowLeft size={20} />
          </button>

          {/* Breadcrumb Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <h1 style={{ margin: 0, fontSize: isMobile ? 15 : 18, fontWeight: 900, color: "#FFF", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                {story.title}
              </h1>
              <span style={{ color: COLORS.purple, fontSize: 13, display: "flex" }}>✓</span>
              
              {!isMobile && (
                <>
                  <span style={{ color: COLORS.textMuted, fontSize: 12 }}>by {story.author}</span>
                  <button 
                    onClick={toggleFollow}
                    style={{
                      background: isFollowing ? COLORS.purple : "transparent",
                      border: `1px solid ${COLORS.purple}`,
                      color: "#FFF", fontSize: 10, fontWeight: 700,
                      padding: "3px 10px", borderRadius: 20, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 4, transition: "all 0.2s"
                    }}
                  >
                    {isFollowing ? <UserCheck size={10} /> : <UserPlus size={10} />}
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                </>
              )}
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2, color: COLORS.textMuted, fontSize: 11 }}>
              <span>{story.chapter}</span>
              <span>•</span>
              <span style={{ color: COLORS.purple, fontWeight: 700 }}>Scene {activeScene} of {story.totalScenes}</span>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {/* Rating Stars */}
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.03)", padding: "5px 10px", borderRadius: 12, border: `1px solid ${COLORS.border}` }}>
              <Star size={12} fill={COLORS.gold} color={COLORS.gold} />
              <span style={{ fontSize: 11, fontWeight: 800, color: COLORS.gold }}>{story.rating}</span>
            </div>

            {/* Genres */}
            {!isMobile && story.genres.map(g => <Badge key={g} label={g} color={COLORS.purple} />)}

            {/* Vault Save */}
            <button
              onClick={handleVaultToggle}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: savedVault ? `linear-gradient(135deg, ${COLORS.purple}, #A78BFA)` : "rgba(255,255,255,0.04)",
                border: savedVault ? "none" : `1.5px solid ${COLORS.border}`,
                color: "#FFF", padding: "8px 14px", borderRadius: 20, cursor: "pointer",
                fontSize: 12, fontWeight: 700, transition: "all 0.2s",
                boxShadow: savedVault ? `0 4px 10px ${COLORS.purple}30` : "none"
              }}>
              <Bookmark size={12} fill={savedVault ? "#FFF" : "none"} />
              <span>{savedVault ? "In Vault" : "+ Vault"}</span>
            </button>

            {/* Share */}
            {!isMobile && (
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  triggerToast("Link copied to clipboard!");
                }}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "rgba(255,255,255,0.04)", border: `1.5px solid ${COLORS.border}`,
                  color: "#FFF", padding: "8px 14px", borderRadius: 20, cursor: "pointer",
                  fontSize: 12, fontWeight: 700, transition: "all 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.purple}
                onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}
              >
                <Share2 size={12} />
                <span>Share</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Main Grid Layout ─── */}
      <div style={{
        maxWidth: 1300, margin: "0 auto",
        padding: isMobile ? "16px 16px 100px" : "24px 24px 60px",
        display: isMobile ? "block" : "grid",
        gridTemplateColumns: "72px 1fr 340px",
        gap: 24,
        alignItems: "start",
      }}>
        
        {/* SIDEBAR NAVIGATION (Desktop) */}
        {!isMobile && (
          <div style={{
            position: "sticky", top: 150,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
            padding: "8px 0"
          }}>
            {[
              { icon: "🏠", label: "Home" },
              { icon: "🔍", label: "Explore" },
              { icon: "🗃️", label: "Vault", active: true },
              { icon: "✏️", label: "Create" },
              { icon: "🔔", label: "Notifs" },
            ].map(item => (
              <button key={item.label} title={item.label} style={{
                width: 52, height: 52, borderRadius: 14,
                background: item.active ? COLORS.purpleLight : "transparent",
                border: item.active ? `1px solid ${COLORS.purple}40` : "1px solid transparent",
                cursor: "pointer", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 3,
                transition: "all 0.2s", color: item.active ? COLORS.purple : COLORS.textMuted
              }}
                onMouseEnter={e => {
                  if (!item.active) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    e.currentTarget.style.color = "#FFF";
                  }
                }}
                onMouseLeave={e => {
                  if (!item.active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = COLORS.textMuted;
                  }
                }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* CENTER STORY BOARD */}
        <div style={{ minWidth: 0 }}>
          
          {/* Main Visual Comic Banner */}
          <div style={{
            borderRadius: 24, overflow: "hidden",
            background: "linear-gradient(180deg, #100E26 0%, #06050F 100%)",
            position: "relative", aspectRatio: isMobile ? "4/3" : "21/9",
            marginBottom: 24, border: `1px solid ${COLORS.border}`,
            boxShadow: "0 15px 40px rgba(0,0,0,0.4)"
          }}>
            {/* Rich Webtoon Illustration Cover */}
            <img 
              src={story.coverImage} 
              alt="Manhwa scene illustration"
              style={{
                width: "100%", height: "100%", objectFit: "cover",
                opacity: 0.85
              }}
            />
            {/* Cinematic Gradient Overlays */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to bottom, transparent 30%, rgba(5,4,10,0.85) 100%)",
            }} />
            
            {/* Glowing particle effect indicators */}
            <div style={{
              position: "absolute", top: 20, left: 20,
              background: "rgba(139,92,246,0.25)", border: `1px solid ${COLORS.purple}`,
              padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700,
              color: "#FFF", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", gap: 5
            }}>
              <Sparkles size={11} color={COLORS.purple} />
              <span>Interactive Story Pilot</span>
            </div>

            {/* Scene tag indicator */}
            <div style={{
              position: "absolute", top: 20, right: 20,
              background: "rgba(0,0,0,0.6)", border: `1px solid ${COLORS.border}`,
              padding: "4px 10px", borderRadius: 8, fontSize: 10, fontWeight: 700,
              color: COLORS.textMuted
            }}>
              Scene {activeScene}/10
            </div>

            {/* Premium Dialogue Bubble */}
            <div style={{
              position: "absolute", bottom: 20, left: 20, right: 20,
              background: "rgba(15, 13, 28, 0.85)", backdropFilter: "blur(12px)",
              border: `1px solid ${COLORS.purple}30`, borderRadius: 16,
              padding: "14px 20px", display: "flex", gap: 12, alignItems: "center",
              boxShadow: "0 8px 25px rgba(0,0,0,0.5)"
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.rose})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 800, color: "#FFF", flexShrink: 0
              }}>
                💬
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ color: COLORS.purple, fontWeight: 800, fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {activeDialogue.speaker}:
                </span>
                <p style={{ margin: "3px 0 0", color: "#E5E7EB", fontSize: 13, lineHeight: 1.5, fontWeight: 500, fontFamily: "Georgia, serif", fontStyle: "italic" }}>
                  "{activeDialogue.text}"
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Choices Section */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <span style={{
                fontSize: isMobile ? 18 : 22, fontWeight: 900, color: "#FFF",
                fontFamily: "Georgia, serif", letterSpacing: 0.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 8
              }}>
                <Sparkles size={18} color={COLORS.purple} /> ✦ What happens next? ✦
              </span>
            </div>

            {/* List of Choice Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {choicesList.map(choice => {
                const isSelected = chosenLabel === choice.label;
                return (
                  <div
                    key={choice.label}
                    onClick={() => handleChoice(choice)}
                    style={{
                      background: isSelected ? "rgba(139, 92, 246, 0.08)" : 
                                  choice.isWrite ? "rgba(139, 92, 246, 0.02)" : COLORS.bgSubtle,
                      border: isSelected ? `2.5px solid ${COLORS.purple}` :
                              choice.isWrite ? `1.5px dashed ${COLORS.purple}40` : `1.5px solid ${COLORS.border}`,
                      borderRadius: 16, padding: "16px",
                      cursor: "pointer", transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: isSelected ? `0 0 20px ${COLORS.purple}15` : "0 4px 10px rgba(0,0,0,0.15)"
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = COLORS.purple;
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = choice.isWrite ? `${COLORS.purple}40` : COLORS.border;
                        e.currentTarget.style.transform = "translateY(0)";
                      }
                    }}
                  >
                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      {/* Round Badge Label */}
                      <span style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: choice.isWrite ? `${COLORS.purple}20` : `linear-gradient(135deg, ${COLORS.purple}, #A78BFA)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14, fontWeight: 900,
                        color: choice.isWrite ? COLORS.purple : "#FFF", flexShrink: 0,
                        boxShadow: choice.isWrite ? "none" : "0 4px 10px rgba(139,92,246,0.3)"
                      }}>{choice.label}</span>
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
                          <span style={{ fontWeight: 800, fontSize: 15, color: "#FFF" }}>{choice.title}</span>
                          {choice.popular && (
                            <span style={{
                              background: `${COLORS.gold}15`, color: COLORS.gold, fontSize: 10,
                              padding: "2px 8px", borderRadius: 6, fontWeight: 700, display: "flex", alignItems: "center", gap: 3
                            }}>
                              <Flame size={10} fill={COLORS.gold} /> Popular
                            </span>
                          )}
                          {choice.ageRestricted && (
                            <span style={{
                              background: `${COLORS.rose}20`, color: COLORS.rose, fontSize: 10,
                              padding: "2px 8px", borderRadius: 6, fontWeight: 700
                            }}>
                              ⚠ 16+
                            </span>
                          )}
                        </div>
                        
                        <p style={{ color: COLORS.textMuted, fontSize: 13, margin: "0 0 8px", lineHeight: 1.5 }}>
                          {choice.desc}
                        </p>

                        {/* Interactive write-in input representation */}
                        {choice.isWrite && (
                          <div style={{
                            display: "flex", alignItems: "center", gap: 8, marginTop: 8,
                            background: "rgba(0,0,0,0.2)", borderRadius: 10,
                            padding: "10px 14px", border: `1px solid ${COLORS.border}`
                          }}>
                            <span style={{ color: COLORS.textMuted, fontSize: 12, flex: 1 }}>Type your plot twist and submit...</span>
                            <span style={{ color: COLORS.purple, fontSize: 14 }}>✏️</span>
                          </div>
                        )}

                        {/* Tags & Meta */}
                        {choice.tags.length > 0 && (
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                            {choice.tags.map(t => <Badge key={t} label={t} color={COLORS.purple} />)}
                            <span style={{ color: COLORS.textMuted, fontSize: 11, display: "flex", alignItems: "center", gap: 4, marginLeft: 6 }}>
                              🔥 {((choice.votes / totalVotes) * 100 || 25).toFixed(1)}% of readers chose this
                            </span>
                          </div>
                        )}
                      </div>
                      <ChevronRight size={20} color="rgba(255,255,255,0.2)" style={{ marginTop: 8 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Unlock Panel */}
          <AnimatePresence>
            {showUnlock && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  background: "linear-gradient(135deg, #120D2A, #06050F)",
                  border: `1.5px solid ${COLORS.purple}50`,
                  borderRadius: 20, padding: "24px", marginBottom: 24,
                  position: "relative", overflow: "hidden",
                  boxShadow: "0 10px 30px rgba(139,92,246,0.15)"
                }}
              >
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: "rgba(139,92,246,0.15)", border: `1px solid ${COLORS.purple}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, flexShrink: 0
                  }}>
                    📖
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: "#FFF", fontSize: 16, fontWeight: 800 }}>Storyline Unlocked!</h3>
                    <p style={{ margin: "4px 0 0", color: COLORS.textMuted, fontSize: 13, lineHeight: 1.5 }}>
                      Your decision has opened a new pathway. Are you ready to see the consequences of your choice?
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginTop: 16 }}>
                  <button 
                    onClick={() => handleProceedToScene(5)}
                    style={{
                      background: `linear-gradient(135deg, ${COLORS.purple}, #A78BFA)`,
                      border: "none", color: "#FFF", padding: "12px 24px",
                      borderRadius: 12, fontWeight: 700, cursor: "pointer", fontSize: 13,
                      boxShadow: `0 4px 15px ${COLORS.purple}40`, transition: "all 0.2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                  >
                    Continue to Scene 5 →
                  </button>
                  
                  {chosenLabel !== "D" && (
                    <span style={{ color: COLORS.textMuted, fontSize: 12 }}>
                      or explore other choices below!
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Live Polling (Fan Vote) */}
          <div style={{
            background: COLORS.bgSubtle, border: `1px solid ${COLORS.border}`, borderRadius: 20,
            padding: "20px", marginBottom: 24, boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#FFF", display: "flex", alignItems: "center", gap: 8 }}>
                📊 Fan Vote Poll <Badge label="Live Results" color={COLORS.rose} />
              </div>
              <span style={{ color: COLORS.textMuted, fontSize: 12, fontWeight: 600 }}>Total: {totalVotes.toLocaleString()} votes</span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {choicesList.map(c => {
                const percentage = totalVotes > 0 ? (c.votes / totalVotes) * 100 : 25;
                const isSelected = chosenLabel === c.label;
                return (
                  <div key={c.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13 }}>
                      <span style={{ color: isSelected ? COLORS.purple : "#FFF", fontWeight: isSelected ? 800 : 600 }}>
                        {c.label} · {c.title} {isSelected && " (Your Vote)"}
                      </span>
                      <span style={{ fontWeight: 700, color: isSelected ? COLORS.purple : COLORS.textMuted }}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    {/* Bar Tracker */}
                    <div style={{ height: 8, background: "rgba(0,0,0,0.25)", borderRadius: 6, overflow: "hidden", border: `1px solid ${COLORS.border}` }}>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        style={{
                          height: "100%",
                          background: isSelected 
                            ? `linear-gradient(90deg, ${COLORS.purple}, ${COLORS.rose})` 
                            : `linear-gradient(90deg, rgba(139,92,246,0.35), rgba(139,92,246,0.15))`,
                          borderRadius: 6
                        }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scene Traversal Buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            <button 
              onClick={() => handleProceedToScene(4)}
              disabled={activeScene === 4}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "transparent", border: `1px solid ${COLORS.border}`,
                color: activeScene === 4 ? "rgba(255,255,255,0.15)" : "#FFF", 
                padding: "10px 18px", borderRadius: 12, cursor: activeScene === 4 ? "not-allowed" : "pointer", 
                fontSize: 13, fontWeight: 700, transition: "all 0.2s"
              }}
              onMouseEnter={e => { if(activeScene > 4) e.currentTarget.style.borderColor = COLORS.purple; }}
              onMouseLeave={e => { if(activeScene > 4) e.currentTarget.style.borderColor = COLORS.border; }}
            >
              ← Previous Scene
            </button>
            
            <button style={{
              display: "flex", alignItems: "center", gap: 6, color: COLORS.rose,
              background: "transparent", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600
            }}>
              <AlertTriangle size={12} /> Report Scene
            </button>
          </div>

          {/* Comments Section */}
          <div style={{
            background: COLORS.bgSubtle, border: `1px solid ${COLORS.border}`, borderRadius: 20,
            padding: "20px", marginBottom: 24, boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: "#FFF", display: "flex", alignItems: "center", gap: 8 }}>
                <MessageSquare size={16} color={COLORS.purple} /> 💬 Reader Discussions ({comments.length})
              </div>
              <Badge label="Top Comments" color={COLORS.purple} />
            </div>

            {/* Comment Form Input */}
            <form onSubmit={handlePostComment} style={{ display: "flex", gap: 10, marginBottom: 24, alignItems: "flex-start" }}>
              <Avatar initials="YO" size={34} color={COLORS.purple} />
              <div style={{ flex: 1, position: "relative" }}>
                <input
                  type="text"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Share your thoughts on this scene choice..."
                  style={{
                    width: "100%", background: "rgba(0,0,0,0.2)",
                    border: `1px solid ${COLORS.border}`, borderRadius: 12,
                    color: "#FFF", padding: "12px 48px 12px 14px", fontSize: 13,
                    outline: "none", boxSizing: "border-box", transition: "all 0.2s"
                  }}
                  onFocus={e => e.target.style.borderColor = COLORS.purple}
                  onBlur={e => e.target.style.borderColor = COLORS.border}
                />
                <button
                  type="submit"
                  style={{
                    position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
                    background: COLORS.purple, border: "none", width: 32, height: 32,
                    borderRadius: 10, color: "#FFF", display: "flex", alignItems: "center",
                    justifyContent: "center", cursor: "pointer", boxShadow: `0 2px 8px ${COLORS.purple}40`
                  }}
                >
                  <Send size={12} />
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <AnimatePresence initial={false}>
                {comments.map((c, i) => (
                  <motion.div 
                    key={c.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      display: "flex", gap: 12, padding: "16px 0",
                      borderBottom: i < comments.length - 1 ? `1px solid ${COLORS.border}` : "none",
                    }}
                  >
                    <Avatar initials={c.avatar} size={34} color={c.user === 'You' ? COLORS.purple : "#6B7280"} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span style={{ fontWeight: 800, fontSize: 13, color: "#FFF" }}>{c.user}</span>
                        {c.user !== 'You' && <Badge label={`Lv.${c.level}`} color="#9CA3AF" style={{ fontSize: 9 }} />}
                        <span style={{ color: COLORS.textMuted, fontSize: 11 }}>{c.time}</span>
                      </div>
                      
                      <p style={{ color: "#E5E7EB", fontSize: 13, margin: "0 0 8px", lineHeight: 1.5 }}>{c.text}</p>
                      
                      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                        {/* Interactive Likes button with bouncy scale */}
                        <button 
                          onClick={() => handleLikeComment(c.id)}
                          style={{ 
                            color: c.isLiked ? COLORS.rose : COLORS.textMuted, 
                            background: "none", border: "none", cursor: "pointer", 
                            fontSize: 12, display: "flex", alignItems: "center", gap: 4,
                            fontWeight: 600, padding: 0
                          }}
                        >
                          <Heart size={12} fill={c.isLiked ? COLORS.rose : "none"} /> 
                          <span>{c.likes}</span>
                        </button>
                        
                        <button 
                          onClick={() => setActiveReplyId(activeReplyId === c.id ? null : c.id)}
                          style={{ 
                            color: COLORS.purple, background: "none", border: "none", 
                            cursor: "pointer", fontSize: 12, fontWeight: 600, padding: 0 
                          }}
                        >
                          Reply
                        </button>
                      </div>

                      {/* Expandable Reply Box */}
                      {activeReplyId === c.id && (
                        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                          <input 
                            type="text"
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                            style={{
                              flex: 1, background: "rgba(0,0,0,0.15)",
                              border: `1px solid ${COLORS.border}`, borderRadius: 8,
                              color: "#FFF", padding: "8px 12px", fontSize: 12, outline: "none"
                            }}
                          />
                          <button 
                            onClick={() => handleReplySubmit(c.id)}
                            style={{
                              background: COLORS.purple, border: "none", color: "#FFF",
                              borderRadius: 8, padding: "0 14px", fontSize: 12, fontWeight: 700, cursor: "pointer"
                            }}
                          >Post</button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN SIDEBAR (Desktop) ─── */}
        {!isMobile && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "sticky", top: 150 }}>
            
            {/* Custom Interactive You Chose Panel */}
            {chosenLabel && (
              <div style={{
                background: "linear-gradient(135deg, #120D2A, #06050F)",
                border: `1.5px solid ${COLORS.purple}`,
                borderRadius: 20, padding: "16px",
                boxShadow: "0 10px 25px rgba(139,92,246,0.15)"
              }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: COLORS.purple, letterSpacing: 1.5, display: "block", marginBottom: 8, textTransform: "uppercase" }}>Your Selection</span>
                
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: `linear-gradient(135deg, ${COLORS.purple}, #A78BFA)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 900, color: "#FFF"
                  }}>{chosenLabel}</span>
                  <div>
                    <h4 style={{ margin: 0, color: "#FFF", fontSize: 14, fontWeight: 850 }}>
                      {choicesList.find(c => c.label === chosenLabel)?.title}
                    </h4>
                    <span style={{ color: COLORS.textMuted, fontSize: 11 }}>Active path: Scene {activeScene}</span>
                  </div>
                </div>
                
                <p style={{ color: COLORS.textMuted, fontSize: 12, lineHeight: 1.4, margin: "0 0 12px" }}>
                  {choicesList.find(c => c.label === chosenLabel)?.desc}
                </p>

                <button 
                  onClick={() => handleProceedToScene(5)}
                  style={{
                    width: "100%", background: COLORS.purple, border: "none",
                    color: "#FFF", padding: "10px 0", borderRadius: 10,
                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                    boxShadow: `0 4px 10px ${COLORS.purple}30`
                  }}
                >
                  Proceed to Scene 5 →
                </button>
              </div>
            )}

            {/* About Creator Profile */}
            <div style={{
              background: COLORS.bgSubtle, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: "18px",
            }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#FFF", marginBottom: 14 }}>About the Creator</div>
              
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                <Avatar initials="SI" size={38} color={COLORS.purple} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: "#FFF", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{story.author}</span>
                    <span style={{ color: COLORS.purple, fontSize: 12 }}>✓</span>
                  </div>
                  <div style={{ color: COLORS.textMuted, fontSize: 12 }}>{authorFollowers.toLocaleString()} Followers</div>
                </div>
                
                <button 
                  onClick={toggleFollow}
                  style={{
                    background: isFollowing ? COLORS.purple : "transparent",
                    border: `1.5px solid ${COLORS.purple}`, color: "#FFF",
                    padding: "6px 14px", borderRadius: 12, cursor: "pointer", fontSize: 11, fontWeight: 700,
                    transition: "all 0.2s"
                  }}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </div>

              <p style={{ color: COLORS.textMuted, fontSize: 12, lineHeight: 1.5, margin: "0 0 12px" }}>
                {story.authorBio}
              </p>
              
              <button style={{ color: COLORS.purple, background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, padding: 0 }}>
                View Creator Profile →
              </button>
            </div>

            {/* Story Map (Desktop Sidebar) */}
            <StoryMap 
              nodes={storyNodes} 
              activeScene={activeScene} 
              onSelectScene={handleProceedToScene}
              onSelectChoice={(b) => {
                const fullChoice = choicesList.find(c => c.label === b.label);
                if (fullChoice) handleChoice(fullChoice);
              }}
              chosenLabel={chosenLabel}
              isMobile={false} 
            />

            {/* Interactive Vault list */}
            <VaultPanel 
              stories={vaultStories} 
              onRemove={handleVaultToggle}
              onNavigate={(id) => triggerToast("Viewing story details from Vault...")}
            />

          </div>
        )}
      </div>

      {/* MOBILE BOTTOM STORY MAP & VAULT (only on mobile layout) */}
      {isMobile && (
        <div style={{ padding: "0 16px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
          <StoryMap 
            nodes={storyNodes} 
            activeScene={activeScene} 
            onSelectScene={handleProceedToScene}
            onSelectChoice={(b) => {
              const fullChoice = choicesList.find(c => c.label === b.label);
              if (fullChoice) handleChoice(fullChoice);
            }}
            chosenLabel={chosenLabel}
            isMobile={true} 
          />
          <VaultPanel 
            stories={vaultStories} 
            onRemove={handleVaultToggle}
            onNavigate={(id) => triggerToast("Viewing story details from Vault...")}
          />
        </div>
      )}

      {/* ─── Mobile Bottom Sticky Nav ─── */}
      {isMobile && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
          background: "rgba(11, 10, 20, 0.95)", backdropFilter: "blur(12px)",
          borderTop: `1px solid ${COLORS.border}`,
          display: "flex", justifyContent: "space-around",
          padding: "10px 0 20px",
        }}>
          {[
            { icon: "🏠", label: "Home" },
            { icon: "🔍", label: "Explore" },
            { icon: "🗃️", label: "Vault", active: true },
            { icon: "✏️", label: "Create" },
            { icon: "👤", label: "Profile" },
          ].map(item => (
            <button key={item.label} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              background: "none", border: "none", cursor: "pointer",
            }}>
              <span style={{ fontSize: 18, color: item.active ? COLORS.purple : COLORS.textMuted }}>{item.icon}</span>
              <span style={{
                fontSize: 9, fontWeight: 700,
                color: item.active ? COLORS.purple : COLORS.textMuted,
                textTransform: "uppercase"
              }}>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      <Footer />
    </div>
  );
}
