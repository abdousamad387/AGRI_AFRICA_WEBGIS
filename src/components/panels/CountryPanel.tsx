import { useLanguage } from '../../i18n'
import { displayName } from '../../config/countryMapping'
import type { IndicatorDef } from '../../config/indicators'
import type { CountryValue } from '../../hooks/useIndicatorData'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import ResizablePanel from './ResizablePanel'

interface Props {
  geoName: string
  indicator: IndicatorDef
  countryValues: Map<string, CountryValue>
  profile: Record<string, number>
  trend: { year: number; value: number }[]
  year: number
  onClose: () => void
}

export default function CountryPanel({ geoName, indicator, countryValues, profile, trend, year, onClose }: Props) {
  const { lang, t } = useLanguage()
  const name = displayName(geoName, lang)
  const cv = countryValues.get(geoName)
  const indLabel = lang === 'fr' ? indicator.fr : indicator.en

  // Build mini KPIs from profile
  const kpis = Object.entries(profile).filter(([k]) => k !== 'Pays' && k !== 'Région').slice(0, 8)

  return (
    <ResizablePanel>
    <div className="gis-panel-inner gis-country-panel">
      <div className="gis-panel-header">
        <h3><i className="bi bi-geo-alt-fill" /> {name}</h3>
        <button className="gis-panel-close" onClick={onClose}><i className="bi bi-x-lg" /></button>
      </div>

      {cv && (
        <div className="gis-panel-hero">
          <div className="gis-panel-hero-label">{indLabel}</div>
          <div className="gis-panel-hero-value">{indicator.format(cv.value)}</div>
          <div className="gis-panel-hero-meta">{cv.region} — {year}</div>
        </div>
      )}

      {/* Trend chart */}
      {trend.length > 1 && (
        <div className="gis-panel-section">
          <h4><i className="bi bi-graph-up" /> {t('panel.chart')}</h4>
          <div className="gis-panel-chart">
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} width={50} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(v: number) => [indicator.format(v), indLabel]}
                />
                <Line type="monotone" dataKey="value" stroke={indicator.palette[4]} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Key indicators */}
      {kpis.length > 0 && (
        <div className="gis-panel-section">
          <h4><i className="bi bi-clipboard-data" /> Key Indicators</h4>
          <div className="gis-panel-kpis">
            {kpis.map(([key, val]) => (
              <div key={key} className="gis-panel-kpi">
                <span className="gis-panel-kpi-label">{key}</span>
                <span className="gis-panel-kpi-value">{typeof val === 'number' ? val.toLocaleString() : val}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </ResizablePanel>
  )
}
