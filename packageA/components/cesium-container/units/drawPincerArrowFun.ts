import { Ref } from "vue";
import * as Cesium from "cesium";
import {
  transformCartesianToWGS84,
  transformWGS84ToCartesian,
  setId,
} from "./units";
import "./thirdPart/algorithm";
import "./thirdPart/plotUtil";
let anchorpoints: Cesium.Cartesian3[] = [];
let pottingPoint: any = []
let arrowEntity: any = null;
/**
 *根据特征点屏幕坐标计算地理坐标
 * @param viewer
 * @param window_points 屏幕坐标
 * @returns {Array} 地理坐标（经纬度）
 * @private
 */
 function createGeoPoints(viewer: Ref<Cesium.Viewer | undefined>, window_points:any) {
  let points = [];
  let ray, cartesian, cartographic, lng, lat, height;
  for (let i = 0; i < window_points.length; i++) {
    ray = viewer.value!.camera.getPickRay(window_points[i]);
    ray && (cartesian = viewer.value!.scene.globe.pick(ray, viewer.value!.scene));
    if (cartesian) {
      cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      lng = Cesium.Math.toDegrees(cartographic.longitude);
      lat = Cesium.Math.toDegrees(cartographic.latitude);
      height = cartographic.height;
      points.push(lng, lat, height);
    }
  }
  return points;
}
function mid (t:any, o:any) {
  return [(t[0] + o[0]) / 2, (t[1] + o[1]) / 2]
}
function distance (t:any, o:any) {
  return Math.sqrt(Math.pow(t[0] - o[0], 2) + Math.pow(t[1] - o[1], 2))
}
const TWO_PI = 2 * Math.PI
const HALF_PI = Math.PI / 2
function getAzimuth (t:any, o:any) {
  var e, r = Math.asin(Math.abs(o[1] - t[1]) / distance(t, o));
	return o[1] >= t[1] && o[0] >= t[0] ? e = r + Math.PI : o[1] >= t[1] && o[0] < t[0] ? e = TWO_PI - r : o[1] < t[1] && o[0] < t[0] ? e = r : o[1] < t[1] && o[0] >= t[0] && (e = Math.PI - r), e
}
function getAngleOfThreePoints (t:any, o:any, e:any) {
  const a = getAzimuth(o, t) as number
  const b = getAzimuth(o, e) as number
  const r = a - b;
	return 0 > r ? r + TWO_PI : r
}
function getThirdPoint (t:any, o:any, e:any, r:any, n:any) {
  const g: any = getAzimuth(t, o),
  i = n ? g + e : g - e,
  s = r * Math.cos(i),
  a = r * Math.sin(i);
  return [o[0] + s, o[1] + a]
}
function getTempPoint4 (t:any, o:any, e:any) {
  var r, n, g, i, s = mid(t, o),
  a = distance(s, e),
  l = getAngleOfThreePoints(t, s, e);
  return l < HALF_PI ? (n = a * Math.sin(l), g = a * Math.cos(l), i = getThirdPoint(t, s, HALF_PI, n, !1), r = getThirdPoint(s, i, HALF_PI, g, !0)) : l >= HALF_PI && l < Math.PI ? (n = a * Math.sin(Math.PI - l), g = a * Math.cos(Math.PI - l), i = getThirdPoint(t, s, HALF_PI, n, !1), r = getThirdPoint(s, i, HALF_PI, g, !1)) : l >= Math.PI && l < 1.5 * Math.PI ? (n = a * Math.sin(l - Math.PI), g = a * Math.cos(l - Math.PI), i = getThirdPoint(t, s, HALF_PI, n, !0), r = getThirdPoint(s, i, HALF_PI, g, !0)) : (n = a * Math.sin(2 * Math.PI - l), g = a * Math.cos(2 * Math.PI - l), i = getThirdPoint(t, s, HALF_PI, n, !0), r = getThirdPoint(s, i, HALF_PI, g, !1)),
  r
}
function isClockWise (t:any, o:any, e:any) {
  return (e[1] - t[1]) * (o[0] - t[0]) > (o[1] - t[1]) * (e[0] - t[0])
}
const doubleArrowDefualParam = {
  type: "doublearrow",
  headHeightFactor: .25,
  headWidthFactor: .3,
  neckHeightFactor: .85,
  fixPointCount: 4,
  neckWidthFactor: .15
}
function wholeDistance(t:any) {
  for (var o = 0, e = 0; e < t.length - 1; e++) o += distance(t[e], t[e + 1]);
	return o
}
function getBaseLength(t:any) {
  return Math.pow(wholeDistance(t), .99)
}
function getArrowHeadPoints(t:any, o:any, e:any) {
  let r = getBaseLength(t),
  n = r * doubleArrowDefualParam.headHeightFactor,
  g = t[t.length - 1],
  i = (distance(o, e), n * doubleArrowDefualParam.headWidthFactor),
  s = n * doubleArrowDefualParam.neckWidthFactor,
  a = n * doubleArrowDefualParam.neckHeightFactor,
  l = getThirdPoint(t[t.length - 2], g, 0, n, !0),
  u = getThirdPoint(t[t.length - 2], g, 0, a, !0),
  c = getThirdPoint(g, l, HALF_PI, i, !1),
  p = getThirdPoint(g, l, HALF_PI, i, !0),
  h = getThirdPoint(g, u, HALF_PI, s, !1),
  d = getThirdPoint(g, u, HALF_PI, s, !0);
  return [h, c, g, p, d];
}
function getArrowBodyPoints(t:any, o:any, e:any, r:any) {
  let u:any[] = [], c:any[] = [];
  for (let n = wholeDistance(t), g = getBaseLength(t), i = g * r, s = distance(o, e), a = (i - s) / 2, l = 0, u = [], c = [], p = 1; p < t.length - 1; p++) {
    let h = getAngleOfThreePoints(t[p - 1], t[p], t[p + 1]) / 2;
    l += distance(t[p - 1], t[p]);
    let d = (i / 2 - l / n * a) / Math.sin(h),
    f = getThirdPoint(t[p - 1], t[p], Math.PI - h, d, !0),
    E = getThirdPoint(t[p - 1], t[p], h, d, !1);
    u.push(f),
    c.push(E)
  }
  return u.concat(c)
}
function getArrowPoints(t:any, o:any, e:any, r:any) {
  let n = mid(t, o),
  g = distance(n, e),
  i = getThirdPoint(e, n, 0, .3 * g, !0),
  s = getThirdPoint(e, n, 0, .5 * g, !0);
  i = getThirdPoint(n, i, HALF_PI, g / 5, r),
  s = getThirdPoint(n, s, HALF_PI, g / 4, r);
  let a = [n, i, s, e],
  l = getArrowHeadPoints(a, doubleArrowDefualParam.headHeightFactor, doubleArrowDefualParam.headWidthFactor, doubleArrowDefualParam.neckHeightFactor, doubleArrowDefualParam.neckWidthFactor),
  u = l[0],
  c = l[4],
  p = distance(t, o) / getBaseLength(a) / 2,
  h = getArrowBodyPoints(a, u, c, p),
  d = h.length,
  f = h.slice(0, d / 2),
  E = h.slice(d / 2, d);
  return f.push(u),
  E.push(c),
  f = f.reverse(),
  f.push(o),
  E = E.reverse(),
  E.push(t),
  f.reverse().concat(l, E)
}
function getFactorial(t:any) {
  if (1 >= t) return 1;
	if (2 == t) return 2;
	if (3 == t) return 6;
	if (4 == t) return 24;
	if (5 == t) return 120;
  let o = 1
	for (let e = 1; t >= e; e++) o *= e;
	return o
}
function getBinomialFactor(t:any, o:any) {
  return getFactorial(t) / (getFactorial(o) * getFactorial(t - o))
}
function getBezierPoints(t:any) {
  if (t.length <= 2) return t;
  let o = [], e = t.length - 1;
	for (let r = 0; 1 >= r; r += .01) {
    let n = 0, y = 0;
		for (let g = 0; e >= g; g++) {
			let i = getBinomialFactor(e, g),
				s = Math.pow(r, g),
				a = Math.pow(1 - r, e - g);
			n += i * s * a * t[g][0], y += i * s * a * t[g][1]
		}
		o.push([n, y])
	}
	return o.push(t[e]), o
}
function array2Dto1D(array:any) {
  let newArray:any[] = [];
  array.forEach((elt:any) => {
    newArray.push(elt[0]);
    newArray.push(elt[1]);
  });
  return newArray;
}
function doubleArrow(inputPoint:any) {
  let result:any = {
    controlPoint: null,
    polygonalPoint: null
  };
  let connPoint = null;
  let tempPoint4 = null;
  //获取已经点击的坐标数
  const t = inputPoint.length;
  if (2 == t) return inputPoint;
  if (!(2 > t)) {
      let o = inputPoint[0],    //第一个点
      e = inputPoint[1],        //第二个点
      r = inputPoint[2];       //第三个点
      //下面的是移动点位后的坐标
      3 == t ? tempPoint4 = getTempPoint4(o, e, r) : tempPoint4 = inputPoint[3],
      3 == t || 4 == t ? connPoint = mid(o, e) : connPoint = inputPoint[4];
      let n, g;
      isClockWise(o, e, r) ? (n = getArrowPoints(o, connPoint, tempPoint4, !1), g = getArrowPoints(connPoint, e, r, !0)) : (n = getArrowPoints(e, connPoint, r, !1), g = getArrowPoints(connPoint, o, tempPoint4, !0));
      let i = n.length,
      s = (i - 5) / 2,
      a = n.slice(0, s),
      l = n.slice(s, s + 5),
      u = n.slice(s + 5, i),
      c = g.slice(0, s),
      p = g.slice(s, s + 5),
      h = g.slice(s + 5, i);
      c = getBezierPoints(c);
      let d = getBezierPoints(h.concat(a.slice(1)));
      u = getBezierPoints(u);
      let f = c.concat(p, d, l, u);
      let newArray = array2Dto1D(f);
      result.controlPoint = [o, e, r, tempPoint4, connPoint];
      result.polygonalPoint = Cesium.Cartesian3.fromDegreesArray(newArray);
  }
  return result;
}
function showArrowOnMap(viewer: Ref<Cesium.Viewer | undefined>, positions:any) {
  let update = function () {
    //计算面
    if (positions.length < 3) {
      return null;
    }
    let lnglatArr = [];
    for (let i = 0; i < positions.length; i++) {
      let latlng = viewer.value!.scene.globe.ellipsoid.cartesianToCartographic(
        positions[i]
      );
      let lat = Cesium.Math.toDegrees(latlng.latitude);
      let lng = Cesium.Math.toDegrees(latlng.longitude);
      lnglatArr.push([lng, lat]);
    }
    let res = doubleArrow(lnglatArr);
    let returnData = [];
    let index = JSON.stringify(res.polygonalPoint).indexOf("null");
    if (index == -1) returnData = res.polygonalPoint;
    return new Cesium.PolygonHierarchy(returnData);
  };
  return viewer.value!.entities.add({
    id: setId(),
    name: "PincerArrow",
    polygon: new Cesium.PolygonGraphics({
      hierarchy: new Cesium.CallbackProperty(update, false),
      show: true,
      fill: true,
      material: Cesium.Color.BLUE,
    }),
  });
}
let lineCollection: Cesium.CustomDataSource | Cesium.DataSource;
let curDepth:any 
// 初始化
export function initPincerArrow(viewer: Ref<Cesium.Viewer | undefined>) {
  curDepth = viewer.value!.scene.globe.depthTestAgainstTerrain;
  viewer.value!.scene.globe.depthTestAgainstTerrain = true;
  anchorpoints = [];
  pottingPoint = []
  arrowEntity = null;
  lineCollection = new Cesium.CustomDataSource("lineEntityCollection");
  viewer.value!.dataSources.add(lineCollection);
}
// 创建线段
export function createPincerArrow(
  viewer: Ref<Cesium.Viewer | undefined>,
  click: Cesium.ScreenSpaceEventHandler.PositionedEvent
) {
  let pixPos = click.position;
  let cartesian = viewer.value!.scene.pickPosition(click.position);
  if (!cartesian || anchorpoints.length > 4) return;
  anchorpoints.push(cartesian);
  let GeoPoints = createGeoPoints(viewer, [{ x: pixPos.x, y: pixPos.y }]);
  pottingPoint.push(GeoPoints);
}

