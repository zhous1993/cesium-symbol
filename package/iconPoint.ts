import Basic from "./bastic";
import { Cartesian3 } from "cesium";

import { Category, PointStyle } from "./type";

export class IconPoint extends Basic {
    iconUrl: string;
    constructor(cesium: any, viewer: any, style: PointStyle) {
        super(cesium, viewer, style);
        this.style = style;
        this.iconUrl = style?.iconUrl || 'point.png';
    }
    getCategory(): Category {
        return 'point';
    }

    addPoint(cartesian: Cartesian3) {
        this.points.push(cartesian);
        this.setGeometryPoints([cartesian])
        this.drawPoint()
        this.finishDrawing()
    }
    getPoints(): Cartesian3[] {
        return this.points
    }
    drawPoint() {
        this.mainEntity = this.viewer.entities.add({
            position: this.positions[0],
            billboard: {
                image: new URL(`./icon/${this.iconUrl}`, import.meta.url).href,
                horizontalOrigin: this.cesium.HorizontalOrigin.CENTER,
                verticalOrigin: this.cesium.VerticalOrigin.CENTER,
                // @ts-ignore
                scale: Number(this.style!.size) || 1,   // 标注点icon缩放比例
                heightReference: this.cesium.HeightReference.CLAMP_TO_GROUND
            }
        });
    }
    updatePoint() {
        this.mainEntity!.position = new this.cesium.ConstantPositionProperty(this.positions[0])
    }
}