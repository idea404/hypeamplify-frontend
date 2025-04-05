'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useAuth } from './useAuth'

// Create the context
interface AuthContextType {
  isLoggedIn: boolean
  user: any
  loading: boolean
  credits: number | null
  login: (token: string, userData?: any) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<boolean>
  refreshCredits: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook for components to use
export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}