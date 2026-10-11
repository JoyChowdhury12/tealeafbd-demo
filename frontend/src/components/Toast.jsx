import { useEffect } from 'react'
import { AlertCircle, X } from 'lucide-react'

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onClose, 7000)
    return () => clearTimeout(t)
  }, [toast, onClose])

  if (!toast) return null
  return (
    <div role="alert" className="fixed inset-x-4 bottom-6 z-50 mx-auto flex max-w-md animate-fadeUp items-start gap-3 rounded-2xl border border-red-200 bg-white p-4 shadow-soft dark:border-red-900 dark:bg-ink-800">
      <AlertCircle className="mt-0.5 shrink-0 text-red-500" size={20} />
      <p className="flex-1 text-sm text-slate-700 dark:text-slate-200">{toast.message}</p>
      <button onClick={onClose} aria-label="Dismiss" className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
    </div>
  )
}
