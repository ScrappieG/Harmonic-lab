import { ArrowRight, Circle } from 'lucide-react'
import { Button } from './ui/button'

const feedbackItems = [
  {
    label: 'Clarity',
    status: 'strong',
    description: 'Approach was well-structured. Consider stating time complexity earlier.',
  },
  {
    label: 'Tradeoffs',
    status: 'partial',
    description: "Mentioned hash map vs. brute force but didn't compare space usage.",
  },
  {
    label: 'Communication',
    status: 'strong',
    description: 'Concise explanations. Filler words reduced from previous session.',
  },
]

function HeroSection() {
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
            Solve problems independently. Speak your reasoning out loud. Get structured feedback on how clearly you
            explained your approach - not just whether you got the right answer.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button className="h-11 rounded-md bg-lime-900 px-5 text-sm font-semibold text-white hover:bg-lime-950">
              Start practicing
              <ArrowRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="h-11 rounded-md border-stone-300 bg-transparent px-5 text-sm text-stone-800 hover:bg-stone-100"
            >
              See how it works
            </Button>
          </div>

          <div className="mt-12 border-t border-stone-300 pt-7">
            <div className="grid gap-6 text-stone-800 sm:grid-cols-2 sm:gap-8">
              <div>
                <p className="brand-mono text-xs uppercase tracking-widest text-stone-400">Available as</p>
                <p className="mt-2 text-xl lg:text-2xl">Chrome Extension + Web App</p>
              </div>
              <div className="border-l border-stone-300 pl-6 sm:pl-8">
                <p className="brand-mono text-xs uppercase tracking-widest text-stone-400">Focus</p>
                <p className="mt-2 text-xl lg:text-2xl">Technical Interview Prep</p>
              </div>
            </div>
          </div>
        </div>

        <article className="rounded-lg border border-stone-300 bg-stone-200/50 p-6 shadow-sm sm:p-7">
          <header className="mb-5 flex items-center justify-between text-stone-400">
            <div className="flex items-center gap-2.5 text-sm">
              <Circle className="size-2.5 fill-lime-800 text-lime-800" />
              <span className="brand-mono">Session feedback</span>
            </div>
            <span className="brand-mono text-sm">2 min ago</span>
          </header>

          <div className="space-y-5">
            {feedbackItems.map((item, index) => (
              <div key={item.label} className={index !== feedbackItems.length - 1 ? 'border-b border-stone-300 pb-5' : ''}>
                <div className="mb-1.5 flex items-start justify-between gap-4">
                  <h3 className="brand-mono text-sm font-medium text-stone-700">{item.label}</h3>
                  <span className="brand-mono rounded-sm bg-green-100 px-2 py-0.5 text-xs font-medium lowercase text-lime-900">
                    {item.status}
                  </span>
                </div>
                <p className="max-w-prose text-sm leading-7 text-stone-500">{item.description}</p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}

export default HeroSection
