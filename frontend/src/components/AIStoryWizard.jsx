import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, Wand2, Palette, BookOpen, Check, X, Loader2, Rocket, Zap, Heart, Sword, Ghost } from 'lucide-react';
import api from '../api';

const COLORS = {
  bg: "#050408",
  surface: "#0D0B1A",
  card: "#120F24",
  border: "rgba(255,255,255,0.06)",
  plum: "#8B5CF6",
  rose: "#F43F8E",
  gold: "#F59E0B",
  text: "#F1EEF9",
  textDim: "#6B6789",
  gradient: "linear-gradient(135deg, #8B5CF6 0%, #F43F8E 100%)",
};

const GENRES = [
  { id: 'romance', name: 'Romance', icon: <Heart size={18} />, color: '#F43F8E' },
  { id: 'fantasy', name: 'Fantasy', icon: <Sword size={18} />, color: '#8B5CF6' },
  { id: 'horror', name: 'Horror', icon: <Ghost size={18} />, color: '#6B6789' },
  { id: 'action', name: 'Action', icon: <Zap size={18} />, color: '#F59E0B' },
  { id: 'scifi', name: 'Sci-Fi', icon: <Rocket size={18} />, color: '#3B82F6' },
];

const STYLES = [
  { id: 'manta', name: 'Manta Style', desc: 'Premium manhwa aesthetics' },
  { id: 'realistic', name: 'Realistic', desc: 'High-fidelity cinematic' },
  { id: 'anime', name: 'Classic Anime', desc: 'Hand-drawn feel' },
  { id: 'oil', name: 'Oil Painting', desc: 'Artistic & textured' },
];

