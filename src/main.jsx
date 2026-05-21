import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createClient } from '@supabase/supabase-js'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowUpRight,
  Command,
  Search,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Globe,
  Layout,
} from 'lucide-react'
import './styles.css'

gsap.registerPlugin(ScrollTrigger)

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xnilbpzflfsimnkqxmog.supabase.co'
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_M7ILY-6b_MRYuu4l3BXLOA_TQEPKTyA'
const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey)

const supabase = hasSupabaseConfig ? createClient(supabaseUrl, supabaseAnonKey) : null

const fallbackTools = [
  { id: 'chatgpt', name: 'ChatGPT', tagline: 'The worlds most capable and versatile conversational intelligence.', category: 'Assistant', url: 'https://chatgpt.com', pricing_note: 'Free Plan', tags: ['text', 'logic'], is_featured: true },
  { id: 'claude', name: 'Claude', tagline: 'A sophisticated assistant focused on safety, precision, and reasoning.', category: 'Assistant', url: 'https://claude.ai', pricing_note: 'Free Plan', tags: ['analysis', 'writing'], is_featured: true },
  { id: 'perplexity', name: 'Perplexity', tagline: 'A research engine that provides direct, cited answers from the live web.', category: 'Research', url: 'https://www.perplexity.ai', pricing_note: 'Free Plan', tags: ['search', 'data'], is_featured: true },
  { id: 'ideogram', name: 'Ideogram', tagline: 'Advanced image generation with industry-leading typography rendering.', category: 'Design', url: 'https://ideogram.ai', pricing_note: 'Credits', tags: ['visuals', 'design'], is_featured: true },
  { id: 'google-studio', name: 'AI Studio', tagline: 'Fast, flexible playground for prototyping with the latest Gemini models.', category: 'Dev', url: 'https://aistudio.google.com', pricing_note: 'Free', tags: ['api', 'models'], is_featured: false },
]

