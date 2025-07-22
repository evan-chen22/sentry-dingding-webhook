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
    console.log('来自sentry请求体-sentryData: ', sentryData);
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

    console.log('response', response);
    
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
  const {
    environment = 'unknown',
    project = { name: 'unknown' },
    level = 'error',
    datetime = new Date().toISOString(),
    url = '#',
    message = 'No message provided',
    culprit = 'Unknown',
    tags = {},
    user = {}
  } = sentryData;

  // 构建markdown消息
  let markdown = `## 🚨 Sentry 告警通知\n\n`;
  
  markdown += `**环境**: \`${environment}\`\n`;
  markdown += `**项目**: \`${project.name}\`\n`;
  markdown += `**级别**: \`${level.toUpperCase()}\`\n`;
  markdown += `**时间**: \`${new Date(datetime).toLocaleString('zh-CN')}\`\n`;
  markdown += `**错误**: \`${culprit}\`\n\n`;
  
  if (message) {
    markdown += `**消息**: ${message}\n\n`;
  }

  // 添加用户信息
  if (user && (user.id || user.email || user.username)) {
    markdown += `**用户信息**:\n`;
    if (user.id) markdown += `- ID: \`${user.id}\`\n`;
    if (user.email) markdown += `- 邮箱: \`${user.email}\`\n`;
    if (user.username) markdown += `- 用户名: \`${user.username}\`\n`;
    markdown += `\n`;
  }

  // 添加重要标签
  const importantTags = ['release', 'version', 'browser', 'os', 'device'];
  const relevantTags = Object.entries(tags)
    .filter(([key]) => importantTags.includes(key))
    .map(([key, value]) => `- ${key}: \`${value}\``)
    .join('\n');

  if (relevantTags) {
    markdown += `**标签**:\n${relevantTags}\n\n`;
  }

  markdown += `**[查看详情](${url})**`;

  return markdown;
} 