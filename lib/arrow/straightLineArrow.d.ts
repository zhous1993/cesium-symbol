import { Cartesian3 } from 'cesium';
import { Category, PolylineStyle } from '../type';
import { default as Basic } from '../bastic';

export declare class StraightLineArrow extends Basic {
    points: Cartesian3[];
    arrowLengthScale: number;
    maxArrowLength: number;
    minPointsForShape: number;
    constructor(cesium: any, viewer: any, style?: PolylineStyle);
    getCategory(): Category;
    addPoint(cartesian: Cartesian3): void;
    updateMovingPoint(cartesian: Cartesian3): void;
    updateDraggingPoint(cartesian: Cartesian3, index: number): void;
    createGraphic(positions: Cartesian3[]): Cartesian3[];
    getPoints(): Cartesian3[];
}
