'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface VisitsChartProps {
  data: { date: string; visits: number }[]
  primaryColor: string
}

export function VisitsChart({ data, primaryColor }: VisitsChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    label: d.date.slice(5), // MM-DD
  }))

  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={formatted} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <defs>
          <linearGradient id="visitGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3} />
            <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0ece5" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#8B7355' }}
          tickLine={false}
          axisLine={false}
          interval={4}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#8B7355' }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid #E8E0D0',
            fontSize: '12px',
          }}
          formatter={(v) => [`${v} visitas`, 'Visitas']}
        />
        <Area
          type="monotone"
          dataKey="visits"
          stroke={primaryColor}
          strokeWidth={2}
          fill="url(#visitGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
