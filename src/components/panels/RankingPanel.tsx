import { useLanguage } from '../../i18n'
import { displayName } from '../../config/countryMapping'
import type { IndicatorDef } from '../../config/indicators'
import type { CountryValue } from '../../hooks/useIndicatorData'
import ResizablePanel from './ResizablePanel'

interface Props {
  ranking: CountryValue[]
  indicator: IndicatorDef
  onCountryClick: (geoName: string) => void
  highlightedCountry: string | null
  onClose: () => void
}

export default function RankingPanel({ ranking, indicator, onCountryClick, highlightedCountry, onClose }: Props) {
  const { lang, t } = useLanguage()
  const indLabel = lang === 'fr' ? indicator.fr : indicator.en
  const topValue = ranking[0]?.value || 1

  return (
    <ResizablePanel>
    <div className="gis-panel-inner gis-ranking-panel">
      <div className="gis-panel-header">
        <h3><i className="bi bi-trophy" /> {t('panel.ranking')}</h3>
        <button className="gis-panel-close" onClick={onClose}><i className="bi bi-x-lg" /></button>
      </div>
      <div className="gis-panel-subtitle">{indLabel}</div>

      <div className="gis-ranking-list">
        {ranking.map((cv, idx) => {
          const pct = (cv.value / topValue) * 100
          const name = displayName(cv.geoName, lang)
          const isActive = highlightedCountry === cv.geoName
          return (
            <div
              key={cv.geoName}
              className={`gis-ranking-row ${isActive ? 'active' : ''}`}
              onClick={() => onCountryClick(cv.geoName)}
            >
              <span className="gis-rank-num">{idx + 1}</span>
              <div className="gis-rank-info">
                <span className="gis-rank-name">{name}</span>
                <div className="gis-rank-bar-bg">
                  <div
                    className="gis-rank-bar"
                    style={{ width: `${pct}%`, background: indicator.palette[4] }}
                  />
                </div>
              </div>
              <span className="gis-rank-value">{indicator.format(cv.value)}</span>
            </div>
          )
        })}
      </div>
    </div>
    </ResizablePanel>
  )
}
