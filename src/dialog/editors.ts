export default {
  '@init'({ data }) {
    
  },
    '@resize': {
    options: ['width', 'height']
  },
  ':root': [
    {
      title: '显示设置',
      items: [
        {
          title: '显示头像',
          type: 'switch',
          value: {
            get({ data }) {
              return data.showAvatar
            },
            set({ data }, value) {
              data.showAvatar = value
            }
          }
        },
        {
          title: '显示时间',
          type: 'switch',
          value: {
            get({ data }) {
              return data.showTimestamp
            },
            set({ data }, value) {
              data.showTimestamp = value
            }
          }
        },
        {
          title: '用户头像',
          type: 'text',
          ifVisible({ data }) {
            return data.showAvatar
          },
          value: {
            get({ data }) {
              return data.userAvatar
            },
            set({ data }, value) {
              data.userAvatar = value
            }
          }
        },
        {
          title: 'AI头像',
          type: 'text',
          ifVisible({ data }) {
            return data.showAvatar
          },
          value: {
            get({ data }) {
              return data.assistantAvatar
            },
            set({ data }, value) {
              data.assistantAvatar = value
            }
          }
        },
        {
          title: '最大高度',
          type: 'text',
          description: '对话框最大高度，如：500px 或 80vh',
          value: {
            get({ data }) {
              return data.maxHeight
            },
            set({ data }, value) {
              data.maxHeight = value
            }
          }
        }
      ]
    },
    {
      title: '样式配置',
      items: [
        {
          title: '用户消息背景色',
          type: 'colorPicker',
          value: {
            get({ data }) {
              return data.userBgColor || '#007AFF'
            },
            set({ data }, value) {
              data.userBgColor = value
            }
          }
        },
        {
          title: 'AI消息背景色',
          type: 'colorPicker',
          value: {
            get({ data }) {
              return data.assistantBgColor || '#E5E5EA'
            },
            set({ data }, value) {
              data.assistantBgColor = value
            }
          }
        },
        {
          title: '用户消息文字色',
          type: 'colorPicker',
          value: {
            get({ data }) {
              return data.userTextColor || '#FFFFFF'
            },
            set({ data }, value) {
              data.userTextColor = value
            }
          }
        },
        {
          title: 'AI消息文字色',
          type: 'colorPicker',
          value: {
            get({ data }) {
              return data.assistantTextColor || '#000000'
            },
            set({ data }, value) {
              data.assistantTextColor = value
            }
          }
        }
      ]
    }
  ]
}