function App() {
  const [tools, setTools] = useState(fallbackTools)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(hasSupabaseConfig)
  
  const mainRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Entrance
      const tl = gsap.timeline()
      tl.from('.animate-text', {
        y: 80,
        opacity: 0,
        duration: 1.4,
        stagger: 0.1,
        ease: 'expo.out'
      })
      tl.from('.animate-fade', {
        opacity: 0,
        duration: 1,
        ease: 'power2.out'
      }, '-=0.8')

      // Scroll reveals
      gsap.utils.toArray('.apple-card').forEach((card, i) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
          },
          y: 60,
          opacity: 0,
          duration: 1.2,
          ease: 'expo.out',
          delay: (i % 3) * 0.1
        })
      })
    }, mainRef)
    return () => ctx.revert()
  }, [tools])

  useEffect(() => {
    async function loadTools() {
      if (!supabase) { setLoading(false); return; }
      const { data, error } = await supabase.from('ai_tools').select('*').order('is_featured', { ascending: false }).order('name', { ascending: true })
      if (!error && data?.length) setTools(data)
      setLoading(false)
    }
    loadTools()
  }, [])

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(tools.map((tool) => tool.category))).sort()]
  }, [tools])

  const filteredTools = useMemo(() => {
    const q = query.toLowerCase()
    return tools.filter((t) => {
      const matches = category === 'All' || t.category === category
      return matches && (t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q))
    })
  }, [category, query, tools])

  return (
    <div ref={mainRef} className="min-h-screen bg-[#f5f5f7]">
      <div className="blur-overlay">
        <div className="blur-circle h-[600px] w-[600px] -top-48 -left-48" />
        <div className="blur-circle h-[500px] w-[500px] top-1/2 -right-24 bg-blue-400/10" />
      </div>

      {/* Nav */}
      <nav className="nav-glass px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <Command size={20} className="text-[#1d1d1f]" />
           <span className="text-[14px] font-bold tracking-tight">Atlas</span>
        </div>
        <div className="flex items-center gap-8 text-[12px] font-semibold text-[#1d1d1f]/80">
          <a href="#directory" className="hover:text-[#0071e3] transition-colors">Directory</a>
          <a href="#" className="hover:text-[#0071e3] transition-colors">About</a>
          <button className="h-7 px-3 bg-[#1d1d1f] text-white rounded-full text-[11px] font-bold">Access</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-gradient pt-32 pb-24 sm:pt-48 sm:pb-32">
        <div className="content-section text-center">
          <div className="animate-fade mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[13px] font-semibold text-[#86868b] shadow-sm">
             <Sparkles size={14} className="text-[#0071e3]" /> 
             The curated AI repository
          </div>
          <h1 className="heading-1 animate-text">
            Intelligence. <br />
            <span className="text-[#86868b]">Without the friction.</span>
          </h1>
          <p className="animate-text mt-8 mx-auto max-w-2xl text-xl font-medium text-[#86868b] sm:text-2xl leading-relaxed">
            A premium index of artificial intelligence tools that respect your time and resources. Verified, tested, and ready to deploy.
          </p>
          <div className="animate-fade mt-12 flex flex-wrap justify-center gap-4">
             <a href="#directory" className="btn-apple">Explore Index</a>
             <button className="btn-secondary">Learn more <ChevronRight size={16} /></button>
          </div>
        </div>
      </section>

      {/* Directory */}
      <section id="directory" className="py-24 sm:py-32">
        <div className="content-section">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-24">
             <div className="max-w-xl">
                <h2 className="text-4xl font-bold tracking-tight text-[#1d1d1f] sm:text-5xl">Our Directory</h2>
                <p className="mt-4 text-lg font-medium text-[#86868b]">We only index models that fundamentally enhance human output. Each entry is manually verified for quality and utility.</p>
             </div>
             
             <div className="flex flex-col gap-6 w-full md:w-[450px]">
                <div className="relative group">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b]" size={20} />
                   <input 
                     type="text" 
                     placeholder="Search tools, tags, or features"
                     className="search-input"
                     value={query}
                     onChange={(e) => setQuery(e.target.value)}
                   />
                </div>
                <div className="flex flex-wrap gap-2">
                   {categories.map(c => (
                     <button 
                       key={c}
                       onClick={() => setCategory(c)}
                       className={`category-pill ${category === c ? 'active' : ''}`}
                     >
                       {c}
                     </button>
                   ))}
                </div>
             </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
             {filteredTools.map((tool) => (
               <div key={tool.id} className="apple-card group">
                  <div className="flex items-start justify-between mb-8">
                     <div className="h-12 w-12 rounded-2xl bg-[#f5f5f7] flex items-center justify-center text-[#1d1d1f] group-hover:bg-[#0071e3] group-hover:text-white transition-colors duration-500">
                        {tool.category === 'Assistant' ? <Layout size={24} /> : <Globe size={24} />}
                     </div>
                     {tool.is_featured && (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#0071e3] bg-[#0071e3]/5 px-3 py-1 rounded-full">
                           Featured
                        </span>
                     )}
                  </div>
                  
                  <h3 className="text-2xl font-bold tracking-tight text-[#1d1d1f] mb-2">{tool.name}</h3>
                  <p className="text-[15px] font-medium text-[#86868b] leading-relaxed mb-8 h-12 overflow-hidden line-clamp-2">
                    {tool.tagline}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-10">
                    {tool.tags?.map(tag => (
                      <span key={tag} className="tag-pill">{tag}</span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-black/[0.05]">
                    <span className="text-[13px] font-semibold text-[#86868b]">{tool.pricing_note}</span>
                    <a 
                      href={tool.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f5f7] hover:bg-[#1d1d1f] hover:text-white transition-all duration-300"
                    >
                      <ArrowUpRight size={18} />
                    </a>
                  </div>
               </div>
             ))}
          </div>
          
          {loading && (
             <div className="mt-24 flex justify-center">
                <div className="h-8 w-8 animate-spin border-b-2 border-[#0071e3] rounded-full" />
             </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 border-t border-black/[0.05]">
        <div className="content-section flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-lg bg-[#1d1d1f] flex items-center justify-center text-white"><Command size={16} /></div>
             <span className="text-[14px] font-bold tracking-tight">Free AI Atlas</span>
          </div>
          <div className="flex gap-12 text-[13px] font-medium text-[#86868b]">
             <a href="#" className="hover:text-[#1d1d1f] transition-colors">Privacy</a>
             <a href="#" className="hover:text-[#1d1d1f] transition-colors">Ethics</a>
             <a href="#" className="hover:text-[#1d1d1f] transition-colors">Github</a>
          </div>
          <div className="text-[13px] font-medium text-[#86868b]">
            © 2026 Apple-grade quality
          </div>
        </div>
      </footer>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
