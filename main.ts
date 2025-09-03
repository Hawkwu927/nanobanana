import { serve } from "https://deno.land/std/http/server.ts";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1";
const DEFAULT_MODEL = "google/gemini-2.5-flash-image-preview";

export async function handleTestApiRequest(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { apikey } = body;

    if (!apikey) {
      return new Response(
        JSON.stringify({ error: "API Key 是必需的" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`测试 API Key: ${apikey.substring(0, 10)}...`);

    // 测试 API 连接 - 获取模型列表
    const response = await fetch(`${OPENROUTER_API_URL}/models`, {
      method: 'GET',
      headers: {
        "Authorization": `Bearer ${apikey}`,
        "HTTP-Referer": "https://nanobanana.deno.dev",
        "X-Title": "Nanobanana"
      }
    });

    if (response.ok) {
      const models = await response.json();
      console.log(`API Key 测试成功，找到 ${models.data?.length || 0} 个模型`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "API Key 连接成功",
          models: models.data?.length || 0
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else {
      const errorText = await response.text();
      console.error(`API Key 测试失败: ${errorText}`);
      
      return new Response(
        JSON.stringify({ error: `API Key 无效: ${errorText}` }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error(`API 测试错误: ${error instanceof Error ? error.message : String(error)}`);
    return new Response(
      JSON.stringify({ error: `测试失败: ${error instanceof Error ? error.message : String(error)}` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function handleGenerateRequest(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { prompt, images, apikey } = body;

    if (!prompt || !apikey) {
      return new Response(
        JSON.stringify({ error: "提示词和 API Key 都是必需的" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`生成请求: ${prompt.substring(0, 50)}...`);
    console.log(`图片数量: ${images?.length || 0}`);

    // 修改提示词，明确要求生成实际的图片而不是描述
    const enhancedPrompt = `请生成一个实际的图片，不要用文字描述。要求：${prompt}

重要：请直接生成图片文件，不要用文字描述图片内容。请返回一个图片的URL或base64编码的图片数据。`;

    const messages = [
      {
        role: "user",
        content: [
          { type: "text", text: enhancedPrompt }
        ]
      }
    ];

    if (images && images.length > 0) {
      messages[0].content.push(...images.map((img: string) => ({
        type: "image_url",
        image_url: { url: `data:image/jpeg;base64,${img}` }
      })));
    }

    const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apikey}`,
        "HTTP-Referer": "https://nanobanana.deno.dev",
        "X-Title": "Nanobanana"
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: messages,
        stream: false,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter API 错误: ${errorText}`);
      return new Response(
        JSON.stringify({ error: `API 错误: ${errorText}` }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    console.log(`完整API响应: ${JSON.stringify(result, null, 2)}`);
    
    let generatedContent = result.choices?.[0]?.message?.content || "";
    
    // 临时：显示原始内容
    console.log(`原始生成结果: "${generatedContent}"`);
    
    // 检查是否有图片在 responseImages 数组中
    const responseImages = result.choices?.[0]?.message?.images || [];
    console.log(`检测到图片数量: ${responseImages.length}`);
    
    // 如果有图片，使用第一张图片
    if (responseImages.length > 0) {
      const imageUrl = responseImages[0].image_url.url;
      console.log(`找到图片URL: ${imageUrl.substring(0, 100)}...`);
      
      // 返回图片URL
      return new Response(
        JSON.stringify({ 
          imageUrl: imageUrl,
          text: generatedContent 
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // 清理内容：移除末尾的标点符号和空白字符
    generatedContent = generatedContent.trim().replace(/[、，。！？\.,!?`]+$/, '');
    
    console.log(`清理后生成结果: "${generatedContent}"`);

    // 检查是否包含图片URL
    const imageUrlMatch = generatedContent.match(/https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|svg)/i);
    if (imageUrlMatch) {
      console.log(`找到图片URL: ${imageUrlMatch[0]}`);
      
      // 返回图片URL
      return new Response(
        JSON.stringify({ 
          imageUrl: imageUrlMatch[0],
          text: generatedContent 
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 检查是否包含 base64 图片
    const base64ImageMatch = generatedContent.match(/data:image\/[a-z]+;base64,([A-Za-z0-9+/=]+)/i);
    if (base64ImageMatch) {
      console.log(`找到 base64 图片`);
      
      // 返回base64图片数据
      return new Response(
        JSON.stringify({ 
          imageUrl: base64ImageMatch[0],
          text: generatedContent 
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 如果没有图片，返回文本内容
    return new Response(
      JSON.stringify({ 
        text: generatedContent,
        message: "生成完成，但没有检测到图片URL。请检查提示词是否明确要求生成图片。"
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error(`服务器错误: ${error instanceof Error ? error.message : String(error)}`);
    return new Response(
      JSON.stringify({ error: `服务器错误: ${error instanceof Error ? error.message : String(error)}` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function handleGeminiStreamRequest(req: Request): Promise<Response> {
  // 简化实现，返回流式响应
  return handleGenerateRequest(req);
}

export async function handleGeminiRequest(req: Request): Promise<Response> {
  // 简化实现，使用相同的处理逻辑
  return handleGenerateRequest(req);
}

async function serveStaticFile(path: string): Promise<Response> {
  try {
    const content = await Deno.readTextFile(`.${path}`);
    const contentType = path.endsWith(".css") ? "text/css" : 
                       path.endsWith(".js") ? "application/javascript" : "text/html";
    
    return new Response(content, {
      status: 200,
      headers: { "Content-Type": contentType }
    });
  } catch (error) {
    console.log(`Error serving ${path}: ${error instanceof Error ? error.message : String(error)}`);
    return new Response("File not found", { status: 404 });
  }
}

async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;
  
  console.log(`请求: ${req.method} ${path}`);

  if (path === "/") {
    return serveStaticFile("/static/index.html");
  }

  if (path === "/style.css") {
    return serveStaticFile("/static/style.css");
  }

  if (path === "/script.js") {
    return serveStaticFile("/static/script.js");
  }

  if (path === "/generate") {
    return handleGenerateRequest(req);
  }

  if (path === "/test-api") {
    return handleTestApiRequest(req);
  }

  return new Response("Not found", { status: 404 });
}

const port = parseInt(Deno.env.get("PORT") || "8002");
console.log(`改进版 Nanobanana 服务器启动在端口 ${port}`);
console.log(`访问 http://localhost:${port} 来使用应用`);
console.log(`提示: 请确保使用有效的 OpenRouter API Key`);

serve(handleRequest, { port });