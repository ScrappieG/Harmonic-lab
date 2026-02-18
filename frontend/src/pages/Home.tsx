import HeroSection from '../components/HeroSection'
import Navbar from '../components/Navbar'

function Home() {
  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <main className="mx-auto max-w-[1240px] px-8 md:px-14">
        <HeroSection />
        <section id="approach" className="h-[30vh]" />
        <section id="how-it-works" className="h-[30vh]" />
        <section id="about" className="h-[30vh]" />
      </main>
    </div>
  )
}

export default Home
