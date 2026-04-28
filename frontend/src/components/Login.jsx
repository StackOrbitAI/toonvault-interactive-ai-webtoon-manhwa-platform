import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, User, Lock, Mail, Phone, MapPin, CreditCard, ShieldCheck, Check } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function Login({ type = 'user' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState(1); // 1: Auth, 2: Address, 3: Payment
  const [paypalEnabled, setPaypalEnabled] = useState(true);
  const [settings, setSettings] = useState({ site_name: "ToonVault" });
  const [formData, setFormData] = useState({
    username: '', email: '', password: '',
    plan: 'Free',
    phone: '',
    address: { street: '', city: '', state: '', zip: '', country: 'USA' },
    billing: { cardNumber: '', expiry: '', cvv: '' }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const planParam = params.get('plan');
    if (planParam) {
      setFormData(prev => ({ ...prev, plan: planParam }));
      setIsRegister(true);
    }

    // Fetch payment settings
    axios.get('/api/settings/public')
      .then(res => {
        setPaypalEnabled(res.data.payment_paypal_enabled === 'true');
        setSettings(prev => ({ ...prev, ...res.data }));
      })
      .catch(() => setPaypalEnabled(true));
  }, [location]);

  const isAdmin = type === 'admin';
  const title = isAdmin ? `Admin Login — ${settings.site_name}` : isRegister ? `Join ${settings.site_name} — Membership` : `Sign In — ${settings.site_name}`;

  const PLANS = [
    { name: 'Free', price: '0', color: '#6B7280' },
    { name: 'Silver', price: '9.99', color: '#6D4AE8' },
    { name: 'Gold', price: '19.99', color: '#D79A2B' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegister && step < 3 && !isAdmin) {
      setStep(step + 1);
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      if (isRegister && !isAdmin) {
        const res = await axios.post('/api/auth/register', formData);
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/dashboard');
      } else {
        const res = await axios.post('/api/auth/login', {
          email: formData.email,
          password: formData.password,
        });
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(135deg, #0f051a 0%, #1a0a2e 100%)',
      fontFamily: "'Inter', sans-serif", color: 'white'
    }}>
      <Helmet>
        <title>{title}</title>
      </Helmet>

      {/* Header */}
      <header style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #8B5CF6, #F43F8E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📖</div>
          <span style={{ fontSize: 18, fontWeight: 800 }}>
            {settings.site_name.split('Vault')[0]}<span style={{ color: '#F43F8E' }}>{settings.site_name.includes('Vault') ? 'Vault' : ''}</span>
          </span>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 28, border: '1px solid rgba(255,255,255,0.1)', width: '100%', maxWidth: isRegister ? 500 : 400, padding: '40px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
             <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>{isAdmin ? 'Admin Portal' : isRegister ? 'Create Your Account' : 'Welcome Back'}</h1>
             <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>{isRegister ? `Step ${step} of 3` : 'Enter your credentials to continue'}</p>
          </div>

          {error && <div style={{ background: 'rgba(232,106,138,0.15)', border: '1px solid #E86A8A', borderRadius: 12, padding: '12px', color: '#E86A8A', fontSize: 13, textAlign: 'center', marginBottom: 20 }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            {isRegister && !isAdmin && (
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 12, display: 'block' }}>Choose Your Plan</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {PLANS.map(p => (
                    <div key={p.name} onClick={() => setFormData({ ...formData, plan: p.name })} style={{
                      padding: '12px 8px', borderRadius: 14, border: `2px solid ${formData.plan === p.name ? p.color : 'rgba(255,255,255,0.1)'}`,
                      background: formData.plan === p.name ? `${p.color}20` : 'transparent', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: formData.plan === p.name ? p.color : 'white' }}>{p.name}</div>
                      <div style={{ fontSize: 11, opacity: 0.6 }}>${p.price}/mo</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 1: Basic Info */}
            {(step === 1 || !isRegister || isAdmin) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {isRegister && !isAdmin && (
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={iconStyle} />
                    <input type="text" placeholder="Full Name" value={formData.username} required style={inputStyle} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                  </div>
                )}
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={iconStyle} />
                  <input type="email" placeholder="Email Address" value={formData.email} required style={inputStyle} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
                {isRegister && !isAdmin && (
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} style={iconStyle} />
                    <input type="tel" placeholder="Phone Number" value={formData.phone} required style={inputStyle} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                )}
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={iconStyle} />
                  <input type="password" placeholder="Password" value={formData.password} required style={inputStyle} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                </div>
              </div>
            )}

            {/* STEP 2: Address Info */}
            {isRegister && step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ position: 'relative' }}>
                  <MapPin size={18} style={iconStyle} />
                  <input type="text" placeholder="Street Address" value={formData.address.street} required style={inputStyle} onChange={e => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <input type="text" placeholder="City" value={formData.address.city} required style={{ ...inputStyle, paddingLeft: 16 }} onChange={e => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })} />
                  <input type="text" placeholder="State (e.g. CA)" value={formData.address.state} required style={{ ...inputStyle, paddingLeft: 16 }} onChange={e => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <input type="text" placeholder="Zip Code" value={formData.address.zip} required style={{ ...inputStyle, paddingLeft: 16 }} onChange={e => setFormData({ ...formData, address: { ...formData.address, zip: e.target.value } })} />
                  <input type="text" placeholder="Country" value={formData.address.country} readOnly style={{ ...inputStyle, paddingLeft: 16, opacity: 0.6 }} />
                </div>
              </div>
            )}

            {/* STEP 3: Payment Info */}
            {isRegister && step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: 16, marginBottom: 10, border: '1px solid rgba(255,255,255,0.1)' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Selected Plan:</span>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{formData.plan}</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Monthly Charge:</span>
                      <span style={{ fontSize: 13, fontWeight: 900 }}>${PLANS.find(p => p.name === formData.plan)?.price}</span>
                   </div>
                </div>
                
                {formData.plan !== 'Free' ? (
                  <div style={{ marginTop: 10 }}>
                    {paypalEnabled ? (
                      <PayPalScriptProvider options={{ "client-id": "test" }}>
                        <div style={{ minHeight: 150 }}>
                          <PayPalButtons 
                            style={{ layout: "vertical", shape: "pill", color: "blue" }}
                            createOrder={(data, actions) => {
                              return actions.order.create({
                                purchase_units: [{
                                  amount: { value: PLANS.find(p => p.name === formData.plan)?.price }
                                }]
                              });
                            }}
                            onApprove={async (data, actions) => {
                              const details = await actions.order.capture();
                              console.log("PayPal Transaction Completed", details);
                              // Submit form after successful payment
                              handleSubmit({ preventDefault: () => {} });
                            }}
                          />
                        </div>
                      </PayPalScriptProvider>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#ff8da1' }}>
                        PayPal is currently disabled. Please contact support.
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 4px', opacity: 0.6, justifyContent: 'center' }}>
                      <ShieldCheck size={14} />
                      <span style={{ fontSize: 11 }}>Secure PayPal Checkout</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(46,139,110,0.1)', color: '#2E8B6E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                       <Check size={24} strokeWidth={3} />
                    </div>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: 0 }}>No payment required for the Free plan. Just click complete!</p>
                  </div>
                )}
              </div>
            )}

            {(step !== 3 || formData.plan === 'Free' || isAdmin || !isRegister) && (
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '15px', background: loading ? 'rgba(109,74,232,0.5)' : 'linear-gradient(135deg, #6D4AE8, #F43F8E)',
                color: 'white', border: 'none', borderRadius: 16, fontSize: 16, fontWeight: 800,
                cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', marginTop: 24,
                boxShadow: '0 10px 25px rgba(109,74,232,0.3)'
              }}>
                {loading ? 'Processing...' : isRegister ? (step === 3 ? 'Complete Signup' : 'Continue') : 'Sign In'}
              </button>
            )}
          </form>

          {!isAdmin && (
            <div style={{ textAlign: 'center', marginTop: 24 }}>
               <button onClick={() => { setIsRegister(!isRegister); setStep(1); setError(''); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>
                 {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Join Now"}
               </button>
            </div>
          )}

          {isRegister && step > 1 && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
               <button onClick={() => setStep(step - 1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 12, cursor: 'pointer' }}>
                 ← Back to previous step
               </button>
            </div>
          )}
        </div>
      </main>

      <footer style={{ padding: '30px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
         &copy; 2026 {settings.site_name}. All rights reserved.
      </footer>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '14px 14px 14px 44px',
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 14, color: 'white', fontSize: 14, outline: 'none',
  boxSizing: 'border-box', transition: 'all 0.2s'
};

const iconStyle = {
  position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)'
};
