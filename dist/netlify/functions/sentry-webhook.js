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
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
    };
    // 处理OPTIONS请求（预检请求）
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers,
            body: "",
        };
    }
    // 只允许POST请求
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: "Method Not Allowed" }),
        };
    }
    try {
        // 解析Sentry发送的数据
        const sentryData = JSON.parse(event.body);
        const dingdingWebhookUrl = process.env["DINGDING_WEBHOOK_URL"];
        // 检查环境变量
        if (!dingdingWebhookUrl) {
            console.error("DINGDING_WEBHOOK_URL environment variable is not set");
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    error: "DingDing webhook URL not configured",
                }),
            };
        }
        // 构造钉钉消息内容
        const dingdingMessage = {
            msgtype: "markdown",
            markdown: {
                title: "🚨 Sentry 告警",
                text: formatSentryMessage(sentryData),
            },
        };
        console.log("钉钉消息内容:", formatSentryMessage(sentryData));
        // 发送消息到钉钉
        const response = await axios_1.default.post(dingdingWebhookUrl, dingdingMessage, {
            headers: {
                "Content-Type": "application/json",
            },
            timeout: 10000, // 10秒超时
        });
        console.log("钉钉响应:", response.status, response.data);
        const successResponse = {
            success: true,
            message: "Message sent to DingDing successfully",
        };
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(successResponse),
        };
    }
    catch (error) {
        console.error("Error processing webhook:", error);
        const errorResponse = {
            error: "Failed to process webhook",
            details: error instanceof Error ? error.message : "Unknown error",
        };
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify(errorResponse),
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
    console.log("来自sentry告警请求 - sentryData", JSON.stringify(sentryData, null, 2));
    const error = data?.error;
    const issue = data?.issue;
    const event = data?.event;
    if (!error && !issue && !event) {
        return "## 🚨 Sentry 告警\n\n**错误**: 无法解析错误数据";
    }
    if (error) {
        // 提取基本信息
        const project = error.project || "Unknown";
        const level = error.level || "info";
        const environment = error.environment || "production";
        const title = error.title || error.message || "未知错误";
        const message = error.message || "";
        const datetime = error.datetime || new Date().toISOString();
        // const culprit = error.culprit || ''; // 暂时未使用
        const webUrl = error.web_url || "";
        const issueId = error.issue_id || "";
        // 提取用户信息
        const user = error.user || {};
        const userIp = user.ip_address || "";
        const userGeo = user.geo || {};
        // 提取请求信息
        const request = error.request || {};
        const requestUrl = request.url || "";
        const requestHeaders = request.headers || [];
        // 提取异常信息
        const exception = error.exception?.values?.[0];
        const exceptionType = exception?.type || "";
        const exceptionValue = exception?.value || "";
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
        markdown += `**环境**: \`${environment}\`\n\n`;
        markdown += `**级别**: \`${level.toUpperCase()}\`\n\n`;
        markdown += `**时间**: \`${new Date(datetime).toLocaleString("zh-CN")}\`\n\n`;
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
        if (user.id) {
            markdown += `**用户信息**:\n`;
            if (user.id)
                markdown += `- 用户ID: \`${user.id}\`\n`;
            if (user.email)
                markdown += `- 用户邮箱: \`${user.email}\`\n`;
            if (user.username)
                markdown += `- 用户名: \`${user.username}\`\n`;
            markdown += `\n`;
        }
        // 请求信息
        if (requestUrl || requestHeaders.length > 0) {
            markdown += `**请求信息**:\n`;
            if (requestUrl)
                markdown += `- URL: \`${requestUrl}\`\n`;
            // 提取User-Agent
            const userAgent = requestHeaders.find(([key]) => key.toLowerCase() === "user-agent");
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
        const importantTags = [
            "release",
            "version",
            "browser",
            "os",
            "device",
            "transaction",
            "url",
        ];
        const relevantTags = Object.entries(tagsObj)
            .filter(([key]) => importantTags.includes(key))
            .map(([key, value]) => `- ${key}: \`${value}\``)
            .join("\n");
        if (relevantTags) {
            markdown += `**标签**:\n${relevantTags}\n\n`;
        }
        // 堆栈跟踪（如果有的话，只显示前几行）
        if (stacktrace.length > 0) {
            markdown += `**堆栈跟踪**:\n`;
            const frames = stacktrace.slice(-3); // 只显示最后3帧
            frames.forEach((frame) => {
                const filename = frame.filename || "unknown";
                const functionName = frame.function || "anonymous";
                const lineNo = frame.lineno || "?";
                const inApp = frame.in_app ? "(应用内)" : "(外部)";
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
    else if (issue) {
        // 关闭soucemap上传会没有error，只有issue
        let markdown = `## 🚨 Sentry 告警通知\n\n`;
        // 提取issue基本信息
        const project = issue.project?.["name"] || "Unknown";
        const level = issue.level || "info";
        const title = issue.title || "未知问题";
        const culprit = issue.culprit || "";
        const status = issue.status || "";
        const issueType = issue.issueType || "";
        const issueCategory = issue.issueCategory || "";
        const priority = issue.priority || "";
        const count = issue.count || "0";
        const userCount = issue.userCount || 0;
        const firstSeen = issue.firstSeen || "";
        const lastSeen = issue.lastSeen || "";
        const webUrl = issue.web_url || "";
        const shortId = issue.shortId || "";
        const platform = issue.platform || "";
        const isUnhandled = issue.isUnhandled || false;
        const metadata = issue.metadata || {};
        // 基本信息
        markdown += `**项目**: \`${project}\`\n\n`;
        markdown += `**级别**: \`${level.toUpperCase()}\`\n\n`;
        markdown += `**状态**: \`${status}\`\n\n`;
        markdown += `**问题类型**: \`${issueType}\`\n\n`;
        markdown += `**问题分类**: \`${issueCategory}\`\n\n`;
        markdown += `**优先级**: \`${priority}\`\n\n`;
        markdown += `**平台**: \`${platform}\`\n\n`;
        // 时间信息
        if (firstSeen) {
            markdown += `**首次出现**: \`${new Date(firstSeen).toLocaleString("zh-CN")}\`\n\n`;
        }
        if (lastSeen) {
            markdown += `**最后出现**: \`${new Date(lastSeen).toLocaleString("zh-CN")}\`\n\n`;
        }
        // 问题标题
        markdown += `**问题**: \`${title}\`\n\n`;
        // 错误位置
        if (culprit) {
            markdown += `**错误位置**: \`${culprit}\`\n\n`;
        }
        // 统计信息
        markdown += `**出现次数**: \`${count}\`\n\n`;
        markdown += `**影响用户数**: \`${userCount}\`\n\n`;
        // 是否未处理
        if (isUnhandled) {
            markdown += `**⚠️ 未处理异常**: \`是\`\n\n`;
        }
        // 元数据信息
        if (metadata && Object.keys(metadata).length > 0) {
            markdown += `**元数据**:\n`;
            Object.entries(metadata).forEach(([key, value]) => {
                if (value && typeof value === 'string') {
                    markdown += `- ${key}: \`${value}\`\n`;
                }
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
        else if (shortId) {
            markdown += `**Issue ID**: \`${shortId}\``;
        }
        return markdown;
    }
    else if (event) {
        // 关闭soucemap上传会没有error，只有issue
        let markdown = `## 🚨 Sentry 告警通知\n\n`;
        markdown += `**项目**: \`${event.project}\`\n\n`;
        markdown += `**级别**: \`${event.level.toUpperCase()}\`\n\n`;
        markdown += `**平台**: \`${event.platform}\`\n\n`;
        markdown += `**时间**: \`${new Date(event.datetime).toLocaleString("zh-CN")}\`\n\n`;
        markdown += `**错误**: \`${event.title}\`\n\n`;
        markdown += `**消息**: \`${event.message}\`\n\n`;
        markdown += `**错误位置**: \`${event.culprit}\`\n\n`;
        markdown += `[查看详情](${event.web_url})\n\n`;
        return markdown;
    }
    return "## 🚨 Sentry 告警\n\n**错误**: 无法解析错误数据";
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