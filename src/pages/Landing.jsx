import { Link } from 'react-router-dom'
import { MapPin, Star, Heart, ArrowRight, Leaf } from 'lucide-react'
import { Button, Rating } from '../components/common'

export default function Landing() {
  return (
    <div className="min-h-screen bg-hero-pattern relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-matcha-medium/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-64 h-64 bg-matcha-light/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-matcha-dark/10 rounded-full blur-3xl" />

        {/* Floating leaves */}
        <Leaf className="absolute top-20 right-[15%] w-8 h-8 text-matcha-medium/30 animate-float" style={{ animationDelay: '0s' }} />
        <Leaf className="absolute top-40 left-[10%] w-6 h-6 text-matcha-dark/20 animate-float" style={{ animationDelay: '2s' }} />
        <Leaf className="absolute bottom-40 right-[25%] w-10 h-10 text-matcha-medium/20 animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8 md:py-16 lg:py-20">
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-matcha-dark rounded-3xl mb-6 shadow-xl shadow-matcha-dark/20">
              <span className="text-4xl md:text-5xl">🍵</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-matcha-darker mb-4 leading-tight">
              MapMyMatcha
            </h1>

            <p className="text-lg md:text-xl text-gray-600 max-w-md mx-auto lg:mx-0 mb-8">
              Discover the best matcha cafes near you. Rate, review, and find your perfect cup.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto px-8">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Guest mode link */}
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 text-matcha-dark hover:text-matcha-darker font-medium transition-colors"
            >
              <span>Continue as guest</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right content - Feature visual */}
          <div className="flex-1 w-full max-w-lg">
            <div className="relative">
              {/* Phone mockup with app preview */}
              <div className="relative mx-auto w-64 md:w-72">
                <div className="bg-white rounded-[2.5rem] p-3 shadow-2xl shadow-matcha-dark/20">
                  <div className="bg-gray-100 rounded-[2rem] overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&q=80"
                      alt="Matcha latte with latte art"
                      className="w-full h-80 md:h-96 object-cover"
                    />
                    <div className="p-4 bg-white">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-matcha-light rounded-full flex items-center justify-center">
                          <span className="text-sm">🍵</span>
                        </div>
                        <span className="font-semibold text-gray-900">Cha Cha Matcha</span>
                      </div>
                      <Rating value={4.5} size="sm" showValue />
                    </div>
                  </div>
                </div>

                {/* Floating cards */}
                <div className="absolute -left-8 top-20 bg-white rounded-xl p-3 shadow-lg animate-float" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-matcha-dark" />
                    <span className="text-sm font-medium">0.3 mi away</span>
                  </div>
                </div>

                <div className="absolute -right-4 bottom-32 bg-white rounded-xl p-3 shadow-lg animate-float" style={{ animationDelay: '3s' }}>
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    <span className="text-sm font-medium">Saved!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 md:mt-32">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
            Everything you need to find great matcha
          </h2>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <FeatureCard
              icon={<MapPin className="w-7 h-7 text-matcha-dark" />}
              title="Find Nearby Cafes"
              description="Explore matcha spots in your area with our interactive map and location-based search"
              image="https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600&q=80"
            />
            <FeatureCard
              icon={<Star className="w-7 h-7 text-matcha-dark" />}
              title="Rate & Review"
              description="Share your experiences with photos and help others discover amazing matcha"
              image="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80"
            />
            <FeatureCard
              icon={<Heart className="w-7 h-7 text-matcha-dark" />}
              title="Save Favorites"
              description="Build your personal collection of go-to matcha spots for easy access anytime"
              image="https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=600&q=80"
            />
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 md:mt-32 text-center">
          <div className="inline-block bg-white/60 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-lg">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Ready to find your perfect matcha?
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Join thousands of matcha lovers discovering their new favorite cafes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto px-8">
                  Create Free Account
                </Button>
              </Link>
              <Link to="/discover">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8">
                  Browse as Guest
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description, image }) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 card-hover">
      <div className="h-40 md:h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-6">
        <div className="w-14 h-14 bg-matcha-light rounded-xl flex items-center justify-center mb-4 -mt-12 relative z-10 shadow-md">
          {icon}
        </div>
        <h3 className="font-semibold text-lg text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
