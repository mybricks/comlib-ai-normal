export default {
  '@init'({ setDesc }) {

  },
  ':root': [
    {
      title: '选择模型',
      type: 'llmSelector',
      value: {
        get({ data }) {
          return data.comDef
        },
        set({ data, setDesc }, comDef) {
          if (comDef) {
            data.comDef = {
              namespace: comDef.namespace
            }
            setDesc(comDef.title)
          } else {
            data.comDef = null
            setDesc("未选择模型")
          }
        }
      }
    }
  ]
}