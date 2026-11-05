import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money } from '../../api.js';
import { Stars } from '../../components/Stars.jsx';

export default function Home() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [f, setF] = useState({ search: '', minPrice: '', maxPrice: '', amenities: '' });

  const load = async (filters = f) => {
    setLoading(true); setError('');
    const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v)).toString();
    try { setHotels(await api('/hotels' + (qs ? `?${qs}` : ''))); }
    catch (e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const submit = (e) => { e.preventDefault(); load(); };
  const reset = () => {
    const empty = { search: '', minPrice: '', maxPrice: '', amenities: '' };
    setF(empty); load(empty);
  };

  return (
    <>
      <h1>Find your perfect stay</h1>
      <form className="card filters" onSubmit={submit}>
        <label>Hotel or location
          <input placeholder="e.g. Kochi" value={f.search} onChange={(e) => setF({ ...f, search: e.target.value })} />
        </label>
        <label>Min ₹/night
          <input type="number" min="0" value={f.minPrice} onChange={(e) => setF({ ...f, minPrice: e.target.value })} />
        </label>
        <label>Max ₹/night
          <input type="number" min="0" value={f.maxPrice} onChange={(e) => setF({ ...f, maxPrice: e.target.value })} />
        </label>
        <label>Amenities (comma separated)
          <input placeholder="WiFi, Pool" value={f.amenities} onChange={(e) => setF({ ...f, amenities: e.target.value })} />
        </label>
        <div style={{ display: 'flex', gap: '.4rem' }}>
          <button className="btn">Search</button>
          <button type="button" className="btn ghost" onClick={reset}>Reset</button>
        </div>
      </form>

      {error && <p className="error">{error}</p>}
      {loading ? <p className="muted">Loading hotels…</p> : hotels.length === 0 ? (
        <p className="muted">No hotels match your search.</p>
      ) : (
        <div className="grid">
          {hotels.map((h) => (
            <Link to={`/hotels/${h._id}`} key={h._id} className="card hotel-card">
              {h.images?.[0] ? <img className="thumb" src={h.images[0]} alt={h.name} /> : <div className="thumb">🏨</div>}
              <div className="body">
                <h3>{h.name}</h3>
                <div className="muted">📍 {h.location}</div>
                <Stars value={h.rating} count={h.reviewCount} />
                <div className="tags">{h.amenities?.slice(0, 3).map((a) => <span className="tag" key={a}>{a}</span>)}</div>
                <div>
                  {h.minPrice !== null
                    ? <><span className="price">{money(h.minPrice)}</span>{h.maxPrice !== h.minPrice && <span className="muted"> – {money(h.maxPrice)}</span>} <span className="muted">/ night</span></>
                    : <span className="muted">Rooms coming soon</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
