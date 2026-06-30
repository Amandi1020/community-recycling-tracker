import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Register from './pages/auth/Register'
import Login from './pages/auth/Login'
import ResidentDashboard from './pages/resident/Dashboard'
import PostItem from './pages/resident/PostItem'
import MyListings from './pages/resident/MyListings'
import Leaderboard from './pages/resident/Leaderboard'
import CollectorDashboard from './pages/collector/Dashboard'
import BrowseItems from './pages/collector/BrowseItems'
import History from './pages/collector/History'
import AdminDashboard from './pages/admin/Dashboard'
import Users from './pages/admin/Users'
import PrivateRoute from './components/PrivateRoute'
import Categories from './pages/admin/Categories'
import Collectors from './pages/admin/Collectors'

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
        <Route path="/resident/leaderboard" element={
          <PrivateRoute role="resident">
            <Leaderboard />
          </PrivateRoute>
        } />

        {/* Collector Routes */}
        <Route path="/collector/dashboard" element={
          <PrivateRoute role="collector">
            <CollectorDashboard />
          </PrivateRoute>
        } />
        <Route path="/collector/browse" element={
          <PrivateRoute role="collector">
            <BrowseItems />
          </PrivateRoute>
        } />
        <Route path="/collector/history" element={
          <PrivateRoute role="collector">
            <History />
          </PrivateRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <PrivateRoute role="admin">
            <AdminDashboard />
          </PrivateRoute>
        } />
        <Route path="/admin/users" element={
          <PrivateRoute role="admin">
            <Users />
          </PrivateRoute>
        } />
        <Route path="/admin/categories" element={
          <PrivateRoute role="admin">
            <Categories />
          </PrivateRoute>
        } />
        <Route path="/admin/collectors" element={
  <PrivateRoute role="admin">
    <Collectors />
  </PrivateRoute>
} />

      </Routes>
    </BrowserRouter>
  )
}

export default App