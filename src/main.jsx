import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createClient } from '@supabase/supabase-js'
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useNavigate, 
  useLocation 
} from 'react-router-dom'
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
  ChevronRight,
  MessageSquare,
  Wallet,
  Settings,
  Cpu,
  Layers,
  ArrowRight,
  Lightbulb
} from 'lucide-react'
import './styles.css'

// Supabase Setup
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xnilbpzflfsimnkqxmog.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_M7ILY-6b_MRYuu4l3BXLOA_TQEPKTyA'
const ADMIN_EMAIL = 'ndarawpro@gmail.com'
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null

function App() {
  const [tools, setTools] = useState([])
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  // Auth Sync
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => subscription.unsubscribe()
  }, [])

  // Data Sync
  useEffect(() => {
    async function loadTools() {
      if (!supabase) return
      const { data, error } = await supabase.from('ai_tools').select('*').order('name', { ascending: true })
      if (!error && data) setTools(data)
      setLoading(false)
    }
    loadTools()
  }, [])

  const isAdmin = session?.user?.email?.toLowerCase() === ADMIN_EMAIL

  return (
    <Router>
      <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] selection:bg-blue-500/10">
        <BackgroundEffects />
        <Navbar session={session} isAdmin={isAdmin} />
        
        <main className="mx-auto max-w-[1400px] px-6 pt-32 pb-24 relative">
          <Routes>
            <Route path="/" element={<Accueil />} />
            <Route path="/ai" element={<ToolDirectory type="ai" tools={tools} loading={loading} />} />
            <Route path="/tools" element={<ToolDirectory type="tools" tools={tools} loading={loading} />} />
            <Route path="/prompts" element={<Prompts />} />
            {isAdmin && (
              <Route path="/admin" element={<AdminView onAdd={(newTool) => setTools(prev => [newTool, ...prev])} />} />
            )}
            <Route path="*" element={<Accueil />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  )
}

function BackgroundEffects() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-white">
      <div className="glow-nexus absolute -top-[10%] -left-[10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="glow-nexus absolute top-[40%] -right-[5%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px]" style={{ animationDelay: '-5s' }} />
      <div className="glow-nexus absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px]" style={{ animationDelay: '-10s' }} />
    </div>
  )
}

function Navbar({ session, isAdmin }) {
  const location = useLocation()

  async function handleLogin() {
    if (!supabase) return
    await supabase.auth.signInWithOAuth({ 
      provider: 'google', 
      options: { redirectTo: window.location.origin } 
    })
  }

  return (
    <nav className="nexus-nav">
      <Link to="/" className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${location.pathname === '/' ? 'bg-black text-white' : 'text-slate-500 hover:text-black'}`}>
        <Home size={14} /> <span>Accueil</span>
      </Link>
      <Link to="/ai" className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${location.pathname === '/ai' ? 'bg-black text-white' : 'text-slate-500 hover:text-black'}`}>
        <Zap size={14} /> <span>AI</span>
      </Link>
      <Link to="/tools" className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${location.pathname === '/tools' ? 'bg-black text-white' : 'text-slate-500 hover:text-black'}`}>
        <Settings size={14} /> <span>Tools</span>
      </Link>
      <Link to="/prompts" className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${location.pathname === '/prompts' ? 'bg-black text-white' : 'text-slate-500 hover:text-black'}`}>
        <Terminal size={14} /> <span>Prompts</span>
      </Link>
      
      <div className="w-px h-6 bg-black/5 mx-1" />

      {isAdmin && (
        <Link to="/admin" className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${location.pathname === '/admin' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-black'}`}>
          <Plus size={16} /> <span>Ajouter une IA</span>
        </Link>
      )}

      {session ? (
        <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-red-500 transition-all whitespace-nowrap">
          <LogOut size={14} /> <span>Déconnexion</span>
        </button>
      ) : (
        <button onClick={handleLogin} className="flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider bg-black/5 hover:bg-black/10 transition-all whitespace-nowrap">
           <div className="w-4 h-4 bg-black rounded-full flex items-center justify-center text-[10px] font-bold text-white italic">G</div>
           <span>Connexion Admin</span>
        </button>
      )}
    </nav>
  )
}

function Loader({ onComplete }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer)
          setTimeout(onComplete, 500)
          return 100
        }
        return prev + 5
      })
    }, 50)
    return () => clearInterval(timer)
  }, [onComplete])

  return (
    <div className="loader-container">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-black flex items-center justify-center rounded-xl">
          <Command size={24} className="text-white" />
        </div>
        <span className="text-xl font-black tracking-tighter">Free AI Atlas</span>
      </div>
      <div className="loader-bar">
        <div className="loader-progress" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Initialisation de l'Atlas...</p>
    </div>
  )
}

