import * as Cesium from 'cesium'
import { PolygonStyle, PointStyle, PolylineStyle } from './type';
export const polygonEditConfig: PolygonStyle = {
    borderWidth: 2,
    borderColor: '#0000ff',
    borderStyle: 'solid',
    fillColor: 'rgba(109,207,201,0.8)',
    material: Cesium.Color.fromCssColorString('rgba(109,207,201,0.8)'),
    outlineMaterial: Cesium.Color.fromCssColorString('#0000ff'),
    remark: ''
}
export const pointEditConfig: PointStyle = {
    iconUrl: '',
    size: 3,
    remark: ''
}
export const polylineEditConfig: PolylineStyle = {
    width: 1,
    color: '#0000ff',
    style: 'solid',
    remark: '',
    material: Cesium.Color.fromCssColorString('#0000ff')
}