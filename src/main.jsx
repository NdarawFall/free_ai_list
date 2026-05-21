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
  Wallet,
  Settings,
  ArrowRight,
  Lightbulb,
  BookOpen,
  Coffee,
  HeartHandshake,
  Sun,
  Moon,
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
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')

  // Theme Toggle Logic
  useEffect(() => {
    const root = window.document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

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
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light')

  return (
    <Router>
      <div className="min-h-screen transition-colors duration-500 overflow-x-hidden">
        <BackgroundEffects />
        <Navbar session={session} isAdmin={isAdmin} theme={theme} toggleTheme={toggleTheme} />
        
        <main className="nexus-container pt-32 pb-24 relative z-10">
          <Routes>
            <Route path="/" element={<Accueil />} />
            <Route path="/ai" element={<ToolDirectory tools={tools} loading={loading} />} />
            <Route path="/tools" element={<ComingSoon title="Outils Créateurs" icon={Settings} />} />
            <Route path="/prompts" element={<ComingSoon title="Espace Prompts" icon={Terminal} />} />
            <Route path="/blog" element={<ComingSoon title="Le Blog Atlas" icon={BookOpen} />} />
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
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      <div className="glow-nexus absolute -top-[5%] -left-[5%] w-[600px] h-[600px] bg-blue-600 rounded-full" />
      <div className="glow-nexus absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] bg-blue-400 rounded-full" style={{ animationDelay: '-12s' }} />
    </div>
  )
}

function Navbar({ session, isAdmin, theme, toggleTheme }) {
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
      <Link to="/" className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${location.pathname === '/' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-slate-500 hover:text-black dark:hover:text-white'}`}>
        <Home size={14} /> <span>Accueil</span>
      </Link>
      <Link to="/ai" className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${location.pathname === '/ai' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-slate-500 hover:text-black dark:hover:text-white'}`}>
        <Zap size={14} /> <span>AI</span>
      </Link>
      <Link to="/tools" className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${location.pathname === '/tools' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-slate-500 hover:text-black dark:hover:text-white'}`}>
        <Settings size={14} /> <span>Tools</span>
      </Link>
      <Link to="/prompts" className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${location.pathname === '/prompts' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-slate-500 hover:text-black dark:hover:text-white'}`}>
        <Terminal size={14} /> <span>Prompts</span>
      </Link>
      <Link to="/blog" className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${location.pathname === '/blog' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-slate-500 hover:text-black dark:hover:text-white'}`}>
        <BookOpen size={14} /> <span>Blog</span>
      </Link>
      
      <div className="w-px h-6 bg-black/10 dark:bg-white/10 mx-1" />

      <button onClick={toggleTheme} className="p-2 rounded-full text-slate-500 hover:text-black dark:hover:text-white transition-all">
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      </button>

      <div className="w-px h-6 bg-black/10 dark:bg-white/10 mx-1" />

      {isAdmin && (
        <Link to="/admin" className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${location.pathname === '/admin' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-black dark:hover:text-white'}`}>
          <Plus size={16} /> <span>Ajouter IA</span>
        </Link>
      )}

      {session ? (
        <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider text-slate-400 hover:text-red-400 transition-all whitespace-nowrap">
          <LogOut size={14} /> <span>Déconnexion</span>
        </button>
      ) : (
        <button onClick={handleLogin} className="flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider bg-black/5 hover:bg-black/10 transition-all whitespace-nowrap">
           <div className="w-4 h-4 bg-black rounded-full flex items-center justify-center text-[10px] font-bold text-white italic">G</div>
           <span>Connexion Admin</span>
        </button>
      )}
    </nav>
  )
}

function Accueil() {
  const navigate = useNavigate()
  return (
    <div className="space-y-64 animate-fade pb-20">
      {/* Hero Section */}
      <section className="text-center py-20 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-600/5 border border-blue-600/10 text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] mb-12">
          <Sparkles size={14} /> Le QG des créateurs sans budget
        </div>
        <h1 className="nexus-h1 mb-12 max-w-5xl tracking-tighter">
          Dominez la création <br />
          <span className="text-slate-400 italic dark:text-slate-600">sans dépenser 1€.</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed mb-16 font-medium">
          Lancer une chaîne YouTube ou devenir créateur coûte cher en abonnements. <br />
          J'ai fait les recherches : voici l'index ultime des meilleurs outils et prompts 100% gratuits.
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          <button onClick={() => navigate('/ai')} className="px-10 h-16 bg-black text-white dark:bg-white dark:text-black rounded-full font-black text-lg hover:scale-105 transition-all shadow-2xl">
            Explorer les IA
          </button>
          <button onClick={() => navigate('/prompts')} className="px-10 h-16 bg-white dark:bg-slate-900 text-black dark:text-white border border-black/5 dark:border-white/5 rounded-full font-black text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            Masterclass Prompting
          </button>
        </div>
      </section>

      {/* Mission Section */}
      <section className="grid lg:grid-cols-2 gap-24 items-center px-4">
        <div className="space-y-12">
          <div className="inline-flex items-center gap-3 text-blue-600 font-bold uppercase tracking-widest text-xs">
            <HeartHandshake size={18} /> Notre Engagement
          </div>
          <h2 className="text-5xl sm:text-7xl font-black leading-[0.9] tracking-tighter">
            L'intelligence <span className="text-gradient-blue">est un droit.</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xl leading-relaxed">
            Pour beaucoup, 20$/mois est une barrière infranchissable. 
            <strong> Free AI Atlas</strong> casse ce mur. Je sélectionne uniquement les outils qui permettent d'être pro sans carte bancaire.
          </p>
          <div className="flex items-center gap-8 border-l-2 border-blue-600 pl-8">
             <div>
                <span className="block text-3xl font-black">100%</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Gratuit réel</span>
             </div>
             <div>
                <span className="block text-3xl font-black">PRO</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Structures Prompts</span>
             </div>
          </div>
        </div>
        <div className="nexus-card p-12 shadow-none border-none bg-slate-100 dark:bg-white/5">
           <div className="space-y-8 text-center">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm"><Wallet size={32} className="text-red-500" /></div>
              <p className="text-xl font-bold">"L'accès à la création ne doit plus dépendre de votre compte en banque."</p>
              <div className="h-1 w-24 bg-black/5 dark:bg-white/5 mx-auto rounded-full" />
           </div>
        </div>
      </section>

      {/* Action Section */}
      <section className="text-center py-20 bg-blue-600 rounded-[80px] shadow-3xl text-white px-10 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-full h-full bg-black/10 -z-10" />
         <h2 className="text-4xl sm:text-7xl font-black mb-12 tracking-tighter">Prêt à bâtir votre empire ?</h2>
         <button onClick={() => navigate('/ai')} className="px-12 h-16 bg-white text-black rounded-full font-black text-lg hover:scale-105 transition-all shadow-2xl">
            Commencer l'exploration
         </button>
      </section>
    </div>
  )
}

function ToolDirectory({ tools, loading }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Tous')

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return tools.filter((t) => {
      const isAI = ['Texte', 'Image', 'Vidéo'].includes(t.category)
      const catMatches = category === 'Tous' || t.category === category
      return isAI && catMatches && (t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q))
    })
  }, [category, query, tools])

  return (
    <div className="animate-fade">
      <header className="text-center mb-24 flex flex-col items-center">
        <div className="h-16 w-16 bg-black dark:bg-white flex items-center justify-center rounded-3xl text-white dark:text-black mb-8 shadow-2xl">
          <Zap size={40} />
        </div>
        <h2 className="text-5xl sm:text-8xl font-black tracking-tighter mb-8">Atlas AI</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xl max-w-xl mx-auto font-medium">L'index ultime des cerveaux numériques accessibles sans frais.</p>
      </header>

      <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-20 border-b border-[var(--nexus-border)] pb-12">
        <div className="flex flex-wrap justify-center gap-2">
          {['Tous', 'Texte', 'Image', 'Vidéo'].map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`nexus-pill ${category === c ? 'active' : ''}`}>{c}</button>
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
        <div className="text-center py-24 text-slate-400 font-black uppercase tracking-[0.2em] border-2 border-dashed border-[var(--nexus-border)] rounded-[60px]">
          Aucune pépite trouvée
        </div>
      )}
    </div>
  )
}

function ComingSoon({ title, icon: Icon }) {
  return (
    <div className="text-center py-40 animate-fade flex flex-col items-center">
       <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-[48px] flex items-center justify-center text-slate-300 mb-12 border border-[var(--nexus-border)]">
          <Icon size={48} className="animate-pulse" />
       </div>
       <h2 className="text-5xl sm:text-8xl font-black tracking-tighter mb-8">{title}</h2>
       <p className="text-slate-500 dark:text-slate-400 text-xl max-w-xl mx-auto mb-12 font-medium">Je suis en train de tester les meilleures ressources pour vous offrir un arsenal complet et gratuit. Un peu de patience, l'Atlas s'agrandit.</p>
       <div className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-blue-600/5 dark:bg-blue-600/10 text-blue-600 font-black uppercase tracking-widest text-xs">
          <Clock size={16} /> Curation en cours...
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
      navigate('/ai')
    }
    setLoading(false)
  }

  return (
    <div className="animate-fade max-w-5xl mx-auto">
      <h2 className="text-5xl font-black text-center mb-16 tracking-tighter uppercase italic">Indexation</h2>
      <div className="nexus-dashboard">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-10" onSubmit={handleSubmit}>
          <div className="nexus-input-group">
            <label className="nexus-label">Nom du service</label>
            <input required className="nexus-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div className="nexus-input-group">
            <label className="nexus-label">Catégorie</label>
            <select className="nexus-field" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              <option>Texte</option><option>Image</option><option>Vidéo</option><option>Autre</option>
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
          <button type="submit" disabled={loading} className="md:col-span-2 h-16 bg-blue-600 rounded-[32px] font-black text-lg text-white hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95">
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
      <div className="flex items-start justify-between mb-10 relative z-10">
        <div className="h-16 w-16 rounded-[24px] bg-slate-50 dark:bg-slate-800 border border-[var(--nexus-border)] flex items-center justify-center text-[var(--nexus-fg)] group-hover:bg-blue-600 group-hover:text-white transition-all duration-700 group-hover:scale-110 group-hover:rotate-3 shadow-sm">
          <Icon size={32} />
        </div>
        <a href={tool.url} target="_blank" rel="noreferrer" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 shadow-sm"><ArrowUpRight size={24} /></a>
      </div>
      <h3 className="text-3xl font-black mb-4 group-hover:text-blue-600 transition-colors tracking-tighter leading-none relative z-10">{tool.name}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed mb-12 line-clamp-2 h-12 font-medium relative z-10">{tool.tagline}</p>
      <div className="pt-8 border-t border-[var(--nexus-border)] flex items-center justify-between relative z-10">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{tool.pricing_note}</span>
        <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest text-slate-500 border border-[var(--nexus-border)] group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors">
          {tool.category}
        </div>
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer className="nexus-container py-32 border-t border-[var(--nexus-border)] text-center relative z-10">
       <div className="flex items-center justify-center gap-3 mb-10">
          <div className="h-12 w-12 bg-black dark:bg-white flex items-center justify-center rounded-2xl shadow-2xl">
             <Command size={24} className="text-white dark:text-black" />
          </div>
          <span className="text-2xl font-black tracking-tighter">Free AI Atlas</span>
       </div>
       <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.4em] mb-16 max-w-md mx-auto leading-loose">
         Démocratiser la création numérique pour chaque créateur, peu importe le budget.
       </p>
       <div className="flex flex-wrap justify-center gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Politique d'Éthique</a>
          <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Curation Atlas</a>
          <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Support Créateurs</a>
       </div>
    </footer>
  )
}

createRoot(document.getElementById('root')).render(<App />)
