import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export default function Privacy() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
        </div>

        <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
          <p className="text-gray-400">Last updated: June 11, 2026</p>

          <h2 className="text-base font-semibold text-gray-900">What we collect</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Account data</strong> — your email address and display
              name, stored with Firebase Authentication.
            </li>
            <li>
              <strong>Content you post</strong> — reviews, ratings, photos,
              and cafe listings, stored in Firebase.
            </li>
            <li>
              <strong>Location</strong> — only when you tap &quot;Near me&quot;,
              used on-device to sort cafes by distance. Your location is never
              stored or sent to our servers.
            </li>
            <li>
              <strong>Usage analytics</strong> — anonymous app interactions
              (pages viewed, searches, map opens) via Google Analytics for
              Firebase, used to understand how the app is used.
            </li>
          </ul>

          <h2 className="text-base font-semibold text-gray-900">What we don&apos;t do</h2>
          <p>
            We don&apos;t sell your data, show ads, or share your information
            with third parties beyond the Google services (Firebase, Google
            Maps) that run the app.
          </p>

          <h2 className="text-base font-semibold text-gray-900">Third-party services</h2>
          <p>
            The app is built on Google Firebase (authentication, database,
            storage, analytics) and Google Maps (maps and address lookup).
            Their handling of data is covered by the{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noreferrer"
              className="text-matcha-dark underline"
            >
              Google Privacy Policy
            </a>.
          </p>

          <h2 className="text-base font-semibold text-gray-900">Deleting your data</h2>
          <p>
            Deleting your account from the Profile page permanently removes
            your profile, reviews, and photos from our systems.
          </p>

          <h2 className="text-base font-semibold text-gray-900">Contact</h2>
          <p>
            Privacy questions: elias.stein@gmail.com
          </p>
        </div>
      </div>
    </div>
  )
}
