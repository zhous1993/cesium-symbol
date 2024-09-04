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
    category: 'polygon' | 'point' | 'polyline'
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
export type PointEditConfig = {
    iconUrl: string
    size?: number
    opacity?: number
    remark?: string
}
export type PolygonEditConfig = {

    borderWidth?: number
    borderColor?: string
    borderStyle?: 'solid' | 'dashed' | 'dotted' | 'dot-dash'
    fillColor?: string
    opacity?: number
    remark?: string
}
export type PolylineEditConfig = {
    width?: number
    color?: string
    style?: 'solid' | 'dashed' | 'dotted' | 'dot-dash'
    opacity?: number
    remark?: string
}
export type Entity = CesiumEntity & {
    type?: string
    attr?: string
    objId?: string
    editConfig?: PointEditConfig | PolygonEditConfig | PolylineEditConfig
}

export type LngLat = [number, number]