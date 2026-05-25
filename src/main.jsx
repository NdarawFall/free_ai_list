import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createClient } from '@supabase/supabase-js'
import { gsap } from 'gsap'
import {
  ArrowUpRight,
  CheckCircle2,
  Command,
  Database,
  Filter,
  LogIn,
  LogOut,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react'
import './styles.css'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xnilbpzflfsimnkqxmog.supabase.co'
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_M7ILY-6b_MRYuu4l3BXLOA_TQEPKTyA'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const ADMIN_EMAIL = 'ndarawpro@gmail.com'
const PRODUCTION_URL = 'https://freeailist-navy.vercel.app'

const initialForm = {
  name: '',
  tagline: '',
  category: '',
  url: '',
  pricing_note: 'Plan gratuit disponible',
  tags: '',
  is_featured: false,
}

function App() {
  const [tools, setTools] = useState([])
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Tous')
  const [status, setStatus] = useState('Connexion au catalogue')
  const heroRef = useRef(null)
  const cardsRef = useRef(null)

  const userEmail = session?.user?.email?.toLowerCase() || ''
  const isAdmin = userEmail === ADMIN_EMAIL

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-hero]', {
        y: 28,
        opacity: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: 'power3.out',
      })
      gsap.to('[data-pulse]', {
        scale: 1.08,
        opacity: 0.72,
        duration: 3.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    }, heroRef)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-card]', {
        y: 18,
        opacity: 0,
        duration: 0.45,
        stagger: 0.04,
        ease: 'power2.out',
      })
    }, cardsRef)
    return () => ctx.revert()
  }, [tools, query, category])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    loadTools()
  }, [])

  async function loadTools() {
    setLoading(true)
    const { data, error } = await supabase
      .from('ai_tools')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('name', { ascending: true })

    if (error) {
      setStatus('Impossible de charger Supabase')
      setTools([])
    } else {
      setTools(data || [])
      setStatus('Catalogue synchronise')
    }
    setLoading(false)
  }

  async function signIn() {
    const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: isLocalhost ? window.location.origin : PRODUCTION_URL,
      },
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function createTool(payload) {
    const { data, error } = await supabase.from('ai_tools').insert(payload).select('*').single()
    if (error) throw error
    setTools((current) => [data, ...current])
    setStatus(`${data.name} ajoute`)
  }

  async function deleteTool(id) {
    const { error } = await supabase.from('ai_tools').delete().eq('id', id)
    if (error) throw error
    setTools((current) => current.filter((tool) => tool.id !== id))
    setStatus('Outil supprime')
  }

  const categories = useMemo(() => {
    return ['Tous', ...Array.from(new Set(tools.map((tool) => tool.category))).sort()]
  }, [tools])

  const filteredTools = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return tools.filter((tool) => {
      const matchesCategory = category === 'Tous' || tool.category === category
      const haystack = [tool.name, tool.tagline, tool.category, tool.pricing_note, ...(tool.tags || [])]
        .join(' ')
        .toLowerCase()
      return matchesCategory && haystack.includes(needle)
    })
  }, [tools, query, category])

  const featuredCount = tools.filter((tool) => tool.is_featured).length

  return (
    <main className="app-shell">
      <div className="stage-lights" aria-hidden="true">
        <span data-pulse className="light-orb orb-a" />
        <span data-pulse className="light-orb orb-b" />
        <span className="grid-layer" />
      </div>

      <header ref={heroRef} className="hero-section">
        <nav data-hero className="nav-bar">
          <a className="brand" href="#top">
            <span className="brand-icon">
              <Command size={18} />
            </span>
            <span>
              <strong>Free AI Atlas</strong>
              <small>outils gratuits verifies</small>
            </span>
          </a>

          <div className="nav-actions">
            <a className="nav-link" href="#catalogue">Catalogue</a>
            {isAdmin && <a className="nav-link" href="#admin">Admin</a>}
            {session ? (
              <button className="nav-button" onClick={signOut}>
                <LogOut size={16} /> Sortir
              </button>
            ) : (
              <button className="nav-button" onClick={signIn}>
                <LogIn size={16} /> Google
              </button>
            )}
          </div>
        </nav>

        <div id="top" className="hero-grid">
          <section data-hero className="hero-copy">
            <p className="kicker">
              <Sparkles size={16} /> Une base claire pour ne plus perdre les bons outils IA.
            </p>
            <h1>Ton radar prive pour les IA gratuites.</h1>
            <p>
              Classe, retrouve et enrichis ta selection d'assistants, generateurs, moteurs de recherche et outils IA utiles sans te noyer dans le bruit.
            </p>
            <div className="hero-actions">
              <a className="primary-button" href="#catalogue">
                Explorer <ArrowUpRight size={16} />
              </a>
              {isAdmin && (
                <a className="secondary-button" href="#admin">
                  Ajouter une IA <Plus size={16} />
                </a>
              )}
            </div>
          </section>

          <aside data-hero className="status-panel">
            <div className="panel-top">
              <div>
                <span>Live catalogue</span>
                <strong>{filteredTools.length} visibles</strong>
              </div>
              <Database size={24} />
            </div>
            <div className="metrics">
              <Metric value={tools.length} label="outils" />
              <Metric value={categories.length - 1} label="categories" />
              <Metric value={featuredCount} label="favoris" />
            </div>
            <div className="sync-row">
              <ShieldCheck size={18} />
              <span>{status}</span>
            </div>
          </aside>
        </div>
      </header>

      <section id="catalogue" className="content-section">
        <div className="section-title">
          <div>
            <span>Collection</span>
            <h2>Une bibliotheque elegante, rapide, maintenable.</h2>
          </div>
          <p>Chaque carte garde l'essentiel : le nom, l'usage, le niveau gratuit, les tags, et un lien direct.</p>
        </div>

        {isAdmin && <AdminPanel onCreate={createTool} />}
        {session && !isAdmin && (
          <div className="notice">
            Connecte avec {session.user.email}. Le formulaire admin est reserve a {ADMIN_EMAIL}.
          </div>
        )}

        <div className="toolbar">
          <label className="search-box">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher par nom, tag, categorie..."
            />
          </label>
          <div className="filters">
            <Filter size={17} />
            {categories.map((item) => (
              <button
                key={item}
                className={category === item ? 'filter active' : 'filter'}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="empty-state">Chargement du catalogue...</p>
        ) : filteredTools.length ? (
          <div ref={cardsRef} className="cards-grid">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} isAdmin={isAdmin} onDelete={deleteTool} />
            ))}
          </div>
        ) : (
          <p className="empty-state">Aucun outil ne correspond a cette recherche.</p>
        )}
      </section>
    </main>
  )
}

