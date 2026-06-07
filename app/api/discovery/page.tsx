'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { WINDOWS_AGENT_SCRIPT, LINUX_AGENT_SCRIPT } from '@/lib/discovery'
import { Laptop, Terminal, FileSpreadsheet, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'

export default function DiscoveryPage() {
  const [copied, setCopied]   = useState<string | null>(null)
  const [openTab, setOpenTab] = useState<'windows' | 'linux' | 'csv'>('windows')

  function copy(text: string, key: string) {
    const script = text.replace(/REPLACE_WITH_YOUR_APP_URL/g, window.location.origin)
    navigator.clipboard.writeText(script)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const CopyBtn = ({ text, id }: { text: string; id: string }) => (
    <button
      onClick={() => copy(text, id)}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-brand-600 transition-colors"
    >
      {copied === id ? <><Check size={12} className="text-green-500" /> Copied!</> : <><Copy size={12} /> Copy script</>}
    </button>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3.5">
          <h1 className="text-base font-semibold text-gray-900 dark:text-white">Device discovery</h1>
          <p className="text-xs text-gray-500">Auto-fill asset details from your network devices</p>
        </div>

        <div className="max-w-3xl mx-auto p-6 space-y-4">

          {/* Method tabs */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="flex border-b border-gray-200 dark:border-gray-800">
              {[
                { key: 'windows', label: 'Windows agent',  icon: Laptop },
                { key: 'linux',   label: 'Mac / Linux',    icon: Terminal },
                { key: 'csv',     label: 'CSV import',     icon: FileSpreadsheet },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setOpenTab(t.key as any)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                    openTab === t.key
                      ? 'border-brand-600 text-brand-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <t.icon size={15} /> {t.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {openTab === 'windows' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Windows PowerShell agent</h3>
                    <p className="text-xs text-gray-500 mb-3">Run this script on any Windows device as Administrator. It will automatically register the device in AssetIQ with full specs — IP, hostname, CPU, RAM, storage, serial number and battery health.</p>
                    <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400 mb-4">
                      <p className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600 flex items-center justify-center font-bold text-[10px]">1</span> Copy the script below</p>
                      <p className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600 flex items-center justify-center font-bold text-[10px]">2</span> On the target device: search "PowerShell" → right-click → Run as Administrator</p>
                      <p className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600 flex items-center justify-center font-bold text-[10px]">3</span> Paste and press Enter — device appears in your asset list automatically</p>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500">PowerShell script</span>
                      <CopyBtn text={WINDOWS_AGENT_SCRIPT} id="windows" />
                    </div>
                    <pre className="bg-gray-950 text-green-400 text-xs p-4 rounded-xl overflow-x-auto max-h-64 font-mono leading-relaxed">
                      {WINDOWS_AGENT_SCRIPT.replace(/REPLACE_WITH_YOUR_APP_URL/g, typeof window !== 'undefined' ? window.location.origin : 'https://your-app.vercel.app')}
                    </pre>
                  </div>
                </div>
              )}

              {openTab === 'linux' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Mac / Linux bash agent</h3>
                    <p className="text-xs text-gray-500 mb-3">Run this script in Terminal on any Mac or Linux device. It collects system specs and registers the device automatically.</p>
                    <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400 mb-4">
                      <p className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600 flex items-center justify-center font-bold text-[10px]">1</span> Copy the script below</p>
                      <p className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600 flex items-center justify-center font-bold text-[10px]">2</span> Open Terminal on the target device</p>
                      <p className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600 flex items-center justify-center font-bold text-[10px]">3</span> Paste and press Enter</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500">Bash script</span>
                      <CopyBtn text={LINUX_AGENT_SCRIPT} id="linux" />
                    </div>
                    <pre className="bg-gray-950 text-green-400 text-xs p-4 rounded-xl overflow-x-auto max-h-64 font-mono leading-relaxed">
                      {LINUX_AGENT_SCRIPT.replace(/REPLACE_WITH_YOUR_APP_URL/g, typeof window !== 'undefined' ? window.location.origin : 'https://your-app.vercel.app')}
                    </pre>
                  </div>
                </div>
              )}

              {openTab === 'csv' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">CSV bulk import</h3>
                    <p className="text-xs text-gray-500 mb-4">Upload a spreadsheet with your existing assets. The system will create all assets in one go. Use the template below for best results.</p>
                  </div>
                  <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
                    <FileSpreadsheet size={28} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Drag & drop your CSV here</p>
                    <p className="text-xs text-gray-400 mb-4">or click to browse</p>
                    <p className="text-xs text-gray-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg px-3 py-2 inline-block">
                      CSV import coming in the next update
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Required CSV columns:</p>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 font-mono text-xs text-gray-600 dark:text-gray-400">
                      name, category, brand, model, serial_number, ip_address, os, purchase_date, warranty_expiry, location
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info card */}
          <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-2xl p-4">
            <p className="text-sm font-medium text-brand-800 dark:text-brand-200 mb-1">How auto-fill works</p>
            <p className="text-xs text-brand-700 dark:text-brand-300 leading-relaxed">
              When the agent script runs on a device, it posts the device specs to your AssetIQ API. If the device already exists (matched by IP or MAC address), its details are updated automatically. If it's new, a draft asset is created for you to review and complete. No network scanning required — just run the script once on each device.
            </p>
          </div>

        </div>
      </main>
    </div>
  )
}
