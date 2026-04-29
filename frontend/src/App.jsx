import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ToonVaultHome from './components/ToonVaultHome';
import Reader from './components/Reader';
import MantaReader from './components/MantaReader';
import AdminDashboard from './pages/admin/AdminDashboard';
import Login from './components/Login';
import ToonVaultUserDashboard from './components/ToonVaultUserDashboard';
import './App.css';

// Simple Protected Route
const ProtectedRoute = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return <Navigate to="/user" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

// Dashboard Hub to handle both Admin and User dashboards on the same /dashboard URL
const DashboardHub = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return <Navigate to="/user" />;
  
  if (user.role === 'admin') {
    return <AdminDashboard />;
  }
  return <ToonVaultUserDashboard />;
};

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          {/* Home Page */}
          <Route path="/" element={<ToonVaultHome />} />
          
          {/* Public Reader */}
          <Route path="/story/:storyId" element={<Reader />} />
          <Route path="/manta/:storyId" element={<MantaReader />} />
          
          {/* Auth */}
          <Route path="/user" element={<Login type="user" />} />
          <Route path="/login" element={<Navigate to="/user" replace />} />
          <Route path="/admin" element={<Login type="admin" />} />
          
          {/* Combined Dashboard */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardHub />
            </ProtectedRoute>
          } />

          {/* Redirect old dashboard URL */}
          <Route path="/user-dashboard" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
}

export default App;

