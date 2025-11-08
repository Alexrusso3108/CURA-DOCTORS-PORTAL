import React, { useState } from 'react'
import { User, Lock, Eye, EyeOff, Stethoscope, Building2, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

const LoginPage = () => {
  const [doctorId, setDoctorId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')
    
    try {
      // Convert doctorId to number if it's numeric
      const doctorIdValue = isNaN(doctorId) ? doctorId : parseInt(doctorId)
      
      // Query the doctors table to verify doctor ID and get doctor info
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('*')
        .eq('doctor_id', doctorIdValue)
        .single()

      if (doctorError || !doctorData) {
        setError('Invalid Doctor ID. Please check your credentials.')
        setIsLoading(false)
        return
      }

      // Check if password column exists and matches
      if (doctorData.password) {
        // If password is stored in the table (not recommended for production)
        if (doctorData.password !== password) {
          setError('Invalid password. Please try again.')
          setIsLoading(false)
          return
        }
      } else {
        // Try Supabase Auth if email exists
        if (doctorData.email) {
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: doctorData.email,
            password: password,
          })

          if (authError) {
            setError('Invalid credentials. Please check your email and password.')
            console.error('Auth error:', authError)
            setIsLoading(false)
            return
          }
        } else {
          setError('Authentication not configured for this account.')
          setIsLoading(false)
          return
        }
      }

      // Success
      setSuccess(`Welcome back, Dr. ${doctorData.name}!`)
      console.log('Login successful:', doctorData)
      
      // Store doctor info in sessionStorage
      sessionStorage.setItem('doctorData', JSON.stringify(doctorData))
      
      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1500)
      
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-4 py-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cura-secondary opacity-20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cura-primary opacity-20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
          <div className="absolute top-20 right-20 w-32 h-32 bg-cyan-300 opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 left-20 w-32 h-32 bg-blue-300 opacity-10 rounded-full blur-2xl"></div>
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Header Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center mb-4 hover:scale-110 transition-transform duration-300">
            <img 
              src="/cmhlogo.png" 
              alt="Cura Hospitals Logo" 
              className="w-40 h-40 object-contain drop-shadow-2xl"
            />
          </div>
          <div className="flex items-center justify-center gap-2 mt-4 bg-white/50 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
            <Stethoscope className="w-6 h-6 text-cura-primary" />
            <p className="text-xl font-bold bg-gradient-to-r from-cura-primary to-cura-secondary bg-clip-text text-transparent">Doctor Portal</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden hover:shadow-3xl transition-all duration-500">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-cura-primary via-blue-600 to-cura-secondary px-8 py-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white text-center mb-2">
                Welcome Back 👋
              </h2>
              <p className="text-blue-100 text-center text-sm font-medium">
                Sign in to access your dashboard
              </p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6 bg-gradient-to-b from-white to-gray-50">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3 animate-shake shadow-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-start gap-3 animate-bounce-in shadow-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800 font-medium">{success}</p>
              </div>
            )}
            {/* Doctor ID Input */}
            <div>
              <label 
                htmlFor="doctorId" 
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Doctor ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="doctorId"
                  type="text"
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-cura-primary focus:border-cura-primary transition-all duration-300 outline-none text-gray-900 placeholder-gray-400 font-medium shadow-sm hover:shadow-md"
                  placeholder="Enter your Doctor ID (e.g., 1)"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-12 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-cura-primary focus:border-cura-primary transition-all duration-300 outline-none text-gray-900 placeholder-gray-400 font-medium shadow-sm hover:shadow-md"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-cura-primary transition-all duration-300 hover:scale-110"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-cura-primary border-gray-300 rounded focus:ring-cura-primary focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a 
                href="#" 
                className="text-sm font-medium text-cura-primary hover:text-cura-secondary transition-colors"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cura-primary via-blue-600 to-cura-secondary text-white py-4 px-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <span className="relative z-10">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline-block mr-2"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  'Sign In →'
                )}
              </span>
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
            <p className="text-center text-sm text-gray-600">
              Need help? Contact{' '}
              <a 
                href="#" 
                className="font-medium text-cura-primary hover:text-cura-secondary transition-colors"
              >
                IT Support
              </a>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            © 2024 Cura Hospitals Bengaluru. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
