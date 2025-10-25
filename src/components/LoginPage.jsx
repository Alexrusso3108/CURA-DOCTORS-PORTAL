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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-4 py-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cura-secondary opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cura-primary opacity-10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cura-primary to-cura-secondary rounded-2xl shadow-lg mb-4">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cura Hospitals
          </h1>
          <p className="text-gray-600 text-sm">Bengaluru</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Stethoscope className="w-5 h-5 text-cura-primary" />
            <p className="text-lg font-semibold text-gray-700">Doctor Portal</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-cura-primary to-cura-secondary px-8 py-6">
            <h2 className="text-2xl font-bold text-white text-center">
              Welcome Back
            </h2>
            <p className="text-blue-100 text-center text-sm mt-1">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800">{success}</p>
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
                  className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cura-primary focus:border-transparent transition-all duration-200 outline-none text-gray-900 placeholder-gray-400"
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
                  className="block w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cura-primary focus:border-transparent transition-all duration-200 outline-none text-gray-900 placeholder-gray-400"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
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

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cura-primary to-cura-secondary text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
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
