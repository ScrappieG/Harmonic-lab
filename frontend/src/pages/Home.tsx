import AboutSection from '../components/AboutSection'
import ApproachSection from '../components/ApproachSection'
import HeroSection from '../components/HeroSection'
import Navbar from '../components/Navbar'
import WorkflowSection from '../components/WorkflowSection'

function Home() {
  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <main className="layout-shell">
        <HeroSection />
      </main>

      <ApproachSection />
      <WorkflowSection />
      <AboutSection />
    </div>
  )
}

export default Home
