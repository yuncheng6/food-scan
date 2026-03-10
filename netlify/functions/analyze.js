exports.handler = async (event) => {
  // 1. 验证请求方法
  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: "仅支持 POST 请求" }) 
    };
  }

  try {
    const { image } = JSON.parse(event.body);
    
    // 2. 自动适配环境变量（兼容大写和小写）
    const apiKey = process.env.GEMINI_API_KEY || process.env.gemini_api_key;

    if (!apiKey) {
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: "API Key 未配置，请在 Netlify 检查环境变量" }) 
      };
    }

    // 3. 处理 Base64 图片数据
    const base64Data = image.split(',')[1];
    
    // 4. 【核心修复】使用 v1 稳定版接口，解决 1.5-flash 找不到的问题
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{
        parts: [
          { text: "你是一个食品安全专家。请分析这张配料表图片：1.列出所有成分 2.标出哪些是添加剂 3.给出健康建议。请用中文回答。" },
          { inlineData: { mimeType: "image/jpeg", data: base64Data } }
        ]
      }]
    };

    // 5. 【关键动作】发起异步请求给 Google Gemini
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    // 6. 【防御性检查】先检查 API 是否报错
    if (data.error) {
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: "Gemini API 报错: " + data.error.message }) 
      };
    }

    // 7. 【防御性检查】再检查是否有识别结果，解决 "reading '0'" 报错
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: "AI 识别结果为空，请确保图片清晰且包含文字。" }) 
      };
    }

    // 8. 成功获取结果
    const aiResponse = data.candidates[0].content.parts[0].text;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result: aiResponse })
    };

  } catch (error) {
    console.error("系统错误:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "分析过程中出现系统错误: " + error.message })
    };
  }
};

