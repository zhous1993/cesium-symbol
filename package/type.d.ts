
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
export type PointStyle = {
    iconUrl: string
    size?: number
    opacity?: number
    remark?: string
    material?: any
}
export type PolygonStyle = {

    borderWidth?: number
    borderColor?: string
    borderStyle?: 'solid' | 'dashed' | 'dotted' | 'dot-dash'
    fillColor?: string
    opacity?: number
    remark?: string
    material?: any
    outlineMaterial?: any

}
export type PolylineStyle = {
    width?: number
    color?: string
    style?: 'solid' | 'dashed' | 'dotted' | 'dot-dash'
    opacity?: number
    remark?: string
    material?: any

}
export type Entity = CesiumEntity & {
    type?: string
    attr?: string
    objId?: string
    index?: number // 点在positions里的index
    editConfig?: PointStyle | PolylineStyle | PolygonStyle
}

export type LngLat = [number, number]



export type EventType = 'drawStart' | 'drawUpdate' | 'drawEnd' | 'editEnd' | 'editStart';
export type EventListener = (eventData?: any) => void;


// Basic

export type State = 'drawing' | 'edit' | 'static'
export type Category = 'polygon' | 'point' | 'polyline'
export type GeometryStyle = PointStyle | PolygonStyle | PolylineStyle