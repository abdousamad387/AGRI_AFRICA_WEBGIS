/**
 * Advanced Statistics Engine
 * Linear Regression, Moran's I (spatial autocorrelation), ANOVA, descriptive stats, correlation
 */

// ── Descriptive Statistics ──────────────────────────────
export interface DescriptiveStats {
  n: number
  mean: number
  median: number
  stdDev: number
  variance: number
  min: number
  max: number
  range: number
  q1: number
  q3: number
  iqr: number
  skewness: number
  kurtosis: number
  cv: number       // coefficient of variation
}

function quantile(sorted: number[], q: number): number {
  const pos = (sorted.length - 1) * q
  const lo = Math.floor(pos)
  const hi = Math.ceil(pos)
  if (lo === hi) return sorted[lo]
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo)
}

export function descriptiveStats(values: number[]): DescriptiveStats {
  const n = values.length
  if (n === 0) return { n: 0, mean: 0, median: 0, stdDev: 0, variance: 0, min: 0, max: 0, range: 0, q1: 0, q3: 0, iqr: 0, skewness: 0, kurtosis: 0, cv: 0 }

  const sorted = [...values].sort((a, b) => a - b)
  const mean = values.reduce((s, v) => s + v, 0) / n
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / n
  const stdDev = Math.sqrt(variance)
  const median = quantile(sorted, 0.5)
  const q1 = quantile(sorted, 0.25)
  const q3 = quantile(sorted, 0.75)

  // Skewness (Fisher)
  const m3 = values.reduce((s, v) => s + ((v - mean) / (stdDev || 1)) ** 3, 0) / n
  // Kurtosis (excess)
  const m4 = values.reduce((s, v) => s + ((v - mean) / (stdDev || 1)) ** 4, 0) / n - 3

  return {
    n,
    mean,
    median,
    stdDev,
    variance,
    min: sorted[0],
    max: sorted[n - 1],
    range: sorted[n - 1] - sorted[0],
    q1,
    q3,
    iqr: q3 - q1,
    skewness: m3,
    kurtosis: m4,
    cv: stdDev / (Math.abs(mean) || 1) * 100,
  }
}

// ── Linear Regression ───────────────────────────────────
export interface RegressionResult {
  slope: number
  intercept: number
  rSquared: number
  pValue: number
  standardError: number
  predicted: number[]
  residuals: number[]
  equation: string
}

export function linearRegression(x: number[], y: number[]): RegressionResult {
  const n = x.length
  if (n < 3) return { slope: 0, intercept: 0, rSquared: 0, pValue: 1, standardError: 0, predicted: [], residuals: [], equation: 'y = 0' }

  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((s, xi, i) => s + xi * y[i], 0)
  const sumX2 = x.reduce((s, xi) => s + xi * xi, 0)
  const sumY2 = y.reduce((s, yi) => s + yi * yi, 0)

  const denom = n * sumX2 - sumX * sumX
  const slope = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0
  const intercept = (sumY - slope * sumX) / n

  // R²
  const predicted = x.map(xi => slope * xi + intercept)
  const residuals = y.map((yi, i) => yi - predicted[i])
  const ssTot = y.reduce((s, yi) => s + (yi - sumY / n) ** 2, 0)
  const ssRes = residuals.reduce((s, r) => s + r * r, 0)
  const rSquared = ssTot !== 0 ? 1 - ssRes / ssTot : 0

  // Standard error & t-test for slope
  const se = n > 2 ? Math.sqrt(ssRes / (n - 2)) : 0
  const sxx = sumX2 - sumX * sumX / n
  const seBeta = sxx > 0 ? se / Math.sqrt(sxx) : 0
  const tStat = seBeta > 0 ? Math.abs(slope) / seBeta : 0
  // Approximate p-value (t-distribution approximation for df > 3)
  const df = n - 2
  const pValue = df > 0 ? Math.exp(-0.717 * tStat - 0.416 * tStat * tStat / df) : 1

  const sign = intercept >= 0 ? '+' : ''
  const equation = `y = ${slope.toFixed(4)}x ${sign}${intercept.toFixed(2)}`

  return { slope, intercept, rSquared, pValue: Math.min(1, Math.max(0, pValue)), standardError: se, predicted, residuals, equation }
}

// ── Pearson Correlation ─────────────────────────────────
export interface CorrelationResult {
  r: number
  rSquared: number
  pValue: number
  n: number
}

