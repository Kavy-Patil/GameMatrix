import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, ShieldAlert, Loader2 } from 'lucide-react';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { user, isAdmin, loading, isBackendConnected } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 animate-pulse">
          <Shield className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2 text-slate-300 font-mono text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
          <span>Verifying administrator authorization...</span>
        </div>
      </div>
    );
  }

  // Strict admin route protection: unauthenticated or non-admin visitors are strictly redirected to login
  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
