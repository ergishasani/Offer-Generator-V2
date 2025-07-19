// src/components/dashboard/DashboardFunctions.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaFileInvoice, FaUpload, FaMoneyCheckAlt, FaCalculator } from 'react-icons/fa'
import '../../assets/styles/components/dashboardFunctions.scss' // Assuming you have a CSS file for styling

export default function DashboardFunctions() {
  const nav = useNavigate()

  return (
    <div className="dashboard-functions">
      <button onClick={() => nav('/offer')}>
        <FaFileInvoice size={20} />
        <span>Write Invoice</span>
      </button>
      <button onClick={() => nav('/expenses/upload')}>
        <FaUpload size={20} />
        <span>Upload Expense</span>
      </button>
      <button onClick={() => nav('/payments')}>
        <FaMoneyCheckAlt size={20} />
        <span>Assign Payments</span>
      </button>
      <button onClick={() => nav('/vat')}>
        <FaCalculator size={20} />
        <span>Prepare VAT</span>
      </button>
    </div>
  )
}
