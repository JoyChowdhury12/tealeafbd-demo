import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function ModelPredictions({ predictions, final }) {
  const [open, setOpen] = useState(false)
  const entries = Object.entries(predictions || {})
  if (!entries.length) return null
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/10">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-2xl px-5 py-4 text-left font-semibold text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-500 dark:text-white"
      >
        View Individual Model Predictions
        <ChevronDown size={20} className={`shrink-0 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul className="divide-y divide-slate-100 border-t border-slate-100 px-5 dark:divide-white/5 dark:border-white/5">
          {entries.map(([model, cls]) => (
            <li key={model} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3 text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-300">{model}</span>
              <span className={`font-semibold ${cls === final ? 'text-leaf-600' : 'text-amber-600'}`}>→ {cls}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
