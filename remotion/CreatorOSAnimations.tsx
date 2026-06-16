import type { CSSProperties } from "react"
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion"

import { clampInterpolate, fadeInOut, smoothSpring } from "./motion"
import { sceneFrames, sceneStarts } from "./timeline"
import { theme } from "./theme"

const baseFill: CSSProperties = {
  background:
    "radial-gradient(circle at 14% 10%, rgba(99, 102, 241, 0.28), transparent 30%), radial-gradient(circle at 88% 18%, rgba(34, 197, 94, 0.14), transparent 28%), linear-gradient(135deg, #070b17 0%, #101827 54%, #080c17 100%)",
  color: theme.text,
  fontFamily: theme.fontFamily,
  overflow: "hidden",
}

const sceneWrap: CSSProperties = {
  ...baseFill,
  padding: 86,
}

export function CreatorOSAnimations() {
  return (
    <AbsoluteFill style={baseFill}>
      <AmbientGrid />
      <Sequence from={sceneStarts.problem} durationInFrames={sceneFrames.problem} premountFor={30}>
        <ProblemToProduct />
      </Sequence>
      <Sequence from={sceneStarts.loop} durationInFrames={sceneFrames.loop} premountFor={30}>
        <OperatingLoop />
      </Sequence>
      <Sequence
        from={sceneStarts.architecture}
        durationInFrames={sceneFrames.architecture}
        premountFor={30}
      >
        <ArchitectureScene />
      </Sequence>
      <Sequence from={sceneStarts.closing} durationInFrames={sceneFrames.closing} premountFor={30}>
        <ClosingCard />
      </Sequence>
    </AbsoluteFill>
  )
}

function AmbientGrid() {
  const frame = useCurrentFrame()
  const drift = interpolate(frame, [0, 1830], [0, 46], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })

  return (
    <AbsoluteFill
      style={{
        backgroundImage:
          "linear-gradient(rgba(148, 163, 184, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.05) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
        backgroundPosition: `${drift}px ${drift * 0.5}px`,
        maskImage: "linear-gradient(to bottom, transparent, black 16%, black 84%, transparent)",
      }}
    />
  )
}

function SceneHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div style={{ width: 720 }}>
      <div
        style={{
          color: theme.primarySoft,
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: 0,
          marginBottom: 18,
          textTransform: "uppercase",
        }}
      >
        {eyebrow}
      </div>
      <div style={{ fontSize: 76, lineHeight: 1.02, fontWeight: 780, letterSpacing: 0 }}>
        {title}
      </div>
      <div style={{ color: theme.muted, fontSize: 28, lineHeight: 1.45, marginTop: 24 }}>
        {description}
      </div>
    </div>
  )
}

function ProblemToProduct() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const opacity = fadeInOut(frame, sceneFrames.problem)
  const productScale = 0.92 + smoothSpring(frame, { fps }, 90, 42) * 0.08
  const glow = clampInterpolate(frame, [170, 270], [0, 1])
  const cards = [
    { label: "Calendar", x: 720, y: 150, dx: -260, dy: -80, color: theme.primarySoft },
    { label: "Drafts", x: 214, y: 760, dx: -300, dy: 120, color: theme.success },
    { label: "Metrics", x: 1220, y: 130, dx: 320, dy: -110, color: theme.insight },
    { label: "Tasks", x: 1390, y: 760, dx: 260, dy: 150, color: theme.warning },
    { label: "Platform variants", x: 1430, y: 340, dx: 380, dy: 20, color: theme.rednote },
  ]

  return (
    <AbsoluteFill style={{ ...sceneWrap, opacity }}>
      <SceneHeader
        eyebrow="H0 Demo Animation"
        title="From scattered tools to one operating loop"
        description="CreatorOS turns planning, adaptation, workflow status, metrics, and next actions into one judge-friendly workspace."
      />

      {cards.map((card, index) => {
        const enter = smoothSpring(frame, { fps }, 12 + index * 12, 45)
        const pull = clampInterpolate(frame, [288, 378], [0, 1])
        const cardOpacity = enter * (1 - clampInterpolate(frame, [330, 390], [0, 0.82]))
        const x = card.x + card.dx * (1 - enter) + (960 - card.x) * 0.18 * pull
        const y = card.y + card.dy * (1 - enter) + (540 - card.y) * 0.12 * pull
        const rotate = interpolate(enter, [0, 1], [index % 2 === 0 ? -8 : 8, 0])

        return (
          <div
            key={card.label}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: card.label.length > 8 ? 300 : 210,
              height: 96,
              borderRadius: 22,
              border: `1px solid ${theme.border}`,
              background: theme.panelStrong,
              boxShadow: theme.shadow,
              opacity: cardOpacity,
              transform: `rotate(${rotate}deg)`,
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "0 24px",
            }}
          >
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: 999,
                background: card.color,
                boxShadow: `0 0 26px ${card.color}`,
              }}
            />
            <span style={{ fontSize: 27, fontWeight: 720 }}>{card.label}</span>
          </div>
        )
      })}

      <WorkspaceFrame scale={productScale} glow={glow} />
    </AbsoluteFill>
  )
}

