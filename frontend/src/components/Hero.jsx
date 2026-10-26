import { useEffect, useState } from 'react'
import { ArrowRight, Leaf } from 'lucide-react'
import { CLASSES } from '../config/site.js'

// Hero carousel of plain example images (public/examples/examples.json, built by
// scripts/make_examples.py). If none exist, an illustrated leaf is shown.
export default function Hero() {
  const [items, setItems] = useState([])
  const [i, setI] = useState(0)

  useEffect(() => {
    fetch('/examples/examples.json')
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => [])
      .then((l) => setItems(Array.isArray(l) ? l : []))
  }, [])

  useEffect(() => {
    if (items.length < 2) return
    const t = setInterval(() => setI((n) => (n + 1) % items.length), 4000)
    return () => clearInterval(t)
  }, [items])

  return (
    <section id="home" className="relative overflow-hidden bg-gradient-to-b from-leaf-50/80 via-white to-white dark:from-leaf-900/20 dark:via-ink-900 dark:to-ink-900">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2 lg:px-8">
        <div className="animate-fadeUp">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-leaf-200 bg-white px-3 py-1 text-sm font-medium text-leaf-700 dark:border-leaf-800 dark:bg-leaf-900/30 dark:text-leaf-300">
            <Leaf size={14} /> Research project · TeaLeafBD v4
          </p>
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
            Fast &amp; Accurate{' '}
            <span className="bg-gradient-to-r from-leaf-600 to-emerald-500 bg-clip-text text-transparent">Tea Leaf</span>{' '}
            Disease <span className="text-leaf-600">Classification</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
            A deep learning framework for automated classification of tea leaf diseases using a
            six-model weighted ensemble.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#demo" className="btn-primary">Try Demo <ArrowRight size={18} /></a>
            <a href="#abstract" className="btn-ghost">Learn More</a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl animate-fadeUp [animation-delay:120ms]">
          <div className="card overflow-hidden p-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-leaf-100 to-emerald-200 dark:from-leaf-900/50 dark:to-emerald-900/40">
              {items.length > 0 ? (
                items.map((it, k) => (
                  <img
                    key={it.file}
                    src={`/examples/${it.file}`}
                    alt={`Tea leaf from the TeaLeafBD dataset: ${it.label}`}
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${k === i ? 'opacity-100' : 'opacity-0'}`}
                  />
                ))
              ) : (
                <div className="grid h-full place-items-center text-leaf-600/60"><Leaf size={120} strokeWidth={1.2} /></div>
              )}

              {items.length > 0 && (
                <>
                  <span className="absolute left-4 top-4 max-w-[85%] rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-slate-800 shadow dark:bg-ink-800/90 dark:text-white">
                    {items[i].label}
                  </span>
                  <div className="absolute bottom-3 right-4 flex gap-1.5">
                    {items.map((it, k) => (
                      <button
                        key={it.file}
                        onClick={() => setI(k)}
                        aria-label={`Show image ${k + 1}`}
                        className={`h-2 rounded-full transition-all ${k === i ? 'w-5 bg-white' : 'w-2 bg-white/60'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="card absolute -bottom-5 -left-3 px-5 py-3 sm:-left-8">
            <p className="text-xl font-bold text-slate-900 dark:text-white">{CLASSES.length} Classes</p>
            <p className="text-sm text-slate-500">Disease Classification</p>
          </div>
          <div className="card absolute -right-3 -top-5 px-5 py-3 sm:-right-6">
            <p className="text-xl font-bold text-leaf-600">94.71%</p>
            <p className="text-sm text-slate-500">Test Accuracy</p>
          </div>
        </div>
      </div>
    </section>
  )
}
