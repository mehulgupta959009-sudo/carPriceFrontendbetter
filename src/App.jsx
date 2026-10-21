import { Routes, Route, NavLink, Link, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from './auth.jsx'
import Welcome from './pages/Welcome.jsx'
import AuthPage from './pages/AuthPage.jsx'
import Predict from './pages/Predict.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Explore from './pages/Explore.jsx'

const Guard = ({ children }) => { const { user, ready } = useAuth(); return !ready ? null : user ? children : <Navigate to="/login" replace /> }

export default function App() {
  const { user, logout } = useAuth()
  const loc = useLocation()
  const P = ({ children }) => <motion.main className="page" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .3 }}>{children}</motion.main>
  return (<>
    <header className="nav">
      <Link to="/" className="logo"><span className="dot" />Milestone</Link>
      <nav>
        <NavLink to="/predict">Price a car</NavLink>
        <NavLink to="/explore">Explore</NavLink>
        {user && <NavLink to="/dashboard">Dashboard</NavLink>}
      </nav>
      <div className="navr">
        {user ? <><span className="muted">Hi, {user.name?.split(' ')[0]}</span><button className="btn ghost sm" onClick={logout}>Log out</button></>
          : <><Link className="btn ghost sm" to="/login">Log in</Link><Link className="btn sm" to="/register">Sign up</Link></>}
      </div>
    </header>
    <AnimatePresence mode="wait">
      <Routes location={loc} key={loc.pathname}>
        <Route path="/" element={<P><Welcome /></P>} />
        <Route path="/login" element={<P><AuthPage mode="login" /></P>} />
        <Route path="/register" element={<P><AuthPage mode="register" /></P>} />
        <Route path="/predict" element={<P><Predict /></P>} />
        <Route path="/explore" element={<P><Explore /></P>} />
        <Route path="/dashboard" element={<P><Guard><Dashboard /></Guard></P>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  </>)
}
