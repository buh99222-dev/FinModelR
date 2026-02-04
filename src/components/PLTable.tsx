import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/utils/formatters';
import type { MonthlyPL } from '@/types/financial';

interface PLTableProps {
  data: MonthlyPL[];
}

export function PLTable({ data }: PLTableProps) {
  const [page, setPage] = useState(0);
  const monthsPerPage = 12;
  const totalPages = Math.ceil(data.length / monthsPerPage);
  
  const displayedData = data.slice(page * monthsPerPage, (page + 1) * monthsPerPage);
  
  const rows = [
    { key: 'revenue', label: 'Выручка', getValue: (d: MonthlyPL) => d.revenue, isTotal: true },
    { key: 'variableCosts', label: 'Переменные расходы', getValue: (d: MonthlyPL) => -d.variableCosts },
    { key: 'grossProfit', label: 'Валовая прибыль', getValue: (d: MonthlyPL) => d.grossProfit, isHighlight: true },
    { key: 'rent', label: '  Аренда', getValue: (d: MonthlyPL) => -d.rent, isSubRow: true },
    { key: 'payroll', label: '  ФОТ с налогами', getValue: (d: MonthlyPL) => -d.payroll, isSubRow: true },
    { key: 'otherFixed', label: '  Прочие фиксированные', getValue: (d: MonthlyPL) => -d.otherFixed, isSubRow: true },
    { key: 'fixedCosts', label: 'Фиксированные расходы', getValue: (d: MonthlyPL) => -d.fixedCosts },
    { key: 'depreciation', label: 'Амортизация', getValue: (d: MonthlyPL) => -d.depreciation },
    { key: 'ebit', label: 'EBIT (операционная прибыль)', getValue: (d: MonthlyPL) => d.ebit, isHighlight: true },
    { key: 'tax', label: 'Налог на прибыль', getValue: (d: MonthlyPL) => -d.tax },
    { key: 'netProfit', label: 'Чистая прибыль', getValue: (d: MonthlyPL) => d.netProfit, isTotal: true },
  ];

  const getYearLabel = (monthIndex: number) => {
    return `Год ${Math.floor(monthIndex / 12) + 1}`;
  };

  return (
    <div className="chart-container overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">
          Отчет о прибылях и убытках (P&L)
        </h3>
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
                <td className={`row-name ${row.isSubRow ? 'sub-row' : ''}`}>
                  {row.label}
                </td>
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
