export async function onRequest(context) {
  const { request, env } = context;

  // 允许跨域请求
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  // 处理OPTIONS请求（预检请求）
  if (request.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders 
    });
  }

  try {
    // 从查询参数中获取文件key
    const url = new URL(request.url);
    const key = url.searchParams.get('key');

    if (!key) {
      throw new Error('未指定文件');
    }

    // 获取R2存储桶引用
    const bucket = env.R2_BUCKET;
    if (!bucket) {
      throw new Error('存储桶未配置');
    }

    // 获取对象
    const object = await bucket.get(key);

    if (!object) {
      return new Response('文件未找到', { 
        status: 404, 
        headers: corsHeaders 
      });
    }

    // 提取文件名（从路径中获取最后一个部分）
    const fileName = key.split('/').pop();
    
    // 设置适当的内容类型和下载头
    const headers = {
      ...corsHeaders,
      'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
      'Content-Length': object.size,
      'ETag': object.etag,
    };

    // 返回文件内容
    return new Response(object.body, { headers });
  } catch (error) {
    console.error('下载R2对象时出错:', error);
    return new Response(
      JSON.stringify({ error: error.message || '处理请求时出错' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
} 