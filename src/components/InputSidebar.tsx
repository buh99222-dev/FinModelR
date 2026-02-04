import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Building2, Users, Calculator, Wallet, TrendingUp } from 'lucide-react';
import type { InputParameters, StaffPosition } from '@/types/financial';
import { formatNumber } from '@/utils/formatters';

interface InputSidebarProps {
  inputs: InputParameters;
  onChange: (inputs: InputParameters) => void;
}

export function InputSidebar({ inputs, onChange }: InputSidebarProps) {
  const handleChange = (field: keyof InputParameters, value: number | string) => {
    onChange({ ...inputs, [field]: value });
  };

  const handleStaffChange = (id: string, field: keyof StaffPosition, value: string | number) => {
    const newStaff = inputs.staff.map(pos =>
      pos.id === id ? { ...pos, [field]: value } : pos
    );
    onChange({ ...inputs, staff: newStaff });
  };

  const addStaffPosition = () => {
    const newPosition: StaffPosition = {
      id: Date.now().toString(),
      position: 'Новая должность',
      count: 1,
      salary: 40000,
      taxRate: 30,
    };
    onChange({ ...inputs, staff: [...inputs.staff, newPosition] });
  };

  const removeStaffPosition = (id: string) => {
    onChange({ ...inputs, staff: inputs.staff.filter(pos => pos.id !== id) });
  };

  const updateSeatsFromArea = (area: number) => {
    const seats = Math.floor(area / 1.5);
    onChange({ ...inputs, floorArea: area, seatsCount: seats });
  };

  const totalPayroll = inputs.staff.reduce((sum, pos) => {
    return sum + pos.salary * pos.count * (1 + pos.taxRate / 100);
  }, 0);

  return (
    <div className="w-96 bg-card border-r border-border h-screen overflow-y-auto sidebar-scroll fixed left-0 top-0 z-10">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-foreground">Финмодель ресторана</h1>
          <p className="text-sm text-muted-foreground mt-1">Калькулятор финансовой модели</p>
        </div>

        {/* Space and Rent */}
        <div className="input-section">
          <h2 className="section-title">
            <Building2 className="w-4 h-4" />
            Помещение и аренда
          </h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="floorArea">Площадь зала, м²</Label>
              <Input
                id="floorArea"
                type="number"
                value={inputs.floorArea}
                onChange={(e) => updateSeatsFromArea(Number(e.target.value))}
                min={1}
              />
            </div>
            
            <div>
              <Label htmlFor="rentPerSqm">Аренда за м²/месяц, ₽</Label>
              <Input
                id="rentPerSqm"
                type="number"
                value={inputs.rentPerSqm}
                onChange={(e) => handleChange('rentPerSqm', Number(e.target.value))}
                min={0}
              />
            </div>
            
            <div>
              <Label htmlFor="seatsCount">Количество мест (авто: площадь ÷ 1,5)</Label>
              <Input
                id="seatsCount"
                type="number"
                value={inputs.seatsCount}
                onChange={(e) => handleChange('seatsCount', Number(e.target.value))}
                min={1}
              />
            </div>
            
            <div className="bg-accent/50 rounded-lg p-3 text-sm">
              <span className="text-muted-foreground">Аренда в месяц: </span>
              <span className="font-semibold text-foreground">
                {formatNumber(inputs.floorArea * inputs.rentPerSqm)} ₽
              </span>
            </div>
          </div>
        </div>

        {/* Revenue Parameters */}
        <div className="input-section">
          <h2 className="section-title">
            <TrendingUp className="w-4 h-4" />
            Параметры выручки
          </h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="averageCheck">Средний чек, ₽</Label>
              <Input
                id="averageCheck"
                type="number"
                value={inputs.averageCheck}
                onChange={(e) => handleChange('averageCheck', Number(e.target.value))}
                min={1}
              />
            </div>
            
            <div>
              <Label htmlFor="guestsPerDay">Гостей в день</Label>
              <Input
                id="guestsPerDay"
                type="number"
                value={inputs.guestsPerDay}
                onChange={(e) => handleChange('guestsPerDay', Number(e.target.value))}
                min={1}
              />
            </div>
            
            <div>
              <Label htmlFor="workDaysPerMonth">Дней работы в месяц</Label>
              <Input
                id="workDaysPerMonth"
                type="number"
                value={inputs.workDaysPerMonth}
                onChange={(e) => handleChange('workDaysPerMonth', Number(e.target.value))}
                min={1}
                max={31}
              />
            </div>
            
            <div className="bg-success-muted rounded-lg p-3 text-sm">
              <span className="text-muted-foreground">Выручка в месяц: </span>
              <span className="font-semibold text-success">
                {formatNumber(inputs.averageCheck * inputs.guestsPerDay * inputs.workDaysPerMonth)} ₽
              </span>
            </div>
          </div>
        </div>

        {/* CAPEX */}
        <div className="input-section">
          <h2 className="section-title">
            <Wallet className="w-4 h-4" />
            Инвестиции (CAPEX)
          </h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="capex">Стоимость запуска, ₽</Label>
              <Input
                id="capex"
                type="number"
                value={inputs.capex}
                onChange={(e) => handleChange('capex', Number(e.target.value))}
                min={0}
                step={100000}
              />
            </div>
            
            <div>
              <Label htmlFor="equipmentLifeYears">Срок службы оборудования, лет</Label>
              <Input
                id="equipmentLifeYears"
                type="number"
                value={inputs.equipmentLifeYears}
                onChange={(e) => handleChange('equipmentLifeYears', Number(e.target.value))}
                min={1}
                max={20}
              />
            </div>
            
            <div className="bg-accent/50 rounded-lg p-3 text-sm">
              <span className="text-muted-foreground">Амортизация в месяц: </span>
              <span className="font-semibold text-foreground">
                {formatNumber(inputs.capex / (inputs.equipmentLifeYears * 12))} ₽
              </span>
            </div>
          </div>
        </div>

        {/* Staff */}
        <div className="input-section">
          <h2 className="section-title">
            <Users className="w-4 h-4" />
            Персонал (ФОТ)
          </h2>
          
          <div className="space-y-3">
            {inputs.staff.map((pos) => (
              <div key={pos.id} className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <Input
                    value={pos.position}
                    onChange={(e) => handleStaffChange(pos.id, 'position', e.target.value)}
                    className="font-medium bg-transparent border-0 p-0 h-auto text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStaffPosition(pos.id)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Кол-во</Label>
                    <Input
                      type="number"
                      value={pos.count}
                      onChange={(e) => handleStaffChange(pos.id, 'count', Number(e.target.value))}
                      min={1}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Оклад</Label>
                    <Input
                      type="number"
                      value={pos.salary}
                      onChange={(e) => handleStaffChange(pos.id, 'salary', Number(e.target.value))}
                      min={0}
                      step={1000}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Налоги %</Label>
                    <Input
                      type="number"
                      value={pos.taxRate}
                      onChange={(e) => handleStaffChange(pos.id, 'taxRate', Number(e.target.value))}
                      min={0}
                      max={100}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={addStaffPosition}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить должность
            </Button>
            
            <div className="bg-accent/50 rounded-lg p-3 text-sm">
              <span className="text-muted-foreground">ФОТ с налогами: </span>
              <span className="font-semibold text-foreground">
                {formatNumber(totalPayroll)} ₽/мес
              </span>
            </div>
          </div>
        </div>

        {/* Other Costs */}
        <div className="input-section">
          <h2 className="section-title">
            <Calculator className="w-4 h-4" />
            Прочие расходы
          </h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="otherFixedCosts">Фикс. расходы (коммуналка, реклама), ₽/мес</Label>
              <Input
                id="otherFixedCosts"
                type="number"
                value={inputs.otherFixedCosts}
                onChange={(e) => handleChange('otherFixedCosts', Number(e.target.value))}
                min={0}
                step={10000}
              />
            </div>
            
            <div>
              <Label htmlFor="variableCostsPercent">Переменные расходы (себестоимость), %</Label>
              <Input
                id="variableCostsPercent"
                type="number"
                value={inputs.variableCostsPercent}
                onChange={(e) => handleChange('variableCostsPercent', Number(e.target.value))}
                min={0}
                max={100}
              />
            </div>
          </div>
        </div>

        {/* Financial Parameters */}
        <div className="input-section">
          <h2 className="section-title">
            <TrendingUp className="w-4 h-4" />
            Финансовые параметры
          </h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="taxRate">Налог на прибыль, %</Label>
              <Input
                id="taxRate"
                type="number"
                value={inputs.taxRate}
                onChange={(e) => handleChange('taxRate', Number(e.target.value))}
                min={0}
                max={100}
              />
            </div>
            
            <div>
              <Label htmlFor="discountRate">Ставка дисконтирования, %</Label>
              <Input
                id="discountRate"
                type="number"
                value={inputs.discountRate}
                onChange={(e) => handleChange('discountRate', Number(e.target.value))}
                min={0}
                max={100}
              />
            </div>
            
            <div>
              <Label htmlFor="horizonMonths">Горизонт расчета, месяцев</Label>
              <Input
                id="horizonMonths"
                type="number"
                value={inputs.horizonMonths}
                onChange={(e) => handleChange('horizonMonths', Number(e.target.value))}
                min={12}
                max={120}
                step={12}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
