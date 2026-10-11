import { Layers } from 'lucide-react'
import { MODELS } from '../config/site.js'

export default function ModelEnsemble() {
  const max = Math.max(...MODELS.map((m) => m.weight))
  return (
    <section id="ensemble" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <h2 className="section-title">Six-Model Ensemble</h2>
      <p className="section-sub">
        The final prediction is obtained through weighted soft voting of the six model probability distributions.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODELS.map((m) => (
          <div key={m.name} className="card p-6 transition hover:-translate-y-0.5 hover:shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{m.name}</h3>
                <p className="mt-0.5 text-sm text-slate-500">{m.family}</p>
              </div>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-leaf-100 text-leaf-600 dark:bg-leaf-900/40"><Layers size={18} /></span>
            </div>
            <p className="mt-5 text-sm text-slate-500">Weight</p>
            <p className="text-2xl font-extrabold text-leaf-600">{(m.weight * 100).toFixed(2)}%</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10" role="img" aria-label={`${m.name} weight`}>
              <div className="h-full rounded-full bg-leaf-500" style={{ width: `${(m.weight / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
