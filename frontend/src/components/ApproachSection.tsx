const approachCards = [
  {
    title: 'Approach',
    value: 'No mock interviews',
  },
  {
    title: 'Input',
    value: 'Your spoken reasoning',
  },
  {
    title: 'Output',
    value: 'Structured feedback',
  },
]

function ApproachSection() {
  return (
    <section id="approach" className="bg-stone-100 py-20 md:py-24">
      <div className="layout-shell grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="brand-mono text-xs uppercase tracking-widest text-stone-400">Approach</p>
          <h2 className="brand-serif mt-5 max-w-md text-3xl leading-none tracking-tight text-stone-900 sm:text-6xl lg:text-5xl">
            Solving is half
            <br />
            the problem.
          </h2>
        </div>

        <div>
          <p className="max-w-2xl text-base leading-relaxed text-stone-500 sm:text-lg">
            Most interview prep tools optimize for correctness. In real interviews, how you explain your approach
            matters as much as the solution itself.
          </p>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-stone-500 sm:text-lg">
            ArticuLeet is not a mock interview tool. There is no AI interviewer and no simulated conversation. You
            solve at your own pace, narrate your reasoning, and receive structured communication feedback.
          </p>

          <div className="mt-10 grid overflow-hidden rounded-lg border border-stone-300 bg-stone-100 shadow-sm md:grid-cols-3">
            {approachCards.map((card, index) => (
              <div key={card.title} className={index > 0 ? 'border-t border-stone-300 p-5 md:border-l md:border-t-0' : 'p-5'}>
                <p className="brand-mono text-sm uppercase tracking-wide text-lime-800/60">{card.title}</p>
                <p className="mt-3 text-md leading-snug text-stone-800 lg:text-lg">{card.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ApproachSection
