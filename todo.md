# 项目维护记录（二次开发 / 优化 / 修复 / 经验沉淀）

> 目的：沉淀本轮所有改动与发布操作，便于后续维护、定位与回溯。
> 更新时间：2026-02-26

---

## 1. 本轮目标与结果总览

### 目标
1. Windows 安装后默认不显示英文系统菜单（File/Edit...）。
2. 按 `Alt` 可调出**中文菜单**。
3. 统一打包产物命名，安装后应用名保持中文。
4. 完成多平台构建并上传到 GitHub Release，清理异常/旧命名包。

### 结果
- 已实现：默认隐藏菜单 + 中文菜单模板。
- 已实现：发布包命名统一为 `kunkun-creator-0.1.7-*`。
- 已实现：安装后应用显示名仍为 **坤坤漫创**。
- 已实现：`v0.1.7` Release 资产清理与重传。

---

## 2. 代码级改动（主干）

### 2.1 Electron 菜单与窗口行为优化
**文件**：`electron/main.ts`

**改动点**：
- 引入 `Menu` 与 `MenuItemConstructorOptions`。
- 新增 `createZhMenuTemplate()`：
  - 一级菜单：`文件 / 编辑 / 视图 / 窗口 / 帮助`
  - 子项尽量复用 Electron `role`（撤销、重做、复制粘贴、全屏、开发者工具等），仅中文化 label。
  - macOS 增加应用菜单（关于/隐藏/退出等）。
- 在 `app.whenReady()` 设置应用菜单：
  - `Menu.setApplicationMenu(Menu.buildFromTemplate(createZhMenuTemplate()))`
- 窗口默认隐藏菜单栏：
  - `autoHideMenuBar: true`
  - `menuBarVisible: false`
  - 窗口创建后再调用：`win.setMenuBarVisibility(false)`（兜底）

**效果**：
- Windows/Linux：默认无顶栏菜单；按 `Alt` 可见中文菜单。
- macOS：使用中文菜单结构，保持平台行为一致。

---

### 2.2 打包命名策略调整（包名英文、应用名中文）
**文件**：`electron-builder.yml`

**最终策略**：
- **安装包/分发文件名**：`kunkun-creator-<version>-*`
- **安装后应用名**：`坤坤漫创`

**关键配置**：
- `productName: 坤坤漫创`（显示名）
- `win.executableName: kunkun-creator`
- `dmg.artifactName: kunkun-creator-${version}-${arch}.${ext}`
- `nsis.artifactName: kunkun-creator-${version}-setup.${ext}`
- `nsis.shortcutName: 坤坤漫创`
- `nsis.uninstallDisplayName: ${productName}`

---

## 3. 构建与发布操作记录

### 3.1 构建命令
- mac（Intel + ARM）：`npm run build:mac`
- windows x64：`npm run build:win`

> 备注：`npm run build` 在 mac 环境会因 `prebuild` 依赖 `powershell` 失败，已改用 `build:mac/build:win` 分开构建。

### 3.2 产物位置（本轮最终）
`/release/` 下：
- `kunkun-creator-0.1.7-x64.dmg`
- `kunkun-creator-0.1.7-arm64.dmg`
- `kunkun-creator-0.1.7-setup.exe`
- 对应 `.blockmap`
- `latest.yml`
- `latest-mac.yml`

### 3.3 Release 操作（v0.1.7）
- 已上传新命名资产（`kunkun-creator-*`）。
- 已删除异常命名资产（`-0.1.7-*`）。
- 已删除旧命名资产（`moyin-creator-*`）。
- 当前发布页仅保留新命名资产与 latest 元数据。

发布页：
- https://github.com/kegeai888/KK-VideoCreator/releases/tag/v0.1.7

---

## 4. Git 提交记录（本轮关键）

- `c5193c5` fix: 默认隐藏菜单并提供中文菜单栏
- `3791078` fix: 统一 Windows 打包产物为坤坤漫创命名
- `4886902` fix: 统一发布包命名为 kunkun-creator

> 均已推送到 `origin/main`。

---

## 5. 验证结果与回归结论

