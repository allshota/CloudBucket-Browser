export async function onRequest(context) {
  const { request, env } = context;

  // 允许跨域请求
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // 处理OPTIONS请求（预检请求）
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    // 从查询参数中获取前缀
    const url = new URL(request.url);
    const prefix = url.searchParams.get('prefix') || '';
    const delimiter = '/';

    // 检查是否存在R2存储桶绑定
    if (!env.R2_BUCKET) {
      console.error('R2_BUCKET绑定未找到，请检查Cloudflare Pages的绑定设置');
      return new Response(
        JSON.stringify({ 
          error: 'R2存储桶未配置',
          details: '请确保在Cloudflare Pages的设置中正确绑定了R2存储桶' 
        }),
        { headers, status: 500 }
      );
    }

    // 列出对象
    const options = {
      prefix: prefix ? `${prefix}/` : '',
      delimiter
    };

    try {
      const objects = await env.R2_BUCKET.list(options);
      
      // 构建响应数据
      const result = [];

      // 添加目录（在R2中是以前缀表示的）
      if (objects.delimitedPrefixes) {
        for (const prefix of objects.delimitedPrefixes) {
          const name = prefix.replace(options.prefix, '').replace('/', '');
          result.push({
            name,
            isDirectory: true
          });
        }
      }

      // 添加文件
      if (objects.objects) {
        for (const object of objects.objects) {
          // 跳过表示目录本身的空对象
          if (object.key.endsWith('/')) continue;
          
          const name = object.key.replace(options.prefix, '');
          // 跳过嵌套目录中的文件
          if (name.includes('/')) continue;
          
          result.push({
            name,
            isDirectory: false,
            size: object.size,
            uploadedAt: object.uploaded
          });
        }
      }

      return new Response(JSON.stringify(result), { headers });
    } catch (bucketError) {
      console.error('访问R2存储桶时出错:', bucketError);
      return new Response(
        JSON.stringify({ 
          error: '存储桶访问错误', 
          details: bucketError.message || '无法访问R2存储桶'
        }),
        { headers, status: 500 }
      );
    }
  } catch (error) {
    console.error('列表R2对象时出错:', error);
    return new Response(
      JSON.stringify({ 
        error: '服务器内部错误', 
        details: error.message || '处理请求时出错' 
      }),
      { headers, status: 500 }
    );
  }
} 