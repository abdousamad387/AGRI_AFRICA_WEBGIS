import { useState, useCallback, useMemo, useRef } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

import { LanguageProvider, useLanguage } from './i18n'
import { basemaps } from './config/basemaps'
import { indicators } from './config/indicators'
import type { IndicatorDef } from './config/indicators'
import { useGeoData } from './hooks/useGeoData'
import { useIndicatorData } from './hooks/useIndicatorData'
import { geoToFr } from './config/countryMapping'

import AppHeader from './components/layout/AppHeader'
import Sidebar from './components/layout/Sidebar'
import StatusBar from './components/layout/StatusBar'
import MapToolbar from './components/layout/MapToolbar'
import ChoroplethLayer from './components/map/ChoroplethLayer'
import MapEvents from './components/map/MapEvents'
import MapLegend from './components/map/MapLegend'
import HoverTooltip from './components/map/HoverTooltip'
import SpatialTools from './components/map/SpatialTools'
import CountryPanel from './components/panels/CountryPanel'
import RankingPanel from './components/panels/RankingPanel'
import DataTablePanel from './components/panels/DataTablePanel'
import ComparePanel from './components/panels/ComparePanel'
import StatsPanel from './components/panels/StatsPanel'

import './styles/global.css'

function AppContent() {
  const { lang } = useLanguage()

  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Map state
  const [activeBasemap, setActiveBasemap] = useState('dark')
  const [activeIndicator, setActiveIndicator] = useState<IndicatorDef>(indicators[0])
  const [year, setYear] = useState(2024)
  const [opacity, setOpacity] = useState(80)
  const [showLabels, setShowLabels] = useState(false)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 2, lng: 20 })
  const [mapZoom, setMapZoom] = useState(3)
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number } | null>(null)

  // Panels
  const [activePanel, setActivePanel] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [hoverInfo, setHoverInfo] = useState<{ name: string; value: number | null; x: number; y: number } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number; zoom: number } | null>(null)
  const [activeSpatialTool, setActiveSpatialTool] = useState<'distance' | 'area' | null>(null)
  const mapRef = useRef<any>(null)

  // Data
  const { geojson, loading: geoLoading } = useGeoData()
  const {
    countryValues, min, max, ranking, years, loading: dataLoading,
    getCountryTrend, getCountryProfile,
  } = useIndicatorData(activeIndicator, year)

  const basemap = basemaps.find(b => b.id === activeBasemap) || basemaps[0]

  // Handlers
  const handleCountryClick = useCallback((geoName: string) => {
    setSelectedCountry(geoName)
    setActivePanel('country')
    // Fly to country center from GeoJSON
    if (geojson) {
      const feature = geojson.features.find(f => f.properties?.NAME === geoName)
      if (feature?.properties) {
        const lat = parseFloat(feature.properties.LABEL_Y?.toString().replace(',', '.')) || 0
        const lng = parseFloat(feature.properties.LABEL_X?.toString().replace(',', '.')) || 0
        if (lat && lng) setFlyTo({ lat, lng, zoom: 5 })
      }
    }
  }, [geojson])

  const handleMapMove = useCallback((center: { lat: number; lng: number }, zoom: number) => {
    setMapCenter(center)
    setMapZoom(zoom)
    setFlyTo(null)
  }, [])

  const handleClosePanel = useCallback(() => {
    setActivePanel(null)
    setSelectedCountry(null)
  }, [])

  // Map navigation
  const handleZoomIn = useCallback(() => { mapRef.current?.zoomIn() }, [])
  const handleZoomOut = useCallback(() => { mapRef.current?.zoomOut() }, [])
  const handleResetView = useCallback(() => { setFlyTo({ lat: 2, lng: 20, zoom: 3 }) }, [])
  const handleCenterAfrica = useCallback(() => { setFlyTo({ lat: 2, lng: 20, zoom: 4 }) }, [])

  // Stats data: build trend data for all countries + coords
  const trendData = useMemo(() => {
    return ranking.map(cv => ({
      frName: cv.frName,
      geoName: cv.geoName,
      data: getCountryTrend(cv.frName),
    }))
  }, [ranking, getCountryTrend])

  const countryCoords = useMemo(() => {
    if (!geojson) return []
    return geojson.features
      .filter((f: any) => f.properties?.NAME)
      .map((f: any) => {
        const lat = parseFloat(String(f.properties.LABEL_Y || '0').replace(',', '.'))
        const lng = parseFloat(String(f.properties.LABEL_X || '0').replace(',', '.'))
        return { geoName: f.properties.NAME as string, lat, lng }
      })
      .filter(c => c.lat !== 0 || c.lng !== 0)
  }, [geojson])

  const isLoading = geoLoading || dataLoading

  // Country data for panel
  const frName = selectedCountry ? (geoToFr[selectedCountry] || selectedCountry) : ''
  const trend = selectedCountry ? getCountryTrend(frName) : []
  const profile = selectedCountry ? getCountryProfile(frName) : {}

  return (
    <div className="gis-app">
      <AppHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />

      <div className="gis-body">
        <Sidebar
          open={sidebarOpen}
          activeBasemap={activeBasemap}
          onBasemap={setActiveBasemap}
          activeIndicator={activeIndicator}
          onIndicator={setActiveIndicator}
          year={year}
          onYear={setYear}
          years={years}
          opacity={opacity}
          onOpacity={setOpacity}
          showLabels={showLabels}
          onToggleLabels={() => setShowLabels(!showLabels)}
        />

        <div className="gis-map-area">
          <MapToolbar
            onSearch={setSearchQuery}
            onPanel={(p) => setActivePanel(p || null)}
            activePanel={activePanel}
            onSpatialTool={setActiveSpatialTool}
            activeSpatialTool={activeSpatialTool}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetView={handleResetView}
            onCenterAfrica={handleCenterAfrica}
          />

          <div className="gis-map-container">
            {isLoading && (
              <div className="gis-map-loading">
                <div className="gis-loader" />
                <span>Loading…</span>
              </div>
            )}

            <MapContainer
              center={[2, 20]}
              zoom={3}
              minZoom={2}
              maxZoom={10}
              zoomControl={false}
              ref={mapRef}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url={basemap.url} attribution={basemap.attribution} />
              <MapEvents
                onMoveEnd={handleMapMove}
                onMouseMove={setMouseCoords}
                flyTo={flyTo}
              />
              <SpatialTools activeTool={activeSpatialTool} onToolChange={setActiveSpatialTool} />
              {geojson && (
                <ChoroplethLayer
                  geojson={geojson}
                  countryValues={countryValues}
                  indicator={activeIndicator}
                  min={min}
                  max={max}
                  opacity={opacity}
                  lang={lang}
                  year={year}
                  onCountryClick={handleCountryClick}
                  onCountryHover={setHoverInfo}
                  highlightedCountry={selectedCountry}
                  searchQuery={searchQuery}
                />
              )}
            </MapContainer>

            {/* Hover tooltip */}
            {hoverInfo && (
              <HoverTooltip info={hoverInfo} indicator={activeIndicator} lang={lang} />
            )}

            {/* Legend */}
            <MapLegend indicator={activeIndicator} min={min} max={max} year={year} />
          </div>

          {/* Right panels */}
          {activePanel === 'country' && selectedCountry && (
            <CountryPanel
              geoName={selectedCountry}
              indicator={activeIndicator}
              countryValues={countryValues}
              profile={profile}
              trend={trend}
              year={year}
              onClose={handleClosePanel}
            />
          )}
          {activePanel === 'ranking' && (
            <RankingPanel
              ranking={ranking}
              indicator={activeIndicator}
              onCountryClick={handleCountryClick}
              highlightedCountry={selectedCountry}
              onClose={handleClosePanel}
            />
          )}
          {activePanel === 'data' && (
            <DataTablePanel
              ranking={ranking}
              indicator={activeIndicator}
              year={year}
              onCountryClick={handleCountryClick}
              onClose={handleClosePanel}
            />
          )}
          {activePanel === 'compare' && (
            <ComparePanel
              ranking={ranking}
              indicator={activeIndicator}
              year={year}
              onClose={handleClosePanel}
            />
          )}
          {activePanel === 'stats' && (
            <StatsPanel
              ranking={ranking}
              indicator={activeIndicator}
              year={year}
              trendData={trendData}
              countryCoords={countryCoords}
              onClose={handleClosePanel}
            />
          )}
        </div>
      </div>

      <StatusBar
        countryCount={countryValues.size}
        year={year}
        coords={mouseCoords}
        zoom={mapZoom}
      />
    </div>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  )
}
