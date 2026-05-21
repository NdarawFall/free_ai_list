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
  Globe,
  Layout,
  LogIn,
  LogOut,
  Plus,
  Video,
  Type,
  Image as ImageIcon,
  MoreHorizontal,
  X,
  Check
} from 'lucide-react'
import './styles.css'

gsap.registerPlugin(ScrollTrigger)

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xnilbpzflfsimnkqxmog.supabase.co'
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_M7ILY-6b_MRYuu4l3BXLOA_TQEPKTyA'
const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey)
const ADMIN_EMAIL = 'ndarawpro@gmail.com'
const productionUrl = 'https://freeailist-navy.vercel.app'

const supabase = hasSupabaseConfig ? createClient(supabaseUrl, supabaseAnonKey) : null

const fallbackTools = [
  { id: '1', name: 'ChatGPT', tagline: 'Assistant polyvalent pour le texte et le code.', category: 'Texte', url: 'https://chatgpt.com', pricing_note: 'Gratuit', tags: ['ia', 'chat'], is_featured: true },
  { id: '2', name: 'Ideogram', tagline: 'Génération d\'images avec typographie parfaite.', category: 'Image', url: 'https://ideogram.ai', pricing_note: 'Crédits', tags: ['design'], is_featured: true },
  { id: '3', name: 'Luma Dream Machine', tagline: 'Création de vidéos réalistes à partir de texte.', category: 'Vidéo', url: 'https://lumalabs.ai', pricing_note: 'Gratuit', tags: ['vidéo'], is_featured: false },
]

function App() {
  const [tools, setTools] = useState(fallbackTools)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Tous')
  const [loading, setLoading] = useState(hasSupabaseConfig)
  const [session, setSession] = useState(null)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  
  const mainRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.animate-text', { y: 60, opacity: 0, duration: 1.2, stagger: 0.1, ease: 'expo.out' })
      gsap.from('.animate-fade', { opacity: 0, duration: 1, ease: 'power2.out' }, '-=0.8')
    }, mainRef)
    return () => ctx.revert()
  }, [])

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

  const categories = useMemo(() => {
    return ['Tous', 'Texte', 'Image', 'Vidéo', 'Autre']
  }, [])

  const filteredTools = useMemo(() => {
    const q = query.toLowerCase()
    return tools.filter((t) => {
      const matches = category === 'Tous' || t.category === category
      return matches && (t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q))
    })
  }, [category, query, tools])

  const isAdmin = session?.user?.email?.toLowerCase() === ADMIN_EMAIL

  async function signIn() {
    if (!supabase) return
    const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    await supabase.auth.signInWithOAuth({ 
      provider: 'google', 
      options: { redirectTo: isLocal ? window.location.origin : productionUrl } 
    })
  }

  async function addTool(payload) {
    if (!supabase) return
    const { data, error } = await supabase.from('ai_tools').insert(payload).select().single()
    if (!error && data) {
      setTools(prev => [data, ...prev])
      setShowAdminPanel(false)
    }
  }

  return (
    <div ref={mainRef} className="min-h-screen bg-black text-white">
      <div className="blur-overlay">
        <div className="blur-circle h-[600px] w-[600px] -top-48 -left-48" />
      </div>

      <nav className="nav-glass px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="bg-white p-1 rounded-md"><Command size={18} className="text-black" /></div>
           <span className="text-sm font-bold tracking-tight">Free Ai Tools</span>
        </div>
        
        <div className="flex items-center gap-6 sm:gap-10">
          <div className="hidden sm:flex items-center gap-8">
            <a href="#directory" className="nav-link">Répertoire</a>
            {isAdmin && (
              <button 
                onClick={() => setShowAdminPanel(!showAdminPanel)} 
                className={`nav-link flex items-center gap-2 ${showAdminPanel ? 'text-[#0071e3]' : ''}`}
              >
                {showAdminPanel ? <X size={16} /> : <Plus size={16} />} 
                {showAdminPanel ? 'Fermer' : 'Ajouter'}
              </button>
            )}
          </div>
          
          {session ? (
            <button onClick={() => supabase.auth.signOut()} className="nav-link flex items-center gap-2">
              <LogOut size={16} /> <span className="hidden sm:inline">Déconnexion</span>
            </button>
          ) : (
            <button onClick={signIn} className="h-9 px-5 bg-white text-black rounded-full text-xs font-bold hover:bg-[#0071e3] hover:text-white transition-all">
              Admin
            </button>
          )}
        </div>
      </nav>

      <main className="content-section pt-32 pb-20">
        <header className="hero-glow text-center mb-24">
          <div className="animate-fade mb-6 inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-[12px] font-semibold text-[#86868b]">
             <Sparkles size={14} className="text-[#0071e3]" /> 
             Ma sélection personnelle d'outils gratuits
          </div>
          <h1 className="heading-1 animate-text">
            Le meilleur de l'IA. <br />
            <span className="text-[#86868b]">Sans dépenser un euro.</span>
          </h1>
          <p className="animate-text mt-8 mx-auto max-w-2xl text-lg text-[#86868b]">
            Une collection simple et efficace des meilleurs sites d'IA gratuits que j'ai trouvés. Texte, image, vidéo et plus encore.
          </p>
        </header>

        {isAdmin && showAdminPanel && (
          <div className="animate-fade">
            <AdminForm onAdd={addTool} />
          </div>
        )}

        <section id="directory" className="space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-white/5 pb-12">
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map(c => (
                <button 
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`category-pill ${category === c ? 'active' : ''}`}
                >
                  {c}
                </button>
              ))}
            </div>
            
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b]" size={18} />
              <input 
                type="text" 
                placeholder="Rechercher..."
                className="search-input !h-11 !text-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map(tool => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>

          {loading && (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin border-b-2 border-[#0071e3] rounded-full" />
            </div>
          )}
        </section>
      </main>

      <footer className="py-16 border-t border-white/5 text-center">
        <p className="text-xs font-medium text-[#86868b]">
          © 2026 Free Ai Tools • Créé avec soin
        </p>
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
    <div className="apple-card group">
      <div className="flex items-start justify-between mb-8">
        <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white group-hover:bg-[#0071e3] transition-colors duration-500">
          <Icon size={20} />
        </div>
        {tool.is_featured && (
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#0071e3] bg-[#0071e3]/10 px-2 py-1 rounded-md">Sélection</span>
        )}
      </div>
      
      <h3 className="text-xl font-bold tracking-tight text-white mb-2">{tool.name}</h3>
      <p className="text-sm font-medium text-[#86868b] leading-relaxed mb-6 h-10 overflow-hidden line-clamp-2">
        {tool.tagline}
      </p>
      
      <div className="flex items-center justify-between pt-5 border-t border-white/5">
        <span className="text-[12px] font-semibold text-[#86868b]">{tool.pricing_note}</span>
        <a 
          href={tool.url} 
          target="_blank" 
          rel="noreferrer" 
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white hover:bg-white hover:text-black transition-all duration-300"
        >
          <ArrowUpRight size={16} />
        </a>
      </div>
    </div>
  )
}

