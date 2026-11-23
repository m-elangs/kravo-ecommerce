import React, { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('kravo_user')
    return saved ? JSON.parse(saved) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('kravo_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      authApi.me()
        .then(res => {
          if (res.success && res.data?.user) {
            setUser(res.data.user)
            localStorage.setItem('kravo_user', JSON.stringify(res.data.user))
          }
        })
        .catch(() => {
          logout()
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const login = async (email, password) => {
    const res = await authApi.login({ email, password })
    if (res.success) {
      setToken(res.data.token)
      setUser(res.data.user)
      localStorage.setItem('kravo_token', res.data.token)
      localStorage.setItem('kravo_user', JSON.stringify(res.data.user))
    }
    return res
  }

  const register = async (data) => {
    const res = await authApi.register(data)
    if (res.success) {
      setToken(res.data.token)
      setUser(res.data.user)
      localStorage.setItem('kravo_token', res.data.token)
      localStorage.setItem('kravo_user', JSON.stringify(res.data.user))
    }
    return res
  }

  const logout = async () => {
    try {
      if (token) await authApi.logout()
    } catch (e) {
      // ignore
    } finally {
      setToken(null)
      setUser(null)
      localStorage.removeItem('kravo_token')
      localStorage.removeItem('kravo_user')
    }
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('kravo_user', JSON.stringify(updatedUser))
  }

  const refreshUser = async () => {
    try {
      const res = await authApi.me()
      if (res.success && res.data?.user) {
        setUser(res.data.user)
        localStorage.setItem('kravo_user', JSON.stringify(res.data.user))
        return res.data.user
      }
    } catch (e) {
      // ignore
    }
    return null
  }

  const roleName = typeof user?.role === 'string' ? user.role : user?.role?.name
  const isAdmin = roleName === 'admin'
  const isReseller = roleName === 'reseller'
  const isApprovedReseller = isReseller && (user?.reseller_profile?.status === 'approved' || user?.resellerProfile?.status === 'approved')

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      updateUser,
      refreshUser,
      isAdmin,
      isReseller,
      isApprovedReseller,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
