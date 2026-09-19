import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Lock, Mail, Shield, ArrowRight, UserPlus, LogIn, CheckCircle2, AlertCircle } from 'lucide-react'
import { API_BASE_URL } from '../apiConfig'
import { setAuthSession } from '../tenantSession'

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setLoading(true)

    try {
      if (mode === 'register') {
        // Register API call
        const regRes = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password })
        })

        if (!regRes.ok) {
          let errMsg = 'Registration failed'
          try {
            const errData = await regRes.json()
            errMsg = errData.detail || errMsg
          } catch {
            const text = await regRes.text()
            errMsg = text || `Server error (${regRes.status})`
          }
          throw new Error(errMsg)
        }
      }

      // Login API call (OAuth2 Password flow expects URL-encoded form data)
      const formParams = new URLSearchParams()
      formParams.append('username', email.trim())
      formParams.append('password', password)

      const loginRes = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formParams.toString()
      })

      if (!loginRes.ok) {
        let errMsg = 'Invalid email or password'
        try {
          const errData = await loginRes.json()
          errMsg = errData.detail || errMsg
        } catch {
          const text = await loginRes.text()
          errMsg = text || `Server error (${loginRes.status})`
        }
        throw new Error(errMsg)
      }

      const loginData = await loginRes.json()
      const userProfile = {
        email: email.trim(),
        role: 'Security Operator',
        name: email.split('@')[0]
      }

      setAuthSession(loginData.access_token, userProfile)
      setSuccessMsg(mode === 'register' ? 'Account created and signed in!' : 'Successfully signed in!')

      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(userProfile)
        onClose()
        window.location.reload() // Reload to re-fetch telemetry with new user tenant workspace
      }, 700)

    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-surface border border-outline-variant rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header Banner */}
        <div className="p-6 bg-surface-container-low border-b border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
              <Shield size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-on-surface">
                {mode === 'login' ? 'Sign In to SentroniX' : 'Create Personal Workspace'}
              </h3>
              <p className="text-[11px] text-text-secondary">
                {mode === 'login' 
                  ? 'Access your private scans, reports & telemetry' 
                  : 'Start a dedicated cloud-isolated workspace'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-text-muted hover:text-on-surface hover:bg-surface-hover transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-outline-variant bg-surface-container text-xs">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-2.5 font-bold transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
              mode === 'login' 
                ? 'border-primary text-primary bg-surface' 
                : 'border-transparent text-text-muted hover:text-on-surface'
            }`}
          >
            <LogIn size={13} /> Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-2.5 font-bold transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
              mode === 'register' 
                ? 'border-primary text-primary bg-surface' 
                : 'border-transparent text-text-muted hover:text-on-surface'
            }`}
          >
            <UserPlus size={13} /> Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-danger-offensive/10 border border-danger-offensive/20 text-danger-offensive flex items-center gap-2">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-success-defensive/10 border border-success-defensive/20 text-success-defensive flex items-center gap-2">
              <CheckCircle2 size={15} className="flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-semibold text-text-secondary">Email Address</label>
            <div className="relative flex items-center">
              <Mail size={15} className="absolute left-3 text-text-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@sentronix.io"
                className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface text-xs focus:outline-none focus:border-primary transition-colors font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-text-secondary">Password</label>
            <div className="relative flex items-center">
              <Lock size={15} className="absolute left-3 text-text-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface text-xs focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary hover:bg-surface-tint text-on-primary font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-2 shadow-lg shadow-primary/20"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
            ) : mode === 'login' ? (
              <>Sign In <ArrowRight size={14} /></>
            ) : (
              <>Register & Create Workspace <ArrowRight size={14} /></>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div className="px-6 py-3 bg-surface-container-low border-t border-outline-variant text-[11px] text-text-muted flex items-center justify-between">
          <span>🔒 All scans strictly scoped to your credentials</span>
          <button 
            type="button"
            onClick={onClose} 
            className="hover:underline text-text-secondary"
          >
            Continue as Guest
          </button>
        </div>

      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null
}
