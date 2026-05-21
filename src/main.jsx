import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Home, Zap, Settings, Terminal, BookOpen } from 'lucide-react'
import './styles.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] transition-colors duration-500">
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-1 h-14 px-4 rounded-full border border-[var(--border)] bg-white/60 backdrop-blur-2xl shadow-xl min-w-max">
          {[
            { path: '/', label: 'Accueil', icon: Home },
            { path: '/ai', label: 'AI', icon: Zap },
            { path: '/tools', label: 'Outils', icon: Settings },
            { path: '/prompts', label: 'Prompts', icon: Terminal },
            { path: '/blog', label: 'Blog', icon: BookOpen }
          ].map(link => (
            <Link key={link.path} to={link.path} className="flex items-center gap-2 px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-wider text-slate-500 hover:text-black transition-all">
              <link.icon size={14} /> {link.label}
            </Link>
          ))}
        </nav>

        <main className="layout-container pt-40 pb-24">
          <Routes>
            <Route path="/" element={<div className="text-center"><h1 className="text-6xl font-black tracking-tighter">Free AI Atlas</h1><p className="text-body mt-6">La sélection chirurgicale pour créateurs.</p></div>} />
            <Route path="*" element={<div className="text-center"><h1 className="text-4xl font-bold">Page en construction</h1></div>} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

const root = createRoot(document.getElementById('root'))
root.render(<App />)
