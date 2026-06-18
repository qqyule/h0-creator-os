# 提交行动清单

最后更新：2026-06-18

这份清单用于把 CreatorOS 从当前可交付状态推进到完整的 H0 Devpost 提交状态。本文件必须保持 public-safe：不要写入密钥、私有账号信息、Vercel Team ID、包含私有控制台信息的截图，或真实用户数据。

## P0 - 提交前必须完成

- [ ] 冻结评委可见导航和核心 demo 文案。
  - 从现在开始，不再重命名录屏路径：`/dashboard`、`/calendar`、`/post/post-01`、`/analytics`。
  - 统一副标题：`Content operations for cross-platform creator teams.`
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
  - 使用 `docs/demo-video-recording-script.md` 的 2:41 时间线。
  - 推荐流程：problem animation -> dashboard -> onboarding -> loop animation -> calendar -> post detail -> status workflow -> analytics -> architecture -> closing。
  - 真实产品画面不少于 120 秒，Remotion 动画约 39 秒。
  - 使用本人英文旁白，并为最终音频添加经过校对的英文字幕。
- [ ] 发布 demo video，并确认评委无需登录即可观看。
  - 在无痕窗口检查视频、音频、字幕、1080p 清晰度和公开权限。
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
- [x] 最终视频不现场上传 CSV；只展示 analytics 页面上的入口和现有数据。
- [ ] 如果提交材料重点提到 email notification，先验证 Resend smoke。
- [ ] 只有在生产环境配置并验证过 `GOOGLE_PUBLIC_API_KEY` 后，才展示 YouTube live stats sync。
  - 如果没有验证，只把它描述为 optional public metrics sync，不在视频里现场演示。
- [ ] 除非已修复现有 arrow encoding 风险，否则 demo 中避免展示 PDF carousel export。

## P2 - 可选加分项

- [x] 在 `docs/bonus-content-pack.md` 准备主文、LinkedIn 和 X thread 草稿。
- [ ] 在 dev.to 或 Medium 发布 DynamoDB access-pattern 主文。
- [ ] 发布 LinkedIn 衍生短帖并附 architecture diagram。
- [ ] 发布六条 X thread，并在其中附 architecture diagram。
- [ ] 确认三项内容都说明 Vercel、Amazon DynamoDB、H0，并包含 `#H0Hackathon`。
- [ ] 在无痕窗口检查三项公开内容，然后把 URL 添加到 Devpost 和 `docs/submission-pack.md`。

## 建议执行顺序

1. 冻结 demo 导航、Devpost 文案和旁白。
2. 重置 `DEMO#judge` workspace 并运行本地检查。
3. 手动打开生产 demo 路径并录制产品画面。
4. 录制本人英文旁白，完成字幕和 2:41 终剪。
5. 录制后重新 seed，并完成生产只读检查。
6. 发布视频并在无痕窗口检查。
7. 发布一篇主文、LinkedIn 帖和 X thread，并检查公开权限。
8. 填写 Devpost 字段，上传 architecture diagram 和 AWS proof evidence。
9. 在无痕窗口完整检查 Devpost 页面。
10. 最晚于 2026-06-28 完成提交，预留截止日前缓冲。

## 提交锁定期不要做

- 不要新增产品范围。
- 不要重命名评委可见路由或导航标签。
- 不要修改生产环境变量，除非最后一次 smoke check 明确需要。
- 不要提交密钥、私有截图、Team ID 或账号信息。
- 不要执行破坏性的 AWS、数据库或 Git 命令。
- 不要声称 YouTube sync、Resend、S3 或 production smoke 已通过，除非确实完成了验证。
