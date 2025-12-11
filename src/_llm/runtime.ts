export default function ({ env, data, inputs, outputs }) {
    const next = !env.runtime.debug
    inputs["call"]((message) => {
        let fullContent = "" // 用于累积完整的内容


        const cards = `
当用户提到的问题与以下卡片相关时，你需要返回以下结构
\`\`\`json cmd.json
{
    "type":"ui",
    "content:"卡片id"
}
\`\`\`

目前能使用的卡片包括：

支付宝扫码
{
    "type":"ui",
    "content:"u_aGorB",
}

美团外卖进度
{
    "type":"ui",
    "content:"u_FHDtI",
}

        
        
        `

        // 将字符串message构造成消息列表
        const messages = [
            {
                role: "system",
                content:
                    `你是一个专业的问答助手，请根据用户的问题提供准确、有帮助的回答，在必要的时候，通过推送UI卡片给与用户具体的帮助。${cards}`,
            },
            {
                role: "user",
                content: message,
            },
        ]

        callLLM(messages, {
            write: (chunk) => {
                // 流式输出每个chunk
                fullContent += chunk
                outputs["chunk"](chunk)
            },
            complete: () => {
                // 完成时输出完整结果
                outputs["complete"](fullContent)
  
                const file = getCode(fullContent)
                if(file){
                    const content = JSON.parse(file.content)
                    if(content.type==='ui'){
                        outputs["cmdRenderUI"](content)
                    }
                }

            },
            error: (err) => {
                // 错误时输出错误信息
                outputs["error"](err.message || String(err))
            },
            cancel: (cancelFn) => {
                // 注册取消函数
                // 可以通过某种方式暴露给外部调用
            },
        })
    })
}

function getCode(html) {
    let file
    html.replaceAll(/```([^\n]+)\n([\s\S]*?)```/g, (match, lang, code) => {
        let codeType, fileName = lang
        //, updateType = 'default'
        if (lang) {
            lang.replaceAll(/(\S+)\s+file=['"`]([^'"]+)['"`]?/g, (match, _codeType, _fileName, _x, _updateType) => {
                codeType = _codeType
                fileName = _fileName
                //updateType = _updateType
                return
            })

            let fileNameShort

            if (codeType && fileName) {
                fileNameShort = fileName.substring(0, fileName.lastIndexOf('.'))
            } else if (fileName) {//幻觉的情况
                fileNameShort = fileName
            }

            if (fileNameShort) {

                file = {
                    name: fileNameShort,
                    type: codeType,
                    content: code
                }


            }
        }
    })

    return file
}

async function callLLM(messages, { write, complete, error, cancel }) {
    try {
        let model = `google/gemini-2.5-flash`

        let top_p = 0.4,
            temperature = 0.4

        const controller = new AbortController()
        const response = await fetch("https://ai.mybricks.world/stream-test", {
            signal: controller.signal,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messages,
                model,
            }),
        })

        cancel(() => {
            //注册回调
            controller.abort() //取消请求
        })

        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
            const { done, value } = await reader.read()

            if (done) {
                break
            }

            const chunk = decoder.decode(value, { stream: true })
            write(chunk)
        }

        complete()
    } catch (ex) {
        error(ex)
    }
}