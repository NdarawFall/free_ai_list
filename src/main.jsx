import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createClient } from '@supabase/supabase-js'
import { gsap } from 'gsap'
import {
  ArrowUpRight,
  BrainCircuit,
  Check,
  Database,
  Filter,
  Layers3,
  Search,
  Sparkles,
} from 'lucide-react'
import './styles.css'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xnilbpzflfsimnkqxmog.supabase.co'
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_M7ILY-6b_MRYuu4l3BXLOA_TQEPKTyA'
const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey)

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
  const heroRef = useRef(null)
  const gridRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-hero]', {
        y: 28,
        opacity: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: 'power3.out',
      })
      gsap.from('[data-stat]', {
        scale: 0.94,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        delay: 0.25,
        ease: 'back.out(1.4)',
      })
    }, heroRef)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-tool-card]', {
        y: 18,
        opacity: 0,
        duration: 0.45,
        stagger: 0.05,
        ease: 'power2.out',
      })
    }, gridRef)
    return () => ctx.revert()
  }, [tools, query, category])

  useEffect(() => {
    async function loadTools() {
      if (!supabase) {
        setNotice('Mode demo')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('ai_tools')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('name', { ascending: true })

      if (error) {
        setNotice('Supabase indisponible')
      } else if (data?.length) {
        setTools(data)
        setNotice('Connecte a Supabase')
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
  const visibleCount = filteredTools.length

  return (
    <main className="relative min-h-screen overflow-hidden bg-cloud text-ink">
      <div className="aurora-wrap" aria-hidden="true">
        <span className="aurora aurora-one" />
        <span className="aurora aurora-two" />
        <span className="aurora aurora-three" />
      </div>
      <div className="noise-layer" aria-hidden="true" />

      <section ref={heroRef} className="relative border-b border-white/10">
        <div className="mx-auto grid min-h-[82vh] max-w-7xl content-between px-5 py-6 sm:px-8 lg:px-10">
          <nav data-hero className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm font-semibold tracking-wide text-white">
              <span className="brand-mark">
                <BrainCircuit size={18} />
              </span>
              Free AI List
            </div>
            <a className="icon-link" href="#catalogue">
              Catalogue <ArrowUpRight size={16} />
            </a>
          </nav>

          <div className="grid gap-10 py-14 lg:grid-cols-[1.04fr_0.96fr] lg:items-end">
            <div>
              <div data-hero className="eyebrow">
                <Sparkles size={16} /> Catalogue IA gratuit, vivant et prive
              </div>
              <h1 data-hero className="hero-title mt-6 max-w-5xl text-5xl font-semibold leading-[1.02] sm:text-7xl lg:text-8xl">
                Les outils IA gratuits que tu veux garder sous la main.
              </h1>
              <p data-hero className="mt-6 max-w-2xl text-lg leading-8 text-white/[0.64]">
                Un repertoire personnel, rapide et propre pour retrouver les assistants,
                generateurs, moteurs de recherche et plateformes IA gratuites que tu connais.
              </p>
              <div data-hero className="mt-8 flex flex-wrap gap-3">
                <a className="primary-link" href="#catalogue">
                  Explorer <ArrowUpRight size={16} />
                </a>
                <span className="status-pill">
                  <Database size={16} /> {notice || 'Connexion Supabase'}
                </span>
              </div>
            </div>

            <div data-hero className="panel">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="text-sm text-white/[0.45]">Vue actuelle</p>
                  <p className="mt-1 text-xl font-semibold text-white">
                    {visibleCount} outil{visibleCount > 1 ? 's' : ''} visible{visibleCount > 1 ? 's' : ''}
                  </p>
                </div>
                <Layers3 className="text-cyan" size={26} />
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                <Stat value={tools.length} label="Outils" />
                <Stat value={categories.length - 1} label="Categories" />
                <Stat value={featuredCount} label="Favoris" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="catalogue" className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        <div className="sticky top-0 z-10 -mx-5 border-b border-white/10 bg-cloud/70 px-5 py-4 backdrop-blur-2xl sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="search-field">
              <Search size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher un outil, tag ou usage"
              />
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
              <Filter className="shrink-0 text-white/[0.38]" size={18} />
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
        </div>

        {loading ? (
          <p className="py-16 text-center text-white/[0.55]">Chargement du catalogue...</p>
        ) : (
          <div ref={gridRef} className="grid gap-4 py-8 md:grid-cols-2 xl:grid-cols-3">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

function Stat({ value, label }) {
  return (
    <div data-stat className="stat-tile">
      <p className="text-3xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-sm text-white/[0.45]">{label}</p>
    </div>
  )
}

function ToolCard({ tool }) {
  return (
    <article data-tool-card className="tool-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-cyan">{tool.category}</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{tool.name}</h2>
        </div>
        {tool.is_featured && (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lime text-cloud shadow-glow" title="Favori">
            <Check size={16} />
          </span>
        )}
      </div>
      <p className="mt-5 min-h-14 text-sm leading-6 text-white/[0.58]">{tool.tagline}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {(tool.tags ?? []).map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-7 flex items-center justify-between gap-4 border-t border-white/10 pt-5">
        <span className="text-sm text-white/[0.45]">{tool.pricing_note}</span>
        <a className="visit-link" href={tool.url} target="_blank" rel="noreferrer">
          Ouvrir <ArrowUpRight size={16} />
        </a>
      </div>
    </article>
  )
}

createRoot(document.getElementById('root')).render(<App />)
