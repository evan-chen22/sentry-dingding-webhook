const axios = require('axios');

exports.handler = async (event, context) => {
  // 设置CORS头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // 处理OPTIONS请求（预检请求）
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // 只允许POST请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // 解析Sentry发送的数据
    const sentryData = JSON.parse(event.body);
    const dingdingWebhookUrl = process.env.DINGDING_WEBHOOK_URL;

    // 检查环境变量
    if (!dingdingWebhookUrl) {
      console.error('DINGDING_WEBHOOK_URL environment variable is not set');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'DingDing webhook URL not configured' })
      };
    }
    
    console.log('来自sentry请求体-sentryData: ', JSON.stringify(sentryData, null, 2));
    
    // 构造钉钉消息内容
    const dingdingMessage = {
      msgtype: 'markdown',
      markdown: {
        title: '🚨 Sentry 告警',
        text: formatSentryMessage(sentryData)
      }
    };

    // 发送消息到钉钉
    const response = await axios.post(dingdingWebhookUrl, dingdingMessage, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10秒超时
    });

    console.log('钉钉响应:', response.status, response.data);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Message sent to DingDing successfully' 
      })
    };

  } catch (error) {
    console.error('Error processing webhook:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to process webhook',
        details: error.message 
      })
    };
  }
};

// 格式化Sentry消息为钉钉markdown格式
function formatSentryMessage(sentryData) {
  // 根据Sentry webhook文档提取关键信息
  const event = sentryData?.event || {};
  const project = sentryData?.project || 'Unknown';
  const level = sentryData?.level || 'info';
  const url = sentryData?.url || '';
  const datetime = sentryData?.datetime || new Date().toISOString();
  
  // 提取事件详情
  const title = event?.title || event?.message || '未知错误';
  const message = event?.message || '';
  const environment = event?.environment || 'production';
  const release = event?.release || '';
  const user = event?.user || {};
  const tags = event?.tags || {};
  const request = event?.request || {};
  const exception = event?.exception?.values?.[0] || {};
  const stacktrace = exception?.stacktrace || {};
  
  // 构建markdown消息
  let markdown = `## 🚨 Sentry 告警通知\n\n`;
  
  // 基本信息
  markdown += `**项目**: \`${project}\`\n`;
  markdown += `**环境**: \`${environment}\`\n`;
  markdown += `**级别**: \`${level.toUpperCase()}\`\n`;
  markdown += `**时间**: \`${new Date(datetime).toLocaleString('zh-CN')}\`\n`;
  markdown += `**错误**: \`${title}\`\n\n`;
  
  // 错误消息
  if (message && message !== title) {
    markdown += `**消息**: \`${message}\`\n\n`;
  }
  
  // 异常类型和值
  if (exception.type || exception.value) {
    markdown += `**异常详情**:\n`;
    if (exception.type) markdown += `- 类型: \`${exception.type}\`\n`;
    if (exception.value) markdown += `- 值: \`${exception.value}\`\n`;
    markdown += `\n`;
  }
  
  // 用户信息
  if (user && (user.id || user.email || user.username || user.ip_address)) {
    markdown += `**用户信息**:\n`;
    if (user.id) markdown += `- ID: \`${user.id}\`\n`;
    if (user.email) markdown += `- 邮箱: \`${user.email}\`\n`;
    if (user.username) markdown += `- 用户名: \`${user.username}\`\n`;
    if (user.ip_address) markdown += `- IP: \`${user.ip_address}\`\n`;
    markdown += `\n`;
  }
  
  // 请求信息
  if (request.url || request.method) {
    markdown += `**请求信息**:\n`;
    if (request.method) markdown += `- 方法: \`${request.method}\`\n`;
    if (request.url) markdown += `- URL: \`${request.url}\`\n`;
    if (request.headers) {
      const userAgent = request.headers['User-Agent'] || request.headers['user-agent'];
      if (userAgent) markdown += `- User-Agent: \`${userAgent}\`\n`;
    }
    markdown += `\n`;
  }
  
  // 重要标签
  const importantTags = ['release', 'version', 'browser', 'os', 'device', 'transaction'];
  const relevantTags = Object.entries(tags)
    .filter(([key]) => importantTags.includes(key))
    .map(([key, value]) => `- ${key}: \`${value}\``)
    .join('\n');

  if (relevantTags) {
    markdown += `**标签**:\n${relevantTags}\n\n`;
  }
  
  // Release信息
  if (release) {
    markdown += `**Release**: \`${release}\`\n\n`;
  }
  
  // 堆栈跟踪（如果有的话，只显示前几行）
  if (stacktrace.frames && stacktrace.frames.length > 0) {
    markdown += `**堆栈跟踪**:\n`;
    const frames = stacktrace.frames.slice(-3); // 只显示最后3帧
    frames.forEach((frame, index) => {
      const filename = frame.filename || 'unknown';
      const functionName = frame.function || 'anonymous';
      const lineNo = frame.lineno || '?';
      markdown += `- \`${filename}:${lineNo}\` in \`${functionName}\`\n`;
    });
    markdown += `\n`;
  }
  
  // 查看详情链接
  if (url) {
    markdown += `**[查看详情](${url})**`;
  }

  return markdown;
} 