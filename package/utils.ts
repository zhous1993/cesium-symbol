import * as Cesium from 'cesium'
import { LngLat } from './type';
import { FITTING_COUNT, ZERO_TOLERANCE } from './constants';
/***
 * 坐标转换 84转笛卡尔
 * @param {Object} {lng,lat,alt} 地理坐标
 * @return {Object} Cartesian3 三维位置坐标
 */
export function transformWGS84ToCartesian(position: { lng?: any; lon?: any; lat: number; alt?: any; }, alt?: any) {
    return position
        ? Cesium.Cartesian3.fromDegrees(
            position.lng || position.lon,
            position.lat,
            (position.alt = alt || position.alt),
            Cesium.Ellipsoid.WGS84
        )
        : Cesium.Cartesian3.ZERO;
}

/***
 * 坐标转换 笛卡尔转84
 * @param {Object} Cartesian3 三维位置坐标
 * @return {Object} {lng,lat,alt} 地理坐标
 */
export function transformCartesianToWGS84(cartesian: Cesium.Cartesian3) {
    let ellipsoid = Cesium.Ellipsoid.WGS84;
    let cartographic = ellipsoid.cartesianToCartographic(cartesian);
    return {
        lng: Cesium.Math.toDegrees(cartographic.longitude),
        lat: Cesium.Math.toDegrees(cartographic.latitude),
        alt: cartographic.height,
    };
}
/***
 * 生成uuid字符串
 * @param {Number} num 生成的位数默认值32位
 * @return {String} str
 */
