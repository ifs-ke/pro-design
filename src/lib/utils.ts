
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Ksh 0.00';
  }
  const roundedAmount = Math.round(amount * 100) / 100;
  
  return new Intl.NumberFormat('en-KE', { 
    style: 'currency', 
    currency: 'KES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(roundedAmount).replace('KES', 'Ksh');
};

export const formatNumber = (
  value: number | null | undefined,
  options: Intl.NumberFormatOptions = {}
): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  // Default to 1 decimal place if no options are provided.
  const defaultOptions = { maximumFractionDigits: 1 };
  return new Intl.NumberFormat('en-US', { ...defaultOptions, ...options }).format(value);
};

export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: '2-digit' 
  }).format(d);
};