import { createContext, useContext, useState, type ReactNode } from 'react'

type Lang = 'en' | 'fr'

const translations: Record<string, { en: string; fr: string }> = {
  // Header
  'app.title': { en: 'AgriAfrica WebGIS', fr: 'AgriAfrica WebGIS' },
  'app.subtitle': { en: 'Interactive Agricultural Atlas of Africa — 2000-2024', fr: 'Atlas Agricole Interactif de l\'Afrique — 2000-2024' },

  // Sidebar sections
  'sidebar.layers': { en: 'Layers', fr: 'Couches' },
  'sidebar.basemap': { en: 'Basemap', fr: 'Fond de carte' },
  'sidebar.indicator': { en: 'Indicator', fr: 'Indicateur' },
  'sidebar.year': { en: 'Year', fr: 'Année' },
  'sidebar.category': { en: 'Category', fr: 'Catégorie' },
  'sidebar.all': { en: 'All', fr: 'Toutes' },
  'sidebar.opacity': { en: 'Opacity', fr: 'Opacité' },
  'sidebar.boundaries': { en: 'Country borders', fr: 'Frontières pays' },
  'sidebar.labels': { en: 'Country labels', fr: 'Noms des pays' },
  'sidebar.choropleth': { en: 'Choropleth', fr: 'Choroplèthe' },

  // Panels
  'panel.country': { en: 'Country Profile', fr: 'Profil Pays' },
  'panel.ranking': { en: 'Ranking', fr: 'Classement' },
  'panel.data': { en: 'Data Table', fr: 'Tableau de données' },
  'panel.chart': { en: 'Trend Chart', fr: 'Graphique tendance' },
  'panel.compare': { en: 'Compare', fr: 'Comparer' },
  'panel.close': { en: 'Close', fr: 'Fermer' },
  'panel.noCountry': { en: 'Click a country on the map', fr: 'Cliquez un pays sur la carte' },
  'panel.rank': { en: 'Rank', fr: 'Rang' },
  'panel.country.name': { en: 'Country', fr: 'Pays' },
  'panel.value': { en: 'Value', fr: 'Valeur' },
  'panel.region': { en: 'Region', fr: 'Région' },
  'panel.selectCompare': { en: 'Select countries to compare', fr: 'Sélectionnez les pays à comparer' },

  // Map
  'map.loading': { en: 'Loading map data…', fr: 'Chargement des données…' },
  'map.noData': { en: 'No data', fr: 'Pas de données' },
  'map.zoomIn': { en: 'Zoom in', fr: 'Zoom +' },
  'map.zoomOut': { en: 'Zoom out', fr: 'Zoom -' },
  'map.resetView': { en: 'Reset view', fr: 'Vue initiale' },

  // Legend
  'legend.title': { en: 'Legend', fr: 'Légende' },
  'legend.low': { en: 'Low', fr: 'Bas' },
  'legend.high': { en: 'High', fr: 'Élevé' },

  // Status bar
  'status.countries': { en: 'countries', fr: 'pays' },
  'status.year': { en: 'Year', fr: 'Année' },
  'status.coords': { en: 'Coordinates', fr: 'Coordonnées' },
  'status.zoom': { en: 'Zoom', fr: 'Zoom' },
  'status.source': { en: 'Sources: FAO | IFPRI | World Bank | IFAD', fr: 'Sources : FAO | IFPRI | Banque Mondiale | FIDA' },

  // Toolbar
  'tool.search': { en: 'Search country…', fr: 'Rechercher un pays…' },
  'tool.export': { en: 'Export', fr: 'Exporter' },
  'tool.print': { en: 'Print', fr: 'Imprimer' },
  'tool.fullscreen': { en: 'Fullscreen', fr: 'Plein écran' },
  'tool.measure': { en: 'Measure', fr: 'Mesurer' },

  // Categories
  'cat.production': { en: 'Production', fr: 'Production' },
  'cat.climate': { en: 'Climate', fr: 'Climat' },
  'cat.trade': { en: 'Trade', fr: 'Commerce' },
  'cat.security': { en: 'Food Security', fr: 'Sécurité alimentaire' },
  'cat.finance': { en: 'Finance', fr: 'Finance' },
  'cat.social': { en: 'Social', fr: 'Social' },
  'cat.sustainability': { en: 'Sustainability', fr: 'Durabilité' },
}

interface LangCtx { lang: Lang; setLang: (l: Lang) => void; t: (key: string) => string }

const LanguageContext = createContext<LangCtx>({
  lang: 'en',
  setLang: () => {},
  t: (k) => k,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  const t = (key: string) => translations[key]?.[lang] || key
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() { return useContext(LanguageContext) }
export type { Lang }
