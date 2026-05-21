import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createClient } from '@supabase/supabase-js'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { Zap, Terminal, BookOpen, Plus, Sun, Moon, LogOut, Home, ArrowUpRight, Search, Settings, Sparkles, Wallet, Lightbulb, MessageSquare, ArrowRight, Music, Mic, Image as ImageIcon, Type, Video, Globe } from 'lucide-react'
import './styles.css'

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
      <main className="layout-container py-32">
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/ai" element={<ToolDirectory tools={tools} />} />
          <Route path="/tools" element={<ComingSoon title="Outils Créateurs" />} />
          <Route path="/prompts" element={<ComingSoon title="Espace Prompts" />} />
          <Route path="/blog" element={<ComingSoon title="Le Blog" />} />
          {isAdmin && <Route path="/admin" element={<AdminView onAdd={(t) => setTools(prev => [t, ...prev])} />} />}
        </Routes>
      </main>
      <Footer />
    </Router>
  )
}

function Navbar({ isAdmin, session, theme, toggleTheme }) {
  const loc = useLocation()
  return (
    <nav className="navbar">
      <Link to="/" className="text-lg font-black tracking-tighter">Free Ai Tools</Link>
      <div className="flex items-center gap-1">
        {[
          { path: '/ai', label: 'IA' },
          { path: '/tools', label: 'Outils' },
          { path: '/prompts', label: 'Prompts' },
          { path: '/blog', label: 'Blog' }
        ].map(l => (
          <Link key={l.path} to={l.path} className={`px-4 py-2 text-xs font-black uppercase tracking-wider ${loc.pathname === l.path ? 'text-black dark:text-white' : 'text-[var(--muted)] hover:text-[var(--fg)]'}`}>
            {l.label}
          </Link>
        ))}
        {isAdmin && <Link to="/admin" className="btn-main text-xs">Ajouter IA</Link>}
        <button onClick={toggleTheme} className="p-2 text-[var(--muted)]">{theme === 'light' ? <Moon size={18}/> : <Sun size={18}/>}</button>
        {session ? <button onClick={() => supabase.auth.signOut()} className="px-4 py-2 text-xs font-black">LogOut</button> : <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })} className="btn-main text-xs">Connexion</button>}
      </div>
    </nav>
  )
}

function Accueil() {
  const navigate = useNavigate()
  return (
    <div className="space-y-40">
      <section className="text-center py-20">
        <h1 className="heading-hero">Dominez la création<br/><span className="text-slate-400 italic">sans budget.</span></h1>
        <p className="text-body max-w-2xl mx-auto mb-12">Je répertorie les meilleures alternatives gratuites aux outils IA coûteux. Prompts testés, outils sélectionnés pour produire un contenu de niveau professionnel sans dépenser un euro en abonnements.</p>
        <button onClick={() => navigate('/ai')} className="btn-apple">Explorer les IA</button>
      </section>
      
      <section className="grid md:grid-cols-3 gap-8">
        <div className="card">
            <h2 className="heading-lg">Qualité sans compromis</h2>
            <p className="text-body">J'ai testé des dizaines d'outils pour ne garder que ceux qui offrent des résultats pro gratuitement.</p>
        </div>
        <div className="card">
            <h2 className="heading-lg">Le Pouvoir du Prompting</h2>
            <p className="text-body">L'outil n'est rien sans la commande. Découvrez les prompts exacts pour tirer le maximum de chaque modèle.</p>
        </div>
        <div className="card">
            <h2 className="heading-lg">Pour les Créateurs</h2>
            <p className="text-body">Que vous soyez créateur Faceless, monteur ou designer, cet espace est votre nouvelle base arrière.</p>
        </div>
      </section>

      <section className="card bg-[var(--accent)] text-white">
          <h2 className="heading-lg text-white">Prêt à bâtir votre empire ?</h2>
          <p className="text-body text-white/80 mb-8">Ne laissez plus votre portefeuille limiter votre créativité. L'intelligence est désormais accessible.</p>
          <button onClick={() => navigate('/ai')} className="btn-outline text-white border-white/20">Voir les outils</button>
      </section>
    </div>
  )
}

function ToolDirectory({ tools }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Tous')
  const categories = ['Tous', 'Texte', 'Image', 'Vidéo', 'Musique', 'Voix', 'Autres']
  
  const filtered = useMemo(() => tools.filter(t => (category === 'Tous' || t.category === category) && (t.name.toLowerCase().includes(query.toLowerCase()))), [tools, query, category])

  return (
    <div className="section-spacing">
      <h1 className="heading-section">Répertoire IA</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-12">
        <input className="master-field" placeholder="Chercher une IA..." onChange={e => setQuery(e.target.value)} />
        <select className="master-field" onChange={e => setCategory(e.target.value)}>
            {categories.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {filtered.map(tool => (
            <div key={tool.id} className="card">
                <h3 className="text-xl font-bold mb-2">{tool.name}</h3>
                <p className="text-body mb-6">{tool.tagline}</p>
                <a href={tool.url} target="_blank" rel="noreferrer" className="text-[var(--accent)] font-bold text-sm">Accéder →</a>
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
            <input className="master-field" placeholder="Nom" onChange={e => setForm({...form, name: e.target.value})} required />
            <input className="master-field" placeholder="Tagline" onChange={e => setForm({...form, tagline: e.target.value})} required />
            <input className="master-field" placeholder="URL" onChange={e => setForm({...form, url: e.target.value})} required />
            <select className="master-field" onChange={e => setForm({...form, category: e.target.value})}>
                {['Texte', 'Image', 'Vidéo', 'Musique', 'Voix', 'Autres'].map(c => <option key={c}>{c}</option>)}
            </select>
            <button className="btn-main w-full">Enregistrer</button>
        </form>
    </div>
  )
}

function ComingSoon({ title }) { return <div className="text-center section-spacing"><h2 className="heading-lg">{title}</h2><p className="text-body">Bientôt disponible.</p></div> }
function Footer() { return <footer className="footer-row layout-container"><div>© 2026 Free Ai Tools</div><div className="flex gap-8"><Link to="#">Politique</Link><Link to="#">Contact</Link></div></footer> }

createRoot(document.getElementById('root')).render(<App />)
