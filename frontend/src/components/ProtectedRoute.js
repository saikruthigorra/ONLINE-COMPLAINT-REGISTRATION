import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roleHome } from '../utils/status';

const ProtectedRoute = ({ roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="container py-5 text-center"><div className="spinner-border text-primary" /></div>;
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  if (roles && !roles.includes(user.role)) return <Navigate to={roleHome(user.role)} replace />;

  return <Outlet />;
};

export default ProtectedRoute;
