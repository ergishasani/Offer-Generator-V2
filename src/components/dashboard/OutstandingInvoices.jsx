// src/components/dashboard/OutstandingInvoices.jsx
import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../services/firebase'
import {
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore'
import Card from '../Card'

export default function OutstandingInvoices() {
  const { user } = useAuth()
  const [total, setTotal] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!user) return

    async function fetchOutstanding() {
      // 1) only offers with status "sent"
      const offersCol = collection(db, 'users', user.uid, 'offers')
      const q = query(offersCol, where('status', '==', 'sent'))
      const snap = await getDocs(q)

      // 2) sum up each row: basePrice * quantity * (1 + vatRate)
      let sum = 0
      snap.forEach(doc => {
        const data = doc.data()
        if (data.amount != null) {
          // if you already store total on the doc
          sum += data.amount
        } else if (Array.isArray(data.rows)) {
          data.rows.forEach(li => {
            const base   = li.basePrice   || 0
            const qty    = li.quantity    || 0
            const vat    = li.vatRate     || 0
            sum += base * qty * (1 + vat)
          })
        }
      })

      setTotal(sum)
      setCount(snap.size)
    }

    fetchOutstanding()
  }, [user])

  return (
    <Card className="dashboard-card outstanding-invoices">
      <h3>Ausstehende Rechnungen</h3>
      <div className="outstanding-content">
        <strong>{total.toFixed(2)} €</strong>
        <span>{count} Rechnungen offen</span>
      </div>
    </Card>
  )
}
