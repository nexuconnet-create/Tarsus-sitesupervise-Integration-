import { Check, Loader2, XCircle, AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

export interface StepDef {
  key: string;
  label: string;
}

interface POStatusTimelineProps {
  steps: StepDef[];
  currentStepIndex: number;
  isTerminal?: boolean;
  terminalIcon?: ReactNode;
  terminalLabel?: string;
  onStepClick?: (stepKey: string) => void;
  clickableSteps?: Set<string>;
  loadingStep?: string | null;
}

export default function POStatusTimeline({
  steps,
  currentStepIndex,
  isTerminal = false,
  terminalIcon,
  terminalLabel,
  onStepClick,
  clickableSteps,
  loadingStep,
}: POStatusTimelineProps) {
  return (
    <div className="w-full">
      {isTerminal && (
        <div className="flex items-center justify-center gap-2 mb-3 text-xs font-semibold text-red-600 bg-red-50 rounded-lg py-2">
          {terminalIcon || <XCircle className="w-4 h-4" />}
          {terminalLabel || "Cancelled"}
        </div>
      )}

      <div className="flex items-center justify-between px-1">
        {steps.map((step, idx) => {
          const isCompleted = currentStepIndex >= 0 && idx < currentStepIndex && !isTerminal;
          const isCurrent = idx === currentStepIndex && !isTerminal;
          const isUpcoming = idx > currentStepIndex || isTerminal;
          const canAct = clickableSteps?.has(step.key) && !isTerminal;

          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                {idx > 0 && (
                  <div className={`flex-1 h-0.5 ${isCompleted ? "bg-blue-500" : "bg-gray-200"}`} />
                )}

                <button
                  type="button"
                  disabled={!canAct || loadingStep !== null}
                  onClick={() => onStepClick?.(step.key)}
                  className={`
                    relative flex items-center justify-center w-7 h-7 rounded-full border-2 shrink-0 transition-all
                    ${isCompleted ? "bg-blue-500 border-blue-500 text-white" : ""}
                    ${isCurrent ? "bg-blue-500 border-blue-500 text-white ring-2 ring-blue-200" : ""}
                    ${isUpcoming ? "bg-white border-gray-300 text-gray-400" : ""}
                    ${canAct && loadingStep === null ? "cursor-pointer hover:border-blue-400 hover:text-blue-500" : "cursor-default"}
                    ${loadingStep === step.key ? "animate-pulse" : ""}
                  `}
                  title={canAct ? `Advance to ${step.label}` : step.label}
                >
                  {loadingStep === step.key ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : isCompleted ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : isCurrent ? (
                    <AlertTriangle className="w-3 h-3" />
                  ) : (
                    <span className="text-[10px] font-bold">{idx + 1}</span>
                  )}
                </button>

                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 ${isCompleted ? "bg-blue-500" : "bg-gray-200"}`} />
                )}
              </div>

              <span
                className={`mt-1.5 text-[10px] font-medium whitespace-nowrap text-center
                  ${isCompleted ? "text-blue-600" : ""}
                  ${isCurrent ? "text-gray-900 font-semibold" : ""}
                  ${isUpcoming ? "text-gray-400" : ""}
                  ${canAct && !isTerminal ? "cursor-pointer hover:text-blue-600" : ""}
                `}
                onClick={() => canAct && onStepClick?.(step.key)}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
