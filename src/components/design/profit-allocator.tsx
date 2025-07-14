
"use client";

import { useMemo } from "react";
import { useStore } from "@/store/cost-store";
import type { Allocation } from "@/store/cost-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { PiggyBank, Lightbulb, Heart, CheckCircle2, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface AllocationItem {
  id: keyof Allocation;
  label: string;
  icon: React.ElementType;
}

const allocationItems: AllocationItem[] = [
    { id: 'savings', label: 'Savings', icon: PiggyBank },
    { id: 'futureDev', label: 'Future Dev', icon: Lightbulb },
    { id: 'csr', label: 'CSR', icon: Heart },
];

interface ProfitAllocatorProps {
    profit: number;
}

export function ProfitAllocator({ profit }: ProfitAllocatorProps) {
  const { allocations, setAllocations } = useStore(state => ({
    allocations: state.allocations,
    setAllocations: state.setAllocations,
  }));

  const totalAllocation = useMemo(
    () => Object.values(allocations).reduce((sum, val) => sum + val, 0),
    [allocations]
  );
  
  const handleSliderChange = (key: keyof Allocation, value: number) => {
    setAllocations({ ...allocations, [key]: value });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Profit Allocation</CardTitle>
        <CardDescription>
          Distribute the calculated profit into different business areas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {allocationItems.map(({ id, label, icon: Icon }) => (
            <div key={id} className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor={id} className="flex items-center gap-2 text-muted-foreground">
                        <Icon className="size-4" />
                        {label}
                    </Label>
                    <span className="font-medium text-primary w-28 text-right">
                        {allocations[id]}% / {formatCurrency(profit * (allocations[id] / 100))}
                    </span>
                </div>
                <Slider
                    id={id}
                    min={0}
                    max={100}
                    step={1}
                    value={[allocations[id]]}
                    onValueChange={(value) => handleSliderChange(id, value[0])}
                />
            </div>
        ))}

        <div className="pt-4 space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Allocation</span>
                <span className={`text-sm font-bold ${totalAllocation === 100 ? 'text-green-600' : 'text-destructive'}`}>
                    {totalAllocation.toFixed(0)}%
                </span>
            </div>
            <Progress value={totalAllocation} className={`${totalAllocation > 100 ? '[&>div]:bg-destructive' : totalAllocation === 100 ? '[&>div]:bg-green-500' : ''}`} />
             {totalAllocation === 100 ? (
                <div className="flex items-center justify-center gap-2 pt-2 text-sm text-green-600">
                    <CheckCircle2 className="size-4" />
                    <p>Perfectly allocated!</p>
                </div>
             ) : (
                <div className="flex items-center justify-center gap-2 pt-2 text-sm text-destructive">
                    <AlertCircle className="size-4" />
                    <p>Total must be 100%.</p>
                </div>
             )}
        </div>
      </CardContent>
    </Card>
  );
}
