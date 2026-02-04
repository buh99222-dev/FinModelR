import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/utils/formatters';
import type { MonthlyCashFlow } from '@/types/financial';

interface CashFlowTableProps {
  data: MonthlyCashFlow[];
  capex: number;
}

export function CashFlowTable({ data, capex }: CashFlowTableProps) {
  const [page, setPage] = useState(0);
  const monthsPerPage = 12;
  const totalPages = Math.ceil(data.length / monthsPerPage);
  
  const displayedData = data.slice(page * monthsPerPage, (page + 1) * monthsPerPage);
  
  const rows = [
    { key: 'operating', label: 'Операционный денежный поток', getValue: (d: MonthlyCashFlow) => d.operatingCashFlow },
    { key: 'investment', label: 'Инвестиционный денежный поток', getValue: (d: MonthlyCashFlow) => d.investmentCashFlow },
    { key: 'financing', label: 'Финансовый денежный поток', getValue: (d: MonthlyCashFlow) => d.financingCashFlow },
    { key: 'net', label: 'Чистый денежный поток', getValue: (d: MonthlyCashFlow) => d.netCashFlow, isHighlight: true },
    { key: 'cumulative', label: 'Накопленный денежный поток', getValue: (d: MonthlyCashFlow) => d.cumulativeCashFlow, isTotal: true },
  ];

  const getYearLabel = (monthIndex: number) => {
    return `Год ${Math.floor(monthIndex / 12) + 1}`;
  };

  return (
    <div className="chart-container overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">
            Отчет о движении денежных средств (ОДДС)
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Начальные инвестиции: {formatNumber(capex)} ₽
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {getYearLabel(page * monthsPerPage)}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="financial-table">
          <thead>
            <tr>
              <th className="sticky left-0 bg-muted z-10">Показатель</th>
              {displayedData.map(d => (
                <th key={d.month} className="text-center min-w-[90px]">
                  Мес. {d.month}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr 
                key={row.key}
                className={`
                  ${row.isTotal ? 'row-total' : ''}
                  ${row.isHighlight ? 'row-highlight' : ''}
                `}
              >
                <td className="row-name">{row.label}</td>
                {displayedData.map(d => {
                  const value = row.getValue(d);
                  return (
                    <td 
                      key={d.month}
                      className={value >= 0 ? 'positive' : 'negative'}
                    >
                      {formatNumber(value)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
