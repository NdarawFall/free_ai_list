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
  Clock
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
  const words = ["RECHERCHE", "SÉLECTION", "OPTIMISATION", "ACCESSIBILITÉ", "CRÉATION"]

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
    }, 400)
    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <div className="cinematic-loader">
      <div className="flex items-center gap-3 mb-12">
        <Command size={24} className="text-black" />
        <span className="text-xl font-black tracking-tighter">Free AI Atlas</span>
      </div>
      <div className="loader-text-sequence">
        <span className="loader-word" style={{ transform: `translateY(-${index * 100}%)` }}>
          {words.map(w => <span key={w} className="h-12 sm:h-16 flex items-center justify-center">{w}</span>)}
        </span>
      </div>
      <div className="mt-12 w-1 w-1 bg-blue-600 rounded-full animate-ping" />
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
          <Sparkles size={14} /> Le QG des créateurs de contenu
        </div>
        <h1 className="nexus-h1 mb-12 max-w-5xl leading-[0.9]">
          Créez sans budget, <br />
          <span className="text-slate-400 italic">sans limites.</span>
        </h1>
        <p className="text-slate-500 text-xl max-w-2xl mx-auto leading-relaxed mb-16">
          Vous voulez lancer une chaîne <strong>Faceless YouTube</strong> ou devenir créateur de contenu mais les abonnements IA coûtent trop cher ? <br />
          J'ai fait les recherches pour vous. Voici l'index ultime des outils 100% gratuits.
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          <button onClick={() => navigate('/ai')} className="px-10 h-16 bg-black text-white rounded-full font-black text-lg hover:scale-105 transition-all shadow-2xl shadow-black/10">
            Voir les IA Gratuites
          </button>
          <button onClick={() => navigate('/prompts')} className="px-10 h-16 bg-white text-black border border-black/5 rounded-full font-black text-lg hover:bg-slate-50 transition-all">
            Masterclass Prompting
          </button>
        </div>
      </section>

      {/* The Vision Section */}
      <section className="grid lg:grid-cols-12 gap-16 items-start px-4">
        <div className="lg:col-span-7 space-y-12">
          <div className="inline-flex items-center gap-3 text-blue-600 font-bold uppercase tracking-widest text-xs">
            <CheckCircle2 size={18} /> Notre Mission
          </div>
          <h2 className="text-5xl sm:text-7xl font-black leading-tight tracking-tighter">
            Démocratiser l'intelligence <span className="text-gradient-blue">partout.</span>
          </h2>
          <p className="text-slate-500 text-xl leading-relaxed max-w-3xl">
            Surtout pour les jeunes créateurs en Afrique et ailleurs, 20$ par mois est une barrière infranchissable. 
            <strong> Free AI Atlas</strong> est né pour casser ce mur. Nous testons, vérifions et listons uniquement les outils qui ne vous demandent pas de carte bancaire pour être productif.
          </p>
          <div className="grid sm:grid-cols-2 gap-8">
             <div className="p-8 rounded-3xl bg-slate-50 border border-black/5">
                <h4 className="font-black text-xl mb-4">Recherche chirurgicale</h4>
                <p className="text-slate-500 text-sm">Je passe des heures à tester des plateformes obscures pour ne garder que la crème du gratuit.</p>
             </div>
             <div className="p-8 rounded-3xl bg-slate-50 border border-black/5">
                <h4 className="font-black text-xl mb-4">Prompting de survie</h4>
                <p className="text-slate-500 text-sm">Pas besoin de ChatGPT Plus si vous savez comment parler aux modèles gratuits. Je vous donne les clés.</p>
             </div>
          </div>
        </div>
        <div className="lg:col-span-5 relative">
           <div className="nexus-card bg-white p-12 border-none shadow-2xl">
              <div className="flex flex-col gap-8">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl">1</div>
                    <span className="font-black text-lg">Trouve ton outil</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xl">2</div>
                    <span className="font-black text-lg text-slate-400">Copie le Prompt Pro</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xl">3</div>
                    <span className="font-black text-lg text-slate-400">Crée ton contenu</span>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Creators Workflow Section */}
      <section className="bg-black text-white p-20 rounded-[80px] shadow-3xl overflow-hidden relative">
         <div className="absolute top-0 right-0 w-full h-full bg-blue-600/5 -z-10" />
         <div className="text-center mb-24">
            <h2 className="text-5xl sm:text-7xl font-black mb-8">L'Arsenal Faceless YouTube.</h2>
            <p className="text-slate-400 text-xl max-w-2xl mx-auto">Tout ce dont vous avez besoin pour lancer une chaîne rentable de A à Z, sans investir un seul euro au début.</p>
         </div>
         <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: Type, title: "Script & Histoire", desc: "IA textuelles pour la narration." },
              { icon: Video, title: "Génération Vidéo", desc: "Clips et animations 100% gratuits." },
              { icon: ImageIcon, title: "Miniatures & Art", desc: "Designs pro sans Photoshop." }
            ].map(item => (
              <div key={item.title} className="p-10 rounded-[40px] bg-white/5 border border-white/5 text-center">
                 <item.icon size={48} className="mx-auto mb-6 text-blue-500" />
                 <h4 className="text-2xl font-black mb-4">{item.title}</h4>
                 <p className="text-slate-500 text-sm">{item.desc}</p>
              </div>
            ))}
         </div>
      </section>

      {/* Prompts Section teaser */}
      <section className="grid md:grid-cols-2 gap-24 items-center px-4">
        <div className="space-y-8">
          <div className="w-16 h-16 rounded-3xl bg-blue-600/5 border border-blue-600/10 flex items-center justify-center text-blue-600">
            <Lightbulb size={32} />
          </div>
          <h2 className="text-5xl font-black leading-tight tracking-tighter text-gradient-blue">Le pouvoir des mots.</h2>
          <p className="text-slate-500 text-xl leading-relaxed">
            La différence entre un résultat médiocre et un chef-d'œuvre, c'est le prompt. Je teste chaque commande pour m'assurer qu'elle fonctionne parfaitement avec les versions gratuites.
          </p>
          <button onClick={() => navigate('/prompts')} className="flex items-center gap-2 font-bold text-black group text-lg">
            Voir la bibliothèque <ArrowRight size={22} className="group-hover:translate-x-1 transition-all" />
          </button>
        </div>
        <div className="p-12 rounded-[50px] bg-slate-50 border border-black/5 font-mono text-sm space-y-4">
           <div className="flex gap-2 mb-6">
              <div className="w-3 h-3 bg-red-400 rounded-full" />
              <div className="w-3 h-3 bg-yellow-400 rounded-full" />
              <div className="w-3 h-3 bg-green-400 rounded-full" />
           </div>
           <p className="text-blue-600 font-bold">// PROMPT OPTIMISÉ POUR MODÈLES GRATUITS</p>
           <p className="text-slate-400">"Construis une structure de vidéo YouTube captivante en utilisant la psychologie de l'attention..."</p>
           <div className="h-1 w-full bg-black/5 rounded-full" />
           <div className="h-1 w-3/4 bg-black/5 rounded-full" />
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
        <div className="h-14 w-14 bg-black flex items-center justify-center rounded-2xl text-white mb-6 shadow-xl">
          {type === 'ai' ? <Zap size={32} /> : <Settings size={32} />}
        </div>
        <h2 className="text-5xl sm:text-8xl font-black tracking-tighter mb-6">{type === 'ai' ? 'Atlas AI' : 'Outils Créateurs'}</h2>
        <p className="text-slate-500 text-xl max-w-xl mx-auto">
          {type === 'ai' ? 'Les cerveaux numériques accessibles à tous.' : 'Bientôt disponible.'}
        </p>
      </header>

      <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16 border-b border-black/5 pb-12">
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${category === c ? 'bg-black text-white shadow-xl' : 'text-slate-500 hover:text-black border border-black/5'}`}>{c}</button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            placeholder="Chercher..." 
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
          Aucune pépite trouvée ici
        </div>
      )}
    </div>
  )
}

function ToolsPlaceholder() {
  return (
    <div className="text-center py-32 animate-fade flex flex-col items-center">
       <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center text-slate-300 mb-12 border border-black/5">
          <Settings size={48} className="animate-spin" style={{ animationDuration: '4s' }} />
       </div>
       <h2 className="text-5xl font-black tracking-tighter mb-6">Section en cours de curation</h2>
       <p className="text-slate-500 text-xl max-w-xl mx-auto mb-12">Je suis en train de tester les meilleures plateformes de montage, de gestion et de distribution gratuites pour vous offrir un arsenal complet.</p>
       <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-100 text-slate-400 font-bold uppercase tracking-widest text-xs">
          <Clock size={16} /> Déploiement prochainement
       </div>
    </div>
  )
}

function Prompts() {
  return (
    <div className="text-center animate-fade py-20">
      <div className="w-20 h-20 bg-black flex items-center justify-center text-white mx-auto mb-10 rounded-3xl shadow-2xl">
        <Terminal size={40} />
      </div>
      <h2 className="text-5xl sm:text-8xl font-black tracking-tighter mb-8 italic text-gradient-blue">Espace Prompts</h2>
      <p className="text-slate-500 text-xl max-w-2xl mx-auto mb-16">Le guide ultime pour parler aux IA. Nous préparons une bibliothèque de commandes prêtes à l'emploi pour transformer n'importe quel outil gratuit en expert.</p>
      <div className="p-32 border-2 border-black/5 border-dashed rounded-[60px] flex flex-col items-center gap-6 text-slate-300">
        <Coffee size={48} />
        <span className="font-black uppercase tracking-[0.4em] text-sm">On prépare le café, ça arrive...</span>
      </div>
    </div>
  )
}

function Blog() {
  const posts = [
    { title: "Comment lancer un Faceless YouTube sans dépenser 1€", date: "20 Mai 2026", category: "Stratégie" },
    { title: "Les 5 meilleures alternatives gratuites à Midjourney", date: "18 Mai 2026", category: "IA Image" },
    { title: "Pourquoi le prompt engineering est le nouveau super-pouvoir", date: "15 Mai 2026", category: "Formation" }
  ]

  return (
    <div className="animate-fade">
      <header className="text-center mb-32">
        <h2 className="text-5xl sm:text-8xl font-black tracking-tighter mb-8">Le Blog Atlas</h2>
        <p className="text-slate-500 text-xl max-w-2xl mx-auto">Guides, stratégies et actualités pour les créateurs de contenu modernes.</p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
        {posts.map((post, i) => (
          <div key={i} className="blog-card group">
            <div className="blog-image-placeholder">
               <ImageIcon size={48} />
            </div>
            <div className="flex items-center gap-4 mb-4">
               <span className="px-3 py-1 rounded-full bg-blue-600/5 text-[10px] font-black uppercase text-blue-600 border border-blue-600/10">{post.category}</span>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{post.date}</span>
            </div>
            <h3 className="text-2xl font-black leading-tight mb-6 group-hover:text-blue-600 transition-colors">{post.title}</h3>
            <button className="flex items-center gap-2 font-bold text-sm text-black">
               Lire la suite <ArrowRight size={16} />
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
            <label className="nexus-label">Description (Honnête & Courte)</label>
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
          <button type="submit" disabled={loading} className="md:col-span-2 h-16 bg-blue-600 rounded-[24px] font-black text-lg text-white hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95">
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
      <div className="flex items-start justify-between mb-10">
        <div className="h-16 w-16 rounded-[22px] bg-slate-50 border border-black/5 flex items-center justify-center text-black group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm">
          <Icon size={32} />
        </div>
        <a href={tool.url} target="_blank" rel="noreferrer" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-black hover:text-white transition-all duration-300 shadow-sm"><ArrowUpRight size={24} /></a>
      </div>
      <h3 className="text-3xl font-black mb-4 group-hover:text-blue-600 transition-colors tracking-tighter">{tool.name}</h3>
      <p className="text-slate-500 text-base leading-relaxed mb-12 line-clamp-2 h-12 font-medium">{tool.tagline}</p>
      <div className="pt-8 border-t border-black/5 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">{tool.pricing_note}</span>
        <div className="px-3 py-1 rounded-full bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 border border-black/5 group-hover:bg-blue-50 transition-colors">
          {tool.category}
        </div>
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer className="nexus-container py-24 border-t border-black/5 text-center">
       <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-10 w-10 bg-black flex items-center justify-center rounded-xl shadow-xl">
             <Command size={20} className="text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter">Free AI Atlas</span>
       </div>
       <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.4em] mb-12">
         Démocratiser la création numérique.
       </p>
       <div className="flex justify-center gap-8 text-[11px] font-bold uppercase tracking-widest text-slate-500">
          <a href="#" className="hover:text-black">Confidentialité</a>
          <a href="#" className="hover:text-black">Éthique</a>
       </div>
    </footer>
  )
}

createRoot(document.getElementById('root')).render(<App />)
