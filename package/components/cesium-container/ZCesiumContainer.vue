<template>
    <div class="cesium-container">
      <div id="cesiumContainer" :class="{'cursor': isSelected}" ref="viewerDivRef" style="width: 100%; height: 100vh;"></div>
      <SelectType class="select-type" @selectType="selectType" :drawList="drawList.list" @toggle="handleToggle" @delete="handleDelete"></SelectType>
      <Dialog class="dialog" ref="dialogRef"  :type="category" :config="config" @update="handleEdit"></Dialog>
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
import { cartesianToLatlng, enableCamera, getCatesian3FromPX } from './units/units';
// 引入箭头
import { StraightArrow } from './units/straightArrow'
import { polygonEditConfig } from './polygon.config';
import { PincerArrow } from './units/pincerArrow';
import { LngLat } from './type';

const viewerRef = ref()
const dialogRef = ref()
const handler = ref<Cesium.ScreenSpaceEventHandler>()
const category = ref<'point' | 'polygon' | 'polyline'>('point')
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
    category.value = item.category
    switch (item.category) {
        case 'point':
            
            break;
        case 'polyline':
            break;
        case 'polygon':
            config.value = {...polygonEditConfig}
            break
        default:
            break;
    }
    handleDraw(item.type)
}
const handleDraw = (type: string) => {
 switch (type) {
    case 'StraightArrow':
        config.value = polygonEditConfig
        const straightArrow = new StraightArrow(viewerRef.value, config.value)
        straightArrow.disable()
        straightArrow.startDraw()
        drawList.list.push({config: polygonEditConfig, obj: straightArrow, id: straightArrow.objId})
        break;
    case 'PincerArrow':
        config.value = polygonEditConfig
        const pincerArrow = new PincerArrow(viewerRef.value, config.value)
        pincerArrow.disable()
        pincerArrow.startDraw()
        drawList.list.push({config: polygonEditConfig, obj: pincerArrow, id: pincerArrow.objId})
        break;
    case 'AttackArrow':
      
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
   drawList.list[index].obj.updateProps({config})
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
      if (Cesium.defined(pick) && pick.id && pick.id.objId) {
        const index = drawList.list.findIndex((item:any) => item.id == pick.id.objId)
        currentObj.value = drawList.list[index];
            drawList.list[index].obj.startModify();
            console.log("当前选中的id", drawList.list[index].obj)
            config.value = drawList.list[index].config
            dialogRef.value.assignmentConfig(config.value)
            dialogRef.value.showOpen()
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    let isDraging = false
    let startPosition: Cesium.Cartesian3 | null | undefined = null
    handler.setInputAction((evt: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      var pick = viewerRef.value?.scene.pick(evt.position);
      if (Cesium.defined(pick) && pick.id && pick.id.objId) {
        const index = drawList.list.findIndex((item:any) => item.id == pick.id.objId)
        currentObj.value = drawList.list[index];
        console.log('drag')
        isDraging = true
        enableCamera(viewerRef.value,false)
        startPosition =  getCatesian3FromPX(evt.position, viewerRef.value)
        handler.setInputAction((evt: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
          let endPosition = getCatesian3FromPX(evt.endPosition, viewerRef.value)
          if (isDraging && Cesium.defined(endPosition)) {
          const oldPositions = currentObj.value.obj.getPositions()
              
              const dx = endPosition.x - startPosition!.x
              const dy = endPosition.y - startPosition!.y
              const newPositions = oldPositions.map((position: Cesium.Cartesian3) => {
                return new Cesium.Cartesian3(position.x + dx, position.y + dy, position.z)
              })
              currentObj.value.obj.updateProps({positions: newPositions})
              startPosition = endPosition.clone()
          }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
      handler.setInputAction((evt: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
          isDraging = false
          startPosition = null
          enableCamera(viewerRef.value,true)
          handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
          handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP)

      }, Cesium.ScreenSpaceEventType.LEFT_UP)
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
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
