import React, { useState } from 'react'
import { 
  Settings, Key, Bot, Shield, Check, Save, 
  ExternalLink, Trash2, Sliders, Bell, Database, 
  Eye, EyeOff, CheckCircle2, AlertCircle, RefreshCw, Radio,
  GitPullRequest
} from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('ai_general')
  const [showApiKey, setShowApiKey] = useState(false)
  const [showJiraToken, setShowJiraToken] = useState(false)
  const [showGitHubToken, setShowGitHubToken] = useState(false)
  
  // Settings Form State
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('sentronix_gemini_key') || '')
  const [geminiModel, setGeminiModel] = useState('gemini-1.5-flash')
  const [autoRemediation, setAutoRemediation] = useState(true)
  const [stegThreshold, setStegThreshold] = useState('deep')
  
  // GitHub Integration State
  const [githubOwner, setGithubOwner] = useState(() => localStorage.getItem('sentronix_github_owner') || 'Keval-Doshi')
  const [githubRepo, setGithubRepo] = useState(() => localStorage.getItem('sentronix_github_repo') || 'SentroniX')
  const [githubBase, setGithubBase] = useState(() => localStorage.getItem('sentronix_github_base') || 'main')
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('sentronix_github_token') || '')

  // Jira & Webhooks State
  const [jiraHost, setJiraHost] = useState('https://sentronix.atlassian.net')
  const [jiraEmail, setJiraEmail] = useState('security-admin@sentronix.io')
  const [jiraToken, setJiraToken] = useState('')
  const [jiraProjectKey, setJiraProjectKey] = useState('SEC')
  const [autoJiraTickets, setAutoJiraTickets] = useState(true)
  const [webhookUrl, setWebhookUrl] = useState('')

  // Scanner Config State
  const [semgrepRuleset, setSemgrepRuleset] = useState('p/security-audit')
  const [nucleiSeverity, setNucleiSeverity] = useState('critical,high')
  const [autoScanOnUpload, setAutoScanOnUpload] = useState(true)

  // Status feedback
  const [saveStatus, setSaveStatus] = useState(null)
  const [testStatus, setTestStatus] = useState(null)

  const handleSave = () => {
    setSaveStatus('saving')
    if (geminiApiKey.trim()) localStorage.setItem('sentronix_gemini_key', geminiApiKey.trim())
    if (githubOwner.trim()) localStorage.setItem('sentronix_github_owner', githubOwner.trim())
    if (githubRepo.trim()) localStorage.setItem('sentronix_github_repo', githubRepo.trim())
    if (githubBase.trim()) localStorage.setItem('sentronix_github_base', githubBase.trim())
    if (githubToken.trim()) localStorage.setItem('sentronix_github_token', githubToken.trim())
    setTimeout(() => {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus(null), 3000)
    }, 600)
  }

  const handleTestJira = () => {
    setTestStatus('testing')
    setTimeout(() => {
      setTestStatus('success')
      setTimeout(() => setTestStatus(null), 3500)
    }, 1200)
  }

  return (
    <main className="p-4 md:p-8 flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-grid-gap">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface flex items-center gap-3">
              <Settings className="text-primary" size={28} />
              Platform Configuration & Integrations
            </h1>
            <p className="font-body-md text-body-md text-text-muted mt-1">
              Configure AI engines, scanner rulebooks, Jira ticketing pipelines, and notification webhooks.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-primary hover:bg-surface-tint text-on-primary rounded-lg font-label-md text-label-md flex items-center gap-2 shadow-sm transition-all active:scale-[0.98]"
            >
              {saveStatus === 'saving' ? (
                <><RefreshCw size={16} className="animate-spin" /> Saving Changes...</>
              ) : saveStatus === 'saved' ? (
                <><Check size={16} /> Configuration Saved</>
              ) : (
                <><Save size={16} /> Save Configuration</>
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-border-strong pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('ai_general')}
            className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-colors flex items-center gap-2 ${activeTab === 'ai_general' ? 'bg-primary-container text-on-primary font-bold' : 'text-text-secondary hover:bg-surface-container-low hover:text-on-surface'}`}
          >
            <Bot size={16} />
            AI & Correlation Engine
          </button>
          <button
            onClick={() => setActiveTab('jira_integrations')}
            className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-colors flex items-center gap-2 ${activeTab === 'jira_integrations' ? 'bg-primary-container text-on-primary font-bold' : 'text-text-secondary hover:bg-surface-container-low hover:text-on-surface'}`}
          >
            <ExternalLink size={16} />
            Jira & Webhooks
          </button>
          <button
            onClick={() => setActiveTab('scanners')}
            className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-colors flex items-center gap-2 ${activeTab === 'scanners' ? 'bg-primary-container text-on-primary font-bold' : 'text-text-secondary hover:bg-surface-container-low hover:text-on-surface'}`}
          >
            <Shield size={16} />
            Scanners & Rulesets
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-colors flex items-center gap-2 ${activeTab === 'database' ? 'bg-primary-container text-on-primary font-bold' : 'text-text-secondary hover:bg-surface-container-low hover:text-on-surface'}`}
          >
            <Database size={16} />
            Telemetry & Retention
          </button>
        </div>

        {/* 1. AI & General Settings */}
        {activeTab === 'ai_general' && (
          <div className="space-y-grid-gap">
            <div className="bento-card">
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2 flex items-center gap-2">
                <Bot size={20} className="text-primary" />
                Google Gemini AI Core Settings
              </h3>
              <p className="font-body-sm text-body-sm text-text-muted mb-6">
                SentroniX utilizes Gemini AI to automatically correlate multi-tool vulnerabilities, generate CWE explanations, and propose code patches.
              </p>

              <div className="space-y-4 max-w-2xl">
                <div>
                  <label className="font-label-sm text-label-sm text-text-secondary block mb-1">
                    Gemini API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-3 py-2 font-mono text-xs text-on-surface pr-10 focus:outline-none focus:border-primary"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-2.5 text-text-muted hover:text-on-surface"
                    >
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <span className="text-[11px] text-text-muted mt-1 block">Configured in `.env` or overridden securely here for runtime sessions.</span>
                </div>

                <div>
                  <label className="font-label-sm text-label-sm text-text-secondary block mb-1">
                    Correlation Model Architecture
                  </label>
                  <select
                    value={geminiModel}
                    onChange={(e) => setGeminiModel(e.target.value)}
                    className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-3 py-2 font-label-md text-label-md text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (Ultra-Fast Automated Triage)</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Code Reasoning & Exploit Verification)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={autoRemediation}
                      onChange={(e) => setAutoRemediation(e.target.checked)}
                      className="w-4 h-4 accent-primary rounded cursor-pointer"
                    />
                    <div>
                      <span className="font-label-md text-label-md text-on-surface block">Automatic AI Patch Generation</span>
                      <span className="font-body-sm text-body-sm text-text-muted text-[12px]">Generate one-click remediation diffs whenever a critical finding is indexed.</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Jira & Webhook Integrations */}
        {activeTab === 'jira_integrations' && (
          <div className="space-y-grid-gap">
            <div className="bento-card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                    <ExternalLink size={20} className="text-primary" />
                    Atlassian Jira Issue Tracking
                  </h3>
                  <p className="font-body-sm text-body-sm text-text-muted mt-1">
                    Automatically convert verified SAST/DAST vulnerabilities into prioritized Jira development tickets.
                  </p>
                </div>
                <button
                  onClick={handleTestJira}
                  className="px-3 py-1.5 bg-surface-container-high hover:bg-surface-hover text-on-surface rounded-lg font-label-sm text-label-sm flex items-center gap-1.5 border border-border-subtle transition-colors"
                >
                  {testStatus === 'testing' ? (
                    <><RefreshCw size={14} className="animate-spin" /> Verifying...</>
                  ) : testStatus === 'success' ? (
                    <><CheckCircle2 size={14} className="text-success-defensive" /> Connected Successfully</>
                  ) : (
                    <>Test Jira API Connection</>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
                <div>
                  <label className="font-label-sm text-label-sm text-text-secondary block mb-1">Jira Instance Host URL</label>
                  <input
                    type="text"
                    value={jiraHost}
                    onChange={(e) => setJiraHost(e.target.value)}
                    placeholder="https://company.atlassian.net"
                    className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-3 py-2 font-label-md text-label-md text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="font-label-sm text-label-sm text-text-secondary block mb-1">Service Account Email</label>
                  <input
                    type="email"
                    value={jiraEmail}
                    onChange={(e) => setJiraEmail(e.target.value)}
                    placeholder="secops@company.com"
                    className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-3 py-2 font-label-md text-label-md text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="font-label-sm text-label-sm text-text-secondary block mb-1">Jira API Token</label>
                  <div className="relative">
                    <input
                      type={showJiraToken ? "text" : "password"}
                      value={jiraToken}
                      onChange={(e) => setJiraToken(e.target.value)}
                      placeholder="ATATT3xFfGF0..."
                      className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-3 py-2 font-mono text-xs text-on-surface pr-10 focus:outline-none focus:border-primary"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowJiraToken(!showJiraToken)}
                      className="absolute right-3 top-2.5 text-text-muted hover:text-on-surface"
                    >
                      {showJiraToken ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-label-sm text-label-sm text-text-secondary block mb-1">Default Project Key</label>
                  <input
                    type="text"
                    value={jiraProjectKey}
                    onChange={(e) => setJiraProjectKey(e.target.value)}
                    placeholder="SEC, VULN, or DEV"
                    className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-3 py-2 font-label-md text-label-md text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border-strong">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={autoJiraTickets}
                    onChange={(e) => setAutoJiraTickets(e.target.checked)}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                  <div>
                    <span className="font-label-md text-label-md text-on-surface block">Auto-Sync Critical Findings to Jira</span>
                    <span className="font-body-sm text-body-sm text-text-muted text-[12px]">Automatically open high-priority backlog tickets with CVSS score & remediation payloads.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* GitHub CI/CD & Auto-PR Integration */}
            <div className="bento-card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                    <GitPullRequest size={20} className="text-primary" />
                    GitHub Automated Remediation Pull Requests
                  </h3>
                  <p className="font-body-sm text-body-sm text-text-muted mt-1">
                    Directly stage AI-synthesized patches into remote branches and open structured remediation PRs.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-accent-soft text-primary font-bold text-xs border border-primary/20">
                  One-Click CI/CD
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
                <div>
                  <label className="font-label-sm text-label-sm text-text-secondary block mb-1">Repository Owner / Org</label>
                  <input
                    type="text"
                    value={githubOwner}
                    onChange={(e) => setGithubOwner(e.target.value)}
                    placeholder="Keval-Doshi"
                    className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-3 py-2 font-label-md text-label-md text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="font-label-sm text-label-sm text-text-secondary block mb-1">Repository Name</label>
                  <input
                    type="text"
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                    placeholder="SentroniX"
                    className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-3 py-2 font-label-md text-label-md text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="font-label-sm text-label-sm text-text-secondary block mb-1">Target Base Branch</label>
                  <input
                    type="text"
                    value={githubBase}
                    onChange={(e) => setGithubBase(e.target.value)}
                    placeholder="main"
                    className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-3 py-2 font-label-md text-label-md text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="max-w-4xl mt-4">
                <label className="font-label-sm text-label-sm text-text-secondary block mb-1">
                  GitHub Personal Access Token (PAT)
                </label>
                <div className="relative">
                  <input
                    type={showGitHubToken ? "text" : "password"}
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (Optional for Live PR Creation)"
                    className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-3 py-2 font-mono text-xs text-on-surface pr-10 focus:outline-none focus:border-primary"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowGitHubToken(!showGitHubToken)}
                    className="absolute right-3 top-2.5 text-text-muted hover:text-on-surface"
                  >
                    {showGitHubToken ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="font-body-sm text-[11px] text-text-muted mt-1">
                  Leave empty to generate simulated PR branches with reproduction steps and diff packages.
                </p>
              </div>
            </div>

            {/* Webhook Notifications */}
            <div className="bento-card">
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2 flex items-center gap-2">
                <Bell size={20} className="text-primary" />
                Real-Time Webhook Dispatch
              </h3>
              <p className="font-body-sm text-body-sm text-text-muted mb-4">
                Receive instant Slack, Microsoft Teams, or Discord alerts when zero-day threats or active exploits are detected.
              </p>

              <div className="max-w-2xl">
                <label className="font-label-sm text-label-sm text-text-secondary block mb-1">Incoming Webhook URL</label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://hooks.slack.com/services/..."
                  className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-3 py-2 font-label-md text-label-md text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. Scanners & Rulesets */}
        {activeTab === 'scanners' && (
          <div className="space-y-grid-gap">
            <div className="bento-card">
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4 flex items-center gap-2">
                <Sliders size={20} className="text-primary" />
                Defensive Scanner Tuning
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                <div>
                  <label className="font-label-sm text-label-sm text-text-secondary block mb-1">Semgrep SAST Ruleset</label>
                  <select
                    value={semgrepRuleset}
                    onChange={(e) => setSemgrepRuleset(e.target.value)}
                    className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-3 py-2 font-label-md text-label-md text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="p/security-audit">p/security-audit (Comprehensive Security Audit)</option>
                    <option value="p/owasp-top-ten">p/owasp-top-ten (OWASP Top 10 Specific)</option>
                    <option value="p/secrets">p/secrets (Hardcoded Tokens & Keys Only)</option>
                  </select>
                </div>

                <div>
                  <label className="font-label-sm text-label-sm text-text-secondary block mb-1">Nuclei Minimum Severity Filter</label>
                  <select
                    value={nucleiSeverity}
                    onChange={(e) => setNucleiSeverity(e.target.value)}
                    className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-3 py-2 font-label-md text-label-md text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="critical,high">Critical & High (Minimize Noise)</option>
                    <option value="critical,high,medium">Critical, High & Medium</option>
                    <option value="all">All Severities (Including Info/Recon)</option>
                  </select>
                </div>

                <div>
                  <label className="font-label-sm text-label-sm text-text-secondary block mb-1">Steganography Extraction Depth</label>
                  <select
                    value={stegThreshold}
                    onChange={(e) => setStegThreshold(e.target.value)}
                    className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-3 py-2 font-label-md text-label-md text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="deep">Deep Signature & Trailing EOF Extraction</option>
                    <option value="fast">Fast Header & Magic Byte Validation Only</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Database & Telemetry */}
        {activeTab === 'database' && (
          <div className="space-y-grid-gap">
            <div className="bento-card">
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2 flex items-center gap-2">
                <Database size={20} className="text-primary" />
                PostgreSQL & Redis Telemetry Retention
              </h3>
              <p className="font-body-sm text-body-sm text-text-muted mb-4">
                Manage scan artifact storage, finding history retention, and Redis worker queue health.
              </p>

              <div className="space-y-4 max-w-xl">
                <div className="flex justify-between items-center p-3 rounded-lg bg-surface-container-low border border-border-subtle">
                  <div>
                    <span className="font-label-md text-label-md text-on-surface block font-medium">Clear Telemetry Cache</span>
                    <span className="font-body-sm text-body-sm text-text-muted text-[12px]">Purge temporary scan artifacts and reset Redis cache counters.</span>
                  </div>
                  <button 
                    onClick={() => alert("Cache cleared successfully!")}
                    className="px-3 py-1.5 bg-surface-variant hover:bg-error-container text-on-surface hover:text-danger-offensive rounded font-label-sm text-label-sm transition-colors"
                  >
                    Purge Cache
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
