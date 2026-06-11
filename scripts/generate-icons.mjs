// Generates PWA / home-screen icons from public/matcha-icon.svg.
// Run after changing the icon: node scripts/generate-icons.mjs
import sharp from 'sharp'
import { readFileSync } from 'fs'

const svg = readFileSync('public/matcha-icon.svg')

// Maskable icons need padding (the OS crops up to 20% on each side),
// and iOS home-screen icons look best on a solid background.
const SOLID_BG = '#DCECD5'

const targets = [
  { file: 'public/pwa-192.png', size: 192, padded: false },
  { file: 'public/pwa-512.png', size: 512, padded: false },
  { file: 'public/pwa-maskable-512.png', size: 512, padded: true },
  { file: 'public/apple-touch-icon.png', size: 180, padded: true }
]

for (const { file, size, padded } of targets) {
  if (padded) {
    const inner = Math.round(size * 0.72)
    const margin = Math.round((size - inner) / 2)
    const icon = await sharp(svg).resize(inner, inner).png().toBuffer()
    await sharp({
      create: { width: size, height: size, channels: 4, background: SOLID_BG }
    })
      .composite([{ input: icon, top: margin, left: margin }])
      .png()
      .toFile(file)
  } else {
    await sharp(svg).resize(size, size).png().toFile(file)
  }
  console.log(`wrote ${file}`)
}