// 鼠标经过时显示的绘制
export function movePincerArrow(
  viewer: Ref<Cesium.Viewer | undefined>,
  movement: Cesium.ScreenSpaceEventHandler.MotionEvent
) {
  //移动时绘制面
  if (anchorpoints.length < 2) return;
  let my_ellipsoid = viewer.value!.scene.globe.ellipsoid;
  let cartesian = viewer.value!.camera.pickEllipsoid(movement.endPosition, my_ellipsoid);
  if (!cartesian) return;
  if (anchorpoints.length >= 2) {
    if (!Cesium.defined(arrowEntity)) {
      anchorpoints.push(cartesian);
      let GeoPoints = createGeoPoints(viewer, [movement.endPosition]);
      pottingPoint.push(GeoPoints);
      arrowEntity = showArrowOnMap(viewer, anchorpoints);
      arrowEntity.GeoType = "PincerArrow";
    } else {
      anchorpoints.pop();
      pottingPoint.pop();
      anchorpoints.push(cartesian);
      let GeoPoints = createGeoPoints(viewer, [movement.endPosition]);
      pottingPoint.push(GeoPoints);
    }
  }
}

function createNormalPincerArrow(viewer: Ref<Cesium.Viewer | undefined>, list: Cesium.Cartesian3[]) {
  let update = function () {
    //计算面
    if (list.length < 3) {
      return null;
    }
    let lnglatArr = [];
    for (let i = 0; i < list.length; i++) {
      let latlng = viewer.value!.scene.globe.ellipsoid.cartesianToCartographic(
        list[i]
      );
      let lat = Cesium.Math.toDegrees(latlng.latitude);
      let lng = Cesium.Math.toDegrees(latlng.longitude);
      lnglatArr.push([lng, lat]);
    }
    let res = doubleArrow(lnglatArr);
    let returnData = [];
    let index = JSON.stringify(res.polygonalPoint).indexOf("null");
    if (index == -1) returnData = res.polygonalPoint;
    return new Cesium.PolygonHierarchy(returnData);
  };
  return new Cesium.Entity({
    id: setId(),
    name: "PincerArrow",
    polygon: new Cesium.PolygonGraphics({
      hierarchy: new Cesium.CallbackProperty(update, false),
      show: true,
      fill: true,
      material: Cesium.Color.BLUE,
    }),
  });
}

export function endPincerArrow(viewer: Ref<Cesium.Viewer | undefined>) {
  arrowEntity.pottingPoint = pottingPoint;
  viewer.value!.entities.remove(arrowEntity); // 移除动态线，重新绘制
  lineCollection!.entities.add(
    createNormalPincerArrow(viewer, anchorpoints as Cesium.Cartesian3[])
  );
  viewer.value!.scene.globe.depthTestAgainstTerrain = curDepth;
  return arrowEntity;
}
