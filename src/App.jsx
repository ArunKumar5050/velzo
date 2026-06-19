import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ROLES, getDefaultRoute } from './config/rbac'

import { Sidebar, Navbar, LoadingSpinner, ProtectedRoute } from './components'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import AddProduct from './pages/AddProduct'
import EditProduct from './pages/EditProduct'
import Orders from './pages/Orders'
import DiagnosticPage from './pages/DiagnosticPage'
import Login from './pages/Login'
import Doctors from './pages/Doctors'
import AddDoctor from './pages/AddDoctor'
import EditDoctor from './pages/EditDoctor'
import BillScanner from './pages/BillScanner'
import LabAppointments from './pages/LabAppointments'
import ManageStores from './pages/ManageStores'
import ManageLabs from './pages/ManageLabs'
import Analytics from './pages/Analytics'

function AppContent() {
  const { user, role, loading, logout, entityData } = useAuth()

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><LoadingSpinner message="Loading Dashboard..." /></div>
  }

  if (!user) {
    return (
      <>
        <Toaster position="top-right" />
        <Login />
      </>
    )
  }

  return (
    <Router>
      <Toaster position="top-right" />
      <div className="flex">
        {/* Sidebar */}
        <Sidebar onLogout={logout} role={role} entityData={entityData} />

        {/* Main Content */}
        <div className="flex-1 ml-64 pt-16">
          <Navbar role={role} entityData={entityData} />
          
          {/* Page Content */}
          <div className="p-8 min-h-screen bg-gray-50">
            <Routes>
              {/* Dashboard - Accessible to all roles */}
              <Route path="/" element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MEDICAL_STORE, ROLES.LABORATORY]}>
                  <Dashboard />
                </ProtectedRoute>
              } />

              {/* Products - Admin & Medical Store */}
              <Route path="/products" element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MEDICAL_STORE]}>
                  <Products />
                </ProtectedRoute>
              } />
              
              {/* Add/Edit Product - Admin Only */}
              <Route path="/add-product" element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <AddProduct />
                </ProtectedRoute>
              } />
              <Route path="/products/:id" element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <EditProduct />
                </ProtectedRoute>
              } />

              {/* Orders - Admin & Medical Store */}
              <Route path="/orders" element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MEDICAL_STORE]}>
                  <Orders />
                </ProtectedRoute>
              } />

              {/* Bill Scanner - Admin & Medical Store */}
              <Route path="/bill-scanner" element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MEDICAL_STORE]}>
                  <BillScanner />
                </ProtectedRoute>
              } />

              {/* Lab Appointments - Admin & Laboratory */}
              <Route path="/lab-appointments" element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.LABORATORY]}>
                  <LabAppointments />
                </ProtectedRoute>
              } />

              {/* Doctors - Admin Only */}
              <Route path="/doctors" element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <Doctors />
                </ProtectedRoute>
              } />
              <Route path="/add-doctor" element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <AddDoctor />
                </ProtectedRoute>
              } />
              <Route path="/doctors/:id" element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <EditDoctor />
                </ProtectedRoute>
              } />

              {/* Diagnostic - Admin Only */}
              <Route path="/diagnostic" element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <DiagnosticPage />
                </ProtectedRoute>
              } />

              {/* Management & Analytics - Admin Only */}
              <Route path="/manage-stores" element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <ManageStores />
                </ProtectedRoute>
              } />
              <Route path="/manage-labs" element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <ManageLabs />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <Analytics />
                </ProtectedRoute>
              } />

              {/* Fallback */}
              <Route path="*" element={<Navigate to={getDefaultRoute(role)} replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