export function pearsonCorrelation(x: number[], y: number[]): CorrelationResult {
  const n = x.length
  if (n < 3) return { r: 0, rSquared: 0, pValue: 1, n }

  const mx = x.reduce((a, b) => a + b, 0) / n
  const my = y.reduce((a, b) => a + b, 0) / n

  let num = 0, dx2 = 0, dy2 = 0
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx
    const dy = y[i] - my
    num += dx * dy
    dx2 += dx * dx
    dy2 += dy * dy
  }
  const denom = Math.sqrt(dx2 * dy2)
  const r = denom > 0 ? num / denom : 0

  // t-test for significance
  const tStat = Math.abs(r) * Math.sqrt((n - 2) / (1 - r * r + 1e-15))
  const df = n - 2
  const pValue = df > 0 ? Math.exp(-0.717 * tStat - 0.416 * tStat * tStat / df) : 1

  return { r, rSquared: r * r, pValue: Math.min(1, Math.max(0, pValue)), n }
}

// ── One-Way ANOVA ───────────────────────────────────────
export interface AnovaResult {
  fStatistic: number
  pValue: number
  dfBetween: number
  dfWithin: number
  ssBetween: number
  ssWithin: number
  msBetween: number
  msWithin: number
  etaSquared: number   // effect size
  groups: { name: string; n: number; mean: number; stdDev: number }[]
}

export function oneWayAnova(groups: { name: string; values: number[] }[]): AnovaResult {
  const validGroups = groups.filter(g => g.values.length > 0)
  const k = validGroups.length
  const allValues = validGroups.flatMap(g => g.values)
  const N = allValues.length
  const grandMean = allValues.reduce((a, b) => a + b, 0) / (N || 1)

  // SS Between
  let ssBetween = 0
  validGroups.forEach(g => {
    const gMean = g.values.reduce((a, b) => a + b, 0) / g.values.length
    ssBetween += g.values.length * (gMean - grandMean) ** 2
  })

  // SS Within
  let ssWithin = 0
  validGroups.forEach(g => {
    const gMean = g.values.reduce((a, b) => a + b, 0) / g.values.length
    g.values.forEach(v => { ssWithin += (v - gMean) ** 2 })
  })

  const dfBetween = k - 1
  const dfWithin = N - k
  const msBetween = dfBetween > 0 ? ssBetween / dfBetween : 0
  const msWithin = dfWithin > 0 ? ssWithin / dfWithin : 0
  const fStatistic = msWithin > 0 ? msBetween / msWithin : 0

  // p-value approximation for F-distribution
  const x = dfWithin / (dfWithin + dfBetween * fStatistic + 1e-15)
  const pValue = fStatistic > 0 ? Math.pow(x, dfWithin / 2) : 1

  const etaSquared = (ssBetween + ssWithin) > 0 ? ssBetween / (ssBetween + ssWithin) : 0

  const groupStats = validGroups.map(g => {
    const m = g.values.reduce((a, b) => a + b, 0) / g.values.length
    const v = g.values.reduce((s, x) => s + (x - m) ** 2, 0) / g.values.length
    return { name: g.name, n: g.values.length, mean: m, stdDev: Math.sqrt(v) }
  })

  return { fStatistic, pValue: Math.min(1, Math.max(0, pValue)), dfBetween, dfWithin, ssBetween, ssWithin, msBetween, msWithin, etaSquared, groups: groupStats }
}

// ── Moran's I (Spatial Autocorrelation) ─────────────────
export interface MoranResult {
  moranI: number
  expected: number
  variance: number
  zScore: number
  pValue: number
  interpretation: 'clustered' | 'dispersed' | 'random'
}

