import * as Cesium from "cesium";
import { xp } from './thirdPart/algorithm'
import { getCatesian3FromPX, setId, cartesianToLatlng, Mid } from './units'
import { Entity } from "../type";
export class StraightArrow {
    type: string;
    objId: string;
    positions: Cesium.Cartesian3[] = [];
    get centerPosition(): Cesium.Cartesian3 {
        const point1 = cartesianToLatlng(this.positions[1], this.viewer)
        const point2 = cartesianToLatlng(this.positions[2], this.viewer)
        const mid = Mid(point1, point2)
        return Cesium.Cartesian3.fromDegrees(mid[0], mid[1], 0)
    }
    get rotatePosition(): Cesium.Cartesian3 {
        const point1 = cartesianToLatlng(this.positions[1], this.viewer)
        const point2 = cartesianToLatlng(this.centerPosition, this.viewer)
        const mid = Mid(point1, point2)
        return Cesium.Cartesian3.fromDegrees(mid[0], mid[1], 0)
    }
    firstPoint: Entity | null = null;
    floatPoint: Entity | null = null;
    arrowEntity: Entity | null = null;
    centerPoint: Entity = null as unknown as Entity;
    rotatePoint: Entity = null as unknown as Entity;
    state: number = 0;
    selectPoint: Entity | null = null;
    clickStep: number = -1;
    modifyHandler: Cesium.ScreenSpaceEventHandler | null = null;

