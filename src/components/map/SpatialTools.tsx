import { useState, useRef, useEffect, useCallback } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

type Tool = 'distance' | 'area' | null

interface Props {
  activeTool: Tool
  onToolChange: (t: Tool) => void
}

export default function SpatialTools({ activeTool, onToolChange }: Props) {
  const map = useMap()
  const pointsRef = useRef<L.LatLng[]>([])
  const layerRef = useRef<L.LayerGroup>(L.layerGroup())
  const [result, setResult] = useState<string | null>(null)

  // Haversine distance in km
  const haversine = (a: L.LatLng, b: L.LatLng) => {
    const R = 6371
    const dLat = (b.lat - a.lat) * Math.PI / 180
    const dLng = (b.lng - a.lng) * Math.PI / 180
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2
    return 2 * R * Math.asin(Math.sqrt(s))
  }

  const clearMeasure = useCallback(() => {
    layerRef.current.clearLayers()
    pointsRef.current = []
    setResult(null)
  }, [])

  useEffect(() => {
    layerRef.current.addTo(map)
    return () => { layerRef.current.remove() }
  }, [map])

  useEffect(() => {
    if (!activeTool) { clearMeasure(); return }

    map.getContainer().style.cursor = 'crosshair'

    const onClick = (e: L.LeafletMouseEvent) => {
      const pts = pointsRef.current
      pts.push(e.latlng)

      // Draw marker
      const marker = L.circleMarker(e.latlng, {
        radius: 4, color: '#3b82f6', fillColor: '#60a5fa', fillOpacity: 1, weight: 2,
      })
      layerRef.current.addLayer(marker)

      if (activeTool === 'distance' && pts.length >= 2) {
        // Polyline
        layerRef.current.clearLayers()
        const polyline = L.polyline(pts, { color: '#3b82f6', weight: 3, dashArray: '8,6' })
        layerRef.current.addLayer(polyline)
        pts.forEach(p => {
          layerRef.current.addLayer(L.circleMarker(p, {
            radius: 4, color: '#3b82f6', fillColor: '#60a5fa', fillOpacity: 1, weight: 2,
          }))
        })
        let total = 0
        for (let i = 1; i < pts.length; i++) total += haversine(pts[i - 1], pts[i])
        setResult(total < 1 ? `${(total * 1000).toFixed(0)} m` : `${total.toFixed(2)} km`)
      }

      if (activeTool === 'area' && pts.length >= 3) {
        layerRef.current.clearLayers()
        const polygon = L.polygon(pts, { color: '#f59e0b', fillColor: 'rgba(245,158,11,0.2)', weight: 2 })
        layerRef.current.addLayer(polygon)
        pts.forEach(p => {
          layerRef.current.addLayer(L.circleMarker(p, {
            radius: 4, color: '#f59e0b', fillColor: '#fbbf24', fillOpacity: 1, weight: 2,
          }))
        })
        // Approximate area (geodesic)
        const areaM2 = Math.abs(geodesicArea(pts))
        const areaKm2 = areaM2 / 1e6
        setResult(areaKm2 < 1 ? `${areaM2.toFixed(0)} m²` : `${areaKm2.toFixed(2)} km²`)
      }
    }

    const onDblClick = () => {
      // Finish measurement
      map.getContainer().style.cursor = ''
      onToolChange(null)
    }

    map.on('click', onClick)
    map.on('dblclick', onDblClick)
    map.doubleClickZoom.disable()

    return () => {
      map.off('click', onClick)
      map.off('dblclick', onDblClick)
      map.doubleClickZoom.enable()
      map.getContainer().style.cursor = ''
    }
  }, [activeTool, map, clearMeasure, onToolChange])

  // Geodesic area approximation
  function geodesicArea(latlngs: L.LatLng[]): number {
    const d2r = Math.PI / 180
    const n = latlngs.length
    if (n < 3) return 0
    let area = 0
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n
      const xi = latlngs[i].lng * d2r
      const yi = latlngs[i].lat * d2r
      const xj = latlngs[j].lng * d2r
      const yj = latlngs[j].lat * d2r
      area += (xj - xi) * (2 + Math.sin(yi) + Math.sin(yj))
    }
    return Math.abs(area * 6371000 * 6371000 / 2)
  }

  if (!result) return null

  return (
    <div className="gis-measure-result">
      <i className={`bi ${activeTool === 'area' ? 'bi-bounding-box' : 'bi-rulers'}`} />
      <span>{result}</span>
      <button onClick={() => { clearMeasure(); onToolChange(null) }} title="Clear">
        <i className="bi bi-x-lg" />
      </button>
    </div>
  )
}
