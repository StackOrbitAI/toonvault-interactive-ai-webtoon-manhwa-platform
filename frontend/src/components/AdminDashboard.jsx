import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const C = {
  bg: '#0F0A1E', sidebar: '#160D2B', card: 'rgba(255,255,255,0.04)',
  plum: '#6D4AE8', rose: '#E86A8A', gold: '#D79A2B',
  text: '#F0EDF8', muted: 'rgba(255,255,255,0.5)', border: 'rgba(255,255,255,0.08)',
  success: '#2ECC71', danger: '#E74C3C'
};

const api = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
});

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState({ users: 0, stories: 0, revenue: 0, views: 0 });
  const [users, setUsers] = useState([]);
  const [stories, setStories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!token || user.role !== 'admin') {
      navigate('/admin');
      return;
    }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const h = api(token);
      const [statsRes, usersRes, storiesRes, txRes, settingsRes] = await Promise.allSettled([
        axios.get('/api/admin/stats', h),
        axios.get('/api/admin/users', h),
        axios.get('/api/admin/stories', h),
        axios.get('/api/admin/transactions', h),
        axios.get('/api/admin/settings', h),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data);
      if (storiesRes.status === 'fulfilled') setStories(storiesRes.value.data);
      if (txRes.status === 'fulfilled') setTransactions(txRes.value.data);
      if (settingsRes.status === 'fulfilled') setSettings(settingsRes.value.data);
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => { localStorage.clear(); navigate('/'); };

  const toggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'banned' : 'active';
    await axios.patch(`/api/admin/users/${userId}/status`, { status: newStatus }, api(token));
    setUsers(prev => prev.map(u => u._id === userId ? { ...u, status: newStatus } : u));
  };

  const updateStoryStatus = async (storyId, status) => {
    await axios.patch(`/api/admin/stories/${storyId}/status`, { status }, api(token));
    setStories(prev => prev.map(s => s._id === storyId ? { ...s, status } : s));
  };

  const StatCard = ({ label, value, icon, color }) => (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px 24px', flex: 1 }}>
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: color || C.plum, margin: '8px 0 4px' }}>{value?.toLocaleString() || 0}</div>
      <div style={{ fontSize: 13, color: C.muted }}>{label}</div>
    </div>
  );

  const tabBtnStyle = (t) => ({
    padding: '8px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
    background: tab === t ? C.plum : 'transparent', color: tab === t ? 'white' : C.muted, transition: 'all 0.2s'
  });

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: "'Inter', sans-serif", display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: C.sidebar, borderRight: `1px solid ${C.border}`, padding: '24px 0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '0 20px 24px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>🛡️ <span style={{ color: C.plum }}>Toon</span><span style={{ color: C.rose }}>Vault</span></div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Admin Control Hub</div>
        </div>
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'users', label: '👥 Users' },
            { id: 'stories', label: '📚 Stories' },
            { id: 'transactions', label: '💰 Transactions' },
            { id: 'settings', label: '⚙️ Settings' },
          ].map(item => (
            <button key={item.id} onClick={() => setTab(item.id)} style={{
              ...tabBtnStyle(item.id), display: 'block', width: '100%', textAlign: 'left', marginBottom: 4
            }}>{item.label}</button>
          ))}
        </nav>
        <div style={{ padding: '12px' }}>
          <button onClick={() => navigate('/')} style={{ width: '100%', padding: '8px', background: 'transparent', border: `1px solid ${C.border}`, color: C.muted, borderRadius: 10, cursor: 'pointer', fontSize: 12, marginBottom: 8 }}>← View Site</button>
          <button onClick={logout} style={{ width: '100%', padding: '8px', background: C.danger + '20', border: `1px solid ${C.danger}40`, color: C.danger, borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>🚪 Logout</button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: 28, overflowY: 'auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>
            {tab === 'overview' && '📊 Dashboard Overview'}
            {tab === 'users' && '👥 User Management'}
            {tab === 'stories' && '📚 Story Management'}
            {tab === 'transactions' && '💰 Transactions'}
            {tab === 'settings' && '⚙️ Platform Settings'}
          </h1>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Welcome, {user.username || 'Admin'}</div>
        </div>

        {error && <div style={{ background: C.danger + '20', border: `1px solid ${C.danger}40`, borderRadius: 10, padding: '10px 16px', color: C.danger, marginBottom: 20 }}>{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', color: C.muted, padding: 60 }}>Loading dashboard data...</div>
        ) : (
          <>
            {/* OVERVIEW */}
            {tab === 'overview' && (
              <div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
                  <StatCard label="Total Users" value={stats.users} icon="👥" color={C.plum} />
                  <StatCard label="Total Stories" value={stats.stories} icon="📚" color={C.rose} />
                  <StatCard label="Total Revenue" value={`$${stats.revenue?.toFixed(2)}`} icon="💰" color={C.gold} />
                  <StatCard label="Total Views" value={stats.views} icon="👁" color={C.success} />
                </div>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: 15 }}>📋 Recent Activity</h3>
                  <div style={{ color: C.muted, fontSize: 13 }}>
                    {transactions.slice(0, 5).map((t, i) => (
                      <div key={i} style={{ padding: '8px 0', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between' }}>
                        <span>{t.username || t.userId || 'User'}</span>
                        <span style={{ color: C.gold }}>+{t.amount} coins</span>
                      </div>
                    ))}
                    {transactions.length === 0 && <div>No transactions yet.</div>}
                  </div>
                </div>
              </div>
            )}

            {/* USERS */}
            {tab === 'users' && (
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                      {['Username', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: C.muted, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 && <tr><td colSpan={6} style={{ padding: 24, color: C.muted, textAlign: 'center' }}>No users found.</td></tr>}
                    {users.map(u => (
                      <tr key={u._id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>{u.username}</td>
                        <td style={{ padding: '12px 16px', color: C.muted }}>{u.email}</td>
                        <td style={{ padding: '12px 16px' }}><span style={{ background: u.role === 'admin' ? C.plum + '30' : C.card, color: u.role === 'admin' ? C.plum : C.muted, padding: '2px 8px', borderRadius: 6, fontSize: 11 }}>{u.role}</span></td>
                        <td style={{ padding: '12px 16px' }}><span style={{ color: u.status === 'banned' ? C.danger : C.success, fontSize: 12 }}>{u.status || 'active'}</span></td>
                        <td style={{ padding: '12px 16px', color: C.muted }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <button onClick={() => toggleUserStatus(u._id, u.status || 'active')} style={{
                            padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                            background: u.status === 'banned' ? C.success + '20' : C.danger + '20',
                            color: u.status === 'banned' ? C.success : C.danger
                          }}>{u.status === 'banned' ? 'Unban' : 'Ban'}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* STORIES */}
            {tab === 'stories' && (
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                      {['Title', 'Author', 'Genre', 'Status', 'Views', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: C.muted, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stories.length === 0 && <tr><td colSpan={6} style={{ padding: 24, color: C.muted, textAlign: 'center' }}>No stories found.</td></tr>}
                    {stories.map(s => (
                      <tr key={s._id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>{s.title}</td>
                        <td style={{ padding: '12px 16px', color: C.muted }}>{s.authorName || '—'}</td>
                        <td style={{ padding: '12px 16px', color: C.muted }}>{s.genre || '—'}</td>
                        <td style={{ padding: '12px 16px' }}><span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, background: s.status === 'Live' ? C.success + '20' : s.status === 'Flagged' ? C.danger + '20' : 'rgba(255,255,255,0.06)', color: s.status === 'Live' ? C.success : s.status === 'Flagged' ? C.danger : C.muted }}>{s.status}</span></td>
                        <td style={{ padding: '12px 16px', color: C.muted }}>{s.views?.toLocaleString()}</td>
                        <td style={{ padding: '12px 16px', display: 'flex', gap: 6 }}>
                          <button onClick={() => updateStoryStatus(s._id, 'Live')} style={{ padding: '3px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, background: C.success + '20', color: C.success }}>Approve</button>
                          <button onClick={() => updateStoryStatus(s._id, 'Flagged')} style={{ padding: '3px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, background: C.danger + '20', color: C.danger }}>Flag</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TRANSACTIONS */}
            {tab === 'transactions' && (
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                      {['User', 'Amount', 'Type', 'Date'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: C.muted, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length === 0 && <tr><td colSpan={4} style={{ padding: 24, color: C.muted, textAlign: 'center' }}>No transactions yet.</td></tr>}
                    {transactions.map(t => (
                      <tr key={t._id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '12px 16px' }}>{t.username || t.userId}</td>
                        <td style={{ padding: '12px 16px', color: C.gold, fontWeight: 700 }}>${t.amount}</td>
                        <td style={{ padding: '12px 16px', color: C.muted }}>{t.type || 'coin_purchase'}</td>
                        <td style={{ padding: '12px 16px', color: C.muted }}>{new Date(t.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* SETTINGS */}
            {tab === 'settings' && (
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
                <h3 style={{ margin: '0 0 20px', fontSize: 15 }}>Platform Settings</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {settings.map(s => (
                    <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: `1px solid ${C.border}` }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{s.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{s.key}</div>
                      </div>
                      <div style={{ fontSize: 13, color: C.plum, fontWeight: 700 }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
