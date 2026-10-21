import { useEffect, useState } from 'react'
import { motion, animate } from 'framer-motion'
import { api, inr } from '../api'

const empty = { algorithm: 'random_forest', brand: '', model_name: '', variant_trim: '', vehicle_age_years: '', km_driven: '', fuel_type: '', transmission_type: '', owner_type: '', city: '' }

function Count({ to }) {
  const [v, setV] = useState(0)
  useEffect(() => { const c = animate(0, to, { duration: 1.1, ease: 'easeOut', onUpdate: setV }); return () => c.stop() }, [to])
  return <>{inr(v)}</>
}

export default function Predict() {
  const [opts, setOpts] = useState(null)
  const [f, setF] = useState(empty)
  const [res, setRes] = useState(null); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  useEffect(() => { api('/api/meta/options').then(setOpts).catch(() => setErr('Could not load form options. Is the backend running?')) }, [])
  const brands = opts ? Object.keys(opts.brands || {}) : []
  const models = opts && f.brand ? Object.keys(opts.brands[f.brand] || {}) : []
  const info = opts && f.brand && f.model_name ? opts.brands[f.brand]?.[f.model_name] : null
  const names = x => Array.isArray(x) ? x.map(i => i.name || i.fuel_type || i) : x ? Object.keys(x) : []
  const fuels = names(info?.fuel_types).length ? names(info.fuel_types) : opts?.fuel_types || []
  const trans = info?.transmission_types?.length ? info.transmission_types : opts?.transmission_types || []
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value, ...(k === 'brand' ? { model_name: '', variant_trim: '' } : {}), ...(k === 'model_name' ? { variant_trim: '' } : {}) }))
  const Sel = ({ k, label, list, req = true }) => <label>{label}<select value={f[k]} onChange={set(k)} required={req}><option value="">Select</option>{list.map(o => <option key={o}>{o}</option>)}</select></label>
  const submit = async e => {
    e.preventDefault(); setErr(''); setBusy(true)
    const body = Object.fromEntries(Object.entries(f).filter(([, v]) => v !== ''))
    try { setRes((await api('/api/predictions', { method: 'POST', body })).prediction) }
    catch (x) { setErr(x.status === 502 ? 'The price engine is waking up. Wait about 30 seconds and try again.' : x.message) }
    finally { setBusy(false) }
  }
  const r = res?.rangeInr
  return (
    <div className="wrap split">
      <form className="panel compact" onSubmit={submit}>
        <h2>Price a car</h2>
        <div className="fgrid">
          <Sel k="brand" label="Brand" list={brands} />
          <Sel k="model_name" label="Model" list={models} />
          <Sel k="variant_trim" label="Variant" list={info?.variants || []} req={false} />
          <label>Age (years)<input type="number" min="0" max="40" value={f.vehicle_age_years} onChange={set('vehicle_age_years')} required /></label>
          <label>Kms driven<input type="number" min="0" value={f.km_driven} onChange={set('km_driven')} required /></label>
          <Sel k="fuel_type" label="Fuel" list={fuels} />
          <Sel k="transmission_type" label="Gearbox" list={trans} />
          <Sel k="owner_type" label="Owner" list={opts?.owner_types || []} req={false} />
          <Sel k="city" label="City" list={opts?.cities || []} req={false} />
        </div>
        <div className="seg">{['random_forest', 'xgboost'].map(a => <button type="button" key={a} className={f.algorithm === a ? 'on' : ''} onClick={() => setF({ ...f, algorithm: a })}>{a === 'xgboost' ? 'XGBoost' : 'Random Forest'}</button>)}</div>
        {err && <div className="alert">{err}</div>}
        <button className="btn full" disabled={busy}>{busy ? 'Calculating…' : 'Get estimate'}</button>
      </form>
      <div className="panel result">
        {!res ? <div className="empty"><div className="ring" /><p className="muted">Your estimate appears here, with a price range and notes about the data.</p></div> :
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="muted">Estimated value</div>
            <div className="big"><Count to={res.predictedPriceInr} /></div>
            {r && <div className="range"><div className="track"><motion.i initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: .8 }} /><span style={{ left: ((res.predictedPriceInr - r.low) / (r.high - r.low) * 100) + '%' }} /></div>
              <div className="between"><span>{inr(r.low)}</span><span>{inr(r.high)}</span></div></div>}
            {res.warnings?.map(w => <div className="note" key={w}>{w}</div>)}
            {res.saved ? <p className="muted">Saved to your history.</p> : <p className="muted">Log in to save this valuation.</p>}
          </motion.div>}
      </div>
    </div>
  )
}