export function moranI(values: number[], coords: { lat: number; lng: number }[]): MoranResult {
  const n = values.length
  if (n < 4) return { moranI: 0, expected: 0, variance: 0, zScore: 0, pValue: 1, interpretation: 'random' }

  const mean = values.reduce((a, b) => a + b, 0) / n
  const deviations = values.map(v => v - mean)

  // Build inverse-distance weight matrix
  const dist = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
    const dlat = a.lat - b.lat
    const dlng = a.lng - b.lng
    return Math.sqrt(dlat * dlat + dlng * dlng) || 0.001
  }

  // Use k-nearest neighbors (k=5)
  const K = Math.min(5, n - 1)
  const weights: number[][] = Array.from({ length: n }, () => new Array(n).fill(0))
  let W = 0

  for (let i = 0; i < n; i++) {
    const distances = coords.map((c, j) => ({ j, d: dist(coords[i], c) }))
      .filter(x => x.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, K)

    distances.forEach(({ j }) => {
      weights[i][j] = 1
      W += 1
    })
  }

  // Compute Moran's I
  let numerator = 0
  let denominator = 0
  for (let i = 0; i < n; i++) {
    denominator += deviations[i] ** 2
    for (let j = 0; j < n; j++) {
      numerator += weights[i][j] * deviations[i] * deviations[j]
    }
  }

  const moranIval = denominator > 0 ? (n / W) * (numerator / denominator) : 0
  const expected = -1 / (n - 1)

  // Variance under normality assumption
  let S1 = 0, S2 = 0
  for (let i = 0; i < n; i++) {
    let rowSum = 0, colSum = 0
    for (let j = 0; j < n; j++) {
      S1 += (weights[i][j] + weights[j][i]) ** 2
      rowSum += weights[i][j]
      colSum += weights[j][i]
    }
    S2 += (rowSum + colSum) ** 2
  }
  S1 /= 2

  const varianceI = (n * ((n * n - 3 * n + 3) * S1 - n * S2 + 3 * W * W) -
    (n * n - n) * ((n * n - n - 2) * S1 - 2 * n * S2 + 6 * W * W) /
    (denominator * denominator / (deviations.reduce((s, d) => s + d ** 4, 0) * n / denominator ** 2 || 1))) /
    ((n - 1) * (n - 2) * (n - 3) * W * W) - expected ** 2

  const vI = Math.abs(varianceI) > 0 ? varianceI : 0.01
  const zScore = (moranIval - expected) / Math.sqrt(Math.abs(vI))
  const pValue = 2 * (1 - 0.5 * (1 + Math.sign(zScore) * Math.sqrt(1 - Math.exp(-2 / Math.PI * zScore * zScore))))

  let interpretation: 'clustered' | 'dispersed' | 'random' = 'random'
  if (Math.abs(zScore) > 1.96) {
    interpretation = moranIval > expected ? 'clustered' : 'dispersed'
  }

  return { moranI: moranIval, expected, variance: vI, zScore, pValue: Math.min(1, Math.max(0, pValue)), interpretation }
}

// ── Getis-Ord G* (Hot/Cold Spots) ───────────────────────
export interface HotspotResult {
  country: string
  geoName: string
  value: number
  zScore: number
  pValue: number
  type: 'hot' | 'cold' | 'neutral'
}

export function getisOrdGStar(
  data: { geoName: string; value: number; lat: number; lng: number }[],
): HotspotResult[] {
  const n = data.length
  if (n < 4) return data.map(d => ({ country: d.geoName, geoName: d.geoName, value: d.value, zScore: 0, pValue: 1, type: 'neutral' as const }))

  const mean = data.reduce((s, d) => s + d.value, 0) / n
  const S = Math.sqrt(data.reduce((s, d) => s + d.value ** 2, 0) / n - mean ** 2)

  const dist = (a: typeof data[0], b: typeof data[0]) => {
    const dlat = a.lat - b.lat
    const dlng = a.lng - b.lng
    return Math.sqrt(dlat * dlat + dlng * dlng) || 0.001
  }

  // Bandwidth: median distance
  const allDists: number[] = []
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      allDists.push(dist(data[i], data[j]))
  allDists.sort((a, b) => a - b)
  const bandwidth = allDists[Math.floor(allDists.length / 2)] || 1

  return data.map((di, i) => {
    let sumWX = 0, sumW = 0, sumW2 = 0
    for (let j = 0; j < n; j++) {
      const d = dist(di, data[j])
      const w = Math.exp(-(d * d) / (2 * bandwidth * bandwidth))
      sumWX += w * data[j].value
      sumW += w
      sumW2 += w * w
    }
    const numerator = sumWX - mean * sumW
    const denominator = S * Math.sqrt((n * sumW2 - sumW * sumW) / (n - 1))
    const z = denominator > 0 ? numerator / denominator : 0
    const p = 2 * (1 - 0.5 * (1 + Math.sign(z) * Math.sqrt(1 - Math.exp(-2 / Math.PI * z * z))))

    let type: 'hot' | 'cold' | 'neutral' = 'neutral'
    if (z > 1.96) type = 'hot'
    else if (z < -1.96) type = 'cold'

    return { country: di.geoName, geoName: di.geoName, value: di.value, zScore: z, pValue: Math.min(1, Math.max(0, p)), type }
  })
}
