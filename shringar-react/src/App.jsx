import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import Home from './pages/Home';
import DesignsPage from './pages/DesignsPage';
import DesignDetailPage from './pages/DesignDetailPage';
import BookingPage from './pages/BookingPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import AiTryOnPage from './pages/AiTryOnPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import HelpPage from './pages/HelpPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import BecomeArtistPage from './pages/BecomeArtistPage';
import CustomDesignPage from './pages/CustomDesignPage';
import ErrorBoundary from './components/common/ErrorBoundary';

// Auto-scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Omit footer on designs catalog and inside design detail pages (Amazon-style continuous exploration)
function ConditionalFooter() {
  const { pathname } = useLocation();
  if (pathname === '/designs' || pathname.startsWith('/designs/')) {
    return null;
  }
  return <Footer />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <ScrollToTop />
              <div className="flex flex-col min-h-screen bg-brand-cream text-stone-800 font-sans selection:bg-brand-gold/30 selection:text-brand-maroon">
              {/* Luxury Navigation Header */}
              <Navbar />

              {/* Main Routed Page Content */}
              <main className="flex-grow">
                <Routes>
                  {/* Homepage with curated preview */}
                  <Route path="/" element={<Home />} />

                  {/* Dedicated Separate Designs Catalog */}
                  <Route path="/designs" element={<DesignsPage />} />
                  <Route path="/designs/:id" element={<DesignDetailPage />} />

                  {/* Booking Flow, Cart & Custom Designs */}
                  <Route path="/booking" element={<BookingPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/custom-design" element={<CustomDesignPage />} />
                  <Route path="/become-artist" element={<BecomeArtistPage />} />

                  {/* AI Palm Try-On */}
                  <Route path="/ai-tryon" element={<AiTryOnPage />} />

                  {/* Authentication */}
                  <Route path="/login" element={<LoginPage />} />

                  {/* Customer Orders & Profile */}
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/help" element={<HelpPage />} />

                  {/* Royal Admin Dashboard */}
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />

                  {/* Fallback to Home */}
                  <Route path="*" element={<Home />} />
                </Routes>
              </main>

              {/* Luxury Footer (Omitted on /designs catalog & details) */}
              <ConditionalFooter />
            </div>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  </ErrorBoundary>
);
}
