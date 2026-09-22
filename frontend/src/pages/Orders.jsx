import { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { fetchMyOrders } from '../api'
import Loading from '../components/Loading'
import EmptyState from '../components/EmptyState'
import StatusPill from '../components/StatusPill'
import SectionTitle from '../components/SectionTitle'

export default function Orders() {
  const location = useLocation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMyOrders().then(setOrders).catch(err => setError(err.message)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-container">
      <SectionTitle eyebrow="MY ORDERS" title="Orders, without the paperwork.">
        <Link className="btn btn-primary" to="/products">New order</Link>
      </SectionTitle>
      {location.state?.createdOrderId && <div className="alert alert-success">Order <strong>#{location.state.createdOrderId.slice(-6)}</strong> was created successfully.</div>}
      {error && <div className="alert alert-error">{error}</div>}
      {loading ? <Loading label="Loading orders" /> : orders.length === 0 ? <EmptyState title="No orders yet" text="Your next order will appear here after checkout." action={<Link className="btn btn-primary" to="/products">Browse products</Link>} /> : (
        <div className="orders-stack">
          {orders.map(order => <OrderCard key={order.id} order={order} />)}
        </div>
      )}
    </div>
  )
}

function OrderCard({ order }) {
  return (
    <article className="order-card">
      <div className="order-head"><div><span className="muted">Order</span><strong>#{order.id.slice(-8).toUpperCase()}</strong></div><StatusPill status={order.status} /><div><span className="muted">Placed</span><strong>{new Date(order.createdAt).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'})}</strong></div><div><span className="muted">Total</span><strong>₹{Number(order.total).toLocaleString('en-IN')}</strong></div></div>
      <div className="order-body"><div>{order.items.map(item => <div className="order-line" key={item.sku}><span>{item.productName} × {item.quantity}</span><b>₹{Number(item.lineTotal).toLocaleString('en-IN')}</b></div>)}</div><div className="address-box"><span className="muted">Deliver to</span><div>{order.shippingAddress.line1}, {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.postalCode}</div></div></div>
    </article>
  )
}
