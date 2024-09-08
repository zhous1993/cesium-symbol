import { FineArrow } from './arrow/fineArrow';
import { PincerArrow } from './arrow/pincerArrow';
import { AttackArrow } from './arrow/attackArrow';
import { SingleArrow } from './arrow/singleArrow';
import { SwallowtailArrow } from './arrow/swallowtailArrow';
import { StraightLineArrow } from './arrow/straightLineArrow';
import { CurvedLineArrow } from './arrow/curvedLineArrow';
import { IconPoint } from './iconPoint';
import { CesiumTypes, CreateByDataOptions } from './type';
import * as Cesium from 'cesium';
declare const ZCesium: {
    IconPoint: typeof IconPoint;
    FineArrow: typeof FineArrow;
    PincerArrow: typeof PincerArrow;
    AttackArrow: typeof AttackArrow;
    SingleArrow: typeof SingleArrow;
    SwallowtailArrow: typeof SwallowtailArrow;
    StraightLineArrow: typeof StraightLineArrow;
    CurvedLineArrow: typeof CurvedLineArrow;
    createGeometryFromData: (cesium: CesiumTypes, viewer: Cesium.Viewer, options: CreateByDataOptions) => void;
};
export default ZCesium;
