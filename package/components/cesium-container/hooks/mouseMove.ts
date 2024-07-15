import { Ref } from "vue";
import * as Cesium from 'cesium'
export function useMouseMove(viewer: Ref<Cesium.Viewer | undefined>) {
    let lat: string = '', lon: string = '', height:string = '';
    viewer.value?.screenSpaceEventHandler.setInputAction( (movement: Cesium.ScreenSpaceEventHandler.MotionEvent) =>{
        const cartesian = viewer.value!.camera.pickEllipsoid(
        movement.endPosition,
        viewer.value?.scene.globe.ellipsoid
        );
        console.log('MOUSE_MOVEMOUSE_MOVEMOUSE_MOVEMOUSE_MOVEMOUSE_MOVEMOUSE_MOVEMOUSE_MOVE')
        // 获取位置的经纬度坐标
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian!);
        lon = Cesium.Math.toDegrees(cartographic.longitude).toFixed(5),
        lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(5),
        height = Math.ceil(viewer.value!.camera.positionCartographic.height) + ''
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    return { lon, lat, height }
}