import { Ref } from "vue";
import * as Cesium from "cesium";
import {
  transformCartesianToWGS84,
  transformWGS84ToCartesian,
  setId,
} from "../units/units";
let anchorpoints:any = [];
let pottingPoint:any = []
let polyline: any = null;
let LineArrowPoints:any;
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
function createBezierPoints(anchorpoints:any) {
  let numpoints = 100;
  let points = [];
  for (let i = 0; i <= numpoints; i++) {
    let point = computeBezierPoints(anchorpoints, i / numpoints);
    points.push(point);
  }
  return points;
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
function createGeoPoints(viewer: Ref<Cesium.Viewer | undefined>, window_points:any) {
  let points = [];
  let ray, cartesian, cartographic, lng, lat;
  for (let i = 0; i < window_points.length; i++) {
    ray = viewer.value!.camera.getPickRay(window_points[i]);
    ray && (cartesian = viewer.value!.scene.globe.pick(ray, viewer.value!.scene));
    if (cartesian) {
      cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      lng = Cesium.Math.toDegrees(cartographic.longitude);
      lat = Cesium.Math.toDegrees(cartographic.latitude);
      points.push(lng, lat);
    }
  }
  return points;
}
let lineCollection: Cesium.CustomDataSource | Cesium.DataSource;
// 初始化
export function initStraightLineArrow(viewer: Ref<Cesium.Viewer | undefined>) {
  anchorpoints = [];
  pottingPoint =[]
  polyline = null;
  LineArrowPoints= null
  lineCollection = new Cesium.CustomDataSource("lineEntityCollection");
  viewer.value!.dataSources.add(lineCollection);
}
// 创建线段
export function createStraightLineArrow(
  viewer: Ref<Cesium.Viewer | undefined>,
  click: Cesium.ScreenSpaceEventHandler.PositionedEvent,
  isCurve: boolean
) {
  if (Cesium.defined(polyline) && isCurve) {
    return;
  }
  let pixPos = click.position;
  let GeoPoints = createGeoPoints(viewer, [{ x: pixPos.x, y: pixPos.y }]);
  if (anchorpoints.length == 0) {
    anchorpoints.push({
      x: GeoPoints[0],
      y: GeoPoints[1],
    });
    pottingPoint.push(GeoPoints);
  }
  anchorpoints.push({
    x: GeoPoints[0],
    y: GeoPoints[1],
  });
  pottingPoint.push(GeoPoints);
}

// 鼠标经过时显示的绘制
export function moveStraightLineArrow(
  viewer: Ref<Cesium.Viewer | undefined>,
  movement: Cesium.ScreenSpaceEventHandler.MotionEvent
) {
  let endPos = movement.endPosition;
  if (anchorpoints.length > 0) {
    if (!Cesium.defined(polyline)) {
      let window_points = createBezierPoints(anchorpoints);
      let GeoPoints: number[] = [];
      window_points.forEach((item) => {
        GeoPoints.push(item.x, item.y);
      });
      LineArrowPoints = Cesium.Cartesian3.fromDegreesArray(GeoPoints);
      polyline = viewer.value!.entities.add({
        name: "LineArrow",
        id: setId(),
        polyline: {
          positions: new Cesium.CallbackProperty(function () {
            return LineArrowPoints;
          }, false),
          width: 10,
          material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.BLUE),
        },
      });
      polyline.GeoType = 'StraightLineArrow';
    } else {
      anchorpoints.pop();
      pottingPoint.pop();
      let GeoPoints = createGeoPoints(viewer, [{ x: endPos.x, y: endPos.y }]);
      anchorpoints.push({
        x: GeoPoints[0],
        y: GeoPoints[1],
      });
      pottingPoint.push(GeoPoints);

      let window_points = createBezierPoints(anchorpoints);
      let GeoPoints1: number[] = [];
      window_points.forEach((item) => {
        GeoPoints1.push(item.x, item.y);
      });
      LineArrowPoints = Cesium.Cartesian3.fromDegreesArray(GeoPoints1);
    }
  }
}

function createNormalLine(list: Cesium.Cartesian3[]) {
  return new Cesium.Entity({
    name: "LineArrow",
    id: setId(),
    polyline: {
      positions: list,
      width: 10,
      material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.BLUE),
    },
  });
}

export function endStraightLineArrow(viewer: Ref<Cesium.Viewer | undefined>) {
  polyline.pottingPoint = pottingPoint;
  viewer.value!.entities.remove(polyline); // 移除动态线，重新绘制
  lineCollection!.entities.add(
    createNormalLine(LineArrowPoints as Cesium.Cartesian3[])
  );
  return polyline;
}
