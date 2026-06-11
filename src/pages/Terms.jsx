import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export default function Terms() {
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
          <h1 className="text-2xl font-bold text-gray-900">Terms of Service</h1>
        </div>

        <div className="prose-sm space-y-4 text-gray-600 text-sm leading-relaxed">
          <p className="text-gray-400">Last updated: June 11, 2026</p>

          <p>
            Map My Matcha is a community platform for discovering and reviewing
            matcha cafes. By creating an account or using the app, you agree to
            these terms.
          </p>

          <h2 className="text-base font-semibold text-gray-900">Your content</h2>
          <p>
            You own the reviews, photos, and cafe listings you submit. By
            posting, you grant Map My Matcha a non-exclusive license to display
            that content in the app. You are responsible for what you post.
          </p>

          <h2 className="text-base font-semibold text-gray-900">Community guidelines</h2>
          <p>
            There is no tolerance for objectionable content or abusive
            behavior. This includes spam, harassment, hate speech, sexually
            explicit material, and deliberately false information. Content
            that violates these guidelines will be removed, and accounts that
            repeatedly violate them will be terminated.
          </p>

          <h2 className="text-base font-semibold text-gray-900">Reporting and blocking</h2>
          <p>
            Every review and listing can be reported using the flag icon, and
            you can block any user to hide their content from your view.
            Reports are reviewed within 24 hours and violating content is
            removed.
          </p>

          <h2 className="text-base font-semibold text-gray-900">Your account</h2>
          <p>
            You can delete your account at any time from the Profile page,
            which permanently removes your profile, reviews, and photos.
          </p>

          <h2 className="text-base font-semibold text-gray-900">Disclaimer</h2>
          <p>
            Cafe information is community-contributed and provided as-is;
            hours, locations, and offerings may be inaccurate or out of date.
            The service is provided without warranties of any kind.
          </p>

          <h2 className="text-base font-semibold text-gray-900">Contact</h2>
          <p>
            Questions about these terms: elias.stein@gmail.com
          </p>
        </div>
      </div>
    </div>
  )
}
