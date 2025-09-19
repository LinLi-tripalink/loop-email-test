# 环境变量配置

## 设置说明

请在项目根目录创建 `.env.local` 文件，并添加以下环境变量：

```bash
# Claude API 配置
NEXT_PUBLIC_CLAUDE_API_KEY=你的Claude API密钥

# 火山引擎 API 配置
NEXT_PUBLIC_VOLCENGINE_ACCESS_KEY_ID=你的火山引擎AccessKeyId
NEXT_PUBLIC_VOLCENGINE_SECRET_KEY=你的火山引擎SecretKey
```

## 获取 API 密钥

### Claude API

1. 访问 [Anthropic Console](https://console.anthropic.com/)
2. 创建 API 密钥
3. 复制密钥到环境变量中

### 火山引擎 API

1. 访问 [火山引擎控制台](https://console.volcengine.com/)
2. 进入访问控制 > 访问密钥
3. 创建 AccessKey
4. 复制 AccessKeyId 和 SecretKey 到环境变量中

## 注意事项

- `.env.local` 文件已在 `.gitignore` 中，不会被提交到 Git
- 请勿在代码中硬编码 API 密钥
- 生产环境请使用更安全的密钥管理方案
