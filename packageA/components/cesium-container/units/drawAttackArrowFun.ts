import { Ref } from "vue";
import * as Cesium from "cesium";
import {
    transformCartesianToWGS84,
    transformWGS84ToCartesian,
    setId,
} from "../units/units";
let anchorpoints: any = [];
let pottingPoint: any = []
let polyline: any = null;
let attackArrowPoints: any;
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

let attackArrow: Cesium.CustomDataSource | Cesium.DataSource;
// 初始化
export function initAttackArrow(viewer: Ref<Cesium.Viewer | undefined>) {
    anchorpoints = [];
    pottingPoint = []
    polyline = null;
    attackArrowPoints = null
    attackArrow = new Cesium.CustomDataSource("attackArrow");
    viewer.value!.dataSources.add(attackArrow);
}
// 创建线段
export function createAttackArrow(
    viewer: Ref<Cesium.Viewer | undefined>,
    click: Cesium.ScreenSpaceEventHandler.PositionedEvent,
) {
    let cartesian = getCatesian3FromPX(viewer, click.position) as Cesium.Cartesian3;
    if (Cesium.defined(cartesian)) {
        anchorpoints.push(cartesian)
    }
    if (anchorpoints.length === 4) {
        console.log(anchorpoints)
        pottingPoint = window.xp.algorithm.fineArrow([anchorpoints[0], anchorpoints[1]], [anchorpoints[2], anchorpoints[3]])
        attackArrow.entities.add({
            polygon: {
                hierarchy: pottingPoint,
                material: Cesium.Color.WHITE.withAlpha(0.3),
                outline: true,
                outlineColor: Cesium.Color.WHITE,
                perPositionHeight: true,
                zIndex: 0
            }
        })
    }
}

// 鼠标经过时显示的绘制
export function moveAttackArrow(
    viewer: Ref<Cesium.Viewer | undefined>,
    movement: Cesium.ScreenSpaceEventHandler.MotionEvent
) {
    let endPos = movement.endPosition;
    // if (anchorpoints.length > 0) {
    //     if (!Cesium.defined(polyline)) {
    //         let GeoPoints: number[] = [];

    //         attackArrowPoints = Cesium.Cartesian3.fromDegreesArray(GeoPoints);
    //         polyline = viewer.value!.entities.add({
    //             name: "attackArrow",
    //             id: setId(),
    //             polyline: {
    //                 positions: new Cesium.CallbackProperty(function () {
    //                     return attackArrowPoints;
    //                 }, false),
    //                 width: 10,
    //             },
    //         });
    //         polyline.GeoType = 'StraightattackArrow';
    //     } else {
    //         anchorpoints.pop();
    //         pottingPoint.pop();



    //         attackArrowPoints = Cesium.Cartesian3.fromDegreesArray(GeoPoints1);
    //     }
    // }
}

function createNormalLine(list: Cesium.Cartesian3[]) {
    return new Cesium.Entity({
        name: "attackArrow",
        id: setId(),
        polyline: {
            positions: list,
            width: 10,
        },
    });
}

export function endAttackArrow(viewer: Ref<Cesium.Viewer | undefined>) {
    polyline.pottingPoint = pottingPoint;
    viewer.value!.entities.remove(polyline); // 移除动态线，重新绘制
    attackArrow!.entities.add(
        createNormalLine(attackArrowPoints as Cesium.Cartesian3[])
    );
    return polyline;
}
