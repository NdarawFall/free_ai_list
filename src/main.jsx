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
  ArrowRight,
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
  { id: 'chatgpt', name: 'ChatGPT', tagline: 'A multi-modal intelligence for expansive creativity and problem solving.', category: 'Assistant', url: 'https://chatgpt.com', pricing_note: 'Free Tier', tags: ['text', 'code'], is_featured: true },
  { id: 'claude', name: 'Claude', tagline: 'The nuanced conversationalist, designed for precision and logical clarity.', category: 'Assistant', url: 'https://claude.ai', pricing_note: 'Free Tier', tags: ['text', 'analysis'], is_featured: true },
  { id: 'perplexity', name: 'Perplexity', tagline: 'Direct answers sourced from the living web. Truth in real-time.', category: 'Search', url: 'https://www.perplexity.ai', pricing_note: 'Free Tier', tags: ['search'], is_featured: true },
  { id: 'ideogram', name: 'Ideogram', tagline: 'Graphic design autonomy through advanced typographic synthesis.', category: 'Visuals', url: 'https://ideogram.ai', pricing_note: 'Credits', tags: ['image'], is_featured: true },
  { id: 'mistral', name: 'Mistral Pi', tagline: 'Efficient, open-weight intelligence for the decentralized future.', category: 'Developer', url: 'https://mistral.ai', pricing_note: 'Free API', tags: ['api'], is_featured: false },
]

function App() {
  const [tools, setTools] = useState(fallbackTools)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(hasSupabaseConfig)
  const [session, setSession] = useState(null)
  
  const mainRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.reveal-item', {
        y: 60,
        opacity: 0,
        duration: 1.2,
        stagger: 0.1,
        ease: 'power3.out'
      })
      
      gsap.from('.tool-row', {
        scrollTrigger: {
          trigger: '.tool-list',
          start: 'top 80%',
        },
        opacity: 0,
        y: 40,
        duration: 1,
        stagger: 0.05,
        ease: 'power2.out'
      })
    }, mainRef)
    return () => ctx.revert()
  }, [tools])

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    async function loadTools() {
      if (!supabase) { setLoading(false); return; }
      const { data, error } = await supabase.from('ai_tools').select('*').order('name', { ascending: true })
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
    <div ref={mainRef} className="min-h-screen">
      <div className="site-border" />
      <div className="background-asset" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 sm:px-12 lg:px-20 py-8 mix-blend-difference text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
             <Command size={18} />
             <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Atlas Index</span>
          </div>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-[0.3em]">
             <a href="#directory" className="hover:line-through">Directory</a>
             {session ? (
               <button onClick={() => supabase.auth.signOut()}>Logout</button>
             ) : (
               <button onClick={() => {}}>Access</button>
             )}
          </div>
        </div>
      </nav>

      <main className="main-container">
        {/* Header Section */}
        <section className="min-h-[90vh] flex flex-col justify-center section-padding">
           <div className="editorial-header">
              <div className="reveal-item flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-neutral-400">
                 <Sparkles size={12} /> The New Standard in AI Curation
              </div>
              <h1 className="reveal-item text-7xl sm:text-8xl lg:text-[10rem] leading-[0.9] tracking-tight text-balance">
                Utility over <br /> <span className="italic serif">everything.</span>
              </h1>
              <div className="reveal-item line-divider mt-8" />
              <div className="reveal-item flex flex-col md:flex-row justify-between w-full gap-8">
                 <p className="max-w-md text-lg text-neutral-500 leading-relaxed">
                   Free AI Atlas is a surgical collection of machine intelligence. We do not index hype. We index tools that fundamentally enhance the human workflow without the tax of subscriptions.
                 </p>
                 <div className="flex items-end">
                    <a href="#directory" className="btn-bespoke">
                      Browse Index <ArrowRight size={14} className="ml-2" />
                    </a>
                 </div>
              </div>
           </div>
        </section>

        {/* Directory Section */}
        <section id="directory" className="section-padding border-t border-black">
           <div className="flex flex-col gap-24">
              <div className="flex flex-col md:flex-row justify-between items-baseline gap-12">
                 <h2 className="text-5xl sm:text-6xl italic serif">The Directory</h2>
                 
                 <div className="flex flex-col gap-8 w-full md:w-[400px]">
                    <div className="relative">
                       <input 
                         type="text" 
                         placeholder="Search Index"
                         className="input-minimal"
                         value={query}
                         onChange={(e) => setQuery(e.target.value)}
                       />
                       <Search className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-4">
                       {categories.map(c => (
                         <button 
                           key={c}
                           onClick={() => setCategory(c)}
                           className={`filter-tab ${category === c ? 'active' : ''}`}
                         >
                           {c}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="tool-list mt-12">
                 {filteredTools.map((tool) => (
                   <div key={tool.id} className="tool-row">
                      <div className="category">{tool.category}</div>
                      <div>
                        <h3 className="name">{tool.name}</h3>
                        <p className="tagline mt-2">{tool.tagline}</p>
                      </div>
                      <div className="flex justify-end items-center">
                         <a 
                           href={tool.url} 
                           target="_blank" 
                           rel="noreferrer" 
                           className="flex h-14 w-14 items-center justify-center border border-black/5 hover:bg-black hover:text-white transition-all duration-500"
                         >
                            <ArrowUpRight size={20} />
                         </a>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Footer */}
        <footer className="footer-minimal mt-32 flex flex-col md:flex-row justify-between gap-8">
           <div className="flex items-center gap-4">
              <Command size={14} />
              <span>Free AI Atlas — Built 2026</span>
           </div>
           <div className="flex gap-12">
              <a href="#" className="hover:underline">Ethics</a>
              <a href="#" className="hover:underline">Github</a>
              <a href="#" className="hover:underline">Privacy</a>
           </div>
        </footer>
      </main>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
