import * as Cesium from 'cesium'
import { Entity, LngLat, PolygonConfig } from "../type";
import { cartesianToLatlng, Center, enableCamera, getAngleOfThreePoints, getCatesian3FromPX, getThirdPoint, isClockWise, MathDistance, Mid, removeDuplicatePoints, setId } from './units';
import { xp } from './thirdPart/algorithm'
import { polygonEditConfig } from '../polygon.config';

export class SwallowtailArrow {
    type: string;
    objId: string;
    positions: Cesium.Cartesian3[] = [];
    get centerPosition(): Cesium.Cartesian3 {
        const points = this.pointArr.map(point => {
            return cartesianToLatlng(this.positions[(point.wz as number) - 1], this.viewer)
        })
        const mid = Center(points)
        return Cesium.Cartesian3.fromDegrees(mid[0], mid[1], 0)
    }
    get rotatePosition(): Cesium.Cartesian3 {
        const point1 = cartesianToLatlng(this.positions[this.pointArr[0].wz as number], this.viewer)
        const point2 = cartesianToLatlng(this.centerPosition, this.viewer)
        const mid = Mid(point1, point2)
        return Cesium.Cartesian3.fromDegrees(mid[0], mid[1], 0)
    }
    firstPoint: Entity | null = null;
    floatPoint: Entity | null = null;
    mainEntity: Entity | null = null;
    outlineEntity: Entity | null = null;
    centerPoint: Entity = null as unknown as Entity;
    rotatePoint: Entity = null as unknown as Entity;
    rotateLine: Entity = null as unknown as Entity;
    state: number = 0;
    selectPoint: Entity | null = null;
    clickStep: number = -1;
    modifyHandler: Cesium.ScreenSpaceEventHandler | null = null;

    viewer: Cesium.Viewer;
    handler: Cesium.ScreenSpaceEventHandler;
    fillMaterial = Cesium.Color.fromCssColorString('#0000FF').withAlpha(0.8);
    config: PolygonConfig;
    outlineMaterial = new Cesium.PolylineDashMaterialProperty({
        dashLength: 16,
        color: Cesium.Color.fromCssColorString('#f00').withAlpha(0.7)
    })
    pointArr: Entity[] = [];
    constructor(viewer: Cesium.Viewer, config: PolygonConfig, positions?: LngLat[]) {
        this.type = "PincerArrow";
        this.viewer = viewer;
        this.config = config;
        this.objId = setId();
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);

