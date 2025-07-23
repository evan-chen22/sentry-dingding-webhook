const axios = require('axios');

// 测试数据 - 使用正确的Sentry webhook格式
const testData = {
  action: 'created',
  installation: {
    uuid: '1fd323b1-330f-43a3-ae71-f898231c0453'
  },
  data: {
    error: {
      event_id: '87f00e834ad443909b565a9dc22cdec9',
      project: 4509666010529792,
      release: null,
      dist: null,
      platform: 'javascript',
      message: 'This is your first error!',
      datetime: '2025-07-23T06:48:01.181000+00:00',
      tags: [
        ['browser', 'Edge 138.0.0'],
        ['browser.name', 'Edge'],
        ['device', 'Mac'],
        ['device.family', 'Mac'],
        ['environment', 'production'],
        ['handled', 'no'],
        ['level', 'error'],
        ['mechanism', 'instrument'],
        ['os', 'Mac OS X >=10.15.7'],
        ['os.name', 'Mac OS X'],
        ['replayId', '0a63f4592c03486dafce24e4b9af763f'],
        ['user', 'ip:156.59.149.7'],
        ['transaction', '/products'],
        ['url', 'http://localhost:5177/products']
      ],
      _dsc: {
        environment: 'production',
        org_id: '4509665992507392',
        public_key: '88a21ba27065ba7f8da4ddfa8a2990a6',
        release: null,
        replay_id: null,
        sample_rand: '0.696950413129945',
        sample_rate: '1.0',
        sampled: true,
        trace_id: 'd947b1249c5f49ad8a0f82709ddf2195',
        transaction: null
      },
      contexts: {
        browser: {
          browser: 'Edge 138.0.0',
          name: 'Edge',
          version: '138.0.0',
          type: 'browser'
        },
        device: {
          family: 'Mac',
          model: 'Mac',
          brand: 'Apple',
          type: 'device'
        },
        os: {
          os: 'Mac OS X >=10.15.7',
          name: 'Mac OS X',
          version: '>=10.15.7',
          type: 'os'
        },
        react: {
          type: 'react',
          version: '18.3.1'
        },
        trace: {
          trace_id: 'd947b1249c5f49ad8a0f82709ddf2195',
          span_id: 'a290031189d61d08',
          status: 'unknown',
          client_sample_rate: 1,
          type: 'trace'
        }
      },
      culprit: '/products',
      environment: 'production',
      errors: [
        {
          type: 'js_no_source',
          symbolicator_type: 'missing_source',
          url: 'http://localhost:5177/src/pages/Products/Products.tsx?t=1753176493889'
        }
      ],
      exception: {
        values: [
          {
            type: 'Error',
            value: 'This is your first error!',
            stacktrace: {
              frames: [
                {
                  function: 'onClick',
                  filename: '/src/pages/Products/Products.tsx',
                  abs_path: 'http://localhost:5177/src/pages/Products/Products.tsx?t=1753176493889',
                  lineno: 822,
                  colno: 23,
                  in_app: true,
                  data: {
                    client_in_app: true,
                    symbolicated: false
                  }
                }
              ]
            },
            raw_stacktrace: {
              frames: [
                {
                  function: 'onClick',
                  filename: '/src/pages/Products/Products.tsx',
                  abs_path: 'http://localhost:5177/src/pages/Products/Products.tsx?t=1753176493889',
                  lineno: 822,
                  colno: 23,
                  in_app: true,
                  data: {
                    orig_in_app: 1,
                    client_in_app: true
                  }
                }
              ]
            },
            mechanism: {
              type: 'instrument',
              handled: false,
              data: {
                function: 'addEventListener',
                handler: 'callCallback2',
                target: 'EventTarget'
              }
            }
          }
        ]
      },
      extra: {
        arguments: [
          {
            currentTarget: 'react',
            isTrusted: false,
            target: 'react',
            type: 'react-click'
          }
        ]
      },
      fingerprint: ['{{ default }}'],
      grouping_config: {
        enhancements: 'KLUv_SAYwQAAkwORs25ld3N0eWxlOjIwMjMtMDEtMTGQ#KLUv_SAYwQAAkwORs25ld3N0eWxlOjIwMjMtMDEtMTGQ#KLUv_SAYwQAAkwORs25ld3N0eWxlOjIwMjMtMDEtMTGQ',
        id: 'newstyle:2023-01-11'
      },
      hashes: [
        '4e18a01a5819df1a56146a0ba64de543',
        'fb6e128f10db2cd30a9908d7a3206d2d'
      ],
      ingest_path: [
        {
          version: '25.7.0',
          public_key: 'XE7QiyuNlja9PZ7I9qJlwQotzecWrUIN91BAO7Q5R38'
        }
      ],
      key_id: '4657244',
      level: 'error',
      location: '/src/pages/Products/Products.tsx',
      logger: '',
      metadata: {
        filename: '/src/pages/Products/Products.tsx',
        function: 'onClick',
        in_app_frame_mix: 'mixed',
        type: 'Error',
        value: 'This is your first error!'
      },
      nodestore_insert: 1753253283.498164,
      received: 1753253281.495102,
      request: {
        url: 'http://localhost:5177/products',
        headers: [
          ['User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0']
        ]
      },
      scraping_attempts: [
        {
          details: "Can't connect to restricted host localhost",
          reason: 'invalid_host',
          status: 'failure',
          url: 'http://localhost:5177/node_modules/.vite/deps/chunk-XEUBKGL2.js?v=15f1d425'
        }
      ],
      sdk: {
        name: 'sentry.javascript.react',
        version: '9.38.0',
        integrations: [
          'InboundFilters',
          'FunctionToString',
          'BrowserApiErrors',
          'Breadcrumbs',
          'GlobalHandlers',
          'LinkedErrors',
          'Dedupe',
          'HttpContext',
          'BrowserSession',
          'BrowserTracing',
          'Replay'
        ],
        packages: [
          {
            name: 'npm:@sentry/react',
            version: '9.38.0'
          }
        ]
      },
      symbolicated_in_app: false,
      timestamp: 1753253281.181,
      title: 'Error: This is your first error!',
      transaction: '/products',
      type: 'error',
      user: {
        ip_address: '156.59.149.7',
        sentry_user: 'ip:156.59.149.7',
        geo: {
          country_code: 'SG',
          city: 'Singapore',
          region: 'Singapore'
        }
      },
      version: '7',
      url: 'https://sentry.io/api/0/projects/none-kcl/javascript-react/events/87f00e834ad443909b565a9dc22cdec9/',
      web_url: 'https://sentry.io/organizations/none-kcl/issues/6754753258/events/87f00e834ad443909b565a9dc22cdec9/',
      issue_url: 'https://sentry.io/api/0/organizations/none-kcl/issues/6754753258/',
      issue_id: '6754753258'
    }
  },
  actor: {
    type: 'application',
    id: 'sentry',
    name: 'Sentry'
  }
};

