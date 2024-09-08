import * as CesiumTypes from "cesium";
import { Category, Entity, EventType, GeometryStyle, PolygonStyle, PolylineStyle, State } from "./type";
import EventDispatcher from "./events";
import { deepClone, enableCamera, getAngleOfThreePoints, getThirdPoint, isClockWise, MathDistance } from "./utils";

export default class Basic {
    cesium: typeof CesiumTypes
    state: State = 'drawing'
    category!: Category
    viewer: CesiumTypes.Viewer
    handler: CesiumTypes.ScreenSpaceEventHandler | null = null;
    dragEventHandler: CesiumTypes.ScreenSpaceEventHandler | null = null;
    mainEntity: CesiumTypes.Entity | null = null
    lineEntity: CesiumTypes.Entity | null = null

    outlineEntity: CesiumTypes.Entity | null = null
    tempLineEntity: CesiumTypes.Entity | null = null
    centerPointEntity: CesiumTypes.Entity | null = null
    rotatePointEntity: CesiumTypes.Entity | null = null
    rotateLineEntity: CesiumTypes.Entity | null = null;
    rotateHandler: CesiumTypes.ScreenSpaceEventHandler | null = null;
    positions: CesiumTypes.Cartesian3[] = []
    controlPoints: CesiumTypes.Entity[] = []
    points: CesiumTypes.Cartesian3[] = []
    controlPointsEventHandler: CesiumTypes.ScreenSpaceEventHandler | null = null;
    entityId: string = ''
    style: GeometryStyle | undefined
    styleCache: GeometryStyle | undefined
    minPointsForShape: number = 0
    eventDispatcher: EventDispatcher;
    freehand!: boolean;
    get centerPosition(): CesiumTypes.Cartesian3 {
        const boundingSphere = this.cesium.BoundingSphere.fromPoints(this.points)
        const center = boundingSphere.center
        return center
    }
    get rotatePosition(): CesiumTypes.Cartesian3 {
        return this.cesium.Cartesian3.midpoint(this.centerPosition, this.getPoints()[0], new this.cesium.Cartesian3())
    }
    constructor(cesium: typeof CesiumTypes, viewer: CesiumTypes.Viewer, style?: GeometryStyle) {
        this.cesium = cesium
        this.viewer = viewer
        this.category = this.getCategory()
        this.mergeStyle(style);
        this.cartesianToLnglat = this.cartesianToLnglat.bind(this);
        this.pixelToCartesian = this.pixelToCartesian.bind(this);
        this.eventDispatcher = new EventDispatcher();
        viewer.trackedEntity = undefined;
        this.onClick()
    }
    setState(state: State) {
        this.state = state;
    }

    getState(): State {
        return this.state;
    }

