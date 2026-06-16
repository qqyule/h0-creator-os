# 提交行动清单

最后更新：2026-06-16

这份清单用于把 CreatorOS 从当前可交付状态推进到完整的 H0 Devpost 提交状态。本文件必须保持 public-safe：不要写入密钥、私有账号信息、Vercel Team ID、包含私有控制台信息的截图，或真实用户数据。

## P0 - 提交前必须完成

- [ ] 冻结评委可见导航和核心 demo 文案。
  - 从现在开始，不再重命名录屏路径：`/dashboard`、`/calendar`、`/post/post-01`、`/analytics`。
- [ ] 录屏前重置评委 demo workspace。
  - 命令：`pnpm exec node scripts/seed-demo-workspace.mjs`
- [ ] 运行最后一次本地质量检查。
  - 命令：`pnpm lint`
  - 命令：`pnpm typecheck`
  - 命令：`pnpm build`
  - 命令：`git diff --check`
- [ ] 手动打开生产 demo 路径。
  - `https://creatoros-six.vercel.app/dashboard`
  - `https://creatoros-six.vercel.app/calendar`
  - `https://creatoros-six.vercel.app/post/post-01`
  - `https://creatoros-six.vercel.app/analytics`
- [ ] 录制 3 分钟以内的公开视频。
  - 推荐流程：dashboard -> onboarding -> calendar -> post detail -> status workflow -> analytics -> architecture diagram。
- [ ] 发布 demo video，并确认评委无需登录即可观看。
- [ ] 填写 Devpost 必填字段。
  - Project description。
  - Live demo URL。
  - Public demo video URL。
  - AWS database used：Amazon DynamoDB。
  - Architecture diagram。
  - AWS database usage proof screenshot。
  - Vercel Team ID，记录在仓库外部。

## P1 - 最终提交前强烈建议完成

- [ ] 确认 Vercel Team ID 已记录在仓库外部。
- [ ] 确认 AWS database proof screenshot 已准备好上传到 Devpost。
  - 截图应能清楚支撑“DynamoDB 是 primary backend”的提交叙述。
- [ ] 私有证据继续保存在仓库外部。
  - Storage screenshots、Vercel Team ID、账号标识、控制台细节不要提交进仓库。
- [ ] 只有在之后可以安全 reseed demo 数据时，才重跑 production smoke。
  - 命令：`CREATOROS_BASE_URL=https://creatoros-six.vercel.app pnpm smoke:production`
  - 注意：这个脚本会通过 rewrite、status、metrics、insight 路由写入生产 demo 数据。
- [ ] 如果视频里要展示 CSV import，先验证 CSV import 和 S3 backup。
- [ ] 如果提交材料重点提到 email notification，先验证 Resend smoke。
- [ ] 只有在生产环境配置并验证过 `GOOGLE_PUBLIC_API_KEY` 后，才展示 YouTube live stats sync。
  - 如果没有验证，只把它描述为 optional public metrics sync，不在视频里现场演示。
- [ ] 除非已修复现有 arrow encoding 风险，否则 demo 中避免展示 PDF carousel export。

## P2 - 可选加分项

- [ ] 发布最多 3 条 bonus content links。
  - 每条公开内容应说明项目如何使用 Vercel 和一个 required AWS database。
  - 公开分享时包含官方要求的 hackathon attribution 或 hashtag。
- [ ] 准备一篇 DynamoDB single-table design 的短文。
  - 重点讲 workspace-scoped keys、GSI timeline reads、GSI status reads、conditional workflow updates。
- [ ] 准备一篇短 build log，说明如何把 dashboard scaffold 做成可提交的 content operations loop。

## 建议执行顺序

1. 冻结 demo 导航和文案。
2. 重置 `DEMO#judge` workspace。
3. 运行本地检查。
4. 手动打开生产 demo 路径。
5. 录制 demo video。
6. 发布视频并拿到 URL。
7. 填写 Devpost 必填字段。
8. 上传 architecture diagram 和 AWS proof evidence。
9. 做最后一次只读生产检查。
10. 提交。

## 提交锁定期不要做

- 不要新增产品范围。
- 不要重命名评委可见路由或导航标签。
- 不要修改生产环境变量，除非最后一次 smoke check 明确需要。
- 不要提交密钥、私有截图、Team ID 或账号信息。
- 不要执行破坏性的 AWS、数据库或 Git 命令。
- 不要声称 YouTube sync、Resend、S3 或 production smoke 已通过，除非确实完成了验证。
