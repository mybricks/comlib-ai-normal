import React, { useState, useEffect, useRef, useMemo } from 'react'
import css from './runtime.less'

interface Message {
  role: 'user' | 'assistant' | 'ui'
  content: string
  timestamp?: number
}

export default function ({ env, data, inputs, outputs }) {
  const [conversation, setConversation] = useState<Message[]>(data.conversation || [])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation])

  // 设置完整对话记录
  inputs['setConversation']((messages: Message[]) => {
    setConversation(messages)
  })

  // 添加单条消息
  // inputs['addMessage']((message: { role: 'user' | 'assistant'; content: string }) => {
  //   const newMessage: Message = {
  //     ...message,
  //     timestamp: Date.now()
  //   }
  //   setConversation(prev => [...prev, newMessage])
  // })

  inputs['addUserMessage']((message) => {
    setConversation((messages) => {
      return [...messages, { role: "user", content: message }]
    })
  })

  inputs['addAssistantMessage']((message) => {
    setConversation((messages) => {
      return [...messages, { role: "assistant", content: message }]
    })
  })

  inputs['addUiMessage']((message) => {
    setConversation((messages) => {
      return [...messages, { role: "ui", content: message }]
    })
  })

  // 清空对话
  inputs['clear'](() => {
    setConversation([])
  })

  const handleMessageClick = (message: Message, index: number) => {
    if (outputs['onMessageClick']) {
      outputs['onMessageClick']({
        role: message.role,
        content: message.content,
        index
      })
    }
  }

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={css.conversationContainer} style={data.maxHeight ? { maxHeight: data.maxHeight } : {}}>
      <div className={css.messagesList}>
        {conversation.length === 0 ? (
          <div className={css.emptyState}>
            <div className={css.emptyIcon}>💬</div>
            <div className={css.emptyText}>暂无对话记录</div>
          </div>
        ) : (
          conversation.map((message, index) => (
            <div
              key={index}
              className={`${css.messageItem} ${css[message.role]}`}
              onClick={() => handleMessageClick(message, index)}
            >
              {data.showAvatar && message.role !== "ui" && (
                <div className={css.avatar}>
                  {message.role === 'user' ? data.userAvatar : data.assistantAvatar}
                </div>
              )}
              <div className={css.messageContent}>
                <div
                  className={css.messageBubble}
                  style={{
                    backgroundColor: message.role === 'user' ? data.userBgColor : data.assistantBgColor,
                    color: message.role === 'user' ? data.userTextColor : data.assistantTextColor
                  }}
                >
                  <Content env={env} content={message.content}/>
                </div>
                {data.showTimestamp && message.timestamp && (
                  <div className={css.timestamp}>{formatTime(message.timestamp)}</div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}

const Content = ({ env, content }) => {
  if (typeof content === "string") {
    return content
  }

  const render = useMemo(() => {
    const json = env.getModuleJSON(content.id)
    console.log("[render]", {
      content,
      json
    })
    
    return env.renderModule(json, {
      ref(refs) {
        if (env.runtime) {
          json.inputs.forEach(({id}) => {
            refs.inputs[id](undefined);
          })
        }
        
        refs.run()
      },
      /** 禁止主动触发IO、执行自执行计算组件 */
      disableAutoRun: true,
    })
  }, [])

  return render;
}

