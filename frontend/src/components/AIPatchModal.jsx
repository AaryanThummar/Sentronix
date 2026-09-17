import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { 
  Sparkles, CheckCircle2, AlertTriangle, Copy, Check, ExternalLink, 
  RefreshCw, ShieldCheck, Terminal, FileCode, CheckSquare, X, GitPullRequest, ArrowRight,
  Send, Key, ChevronDown, ChevronUp, Clock, Info, Wand2, Download, Shield, ArrowUpRight
} from 'lucide-react'
import { API_BASE_URL } from '../apiConfig'

export default function AIPatchModal({ finding, isOpen = true, onClose, onRemediated }) {
  const [activeTab, setActiveTab] = useState('diff') // 'diff', 'explanation', 'verification'
  const [patchData, setPatchData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [applied, setApplied] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  
  // Custom API Key overrides
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('sentronix_gemini_key') || localStorage.getItem('sentronix_gemini_api_key') || '')
  const [tempApiKey, setTempApiKey] = useState('')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [keySaved, setKeySaved] = useState(false)

  // Jira Integration States
  const [isJiraLoading, setIsJiraLoading] = useState(false)
  const [jiraStatus, setJiraStatus] = useState(null)

  // GitHub PR Integration States
  const [isGitHubLoading, setIsGitHubLoading] = useState(false)
  const [githubStatus, setGithubStatus] = useState(null)
  const [showGitHubDrawer, setShowGitHubDrawer] = useState(false)
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('sentronix_github_token') || '')
  const [repoOwner, setRepoOwner] = useState('AaryanThummar')
  const [repoName, setRepoName] = useState('Sentronix')
  const [baseBranch, setBaseBranch] = useState('main')
  const [customBranch, setCustomBranch] = useState('')
  const [copiedBranchCmd, setCopiedBranchCmd] = useState(false)

  useEffect(() => {
    if (finding && (isOpen ?? true)) {
      setPatchData(null)
      setApplied(false)
      setJiraStatus(null)
      setGithubStatus(null)
      fetchPatch()
    }
  }, [finding, isOpen])

  const fetchPatch = async (overrideKey) => {
    setLoading(true)
    setError(null)
    setJiraStatus(null)

    const keyToUse = overrideKey !== undefined ? overrideKey : apiKey

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/ai/patch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(keyToUse ? { 'X-Gemini-API-Key': keyToUse } : {})
        },
        body: JSON.stringify({
          id: finding.id,
          title: finding.title,
          tool: finding.tool,
          severity: finding.severity,
          location: finding.location,
          description: finding.description,
          api_key: keyToUse || null
        })
      })

      if (!res.ok) {
        throw new Error(`Failed to generate patch (Status ${res.status})`)
      }

      const data = await res.json()
      setPatchData(data)
    } catch (err) {
      setError(err.message || 'Error communicating with AI engine')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('sentronix_gemini_key', apiKey.trim())
    } else {
      localStorage.removeItem('sentronix_gemini_key')
    }
    setKeySaved(true)
    setTimeout(() => setKeySaved(false), 2000)
    fetchPatch(apiKey.trim())
  }

  const handleCopyDiff = () => {
    if (!patchData) return
    const textToCopy = patchData.diff || patchData.remediated_snippet || ''
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadPatch = () => {
    if (!patchData) return
    const diffText = patchData.diff || `# AI Remediation Patch\n# Target: ${finding.location}\n\n${patchData.remediated_snippet}`
    const blob = new Blob([diffText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `patch-${finding.id || 'vuln'}.patch`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCreateJira = async () => {
    if (!patchData) return
    setIsJiraLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/ai/jira-ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: finding.title,
          severity: finding.severity,
          location: finding.location,
          cwe: patchData.cwe,
          diff: patchData.diff,
          explanation: patchData.explanation
        })
      })
      const data = await res.json()
      setJiraStatus(data)
    } catch (err) {
      alert('Failed to connect to Jira: ' + err.message)
    } finally {
      setIsJiraLoading(false)
    }
  }

  const handleCreateGitHubPR = async () => {
    if (!patchData) return
    setIsGitHubLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/ai/github-pr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(githubToken ? { 'X-GitHub-Token': githubToken } : {})
        },
        body: JSON.stringify({
          title: finding.title,
          severity: finding.severity,
          location: finding.location,
          cwe: patchData.cwe,
          diff: patchData.diff,
          explanation: patchData.explanation,
          verification_steps: patchData.verification_steps,
          repo_owner: repoOwner.trim() || 'Keval-Doshi',
          repo_name: repoName.trim() || 'SentroniX',
          base_branch: baseBranch.trim() || 'main',
          branch_name: customBranch.trim() || null,
          github_token: githubToken.trim() || null
        })
      })

      if (!res.ok) throw new Error(`HTTP Error ${res.status}`)
      const data = await res.json()
      setGithubStatus(data)
      setShowGitHubDrawer(false)
    } catch (err) {
      alert('Failed to create GitHub PR: ' + err.message)
    } finally {
      setIsGitHubLoading(false)
    }
  }

  const handleCopyBranchCmd = (cmd) => {
    navigator.clipboard.writeText(cmd)
    setCopiedBranchCmd(true)
    setTimeout(() => setCopiedBranchCmd(false), 2000)
  }

  const handleApplyRemediation = async () => {
    setIsApplying(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/ai/remediate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: String(finding.id),
          patch_applied: patchData?.diff || 'Applied AI Remediation'
        })
      })
      if (res.ok) {
        setApplied(true)
        if (onRemediated) onRemediated(finding.id)
      }
    } catch (err) {
      alert('Error applying remediation: ' + err.message)
    } finally {
      setIsApplying(false)
    }
  }

  if (!finding) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-surface border border-border-strong rounded-2xl w-[96%] sm:w-[92%] md:w-[88%] lg:w-[82%] xl:w-[75%] max-w-5xl shadow-2xl overflow-hidden flex flex-col my-4 sm:my-8 max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-border-strong bg-surface-container-low flex items-start justify-between">
          <div className="space-y-1.5 flex-1 pr-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase ${
                finding.severity === 'CRITICAL' ? 'bg-error-container text-danger-offensive' :
                finding.severity === 'HIGH' ? 'bg-tertiary-fixed text-warning-mid' : 'bg-surface-variant text-text-secondary'
              }`}>
                {finding.severity}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                {finding.tool}
              </span>
              {patchData?.cwe && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface-variant text-text-secondary border border-border-subtle font-mono">
                  {patchData.cwe.split(':')[0]}
                </span>
              )}
              {patchData?.source && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles size={12} /> {patchData.source}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-on-surface tracking-tight flex items-center gap-2">
              <Wand2 className="text-primary flex-shrink-0" size={22} />
              {finding.title}
            </h2>
            <p className="text-xs text-text-muted font-mono truncate max-w-2xl">
              Target: <span className="text-text-secondary">{finding.location}</span>
            </p>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-text-muted hover:text-on-surface hover:bg-surface-hover transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* BYOK (Bring Your Own Key) Bar */}
        <div className="bg-surface-container px-6 py-2.5 border-b border-border-subtle flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-text-secondary">
            <Key size={14} className="text-primary" />
            <span>AI Key Status:</span>
            {apiKey ? (
              <span className="text-success-defensive font-medium flex items-center gap-1">
                <Check size={12} /> Active ({apiKey.substring(0, 6)}...{apiKey.substring(apiKey.length - 4)})
              </span>
            ) : (
              <span className="text-warning-mid font-medium">Using Smart Security Ruleset</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="text-primary hover:underline font-medium flex items-center gap-1"
            >
              {showKeyInput ? 'Hide Key Config' : '🔑 Change / Set API Key'}
            </button>
            <a 
              href="https://aistudio.google.com/" 
              target="_blank" 
              rel="noreferrer"
              className="text-text-muted hover:text-text-secondary flex items-center gap-1"
            >
              Get Free Key <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Collapsible Key Input Area */}
        {showKeyInput && (
          <div className="bg-surface-container-high p-4 border-b border-border-strong flex flex-wrap items-center gap-3">
            <input 
              type="password"
              placeholder="Paste your Gemini API Key (AIzaSy... / AQ.Ab...)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1 min-w-[240px] px-3 py-1.5 bg-surface border border-border-strong rounded-lg text-xs text-on-surface font-mono focus:outline-none focus:border-primary"
            />
            <button
              onClick={handleSaveApiKey}
              className="px-4 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary-container transition-colors flex items-center gap-1"
            >
              {keySaved ? <Check size={14} /> : <Sparkles size={14} />}
              {keySaved ? 'Saved & Regenerated!' : 'Save & Regenerate'}
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-border-subtle bg-surface-container-low px-6">
          <button
            onClick={() => setActiveTab('diff')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'diff' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-text-muted hover:text-on-surface'
            }`}
          >
            <FileCode size={15} /> Code Diff & Patch
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'analysis' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-text-muted hover:text-on-surface'
            }`}
          >
            <AlertTriangle size={15} /> Root Cause & Exploit
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'verification' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-text-muted hover:text-on-surface'
            }`}
          >
            <CheckCircle2 size={15} /> Verification & QA
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading && (
            <div className="py-16 flex flex-col items-center justify-center space-y-4 text-center">
              <RefreshCw className="text-primary animate-spin" size={36} />
              <p className="text-sm font-medium text-on-surface">Generating AI Remediation Patch...</p>
              <p className="text-xs text-text-muted max-w-sm">Correlating static AST rules, calculating secure parameterization, and producing unified diff.</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-error-container/20 border border-error-container rounded-xl text-danger-offensive text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle size={16} /> Error Generating Patch
              </div>
              <p>{error}</p>
              <button 
                onClick={() => fetchPatch()}
                className="px-3 py-1 bg-surface rounded text-on-surface hover:bg-surface-hover border border-border-subtle"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && patchData && (
            <>
              {/* Tab 1: Diff View */}
              {activeTab === 'diff' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Proposed Unified Diff Patch:
                    </span>
                    <span className="text-[11px] text-text-muted">
                      Standards: {patchData.owasp_category || 'OWASP Top 10'}
                    </span>
                  </div>

                  {/* Syntax Highlighted Unified Diff Display */}
                  <div className="rounded-xl border border-border-strong bg-[#0d1117] font-mono text-xs overflow-x-auto shadow-inner">
                    <div className="bg-[#161b22] px-4 py-2 border-b border-border-strong text-text-muted text-[11px] flex justify-between items-center">
                      <span>{finding.location}</span>
                      <span>Unified Git Diff</span>
                    </div>
                    <div className="p-3 text-[12px] leading-relaxed space-y-0.5">
                      {patchData.diff ? (
                        patchData.diff.split('\n').map((line, idx) => {
                          let lineStyle = 'text-gray-300'
                          let bgStyle = ''
                          if (line.startsWith('---') || line.startsWith('+++')) {
                            lineStyle = 'text-gray-400 font-bold'
                          } else if (line.startsWith('@@')) {
                            lineStyle = 'text-cyan-400 bg-cyan-950/30 px-1 rounded'
                          } else if (line.startsWith('-')) {
                            lineStyle = 'text-rose-400'
                            bgStyle = 'bg-rose-950/40 -mx-3 px-3 block'
                          } else if (line.startsWith('+')) {
                            lineStyle = 'text-emerald-400'
                            bgStyle = 'bg-emerald-950/40 -mx-3 px-3 block'
                          }
                          return (
                            <div key={idx} className={`${bgStyle} whitespace-pre`}>
                              <span className={lineStyle}>{line}</span>
                            </div>
                          )
                        })
                      ) : (
                        <pre className="text-emerald-400 whitespace-pre-wrap">{patchData.remediated_snippet}</pre>
                      )}
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="p-4 bg-surface-container-low border border-border-subtle rounded-xl space-y-1.5">
                    <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                      <Shield size={14} className="text-primary" /> Remediation Rationale:
                    </span>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {patchData.explanation}
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 2: Analysis & Exploit Vectors */}
              {activeTab === 'analysis' && (
                <div className="space-y-4">
                  <div className="p-4 bg-surface-container-low border border-border-subtle rounded-xl space-y-2">
                    <span className="text-xs font-bold text-danger-offensive uppercase tracking-wide flex items-center gap-1.5">
                      <AlertTriangle size={14} /> Root Cause Analysis:
                    </span>
                    <p className="text-xs text-on-surface leading-relaxed">
                      {patchData.root_cause}
                    </p>
                  </div>

                  <div className="p-4 bg-surface-container-low border border-border-subtle rounded-xl space-y-2">
                    <span className="text-xs font-bold text-warning-mid uppercase tracking-wide flex items-center gap-1.5">
                      <Wand2 size={14} /> Simulated Adversary Attack Vector:
                    </span>
                    <pre className="p-3 bg-inverse-surface text-amber-300 rounded-lg font-mono text-xs whitespace-pre-wrap">
                      {patchData.attack_vector || 'Exploit payload crafted to bypass validation gates.'}
                    </pre>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-error-container/10 border border-error-container/30 space-y-1">
                      <span className="text-[11px] font-bold text-danger-offensive uppercase">Vulnerable Implementation</span>
                      <pre className="text-[11px] font-mono text-rose-300 overflow-x-auto whitespace-pre-wrap">
                        {patchData.vulnerable_snippet}
                      </pre>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                      <span className="text-[11px] font-bold text-emerald-400 uppercase">Patched Implementation</span>
                      <pre className="text-[11px] font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                        {patchData.remediated_snippet}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Verification & QA */}
              {activeTab === 'verification' && (
                <div className="space-y-4">
                  <div className="p-4 bg-surface-container-low border border-border-subtle rounded-xl space-y-3">
                    <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                      <CheckCircle2 size={15} className="text-success-defensive" /> Post-Patch Verification Steps:
                    </span>
                    <div className="space-y-2">
                      {patchData.verification_steps && patchData.verification_steps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-text-secondary">
                          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-bold text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="pt-0.5">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-surface-container rounded-xl border border-border-subtle flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-on-surface">Compliance & Governance</p>
                      <p className="text-[11px] text-text-muted">Resolves OWASP Top 10 violation & enhances dashboard defense grade.</p>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-success-defensive/10 text-success-defensive font-medium border border-success-defensive/20">
                      Audit Ready
                    </span>
                  </div>
                </div>
              )}

              {/* GitHub PR Result Banner */}
              {githubStatus && (
                <div className="p-3 bg-accent-soft border border-primary/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs animate-fade-in">
                  <div className="flex items-center gap-2">
                    <GitPullRequest size={16} className="text-primary flex-shrink-0" />
                    <div>
                      <span className="text-on-surface font-bold">{githubStatus.message}</span>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-text-secondary">
                        <span>Target: <code className="font-mono text-primary">{githubStatus.base || 'main'}</code></span>
                        <span>•</span>
                        <span>Branch: <code className="font-mono text-primary">{githubStatus.branch}</code></span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyBranchCmd(githubStatus.checkout_cmd || `git checkout ${githubStatus.branch}`)}
                      className="px-2.5 py-1 rounded bg-surface border border-outline-variant text-[11px] font-mono hover:bg-surface-hover flex items-center gap-1 text-text-secondary hover:text-on-surface"
                      title="Copy branch command"
                    >
                      {copiedBranchCmd ? <Check size={12} className="text-success-defensive" /> : <Copy size={12} />}
                      {copiedBranchCmd ? 'Copied' : 'git checkout'}
                    </button>
                    <a
                      href={githubStatus.pr_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-bold flex items-center gap-1 text-[11px] shadow-sm"
                    >
                      <span>View PR #{githubStatus.pr_number}</span>
                      <ArrowUpRight size={12} />
                    </a>
                  </div>
                </div>
              )}

              {/* GitHub PR Configuration Drawer */}
              {showGitHubDrawer && (
                <div className="p-4 bg-surface-container-low border border-primary/30 rounded-xl space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                    <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                      <GitPullRequest size={15} className="text-primary" /> Automated GitHub Remediation PR
                    </span>
                    <button onClick={() => setShowGitHubDrawer(false)} className="text-text-muted hover:text-on-surface">
                      <X size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-text-secondary mb-1">Target Repository</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={repoOwner}
                          onChange={(e) => { setRepoOwner(e.target.value); localStorage.setItem('sentronix_github_owner', e.target.value); }}
                          placeholder="Owner"
                          className="w-1/2 px-2 py-1.5 rounded bg-surface border border-border-subtle text-on-surface text-xs focus:outline-none focus:border-primary"
                        />
                        <span className="text-text-muted">/</span>
                        <input
                          type="text"
                          value={repoName}
                          onChange={(e) => { setRepoName(e.target.value); localStorage.setItem('sentronix_github_repo', e.target.value); }}
                          placeholder="Repo"
                          className="w-1/2 px-2 py-1.5 rounded bg-surface border border-border-subtle text-on-surface text-xs focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-text-secondary mb-1">Base Branch</label>
                      <input
                        type="text"
                        value={baseBranch}
                        onChange={(e) => { setBaseBranch(e.target.value); localStorage.setItem('sentronix_github_base', e.target.value); }}
                        placeholder="main"
                        className="w-full px-2 py-1.5 rounded bg-surface border border-border-subtle text-on-surface text-xs focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="block text-[11px] font-bold text-text-secondary mb-1">
                      GitHub Personal Access Token (Optional for Live Push)
                    </label>
                    <input
                      type="password"
                      value={githubToken}
                      onChange={(e) => { setGithubToken(e.target.value); localStorage.setItem('sentronix_github_token', e.target.value); }}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (Leave blank for staging simulation)"
                      className="w-full px-2.5 py-1.5 rounded bg-surface border border-border-subtle text-on-surface text-xs font-mono focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => setShowGitHubDrawer(false)}
                      className="px-3 py-1.5 text-xs text-text-muted hover:text-on-surface"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateGitHubPR}
                      disabled={isGitHubLoading}
                      className="px-4 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-bold text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                    >
                      <GitPullRequest size={14} />
                      {isGitHubLoading ? 'Opening PR...' : 'Submit Pull Request'}
                    </button>
                  </div>
                </div>
              )}

              {/* Jira Result Banner */}
              {jiraStatus && (
                <div className="p-3 bg-primary/10 border border-primary/30 rounded-xl flex items-center justify-between text-xs animate-fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-primary" />
                    <span className="text-on-surface font-medium">{jiraStatus.message}</span>
                  </div>
                  <span className="font-mono px-2 py-0.5 rounded bg-primary text-on-primary font-bold">
                    {jiraStatus.ticket_key}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer / Actions */}
        <div className="p-4 border-t border-border-strong bg-surface-container-low flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyDiff}
              disabled={loading || !patchData}
              className="px-3 py-2 rounded-lg bg-surface border border-border-subtle text-xs font-medium text-on-surface hover:bg-surface-hover flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {copied ? <Check size={14} className="text-success-defensive" /> : <Copy size={14} />}
              {copied ? 'Copied Diff!' : 'Copy Patch'}
            </button>

            <button
              onClick={handleDownloadPatch}
              disabled={loading || !patchData}
              className="px-3 py-2 rounded-lg bg-surface border border-border-subtle text-xs font-medium text-on-surface hover:bg-surface-hover flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Download size={14} /> Download .patch
            </button>

            <button
              onClick={() => setShowGitHubDrawer(!showGitHubDrawer)}
              disabled={loading || !patchData}
              className={`px-3 py-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 ${
                showGitHubDrawer
                  ? 'bg-accent-soft border-primary text-primary font-bold'
                  : 'bg-surface border-border-subtle text-text-secondary hover:text-on-surface hover:bg-surface-hover'
              }`}
            >
              <GitPullRequest size={14} className="text-primary" /> Create GitHub PR
            </button>

            <button
              onClick={handleCreateJira}
              disabled={loading || !patchData || isJiraLoading}
              className="px-3 py-2 rounded-lg bg-surface border border-border-subtle text-xs font-medium text-text-secondary hover:text-on-surface hover:bg-surface-hover flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <ExternalLink size={14} /> {isJiraLoading ? 'Creating...' : 'Create Jira Ticket'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-on-surface transition-colors"
            >
              Close
            </button>

            <button
              onClick={handleApplyRemediation}
              disabled={loading || !patchData || isApplying || applied}
              className={`px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                applied 
                  ? 'bg-success-defensive text-on-primary' 
                  : 'bg-primary text-on-primary hover:bg-primary-container'
              } disabled:opacity-50`}
            >
              {applied ? <CheckCircle2 size={15} /> : <Wand2 size={15} />}
              {applied ? 'Remediated & Verified' : isApplying ? 'Applying...' : 'Apply & Resolve'}
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  )
}