export default function AIStoryWizard({ isOpen, onClose, onFinish }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [formData, setFormData] = useState({
    prompt: '',
    genre: 'fantasy',
    style: 'manta',
    isPublic: true
  });
  const [generatedStory, setGeneratedStory] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setGeneratedStory(null);
      setLoading(false);
      setProgress(0);
    }
  }, [isOpen]);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const startGeneration = async () => {
    setLoading(true);
    setStep(4);
    
    const messages = [
      "Analyzing your prompt...",
      "Weaving the narrative structure...",
      "Generating character archetypes...",
      "Creating atmospheric descriptions...",
      "Polishing the dialogue flows...",
      "Finalizing your masterpiece..."
    ];

    let msgIdx = 0;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 5;
      });
      setStatusMsg(messages[msgIdx % messages.length]);
      msgIdx++;
    }, 1500);

    try {
      const res = await api.generateStory({
        prompt: formData.prompt,
        genre: formData.genre,
        style: formData.style
      });
      clearInterval(interval);
      setProgress(100);
      setGeneratedStory(res.data);
      setStep(5);
    } catch (e) {
      clearInterval(interval);
      alert("Generation failed. Please try again.");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{
        width: '100%', maxWidth: 640, background: COLORS.surface,
        borderRadius: 32, border: `1px solid ${COLORS.border}`,
        boxShadow: '0 40px 100px rgba(0,0,0,0.5)', overflow: 'hidden',
        position: 'relative'
      }}>
        
        {/* Close Button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 20, right: 20, zIndex: 10,
          background: 'rgba(255,255,255,0.05)', border: 'none',
          color: COLORS.textDim, borderRadius: '50%', width: 32, height: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
        }}><X size={18} /></button>

        {/* Step Indicator */}
        {step < 4 && (
          <div style={{ display: 'flex', gap: 6, padding: '30px 40px 10px' }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{
                flex: 1, height: 4, borderRadius: 2,
                background: step >= s ? COLORS.plum : 'rgba(255,255,255,0.05)',
                transition: 'all 0.3s'
              }} />
            ))}
          </div>
        )}

        <div style={{ padding: '30px 40px 40px' }}>
          
          {/* STEP 1: PROMPT */}
          {step === 1 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ background: 'rgba(139,92,246,0.15)', padding: 10, borderRadius: 12, color: COLORS.plum }}><Wand2 size={24} /></div>
                <h2 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>Create a New Story</h2>
              </div>
              <p style={{ color: COLORS.textDim, marginBottom: 30 }}>Tell our AI what your story is about. A single sentence or a full paragraph—it's up to you.</p>
              
              <textarea 
                autoFocus
                value={formData.prompt}
                onChange={e => setFormData({...formData, prompt: e.target.value})}
                placeholder="e.g. A young mage discovers a forbidden library hidden beneath a desert city..."
                style={{
                  width: '100%', height: 160, background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: 20,
                  color: 'white', fontSize: 16, outline: 'none', resize: 'none',
                  transition: 'border-color 0.3s'
                }}
                onFocus={e => e.target.style.borderColor = COLORS.plum}
                onBlur={e => e.target.style.borderColor = COLORS.border}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 30 }}>
                <button 
                  disabled={!formData.prompt.trim()}
                  onClick={handleNext}
                  style={{
                    padding: '14px 28px', borderRadius: 16, background: formData.prompt.trim() ? COLORS.gradient : 'rgba(255,255,255,0.05)',
                    color: formData.prompt.trim() ? 'white' : COLORS.textDim, border: 'none', fontWeight: 800,
                    display: 'flex', alignItems: 'center', gap: 10, cursor: formData.prompt.trim() ? 'pointer' : 'not-allowed'
                  }}
                >
                  Next Step <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: GENRE */}
          {step === 2 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ background: 'rgba(244,63,142,0.15)', padding: 10, borderRadius: 12, color: COLORS.rose }}><BookOpen size={24} /></div>
                <h2 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>Select Genre</h2>
              </div>
              <p style={{ color: COLORS.textDim, marginBottom: 30 }}>Choose the genre that best fits your narrative world.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {GENRES.map(g => (
                  <div 
                    key={g.id}
                    onClick={() => setFormData({...formData, genre: g.id})}
                    style={{
                      padding: 16, borderRadius: 16, border: `1px solid ${formData.genre === g.id ? g.color : COLORS.border}`,
                      background: formData.genre === g.id ? `${g.color}15` : 'transparent',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ color: g.color }}>{g.icon}</div>
                    <span style={{ fontWeight: 700, color: formData.genre === g.id ? 'white' : COLORS.textDim }}>{g.name}</span>
                    {formData.genre === g.id && <Check size={16} style={{ marginLeft: 'auto', color: g.color }} />}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40 }}>
                <button onClick={handleBack} style={{ padding: '14px 20px', borderRadius: 16, background: 'none', border: 'none', color: COLORS.textDim, fontWeight: 700, cursor: 'pointer' }}>Back</button>
                <button onClick={handleNext} style={{ padding: '14px 28px', borderRadius: 16, background: COLORS.gradient, color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer' }}>Next Step</button>
              </div>
            </div>
          )}

          {/* STEP 3: STYLE */}
          {step === 3 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ background: 'rgba(245,158,11,0.15)', padding: 10, borderRadius: 12, color: COLORS.gold }}><Palette size={24} /></div>
                <h2 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>Visual Style</h2>
              </div>
              <p style={{ color: COLORS.textDim, marginBottom: 30 }}>Select the visual aesthetic for your AI-generated panels.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {STYLES.map(s => (
                  <div 
                    key={s.id}
                    onClick={() => setFormData({...formData, style: s.id})}
                    style={{
                      padding: 20, borderRadius: 20, border: `1px solid ${formData.style === s.id ? COLORS.plum : COLORS.border}`,
                      background: formData.style === s.id ? 'rgba(139,92,246,0.05)' : 'transparent',
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, color: formData.style === s.id ? COLORS.plum : 'white' }}>{s.name}</span>
                      {formData.style === s.id && <Check size={18} color={COLORS.plum} />}
                    </div>
                    <div style={{ fontSize: 13, color: COLORS.textDim }}>{s.desc}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40 }}>
                <button onClick={handleBack} style={{ padding: '14px 20px', borderRadius: 16, background: 'none', border: 'none', color: COLORS.textDim, fontWeight: 700, cursor: 'pointer' }}>Back</button>
                <button onClick={startGeneration} style={{ 
                  padding: '14px 28px', borderRadius: 16, background: COLORS.gradient, color: 'white', border: 'none', fontWeight: 900, 
                  cursor: 'pointer', boxShadow: `0 10px 30px ${COLORS.plum}44`, display: 'flex', alignItems: 'center', gap: 10
                }}>
                  ✨ Generate Story
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: LOADING */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '40px 0', animation: 'fadeIn 0.3s ease' }}>
              <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 30px' }}>
                <svg width="120" height="120" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke={COLORS.plum} strokeWidth="8" 
                    strokeDasharray={`${progress * 2.83} 283`} strokeLinecap="round" transform="rotate(-90 50 50)"
                    style={{ transition: 'stroke-dasharray 0.3s ease' }}
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={40} color={COLORS.plum} className="animate-pulse" />
                </div>
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Crafting Your Universe...</h2>
              <p style={{ color: COLORS.textDim, fontSize: 16 }}>{statusMsg}</p>
              
              <div style={{ marginTop: 40, background: 'rgba(255,255,255,0.03)', padding: '12px 20px', borderRadius: 100, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                <Loader2 size={16} className="animate-spin" />
                <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.textDim }}>{Math.round(progress)}% Complete</span>
              </div>
            </div>
          )}

          {/* STEP 5: PREVIEW */}
          {step === 5 && generatedStory && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ textAlign: 'center', marginBottom: 30 }}>
                <div style={{ width: 60, height: 60, background: '#2E8B6E20', borderRadius: '50%', color: '#2E8B6E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Check size={32} />
                </div>
                <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Story Ready!</h2>
                <p style={{ color: COLORS.textDim }}>Your AI-generated story is draft and ready for the world.</p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 24, border: `1px solid ${COLORS.border}`, padding: 24, marginBottom: 30 }}>
                <div style={{ display: 'flex', gap: 20 }}>
                  <div style={{ width: 100, height: 140, borderRadius: 12, background: COLORS.card, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
                    {generatedStory.panels?.[0] ? <img src={generatedStory.panels[0]} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} /> : "📖"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 4px' }}>{generatedStory.title}</h3>
                    <div style={{ fontSize: 12, color: COLORS.plum, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>{generatedStory.genre}</div>
                    <p style={{ fontSize: 14, color: COLORS.textDim, lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {generatedStory.description}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={onClose} style={{ flex: 1, padding: '16px', borderRadius: 16, background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Close</button>
                <button onClick={() => onFinish(generatedStory)} style={{ flex: 2, padding: '16px', borderRadius: 16, background: COLORS.plum, color: 'white', border: 'none', fontWeight: 900, cursor: 'pointer', boxShadow: `0 10px 30px ${COLORS.plum}44` }}>
                  View in AI Studio
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-spin { animation: spin 1s linear infinite; }
        .animate-pulse { animation: pulse_op 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse_op { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}
