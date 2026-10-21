import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

function Ticker() {
  const cars = [['Hyundai Creta', 1051133], ['Maruti Swift', 512000], ['Honda City', 784000], ['Tata Nexon', 903000], ['Kia Seltos', 1186000]]
  const [i, setI] = useState(0)
  useEffect(() => { const t = setInterval(() => setI(x => (x + 1) % cars.length), 2600); return () => clearInterval(t) }, [])
  const [name, p] = cars[i]
  return <motion.div key={i} className="ticker" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
    <span className="muted">{name}, 6 yrs, 60,000 km</span>
    <strong>₹{p.toLocaleString('en-IN')}</strong>
    <span className="band"><i style={{ width: '62%' }} /></span>
  </motion.div>
}

const features = [
  ['Honest price range', 'Every estimate comes with a low and high figure, so you know how much room there is to negotiate.'],
  ['Two models, your choice', 'Switch between Random Forest and XGBoost and see how much they agree.'],
  ['Your history, charted', 'Every valuation you run is saved with graphs of brands and price trends.'],
]

export default function Welcome() {
  return (<>
    <section className="hero">
      <div className="glow" />
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }}>
        <h1>Know what your car is worth before you talk price.</h1>
        <p className="lead">Enter a few details and get an instant used-car valuation in rupees, trained on thousands of real Indian listings.</p>
        <div className="row"><Link className="btn lg" to="/predict">Price my car</Link><Link className="btn ghost lg" to="/explore">Browse cars</Link></div>
      </motion.div>
      <motion.div className="panel heroCard" initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .25, duration: .6 }}>
        <div className="muted">Live example</div><Ticker />
        <div className="stats"><div><b>2</b><span>ML models</span></div><div><b>80%</b><span>range coverage</span></div><div><b>&lt;2s</b><span>per estimate</span></div></div>
      </motion.div>
    </section>
    <section className="wrap grid3">
      {features.map(([t, d], i) => <motion.div key={t} className="panel lift" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .1 }}><h3>{t}</h3><p className="muted">{d}</p></motion.div>)}
    </section>
    <section className="wrap cta panel"><h2>No account needed to try it.</h2><p className="muted">Sign up when you want to save valuations and see your dashboard.</p><Link className="btn" to="/register">Create free account</Link></section>
  </>)
}
