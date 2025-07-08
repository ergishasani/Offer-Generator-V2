// src/pages/ProductListPage.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  collection,
  getDocs,
  query,
  deleteDoc,
  doc
} from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'
import '../assets/styles/pages/product-list.scss'

export default function ProductListPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const nav = useNavigate()

  useEffect(() => {
    if (!user) return
    ;(async () => {
      // fetch global
      const globalSnap = await getDocs(query(collection(db, 'products')))
      const global = globalSnap.docs.map(d => ({
        id: d.id,
        source: 'global',
        ...d.data()
      }))
      // fetch user
      const userSnap = await getDocs(
        query(collection(db, 'users', user.uid, 'products'))
      )
      const userList = userSnap.docs.map(d => ({
        id: d.id,
        source: 'user',
        ...d.data()
      }))
      setProducts([...global, ...userList])
      setLoading(false)
    })()
  }, [user])

  const handleDelete = async (source, id) => {
    if (
      !window.confirm(
        `Delete this ${source === 'global' ? 'global' : 'your'} product?`
      )
    )
      return
    const path =
      source === 'global'
        ? ['products', id]
        : ['users', user.uid, 'products', id]
    await deleteDoc(doc(db, ...path))
    setProducts(p => p.filter(x => !(x.source === source && x.id === id)))
  }

  if (loading) return <div className="product-list-page">Loading…</div>

  return (
    <div className="product-list-page">
      <h1>Product Catalog</h1>
      <button
        className="add-button"
        onClick={() => nav('/products/user/new')}
      >
        + Add My Product
      </button>
      <table>
        <thead>
          <tr>
            <th>Scope</th>
            <th>Name</th>
            <th>Unit</th>
            <th>Price</th>
            <th>VAT</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => (
            <tr key={`${p.source}-${p.id}`}>
              <td>{p.source === 'global' ? 'Global' : 'Mine'}</td>
              <td>{p.name}</td>
              <td>{p.unit || 'pcs'}</td>
              <td>{p.basePrice.toFixed(2)}</td>
              <td>{(p.vatRate * 100).toFixed(0)}%</td>
              <td>
                <button
                  onClick={() =>
                    nav(`/products/${p.source}/${p.id}`)
                  }
                >
                  Edit
                </button>
                {p.source === 'user' && (
                  <button
                    className="delete"
                    onClick={() => handleDelete(p.source, p.id)}
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
