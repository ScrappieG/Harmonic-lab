import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'

import AuthCallback from './pages/AuthCallback'
import Dashboard from './pages/Dashboard'
import DashboardLayout from './pages/DashboardLayout'
import DashboardSessionDetail from './pages/DashboardSessionDetail'
import Home from './pages/Home'

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
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path=":sessionId" element={<DashboardSessionDetail />} />
        </Route>
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
