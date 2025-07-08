// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  collection,
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore'
import { db } from '../services/firebase'
import '../assets/styles/pages/dashboard.scss'

export default function DashboardPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  // metrics
  const [totalClients, setTotalClients] = useState(0)
  const [totalOffers, setTotalOffers] = useState(0)
  const [sentOffers, setSentOffers] = useState(0)
  const [viewedOffers, setViewedOffers] = useState(0)
  const [revenue, setRevenue] = useState(0)

  useEffect(() => {
    if (!user) return
    ;(async () => {
      // Clients count
      const clientsSnap = await getDocs(
        collection(db, 'users', user.uid, 'clients')
      )
      setTotalClients(clientsSnap.size)

      // All offers
      const offersSnap = await getDocs(
        query(
          collection(db, 'users', user.uid, 'offers'),
          orderBy('createdAt', 'desc')
        )
      )
      const allOffers = offersSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      setTotalOffers(allOffers.length)

      // Sent and viewed counts, and revenue
      let sent = 0, viewed = 0, sum = 0
      allOffers.forEach(o => {
        if (o.status === 'sent' || o.status === 'viewed' || o.status === 'accepted') sent++
        if (o.status === 'viewed' || o.status === 'accepted') viewed++
        if (o.grandTotal) sum += parseFloat(o.grandTotal)
      })
      setSentOffers(sent)
      setViewedOffers(viewed)
      setRevenue(sum)

      setLoading(false)
    })()
  }, [user])

  if (loading) return <div>Loading dashboard…</div>

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      <div className="metrics-grid">
        <div className="metric">
          <h2>{totalClients}</h2>
          <p>Clients</p>
        </div>
        <div className="metric">
          <h2>{totalOffers}</h2>
          <p>Total Offers</p>
        </div>
        <div className="metric">
          <h2>{sentOffers}</h2>
          <p>Offers Sent</p>
        </div>
        <div className="metric">
          <h2>{viewedOffers}</h2>
          <p>Offers Viewed</p>
        </div>
        <div className="metric">
          <h2>{revenue.toFixed(2)}</h2>
          <p>Total Revenue</p>
        </div>
      </div>
    </div>
  )
}
