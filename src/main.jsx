import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createClient } from '@supabase/supabase-js'
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
  ShieldAlert,
  Wallet
} from 'lucide-react'
import './styles.css'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xnilbpzflfsimnkqxmog.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_M7ILY-6b_MRYuu4l3BXLOA_TQEPKTyA'
const ADMIN_EMAIL = 'ndarawpro@gmail.com'

const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null

const fallbackTools = [
  { id: '1', name: 'ChatGPT', tagline: 'Assistant polyvalent pour le texte et le raisonnement.', category: 'Texte', url: 'https://chatgpt.com', pricing_note: 'Gratuit' },
  { id: '2', name: 'Ideogram', tagline: 'Génération d\'images avec typographie parfaite.', category: 'Image', url: 'https://ideogram.ai', pricing_note: 'Crédits' },
  { id: '3', name: 'Luma Dream Machine', tagline: 'Vidéo réaliste à partir de texte.', category: 'Vidéo', url: 'https://lumalabs.ai', pricing_note: 'Essai' },
]

function App() {
  const [page, setPage] = useState('accueil')
  const [tools, setTools] = useState(fallbackTools)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Tous')
  const [session, setSession] = useState(null)

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
      if (!error && data?.length) setTools(data)
    }
    loadTools()
  }, [])

  const filteredTools = useMemo(() => {
    const q = query.toLowerCase()
    return tools.filter((t) => {
      const matches = category === 'Tous' || t.category === category
      return matches && (t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q))
    })
  }, [category, query, tools])

  const isAdmin = session?.user?.email?.toLowerCase() === ADMIN_EMAIL

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30">
      {/* Neon Background Moving */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="glow-nexus absolute -top-[10%] -left-[10%] w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[120px]" />
        <div className="glow-nexus absolute top-[40%] -right-[5%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px]" style={{ animationDelay: '-5s' }} />
        <div className="glow-nexus absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px]" style={{ animationDelay: '-10s' }} />
      </div>

      {/* Navigation Flottante */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 h-14 px-4 rounded-full border border-white/[0.08] bg-slate-950/60 backdrop-blur-3xl shadow-2xl">
        <button onClick={() => setPage('accueil')} className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${page === 'accueil' ? 'bg-white text-black' : 'text-slate-400 hover:text-white'}`}>
          <Home size={14} /> <span>Accueil</span>
        </button>
        <button onClick={() => setPage('tools')} className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${page === 'tools' ? 'bg-white text-black' : 'text-slate-400 hover:text-white'}`}>
          <Zap size={14} /> <span>AI Tools</span>
        </button>
        <button onClick={() => setPage('prompts')} className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${page === 'prompts' ? 'bg-white text-black' : 'text-slate-400 hover:text-white'}`}>
          <Terminal size={14} /> <span>Prompts</span>
        </button>
        
        <div className="w-px h-6 bg-white/10 mx-2" />

        {isAdmin && (
          <button onClick={() => setPage('admin')} className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${page === 'admin' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            <Plus size={16} /> <span className="hidden lg:inline">Ajouter IA</span>
          </button>
        )}

        {session ? (
          <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-red-400 transition-all">
            <LogOut size={14} /> <span className="hidden lg:inline">Déconnexion</span>
          </button>
        ) : (
          <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })} className="flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 transition-all">
             <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center text-[10px] font-bold text-black italic">G</div>
             <span>Connexion</span>
          </button>
        )}
      </nav>

      {/* Rendu des Pages */}
      <main className="mx-auto max-w-[1200px] px-6 pt-40 pb-24 relative">
        {page === 'accueil' && <Accueil onStart={() => setPage('tools')} />}
        {page === 'tools' && (
          <AiTools 
            tools={filteredTools} 
            category={category} 
            setCategory={setCategory} 
            query={query} 
            setQuery={setQuery} 
          />
        )}
        {page === 'prompts' && <Prompts />}
        {page === 'admin' && isAdmin && (
          <div className="animate-fade">
             <h2 className="text-4xl font-black text-center mb-16">Espace Administrateur</h2>
             <div className="mx-auto max-w-3xl">
                <AdminForm onAdd={async (p) => { await supabase.from('ai_tools').insert(p); setPage('tools'); }} />
             </div>
          </div>
        )}
      </main>

      <footer className="text-center py-20 border-t border-white/5 text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
        © 2026 Free Ai Tools • L'Intelligence pour tous
      </footer>
    </div>
  )
}

function Accueil({ onStart }) {
  return (
    <div className="space-y-40 animate-fade">
      {/* Hero Section */}
      <section className="text-center py-10">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-12">
          <Sparkles size={14} /> Le savoir n'a pas de prix
        </div>
        <h1 className="text-6xl sm:text-9xl font-black tracking-tighter mb-12 leading-[0.9]">
          L'IA gratuite, <br />
          <span className="text-slate-500 italic">enfin maîtrisée.</span>
        </h1>
        <p className="text-slate-400 text-xl max-w-3xl mx-auto leading-relaxed mb-16">
          Marre des abonnements à 20€/mois ? J'ai répertorié les meilleures alternatives gratuites et je vous donne les prompts pour obtenir des résultats de niveau pro.
        </p>
        <button onClick={onStart} className="px-12 h-16 bg-white text-black rounded-full font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10">
          Explorer les outils
        </button>
      </section>

      {/* The Problem Section */}
      <section className="grid md:grid-cols-2 gap-20 items-center">
        <div className="space-y-8">
          <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
            <Wallet size={32} />
          </div>
          <h2 className="text-4xl sm:text-5xl font-black leading-tight">Pourquoi payer quand le génie est libre ?</h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Tout le monde n'a pas le budget pour s'offrir les derniers modèles d'IA. Pourtant, des outils incroyables existent gratuitement dans l'ombre des géants payants. Je les déniche pour vous.
          </p>
        </div>
        <div className="p-10 rounded-[40px] border border-white/5 bg-white/[0.02] backdrop-blur-xl">
           <div className="space-y-6">
              <div className="h-2 w-24 bg-red-500/40 rounded-full" />
              <div className="h-2 w-full bg-white/5 rounded-full" />
              <div className="h-2 w-3/4 bg-white/5 rounded-full" />
              <div className="h-2 w-full bg-white/5 rounded-full" />
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest pt-4">Le constat</p>
              <p className="text-2xl font-medium">L'accès à l'intelligence ne devrait pas être une question de portefeuille.</p>
           </div>
        </div>
      </section>

      {/* The Solution Section */}
      <section className="grid md:grid-cols-2 gap-20 items-center">
        <div className="order-2 md:order-1 p-10 rounded-[40px] border border-blue-500/10 bg-blue-500/[0.02] backdrop-blur-xl">
           <div className="space-y-6">
              <div className="flex gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full" />
                <div className="h-2 w-2 bg-blue-500 rounded-full" />
                <div className="h-2 w-2 bg-blue-500 rounded-full" />
              </div>
              <p className="text-blue-400 font-mono text-sm">/prompt: créer un chef-d'œuvre gratuitement...</p>
              <div className="h-2 w-full bg-white/10 rounded-full" />
              <div className="h-2 w-5/6 bg-white/10 rounded-full" />
              <p className="text-xl italic font-serif">"Le secret n'est pas dans l'outil, mais dans la commande."</p>
           </div>
        </div>
        <div className="order-1 md:order-2 space-y-8">
          <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
            <MessageSquare size={32} />
          </div>
          <h2 className="text-4xl sm:text-5xl font-black leading-tight">L'art de parler aux machines</h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Avoir l'outil est une chose, savoir l'utiliser en est une autre. Beaucoup abandonnent car ils n'obtiennent pas ce qu'ils veulent. Ici, je vous partage les prompts exacts pour transformer un outil gratuit en machine de guerre.
          </p>
        </div>
      </section>

      {/* Action Section */}
      <section className="text-center py-20 bg-gradient-to-b from-transparent to-blue-600/5 rounded-[60px] border border-white/5">
         <h2 className="text-4xl font-black mb-8 text-balance">Prêt à arrêter de perdre votre temps et votre argent ?</h2>
         <button onClick={onStart} className="px-10 h-16 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20">
            Accéder au répertoire maintenant
         </button>
      </section>
    </div>
  )
}

function AiTools({ tools, category, setCategory, query, setQuery }) {
  return (
    <div className="animate-fade">
      <header className="text-center mb-24">
        <h2 className="text-4xl sm:text-7xl font-black tracking-tight mb-6">Le Répertoire</h2>
        <p className="text-slate-500 text-xl">Sélection rigoureuse des meilleures IA accessibles sans frais.</p>
      </header>

      <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16 border-b border-white/5 pb-12">
        <div className="flex flex-wrap justify-center gap-2">
          {['Tous', 'Texte', 'Image', 'Vidéo', 'Autre'].map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${category === c ? 'bg-white text-black' : 'text-slate-500 hover:text-white border border-white/5'}`}>{c}</button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
          <input 
            placeholder="Chercher une IA..." 
            className="w-full h-12 pl-14 pr-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-blue-500 transition-all text-sm font-medium"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {tools.map(tool => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
      
      {tools.length === 0 && (
        <div className="text-center py-20 text-slate-600 font-bold uppercase tracking-widest">
          Aucun outil trouvé pour cette recherche
        </div>
      )}
    </div>
  )
}

