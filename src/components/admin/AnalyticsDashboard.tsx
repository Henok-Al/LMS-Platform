"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Analytics } from "@/lib/data/analytics";
import { BarChart } from "../ui/bar-chart";

interface AnalyticsDashboardProps {
  analytics: Analytics;
}

export function AnalyticsDashboard({ analytics }: AnalyticsDashboardProps) {
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Enrollments</CardTitle>
          <CardDescription>
            Course enrollments over the past year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BarChart data={analytics.monthlyEnrollments} className="mt-4" />
        </CardContent>
      </Card>

      {/* Removed redundant stat cards */}
    </div>
  );
}
