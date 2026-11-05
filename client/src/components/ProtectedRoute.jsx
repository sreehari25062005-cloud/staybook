import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// role = 'guest' | 'manager'. Wrong role is sent to their own home.
export default function ProtectedRoute({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to={`/login?role=${role}`} replace />;
  if (user.role !== role) return <Navigate to={user.role === 'manager' ? '/manager' : '/'} replace />;
  return children;
}
