import { useEffect, useState } from 'react';
import { api } from '../../api.js';

export default function HotelTab() {
  const [f, setF] = useState({ name: '', location: '', description: '', amenities: '', published: false });
  const [images, setImages] = useState([]);   // existing Cloudinary URLs
  const [video, setVideo] = useState('');
  const [newImages, setNewImages] = useState([]);
  const [newVideo, setNewVideo] = useState(null);
  const [msg, setMsg] = useState({ text: '', ok: true });
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fill = (h) => {
    if (!h) return;
    setF({ name: h.name, location: h.location, description: h.description || '', amenities: (h.amenities || []).join(', '), published: h.published });
    setImages(h.images || []); setVideo(h.video || '');
  };

  useEffect(() => { api('/hotels/mine').then(fill).finally(() => setLoaded(true)); }, []);

  const save = async (e) => {
    e.preventDefault(); setBusy(true); setMsg({ text: '' });
    const fd = new FormData();
    Object.entries(f).forEach(([k, v]) => fd.append(k, v));
    fd.append('keepImages', JSON.stringify(images));
    fd.append('keepVideo', video ? 'true' : 'false');
    newImages.forEach((file) => fd.append('images', file));
    if (newVideo) fd.append('video', newVideo);
    try {
      const h = await api('/hotels/mine', { method: 'PUT', form: fd });
      fill(h); setNewImages([]); setNewVideo(null);
      e.target.reset?.();
      setMsg({ text: 'Hotel saved ✔', ok: true });
    } catch (err) { setMsg({ text: err.message, ok: false }); }
    setBusy(false);
  };

  if (!loaded) return <p className="muted">Loading…</p>;

  return (
    <form className="card" onSubmit={save}>
      <h2>Hotel profile</h2>
      <div className="two">
        <label>Hotel name<input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
        <label>Location<input required value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} /></label>
      </div>
      <label>Description<textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></label>
      <label>Amenities (comma separated tags)
        <input placeholder="WiFi, Pool, Parking" value={f.amenities} onChange={(e) => setF({ ...f, amenities: e.target.value })} />
      </label>
      <div className="tags">{f.amenities.split(',').map((a) => a.trim()).filter(Boolean).map((a) => <span className="tag" key={a}>{a}</span>)}</div>

      <div>
        <strong>Images</strong>
        <div className="media-list">
          {images.map((src) => (
            <div className="item" key={src}>
              <img src={src} alt="" />
              <button type="button" className="x" onClick={() => setImages(images.filter((i) => i !== src))}>×</button>
            </div>
          ))}
        </div>
        <input type="file" accept="image/*" multiple onChange={(e) => setNewImages([...e.target.files])} />
      </div>

      <div>
        <strong>Video</strong>
        {video && (
          <div className="media-list">
            <div className="item"><video src={video} controls /><button type="button" className="x" onClick={() => setVideo('')}>×</button></div>
          </div>
        )}
        <input type="file" accept="video/*" onChange={(e) => setNewVideo(e.target.files[0] || null)} />
        <p className="muted">Uploading a new video replaces the current one.</p>
      </div>

      <label className="check">
        <input type="checkbox" checked={f.published} onChange={(e) => setF({ ...f, published: e.target.checked })} />
        Published (visible to guests)
      </label>
      {msg.text && <p className={msg.ok ? 'success' : 'error'}>{msg.text}</p>}
      <button className="btn" disabled={busy}>{busy ? 'Uploading & saving…' : 'Save hotel'}</button>
    </form>
  );
}