function Prompts() {
  return (
    <div className="text-center animate-fade">
      <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center text-slate-500 mx-auto mb-10">
        <Terminal size={40} />
      </div>
      <h2 className="text-4xl sm:text-7xl font-black tracking-tight mb-8">Espace Prompts</h2>
      <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-12">Le guide ultime pour parler aux IA. Je prépare une bibliothèque de commandes prêtes à l'emploi pour chaque outil du répertoire.</p>
      <div className="p-20 border border-white/10 border-dashed rounded-[50px] flex flex-col items-center gap-4 text-slate-600">
        <Terminal size={32} />
        <span className="font-black uppercase tracking-[0.3em]">Déploiement imminent</span>
      </div>
    </div>
  )
}

function ToolCard({ tool }) {
  const Icon = { 'Texte': Type, 'Image': ImageIcon, 'Vidéo': Video }[tool.category] || Globe
  return (
    <div className="p-8 rounded-[40px] border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/15 transition-all duration-500 group shadow-2xl">
      <div className="flex items-start justify-between mb-10">
        <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-white group-hover:bg-blue-600 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
          <Icon size={28} />
        </div>
        <a href={tool.url} target="_blank" rel="noreferrer" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 text-slate-500 hover:bg-white hover:text-black transition-all duration-300"><ArrowUpRight size={24} /></a>
      </div>
      <h3 className="text-2xl font-bold mb-4 group-hover:text-blue-400 transition-colors">{tool.name}</h3>
      <p className="text-slate-500 text-base leading-relaxed mb-10 line-clamp-2 h-12">{tool.tagline}</p>
      <div className="pt-8 border-t border-white/5 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{tool.pricing_note}</span>
        <div className="px-3 py-1 rounded-full bg-blue-500/10 text-[9px] font-bold uppercase tracking-widest text-blue-500/70 border border-blue-500/10">
          {tool.category}
        </div>
      </div>
    </div>
  )
}

