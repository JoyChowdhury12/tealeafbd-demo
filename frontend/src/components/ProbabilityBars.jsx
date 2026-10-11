// `probabilities` arrives keyed in the ORIGINAL class order; only the display is sorted.
export default function ProbabilityBars({ probabilities, predicted }) {
  const rows = Object.entries(probabilities).sort((a, b) => b[1] - a[1])
  return (
    <div className="rounded-2xl border border-slate-200 p-5 dark:border-white/10">
      <h4 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Class Probabilities</h4>
      <ul className="space-y-3.5">
        {rows.map(([name, p]) => {
          const top = name === predicted
          return (
            <li key={name}>
              <div className="mb-1 flex justify-between gap-3 text-sm">
                <span className={top ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}>{name}</span>
                <span className={`tabular-nums ${top ? 'font-bold text-leaf-600' : 'font-medium text-slate-600 dark:text-slate-400'}`}>{(p * 100).toFixed(2)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${top ? 'bg-leaf-600' : 'bg-leaf-300 dark:bg-leaf-700'}`}
                  style={{ width: `${Math.max(p * 100, p > 0 ? 1 : 0)}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
