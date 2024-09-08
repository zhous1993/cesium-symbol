<template>
  <div class="cesium-container">
    <div id="cesiumContainer" :class="{ cursor: isSelected }" ref="viewerDivRef" style="width: 100%; height: 100vh"></div>
    <SelectType
      class="select-type"
      @selectType="selectType"
      :drawList="drawList.list"
      @toggle="handleToggle"
      @delete="handleDelete"
    ></SelectType>
    <Dialog class="dialog" ref="dialogRef" :type="category" :config="config" @update="handleEdit"></Dialog>
    <div class="fotter"> 经度：{{ mouseInfo.lon }}&nbsp;&nbsp; 纬度：{{ mouseInfo.lat }}&nbsp;&nbsp; </div>
  </div>
</template>
<script lang="ts" setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import * as Cesium from 'cesium'
import SelectType from './SelectType.vue'
import Dialog from './Dialog.vue'

import { pointEditConfig, polygonEditConfig, polylineEditConfig } from './polygon.config'
// @ts-ignore
import ZCesium from '~/index'

const viewerRef = ref()
const dialogRef = ref()
const handler = ref<Cesium.ScreenSpaceEventHandler>()
const category = ref<'point' | 'polygon' | 'polyline'>('point')
const config: any = {}
const isSelected = ref<boolean>(false)
const mouseInfo = reactive({
  lon: '',
  lat: ''
})
const drawList = reactive({
  list: [] as any
})
const currentGeometry: any = ref()
const selectType = (item: any) => {
  isSelected.value = true

  category.value = item.category
  switch (item.category) {
    case 'point':
      config.value = { ...pointEditConfig, iconUrl: item.iconUrl }
      break
    case 'polyline':
      config.value = { ...polylineEditConfig }
      break
    case 'polygon':
      config.value = { ...polygonEditConfig }
      break
    default:
      break
  }
  handleDraw(item.type)
}
const handleDraw = (type: string) => {
  switch (type) {
    case 'Icon':
      currentGeometry.value = new ZCesium.IconPoint(Cesium, viewerRef.value, config.value)

      break
    case 'FineArrow':
      currentGeometry.value = new ZCesium.FineArrow(Cesium, viewerRef.value, config.value)

      break
    case 'PincerArrow':
      currentGeometry.value = new ZCesium.PincerArrow(Cesium, viewerRef.value, config.value)

      break
    case 'SingleArrow':
      currentGeometry.value = new ZCesium.SingleArrow(Cesium, viewerRef.value, config.value)

      break
    case 'AttackArrow':
      currentGeometry.value = new ZCesium.AttackArrow(Cesium, viewerRef.value, config.value)

      break
    case 'SwallowtailArrow':
      currentGeometry.value = new ZCesium.SwallowtailArrow(Cesium, viewerRef.value, config.value)

      break
    case 'StraightLineArrow':
      currentGeometry.value = new ZCesium.StraightLineArrow(Cesium, viewerRef.value, config.value)

      break
    case 'CurveLineArrow':
      currentGeometry.value = new ZCesium.CurvedLineArrow(Cesium, viewerRef.value, config.value)

      break
    default:
      break
  }
  if (currentGeometry.value) {
    currentGeometry.value.on('drawEnd', drawEndHandler)
    currentGeometry.value.on('editStart', editStartHandler)
    currentGeometry.value.on('editEnd', editEndHandler)
    currentGeometry.value.on('dragStart', dragStartHandler)
    currentGeometry.value.on('drawUpdate', drawUpdateHandler)
  }
}
const handleEdit = (data: any) => {
  console.log(data)
}
const dragStartHandler = () => {
  console.error('start')
}
const drawUpdateHandler = (cartesian: any) => {
  console.error('update', cartesian)
}

const drawEndHandler = (geometryPoints: any) => {
  console.error('drawEnd', geometryPoints)
}

const editStartHandler = () => {
  console.error('editStart')
}

const editEndHandler = (geometryPoints: any) => {
  console.error('editEnd', geometryPoints)
}
const handleToggle = (id: string) => {
  console.log(id)
}
const handleDelete = (id: string) => {
  console.log(id)
}
const initViewer = () => {
  viewerRef.value = new Cesium.Viewer('cesiumContainer', {
    infoBox: false, // 禁用沙箱，解决控制台报错
    animation: false, //是否显示动画控件
    baseLayerPicker: false, //是否显示图层选择控件
    geocoder: false, //是否显示地名查找控件
    timeline: false, //是否显示时间线控件
    sceneModePicker: false, //是否显示投影方式控件
    navigationHelpButton: false, //是否显示帮助信息控件
    fullscreenButton: false, //是否显示全屏按钮
    // infoBox: false, //是否显示点击要素之后显示的信息
    homeButton: false, //是否显示Home按钮
    // imageryProvider:esri,//自定义图层
    selectionIndicator: false,
    terrainProvider: undefined
  })
  viewerRef.value.camera.setView({
    // 设置相机位置，经度，纬度，高度
    destination: Cesium.Cartesian3.fromDegrees(118.03, 24.485, 100000)
  })
  // 隐藏cesium版权logo等信息
  const creditContainer: any = viewerRef.value.cesiumWidget.creditContainer
  creditContainer.style.display = 'none'
}

onMounted(() => {
  initViewer()
})
onBeforeUnmount(() => {
  handler.value && handler.value?.destroy()
  viewerRef.value && viewerRef.value?.destroy()
})
</script>

<style scoped>
.cesium-container {
  width: 100vw;
  height: 100vh;
  position: relative;
}
.select-type {
  position: absolute;
  z-index: 10;
  top: 10px;
  right: 10px;
}
.cursor {
  cursor: crosshair;
}
.fotter {
  background-color: rgba(0, 0, 0, 0.3);
  color: #fff;
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: 10;
  width: 300px;
  height: 24px;
  line-height: 24px;
}
.dialog {
  top: 10px;
  right: 400px;
}
</style>
