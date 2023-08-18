<template>
  <div ref="editorContainer" class="code-editor"></div>
</template>

<script>
import { getCurrentInstance, onMounted, watch } from 'vue'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.main.js'
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'

self.MonacoEnvironment = {
  getWorker() {
    return new JsonWorker()
  }
}

export default {
  name: 'MonacoEditor',
  props: {
    value: String
  },
  setup(props, { emit }) {
    let monacoEditor = null
    const { proxy } = getCurrentInstance()

    onMounted(() => {
      monacoEditor = monaco.editor.create(proxy.$refs.editorContainer, {
        value: props.value,
        readOnly: false,
        language: 'json',
        theme: 'vs-dark',
        selectOnLineNumbers: true,
        renderSideBySide: false
      })

      monacoEditor.onDidChangeModelContent(() => {
        const currentValue = monacoEditor.getValue()
        emit('update:value', currentValue)
      })
    })

    watch(
      () => props.value,
      (newValue) => {
        if (newValue !== monacoEditor?.getValue()) {
          monacoEditor.setValue(newValue)
        }
      }
    )

    return {}
  }
}
</script>

<style scoped>
.code-editor {
  width: 100%;
  min-height: 200px;
}
</style>
