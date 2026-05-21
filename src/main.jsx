import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createClient } from '@supabase/supabase-js'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowUpRight,
  Command,
  Search,
  Sparkles,
  ChevronRight,
  Plus,
  X,
  Layout,
  Globe,
  Video,
  Type,
  MoreHorizontal,
  LogOut,
  Zap,
  Image as ImageIcon
} from 'lucide-react'
import './styles.css'

gsap.registerPlugin(ScrollTrigger)

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xnilbpzflfsimnkqxmog.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_M7ILY-6b_MRYuu4l3BXLOA_TQEPKTyA'
const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey)
const ADMIN_EMAIL = 'ndarawpro@gmail.com'
const productionUrl = 'https://freeailist-navy.vercel.app'

const supabase = hasSupabaseConfig ? createClient(supabaseUrl, supabaseAnonKey) : null

const fallbackTools = [
  { id: '1', name: 'ChatGPT', tagline: 'Le standard de l\'intelligence artificielle générative pour le texte et le raisonnement.', category: 'Texte', url: 'https://chatgpt.com', pricing_note: 'Gratuit', is_featured: true },
  { id: '2', name: 'Ideogram', tagline: 'Une maîtrise exceptionnelle du design graphique et de la typographie par l\'image.', category: 'Image', url: 'https://ideogram.ai', pricing_note: 'Crédits', is_featured: true },
  { id: '3', name: 'Luma Dream Machine', tagline: 'Créez des vidéos cinématiques d\'une fluidité bluffante en quelques secondes.', category: 'Vidéo', url: 'https://lumalabs.ai', pricing_note: 'Essai', is_featured: false },
]

