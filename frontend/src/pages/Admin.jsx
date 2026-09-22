import { useEffect, useMemo, useState } from 'react'
import { API_BASE, createProduct, deleteProduct, fetchAdminDashboard, fetchAdminOrders, fetchAdminProducts, updateOrderStatus, updateProduct } from '../api'
import Loading from '../components/Loading'
import StatusPill from '../components/StatusPill'

const emptyProduct = { name: '', description: '', category: 'Seeds', sku: '', price: '', stockQuantity: 0, unit: 'pack', imageUrl: '', active: true }
const statusOptions = ['CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export default function Admin() {
  const [stats, setStats] = useState(null)
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyProduct)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setLoading(true); setError('')
    try {
      const [dashboard, productPage, orderData] = await Promise.all([
        fetchAdminDashboard(), fetchAdminProducts({ page: 0, size: 100, q: '' }), fetchAdminOrders()
      ])
      setStats(dashboard); setProducts(productPage.content || []); setOrders(orderData || [])
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  useEffect(() => { refresh() }, [])

  const saveProduct = async (e) => {
    e.preventDefault(); setError(''); setMessage('')
    try {
      const payload = {...form, price: Number(form.price), stockQuantity: Number(form.stockQuantity)}
      if (editing) await updateProduct(editing.id, payload); else await createProduct(payload)
      setMessage(editing ? 'Product updated.' : 'Product created.')
      setEditing(null); setForm(emptyProduct); refresh()
    } catch (err) { setError(err.message) }
  }

  const beginEdit = product => {
    setEditing(product); setForm({...product, active: product.active})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const remove = async id => {
    if (!window.confirm('Delete this product?')) return
    try { await deleteProduct(id); setMessage('Product deleted.'); refresh() } catch (err) { setError(err.message) }
  }

  const statusFor = order => statusOptions.filter(s => isValidNext(order.status, s))
  const lowStock = useMemo(() => products.filter(p => p.stockQuantity <= 10), [products])

  if (loading && !stats) return <div className="page-container"><Loading label="Loading admin console" /></div>

  return (
    <div className="page-container admin-page">
      <section className="dashboard-hero"><div><div className="eyebrow">ADMIN CONSOLE</div><h1>Control the supply operation.</h1><p>Manage the farm-supply catalog, monitor stock, and move orders through the fulfillment pipeline.</p></div><a className="btn btn-ghost" href={`${API_BASE.replace(/\/api$/, '')}/swagger-ui.html`} target="_blank" rel="noreferrer">Open Swagger UI ↗</a></section>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}
      <div className="metrics-grid admin-metrics">
        <Metric label="Products" value={stats?.totalProducts ?? 0} note="Catalog records" />
        <Metric label="Low stock" value={stats?.lowStockProducts ?? 0} note="≤ 10 units" />
        <Metric label="Orders" value={stats?.totalOrders ?? 0} note="All time" />
        <Metric label="Revenue" value={`₹${Number(stats?.revenue ?? 0).toLocaleString('en-IN')}`} note="Excluding cancelled" />
      </div>

      <section className="admin-grid">
        <div className="panel"><div className="panel-header"><div><div className="eyebrow">CATALOG</div><h2>{editing ? 'Edit product' : 'Add product'}</h2></div>{editing && <button className="btn btn-ghost btn-small" onClick={() => {setEditing(null); setForm(emptyProduct)}}>Cancel edit</button>}</div><form className="admin-form" onSubmit={saveProduct}><label>Name<input value={form.name} onChange={e => setForm({...form, name:e.target.value})} required /></label><label>Description<textarea value={form.description} onChange={e => setForm({...form, description:e.target.value})} required /></label><div className="two-col"><label>Category<input value={form.category} onChange={e => setForm({...form, category:e.target.value})} required /></label><label>SKU<input value={form.sku} onChange={e => setForm({...form, sku:e.target.value})} required /></label></div><div className="three-col"><label>Price<input type="number" min="0.01" step="0.01" value={form.price} onChange={e => setForm({...form, price:e.target.value})} required /></label><label>Stock<input type="number" min="0" value={form.stockQuantity} onChange={e => setForm({...form, stockQuantity:e.target.value})} required /></label><label>Unit<input value={form.unit} onChange={e => setForm({...form, unit:e.target.value})} required /></label></div><label>Image URL<input value={form.imageUrl || ''} onChange={e => setForm({...form, imageUrl:e.target.value})} /></label><label className="check-row"><input type="checkbox" checked={form.active !== false} onChange={e => setForm({...form, active:e.target.checked})} /> Active in catalog</label><button className="btn btn-primary btn-block">{editing ? 'Save changes' : 'Create product'}</button></form></div>
        <div className="panel"><div className="panel-header"><div><div className="eyebrow">STOCK WATCH</div><h2>Low-stock items</h2></div><span className="count-chip">{lowStock.length}</span></div><div className="low-stock-list">{lowStock.length === 0 ? <p className="muted">No low-stock alerts.</p> : lowStock.map(p => <div className="stock-row" key={p.id}><div><strong>{p.name}</strong><span>{p.sku}</span></div><b>{p.stockQuantity} {p.unit}</b><button className="btn btn-ghost btn-small" onClick={() => beginEdit(p)}>Update</button></div>)}</div></div>
      </section>

      <section className="panel"><div className="panel-header"><div><div className="eyebrow">PRODUCT MANAGEMENT</div><h2>Catalog records</h2></div><span className="count-chip">{products.length}</span></div><div className="table-wrap"><table><thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead><tbody>{products.map(p => <tr key={p.id}><td><strong>{p.name}</strong><span className="table-sub">{p.active ? 'Active' : 'Hidden'}</span></td><td>{p.sku}</td><td>{p.category}</td><td>₹{Number(p.price).toLocaleString('en-IN')}</td><td><span className={p.stockQuantity <= 10 ? 'stock-low' : ''}>{p.stockQuantity} {p.unit}</span></td><td><div className="table-actions"><button className="text-button" onClick={() => beginEdit(p)}>Edit</button><button className="text-button danger" onClick={() => remove(p.id)}>Delete</button></div></td></tr>)}</tbody></table></div></section>

      <section className="panel"><div className="panel-header"><div><div className="eyebrow">ORDER PIPELINE</div><h2>Fulfillment queue</h2></div><span className="count-chip">{orders.length}</span></div><div className="orders-stack compact">{orders.length === 0 ? <p className="muted">No orders yet.</p> : orders.map(order => <div className="admin-order" key={order.id}><div><strong>#{order.id.slice(-8).toUpperCase()}</strong><span>{order.buyerEmail} · {order.items.length} line(s)</span></div><StatusPill status={order.status} /><div className="admin-total">₹{Number(order.total).toLocaleString('en-IN')}</div><select value={order.status} onChange={async e => { try { await updateOrderStatus(order.id, e.target.value); setMessage('Order status updated.'); refresh() } catch(err) { setError(err.message) } }}>{[order.status, ...statusFor(order).filter(s => s !== order.status)].map(s => <option key={s} value={s}>{s}</option>)}</select></div>)}</div></section>

      <div className="status-summary">{Object.entries(stats?.ordersByStatus || {}).map(([status, count]) => <div key={status}><StatusPill status={status}/><strong>{count}</strong></div>)}</div>
    </div>
  )
}

function isValidNext(current, target) {
  const transitions = { PENDING: ['CONFIRMED','CANCELLED'], CONFIRMED: ['PACKED','CANCELLED'], PACKED: ['SHIPPED'], SHIPPED: ['DELIVERED'], DELIVERED: [], CANCELLED: [] }
  return (transitions[current] || []).includes(target)
}

function Metric({ label, value, note }) { return <div className="metric"><span>{label}</span><strong>{value}</strong><small>{note}</small></div> }
