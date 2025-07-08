// src/components/ProductRow.jsx
import React, { useEffect, useRef } from 'react'
import WindowPreview from './WindowPreview'

export default function ProductRow({
  index,
  item,
  products,
  onChange,
  onRemove,
  registerPreview
}) {
  const previewRef = useRef(null)

  // Register this preview div so parent can snapshot it
  useEffect(() => {
    registerPreview(previewRef)
  }, [registerPreview])

  // When the user selects a product from the dropdown
  const handleSelect = e => {
    const prod = products.find(p => p.id === e.target.value)
    if (prod) {
      onChange({
        ...item,
        id: prod.id,
        name: prod.name,
        basePrice: prod.basePrice,
        vatRate: prod.vatRate,
        widthMm: prod.widthMm || 0,
        heightMm: prod.heightMm || 0
      })
    } else {
      // cleared selection
      onChange({
        ...item,
        id: '',
        name: '',
        basePrice: 0,
        vatRate: 0,
        widthMm: 0,
        heightMm: 0
      })
    }
  }

  // Handle changes to the other numeric/text fields
  const handleField = e => {
    const { name, value } = e.target
    onChange({
      ...item,
      [name]:
        name === 'quantity'
          ? parseInt(value, 10)
          : name === 'basePrice' ||
            name === 'vatRate' ||
            name === 'widthMm' ||
            name === 'heightMm'
          ? parseFloat(value)
          : value
    })
  }

  return (
    <tr>
      <td>
        <button
          type="button"
          onClick={onRemove}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '1.2rem',
            color: '#c00'
          }}
          title="Remove this line"
        >
          🗑
        </button>
      </td>
      <td>
        <select value={item.id || ''} onChange={handleSelect}>
          <option value="">— Select product —</option>
          {products.map(p => (
            <option key={`${p.source}-${p.id}`} value={p.id}>
              {p.source === 'global' ? '[G] ' : '[U] '}
              {p.name}
            </option>
          ))}
        </select>
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
