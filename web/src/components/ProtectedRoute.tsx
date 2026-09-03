import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-white font-geist">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-placeholder">Loading session...</span>
        </div>
      </div>
    );
  }

  if (role === 'GUEST') {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // If logged in but doesn't have the right role, redirect to their default dashboard
    if (role === 'SUPER_ADMIN') {
      return <Navigate to="/admin/organizers" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
