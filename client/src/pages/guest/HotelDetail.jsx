import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, fmtDate, money } from '../../api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Stars, StarPicker } from '../../components/Stars.jsx';

const today = () => new Date().toISOString().slice(0, 10);

function RoomCard({ room }) {
  const { user } = useAuth();
  const nav = useNavigate();
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
  const [avail, setAvail] = useState(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  // real-time availability check whenever both dates are valid
  useEffect(() => {
    setAvail(null); setMsg('');
    if (!dates.checkIn || !dates.checkOut) return;
    if (dates.checkIn >= dates.checkOut) { setMsg('Check-out must be after check-in'); return; }
    api(`/rooms/${room._id}/availability?checkIn=${dates.checkIn}&checkOut=${dates.checkOut}`)
      .then(setAvail).catch((e) => setMsg(e.message));
  }, [dates.checkIn, dates.checkOut, room._id]);

  const book = async () => {
    if (!user) return nav('/login?role=guest');
    setBusy(true); setMsg('');
    try {
      const b = await api('/bookings', { method: 'POST', body: { roomId: room._id, ...dates } });
      nav(`/booking/${b._id}`);
    } catch (e) { setMsg(e.message); }
    setBusy(false);
  };

  return (
    <div className="card room">
      {room.images?.[0] ? <img src={room.images[0]} alt={room.type} /> : <img alt="" />}
      <div>
        <h3>{room.type}</h3>
        <div className="muted">👥 Up to {room.maxOccupancy} guests · 🛏 {room.bedType || '—'}</div>
        <div className="tags">{room.features?.map((x) => <span className="tag" key={x}>{x}</span>)}</div>
        <div className="date-row">
          <label>Check-in<input type="date" min={today()} value={dates.checkIn} onChange={(e) => setDates({ ...dates, checkIn: e.target.value })} /></label>
          <label>Check-out<input type="date" min={dates.checkIn || today()} value={dates.checkOut} onChange={(e) => setDates({ ...dates, checkOut: e.target.value })} /></label>
        </div>
        {avail && (avail.available
          ? <p className="success">✔ Available ({avail.left} left) · {avail.nights} night(s) · {money(avail.totalPrice)}</p>
          : <p className="error">✖ Sold out for these dates</p>)}
        {msg && <p className="error">{msg}</p>}
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className="price">{money(room.pricePerNight)}</div>
        <div className="muted">per night</div>
        <button className="btn" style={{ marginTop: '.5rem' }} disabled={!avail?.available || busy || user?.role === 'manager'} onClick={book}>
          {busy ? 'Booking…' : 'Book now'}
        </button>
      </div>
    </div>
  );
}

export default function HotelDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [rMsg, setRMsg] = useState('');
  const [contact, setContact] = useState({ name: user?.name || '', email: user?.email || '', message: '' });
  const [cMsg, setCMsg] = useState('');

  const load = () => api(`/hotels/${id}`).then(setData).catch((e) => setError(e.message));
  useEffect(() => { load(); }, [id]);

  const submitReview = async (e) => {
    e.preventDefault(); setRMsg('');
    try {
      await api('/reviews', { method: 'POST', body: { hotelId: id, ...review } });
      setReview({ rating: 5, comment: '' }); setRMsg('Thanks for your review!'); load();
    } catch (err) { setRMsg(err.message); }
  };

  const submitContact = async (e) => {
    e.preventDefault(); setCMsg('');
    try {
      await api('/inquiries', { method: 'POST', body: { hotelId: id, ...contact } });
      setContact({ ...contact, message: '' }); setCMsg('Your inquiry was sent. The hotel will get back to you.');
    } catch (err) { setCMsg(err.message); }
  };

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p className="muted">Loading…</p>;
  const { hotel, rooms, reviews, rating, reviewCount } = data;
  const [first, ...rest] = hotel.images || [];

  return (
    <>
      <h1>{hotel.name}</h1>
      <div className="row" style={{ marginBottom: '1rem' }}>
        <span className="muted">📍 {hotel.location}</span>
        <Stars value={rating} count={reviewCount} />
      </div>

      <div className="gallery">
        {first ? <img className="main" src={first} alt={hotel.name} /> : <div className="thumb main">🏨</div>}
        {rest.slice(0, 2).map((src) => <img key={src} src={src} alt="" />)}
        {hotel.video && <video className={rest.length < 2 ? '' : 'main'} src={hotel.video} controls style={{ gridColumn: 'span 2' }} />}
      </div>
      {rest.length > 2 && (
        <div className="media-list">{rest.slice(2).map((src) => <img key={src} src={src} alt="" />)}</div>
      )}

      <div className="card">
        <h2>About</h2>
        <p>{hotel.description}</p>
        <div className="tags">{hotel.amenities?.map((a) => <span className="tag" key={a}>{a}</span>)}</div>
      </div>

      <h2>Rooms</h2>
      {rooms.length === 0 ? <p className="muted">No rooms listed yet.</p> : rooms.map((r) => <RoomCard key={r._id} room={r} />)}

      <h2>Reviews</h2>
      <div className="card">
        {reviews.length === 0 && <p className="muted">No reviews yet.</p>}
        {reviews.map((r) => (
          <div key={r._id} style={{ borderBottom: '1px solid var(--line)', padding: '.5rem 0' }}>
            <Stars value={r.rating} /> <strong>{r.guest?.name || 'Guest'}</strong> <span className="muted">· {fmtDate(r.createdAt)}</span>
            <p style={{ margin: '.25rem 0' }}>{r.comment}</p>
          </div>
        ))}
      </div>

      {user?.role === 'guest' && (
        <form className="card" onSubmit={submitReview}>
          <h3>Write a review</h3>
          <StarPicker value={review.rating} onChange={(n) => setReview({ ...review, rating: n })} />
          <textarea placeholder="Share your experience…" value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} />
          {rMsg && <p className="success">{rMsg}</p>}
          <button className="btn">Submit review</button>
        </form>
      )}

      <h2>Contact the hotel</h2>
      {user?.role === 'manager' ? <p className="muted">Managers cannot send inquiries.</p> : (
        <form className="card" onSubmit={submitContact}>
          <div className="two">
            <label>Name<input required value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} /></label>
            <label>Email<input type="email" required value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} /></label>
          </div>
          <label>Message<textarea required value={contact.message} onChange={(e) => setContact({ ...contact, message: e.target.value })} /></label>
          {cMsg && <p className="success">{cMsg}</p>}
          <button className="btn">Send inquiry</button>
        </form>
      )}
    </>
  );
}
