import { useState, useEffect } from 'react'
import { StockDashboard } from './components/StockDashboard'
import { Login } from './components/Login'
import './App.css'

function App() {
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('authToken')
    if (token) {
      // Verify token is still valid
      verifyToken(token)
    } else {
      setIsLoading(false)
    }
  }, [])

  const verifyToken = async (token: string) => {
    try {
      const apiUrl = import.meta.env.DEV 
        ? 'http://localhost:3000/api/auth/verify'
        : '/api/auth/verify'

      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setAuthToken(token)
      } else {
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginSuccess = (token: string) => {
    setAuthToken(token)
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setAuthToken(null)
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <>
      {authToken ? (
        <StockDashboard onLogout={handleLogout} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  )
}

export default App
