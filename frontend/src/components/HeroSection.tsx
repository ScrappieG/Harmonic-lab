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
    <section className="pt-8 pb-12 md:pt-12 md:pb-16">
      {/* <div className="mb-10 flex items-center gap-4 text-[11px] uppercase tracking-[0.22em] text-stone-400 md:mb-12 md:text-[12px]">
        <span className="h-px flex-1 bg-stone-300" />
        <p className="whitespace-nowrap">Articulation · Clarity · Precision</p>
        <span className="h-px flex-1 bg-stone-300" />
      </div> */}

      <div className="grid items-end gap-10 mt-10 lg:grid-cols-[1.06fr_0.94fr] lg:gap-12">
        <div>
          <h1
            className="max-w-[620px] text-[44px] leading-[0.95] tracking-[-0.02em] text-stone-900 sm:text-[56px] lg:text-[66px]"
            style={{ fontFamily: '"Hedvig Letters Serif", serif' }}
          >
            Clarity is a
            <br />
            technical skill.
          </h1>

          <p className="mt-7 max-w-[560px] text-[16px] leading-[1.55] text-stone-500 sm:text-[18px]">
            Solve problems independently. Speak your reasoning out loud. Get structured feedback on how clearly you
            explained your approach - not just whether you got the right answer.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button className="h-11 rounded-md bg-lime-900 px-5 text-[15px] font-semibold text-white hover:bg-lime-950">
              Start practicing
              <ArrowRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="h-11 rounded-md border-stone-300 bg-transparent px-5 text-[15px] text-stone-800 hover:bg-stone-100"
            >
              See how it works
            </Button>
          </div>

          <div className="mt-12 border-t border-stone-300 pt-7">
            <div className="grid gap-6 text-stone-800 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-8">
              <div>
                <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-stone-400">Available as</p>
                <p className="mt-2 text-[20px] lg:text-[22px]">Chrome Extension + Web App</p>
              </div>
              <div className="hidden h-11 w-px bg-stone-300 sm:block" />
              <div>
                <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-stone-400">Focus</p>
                <p className="mt-2 text-[20px] lg:text-[22px]">Technical Interview Prep</p>
              </div>
            </div>
          </div>
        </div>

        <article className="rounded-lg border border-stone-300 bg-stone-200/50 p-6 shadow-sm sm:p-7">
          <header className="mb-5 flex items-center justify-between text-stone-400">
            <div className="flex items-center gap-2.5 text-[15px]">
              <Circle className="size-2.5 fill-lime-800 text-lime-800" />
              <span className="font-mono">Session feedback</span>
            </div>
            <span className="font-mono text-[14px]">2 min ago</span>
          </header>

          <div className="space-y-5">
            {feedbackItems.map((item, index) => (
              <div key={item.label} className={index !== feedbackItems.length - 1 ? 'border-b border-stone-300 pb-5' : ''}>
                <div className="mb-1.5 flex items-start justify-between gap-4">
                  <h3 className="font-mono text-[15px] font-medium text-stone-700">{item.label}</h3>
                  <span className="rounded-sm bg-green-100 px-2.5 py-0.5 font-mono text-[13px] font-medium lowercase text-lime-900">
                    {item.status}
                  </span>
                </div>
                <p className="max-w-[48ch] text-[15px] leading-7 text-stone-500">{item.description}</p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}

export default HeroSection
