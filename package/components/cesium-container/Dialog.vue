<script setup lang="ts">
import { ref, reactive, defineExpose, defineEmits } from 'vue';
import {  ElForm, ElFormItem, ElInput } from 'element-plus';
import { ICONTYPE, PointEditConfig, PolygonEditConfig, PolylineEditConfig } from './type'
import vMove from './hooks/mouseMove.directive'
const props = defineProps<{
  type: 'point' | 'polygon' | 'polyline',
  config: PointEditConfig | PolygonEditConfig | PolylineEditConfig
}>()
const emit = defineEmits(['update'])
let formState:any = reactive<PointEditConfig | PolygonEditConfig | PolylineEditConfig>(props.config);
const open = ref<boolean>(false);
function assignmentIcon(icon:ICONTYPE) {
  formState = icon
}
function showOpen() {
  open.value = true;
}
function handleOk() {
  open.value = false;
  emit('update',formState)
}
defineExpose({
  showOpen,
  assignmentIcon
})


</script>

<template>
  <div class="dialog-wrapper" v-if="open"  v-move>
    <div class="dialog-title">编辑

      <span class="close-icon" @click.stop="handleOk">X</span>
    </div>
    <el-form
      :model="formState"
      name="basic"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 18 }"
      autocomplete="off"
    >
    <template v-if="type==='point'">
      <el-form-item
        label="比例[0~10]"
        name="lon"
      >
        <el-input type="number" :min="1" :max="10" v-model:value="formState.size" />
      </el-form-item>
      

      <el-form-item
        label="透明度[0~255]"
        name="opacity"
      >
        <el-input type="number" :min="0" :max="255" v-model:value="formState.opacity" />
      </el-form-item>
      <el-form-item
        label="说明"
        name="remark"
      >
        <el-input v-model:value="formState.remark" />
      </el-form-item>
    </template>
    <template v-else-if="type=='polyline'">
      <el-form-item
        label="线宽[0~150]"
        name="lon"
      >
        <el-input type="number" :min="1" :max="150" v-model:value="formState.width" />
      </el-form-item>
      

      <el-form-item
        label="边框色[0~255]"
        name="opacity"
      >
        <el-input type="number" :min="0" :max="255" v-model:value="formState.opacity" />
      </el-form-item>
      <el-form-item
        label="说明"
        name="remark"
      >
        <el-input type="textarea" v-model:value="formState.remark" />
      </el-form-item>
    </template>
    
    </el-form>
  </div>
</template>

<style scoped>
  .dialog-wrapper{
    width: 300px;
    border-radius: 8px;
    background: white;
    z-index: 999;
    position: absolute;
    padding: 16px;
  }
  .dialog-title{
    text-align: left;
    font-weight: bold;
    padding-bottom: 16px;
  }
  .close-icon{
    float: right;
    cursor: pointer;
    font-weight: normal
  }
</style>