function Metric({ value, label }) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

function AdminPanel({ onCreate }) {
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      await onCreate({
        name: form.name.trim(),
        tagline: form.tagline.trim(),
        category: form.category.trim(),
        url: form.url.trim(),
        pricing_note: form.pricing_note.trim() || 'Gratuit',
        tags: form.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        is_featured: form.is_featured,
      })
      setForm(initialForm)
      setMessage('Outil ajoute au catalogue.')
    } catch (error) {
      setMessage(error.message || "L'ajout a echoue.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <section id="admin" className="admin-card">
      <div className="admin-heading">
        <span>Console admin</span>
        <h3>Ajouter un nouvel outil IA gratuit</h3>
      </div>

      <form className="admin-form" onSubmit={submit}>
        <Field label="Nom" value={form.name} onChange={(value) => update('name', value)} required />
        <Field label="Categorie" value={form.category} onChange={(value) => update('category', value)} required />
        <Field label="URL" type="url" value={form.url} onChange={(value) => update('url', value)} required />
        <Field label="Note gratuite" value={form.pricing_note} onChange={(value) => update('pricing_note', value)} />
        <Field
          label="Description courte"
          value={form.tagline}
          onChange={(value) => update('tagline', value)}
          required
          wide
        />
        <Field label="Tags separes par virgules" value={form.tags} onChange={(value) => update('tags', value)} wide />
        <label className="check-field">
          <input
            checked={form.is_featured}
            onChange={(event) => update('is_featured', event.target.checked)}
            type="checkbox"
          />
          Mettre en favori
        </label>
        <button className="primary-button submit-button" disabled={saving} type="submit">
          <Plus size={16} /> {saving ? 'Ajout...' : 'Ajouter'}
        </button>
      </form>
      {message && <p className="form-message">{message}</p>}
    </section>
  )
}

function Field({ label, value, onChange, type = 'text', required = false, wide = false }) {
  return (
    <label className={wide ? 'field wide' : 'field'}>
      <span>{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} />
    </label>
  )
}

function ToolCard({ tool, isAdmin, onDelete }) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      await onDelete(tool.id)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <article data-card className={tool.is_featured ? 'tool-card featured' : 'tool-card'}>
      <div className="card-head">
        <div>
          <span>{tool.category}</span>
          <h3>{tool.name}</h3>
        </div>
        {tool.is_featured && <CheckCircle2 size={22} />}
      </div>
      <p>{tool.tagline}</p>
      <div className="tags">
        {(tool.tags || []).map((tag) => (
          <small key={tag}>{tag}</small>
        ))}
      </div>
      <div className="card-foot">
        <span>{tool.pricing_note}</span>
        <div className="card-actions">
          {isAdmin && (
            <button onClick={handleDelete} disabled={deleting} title="Supprimer">
              <Trash2 size={16} />
            </button>
          )}
          <a href={tool.url} target="_blank" rel="noreferrer">
            Ouvrir <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </article>
  )
}

createRoot(document.getElementById('root')).render(<App />)
