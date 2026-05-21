import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createClient } from '@supabase/supabase-js'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { Zap, Terminal, BookOpen, Plus, Home, Settings, ArrowUpRight, Sparkles, LogOut, Coffee } from 'lucide-react'
import './styles.css'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xnilbpzflfsimnkqxmog.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_M7ILY-6b_MRYuu4l3BXLOA_TQEPKTyA'
const ADMIN_EMAIL = 'ndarawpro@gmail.com'
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null

function App() {
  const [tools, setTools] = useState([])
  const [session, setSession] = useState(null)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    supabase.auth.onAuthStateChange((_, session) => setSession(session))
    supabase.from('ai_tools').select('*').order('name').then(({ data }) => data && setTools(data))
  }, [])

  const isAdmin = session?.user?.email?.toLowerCase() === ADMIN_EMAIL

  return (
    <Router>
      <Navbar isAdmin={isAdmin} session={session} />
      <main className="layout-wrapper">
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/ai" element={<ToolDirectory tools={tools} />} />
          <Route path="/tools" element={<ComingSoon title="Outils Créateurs" />} />
          <Route path="/prompts" element={<ComingSoon title="Espace Prompts" />} />
          <Route path="/blog" element={<ComingSoon title="Le Blog" />} />
          {isAdmin && <Route path="/admin" element={<AdminView onAdd={(t) => setTools(prev => [t, ...prev])} />} />}
          <Route path="*" element={<Accueil />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  )
}

function Navbar({ isAdmin, session }) {
  const loc = useLocation()
  return (
    <nav className="nexus-nav">
      <Link to="/" className="text-sm font-black tracking-tighter mr-4">Free Ai Tools</Link>
      {[
        { path: '/', label: 'Accueil' },
        { path: '/ai', label: 'AI' },
        { path: '/tools', label: 'Outils' },
        { path: '/prompts', label: 'Prompts' },
        { path: '/blog', label: 'Blog' }
      ].map(link => (
        <Link key={link.path} to={link.path} className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${loc.pathname === link.path ? 'bg-black text-white' : 'text-slate-500 hover:text-black'}`}>
          {link.label}
        </Link>
      ))}
      {isAdmin && <Link to="/admin" className="px-4 py-2 rounded-full bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider">Ajouter IA</Link>}
      {session ? <button onClick={() => supabase.auth.signOut()} className="px-4 py-2 text-[11px] font-black uppercase tracking-wider">Déconnexion</button> : <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })} className="px-4 py-2 rounded-full bg-black text-white text-[11px] font-black uppercase tracking-wider">Connexion</button>}
    </nav>
  )
}

function Accueil() {
  return (
    <div className="space-y-32">
      <section className="text-center">
        <h1 className="text-7xl sm:text-9xl font-black tracking-tighter mb-10">Free Ai Tools<br/><span className="text-slate-400 italic">sans compromis.</span></h1>
        <p className="text-body max-w-2xl mx-auto mb-12">L'index ultime pour les créateurs qui veulent booster leur productivité avec les meilleures IA gratuites. Outils testés, prompts optimisés, résultats pro.</p>
        <Link to="/ai" className="btn-apple">Découvrir le répertoire</Link>
      </section>
      
      <section className="bento-grid">
        <div className="bento-card lg:col-span-2">
            <h2 className="text-3xl font-black mb-4">Pourquoi Free Ai Tools ?</h2>
            <p className="text-body">Les créateurs Faceless ne doivent pas être ralentis par des coûts d'abonnement. Nous dénichons les outils qui permettent de créer sans limites.</p>
        </div>
        <div className="bento-card lg:col-span-2">
            <h2 className="text-3xl font-black mb-4">L'expertise du Prompting</h2>
            <p className="text-body">Avoir l'outil ne suffit pas. Je partage les structures de prompts pour transformer une IA gratuite en machine de guerre visuelle ou textuelle.</p>
        </div>
      </section>
    </div>
  )
}

function ToolDirectory({ tools }) {
  return (
    <div>
      <h1 className="text-6xl font-black tracking-tighter mb-16">Répertoire AI</h1>
      <div className="bento-grid">
        {tools.map(tool => (
            <div key={tool.id} className="bento-card">
                <h3 className="text-xl font-bold mb-2">{tool.name}</h3>
                <p className="text-body mb-6">{tool.tagline}</p>
                <a href={tool.url} target="_blank" rel="noreferrer" className="text-blue-600 font-bold text-sm">Voir l'outil →</a>
            </div>
        ))}
      </div>
    </div>
  )
}

function AdminView({ onAdd }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', tagline: '', category: 'Texte', url: '', pricing_note: 'Gratuit', is_featured: false })
  const handleSubmit = async (e) => {
    e.preventDefault()
    const { data } = await supabase.from('ai_tools').insert(form).select().single()
    if (data) { onAdd(data); navigate('/ai'); }
  }
  return (
    <div className="bento-card max-w-xl mx-auto">
        <h2 className="text-2xl font-black mb-8">Ajouter une IA</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <input className="input-field" placeholder="Nom de l'outil" onChange={e => setForm({...form, name: e.target.value})} required />
            <input className="input-field" placeholder="Tagline (Description)" onChange={e => setForm({...form, tagline: e.target.value})} required />
            <input className="input-field" placeholder="Lien URL" onChange={e => setForm({...form, url: e.target.value})} required />
            <select className="input-field" onChange={e => setForm({...form, category: e.target.value})}>
                <option>Texte</option><option>Image</option><option>Vidéo</option><option>Autre</option>
            </select>
            <input className="input-field" placeholder="Gratuité" onChange={e => setForm({...form, pricing_note: e.target.value})} />
            <label className="flex items-center gap-2"><input type="checkbox" onChange={e => setForm({...form, is_featured: e.target.checked})} /> Mettre en avant</label>
            <button className="btn-apple w-full">Enregistrer</button>
        </form>
    </div>
  )
}

function ComingSoon({ title }) { return <div className="text-center py-32"><h2 className="text-4xl font-black">{title}</h2><p className="text-body">Bientôt disponible.</p></div> }
function Footer() { return <footer className="footer-row layout-container"><div>© 2026 Free Ai Tools</div><div className="flex gap-8"><Link to="#">Politique</Link><Link to="#">Contact</Link></div></footer> }

createRoot(document.getElementById('root')).render(<App />)