function App() {
  const [tools, setTools] = useState(fallbackTools)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Tous')
  const [loading, setLoading] = useState(hasSupabaseConfig)
  const [session, setSession] = useState(null)
  const [adminOpen, setAdminOpen] = useState(false)
  
  const mainRef = useRef(null)

  // GSAP Orchestration
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero
      gsap.from('.nexus-h1', { y: 100, opacity: 0, duration: 1.5, ease: 'expo.out' })
      gsap.from('.nexus-fade', { opacity: 0, y: 30, duration: 1, stagger: 0.1, delay: 0.5, ease: 'power3.out' })
      
      // Cards
      gsap.from('.nexus-card', {
        scrollTrigger: { trigger: '.tool-grid', start: 'top 90%' },
        opacity: 0, y: 50, duration: 1.2, stagger: 0.05, ease: 'expo.out'
      })
    }, mainRef)
    return () => ctx.revert()
  }, [tools])

  // Data & Auth
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    async function loadTools() {
      if (!supabase) { setLoading(false); return; }
      const { data, error } = await supabase.from('ai_tools').select('*').order('is_featured', { ascending: false }).order('name', { ascending: true })
      if (!error && data?.length) setTools(data)
      setLoading(false)
    }
    loadTools()
  }, [])

  const categories = useMemo(() => ['Tous', 'Texte', 'Image', 'Vidéo', 'Autre'], [])
  const isAdmin = session?.user?.email?.toLowerCase() === ADMIN_EMAIL

  const filteredTools = useMemo(() => {
    const q = query.toLowerCase()
    return tools.filter((t) => {
      const matches = category === 'Tous' || t.category === category
      return matches && (t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q))
    })
  }, [category, query, tools])

  async function handleLogin() {
    if (!supabase) return
    const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    await supabase.auth.signInWithOAuth({ 
      provider: 'google', 
      options: { redirectTo: isLocal ? window.location.origin : productionUrl } 
    })
  }

  async function handleAddTool(payload) {
    if (!supabase) return
    const { data, error } = await supabase.from('ai_tools').insert(payload).select().single()
    if (!error && data) {
      setTools(prev => [data, ...prev])
      setAdminOpen(false)
    }
  }

  return (
    <div ref={mainRef} className="min-h-screen relative overflow-hidden bg-[#020617]">
      <div className="nexus-bg" />
      <div className="glow-nexus h-[600px] w-[600px] -top-48 -left-48 bg-blue-600/20" />
      <div className="glow-nexus h-[500px] w-[500px] top-1/2 -right-48 bg-cyan-500/10" />

      {/* Floating Nav */}
      <nav className="nexus-nav">
        <div className="flex items-center gap-3 pr-6 border-r border-white/10">
          <div className="h-8 w-8 bg-white flex items-center justify-center rounded-lg shadow-xl shadow-white/10">
            <Command size={18} className="text-black" />
          </div>
          <span className="text-sm font-bold tracking-tight text-white hidden sm:block">Free AI Atlas</span>
        </div>
        
        <div className="flex items-center gap-6">
          <a href="#directory" className="text-[13px] font-semibold text-slate-400 hover:text-white transition-colors">Répertoire</a>
          {isAdmin && (
            <button 
              onClick={() => setAdminOpen(!adminOpen)} 
              className={`text-[13px] font-semibold flex items-center gap-2 ${adminOpen ? 'text-blue-500' : 'text-slate-400 hover:text-white'}`}
            >
              {adminOpen ? <X size={14} /> : <Plus size={14} />} 
              <span className="hidden sm:block">Gestion</span>
            </button>
          )}
          
          {session ? (
            <button onClick={() => supabase.auth.signOut()} className="text-slate-400 hover:text-white"><LogOut size={16} /></button>
          ) : (
            <button onClick={handleLogin} className="google-btn">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="G" />
              <span className="hidden sm:block">Admin</span>
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="nexus-container pt-48 pb-32 text-center">
        <div className="nexus-fade mb-8 inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-5 py-2 text-xs font-bold text-blue-400 uppercase tracking-widest">
           <Zap size={14} /> Intelligence en accès libre
        </div>
        <h1 className="nexus-h1 mb-8 max-w-5xl mx-auto">
          L'Atlas des outils <br />
          <span className="text-slate-500">IA sans compromis.</span>
        </h1>
        <p className="nexus-fade max-w-2xl mx-auto text-xl font-medium text-slate-400 leading-relaxed mb-12">
          Une archive sélective et rigoureuse des modèles qui redéfinissent la productivité. Aucun abonnement requis, juste du génie à l'état pur.
        </p>
        <div className="nexus-fade flex flex-wrap justify-center gap-6">
          <a href="#directory" className="nexus-btn-primary">Explorer le répertoire</a>
          <button className="flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white transition-colors">
            En savoir plus <ChevronRight size={18} />
          </button>
        </div>
      </header>

      {/* Admin Panel */}
      {isAdmin && adminOpen && (
        <section className="nexus-container mb-32 animate-fade">
          <div className="nexus-dashboard">
             <div className="mb-12">
               <h2 className="text-3xl font-bold text-white">Nouvelle Indexation</h2>
               <p className="text-slate-500 mt-2">Enregistrez un nouvel outil dans l'Atlas.</p>
             </div>
             <AdminForm onAdd={handleAddTool} />
          </div>
        </section>
      )}

      {/* Directory Section */}
      <section id="directory" className="nexus-container py-24">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20 border-b border-white/5 pb-16">
          <div className="max-w-xl">
            <h2 className="text-4xl font-extrabold text-white sm:text-5xl">Le Répertoire</h2>
            <p className="mt-4 text-lg text-slate-500 font-medium">Chaque entrée est testée pour sa pertinence, sa gratuité réelle et sa capacité à transformer votre workflow.</p>
          </div>
          
          <div className="flex flex-col gap-6 w-full lg:w-[450px]">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Chercher un nom, un tag ou un usage..."
                className="nexus-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(c => (
                <button key={c} onClick={() => setCategory(c)} className={`nexus-pill ${category === c ? 'active' : ''}`}>{c}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="tool-grid grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map(tool => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>

        {loading && (
          <div className="mt-32 flex justify-center py-20">
            <div className="h-10 w-10 animate-spin border-b-2 border-blue-500 rounded-full" />
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="nexus-container py-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-12 text-slate-500">
        <div className="flex items-center gap-4">
           <div className="h-10 w-10 bg-white/5 border border-white/10 flex items-center justify-center rounded-xl"><Command size={20} /></div>
           <div>
             <span className="block text-sm font-bold text-white">Free AI Atlas</span>
             <span className="text-[10px] uppercase tracking-[0.2em]">Curation par un humain</span>
           </div>
        </div>
        <div className="text-[13px] font-medium tracking-wide">
          © 2026 • Réalisé avec une précision chirurgicale.
        </div>
      </footer>
    </div>
  )
}

function ToolCard({ tool }) {
  const Icon = {
    'Texte': Type,
    'Image': ImageIcon,
    'Vidéo': Video,
    'Autre': MoreHorizontal
  }[tool.category] || Globe

  return (
    <div className="nexus-card group">
      <div className="flex items-start justify-between mb-8">
        <div className="h-14 w-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white group-hover:bg-blue-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
          <Icon size={24} />
        </div>
        {tool.is_featured && (
          <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center gap-2">
             <Sparkles size={12} className="text-blue-500" />
             <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Elite</span>
          </div>
        )}
      </div>

      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">{tool.name}</h3>
      <p className="text-slate-400 font-medium leading-relaxed mb-10 h-12 overflow-hidden line-clamp-2">{tool.tagline}</p>

      <div className="flex items-center justify-between pt-6 border-t border-white/5">
        <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{tool.pricing_note}</span>
        <a 
          href={tool.url} 
          target="_blank" 
          rel="noreferrer" 
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-white hover:bg-white hover:text-black hover:scale-110 transition-all duration-300 shadow-2xl"
        >
          <ArrowUpRight size={20} />
        </a>
      </div>
    </div>
  )
}

function AdminForm({ onAdd }) {
  const [form, setForm] = useState({ name: '', tagline: '', category: 'Texte', url: '', pricing_note: 'Gratuit', is_featured: false })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await onAdd(form)
    setLoading(false)
  }

  return (
    <form className="grid grid-cols-1 md:grid-cols-2 gap-10" onSubmit={handleSubmit}>
       <div className="nexus-input-group">
          <label className="nexus-label">Nom de l'outil</label>
          <input required className="nexus-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
       </div>
       <div className="nexus-input-group">
          <label className="nexus-label">Catégorie</label>
          <select className="nexus-field" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
             <option>Texte</option><option>Image</option><option>Vidéo</option><option>Autre</option>
          </select>
       </div>
       <div className="md:col-span-2 nexus-input-group">
          <label className="nexus-label">Description (SEO Focus)</label>
          <input required className="nexus-field" value={form.tagline} onChange={e => setForm({...form, tagline: e.target.value})} />
       </div>
       <div className="nexus-input-group">
          <label className="nexus-label">URL Source</label>
          <input required type="url" className="nexus-field" value={form.url} onChange={e => setForm({...form, url: e.target.value})} />
       </div>
       <div className="nexus-input-group">
          <label className="nexus-label">Note sur la gratuité</label>
          <input className="nexus-field" value={form.pricing_note} onChange={e => setForm({...form, pricing_note: e.target.value})} />
       </div>
       <div className="flex items-center gap-4 px-4 h-12">
          <input type="checkbox" className="h-6 w-6 rounded-lg bg-white/5 border-white/10 text-blue-500" checked={form.is_featured} onChange={e => setForm({...form, is_featured: e.target.checked})} />
          <span className="text-sm font-semibold text-slate-500">Mettre en avant cette pépite</span>
       </div>
       <div className="md:col-span-2 flex justify-end">
          <button type="submit" disabled={loading} className="nexus-btn-primary !h-14 !px-12 text-base">
            {loading ? 'Indexation...' : 'Indexer l\'outil'}
          </button>
       </div>
    </form>
  )
}

createRoot(document.getElementById('root')).render(<App />)
