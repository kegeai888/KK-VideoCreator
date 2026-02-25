import sharp from 'sharp'
import pngToIco from 'png-to-ico'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '..')
const buildDir = path.join(rootDir, 'build')
const sourcePngPath = path.join(rootDir, 'public', 'favicon.png')

// 确保 build 目录存在
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true })
}

async function generateIcons() {
  console.log('🎨 基于 public/favicon.png 生成图标中...')

  if (!fs.existsSync(sourcePngPath)) {
    throw new Error(`未找到源图标: ${sourcePngPath}`)
  }

  const pngPath = path.join(buildDir, 'icon.png')
  const icoPath = path.join(buildDir, 'icon.ico')

  // 生成 512x512 PNG（运行时窗口图标）
  await sharp(sourcePngPath)
    .resize(512, 512, { fit: 'contain' })
    .png()
    .toFile(pngPath)
  console.log('✅ 生成 icon.png (512x512)')

  // 生成多尺寸 PNG 用于 ICO（安装器/可执行文件图标）
  const sizes = [16, 32, 48, 64, 128, 256]
  const pngBuffers = await Promise.all(
    sizes.map(size =>
      sharp(sourcePngPath)
        .resize(size, size, { fit: 'contain' })
        .png()
        .toBuffer()
    )
  )

  const icoBuffer = await pngToIco(pngBuffers)
  fs.writeFileSync(icoPath, icoBuffer)
  console.log('✅ 生成 icon.ico (多尺寸)')

  console.log(`\n📁 图标已保存到: ${buildDir}`)
}

generateIcons().catch(error => {
  console.error('❌ 图标生成失败:', error)
  process.exit(1)
})
