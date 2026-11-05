import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const [params] = useSearchParams();
  const [role, setRole] = useState(params.get('role') === 'manager' ? 'manager' : 'guest');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const data = await api('/auth/register', { method: 'POST', body: { ...form, role } });
      login(data);
      nav(data.user.role === 'manager' ? '/manager' : '/');
    } catch (err) { setError(err.message); }
    setBusy(false);
  };

  return (
    <div className="card auth">
      <h2>Create your account</h2>
      <div className="tabs">
        <button className={role === 'guest' ? 'active' : ''} onClick={() => setRole('guest')}>I'm a Guest</button>
        <button className={role === 'manager' ? 'active' : ''} onClick={() => setRole('manager')}>I'm a Hotel Manager</button>
      </div>
      <form onSubmit={submit}>
        <label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label>Password<input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Creating…' : `Sign up as ${role}`}</button>
      </form>
      <p className="muted">Already registered? <Link to={`/login?role=${role}`}>Login</Link></p>
    </div>
  );
}
