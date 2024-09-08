import Basic from '../bastic';
import * as Utils from '../utils';
// @ts-ignore
import { Cartesian3 } from 'cesium';
import { Category, PolygonStyle } from '../type';

export class FineArrow extends Basic {
    points: Cartesian3[] = [];
    arrowLengthScale: number = 5;
    maxArrowLength: number = 2;
    tailWidthFactor: number;
    neckWidthFactor: number;
    headWidthFactor: number;
    headAngle: number;
    neckAngle: number;
    minPointsForShape: number;

    constructor(cesium: any, viewer: any, style?: PolygonStyle) {
        super(cesium, viewer, style);
        this.cesium = cesium;
        this.tailWidthFactor = 0.1;
        this.neckWidthFactor = 0.2;
        this.headWidthFactor = 0.25;
        this.headAngle = Math.PI / 8.5;
        this.neckAngle = Math.PI / 13;
        this.minPointsForShape = 2;
        this.setState('drawing');
    }

    getCategory(): Category {
        return 'polygon'
    }
    addPoint(cartesian: Cartesian3) {
        if (this.points.length < 2) {
            this.points.push(cartesian);
            this.onMouseMove();
        }
        if (this.points.length === 2) {
            const geometryPoints = this.createGraphic(this.points);
            this.setGeometryPoints(geometryPoints);
            this.drawPolygon();
            this.finishDrawing();
        }
    }
    updateMovingPoint(cartesian: Cartesian3) {
        const tempPoints = [...this.points, cartesian];
        const geometryPoints = this.createGraphic(tempPoints);
        this.setGeometryPoints(geometryPoints);
        this.drawPolygon();
    }
    updateDraggingPoint(cartesian: Cartesian3, index: number) {
        this.points[index] = cartesian;
        const geometryPoints = this.createGraphic(this.points);
        this.setGeometryPoints(geometryPoints);
        this.drawPolygon();

    }
    createGraphic(positions: Cartesian3[]) {
        const [p1, p2] = positions.map(this.cartesianToLnglat);
        const len = Utils.getBaseLength([p1, p2]);
        const tailWidth = len * this.tailWidthFactor;
        const neckWidth = len * this.neckWidthFactor;
        const headWidth = len * this.headWidthFactor;
        const tailLeft = Utils.getThirdPoint(p2, p1, Math.PI / 2, tailWidth, true);
        const tailRight = Utils.getThirdPoint(p2, p1, Math.PI / 2, tailWidth, false);
        const headLeft = Utils.getThirdPoint(p1, p2, this.headAngle, headWidth, false);
        const headRight = Utils.getThirdPoint(p1, p2, this.headAngle, headWidth, true);
        const neckLeft = Utils.getThirdPoint(p1, p2, this.neckAngle, neckWidth, false);
        const neckRight = Utils.getThirdPoint(p1, p2, this.neckAngle, neckWidth, true);
        const points = [...tailLeft, ...neckLeft, ...headLeft, ...p2, ...headRight, ...neckRight, ...tailRight, ...p1];
        const cartesianPoints = this.cesium.Cartesian3.fromDegreesArray(points);
        return cartesianPoints;
    }

    getPoints() {
        return this.points;
    }
}
