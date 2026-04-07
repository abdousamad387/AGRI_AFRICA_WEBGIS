interface Props {
  info: { name: string; value: number | null; x: number; y: number }
  indicator: { en: string; fr: string; format: (v: number) => string }
  lang: 'en' | 'fr'
}

export default function HoverTooltip({ info, indicator, lang }: Props) {
  const label = lang === 'fr' ? indicator.fr : indicator.en

  return (
    <div
      className="gis-hover-tooltip"
      style={{ left: info.x + 16, top: info.y - 20 }}
    >
      <div className="gis-hover-name">{info.name}</div>
      <div className="gis-hover-row">
        <span className="gis-hover-label">{label}</span>
        <span className="gis-hover-value">
          {info.value !== null ? indicator.format(info.value) : '—'}
        </span>
      </div>
    </div>
  )
}
