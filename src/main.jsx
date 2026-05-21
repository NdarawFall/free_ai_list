import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createClient } from '@supabase/supabase-js'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './styles.css'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL || 'https://xnilbpzflfsimnkqxmog.supabase.co', import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_M7ILY-6b_MRYuu4l3BXLOA_TQEPKTyA')
const ADMIN_EMAIL = 'ndarawpro@gmail.com'

function App() {
  const [tools, setTools] = useState([])
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    supabase.auth.onAuthStateChange((_, session) => setSession(session))
    supabase.from('ai_tools').select('*').then(({ data }) => data && setTools(data))
  }, [])

  const isAdmin = session?.user?.email?.toLowerCase() === ADMIN_EMAIL

  return (
    <Router>
      <nav className="navbar-custom">
        <Link to="/" className="font-bold text-lg">Free Ai Tools</Link>
        <div className="flex gap-4">
          <Link to="/ai">AI</Link>
          {isAdmin && <Link to="/admin">Ajouter IA</Link>}
          {session ? <button onClick={() => supabase.auth.signOut()}>Déconnexion</button> : <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}>Connexion</button>}
        </div>
      </nav>
      <div className="pt-24 container-custom">
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/ai" element={<AiTools tools={tools} />} />
          {isAdmin && <Route path="/admin" element={<AdminView onAdd={t => setTools(prev => [t, ...prev])} />} />}
        </Routes>
      </div>
      <footer className="footer-row container-custom"><div>© 2026 Free Ai Tools</div><div className="flex gap-4"><Link to="#">Contact</Link></div></footer>
    </Router>
  )
}

function Accueil() {
  return (
    <section className="text-center py-20">
      <h1 className="h1-custom">Dominez la création<br/>sans budget.</h1>
      <p className="text-body max-w-2xl mx-auto mb-10">La sélection ultime des meilleurs outils IA gratuits pour créateurs.</p>
      <Link to="/ai" className="btn-primary">Explorer les outils</Link>
    </section>
  )
}

function AiTools({ tools }) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {tools.map(t => (
        <div key={t.id} className="card-custom">
          <h3 className="text-xl font-bold mb-2">{t.name}</h3>
          <p className="text-body text-sm mb-4">{t.tagline}</p>
          <a href={t.url} className="text-blue-600 font-bold">Accéder →</a>
        </div>
      ))}
    </div>
  )
}

function AdminView({ onAdd }) {
  const [form, setForm] = useState({ name: '', tagline: '', url: '' })
  const handleSubmit = async (e) => {
    e.preventDefault()
    const { data } = await supabase.from('ai_tools').insert(form).select().single()
    if (data) onAdd(data)
  }
  return (
    <div className="card-custom max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="master-field" placeholder="Nom" onChange={e => setForm({...form, name: e.target.value})} required />
        <input className="master-field" placeholder="Accroche" onChange={e => setForm({...form, tagline: e.target.value})} required />
        <input className="master-field" placeholder="URL" onChange={e => setForm({...form, url: e.target.value})} required />
        <button className="btn-main w-full">Ajouter</button>
      </form>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
