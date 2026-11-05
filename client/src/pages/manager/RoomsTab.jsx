import { useEffect, useState } from 'react';
import { api, money } from '../../api.js';

const blank = { type: '', pricePerNight: '', maxOccupancy: 2, bedType: '', features: '', totalRooms: 1 };

export default function RoomsTab() {
  const [rooms, setRooms] = useState([]);
  const [f, setF] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [msg, setMsg] = useState({ text: '', ok: true });
  const [busy, setBusy] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const load = () => api('/rooms/mine').then(setRooms).catch((e) => setMsg({ text: e.message, ok: false }));
  useEffect(() => { load(); }, []);

  const reset = () => { setF(blank); setEditing(null); setImages([]); setFiles([]); setFormKey((k) => k + 1); };

  const edit = (r) => {
    setEditing(r._id);
    setF({ type: r.type, pricePerNight: r.pricePerNight, maxOccupancy: r.maxOccupancy, bedType: r.bedType || '', features: (r.features || []).join(', '), totalRooms: r.totalRooms });
    setImages(r.images || []); setFiles([]); setFormKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const save = async (e) => {
    e.preventDefault(); setBusy(true); setMsg({ text: '' });
    const fd = new FormData();
    Object.entries(f).forEach(([k, v]) => fd.append(k, v));
    if (editing) fd.append('keepImages', JSON.stringify(images));
    files.forEach((file) => fd.append('images', file));
    try {
      await api(editing ? `/rooms/${editing}` : '/rooms', { method: editing ? 'PUT' : 'POST', form: fd });
      reset(); load(); setMsg({ text: 'Room saved ✔', ok: true });
    } catch (err) { setMsg({ text: err.message, ok: false }); }
    setBusy(false);
  };

  const remove = async (id) => {
    if (!confirm('Delete this room type?')) return;
    try { await api(`/rooms/${id}`, { method: 'DELETE' }); load(); }
    catch (err) { setMsg({ text: err.message, ok: false }); }
  };

  return (
    <>
      <form className="card" onSubmit={save} key={formKey}>
        <h2>{editing ? 'Edit room' : 'Add a room type'}</h2>
        <div className="two">
          <label>Room type<input required placeholder="Deluxe Room" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })} /></label>
          <label>Price per night (₹)<input type="number" min="0" required value={f.pricePerNight} onChange={(e) => setF({ ...f, pricePerNight: e.target.value })} /></label>
          <label>Max occupancy<input type="number" min="1" value={f.maxOccupancy} onChange={(e) => setF({ ...f, maxOccupancy: e.target.value })} /></label>
          <label>Bed type<input placeholder="King" value={f.bedType} onChange={(e) => setF({ ...f, bedType: e.target.value })} /></label>
          <label>Rooms available of this type<input type="number" min="1" value={f.totalRooms} onChange={(e) => setF({ ...f, totalRooms: e.target.value })} /></label>
          <label>Features (comma separated)<input placeholder="AC, Balcony" value={f.features} onChange={(e) => setF({ ...f, features: e.target.value })} /></label>
        </div>
        {editing && (
          <div className="media-list">
            {images.map((src) => (
              <div className="item" key={src}><img src={src} alt="" /><button type="button" className="x" onClick={() => setImages(images.filter((i) => i !== src))}>×</button></div>
            ))}
          </div>
        )}
        <label>Room images<input type="file" accept="image/*" multiple onChange={(e) => setFiles([...e.target.files])} /></label>
        {msg.text && <p className={msg.ok ? 'success' : 'error'}>{msg.text}</p>}
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <button className="btn" disabled={busy}>{busy ? 'Saving…' : editing ? 'Update room' : 'Add room'}</button>
          {editing && <button type="button" className="btn ghost" onClick={reset}>Cancel</button>}
        </div>
      </form>

      <h2>Your rooms</h2>
      {rooms.length === 0 && <p className="muted">No rooms yet. (Create your hotel profile first.)</p>}
      {rooms.map((r) => (
        <div className="card row" key={r._id}>
          <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
            {r.images?.[0] && <img src={r.images[0]} alt="" style={{ width: 90, height: 65, objectFit: 'cover', borderRadius: 6 }} />}
            <div>
              <strong>{r.type}</strong> — {money(r.pricePerNight)}/night
              <div className="muted">{r.totalRooms} available · up to {r.maxOccupancy} guests · {r.bedType}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '.4rem' }}>
            <button className="btn small ghost" onClick={() => edit(r)}>Edit</button>
            <button className="btn small danger" onClick={() => remove(r._id)}>Delete</button>
          </div>
        </div>
      ))}
    </>
  );
}
