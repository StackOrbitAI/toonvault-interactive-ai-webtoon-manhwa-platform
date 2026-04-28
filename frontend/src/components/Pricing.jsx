import React from "react";
import { useNavigate } from "react-router-dom";
import { Check, Zap, Star, Shield } from "lucide-react";

const COLORS = {
  bg: "#FAF7F2",
  ink: "#1F2430",
  muted: "#6B7280",
  plum: "#6D4AE8",
  plumDark: "#4C2DB5",
  rose: "#E86A8A",
  gold: "#D79A2B",
  border: "#EDE8DF",
  card: "#FFFFFF",
};

const PLANS = [
  {
    name: "Free",
    price: "0",
    desc: "Perfect for exploring our worlds",
    icon: <Zap size={24} />,
    features: ["Access to 1,000+ free episodes", "Basic reading customization", "Daily free pass system", "Community comments"],
    btnText: "Get Started",
    accent: COLORS.muted,
  },
  {
    name: "Silver",
    price: "9.99",
    desc: "The ultimate fan experience",
    icon: <Star size={24} />,
    features: ["Ad-free reading", "Unlimited episodes", "Early access to new chapters", "Download for offline reading", "Exclusive profile badge"],
    btnText: "Upgrade to Silver",
    accent: COLORS.plum,
    popular: true,
  },
  {
    name: "Gold",
    price: "19.99",
    desc: "For the legendary collectors",
    icon: <Shield size={24} />,
    features: ["Everything in Silver", "Direct support for creators", "Exclusive Gold-only stories", "Monthly coin bonus", "HD art downloads", "Priority support"],
    btnText: "Become a Legend",
    accent: COLORS.gold,
  },
];

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: COLORS.bg, minHeight: "100vh", color: COLORS.ink }}>
      {/* Nav */}
      <nav style={{ padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1200, margin: "0 auto" }}>
        <div onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, ${COLORS.plum}, ${COLORS.rose})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📖</div>
          <span style={{ fontSize: 20, fontWeight: 800, color: COLORS.plum }}>Toon<span style={{ color: COLORS.rose }}>Vault</span></span>
        </div>
        <button onClick={() => navigate("/")} style={{ background: "none", border: `1px solid ${COLORS.border}`, padding: "8px 20px", borderRadius: 20, cursor: "pointer", fontWeight: 600, color: COLORS.muted }}>Back Home</button>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px 100px", textAlign: "center" }}>
        <h1 style={{ fontSize: 48, fontWeight: 900, marginBottom: 16, letterSpacing: "-1px" }}>Choose Your Journey</h1>
        <p style={{ fontSize: 18, color: COLORS.muted, maxWidth: 600, margin: "0 auto 60px", lineHeight: 1.6 }}>
          Unlock unlimited storytelling, support your favorite creators, and experience ToonVault like never before.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32, alignItems: "flex-start" }}>
          {PLANS.map((plan, i) => (
            <div key={i} style={{
              background: COLORS.card,
              borderRadius: 32,
              padding: "48px 40px",
              border: plan.popular ? `3px solid ${plan.accent}` : `1px solid ${COLORS.border}`,
              position: "relative",
              textAlign: "left",
              transition: "transform 0.3s, box-shadow 0.3s",
              boxShadow: plan.popular ? "0 20px 40px rgba(109,74,232,0.15)" : "none",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-10px)"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = plan.popular ? "0 20px 40px rgba(109,74,232,0.15)" : "none"; }}
            >
              {plan.popular && (
                <div style={{
                  position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)",
                  background: plan.accent, color: "white", padding: "6px 20px", borderRadius: 20,
                  fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1
                }}>Most Popular</div>
              )}
              
              <div style={{ color: plan.accent, marginBottom: 24 }}>{plan.icon}</div>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{plan.name}</h2>
              <p style={{ fontSize: 14, color: COLORS.muted, marginBottom: 28 }}>{plan.desc}</p>
              
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 40 }}>
                <span style={{ fontSize: 40, fontWeight: 900 }}>${plan.price}</span>
                <span style={{ fontSize: 16, color: COLORS.muted, fontWeight: 500 }}>/month</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
                {plan.features.map((f, fi) => (
                  <div key={fi} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: `${plan.accent}15`, display: "flex", alignItems: "center", justifyContent: "center", color: plan.accent }}>
                      <Check size={12} strokeWidth={4} />
                    </div>
                    <span style={{ fontSize: 14, color: COLORS.ink, fontWeight: 500 }}>{f}</span>
                  </div>
                ))}
              </div>

              <button style={{
                width: "100%", padding: "16px", borderRadius: 16, border: "none",
                background: plan.popular ? plan.accent : `${plan.accent}10`,
                color: plan.popular ? "white" : plan.accent,
                fontSize: 16, fontWeight: 800, cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={e => { if(!plan.popular) e.currentTarget.style.background = `${plan.accent}20`; }}
              onMouseLeave={e => { if(!plan.popular) e.currentTarget.style.background = `${plan.accent}10`; }}
              >
                {plan.btnText}
              </button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 80, padding: 40, background: "white", borderRadius: 32, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 40, textAlign: "left" }}>
          <div style={{ fontSize: 48 }}>💡</div>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Support Creators Directly</h3>
            <p style={{ fontSize: 15, color: COLORS.muted, lineHeight: 1.6, margin: 0 }}>
              70% of all subscription revenue goes directly to the authors and artists whose stories you love. Your support helps them keep creating the worlds you enjoy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
