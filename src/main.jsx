import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createClient } from '@supabase/supabase-js'
import {
  ArrowUpRight,
  Command,
  Search,
  Sparkles,
  Plus,
  LogOut,
  Image as ImageIcon,
  Type,
  Video,
  Globe
} from 'lucide-react'
import './styles.css'

// Configuration ultra-robuste
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xnilbpzflfsimnkqxmog.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_M7ILY-6b_MRYuu4l3BXLOA_TQEPKTyA'
const ADMIN_EMAIL = 'ndarawpro@gmail.com'

let supabase = null
try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
} catch (e) {
  console.error("Erreur Supabase Init:", e)
}

const fallbackTools = [
  { id: '1', name: 'ChatGPT', tagline: 'Intelligence textuelle et code.', category: 'Texte', url: 'https://chatgpt.com', pricing_note: 'Gratuit' },
  { id: '2', name: 'Ideogram', tagline: 'Design et typographie par l\'image.', category: 'Image', url: 'https://ideogram.ai', pricing_note: 'Crédits' },
]

function App() {
  const [tools, setTools] = useState(fallbackTools)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Tous')
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
      try {
        const { data, error } = await supabase.from('ai_tools').select('*').order('name', { ascending: true })
        if (!error && data?.length) setTools(data)
      } catch (e) {
        console.error("Erreur chargement tools:", e)
      }
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
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -right-[5%] w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-6 h-14 px-6 rounded-full border border-white/[0.08] bg-slate-950/40 backdrop-blur-2xl">
        <div className="flex items-center gap-2 pr-4 border-r border-white/10">
          <Command size={18} />
          <span className="text-sm font-bold tracking-tight hidden sm:inline">Free AI Atlas</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#directory" className="text-[13px] font-semibold text-slate-400 hover:text-white transition-colors">Répertoire</a>
          {isAdmin && (
            <button onClick={() => setAdminOpen(!adminOpen)} className="text-[13px] font-semibold text-blue-400 hover:text-blue-300">
              {adminOpen ? 'Fermer' : 'Ajouter'}
            </button>
          )}
          {session ? (
            <button onClick={() => supabase.auth.signOut()} className="text-slate-400 hover:text-white"><LogOut size={16} /></button>
          ) : (
            <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full text-[11px] font-bold text-black hover:bg-slate-200 transition-all">
              Admin
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-[1200px] px-6 pt-40 pb-20">
        <header className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-bold text-blue-400 uppercase tracking-widest mb-8">
            <Sparkles size={12} /> Curation Sélectionnée
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8">L'Atlas des outils <span className="text-slate-500 italic">IA.</span></h1>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">Les meilleures intelligences artificielles gratuites, classées pour booster votre workflow.</p>
        </header>

        {isAdmin && adminOpen && (
          <div className="mb-20 p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-3xl">
            <h2 className="text-2xl font-bold mb-8 text-center">Indexer un nouvel outil</h2>
            <AdminForm onAdd={async (p) => { await supabase.from('ai_tools').insert(p); window.location.reload(); }} />
          </div>
        )}

        <section id="directory">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16 border-b border-white/5 pb-12">
            <div className="flex flex-wrap gap-2">
              {['Tous', 'Texte', 'Image', 'Vidéo', 'Autre'].map(c => (
                <button key={c} onClick={() => setCategory(c)} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${category === c ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}>{c}</button>
              ))}
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                placeholder="Rechercher..." 
                className="w-full h-10 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-blue-500 transition-all text-sm"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map(tool => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      </main>

      <footer className="text-center py-20 border-t border-white/5 text-slate-600 text-xs font-medium">
        © 2026 Free AI Atlas • Fait avec précision.
      </footer>
    </div>
  )
}

function ToolCard({ tool }) {
  const Icon = { 'Texte': Type, 'Image': ImageIcon, 'Vidéo': Video }[tool.category] || Globe
  return (
    <div className="p-6 rounded-[24px] border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all group">
      <div className="flex items-start justify-between mb-6">
        <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
          <Icon size={20} />
        </div>
        <a href={tool.url} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white transition-colors"><ArrowUpRight size={20} /></a>
      </div>
      <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{tool.name}</h3>
      <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 h-10">{tool.tagline}</p>
    </div>
  )
}

function AdminForm({ onAdd }) {
  const [form, setForm] = useState({ name: '', tagline: '', category: 'Texte', url: '', pricing_note: 'Gratuit' })
  return (
    <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => { e.preventDefault(); onAdd(form); }}>
      <input placeholder="Nom" className="h-12 px-4 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-blue-500" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
      <select className="h-12 px-4 rounded-xl bg-[#020617] border border-white/10 outline-none focus:border-blue-500" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
        <option>Texte</option><option>Image</option><option>Vidéo</option><option>Autre</option>
      </select>
      <input placeholder="Description courte" className="md:col-span-2 h-12 px-4 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-blue-500" value={form.tagline} onChange={e => setForm({...form, tagline: e.target.value})} required />
      <input placeholder="URL" type="url" className="md:col-span-2 h-12 px-4 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-blue-500" value={form.url} onChange={e => setForm({...form, url: e.target.value})} required />
      <button type="submit" className="md:col-span-2 h-12 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition-colors">Enregistrer</button>
    </form>
  )
}

createRoot(document.getElementById('root')).render(<App />)
