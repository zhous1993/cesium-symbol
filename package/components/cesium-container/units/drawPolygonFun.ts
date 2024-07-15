import { Ref } from "vue";
import * as Cesium from "cesium";
import {
  transformCartesianToWGS84,
  transformWGS84ToCartesian,
  setId,
} from "../units/units";
let anchorpoints: Cesium.Cartesian3[] = [];
let polygon: any = null;
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
export function initPolygon(viewer: Ref<Cesium.Viewer | undefined>) {
  anchorpoints = [];
  polygon = null;
  lineCollection = new Cesium.CustomDataSource("lineEntityCollection");
  viewer.value!.dataSources.add(lineCollection);
}
// 创建线段
export function createPolygon(
  viewer: Ref<Cesium.Viewer | undefined>,
  click: Cesium.ScreenSpaceEventHandler.PositionedEvent
) {
  let cartesian = getCatesian3FromPX(viewer, click.position) as Cesium.Cartesian3;
  if (anchorpoints.length == 0) {
    anchorpoints.push(cartesian);
    let dynamicPositions = new Cesium.CallbackProperty(function () {
      return new Cesium.PolygonHierarchy(anchorpoints);
    }, false);
    // 绘制动态线
    polygon = viewer.value?.entities.add({
      name: "Polygon",
      id: setId(),
      polygon: {
        hierarchy: dynamicPositions,
        material: Cesium.Color.BLUE.withAlpha(0.3),
        outline: true,
        outlineColor: Cesium.Color.BLUE,
        height: 0,
      },
    });
    polygon.GeoType = "Polygon";
  }
  anchorpoints.push(cartesian);
}

// 鼠标经过时显示的绘制
export function movePolygon(
  viewer: Ref<Cesium.Viewer | undefined>,
  movement: Cesium.ScreenSpaceEventHandler.MotionEvent
) {
  let endPos = movement.endPosition;
  if (Cesium.defined(polygon)) {
    anchorpoints.pop();
    let cartesian = getCatesian3FromPX(viewer, endPos) as Cesium.Cartesian3;
    anchorpoints.push(cartesian);
  }
}

function createNormalPolygon(list: Cesium.Cartesian3[]) {
  return new Cesium.Entity({
    polygon: {
      hierarchy: list,
      material: Cesium.Color.BLUE.withAlpha(0.3),
      outline: true,
      outlineColor: Cesium.Color.BLUE,
      height: 0,
    },
  });
}

export function endPolygon(viewer: Ref<Cesium.Viewer | undefined>) {
  anchorpoints.pop();
  polygon.pottingPoint = anchorpoints;
  viewer.value!.entities.remove(polygon); // 移除动态线，重新绘制
  lineCollection!.entities.add(
    createNormalPolygon(anchorpoints as Cesium.Cartesian3[])
  );
  return polygon;
}
