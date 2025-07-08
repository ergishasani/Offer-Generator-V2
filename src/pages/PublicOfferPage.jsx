// src/pages/PublicOfferPage.jsx
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import '../assets/styles/pages/public-offer.scss'

export default function PublicOfferPage() {
  const { offerId } = useParams()
  const [pdfUrl, setPdfUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        // Fetch the Firestore record to get storage path or regenerate URL
        const snap = await getDoc(doc(db, 'offersPublic', offerId))
        if (!snap.exists()) throw new Error('Offer not found')
        const { pdfPath, ownerUid } = snap.data()

        // Update viewedAt
        const offerRef = doc(db, 'users', ownerUid, 'offers', offerId)
        await updateDoc(offerRef, { viewedAt: new Date().toISOString(), status: 'viewed' })

        // Generate a signed URL or public link for pdfPath
        // (Assuming you uploaded your PDF to storage at `pdfPath`)
        const url = await getDownloadURL(ref(storage, pdfPath))
        setPdfUrl(url)
      } catch (err) {
        console.error(err)
        setError('Unable to load this offer.')
      } finally {
        setLoading(false)
      }
    })()
  }, [offerId])

  if (loading) return <p>Loading…</p>
  if (error) return <p>{error}</p>

  return (
    <div className="public-offer-page">
      <h1>Your Offer</h1>
      <iframe src={pdfUrl} title="Offer PDF" width="100%" height="800px" />
    </div>
  )
}
