import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import AddProduct from './pages/AddProduct'
import EditProduct from './pages/EditProduct'
import Orders from './pages/Orders'
import DiagnosticPage from './pages/DiagnosticPage'

function App() {
  const handleLogout = () => {
    // Implement logout logic here
    console.log('User logged out')
    window.location.href = '/'
  }

  return (
    <Router>
      <Toaster position="top-right" />
      <div className="flex">
        {/* Sidebar */}
        <Sidebar onLogout={handleLogout} />

        {/* Main Content */}
        <div className="flex-1 ml-64 pt-16">
          <Navbar />
          
          {/* Page Content */}
          <div className="p-8 min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<EditProduct />} />
              <Route path="/add-product" element={<AddProduct />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/diagnostic" element={<DiagnosticPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  )
}

export default App