### 菜单相关
- 启动后顶部菜单默认不可见：✅
- `Alt` 调出菜单且一级菜单中文：✅
- 常用 role 快捷能力可用（复制粘贴、撤销重做、全屏、开发者工具）：✅

### 构建发布相关
- mac x64/arm64 构建成功：✅
- win x64 构建成功：✅
- Release 资产与命名统一：✅

---

## 6. 经验与教训（可复用）

1. **文件名与显示名分离**最稳：
   - 文件名用 ASCII（避免发布链路编码坑）
   - 显示名用中文（品牌一致）

2. **Electron 菜单国际化最小改法**：
   - 用 `role` 保行为一致，改 `label` 即可中文化。

3. **跨平台构建命令要拆分**：
   - `build:mac` / `build:win` 分开执行，避免被某一平台 prebuild 脚本阻断。

4. **Release 清理顺序建议**：
   - 先删异常包/旧包，再传新包，最后校验资产列表。

---

## 7. 当前状态与后续建议

### 当前状态
- 主分支 `main` 已包含本轮所有关键配置改动。
- `v0.1.7` Release 已整理完成，可直接分发。

### 建议（后续可选）
1. 将 `prebuild` 改为跨平台脚本（避免 `powershell` 依赖）。
2. 增加一个发布脚本（构建→删旧资产→上传→校验）以减少手工失误。
3. 在 CI 中增加命名规范检查，确保产物前缀固定为 `kunkun-creator-`。

---

## 8. 维护速查（给后续维护者）

- 菜单逻辑入口：`electron/main.ts`
- 打包命名入口：`electron-builder.yml`
- 版本号入口：`package.json -> version`
- 发布目标：GitHub Release `v<version>`

---

## 9. UI/UX 优化记录（2026-02-26）

### 9.1 视频预览显示问题修复
**问题描述**：
- 导演-分镜页面，生成的16:9横屏视频无法完整显示在右侧预览容器中
- 视频只显示约1/3，且与左侧面板有间隙
- 1600x900分辨率下无法看到完整的视频播放进度条

**修复方案**：
- **文件**：`src/components/PreviewPanel.tsx`
- **改动**：
  - 视频容器从居中对齐改为左对齐：`items-center justify-center` → `items-start justify-start`
  - 添加横向滚动支持：`overflow-auto`
  - 调整视频尺寸约束：`w-full h-full` → `max-w-full max-h-full`

**效果**：
- 视频左对齐显示，无间隙 ✅
- 支持横向滚动查看完整播放进度条 ✅
- 16:9视频在1600x900分辨率下完整可见 ✅

**提交记录**：
- 相关提交散布在多个commit中（视频预览优化）

---

### 9.2 面板调整优化
**问题描述**：
- "AI导演"面板默认占用过大，压缩视频预览空间
- 面板最小宽度限制过大，无法拖小以获得更多预览空间
- 默认面板宽度分配不合理

**修复方案**：
- **文件**：`src/components/Layout.tsx`
- **改动**：
  - 左侧面板：`defaultSize: 28% → 25%`，`minSize: 20% → 15%`
  - 中间面板：`defaultSize: 52% → 55%`
  - 右侧面板：`minSize: 12% → 10%`

**效果**：
- 默认给予视频预览更多空间 ✅
- 允许用户拖动面板到更小尺寸 ✅
- 面板宽度与其他页面保持一致 ✅

**提交记录**：
- `238a4db` fix: 减小面板最小宽度限制，允许更大视频预览空间
- `cfee8a5` fix: 调整导演工作台面板默认宽度

---

### 9.3 文本换行支持
**问题描述**：
- 导演-编辑场景面板中，提示词、剧本、对白等文本内容过长时被截断
- 使用了 `line-clamp-2` 和 `truncate` 限制，无法查看完整内容
- 影响用户编辑和审阅长文本

**修复方案**：
- **文件**：`src/components/panels/director/split-scene-card.tsx`
- **改动**：
  - 移除文本截断限制：删除 `line-clamp-2` 和 `truncate`
  - 添加自动换行支持：`whitespace-pre-wrap break-words`
  - 设置最小高度：`min-h-[1.5em]` 确保单行文本也有合适高度

