// redeploy test
async function startAnalysis(input) {

    const file = input.files[0]

    if (!file) {
        alert("请选择图片")
        return
    }

    const reader = new FileReader()

    reader.onload = async function (e) {

        const base64 = e.target.result.split(",")[1]

        const body = {
            model: "qwen-vl-plus",
            input: {
                messages: [
                    {
                        role: "user",
                        content: [
                            { image: `data:${file.type};base64,${base64}` },
                            { text: "识别图片中的食品配料表" }
                        ]
                    }
                ]
            }
        }

        const res = await fetch("/.netlify/functions/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        })

        console.log("sending request")

        const data = await res.json()

        console.log("AI返回:", data)

        alert("请求完成，查看控制台")
    }

    reader.readAsDataURL(file)
}
