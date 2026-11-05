import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const out = () => { logout(); nav('/'); };

  return (
    <header className="navbar">
      <Link to={user?.role === 'manager' ? '/manager' : '/'} className="brand">🏨 StayBook</Link>
      <nav>
        {user?.role === 'manager' ? (
          <Link to="/manager">Dashboard</Link>
        ) : (
          <>
            <Link to="/">Browse</Link>
            {user?.role === 'guest' && <Link to="/my-bookings">My Bookings</Link>}
          </>
        )}
        {user ? (
          <>
            <span className="muted hide-sm">{user.name} ({user.role})</span>
            <button className="btn small ghost" onClick={out}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn small">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  );
}
