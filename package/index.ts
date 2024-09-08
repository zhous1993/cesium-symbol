// @ts-ignore
import * as Cesium from 'cesium'
import { FineArrow } from './arrow/fineArrow'
import { PincerArrow } from './arrow/pincerArrow'
import { AttackArrow } from './arrow/attackArrow'
import { SingleArrow } from './arrow/singleArrow'
import { SwallowtailArrow } from './arrow/swallowtailArrow'
import { StraightLineArrow } from './arrow/straightLineArrow'
import { CurvedLineArrow } from './arrow/curvedLineArrow'
import { IconPoint } from './iconPoint'
import { CesiumTypes, CreateByDataOptions } from './type'
const ZCesium = {
    IconPoint,
    FineArrow,
    PincerArrow,
    AttackArrow,
    SingleArrow,
    SwallowtailArrow,
    StraightLineArrow,
    CurvedLineArrow,
    //@ts-ignore
    createGeometryFromData: (cesium: CesiumTypes, viewer: Cesium.Viewer, options: CreateByDataOptions) => {
    }

}
//@ts-ignore
ZCesium.createGeometryFromData = (cesium: CesiumTypes, viewer: Cesium.Viewer, options: CreateByDataOptions) => {
    const { type, style, points } = options;
    //@ts-ignore
    const geometry = new ZCesium[type](cesium, viewer, style);

    geometry.points = points;
    const geometryPoints = geometry.createGraphic(points);
    geometry.setGeometryPoints(geometryPoints);
    if (geometry.type == 'polygon') {
        geometry.drawPolygon();
    } else if (geometry.type == 'polyline') {
        geometry.drawLine();
    } else if (geometry.type == 'point') {
        geometry.drawPoint();
    }
    geometry.finishDrawing();
    geometry.onClick();
    return geometry;
}

export default ZCesium