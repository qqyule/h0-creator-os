# Demo Video 录制脚本

最后更新：2026-06-16

目标：录制一个可直接用于 H0 Devpost 的 3 分钟以内公开视频。旁白使用英文，操作提示使用中文。视频必须展示项目真实运行、说明 AWS database，并保持评委无需登录即可理解核心价值。

推荐采用混剪方案：用 Remotion 做概念、流程、架构和收尾动画；用真实浏览器录屏展示关键产品交互。这样可以减少临场点击失误，同时保留官方要求的 working project footage。

## Remotion 可行性判断

Remotion 适合完成这些段落：

- 开场价值主张动画：从 scattered tools 过渡到 CreatorOS operating loop。
- Workflow loop 动画：onboarding -> monthly plan -> post detail -> platform rewrite -> status workflow -> metrics -> insight。
- Architecture 动画：Browser、Vercel、Route Handlers、Repository、ElectroDB、DynamoDB、S3、Resend、Clerk、AI、YouTube 的数据流。
- 数据库证明叙事动画：workspace-scoped keys、timeline GSI、status GSI、conditional updates。
- 结尾 title card：CreatorOS is built to ship content operations, not just generate drafts。

Remotion 不应该替代这些内容：

- 产品真实运行画面。
- Dashboard、calendar、post detail、analytics 的核心 UI。
- 至少一段实际页面导航或交互，证明 Vercel demo 可访问。

建议比例：Remotion 动画约 60-75 秒，真实产品录屏约 95-115 秒，总时长控制在 2:40-2:55。

## 录制前准备

- [ ] 重置 demo 数据：`pnpm exec node scripts/seed-demo-workspace.mjs`
- [ ] 打开生产 URL：`https://creatoros-six.vercel.app/dashboard`
- [ ] 使用无登录状态录制，证明 public demo workspace 可访问。
- [ ] 浏览器缩放建议设为 90% 或 100%，窗口建议使用 16:9。
- [ ] 准备 Remotion 动画片段或 `docs/architecture-diagram.png`，用于讲流程和架构。
- [ ] 不展示密钥、Vercel Team ID、AWS 控制台私有信息或账号信息。
- [ ] 不展示 PDF carousel export，除非 arrow encoding 风险已修复并验证。
- [ ] 不现场展示 YouTube live sync，除非 `GOOGLE_PUBLIC_API_KEY` 已在生产验证通过。

## 一句话主线

CreatorOS is a content operations system for creator teams: it plans the next 30 posts, adapts each idea for different platforms, tracks workflow status, captures metrics, and turns performance into the next actions.

## 推荐混剪脚本

| 时间 | 画面与操作 | 英文旁白 |
| --- | --- | --- |
| 0:00-0:14 | Remotion：散落工具卡片进入 CreatorOS logo / dashboard frame。 | "Creator teams do not just need another AI writer. They need an operating system for planning, adapting, shipping, and improving content. This is CreatorOS." |
| 0:14-0:30 | Remotion：高亮完整 loop：onboarding -> plan -> post -> rewrite -> status -> metrics -> insight。 | "The product is built around one complete operating loop: capture account DNA, plan the next 30 posts, adapt each idea for each platform, ship the work, measure results, and turn performance into the next actions." |
| 0:30-0:48 | 真实录屏：打开生产 `/dashboard`，展示无需登录、plan summary、upcoming work、action items。 | "The public demo opens without sign-in, so judges can inspect a stable workspace immediately. The dashboard shows the next 30 days of content work, current workflow status, and action items." |
| 0:48-1:03 | 真实录屏：打开 `/calendar`，展示月历、状态、任务标记。 | "The calendar turns the plan into an operating view. It shows what is planned, where each post sits in the workflow, and what needs attention." |
| 1:03-1:30 | 真实录屏：打开 `/post/post-01`，展示 outline、draft、platform rewrites。 | "Inside a post, one idea becomes a production unit: outline, draft, target platforms, status, and metrics all stay tied to the same source post." |
| 1:30-1:52 | 真实录屏：切 LinkedIn、X、Rednote；展示 mockups、hook enhancer、tone sandbox。 | "The rewrite workflow adapts the idea for LinkedIn, X, YouTube, and Rednote. The editor includes visual previews, hook alternatives, and tone experiments, so the team can judge the output before shipping." |
| 1:52-2:08 | 真实录屏：展示 status workflow 和 analytics 入口，必要时只展示已有状态，不现场等待生成。 | "The workflow moves from idea to drafting, review, scheduled, and published. These status changes are backed by the server, not just local UI state." |
| 2:08-2:25 | 真实录屏：打开 `/analytics`，展示 metrics、CSV import、insights、actionable tasks。 | "After publishing, the feedback loop starts. Teams can enter metrics manually, import CSV metrics with S3 backup, generate insights, and turn those insights into task cards." |
| 2:25-2:48 | Remotion：架构动画，从 Browser 到 Vercel、Route Handlers、Repository、ElectroDB、DynamoDB，再展开 S3、Resend、Clerk、AI。 | "Technically, CreatorOS is a Next.js app on Vercel. The primary backend is Amazon DynamoDB, modeled as a workspace-scoped single-table design through ElectroDB, with timeline and status GSIs, conditional workflow updates, and server-side integrations for S3, Resend, Clerk, AI, and optional YouTube public metrics." |
| 2:48-2:56 | Remotion：收尾 title card，显示 CreatorOS 和 operating loop。 | "CreatorOS is built to prove a real B2B content operations loop, not just a prompt demo." |

