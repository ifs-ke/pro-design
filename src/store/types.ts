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

// Corrected Labor Schema
const laborItemSchema = z.object({
    vendor: z.string().min(1, "Vendor is required."),
    rate: z.coerce.number().min(0, "Rate cannot be negative."),
    rateType: z.enum(['hourly', 'daily']),
    hours: z.coerce.number().min(0, "Hours must be positive").optional(),
    days: z.coerce.number().min(0, "Days must be positive").optional(),
});

export type Labor = z.infer<typeof laborItemSchema>;

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
    laborConcurrencyPercentage: z.coerce.number().min(0).max(100).default(0),
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

export interface Invoice {
    id: string;
    invoiceNumber: string;
    amount: number;
    status: string;
    dueDate: string;
    clientId: string;
    projectId?: string | null;
    quoteId?: string | null;
    createdAt: string;
    updatedAt: string;
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
  totalLaborHours: number;
  effectiveLaborHours: number;
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
  invoices?: HydratedInvoice[];
}

export interface HydratedProperty extends Property {
  client?: Client;
  projects?: HydratedProject[];
}

export interface HydratedClient extends Client {
  properties?: HydratedProperty[];
  projects?: HydratedProject[];
  quotes?: HydratedQuote[];
  invoices?: HydratedInvoice[];
}

export interface HydratedInvoice extends Invoice {
    client?: Client;
    project?: Project;
    quote?: Quote;
}

export interface DashboardMetrics {
  totalClients: number;
  totalProjects: number;
  totalQuotes: number;
  totalInvoices: number;
  approvedRevenue: number;
  approvalRate: number;
  totalApprovedQuotes: number;
  totalOutstandingAmount: number;
  totalOverdueAmount: number;
  totalPaidAmount: number;
  clientStatusData: { name: string; value: number }[];
  projectStatusData: { name: string; value: number }[];
  quoteStatusData: { name: string; value: number }[];
  totalProfit: number;
  effectiveWorkHours: number;
}
