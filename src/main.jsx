import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createClient } from '@supabase/supabase-js'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
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
  Sparkles,
  Menu,
  X,
  ChevronRight,
  Globe,
  Tag
} from 'lucide-react'
import './styles.css'

gsap.registerPlugin(ScrollTrigger)

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xnilbpzflfsimnkqxmog.supabase.co'
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_M7ILY-6b_MRYuu4l3BXLOA_TQEPKTyA'
const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey)
const ADMIN_EMAIL = 'ndarawpro@gmail.com'
const productionUrl = 'https://freeailist-navy.vercel.app'

const supabase = hasSupabaseConfig ? createClient(supabaseUrl, supabaseAnonKey) : null

const fallbackTools = [
  { id: 'chatgpt', name: 'ChatGPT', tagline: 'The definitive conversational AI for writing, coding, and learning.', category: 'Assistant', url: 'https://chatgpt.com', pricing_note: 'Free plan available', tags: ['text', 'code', 'productivity'], is_featured: true },
  { id: 'claude', name: 'Claude', tagline: 'Highly sophisticated AI assistant built for safety and complex reasoning.', category: 'Assistant', url: 'https://claude.ai', pricing_note: 'Free plan available', tags: ['text', 'analysis'], is_featured: true },
  { id: 'perplexity', name: 'Perplexity', tagline: 'Real-time web search powered by AI with transparent source citations.', category: 'Search', url: 'https://www.perplexity.ai', pricing_note: 'Free plan available', tags: ['search', 'sources'], is_featured: true },
  { id: 'google-ai-studio', name: 'Google AI Studio', tagline: 'State-of-the-art playground for experimenting with Gemini models.', category: 'Developer', url: 'https://aistudio.google.com', pricing_note: 'Free with limits', tags: ['api', 'gemini', 'prototype'], is_featured: false },
  { id: 'ideogram', name: 'Ideogram', tagline: 'Leading image generation with exceptional typography and design rendering.', category: 'Image', url: 'https://ideogram.ai', pricing_note: 'Free credits', tags: ['image', 'design'], is_featured: false },
  { id: 'huggingface', name: 'Hugging Face', tagline: 'The open-source community platform for machine learning and AI demos.', category: 'Open Source', url: 'https://huggingface.co/spaces', pricing_note: 'Free access', tags: ['open-source', 'models'], is_featured: false },
]

