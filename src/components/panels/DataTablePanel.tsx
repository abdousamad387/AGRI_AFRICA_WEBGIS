import { useState } from 'react'
import { useLanguage } from '../../i18n'
import { displayName } from '../../config/countryMapping'
import type { IndicatorDef } from '../../config/indicators'
import type { CountryValue } from '../../hooks/useIndicatorData'
import ResizablePanel from './ResizablePanel'

interface Props {
  ranking: CountryValue[]
  indicator: IndicatorDef
  year: number
  onCountryClick: (geoName: string) => void
  onClose: () => void
}

export default function DataTablePanel({ ranking, indicator, year, onCountryClick, onClose }: Props) {
  const { lang, t } = useLanguage()
  const [sortAsc, setSortAsc] = useState(false)
  const [filter, setFilter] = useState('')
  const indLabel = lang === 'fr' ? indicator.fr : indicator.en

  const sorted = [...ranking].sort((a, b) => sortAsc ? a.value - b.value : b.value - a.value)
  const filtered = filter
    ? sorted.filter(cv => displayName(cv.geoName, lang).toLowerCase().includes(filter.toLowerCase()))
    : sorted

  return (
    <ResizablePanel>
    <div className="gis-panel-inner gis-data-panel">
      <div className="gis-panel-header">
        <h3><i className="bi bi-table" /> {t('panel.data')}</h3>
        <button className="gis-panel-close" onClick={onClose}><i className="bi bi-x-lg" /></button>
      </div>
      <div className="gis-panel-subtitle">{indLabel} — {year}</div>

      <div className="gis-data-filter">
        <i className="bi bi-funnel" />
        <input
          placeholder={t('tool.search')}
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </div>

      <div className="gis-data-table-wrap">
        <table className="gis-data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{t('panel.country.name')}</th>
              <th>{t('panel.region')}</th>
              <th
                className="gis-sortable"
                onClick={() => setSortAsc(!sortAsc)}
              >
                {t('panel.value')} {sortAsc ? '↑' : '↓'}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((cv, idx) => (
              <tr key={cv.geoName} onClick={() => onCountryClick(cv.geoName)} className="gis-data-row">
                <td className="gis-data-rank">{idx + 1}</td>
                <td className="gis-data-name">{displayName(cv.geoName, lang)}</td>
                <td className="gis-data-region">{cv.region}</td>
                <td className="gis-data-value">{indicator.format(cv.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </ResizablePanel>
  )
}
