# Sentry to DingDing Webhook 使用说明

## 📋 概述

本项目是一个用于将 Sentry 告警转发到钉钉机器人的 Netlify Functions 服务。根据实际的 Sentry webhook 数据结构进行了优化，能够正确处理和格式化告警信息。

## 🚀 快速开始

### 1. 部署到 Netlify

```bash
# 克隆项目
git clone <your-repo-url>
cd sentry-dingding-webhook

# 部署到 Netlify
# 方法1: 通过 Git 连接
# 方法2: 直接上传文件夹
```

### 2. 配置环境变量

在 Netlify 控制台中设置：

```bash
DINGDING_WEBHOOK_URL=https://oapi.dingtalk.com/robot/send?access_token=YOUR_TOKEN
```

### 3. 获取 Webhook URL

部署完成后，你的 webhook 端点是：
```
https://your-site-name.netlify.app/webhook
```

### 4. 配置 Sentry

1. 进入 Sentry 项目设置
2. 选择 "Integrations" → "Webhooks"
3. 添加 webhook URL
4. 选择需要的事件类型

## 📊 数据结构

### Sentry Webhook 格式

```typescript
interface SentryWebhookPayload {
  action: string;                    // 操作类型 (created, updated, etc.)
  installation: {
    uuid: string;                    // 安装ID
  };
  data: {
    error?: SentryError;             // 错误详情
    issue?: SentryIssue;             // 问题详情
    event_alert?: SentryEventAlert;  // 事件告警
    metric_alert?: SentryMetricAlert; // 指标告警
    comment?: SentryComment;         // 评论
    installation?: SentryInstallation; // 安装信息
  };
  actor: {
    type: 'user' | 'application' | 'sentry';
    id: string;
    name: string;
  };
}
```

### 错误数据结构

```typescript
interface SentryError {
  event_id: string;                  // 事件ID
  project: number;                   // 项目ID
  platform: string;                  // 平台
  message: string;                   // 错误消息
  datetime: string;                  // 时间戳
  environment: string;               // 环境
  level: string;                     // 错误级别
  title: string;                     // 错误标题
  user: {                            // 用户信息
    ip_address: string;
    geo?: {
      country_code: string;
      city: string;
      region: string;
    };
  };
  request: {                         // 请求信息
    url: string;
    headers: Array<[string, string]>;
  };
  exception: {                       // 异常详情
    values: Array<{
      type: string;
      value: string;
      stacktrace: {
        frames: Array<{
          function?: string;
          filename: string;
          lineno: number;
          colno: number;
          in_app: boolean;
        }>;
      };
    }>;
  };
  tags: Array<[string, string]>;     // 标签
  web_url: string;                   // 详情链接
  issue_id: string;                  // Issue ID
}
```

## 🎨 消息格式

### 钉钉消息示例

```
## 🚨 Sentry 告警通知

**操作**: `created`
**项目**: `4509666010529792`
**环境**: `production`
**级别**: `ERROR`
**时间**: `2025/7/23 14:48:01`
**错误**: `Error: This is your first error!`

**异常详情**:
- 类型: `Error`
- 值: `This is your first error!`

**用户信息**:
- IP: `156.59.149.7`
- 位置: `Singapore, Singapore, SG`

**请求信息**:
- URL: `http://localhost:5177/products`
- User-Agent: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36...`

**设备信息**:
- 浏览器: `Edge 138.0.0`
- 操作系统: `Mac OS X >=10.15.7`
- 设备: `Mac`

**标签**:
- browser: `Edge 138.0.0`
- device: `Mac`
- environment: `production`
- level: `error`
- os: `Mac OS X >=10.15.7`
- transaction: `/products`
- url: `http://localhost:5177/products`

**堆栈跟踪**:
- `/src/pages/Products/Products.tsx:822` in `onClick` (应用内)

**触发者**: `Sentry` (application)

**[查看详情](https://sentry.io/organizations/none-kcl/issues/6754753258/events/87f00e834ad443909b565a9dc22cdec9/)**
```

## 🧪 测试

### 本地测试

```bash
# 启动开发服务器
npm run dev

# 运行测试
npm run test
# 或者
node test-webhook.js
```

### 生产环境测试

```bash
# 测试生产环境
npm run test https://your-site.netlify.app/webhook
# 或者
node test-webhook.js https://your-site.netlify.app/webhook
```

### 手动测试

```bash
curl -X POST https://your-site.netlify.app/webhook \
  -H "Content-Type: application/json" \
  -d @test-data.json
```

## 🔧 自定义配置

### 修改消息格式

编辑 `netlify/functions/sentry-webhook.ts` 中的 `formatSentryMessage` 函数：

```javascript
function formatSentryMessage(sentryData) {
  // 自定义消息格式
  const { action, data, actor } = sentryData;
  const error = data?.error;
  
  // 你的自定义逻辑
  // ...
}
```

### 添加更多字段

```javascript
// 提取更多信息
const contexts = error.contexts || {};
const react = contexts.react || {};
const trace = contexts.trace || {};

// 添加到消息中
if (react.version) {
  markdown += `**React版本**: \`${react.version}\`\n`;
}
```

### 过滤特定错误

```javascript
// 过滤特定类型的错误
if (error.level === 'info') {
  return '## ℹ️ 信息通知\n\n**消息**: 这是一条信息，不需要告警';
}
```

## 📈 监控和日志

### 查看函数日志

在 Netlify 控制台的 Functions 页面查看执行日志：

```
来自sentry请求体-sentryData: {
  "action": "created",
  "installation": {
    "uuid": "1fd323b1-330f-43a3-ae71-f898231c0453"
  },
  "data": {
    "error": {
      "event_id": "87f00e834ad443909b565a9dc22cdec9",
      ...
    }
  }
}
```

### 钉钉响应日志

```
钉钉响应: 200 {
  "errcode": 0,
  "errmsg": "ok"
}
```

## 🚨 故障排除

### 常见问题

1. **环境变量未设置**
   ```
   错误: DingDing webhook URL not configured
   解决: 检查 DINGDING_WEBHOOK_URL 环境变量
   ```

2. **钉钉 Webhook 无效**
   ```
   错误: 网络请求失败
   解决: 检查钉钉机器人配置
   ```

3. **数据解析错误**
   ```
   错误: Failed to process webhook
   解决: 检查 Sentry webhook 数据格式
   ```

### 调试技巧

1. **查看完整请求数据**
   ```javascript
   console.log('Sentry数据:', JSON.stringify(sentryData, null, 2));
   ```

2. **检查标签转换**
   ```javascript
   console.log('标签对象:', convertTagsToObject(tags));
   ```

3. **验证消息格式**
   ```javascript
   console.log('生成的markdown:', markdown);
   ```

## 📚 相关文件

- `sentry-types.ts` - TypeScript 类型定义
- `test-webhook.js` - 测试脚本
- `netlify/functions/sentry-webhook.ts` - 主要处理函数
- `README.md` - 项目说明
- `DEPLOYMENT.md` - 部署指南

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## �� 许可证

MIT License 