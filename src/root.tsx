// src/root.tsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProfilePage from './pages/ProfilePage'
import OfferFormPage from './pages/OfferFormPage'
import ProductListPage from './pages/ProductListPage'
import ProductEditPage from './pages/ProductEditPage'
import AdminOffersPage from './pages/AdminOffersPage'

import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/offer"
        element={
          <ProtectedRoute>
            <OfferFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <ProductListPage />
          </ProtectedRoute>
        }
      />
      {/* Now captures both source (global|user) and id (or "new") */}
      <Route
        path="/products/:source/:id"
        element={
          <ProtectedRoute>
            <ProductEditPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/offers"
        element={
          <ProtectedRoute>
            <AdminOffersPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/offer" replace />} />
    </Routes>
  )
}
