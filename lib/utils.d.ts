import { LngLat } from './type';
import * as Cesium from 'cesium';
/***
 * 坐标转换 84转笛卡尔
 * @param {Object} {lng,lat,alt} 地理坐标
 * @return {Object} Cartesian3 三维位置坐标
 */
export declare function transformWGS84ToCartesian(position: {
    lng?: any;
    lon?: any;
    lat: number;
    alt?: any;
}, alt?: any): Cesium.Cartesian3;
/***
 * 坐标转换 笛卡尔转84
 * @param {Object} Cartesian3 三维位置坐标
 * @return {Object} {lng,lat,alt} 地理坐标
 */
export declare function transformCartesianToWGS84(cartesian: Cesium.Cartesian3): {
    lng: number;
    lat: number;
    alt: number;
};
/***
 * 生成uuid字符串
 * @param {Number} num 生成的位数默认值32位
 * @return {String} str
 */
export declare function setId(num?: number): string;
export declare function getCatesian3FromPX(px: Cesium.Cartesian2, viewer: Cesium.Viewer): any;
export declare function cartesianToLatlng(cartesian: Cesium.Cartesian3): [number, number];
/**
 * 求取两个坐标的中间值
 * @param point1
 * @param point2
 * @returns {[*,*]}
 * @constructor
 */
export declare const Mid: (point1: [number, number], point2: [number, number]) => [number, number];
/**
 * 启停用相机
 * @param viewer
 * @param enable
 * @returns
 */
export declare const enableCamera: (viewer: Cesium.Viewer, enable: boolean) => void;
/**
 * 计算两个坐标之间的距离
 * @param pnt1
 * @param pnt2
 * @returns {number}
 * @constructor
 */
export declare const MathDistance: (pnt1: LngLat, pnt2: LngLat) => number;
/**
 * 获取方位角（地平经度）
 * @param startPoint
 * @param endPoint
 * @returns {*}
 */
export declare const getAzimuth: (startPoint: LngLat, endPoint: LngLat) => number;
/**
 * 通过三个点获取方位角
 * @param pntA: LngLat
 * @param pntB:LngLat
 * @param pntC:LngLat
 * @returns {number}
 */
export declare const getAngleOfThreePoints: (pntA: LngLat, pntB: LngLat, pntC: LngLat) => number;
/**
 * 判断是否是顺时针
 * @param pnt1
 * @param pnt2
 * @param pnt3
 * @returns {boolean}
 */
export declare const isClockWise: (pnt1: LngLat, pnt2: LngLat, pnt3: LngLat) => boolean;
/**
 * 根据起止点和旋转方向求取第三个点
 * @param startPnt
 * @param endPnt
 * @param angle
 * @param distance
 * @param clockWise
 * @returns {[*,*]}
 */
export declare const getThirdPoint: (startPnt: LngLat, endPnt: LngLat, angle: number, distance: number, clockWise: boolean) => LngLat;
/**
 * 二维数组去重
 * @param points
 * @returns
 */
export declare const removeDuplicatePoints: (points: LngLat[]) => LngLat[];
/**
 * 计算中心点坐标
 * @param points
 * @returns
 */
export declare const Center: (points: LngLat[]) => LngLat;
/**
 * 计算点集合的总距离
 * @param points
 * @returns {number}
 */
export declare const wholeDistance: (points: LngLat[]) => number;
/**
 * 获取默认三点的内切圆
 * @param pnt1
 * @param pnt2
 * @param pnt3
 * @returns {[*,*]}
 */
export declare const getNormal: (pnt1: LngLat, pnt2: LngLat, pnt3: LngLat) => number[];
/**
 * 获取阶乘数据
 * @param n
 * @returns {number}
 */
export declare const getFactorial: (n: any) => number;
/**
 * 获取二项分布
 * @param n
 * @param index
 * @returns {number}
 */
export declare const getBinomialFactor: (n: number, index: number) => number;
/**
 * 贝塞尔曲线
 * @param points
 * @returns {*}
 */
export declare const getBezierPoints: (points: LngLat[]) => LngLat[];
/**
 * 获取基础长度
 * @param points
 * @returns {number}
 */
export declare const getBaseLength: (points: LngLat[]) => number;
/**
 * getBisectorNormals
 * @param t
 * @param pnt1
 * @param pnt2
 * @param pnt3
 * @returns {[*,*]}
 */
export declare const getBisectorNormals: (t: any, pnt1: LngLat, pnt2: LngLat, pnt3: LngLat) => any[];
/**
 * 得到二次线性因子
 * @param k
 * @param t
 * @returns {number}
 */
export declare const getQuadricBSplineFactor: (k: number, t: number) => number;
/**
 * 插值线性点
 * @param points
 * @returns {LngLat[]}
 */
export declare const getQBSplinePoints: (points: LngLat[]) => LngLat[];
/**
 * 获取左边控制点
 * @param controlPoints
 * @param t
 * @returns {[*,*]}
 */
export declare const getLeftMostControlPoint: (controlPoints: LngLat[], t: number) => LngLat;
/**
 * 获取右边控制点
 * @param controlPoints
 * @param t
 * @returns {[*,*]}
 */
export declare const getRightMostControlPoint: (controlPoints: LngLat[], t: number) => LngLat;
/**
 * 获取立方值
 * @param t
 * @param startPnt
 * @param cPnt1
 * @param cPnt2
 * @param endPnt
 * @returns {[*,*]}
 */
export declare const getCubicValue: (t: number, startPnt: LngLat, cPnt1: LngLat, cPnt2: LngLat, endPnt: LngLat) => number[];
/**
 * 插值曲线点
 * @param t
 * @param controlPoints
 * @returns {null}
 */
export declare const getCurvePoints: (t: number, controlPoints: LngLat[]) => any;
export declare function deepClone<T>(obj: T): T;
