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

// ← import all eight SVGs
import windowShape           from '../assets/window.svg'
import frenchDoor            from '../assets/french-door-threshold.svg'
import residentialDoor       from '../assets/residential-door.svg'
import sideEntranceDoor      from '../assets/side-entrance-door.svg'
import liftSlideDoor         from '../assets/lift-slide-door.svg'
import tiltSlideSmoovio      from '../assets/tilt-slide-smoovio.svg'
import pskDoor               from '../assets/psk.svg'
import specialVariantsWindow from '../assets/special-variants.svg'

// ← list them in the picker options
const SHAPE_OPTIONS = [
  { id: 'window',             label: 'Window',                         svg: windowShape },
  { id: 'french-door',        label: 'French door with threshold',      svg: frenchDoor },
  { id: 'residential-door',   label: 'Residential door',                svg: residentialDoor },
  { id: 'side-entrance-door', label: 'Side entrance door',              svg: sideEntranceDoor },
  { id: 'lift-slide-door',    label: 'Lift and slide door',             svg: liftSlideDoor },
  { id: 'tilt-slide-smoovio', label: 'Tilt/slide door (SMOOVIO®)',     svg: tiltSlideSmoovio },
  { id: 'psk',                label: 'PSK',                             svg: pskDoor },
  { id: 'special-variants',   label: 'Special variants',                svg: specialVariantsWindow },
]

export default function ProductEditPage() {
  const { user } = useAuth()
  const { source, id } = useParams()
  const isNew = id === 'new'
  const nav = useNavigate()

  const [product, setProduct] = useState({
    name: '',
    unit: 'pcs',
    basePrice: 0,
    vatRate: 0.20,
    widthMm: 0,
    heightMm: 0,
    svgUrl: ''      // ← will be set by picking one of the eight above
  })
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // load existing on edit
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

  const handleShapePick = opt =>
    setProduct(p => ({ ...p, svgUrl: opt.svg }))

  const handleChange = e => {
    const { name, value } = e.target
    setProduct(p => ({
      ...p,
      [name]:
        ['basePrice', 'vatRate', 'widthMm', 'heightMm'].includes(name)
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
        await addDoc(collection(db, 'users', user.uid, 'products'), product)
      } else {
        await setDoc(doc(db, 'users', user.uid, 'products', id), product, { merge: true })
      }
      nav('/products')
    } catch {
      setError('Failed to save product.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="product-edit-page">Loading…</div>

  // 1) New product & no shape chosen → show full picker
  if (isNew && !product.svgUrl) {
    return (
      <div className="product-edit-page">
        <h1>Select Window Shape</h1>
        <div className="shape-picker">
          {SHAPE_OPTIONS.map(opt => (
            <div
              key={opt.id}
              className="shape-option"
              onClick={() => handleShapePick(opt)}
            >
              <img src={opt.svg} alt={opt.label} />
              <span>{opt.label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 2) Once svgUrl is set (either loaded or just picked), show form + preview
  const grossPrice = (product.basePrice * (1 + product.vatRate)).toFixed(2)

  return (
    <div className="product-edit-page with-preview">
      <div className="form-column">
        <h1>{isNew ? 'Add New Product' : 'Edit Product'}</h1>
        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit} className="product-edit-form">
          {/* Basic Info */}
          <label>
            Name<span className="required">*</span>
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

          {/* Dimensions */}
          <div className="two-column">
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
          </div>

          {/* Pricing */}
          <label>
            Base Price (net)<span className="required">*</span>
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
            VAT Rate (0–1)<span className="required">*</span>
            <input
              type="number"
              name="vatRate"
              value={product.vatRate}
              onChange={handleChange}
              step="0.01"
              min="0"
              max="1"
              required
            />
          </label>

          {/* Chosen Shape */}
          <label>
            Chosen Shape
            <input type="text" value={product.svgUrl} readOnly />
          </label>

          {/* Gross price summary */}
          <div className="price-summary">
            Gross (incl. VAT): <strong>{grossPrice}</strong>
          </div>

          {/* Actions */}
          <div className="buttons">
            <button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => nav('/products')} disabled={saving}>
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Live SVG preview */}
      <div className="preview-column">
        <h2>Live Preview</h2>
        <div className="svg-preview-container">
          <img src={product.svgUrl} alt="Window preview" />
        </div>
      </div>
    </div>
  )
}
