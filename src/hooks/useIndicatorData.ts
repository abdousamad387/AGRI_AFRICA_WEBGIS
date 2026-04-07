import { useState, useEffect, useMemo } from 'react'
import { frToGeo } from '../config/countryMapping'
import type { IndicatorDef } from '../config/indicators'

const cache: Record<string, any[]> = {}

function loadSource(source: string): Promise<any[]> {
  if (cache[source]) return Promise.resolve(cache[source])
  return fetch(`${import.meta.env.BASE_URL}data/${source}.json`)
    .then(r => r.json())
    .then(d => { cache[source] = d; return d })
}

export interface CountryValue {
  geoName: string
  frName: string
  value: number
  region: string
}

export function useIndicatorData(indicator: IndicatorDef | null, year: number) {
  const [rawData, setRawData] = useState<any[]>([])
  const [allData, setAllData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!indicator) return
    setLoading(true)
    loadSource(indicator.source).then(d => {
      setAllData(d)
      setRawData(d)
      setLoading(false)
    })
  }, [indicator?.source])

  // Values for current year, indexed by GeoJSON name
  const countryValues = useMemo(() => {
    if (!indicator) return new Map<string, CountryValue>()
    const map = new Map<string, CountryValue>()
    rawData
      .filter(d => Number(d['Année']) === year)
      .forEach(d => {
        const frName = d['Pays'] as string
        const geoName = frToGeo[frName]
        if (!geoName) return
        const v = parseFloat(String(d[indicator.key]).replace(',', '.'))
        if (isNaN(v)) return
        map.set(geoName, { geoName, frName, value: v, region: d['Région'] || '' })
      })
    return map
  }, [rawData, year, indicator?.key])

  // Min / max
  const { min, max } = useMemo(() => {
    const vals = Array.from(countryValues.values()).map(c => c.value)
    if (!vals.length) return { min: 0, max: 1 }
    return { min: Math.min(...vals), max: Math.max(...vals) }
  }, [countryValues])

  // Ranking (sorted desc)
  const ranking = useMemo(() => {
    return Array.from(countryValues.values()).sort((a, b) => b.value - a.value)
  }, [countryValues])

  // Available years
  const years = useMemo(() => {
    const set = new Set(allData.map(d => Number(d['Année'])).filter(n => !isNaN(n)))
    return Array.from(set).sort()
  }, [allData])

  // Trend for a specific country (all years)
  function getCountryTrend(frName: string): { year: number; value: number }[] {
    if (!indicator) return []
    return allData
      .filter(d => d['Pays'] === frName)
      .map(d => ({
        year: Number(d['Année']),
        value: parseFloat(String(d[indicator.key]).replace(',', '.')),
      }))
      .filter(d => !isNaN(d.year) && !isNaN(d.value))
      .sort((a, b) => a.year - b.year)
  }

  // All indicator values for a country in a given year
  function getCountryProfile(frName: string): Record<string, number> {
    if (!indicator) return {}
    const row = allData.find(d => d['Pays'] === frName && Number(d['Année']) === year)
    if (!row) return {}
    const profile: Record<string, number> = {}
    Object.entries(row).forEach(([k, v]) => {
      const num = parseFloat(String(v).replace(',', '.'))
      if (!isNaN(num) && k !== 'Année') profile[k] = num
    })
    return profile
  }

  return { countryValues, min, max, ranking, years, loading, getCountryTrend, getCountryProfile }
}
