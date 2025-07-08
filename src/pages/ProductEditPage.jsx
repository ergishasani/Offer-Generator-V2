// src/pages/ProductEditPage.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection
} from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'

export default function ProductEditPage() {
  const { user } = useAuth()
  const { source, id } = useParams()          // source = 'global' or 'user'
  const isNew = id === 'new'
  const [data, setData] = useState({
    name: '',
    unit: '',
    basePrice: '',
    vatRate: 0.2,
    svgUrl: '',
    imageUrl: '',
    widthMm: '',
    heightMm: ''
  })
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  // If editing an existing user-product, load it
  useEffect(() => {
    if (!user || isNew) return
    const ref =
      source === 'user'
        ? doc(db, 'users', user.uid, 'products', id)
        : doc(db, 'products', id)

    getDoc(ref).then(snap => {
      if (snap.exists()) setData(snap.data())
      setLoading(false)
    })
  }, [user, source, id, isNew])

  const handleChange = e => {
    const { name, value } = e.target
    setData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      if (isNew || source === 'user') {
        // Always write user products under users/{uid}/products
        const refCol = collection(db, 'users', user.uid, 'products')
        if (isNew) {
          await addDoc(refCol, data)
        } else {
          await setDoc(doc(refCol, id), data, { merge: true })
        }
      } else {
        // Global edits aren’t allowed; you could clone into user catalog
        return alert('Global products cannot be edited')
      }
      navigate('/products')
    } catch (err) {
      console.error(err)
      alert('Error saving product')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Loading…</div>

  return (
    <div className="product-edit-page">
      <h1>{isNew ? 'Add New' : 'Edit'} Product</h1>
      <form onSubmit={handleSubmit}>
        {[
          { label: 'Name', name: 'name', type: 'text' },
          { label: 'Unit', name: 'unit', type: 'text' },
          { label: 'Base Price', name: 'basePrice', type: 'number' },
          { label: 'VAT Rate', name: 'vatRate', type: 'number', step: '0.01' },
          { label: 'SVG URL', name: 'svgUrl', type: 'url' },
          { label: 'Image URL', name: 'imageUrl', type: 'url' },
          { label: 'Width (mm)', name: 'widthMm', type: 'number' },
          { label: 'Height (mm)', name: 'heightMm', type: 'number' },
        ].map(f => (
          <label key={f.name}>
            {f.label}
            <input
              {...f}
              name={f.name}
              value={data[f.name]}
              onChange={handleChange}
              required={!isNew && f.name === 'name'}
            />
          </label>
        ))}
        <button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save Product'}
        </button>
      </form>
    </div>
  )
}
