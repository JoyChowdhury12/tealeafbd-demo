import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronDown, Loader2, Sparkles } from 'lucide-react'
import { explain } from '../api.js'

const METHODS = [
  { id: 'gradcam', label: 'Grad-CAM', loading: 'Generating Grad-CAM…', hint: 'Highlighted regions contributed strongly to the model’s prediction. They are not guaranteed disease locations.' },
  { id: 'lime', label: 'LIME', loading: 'Generating LIME explanation…', hint: 'LIME perturbs superpixels of this image to see which regions support the predicted class.' },
  { id: 'occlusion', label: 'Occlusion', loading: 'Generating Occlusion explanation…', hint: 'Regions whose masking changes the target prediction probability more strongly are more influential for that prediction.' },
  { id: 'shap', label: 'SHAP', loading: 'Generating SHAP explanation…', hint: 'SHAP can be slow, so it only runs when you select it.' },
]

// Grad-CAM runs automatically after a prediction. LIME / Occlusion / SHAP run
// only on explicit request, one at a time, always on the CURRENT image.
export default function Explainability({ file, result, notify }) {
  const [active, setActive] = useState('gradcam')
  const [state, setState] = useState({}) // method -> { status, data }
  const [advanced, setAdvanced] = useState(false)
  const token = useRef(0)
  const busy = Object.values(state).some((s) => s.status === 'loading')

  const run = useCallback(async (method) => {
    const id = token.current
    setState((s) => ({ ...s, [method]: { status: 'loading' } }))
    try {
      const data = await explain(method, file, result.class_index)
      if (id === token.current) setState((s) => ({ ...s, [method]: { status: 'done', data } }))
    } catch (err) {
      if (id !== token.current) return
      setState((s) => ({ ...s, [method]: { status: 'error' } }))
      notify(err.message)
    }
  }, [file, result, notify])

  // New prediction -> reset and generate the default Grad-CAM for it.
  useEffect(() => {
    token.current += 1
    setState({})
    setActive('gradcam')
    setAdvanced(false)
    run('gradcam')
    return () => { token.current += 1 }
  }, [result]) // eslint-disable-line react-hooks/exhaustive-deps

  const select = (method) => {
    setActive(method)
    if (!state[method] && !busy) run(method)
  }

  const meta = METHODS.find((m) => m.id === active)
  const cur = state[active]

  return (
    <div className="rounded-2xl border border-slate-200 p-5 dark:border-white/10">
      <h4 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
        <Sparkles size={18} className="text-leaf-600" /> Why this prediction?
      </h4>

      <button
        onClick={() => setAdvanced((a) => !a)}
        aria-expanded={advanced}
        className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-leaf-700 hover:underline dark:text-leaf-400"
      >
        Advanced Explainability <ChevronDown size={16} className={`transition ${advanced ? 'rotate-180' : ''}`} />
      </button>

      {advanced && (
        <div role="tablist" aria-label="Explanation method" className="mt-3 flex flex-wrap gap-2">
          {METHODS.map((m) => (
            <button
              key={m.id}
              role="tab"
              aria-selected={active === m.id}
              disabled={busy && active !== m.id}
              onClick={() => select(m.id)}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                active === m.id ? 'bg-leaf-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-leaf-100 dark:bg-white/10 dark:text-slate-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4">
        {cur?.status === 'loading' && (
          <div role="status" className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300">
            <Loader2 size={18} className="animate-spin text-leaf-600" /> {meta.loading}
          </div>
        )}
        {cur?.status === 'error' && (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
            <span>This explanation could not be generated.</span>
            <button onClick={() => run(active)} disabled={busy} className="font-semibold underline disabled:opacity-50">Retry</button>
          </div>
        )}
        {cur?.status === 'done' && (
          <div className="animate-fadeUp">
            <p className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
              {cur.data.title} <span className="font-normal text-slate-500">· for “{cur.data.target_class}”</span>
            </p>
            <div className={`grid gap-3 ${cur.data.panels.length > 1 ? 'sm:grid-cols-3' : ''}`}>
              {cur.data.panels.map((p) => (
                <figure key={p.label} className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
                  <img src={p.image} alt={`${cur.data.title}: ${p.label}`} className="aspect-square w-full object-contain bg-slate-50 dark:bg-black/20" />
                  <figcaption className="px-2 py-1.5 text-center text-xs font-medium text-slate-600 dark:text-slate-400">{p.label}</figcaption>
                </figure>
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">{cur.data.note || meta.hint}</p>
          </div>
        )}
      </div>
    </div>
  )
}
