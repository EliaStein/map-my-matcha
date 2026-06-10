// Attribute filtering happens client-side: combining multiple boolean
// where() clauses with the rating sort would need a composite index per
// filter combination, and the catalog is small enough to filter in JS.

export function applyCafeFilters(cafes, filters = {}) {
  return cafes.filter(cafe => {
    if (filters.isOrganic && !cafe.isOrganic) return false
    if (filters.isCeremonial && !cafe.isCeremonial) return false
    if (filters.hasWifi && !cafe.hasWifi) return false
    if (filters.hasNonDairyMilk && !cafe.hasNonDairyMilk) return false
    if (filters.maxPrice && cafe.priceLevel > filters.maxPrice) return false
    return true
  })
}
