<script setup lang="ts">
import { ref, reactive, defineExpose, defineEmits } from 'vue';
import { Modal, Form, FormItem, Input } from 'ant-design-vue';
import { ICONTYPE } from './type'
const emit = defineEmits(['drawPoint'])
let formState = reactive<ICONTYPE>({
  iconUrl: '',
  lat: '', // 纬度
  lon: '', // 经度
  remark: '', // 说明
});
const open = ref<boolean>(false);
function assignmentIcon(icon:ICONTYPE) {
  formState = icon
}
function showOpen() {
  open.value = true;
}
function handleOk() {
  open.value = false;
  emit('drawPoint',formState)
}
defineExpose({
  showOpen,
  assignmentIcon
})


</script>

<template>
  <a-modal v-model:open="open" :closable="false" title="" @ok="handleOk">
    <a-form
      :model="formState"
      name="basic"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 18 }"
      autocomplete="off"
    >
      <a-form-item
        label="经度"
        name="lon"
      >
        <a-input v-model:value="formState.lon" />
      </a-form-item>

      <a-form-item
        label="纬度"
        name="lat"
      >
        <a-input v-model:value="formState.lat" />
      </a-form-item>
      <a-form-item
        label="说明"
        name="remark"
      >
        <a-input v-model:value="formState.remark" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<style scoped>

</style>
