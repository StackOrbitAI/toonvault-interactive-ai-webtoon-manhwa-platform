import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, User, Lock, Mail } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';

export default function Login({ type = 'user' }) {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdmin = type === 'admin';
  const title = isAdmin ? 'Admin Login — ToonVault' : 'Sign In — ToonVault';
  const description = isAdmin ? 'Admin access to ToonVault dashboard' : 'Sign in or create your ToonVault account';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister && !isAdmin) {
        const res = await axios.post('/api/auth/register', {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });
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
        if (user.role === 'admin') {
          navigate('/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a0a2e 0%, #3D1A5C 50%, #E8336D 100%)',
      fontFamily: "'Inter', sans-serif", padding: 20
    }}>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Helmet>

      <div style={{
        background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)',
        borderRadius: 24, padding: '40px 36px', width: '100%', maxWidth: 400,
        border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>
            {isAdmin ? '🛡️' : '📖'}
          </div>
          <h1 style={{ color: 'white', fontSize: 24, fontWeight: 800, margin: '0 0 6px' }}>
            {isAdmin ? 'Admin Portal' : isRegister ? 'Join ToonVault' : 'Welcome Back'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, margin: 0 }}>
            {isAdmin ? 'Restricted access — admins only' : isRegister ? 'Start your reading journey' : 'Resume your adventure'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(232,106,138,0.2)', border: '1px solid rgba(232,106,138,0.4)',
            borderRadius: 10, padding: '10px 14px', marginBottom: 20,
            color: '#ff8da1', fontSize: 13, textAlign: 'center'
          }}>{error}</div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {isRegister && !isAdmin && (
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
              <input
                type="text" placeholder="Username" value={formData.username} required
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                style={inputStyle}
              />
            </div>
          )}
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
            <input
              type="email" placeholder="Email Address" value={formData.email} required
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div style={{ position: 'relative', marginBottom: 24 }}>
            <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
            <input
              type="password" placeholder="Password" value={formData.password} required
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              style={inputStyle}
            />
          </div>
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '13px', background: loading ? 'rgba(109,74,232,0.5)' : 'linear-gradient(135deg, #6D4AE8, #E86A8A)',
            color: 'white', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
          }}>
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle Register/Login */}
        {!isAdmin && (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button onClick={() => { setIsRegister(!isRegister); setError(''); }} style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.65)', fontSize: 13,
              cursor: 'pointer', textDecoration: 'underline'
            }}>
              {isRegister ? 'Already have an account? Sign In' : "New here? Create an account"}
            </button>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={() => navigate('/')} style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer'
          }}>← Back to ToonVault</button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '12px 14px 12px 40px',
  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 12, color: 'white', fontSize: 14, outline: 'none',
  boxSizing: 'border-box', transition: 'border 0.2s'
};
