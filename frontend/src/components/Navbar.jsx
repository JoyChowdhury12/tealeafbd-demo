import { useState } from 'react'
import { FileText, Github, Leaf, Menu, Moon, Sun, X } from 'lucide-react'
import { NAV, SITE } from '../config/site.js'

export function Logo() {
  return (
    <a href="#home" className="flex items-center gap-2.5" aria-label="TeaLeafBD home">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-leaf-100 text-leaf-600 dark:bg-leaf-900/40 dark:text-leaf-400">
        <Leaf size={22} />
      </span>
      <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        Tea<span className="text-leaf-600">LeafBD</span>
      </span>
    </a>
  )
}

function IconLink({ href, label, children }) {
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel="noreferrer"
      aria-label={label}
      title={label}
      className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-leaf-100 hover:text-leaf-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-500 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
    >
      {children}
    </a>
  )
}

export default function Navbar({ active, dark, onToggleDark }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur dark:border-white/10 dark:bg-ink-900/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {NAV.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              aria-current={active === n.id ? 'page' : undefined}
              className={`border-b-2 pb-1 text-sm font-medium transition ${
                active === n.id
                  ? 'border-leaf-600 text-leaf-600'
                  : 'border-transparent text-slate-600 hover:text-leaf-600 dark:text-slate-300'
              }`}
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 sm:flex">
            {SITE.githubUrl && SITE.githubUrl !== 'https://github.com/' && <IconLink href={SITE.githubUrl} label="GitHub repository"><Github size={19} /></IconLink>}
            {SITE.paperUrl && SITE.paperUrl !== '#' && <IconLink href={SITE.paperUrl} label="Research paper"><FileText size={19} /></IconLink>}
          </div>
          <button
            onClick={onToggleDark}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-leaf-100 hover:text-leaf-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-500 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
          >
            {dark ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700 md:hidden dark:bg-white/5 dark:text-slate-300"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-slate-200/70 bg-white px-4 py-3 md:hidden dark:border-white/10 dark:bg-ink-900" aria-label="Mobile">
          {NAV.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-3 py-3 font-medium ${active === n.id ? 'bg-leaf-50 text-leaf-700 dark:bg-leaf-900/30' : 'text-slate-700 dark:text-slate-300'}`}
            >
              {n.label}
            </a>
          ))}
          <div className="flex gap-2 px-3 pt-3 sm:hidden">
            {SITE.githubUrl && SITE.githubUrl !== 'https://github.com/' && <IconLink href={SITE.githubUrl} label="GitHub repository"><Github size={19} /></IconLink>}
            {SITE.paperUrl && SITE.paperUrl !== '#' && <IconLink href={SITE.paperUrl} label="Research paper"><FileText size={19} /></IconLink>}
          </div>
        </nav>
      )}
    </header>
  )
}
