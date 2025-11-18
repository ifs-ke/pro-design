import * as z from "zod";
import { ReactNode } from 'react';

// Schema Definitions
const materialItemSchema = z.object({
    name: z.string().min(1, "Name is required."),
    description: z.string().optional(),
    quantity: z.coerce.number().min(0, "Quantity cannot be negative."),
    cost: z.coerce.number().min(0, "Cost cannot be negative.").optional(),
});

export type Material = z.infer<typeof materialItemSchema>;

const laborItemSchema = z.object({
    vendor: z.string().min(1, "Vendor is required."),
    units: z.coerce.number().min(0, "Units cannot be negative."),
    rate: z.coerce.number().min(0, "Rate cannot be negative."),
    rateType: z.enum(['hourly', 'daily']),
});

const operationItemSchema = z.object({
    name: z.string().min(1, "Name is required."),
    cost: z.coerce.number().min(0, "Cost cannot be negative."),
});

const affiliateItemSchema = z.object({
    name: z.string().min(1, "Name is required."),
    rateType: z.enum(['percentage', 'fixed']),
    units: z.coerce.number().min(0, "Units cannot be negative.").optional(),
    rate: z.coerce.number().min(0, "Rate cannot be negative."),
});

const salaryItemSchema = z.object({
    role: z.string().min(1, "Role is required."),
    salary: z.coerce.number().min(0, "Salary cannot be negative."),
});

export type Salary = z.infer<typeof salaryItemSchema>;

export const formSchema = z.object({
    clientId: z.string().min(1, "Please select a client."),
    projectId: z.string().optional(),
    materials: z.array(materialItemSchema).optional(),
    labor: z.array(laborItemSchema).optional(),
    operations: z.array(operationItemSchema).optional(),
    affiliates: z.array(affiliateItemSchema).optional(),
    salaries: z.array(salaryItemSchema).optional(),
    businessType: z.enum(['vat_registered', 'sole_proprietor', 'no_tax']),
    taxRate: z.coerce.number().min(0, "Tax rate cannot be negative.").max(100),
    profitMargin: z.coerce.number().min(0, "Profit margin cannot be negative."),
    miscPercentage: z.coerce.number().min(0, "Misc. percentage cannot be negative."),
    salaryPercentage: z.coerce.number().min(0, "Salary percentage cannot be negative."),
    enableNSSF: z.boolean().optional(),
    enableSHIF: z.boolean().optional(),
});

// Enums
export type QuoteStatus = 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Archived';

// Base Prisma-like types
export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  status: string;
  responsiveness?: string | null;
  createdAt: string; // Using string for ISO date strings
  updatedAt: string;
  interactions?: Interaction[];
}

export interface Property {
  id: string;
  name: string;
  address: string;
  clientId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  propertyId?: string | null;
  scope?: string | null;
  timeline?: string | null;
  status?: string | null;
  projectType?: string | null;
  services?: string | null;
  roomCount?: number | null;
  otherSpaces?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  id: string;
  clientId: string;
  projectId?: string | null;
  status: QuoteStatus;
  formValues: FormValues;
  allocations: Allocation;
  calculations: Calculations;
  suggestedCalculations: Calculations; // Assuming it has the same structure
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

export interface Interaction {
  id: string;
  clientId: string;
  type: 'Call' | 'Email' | 'Meeting' | 'Message';
  notes: string;
  timestamp: string;
}

// Form and Calculation Types
export type FormValues = z.infer<typeof formSchema>;

export interface Allocation {
  savings: number;
  futureDev: number;
  csr: number;
}

export interface Calculations {
  nssfAmount: number;
  shifAmount: number;
  totalMaterialCost: number;
  totalLaborCost: number;
  totalOperationCost: number;
  totalAffiliateCost: number;
  subtotal: number;
  miscAmount: number;
  subtotalWithMisc: number;
  taxAmount: number;
  totalCost: number;
  profitAmount: number;
  totalPrice: number;
  salaryAmount: number;
}

// Hydrated types for frontend display
export interface HydratedQuote extends Quote {
  client?: Client;
  project?: Project;
}

export interface HydratedProject extends Project {
  client?: Client;
  property?: Property;
  quotes?: HydratedQuote[];
}

export interface HydratedProperty extends Property {
  client?: Client;
  projects?: HydratedProject[];
}

export interface HydratedClient extends Client {
  properties?: HydratedProperty[];
  projects?: HydratedProject[];
  quotes?: HydratedQuote[];
}
