
import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepProps {
  id: string;
  name: string;
  description?: string;
  completed?: boolean;
  current?: boolean;
}

interface StepperProps {
  steps: StepProps[];
  currentStep: string;
  onChange?: (stepId: string) => void;
  className?: string;
}

export function Stepper({ steps, currentStep, onChange, className }: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      <ol className="flex w-full items-center">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.completed;
          const isLast = index === steps.length - 1;
          const isClickable = onChange && (isCompleted || index === 0);

          return (
            <li
              key={step.id}
              className={cn(
                "flex items-center",
                !isLast && "w-full",
                isClickable && "cursor-pointer"
              )}
              onClick={() => isClickable && onChange(step.id)}
            >
              <div className="flex items-center justify-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCompleted
                      ? "border-green-600 bg-green-600 text-white"
                      : "border-gray-300 bg-gray-100"
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                {step.name && (
                  <span
                    className={cn(
                      "ml-2 hidden text-sm md:inline-flex",
                      isActive ? "font-semibold text-primary" : "text-muted-foreground"
                    )}
                  >
                    {step.name}
                  </span>
                )}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "ml-2 h-0.5 w-full",
                    isCompleted ? "bg-green-600" : "bg-gray-200"
                  )}
                ></div>
              )}
            </li>
          );
        })}
      </ol>
      {steps.map((step) => (
        <div key={step.id} className="mt-2">
          {step.id === currentStep && step.description && (
            <p className="text-sm text-muted-foreground">{step.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}

// Remove the Step component since it's not used and is causing errors
