import * as Cesium from 'cesium'
import { LngLat } from '../type';
/***
 * 坐标转换 84转笛卡尔
 * @param {Object} {lng,lat,alt} 地理坐标
 * @return {Object} Cartesian3 三维位置坐标
 */
export function transformWGS84ToCartesian(position: { lng?: any; lon?: any; lat: number; alt?: any; }, alt?: any) {
    return position
        ? Cesium.Cartesian3.fromDegrees(
            position.lng || position.lon,
            position.lat,
            (position.alt = alt || position.alt),
            Cesium.Ellipsoid.WGS84
        )
        : Cesium.Cartesian3.ZERO;
}

/***
 * 坐标转换 笛卡尔转84
 * @param {Object} Cartesian3 三维位置坐标
 * @return {Object} {lng,lat,alt} 地理坐标
 */
export function transformCartesianToWGS84(cartesian: Cesium.Cartesian3) {
    let ellipsoid = Cesium.Ellipsoid.WGS84;
    let cartographic = ellipsoid.cartesianToCartographic(cartesian);
    return {
        lng: Cesium.Math.toDegrees(cartographic.longitude),
        lat: Cesium.Math.toDegrees(cartographic.latitude),
        alt: cartographic.height,
    };
}
/***
 * 生成uuid字符串
 * @param {Number} num 生成的位数默认值32位
 * @return {String} str
 */
export function setId(num: number = 32): string {
    let len = num;
    let chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
    let maxPos = chars.length;
    let str = "";
    for (let i = 0; i < len; i++) {
        str += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return str;
}


export function getCatesian3FromPX(px: Cesium.Cartesian2, viewer: Cesium.Viewer) {
    var picks = viewer.scene.drillPick(px);
    // viewer.render();
    var cartesian;
    var isOn3dtiles = true;
    for (var i = 0; i < picks.length; i++) {
        if ((picks[i] && picks[i].primitive) || picks[i] instanceof Cesium.Cesium3DTileFeature) { //模型上拾取
            isOn3dtiles = true;
        }
    }
    if (isOn3dtiles) {
        cartesian = viewer.scene.pickPosition(px);
    } else {
        var ray = viewer.camera.getPickRay(px);
        if (!ray) return null;
        cartesian = viewer.scene.globe.pick(ray, viewer.scene);
    }
    return cartesian;
}

export function cartesianToLatlng(cartesian: Cesium.Cartesian3, viewer: Cesium.Viewer): [number, number] {
    const latlng = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
    const lat = Cesium.Math.toDegrees(latlng.latitude);
    const lng = Cesium.Math.toDegrees(latlng.longitude);
    return [lng, lat];
}

/**
 * 求取两个坐标的中间值
 * @param point1
 * @param point2
 * @returns {[*,*]}
 * @constructor
 */
export const Mid = (point1: [number, number], point2: [number, number]): [number, number] => {
    return [(point1[0] + point2[0]) / 2, (point1[1] + point2[1]) / 2]
}

/**
 * 启停用相机
 * @param viewer 
 * @param enable 
 * @returns 
 */
export const enableCamera = (viewer: Cesium.Viewer, enable: boolean) => {
    if (!viewer) return
    viewer.scene.screenSpaceCameraController.enableRotate = enable
}

/**
 * 计算两个坐标之间的距离
 * @param pnt1
 * @param pnt2
 * @returns {number}
 * @constructor
 */
export const MathDistance = (pnt1: LngLat, pnt2: LngLat): number => {
    return (Math.sqrt(Math.pow((pnt1[0] - pnt2[0]), 2) + Math.pow((pnt1[1] - pnt2[1]), 2)))
}

/**
 * 获取方位角（地平经度）
 * @param startPoint
 * @param endPoint
 * @returns {*}
 */
export const getAzimuth = (startPoint: LngLat, endPoint: LngLat): number => {
    let azimuth
    let angle = Math.asin(Math.abs(endPoint[1] - startPoint[1]) / (MathDistance(startPoint, endPoint)))
    if (endPoint[1] >= startPoint[1] && endPoint[0] >= startPoint[0]) {
        azimuth = angle + Math.PI
    } else if (endPoint[1] >= startPoint[1] && endPoint[0] < startPoint[0]) {
        azimuth = Math.PI * 2 - angle
    } else if (endPoint[1] < startPoint[1] && endPoint[0] < startPoint[0]) {
        azimuth = angle
    } else if (endPoint[1] < startPoint[1] && endPoint[0] >= startPoint[0]) {
        azimuth = Math.PI - angle
    }
    return azimuth as number
}

/**
 * 通过三个点获取方位角
 * @param pntA: LngLat
 * @param pntB:LngLat
 * @param pntC:LngLat
 * @returns {number}
 */
export const getAngleOfThreePoints = (pntA: LngLat, pntB: LngLat, pntC: LngLat): number => {
    const angle = getAzimuth(pntB, pntA) - getAzimuth(pntB, pntC)
    return ((angle < 0) ? (angle + Math.PI * 2) : angle)
}

/**
 * 判断是否是顺时针
 * @param pnt1
 * @param pnt2
 * @param pnt3
 * @returns {boolean}
 */
export const isClockWise = (pnt1: LngLat, pnt2: LngLat, pnt3: LngLat): boolean => {
    return ((pnt3[1] - pnt1[1]) * (pnt2[0] - pnt1[0]) > (pnt2[1] - pnt1[1]) * (pnt3[0] - pnt1[0]))
}

/**
 * 根据起止点和旋转方向求取第三个点
 * @param startPnt
 * @param endPnt
 * @param angle
 * @param distance
 * @param clockWise
 * @returns {[*,*]}
 */
export const getThirdPoint = (startPnt: LngLat, endPnt: LngLat, angle: number, distance: number, clockWise: boolean): LngLat => {
    let azimuth = getAzimuth(startPnt, endPnt)
    let alpha = clockWise ? (azimuth + angle) : (azimuth - angle)
    let dx = distance * Math.cos(alpha)
    let dy = distance * Math.sin(alpha)
    return ([endPnt[0] + dx, endPnt[1] + dy])
}