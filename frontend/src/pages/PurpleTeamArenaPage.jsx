import React, { useState, useEffect } from 'react'
import { 
  Swords, ShieldAlert, Zap, Terminal, Sparkles, AlertCircle, 
  CheckCircle2, Clock, Send, RefreshCw, Layers, ShieldCheck, 
  ChevronRight, ChevronLeft, ArrowRight, Crosshair, Code, FileText, Globe, 
  Database, Search, Play, Check, Shield, Sliders, ToggleLeft, ToggleRight,
  Copy, Eye, Lock, ShieldX, AlertTriangle, X
} from 'lucide-react'
import AIPatchModal from '../components/AIPatchModal'
import { apiFetch } from '../apiConfig'
import { useHorizontalScroll } from '../hooks/useHorizontalScroll'

export default function PurpleTeamArenaPage() {
  const defaultOrigin = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? window.location.origin 
    : 'http://localhost:8000'

  const { elRef: tabsRef, canScrollLeft, canScrollRight, isDragging, scroll: scrollTabs } = useHorizontalScroll()
  const [activeMode, setActiveMode] = useState('atomic') // 'atomic' | 'caldera' | 'seclists' | 'waf_sandbox'
  
  // Scenarios State
  const [scenarios, setScenarios] = useState([])
  const [selectedScenarioId, setSelectedScenarioId] = useState('')
  const [customPayload, setCustomPayload] = useState('')
  const [targetOverride, setTargetOverride] = useState('')
  const [notifyDiscord, setNotifyDiscord] = useState(true)
  
  // WAF Rules State
  const [wafRules, setWafRules] = useState({})
  
  // Caldera Campaigns State
  const [campaigns, setCampaigns] = useState([])
  const [selectedCampaignId, setSelectedCampaignId] = useState('')
  const [campaignResult, setCampaignResult] = useState(null)
  const [isCampaignRunning, setIsCampaignRunning] = useState(false)

  // SecLists Fuzzing State
  const [seclistsResults, setSeclistsResults] = useState([])
  const [isFuzzing, setIsFuzzing] = useState(false)

  // Live Target Endpoint Fuzzer State
  const [liveTargetUrl, setLiveTargetUrl] = useState(`${defaultOrigin}/api/v1/auth/login`)
  const [liveMethod, setLiveMethod] = useState('POST')
  const [liveVectors, setLiveVectors] = useState(['sqli', 'xss', 'ssrf', 'path_traversal', 'seclists'])
  const [liveCustomPayload, setLiveCustomPayload] = useState('')
  const [liveCustomHeaders, setLiveCustomHeaders] = useState('')
  const [liveScanResult, setLiveScanResult] = useState(null)
  const [isLiveScanning, setIsLiveScanning] = useState(false)

  // Execution & Telemetry State
  const [isStriking, setIsStriking] = useState(false)
  const [strikeResult, setStrikeResult] = useState(null)
  const [terminalLogs, setTerminalLogs] = useState([])
  const [metrics, setMetrics] = useState({
    total_simulated_strikes: 0,
    intercepted_threats: 0,
    interception_success_rate: 0.0,
    average_detection_latency_ms: 0.0,
    resilience_grade: '—',
    resilience_label: 'Unassessed'
  })
  const [history, setHistory] = useState([])
  const [isPacketModalOpen, setIsPacketModalOpen] = useState(false)
  const [copiedPacket, setCopiedPacket] = useState(false)

  // AI Patch Modal State
  const [patchModalFinding, setPatchModalFinding] = useState(null)
  const [isPatchModalOpen, setIsPatchModalOpen] = useState(false)

  useEffect(() => {
    fetchScenarios()
    fetchWafRules()
    fetchCampaigns()
    fetchMetrics()
    fetchHistory()
  }, [])

  const fetchScenarios = async () => {
    try {
      const res = await apiFetch('/api/v1/red-team/scenarios')
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

  const fetchWafRules = async () => {
    try {
      const res = await apiFetch('/api/v1/red-team/waf-rules')
      if (res.ok) {
        const data = await res.json()
        setWafRules(data)
      }
    } catch (e) {
      // ignore
    }
  }

  const handleToggleWafRule = async (ruleKey, currentVal) => {
    const newVal = !currentVal
    setWafRules(prev => ({
      ...prev,
      [ruleKey]: { ...prev[ruleKey], enabled: newVal }
    }))

    try {
      await apiFetch('/api/v1/red-team/waf-rules/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rule_key: ruleKey, enabled: newVal })
      })
    } catch (e) {
      console.error(e)
    }
  }

  const fetchCampaigns = async () => {
    try {
      const res = await apiFetch('/api/v1/red-team/campaigns')
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
      const res = await apiFetch('/api/v1/red-team/metrics')
      if (res.ok) setMetrics(await res.json())
    } catch (e) {
      // ignore
    }
  }

  const fetchHistory = async () => {
    try {
      const res = await apiFetch('/api/v1/red-team/history')
      if (res.ok) setHistory(await res.json())
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
      // Collect current WAF rule states
      const wafOverrides = {}
      Object.keys(wafRules).forEach(k => {
        wafOverrides[k] = wafRules[k].enabled
      })

      const res = await apiFetch('/api/v1/red-team/strike', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_id: selectedScenarioId,
          custom_payload: customPayload,
          target_override: targetOverride,
          notify_discord: notifyDiscord,
          waf_overrides: wafOverrides
        })
      })

      if (res.ok) {
        const data = await res.json()
        setStrikeResult(data)
        
        const completionTime = new Date().toLocaleTimeString()
        const isBlocked = data.blue_team.defense_status.includes("INTERCEPTED")
        const interceptionLogs = [
          `[${completionTime}] ${isBlocked ? '🔵 [BLUE TEAM] 🛡️ THREAT INTERCEPTED!' : '⚠️ [BLUE TEAM] 🚨 DEFENSE BYPASS! WAF rule disabled.'} Rule fired: ${data.blue_team.inspection_rule}`,
          `[${completionTime}] ⚡ [TELEMETRY] Latency: ${data.blue_team.latency_ms}ms | Decision: ${data.blue_team.defense_status} (HTTP ${data.blue_team.status_code})`,
          `[${completionTime}] ✨ [PURPLE TEAM] ${data.purple_team_convergence.verdict}. Telemetry packet logged.`
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
      const res = await apiFetch('/api/v1/red-team/campaigns/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign_id: selectedCampaignId, notify_discord: notifyDiscord })
      })
      if (res.ok) {
        const data = await res.json()
        setCampaignResult(data)
        const completionTime = new Date().toLocaleTimeString()
        setTerminalLogs(prev => [
          `[${completionTime}] 🔵 [BLUE TEAM] Caldera Campaign Interception Complete: All ${data.stages_count} phases successfully evaluated.`,
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
      const res = await apiFetch('/api/v1/red-team/fuzzing/run', { method: 'POST' })
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

  const toggleLiveVector = (vecKey) => {
    setLiveVectors(prev => 
      prev.includes(vecKey) ? prev.filter(v => v !== vecKey) : [...prev, vecKey]
    )
  }

  const handleRunLiveScan = async () => {
    if (!liveTargetUrl.trim()) return
    setIsLiveScanning(true)
    const timestamp = new Date().toLocaleTimeString()
    setTerminalLogs(prev => [
      `[${timestamp}] 🎯 [LIVE FUZZER] Launching targeted adversary attack probes against: ${liveTargetUrl}`,
      `[${timestamp}] ⚡ [METHOD] ${liveMethod} | Vectors: [${liveVectors.join(', ')}]`,
      ...prev
    ])

    let customHeadersObj = {}
    if (liveCustomHeaders.trim()) {
      try {
        customHeadersObj = JSON.parse(liveCustomHeaders)
      } catch (e) {
        // keep empty
      }
    }

    try {
      const res = await apiFetch('/api/v1/red-team/live-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_url: liveTargetUrl.trim(),
          method: liveMethod,
          vectors: liveVectors,
          custom_headers: customHeadersObj,
          custom_payload: liveCustomPayload.trim() || null
        })
      })

      if (res.ok) {
        const data = await res.json()
        setLiveScanResult(data)
        const completionTime = new Date().toLocaleTimeString()
        setTerminalLogs(prev => [
          `[${completionTime}] 🏁 [SCAN COMPLETE] ${data.total_probes} probes fired in ${data.total_latency_ms}ms. Found ${data.vulnerabilities_count} actionable findings.`,
          ...prev
        ])
        fetchMetrics()
        fetchHistory()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLiveScanning(false)
    }
  }

  const handleOpenLiveFindingPatch = (vuln) => {
    const findingObj = {
      id: vuln.db_finding_id || 998,
      title: vuln.vector,
      severity: vuln.severity,
      tool: 'SentroniX Live Target Fuzzer',
      location: vuln.endpoint,
      description: `Active endpoint vulnerability detected on ${vuln.endpoint}. Evidence: ${vuln.evidence}. Injected payload: ${vuln.payload}`
    }
    setPatchModalFinding(findingObj)
    setIsPatchModalOpen(true)
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

  const handleCopyPacket = (text) => {
    navigator.clipboard.writeText(text)
    setCopiedPacket(true)
    setTimeout(() => setCopiedPacket(false), 2000)
  }

  return (
    <main className="w-full max-w-full p-3 sm:p-5 md:p-6 lg:p-8 flex-1 overflow-y-auto overflow-x-hidden space-y-6">
      <div className="w-full max-w-[98%] xl:max-w-[95%] 2xl:max-w-[92%] mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-accent-soft text-primary font-bold text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Crosshair size={12} className="text-primary" />
                Atomic Red Team
              </span>
              <span className="bg-accent-soft text-primary font-bold text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Code size={12} className="text-primary" />
                PayloadsAllTheThings
              </span>
              <span className="bg-accent-soft text-primary font-bold text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck size={12} className="text-primary" />
                MITRE Caldera
              </span>
              <span className="bg-accent-soft text-primary font-bold text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Database size={12} className="text-primary" />
                SecLists
              </span>
            </div>

            <h1 className="font-headline-lg text-headline-lg text-on-surface flex items-center gap-2.5">
              <Swords className="text-primary" size={28} />
              Purple Team Arena & Defense Sandbox
            </h1>
            <p className="font-body-md text-body-md text-text-muted mt-1 max-w-4xl">
              Safely launch adversary vectors, inspect raw HTTP packet streams, configure live WAF defense policies, and deploy automated AI remediation diffs.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button 
              onClick={() => { fetchScenarios(); fetchWafRules(); fetchCampaigns(); fetchMetrics(); fetchHistory(); }}
              className="px-3.5 py-2 bg-surface-container hover:bg-surface-container-high text-text-secondary hover:text-on-surface font-label-md text-label-md rounded-lg border border-outline-variant flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <RefreshCw size={14} />
              Refresh Arena
            </button>
          </div>
        </div>

        {/* Purple Team Resilience Scorecard (Fluid Percentage Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
          <div className="bento-card bg-surface-container-low flex flex-col justify-between">
            <span className="font-label-md text-label-md text-text-secondary">Simulated Strikes Executed</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-headline-lg text-headline-lg text-on-surface">{metrics.total_simulated_strikes}</span>
              <span className="font-label-sm text-label-sm text-text-muted">vectors</span>
            </div>
          </div>

          <div className="bento-card bg-surface-container-low flex flex-col justify-between">
            <span className="font-label-md text-label-md text-text-secondary">Interception Rate</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-headline-lg text-headline-lg text-success-defensive font-bold">
                {metrics.total_simulated_strikes > 0 ? `${metrics.interception_success_rate}%` : '—'}
              </span>
              <span className="font-label-sm text-label-sm text-success-defensive">
                {metrics.total_simulated_strikes > 0 ? 'Neutralized' : 'Standby'}
              </span>
            </div>
          </div>

          <div className="bento-card bg-surface-container-low flex flex-col justify-between">
            <span className="font-label-md text-label-md text-text-secondary">Avg Detection Latency</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-headline-lg text-headline-lg text-primary font-bold">
                {metrics.total_simulated_strikes > 0 ? metrics.average_detection_latency_ms : '—'}
              </span>
              <span className="font-label-sm text-label-sm text-text-muted">
                {metrics.total_simulated_strikes > 0 ? 'ms' : 'Standby'}
              </span>
            </div>
          </div>

          <div className="bento-card bg-surface-container-low flex flex-col justify-between">
            <span className="font-label-md text-label-md text-text-secondary">Defensive Resilience</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-headline-lg text-headline-lg text-primary font-bold">
                {metrics.total_simulated_strikes > 0 ? metrics.resilience_grade : '—'}
              </span>
              <span className="font-label-sm text-label-sm text-text-muted">
                {metrics.total_simulated_strikes > 0 ? (metrics.resilience_label || 'Hardened') : 'Unassessed'}
              </span>
            </div>
          </div>
        </div>

        {/* Operation Mode Tabs */}
        <div className="relative w-full">
          {canScrollLeft && (
            <button 
              type="button"
              onClick={() => scrollTabs('left')}
              className="absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-surface border border-border-strong shadow-md text-text-secondary hover:text-primary transition-all hover:scale-110"
              title="Scroll left"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          <div 
            ref={tabsRef}
            className={`flex gap-2 sm:gap-4 md:gap-6 border-b border-border-strong overflow-x-auto scrollbar-none w-full pb-1 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          >
            <button 
              onClick={() => setActiveMode('atomic')}
              className={`pb-2.5 px-1 font-label-md text-label-md transition-all flex items-center gap-2 whitespace-nowrap ${
                activeMode === 'atomic' 
                  ? 'text-primary border-b-2 border-primary font-bold' 
                  : 'text-text-secondary hover:text-on-surface'
              }`}
            >
              <Crosshair size={16} />
              Atomic Strikes & Payloads
            </button>
            
            <button 
              onClick={() => setActiveMode('waf_sandbox')}
              className={`pb-2.5 px-1 font-label-md text-label-md transition-all flex items-center gap-2 whitespace-nowrap ${
                activeMode === 'waf_sandbox' 
                  ? 'text-primary border-b-2 border-primary font-bold' 
                  : 'text-text-secondary hover:text-on-surface'
              }`}
            >
              <Sliders size={16} />
              WAF Defense Policy Switchboard
            </button>

            <button 
              onClick={() => setActiveMode('live_fuzzer')}
              className={`pb-2.5 px-1 font-label-md text-label-md transition-all flex items-center gap-2 whitespace-nowrap ${
                activeMode === 'live_fuzzer' 
                  ? 'text-primary border-b-2 border-primary font-bold' 
                  : 'text-text-secondary hover:text-on-surface'
              }`}
            >
              <Globe size={16} />
              Live Target Fuzzer
            </button>

            <button 
              onClick={() => setActiveMode('caldera')}
              className={`pb-2.5 px-1 font-label-md text-label-md transition-all flex items-center gap-2 whitespace-nowrap ${
                activeMode === 'caldera' 
                  ? 'text-primary border-b-2 border-primary font-bold' 
                  : 'text-text-secondary hover:text-on-surface'
              }`}
            >
              <Swords size={16} />
              Adversary Campaigns (MITRE Caldera)
            </button>

            <button 
              onClick={() => setActiveMode('seclists')}
              className={`pb-2.5 px-1 font-label-md text-label-md transition-all flex items-center gap-2 whitespace-nowrap ${
                activeMode === 'seclists' 
                  ? 'text-primary border-b-2 border-primary font-bold' 
                  : 'text-text-secondary hover:text-on-surface'
              }`}
            >
              <Database size={16} />
              Sensitive Path Fuzzer (SecLists)
            </button>
          </div>

          {canScrollRight && (
            <button 
              type="button"
              onClick={() => scrollTabs('right')}
              className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-surface border border-border-strong shadow-md text-text-secondary hover:text-primary transition-all hover:scale-110"
              title="Scroll right"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        {/* ================= MODE 1: ATOMIC STRIKES ================= */}
        {activeMode === 'atomic' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6 w-full">
            
            {/* 🔴 LEFT PANE: Red Team Adversary Launchpad */}
            <div className="bento-card flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-outline-variant pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-error-container/40 flex items-center justify-center text-danger-offensive">
                      <Crosshair size={18} />
                    </div>
                    <div>
                      <h2 className="font-headline-sm text-headline-sm text-on-surface">Red Team Launchpad</h2>
                      <p className="font-body-sm text-body-sm text-text-muted">Atomic Test & Payload Injector</p>
                    </div>
                  </div>
                  <span className="font-label-sm text-label-sm bg-error-container/30 text-danger-offensive px-2 py-0.5 rounded font-bold">
                    {activeScenario?.source_repo || 'OFFENSIVE OPS'}
                  </span>
                </div>

                {/* Scenario Selector */}
                <div>
                  <label className="block font-label-md text-label-md text-text-secondary mb-1.5">
                    Select Atomic Scenario
                  </label>
                  <select 
                    value={selectedScenarioId}
                    onChange={(e) => handleScenarioChange(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 font-label-md text-label-md text-on-surface focus:outline-none focus:border-primary transition-colors"
                  >
                    {scenarios.map(s => (
                      <option key={s.id} value={s.id}>
                        [{s.severity}] {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* MITRE ATT&CK Metadata Card */}
                {activeScenario && (
                  <div className="p-3 bg-surface-container-low border border-outline-variant rounded-lg space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">MITRE ATT&CK Tactic:</span>
                      <span className="font-semibold text-danger-offensive bg-error-container/30 px-2 py-0.5 rounded">
                        {activeScenario.mitre_tactic}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Technique ID:</span>
                      <span className="font-mono text-on-surface">{activeScenario.mitre_technique}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">WAF Defense Key:</span>
                      <span className="font-mono text-primary font-semibold">{activeScenario.waf_rule_key}</span>
                    </div>
                  </div>
                )}

                {/* PayloadsAllTheThings Presets */}
                {activeScenario?.payload_variants && activeScenario.payload_variants.length > 0 && (
                  <div>
                    <span className="font-label-md text-label-md text-text-secondary block mb-1.5">
                      💡 Preset Payloads (Click to load):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeScenario.payload_variants.map((variant, idx) => (
                        <button 
                          key={idx}
                          onClick={() => setCustomPayload(variant)}
                          className="font-mono text-xs bg-surface-container-low hover:bg-surface-container-high border border-outline-variant text-text-secondary hover:text-primary px-2.5 py-1 rounded transition-colors truncate max-w-xs text-left"
                          title={variant}
                        >
                          {variant}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Target Endpoint */}
                <div>
                  <label className="block font-label-md text-label-md text-text-secondary mb-1.5">
                    Target Endpoint
                  </label>
                  <input 
                    type="text" 
                    value={targetOverride}
                    onChange={(e) => setTargetOverride(e.target.value)}
                    placeholder="/api/v1/auth/login"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 font-mono text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Injected Payload */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-label-md text-label-md text-text-secondary">
                      Injected Adversarial Payload
                    </label>
                    <button 
                      onClick={() => setCustomPayload(activeScenario?.default_payload || '')}
                      className="text-xs text-text-muted hover:text-primary transition-colors"
                    >
                      Reset Default
                    </button>
                  </div>
                  <textarea 
                    rows={3}
                    value={customPayload}
                    onChange={(e) => setCustomPayload(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 font-mono text-xs text-on-surface focus:outline-none focus:border-primary resize-none"
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
                    className="rounded border-outline-variant text-primary focus:ring-primary/20"
                  />
                  <label htmlFor="discordAlert" className="text-xs text-text-secondary cursor-pointer">
                    Broadcast event to SentoBot <code className="text-primary bg-accent-soft px-1 py-0.5 rounded">#mod-security-alerts</code>
                  </label>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-4 border-t border-outline-variant">
                <button 
                  onClick={handleExecuteStrike}
                  disabled={isStriking}
                  className={`w-full py-2.5 px-4 rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 transition-colors ${
                    isStriking 
                      ? 'bg-surface-variant text-text-muted cursor-not-allowed' 
                      : 'bg-primary text-on-primary hover:bg-surface-tint active:scale-[0.99]'
                  }`}
                >
                  {isStriking ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
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

            {/* 🔵 RIGHT PANE: Blue Team Threat Interception Telemetry */}
            <div className="bento-card flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-outline-variant pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-success-defensive/10 flex items-center justify-center text-success-defensive">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <h2 className="font-headline-sm text-headline-sm text-on-surface">Blue Team Interceptor</h2>
                      <p className="font-body-sm text-body-sm text-text-muted">Real-Time Threat Telemetry</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {strikeResult && (
                      <button 
                        onClick={() => setIsPacketModalOpen(true)}
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 bg-accent-soft px-2 py-1 rounded"
                      >
                        <Eye size={12} /> Inspect HTTP Packet
                      </button>
                    )}
                    <span className="font-label-sm text-label-sm bg-success-defensive/10 text-success-defensive px-2 py-0.5 rounded font-bold">
                      ACTIVE DEFENSE
                    </span>
                  </div>
                </div>

                {strikeResult ? (
                  <div className="space-y-3">
                    <div className={`p-3 rounded-lg flex items-center justify-between border ${
                      strikeResult.blue_team.defense_status.includes("INTERCEPTED") 
                        ? 'bg-success-defensive/10 border-success-defensive/20' 
                        : 'bg-error-container/30 border-error-container'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        {strikeResult.blue_team.defense_status.includes("INTERCEPTED") ? (
                          <CheckCircle2 size={20} className="text-success-defensive" />
                        ) : (
                          <AlertTriangle size={20} className="text-danger-offensive" />
                        )}
                        <div>
                          <span className={`font-label-md text-label-md font-bold block ${
                            strikeResult.blue_team.defense_status.includes("INTERCEPTED") ? 'text-success-defensive' : 'text-danger-offensive'
                          }`}>
                            {strikeResult.blue_team.defense_status}
                          </span>
                          <span className="text-xs text-text-muted">
                            HTTP Status: {strikeResult.blue_team.status_code} {strikeResult.blue_team.status_code === 403 ? 'Forbidden' : 'OK (Unfiltered)'}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-primary bg-accent-soft px-2.5 py-1 rounded">
                        ⚡ {strikeResult.blue_team.latency_ms} ms
                      </span>
                    </div>

                    <div className="p-3 bg-surface-container-low border border-outline-variant rounded-lg space-y-1">
                      <span className="text-xs text-text-muted block">Detection & AST Rule Triggered:</span>
                      <span className="font-mono text-xs font-semibold text-primary block">
                        {strikeResult.blue_team.inspection_rule}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 bg-surface-container-low border border-outline-variant rounded-lg">
                        <span className="text-text-muted block">Injected Vector:</span>
                        <code className="text-danger-offensive font-mono block mt-1 truncate">
                          {strikeResult.red_team.injected_payload}
                        </code>
                      </div>
                      <div className="p-2.5 bg-surface-container-low border border-outline-variant rounded-lg">
                        <span className="text-text-muted block">Threat Confidence:</span>
                        <span className="text-success-defensive font-semibold block mt-1">
                          {strikeResult.blue_team.threat_score}% (High Fidelity)
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-accent-soft border border-primary/20 rounded-lg space-y-1">
                      <div className="flex items-center gap-1.5 text-primary font-bold text-xs">
                        <Sparkles size={14} />
                        Purple Team AI Remediation Path
                      </div>
                      <p className="text-xs text-on-surface leading-relaxed">
                        {strikeResult.blue_team.remediation_hint}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-outline-variant rounded-xl text-text-muted">
                    <ShieldAlert size={36} className="text-text-muted mb-2 opacity-50" />
                    <p className="font-headline-sm text-headline-sm text-on-surface">Awaiting Adversary Strike Execution</p>
                    <p className="font-body-sm text-body-sm text-text-muted mt-1 max-w-xs">
                      Select a scenario on the left and click "Execute Atomic Strike" to observe live defensive interception.
                    </p>
                  </div>
                )}
              </div>

              {/* AI Patch Trigger Button */}
              <div className="mt-5 pt-4 border-t border-outline-variant">
                <button 
                  onClick={handleOpenAIPatch}
                  disabled={!strikeResult}
                  className={`w-full py-2.5 px-4 rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 transition-colors ${
                    strikeResult
                      ? 'bg-primary-container text-on-primary hover:bg-surface-tint active:scale-[0.99]'
                      : 'bg-surface-variant text-text-muted cursor-not-allowed'
                  }`}
                >
                  <Sparkles size={18} />
                  Generate AI Patch & Unified Code Diff
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODE 2: WAF DEFENSE POLICY SWITCHBOARD ================= */}
        {activeMode === 'waf_sandbox' && (
          <div className="bento-card space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-4">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                  <Sliders className="text-primary" size={20} />
                  WAF Defensive Inspection Policy Switchboard
                </h2>
                <p className="font-body-sm text-body-sm text-text-muted mt-0.5">
                  Toggle individual defensive filters on/off in real-time to simulate defense bypasses or evaluate strict enforcement.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 w-full">
              {Object.keys(wafRules).map((key) => {
                const rule = wafRules[key]
                return (
                  <div key={key} className="p-4 bg-surface-container-low border border-outline-variant rounded-xl flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-label-md text-label-md text-on-surface font-bold">{rule.name}</span>
                        <code className="text-[10px] font-mono text-primary bg-accent-soft px-1.5 py-0.5 rounded">
                          {key}
                        </code>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">{rule.description}</p>
                    </div>

                    <button 
                      onClick={() => handleToggleWafRule(key, rule.enabled)}
                      className={`p-1.5 rounded-lg border flex items-center gap-1.5 text-xs font-bold transition-all ${
                        rule.enabled 
                          ? 'bg-success-defensive/10 text-success-defensive border-success-defensive/30' 
                          : 'bg-surface-container text-text-muted border-outline-variant'
                      }`}
                    >
                      {rule.enabled ? (
                        <>
                          <Check size={14} /> ACTIVE
                        </>
                      ) : (
                        <>
                          <ShieldX size={14} className="text-danger-offensive" /> DISABLED
                        </>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ================= MODE 3: MITRE CALDERA CAMPAIGNS ================= */}
        {activeMode === 'caldera' && (
          <div className="bento-card space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-4">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                  <Swords className="text-primary" size={20} />
                  MITRE Caldera Autonomous Adversary Campaigns
                </h2>
                <p className="font-body-sm text-body-sm text-text-muted mt-0.5">
                  Simulate multi-stage APT campaigns traversing reconnaissance, public exploitation, and privilege escalation in automated sequence.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select 
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 font-label-md text-label-md text-on-surface focus:outline-none"
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
                  className="px-4 py-2 bg-primary text-on-primary hover:bg-surface-tint rounded-lg font-label-md text-label-md flex items-center gap-2 transition-colors"
                >
                  {isCampaignRunning ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                  Launch Campaign
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {campaigns.find(c => c.id === selectedCampaignId)?.stages.map((stage, idx) => (
                <div key={idx} className="p-4 bg-surface-container-low border border-outline-variant rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center text-primary font-bold text-xs">
                      {stage.phase}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-label-md text-label-md text-on-surface font-bold">{stage.tactic}</span>
                        <span className="text-[11px] font-mono text-danger-offensive bg-error-container/30 px-2 py-0.5 rounded">
                          {stage.technique}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5">{stage.action}</p>
                      <code className="text-[11px] text-text-muted font-mono block mt-1">Payload: {stage.payload}</code>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded bg-success-defensive/10 text-success-defensive border border-success-defensive/20 text-xs font-semibold">
                      🛡️ WAF Interceptor Ready
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= MODE 4: SECLISTS FUZZING ================= */}
        {activeMode === 'seclists' && (
          <div className="bento-card space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-4">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                  <Database className="text-primary" size={20} />
                  SecLists Sensitive Path & Parameter Discovery
                </h2>
                <p className="font-body-sm text-body-sm text-text-muted mt-0.5">
                  Probe common sensitive paths (e.g. `/.env`, `/.git/HEAD`, `/api/swagger.json`) to audit perimeter exposure.
                </p>
              </div>

              <button 
                onClick={handleRunSecListsFuzzing}
                disabled={isFuzzing}
                className="px-4 py-2 bg-primary text-on-primary hover:bg-surface-tint rounded-lg font-label-md text-label-md flex items-center gap-2 transition-colors"
              >
                {isFuzzing ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
                Run SecLists Probe Scan
              </button>
            </div>

            {seclistsResults.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-outline-variant text-text-muted uppercase text-[10px] tracking-wider">
                      <th className="pb-2.5">Probed Path</th>
                      <th className="pb-2.5">Artifact Category</th>
                      <th className="pb-2.5">Risk Rating</th>
                      <th className="pb-2.5">Defense Status</th>
                      <th className="pb-2.5">Inspection Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {seclistsResults.map((p, idx) => (
                      <tr key={idx} className="hover:bg-surface-container-high transition-colors">
                        <td className="py-2.5 font-mono text-primary font-semibold">{p.path}</td>
                        <td className="py-2.5 text-text-secondary">{p.type}</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.risk === 'CRITICAL' ? 'bg-error-container text-danger-offensive' : (p.risk === 'HIGH' ? 'bg-error-container/40 text-danger-offensive' : 'bg-accent-soft text-primary')
                          }`}>
                            {p.risk}
                          </span>
                        </td>
                        <td className="py-2.5 font-mono text-success-defensive">{p.status}</td>
                        <td className="py-2.5 text-text-muted">{p.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-text-muted border border-dashed border-outline-variant rounded-xl">
                <Database size={32} className="mx-auto text-text-muted opacity-40 mb-2" />
                <p className="text-xs">Click "Run SecLists Probe Scan" to evaluate sensitive endpoint exposures.</p>
              </div>
            )}
          </div>
        )}

        {/* Live CLI Strike Terminal */}
        <div className="bento-card bg-surface-container-lowest font-mono text-xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-outline-variant pb-2.5 mb-3 text-text-muted">
            <div className="flex items-center gap-2">
              <Terminal size={15} className="text-primary" />
              <span className="font-semibold text-on-surface">Live Strike & Interception Console</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success-defensive animate-ping"></span>
              <span className="text-[11px] text-text-secondary">Stream Online</span>
            </div>
          </div>

          <div className="h-40 overflow-y-auto space-y-1 pr-2 text-on-surface">
            {terminalLogs.length > 0 ? (
              terminalLogs.map((log, idx) => {
                let colorClass = "text-on-surface"
                if (log.includes("🔴")) colorClass = "text-danger-offensive font-semibold"
                else if (log.includes("🔵")) colorClass = "text-primary font-semibold"
                else if (log.includes("✨")) colorClass = "text-primary font-bold"
                else if (log.includes("⚡")) colorClass = "text-success-defensive"
                else if (log.includes("🔍") || log.includes("⚔️")) colorClass = "text-on-surface font-semibold"
                return (
                  <div key={idx} className={`${colorClass} leading-relaxed font-mono`}>
                    {log}
                  </div>
                )
              })
            ) : (
              <div className="text-text-muted italic py-6 text-center">
                Console initialized. Execute an atomic strike, Caldera campaign, or SecLists probe to monitor real-time packet transmissions.
              </div>
            )}
          </div>
        </div>

        {/* Recent Strike Simulation History Table */}
        {history.length > 0 && (
          <div className="bento-card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                <Layers size={18} className="text-primary" />
                Recent Simulation History
              </h2>
              <span className="text-xs text-text-muted">{history.length} logged runs</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-outline-variant text-text-muted uppercase text-[10px] tracking-wider">
                    <th className="pb-2.5">Strike ID</th>
                    <th className="pb-2.5">Scenario / Technique</th>
                    <th className="pb-2.5">Source Repo</th>
                    <th className="pb-2.5">Target</th>
                    <th className="pb-2.5">Injected Payload</th>
                    <th className="pb-2.5">Latency</th>
                    <th className="pb-2.5">Defense Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {history.slice(0, 5).map((item, idx) => (
                    <tr key={idx} className="hover:bg-surface-container-high transition-colors">
                      <td className="py-2.5 font-mono text-text-secondary">{item.strike_id}</td>
                      <td className="py-2.5 font-medium text-on-surface">{item.title}</td>
                      <td className="py-2.5 font-mono text-primary">{item.source_repo || 'PayloadsAllTheThings'}</td>
                      <td className="py-2.5 font-mono text-text-muted">{item.red_team.target_endpoint}</td>
                      <td className="py-2.5 font-mono text-danger-offensive max-w-xs truncate">{item.red_team.injected_payload}</td>
                      <td className="py-2.5 font-mono text-primary font-bold">{item.blue_team.latency_ms} ms</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded bg-success-defensive/10 text-success-defensive border border-success-defensive/20 font-semibold text-[11px]">
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

        {/* ================= MODE 5: LIVE TARGET ENDPOINT FUZZER ================= */}
        {activeMode === 'live_fuzzer' && (
          <div className="space-y-grid-gap">
            {/* Target Setup Launchpad */}
            <div className="bento-card">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-outline-variant pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Globe size={20} />
                  </div>
                  <div>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface">Live Target URL & Endpoint Fuzzer</h2>
                    <p className="font-body-sm text-body-sm text-text-muted">
                      Dispatch live adversarial payload bursts against internal or external staging targets with real-time WAF analysis.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-accent-soft text-primary font-bold border border-primary/20">
                    Live Socket Fuzzer
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6 w-full">
                {/* Target URL & Method */}
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <label className="block font-label-md text-label-md text-text-secondary mb-1.5">
                      Target URL or API Endpoint
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={liveMethod}
                        onChange={(e) => setLiveMethod(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-surface border border-outline-variant text-on-surface font-mono text-xs font-bold focus:outline-none focus:border-primary"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                      </select>
                      <input
                        type="text"
                        value={liveTargetUrl}
                        onChange={(e) => setLiveTargetUrl(e.target.value)}
                        placeholder={`${defaultOrigin}/api/v1/auth/login`}
                        className="flex-1 px-3 py-2 rounded-lg bg-surface border border-outline-variant text-on-surface font-mono text-xs focus:outline-none focus:border-primary"
                      />
                    </div>

                    {/* Quick Presets */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[11px] text-text-muted">Presets:</span>
                      <button
                        onClick={() => { setLiveTargetUrl(`${defaultOrigin}/api/v1/auth/login`); setLiveMethod('POST'); }}
                        className="text-[11px] px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-primary font-mono transition-colors"
                      >
                        /auth/login (POST)
                      </button>
                      <button
                        onClick={() => { setLiveTargetUrl(`${defaultOrigin}/api/v1/health`); setLiveMethod('GET'); }}
                        className="text-[11px] px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-primary font-mono transition-colors"
                      >
                        /health (GET)
                      </button>
                      <button
                        onClick={() => { setLiveTargetUrl(`${defaultOrigin}/docs`); setLiveMethod('GET'); }}
                        className="text-[11px] px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-primary font-mono transition-colors"
                      >
                        /docs (Swagger)
                      </button>
                      <button
                        onClick={() => { setLiveTargetUrl('https://httpbin.org/get'); setLiveMethod('GET'); }}
                        className="text-[11px] px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-primary font-mono transition-colors"
                      >
                        httpbin.org/get
                      </button>
                    </div>
                  </div>

                  {/* Attack Vector Multi-Select */}
                  <div>
                    <label className="block font-label-md text-label-md text-text-secondary mb-2">
                      Attack Vector Suites to Execute
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { key: 'sqli', label: 'SQL Injection (SQLi)', icon: '💉' },
                        { key: 'xss', label: 'Cross-Site Scripting (XSS)', icon: '⚡' },
                        { key: 'ssrf', label: 'SSRF Cloud Metadata', icon: '☁️' },
                        { key: 'path_traversal', label: 'Path Traversal', icon: '📁' },
                        { key: 'seclists', label: 'SecLists Sensitive Files', icon: '🗃️' }
                      ].map(vec => (
                        <button
                          key={vec.key}
                          type="button"
                          onClick={() => toggleLiveVector(vec.key)}
                          className={`p-2.5 rounded-lg border text-left flex items-center justify-between text-xs transition-all ${
                            liveVectors.includes(vec.key)
                              ? 'bg-primary/10 border-primary text-on-surface font-semibold'
                              : 'bg-surface border-outline-variant text-text-muted hover:border-primary/50'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <span>{vec.icon}</span>
                            <span>{vec.label}</span>
                          </span>
                          {liveVectors.includes(vec.key) && (
                            <Check size={14} className="text-primary flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right side controls: Custom payload & trigger */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div>
                      <label className="block font-label-md text-label-md text-text-secondary mb-1">
                        Custom Payload Override (Optional)
                      </label>
                      <input
                        type="text"
                        value={liveCustomPayload}
                        onChange={(e) => setLiveCustomPayload(e.target.value)}
                        placeholder="Leave blank to use suite defaults"
                        className="w-full px-3 py-2 rounded-lg bg-surface border border-outline-variant text-on-surface font-mono text-xs focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block font-label-md text-label-md text-text-secondary mb-1">
                        Custom Request Headers (JSON)
                      </label>
                      <input
                        type="text"
                        value={liveCustomHeaders}
                        onChange={(e) => setLiveCustomHeaders(e.target.value)}
                        placeholder='{"X-Sentronix-Test": "true"}'
                        className="w-full px-3 py-2 rounded-lg bg-surface border border-outline-variant text-on-surface font-mono text-xs focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleRunLiveScan}
                    disabled={isLiveScanning || !liveTargetUrl.trim() || liveVectors.length === 0}
                    className="w-full py-3 px-4 rounded-xl bg-danger-offensive text-on-primary hover:bg-error font-headline-sm text-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-error/20 transition-all disabled:opacity-50"
                  >
                    {isLiveScanning ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        Firing Live Attack Bursts...
                      </>
                    ) : (
                      <>
                        <Play size={18} />
                        Launch Live Fuzzing Scan ({liveVectors.length} Vectors)
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Live Scan Results Matrix */}
            {liveScanResult && (
              <div className="bento-card space-y-4 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-primary" />
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface">
                        Live Scan Telemetry: {liveScanResult.target_url}
                      </h3>
                      <p className="font-body-sm text-xs text-text-muted">
                        Completed at {liveScanResult.timestamp} • Duration: {liveScanResult.total_latency_ms} ms
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      liveScanResult.risk_score === 'CRITICAL' 
                        ? 'bg-error-container text-danger-offensive border-danger-offensive/30'
                        : liveScanResult.risk_score === 'HIGH'
                        ? 'bg-tertiary-fixed text-warning-mid border-warning-mid/30'
                        : 'bg-success-defensive/10 text-success-defensive border-success-defensive/30'
                    }`}>
                      Risk: {liveScanResult.risk_score}
                    </span>

                    <span className="px-3 py-1 rounded-full bg-surface-container text-xs font-mono text-on-surface border border-outline-variant">
                      {liveScanResult.vulnerabilities_count} Findings / {liveScanResult.total_probes} Probes
                    </span>
                  </div>
                </div>

                {/* Probes Results Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-text-secondary border-b border-outline-variant">
                        <th className="pb-2.5">Attack Vector</th>
                        <th className="pb-2.5">Method</th>
                        <th className="pb-2.5">Injected Payload</th>
                        <th className="pb-2.5">Status Code</th>
                        <th className="pb-2.5">Latency</th>
                        <th className="pb-2.5">WAF / Defense Result</th>
                        <th className="pb-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {liveScanResult.probes.map((probe, idx) => (
                        <tr key={idx} className="hover:bg-surface-container transition-colors">
                          <td className="py-3 font-semibold text-on-surface">
                            {probe.name}
                          </td>
                          <td className="py-3 font-mono font-bold text-text-secondary">
                            {probe.method}
                          </td>
                          <td className="py-3 font-mono text-text-muted max-w-xs truncate" title={probe.payload}>
                            {probe.payload}
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                              probe.status_code === 200 
                                ? 'bg-surface-container-high text-on-surface'
                                : probe.status_code === 403 || probe.status_code === 406
                                ? 'bg-success-defensive/10 text-success-defensive'
                                : probe.status_code === 500
                                ? 'bg-error-container text-danger-offensive'
                                : 'bg-surface text-text-muted'
                            }`}>
                              {probe.status_code ? `HTTP ${probe.status_code}` : 'TIMEOUT'}
                            </span>
                          </td>
                          <td className="py-3 font-mono text-primary font-bold">
                            {probe.latency_ms} ms
                          </td>
                          <td className="py-3">
                            {probe.waf_blocked ? (
                              <span className="px-2 py-0.5 rounded bg-success-defensive/10 text-success-defensive border border-success-defensive/20 font-semibold text-[11px] flex items-center gap-1 w-fit">
                                <ShieldCheck size={12} /> WAF Blocked
                              </span>
                            ) : probe.vulnerable ? (
                              <span className="px-2 py-0.5 rounded bg-error-container text-danger-offensive border border-danger-offensive/20 font-semibold text-[11px] flex items-center gap-1 w-fit animate-pulse">
                                <AlertCircle size={12} /> Vulnerable ({probe.status_label})
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-surface-container text-text-secondary text-[11px]">
                                {probe.status_label}
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleOpenLiveFindingPatch({
                                vector: probe.name,
                                severity: probe.vulnerable ? 'HIGH' : 'MEDIUM',
                                endpoint: probe.url,
                                payload: probe.payload,
                                evidence: probe.status_label
                              })}
                              className="px-2.5 py-1 rounded bg-primary text-on-primary hover:bg-primary-container font-semibold text-[11px] inline-flex items-center gap-1 shadow-sm transition-colors"
                            >
                              <Sparkles size={11} /> AI Patch
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ================= DEEP HTTP PACKET INSPECTOR MODAL ================= */}
      {isPacketModalOpen && strikeResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4">
          <div className="bg-surface border border-outline-variant rounded-2xl shadow-2xl w-[95%] sm:w-[90%] md:w-[85%] lg:w-[75%] max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
            
            {/* Header */}
            <div className="p-4 bg-surface-container-low border-b border-outline-variant flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal size={18} className="text-primary" />
                <h3 className="font-bold text-sm text-on-surface">
                  Deep HTTP Packet Stream Inspector ({strikeResult.strike_id})
                </h3>
              </div>
              <button 
                onClick={() => setIsPacketModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-surface-container text-text-muted hover:text-on-surface transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono">
              
              {/* Raw Request */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-danger-offensive flex items-center gap-1.5">
                    🔴 Raw Injected Request (Client / Adversary)
                  </span>
                  <button 
                    onClick={() => handleCopyPacket(strikeResult.red_team.raw_packet)}
                    className="text-[11px] text-text-muted hover:text-primary flex items-center gap-1"
                  >
                    <Copy size={12} /> Copy
                  </button>
                </div>
                <pre className="p-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface whitespace-pre-wrap leading-relaxed">
                  {strikeResult.red_team.raw_packet}
                </pre>
              </div>

              {/* Raw Response */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-success-defensive flex items-center gap-1.5">
                    🔵 Raw Defensive Response (WAF / Server Interceptor)
                  </span>
                  <button 
                    onClick={() => handleCopyPacket(strikeResult.blue_team.raw_packet)}
                    className="text-[11px] text-text-muted hover:text-primary flex items-center gap-1"
                  >
                    <Copy size={12} /> Copy
                  </button>
                </div>
                <pre className="p-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface whitespace-pre-wrap leading-relaxed">
                  {strikeResult.blue_team.raw_packet}
                </pre>
              </div>

            </div>

            {/* Footer */}
            <div className="p-3.5 bg-surface-container-low border-t border-outline-variant flex items-center justify-between">
              {copiedPacket ? (
                <span className="text-xs text-success-defensive font-semibold">✓ Packet copied to clipboard!</span>
              ) : (
                <span className="text-xs text-text-muted">Inspection Latency: {strikeResult.blue_team.latency_ms} ms</span>
              )}
              <button 
                onClick={() => setIsPacketModalOpen(false)}
                className="px-4 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-bold"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

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
