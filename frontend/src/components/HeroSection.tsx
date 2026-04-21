import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Circle } from 'lucide-react'
import { Button } from './ui/button'

const feedbackItems = [
  {
    label: 'Technical Solution',
    rating: 3,
    description: 'Correct approach with a clean implementation; edge-case handling can be tightened.',
  },
  {
    label: 'Communication',
    rating: 4,
    description: 'Explanations were concise, structured, and easy to follow throughout the session.',
  },
  {
    label: 'Problem Solving',
    rating: 3,
    description: 'Worked methodically and validated assumptions; could compare alternatives sooner.',
  },
  {
    label: 'Pass/Fail',
    rating: 4,
    description: 'Pass. Strong signal for interview readiness at this difficulty level.',
  },
]

const chromeWebStoreUrl = 'https://chromewebstore.google.com/detail/moboihkcjppfgpkcijocidnplineodga'

const maxRating = 4

function HeroSection() {
  const reduceMotion = useReducedMotion() ?? false
  const averageRating = feedbackItems.reduce((sum, item) => sum + item.rating, 0) / feedbackItems.length

  return (
    <section className="pb-12 pt-12 md:pb-16 md:pt-16">
      <div className="mt-10 grid items-end gap-10 lg:grid-cols-2 lg:gap-12">
        <div>
          <h1 className="brand-serif max-w-2xl text-5xl leading-none tracking-tight text-stone-900 sm:text-6xl lg:text-7xl">
            Clarity is a
            <br />
            technical skill.
          </h1>

          <p className="mt-7 max-w-xl text-base leading-relaxed text-stone-500 sm:text-lg">
            Solve LeetCode problems independently, speak your thoughts out loud, and get feedback on how clearly you
            explained your approach. Not just whether if you got the right answer.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href={chromeWebStoreUrl}
              target="_blank"
              rel="noopener noreferrer">
              <Button className="h-11 rounded-md bg-lime-900 px-5 text-sm font-semibold text-white hover:bg-lime-950">
                Start practicing
              <ArrowRight className="size-4" />
            </Button>
            </a>
          </div>

          <div className="mt-12 border-t border-stone-300 pt-7">
            <div className="grid gap-6 text-stone-800 sm:grid-cols-2 sm:gap-8">
              <div>
                <p className="brand-mono text-xs uppercase tracking-widest text-stone-400">Available as</p>
                <p className="mt-2 text-xl lg:text-xl">Chrome Extension + Web App</p>
              </div>
              <div className="border-l border-stone-300 pl-6 sm:pl-8">
                <p className="brand-mono text-xs uppercase tracking-widest text-stone-400">Focus</p>
                <p className="mt-2 text-xl lg:text-xl">Technical Interview Prep</p>
              </div>
            </div>
          </div>
        </div>

        <article className="rounded-lg border border-stone-300 bg-stone-200/50 p-5 shadow-sm sm:p-6">
          <header className="mb-4 flex items-center justify-between text-stone-400">
            <div className="flex items-center gap-2.5 text-sm">
              <Circle className="size-2.5 fill-lime-800 text-lime-800" />
              <span className="brand-mono">Session feedback</span>
            </div>
            <div className="text-right">
              <p className="brand-mono text-xs uppercase tracking-widest text-stone-500">Session score</p>
              <p className="brand-mono text-sm text-stone-700">{averageRating.toFixed(1)}/4</p>
            </div>
          </header>

          <motion.div
            className="space-y-4"
            initial={reduceMotion ? false : 'hidden'}
            whileInView={reduceMotion ? undefined : 'visible'}
            viewport={{ once: false, amount: 0.35 }}
            variants={
              reduceMotion
                ? undefined
                : {
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.12,
                      },
                    },
                  }
            }
          >
            {feedbackItems.map((item, index) => (
              <motion.div
                key={item.label}
                variants={
                  reduceMotion
                    ? undefined
                    : {
                        hidden: { opacity: 0, y: 8 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
                      }
                }
                className={index !== feedbackItems.length - 1 ? 'border-b border-stone-300 pb-4' : ''}
              >
                <div className="mb-1.5 flex items-start justify-between gap-4">
                  <h3 className="brand-mono text-sm font-medium text-stone-700">{item.label}</h3>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: maxRating }).map((_, dotIndex) => (
                      <span
                        key={`${item.label}-${dotIndex}`}
                        className={`size-2.5 rounded-full ${dotIndex < item.rating ? 'bg-stone-500' : 'bg-stone-300'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="max-w-prose text-sm leading-7 text-stone-500">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </article>
      </div>
    </section>
  )
}

export default HeroSection
