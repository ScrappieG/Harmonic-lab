import { motion, useReducedMotion } from 'framer-motion'

const workflowSteps = [
  {
    step: '01',
    title: 'Pick a problem',
    description:
      'Install the ArticuLeet Chrome extension and choose a problem on LeetCode to solve.',
  },
  {
    step: '02',
    title: 'Solve and narrate',
    description:
      'Start a new session and work through the problem independently. Speak your reasoning as you go in sections.',
  },
  {
    step: '03',
    title: 'Review feedback',
    description:
      'Receive a structured breakdown of your communication so you can see what was precise and what needs tightening.',
  },
]

function WorkflowSection() {
  const reduceMotion = useReducedMotion() ?? false

  return (
    <section id="how-it-works" className="bg-stone-200/70 py-20 md:py-24">
      <div className="layout-shell">
        <p className="brand-mono text-xs uppercase tracking-widest text-stone-400">Workflow</p>

        <h2 className="brand-serif mt-5 max-w-xl text-3xl leading-none tracking-tight text-stone-900 sm:text-6xl lg:text-5xl">
          Three simple steps:
        </h2>

        <motion.div
          className="workflow-grid-shell mt-12"
          initial={reduceMotion ? false : 'hidden'}
          whileInView={reduceMotion ? undefined : 'visible'}
          viewport={{ once: false, amount: 0.45 }}
        >
          <motion.span
            aria-hidden
            className="workflow-grid-line workflow-grid-line-top"
            variants={
              reduceMotion
                ? undefined
                : {
                    hidden: { scaleX: 0, opacity: 0.5 },
                    visible: { scaleX: 1, opacity: 1, transition: { duration: 1.2 } },
                  }
            }
            style={{ transformOrigin: 'left center' }}
          />
          <motion.span
            aria-hidden
            className="workflow-grid-line workflow-grid-line-bottom"
            variants={
              reduceMotion
                ? undefined
                : {
                    hidden: { scaleX: 0, opacity: 0.5 },
                    visible: { scaleX: 1, opacity: 1, transition: { duration: 1.2, delay: 0.12 } },
                  }
            }
            style={{ transformOrigin: 'left center' }}
          />
          <motion.span
            aria-hidden
            className="workflow-grid-line workflow-grid-line-v0"
            variants={
              reduceMotion
                ? undefined
                : {
                    hidden: { scaleY: 0, opacity: 0.5 },
                    visible: { scaleY: 1, opacity: 1, transition: { duration: 0.9, delay: 0.24 } },
                  }
            }
            style={{ transformOrigin: 'center top' }}
          />
          <motion.span
            aria-hidden
            className="workflow-grid-line workflow-grid-line-v1"
            variants={
              reduceMotion
                ? undefined
                : {
                    hidden: { scaleY: 0, opacity: 0.5 },
                    visible: { scaleY: 1, opacity: 1, transition: { duration: 0.9, delay: 0.32 } },
                  }
            }
            style={{ transformOrigin: 'center top' }}
          />
          <motion.span
            aria-hidden
            className="workflow-grid-line workflow-grid-line-v2"
            variants={
              reduceMotion
                ? undefined
                : {
                    hidden: { scaleY: 0, opacity: 0.5 },
                    visible: { scaleY: 1, opacity: 1, transition: { duration: 0.9, delay: 0.4 } },
                  }
            }
            style={{ transformOrigin: 'center top' }}
          />
          <motion.span
            aria-hidden
            className="workflow-grid-line workflow-grid-line-v3"
            variants={
              reduceMotion
                ? undefined
                : {
                    hidden: { scaleY: 0, opacity: 0.5 },
                    visible: { scaleY: 1, opacity: 1, transition: { duration: 0.9, delay: 0.48 } },
                  }
            }
            style={{ transformOrigin: 'center top' }}
          />

          <div className="workflow-grid">
            {workflowSteps.map((item) => (
              <article key={item.step} className="workflow-grid-cell">
                <p className="brand-mono text-sm font-semibold text-lime-800/60">{item.step}</p>
                <h3 className="brand-serif mt-4 text-2xl leading-tight text-stone-800">{item.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-stone-500">{item.description}</p>
              </article>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default WorkflowSection
