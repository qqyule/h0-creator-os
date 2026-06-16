import { Composition } from "remotion"

import { CreatorOSAnimations } from "./CreatorOSAnimations"
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from "./timeline"

export function RemotionRoot() {
  return (
    <Composition
      id="CreatorOSAnimations"
      component={CreatorOSAnimations}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  )
}
