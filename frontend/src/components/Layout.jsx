import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()

  const signOut = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-mark">✦</span>
          <span><strong>Agro</strong>Stock</span>
        </Link>
        <nav className="nav-links">
          <NavLink to="/products">Catalog</NavLink>
          {isAuthenticated && <NavLink to="/dashboard">Dashboard</NavLink>}
          {isAuthenticated && user.role === 'BUYER' && <NavLink to="/orders">Orders</NavLink>}
          {isAuthenticated && user.role === 'ADMIN' && <NavLink to="/admin">Admin</NavLink>}
          {isAuthenticated && user.role === 'BUYER' && <NavLink to="/cart">Cart <span className="nav-badge">{count}</span></NavLink>}
        </nav>
        <div className="topbar-actions">
          {isAuthenticated ? (
            <>
              <span className="user-chip">{user.name} · {user.role}</span>
              <button className="btn btn-ghost" onClick={signOut}>Sign out</button>
            </>
          ) : (
            <>
              <Link className="btn btn-ghost" to="/login">Sign in</Link>
              <Link className="btn btn-primary" to="/register">Create account</Link>
            </>
          )}
        </div>
      </header>

      <main className="main-content"><Outlet /></main>

      <footer className="footer">
        <div>
          <strong>AgroStock</strong><span className="dot">•</span> Farm Supply &amp; Inventory Platform
        </div>
        <div>Made by Ayush Sahu 2026</div>
      </footer>
    </div>
  )
}
