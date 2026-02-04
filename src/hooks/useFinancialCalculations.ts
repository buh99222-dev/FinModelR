import { useMemo } from 'react';
import type {
  InputParameters,
  MonthlyPL,
  MonthlyCashFlow,
  BreakEvenAnalysis,
  InvestmentMetrics,
  FinancialSummary,
} from '@/types/financial';

export function useFinancialCalculations(inputs: InputParameters) {
  // Calculate monthly payroll including taxes
  const monthlyPayroll = useMemo(() => {
    return inputs.staff.reduce((total, pos) => {
      const baseSalary = pos.salary * pos.count;
      const taxes = baseSalary * (pos.taxRate / 100);
      return total + baseSalary + taxes;
    }, 0);
  }, [inputs.staff]);

  // Calculate monthly rent
  const monthlyRent = useMemo(() => {
    return inputs.floorArea * inputs.rentPerSqm;
  }, [inputs.floorArea, inputs.rentPerSqm]);

  // Calculate monthly depreciation
  const monthlyDepreciation = useMemo(() => {
    return inputs.capex / (inputs.equipmentLifeYears * 12);
  }, [inputs.capex, inputs.equipmentLifeYears]);

  // Total fixed costs
  const monthlyFixedCosts = useMemo(() => {
    return monthlyRent + monthlyPayroll + inputs.otherFixedCosts;
  }, [monthlyRent, monthlyPayroll, inputs.otherFixedCosts]);

  // Monthly revenue
  const monthlyRevenue = useMemo(() => {
    return inputs.averageCheck * inputs.guestsPerDay * inputs.workDaysPerMonth;
  }, [inputs.averageCheck, inputs.guestsPerDay, inputs.workDaysPerMonth]);

  // Monthly variable costs
  const monthlyVariableCosts = useMemo(() => {
    return monthlyRevenue * (inputs.variableCostsPercent / 100);
  }, [monthlyRevenue, inputs.variableCostsPercent]);

  // P&L for all months
  const plData: MonthlyPL[] = useMemo(() => {
    const result: MonthlyPL[] = [];
    
    for (let month = 1; month <= inputs.horizonMonths; month++) {
      const revenue = monthlyRevenue;
      const variableCosts = monthlyVariableCosts;
      const grossProfit = revenue - variableCosts;
      const ebit = grossProfit - monthlyFixedCosts - monthlyDepreciation;
      const tax = ebit > 0 ? ebit * (inputs.taxRate / 100) : 0;
      const netProfit = ebit - tax;

      result.push({
        month,
        revenue,
        variableCosts,
        grossProfit,
        fixedCosts: monthlyFixedCosts,
        rent: monthlyRent,
        payroll: monthlyPayroll,
        otherFixed: inputs.otherFixedCosts,
        depreciation: monthlyDepreciation,
        ebit,
        tax,
        netProfit,
      });
    }
    
    return result;
  }, [
    inputs.horizonMonths,
    inputs.taxRate,
    inputs.otherFixedCosts,
    monthlyRevenue,
    monthlyVariableCosts,
    monthlyFixedCosts,
    monthlyDepreciation,
    monthlyRent,
    monthlyPayroll,
  ]);

  // Cash flow for all months
  const cashFlowData: MonthlyCashFlow[] = useMemo(() => {
    const result: MonthlyCashFlow[] = [];
    let cumulative = -inputs.capex; // Initial investment

    for (let month = 1; month <= inputs.horizonMonths; month++) {
      const pl = plData[month - 1];
      // FCF = Net Profit + Depreciation (non-cash expense)
      const operatingCashFlow = pl.netProfit + pl.depreciation;
      const investmentCashFlow = month === 1 ? -inputs.capex : 0;
      const financingCashFlow = 0;
      const netCashFlow = month === 1 
        ? operatingCashFlow + investmentCashFlow
        : operatingCashFlow;
      
      cumulative += month === 1 ? operatingCashFlow : operatingCashFlow;

      result.push({
        month,
        operatingCashFlow,
        investmentCashFlow: month === 1 ? -inputs.capex : 0,
        financingCashFlow,
        netCashFlow,
        cumulativeCashFlow: cumulative,
      });
    }
    
    return result;
  }, [plData, inputs.capex, inputs.horizonMonths]);

  // Break-even analysis
  const breakEvenAnalysis: BreakEvenAnalysis = useMemo(() => {
    const variableCostPerGuest = inputs.averageCheck * (inputs.variableCostsPercent / 100);
    const marginPerGuest = inputs.averageCheck - variableCostPerGuest;
    const marginPercentage = (marginPerGuest / inputs.averageCheck) * 100;
    
    // Fixed costs for break-even (without depreciation - it's non-cash)
    const fixedCostsForBE = monthlyFixedCosts;
    
    const breakEvenGuests = marginPerGuest > 0 ? fixedCostsForBE / marginPerGuest : 0;
    const breakEvenRevenue = breakEvenGuests * inputs.averageCheck;
    
    const currentGuests = inputs.guestsPerDay * inputs.workDaysPerMonth;
    const currentRevenue = monthlyRevenue;
    
    const safetyMarginPercent = currentGuests > 0 
      ? ((currentGuests - breakEvenGuests) / currentGuests) * 100
      : 0;

    return {
      marginPerGuest,
      breakEvenGuests,
      breakEvenRevenue,
      marginPercentage,
      fixedCostsMonthly: fixedCostsForBE,
      currentGuests,
      currentRevenue,
      safetyMarginPercent,
    };
  }, [
    inputs.averageCheck,
    inputs.variableCostsPercent,
    inputs.guestsPerDay,
    inputs.workDaysPerMonth,
    monthlyFixedCosts,
    monthlyRevenue,
  ]);

  // Investment metrics (NPV, IRR, Payback)
  const investmentMetrics: InvestmentMetrics = useMemo(() => {
    // Convert annual discount rate to monthly
    const monthlyRate = Math.pow(1 + inputs.discountRate / 100, 1 / 12) - 1;
    
    // Build cash flow array: -CAPEX at t=0, then FCF for each month
    const cashFlows: number[] = [-inputs.capex];
    for (let i = 0; i < inputs.horizonMonths; i++) {
      const pl = plData[i];
      const fcf = pl.netProfit + pl.depreciation;
      cashFlows.push(fcf);
    }
    
    // NPV calculation
    let npv = -inputs.capex;
    for (let t = 1; t <= inputs.horizonMonths; t++) {
      npv += cashFlows[t] / Math.pow(1 + monthlyRate, t);
    }
    
    // Payback period
    let paybackMonths: number | null = null;
    let cumulative = -inputs.capex;
    for (let t = 1; t <= inputs.horizonMonths; t++) {
      cumulative += cashFlows[t];
      if (cumulative >= 0 && paybackMonths === null) {
        // Linear interpolation for more precise payback
        const prevCumulative = cumulative - cashFlows[t];
        const fraction = -prevCumulative / cashFlows[t];
        paybackMonths = t - 1 + fraction;
        break;
      }
    }
    
    // IRR calculation using Newton-Raphson method
    const calculateIRR = (cashFlows: number[]): number | null => {
      let rate = 0.1; // Initial guess 10% monthly
      const maxIterations = 100;
      const tolerance = 0.0001;
      
      for (let i = 0; i < maxIterations; i++) {
        let npvValue = 0;
        let derivative = 0;
        
        for (let t = 0; t < cashFlows.length; t++) {
          npvValue += cashFlows[t] / Math.pow(1 + rate, t);
          if (t > 0) {
            derivative -= (t * cashFlows[t]) / Math.pow(1 + rate, t + 1);
          }
        }
        
        if (Math.abs(derivative) < 1e-10) break;
        
        const newRate = rate - npvValue / derivative;
        
        if (Math.abs(newRate - rate) < tolerance) {
          // Convert monthly IRR to annual
          const annualIRR = (Math.pow(1 + newRate, 12) - 1) * 100;
          if (annualIRR > -100 && annualIRR < 1000) {
            return annualIRR;
          }
          return null;
        }
        
        rate = newRate;
        
        // Keep rate in reasonable bounds
        if (rate < -0.9) rate = -0.9;
        if (rate > 10) rate = 10;
      }
      
      return null;
    };
    
    const irr = calculateIRR(cashFlows);
    
    // ROI
    const totalProfit = plData.reduce((sum, pl) => sum + pl.netProfit, 0);
    const roi = (totalProfit / inputs.capex) * 100;
    
    // Profitability Index
    const profitabilityIndex = (npv + inputs.capex) / inputs.capex;
    
    return {
      npv,
      irr,
      paybackMonths,
      roi,
      profitabilityIndex,
    };
  }, [plData, inputs.capex, inputs.discountRate, inputs.horizonMonths]);

  // Financial summary
  const summary: FinancialSummary = useMemo(() => {
    const avgMonthlyProfit = plData.reduce((sum, pl) => sum + pl.netProfit, 0) / plData.length;
    
    return {
      monthlyRevenue,
      monthlyProfit: avgMonthlyProfit,
      yearlyRevenue: monthlyRevenue * 12,
      yearlyProfit: avgMonthlyProfit * 12,
      profitMargin: (avgMonthlyProfit / monthlyRevenue) * 100,
      breakEvenMonths: investmentMetrics.paybackMonths,
    };
  }, [plData, monthlyRevenue, investmentMetrics.paybackMonths]);

  return {
    monthlyPayroll,
    monthlyRent,
    monthlyDepreciation,
    monthlyFixedCosts,
    monthlyRevenue,
    monthlyVariableCosts,
    plData,
    cashFlowData,
    breakEvenAnalysis,
    investmentMetrics,
    summary,
  };
}
