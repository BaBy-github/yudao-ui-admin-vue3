<template>
  <div ref="editorContainer" class="code-editor"></div>
</template>

<script>
import { getCurrentInstance, onMounted, watch } from 'vue'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.main.js'
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import * as _ from 'lodash'

self.MonacoEnvironment = {
  getWorker() {
    return new JsonWorker()
  }
}

export default {
  name: 'MonacoEditor',
  props: {
    modelValue: String,
    options: Object,
    language: {
      type: String,
      default: 'json'
    },
    readOnly: Boolean
  },
  setup(props, { emit }) {
    let monacoEditor = null
    const { proxy } = getCurrentInstance()

    onMounted(() => {
      console.log('props.language', props.language)
      monacoEditor = monaco.editor.create(proxy.$refs.editorContainer, {
        value: props.modelValue,
        readOnly: props.readOnly,
        language: props.language,
        theme: 'vs-dark',
        selectOnLineNumbers: true,
        renderSideBySide: false,
        automaticLayout: true
      })

      monacoEditor.onDidChangeModelContent(() => {
        emit('update:modelValue', monacoEditor.getValue())
      })
    })

    watch(
      () => props.modelValue,
      (propsModelValue) => {
        if (propsModelValue !== monacoEditor?.getValue()) {
          monacoEditor.setValue(propsModelValue)
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
  height: 100%;
  min-height: 200px;
}
</style>
