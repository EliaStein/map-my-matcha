/**
 * Seed verified matcha cafes from Google Places API.
 *
 * Usage:
 *   node scripts/seedFromPlaces.mjs          # seed only (no clear)
 *   node scripts/seedFromPlaces.mjs --clear  # clear existing stubs first, then seed
 *
 * --clear requires the updated firestore.rules to be deployed first:
 *   firebase login --reauth && firebase deploy --only firestore:rules
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc, addDoc } from 'firebase/firestore'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Parse .env.local
const envContent = readFileSync(resolve(__dirname, '../.env.local'), 'utf-8')
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(l => l.trim() && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)

const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
})
const db = getFirestore(app)
const PLACES_KEY = env.VITE_GOOGLE_MAPS_API_KEY

const CITIES = [
  // Original 10
  { name: 'San Francisco', state: 'CA', lat: 37.7749, lng: -122.4194 },
  { name: 'Seattle',        state: 'WA', lat: 47.6062, lng: -122.3321 },
  { name: 'Portland',       state: 'OR', lat: 45.5051, lng: -122.6750 },
  { name: 'Denver',         state: 'CO', lat: 39.7392, lng: -104.9903 },
  { name: 'Atlanta',        state: 'GA', lat: 33.7490, lng: -84.3880  },
  { name: 'Houston',        state: 'TX', lat: 29.7604, lng: -95.3698  },
  { name: 'Phoenix',        state: 'AZ', lat: 33.4484, lng: -112.0740 },
  { name: 'Washington',     state: 'DC', lat: 38.9072, lng: -77.0369  },
  { name: 'Nashville',      state: 'TN', lat: 36.1627, lng: -86.7816  },
  { name: 'Brooklyn',       state: 'NY', lat: 40.6782, lng: -73.9442  },
  // New cities
  { name: 'Honolulu',       state: 'HI', lat: 21.3069, lng: -157.8583 },
  { name: 'Oakland',        state: 'CA', lat: 37.8044, lng: -122.2712 },
  { name: 'Austin',         state: 'TX', lat: 30.2672, lng: -97.7431  },
  { name: 'Miami',          state: 'FL', lat: 25.7617, lng: -80.1918  },
  { name: 'Las Vegas',      state: 'NV', lat: 36.1699, lng: -115.1398 },
  { name: 'Flushing',       state: 'NY', lat: 40.7675, lng: -73.8330  },
  { name: 'Jersey City',    state: 'NJ', lat: 40.7178, lng: -74.0431  },
  { name: 'New Orleans',    state: 'LA', lat: 29.9511, lng: -90.0715  },
  { name: 'Charlotte',      state: 'NC', lat: 35.2271, lng: -80.8431  },
  { name: 'Pittsburgh',     state: 'PA', lat: 40.4406, lng: -79.9959  },
  { name: 'Minneapolis',    state: 'MN', lat: 44.9778, lng: -93.2650  },
  { name: 'Salt Lake City', state: 'UT', lat: 40.7608, lng: -111.8910 },
  { name: 'Sacramento',     state: 'CA', lat: 38.5816, lng: -121.4944 },
  { name: 'Columbus',       state: 'OH', lat: 39.9612, lng: -82.9988  },
  { name: 'Raleigh',        state: 'NC', lat: 35.7796, lng: -78.6382  },
  { name: 'Philadelphia',   state: 'PA', lat: 39.9526, lng: -75.1652  },
  { name: 'Chicago',        state: 'IL', lat: 41.8781, lng: -87.6298  },
  { name: 'Los Angeles',    state: 'CA', lat: 34.0522, lng: -118.2437 },
  { name: 'New York',       state: 'NY', lat: 40.7580, lng: -73.9855  },
]

const MIN_RATING = 4.0
const MIN_REVIEWS = 20
const TOP_PERCENT = 0.25

async function fetchPage(lat, lng, pageToken) {
  const params = new URLSearchParams({ query: 'matcha', location: `${lat},${lng}`, radius: 10000, key: PLACES_KEY })
  if (pageToken) params.set('pagetoken', pageToken)
  const res = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`)
  return res.json()
}

async function fetchAllForCity(city) {
  const results = []
  let pageToken = null
  do {
    const data = await fetchPage(city.lat, city.lng, pageToken)
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.warn(`  Places API error: ${data.status} — ${data.error_message || ''}`)
      break
    }
    results.push(...(data.results || []))
    pageToken = data.next_page_token || null
    if (pageToken) await new Promise(r => setTimeout(r, 2500))
  } while (pageToken && results.length < 60)
  return results
}

function toStub(place, city) {
  return {
    name: place.name,
    address: place.formatted_address,
    location: { lat: place.geometry.location.lat, lng: place.geometry.location.lng },
    coverImage: null,
    images: [],
    isOrganic: false,
    isCeremonial: false,
    hasWhisk: false,
    hasNonDairyMilk: false,
    hasWifi: false,
    priceLevel: place.price_level ?? 2,
    tags: [],
    searchTerms: [place.name.toLowerCase(), city.name.toLowerCase(), city.state.toLowerCase()],
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    isStub: true,
    description: '',
    googlePlaceId: place.place_id,
    googleRating: place.rating ?? null,
    googleRatingCount: place.user_ratings_total ?? 0,
  }
}

async function clearStubs() {
  console.log('\nClearing existing stub cafes...')
  const q = query(collection(db, 'cafes'), where('isStub', '==', true))
  const snap = await getDocs(q)
  for (const d of snap.docs) await deleteDoc(doc(db, 'cafes', d.id))
  console.log(`  Cleared ${snap.size} stubs.`)
}

async function main() {
  const shouldClear = process.argv.includes('--clear')
  console.log('=== Seeding verified matcha cafes from Google Places ===')
  console.log(`  Min rating: ${MIN_RATING}★  |  Min reviews: ${MIN_REVIEWS}  |  Top: ${TOP_PERCENT * 100}%`)

  if (shouldClear) {
    await clearStubs()
  } else {
    console.log('\n(Skipping clear — run with --clear to remove old stubs first)')
  }

  let totalSeeded = 0

  for (const city of CITIES) {
    console.log(`\n${city.name}...`)
    const raw = await fetchAllForCity(city)
    console.log(`  ${raw.length} raw results`)

    const qualified = raw
      .filter(p => (p.rating ?? 0) >= MIN_RATING && (p.user_ratings_total ?? 0) >= MIN_REVIEWS)
      .sort((a, b) => (b.rating - a.rating) || ((b.user_ratings_total ?? 0) - (a.user_ratings_total ?? 0)))

    const take = Math.max(1, Math.ceil(qualified.length * TOP_PERCENT))
    const top = qualified.slice(0, take)
    console.log(`  ${qualified.length} qualified → seeding top ${take}`)

    for (const place of top) {
      await addDoc(collection(db, 'cafes'), toStub(place, city))
      console.log(`    + ${place.name} (${place.rating}★, ${place.user_ratings_total} reviews)`)
      totalSeeded++
    }

    if (top.length === 0) {
      console.log('    (no qualifying places found)')
    }
  }

  console.log(`\n=== Done. Seeded ${totalSeeded} verified matcha places. ===`)
  process.exit(0)
}

main().catch(err => { console.error(err); process.exit(1) })
