import { useRef, useState } from 'react'
import { ImageIcon, Loader2, X } from 'lucide-react'

export default function ImageUploader({ previewUrl, loading, canSubmit, onChoose, onClear, onSubmit }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    if (!loading) onChoose(e.dataTransfer.files?.[0])
  }

  return (
    <div className="card p-6 sm:p-8">
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => { onChoose(e.target.files?.[0]); e.target.value = '' }}
      />

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative grid min-h-[20rem] place-items-center rounded-2xl border-2 border-dashed p-4 transition ${
          dragging ? 'border-leaf-500 bg-leaf-100/70 dark:bg-leaf-900/30' : 'border-leaf-300 bg-leaf-50/60 dark:border-leaf-800 dark:bg-leaf-900/10'
        }`}
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="Uploaded tea leaf preview" className="max-h-[22rem] w-full max-w-full rounded-2xl object-contain shadow-card" />
            <button
              onClick={onClear}
              disabled={loading}
              aria-label="Remove image"
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-red-500 text-white shadow transition hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-white text-slate-400 shadow-sm dark:bg-white/10"><ImageIcon size={28} /></span>
            <p className="mt-4 text-lg font-bold text-slate-900 dark:text-white">Drop Image Here</p>
            <p className="my-1 text-sm text-slate-500">or</p>
            <button onClick={() => inputRef.current?.click()} className="btn-primary !px-5 !py-2.5">Click to Upload</button>
            <p className="mt-4 text-xs text-slate-500">JPG, PNG or WEBP · up to 10 MB</p>
          </div>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button onClick={onClear} disabled={loading || !canSubmit} className="btn-ghost">Clear</button>
        <button onClick={onSubmit} disabled={!canSubmit || loading} className="btn-primary" aria-busy={loading}>
          {loading ? (<><Loader2 size={18} className="animate-spin" /> Analyzing…</>) : 'Submit'}
        </button>
      </div>
    </div>
  )
}
