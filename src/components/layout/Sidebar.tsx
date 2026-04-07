import { useLanguage } from '../../i18n'
import { basemaps } from '../../config/basemaps'
import { indicators, indicatorCategories, type IndicatorDef } from '../../config/indicators'
import { useState, useCallback, useRef, useEffect } from 'react'

interface Props {
  open: boolean
  activeBasemap: string
  onBasemap: (id: string) => void
  activeIndicator: IndicatorDef
  onIndicator: (ind: IndicatorDef) => void
  year: number
  onYear: (y: number) => void
  years: number[]
  opacity: number
  onOpacity: (v: number) => void
  showLabels: boolean
  onToggleLabels: () => void
}

export default function Sidebar({
  open, activeBasemap, onBasemap, activeIndicator, onIndicator,
  year, onYear, years, opacity, onOpacity, showLabels, onToggleLabels,
}: Props) {
  const { lang, t } = useLanguage()
  const [catFilter, setCatFilter] = useState<string>('all')
  const [searchQ, setSearchQ] = useState('')
  const [width, setWidth] = useState(310)
  const dragging = useRef(false)
  const startX = useRef(0)
  const startW = useRef(0)

  const onResizeDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    startX.current = e.clientX
    startW.current = width
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [width])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      const delta = e.clientX - startX.current
      setWidth(Math.max(220, Math.min(500, startW.current + delta)))
    }
    const onUp = () => {
      if (!dragging.current) return
      dragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  const filtered = indicators.filter(ind => {
    if (catFilter !== 'all' && ind.category !== catFilter) return false
    if (searchQ) {
      const q = searchQ.toLowerCase()
      const label = (lang === 'fr' ? ind.fr : ind.en).toLowerCase()
      return label.includes(q)
    }
    return true
  })

  return (
    <aside className={`gis-sidebar ${open ? 'open' : 'collapsed'}`} style={open ? { width, minWidth: width } : undefined}>
      {/* ── Basemap ── */}
      <div className="gis-sidebar-section">
        <h3><i className="bi bi-map" /> {t('sidebar.basemap')}</h3>
        <div className="gis-basemap-grid">
          {basemaps.map(bm => (
            <button
              key={bm.id}
              className={`gis-basemap-btn ${activeBasemap === bm.id ? 'active' : ''}`}
              onClick={() => onBasemap(bm.id)}
              title={bm.name[lang]}
            >
              <i className={`bi ${bm.icon}`} />
              <span>{bm.name[lang]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Indicator ── */}
      <div className="gis-sidebar-section">
        <h3><i className="bi bi-layers" /> {t('sidebar.indicator')}</h3>

        {/* Category chips */}
        <div className="gis-cat-chips">
          <button className={catFilter === 'all' ? 'active' : ''} onClick={() => setCatFilter('all')}>
            {t('sidebar.all')}
          </button>
          {indicatorCategories.map(cat => (
            <button
              key={cat.id}
              className={catFilter === cat.id ? 'active' : ''}
              onClick={() => setCatFilter(cat.id)}
            >
              <i className={`bi ${cat.icon}`} /> {cat[lang]}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="gis-ind-search">
          <i className="bi bi-search" />
          <input
            type="text"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder={t('tool.search')}
          />
        </div>

        {/* Indicator list */}
        <div className="gis-ind-list">
          {filtered.map(ind => (
            <button
              key={ind.key}
              className={`gis-ind-item ${activeIndicator.key === ind.key ? 'active' : ''}`}
              onClick={() => onIndicator(ind)}
            >
              <span className="gis-ind-dot" style={{ background: ind.palette[4] }} />
              <span>{lang === 'fr' ? ind.fr : ind.en}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Year ── */}
      <div className="gis-sidebar-section">
        <h3><i className="bi bi-calendar3" /> {t('sidebar.year')}: <strong>{year}</strong></h3>
        <input
          type="range"
          min={years[0] || 2000}
          max={years[years.length - 1] || 2024}
          value={year}
          onChange={e => onYear(Number(e.target.value))}
          className="gis-year-slider"
        />
        <div className="gis-year-labels">
          <span>{years[0] || 2000}</span>
          <span>{years[years.length - 1] || 2024}</span>
        </div>
      </div>

      {/* ── Display options ── */}
      <div className="gis-sidebar-section">
        <h3><i className="bi bi-sliders" /> {t('sidebar.choropleth')}</h3>
        <div className="gis-option-row">
          <label>{t('sidebar.opacity')}</label>
          <input
            type="range" min={0} max={100} value={opacity}
            onChange={e => onOpacity(Number(e.target.value))}
          />
          <span>{opacity}%</span>
        </div>
        <div className="gis-option-row">
          <label>{t('sidebar.labels')}</label>
          <button className={`gis-toggle ${showLabels ? 'on' : ''}`} onClick={onToggleLabels}>
            <span className="gis-toggle-knob" />
          </button>
        </div>
      </div>
      <div className="gis-sidebar-resize" onMouseDown={onResizeDown} />
    </aside>
  )
}