export function setId(num: number = 32): string {
    let len = num;
    let chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
    let maxPos = chars.length;
    let str = "";
    for (let i = 0; i < len; i++) {
        str += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return str;
}


export function getCatesian3FromPX(px: Cesium.Cartesian2, viewer: Cesium.Viewer) {
    var cartesian;
    var ray = viewer.camera.getPickRay(px);

    cartesian = viewer.scene.globe.pick(ray!, viewer.scene);
    return cartesian;
}

export function cartesianToLatlng(cartesian: Cesium.Cartesian3): [number, number] {
    // const latlng = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
    const latlng = Cesium.Cartographic.fromCartesian(cartesian);
    const lat = Cesium.Math.toDegrees(latlng.latitude);
    const lng = Cesium.Math.toDegrees(latlng.longitude);
    return [lng, lat];
}

/**
 * 求取两个坐标的中间值
 * @param point1
 * @param point2
 * @returns {[*,*]}
 * @constructor
 */
export const Mid = (point1: [number, number], point2: [number, number]): [number, number] => {
    return [(point1[0] + point2[0]) / 2, (point1[1] + point2[1]) / 2]
}

/**
 * 启停用相机
 * @param viewer 
 * @param enable 
 * @returns 
 */
export const enableCamera = (viewer: Cesium.Viewer, enable: boolean) => {
    if (!viewer) return
    viewer.scene.screenSpaceCameraController.enableRotate = enable
}

/**
 * 计算两个坐标之间的距离
 * @param pnt1
 * @param pnt2
 * @returns {number}
 * @constructor
 */
export const MathDistance = (pnt1: LngLat, pnt2: LngLat): number => {
    return (Math.sqrt(Math.pow((pnt1[0] - pnt2[0]), 2) + Math.pow((pnt1[1] - pnt2[1]), 2)))
}

/**
 * 获取方位角（地平经度）
 * @param startPoint
 * @param endPoint
 * @returns {*}
 */
export const getAzimuth = (startPoint: LngLat, endPoint: LngLat): number => {
    let azimuth
    let angle = Math.asin(Math.abs(endPoint[1] - startPoint[1]) / (MathDistance(startPoint, endPoint)))
    if (endPoint[1] >= startPoint[1] && endPoint[0] >= startPoint[0]) {
        azimuth = angle + Math.PI
    } else if (endPoint[1] >= startPoint[1] && endPoint[0] < startPoint[0]) {
        azimuth = Math.PI * 2 - angle
    } else if (endPoint[1] < startPoint[1] && endPoint[0] < startPoint[0]) {
        azimuth = angle
    } else if (endPoint[1] < startPoint[1] && endPoint[0] >= startPoint[0]) {
        azimuth = Math.PI - angle
    }
    return azimuth as number
}

/**
 * 通过三个点获取方位角
 * @param pntA: LngLat
 * @param pntB:LngLat
 * @param pntC:LngLat
 * @returns {number}
 */
export const getAngleOfThreePoints = (pntA: LngLat, pntB: LngLat, pntC: LngLat): number => {
    const angle = getAzimuth(pntB, pntA) - getAzimuth(pntB, pntC)
    return ((angle < 0) ? (angle + Math.PI * 2) : angle)
}

/**
 * 判断是否是顺时针
 * @param pnt1
 * @param pnt2
 * @param pnt3
 * @returns {boolean}
 */
export const isClockWise = (pnt1: LngLat, pnt2: LngLat, pnt3: LngLat): boolean => {
    return ((pnt3[1] - pnt1[1]) * (pnt2[0] - pnt1[0]) > (pnt2[1] - pnt1[1]) * (pnt3[0] - pnt1[0]))
}

/**
 * 根据起止点和旋转方向求取第三个点
 * @param startPnt
 * @param endPnt
 * @param angle
 * @param distance
 * @param clockWise
 * @returns {[*,*]}
 */
export const getThirdPoint = (startPnt: LngLat, endPnt: LngLat, angle: number, distance: number, clockWise: boolean): LngLat => {
    let azimuth = getAzimuth(startPnt, endPnt)
    let alpha = clockWise ? (azimuth + angle) : (azimuth - angle)
    let dx = distance * Math.cos(alpha)
    let dy = distance * Math.sin(alpha)
    return ([endPnt[0] + dx, endPnt[1] + dy])
}

/**
 * 二维数组去重
 * @param points 
 * @returns 
 */
export const removeDuplicatePoints = (points: LngLat[]): LngLat[] => {
    const uniquePoints: LngLat[] = []
    const seen = new Set()
    points.forEach((subArray: LngLat) => {
        const serialized = JSON.stringify(subArray)
        if (!seen.has(serialized)) {
            uniquePoints.push(subArray)
            seen.add(serialized)
        }
    })
    return uniquePoints
}

/**
 * 计算中心点坐标
 * @param points 
 * @returns 
 */
export const Center = (points: LngLat[]): LngLat => {
    let xSum = 0
    let ySum = 0
    points.forEach(point => {
        xSum += point[0]
        ySum += point[1]
    })
    const midX = xSum / points.length
    const midY = ySum / points.length
    return [midX, midY]
}
/**
 * 计算点集合的总距离
 * @param points
 * @returns {number}
 */
export const wholeDistance = (points: LngLat[]): number => {
    let distance = 0
    if (points && Array.isArray(points) && points.length > 0) {
        points.forEach((item, index) => {
            if (index < points.length - 1) {
                distance += (MathDistance(item, points[index + 1]))
            }
        })
    }
    return distance
}
/**
 * 获取默认三点的内切圆
 * @param pnt1
 * @param pnt2
 * @param pnt3
 * @returns {[*,*]}
 */
export const getNormal = (pnt1: LngLat, pnt2: LngLat, pnt3: LngLat) => {
    let dX1 = pnt1[0] - pnt2[0]
    let dY1 = pnt1[1] - pnt2[1]
    let d1 = Math.sqrt(dX1 * dX1 + dY1 * dY1)
    dX1 /= d1
    dY1 /= d1
    let dX2 = pnt3[0] - pnt2[0]
    let dY2 = pnt3[1] - pnt2[1]
    let d2 = Math.sqrt(dX2 * dX2 + dY2 * dY2)
    dX2 /= d2
    dY2 /= d2
    let uX = dX1 + dX2
    let uY = dY1 + dY2
    return [uX, uY]
}
/**
 * 获取阶乘数据
 * @param n
 * @returns {number}
 */
export const getFactorial = (n: any) => {
    let result = 1
    switch (n) {
        case (n <= 1):
            result = 1
            break
        case (n === 2):
            result = 2
            break
        case (n === 3):
            result = 6
            break
        case (n === 24):
            result = 24
            break
        case (n === 5):
            result = 120
            break
        default:
            for (let i = 1; i <= n; i++) {
                result *= i
            }
            break
    }
    return result
}
/**
 * 获取二项分布
 * @param n
 * @param index
 * @returns {number}
 */
export const getBinomialFactor = (n: number, index: number) => {
    return (getFactorial(n) / (getFactorial(index) * getFactorial(n - index)))
}
/**
 * 贝塞尔曲线
 * @param points
 * @returns {*}
 */
export const getBezierPoints = (points: LngLat[]): LngLat[] => {
    if (points.length <= 2) {
        return points
    } else {
        let bezierPoints: LngLat[] = []
        let n = points.length - 1
        for (let t = 0; t <= 1; t += 0.01) {
            let [x, y] = [0, 0]
            for (let index = 0; index <= n; index++) {
                let factor = getBinomialFactor(n, index)
                let a = Math.pow(t, index)
                let b = Math.pow((1 - t), (n - index))
                x += factor * a * b * points[index][0]
                y += factor * a * b * points[index][1]
            }
            bezierPoints.push([x, y])
        }
        bezierPoints.push(points[n])
        return bezierPoints
    }
}
/**
 * 获取基础长度
 * @param points
 * @returns {number}
 */
export const getBaseLength = (points: LngLat[]): number => wholeDistance(points) ** 0.99;

/**
 * getBisectorNormals
 * @param t
 * @param pnt1
 * @param pnt2
 * @param pnt3
 * @returns {[*,*]}
 */
export const getBisectorNormals = (t: any, pnt1: LngLat, pnt2: LngLat, pnt3: LngLat) => {
    let normal = getNormal(pnt1, pnt2, pnt3)
    let [bisectorNormalRight, bisectorNormalLeft, dt, x, y]: any = [null, null, null, null, null]
    let dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1])
    let uX = normal[0] / dist
    let uY = normal[1] / dist
    let d1 = MathDistance(pnt1, pnt2)
    let d2 = MathDistance(pnt2, pnt3)
    if (dist > ZERO_TOLERANCE) {
        if (isClockWise(pnt1, pnt2, pnt3)) {
            dt = t * d1
            x = pnt2[0] - dt * uY
            y = pnt2[1] + dt * uX
            bisectorNormalRight = [x, y]
            dt = t * d2
            x = pnt2[0] + dt * uY
            y = pnt2[1] - dt * uX
            bisectorNormalLeft = [x, y]
        } else {
            dt = t * d1
            x = pnt2[0] + dt * uY
            y = pnt2[1] - dt * uX
            bisectorNormalRight = [x, y]
            dt = t * d2
            x = pnt2[0] - dt * uY
            y = pnt2[1] + dt * uX
            bisectorNormalLeft = [x, y]
        }
    } else {
        x = pnt2[0] + t * (pnt1[0] - pnt2[0])
        y = pnt2[1] + t * (pnt1[1] - pnt2[1])
        bisectorNormalRight = [x, y]
        x = pnt2[0] + t * (pnt3[0] - pnt2[0])
        y = pnt2[1] + t * (pnt3[1] - pnt2[1])
        bisectorNormalLeft = [x, y]
    }
    return [bisectorNormalRight, bisectorNormalLeft]
}
/**
 * 得到二次线性因子
 * @param k
 * @param t
 * @returns {number}
 */
