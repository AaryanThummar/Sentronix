import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, X, LayoutDashboard, Swords, Shield, FileText, 
  Settings, AlertTriangle, Wand2, ChevronRight, CornerDownLeft, Sparkles
} from 'lucide-react'
import { API_BASE_URL } from '../apiConfig'
import AIPatchModal from './AIPatchModal'

export default function GlobalSearchBar() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [findings, setFindings] = useState([])
  const [selectedPatchFinding, setSelectedPatchFinding] = useState(null)
  const inputRef = useRef(null)
  const containerRef = useRef(null)
  const navigate = useNavigate()

  // Default Quick Navigation Pages
  const pages = [
    { title: 'Executive Dashboard', path: '/', icon: LayoutDashboard, category: 'Pages', description: 'Real-time defense grade, KPIs, and recent findings' },
    { title: 'Purple Team Arena', path: '/arena', icon: Swords, category: 'Pages', description: 'Atomic strikes, WAF switchboard, Caldera campaigns, and live fuzzer' },
    { title: 'Scans & Workers', path: '/scans', icon: Shield, category: 'Pages', description: 'Steganography analyzer, binary malware scanner, and Celery worker queue' },
    { title: 'Compliance Reports', path: '/reports', icon: FileText, category: 'Pages', description: 'Executive audit reports mapped to ISO 27001, SOC 2, and NIST' },
    { title: 'Platform Settings & BYOK', path: '/settings', icon: Settings, category: 'Pages', description: 'Gemini API keys, GitHub tokens, Jira configuration, and webhooks' },
  ]

  // Pre-configured Adversary Attack Scenarios & Tools
  const attackScenarios = [
    { title: 'SQL Injection Authentication Bypass (CWE-89)', path: '/arena', category: 'Attacks', vector: 'Initial Access (T1190)', severity: 'CRITICAL' },
    { title: 'OS Command Injection RCE (CWE-78)', path: '/arena', category: 'Attacks', vector: 'Execution (T1059)', severity: 'CRITICAL' },
    { title: 'Server-Side Request Forgery Cloud Metadata (CWE-918)', path: '/arena', category: 'Attacks', vector: 'Discovery (T1552)', severity: 'CRITICAL' },
    { title: 'Broken Authentication: JWT "None" Algorithm (CWE-287)', path: '/arena', category: 'Attacks', vector: 'Credential Access (T1078)', severity: 'HIGH' },
    { title: 'Directory Path Traversal & Arbitrary Read (CWE-22)', path: '/arena', category: 'Attacks', vector: 'Discovery (T1083)', severity: 'HIGH' },
    { title: 'Steganography Malware Payload Transfer (LSB)', path: '/scans', category: 'Attacks', vector: 'Defense Evasion (T1027)', severity: 'HIGH' },
  ]

  // Fetch live findings from backend
  useEffect(() => {
    const fetchFindings = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/dashboard/findings`)
        if (res.ok) {
          const data = await res.json()
          setFindings(data)
        }
      } catch (e) {
        // ignore fallback
      }
    }
    fetchFindings()
  }, [])

  // Global Keyboard Shortcut: Ctrl+K or Cmd+K to focus search bar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
      } else if (e.key === 'Escape') {
        setIsOpen(false)
        inputRef.current?.blur()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filtering Logic
  const trimmed = query.trim().toLowerCase()

  const filteredPages = trimmed 
    ? pages.filter(p => p.title.toLowerCase().includes(trimmed) || p.description.toLowerCase().includes(trimmed))
    : pages.slice(0, 3)

  const filteredAttacks = trimmed
    ? attackScenarios.filter(a => a.title.toLowerCase().includes(trimmed) || a.vector.toLowerCase().includes(trimmed) || a.severity.toLowerCase().includes(trimmed))
    : attackScenarios.slice(0, 3)

  const filteredFindings = trimmed
    ? findings.filter(f => 
        (f.title && f.title.toLowerCase().includes(trimmed)) ||
        (f.location && f.location.toLowerCase().includes(trimmed)) ||
        (f.tool && f.tool.toLowerCase().includes(trimmed)) ||
        (f.severity && f.severity.toLowerCase().includes(trimmed))
      )
    : findings.slice(0, 3)

  const hasResults = filteredPages.length > 0 || filteredAttacks.length > 0 || filteredFindings.length > 0

  const handleSelectPage = (path) => {
    navigate(path)
    setIsOpen(false)
    setQuery('')
  }

  const handleSelectFinding = (finding) => {
    setSelectedPatchFinding(finding)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* Search Input Bar */}
      <div 
        onClick={() => { setIsOpen(true); inputRef.current?.focus(); }}
        className={`flex items-center border rounded-full px-3 py-1.5 transition-all duration-200 ${
          isOpen 
            ? 'bg-surface border-primary ring-2 ring-primary/20 shadow-md' 
            : 'bg-surface-bright border-outline-variant hover:border-text-secondary/40'
        }`}
      >
        <Search className={`${isOpen ? 'text-primary' : 'text-text-muted'} flex-shrink-0 transition-colors`} size={17} />
        
        <input 
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search telemetry, findings, scenarios... (Ctrl+K)"
          className="bg-transparent border-none focus:outline-none ml-2 text-body-md text-on-surface w-full min-w-0 placeholder:text-text-muted text-xs sm:text-sm"
        />

        {query ? (
          <button 
            onClick={(e) => { e.stopPropagation(); setQuery(''); inputRef.current?.focus(); }}
            className="p-1 rounded-full text-text-muted hover:text-on-surface transition-colors"
          >
            <X size={14} />
          </button>
        ) : (
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-text-muted bg-surface-container rounded border border-border-subtle select-none">
            Ctrl K
          </kbd>
        )}
      </div>

      {/* Floating Interactive Results Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-surface/95 backdrop-blur-xl border border-border-strong rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in max-h-[75vh] flex flex-col">
          
          {/* Header Bar */}
          <div className="px-4 py-2 border-b border-border-subtle bg-surface-container-low flex items-center justify-between text-[11px] text-text-muted">
            <span>{trimmed ? `Search Results for "${query}"` : 'Quick Navigation & Telemetry'}</span>
            <span className="flex items-center gap-1"><CornerDownLeft size={11} /> Select to view</span>
          </div>

          <div className="overflow-y-auto p-2 space-y-3">
            
            {/* 1. Live Findings Category */}
            {filteredFindings.length > 0 && (
              <div>
                <div className="px-2 py-1 text-[10px] font-bold tracking-wider uppercase text-text-secondary flex items-center gap-1.5">
                  <AlertTriangle size={12} className="text-warning-mid" /> Correlated Vulnerabilities ({filteredFindings.length})
                </div>
                <div className="space-y-1 mt-1">
                  {filteredFindings.map((finding, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleSelectFinding(finding)}
                      className="p-2 rounded-xl hover:bg-surface-hover transition-colors cursor-pointer flex items-center justify-between group border border-transparent hover:border-border-subtle"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                            finding.severity === 'CRITICAL' ? 'bg-error-container text-danger-offensive' :
                            finding.severity === 'HIGH' ? 'bg-tertiary-fixed text-warning-mid' : 'bg-surface-variant text-text-secondary'
                          }`}>
                            {finding.severity}
                          </span>
                          <span className="text-xs font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
                            {finding.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-muted font-mono truncate mt-0.5">
                          {finding.location} • <span className="text-text-secondary">{finding.tool}</span>
                        </p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleSelectFinding(finding); }}
                        className="px-2 py-1 rounded bg-primary/10 hover:bg-primary text-primary hover:text-on-primary text-[10px] font-bold flex items-center gap-1 transition-colors flex-shrink-0"
                      >
                        <Wand2 size={11} /> AI Patch
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Platform Pages Category */}
            {filteredPages.length > 0 && (
              <div>
                <div className="px-2 py-1 text-[10px] font-bold tracking-wider uppercase text-text-secondary flex items-center gap-1.5">
                  <LayoutDashboard size={12} className="text-primary" /> Platform Modules ({filteredPages.length})
                </div>
                <div className="space-y-1 mt-1">
                  {filteredPages.map((page, idx) => {
                    const IconComponent = page.icon
                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectPage(page.path)}
                        className="p-2 rounded-xl hover:bg-surface-hover transition-colors cursor-pointer flex items-center justify-between group border border-transparent hover:border-border-subtle"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors flex-shrink-0">
                            <IconComponent size={15} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-on-surface group-hover:text-primary transition-colors truncate">
                              {page.title}
                            </p>
                            <p className="text-[11px] text-text-muted truncate">
                              {page.description}
                            </p>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-text-muted group-hover:text-primary transition-colors flex-shrink-0" />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 3. Attack Scenarios Category */}
            {filteredAttacks.length > 0 && (
              <div>
                <div className="px-2 py-1 text-[10px] font-bold tracking-wider uppercase text-text-secondary flex items-center gap-1.5">
                  <Swords size={12} className="text-danger-offensive" /> Adversary TTP Scenarios ({filteredAttacks.length})
                </div>
                <div className="space-y-1 mt-1">
                  {filteredAttacks.map((attack, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectPage(attack.path)}
                      className="p-2 rounded-xl hover:bg-surface-hover transition-colors cursor-pointer flex items-center justify-between group border border-transparent hover:border-border-subtle"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                            attack.severity === 'CRITICAL' ? 'bg-error-container text-danger-offensive' : 'bg-tertiary-fixed text-warning-mid'
                          }`}>
                            {attack.severity}
                          </span>
                          <span className="text-xs font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
                            {attack.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-muted font-mono truncate mt-0.5">
                          TTP: <span className="text-text-secondary">{attack.vector}</span>
                        </p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-surface-container font-medium text-text-muted group-hover:text-primary flex items-center gap-1">
                        Simulate <ChevronRight size={11} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!hasResults && (
              <div className="py-8 text-center space-y-2">
                <Search size={28} className="mx-auto text-text-muted opacity-50" />
                <p className="text-xs font-semibold text-on-surface">No matching telemetry or findings</p>
                <p className="text-[11px] text-text-muted">Try searching for "sqli", "steg", "jwt", "arena", or "cwe"</p>
              </div>
            )}

          </div>

          {/* Footer Bar */}
          <div className="p-2.5 border-t border-border-subtle bg-surface-container-low flex items-center justify-between text-[10px] text-text-muted">
            <span className="flex items-center gap-1 text-primary font-medium">
              <Sparkles size={11} /> Live Telemetry Correlation
            </span>
            <span>Press <kbd className="px-1 bg-surface rounded border border-border-subtle">Esc</kbd> to exit</span>
          </div>

        </div>
      )}

      {/* AI Patch Remediation Modal (if triggered directly from search results) */}
      {selectedPatchFinding && (
        <AIPatchModal 
          isOpen={true}
          finding={selectedPatchFinding}
          onClose={() => setSelectedPatchFinding(null)}
        />
      )}
    </div>
  )
}
