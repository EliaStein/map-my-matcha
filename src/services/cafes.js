import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  addDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { applyCafeFilters } from '../utils/cafeFilters'

const CAFES_COLLECTION = 'cafes'
const DEFAULT_PAGE_SIZE = 24
const MAX_FETCH = 200

export async function addCafe(cafeData) {
  try {
    const cafe = {
      ...cafeData,
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      searchTerms: [
        cafeData.name.toLowerCase(),
        ...(cafeData.tags || []).map(t => t.toLowerCase())
      ],
      createdAt: serverTimestamp()
    }

    const docRef = await addDoc(collection(db, CAFES_COLLECTION), cafe)
    return { id: docRef.id, ...cafe }
  } catch (error) {
    console.error('Error adding cafe:', error)
    throw error
  }
}

// Attribute filters are applied client-side (see utils/cafeFilters.js):
// combining server-side where() clauses with the rating sort would need a
// composite index per filter combination.
export async function getCafes(filters = {}) {
  try {
    const q = query(
      collection(db, CAFES_COLLECTION),
      orderBy('averageRating', 'desc'),
      limit(filters.limit || MAX_FETCH)
    )
    const snapshot = await getDocs(q)

    const cafes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return applyCafeFilters(cafes, filters)
  } catch (error) {
    console.error('Error fetching cafes:', error)
    throw error
  }
}

// Cursor-paginated variant. `cursor` is the snapshot returned by the
// previous call; filters are applied client-side, so a page can come back
// shorter than pageSize while hasMore is still true.
export async function getCafesPage({ filters = {}, pageSize = DEFAULT_PAGE_SIZE, cursor = null } = {}) {
  try {
    const constraints = [orderBy('averageRating', 'desc')]
    if (cursor) {
      constraints.push(startAfter(cursor))
    }
    constraints.push(limit(pageSize))

    const snapshot = await getDocs(query(collection(db, CAFES_COLLECTION), ...constraints))
    const docs = snapshot.docs

    return {
      cafes: applyCafeFilters(docs.map(d => ({ id: d.id, ...d.data() })), filters),
      cursor: docs.length > 0 ? docs[docs.length - 1] : null,
      hasMore: docs.length === pageSize
    }
  } catch (error) {
    console.error('Error fetching cafes page:', error)
    throw error
  }
}

export async function getCafeById(cafeId) {
  try {
    const docRef = doc(db, CAFES_COLLECTION, cafeId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    return {
      id: docSnap.id,
      ...docSnap.data()
    }
  } catch (error) {
    console.error('Error fetching cafe:', error)
    throw error
  }
}

export async function searchCafes(searchTerm) {
  try {
    const cafes = await getCafes()
    const term = searchTerm.toLowerCase()

    return cafes.filter(cafe => {
      const nameMatch = cafe.name?.toLowerCase().includes(term)
      const addressMatch = cafe.address?.toLowerCase().includes(term)
      const tagsMatch = cafe.tags?.some(tag => tag.toLowerCase().includes(term))
      const searchTermsMatch = cafe.searchTerms?.some(t => t.includes(term))

      return nameMatch || addressMatch || tagsMatch || searchTermsMatch
    })
  } catch (error) {
    console.error('Error searching cafes:', error)
    throw error
  }
}

// Clear all cafes from the database
export async function clearAllCafes() {
  try {
    const cafesRef = collection(db, CAFES_COLLECTION)
    const snapshot = await getDocs(cafesRef)

    let count = 0
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, CAFES_COLLECTION, docSnap.id))
      count++
      console.log(`Deleted ${count}/${snapshot.docs.length}`)
    }

    console.log('All cafes cleared!')
    return { success: true, count }
  } catch (error) {
    console.error('Error clearing cafes:', error)
    throw error
  }
}

// Stable Unsplash images - verified working IDs for cafe/tea content
const MATCHA_IMAGES = [
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&fit=crop', // coffee cup overhead
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&fit=crop', // coffee shop cup
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&fit=crop', // latte art
  'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&fit=crop', // tea cup
  'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=800&fit=crop', // green tea
  'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&fit=crop', // coffee beans and cup
  'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=800&fit=crop', // tea pot
  'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=800&fit=crop', // coffee art
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&fit=crop', // cappuccino
  'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&fit=crop', // cafe interior
  'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800&fit=crop', // coffee shop
  'https://images.unsplash.com/photo-1493925410384-84f842e616fb?w=800&fit=crop', // warm drink
]

const getImg = (i) => MATCHA_IMAGES[i % MATCHA_IMAGES.length]

