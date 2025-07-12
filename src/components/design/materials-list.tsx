
"use client";

import React from "react";
import type { FormValues } from "@/store/cost-store";
import { formatCurrency } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package } from "lucide-react";

interface MaterialsListProps {
  materials: NonNullable<FormValues['materials']>;
}

export function MaterialsList({ materials }: MaterialsListProps) {
  const totalCost = materials.reduce((acc, item) => acc + (item.quantity * (item.cost || 0)), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Package className="size-5 text-primary" />
            Materials List
        </CardTitle>
        <CardDescription>
          Detailed breakdown of all materials included in this quote.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Material</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">Unit Cost</TableHead>
                <TableHead className="text-right">Total Cost</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {materials.map((item, index) => (
                <TableRow key={index}>
                    <TableCell>
                        <p className="font-medium">{item.name}</p>
                        {item.description && (
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                        )}
                    </TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.cost || 0)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(item.quantity * (item.cost || 0))}</TableCell>
                </TableRow>
                ))}
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableCell colSpan={3} className="text-right font-bold">Total Material Cost</TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(totalCost)}</TableCell>
                </TableRow>
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
