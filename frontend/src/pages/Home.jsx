import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { isAuthenticated, user } = useAuth()

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">AGRI-TECH OPERATIONS PLATFORM</div>
          <h1>Move farm supplies from <span>stockroom to field</span> without the spreadsheet chaos.</h1>
          <p className="hero-text">AgroStock combines catalog, inventory, secure buyer access, and transactional order processing into one practical platform for an agricultural supply business.</p>
          <div className="hero-actions">
            <Link className="btn btn-primary btn-large" to="/products">Explore catalog →</Link>
            {!isAuthenticated && <Link className="btn btn-ghost btn-large" to="/register">Start with an account</Link>}
            {isAuthenticated && <Link className="btn btn-ghost btn-large" to="/dashboard">Open dashboard</Link>}
          </div>
          <div className="hero-meta"><span>✓ JWT + role-based access</span><span>✓ MongoDB Atlas</span><span>✓ Redis caching</span></div>
        </div>
        <div className="hero-visual">
          <div className="glass-card main-card">
            <div className="card-topline"><span>Live inventory health</span><span className="pulse">● Online</span></div>
            <div className="inventory-ring">84<span>%</span></div>
            <div className="inventory-caption">Healthy stock coverage</div>
            <div className="mini-bars">
              <div><span>Seeds</span><b style={{width: '88%'}} /></div>
              <div><span>Fertilizer</span><b style={{width: '72%'}} /></div>
              <div><span>Irrigation</span><b style={{width: '64%'}} /></div>
              <div><span>Smart farming</span><b style={{width: '53%'}} /></div>
            </div>
          </div>
          <div className="glass-card floating-card"><span className="floating-icon">↗</span><div><strong>Atomic stock updates</strong><small>Order accepted → inventory decremented</small></div></div>
        </div>
      </section>

      <section className="feature-grid">
        <article className="feature-card"><div className="feature-num">01</div><h3>Secure access</h3><p>JWT authentication and Spring Security keep buyer and admin workflows separated.</p></article>
        <article className="feature-card"><div className="feature-num">02</div><h3>Inventory integrity</h3><p>MongoDB-backed inventory uses transactional order processing and guarded stock updates.</p></article>
        <article className="feature-card"><div className="feature-num">03</div><h3>Fast catalog reads</h3><p>Redis caching accelerates frequently viewed product details while updates evict stale entries.</p></article>
        <article className="feature-card"><div className="feature-num">04</div><h3>API-first design</h3><p>REST endpoints are documented with Swagger/OpenAPI and are ready for interview walkthroughs.</p></article>
      </section>

      <section className="stack-strip">
        <div className="stack-label">Built to showcase</div>
        <div className="stack-tags"><span>Java 21</span><span>Spring Boot</span><span>MongoDB Atlas</span><span>Spring Security</span><span>JWT</span><span>Redis</span><span>Docker</span><span>React</span><span>Swagger</span></div>
      </section>

      <section className="recruiter-note">
        <div><div className="eyebrow">INTERVIEW-READY DETAIL</div><h2>Designed around a believable farm-supply business workflow.</h2></div>
        <p>Use the demo buyer account to place orders, or switch to the admin dashboard to inspect products, low-stock signals, order status transitions, and revenue metrics.</p>
      </section>
    </div>
  )
}
