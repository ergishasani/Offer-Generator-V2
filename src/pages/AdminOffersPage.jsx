// src/pages/AdminOffersPage.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc            // ← import deleteDoc
} from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { db } from '../services/firebase'
import '../assets/styles/pages/admin-offers.scss'

export default function AdminOffersPage() {
  const { user } = useAuth()
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const nav = useNavigate()

  // Fetch all offers
  useEffect(() => {
    if (!user) return
    ;(async () => {
      const q = query(
        collection(db, 'users', user.uid, 'offers'),
        orderBy('createdAt', 'desc')
      )
      const snap = await getDocs(q)
      setOffers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })()
  }, [user])

  const handleSendEmail = async offer => {
    const functions = getFunctions()
    const sendOffer = httpsCallable(functions, 'sendOfferEmail')
    await sendOffer({ offerId: offer.id, uid: user.uid })
    const ref = doc(db, 'users', user.uid, 'offers', offer.id)
    const sentAt = new Date().toISOString()
    await updateDoc(ref, { status: 'sent', sentAt })
    setOffers(offers.map(o =>
      o.id === offer.id ? { ...o, status: 'sent', sentAt } : o
    ))
  }

  // ← new delete handler
  const handleDelete = async offerId => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return
    const ref = doc(db, 'users', user.uid, 'offers', offerId)
    await deleteDoc(ref)
    setOffers(offers.filter(o => o.id !== offerId))
  }

  if (loading) return <div>Loading offer history…</div>

  return (
    <div className="admin-offers-page">
      <h1>Offer History</h1>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Client</th>
            <th>Offer #</th>
            <th>Date</th>
            <th>Status</th>
            <th>Sent At</th>
            <th>Viewed At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {offers.map((o, i) => (
            <tr key={o.id}>
              <td>{i + 1}</td>
              <td>{o.clientName}</td>
              <td>{o.offerNumber}</td>
              <td>{new Date(o.offerDate).toLocaleDateString()}</td>
              <td>{o.status || 'draft'}</td>
              <td>
                {o.sentAt
                  ? new Date(o.sentAt).toLocaleDateString() +
                    ' ' +
                    new Date(o.sentAt).toLocaleTimeString()
                  : '—'}
              </td>
              <td>
                {o.viewedAt
                  ? new Date(o.viewedAt).toLocaleDateString() +
                    ' ' +
                    new Date(o.viewedAt).toLocaleTimeString()
                  : '—'}
              </td>
              <td className="actions-cell">
                <button
                  onClick={() => nav('/offer', { state: { offerId: o.id } })}
                >
                  Edit/Re-generate
                </button>
                {o.status === 'draft' && (
                  <button
                    className="send-btn"
                    onClick={() => handleSendEmail(o)}
                  >
                    Send Email
                  </button>
                )}
                {/* ← your new delete button */}
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(o.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
  