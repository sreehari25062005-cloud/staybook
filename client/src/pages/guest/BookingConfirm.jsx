import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, fmtDate, money } from '../../api.js';
import Status from '../../components/Status.jsx';

export default function BookingConfirm() {
  const { id } = useParams();
  const [b, setB] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { api(`/bookings/${id}`).then(setB).catch((e) => setError(e.message)); }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!b) return <p className="muted">Loading…</p>;

  return (
    <div className="card auth" style={{ maxWidth: 520 }}>
      <h2>🎉 Booking received!</h2>
      <p className="muted">The hotel will confirm your booking shortly.</p>
      <table>
        <tbody>
          <tr><th>Hotel</th><td>{b.hotel?.name}</td></tr>
          <tr><th>Location</th><td>{b.hotel?.location}</td></tr>
          <tr><th>Room</th><td>{b.room?.type}</td></tr>
          <tr><th>Check-in</th><td>{fmtDate(b.checkIn)}</td></tr>
          <tr><th>Check-out</th><td>{fmtDate(b.checkOut)}</td></tr>
          <tr><th>Nights</th><td>{b.nights}</td></tr>
          <tr><th>Total price</th><td><strong>{money(b.totalPrice)}</strong></td></tr>
          <tr><th>Status</th><td><Status s={b.status} /></td></tr>
        </tbody>
      </table>
      <div style={{ display: 'flex', gap: '.5rem', marginTop: '1rem' }}>
        <Link className="btn" to="/my-bookings">My bookings</Link>
        <Link className="btn ghost" to="/">Browse more</Link>
      </div>
    </div>
  );
}
