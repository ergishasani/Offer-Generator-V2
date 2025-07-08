// src/pages/ProductListPage.jsx
import React, { useEffect, useState } from 'react'
import { collection, getDocs, query } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { db } from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'

export default function ProductListPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    const load = async () => {
      setLoading(true)
      // 1) load global catalog
      const globalSnap = await getDocs(query(collection(db, 'products')))
      const global = globalSnap.docs.map(d => ({ id: d.id, ...d.data(), source: 'global' }))
      // 2) load user catalog
      const userSnap = await getDocs(
        query(collection(db, 'users', user.uid, 'products'))
      )
      const userList = userSnap.docs.map(d => ({ id: d.id, ...d.data(), source: 'user' }))
      // 3) merge
      setProducts([...global, ...userList])
      setLoading(false)
    }
    load()
  }, [user])

  if (loading) return <div>Loading products…</div>

  return (
    <div className="product-list-page">
      <h1>Product Catalog</h1>
      <button onClick={() => navigate('/products/new')}>+ Add New Product</button>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Unit</th>
            <th>Price</th>
            <th>VAT</th>
            <th>Source</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={`${p.source}-${p.id}`}>
              <td>{p.name}</td>
              <td>{p.unit}</td>
              <td>{p.basePrice}</td>
              <td>{p.vatRate * 100}%</td>
              <td>{p.source}</td>
              <td>
                {/* On “global” items we can’t edit, only on “user” */}
                <button onClick={() => navigate(`/products/${p.source}/${p.id}`)}>
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
