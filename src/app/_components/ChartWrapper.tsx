'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

interface ChartWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function ChartWrapper({ title, description, children }: ChartWrapperProps) {
  return (
    <Card className="bg-card text-card-foreground">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold text-foreground">{title}</CardTitle>
        {description && <div className="text-sm text-muted-foreground">{description}</div>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
