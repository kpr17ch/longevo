"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/app-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ResultPage() {
  const router = useRouter();
  const { primaryLever, backendResponse, resolvedHabitPlan } = useAppState();

  useEffect(() => {
    if (!primaryLever) {
      router.push("/loading");
    }
  }, [primaryLever, router]);

  if (!primaryLever) {
    return null;
  }

  const handleContinue = () => {
    router.push("/app/home");
  };

  const habitName = backendResponse?.interventionName || primaryLever.name;
  const plan = resolvedHabitPlan || backendResponse?.plan;

  return (
    <div className="fixed inset-0 flex flex-col bg-background overflow-y-auto">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 min-h-screen">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-4 text-center">
            <Badge variant="secondary" className="mb-2">
              Your recommended habit
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              {habitName}
            </h1>
          </div>

          {plan && plan.days.length > 0 ? (
            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">Your 10-Day Plan</h2>
              <div className="grid grid-cols-2 gap-3">
                {plan.days.map((day) => {
                  const steps = day.targetSteps ?? 0;
                  return (
                    <div
                      key={day.dayIndex}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                          {day.dayIndex}
                        </div>
                        <span className="text-sm font-medium">Day {day.dayIndex}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {steps.toLocaleString()} steps
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </Card>
          ) : (
            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">Recommendation</h2>
              <div className="text-base text-muted-foreground whitespace-pre-wrap">
                {backendResponse?.responseText || primaryLever.description}
              </div>
            </Card>
          )}

          <Button
            onClick={handleContinue}
            className="w-full h-12 text-base font-semibold"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}