function AdminForm({ onAdd }) {
  const [form, setForm] = useState({ name: '', tagline: '', category: 'Texte', url: '', pricing_note: 'Gratuit', tags: '', is_featured: false })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await onAdd({
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
    })
    setLoading(false)
  }

  return (
    <div className="admin-section animate-fade">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Ajouter un outil</h2>
        <p className="text-[#86868b] text-sm mt-1">Enregistrez un nouveau site que vous avez trouvé.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="admin-input-group">
          <label className="admin-label">Nom de l'outil</label>
          <input required className="admin-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        </div>
        
        <div className="admin-input-group">
          <label className="admin-label">Catégorie</label>
          <select className="admin-input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
            <option>Texte</option>
            <option>Image</option>
            <option>Vidéo</option>
            <option>Autre</option>
          </select>
        </div>
        
        <div className="admin-input-group md:col-span-2">
          <label className="admin-label">Description courte</label>
          <input required className="admin-input" value={form.tagline} onChange={e => setForm({...form, tagline: e.target.value})} />
        </div>
        
        <div className="admin-input-group">
          <label className="admin-label">URL (Lien)</label>
          <input required type="url" className="admin-input" value={form.url} onChange={e => setForm({...form, url: e.target.value})} />
        </div>
        
        <div className="admin-input-group">
          <label className="admin-label">Note sur le prix</label>
          <input className="admin-input" value={form.pricing_note} onChange={e => setForm({...form, pricing_note: e.target.value})} />
        </div>

        <div className="flex items-center gap-4 px-4">
          <input 
            type="checkbox" 
            id="featured"
            className="admin-checkbox" 
            checked={form.is_featured} 
            onChange={e => setForm({...form, is_featured: e.target.checked})} 
          />
          <label htmlFor="featured" className="text-sm font-medium text-[#86868b] cursor-pointer">Mettre en avant dans la sélection</label>
        </div>

        <div className="md:col-span-2 flex justify-end">
          <button disabled={loading} type="submit" className="btn-apple !w-full md:!w-auto">
            {loading ? 'Enregistrement...' : 'Enregistrer l\'outil'}
          </button>
        </div>
      </form>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
