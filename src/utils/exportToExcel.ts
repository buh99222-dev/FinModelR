import type { MonthlyPL, MonthlyCashFlow, InputParameters } from '@/types/financial';

function escapeCSV(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatNumberForCSV(value: number): string {
  return value.toFixed(2).replace('.', ',');
}

export function exportToCSV(
  inputs: InputParameters,
  plData: MonthlyPL[],
  cashFlowData: MonthlyCashFlow[],
  breakEvenGuests: number,
  breakEvenRevenue: number,
  npv: number,
  irr: number | null,
  paybackMonths: number | null
): void {
  const rows: string[] = [];
  
  // Header
  rows.push('ФИНАНСОВАЯ МОДЕЛЬ РЕСТОРАНА');
  rows.push('');
  
  // Input parameters
  rows.push('=== ВХОДНЫЕ ПАРАМЕТРЫ ===');
  rows.push(`Площадь зала (м²);${inputs.floorArea}`);
  rows.push(`Аренда за м² (руб.);${formatNumberForCSV(inputs.rentPerSqm)}`);
  rows.push(`Количество мест;${inputs.seatsCount}`);
  rows.push(`Средний чек (руб.);${formatNumberForCSV(inputs.averageCheck)}`);
  rows.push(`Гостей в день;${inputs.guestsPerDay}`);
  rows.push(`Дней работы в месяц;${inputs.workDaysPerMonth}`);
  rows.push(`CAPEX (руб.);${formatNumberForCSV(inputs.capex)}`);
  rows.push(`Срок службы оборудования (лет);${inputs.equipmentLifeYears}`);
  rows.push(`Переменные расходы (%);${inputs.variableCostsPercent}`);
  rows.push(`Налог на прибыль (%);${inputs.taxRate}`);
  rows.push(`Ставка дисконтирования (%);${inputs.discountRate}`);
  rows.push('');
  
  // Staff
  rows.push('=== ШТАТНОЕ РАСПИСАНИЕ ===');
  rows.push('Должность;Количество;Оклад;Налоги (%);Итого с налогами');
  inputs.staff.forEach(pos => {
    const total = pos.salary * pos.count * (1 + pos.taxRate / 100);
    rows.push(`${escapeCSV(pos.position)};${pos.count};${formatNumberForCSV(pos.salary)};${pos.taxRate};${formatNumberForCSV(total)}`);
  });
  rows.push('');
  
  // Key metrics
  rows.push('=== КЛЮЧЕВЫЕ ПОКАЗАТЕЛИ ===');
  rows.push(`Точка безубыточности (гостей/мес);${formatNumberForCSV(breakEvenGuests)}`);
  rows.push(`Точка безубыточности (руб./мес);${formatNumberForCSV(breakEvenRevenue)}`);
  rows.push(`NPV;${formatNumberForCSV(npv)}`);
  rows.push(`IRR (%);${irr !== null ? formatNumberForCSV(irr) : 'Н/Д'}`);
  rows.push(`Срок окупаемости (мес);${paybackMonths !== null ? formatNumberForCSV(paybackMonths) : 'Н/Д'}`);
  rows.push('');
  
  // P&L Table
  rows.push('=== ОТЧЕТ О ПРИБЫЛЯХ И УБЫТКАХ (ОПиУ) ===');
  const plHeaders = ['Месяц', 'Выручка', 'Переменные расходы', 'Валовая прибыль', 'Фикс. расходы', 'Амортизация', 'EBIT', 'Налог', 'Чистая прибыль'];
  rows.push(plHeaders.join(';'));
  
  plData.forEach(pl => {
    rows.push([
      pl.month,
      formatNumberForCSV(pl.revenue),
      formatNumberForCSV(pl.variableCosts),
      formatNumberForCSV(pl.grossProfit),
      formatNumberForCSV(pl.fixedCosts),
      formatNumberForCSV(pl.depreciation),
      formatNumberForCSV(pl.ebit),
      formatNumberForCSV(pl.tax),
      formatNumberForCSV(pl.netProfit),
    ].join(';'));
  });
  rows.push('');
  
  // Cash Flow Table
  rows.push('=== ОТЧЕТ О ДВИЖЕНИИ ДЕНЕЖНЫХ СРЕДСТВ (ОДДС) ===');
  const cfHeaders = ['Месяц', 'Операционный поток', 'Инвестиционный поток', 'Финансовый поток', 'Чистый поток', 'Накопленный поток'];
  rows.push(cfHeaders.join(';'));
  
  cashFlowData.forEach(cf => {
    rows.push([
      cf.month,
      formatNumberForCSV(cf.operatingCashFlow),
      formatNumberForCSV(cf.investmentCashFlow),
      formatNumberForCSV(cf.financingCashFlow),
      formatNumberForCSV(cf.netCashFlow),
      formatNumberForCSV(cf.cumulativeCashFlow),
    ].join(';'));
  });
  
  // Create and download file
  const BOM = '\uFEFF';
  const csvContent = BOM + rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `financial_model_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
