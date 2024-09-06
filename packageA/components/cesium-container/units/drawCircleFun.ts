import { Ref } from "vue";
import * as Cesium from "cesium";
import {
  transformCartesianToWGS84,
  transformWGS84ToCartesian,
  setId,
} from "../units/units";
let circle_center_entity: any = null;  // 圆心点 entity
let temporary_circle_entity: any = null;  // 临时圆形entity
let circle_entity: any = null; // 结果圆形entity
let circle_end_point: any = null;  // 结束点
let circle_center_point: any = null;  // 圆心点
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
// 根据经纬度计算两点之前的直线距离
function two_points_distance(start_point:any, end_point:any) {
	// 经纬度转换为世界坐标
	var start_position = Cesium.Cartesian3.fromDegrees(start_point.lon, start_point.lat, start_point.height);
	var end_position = Cesium.Cartesian3.fromDegrees(end_point.lon, end_point.lat, end_point.height);
	// 返回两个坐标的距离（单位：米）
  console.log('Cesium.Cartesian3.distance(start_position, end_position)', Cesium.Cartesian3.distance(start_position, end_position))
	return Cesium.Cartesian3.distance(start_position, end_position);
}
// 绘制结果圆形
function draw_circle(viewer: Ref<Cesium.Viewer | undefined>) {
	circle_entity = viewer.value!.entities.add({
		position: Cesium.Cartesian3.fromDegrees(circle_center_point.lon, circle_center_point.lat),
		ellipse: {
			// 半短轴（画圆：半短轴和半长轴一致即可）
			semiMinorAxis: two_points_distance(circle_center_point, circle_end_point),
			// 半长轴
			semiMajorAxis: two_points_distance(circle_center_point, circle_end_point),
			// 填充色
			material: Cesium.Color.RED.withAlpha(0.5),
			// 是否有边框
			outline: true,
			// 边框颜色
			outlineColor: Cesium.Color.WHITE,
			// 边框宽度
			outlineWidth: 4
		},
	});
}
// 创建圆心点
function create_circle_center_point(viewer: Ref<Cesium.Viewer | undefined>, point_arr:any) {
	circle_center_entity = viewer.value!.entities.add({
		// fromDegrees（经度，纬度，高度）以度为单位的经度和纬度值返回Cartesian3位置
		position: Cesium.Cartesian3.fromDegrees(point_arr[0], point_arr[1], 100),
		point: {
			// 点的大小（像素）
			pixelSize: 5,
			// 点位颜色，fromCssColorString 可以直接使用CSS颜色
			color: Cesium.Color.WHITE,
			// 边框颜色
			outlineColor: Cesium.Color.fromCssColorString('#fff'),
			// 边框宽度(像素)
			outlineWidth: 2,
			// 是否显示
			show: true
		}
	});
}

function changeEndpoint() {
  return two_points_distance(circle_center_point, circle_end_point) || 1;
}

// 绘制动态圆
function draw_dynamic_circle(viewer: Ref<Cesium.Viewer | undefined>, point:any) {
	temporary_circle_entity = viewer.value!.entities.add({
		position: Cesium.Cartesian3.fromDegrees(point.lon, point.lat),
		ellipse: {
			// 半短轴（画圆：半短轴和半长轴一致即可）
			semiMinorAxis: new Cesium.CallbackProperty(changeEndpoint, false),
			// 半长轴
			semiMajorAxis: new Cesium.CallbackProperty(changeEndpoint, false),
			// 填充色
			material: Cesium.Color.RED.withAlpha(0.5),
			// 是否有边框
			outline: true,
			// 边框颜色
			outlineColor: Cesium.Color.WHITE,
			// 边框宽度
			outlineWidth: 4
		},
	});
}
// 初始化
export function initCircle(viewer: Ref<Cesium.Viewer | undefined>) {
  circle_center_entity = null;
  temporary_circle_entity = null;
  circle_entity = null
  circle_end_point= null
  circle_center_point = null
}
// 创建线段
export function createCircle(
  viewer: Ref<Cesium.Viewer | undefined>,
  click: Cesium.ScreenSpaceEventHandler.PositionedEvent,
  isSelected: Ref<Boolean>,
  type: Ref<string | null>
) {
  // 屏幕坐标转为世界坐标
  let cartesian = viewer.value!.scene.globe.pick(viewer.value!.camera.getPickRay(click.position) as Cesium.Ray, viewer.value!.scene);
  let ellipsoid = viewer.value!.scene.globe.ellipsoid;
  let cartographic = ellipsoid.cartesianToCartographic(cartesian as Cesium.Cartesian3);
  let lon = Cesium.Math.toDegrees(cartographic.longitude);	// 经度
  let lat = Cesium.Math.toDegrees(cartographic.latitude);	// 纬度
  // 判断圆心是否已经绘制，如果绘制了，再次点击左键的时候，就是绘制最终结果圆形
  if (circle_center_entity) {
    // 设置最终点
    circle_end_point = {
      lon: lon,
      lat: lat,
      height: 0
    }
    // 绘制结果多边形
    draw_circle(viewer);
    // 清除事件
    isSelected.value = false
    type.value = null
    if(viewer.value?.screenSpaceEventHandler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)) {
      viewer.value?.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
    }
    // handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    // handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    // 清除 绘制的中心点和临时圆
    viewer.value!.entities.remove(circle_center_entity);
    viewer.value!.entities.remove(temporary_circle_entity);
  } else {
    // 设置中心点坐标和结束点坐标
    circle_end_point = circle_center_point = {
      lon: lon,
      lat: lat,
      height: 0
    }
    console.log('circle_end_point', circle_end_point)
    // 绘制圆心点
    create_circle_center_point(viewer, [lon, lat]);
    // 开始绘制动态圆形
    draw_dynamic_circle(viewer, circle_center_point);
    // 鼠标移动--实时绘制圆形
    // handler.setInputAction((event) => {
    
    // }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }
}

// 鼠标经过时显示的绘制
export function moveCircle(
  viewer: Ref<Cesium.Viewer | undefined>,
  movement: Cesium.ScreenSpaceEventHandler.MotionEvent,
  type: Ref<string | null>
) {
  if(type.value === 'Circle' && !circle_center_entity) {
    // 屏幕坐标转为世界坐标
    let cartesian = viewer.value!.scene.globe.pick(viewer.value!.camera.getPickRay(movement.endPosition) as Cesium.Ray, viewer.value!.scene);
    let ellipsoid = viewer.value!.scene.globe.ellipsoid;
    let cartographic = ellipsoid.cartesianToCartographic(cartesian as Cesium.Cartesian3);
    let lon = Cesium.Math.toDegrees(cartographic.longitude);  // 经度
    let lat = Cesium.Math.toDegrees(cartographic.latitude);   // 纬度

    if (temporary_circle_entity) {
      // 修改结束点-用于动态绘制圆形
      circle_end_point = {
        lon: lon,
        lat: lat,
        height: 0
      }
      changeEndpoint()
    }
  }
}
