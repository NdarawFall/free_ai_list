import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createClient } from '@supabase/supabase-js'
import { gsap } from 'gsap'
import {
  ArrowUpRight,
  BookOpenText,
  CheckCircle2,
  Database,
  Filter,
  ImagePlus,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Plus,
  Quote,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Wrench,
  Zap,
} from 'lucide-react'
import './styles.css'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xnilbpzflfsimnkqxmog.supabase.co'
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_M7ILY-6b_MRYuu4l3BXLOA_TQEPKTyA'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const CLOUDINARY_CLOUD_NAME = 'dkvympjyk'
const CLOUDINARY_UPLOAD_PRESET = 'free_ai_list_unsigned'
const PRODUCTION_URL = 'https://freeailist-navy.vercel.app'
const ADMIN_CHECK_ERROR = 'Verification admin impossible. Regarde la policy app_admins dans Supabase.'

const pages = [
  { id: 'home', label: 'Accueil', icon: Sparkles },
  { id: 'ai', label: 'IA', icon: Zap },
  { id: 'tools', label: 'Outils', icon: Wrench },
  { id: 'prompts', label: 'Prompts', icon: Quote },
  { id: 'blog', label: 'Blog', icon: BookOpenText },
]

const aiCategories = ['Tous', 'Texte', 'Image', 'Video', 'Musique', 'Autre']
const appPages = pages.map((page) => page.id)

const fallbackItems = [
  {
    id: 'fallback-chatgpt',
    type: 'ai',
    title: 'ChatGPT',
    description: 'Assistant polyvalent pour écrire, coder, apprendre et clarifier tes idées.',
    url: 'https://chatgpt.com',
    category: 'Texte',
    image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
    tags: ['texte', 'code', 'productivite'],
    is_featured: true,
  },
  {
    id: 'fallback-perplexity',
    type: 'ai',
    title: 'Perplexity',
    description: 'Recherche web assistée par IA, utile pour obtenir des réponses sourcées rapidement.',
    url: 'https://www.perplexity.ai',
    category: 'Autre',
    image_url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
    tags: ['recherche', 'sources'],
    is_featured: true,
  },
  {
    id: 'fallback-figma',
    type: 'tool',
    title: 'Figma',
    description: 'Design UI, prototypes et design systems dans une interface collaborative.',
    url: 'https://figma.com',
    category: 'Design',
    image_url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80',
    tags: ['ui', 'design'],
    is_featured: true,
  },
  {
    id: 'fallback-github',
    type: 'tool',
    title: 'GitHub',
    description: 'Gestion de code, collaboration et publication de projets web.',
    url: 'https://github.com',
    category: 'Developpement',
    image_url: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=1200&q=80',
    tags: ['code', 'git'],
    is_featured: false,
  },
  {
    id: 'fallback-blog-stack',
    type: 'blog',
    title: 'Construire une stack gratuite sans se disperser',
    description: 'Une méthode courte pour choisir les bons outils et éviter l’empilement inutile.',
    category: 'Guide',
    image_url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
    body: 'Commence par un outil pour penser, un outil pour produire, un outil pour organiser et un outil pour publier. Le reste doit prouver sa valeur.',
    tags: ['stack', 'strategie'],
    is_featured: true,
  },
  {
    id: 'fallback-prompt-faceless',
    type: 'prompt',
    title: 'Script YouTube faceless clair et monétisable',
    description: 'Transforme une idée brute en script narratif structuré, avec hook, rythme et appel à l’action.',
    category: 'YouTube',
    body: 'Agis comme un scénariste YouTube faceless. Crée un script de 900 mots sur [SUJET], avec un hook de 12 secondes, trois parties, exemples concrets et une conclusion qui pousse à commenter.',
    tags: ['faceless', 'script', 'youtube'],
    is_featured: true,
  },
]

