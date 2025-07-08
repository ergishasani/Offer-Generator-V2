// src/components/ProductRow.jsx
import React, { useEffect, useRef } from 'react'
import WindowPreview from './WindowPreview'

export default function ProductRow({ item, onChange, registerPreview }) {
  const previewRef = useRef(null)

  // Register this preview div with the parent form
  useEffect(() => {
    registerPreview(previewRef)
  }, [registerPreview])

  const handleField = e => {
    const { name, value } = e.target
    onChange({ ...item, [name]: value })
  }

  return (
    <tr>
      {/* Product selector placeholder */}
      <td>
        <input
          name="name"
          value={item.name || ''}
          onChange={handleField}
          placeholder="Product name"
        />
      </td>
      {/* Quantity */}
      <td>
        <input
          type="number"
          name="quantity"
          value={item.quantity || 1}
          onChange={handleField}
          min="1"
        />
      </td>
      {/* Width & Height */}
      <td>
        <input
          type="number"
          name="widthMm"
          value={item.widthMm || ''}
          onChange={handleField}
          placeholder="mm"
        />
      </td>
      <td>
        <input
          type="number"
          name="heightMm"
          value={item.heightMm || ''}
          onChange={handleField}
          placeholder="mm"
        />
      </td>
      {/* Preview */}
      <td>
        <WindowPreview
          ref={previewRef}
          widthMm={item.widthMm || 0}
          heightMm={item.heightMm || 0}
        />
      </td>
    </tr>
  )
}
