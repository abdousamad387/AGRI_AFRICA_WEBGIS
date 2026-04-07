/** Maps French data country names → GeoJSON feature NAME */
export const frToGeo: Record<string, string> = {
  'Algérie': 'Algeria', 'Angola': 'Angola', 'Bénin': 'Benin', 'Botswana': 'Botswana',
  'Burkina Faso': 'Burkina Faso', 'Burundi': 'Burundi', "Côte d'Ivoire": "Côte d'Ivoire",
  'Cabo Verde': 'Cabo Verde', 'Cameroun': 'Cameroon', 'Centrafrique': 'Central African Rep.',
  'Comores': 'Comoros', 'Congo': 'Congo', 'Djibouti': 'Djibouti', 'Égypte': 'Egypt',
  'Érythrée': 'Eritrea', 'Éthiopie': 'Ethiopia', 'Gabon': 'Gabon', 'Gambie': 'Gambia',
  'Ghana': 'Ghana', 'Guinée': 'Guinea', 'Guinée-Bissau': 'Guinea-Bissau', 'Kenya': 'Kenya',
  'Lesotho': 'Lesotho', 'Libéria': 'Liberia', 'Libye': 'Libya', 'Madagascar': 'Madagascar',
  'Malawi': 'Malawi', 'Mali': 'Mali', 'Maroc': 'Morocco', 'Maurice': 'Mauritius',
  'Mauritanie': 'Mauritania', 'Mozambique': 'Mozambique', 'Namibie': 'Namibia',
  'Niger': 'Niger', 'Nigeria': 'Nigeria', 'Ouganda': 'Uganda', 'RD Congo': 'Dem. Rep. Congo',
  'Rwanda': 'Rwanda', 'Sénégal': 'Senegal', 'Seychelles': 'Seychelles',
  'Sierra Leone': 'Sierra Leone', 'Somalie': 'Somalia', 'Soudan': 'Sudan',
  'Soudan du Sud': 'S. Sudan', 'Afrique du Sud': 'South Africa', 'Tanzanie': 'Tanzania',
  'Tchad': 'Chad', 'Togo': 'Togo', 'Tunisie': 'Tunisia', 'Zambie': 'Zambia',
  'Zimbabwe': 'Zimbabwe', 'eSwatini': 'eSwatini', 'Guinée équatoriale': 'Eq. Guinea',
  'São Tomé-et-Príncipe': 'São Tomé and Príncipe',
}

/** Reverse mapping: GeoJSON NAME → French data name */
export const geoToFr: Record<string, string> = {}
Object.entries(frToGeo).forEach(([fr, en]) => { geoToFr[en] = fr })

/** Get display name based on lang */
export function displayName(geoName: string, lang: 'en' | 'fr'): string {
  if (lang === 'fr') return geoToFr[geoName] || geoName
  return geoName
}
