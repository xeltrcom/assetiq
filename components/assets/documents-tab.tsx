'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, Image, FileCheck, Trash2, Download, Loader2, Plus, File } from 'lucide-react'

const DOC_TYPES = [
  { value: 'INVOICE',           label: 'Invoice' },
  { value: 'WARRANTY',          label: 'Warranty certificate' },
  { value: 'MANUAL',            label: 'User manual' },
  { value: 'IMAGE',             label: 'Photo / Image' },
  { value: 'CONTRACT',          label: 'Contract' },
  { value: 'MAINTENANCE_REPORT',label: 'Maintenance report' },
  { value: 'OTHER',             label: 'Other' },
]

const TYPE_ICONS: Record<string, any> = {
  INVOICE: FileCheck, WARRANTY: FileCheck, MANUAL: FileText,
  IMAGE: Image, CONTRACT: FileText, MAINTENANCE_REPORT: FileText, OTHER: File,
}

const TYPE_COLORS: Record<string, string> = {
  INVOICE:            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  WARRANTY:           'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  MANUAL:             'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  IMAGE:              'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  CONTRACT:           'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  MAINTENANCE_REPORT: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  OTHER:              'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

function formatSize(bytes: number) {
  if (bytes < 1024)       return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function DocumentsTab({ assetId }: { assetId: string }) {
  const [docs,      setDocs]      = useState<any[]>([])
  const [loaded,    setLoaded]    = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleting,  setDeleting]  = useState<string | null>(null)
  const [dragOver,  setDragOver]  = useState(false)
  const [docType,   setDocType]   = useState('OTHER')
  const [error,     setError]     = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function loadDocs() {
    if (loaded) return
    const res  = await fetch(`/api/assets/${assetId}/documents`)
    const data = await res.json()
    setDocs(data)
    setLoaded(true)
  }

  // Load on first render
  if (!loaded) loadDocs()

  async function uploadFile(file: File) {
    setUploading(true); setError('')
    const form = new FormData()
    form.append('file', file)
    form.append('type', docType)
    form.append('name', file.name)

    const res  = await fetch(`/api/assets/${assetId}/documents`, { method: 'POST', body: form })
    const data = await res.json()

    if (!res.ok) { setError(data.error ?? 'Upload failed'); setUploading(false); return }
    setDocs(d => [data, ...d])
    setUploading(false)
  }

  async function deleteDoc(id: string) {
    if (!confirm('Delete this document?')) return
    setDeleting(id)
    await fetch(`/api/assets/${assetId}/documents/${id}`, { method: 'DELETE' })
    setDocs(d => d.filter(x => x.id !== id))
    setDeleting(null)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-4">

      {/* Upload area */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Documents & attachments</h3>
          <select value={docType} onChange={e => setDocType(e.target.value)}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-brand-600">
            {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {error && <div className="bg-red-50 text-red-700 text-xs rounded-xl px-3 py-2 mb-3 border border-red-200">{error}</div>}

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-brand-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={24} className="animate-spin text-brand-600" />
              <p className="text-sm text-gray-500">Uploading…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload size={24} className="text-gray-400" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Drop file here or click to browse</p>
              <p className="text-xs text-gray-400">PDF, Word, Excel, Images — up to 10MB</p>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp" />
      </div>

      {/* Documents list */}
      {docs.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {docs.map(doc => {
              const Icon  = TYPE_ICONS[doc.type] ?? File
              const color = TYPE_COLORS[doc.type] ?? TYPE_COLORS.OTHER
              const isImg = doc.type === 'IMAGE' || doc.url?.match(/\.(jpg|jpeg|png|gif|webp)/i)
              return (
                <div key={doc.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  {isImg ? (
                    <img src={doc.url} alt={doc.name}
                      className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0" />
                  ) : (
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                      <Icon size={18} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${color}`}>
                        {DOC_TYPES.find(t => t.value === doc.type)?.label ?? doc.type}
                      </span>
                      {doc.size && <span className="text-[10px] text-gray-400">{formatSize(doc.size)}</span>}
                      <span className="text-[10px] text-gray-400">{new Date(doc.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <a href={doc.url} target="_blank" rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
                      <Download size={14} />
                    </a>
                    <button onClick={() => deleteDoc(doc.id)} disabled={deleting === doc.id}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
                      {deleting === doc.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {loaded && docs.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <File size={24} className="mx-auto mb-2" />
          <p className="text-sm">No documents attached yet</p>
          <p className="text-xs mt-1">Upload invoices, warranties, manuals and more</p>
        </div>
      )}
    </div>
  )
}
