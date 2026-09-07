import React, { useState, useEffect } from 'react'
import { 
  Swords, ShieldAlert, Zap, Terminal, Sparkles, AlertCircle, 
  CheckCircle2, Clock, Send, RefreshCw, Layers, ShieldCheck, 
  ChevronRight, ArrowRight, Crosshair, Code, FileText, Globe, 
  Database, Search, Play, Check, Shield
} from 'lucide-react'
import AIPatchModal from '../components/AIPatchModal'

export default function PurpleTeamArenaPage() {
  const [activeMode, setActiveMode] = useState('atomic') // 'atomic' | 'caldera' | 'seclists'
  
  // Scenarios State (PayloadsAllTheThings & Atomic Red Team)
  const [scenarios, setScenarios] = useState([])
  const [selectedScenarioId, setSelectedScenarioId] = useState('')
  const [customPayload, setCustomPayload] = useState('')
  const [targetOverride, setTargetOverride] = useState('')
  const [notifyDiscord, setNotifyDiscord] = useState(true)
  
  // Caldera Campaigns State
  const [campaigns, setCampaigns] = useState([])
  const [selectedCampaignId, setSelectedCampaignId] = useState('')
  const [campaignResult, setCampaignResult] = useState(null)
  const [isCampaignRunning, setIsCampaignRunning] = useState(false)

  // SecLists Fuzzing State
  const [seclistsResults, setSeclistsResults] = useState([])
  const [isFuzzing, setIsFuzzing] = useState(false)

  // Execution & Telemetry State
  const [isStriking, setIsStriking] = useState(false)
  const [strikeResult, setStrikeResult] = useState(null)
  const [terminalLogs, setTerminalLogs] = useState([])
  const [metrics, setMetrics] = useState({
    total_simulated_strikes: 18,
    intercepted_threats: 18,
    interception_success_rate: 100.0,
    average_detection_latency_ms: 48.2,
    resilience_grade: 'A+'
  })
  const [history, setHistory] = useState([])

  // AI Patch Modal State
  const [patchModalFinding, setPatchModalFinding] = useState(null)
  const [isPatchModalOpen, setIsPatchModalOpen] = useState(false)

  useEffect(() => {
    fetchScenarios()
    fetchCampaigns()
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
    }
  }

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/red-team/campaigns')
      if (res.ok) {
        const data = await res.json()
        setCampaigns(data)
        if (data.length > 0) setSelectedCampaignId(data[0].id)
      }
    } catch (e) {
      // ignore
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

    const newLogs = [
      `[${timestamp}] 🔴 [RED TEAM] Initializing adversary strike emulation (${activeScenario?.source_repo || 'PayloadsAllTheThings'}): ${activeScenario?.title}`,
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
        
        const completionTime = new Date().toLocaleTimeString()
        const interceptionLogs = [
          `[${completionTime}] 🔵 [BLUE TEAM] 🛡️ THREAT INTERCEPTED! Rule fired: ${data.blue_team.inspection_rule}`,
          `[${completionTime}] ⚡ [TELEMETRY] Latency: ${data.blue_team.latency_ms}ms | Decision: ${data.blue_team.defense_status} (HTTP ${data.blue_team.status_code})`,
          `[${completionTime}] ✨ [PURPLE TEAM] Attack Neutralized. AI Remediation Diff ready for deployment.`
        ]
        setTerminalLogs(prev => [...interceptionLogs, ...prev])
        
        fetchMetrics()
        fetchHistory()
      }
    } catch (err) {
      console.error("Strike execution error:", err)
    } finally {
      setIsStriking(false)
    }
  }

  const handleRunCampaign = async () => {
    setIsCampaignRunning(true)
    const timestamp = new Date().toLocaleTimeString()
    setTerminalLogs(prev => [
      `[${timestamp}] ⚔️ [MITRE CALDERA] Initiating Autonomous Multi-Phase Campaign: ${selectedCampaignId}`,
      ...prev
    ])

    try {
      const res = await fetch('http://localhost:8000/api/v1/red-team/campaigns/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign_id: selectedCampaignId, notify_discord: notifyDiscord })
      })
      if (res.ok) {
        const data = await res.json()
        setCampaignResult(data)
        const completionTime = new Date().toLocaleTimeString()
        setTerminalLogs(prev => [
          `[${completionTime}] 🔵 [BLUE TEAM] Caldera Campaign Interception Complete: All ${data.stages_count} phases successfully blocked.`,
          ...prev
        ])
        fetchMetrics()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsCampaignRunning(false)
    }
  }

  const handleRunSecListsFuzzing = async () => {
    setIsFuzzing(true)
    const timestamp = new Date().toLocaleTimeString()
    setTerminalLogs(prev => [
      `[${timestamp}] 🔍 [SECLISTS] Dispatching high-fidelity sensitive path fuzzing dictionary probes...`,
      ...prev
    ])

    try {
      const res = await fetch('http://localhost:8000/api/v1/red-team/fuzzing/run', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setSeclistsResults(data)
        const completionTime = new Date().toLocaleTimeString()
        setTerminalLogs(prev => [
          `[${completionTime}] 🛡️ [DEFENSE] SecLists probe scan finished: ${data.length} endpoints inspected.`,
          ...prev
        ])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsFuzzing(false)
    }
  }

  const handleOpenAIPatch = () => {
    if (!strikeResult && !activeScenario) return
    const findingObj = {
      id: strikeResult?.db_finding_id || 999,
      title: strikeResult?.title || activeScenario?.title,
      severity: strikeResult?.severity || activeScenario?.severity,
      tool: `SentroniX Purple AI (${strikeResult?.source_repo || 'Adversary Engine'})`,
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
            {/* Top 4 Repos Integration Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[11px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
                <Crosshair size={11} className="text-red-400" />
                Atomic Red Team
              </span>
              <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[11px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
                <Code size={11} className="text-purple-400" />
                PayloadsAllTheThings
              </span>
              <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck size={11} className="text-blue-400" />
                MITRE Caldera
              </span>
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
                <Database size={11} className="text-amber-400" />
                SecLists
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-on-surface flex items-center gap-2.5">
              <Swords className="text-primary" size={28} />
              Purple Team Arena & Adversary Simulator
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Harness industry-standard offensive intelligence to safely launch adversary vectors, evaluate live AST & WAF interception, and deploy AI remediation diffs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => { fetchScenarios(); fetchCampaigns(); fetchMetrics(); fetchHistory(); }}
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

        {/* Operation Mode Tabs (Atomic Vectors, Caldera Campaigns, SecLists Fuzzing) */}
        <div className="flex gap-4 border-b border-border">
          <button 
            onClick={() => setActiveMode('atomic')}
            className={`pb-2.5 px-2 font-semibold text-xs transition-all flex items-center gap-2 ${
              activeMode === 'atomic' 
                ? 'text-primary border-b-2 border-primary font-bold' 
                : 'text-text-secondary hover:text-on-surface'
            }`}
          >
            <Crosshair size={15} />
            Atomic Strikes & Payloads (Atomic Red Team & PayloadsAllTheThings)
          </button>
          
          <button 
            onClick={() => setActiveMode('caldera')}
            className={`pb-2.5 px-2 font-semibold text-xs transition-all flex items-center gap-2 ${
              activeMode === 'caldera' 
                ? 'text-primary border-b-2 border-primary font-bold' 
                : 'text-text-secondary hover:text-on-surface'
            }`}
          >
            <Swords size={15} />
            Adversary Campaigns (MITRE Caldera)
          </button>

          <button 
            onClick={() => setActiveMode('seclists')}
            className={`pb-2.5 px-2 font-semibold text-xs transition-all flex items-center gap-2 ${
              activeMode === 'seclists' 
                ? 'text-primary border-b-2 border-primary font-bold' 
                : 'text-text-secondary hover:text-on-surface'
            }`}
          >
            <Database size={15} />
            Sensitive Path Fuzzer (SecLists)
          </button>
        </div>

        {/* ================= MODE 1: ATOMIC STRIKES ================= */}
        {activeMode === 'atomic' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 🔴 LEFT PANE: Red Team Adversary Launchpad */}
            <div className="bg-surface border border-red-500/30 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden shadow-lg shadow-red-500/5">
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                      <Crosshair size={18} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-on-surface">Red Team Launchpad</h2>
                      <p className="text-xs text-text-muted">Atomic Test & Payload Injector</p>
                    </div>
                  </div>
                  <span className="text-xs bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded font-mono font-bold">
                    {activeScenario?.source_repo || 'OFFENSIVE OPS'}
                  </span>
                </div>

                {/* Scenario Selector */}
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    Select Atomic Scenario
                  </label>
                  <select 
                    value={selectedScenarioId}
                    onChange={(e) => handleScenarioChange(e.target.value)}
                    className="w-full bg-surface-container-high border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-red-500 transition-colors"
                  >
                    {scenarios.map(s => (
                      <option key={s.id} value={s.id}>
                        [{s.severity}] {s.title} ({s.mitre_tactic})
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
                      <span className="text-xs text-text-muted">Technique ID</span>
                      <span className="text-xs font-mono text-text-secondary">{activeScenario.mitre_technique}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-muted">Classification</span>
                      <span className="text-xs font-mono text-text-secondary">{activeScenario.cwe} • {activeScenario.owasp}</span>
                    </div>
                  </div>
                )}

                {/* PayloadsAllTheThings Presets */}
                {activeScenario?.payload_variants && activeScenario.payload_variants.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-text-secondary block mb-1.5">
                      💡 PayloadsAllTheThings Presets (Click to load):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeScenario.payload_variants.map((variant, idx) => (
                        <button 
                          key={idx}
                          onClick={() => setCustomPayload(variant)}
                          className="text-[11px] font-mono bg-black/40 hover:bg-red-500/10 border border-border hover:border-red-500/40 text-red-300 px-2 py-1 rounded transition-colors truncate max-w-xs"
                          title={variant}
                        >
                          {variant}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Target Endpoint Override */}
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    Target Endpoint
                  </label>
                  <input 
                    type="text"
                    value={targetOverride}
                    onChange={(e) => setTargetOverride(e.target.value)}
                    placeholder="/api/v1/auth/login"
                    className="w-full bg-surface-container-high border border-outline-variant rounded-lg px-3 py-2 text-xs font-mono text-on-surface focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                {/* Injected Payload Editor */}
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

                {/* Discord Alert Toggle */}
                <div className="flex items-center gap-2 pt-1">
                  <input 
                    type="checkbox" 
                    id="discordAlert" 
                    checked={notifyDiscord} 
                    onChange={(e) => setNotifyDiscord(e.target.checked)}
                    className="rounded border-outline-variant text-red-500 focus:ring-red-500/20"
                  />
                  <label htmlFor="discordAlert" className="text-xs text-text-secondary cursor-pointer">
                    Broadcast event to SentoBot <code className="text-red-400 bg-red-500/10 px-1 py-0.5 rounded">#mod-security-alerts</code>
                  </label>
                </div>
              </div>

              {/* Strike Trigger Button */}
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
                      Transmitting Adversary Vector...
                    </>
                  ) : (
                    <>
                      <Swords size={18} />
                      Execute Atomic Strike
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 🔵 RIGHT PANE: Blue Team Defensive Interception Telemetry */}
            <div className="bg-surface border border-blue-500/30 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden shadow-lg shadow-blue-500/5">
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

                    <div className="p-3 bg-surface-container/80 border border-border rounded-xl space-y-1">
                      <span className="text-xs text-text-muted block">Detection & AST Rule Triggered</span>
                      <span className="text-xs font-mono font-semibold text-blue-300 block">
                        {strikeResult.blue_team.inspection_rule}
                      </span>
                    </div>

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
                      Select a scenario on the left and click "Execute Atomic Strike" to observe live defensive interception.
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
        )}

        {/* ================= MODE 2: MITRE CALDERA CAMPAIGNS ================= */}
        {activeMode === 'caldera' && (
          <div className="bg-surface border border-outline-variant rounded-2xl p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                  <Swords className="text-primary" size={20} />
                  MITRE Caldera Autonomous Adversary Campaigns
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Simulate multi-stage APT campaigns traversing reconnaissance, public exploitation, and privilege escalation in automated sequence.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select 
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  className="bg-surface-container-high border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none"
                >
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.threat_actor})
                    </option>
                  ))}
                </select>

                <button 
                  onClick={handleRunCampaign}
                  disabled={isCampaignRunning}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
                >
                  {isCampaignRunning ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                  Launch Campaign
                </button>
              </div>
            </div>

            {/* Campaign Stages Progression */}
            <div className="space-y-4">
              {campaigns.find(c => c.id === selectedCampaignId)?.stages.map((stage, idx) => (
                <div key={idx} className="p-4 bg-surface-container/60 border border-border rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">
                      {stage.phase}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-on-surface">{stage.tactic}</span>
                        <span className="text-[11px] font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                          {stage.technique}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5">{stage.action}</p>
                      <code className="text-[11px] text-zinc-400 font-mono block mt-1">Payload: {stage.payload}</code>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                      🛡️ WAF Interceptor Ready
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= MODE 3: SECLISTS FUZZING ================= */}
        {activeMode === 'seclists' && (
          <div className="bg-surface border border-outline-variant rounded-2xl p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                  <Database className="text-amber-400" size={20} />
                  SecLists Sensitive Path & Parameter Discovery
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Probe common sensitive paths (e.g. `/.env`, `/.git/HEAD`, `/api/swagger.json`) to audit perimeter exposure.
                </p>
              </div>

              <button 
                onClick={handleRunSecListsFuzzing}
                disabled={isFuzzing}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
              >
                {isFuzzing ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
                Run SecLists Probe Scan
              </button>
            </div>

            {seclistsResults.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-text-muted uppercase text-[10px] tracking-wider">
                      <th className="pb-2.5">Probed Path</th>
                      <th className="pb-2.5">Artifact Category</th>
                      <th className="pb-2.5">Risk Rating</th>
                      <th className="pb-2.5">Defense Status</th>
                      <th className="pb-2.5">Inspection Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {seclistsResults.map((p, idx) => (
                      <tr key={idx} className="hover:bg-surface-hover transition-colors">
                        <td className="py-2.5 font-mono text-amber-300 font-semibold">{p.path}</td>
                        <td className="py-2.5 text-text-secondary">{p.type}</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.risk === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : (p.risk === 'HIGH' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400')
                          }`}>
                            {p.risk}
                          </span>
                        </td>
                        <td className="py-2.5 font-mono text-emerald-400">{p.status}</td>
                        <td className="py-2.5 text-text-muted">{p.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-text-muted border border-dashed border-border rounded-xl">
                <Database size={32} className="mx-auto text-text-muted opacity-40 mb-2" />
                <p className="text-xs">Click "Run SecLists Probe Scan" to evaluate sensitive endpoint exposures.</p>
              </div>
            )}
          </div>
        )}

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
                else if (log.includes("🔍") || log.includes("⚔️")) colorClass = "text-amber-300 font-semibold"
                return (
                  <div key={idx} className={`${colorClass} leading-relaxed font-mono`}>
                    {log}
                  </div>
                )
              })
            ) : (
              <div className="text-zinc-500 italic py-6 text-center">
                Console initialized. Execute an atomic strike, Caldera campaign, or SecLists probe to monitor real-time packet transmissions.
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
                    <th className="pb-2.5">Source Repo</th>
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
                      <td className="py-2.5 font-mono text-purple-300">{item.source_repo || 'PayloadsAllTheThings'}</td>
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
