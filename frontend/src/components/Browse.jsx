import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import StoryImage from "./StoryImage";

// ── Design tokens (matched from homepage) ──────────────────────────────────
const C = {
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

// ── Genre definitions ──────────────────────────────────────────────────────
const GENRES = [
  { id: "all",         label: "All Genres",    emoji: "✨" },
  { id: "romance",     label: "Romance",        emoji: "💕" },
  { id: "fantasy",     label: "Fantasy",        emoji: "🏰" },
  { id: "drama",       label: "Drama",          emoji: "🎭" },
  { id: "action",      label: "Action",         emoji: "⚔️" },
  { id: "comedy",      label: "Comedy",         emoji: "😂" },
  { id: "sliceoflife", label: "Slice of Life",  emoji: "🌸" },
  { id: "scifi",       label: "Sci-Fi",         emoji: "🚀" },
  { id: "supernatural",label: "Supernatural",   emoji: "👻" },
  { id: "mystery",     label: "Mystery",        emoji: "🔍" },
  { id: "thriller",    label: "Thriller",       emoji: "😱" },
  { id: "bl",          label: "BL",             emoji: "💙" },
  { id: "gl",          label: "GL",             emoji: "💜" },
  { id: "historical",  label: "Historical",     emoji: "📜" },
  { id: "horror",      label: "Horror",         emoji: "🩸" },
  { id: "sports",      label: "Sports",         emoji: "🏆" },
  { id: "superhero",   label: "Superhero",      emoji: "⚡" },
  { id: "heartwarming",label: "Heartwarming",   emoji: "🤍" },
  { id: "informative", label: "Informative",    emoji: "📚" },
  { id: "graphic",     label: "Graphic Novel",  emoji: "🎨" },
  { id: "mature",      label: "Mature 18+",     emoji: "🔥" },
  { id: "adventure",   label: "Adventure",      emoji: "🗺️" },
];

// ── Story data (from homepage + browse page shown in screenshot) ───────────
const RAW_STORIES = [
  // From browse screenshot
  { id: 101, title: "The Villainess's Green Thumb",       genre: "drama",      cover: "🌿", views: "43.7K", rating: 5.0,  mood: ["wholesome","cozy"],          bg: "#EAF5E8", desc: "She reincarnated as the villainess—but chose gardening over revenge.",                      type: "comic",  updated: true,  day: "Mon" },
  { id: 102, title: "Whispers of the Heart",              genre: "romance",    cover: "💌", views: "4.3K",  rating: 5.0,  mood: ["slow burn","sweet"],          bg: "#FDE8F0", desc: "Letters exchanged through an old apartment mailbox. Fate had other plans.",               type: "novel",  updated: false, day: "Tue" },
  { id: 103, title: "The Last Alchemist",                 genre: "action",     cover: "⚗️", views: "3.2K",  rating: 5.0,  mood: ["action","mystery"],           bg: "#FDF3E0", desc: "The last surviving alchemist must unravel a conspiracy that ended her order.",              type: "comic",  updated: true,  day: "Wed" },
  { id: 104, title: "Secret Melody",                      genre: "drama",      cover: "🎵", views: "34.2K", rating: 4.9,  mood: ["music","realistic"],          bg: "#E8F0FD", desc: "A prodigy pianist hides her identity from the world—until he hears her play.",             type: "comic",  updated: true,  day: "Mon" },
  { id: 105, title: "The Vampire Who Hated Blood",        genre: "drama",      cover: "🧛", views: "20.4K", rating: 4.9,  mood: ["dark","comedy"],              bg: "#FDE8F0", desc: "He's been a vampire for 800 years. He still can't stand the sight of blood.",              type: "comic",  updated: false, day: "Thu" },
  { id: 106, title: "Eternal Blade",                      genre: "action",     cover: "🗡️", views: "419",   rating: 4.9,  mood: ["action","heroic"],            bg: "#F6F0E8", desc: "One sword. One purpose. The rest of the world will have to get out of the way.",          type: "comic",  updated: true,  day: "Fri" },
  { id: 107, title: "Undercover High",                    genre: "comedy",     cover: "🕵️", views: "339",   rating: 4.9,  mood: ["funny","school"],             bg: "#FEF3DC", desc: "A 30-year-old detective goes back to high school. Nothing goes according to plan.",         type: "comic",  updated: true,  day: "Sat" },
  { id: 108, title: "Haunted Manor",                      genre: "horror",     cover: "👻", views: "1.8K",  rating: 4.8,  mood: ["horror","mystery"],           bg: "#1F2430", desc: "The manor has 13 rooms. Only 12 were on the listing. She already moved in.",              type: "comic",  updated: false, day: "Sun", textLight: true },
  { id: 109, title: "The Prince in Cat's Fur",            genre: "fantasy",    cover: "🐈", views: "34.4K", rating: 4.7,  mood: ["fantasy","romance"],          bg: "#EDE8FA", desc: "Cursed into a cat. Found by the one person he was forbidden to love.",                    type: "comic",  updated: true,  day: "Mon" },
  { id: 110, title: "The Polite Demon's Summoning",       genre: "fantasy",    cover: "😈", views: "18.1K", rating: 4.7,  mood: ["comedy","magic"],             bg: "#F0FDE8", desc: "She summoned a demon who sent a formal apology letter before arriving.",                   type: "comic",  updated: true,  day: "Tue" },
  { id: 111, title: "The Royal Kitchen's Unexpected Chef",genre: "drama",      cover: "👨‍🍳", views: "8.8K",  rating: 4.7,  mood: ["cozy","royalty"],             bg: "#FEF3DC", desc: "She cooked to survive. The royal family ate her food and refused to let her leave.",       type: "novel",  updated: false, day: "Wed" },
  { id: 112, title: "Shadow of the Dragon",               genre: "fantasy",    cover: "🐉", views: "952",   rating: 4.7,  mood: ["dark","epic"],                bg: "#EDE8FA", desc: "The dragon's shadow has followed her since birth. Now she knows why.",                    type: "comic",  updated: true,  day: "Thu" },
  { id: 113, title: "Hidden Stage Lights",                genre: "fantasy",    cover: "🎭", views: "11.0K", rating: 4.6,  mood: ["romance","music"],            bg: "#FDE8F0", desc: "Behind every spotlight hides a story that was never meant to be told.",                   type: "comic",  updated: true,  day: "Fri" },
  { id: 114, title: "Neon Nights",                        genre: "scifi",      cover: "🌃", views: "1.1K",  rating: 4.6,  mood: ["cyberpunk","mystery"],        bg: "#1A1A2E", desc: "In a city that never sleeps, she's the only one who remembers the silence.",               type: "comic",  updated: false, day: "Sat", textLight: true },
  { id: 115, title: "The Prince in Cat's Fur",            genre: "fantasy",    cover: "🐈", views: "50.7K", rating: 4.5,  mood: ["fantasy","romance"],          bg: "#EDE8FA", desc: "Second arc — the curse deepens. Their bond grows more complicated.",                       type: "comic",  updated: true,  day: "Sun" },
  { id: 116, title: "The Polite Demon's Summoning",       genre: "fantasy",    cover: "😈", views: "33.6K", rating: 4.5,  mood: ["comedy","magic"],             bg: "#F0FDE8", desc: "Season 2 — the demon returns, this time without the apology.",                           type: "comic",  updated: false, day: "Mon" },
  { id: 117, title: "The Bloodless Vampire",              genre: "comedy",     cover: "🧛‍♀️",views: "32.9K", rating: 4.5,  mood: ["comedy","supernatural"],      bg: "#FDEEF3", desc: "She became a vampire and discovered she's violently allergic to blood. Classic.",          type: "comic",  updated: true,  day: "Tue" },
  { id: 118, title: "The Last Duel of Master Kurogane",   genre: "romance",    cover: "⚔️", views: "12.5K", rating: 4.5,  mood: ["historical","slow burn"],     bg: "#F6F0E8", desc: "A legendary swordsman. A woman who bet her life on a single duel with him.",              type: "novel",  updated: true,  day: "Wed" },
  { id: 119, title: "Ocean's Secret",                     genre: "mystery",    cover: "🌊", views: "2.2K",  rating: 4.5,  mood: ["mystery","romance"],          bg: "#E8F0FD", desc: "The tide keeps washing up clues. She keeps ignoring the warning signs.",                  type: "comic",  updated: false, day: "Thu" },
  { id: 120, title: "Frost and Sunshine",                 genre: "fantasy",    cover: "☀️", views: "36.4K", rating: 4.4,  mood: ["enemies-to-lovers","magic"],  bg: "#FEF3DC", desc: "Opposites in every way. Destined in every way. Neither of them was told.",                type: "comic",  updated: true,  day: "Fri" },
  { id: 121, title: "Opposites Attract: The CEO's Contract",genre: "fantasy",  cover: "💼", views: "35.6K", rating: 4.4,  mood: ["romance","office"],           bg: "#EDE8FA", desc: "He offered a contract. She signed it thinking it was a prank.",                           type: "comic",  updated: true,  day: "Sat" },
  { id: 122, title: "Brushstrokes of the Departed",       genre: "romance",    cover: "🎨", views: "50.6K", rating: 4.3,  mood: ["supernatural","sad"],         bg: "#E8F0FD", desc: "She can see the last painting a person will ever make before they die.",                  type: "novel",  updated: false, day: "Sun" },
  { id: 123, title: "Undercover High",                    genre: "comedy",     cover: "🕵️", views: "3.5K",  rating: 4.3,  mood: ["funny","school"],             bg: "#FEF3DC", desc: "Season 2 — now she's undercover at the rival school.",                                    type: "comic",  updated: true,  day: "Mon" },
  { id: 124, title: "Sky Pirates",                        genre: "adventure",  cover: "🏴‍☠️",views: "3.2K",  rating: 4.3,  mood: ["action","fun"],               bg: "#E8F5FD", desc: "The sky belongs to no one. They intend to own it anyway.",                               type: "comic",  updated: false, day: "Tue" },
  { id: 125, title: "The Last Duel of Master Hwan",       genre: "romance",    cover: "🥋", views: "34.7K", rating: 4.2,  mood: ["historical","rivals"],        bg: "#F6F0E8", desc: "She challenged the undefeated master to a duel. He fell first.",                         type: "novel",  updated: true,  day: "Wed" },
  { id: 126, title: "CEO's Secret Vows",                  genre: "drama",      cover: "💍", views: "28.5K", rating: 4.2,  mood: ["angst","contract marriage"],  bg: "#FDE8F0", desc: "The wedding was fake. The feelings were not.",                                             type: "comic",  updated: true,  day: "Thu" },
  { id: 127, title: "Brushstrokes of the Departed",       genre: "comedy",     cover: "🎨", views: "9.5K",  rating: 4.2,  mood: ["quirky","supernatural"],      bg: "#E8F0FD", desc: "Spin-off: the comedic side of seeing death in art.",                                       type: "comic",  updated: false, day: "Fri" },
  { id: 128, title: "Galactic Bounty",                    genre: "scifi",      cover: "🚀", views: "2.8K",  rating: 4.2,  mood: ["action","space"],             bg: "#1A1A2E", desc: "The galaxy's most wanted. She's the bounty hunter who keeps letting them go.",           type: "comic",  updated: true,  day: "Sat", textLight: true },
  { id: 129, title: "Neon Nights",                        genre: "scifi",      cover: "🌃", views: "4.4K",  rating: 4.0,  mood: ["cyberpunk","action"],         bg: "#1A1A2E", desc: "Season 2 — the neon fades. The real city emerges.",                                       type: "comic",  updated: true,  day: "Sun", textLight: true },
  { id: 130, title: "Eternal Blade",                      genre: "action",     cover: "🗡️", views: "3.3K",  rating: 3.9,  mood: ["action","dark"],              bg: "#F6F0E8", desc: "The blade remembers every soul it has taken. So does she.",                               type: "comic",  updated: false, day: "Mon" },
  { id: 131, title: "Galactic Bounty",                    genre: "scifi",      cover: "🚀", views: "3.2K",  rating: 3.9,  mood: ["space","adventure"],          bg: "#1A1A2E", desc: "Season 3 — the bounty hunter becomes the hunted.",                                        type: "comic",  updated: true,  day: "Tue", textLight: true },
  { id: 132, title: "Shadow of the Dragon",               genre: "fantasy",    cover: "🐉", views: "3.1K",  rating: 3.9,  mood: ["dark","epic"],                bg: "#EDE8FA", desc: "Arc 2 — the dragon speaks. The world trembles.",                                          type: "comic",  updated: false, day: "Wed" },
  { id: 133, title: "Whispers of the Heart",              genre: "romance",    cover: "💌", views: "2.1K",  rating: 3.6,  mood: ["bittersweet","letters"],      bg: "#FDE8F0", desc: "The letters stopped. The feelings didn't.",                                                type: "novel",  updated: true,  day: "Thu" },
  { id: 134, title: "The Last Alchemist",                 genre: "action",     cover: "⚗️", views: "4.2K",  rating: 3.3,  mood: ["mystery","dark"],             bg: "#FDF3E0", desc: "Book 2 — the conspiracy runs deeper than any formula.",                                    type: "comic",  updated: false, day: "Fri" },
  { id: 135, title: "Haunted Manor",                      genre: "horror",     cover: "👻", views: "4.1K",  rating: 3.1,  mood: ["horror","atmospheric"],       bg: "#1F2430", desc: "Season 2 — the 13th room finally opens.",                                                 type: "comic",  updated: true,  day: "Sat", textLight: true },
  { id: 136, title: "Ocean's Secret",                     genre: "mystery",    cover: "🌊", views: "2.0K",  rating: 3.0,  mood: ["mystery","sad"],              bg: "#E8F0FD", desc: "The truth was in the water all along.",                                                    type: "comic",  updated: false, day: "Sun" },
  { id: 137, title: "Sky Pirates",                        genre: "adventure",  cover: "🏴‍☠️",views: "21",    rating: 3.0,  mood: ["fun","pilot"],                bg: "#E8F5FD", desc: "Season 3 — the crew is scattered. The sky still calls.",                                  type: "comic",  updated: true,  day: "Mon" },
  // From homepage
  { id: 1,   title: "Crimson Throne",                     genre: "romance",    cover: "💖", views: "28.8M", rating: 4.9,  mood: ["slow burn","royalty"],        bg: "#FDE8F0", desc: "She escaped a kingdom that wanted her dead. He's the king who never forgot her face.",    type: "comic",  updated: true,  day: "Mon" },
  { id: 2,   title: "The Shadow Pact",                    genre: "fantasy",    cover: "🌙", views: "9.8M",  rating: 4.8,  mood: ["dark","magic"],               bg: "#EDE8FA", desc: "Two enemies bound by a curse. One impossible choice.",                                    type: "comic",  updated: true,  day: "Mon" },
  { id: 7,   title: "Villain's Beloved",                  genre: "romance",    cover: "🌹", views: "10.1M", rating: 4.8,  mood: ["dark romance","redemption"],  bg: "#FDE8F0", desc: "I romanced the villain once. Now he's real, and he remembers.",                         type: "comic",  updated: true,  day: "Thu" },
  { id: 10,  title: "Blood & Blossom",                    genre: "supernatural",cover: "🌺",views: "5.6M",  rating: 4.8,  mood: ["dark","romance"],             bg: "#FDE8F0", desc: "A demon who falls in love smells like cherry blossoms and regret.",                      type: "comic",  updated: true,  day: "Fri" },
  { id: 5,   title: "Duchess Reborn",                     genre: "romance",    cover: "👑", views: "2M",    rating: 4.9,  mood: ["royalty","revenge"],          bg: "#F0FDE8", desc: "She died once. This time, she rewrites the ending.",                                      type: "comic",  updated: false, day: "Wed" },
  { id: 12,  title: "Last Frequency",                     genre: "bl",         cover: "📻", views: "1.9M",  rating: 4.9,  mood: ["soft","slow burn"],           bg: "#EDE8FA", desc: "They met on a radio station no one listened to. Then everyone did.",                      type: "novel",  updated: true,  day: "Sat" },
];

const SORT_OPTIONS = [
  { id: "popular", label: "Popular",   icon: "🔥" },
  { id: "new",     label: "Newest",    icon: "✨" },
  { id: "rating",  label: "Top Rated", icon: "⭐" },
  { id: "views",   label: "Most Read", icon: "👁" },
];

const TYPE_FILTERS = [
  { id: "all",   label: "All" },
  { id: "comic", label: "Comics" },
  { id: "novel", label: "Novels" },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function parseViews(v) {
  if (!v) return 0;
  const s = String(v).replace(/,/g, "");
  if (s.endsWith("M")) return parseFloat(s) * 1_000_000;
  if (s.endsWith("K")) return parseFloat(s) * 1_000;
  return parseFloat(s) || 0;
}

function StarRating({ rating }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
      {[...Array(5)].map((_, i) => (
        <span key={i} style={{
          fontSize: 11,
          color: i < full ? C.gold : (i === full && half) ? C.gold : C.border,
        }}>
          {i < full ? "★" : (i === full && half) ? "⯨" : "☆"}
        </span>
      ))}
    </span>
  );
}

const DEFAULT_COVER = "/covers/fantasy_cover_1777743338844.png";

// ── Story card for browse grid ─────────────────────────────────────────────
function BrowseCard({ story, view = "grid", index }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  if (view === "list") {
    return (
      <div
        onClick={() => navigate(`/story/${story.id}`)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex", alignItems: "center", gap: 16,
          background: hovered ? C.plumLight + "50" : C.card,
          border: `1px solid ${hovered ? C.plum + "40" : C.border}`,
          borderRadius: 14, padding: "14px 18px", cursor: "pointer",
          transition: "all 0.2s",
          animation: `fadeSlideIn 0.4s ease both`,
          animationDelay: `${Math.min(index * 0.04, 0.6)}s`,
        }}
      >
        <div style={{
          width: 54, height: 68, borderRadius: 10, flexShrink: 0,
          background: story.bg || C.plumLight,
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}>
          <StoryImage 
            src={story.cover} 
            alt={story.title}
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: C.rose, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {story.genre}
            </span>
            {story.type === "novel" && (
              <span style={{ fontSize: 9, fontWeight: 600, background: C.goldLight, color: C.gold, padding: "1px 6px", borderRadius: 6 }}>NOVEL</span>
            )}
            {story.updated && (
              <span style={{ fontSize: 9, fontWeight: 700, background: C.rose, color: "white", padding: "1px 6px", borderRadius: 6 }}>NEW EP</span>
            )}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {story.title}
          </div>
          <div style={{ fontSize: 12, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 420 }}>
            {story.desc}
          </div>
          {story.mood && (
            <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
              {story.mood.slice(0, 3).map(m => (
                <span key={m} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: C.plumLight, color: C.plum, fontWeight: 500 }}>
                  {m}
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <StarRating rating={story.rating} />
            <span style={{ fontSize: 12, fontWeight: 700, color: C.gold }}>{story.rating.toFixed(1)}</span>
          </div>
          <span style={{ fontSize: 12, color: C.mutedLight }}>👁 {story.views}</span>
          <button
            onClick={e => { e.stopPropagation(); setBookmarked(!bookmarked); }}
            style={{
              background: bookmarked ? C.plum : "transparent",
              border: `1.5px solid ${bookmarked ? C.plum : C.border}`,
              borderRadius: 8, width: 30, height: 30,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 13, transition: "all 0.2s",
              color: bookmarked ? "white" : C.muted,
            }}
          >🔖</button>
        </div>
      </div>
    );
  }

  // Grid card
  return (
    <div
      onClick={() => navigate(`/story/${story.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.card,
        borderRadius: 18,
        border: `1px solid ${hovered ? C.plum + "40" : C.border}`,
        overflow: "hidden", cursor: "pointer",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered ? "0 12px 32px rgba(109,74,232,0.15)" : "0 2px 8px rgba(0,0,0,0.04)",
        transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        animation: `fadeSlideIn 0.45s ease both`,
        animationDelay: `${Math.min(index * 0.05, 0.8)}s`,
      }}
    >
      <div style={{
        height: 200, background: story.bg || C.plumLight,
        fontSize: 56, position: "relative",
        overflow: "hidden"
      }}>
        <StoryImage 
          src={story.cover} 
          alt={story.title}
          style={{ 
            width: "100%", height: "100%", 
            filter: hovered ? "brightness(1.1)" : "none", 
            transition: "filter 0.3s, transform 0.3s", 
            transform: hovered ? "scale(1.05)" : "scale(1)" 
          }}
        />
        {story.updated && (
          <span style={{
            position: "absolute", top: 10, left: 10,
            background: C.rose, color: "white",
            fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 8, letterSpacing: 0.5,
          }}>NEW EP</span>
        )}
        {story.type === "novel" && (
          <span style={{
            position: "absolute", top: 10, right: 10,
            background: C.gold, color: "white",
            fontSize: 9, fontWeight: 700, padding: "3px 7px", borderRadius: 8,
          }}>NOVEL</span>
        )}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 70,
          background: "linear-gradient(to top, rgba(31,36,48,0.55), transparent)",
        }} />
        <button
          onClick={e => { e.stopPropagation(); setBookmarked(!bookmarked); }}
          style={{
            position: "absolute", bottom: 10, right: 10,
            background: bookmarked ? C.plum : "rgba(255,255,255,0.9)",
            border: "none", borderRadius: 8, width: 30, height: 30,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: 13,
            color: bookmarked ? "white" : C.ink, transition: "all 0.2s",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >{bookmarked ? "🔖" : "🔖"}</button>
      </div>
      <div style={{ padding: "13px 14px 14px" }}>
        <div style={{ fontSize: 10, color: C.rose, fontWeight: 700, marginBottom: 4, letterSpacing: 0.5, textTransform: "uppercase" }}>{story.genre}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 5, lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {story.title}
        </div>
        <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", marginBottom: 8 }}>
          {story.desc}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <StarRating rating={story.rating} />
            <span style={{ fontSize: 11, fontWeight: 700, color: C.gold }}>{story.rating.toFixed(1)}</span>
          </div>
          <span style={{ fontSize: 11, color: C.mutedLight }}>👁 {story.views}</span>
        </div>
        {story.mood && (
          <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
            {story.mood.slice(0, 2).map(m => (
              <span key={m} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: C.plumLight, color: C.plum, fontWeight: 500 }}>
                {m}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Browse Page ───────────────────────────────────────────────────────
export default function ToonVaultBrowse() {
  const [stories, setStories] = useState([]);
  const [activeGenre, setActiveGenre] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchVal, setSearchVal] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [searchOpen, setSearchOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [ratingMin, setRatingMin] = useState(0);
  const [updatedOnly, setUpdatedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const PER_PAGE = 24;

  useEffect(() => {
    axios.get('/api/stories')
      .then(res => {
        if (Array.isArray(res.data)) {
          const mapped = res.data.map(s => {
            let cover = s.coverIcon || "📖";
            if (s.panels && s.panels.length > 0) {
              cover = s.panels[0];
            } else if (cover === "✨" || cover === "📖") {
              const genre = String(s.genre || "").toLowerCase();
              if (genre.includes("romance")) cover = "/covers/romance_cover_1777743324375.png";
              else if (genre.includes("fantasy")) cover = "/covers/fantasy_cover_1777743338844.png";
              else if (genre.includes("action")) cover = "/covers/action_cover_1777743352958.png";
              else if (genre.includes("drama")) cover = "/covers/drama_cover_1777743372879.png";
              else if (genre.includes("horror")) cover = "/covers/horror_cover_1777743387658.png";
              else cover = DEFAULT_COVER;
            }

            return {
              ...s,
              id: s._id,
              cover: cover,
              bg: "linear-gradient(135deg, #121315 0%, #1A1B1E 100%)",
              mood: s.genre ? [s.genre.toLowerCase()] : ["fantasy"],
              day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][Math.floor(Math.random() * 7)],
              updated: true,
              type: s.type || "comic",
              rating: s.rating || 4.9,
              views: s.views > 1000 ? (s.views / 1000).toFixed(1) + "K" : (s.views || "1.2K")
            };
          });
          setStories(mapped);
        }
      })
      .catch(err => console.error("Error fetching stories:", err));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const genreParam = params.get('genre');
    if (genreParam) {
      const g = GENRES.find(item => item.label.toLowerCase() === genreParam.toLowerCase() || item.id === genreParam.toLowerCase());
      if (g) setActiveGenre(g.id);
    }
  }, [location]);

  // Filter + sort
  const filtered = stories.filter(s => {
    if (activeGenre !== "all" && s.genre !== activeGenre) return false;
    if (typeFilter !== "all" && s.type !== typeFilter) return false;
    if (updatedOnly && !s.updated) return false;
    if (s.rating < ratingMin) return false;
    if (searchVal && !s.title.toLowerCase().includes(searchVal.toLowerCase()) && !s.genre.toLowerCase().includes(searchVal.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "popular") return parseViews(b.views) - parseViews(a.views);
    if (sortBy === "new") return b.id - a.id;
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "views") return parseViews(b.views) - parseViews(a.views);
    return 0;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice(0, page * PER_PAGE);

  useEffect(() => { setPage(1); }, [activeGenre, sortBy, typeFilter, searchVal, ratingMin, updatedOnly]);

  const genreLabel = GENRES.find(g => g.id === activeGenre)?.label || "All";

  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", background: C.bg, minHeight: "100vh", color: C.ink }}>
      <Helmet><title>Browse - ToonVault</title></Helmet>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 6px; }
        input:focus { outline: none; }
        button:focus { outline: none; }
        @media (max-width: 1000px) {
          .desktop-only { display: none !important; }
          .search-container { width: 100% !important; max-width: 160px !important; }
        }
        @media (min-width: 1001px) {
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
        background: C.bg, // Solid background
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 28px", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Logo + breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <div onClick={() => navigate('/')} style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, ${C.plum}, ${C.rose})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📖</div>
              <span style={{ fontSize: 20, fontWeight: 800, color: C.plum, letterSpacing: -0.5, fontFamily: "Georgia, serif" }}>Toon<span style={{ color: C.rose }}>Vault</span></span>
            </div>
            <div className="desktop-only" style={{ display: "flex", alignItems: "center", gap: 6, color: C.mutedLight }}>
              <span style={{ fontSize: 18 }}>›</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>Browse</span>
              {activeGenre !== "all" && <>
                <span style={{ fontSize: 18 }}>›</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.plum }}>{genreLabel}</span>
              </>}
            </div>
          </div>

          {/* Nav links */}
          <div className="desktop-only" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {["Originals", "Rankings", "Canvas", "Browse", "Pricing"].map(item => (
              <button key={item} onClick={() => {
                if (item === "Browse") navigate('/browse');
                else navigate(`/#${item.toLowerCase().replace(' ', '-')}`);
              }} style={{
                padding: "7px 12px", border: "none", background: "none",
                fontSize: 13, fontWeight: 600, color: item === "Browse" ? C.plum : C.ink, 
                cursor: "pointer",
                borderRadius: 8, transition: "all 0.18s", fontFamily: "inherit",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = C.plumLight; e.currentTarget.style.color = C.plum; }}
                onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = item === "Browse" ? C.plum : C.ink; }}
              >{item}</button>
            ))}
          </div>

          {/* Search + auth */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 1, justifyContent: "flex-end", minWidth: 0 }}>
            <div style={{ position: "relative", minWidth: 0 }}>
              {searchOpen ? (
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input
                    autoFocus
                    value={searchVal}
                    onChange={e => setSearchVal(e.target.value)}
                    onBlur={() => { if (!searchVal) setSearchOpen(false); }}
                    placeholder="Search..."
                    className="search-container"
                    style={{
                      padding: "8px 12px", borderRadius: 20, border: `2px solid ${C.plum}`,
                      background: C.card, fontSize: 13, color: C.ink, width: 200,
                      fontFamily: "inherit", transition: "all 0.3s",
                    }}
                  />
                  {searchVal && (
                    <button onClick={() => setSearchVal("")} style={{
                      position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer", color: C.mutedLight, fontSize: 14,
                    }}>×</button>
                  )}
                </div>
              ) : (
                <button onClick={() => setSearchOpen(true)} style={{
                  padding: "8px 12px", border: `1px solid ${C.border}`, background: C.card,
                  borderRadius: 20, fontSize: 13, color: C.muted, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s"
                }}>
                  🔍 <span className="desktop-only" style={{ fontWeight: 500 }}>Search...</span>
                </button>
              )}
            </div>

            <button className="desktop-only" onClick={() => navigate('/user')} style={{
              padding: "8px 18px", border: `1.5px solid ${C.plum}`, background: "transparent",
              borderRadius: 22, fontSize: 13, fontWeight: 600, color: C.plum, cursor: "pointer", fontFamily: "inherit",
              whiteSpace: "nowrap"
            }}>Sign In</button>
            <button className="desktop-only" onClick={() => navigate('/dashboard')} style={{
              padding: "8px 20px", border: "none",
              background: `linear-gradient(135deg, ${C.plum}, ${C.plumDark})`,
              borderRadius: 22, fontSize: 13, fontWeight: 600, color: "white",
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 2px 10px rgba(109,74,232,0.3)",
              whiteSpace: "nowrap"
            }}>✏️ Publish</button>

            <div className="mobile-only">
              <button onClick={() => setMobileMenuOpen(true)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.ink }}>☰</button>
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
                <span style={{ fontWeight: 800, fontSize: 18, color: C.plum, fontFamily: "Georgia, serif" }}>ToonVault</span>
                <button onClick={() => setMobileMenuOpen(false)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer" }}>×</button>
              </div>
              {["Originals", "Rankings", "Canvas", "Browse", "Pricing"].map(item => (
                <div key={item} onClick={() => { 
                  if (item === "Browse") navigate('/browse');
                  else navigate(`/#${item.toLowerCase().replace(' ', '-')}`);
                  setMobileMenuOpen(false); 
                }} style={{
                  padding: "12px 16px", borderRadius: 12, fontSize: 16, fontWeight: 500, color: C.ink,
                  cursor: "pointer", borderBottom: `1px solid ${C.border}`
                }}>{item}</div>
              ))}
              <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
                <button onClick={() => { navigate('/user'); setMobileMenuOpen(false); }} style={{
                  padding: "14px", border: `1.5px solid ${C.plum}`,
                  background: "transparent", borderRadius: 12, fontSize: 14,
                  fontWeight: 600, color: C.plum, cursor: "pointer",
                }}>Sign In</button>
                <button onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }} style={{
                  padding: "14px", border: "none",
                  background: `linear-gradient(135deg, ${C.plum}, ${C.plumDark})`,
                  borderRadius: 12, fontSize: 14, fontWeight: 600, color: "white",
                  cursor: "pointer"
                }}>✏️ Start Publishing</button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 28px" }}>

        {/* ═══ PAGE HERO BANNER ═══ */}
        <div style={{
          margin: "28px 0 0",
          borderRadius: 24,
          background: `linear-gradient(135deg, ${C.plumDark} 0%, ${C.plum} 50%, ${C.rose} 100%)`,
          padding: "36px 48px",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", right: -20, top: -60, width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
          <div style={{ position: "absolute", right: 120, bottom: -80, width: 320, height: 320, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>📚 Explore</div>
            <h1 style={{ fontSize: 34, fontWeight: 800, color: "white", margin: "0 0 8px", letterSpacing: -0.5, lineHeight: 1.1, fontFamily: "Georgia, serif" }}>
              Browse All Stories
            </h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", margin: 0 }}>
              {filtered.length} stories across {GENRES.length - 1} genres — your next obsession is in here
            </p>
          </div>
          <div style={{ position: "absolute", right: 50, top: "50%", transform: "translateY(-50%)", fontSize: 72, opacity: 0.25, userSelect: "none" }}>
            📖
          </div>
        </div>

        {/* ═══ GENRE PILL STRIP ═══ */}
        <div style={{ margin: "20px 0 0", position: "relative" }}>
          <div style={{
            display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4,
            scrollbarWidth: "none", msOverflowStyle: "none",
          }}>
            {GENRES.map(g => (
              <button
                key={g.id}
                onClick={() => setActiveGenre(g.id)}
                style={{
                  flexShrink: 0,
                  padding: "7px 16px", borderRadius: 22,
                  background: activeGenre === g.id
                    ? `linear-gradient(135deg, ${C.plum}, ${C.plumDark})`
                    : C.card,
                  color: activeGenre === g.id ? "white" : C.muted,
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  whiteSpace: "nowrap", transition: "all 0.2s",
                  border: activeGenre === g.id ? "none" : `1px solid ${C.border}`,
                  boxShadow: activeGenre === g.id ? "0 2px 10px rgba(109,74,232,0.3)" : "none",
                  fontFamily: "inherit",
                }}
              >
                {g.emoji} {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* ═══ CONTROLS BAR ═══ */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12, margin: "20px 0",
          padding: "16px 20px",
          background: C.card, borderRadius: 16, border: `1px solid ${C.border}`,
        }}>

          {/* Left: count + type filter */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>
              {filtered.length} <span style={{ color: C.muted, fontWeight: 400 }}>stories found</span>
            </span>
            <div style={{ width: 1, height: 20, background: C.border }} />
            <div style={{ display: "flex", gap: 4, background: C.bg, borderRadius: 12, padding: 4 }}>
              {TYPE_FILTERS.map(t => (
                <button key={t.id} onClick={() => setTypeFilter(t.id)} style={{
                  padding: "5px 14px", borderRadius: 9,
                  background: typeFilter === t.id ? C.plum : "transparent",
                  color: typeFilter === t.id ? "white" : C.muted,
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  border: "none", transition: "all 0.2s", fontFamily: "inherit",
                }}>{t.label}</button>
              ))}
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: 13, color: C.muted, userSelect: "none" }}>
              <div
                onClick={() => setUpdatedOnly(!updatedOnly)}
                style={{
                  width: 36, height: 20, borderRadius: 10,
                  background: updatedOnly ? C.plum : C.border,
                  position: "relative", cursor: "pointer", transition: "background 0.2s",
                }}
              >
                <div style={{
                  width: 14, height: 14, borderRadius: "50%", background: "white",
                  position: "absolute", top: 3, left: updatedOnly ? 19 : 3,
                  transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }} />
              </div>
              New episodes only
            </label>
          </div>

          {/* Right: sort + view toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Sort */}
            <div style={{ display: "flex", gap: 4, background: C.bg, borderRadius: 12, padding: 4 }}>
              {SORT_OPTIONS.map(s => (
                <button key={s.id} onClick={() => setSortBy(s.id)} style={{
                  padding: "5px 12px", borderRadius: 9,
                  background: sortBy === s.id ? C.plum : "transparent",
                  color: sortBy === s.id ? "white" : C.muted,
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  border: "none", transition: "all 0.2s", fontFamily: "inherit",
                  display: "flex", alignItems: "center", gap: 4,
                }}>{s.icon} {s.label}</button>
              ))}
            </div>

            <div style={{ width: 1, height: 20, background: C.border }} />

            {/* View mode */}
            <div style={{ display: "flex", gap: 3 }}>
              {[{ id: "grid", icon: "⊞" }, { id: "list", icon: "☰" }].map(v => (
                <button key={v.id} onClick={() => setViewMode(v.id)} style={{
                  width: 34, height: 34, borderRadius: 9,
                  background: viewMode === v.id ? C.plum : "transparent",
                  color: viewMode === v.id ? "white" : C.muted,
                  border: viewMode === v.id ? "none" : `1px solid ${C.border}`,
                  fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.18s",
                }}>{v.icon}</button>
              ))}
            </div>

            {/* Advanced filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 10,
                background: showFilters ? C.plumLight : "transparent",
                border: `1px solid ${showFilters ? C.plum + "60" : C.border}`,
                color: showFilters ? C.plum : C.muted,
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                transition: "all 0.2s", fontFamily: "inherit",
              }}
            >
              🎛 Filters {showFilters ? "▲" : "▼"}
            </button>
          </div>
        </div>

        {/* ═══ ADVANCED FILTERS PANEL ═══ */}
        {showFilters && (
          <div style={{
            background: C.card, borderRadius: 16, border: `1px solid ${C.border}`,
            padding: "20px 24px", marginBottom: 20,
            animation: "fadeSlideIn 0.3s ease both",
            display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap",
          }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>Minimum Rating</div>
              <div style={{ display: "flex", gap: 6 }}>
                {[0, 3, 4, 4.5].map(r => (
                  <button key={r} onClick={() => setRatingMin(r)} style={{
                    padding: "5px 12px", borderRadius: 10,
                    background: ratingMin === r ? C.gold : C.bg,
                    color: ratingMin === r ? "white" : C.muted,
                    border: `1px solid ${ratingMin === r ? C.gold : C.border}`,
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                    fontFamily: "inherit", transition: "all 0.18s",
                  }}>
                    {r === 0 ? "Any" : `⭐ ${r}+`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>Mood Tags</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["slow burn", "dark", "cozy", "funny", "royalty", "magic", "mystery", "enemies-to-lovers"].map(m => (
                  <span key={m} style={{
                    fontSize: 11, padding: "4px 10px", borderRadius: 10,
                    background: C.plumLight, color: C.plum, fontWeight: 500, cursor: "pointer",
                    border: `1px solid ${C.plum}20`, transition: "all 0.15s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = C.plum; e.currentTarget.style.color = "white"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = C.plumLight; e.currentTarget.style.color = C.plum; }}
                  >{m}</span>
                ))}
              </div>
            </div>

            <button onClick={() => { setRatingMin(0); setUpdatedOnly(false); setTypeFilter("all"); setActiveGenre("all"); setSortBy("popular"); }} style={{
              marginLeft: "auto", padding: "8px 18px", borderRadius: 10,
              background: "transparent", border: `1px solid ${C.rose}40`,
              color: C.rose, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}>
              ✕ Reset all filters
            </button>
          </div>
        )}

        {/* ═══ ACTIVE FILTER CHIPS ═══ */}
        {(activeGenre !== "all" || typeFilter !== "all" || updatedOnly || ratingMin > 0 || searchVal) && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Active:</span>
            {activeGenre !== "all" && (
              <span style={{ ...chipStyle, background: C.plumLight, color: C.plum }}>
                {GENRES.find(g => g.id === activeGenre)?.emoji} {genreLabel}
                <button onClick={() => setActiveGenre("all")} style={chipXStyle}>×</button>
              </span>
            )}
            {typeFilter !== "all" && (
              <span style={{ ...chipStyle, background: C.goldLight, color: C.gold }}>
                {typeFilter === "comic" ? "Comics" : "Novels"}
                <button onClick={() => setTypeFilter("all")} style={chipXStyle}>×</button>
              </span>
            )}
            {updatedOnly && (
              <span style={{ ...chipStyle, background: C.roseLight, color: C.rose }}>
                New episodes
                <button onClick={() => setUpdatedOnly(false)} style={chipXStyle}>×</button>
              </span>
            )}
            {ratingMin > 0 && (
              <span style={{ ...chipStyle, background: C.goldLight, color: C.gold }}>
                ⭐ {ratingMin}+
                <button onClick={() => setRatingMin(0)} style={chipXStyle}>×</button>
              </span>
            )}
            {searchVal && (
              <span style={{ ...chipStyle, background: C.plumLight, color: C.plum }}>
                🔍 "{searchVal}"
                <button onClick={() => setSearchVal("")} style={chipXStyle}>×</button>
              </span>
            )}
          </div>
        )}

        {/* ═══ STORY GRID / LIST ═══ */}
        {filtered.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "80px 0",
            animation: "fadeSlideIn 0.4s ease both",
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🌙</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.ink, marginBottom: 8 }}>No stories found</div>
            <div style={{ fontSize: 14, color: C.muted, marginBottom: 24 }}>Try adjusting your filters or searching something else</div>
            <button onClick={() => { setActiveGenre("all"); setTypeFilter("all"); setSearchVal(""); setRatingMin(0); setUpdatedOnly(false); }} style={{
              padding: "12px 28px", background: C.plum, color: "white",
              border: "none", borderRadius: 24, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}>Clear all filters</button>
          </div>
        ) : (
          <>
            <div style={viewMode === "grid" ? {
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
              gap: 18, marginBottom: 32,
            } : {
              display: "flex", flexDirection: "column", gap: 10, marginBottom: 32,
            }}>
              {paginated.map((story, i) => (
                <BrowseCard key={story.id} story={story} view={viewMode} index={i} />
              ))}
            </div>

            {/* Load more */}
            {page < totalPages && (
              <div style={{ textAlign: "center", paddingBottom: 48 }}>
                <button
                  onClick={() => setPage(p => p + 1)}
                  style={{
                    padding: "14px 44px",
                    background: `linear-gradient(135deg, ${C.plum}, ${C.plumDark})`,
                    color: "white", border: "none", borderRadius: 28,
                    fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                    boxShadow: "0 4px 16px rgba(109,74,232,0.3)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(109,74,232,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(109,74,232,0.3)"; }}
                >
                  Load more stories ↓
                </button>
                <div style={{ fontSize: 13, color: C.mutedLight, marginTop: 10 }}>
                  Showing {paginated.length} of {filtered.length}
                </div>
              </div>
            )}

            {page >= totalPages && filtered.length > 0 && (
              <div style={{ textAlign: "center", paddingBottom: 48, color: C.mutedLight, fontSize: 13 }}>
                ✓ You've seen all {filtered.length} stories
              </div>
            )}
          </>
        )}
      </div>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ background: C.ink, color: "rgba(255,255,255,0.55)", padding: "36px 28px 24px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
            <div onClick={() => navigate('/')} style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${C.plum}, ${C.rose})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📖</div>
              <span style={{ fontSize: 18, fontWeight: 800, color: "white", fontFamily: "Georgia, serif" }}>ToonVault</span>
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              {["Browse", "About", "Help Center", "Community", "Terms", "Privacy"].map(l => {
                const map = { "Browse": "/browse", "About": "/about", "Help Center": "/help", "Community": "/community", "Terms": "/terms", "Privacy": "/privacy" };
                return (
                  <span key={l} 
                    onClick={() => navigate(map[l])}
                    style={{ fontSize: 13, cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.color = "white"}
                    onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.55)"}
                  >{l}</span>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 14 }}>
              {["Discord", "Instagram", "Twitter", "YouTube"].map(s => (
                <span key={s} style={{ fontSize: 13, cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.color = "white"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.55)"}
                >{s}</span>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16, fontSize: 12, textAlign: "center" }}>
            © 2026 ToonVault AI. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Shared micro-styles ────────────────────────────────────────────────────
const chipStyle = {
  display: "inline-flex", alignItems: "center", gap: 6,
  fontSize: 12, fontWeight: 600, padding: "4px 10px 4px 12px",
  borderRadius: 14, userSelect: "none",
};
const chipXStyle = {
  background: "none", border: "none", cursor: "pointer",
  fontSize: 15, lineHeight: 1, color: "inherit", padding: 0, opacity: 0.7,
  fontFamily: "inherit",
};