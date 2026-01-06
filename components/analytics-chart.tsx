"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

interface ChartData {
  label: string
  value: number
  color: string
}

export function BarChart({ title, data, height = 200 }: { title: string; data: ChartData[]; height?: number }) {
  const maxValue = Math.max(...data.map((d) => d.value))

  return (
    <Card className="p-6">
      <h3 className="mb-6 font-semibold">{title}</h3>
      <div className="flex items-end gap-4" style={{ height }}>
        {data.map((item, index) => {
          const heightPercent = (item.value / maxValue) * 100

          return (
            <div key={index} className="flex flex-1 flex-col items-center gap-2">
              <div className="text-sm font-semibold">{item.value}</div>
              <div
                className={`w-full rounded-t-lg ${item.color} transition-all hover:opacity-80`}
                style={{ height: `${heightPercent}%` }}
              />
              <div className="text-xs text-muted-foreground">{item.label}</div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export function PieChart({ title, data }: { title: string; data: ChartData[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="p-6">
      <h3 className="mb-6 font-semibold">{title}</h3>
      <div className="flex items-center gap-8">
        <div className="relative">
          <svg width="150" height="150" viewBox="0 0 32 32" className="rotate-[-90deg]">
            {
              data.reduce(
                (acc, item, index) => {
                  const percent = (item.value / total) * 100
                  const offset = acc.offset

                  acc.elements.push(
                    <circle
                      key={index}
                      r="16"
                      cx="16"
                      cy="16"
                      fill="transparent"
                      stroke={item.color.replace("bg-", "").replace("/10", "")}
                      strokeWidth="32"
                      strokeDasharray={`${percent} ${100 - percent}`}
                      strokeDashoffset={-offset}
                      className="transition-all"
                    />,
                  )

                  acc.offset += percent

                  return acc
                },
                { offset: 0, elements: [] as React.ReactNode[] },
              ).elements
            }
          </svg>
        </div>

        <div className="flex-1 space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${item.color}`} />
                <span className="text-sm">{item.label}</span>
              </div>
              <span className="text-sm font-semibold">
                {item.value} ({Math.round((item.value / total) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

export function LineChart({
  title,
  data,
  height = 150,
}: {
  title: string
  data: { label: string; value: number }[]
  height?: number
}) {
  const maxValue = Math.max(...data.map((d) => d.value))
  const minValue = Math.min(...data.map((d) => d.value))

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 300
    const y = height - ((item.value - minValue) / (maxValue - minValue)) * height
    return `${x},${y}`
  })

  const trend = data[data.length - 1].value > data[0].value

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <div className={`flex items-center gap-1 text-sm ${trend ? "text-success" : "text-destructive"}`}>
          {trend ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          <span>{Math.abs(Math.round(((data[data.length - 1].value - data[0].value) / data[0].value) * 100))}%</span>
        </div>
      </div>

      <svg width="100%" height={height} viewBox={`0 0 300 ${height}`} preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke="oklch(0.55 0.22 255)"
          strokeWidth="2"
          points={points.join(" ")}
          className="transition-all"
        />
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 300
          const y = height - ((item.value - minValue) / (maxValue - minValue)) * height
          return <circle key={index} cx={x} cy={y} r="4" fill="oklch(0.55 0.22 255)" />
        })}
      </svg>

      <div className="mt-4 flex justify-between text-xs text-muted-foreground">
        {data.map((item, index) => (
          <span key={index}>{item.label}</span>
        ))}
      </div>
    </Card>
  )
}
