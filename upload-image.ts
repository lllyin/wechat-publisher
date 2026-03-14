import * as fs from 'fs'
import * as path from 'path'
import * as yaml from 'js-yaml'

// ============ 读取配置文件 ============
interface Config {
  wechat: {
    appId: string
    appSecret: string
  }
}

function loadConfig(): Config {
  const configPath = path.join(process.cwd(), 'config.yaml')
  if (!fs.existsSync(configPath)) {
    throw new Error('配置文件 config.yaml 不存在')
  }
  const configContent = fs.readFileSync(configPath, 'utf-8')
  return yaml.load(configContent) as Config
}

const CONFIG = loadConfig()
const WECHAT_APPID = CONFIG.wechat?.appId || process.env.WECHAT_APPID
const WECHAT_APPSECRET = CONFIG.wechat?.appSecret || process.env.WECHAT_APPSECRET

// ============ 微信 API 工具 ============

async function getAccessToken(): Promise<string> {
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WECHAT_APPID}&secret=${WECHAT_APPSECRET}`
  const response = await fetch(url)
  const data: any = await response.json()
  if (data.access_token) return data.access_token
  throw new Error(`获取 access_token 失败: ${JSON.stringify(data)}`)
}

async function uploadImage(accessToken: string, imagePath: string): Promise<{url: string, mediaId: string}> {
  const url = `https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=${accessToken}&type=image`
  const imageBuffer = fs.readFileSync(imagePath)
  const boundary = `----WebKitFormBoundary${Date.now()}`
  const formData = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="media"; filename="${path.basename(imagePath)}"\r\nContent-Type: image/png\r\n\r\n`),
    imageBuffer,
    Buffer.from(`\r\n--${boundary}--\r\n`)
  ])
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
    body: formData,
  })
  const data: any = await response.json()
  if (data.url && data.media_id) {
    return { url: data.url, mediaId: data.media_id }
  }
  throw new Error(`上传图片失败: ${JSON.stringify(data)}`)
}

// ============ 主程序 ============

async function main() {
  const imagePath = process.argv[2]
  
  if (!imagePath) {
    console.error('用法: npx vite-node upload-image.ts <图片路径>')
    process.exit(1)
  }
  
  if (!fs.existsSync(imagePath)) {
    console.error(`错误: 文件不存在 ${imagePath}`)
    process.exit(1)
  }

  console.log('🚀 开始上传图片到微信公众号素材库...\n')
  console.log(`📷 图片: ${imagePath}`)

  console.log('\n🔑 连接微信公众平台...')
  const accessToken = await getAccessToken()
  console.log('   ✅ 已连接')

  console.log('\n📤 上传图片到素材库...')
  const result = await uploadImage(accessToken, imagePath)
  console.log('   ✅ 上传成功')

  console.log('\n🎉 完成!')
  console.log(`   Media ID: ${result.mediaId}`)
  console.log(`   URL: ${result.url}`)
}

main().catch(err => {
  console.error('\n❌ 错误:', err.message)
  process.exit(1)
})