export const getQuadricBSplineFactor = (k: number, t: number): number => {
    let res = 0;
    if (k === 0) {
        res = (t - 1) ** 2 / 2;
    } else if (k === 1) {
        res = (-2 * t ** 2 + 2 * t + 1) / 2;
    } else if (k === 2) {
        res = t ** 2 / 2;
    }
    return res;
};
/**
 * 插值线性点
 * @param points
 * @returns {LngLat[]}
 */
export const getQBSplinePoints = (points: LngLat[]): LngLat[] => {
    if (points.length <= 2) {
        return points;
    }
    const [n, bSplinePoints]: any = [2, []];
    const m = points.length - n - 1;
    bSplinePoints.push(points[0]);
    for (let i = 0; i <= m; i++) {
        for (let t = 0; t <= 1; t += 0.05) {
            let [x, y] = [0, 0];
            for (let k = 0; k <= n; k++) {
                // eslint-disable-next-line
                const factor = getQuadricBSplineFactor(k, t);
                x += factor * points[i + k][0];
                y += factor * points[i + k][1];
            }
            bSplinePoints.push([x, y]);
        }
    }
    bSplinePoints.push(points[points.length - 1]);
    return bSplinePoints;
};
/**
 * 获取左边控制点
 * @param controlPoints
 * @param t
 * @returns {[*,*]}
 */
