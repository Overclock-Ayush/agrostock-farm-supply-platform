import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createOrder } from '../api'
import { useCart } from '../context/CartContext'
import EmptyState from '../components/EmptyState'

export default function Cart() {
  const { items, subtotal, setQuantity, remove, clear } = useCart()
  const navigate = useNavigate()
  const [address, setAddress] = useState({ line1: '', city: '', state: '', postalCode: '', country: 'India' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const shipping = subtotal >= 1500 ? 0 : 79
  const total = subtotal + shipping

  if (items.length === 0) {
    return <div className="page-container"><EmptyState title="Your cart is ready for harvest" text="Add a few farm supplies from the catalog to create a test order." action={<Link className="btn btn-primary" to="/products">Browse catalog</Link>} /></div>
  }

  const checkout = async (e) => {
    e.preventDefault(); setError(''); setBusy(true)
    try {
      const order = await createOrder({
        items: items.map(item => ({ productId: item.id, quantity: item.quantity })),
        shippingAddress: address
      })
      clear(); navigate('/orders', { state: { createdOrderId: order.id } })
    } catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }

  return (
    <div className="page-container">
      <div className="section-heading"><div><div className="eyebrow">CHECKOUT</div><h1>Build your next farm order.</h1></div><Link to="/products" className="btn btn-ghost">Continue shopping</Link></div>
      <div className="checkout-grid">
        <section className="panel">
          <h2>Cart items</h2>
          <div className="cart-list">
            {items.map(item => (
              <div className="cart-item" key={item.id}>
                <div className="cart-thumb">{item.imageUrl ? <img src={item.imageUrl} alt="" /> : '🌱'}</div>
                <div className="cart-info"><strong>{item.name}</strong><span>{item.sku} · ₹{Number(item.price).toLocaleString('en-IN')} / {item.unit}</span></div>
                <div className="qty"><button onClick={() => setQuantity(item.id, item.quantity - 1)}>−</button><span>{item.quantity}</span><button onClick={() => setQuantity(item.id, item.quantity + 1)}>+</button></div>
                <div className="cart-line">₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}</div>
                <button className="icon-button" onClick={() => remove(item.id)} aria-label="Remove">×</button>
              </div>
            ))}
          </div>
        </section>

        <form className="panel summary-panel" onSubmit={checkout}>
          <h2>Delivery details</h2>
          {error && <div className="alert alert-error">{error}</div>}
          <label>Address<input value={address.line1} onChange={e => setAddress({...address, line1: e.target.value})} required placeholder="Farm / office address" /></label>
          <div className="two-col"><label>City<input value={address.city} onChange={e => setAddress({...address, city: e.target.value})} required /></label><label>State<input value={address.state} onChange={e => setAddress({...address, state: e.target.value})} required /></label></div>
          <div className="two-col"><label>Postal code<input value={address.postalCode} onChange={e => setAddress({...address, postalCode: e.target.value})} required /></label><label>Country<input value={address.country} onChange={e => setAddress({...address, country: e.target.value})} required /></label></div>
          <div className="summary-lines"><div><span>Subtotal</span><b>₹{subtotal.toLocaleString('en-IN')}</b></div><div><span>Shipping</span><b>{shipping === 0 ? 'FREE' : `₹${shipping}`}</b></div><div className="summary-total"><span>Total</span><b>₹{total.toLocaleString('en-IN')}</b></div></div>
          <button className="btn btn-primary btn-block btn-large" disabled={busy}>{busy ? 'Placing order…' : 'Place order'}</button>
          <small className="muted">Orders are validated against live inventory before creation.</small>
        </form>
      </div>
    </div>
  )
}
