import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage.js';
import { PublicReviewPage } from './pages/PublicReviewPage.js';
import { AdminLoginPage } from './pages/AdminLoginPage.js';
import { AdminDashboard } from './pages/AdminDashboard.js';
import { AuthSessionUser } from './types/index.js';
import { RefreshCw } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthSessionUser | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Restore authenticated session on app load
  useEffect(() => {
    const token = localStorage.getItem('rf_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch('/api/auth/me', { headers })
      .then((res) => {
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          return res.json();
        }
        throw new Error('Not authenticated');
      })
      .then((data) => {
        if (data && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {
        setCurrentUser(null);
      })
      .finally(() => {
        setIsAuthChecking(false);
      });
  }, []);

  const handleLoginSuccess = (user: AuthSessionUser) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('rf_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      await fetch('/api/auth/logout', { method: 'POST', headers });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('rf_token');
      setCurrentUser(null);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex items-center space-x-2 text-xs">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
          <span>Verifying session...</span>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Home / Overview Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Public Feedback Page */}
        <Route path="/r/:brandSlug" element={<PublicReviewPage />} />

        {/* Admin Login */}
        <Route
          path="/login"
          element={
            currentUser ? (
              <Navigate to="/admin" replace />
            ) : (
              <AdminLoginPage onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            currentUser ? (
              <AdminDashboard user={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
