import { useState, useEffect } from 'react'
import type { FeatureCollection } from 'geojson'

export function useGeoData() {
  const [geojson, setGeojson] = useState<FeatureCollection | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/africa.geojson`)
      .then(r => r.json())
      .then((geo: FeatureCollection) => {
        const africaFeatures = geo.features.filter(
          f => f.properties?.CONTINENT === 'Africa'
        )
        setGeojson({ type: 'FeatureCollection', features: africaFeatures })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return { geojson, loading }
}
