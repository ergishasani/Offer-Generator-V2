// src/pages/OfferFormPage.jsx
import React, { useState, useRef, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import ProductRow from '../components/ProductRow'
import { useAuth } from '../contexts/AuthContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../services/firebase'

export default function OfferFormPage() {
  const { user } = useAuth()

  // Load company profile
  const [companyProfile, setCompanyProfile] = useState(null)
  useEffect(() => {
    if (!user) return
    getDoc(doc(db, 'users', user.uid, 'companyProfile', 'profile')).then(snap => {
      if (snap.exists()) setCompanyProfile(snap.data())
    })
  }, [user])

  // Section 1: Contact & Offer Info
  const [clientName, setClientName] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [regarding, setRegarding] = useState('')
  const [offerNumber, setOfferNumber] = useState(Date.now().toString())
  const [offerDate, setOfferDate] = useState(new Date())
  const [expiryDate, setExpiryDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  )
  const [referenceNumber, setReferenceNumber] = useState('')

  // Section 2: Header Text
  const [headerText, setHeaderText] = useState('')

  // Section 3: Line Items
  const [rows, setRows] = useState([
    { name: '', quantity: 1, basePrice: 0, vatRate: 0.2, widthMm: 0, heightMm: 0 },
  ])
  const previewRefs = useRef([])

  const registerPreview = ref => {
    previewRefs.current.push(ref)
  }

  const updateRow = (idx, updated) => {
    setRows(old => {
      const copy = [...old]
      copy[idx] = updated
      return copy
    })
  }

  const addRow = () => {
    setRows(old => [
      ...old,
      { name: '', quantity: 1, basePrice: 0, vatRate: 0.2, widthMm: 0, heightMm: 0 },
    ])
  }

  // Section 4: Totals & Discounts
  const [globalDiscount, setGlobalDiscount] = useState(0) // percent

  // Computed totals
  const subtotalNet = rows.reduce(
    (sum, r) => sum + r.basePrice * r.quantity,
    0
  )
  const discountFactor = 1 - globalDiscount / 100
  const netAfterDiscount = subtotalNet * discountFactor
  const vatTotal = rows.reduce(
    (sum, r) => sum + r.basePrice * r.quantity * discountFactor * r.vatRate,
    0
  )
  const grandTotal = netAfterDiscount + vatTotal

  // PDF generation
  const generatePDF = async () => {
    const imgs = await Promise.all(
      previewRefs.current.map(r =>
        html2canvas(r.current, { backgroundColor: null }).then(canvas =>
          canvas.toDataURL('image/png')
        )
      )
    )

    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    let y = 40

    // Company header
    if (companyProfile) {
      doc.setFontSize(14)
      doc.text(companyProfile.name || '', 40, y)
      doc.setFontSize(10)
      if (companyProfile.address) doc.text(companyProfile.address, 40, y + 16)
      y += 40
    }

    // Offer info
    doc.setFontSize(12)
    doc.text(`Client: ${clientName}`, 40, y)
    doc.text(`Offer #: ${offerNumber}`, 300, y)
    y += 16
    doc.text(`Date: ${offerDate.toLocaleDateString()}`, 40, y)
    doc.text(`Expires: ${expiryDate.toLocaleDateString()}`, 300, y)
    y += 30
    if (referenceNumber) {
      doc.text(`Ref/Order #: ${referenceNumber}`, 40, y)
      y += 16
    }
    if (regarding) {
      doc.text(`Regarding: ${regarding}`, 40, y)
      y += 30
    }

    // Header Text
    if (headerText) {
      doc.setFontSize(11)
      const lines = doc.splitTextToSize(headerText, 500)
      doc.text(lines, 40, y)
      y += lines.length * 14 + 20
    }

    // Totals summary
    doc.setFontSize(12)
    doc.text(`Subtotal (net): €${subtotalNet.toFixed(2)}`, 40, y)
    y += 16
    doc.text(
      `Discount (${globalDiscount}%): -€${(subtotalNet - netAfterDiscount).toFixed(2)}`,
      40,
      y
    )
    y += 16
    doc.text(`Net after discount: €${netAfterDiscount.toFixed(2)}`, 40, y)
    y += 16
    doc.text(`Total VAT: €${vatTotal.toFixed(2)}`, 40, y)
    y += 16
    doc.text(`Grand Total: €${grandTotal.toFixed(2)}`, 40, y)
    y += 30

    // Line items
    rows.forEach((row, i) => {
      doc.setFontSize(11)
      doc.text(`Item ${i + 1}: ${row.name}`, 40, y)
      const w = row.widthMm * 3.78
      const h = row.heightMm * 3.78
      doc.addImage(imgs[i], 'PNG', 40, y + 10, w, h)
      y += h + 40
    })

    doc.save(`Offer-${offerNumber}.pdf`)
  }

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>Create Offer</h1>

      {/* Section 1 */}
      <section style={{ marginBottom: 20 }}>
        <h2>Contact & Offer Info</h2>
        <div
          style={{
            display: 'grid',
            gap: 8,
            gridTemplateColumns: '1fr 1fr',
          }}
        >
          <label>
            Client Name
            <input
              type="text"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              required
            />
          </label>
          <label>
            Offer Number
            <input
              type="text"
              value={offerNumber}
              onChange={e => setOfferNumber(e.target.value)}
            />
          </label>
          <label>
            Delivery Address
            <input
              type="text"
              value={deliveryAddress}
              onChange={e => setDeliveryAddress(e.target.value)}
            />
          </label>
          <label>
            Reference #
            <input
              type="text"
              value={referenceNumber}
              onChange={e => setReferenceNumber(e.target.value)}
            />
          </label>
          <label>
            Regarding
            <input
              type="text"
              value={regarding}
              onChange={e => setRegarding(e.target.value)}
            />
          </label>
          <label>
            Offer Date
            <DatePicker selected={offerDate} onChange={setOfferDate} />
          </label>
          <label>
            Expiry Date
            <DatePicker selected={expiryDate} onChange={setExpiryDate} />
          </label>
        </div>
      </section>

      {/* Section 2 */}
      <section style={{ marginBottom: 20 }}>
        <h2>Header Text</h2>
        <textarea
          rows={4}
          style={{ width: '100%', padding: 8 }}
          placeholder="Custom greeting or introduction..."
          value={headerText}
          onChange={e => setHeaderText(e.target.value)}
        />
      </section>

      {/* Section 3 */}
      <button onClick={addRow} style={{ marginBottom: 10 }}>
        + Add Line Item
      </button>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: 20,
        }}
      >
        <thead>
          <tr>
            {[
              'Name',
              'Qty',
              'Unit Price',
              'VAT Rate',
              'Width (mm)',
              'Height (mm)',
              'Preview',
            ].map(h => (
              <th
                key={h}
                style={{
                  borderBottom: '1px solid #ccc',
                  padding: '4px 8px',
                  textAlign: 'left',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <ProductRow
              key={i}
              item={r}
              onChange={upd => updateRow(i, upd)}
              registerPreview={registerPreview}
            />
          ))}
        </tbody>
      </table>

      {/* Section 4 */}
      <section style={{ marginBottom: 20 }}>
        <h2>Totals & Discounts</h2>
        <label>
          Global Discount (%)
          <input
            type="number"
            value={globalDiscount}
            onChange={e => setGlobalDiscount(parseFloat(e.target.value))}
            step="0.1"
            min="0"
          />
        </label>
        <div>Subtotal (net): €{subtotalNet.toFixed(2)}</div>
        <div>
          Net after discount: €{netAfterDiscount.toFixed(2)} (
          -€{(subtotalNet - netAfterDiscount).toFixed(2)})
        </div>
        <div>Total VAT: €{vatTotal.toFixed(2)}</div>
        <div>
          <strong>Grand Total: €{grandTotal.toFixed(2)}</strong>
        </div>
      </section>

      <button onClick={generatePDF}>Generate PDF</button>
    </div>
  )
}
