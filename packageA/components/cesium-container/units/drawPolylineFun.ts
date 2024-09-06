import { Ref } from "vue";
import * as Cesium from "cesium";
import {
  transformCartesianToWGS84,
  transformWGS84ToCartesian,
  setId,
} from "../units/units";
let anchorpoints: (boolean | Cesium.Cartesian3 | null)[] = [];
let polyline: any = null;
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
export function initPolyline(viewer: Ref<Cesium.Viewer | undefined>) {
  anchorpoints = [];
  polyline = null;
  lineCollection = new Cesium.CustomDataSource("lineEntityCollection");
  viewer.value!.dataSources.add(lineCollection);
}
// 创建线段
export function createPolyline(
  viewer: Ref<Cesium.Viewer | undefined>,
  click: Cesium.ScreenSpaceEventHandler.PositionedEvent
) {
  let cartesian = getCatesian3FromPX(viewer, click.position);

  if (anchorpoints.length == 0) {
    anchorpoints.push(cartesian);
    // 绘制动态线
    polyline = viewer.value?.entities.add({
      name: "Polyline",
      id: setId(),
      polyline: {
        positions: new Cesium.CallbackProperty(() => {
          return anchorpoints;
        }, false),
        clampToGround: true,
        width: 2,
        material: Cesium.Color.BLUE,
      },
    });
    polyline.GeoType = "Polyline";
  }
  anchorpoints.push(cartesian);
}

// 鼠标经过时显示的绘制
export function movePolyline(
  viewer: Ref<Cesium.Viewer | undefined>,
  movement: Cesium.ScreenSpaceEventHandler.MotionEvent
) {
  let endPos = movement.endPosition;
  if (Cesium.defined(polyline)) {
    anchorpoints.pop();
    let cartesian = getCatesian3FromPX(viewer, endPos);
    anchorpoints.push(cartesian);
  }
}

function createNormalLine(list: Cesium.Cartesian3[]) {
  return new Cesium.Entity({
    polyline: {
      positions: list,
      clampToGround: true,
      width: 2,
      material: Cesium.Color.BLUE,
    },
  });
}

export function endPolyline(viewer: Ref<Cesium.Viewer | undefined>) {
  anchorpoints.pop();
  polyline.pottingPoint = anchorpoints;
  viewer.value!.entities.remove(polyline); // 移除动态线，重新绘制
  lineCollection!.entities.add(
    createNormalLine(anchorpoints as Cesium.Cartesian3[])
  );
  return polyline;
}
