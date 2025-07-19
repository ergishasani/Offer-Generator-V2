import React, { useEffect, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'
import '../assets/styles/pages/profile.scss'

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState({
    name: '',
    address: '',
    email: '',
    phone: '',
    vatNumber: '',
    website: '',
    logoUrl: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  // Load existing profile
  useEffect(() => {
    if (!user) return
    const ref = doc(db, 'users', user.uid, 'companyProfile', 'profile')
    getDoc(ref)
      .then(snap => {
        if (snap.exists()) setProfile(snap.data())
      })
      .finally(() => setLoading(false))
  }, [user])

  const handleChange = e => {
    const { name, value } = e.target
    setProfile(prev => ({ ...prev, [name]: value }))
  }

  // Upload via Imgbb multipart/form-data
  const handleFileChange = async e => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setMessage('Uploading logo…')

    try {
      const key = import.meta.env.VITE_IMGBB_API_KEY
      const formData = new FormData()
      formData.append('image', file)
      formData.append('name', file.name) // optional

      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${key}`,
        { method: 'POST', body: formData }
      )
      const json = await res.json()

      if (json.success) {
        setProfile(prev => ({ ...prev, logoUrl: json.data.url }))
        setMessage('Logo uploaded!')
      } else {
        console.error('Imgbb error:', json)
        setMessage('Logo upload failed.')
      }
    } catch (err) {
      console.error('Upload exception:', err)
      setMessage('Error uploading logo.')
    } finally {
      setUploading(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      const ref = doc(db, 'users', user.uid, 'companyProfile', 'profile')
      await setDoc(ref, profile, { merge: true })
      setMessage('Profile saved!')
    } catch (err) {
      console.error(err)
      setMessage('Error saving profile.')
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  if (loading) return <div className="profile-page">Loading profile…</div>

  return (
    <div className="profile-page">
      <h1>Company Profile</h1>
      {message && <div className="message">{message}</div>}

      <form onSubmit={handleSubmit} className="profile-form">
        {/* Logo upload */}
        <label className="logo-upload">
          Company Logo
          {profile.logoUrl && (
            <img
              src={profile.logoUrl}
              alt="Logo preview"
              className="logo-preview"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
          {uploading && <small>Uploading…</small>}
        </label>

        {/* Other profile fields */}
        {[
          { label: 'Company Name', name: 'name' },
          { label: 'Address',      name: 'address' },
          { label: 'Contact Email',name: 'email',    type: 'email' },
          { label: 'Phone',        name: 'phone',    type: 'tel'   },
          { label: 'VAT Number',   name: 'vatNumber' },
          { label: 'Website',      name: 'website',  type: 'url'   },
        ].map(field => (
          <label key={field.name}>
            {field.label}
            <input
              type={field.type || 'text'}
              name={field.name}
              value={profile[field.name] || ''}
              onChange={handleChange}
            />
          </label>
        ))}

        <button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}
