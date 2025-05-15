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
      return new Response(
        JSON.stringify({ error: '未指定文件', details: '请提供有效的文件路径' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // 检查是否存在R2存储桶绑定
    if (!env.R2_BUCKET) {
      console.error('R2_BUCKET绑定未找到，请检查Cloudflare Pages的绑定设置');
      return new Response(
        JSON.stringify({ 
          error: 'R2存储桶未配置',
          details: '请确保在Cloudflare Pages的设置中正确绑定了R2存储桶' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // 获取对象
    try {
      const object = await env.R2_BUCKET.get(key);

      if (!object) {
        return new Response(
          JSON.stringify({ error: '文件未找到', details: `找不到指定路径的文件: ${key}` }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 404 
          }
        );
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
    } catch (bucketError) {
      console.error('访问R2存储桶文件时出错:', bucketError);
      return new Response(
        JSON.stringify({ 
          error: '存储桶访问错误', 
          details: bucketError.message || '无法从R2存储桶获取文件'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }
  } catch (error) {
    console.error('下载R2对象时出错:', error);
    return new Response(
      JSON.stringify({ 
        error: '服务器内部错误', 
        details: error.message || '处理下载请求时出错' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
} 