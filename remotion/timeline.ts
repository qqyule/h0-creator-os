export const FPS = 30
export const WIDTH = 1920
export const HEIGHT = 1080

export const sceneFrames = {
  problem: 8 * FPS,
  loop: 6 * FPS,
  architecture: 20 * FPS,
  closing: 5 * FPS,
} as const

export const sceneStarts = {
  problem: 0,
  loop: sceneFrames.problem,
  architecture: sceneFrames.problem + sceneFrames.loop,
  closing: sceneFrames.problem + sceneFrames.loop + sceneFrames.architecture,
} as const

export const TOTAL_FRAMES =
  sceneFrames.problem + sceneFrames.loop + sceneFrames.architecture + sceneFrames.closing
