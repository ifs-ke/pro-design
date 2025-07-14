'use server';

/**
 * @fileOverview AI-powered quote analysis flow that provides business insights and strategies.
 *
 * - getQuoteInsights - A function that handles the quote analysis process.
 * - QuoteInsightsInput - The input type for the getQuoteInsights function.
 * - QuoteInsightsOutput - The return type for the getQuoteInsights function.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});

const QuoteInsightsInputSchema = z.object({
  totalBaseCost: z.number().describe('The total base cost of the project.'),
  profit: z.number().describe('The profit amount from the project.'),
  profitMargin: z.number().describe('The profit margin percentage.'),
  grandTotal: z.number().describe('The final quote presented to the client.'),
  businessType: z.string().describe('The business type (e.g., VAT Registered, Sole Proprietor).'),
});
export type QuoteInsightsInput = z.infer<typeof QuoteInsightsInputSchema>;

const QuoteInsightsOutputSchema = z.object({
  quoteInsight: z.string().describe("A brief, expert analysis of the quote's health and profitability."),
  businessStrategy: z.string().describe('Actionable business strategy recommendations based on the quote.'),
});
export type QuoteInsightsOutput = z.infer<typeof QuoteInsightsOutputSchema>;

export async function getQuoteInsights(input: QuoteInsightsInput): Promise<QuoteInsightsOutput> {
  return quoteInsightsFlow(input);
}

const quoteInsightsPrompt = ai.definePrompt({
  name: 'quoteInsightsPrompt',
  input: {schema: QuoteInsightsInputSchema},
  output: {schema: QuoteInsightsOutputSchema},
  prompt: `You are a world-class business consultant for interior design studios in Kenya.
  Analyze the following project quote data and provide:
  1. A concise insight into the health and structure of the quote.
  2. Actionable business strategies or next moves based on the final quote.

  Keep the tone professional, encouraging, and strategic. Your analysis should be aware of the business context in Kenya.

  Project Data:
  - Total Base Cost: KES {z.number().parse(totalBaseCost)}
  - Profit: KES {z.number().parse(profit)}
  - Profit Margin: {z.number().parse(profitMargin)}%
  - Final Client Quote (Gross Revenue): KES {z.number().parse(grandTotal)}
  - Business Type: {{{businessType}}}

  Provide the output in the specified JSON format.
  `,
});

const quoteInsightsFlow = ai.defineFlow(
  {
    name: 'quoteInsightsFlow',
    inputSchema: QuoteInsightsInputSchema,
    outputSchema: QuoteInsightsOutputSchema,
  },
  async input => {
    const {output} = await quoteInsightsPrompt(input);
    return output!;
  }
);
