// src/pages/DashboardPage.jsx
import React from 'react'
import DashboardFunctions  from '../components/dashboard/DashboardFunctions'
import QuickActions        from '../components/dashboard/QuickActions'
import RevenueChart        from '../components/dashboard/RevenueChart'
import InvoiceSummary      from '../components/dashboard/InvoiceSummary'
import VatPreRegistration  from '../components/dashboard/VatPreRegistration'

export default function DashboardPage() {
  return (
    <>
      {/* Sevdesk‐style function buttons */}
      <DashboardFunctions />

      <div className="dashboard-grid">
        <QuickActions />
        <RevenueChart />
        <InvoiceSummary />
        <VatPreRegistration />
      </div>
    </>
  )
}
