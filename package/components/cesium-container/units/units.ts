import * as Cesium from 'cesium'
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
export function setId(num: number = 32) {
    let len = num;
    let chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
    let maxPos = chars.length;
    let str = "";
    for (let i = 0; i < len; i++) {
        str += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return str;
  }