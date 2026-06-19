import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDefaultRoute } from '../config/rbac';
import { LoadingSpinner } from './LoadingSpinner';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><LoadingSpinner message="Checking access..." /></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={getDefaultRoute(role)} replace />;
  }

  return children;
};

export default ProtectedRoute;
