import { Cartesian3 } from 'cesium';
import { default as Basic } from '../bastic';
import { Category, LngLat, PolygonStyle } from '../type';

export declare class SingleArrow extends Basic {
    points: Cartesian3[];
    headHeightFactor: number;
    headWidthFactor: number;
    neckHeightFactor: number;
    neckWidthFactor: number;
    headTailFactor: number;
    minPointsForShape: number;
    constructor(cesium: any, viewer: any, style?: PolygonStyle);
    getCategory(): Category;
    addPoint(cartesian: Cartesian3): void;
    updateMovingPoint(cartesian: Cartesian3): void;
    createGraphic(positions: Cartesian3[]): Cartesian3[];
    getPoints(): Cartesian3[];
    getArrowHeadPoints(points: LngLat[], tailLeft: LngLat, tailRight: LngLat): LngLat[] | undefined;
    getArrowBodyPoints(points: LngLat[], neckLeft: LngLat, neckRight: LngLat, tailWidthFactor: number): any;
    updateDraggingPoint(cartesian: Cartesian3, index: number): void;
}
