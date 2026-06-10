import { describe, it, expect } from 'vitest'
import { applyCafeFilters } from './cafeFilters'

const cafes = [
  { id: 'a', isOrganic: true, isCeremonial: false, hasWifi: true, hasNonDairyMilk: true, priceLevel: 2 },
  { id: 'b', isOrganic: false, isCeremonial: true, hasWifi: false, hasNonDairyMilk: true, priceLevel: 3 },
  { id: 'c', isOrganic: true, isCeremonial: true, hasWifi: true, hasNonDairyMilk: false, priceLevel: 1 }
]

describe('applyCafeFilters', () => {
  it('returns everything with no filters', () => {
    expect(applyCafeFilters(cafes)).toHaveLength(3)
  })

  it('filters by a single boolean attribute', () => {
    const result = applyCafeFilters(cafes, { isOrganic: true })
    expect(result.map(c => c.id)).toEqual(['a', 'c'])
  })

  it('combines multiple filters', () => {
    const result = applyCafeFilters(cafes, { isOrganic: true, hasNonDairyMilk: true })
    expect(result.map(c => c.id)).toEqual(['a'])
  })

  it('filters by max price', () => {
    const result = applyCafeFilters(cafes, { maxPrice: 2 })
    expect(result.map(c => c.id)).toEqual(['a', 'c'])
  })

  it('ignores falsy filter values', () => {
    const result = applyCafeFilters(cafes, { isOrganic: false, hasWifi: undefined })
    expect(result).toHaveLength(3)
  })
})