const emptyForm = {
  type: 'ai',
  title: '',
  description: '',
  url: '',
  category: 'Texte',
  image_url: '',
  body: '',
  tags: '',
  is_featured: false,
}

function App() {
  const [items, setItems] = useState([])
  const [session, setSession] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminChecking, setAdminChecking] = useState(false)
  const [activePage, setActivePage] = useState(getInitialPage())
  const [detailTarget, setDetailTarget] = useState(getInitialDetailTarget())
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Tous')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const heroRef = useRef(null)
  const authToastShownRef = useRef(false)

  const visibleItems = useMemo(() => {
    const source = items.length ? items : fallbackItems
    const type = activePage === 'tools' ? 'tool' : activePage === 'prompts' ? 'prompt' : activePage
    const needle = query.trim().toLowerCase()

    return source.filter((item) => {
      if (activePage === 'home') return false
      const matchesType = item.type === type
      const matchesCategory =
        activePage !== 'ai' || category === 'Tous' || normalizeCategory(item.category) === normalizeCategory(category)
      const haystack = [item.title, item.description, item.category, item.body, ...(item.tags || [])]
        .join(' ')
        .toLowerCase()
      return matchesType && matchesCategory && haystack.includes(needle)
    })
  }, [items, activePage, query, category])

  const counts = useMemo(() => {
    const source = items.length ? items : fallbackItems
    return {
      ai: source.filter((item) => item.type === 'ai').length,
      tools: source.filter((item) => item.type === 'tool').length,
      prompts: source.filter((item) => item.type === 'prompt').length,
      blog: source.filter((item) => item.type === 'blog').length,
    }
  }, [items])

  const detailItem = useMemo(() => {
    if (!detailTarget) return null
    const source = items.length ? items : fallbackItems
    return source.find((item) => item.id === detailTarget.id && item.type === detailTarget.type) || null
  }, [detailTarget, items])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-hero]', {
        y: 24,
        opacity: 0,
        duration: 0.8,
        stagger: 0.07,
        ease: 'power3.out',
      })
    }, heroRef)

    const glowTargets = gsap.utils.toArray('[data-glow]')
    const glowTween = glowTargets.length
      ? gsap.to(glowTargets, {
          xPercent: 8,
          yPercent: -4,
          scale: 1.08,
          duration: 6,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      : null

    return () => {
      glowTween?.kill()
      ctx.revert()
    }
  }, [])

  useEffect(() => {
    const revealItems = gsap.utils.toArray('[data-reveal]')
    const observers = revealItems.map((element) => {
      gsap.set(element, { y: 22, opacity: 0 })
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return
          gsap.to(element, { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out' })
          observer.disconnect()
        },
        { threshold: 0.18 },
      )
      observer.observe(element)
      return observer
    })

    return () => observers.forEach((observer) => observer.disconnect())
  }, [activePage, visibleItems.length, isAdmin])

  useEffect(() => {
    function onHashChange() {
      const route = parseRoute()
      setActivePage(route.page)
      setDetailTarget(route.detail)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        showToast('error', 'Session Supabase introuvable.')
        return
      }
      setSession(data.session)
      authToastShownRef.current = Boolean(data.session)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession)
      if (event === 'SIGNED_IN' && !authToastShownRef.current) {
        authToastShownRef.current = true
        window.history.replaceState(null, '', '#home')
        setActivePage('home')
        showToast('success', 'Connexion Google validée.')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    checkAdmin(session)
  }, [session])

  useEffect(() => {
    if (activePage === 'dashboard' && session && adminChecking) {
      return
    }

    if (activePage === 'dashboard' && !isAdmin) {
      setActivePage('home')
      window.history.replaceState(null, '', '#home')
      showToast('warning', 'Accès dashboard réservé à l’admin.')
    }
  }, [activePage, adminChecking, isAdmin, session])

  useEffect(() => {
    loadContent()
  }, [])

  useEffect(() => {
    setCategory('Tous')
    setQuery('')
  }, [activePage])

  async function loadContent() {
    setLoading(true)
    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      showToast('error', 'Impossible de charger content_items.')
      setItems([])
    } else {
      setItems(data || [])
    }
    setLoading(false)
  }

  async function checkAdmin(currentSession) {
    if (!currentSession?.user?.email) {
      setIsAdmin(false)
      setAdminChecking(false)
      return
    }

    setAdminChecking(true)
    const email = currentSession.user.email.trim().toLowerCase()

    const { data: rpcData, error: rpcError } = await supabase.rpc('is_current_admin')
    if (!rpcError && typeof rpcData === 'boolean') {
      setIsAdmin(rpcData)
      if (!rpcData) {
        showToast('warning', `${email} est connecté, mais absent de app_admins.`)
      }
      setAdminChecking(false)
      return
    }

    const { data, error } = await supabase
      .from('app_admins')
      .select('email')
      .eq('email', email)
      .maybeSingle()

    if (error) {
      setIsAdmin(false)
      showToast('error', ADMIN_CHECK_ERROR)
    } else {
      const allowed = Boolean(data)
      setIsAdmin(allowed)
      if (!allowed) {
        showToast('warning', `${email} est connecté, mais absent de app_admins.`)
      }
    }
    setAdminChecking(false)
  }

  async function signIn() {
    setMenuOpen(false)
    const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    const redirectTo = isLocalhost ? window.location.origin : PRODUCTION_URL
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    })
    if (error) {
      showToast('error', 'Google OAuth a refusé la connexion.')
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    authToastShownRef.current = false
    setMenuOpen(false)
    setActivePage('home')
    window.history.replaceState(null, '', '#home')
    showToast('success', 'Déconnecté.')
  }

  async function uploadImage(file) {
    const body = new FormData()
    body.append('file', file)
    body.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
    body.append('folder', 'free-ai-list')

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body,
    })
    const payload = await response.json()

    if (!response.ok) {
      throw new Error(payload?.error?.message || 'Upload Cloudinary impossible.')
    }

    return payload.secure_url
  }

  async function createItem(values, file) {
    let imageUrl = values.image_url
    if (file) {
      imageUrl = await uploadImage(file)
    }

    const payload = {
      type: values.type,
      title: values.title.trim(),
      description: values.description.trim(),
      url: values.url.trim() || null,
      category: values.category.trim() || 'Autre',
      image_url: imageUrl || null,
      body: values.body.trim() || null,
      tags: values.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      is_featured: values.is_featured,
    }

    const { data, error } = await supabase.from('content_items').insert(payload).select('*').single()
    if (error) throw error

    setItems((current) => [data, ...current])
    showToast('success', `${data.title} publié.`)
  }

  async function deleteItem(id) {
    const { error } = await supabase.from('content_items').delete().eq('id', id)
    if (error) {
      showToast('error', 'Suppression impossible.')
      throw error
    }
    setItems((current) => current.filter((item) => item.id !== id))
    showToast('success', 'Élément supprimé.')
  }

  function goTo(page) {
    if (page === 'dashboard' && !isAdmin) {
      showToast('warning', 'Connexion admin requise.')
      return
    }
    window.location.hash = page
    setActivePage(page)
    setDetailTarget(null)
    setMenuOpen(false)
  }

  function openItem(item) {
    if (['blog', 'prompt'].includes(item.type)) {
      const nextHash = `detail:${item.type}:${item.id}`
      window.location.hash = nextHash
      setActivePage('detail')
      setDetailTarget({ type: item.type, id: item.id })
      return
    }

    if (item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer')
    }
  }

  function showToast(type, message) {
    setToast({ id: Date.now(), type, message })
  }

  const currentPage = activePage === 'dashboard'
    ? (isAdmin ? 'dashboard' : 'home')
    : activePage

  return (
    <main className="site-shell">
      <Background />
      <Toast toast={toast} onClose={() => setToast(null)} />

      <header ref={heroRef} className="topbar">
        <nav data-hero className="nav">
          <button className="brand" onClick={() => goTo('home')}>
            <span className="brand-mark">
              <Sparkles size={17} />
            </span>
            <strong>Free AI Atlas</strong>
          </button>

          <button
            className={menuOpen ? 'menu-toggle active' : 'menu-toggle'}
            onClick={() => setMenuOpen((current) => !current)}
            aria-expanded={menuOpen}
            aria-label="Ouvrir le menu"
          >
            <Menu size={18} />
          </button>

          <div className={menuOpen ? 'nav-tabs open' : 'nav-tabs'}>
            {pages.map((page) => (
              <button
                key={page.id}
                className={currentPage === page.id ? 'nav-tab active' : 'nav-tab'}
                onClick={() => goTo(page.id)}
              >
                <page.icon size={15} />
                {page.label}
              </button>
            ))}
            {isAdmin && (
              <button
                className={currentPage === 'dashboard' ? 'nav-tab active' : 'nav-tab'}
                onClick={() => goTo('dashboard')}
              >
                <LayoutDashboard size={15} />
                Dashboard
              </button>
            )}
            {session ? (
              <button className="auth-button mobile-menu-auth" onClick={signOut}>
                <LogOut size={16} /> Sortir
              </button>
            ) : (
              <button className="google-button mobile-menu-auth" onClick={signIn}>
                <GoogleIcon /> Se connecter avec Google
              </button>
            )}
          </div>

          {session ? (
            <button className="auth-button desktop-auth" onClick={signOut}>
              <LogOut size={16} /> Sortir
            </button>
          ) : (
            <button className="google-button desktop-auth" onClick={signIn}>
              <GoogleIcon /> Se connecter avec Google
            </button>
          )}
        </nav>

        {currentPage === 'home' && (
          <section data-hero className="hero-grid">
            <div>
              <p className="eyebrow">
                <Sparkles size={15} />
                Pour createurs faceless, freelances et makers africains.
              </p>
              <h1>Des outils vraiment gratuits pour creer sans abonnement lourd.</h1>
              <p className="hero-copy">
                Free AI Atlas rassemble des IA, plateformes, outils creatifs et prompts qui aident vraiment les createurs a produire sans empiler des abonnements trop chers.
              </p>
              <div className="hero-actions">
                <button className="primary-action" onClick={() => document.getElementById('content')?.scrollIntoView({ behavior: 'smooth' })}>
                  Voir les ressources <ArrowUpRight size={16} />
                </button>
                {isAdmin && (
                  <button className="ghost-action" onClick={() => goTo('dashboard')}>
                    Ajouter du contenu <Plus size={16} />
                  </button>
                )}
              </div>
            </div>

            <aside className="hero-panel home-panel">
              <div className="panel-row">
                <span>Contenus</span>
                <strong>{counts.ai + counts.tools + counts.blog}</strong>
              </div>
              <div className="mini-stats">
                <Metric label="IA" value={counts.ai} />
                <Metric label="Outils" value={counts.tools} />
                <Metric label="Blog" value={counts.blog} />
              </div>
              <div className="secure-line">
                <ShieldCheck size={17} />
                <span>{isAdmin ? 'Session admin validée via app_admins' : 'Lecture publique, écriture protégée'}</span>
              </div>
            </aside>
          </section>
        )}
      </header>

      <section id="content" className="page-wrap">
        {currentPage === 'home' ? (
          <HomePage goTo={goTo} isAdmin={isAdmin} />
        ) : currentPage === 'detail' ? (
          <DetailPage item={detailItem} goTo={goTo} />
        ) : currentPage === 'dashboard' && isAdmin ? (
          <Dashboard items={items} onCreate={createItem} onDelete={deleteItem} loading={loading} />
        ) : (
          <ContentPage
            activePage={currentPage}
            category={category}
            items={visibleItems}
            loading={loading}
            onCategoryChange={setCategory}
            onDelete={deleteItem}
            onOpen={openItem}
            onQueryChange={setQuery}
            query={query}
            isAdmin={isAdmin}
          />
        )}
      </section>
    </main>
  )
}

