import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { TokenProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
import Login from './pages/Login'
import Register from './pages/Register'
import Tasks from './pages/Tasks'
import TaskDetail from './pages/TaskDetail'
import TaskEdit from './pages/TaskEdit'
import Friends from './pages/Friends'
import NotFound from './pages/NotFound'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TokenProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/tasks" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Every route below is behind auth and shares the nav bar. */}
          <Route
            element={
              <ProtectedRoute>
                <Header />
              </ProtectedRoute>
            }
          >
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/tasks/:taskId" element={<TaskDetail />} />
            <Route path="/tasks/:taskId/edit" element={<TaskEdit />} />
            <Route path="/friends" element={<Friends />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TokenProvider>
  </React.StrictMode>
)
