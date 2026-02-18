import BottomNav from './BottomNav'

export default function MobileLayout({ children }) {
  return (
    <div className="min-h-screen bg-matcha-pattern">
      <main className="max-w-6xl mx-auto pb-20 md:pb-6">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