function getInitialPage() {
  return parseRoute().page
}

function getInitialDetailTarget() {
  return parseRoute().detail
}

function parseRoute() {
  const hash = window.location.hash.replace('#', '')
  if (hash.startsWith('detail:')) {
    const [, type, id] = hash.split(':')
    if (['blog', 'prompt'].includes(type) && id) {
      return { page: 'detail', detail: { type, id } }
    }
  }
  return {
    page: [...appPages, 'dashboard'].includes(hash) ? hash : 'home',
    detail: null,
  }
}

function normalizeCategory(value) {
  return value
    ?.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function optimizeImageUrl(url, width = 900) {
  if (!url) return ''

  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('res.cloudinary.com') && parsed.pathname.includes('/upload/')) {
      return url.replace('/upload/', `/upload/f_auto,q_auto,c_fill,w_${width}/`)
    }

    if (parsed.hostname.includes('images.unsplash.com')) {
      parsed.searchParams.set('auto', 'format')
      parsed.searchParams.set('fit', 'crop')
      parsed.searchParams.set('w', String(width))
      parsed.searchParams.set('q', '72')
      return parsed.toString()
    }
  } catch {
    return url
  }

  return url
}

function Background() {
  return (
    <div className="background" aria-hidden="true">
      <span data-glow className="glow glow-one" />
      <span data-glow className="glow glow-two" />
      <span className="grid-noise" />
    </div>
  )
}

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined
    gsap.fromTo('.toast', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' })
    const timeout = window.setTimeout(() => {
      gsap.to('.toast', {
        y: 12,
        opacity: 0,
        duration: 0.24,
        ease: 'power2.in',
        onComplete: onClose,
      })
    }, 3200)
    return () => window.clearTimeout(timeout)
  }, [toast, onClose])

  if (!toast) return null
  return <div className={`toast ${toast.type}`}>{toast.message}</div>
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

