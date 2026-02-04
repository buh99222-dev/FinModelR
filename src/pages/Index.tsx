import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { InputSidebar } from '@/components/InputSidebar';
import { KPIDashboard } from '@/components/KPIDashboard';
import { PLTable } from '@/components/PLTable';
import { CashFlowTable } from '@/components/CashFlowTable';
import { BreakEvenChart } from '@/components/BreakEvenChart';
import { PaybackChart } from '@/components/PaybackChart';
import { RevenueChart } from '@/components/RevenueChart';
import { useFinancialCalculations } from '@/hooks/useFinancialCalculations';
import { exportToCSV } from '@/utils/exportToExcel';
import type { InputParameters } from '@/types/financial';
import { defaultInputs } from '@/types/financial';
import { 
  FileSpreadsheet, 
  BarChart3, 
  TrendingUp, 
  Target, 
  Clock,
  Download
} from 'lucide-react';

const Index = () => {
  const [inputs, setInputs] = useState<InputParameters>(defaultInputs);
  
  const calculations = useFinancialCalculations(inputs);
  
  const handleExport = () => {
    exportToCSV(
      inputs,
      calculations.plData,
      calculations.cashFlowData,
      calculations.breakEvenAnalysis.breakEvenGuests,
      calculations.breakEvenAnalysis.breakEvenRevenue,
      calculations.investmentMetrics.npv,
      calculations.investmentMetrics.irr,
      calculations.investmentMetrics.paybackMonths
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <InputSidebar inputs={inputs} onChange={setInputs} />
      
      {/* Main Content */}
      <div className="ml-96 min-h-screen">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Финансовая модель
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Расчет на {inputs.horizonMonths} месяцев ({inputs.horizonMonths / 12} года)
              </p>
            </div>
            <Button onClick={handleExport} className="gap-2">
              <Download className="w-4 h-4" />
              Экспорт в Excel
            </Button>
          </div>

          {/* KPI Dashboard */}
          <KPIDashboard 
            summary={calculations.summary}
            breakEven={calculations.breakEvenAnalysis}
            investment={calculations.investmentMetrics}
          />

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <BarChart3 className="w-4 h-4" />
                Обзор
              </TabsTrigger>
              <TabsTrigger value="pl" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <FileSpreadsheet className="w-4 h-4" />
                ОПиУ (P&L)
              </TabsTrigger>
              <TabsTrigger value="cashflow" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <TrendingUp className="w-4 h-4" />
                ОДДС
              </TabsTrigger>
              <TabsTrigger value="breakeven" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Target className="w-4 h-4" />
                Безубыточность
              </TabsTrigger>
              <TabsTrigger value="investment" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Clock className="w-4 h-4" />
                Инвестиции
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="animate-fade-in space-y-6">
              <RevenueChart data={calculations.plData} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BreakEvenChart analysis={calculations.breakEvenAnalysis} />
                <PaybackChart 
                  cashFlowData={calculations.cashFlowData}
                  metrics={calculations.investmentMetrics}
                  capex={inputs.capex}
                  discountRate={inputs.discountRate}
                />
              </div>
            </TabsContent>

            <TabsContent value="pl" className="animate-fade-in">
              <PLTable data={calculations.plData} />
            </TabsContent>

            <TabsContent value="cashflow" className="animate-fade-in">
              <CashFlowTable 
                data={calculations.cashFlowData} 
                capex={inputs.capex}
              />
            </TabsContent>

            <TabsContent value="breakeven" className="animate-fade-in">
              <BreakEvenChart analysis={calculations.breakEvenAnalysis} />
            </TabsContent>

            <TabsContent value="investment" className="animate-fade-in">
              <PaybackChart 
                cashFlowData={calculations.cashFlowData}
                metrics={calculations.investmentMetrics}
                capex={inputs.capex}
                discountRate={inputs.discountRate}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Index;
