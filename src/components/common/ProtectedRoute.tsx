import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Authenticating CareFlow Secure Session...</p>
        </div>
      </div>
    );
  }

  // 1. Strict Authentication Check: Logged-out visitors CANNOT access private portals
  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location.pathname,
          message: 'Please log in to continue to your dashboard.'
        }}
        replace
      />
    );
  }

  // 2. Strict RBAC Check: User must hold one of the permitted roles
  if (allowedRoles && allowedRoles.length > 0) {
    // Treat 'admin' and 'super_admin' interoperably for platform admins
    const hasRole = allowedRoles.includes(role) || 
      (role === 'super_admin' && allowedRoles.includes('admin')) ||
      (role === 'admin' && allowedRoles.includes('super_admin'));

    if (!hasRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};
