"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: number[];
  onValueChange: (value: number[]) => void;
  className?: string;
  id?: string;
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    { min, max, step = 1, value, onValueChange, className, id, ...props },
    ref,
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(e.target.value);
      onValueChange([newValue]);
    };

    const percentage = ((value[0] - min) / (max - min)) * 100;

    return (
      <div ref={ref} className={cn("relative w-full", className)} {...props}>
        <div className="bg-secondary relative h-2 w-full rounded-full">
          <div
            className="bg-primary absolute h-full rounded-full transition-all duration-200"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={handleChange}
          className="absolute inset-0 h-2 w-full cursor-pointer opacity-0"
        />
        <div
          className="bg-background border-primary absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 transform rounded-full border-2 transition-all duration-200 hover:scale-110"
          style={{ left: `${percentage}%` }}
        />
      </div>
    );
  },
);
Slider.displayName = "Slider";

export { Slider };
