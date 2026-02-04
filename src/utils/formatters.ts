// Number formatting utilities

export function formatCurrency(value: number, compact = false): string {
  if (compact) {
    if (Math.abs(value) >= 1000000) {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 1,
        notation: 'compact',
      }).format(value);
    }
    if (Math.abs(value) >= 1000) {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
      }).format(value);
    }
  }
  
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number, decimals = 1): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

export function formatMonths(months: number | null): string {
  if (months === null) return '—';
  
  const years = Math.floor(months / 12);
  const remainingMonths = Math.round(months % 12);
  
  if (years === 0) {
    return `${remainingMonths} мес.`;
  }
  
  if (remainingMonths === 0) {
    return `${years} ${getYearWord(years)}`;
  }
  
  return `${years} ${getYearWord(years)} ${remainingMonths} мес.`;
}

function getYearWord(years: number): string {
  if (years === 1) return 'год';
  if (years >= 2 && years <= 4) return 'года';
  return 'лет';
}

export function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
