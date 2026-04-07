import { useState, useMemo } from 'react'
import { useLanguage } from '../../i18n'
import { displayName } from '../../config/countryMapping'
import type { IndicatorDef } from '../../config/indicators'
import type { CountryValue } from '../../hooks/useIndicatorData'
import ResizablePanel from './ResizablePanel'
import {
  descriptiveStats, linearRegression, pearsonCorrelation,
  oneWayAnova, moranI, getisOrdGStar,
  type DescriptiveStats, type RegressionResult, type CorrelationResult,
  type AnovaResult, type MoranResult, type HotspotResult,
} from '../../lib/statistics'
import {
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Line as RechartsLine, LineChart, Line, BarChart, Bar,
} from 'recharts'

interface Props {
  ranking: CountryValue[]
  indicator: IndicatorDef
  year: number
  trendData: { frName: string; geoName: string; data: { year: number; value: number }[] }[]
  countryCoords: { geoName: string; lat: number; lng: number }[]
  onClose: () => void
}

type Tab = 'descriptive' | 'regression' | 'correlation' | 'anova' | 'spatial'

const fmt = (v: number) => {
  if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(2) + 'M'
  if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(2) + 'k'
  return v.toFixed(4)
}
const fmtP = (p: number) => p < 0.001 ? '<0.001' : p.toFixed(4)

