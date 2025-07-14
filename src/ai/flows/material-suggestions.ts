'use server';

/**
 * @fileOverview AI-powered material suggestion flow that analyzes price and availability based on budget constraints.
 *
 * - getMaterialSuggestions - A function that handles the material suggestion process.
 * - MaterialSuggestionsInput - The input type for the getMaterialSuggestions function.
 * - MaterialSuggestionsOutput - The return type for the getMaterialSuggestions function.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});

const MaterialSuggestionsInputSchema = z.object({
  budget: z.number().describe('The budget for the material.'),
  materialType: z.string().describe('The type of material needed (e.g., wood, metal, fabric).'),
  quantity: z.number().describe('The quantity of material needed.'),
  location: z.string().describe('The location where the material needs to be sourced.'),
});
export type MaterialSuggestionsInput = z.infer<typeof MaterialSuggestionsInputSchema>;

const MaterialSuggestionsOutputSchema = z.object({
  suggestions: z.array(
    z.object({
      materialName: z.string().describe('The name of the suggested material.'),
      price: z.number().describe('The price of the material.'),
      availability: z.string().describe('The availability of the material.'),
      pros: z.string().describe('The pros of using this material.'),
      cons: z.string().describe('The cons of using this material.'),
    })
  ).describe('An array of material suggestions based on the input criteria.'),
});
export type MaterialSuggestionsOutput = z.infer<typeof MaterialSuggestionsOutputSchema>;

export async function getMaterialSuggestions(input: MaterialSuggestionsInput): Promise<MaterialSuggestionsOutput> {
  return materialSuggestionsFlow(input);
}

const materialSuggestionsPrompt = ai.definePrompt({
  name: 'materialSuggestionsPrompt',
  input: {schema: MaterialSuggestionsInputSchema},
  output: {schema: MaterialSuggestionsOutputSchema},
  prompt: `You are an expert in interior design materials, skilled at finding cost-effective alternatives.

  Based on the budget, material type, quantity, and location provided, suggest alternative materials.
  Analyze price and availability in the specified location, and provide a list of recommendations with clear pros and cons for each.

  Budget: {{{budget}}}
  Material Type: {{{materialType}}}
  Quantity: {{{quantity}}}
  Location: {{{location}}}

  Provide the suggestions in JSON format.
  `,
});

const materialSuggestionsFlow = ai.defineFlow(
  {
    name: 'materialSuggestionsFlow',
    inputSchema: MaterialSuggestionsInputSchema,
    outputSchema: MaterialSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await materialSuggestionsPrompt(input);
    return output!;
  }
);
