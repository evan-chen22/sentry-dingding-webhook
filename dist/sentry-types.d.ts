export interface SentryWebhookPayload {
    action: string;
    installation: {
        uuid: string;
    };
    data: {
        error?: SentryError;
        issue?: SentryIssue;
        event?: SentryEvent;
    };
    actor: {
        type: 'user' | 'application' | 'sentry';
        id: string;
        name: string;
    };
}
export interface SentryEvent {
    event_id: string;
    project: number;
    release: string | null;
    dist: string | null;
    platform: string;
    message: string;
    datetime: string;
    tags: Array<[string, string]>;
    _dsc: Record<string, any>;
    _meta: Record<string, any>;
    _metrics: Record<string, any>;
    _ref: number;
    _ref_version: number;
    breadcrumbs: Record<string, any>;
    contexts: Record<string, any>;
    culprit: string;
    environment: string;
    exception: Record<string, any>;
    fingerprint: string[];
    grouping_config: Record<string, any>;
    hashes: Array<string>;
    ingest_path: Array<{
        version: string;
        public_key: string;
    }>;
    key_id: string;
    level: string;
    location: string;
    logger: string;
    main_exception_id: number;
    metadata: Record<string, any>;
    nodestore_insert: number;
    received: number;
    request: Record<string, any>;
    scraping_attempts: Array<{
        details: string;
        reason: string;
        status: string;
        url: string;
    }>;
    sdk: Record<string, any>;
    symbolicated_in_app: boolean;
    timestamp: number;
    title: string;
    transaction: string;
    type: string;
    user: Record<string, any>;
    version: string;
    url: string;
    web_url: string;
    issue_url: string;
    issue_id: string;
}
export interface SentryIssue {
    url: string;
    web_url: string;
    project_url: string;
    id: string;
    shareId: string | null;
    shortId: string;
    title: string;
    culprit: string;
    permalink: string;
    logger: string | null;
    level: string;
    status: string;
    statusDetails: Record<string, any>;
    substatus: string;
    isPublic: boolean;
    platform: string;
    project: Record<string, any>;
    type: string;
    metadata: Record<string, any>;
    numComments: number;
    assignedTo: any | null;
    isBookmarked: boolean;
    isSubscribed: boolean;
    subscriptionDetails: any | null;
    hasSeen: boolean;
    annotations: any[];
    issueType: string;
    issueCategory: string;
    priority: string;
    priorityLockedAt: string | null;
    seerFixabilityScore: any | null;
    seerAutofixLastTriggered: any | null;
    isUnhandled: boolean;
    count: string;
    userCount: number;
    firstSeen: string;
    lastSeen: string;
}
export interface SentryError {
    event_id: string;
    project: number;
    release: string | null;
    dist: string | null;
    platform: string;
    message: string;
    datetime: string;
    tags: Array<[string, string]>;
    _dsc: {
        environment: string;
        org_id: string;
        public_key: string;
        release: string | null;
        replay_id: string | null;
        sample_rand: string;
        sample_rate: string;
        sampled: boolean;
        trace_id: string;
        transaction: string | null;
    };
    _meta: {
        breadcrumbs: {
            values: Record<string, {
                data: {
                    url: {
                        '': {
                            rem: Array<[string, string, number, number]>;
                            len: number;
                        };
                    };
                };
            }>;
        };
    };
    _metrics: {
        'bytes.ingested.event': number;
        'bytes.stored.event': number;
    };
    _ref: number;
    _ref_version: number;
    breadcrumbs: {
        values: Array<{
            timestamp: number;
            type: string;
            category: string;
            level: string;
            message: string;
            event_id: string;
            data?: {
                __span?: string;
                method?: string;
                request_body_size?: number;
                status_code?: number;
                url?: string;
                response_body_size?: number;
                arguments?: Array<[string | null, string]>;
                logger?: string;
            };
        }>;
    };
    contexts: {
        browser: {
            browser: string;
            name: string;
            version: string;
            type: string;
        };
        device: {
            family: string;
            model: string;
            brand: string;
            type: string;
        };
        os: {
            os: string;
            name: string;
            version: string;
            type: string;
        };
        react: {
            type: string;
            version: string;
        };
        trace: {
            trace_id: string;
            span_id: string;
            status: string;
            client_sample_rate: number;
            type: string;
        };
    };
    culprit: string;
    environment: string;
    errors: Array<{
        type: string;
        symbolicator_type: string;
        url: string;
    }>;
    exception: {
        values: Array<{
            type: string;
            value: string;
            stacktrace: {
                frames: Array<{
                    function?: string;
                    module?: string;
                    filename: string;
                    abs_path: string;
                    lineno: number;
                    colno: number;
                    in_app: boolean;
                    data: {
                        client_in_app: boolean;
                        symbolicated: boolean;
                    };
                }>;
            };
            raw_stacktrace: {
                frames: Array<{
                    function?: string;
                    filename: string;
                    abs_path: string;
                    lineno: number;
                    colno: number;
                    in_app: boolean;
                    data: {
                        orig_in_app: number;
                        client_in_app: boolean;
                    };
                }>;
            };
            mechanism: {
                type: string;
                handled: boolean;
                data: {
                    function: string;
                    handler: string;
                    target: string;
                };
            };
        }>;
    };
    extra: {
        arguments: Array<{
            currentTarget: string;
            isTrusted: boolean;
            target: string;
            type: string;
        }>;
    };
    fingerprint: string[];
    grouping_config: {
        enhancements: string;
        id: string;
    };
    hashes: string[];
    ingest_path: Array<{
        version: string;
        public_key: string;
    }>;
    key_id: string;
    level: string;
    location: string;
    logger: string;
    metadata: {
        filename: string;
        function: string;
        in_app_frame_mix: string;
        type: string;
        value: string;
    };
    nodestore_insert: number;
    received: number;
    request: {
        url: string;
        headers: Array<[string, string]>;
    };
    scraping_attempts: Array<{
        details: string;
        reason: string;
        status: string;
        url: string;
    }>;
    sdk: {
        name: string;
        version: string;
        integrations: string[];
        packages: Array<{
            name: string;
            version: string;
        }>;
    };
    symbolicated_in_app: boolean;
    timestamp: number;
    title: string;
    transaction: string;
    type: string;
    user: {
        id: string;
        email: string;
        username: string;
        ip_address: string;
        sentry_user: string;
        geo: {
            country_code: string;
            city: string;
            region: string;
        };
    };
    version: string;
    url: string;
    web_url: string;
    issue_url: string;
    issue_id: string;
}
export interface SimplifiedSentryError {
    event_id: string;
    project: number;
    platform: string;
    message: string;
    datetime: string;
    environment: string;
    level: string;
    title: string;
    culprit: string;
    user: {
        ip_address: string;
        geo?: {
            country_code: string;
            city: string;
            region: string;
        };
    };
    request: {
        url: string;
        headers: Array<[string, string]>;
    };
    exception: {
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
    tags: Array<[string, string]>;
    web_url: string;
    issue_id: string;
}
export interface SentryTags {
    [key: string]: string;
}
export type TagsConverter = (tags: Array<[string, string]>) => SentryTags;
export interface DingDingMessage {
    msgtype: 'markdown';
    markdown: {
        title: string;
        text: string;
    };
}
export interface WebhookResponse {
    statusCode: number;
    headers: {
        'Access-Control-Allow-Origin': string;
        'Access-Control-Allow-Headers': string;
        'Access-Control-Allow-Methods': string;
    };
    body: string;
}
export interface EnvironmentVariables {
    DINGDING_WEBHOOK_URL: string;
    SENTRY_CLIENT_SECRET?: string;
}
export interface SentryHeaders {
    resource?: string;
    signature?: string;
    timestamp?: string;
    requestId?: string;
}
export interface ErrorResponse {
    error: string;
    details?: string;
}
export interface SuccessResponse {
    success: boolean;
    message: string;
}
//# sourceMappingURL=sentry-types.d.ts.map