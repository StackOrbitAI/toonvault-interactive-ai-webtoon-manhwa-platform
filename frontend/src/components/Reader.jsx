import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Share2, Heart, Star, Play, List, Info, Clock, Bookmark } from 'lucide-react';
import axios from 'axios';

const COLORS = {
  bg: "#08090A",
  panel: "#121315",
  accent: "#8B5CF6",
  rose: "#F472B6",
  text: "#FFFFFF",
  textMuted: "#9CA3AF",
  border: "rgba(255,255,255,0.1)",
};

function SeriesPage() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const res = await axios.get(`/api/stories/${storyId}`);
        setStory(res.data);
      } catch (err) {
        // Mock data for demo if not found
        setStory({
          _id: storyId,
          title: "High Society (AI Edition)",
          description: "In a world of glittering ballrooms and whispered secrets, a young woman must navigate the treacherous waters of the elite. But when a mysterious stranger enters her life, everything she thought she knew is challenged. Will she choose duty or her heart?",
          genre: "Romance Fantasy",
          authorName: "ToonVault AI",
          views: 1250000,
          likes: 45000,
          rating: 4.9,
          status: "Live",
          panels: [
            "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000",
            "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000",
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStory();
    window.scrollTo(0, 0);
  }, [storyId]);

  if (loading) return <div style={{ background: COLORS.bg, height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.accent }}>Loading...</div>;

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.text, fontFamily: "'Inter', sans-serif" }}>
      {/* ═══ HERO SECTION ═══ */}
      <div style={{ position: "relative", height: "60vh", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${story.panels?.[0] || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23'})`,
          backgroundSize: "cover", backgroundPosition: "center",
          filter: "brightness(0.6) blur(2px)",
          transform: "scale(1.1)"
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, #08090A 0%, transparent 100%)",
        }} />
        
        {/* Top Floating Nav */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "20px 24px", display: "flex", justifyContent: "space-between", zIndex: 10 }}>
          <button onClick={() => navigate(-1)} style={{ background: "rgba(0,0,0,0.5)", border: "none", color: "white", padding: 10, borderRadius: "50%", cursor: "pointer", backdropFilter: "blur(10px)" }}>
            <ChevronLeft size={24} />
          </button>
          <div style={{ display: "flex", gap: 12 }}>
            <button style={{ background: "rgba(0,0,0,0.5)", border: "none", color: "white", padding: 10, borderRadius: "50%", cursor: "pointer", backdropFilter: "blur(10px)" }}>
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* Story Title & Stats Overlay */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 24px 40px", textAlign: "center" }}>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: 42, fontWeight: 900, marginBottom: 12, letterSpacing: -1 }}
          >
            {story.title}
          </motion.h1>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, fontSize: 14, color: COLORS.textMuted }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}><Star size={16} fill="#FFD700" color="#FFD700" /> 4.9</div>
            <div style={{ width: 1, height: 12, background: COLORS.border }} />
            <div>{story.genre}</div>
            <div style={{ width: 1, height: 12, background: COLORS.border }} />
            <div style={{ color: COLORS.rose }}>UP Every Mon</div>
          </div>
        </div>
      </div>

      {/* ═══ ACTIONS & INFO ═══ */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", gap: 12, marginTop: -20, position: "relative", zIndex: 20, justifyContent: "center" }}>
          <button 
            onClick={() => navigate(`/manta/${story._id}`)}
            style={{ 
              flex: 1, maxWidth: 300, padding: "18px", borderRadius: 16, 
              background: COLORS.text, color: COLORS.bg, border: "none",
              fontSize: 16, fontWeight: 800, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              boxShadow: "0 10px 20px rgba(0,0,0,0.3)"
            }}
          >
            <Play size={20} fill="currentColor" /> Read First Episode
          </button>
          <button 
            onClick={() => setIsFavorite(!isFavorite)}
            style={{ 
              padding: "18px", borderRadius: 16, background: "rgba(255,255,255,0.1)", 
              color: isFavorite ? COLORS.rose : "white", border: "1px solid rgba(255,255,255,0.1)",
              cursor: "pointer", backdropFilter: "blur(10px)"
            }}
          >
            <Bookmark size={24} fill={isFavorite ? COLORS.rose : "none"} />
          </button>
        </div>

        {/* Synopsis */}
        <section style={{ marginTop: 60 }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Synopsis</h3>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: COLORS.textMuted, maxWidth: 700 }}>
            {story.description}
          </p>
          <div style={{ display: "flex", gap: 20, marginTop: 30 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{(story.views / 1000000).toFixed(1)}M</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", marginTop: 4 }}>Views</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{(story.likes / 1000).toFixed(1)}K</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", marginTop: 4 }}>Likes</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>#1</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", marginTop: 4 }}>In {story.genre}</div>
            </div>
          </div>
        </section>

        {/* Episodes */}
        <section style={{ marginTop: 60, paddingBottom: 100 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h3 style={{ fontSize: 20, fontWeight: 800 }}>Episodes</h3>
            <span style={{ fontSize: 13, color: COLORS.textMuted }}>Total 1 episode</span>
          </div>

          <div 
            onClick={() => navigate(`/manta/${story._id}`)}
            style={{ 
              display: "flex", gap: 16, padding: 16, borderRadius: 16, 
              background: COLORS.panel, border: "1px solid rgba(255,255,255,0.05)",
              cursor: "pointer", transition: "all 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
            onMouseLeave={e => e.currentTarget.style.background = COLORS.panel}
          >
            <div style={{ 
              width: 120, height: 80, borderRadius: 8, overflow: "hidden", 
              backgroundImage: `url(${story.panels?.[1] || story.panels?.[0]})`,
              backgroundSize: "cover", backgroundPosition: "center", flexShrink: 0
            }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Episode 1</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, display: "flex", alignItems: "center", gap: 10 }}>
                <span>Free</span>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: COLORS.textMuted }} />
                <span>2026.04.29</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Play size={20} color={COLORS.textMuted} />
            </div>
          </div>
          
          <div style={{ marginTop: 24, textAlign: "center", padding: "40px", border: `1px dashed ${COLORS.border}`, borderRadius: 16 }}>
             <Clock size={32} color={COLORS.textMuted} style={{ marginBottom: 12 }} />
             <div style={{ fontSize: 14, color: COLORS.textMuted }}>New episodes arriving soon! Stay tuned.</div>
          </div>
        </section>
      </div>

      {/* ═══ STICKY BOTTOM BUTTON ═══ */}
      <div style={{ 
        position: "fixed", bottom: 0, left: 0, right: 0, padding: "20px 24px",
        background: "rgba(8, 9, 10, 0.9)", backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.1)", zIndex: 100
      }}>
        <button 
          onClick={() => navigate(`/manta/${story._id}`)}
          style={{ 
            width: "100%", maxWidth: 600, margin: "0 auto", padding: "16px",
            borderRadius: 12, background: COLORS.accent, color: "white", border: "none",
            fontSize: 16, fontWeight: 800, cursor: "pointer", display: "block"
          }}
        >
          Read Episode 1
        </button>
      </div>
    </div>
  );
}
export default SeriesPage;
