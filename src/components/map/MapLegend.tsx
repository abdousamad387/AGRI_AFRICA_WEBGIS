import type { IndicatorDef } from '../../config/indicators'
import { useLanguage } from '../../i18n'

interface Props {
  indicator: IndicatorDef
  min: number
  max: number
  year: number
}

export default function MapLegend({ indicator, min, max, year }: Props) {
  const { lang, t } = useLanguage()
  const label = lang === 'fr' ? indicator.fr : indicator.en

  return (
    <div className="gis-legend">
      <div className="gis-legend-header">
        <span className="gis-legend-title">{label}</span>
        <span className="gis-legend-year">{year}</span>
      </div>
      <div className="gis-legend-bar">
        {indicator.palette.map((c, i) => (
          <div key={i} style={{ background: c, flex: 1 }} />
        ))}
      </div>
      <div className="gis-legend-labels">
        <span>{t('legend.low')}: {indicator.format(min)}</span>
        <span>{t('legend.high')}: {indicator.format(max)}</span>
      </div>
    </div>
  )
}
