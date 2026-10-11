import { useCallback, useEffect, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Abstract from './components/Abstract.jsx'
import Metrics from './components/Metrics.jsx'
import ModelEnsemble from './components/ModelEnsemble.jsx'
import Demo from './components/Demo.jsx'
import Authors from './components/Authors.jsx'
import Footer from './components/Footer.jsx'
import Toast from './components/Toast.jsx'
import { NAV } from './config/site.js'

export default function App() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  const [active, setActive] = useState('home')
  const [toast, setToast] = useState(null)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    try { localStorage.setItem('theme', dark ? 'dark' : 'light') } catch { /* ignore */ }
  }, [dark])

  // Highlight the nav item for the section currently in view.
  useEffect(() => {
    const ids = NAV.map((n) => n.id)
    const onScroll = () => {
      const y = window.scrollY + 120
      let current = ids[0]
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= y) current = id
      }
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const notify = useCallback((message) => setToast({ message, id: Date.now() }), [])

  return (
    <>
      <Navbar active={active} dark={dark} onToggleDark={() => setDark((d) => !d)} />
      <main>
        <Hero />
        <Abstract />
        <Metrics />
        <ModelEnsemble />
        <Demo notify={notify} />
        <Authors />
      </main>
      <Footer />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  )
}