function WorkspaceFrame({ scale, glow }: { scale: number; glow: number }) {
  return (
    <div
      style={{
        position: "absolute",
        right: 118,
        bottom: 100,
        width: 860,
        height: 540,
        borderRadius: 34,
        border: `1px solid rgba(148, 163, 184, ${0.2 + glow * 0.25})`,
        background: "linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 71, 0.78))",
        boxShadow: `0 38px 120px rgba(0, 0, 0, 0.38), 0 0 ${80 + glow * 80}px rgba(99, 102, 241, ${0.16 + glow * 0.16})`,
        transform: `scale(${scale})`,
        transformOrigin: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: 74,
          borderBottom: `1px solid ${theme.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 30px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <LogoMark />
          <div style={{ fontSize: 25, fontWeight: 800 }}>CreatorOS</div>
        </div>
        <div style={{ color: theme.success, fontSize: 18, fontWeight: 700 }}>Operating loop</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "230px 1fr", height: 466 }}>
        <div style={{ borderRight: `1px solid ${theme.border}`, padding: 24 }}>
          {["Dashboard", "Calendar", "Post detail", "Analytics"].map((item, index) => (
            <div
              key={item}
              style={{
                height: 52,
                borderRadius: 14,
                background: index === 0 ? "rgba(99, 102, 241, 0.28)" : "transparent",
                color: index === 0 ? theme.text : theme.muted,
                display: "flex",
                alignItems: "center",
                paddingLeft: 18,
                fontSize: 18,
                fontWeight: 680,
                marginBottom: 10,
              }}
            >
              {item}
            </div>
          ))}
        </div>
        <div style={{ padding: 28 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
            {[
              ["30-day plan", theme.primary],
              ["In review", theme.warning],
              ["Action items", theme.success],
            ].map(([label, color]) => (
              <div
                key={label}
                style={{
                  height: 112,
                  borderRadius: 20,
                  background: theme.panelSoft,
                  border: `1px solid ${theme.border}`,
                  padding: 18,
                }}
              >
                <div style={{ width: 32, height: 6, borderRadius: 999, background: color }} />
                <div style={{ fontSize: 22, fontWeight: 760, marginTop: 24 }}>{label}</div>
              </div>
            ))}
          </div>
          <div
            style={{
              height: 244,
              borderRadius: 24,
              background: "rgba(15, 23, 42, 0.55)",
              border: `1px solid ${theme.border}`,
              marginTop: 22,
              padding: 24,
            }}
          >
            {[0, 1, 2].map((row) => (
              <div
                key={row}
                style={{
                  display: "grid",
                  gridTemplateColumns: "90px 1fr 120px",
                  gap: 18,
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <div style={{ height: 18, borderRadius: 999, background: "rgba(148, 163, 184, 0.2)" }} />
                <div
                  style={{
                    height: 20,
                    borderRadius: 999,
                    background: row === 1 ? "rgba(99, 102, 241, 0.42)" : "rgba(148, 163, 184, 0.18)",
                  }}
                />
                <div style={{ height: 28, borderRadius: 999, background: "rgba(34, 197, 94, 0.24)" }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function OperatingLoop() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const opacity = fadeInOut(frame, sceneFrames.loop)
  const nodes = [
    "Account DNA",
    "30-day plan",
    "Post detail",
    "Platform rewrite",
    "Status workflow",
    "Metrics",
    "Insight",
    "Tasks",
  ]
  const centerX = 960
  const centerY = 560
  const radiusX = 575
  const radiusY = 300
  const activeIndex = Math.min(nodes.length - 1, Math.floor(clampInterpolate(frame, [40, 395], [0, nodes.length])))

  return (
    <AbsoluteFill style={{ ...sceneWrap, opacity }}>
      <SceneHeader
        eyebrow="CreatorOS workflow"
        title="One loop, not one more prompt"
        description="Each node carries the same source idea forward, from account context to measurable next actions."
      />
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        <ellipse
          cx={centerX}
          cy={centerY}
          rx={radiusX}
          ry={radiusY}
          fill="none"
          stroke="rgba(148, 163, 184, 0.18)"
          strokeWidth="4"
        />
        <ellipse
          cx={centerX}
          cy={centerY}
          rx={radiusX}
          ry={radiusY}
          fill="none"
          stroke={theme.primarySoft}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${clampInterpolate(frame, [42, 415], [0, 2920])} 2920`}
          transform={`rotate(-90 ${centerX} ${centerY})`}
          filter="drop-shadow(0 0 14px rgba(129, 140, 248, 0.65))"
        />
      </svg>
      {nodes.map((node, index) => {
        const angle = (Math.PI * 2 * index) / nodes.length - Math.PI / 2
        const x = centerX + Math.cos(angle) * radiusX
        const y = centerY + Math.sin(angle) * radiusY
        const reveal = smoothSpring(frame, { fps }, 32 + index * 34, 26)
        const isActive = index <= activeIndex
        const color = index === 6 ? theme.insight : index >= 5 ? theme.success : theme.primarySoft

        return (
          <LoopNode
            key={node}
            label={node}
            x={x}
            y={y}
            opacity={reveal}
            active={isActive}
            color={color}
          />
        )
      })}
      <div
        style={{
          position: "absolute",
          left: 760,
          top: 455,
          width: 400,
          height: 210,
          borderRadius: 34,
          border: `1px solid ${theme.borderStrong}`,
          background: "rgba(15, 23, 42, 0.76)",
          boxShadow: theme.shadow,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <LogoMark size={58} />
        <div style={{ fontSize: 42, fontWeight: 820, marginTop: 18 }}>Content operations</div>
        <div style={{ color: theme.muted, fontSize: 22, marginTop: 12 }}>
          {"plan -> adapt -> ship -> learn"}
        </div>
      </div>
    </AbsoluteFill>
  )
}

function LoopNode({
  label,
  x,
  y,
  opacity,
  active,
  color,
}: {
  label: string
  x: number
  y: number
  opacity: number
  active: boolean
  color: string
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: x - 112,
        top: y - 42,
        width: 224,
        minHeight: 84,
        borderRadius: 999,
        border: `1px solid ${active ? color : theme.border}`,
        background: active ? "rgba(30, 41, 71, 0.94)" : "rgba(15, 23, 42, 0.72)",
        boxShadow: active ? `0 0 36px ${color}55` : "none",
        opacity,
        transform: `scale(${0.86 + opacity * 0.14})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 22px",
        fontSize: 23,
        fontWeight: 760,
        lineHeight: 1.12,
      }}
    >
      {label}
    </div>
  )
}

function ArchitectureScene() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const opacity = fadeInOut(frame, sceneFrames.architecture)
  const main = [
    { label: "Browser UI", x: 122, y: 498, color: theme.primarySoft },
    { label: "Vercel", x: 402, y: 498, color: theme.primary },
    { label: "Route Handlers", x: 686, y: 498, color: theme.primarySoft },
    { label: "Repository", x: 970, y: 498, color: theme.success },
    { label: "ElectroDB", x: 1254, y: 498, color: theme.success },
    { label: "DynamoDB", x: 1538, y: 498, color: theme.insight, badge: "Primary backend" },
  ]
  const integrations = [
    { label: "S3", x: 804, y: 238, color: theme.success },
    { label: "Resend", x: 1008, y: 238, color: theme.warning },
    { label: "Clerk", x: 1212, y: 238, color: theme.primarySoft },
    { label: "AI provider", x: 1038, y: 782, color: theme.primary },
    { label: "YouTube metrics", x: 1294, y: 782, color: theme.rednote },
  ]

  return (
    <AbsoluteFill style={{ ...sceneWrap, opacity }}>
      <SceneHeader
        eyebrow="Submission architecture"
        title="Vercel app, DynamoDB primary backend"
        description="Server route handlers own integrations and persistence. The browser never receives database, storage, email, or model credentials."
      />
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        {main.slice(0, -1).map((node, index) => {
          const next = main[index + 1]
          const progress = clampInterpolate(frame, [54 + index * 46, 104 + index * 46], [0, 1])
          return (
            <FlowLine
              key={`${node.label}-${next.label}`}
              x1={node.x + 214}
              y1={node.y + 58}
              x2={next.x}
              y2={next.y + 58}
              progress={progress}
              color={index >= 3 ? theme.success : theme.primarySoft}
            />
          )
        })}
        {integrations.map((item, index) => {
          const target = index < 3 ? main[2] : main[3]
          const progress = clampInterpolate(frame, [355 + index * 35, 405 + index * 35], [0, 1])
          return (
            <FlowLine
              key={item.label}
              x1={target.x + 106}
              y1={target.y + (index < 3 ? 0 : 116)}
              x2={item.x + 96}
              y2={item.y + (index < 3 ? 88 : 0)}
              progress={progress}
              color={item.color}
              muted
            />
          )
        })}
      </svg>
      {main.map((node, index) => (
        <ArchitectureNode
          key={node.label}
          label={node.label}
          badge={node.badge}
          x={node.x}
          y={node.y}
          color={node.color}
          progress={smoothSpring(frame, { fps }, 18 + index * 38, 28)}
        />
      ))}
      {integrations.map((node, index) => (
        <ArchitectureNode
          key={node.label}
          label={node.label}
          x={node.x}
          y={node.y}
          color={node.color}
          compact
          progress={smoothSpring(frame, { fps }, 330 + index * 28, 24)}
        />
      ))}
      <DatabaseProofCard frame={frame} />
    </AbsoluteFill>
  )
}

function FlowLine({
  x1,
  y1,
  x2,
  y2,
  progress,
  color,
  muted = false,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
  progress: number
  color: string
  muted?: boolean
}) {
  return (
    <>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(148, 163, 184, 0.16)" strokeWidth={muted ? 3 : 5} />
      <line
        x1={x1}
        y1={y1}
        x2={x1 + (x2 - x1) * progress}
        y2={y1 + (y2 - y1) * progress}
        stroke={color}
        strokeWidth={muted ? 4 : 7}
        strokeLinecap="round"
        filter={`drop-shadow(0 0 12px ${color})`}
      />
    </>
  )
}

function ArchitectureNode({
  label,
  badge,
  x,
  y,
  color,
  progress,
  compact = false,
}: {
  label: string
  badge?: string
  x: number
  y: number
  color: string
  progress: number
  compact?: boolean
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: compact ? 192 : 214,
        height: compact ? 88 : 116,
        borderRadius: 24,
        border: `1px solid ${color}`,
        background: "rgba(15, 23, 42, 0.86)",
        boxShadow: `0 0 ${22 + progress * 36}px ${color}55`,
        opacity: progress,
        transform: `translateY(${(1 - progress) * 24}px) scale(${0.92 + progress * 0.08})`,
        padding: compact ? "18px 20px" : "22px 24px",
      }}
    >
      <div style={{ width: 34, height: 6, borderRadius: 999, background: color, marginBottom: compact ? 16 : 18 }} />
      <div style={{ fontSize: compact ? 24 : 27, fontWeight: 800, lineHeight: 1.1 }}>{label}</div>
      {badge ? (
        <div
          style={{
            display: "inline-flex",
            marginTop: 14,
            padding: "7px 12px",
            borderRadius: 999,
            background: "rgba(250, 204, 21, 0.16)",
            color: theme.insight,
            fontSize: 15,
            fontWeight: 800,
          }}
        >
          {badge}
        </div>
      ) : null}
    </div>
  )
}

function DatabaseProofCard({ frame }: { frame: number }) {
  const opacity = clampInterpolate(frame, [520, 590], [0, 1])
  return (
    <div
      style={{
        position: "absolute",
        right: 112,
        top: 110,
        width: 440,
        borderRadius: 28,
        border: `1px solid ${theme.borderStrong}`,
        background: "rgba(15, 23, 42, 0.82)",
        boxShadow: theme.shadow,
        opacity,
        transform: `translateY(${(1 - opacity) * 28}px)`,
        padding: 28,
      }}
    >
      <div style={{ color: theme.insight, fontSize: 22, fontWeight: 820, marginBottom: 20 }}>DynamoDB proof points</div>
      {["Workspace-scoped keys", "Timeline and status GSIs", "Conditional workflow updates"].map((item) => (
        <div key={item} style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 16 }}>
          <span style={{ width: 12, height: 12, borderRadius: 999, background: theme.success }} />
          <span style={{ color: theme.muted, fontSize: 22 }}>{item}</span>
        </div>
      ))}
    </div>
  )
}

function ClosingCard() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const opacity = fadeInOut(frame, sceneFrames.closing, 24, 12)
  const mark = spring({ frame, fps, durationInFrames: 44, config: { damping: 160 } })

  return (
    <AbsoluteFill
      style={{
        ...baseFill,
        opacity,
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 980,
          minHeight: 490,
          borderRadius: 42,
          border: `1px solid ${theme.borderStrong}`,
          background: "linear-gradient(145deg, rgba(15, 23, 42, 0.88), rgba(30, 41, 71, 0.74))",
          boxShadow: "0 42px 140px rgba(0, 0, 0, 0.4)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "62px 72px",
          transform: `scale(${0.9 + mark * 0.1})`,
        }}
      >
        <LogoMark size={82} />
        <div style={{ fontSize: 90, fontWeight: 850, lineHeight: 1, marginTop: 28 }}>CreatorOS</div>
        <div style={{ color: theme.muted, fontSize: 32, lineHeight: 1.4, marginTop: 28 }}>
          Built to ship content operations,
          <br />
          not just generate drafts.
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 36,
            color: theme.text,
            fontSize: 20,
            fontWeight: 760,
          }}
        >
          {["plan", "adapt", "ship", "measure", "improve"].map((item, index) => (
            <span
              key={item}
              style={{
                borderRadius: 999,
                padding: "11px 17px",
                border: `1px solid ${theme.border}`,
                background: index === 4 ? "rgba(34, 197, 94, 0.18)" : "rgba(99, 102, 241, 0.14)",
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  )
}

function LogoMark({ size = 42 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
        background: `linear-gradient(135deg, ${theme.primary}, ${theme.success})`,
        boxShadow: `0 0 ${Math.round(size * 0.55)}px rgba(99, 102, 241, 0.55)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: theme.text,
        fontSize: Math.round(size * 0.48),
        fontWeight: 900,
      }}
    >
      C
    </div>
  )
}
