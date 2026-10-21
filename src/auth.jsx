import { createContext, useContext, useEffect, useState } from 'react'
import { api } from './api'
const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)
  const out = () => { localStorage.removeItem('token'); setUser(null) }
  useEffect(() => {
    window.addEventListener('logout', out)
    if (!localStorage.getItem('token')) setReady(true)
    else api('/api/auth/me').then(d => setUser(d.user)).catch(out).finally(() => setReady(true))
    return () => window.removeEventListener('logout', out)
  }, [])
  const auth = async (mode, body) => {
    const d = await api('/api/auth/' + mode, { method: 'POST', body })
    localStorage.setItem('token', d.token); setUser(d.user)
  }
  return <Ctx.Provider value={{ user, ready, login: b => auth('login', b), register: b => auth('register', b), logout: out }}>{children}</Ctx.Provider>
}