    viewer: Cesium.Viewer;
    handler: Cesium.ScreenSpaceEventHandler;
    fillMaterial = Cesium.Color.fromCssColorString('#0000FF').withAlpha(0.8);
    outlineMaterial = new Cesium.PolylineDashMaterialProperty({
        dashLength: 16,
        color: Cesium.Color.fromCssColorString('#f00').withAlpha(0.7)
    })
    constructor(viewer: Cesium.Viewer, positions?: [number, number][]) {
        this.type = "StraightArrow";
        this.viewer = viewer;
        this.objId = setId();
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        if (positions) {
            this.createByData(positions)
        }
    }
    disable() {
        this.positions = [];
        if (this.firstPoint) {
            this.viewer.entities.remove(this.firstPoint);
            this.firstPoint = null;
        }
        if (this.floatPoint) {
            this.viewer.entities.remove(this.floatPoint);
            this.floatPoint = null;
        }
        if (this.arrowEntity) {
            this.viewer.entities.remove(this.arrowEntity);
            this.arrowEntity = null;
        }
        this.state = -1;
        if (this.handler) {
            this.handler.destroy();
            this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        }
        if (this.selectPoint) {
            this.viewer.entities.remove(this.selectPoint);
            this.selectPoint = null;
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
    showArrowOnMap(positions: Cesium.Cartesian3[]) {
        const update = () => {
            if (positions.length < 2) {
                return null;
            }
            const p1 = positions[1];
            const p2 = positions[2];
            const firstPoint = cartesianToLatlng(p1, this.viewer);
            const endPoints = cartesianToLatlng(p2, this.viewer);
            const arrow = [];
            const res = xp.algorithm.fineArrow([firstPoint[0], firstPoint[1]], [endPoints[0], endPoints[1]]);
            const index = JSON.stringify(res).indexOf("null");
            if (index != -1) return [];
            for (var i = 0; i < res.length; i++) {
                const c3 = new Cesium.Cartesian3(res[i].x, res[i].y, res[i].z);
                arrow.push(c3);
            }
            return new Cesium.PolygonHierarchy(arrow);
        }
        return this.viewer.entities.add({
            polygon: new Cesium.PolygonGraphics({
                hierarchy: new Cesium.CallbackProperty(update, false),
                show: true,
                fill: true,
                material: this.fillMaterial
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
                this.firstPoint = this.creatPoint(cartesian);
                this.firstPoint.type = "firstPoint";
                this.floatPoint = this.creatPoint(cartesian);
                this.floatPoint!.type = "floatPoint";
                this.positions.push(cartesian);

            }
            if (this.positions.length == 3) {
                this.arrowEntity!.objId = this.objId;
                this.calcCenterPoint();
                this.calcRotatePoint();
                this.toggleEnablePoint(false);
                this.state = -1;
            }
            this.positions.push(cartesian.clone());
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler.setInputAction((evt: Cesium.ScreenSpaceEventHandler.MotionEvent) => { //移动时绘制面
            if (this.positions.length < 1) return;
            var cartesian;
            cartesian = getCatesian3FromPX(evt.endPosition, this.viewer);
            if (!cartesian) return;

            if (this.floatPoint && this.floatPoint.position)
                this.floatPoint.position = new Cesium.ConstantPositionProperty(cartesian);
            if (this.positions.length >= 2) {
                if (!Cesium.defined(this.arrowEntity)) {
                    this.positions.push(cartesian);
                    this.arrowEntity = this.showArrowOnMap(this.positions);

                } else {
                    this.positions.pop();
                    this.positions.push(cartesian);
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
    createByData(data: [number, number][]) { //通过传入的经纬度数组 构建箭头
        this.state = -1;
        this.positions = [];
        const arr = [];
        for (let i = 0; i < data.length; i++) {
            const cart3 = Cesium.Cartesian3.fromDegrees(data[i][0], data[i][1]);
            arr.push(cart3);
        }
        this.positions = arr;
        this.firstPoint = this.creatPoint(this.positions[1]);
        this.firstPoint.type = "firstPoint";
        this.floatPoint = this.creatPoint(this.positions[2]);
        this.floatPoint.type = "floatPoint";
        this.calcCenterPoint();
        this.calcRotatePoint();
        this.arrowEntity = this.showArrowOnMap(this.positions);
        this.toggleEnablePoint(false)
        this.arrowEntity.objId = this.objId;
    }
    startModify() { //修改箭头
        this.state = 2;
        this.toggleEnablePoint(true)
        this.clickStep = 0;
        if (!this.modifyHandler) this.modifyHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.modifyHandler.setInputAction((evt: Cesium.ScreenSpaceEventHandler.PositionedEvent) => { //单击开始绘制
            var pick = this.viewer.scene.pick(evt.position);
            if (Cesium.defined(pick) && pick.id) {
                if (pick.id.objId && pick.id.objId !== this.objId) {
                    this.modifyHandler!.destroy();
                    this.modifyHandler = null;
                    this.toggleEnablePoint(false)
                    this.state = -1;
                } else {
                    this.clickStep++;
                    if (!pick.id.objId)
                        this.selectPoint = pick.id;
                }

            } else { //激活移动点之后 单击面之外 移除这个事件
                this.modifyHandler?.destroy();
                this.modifyHandler = null;
                this.toggleEnablePoint(false)
                this.state = -1;
            }

            //选中点后 第二次点击 则重新定位该点
            if (this.clickStep == 2) {
                this.clickStep = 0;
                var cartesian;
                cartesian = getCatesian3FromPX(evt.position, this.viewer);
                if (!cartesian) return;
                if (this.selectPoint) {
                    this.selectPoint.position = new Cesium.ConstantPositionProperty(cartesian);
                    this.selectPoint = null;
                }
            };
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.modifyHandler.setInputAction((evt: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
            if (this.selectPoint) {
                let cartesian;
                cartesian = getCatesian3FromPX(evt.endPosition, this.viewer);
                if (!cartesian) return;
                this.selectPoint.position = new Cesium.ConstantPositionProperty(cartesian);
                if (this.selectPoint.type == "firstPoint") {
                    this.positions[1] = cartesian;
                }
                if (this.selectPoint.type == "floatPoint") {
                    this.positions[2] = cartesian;
                }
                this.calcCenterPoint();
                this.calcRotatePoint();
            } else {
                return;
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
    calcCenterPoint() {

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
    toggle() {
        if (this.arrowEntity)
            this.arrowEntity.show = !this.arrowEntity.show
    }
    toggleEnablePoint(enable: boolean) {
        this.firstPoint!.show = enable
        this.floatPoint!.show = enable
        this.centerPoint!.show = enable
        this.rotatePoint!.show = enable
    }
    clear() { //清除绘制箭头
        this.state = 0;
        if (this.firstPoint) this.viewer.entities.remove(this.firstPoint);
        if (this.floatPoint) this.viewer.entities.remove(this.floatPoint);
        if (this.arrowEntity) this.viewer.entities.remove(this.arrowEntity);
        if (this.centerPoint) this.viewer.entities.remove(this.centerPoint)
        this.state = -1;
    }
    getLnglats() {
        var arr = [];
        for (var i = 0; i < this.positions.length; i++) {
            var item = cartesianToLatlng(this.positions[i], this.viewer);
            arr.push(item);
        }
        return arr;
    }
    getPositions() { //获取直角箭头中的关键点
        return this.positions;
    }
}