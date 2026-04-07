export interface IndicatorDef {
  key: string
  source: string          // JSON file name (without .json)
  en: string
  fr: string
  unit: string
  category: string
  palette: string[]       // gradient colors (low → high)
  format: (v: number) => string
}

const GREEN = ['#064e3b','#065f46','#047857','#059669','#10b981','#34d399','#6ee7b7','#a7f3d0','#d1fae5']
const AMBER = ['#78350f','#92400e','#b45309','#d97706','#f59e0b','#fbbf24','#fcd34d','#fde68a','#fef3c7']
const BLUE  = ['#1e3a5f','#1e40af','#2563eb','#3b82f6','#60a5fa','#93c5fd','#bfdbfe','#dbeafe','#eff6ff']
const RED   = ['#7f1d1d','#991b1b','#b91c1c','#dc2626','#ef4444','#f87171','#fca5a5','#fecaca','#fee2e2']
const PURPLE = ['#3b0764','#581c87','#7e22ce','#9333ea','#a855f7','#c084fc','#d8b4fe','#e9d5ff','#f3e8ff']

const fmt0 = (v: number) => v.toLocaleString('en', { maximumFractionDigits: 0 })
const fmt1 = (v: number) => v.toLocaleString('en', { maximumFractionDigits: 1 })
const fmt2 = (v: number) => v.toLocaleString('en', { maximumFractionDigits: 2 })
const pct = (v: number) => v.toFixed(1) + '%'

