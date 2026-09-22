import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchProducts } from '../api'
import { useCart } from '../context/CartContext'
import Loading from '../components/Loading'
import EmptyState from '../components/EmptyState'
import SectionTitle from '../components/SectionTitle'

const categories = ['Seeds', 'Fertilizers', 'Irrigation', 'Smart Farming', 'Farm Tools']

export default function Products() {
  const { add } = useCart()
  const [data, setData] = useState({ content: [], totalPages: 0, number: 0 })
  const [filters, setFilters] = useState({ q: '', category: '', sortBy: 'createdAt', direction: 'desc' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async (page = 0) => {
    setLoading(true); setError('')
    try { setData(await fetchProducts({...filters, page, size: 9})) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load(0) }, [filters.category, filters.sortBy, filters.direction])

  return (
    <div className="page-container">
      <SectionTitle eyebrow="CATALOG" title="Farm supplies that keep the field moving.">
        <Link to="/cart" className="btn btn-ghost">View cart</Link>
      </SectionTitle>

      <div className="filter-bar">
        <input value={filters.q} onChange={e => setFilters({...filters, q: e.target.value})} onKeyDown={e => e.key === 'Enter' && load(0)} placeholder="Search seeds, tools, fertilizer…" />
        <select value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})}><option value="">All categories</option>{categories.map(c => <option key={c}>{c}</option>)}</select>
        <select value={filters.sortBy} onChange={e => setFilters({...filters, sortBy: e.target.value})}><option value="createdAt">Newest</option><option value="name">Name</option><option value="price">Price</option><option value="stockQuantity">Stock</option></select>
        <select value={filters.direction} onChange={e => setFilters({...filters, direction: e.target.value})}><option value="desc">Descending</option><option value="asc">Ascending</option></select>
        <button className="btn btn-primary" onClick={() => load(0)}>Search</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? <Loading label="Loading catalog" /> : data.content.length === 0 ? <EmptyState title="No products match those filters" text="Try a broader search or select a different category." /> : (
        <>
          <div className="product-grid">
            {data.content.map(product => <ProductCard key={product.id} product={product} onAdd={() => add(product)} />)}
          </div>
          <div className="pagination">
            <button className="btn btn-ghost" disabled={data.number === 0} onClick={() => load(data.number - 1)}>← Previous</button>
            <span>Page {data.number + 1} of {Math.max(1, data.totalPages)}</span>
            <button className="btn btn-ghost" disabled={data.number + 1 >= data.totalPages} onClick={() => load(data.number + 1)}>Next →</button>
          </div>
        </>
      )}
    </div>
  )
}

function ProductCard({ product, onAdd }) {
  return (
    <article className="product-card">
      <div className="product-image-wrap">
        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <div className="product-image-fallback">🌾</div>}
        <span className="category-tag">{product.category}</span>
      </div>
      <div className="product-body">
        <div className="product-title-row"><h3>{product.name}</h3><span className="price">₹{Number(product.price).toLocaleString('en-IN')}</span></div>
        <p>{product.description}</p>
        <div className="product-meta"><span>SKU {product.sku}</span><span>{product.stockQuantity} {product.unit} available</span></div>
        <div className="product-actions"><Link className="text-link" to={`/products/${product.id}`}>Details</Link><button className="btn btn-primary btn-small" disabled={product.stockQuantity < 1} onClick={onAdd}>{product.stockQuantity < 1 ? 'Out of stock' : 'Add to cart'}</button></div>
      </div>
    </article>
  )
}
