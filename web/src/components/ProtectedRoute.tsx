import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { role } = useAuth();

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
