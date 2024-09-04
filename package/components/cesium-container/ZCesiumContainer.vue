<template>
    <div class="cesium-container">
      <div id="cesiumContainer" :class="{'cursor': isSelected}" ref="viewerDivRef" style="width: 100%; height: 100vh;"></div>
      <SelectType class="select-type" @selectType="selectType" :drawList="drawList.list" @toggle="handleToggle" @delete="handleDelete"></SelectType>
      <Dialog class="dialog" ref="dialogRef"  :type="type" :config="config" @update="handleEdit"></Dialog>
      <div class="fotter">
        经度：{{ mouseInfo.lon }}&nbsp;&nbsp;
        纬度：{{ mouseInfo.lat }}&nbsp;&nbsp;
      </div>
    </div>
    
  </template>
  <script lang="ts" setup>
import { onBeforeUnmount, onMounted, reactive,ref } from 'vue';
import * as Cesium from 'cesium'
import SelectType from './SelectType.vue';
import Dialog from './Dialog.vue';
import viewerOption from './viewerOption';
import { cartesianToLatlng, getCatesian3FromPX } from './units/units';
// 引入箭头
import { StraightArrow } from './units/straightArrow'
import { polygonEditConfig } from './polygon.config';

const viewerRef = ref()
const dialogRef = ref()
const handler = ref<Cesium.ScreenSpaceEventHandler>()
const type = ref<'point' | 'polygon' | 'polyline'>('point')
const config:any = {}
const isSelected = ref<boolean>(false)
const mouseInfo = reactive({
  lon: '',
  lat: ''
})
const currentObj = ref<any>()
const drawList = reactive({
  list: [] as any
})
const selectType = (item: any) => {
    isSelected.value = true
    handleDraw(item.type)
}
const handleDraw = (type: string) => {
 switch (type) {
    case 'StraightArrow':
        config.value = polygonEditConfig
        const swallowtailArrow = new StraightArrow(viewerRef.value, config.value)
        swallowtailArrow.disable()
        swallowtailArrow.startDraw()
        drawList.list.push({config: polygonEditConfig, obj: swallowtailArrow, id: swallowtailArrow.objId})
        break;
 
    default:
        break;
 } 
}
const handleToggle = (id: string) => {
  
}
const handleDelete = (id: string) => {
  
}
const handleEdit = (config:any) => {
   const index =  drawList.list.findIndex((item:any) => item.id == currentObj.value.id)
   drawList.list[index].config = config
}
const initViewer = ()=> {
    viewerRef.value = new Cesium.Viewer('cesiumContainer', {
        ...viewerOption
    })
    viewerRef.value.camera.setView({
    // 设置相机位置，经度，纬度，高度
    destination: Cesium.Cartesian3.fromDegrees(118.03, 24.485, 100000),
  })
  // 隐藏cesium版权logo等信息
  const creditContainer:any = viewerRef.value.cesiumWidget.creditContainer
  creditContainer.style.display = "none";
}

const initHandler = () => {
    handler.value = new Cesium.ScreenSpaceEventHandler(viewerRef.value.canvas)
    const _handler = handler.value
    _handler.setInputAction((evt: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
        const cartesian = getCatesian3FromPX(evt.endPosition, viewerRef.value)
        if(!cartesian) return
        const lonlat = cartesianToLatlng(cartesian, viewerRef.value)
        mouseInfo.lon = lonlat[0].toFixed(5)
        mouseInfo.lat = lonlat[1].toFixed(5)
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE )
}
const bindEdit = ()=>{
    const handler = new Cesium.ScreenSpaceEventHandler(viewerRef.value?.scene.canvas);
    handler.setInputAction((evt: Cesium.ScreenSpaceEventHandler.PositionedEvent)=> { //单机开始绘制
      var pick = viewerRef.value?.scene.pick(evt.position);
      if (Cesium.defined(pick) && pick.id) {
        for (var i = 0; i < drawList.list.length; i++) {
          if (pick.id.objId&&pick.id.objId == drawList.list[i].id) {
            currentObj.value = drawList.list[i];
            drawList.list[i].obj.startModify();
            config.value = drawList.list[i].config
            dialogRef.value.showOpen()
            break;
          } 
          // else if(pick.id.id == drawList.list[i].id) {
        //     nowArrowObj.value = drawList.list[i];
        //     if(viewerRef.value) {
        //       viewerRef.value.scene.screenSpaceCameraController.enableRotate = false;
        //       viewerRef.value.scene.screenSpaceCameraController.enableZoom = false;
        //       viewerRef.value.scene.screenSpaceCameraController.enableTranslate = false;
        //       viewerRef.value.scene.screenSpaceCameraController.enableTilt = false;
        //       viewerRef.value.scene.screenSpaceCameraController.enableLook = false;
        //     }
        //     let isDraging = true
        //     handler.setInputAction((evt: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
        //     let pickPosition = getCatesian3FromPX(evt.endPosition, viewerRef.value)
        //     if (isDraging && Cesium.defined(pickPosition)) {
        //         nowArrowObj.value.entity.position = pickPosition
        //     }
        // }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
        // handler.setInputAction((evt: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        //     isDraging = false
        //     if(viewerRef.value) {
        //       viewerRef.value.scene.screenSpaceCameraController.enableRotate = true;
        //       viewerRef.value.scene.screenSpaceCameraController.enableZoom = true;
        //       viewerRef.value.scene.screenSpaceCameraController.enableTranslate = true;
        //       viewerRef.value.scene.screenSpaceCameraController.enableTilt = true;
        //       viewerRef.value.scene.screenSpaceCameraController.enableLook = true;
        //     }
        //     handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
        //     handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP)

        // }, Cesium.ScreenSpaceEventType.LEFT_UP)
        //     break
          // }
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }
onMounted(() => {
  initViewer()
  initHandler()
  bindEdit()
})
onBeforeUnmount(() => {
 handler.value && handler.value?.destroy()
  viewerRef.value &&viewerRef.value?.destroy()
})
</script>
  
<style scoped>
.cesium-container {
  width: 100vw;
  height: 100vh;
  position: relative;
}
.select-type{
  position: absolute;
  z-index: 10;
  top: 10px;
  right: 10px;
}
.cursor{
  cursor: crosshair;
}
.fotter{
  background-color: rgba(0, 0, 0, .3);
  color: #fff;
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: 10;
  width: 300px;
  height: 24px;
  line-height: 24px;
}
.dialog{
    top: 10px;
    right: 400px;
}
</style>
