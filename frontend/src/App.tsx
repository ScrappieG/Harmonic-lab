import { BrowserRouter, Route, Routes } from 'react-router-dom'

import AuthCallback from './pages/AuthCallback'
import Dashboard from './pages/Dashboard'
import DashboardLayout from './pages/DashboardLayout'
import DashboardSessionDetail from './pages/DashboardSessionDetail'
import Home from './pages/Home'

function App() {
  return (
    <BrowserRouter>
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
