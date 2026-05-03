import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, ShieldCheck, Zap, DollarSign, Globe, Sparkles, CheckCircle2, ChevronRight, Lock, FileText, ArrowRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const C = {
  bg: "#050408",
  surface: "#0D0B1A",
  card: "#120F24",
  cardBorder: "rgba(255,255,255,0.06)",
  plum: "#8B5CF6",
  plumGlow: "rgba(139,92,246,0.2)",
  rose: "#F43F8E",
  roseGlow: "rgba(244,63,142,0.2)",
  gold: "#F59E0B",
  text: "#F1EEF9",
  textDim: "#6B6789",
  gradient: "linear-gradient(135deg, #8B5CF6 0%, #F43F8E 100%)",
};

export default function BecomeCreator() {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== 'undefined') {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  const handleStartWriting = () => {
    if (!accepted) {
      alert("Please accept the Creator Terms & Conditions to proceed.");
      return;
    }
    if (user) {
      // Navigate to dashboard with AI Studio page active
      navigate('/dashboard?page=ai');
    } else {
      // Navigate to login/register with redirect back to AI Studio
      navigate('/user?register=true&redirect=' + encodeURIComponent('/dashboard?page=ai'));
    }
  };

  const rules = [
    {
      title: "Original Content Only",
      desc: "You must own the full copyright to all stories and images uploaded. Plagiarism is strictly prohibited.",
      icon: <ShieldCheck className="text-emerald-400" size={24} />
    },
    {
      title: "Content Standards",
      desc: "Maintain professional quality. No excessive violence, hate speech, or prohibited adult content.",
      icon: <CheckCircle2 className="text-blue-400" size={24} />
    },
    {
      title: "Regular Updates",
      desc: "Consistency is key. Creators who update weekly see 400% more engagement on average.",
      icon: <Zap className="text-amber-400" size={24} />
    },
    {
      title: "Monetization Rules",
      desc: "Earn through ad revenue, subscriptions, and direct coin support from your dedicated fans.",
      icon: <DollarSign className="text-rose-400" size={24} />
    }
  ];

  const benefits = [
    { title: "AI-Powered Studio", desc: "Generate panels, scripts, and backgrounds in seconds with our integrated AI tools.", icon: <Sparkles size={20} /> },
    { title: "Global Audience", desc: "Your stories translated and distributed to over 150 countries automatically.", icon: <Globe size={20} /> },
    { title: "Creator Dashboard", desc: "In-depth analytics, fan management, and real-time revenue tracking.", icon: <Rocket size={20} /> }
  ];

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <Helmet>
        <title>Become a Creator | ToonVault — Share Your Story</title>
        <meta name="description" content="Join the ToonVault creator community. Use AI tools to create comics and stories, reach a global audience, and earn revenue." />
      </Helmet>

      {/* Navigation Header */}
      <header style={{ 
        padding: '20px 60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        background: 'rgba(5,4,8,0.8)', backdropFilter: 'blur(30px)', 
        borderBottom: `1px solid ${C.cardBorder}`, zIndex: 1000, position: 'sticky', top: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: C.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: `0 0 30px ${C.plumGlow}` }}>📖</div>
          <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: -1.2 }}>Toon<span style={{ color: C.rose }}>Vault</span></span>
        </div>
        <button onClick={() => navigate('/')} style={{ padding: '10px 24px', borderRadius: 20, border: `1px solid ${C.cardBorder}`, background: 'transparent', color: C.text, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Back to Home</button>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 20px' }}>
        
        {/* Hero Section */}
        <section style={{ textAlign: 'center', marginBottom: 100 }}>
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 30, 
            background: 'rgba(139,92,246,0.1)', border: `1px solid ${C.plum}30`, color: C.plum,
            fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 24
          }}>
            <Sparkles size={14} /> Join the Creative Revolution
          </div>
          <h1 style={{ fontSize: 'clamp(40px, 8vw, 72px)', fontWeight: 900, letterSpacing: -3, lineHeight: 0.9, marginBottom: 24 }}>
            Unleash Your <span style={{ background: C.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Imagination.</span>
          </h1>
          <p style={{ fontSize: 20, color: C.textDim, maxWidth: 700, margin: '0 auto 48px', lineHeight: 1.6 }}>
            The world's first AI-integrated storytelling platform. Create high-quality comics and novels faster than ever before.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
            <button onClick={() => {
              const el = document.getElementById('terms-section');
              el.scrollIntoView({ behavior: 'smooth' });
            }} style={{ 
              padding: '18px 40px', borderRadius: 20, background: C.gradient, color: 'white', 
              fontSize: 18, fontWeight: 800, border: 'none', cursor: 'pointer',
              boxShadow: `0 20px 40px ${C.plumGlow}`, display: 'flex', alignItems: 'center', gap: 12
            }}>
              Start Your Journey <ArrowRight size={20} />
            </button>
          </div>
        </section>

        {/* Benefits Grid */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 120 }}>
          {benefits.map(b => (
            <div key={b.title} style={{ 
              padding: 40, borderRadius: 32, background: C.card, border: `1px solid ${C.cardBorder}`,
              transition: 'all 0.3s'
            }} onMouseEnter={e => e.currentTarget.style.borderColor = C.plum} onMouseLeave={e => e.currentTarget.style.borderColor = C.cardBorder}>
              <div style={{ width: 50, height: 50, borderRadius: 16, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.plum, marginBottom: 24 }}>{b.icon}</div>
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>{b.title}</h3>
              <p style={{ color: C.textDim, lineHeight: 1.6 }}>{b.desc}</p>
            </div>
          ))}
        </section>

        {/* Rules Section */}
        <section style={{ marginBottom: 120 }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 40, fontWeight: 900, letterSpacing: -1.5 }}>Creator Guidelines</h2>
            <p style={{ color: C.textDim }}>Professional standards for the ToonVault community.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {rules.map(r => (
              <div key={r.title} style={{ padding: 32, borderRadius: 24, background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.cardBorder}` }}>
                <div style={{ marginBottom: 20 }}>{r.icon}</div>
                <h4 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>{r.title}</h4>
                <p style={{ fontSize: 14, color: C.textDim, lineHeight: 1.6 }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Terms & CTA Section */}
        <section id="terms-section" style={{ 
          background: 'linear-gradient(180deg, #120F24 0%, #050408 100%)', 
          borderRadius: 40, border: `1px solid ${C.cardBorder}`, padding: '80px 40px', textAlign: 'center'
        }}>
          <h2 style={{ fontSize: 36, fontWeight: 900, marginBottom: 24 }}>Ready to Write Story?</h2>
          <p style={{ color: C.textDim, maxWidth: 600, margin: '0 auto 40px' }}>
            By becoming a creator, you agree to our Platform Terms, Content Guidelines, and Revenue Share agreements.
          </p>

          <div style={{ 
            maxWidth: 500, margin: '0 auto', textAlign: 'left', padding: 24, 
            background: 'rgba(0,0,0,0.3)', borderRadius: 20, border: `1px solid ${C.cardBorder}`,
            marginBottom: 40
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, cursor: 'pointer' }} onClick={() => setAccepted(!accepted)}>
              <div style={{ 
                width: 24, height: 24, borderRadius: 6, border: `2px solid ${accepted ? C.plum : C.cardBorder}`,
                background: accepted ? C.plum : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 2, transition: 'all 0.2s'
              }}>
                {accepted && <CheckCircle2 size={16} color="white" />}
              </div>
              <span style={{ fontSize: 14, color: C.text, lineHeight: 1.5 }}>
                I have read and agree to the <span style={{ color: C.plum, textDecoration: 'underline' }}>Creator Professional Standards</span> and <span style={{ color: C.plum, textDecoration: 'underline' }}>Privacy Policy</span>.
              </span>
            </div>
          </div>

          <button 
            onClick={handleStartWriting}
            style={{ 
              padding: '20px 60px', borderRadius: 24, 
              background: accepted ? C.gradient : 'rgba(255,255,255,0.05)', 
              color: accepted ? 'white' : 'rgba(255,255,255,0.2)', 
              fontSize: 20, fontWeight: 900, border: 'none', 
              cursor: accepted ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s',
              boxShadow: accepted ? `0 20px 50px ${C.plumGlow}` : 'none'
            }}
          >
            {user ? 'Open Creator Dashboard' : 'Become a Creator Now'}
          </button>
          
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 24 }}>
            <span style={{ fontSize: 13, color: C.textDim, display: 'flex', alignItems: 'center', gap: 6 }}><Lock size={14} /> Encrypted & Secure</span>
            <span style={{ fontSize: 13, color: C.textDim, display: 'flex', alignItems: 'center', gap: 6 }}><FileText size={14} /> PDF Contract Available</span>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer style={{ padding: '60px', borderTop: `1px solid ${C.cardBorder}`, textAlign: 'center', color: C.textDim, fontSize: 14 }}>
        <p>© 2026 ToonVault Creator Program. All rights reserved.</p>
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 20 }}>
          <span onClick={() => navigate('/privacy')} style={{ cursor: 'pointer' }}>Privacy Policy</span>
          <span onClick={() => navigate('/terms')} style={{ cursor: 'pointer' }}>Terms of Service</span>
          <span onClick={() => navigate('/help')} style={{ cursor: 'pointer' }}>Help Center</span>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        body { margin: 0; }
        .text-emerald-400 { color: #34D399; }
        .text-blue-400 { color: #60A5FA; }
        .text-amber-400 { color: #FBBF24; }
        .text-rose-400 { color: #FB7185; }
      `}</style>
    </div>
  );
}
