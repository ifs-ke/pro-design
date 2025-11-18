'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import type { Calculations } from '@/store/types';
import { formatCurrency } from '@/lib/utils';

interface ProjectQuoteProps {
  calculations: Calculations;
  savedCalculations?: Calculations;
  onPublish: (finalPrice: number) => void;
  isPublishing: boolean;
  isPublished: boolean;
  isClientSelected: boolean;
}

export function ProjectQuote({
  calculations,
  savedCalculations,
  onPublish,
  isPublishing,
  isPublished,
  isClientSelected,
}: ProjectQuoteProps) {
  const [finalQuotePrice, setFinalQuotePrice] = useState<string>('');
  const [isOverriding, setIsOverriding] = useState(false);

  const suggestedPrice = calculations.totalPrice;
  const finalPrice = parseFloat(finalQuotePrice) || 0;

  useEffect(() => {
    // When a quote is loaded, `savedCalculations` will be populated.
    // If the saved total price is different from the newly suggested price,
    // it implies a manual override was previously saved.
    if (savedCalculations && savedCalculations.totalPrice !== suggestedPrice) {
      setFinalQuotePrice(savedCalculations.totalPrice.toFixed(2));
      setIsOverriding(true);
    } else {
      // Reset when loading a new quote or if prices match
      setFinalQuotePrice('');
      setIsOverriding(false);
    }
  }, [savedCalculations, suggestedPrice]);

  const handlePublishClick = () => {
    // Publish the override price if it's active and valid, otherwise use the suggested price.
    const priceToPublish = isOverriding && finalPrice > 0 ? finalPrice : suggestedPrice;
    onPublish(priceToPublish);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Quote</CardTitle>
        <CardDescription>Review the suggested price and publish your final quote.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 text-sm text-muted-foreground">
          <div className="flex justify-between items-center">
            <span>Total Cost</span>
            <span className="font-semibold text-foreground">{formatCurrency(calculations.totalCost)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Profit Amount ({calculations.profitMargin}%)</span>
            <span className="font-semibold text-foreground">{formatCurrency(calculations.profitAmount)}</span>
          </div>
        </div>
        <Separator />
        <div className="space-y-4">
           <div className="flex justify-between items-center text-2xl">
             <span className="font-extrabold">Suggested Price</span>
             <span className="font-extrabold">{formatCurrency(suggestedPrice)}</span>
           </div>

          {isOverriding && (
            <div className="space-y-2 animate-in fade-in-20 duration-300">
              <label htmlFor="final-quote-price" className="text-sm font-medium">Final Quote Price</label>
              <Input
                id="final-quote-price"
                type="number"
                value={finalQuotePrice}
                onChange={(e) => setFinalQuotePrice(e.target.value)}
                placeholder="Enter custom final price"
                className="text-right text-lg font-bold"
              />
            </div>
          )}
        </div>


      </CardContent>
      <CardFooter className='flex flex-col gap-4 items-stretch'>
        <Button onClick={() => setIsOverriding(!isOverriding)} variant="outline" size="sm">
          {isOverriding ? 'Use Suggested Price' : 'Set Custom Final Price'}
        </Button>

        {!isClientSelected ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full text-center p-2 bg-muted rounded-md text-muted-foreground text-sm font-bold opacity-50">
                  {isPublished ? 'Update Quote' : 'Save Quote'}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Please select a client before publishing a quote.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button onClick={handlePublishClick} disabled={isPublishing || (isOverriding && finalPrice <= 0)} size="lg">
            {isPublishing ? 'Saving...' : isPublished ? 'Update Quote' : 'Save Quote'}
            {isPublished && <Badge variant="secondary" className="ml-2">Published</Badge>}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