function App() {
  const [tools, setTools] = useState(fallbackTools)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(hasSupabaseConfig)
  const [session, setSession] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const mainRef = useRef(null)
  const heroRef = useRef(null)
  const gridRef = useRef(null)

  // Initial Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Entrance
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
      tl.from('.hero-reveal-text', {
        y: 100,
        opacity: 0,
        duration: 1.5,
        stagger: 0.1,
      })
      tl.from('.hero-fade', {
        opacity: 0,
        duration: 1,
      }, '-=0.8')
      
      // Reveal on scroll
      gsap.from('[data-scroll]', {
        scrollTrigger: {
          trigger: '[data-scroll]',
          start: 'top 80%',
        },
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2
      })
    }, mainRef)
    return () => ctx.revert()
  }, [])

  // Supabase Auth
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => subscription.unsubscribe()
  }, [])

  // Load Tools
  useEffect(() => {
    async function loadTools() {
      if (!supabase) {
        setLoading(false)
        return
      }
      const { data, error } = await supabase
        .from('ai_tools')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('name', { ascending: true })

      if (!error && data?.length) setTools(data)
      setLoading(false)
    }
    loadTools()
  }, [])

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(tools.map((tool) => tool.category))).sort()]
  }, [tools])

  const filteredTools = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return tools.filter((tool) => {
      const matchesCategory = category === 'All' || tool.category === category
      const searchable = [tool.name, tool.tagline, tool.category, ...(tool.tags ?? [])].join(' ').toLowerCase()
      return matchesCategory && searchable.includes(normalizedQuery)
    })
  }, [category, query, tools])

  const isAdmin = session?.user?.email?.toLowerCase() === ADMIN_EMAIL

  async function signInWithGoogle() {
    if (!supabase) return
    const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    const redirectTo = isLocalhost ? window.location.origin : productionUrl
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
  }

  return (
    <div ref={mainRef} className="site-root bg-[#050505]">
      <div className="premium-bg" />
      <div className="noise" />

      {/* Navigation */}
      <nav className="nav-blur">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between px-6 py-8 sm:px-12">
          <a href="#" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center bg-white text-black transition-transform group-hover:rotate-90">
              <Command size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">Atlas</span>
              <span className="text-sm font-bold text-white">Free AI Index</span>
            </div>
          </a>

          <div className="hidden items-center gap-12 text-xs font-bold uppercase tracking-widest md:flex">
            <a href="#catalogue" className="text-white/60 transition-colors hover:text-white">Directory</a>
            {isAdmin && <a href="#admin" className="text-white/60 transition-colors hover:text-white">Dashboard</a>}
            {session ? (
              <button onClick={() => supabase.auth.signOut()} className="text-white/60 hover:text-white">Sign Out</button>
            ) : (
              <button onClick={signInWithGoogle} className="text-accent hover:text-white">Admin Access</button>
            )}
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-24 sm:px-12 lg:py-48">
        <div className="mx-auto max-w-[1800px]">
          <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-accent hero-fade">
            <Sparkles size={12} /> Curated Excellence
          </div>
          
          <h1 className="hero-title mt-12 text-balance">
            <div className="overflow-hidden">
              <span className="hero-reveal-text block">The Black Book of</span>
            </div>
            <div className="overflow-hidden">
              <span className="hero-reveal-text block italic font-serif text-accent">Free Intelligence.</span>
            </div>
          </h1>

          <p className="hero-fade mt-12 max-w-3xl text-xl leading-relaxed text-white/50 sm:text-2xl">
            A premium repository of AI tools that respect your resources. No filler, no noise—only the models that define the current era of intelligence.
          </p>

          <div className="hero-fade mt-16 flex flex-wrap gap-6">
            <a href="#catalogue" className="btn-premium">Explore the Index</a>
            <a href="#catalogue" className="btn-ghost">View Trending</a>
          </div>
        </div>
      </section>

      {/* Catalogue Section */}
      <section id="catalogue" className="border-t border-white/[0.05] bg-white/[0.01] px-6 py-32 sm:px-12">
        <div className="mx-auto max-w-[1800px]">
          <div className="flex flex-col justify-between gap-12 lg:flex-row lg:items-end">
            <div data-scroll>
              <h2 className="text-5xl font-normal sm:text-7xl">The Directory</h2>
              <p className="mt-6 max-w-xl text-lg text-white/40">Filtered by utility, verified for quality. Browse our selection of world-class AI models available at no cost.</p>
            </div>
            
            <div data-scroll className="flex w-full flex-col gap-8 lg:w-auto">
              <div className="relative group">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-white/20 transition-colors group-focus-within:text-accent" size={24} />
                <input 
                  type="text" 
                  placeholder="Search by name, tag or purpose..."
                  className="input-premium pl-10"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap gap-3">
                {categories.map((c) => (
                  <button 
                    key={c} 
                    className={`category-chip ${category === c ? 'active' : ''}`}
                    onClick={() => setCategory(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div ref={gridRef} className="mt-32 grid gap-px border border-white/[0.05] bg-white/[0.05] md:grid-cols-2 xl:grid-cols-3">
            {filteredTools.map((tool, index) => (
              <ToolCard key={tool.id} tool={tool} index={index} />
            ))}
          </div>

          {loading && (
            <div className="mt-24 flex justify-center py-24">
              <div className="h-12 w-12 animate-spin border-b-2 border-accent" />
            </div>
          )}
        </div>
      </section>

      {/* Admin Section (Simplified for design) */}
      {isAdmin && (
        <section id="admin" className="px-6 py-32 sm:px-12">
           <div className="mx-auto max-w-[1800px]">
              <div className="glass-card">
                 <h3 className="text-4xl">Add New Signal</h3>
                 <p className="text-white/40 mt-2">The console is live. Index a new tool into the directory.</p>
                 {/* Admin form would go here, keeping it lean for visual focus */}
                 <button className="btn-premium mt-12">Open Creation Suite</button>
              </div>
           </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-white/[0.05] px-6 py-24 sm:px-12">
        <div className="mx-auto flex max-w-[1800px] flex-col justify-between gap-12 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
             <div className="h-8 w-8 bg-white/10 flex items-center justify-center"><Command size={16} /></div>
             <span className="text-xs font-bold uppercase tracking-widest text-white/40">© 2026 Free AI Atlas. All rights reserved.</span>
          </div>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-white/40">
            <a href="#" className="hover:text-accent transition-colors">Privacy</a>
            <a href="#" className="hover:text-accent transition-colors">Twitter</a>
            <a href="#" className="hover:text-accent transition-colors">Github</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function ToolCard({ tool, index }) {
  return (
    <div className="glass-card group min-h-[450px] flex flex-col justify-between">
      <div className="hover-reveal" />
      
      <div>
        <div className="flex items-start justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent/60">{tool.category}</span>
          {tool.is_featured && <Sparkles size={16} className="text-accent" />}
        </div>
        
        <h3 className="mt-8 text-4xl leading-tight text-white group-hover:text-accent transition-colors">{tool.name}</h3>
        <p className="mt-6 text-lg leading-relaxed text-white/40">{tool.tagline}</p>
        
        <div className="mt-8 flex flex-wrap gap-2">
          {tool.tags?.map(tag => (
            <span key={tag} className="flex items-center gap-1.5 border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/30">
              <Tag size={10} /> {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-12 flex items-end justify-between border-t border-white/5 pt-8">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Pricing</span>
          <span className="text-xs font-medium text-white/60">{tool.pricing_note}</span>
        </div>
        <a 
          href={tool.url} 
          target="_blank" 
          rel="noreferrer" 
          className="flex h-12 w-12 items-center justify-center border border-white/10 bg-white/5 text-white transition-all hover:bg-white hover:text-black"
        >
          <ArrowUpRight size={20} />
        </a>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
