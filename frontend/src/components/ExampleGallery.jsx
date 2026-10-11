import { useEffect, useState } from 'react'
import { ImageIcon } from 'lucide-react'

// Examples come from /examples/examples.json, produced by scripts/make_examples.py
// from TRAIN / VALIDATION images only. The label is the dataset folder name;
// clicking an example only loads the image: the prediction is still computed
// by the real backend when the user presses Submit.
export default function ExampleGallery({ onPick, notify, disabled }) {
  const [items, setItems] = useState(null)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetch('/examples/examples.json')
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => setItems(Array.isArray(list) ? list : []))
      .catch(() => setItems([]))
  }, [])

  const pick = async (item) => {
    if (disabled) return
    try {
      const res = await fetch(`/examples/${item.file}`)
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      onPick(new File([blob], item.file, { type: blob.type || 'image/jpeg' }))
      setSelected(item.file)
      document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
    } catch {
      notify('Could not load this example image.')
    }
  }

  return (
    <div className="card mt-8 p-6 sm:p-8">
      <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
        <ImageIcon size={20} /> Try an Example
      </h3>

      {items && items.length === 0 && (
        <p className="mt-4 text-sm text-slate-500">
          No example images yet. Run <code className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-white/10">python scripts/make_examples.py</code> (see README) to add training/validation examples.
        </p>
      )}

      {items && items.length > 0 && (
        <ul className="mt-5 flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-4 sm:overflow-visible lg:grid-cols-7">
          {items.map((it) => (
            <li key={it.file} className="w-36 shrink-0 sm:w-auto">
              <button
                onClick={() => pick(it)}
                disabled={disabled}
                aria-label={`Load example: ${it.label}`}
                className={`group relative block w-full overflow-hidden rounded-xl border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-500 disabled:opacity-50 ${
                  selected === it.file ? 'border-leaf-500 shadow-soft' : 'border-transparent hover:border-leaf-300'
                }`}
              >
                <img src={`/examples/${it.file}`} alt={it.label} loading="lazy" className="aspect-square w-full object-cover transition group-hover:scale-105" />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-6 text-left text-xs font-semibold text-white">{it.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
