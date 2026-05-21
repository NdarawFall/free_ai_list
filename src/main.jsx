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
  Type,
  Video,
  Image as ImageIcon,
  MoreHorizontal,
  LogOut,
  MousePointer2,
  Cpu,
  Zap,
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
  { id: '1', name: 'ChatGPT', tagline: 'L\'excellence conversationnelle pour vos idées et votre code.', category: 'Texte', url: 'https://chatgpt.com', pricing_note: 'Plan Gratuit', is_featured: true },
  { id: '2', name: 'Midjourney', tagline: 'La référence absolue pour la génération d\'images artistiques.', category: 'Image', url: 'https://midjourney.com', pricing_note: 'Essai', is_featured: true },
  { id: '3', name: 'Sora', tagline: 'La révolution vidéo par OpenAI (Aperçu).', category: 'Vidéo', url: 'https://openai.com/sora', pricing_note: 'Bientôt', is_featured: false },
]

function App() {
  const [tools, setTools] = useState(fallbackTools)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Tous')
  const [loading, setLoading] = useState(hasSupabaseConfig)
  const [session, setSession] = useState(null)
  const [adminOpen, setAdminOpen] = useState(false)
  
  const mainRef = useRef(null)
  const orbsRef = useRef(null)

  // Master Orchestration (Animations)
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Hero Entrance
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.from('.mask-text span', { y: 150, duration: 1.5, stagger: 0.12 })
        .from('.animate-ui', { opacity: 0, y: 30, duration: 1, stagger: 0.1 }, '-=1')
        .from('.nav-master', { y: -100, duration: 1.2 }, '-=1.2')

      // 2. Parallax Orbs
      gsap.to('.orb-1', {
        y: -100, x: 50,
        scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 1.5 }
      })
      gsap.to('.orb-2', {
        y: 100, x: -50,
        scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 2 }
      })

      // 3. Card Entrance
      gsap.from('.glass-card', {
        scrollTrigger: { trigger: '.tool-grid', start: 'top 85%' },
        opacity: 0, y: 60, duration: 1.2, stagger: 0.08, ease: 'expo.out'
      })
    }, mainRef)
    return () => ctx.revert()
  }, [tools])

  // Auth & Data
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

  const isAdmin = session?.user?.email?.toLowerCase() === ADMIN_EMAIL

  async function handleGoogleLogin() {
    if (!supabase) return
    const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    await supabase.auth.signInWithOAuth({ 
      provider: 'google', 
      options: { redirectTo: isLocal ? window.location.origin : productionUrl } 
    })
  }

  const filteredTools = useMemo(() => {
    const q = query.toLowerCase()
    return tools.filter((t) => {
      const matches = category === 'Tous' || t.category === category
      return matches && (t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q))
    })
  }, [category, query, tools])

  return (
    <div ref={mainRef} className="site-root relative">
      {/* Background Layer */}
      <div className="parallax-glow">
        <div className="orb-1 glow-orb h-[600px] w-[600px] top-[-10%] left-[-10%] bg-blue-600/30" />
        <div className="orb-2 glow-orb h-[500px] w-[500px] top-[40%] right-[-5%] bg-blue-400/10" />
        <div className="orb-3 glow-orb h-[400px] w-[400px] bottom-[10%] left-[20%] bg-indigo-500/10" />
      </div>

      {/* Navigation */}
      <nav className="nav-master flex items-center">
        <div className="master-container w-full flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="h-9 w-9 bg-white flex items-center justify-center rounded-xl transition-transform group-hover:rotate-90">
              <Command size={20} className="text-black" />
            </div>
            <span className="text-lg font-bold tracking-tight">Free Ai Tools</span>
          </div>

          <div className="flex items-center gap-10">
            <div className="hidden md:flex items-center gap-8">
               <a href="#directory" className="text-sm font-medium text-white/50 hover:text-white transition-colors">Répertoire</a>
               {isAdmin && (
                 <button onClick={() => setAdminOpen(!adminOpen)} className={`text-sm font-medium flex items-center gap-2 transition-colors ${adminOpen ? 'text-blue-500' : 'text-white/50 hover:text-white'}`}>
                    {adminOpen ? <X size={16} /> : <Plus size={16} />} Gestion
                 </button>
               )}
            </div>
            
            {session ? (
              <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white transition-colors">
                <LogOut size={16} /> <span className="hidden sm:inline">Déconnexion</span>
              </button>
            ) : (
              <button onClick={handleGoogleLogin} className="btn-google">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="G" />
                <span>Admin</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32">
        <div className="master-container">
          <div className="flex flex-col items-center text-center">
            <div className="animate-ui mb-8 inline-flex items-center gap-3 rounded-full bg-white/[0.05] border border-white/[0.08] px-5 py-2 text-sm font-medium text-blue-400 backdrop-blur-xl">
               <Sparkles size={16} /> Ma sélection personnelle
            </div>
            
            <h1 className="hero-h1 text-balance">
              <span className="mask-text"><span>L'intelligence</span></span>
              <span className="mask-text"><span className="text-white/40 italic">augmentée.</span></span>
            </h1>

            <p className="animate-ui mt-12 max-w-2xl text-xl sm:text-2xl font-medium text-white/50 leading-relaxed">
              Une archive méticuleuse des meilleurs outils IA gratuits. Aucun compromis sur la qualité, aucune dépense inutile.
            </p>

            <div className="animate-ui mt-16 flex flex-wrap justify-center gap-6">
               <a href="#directory" className="btn-primary">Découvrir l'index</a>
               <button className="btn-secondary">Voir les favoris <ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Panel */}
      {isAdmin && adminOpen && (
        <section className="master-container animate-ui">
          <div className="admin-drawer">
             <div className="flex items-center justify-between mb-12">
               <div>
                  <h2 className="text-3xl font-bold">Indexer un nouvel outil</h2>
                  <p className="text-white/40 mt-2">Le répertoire est vivant. Ajoutez votre dernière trouvaille.</p>
               </div>
               <div className="h-12 w-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                  <Zap size={24} />
               </div>
             </div>
             <AdminForm onAdd={async (p) => {
               await supabase.from('ai_tools').insert(p)
               window.location.reload()
             }} />
          </div>
        </section>
      )}

      {/* Directory Section */}
      <section id="directory" className="py-32">
        <div className="master-container">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-16 mb-24">
             <div className="max-w-xl animate-ui">
                <h2 className="section-h2">Le Répertoire</h2>
                <p className="mt-6 text-xl font-medium text-white/40 leading-relaxed">Filtré par utilité, testé pour la performance. Parcourez ma bibliothèque par catégorie d'usage.</p>
             </div>
             
             <div className="flex flex-col gap-8 w-full lg:w-[500px] animate-ui">
                <div className="relative group">
                   <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-500 transition-colors" size={24} />
                   <input 
                     type="text" 
                     placeholder="Rechercher par nom, tag ou fonction..."
                     className="master-search"
                     value={query}
                     onChange={(e) => setQuery(e.target.value)}
                   />
                </div>
                <div className="flex flex-wrap gap-2">
                   {['Tous', 'Texte', 'Image', 'Vidéo', 'Autre'].map(c => (
                     <button 
                       key={c}
                       onClick={() => setCategory(c)}
                       className={`pill-filter ${category === c ? 'active' : ''}`}
                     >
                       {c}
                     </button>
                   ))}
                </div>
             </div>
          </div>

          <div className="tool-grid grid gap-8 md:grid-cols-2 lg:grid-cols-3">
             {filteredTools.map((tool) => (
               <ToolCard key={tool.id} tool={tool} />
             ))}
          </div>

          {loading && (
             <div className="mt-32 flex justify-center py-20">
                <div className="h-12 w-12 animate-spin border-b-2 border-blue-500 rounded-full" />
             </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 border-t border-white/[0.05]">
        <div className="master-container flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 bg-white/5 border border-white/10 flex items-center justify-center rounded-xl text-white"><Command size={20} /></div>
             <div className="flex flex-col">
               <span className="text-sm font-bold tracking-tight">Free Ai Tools</span>
               <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">Curation personnelle</span>
             </div>
          </div>
          <div className="flex gap-12 text-sm font-medium text-white/30">
             <a href="#" className="hover:text-white transition-colors">Github</a>
             <a href="#" className="hover:text-white transition-colors">Twitter</a>
             <a href="#" className="hover:text-white transition-colors">Discord</a>
          </div>
          <div className="text-sm font-medium text-white/30">
            © 2026 • Design by Expert UI
          </div>
        </div>
      </footer>
    </div>
  )
}

function ToolCard({ tool }) {
  const cardRef = useRef(null)
  
  const handleMouseMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    cardRef.current.style.setProperty('--mouse-x', `${x}%`)
    cardRef.current.style.setProperty('--mouse-y', `${y}%`)
  }

  const Icon = {
    'Texte': Type,
    'Image': ImageIcon,
    'Vidéo': Video,
    'Autre': MoreHorizontal
  }[tool.category] || Cpu

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="glass-card group"
    >
      <div className="inner-glow" />
      
      <div className="flex items-start justify-between mb-10">
        <div className="h-14 w-14 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white group-hover:bg-blue-600 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
           <Icon size={28} />
        </div>
        {tool.is_featured && (
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <Sparkles size={12} className="text-blue-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Pick</span>
          </div>
        )}
      </div>

      <h3 className="text-3xl font-bold tracking-tight text-white mb-4 transition-colors group-hover:text-blue-400">{tool.name}</h3>
      <p className="text-lg font-medium text-white/40 leading-relaxed mb-10 min-h-[56px] line-clamp-2">
        {tool.tagline}
      </p>

      <div className="flex items-center justify-between pt-8 border-t border-white/[0.05]">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Statut</span>
          <span className="text-sm font-semibold text-white/60">{tool.pricing_note}</span>
        </div>
        <a 
          href={tool.url} 
          target="_blank" 
          rel="noreferrer" 
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] text-white transition-all duration-300 hover:bg-white hover:text-black hover:scale-110"
        >
          <ArrowUpRight size={22} />
        </a>
      </div>
    </div>
  )
}

