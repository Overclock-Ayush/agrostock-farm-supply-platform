import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const KEY = 'agrostock_cart'

function loadCart() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)

  useEffect(() => localStorage.setItem(KEY, JSON.stringify(items)), [items])

  const value = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0)
    const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)

    return {
      items, count, subtotal,
      add(product, quantity = 1) {
        setItems(current => {
          const found = current.find(item => item.id === product.id)
          if (found) {
            return current.map(item => item.id === product.id
              ? { ...item, quantity: Math.min(item.quantity + quantity, product.stockQuantity) }
              : item)
          }
          return [...current, {
            id: product.id,
            name: product.name,
            sku: product.sku,
            price: product.price,
            unit: product.unit,
            imageUrl: product.imageUrl,
            stockQuantity: product.stockQuantity,
            quantity: Math.min(quantity, product.stockQuantity)
          }]
        })
      },
      setQuantity(id, quantity) {
        setItems(current => current.map(item => item.id === id
          ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stockQuantity)) }
          : item))
      },
      remove(id) { setItems(current => current.filter(item => item.id !== id)) },
      clear() { setItems([]) }
    }
  }, [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  return useContext(CartContext)
}
