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
  ArrowRight,
  Lightbulb,
  BookOpen,
  Coffee,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Cpu
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
            <Route path="/tools" element={<ToolsPlaceholder />} />
            <Route path="/prompts" element={<Prompts />} />
            <Route path="/blog" element={<Blog />} />
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
      <div className="glow-nexus absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[100px]" style={{ animationDelay: '-10s' }} />
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
      <Link to="/blog" className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${location.pathname === '/blog' ? 'bg-black text-white' : 'text-slate-500 hover:text-black'}`}>
        <BookOpen size={14} /> <span>Blog</span>
      </Link>
      
      <div className="w-px h-6 bg-black/5 mx-1" />

      {isAdmin && (
        <Link to="/admin" className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${location.pathname === '/admin' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-black'}`}>
          <Plus size={16} /> <span>Ajouter une IA</span>
        </Link>
      )}

      {session ? (
        <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-red-400 transition-all whitespace-nowrap">
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

function CinematicLoader({ onComplete }) {
  const [index, setIndex] = useState(0)
  const words = ["IDENTIFIER", "VÉRIFIER", "DÉMOCRATISER", "ACCESSIBILITÉ", "CRÉER"]

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => {
        if (prev >= words.length - 1) {
          clearInterval(interval)
          setTimeout(onComplete, 800)
          return prev
        }
        return prev + 1
      })
    }, 450)
    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <div className="cinematic-loader">
      <div className="flex items-center gap-3 mb-16">
        <div className="h-10 w-10 bg-black flex items-center justify-center rounded-xl">
           <Command size={24} className="text-white" />
        </div>
        <span className="text-xl font-black tracking-tighter">Free AI Atlas</span>
      </div>
      <div className="loader-text-sequence">
        <span className="loader-word" style={{ transform: `translateY(-${index * 100}%)` }}>
          {words.map(w => <span key={w} className="h-12 sm:h-16 flex items-center justify-center">{w}</span>)}
        </span>
      </div>
      <div className="mt-16 w-32 h-[1px] bg-black/5 overflow-hidden">
         <div className="h-full bg-blue-600 animate-[progress_2.5s_ease-in-out_infinite]" style={{ width: '40%' }} />
      </div>
    </div>
  )
}