function Accueil() {
  const navigate = useNavigate()
  const [isLoaded, setIsLoaded] = useState(false)

  if (!isLoaded) return <Loader onComplete={() => setIsLoaded(true)} />

  return (
    <div className="space-y-48 animate-fade pb-20">
      {/* Hero Section */}
      <section className="text-center py-20 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-600/5 border border-blue-600/10 text-[11px] font-bold text-blue-600 uppercase tracking-[0.2em] mb-12">
          <Sparkles size={14} /> Plus qu'un simple répertoire
        </div>
        <h1 className="nexus-h1 mb-12 max-w-5xl leading-[0.9]">
          L'élite du gratuit <br />
          <span className="text-slate-400 italic">accessible à tous.</span>
        </h1>
        <p className="text-slate-500 text-xl max-w-2xl mx-auto leading-relaxed mb-16">
          Nous brisons les barrières du coût. Découvrez les meilleures IA, les plateformes créatives les plus puissantes et les secrets du prompting pour dominer votre domaine sans frais.
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          <button onClick={() => navigate('/ai')} className="px-10 h-16 bg-black text-white rounded-full font-black text-lg hover:scale-105 transition-all shadow-2xl shadow-black/10">
            Accéder à l'Espace AI
          </button>
          <button onClick={() => navigate('/tools')} className="px-10 h-16 bg-white text-black border border-black/5 rounded-full font-black text-lg hover:bg-slate-50 transition-all">
            Outils Créateurs
          </button>
        </div>
      </section>

      {/* Sections SaaS Quality */}
      <div className="grid gap-40">
        {/* Section 1: Money/Accessibility */}
        <section className="grid md:grid-cols-2 gap-24 items-center px-4">
          <div className="space-y-8">
            <div className="w-16 h-16 rounded-3xl bg-blue-600/5 border border-blue-600/10 flex items-center justify-center text-blue-600">
              <Wallet size={32} />
            </div>
            <h2 className="text-5xl font-black leading-tight tracking-tighter">L'argent ne doit plus être une barrière.</h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              Le marché de l'IA est saturé d'abonnements à prix d'or. Nous pensons que le génie doit être démocratisé. Nous sélectionnons uniquement des outils qui offrent une puissance comparable aux modèles payants, sans vous demander votre carte bancaire.
            </p>
            <div className="flex items-center gap-6 pt-4">
               <div className="flex flex-col">
                  <span className="text-3xl font-black">0€</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Coût mensuel</span>
               </div>
               <div className="w-px h-10 bg-black/5" />
               <div className="flex flex-col">
                  <span className="text-3xl font-black">100%</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Vérifié humain</span>
               </div>
            </div>
          </div>
          <div className="nexus-card bg-slate-50 border-none shadow-none p-12">
             <div className="space-y-8">
                <div className="flex justify-between items-center">
                   <div className="flex gap-2">
                      <div className="h-3 w-3 bg-red-400 rounded-full" />
                      <div className="h-3 w-3 bg-yellow-400 rounded-full" />
                      <div className="h-3 w-3 bg-green-400 rounded-full" />
                   </div>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Comparatif Marché</span>
                </div>
                <div className="space-y-4">
                   <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-black/5">
                      <span className="font-bold">Modèles Premium</span>
                      <span className="text-red-500 font-bold">240€+ / an</span>
                   </div>
                   <div className="flex items-center justify-between p-4 bg-black text-white rounded-2xl shadow-xl shadow-black/20">
                      <span className="font-bold">Free AI Atlas</span>
                      <span className="text-blue-400 font-bold">Toujours Gratuit</span>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* Section 2: Prompts/Communication */}
        <section className="grid md:grid-cols-2 gap-24 items-center px-4">
          <div className="order-2 md:order-1 relative">
             <div className="absolute -inset-10 bg-blue-600/5 rounded-full blur-[100px] -z-10" />
             <div className="space-y-6">
                <div className="p-6 bg-white rounded-3xl shadow-xl border border-black/5">
                   <p className="text-xs font-bold text-blue-600 mb-2 uppercase">Prompt Expert</p>
                   <p className="text-lg italic font-medium leading-relaxed">"Agis comme un directeur artistique senior. Transforme cette idée brute en un concept visuel néo-futuriste avec une palette de bleu minuit..."</p>
                </div>
                <div className="p-6 bg-white/50 rounded-3xl border border-black/5 ml-12">
                   <div className="flex items-center gap-3 text-slate-400">
                      <Terminal size={16} />
                      <span className="text-sm">Génération des résultats parfaits...</span>
                   </div>
                </div>
             </div>
          </div>
          <div className="order-1 md:order-2 space-y-8">
            <div className="w-16 h-16 rounded-3xl bg-blue-600/5 border border-blue-600/10 flex items-center justify-center text-blue-600">
              <Lightbulb size={32} />
            </div>
            <h2 className="text-5xl font-black leading-tight tracking-tighter">L'outil n'est rien sans la commande.</h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              La plupart des gens pensent que l'IA est médiocre parce qu'ils ne savent pas lui parler. Nous fournissons pour chaque outil des structures de prompts testées qui débloquent leur véritable potentiel. Vous ne recevez pas juste un lien, vous recevez le mode d'emploi.
            </p>
            <button onClick={() => navigate('/prompts')} className="flex items-center gap-2 font-bold text-black group">
              Découvrir les prompts <ArrowRight size={18} className="group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </section>

        {/* Section 3: Platforms for Creators */}
        <section className="text-center bg-black text-white p-20 rounded-[60px] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
          <h2 className="text-5xl font-black mb-8">Un écosystème pour les créateurs.</h2>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-16 leading-relaxed">
            Au-delà de l'IA, nous indexons les plateformes qui facilitent la vie des créateurs de contenu : design, montage, organisation et distribution. Tout ce dont vous avez besoin pour bâtir votre empire numérique.
          </p>
          <div className="flex justify-center gap-12 flex-wrap">
             <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center"><ImageIcon size={32} /></div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Visuels</span>
             </div>
             <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center"><Video size={32} /></div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Vidéo</span>
             </div>
             <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center"><Layers size={32} /></div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Système</span>
             </div>
          </div>
        </section>
      </div>

      {/* CTA Final */}
      <section className="text-center py-20">
         <h2 className="text-4xl font-black mb-12">Commencez votre ascension.</h2>
         <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => navigate('/ai')} className="px-10 h-16 bg-blue-600 text-white rounded-full font-black text-lg hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20">
              Explorer l'Atlas IA
            </button>
         </div>
      </section>
    </div>
  )
}