**影响范围**：
- 首帧提示词（imagePromptZh）
- 视频提示词（videoPromptZh）
- 尾帧提示词（endFramePromptZh）
- 剧本内容（script）
- 对白内容（dialogue）

**效果**：
- 长文本完整显示，支持自动换行 ✅
- 保持原有格式（换行符保留）✅
- 文本框高度自适应内容 ✅

**提交记录**：
- `236f5ad` fix: 编辑场景面板文本支持换行显示

---

### 9.4 对白文本框自动高度调整
**问题描述**：
- 对白文本框从单行 `<input>` 改为 `<Textarea>` 后支持换行
- 但文本框高度固定为1行（`rows={1}`），多行内容无法完整显示
- 需要根据内容自动调整文本框高度

**修复方案**：
- **文件**：`src/components/panels/director/split-scene-card.tsx`
- **改动**：
  1. 导入 `useEffect`：`import React, { useState, useRef, useEffect }`
  2. 添加 ref 引用：`const dialogueTextareaRef = useRef<HTMLTextAreaElement>(null)`
  3. 添加自动高度调整逻辑：
     ```tsx
     useEffect(() => {
       const textarea = dialogueTextareaRef.current;
       if (textarea) {
         textarea.style.height = 'auto';
         textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
       }
     }, [scene.dialogue]);
     ```
  4. 修改 Textarea 组件：
     - 添加 `ref={dialogueTextareaRef}`
     - 移除 `rows={1}` 固定行数
     - 添加 `overflow-y-auto` 支持滚动

**技术细节**：
- 最小高度：24px（约1行）
- 最大高度：120px（约6-7行）
- 超过最大高度时显示垂直滚动条
- 监听 `scene.dialogue` 变化，实时调整高度

**效果**：
- 单行文本显示为1行高度 ✅
- 多行文本自动扩展高度 ✅
- 超长文本显示滚动条 ✅
- 输入体验流畅自然 ✅

**提交记录**：
- `db4cd79` fix: 对白文本框支持自动换行
- `36886c6` fix: 对白文本框支持根据内容自动调整高度

---

## 10. 构建与发布记录（2026-02-26）

### 10.1 构建产物
本次构建包含所有UI/UX优化：

**Windows 64位**：
- 文件：`kunkun-creator-0.1.7-setup.exe`
- 大小：93MB
- 构建时间：2026-02-26 11:58

**Mac Intel x64**：
- 文件：`kunkun-creator-0.1.7-x64.dmg`
- 大小：114MB
- 构建时间：2026-02-26 12:03

**Mac ARM64**：
- 文件：`kunkun-creator-0.1.7-arm64.dmg`
- 大小：108MB
- 构建时间：2026-02-26 12:03

### 10.2 发布操作
- 推送代码到 `origin/main`：`36886c6`
- 上传安装包到 GitHub Release v0.1.7（覆盖旧版本）
- 发布时间：2026-02-26 12:05 (UTC+8)

### 10.3 Git 提交记录（本次优化）
```
36886c6 fix: 对白文本框支持根据内容自动调整高度
db4cd79 fix: 对白文本框支持自动换行
cfee8a5 fix: 调整导演工作台面板默认宽度
236f5ad fix: 编辑场景面板文本支持换行显示
238a4db fix: 减小面板最小宽度限制，允许更大视频预览空间
```

---

## 11. 技术经验总结

### 11.1 React Textarea 自动高度调整最佳实践
**核心思路**：
1. 使用 `useRef` 获取 textarea DOM 引用
2. 使用 `useEffect` 监听内容变化
3. 先设置 `height: 'auto'` 重置高度
4. 再根据 `scrollHeight` 设置实际高度
5. 使用 `Math.min()` 限制最大高度

**关键代码模式**：
```tsx
const textareaRef = useRef<HTMLTextAreaElement>(null);

useEffect(() => {
  const textarea = textareaRef.current;
  if (textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }
}, [content]);
```

