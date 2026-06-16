import { Easing, interpolate, spring } from "remotion"

type Fps = {
  fps: number
}

export function clampInterpolate(
  frame: number,
  inputRange: [number, number],
  outputRange: [number, number],
) {
  return interpolate(frame, inputRange, outputRange, {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })
}

export function fadeInOut(frame: number, duration: number, inFrames = 18, outFrames = 18) {
  const intro = clampInterpolate(frame, [0, inFrames], [0, 1])
  const outro = clampInterpolate(frame, [duration - outFrames, duration], [1, 0])
  return Math.min(intro, outro)
}

export function smoothSpring(frame: number, { fps }: Fps, delay = 0, durationInFrames = 30) {
  return spring({
    frame: frame - delay,
    fps,
    durationInFrames,
    config: { damping: 200 },
  })
}
