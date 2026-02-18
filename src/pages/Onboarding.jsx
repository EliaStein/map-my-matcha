import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, updateDoc } from 'firebase/firestore'
import { Leaf } from 'lucide-react'
import { db } from '../config/firebase'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/common'
import { ProgressIndicator, TagSelector, PriceSelector } from '../components/onboarding'

const MATCHA_QUALITY_TAGS = [
  { id: 'organic', emoji: '🌱', label: 'Organic' },
  { id: 'ceremonial', emoji: '🏆', label: 'Ceremonial Grade' },
  { id: 'fromJapan', emoji: '🇯🇵', label: 'From Japan' },
  { id: 'useWhisk', emoji: '🥄', label: 'Use Whisk' },
  { id: 'whiskedInFrontOfYou', emoji: '👀', label: 'Whisked In Front' }
]

const DIETARY_TAGS = [
  { id: 'nonDairyMilk', emoji: '🥛', label: 'Non-Dairy Milk' },
  { id: 'seedOilFreeMilk', emoji: '🌻', label: 'Seed Oil-Free' },
  { id: 'organicMilk', emoji: '🐄', label: 'Organic Milk' },
  { id: 'unsweetened', emoji: '🚫', label: 'Unsweetened Options' },
  { id: 'homemadeSyrups', emoji: '🍯', label: 'Homemade Syrups' }
]

const CAFE_VIBE_TAGS = [
  { id: 'wifi', emoji: '📶', label: 'WiFi' },
  { id: 'workSpace', emoji: '💻', label: 'Work Space' },
  { id: 'shortLines', emoji: '⚡', label: 'Short Lines' },
  { id: 'creativeLattes', emoji: '🎨', label: 'Creative Lattes' }
]

const STEPS = [
  {
    title: 'Matcha Quality',
    subtitle: 'What matters most in your matcha?',
    tags: MATCHA_QUALITY_TAGS
  },
  {
    title: 'Dietary Preferences',
    subtitle: 'Any specific requirements?',
    tags: DIETARY_TAGS
  },
  {
    title: 'Cafe Vibes',
    subtitle: 'What kind of experience are you looking for?',
    tags: CAFE_VIBE_TAGS
  },
  {
    title: 'Price Range',
    subtitle: 'What\'s your typical budget?',
    isPriceStep: true
  }
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { user, refreshUserProfile } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedTags, setSelectedTags] = useState([])
  const [priceRange, setPriceRange] = useState(null)
  const [loading, setLoading] = useState(false)

  const step = STEPS[currentStep]
  const isLastStep = currentStep === STEPS.length - 1
  const canProceed = step.isPriceStep ? priceRange !== null : true

  const handleNext = async () => {
    if (isLastStep) {
      await savePreferences()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleSkip = async () => {
    await savePreferences(true)
  }

  const savePreferences = async (skipped = false) => {
    setLoading(true)

    try {
      const preferences = skipped ? {} : {
        organic: selectedTags.includes('organic'),
        ceremonial: selectedTags.includes('ceremonial'),
        fromJapan: selectedTags.includes('fromJapan'),
        useWhisk: selectedTags.includes('useWhisk'),
        whiskedInFrontOfYou: selectedTags.includes('whiskedInFrontOfYou'),
        nonDairyMilk: selectedTags.includes('nonDairyMilk'),
        seedOilFreeMilk: selectedTags.includes('seedOilFreeMilk'),
        organicMilk: selectedTags.includes('organicMilk'),
        unsweetened: selectedTags.includes('unsweetened'),
        homemadeSyrups: selectedTags.includes('homemadeSyrups'),
        wifi: selectedTags.includes('wifi'),
        workSpace: selectedTags.includes('workSpace'),
        shortLines: selectedTags.includes('shortLines'),
        creativeLattes: selectedTags.includes('creativeLattes'),
        priceRange: priceRange
      }

      await updateDoc(doc(db, 'users', user.uid), {
        hasCompletedOnboarding: true,
        preferences
      })

      await refreshUserProfile()
      navigate('/discover', { replace: true })
    } catch (error) {
      console.error('Failed to save preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-hero-pattern relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-matcha-medium/20 rounded-full blur-3xl" />
        <div className="absolute bottom-40 -left-20 w-64 h-64 bg-matcha-light/40 rounded-full blur-3xl" />
        <Leaf className="absolute top-20 right-[15%] w-8 h-8 text-matcha-medium/20 animate-float" />
        <Leaf className="absolute bottom-32 left-[10%] w-6 h-6 text-matcha-dark/15 animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <ProgressIndicator current={currentStep + 1} total={STEPS.length} />
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700"
              disabled={loading}
            >
              Skip
            </button>
          </div>

          {/* Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8">
            {/* Step Content */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {step.title}
              </h1>
              <p className="text-gray-500">
                {step.subtitle}
              </p>
            </div>

            {step.isPriceStep ? (
              <PriceSelector value={priceRange} onChange={setPriceRange} />
            ) : (
              <TagSelector
                tags={step.tags}
                selected={selectedTags}
                onChange={setSelectedTags}
              />
            )}

            {/* Navigation */}
            <div className="mt-8 space-y-3">
              <Button
                fullWidth
                size="lg"
                onClick={handleNext}
                loading={loading}
                disabled={!canProceed && isLastStep}
              >
                {isLastStep ? 'Get Started' : 'Continue'}
              </Button>

              {currentStep > 0 && (
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  disabled={loading}
                >
                  Back
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
