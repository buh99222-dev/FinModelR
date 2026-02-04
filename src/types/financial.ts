// Financial Model Types for Restaurant/Cafe

export interface StaffPosition {
  id: string;
  position: string;
  count: number;
  salary: number;
  taxRate: number; // % of salary for taxes
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
  
  // Taxes and discounting
  taxRate: number; // % налог на прибыль
  discountRate: number; // % ставка дисконтирования (годовая)
  
  // Horizon
  horizonMonths: number; // горизонт расчета (по умолчанию 36)
}

export interface MonthlyPL {
  month: number;
  revenue: number;
  variableCosts: number;
  grossProfit: number;
  fixedCosts: number;
  rent: number;
  payroll: number;
  otherFixed: number;
  depreciation: number;
  ebit: number;
  tax: number;
  netProfit: number;
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
  taxRate: 20,
  discountRate: 16,
  horizonMonths: 36,
};
