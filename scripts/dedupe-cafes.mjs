// One-off cleanup: remove duplicate cafe docs created by old "Clear &
// Re-seed" runs (the clear silently failed against prod rules, so each
// re-seed added a full duplicate set).
//
// Usage:
//   node scripts/dedupe-cafes.mjs            # dry run - prints the plan
//   node scripts/dedupe-cafes.mjs --execute  # actually deletes
//
// Reads are public. Deletes need an owner OAuth token (bypasses security
// rules via the REST API), supplied as FIREBASE_TOKEN - see usage above.

const PROJECT_ID = 'map-my-matcha'
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`
const EXECUTE = process.argv.includes('--execute')
const AUTH_HEADERS = process.env.FIREBASE_TOKEN
  ? { Authorization: `Bearer ${process.env.FIREBASE_TOKEN}` }
  : {}

if (EXECUTE && !process.env.FIREBASE_TOKEN) {
  console.error('FIREBASE_TOKEN is required with --execute (deletes are blocked by security rules otherwise).')
  process.exit(1)
}

function field(doc, name) {
  const f = doc.fields?.[name]
  if (!f) return undefined
  if ('stringValue' in f) return f.stringValue
  if ('integerValue' in f) return Number(f.integerValue)
  if ('doubleValue' in f) return f.doubleValue
  if ('timestampValue' in f) return f.timestampValue
  return undefined
}

async function listAllCafes() {
  const docs = []
  let pageToken = ''
  do {
    const url = `${BASE}/cafes?pageSize=300${pageToken ? `&pageToken=${pageToken}` : ''}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`List failed: ${res.status} ${await res.text()}`)
    const data = await res.json()
    docs.push(...(data.documents || []))
    pageToken = data.nextPageToken || ''
  } while (pageToken)
  return docs
}

async function countReviews(cafeId) {
  const res = await fetch(`${BASE}:runQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'reviews' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'cafeId' },
            op: 'EQUAL',
            value: { stringValue: cafeId }
          }
        },
        select: { fields: [{ fieldPath: 'cafeId' }] }
      }
    })
  })
  if (!res.ok) throw new Error(`Review query failed: ${res.status}`)
  const rows = await res.json()
  return rows.filter(r => r.document).length
}

const cafes = await listAllCafes()
console.log(`Fetched ${cafes.length} cafes`)

// Group by normalized name + address
const groups = new Map()
for (const doc of cafes) {
  const id = doc.name.split('/').pop()
  const key = `${(field(doc, 'name') || '').trim().toLowerCase()}|${(field(doc, 'address') || '').trim().toLowerCase()}`
  if (!groups.has(key)) groups.set(key, [])
  groups.get(key).push({
    id,
    name: field(doc, 'name'),
    totalReviews: field(doc, 'totalReviews') || 0,
    createdAt: field(doc, 'createdAt') || doc.createTime
  })
}

const toDelete = []
let dupGroups = 0
for (const [, members] of groups) {
  if (members.length < 2) continue
  dupGroups++
  // Check actual review counts so we never delete a copy that has reviews
  // while keeping one that doesn't.
  for (const m of members) {
    m.actualReviews = await countReviews(m.id)
  }
  // Keeper: most reviews, then oldest doc
  members.sort((a, b) =>
    b.actualReviews - a.actualReviews ||
    String(a.createdAt).localeCompare(String(b.createdAt))
  )
  const [keeper, ...dupes] = members
  const losersWithReviews = dupes.filter(d => d.actualReviews > 0)
  if (losersWithReviews.length > 0) {
    console.log(`SKIP "${keeper.name}": multiple copies have reviews - needs manual merge`)
    continue
  }
  for (const d of dupes) {
    toDelete.push(d)
    console.log(`DELETE ${d.id}  "${d.name}" (${d.actualReviews} reviews) -> keeping ${keeper.id} (${keeper.actualReviews} reviews)`)
  }
}

console.log(`\n${cafes.length} cafes, ${dupGroups} duplicated names, ${toDelete.length} docs to delete, ${cafes.length - toDelete.length} will remain`)

if (!EXECUTE) {
  console.log('\nDry run - nothing deleted. Re-run with --execute during the rules window.')
  process.exit(0)
}

let deleted = 0
for (const d of toDelete) {
  const res = await fetch(`${BASE}/cafes/${d.id}`, { method: 'DELETE', headers: AUTH_HEADERS })
  if (!res.ok) {
    console.error(`FAILED to delete ${d.id}: ${res.status} ${await res.text()}`)
    process.exit(1)
  }
  deleted++
}
console.log(`Deleted ${deleted} duplicate cafes.`)
