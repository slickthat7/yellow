import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { ScrollToTop } from './components/ScrollToTop.js';
import { OrderTrackingModal } from './components/OrderTrackingModal.js';
import { HomePage } from './pages/HomePage.js';
import { FeaturesPage } from './pages/FeaturesPage.js';
import { PlansPage } from './pages/PlansPage.js';
import { HowItWorksPage } from './pages/HowItWorksPage.js';
import { DemoPage } from './pages/DemoPage.js';
import { TrackOrderPage } from './pages/TrackOrderPage.js';
import { FaqPage } from './pages/FaqPage.js';
import { ContactPage } from './pages/ContactPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { OrderSuccessPage } from './pages/OrderSuccessPage.js';
import { PublicReviewRouterPage } from './pages/PublicReviewRouterPage.js';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { AuthSessionUser } from './types/index.js';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AuthSessionUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Load existing session on mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Not authenticated');
      })
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {
        // Not logged in
      });
  }, []);

  const handleLoginSuccess = (user: AuthSessionUser, token: string) => {
    setCurrentUser(user);
    setAuthToken(token);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    setCurrentUser(null);
    setAuthToken(null);
    navigate('/admin/login');
  };

  // Determine if full-screen mode (e.g. for customer QR scanner `/r/:slug`)
  const isQrReviewPage = location.pathname.startsWith('/r/');

  if (isQrReviewPage) {
    return (
      <Routes>
        <Route path="/r/:slug" element={<PublicReviewRouterPage />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-purple-600 selection:text-white">
      {/* Scroll restoration helper */}
      <ScrollToTop />

      {/* Global Navbar */}
      <Navbar onOpenTracker={() => setIsTrackerOpen(true)} />

      {/* Main App Routes */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage onOpenTracker={() => setIsTrackerOpen(true)} />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/pricing" element={<PlansPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/track" element={<TrackOrderPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/contact" element={<ContactPage />} />

          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success/:id" element={<OrderSuccessPage />} />
          <Route
            path="/login"
            element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
          />
          <Route
            path="/admin/login"
            element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
          />

          {/* Protected Customer Dashboard */}
          <Route
            path="/dashboard"
            element={
              currentUser ? (
                <CustomerDashboardPage user={currentUser} onLogout={handleLogout} />
              ) : (
                <LoginPage onLoginSuccess={handleLoginSuccess} />
              )
            }
          />

          {/* Protected Superadmin Dashboard */}
          <Route
            path="/admin/dashboard"
            element={
              currentUser && currentUser.role === 'SUPERADMIN' ? (
                <AdminDashboardPage user={currentUser} onLogout={handleLogout} />
              ) : (
                <LoginPage onLoginSuccess={handleLoginSuccess} />
              )
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<HomePage onOpenTracker={() => setIsTrackerOpen(true)} />} />
        </Routes>
      </main>

      {/* Global Footer */}
      <Footer onOpenTracker={() => setIsTrackerOpen(true)} />

      {/* Order Tracking Modal */}
      <OrderTrackingModal isOpen={isTrackerOpen} onClose={() => setIsTrackerOpen(false)} />
    </div>
  );
};

export default App;
