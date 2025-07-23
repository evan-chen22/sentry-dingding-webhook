"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * Netlify Function handler for Sentry webhook
 * @param event - Netlify function event
 * @param context - Netlify function context
 * @returns Promise<WebhookResponse> Response object
 */
const handler = async (event, _context) => {
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
        const dingdingWebhookUrl = process.env['DINGDING_WEBHOOK_URL'];
        // 检查环境变量
        if (!dingdingWebhookUrl) {
            console.error('DINGDING_WEBHOOK_URL environment variable is not set');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'DingDing webhook URL not configured' })
            };
        }
        console.log('----------------========= sentryData======================== - --: ', JSON.stringify(sentryData, null, 2));
        // 构造钉钉消息内容
        const dingdingMessage = {
            msgtype: 'markdown',
            markdown: {
                title: '🚨 Sentry 告警',
                text: formatSentryMessage(sentryData)
            }
        };
        console.log('钉钉消息内容:', formatSentryMessage(sentryData));
        // 发送消息到钉钉
        const response = await axios_1.default.post(dingdingWebhookUrl, dingdingMessage, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000 // 10秒超时
        });
        console.log('钉钉响应:', response.status, response.data);
        const successResponse = {
            success: true,
            message: 'Message sent to DingDing successfully'
        };
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(successResponse)
        };
    }
    catch (error) {
        console.error('Error processing webhook:', error);
        const errorResponse = {
            error: 'Failed to process webhook',
            details: error instanceof Error ? error.message : 'Unknown error'
        };
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify(errorResponse)
        };
    }
};
exports.handler = handler;
/**
 * 格式化Sentry消息为钉钉markdown格式
 * @param sentryData - Sentry webhook数据
 * @returns 格式化后的markdown消息
 */
function formatSentryMessage(sentryData) {
    // 根据实际的Sentry数据结构提取信息
    const { action, data, actor } = sentryData;
    const error = data?.error;
    if (!error) {
        return '## 🚨 Sentry 告警\n\n**错误**: 无法解析错误数据';
    }
    // 提取基本信息
    const project = error.project || 'Unknown';
    const level = error.level || 'info';
    const environment = error.environment || 'production';
    const title = error.title || error.message || '未知错误';
    const message = error.message || '';
    const datetime = error.datetime || new Date().toISOString();
    // const culprit = error.culprit || ''; // 暂时未使用
    const webUrl = error.web_url || '';
    const issueId = error.issue_id || '';
    // 提取用户信息
    const user = error.user || {};
    const userIp = user.ip_address || '';
    const userGeo = user.geo || {};
    // 提取请求信息
    const request = error.request || {};
    const requestUrl = request.url || '';
    const requestHeaders = request.headers || [];
    // 提取异常信息
    const exception = error.exception?.values?.[0];
    const exceptionType = exception?.type || '';
    const exceptionValue = exception?.value || '';
    const stacktrace = exception?.stacktrace?.frames || [];
    // 提取标签信息
    const tags = error.tags || [];
    const tagsObj = convertTagsToObject(tags);
    // 提取上下文信息
    const contexts = error.contexts || {};
    const browser = contexts.browser || {};
    const os = contexts.os || {};
    const device = contexts.device || {};
    // 构建markdown消息
    let markdown = `## 🚨 Sentry 告警通知\n\n`;
    // 基本信息
    markdown += `**操作**: \`${action}\`\n`;
    markdown += `**项目**: \`${project}\`\n`;
    markdown += `**环境**: \`${environment}\`\n`;
    markdown += `**级别**: \`${level.toUpperCase()}\`\n`;
    markdown += `**时间**: \`${new Date(datetime).toLocaleString('zh-CN')}\`\n`;
    markdown += `**错误**: \`${title}\`\n\n`;
    // 错误消息
    if (message && message !== title) {
        markdown += `**消息**: \`${message}\`\n\n`;
    }
    // 异常详情
    if (exceptionType || exceptionValue) {
        markdown += `**异常详情**:\n`;
        if (exceptionType)
            markdown += `- 类型: \`${exceptionType}\`\n`;
        if (exceptionValue)
            markdown += `- 值: \`${exceptionValue}\`\n`;
        markdown += `\n`;
    }
    // 用户信息
    if (userIp || userGeo.city) {
        markdown += `**用户信息**:\n`;
        if (userIp)
            markdown += `- IP: \`${userIp}\`\n`;
        if (userGeo.city) {
            const location = `${userGeo.city}, ${userGeo.region}, ${userGeo.country_code}`;
            markdown += `- 位置: \`${location}\`\n`;
        }
        markdown += `\n`;
    }
    // 请求信息
    if (requestUrl || requestHeaders.length > 0) {
        markdown += `**请求信息**:\n`;
        if (requestUrl)
            markdown += `- URL: \`${requestUrl}\`\n`;
        // 提取User-Agent
        const userAgent = requestHeaders.find(([key]) => key.toLowerCase() === 'user-agent');
        if (userAgent) {
            markdown += `- User-Agent: \`${userAgent[1]}\`\n`;
        }
        markdown += `\n`;
    }
    // 浏览器和设备信息
    if (browser.name || os.name || device.family) {
        markdown += `**设备信息**:\n`;
        if (browser.name)
            markdown += `- 浏览器: \`${browser.name} ${browser.version}\`\n`;
        if (os.name)
            markdown += `- 操作系统: \`${os.name} ${os.version}\`\n`;
        if (device.family)
            markdown += `- 设备: \`${device.family}\`\n`;
        markdown += `\n`;
    }
    // 重要标签
    const importantTags = ['release', 'version', 'browser', 'os', 'device', 'transaction', 'url'];
    const relevantTags = Object.entries(tagsObj)
        .filter(([key]) => importantTags.includes(key))
        .map(([key, value]) => `- ${key}: \`${value}\``)
        .join('\n');
    if (relevantTags) {
        markdown += `**标签**:\n${relevantTags}\n\n`;
    }
    // 堆栈跟踪（如果有的话，只显示前几行）
    if (stacktrace.length > 0) {
        markdown += `**堆栈跟踪**:\n`;
        const frames = stacktrace.slice(-3); // 只显示最后3帧
        frames.forEach((frame) => {
            const filename = frame.filename || 'unknown';
            const functionName = frame.function || 'anonymous';
            const lineNo = frame.lineno || '?';
            const inApp = frame.in_app ? '(应用内)' : '(外部)';
            markdown += `- \`${filename}:${lineNo}\` in \`${functionName}\` ${inApp}\n`;
        });
        markdown += `\n`;
    }
    // 触发者信息
    if (actor && actor.type && actor.name) {
        markdown += `**触发者**: \`${actor.name}\` (${actor.type})\n\n`;
    }
    // 查看详情链接
    if (webUrl) {
        markdown += `**[查看详情](${webUrl})**`;
    }
    else if (issueId) {
        markdown += `**Issue ID**: \`${issueId}\``;
    }
    return markdown;
}
/**
 * 将标签数组转换为对象
 * @param tags - 标签数组
 * @returns 标签对象
 */
function convertTagsToObject(tags) {
    const result = {};
    if (Array.isArray(tags)) {
        tags.forEach(([key, value]) => {
            if (key && value) {
                result[key] = value;
            }
        });
    }
    return result;
}
//# sourceMappingURL=sentry-webhook.js.map