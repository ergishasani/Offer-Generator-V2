import React from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../Card'

export default function QuickActions({ className = '' }) {
  const nav = useNavigate()
  return (
    <Card className={`dashboard-card quick-actions ${className}`}>
      <button onClick={() => nav('/offer')}>
        📄<br/>Rechnung schreiben
      </button>
      <button onClick={() => nav('/expenses/upload')}>
        📤<br/>Ausgabe hochladen
      </button>
      <button onClick={() => nav('/payments/assign')}>
        🏦<br/>Zahlungen zuordnen
      </button>
      <button onClick={() => nav('/vat/prepare')}>
        ✏️<br/>UStVA vorbereiten
      </button>
    </Card>
  )
}