export const getLeftMostControlPoint = (controlPoints: LngLat[], t: number): LngLat => {
    // eslint-disable-next-line
    let [pnt1, pnt2, pnt3, controlX, controlY]: any = [controlPoints[0], controlPoints[1], controlPoints[2], null, null];
    const pnts = getBisectorNormals(0, pnt1, pnt2, pnt3);
    const normalRight = pnts[0];
    const normal = getNormal(pnt1, pnt2, pnt3);
    const dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1]);
    if (dist > ZERO_TOLERANCE) {
        const mid = Mid(pnt1, pnt2);
        const pX = pnt1[0] - mid[0];
        const pY = pnt1[1] - mid[1];
        const d1 = MathDistance(pnt1, pnt2);
        const n = 2.0 / d1;
        const nX = -n * pY;
        const nY = n * pX;
        const a11 = nX * nX - nY * nY;
        const a12 = 2 * nX * nY;
        const a22 = nY * nY - nX * nX;
        const dX = normalRight[0] - mid[0];
        const dY = normalRight[1] - mid[1];
        controlX = mid[0] + a11 * dX + a12 * dY;
        controlY = mid[1] + a12 * dX + a22 * dY;
    } else {
        controlX = pnt1[0] + t * (pnt2[0] - pnt1[0]);
        controlY = pnt1[1] + t * (pnt2[1] - pnt1[1]);
    }
    return [controlX, controlY];
};

/**
 * 获取右边控制点
 * @param controlPoints
 * @param t
 * @returns {[*,*]}
 */
export const getRightMostControlPoint = (controlPoints: LngLat[], t: number): LngLat => {
    const count = controlPoints.length;
    const pnt1 = controlPoints[count - 3];
    const pnt2 = controlPoints[count - 2];
    const pnt3 = controlPoints[count - 1];
    const pnts = getBisectorNormals(0, pnt1, pnt2, pnt3);
    const normalLeft = pnts[1];
    const normal = getNormal(pnt1, pnt2, pnt3);
    const dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1]);
    let [controlX, controlY]: any = [null, null];
    if (dist > ZERO_TOLERANCE) {
        const mid = Mid(pnt2, pnt3);
        const pX = pnt3[0] - mid[0];
        const pY = pnt3[1] - mid[1];
        const d1 = MathDistance(pnt2, pnt3);
        const n = 2.0 / d1;
        const nX = -n * pY;
        const nY = n * pX;
        const a11 = nX * nX - nY * nY;
        const a12 = 2 * nX * nY;
        const a22 = nY * nY - nX * nX;
        const dX = normalLeft[0] - mid[0];
        const dY = normalLeft[1] - mid[1];
        controlX = mid[0] + a11 * dX + a12 * dY;
        controlY = mid[1] + a12 * dX + a22 * dY;
    } else {
        controlX = pnt3[0] + t * (pnt2[0] - pnt3[0]);
        controlY = pnt3[1] + t * (pnt2[1] - pnt3[1]);
    }
    return [controlX, controlY];
};

/**
 * 获取立方值
 * @param t
 * @param startPnt
 * @param cPnt1
 * @param cPnt2
 * @param endPnt
 * @returns {[*,*]}
 */
export const getCubicValue = (t: number, startPnt: LngLat, cPnt1: LngLat, cPnt2: LngLat, endPnt: LngLat) => {
    t = Math.max(Math.min(t, 1), 0);
    const [tp, t2] = [1 - t, t * t];
    const t3 = t2 * t;
    const tp2 = tp * tp;
    const tp3 = tp2 * tp;
    const x = tp3 * startPnt[0] + 3 * tp2 * t * cPnt1[0] + 3 * tp * t2 * cPnt2[0] + t3 * endPnt[0];
    const y = tp3 * startPnt[1] + 3 * tp2 * t * cPnt1[1] + 3 * tp * t2 * cPnt2[1] + t3 * endPnt[1];
    return [x, y];
};
/**
 * 插值曲线点
 * @param t
 * @param controlPoints
 * @returns {null}
 */
export const getCurvePoints = (t: number, controlPoints: LngLat[]) => {
    const leftControl = getLeftMostControlPoint(controlPoints, t);
    let [pnt1, pnt2, pnt3, normals, points]: any = [null, null, null, [leftControl], []];
    for (let i = 0; i < controlPoints.length - 2; i++) {
        [pnt1, pnt2, pnt3] = [controlPoints[i], controlPoints[i + 1], controlPoints[i + 2]];
        const normalPoints = getBisectorNormals(t, pnt1, pnt2, pnt3);
        normals = normals.concat(normalPoints);
    }
    const rightControl = getRightMostControlPoint(controlPoints, t);
    if (rightControl) {
        normals.push(rightControl);
    }
    for (let i = 0; i < controlPoints.length - 1; i++) {
        pnt1 = controlPoints[i];
        pnt2 = controlPoints[i + 1];
        points.push(pnt1);
        for (let j = 0; j < FITTING_COUNT; j++) {
            const pnt = getCubicValue(j / FITTING_COUNT, pnt1, normals[i * 2], normals[i * 2 + 1], pnt2);
            points.push(pnt);
        }
        points.push(pnt2);
    }
    return points;
};

export function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj))
}