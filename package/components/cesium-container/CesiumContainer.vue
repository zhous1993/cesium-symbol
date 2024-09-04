<script setup lang="ts">

import { onMounted, shallowRef, ref, reactive } from 'vue';
import * as Cesium from 'cesium'
import { Viewer } from 'cesium'
import SelectType from './SelectType.vue'
import Dialog from './Dialog.vue'
import { ICONTYPE } from './type'
import { useDrawPoint } from './units/drawPointFun'
import { createPoint } from './units/createPoint'
import { createPolyline, movePolyline, endPolyline, initPolyline } from './units/drawPolylineFun'
import { createCurve, moveCurve, endCurve, initCurve } from './units/drawCurveFun'
import { createFreeline, moveFreeline, endFreeline, initFreeline } from './units/drawFreelineFun'
import { createPolygon, movePolygon, endPolygon, initPolygon } from './units/drawPolygonFun'
import { createCircle, moveCircle, initCircle } from './units/drawCircleFun'
import { createPincerArrow, movePincerArrow, endPincerArrow, initPincerArrow } from './units/drawPincerArrowFun'
import { createStraightLineArrow, moveStraightLineArrow, endStraightLineArrow, initStraightLineArrow } from './units/drawStraightLineArrowFun'
import {AttackArrow, PincerArrow} from './units/arrowClass'
import { useDragEntity } from './hooks/useDragEntity';
import {getCatesian3FromPX} from './units/thirdPart/utils'
import { StraightArrow } from './units/straightArrow';
// const viewerDivRef:any = ref<HTMLDivElement>()
const dialogRef = ref<HTMLDivElement>()
const viewerRef = shallowRef<Viewer>()
const nowArrowObj = ref()
let mouseInfo = reactive({
  lon: '',
  lat: ''
})
let drawList = reactive({
  list: [] as any
})
let type = ref<string | null>(null); // 当前在绘画的类型，绘画完成重置为null
 const  bindEdit = ()=>{
    const handler = new Cesium.ScreenSpaceEventHandler(viewerRef.value?.scene.canvas);
    handler.setInputAction((evt: Cesium.ScreenSpaceEventHandler.PositionedEvent)=> { //单机开始绘制
      var pick = viewerRef.value?.scene.pick(evt.position);
      if (Cesium.defined(pick) && pick.id) {
        // if (nowArrowObj.value) {
        //   if (nowArrowObj.value.state != -1) {
        //     console.log("上一步操作未结束，请继续完成上一步！");  
        //     return;
        //   }
        // }

        for (var i = 0; i < drawList.list.length; i++) {
          if (pick.id.objId&&pick.id.objId == drawList.list[i].objId) {
            nowArrowObj.value = drawList.list[i];
            drawList.list[i].startModify();
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
onMounted(async () => {
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
    terrainProvider: await Cesium.createWorldTerrainAsync({
      // requestWaterMask: true,//水面特效
      requestVertexNormals: true
    })
  })
  viewerRef.value.camera.setView({
    // 设置相机位置，经度，纬度，高度
    destination: Cesium.Cartesian3.fromDegrees(118.03, 24.485, 100000),
    orientation: {
      // 初始视角
      // heading: Cesium.Math.toRadians(0), // 偏航角，单位弧度
      // pitch: Cesium.Math.toRadians(-45), // 仰俯角，单位弧度
      // roll: Cesium.Math.toRadians(0)  // 翻滚角，单位弧度
    }
  })
  // 隐藏cesium版权logo等信息
  const creditContainer:any = viewerRef.value.cesiumWidget.creditContainer
  creditContainer.style.display = "none";
  // 显示鼠标经过的经纬度高度信息
  viewerRef.value?.screenSpaceEventHandler.setInputAction( (movement: Cesium.ScreenSpaceEventHandler.MotionEvent) =>{
    // 获取位置笛卡尔坐标
    const cartesian = viewerRef.value?.camera.pickEllipsoid(
      movement.endPosition,
      viewerRef.value?.scene.globe.ellipsoid
    );
    // 获取位置的经纬度坐标
    const cartographic = Cesium.Cartographic.fromCartesian(cartesian!);
    mouseInfo.lon = Cesium.Math.toDegrees(cartographic.longitude).toFixed(5)
    mouseInfo.lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(5)
    if(!!type.value) {
      switch (type.value) {
        case 'Polyline':
          movePolyline(viewerRef, movement)
        break;
        case 'Curve':
          moveCurve(viewerRef, movement)
        break;
        case 'Freeline':
          moveFreeline(viewerRef, movement)
        break;
        case 'Polygon':
          movePolygon(viewerRef, movement)
        break;
        case 'Circle':
          moveCircle(viewerRef, movement, type)
        break;
        case 'StraightLineArrow':
        case 'CurveLineArrow':
          moveStraightLineArrow(viewerRef, movement)
        break;
        case 'PincerArrow':
          
        break;
       
      }
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

  // 监听鼠标右键事件
  /**
   * 判断是否有监听鼠标点击事件，有就移除监听鼠标点击事件
   */
  viewerRef.value?.screenSpaceEventHandler.setInputAction(() => {
    if(viewerRef.value?.screenSpaceEventHandler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)) {
      viewerRef.value?.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
    }
    isSelected.value = false
    if(!!type.value) {
      switch (type.value) {
        case 'Polyline':
          const polyline = endPolyline(viewerRef);
          drawList.list.push(polyline)
        break;
        case 'Curve':
          const curve = endCurve(viewerRef);
          drawList.list.push(curve)
        break;
        case 'Freeline':
          const freeline = endFreeline(viewerRef);
          drawList.list.push(freeline)
        break;
        case 'Polygon':
          const polygon = endPolygon(viewerRef);
          drawList.list.push(polygon)
        break;
        case 'StraightLineArrow':
        case 'CurveLineArrow':
          const straightLineArrow = endStraightLineArrow(viewerRef);
          drawList.list.push(straightLineArrow)
        break;
        case 'PincerArrow':
          
        break;
       
      }
    }
    type.value = null
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  bindEdit()
})
const isSelected = ref<Boolean>(false);
// 选择类型
function selectType(icon:ICONTYPE) {
  type.value = icon.type
  // 给地图上添加十字型的鼠标样式
  isSelected.value = true
  switch (icon.type) {
    case 'Polyline':
      initPolyline(viewerRef);
    break;
    case 'Curve':
      initCurve(viewerRef);
    break;
    case 'Freeline':
      initFreeline(viewerRef);
    break;
    case 'Polygon':
      initPolygon(viewerRef);
    break;
    case 'Circle':
      initCircle(viewerRef)
    break;
    case 'StraightLineArrow':
    case 'CurveLineArrow':
      initStraightLineArrow(viewerRef)
    break;
    case 'PincerArrow':
      const pincerArrow = new PincerArrow(viewerRef.value)
      pincerArrow.disable()
      pincerArrow.startDraw();
      pincerArrow.entity = pincerArrow.arrowEntity
      drawList.list.push(pincerArrow)
    break;
    case 'AttackArrow':
    const attackArrow:any = new StraightArrow(viewerRef.value as Cesium.Viewer)
      attackArrow.disable()
      attackArrow.startDraw();
      attackArrow.entity = attackArrow.arrowEntity
      drawList.list.push(attackArrow)
      break
    case 'SwallowtailArrow':
      const swallowtailArrow = new AttackArrow(viewerRef.value)
      swallowtailArrow.disable()
      swallowtailArrow.startDraw()
      swallowtailArrow.entity = swallowtailArrow.arrowEntity
      drawList.list.push(swallowtailArrow)

      break
  }
  // 监听地图点击事件
  viewerRef.value?.screenSpaceEventHandler.setInputAction((click: Cesium.ScreenSpaceEventHandler.PositionedEvent) =>{
    switch (icon.type) {
      case 'Icon':
      if(!isSelected.value) return
        createPoint(dialogRef, viewerRef, click, icon);
        break;
      case 'Polyline':
        createPolyline(viewerRef, click);
      break;
      case 'Curve':
        createCurve(viewerRef, click);
      break;
      case 'Freeline':
        createFreeline(viewerRef, click);
      break;
      case 'Polygon':
        createPolygon(viewerRef, click);
      break;
      case 'Circle':
        createCircle(viewerRef, click, isSelected, type)
      break;
      case 'StraightLineArrow':
        createStraightLineArrow(viewerRef, click, true);
      break;
      case 'CurveLineArrow':
        createStraightLineArrow(viewerRef, click, false);
      break;
      case 'PincerArrow':
      break;
      case 'AttackArrow':
      
        break
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
}
// 创建线段
// function createPolyline(icon:ICONTYPE) {
//   useDrawPolyline(viewerRef)
// }

// 打点
function drawPoint(icon:ICONTYPE) {
  const entity = useDrawPoint(viewerRef, icon)
  const obj = {
    ...icon,
    id: entity.id,
    entity
  }
  drawList.list.push(obj)
  isSelected.value = false
}
const handleToggle = (item: any) => {
  if(item.toggle) {
    item.toggle()
  }
   else if(item.id) {
    const entity = viewerRef.value?.entities.getById(item?.id as string) as Cesium.Entity
    entity.show = !entity.show
  }
  
 
}
const handleDelete = (item: any) => {
  if(item.clear){
    item.clear()
    drawList.list = drawList.list.filter((data:any) => data.objId !== item.objId)
  } else if(item.entity) {
    item.entity && viewerRef.value?.entities.remove(item.entity)
  // viewerRef.value?.dataSources.removeAll()
  drawList.list = drawList.list.filter((data:ICONTYPE) => data.id !== item.id)
  }
  
}
</script>

<template>
  <div class="cesium-container">
    <div id="cesiumContainer" :class="{'cursor': isSelected}" ref="viewerDivRef" style="width: 100%; height: 100vh;"></div>
    <SelectType class="select-type" @selectType="selectType" :drawList="drawList.list" @toggle="handleToggle" @delete="handleDelete"></SelectType>
    <Dialog ref="dialogRef" @drawPoint="drawPoint" :type="type"></Dialog>
    <div class="fotter">
      经度：{{ mouseInfo.lon }}&nbsp;&nbsp;
      纬度：{{ mouseInfo.lat }}&nbsp;&nbsp;
    </div>
  </div>
  
</template>

<style scoped>
.cesium-container {
  width: 100%;
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
</style>
