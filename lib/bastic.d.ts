import { Category, EventType, GeometryStyle, PolylineStyle, State } from './type';
import { default as EventDispatcher } from './events';
import * as CesiumTypes from "cesium";
export default class Basic {
    cesium: typeof CesiumTypes;
    state: State;
    category: Category;
    viewer: CesiumTypes.Viewer;
    handler: CesiumTypes.ScreenSpaceEventHandler | null;
    dragEventHandler: CesiumTypes.ScreenSpaceEventHandler | null;
    mainEntity: CesiumTypes.Entity | null;
    lineEntity: CesiumTypes.Entity | null;
    outlineEntity: CesiumTypes.Entity | null;
    tempLineEntity: CesiumTypes.Entity | null;
    centerPointEntity: CesiumTypes.Entity | null;
    rotatePointEntity: CesiumTypes.Entity | null;
    rotateLineEntity: CesiumTypes.Entity | null;
    rotateHandler: CesiumTypes.ScreenSpaceEventHandler | null;
    positions: CesiumTypes.Cartesian3[];
    controlPoints: CesiumTypes.Entity[];
    points: CesiumTypes.Cartesian3[];
    controlPointsEventHandler: CesiumTypes.ScreenSpaceEventHandler | null;
    entityId: string;
    style: GeometryStyle | undefined;
    styleCache: GeometryStyle | undefined;
    minPointsForShape: number;
    eventDispatcher: EventDispatcher;
    freehand: boolean;
    get centerPosition(): CesiumTypes.Cartesian3;
    get rotatePosition(): CesiumTypes.Cartesian3;
    constructor(cesium: typeof CesiumTypes, viewer: CesiumTypes.Viewer, style?: GeometryStyle);
    setState(state: State): void;
    getState(): State;
    setGeometryPoints(geometryPoints: CesiumTypes.Cartesian3[]): void;
    mergeStyle(style: GeometryStyle | undefined): void;
    updateStyle(style: GeometryStyle): void;
    onClick(): void;
    onMouseMove(): void;
    onDoubleClick(): void;
    finishDrawing(): void;
    addControlPoints(): void;
    addCenterPoint(): void;
    addRotatePoint(): void;
    addRotateLine(): void;
    draggable(): void;
    disableDrag(): void;
    getCategory(): Category;
    cartesianToLnglat(cartesian: CesiumTypes.Cartesian3): [number, number];
    pixelToCartesian(position: CesiumTypes.Cartesian2): CesiumTypes.Cartesian3 | undefined;
    checkDistance(cartesian1: CesiumTypes.Cartesian3, cartesian2: CesiumTypes.Cartesian3): boolean;
    removeClickListener(): void;
    removeMoveListener(): void;
    removeDoubleClickListener(): void;
    removeControlPoints(): void;
    remove(): void;
    drawPolygon(): void;
    drawLine(): void;
    addTempLine(): void;
    addLineEntity(style: PolylineStyle): CesiumTypes.Entity;
    removeTempLine(): void;
    on(eventType: EventType, listener: EventListener): void;
    off(eventType: EventType, listener: EventListener): void;
    isCurrentEntity(id: string): boolean;
    addPoint(cartesian: CesiumTypes.Cartesian3): void;
    getPoints(): CesiumTypes.Cartesian3[];
    getStyle(): GeometryStyle;
    updateMovingPoint(cartesian: CesiumTypes.Cartesian3, index?: number): void;
    updateDraggingPoint(cartesian: CesiumTypes.Cartesian3, index: number): void;
    createGraphic(points: CesiumTypes.Cartesian3[]): CesiumTypes.Cartesian3[];
    updatePoint(): void;
}
