// src/pages/OfferFormPage.jsx
import React, { useState, useRef, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
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
    getDoc(doc(db, 'users', user.uid, 'companyProfile', 'profile')).then(snap => {
      if (snap.exists()) setCompanyProfile(snap.data())
    })
  }, [user])

  // Product catalog
  const [catalog, setCatalog] = useState([])
  useEffect(() => {
    if (!user) return
    ;(async () => {
      const globalSnap = await getDocs(query(collection(db, 'products')))
      const global = globalSnap.docs.map(d => ({ id: d.id, source: 'global', ...d.data() }))
      const userSnap = await getDocs(query(collection(db, 'users', user.uid, 'products')))
      const userList = userSnap.docs.map(d => ({ id: d.id, source: 'user', ...d.data() }))
      setCatalog([...global, ...userList])
    })()
  }, [user])

  // Clients for dropdown
  const [clients, setClients] = useState([])
  useEffect(() => {
    if (!user) return
    ;(async () => {
      const snap = await getDocs(collection(db, 'users', user.uid, 'clients'))
      setClients(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })()
  }, [user])

  // Section 1: Contact & Offer Info
  const [clientName, setClientName] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [regarding, setRegarding] = useState('')
  const [offerNumber, setOfferNumber] = useState(Date.now().toString())
  const [offerDate, setOfferDate] = useState(new Date())
  const [expiryDate, setExpiryDate] = useState(new Date(Date.now() + 7 * 86400000))
  const [referenceNumber, setReferenceNumber] = useState('')

  // Section 2: Header Text
  const [headerText, setHeaderText] = useState('')

  // Section 3: Line Items
  const [rows, setRows] = useState([
    { id: '', name: '', quantity: 1, basePrice: 0, vatRate: 0.2, widthMm: 0, heightMm: 0 }
  ])
  const previewRefs = useRef([])
  const registerPreview = ref => previewRefs.current.push(ref)
  const updateRow = (idx, updated) =>
    setRows(old => { const c = [...old]; c[idx] = updated; return c })
  const addRow = () =>
    setRows(old => [
      ...old,
      { id: '', name: '', quantity: 1, basePrice: 0, vatRate: 0.2, widthMm: 0, heightMm: 0 }
    ])
  const removeRow = idx =>
    setRows(old => old.filter((_, i) => i !== idx))

  // Section 4: Totals & Discounts
  const [globalDiscount, setGlobalDiscount] = useState(0)
  const subtotalNet = rows.reduce((sum, r) => sum + r.basePrice * r.quantity, 0)
  const discountFactor = 1 - globalDiscount / 100
  const netAfterDiscount = subtotalNet * discountFactor
  const vatTotal = rows.reduce(
    (sum, r) => sum + r.basePrice * r.quantity * discountFactor * r.vatRate,
    0
  )
  const grandTotal = netAfterDiscount + vatTotal

  // Section 5: Footer Text
  const [footerText, setFooterText] = useState('Thank you for your business.')

  // Section 6: More Options
  const [currency, setCurrency] = useState('EUR')
  const [internalContact, setInternalContact] = useState('')
  const [deliveryConditions, setDeliveryConditions] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('')
  const [vatRegulation, setVatRegulation] = useState('domestic')

  // Prefill existing offer if editing
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
      previewRefs.current = []
    })()
  }, [user, offerId])

  // Generate PDF, save & send
  const generatePDF = async () => {
    // Capture previews
    const elements = previewRefs.current.map(r => r.current).filter(el => el instanceof HTMLElement)
    const imgs = await Promise.all(
      elements.map(el => html2canvas(el, { backgroundColor: null }).then(c => c.toDataURL('image/png')))
    )

    // Create PDF
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
    let y = 40
    if (companyProfile) {
      pdf.setFontSize(14)
      pdf.text(companyProfile.name || '', 40, y)
      pdf.setFontSize(10)
      companyProfile.address && pdf.text(companyProfile.address, 40, y + 16)
      y += 40
    }

    // Section 1
    pdf.setFontSize(12)
    pdf.text(`Client: ${clientName}`, 40, y)
    pdf.text(`Offer #: ${offerNumber}`, 300, y); y += 16
    pdf.text(`Date: ${offerDate.toLocaleDateString()}`, 40, y)
    pdf.text(`Expires: ${expiryDate.toLocaleDateString()}`, 300, y); y += 16
    if (referenceNumber) { pdf.text(`Ref/Order #: ${referenceNumber}`, 40, y); y += 16 }
    if (regarding) { pdf.text(`Regarding: ${regarding}`, 40, y); y += 20 }

    // Section 2
    if (headerText) {
      const lines = pdf.splitTextToSize(headerText, 500)
      pdf.setFontSize(11)
      pdf.text(lines, 40, y)
      y += lines.length * 14 + 20
    }

    // Section 4
    pdf.setFontSize(12)
    pdf.text(`Subtotal (net): ${currency} ${subtotalNet.toFixed(2)}`, 40, y); y += 14
    pdf.text(`Discount (${globalDiscount}%): - ${currency} ${(subtotalNet - netAfterDiscount).toFixed(2)}`, 40, y); y += 14
    pdf.text(`Net after discount: ${currency} ${netAfterDiscount.toFixed(2)}`, 40, y); y += 14
    pdf.text(`Total VAT: ${currency} ${vatTotal.toFixed(2)}`, 40, y); y += 14
    pdf.setFont(undefined, 'bold')
    pdf.text(`Grand Total: ${currency} ${grandTotal.toFixed(2)}`, 40, y)
    pdf.setFont(undefined, 'normal')
    y += 20

    // Section 3
    rows.forEach((r, i) => {
      pdf.setFontSize(11)
      pdf.text(`Item ${i + 1}: ${r.name}`, 40, y)
      const w = r.widthMm * 3.78, h = r.heightMm * 3.78
      pdf.addImage(imgs[i], 'PNG', 40, y + 10, w, h)
      y += h + 30
    })

    // Section 5
    if (footerText) {
      const lines = pdf.splitTextToSize(footerText, 500)
      pdf.setFontSize(10)
      pdf.text(lines, 40, y)
      y += lines.length * 12 + 20
    }

    // Section 6
    pdf.setFontSize(10)
    pdf.text(`Currency: ${currency}`, 40, y); y += 14
    if (internalContact) { pdf.text(`Contact: ${internalContact}`, 40, y); y += 14 }
    if (deliveryConditions) {
      pdf.text('Delivery Conditions:', 40, y); y += 12
      pdf.text(pdf.splitTextToSize(deliveryConditions, 500), 40, y)
      y += pdf.splitTextToSize(deliveryConditions, 500).length * 12 + 8
    }
    if (paymentTerms) {
      pdf.text('Payment Terms:', 40, y); y += 12
      pdf.text(pdf.splitTextToSize(paymentTerms, 500), 40, y)
      y += pdf.splitTextToSize(paymentTerms, 500).length * 12 + 8
    }
    pdf.text(`VAT Regulation: ${vatRegulation}`, 40, y)

    // Save PDF
    pdf.save(`Offer-${offerNumber}.pdf`)

    // Prepare Firestore data
    const data = {
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
      ...( !offerId && { createdAt: new Date().toISOString() } )
    }

    // Save or update
    let docRef
    if (offerId) {
      docRef = doc(db, 'users', user.uid, 'offers', offerId)
      await updateDoc(docRef, data)
    } else {
      docRef = await addDoc(collection(db, 'users', user.uid, 'offers'), data)
    }

    // Send email
    const functions = getFunctions()
    const sendOffer = httpsCallable(functions, 'sendOfferEmail')
    await sendOffer({ offerId: docRef.id, uid: user.uid })
  }

  return (
    <div className="offer-form-page">
      <h1>{offerId ? 'Edit Offer' : 'Create Offer'}</h1>

      {/* Section 1 */}
      <section className="section-contact">
        <h2>Contact & Offer Info</h2>
        <div className="grid-2">
          <label>
            Client
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <select
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
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <Link to="/clients/new">+ Add Client</Link>
            </div>
          </label>
          <label>
            Offer Number
            <input type="text" value={offerNumber} onChange={e => setOfferNumber(e.target.value)} />
          </label>
          <label>
            Delivery Address
            <input type="text" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} />
          </label>
          <label>
            Reference #
            <input type="text" value={referenceNumber} onChange={e => setReferenceNumber(e.target.value)} />
          </label>
          <label>
            Regarding
            <input type="text" value={regarding} onChange={e => setRegarding(e.target.value)} />
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
      <section className="section-header">
        <h2>Header Text</h2>
        <textarea
          rows={4}
          placeholder="Custom greeting or introduction..."
          value={headerText}
          onChange={e => setHeaderText(e.target.value)}
        />
      </section>

      {/* Section 3 */}
      <section className="section-line-items">
        <button className="add-button" onClick={addRow}>+ Add Line Item</button>
        <table>
          <thead>
            <tr>
              <th></th><th>Product</th><th>Qty</th><th>Unit Price</th><th>VAT Rate</th><th>Width (mm)</th><th>Height (mm)</th><th>Preview</th>
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
                registerPreview={registerPreview}
              />
            ))}
          </tbody>
        </table>
      </section>

      {/* Section 4 */}
      <section className="section-totals">
        <h2>Totals & Discounts</h2>
        <label>
          Global Discount (%)<input type="number" value={globalDiscount} onChange={e => setGlobalDiscount(parseFloat(e.target.value))} step="0.1" min="0" />
        </label>
        <div>Subtotal (net): {currency} {subtotalNet.toFixed(2)}</div>
        <div>Net after discount: {currency} {netAfterDiscount.toFixed(2)} (–{currency} {(subtotalNet - netAfterDiscount).toFixed(2)})</div>
        <div>Total VAT: {currency} {vatTotal.toFixed(2)}</div>
        <div className="grand-total">Grand Total: {currency} {grandTotal.toFixed(2)}</div>
      </section>

      {/* Section 5 */}
      <section className="section-footer">
        <h2>Footer Text</h2>
        <textarea rows={3} value={footerText} onChange={e => setFooterText(e.target.value)} />
      </section>

      {/* Section 6 */}
      <section className="section-more">
        <h2>More Options</h2>
        <div className="grid-2">
          <label>
            Currency
            <select value={currency} onChange={e => setCurrency(e.target.value)}>
              <option>EUR</option><option>USD</option><option>CHF</option>
            </select>
          </label>
          <label>
            Internal Contact Person<input type="text" value={internalContact} onChange={e => setInternalContact(e.target.value)} />
          </label>
          <label>
            Delivery Conditions<textarea rows={2} value={deliveryConditions} onChange={e => setDeliveryConditions(e.target.value)} /></label>
          <label>
            Payment Terms<textarea rows={2} value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} /></label>
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
