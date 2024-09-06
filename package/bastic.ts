import * as CesiumTypes from "cesium";
import { Category, Entity, EventType, GeometryStyle, PolygonStyle, PolylineStyle, State } from "./type";
import EventDispatcher from "./events";
import { deepClone, enableCamera } from "./utils";

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

    constructor(cesium: typeof CesiumTypes, viewer: CesiumTypes.Viewer, style?: GeometryStyle) {
        this.cesium = cesium
        this.viewer = viewer
        this.category = this.getCategory()
        this.cartesianToLnglat = this.cartesianToLnglat.bind(this);
        this.pixelToCartesian = this.pixelToCartesian.bind(this);
        this.eventDispatcher = new EventDispatcher();
        viewer.trackedEntity = undefined;
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
                    material: new this.cesium.Color(),
                    outlineMaterial: new this.cesium.Color(),
                    outlineWidth: 2,
                },
                style,
            );
        } else if (this.category === 'polyline') {
            this.style = Object.assign(
                {
                    material: new this.cesium.Color(),
                    lineWidth: 2,
                },
                style,
            );
        }
        //Cache the initial settings to avoid modification of properties due to reference type assignment.
        this.styleCache = deepClone(this.style)
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
                // If the click is outside the sphere, position information cannot be obtained.
                if (!cartesian) {
                    return;
                }

                // "For non-freehand drawn shapes, validate that the distance between two consecutive clicks is greater than 10 meters
                if (!this.freehand && points.length > 0 && !this.checkDistance(cartesian, points[points.length - 1])) {
                    return;
                }
                this.addPoint(cartesian);

                // Trigger 'drawStart' when the first point is being drawn.
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
                if (this.cesium.defined(this.mainEntity)) {
                    this.setState('edit')
                    this.addControlPoints();
                    this.draggable()
                    this.eventDispatcher.dispatchEvent('editStart');
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
                // Synchronize data to subclasses.If the distance is less than 10 meters, do not proceed
                this.updateMovingPoint(cartesian, points.length);
            }
        }, this.cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    onDoubleClick() {
        this.handler?.setInputAction((evt: any) => {
            if (this.state === 'drawing') {
                this.finishDrawing();
            }
        }, this.cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    }
    finishDrawing() {
        // Some polygons draw a separate line between the first two points before drawing the complete shape;
        // this line should be removed after drawing is complete.
        this.category === 'polygon' && this.lineEntity && this.viewer.entities.remove(this.lineEntity);

        this.removeMoveListener();
        // Editable upon initial drawing completion.
        this.setState('edit');
        this.addControlPoints();
        this.draggable();
        const entity = this.mainEntity!
        this.entityId = entity.id;

        this.eventDispatcher.dispatchEvent('drawEnd', this.getPoints());
    }
    addControlPoints() {
        const points = this.getPoints();
        this.controlPoints = points.map((position) => {
            return this.viewer.entities.add({
                position,
                point: {
                    pixelSize: 10,
                    heightReference: this.cesium.HeightReference.CLAMP_TO_GROUND,
                    color: this.cesium.Color.RED,
                },
            });
        });

        let isDragging = false;
        let draggedIcon: Entity = null as unknown as Entity;
        let dragStartPosition: CesiumTypes.Cartesian3;

        this.controlPointsEventHandler = new this.cesium.ScreenSpaceEventHandler(this.viewer.canvas);

        // Listen for left mouse button press events
        this.controlPointsEventHandler.setInputAction((clickEvent: any) => {
            const pickedObject = this.viewer.scene.pick(clickEvent.position);

            if (this.cesium.defined(pickedObject)) {
                for (let i = 0; i < this.controlPoints.length; i++) {
                    if (pickedObject.id === this.controlPoints[i]) {
                        isDragging = true;
                        draggedIcon = this.controlPoints[i];
                        dragStartPosition = draggedIcon.position?.getValue(this.cesium.JulianDate.now())!;
                        //Save the index of dragged points for dynamic updates during movement
                        draggedIcon.index = i;
                        break;
                    }
                }
                // Disable default camera interaction.
                enableCamera(this.viewer, false)
            }
        }, this.cesium.ScreenSpaceEventType.LEFT_DOWN);

        // Listen for mouse movement events
        this.controlPointsEventHandler.setInputAction((moveEvent: any) => {
            if (isDragging && draggedIcon) {
                const cartesian = this.viewer.camera.pickEllipsoid(moveEvent.endPosition, this.viewer.scene.globe.ellipsoid);
                if (cartesian) {
                    draggedIcon.position.setValue(cartesian);
                    this.updateDraggingPoint(cartesian, draggedIcon.index);
                }
            }
        }, this.cesium.ScreenSpaceEventType.MOUSE_MOVE);

        // Listen for left mouse button release events
        this.controlPointsEventHandler.setInputAction(() => {
            // Trigger 'drawUpdate' when there is a change in coordinates before and after dragging.
            if (draggedIcon && !this.cesium.Cartesian3.equals(dragStartPosition, draggedIcon.position._value)) {
                this.eventDispatcher.dispatchEvent('drawUpdate', draggedIcon.position._value);
            }
            isDragging = false;
            draggedIcon = null;
            enableCamera(this.viewer, true)
        }, this.cesium.ScreenSpaceEventType.LEFT_UP);
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
                        //Clicking on the current instance's entity initiates drag logic.
                        dragging = true;
                        startPosition = cartesian;
                        this.viewer.scene.screenSpaceCameraController.enableRotate = false;
                    }
                }
            }
        }, this.cesium.ScreenSpaceEventType.LEFT_DOWN);

        this.dragEventHandler.setInputAction((event: any) => {
            if (dragging && startPosition) {
                // Retrieve the world coordinates of the current mouse position.
                const newPosition = this.pixelToCartesian(event.endPosition);
                if (newPosition) {
                    // Calculate the displacement vector.
                    const translation = this.cesium.Cartesian3.subtract(newPosition, startPosition, new this.cesium.Cartesian3());
                    const newPoints = this.positions.map((p) => {
                        return this.cesium.Cartesian3.add(p, translation, new this.cesium.Cartesian3());
                    });

                    //Move all key points according to a vector.
                    this.points = this.points.map((p) => {
                        return this.cesium.Cartesian3.add(p, translation, new this.cesium.Cartesian3());
                    });

                    // Move control points in the same manner.
                    this.controlPoints.map((p: CesiumTypes.Entity) => {
                        const position = p.position?.getValue(this.cesium.JulianDate.now());
                        const newPosition = this.cesium.Cartesian3.add(position!, translation, new this.cesium.Cartesian3());
                        p.position = new this.cesium.ConstantPositionProperty(newPosition);
                    });

                    this.setGeometryPoints(newPoints);
                    startPosition = newPosition;
                }
            } else {
                const pickRay = this.viewer.scene.camera.getPickRay(event.endPosition);
                if (pickRay) {
                    const pickedObject = this.viewer.scene.pick(event.endPosition);
                    if (this.cesium.defined(pickedObject) && pickedObject.id instanceof this.cesium.Entity) {
                        const clickedEntity = pickedObject.id;
                        // TODO 绘制的图形，需要特殊id标识，可在创建entity时指定id
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

        // Listen for the mouse release event to end dragging.
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
            this.controlPointsEventHandler?.removeInputAction(this.cesium.ScreenSpaceEventType.LEFT_DOWN);
            this.controlPointsEventHandler?.removeInputAction(this.cesium.ScreenSpaceEventType.MOUSE_MOVE);
            this.controlPointsEventHandler?.removeInputAction(this.cesium.ScreenSpaceEventType.LEFT_UP);
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

            // Due to limitations in PolygonGraphics outlining, a separate line style is drawn.
            this.outlineEntity = this.viewer.entities.add({
                polyline: {
                    positions: new this.cesium.CallbackProperty(() => {
                        return [...this.positions, this.positions[0]];
                    }, false),
                    width: style.borderWidth,
                    material: style.material,
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
            // The line style between the first two points matches the outline style.
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
        // return this.entityId === `CesiumPlot-${id}`;
        return this.entityId === id;
    }

    addPoint(cartesian: CesiumTypes.Cartesian3) {
        //Abstract method that must be implemented by subclasses.
    }

    getPoints(): CesiumTypes.Cartesian3[] {
        //Abstract method that must be implemented by subclasses.
        return [new this.cesium.Cartesian3()];
    }

    updateMovingPoint(cartesian: CesiumTypes.Cartesian3, index?: number) {
        //Abstract method that must be implemented by subclasses.
    }

    updateDraggingPoint(cartesian: CesiumTypes.Cartesian3, index: number) {
        //Abstract method that must be implemented by subclasses.
    }
    createGraphic(points: CesiumTypes.Cartesian3[]): CesiumTypes.Cartesian3[] {
        //Abstract method that must be implemented by subclasses.
        return points;
    }
}