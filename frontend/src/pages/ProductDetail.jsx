import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchProduct } from '../api'
import { useCart } from '../context/CartContext'
import Loading from '../components/Loading'

export default function ProductDetail() {
  const { id } = useParams()
  const { add } = useCart()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    fetchProduct(id).then(setProduct).catch(err => setError(err.message)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="page-container"><Loading label="Loading product" /></div>
  if (error || !product) return <div className="page-container"><div className="alert alert-error">{error || 'Product not found.'}</div><Link to="/products" className="btn btn-ghost">Back to catalog</Link></div>

  return (
    <div className="page-container">
      <div className="crumbs"><Link to="/products">Catalog</Link><span>/</span>{product.category}<span>/</span>{product.name}</div>
      <section className="detail-card">
        <div className="detail-image">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <div className="product-image-fallback">🌾</div>}</div>
        <div className="detail-copy">
          <span className="category-tag static">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="detail-description">{product.description}</p>
          <div className="detail-price">₹{Number(product.price).toLocaleString('en-IN')} <small>/ {product.unit}</small></div>
          <div className="detail-facts"><span><b>SKU</b>{product.sku}</span><span><b>Availability</b>{product.stockQuantity} {product.unit}</span></div>
          <div className="buy-row">
            <div className="qty"><button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button><span>{quantity}</span><button onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}>+</button></div>
            <button className="btn btn-primary btn-large" disabled={product.stockQuantity < 1} onClick={() => { add(product, quantity); navigate('/cart') }}>{product.stockQuantity < 1 ? 'Out of stock' : 'Add & view cart →'}</button>
          </div>
        </div>
      </section>
    </div>
  )
}
