export async function handler(event) {
    try {
        const body = JSON.parse(event.body)

        const response = await fetch(
            "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.DASHSCOPE_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            }
        )

        const data = await response.json()

        return {
            statusCode: 200,
            body: JSON.stringify(data)
        }

    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: err.message
            })
        }
    }
}