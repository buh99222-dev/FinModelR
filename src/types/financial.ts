// Financial Model Types for Restaurant/Cafe

export interface StaffPosition {
  id: string;
  position: string;
  count: number;
  salary: number;
  taxRate: number; // % of salary for taxes
}

// Seasonality coefficients for each month (1.0 = 100% of base)
export interface SeasonalityProfile {
  name: string;
  coefficients: number[]; // 12 values for Jan-Dec
}

// Scenario for "what if" analysis
export interface Scenario {
  id: string;
  name: string;
  description: string;
  // Multipliers relative to base inputs (1.0 = no change)
  revenueMultiplier: number; // affects guests per day
  costMultiplier: number; // affects variable costs %
  rentMultiplier: number; // affects rent
}

export interface InputParameters {
  // Space and rent
  floorArea: number; // м²
  rentPerSqm: number; // руб./м²/месяц
  seatsCount: number; // количество мест (авто: площадь / 1.5)
  
  // Revenue parameters
  averageCheck: number; // руб.
  guestsPerDay: number;
  workDaysPerMonth: number;
  
  // CAPEX
  capex: number; // единовременные вложения
  equipmentLifeYears: number; // срок службы (по умолчанию 5 лет)
  
  // Staff
  staff: StaffPosition[];
  
  // Costs
  otherFixedCosts: number; // прочие фиксированные расходы
  variableCostsPercent: number; // % от выручки
  
  // Taxes - УСН 15% from profit, VAT 5% if revenue > 20M
  usnRate: number; // УСН rate (default 15%)
  vatRate: number; // НДС rate (default 5%)
  vatThreshold: number; // Порог выручки для НДС (default 20,000,000)
  
  // Discounting
  discountRate: number; // % ставка дисконтирования (годовая)
  
  // Horizon
  horizonMonths: number; // горизонт расчета (по умолчанию 36)
  
  // Seasonality
  seasonalityEnabled: boolean;
  seasonality: number[]; // 12 coefficients for each month
  
  // Scenario
  activeScenarioId: string;
}

export interface MonthlyPL {
  month: number;
  revenue: number;
  vat: number; // НДС (if applicable)
  revenueAfterVat: number;
  variableCosts: number;
  grossProfit: number;
  fixedCosts: number;
  rent: number;
  payroll: number;
  otherFixed: number;
  depreciation: number;
  ebit: number;
  usn: number; // УСН tax
  netProfit: number;
  cumulativeRevenue: number; // for VAT threshold tracking
  seasonalityCoef: number;
}

export interface MonthlyCashFlow {
  month: number;
  operatingCashFlow: number;
  investmentCashFlow: number;
  financingCashFlow: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
}

export interface BreakEvenAnalysis {
  marginPerGuest: number;
  breakEvenGuests: number;
  breakEvenRevenue: number;
  marginPercentage: number;
  fixedCostsMonthly: number;
  currentGuests: number;
  currentRevenue: number;
  safetyMarginPercent: number;
}

export interface InvestmentMetrics {
  npv: number;
  irr: number | null;
  paybackMonths: number | null;
  roi: number;
  profitabilityIndex: number;
}

export interface FinancialSummary {
  monthlyRevenue: number;
  monthlyProfit: number;
  yearlyRevenue: number;
  yearlyProfit: number;
  profitMargin: number;
  breakEvenMonths: number | null;
}

export const defaultSeasonality: number[] = [
  0.85, // Январь - пост-праздничный спад
  0.80, // Февраль - низкий сезон
  0.90, // Март - начало весны
  0.95, // Апрель
  1.00, // Май
  1.05, // Июнь - летний сезон
  1.10, // Июль - пик
  1.10, // Август - пик
  1.00, // Сентябрь
  0.95, // Октябрь
  0.90, // Ноябрь
  1.20, // Декабрь - праздники
];

export const defaultScenarios: Scenario[] = [
  {
    id: 'pessimistic',
    name: 'Пессимистичный',
    description: 'Снижение выручки на 20%, рост расходов на 10%',
    revenueMultiplier: 0.8,
    costMultiplier: 1.1,
    rentMultiplier: 1.0,
  },
  {
    id: 'base',
    name: 'Базовый',
    description: 'Текущие параметры без изменений',
    revenueMultiplier: 1.0,
    costMultiplier: 1.0,
    rentMultiplier: 1.0,
  },
  {
    id: 'optimistic',
    name: 'Оптимистичный',
    description: 'Рост выручки на 20%, снижение расходов на 5%',
    revenueMultiplier: 1.2,
    costMultiplier: 0.95,
    rentMultiplier: 1.0,
  },
];

export const defaultInputs: InputParameters = {
  floorArea: 100,
  rentPerSqm: 2000,
  seatsCount: 67, // 100 / 1.5
  averageCheck: 800,
  guestsPerDay: 80,
  workDaysPerMonth: 30,
  capex: 5000000,
  equipmentLifeYears: 5,
  staff: [
    { id: '1', position: 'Управляющий', count: 1, salary: 80000, taxRate: 30 },
    { id: '2', position: 'Шеф-повар', count: 1, salary: 70000, taxRate: 30 },
    { id: '3', position: 'Повар', count: 3, salary: 45000, taxRate: 30 },
    { id: '4', position: 'Официант', count: 4, salary: 35000, taxRate: 30 },
    { id: '5', position: 'Бармен', count: 2, salary: 40000, taxRate: 30 },
    { id: '6', position: 'Посудомойка', count: 2, salary: 30000, taxRate: 30 },
  ],
  otherFixedCosts: 100000,
  variableCostsPercent: 35,
  usnRate: 15,
  vatRate: 5,
  vatThreshold: 20000000,
  discountRate: 16,
  horizonMonths: 36,
  seasonalityEnabled: true,
  seasonality: [...defaultSeasonality],
  activeScenarioId: 'base',
};
