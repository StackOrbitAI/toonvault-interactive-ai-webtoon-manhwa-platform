import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ChevronLeft, ChevronRight, Share2, Heart, MessageSquare, BookOpen, Star, MoreVertical, List, ThumbsUp, Flame, ShieldAlert, Bookmark, ArrowRight, Sparkles } from 'lucide-react';
import axios from 'axios';

const COLORS = {
  bg: "#050408",
  header: "rgba(13, 11, 26, 0.92)",
  accent: "#7C3AED", // Royal Purple
  emerald: "#10B981",
  rose: "#F43F8E",
  text: "#F1EEF9",
  textDim: "#6B6789",
  card: "rgba(255, 255, 255, 0.03)",
  border: "rgba(255, 255, 255, 0.08)",
};

export default function MantaReader() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const scrollRef = useRef(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const epNum = parseInt(queryParams.get('ep')) || 1;
  
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
        const s = res.data;
        if (epNum > 1 && s.episodes) {
          const ep = s.episodes.find(e => e.number === epNum);
          if (ep) {
            s.displayPanels = ep.panels;
            s.displayTitle = ep.title || `Episode ${ep.number}`;
            s.displayContent = ep.content;
          } else {
            s.displayPanels = s.panels;
            s.displayTitle = "Episode 1";
            s.displayContent = s.content;
          }
        } else {
          s.displayPanels = s.panels;
          s.displayTitle = "Episode 1";
          s.displayContent = s.content;
        }
        setStory(s);
      } catch (err) {
        setStory({
          title: "The Lemon Tree Forest",
          displayTitle: `Episode ${epNum}`,
          authorName: "ToonVault AI",
          displayPanels: [
            "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000",
            "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000",
          ],
          description: "A beautiful AI-generated story."
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStory();
    window.scrollTo(0, 0);
  }, [storyId, epNum]);

  const [consentGiven, setConsentGiven] = useState(localStorage.getItem('tv_mature_consent') === 'true');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdult = user.age >= 18;

  if (loading) {
    return (
      <div style={{ background: COLORS.bg, height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.accent }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <BookOpen size={48} />
        </motion.div>
      </div>
    );
  }

  const hasNext = story.episodes && epNum < (1 + story.episodes.length);
  const hasPrev = epNum > 1;

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.text, fontFamily: "'Inter', sans-serif" }}>
      
      {/* ═══ TOP STICKY NAV (WEBTOON STYLE) ═══ */}
      <header style={{ 
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1100,
        height: 64, background: COLORS.header, backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${COLORS.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => navigate(`/story/${storyId}`)} style={{ 
            background: "rgba(255,255,255,0.05)", border: "none", color: "white", 
            width: 36, height: 36, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all 0.2s" 
          }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
            <ChevronLeft size={24} />
          </button>
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "white", letterSpacing: -0.3 }}>{story.title}</div>
            <div style={{ fontSize: 10, color: COLORS.accent, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 }}>{story.displayTitle}</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="nav-btn-round" style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "white", width: 40, height: 40, borderRadius: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Share2 size={20} />
          </button>
          <button onClick={() => navigate(`/story/${storyId}`)} style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "white", width: 40, height: 40, borderRadius: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <List size={20} />
          </button>
        </div>
      </header>

      {/* ═══ PROGRESS BAR ═══ */}
      <motion.div
        style={{
          position: "fixed", top: 64, left: 0, right: 0, height: 2,
          background: `linear-gradient(to right, ${COLORS.accent}, ${COLORS.rose})`, 
          transformOrigin: "0%",
          zIndex: 1200, scaleX
        }}
      />

      {/* ═══ MAIN VIEWER ═══ */}
      <main style={{ maxWidth: 800, margin: "0 auto", paddingTop: 60 }}>
        {story.genre?.toLowerCase() === 'mature' && !consentGiven && !isAdult ? (
          <div style={{ padding: "100px 40px", textAlign: "center", minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(232, 106, 138, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
              <ShieldAlert size={40} color={COLORS.rose} />
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 16 }}>Mature Content</h2>
            <p style={{ color: COLORS.textMuted, fontSize: 16, lineHeight: 1.6, maxWidth: 400, marginBottom: 32 }}>
              This story contains mature themes and is intended for adult audiences. Please confirm you are over 18 to continue.
            </p>
            <div style={{ display: "flex", gap: 16 }}>
              <button 
                onClick={() => navigate('/')}
                style={{ padding: "14px 30px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "none", color: "white", fontWeight: 700, cursor: "pointer" }}
              >Go Back</button>
              <button 
                onClick={() => {
                  setConsentGiven(true);
                  localStorage.setItem('tv_mature_consent', 'true');
                }}
                style={{ padding: "14px 30px", borderRadius: 12, border: "none", background: COLORS.rose, color: "white", fontWeight: 800, cursor: "pointer", boxShadow: "0 8px 20px rgba(232,106,138,0.3)" }}
              >I am 18 or older</button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {story.displayPanels?.map((url, i) => (
              <div key={i} style={{ width: "100%", marginBottom: 0 }}>
                <img
                  src={url}
                  alt={`Panel ${i + 1}`}
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
                
                {/* Content Overlay */}
                {story.displayContent && (
                  (() => {
                    try {
                      const contentArr = JSON.parse(story.displayContent);
                      const panelData = contentArr[i];
                      if (panelData && panelData.text) {
                        return (
                          <div style={{
                            padding: "30px 24px", textAlign: "center", background: "#000",
                            color: "white", fontSize: 17, lineHeight: 1.7, fontWeight: 400
                          }}>
                            {panelData.text}
                          </div>
                        );
                      }
                    } catch(e) { return null; }
                  })()
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* ═══ INTERACTIVE CHOICES (PROFESSIONAL) ═══ */}
        <div style={{ 
          padding: "80px 24px", background: "linear-gradient(to bottom, #050408, #0D0B1A)",
          borderTop: `1px solid ${COLORS.border}`
        }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
             <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 12 }}>
                <div style={{ width: 60, height: 1, background: `linear-gradient(to right, transparent, ${COLORS.accent})` }} />
                <span style={{ fontSize: 14, fontWeight: 900, color: COLORS.accent, letterSpacing: 4, textTransform: "uppercase" }}>Forge Your Destiny</span>
                <div style={{ width: 60, height: 1, background: `linear-gradient(to left, transparent, ${COLORS.accent})` }} />
             </div>
             <h2 style={{ fontSize: 32, fontWeight: 900, color: "white", margin: 0 }}>What happens next?</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, maxWidth: 900, margin: "0 auto" }}>
            {[
              { id: 'A', title: 'Protect the Secret', desc: 'Keep the truth hidden a little longer.', popular: true, votes: '42%' },
              { id: 'B', title: 'Follow Your Heart', desc: 'Confess what you have been holding in.', votes: '28%' },
              { id: 'C', title: 'Chase the Truth', desc: 'Dig deeper, no matter the consequence.', votes: '18%' },
            ].map((choice) => (
              <motion.button
                key={choice.id}
                onClick={() => alert(`✨ Storyline Unlocked! You've unlocked Path ${choice.id}. Continue reading to see where it leads!`)}
                whileHover={{ y: -8, boxShadow: `0 12px 30px rgba(124, 58, 237, 0.2)` }}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: 24, background: "rgba(255,255,255,0.02)", border: `1px solid ${COLORS.border}`,
                  borderRadius: 24, textAlign: "left", cursor: "pointer", color: "white",
                  display: "flex", flexDirection: "column", gap: 16, position: "relative", overflow: "hidden"
                }}
              >
                {choice.popular && <div style={{ position: "absolute", top: 0, right: 0, padding: "6px 14px", background: COLORS.rose, color: "white", fontSize: 10, fontWeight: 900, borderBottomLeftRadius: 16 }}>POPULAR</div>}
                <div style={{
                  width: 40, height: 40, borderRadius: 12, background: COLORS.accent,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900
                }}>
                  {choice.id}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 6 }}>{choice.title}</div>
                  <p style={{ margin: 0, fontSize: 13, color: COLORS.textDim, lineHeight: 1.5 }}>{choice.desc}</p>
                </div>
                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                   <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.accent }}>{choice.votes} of readers</div>
                   <ArrowRight size={16} color={COLORS.accent} />
                </div>
              </motion.button>
            ))}
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              style={{ 
                padding: 24, borderRadius: 24, border: `1px dashed ${COLORS.accent}66`,
                background: "rgba(124, 58, 237, 0.02)", color: COLORS.textDim, textAlign: "center",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, cursor: "pointer"
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: "50%", border: `2px dashed ${COLORS.accent}66`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkles size={20} color={COLORS.accent} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: "white" }}>Write Your Own Turn</div>
                <div style={{ fontSize: 11 }}>Submit a custom twist for this scene</div>
              </div>
            </motion.button>
          </div>
        </div>

        <div style={{ 
          padding: "60px 24px", background: "#050408", borderTop: `1px solid ${COLORS.border}`
        }}>
          <div style={{ 
            maxWidth: 800, margin: "0 auto", display: "flex", gap: 24, alignItems: "stretch", flexWrap: "wrap"
          }}>
            <div style={{ 
              flex: 2, minWidth: 300, background: "rgba(255,255,255,0.02)", borderRadius: 24, padding: 24,
              border: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", gap: 20
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 900, color: COLORS.accent, letterSpacing: 1 }}>FAN CHOICE REAL-TIME</span>
                <span style={{ fontSize: 11, color: COLORS.textDim, fontWeight: 700 }}>28,342 VOTES</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { id: 'A', pct: 42, color: COLORS.accent },
                  { id: 'B', pct: 28, color: "rgba(124, 58, 237, 0.4)" },
                  { id: 'C', pct: 18, color: "rgba(124, 58, 237, 0.2)" },
                  { id: 'D', pct: 12, color: "rgba(124, 58, 237, 0.1)" },
                ].map(v => (
                  <div key={v.id} style={{ position: "relative", height: 32, borderRadius: 8, background: "rgba(255,255,255,0.03)", overflow: "hidden" }}>
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${v.pct}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      style={{ height: "100%", background: v.color, display: "flex", alignItems: "center", padding: "0 12px" }}
                    >
                      <span style={{ fontSize: 11, fontWeight: 900, color: "white" }}>{v.id} {v.pct}%</span>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>

            <button style={{ 
              flex: 1, minWidth: 200, background: "rgba(124, 58, 237, 0.05)", border: `1px solid ${COLORS.accent}44`,
              borderRadius: 24, color: "white", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 12, cursor: "pointer",
              transition: "all 0.3s", padding: 24
            }} onMouseEnter={e => e.currentTarget.style.background = "rgba(124, 58, 237, 0.15)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(124, 58, 237, 0.05)"}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(124, 58, 237, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
                <Bookmark size={32} color={COLORS.accent} fill={COLORS.accent} />
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 4 }}>Save to Vault</div>
                <div style={{ fontSize: 11, color: COLORS.textDim, fontWeight: 700 }}>UNLOCKED PATH 14/32</div>
              </div>
            </button>
          </div>
        </div>

        {/* ═══ END OF EPISODE & ENGAGEMENT ═══ */}
        <div style={{ padding: "80px 20px", textAlign: "center", background: "linear-gradient(to bottom, #0A0914, #12101F)" }}>
           <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>{story.displayTitle} End</h2>
           <p style={{ color: COLORS.textMuted, marginBottom: 40 }}>How was this episode? Let the author know!</p>
           
           <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 60 }}>
              <button onClick={() => setLiked(!liked)} style={{ background: "none", border: "none", color: liked ? COLORS.rose : "white", cursor: "pointer", textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: liked ? "rgba(244,114,182,0.2)" : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8, transition: "all 0.2s" }}>
                  <ThumbsUp size={28} fill={liked ? COLORS.rose : "none"} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{liked ? "Liked" : "Like"}</div>
              </button>
              <button style={{ background: "none", border: "none", color: "white", cursor: "pointer", textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                  <MessageSquare size={28} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Comment</div>
              </button>
           </div>

           {/* Next/Prev Navigation */}
           <div style={{ display: "flex", gap: 16, maxWidth: 500, margin: "0 auto" }}>
             {hasPrev && (
               <button 
                onClick={() => navigate(`/manta/${storyId}?ep=${epNum - 1}`)}
                style={{ flex: 1, padding: "18px", borderRadius: 12, background: "rgba(255,255,255,0.05)", color: "white", border: "1px solid rgba(255,255,255,0.1)", fontSize: 16, fontWeight: 700, cursor: "pointer" }}
               >
                 Previous
               </button>
             )}
             {hasNext ? (
               <button 
                onClick={() => navigate(`/manta/${storyId}?ep=${epNum + 1}`)}
                style={{ flex: 2, padding: "18px", borderRadius: 12, background: COLORS.accent, color: "#000", border: "none", fontSize: 16, fontWeight: 900, cursor: "pointer" }}
               >
                 Next Episode
               </button>
             ) : (
               <button 
                onClick={() => navigate(`/story/${storyId}`)}
                style={{ flex: 2, padding: "18px", borderRadius: 12, background: "rgba(255,255,255,0.1)", color: "white", border: "none", fontSize: 16, fontWeight: 700, cursor: "pointer" }}
               >
                 Go to List
               </button>
             )}
           </div>
        </div>
      </main>

      {/* ═══ STICKY BOTTOM NAV (WEBTOON STYLE) ═══ */}
      <footer style={{ 
        position: "fixed", bottom: 0, left: 0, right: 0, height: 60,
        background: "rgba(26, 24, 46, 0.95)", backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", zIndex: 1100
      }}>
        <button 
          disabled={!hasPrev}
          onClick={() => navigate(`/manta/${storyId}?ep=${epNum - 1}`)}
          style={{ background: "none", border: "none", color: hasPrev ? "white" : "rgba(255,255,255,0.2)", cursor: hasPrev ? "pointer" : "default" }}
        >
          <ChevronLeft size={30} />
        </button>
        
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
           <button onClick={() => navigate(`/story/${storyId}`)} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}>
             <List size={24} />
           </button>
           <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.1)" }} />
           <div style={{ fontSize: 16, fontWeight: 900 }}>{epNum}</div>
           <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.1)" }} />
           <button style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}>
             <MoreVertical size={24} />
           </button>
        </div>

        <button 
          disabled={!hasNext}
          onClick={() => navigate(`/manta/${storyId}?ep=${epNum + 1}`)}
          style={{ background: "none", border: "none", color: hasNext ? "white" : "rgba(255,255,255,0.2)", cursor: hasNext ? "pointer" : "default" }}
        >
          <ChevronRight size={30} />
        </button>
      </footer>
    </div>
  );
}
