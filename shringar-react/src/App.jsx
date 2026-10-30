import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { CityProvider } from './context/CityContext';
import { SettingsAPI } from './services/api';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import FavoritesModal from './components/favorites/FavoritesModal';
import CityModal from './components/common/CityModal';

import Home from './pages/Home';
import DesignsPage from './pages/DesignsPage';
import DesignDetailPage from './pages/DesignDetailPage';
import BookingPage from './pages/BookingPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import AiTryOnPage from './pages/AiTryOnPage';
import GalleryPage from './pages/GalleryPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import HelpPage from './pages/HelpPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import BecomeArtistPage from './pages/BecomeArtistPage';
import CustomDesignPage from './pages/CustomDesignPage';
import ErrorBoundary from './components/common/ErrorBoundary';

// Dynamic Site & Favicon Sync from Admin Settings
function SiteSettingsSync() {
  useEffect(() => {
    async function syncSettings() {
      try {
        const s = await SettingsAPI.get().catch(() => null);
        if (s) {
          // Dynamic Favicon sync: if admin uploaded custom logo, update favicon href
          if (s.logoUrl) {
            const link = document.querySelector("link[rel*='icon']");
            if (link) {
              const apiHost = '/api'.replace(/\/api$/, '');
              link.href = s.logoUrl.startsWith('http') ? s.logoUrl : `${apiHost}${s.logoUrl.startsWith('/') ? '' : '/'}${s.logoUrl}`;
            }
          }
        }
      } catch (e) {
        // Fallback default
      }
    }
    syncSettings();
  }, []);

  return null;
}

// Auto-scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Website Story Hierarchy Navigation:
// Guarantees predictable chronological back-stepping so users never get trapped in cyclic loops.
// Fixed steps from deep pages: /booking -> /cart -> /designs -> / -> Exit
function getStoryParent(pathname) {
  if (!pathname || pathname === '/' || pathname === '/profile') return null; // Natural back navigation to previous view
  if (pathname.startsWith('/booking')) return '/cart';
  if (pathname.startsWith('/cart')) return '/designs';
  if (pathname.startsWith('/designs/')) return '/designs';
  // Top-level hub pages navigate straight back to Home (/)
  return '/';
}

function StoryNavigationManager() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPathRef = useRef(location.pathname);

  useEffect(() => {
    currentPathRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    const handlePopState = (e) => {
      // If a drawer/menu or modal handled the back press via pushState, don't hijack navigation
      if (e?.state?.profileMenuOpen || e?.state?.drawerOpen || e?.state?.modalOpen) {
        return;
      }
      const currentPath = currentPathRef.current;
      const targetParent = getStoryParent(currentPath);

      if (targetParent) {
        // Enforce website story chronology: step upward towards Home in fixed steps
        navigate(targetParent, { replace: true });
      }
      // If targetParent is null (e.g. /profile or /), browser naturally navigates back to previous view
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);

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
            <CityProvider>
              <CartProvider>
                <FavoritesProvider>
                  <ScrollToTop />
                  <StoryNavigationManager />
                  <SiteSettingsSync />
                  <FavoritesModal />
                  <CityModal />
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

                  {/* AI Palm Try-On Studio (commented out until next release) */}
                  <Route path="/ai-tryon" element={<Navigate to="/designs" replace />} />
                  <Route path="/try-on" element={<Navigate to="/designs" replace />} />
                  <Route path="/gallery" element={<GalleryPage />} />

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
            </FavoritesProvider>
          </CartProvider>
          </CityProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  </ErrorBoundary>
);
}
