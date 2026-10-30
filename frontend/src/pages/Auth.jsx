import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Auth({ mode }) {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const isLogin = mode === 'login';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (isLogin) await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) { setError(err.message); setBusy(false); }
  };

  return (
    <div className="auth">
      <form onSubmit={submit} className="card">
        <h1>{isLogin ? 'Sign in to TaskHub' : 'Create your account'}</h1>
        {!isLogin && <label>Name<input value={form.name} onChange={set('name')} required autoFocus /></label>}
        <label>Email<input type="email" value={form.email} onChange={set('email')} required autoFocus={isLogin} /></label>
        <label>Password<input type="password" minLength={6} value={form.password} onChange={set('password')} required /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="primary" disabled={busy}>{isLogin ? 'Sign in' : 'Create account'}</button>
        <p className="hint">
          {isLogin ? <>New here? <Link to="/register">Create an account</Link></> : <>Already registered? <Link to="/login">Sign in</Link></>}
        </p>
      </form>
    </div>
  );
}
