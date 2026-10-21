import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { api, inr } from '../api'
import { useAuth } from '../auth.jsx'

export default function Explore() {
  const { user } = useAuth()
  const [opts, setOpts] = useState(null); const [q, setQ] = useState(''); const [brand, setBrand] = useState('All')
  const [favs, setFavs] = useState(new Set()); const [recs, setRecs] = useState(null)
  useEffect(() => { api('/api/meta/options').then(setOpts).catch(() => setOpts({ brands: {} })) }, [])
  const loadRecs = () => user && api('/api/recommendations?limit=8').then(setRecs).catch(() => setRecs({ items: [] }))
  useEffect(() => { loadRecs() }, [user])
  const cars = useMemo(() => Object.entries(opts?.brands || {}).flatMap(([b, ms]) => Object.keys(ms).map(m => ({ brand: b, model_name: m }))), [opts])
  const list = cars.filter(c => (brand === 'All' || c.brand === brand) && `${c.brand} ${c.model_name}`.toLowerCase().includes(q.toLowerCase()))
  const track = (type, c) => user && api('/api/events', { method: 'POST', body: { type, car: { brand: c.brand, model_name: c.model_name } } }).then(() => type !== 'view' && loadRecs()).catch(() => {})
  const fav = c => { const k = c.brand + c.model_name; const on = favs.has(k); const n = new Set(favs); on ? n.delete(k) : n.add(k); setFavs(n); track(on ? 'unfavorite' : 'favorite', c) }
  const items = recs?.items || []
  return (
    <div className="wrap">
      <h2>Explore cars</h2>
      <section className="panel recs">
        <div className="between"><h3>Picked for you</h3>{!user && <Link className="btn sm" to="/login">Log in</Link>}</div>
        {!user ? <p className="muted">Log in and favourite a few cars. Recommendations will appear here.</p>
          : items.length ? <div className="rail">{items.map((c, i) => <motion.div className="rec" key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * .05 }}><b>{c.brand} {c.model_name}</b>{c.price_inr && <span>{inr(c.price_inr)}</span>}</motion.div>)}</div>
          : <div className="learn"><div className="pulse" /><p className="muted">Still learning your taste. Open and favourite a few cars below to get started.</p></div>}
      </section>
      <div className="filters">
        <input placeholder="Search brand or model" value={q} onChange={e => setQ(e.target.value)} />
        <div className="chips">{['All', ...Object.keys(opts?.brands || {})].map(b => <button key={b} className={brand === b ? 'on' : ''} onClick={() => setBrand(b)}>{b}</button>)}</div>
      </div>
      <motion.div layout className="cars">
        <AnimatePresence>{list.slice(0, 60).map(c => { const k = c.brand + c.model_name; return (
          <motion.div layout key={k} className="panel car lift" initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} onMouseEnter={() => track('view', c)}>
            <span className="muted">{c.brand}</span><b>{c.model_name}</b>
            <div className="between"><Link className="btn ghost sm" to="/predict">Price it</Link>
              <button aria-label="Favourite" className={'heart' + (favs.has(k) ? ' on' : '')} onClick={() => fav(c)}>{favs.has(k) ? '♥' : '♡'}</button></div>
          </motion.div>) })}</AnimatePresence>
      </motion.div>
      {!list.length && <p className="muted empty">No cars match your search.</p>}
    </div>
  )
}