function HomePage({ goTo, isAdmin }) {
  const collections = [
    { title: 'IA gratuites', copy: 'Modeles et services utiles pour ecrire, chercher, generer ou organiser sans commencer par payer.', action: 'Explorer les IA', page: 'ai' },
    { title: 'Outils createurs', copy: 'Plateformes de design, montage, publication et productivite qui aident a produire concretement.', action: 'Voir les outils', page: 'tools' },
    { title: 'Prompts', copy: 'Instructions pretes a adapter pour scripts faceless, idees de videos, miniatures et workflows.', action: 'Lire les prompts', page: 'prompts' },
    { title: 'Guides', copy: 'Notes courtes pour comprendre quoi utiliser, dans quel ordre, et eviter les fausses bonnes idees.', action: 'Lire le blog', page: 'blog' },
  ]

  const standards = [
    'Un vrai usage gratuit ou une valeur claire avant paiement.',
    'Un interet concret pour un createur qui produit avec peu de budget.',
    'Une fiche courte, lisible, et facile a ouvrir depuis le catalogue.',
  ]

  const workflows = [
    'Trouver une IA gratuite pour ecrire ou chercher.',
    'Passer sur un outil pour creer le visuel, la video ou le support.',
    'Utiliser un prompt pour gagner du temps sur la structure.',
    'Garder les meilleurs liens au meme endroit au lieu de fouiller des groupes.',
  ]

  return (
    <div className="home-content">
      <section data-reveal className="mission-band home-statement">
        <span>Le probleme</span>
        <h2>Les createurs perdent trop de temps a chercher des outils gratuits qui tiennent vraiment la route.</h2>
        <p>
          Dans les groupes de YouTubeurs faceless en Afrique, la question revient souvent : ou trouver des IA,
          plateformes et outils fiables sans abonnement lourd ? Free AI Atlas sert de point de depart propre pour
          eviter les listes confuses, les essais inutiles et les plans gratuits trop limites.
        </p>
        <div className="home-actions">
          <button className="primary-action" onClick={() => goTo('ai')}>Commencer par les IA <ArrowUpRight size={16} /></button>
          <button className="ghost-action" onClick={() => goTo('prompts')}>Voir les prompts <ArrowUpRight size={16} /></button>
          {isAdmin && <button className="ghost-action" onClick={() => goTo('dashboard')}>Ajouter une ressource <Plus size={16} /></button>}
        </div>
      </section>

      <section data-reveal className="editorial-grid">
        <div className="editorial-copy">
          <span>La promesse</span>
          <h2>Pas une encyclopedie. Une selection lisible pour avancer.</h2>
          <p>
            Le but n'est pas de promettre que tout est magique ou illimite. Le but est de rassembler les ressources
            qui peuvent vraiment aider un createur a tester, produire, apprendre et publier avec un budget serre.
          </p>
        </div>
        <div className="standard-list">
          {standards.map((standard) => (
            <div className="standard-row" key={standard}>
              <CheckCircle2 size={18} />
              <p>{standard}</p>
            </div>
          ))}
        </div>
      </section>

      <section data-reveal className="collection-section">
        <div className="section-kicker">
          <span>Collections</span>
          <h2>Chaque page a un role simple.</h2>
        </div>
        <div className="collection-grid">
          {collections.map((item) => (
            <article className="collection-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
              <button onClick={() => goTo(item.page)}>{item.action} <ArrowUpRight size={16} /></button>
            </article>
          ))}
        </div>
      </section>

      <section data-reveal className="workflow-section">
        <div>
          <span>Usage concret</span>
          <h2>Un chemin simple pour produire sans se disperser.</h2>
        </div>
        <div className="workflow-list">
          {workflows.map((step, index) => (
            <div className="workflow-row" key={step}>
              <strong>{String(index + 1).padStart(2, '0')}</strong>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section data-reveal className="audience-section">
        <span>Pour qui</span>
        <h2>Pense pour ceux qui doivent creer avec peu de marge.</h2>
        <div className="audience-grid">
          <article>
            <h3>Createurs faceless</h3>
            <p>Trouver des outils pour idees, scripts, voix, visuels, montage et organisation.</p>
          </article>
          <article>
            <h3>Freelances & makers</h3>
            <p>Construire une petite stack gratuite pour livrer vite sans multiplier les frais fixes.</p>
          </article>
          <article>
            <h3>Debutants</h3>
            <p>Eviter les listes interminables et commencer par des ressources comprehensibles.</p>
          </article>
        </div>
      </section>
    </div>
  )
}

function ContentPage({ activePage, category, items, loading, onCategoryChange, onDelete, onOpen, onQueryChange, query, isAdmin }) {
  const pageConfig = {
    ai: {
      label: 'IA',
      title: 'IA gratuites classées par usage.',
      copy: 'Texte, image, vidéo, musique ou autre : garde uniquement les IA qui ont vraiment une place dans ton workflow.',
    },
    tools: {
      label: 'Outils',
      title: 'Outils créatifs hors IA.',
      copy: 'Design, code, vidéo, productivité : tout ce qui aide à créer plus vite sans dépendre d’un modèle IA.',
    },
    prompts: {
      label: 'Prompts',
      title: 'Prompts prets pour produire plus vite.',
      copy: 'Scripts, idees, miniatures, recherche, montage : des prompts reutilisables pour les createurs faceless et makers.',
    },
    blog: {
      label: 'Blog',
      title: 'Notes courtes et guides utiles.',
      copy: 'Un espace éditorial pour documenter tes méthodes, stacks gratuites et découvertes.',
    },
  }

  const config = pageConfig[activePage] || pageConfig.ai

  return (
    <>
      <div data-reveal className="section-head">
        <div>
          <span>{config.label}</span>
          <h2>{config.title}</h2>
        </div>
        <p>{config.copy}</p>
      </div>

      <div data-reveal className="toolbar">
        <label className="search-box">
          <Search size={17} />
          <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Rechercher..." />
        </label>

        {activePage === 'ai' && (
          <>
            <label className="filter-select">
              <Filter size={16} />
              <select value={category} onChange={(event) => onCategoryChange(event.target.value)}>
                {aiCategories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <div className="filters">
              <Filter size={16} />
              {aiCategories.map((item) => (
                <button key={item} className={category === item ? 'filter active' : 'filter'} onClick={() => onCategoryChange(item)}>
                  {item}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {loading ? (
        <p className="empty">Chargement...</p>
      ) : items.length ? (
        <div className={activePage === 'blog' ? 'content-grid blog-grid' : 'content-grid'}>
          {items.map((item) => (
            <ContentCard key={item.id} item={item} isAdmin={isAdmin} onDelete={onDelete} onOpen={onOpen} />
          ))}
        </div>
      ) : (
        <p className="empty">Aucun contenu pour le moment.</p>
      )}
    </>
  )
}

function ContentCard({ item, isAdmin, onDelete, onOpen }) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete(event) {
    event.stopPropagation()
    setDeleting(true)
    try {
      await onDelete(item.id)
    } finally {
      setDeleting(false)
    }
  }

  function handleOpen() {
    onOpen(item)
  }

  const actionLabel = ['blog', 'prompt'].includes(item.type)
    ? 'Lire'
    : item.url
      ? 'Ouvrir'
      : 'Indisponible'

  return (
    <article data-reveal className="content-card clickable-card" onClick={handleOpen} role="button" tabIndex={0} onKeyDown={(event) => {
      if (event.key === 'Enter') handleOpen()
    }}>
      <div className="media-frame">
        {item.image_url ? <img src={optimizeImageUrl(item.image_url, 760)} alt="" loading="lazy" decoding="async" /> : <div className="image-placeholder"><ImagePlus size={22} /></div>}
        {item.is_featured && <span className="featured-badge"><CheckCircle2 size={14} /> Sélection</span>}
      </div>
      <div className="card-body">
        <span className="category-label">{item.category}</span>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        {['blog', 'prompt'].includes(item.type) && item.body && <p className="blog-body">{item.body}</p>}
        <div className="tags">
          {(item.tags || []).map((tag) => <small key={tag}>{tag}</small>)}
        </div>
        <div className="card-footer">
          <span className="card-action-label">{actionLabel} <ArrowUpRight size={15} /></span>
          {isAdmin && (
            <button disabled={deleting} onClick={handleDelete}>
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

function DetailPage({ item, goTo }) {
  if (!item) {
    return (
      <div data-reveal className="detail-panel">
        <span>Introuvable</span>
        <h2>Ce contenu n'est plus disponible.</h2>
        <button className="ghost-action" onClick={() => goTo('home')}>Retour accueil</button>
      </div>
    )
  }

  const backPage = item.type === 'prompt' ? 'prompts' : 'blog'

  return (
    <article data-reveal className="detail-layout">
      <button className="ghost-action detail-back" onClick={() => goTo(backPage)}>
        Retour {item.type === 'prompt' ? 'aux prompts' : 'au blog'}
      </button>

      {item.image_url && (
        <div className="detail-cover">
          <img src={optimizeImageUrl(item.image_url, 1440)} alt="" loading="lazy" decoding="async" />
        </div>
      )}

      <div className="detail-panel">
        <span>{item.category}</span>
        <h1>{item.title}</h1>
        <p className="detail-description">{item.description}</p>
        {item.body && (
          <div className={item.type === 'prompt' ? 'prompt-box' : 'article-body'}>
            {item.body}
          </div>
        )}
        <div className="tags">
          {(item.tags || []).map((tag) => <small key={tag}>{tag}</small>)}
        </div>
        {item.url && (
          <a className="primary-action detail-link" href={item.url} target="_blank" rel="noreferrer">
            Ouvrir la ressource <ArrowUpRight size={16} />
          </a>
        )}
      </div>
    </article>
  )
}

function Dashboard({ items, onCreate, onDelete, loading }) {
  return (
    <div className="dashboard-layout">
      <div data-reveal className="section-head">
        <div>
          <span>Dashboard</span>
          <h2>Ajouter IA, outils, prompts et articles.</h2>
        </div>
        <p>Upload Cloudinary, insertion Supabase, puis publication immédiate sur les pages publiques.</p>
      </div>
      <AdminForm onCreate={onCreate} />
      <div data-reveal className="admin-list">
        <h3>Contenus publiés</h3>
        {loading ? <p className="empty">Chargement...</p> : items.map((item) => (
          <div className="admin-row" key={item.id}>
            <div>
              <strong>{item.title}</strong>
              <span>{item.type} / {item.category}</span>
            </div>
            <button onClick={() => onDelete(item.id)}>
              <Trash2 size={15} /> Supprimer
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function AdminForm({ onCreate }) {
  const [form, setForm] = useState(emptyForm)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [saving, setSaving] = useState(false)

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleFile(event) {
    const nextFile = event.target.files?.[0]
    setFile(nextFile || null)
    setPreview(nextFile ? URL.createObjectURL(nextFile) : '')
  }

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    try {
      await onCreate(form, file)
      setForm(emptyForm)
      setFile(null)
      setPreview('')
      event.currentTarget.reset()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form data-reveal className="admin-form" onSubmit={submit}>
      <div className="upload-card">
        <div className="upload-preview">
          {preview || form.image_url ? <img src={preview || form.image_url} alt="" /> : <ImagePlus size={28} />}
        </div>
        <label className="upload-button">
          Image Cloudinary
          <input accept="image/*" onChange={handleFile} type="file" />
        </label>
      </div>
      <div className="form-grid">
        <Field label="Type" kind="select" value={form.type} onChange={(value) => update('type', value)}>
          <option value="ai">IA</option>
          <option value="tool">Outil</option>
          <option value="prompt">Prompt</option>
          <option value="blog">Blog</option>
        </Field>
        <Field label="Titre" value={form.title} onChange={(value) => update('title', value)} required />
        <Field label="Catégorie" value={form.category} onChange={(value) => update('category', value)} required />
        <Field label="Lien" value={form.url} onChange={(value) => update('url', value)} />
        <Field label="Image URL alternative" value={form.image_url} onChange={(value) => update('image_url', value)} />
        <Field label="Tags" value={form.tags} onChange={(value) => update('tags', value)} />
        <Field label="Description" kind="textarea" value={form.description} onChange={(value) => update('description', value)} required wide />
        <Field label="Corps d’article" kind="textarea" value={form.body} onChange={(value) => update('body', value)} wide />
        <label className="check-field">
          <input checked={form.is_featured} onChange={(event) => update('is_featured', event.target.checked)} type="checkbox" />
          Mettre en avant
        </label>
        <button className="primary-action submit-action" disabled={saving} type="submit">
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
          {saving ? 'Publication...' : 'Publier'}
        </button>
      </div>
    </form>
  )
}

function Field({ children, kind = 'input', label, onChange, required = false, value, wide = false }) {
  return (
    <label className={wide ? 'field wide' : 'field'}>
      <span>{label}</span>
      {kind === 'select' ? (
        <select value={value} onChange={(event) => onChange(event.target.value)} required={required}>
          {children}
        </select>
      ) : kind === 'textarea' ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} required={required} rows={4} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} required={required} />
      )}
    </label>
  )
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z" />
    </svg>
  )
}

createRoot(document.getElementById('root')).render(<App />)
