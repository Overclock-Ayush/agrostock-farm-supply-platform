import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setError(''); setBusy(true)
    try { await register(form.name, form.email, form.password); navigate('/dashboard', { replace: true }) }
    catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <div className="eyebrow">GET STARTED</div>
        <h1>Create a buyer account</h1>
        <p>Start browsing farm supplies and place your first test order in minutes.</p>
        {error && <div className="alert alert-error">{error}</div>}
        <label>Name<input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Your name" maxLength={80} /></label>
        <label>Email<input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="you@company.com" /></label>
        <label>Password<input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={8} placeholder="At least 8 characters" /></label>
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
        <div className="auth-switch">Already registered? <Link to="/login">Sign in</Link></div>
      </form>
    </div>
  )
}
