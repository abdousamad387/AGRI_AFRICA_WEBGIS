import { useRef, useCallback } from 'react'
import { GeoJSON } from 'react-leaflet'
import type { Layer, PathOptions } from 'leaflet'
import type { Feature, FeatureCollection } from 'geojson'
import { displayName } from '../../config/countryMapping'
import type { IndicatorDef } from '../../config/indicators'
import type { CountryValue } from '../../hooks/useIndicatorData'
import type { Lang } from '../../i18n'

interface Props {
  geojson: FeatureCollection
  countryValues: Map<string, CountryValue>
  indicator: IndicatorDef
  min: number
  max: number
  opacity: number
  lang: Lang
  year: number
  onCountryClick: (geoName: string) => void
  onCountryHover: (info: { name: string; value: number | null; x: number; y: number } | null) => void
  highlightedCountry: string | null
  searchQuery: string
}

function getColor(value: number, min: number, max: number, palette: string[]): string {
  if (max === min) return palette[Math.floor(palette.length / 2)]
  const ratio = (value - min) / (max - min)
  const idx = Math.min(Math.floor(ratio * palette.length), palette.length - 1)
  return palette[idx]
}

export default function ChoroplethLayer({
  geojson, countryValues, indicator, min, max, opacity, lang, year,
  onCountryClick, onCountryHover, highlightedCountry, searchQuery,
}: Props) {
  const geoRef = useRef<any>(null)

  const style = useCallback((feature?: Feature): PathOptions => {
    if (!feature) return {}
    const name = feature.properties?.NAME
    const cv = countryValues.get(name)
    const isHighlighted = highlightedCountry === name
    const isSearchMatch = searchQuery && displayName(name, lang).toLowerCase().includes(searchQuery.toLowerCase())

    return {
      fillColor: cv ? getColor(cv.value, min, max, indicator.palette) : '#1e293b',
      weight: isHighlighted ? 3 : isSearchMatch ? 2.5 : 1,
      color: isHighlighted ? '#10b981' : isSearchMatch ? '#fbbf24' : '#334155',
      fillOpacity: cv ? opacity / 100 : 0.15,
      dashArray: isSearchMatch && !isHighlighted ? '5 3' : undefined,
    }
  }, [countryValues, indicator, min, max, opacity, highlightedCountry, searchQuery, lang])

  const onEachFeature = useCallback((feature: Feature, layer: Layer) => {
    const geoName = feature.properties?.NAME || ''
    const cv = countryValues.get(geoName)

    layer.on({
      mouseover: (e) => {
        const l = e.target
        l.setStyle({ weight: 3, color: '#10b981', fillOpacity: Math.min((opacity / 100) + 0.15, 1) })
        l.bringToFront()
        const { clientX, clientY } = e.originalEvent
        onCountryHover({
          name: displayName(geoName, lang),
          value: cv?.value ?? null,
          x: clientX,
          y: clientY,
        })
      },
      mouseout: (e) => {
        geoRef.current?.resetStyle(e.target)
        onCountryHover(null)
      },
      click: () => {
        onCountryClick(geoName)
      },
    })
  }, [countryValues, lang, opacity, onCountryClick, onCountryHover])

  const geoKey = `${indicator.key}-${year}-${opacity}-${highlightedCountry}-${searchQuery}`

  return (
    <GeoJSON
      key={geoKey}
      ref={geoRef}
      data={geojson}
      style={style}
      onEachFeature={onEachFeature}
    />
  )
}