// Seed data function - real matcha cafes (60+ locations)
export async function seedSampleCafes() {
  const realCafes = [
    // ============ NEW YORK CITY (12 cafes) ============
    {
      name: 'Cha Cha Matcha',
      description: 'Trendy matcha cafe known for its vibrant pink aesthetic and Instagram-worthy drinks. High-quality Japanese matcha with creative flavor combinations.',
      address: '373 Broome St, New York, NY 10013',
      location: { lat: 40.7211, lng: -73.9965 },
      coverImage: getImg(0),
      images: [],
      isOrganic: false,
      isCeremonial: true,
      hasWhisk: true,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 3,
      tags: ['trendy', 'instagram', 'creative lattes', 'nolita'],
      searchTerms: ['cha cha matcha', 'nolita', 'nyc', 'instagram', 'pink'],
      averageRating: 4.5,
      totalReviews: 1842,
      ratingDistribution: { 1: 52, 2: 78, 3: 156, 4: 489, 5: 1067 }
    },
    {
      name: 'Matchaful',
      description: 'Farm-to-cup matcha experience featuring single-origin, ceremonial-grade matcha sourced directly from Kagoshima, Japan.',
      address: '159 Bleecker St, New York, NY 10012',
      location: { lat: 40.7287, lng: -74.0003 },
      coverImage: getImg(1),
      images: [],
      isOrganic: true,
      isCeremonial: true,
      hasWhisk: true,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 3,
      tags: ['ceremonial', 'organic', 'single-origin', 'greenwich village'],
      searchTerms: ['matchaful', 'bleecker', 'ceremonial', 'kagoshima'],
      averageRating: 4.7,
      totalReviews: 956,
      ratingDistribution: { 1: 19, 2: 28, 3: 67, 4: 234, 5: 608 }
    },
    {
      name: 'Té Company',
      description: 'Elegant Taiwanese tea house offering premium matcha alongside oolong and other fine teas. Minimalist space perfect for quiet contemplation.',
      address: '163 W 10th St, New York, NY 10014',
      location: { lat: 40.7345, lng: -74.0024 },
      coverImage: getImg(2),
      images: [],
      isOrganic: true,
      isCeremonial: true,
      hasWhisk: true,
      hasNonDairyMilk: false,
      hasWifi: false,
      priceLevel: 4,
      tags: ['traditional', 'tea house', 'minimalist', 'west village'],
      searchTerms: ['te company', 'west village', 'tea house'],
      averageRating: 4.8,
      totalReviews: 423,
      ratingDistribution: { 1: 4, 2: 8, 3: 25, 4: 89, 5: 297 }
    },
    {
      name: 'Kettl',
      description: 'Japanese tea specialists importing directly from small farms. Their matcha flights let you taste different regional varieties side by side.',
      address: '73 Elizabeth St, New York, NY 10013',
      location: { lat: 40.7188, lng: -73.9957 },
      coverImage: getImg(3),
      images: [],
      isOrganic: true,
      isCeremonial: true,
      hasWhisk: true,
      hasNonDairyMilk: true,
      hasWifi: false,
      priceLevel: 4,
      tags: ['premium', 'tea flights', 'nolita', 'japanese imports'],
      searchTerms: ['kettl', 'elizabeth', 'nolita', 'tea flights'],
      averageRating: 4.9,
      totalReviews: 312,
      ratingDistribution: { 1: 3, 2: 5, 3: 15, 4: 67, 5: 222 }
    },
    {
      name: 'Ippodo Tea',
      description: 'Kyoto tea institution with 300+ years of history. Their NYC outpost serves the same ceremonial matcha found in their Japanese locations.',
      address: '125 E 39th St, New York, NY 10016',
      location: { lat: 40.7489, lng: -73.9785 },
      coverImage: getImg(4),
      images: [],
      isOrganic: true,
      isCeremonial: true,
      hasWhisk: true,
      hasNonDairyMilk: false,
      hasWifi: true,
      priceLevel: 4,
      tags: ['kyoto', 'traditional', 'midtown', 'historic'],
      searchTerms: ['ippodo', 'kyoto', 'midtown', 'traditional'],
      averageRating: 4.8,
      totalReviews: 678,
      ratingDistribution: { 1: 8, 2: 14, 3: 41, 4: 156, 5: 459 }
    },
    {
      name: 'Bibble & Sip',
      description: 'Cozy cafe known for cream puffs and excellent matcha lattes. Their matcha is smooth and perfectly balanced with house-made syrups.',
      address: '253 W 51st St, New York, NY 10019',
      location: { lat: 40.7627, lng: -73.9857 },
      coverImage: getImg(5),
      images: [],
      isOrganic: false,
      isCeremonial: false,
      hasWhisk: false,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 2,
      tags: ['pastries', 'cozy', 'midtown west', 'cream puffs'],
      searchTerms: ['bibble sip', 'midtown', 'cream puffs', 'matcha latte'],
      averageRating: 4.4,
      totalReviews: 2341,
      ratingDistribution: { 1: 70, 2: 94, 3: 210, 4: 702, 5: 1265 }
    },
    {
      name: 'Chalait',
      description: 'Neighborhood matcha cafe with multiple NYC locations. Known for consistent quality and their signature matcha latte with house oat milk.',
      address: '224 W 4th St, New York, NY 10014',
      location: { lat: 40.7328, lng: -74.0012 },
      coverImage: getImg(6),
      images: [],
      isOrganic: false,
      isCeremonial: true,
      hasWhisk: true,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 3,
      tags: ['neighborhood', 'west village', 'oat milk', 'consistent'],
      searchTerms: ['chalait', 'west village', 'matcha latte'],
      averageRating: 4.5,
      totalReviews: 1567,
      ratingDistribution: { 1: 39, 2: 63, 3: 141, 4: 438, 5: 886 }
    },
    {
      name: 'Matchabar',
      description: 'Brooklyn-born matcha brand with a sleek Manhattan location. Their matcha is ethically sourced from family farms in Japan.',
      address: '93 Wythe Ave, Brooklyn, NY 11249',
      location: { lat: 40.7214, lng: -73.9575 },
      coverImage: getImg(7),
      images: [],
      isOrganic: true,
      isCeremonial: true,
      hasWhisk: true,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 3,
      tags: ['brooklyn', 'williamsburg', 'ethically sourced', 'modern'],
      searchTerms: ['matchabar', 'williamsburg', 'brooklyn', 'wythe'],
      averageRating: 4.6,
      totalReviews: 1123,
      ratingDistribution: { 1: 22, 2: 34, 3: 90, 4: 337, 5: 640 }
    },
    {
      name: 'Setsugekka',
      description: 'Traditional Japanese cafe in the East Village serving authentic usucha and koicha. Intimate space with tatami seating available.',
      address: '77 E 7th St, New York, NY 10003',
      location: { lat: 40.7282, lng: -73.9862 },
      coverImage: getImg(0),
      images: [],
      isOrganic: true,
      isCeremonial: true,
      hasWhisk: true,
      hasNonDairyMilk: false,
      hasWifi: false,
      priceLevel: 3,
      tags: ['traditional', 'east village', 'tatami', 'authentic'],
      searchTerms: ['setsugekka', 'east village', 'traditional', 'tatami'],
      averageRating: 4.7,
      totalReviews: 389,
      ratingDistribution: { 1: 8, 2: 12, 3: 31, 4: 97, 5: 241 }
    },
    {
      name: 'Nine One Seven',
      description: 'Trendy Lower East Side spot known for creative matcha drinks including their famous black sesame matcha and ube matcha.',
      address: '63 Canal St, New York, NY 10002',
      location: { lat: 40.7163, lng: -73.9936 },
      coverImage: getImg(1),
      images: [],
      isOrganic: false,
      isCeremonial: false,
      hasWhisk: false,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 2,
      tags: ['creative', 'les', 'trendy', 'fusion'],
      searchTerms: ['nine one seven', 'canal', 'les', 'creative matcha'],
      averageRating: 4.3,
      totalReviews: 876,
      ratingDistribution: { 1: 35, 2: 52, 3: 96, 4: 280, 5: 413 }
    },
    {
      name: 'Supermoon Bakehouse',
      description: 'Famous for croissants but their matcha latte is a hidden gem. Uses quality ceremonial grade matcha from Uji.',
      address: '120 Rivington St, New York, NY 10002',
      location: { lat: 40.7204, lng: -73.9874 },
      coverImage: getImg(2),
      images: [],
      isOrganic: false,
      isCeremonial: true,
      hasWhisk: false,
      hasNonDairyMilk: true,
      hasWifi: false,
      priceLevel: 3,
      tags: ['bakery', 'les', 'croissants', 'hidden gem'],
      searchTerms: ['supermoon', 'rivington', 'bakery', 'les'],
      averageRating: 4.5,
      totalReviews: 1890,
      ratingDistribution: { 1: 47, 2: 76, 3: 170, 4: 510, 5: 1087 }
    },
    {
      name: 'Hi-Collar',
      description: 'Japanese kissaten-style cafe in the East Village. Their matcha is prepared with precision and served with traditional wagashi.',
      address: '214 E 10th St, New York, NY 10003',
      location: { lat: 40.7291, lng: -73.9838 },
      coverImage: getImg(3),
      images: [],
      isOrganic: true,
      isCeremonial: true,
      hasWhisk: true,
      hasNonDairyMilk: false,
      hasWifi: false,
      priceLevel: 3,
      tags: ['kissaten', 'east village', 'wagashi', 'traditional'],
      searchTerms: ['hi-collar', 'east village', 'kissaten', 'wagashi'],
      averageRating: 4.6,
      totalReviews: 567,
      ratingDistribution: { 1: 11, 2: 17, 3: 45, 4: 159, 5: 335 }
    },

    // ============ LOS ANGELES (12 cafes) ============
    {
      name: 'Cha Cha Matcha LA',
      description: 'West Coast outpost of the popular NYC matcha bar. Bright, airy space with quality matcha drinks and signature pink vibes.',
      address: '8622 Melrose Ave, West Hollywood, CA 90069',
      location: { lat: 34.0826, lng: -118.3815 },
      coverImage: getImg(4),
      images: [],
      isOrganic: false,
      isCeremonial: true,
      hasWhisk: true,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 3,
      tags: ['trendy', 'instagram', 'west hollywood', 'melrose'],
      searchTerms: ['cha cha matcha', 'la', 'melrose', 'west hollywood'],
      averageRating: 4.4,
      totalReviews: 1256,
      ratingDistribution: { 1: 45, 2: 62, 3: 125, 4: 378, 5: 646 }
    },
    {
      name: 'Midori Matcha',
      description: 'Authentic Japanese matcha cafe in Little Tokyo. Uses stone-ground Uji matcha and traditional preparation methods.',
      address: '117 Japanese Village Plaza Mall, Los Angeles, CA 90012',
      location: { lat: 34.0498, lng: -118.2408 },
      coverImage: getImg(5),
      images: [],
      isOrganic: true,
      isCeremonial: true,
      hasWhisk: true,
      hasNonDairyMilk: true,
      hasWifi: false,
      priceLevel: 2,
      tags: ['traditional', 'uji', 'little tokyo', 'authentic'],
      searchTerms: ['midori matcha', 'little tokyo', 'uji', 'downtown la'],
      averageRating: 4.6,
      totalReviews: 789,
      ratingDistribution: { 1: 15, 2: 23, 3: 67, 4: 198, 5: 486 }
    },
    {
      name: 'Alfred Tea Room',
      description: 'Chic tea-focused cafe known for matcha lattes and beautiful blue-tiled interior. Great for laptop work.',
      address: '963 N La Cienega Blvd, West Hollywood, CA 90069',
      location: { lat: 34.0853, lng: -118.3779 },
      coverImage: getImg(6),
      images: [],
      isOrganic: false,
      isCeremonial: false,
      hasWhisk: false,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 3,
      tags: ['workspace', 'aesthetic', 'west hollywood', 'laptop friendly'],
      searchTerms: ['alfred tea', 'la cienega', 'west hollywood'],
      averageRating: 4.3,
      totalReviews: 2134,
      ratingDistribution: { 1: 89, 2: 112, 3: 234, 4: 623, 5: 1076 }
    },
    {
      name: 'Cha Cha Matcha Silver Lake',
      description: 'Laid-back Silver Lake location with outdoor seating. Same great matcha quality in a more neighborhood-friendly vibe.',
      address: '3615 Sunset Blvd, Los Angeles, CA 90026',
      location: { lat: 34.0876, lng: -118.2833 },
      coverImage: getImg(7),
      images: [],
      isOrganic: false,
      isCeremonial: true,
      hasWhisk: true,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 3,
      tags: ['silver lake', 'outdoor seating', 'neighborhood', 'sunset'],
      searchTerms: ['cha cha matcha', 'silver lake', 'sunset blvd'],
      averageRating: 4.5,
      totalReviews: 934,
      ratingDistribution: { 1: 28, 2: 37, 3: 84, 4: 280, 5: 505 }
    },
    {
      name: 'Matcha Cafe Maiko LA',
      description: 'Kyoto-based chain famous for matcha soft serve and parfaits. Their Uji matcha is imported directly from Japan.',
      address: '2130 Sawtelle Blvd #103, Los Angeles, CA 90025',
      location: { lat: 34.0367, lng: -118.4421 },
      coverImage: getImg(0),
      images: [],
      isOrganic: true,
      isCeremonial: true,
      hasWhisk: true,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 2,
      tags: ['soft serve', 'sawtelle', 'kyoto', 'parfaits'],
      searchTerms: ['matcha cafe maiko', 'sawtelle', 'soft serve', 'kyoto'],
      averageRating: 4.7,
      totalReviews: 1567,
      ratingDistribution: { 1: 31, 2: 47, 3: 125, 4: 423, 5: 941 }
    },
    {
      name: 'Cafe Dulce',
      description: 'Little Tokyo staple serving excellent matcha lattes alongside Japanese-inspired pastries. Local favorite for over a decade.',
      address: '134 Japanese Village Plaza Mall, Los Angeles, CA 90012',
      location: { lat: 34.0501, lng: -118.2405 },
      coverImage: getImg(1),
      images: [],
      isOrganic: false,
      isCeremonial: false,
      hasWhisk: false,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 2,
      tags: ['little tokyo', 'pastries', 'local favorite', 'casual'],
      searchTerms: ['cafe dulce', 'little tokyo', 'japanese village'],
      averageRating: 4.4,
      totalReviews: 2890,
      ratingDistribution: { 1: 87, 2: 116, 3: 289, 4: 867, 5: 1531 }
    },
    {
      name: 'Tea Master Matcha Cafe',
      description: 'Venice Beach matcha spot with ocean-inspired decor. Known for their thick koicha and creative seasonal drinks.',
      address: '1218 Abbot Kinney Blvd, Venice, CA 90291',
      location: { lat: 33.9923, lng: -118.4654 },
      coverImage: getImg(2),
      images: [],
      isOrganic: true,
      isCeremonial: true,
      hasWhisk: true,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 3,
      tags: ['venice', 'abbot kinney', 'beachy', 'koicha'],
      searchTerms: ['tea master', 'venice', 'abbot kinney', 'koicha'],
      averageRating: 4.5,
      totalReviews: 723,
      ratingDistribution: { 1: 18, 2: 29, 3: 65, 4: 203, 5: 408 }
    },
    {
      name: 'Urth Caffe',
      description: 'Organic cafe chain with excellent matcha offerings. Their ceremonial matcha latte is made with house-made organic oat milk.',
      address: '8565 Melrose Ave, West Hollywood, CA 90069',
      location: { lat: 34.0821, lng: -118.3795 },
      coverImage: getImg(3),
      images: [],
      isOrganic: true,
      isCeremonial: true,
      hasWhisk: false,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 3,
      tags: ['organic', 'melrose', 'chain', 'healthy'],
      searchTerms: ['urth caffe', 'melrose', 'organic', 'west hollywood'],
      averageRating: 4.3,
      totalReviews: 3456,
      ratingDistribution: { 1: 138, 2: 173, 3: 380, 4: 1003, 5: 1762 }
    },
    {
      name: 'Kumquat Coffee',
      description: 'Highland Park gem with a dedicated matcha menu. Sources from small Japanese farms and offers matcha tasting flights.',
      address: '5510 N Figueroa St, Los Angeles, CA 90042',
      location: { lat: 34.1098, lng: -118.1933 },
      coverImage: getImg(4),
      images: [],
      isOrganic: true,
      isCeremonial: true,
      hasWhisk: true,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 2,
      tags: ['highland park', 'tasting flights', 'small batch', 'cozy'],
      searchTerms: ['kumquat', 'highland park', 'figueroa', 'matcha flights'],
      averageRating: 4.7,
      totalReviews: 445,
      ratingDistribution: { 1: 9, 2: 13, 3: 36, 4: 120, 5: 267 }
    },
    {
      name: 'Sidecar Doughnuts',
      description: 'Famous doughnut shop with surprisingly excellent matcha. Their hoji-matcha latte is a local favorite.',
      address: '631 Wilshire Blvd, Santa Monica, CA 90401',
      location: { lat: 34.0188, lng: -118.4961 },
      coverImage: getImg(5),
      images: [],
      isOrganic: false,
      isCeremonial: false,
      hasWhisk: false,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 2,
      tags: ['santa monica', 'doughnuts', 'hoji-matcha', 'casual'],
      searchTerms: ['sidecar', 'santa monica', 'doughnuts', 'hoji matcha'],
      averageRating: 4.4,
      totalReviews: 1876,
      ratingDistribution: { 1: 56, 2: 75, 3: 188, 4: 563, 5: 994 }
    },
    {
      name: 'Wanderlust Creamery',
      description: 'Ice cream shop known for global flavors. Their matcha soft serve uses premium Uji matcha - rich and not too sweet.',
      address: '3134 Glendale Blvd, Los Angeles, CA 90039',
      location: { lat: 34.1168, lng: -118.2589 },
      coverImage: getImg(6),
      images: [],
      isOrganic: false,
      isCeremonial: true,
      hasWhisk: false,
      hasNonDairyMilk: true,
      hasWifi: false,
      priceLevel: 2,
      tags: ['atwater village', 'soft serve', 'ice cream', 'uji'],
      searchTerms: ['wanderlust', 'atwater', 'soft serve', 'ice cream'],
      averageRating: 4.6,
      totalReviews: 1234,
      ratingDistribution: { 1: 25, 2: 37, 3: 99, 4: 346, 5: 727 }
    },
    {
      name: 'Steep LA',
      description: 'Modern tea house in Echo Park specializing in ceremonial-grade matcha. Peaceful garden seating available.',
      address: '1906 Sunset Blvd, Los Angeles, CA 90026',
      location: { lat: 34.0778, lng: -118.2607 },
      coverImage: getImg(7),
      images: [],
      isOrganic: true,
      isCeremonial: true,
      hasWhisk: true,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 3,
      tags: ['echo park', 'tea house', 'garden', 'peaceful'],
      searchTerms: ['steep', 'echo park', 'tea house', 'garden'],
      averageRating: 4.6,
      totalReviews: 567,
      ratingDistribution: { 1: 11, 2: 17, 3: 51, 4: 159, 5: 329 }
    },

    // ============ PHILADELPHIA (10 cafes) ============
    {
      name: 'Double Knot',
      description: 'Upscale Japanese restaurant with an exceptional matcha program. Their ceremonial matcha is whisked tableside.',
      address: '120 S 13th St, Philadelphia, PA 19107',
      location: { lat: 39.9499, lng: -75.1618 },
      coverImage: getImg(0),
      images: [],
      isOrganic: true,
      isCeremonial: true,
      hasWhisk: true,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 4,
      tags: ['upscale', 'midtown village', 'tableside', 'japanese'],
      searchTerms: ['double knot', 'midtown village', 'japanese', 'upscale'],
      averageRating: 4.7,
      totalReviews: 823,
      ratingDistribution: { 1: 16, 2: 25, 3: 66, 4: 231, 5: 485 }
    },
    {
      name: 'Rival Bros Coffee',
      description: 'Third-wave coffee roaster with a surprisingly excellent matcha latte. Uses ceremonial-grade matcha from Uji.',
      address: '2400 Lombard St, Philadelphia, PA 19146',
      location: { lat: 39.9446, lng: -75.1803 },
      coverImage: getImg(1),
      images: [],
      isOrganic: false,
      isCeremonial: true,
      hasWhisk: false,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 2,
      tags: ['graduate hospital', 'coffee roaster', 'third wave', 'casual'],
      searchTerms: ['rival bros', 'lombard', 'graduate hospital', 'coffee'],
      averageRating: 4.5,
      totalReviews: 1234,
      ratingDistribution: { 1: 31, 2: 49, 3: 111, 4: 370, 5: 673 }
    },
    {
      name: 'Elixr Coffee',
      description: 'Award-winning coffee shop that takes their matcha equally seriously. Clean, minimalist space in Center City.',
      address: '207 S Sydenham St, Philadelphia, PA 19102',
      location: { lat: 39.9498, lng: -75.1662 },
      coverImage: getImg(2),
      images: [],
      isOrganic: true,
      isCeremonial: true,
      hasWhisk: true,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 3,
      tags: ['center city', 'minimalist', 'award-winning', 'specialty'],
      searchTerms: ['elixr', 'center city', 'sydenham', 'specialty'],
      averageRating: 4.6,
      totalReviews: 1567,
      ratingDistribution: { 1: 31, 2: 47, 3: 141, 4: 438, 5: 910 }
    },
    {
      name: 'Federal Donuts',
      description: 'Famous for fried chicken and donuts, but their matcha latte has a cult following. Quick, no-frills service.',
      address: '1632 Sansom St, Philadelphia, PA 19103',
      location: { lat: 39.9502, lng: -75.1680 },
      coverImage: getImg(3),
      images: [],
      isOrganic: false,
      isCeremonial: false,
      hasWhisk: false,
      hasNonDairyMilk: true,
      hasWifi: false,
      priceLevel: 1,
      tags: ['rittenhouse', 'quick', 'donuts', 'casual'],
      searchTerms: ['federal donuts', 'sansom', 'rittenhouse', 'donuts'],
      averageRating: 4.2,
      totalReviews: 2341,
      ratingDistribution: { 1: 93, 2: 117, 3: 281, 4: 702, 5: 1148 }
    },
    {
      name: 'Vernick Coffee Bar',
      description: 'From the team behind acclaimed Vernick Food & Drink. Their matcha latte uses high-grade Japanese matcha.',
      address: '268 S 20th St, Philadelphia, PA 19103',
      location: { lat: 39.9477, lng: -75.1746 },
      coverImage: getImg(4),
      images: [],
      isOrganic: false,
      isCeremonial: true,
      hasWhisk: false,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 3,
      tags: ['rittenhouse', 'upscale casual', 'pastries', 'chef-driven'],
      searchTerms: ['vernick', 'rittenhouse', 'coffee bar', '20th street'],
      averageRating: 4.5,
      totalReviews: 678,
      ratingDistribution: { 1: 17, 2: 27, 3: 61, 4: 190, 5: 383 }
    },
    {
      name: 'Menagerie Coffee',
      description: 'Old City coffee shop with a dedicated matcha menu. Cozy brick interior perfect for remote work.',
      address: '18 S 3rd St, Philadelphia, PA 19106',
      location: { lat: 39.9494, lng: -75.1459 },
      coverImage: getImg(5),
      images: [],
      isOrganic: true,
      isCeremonial: true,
      hasWhisk: true,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 2,
      tags: ['old city', 'cozy', 'brick walls', 'workspace'],
      searchTerms: ['menagerie', 'old city', '3rd street', 'cozy'],
      averageRating: 4.4,
      totalReviews: 892,
      ratingDistribution: { 1: 27, 2: 45, 3: 89, 4: 267, 5: 464 }
    },
    {
      name: 'Bluestone Lane Rittenhouse',
      description: 'Australian-style cafe with excellent matcha lattes. Bright, airy space with plenty of natural light.',
      address: '1 S 15th St, Philadelphia, PA 19102',
      location: { lat: 39.9518, lng: -75.1650 },
      coverImage: getImg(6),
      images: [],
      isOrganic: false,
      isCeremonial: false,
      hasWhisk: false,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 3,
      tags: ['australian', 'rittenhouse', 'bright', 'brunch'],
      searchTerms: ['bluestone lane', 'rittenhouse', 'australian', '15th street'],
      averageRating: 4.3,
      totalReviews: 1456,
      ratingDistribution: { 1: 58, 2: 73, 3: 160, 4: 436, 5: 729 }
    },
    {
      name: 'Poi Dog',
      description: 'Hawaiian-inspired snack bar with a unique lilikoi-matcha drink. Casual counter service with outdoor seating.',
      address: '3336 Walnut St, Philadelphia, PA 19104',
      location: { lat: 39.9535, lng: -75.1977 },
      coverImage: getImg(7),
      images: [],
      isOrganic: false,
      isCeremonial: false,
      hasWhisk: false,
      hasNonDairyMilk: true,
      hasWifi: false,
      priceLevel: 2,
      tags: ['university city', 'hawaiian', 'creative', 'casual'],
      searchTerms: ['poi dog', 'university city', 'hawaiian', 'walnut'],
      averageRating: 4.4,
      totalReviews: 723,
      ratingDistribution: { 1: 22, 2: 36, 3: 72, 4: 217, 5: 376 }
    },
    {
      name: 'Korshak Bagels',
      description: 'Popular bagel spot with an unexpectedly great matcha program. Perfect pairing of bagel and matcha latte.',
      address: '2233 Grays Ferry Ave, Philadelphia, PA 19146',
      location: { lat: 39.9396, lng: -75.1843 },
      coverImage: getImg(0),
      images: [],
      isOrganic: false,
      isCeremonial: true,
      hasWhisk: false,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 2,
      tags: ['grays ferry', 'bagels', 'breakfast', 'casual'],
      searchTerms: ['korshak', 'grays ferry', 'bagels', 'breakfast'],
      averageRating: 4.5,
      totalReviews: 567,
      ratingDistribution: { 1: 14, 2: 23, 3: 51, 4: 159, 5: 320 }
    },
    {
      name: 'OCF Coffee House',
      description: 'Community-focused cafe in Fairmount with organic matcha options. Quiet space ideal for work or reading.',
      address: '2221 Fairmount Ave, Philadelphia, PA 19130',
      location: { lat: 39.9666, lng: -75.1759 },
      coverImage: getImg(1),
      images: [],
      isOrganic: true,
      isCeremonial: false,
      hasWhisk: false,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 2,
      tags: ['fairmount', 'community', 'quiet', 'organic'],
      searchTerms: ['ocf', 'fairmount', 'coffee house', 'community'],
      averageRating: 4.3,
      totalReviews: 445,
      ratingDistribution: { 1: 18, 2: 27, 3: 53, 4: 134, 5: 213 }
    },

    // ============ BOSTON (10 cafes) ============
    {
      name: 'Ogawa Coffee',
      description: 'Kyoto-based coffee roaster with excellent matcha offerings. Their matcha is sourced from Uji and prepared with meticulous attention.',
      address: '10 Milk St, Boston, MA 02108',
      location: { lat: 42.3576, lng: -71.0580 },
      coverImage: getImg(2),
      images: [],
      isOrganic: true,
      isCeremonial: true,
      hasWhisk: true,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 3,
      tags: ['kyoto', 'downtown', 'premium', 'japanese'],
      searchTerms: ['ogawa', 'downtown', 'kyoto', 'milk street'],
      averageRating: 4.6,
      totalReviews: 534,
      ratingDistribution: { 1: 11, 2: 16, 3: 43, 4: 145, 5: 319 }
    },
    {
      name: 'Dado Tea',
      description: 'Cozy tea cafe in Harvard Square with a thoughtful matcha menu. Great spot for studying with quality matcha.',
      address: '50 Church St, Cambridge, MA 02138',
      location: { lat: 42.3736, lng: -71.1217 },
      coverImage: getImg(3),
      images: [],
      isOrganic: false,
      isCeremonial: false,
      hasWhisk: true,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 2,
      tags: ['harvard square', 'study spot', 'cozy', 'cambridge'],
      searchTerms: ['dado tea', 'cambridge', 'harvard', 'study'],
      averageRating: 4.4,
      totalReviews: 867,
      ratingDistribution: { 1: 26, 2: 43, 3: 87, 4: 289, 5: 422 }
    },
    {
      name: 'Tatte Bakery',
      description: 'Israeli-inspired bakery with locations across Boston. Their matcha latte pairs perfectly with their famous pastries.',
      address: '70 Charles St, Boston, MA 02114',
      location: { lat: 42.3583, lng: -71.0703 },
      coverImage: getImg(4),
      images: [],
      isOrganic: false,
      isCeremonial: false,
      hasWhisk: false,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 3,
      tags: ['beacon hill', 'bakery', 'pastries', 'brunch'],
      searchTerms: ['tatte', 'beacon hill', 'charles street', 'bakery'],
      averageRating: 4.5,
      totalReviews: 2341,
      ratingDistribution: { 1: 58, 2: 94, 3: 234, 4: 702, 5: 1253 }
    },
    {
      name: 'Pavement Coffeehouse',
      description: 'Local Boston chain known for quality drinks. Their matcha latte is made with ceremonial-grade matcha.',
      address: '44 Gainsborough St, Boston, MA 02115',
      location: { lat: 42.3427, lng: -71.0869 },
      coverImage: getImg(5),
      images: [],
      isOrganic: false,
      isCeremonial: true,
      hasWhisk: false,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 2,
      tags: ['back bay', 'local chain', 'casual', 'student-friendly'],
      searchTerms: ['pavement', 'back bay', 'gainsborough', 'coffeehouse'],
      averageRating: 4.3,
      totalReviews: 1678,
      ratingDistribution: { 1: 67, 2: 84, 3: 185, 4: 503, 5: 839 }
    },
    {
      name: 'Thinking Cup',
      description: 'Newbury Street cafe with premium Stumptown coffee and excellent matcha. Cozy atmosphere with exposed brick.',
      address: '85 Newbury St, Boston, MA 02116',
      location: { lat: 42.3507, lng: -71.0802 },
      coverImage: getImg(6),
      images: [],
      isOrganic: false,
      isCeremonial: true,
      hasWhisk: false,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 3,
      tags: ['newbury', 'cozy', 'exposed brick', 'premium'],
      searchTerms: ['thinking cup', 'newbury', 'back bay', 'stumptown'],
      averageRating: 4.4,
      totalReviews: 1234,
      ratingDistribution: { 1: 37, 2: 49, 3: 123, 4: 370, 5: 655 }
    },
    {
      name: 'George Howell Coffee',
      description: 'Specialty coffee pioneer with exceptional matcha. Their Godfrey Hotel location is perfect for a refined matcha experience.',
      address: '505 Washington St, Boston, MA 02111',
      location: { lat: 42.3543, lng: -71.0611 },
      coverImage: getImg(7),
      images: [],
      isOrganic: true,
      isCeremonial: true,
      hasWhisk: true,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 4,
      tags: ['downtown crossing', 'specialty', 'refined', 'pioneer'],
      searchTerms: ['george howell', 'downtown crossing', 'godfrey', 'specialty'],
      averageRating: 4.7,
      totalReviews: 623,
      ratingDistribution: { 1: 12, 2: 19, 3: 50, 4: 174, 5: 368 }
    },
    {
      name: 'Gracenote Coffee',
      description: 'Tiny Leather District spot serving some of Boston\'s best matcha. Standing room only but worth the visit.',
      address: '108 Lincoln St, Boston, MA 02111',
      location: { lat: 42.3498, lng: -71.0549 },
      coverImage: getImg(0),
      images: [],
      isOrganic: true,
      isCeremonial: true,
      hasWhisk: true,
      hasNonDairyMilk: true,
      hasWifi: false,
      priceLevel: 3,
      tags: ['leather district', 'tiny', 'specialty', 'standing room'],
      searchTerms: ['gracenote', 'leather district', 'lincoln street', 'specialty'],
      averageRating: 4.8,
      totalReviews: 389,
      ratingDistribution: { 1: 4, 2: 8, 3: 27, 4: 97, 5: 253 }
    },
    {
      name: 'Barismo',
      description: 'Arlington coffee roaster with Cambridge cafe. Their matcha is sourced from Uji and prepared with care.',
      address: '169 Massachusetts Ave, Arlington, MA 02474',
      location: { lat: 42.4149, lng: -71.1566 },
      coverImage: getImg(1),
      images: [],
      isOrganic: false,
      isCeremonial: true,
      hasWhisk: true,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 3,
      tags: ['arlington', 'roaster', 'uji', 'specialty'],
      searchTerms: ['barismo', 'arlington', 'mass ave', 'roaster'],
      averageRating: 4.5,
      totalReviews: 456,
      ratingDistribution: { 1: 11, 2: 18, 3: 41, 4: 128, 5: 258 }
    },
    {
      name: 'Mamaleh\'s Delicatessen',
      description: 'Jewish deli with a great matcha latte. Unexpected find but their matcha is well-prepared and perfectly sweet.',
      address: '15 Hampshire St, Cambridge, MA 02139',
      location: { lat: 42.3687, lng: -71.1024 },
      coverImage: getImg(2),
      images: [],
      isOrganic: false,
      isCeremonial: false,
      hasWhisk: false,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 2,
      tags: ['kendall square', 'deli', 'unexpected', 'casual'],
      searchTerms: ['mamalehs', 'kendall', 'cambridge', 'deli'],
      averageRating: 4.2,
      totalReviews: 1567,
      ratingDistribution: { 1: 63, 2: 78, 3: 172, 4: 470, 5: 784 }
    },
    {
      name: 'Cafe Mami',
      description: 'Japanese cafe in Allston specializing in matcha and Japanese sweets. Authentic koicha and usucha available.',
      address: '1429 Commonwealth Ave, Allston, MA 02134',
      location: { lat: 42.3466, lng: -71.1355 },
      coverImage: getImg(3),
      images: [],
      isOrganic: true,
      isCeremonial: true,
      hasWhisk: true,
      hasNonDairyMilk: false,
      hasWifi: true,
      priceLevel: 3,
      tags: ['allston', 'japanese', 'koicha', 'authentic'],
      searchTerms: ['cafe mami', 'allston', 'commonwealth', 'japanese'],
      averageRating: 4.6,
      totalReviews: 312,
      ratingDistribution: { 1: 6, 2: 9, 3: 25, 4: 87, 5: 185 }
    },

    // ============ CHICAGO (10 cafes) ============
    {
      name: 'Matcha Cafe Maiko',
      description: 'Kyoto-based matcha chain bringing authentic Japanese matcha to Chicago. Famous for matcha soft serve.',
      address: '2222 N Clark St, Chicago, IL 60614',
      location: { lat: 41.9228, lng: -87.6387 },
      coverImage: getImg(4),
      images: [],
      isOrganic: true,
      isCeremonial: true,
      hasWhisk: true,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 2,
      tags: ['kyoto', 'soft serve', 'lincoln park', 'authentic'],
      searchTerms: ['matcha cafe maiko', 'chicago', 'lincoln park', 'kyoto'],
      averageRating: 4.6,
      totalReviews: 1123,
      ratingDistribution: { 1: 28, 2: 45, 3: 89, 4: 312, 5: 649 }
    },
    {
      name: 'Sawada Coffee',
      description: 'World latte art champion Hiroshi Sawada\'s cafe. Exceptional matcha lattes with stunning latte art.',
      address: '112 N Green St, Chicago, IL 60607',
      location: { lat: 41.8834, lng: -87.6488 },
      coverImage: getImg(5),
      images: [],
      isOrganic: false,
      isCeremonial: true,
      hasWhisk: true,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 3,
      tags: ['latte art', 'west loop', 'champion barista', 'creative'],
      searchTerms: ['sawada', 'west loop', 'latte art', 'green street'],
      averageRating: 4.7,
      totalReviews: 2456,
      ratingDistribution: { 1: 49, 2: 73, 3: 172, 4: 589, 5: 1573 }
    },
    {
      name: 'Ipsento Coffee',
      description: 'Bucktown coffee shop with house-made oat milk matcha lattes. Relaxed atmosphere with bike-themed decor.',
      address: '2035 N Western Ave, Chicago, IL 60647',
      location: { lat: 41.9186, lng: -87.6873 },
      coverImage: getImg(6),
      images: [],
      isOrganic: false,
      isCeremonial: true,
      hasWhisk: false,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 2,
      tags: ['bucktown', 'house oat milk', 'relaxed', 'bikes'],
      searchTerms: ['ipsento', 'bucktown', 'western', 'oat milk'],
      averageRating: 4.5,
      totalReviews: 1345,
      ratingDistribution: { 1: 34, 2: 54, 3: 121, 4: 403, 5: 733 }
    },
    {
      name: 'Metric Coffee',
      description: 'Fulton Market roaster with exceptional matcha. Industrial chic space with quality ceremonial-grade options.',
      address: '2021 W Fulton St, Chicago, IL 60612',
      location: { lat: 41.8867, lng: -87.6781 },
      coverImage: getImg(7),
      images: [],
      isOrganic: true,
      isCeremonial: true,
      hasWhisk: true,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 3,
      tags: ['fulton market', 'roaster', 'industrial', 'specialty'],
      searchTerms: ['metric', 'fulton market', 'roaster', 'fulton street'],
      averageRating: 4.6,
      totalReviews: 678,
      ratingDistribution: { 1: 14, 2: 20, 3: 54, 4: 190, 5: 400 }
    },
    {
      name: 'Kyoten',
      description: 'Japanese kaiseki restaurant with a dedicated matcha service. Traditional ceremonial preparation.',
      address: '2507 W Armitage Ave, Chicago, IL 60647',
      location: { lat: 41.9173, lng: -87.6907 },
      coverImage: getImg(0),
      images: [],
      isOrganic: true,
      isCeremonial: true,
      hasWhisk: true,
      hasNonDairyMilk: false,
      hasWifi: false,
      priceLevel: 4,
      tags: ['bucktown', 'kaiseki', 'traditional', 'ceremonial'],
      searchTerms: ['kyoten', 'bucktown', 'armitage', 'kaiseki'],
      averageRating: 4.9,
      totalReviews: 234,
      ratingDistribution: { 1: 2, 2: 5, 3: 12, 4: 51, 5: 164 }
    },
    {
      name: 'Fairgrounds Coffee',
      description: 'Multi-roaster cafe with rotating matcha options. Spacious Wicker Park location with ample seating.',
      address: '1621 N Milwaukee Ave, Chicago, IL 60647',
      location: { lat: 41.9102, lng: -87.6739 },
      coverImage: getImg(1),
      images: [],
      isOrganic: false,
      isCeremonial: true,
      hasWhisk: false,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 2,
      tags: ['wicker park', 'spacious', 'multi-roaster', 'rotating'],
      searchTerms: ['fairgrounds', 'wicker park', 'milwaukee', 'coffee'],
      averageRating: 4.4,
      totalReviews: 1123,
      ratingDistribution: { 1: 45, 2: 56, 3: 112, 4: 337, 5: 573 }
    },
    {
      name: 'Goddess and the Baker',
      description: 'All-day cafe with excellent matcha lattes. Multiple locations across Chicago with consistent quality.',
      address: '181 W Madison St, Chicago, IL 60602',
      location: { lat: 41.8818, lng: -87.6330 },
      coverImage: getImg(2),
      images: [],
      isOrganic: false,
      isCeremonial: false,
      hasWhisk: false,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 2,
      tags: ['loop', 'all-day', 'consistent', 'accessible'],
      searchTerms: ['goddess baker', 'loop', 'madison', 'downtown'],
      averageRating: 4.2,
      totalReviews: 2345,
      ratingDistribution: { 1: 94, 2: 117, 3: 281, 4: 703, 5: 1150 }
    },
    {
      name: 'Heritage Bicycles',
      description: 'Bike shop and cafe in Lakeview. Their matcha latte is surprisingly excellent. Unique atmosphere.',
      address: '2959 N Lincoln Ave, Chicago, IL 60657',
      location: { lat: 41.9351, lng: -87.6674 },
      coverImage: getImg(3),
      images: [],
      isOrganic: false,
      isCeremonial: true,
      hasWhisk: false,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 2,
      tags: ['lakeview', 'bike shop', 'unique', 'casual'],
      searchTerms: ['heritage bicycles', 'lakeview', 'lincoln', 'bike'],
      averageRating: 4.4,
      totalReviews: 867,
      ratingDistribution: { 1: 35, 2: 43, 3: 87, 4: 260, 5: 442 }
    },
    {
      name: 'Intelligentsia Coffee',
      description: 'Pioneering third-wave roaster with solid matcha offerings. The Monadnock Building location is stunning.',
      address: '53 W Jackson Blvd, Chicago, IL 60604',
      location: { lat: 41.8781, lng: -87.6298 },
      coverImage: getImg(4),
      images: [],
      isOrganic: false,
      isCeremonial: true,
      hasWhisk: false,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 3,
      tags: ['loop', 'pioneer', 'historic building', 'third wave'],
      searchTerms: ['intelligentsia', 'loop', 'jackson', 'monadnock'],
      averageRating: 4.5,
      totalReviews: 1789,
      ratingDistribution: { 1: 45, 2: 72, 3: 161, 4: 536, 5: 975 }
    },
    {
      name: 'Bake & Gather',
      description: 'Ravenswood bakery with excellent matcha lattes and matcha pastries. Community-focused space.',
      address: '4403 N Ravenswood Ave, Chicago, IL 60640',
      location: { lat: 41.9614, lng: -87.6743 },
      coverImage: getImg(5),
      images: [],
      isOrganic: true,
      isCeremonial: false,
      hasWhisk: false,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 2,
      tags: ['ravenswood', 'bakery', 'community', 'matcha pastries'],
      searchTerms: ['bake gather', 'ravenswood', 'bakery', 'community'],
      averageRating: 4.5,
      totalReviews: 445,
      ratingDistribution: { 1: 11, 2: 18, 3: 40, 4: 125, 5: 251 }
    },

    // ============ OTHER CITIES (10 cafes) ============
    // San Francisco
    {
      name: 'Stonemill Matcha',
      description: 'Premium matcha bar using stone-milled ceremonial grade matcha from Uji, Kyoto.',
      address: '561 Valencia St, San Francisco, CA 94110',
      location: { lat: 37.7638, lng: -122.4218 },
      coverImage: getImg(6),
      images: [],
      isOrganic: true,
      isCeremonial: true,
      hasWhisk: true,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 3,
      tags: ['ceremonial', 'uji', 'mission', 'stone-milled'],
      searchTerms: ['stonemill', 'valencia', 'mission', 'sf'],
      averageRating: 4.8,
      totalReviews: 567,
      ratingDistribution: { 1: 8, 2: 11, 3: 34, 4: 123, 5: 391 }
    },
    // Seattle
    {
      name: 'Miro Tea',
      description: 'Serene tea house in Ballard with ceremonial matcha whisked tableside.',
      address: '5405 Ballard Ave NW, Seattle, WA 98107',
      location: { lat: 47.6683, lng: -122.3841 },
      coverImage: getImg(7),
      images: [],
      isOrganic: true,
      isCeremonial: true,
      hasWhisk: true,
      hasNonDairyMilk: false,
      hasWifi: false,
      priceLevel: 3,
      tags: ['tea house', 'ballard', 'traditional', 'serene'],
      searchTerms: ['miro tea', 'seattle', 'ballard', 'tea house'],
      averageRating: 4.8,
      totalReviews: 456,
      ratingDistribution: { 1: 5, 2: 9, 3: 27, 4: 98, 5: 317 }
    },
    // Austin
    {
      name: 'Sa-Tén',
      description: 'Japanese coffee and matcha bar from the creators of Ramen Tatsu-Ya.',
      address: '916 Springdale Rd, Austin, TX 78702',
      location: { lat: 30.2639, lng: -97.7069 },
      coverImage: getImg(0),
      images: [],
      isOrganic: false,
      isCeremonial: true,
      hasWhisk: true,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 2,
      tags: ['east austin', 'japanese', 'modern', 'hip'],
      searchTerms: ['sa-ten', 'saten', 'austin', 'east austin'],
      averageRating: 4.7,
      totalReviews: 1234,
      ratingDistribution: { 1: 25, 2: 37, 3: 86, 4: 321, 5: 765 }
    },
    // Portland
    {
      name: 'Tea Chai Té',
      description: 'Beloved Portland tea house with impressive matcha selection from small Japanese farms.',
      address: '734 NW 23rd Ave, Portland, OR 97210',
      location: { lat: 45.5293, lng: -122.6985 },
      coverImage: getImg(1),
      images: [],
      isOrganic: true,
      isCeremonial: true,
      hasWhisk: true,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 2,
      tags: ['nw portland', 'tea house', 'local favorite', 'ceremonial'],
      searchTerms: ['tea chai te', 'portland', 'nw 23rd', 'tea house'],
      averageRating: 4.6,
      totalReviews: 723,
      ratingDistribution: { 1: 14, 2: 22, 3: 58, 4: 195, 5: 434 }
    },
    // Denver
    {
      name: 'Little Owl Coffee',
      description: 'Denver favorite with excellent matcha made with Kettl matcha. Cozy neighborhood spot.',
      address: '1555 Blake St, Denver, CO 80202',
      location: { lat: 39.7530, lng: -104.9977 },
      coverImage: getImg(2),
      images: [],
      isOrganic: true,
      isCeremonial: true,
      hasWhisk: false,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 2,
      tags: ['lodo', 'cozy', 'kettl', 'neighborhood'],
      searchTerms: ['little owl', 'denver', 'blake', 'lodo'],
      averageRating: 4.5,
      totalReviews: 678,
      ratingDistribution: { 1: 17, 2: 27, 3: 61, 4: 190, 5: 383 }
    },
    // Miami
    {
      name: 'Panther Coffee',
      description: 'Miami roaster with quality matcha options. Great patio seating in Wynwood.',
      address: '2390 NW 2nd Ave, Miami, FL 33127',
      location: { lat: 25.7974, lng: -80.1996 },
      coverImage: getImg(3),
      images: [],
      isOrganic: false,
      isCeremonial: true,
      hasWhisk: false,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 3,
      tags: ['wynwood', 'patio', 'roaster', 'art district'],
      searchTerms: ['panther', 'wynwood', 'miami', '2nd ave'],
      averageRating: 4.4,
      totalReviews: 1456,
      ratingDistribution: { 1: 58, 2: 73, 3: 160, 4: 436, 5: 729 }
    },
    // Washington DC
    {
      name: 'Baked & Wired',
      description: 'Georgetown institution with surprisingly great matcha lattes alongside famous cupcakes.',
      address: '1052 Thomas Jefferson St NW, Washington, DC 20007',
      location: { lat: 38.9037, lng: -77.0612 },
      coverImage: getImg(4),
      images: [],
      isOrganic: false,
      isCeremonial: false,
      hasWhisk: false,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 2,
      tags: ['georgetown', 'cupcakes', 'institution', 'casual'],
      searchTerms: ['baked wired', 'georgetown', 'dc', 'thomas jefferson'],
      averageRating: 4.5,
      totalReviews: 2678,
      ratingDistribution: { 1: 67, 2: 107, 3: 268, 4: 803, 5: 1433 }
    },
    // Nashville
    {
      name: 'Steadfast Coffee',
      description: 'Nashville specialty roaster with a dedicated matcha menu. Clean, modern space.',
      address: '603 Taylor St, Nashville, TN 37208',
      location: { lat: 36.1783, lng: -86.7930 },
      coverImage: getImg(5),
      images: [],
      isOrganic: true,
      isCeremonial: true,
      hasWhisk: true,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 3,
      tags: ['germantown', 'specialty', 'modern', 'roaster'],
      searchTerms: ['steadfast', 'nashville', 'germantown', 'taylor'],
      averageRating: 4.6,
      totalReviews: 567,
      ratingDistribution: { 1: 11, 2: 17, 3: 51, 4: 159, 5: 329 }
    },
    // Minneapolis
    {
      name: 'Spyhouse Coffee',
      description: 'Minneapolis roaster with excellent matcha program. Multiple locations with consistent quality.',
      address: '945 Broadway St NE, Minneapolis, MN 55413',
      location: { lat: 45.0006, lng: -93.2477 },
      coverImage: getImg(6),
      images: [],
      isOrganic: false,
      isCeremonial: true,
      hasWhisk: false,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 2,
      tags: ['northeast', 'roaster', 'consistent', 'local'],
      searchTerms: ['spyhouse', 'minneapolis', 'northeast', 'broadway'],
      averageRating: 4.5,
      totalReviews: 1234,
      ratingDistribution: { 1: 31, 2: 49, 3: 111, 4: 370, 5: 673 }
    },
    // San Diego
    {
      name: 'Communal Coffee',
      description: 'North Park cafe with great matcha and plant-filled interior. Perfect for Instagram.',
      address: '2335 University Ave, San Diego, CA 92104',
      location: { lat: 32.7491, lng: -117.1292 },
      coverImage: getImg(7),
      images: [],
      isOrganic: true,
      isCeremonial: false,
      hasWhisk: false,
      hasNonDairyMilk: true,
      hasWifi: true,
      priceLevel: 2,
      tags: ['north park', 'plants', 'instagram', 'aesthetic'],
      searchTerms: ['communal', 'san diego', 'north park', 'university'],
      averageRating: 4.4,
      totalReviews: 1567,
      ratingDistribution: { 1: 63, 2: 78, 3: 172, 4: 470, 5: 784 }
    }
  ]

  try {
    const cafesRef = collection(db, CAFES_COLLECTION)
    let count = 0
    for (const cafe of realCafes) {
      await addDoc(cafesRef, {
        ...cafe,
        createdAt: serverTimestamp()
      })
      count++
      console.log(`Seeded ${count}/${realCafes.length}: ${cafe.name}`)
    }
    console.log('Real matcha cafes seeded successfully!')
    return { success: true, count: realCafes.length }
  } catch (error) {
    console.error('Error seeding cafes:', error)
    throw error
  }
}
