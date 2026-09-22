import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Dashboard() {
  const { user } = useAuth()
  const { count } = useCart()
  const isAdmin = user.role === 'ADMIN'

  return (
    <div className="page-container">
      <section className="dashboard-hero"><div><div className="eyebrow">{isAdmin ? 'OPERATIONS CONSOLE' : 'BUYER DASHBOARD'}</div><h1>Good to see you, {user.name.split(' ')[0]}.</h1><p>{isAdmin ? 'Monitor the supply operation, catalog health and order pipeline.' : 'Browse farm supplies, keep an eye on your cart, and track orders.'}</p></div>{isAdmin ? <Link className="btn btn-primary" to="/admin">Open admin console →</Link> : <Link className="btn btn-primary" to="/products">Browse catalog →</Link>}</section>
      <div className="metrics-grid">
        <Metric label="Access level" value={user.role} note="JWT authenticated" />
        <Metric label={isAdmin ? 'Operations' : 'Cart items'} value={isAdmin ? 'Admin' : count} note={isAdmin ? 'Protected workflows' : 'Saved locally'} />
        <Metric label="API mode" value="REST" note="Spring Boot backend" />
        <Metric label="Data layer" value="MongoDB" note="Atlas-ready" />
      </div>
      <section className="panel dashboard-panel"><div className="panel-header"><div><div className="eyebrow">ARCHITECTURE SNAPSHOT</div><h2>What this project demonstrates</h2></div></div><div className="architecture-grid"><Arch title="Secure API" text="JWT, Spring Security, role-based authorization, validation and centralized error handling." /><Arch title="Inventory" text="MongoDB stock records with guarded atomic decrements inside transactional order workflows." /><Arch title="Performance" text="Redis caches hot product reads and invalidates stale entries after catalog updates." /><Arch title="Operations" text="Admin metrics, order state transitions and low-stock visibility in one console." /></div></section>
    </div>
  )
}

function Metric({ label, value, note }) { return <div className="metric"><span>{label}</span><strong>{value}</strong><small>{note}</small></div> }
function Arch({ title, text }) { return <div className="arch"><span>✦</span><div><h3>{title}</h3><p>{text}</p></div></div> }
