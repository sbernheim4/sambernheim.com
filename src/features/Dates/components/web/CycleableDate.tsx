import { Tooltip, TooltipContent, TooltipTrigger } from "../../../UI/components/ui/tooltip";
import { useCycleableDateModel } from "../../hooks/useCycleableDateModel";
import "./CycleableDate.css";

export const CycleableDate = ({
  value,
  className,
}: {
  value: Date | number | string;
  className?: string;
}) => {
  const { relative, text, formatLabel, dateTime, cycleMode } = useCycleableDateModel(value);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={`cycleable-date${className ? ` ${className}` : ""}`}
          onClick={() => {
            return cycleMode();
          }}
          aria-label={`${text}. Format: ${formatLabel}. Click to toggle between Date and Relative.`}
          data-mode={relative ? "relative" : "date"}
        >
          <time dateTime={dateTime}>{text}</time>
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <span className="cycleable-date-tooltip-line">Format: {formatLabel}</span>
        <span className="cycleable-date-tooltip-line">
          Click to toggle between Date and Relative.
        </span>
      </TooltipContent>
    </Tooltip>
  );
};
