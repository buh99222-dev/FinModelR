import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatNumber, formatCurrency } from '@/utils/formatters';
import type { MonthlyPL } from '@/types/financial';

interface RevenueChartProps {
  data: MonthlyPL[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data.map(pl => ({
    month: pl.month,
    revenue: pl.revenue,
    netProfit: pl.netProfit,
    grossProfit: pl.grossProfit,
    year: Math.ceil(pl.month / 12),
  }));

  // Aggregate by year for bar chart
  const yearlyData = [1, 2, 3].map(year => {
    const yearData = data.filter(pl => Math.ceil(pl.month / 12) === year);
    return {
      year: `Год ${year}`,
      revenue: yearData.reduce((sum, pl) => sum + pl.revenue, 0),
      netProfit: yearData.reduce((sum, pl) => sum + pl.netProfit, 0),
      grossProfit: yearData.reduce((sum, pl) => sum + pl.grossProfit, 0),
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground mb-2">
            {typeof label === 'number' ? `Месяц ${label}` : label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value, true)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly trend */}
      <div className="chart-container">
        <div className="mb-4">
          <h3 className="font-semibold text-foreground">Динамика по месяцам</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Выручка и чистая прибыль
          </p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                formatter={(value) => <span className="text-foreground">{value}</span>}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                name="Выручка"
                stroke="hsl(var(--success))" 
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="netProfit" 
                name="Чистая прибыль"
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Yearly comparison */}
      <div className="chart-container">
        <div className="mb-4">
          <h3 className="font-semibold text-foreground">Сравнение по годам</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Годовая выручка и прибыль
          </p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yearlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="year" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                formatter={(value) => <span className="text-foreground">{value}</span>}
              />
              <Bar 
                dataKey="revenue" 
                name="Выручка" 
                fill="hsl(var(--success))" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="netProfit" 
                name="Чистая прибыль" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
