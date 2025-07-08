import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import '../assets/styles/pages/client-edit.scss'

export default function ClientEditPage() {
  const { user } = useAuth()
  const { id } = useParams()      // "new" or existing ID
  const isNew = id === 'new'
  const nav = useNavigate()

  const [client, setClient] = useState({
    name: '',
    address: '',
    email: '',
    phone: '',
  })
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user || isNew) return setLoading(false)
    ;(async () => {
      const snap = await getDoc(doc(db, 'users', user.uid, 'clients', id))
      if (snap.exists()) setClient(snap.data())
      setLoading(false)
    })()
  }, [user, id, isNew])

  const handleChange = e => setClient(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    const ref = isNew
      ? doc(collection(db, 'users', user.uid, 'clients').doc()) // auto-ID
      : doc(db, 'users', user.uid, 'clients', id)
    await setDoc(ref, client, { merge: true })
    setSaving(false)
    nav('/clients')
  }

  if (loading) return <div>Loading client…</div>

  return (
    <div className="client-edit-page">
      <h1>{isNew ? 'New Client' : 'Edit Client'}</h1>
      <form onSubmit={handleSubmit}>
        {[
          { label: 'Name', name: 'name' },
          { label: 'Address', name: 'address' },
          { label: 'Email', name: 'email', type: 'email' },
          { label: 'Phone', name: 'phone', type: 'tel' },
        ].map(f => (
          <label key={f.name}>
            {f.label}
            <input
              type={f.type || 'text'}
              name={f.name}
              value={client[f.name] || ''}
              onChange={handleChange}
              required={f.name === 'name'}
            />
          </label>
        ))}
        <button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save Client'}
        </button>
      </form>
    </div>
  )
}
