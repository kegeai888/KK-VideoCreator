# 项目维护记录（二次开发 / 优化 / 修复 / 经验沉淀）

> 目的：沉淀本轮所有改动与发布操作，便于后续维护、定位与回溯。
> 更新时间：2026-02-25

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

