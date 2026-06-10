import { describe, it, expect } from 'vitest'
import { isValidEmail, isValidPassword, isValidDisplayName, validateReview } from './validators'

describe('isValidEmail', () => {
  it('accepts a normal address', () => {
    expect(isValidEmail('matcha@example.com')).toBe(true)
  })

  it('rejects missing domain or spaces', () => {
    expect(isValidEmail('matcha@')).toBe(false)
    expect(isValidEmail('ma tcha@example.com')).toBe(false)
  })
})

describe('isValidPassword', () => {
  it('requires at least 6 characters', () => {
    expect(isValidPassword('12345')).toBeFalsy()
    expect(isValidPassword('123456')).toBe(true)
  })
})

describe('isValidDisplayName', () => {
  it('requires 2-50 trimmed characters', () => {
    expect(isValidDisplayName(' a ')).toBeFalsy()
    expect(isValidDisplayName('El')).toBe(true)
    expect(isValidDisplayName('x'.repeat(51))).toBe(false)
  })
})

describe('validateReview', () => {
  it('requires a rating between 1 and 5', () => {
    expect(validateReview({ rating: 0 }).isValid).toBe(false)
    expect(validateReview({ rating: 6 }).isValid).toBe(false)
    expect(validateReview({ rating: 5 }).isValid).toBe(true)
  })

  it('caps review text at 1000 characters', () => {
    expect(validateReview({ rating: 4, text: 'x'.repeat(1001) }).isValid).toBe(false)
    expect(validateReview({ rating: 4, text: 'great' }).isValid).toBe(true)
  })
})
