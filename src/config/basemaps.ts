export interface Basemap {
  id: string
  name: { en: string; fr: string }
  url: string
  attribution: string
  icon: string
}

export const basemaps: Basemap[] = [
  {
    id: 'dark',
    name: { en: 'Dark', fr: 'Sombre' },
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO',
    icon: 'bi-moon-stars',
  },
  {
    id: 'satellite',
    name: { en: 'Satellite', fr: 'Satellite' },
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri',
    icon: 'bi-globe-americas',
  },
  {
    id: 'terrain',
    name: { en: 'Terrain', fr: 'Terrain' },
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap',
    icon: 'bi-mountains',
  },
  {
    id: 'light',
    name: { en: 'Light', fr: 'Clair' },
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO',
    icon: 'bi-sun',
  },
  {
    id: 'osm',
    name: { en: 'OpenStreetMap', fr: 'OpenStreetMap' },
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OSM contributors',
    icon: 'bi-map',
  },
]
