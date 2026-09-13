import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { EnquiryProvider } from './context/EnquiryContext';
import { AuthProvider } from './context/AuthContext';

import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileMenu } from './components/layout/MobileMenu';
import { CartDrawer } from './components/cart/CartDrawer';
import { WishlistDrawer } from './components/wishlist/WishlistDrawer';
import { ToastContainer } from './components/common/Toast';
import { ScrollToTop } from './components/common/ScrollToTop';

import { Home } from './pages/Home';
import { Store } from './pages/Store';
import { GameDetails } from './pages/GameDetails';
import { Categories } from './pages/Categories';
import { Deals } from './pages/Deals';
import { Support } from './pages/Support';
import { NotFound } from './pages/NotFound';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminGames } from './pages/admin/AdminGames';
import { AdminGameForm } from './pages/admin/AdminGameForm';
import { AdminGameImport } from './pages/admin/AdminGameImport';
import { AdminEnquiries } from './pages/admin/AdminEnquiries';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminProtectedRoute } from './components/admin/AdminProtectedRoute';

const AppContent: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen bg-[#080a10] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Global Navigation (Hidden when inside Admin portal) */}
      {!isAdmin && <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />}

      {/* Mobile Slideout Navigation */}
      {!isAdmin && (
        <MobileMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Viewport */}
      <main className="flex-1">
        <Routes>
          {/* Public Storefront Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/store" element={<Store />} />
          <Route path="/game/:id" element={<GameDetails />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/support" element={<Support />} />

          {/* Admin Authentication & Management Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/games"
            element={
              <AdminProtectedRoute>
                <AdminGames />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/games/new"
            element={
              <AdminProtectedRoute>
                <AdminGameForm isNew={true} />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/games/:id/edit"
            element={
              <AdminProtectedRoute>
                <AdminGameForm isNew={false} />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/games/import"
            element={
              <AdminProtectedRoute>
                <AdminGameImport />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/enquiries"
            element={
              <AdminProtectedRoute>
                <AdminEnquiries />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/audit"
            element={
              <AdminProtectedRoute>
                <AdminAuditLogs />
              </AdminProtectedRoute>
            }
          />

          {/* Fallback 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Global Footer (Hidden when inside Admin portal) */}
      {!isAdmin && <Footer />}

      {/* Drawers & Notifications */}
      {!isAdmin && <CartDrawer />}
      {!isAdmin && <WishlistDrawer />}
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <WishlistProvider>
            <EnquiryProvider>
              <BrowserRouter>
                <ScrollToTop />
                <AppContent />
              </BrowserRouter>
            </EnquiryProvider>
          </WishlistProvider>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
