
import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepProps {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  isCompleted?: boolean;
  isActive?: boolean;
}

export const Step = ({
  label,
  description,
  icon,
  isCompleted,
  isActive,
}: StepProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center space-y-2",
        (isActive || isCompleted) ? "text-primary" : "text-muted-foreground"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full border-2",
          isCompleted 
            ? "border-primary bg-primary text-white" 
            : isActive 
              ? "border-primary text-primary" 
              : "border-muted-foreground"
        )}
      >
        {isCompleted ? (
          <Check className="h-4 w-4" />
        ) : (
          icon || <span className="text-sm font-medium">{}</span>
        )}
      </div>
      <div className="text-center">
        <p className={cn(
          "text-sm font-medium",
          (isActive || isCompleted) ? "" : "text-muted-foreground"
        )}>
          {label}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
};

interface StepperProps {
  activeStep: number;
  children: React.ReactNode;
}

export const Stepper = ({ activeStep, children }: StepperProps) => {
  const steps = React.Children.toArray(children);
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-center">
        <div className="flex w-full items-center">
          {steps.map((step, i) => {
            const isCompletedStep = i < activeStep;
            const isActiveStep = i === activeStep;
            
            return (
              <React.Fragment key={i}>
                {i !== 0 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1",
                      i <= activeStep ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
                <div className="relative flex flex-col items-center">
                  {React.isValidElement(step) && 
                    React.cloneElement(step, {
                      isActive: isActiveStep,
                      isCompleted: isCompletedStep,
                    })
                  }
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
