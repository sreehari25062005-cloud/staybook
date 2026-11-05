import { useEffect, useState } from 'react';
import { api, fmtDate, money } from '../../api.js';
import Status from '../../components/Status.jsx';
import { Stars } from '../../components/Stars.jsx';

function useLoad(path) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const load = () => api(path).then(setData).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);
  return [data, error, load];
}

export function BookingsTab() {
  const [bookings, error, reload] = useLoad('/bookings/hotel');
  const [err, setErr] = useState('');

  const setStatus = async (id, status) => {
    setErr('');
    try { await api(`/bookings/${id}/status`, { method: 'PATCH', body: { status } }); reload(); }
    catch (e) { setErr(e.message); }
  };

  if (!bookings) return <p className="muted">{error || 'Loading…'}</p>;
  return (
    <div className="card">
      <h2>Incoming bookings</h2>
      {err && <p className="error">{err}</p>}
      {bookings.length === 0 ? <p className="muted">No bookings yet.</p> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Guest</th><th>Room</th><th>Dates</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td>{b.guest?.name}<div className="muted">{b.guest?.email}</div></td>
                  <td>{b.room?.type}</td>
                  <td>{fmtDate(b.checkIn)} → {fmtDate(b.checkOut)}</td>
                  <td>{money(b.totalPrice)}</td>
                  <td><Status s={b.status} /></td>
                  <td>
                    {['pending', 'confirmed'].includes(b.status) && (
                      <div style={{ display: 'flex', gap: '.3rem' }}>
                        {b.status === 'pending' && <button className="btn small" onClick={() => setStatus(b._id, 'confirmed')}>Confirm</button>}
                        <button className="btn small danger" onClick={() => setStatus(b._id, 'cancelled')}>Cancel</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function ReviewsTab() {
  const [reviews, error] = useLoad('/reviews/mine');
  if (!reviews) return <p className="muted">{error || 'Loading…'}</p>;
  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;
  return (
    <div className="card">
      <h2>Guest reviews {avg && <span className="muted">· {avg} ★ average ({reviews.length})</span>}</h2>
      {reviews.length === 0 && <p className="muted">No reviews yet.</p>}
      {reviews.map((r) => (
        <div key={r._id} style={{ borderBottom: '1px solid var(--line)', padding: '.6rem 0' }}>
          <Stars value={r.rating} /> <strong>{r.guest?.name}</strong> <span className="muted">· {fmtDate(r.createdAt)}</span>
          <p style={{ margin: '.25rem 0' }}>{r.comment}</p>
        </div>
      ))}
    </div>
  );
}

export function InquiriesTab() {
  const [list, error] = useLoad('/inquiries/mine');
  if (!list) return <p className="muted">{error || 'Loading…'}</p>;
  return (
    <div className="card">
      <h2>Guest inquiries</h2>
      {list.length === 0 && <p className="muted">No inquiries yet.</p>}
      {list.map((i) => (
        <div key={i._id} style={{ borderBottom: '1px solid var(--line)', padding: '.6rem 0' }}>
          <strong>{i.name}</strong> · <a href={`mailto:${i.email}`}>{i.email}</a> <span className="muted">· {fmtDate(i.createdAt)}</span>
          <p style={{ margin: '.25rem 0' }}>{i.message}</p>
        </div>
      ))}
    </div>
  );
}
