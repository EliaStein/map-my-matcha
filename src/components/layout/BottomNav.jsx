import { NavLink, useNavigate } from 'react-router-dom'
import { Compass, Heart, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/discover', icon: Compass, label: 'Discover', requiresAuth: false },
  { to: '/favorites', icon: Heart, label: 'Favorites', requiresAuth: true },
  { to: '/profile', icon: User, label: 'Profile', requiresAuth: true }
]

export default function BottomNav() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleNavClick = (item, e) => {
    if (item.requiresAuth && !isAuthenticated) {
      e.preventDefault()
      navigate('/login')
    }
  }

  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-gray-200 safe-bottom md:hidden">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {navItems.map(({ to, icon: Icon, label, requiresAuth }) => (
            <NavLink
              key={to}
              to={to}
              onClick={(e) => handleNavClick({ requiresAuth }, e)}
              className={({ isActive }) => `
                flex flex-col items-center justify-center gap-1 px-6 py-2
                transition-colors duration-200
                ${isActive
                  ? 'text-matcha-dark'
                  : 'text-gray-400 hover:text-gray-600'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-6 h-6 transition-all duration-200 ${
                      isActive ? 'fill-matcha-light' : ''
                    }`}
                  />
                  <span className="text-xs font-medium">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Desktop top nav */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-matcha-dark rounded-xl flex items-center justify-center">
                <span className="text-xl">🍵</span>
              </div>
              <span className="text-xl font-bold text-matcha-darker">MapMyMatcha</span>
            </NavLink>

            {/* Nav links */}
            <div className="flex items-center gap-1">
              {navItems.map(({ to, icon: Icon, label, requiresAuth }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={(e) => handleNavClick({ requiresAuth }, e)}
                  className={({ isActive }) => `
                    flex items-center gap-2 px-4 py-2 rounded-lg
                    transition-colors duration-200
                    ${isActive
                      ? 'bg-matcha-light text-matcha-dark'
                      : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </NavLink>
              ))}

              {!isAuthenticated && (
                <NavLink
                  to="/login"
                  className="ml-4 px-5 py-2 bg-matcha-dark text-white rounded-lg font-medium hover:bg-matcha-darker transition-colors"
                >
                  Sign In
                </NavLink>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
