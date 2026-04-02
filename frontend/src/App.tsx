import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import DashboardSessionDetail from './pages/DashboardSessionDetail'
import Home from './pages/Home'
import AuthCallback from './pages/AuthCallback'
import AuthExtension from './pages/AuthExtension'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/:sessionId" element={<DashboardSessionDetail />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/auth/extension" element={<AuthExtension />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
