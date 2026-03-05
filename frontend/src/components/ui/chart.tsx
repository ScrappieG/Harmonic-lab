import * as React from "react"
import * as RechartsPrimitive from "recharts"
import type { TooltipContentProps } from "recharts"
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"

import { cn } from "@/lib/utils"

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode
    color?: string
  }
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"]
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-stone-500 [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-stone-300 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-stone-400 [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const entries = Object.entries(config).filter(([, value]) => value.color)
  if (!entries.length) return null

  const cssVars = entries
    .map(([key, value]) => `  --color-${key}: ${value.color};`)
    .join("\n")

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `[data-chart=${id}] {\n${cssVars}\n}`,
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

type ChartTooltipContentProps = React.ComponentProps<"div"> &
  Partial<TooltipContentProps<ValueType, NameType>> & {
  hideLabel?: boolean
  hideIndicator?: boolean
  indicator?: "dot" | "line"
  nameKey?: string
  labelKey?: string
}

const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  (
    {
      active,
      payload,
      className,
      hideLabel = false,
      hideIndicator = false,
      indicator = "dot",
      formatter,
      labelFormatter,
      nameKey,
      label,
      labelKey,
    },
    ref
  ) => {
    const { config } = useChart()

    if (!active || !payload?.length) {
      return null
    }

    const getItemConfig = (item: { dataKey?: unknown; name?: unknown }) => {
      const key = String(nameKey ?? item.name ?? item.dataKey ?? "")
      return config[key] ?? { label: key }
    }

    const tooltipLabel = hideLabel
      ? null
      : labelFormatter?.(label, payload) ?? (labelKey ? payload[0]?.payload?.[labelKey] : label)

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-32 gap-2 rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-xs shadow-sm",
          className
        )}
      >
        {tooltipLabel ? <div className="font-medium text-stone-800">{tooltipLabel}</div> : null}
        <div className="grid gap-1">
          {payload.map((item, index) => {
            const itemConfig = getItemConfig(item)
            const indicatorColor =
              item.color ?? item.payload?.fill ?? item.stroke ?? "var(--color-muted-foreground)"
            const formattedValue =
              formatter && item.value !== undefined
                ? formatter(item.value, item.name, item, index, payload)
                : item.value
            const renderedValue = Array.isArray(formattedValue) ? formattedValue[0] : formattedValue

            return (
              <div key={`${item.dataKey ?? item.name ?? index}`} className="flex items-center gap-2 text-stone-700">
                {!hideIndicator ? (
                  <span
                    className={cn(
                      "shrink-0 rounded-[2px]",
                      indicator === "dot" ? "size-2" : "h-0.5 w-3"
                    )}
                    style={{ backgroundColor: indicatorColor }}
                  />
                ) : null}
                <span className="text-stone-500">{itemConfig.label ?? item.name}</span>
                <span className="ml-auto font-medium text-stone-900">{renderedValue}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

export { ChartContainer, ChartTooltip, ChartTooltipContent }
