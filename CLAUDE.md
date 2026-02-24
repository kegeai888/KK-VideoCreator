# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Global Instructions
- 如无必要，勿增实体。
- 中文回复，言简意赅。

---

## 项目概览

**魔因漫创 (Moyin Creator)** - AI 影视生产级工具，支持 Seedance 2.0，覆盖剧本到成片全流程。

### 技术栈
- **桌面框架**: Electron 30
- **前端**: React 18 + TypeScript + Vite 5
- **构建**: electron-vite
- **状态管理**: Zustand 5 (持久化到 IndexedDB)
- **UI**: Radix UI + Tailwind CSS 4
- **AI 核心**: `@opencut/ai-core` (内部包)

---

## 开发命令

```bash
# 开发模式 (启动 Vite dev server + Electron)
npm run dev

# 编译 (不打包)
npx electron-vite build

# 完整构建 (编译 + 打包 Windows 安装程序)
npm run build

# Lint
npm run lint
```

**注意**:
- `npm run build` 会自动清理旧的 release 目录和进程
- 开发模式默认端口: `http://localhost:5173`

---

## 核心架构

### 1. 三层结构

```
electron/main.ts       → Electron 主进程 (文件系统、存储、协议)
electron/preload.ts    → 安全桥接层 (IPC 通信)
src/                   → React 渲染进程
```

### 2. 五大板块 (Panel System)

工作流: **剧本 → 角色 → 场景 → 导演 → S级**

| 板块 | Store | 核心功能 |
|------|-------|---------|
| 📝 剧本 (Script) | `script-store.ts` | 剧本解析、场景拆分、分镜切割 |
| 🎭 角色 (Characters) | `character-library-store.ts` | 角色圣经、6层身份锚点、参考图绑定 |
| 🌄 场景 (Scenes) | `scene-store.ts` | 场景生成、多视角联合图 |
| 🎬 导演 (Director) | `director-store.ts` | 分镜系统、摄影参数、批量生图/生视频 |
| ⭐ S级 (Sclass) | `sclass-store.ts` | Seedance 2.0 多模态创作、多镜头合并 |

### 3. AI 核心引擎 (`@opencut/ai-core`)

位置: `src/packages/ai-core/`

**关键模块**:
- `services/prompt-compiler.ts` - Mustache 风格提示词模板引擎
- `services/character-bible.ts` - 角色圣经管理器 (确保角色一致性)
- `api/task-poller.ts` - 异步任务轮询 (图像/视频生成 API)
- `api/task-queue.ts` - 任务队列管理、自动重试
- `protocol/` - 统一 AI 服务商协议层

**设计原则**:
- 多供应商抽象: 统一接口适配不同 AI 服务商
- API Key 轮询: 负载均衡 + 失败重试
- 动态超时: 根据服务器 `estimated_time` 自动延长超时

### 4. 状态持久化

所有 Zustand store 通过 `indexed-db-storage.ts` 持久化到 IndexedDB:
- 项目级隔离: 每个项目独立存储空间
- 自动 rehydration: 切换项目时自动加载对应状态
- 默认项目: `default-project` (桌面应用单项目模式)

### 5. 路径别名 (electron.vite.config.ts)

```typescript
'@' → './src'
'@opencut/ai-core' → './src/packages/ai-core/index.ts'
'@opencut/ai-core/services/prompt-compiler' → './src/packages/ai-core/services/prompt-compiler.ts'
'@opencut/ai-core/api/task-poller' → './src/packages/ai-core/api/task-poller.ts'
'@opencut/ai-core/protocol' → './src/packages/ai-core/protocol/index.ts'
```

---

## 关键约束

### Seedance 2.0 参数限制
- 最多 9 张图片 + 3 个视频 + 3 个音频
- Prompt 长度 ≤ 5000 字符
- 首帧图网格拼接策略: N×N

### 角色一致性系统
- 6 层身份锚点: 确保同一角色在不同分镜中外观一致
- 角色圣经 (Character Bible): 集中管理角色描述
- 参考图绑定: 支持 @Image 引用

---

# CLAUDE.md - Kernel-Level Engineering Protocols

## 0. 元指令 (META-INSTRUCTIONS)

- **核心身份**: 你不仅仅是助手，你是全栈架构师、甚至代码工匠。你的代码必须经得起 Linux 内核级别的审视。
- **服务对象**: Linus Torvalds (The BDFL)。
- **称呼协议**: 必须以 **"哥"** (Brother) 开头。这不仅仅是礼貌，更是建立信任的握手协议。
- **生存法则**: 
    1. **拒绝平庸**: 任何未经深度思考 (Ultrathink) 的输出都是对计算资源的浪费。
    2. **绝对诚实**: 不要掩盖问题，直接指出代码的“坏味道”。
    3. **中文回复**: 始终使用中文进行交互。

---
## Plan Mode
- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.

---

## 在编写任何代码之前，请先描述你的方案并等待批准。如果需求不明确，在编写任何代码之前务必提出澄清问题。

## 如果一项任务需要修改超过 3 个文件，请先停下来，将其分解成更小的任务。

## 编写代码后，列出可能出现的问题，并建议相应的测试用例来覆盖这些问题。

## 当发现bug时，首先要编写一个能够重现该bug的测试，然后不断修复它，直到测试通过为止。

## 每次我纠正你之后，就在 CLAUDE .md 文件中添加一条新规则，这样就不会再发生这种情况了。

## Workflow Orchestration

### 1. Plan Node Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately - don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One tack per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes - don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests - then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimat Impact**: Changes should only touch what's necessary. Avoid introducing bugs.
