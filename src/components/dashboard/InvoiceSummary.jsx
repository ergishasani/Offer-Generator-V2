// src/components/dashboard/InvoiceSummary.jsx
import React, { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../services/firebase'
import {
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore'
import Card from '../Card'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
)

export default function InvoiceSummary() {
  const { user } = useAuth()

  // Labels & sums for chart
  const [labels, setLabels] = useState([])
  const [monthlyTotals, setMonthlyTotals] = useState([])

  // Last-month summary
  const [lastCount, setLastCount] = useState(0)
  const [lastTotal, setLastTotal] = useState(0)

  useEffect(() => {
    if (!user) return

    async function loadInvoices() {
      const now = new Date()
      // Build 12 month buckets
      const buckets = Array.from({ length: 12 }).map((_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
        return {
          label: d.toLocaleString('default', { month: 'short' }),
          year: d.getFullYear(),
          month: d.getMonth(),
          total: 0,
          count: 0,
        }
      })

      // Fetch sent offers = invoices
      const offersRef = collection(db, 'users', user.uid, 'offers')
      const q = query(offersRef, where('status', '==', 'sent'))
      const snap = await getDocs(q)

      snap.forEach(doc => {
        const data = doc.data()
        if (!data.createdAt || !data.rows) return

        // Sum this invoice
        const sum = Object.values(data.rows).reduce((acc, item) => {
          const base = parseFloat(item.basePrice) || 0
          const qty  = parseFloat(item.quantity)  || 0
          const vat  = parseFloat(item.vatRate)   || 0
          return acc + base * qty * (1 + vat)
        }, 0)

        // Determine bucket
        const date = data.createdAt.toDate()
        const idx = buckets.findIndex(
          b => b.year === date.getFullYear() && b.month === date.getMonth()
        )
        if (idx >= 0) {
          buckets[idx].total += sum
          buckets[idx].count += 1
        }
      })

      // Prepare chart & summary
      setLabels(buckets.map(b => b.label))
      setMonthlyTotals(buckets.map(b => b.total))

      // Last month is the second‐to‐last bucket
      const lastBucket = buckets[buckets.length - 2] || { total: 0, count: 0 }
      setLastCount(lastBucket.count)
      setLastTotal(lastBucket.total)
    }

    loadInvoices()
  }, [user])

  const data = {
    labels,
    datasets: [
      {
        label: 'Monthly Invoice Total',
        data: monthlyTotals,
        borderColor: '#61E2A2',
        backgroundColor: 'rgba(97,226,162,0.2)',
        tension: 0.3,
        pointRadius: 4,
        fill: true,
      },
    ],
  }

  const options = {
    maintainAspectRatio: false,
    scales: {
      y: {
        ticks: {
          callback: v => `€${(v / 1000).toFixed(1)}k`,
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: ctx => `€${ctx.parsed.y.toFixed(2)}`,
        },
      },
      legend: { display: false },
    },
  }

  return (
    <Card className="dashboard-card invoice-summary">
      {/* Header: big number + small summary */}
      <header className="card-header" style={{ justifyContent: 'space-between' }}>
        <div>
          <h3>Invoice Summary</h3>
          <strong style={{ fontSize: '2rem' }}>€{lastTotal.toFixed(2)}</strong>
          <div style={{ color: '#666' }}>
            {lastCount} invoices last month
          </div>
        </div>
        <a href="/dashboard/invoices" style={{ fontSize: '0.9rem' }}>
          View all →
        </a>
      </header>

      {/* Line chart */}
      <div style={{ height: 240 }}>
        <Line data={data} options={options} />
      </div>

      {/* Period selector (if desired) */}
      <div style={{ padding: '0.75rem 1rem', color: '#666' }}>
        Last 12 months ▼
      </div>
    </Card>
  )
}
