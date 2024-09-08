import { default as Basic } from '../bastic';
import { Cartesian3 } from 'cesium';
import { Category, LngLat, PolygonStyle } from '../type';

export declare class PincerArrow extends Basic {
    points: Cartesian3[];
    arrowLengthScale: number;
    maxArrowLength: number;
    neckWidthFactor: number;
    headWidthFactor: number;
    headHeightFactor: number;
    neckHeightFactor: number;
    connPoint: LngLat;
    tempPoint4: LngLat;
    minPointsForShape: number;
    llBodyPnts: LngLat[];
    rrBodyPnts: LngLat[];
    curveControlPointLeft: Cartesian3;
    curveControlPointRight: Cartesian3;
    isClockWise: boolean;
    constructor(cesium: any, viewer: any, style?: PolygonStyle);
    getCategory(): Category;
    addPoint(cartesian: Cartesian3): void;
    finishDrawing(): void;
    updateMovingPoint(cartesian: Cartesian3): void;
    updateDraggingPoint(cartesian: Cartesian3, index: number): void;
    createGraphic(positions: Cartesian3[]): Cartesian3[];
    getTempPoint4(linePnt1: LngLat, linePnt2: LngLat, point: LngLat): LngLat;
    getArrowPoints(pnt1: LngLat, pnt2: LngLat, pnt3: LngLat, clockWise: boolean): LngLat[];
    getArrowBodyPoints(points: LngLat[], neckLeft: LngLat, neckRight: LngLat, tailWidthFactor: number): LngLat[];
    getArrowHeadPoints(points: LngLat[]): LngLat[];
    getPoints(): Cartesian3[];
    getBezierControlPointforGrowthAnimation(): {
        left: Cartesian3;
        right: Cartesian3;
    };
}
