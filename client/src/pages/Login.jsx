import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [params] = useSearchParams();
  const [role, setRole] = useState(params.get('role') === 'manager' ? 'manager' : 'guest');
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const data = await api('/auth/login', { method: 'POST', body: { ...form, role } });
      login(data);
      nav(data.user.role === 'manager' ? '/manager' : '/');
    } catch (err) { setError(err.message); }
    setBusy(false);
  };

  return (
    <div className="card auth">
      <h2>Welcome back</h2>
      <div className="tabs">
        <button className={role === 'guest' ? 'active' : ''} onClick={() => setRole('guest')}>Guest</button>
        <button className={role === 'manager' ? 'active' : ''} onClick={() => setRole('manager')}>Hotel Manager</button>
      </div>
      <form onSubmit={submit}>
        <label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label>Password<input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Logging in…' : `Login as ${role}`}</button>
      </form>
      <p className="muted">New here? <Link to={`/register?role=${role}`}>Create an account</Link></p>
    </div>
  );
}
