import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';
import { formatNumber, formatCurrency } from '@/utils/formatters';
import type { BreakEvenAnalysis } from '@/types/financial';

interface BreakEvenChartProps {
  analysis: BreakEvenAnalysis;
}

export function BreakEvenChart({ analysis }: BreakEvenChartProps) {
  // Generate data points for the chart
  const maxGuests = Math.max(analysis.currentGuests * 1.5, analysis.breakEvenGuests * 1.5);
  const step = Math.ceil(maxGuests / 20);
  
  const data = [];
  for (let guests = 0; guests <= maxGuests; guests += step) {
    const revenue = guests * (analysis.currentRevenue / analysis.currentGuests);
    const variableCosts = revenue * (1 - analysis.marginPercentage / 100);
    const totalCosts = analysis.fixedCostsMonthly + variableCosts;
    const profit = revenue - totalCosts;
    
    data.push({
      guests,
      revenue,
      totalCosts,
      profit,
      fixedCosts: analysis.fixedCostsMonthly,
    });
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground mb-2">
            {formatNumber(label)} гостей
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Точка безубыточности</h3>
          <p className="text-xs text-muted-foreground mt-1">
            График зависимости прибыли от количества гостей
          </p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-muted-foreground">Выручка</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Расходы</span>
          </div>
        </div>
      </div>
      
      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="text-xs text-muted-foreground uppercase">BEP (гостей)</div>
          <div className="text-lg font-bold text-foreground">
            {formatNumber(analysis.breakEvenGuests)}
          </div>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="text-xs text-muted-foreground uppercase">BEP (выручка)</div>
          <div className="text-lg font-bold text-foreground">
            {formatCurrency(analysis.breakEvenRevenue, true)}
          </div>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="text-xs text-muted-foreground uppercase">Маржа на гостя</div>
          <div className="text-lg font-bold text-foreground">
            {formatCurrency(analysis.marginPerGuest)}
          </div>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="text-xs text-muted-foreground uppercase">Запас прочности</div>
          <div className={`text-lg font-bold ${analysis.safetyMarginPercent >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatNumber(analysis.safetyMarginPercent, 1)}%
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="guests" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(v) => formatNumber(v)}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine 
              x={analysis.breakEvenGuests} 
              stroke="hsl(var(--info))" 
              strokeDasharray="5 5"
              label={{ 
                value: 'BEP', 
                position: 'top',
                fill: 'hsl(var(--info))',
                fontSize: 12
              }}
            />
            <ReferenceLine 
              x={analysis.currentGuests} 
              stroke="hsl(var(--primary))" 
              strokeDasharray="5 5"
              label={{ 
                value: 'Текущее', 
                position: 'top',
                fill: 'hsl(var(--primary))',
                fontSize: 12
              }}
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
              dataKey="totalCosts" 
              name="Общие расходы"
              stroke="hsl(var(--destructive))" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="fixedCosts" 
              name="Фикс. расходы"
              stroke="hsl(var(--muted-foreground))" 
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
