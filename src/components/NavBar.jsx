// src/components/NavBar.jsx
import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import '../assets/styles/components/navbar.scss'

export default function NavBar() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <ul className="nav-list">
        <li>
          <NavLink to="/dashboard" className={({isActive}) => isActive ? 'active' : ''}>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/offer" className={({isActive}) => isActive ? 'active' : ''}>
            Create Offer
          </NavLink>
        </li>
        <li>
          <NavLink to="/products" className={({isActive}) => isActive ? 'active' : ''}>
            Products
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/offers" className={({isActive}) => isActive ? 'active' : ''}>
            Offers History
          </NavLink>
        </li>
        <li>
          <NavLink to="/profile" className={({isActive}) => isActive ? 'active' : ''}>
            Profile
          </NavLink>
        </li>
        <li>
          <button onClick={handleLogout} className="logout-btn">
            Log Out
          </button>
        </li>
      </ul>
    </nav>
  )
}
