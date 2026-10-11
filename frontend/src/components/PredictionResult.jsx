import { Eye, Loader2 } from 'lucide-react'
import ProbabilityBars from './ProbabilityBars.jsx'
import ModelPredictions from './ModelPredictions.jsx'
import Explainability from './Explainability.jsx'

const pct = (p) => `${(p * 100).toFixed(2)}%`

export default function PredictionResult({ result, loading, file, notify }) {
  return (
    <div className="card p-6 sm:p-8">
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Classification Results</h3>

      {loading && (
        <div className="grid min-h-[16rem] place-items-center text-center" role="status">
          <div>
            <Loader2 size={36} className="mx-auto animate-spin text-leaf-600" />
            <p className="mt-4 font-medium text-slate-600 dark:text-slate-300">Analyzing leaf…</p>
          </div>
        </div>
      )}

      {!loading && !result && (
        <div className="grid min-h-[16rem] place-items-center text-center">
          <div>
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-slate-400 dark:bg-white/10"><Eye size={28} /></span>
            <p className="mt-4 text-lg text-slate-500">Upload an image to see classification results</p>
          </div>
        </div>
      )}

      {!loading && result && (
        <div className="mt-6 animate-fadeUp space-y-6">
          <div className="rounded-2xl border border-leaf-200 bg-leaf-50 p-5 dark:border-leaf-800 dark:bg-leaf-900/20">
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-leaf-700 dark:text-leaf-400">Predicted Class</p>
                <p className="mt-1 break-words text-2xl font-extrabold text-slate-900 dark:text-white">{result.predicted_class}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-medium text-leaf-700 dark:text-leaf-400">Prediction Probability</p>
                <p className="mt-1 text-2xl font-extrabold text-leaf-600">{pct(result.probability)}</p>
              </div>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white dark:bg-white/10" role="progressbar" aria-valuenow={Math.round(result.probability * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Prediction probability">
              <div className="h-full rounded-full bg-leaf-600 transition-all duration-700" style={{ width: `${result.probability * 100}%` }} />
            </div>
          </div>

          <ProbabilityBars probabilities={result.probabilities} predicted={result.predicted_class} />
          <ModelPredictions predictions={result.individual_predictions} final={result.predicted_class} />
          <Explainability file={file} result={result} notify={notify} />
        </div>
      )}
    </div>
  )
}
