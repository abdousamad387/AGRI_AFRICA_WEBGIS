import { useEffect } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'

interface Props {
  onMoveEnd: (center: { lat: number; lng: number }, zoom: number) => void
  onMouseMove: (coords: { lat: number; lng: number } | null) => void
  flyTo?: { lat: number; lng: number; zoom: number } | null
}

export default function MapEvents({ onMoveEnd, onMouseMove, flyTo }: Props) {
  const map = useMap()

  useMapEvents({
    moveend: () => {
      const c = map.getCenter()
      onMoveEnd({ lat: c.lat, lng: c.lng }, map.getZoom())
    },
    mousemove: (e) => {
      onMouseMove({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
    mouseout: () => {
      onMouseMove(null)
    },
  })

  useEffect(() => {
    if (flyTo) {
      map.flyTo([flyTo.lat, flyTo.lng], flyTo.zoom, { duration: 1.2 })
    }
  }, [flyTo, map])

  return null
}