// 测试本地开发服务器
async function testLocalWebhook() {
  try {
    console.log('🧪 测试本地 webhook...');
    console.log('请求数据:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post('http://localhost:8888/.netlify/functions/sentry-webhook', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ 本地测试成功!');
    console.log('响应状态:', response.status);
    console.log('响应数据:', response.data);
    
  } catch (error) {
    console.error('❌ 本地测试失败:');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应数据:', error.response.data);
    } else {
      console.error('错误信息:', error.message);
    }
  }
}

// 测试生产环境（需要替换为实际的URL）
async function testProductionWebhook(url) {
  if (!url) {
    console.log('⚠️  跳过生产环境测试（未提供URL）');
    return;
  }
  
  try {
    console.log('🧪 测试生产环境 webhook...');
    console.log('请求数据:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post(url, testData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ 生产环境测试成功!');
    console.log('响应状态:', response.status);
    console.log('响应数据:', response.data);
    
  } catch (error) {
    console.error('❌ 生产环境测试失败:');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应数据:', error.response.data);
    } else {
      console.error('错误信息:', error.message);
    }
  }
}

// 主函数
async function main() {
  console.log('🚀 开始测试 Sentry to DingDing Webhook\n');
  
  // 测试本地环境
  await testLocalWebhook();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 测试生产环境（如果有提供URL）
  const productionUrl = process.argv[2];
  await testProductionWebhook(productionUrl);
  
  console.log('\n✨ 测试完成!');
}

// 运行测试
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testLocalWebhook,
  testProductionWebhook,
  testData
}; 