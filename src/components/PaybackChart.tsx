import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { formatNumber, formatCurrency, formatPercent, formatMonths } from '@/utils/formatters';
import type { MonthlyCashFlow, InvestmentMetrics } from '@/types/financial';

interface PaybackChartProps {
  cashFlowData: MonthlyCashFlow[];
  metrics: InvestmentMetrics;
  capex: number;
  discountRate: number;
}

export function PaybackChart({ cashFlowData, metrics, capex, discountRate }: PaybackChartProps) {
  const data = cashFlowData.map(cf => ({
    month: cf.month,
    cumulative: cf.cumulativeCashFlow,
    label: `Мес. ${cf.month}`,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground mb-1">
            Месяц {label}
          </p>
          <p className={`text-sm font-semibold ${value >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatCurrency(value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Окупаемость и NPV</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Накопленный денежный поток за период
          </p>
        </div>
      </div>

      {/* Key investment metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="text-xs text-muted-foreground uppercase">Инвестиции</div>
          <div className="text-lg font-bold text-foreground">
            {formatCurrency(capex, true)}
          </div>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="text-xs text-muted-foreground uppercase">Окупаемость</div>
          <div className={`text-lg font-bold ${metrics.paybackMonths ? 'text-success' : 'text-destructive'}`}>
            {formatMonths(metrics.paybackMonths)}
          </div>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="text-xs text-muted-foreground uppercase">NPV ({discountRate}%)</div>
          <div className={`text-lg font-bold ${metrics.npv >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatCurrency(metrics.npv, true)}
          </div>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="text-xs text-muted-foreground uppercase">IRR</div>
          <div className={`text-lg font-bold ${metrics.irr !== null && metrics.irr > discountRate ? 'text-success' : 'text-destructive'}`}>
            {metrics.irr !== null ? formatPercent(metrics.irr) : 'Н/Д'}
          </div>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="text-xs text-muted-foreground uppercase">PI (индекс)</div>
          <div className={`text-lg font-bold ${metrics.profitabilityIndex >= 1 ? 'text-success' : 'text-destructive'}`}>
            {formatNumber(metrics.profitabilityIndex, 2)}
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorNegative" x1="0" y1="1" x2="0" y2="0">
                <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="hsl(var(--foreground))" strokeWidth={2} />
            {metrics.paybackMonths && (
              <ReferenceLine 
                x={Math.ceil(metrics.paybackMonths)} 
                stroke="hsl(var(--primary))" 
                strokeDasharray="5 5"
                label={{ 
                  value: 'Окупаемость', 
                  position: 'top',
                  fill: 'hsl(var(--primary))',
                  fontSize: 12
                }}
              />
            )}
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#colorPositive)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Interpretation */}
      <div className="mt-4 p-4 bg-muted/30 rounded-lg">
        <h4 className="font-medium text-foreground mb-2">Интерпретация</h4>
        <div className="text-sm text-muted-foreground space-y-1">
          {metrics.npv >= 0 ? (
            <p className="text-success">
              ✓ NPV положительный — проект экономически эффективен при ставке {discountRate}%
            </p>
          ) : (
            <p className="text-destructive">
              ✗ NPV отрицательный — проект не окупится при ставке {discountRate}%
            </p>
          )}
          {metrics.irr !== null && metrics.irr > discountRate ? (
            <p className="text-success">
              ✓ IRR ({formatPercent(metrics.irr)}) выше ставки дисконтирования ({discountRate}%)
            </p>
          ) : metrics.irr !== null ? (
            <p className="text-warning">
              ⚠ IRR ({formatPercent(metrics.irr)}) ниже ставки дисконтирования
            </p>
          ) : null}
          {metrics.profitabilityIndex >= 1 ? (
            <p className="text-success">
              ✓ Индекс рентабельности {formatNumber(metrics.profitabilityIndex, 2)} ≥ 1 — каждый вложенный рубль приносит {formatNumber((metrics.profitabilityIndex - 1) * 100, 0)} коп. прибыли
            </p>
          ) : (
            <p className="text-destructive">
              ✗ Индекс рентабельности меньше 1 — инвестиции не окупаются
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
