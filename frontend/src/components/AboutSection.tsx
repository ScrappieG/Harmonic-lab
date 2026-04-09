import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Button } from './ui/button'

const creators = ['Evan Hadam', 'Jimmy Liu', 'Aiden Shay', 'Jack Stone']

function AboutSection() {
  const reduceMotion = useReducedMotion() ?? false

  return (
    <section id="about" className="relative overflow-hidden bg-stone-900 py-20 text-stone-100 md:py-24">
      <div className="pointer-events-none absolute -left-16 top-10 h-44 w-44 rounded-full bg-lime-300/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-8 h-52 w-52 rounded-full bg-stone-100/10 blur-3xl" />

      <div className="layout-shell relative">
        <p className="brand-mono text-xs uppercase tracking-widest text-stone-400">About</p>

        <div className="mt-5 grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <h2 className="brand-serif text-4xl leading-tight tracking-tight sm:text-3xl lg:text-4xl">
              Built by Harmonic Labs.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-stone-300 sm:text-lg">
              ArticuLeet is a senior project focused on improving technical communication skills. Our
              app combines a web platform and Chrome extension to help people practice explaining how they think.
            </p>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-stone-300 sm:text-lg">
              We designed it for interview prep that feels more practical and has less setup friction.
            </p>
          </div>

          <motion.div
            className="rounded-sm border border-stone-700 bg-stone-800/70 p-6 backdrop-blur-sm md:p-7"
            initial={reduceMotion ? false : { opacity: 0 }}
            whileInView={reduceMotion ? undefined : { opacity: 1 }}
            viewport={{ once: false, amount: 0.35 }}
            transition={{ duration: 0.6 }}
          >
            <p className="brand-mono text-xs uppercase tracking-widest text-stone-400">Creators</p>
            <ul className="mt-5 space-y-3">
              {creators.map((creator) => (
                <li key={creator} className="brand-serif text-lg leading-tight text-stone-100 sm:text-xl">
                  {creator}
                </li>
              ))}
            </ul>

            <div className="mt-8 border-t border-stone-700 pt-5">
              <p className="brand-mono text-xs uppercase tracking-widest text-stone-400">TL;DR</p>
              <p className="mt-3 text-base text-stone-200 sm:text-lg">Web app + Chrome extension for individually practicing technical interviews out loud on LeetCode.</p>
            </div>

            <div className="mt-6">
              <Button asChild className="h-11 rounded-md bg-lime-700 px-5 text-sm font-semibold text-stone-950 hover:bg-lime-600">
                <a href="#" aria-label="Install Chrome extension">
                  Install Chrome Extension
                </a>
              </Button>

              <div className="mt-4">
                <Link
                  to="/privacy"
                  className="brand-mono text-[11px] uppercase underline underline-offset-1 tracking-[0.2em] text-stone-400 transition-colors hover:text-stone-100"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