**注意事项**：
- 必须先设置 `height: 'auto'`，否则 scrollHeight 不会缩小
- 使用 `resize-none` 禁用手动调整大小
- 添加 `overflow-y-auto` 在超过最大高度时显示滚动条
- 不要设置固定的 `rows` 属性

### 11.2 Flexbox 布局中的视频居中问题
**问题**：
- `items-center justify-center` 会导致大尺寸视频被裁剪
- 容器尺寸小于内容时，居中对齐会隐藏溢出部分

**解决方案**：
- 改用 `items-start justify-start` 左上对齐
- 添加 `overflow-auto` 支持滚动
- 使用 `max-w-full max-h-full` 而非 `w-full h-full`

**适用场景**：
- 视频/图片预览容器
- 可能超出容器的大尺寸内容
- 需要支持滚动查看的场景

### 11.3 ResizablePanel 最小宽度设置
**经验**：
- `minSize` 单位是百分比，不是像素
- 设置过大会限制用户调整灵活性
- 建议值：10-15%（给用户足够调整空间）
- 配合 `defaultSize` 提供合理的初始布局

**最佳实践**：
```tsx
<ResizablePanel
  defaultSize={25}  // 初始占25%
  minSize={15}      // 最小可缩至15%
  maxSize={45}      // 最大可扩至45%
/>
```

### 11.4 文本换行的 CSS 组合
**完整方案**：
```css
whitespace-pre-wrap  /* 保留换行符和空格 */
break-words          /* 长单词自动断行 */
min-h-[1.5em]       /* 确保最小高度 */
```

**避免使用**：
- `line-clamp-*`：会截断文本
- `truncate`：会截断文本
- `whitespace-nowrap`：会阻止换行

---

## 12. 维护建议（更新）

### 12.1 UI 组件优化清单
- [x] 视频预览左对齐 + 滚动支持
- [x] 面板宽度调整优化
- [x] 文本换行支持
- [x] 对白文本框自动高度
- [ ] 其他文本输入框考虑应用相同的自动高度逻辑
- [ ] 考虑将自动高度 Textarea 封装为可复用组件

### 12.2 代码质量改进方向
1. **组件复用**：将自动高度 Textarea 提取为独立组件
2. **类型安全**：为 onUpdateField 添加更严格的类型定义
3. **性能优化**：考虑使用 `useMemo` 缓存计算结果
4. **测试覆盖**：为关键 UI 交互添加单元测试

### 12.3 用户体验持续优化
1. 考虑添加文本框字数统计（特别是有长度限制的字段）
2. 提示词编辑时提供实时预览
3. 面板宽度记忆功能（保存用户偏好）
4. 键盘快捷键支持（如 Ctrl+Enter 提交）

---

## 13. 问题排查速查表

### 13.1 视频预览相关
- **问题**：视频显示不完整
- **排查文件**：`src/components/PreviewPanel.tsx`
- **关键属性**：`items-start`, `justify-start`, `overflow-auto`

### 13.2 面板调整相关
- **问题**：面板无法拖小/拖大
- **排查文件**：`src/components/Layout.tsx`
- **关键属性**：`minSize`, `maxSize`, `defaultSize`

### 13.3 文本显示相关
- **问题**：文本被截断或不换行
- **排查文件**：`src/components/panels/director/split-scene-card.tsx`
- **关键属性**：`whitespace-pre-wrap`, `break-words`, 移除 `line-clamp-*`

### 13.4 文本框高度相关
- **问题**：多行文本显示不全
- **排查文件**：`src/components/panels/director/split-scene-card.tsx`
- **关键代码**：`useEffect` + `scrollHeight` + `ref`

---

## 14. 相关文件索引

### 核心修改文件
- `src/components/PreviewPanel.tsx` - 视频预览容器
- `src/components/Layout.tsx` - 主布局面板配置
- `src/components/panels/director/split-scene-card.tsx` - 分镜卡片组件

### 配置文件
- `electron-builder.yml` - 打包配置
- `package.json` - 版本号和依赖
- `electron/main.ts` - 主进程和菜单配置

### 构建产物
- `release/` - 所有平台安装包
- `release/latest.yml` - Windows 更新元数据
- `release/latest-mac.yml` - Mac 更新元数据

