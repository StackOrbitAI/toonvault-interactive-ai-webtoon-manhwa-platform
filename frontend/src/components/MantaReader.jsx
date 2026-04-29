import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ChevronLeft, Share2, Heart, MessageSquare, BookOpen, Star, MoreVertical } from 'lucide-react';
import axios from 'axios';

const COLORS = {
  bg: "#08090A",
  panel: "#121315",
  accent: "#8B5CF6",
  rose: "#F472B6",
  text: "#FFFFFF",
  textMuted: "#9CA3AF",
};

export default function MantaReader() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const scrollRef = useRef(null);
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const res = await axios.get(`/api/stories/${storyId}`);
        setStory(res.data);
      } catch (err) {
        // Fallback for demo
        setStory({
          title: "Under the Oak Tree (AI Reimagined)",
          authorName: "ToonVault AI",
          panels: [
            "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000",
            "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000",
            "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000",
            "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1000",
          ],
          description: "A beautiful AI-generated story in the style of Manta."
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStory();
    window.scrollTo(0, 0);
  }, [storyId]);

  if (loading) {
    return (
      <div style={{ background: COLORS.bg, height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.accent }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <BookOpen size={48} />
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.text, fontFamily: "'Inter', sans-serif" }}>
      {/* ═══ SITE HEADER ═══ */}
      <header style={{ 
        position: "sticky", top: 0, left: 0, right: 0, zIndex: 1100,
        height: 64, background: "rgba(8, 9, 10, 0.95)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate('/')}>
          <div style={{ 
            width: 32, height: 32, borderRadius: 10, 
            background: "linear-gradient(135deg, #8B5CF6, #F472B6)", 
            display: "flex", alignItems: "center", justifyContent: "center", 
            fontSize: 16, boxShadow: "0 0 16px rgba(139,92,246,0.3)" 
          }}>📖</div>
          <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.5 }}>
            <span style={{ color: "#A78BFA" }}>Toon</span><span style={{ color: "#F472B6" }}>Vault</span>
          </span>
        </div>

        <div style={{ display: "flex", gap: 24 }}>
          {["Home", "Explore", "Dashboard"].map(item => (
            <button 
              key={item} 
              onClick={() => navigate(item === "Home" ? "/" : `/${item.toLowerCase()}`)}
              style={{ background: "none", border: "none", color: COLORS.textMuted, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "white"}
              onMouseLeave={e => e.currentTarget.style.color = COLORS.textMuted}
            >
              {item}
            </button>
          ))}
        </div>
      </header>

      {/* ═══ PROGRESS BAR ═══ */}
      <motion.div
        style={{
          position: "fixed", top: 64, left: 0, right: 0, height: 4,
          background: COLORS.accent, transformOrigin: "0%",
          zIndex: 1000, scaleX
        }}
      />

      {/* ═══ READER TOOLBAR ═══ */}
      <div style={{
        position: "sticky", top: 64, left: 0, right: 0, height: 44,
        background: "rgba(18, 19, 21, 0.8)", backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", zIndex: 900, borderBottom: "1px solid rgba(255,255,255,0.05)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <ChevronLeft size={18} />
          </button>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>{story.title}</div>
        </div>
        <div style={{ display: "flex", gap: 15 }}>
          <Share2 size={16} style={{ cursor: "pointer", color: COLORS.textMuted }} />
          <Heart size={16} onClick={() => setLiked(!liked)} style={{ cursor: "pointer", color: liked ? COLORS.rose : COLORS.textMuted }} fill={liked ? COLORS.rose : "none"} />
        </div>
      </div>

      {/* ═══ STORY CONTENT ═══ */}
      <main style={{ maxWidth: 800, margin: "0 auto", paddingTop: 60 }}>
        {/* Intro Cover */}
        <div style={{ padding: "40px 20px", textAlign: "center" }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 10 }}>{story.title}</h1>
          <p style={{ fontSize: 14, color: COLORS.textMuted, lineHeight: 1.6 }}>{story.description}</p>
        </div>

        {/* Vertical Panels */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {story.panels?.map((url, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              style={{ width: "100%", position: "relative" }}
            >
              <img
                src={url}
                alt={`Panel ${i + 1}`}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
              
              {/* Dialogue/Text Overlay (Improved) */}
              {story.content && (
                (() => {
                  try {
                    const contentArr = JSON.parse(story.content);
                    const panelData = contentArr[i];
                    if (panelData && panelData.text) {
                      return (
                        <div style={{
                          position: "absolute", bottom: "10%", left: "10%", right: "10%",
                          background: "rgba(0,0,0,0.75)", color: "white",
                          padding: "16px 24px", borderRadius: 16,
                          backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)",
                          fontSize: 16, fontWeight: 500, lineHeight: 1.6, textAlign: "center",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                          animation: "fadeIn 0.5s ease"
                        }}>
                          {panelData.text}
                        </div>
                      );
                    }
                  } catch(e) { return null; }
                })()
              )}
            </motion.div>
          ))}
        </div>

        {/* End of Episode */}
        <div style={{ padding: "80px 20px 120px", textAlign: "center", background: "linear-gradient(to bottom, #08090A, #1A1B1E)" }}>
          <div style={{ fontSize: 40, marginBottom: 20 }}>🌸</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>You've reached the end!</h3>
          <p style={{ color: COLORS.textMuted, marginBottom: 30 }}>Did you enjoy this AI-generated episode?</p>
          
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 40 }}>
            <button 
                onClick={() => setLiked(!liked)}
                style={{ 
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 8, 
                    background: "none", border: "none", color: liked ? COLORS.rose : "white", cursor: "pointer" 
                }}
            >
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: liked ? `${COLORS.rose}22` : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}>
                <Heart size={28} fill={liked ? COLORS.rose : "none"} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{liked ? "Liked!" : "Like"}</span>
            </button>
            <button style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, background: "none", border: "none", color: "white", cursor: "pointer" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MessageSquare size={28} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Comment</span>
            </button>
            <button style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, background: "none", border: "none", color: "white", cursor: "pointer" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Star size={28} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Rate</span>
            </button>
          </div>

          <button 
            onClick={() => navigate('/')}
            style={{ 
                padding: "16px 40px", borderRadius: 30, background: COLORS.accent, 
                color: "white", border: "none", fontSize: 16, fontWeight: 700, 
                cursor: "pointer", boxShadow: `0 10px 20px ${COLORS.accent}44` 
            }}
          >
            Find more stories
          </button>
        </div>
      </main>

      {/* ═══ SITE FOOTER ═══ */}
      <footer style={{
        background: "#0C0A14", padding: "60px 40px", borderTop: "1px solid rgba(255,255,255,0.05)",
        textAlign: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 24 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #8B5CF6, #F472B6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📖</div>
          <span style={{ fontSize: 22, fontWeight: 900 }}>ToonVault</span>
        </div>
        <p style={{ color: COLORS.textMuted, fontSize: 14, maxWidth: 500, margin: "0 auto 30px" }}>
          The world's first AI-powered webtoon platform. Create, read, and share your stories with the power of Flux AI.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 40, color: COLORS.textMuted, fontSize: 14 }}>
          <span>About</span>
          <span>Terms</span>
          <span>Privacy</span>
          <span>Discord</span>
        </div>
        <div style={{ marginTop: 40, fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
          &copy; 2026 ToonVault. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
