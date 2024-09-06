import { LngLat } from "../../type";

export class PincerArrow {
    type: string;
    objId: string;
    positions: LngLat[];
    centerPosition: LngLat;
    rotatePosition: LngLat;
    constructor(parameters) {

    }

    getPositions() {
        return this.positions
    }
    getCenterPosition() {
        return this.centerPosition
    }
    getRotatePosition() {
        return this.rotatePosition
    }

} 