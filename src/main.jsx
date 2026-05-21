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
  ShieldCheck,
  Globe,
  Layout,
  LogIn,
  LogOut,
  Plus
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
  { id: 'chatgpt', name: 'ChatGPT', tagline: 'L\'intelligence conversationnelle la plus polyvalente au monde.', category: 'Assistant', url: 'https://chatgpt.com', pricing_note: 'Plan Gratuit', tags: ['texte', 'logique'], is_featured: true },
  { id: 'claude', name: 'Claude', tagline: 'Un assistant sophistiqué axé sur la sécurité, la précision et le raisonnement.', category: 'Assistant', url: 'https://claude.ai', pricing_note: 'Plan Gratuit', tags: ['analyse', 'écriture'], is_featured: true },
  { id: 'perplexity', name: 'Perplexity', tagline: 'Un moteur de recherche qui fournit des réponses directes sourcées du web.', category: 'Recherche', url: 'https://www.perplexity.ai', pricing_note: 'Plan Gratuit', tags: ['recherche', 'données'], is_featured: true },
  { id: 'ideogram', name: 'Ideogram', tagline: 'Génération d\'images avancée avec un rendu typographique de pointe.', category: 'Design', url: 'https://ideogram.ai', pricing_note: 'Crédits', tags: ['visuels', 'design'], is_featured: true },
  { id: 'google-studio', name: 'AI Studio', tagline: 'Plateforme rapide pour prototyper avec les derniers modèles Gemini.', category: 'Dev', url: 'https://aistudio.google.com', pricing_note: 'Gratuit', tags: ['api', 'modèles'], is_featured: false },
]

