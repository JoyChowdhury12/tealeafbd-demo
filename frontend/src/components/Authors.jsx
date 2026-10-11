import { User } from 'lucide-react'
import { AUTHORS, SUPERVISOR } from '../config/site.js'

// Edit names/affiliations in src/config/site.js only.
export default function Authors() {
  return (
    <section id="authors" className="bg-slate-50/70 py-20 dark:bg-white/[0.02]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="section-title">Authors</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AUTHORS.map((a, i) => (
            <div key={i} className="card flex items-start gap-4 p-6">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-leaf-100 text-leaf-600 dark:bg-leaf-900/40"><User size={22} /></span>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{a.name}</h3>
                <p className="text-sm text-leaf-700 dark:text-leaf-400">{a.role}</p>
                <p className="mt-1 text-sm text-slate-500">{a.affiliation}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-slate-600 dark:text-slate-400">
          <span className="font-semibold">{SUPERVISOR.label}:</span> {SUPERVISOR.name}
        </p>
      </div>
    </section>
  )
}
