import { Entity as CesiumEntity, ScreenSpaceEventHandler } from "cesium";

// 定义图标
export interface ICONTYPE {
    iconUrl?: string;
    text?: string;
    lat?: string;
    lon?: string;
    remark?: string;
    id?: string;
    type?: string;
    entity?: Entity;
    size?: number;
}
export type Point = {
    lat: string,
    lon: string,
    height?: string,
    id: symbol,
    fillColor?: string,
    type?: string,
    remark?: string,
    iconUrl?: string,
    text?: string
}
export interface Graphics {
    handler: any
    points: Point[]
    centerPoint: any
    rotatePoint: any
    draw(): void
    end(): void
    calcCenterPoint(): void
    calcRotateAngle(movement: ScreenSpaceEventHandler.MotionEvent): void
    calcRotatePoint(): void
    calcMouseMove?(movement: ScreenSpaceEventHandler.MotionEvent): void

    calcRotatePosition(angle: any, currentMousePosition: any): void
}

export type Entity = CesiumEntity & {
    type?: string
    attr?: string
    objId?: string
}