function ToolDirectory({ type, tools, loading }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Tous')

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    // Simple logic: if type is 'ai', filter tools that are in AI categories. 
    // In a real app, you might have a 'is_ai' boolean in Supabase.
    // For now, we'll assume any tool that has tags or categories like 'Texte/Image/Vidéo' might be AI.
    // We can refine this by checking the tool data.
    return tools.filter((t) => {
      const isAI = ['Texte', 'Image', 'Vidéo'].includes(t.category)
      const typeMatches = type === 'ai' ? isAI : !isAI
      const catMatches = category === 'Tous' || t.category === category
      return typeMatches && catMatches && (t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q))
    })
  }, [category, query, tools, type])

  const categories = useMemo(() => {
    if (type === 'ai') return ['Tous', 'Texte', 'Image', 'Vidéo']
    return ['Tous', 'Autre']
  }, [type])

  return (
    <div className="animate-fade">
      <header className="text-center mb-24 flex flex-col items-center">
        <div className="h-14 w-14 bg-black flex items-center justify-center rounded-2xl text-white mb-6">
          {type === 'ai' ? <Zap size={32} /> : <Settings size={32} />}
        </div>
        <h2 className="text-4xl sm:text-7xl font-black tracking-tighter mb-6">{type === 'ai' ? 'Atlas AI' : 'Creator Tools'}</h2>
        <p className="text-slate-500 text-xl max-w-xl mx-auto">
          {type === 'ai' ? 'Les cerveaux numériques les plus puissants en accès libre.' : 'Les plateformes essentielles pour bâtir et créer sans contraintes.'}
        </p>
      </header>

      <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16 border-b border-black/5 pb-12">
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${category === c ? 'bg-black text-white' : 'text-slate-500 hover:text-black border border-black/5'}`}>{c}</button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            placeholder="Rechercher..." 
            className="nexus-search"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin border-b-2 border-blue-600 rounded-full" />
        </div>
      ) : (
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(tool => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
      
      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest border border-dashed border-black/5 rounded-[40px]">
          Aucun outil indexé dans cette section
        </div>
      )}
    </div>
  )
}

function Prompts() {
  return (
    <div className="text-center animate-fade py-20">
      <div className="w-20 h-20 bg-black flex items-center justify-center text-white mx-auto mb-10 rounded-3xl shadow-xl">
        <Terminal size={40} />
      </div>
      <h2 className="text-4xl sm:text-7xl font-black tracking-tighter mb-8">Espace Prompts</h2>
      <p className="text-slate-500 text-xl max-w-2xl mx-auto mb-12">Le guide ultime pour parler aux IA. Nous préparons une bibliothèque de commandes prêtes à l'emploi pour transformer n'importe quel outil gratuit en expert.</p>
      <div className="p-24 border border-black/5 border-dashed rounded-[50px] flex flex-col items-center gap-4 text-slate-300">
        <Terminal size={32} />
        <span className="font-black uppercase tracking-[0.3em]">Déploiement imminent</span>
      </div>
    </div>
  )
}

function AdminView({ onAdd }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', tagline: '', category: 'Texte', url: '', pricing_note: 'Gratuit' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.from('ai_tools').insert(form).select().single()
    if (!error && data) {
      onAdd(data)
      navigate(form.category === 'Autre' ? '/tools' : '/ai')
    }
    setLoading(false)
  }

  return (
    <div className="animate-fade max-w-5xl mx-auto">
      <h2 className="text-5xl font-black text-center mb-16 tracking-tighter">Nouvelle Indexation</h2>
      <div className="nexus-dashboard">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-10" onSubmit={handleSubmit}>
          <div className="nexus-input-group">
            <label className="nexus-label">Nom du site ou service</label>
            <input required className="nexus-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div className="nexus-input-group">
            <label className="nexus-label">Catégorie principale</label>
            <select className="nexus-field" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              <option>Texte</option>
              <option>Image</option>
              <option>Vidéo</option>
              <option>Autre</option>
            </select>
          </div>
          <div className="md:col-span-2 nexus-input-group">
            <label className="nexus-label">Description SEO (Honnête & Courte)</label>
            <input required className="nexus-field" value={form.tagline} onChange={e => setForm({...form, tagline: e.target.value})} />
          </div>
          <div className="md:col-span-2 nexus-input-group">
            <label className="nexus-label">Lien Source Direct</label>
            <input required type="url" className="nexus-field" value={form.url} onChange={e => setForm({...form, url: e.target.value})} />
          </div>
          <div className="nexus-input-group">
            <label className="nexus-label">Status de gratuité</label>
            <input className="nexus-field" value={form.pricing_note} onChange={e => setForm({...form, pricing_note: e.target.value})} />
          </div>
          <button type="submit" disabled={loading} className="md:col-span-2 h-16 bg-blue-600 rounded-2xl font-black text-lg text-white hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95">
            {loading ? 'Indexation en cours...' : 'Ajouter à l\'Atlas'}
          </button>
        </form>
      </div>
    </div>
  )
}

function ToolCard({ tool }) {
  const Icon = { 'Texte': Type, 'Image': ImageIcon, 'Vidéo': Video }[tool.category] || Globe
  return (
    <div className="nexus-card group">
      <div className="flex items-start justify-between mb-8">
        <div className="h-14 w-14 rounded-2xl bg-black flex items-center justify-center text-white group-hover:bg-blue-600 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
          <Icon size={28} />
        </div>
        <a href={tool.url} target="_blank" rel="noreferrer" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-black hover:text-white transition-all duration-300"><ArrowUpRight size={24} /></a>
      </div>
      <h3 className="text-2xl font-black mb-4 group-hover:text-blue-600 transition-colors tracking-tight">{tool.name}</h3>
      <p className="text-slate-500 text-base leading-relaxed mb-10 line-clamp-2 h-12 font-medium">{tool.tagline}</p>
      <div className="pt-8 border-t border-black/5 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{tool.pricing_note}</span>
        <div className="px-3 py-1 rounded-full bg-slate-100 text-[9px] font-bold uppercase tracking-widest text-slate-500 border border-black/5">
          {tool.category}
        </div>
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer className="nexus-container py-20 border-t border-black/5 text-center">
       <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-8 w-8 bg-black flex items-center justify-center rounded-lg">
             <Command size={16} className="text-white" />
          </div>
          <span className="font-black tracking-tighter">Free AI Atlas</span>
       </div>
       <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
         © 2026 • L'excellence technologique pour tous
       </p>
    </footer>
  )
}

createRoot(document.getElementById('root')).render(<App />)
