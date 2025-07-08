// src/components/ProtectedLayout.jsx
import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import '../assets/styles/components/protected-layout.scss'

export default function ProtectedLayout({ children }) {
  const { logout } = useAuth()
  const nav = useNavigate()

  const handleLogout = async () => {
    await logout()
    nav('/login')
  }

  return (
    <div className="protected-layout">
      <aside className="sidebar">
        <h2 className="logo">OfferGen</h2>
        <nav>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
            Dashboard
          </NavLink>
          <NavLink to="/clients" className={({ isActive }) => isActive ? 'active' : ''}>
            Clients
          </NavLink>
          <NavLink to="/offer" className={({ isActive }) => isActive ? 'active' : ''}>
            New Offer
          </NavLink>
          <NavLink to="/admin/offers" className={({ isActive }) => isActive ? 'active' : ''}>
            Offer History
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => isActive ? 'active' : ''}>
            Products
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>
            Company Profile
          </NavLink>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>
          Log Out
        </button>
      </aside>
      <main className="content">
        {children}
      </main>
    </div>
  )
}
