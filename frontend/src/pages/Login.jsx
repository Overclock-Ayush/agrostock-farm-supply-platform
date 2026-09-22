import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setError(''); setBusy(true)
    try {
      await login(form.email, form.password)
      navigate(location.state?.from || '/dashboard', { replace: true })
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <div className="eyebrow">WELCOME BACK</div>
        <h1>Sign in to AgroStock</h1>
        <p>Use a demo account from the project README or register a fresh buyer account.</p>
        {error && <div className="alert alert-error">{error}</div>}
        <label>Email<input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="you@company.com" /></label>
        <label>Password<input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required placeholder="••••••••" /></label>
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <div className="auth-switch">New here? <Link to="/register">Create a buyer account</Link></div>
      </form>
    </div>
  )
}
