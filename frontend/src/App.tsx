import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import DashboardSessionDetail from './pages/DashboardSessionDetail'
import Home from './pages/Home'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/:sessionId" element={<DashboardSessionDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