function App() {
  const [tools, setTools] = useState(fallbackTools)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Tous')
  const [loading, setLoading] = useState(hasSupabaseConfig)
  const [session, setSession] = useState(null)
  
  const mainRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Entrance
      const tl = gsap.timeline()
      tl.from('.animate-text', {
        y: 80,
        opacity: 0,
        duration: 1.4,
        stagger: 0.1,
        ease: 'expo.out'
      })
      tl.from('.animate-fade', {
        opacity: 0,
        duration: 1,
        ease: 'power2.out'
      }, '-=0.8')

      // Scroll reveals
      gsap.utils.toArray('.apple-card').forEach((card, i) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
          },
          y: 60,
          opacity: 0,
          duration: 1.2,
          ease: 'expo.out',
          delay: (i % 3) * 0.1
        })
      })
    }, mainRef)
    return () => ctx.revert()
  }, [tools])

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
    return ['Tous', ...Array.from(new Set(tools.map((tool) => tool.category))).sort()]
  }, [tools])

  const filteredTools = useMemo(() => {
    const q = query.toLowerCase()
    return tools.filter((t) => {
      const matches = category === 'Tous' || t.category === category
      return matches && (t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q))
    })
  }, [category, query, tools])

  const isAdmin = session?.user?.email?.toLowerCase() === ADMIN_EMAIL

  async function signInWithGoogle() {
    if (!supabase) return
    const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    const redirectTo = isLocalhost ? window.location.origin : productionUrl
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
  }

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  return (
    <div ref={mainRef} className="min-h-screen bg-black">
      <div className="blur-overlay">
        <div className="blur-circle h-[600px] w-[600px] -top-48 -left-48" />
        <div className="blur-circle h-[500px] w-[500px] top-1/2 -right-24 bg-blue-500/5" />
      </div>

      {/* Nav */}
      <nav className="nav-glass px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <Command size={20} className="text-white" />
           <span className="text-[14px] font-bold tracking-tight text-white">Free Ai Tools</span>
        </div>
        <div className="flex items-center gap-6 sm:gap-8 text-[12px] font-semibold text-white/80">
          <a href="#directory" className="hover:text-[#0071e3] transition-colors">Répertoire</a>
          {session ? (
            <div className="flex items-center gap-4">
              {isAdmin && <span className="text-[10px] text-[#0071e3] font-bold uppercase tracking-widest hidden sm:inline">Admin</span>}
              <button onClick={signOut} className="flex items-center gap-2 hover:text-white"><LogOut size={14} /> Déconnexion</button>
            </div>
          ) : (
            <button onClick={signInWithGoogle} className="flex items-center gap-2 h-8 px-4 bg-white text-black rounded-full text-[11px] font-bold hover:bg-[#0071e3] hover:text-white transition-all">
              <LogIn size={14} /> Connexion
            </button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-glow pt-32 pb-24 sm:pt-48 sm:pb-32">
        <div className="content-section text-center">
          <div className="animate-fade mb-6 inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-[13px] font-semibold text-[#86868b] shadow-sm">
             <Sparkles size={14} className="text-[#0071e3]" /> 
             Le répertoire IA sélectionné
          </div>
          <h1 className="heading-1 animate-text">
            L'Intelligence. <br />
            <span className="text-[#86868b]">Sans la friction.</span>
          </h1>
          <p className="animate-text mt-8 mx-auto max-w-2xl text-xl font-medium text-[#86868b] sm:text-2xl leading-relaxed">
            Un index premium d'outils d'intelligence artificielle qui respectent votre temps et vos ressources. Vérifié, testé et prêt à l'emploi.
          </p>
          <div className="animate-fade mt-12 flex flex-wrap justify-center gap-4">
             <a href="#directory" className="btn-apple">Explorer l'Index</a>
             <button className="btn-ghost">En savoir plus <ChevronRight size={16} /></button>
          </div>
        </div>
      </section>

      {/* Directory */}
      <section id="directory" className="py-24 sm:py-32">
        <div className="content-section">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-24">
             <div className="max-w-xl">
                <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Notre Répertoire</h2>
                <p className="mt-4 text-lg font-medium text-[#86868b]">Nous n'indexons que les modèles qui améliorent fondamentalement la production humaine. Chaque entrée est vérifiée manuellement.</p>
             </div>
             
             <div className="flex flex-col gap-6 w-full md:w-[450px]">
                <div className="relative group">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b]" size={20} />
                   <input 
                     type="text" 
                     placeholder="Chercher des outils, tags ou fonctions"
                     className="search-input"
                     value={query}
                     onChange={(e) => setQuery(e.target.value)}
                   />
                </div>
                <div className="flex flex-wrap gap-2">
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
             </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
             {filteredTools.map((tool) => (
               <div key={tool.id} className="apple-card group">
                  <div className="flex items-start justify-between mb-8">
                     <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-white group-hover:bg-[#0071e3] transition-colors duration-500">
                        {tool.category === 'Assistant' ? <Layout size={24} /> : <Globe size={24} />}
                     </div>
                     {tool.is_featured && (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#0071e3] bg-[#0071e3]/10 px-3 py-1 rounded-full">
                           Sélection
                        </span>
                     )}
                  </div>
                  
                  <h3 className="text-2xl font-bold tracking-tight text-white mb-2">{tool.name}</h3>
                  <p className="text-[15px] font-medium text-[#86868b] leading-relaxed mb-8 h-12 overflow-hidden line-clamp-2">
                    {tool.tagline}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-10">
                    {tool.tags?.map(tag => (
                      <span key={tag} className="tag-pill">{tag}</span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-white/[0.05]">
                    <span className="text-[13px] font-semibold text-[#86868b]">{tool.pricing_note}</span>
                    <a 
                      href={tool.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white hover:bg-white hover:text-black transition-all duration-300"
                    >
                      <ArrowUpRight size={18} />
                    </a>
                  </div>
               </div>
             ))}
          </div>
          
          {loading && (
             <div className="mt-24 flex justify-center">
                <div className="h-8 w-8 animate-spin border-b-2 border-[#0071e3] rounded-full" />
             </div>
          )}
        </div>
      </section>

      {/* Admin Panel Link (Mobile/Visible to Admin) */}
      {isAdmin && (
        <section className="pb-24 content-section">
           <div className="apple-card bg-gradient-to-br from-[#0071e3]/10 to-transparent flex flex-col sm:flex-row items-center justify-between gap-8">
              <div>
                 <h3 className="text-2xl font-bold text-white">Console Admin</h3>
                 <p className="text-[#86868b] mt-2">Prêt à indexer un nouveau signal dans le répertoire ?</p>
              </div>
              <button className="btn-apple">
                <Plus size={18} className="mr-2" /> Ajouter un outil
              </button>
           </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-24 border-t border-white/[0.05]">
        <div className="content-section flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-black"><Command size={16} /></div>
             <span className="text-[14px] font-bold tracking-tight text-white">Free Ai Tools</span>
          </div>
          <div className="flex gap-12 text-[13px] font-medium text-[#86868b]">
             <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
             <a href="#" className="hover:text-white transition-colors">Éthique</a>
             <a href="#" className="hover:text-white transition-colors">Github</a>
          </div>
          <div className="text-[13px] font-medium text-[#86868b]">
            © 2026 Qualité Apple-grade
          </div>
        </div>
      </footer>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
