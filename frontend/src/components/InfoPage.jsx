import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shield, Book, Info, Users, HelpCircle, ArrowLeft } from 'lucide-react';

const C = {
  bg: "#050408",
  surface: "#0D0B1A",
  border: "rgba(255,255,255,0.06)",
  plum: "#8B5CF6",
  rose: "#F43F8E",
  text: "#F1EEF9",
  textDim: "#6B6789",
};

const CONTENT = {
  about: {
    title: "About ToonVault",
    icon: <Info size={24} className="text-plum" />,
    body: (
      <div className="info-body">
        <p>ToonVault is the world's leading AI-powered storytelling platform, where imagination meets cutting-edge technology. Founded in 2026, we aim to democratize the creation of high-quality comics and novels.</p>
        <h3>Our Mission</h3>
        <p>We empower creators by providing them with advanced AI tools that handle the tedious parts of production—like panel generation and background rendering—so they can focus on what matters most: the story.</p>
        <h3>The Community</h3>
        <p>With millions of readers worldwide, ToonVault is more than just a publishing tool. It's a vibrant ecosystem where fans and creators connect through shared passion for digital art and literature.</p>
      </div>
    )
  },
  terms: {
    title: "Terms of Service",
    icon: <Book size={24} className="text-plum" />,
    body: (
      <div className="info-body">
        <p>Last Updated: May 2026</p>
        <h3>1. Acceptance of Terms</h3>
        <p>By accessing or using ToonVault, you agree to be bound by these Terms of Service. If you do not agree, you may not use the platform.</p>
        <h3>2. User Accounts</h3>
        <p>You are responsible for maintaining the confidentiality of your account credentials. All activities under your account are your responsibility.</p>
        <h3>3. Creator Content</h3>
        <p>Creators retain ownership of their original work. However, by publishing on ToonVault, you grant us a non-exclusive license to distribute and promote your content globally.</p>
        <h3>4. Prohibited Conduct</h3>
        <p>Harassment, plagiarism, and the distribution of illegal content are strictly prohibited and will result in immediate termination of account access.</p>
      </div>
    )
  },
  privacy: {
    title: "Privacy Policy",
    icon: <Shield size={24} className="text-plum" />,
    body: (
      <div className="info-body">
        <p>Your privacy is paramount at ToonVault. This policy outlines how we collect and protect your data.</p>
        <h3>1. Data Collection</h3>
        <p>We collect basic information like email and username to provide our services. Usage data is collected to improve your reading and creation experience.</p>
        <h3>2. AI Usage</h3>
        <p>When you use our AI tools, your prompts are processed to generate results. We do not use your private drafts to train public models without explicit consent.</p>
        <h3>3. Security</h3>
        <p>We use industry-standard encryption to protect your personal information and transaction data.</p>
      </div>
    )
  },
  help: {
    title: "Help Center",
    icon: <HelpCircle size={24} className="text-plum" />,
    body: (
      <div className="info-body">
        <h3>Common Questions</h3>
        <details>
          <summary>How do I start writing a story?</summary>
          <p>Navigate to the "Become a Creator" page and click "Start Writing". You will be guided through our AI Studio.</p>
        </details>
        <details>
          <summary>How do I withdraw my earnings?</summary>
          <p>Go to your Wallet in the Dashboard. Once you reach the minimum threshold of $10, you can request a payout via PayPal or Stripe.</p>
        </details>
        <details>
          <summary>Is my data secure?</summary>
          <p>Yes, we use bank-level encryption for all sensitive data and transactions.</p>
        </details>
        <h3>Contact Support</h3>
        <p>Email us at: support@toonvault.com</p>
      </div>
    )
  },
  community: {
    title: "Community Guidelines",
    icon: <Users size={24} className="text-plum" />,
    body: (
      <div className="info-body">
        <p>Join a community built on respect and creativity.</p>
        <h3>1. Be Respectful</h3>
        <p>Feedback should be constructive. Toxicity and hate speech are not tolerated.</p>
        <h3>2. No Spoilers</h3>
        <p>Use spoiler tags when discussing recent chapters in the comments.</p>
        <h3>3. Support Creators</h3>
        <p>The best way to help creators is through likes, follows, and direct coin support.</p>
      </div>
    )
  }
};

export default function InfoPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const page = CONTENT[slug] || CONTENT['about'];

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <header style={{ 
        padding: '20px 60px', borderBottom: `1px solid ${C.border}`, 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, background: 'rgba(5,4,8,0.8)', backdropFilter: 'blur(20px)', zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #8B5CF6, #F43F8E)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📖</div>
          <span style={{ fontSize: 20, fontWeight: 900 }}>Toon<span style={{ color: C.rose }}>Vault</span></span>
        </div>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: C.textDim, fontWeight: 600, cursor: 'pointer' }}>
          <ArrowLeft size={18} /> Back
        </button>
      </header>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '60px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          {page.icon}
          <h1 style={{ fontSize: 40, fontWeight: 900, margin: 0, letterSpacing: -1.5 }}>{page.title}</h1>
        </div>
        
        <div className="content-area" style={{ lineHeight: 1.8, fontSize: 17, color: 'rgba(255,255,255,0.8)' }}>
          {page.body}
        </div>
      </main>

      <style>{`
        .info-body h3 { color: #F1EEF9; margin-top: 32px; margin-bottom: 12px; font-size: 20px; font-weight: 800; }
        .info-body p { margin-bottom: 16px; }
        .info-body details { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 16px; margin-bottom: 12px; }
        .info-body summary { font-weight: 700; cursor: pointer; outline: none; }
        .info-body summary::-webkit-details-marker { color: #8B5CF6; }
        .text-plum { color: #8B5CF6; }
      `}</style>
    </div>
  );
}
