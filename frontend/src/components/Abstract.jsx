import { ArrowDown } from 'lucide-react'
import { MODELS, PIPELINE } from '../config/site.js'

export default function Abstract() {
  return (
    <section id="abstract" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <h2 className="section-title">Abstract</h2>
      <div className="mt-10 grid gap-10 lg:grid-cols-5">
        <div className="space-y-8 lg:col-span-3">
          <div>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-leaf-600">Problem</h3>
            <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
              Manual identification of tea leaf diseases can be difficult, time-consuming, and dependent on expert knowledge.
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-leaf-600">Approach</h3>
            <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
              A six-model weighted ensemble combining conventional CNN backbones and TeaDGCNet variants. The probability
              distributions of the individual models are combined by weighted soft voting to produce the final prediction.
            </p>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-leaf-600">Models</h3>
            <ul className="flex flex-wrap gap-2">
              {MODELS.map((m) => (
                <li key={m.name} className="rounded-full border border-leaf-200 bg-leaf-50 px-3 py-1.5 text-sm font-medium text-leaf-800 dark:border-leaf-800 dark:bg-leaf-900/30 dark:text-leaf-200">
                  {m.name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Pipeline</h3>
          <ol className="flex flex-col items-stretch">
            {PIPELINE.map((step, i) => (
              <li key={step} className="flex flex-col items-center">
                <div className={`w-full rounded-xl px-4 py-3 text-center text-sm font-semibold ${
                  i === PIPELINE.length - 1
                    ? 'bg-leaf-600 text-white'
                    : 'border border-leaf-200 bg-leaf-50 text-leaf-900 dark:border-leaf-800 dark:bg-leaf-900/30 dark:text-leaf-100'
                }`}>
                  {step}
                </div>
                {i < PIPELINE.length - 1 && <ArrowDown size={18} className="my-1.5 text-leaf-500" aria-hidden />}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
