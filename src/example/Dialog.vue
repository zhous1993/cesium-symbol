<script setup lang="ts">
import { ref, reactive, defineExpose, defineEmits } from 'vue'
import { ElForm, ElFormItem, ElInput, ElColorPicker, ElSelect, ElOption } from 'element-plus'
import { PointStyle, PolygonStyle, PolylineStyle } from './type'
import vMove from './hooks/mouseMove.directive'
defineProps<{
  type: 'point' | 'polygon' | 'polyline'
}>()
const emit = defineEmits(['update'])
let formState: any = reactive<PointStyle | PolygonStyle | PolylineStyle>({})
console.log(formState)
const open = ref<boolean>(false)
function assignmentConfig(icon: PointStyle | PolygonStyle | PolylineStyle) {
  formState = reactive({ ...icon })
}
function showOpen() {
  open.value = true
}
function handleOk() {
  open.value = false
  emit('update', formState)
}
const handleValidate = () => {
  emit('update', formState)
}
defineExpose({
  showOpen,
  assignmentConfig
})
</script>

<template>
  <div class="dialog-wrapper" v-if="open" v-move>
    <div class="dialog-title"
      >编辑

      <span class="close-icon" @click.stop="handleOk">X</span>
    </div>
    <el-form :model="formState" name="basic" @validate="handleValidate">
      <template v-if="type === 'point'">
        <el-form-item label="比例[0~10]" prop="size">
          <el-input type="number" :min="1" :max="10" v-model="formState.size" />
        </el-form-item>

        <el-form-item label="透明度[0~255]" prop="opacity">
          <el-input type="number" :min="0" :max="255" v-model="formState.opacity" />
        </el-form-item>
        <el-form-item label="说明" prop="remark">
          <el-input v-model="formState.remark" />
        </el-form-item>
      </template>
      <template v-else-if="type == 'polyline'">
        <el-form-item label="线宽[0~150]" prop="width">
          <el-input type="number" :min="1" :max="150" v-model="formState.width" />
        </el-form-item>

        <el-form-item label="边框色" prop="color">
          <el-color-picker v-model="formState.color" />
        </el-form-item>
        <el-form-item label="说明" prop="remark">
          <el-input type="textarea" v-model="formState.remark" />
        </el-form-item>
      </template>
      <template v-else-if="type === 'polygon'">
        <el-form-item label="线宽[0~150]" prop="borderWidth">
          <el-input type="number" :min="1" :max="150" v-model="formState.borderWidth" />
        </el-form-item>

        <el-form-item label="边框色" prop="borderColor">
          <el-color-picker v-model="formState.borderColor" />
        </el-form-item>
        <el-form-item label="填充色" prop="fillColor">
          <el-color-picker v-model="formState.fillColor" show-alpha />
        </el-form-item>
        <el-form-item label="边框样式" prop="borderStyle">
          <el-select v-model="formState.borderStyle">
            <el-option :value="'solid'" label="solid"></el-option>
            <el-option :value="'dashed'" label="dashed"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="说明" prop="remark">
          <el-input type="textarea" v-model="formState.remark" autosize />
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>

<style scoped>
.dialog-wrapper {
  width: 300px;
  border-radius: 8px;
  background: white;
  z-index: 999;
  position: absolute;
  padding: 16px;
}
.dialog-title {
  text-align: left;
  font-weight: bold;
  padding-bottom: 16px;
}
.close-icon {
  float: right;
  cursor: pointer;
  font-weight: normal;
}
</style>
