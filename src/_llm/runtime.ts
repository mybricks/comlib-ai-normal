export default function ({ env, data, inputs, outputs }) {
    const next = !env.runtime.debug
    inputs["call"]((message) => {
      debugger

      
      let fullContent = '' // 用于累积完整的内容
      
      // 将字符串message构造成消息列表
      const messages = [
        {
          role: 'system',
          content: '你是一个专业的问答助手，请根据用户的问题提供准确、有帮助的回答。'
        },
        {
          role: 'user',
          content: message
        }
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
          outputs["finish"](fullContent)
        },
        error: (err) => {
          // 错误时输出错误信息
          outputs["error"](err.message || String(err))
        },
        cancel: (cancelFn) => {
          // 注册取消函数
          // 可以通过某种方式暴露给外部调用
        }
      })
    })
}

async function callLLM(messages, {
      write,
      complete,
      error,
      cancel
    }) {
    try {
        let model =  `google/gemini-2.5-flash`
      
        let top_p = 0.4,
            temperature = 0.4
       

        // messages.push({
        //   role:'user',
        //   content:appendXX
        // })

        const controller = new AbortController()
        const response = await fetch("https://ai.mybricks.world/stream-test", {
            signal: controller.signal,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messages,
                model
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
