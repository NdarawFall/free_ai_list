import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createClient } from '@supabase/supabase-js'
import { gsap } from 'gsap'
import {
  ArrowUpRight,
  Check,
  Command,
  Database,
  Filter,
  LogIn,
  LogOut,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import './styles.css'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xnilbpzflfsimnkqxmog.supabase.co'
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_M7ILY-6b_MRYuu4l3BXLOA_TQEPKTyA'
const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey)
const ADMIN_EMAIL = 'ndarawpro@gmail.com'
const productionUrl = 'https://freeailist-navy.vercel.app'

const supabase = hasSupabaseConfig ? createClient(supabaseUrl, supabaseAnonKey) : null

const fallbackTools = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    tagline: 'Assistant generaliste pour ecrire, coder et apprendre.',
    category: 'Assistant',
    url: 'https://chatgpt.com',
    pricing_note: 'Plan gratuit disponible',
    tags: ['texte', 'code', 'productivite'],
    is_featured: true,
  },
  {
    id: 'claude',
    name: 'Claude',
    tagline: 'Assistant conversationnel utile pour documents et raisonnement.',
    category: 'Assistant',
    url: 'https://claude.ai',
    pricing_note: 'Plan gratuit disponible',
    tags: ['texte', 'analyse'],
    is_featured: true,
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    tagline: 'Recherche web assistee par IA avec sources.',
    category: 'Recherche',
    url: 'https://www.perplexity.ai',
    pricing_note: 'Plan gratuit disponible',
    tags: ['recherche', 'sources'],
    is_featured: true,
  },
  {
    id: 'google-ai-studio',
    name: 'Google AI Studio',
    tagline: 'Experimenter avec les modeles Gemini dans le navigateur.',
    category: 'Developpeur',
    url: 'https://aistudio.google.com',
    pricing_note: 'Gratuit avec limites',
    tags: ['api', 'gemini', 'prototype'],
    is_featured: false,
  },
  {
    id: 'hugging-face-spaces',
    name: 'Hugging Face Spaces',
    tagline: 'Tester des demos IA open source dans le navigateur.',
    category: 'Open source',
    url: 'https://huggingface.co/spaces',
    pricing_note: 'Gratuit avec limites',
    tags: ['open-source', 'demo', 'modeles'],
    is_featured: false,
  },
  {
    id: 'ideogram',
    name: 'Ideogram',
    tagline: 'Generation d images avec rendu typographique solide.',
    category: 'Image',
    url: 'https://ideogram.ai',
    pricing_note: 'Credits gratuits',
    tags: ['image', 'design'],
    is_featured: false,
  },
]

