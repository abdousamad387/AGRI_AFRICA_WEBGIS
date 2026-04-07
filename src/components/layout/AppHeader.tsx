import { useLanguage } from '../../i18n'

interface Props {
  onToggleSidebar: () => void
  sidebarOpen: boolean
}

export default function AppHeader({ onToggleSidebar, sidebarOpen }: Props) {
  const { lang, setLang, t } = useLanguage()

  return (
    <header className="gis-header">
      <div className="gis-header-left">
        <button className="gis-header-toggle" onClick={onToggleSidebar} title="Toggle sidebar">
          <i className={`bi ${sidebarOpen ? 'bi-layout-sidebar-inset' : 'bi-layout-sidebar'}`} />
        </button>
        <div className="gis-header-brand">
          <div className="gis-header-logo"><i className="bi bi-globe2" /></div>
          <div>
            <h1>{t('app.title')}</h1>
            <span className="gis-header-sub">{t('app.subtitle')}</span>
          </div>
        </div>
      </div>
      <div className="gis-header-right">
        <div className="gis-lang-toggle">
          <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
          <button className={lang === 'fr' ? 'active' : ''} onClick={() => setLang('fr')}>FR</button>
        </div>
      </div>
    </header>
  )
}