    setGeometryPoints(geometryPoints: CesiumTypes.Cartesian3[]) {
        this.positions = geometryPoints;
    }
    mergeStyle(style: GeometryStyle | undefined) {
        if (this.category === 'polygon') {
            this.style = Object.assign(
                {
                    material: this.cesium.Color.fromCssColorString('rgba(109,207,201,0.8)'),
                    outlineMaterial: this.cesium.Color.fromCssColorString('#0000ff'),
                    outlineWidth: 2,
                },
                style,
            );
        } else if (this.category === 'polyline') {
            this.style = Object.assign(
                {
                    material: this.cesium.Color.fromCssColorString('#0000ff'),
                    lineWidth: 2,
                },
                style,
            );
        } else if (this.category === 'point') {
            this.style = Object.assign(
                {
                    material: new this.cesium.Color(),
                    size: 1,
                },
                style
            );
        }
        this.styleCache = deepClone(this.style)
    }
    updateStyle(style: GeometryStyle) {
        this.mergeStyle(style)
        if (this.category === 'polygon') {
            this.mainEntity ? this.mainEntity!.polygon!.material = this.style!.material : null
            this.lineEntity ? this.lineEntity!.polyline!.material = this.style!.material : null
            //@ts-ignore
            this.outlineEntity ? this.outlineEntity!.polygon!.material = this.style!.outlineMaterial : null
            //@ts-ignore
            this.outlineEntity ? this.outlineEntity!.polygon!.outlineWidth = this.style!.outlineWidth : null
        }
        if (this.category === 'polyline') {
            this.lineEntity ? this.lineEntity!.polyline!.material = this.style!.material : null
            //@ts-ignore

            this.lineEntity ? this.lineEntity!.polyline!.width = this.style!.lineWidth : null
        }
        if (this.category === 'point') {
            //@ts-ignore
            this.lineEntity ? this.lineEntity!.billboard!.scale = this.style!.size : null
        }
    }
    onClick() {
        this.handler = new this.cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        this.handler.setInputAction((evt: CesiumTypes.ScreenSpaceEventHandler.PositionedEvent) => {
            const pickedObject = this.viewer.scene.pick(evt.position);
            const hitEntities = this.cesium.defined(pickedObject) && pickedObject.id instanceof this.cesium.Entity;
            const activityEntity = this.mainEntity
            if (this.state === 'drawing') {
                const cartesian = this.pixelToCartesian(evt.position);
                const points = this.getPoints();
                if (!cartesian) {
                    return;
                }

                if (!this.freehand && points.length > 0 && !this.checkDistance(cartesian, points[points.length - 1])) {
                    return;
                }
                this.addPoint(cartesian);

                if (this.getPoints().length === 1) {
                    this.eventDispatcher.dispatchEvent('drawStart');
                }
                this.eventDispatcher.dispatchEvent('drawUpdate', cartesian);
            } else if (this.state === 'edit') {
                if (!hitEntities || activityEntity!.id !== pickedObject.id.id) {
                    this.setState('static')
                    this.removeControlPoints();
                    this.disableDrag();
                    this.eventDispatcher.dispatchEvent('editEnd', this.getPoints());
                }
            } else if (this.state === 'static') {
                if (hitEntities && activityEntity!.id === pickedObject.id.id) {
                    if (this.cesium.defined(this.mainEntity)) {
                        this.setState('edit')
                        this.addControlPoints();
                        this.draggable()
                        this.eventDispatcher.dispatchEvent('editStart');
                    }
                }

            }
        }, this.cesium.ScreenSpaceEventType.LEFT_CLICK)
    }
    onMouseMove() {
        this.handler?.setInputAction((evt: any) => {
            const points = this.getPoints();
            const cartesian = this.pixelToCartesian(evt.endPosition);
            if (!cartesian) {
                return;
            }
            if (this.checkDistance(cartesian, points[points.length - 1])) {
                this.updateMovingPoint(cartesian, points.length);
            }
        }, this.cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    onDoubleClick() {
        this.handler?.setInputAction(() => {
            if (this.state === 'drawing') {
                this.finishDrawing();
            }
        }, this.cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    }
    finishDrawing() {
        this.category === 'polygon' && this.lineEntity && this.viewer.entities.remove(this.lineEntity);
        this.removeMoveListener();
        this.setState('edit');
        this.addControlPoints();
        this.draggable();
        const entity = this.mainEntity!
        this.entityId = entity.id;
        this.eventDispatcher.dispatchEvent('drawEnd', this.getPoints());
    }
    addControlPoints() {
        const points = this.getPoints();
        if (this.category !== 'point') {
            this.addCenterPoint()
            this.addRotatePoint()
            this.controlPoints = points.map((position) => {
                return this.viewer.entities.add({
                    position,
                    point: {
                        pixelSize: 10,
                        heightReference: this.cesium.HeightReference.CLAMP_TO_GROUND,
                        color: this.cesium.Color.BLUE,
                    },
                });
            });
        }
        let isDragging = false;
        let draggedIcon: Entity = null as unknown as Entity;
        let dragStartPosition: CesiumTypes.Cartesian3;

        this.controlPointsEventHandler = new this.cesium.ScreenSpaceEventHandler(this.viewer.canvas);

        this.controlPointsEventHandler.setInputAction((clickEvent: any) => {
            const pickedObject = this.viewer.scene.pick(clickEvent.position);
            if (this.cesium.defined(pickedObject)) {
                for (let i = 0; i < this.controlPoints.length; i++) {
                    if (pickedObject.id.id === this.controlPoints[i].id) {
                        isDragging = true;
                        draggedIcon = this.controlPoints[i];
                        dragStartPosition = draggedIcon.position?.getValue(this.cesium.JulianDate.now())!;
                        draggedIcon.index = i;
                        break;
                    }
                }
                enableCamera(this.viewer, false)
            }
        }, this.cesium.ScreenSpaceEventType.LEFT_DOWN);

        this.controlPointsEventHandler.setInputAction((moveEvent: any) => {
            if (isDragging && draggedIcon) {
                const cartesian = this.viewer.camera.pickEllipsoid(moveEvent.endPosition, this.viewer.scene.globe.ellipsoid);
                if (cartesian) {
                    draggedIcon.position.setValue(cartesian);
                    this.updateDraggingPoint(cartesian, draggedIcon.index);
                }
            }
        }, this.cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this.controlPointsEventHandler.setInputAction(() => {
            if (draggedIcon && !this.cesium.Cartesian3.equals(dragStartPosition, draggedIcon.position._value)) {
                this.addCenterPoint()
                this.addRotatePoint()
                this.eventDispatcher.dispatchEvent('drawUpdate', draggedIcon.position._value);
            }
            isDragging = false;
            draggedIcon = null;
            enableCamera(this.viewer, true)
        }, this.cesium.ScreenSpaceEventType.LEFT_UP);
    }
    addCenterPoint() {
        if (this.centerPointEntity) {
            this.centerPointEntity.position = new this.cesium.ConstantPositionProperty(this.centerPosition)
        } else {
            this.centerPointEntity = this.viewer.entities.add({
                position: this.centerPosition,
                point: {
                    pixelSize: 10,
                    heightReference: this.cesium.HeightReference.CLAMP_TO_GROUND,
                    color: this.cesium.Color.RED,
                },
            });
        }

    }
    addRotatePoint() {
        if (this.rotatePointEntity) {
            this.rotatePointEntity.position = new this.cesium.ConstantPositionProperty(this.rotatePosition)
        } else {
            this.rotatePointEntity = this.viewer.entities.add({
                position: this.rotatePosition,
                point: {
                    pixelSize: 10,
                    heightReference: this.cesium.HeightReference.CLAMP_TO_GROUND,
                    color: this.cesium.Color.YELLOW,
                },
            });
            this.rotateHandler = new this.cesium.ScreenSpaceEventHandler(this.viewer.canvas)
            let isDragging = false
            this.rotateHandler.setInputAction((clickEvent: any) => {
                const pickedObject = this.viewer.scene.pick(clickEvent.position);
                if (this.cesium.defined(pickedObject)) {
                    if (pickedObject.id.id === this.rotatePointEntity!.id) {
                        isDragging = true;
                        this.addRotateLine()
                        enableCamera(this.viewer, false)
                    }
                }
            }, this.cesium.ScreenSpaceEventType.LEFT_DOWN);

            this.rotateHandler.setInputAction((moveEvent: any) => {
                if (isDragging && this.rotatePointEntity) {
                    const cartesian = this.viewer.camera.pickEllipsoid(moveEvent.endPosition, this.viewer.scene.globe.ellipsoid);
                    if (cartesian) {
                        const pos = this.cartesianToLnglat(cartesian)
                        const centerPosition = this.cartesianToLnglat(this.centerPosition)
                        const rotatePosition = this.cartesianToLnglat(this.rotatePosition)
                        const clockWise = isClockWise(centerPosition, rotatePosition, pos)
                        const angle = clockWise ? getAngleOfThreePoints(pos, centerPosition, rotatePosition) : getAngleOfThreePoints(rotatePosition, centerPosition, pos)

                        this.controlPoints.forEach((point: CesiumTypes.Entity, index: number) => {
                            const position = point.position?.getValue(this.cesium.JulianDate.now())!
                            const startPnt = this.cartesianToLnglat(position)
                            const distance = MathDistance(startPnt, centerPosition)
                            const p = getThirdPoint(startPnt, centerPosition, angle, distance, clockWise)
                            const h = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(position).height;
                            const c = this.cesium.Cartesian3.fromDegrees(...p, h)
                            point.position = new this.cesium.ConstantPositionProperty(c)
                            this.updateDraggingPoint(c, index)
                        })
                        this.addRotatePoint()
                    }
                }
            }, this.cesium.ScreenSpaceEventType.MOUSE_MOVE);

            this.rotateHandler.setInputAction(() => {
                if (isDragging) {
                    this.addCenterPoint()
                    this.addRotatePoint()

                }
                this.viewer.entities.remove(this.rotateLineEntity!)
                this.rotateLineEntity = null
                isDragging = false;
                console.log('leftUp')
                enableCamera(this.viewer, true)
                this.eventDispatcher.dispatchEvent('drawUpdate');
            }, this.cesium.ScreenSpaceEventType.LEFT_UP);

        }

    }
    addRotateLine() {
        const positions = new this.cesium.CallbackProperty(() => [this.centerPosition, this.rotatePosition], false)
        if (!this.rotateLineEntity) {
            this.rotateLineEntity = this.viewer.entities.add({
                polyline: {
                    positions: positions,
                    clampToGround: true,
                    width: 2,
                    material: new this.cesium.PolylineDashMaterialProperty({
                        color: this.cesium.Color.YELLOW
                    })
                },
            });
        }

    }
    draggable() {
        let dragging = false;
        let startPosition: CesiumTypes.Cartesian3 | undefined;
        this.dragEventHandler = new this.cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        this.dragEventHandler.setInputAction((event: any) => {
            const pickRay = this.viewer.scene.camera.getPickRay(event.position);
            if (pickRay) {
                const cartesian = this.viewer.scene.globe.pick(pickRay, this.viewer.scene);
                const pickedObject = this.viewer.scene.pick(event.position);
                if (this.cesium.defined(pickedObject) && pickedObject.id instanceof this.cesium.Entity) {
                    const clickedEntity = pickedObject.id;
                    if (this.isCurrentEntity(clickedEntity.id)) {
                        dragging = true;
                        startPosition = cartesian;
                        this.viewer.scene.screenSpaceCameraController.enableRotate = false;
                    }
                }
            }
        }, this.cesium.ScreenSpaceEventType.LEFT_DOWN);

        this.dragEventHandler.setInputAction((event: any) => {
            if (dragging && startPosition) {
                const newPosition = this.pixelToCartesian(event.endPosition);
                if (newPosition) {
                    const translation = this.cesium.Cartesian3.subtract(newPosition, startPosition, new this.cesium.Cartesian3());
                    const newPoints = this.positions.map((p) => {
                        return this.cesium.Cartesian3.add(p, translation, new this.cesium.Cartesian3());
                    });

                    this.points = this.points.map((p) => {
                        return this.cesium.Cartesian3.add(p, translation, new this.cesium.Cartesian3());
                    });

                    this.controlPoints.map((p: CesiumTypes.Entity) => {
                        const position = p.position?.getValue(this.cesium.JulianDate.now());
                        const newPosition = this.cesium.Cartesian3.add(position!, translation, new this.cesium.Cartesian3());
                        p.position = new this.cesium.ConstantPositionProperty(newPosition);
                    });

                    this.setGeometryPoints(newPoints);
                    if (this.category !== 'point') {
                        this.addCenterPoint()
                        this.addRotatePoint()
                    } else {
                        this.updatePoint()
                    }
                    startPosition = newPosition;
                }
            } else {
                const pickRay = this.viewer.scene.camera.getPickRay(event.endPosition);
                if (pickRay) {
                    const pickedObject = this.viewer.scene.pick(event.endPosition);
                    if (this.cesium.defined(pickedObject) && pickedObject.id instanceof this.cesium.Entity) {
                        const clickedEntity = pickedObject.id;
                        if (this.isCurrentEntity(clickedEntity.id)) {
                            this.viewer.scene.canvas.style.cursor = 'move';
                        } else {
                            this.viewer.scene.canvas.style.cursor = 'default';
                        }
                    } else {
                        this.viewer.scene.canvas.style.cursor = 'default';
                    }
                }
            }
        }, this.cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this.dragEventHandler.setInputAction(() => {
            dragging = false;
            startPosition = undefined;
            this.viewer.scene.screenSpaceCameraController.enableRotate = true;
        }, this.cesium.ScreenSpaceEventType.LEFT_UP);
    }
    disableDrag() {
        this.dragEventHandler?.removeInputAction(this.cesium.ScreenSpaceEventType.LEFT_DOWN);
        this.dragEventHandler?.removeInputAction(this.cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.dragEventHandler?.removeInputAction(this.cesium.ScreenSpaceEventType.LEFT_UP);
    }
    getCategory(): Category {
        return 'polygon'
    }
    cartesianToLnglat(cartesian: CesiumTypes.Cartesian3): [number, number] {
        const lnglat = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
        const lat = this.cesium.Math.toDegrees(lnglat.latitude);
        const lng = this.cesium.Math.toDegrees(lnglat.longitude);
        return [lng, lat];
    }
    pixelToCartesian(position: CesiumTypes.Cartesian2): CesiumTypes.Cartesian3 | undefined {
        const ray = this.viewer.camera.getPickRay(position);
        const cartesian = this.viewer.scene.globe.pick(ray!, this.viewer.scene);
        return cartesian;
    }
    checkDistance(cartesian1: CesiumTypes.Cartesian3, cartesian2: CesiumTypes.Cartesian3) {
        const distance = this.cesium.Cartesian3.distance(cartesian1, cartesian2);
        return distance > 10;
    }
    removeClickListener() {
        this.handler?.removeInputAction(this.cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
    removeMoveListener() {
        this.handler?.removeInputAction(this.cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
    removeDoubleClickListener() {
        this.handler?.removeInputAction(this.cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    }
    removeControlPoints() {
        if (this.controlPoints.length > 0) {
            this.controlPoints.forEach((entity: CesiumTypes.Entity) => {
                this.viewer.entities.remove(entity);
            });
            if (this.centerPointEntity) {
                this.viewer.entities.remove(this.centerPointEntity!)
                this.centerPointEntity = null
            }
            if (this.rotatePointEntity) {
                this.viewer.entities.remove(this.rotatePointEntity!)
                this.rotatePointEntity = null
                this.rotateHandler?.destroy()
                this.rotateHandler = null
            }
            if (this.rotateLineEntity) {
                this.viewer.entities.remove(this.rotateLineEntity!)
                this.rotateLineEntity = null
            }
            this.controlPointsEventHandler?.removeInputAction(this.cesium.ScreenSpaceEventType.LEFT_DOWN);
            this.controlPointsEventHandler?.removeInputAction(this.cesium.ScreenSpaceEventType.MOUSE_MOVE);
            this.controlPointsEventHandler?.removeInputAction(this.cesium.ScreenSpaceEventType.LEFT_UP);
            this.controlPointsEventHandler?.destroy();
            this.controlPointsEventHandler = null;
        }
    }
    remove() {
        if (this.category === 'polygon') {
            this.viewer.entities.remove(this.mainEntity!);
            this.viewer.entities.remove(this.outlineEntity!);
            this.mainEntity = null;
            this.outlineEntity = null;
            this.lineEntity = null;
        } else if (this.category === 'polyline') {
            this.viewer.entities.remove(this.lineEntity!);
        }
        this.removeClickListener();
        this.removeMoveListener();
        this.removeDoubleClickListener();
        this.removeControlPoints();
        this.handler?.destroy();
        this.handler = null;
    }
    drawPolygon() {
        const callback = () => {
            return new this.cesium.PolygonHierarchy(this.positions);
        };
        if (!this.mainEntity) {
            const style = this.style as PolygonStyle;
            this.mainEntity = this.viewer.entities.add({
                polygon: new this.cesium.PolygonGraphics({
                    hierarchy: new this.cesium.CallbackProperty(callback, false),
                    show: true,
                    material: style.material,
                }),
            });

            this.outlineEntity = this.viewer.entities.add({
                polyline: {
                    positions: new this.cesium.CallbackProperty(() => {
                        return [...this.positions, this.positions[0]];
                    }, false),
                    width: style.borderWidth,
                    material: style.outlineMaterial,
                    clampToGround: true,
                },
            });
        }
    }

    drawLine() {
        if (!this.lineEntity) {
            const style = this.style as PolylineStyle;
            this.lineEntity = this.addLineEntity(style);
        }
    }

    addTempLine() {
        if (!this.tempLineEntity) {
            const style = this.style as PolygonStyle;
            const lineStyle = {
                material: style.outlineMaterial,
                lineWidth: style.borderWidth,
            };
            this.tempLineEntity = this.addLineEntity(lineStyle);
        }
    }
    addLineEntity(style: PolylineStyle) {
        const entity = this.viewer.entities.add({
            polyline: {
                positions: new this.cesium.CallbackProperty(() => this.positions, false),
                width: style.width,
                material: style.material,
                clampToGround: true,
            },
        });
        return entity;
    }

    removeTempLine() {
        if (this.tempLineEntity) {
            this.viewer.entities.remove(this.tempLineEntity);
        }
    }
    on(eventType: EventType, listener: EventListener) {
        this.eventDispatcher.on(eventType, listener);
    }

    off(eventType: EventType, listener: EventListener) {
        this.eventDispatcher.off(eventType, listener);
    }

    isCurrentEntity(id: string) {
        return this.entityId === id;
    }
    //@ts-ignore
    addPoint(cartesian: CesiumTypes.Cartesian3) {
    }

    getPoints(): CesiumTypes.Cartesian3[] {
        return [new this.cesium.Cartesian3()];
    }
    getStyle(): GeometryStyle {
        return this.style!;
    }
    //@ts-ignore
    updateMovingPoint(cartesian: CesiumTypes.Cartesian3, index?: number) {
    }
    //@ts-ignore
    updateDraggingPoint(cartesian: CesiumTypes.Cartesian3, index: number) {
    }
    createGraphic(points: CesiumTypes.Cartesian3[]): CesiumTypes.Cartesian3[] {
        return points;
    }
    updatePoint() {
    }
}