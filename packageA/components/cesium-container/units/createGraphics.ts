/**
 * 画图
 * @author: zhous
 * @date: 2024-08-28
 *
 */

import * as Cesium from "cesium";
import { Graphics, Point } from "../type";
import { IconType } from "ant-design-vue/es/notification";

export class CreateGraphics implements Graphics {
    /**
     * 1、标记点集合 points[] 
     * 2、中心点 centerPoint{lat,lon}
     * 3、旋转点 rotatePoint{lan,lat}
     * 方法
     * 4、开始画图 draw()
     * 5、结束画图 end()
     * 6、计算中心点坐标 calcCenterPoint()
     * 7、计算旋转点坐标 calcRotatePoint()
     * 8、计算旋转角度 calcRotateAngle()
     * 9、计算旋转后的点坐标 calcRotatePoint()
     * 10、鼠标移动 calcMouseMove()
     * 
     * 鼠标点击图标列表 new 对象，
     * 
     * 鼠标点击地图 添加一个点
     * 
     * 鼠标移动划线
     * 
     * 鼠标右击 结束画图
     * 
     * 更新中心点、旋转点坐标
     * 
     * 11、鼠标拖动旋转
     * 
     * 
     * 
     * 鼠标单击图层 显示所有点
     * 
     * 鼠标点击其他区域 隐藏所有点
     * 
     */
    viewer: Cesium.Viewer;
    handler: Cesium.ScreenSpaceEventHandler | null = null;
    polygonEntity: any = null;
    vertexEntities: any = [];
    lineEntity: any = null;
    centerEntity: any = null;
    rotateEntity: any = null;
    points: any[] = [];
    centerPoint: Cesium.Cartesian3 = null as unknown as Cesium.Cartesian3;
    rotatePoint: Cesium.Cartesian3 = null as unknown as Cesium.Cartesian3;
    isRotateDrag: boolean = false;
    flag: boolean = false;
    lastMousePosition: any;
    dottedLineEntity: any = null;
    constructor(viewer: Cesium.Viewer, type: IconType) {
        this.viewer = viewer
        this.init()
    }
    init() {
        const canvas = this.viewer.scene.canvas
        canvas.style.cursor = 'crosshair'
        this.polygonEntity = this.viewer.entities.add({
            name: 'Polygon',
            polygon: {
                hierarchy: new Cesium.CallbackProperty(() => {
                    return new Cesium.PolygonHierarchy(this.points.length < 3 ? [] : this.points);
                }, false),
                material: Cesium.Color.WHITE.withAlpha(0.3),
                outline: true,
                outlineColor: Cesium.Color.WHITE,
                perPositionHeight: true,
                zIndex: 0
            }
        })
        this.handler = new Cesium.ScreenSpaceEventHandler(canvas)
        this.handler.setInputAction((click: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
            this.points.pop()
            this.end()
            this.createRatateAndMoveHandler()
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
        this.handler.setInputAction((click: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
            const pickPosition = this.viewer.scene.pickPosition(click.position)
            if (Cesium.defined(pickPosition)) {
                if (this.points.length === 0) this.points = [pickPosition]
                this.points = [...this.points, pickPosition]
                const pointEntity = this.viewer.entities.add({
                    name: 'Vertex',
                    position: pickPosition,
                    point: {
                        color: Cesium.Color.BLUE,
                        pixelSize: 5
                    }
                })
                this.vertexEntities.push(pointEntity)
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
        this.handler.setInputAction((movement: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
            if (this.points.length > 0) {
                this.calcMouseMove(movement)
            }

        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)


    }
    draw() {
        this.handler?.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    }
    end() {
        const canvas = this.viewer.canvas
        canvas.style.cursor = 'default'
        this.handler?.destroy()
        this.calcCenterPoint()
        this.calcRotatePoint()
        this.flag = false
    }
    calcCenterPoint() {
        const boundingSphere = Cesium.BoundingSphere.fromPoints(this.points)
        const center = boundingSphere.center
        this.centerPoint = Cesium.Ellipsoid.WGS84.scaleToGeocentricSurface(center)
        this.centerEntity = this.viewer.entities.add({
            name: 'Vertex',
            position: this.centerPoint,
            point: {
                color: Cesium.Color.RED,
                pixelSize: 5
            }
        })
    }
    calcRotatePoint() {
        this.rotatePoint = Cesium.Cartesian3.midpoint(this.centerPoint, this.points[0], new Cesium.Cartesian3())
        this.rotateEntity = this.viewer.entities.add({
            name: 'rotate',
            position: this.rotatePoint,
            point: {
                color: Cesium.Color.YELLOW,
                pixelSize: 20
            },
        })
    }
    calcRotateAngle(movement: Cesium.ScreenSpaceEventHandler.MotionEvent) {
        console.log("====1:", this.lastMousePosition)
        const currentMousePosition = movement.endPosition
        console.log("====2:", currentMousePosition)
        // 获取屏幕位置对应的地理位置
        var previousCartesian = this.viewer.camera.pickEllipsoid(this.lastMousePosition, this.viewer.scene.globe.ellipsoid);
        var currentCartesian = this.viewer.camera.pickEllipsoid(currentMousePosition, this.viewer.scene.globe.ellipsoid);

        if (Cesium.defined(previousCartesian) && Cesium.defined(currentCartesian)) {
            var previousVector = Cesium.Cartesian3.subtract(previousCartesian, this.centerPoint, new Cesium.Cartesian3());
            var currentVector = Cesium.Cartesian3.subtract(currentCartesian, this.centerPoint, new Cesium.Cartesian3());
            // 计算旋转角度
            var angle = Math.atan2(currentMousePosition.y - this.centerPoint.y, currentCartesian.x - this.centerPoint.x)

            console.log("旋转角度", angle)


            var rotationMatrix = Cesium.Matrix3.fromRotationZ(angle);
            const positions = this.points
            // 旋转每个顶点
            for (var i = 0; i < positions.length; i++) {
                // var relativePosition = Cesium.Cartesian3.subtract(positions[i], this.centerPoint, new Cesium.Cartesian3());
                // var rotatedPosition = Cesium.Matrix3.multiplyByVector(rotationMatrix, relativePosition, new Cesium.Cartesian3());
                var distance = Cesium.Cartesian2.distance(this.rotatePoint, this.centerPoint) / 100000
                console.log('旋转半径', distance)

                const y = Math.sign(angle) * distance + this.centerPoint.y
                const x = Math.cos(angle) * distance + this.centerPoint.x
                console.log(x, y)
                const rotatedPosition = new Cesium.Cartesian2(x, y)
                positions[i] = Cesium.Cartesian2.add(rotatedPosition, this.centerPoint, new Cesium.Cartesian3());
            }

            // 更新多边形位置
            //    this.polygonEntity.polygon.hierarchy = new Cesium.PolygonHierarchy(positions);
            this.points = positions
            // 更新旋转点位置
            //    midpoint = getMidpoint(center, positions[0]);
            this.rotatePoint = Cesium.Cartesian3.midpoint(this.centerPoint, this.points[0], new Cesium.Cartesian3())
            this.rotateEntity.position = this.rotatePoint
            // console.log(rotateEntity)

            // this.lastMousePosition = currentMousePosition;


        }
    }
    calcRotatePosition(angle: any, currentMousePosition: any) {
        const rotateMatrix = Cesium.Matrix3.fromRotationZ(angle)
        let newRotatePositon = Cesium.Matrix3.multiplyByVector(rotateMatrix, Cesium.Cartesian3.subtract(this.rotateEntity.position.getValue(Cesium.JulianDate.now()), this.centerPoint, new Cesium.Cartesian3()), new Cesium.Cartesian3())
        newRotatePositon = Cesium.Cartesian3.add(newRotatePositon, this.centerPoint, new Cesium.Cartesian3())
        this.rotatePoint = currentMousePosition
        this.rotateEntity.position = new Cesium.ConstantPositionProperty(newRotatePositon)
    }
    calcMouseMove(movement: Cesium.ScreenSpaceEventHandler.MotionEvent) {
        const pickPosition = this.viewer.scene.pickPosition(movement.endPosition)
        if (Cesium.defined(pickPosition)) {
            this.points.pop()
            this.points.push(pickPosition)
        }
        if (this.points.length == 2 && !this.lineEntity) {
            this.lineEntity = this.viewer.entities.add({
                polyline: {
                    positions: new Cesium.CallbackProperty(() => {
                        return this.points
                    }, false),
                    material: Cesium.Color.WHITE.withAlpha(0.3),
                }
            })
        }
        if (this.points.length > 2) {
            this.viewer.entities.remove(this.lineEntity)
        }
    }

    removeEntity() {
        if (this.points.length < 3) {
            this.viewer.entities.remove(this.polygonEntity)
            this.vertexEntities.forEach((entity: any) => {
                this.viewer.entities.remove(entity)
            });
        }
    }

    createRatateAndMoveHandler() {
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        this.handler.setInputAction((movement: any) => {
            const pickedObject = this.viewer.scene.pick(movement.position)
            console.log(pickedObject.id == this.rotateEntity, pickedObject.id.id, this.rotateEntity.id)
            if (Cesium.defined(pickedObject) && pickedObject.id.id === this.rotateEntity.id) {
                this.isRotateDrag = true
                this.lastMousePosition = movement.position
                this.viewer.scene.screenSpaceCameraController.enableRotate = false
                this.dottedLineEntity = this.viewer.entities.add({
                    id: 'dottedLine',
                    polyline: {
                        positions: new Cesium.CallbackProperty(() => {
                            return [this.centerPoint, this.rotatePoint]
                        }, false),
                        width: 2,
                        material: new Cesium.PolylineDashMaterialProperty({
                            color: Cesium.Color.RED
                        })
                    }

                })
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN)
        this.handler.setInputAction((movement: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
            this.isRotateDrag = false
            this.viewer.scene.screenSpaceCameraController.enableRotate = true

            this.dottedLineEntity && this.viewer.entities.remove(this.dottedLineEntity)
        }, Cesium.ScreenSpaceEventType.LEFT_UP)
        this.handler.setInputAction((movement: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
            if (this.isRotateDrag) {
                this.calcRotateAngle(movement)
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    }
}