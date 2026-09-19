import React, { useState, useEffect } from 'react'
import { Play, ShieldAlert, Code, Link, Archive, RefreshCw, X, FileText, ChevronRight, Wand2 } from 'lucide-react'
import { apiFetch } from '../../apiConfig'

export default function AppDefenseTab({ onOpenPatch }) {
  const [sastPath, setSastPath] = useState('./backend')
  const [dastUrl, setDastUrl] = useState(() => 
    typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
      ? window.location.origin 
      : 'http://localhost:8000'
  )
  const [dastType, setDastType] = useState('nuclei')
  const [scaPath, setScaPath] = useState('.')

  const [scanStatus, setScanStatus] = useState({
    sast: { state: 'Idle', scanId: null, error: null },
    dast: { state: 'Idle', scanId: null, error: null },
    sca: { state: 'Idle', scanId: null, error: null }
  })

  const [findings, setFindings] = useState([])
  const [selectedFinding, setSelectedFinding] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [stats, setStats] = useState({ total_scans: 0, critical_high_count: 0, medium_low_count: 0, total_findings: 0 })

  const fetchAppData = async () => {
    try {
      const statsRes = await apiFetch('/api/v1/defense/app/stats')
      if (statsRes.ok) setStats(await statsRes.json())
      const findingsRes = await apiFetch('/api/v1/defense/app/findings')
      if (findingsRes.ok) setFindings(await findingsRes.json())
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchAppData()
    const interval = setInterval(fetchAppData, 10000)
    return () => clearInterval(interval)
  }, [])

  // Start SAST Scan
  const startSast = async () => {
    setScanStatus(prev => ({ ...prev, sast: { state: 'Queued', scanId: null, error: null } }))
    try {
      const res = await apiFetch('/api/v1/defense/app/sast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_path: sastPath })
      })
      if (!res.ok) throw new Error("Trigger failed")
      const data = await res.json()
      setScanStatus(prev => ({ ...prev, sast: { state: 'Scanning', scanId: data.scan_id, error: null } }))
      
      // Poll results
      pollResults(data.scan_id, 'sast')
    } catch (err) {
      setScanStatus(prev => ({ ...prev, sast: { state: 'Failed', scanId: null, error: err.message } }))
    }
  }

  // Start DAST Scan
  const startDast = async () => {
    setScanStatus(prev => ({ ...prev, dast: { state: 'Queued', scanId: null, error: null } }))
    try {
      const res = await apiFetch('/api/v1/defense/app/dast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_url: dastUrl, scan_type: dastType })
      })
      if (!res.ok) throw new Error("Trigger failed")
      const data = await res.json()
      setScanStatus(prev => ({ ...prev, dast: { state: 'Scanning', scanId: data.scan_id, error: null } }))
      
      // Poll results
      pollResults(data.scan_id, 'dast')
    } catch (err) {
      setScanStatus(prev => ({ ...prev, dast: { state: 'Failed', scanId: null, error: err.message } }))
    }
  }

  // Start SCA Scan
  const startSca = async () => {
    setScanStatus(prev => ({ ...prev, sca: { state: 'Queued', scanId: null, error: null } }))
    try {
      const res = await apiFetch('/api/v1/defense/app/sca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_path: scaPath })
      })
      if (!res.ok) throw new Error("Trigger failed")
      const data = await res.json()
      setScanStatus(prev => ({ ...prev, sca: { state: 'Scanning', scanId: data.scan_id, error: null } }))
      
      // Poll results
      pollResults(data.scan_id, 'sca')
    } catch (err) {
      setScanStatus(prev => ({ ...prev, sca: { state: 'Failed', scanId: null, error: err.message } }))
    }
  }

  // Helper to simulate polling
  const pollResults = async (scanId, key) => {
    let attempts = 0
    const maxAttempts = 5
    
    const interval = setInterval(async () => {
      attempts++
      try {
        const res = await apiFetch(`/api/v1/defense/app/results/${scanId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.findings && data.findings.length > 0) {
            setFindings(prev => {
              // Deduplicate findings
              const filtered = prev.filter(f => !f.id.toString().startsWith(key))
              return [...data.findings, ...filtered]
            })
            setScanStatus(prev => ({ ...prev, [key]: { ...prev[key], state: 'Completed' } }))
            clearInterval(interval)
            return
          }
        }
      } catch (e) {
        console.error("Polling error", e)
      }
      
      if (attempts >= maxAttempts) {
        setScanStatus(prev => ({ ...prev, [key]: { ...prev[key], state: 'Completed' } }))
        clearInterval(interval)
      }
    }, 1500)
  }

  return (
    <div className="space-y-grid-gap relative">
      {/* 0. Live Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
        <div className="bento-card bg-surface-container-low flex flex-col justify-center">
          <span className="font-label-md text-label-md text-text-secondary">Total Scans Run</span>
          <span className="font-headline-lg text-headline-lg text-on-surface">{stats.total_scans}</span>
        </div>
        <div className="bento-card bg-error-container/10 border border-error-container/20 flex flex-col justify-center">
          <span className="font-label-md text-label-md text-danger-offensive flex items-center gap-2"><ShieldAlert size={16}/> Critical & High Threats</span>
          <span className="font-headline-lg text-headline-lg text-danger-offensive">{stats.critical_high_count}</span>
        </div>
        <div className="bento-card bg-surface-container-low border border-border-subtle flex flex-col justify-center">
          <span className="font-label-md text-label-md text-text-secondary flex items-center gap-2">Medium & Low Threats</span>
          <span className="font-headline-lg text-headline-lg text-text-secondary">{stats.medium_low_count}</span>
        </div>
        <div className="bento-card bg-surface-container-low flex flex-col justify-center">
          <span className="font-label-md text-label-md text-text-secondary">Total Active Findings</span>
          <span className="font-headline-lg text-headline-lg text-on-surface">{stats.total_findings}</span>
        </div>
      </div>

      {/* 1. Controllers Row (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
        
        {/* SAST Card */}
        <div className="bento-card flex flex-col justify-between">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2 mb-2">
              <Code size={20} className="text-primary" />
              Semgrep SAST
            </h3>
            <p className="font-body-sm text-body-sm text-text-muted mb-4">Static analysis for hardcoded secrets, injection vulnerabilities, and weak cryptography.</p>
          </div>
          <div className="space-y-3">
            <input 
              type="text" 
              value={sastPath}
              onChange={(e) => setSastPath(e.target.value)}
              placeholder="Local directory (e.g. ./backend)"
              className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-3 py-2 font-label-md text-label-md text-on-surface focus:outline-none focus:border-primary"
            />
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${scanStatus.sast.state === 'Completed' ? 'bg-success-defensive/10 text-success-defensive' : scanStatus.sast.state === 'Scanning' ? 'bg-primary-container text-on-primary' : 'bg-surface-variant text-text-muted'}`}>
                {scanStatus.sast.state}
              </span>
              <button 
                onClick={startSast}
                disabled={scanStatus.sast.state === 'Scanning' || scanStatus.sast.state === 'Queued'}
                className="bg-primary text-on-primary px-4 py-1.5 rounded-lg font-label-md text-label-md hover:bg-surface-tint flex items-center gap-1.5 transition-colors"
              >
                <Play size={14} /> Scan
              </button>
            </div>
          </div>
        </div>

        {/* DAST Card */}
        <div className="bento-card flex flex-col justify-between">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2 mb-2">
              <Link size={20} className="text-secondary-fixed" />
              ZAP & Nuclei DAST
            </h3>
            <p className="font-body-sm text-body-sm text-text-muted mb-4">Dynamic web inspection scanning for exposed repos, outdated server headers, and web vulns.</p>
          </div>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={dastUrl}
                onChange={(e) => setDastUrl(e.target.value)}
                placeholder="Target URL (e.g. http://localhost)"
                className="flex-1 bg-surface-container-low border border-border-subtle rounded-lg px-3 py-2 font-label-md text-label-md text-on-surface focus:outline-none focus:border-primary"
              />
              <select 
                value={dastType} 
                onChange={(e) => setDastType(e.target.value)}
                className="bg-surface-container-low border border-border-subtle rounded-lg px-2 py-1 font-label-md text-label-md text-on-surface"
              >
                <option value="nuclei">Nuclei</option>
                <option value="zap">OWASP ZAP</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${scanStatus.dast.state === 'Completed' ? 'bg-success-defensive/10 text-success-defensive' : scanStatus.dast.state === 'Scanning' ? 'bg-primary-container text-on-primary' : 'bg-surface-variant text-text-muted'}`}>
                {scanStatus.dast.state}
              </span>
              <button 
                onClick={startDast}
                disabled={scanStatus.dast.state === 'Scanning' || scanStatus.dast.state === 'Queued'}
                className="bg-primary text-on-primary px-4 py-1.5 rounded-lg font-label-md text-label-md hover:bg-surface-tint flex items-center gap-1.5 transition-colors"
              >
                <Play size={14} /> Scan
              </button>
            </div>
          </div>
        </div>

        {/* SCA Card */}
        <div className="bento-card flex flex-col justify-between">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2 mb-2">
              <Archive size={20} className="text-success-defensive" />
              Trivy Dependency SCA
            </h3>
            <p className="font-body-sm text-body-sm text-text-muted mb-4">Software composition analysis scanning for vulnerable third-party modules and CVE references.</p>
          </div>
          <div className="space-y-3">
            <input 
              type="text" 
              value={scaPath}
              onChange={(e) => setScaPath(e.target.value)}
              placeholder="Package path (e.g. .)"
              className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-3 py-2 font-label-md text-label-md text-on-surface focus:outline-none focus:border-primary"
            />
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${scanStatus.sca.state === 'Completed' ? 'bg-success-defensive/10 text-success-defensive' : scanStatus.sca.state === 'Scanning' ? 'bg-primary-container text-on-primary' : 'bg-surface-variant text-text-muted'}`}>
                {scanStatus.sca.state}
              </span>
              <button 
                onClick={startSca}
                disabled={scanStatus.sca.state === 'Scanning' || scanStatus.sca.state === 'Queued'}
                className="bg-primary text-on-primary px-4 py-1.5 rounded-lg font-label-md text-label-md hover:bg-surface-tint flex items-center gap-1.5 transition-colors"
              >
                <Play size={14} /> Scan
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* 2. Vulnerability Findings Table */}
      <div className="bento-card overflow-hidden flex flex-col">
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Application Security Findings</h3>
        <div className="overflow-x-auto overflow-y-auto max-h-[360px] w-full pr-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-surface z-10 shadow-sm">
              <tr className="border-b border-border-strong bg-surface">
                <th className="pb-3 pt-1 font-label-sm text-label-sm text-text-muted font-medium w-24 bg-surface">Severity</th>
                <th className="pb-3 pt-1 font-label-sm text-label-sm text-text-muted font-medium bg-surface">Vulnerability Title</th>
                <th className="pb-3 pt-1 font-label-sm text-label-sm text-text-muted font-medium bg-surface">Tool</th>
                <th className="pb-3 pt-1 font-label-sm text-label-sm text-text-muted font-medium bg-surface">Location</th>
                <th className="pb-3 pt-1 font-label-sm text-label-sm text-text-muted font-medium text-right bg-surface">Review</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-on-surface divide-y-[0.5px] divide-border-subtle">
              {findings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-muted">
                    No active scan findings loaded. Submit a scan target above to analyze vulnerabilities.
                  </td>
                </tr>
              ) : (
                findings.map((f, i) => (
                  <tr key={i} className="hover:bg-surface-hover transition-colors">
                    <td className="py-3">
                      {f.severity === 'CRITICAL' && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-error-container text-danger-offensive">CRITICAL</span>}
                      {f.severity === 'HIGH' && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-tertiary-fixed text-warning-mid">HIGH</span>}
                      {f.severity === 'WARNING' || f.severity === 'MEDIUM' ? <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-800">MEDIUM</span> : null}
                      {f.severity === 'LOW' || f.severity === 'INFO' ? <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-surface-variant text-text-secondary">LOW</span> : null}
                    </td>
                    <td className="py-3 pr-4 truncate max-w-[250px] font-medium">
                      {f.title}
                      <span className="block text-[10px] text-text-secondary font-mono">{f.cwe}</span>
                    </td>
                    <td className="py-3 font-label-md text-label-md text-text-secondary">{f.tool}</td>
                    <td className="py-3 font-label-md text-label-md text-text-secondary truncate max-w-[200px]">{f.location}</td>
                    <td className="py-3 text-right">
                      <button 
                        onClick={() => { setSelectedFinding(f); setDrawerOpen(true) }}
                        className="font-label-md text-label-md text-primary hover:text-primary-container flex items-center justify-end gap-1 w-full"
                      >
                        Details <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Sliding Findings Detail Drawer */}
      {drawerOpen && selectedFinding && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[85%] md:w-[420px] max-w-full bg-surface shadow-2xl z-[100] flex flex-col border-l border-border-strong animate-slide-in">
          <div className="p-4 border-b border-border-strong flex justify-between items-center bg-surface-container-high">
            <div>
              <h4 className="font-headline-sm text-headline-sm text-on-surface">Vulnerability Details</h4>
              <span className="text-[10px] text-text-secondary font-mono bg-surface-container-low px-1.5 py-0.5 rounded">{selectedFinding.cwe}</span>
            </div>
            <button 
              onClick={() => setDrawerOpen(false)}
              className="p-1 hover:bg-surface-container rounded-full text-text-secondary"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div>
              <span className="font-label-sm text-label-sm text-text-secondary block mb-1">Title</span>
              <p className="font-body-md text-body-md text-on-surface font-semibold">{selectedFinding.title}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-label-sm text-label-sm text-text-secondary block mb-1">Source Scanner</span>
                <p className="font-body-sm text-body-sm text-on-surface font-medium">{selectedFinding.tool}</p>
              </div>
              <div>
                <span className="font-label-sm text-label-sm text-text-secondary block mb-1">Severity Rating</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${selectedFinding.severity === 'CRITICAL' ? 'bg-error-container text-danger-offensive' : selectedFinding.severity === 'HIGH' ? 'bg-tertiary-fixed text-warning-mid' : 'bg-surface-variant text-text-secondary'}`}>
                  {selectedFinding.severity}
                </span>
              </div>
            </div>

            <div>
              <span className="font-label-sm text-label-sm text-text-secondary block mb-1">Vulnerable Location</span>
              <code className="bg-surface-container-low p-2 rounded block font-mono text-xs break-all text-on-surface border border-border-subtle">{selectedFinding.location}</code>
            </div>

            <div>
              <span className="font-label-sm text-label-sm text-text-secondary block mb-1">Analysis & Impact</span>
              <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">{selectedFinding.description}</p>
            </div>

            {selectedFinding.payload && (
              <div>
                <span className="font-label-sm text-label-sm text-text-secondary block mb-2">Vulnerable Snippet / Payload</span>
                <pre className="bg-inverse-surface text-on-secondary p-3 rounded-lg font-mono text-[11px] whitespace-pre-wrap overflow-x-auto border border-border-strong">
                  {selectedFinding.payload}
                </pre>
              </div>
            )}

            {onOpenPatch && (
              <div className="pt-2 border-t border-border-strong">
                <button
                  onClick={() => {
                    onOpenPatch(selectedFinding);
                    setDrawerOpen(false);
                  }}
                  className="w-full py-2.5 px-4 bg-primary text-on-primary rounded-xl font-label-md text-label-md font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <Wand2 size={16} />
                  ✨ Generate AI Remediation Patch
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
