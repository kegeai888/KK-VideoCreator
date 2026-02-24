# 项目维护记录 (TODO & 修改日志)

> 本文档记录对「坤坤漫创工具箱」的所有二次开发、优化和修复工作，方便后续维护和回溯。

---

## 📅 2026-02-25 品牌升级改造

### 🎯 改造目标
将原「魔因漫创」品牌升级为「坤坤漫创工具箱」，包括视觉标识、命名和用户界面的全面更新。

### ✅ 已完成的修改

#### 1. 品牌标识更新
- **Logo 替换**
  - 源文件：`docs/images/logo.png` (66KB)
  - 目标位置：
    - `build/icon.png` - Electron 任务栏图标
    - `public/favicon.png` - 网页标题栏图标
  - 影响范围：桌面应用任务栏、浏览器标签页、Dashboard 页面

#### 2. 应用名称修改
- **Electron 主进程** (`electron/main.ts:40`)
  - 窗口标题：`魔因漫创` → `坤坤漫创工具箱`

- **Dashboard 页面** (`src/components/Dashboard.tsx:285`)
  - 主标题：`魔因漫创` → `坤坤漫创工具箱`
  - 副标题保持：`Moyin Creator Studio`
  - Logo 显示：从 Aperture SVG 图标改为 `/favicon.png` 图片

#### 3. 侧边栏标识修改
- **TabBar 组件** (`src/components/TabBar.tsx:25, 113`)
  - 品牌字母标识：`M` → `K`
  - 影响位置：
    - Dashboard 模式侧边栏顶部
    - Project 模式侧边栏顶部

### 📂 涉及文件清单
```
修改的文件：
├── electron/main.ts              # Electron 窗口标题
├── src/components/Dashboard.tsx  # Dashboard 主标题和 Logo
├── src/components/TabBar.tsx     # 侧边栏品牌标识
├── build/icon.png                # 任务栏图标（已替换）
└── public/favicon.png            # 网页图标（已替换）

资源文件：
└── docs/images/logo.png          # 品牌 Logo 源文件
```

### 🔧 技术细节

#### Logo 图片引用方式
```tsx
// Dashboard.tsx 中的实现
<div className="w-10 h-10 flex items-center justify-center">
  <img src="/favicon.png" alt="Logo" className="w-10 h-10" />
</div>
```

#### Electron 图标配置
```typescript
// electron/main.ts
const iconPath = path.join(process.env.APP_ROOT, 'build/icon.png')
win = new BrowserWindow({
  title: '坤坤漫创工具箱',
  icon: iconPath,
  // ...
})
```

### 🚀 部署说明
1. **开发环境**：修改后自动热更新（Vite HMR）
2. **生产构建**：需重新执行 `npm run build` 打包
3. **图标缓存**：Windows 系统可能需要清理图标缓存或重启资源管理器

### ⚠️ 注意事项
- Logo 文件格式：PNG，尺寸 66KB
- 保持 `docs/images/logo.png` 为唯一真实源，其他位置为副本
- 修改品牌名称时需同步更新：
  - `README.md` 项目介绍
  - `package.json` 应用名称
  - 用户文档和帮助链接

---

## 🔮 待办事项 (TODO)

### 高优先级
- [ ] 更新 `README.md` 中的品牌名称和介绍
- [ ] 更新 `package.json` 中的 `productName` 字段
- [ ] 检查并更新所有用户可见的文案（设置面板、帮助文档等）
- [ ] 更新打包配置中的应用名称（`electron-builder.yml`）

### 中优先级
- [ ] 统一代码注释中的品牌名称
- [ ] 更新 Git 提交历史中的项目描述
- [ ] 检查是否有硬编码的旧品牌名称

### 低优先级
- [ ] 考虑是否需要更新 favicon.ico（Windows 图标）
- [ ] 评估是否需要多尺寸 Logo（macOS .icns）
- [ ] 准备品牌升级的用户通知文案

---

## 📝 开发经验总结

### 品牌升级最佳实践
1. **集中管理资源**：将 Logo 源文件放在 `docs/images/` 统一管理
2. **自动化复制**：可考虑在构建脚本中自动复制 Logo 到各目标位置
3. **版本控制**：品牌资源文件应纳入 Git 版本控制
4. **文档同步**：品牌修改必须同步更新用户文档

### Electron 图标处理经验
- **开发模式**：图标路径基于 `APP_ROOT`
- **生产模式**：图标需打包到 `resources` 目录
- **跨平台**：Windows 需 `.ico`，macOS 需 `.icns`，Linux 需 `.png`
- **缓存问题**：系统可能缓存旧图标，需清理或重启

### React 组件图片引用
- **Public 目录**：`/favicon.png` 直接引用 `public/` 下的文件
- **Assets 目录**：需通过 `import` 导入，Vite 会处理路径
- **外部 URL**：直接使用完整 URL

---

## 🐛 已知问题

### 无

---

## 📚 参考资料
- [Electron 官方文档 - 应用图标](https://www.electronjs.org/docs/latest/tutorial/application-distribution#application-icon)
- [Vite 静态资源处理](https://vitejs.dev/guide/assets.html)
- [React 图片引用最佳实践](https://react.dev/learn/importing-and-exporting-components)

---

**最后更新**：2026-02-25
**维护者**：项目开发团队
