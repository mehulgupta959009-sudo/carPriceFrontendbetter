import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from 'recharts'
import { api, inr, lakh } from '../api'

const tip = { background: '#121826', border: '1px solid #26324a', borderRadius: 8, color: '#e8ecf5' }
export default function Dashboard() {
  const [s, setS] = useState(null); const [h, setH] = useState(null); const [page, setPage] = useState(1)
  useEffect(() => { api('/api/predictions/stats').then(setS).catch(() => setS({})) }, [])
  useEffect(() => { api(`/api/predictions?page=${page}&limit=6`).then(setH).catch(() => setH({ items: [] })) }, [page])
  const t = s?.totals || {}
  const brands = (s?.byBrand || []).map(b => ({ name: b.brand || b._id || b.name, value: b.count ?? b.total ?? 0 }))
  const line = (s?.timeline || []).map(d => ({ date: String(d.date || d._id).slice(5, 10), value: d.avgPrice ?? d.avgPriceInr ?? d.count ?? 0 }))
  const cards = Object.entries(t).slice(0, 4)
  const del = async id => { await api('/api/predictions/' + id, { method: 'DELETE' }); setH({ ...h, items: h.items.filter(i => (i.id || i._id) !== id) }) }
  return (
    <div className="wrap">
      <h2>Your dashboard</h2>
      <div className="grid4">{cards.map(([k, v], i) => <motion.div key={k} className="panel stat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .06 }}>
        <span className="muted">{k.replace(/([A-Z])/g, ' $1').toLowerCase()}</span><b>{typeof v === 'number' && v > 9999 ? lakh(v) : v}</b></motion.div>)}</div>
      <div className="grid2">
        <div className="panel"><h3>Price trend, last 90 days</h3><div className="chart">
          {line.length ? <ResponsiveContainer><AreaChart data={line}><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ffb020" stopOpacity=".5" /><stop offset="100%" stopColor="#ffb020" stopOpacity="0" /></linearGradient></defs>
            <CartesianGrid stroke="#1c2538" vertical={false} /><XAxis dataKey="date" stroke="#6b7a99" /><YAxis stroke="#6b7a99" tickFormatter={lakh} width={60} /><Tooltip contentStyle={tip} /><Area dataKey="value" stroke="#ffb020" fill="url(#g)" strokeWidth={2} /></AreaChart></ResponsiveContainer>
            : <p className="muted empty">Run a valuation to start your trend line.</p>}</div></div>
        <div className="panel"><h3>Valuations by brand</h3><div className="chart">
          {brands.length ? <ResponsiveContainer><BarChart data={brands}><CartesianGrid stroke="#1c2538" vertical={false} /><XAxis dataKey="name" stroke="#6b7a99" /><YAxis stroke="#6b7a99" allowDecimals={false} width={30} /><Tooltip contentStyle={tip} /><Bar dataKey="value" fill="#2dd4bf" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer>
            : <p className="muted empty">No brands yet.</p>}</div></div>
      </div>
      <div className="panel"><div className="between"><h3>History</h3><Link className="btn sm" to="/predict">New valuation</Link></div>
        {h?.items?.length ? <table><thead><tr><th>Car</th><th>Price</th><th>Date</th><th /></tr></thead><tbody>{h.items.map(p => { const id = p.id || p._id; return <tr key={id}>
          <td>{p.input?.brand} {p.input?.model_name}<span className="muted"> · {p.input?.vehicle_age_years} yrs</span></td><td>{inr(p.predictedPriceInr)}</td><td className="muted">{new Date(p.createdAt).toLocaleDateString()}</td>
          <td><button className="btn ghost sm" onClick={() => del(id)}>Delete</button></td></tr> })}</tbody></table> : <p className="muted empty">No valuations saved yet.</p>}
        {h?.totalPages > 1 && <div className="row"><button className="btn ghost sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span className="muted">Page {page} of {h.totalPages}</span><button className="btn ghost sm" disabled={page >= h.totalPages} onClick={() => setPage(page + 1)}>Next</button></div>}
      </div>
    </div>
  )
}
