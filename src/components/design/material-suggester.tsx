"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  getMaterialSuggestions,
  type MaterialSuggestionsOutput,
} from "@/ai/flows/material-suggestions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Wand2, ThumbsUp, ThumbsDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { formatCurrency } from "@/lib/utils";

const suggesterSchema = z.object({
  budget: z.coerce.number().positive("Budget must be a positive number."),
  materialType: z.string().min(3, "Please specify a material type."),
  quantity: z.coerce.number().positive("Quantity must be a positive number."),
  location: z.string().min(2, "Please specify a location."),
});

type SuggesterFormValues = z.infer<typeof suggesterSchema>;

export function MaterialSuggester() {
  const [suggestions, setSuggestions] =
    useState<MaterialSuggestionsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<SuggesterFormValues>({
    resolver: zodResolver(suggesterSchema),
    defaultValues: {
      budget: 5000,
      materialType: "Hardwood Flooring",
      quantity: 50,
      location: "New York, NY",
    },
  });

  const onSubmit = async (values: SuggesterFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuggestions(null);
    try {
      const result = await getMaterialSuggestions(values);
      setSuggestions(result);
    } catch (e) {
      setError("Failed to get suggestions. Please try again.");
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Could not fetch material suggestions.",
      });
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="text-primary" />
          AI Material Suggester
        </CardTitle>
        <CardDescription>
          Find cost-effective material alternatives for your project.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget (Ksh)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="5000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="materialType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Hardwood Flooring" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Quantity (sqft/units)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="50" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                        <Input placeholder="City, State" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent/90">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Get Suggestions
            </Button>
          </form>
        </Form>

        <div className="mt-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center text-muted-foreground p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p>Analyzing materials...</p>
            </div>
          )}
          {error && <Alert variant="destructive">{error}</Alert>}
          {suggestions && (
            <div>
              <h3 className="font-semibold mb-2">Suggestions:</h3>
              <Accordion type="single" collapsible className="w-full">
                {suggestions.suggestions.map((item, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="text-left hover:no-underline">
                        <div className="flex items-center gap-4">
                             <Image 
                                src={`https://placehold.co/64x64.png`}
                                alt={item.materialName}
                                width={64}
                                height={64}
                                className="rounded-md object-cover"
                                data-ai-hint={`${item.materialName.split(' ')[0]} texture`}
                            />
                            <div>
                                <h4 className="font-semibold">{item.materialName}</h4>
                                <p className="text-sm text-muted-foreground">
                                    Price: {formatCurrency(item.price)} | Availability: {item.availability}
                                </p>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <Alert>
                            <ThumbsUp className="h-4 w-4" />
                            <AlertTitle>Pros</AlertTitle>
                            <AlertDescription>{item.pros}</AlertDescription>
                        </Alert>
                        <Alert variant="destructive">
                            <ThumbsDown className="h-4 w-4" />
                            <AlertTitle>Cons</AlertTitle>
                            <AlertDescription>{item.cons}</AlertDescription>
                        </Alert>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
