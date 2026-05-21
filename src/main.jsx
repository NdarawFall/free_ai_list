import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createClient } from '@supabase/supabase-js'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { Zap, Terminal, BookOpen, Plus, Sun, Moon, LogOut } from 'lucide-react'
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

  return (
    <Router>
      <Navbar isAdmin={isAdmin} session={session} theme={theme} toggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')} />
      <main className="layout-container py-32">
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/ai" element={<AiTools tools={tools} />} />
          <Route path="/tools" element={<ComingSoon />} />
          <Route path="/prompts" element={<ComingSoon />} />
          <Route path="/blog" element={<ComingSoon />} />
          {isAdmin && <Route path="/admin" element={<AdminView onAdd={(t) => setTools(prev => [t, ...prev])} />} />}
        </Routes>
      </main>
      <Footer />
    </Router>
  )
}

function Navbar({ isAdmin, session, theme, toggleTheme }) {
  return (
    <nav className="navbar">
      <Link to="/" className="text-lg font-extrabold tracking-tight">Free AI Atlas</Link>
      <div className="flex items-center gap-2">
        <Link to="/ai" className="px-4 py-2 text-sm font-bold">IA</Link>
        <Link to="/tools" className="px-4 py-2 text-sm font-bold text-[var(--muted)]">Outils</Link>
        <Link to="/prompts" className="px-4 py-2 text-sm font-bold text-[var(--muted)]">Prompts</Link>
        <Link to="/blog" className="px-4 py-2 text-sm font-bold text-[var(--muted)]">Blog</Link>
        {isAdmin && <Link to="/admin" className="btn-main text-xs">Ajouter IA</Link>}
        <button onClick={toggleTheme} className="p-2">{theme === 'light' ? <Moon size={18}/> : <Sun size={18}/>}</button>
        {session ? <button onClick={() => supabase.auth.signOut()}><LogOut size={18}/></button> : <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })} className="btn-main text-xs">Connexion</button>}
      </div>
    </nav>
  )
}

function Accueil() {
  return (
    <div className="space-y-24">
      <section className="text-center">
        <h1 className="text-6xl font-black tracking-tighter mb-6">L'accès à l'IA ne devrait pas <br/> être une question de portefeuille.</h1>
        <p className="text-body max-w-2xl mx-auto mb-10">J'ai testé et répertorié les meilleurs outils IA gratuits pour vous permettre de produire du contenu professionnel sans dépenser un euro en abonnements.</p>
        <Link to="/ai" className="btn-main">Explorer les outils</Link>
      </section>
      
      <section className="grid md:grid-cols-3 gap-8">
        <div className="card"><h3 className="font-bold mb-2">Qualité Pro</h3><p className="text-body">Des modèles gratuits, mais puissants.</p></div>
        <div className="card"><h3 className="font-bold mb-2">Prompts Testés</h3><p className="text-body">Les commandes exactes pour réussir.</p></div>
        <div className="card"><h3 className="font-bold mb-2">Faceless Mastery</h3><p className="text-body">Tout pour créer du contenu anonyme.</p></div>
      </section>
    </div>
  )
}

function AiTools({ tools }) {
  return (
    <div className="grid md:grid-cols-3 gap-8">
        {tools.map(tool => (
            <div key={tool.id} className="card">
                <h3 className="text-xl font-bold mb-2">{tool.name}</h3>
                <p className="text-body mb-6">{tool.tagline}</p>
                <a href={tool.url} className="text-[var(--accent)] font-bold text-sm">Voir l'outil →</a>
            </div>
        ))}
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
    <div className="card max-w-xl mx-auto">
        <h2 className="text-2xl font-black mb-6">Ajouter un outil</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <input className="master-field" placeholder="Nom" onChange={e => setForm({...form, name: e.target.value})} required />
            <input className="master-field" placeholder="Tagline" onChange={e => setForm({...form, tagline: e.target.value})} required />
            <input className="master-field" placeholder="URL" onChange={e => setForm({...form, url: e.target.value})} required />
            <button className="btn-main w-full">Enregistrer</button>
        </form>
    </div>
  )
}

function ComingSoon() {
  return <div className="text-center py-24"><h2 className="text-2xl font-black">Curation en cours</h2><p className="text-body">Un peu de patience, cette section sera bientôt disponible.</p></div>
}

function Footer() {
  return <footer className="footer-row layout-container"><div>© 2026 Free Ai Tools</div><div className="flex gap-8"><Link to="#">Politique</Link><Link to="#">Contact</Link></div></footer>
}

createRoot(document.getElementById('root')).render(<App />)
