import React, { useState, useEffect, useRef } from 'react'
import { 
  Bell, ShieldAlert, Swords, Sparkles, Check, Trash2, 
  ExternalLink, ArrowRight, ShieldCheck, X, AlertTriangle, 
  Layers, Code, Bug, Terminal, CheckCircle2
} from 'lucide-react'
import { Link } from 'react-router-dom'
import AIPatchModal from './AIPatchModal'
import { apiFetch } from '../apiConfig'

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'critical' | 'strikes' | 'scanners'
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [patchFinding, setPatchFinding] = useState(null)
  const [isPatchOpen, setIsPatchOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Fetch telemetry and build notifications stream
  const fetchTelemetryAlerts = async () => {
    try {
      let combined = []

      // 1. Fetch live findings scoped to this workspace
      try {
        const res = await apiFetch('/api/v1/dashboard/findings')
        if (res.ok) {
          const findings = await res.json()
          findings.forEach((f, idx) => {
            combined.push({
              id: `finding-${f.id || idx}`,
              type: 'finding',
              title: f.title,
              severity: f.severity || 'HIGH',
              tool: f.tool || 'Semgrep / ZAP',
              location: f.location || '/api/v1',
              description: f.description || 'Active security vulnerability identified in target application.',
              timestamp: 'Just now',
              read: false,
              rawFinding: f
            })
          })
        }
      } catch (e) {
        // ignore
      }

      // 2. Fetch Red Team simulated strikes scoped to this workspace
      try {
        const resStrikes = await apiFetch('/api/v1/red-team/history')
        if (resStrikes.ok) {
          const strikes = await resStrikes.json()
          strikes.slice(0, 5).forEach((s, idx) => {
            combined.push({
              id: `strike-${s.strike_id || idx}`,
              type: 'strike',
              title: `[Adversary Strike] ${s.title}`,
              severity: s.severity || 'CRITICAL',
              tool: 'Red Team Simulator',
              location: s.red_team?.target_endpoint || '/api/v1',
              description: `Emulated ${s.mitre_technique || 'Attack Vector'}. Injected: ${s.red_team?.injected_payload || ''}`,
              timestamp: s.timestamp || 'Recent',
              read: false,
              rawFinding: {
                id: s.db_finding_id || 900 + idx,
                title: s.title,
                severity: s.severity,
                tool: 'Red Team Simulator',
                location: s.red_team?.target_endpoint,
                description: s.purple_team_convergence?.summary || 'Adversary strike simulation'
              }
            })
          })
        }
      } catch (e) {
        // ignore
      }

      // Fallback default notifications if backend findings are empty
      if (combined.length === 0) {
        const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://sentronix.internal'
        combined = [
          {
            id: 'default-1',
            type: 'finding',
            title: 'Outdated Apache Web Server (CVE-2021-41773)',
            severity: 'CRITICAL',
            tool: 'Nuclei DAST',
            location: `${currentOrigin}/server-status`,
            description: 'Vulnerable instance of Apache 2.4.49 detected, prone to path traversal.',
            timestamp: '5m ago',
            read: false,
            rawFinding: {
              id: 1,
              title: 'Outdated Apache Web Server (CVE-2021-41773)',
              severity: 'CRITICAL',
              tool: 'Nuclei',
              location: `${currentOrigin}/server-status`,
              description: 'Vulnerable Apache HTTP server instance.'
            }
          },
          {
            id: 'default-2',
            type: 'strike',
            title: '[Adversary Strike] SQL Injection Auth Bypass',
            severity: 'CRITICAL',
            tool: 'Red Team Simulator',
            location: '/api/v1/auth/login',
            description: 'Adversary injected boolean tautology (T1190). Intercepted by WAF AST rule.',
            timestamp: '12m ago',
            read: false,
            rawFinding: {
              id: 2,
              title: 'SQL Injection Auth Bypass',
              severity: 'CRITICAL',
              tool: 'Red Team Simulator',
              location: '/api/v1/auth/login',
              description: 'SQL injection tautology detected.'
            }
          },
          {
            id: 'default-3',
            type: 'system',
            title: 'SentoBot Discord Interceptor Synchronized',
            severity: 'INFO',
            tool: 'Discord Bot',
            location: '#mod-security-alerts',
            description: 'Role-restricted channel permissions configured. Bot online in SentroniX server.',
            timestamp: '30m ago',
            read: true
          }
        ]
      }

      setNotifications(combined)
      setUnreadCount(combined.filter(n => !n.read).length)
    } catch (e) {
      console.error("Failed to fetch notification telemetry:", e)
    }
  }

  useEffect(() => {
    fetchTelemetryAlerts()
    const interval = setInterval(fetchTelemetryAlerts, 15000)
    return () => clearInterval(interval)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const markItemAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const deleteNotification = (id, e) => {
    e.stopPropagation()
    setNotifications(prev => prev.filter(n => n.id !== id))
    setUnreadCount(prev => prev > 0 ? prev - 1 : 0)
  }

  const handleLaunchAIPatch = (rawFinding, e) => {
    e.stopPropagation()
    if (rawFinding) {
      setPatchFinding(rawFinding)
      setIsPatchOpen(true)
      setIsOpen(false)
    }
  }

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'critical') return n.severity === 'CRITICAL'
    if (activeFilter === 'strikes') return n.type === 'strike'
    if (activeFilter === 'scanners') return n.type === 'finding'
    return true
  })

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-on-surface-variant hover:text-primary transition-colors focus:ring-2 focus:ring-primary/20 rounded-full p-2 hover:bg-surface-hover"
        aria-label="Security Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-danger-offensive text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Flyout Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-w-[90vw] bento-card bg-surface shadow-2xl border border-outline-variant rounded-xl z-50 overflow-hidden animate-fadeIn">
          
          {/* Header */}
          <div className="p-3.5 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold text-sm">
                Security Alerts & Telemetry
              </span>
              {unreadCount > 0 && (
                <span className="font-label-sm text-[10px] bg-error-container/40 text-danger-offensive px-1.5 py-0.5 rounded font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-[11px] font-label-md text-text-secondary hover:text-primary flex items-center gap-1 transition-colors"
              >
                <Check size={12} />
                Mark all read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-outline-variant bg-surface text-xs overflow-x-auto">
            <button 
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium text-xs transition-colors ${
                activeFilter === 'all' 
                  ? 'bg-primary text-on-primary font-bold' 
                  : 'text-text-secondary hover:bg-surface-container'
              }`}
            >
              All ({notifications.length})
            </button>
            <button 
              onClick={() => setActiveFilter('critical')}
              className={`px-2.5 py-1 rounded-md font-medium text-xs transition-colors ${
                activeFilter === 'critical' 
                  ? 'bg-danger-offensive text-white font-bold' 
                  : 'text-text-secondary hover:bg-surface-container'
              }`}
            >
              Critical ({notifications.filter(n => n.severity === 'CRITICAL').length})
            </button>
            <button 
              onClick={() => setActiveFilter('strikes')}
              className={`px-2.5 py-1 rounded-md font-medium text-xs transition-colors ${
                activeFilter === 'strikes' 
                  ? 'bg-primary text-on-primary font-bold' 
                  : 'text-text-secondary hover:bg-surface-container'
              }`}
            >
              Strikes
            </button>
            <button 
              onClick={() => setActiveFilter('scanners')}
              className={`px-2.5 py-1 rounded-md font-medium text-xs transition-colors ${
                activeFilter === 'scanners' 
                  ? 'bg-primary text-on-primary font-bold' 
                  : 'text-text-secondary hover:bg-surface-container'
              }`}
            >
              Scanners
            </button>
          </div>

          {/* Notifications Scroll Area */}
          <div className="max-h-80 overflow-y-auto divide-y divide-outline-variant/60">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => markItemAsRead(item.id)}
                  className={`p-3 transition-colors cursor-pointer flex gap-3 ${
                    !item.read ? 'bg-accent-soft/40 hover:bg-accent-soft/70' : 'hover:bg-surface-container-low'
                  }`}
                >
                  {/* Category Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {item.type === 'strike' ? (
                      <div className="w-7 h-7 rounded-lg bg-error-container/40 text-danger-offensive flex items-center justify-center">
                        <Swords size={15} />
                      </div>
                    ) : item.severity === 'CRITICAL' ? (
                      <div className="w-7 h-7 rounded-lg bg-error-container/40 text-danger-offensive flex items-center justify-center">
                        <ShieldAlert size={15} />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-accent-soft text-primary flex items-center justify-center">
                        <ShieldCheck size={15} />
                      </div>
                    )}
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p className="font-label-md text-xs font-semibold text-on-surface truncate">
                        {item.title}
                      </p>
                      <button 
                        onClick={(e) => deleteNotification(item.id, e)}
                        className="text-text-muted hover:text-danger-offensive p-0.5"
                        title="Dismiss"
                      >
                        <X size={12} />
                      </button>
                    </div>

                    <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-outline-variant/30 text-[10px]">
                      <div className="flex items-center gap-1.5 text-text-muted">
                        <code className="font-mono text-primary bg-surface-container px-1 py-0.2 rounded">
                          {item.tool}
                        </code>
                        <span>•</span>
                        <span>{item.timestamp}</span>
                      </div>

                      {/* Quick AI Patch action */}
                      {item.rawFinding && (
                        <button 
                          onClick={(e) => handleLaunchAIPatch(item.rawFinding, e)}
                          className="px-2 py-0.5 rounded bg-primary text-on-primary hover:bg-surface-tint font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Sparkles size={10} />
                          AI Patch
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-text-muted">
                <CheckCircle2 size={32} className="mx-auto text-success-defensive opacity-60 mb-2" />
                <p className="font-label-md text-xs text-on-surface font-semibold">All Caught Up!</p>
                <p className="text-[11px] text-text-muted mt-0.5">No active alerts match this filter.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-surface-container-low border-t border-outline-variant flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-text-muted text-[11px]">
              <span className="w-2 h-2 rounded-full bg-success-defensive"></span>
              <span>Discord <code className="text-primary font-mono font-bold">#mod-security-alerts</code></span>
            </div>

            <Link 
              to="/scans" 
              onClick={() => setIsOpen(false)}
              className="text-primary font-bold hover:underline text-[11px] flex items-center gap-1"
            >
              All Scans <ArrowRight size={11} />
            </Link>
          </div>

        </div>
      )}

      {/* AI Patch Modal Triggered from Notifications */}
      {isPatchOpen && patchFinding && (
        <AIPatchModal 
          finding={patchFinding}
          onClose={() => setIsPatchOpen(false)}
          onRemediated={() => fetchTelemetryAlerts()}
        />
      )}
    </div>
  )
}
