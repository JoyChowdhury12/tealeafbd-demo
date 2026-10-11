import { METRICS, SITE } from '../config/site.js'

export default function Metrics() {
  return (
    <section id="results" className="bg-slate-50/70 py-20 dark:bg-white/[0.02]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="section-title">Research Results</h2>
        <p className="section-sub">Final ensemble results on the {SITE.dataset} dataset (7 classes).</p>

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
          {METRICS.map((m) => (
            <div
              key={m.label}
              className={`card p-6 transition hover:-translate-y-0.5 hover:shadow-soft ${m.highlight ? 'ring-2 ring-leaf-500/40' : ''}`}
            >
              <p className="text-3xl font-extrabold text-leaf-600 sm:text-4xl">{m.value}</p>
              <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">{m.label}</p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm text-slate-500">
          Final ensemble weights were optimized using the validation set. The test set was reserved for final evaluation.
        </p>
      </div>
    </section>
  )
}