        if (positions) {
            // this.createByData(positions)
        }
    }
    disable() {
        this.positions = [];
        if (this.mainEntity) {
            this.viewer.entities.remove(this.mainEntity);
            this.mainEntity = null;
        }
        this.state = -1;
        if (this.handler) {
            this.handler.destroy();
            this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        }
        if (this.floatPoint) {
            this.viewer.entities.remove(this.floatPoint);
            this.floatPoint = null;
        }
        if (this.selectPoint) {
            this.viewer.entities.remove(this.selectPoint);
            this.selectPoint = null;
        }
        for (var i = 0; i < this.pointArr.length; i++) {
            if (this.pointArr[i]) this.viewer.entities.remove(this.pointArr[i]);
        }
        if (this.modifyHandler) {
            this.modifyHandler.destroy();
            this.modifyHandler = null;
        }
        this.clickStep = 0;
    }
    disableHandler() {
        if (this.handler && !this.handler.isDestroyed()) {
            this.handler.destroy();
            this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        }
        if (this.modifyHandler && !this.modifyHandler.isDestroyed()) {
            this.modifyHandler.destroy();
            this.modifyHandler = null;
        }
    }
    clear() { //清除绘制箭头
        this.state = 0;
        for (var i = 0; i < this.pointArr.length; i++) {
            if (this.pointArr[i]) this.viewer.entities.remove(this.pointArr[i]);
        }
        if (this.floatPoint) this.viewer.entities.remove(this.floatPoint);
        if (this.mainEntity) this.viewer.entities.remove(this.mainEntity);
        if (this.outlineEntity) this.viewer.entities.remove(this.outlineEntity);
        if (this.rotateLine) this.viewer.entities.remove(this.rotateLine)
        if (this.centerPoint) this.viewer.entities.remove(this.rotateLine)
        if (this.rotatePoint) this.viewer.entities.remove(this.rotatePoint)
        this.state = -1;
    }
    creatPoint(cartesian: Cesium.Cartesian3, color = Cesium.Color.BLUE, size = 10, attr = 'editPoint'): Entity {
        const point: Entity = this.viewer.entities.add({
            position: cartesian,
            point: {
                color,
                pixelSize: size
            }
        });
        point.attr = attr;
        return point;
    }
    showOnMap(positions: Cesium.Cartesian3[]) {
        const update = () => {
            //计算面
            if (this.positions.length < 3) {
                return null;
            }
            var lnglatArr = [];
            for (var i = 0; i < this.positions.length; i++) {
                var lnglat = cartesianToLatlng(this.positions[i], this.viewer);
                lnglatArr.push(lnglat)
            }
            var res = xp.algorithm.tailedAttackArrow(lnglatArr);
            var index = JSON.stringify(res.polygonalPoint).indexOf("null");
            var returnData = [];
            if (index == -1) returnData = res.polygonalPoint;
            return returnData;
        }
        let outlineMaterial: any;
        if (this.config.borderStyle == 'dashed') {
            outlineMaterial = new Cesium.PolylineDashMaterialProperty({
                dashLength: 16,
                color: Cesium.Color.fromCssColorString(this.config.borderColor as string)
            })
        } else {
            outlineMaterial = Cesium.Color.fromCssColorString(this.config.borderColor as string)
        }
        this.outlineEntity = this.viewer.entities.add({
            polyline: {
                positions: new Cesium.CallbackProperty(() => {
                    const pos = update()
                    const data = removeDuplicatePoints(pos)
                    return data.concat(data[0])
                }, false),
                material: outlineMaterial,
                width: this.config.borderWidth
            }
        })
        return this.viewer.entities.add({
            polygon: new Cesium.PolygonGraphics({
                hierarchy: new Cesium.CallbackProperty(() => {
                    const data = update()
                    return new Cesium.PolygonHierarchy(data)
                }, false),
                show: true,
                fill: true,
                material: Cesium.Color.fromCssColorString(this.config.fillColor as string),

            })
        });
    }
    startDraw() {
        this.state = 1;
        this.handler.setInputAction((evt: Cesium.ScreenSpaceEventHandler.PositionedEvent) => { //单击开始绘制
            let cartesian;
            cartesian = getCatesian3FromPX(evt.position, this.viewer);
            if (!cartesian) return;

            if (this.positions.length == 0) {
                this.floatPoint = this.creatPoint(cartesian);
                this.floatPoint.wz = -1
            }

            this.positions.push(cartesian);
            const point = this.creatPoint(cartesian);
            if (this.positions.length > 2) {
                point.wz = this.positions.length - 1; //点对应的在positions中的位置  屏蔽mouseMove里往postions添加时 未创建点
            } else {
                point.wz = this.positions.length; //点对应的在positions中的位置 
            }
            this.pointArr.push(point);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        this.handler.setInputAction((evt: Cesium.ScreenSpaceEventHandler.MotionEvent) => { //移动时绘制面
            if (this.positions.length < 2) return;

            let cartesian;
            cartesian = getCatesian3FromPX(evt.endPosition, this.viewer);
            if (!cartesian) return;
            this.floatPoint!.position = new Cesium.ConstantPositionProperty(cartesian);
            if (this.positions.length >= 2) {
                if (!Cesium.defined(this.mainEntity)) {
                    this.positions.push(cartesian);
                    this.mainEntity = this.showOnMap(this.positions);
                    this.mainEntity.objId = this.objId;
                } else {
                    this.positions.pop();
                    this.positions.push(cartesian);
                }
            }

        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.handler.setInputAction((evt: Cesium.ScreenSpaceEventHandler.PositionedEvent) => { //单击开始绘制
            let cartesian;
            cartesian = getCatesian3FromPX(evt.position, this.viewer);
            if (!cartesian) return;



            const point = this.creatPoint(cartesian);
            point.wz = this.positions.length; //点对应的在positions中的位置 
            this.pointArr.push(point);
            this.calcCenterPoint();
            this.calcRotatePoint();
            this.toggleEnablePoint(false);
            if (this.floatPoint) { //移除动态点
                this.floatPoint.show = false;
                this.viewer.entities.remove(this.floatPoint);
                this.floatPoint = null;
            }
            this.handler.destroy();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

    }


    createByData(data: LngLat[]) { //根据传入的数据构建箭头
        this.positions = []; //控制点
        this.state = -1; //state用于区分当前的状态 0 为删除 1为添加 2为编辑 
        this.floatPoint = null;
        this.pointArr = []; //中间各点
        this.selectPoint = null;
        this.clickStep = 0; //用于控制点的移动结束
        this.modifyHandler = null;
        var arr = [];
        for (let i = 0; i < data.length; i++) {
            const cart3 = Cesium.Cartesian3.fromDegrees(data[i][0], data[i][1]);
            arr.push(cart3);
        }
        this.positions = arr;
        //构建控制点
        for (var i = 0; i < this.positions.length; i++) {
            var point = this.creatPoint(this.positions[i]);
            point.show = false;
            point.wz = i + 1;
            this.pointArr.push(point);
        }
        this.calcCenterPoint();
        this.calcRotatePoint();
        this.mainEntity = this.showOnMap(this.positions);
        this.mainEntity.objId = this.objId;
    }

    startModify() { //修改箭头
        this.state = 2;
        this.toggleEnablePoint(true)
        if (!this.modifyHandler) this.modifyHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.modifyHandler.setInputAction((evt: Cesium.ScreenSpaceEventHandler.PositionedEvent) => { //单击开始绘制
            const pick = this.viewer.scene.pick(evt.position);
            if (Cesium.defined(pick) && pick.id) {
                if (pick.id.objId && pick.id.objId !== this.objId) {
                    this.modifyHandler!.destroy();
                    this.modifyHandler = null;
                    this.toggleEnablePoint(false)
                    this.state = -1;
                }
            } else {
                this.toggleEnablePoint(false)
                this.state = -1;
                this.modifyHandler!.destroy(); //激活移动点之后 单击面之外 移除这个事件
                this.modifyHandler = null;
            }
            // if (this.clickStep == 2) {
            //     this.clickStep = 0;

            //     let cartesian;
            //     cartesian = getCatesian3FromPX(evt.position, this.viewer);
            //     if (!cartesian) return;
            //     if (this.selectPoint) {
            //         this.selectPoint.position = new Cesium.ConstantPositionProperty(cartesian);
            //         this.selectPoint = null;
            //     }

            // };
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.modifyHandler.setInputAction((evt: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
            const pick = this.viewer.scene.pick(evt.position);
            if (Cesium.defined(pick) && pick.id) {
                if (!pick.id.objId && pick.id.attr == "editPoint") {
                    this.clickStep = 2
                    this.selectPoint = pick.id
                    console.log(this.selectPoint)
                }
                if (!pick.id.objId && pick.id.type == "rotatePoint") {
                    this.clickStep = 2
                    this.selectPoint = pick.id
                    this.toggleRotateLine()
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN)
        this.modifyHandler.setInputAction((evt: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
            const pick = this.viewer.scene.pick(evt.position);
            if (this.clickStep == 2) {
                this.clickStep = 0;
                let cartesian;
                cartesian = getCatesian3FromPX(evt.position, this.viewer);
                if (!cartesian) return;
                if (this.selectPoint) {
                    if (this.selectPoint.attr == 'editPoint') {
                        this.selectPoint.position = new Cesium.ConstantPositionProperty(cartesian);
                    }
                    if (this.selectPoint.type == "rotatePoint") {
                        this.toggleRotateLine()
                    }
                    this.selectPoint = null;
                }
            };
            enableCamera(this.viewer, true)
        }, Cesium.ScreenSpaceEventType.LEFT_UP)
        this.modifyHandler.setInputAction((evt: Cesium.ScreenSpaceEventHandler.MotionEvent) => { //单击开始绘制

            let cartesian;
            cartesian = getCatesian3FromPX(evt.endPosition, this.viewer);
            if (!cartesian) return;
            if (this.selectPoint) {
                enableCamera(this.viewer, false)

                if (this.selectPoint.attr == 'editPoint') {
                    this.selectPoint.position = new Cesium.ConstantPositionProperty(cartesian);
                    this.positions[(this.selectPoint.wz as number) - 1] = cartesian;
                } else if (this.selectPoint.type == "rotatePoint") {
                    this.calcRotatePositions(cartesianToLatlng(cartesian, this.viewer))
                }
                this.calcCenterPoint();
                this.calcRotatePoint();
            } else {
                return;
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
    calcCenterPoint() {
        if (!this.centerPosition) return
        if (this.centerPoint) {

            this.centerPoint.position = new Cesium.ConstantPositionProperty(this.centerPosition)
        } else {
            this.centerPoint = this.viewer.entities.add({
                position: new Cesium.ConstantPositionProperty(this.centerPosition),
                point: {
                    color: Cesium.Color.RED,
                    pixelSize: 10
                }
            })
            this.centerPoint.type = 'centerPoint'
        }
    }
    calcRotatePoint() {
        if (this.rotatePoint) {
            this.rotatePoint.position = new Cesium.ConstantPositionProperty(this.rotatePosition)
        } else {
            this.rotatePoint = this.viewer.entities.add({
                position: new Cesium.ConstantPositionProperty(this.rotatePosition),
                point: {
                    color: Cesium.Color.YELLOW,
                    pixelSize: 10
                }
            })
            this.rotatePoint.type = 'rotatePoint'

        }
    }
    calcRotatePositions(pos: LngLat) {
        const centerPosition = cartesianToLatlng(this.centerPosition, this.viewer)
        const rotatePosition = cartesianToLatlng(this.rotatePosition, this.viewer)
        const clockWise = isClockWise(centerPosition, rotatePosition, pos)
        const angle = clockWise ? getAngleOfThreePoints(pos, centerPosition, rotatePosition) : getAngleOfThreePoints(rotatePosition, centerPosition, pos)
        this.positions.forEach((position: Cesium.Cartesian3, index: number) => {
            const startPnt = cartesianToLatlng(position, this.viewer)
            const distance = MathDistance(startPnt, centerPosition)
            const p = getThirdPoint(startPnt, centerPosition, angle, distance, clockWise)
            this.positions[index] = Cesium.Cartesian3.fromDegrees(...p, 0)
        })
        this.pointArr.forEach((point: Entity, index: number) => {
            point.position = new Cesium.ConstantPositionProperty(this.positions[point.wz as number - 1])
        })
    }
    updateProps({ config, positions }: { config: PolygonConfig, positions: Cesium.Cartesian3[] }) {
        if (config) {
            const { borderColor, borderStyle, borderWidth, fillColor, remark } = config
            this.config = { borderColor: borderColor || polygonEditConfig.borderColor, borderStyle: borderStyle || polygonEditConfig.borderStyle, borderWidth: borderWidth || polygonEditConfig.borderWidth, fillColor: fillColor || polygonEditConfig.fillColor, remark: remark || polygonEditConfig.remark }
            if (this.outlineEntity) {
                borderStyle && borderStyle == 'dashed' ?
                    this.outlineEntity.polyline!.material = new Cesium.PolylineDashMaterialProperty({
                        dashLength: 16,
                        color: Cesium.Color.fromCssColorString(borderColor || 'blue'),
                    }) :
                    this.outlineEntity.polyline!.material = new Cesium.ColorMaterialProperty(
                        Cesium.Color.fromCssColorString(borderColor || 'blue')
                    );
                this.outlineEntity.polyline!.width = new Cesium.ConstantProperty(borderWidth || 1)
            }
            if (fillColor && this.mainEntity) {
                this.mainEntity!.polygon!.material = new Cesium.ColorMaterialProperty(Cesium.Color.fromCssColorString(fillColor)
                )
            }
        }
        if (positions) {
            this.positions = positions
            this.pointArr.forEach((point: Entity, index: number) => {
                point.position = new Cesium.ConstantPositionProperty(this.positions[point.wz as number - 1])
            })
            this.calcCenterPoint()
            this.calcRotatePoint()
        }
    }
    toggleRotateLine() {
        if (!this.rotateLine) {
            this.rotateLine = this.viewer.entities.add({
                polyline: {
                    positions: new Cesium.CallbackProperty(() => {
                        return [this.centerPosition, this.rotatePosition]
                    }, false),
                    width: 2,
                    material: new Cesium.PolylineDashMaterialProperty({
                        color: Cesium.Color.RED
                    })
                }
            })
        } else {
            this.rotateLine.show = !this.rotateLine.show
        }
    }

    toggle() {
        if (this.mainEntity)
            this.mainEntity.show = !this.mainEntity.show
    }
    toggleEnablePoint(enable: boolean) {
        this.centerPoint!.show = enable
        this.rotatePoint!.show = enable
        for (var i = 0; i < this.pointArr.length; i++) {
            this.pointArr[i].show = enable;
        }
    }
    getPositions() { //获取直角箭头中的关键点
        return this.positions;
    }
}