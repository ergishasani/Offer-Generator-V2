// src/components/ProductRow.jsx
import React, { useEffect, useRef } from 'react'
import WindowPreview from './WindowPreview'

export default function ProductRow({ item, onChange, registerPreview }) {
  const previewRef = useRef(null)

  // Register this preview div so parent can snapshot it
  useEffect(() => {
    registerPreview(previewRef)
  }, [registerPreview])

  const handleField = e => {
    const { name, value } = e.target
    onChange({
      ...item,
      [name]: name === 'quantity' ? parseInt(value, 10) :
               name === 'basePrice' || name === 'vatRate' ||
               name === 'widthMm' || name === 'heightMm'
                 ? parseFloat(value)
                 : value
    })
  }

  return (
    <tr>
      <td>
        <input
          name="name"
          value={item.name}
          onChange={handleField}
          placeholder="Product name"
        />
      </td>
      <td>
        <input
          type="number"
          name="quantity"
          value={item.quantity}
          onChange={handleField}
          min="1"
        />
      </td>
      <td>
        <input
          type="number"
          name="basePrice"
          value={item.basePrice}
          onChange={handleField}
          step="0.01"
          placeholder="Net price"
        />
      </td>
      <td>
        <input
          type="number"
          name="vatRate"
          value={item.vatRate}
          onChange={handleField}
          step="0.01"
          placeholder="e.g. 0.20"
        />
      </td>
      <td>
        <input
          type="number"
          name="widthMm"
          value={item.widthMm}
          onChange={handleField}
          placeholder="mm"
        />
      </td>
      <td>
        <input
          type="number"
          name="heightMm"
          value={item.heightMm}
          onChange={handleField}
          placeholder="mm"
        />
      </td>
      <td>
        <WindowPreview
          ref={previewRef}
          widthMm={item.widthMm}
          heightMm={item.heightMm}
        />
      </td>
    </tr>
  )
}
