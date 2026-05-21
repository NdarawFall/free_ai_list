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
  Globe,
  Home,
  Zap,
  Terminal,
  ChevronRight
} from 'lucide-react'
import './styles.css'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xnilbpzflfsimnkqxmog.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_M7ILY-6b_MRYuu4l3BXLOA_TQEPKTyA'
const ADMIN_EMAIL = 'ndarawpro@gmail.com'
const productionUrl = 'https://freeailist-navy.vercel.app'

const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null

const fallbackTools = [
  { id: '1', name: 'ChatGPT', tagline: 'Assistant polyvalent pour le texte et le raisonnement.', category: 'Texte', url: 'https://chatgpt.com', pricing_note: 'Gratuit' },
  { id: '2', name: 'Ideogram', tagline: 'Génération d\'images avec typographie parfaite.', category: 'Image', url: 'https://ideogram.ai', pricing_note: 'Crédits' },
  { id: '3', name: 'Luma Dream Machine', tagline: 'Vidéo réaliste à partir de texte.', category: 'Vidéo', url: 'https://lumalabs.ai', pricing_note: 'Essai' },
]

function App() {
  const [page, setPage] = useState('accueil')
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
      const { data, error } = await supabase.from('ai_tools').select('*').order('name', { ascending: true })
      if (!error && data?.length) setTools(data)
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
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 overflow-y-auto">
      {/* Neon Background Moving */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="glow-nexus absolute -top-[10%] -left-[10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="glow-nexus absolute top-[40%] -right-[5%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px]" style={{ animationDelay: '-5s' }} />
        <div className="glow-nexus absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px]" style={{ animationDelay: '-10s' }} />
      </div>

      {/* Navigation Flottante */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 h-14 px-4 rounded-full border border-white/[0.08] bg-slate-950/40 backdrop-blur-2xl shadow-2xl">
        <button onClick={() => setPage('accueil')} className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${page === 'accueil' ? 'bg-white text-black' : 'text-slate-400 hover:text-white'}`}>
          <Home size={14} /> <span className="hidden sm:inline">Accueil</span>
        </button>
        <button onClick={() => setPage('tools')} className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${page === 'tools' ? 'bg-white text-black' : 'text-slate-400 hover:text-white'}`}>
          <Zap size={14} /> <span className="hidden sm:inline">AI Tools</span>
        </button>
        <button onClick={() => setPage('prompts')} className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${page === 'prompts' ? 'bg-white text-black' : 'text-slate-400 hover:text-white'}`}>
          <Terminal size={14} /> <span className="hidden sm:inline">Prompts</span>
        </button>
        
        <div className="w-px h-6 bg-white/10 mx-2" />

        {isAdmin && (
          <button onClick={() => { setPage('tools'); setAdminOpen(!adminOpen); }} className={`p-2 rounded-full transition-all ${adminOpen ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}>
            <Plus size={18} />
          </button>
        )}

        {session ? (
          <button onClick={() => supabase.auth.signOut()} className="p-2 text-slate-400 hover:text-white"><LogOut size={16} /></button>
        ) : (
          <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-all">
             <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center text-[10px] font-bold text-black italic">G</div>
          </button>
        )}
      </nav>

      {/* Rendu des Pages */}
      <main className="mx-auto max-w-[1200px] px-6 pt-40 pb-24">
        {page === 'accueil' && <Accueil onStart={() => setPage('tools')} />}
        {page === 'tools' && (
          <AiTools 
            tools={filteredTools} 
            category={category} 
            setCategory={setCategory} 
            query={query} 
            setQuery={setQuery} 
            isAdmin={isAdmin}
            adminOpen={adminOpen}
            supabase={supabase}
          />
        )}
        {page === 'prompts' && <Prompts />}
      </main>

      <footer className="text-center py-20 border-t border-white/5 text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
        © 2026 Free Ai Tools • L'excellence technologique
      </footer>
    </div>
  )
}

