// src/components/NavBar.jsx
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function NavBar() {
  const { logout } = useAuth()
  const nav = useNavigate()
  return (
    <nav>
      <NavLink to="/profile">Profile</NavLink> |{" "}
      <NavLink to="/products">Products</NavLink> |{" "}
      <NavLink to="/offer">New Offer</NavLink> |{" "}
      <NavLink to="/admin/offers">History</NavLink> |{" "}
      <button onClick={() => { logout(); nav('/login') }}>
        Logout
      </button>
    </nav>
  )
}