function AdminForm({ onAdd }) {
  const [form, setForm] = useState({ name: '', tagline: '', category: 'Texte', url: '', pricing_note: 'Gratuit' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await onAdd(form)
    setLoading(false)
  }

  return (
    <div className="p-10 rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-3xl shadow-2xl">
      <form className="grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-4">Nom du site</label>
          <input required className="h-14 px-6 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-blue-500 transition-all text-white" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        </div>
        <div className="flex flex-col gap-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-4">Catégorie</label>
          <select className="h-14 px-6 rounded-2xl bg-[#020617] border border-white/10 outline-none focus:border-blue-500 transition-all text-white" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
            <option>Texte</option><option>Image</option><option>Vidéo</option><option>Autre</option>
          </select>
        </div>
        <div className="md:col-span-2 flex flex-col gap-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-4">Description (Simple & Directe)</label>
          <input required className="h-14 px-6 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-blue-500 transition-all text-white" value={form.tagline} onChange={e => setForm({...form, tagline: e.target.value})} />
        </div>
        <div className="md:col-span-2 flex flex-col gap-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-4">Lien de l'outil</label>
          <input required type="url" className="h-14 px-6 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-blue-500 transition-all text-white" value={form.url} onChange={e => setForm({...form, url: e.target.value})} />
        </div>
        <button type="submit" disabled={loading} className="md:col-span-2 h-16 bg-blue-600 rounded-2xl font-black text-lg hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95">
          {loading ? 'Indexation en cours...' : 'Enregistrer dans l\'Atlas'}
        </button>
      </form>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
