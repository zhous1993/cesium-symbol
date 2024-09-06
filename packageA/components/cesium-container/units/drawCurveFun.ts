import { Ref } from "vue";
import * as Cesium from "cesium";
import {
  transformCartesianToWGS84,
  transformWGS84ToCartesian,
  setId,
} from "../units/units";
let anchorpoints: any[] = [];
let polyline:any = null;
let linePoints:any = null;
function getCatesian3FromPX(viewer: Ref<Cesium.Viewer | undefined>, px: any) {
  let picks = viewer.value?.scene.drillPick(px);
  let cartesian = null;
  let isOn3dtiles = false,
    isOnTerrain = false;
  // drillPick
  for (let i in picks) {
    let pick = picks[i];
    if (
      (pick && pick.primitive instanceof Cesium.Cesium3DTileFeature) ||
      (pick && pick.primitive instanceof Cesium.Cesium3DTileset) ||
      (pick && pick.primitive instanceof Cesium.Model)
    ) {
      //模型上拾取
      isOn3dtiles = true;
    }
    // 3dtilset
    if (isOn3dtiles) {
      viewer.value?.scene.pick(px);
      cartesian = viewer.value?.scene.pickPosition(px);
      if (cartesian) {
        let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        if (cartographic.height < 0) cartographic.height = 0;
        let lon = Cesium.Math.toDegrees(cartographic.longitude),
          lat = Cesium.Math.toDegrees(cartographic.latitude),
          height = cartographic.height;
        cartesian = transformWGS84ToCartesian({
          lng: lon,
          lat: lat,
          alt: height,
        });
      }
    }
  }
  // 地形
  let boolTerrain =
    viewer.value?.terrainProvider instanceof Cesium.EllipsoidTerrainProvider;
  // Terrain
  if (!isOn3dtiles && !boolTerrain) {
    let ray = viewer.value?.scene.camera.getPickRay(px);
    if (!ray) return null;
    cartesian = viewer.value?.scene.globe.pick(ray, viewer.value?.scene);
    isOnTerrain = true;
  }
  // 地球
  if (!isOn3dtiles && !isOnTerrain && boolTerrain) {
    cartesian = viewer.value?.scene.camera.pickEllipsoid(
      px,
      viewer.value?.scene.globe.ellipsoid
    );
  }
  if (cartesian) {
    let position = transformCartesianToWGS84(cartesian);
    if (position.alt < 0) {
      cartesian = transformWGS84ToCartesian(position, 0.1);
    }
    return cartesian;
  }
  return false;
}
let lineCollection: Cesium.CustomDataSource | Cesium.DataSource;
// 初始化
export function initCurve(viewer: Ref<Cesium.Viewer | undefined>) {
  anchorpoints = [];
  polyline = null;
  linePoints = null
  lineCollection = new Cesium.CustomDataSource("lineEntityCollection");
  viewer.value!.dataSources.add(lineCollection);
}
// 创建线段
export function createCurve(
  viewer: Ref<Cesium.Viewer | undefined>,
  click: Cesium.ScreenSpaceEventHandler.PositionedEvent
) {
  let cartesian = getCatesian3FromPX(viewer, click.position);
  let geoPoint = transformCartesianToWGS84(cartesian as Cesium.Cartesian3);
  if (anchorpoints.length == 0) {
    anchorpoints.push({ x: geoPoint.lng, y: geoPoint.lat });
  }
  anchorpoints.push({ x: geoPoint.lng, y: geoPoint.lat })
}

/**
 * 计算贝塞尔曲线特征点
 * @param anchorpoints
 * @param t
 * @returns {{x: number, y: number}}
 * @private
 */
function computeBezierPoints(anchorpoints:any, t:any) {
  let x = 0,
    y = 0;
  let Binomial_coefficient = computeBinomial(anchorpoints);
  for (let j = 0; j < anchorpoints.length; j++) {
    let tempPoint = anchorpoints[j];
    x +=
      tempPoint.x *
      Math.pow(1 - t, anchorpoints.length - 1 - j) *
      Math.pow(t, j) *
      Binomial_coefficient[j];
    y +=
      tempPoint.y *
      Math.pow(1 - t, anchorpoints.length - 1 - j) *
      Math.pow(t, j) *
      Binomial_coefficient[j];
  }
  return { x: x, y: y };
}
/**
 * 计算二项式系数
 * @param anchorpoints
 * @returns {Array}
 * @private
 */
function computeBinomial(anchorpoints:any) {
  let lens = anchorpoints.length;
  let Binomial_coefficient = [];
  Binomial_coefficient.push(1);
  for (let k = 1; k < lens - 1; k++) {
    let cs = 1,
      bcs = 1;
    for (let m = 0; m < k; m++) {
      cs = cs * (lens - 1 - m);
      bcs = bcs * (k - m);
    }
    Binomial_coefficient.push(cs / bcs);
  }
  Binomial_coefficient.push(1);
  return Binomial_coefficient;
}

function createBezierPoints(anchorpoints:any) {
  let numpoints = 100;
  let points = [];
  for (let i = 0; i <= numpoints; i++) {
    let point = computeBezierPoints(anchorpoints, i / numpoints);
    points.push(point);
  }
  return points;
}

// 鼠标经过时显示的绘制
export function moveCurve(
  viewer: Ref<Cesium.Viewer | undefined>,
  movement: Cesium.ScreenSpaceEventHandler.MotionEvent
) {
  let endPos = movement.endPosition;
  if (Cesium.defined(polyline)) {
    anchorpoints.pop();
    let cartesian = getCatesian3FromPX(viewer, endPos);
    let geoPoint = transformCartesianToWGS84(cartesian as Cesium.Cartesian3);
    anchorpoints.push({ x: geoPoint.lng, y: geoPoint.lat });
    let window_points = createBezierPoints(anchorpoints);
    let GeoPoints1: number[] = [];
    window_points.forEach((item) => {
      GeoPoints1.push(item.x, item.y);
    });
    linePoints = Cesium.Cartesian3.fromDegreesArray(GeoPoints1);
  } else {
    let window_points = createBezierPoints(anchorpoints);
    let geoPoints: number[] = [];
    window_points.forEach((item) => {
      geoPoints.push(item.x, item.y);
    });
    linePoints = Cesium.Cartesian3.fromDegreesArray(geoPoints);
    polyline = viewer.value!.entities.add({
      name: "Curve",
      id: setId(),
      polyline: {
        positions: new Cesium.CallbackProperty(() => {
          return linePoints;
        }, false),
        width: 2,
        material: Cesium.Color.RED,
      },
    });
    polyline.GeoType = "Curve";
    // anchorpoints.push(cartesian);
  }
}

function createNormalLine(list:any) {
  return new Cesium.Entity({
    polyline: {
      positions: list,
      clampToGround: true,
      width: 2,
      material: Cesium.Color.RED,
    },
  });
}

export function endCurve(viewer: Ref<Cesium.Viewer | undefined>) {
  anchorpoints.pop();
  polyline.pottingPoint = anchorpoints;
  viewer.value!.entities.remove(polyline); // 移除动态线，重新绘制
  console.log('anchorpoints')
  let window_points = createBezierPoints(anchorpoints);
  let GeoPoints1: number[] = [];
  window_points.forEach((item) => {
    GeoPoints1.push(item.x, item.y);
  });
  linePoints = Cesium.Cartesian3.fromDegreesArray(GeoPoints1);
  lineCollection!.entities.add(
    createNormalLine(linePoints)
  );
  return polyline;
}
