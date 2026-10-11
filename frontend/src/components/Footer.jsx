import { NAV, SITE } from '../config/site.js'
import { Logo } from './Navbar.jsx'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/80 dark:border-white/10">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-slate-500">{SITE.tagline}</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-slate-600 dark:text-slate-400 md:justify-center">
          {NAV.map((n) => <a key={n.id} href={`#${n.id}`} className="hover:text-leaf-600">{n.label}</a>)}
        </nav>
        <div className="flex gap-6 text-sm font-medium text-slate-600 dark:text-slate-400 md:justify-end">
          {SITE.githubUrl && SITE.githubUrl !== 'https://github.com/' && (
            <a href={SITE.githubUrl} target="_blank" rel="noreferrer" className="hover:text-leaf-600">GitHub</a>
          )}
          {SITE.paperUrl && SITE.paperUrl !== '#' && (
            <a href={SITE.paperUrl} className="hover:text-leaf-600">Research Paper</a>
          )}
        </div>
      </div>
      <p className="border-t border-slate-200/80 py-5 text-center text-xs text-slate-500 dark:border-white/10">
        © {new Date().getFullYear()} {SITE.name}. All rights reserved.
      </p>
    </footer>
  )
}
