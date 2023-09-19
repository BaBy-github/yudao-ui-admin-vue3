<template>
  <vxe-table
    border
    ref="keyValueTableRef"
    show-overflow
    size="mini"
    height="100%"
    :data="currentValue"
    :column-config="{ resizable: true }"
    :edit-config="{ trigger: 'click', mode: 'cell', showStatus: true }"
    @edit-closed="editClosedEvent"
  >
    <vxe-column type="seq" width="60" />
    <vxe-column field="key" title="Key" :edit-render="{ autofocus: '.vxe-input--inner' }">
      <template #edit="{ row }">
        <vxe-input v-model="row.key" placeholder="Key" type="text" />
      </template>
    </vxe-column>
    <vxe-column field="value" title="Value" :edit-render="{ autofocus: '.vxe-input--inner' }">
      <template #edit="{ row }">
        <vxe-input v-model="row.value" placeholder="Value" type="text" />
      </template>
    </vxe-column>
    <vxe-column title="操作" width="60" show-overflow>
      <template #default="{ row }">
        <vxe-button type="text" icon="vxe-icon-delete" @click="removeKeyValueItem(row)" />
      </template>
    </vxe-column>
  </vxe-table>
</template>
<script setup lang="ts">
import { generateUUID } from '@/utils'
import * as _ from 'lodash'
import { VxeTableEvents, VxeTableInstance } from 'vxe-table'
import { NewsItem } from '@/views/mp/draft/components'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})
interface KeyValueItem {
  id: number
  key: string
  value: string
}
const currentValue = computed<NewsItem>({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})
const emit = defineEmits(['update:modelValue'])
const keyValueTableRef = ref<VxeTableInstance<KeyValueItem>>()
const addKeyValueItem = async (row?: KeyValueItem | number) => {
  const $table = keyValueTableRef.value
  if ($table) {
    const newKeyValueItem: KeyValueItem = { id: generateUUID(), key: '', value: '' }
    currentValue.value.push(newKeyValueItem)
    const { row: newRow } = await $table.insertAt(newKeyValueItem, row)
    await $table.setEditCell(newRow, 'key')
  }
}
const addKeyValueItemNextTick = (row?: KeyValueItem | number) => {
  nextTick(() => {
    addKeyValueItem(row)
  })
}
const removeKeyValueItem = async (row: KeyValueItem | number) => {
  currentValue.value = _.reject(currentValue.value, { id: row.id })
  const $table = keyValueTableRef.value
  if ($table) {
    $table.remove(row)
  }
}
const isEmptyKeyValueItem = (keyValueItem: KeyValueItem) => {
  return _.isEmpty(keyValueItem.key) && _.isEmpty(keyValueItem.value)
}
const editClosedEvent: VxeTableEvents.EditClosed = ({ row, column }) => {
  if (_.last(currentValue.value)?.id === row.id && !isEmptyKeyValueItem(row)) {
    addKeyValueItem(-1)
  }
}
const getNotEmptyKeyValueItems = () => {
  return _.filter(currentValue.value, (keyValueItem) => keyValueItem.key || keyValueItem.value)
}
defineExpose({ addKeyValueItem, addKeyValueItemNextTick, getNotEmptyKeyValueItems }) // 提供 新增 方法，用于新增行
</script>
