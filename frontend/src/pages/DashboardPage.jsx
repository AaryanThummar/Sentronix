import React, { useState, useEffect } from 'react'
import { 
  PieChart, Swords, Bug, Zap, Shield, ShieldCheck, FolderOpen, 
  Wand2, Eye, Code, Scan, Radar
} from 'lucide-react'
import AppDefenseTab from '../components/Dashboard/AppDefenseTab'
import AIPatchModal from '../components/AIPatchModal'

export default function DashboardPage() {
  const [findings, setFindings] = useState([]);
  const [stats, setStats] = useState({
    risk_grade: 'A',
    risk_label: 'Low Risk',
    critical_findings: 0,
    blocked_threats: 0,
    files_analyzed: 0,
    severity_stats: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 }
  });
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  const [activeTab, setActiveTab] = useState('overview');

  // AI Patch Modal State
  const [selectedPatchFinding, setSelectedPatchFinding] = useState(null);
  const [isPatchModalOpen, setIsPatchModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await fetch('http://localhost:8000/api/v1/dashboard/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      
      const findingsRes = await fetch('http://localhost:8000/api/v1/dashboard/findings');
      if (findingsRes.ok) {
        const findingsData = await findingsRes.json();
        setFindings(findingsData);
      }
    } catch (err) {
      console.error("Error fetching dashboard telemetry:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchDashboardData();
      setLastUpdated(new Date().toLocaleTimeString());
    }, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const handleOpenPatch = (finding) => {
    setSelectedPatchFinding(finding);
    setIsPatchModalOpen(true);
  };

  return (
    <main className="p-4 md:p-8 flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-grid-gap">
        {/* Page Header */}
        <div className="flex justify-between items-end mb-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Overview</h1>
            <p className="font-body-md text-body-md text-text-muted mt-1">System status and recent telemetry.</p>
          </div>
          <div className="text-right">
            <span className="font-label-md text-label-md text-text-secondary bg-surface-container-high px-2 py-1 rounded">
              Last updated: {lastUpdated}
            </span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-6 border-b border-border-strong mb-6">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`pb-2 px-1 font-label-md text-label-md transition-all ${activeTab === 'overview' ? 'text-primary border-b-2 border-primary font-bold' : 'text-text-secondary hover:text-on-surface'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('app_defense')}
            className={`pb-2 px-1 font-label-md text-label-md transition-all ${activeTab === 'app_defense' ? 'text-primary border-b-2 border-primary font-bold' : 'text-text-secondary hover:text-on-surface'}`}
          >
            App & Code Defense
          </button>
        </div>

        {activeTab === 'overview' ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-grid-gap auto-rows-min">
          
          {/* 1. Security Posture */}
          <div className="bento-card col-span-1 md:col-span-4 flex flex-col justify-between">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2 mb-4">
                <PieChart className="text-primary" size={24} />
                Security Posture
              </h3>
              <p className="font-body-sm text-body-sm text-text-muted mb-4">Overall organizational risk score based on active findings and configuration.</p>
            </div>
            <div className="flex items-center justify-center py-4">
              <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-surface-container">
                <div className="absolute inset-0 rounded-full border-8 border-primary border-t-transparent border-r-transparent transform -rotate-45"></div>
                <div className="text-center">
                  <span className="font-headline-lg text-headline-lg text-primary block leading-none">{stats.risk_grade}</span>
                  <span className="font-label-sm text-label-sm text-text-secondary">{stats.risk_label}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Offensive Operations */}
          <div className="bento-card col-span-1 md:col-span-4 flex flex-col">
            <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2 mb-4">
              <Swords className="text-danger-offensive" size={24} />
              Offensive Ops
            </h3>
            <div className="flex-1 flex flex-col justify-center space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-error-container/20 border border-error-container">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-error-container rounded text-danger-offensive">
                    <Bug size={20} />
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">Critical Findings</p>
                    <p className="font-body-sm text-body-sm text-text-muted">Awaiting triage</p>
                  </div>
                </div>
                <span className="font-headline-md text-headline-md text-danger-offensive">{stats.critical_findings}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-border-subtle">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-surface-variant rounded text-text-secondary">
                    <Zap size={20} />
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">Active Exploits</p>
                    <p className="font-body-sm text-body-sm text-text-muted">Currently running</p>
                  </div>
                </div>
                <span className="font-headline-md text-headline-md text-on-surface">12</span>
              </div>
            </div>
          </div>

          {/* 3. Defensive Operations */}
          <div className="bento-card col-span-1 md:col-span-4 flex flex-col">
            <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2 mb-4">
              <Shield className="text-success-defensive" size={24} />
              Defensive Ops
            </h3>
            <div className="flex-1 flex flex-col justify-center space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-success-defensive/10 border border-success-defensive/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success-defensive/20 rounded text-success-defensive">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">Blocked Threats</p>
                    <p className="font-body-sm text-body-sm text-text-muted">Past 24 hours</p>
                  </div>
                </div>
                <span className="font-headline-md text-headline-md text-success-defensive">{stats.blocked_threats}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-border-subtle">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-surface-variant rounded text-text-secondary">
                    <FolderOpen size={20} />
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">Files Analyzed</p>
                    <p className="font-body-sm text-body-sm text-text-muted">Automated triage</p>
                  </div>
                </div>
                <span className="font-headline-md text-headline-md text-on-surface">{stats.files_analyzed}</span>
              </div>
            </div>
          </div>

          {/* 4. Recent Findings Table */}
          <div className="bento-card col-span-1 md:col-span-8 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Recent AI-Correlated Findings</h3>
              <button className="font-label-sm text-label-sm text-primary hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-[0.5px] border-border-strong">
                    <th className="pb-2 font-label-sm text-label-sm text-text-muted font-medium w-24">Severity</th>
                    <th className="pb-2 font-label-sm text-label-sm text-text-muted font-medium">Title</th>
                    <th className="pb-2 font-label-sm text-label-sm text-text-muted font-medium">Tool</th>
                    <th className="pb-2 font-label-sm text-label-sm text-text-muted font-medium">Location</th>
                    <th className="pb-2 font-label-sm text-label-sm text-text-muted font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md text-on-surface divide-y-[0.5px] divide-border-subtle">
                  {findings.map((f) => (
                    <tr key={f.id} className="hover:bg-surface-hover transition-colors">
                      <td className="py-3">
                        {f.severity === 'CRITICAL' && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-error-container text-danger-offensive">CRITICAL</span>}
                        {f.severity === 'HIGH' && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-tertiary-fixed text-warning-mid">HIGH</span>}
                        {f.severity === 'INFO' && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-surface-variant text-text-secondary">INFO</span>}
                      </td>
                      <td className="py-3 pr-4 truncate max-w-[200px]">{f.title}</td>
                      <td className="py-3 font-label-md text-label-md text-text-secondary">{f.tool}</td>
                      <td className="py-3 font-label-md text-label-md text-text-secondary truncate max-w-[150px]">{f.location}</td>
                      <td className="py-3 text-right">
                        {f.action === 'patch' ? (
                          <button 
                            onClick={() => handleOpenPatch(f)}
                            className="font-label-md text-label-md text-primary hover:text-primary-container flex items-center justify-end gap-1 w-full"
                          >
                            <Wand2 size={16} />
                            AI Patch
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleOpenPatch(f)}
                            className="font-label-md text-label-md text-text-muted hover:text-on-surface flex items-center justify-end gap-1 w-full"
                          >
                            <Eye size={16} />
                            Review
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. Active Scanners */}
          <div className="bento-card col-span-1 md:col-span-4">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Active Scanners</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded hover:bg-surface-hover transition-colors">
                <div className="flex items-center gap-3">
                  <Code className="text-text-secondary" size={20} />
                  <span className="font-label-md text-label-md text-on-surface">Semgrep</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-success-defensive/10 border border-success-defensive/20 font-label-sm text-label-sm text-success-defensive">
                  <span className="w-1.5 h-1.5 rounded-full bg-success-defensive"></span>
                  Running
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded hover:bg-surface-hover transition-colors">
                <div className="flex items-center gap-3">
                  <Scan className="text-text-secondary" size={20} />
                  <span className="font-label-md text-label-md text-on-surface">YARA Rules</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-success-defensive/10 border border-success-defensive/20 font-label-sm text-label-sm text-success-defensive">
                  <span className="w-1.5 h-1.5 rounded-full bg-success-defensive"></span>
                  Running
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded hover:bg-surface-hover transition-colors">
                <div className="flex items-center gap-3">
                  <Radar className="text-text-secondary" size={20} />
                  <span className="font-label-md text-label-md text-on-surface">ZAP DAST</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface-variant border border-border-subtle font-label-sm text-label-sm text-text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-text-muted"></span>
                  Idle
                </span>
              </div>
            </div>
          </div>
        </div>
        ) : (
          <AppDefenseTab onOpenPatch={(finding) => handleOpenPatch(finding)} />
        )}
      </div>

      {/* AI Patch Modal */}
      {isPatchModalOpen && selectedPatchFinding && (
        <AIPatchModal 
          finding={selectedPatchFinding}
          onClose={() => setIsPatchModalOpen(false)}
          onRemediated={() => {
            fetchDashboardData();
          }}
        />
      )}
    </main>
  )
}
