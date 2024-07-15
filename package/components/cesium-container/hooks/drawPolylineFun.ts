import { Ref } from "vue";
import * as Cesium from 'cesium'
import { transformCartesianToWGS84, transformWGS84ToCartesian, setId } from "../units/units";
export function useDrawPolyline(viewer: Ref<Cesium.Viewer | undefined>) {
    const handler = viewer.value?.screenSpaceEventHandler;
    let anchorpoints: (boolean | Cesium.Cartesian3 | null)[] = [];
    let polyline:any = null;
    handler?.setInputAction((click: Cesium.ScreenSpaceEventHandler.PositionedEvent) =>{
        let cartesian = getCatesian3FromPX(click.position);
        if (anchorpoints.length == 0) {
            anchorpoints.push(cartesian);
            polyline = viewer.value?.entities.add({
              name: "Polyline",
              id: setId(),
              polyline: {
                positions: new Cesium.CallbackProperty(() => {
                  return anchorpoints;
                }, false),
                width: 5,
                material: Cesium.Color.RED,
              },
            });
            polyline.GeoType = "Polyline";
        }
        anchorpoints.push(cartesian);
    },Cesium.ScreenSpaceEventType.LEFT_CLICK)
    handler?.setInputAction((movement: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
      let endPos = movement.endPosition;
      if (Cesium.defined(polyline)) {
        anchorpoints.pop();
        let cartesian = getCatesian3FromPX(endPos);
        anchorpoints.push(cartesian);
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler?.setInputAction((click: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      anchorpoints.pop();
      polyline.pottingPoint = anchorpoints;
      // resultList.push(polyline);
      // handler?.destroy();
    }, Cesium.ScreenSpaceEventType.RIGHT_DOWN);

    
    return Symbol()
}