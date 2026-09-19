import React, { useState, useEffect, useRef } from 'react'
import { 
  User, Shield, Key, Settings, FileText, CheckCircle2, 
  ExternalLink, LogOut, Swords, Sparkles, ChevronRight,
  LogIn, UserPlus, RefreshCw, LayoutGrid
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getWorkspaceId, getUserProfile, resetWorkspaceId, clearAuthSession } from '../tenantSession'
import AuthModal from './AuthModal'

export default function UserProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('sentronix_gemini_key') || '')
  const [isEditingKey, setIsEditingKey] = useState(false)
  const [inputKey, setInputKey] = useState(geminiKey)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [workspaceId, setWorkspaceId] = useState('')
  const dropdownRef = useRef(null)

  useEffect(() => {
    setUserProfile(getUserProfile())
    setWorkspaceId(getWorkspaceId())
  }, [isOpen])

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSaveKey = () => {
    localStorage.setItem('sentronix_gemini_key', inputKey.trim())
    setGeminiKey(inputKey.trim())
    setIsEditingKey(false)
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  const handleResetWorkspace = () => {
    if (confirm('Create a new clean workspace? All previous live tests will remain isolated in your prior workspace.')) {
      resetWorkspaceId()
      window.location.reload()
    }
  }

  const handleLogout = () => {
    clearAuthSession()
    resetWorkspaceId()
    window.location.reload()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-on-surface-variant hover:text-primary transition-colors focus:ring-2 focus:ring-primary/20 rounded-full p-1.5 hover:bg-surface-hover flex items-center gap-2"
        aria-label="User Profile"
      >
        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/30">
          {userProfile?.email ? userProfile.email.slice(0, 2).toUpperCase() : <User size={16} />}
        </div>
      </button>

      {/* Profile Flyout */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bento-card bg-surface shadow-2xl border border-outline-variant rounded-2xl z-50 overflow-hidden animate-fadeIn">
          
          {/* User Header */}
          <div className="p-4 bg-surface-container-low border-b border-outline-variant flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary text-on-primary font-bold text-sm flex items-center justify-center flex-shrink-0">
              {userProfile?.email ? userProfile.email.slice(0, 2).toUpperCase() : 'SX'}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-headline-sm text-xs font-bold text-on-surface truncate">
                {userProfile?.email || 'Guest Operator'}
              </h3>
              <p className="font-label-sm text-[10px] text-text-secondary truncate">
                {userProfile ? 'Cloud Authenticated • Operator' : 'Anonymous Workspace Session'}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <span className="inline-flex items-center gap-1 text-[9px] text-success-defensive font-semibold px-1.5 py-0.5 rounded bg-success-defensive/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-success-defensive animate-pulse"></span>
                  Active Sandbox
                </span>
                <span className="text-[9px] font-mono text-text-muted bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant/60 truncate">
                  {workspaceId.slice(0, 14)}
                </span>
              </div>
            </div>
          </div>

          {/* Workspace Personalization Controls */}
          <div className="p-3 bg-surface-container/40 border-b border-outline-variant flex items-center justify-between text-[11px]">
            <span className="text-text-muted flex items-center gap-1">
              <LayoutGrid size={12} className="text-primary" /> Session Isolation
            </span>
            <button
              onClick={handleResetWorkspace}
              title="Start a fresh empty sandbox workspace"
              className="text-primary hover:underline font-semibold flex items-center gap-1 text-[11px]"
            >
              <RefreshCw size={11} /> New Workspace
            </button>
          </div>

          {/* Quick Info & BYOK Gemini Key */}
          <div className="p-3.5 space-y-3 border-b border-outline-variant text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-label-md text-text-secondary flex items-center gap-1.5 font-semibold text-[11px]">
                  <Key size={13} className="text-primary" />
                  Gemini AI Remediation (BYOK)
                </span>
                <button 
                  onClick={() => setIsEditingKey(!isEditingKey)}
                  className="text-primary text-[11px] font-bold hover:underline"
                >
                  {isEditingKey ? 'Cancel' : (geminiKey ? 'Change' : 'Configure')}
                </button>
              </div>

              {isEditingKey ? (
                <div className="space-y-1.5 mt-1.5">
                  <input 
                    type="password"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="Enter Gemini API Key..."
                    className="w-full bg-surface-container-low border border-outline-variant rounded px-2.5 py-1 text-xs font-mono text-on-surface focus:outline-none focus:border-primary"
                  />
                  <button 
                    onClick={handleSaveKey}
                    className="w-full bg-primary text-on-primary hover:bg-surface-tint py-1 rounded text-[11px] font-bold transition-colors"
                  >
                    Save API Key
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between text-[11px] text-text-muted mt-0.5">
                  <span>Status:</span>
                  <span className={`font-semibold ${geminiKey ? 'text-success-defensive' : 'text-danger-offensive'}`}>
                    {geminiKey ? 'Active (Configured)' : 'Missing (Using Rule Fallback)'}
                  </span>
                </div>
              )}

              {savedSuccess && (
                <p className="text-[10px] text-success-defensive font-semibold mt-1">
                  ✓ Key saved to browser localStorage!
                </p>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="p-2 divide-y divide-outline-variant/40 text-xs">
            <Link 
              to="/arena" 
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-hover text-on-surface transition-colors"
            >
              <div className="flex items-center gap-2">
                <Swords size={15} className="text-primary" />
                <span>Purple Team Arena</span>
              </div>
              <ChevronRight size={14} className="text-text-muted" />
            </Link>

            <Link 
              to="/reports" 
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-hover text-on-surface transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText size={15} className="text-primary" />
                <span>Compliance & Audit Reports</span>
              </div>
              <ChevronRight size={14} className="text-text-muted" />
            </Link>

            <Link 
              to="/settings" 
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-hover text-on-surface transition-colors"
            >
              <div className="flex items-center gap-2">
                <Settings size={15} className="text-primary" />
                <span>Platform Settings & Jira</span>
              </div>
              <ChevronRight size={14} className="text-text-muted" />
            </Link>
          </div>

          {/* Auth Action Footer */}
          <div className="p-3 bg-surface-container-low border-t border-outline-variant">
            {userProfile ? (
              <button
                onClick={handleLogout}
                className="w-full py-2 px-3 rounded-lg border border-danger-offensive/30 hover:bg-danger-offensive/10 text-danger-offensive font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut size={14} /> Sign Out of Account
              </button>
            ) : (
              <button
                onClick={() => { setIsOpen(false); setIsAuthModalOpen(true); }}
                className="w-full py-2 px-3 rounded-lg bg-primary hover:bg-surface-tint text-on-primary font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <LogIn size={14} /> Sign In or Register
              </button>
            )}
          </div>

        </div>
      )}

      {/* Auth Modal Portal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(u) => setUserProfile(u)}
      />
    </div>
  )
}