export const indicators: IndicatorDef[] = [
  // — Production —
  { key: 'Production céréales (Mt)',        source: 'production', en: 'Cereal Production (Mt)',          fr: 'Production céréales (Mt)',        unit: 'Mt',    category: 'production', palette: GREEN, format: fmt2 },
  { key: 'Rendement céréales (t/ha)',       source: 'production', en: 'Cereal Yield (t/ha)',             fr: 'Rendement céréales (t/ha)',       unit: 't/ha',  category: 'production', palette: GREEN, format: fmt2 },
  { key: 'Production viande (kt)',          source: 'production', en: 'Meat Production (kt)',            fr: 'Production viande (kt)',          unit: 'kt',    category: 'production', palette: GREEN, format: fmt0 },
  { key: 'Production lait (kt)',            source: 'production', en: 'Milk Production (kt)',            fr: 'Production lait (kt)',            unit: 'kt',    category: 'production', palette: GREEN, format: fmt0 },
  { key: 'Production poisson (kt)',         source: 'production', en: 'Fish Production (kt)',            fr: 'Production poisson (kt)',         unit: 'kt',    category: 'production', palette: BLUE,  format: fmt0 },
  { key: 'PIB agricole ($Mrd)',             source: 'production', en: 'Agricultural GDP ($Bn)',          fr: 'PIB agricole ($Mrd)',             unit: '$Bn',   category: 'production', palette: GREEN, format: fmt2 },
  { key: 'PIB agri (% PIB total)',          source: 'production', en: 'Agri GDP (% of total)',           fr: 'PIB agri (% PIB total)',          unit: '%',     category: 'production', palette: AMBER, format: pct },
  { key: 'Indice prod. alimentaire (2000=100)', source: 'production', en: 'Food Production Index',      fr: 'Indice prod. alimentaire',        unit: '',      category: 'production', palette: GREEN, format: fmt1 },
  { key: 'Engrais (kg/ha)',                 source: 'production', en: 'Fertilizer Use (kg/ha)',          fr: 'Engrais (kg/ha)',                 unit: 'kg/ha', category: 'production', palette: AMBER, format: fmt1 },
  { key: 'Tracteurs/1000ha',               source: 'production', en: 'Tractors per 1000ha',             fr: 'Tracteurs/1000ha',                unit: '/1000ha', category: 'production', palette: PURPLE, format: fmt1 },
  { key: 'Terres arables (Mha)',            source: 'production', en: 'Arable Land (Mha)',               fr: 'Terres arables (Mha)',            unit: 'Mha',   category: 'production', palette: GREEN, format: fmt2 },
  { key: 'Pertes pré-récolte (%)',          source: 'production', en: 'Pre-harvest Losses (%)',          fr: 'Pertes pré-récolte (%)',          unit: '%',     category: 'production', palette: RED,   format: pct },
  { key: 'Score mécanisation (0-10)',       source: 'production', en: 'Mechanization Score',             fr: 'Score mécanisation (0-10)',        unit: '/10',   category: 'production', palette: PURPLE, format: fmt1 },

  // — Climate —
  { key: 'Pluviométrie moy. (mm/an)',       source: 'climat', en: 'Avg. Rainfall (mm/yr)',               fr: 'Pluviométrie moy. (mm/an)',       unit: 'mm',    category: 'climate', palette: BLUE,  format: fmt0 },
  { key: 'Anomalie pluvio (%)',             source: 'climat', en: 'Rainfall Anomaly (%)',                fr: 'Anomalie pluvio (%)',             unit: '%',     category: 'climate', palette: BLUE,  format: pct },
  { key: 'Indice sécheresse (SPEI)',        source: 'climat', en: 'Drought Index (SPEI)',                fr: 'Indice sécheresse (SPEI)',        unit: '',      category: 'climate', palette: RED,   format: fmt2 },
  { key: 'NDVI moyen',                      source: 'climat', en: 'Mean NDVI',                           fr: 'NDVI moyen',                      unit: '',      category: 'climate', palette: GREEN, format: fmt2 },
  { key: 'Stress hydrique (%)',             source: 'climat', en: 'Water Stress (%)',                    fr: 'Stress hydrique (%)',             unit: '%',     category: 'climate', palette: RED,   format: pct },

  // — Trade —
  { key: 'Export agri ($Mrd)',              source: 'commerce', en: 'Agri Exports ($Bn)',                 fr: 'Export agri ($Mrd)',              unit: '$Bn',   category: 'trade', palette: GREEN, format: fmt2 },
  { key: 'Import agri ($Mrd)',             source: 'commerce', en: 'Agri Imports ($Bn)',                 fr: 'Import agri ($Mrd)',              unit: '$Bn',   category: 'trade', palette: AMBER, format: fmt2 },
  { key: 'Balance commerciale ($Mrd)',     source: 'commerce', en: 'Trade Balance ($Bn)',                fr: 'Balance commerciale ($Mrd)',      unit: '$Bn',   category: 'trade', palette: BLUE,  format: fmt2 },

  // — Food Security —
  { key: 'Indice sécurité alimentaire (FSI)', source: 'securite', en: 'Food Security Index (FSI)',       fr: 'Indice sécurité alimentaire (FSI)', unit: '',   category: 'security', palette: GREEN, format: fmt1 },
  { key: 'Sous-nutrition (%)',              source: 'securite', en: 'Undernourishment (%)',               fr: 'Sous-nutrition (%)',              unit: '%',     category: 'security', palette: RED,   format: pct },
  { key: 'Retard croissance (%)',           source: 'securite', en: 'Stunting (%)',                       fr: 'Retard croissance (%)',           unit: '%',     category: 'security', palette: RED,   format: pct },

  // — Finance —
  { key: 'Crédit agriculture ($Mrd)',       source: 'finance', en: 'Agricultural Credit ($Bn)',           fr: 'Crédit agriculture ($Mrd)',       unit: '$Bn',   category: 'finance', palette: GREEN, format: fmt2 },
  { key: 'Budget CAADP (%)',               source: 'finance', en: 'CAADP Budget (%)',                    fr: 'Budget CAADP (%)',                unit: '%',     category: 'finance', palette: AMBER, format: pct },
  { key: 'FDI agriculture ($M)',           source: 'finance', en: 'Agricultural FDI ($M)',               fr: 'FDI agriculture ($M)',            unit: '$M',    category: 'finance', palette: PURPLE, format: fmt0 },

  // — Social —
  { key: 'Pop. rurale (%)',                 source: 'social', en: 'Rural Population (%)',                 fr: 'Pop. rurale (%)',                 unit: '%',     category: 'social', palette: AMBER, format: pct },
  { key: 'Emploi agricole (%)',             source: 'social', en: 'Agricultural Employment (%)',          fr: 'Emploi agricole (%)',             unit: '%',     category: 'social', palette: AMBER, format: pct },
  { key: 'Pauvreté rurale (%)',             source: 'social', en: 'Rural Poverty (%)',                   fr: 'Pauvreté rurale (%)',             unit: '%',     category: 'social', palette: RED,   format: pct },
  { key: 'Score genre agri (0-10)',         source: 'social', en: 'Gender Score (0-10)',                  fr: 'Score genre agri (0-10)',         unit: '/10',   category: 'social', palette: PURPLE, format: fmt1 },

  // — Sustainability —
  { key: 'Pertes post-récolte (%)',         source: 'durabilite', en: 'Post-harvest Losses (%)',          fr: 'Pertes post-récolte (%)',         unit: '%',     category: 'sustainability', palette: RED,   format: pct },
  { key: 'Émissions agri (MtCO2)',          source: 'durabilite', en: 'Agri Emissions (MtCO2)',           fr: 'Émissions agri (MtCO2)',          unit: 'MtCO2', category: 'sustainability', palette: RED,   format: fmt1 },
  { key: 'Score agroécologie (0-10)',       source: 'durabilite', en: 'Agroecology Score',                fr: 'Score agroécologie (0-10)',       unit: '/10',   category: 'sustainability', palette: GREEN, format: fmt1 },
]

export const indicatorCategories = [
  { id: 'production',     en: 'Production',       fr: 'Production',         icon: 'bi-bar-chart-line' },
  { id: 'climate',         en: 'Climate',           fr: 'Climat',             icon: 'bi-cloud-sun' },
  { id: 'trade',           en: 'Trade',             fr: 'Commerce',           icon: 'bi-shop' },
  { id: 'security',        en: 'Food Security',     fr: 'Sécurité',           icon: 'bi-shield-check' },
  { id: 'finance',         en: 'Finance',           fr: 'Finance',            icon: 'bi-bank' },
  { id: 'social',          en: 'Social',            fr: 'Social',             icon: 'bi-people' },
  { id: 'sustainability',  en: 'Sustainability',    fr: 'Durabilité',         icon: 'bi-tree' },
]
