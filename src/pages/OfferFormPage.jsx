// src/pages/OfferFormPage.jsx
import React, { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import ProductRow from '../components/ProductRow'

export default function OfferFormPage() {
  const [rows, setRows] = useState([
    { name: '', quantity: 1, widthMm: 0, heightMm: 0 },
  ])
  const previewRefs = useRef([])

  const registerPreview = ref => {
    previewRefs.current.push(ref)
  }

  const updateRow = (idx, updated) => {
    const newRows = [...rows]
    newRows[idx] = updated
    setRows(newRows)
  }

  const addRow = () => {
    setRows([...rows, { name: '', quantity: 1, widthMm: 0, heightMm: 0 }])
  }

  const generatePDF = async () => {
    // Snapshot each preview
    const imgs = await Promise.all(
      previewRefs.current.map(r =>
        html2canvas(r.current, { backgroundColor: null }).then(canvas =>
          canvas.toDataURL('image/png')
        )
      )
    )
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    let y = 40

    rows.forEach((row, i) => {
      doc.text(`Item ${i + 1}: ${row.name}`, 40, y)
      const w = row.widthMm * 3.78
      const h = row.heightMm * 3.78
      doc.addImage(imgs[i], 'PNG', 40, y + 10, w, h)
      y += h + 40
    })

    doc.save('Offer.pdf')
  }

  return (
    <div className="offer-form-page">
      <h1>Create Offer</h1>
      <button onClick={addRow}>+ Add Line Item</button>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Qty</th>
            <th>Width (mm)</th>
            <th>Height (mm)</th>
            <th>Preview</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <ProductRow
              key={i}
              item={r}
              onChange={updated => updateRow(i, updated)}
              registerPreview={registerPreview}
            />
          ))}
        </tbody>
      </table>
      <button onClick={generatePDF}>Generate PDF</button>
    </div>
  )
}
