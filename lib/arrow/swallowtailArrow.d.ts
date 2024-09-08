import { Cartesian3 } from 'cesium';
import { PolygonStyle } from '../type';
import { SingleArrow } from './singleArrow';

export declare class SwallowtailArrow extends SingleArrow {
    points: Cartesian3[];
    headHeightFactor: number;
    headWidthFactor: number;
    neckHeightFactor: number;
    neckWidthFactor: number;
    headTailFactor: number;
    tailWidthFactor: number;
    swallowTailFactor: number;
    swallowTailPnt: [number, number];
    constructor(cesium: any, viewer: any, style: PolygonStyle);
    createGraphic(positions: Cartesian3[]): Cartesian3[];
}
