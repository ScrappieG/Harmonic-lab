import ApproachSection from '../components/ApproachSection'
import HeroSection from '../components/HeroSection'
import Navbar from '../components/Navbar'

function Home() {
  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <main className="layout-shell">
        <HeroSection />
        <ApproachSection />
        <section id="how-it-works" className="h-80" />
        <section id="about" className="h-80" />
      </main>
    </div>
  )
}

export default Home
