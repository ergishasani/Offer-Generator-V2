// src/root.tsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProfilePage from './pages/ProfilePage'
import DashboardPage from './pages/DashboardPage'
import ClientListPage from './pages/ClientListPage'
import ClientEditPage from './pages/ClientEditPage'
import OfferFormPage from './pages/OfferFormPage'
import ProductListPage from './pages/ProductListPage'
import ProductEditPage from './pages/ProductEditPage'
import AdminOffersPage from './pages/AdminOffersPage'
import PublicOfferPage from './pages/PublicOfferPage'   // ← import public viewer

import ProtectedRoute from './components/ProtectedRoute'
import ProtectedLayout from './components/ProtectedLayout'

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/view/:offerId" element={<PublicOfferPage />} />  {/* public PDF viewer */}

      {/* Protected */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <ProfilePage />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <DashboardPage />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <ClientListPage />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients/:id"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <ClientEditPage />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/offer"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <OfferFormPage />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <ProductListPage />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/:source/:id"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <ProductEditPage />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/offers"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <AdminOffersPage />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/offer" replace />} />
    </Routes>
  )
}
