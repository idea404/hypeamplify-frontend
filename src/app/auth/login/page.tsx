'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { api } from '@/lib/api/client'
import { Logo } from '@/components/ui/Logo'
import { useAuthContext } from '@/lib/auth/AuthContext'

export default function Login() {
  const router = useRouter()
  const { checkAuth, login } = useAuthContext()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      const response = await api.auth.login(formData.email, formData.password)
      
      await login(response.access_token, response.user)
      
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header/Navigation */}
      <motion.div 
        className="absolute top-4 right-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Button asChild variant="outline">
          <Link href="/auth/register">Create Account</Link>
        </Button>
      </motion.div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <motion.div 
          className="max-w-md w-full p-8 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-black shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold tracking-tighter">Welcome Back</h1>
              <p className="text-gray-500 dark:text-gray-400">
                Sign in to continue supercharging your X presence
              </p>
            </div>

            {error && (
              <motion.div 
                className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-md text-sm"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="youremail@example.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Your password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="text-center text-sm">
              <p className="text-gray-500 dark:text-gray-400">
                Don't have an account?{' '}
                <Link href="/auth/register" className="text-primary hover:underline">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* HypeAmplify Logo */}
      <motion.div 
        className="absolute bottom-6 left-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Link href="/">
          <Logo width={200} height={60} />
        </Link>
      </motion.div>
    </div>
  )
} 