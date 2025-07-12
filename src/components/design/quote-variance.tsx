
"use client";

import { useMemo } from "react";
import { formatCurrency } from "@/lib/utils";
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";

interface QuoteValues {
    grandTotal: number;
    profit: number;
}

interface QuoteVarianceProps {
    suggested: QuoteValues;
    final: QuoteValues;
}

export function QuoteVariance({ suggested, final }: QuoteVarianceProps) {
    const variance = useMemo(() => {
        if (suggested.grandTotal === 0 || final.grandTotal === 0) {
            return { total: 0, profit: 0, totalPercent: 0 };
        }
        const total = final.grandTotal - suggested.grandTotal;
        const profit = final.profit - suggested.profit;
        const totalPercent = (total / suggested.grandTotal) * 100;

        return { total, profit, totalPercent };
    }, [suggested, final]);

    const getVarianceStyle = (value: number) => {
        if (value > 0) return "text-green-600";
        if (value < 0) return "text-destructive";
        return "text-muted-foreground";
    };

    const VarianceIcon = ({ value }: { value: number }) => {
        if (value > 0) return <ArrowUp className="size-4" />;
        if (value < 0) return <ArrowDown className="size-4" />;
        return <ArrowRight className="size-4" />;
    };
    
    // Don't render if the numbers are the same
    if (variance.total === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-2 gap-4 text-sm">
            <div className={`flex flex-col gap-1 rounded-md border p-3 ${getVarianceStyle(variance.total)} bg-opacity-10 ${variance.total > 0 ? 'bg-green-500/10 border-green-500/20' : variance.total < 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-muted/30'}`}>
                <div className="flex items-center justify-between font-semibold">
                    <span>Quote Variance</span>
                    <VarianceIcon value={variance.total} />
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold">
                        {formatCurrency(variance.total)}
                    </span>
                    <span className="font-medium">
                        ({variance.totalPercent.toFixed(1)}%)
                    </span>
                </div>
            </div>
             <div className={`flex flex-col gap-1 rounded-md border p-3 ${getVarianceStyle(variance.profit)} bg-opacity-10 ${variance.profit > 0 ? 'bg-green-500/10 border-green-500/20' : variance.profit < 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-muted/30'}`}>
                <div className="flex items-center justify-between font-semibold">
                    <span>Profit Variance</span>
                    <VarianceIcon value={variance.profit} />
                </div>
                <div className="flex items-baseline gap-2">
                     <span className="text-lg font-bold">
                        {formatCurrency(variance.profit)}
                    </span>
                </div>
            </div>
        </div>
    );
}
