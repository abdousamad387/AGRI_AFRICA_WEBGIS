import { useState } from 'react'
import { useLanguage } from '../../i18n'
import { displayName } from '../../config/countryMapping'
import type { IndicatorDef } from '../../config/indicators'
import type { CountryValue } from '../../hooks/useIndicatorData'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import ResizablePanel from './ResizablePanel'

interface Props {
  ranking: CountryValue[]
  indicator: IndicatorDef
  year: number
  onClose: () => void
}

export default function ComparePanel({ ranking, indicator, year, onClose }: Props) {
  const { lang, t } = useLanguage()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const indLabel = lang === 'fr' ? indicator.fr : indicator.en

  const toggleCountry = (geoName: string) => {
    const next = new Set(selected)
    if (next.has(geoName)) next.delete(geoName)
    else if (next.size < 10) next.add(geoName)
    setSelected(next)
  }

  const chartData = ranking
    .filter(cv => selected.has(cv.geoName))
    .map(cv => ({ name: displayName(cv.geoName, lang), value: cv.value }))

  return (
    <ResizablePanel>
    <div className="gis-panel-inner gis-compare-panel">
      <div className="gis-panel-header">
        <h3><i className="bi bi-arrows-angle-expand" /> {t('panel.compare')}</h3>
        <button className="gis-panel-close" onClick={onClose}><i className="bi bi-x-lg" /></button>
      </div>
      <div className="gis-panel-subtitle">{indLabel} — {year}</div>

      <div className="gis-compare-chips">
        {ranking.slice(0, 20).map(cv => {
          const name = displayName(cv.geoName, lang)
          const isSelected = selected.has(cv.geoName)
          return (
            <button
              key={cv.geoName}
              className={`gis-compare-chip ${isSelected ? 'active' : ''}`}
              onClick={() => toggleCountry(cv.geoName)}
            >
              {name}
            </button>
          )
        })}
      </div>

      {chartData.length > 0 && (
        <div className="gis-compare-chart">
          <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 36)}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#e2e8f0', fontSize: 11 }} width={100} />
              <Tooltip
                contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [indicator.format(v), indLabel]}
              />
              <Bar dataKey="value" fill={indicator.palette[4]} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {chartData.length === 0 && (
        <div className="gis-compare-empty">
          <i className="bi bi-hand-index" />
          <p>{t('panel.selectCompare')}</p>
        </div>
      )}
    </div>
    </ResizablePanel>
  )
}
