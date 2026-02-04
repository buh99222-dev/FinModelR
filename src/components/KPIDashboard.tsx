import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, BarChart3, Clock } from 'lucide-react';
import { formatCurrency, formatPercent, formatMonths } from '@/utils/formatters';
import type { FinancialSummary, BreakEvenAnalysis, InvestmentMetrics } from '@/types/financial';

interface KPIDashboardProps {
  summary: FinancialSummary;
  breakEven: BreakEvenAnalysis;
  investment: InvestmentMetrics;
}

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  variant: 'revenue' | 'profit' | 'break-even' | 'margin';
  trend?: 'up' | 'down' | 'neutral';
}

function KPICard({ title, value, subtitle, icon, variant, trend }: KPICardProps) {
  const variantClasses = {
    revenue: 'kpi-card-revenue',
    profit: 'kpi-card-profit',
    'break-even': 'kpi-card-break-even',
    margin: 'kpi-card-margin',
  };

  const valueColors = {
    revenue: 'text-success',
    profit: 'text-primary',
    'break-even': 'text-info',
    margin: 'text-warning',
  };

  return (
    <div className={`kpi-card ${variantClasses[variant]} animate-fade-in`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-muted-foreground">{icon}</span>
        {trend && (
          <span className={trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground'}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : trend === 'down' ? <TrendingDown className="w-4 h-4" /> : null}
          </span>
        )}
      </div>
      <div className={`text-2xl font-extrabold ${valueColors[variant]} mb-1`}>
        {value}
      </div>
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {title}
      </div>
      {subtitle && (
        <div className="text-xs text-muted-foreground mt-2">
          {subtitle}
        </div>
      )}
    </div>
  );
}

export function KPIDashboard({ summary, breakEven, investment }: KPIDashboardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <KPICard
        title="Выручка в месяц"
        value={formatCurrency(summary.monthlyRevenue, true)}
        subtitle={`${formatCurrency(summary.yearlyRevenue, true)} в год`}
        icon={<DollarSign className="w-5 h-5" />}
        variant="revenue"
        trend="up"
      />
      
      <KPICard
        title="Чистая прибыль"
        value={formatCurrency(summary.monthlyProfit, true)}
        subtitle={`Рентабельность ${formatPercent(summary.profitMargin)}`}
        icon={<BarChart3 className="w-5 h-5" />}
        variant="profit"
        trend={summary.monthlyProfit > 0 ? 'up' : 'down'}
      />
      
      <KPICard
        title="Точка безубыточности"
        value={formatCurrency(breakEven.breakEvenRevenue, true)}
        subtitle={`${Math.round(breakEven.breakEvenGuests)} гостей/мес`}
        icon={<Target className="w-5 h-5" />}
        variant="break-even"
      />
      
      <KPICard
        title="Окупаемость"
        value={formatMonths(investment.paybackMonths)}
        subtitle={`NPV: ${formatCurrency(investment.npv, true)}`}
        icon={<Clock className="w-5 h-5" />}
        variant="margin"
        trend={investment.paybackMonths && investment.paybackMonths < 24 ? 'up' : 'neutral'}
      />
    </div>
  );
}
