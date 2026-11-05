import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Home from './pages/guest/Home.jsx';
import HotelDetail from './pages/guest/HotelDetail.jsx';
import BookingConfirm from './pages/guest/BookingConfirm.jsx';
import MyBookings from './pages/guest/MyBookings.jsx';
import Dashboard from './pages/manager/Dashboard.jsx';

// Managers have no access to the guest browse pages; they are sent to their dashboard.
function GuestArea({ children }) {
  const { user } = useAuth();
  if (user?.role === 'manager') return <Navigate to="/manager" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Public / guest area */}
          <Route path="/" element={<GuestArea><Home /></GuestArea>} />
          <Route path="/hotels/:id" element={<GuestArea><HotelDetail /></GuestArea>} />
          <Route path="/booking/:id" element={<ProtectedRoute role="guest"><BookingConfirm /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute role="guest"><MyBookings /></ProtectedRoute>} />

          {/* Manager area */}
          <Route path="/manager" element={<ProtectedRoute role="manager"><Dashboard /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
