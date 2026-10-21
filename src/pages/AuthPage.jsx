import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../auth.jsx'

export default function AuthPage({ mode }) {
  const reg = mode === 'register'
  const { login, register } = useAuth()
  const nav = useNavigate()
  const [f, setF] = useState({ name: '', email: '', password: '' })
  const [err, setErr] = useState(''); const [fe, setFe] = useState({}); const [busy, setBusy] = useState(false)
  const set = k => e => setF({ ...f, [k]: e.target.value })
  const submit = async e => {
    e.preventDefault(); setErr(''); setFe({}); setBusy(true)
    try { await (reg ? register(f) : login({ email: f.email, password: f.password })); nav('/dashboard') }
    catch (x) { setErr(x.message); if (Array.isArray(x.details)) setFe(Object.fromEntries(x.details.map(d => [d.field || d.path, d.message]))) }
    finally { setBusy(false) }
  }
  return (
    <div className="authWrap">
      <motion.div className="panel authCard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2>{reg ? 'Create your account' : 'Welcome back'}</h2>
        <p className="muted">{reg ? 'Save every valuation and track prices over time.' : 'Log in to see your saved valuations.'}</p>
        <form onSubmit={submit}>
          {reg && <label>Name<input value={f.name} onChange={set('name')} required autoComplete="name" />{fe.name && <small className="err">{fe.name}</small>}</label>}
          <label>Email<input type="email" value={f.email} onChange={set('email')} required autoComplete="email" />{fe.email && <small className="err">{fe.email}</small>}</label>
          <label>Password<input type="password" value={f.password} onChange={set('password')} required minLength={reg ? 8 : 1} autoComplete={reg ? 'new-password' : 'current-password'} />
            {reg && <small className="muted">8 or more characters</small>}{fe.password && <small className="err">{fe.password}</small>}</label>
          {err && <div className="alert">{err}</div>}
          <button className="btn full" disabled={busy}>{busy ? 'Please wait…' : reg ? 'Sign up' : 'Log in'}</button>
        </form>
        <p className="muted center">{reg ? <>Already registered? <Link to="/login">Log in</Link></> : <>New here? <Link to="/register">Create an account</Link></>}</p>
      </motion.div>
    </div>
  )
}
