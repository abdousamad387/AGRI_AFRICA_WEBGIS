import { useLanguage } from '../../i18n'

interface Props {
  onSearch: (q: string) => void
  onPanel: (panel: string) => void
  activePanel: string | null
  onSpatialTool: (tool: 'distance' | 'area' | null) => void
  activeSpatialTool: 'distance' | 'area' | null
  onZoomIn: () => void
  onZoomOut: () => void
  onResetView: () => void
  onCenterAfrica: () => void
}

export default function MapToolbar({ onSearch, onPanel, activePanel, onSpatialTool, activeSpatialTool, onZoomIn, onZoomOut, onResetView, onCenterAfrica }: Props) {
  const { t, lang } = useLanguage()

  const panels = [
    { id: 'ranking', icon: 'bi-trophy', label: t('panel.ranking') },
    { id: 'data',    icon: 'bi-table',  label: t('panel.data') },
    { id: 'compare', icon: 'bi-arrows-angle-expand', label: t('panel.compare') },
    { id: 'stats',   icon: 'bi-calculator', label: lang === 'fr' ? 'Statistiques' : 'Statistics' },
  ]

  const spatialTools = [
    { id: 'distance' as const, icon: 'bi-rulers', label: lang === 'fr' ? 'Distance' : 'Distance' },
    { id: 'area' as const,     icon: 'bi-bounding-box', label: lang === 'fr' ? 'Surface' : 'Area' },
  ]

  const mapTools = [
    { id: 'zoomIn',  icon: 'bi-zoom-in',  label: t('map.zoomIn'),   action: onZoomIn },
    { id: 'zoomOut', icon: 'bi-zoom-out',  label: t('map.zoomOut'),  action: onZoomOut },
    { id: 'reset',   icon: 'bi-arrow-counterclockwise', label: t('map.resetView'), action: onResetView },
    { id: 'center',  icon: 'bi-geo-alt',   label: lang === 'fr' ? 'Centrer Afrique' : 'Center Africa', action: onCenterAfrica },
  ]

  return (
    <div className="gis-toolbar">
      <div className="gis-toolbar-search">
        <i className="bi bi-search" />
        <input
          type="text"
          placeholder={t('tool.search')}
          onChange={e => onSearch(e.target.value)}
        />
      </div>

      {/* Spatial tools */}
      <div className="gis-toolbar-group">
        <span className="gis-toolbar-divider" />
        {spatialTools.map(st => (
          <button
            key={st.id}
            className={`gis-tool-btn ${activeSpatialTool === st.id ? 'active' : ''}`}
            onClick={() => onSpatialTool(activeSpatialTool === st.id ? null : st.id)}
            title={st.label}
          >
            <i className={`bi ${st.icon}`} />
            <span>{st.label}</span>
          </button>
        ))}
      </div>

      {/* Map navigation */}
      <div className="gis-toolbar-group">
        <span className="gis-toolbar-divider" />
        {mapTools.map(mt => (
          <button key={mt.id} className="gis-tool-btn" onClick={mt.action} title={mt.label}>
            <i className={`bi ${mt.icon}`} />
          </button>
        ))}
      </div>

      {/* Panel toggles */}
      <div className="gis-toolbar-tools">
        <span className="gis-toolbar-divider" />
        {panels.map(tool => (
          <button
            key={tool.id}
            className={`gis-tool-btn ${activePanel === tool.id ? 'active' : ''}`}
            onClick={() => onPanel(activePanel === tool.id ? '' : tool.id)}
            title={tool.label}
          >
            <i className={`bi ${tool.icon}`} />
            <span>{tool.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