function AdminForm({ onAdd }) {
  const [form, setForm] = useState({ name: '', tagline: '', category: 'Texte', url: '', pricing_note: 'Gratuit', is_featured: false })
  
  return (
    <form className="grid grid-cols-1 md:grid-cols-2 gap-10" onSubmit={(e) => { e.preventDefault(); onAdd(form); }}>
       <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-widest text-white/30 ml-2">Nom de l'outil</label>
          <input required className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-blue-500 transition-all" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
       </div>
       <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-widest text-white/30 ml-2">Catégorie</label>
          <select className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-blue-500 transition-all" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
             <option>Texte</option><option>Image</option><option>Vidéo</option><option>Autre</option>
          </select>
       </div>
       <div className="md:col-span-2 space-y-4">
          <label className="text-xs font-bold uppercase tracking-widest text-white/30 ml-2">Tagline (Description courte)</label>
          <input required className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-blue-500 transition-all" value={form.tagline} onChange={e => setForm({...form, tagline: e.target.value})} />
       </div>
       <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-widest text-white/30 ml-2">Lien (URL)</label>
          <input required type="url" className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-blue-500 transition-all" value={form.url} onChange={e => setForm({...form, url: e.target.value})} />
       </div>
       <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-widest text-white/30 ml-2">Pricing Note</label>
          <input className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-blue-500 transition-all" value={form.pricing_note} onChange={e => setForm({...form, pricing_note: e.target.value})} />
       </div>
       <div className="flex items-center gap-4 py-4">
          <input type="checkbox" className="h-6 w-6 rounded-lg bg-white/5 border-white/10 text-blue-500" checked={form.is_featured} onChange={e => setForm({...form, is_featured: e.target.checked})} />
          <span className="text-sm font-medium text-white/60">Mettre en avant ce site</span>
       </div>
       <div className="md:col-span-2 flex justify-end">
          <button type="submit" className="btn-primary !h-16 !px-12 text-base">Enregistrer l'outil</button>
       </div>
    </form>
  )
}

createRoot(document.getElementById('root')).render(<App />)
