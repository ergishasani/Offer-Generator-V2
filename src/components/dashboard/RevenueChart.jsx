// src/components/dashboard/RevenueChart.jsx
import React, { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
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
  Tooltip
)

export default function RevenueChart() {
  const { user } = useAuth()
  const [labels, setLabels] = useState([])
  const [totals, setTotals] = useState([])

  useEffect(() => {
    if (!user) return

    async function load() {
      const now = new Date()
      // Prepare 7 month buckets
      const months = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1)
        return {
          label: d.toLocaleString('default', { month: 'short' }),
          year: d.getFullYear(),
          total: 0,
        }
      })

      // Fetch all sent offers
      const offersRef = collection(db, 'users', user.uid, 'offers')
      const q = query(offersRef, where('status', '==', 'sent'))
      const snap = await getDocs(q)

      snap.forEach(doc => {
        const data = doc.data()
        if (!Array.isArray(data.rows) || !data.createdAt) return

        // Sum basePrice*quantity for this offer
        const offerSum = data.rows.reduce((sum, item) => {
          const base = parseFloat(item.basePrice) || 0
          const qty  = parseFloat(item.quantity)  || 0
          return sum + base * qty
        }, 0)

        // Bucket into month
        const date = data.createdAt.toDate()
        const idx = months.findIndex(
          m =>
            m.year === date.getFullYear() &&
            m.label === date.toLocaleString('default', { month: 'short' })
        )
        if (idx >= 0) months[idx].total += offerSum
      })

      setLabels(months.map(m => m.label))
      setTotals(months.map(m => m.total))
    }

    load()
  }, [user])

  const data = {
    labels,
    datasets: [{
      label: 'Revenue',
      data: totals,
      borderColor: '#61E2A2',
      backgroundColor: 'rgba(97,226,162,0.2)',
      tension: 0.3,
      pointRadius: 4,
      fill: true,
    }],
  }

  const options = {
    maintainAspectRatio: false,
    scales: {
      y: {
        ticks: { callback: v => `€${(v/1000).toFixed(1)}k` },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: ctx => `€${ctx.parsed.y.toFixed(2)}`
        }
      }
    }
  }

  return (
    <Card className="dashboard-card revenue-chart">
      <header className="card-header" style={{ justifyContent: 'space-between' }}>
        <div>
          <h3>Revenue Flow</h3>
          <small>Monthly Totals</small>
        </div>
        <a href="/dashboard/revenue">View all →</a>
      </header>
      <div style={{ height: 240 }}>
        <Line data={data} options={options} />
      </div>
    </Card>
  )
}
