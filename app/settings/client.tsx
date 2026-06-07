'use client'

import { useState } from 'react'
import { User, Bell, Link2, Shield, Building2, Palette, Save, Loader2, ExternalLink, Check } from 'lucide-react'

const TABS = [
  { key: 'profile',       label: 'Profile',         icon: User },
  { key: 'notifications', label: 'Notifications',   icon: Bell },
  { key: 'integrations',  label: 'Integrations',    icon: Link2 },
  { key: 'roles',         label: 'Roles & Access',  icon: Shield },
  { key: 'company',       label: 'Company',         icon: Building2 },
  { key: 'appearance',    label: 'Appearance',       icon: Palette },
]

const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <button type="button" onClick={() => onChange(!value)}
    className={`w-10 h-6 rounded-full relative transition-colors flex-shrink-0 ${value ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? 'left-5' : 'left-1'}`} />
  </button>
)

const Row = ({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
    <div>
      <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
    {children}
  </div>
)

export function SettingsClient({ user }: any) {
  const [tab,     setTab]     = useState('profile')
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [profile, setProfile] = useState({
    name:  user?.name  ?? '',
    email: user?.email ?? '',
    phone: '',
    department: '',
    designation: '',
  })
  const [notifs, setNotifs] = useState({
    warrantyEmail:     true,
    licenseEmail:      true,
    maintenanceEmail:  true,
    assignmentEmail:   true,
    dailyDigest:       false,
    inAppAlerts:       true,
  })

  async function saveProfile() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const inp = (label: string, key: string, type = 'text') => (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      <input type={type} value={profile[key as keyof typeof profile]}
        onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600" />
    </div>
  )

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3.5">
        <h1 className="text-base font-semibold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-xs text-gray-500">Manage your account and system preferences</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar tabs */}
        <div className="w-48 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-3 space-y-0.5 flex-shrink-0">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                tab === t.key
                  ? 'bg-brand-50 text-brand-800 dark:bg-brand-900/30 dark:text-brand-200 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}>
              <t.icon size={15} />{t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl space-y-4">

            {/* PROFILE */}
            {tab === 'profile' && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Profile information</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {inp('Full name',   'name')}
                  {inp('Email',       'email', 'email')}
                  {inp('Phone',       'phone', 'tel')}
                  {inp('Department',  'department')}
                  {inp('Designation', 'designation')}
                </div>
                <button onClick={saveProfile} disabled={saving}
                  className="flex items-center gap-2 bg-brand-600 hover:bg-brand-800 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-60">
                  {saving ? <><Loader2 size={14} className="animate-spin" />Saving…</>
                          : saved  ? <><Check size={14} />Saved!</>
                          : <><Save size={14} />Save changes</>}
                </button>
              </div>
            )}

            {/* NOTIFICATIONS */}
            {tab === 'notifications' && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Email notifications</h2>
                <p className="text-xs text-gray-400 mb-4">Choose which alerts get sent to your email</p>
                <Row label="Warranty expiry alerts"    sub="Get warned 30, 14, 5 days before expiry"><Toggle value={notifs.warrantyEmail}    onChange={v => setNotifs(n => ({...n, warrantyEmail: v}))} /></Row>
                <Row label="License expiry alerts"     sub="Software license renewal reminders">     <Toggle value={notifs.licenseEmail}     onChange={v => setNotifs(n => ({...n, licenseEmail: v}))} /></Row>
                <Row label="Maintenance due alerts"    sub="Upcoming scheduled maintenance">         <Toggle value={notifs.maintenanceEmail} onChange={v => setNotifs(n => ({...n, maintenanceEmail: v}))} /></Row>
                <Row label="Asset assignment emails"   sub="When an asset is assigned to you">       <Toggle value={notifs.assignmentEmail}  onChange={v => setNotifs(n => ({...n, assignmentEmail: v}))} /></Row>
                <Row label="Daily digest"              sub="Summary email every morning at 8am">     <Toggle value={notifs.dailyDigest}      onChange={v => setNotifs(n => ({...n, dailyDigest: v}))} /></Row>
                <Row label="In-app notifications"      sub="Show alerts inside the dashboard">       <Toggle value={notifs.inAppAlerts}      onChange={v => setNotifs(n => ({...n, inAppAlerts: v}))} /></Row>
              </div>
            )}

            {/* INTEGRATIONS */}
            {tab === 'integrations' && (
              <div className="space-y-3">
                {/* Xeltr Helpdesk integration */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-brand-200 dark:border-brand-800 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Xeltr Helpdesk</span>
                        <span className="text-[10px] bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full font-medium">Xeltr Product</span>
                      </div>
                      <p className="text-xs text-gray-500">Connect AssetIQ with your existing Xeltr ticketing system. Create support tickets directly from assets, link repair history, and track asset-related issues.</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2 mb-4">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">When connected you can:</p>
                    {['Create a ticket from any asset page','View all tickets linked to an asset','See repair history inside asset detail','Auto-update asset status when ticket resolves'].map(f => (
                      <div key={f} className="flex items-center gap-2 text-xs text-gray-500">
                        <Check size={12} className="text-brand-600 flex-shrink-0" />{f}
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Xeltr Helpdesk URL</label>
                    <div className="flex gap-2">
                      <input placeholder="https://your-helpdesk.xeltr.com"
                        className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600" />
                      <button className="bg-brand-600 hover:bg-brand-800 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">Connect</button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">Enter the URL of your Xeltr helpdesk instance to enable integration</p>
                  </div>
                </div>

                {/* Microsoft SSO */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Microsoft Entra ID (SSO)</p>
                      <p className="text-xs text-gray-400">Allow users to sign in with their Microsoft work account</p>
                    </div>
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Not configured</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {['Azure AD Client ID', 'Client Secret', 'Tenant ID'].map(f => (
                      <div key={f}>
                        <label className="block text-xs font-medium text-gray-500 mb-1">{f}</label>
                        <input placeholder="Enter value" className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600" />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    Get these values from{' '}
                    <a href="https://portal.azure.com" target="_blank" className="text-brand-600 hover:underline inline-flex items-center gap-0.5">
                      portal.azure.com <ExternalLink size={10} />
                    </a>
                  </p>
                </div>

                {/* OpenAI */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">OpenAI</p>
                      <p className="text-xs text-gray-400">Powers the AI assistant, auto-tagging and predictive maintenance</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Connected</span>
                  </div>
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-500 mb-1">API Key</label>
                    <input type="password" placeholder="sk-••••••••••••••••" className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600" />
                  </div>
                </div>
              </div>
            )}

            {/* ROLES */}
            {tab === 'roles' && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Roles & permissions</h2>
                <p className="text-xs text-gray-400 mb-4">Role-based access control for your organisation</p>
                <div className="space-y-3">
                  {[
                    { role: 'Super Admin', desc: 'Full platform control, manage companies, users, roles, system config', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
                    { role: 'Admin',       desc: 'Manage assets, users, approve requests, access all reports', color: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' },
                    { role: 'Asset Manager', desc: 'Asset registration, assignment, maintenance, audits', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
                    { role: 'Dept. Manager', desc: 'View department assets, approve department requests', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
                    { role: 'Employee',    desc: 'View assigned assets, submit requests, report issues', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
                  ].map(r => (
                    <div key={r.role} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${r.color}`}>{r.role}</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex-1">{r.desc}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-4 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  Custom role configuration coming in a future update. Currently assign roles when inviting users.
                </p>
              </div>
            )}

            {/* COMPANY */}
            {tab === 'company' && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Company settings</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ['Company name',    'Xeltr'],
                    ['Industry',        'Technology'],
                    ['Country',         'India'],
                    ['Timezone',        'Asia/Kolkata (IST)'],
                    ['Currency',        'INR (₹)'],
                    ['Financial year',  'April – March'],
                  ].map(([label, placeholder]) => (
                    <div key={label}>
                      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                      <input defaultValue={placeholder}
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600" />
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <label className="block text-xs font-medium text-gray-500 mb-2">Depreciation method</label>
                  <div className="flex gap-3">
                    {['Straight Line', 'Declining Balance', 'Custom Formula'].map(m => (
                      <label key={m} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                        <input type="radio" name="depreciation" defaultChecked={m === 'Straight Line'} className="accent-brand-600" /> {m}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* APPEARANCE */}
            {tab === 'appearance' && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Appearance</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">Theme</p>
                    <div className="flex gap-3">
                      {[
                        { label: 'Light',  bg: 'bg-white border-2 border-brand-600' },
                        { label: 'Dark',   bg: 'bg-gray-900 border-2 border-gray-700' },
                        { label: 'System', bg: 'bg-gradient-to-r from-white to-gray-900 border-2 border-gray-300' },
                      ].map(t => (
                        <button key={t.label} className={`w-24 h-16 rounded-xl ${t.bg} flex items-end p-2`}>
                          <span className={`text-xs font-medium ${t.label === 'Dark' ? 'text-white' : 'text-gray-700'}`}>{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <Row label="Compact sidebar" sub="Show smaller sidebar navigation">
                    <Toggle value={false} onChange={() => {}} />
                  </Row>
                  <Row label="Show asset tags" sub="Display auto-generated tags on asset cards">
                    <Toggle value={true} onChange={() => {}} />
                  </Row>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  )
}
