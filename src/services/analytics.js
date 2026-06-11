import { logEvent } from 'firebase/analytics'
import { analytics } from '../config/firebase'

// No-ops outside production builds (analytics stays null there), so
// callers never need to guard.
export function track(eventName, params = {}) {
  if (!analytics) return
  try {
    logEvent(analytics, eventName, params)
  } catch (error) {
    console.error('Analytics error:', error)
  }
}

// GA4 only auto-counts the initial page load; SPA route changes have to
// be reported manually.
export function trackPageView(path) {
  track('page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title
  })
}
