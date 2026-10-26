import { useCallback, useEffect, useRef, useState } from 'react'
import { predict } from '../api.js'
import ImageUploader from './ImageUploader.jsx'
import PredictionResult from './PredictionResult.jsx'
import ExampleGallery from './ExampleGallery.jsx'

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_MB = 10

export default function Demo({ notify }) {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const requestId = useRef(0)

  // Release object URLs when the preview changes.
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  const clear = useCallback(() => {
    requestId.current += 1 // ignore any in-flight response
    setFile(null)
    setPreviewUrl(null)
    setResult(null)
    setLoading(false)
  }, [])

  const choose = useCallback((f) => {
    if (!f) return
    if (!ALLOWED.includes(f.type)) {
      notify('Unsupported file type. Please upload a JPG, JPEG, PNG or WEBP image.')
      return
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      notify(`Image is too large. The limit is ${MAX_MB} MB.`)
      return
    }
    requestId.current += 1
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
    setResult(null)
    setLoading(false)
  }, [notify])

  const submit = async () => {
    if (!file || loading) return
    const id = ++requestId.current
    setLoading(true)
    setResult(null)
    try {
      const data = await predict(file)
      if (id === requestId.current) setResult(data)
    } catch (err) {
      if (id === requestId.current) notify(err.message)
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }

  return (
    <section id="demo" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <h2 className="section-title">Interactive Demo</h2>
      <p className="section-sub">Upload a tea leaf image to classify its disease using the TeaLeafBD six-model ensemble.</p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <ImageUploader
          previewUrl={previewUrl}
          loading={loading}
          canSubmit={!!file}
          onChoose={choose}
          onClear={clear}
          onSubmit={submit}
        />
        <PredictionResult result={result} loading={loading} />
      </div>

      <ExampleGallery onPick={choose} notify={notify} disabled={loading} />
    </section>
  )
}
