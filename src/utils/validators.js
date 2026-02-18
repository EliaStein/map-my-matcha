export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPassword(password) {
  return password && password.length >= 6
}

export function isValidDisplayName(name) {
  return name && name.trim().length >= 2 && name.trim().length <= 50
}

export function validateReview(review) {
  const errors = {}

  if (!review.rating || review.rating < 1 || review.rating > 5) {
    errors.rating = 'Please select a rating between 1 and 5'
  }

  if (review.text && review.text.length > 1000) {
    errors.text = 'Review text must be less than 1000 characters'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}
