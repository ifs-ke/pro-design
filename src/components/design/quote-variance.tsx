
"use client";

import { useMemo } from "react";
import { formatCurrency } from "@/lib/utils";
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";

// The props passed are of type Calculations, so we need to match the property names
interface QuoteValues {
    totalPrice: number;
    profitAmount: number;
}

interface QuoteVarianceProps {
    suggested: QuoteValues;
    final: QuoteValues;
}

export function QuoteVariance({ suggested, final }: QuoteVarianceProps) {
    const variance = useMemo(() => {
        // Initialize values to 0 if they are not available to prevent NaN calculations
        const suggestedTotal = suggested?.totalPrice || 0;
        const finalTotal = final?.totalPrice || 0;
        const suggestedProfit = suggested?.profitAmount || 0;
        const finalProfit = final?.profitAmount || 0;

        if (suggestedTotal === 0 || finalTotal === 0) {
            return { total: 0, profit: 0, totalPercent: 0 };
        }
        
        const total = finalTotal - suggestedTotal;
        const profit = finalProfit - suggestedProfit;
        // Avoid division by zero
        const totalPercent = suggestedTotal !== 0 ? (total / suggestedTotal) * 100 : 0;

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
        <div className="border rounded-lg p-4 bg-muted/20">
            <h3 className="font-semibold mb-3">Quote Comparison</h3>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Suggested Quote</span>
                    <span className="font-medium">{formatCurrency(suggested?.totalPrice || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Final Quote</span>
                    <span className="font-medium">{formatCurrency(final?.totalPrice || 0)}</span>
                </div>
                 <div className={`flex justify-between items-center font-semibold pt-2 border-t mt-2 ${getVarianceStyle(variance.total)}`}>
                    <span>Variance</span>
                    <div className="flex items-center gap-2">
                        <span>{formatCurrency(variance.total)} ({variance.totalPercent.toFixed(1)}%)</span>
                        <VarianceIcon value={variance.total} />
                    </div>
                </div>
            </div>
        </div>
    );
}
