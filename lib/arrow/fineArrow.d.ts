import { default as Basic } from '../bastic';
import { Cartesian3 } from 'cesium';
import { Category, PolygonStyle } from '../type';

export declare class FineArrow extends Basic {
    points: Cartesian3[];
    arrowLengthScale: number;
    maxArrowLength: number;
    tailWidthFactor: number;
    neckWidthFactor: number;
    headWidthFactor: number;
    headAngle: number;
    neckAngle: number;
    minPointsForShape: number;
    constructor(cesium: any, viewer: any, style?: PolygonStyle);
    getCategory(): Category;
    addPoint(cartesian: Cartesian3): void;
    updateMovingPoint(cartesian: Cartesian3): void;
    updateDraggingPoint(cartesian: Cartesian3, index: number): void;
    createGraphic(positions: Cartesian3[]): Cartesian3[];
    getPoints(): Cartesian3[];
}
