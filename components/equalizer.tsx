interface EqualizerProps {
  playing: boolean
}

export function Equalizer({ playing }: EqualizerProps) {
  const bars = [0, 0.2, 0.4, 0.1]
  return (
    <div className="flex h-4 items-end gap-[2px]" aria-hidden="true">
      {bars.map((delay, i) => (
        <span
          key={i}
          className="w-[3px] origin-bottom rounded-full bg-primary"
          style={{
            height: "100%",
            animationName: playing ? "eq-bar" : "none",
            animationDuration: "0.9s",
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            animationDelay: `${delay}s`,
            transform: playing ? undefined : "scaleY(0.35)",
          }}
        />
      ))}
    </div>
  )
}
