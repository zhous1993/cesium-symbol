//@ts-ignore
import * as Cesium from 'cesium'
export type CesiumTypes = typeof Cesium

export type PointStyle = {
    iconUrl?: string
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

// Event

export type EventType = 'drawStart' | 'drawUpdate' | 'drawEnd' | 'editEnd' | 'editStart';
export type EventListener = (eventData?: any) => void;


// Basic

export type State = 'drawing' | 'edit' | 'static'
export type Category = 'polygon' | 'point' | 'polyline'
export type GeometryStyle = PointStyle | PolygonStyle | PolylineStyle
export type CreateByDataOptions = {
    style?: GeometryStyle
    type: string
    points: Cesium.Cartesian3[]
}