import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, fmtDate, money } from '../../api.js';
import Status from '../../components/Status.jsx';

export default function MyBookings() {
  const [list, setList] = useState(null);
  const [error, setError] = useState('');

  const load = () => api('/bookings/mine').then(setList).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try { await api(`/bookings/${id}/cancel`, { method: 'PATCH' }); load(); }
    catch (e) { setError(e.message); }
  };

  if (!list) return <p className="muted">{error || 'Loading…'}</p>;

  const now = new Date();
  const upcoming = list.filter((b) => new Date(b.checkOut) >= now && b.status !== 'cancelled' && b.status !== 'completed');
  const past = list.filter((b) => !upcoming.includes(b));

  const Card = ({ b, canCancel }) => (
    <div className="card row">
      <div>
        <h3><Link to={`/hotels/${b.hotel?._id}`}>{b.hotel?.name}</Link></h3>
        <div className="muted">{b.room?.type} · {fmtDate(b.checkIn)} → {fmtDate(b.checkOut)} ({b.nights} nights)</div>
        <strong>{money(b.totalPrice)}</strong>
      </div>
      <div style={{ textAlign: 'right' }}>
        <Status s={b.status} />
        {canCancel && new Date(b.checkIn) > now && ['pending', 'confirmed'].includes(b.status) && (
          <div><button className="btn small danger" style={{ marginTop: '.5rem' }} onClick={() => cancel(b._id)}>Cancel</button></div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <h1>My bookings</h1>
      {error && <p className="error">{error}</p>}
      <h2>Upcoming</h2>
      {upcoming.length === 0 ? <p className="muted">No upcoming bookings. <Link to="/">Find a hotel</Link></p> : upcoming.map((b) => <Card key={b._id} b={b} canCancel />)}
      <h2>Past &amp; cancelled</h2>
      {past.length === 0 ? <p className="muted">Nothing here yet.</p> : past.map((b) => <Card key={b._id} b={b} />)}
    </>
  );
}
