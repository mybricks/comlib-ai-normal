export default function ({ env, data, inputs, outputs }) {
  const next = !env.runtime.debug
  inputs['create']((nextValue) => {
    const { sceneId, store } = nextValue

    if (next) {
      console.log("创建组件: ", data.comDef, nextValue)

      /**
       * slotInfo
       *  - comId 组件id
       *  - slotId 插槽id
       *  默认使用传入的sceneId，没有comId和slotId则添加至场景，若有，例：向表单容器的content插槽添加组件
       */
      const { slotInfo, data: comData } = store

      env.canvas.appendCom({
        sceneId,
        ...slotInfo,
      }, {
        // 包含组件信息（namespace，表达添加的组件
        ...data.comDef,
        // 组件数据源，引擎内Object.assgin来合并
        data: { ...comData }
      })

      outputs['finish'](sceneId)
    }
  })
}
