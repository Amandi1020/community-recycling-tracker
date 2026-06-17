import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Register from './pages/auth/Register'
import Login from './pages/auth/Login'
import ResidentDashboard from './pages/resident/Dashboard'
import PostItem from './pages/resident/PostItem'
import MyListings from './pages/resident/MyListings'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Resident Routes */}
        <Route path="/resident/dashboard" element={
          <PrivateRoute role="resident">
            <ResidentDashboard />
          </PrivateRoute>
        } />
        <Route path="/resident/post" element={
          <PrivateRoute role="resident">
            <PostItem />
          </PrivateRoute>
        } />
        <Route path="/resident/listings" element={
          <PrivateRoute role="resident">
            <MyListings />
          </PrivateRoute>
        } />

      </Routes>
    </BrowserRouter>
  )
}

export default App