export default function StatsPanel({ ranking, indicator, year, trendData, countryCoords, onClose }: Props) {
  const { lang, t } = useLanguage()
  const [tab, setTab] = useState<Tab>('descriptive')
  const indLabel = lang === 'fr' ? indicator.fr : indicator.en
  const values = ranking.map(r => r.value)

  // ── Descriptive ──
  const desc = useMemo(() => descriptiveStats(values), [values])

  // ── Regression (value vs year, mean over countries) ──
  const regression = useMemo(() => {
    // Aggregate: for each year, compute mean value
    const yearMap = new Map<number, number[]>()
    trendData.forEach(td => {
      td.data.forEach(d => {
        const arr = yearMap.get(d.year) || []
        arr.push(d.value)
        yearMap.set(d.year, arr)
      })
    })
    const points = Array.from(yearMap.entries())
      .map(([yr, vals]) => ({ year: yr, value: vals.reduce((a, b) => a + b, 0) / vals.length }))
      .sort((a, b) => a.year - b.year)

    if (points.length < 3) return null
    const x = points.map(p => p.year)
    const y = points.map(p => p.value)
    const reg = linearRegression(x, y)
    return { ...reg, points, x, y }
  }, [trendData])

  // ── ANOVA by region ──
  const anova = useMemo(() => {
    const regionMap = new Map<string, number[]>()
    ranking.forEach(r => {
      const region = r.region || 'Unknown'
      const arr = regionMap.get(region) || []
      arr.push(r.value)
      regionMap.set(region, arr)
    })
    const groups = Array.from(regionMap.entries()).map(([name, vals]) => ({ name, values: vals }))
    return oneWayAnova(groups)
  }, [ranking])

  // ── Spatial Autocorrelation (Moran's I) ──
  const spatial = useMemo(() => {
    const coordMap = new Map(countryCoords.map(c => [c.geoName, c]))
    const matched = ranking.filter(r => coordMap.has(r.geoName))
    const vals = matched.map(r => r.value)
    const coords = matched.map(r => coordMap.get(r.geoName)!)

    const moran = moranI(vals, coords)
    const hotspots = getisOrdGStar(
      matched.map(r => {
        const c = coordMap.get(r.geoName)!
        return { geoName: r.geoName, value: r.value, lat: c.lat, lng: c.lng }
      })
    )
    return { moran, hotspots }
  }, [ranking, countryCoords])

  const tabs: { id: Tab; icon: string; label: string }[] = [
    { id: 'descriptive', icon: 'bi-bar-chart-steps', label: lang === 'fr' ? 'Descriptive' : 'Descriptive' },
    { id: 'regression', icon: 'bi-graph-up-arrow', label: lang === 'fr' ? 'Régression' : 'Regression' },
    { id: 'anova', icon: 'bi-diagram-3', label: 'ANOVA' },
    { id: 'spatial', icon: 'bi-geo', label: lang === 'fr' ? 'Spatial' : 'Spatial' },
  ]

  return (
    <ResizablePanel defaultWidth={440} maxWidth={800}>
      <div className="gis-panel-inner gis-stats-panel">
        <div className="gis-panel-header">
          <h2><i className="bi bi-calculator" /> {lang === 'fr' ? 'Statistiques Avancées' : 'Advanced Statistics'}</h2>
          <button className="gis-panel-close" onClick={onClose}><i className="bi bi-x-lg" /></button>
        </div>
        <div className="gis-panel-subtitle">{indLabel} — {year}</div>

        {/* Tabs */}
        <div className="gis-stats-tabs">
          {tabs.map(tb => (
            <button key={tb.id} className={`gis-stats-tab ${tab === tb.id ? 'active' : ''}`} onClick={() => setTab(tb.id)}>
              <i className={`bi ${tb.icon}`} /> {tb.label}
            </button>
          ))}
        </div>

        <div className="gis-stats-content">
          {/* ── DESCRIPTIVE ── */}
          {tab === 'descriptive' && (
            <div className="gis-stats-section">
              <h4><i className="bi bi-bar-chart-steps" /> {lang === 'fr' ? 'Statistiques descriptives' : 'Descriptive Statistics'}</h4>
              <table className="gis-stats-table">
                <tbody>
                  {([
                    ['N', desc.n.toString()],
                    [lang === 'fr' ? 'Moyenne' : 'Mean', fmt(desc.mean)],
                    [lang === 'fr' ? 'Médiane' : 'Median', fmt(desc.median)],
                    [lang === 'fr' ? 'Écart-type' : 'Std Dev', fmt(desc.stdDev)],
                    ['Variance', fmt(desc.variance)],
                    ['Min', fmt(desc.min)],
                    ['Max', fmt(desc.max)],
                    [lang === 'fr' ? 'Étendue' : 'Range', fmt(desc.range)],
                    ['Q1 (25%)', fmt(desc.q1)],
                    ['Q3 (75%)', fmt(desc.q3)],
                    ['IQR', fmt(desc.iqr)],
                    [lang === 'fr' ? 'Asymétrie' : 'Skewness', desc.skewness.toFixed(4)],
                    ['Kurtosis', desc.kurtosis.toFixed(4)],
                    ['CV (%)', desc.cv.toFixed(2) + '%'],
                  ] as [string, string][]).map(([label, val]) => (
                    <tr key={label}><td className="gis-stats-label">{label}</td><td className="gis-stats-val">{val}</td></tr>
                  ))}
                </tbody>
              </table>

              {/* Distribution histogram */}
              <h4 style={{ marginTop: 16 }}><i className="bi bi-bar-chart" /> Distribution</h4>
              <div className="gis-stats-chart">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={buildHistogram(values, 10)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 9 }} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} width={30} />
                    <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 8, fontSize: 11 }} />
                    <Bar dataKey="count" fill={indicator.palette[4]} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ── REGRESSION ── */}
          {tab === 'regression' && regression && (
            <div className="gis-stats-section">
              <h4><i className="bi bi-graph-up-arrow" /> {lang === 'fr' ? 'Régression Linéaire (tendance temporelle)' : 'Linear Regression (temporal trend)'}</h4>
              <table className="gis-stats-table">
                <tbody>
                  {([
                    [lang === 'fr' ? 'Équation' : 'Equation', regression.equation],
                    [lang === 'fr' ? 'Pente' : 'Slope', regression.slope.toFixed(4)],
                    [lang === 'fr' ? 'Ordonnée' : 'Intercept', regression.intercept.toFixed(2)],
                    ['R²', regression.rSquared.toFixed(4)],
                    ['R', Math.sqrt(regression.rSquared).toFixed(4)],
                    ['p-value', fmtP(regression.pValue)],
                    [lang === 'fr' ? 'Erreur std' : 'Std Error', regression.standardError.toFixed(4)],
                    ['N', regression.points.length.toString()],
                  ] as [string, string][]).map(([label, val]) => (
                    <tr key={label}><td className="gis-stats-label">{label}</td><td className="gis-stats-val">{val}</td></tr>
                  ))}
                </tbody>
              </table>

              <div className="gis-stats-badge">
                {regression.pValue < 0.05
                  ? <span className="gis-badge gis-badge-success">{lang === 'fr' ? 'Significatif (p<0.05)' : 'Significant (p<0.05)'}</span>
                  : <span className="gis-badge gis-badge-muted">{lang === 'fr' ? 'Non significatif' : 'Not significant'}</span>}
                {regression.slope > 0
                  ? <span className="gis-badge gis-badge-up">↑ {lang === 'fr' ? 'Tendance croissante' : 'Upward trend'}</span>
                  : <span className="gis-badge gis-badge-down">↓ {lang === 'fr' ? 'Tendance décroissante' : 'Downward trend'}</span>}
              </div>

              {/* Scatter + Line */}
              <div className="gis-stats-chart" style={{ marginTop: 12 }}>
                <ResponsiveContainer width="100%" height={200}>
                  <ScatterChart margin={{ left: 0, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis type="number" dataKey="year" domain={['dataMin', 'dataMax']} tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} />
                    <YAxis type="number" dataKey="value" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} width={55} />
                    <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 8, fontSize: 11 }} />
                    <Scatter data={regression.points} fill={indicator.palette[4]} />
                    <Scatter
                      data={regression.x.map((xi, i) => ({ year: xi, value: regression.predicted[i] }))}
                      fill="none"
                      line={{ stroke: '#ef4444', strokeWidth: 2 }}
                      shape={() => null as any}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ── ANOVA ── */}
          {tab === 'anova' && (
            <div className="gis-stats-section">
              <h4><i className="bi bi-diagram-3" /> ANOVA {lang === 'fr' ? '(par région)' : '(by region)'}</h4>
              <table className="gis-stats-table">
                <tbody>
                  {([
                    ['F-statistic', anova.fStatistic.toFixed(4)],
                    ['p-value', fmtP(anova.pValue)],
                    ['df (between)', anova.dfBetween.toString()],
                    ['df (within)', anova.dfWithin.toString()],
                    ['SS between', fmt(anova.ssBetween)],
                    ['SS within', fmt(anova.ssWithin)],
                    ['MS between', fmt(anova.msBetween)],
                    ['MS within', fmt(anova.msWithin)],
                    ['η² (effect size)', anova.etaSquared.toFixed(4)],
                  ] as [string, string][]).map(([label, val]) => (
                    <tr key={label}><td className="gis-stats-label">{label}</td><td className="gis-stats-val">{val}</td></tr>
                  ))}
                </tbody>
              </table>

              <div className="gis-stats-badge">
                {anova.pValue < 0.05
                  ? <span className="gis-badge gis-badge-success">{lang === 'fr' ? 'Différences significatives entre régions' : 'Significant differences between regions'}</span>
                  : <span className="gis-badge gis-badge-muted">{lang === 'fr' ? 'Pas de différence significative' : 'No significant difference'}</span>}
              </div>

              <h4 style={{ marginTop: 16 }}>{lang === 'fr' ? 'Statistiques par groupe' : 'Group Statistics'}</h4>
              <table className="gis-stats-table gis-stats-groups">
                <thead>
                  <tr>
                    <th>{lang === 'fr' ? 'Région' : 'Region'}</th>
                    <th>N</th>
                    <th>{lang === 'fr' ? 'Moyenne' : 'Mean'}</th>
                    <th>{lang === 'fr' ? 'Écart-type' : 'Std Dev'}</th>
                  </tr>
                </thead>
                <tbody>
                  {anova.groups.map(g => (
                    <tr key={g.name}>
                      <td className="gis-stats-label">{g.name}</td>
                      <td className="gis-stats-val">{g.n}</td>
                      <td className="gis-stats-val">{fmt(g.mean)}</td>
                      <td className="gis-stats-val">{fmt(g.stdDev)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Box chart approximation: bar chart of means */}
              <div className="gis-stats-chart" style={{ marginTop: 12 }}>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={anova.groups.map(g => ({ name: g.name, mean: g.mean, stdDev: g.stdDev }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} width={50} />
                    <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 8, fontSize: 11 }} />
                    <Bar dataKey="mean" fill={indicator.palette[4]} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ── SPATIAL ── */}
          {tab === 'spatial' && (
            <div className="gis-stats-section">
              <h4><i className="bi bi-geo" /> Moran's I — {lang === 'fr' ? 'Autocorrélation Spatiale' : 'Spatial Autocorrelation'}</h4>
              <table className="gis-stats-table">
                <tbody>
                  {([
                    ["Moran's I", spatial.moran.moranI.toFixed(4)],
                    [lang === 'fr' ? 'Attendu' : 'Expected', spatial.moran.expected.toFixed(4)],
                    ['Z-score', spatial.moran.zScore.toFixed(4)],
                    ['p-value', fmtP(spatial.moran.pValue)],
                    ['Variance', spatial.moran.variance.toFixed(6)],
                  ] as [string, string][]).map(([label, val]) => (
                    <tr key={label}><td className="gis-stats-label">{label}</td><td className="gis-stats-val">{val}</td></tr>
                  ))}
                </tbody>
              </table>

              <div className="gis-stats-badge">
                <span className={`gis-badge ${spatial.moran.interpretation === 'clustered' ? 'gis-badge-hot' : spatial.moran.interpretation === 'dispersed' ? 'gis-badge-cold' : 'gis-badge-muted'}`}>
                  {spatial.moran.interpretation === 'clustered'
                    ? (lang === 'fr' ? '🔴 Agrégation spatiale (Clustered)' : '🔴 Spatially Clustered')
                    : spatial.moran.interpretation === 'dispersed'
                    ? (lang === 'fr' ? '🔵 Dispersion spatiale (Dispersed)' : '🔵 Spatially Dispersed')
                    : (lang === 'fr' ? '⚪ Distribution aléatoire (Random)' : '⚪ Random Distribution')}
                </span>
              </div>

              <h4 style={{ marginTop: 16 }}><i className="bi bi-fire" /> Getis-Ord G* — Hot / Cold Spots</h4>
              <div className="gis-hotspot-list">
                {spatial.hotspots
                  .filter(h => h.type !== 'neutral')
                  .sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore))
                  .slice(0, 15)
                  .map(h => (
                    <div key={h.geoName} className={`gis-hotspot-row gis-hotspot-${h.type}`}>
                      <span className="gis-hotspot-icon">{h.type === 'hot' ? '🔴' : '🔵'}</span>
                      <span className="gis-hotspot-name">{displayName(h.geoName, lang)}</span>
                      <span className="gis-hotspot-z">z={h.zScore.toFixed(2)}</span>
                      <span className="gis-hotspot-p">p={fmtP(h.pValue)}</span>
                    </div>
                  ))}
                {spatial.hotspots.filter(h => h.type !== 'neutral').length === 0 && (
                  <div className="gis-stats-empty">{lang === 'fr' ? 'Aucun hotspot détecté' : 'No hotspots detected'}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ResizablePanel>
  )
}

// ── Helper: histogram bins ──
function buildHistogram(values: number[], bins: number) {
  if (!values.length) return []
  const min = Math.min(...values)
  const max = Math.max(...values)
  const binWidth = (max - min) / bins || 1
  const hist = Array.from({ length: bins }, (_, i) => ({
    label: (min + i * binWidth).toFixed(1),
    count: 0,
    binStart: min + i * binWidth,
    binEnd: min + (i + 1) * binWidth,
  }))
  values.forEach(v => {
    let idx = Math.floor((v - min) / binWidth)
    if (idx >= bins) idx = bins - 1
    if (idx < 0) idx = 0
    hist[idx].count++
  })
  return hist
}
