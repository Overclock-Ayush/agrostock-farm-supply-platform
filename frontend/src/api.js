export const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/$/, '')

export function getToken() {
  return localStorage.getItem('agrostock_token')
}

export async function apiFetch(path, options = {}) {
  const token = getToken()
  const headers = new Headers(options.headers || {})
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const text = await response.text()
  let data = null
  if (text) {
    try { data = JSON.parse(text) } catch { data = text }
  }

  if (!response.ok) {
    const message = data?.message || data?.error || 'Request failed.'
    const error = new Error(message)
    error.status = response.status
    error.payload = data
    throw error
  }
  return data
}

export async function login(email, password) {
  return apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
}

export async function register(name, email, password) {
  return apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) })
}

export async function fetchProducts(params = {}) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') qs.set(key, value)
  })
  return apiFetch(`/products?${qs.toString()}`)
}

export async function fetchProduct(id) {
  return apiFetch(`/products/${id}`)
}

export async function fetchAdminProducts(params = {}) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== '') qs.set(key, value) })
  return apiFetch(`/products/admin/all?${qs.toString()}`)
}

export async function createOrder(payload) {
  return apiFetch('/orders', { method: 'POST', body: JSON.stringify(payload) })
}

export async function fetchMyOrders() {
  return apiFetch('/orders/me')
}

export async function fetchAdminDashboard() {
  return apiFetch('/admin/dashboard')
}

export async function fetchAdminOrders() {
  return apiFetch('/orders/admin/all')
}

export async function updateOrderStatus(id, status) {
  return apiFetch(`/orders/admin/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
}

export async function createProduct(product) {
  return apiFetch('/products', { method: 'POST', body: JSON.stringify(product) })
}

export async function updateProduct(id, product) {
  return apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(product) })
}

export async function deleteProduct(id) {
  return apiFetch(`/products/${id}`, { method: 'DELETE' })
}
