import { Ref } from "vue";
import * as Cesium from 'cesium'
import { ICONTYPE } from '../type'
export function createPoint(dialogRef: Ref<HTMLDivElement | undefined>, viewerRef: Ref<Cesium.Viewer | undefined>, click: Cesium.ScreenSpaceEventHandler.PositionedEvent, icon:ICONTYPE) {
    // 获取点击位置笛卡尔坐标
    const cartesian = viewerRef.value?.camera.pickEllipsoid(
        click.position,
        viewerRef.value?.scene.globe.ellipsoid
    );
    // 获取点击位置的经纬度坐标
    const cartographic = Cesium.Cartographic.fromCartesian(cartesian!);
    const longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(5);
    const latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(5);
    dialogRef.value!.assignmentIcon({
    ...icon,
    lon: longitude + '',
    lat: latitude + ''
    })
    dialogRef.value!.showOpen()
}