function Accueil({ onStart }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-8">
        <Sparkles size={14} /> Bienvenue sur l'Atlas
      </div>
      <h1 className="text-6xl sm:text-8xl font-black tracking-tighter mb-10 leading-none">
        Domptez l'IA. <br />
        <span className="text-slate-500 italic">Sans limites.</span>
      </h1>
      <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed mb-12">
        La collection ultime des meilleurs outils d'intelligence artificielle gratuits. 
        Économisez des milliers d'euros en accédant aux technologies les plus puissantes du web.
      </p>
      <button onClick={onStart} className="px-10 h-14 bg-white text-black rounded-full font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10">
        Explorer le Répertoire
      </button>
    </div>
  )
}

function AiTools({ tools, category, setCategory, query, setQuery, isAdmin, adminOpen, supabase }) {
  return (
    <div className="animate-fade">
      <header className="text-center mb-24">
        <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-4">Le Répertoire</h2>
        <p className="text-slate-500 text-lg">Curation manuelle des outils qui changent la donne.</p>
      </header>

      {isAdmin && adminOpen && (
        <div className="mb-20 p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-3xl shadow-2xl">
          <h3 className="text-xl font-bold mb-8 text-center">Indexer un nouvel outil</h3>
          <AdminForm onAdd={async (p) => { await supabase.from('ai_tools').insert(p); window.location.reload(); }} />
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16 border-b border-white/5 pb-12">
        <div className="flex flex-wrap justify-center gap-2">
          {['Tous', 'Texte', 'Image', 'Vidéo', 'Autre'].map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${category === c ? 'bg-white text-black' : 'text-slate-500 hover:text-white border border-white/5'}`}>{c}</button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
          <input 
            placeholder="Rechercher un outil..." 
            className="w-full h-11 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-blue-500 transition-all text-sm font-medium"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {tools.map(tool => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  )
}

function Prompts() {
  return (
    <div className="text-center animate-fade">
      <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-8">Espace Prompts</h2>
      <p className="text-slate-400 text-xl max-w-xl mx-auto mb-12">Bientôt disponible. Les meilleurs réglages pour obtenir des résultats parfaits avec vos IA préférées.</p>
      <div className="h-48 border border-white/10 border-dashed rounded-[32px] flex items-center justify-center text-slate-600 font-bold uppercase tracking-widest">
        En construction
      </div>
    </div>
  )
}

function ToolCard({ tool }) {
  const Icon = { 'Texte': Type, 'Image': ImageIcon, 'Vidéo': Video }[tool.category] || Globe
  return (
    <div className="p-8 rounded-[32px] border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 group shadow-lg">
      <div className="flex items-start justify-between mb-8">
        <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-blue-600 transition-all duration-500 group-hover:scale-110">
          <Icon size={24} />
        </div>
        <a href={tool.url} target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all"><ArrowUpRight size={20} /></a>
      </div>
      <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-400 transition-colors">{tool.name}</h3>
      <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-2">{tool.tagline}</p>
      <div className="pt-6 border-t border-white/5 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{tool.pricing_note}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500/50">{tool.category}</span>
      </div>
    </div>
  )
}

function AdminForm({ onAdd }) {
  const [form, setForm] = useState({ name: '', tagline: '', category: 'Texte', url: '', pricing_note: 'Gratuit' })
  return (
    <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => { e.preventDefault(); onAdd(form); }}>
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-4">Nom de l'outil</label>
        <input required className="h-14 px-6 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-blue-500 transition-all" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-4">Catégorie</label>
        <select className="h-14 px-6 rounded-2xl bg-[#020617] border border-white/10 outline-none focus:border-blue-500 transition-all" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
          <option>Texte</option><option>Image</option><option>Vidéo</option><option>Autre</option>
        </select>
      </div>
      <div className="md:col-span-2 flex flex-col gap-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-4">Accroche (Copywriting SEO)</label>
        <input required className="h-14 px-6 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-blue-500 transition-all" value={form.tagline} onChange={e => setForm({...form, tagline: e.target.value})} />
      </div>
      <div className="md:col-span-2 flex flex-col gap-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-4">Lien URL</label>
        <input required type="url" className="h-14 px-6 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-blue-500 transition-all" value={form.url} onChange={e => setForm({...form, url: e.target.value})} />
      </div>
      <button type="submit" className="md:col-span-2 h-16 bg-blue-600 rounded-2xl font-bold text-lg hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95">Indexer l'outil</button>
    </form>
  )
}

createRoot(document.getElementById('root')).render(<App />)
