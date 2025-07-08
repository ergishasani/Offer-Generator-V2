import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { collection, getDocs, orderBy, query, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../services/firebase'
import '../assets/styles/pages/client-list.scss'

export default function ClientListPage() {
  const { user } = useAuth()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const nav = useNavigate()

  useEffect(() => {
    if (!user) return
    ;(async () => {
      const q = query(
        collection(db, 'users', user.uid, 'clients'),
        orderBy('name', 'asc')
      )
      const snap = await getDocs(q)
      setClients(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })()
  }, [user])

  const handleDelete = async id => {
    if (!window.confirm('Delete this client?')) return
    await deleteDoc(doc(db, 'users', user.uid, 'clients', id))
    setClients(cs => cs.filter(c => c.id !== id))
  }

  if (loading) return <div>Loading clients…</div>

  return (
    <div className="client-list-page">
      <h1>Clients</h1>
      <Link to="/clients/new" className="btn">+ New Client</Link>
      <table>
        <thead>
          <tr><th>Name</th><th>Address</th><th>Contact Email</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {clients.map(c => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.address}</td>
              <td>{c.email || '—'}</td>
              <td>
                <button onClick={() => nav(`/clients/${c.id}`)}>Edit</button>
                <button onClick={() => handleDelete(c.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
