// src/components/ProductRow.jsx
import React, { useEffect, useRef } from 'react'
import WindowPreview from './WindowPreview'
import '../assets/styles/components/product-row.scss'

export default function ProductRow({
  index,
  item,
  products,
  onChange,
  onRemove,
  registerPreview
}) {
  const previewRef = useRef(null)

  // register for PDF snapshot
  useEffect(() => {
    registerPreview(previewRef)
  }, [registerPreview])

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
      onChange({ ...item, id:'', name:'', basePrice:0, vatRate:0, widthMm:0, heightMm:0 })
    }
  }

  const handleField = e => {
    const { name, value } = e.target
    onChange({
      ...item,
      [name]:
        name === 'quantity'
          ? parseInt(value, 10)
          : ['basePrice','vatRate','widthMm','heightMm'].includes(name)
          ? parseFloat(value)
          : value
    })
  }

  return (
    <tr className="product-row">
      {/* delete */}
      <td className="cell cell-action">
        <button
          type="button"
          onClick={onRemove}
          className="delete-btn"
          title="Remove this line"
        >
          🗑
        </button>
      </td>

      {/* product select */}
      <td className="cell cell-product">
        <select
          className="product-select"
          value={item.id || ''}
          onChange={handleSelect}
        >
          <option value="">— Select product —</option>
          {products.map(p => (
            <option key={`${p.source}-${p.id}`} value={p.id}>
              {p.source === 'global' ? '[G]' : '[U]'} {p.name}
            </option>
          ))}
        </select>
      </td>

      {/* quantity */}
      <td className="cell cell-quantity">
        <input
          className="row-input quantity-input"
          type="number"
          name="quantity"
          value={item.quantity}
          onChange={handleField}
          min="1"
        />
      </td>

      {/* base price */}
      <td className="cell cell-price">
        <input
          className="row-input price-input"
          type="number"
          name="basePrice"
          value={item.basePrice}
          onChange={handleField}
          step="0.01"
          placeholder="Net"
        />
      </td>

      {/* vat rate */}
      <td className="cell cell-vat">
        <input
          className="row-input vat-input"
          type="number"
          name="vatRate"
          value={item.vatRate}
          onChange={handleField}
          step="0.01"
          placeholder="0.20"
        />
      </td>

      {/* width */}
      <td className="cell cell-width">
        <input
          className="row-input dim-input"
          type="number"
          name="widthMm"
          value={item.widthMm}
          onChange={handleField}
          placeholder="mm"
        />
      </td>

      {/* height */}
      <td className="cell cell-height">
        <input
          className="row-input dim-input"
          type="number"
          name="heightMm"
          value={item.heightMm}
          onChange={handleField}
          placeholder="mm"
        />
      </td>

      {/* preview */}
      <td className="cell cell-preview">
        <div className="preview-container" ref={previewRef}>
          <WindowPreview
            widthMm={item.widthMm}
            heightMm={item.heightMm}
          />
        </div>
      </td>
    </tr>
  )
}
