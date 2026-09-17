"use client"

import { cn } from "@/lib/utils"

interface RangeSliderProps {
  value: number
  max: number
  min?: number
  step?: number
  onValueChange: (value: number) => void
  onCommit?: (value: number) => void
  className?: string
  ariaLabel?: string
}

export function RangeSlider({
  value,
  max,
  min = 0,
  step = 1,
  onValueChange,
  onCommit,
  className,
  ariaLabel,
}: RangeSliderProps) {
  const safeMax = max > min ? max : min + 1
  const percent = Math.min(100, Math.max(0, ((value - min) / (safeMax - min)) * 100))

  return (
    <input
      type="range"
      min={min}
      max={safeMax}
      step={step}
      value={value}
      aria-label={ariaLabel}
      onChange={(e) => onValueChange(Number(e.target.value))}
      onMouseUp={(e) => onCommit?.(Number((e.target as HTMLInputElement).value))}
      onTouchEnd={(e) => onCommit?.(Number((e.target as HTMLInputElement).value))}
      className={cn("range-slider", className)}
      style={
        {
          background: `linear-gradient(to right, var(--primary) ${percent}%, var(--secondary) ${percent}%)`,
        } as React.CSSProperties
      }
    />
  )
}
