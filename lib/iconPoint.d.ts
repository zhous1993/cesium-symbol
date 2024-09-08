import { default as Basic } from './bastic';
import { Cartesian3 } from 'cesium';
import { Category, PointStyle } from './type';

export declare class IconPoint extends Basic {
    iconUrl: string;
    constructor(cesium: any, viewer: any, style: PointStyle);
    getCategory(): Category;
    addPoint(cartesian: Cartesian3): void;
    getPoints(): Cartesian3[];
    drawPoint(): void;
    updatePoint(): void;
}
