import { describe, it, expect } from 'vitest'
import { addRatingToStats, removeRatingFromStats } from './rating'

describe('addRatingToStats', () => {
  it('handles the first review on a fresh cafe', () => {
    const stats = addRatingToStats({}, 4)
    expect(stats.averageRating).toBe(4)
    expect(stats.totalReviews).toBe(1)
    expect(stats.ratingDistribution[4]).toBe(1)
  })

  it('recomputes the average from existing stats', () => {
    const cafe = { averageRating: 4, totalReviews: 2, ratingDistribution: { 4: 2 } }
    const stats = addRatingToStats(cafe, 1)
    expect(stats.averageRating).toBe(3) // (8 + 1) / 3
    expect(stats.totalReviews).toBe(3)
    expect(stats.ratingDistribution[1]).toBe(1)
    expect(stats.ratingDistribution[4]).toBe(2)
  })

  it('rounds to one decimal place', () => {
    const cafe = { averageRating: 5, totalReviews: 2 }
    const stats = addRatingToStats(cafe, 4)
    expect(stats.averageRating).toBe(4.7)
  })

  it('does not mutate the input distribution', () => {
    const distribution = { 5: 1 }
    addRatingToStats({ ratingDistribution: distribution }, 5)
    expect(distribution[5]).toBe(1)
  })
})

describe('removeRatingFromStats', () => {
  it('reverses an add', () => {
    const cafe = { averageRating: 0, totalReviews: 0, ratingDistribution: {} }
    const added = addRatingToStats(cafe, 3)
    const removed = removeRatingFromStats({ ...cafe, ...added }, 3)
    expect(removed.averageRating).toBe(0)
    expect(removed.totalReviews).toBe(0)
    expect(removed.ratingDistribution[3]).toBe(0)
  })

  it('recomputes the average for remaining reviews', () => {
    const cafe = { averageRating: 3, totalReviews: 3, ratingDistribution: { 1: 1, 4: 2 } }
    const stats = removeRatingFromStats(cafe, 1)
    expect(stats.averageRating).toBe(4) // (9 - 1) / 2
    expect(stats.totalReviews).toBe(2)
    expect(stats.ratingDistribution[1]).toBe(0)
  })

  it('never goes below zero', () => {
    const stats = removeRatingFromStats({}, 5)
    expect(stats.totalReviews).toBe(0)
    expect(stats.averageRating).toBe(0)
    expect(stats.ratingDistribution[5]).toBe(0)
  })
})
