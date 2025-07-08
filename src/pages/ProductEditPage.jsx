// src/pages/ProductEditPage.jsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc
} from 'firebase/firestore'
import { db } from '../services/firebase'
import '../assets/styles/pages/product-edit.scss'

export default function ProductEditPage() {
  const { user } = useAuth()
  const { source, id } = useParams()                   // source will be "user"
  const isNew = id === 'new'
  const nav = useNavigate()

  const [product, setProduct] = useState({
    name: '',
    unit: 'pcs',
    basePrice: 0,
    vatRate: 0.2,
    widthMm: 0,
    heightMm: 0,
    svgUrl: ''
  })
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // If editing, load existing product
  useEffect(() => {
    if (!user || isNew) return
    const ref = doc(db, 'users', user.uid, 'products', id)
    getDoc(ref)
      .then(snap => {
        if (snap.exists()) setProduct(snap.data())
        else setError('Product not found.')
      })
      .catch(() => setError('Failed to load product.'))
      .finally(() => setLoading(false))
  }, [user, id, isNew])

  const handleChange = e => {
    const { name, value } = e.target
    setProduct(p => ({
      ...p,
      [name]:
        name === 'basePrice' ||
        name === 'vatRate' ||
        name === 'widthMm' ||
        name === 'heightMm'
          ? parseFloat(value)
          : value
    }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (isNew) {
        // Create new
        await addDoc(collection(db, 'users', user.uid, 'products'), product)
      } else {
        // Update existing
        const ref = doc(db, 'users', user.uid, 'products', id)
        await setDoc(ref, product, { merge: true })
      }
      nav('/products')
    } catch (err) {
      console.error(err)
      setError('Failed to save product.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="product-edit-page">Loading…</div>

  return (
    <div className="product-edit-page">
      <h1>{isNew ? 'Add New Product' : 'Edit Product'}</h1>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit} className="product-edit-form">
        <label>
          Name
          <input
            name="name"
            value={product.name}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Unit
          <input
            name="unit"
            value={product.unit}
            onChange={handleChange}
          />
        </label>
        <label>
          Base Price (net)
          <input
            type="number"
            name="basePrice"
            value={product.basePrice}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
          />
        </label>
        <label>
          VAT Rate
          <input
            type="number"
            name="vatRate"
            value={product.vatRate}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
          />
        </label>
        <label>
          Width (mm)
          <input
            type="number"
            name="widthMm"
            value={product.widthMm}
            onChange={handleChange}
            min="0"
          />
        </label>
        <label>
          Height (mm)
          <input
            type="number"
            name="heightMm"
            value={product.heightMm}
            onChange={handleChange}
            min="0"
          />
        </label>
        <label>
          SVG URL
          <input
            type="url"
            name="svgUrl"
            value={product.svgUrl}
            onChange={handleChange}
          />
        </label>
        <div className="buttons">
          <button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button type="button" onClick={() => nav('/products')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
