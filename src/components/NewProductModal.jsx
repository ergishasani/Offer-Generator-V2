// src/components/NewProductModal.jsx
import React from 'react'
import ReactDOM from 'react-dom'
import WindowPreview from './WindowPreview'
import { WINDOW_TYPES } from '../constants/windowTypes'
import '../assets/styles/components/new-product-modal.scss'

export default function NewProductModal({ onClose, onSelect }) {
  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <h2>Select a Window Design</h2>
        <div className="design-grid">
          {WINDOW_TYPES
            // only our two “design” entries:
            .filter(w => w.id === 'design1' || w.id === 'design2')
            .map(w => (
              <div
                key={w.id}
                className="design-card"
                onClick={() => onSelect(w.id)}
              >
                <WindowPreview
                  type={w.id}
                  widthMm={400}
                  heightMm={400}
                />
                <div className="design-label">{w.label}</div>
              </div>
            ))}
        </div>
      </div>
    </div>,
    document.body
  )
}
