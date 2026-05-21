import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createClient } from '@supabase/supabase-js'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { Zap, Terminal, BookOpen, Plus, Sun, Moon, LogOut, Home, ArrowUpRight, Search, Settings, Sparkles, Wallet, Lightbulb, MessageSquare, ArrowRight } from 'lucide-react'
import './styles.css'

// Supabase Setup
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xnilbpzflfsimnkqxmog.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_M7ILY-6b_MRYuu4l3BXLOA_TQEPKTyA'
const ADMIN_EMAIL = 'ndarawpro@gmail.com'
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null

function App() {
  const [tools, setTools] = useState([])
  const [session, setSession] = useState(null)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')

  useEffect(() => {
    document.documentElement.className = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    supabase.auth.onAuthStateChange((_, session) => setSession(session))
    supabase.from('ai_tools').select('*').order('name').then(({ data }) => data && setTools(data))
  }, [])

  const isAdmin = session?.user?.email?.toLowerCase() === ADMIN_EMAIL
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light')

  return (
    <Router>
      <Navbar isAdmin={isAdmin} session={session} theme={theme} toggleTheme={toggleTheme} />
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/ai" element={<ToolDirectory tools={tools} />} />
        <Route path="/tools" element={<ComingSoon title="Outils Créateurs" />} />
        <Route path="/prompts" element={<ComingSoon title="Espace Prompts" />} />
        <Route path="/blog" element={<ComingSoon title="Le Blog" />} />
        {isAdmin && <Route path="/admin" element={<AdminView onAdd={(t) => setTools(prev => [t, ...prev])} />} />}
      </Routes>
      <Footer />
    </Router>
  )
}

function Navbar({ isAdmin, session, theme, toggleTheme }) {
  const loc = useLocation()
  async function handleLogin() {
    if (!supabase) return
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }
  
  return (
    <nav className="navbar">
      <Link to="/" className="text-xl font-black tracking-tighter">Free AI Atlas</Link>
      <div className="flex items-center gap-1">
        {[
          { path: '/ai', label: 'AI', icon: Zap },
          { path: '/tools', label: 'Outils', icon: Settings },
          { path: '/prompts', label: 'Prompts', icon: Terminal },
          { path: '/blog', label: 'Blog', icon: BookOpen }
        ].map(l => (
          <Link key={l.path} to={l.path} className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all ${loc.pathname === l.path ? 'bg-[var(--fg)] text-[var(--bg)]' : 'text-[var(--muted)] hover:text-[var(--fg)]'}`}>
            <l.icon size={14} /> {l.label}
          </Link>
        ))}
        {isAdmin && <Link to="/admin" className="btn-main text-xs">Ajouter IA</Link>}
        <button onClick={toggleTheme} className="p-2 text-[var(--muted)]">{theme === 'light' ? <Moon size={18}/> : <Sun size={18}/>}</button>
        {session ? (
            <button onClick={() => supabase.auth.signOut()} className="px-4 py-2 text-sm font-bold"><LogOut size={18}/></button>
        ) : (
            <button onClick={handleLogin} className="btn-main text-xs">Connexion</button>
        )}
      </div>
    </nav>
  )
}

function Accueil() {
  return (
    <div className="space-y-32">
      <section className="section-spacing text-center">
        <h1 className="heading-hero">Dominez la création<br/><span className="text-slate-400 italic">sans budget.</span></h1>
        <p className="text-body max-w-2xl mx-auto mb-12">Marre de dépenser 20€/mois pour des abonnements IA ? J'ai répertorié les meilleures alternatives gratuites et je vous donne les prompts pour obtenir des résultats pro. Lancez votre chaîne YouTube Faceless aujourd'hui.</p>
        <Link to="/ai" className="btn-main">Explorer les outils</Link>
      </section>
      
      <section className="grid md:grid-cols-2 gap-16 layout-container">
        <div className="card">
            <h2 className="heading-lg">Pourquoi payer ?</h2>
            <p className="text-body">Lancer un business de contenu avec un budget de 0€ est possible. Mon rôle est de trouver les outils qui ne vous factureront jamais.</p>
        </div>
        <div className="card">
            <h2 className="heading-lg">Prompting de survie</h2>
            <p className="text-body">Un outil gratuit, bien utilisé, bat une IA payante mal maîtrisée. Je vous partage mes meilleurs prompts pour des résultats bluffants.</p>
        </div>
      </section>
    </div>
  )
}

function ToolDirectory({ tools }) {
  return (
    <div className="section-spacing layout-container">
      <h1 className="heading-hero mb-16">Atlas AI</h1>
      <div className="grid md:grid-cols-3 gap-8">
        {tools.map(tool => (
            <div key={tool.id} className="card">
                <h3 className="text-xl font-bold mb-2">{tool.name}</h3>
                <p className="text-body mb-6">{tool.tagline}</p>
                <a href={tool.url} className="text-[var(--accent)] font-bold text-sm">Accéder →</a>
            </div>
        ))}
      </div>
    </div>
  )
}

function AdminView({ onAdd }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', tagline: '', category: 'Texte', url: '', pricing_note: 'Gratuit' })
  const handleSubmit = async (e) => {
    e.preventDefault()
    const { data } = await supabase.from('ai_tools').insert(form).select().single()
    if (data) { onAdd(data); navigate('/ai'); }
  }
  return (
    <div className="card max-w-xl mx-auto section-spacing">
        <h2 className="heading-lg">Ajouter une IA</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <input className="master-field" placeholder="Nom de l'outil" onChange={e => setForm({...form, name: e.target.value})} required />
            <input className="master-field" placeholder="Description courte (SEO)" onChange={e => setForm({...form, tagline: e.target.value})} required />
            <input className="master-field" placeholder="Lien direct" onChange={e => setForm({...form, url: e.target.value})} required />
            <button className="btn-main w-full">Indexer l'outil</button>
        </form>
    </div>
  )
}

function ComingSoon({ title }) {
  return <div className="text-center section-spacing"><h2 className="heading-lg">{title}</h2><p className="text-body">En cours de curation...</p></div>
}

function Footer() {
  return <footer className="footer-row layout-container"><div>© 2026 Free AI Atlas</div><div className="flex gap-8"><Link to="#">Politique</Link><Link to="#">Contact</Link></div></footer>
}

createRoot(document.getElementById('root')).render(<App />)
