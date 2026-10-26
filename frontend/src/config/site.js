// ---------------------------------------------------------------------------
// Single place to edit site content: authors, links, research metrics, models.
// Research metrics are FINAL, fixed results. Live demo numbers never come from
// this file: they always come from the backend (predict.py).
// ---------------------------------------------------------------------------

export const SITE = {
  name: 'TeaLeafBD',
  title: 'Tea Leaf Disease Classification Using a 6-Model Weighted Ensemble',
  tagline: 'AI-powered tea leaf disease classification',
  dataset: 'TeaLeafBD v4',
  githubUrl: 'https://github.com/JoyChowdhury12/tealeafbd-demo',
  paperUrl: '#',
}

// Exact class order (index 0..6), identical to the deployment classes.json.
export const CLASSES = [
  'Tea algal leaf spot',
  'Brown Blight',
  'Gray Blight',
  'Helopeltis',
  'Red spider',
  'Green mirid bug',
  'Healthy leaf',
]

export const MODELS = [
  { name: 'DenseNet121', weight: 0.1363, family: 'CNN backbone' },
  { name: 'EfficientNet-B0', weight: 0.3361, family: 'CNN backbone' },
  { name: 'ResNet50', weight: 0.0502, family: 'CNN backbone' },
  { name: 'TeaDGCNet-DenseNet121', weight: 0.1429, family: 'TeaDGCNet variant' },
  { name: 'TeaDGCNet-EfficientNetB0', weight: 0.1088, family: 'TeaDGCNet variant' },
  { name: 'TeaDGCNet-ResNet50', weight: 0.2257, family: 'TeaDGCNet variant' },
]

export const METRICS = [
  { label: 'Validation Macro-F1', value: '96.02%', highlight: true },
  { label: 'Test Accuracy', value: '94.71%' },
  { label: 'Macro Precision', value: '94.11%' },
  { label: 'Macro Recall', value: '93.61%' },
  { label: 'Macro F1', value: '93.82%' },
  { label: 'Balanced Accuracy', value: '93.61%' },
]

export const PIPELINE = [
  'Input Leaf Image',
  'Preprocessing',
  '6 Deep Learning Models',
  'Softmax Probabilities',
  'Weighted Soft Voting',
  'Final Disease Prediction',
]

// Placeholders: edit freely. No affiliations/emails/IDs are invented.
export const AUTHORS = [
  { name: 'Joy Roy Chowdhury', role: 'Researcher', affiliation: 'Department of Software Engineering, Daffodil International University' },
  { name: 'Author Name', role: 'Researcher', affiliation: 'Department of Software Engineering, Daffodil International University' },
]
export const SUPERVISOR = { label: 'Supervisor', name: '[Supervisor Name]' }

export const NAV = [
  { id: 'home', label: 'Home' },
  { id: 'abstract', label: 'Abstract' },
  { id: 'demo', label: 'Demo' },
  { id: 'authors', label: 'Authors' },
]
