import React, { useState } from 'react'
import { Upload, FileSearch, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react'

export default function ScansPage() {
  // Steganography States
  const [stegFile, setStegFile] = useState(null)
  const [isStegUploading, setIsStegUploading] = useState(false)
  const [stegResult, setStegResult] = useState(null)
  const [stegError, setStegError] = useState(null)

  // Malware Scanner States
  const [threatFile, setThreatFile] = useState(null)
  const [isThreatUploading, setIsThreatUploading] = useState(false)
  const [threatResult, setThreatResult] = useState(null)
  const [threatError, setThreatError] = useState(null)

  // Steganography Handlers
  const handleStegChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setStegFile(e.target.files[0])
      setStegResult(null)
      setStegError(null)
    }
  }

  const handleStegUpload = async () => {
    if (!stegFile) return
    setIsStegUploading(true)
    setStegError(null)

    const formData = new FormData()
    formData.append('file', stegFile)

    try {
      const response = await fetch('https://l9s76d3s-8000.inc1.devtunnels.ms/api/v1/steg/analyze', {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) throw new Error("Upload failed")
      const data = await response.json()
      setStegResult(data)
    } catch (err) {
      setStegError("Failed to connect to steganography analyzer.")
    } finally {
      setIsStegUploading(false)
    }
  }

  // Malware Scanner Handlers
  const handleThreatChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setThreatFile(e.target.files[0])
      setThreatResult(null)
      setThreatError(null)
    }
  }

  const handleThreatUpload = async () => {
    if (!threatFile) return
    setIsThreatUploading(true)
    setThreatError(null)

    const formData = new FormData()
    formData.append('file', threatFile)

    try {
      const response = await fetch('https://l9s76d3s-8000.inc1.devtunnels.ms/api/v1/defense/scan', {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) throw new Error("Upload failed")
      const data = await response.json()
      setThreatResult(data)
    } catch (err) {
      setThreatError("Failed to connect to malware scanner.")
    } finally {
      setIsThreatUploading(false)
    }
  }

  return (
    <main className="p-4 md:p-8 flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-grid-gap">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Scans & Workers</h1>
          <p className="font-body-md text-body-md text-text-muted mt-1">Manual execution of defensive scans.</p>
        </div>

        {/* 1. Steganography Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-grid-gap mb-8">
          {/* Steg Scanner widget */}
          <div className="bento-card flex flex-col justify-between">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2 mb-4">
                <FileSearch className="text-primary" size={24} />
                Steganography Analysis
              </h3>
              <p className="font-body-sm text-body-sm text-text-muted mb-6">
                Upload an image (JPG, PNG, GIF) to extract hidden payloads or appended binary data.
              </p>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border-strong rounded-xl p-8 bg-surface-container-low hover:bg-surface-hover transition-colors">
              <Upload className="text-text-muted mb-4" size={32} />
              <input 
                type="file" 
                id="steg-upload" 
                className="hidden" 
                accept="image/png, image/jpeg, image/gif"
                onChange={handleStegChange}
              />
              <label 
                htmlFor="steg-upload"
                className="cursor-pointer bg-primary-container text-on-primary py-2 px-6 rounded-lg font-label-md text-label-md hover:bg-surface-tint transition-colors"
              >
                Select Image
              </label>
              {stegFile && <p className="mt-4 font-body-sm text-body-sm text-on-surface font-medium">{stegFile.name}</p>}
            </div>

            <button 
              onClick={handleStegUpload}
              disabled={!stegFile || isStegUploading}
              className={`mt-4 w-full py-3 rounded-lg font-label-md text-label-md text-on-primary flex items-center justify-center gap-2 transition-colors ${!stegFile || isStegUploading ? 'bg-surface-variant text-text-muted cursor-not-allowed' : 'bg-success-defensive hover:opacity-90'}`}
            >
              {isStegUploading ? 'Analyzing...' : 'Run Steg Analysis'}
            </button>
          </div>

          {/* Steg Results widget */}
          <div className="bento-card flex flex-col">
            <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2 mb-4">
              {stegResult ? <CheckCircle2 className="text-success-defensive" size={24} /> : <FileSearch className="text-text-muted" size={24} />}
              Steg Results
            </h3>

            <div className="flex-1 bg-surface-container-low rounded-xl border border-border-subtle p-4 overflow-y-auto max-h-[300px]">
              {stegError && <div className="text-danger-offensive font-body-sm text-body-sm">{stegError}</div>}
              {!stegResult && !stegError && (
                <div className="h-full flex items-center justify-center text-text-muted font-body-sm text-body-sm">
                  Waiting for image submission...
                </div>
              )}
              {stegResult && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b-[0.5px] border-border-strong">
                    <span className="font-label-md text-label-md text-text-secondary">File:</span>
                    <span className="font-body-sm text-body-sm text-on-surface font-medium truncate max-w-[200px]">{stegResult.filename}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b-[0.5px] border-border-strong">
                    <span className="font-label-md text-label-md text-text-secondary">Findings:</span>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${stegResult.findings && stegResult.findings.includes("[!] ALERT") ? 'bg-error-container text-danger-offensive' : 'bg-success-defensive/10 text-success-defensive'}`}>
                      {stegResult.findings && stegResult.findings.includes("[!] ALERT") ? 'ALERT TRIGGERED' : 'CLEAN'}
                    </span>
                  </div>
                  <div className="pt-2">
                    <pre className="bg-inverse-surface text-on-secondary p-3 rounded-lg font-mono text-[11px] whitespace-pre-wrap overflow-x-auto">
                      {stegResult.findings}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Malware Scanner Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-grid-gap">
          {/* Malware Scanner Card */}
          <div className="bento-card flex flex-col justify-between">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2 mb-4">
                <ShieldAlert className="text-danger-offensive" size={24} />
                File Malware Scanner
              </h3>
              <p className="font-body-sm text-body-sm text-text-muted mb-6">
                Upload files (scripts, code files, texts) to scan for reverse shells, command injection vectors, and backdoors.
              </p>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border-strong rounded-xl p-8 bg-surface-container-low hover:bg-surface-hover transition-colors">
              <Upload className="text-text-muted mb-4" size={32} />
              <input 
                type="file" 
                id="threat-upload" 
                className="hidden" 
                onChange={handleThreatChange}
              />
              <label 
                htmlFor="threat-upload"
                className="cursor-pointer bg-primary-container text-on-primary py-2 px-6 rounded-lg font-label-md text-label-md hover:bg-surface-tint transition-colors"
              >
                Select Code File
              </label>
              {threatFile && <p className="mt-4 font-body-sm text-body-sm text-on-surface font-medium">{threatFile.name}</p>}
            </div>

            <button 
              onClick={handleThreatUpload}
              disabled={!threatFile || isThreatUploading}
              className={`mt-4 w-full py-3 rounded-lg font-label-md text-label-md text-on-primary flex items-center justify-center gap-2 transition-colors ${!threatFile || isThreatUploading ? 'bg-surface-variant text-text-muted cursor-not-allowed' : 'bg-danger-offensive hover:opacity-90'}`}
            >
              {isThreatUploading ? 'Scanning...' : 'Run Malware Scan'}
            </button>
          </div>

          {/* Malware Scan Results */}
          <div className="bento-card flex flex-col">
            <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2 mb-4">
              {threatResult ? <CheckCircle2 className="text-success-defensive" size={24} /> : <ShieldAlert className="text-text-muted" size={24} />}
              Malware Scan Results
            </h3>

            <div className="flex-1 bg-surface-container-low rounded-xl border border-border-subtle p-4 overflow-y-auto max-h-[300px]">
              {threatError && <div className="text-danger-offensive font-body-sm text-body-sm">{threatError}</div>}
              {!threatResult && !threatError && (
                <div className="h-full flex items-center justify-center text-text-muted font-body-sm text-body-sm">
                  Waiting for threat scan submission...
                </div>
              )}
              {threatResult && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b-[0.5px] border-border-strong">
                    <span className="font-label-md text-label-md text-text-secondary">File Name:</span>
                    <span className="font-body-sm text-body-sm text-on-surface font-medium truncate max-w-[200px]">{threatResult.filename}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b-[0.5px] border-border-strong">
                    <span className="font-label-md text-label-md text-text-secondary">Scan Status:</span>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${threatResult.status === 'malicious' ? 'bg-error-container text-danger-offensive' : 'bg-success-defensive/10 text-success-defensive'}`}>
                      {threatResult.status === 'malicious' ? 'SUSPICIOUS' : 'CLEAN'}
                    </span>
                  </div>

                  {threatResult.status === 'clean' ? (
                    <div className="flex items-center gap-2 p-3 bg-success-defensive/10 text-success-defensive rounded-lg font-body-sm text-body-sm">
                      <CheckCircle2 size={18} /> No malicious signatures or reverse shell hooks found.
                    </div>
                  ) : (
                    <div className="space-y-3 pt-2">
                      <span className="font-label-md text-label-md text-text-secondary block">Detections ({threatResult.findings_count}):</span>
                      {threatResult.findings.map((f, i) => (
                        <div key={i} className="p-3 bg-error-container/20 border border-error-container rounded-lg space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-label-md text-label-md text-danger-offensive font-semibold flex items-center gap-1">
                              <AlertTriangle size={14} /> {f.title}
                            </span>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-error-container text-danger-offensive uppercase">{f.severity}</span>
                          </div>
                          <p className="font-body-sm text-body-sm text-on-surface text-[12px]">{f.description}</p>
                          <span className="text-[10px] text-text-secondary bg-surface-container-high px-1 rounded">{f.cwe}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}
