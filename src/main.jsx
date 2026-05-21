import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createClient } from '@supabase/supabase-js'
import {
  ArrowUpRight,
  Command,
  Search,
  Sparkles,
  ChevronRight,
  Plus,
  X,
  Globe,
  Video,
  Type,
  MoreHorizontal,
  LogOut,
  Zap,
  Image as ImageIcon
} from 'lucide-react'
import './styles.css'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xnilbpzflfsimnkqxmog.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_M7ILY-6b_MRYuu4l3BXLOA_TQEPKTyA'
const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey)
const ADMIN_EMAIL = 'ndarawpro@gmail.com'
const productionUrl = 'https://freeailist-navy.vercel.app'

const supabase = hasSupabaseConfig ? createClient(supabaseUrl, supabaseAnonKey) : null

const fallbackTools = [
  { id: '1', name: 'ChatGPT', tagline: 'Le standard de l\'intelligence artificielle générative pour le texte et le raisonnement.', category: 'Texte', url: 'https://chatgpt.com', pricing_note: 'Gratuit' },
  { id: '2', name: 'Ideogram', tagline: 'Une maîtrise exceptionnelle du design graphique et de la typographie par l\'image.', category: 'Image', url: 'https://ideogram.ai', pricing_note: 'Crédits' },
]

function App() {
  const [tools, setTools] = useState(fallbackTools)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Tous')
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState(null)
  const [adminOpen, setAdminOpen] = useState(false)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    async function loadTools() {
      if (!supabase) return
      setLoading(true)
      const { data, error } = await supabase.from('ai_tools').select('*').order('name', { ascending: true })
      if (!error && data?.length) setTools(data)
      setLoading(false)
    }
    loadTools()
  }, [])

  const filteredTools = useMemo(() => {
    const q = query.toLowerCase()
    return tools.filter((t) => {
      const matches = category === 'Tous' || t.category === category
      return matches && (t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q))
    })
  }, [category, query, tools])

  const isAdmin = session?.user?.email?.toLowerCase() === ADMIN_EMAIL

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <nav className="nexus-nav">
        <div className="flex items-center gap-3 px-4">
          <Command size={20} />
          <span className="font-bold">Free AI Atlas</span>
        </div>
        <div className="flex items-center gap-6 px-4">
          {isAdmin && <button onClick={() => setAdminOpen(!adminOpen)} className="text-sm font-bold text-blue-500">Gestion</button>}
          {session ? (
            <button onClick={() => supabase.auth.signOut()}><LogOut size={18} /></button>
          ) : (
            <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })} className="google-btn">Admin</button>
          )}
        </div>
      </nav>

      <main className="nexus-container pt-32">
        <header className="text-center mb-20">
          <h1 className="nexus-h1 mb-6">Free AI Atlas</h1>
          <p className="text-slate-400 text-lg">Ma sélection d'outils IA gratuits.</p>
        </header>

        {isAdmin && adminOpen && (
          <div className="nexus-dashboard mb-12">
            <h2 className="text-2xl font-bold mb-6">Ajouter un outil</h2>
            <AdminForm onAdd={async (p) => { await supabase.from('ai_tools').insert(p); window.location.reload(); }} />
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6 mb-12">
          <input 
            className="nexus-search" 
            placeholder="Rechercher..." 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
          />
          <div className="flex gap-2">
            {['Tous', 'Texte', 'Image', 'Vidéo'].map(c => (
              <button key={c} onClick={() => setCategory(c)} className={`nexus-pill ${category === c ? 'active' : ''}`}>{c}</button>
            ))}
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map(tool => (
            <div key={tool.id} className="nexus-card">
              <h3 className="text-xl font-bold mb-2">{tool.name}</h3>
              <p className="text-slate-400 mb-6">{tool.tagline}</p>
              <div className="flex justify-between items-center border-t border-white/5 pt-4">
                <span className="text-xs text-slate-500 uppercase">{tool.pricing_note}</span>
                <a href={tool.url} target="_blank" rel="noreferrer" className="text-blue-500"><ArrowUpRight size={20} /></a>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

function AdminForm({ onAdd }) {
  const [form, setForm] = useState({ name: '', tagline: '', category: 'Texte', url: '', pricing_note: 'Gratuit' })
  return (
    <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); onAdd(form); }}>
      <input placeholder="Nom" className="nexus-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
      <input placeholder="Tagline" className="nexus-field" value={form.tagline} onChange={e => setForm({...form, tagline: e.target.value})} />
      <input placeholder="URL" className="nexus-field" value={form.url} onChange={e => setForm({...form, url: e.target.value})} />
      <button type="submit" className="nexus-btn-primary">Enregistrer</button>
    </form>
  )
}

createRoot(document.getElementById('root')).render(<App />)
