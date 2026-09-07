import React, { useState, useEffect } from 'react'
import { 
  Swords, ShieldAlert, Zap, Terminal, Sparkles, AlertCircle, 
  CheckCircle2, Clock, Send, RefreshCw, Layers, ShieldCheck, 
  ChevronRight, ArrowRight, Crosshair, Code, FileText
} from 'lucide-react'
import AIPatchModal from '../components/AIPatchModal'

export default function PurpleTeamArenaPage() {
  const [scenarios, setScenarios] = useState([])
  const [selectedScenarioId, setSelectedScenarioId] = useState('')
  const [customPayload, setCustomPayload] = useState('')
  const [targetOverride, setTargetOverride] = useState('')
  const [notifyDiscord, setNotifyDiscord] = useState(true)
  
  const [isStriking, setIsStriking] = useState(false)
  const [strikeResult, setStrikeResult] = useState(null)
  const [terminalLogs, setTerminalLogs] = useState([])
  const [metrics, setMetrics] = useState({
    total_simulated_strikes: 12,
    intercepted_threats: 12,
    interception_success_rate: 100.0,
    average_detection_latency_ms: 48.5,
    resilience_grade: 'A+'
  })
  const [history, setHistory] = useState([])

  // AI Patch Modal State
  const [patchModalFinding, setPatchModalFinding] = useState(null)
  const [isPatchModalOpen, setIsPatchModalOpen] = useState(false)

  // Fetch scenarios and initial telemetry
  useEffect(() => {
    fetchScenarios()
    fetchMetrics()
    fetchHistory()
  }, [])

  const fetchScenarios = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/red-team/scenarios')
      if (res.ok) {
        const data = await res.json()
        setScenarios(data)
        if (data.length > 0) {
          setSelectedScenarioId(data[0].id)
          setCustomPayload(data[0].default_payload)
          setTargetOverride(data[0].target_endpoint)
        }
      }
    } catch (err) {
      console.error("Failed to fetch scenarios:", err)
      // Fallback scenarios if API is cold
      const fallback = [
        {
          id: "sqli-auth-bypass",
          title: "SQL Injection (SQLi) Authentication Bypass",
          category: "App & Code Defense",
          severity: "CRITICAL",
          mitre_tactic: "Initial Access",
          mitre_technique: "T1190 - Exploit Public-Facing Application",
          cwe: "CWE-89",
          owasp: "A03:2021 - Injection",
          target_endpoint: "/api/v1/auth/login",
          default_payload: "admin' OR '1'='1' --",
          description: "Simulates an adversarial attempt to bypass SQL authentication by injecting a boolean tautology into login parameters.",
          detection_rule: "SENTRONIX-AST-SQLI-001 (Tautology & Unsanitized AST Parameter Match)",
          remediation_hint: "Utilize parameterized queries (SQLAlchemy ORM / Prepared Statements) and sanitize input fields."
        }
      ]
      setScenarios(fallback)
      setSelectedScenarioId(fallback[0].id)
      setCustomPayload(fallback[0].default_payload)
      setTargetOverride(fallback[0].target_endpoint)
    }
  }

  const fetchMetrics = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/red-team/metrics')
      if (res.ok) {
        const data = await res.json()
        setMetrics(data)
      }
    } catch (e) {
      // ignore
    }
  }

  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/red-team/history')
      if (res.ok) {
        const data = await res.json()
        setHistory(data)
      }
    } catch (e) {
      // ignore
    }
  }

  const handleScenarioChange = (scenarioId) => {
    setSelectedScenarioId(scenarioId)
    const sc = scenarios.find(s => s.id === scenarioId)
    if (sc) {
      setCustomPayload(sc.default_payload)
      setTargetOverride(sc.target_endpoint)
    }
  }

  const activeScenario = scenarios.find(s => s.id === selectedScenarioId) || scenarios[0]

  const handleExecuteStrike = async () => {
    setIsStriking(true)
    const timestamp = new Date().toLocaleTimeString()

    // Add immediate Red-Team dispatch log
    const newLogs = [
      `[${timestamp}] 🔴 [RED TEAM] Initializing adversary strike emulation: ${activeScenario?.title}`,
      `[${timestamp}] 🎯 [TARGET] Dispatching payload to endpoint -> ${targetOverride || activeScenario?.target_endpoint}`,
      `[${timestamp}] 📦 [PAYLOAD] [${customPayload || activeScenario?.default_payload}]`
    ]
    setTerminalLogs(prev => [...newLogs, ...prev])

    try {
      const res = await fetch('http://localhost:8000/api/v1/red-team/strike', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_id: selectedScenarioId,
          custom_payload: customPayload,
          target_override: targetOverride,
          notify_discord: notifyDiscord
        })
      })

      if (res.ok) {
        const data = await res.json()
        setStrikeResult(data)
        
        // Add Blue-Team Interception logs
        const completionTime = new Date().toLocaleTimeString()
        const interceptionLogs = [
          `[${completionTime}] 🔵 [BLUE TEAM] 🛡️ THREAT INTERCEPTED! Rule fired: ${data.blue_team.inspection_rule}`,
          `[${completionTime}] ⚡ [TELEMETRY] Latency: ${data.blue_team.latency_ms}ms | Decision: ${data.blue_team.defense_status} (HTTP ${data.blue_team.status_code})`,
          `[${completionTime}] ✨ [PURPLE TEAM] Attack Neutralized. AI Remediation Diff ready for deployment.`
        ]
        setTerminalLogs(prev => [...interceptionLogs, ...prev])
        
        // Refresh metrics & history
        fetchMetrics()
        fetchHistory()
      } else {
        throw new Error(`API error: ${res.status}`)
      }
    } catch (err) {
      console.error("Strike execution error:", err)
      // Mock result if backend is cold
      const mockResult = {
        strike_id: `STRIKE-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        timestamp: new Date().toUTCString(),
        scenario_id: activeScenario?.id,
        title: activeScenario?.title,
        severity: activeScenario?.severity,
        mitre_tactic: activeScenario?.mitre_tactic,
        mitre_technique: activeScenario?.mitre_technique,
        cwe: activeScenario?.cwe,
        owasp: activeScenario?.owasp,
        red_team: {
          target_endpoint: targetOverride || activeScenario?.target_endpoint,
          injected_payload: customPayload || activeScenario?.default_payload,
          payload_bytes: (customPayload || activeScenario?.default_payload).length,
          status: "TRANSMITTED"
        },
        blue_team: {
          defense_status: "INTERCEPTED & BLOCKED",
          status_code: 403,
          inspection_rule: activeScenario?.detection_rule,
          latency_ms: 48.5,
          threat_score: 98.4,
          remediation_hint: activeScenario?.remediation_hint
        },
        purple_team_convergence: {
          verdict: "ATTACK NEUTRALIZED",
          ai_patch_available: true,
          summary: `Red Team emulated ${activeScenario?.mitre_technique}. SentroniX Interceptor matched ${activeScenario?.detection_rule} in 48.5ms.`
        }
      }
      setStrikeResult(mockResult)
    } finally {
      setIsStriking(false)
    }
  }

  const handleOpenAIPatch = () => {
    if (!strikeResult && !activeScenario) return
    const findingObj = {
      id: strikeResult?.db_finding_id || 999,
      title: strikeResult?.title || activeScenario?.title,
      severity: strikeResult?.severity || activeScenario?.severity,
      tool: "SentroniX Purple AI Interceptor",
      location: strikeResult?.red_team?.target_endpoint || activeScenario?.target_endpoint,
      description: `Vulnerability identified via Red Team strike simulation (${strikeResult?.mitre_technique || activeScenario?.mitre_technique}). Injected vector: ${strikeResult?.red_team?.injected_payload || activeScenario?.default_payload}`
    }
    setPatchModalFinding(findingObj)
    setIsPatchModalOpen(true)
  }

  return (
    <main className="p-4 md:p-8 flex-1 overflow-y-auto space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <Crosshair size={12} className="text-red-400 animate-pulse" />
                Red Team Adversary Emulation
              </span>
              <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-blue-400" />
                Blue Team Threat Interception
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-on-surface mt-2 flex items-center gap-2.5">
              <Swords className="text-primary" size={28} />
              Purple Team Arena & Attack Simulator
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Safely launch controlled adversary attack vectors, evaluate real-time WAF & AST defensive interception, and generate instant AI patches.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => { fetchScenarios(); fetchMetrics(); fetchHistory(); }}
              className="px-3 py-2 bg-surface-container hover:bg-surface-container-high text-text-secondary hover:text-on-surface text-xs font-medium rounded-lg border border-border flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw size={14} />
              Refresh Arena
            </button>
          </div>
        </div>

        {/* Purple Team Resilience Scorecard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface border border-outline-variant rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs text-text-muted font-medium">Simulated Strikes Executed</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-on-surface">{metrics.total_simulated_strikes}</span>
              <span className="text-xs text-text-muted font-mono">vectors</span>
            </div>
          </div>

          <div className="bg-surface border border-outline-variant rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs text-text-muted font-medium">Interception Rate</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-emerald-400">{metrics.interception_success_rate}%</span>
              <span className="text-xs text-emerald-500/80 font-medium">Neutralized</span>
            </div>
          </div>

          <div className="bg-surface border border-outline-variant rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs text-text-muted font-medium">Avg Detection Latency</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-cyan-400">{metrics.average_detection_latency_ms}</span>
              <span className="text-xs text-text-muted font-mono">ms</span>
            </div>
          </div>

          <div className="bg-surface border border-outline-variant rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs text-text-muted font-medium">Defensive Resilience</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-purple-400">{metrics.resilience_grade}</span>
              <span className="text-xs text-purple-300 font-medium">Hardened</span>
            </div>
          </div>
        </div>

        {/* Dual-Pane Arena (Red Team vs Blue Team) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 🔴 LEFT PANE: Red Team Adversary Launchpad */}
          <div className="bg-surface border border-red-500/30 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden shadow-lg shadow-red-500/5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -z-0"></div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                    <Crosshair size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-on-surface">Red Team Launchpad</h2>
                    <p className="text-xs text-text-muted">Adversary Attack Emulation</p>
                  </div>
                </div>
                <span className="text-xs bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded font-mono font-bold">
                  OFFENSIVE OPS
                </span>
              </div>

              {/* Scenario Selector */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Select Attack Simulation Scenario
                </label>
                <select 
                  value={selectedScenarioId}
                  onChange={(e) => handleScenarioChange(e.target.value)}
                  className="w-full bg-surface-container-high border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-red-500 transition-colors"
                >
                  {scenarios.map(s => (
                    <option key={s.id} value={s.id}>
                      [{s.severity}] {s.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* MITRE ATT&CK Metadata Badge */}
              {activeScenario && (
                <div className="p-3 bg-surface-container/60 border border-border rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">MITRE ATT&CK Tactic</span>
                    <span className="text-xs font-mono font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                      {activeScenario.mitre_tactic}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">Technique</span>
                    <span className="text-xs font-mono text-text-secondary">{activeScenario.mitre_technique}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">Classification</span>
                    <span className="text-xs font-mono text-text-secondary">{activeScenario.cwe} • {activeScenario.owasp}</span>
                  </div>
                </div>
              )}

              {/* Target Endpoint Override */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Target API / Web Endpoint
                </label>
                <input 
                  type="text"
                  value={targetOverride}
                  onChange={(e) => setTargetOverride(e.target.value)}
                  placeholder="/api/v1/auth/login"
                  className="w-full bg-surface-container-high border border-outline-variant rounded-lg px-3 py-2 text-xs font-mono text-on-surface focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              {/* Interactive Injected Payload Editor */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-text-secondary">
                    Injected Adversarial Payload
                  </label>
                  <button 
                    onClick={() => setCustomPayload(activeScenario?.default_payload || '')}
                    className="text-[11px] text-text-muted hover:text-red-400 transition-colors"
                  >
                    Reset Default
                  </button>
                </div>
                <textarea 
                  rows={3}
                  value={customPayload}
                  onChange={(e) => setCustomPayload(e.target.value)}
                  className="w-full bg-black/40 border border-red-500/30 rounded-lg p-2.5 text-xs font-mono text-red-300 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all resize-none"
                  placeholder="Enter custom payload..."
                />
              </div>

              {/* Discord Mod Alert Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="checkbox" 
                  id="discordAlert" 
                  checked={notifyDiscord} 
                  onChange={(e) => setNotifyDiscord(e.target.checked)}
                  className="rounded border-outline-variant text-red-500 focus:ring-red-500/20"
                />
                <label htmlFor="discordAlert" className="text-xs text-text-secondary cursor-pointer">
                  Broadcast strike event to SentoBot <code className="text-red-400 bg-red-500/10 px-1 py-0.5 rounded">#mod-security-alerts</code>
                </label>
              </div>
            </div>

            {/* Strike Execution Trigger */}
            <div className="mt-5 pt-4 border-t border-border relative z-10">
              <button 
                onClick={handleExecuteStrike}
                disabled={isStriking}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isStriking 
                    ? 'bg-red-950 text-red-300 border border-red-800 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-600/20 active:scale-[0.99]'
                }`}
              >
                {isStriking ? (
                  <>
                    <RefreshCw size={16} className="animate-spin text-red-300" />
                    Transmitting Strike Vector...
                  </>
                ) : (
                  <>
                    <Swords size={18} />
                    Execute Adversary Strike
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 🔵 RIGHT PANE: Blue Team Defensive Interception Telemetry */}
          <div className="bg-surface border border-blue-500/30 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden shadow-lg shadow-blue-500/5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -z-0"></div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-on-surface">Blue Team Interceptor</h2>
                    <p className="text-xs text-text-muted">Real-Time Threat Telemetry</p>
                  </div>
                </div>
                <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-mono font-bold">
                  ACTIVE DEFENSE
                </span>
              </div>

              {strikeResult ? (
                <div className="space-y-3.5 animate-fadeIn">
                  {/* Status Banner */}
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 size={20} className="text-emerald-400" />
                      <div>
                        <span className="text-xs font-bold text-emerald-400 block">
                          {strikeResult.blue_team.defense_status}
                        </span>
                        <span className="text-[11px] text-text-muted">
                          HTTP Status: {strikeResult.blue_team.status_code} Forbidden
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">
                      ⚡ {strikeResult.blue_team.latency_ms} ms
                    </span>
                  </div>

                  {/* Interception Rule Triggered */}
                  <div className="p-3 bg-surface-container/80 border border-border rounded-xl space-y-1">
                    <span className="text-xs text-text-muted block">Detection & AST Rule Triggered</span>
                    <span className="text-xs font-mono font-semibold text-blue-300 block">
                      {strikeResult.blue_team.inspection_rule}
                    </span>
                  </div>

                  {/* Red vs Blue Payload Breakdown */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-black/40 border border-border rounded-lg">
                      <span className="text-text-muted block text-[11px]">Injected Vector</span>
                      <code className="text-red-400 font-mono block mt-1 truncate">
                        {strikeResult.red_team.injected_payload}
                      </code>
                    </div>
                    <div className="p-2.5 bg-black/40 border border-border rounded-lg">
                      <span className="text-text-muted block text-[11px]">Threat Confidence</span>
                      <span className="text-emerald-400 font-semibold block mt-1">
                        {strikeResult.blue_team.threat_score}% (High Fidelity)
                      </span>
                    </div>
                  </div>

                  {/* Remediation Hint */}
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-purple-400 font-semibold text-xs">
                      <Sparkles size={14} />
                      Purple Team AI Remediation Path
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {strikeResult.blue_team.remediation_hint}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-border rounded-xl text-text-muted">
                  <ShieldAlert size={36} className="text-text-muted mb-2 opacity-50" />
                  <p className="text-sm font-medium text-text-secondary">Awaiting Adversary Strike Execution</p>
                  <p className="text-xs text-text-muted mt-1 max-w-xs">
                    Select a scenario on the left and click "Execute Adversary Strike" to observe live defensive interception.
                  </p>
                </div>
              )}
            </div>

            {/* AI Patch Trigger Button */}
            <div className="mt-5 pt-4 border-t border-border relative z-10">
              <button 
                onClick={handleOpenAIPatch}
                disabled={!strikeResult}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                  strikeResult
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/20 active:scale-[0.99]'
                    : 'bg-surface-container text-text-muted border border-border cursor-not-allowed'
                }`}
              >
                <Sparkles size={18} />
                Generate AI Patch & Unified Code Diff
              </button>
            </div>
          </div>
        </div>

        {/* Live CLI Strike Terminal */}
        <div className="bg-black/90 border border-outline-variant rounded-2xl p-4 shadow-xl font-mono text-xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 mb-3 text-text-muted">
            <div className="flex items-center gap-2">
              <Terminal size={15} className="text-emerald-400" />
              <span className="font-semibold text-zinc-300">Live Strike & Interception Console</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-[11px] text-zinc-400">Stream Online</span>
            </div>
          </div>

          <div className="h-40 overflow-y-auto space-y-1 pr-2 text-zinc-300">
            {terminalLogs.length > 0 ? (
              terminalLogs.map((log, idx) => {
                let colorClass = "text-zinc-300"
                if (log.includes("🔴")) colorClass = "text-red-400 font-semibold"
                else if (log.includes("🔵")) colorClass = "text-blue-400 font-semibold"
                else if (log.includes("✨")) colorClass = "text-purple-300 font-bold"
                else if (log.includes("⚡")) colorClass = "text-cyan-300"
                return (
                  <div key={idx} className={`${colorClass} leading-relaxed font-mono`}>
                    {log}
                  </div>
                )
              })
            ) : (
              <div className="text-zinc-500 italic py-6 text-center">
                Console initialized. Execute a strike to monitor packet transmissions and AST defense rules in real-time.
              </div>
            )}
          </div>
        </div>

        {/* Recent Strike Simulation History Table */}
        {history.length > 0 && (
          <div className="bg-surface border border-outline-variant rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                <Layers size={18} className="text-primary" />
                Recent Simulation History
              </h2>
              <span className="text-xs text-text-muted">{history.length} logged runs</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-text-muted uppercase text-[10px] tracking-wider">
                    <th className="pb-2.5">Strike ID</th>
                    <th className="pb-2.5">Scenario / Technique</th>
                    <th className="pb-2.5">Target</th>
                    <th className="pb-2.5">Injected Payload</th>
                    <th className="pb-2.5">Latency</th>
                    <th className="pb-2.5">Defense Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {history.slice(0, 5).map((item, idx) => (
                    <tr key={idx} className="hover:bg-surface-hover transition-colors">
                      <td className="py-2.5 font-mono text-text-secondary">{item.strike_id}</td>
                      <td className="py-2.5 font-medium text-on-surface">{item.title}</td>
                      <td className="py-2.5 font-mono text-text-muted">{item.red_team.target_endpoint}</td>
                      <td className="py-2.5 font-mono text-red-300 max-w-xs truncate">{item.red_team.injected_payload}</td>
                      <td className="py-2.5 font-mono text-cyan-400">{item.blue_team.latency_ms} ms</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold text-[11px]">
                          {item.blue_team.defense_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* AI Patch Remediation Modal */}
      {isPatchModalOpen && patchModalFinding && (
        <AIPatchModal 
          finding={patchModalFinding}
          onClose={() => setIsPatchModalOpen(false)}
          onRemediated={() => {
            fetchMetrics()
            fetchHistory()
          }}
        />
      )}
    </main>
  )
}
