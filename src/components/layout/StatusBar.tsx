import { useLanguage } from '../../i18n'

interface Props {
  countryCount: number
  year: number
  coords: { lat: number; lng: number } | null
  zoom: number
}

export default function StatusBar({ countryCount, year, coords, zoom }: Props) {
  const { t } = useLanguage()

  return (
    <footer className="gis-statusbar">
      <div className="gis-status-left">
        <span><i className="bi bi-globe2" /> <strong>{countryCount}</strong> {t('status.countries')}</span>
        <span className="gis-status-sep">|</span>
        <span><i className="bi bi-calendar3" /> {t('status.year')}: <strong>{year}</strong></span>
      </div>
      <div className="gis-status-center">
        <span className="gis-status-src">{t('status.source')}</span>
      </div>
      <div className="gis-status-right">
        {coords && (
          <span className="gis-status-coords">
            <i className="bi bi-geo-alt" /> {coords.lat.toFixed(4)}°, {coords.lng.toFixed(4)}°
          </span>
        )}
        <span className="gis-status-sep">|</span>
        <span><i className="bi bi-zoom-in" /> {t('status.zoom')}: {zoom}</span>
        <span className="gis-status-sep">|</span>
        <span className="gis-status-copyright">© Abdou Samad Faye — Full Stack, WebGIS Developer, Geodata Scientist & Analyst</span>
      </div>
    </footer>
  )
}
