exports.handler = async (event) => {
if (event.httpMethod !== "POST") {
return { statusCode: 405, body: JSON.stringify({ error: "仅支持 POST" }) };
}

try {
const { image } = JSON.parse(event.body);
// 自动适配环境变量名（大写或小写）
const apiKey = process.env.GEMINI_API_KEY || process.env.gemini_api_key;

if (!apiKey) {
  return { statusCode: 500, body: JSON.stringify({ error: "API Key 未配置" }) };
}

const base64Data = image.split(',')[1];
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

const payload = {
  contents: [{
    parts: [
      { text: "你是一个食品安全专家。请分析这张配料表图片：1.列出所有成分 2.标出有害添加剂 3.给出健康建议。请用中文回答。" },
      { inlineData: { mimeType: "image/jpeg", data: base64Data } }
    ]
  }]
};

const response = await fetch(apiUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
});

const data = await response.json();

// --- 核心修复：增加安全检查 ---
if (data.error) {
  return { statusCode: 500, body: JSON.stringify({ error: "API报错: " + data.error.message }) };
}

if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
  return { statusCode: 500, body: JSON.stringify({ error: "AI未能识别内容，请确保图片清晰" }) };
}

const aiResponse = data.candidates[0].content.parts[0].text;

return {
  statusCode: 200,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ result: aiResponse })
};
} catch (error) {
return { statusCode: 500, body: JSON.stringify({ error: "系统错误: " + error.message }) };
}
};