## 逐字旁白合并版

如果只需要照着读，使用下面这版。语速保持稳定，目标时长约 2 分 30 秒。

```text
Creator teams do not just need another AI writer. They need an operating system for planning, adapting, shipping, and improving content. This is CreatorOS.

The product is built around one complete operating loop: capture account DNA, plan the next 30 posts, adapt each idea for each platform, ship the work, measure results, and turn performance into the next actions.

The public demo opens without sign-in, so judges can inspect a stable workspace immediately. The dashboard shows the next 30 days of content work, current workflow status, and action items.

The calendar turns the plan into an operating view. It shows what is planned, where each post sits in the workflow, and what needs attention.

Inside a post, one idea becomes a production unit: outline, draft, target platforms, status, and metrics all stay tied to the same source post.

The platform rewrite workflow adapts the same idea for LinkedIn, X, YouTube, and Rednote. The editor includes visual previews, hook alternatives, and tone experiments, so the team can judge the output before shipping.

The workflow moves from idea to drafting, review, scheduled, and published. These status changes are backed by the server, not just local UI state.

After publishing, the feedback loop starts. Teams can enter metrics manually, import CSV metrics with S3 backup, generate insights, and turn those insights into task cards.

Technically, CreatorOS is a Next.js app on Vercel. The primary backend is Amazon DynamoDB, modeled as a workspace-scoped single-table design through ElectroDB, with timeline and status GSIs, conditional workflow updates, and server-side integrations for S3, Resend, Clerk, AI, and optional YouTube public metrics.

CreatorOS is built to prove a real B2B content operations loop, not just a prompt demo.
```

## Remotion 动画分镜建议

### Scene 1: Problem To Product

- 时长：14 秒。
- 画面：散落卡片进入一个统一 workspace。
- 卡片文案：Calendar、Drafts、Metrics、Tasks、Platform variants。
- 动画：卡片从四周进入，最终吸附到 CreatorOS dashboard frame。

### Scene 2: Operating Loop

- 时长：16 秒。
- 画面：横向流程线或环形流程。
- 节点：Account DNA、30-day plan、Post detail、Platform rewrite、Status workflow、Metrics、Insight、Tasks。
- 动画：逐个节点点亮，最后形成闭环。

### Scene 3: Architecture

- 时长：23 秒。
- 画面：从 Browser 到 Vercel，再到 Route Handlers、Repository、ElectroDB、DynamoDB。
- 支线：S3、Resend、Clerk、AI provider、optional YouTube metrics。
- 动画：请求线逐段点亮，DynamoDB 标为 Primary backend。

### Scene 4: Closing Card

- 时长：8 秒。
- 画面：CreatorOS logo/title + operating loop 简写。
- 文案：Built to ship content operations, not just generate drafts。

## Remotion 实现建议

- 单独建一个视频工程或子目录，不直接塞进生产 Next.js app 的运行路径。
- 优先使用 1920x1080、30fps、总时长 170 秒以内。
- 用 `<Sequence>` 管理场景，用 `interpolate()` 和 `spring()` 做入场、连线和高亮。
- 真实网页录屏可以作为视频素材导入 Remotion，也可以后期用剪辑软件拼接。
- 如果用 Remotion 合成全片，建议把真实录屏导出为 MP4 后作为素材导入，而不是在 Remotion 里实时打开网站。
- 录屏和动画都使用相同的色彩和字体风格，避免看起来像两个不相关的视频。

## 录制操作提示

1. 开始前先停在 `/dashboard`，等页面完全加载后再开始录制。
2. 页面切换尽量用顶部导航或地址栏，避免录制中寻找按钮。
3. post detail 部分只展示 2-3 个最强画面：platform rewrites、visual previews、status workflow。
4. analytics 部分重点展示 feedback loop，不要花太久解释 CSV 表格细节。
5. 架构部分必须在 3 分钟前出现，至少明确说出 Amazon DynamoDB 是 primary backend。
6. 如果某个生成请求响应慢，直接展示已有 demo 数据，不要等待现场生成。
7. 录制完成后检查视频是否公开可访问、声音清楚、时长小于 3 分钟。

## 不建议现场展示

- PDF carousel export：除非先修复并验证 arrow encoding 风险。
- YouTube live stats sync：除非生产环境已配置并验证 `GOOGLE_PUBLIC_API_KEY`。
- AWS/Vercel/Clerk 控制台：容易暴露私有信息，也会打断产品叙事。
- 任何需要登录、管理员权限或私有测试账号的页面。
