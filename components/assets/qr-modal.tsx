'use client'

import { useState } from 'react'
import { QrCode, X, Download, Printer } from 'lucide-react'

export function QRModal({ assetId, assetTag, assetName }: {
  assetId: string
  assetTag: string
  assetName: string
}) {
  const [open,    setOpen]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [qr,      setQr]      = useState<string | null>(null)

  async function loadQR() {
    setOpen(true)
    if (qr) return
    setLoading(true)
    const res  = await fetch(`/api/assets/${assetId}/qr`)
    const data = await res.json()
    setQr(data.qr)
    setLoading(false)
  }

  function download() {
    if (!qr) return
    const a = document.createElement('a')
    a.href     = qr
    a.download = `${assetTag}-qr.png`
    a.click()
  }

  function print() {
    if (!qr) return
    const w = window.open('', '_blank')!
    w.document.write(`
      <html><head><title>QR – ${assetTag}</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
        img  { width: 200px; height: 200px; }
        h2   { font-size: 16px; margin: 12px 0 4px; }
        p    { font-size: 12px; color: #888; margin: 0; }
        .box { display: inline-block; border: 1px solid #ddd; padding: 20px; border-radius: 12px; }
      </style></head>
      <body onload="window.print()">
        <div class="box">
          <img src="${qr}" />
          <h2>${assetName}</h2>
          <p>${assetTag}</p>
        </div>
      </body></html>
    `)
    w.document.close()
  }

  return (
    <>
      <button onClick={loadQR}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <QrCode size={14} /> QR Code
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 w-80 shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">QR Code</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 flex flex-col items-center gap-3">
              {loading ? (
                <div className="w-48 h-48 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
              ) : qr ? (
                <img src={qr} alt={`QR code for ${assetTag}`} className="w-48 h-48 rounded-xl border border-gray-200 dark:border-gray-700" />
              ) : null}
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{assetName}</p>
              <p className="text-xs text-gray-400 font-mono">{assetTag}</p>
              <p className="text-xs text-gray-400 text-center">Scan to open this asset in AssetIQ</p>
              <div className="flex gap-2 w-full">
                <button onClick={download}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <Download size={13} /> Download
                </button>
                <button onClick={print}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-brand-600 hover:bg-brand-800 text-white text-sm font-medium transition-colors">
                  <Printer size={13} /> Print label
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
