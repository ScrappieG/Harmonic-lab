import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'

import AuthCallback from './pages/AuthCallback'
import Dashboard from './pages/Dashboard'
import DashboardLayout from './pages/DashboardLayout'
import DashboardSessionDetail from './pages/DashboardSessionDetail'
import AuthExtension from './pages/AuthExtension'
import Home from './pages/Home'
import Privacy from './pages/Privacy'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return null
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path=":sessionId" element={<DashboardSessionDetail />} />
        </Route>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/auth/extension" element={<AuthExtension />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
