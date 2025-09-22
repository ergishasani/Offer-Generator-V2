// src/pages/OfferFormPage.jsx
import React, { useState, useRef, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import ProductRow from '../components/ProductRow'
import { useAuth } from '../contexts/AuthContext'
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  addDoc,
  updateDoc
} from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { db } from '../services/firebase'
import '../assets/styles/pages/offer-form.scss'

export default function OfferFormPage() {
  const { user } = useAuth()
  const location = useLocation()
  const offerId = location.state?.offerId

  // Company profile
  const [companyProfile, setCompanyProfile] = useState(null)
  useEffect(() => {
    if (!user) return
    getDoc(doc(db, 'users', user.uid, 'companyProfile', 'profile'))
      .then(snap => snap.exists() && setCompanyProfile(snap.data()))
  }, [user])

  // Product catalog
  const [catalog, setCatalog] = useState([])
  useEffect(() => {
    if (!user) return
    ;(async () => {
      const globalSnap = await getDocs(query(collection(db, 'products')))
      const global = globalSnap.docs.map(d => ({ id: d.id, source: 'global', ...d.data() }))
      const userSnap   = await getDocs(query(collection(db, 'users', user.uid, 'products')))
      const userList   = userSnap.docs.map(d => ({ id: d.id, source: 'user',   ...d.data() }))
      setCatalog([...global, ...userList])
    })()
  }, [user])

  // Clients
  const [clients, setClients] = useState([])
  useEffect(() => {
    if (!user) return
    ;(async () => {
      const snap = await getDocs(collection(db, 'users', user.uid, 'clients'))
      setClients(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })()
  }, [user])

  // Section 1: Contact & Offer Info
  const [clientName, setClientName]           = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [regarding, setRegarding]             = useState('')
  const [offerNumber, setOfferNumber]         = useState(Date.now().toString())
  const [offerDate, setOfferDate]             = useState(new Date())
  const [expiryDate, setExpiryDate]           = useState(new Date(Date.now() + 7*86400000))
  const [referenceNumber, setReferenceNumber] = useState('')

  // Section 2: Header Text
  const [headerText, setHeaderText] = useState('')

  // Section 3: Line Items + previewRefs
  const [rows, setRows] = useState([
    { id: '', name: '', quantity: 1, basePrice: 0, vatRate: 0.2, widthMm: 0, heightMm: 0 }
  ])
  const previewRefs = useRef({})
  const registerPreview = (rowId, ref) => {
    previewRefs.current[rowId] = ref
  }
  const updateRow = (idx, updated) =>
    setRows(old => {
      const c = [...old]; c[idx] = updated; return c
    })
  const addRow = () =>
    setRows(old => [...old, { id: '', name: '', quantity: 1, basePrice: 0, vatRate: 0.2, widthMm: 0, heightMm: 0 }])
  const removeRow = idx =>
    setRows(old => old.filter((_, i) => i !== idx))

  // Section 4: Totals & Discounts
  const [globalDiscount, setGlobalDiscount] = useState(0)
  const subtotalNet      = rows.reduce((sum, r) => sum + r.basePrice * r.quantity, 0)
  const discountFactor   = 1 - globalDiscount/100
  const netAfterDiscount = subtotalNet * discountFactor
  const vatTotal         = rows.reduce((sum, r) =>
    sum + r.basePrice*r.quantity*discountFactor*r.vatRate, 0
  )
  const grandTotal = netAfterDiscount + vatTotal

  // Section 5: Footer Text
  const [footerText, setFooterText] = useState('Thank you for your business.')

  // Section 6: More Options
  const [currency, setCurrency]                 = useState('EUR')
  const [internalContact, setInternalContact]   = useState('')
  const [deliveryConditions, setDeliveryConditions] = useState('')
  const [paymentTerms, setPaymentTerms]         = useState('')
  const [vatRegulation, setVatRegulation]       = useState('domestic')

  // Prefill existing offer
  useEffect(() => {
    if (!user || !offerId) return
    ;(async () => {
      const snap = await getDoc(doc(db, 'users', user.uid, 'offers', offerId))
      if (!snap.exists()) return
      const o = snap.data()
      setClientName(o.clientName)
      setDeliveryAddress(o.deliveryAddress)
      setRegarding(o.regarding)
      setOfferNumber(o.offerNumber)
      setOfferDate(new Date(o.offerDate))
      setExpiryDate(new Date(o.expiryDate))
      setReferenceNumber(o.referenceNumber)
      setHeaderText(o.headerText)
      setRows(o.rows)
      setGlobalDiscount(o.globalDiscount)
      setFooterText(o.footerText)
      setCurrency(o.currency)
      setInternalContact(o.internalContact)
      setDeliveryConditions(o.deliveryConditions)
      setPaymentTerms(o.paymentTerms)
      setVatRegulation(o.vatRegulation)
      previewRefs.current = {}
    })()
  }, [user, offerId])

  // ——— FIXED generatePDF ———
  const generatePDF = async () => {
    const margin = 40
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    let cursorY = 40

    // 1) Company header
    if (companyProfile) {
      pdf.setFontSize(14).text(companyProfile.name || '', margin, cursorY)
      pdf.setFontSize(10)
      if (companyProfile.address) pdf.text(companyProfile.address, margin, cursorY + 16)
      cursorY += 40
    }

    // 2) Contact & Offer Info
    pdf.setFontSize(12).text(`Client: ${clientName}`, margin, cursorY)
    pdf.text(`Offer #: ${offerNumber}`, pageWidth - margin - 150, cursorY)
    cursorY += 16
    pdf.text(`Date: ${offerDate.toLocaleDateString()}`, margin, cursorY)
    pdf.text(`Expires: ${expiryDate.toLocaleDateString()}`, pageWidth - margin - 150, cursorY)
    cursorY += 20
    if (referenceNumber) {
      pdf.text(`Ref/Order #: ${referenceNumber}`, margin, cursorY)
      cursorY += 16
    }
    if (regarding) {
      pdf.text(`Regarding: ${regarding}`, margin, cursorY)
      cursorY += 20
    }

    // 3) Header text
    if (headerText) {
      pdf.setFontSize(11)
      const lines = pdf.splitTextToSize(headerText, pageWidth - margin * 2)
      pdf.text(lines, margin, cursorY)
      cursorY += lines.length * 14 + 20
    }

    // 4) Totals summary
    pdf.setFontSize(12)
      .text(`Subtotal (net): ${currency} ${subtotalNet.toFixed(2)}`, margin, cursorY)
    cursorY += 14
    pdf.text(`Discount (${globalDiscount}%): -${currency} ${(subtotalNet - netAfterDiscount).toFixed(2)}`, margin, cursorY)
    cursorY += 14
    pdf.text(`Net after discount: ${currency} ${netAfterDiscount.toFixed(2)}`, margin, cursorY)
    cursorY += 14
    pdf.text(`Total VAT: ${currency} ${vatTotal.toFixed(2)}`, margin, cursorY)
    cursorY += 14
    pdf.setFont(undefined, 'bold')
      .text(`Grand Total: ${currency} ${grandTotal.toFixed(2)}`, margin, cursorY)
    pdf.setFont(undefined, 'normal')
    cursorY += 20

    // 5) Rasterize preview cells into PNG
    const previewPNGs = await Promise.all(
      rows.map(async r => {
        const node = previewRefs.current[r.id]?.current
        if (!node) return null
        const canvas = await html2canvas(node, { backgroundColor: null })
        return canvas.toDataURL('image/png')
      })
    )

    // 6) Prepare table data (no SVG columns)
    const headers = ["#","Product","Qty","Unit Price","VAT %","W (mm)","H (mm)","Line Total","Preview"]
    const body = rows.map((r, i) => {
      const lineTotal = ((r.basePrice * r.quantity) * discountFactor * (1 + r.vatRate)).toFixed(2)
      return [
        i + 1,
        r.name,
        r.quantity,
        r.basePrice.toFixed(2),
        (r.vatRate * 100).toFixed(0) + '%',
        r.widthMm,
        r.heightMm,
        lineTotal,
        '' // placeholder for the preview PNG
      ]
    })

    // 7) Draw the table with margins & fixed width
    autoTable(pdf, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      tableWidth: pageWidth - margin * 2,
      head: [headers],
      body,
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 100 },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 60, halign: 'right' },
        4: { cellWidth: 40, halign: 'right' },
        5: { cellWidth: 40, halign: 'right' },
        6: { cellWidth: 40, halign: 'right' },
        7: { cellWidth: 60, halign: 'right' },
        8: { cellWidth: 40, halign: 'center' }
      },
      didDrawCell: data => {
        // Inject the preview PNG into the last column
        if (data.section === 'body' && data.column.index === 8 && previewPNGs[data.row.index]) {
          const img = previewPNGs[data.row.index]
          const { x, y, width, height } = data.cell
          const size = Math.min(width, height) - 4
          pdf.addImage(img, 'PNG', x + 2, y + 2, size, size)
        }
      },
      willDrawCell: data => {
        // Add page numbers on the last row
        if (data.section === 'body' && data.row.index === rows.length - 1) {
          const pageCount = pdf.internal.getNumberOfPages()
          for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i).setFontSize(9)
            pdf.text(
              `Page ${i} / ${pageCount}`,
              pageWidth / 2,
              pdf.internal.pageSize.getHeight() - 20,
              { align: 'center' }
            )
          }
        }
      }
    })

    // 8) Move cursor below the table
    cursorY = pdf.lastAutoTable.finalY + 20

    // 9) Footer text
    if (footerText) {
      pdf.setFontSize(10)
      const lines = pdf.splitTextToSize(footerText, pageWidth - margin * 2)
      pdf.text(lines, margin, cursorY)
      cursorY += lines.length * 12 + 20
    }

    // 10) More options
    pdf.setFontSize(9)
    pdf.text(`Currency: ${currency}`, margin, cursorY); cursorY += 12
    if (internalContact)    pdf.text(`Contact: ${internalContact}`, margin, cursorY), cursorY += 12
    if (deliveryConditions) pdf.text(`Delivery Conditions: ${deliveryConditions}`, margin, cursorY), cursorY += 12
    if (paymentTerms)       pdf.text(`Payment Terms: ${paymentTerms}`, margin, cursorY), cursorY += 12
    pdf.text(`VAT Regulation: ${vatRegulation}`, margin, cursorY)

    // 11) Save PDF
    pdf.save(`Offer-${offerNumber}.pdf`)

    // 12) Persist & send
    const payload = {
      clientName,
      deliveryAddress,
      regarding,
      offerNumber,
      offerDate: offerDate.toISOString(),
      expiryDate: expiryDate.toISOString(),
      referenceNumber,
      headerText,
      rows,
      globalDiscount,
      footerText,
      currency,
      internalContact,
      deliveryConditions,
      paymentTerms,
      vatRegulation,
      status: 'sent',
      sentAt: new Date().toISOString(),
      ...( !offerId && { createdAt: new Date().toISOString() })
    }
    let docRef
    if (offerId) {
      docRef = doc(db, 'users', user.uid, 'offers', offerId)
      await updateDoc(docRef, payload)
    } else {
      docRef = await addDoc(collection(db, 'users', user.uid, 'offers'), payload)
    }
    const functions = getFunctions()
    const sendOffer = httpsCallable(functions, 'sendOfferEmail')
    await sendOffer({ offerId: docRef.id, uid: user.uid })
  }

  return (
    <div className="offer-form-page">
      <h1>{offerId ? 'Edit Offer' : 'Create Offer'}</h1>

    {/* Section 1: Contact & Offer Info */}
<section className="section_contact">
  <h2 className="section_contact_title">Contact & Offer Info</h2>
  <div className="section_contact_grid">
    {/* Client */}
    <div className="form_field">
      <label htmlFor="client" className="form_field_label">Client</label>
      <div className="form_field_control_group">
        <select
          id="client"
          className="form_field_control"
          value={clients.find(c => c.name === clientName)?.id || ''}
          onChange={e => {
            const sel = clients.find(c => c.id === e.target.value)
            if (sel) {
              setClientName(sel.name)
              setDeliveryAddress(sel.address)
            } else {
              setClientName('')
              setDeliveryAddress('')
            }
          }}
          required
        >
          <option value="">— Select client —</option>
          {clients.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <Link to="/clients/new" className="form_field_add_link">
          + Add Client
        </Link>
      </div>
    </div>

    {/* Offer Number */}
    <div className="form_field">
      <label htmlFor="offer_number" className="form_field_label">Offer Number</label>
      <input
        id="offer_number"
        type="text"
        className="form_field_control"
        value={offerNumber}
        onChange={e => setOfferNumber(e.target.value)}
      />
    </div>

    {/* Delivery Address */}
    <div className="form_field">
      <label htmlFor="delivery_address" className="form_field_label">Delivery Address</label>
      <input
        id="delivery_address"
        type="text"
        className="form_field_control"
        value={deliveryAddress}
        onChange={e => setDeliveryAddress(e.target.value)}
      />
    </div>

    {/* Reference # */}
    <div className="form_field">
      <label htmlFor="reference_number" className="form_field_label">Reference #</label>
      <input
        id="reference_number"
        type="text"
        className="form_field_control"
        value={referenceNumber}
        onChange={e => setReferenceNumber(e.target.value)}
      />
    </div>

    {/* Regarding */}
    <div className="form_field">
      <label htmlFor="regarding" className="form_field_label">Regarding</label>
      <input
        id="regarding"
        type="text"
        className="form_field_control"
        value={regarding}
        onChange={e => setRegarding(e.target.value)}
      />
    </div>

    {/* Offer Date */}
    <div className="form_field">
      <label htmlFor="offer_date" className="form_field_label">Offer Date</label>
      <DatePicker
        id="offer_date"
        className="form_field_control"
        selected={offerDate}
        onChange={setOfferDate}
      />
    </div>

    {/* Expiry Date */}
    <div className="form_field">
      <label htmlFor="expiry_date" className="form_field_label">Expiry Date</label>
      <DatePicker
        id="expiry_date"
        className="form_field_control"
        selected={expiryDate}
        onChange={setExpiryDate}
      />
    </div>
  </div>
</section>


      {/* Section 2: Header Text */}
      <section className="section-header">
        <h2>Header Text</h2>
        <textarea
          rows={4}
          placeholder="Custom greeting or introduction…"
          value={headerText}
          onChange={e => setHeaderText(e.target.value)}
        />
      </section>

      {/* Section 3: Line Items */}
      <section className="section-line-items">
        <button className="add-button" onClick={addRow}>
          + Add Line Item
        </button>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>VAT Rate</th>
              <th>Width (mm)</th>
              <th>Height (mm)</th>
              <th>Preview</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <ProductRow
                key={i}
                index={i}
                products={catalog}
                item={r}
                onChange={upd => updateRow(i, upd)}
                onRemove={() => removeRow(i)}
                registerPreview={ref => registerPreview(r.id, ref)}
              />
            ))}
          </tbody>
        </table>
      </section>

      {/* Section 4: Totals & Discounts */}
      <section className="section-totals">
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
        <div>Subtotal (net): {currency} {subtotalNet.toFixed(2)}</div>
        <div>
          Net after discount: {currency} {netAfterDiscount.toFixed(2)}{' '}
          (–{currency} {(subtotalNet - netAfterDiscount).toFixed(2)})
        </div>
        <div>Total VAT: {currency} {vatTotal.toFixed(2)}</div>
        <div className="grand-total">Grand Total: {currency} {grandTotal.toFixed(2)}</div>
      </section>

      {/* Section 5: Footer Text */}
      <section className="section-footer">
        <h2>Footer Text</h2>
        <textarea
          rows={3}
          value={footerText}
          onChange={e => setFooterText(e.target.value)}
        />
      </section>

      {/* Section 6: More Options */}
      <section className="section-more">
        <h2>More Options</h2>
        <div className="grid-2">
          <label>
            Currency
            <select value={currency} onChange={e => setCurrency(e.target.value)}>
              <option>EUR</option>
              <option>USD</option>
              <option>CHF</option>
            </select>
          </label>
          <label>
            Internal Contact Person
            <input
              type="text"
              value={internalContact}
              onChange={e => setInternalContact(e.target.value)}
            />
          </label>
          <label>
            Delivery Conditions
            <textarea
              rows={2}
              value={deliveryConditions}
              onChange={e => setDeliveryConditions(e.target.value)}
            />
          </label>
          <label>
            Payment Terms
            <textarea
              rows={2}
              value={paymentTerms}
              onChange={e => setPaymentTerms(e.target.value)}
            />
          </label>
          <label>
            VAT Regulation
            <select value={vatRegulation} onChange={e => setVatRegulation(e.target.value)}>
              <option value="domestic">Domestic</option>
              <option value="intra-EU">Intra-EU</option>
              <option value="export">Export</option>
              <option value="reverse">Reverse Charge</option>
            </select>
          </label>
        </div>
      </section>

      <button className="generate-button" onClick={generatePDF}>
        {offerId ? 'Update & Send' : 'Generate & Send'}
      </button>
    </div>
  )
}