function App() {
  const [tools, setTools] = useState(fallbackTools)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Tous')
  const [loading, setLoading] = useState(hasSupabaseConfig)
  const [notice, setNotice] = useState('')
  const [session, setSession] = useState(null)
  const heroRef = useRef(null)
  const gridRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-hero]', {
        y: 34,
        opacity: 0,
        duration: 1,
        stagger: 0.09,
        ease: 'power3.out',
      })
      gsap.to('[data-orbit]', {
        rotate: 360,
        duration: 36,
        repeat: -1,
        ease: 'none',
      })
    }, heroRef)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (!supabase) return undefined

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-tool-card]', {
        y: 22,
        opacity: 0,
        duration: 0.55,
        stagger: 0.045,
        ease: 'power2.out',
      })
    }, gridRef)
    return () => ctx.revert()
  }, [tools, query, category])

  useEffect(() => {
    async function loadTools() {
      if (!supabase) {
        setNotice('mode local')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('ai_tools')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('name', { ascending: true })

      if (error) {
        setNotice('source indisponible')
      } else if (data?.length) {
        setTools(data)
        setNotice('source synchronisee')
      }
      setLoading(false)
    }

    loadTools()
  }, [])

  const categories = useMemo(() => {
    return ['Tous', ...Array.from(new Set(tools.map((tool) => tool.category))).sort()]
  }, [tools])

  const filteredTools = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return tools.filter((tool) => {
      const matchesCategory = category === 'Tous' || tool.category === category
      const searchable = [tool.name, tool.tagline, tool.category, ...(tool.tags ?? [])]
        .join(' ')
        .toLowerCase()
      return matchesCategory && searchable.includes(normalizedQuery)
    })
  }, [category, query, tools])

  const featuredCount = tools.filter((tool) => tool.is_featured).length
  const userEmail = session?.user?.email?.toLowerCase() || ''
  const isAdmin = userEmail === ADMIN_EMAIL

  async function signInWithGoogle() {
    if (!supabase) return

    const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    const redirectTo = isLocalhost ? window.location.origin : productionUrl

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
  }

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  async function addTool(payload) {
    if (!supabase) {
      throw new Error('Supabase n est pas configure.')
    }

    const { data, error } = await supabase.from('ai_tools').insert(payload).select('*').single()
    if (error) throw error
    setTools((current) => [data, ...current])
    return data
  }

  return (
    <main className="site-shell">
      <BackgroundStage />

      <section ref={heroRef} className="relative z-10 border-b border-porcelain/10">
        <div className="mx-auto grid min-h-[88vh] max-w-[1440px] content-between px-5 py-6 sm:px-8 lg:px-12">
          <nav data-hero className="flex items-center justify-between gap-4">
            <a className="brand-lockup" href="#top" aria-label="Aller en haut de page">
              <span className="brand-symbol">
                <Command size={19} />
              </span>
              <span>
                <span className="block text-xs uppercase tracking-[0.42em] text-porcelain/45">private index</span>
                <span className="block text-sm font-semibold text-porcelain">Free AI Atlas</span>
              </span>
            </a>

            <div className="flex items-center gap-2">
              {session ? (
                <button className="ghost-button" onClick={signOut}>
                  <LogOut size={16} /> Deconnexion
                </button>
              ) : (
                <button className="ghost-button" onClick={signInWithGoogle}>
                  <LogIn size={16} /> Espace admin
                </button>
              )}
              <a className="ghost-button hidden sm:inline-flex" href="#catalogue">
                Explorer <ArrowUpRight size={16} />
              </a>
            </div>
          </nav>

          <div id="top" className="grid gap-12 py-14 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:items-end">
            <div>
              <div data-hero className="editorial-kicker">
                <Sparkles size={16} /> Une bibliotheque selective des IA gratuites qui valent ton temps.
              </div>
              <h1 data-hero className="hero-heading">
                Le carnet noir des outils IA gratuits.
              </h1>
              <p data-hero className="hero-copy">
                Un repertoire personnel pense comme un desk de veille : clair, rapide, beau, et assez strict pour ne garder que les outils qui meritent une place.
              </p>
              <div data-hero className="mt-9 flex flex-wrap gap-3">
                <a className="solid-button" href="#catalogue">
                  Voir la selection <ArrowUpRight size={16} />
                </a>
                {isAdmin && (
                  <a className="soft-button" href="#admin">
                    <Plus size={16} /> Ajouter un outil
                  </a>
                )}
              </div>
            </div>

            <HeroConsole
              total={tools.length}
              visible={filteredTools.length}
              categories={categories.length - 1}
              featured={featuredCount}
              status={notice}
            />
          </div>
        </div>
      </section>

      <section id="catalogue" className="relative z-10 mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12">
        <div className="section-heading">
          <div>
            <p className="section-label">Catalogue</p>
            <h2>Une selection qui se parcourt comme une collection.</h2>
          </div>
          <p>
            Recherche par usage, filtre par categorie, puis ouvre directement l outil. Rien de superflu.
          </p>
        </div>

        {isAdmin && <AdminPanel onAddTool={addTool} />}
        {session && !isAdmin && (
          <div className="access-note">
            Connecte avec {session.user.email}. La console d ajout est reservee a {ADMIN_EMAIL}.
          </div>
        )}

        <div className="control-deck">
          <label className="search-field">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Chercher un outil, un tag, une intention"
            />
          </label>

          <div className="chip-row">
            <Filter className="shrink-0 text-porcelain/35" size={18} />
            {categories.map((item) => (
              <button
                key={item}
                className={`chip ${category === item ? 'chip-active' : ''}`}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="py-16 text-center text-porcelain/50">Synchronisation du catalogue...</p>
        ) : (
          <div ref={gridRef} className="tool-grid">
            {filteredTools.map((tool, index) => (
              <ToolCard key={tool.id} index={index} tool={tool} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

function BackgroundStage() {
  return (
    <div className="background-stage" aria-hidden="true">
      <div className="light light-one" />
      <div className="light light-two" />
      <div className="light light-three" />
      <div className="mesh-grid" />
      <div data-orbit className="orbit-ring orbit-one" />
      <div data-orbit className="orbit-ring orbit-two" />
    </div>
  )
}

function HeroConsole({ total, visible, categories, featured, status }) {
  return (
    <aside data-hero className="hero-console">
      <div className="console-header">
        <div>
          <p className="text-xs uppercase tracking-[0.36em] text-porcelain/38">live index</p>
          <p className="mt-2 text-2xl font-semibold text-porcelain">{visible} outils affiches</p>
        </div>
        <span className="console-badge">
          <Database size={18} />
        </span>
      </div>

      <div className="metric-grid">
        <Metric value={total} label="references" />
        <Metric value={categories} label="familles" />
        <Metric value={featured} label="favoris" />
      </div>

      <div className="signal-card">
        <ShieldCheck size={18} />
        <div>
          <p>Supabase</p>
          <span>{status || 'connexion en cours'}</span>
        </div>
      </div>
    </aside>
  )
}

function Metric({ value, label }) {
  return (
    <div className="metric-card" data-hero>
      <p>{value}</p>
      <span>{label}</span>
    </div>
  )
}

const emptyForm = {
  name: '',
  tagline: '',
  category: '',
  url: '',
  pricing_note: 'Plan gratuit disponible',
  tags: '',
  is_featured: false,
}

function AdminPanel({ onAddTool }) {
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function submitTool(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      await onAddTool({
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
      setForm(emptyForm)
      setMessage('Ajoute au catalogue.')
    } catch (error) {
      setMessage(error.message || 'Ajout impossible.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section id="admin" className="admin-panel">
      <div className="admin-intro">
        <p>Console privee</p>
        <h3>Nouveau signal a indexer.</h3>
      </div>

      <form className="admin-form" onSubmit={submitTool}>
        <TextInput label="Nom public" value={form.name} onChange={(value) => updateField('name', value)} required />
        <TextInput label="Famille" value={form.category} onChange={(value) => updateField('category', value)} required />
        <TextInput label="Adresse" type="url" value={form.url} onChange={(value) => updateField('url', value)} required />
        <TextInput
          label="Mode gratuit"
          value={form.pricing_note}
          onChange={(value) => updateField('pricing_note', value)}
        />
        <TextInput
          label="Phrase de selection"
          value={form.tagline}
          onChange={(value) => updateField('tagline', value)}
          required
          wide
        />
        <TextInput
          label="Tags, separes par virgules"
          value={form.tags}
          onChange={(value) => updateField('tags', value)}
          wide
        />
        <label className="admin-check">
          <input
            checked={form.is_featured}
            onChange={(event) => updateField('is_featured', event.target.checked)}
            type="checkbox"
          />
          Mettre en avant dans la selection
        </label>
        <button className="solid-button justify-center" disabled={saving} type="submit">
          <Plus size={16} /> {saving ? 'Publication...' : 'Publier'}
        </button>
      </form>
      {message && <p className="admin-message">{message}</p>}
    </section>
  )
}

function TextInput({ label, value, onChange, type = 'text', required = false, wide = false }) {
  return (
    <label className={`admin-field ${wide ? 'lg:col-span-2' : ''}`}>
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </label>
  )
}

function ToolCard({ tool, index }) {
  return (
    <article data-tool-card className={index === 0 ? 'tool-card tool-card-featured' : 'tool-card'}>
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="tool-category">{tool.category}</p>
          <h3>{tool.name}</h3>
        </div>
        {tool.is_featured && (
          <span className="featured-mark" title="Selection">
            <Check size={16} />
          </span>
        )}
      </div>
      <p className="tool-copy">{tool.tagline}</p>
      <div className="tag-row">
        {(tool.tags ?? []).map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>
      <div className="tool-footer">
        <span>{tool.pricing_note}</span>
        <a href={tool.url} target="_blank" rel="noreferrer">
          Visiter <ArrowUpRight size={16} />
        </a>
      </div>
    </article>
  )
}

createRoot(document.getElementById('root')).render(<App />)
