import React, { useState, useEffect, useRef } from 'react'
import css from './runtime.less'

interface Message {
  role: 'user' | 'assistant'
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
  inputs['addMessage']((message: { role: 'user' | 'assistant'; content: string }) => {
    const newMessage: Message = {
      ...message,
      timestamp: Date.now()
    }
    setConversation(prev => [...prev, newMessage])
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
    <div className={css.conversationContainer} style={{ maxHeight: data.maxHeight || '500px' }}>
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
              {data.showAvatar && (
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
                  {message.content}
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

