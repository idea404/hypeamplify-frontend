'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api/client'

type User = {
  email: string
  disabled?: boolean
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  socialLogin: (provider: string, idToken: string) => Promise<void>
  logout: () => void
  credits: number
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [credits, setCredits] = useState(0)
  const router = useRouter()

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        if (token) {
          const userData = await api.auth.me()
          setUser(userData)
          
          // Get user credits
          const creditsData = await api.payments.getCredits()
          setCredits(creditsData.credits)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        localStorage.removeItem('accessToken')
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await api.auth.login(email, password)
      localStorage.setItem('accessToken', response.access_token)
      
      // Get user data
      const userData = await api.auth.me()
      setUser(userData)
      
      // Get user credits
      const creditsData = await api.payments.getCredits()
      setCredits(creditsData.credits)
      
      router.push('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string) => {
    setLoading(true)
    try {
      await api.auth.register(email, password)
      await login(email, password)
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const socialLogin = async (provider: string, idToken: string) => {
    setLoading(true)
    try {
      const response = await api.auth.socialLogin(provider, idToken)
      localStorage.setItem('accessToken', response.access_token)
      
      // Get user data
      const userData = await api.auth.me()
      setUser(userData)
      
      // Get user credits
      const creditsData = await api.payments.getCredits()
      setCredits(creditsData.credits)
      
      router.push('/dashboard')
    } catch (error) {
      console.error('Social login error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    setUser(null)
    setCredits(0)
    router.push('/auth/login')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        socialLogin,
        logout,
        credits
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}