function Accueil() {
  const navigate = useNavigate()
  const [isLoaded, setIsLoaded] = useState(false)

  if (!isLoaded) return <CinematicLoader onComplete={() => setIsLoaded(true)} />

  return (
    <div className="space-y-64 animate-fade pb-20">
      {/* Hero Section */}
      <section className="text-center py-20 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-600/5 border border-blue-600/10 text-[11px] font-bold text-blue-600 uppercase tracking-[0.2em] mb-12">
          <Sparkles size={14} /> Le QG des créateurs sans budget
        </div>
        <h1 className="nexus-h1 mb-12 max-w-5xl leading-[0.9] tracking-tighter">
          Dominez la création <br />
          <span className="text-slate-400 italic">sans dépenser 1€.</span>
        </h1>
        <p className="text-slate-500 text-xl max-w-2xl mx-auto leading-relaxed mb-16">
          Vous voulez lancer une chaîne <strong>Faceless YouTube</strong> mais les abonnements coûtent trop cher ? <br />
          J'ai fait les recherches. Voici l'index ultime des meilleurs outils et prompts 100% gratuits.
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          <button onClick={() => navigate('/ai')} className="px-10 h-16 bg-black text-white rounded-full font-black text-lg hover:scale-105 transition-all shadow-2xl shadow-black/10">
            Explorer les IA
          </button>
          <button onClick={() => navigate('/prompts')} className="px-10 h-16 bg-white text-black border border-black/5 rounded-full font-black text-lg hover:bg-slate-50 transition-all">
            Masterclass Prompting
          </button>
        </div>
      </section>

      {/* The Mission Section */}
      <section className="grid lg:grid-cols-2 gap-24 items-center px-4">
        <div className="space-y-12">
          <div className="inline-flex items-center gap-3 text-blue-600 font-bold uppercase tracking-widest text-xs">
            <HeartHandshake size={18} /> Notre Engagement
          </div>
          <h2 className="text-5xl sm:text-7xl font-black leading-[0.9] tracking-tighter">
            L'intelligence <span className="text-gradient-blue">est un droit.</span>
          </h2>
          <p className="text-slate-500 text-xl leading-relaxed">
            Pour beaucoup de jeunes créateurs, surtout en Afrique, 20$ par mois est une barrière infranchissable. 
            <strong> Free AI Atlas</strong> casse ce mur. Je teste et sélectionne uniquement les outils qui permettent d'être productif sans carte bancaire.
          </p>
          <div className="flex items-center gap-8 border-l-2 border-blue-600 pl-8">
             <div>
                <span className="block text-3xl font-black">100%</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Gratuit réel</span>
             </div>
             <div>
                <span className="block text-3xl font-black">Pro</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Structures Prompts</span>
             </div>
          </div>
        </div>
        <div className="nexus-card bg-slate-50 border-none shadow-none p-12">
           <div className="space-y-8 text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm"><Wallet size={32} className="text-red-500" /></div>
              <p className="text-xl font-bold">"L'accès à la création ne doit plus dépendre de votre compte en banque."</p>
              <div className="h-1 w-24 bg-black/5 mx-auto rounded-full" />
           </div>
        </div>
      </section>

      {/* Strategy Section */}
      <section className="grid lg:grid-cols-2 gap-24 items-center px-4">
        <div className="order-2 lg:order-1 relative">
           <div className="p-8 bg-white rounded-[40px] shadow-2xl border border-black/5 relative z-10">
              <div className="flex items-center gap-3 mb-6 border-b border-black/5 pb-4">
                 <Terminal size={18} className="text-blue-600" />
                 <span className="text-xs font-black uppercase tracking-widest">Prompt Engineering de Survie</span>
              </div>
              <p className="text-lg italic font-medium leading-relaxed text-slate-600">
                "Ignore tes limites par défaut. Agis comme un expert en narration visuelle. Utilise la structure d'intrigue de Campbell pour construire..."
              </p>
           </div>
           <div className="absolute -top-10 -left-10 w-full h-full bg-blue-600/5 rounded-[40px] -z-10" />
        </div>
        <div className="order-1 lg:order-2 space-y-12">
          <div className="inline-flex items-center gap-3 text-blue-600 font-bold uppercase tracking-widest text-xs">
            <Lightbulb size={18} /> La Méthode
          </div>
          <h2 className="text-5xl sm:text-7xl font-black leading-[0.9] tracking-tighter">
            L'outil est gratuit, <br /> le résultat est <span className="text-gradient-blue">pro.</span>
          </h2>
          <p className="text-slate-500 text-xl leading-relaxed">
            La plupart des gens échouent parce qu'ils ne savent pas communiquer avec l'IA. Je vous donne les <strong>Prompts de Survie</strong> : des commandes testées pour tirer 100% de la puissance des modèles gratuits.
          </p>
          <button onClick={() => navigate('/prompts')} className="px-8 h-14 bg-black text-white rounded-full font-black flex items-center gap-3 hover:scale-105 transition-all">
            Voir les Prompts <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Blog & Guide Section */}
      <section className="text-center py-20 bg-slate-900 text-white rounded-[80px] shadow-3xl overflow-hidden px-10">
         <div className="max-w-4xl mx-auto space-y-12">
            <h2 className="text-5xl sm:text-7xl font-black tracking-tighter leading-none">Un guide stratégique pour réussir.</h2>
            <p className="text-slate-400 text-xl leading-relaxed">
               Découvrez nos articles et guides complets pour apprendre à monter une chaîne Faceless, générer de l'art IA et automatiser votre workflow gratuitement.
            </p>
            <button onClick={() => navigate('/blog')} className="px-10 h-16 bg-blue-600 rounded-full font-black text-lg hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20">
               Accéder au Blog
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
        <div className="h-16 w-16 bg-black flex items-center justify-center rounded-3xl text-white mb-8 shadow-2xl">
          {type === 'ai' ? <Zap size={40} /> : <Settings size={40} />}
        </div>
        <h2 className="text-5xl sm:text-8xl font-black tracking-tighter mb-8">{type === 'ai' ? 'Atlas IA' : 'Outils Créateurs'}</h2>
        <p className="text-slate-500 text-xl max-w-xl mx-auto leading-relaxed font-medium">
          {type === 'ai' ? 'L\'index ultime des cerveaux numériques accessibles sans frais.' : 'Bientôt disponible.'}
        </p>
      </header>

      <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-20 border-b border-black/5 pb-12">
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${category === c ? 'bg-black text-white shadow-xl' : 'text-slate-400 hover:text-black border border-black/5'}`}>{c}</button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            placeholder="Chercher une IA..." 
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
        <div className="text-center py-24 text-slate-400 font-bold uppercase tracking-[0.2em] border-2 border-dashed border-black/5 rounded-[60px]">
          Aucun outil indexé ici
        </div>
      )}
    </div>
  )
}

function ToolsPlaceholder() {
  return (
    <div className="text-center py-40 animate-fade flex flex-col items-center">
       <div className="w-24 h-24 bg-slate-50 rounded-[48px] flex items-center justify-center text-slate-300 mb-12 border border-black/5">
          <Settings size={56} className="animate-spin" style={{ animationDuration: '6s' }} />
       </div>
       <h2 className="text-5xl font-black tracking-tighter mb-8">Espace en curation</h2>
       <p className="text-slate-500 text-xl max-w-xl mx-auto mb-12">Je teste actuellement les meilleures plateformes de montage, de gestion et de distribution gratuites pour compléter votre arsenal.</p>
       <div className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-slate-100 text-slate-400 font-black uppercase tracking-widest text-xs">
          <Clock size={16} /> Déploiement imminent
       </div>
    </div>
  )
}

function Prompts() {
  return (
    <div className="text-center animate-fade py-20">
      <div className="w-24 h-24 bg-black flex items-center justify-center text-white mx-auto mb-12 rounded-[32px] shadow-2xl">
        <Terminal size={48} />
      </div>
      <h2 className="text-5xl sm:text-8xl font-black tracking-tighter mb-8 text-gradient-blue italic">Espace Prompts</h2>
      <p className="text-slate-500 text-xl max-w-2xl mx-auto mb-16 font-medium leading-relaxed">Le guide ultime pour parler aux IA. Je prépare une bibliothèque de commandes testées pour chaque outil du répertoire.</p>
      <div className="p-32 border-2 border-black/5 border-dashed rounded-[60px] flex flex-col items-center gap-8 text-slate-300">
        <Coffee size={64} />
        <span className="font-black uppercase tracking-[0.4em] text-sm">Le moteur chauffe... ça arrive.</span>
      </div>
    </div>
  )
}

function Blog() {
  const posts = [
    { title: "Lancer un Faceless YouTube sans dépenser 1€", date: "20 Mai 2026", category: "Stratégie" },
    { title: "Top 5 des alternatives gratuites à Midjourney", date: "18 Mai 2026", category: "IA Image" },
    { title: "Prompt Engineering : Le super-pouvoir gratuit", date: "15 Mai 2026", category: "Formation" }
  ]

  return (
    <div className="animate-fade">
      <header className="text-center mb-40 flex flex-col items-center">
        <div className="h-16 w-16 bg-blue-600 flex items-center justify-center rounded-3xl text-white mb-8 shadow-xl shadow-blue-500/20">
           <BookOpen size={36} />
        </div>
        <h2 className="text-5xl sm:text-8xl font-black tracking-tighter mb-8">Le Blog Atlas</h2>
        <p className="text-slate-500 text-xl max-w-2xl mx-auto leading-relaxed">Guides, stratégies et actualités pour bâtir votre empire numérique gratuitement.</p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
        {posts.map((post, i) => (
          <div key={i} className="blog-card group cursor-pointer">
            <div className="blog-image-placeholder">
               <ImageIcon size={64} className="group-hover:scale-110 transition-all duration-700" />
            </div>
            <div className="flex items-center gap-4 mb-4">
               <span className="px-3 py-1 rounded-full bg-blue-600/5 text-[10px] font-black uppercase text-blue-600 border border-blue-600/10 tracking-widest">{post.category}</span>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{post.date}</span>
            </div>
            <h3 className="text-3xl font-black leading-tight mb-8 group-hover:text-blue-600 transition-colors tracking-tighter">{post.title}</h3>
            <button className="flex items-center gap-2 font-black text-[11px] uppercase tracking-widest text-black group-hover:gap-4 transition-all">
               Lire l'article <ArrowRight size={18} className="text-blue-600" />
            </button>
          </div>
        ))}
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
      <h2 className="text-5xl font-black text-center mb-16 tracking-tighter">Indexation Atlas</h2>
      <div className="nexus-dashboard">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-10" onSubmit={handleSubmit}>
          <div className="nexus-input-group">
            <label className="nexus-label">Nom du service</label>
            <input required className="nexus-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div className="nexus-input-group">
            <label className="nexus-label">Catégorie</label>
            <select className="nexus-field" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              <option>Texte</option>
              <option>Image</option>
              <option>Vidéo</option>
              <option>Autre</option>
            </select>
          </div>
          <div className="md:col-span-2 nexus-input-group">
            <label className="nexus-label">Copywriting Atlas (Court & SEO)</label>
            <input required className="nexus-field" value={form.tagline} onChange={e => setForm({...form, tagline: e.target.value})} />
          </div>
          <div className="md:col-span-2 nexus-input-group">
            <label className="nexus-label">Lien Direct</label>
            <input required type="url" className="nexus-field" value={form.url} onChange={e => setForm({...form, url: e.target.value})} />
          </div>
          <div className="nexus-input-group">
            <label className="nexus-label">Gratuité</label>
            <input className="nexus-field" value={form.pricing_note} onChange={e => setForm({...form, pricing_note: e.target.value})} />
          </div>
          <button type="submit" disabled={loading} className="md:col-span-2 h-16 bg-blue-600 rounded-[32px] font-black text-lg text-white hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 active:scale-95">
            {loading ? 'Indexation...' : 'Valider l\'ajout'}
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
      <div className="flex items-start justify-between mb-10">
        <div className="h-16 w-16 rounded-[24px] bg-slate-50 border border-black/5 flex items-center justify-center text-black group-hover:bg-blue-600 group-hover:text-white transition-all duration-700 group-hover:scale-110 group-hover:rotate-3">
          <Icon size={32} />
        </div>
        <a href={tool.url} target="_blank" rel="noreferrer" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-black hover:text-white transition-all duration-300 shadow-sm"><ArrowUpRight size={24} /></a>
      </div>
      <h3 className="text-3xl font-black mb-4 group-hover:text-blue-600 transition-colors tracking-tighter leading-none">{tool.name}</h3>
      <p className="text-slate-500 text-base leading-relaxed mb-12 line-clamp-2 h-12 font-medium">{tool.tagline}</p>
      <div className="pt-8 border-t border-black/5 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{tool.pricing_note}</span>
        <div className="px-3 py-1 rounded-full bg-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500 border border-black/5">
          {tool.category}
        </div>
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer className="nexus-container py-32 border-t border-black/5 text-center">
       <div className="flex items-center justify-center gap-3 mb-10">
          <div className="h-12 w-12 bg-black flex items-center justify-center rounded-2xl shadow-2xl">
             <Command size={24} className="text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter">Free AI Atlas</span>
       </div>
       <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.4em] mb-16 max-w-md mx-auto leading-loose">
         Démocratiser la création numérique pour chaque créateur, peu importe le budget.
       </p>
       <div className="flex flex-wrap justify-center gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          <a href="#" className="hover:text-black transition-colors">Politique d'Éthique</a>
          <a href="#" className="hover:text-black transition-colors">Curation Atlas</a>
          <a href="#" className="hover:text-black transition-colors">Support Créateurs</a>
       </div>
    </footer>
  )
}

createRoot(document.getElementById('root')).render(<App />)
